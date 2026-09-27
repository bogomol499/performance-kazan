/* =========================================================
   Performance — общий код для всех страниц:
   хранилище, язык, тема, корзина, заказы, брони, панели.
   ========================================================= */
window.PF = (() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // localStorage может быть недоступен (приватный режим) — оборачиваем
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ничего */ }
      emit('data', key);
    }
  };

  /* ---------- События между частями сайта ---------- */
  const handlers = {};
  function on(name, fn) { (handlers[name] = handlers[name] || []).push(fn); }
  function emit(name, arg) { (handlers[name] || []).forEach(fn => { try { fn(arg); } catch (e) { console.error(e); } }); }
  // изменения из другой вкладки (например, заказ на сайте, а открыта админка)
  window.addEventListener('storage', e => { if (e.key && e.key.startsWith('pf-')) emit('data', e.key); });

  /* ================= ЯЗЫК ================= */

  const I18N = window.PF_I18N || { tt: {}, js: {} };
  let lang = store.get('pf-lang', null) === 'tt' ? 'tt' : 'ru';
  document.documentElement.lang = lang;

  function tr(obj) {
    if (obj == null) return '';
    if (typeof obj === 'string' || typeof obj === 'number') return String(obj);
    return obj[lang] != null ? obj[lang] : obj.ru;
  }
  function t(key, vars) {
    const entry = I18N.js[key];
    let s = entry ? (entry[lang] != null ? entry[lang] : entry.ru) : key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function applyI18n(root = document) {
    $$('[data-i18n]', root).forEach(el => {
      if (el.dataset.ru == null) el.dataset.ru = el.innerHTML;
      const tt = I18N.tt[el.dataset.i18n];
      el.innerHTML = lang === 'tt' && tt != null ? tt : el.dataset.ru;
    });
    $$('[data-i18n-attr]', root).forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split('=').map(x => x.trim());
        const store_ = 'ru' + attr.replace(/[^a-z]/gi, '');
        if (el.dataset[store_] == null) el.dataset[store_] = el.getAttribute(attr) || '';
        const tt = I18N.tt[key];
        el.setAttribute(attr, lang === 'tt' && tt != null ? tt : el.dataset[store_]);
      });
    });
    if (I18N.titles && I18N.titles[document.body.dataset.page]) {
      document.title = tr(I18N.titles[document.body.dataset.page]);
    }
  }
  function setLang(next) {
    if (next === lang) return;
    lang = next;
    store.set('pf-lang', lang);
    document.documentElement.lang = lang;
    applyI18n();
    updateLangSwitch();
    emit('lang', lang);
  }
  function updateLangSwitch() {
    $$('.lang-switch').forEach(sw => {
      sw.dataset.lang = lang;
      $$('button', sw).forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    });
  }

  const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';

  /* ================= ТЕМА ================= */

  let theme = store.get('pf-theme', null) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  const metaTheme = () => { const m = $('meta[name="theme-color"]'); if (m) m.content = theme === 'dark' ? '#0A1A1A' : '#0F3D3E'; };
  metaTheme();

  // Новая тема «заливается» кругом из точки нажатия
  function setTheme(next, x, y) {
    if (next === theme) return;
    const apply = () => {
      theme = next;
      document.documentElement.dataset.theme = theme;
      store.set('pf-theme', theme);
      metaTheme();
      emit('theme', theme);
    };
    if (!document.startViewTransition || reduceMotion) { apply(); return; }
    const cx = x != null ? x : innerWidth - 60, cy = y != null ? y : 36;
    const r = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    document.documentElement.classList.add('vt-theme');
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${r}px at ${cx}px ${cy}px)`] },
        { duration: 750, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
    vt.finished.finally(() => document.documentElement.classList.remove('vt-theme'));
  }

  /* ================= МЕНЮ С ПРАВКАМИ ИЗ АДМИНКИ ================= */

  const D = window.PF_DATA;
  function overrides() { return store.get('pf-menu-overrides', {}); }
  function getMenu() {
    const o = overrides();
    return D.MENU.map(d => {
      const x = o[d.id] || {};
      return Object.assign({}, d, {
        price: typeof x.price === 'number' && x.price > 0 ? x.price : d.price,
        stop: !!x.stop,
        tag: x.tag !== undefined ? x.tag : d.tag
      });
    });
  }
  function setOverride(id, patch) {
    const o = overrides();
    o[id] = Object.assign({}, o[id], patch);
    store.set('pf-menu-overrides', o);
  }
  function findDish(id) { return getMenu().find(d => d.id === id); }
  function catBg(cat) { const c = D.CATS.find(x => x.id === cat); return c ? c.bg : '#E1E9E4'; }

  /* ================= КОРЗИНА ================= */

  // cart: { id: количество }, custom: { id: {name, price, art, cat} } — наборы из конструктора
  const cart = {
    items() {
      const raw = store.get('pf-cart', {});
      const custom = store.get('pf-cart-custom', {});
      const out = [];
      Object.keys(raw).forEach(id => {
        const qty = Math.max(0, Math.floor(+raw[id] || 0));
        if (!qty) return;
        if (custom[id]) {
          out.push({ id, qty, custom: true, name: custom[id].name, price: custom[id].price, art: custom[id].art, bg: '#F1DDB0', note: custom[id].note });
        } else {
          const d = findDish(id);
          if (d && !d.stop) out.push({ id, qty, name: d.name, price: d.price, art: d.art, bg: catBg(d.cat) });
        }
      });
      return out;
    },
    add(id, qty = 1, customData) {
      const raw = store.get('pf-cart', {});
      if (customData) {
        const custom = store.get('pf-cart-custom', {});
        custom[id] = customData;
        store.set('pf-cart-custom', custom);
      }
      raw[id] = (raw[id] || 0) + qty;
      store.set('pf-cart', raw);
    },
    change(id, delta) {
      const raw = store.get('pf-cart', {});
      raw[id] = (raw[id] || 0) + delta;
      if (raw[id] <= 0) {
        delete raw[id];
        const custom = store.get('pf-cart-custom', {});
        if (custom[id]) { delete custom[id]; store.set('pf-cart-custom', custom); }
      }
      store.set('pf-cart', raw);
    },
    clear() { store.set('pf-cart', {}); store.set('pf-cart-custom', {}); },
    total() { return cart.items().reduce((s, i) => s + i.price * i.qty, 0); },
    count() { return cart.items().reduce((s, i) => s + i.qty, 0); }
  };

  /* ================= ЗАКАЗЫ И БРОНИ ================= */

  const orders = {
    list() { return store.get('pf-orders', []); },
    add(o) {
      const list = orders.list();
      const num = (list.reduce((m, x) => Math.max(m, x.num || 100), 100)) + 1;
      const order = Object.assign({ id: 'o' + Date.now() + Math.floor(Math.random() * 1000), num, status: 'new', created: Date.now() }, o);
      list.push(order);
      store.set('pf-orders', list);
      return order;
    },
    update(id, patch) {
      store.set('pf-orders', orders.list().map(o => o.id === id ? Object.assign({}, o, patch) : o));
    },
    remove(id) { store.set('pf-orders', orders.list().filter(o => o.id !== id)); }
  };

  const bookings = {
    list() { return store.get('pf-bookings', []).map(b => Object.assign({ status: 'new' }, b)); },
    add(b) {
      const list = bookings.list();
      const item = Object.assign({ id: 'b' + Date.now() + Math.floor(Math.random() * 1000), status: 'new', created: Date.now() }, b);
      list.push(item);
      store.set('pf-bookings', list);
      return item;
    },
    update(id, patch) {
      store.set('pf-bookings', bookings.list().map(b => String(b.id) === String(id) ? Object.assign({}, b, patch) : b));
    },
    remove(id) { store.set('pf-bookings', bookings.list().filter(b => String(b.id) !== String(id))); }
  };

  /* ================= ДАТЫ ================= */

  const pad2 = n => String(n).padStart(2, '0');
  const isoDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  function fmtDate(iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return String(iso);
    const dt = new Date(y, m - 1, d);
    if (lang === 'tt') {
      // татарские названия дней и месяцев пишем сами — не все браузеры их знают
      const W = ['якшәмбе', 'дүшәмбе', 'сишәмбе', 'чәршәмбе', 'пәнҗешәмбе', 'җомга', 'шимбә'];
      const M = ['гыйнвар', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
      const mon = opts.month === 'short' ? M[dt.getMonth()].slice(0, 3) : M[dt.getMonth()];
      const wd = opts.weekday ? (opts.weekday === 'short' ? W[dt.getDay()].slice(0, 3) : W[dt.getDay()]) : '';
      return `${dt.getDate()} ${mon}${wd ? ', ' + wd : ''}`;
    }
    return dt.toLocaleDateString('ru-RU', opts);
  }
  function guestsWord(n) {
    if (lang === 'tt') return 'кунак';
    return n % 10 === 1 && n % 100 !== 11 ? 'гость' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'гостя' : 'гостей');
  }

  /* ================= УВЕДОМЛЕНИЕ ================= */

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ================= ПАНЕЛИ (меню, корзина, шторки) ================= */

  let openLayer = null, lastFocus = null;
  function openPanel(el) {
    if (!el || openLayer === el) return;
    if (openLayer) closePanel(true);
    lastFocus = document.activeElement;
    openLayer = el;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    const bd = $('.backdrop');
    if (bd) bd.classList.add('show');
    document.body.classList.add('locked');
    const tb = $('.topbar');
    if (tb) tb.classList.remove('is-hidden');
    emit('panel', el.id);
    setTimeout(() => {
      const f = el.querySelector('[data-autofocus], .close-btn, button, a, input');
      if (f) f.focus({ preventScroll: true });
    }, 80);
  }
  function closePanel(silent) {
    if (!openLayer) return;
    const el = openLayer;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    openLayer = null;
    if (silent !== true) {
      const bd = $('.backdrop');
      if (bd) bd.classList.remove('show');
      document.body.classList.remove('locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    emit('panel-close', el.id);
  }
  const isOpen = () => !!openLayer;

  function goTo(hash) {
    const target = $(hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 150);
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); openPanel(document.getElementById(opener.dataset.open)); return; }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      const href = closer.getAttribute('href');
      closePanel();
      if (href && href.startsWith('#')) { e.preventDefault(); goTo(href); }
      return;
    }
    const navLink = e.target.closest('.drawer--nav a[href]');
    if (navLink) {
      const href = navLink.getAttribute('href');
      closePanel();
      if (href.startsWith('#')) { e.preventDefault(); goTo(href); }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
    if (e.key === 'Tab' && openLayer) {
      const f = $$('button:not([disabled]), a[href], input:not([type="hidden"]), select, textarea', openLayer).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Шторку можно смахнуть вниз пальцем
  function enableSwipe(sheet) {
    let y0 = null, dy = 0;
    sheet.addEventListener('touchstart', e => { if (sheet.scrollTop <= 0) { y0 = e.touches[0].clientY; dy = 0; } }, { passive: true });
    sheet.addEventListener('touchmove', e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (dy > 0 && innerWidth < 760) { sheet.style.transition = 'none'; sheet.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });
    sheet.addEventListener('touchend', () => {
      if (y0 === null) return;
      sheet.style.transition = ''; sheet.style.transform = '';
      if (dy > 110) closePanel();
      y0 = null;
    });
  }

  /* ================= ШАПКА: ТЕМА И ЯЗЫК ================= */

  document.addEventListener('click', e => {
    const tb = e.target.closest('[data-theme-toggle]');
    if (tb) setTheme(theme === 'dark' ? 'light' : 'dark', e.clientX || null, e.clientY || null);
    const lb = e.target.closest('.lang-switch button');
    if (lb) setLang(lb.dataset.lang);
  });

  /* ================= ПРИЛОЖЕНИЕ (PWA) ================= */

  let installEvent = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; });
  window.addEventListener('appinstalled', () => { toast(t('installed')); $$('[data-install]').forEach(b => { b.hidden = true; }); });
  document.addEventListener('click', async e => {
    if (!e.target.closest('[data-install]')) return;
    if (installEvent) {
      closePanel();
      installEvent.prompt();
      try { await installEvent.userChoice; } catch (err) { /* ничего */ }
      installEvent = null;
    } else {
      openPanel(document.getElementById('install'));
    }
  });
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ================= СТАРТ ================= */

  function init() {
    applyI18n();
    updateLangSwitch();
    $$('.sheet').forEach(enableSwipe);
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      $$('[data-install]').forEach(b => { b.hidden = true; });
    }
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }
  // скрипты подключены в конце страницы — разметка уже готова
  init();

  return {
    $, $$, clamp, esc, reduceMotion, store, on, emit,
    get lang() { return lang; }, setLang, t, tr, applyI18n, money,
    get theme() { return theme; }, setTheme,
    getMenu, setOverride, findDish, catBg, cart, orders, bookings,
    pad2, isoDate, fmtDate, guestsWord,
    toast, openPanel, closePanel, isOpen, goTo
  };
})();
