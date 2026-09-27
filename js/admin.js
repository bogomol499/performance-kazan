/* =========================================================
   Performance — демо-админка
   Заказы и брони берутся из того же браузера (localStorage),
   поэтому всё обновляется сразу, если сайт открыт в соседней вкладке.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$, esc, tr, money } = PF;
  const D = window.PF_DATA;
  const A = window.PF_ART;

  const WORDS = {
    overview: { ru: 'Обзор', tt: 'Күзәтү' },
    orders: { ru: 'Заказы', tt: 'Заказлар' },
    bookings: { ru: 'Брони', tt: 'Броньнар' },
    menu: { ru: 'Меню', tt: 'Меню' },
    wrongPw: { ru: 'Неверный пароль. Подсказка: performance', tt: 'Серсүз дөрес түгел. Ярдәм: performance' },
    ordersToday: { ru: 'Заказов сегодня', tt: 'Бүгенге заказлар' },
    revenue: { ru: 'Выручка сегодня', tt: 'Бүгенге табыш' },
    avg: { ru: 'Средний чек', tt: 'Уртача чек' },
    bookToday: { ru: 'Броней сегодня', tt: 'Бүгенге броньнар' },
    guestsToday: { ru: 'Гостей ожидаем', tt: 'Көтелгән кунаклар' },
    inWork: { ru: 'в работе: {n}', tt: 'эштә: {n}' },
    popular: { ru: 'Популярные блюда, штук', tt: 'Популяр ашлар, данә' },
    upcoming: { ru: 'Ближайшие брони', tt: 'Якындагы броньнар' },
    noOrders: { ru: 'Заказов пока нет. Сделайте заказ на сайте или нажмите «Заполнить примерами».', tt: 'Әлегә заказлар юк. Сайтта заказ ясагыз яки «Мисаллар белән тутыру» төймәсенә басыгыз.' },
    noBookings: { ru: 'Броней нет. Забронируйте стол на сайте или нажмите «Заполнить примерами».', tt: 'Броньнар юк. Сайтта өстәл заказлагыз яки «Мисаллар белән тутыру» төймәсенә басыгыз.' },
    all: { ru: 'Все', tt: 'Барысы' },
    st_new: { ru: 'Новый', tt: 'Яңа' },
    st_cooking: { ru: 'Готовится', tt: 'Пешә' },
    st_ready: { ru: 'Готов', tt: 'Әзер' },
    st_done: { ru: 'Выдан', tt: 'Бирелде' },
    st_cancelled: { ru: 'Отменён', tt: 'Юкка чыгарылды' },
    bst_new: { ru: 'Новая', tt: 'Яңа' },
    bst_confirmed: { ru: 'Подтверждена', tt: 'Расланды' },
    bst_cancelled: { ru: 'Отменена', tt: 'Юкка чыгарылды' },
    go_cooking: { ru: 'Начать готовить', tt: 'Пешерә башлау' },
    go_ready: { ru: 'Готово', tt: 'Әзер' },
    go_done: { ru: 'Выдать', tt: 'Бирү' },
    cancel: { ru: 'Отменить', tt: 'Юкка чыгару' },
    remove: { ru: 'Удалить', tt: 'Бетерү' },
    confirm: { ru: 'Подтвердить', tt: 'Раслау' },
    pickup: { ru: 'забрать в {t}', tt: 'сәгать {t} алырга' },
    today: { ru: 'Сегодня', tt: 'Бүген' },
    future: { ru: 'Будущие', tt: 'Киләчәк' },
    cancelledF: { ru: 'Отменённые', tt: 'Юкка чыгарылганнар' },
    table: { ru: 'стол {id}', tt: '{id} өстәле' },
    dish: { ru: 'Блюдо', tt: 'Аш' },
    cat: { ru: 'Категория', tt: 'Бүлек' },
    price: { ru: 'Цена, ₽', tt: 'Бәя, ₽' },
    hit: { ru: 'Хит', tt: 'Хит' },
    stop: { ru: 'Стоп-лист', tt: 'Стоп-лист' },
    saved: { ru: 'Цена сохранена', tt: 'Бәя сакланды' },
    badPrice: { ru: 'Цена от 1 до 99 999 ₽', tt: 'Бәя 1 дән 99 999 ₽ га кадәр' },
    stopOn: { ru: '«{n}» в стоп-листе — на сайте закончилось', tt: '«{n}» стоп-листта — сайтта бетте' },
    stopOff: { ru: '«{n}» снова в продаже', tt: '«{n}» кабат сатуда' },
    menuHint: { ru: 'Изменения сразу видны на сайте, в том числе в открытой вкладке.', tt: 'Үзгәрешләр сайтта шундук күренә, ачык кыстыргычта да.' },
    seeded: { ru: 'Добавлены примеры заказов и броней', tt: 'Заказ һәм бронь мисаллары өстәлде' },
    wipeSure: { ru: 'Нажмите ещё раз, чтобы удалить всё', tt: 'Барысын да бетерү өчен тагын басыгыз' },
    wiped: { ru: 'Все данные удалены', tt: 'Барлык мәгълүматлар бетерелде' },
    newOrder: { ru: 'Новый заказ №{n}', tt: 'Яңа заказ №{n}' },
    newBooking: { ru: 'Новая бронь: {name}, {time}', tt: 'Яңа бронь: {name}, {time}' },
    resetPrice: { ru: 'Вернуть', tt: 'Кайтару' },
    note: { ru: 'Пожелание', tt: 'Теләк' }
  };
  const L = (k, vars) => {
    let s = tr(WORDS[k]) || k;
    if (vars) Object.keys(vars).forEach(v => { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  };
  const ST_COLOR = { new: '#D4A955', cooking: '#E07A3F', ready: '#3FBF8A', done: '#8A9A97', cancelled: '#B8324B', confirmed: '#3FBF8A' };

  /* ---------- Вход ---------- */
  const login = $('#login'), app = $('#app');
  let authed = false;
  try { authed = sessionStorage.getItem('pf-admin') === '1'; } catch (e) { /* ничего */ }

  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    const pw = $('#pw').value.trim().toLowerCase();
    if (pw === 'performance') {
      try { sessionStorage.setItem('pf-admin', '1'); } catch (err) { /* ничего */ }
      showApp();
    } else {
      $('#login-err').textContent = L('wrongPw');
      const card = $('#login-form');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      $('#pw').select();
    }
  });
  $$('[data-logout]').forEach(b => b.addEventListener('click', () => {
    try { sessionStorage.removeItem('pf-admin'); } catch (e) { /* ничего */ }
    app.hidden = true; login.hidden = false; $('#pw').value = ''; $('#pw').focus();
  }));

  function showApp() {
    login.hidden = true; app.hidden = false;
    render();
  }

  /* ---------- Разделы ---------- */
  let view = 'overview';
  const filters = { orders: 'active', bookings: 'today' };
  const seen = { orders: new Set(PF.orders.list().map(o => o.id)), bookings: new Set(PF.bookings.list().map(b => String(b.id))) };
  const fresh = new Set();

  $('.ad-tabs').addEventListener('click', e => {
    const b = e.target.closest('.ad-tab');
    if (!b) return;
    view = b.dataset.view;
    render();
  });

  const todayIso = () => PF.isoDate(new Date());
  const isToday = ts => PF.isoDate(new Date(ts)) === todayIso();
  const hhmm = ts => { const d = new Date(ts); return `${PF.pad2(d.getHours())}:${PF.pad2(d.getMinutes())}`; };

  function counters() {
    const o = PF.orders.list().filter(x => x.status === 'new').length;
    const b = PF.bookings.list().filter(x => x.status === 'new' && x.date >= todayIso()).length;
    $('#n-orders').textContent = o || '';
    $('#n-bookings').textContent = b || '';
  }

  function render() {
    $$('.ad-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === view)));
    $('#view-title').textContent = L(view);
    counters();
    const v = $('#view');
    v.innerHTML = `<div class="ad-view">${({ overview: viewOverview, orders: viewOrders, bookings: viewBookings, menu: viewMenu })[view]()}</div>`;
    fresh.clear();
  }

  /* ---------- Обзор ---------- */
  function viewOverview() {
    const orders = PF.orders.list().filter(o => isToday(o.created) && o.status !== 'cancelled');
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const inWork = orders.filter(o => o.status === 'new' || o.status === 'cooking').length;
    const bookings = PF.bookings.list().filter(b => b.date === todayIso() && b.status !== 'cancelled');
    const guests = bookings.reduce((s, b) => s + (+b.guests || 0), 0);
    const stats = [
      [L('ordersToday'), orders.length, L('inWork', { n: inWork })],
      [L('revenue'), money(revenue), ''],
      [L('avg'), orders.length ? money(revenue / orders.length) : '—', ''],
      [L('bookToday'), bookings.length, ''],
      [L('guestsToday'), guests, '']
    ];
    // популярные блюда
    const count = {};
    PF.orders.list().filter(o => o.status !== 'cancelled').forEach(o => (o.items || []).forEach(i => {
      const key = tr(i.name);
      count[key] = (count[key] || 0) + (i.qty || 0);
    }));
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = top.length ? top[0][1] : 1;
    const bars = top.length ? `<div class="bars" role="list">${top.map(([n, v], i) => `
      <div class="bar" role="listitem" style="--i:${i}" title="${esc(n)}: ${v}">
        <span class="bar__name">${esc(n)}</span>
        <span class="bar__track"><span class="bar__fill" style="width:${(v / max * 100).toFixed(1)}%"></span></span>
        <span class="bar__v">${v}</span>
      </div>`).join('')}</div>` : `<p class="empty-note">${L('noOrders')}</p>`;
    const next = PF.bookings.list().filter(b => b.status !== 'cancelled' && (b.date > todayIso() || (b.date === todayIso())))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
    const up = next.length ? `<div class="cards" style="grid-template-columns:1fr">${next.map((b, i) => bookingCard(b, i, true)).join('')}</div>` : `<p class="empty-note">${L('noBookings')}</p>`;
    return `<div class="stats">${stats.map(([k, v, s], i) => `<div class="stat" style="--i:${i}"><span>${k}</span><strong>${v}</strong>${s ? `<small>${s}</small>` : ''}</div>`).join('')}</div>
      <div class="panel__grid">
        <section class="panel"><h2>${L('popular')}</h2>${bars}</section>
        <section class="panel"><h2>${L('upcoming')}</h2>${up}</section>
      </div>`;
  }

  /* ---------- Заказы ---------- */
  const NEXT = { new: 'cooking', cooking: 'ready', ready: 'done' };
  function viewOrders() {
    const f = filters.orders;
    const opts = [['active', L('all')], ['new', L('st_new')], ['cooking', L('st_cooking')], ['ready', L('st_ready')], ['done', L('st_done')], ['cancelled', L('st_cancelled')]];
    const list = PF.orders.list().filter(o => f === 'active' ? true : o.status === f).sort((a, b) => b.created - a.created);
    const cards = list.length ? `<div class="cards">${list.map((o, i) => `
      <article class="ocard ${fresh.has(o.id) ? 'flash' : ''}" style="--st:${ST_COLOR[o.status]};--i:${i}" data-order="${esc(o.id)}">
        <div class="ocard__top"><strong>№${o.num}</strong><span>${hhmm(o.created)}${isToday(o.created) ? '' : ', ' + esc(PF.fmtDate(PF.isoDate(new Date(o.created)), { day: 'numeric', month: 'short' }))}</span></div>
        <span class="status" style="--st:${ST_COLOR[o.status]}">${L('st_' + o.status)}</span>
        <ul>${(o.items || []).map(i => `<li><span>${esc(tr(i.name))} × ${i.qty}</span><span>${money(i.price * i.qty)}</span></li>`).join('')}</ul>
        <p class="ocard__meta">${esc(o.name || '')} ${esc(o.phone || '')}${o.pickup ? ', ' + L('pickup', { t: esc(o.pickup) }) : ''}</p>
        <p class="ocard__sum">${money(o.total || 0)}</p>
        <div class="ocard__btns">
          ${NEXT[o.status] ? `<button type="button" class="go" data-o-status="${NEXT[o.status]}">${L('go_' + NEXT[o.status])}</button>` : ''}
          ${o.status !== 'done' && o.status !== 'cancelled' ? `<button type="button" class="danger" data-o-status="cancelled">${L('cancel')}</button>` : ''}
          ${o.status === 'done' || o.status === 'cancelled' ? `<button type="button" class="danger" data-o-del>${L('remove')}</button>` : ''}
        </div>
      </article>`).join('')}</div>` : `<p class="empty-note">${L('noOrders')}</p>`;
    return `<div class="ad-filter" data-filter="orders">${opts.map(([k, n]) => `<button type="button" data-f="${k}" aria-pressed="${f === k}">${n}</button>`).join('')}</div>${cards}`;
  }

  /* ---------- Брони ---------- */
  function bookingCard(b, i, compact) {
    const zone = D.ZONES[b.zone] ? tr(D.ZONES[b.zone]) : esc(b.zone || '');
    return `<article class="ocard ${fresh.has(String(b.id)) ? 'flash' : ''}" style="--st:${ST_COLOR[b.status] || ST_COLOR.new};--i:${i}" data-booking="${esc(b.id)}">
      <div class="ocard__top"><strong>${esc(b.time)}</strong><span>${esc(PF.fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' }))}</span></div>
      <span class="status" style="--st:${ST_COLOR[b.status] || ST_COLOR.new}">${L('bst_' + (b.status || 'new'))}</span>
      <p class="ocard__meta"><strong style="color:var(--text)">${esc(b.name)}</strong>, ${esc(b.phone || '')}<br>${b.guests} ${PF.guestsWord(+b.guests)}${b.table ? ', ' + L('table', { id: esc(b.table) }) : ''}, ${zone}${b.note ? `<br>${L('note')}: ${esc(b.note)}` : ''}</p>
      ${compact ? '' : `<div class="ocard__btns">
        ${b.status === 'new' ? `<button type="button" class="go" data-b-status="confirmed">${L('confirm')}</button>` : ''}
        ${b.status !== 'cancelled' ? `<button type="button" class="danger" data-b-status="cancelled">${L('cancel')}</button>` : `<button type="button" class="danger" data-b-del>${L('remove')}</button>`}
      </div>`}
    </article>`;
  }
  function viewBookings() {
    const f = filters.bookings;
    const opts = [['today', L('today')], ['future', L('future')], ['all', L('all')], ['cancelled', L('cancelledF')]];
    const tdy = todayIso();
    const list = PF.bookings.list().filter(b => {
      if (f === 'today') return b.date === tdy && b.status !== 'cancelled';
      if (f === 'future') return b.date > tdy && b.status !== 'cancelled';
      if (f === 'cancelled') return b.status === 'cancelled';
      return true;
    }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const cards = list.length ? `<div class="cards">${list.map((b, i) => bookingCard(b, i)).join('')}</div>` : `<p class="empty-note">${L('noBookings')}</p>`;
    return `<div class="ad-filter" data-filter="bookings">${opts.map(([k, n]) => `<button type="button" data-f="${k}" aria-pressed="${f === k}">${n}</button>`).join('')}</div>${cards}`;
  }

  /* ---------- Меню ---------- */
  function viewMenu() {
    const menu = PF.getMenu();
    const catName = id => tr(D.CATS.find(c => c.id === id).name);
    const rows = menu.map(d => `
      <tr class="${d.stop ? 'is-stop' : ''}" data-dish="${d.id}">
        <td><div class="mtable__dish"><span>${A.art(d.art)}</span><span>${esc(tr(d.name))}</span></div></td>
        <td>${esc(catName(d.cat))}</td>
        <td><input class="price-in" type="number" min="1" max="99999" step="10" value="${d.price}" aria-label="${L('price')}: ${esc(tr(d.name))}"></td>
        <td><button type="button" class="toggle" data-hit aria-pressed="${d.tag === 'hit'}" aria-label="${L('hit')}: ${esc(tr(d.name))}"></button></td>
        <td><button type="button" class="toggle toggle--stop" data-stop aria-pressed="${d.stop}" aria-label="${L('stop')}: ${esc(tr(d.name))}"></button></td>
      </tr>`).join('');
    const mcards = menu.map(d => `
      <div class="mcard ${d.stop ? 'is-stop' : ''}" data-dish="${d.id}">
        <span class="mcard__art">${A.art(d.art)}</span>
        <div class="mcard__main">
          <strong>${esc(tr(d.name))}</strong>
          <div class="mcard__row"><span>${L('price')}</span><input class="price-in" type="number" min="1" max="99999" step="10" value="${d.price}" aria-label="${L('price')}: ${esc(tr(d.name))}"></div>
          <div class="mcard__row"><span>${L('hit')}</span><button type="button" class="toggle" data-hit aria-pressed="${d.tag === 'hit'}" aria-label="${L('hit')}"></button></div>
          <div class="mcard__row"><span>${L('stop')}</span><button type="button" class="toggle toggle--stop" data-stop aria-pressed="${d.stop}" aria-label="${L('stop')}"></button></div>
        </div>
      </div>`).join('');
    return `<p class="empty-note" style="padding:0">${L('menuHint')}</p>
      <section class="panel"><div class="table-wrap"><table class="mtable">
        <thead><tr><th>${L('dish')}</th><th>${L('cat')}</th><th>${L('price')}</th><th>${L('hit')}</th><th>${L('stop')}</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
        <div class="mcard-list">${mcards}</div></section>`;
  }

  /* ---------- Действия ---------- */
  $('#view').addEventListener('click', e => {
    const fb = e.target.closest('.ad-filter [data-f]');
    if (fb) { filters[fb.parentElement.dataset.filter] = fb.dataset.f; render(); return; }

    const oc = e.target.closest('[data-order]');
    if (oc) {
      const id = oc.dataset.order;
      const st = e.target.closest('[data-o-status]');
      if (st) { PF.orders.update(id, { status: st.dataset.oStatus }); render(); return; }
      if (e.target.closest('[data-o-del]')) { PF.orders.remove(id); render(); return; }
    }
    const bc = e.target.closest('[data-booking]');
    if (bc) {
      const id = bc.dataset.booking;
      const st = e.target.closest('[data-b-status]');
      if (st) { PF.bookings.update(id, { status: st.dataset.bStatus }); render(); return; }
      if (e.target.closest('[data-b-del]')) { PF.bookings.remove(id); render(); return; }
    }
    const row = e.target.closest('[data-dish]');
    if (row) {
      const id = row.dataset.dish, d = PF.findDish(id);
      if (e.target.closest('[data-hit]')) {
        PF.setOverride(id, { tag: d.tag === 'hit' ? null : 'hit' });
        syncMenuRows(id);
      }
      if (e.target.closest('[data-stop]')) {
        PF.setOverride(id, { stop: !d.stop });
        syncMenuRows(id);
        PF.toast(L(!d.stop ? 'stopOn' : 'stopOff', { n: tr(d.name) }));
      }
    }
  });

  // сохраняем цену по Enter или при уходе из поля
  function savePrice(input) {
    const row = input.closest('[data-dish]');
    if (!row) return;
    const id = row.dataset.dish;
    const v = Math.round(+input.value);
    const d = PF.findDish(id);
    if (!v || v < 1 || v > 99999) { PF.toast(L('badPrice')); input.value = d.price; return; }
    if (v === d.price) return;
    PF.setOverride(id, { price: v });
    $$(`[data-dish="${id}"] .price-in`).forEach(i => { i.value = v; i.classList.remove('saved'); void i.offsetWidth; i.classList.add('saved'); });
    PF.toast(L('saved'));
  }
  $('#view').addEventListener('change', e => { if (e.target.matches('.price-in')) savePrice(e.target); });
  $('#view').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.price-in')) { e.preventDefault(); e.target.blur(); } });

  function syncMenuRows(id) {
    const d = PF.findDish(id);
    $$(`[data-dish="${id}"]`).forEach(r => {
      r.classList.toggle('is-stop', d.stop);
      const h = $('[data-hit]', r), s = $('[data-stop]', r);
      if (h) h.setAttribute('aria-pressed', String(d.tag === 'hit'));
      if (s) s.setAttribute('aria-pressed', String(d.stop));
    });
  }

  /* ---------- Примеры и очистка ---------- */
  $('#seed').addEventListener('click', () => {
    const menu = D.MENU;
    const names = ['Айгуль', 'Тимур', 'Лейсан', 'Руслан', 'Динара', 'Азат', 'Камила', 'Ильнур'];
    const statuses = ['done', 'done', 'ready', 'cooking', 'cooking', 'new', 'new', 'done'];
    const now = Date.now();
    const list = PF.orders.list();
    let num = list.reduce((m, x) => Math.max(m, x.num || 100), 100);
    names.forEach((n, i) => {
      const items = [menu[(i * 5) % menu.length], menu[(i * 3 + 4) % menu.length]].map((d, k) => ({ id: d.id, name: d.name, price: d.price, qty: 1 + ((i + k) % 2) }));
      const created = now - (names.length - i) * 17 * 60000;
      list.push({ id: 'demo-o' + now + i, num: ++num, status: statuses[i], created, items, total: items.reduce((s, x) => s + x.price * x.qty, 0), name: n, phone: `+7 (9${i}7) 12${i}-4${i}-0${i}`, pickup: hhmm(created + 20 * 60000), demo: true });
    });
    list.forEach(o => seen.orders.add(o.id));
    PF.store.set('pf-orders', list);
    const bl = PF.bookings.list();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    [['18:00', 2, 'S1'], ['19:00', 4, 'S2'], ['19:30', 6, 'Q4'], ['20:00', 2, 'W1'], ['21:00', 4, 'Q1']].forEach(([time, g, table], i) => {
      const tb = D.TABLES.find(x => x.id === table);
      bl.push({ id: 'demo-b' + now + i, date: i < 3 ? todayIso() : PF.isoDate(tomorrow), time, guests: g, table, zone: tb.zone, name: names[i + 2], phone: `+7 (98${i}) 55${i}-1${i}-2${i}`, note: i === 2 ? (PF.lang === 'tt' ? 'Туган көн' : 'День рождения') : '', status: i % 2 ? 'confirmed' : 'new', created: now, demo: true });
    });
    bl.forEach(b => seen.bookings.add(String(b.id)));
    PF.store.set('pf-bookings', bl);
    render();
    PF.toast(L('seeded'));
  });

  let wipeArmed = 0;
  $('#wipe').addEventListener('click', e => {
    const b = e.currentTarget;
    if (Date.now() - wipeArmed > 3000) {
      wipeArmed = Date.now();
      b.textContent = L('wipeSure');
      setTimeout(() => { if (Date.now() - wipeArmed >= 3000) PF.applyI18n(b.parentElement); }, 3100);
      return;
    }
    wipeArmed = 0;
    ['pf-orders', 'pf-bookings', 'pf-menu-overrides'].forEach(k => PF.store.set(k, k === 'pf-menu-overrides' ? {} : []));
    PF.applyI18n(b.parentElement);
    render();
    PF.toast(L('wiped'));
  });

  /* ---------- Живое обновление ---------- */
  PF.on('data', key => {
    if (app.hidden) return;
    if (key === 'pf-orders') {
      PF.orders.list().forEach(o => {
        if (!seen.orders.has(o.id)) { seen.orders.add(o.id); fresh.add(o.id); PF.toast(L('newOrder', { n: o.num })); }
      });
    }
    if (key === 'pf-bookings') {
      PF.bookings.list().forEach(b => {
        if (!seen.bookings.has(String(b.id))) { seen.bookings.add(String(b.id)); fresh.add(String(b.id)); PF.toast(L('newBooking', { name: b.name, time: b.time })); }
      });
    }
    if (['pf-orders', 'pf-bookings', 'pf-menu-overrides'].includes(key)) {
      // не перерисовываем, пока человек вводит цену
      if (document.activeElement && document.activeElement.matches('.price-in')) { counters(); return; }
      render();
    }
  });
  PF.on('lang', () => { if (!app.hidden) render(); });

  if (authed) showApp(); else setTimeout(() => $('#pw').focus(), 300);
})();
