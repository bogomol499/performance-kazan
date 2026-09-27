/* =========================================================
   Performance — главная страница
   Загрузка, 3D-тарелка, меню с поиском, корзина, конструктор,
   «Что взять?», программа, сертификат, бронь со схемой зала.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$, clamp, esc, reduceMotion, t, tr, money } = PF;
  const D = window.PF_DATA;
  const A = window.PF_ART;

  /* ================= ЗАГРУЗКА ================= */

  const hero = $('#hero');
  const loader = $('.loader');

  // Разбиваем заголовок и слово в подвале на буквы
  $$('.hero__title .line, .footer__word').forEach((line, li) => {
    const text = line.textContent.trim();
    line.textContent = '';
    const idx = line.classList.contains('footer__word') ? 0 : li;
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      s.style.transitionDelay = (0.05 + idx * 0.18 + i * 0.045) + 's';
      line.appendChild(s);
    });
  });

  const startHero = () => hero.classList.add('play');
  let seen = false;
  try { seen = sessionStorage.getItem('pf-loaded') === '1'; } catch (e) { /* ничего */ }

  if (reduceMotion || seen) {
    loader.classList.add('gone');
    requestAnimationFrame(startHero);
  } else {
    const num = $('#loader-num');
    const coffee = $('.loader__coffee');
    const t0 = performance.now();
    let fontsDone = false;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => { fontsDone = true; });
    setTimeout(() => { fontsDone = true; }, 1800);
    let shown = 0;
    (function tick(now) {
      const time = now - t0;
      // до 85% идём по времени, дальше ждём шрифты
      const target = Math.min(fontsDone ? 100 : 85, time / 14);
      shown += (target - shown) * 0.12 + 0.3;
      shown = Math.min(shown, target);
      num.textContent = Math.round(shown);
      coffee.style.transform = `translate(${(-(time / 8) % 60).toFixed(1)}px, ${(90 - shown * 0.9).toFixed(1)}px)`;
      if (shown < 99.5) { requestAnimationFrame(tick); return; }
      num.textContent = '100';
      setTimeout(() => {
        loader.classList.add('done');
        setTimeout(startHero, 350);
        setTimeout(() => loader.classList.add('gone'), 1300);
        try { sessionStorage.setItem('pf-loaded', '1'); } catch (e) { /* ничего */ }
      }, 250);
    })(t0);
  }

  /* ================= 3D-ТАРЕЛКА ================= */

  const plate = $('#plate3d');
  plate.innerHTML = A.plate3d();
  if (!reduceMotion) {
    let rx = 58, ry = 0, trx = 58, try_ = 0, spin = 0;
    const setTarget = (x, y) => { trx = 58 - y * 26; try_ = x * 40; };
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      setTarget((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    });
    hero.addEventListener('pointerleave', () => setTarget(0, 0));
    window.addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      setTarget(clamp(e.gamma / 45, -0.5, 0.5), clamp((e.beta - 45) / 60, -0.5, 0.5));
    });
    (function loop() {
      if (hero.getBoundingClientRect().bottom > 0) {
        rx += (trx - rx) * 0.06; ry += (try_ - ry) * 0.06; spin += 0.25;
        plate.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${spin.toFixed(1)}deg)`;
      }
      requestAnimationFrame(loop);
    })();
  }

  // Прожектор следует за курсором или пальцем
  if (!reduceMotion) {
    let raf = 0, tx = 72, ty = 38, cx = 72, cy = 38;
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      hero.style.setProperty('--x', cx.toFixed(2) + '%');
      hero.style.setProperty('--y', cy.toFixed(2) + '%');
      raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 100;
      ty = (e.clientY - r.top) / r.height * 100;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  // Открыто или закрыто прямо сейчас (по времени Казани)
  function openStatus() {
    const el = $('#open-status');
    try {
      const parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      const h = +parts.find(p => p.type === 'hour').value;
      const isOpen = h >= 8 && h < 23;
      el.textContent = t(isOpen ? 'open' : 'closed');
      el.parentElement.classList.toggle('closed', !isOpen);
    } catch (e) { /* оставляем текст по умолчанию */ }
  }
  openStatus();

  /* ================= ШАПКА И ПРОКРУТКА ================= */

  const topbar = $('.topbar');
  const progressBar = $('.progress span');
  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    topbar.classList.toggle('is-solid', y > 40);
    if (!PF.isOpen()) topbar.classList.toggle('is-hidden', y > lastY && y > 300);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    updateWords();
    updateProgram();
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); }
  }, { passive: true });

  // Текст «О нас» подсвечивается по словам
  const wordsEl = $('[data-words]');
  let words = [];
  function splitWords() {
    const txt = wordsEl.textContent.trim().split(/\s+/);
    wordsEl.innerHTML = txt.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
    words = $$('.w', wordsEl);
    if (reduceMotion) document.body.classList.add('no-words');
    updateWords();
  }
  function updateWords() {
    if (!words.length || reduceMotion) return;
    const r = wordsEl.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }
  splitWords();

  /* ================= МЕНЮ, ПОИСК И ФИЛЬТРЫ ================= */

  const tabsEl = $('.tabs');
  const pill = $('.tabs__pill');
  const dishesEl = $('#dishes');
  const searchEl = $('#menu-search');
  const foundEl = $('#menu-found');
  const emptyEl = $('#menu-empty');
  let currentCat = D.CATS[0].id;
  const filters = new Set();
  let query = '';

  const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').trim();
  const searching = () => query.length > 0 || filters.size > 0;

  function renderTabs() {
    $$('.tab', tabsEl).forEach(x => x.remove());
    D.CATS.forEach(c => {
      const b = document.createElement('button');
      b.className = 'tab';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.cat = c.id;
      b.textContent = tr(c.name);
      b.setAttribute('aria-selected', String(c.id === currentCat && !searching()));
      tabsEl.appendChild(b);
    });
    movePill();
  }
  function movePill() {
    const active = $('.tab[aria-selected="true"]', tabsEl);
    tabsEl.classList.toggle('tabs--off', !active);
    if (!active) return;
    pill.style.width = active.offsetWidth + 'px';
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function matches(d) {
    if (filters.has('veg') && !d.veg) return false;
    if (filters.has('spicy') && !d.spicy) return false;
    if (filters.has('hit') && d.tag !== 'hit') return false;
    if (filters.has('cheap') && d.price > 300) return false;
    if (query) {
      const hay = norm([d.name.ru, d.name.tt, d.desc.ru, d.desc.tt].join(' '));
      if (!norm(query).split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }

  function dishCard(d, i) {
    const tag = d.stop ? `<span class="dish__tag dish__tag--stop">${t('stop')}</span>`
      : d.tag ? `<span class="dish__tag ${d.tag === 'new' ? 'dish__tag--new' : ''}">${t(d.tag)}</span>` : '';
    const icons = (d.veg ? `<span title="${t('noMeat')}">🌿</span>` : '') + (d.spicy ? `<span title="${t('spicy')}">🌶️</span>` : '');
    return `
      <button class="dish ${d.stop ? 'dish--stop' : ''}" type="button" data-id="${d.id}" style="--i:${i}">
        <div class="dish__art" style="--bg:${PF.catBg(d.cat)}">
          ${A.art(d.art)}
          ${tag}
          ${icons ? `<span class="dish__icons">${icons}</span>` : ''}
        </div>
        <div class="dish__body">
          <span class="dish__name">${esc(tr(d.name))}</span>
          <span class="dish__desc">${esc(tr(d.desc))}</span>
          <span class="dish__foot">
            <span class="dish__price">${money(d.price)}<small>${esc(tr(d.weight))}</small></span>
            ${d.stop ? '' : `<span class="add-btn" data-add="${d.id}" role="presentation">+</span>`}
          </span>
        </div>
      </button>`;
  }

  function renderDishes(animate) {
    const menu = PF.getMenu();
    const list = searching() ? menu.filter(matches) : menu.filter(d => d.cat === currentCat);
    const paint = () => {
      dishesEl.innerHTML = list.map(dishCard).join('');
      emptyEl.hidden = list.length > 0;
      foundEl.textContent = searching() ? t('found', { n: list.length }) : '';
    };
    if (animate && !reduceMotion && dishesEl.children.length) {
      dishesEl.classList.add('leaving');
      setTimeout(() => { dishesEl.classList.remove('leaving'); paint(); }, 230);
    } else paint();
  }

  tabsEl.addEventListener('click', e => {
    const tb = e.target.closest('.tab');
    if (!tb) return;
    const wasSearching = searching();
    if (tb.dataset.cat === currentCat && !wasSearching) return;
    currentCat = tb.dataset.cat;
    if (wasSearching) { query = ''; searchEl.value = ''; filters.clear(); syncFilters(); }
    $$('.tab', tabsEl).forEach(b => b.setAttribute('aria-selected', String(b === tb)));
    tb.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    movePill();
    renderDishes(true);
  });

  function syncFilters() {
    $$('.filter').forEach(b => b.setAttribute('aria-pressed', String(filters.has(b.dataset.filter))));
    $('#search-clear').hidden = !query;
    $$('.tab', tabsEl).forEach(b => b.setAttribute('aria-selected', String(!searching() && b.dataset.cat === currentCat)));
    movePill();
  }

  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      query = searchEl.value.trim().slice(0, 40);
      syncFilters();
      renderDishes(true);
    }, 180);
  });
  $('#search-clear').addEventListener('click', () => { searchEl.value = ''; query = ''; syncFilters(); renderDishes(true); searchEl.focus(); });
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    if (filters.has(f)) filters.delete(f); else filters.add(f);
    syncFilters();
    renderDishes(true);
  }));
  $('#reset-filters').addEventListener('click', () => { searchEl.value = ''; query = ''; filters.clear(); syncFilters(); renderDishes(true); });

  dishesEl.addEventListener('click', e => {
    const card = e.target.closest('.dish');
    if (!card) return;
    const id = card.dataset.id;
    const add = e.target.closest('[data-add]');
    if (add) addToCart(id, 1, add); else openDish(id);
  });

  window.addEventListener('resize', movePill);
  if (document.fonts) document.fonts.ready.then(movePill);

  /* ================= КАРТОЧКА БЛЮДА ================= */

  let dishId = null, dishQty = 1;
  function openDish(id) {
    const d = PF.findDish(id);
    if (!d) return;
    dishId = id; dishQty = 1;
    const cat = D.CATS.find(c => c.id === d.cat);
    $('#dish-art').style.setProperty('--bg', cat.bg);
    $('#dish-art').innerHTML = A.art(d.art);
    const meta = [tr(cat.name), tr(d.weight)];
    if (d.veg) meta.push(t('noMeat').toLowerCase());
    if (d.spicy) meta.push(t('spicy').toLowerCase());
    $('#dish-meta').textContent = meta.join(', ');
    $('#dish-name').textContent = tr(d.name);
    $('#dish-desc').textContent = tr(d.desc);
    updateDishBtn();
    PF.openPanel($('#dish'));
  }
  function updateDishBtn() {
    const d = PF.findDish(dishId);
    if (!d) return;
    $('#dish-qty').textContent = dishQty;
    const btn = $('#dish-add');
    btn.disabled = d.stop;
    btn.textContent = d.stop ? t('stop') : t('addFor', { price: money(d.price * dishQty) });
  }
  $('#dish').addEventListener('click', e => {
    const b = e.target.closest('[data-qty]');
    if (!b) return;
    dishQty = clamp(dishQty + +b.dataset.qty, 1, 20);
    updateDishBtn();
  });
  $('#dish-add').addEventListener('click', e => {
    if (!dishId) return;
    addToCart(dishId, dishQty, e.currentTarget);
    PF.closePanel();
  });

  /* ================= КОРЗИНА ================= */

  const cartBtn = $('.cart-btn');
  const cartCount = $('.cart-count');

  function renderCart() {
    const items = PF.cart.items();
    const count = items.reduce((s, i) => s + i.qty, 0);
    cartCount.hidden = count === 0;
    cartCount.textContent = count;
    $('#cart-empty').hidden = items.length > 0;
    $('#cart-foot').hidden = items.length === 0;
    $('#cart-total').textContent = money(PF.cart.total());
    $('#cart-list').innerHTML = items.map(i => `
      <li class="cart-item" data-id="${esc(i.id)}">
        <div class="cart-item__art" style="--bg:${i.bg}">${A.art(i.art)}</div>
        <div><div class="cart-item__name">${esc(tr(i.name))}</div>${i.note ? `<div class="cart-item__note">${esc(tr(i.note))}</div>` : ''}<div class="cart-item__price">${money(i.price * i.qty)}</div></div>
        <div class="stepper" role="group">
          <button type="button" data-cq="-1" aria-label="${t('cancel')}">−</button><output>${i.qty}</output><button type="button" data-cq="1" aria-label="+">+</button>
        </div>
      </li>`).join('');
  }

  function addToCart(id, qty, fromEl, customData) {
    const d = customData ? null : PF.findDish(id);
    if (d && d.stop) { PF.toast(t('stopToast')); return; }
    PF.cart.add(id, qty, customData);
    flyToCart(fromEl, () => {
      renderCart();
      cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    });
    PF.toast(customData ? t('bAdded') : t('inCart', { name: tr(d.name) }));
  }

  function flyToCart(fromEl, done) {
    topbar.classList.remove('is-hidden');
    if (reduceMotion || !fromEl || !fromEl.animate) { done(); return; }
    const a = fromEl.getBoundingClientRect();
    const b = cartBtn.getBoundingClientRect();
    const dot = document.createElement('div');
    dot.className = 'fly';
    document.body.appendChild(dot);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
    const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 120;
    dot.style.left = '0'; dot.style.top = '0';
    const anim = dot.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)` },
      { transform: `translate(${mx}px, ${my}px) scale(1.3)`, offset: 0.5 },
      { transform: `translate(${x1}px, ${y1}px) scale(.4)` }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.5,1)' });
    anim.onfinish = () => { dot.remove(); done(); };
    anim.oncancel = () => { dot.remove(); done(); };
  }

  $('#cart-list').addEventListener('click', e => {
    const b = e.target.closest('[data-cq]');
    if (!b) return;
    PF.cart.change(b.closest('.cart-item').dataset.id, +b.dataset.cq);
    renderCart();
  });

  // Телефон: маска +7 (999) 123-45-67
  function phoneMask(input) {
    input.addEventListener('input', () => {
      let d = input.value.replace(/\D/g, '');
      if (!d) { input.value = ''; return; }
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      const p = d.slice(1);
      let out = '+7';
      if (p.length) out += ' (' + p.slice(0, 3);
      if (p.length >= 3) out += ')';
      if (p.length > 3) out += ' ' + p.slice(3, 6);
      if (p.length > 6) out += '-' + p.slice(6, 8);
      if (p.length > 8) out += '-' + p.slice(8, 10);
      input.value = out;
    });
  }
  const phoneOk = v => v.replace(/\D/g, '').length === 11;

  const cName = $('#c-name'), cPhone = $('#c-phone'), cErr = $('#cart-err');
  phoneMask(cPhone);
  const who = PF.store.get('pf-who', {});
  if (who.name) cName.value = who.name;
  if (who.phone) cPhone.value = who.phone;
  [cName, cPhone].forEach(i => i.addEventListener('input', () => { cErr.textContent = ''; i.classList.remove('bad'); }));

  $('#checkout').addEventListener('click', () => {
    const before = PF.store.get('pf-cart', {});
    const items = PF.cart.items();
    if (Object.keys(before).filter(k => before[k] > 0).length !== items.length) {
      // что-то закончилось, пока корзина лежала
      const keep = {}; items.forEach(i => { keep[i.id] = i.qty; });
      PF.store.set('pf-cart', keep);
      renderCart();
      PF.toast(t('cartChanged'));
      return;
    }
    if (!items.length) return;
    const name = cName.value.trim();
    if (name.length < 2) { cErr.textContent = t('needName'); cName.classList.add('bad'); cName.focus(); return; }
    if (!phoneOk(cPhone.value)) { cErr.textContent = t('needPhone'); cPhone.classList.add('bad'); cPhone.focus(); return; }
    PF.store.set('pf-who', { name, phone: cPhone.value });
    const mins = +$('#pickup').value || 20;
    const time = new Date(Date.now() + mins * 60000);
    const hhmm = `${PF.pad2(time.getHours())}:${PF.pad2(time.getMinutes())}`;
    const total = PF.cart.total();
    const order = PF.orders.add({
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total, name, phone: cPhone.value, pickup: hhmm
    });
    PF.cart.clear();
    renderCart();
    showDone(t('orderDone'), t('orderText', { num: order.num, total: money(total), name, time: hhmm }));
  });

  function showDone(title, text) {
    $('#done-title').textContent = title;
    $('#done-text').textContent = text;
    PF.openPanel($('#done'));
  }

  renderCart();

  /* ================= КОНСТРУКТОР ЗАВТРАКА ================= */

  const B = D.BUILDER;
  const bState = { base: B.bases[0].id, tops: [], drink: 'd-none' };
  const bPlate = $('#b-plate');
  const SLOTS = [[64, 64], [150, 60], [158, 134], [60, 138]];

  const TOP_SVG = {
    't-cream': (x, y) => `<path d="M${x - 14} ${y}c0-10 10-16 18-12 4-8 16-6 16 4 8 2 8 14-2 16-6 6-20 6-26 0-6 0-8-4-6-8Z" fill="#FFFDF7" stroke="#EFE6D2" stroke-width="1.5"/>`,
    't-berries': (x, y) => [[0, 0], [10, 4], [-8, 8], [4, 12], [12, -6], [-6, -6]].map(([dx, dy], i) => `<circle cx="${x + dx}" cy="${y + dy}" r="${6 - (i % 2)}" fill="${i % 3 ? '#C8374F' : '#5B2A6E'}"/><circle cx="${x + dx - 1.5}" cy="${y + dy - 2}" r="1.5" fill="#fff" opacity=".6"/>`).join(''),
    't-honey': (x, y) => `<path d="M${x - 18} ${y - 6}c10 8 16-6 26 2s12 10 16 2" fill="none" stroke="#F2B33D" stroke-width="6" stroke-linecap="round" opacity=".9"/><circle cx="${x + 6}" cy="${y + 8}" r="7" fill="#F2B33D" opacity=".85"/>`,
    't-salmon': (x, y) => `<g transform="rotate(-20 ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="22" ry="11" fill="#F08F72"/><path d="M${x - 14} ${y - 4}q6 8 0 12M${x - 4} ${y - 8}q6 10 0 16M${x + 6} ${y - 8}q6 10 0 16" stroke="#FBC3B0" stroke-width="2.5" fill="none"/></g>`,
    't-avocado': (x, y) => [-12, 0, 12].map((dx, i) => `<g transform="rotate(${-20 + i * 20} ${x + dx} ${y})"><ellipse cx="${x + dx}" cy="${y}" rx="8" ry="15" fill="#6E9A3E"/><ellipse cx="${x + dx}" cy="${y}" rx="5.5" ry="12" fill="#C7DE8A"/></g>`).join(''),
    't-bacon': (x, y) => `<path d="M${x - 22} ${y - 4}q8-10 16 0t16 0 12 0" stroke="#B5523A" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M${x - 22} ${y - 4}q8-10 16 0t16 0 12 0" stroke="#F0B9A5" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    't-cheese': (x, y) => `<path d="M${x - 16} ${y + 12}L${x + 18} ${y + 8}L${x - 2} ${y - 16}Z" fill="#F4D46A" stroke="#E0B94A" stroke-width="2" stroke-linejoin="round"/><circle cx="${x}" cy="${y + 4}" r="3" fill="#E0B94A"/><circle cx="${x - 7}" cy="${y + 8}" r="2" fill="#E0B94A"/>`,
    't-nuts': (x, y) => [[0, 0, 20], [12, 6, -30], [-10, 8, 60], [6, -10, 10], [-8, -6, -50]].map(([dx, dy, r]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="6" ry="4" fill="#9A6A3A" transform="rotate(${r} ${x + dx} ${y + dy})"/>`).join('')
  };

  function bOpt(item, type, selected, extra = '') {
    const art = type === 'base' ? `<span class="bopt__art">${A.art(item.art)}</span>`
      : type === 'top' ? `<span class="bopt__dot" style="--c:${item.color}"></span>`
        : item.art ? `<span class="bopt__art bopt__art--sm">${A.art(item.art)}</span>` : '<span class="bopt__dot bopt__dot--none"></span>';
    return `<button type="button" class="bopt" data-type="${type}" data-id="${item.id}" aria-pressed="${selected}" ${extra}>
      ${art}<span class="bopt__name">${esc(tr(item.name))}</span><span class="bopt__price">${item.price ? (type === 'base' ? '' : '+') + money(item.price) : ''}</span></button>`;
  }
  function renderBuilderOptions() {
    $('#b-bases').innerHTML = B.bases.map(b => bOpt(b, 'base', b.id === bState.base)).join('');
    $('#b-toppings').innerHTML = B.toppings.map(x => bOpt(x, 'top', bState.tops.includes(x.id))).join('');
    $('#b-drinks').innerHTML = B.drinks.map(x => bOpt(x, 'drink', x.id === bState.drink)).join('');
  }

  const bPrice = () => {
    const base = B.bases.find(b => b.id === bState.base);
    const drink = B.drinks.find(d => d.id === bState.drink);
    return base.price + bState.tops.reduce((s, id) => s + B.toppings.find(x => x.id === id).price, 0) + (drink ? drink.price : 0);
  };

  let shownPrice = 0, priceAnim = 0;
  function animatePrice(to) {
    const el = $('#b-price');
    cancelAnimationFrame(priceAnim);
    if (reduceMotion) { shownPrice = to; el.textContent = Math.round(to).toLocaleString('ru-RU'); return; }
    const from = shownPrice, t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / 550), e = 1 - Math.pow(1 - p, 3);
      shownPrice = from + (to - from) * e;
      el.textContent = Math.round(shownPrice).toLocaleString('ru-RU');
      if (p < 1) priceAnim = requestAnimationFrame(step);
    })(t0);
    const box = $('.builder__price');
    box.classList.remove('pulse'); void box.offsetWidth; box.classList.add('pulse');
  }

  function renderPlate(changed) {
    const base = B.bases.find(b => b.id === bState.base);
    let baseEl = $('.bp-base', bPlate), topSvg = $('.bp-top', bPlate), drinkEl = $('.bp-drink', bPlate);
    if (!baseEl) {
      bPlate.innerHTML = '<div class="bp-base"></div><svg class="bp-top" viewBox="0 0 220 200"></svg><div class="bp-drink"></div>';
      baseEl = $('.bp-base', bPlate); topSvg = $('.bp-top', bPlate); drinkEl = $('.bp-drink', bPlate);
    }
    if (changed === 'base' || !baseEl.dataset.id) {
      baseEl.dataset.id = base.id;
      baseEl.innerHTML = A.art(base.art);
      baseEl.classList.remove('spin'); void baseEl.offsetWidth; baseEl.classList.add('spin');
    }
    // добавки: новые падают сверху, убранные улетают
    const have = $$('g[data-top]', topSvg).map(g => g.dataset.top);
    have.filter(id => !bState.tops.includes(id)).forEach(id => {
      const g = $(`g[data-top="${id}"]`, topSvg);
      if (g.dataset.leaving) return;
      g.dataset.leaving = '1';
      g.classList.add('lift');
      setTimeout(() => g.remove(), reduceMotion ? 0 : 350);
    });
    bState.tops.forEach((id, i) => {
      let g = $(`g[data-top="${id}"]`, topSvg);
      const [x, y] = SLOTS[i];
      if (!g || g.dataset.leaving) {
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.dataset.top = id;
        g.classList.add('drop');
        topSvg.appendChild(g);
      }
      if (g.dataset.slot !== String(i)) { g.dataset.slot = String(i); g.innerHTML = TOP_SVG[id](x, y); }
    });
    const drink = B.drinks.find(d => d.id === bState.drink);
    if (drinkEl.dataset.id !== bState.drink) {
      drinkEl.dataset.id = bState.drink;
      drinkEl.classList.remove('in');
      drinkEl.innerHTML = drink && drink.art ? A.art(drink.art) : '';
      if (drink && drink.art) { void drinkEl.offsetWidth; drinkEl.classList.add('in'); }
    }
    const names = [tr(base.name)].concat(bState.tops.map(id => tr(B.toppings.find(x => x.id === id).name)));
    if (drink && drink.art) names.push(tr(drink.name));
    $('#b-list').textContent = names.join(' + ');
    animatePrice(bPrice());
  }

  $('.builder__steps').addEventListener('click', e => {
    const b = e.target.closest('.bopt');
    if (!b) return;
    const { type, id } = b.dataset;
    if (type === 'base') { if (bState.base === id) return; bState.base = id; }
    if (type === 'drink') { if (bState.drink === id) return; bState.drink = id; }
    if (type === 'top') {
      if (bState.tops.includes(id)) bState.tops = bState.tops.filter(x => x !== id);
      else if (bState.tops.length >= 4) { PF.toast(t('bMax')); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
      else bState.tops.push(id);
    }
    renderBuilderOptions();
    renderPlate(type);
  });

  $('#b-add').addEventListener('click', e => {
    const base = B.bases.find(b => b.id === bState.base);
    const drink = B.drinks.find(d => d.id === bState.drink);
    const tops = bState.tops.slice().sort();
    const id = 'bf-' + [bState.base].concat(tops, [bState.drink]).join('.');
    const mk = l => {
      const parts = [base.name[l]].concat(tops.map(x => B.toppings.find(y => y.id === x).name[l]));
      return window.PF_I18N.js.bPrefix[l] + parts.join(' + ');
    };
    const note = drink && drink.art ? { ru: '+ ' + drink.name.ru, tt: '+ ' + drink.name.tt } : null;
    addToCart(id, 1, e.currentTarget, { name: { ru: mk('ru'), tt: mk('tt') }, price: bPrice(), art: base.art, note });
  });

  renderBuilderOptions();
  renderPlate('base');

  /* ================= «ЧТО ВЗЯТЬ?» ================= */

  const quizBody = $('#quiz-body');
  const quizBar = $('#quiz-bar');
  let qStep = 0, qAnswers = {}, qResult = [];

  function quizPick() {
    const menu = PF.getMenu().filter(d => !d.stop);
    const food = menu.filter(d => d.cat !== 'drinks');
    const drinks = menu.filter(d => d.cat === 'drinks');
    let pool;
    if (qAnswers.mood === 'sweet') pool = food.filter(d => d.cat === 'dessert' || d.id === 'syrniki');
    else if (qAnswers.mood === 'tatar') pool = food.filter(d => d.cat === 'tatar');
    else pool = food.filter(d => d.cat === 'hot' || d.cat === 'breakfast');
    const sign = qAnswers.hunger === 'snack' ? 1 : -1;
    pool.sort((a, b) => {
      if (qAnswers.company === 'group' && !!a.share !== !!b.share) return a.share ? -1 : 1;
      if ((a.tag === 'hit') !== (b.tag === 'hit')) return a.tag === 'hit' ? -1 : 1;
      return sign * (a.price - b.price);
    });
    const n = qAnswers.hunger === 'snack' ? 1 : qAnswers.hunger === 'meal' ? 2 : 3;
    const drinkPref = qAnswers.mood === 'sweet' ? ['raf', 'cocoa'] : qAnswers.mood === 'tatar' || qAnswers.company !== 'solo' ? ['tea', 'flatwhite'] : ['flatwhite', 'raf'];
    const drink = drinkPref.map(id => drinks.find(d => d.id === id)).find(Boolean) || drinks[0];
    const qty = qAnswers.company === 'duo' ? 2 : qAnswers.company === 'group' ? 3 : 1;
    const out = pool.slice(0, n).map(d => ({ d, qty: d.share ? 1 : qty }));
    if (drink) out.push({ d: drink, qty: drink.share ? 1 : qty });
    return out;
  }

  function renderQuiz(dir = 1) {
    const total = D.QUIZ.length;
    quizBar.style.width = (Math.min(qStep, total) / total * 100) + '%';
    let html;
    if (qStep < total) {
      const q = D.QUIZ[qStep];
      html = `<div class="qstep">
        <p class="qstep__n">${t('qStep', { n: qStep + 1, total })}</p>
        <h3 class="qstep__q">${esc(tr(q.q))}</h3>
        <div class="qstep__answers">${q.a.map((a, i) => `<button type="button" class="qans" data-v="${a.v}" style="--i:${i}" aria-pressed="${qAnswers[q.id] === a.v}"><span class="qans__e" aria-hidden="true">${a.e}</span><span>${esc(tr(a.t))}</span></button>`).join('')}</div>
        ${qStep > 0 ? `<button type="button" class="link-btn qstep__back" data-qback>${t('qBack')}</button>` : ''}
      </div>`;
    } else {
      qResult = quizPick();
      const sum = qResult.reduce((s, x) => s + x.d.price * x.qty, 0);
      html = `<div class="qstep qstep--result">
        <p class="qstep__n">🎉</p>
        <h3 class="qstep__q">${t('qResult')}</h3>
        <ul class="qres">${qResult.map((x, i) => `<li style="--i:${i}"><span class="qres__art" style="--bg:${PF.catBg(x.d.cat)}">${A.art(x.d.art)}</span><span class="qres__name">${esc(tr(x.d.name))}${x.qty > 1 ? ` × ${x.qty}` : ''}</span><span class="qres__price">${money(x.d.price * x.qty)}</span></li>`).join('')}</ul>
        <div class="qstep__actions">
          <button type="button" class="btn btn--brass" data-qall>${t('qAddAll')} · ${money(sum)}</button>
          <button type="button" class="link-btn" data-qagain>${t('qAgain')}</button>
        </div>
      </div>`;
    }
    const old = quizBody.firstElementChild;
    const next = document.createElement('div');
    next.className = 'qslide ' + (dir > 0 ? 'from-right' : 'from-left');
    next.innerHTML = html;
    quizBody.appendChild(next);
    if (old) {
      old.classList.add(dir > 0 ? 'to-left' : 'to-right');
      setTimeout(() => old.remove(), reduceMotion ? 0 : 450);
    }
  }

  function openQuiz() {
    qStep = 0; qAnswers = {};
    quizBody.innerHTML = '';
    renderQuiz(1);
    PF.openPanel($('#quiz'));
  }
  $$('[data-open-quiz]').forEach(b => b.addEventListener('click', openQuiz));

  quizBody.addEventListener('click', e => {
    const a = e.target.closest('.qans');
    if (a) {
      qAnswers[D.QUIZ[qStep].id] = a.dataset.v;
      $$('.qans', a.parentElement).forEach(x => x.setAttribute('aria-pressed', String(x === a)));
      qStep++;
      setTimeout(() => renderQuiz(1), reduceMotion ? 0 : 180);
      return;
    }
    if (e.target.closest('[data-qback]')) { qStep = Math.max(0, qStep - 1); renderQuiz(-1); return; }
    if (e.target.closest('[data-qagain]')) { qStep = 0; qAnswers = {}; renderQuiz(-1); return; }
    const all = e.target.closest('[data-qall]');
    if (all) {
      qResult.forEach(x => PF.cart.add(x.d.id, x.qty));
      renderCart();
      PF.closePanel();
      PF.toast(t('qAdded'));
      cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    }
  });

  /* ================= ПРОГРАММА ================= */

  const program = $('#program');
  const track = $('#events');
  const pin = $('.program__pin');

  function renderEvents() {
    track.innerHTML = D.EVENTS.map(ev => `
      <article class="event ${ev.light ? 'event--light' : ''}" style="--c:${ev.color}">
        ${A.EVENT_ICONS[ev.icon]}
        <div class="event__day">${esc(tr(ev.day))}</div>
        <div class="event__time">${t('at', { time: ev.time })}</div>
        <h3>${esc(tr(ev.title))}</h3>
        <p>${esc(tr(ev.text))}</p>
        <button class="btn" type="button" data-book-weekday="${ev.weekday}" data-book-time="${ev.time}">${t('bookEvening')}</button>
      </article>`).join('');
  }
  renderEvents();

  let pinDist = 0;
  const pinMQ = window.matchMedia('(min-width: 900px)');
  function setupPin() {
    const on = pinMQ.matches && !reduceMotion;
    program.classList.toggle('pinned', on);
    track.style.transform = '';
    if (!on) { program.style.height = ''; pinDist = 0; return; }
    pinDist = Math.max(0, track.scrollWidth - pin.clientWidth);
    program.style.height = (innerHeight + pinDist) + 'px';
    updateProgram();
  }
  function updateProgram() {
    if (!pinDist) return;
    const top = program.getBoundingClientRect().top;
    const p = clamp(-top / pinDist, 0, 1);
    track.style.transform = `translate3d(${-p * pinDist}px,0,0)`;
  }
  window.addEventListener('resize', setupPin);
  if (pinMQ.addEventListener) pinMQ.addEventListener('change', setupPin);

  track.addEventListener('click', e => {
    const b = e.target.closest('[data-book-weekday]');
    if (b) presetBooking(+b.dataset.bookWeekday, b.dataset.bookTime);
  });

  /* ================= ПОДАРОЧНЫЙ СЕРТИФИКАТ ================= */

  const G = D.GIFT;
  const gState = { amount: 2000, custom: '', design: G.designs[0].id, flipped: false };
  const gCard = $('#g-card');

  function giftAmount() {
    if (gState.custom) {
      const v = Math.round(+gState.custom);
      return v >= 500 && v <= 50000 ? v : null;
    }
    return gState.amount;
  }
  function giftCode() {
    const s = [giftAmount(), gState.design, $('#g-to').value, $('#g-from').value].join('|');
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    const x = (h >>> 0).toString(36).toUpperCase().padStart(8, '7').slice(0, 8);
    return `PF-${x.slice(0, 4)}-${x.slice(4)}`;
  }

  function renderGiftOptions() {
    $('#g-amounts').innerHTML = G.amounts.map(a => `<button type="button" class="chip" data-amount="${a}" aria-pressed="${!gState.custom && gState.amount === a}">${money(a)}</button>`).join('');
    $('#g-designs').innerHTML = G.designs.map(d => `<button type="button" class="swatch" data-design="${d.id}" aria-pressed="${gState.design === d.id}" style="--a:${d.bg[0]};--b:${d.bg[1]};--c:${d.accent}"><span></span>${esc(tr(d.name))}</button>`).join('');
  }

  function renderGiftCard() {
    const d = G.designs.find(x => x.id === gState.design);
    const amt = giftAmount();
    const to = $('#g-to').value.trim(), from = $('#g-from').value.trim(), msg = $('#g-msg').value.trim();
    gCard.style.setProperty('--ga', d.bg[0]);
    gCard.style.setProperty('--gb', d.bg[1]);
    gCard.style.setProperty('--gi', d.ink);
    gCard.style.setProperty('--gc', d.accent);
    $('#g-front').innerHTML = `
      <svg class="gcard__tulip" viewBox="0 0 40 40" aria-hidden="true"><use href="#tulip"/></svg>
      <span class="gcard__brand">Performance</span>
      <span class="gcard__label">${t('gCard')}</span>
      <span class="gcard__amount">${amt ? money(amt) : '—'}</span>
      <span class="gcard__to">${to ? esc(t('gTo', { name: to })) : '&nbsp;'}</span>
      <span class="gcard__hint">${t('gFlipHint')}</span>`;
    $('#g-back').innerHTML = `
      <p class="gcard__msg">${esc(msg || t('gDefaultMsg'))}</p>
      <p class="gcard__from">${from ? esc(t('gFrom', { name: from })) : ''}</p>
      <div class="gcard__code"><span>${t('gCode')}</span><strong>${giftCode()}</strong></div>
      <p class="gcard__valid">${t('gValid')}</p>`;
    $('#g-count').textContent = `${$('#g-msg').value.length}/90`;
    const errBox = $('.field__error', $('#g-amounts').closest('.field'));
    errBox.textContent = amt ? '' : t('gAmountErr');
  }

  $('#g-amounts').addEventListener('click', e => {
    const c = e.target.closest('[data-amount]');
    if (!c) return;
    gState.amount = +c.dataset.amount; gState.custom = ''; $('#g-custom').value = '';
    renderGiftOptions(); renderGiftCard(); popCard();
  });
  $('#g-custom').addEventListener('input', e => {
    gState.custom = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    renderGiftOptions(); renderGiftCard();
  });
  $('#g-designs').addEventListener('click', e => {
    const s = e.target.closest('[data-design]');
    if (!s) return;
    gState.design = s.dataset.design;
    renderGiftOptions(); renderGiftCard(); popCard();
  });
  ['#g-to', '#g-from', '#g-msg'].forEach(sel => $(sel).addEventListener('input', () => {
    renderGiftCard();
    const wantBack = sel === '#g-msg' || sel === '#g-from';
    if (wantBack !== gState.flipped) flipCard(wantBack);
  }));
  $('#gift-form').addEventListener('submit', e => e.preventDefault());

  function flipCard(to) {
    gState.flipped = typeof to === 'boolean' ? to : !gState.flipped;
    gCard.classList.toggle('flipped', gState.flipped);
  }
  function popCard() { gCard.classList.remove('pop'); void gCard.offsetWidth; gCard.classList.add('pop'); }
  gCard.addEventListener('click', () => flipCard());
  gCard.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); } });
  $('#g-flip').addEventListener('click', () => flipCard());
  if (!reduceMotion) {
    gCard.addEventListener('pointermove', e => {
      const r = gCard.getBoundingClientRect();
      gCard.style.setProperty('--tx', (((e.clientY - r.top) / r.height - 0.5) * -14).toFixed(2) + 'deg');
      gCard.style.setProperty('--ty', (((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(2) + 'deg');
      gCard.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    });
    gCard.addEventListener('pointerleave', () => { gCard.style.setProperty('--tx', '0deg'); gCard.style.setProperty('--ty', '0deg'); });
  }

  // Скачивание открытки картинкой (PNG)
  $('#g-download').addEventListener('click', async () => {
    const amt = giftAmount();
    if (!amt) { renderGiftCard(); PF.toast(t('gAmountErr')); return; }
    const d = G.designs.find(x => x.id === gState.design);
    const W = 1200, H = 760;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    try { if (document.fonts) await Promise.all([document.fonts.load('800 80px Unbounded'), document.fonts.load('600 30px Manrope')]); } catch (e) { /* шрифты по умолчанию */ }
    const disp = '"Unbounded", "Arial Black", sans-serif', body = '"Manrope", Arial, sans-serif';
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, d.bg[0]); g.addColorStop(1, d.bg[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, 520);
    glow.addColorStop(0, 'rgba(255,255,255,.22)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = glow; c.fillRect(0, 0, W, H);
    // тюльпан
    c.save(); c.translate(W - 250, 60); c.scale(5, 5); c.fillStyle = d.accent; c.globalAlpha = 0.9;
    c.fill(new Path2D('M20 21c-6 0-9-5-9-12 3 2 5 3 6 5 0-4 1-7 3-10 2 3 3 6 3 10 1-2 3-3 6-5 0 7-3 12-9 12Z'));
    c.fill(new Path2D('M20 30c-4-1-7-4-8-8 4 0 7 3 8 8Zm0 0c4-1 7-4 8-8-4 0-7 3-8 8Z'));
    c.fillRect(18.8, 20, 2.4, 16);
    c.restore();
    c.fillStyle = d.ink;
    c.font = `800 44px ${disp}`; c.fillText('Performance', 70, 110);
    c.globalAlpha = 0.8; c.font = `600 30px ${body}`; c.fillText(t('gCard'), 70, 160); c.globalAlpha = 1;
    c.font = `800 150px ${disp}`; c.fillText(money(amt), 64, 360);
    const to = $('#g-to').value.trim(), from = $('#g-from').value.trim();
    const msg = $('#g-msg').value.trim() || t('gDefaultMsg');
    c.font = `700 36px ${body}`;
    if (to) c.fillText(t('gTo', { name: to }), 70, 440);
    // пожелание переносим по словам
    c.font = `500 30px ${body}`; c.globalAlpha = 0.9;
    let line = '', y = 500;
    msg.split(/\s+/).forEach(w => {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > 760 && line) { c.fillText(line, 70, y); line = w; y += 40; } else line = test;
    });
    if (line) c.fillText(line, 70, y);
    if (from) { c.font = `italic 500 28px ${body}`; c.fillText('— ' + t('gFrom', { name: from }), 70, y + 50); }
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, H - 110, W, 110);
    c.fillStyle = d.ink; c.font = `700 30px ${body}`;
    c.fillText(`${t('gCode')}: ${giftCode()}`, 70, H - 45);
    c.globalAlpha = 0.75; c.font = `500 24px ${body}`;
    c.textAlign = 'right'; c.fillText(t('gValid'), W - 70, H - 45); c.globalAlpha = 1;
    const a = document.createElement('a');
    a.download = `performance-gift-${giftCode()}.png`;
    a.href = cv.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
    PF.toast(t('gSaved'));
  });

  renderGiftOptions();
  renderGiftCard();

  /* ================= ВОПРОСЫ ================= */

  const openQa = new Set();
  function renderFaq() {
    $('#faq-list').innerHTML = D.FAQ.map((f, i) => `
      <div class="qa ${openQa.has(i) ? 'open' : ''}">
        <button class="qa__q" type="button" aria-expanded="${openQa.has(i)}" aria-controls="qa-${i}" data-qa="${i}">${esc(tr(f.q))}<span class="qa__icon" aria-hidden="true"></span></button>
        <div class="qa__a" id="qa-${i}" role="region"><div><p>${esc(tr(f.a))}</p></div></div>
      </div>`).join('');
  }
  $('#faq-list').addEventListener('click', e => {
    const q = e.target.closest('.qa__q');
    if (!q) return;
    const i = +q.dataset.qa, item = q.parentElement;
    const open = !item.classList.contains('open');
    if (open) openQa.add(i); else openQa.delete(i);
    item.classList.toggle('open', open);
    q.setAttribute('aria-expanded', String(open));
  });
  renderFaq();

  /* ================= БРОНЬ И СХЕМА ЗАЛА ================= */

  const form = $('#booking-form');
  const dateInput = $('#b-date');
  const timesEl = $('#b-times');
  const phoneInput = $('#b-phone');
  const hallMap = $('#hall-map');
  const hallInfo = $('#hall-info');
  let guests = 2, selTime = null, selTable = null;

  const today = new Date();
  const maxDay = new Date(); maxDay.setDate(maxDay.getDate() + 30);
  dateInput.min = PF.isoDate(today);
  dateInput.max = PF.isoDate(maxDay);
  dateInput.value = PF.isoDate(today);

  const SLOTS_T = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '19:30', '20:00', '21:00', '22:00'];
  const mins = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const nowMins = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
  const slotPast = (date, time) => date === PF.isoDate(new Date()) && mins(time) <= nowMins() + 30;

  function renderTimes() {
    if (selTime && slotPast(dateInput.value, selTime)) selTime = null;
    timesEl.innerHTML = SLOTS_T.map(tm => {
      const past = slotPast(dateInput.value, tm);
      return `<button type="button" class="chip" data-time="${tm}" aria-pressed="${selTime === tm}" ${past ? 'disabled' : ''}>${tm}</button>`;
    }).join('');
  }

  // Занятость столов: «чужие» брони считаются псевдослучайно, но одинаково для одного дня и времени
  function hash01(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  }
  function tableBusy(id, date, time) {
    if (!date || !time) return false;
    if (hash01(`${date}|${time}|${id}`) < 0.3) return true;
    return PF.bookings.list().some(b => b.table === id && b.date === date && b.status !== 'cancelled' && Math.abs(mins(b.time) - mins(time)) < 120);
  }

  function renderHall() {
    const date = dateInput.value, time = selTime;
    if (selTable) {
      const tb = D.TABLES.find(x => x.id === selTable);
      if (!tb || tb.seats < guests || tableBusy(selTable, date, time)) selTable = null;
    }
    const chairs = (tb) => {
      let s = '';
      if (tb.shape === 'round') {
        const r = 18 + tb.seats * 2.4;
        for (let i = 0; i < tb.seats; i++) { const a = i / tb.seats * Math.PI * 2 - Math.PI / 2; s += `<circle class="tbl__chair" cx="${(tb.x + Math.cos(a) * (r + 10)).toFixed(1)}" cy="${(tb.y + Math.sin(a) * (r + 10)).toFixed(1)}" r="7"/>`; }
        return { s, body: `<circle class="tbl__top" cx="${tb.x}" cy="${tb.y}" r="${r.toFixed(1)}"/>` };
      }
      const vertical = tb.zone === 'window';
      const len = tb.seats / 2 * 26 + 14, th = 36;
      const w = vertical ? th : len, h = vertical ? len : th;
      const per = Math.ceil(tb.seats / 2);
      for (let i = 0; i < per; i++) {
        const off = -len / 2 + 20 + i * 26;
        if (vertical) {
          s += `<circle class="tbl__chair" cx="${tb.x - th / 2 - 10}" cy="${tb.y + off}" r="7"/>`;
          if (i < tb.seats - per) s += `<circle class="tbl__chair" cx="${tb.x + th / 2 + 10}" cy="${tb.y + off}" r="7"/>`;
        } else {
          s += `<circle class="tbl__chair" cx="${tb.x + off}" cy="${tb.y - th / 2 - 10}" r="7"/>`;
          if (i < tb.seats - per) s += `<circle class="tbl__chair" cx="${tb.x + off}" cy="${tb.y + th / 2 + 10}" r="7"/>`;
        }
      }
      return { s, body: `<rect class="tbl__top" x="${tb.x - w / 2}" y="${tb.y - h / 2}" width="${w}" height="${h}" rx="10"/>` };
    };
    const tables = D.TABLES.map((tb, i) => {
      const busy = tableBusy(tb.id, date, time);
      const small = tb.seats < guests;
      const sel = selTable === tb.id;
      const { s, body } = chairs(tb);
      const state = sel ? 'sel' : busy ? 'busy' : small ? 'small' : 'free';
      const label = `${tb.id}, ${tr(D.ZONES[tb.zone])}, ${t('seats', { n: tb.seats })}`;
      return `<g class="tbl tbl--${state}" data-table="${tb.id}" style="--i:${i}" tabindex="${busy || small || !time ? -1 : 0}" role="button" aria-label="${label}" aria-pressed="${sel}">
        <g class="tbl__inner" style="transform-origin:${tb.x}px ${tb.y}px">${s}${body}<text class="tbl__id" x="${tb.x}" y="${tb.y + 4}">${tb.id}</text></g></g>`;
    }).join('');
    hallMap.innerHTML = `<svg viewBox="0 0 600 440" role="group" aria-label="${t('hallPick')}">
      <rect class="hall__floor" x="4" y="4" width="592" height="432" rx="22"/>
      <rect class="hall__stage" x="180" y="18" width="240" height="64" rx="12"/>
      <text class="hall__label hall__label--stage" x="300" y="57">${t('stageLabel')}</text>
      <rect class="hall__bar" x="486" y="18" width="96" height="150" rx="12"/>
      <text class="hall__label" x="534" y="98" transform="rotate(90 534 98)">${t('barLabel')}</text>
      <path class="hall__window" d="M8 60V420"/>
      <text class="hall__small" x="22" y="40">${t('windowLabel')}</text>
      <path class="hall__door" d="M596 190v60"/>
      <text class="hall__small" x="586" y="182" text-anchor="end">${t('entrance')}</text>
      ${tables}
    </svg>`;
    hallMap.classList.toggle('hall__map--wait', !time);
    if (!time) hallInfo.textContent = t('hallNeedTime');
    else if (selTable) {
      const tb = D.TABLES.find(x => x.id === selTable);
      hallInfo.textContent = t('hallChosen', { id: tb.id, zone: tr(D.ZONES[tb.zone]), seats: tb.seats });
    } else hallInfo.textContent = t('hallPick');
  }

  hallMap.addEventListener('click', e => {
    const g = e.target.closest('.tbl');
    if (!g) return;
    const id = g.dataset.table, tb = D.TABLES.find(x => x.id === id);
    if (!selTime) { hallInfo.textContent = t('hallNeedTime'); shake(timesEl); return; }
    if (tableBusy(id, dateInput.value, selTime)) { hallInfo.textContent = t('hallBusy', { id }); shakeEl(g); return; }
    if (tb.seats < guests) { hallInfo.textContent = t('hallSmall', { id, seats: tb.seats, guests }); shakeEl(g); return; }
    selTable = selTable === id ? null : id;
    clearError(hallMap.closest('.field'));
    renderHall();
  });
  hallMap.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.tbl')) { e.preventDefault(); e.target.closest('.tbl').dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };
  const shakeEl = g => { const inner = $('.tbl__inner', g); if (inner) shake(inner); };

  dateInput.addEventListener('change', () => { clearError(dateInput.closest('.field')); renderTimes(); renderHall(); });
  timesEl.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c || c.disabled) return;
    selTime = c.dataset.time;
    $$('.chip', timesEl).forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    clearError(timesEl.closest('.field'));
    renderHall();
  });
  form.addEventListener('click', e => {
    const s = e.target.closest('[data-step]');
    if (!s) return;
    guests = clamp(guests + +s.dataset.step, 1, 12);
    $('#b-guests').textContent = guests;
    renderHall();
  });

  phoneMask(phoneInput);
  phoneInput.addEventListener('input', () => clearError(phoneInput.closest('.field')));
  $('#b-name').addEventListener('input', e => clearError(e.target.closest('.field')));
  if (who.name) $('#b-name').value = who.name;
  if (who.phone) phoneInput.value = who.phone;

  function setError(field, msg) { field.classList.add('error'); const s = $('.field__error', field); if (s) s.textContent = msg; }
  function clearError(field) { if (!field) return; field.classList.remove('error'); const s = $('.field__error', field); if (s) s.textContent = ''; }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    const mark = (field, msg) => { setError(field, msg); firstBad = firstBad || field; };
    const date = dateInput.value;
    if (!date || date < dateInput.min || date > dateInput.max) mark(dateInput.closest('.field'), t('errDate'));
    if (!selTime) mark(timesEl.closest('.field'), t('errTime'));
    else if (slotPast(date, selTime)) { mark(timesEl.closest('.field'), t('errTimePast')); selTime = null; renderTimes(); }
    const name = $('#b-name').value.trim();
    if (name.length < 2) mark($('#b-name').closest('.field'), t('errName'));
    if (!phoneOk(phoneInput.value)) mark(phoneInput.closest('.field'), t('errPhone'));

    let table = selTable;
    if (!firstBad) {
      if (table && tableBusy(table, date, selTime)) { mark(hallMap.closest('.field'), t('errTable')); selTable = null; renderHall(); }
      if (!table) {
        const free = D.TABLES.filter(tb => tb.seats >= guests && !tableBusy(tb.id, date, selTime)).sort((a, b) => a.seats - b.seats)[0];
        if (!free) mark(hallMap.closest('.field'), t('errTable'));
        else table = free.id;
      }
    }
    if (firstBad) { firstBad.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); return; }

    const tb = D.TABLES.find(x => x.id === table);
    const b = PF.bookings.add({ date, time: selTime, guests, zone: tb.zone, table, name, phone: phoneInput.value, note: $('#b-note').value.trim() });
    PF.store.set('pf-who', { name, phone: phoneInput.value });
    const place = `${t('tableN', { id: table })}, ${tr(D.ZONES[tb.zone])}${selTable ? '' : ''}`;
    showDone(t('bookDone'), t('bookText', { name, date: PF.fmtDate(b.date), time: b.time, guests, gw: PF.guestsWord(guests), place }));
    $('#b-note').value = '';
    guests = 2; $('#b-guests').textContent = 2; selTime = null; selTable = null;
    dateInput.value = PF.isoDate(new Date());
    renderTimes(); renderHall(); renderBookings();
  });

  function renderBookings() {
    const box = $('#my-bookings');
    const todayIso = PF.isoDate(new Date());
    const list = PF.bookings.list().filter(b => b.date >= todayIso && b.status !== 'cancelled').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    box.hidden = !list.length;
    $('ul', box).innerHTML = list.map(b => `<li><span><strong>${esc(PF.fmtDate(b.date))}, ${esc(b.time)}</strong><br>${b.guests} ${PF.guestsWord(b.guests)}${b.table ? ', ' + esc(t('tableN', { id: b.table })) : ''}</span><button type="button" data-cancel="${esc(b.id)}">${t('cancel')}</button></li>`).join('');
  }
  $('#my-bookings').addEventListener('click', e => {
    const b = e.target.closest('[data-cancel]');
    if (!b) return;
    PF.bookings.update(b.dataset.cancel, { status: 'cancelled' });
    renderBookings(); renderHall();
    PF.toast(t('cancelled'));
  });

  function presetBooking(weekday, time) {
    const d = new Date();
    let add = (weekday - d.getDay() + 7) % 7;
    if (add === 0 && nowMins() + 30 >= mins(time)) add = 7;
    d.setDate(d.getDate() + add);
    dateInput.value = PF.isoDate(d);
    selTime = time;
    selTable = null;
    renderTimes(); renderHall();
    PF.goTo('#booking');
    PF.toast(t('selected', { date: PF.fmtDate(dateInput.value), time }));
  }

  renderTimes();
  renderHall();
  renderBookings();

  /* ================= ЯЗЫК И ДАННЫЕ ИЗ ДРУГИХ ВКЛАДОК ================= */

  PF.on('lang', () => {
    openStatus();
    splitWords();
    renderTabs(); renderDishes(false); renderCart();
    renderBuilderOptions(); renderPlate();
    renderEvents(); setupPin();
    renderGiftOptions(); renderGiftCard();
    renderFaq(); renderHall(); renderBookings();
    if ($('#quiz').classList.contains('open')) { quizBody.innerHTML = ''; renderQuiz(1); }
    if ($('#dish').classList.contains('open') && dishId) openDish(dishId);
    shownPrice = bPrice(); $('#b-price').textContent = Math.round(shownPrice).toLocaleString('ru-RU');
  });
  PF.on('data', key => {
    if (key === 'pf-menu-overrides') { renderDishes(false); renderCart(); if ($('#dish').classList.contains('open')) updateDishBtn(); }
    if (key === 'pf-cart' || key === 'pf-cart-custom') renderCart();
    if (key === 'pf-bookings') { renderBookings(); renderHall(); }
  });

  /* ================= СТАРТ ================= */

  renderTabs();
  renderDishes(false);
  setupPin();
  onScroll();
  window.addEventListener('load', setupPin);
})();
