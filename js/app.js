/* =========================================================
   Performance — логика сайта
   Без библиотек: чистый JavaScript.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // localStorage может быть недоступен (приватный режим) — оборачиваем
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ничего */ }
    }
  };

  /* ================= ДАННЫЕ ================= */

  const CATS = [
    { id: 'breakfast', name: 'Завтраки', bg: '#F1DDB0' },
    { id: 'tatar', name: 'Татарская кухня', bg: '#F3CDD2' },
    { id: 'hot', name: 'Горячее', bg: '#CDE5DC' },
    { id: 'dessert', name: 'Десерты', bg: '#F4E4CB' },
    { id: 'drinks', name: 'Кофе и чай', bg: '#DCD1C6' }
  ];

  const MENU = [
    { id: 'syrniki', cat: 'breakfast', name: 'Сырники с облепихой', desc: 'Три сырника из фермерского творога, сметана и облепиховый соус.', weight: '240 г', price: 390, art: 'syrniki', tag: 'Хит' },
    { id: 'shakshuka', cat: 'breakfast', name: 'Шакшука', desc: 'Яйца в томатах с перцем и зирой. Подаём прямо на сковороде, с тёплой лепёшкой.', weight: '320 г', price: 420, art: 'shakshuka' },
    { id: 'polba', cat: 'breakfast', name: 'Каша из полбы с грушей', desc: 'На миндальном молоке, с печёной грушей и фундуком.', weight: '280 г', price: 320, art: 'porridge', veg: true },
    { id: 'croissant', cat: 'breakfast', name: 'Круассан с лососем', desc: 'Слоёный круассан, слабосолёный лосось, крем-сыр и шпинат.', weight: '210 г', price: 490, art: 'croissant' },

    { id: 'echpochmak', cat: 'tatar', name: 'Эчпочмак с бульоном', desc: 'Треугольный пирожок с говядиной и картофелем. Бульон приносим отдельно: его наливают прямо внутрь.', weight: '230 г', price: 290, art: 'echpochmak', tag: 'Хит' },
    { id: 'gubadia', cat: 'tatar', name: 'Губадия', desc: 'Праздничный пирог с рисом, изюмом, яйцом и кортом — сладким топлёным творогом.', weight: '180 г', price: 350, art: 'gubadia' },
    { id: 'kystybyi', cat: 'tatar', name: 'Кыстыбый', desc: 'Две тонкие лепёшки с картофельным пюре и топлёным маслом.', weight: '220 г', price: 260, art: 'kystybyi', veg: true },
    { id: 'tokmach', cat: 'tatar', name: 'Токмач', desc: 'Куриный суп с лапшой ручной нарезки, как дома у бабушки.', weight: '350 мл', price: 340, art: 'tokmach' },
    { id: 'belish', cat: 'tatar', name: 'Бэлиш с уткой', desc: 'Большой закрытый пирог с утиным мясом и картофелем, томлёный в печи.', weight: '300 г', price: 450, art: 'belish', tag: 'Новинка' },

    { id: 'stroganoff', cat: 'hot', name: 'Бефстроганов с пюре', desc: 'Говяжья вырезка в сливочном соусе, картофельное пюре и хрустящие огурчики.', weight: '330 г', price: 590, art: 'stroganoff' },
    { id: 'cod', cat: 'hot', name: 'Треска с печёным перцем', desc: 'Филе трески, перец рамиро и соус из жёлтых томатов.', weight: '290 г', price: 620, art: 'cod' },
    { id: 'risotto', cat: 'hot', name: 'Ризотто с белыми грибами', desc: 'Сливочное ризотто с белыми грибами и пармезаном.', weight: '300 г', price: 540, art: 'risotto', veg: true },

    { id: 'chakchak', cat: 'dessert', name: 'Чак-чак с липовым мёдом', desc: 'Хрустящее тесто в горячем мёде, собираем горкой при вас.', weight: '150 г', price: 250, art: 'chakchak', tag: 'Хит' },
    { id: 'talkysh', cat: 'dessert', name: 'Талкыш калеве', desc: 'Воздушная сахарная сладость, которая тает во рту. Готовим сами.', weight: '100 г', price: 280, art: 'talkysh' },
    { id: 'medovik', cat: 'dessert', name: 'Медовик', desc: 'Восемь тонких медовых коржей и нежный сметанный крем.', weight: '160 г', price: 310, art: 'medovik' },

    { id: 'flatwhite', cat: 'drinks', name: 'Флэт уайт', desc: 'Двойной эспрессо и бархатное молоко.', weight: '200 мл', price: 220, art: 'latte' },
    { id: 'raf', cat: 'drinks', name: 'Раф с чак-чаком', desc: 'Сливочный раф с мёдом и крошкой чак-чака сверху.', weight: '300 мл', price: 290, art: 'raf', tag: 'Новинка' },
    { id: 'tea', cat: 'drinks', name: 'Татарский чай с душицей', desc: 'Чайник чёрного чая с душицей и молоком. Хватит на двоих.', weight: '600 мл', price: 350, art: 'tea' },
    { id: 'cocoa', cat: 'drinks', name: 'Какао с маршмеллоу', desc: 'Густое какао на цельном молоке.', weight: '300 мл', price: 240, art: 'cocoa' }
  ];

  // weekday: 0 — воскресенье, 1 — понедельник …
  const EVENTS = [
    { weekday: 3, day: 'Среда', time: '19:30', title: 'Короткий метр', text: 'Показываем фильмы молодых казанских режиссёров, после — разговор с авторами.', color: '#1F6662', icon: 'film' },
    { weekday: 4, day: 'Четверг', time: '20:00', title: 'Чайная церемония', text: 'Пять сортов чая, травы из Предволжья и татарские сладости к каждому.', color: '#D4A955', light: true, icon: 'cup' },
    { weekday: 5, day: 'Пятница', time: '20:00', title: 'Джаз у сцены', text: 'Фортепианное трио играет стандарты и татарские мелодии в джазовой обработке.', color: '#B8324B', icon: 'note' },
    { weekday: 6, day: 'Суббота', time: '19:00', title: 'Открытый микрофон', text: 'Стендап, стихи и песни. Записаться выступить можно у бара до 18:30.', color: '#A8D8CB', light: true, icon: 'mic' },
    { weekday: 0, day: 'Воскресенье', time: '12:00', title: 'Семейный бранч', text: 'Мастер-класс по чак-чаку для детей, пока взрослые спокойно завтракают.', color: '#EEF2EE', light: true, icon: 'tulip' }
  ];

  const FAQ = [
    { q: 'Можно прийти с детьми?', a: 'Конечно. Есть детские стулья, раскраски и небольшое детское меню. По воскресеньям в 12:00 проводим мастер-класс по чак-чаку.' },
    { q: 'Есть блюда без мяса?', a: 'Да, в меню они отмечены листиком. Кыстыбый, каша из полбы и ризотто подходят вегетарианцам, а сырники можно заказать без сметаны.' },
    { q: 'Можно с собакой?', a: 'Можно с небольшой собакой на поводке. Попросите у официанта миску с водой.' },
    { q: 'Вы проводите дни рождения и банкеты?', a: 'Да, зал вмещает до 60 гостей. Напишите пожелания в форме брони или позвоните, и мы подберём меню и программу.' },
    { q: 'Как работает бронь?', a: 'Выберите дату и время в форме ниже. Стол держим 15 минут после назначенного времени, потом можем отдать гостям без брони.' },
    { q: 'Где оставить машину?', a: 'Улица Баумана пешеходная. Ближайшие парковки на улице Пушкина и у ЦУМа, от них 3–5 минут пешком.' }
  ];

  /* ================= РИСУНКИ БЛЮД (SVG) ================= */

  // Псевдослучайные числа с зерном — чтобы рисунок был одинаковым при каждой загрузке
  function rng(seed) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  const BASE = {
    plate: '<circle cx="100" cy="108" r="86" fill="rgba(14,35,34,.12)"/><circle cx="100" cy="100" r="86" fill="#fff"/><circle cx="100" cy="100" r="68" fill="none" stroke="#E6EAE5" stroke-width="2"/>',
    bowl: '<circle cx="100" cy="108" r="80" fill="rgba(14,35,34,.12)"/><circle cx="100" cy="100" r="80" fill="#fff"/><circle cx="100" cy="100" r="66" fill="#F4F4F0"/>',
    cup: '<circle cx="100" cy="108" r="84" fill="rgba(14,35,34,.12)"/><circle cx="100" cy="100" r="84" fill="#fff"/><circle cx="100" cy="100" r="66" fill="none" stroke="#E6EAE5" stroke-width="2"/><rect x="138" y="90" width="34" height="20" rx="10" fill="#fff" stroke="#E6EAE5" stroke-width="3"/><circle cx="100" cy="100" r="50" fill="#fff" stroke="#E6EAE5" stroke-width="3"/>',
    pan: '<circle cx="96" cy="108" r="80" fill="rgba(14,35,34,.14)"/><rect x="160" y="92" width="50" height="16" rx="8" fill="#2A302E"/><circle cx="96" cy="100" r="78" fill="#2F3634"/><circle cx="96" cy="100" r="68" fill="#3A4240"/>'
  };

  function scatter(seed, n, r, cx, cy, fn) {
    const rand = rng(seed); let out = '';
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r;
      out += fn(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rand, i);
    }
    return out;
  }

  const ART = {
    syrniki: ['plate', () => {
      const c = (x, y) => `<circle cx="${x}" cy="${y}" r="27" fill="#D08A36"/><circle cx="${x - 2}" cy="${y - 2}" r="21" fill="#E7B566"/>`;
      return c(78, 88) + c(120, 82) + c(98, 122) +
        '<path d="M130 118c8-6 22-2 22 10s-14 16-22 10-8-14 0-20Z" fill="#FFFDF7"/>' +
        '<circle cx="60" cy="126" r="6" fill="#F08A24"/><circle cx="70" cy="138" r="5" fill="#F08A24"/><circle cx="56" cy="113" r="4" fill="#F08A24"/><circle cx="142" cy="146" r="4" fill="#F08A24"/>';
    }],
    shakshuka: ['pan', () =>
      '<circle cx="96" cy="100" r="62" fill="#C8452F"/><circle cx="76" cy="130" r="10" fill="#D85A3E"/><circle cx="128" cy="76" r="12" fill="#B23C28"/>' +
      '<path d="M60 90c0-14 14-22 26-18s18 16 12 26-24 14-32 8-6-10-6-16Z" fill="#FFFDF7"/><circle cx="78" cy="88" r="9" fill="#F4B01E"/>' +
      '<path d="M104 116c2-12 16-18 26-12s12 20 4 26-22 6-27 0-4-8-3-14Z" fill="#FFFDF7"/><circle cx="120" cy="118" r="8.5" fill="#F4B01E"/>' +
      scatter(7, 14, 58, 96, 100, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#5E9B4B"/>`)],
    porridge: ['bowl', () =>
      '<circle cx="100" cy="100" r="62" fill="#EAD7AE"/>' +
      '<g fill="#E6CC72" stroke="#C9A94E" stroke-width="2"><ellipse cx="86" cy="84" rx="26" ry="10" transform="rotate(-30 86 84)"/><ellipse cx="112" cy="92" rx="26" ry="10" transform="rotate(20 112 92)"/><ellipse cx="96" cy="112" rx="26" ry="10" transform="rotate(-8 96 112)"/></g>' +
      scatter(3, 9, 50, 100, 104, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#9A6A3A"/>`)],
    croissant: ['plate', () =>
      '<ellipse cx="104" cy="128" rx="44" ry="18" fill="#F08F72"/><ellipse cx="96" cy="134" rx="30" ry="10" fill="#F7B19C"/>' +
      '<path d="M44 104C60 50 140 50 156 104c-12-8-20-8-26-4-6-14-18-20-30-20s-24 6-30 20c-6-4-14-4-26 4Z" fill="#D08A36"/>' +
      '<path d="M70 100c6-14 18-20 30-20s24 6 30 20" fill="none" stroke="#A9661F" stroke-width="3"/><path d="M84 66l4 18M116 66l-4 18M100 62v18" stroke="#A9661F" stroke-width="3"/>' +
      '<circle cx="62" cy="136" r="9" fill="#4F8A3D"/><circle cx="144" cy="138" r="8" fill="#4F8A3D"/>'],
    echpochmak: ['plate', () =>
      '<path d="M100 46L154 138Q100 156 46 138Z" fill="#C97F30" stroke="#C97F30" stroke-width="16" stroke-linejoin="round"/>' +
      '<path d="M100 60L144 134Q100 146 56 134Z" fill="#E1A052" stroke="#E1A052" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M100 60v36M144 134l-32-20M56 134l32-20" stroke="#B46E24" stroke-width="3" stroke-dasharray="5 5"/>' +
      '<circle cx="100" cy="108" r="11" fill="#7A4516"/><circle cx="100" cy="108" r="6" fill="#5B3210"/>'],
    gubadia: ['plate', () =>
      '<path d="M52 128L148 128L132 74L68 74Z" fill="#C97F30"/>' +
      '<rect x="62" y="80" width="76" height="12" fill="#F2EAD6"/><rect x="59" y="92" width="82" height="10" fill="#EFC96A"/>' +
      '<rect x="56" y="102" width="88" height="10" fill="#D59A5E"/><rect x="54" y="112" width="92" height="10" fill="#F2EAD6"/>' +
      scatter(11, 8, 36, 100, 100, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${clamp(y, 84, 118).toFixed(1)}" r="3" fill="#6B2F3A"/>`) +
      '<path d="M62 74Q100 60 138 74" fill="none" stroke="#B06A22" stroke-width="6" stroke-linecap="round"/>'],
    kystybyi: ['plate', () =>
      '<g transform="rotate(-18 100 100)"><path d="M46 112a54 54 0 0 1 108 0Z" fill="#EDCB8A"/><path d="M50 112h100" stroke="#F4D46A" stroke-width="8" stroke-linecap="round"/></g>' +
      '<g transform="rotate(162 100 104)"><path d="M52 112a48 48 0 0 1 96 0Z" fill="#E4BD77"/><path d="M56 112h88" stroke="#F4D46A" stroke-width="7" stroke-linecap="round"/></g>' +
      scatter(5, 10, 40, 100, 100, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#C9954A" opacity=".6"/>`)],
    tokmach: ['bowl', () =>
      '<circle cx="100" cy="100" r="62" fill="#EAC468"/><circle cx="84" cy="86" r="14" fill="#F2D68C" opacity=".7"/>' +
      '<g fill="none" stroke="#FFF6E0" stroke-width="5" stroke-linecap="round"><path d="M60 90q10-8 20 0t20 0 20 0"/><path d="M70 116q10-8 20 0t20 0 20 0"/><path d="M84 138q8-6 16 0t16 0"/><path d="M92 66q8-6 16 0t16 0"/></g>' +
      '<g fill="#F5E6C6"><rect x="112" y="92" width="16" height="12" rx="3"/><rect x="72" y="100" width="14" height="11" rx="3"/></g>' +
      scatter(9, 12, 54, 100, 100, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#4F8A3D"/>`)],
    belish: ['plate', () => {
      let rim = '';
      for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; rim += `<circle cx="${(100 + Math.cos(a) * 58).toFixed(1)}" cy="${(100 + Math.sin(a) * 58).toFixed(1)}" r="7" fill="#B8702A"/>`; }
      return rim + '<circle cx="100" cy="100" r="56" fill="#C98233"/><circle cx="100" cy="100" r="46" fill="#DB9A4D"/><circle cx="92" cy="90" r="18" fill="#E6AE64" opacity=".7"/><circle cx="100" cy="100" r="9" fill="#6E3E14"/>';
    }],
    stroganoff: ['plate', () =>
      '<ellipse cx="116" cy="102" rx="44" ry="38" fill="#E7CFA4"/>' +
      '<path d="M50 96c0-20 16-30 30-28s26 14 24 30-16 26-30 24-24-10-24-26Z" fill="#FBF3DD"/><circle cx="76" cy="94" r="7" fill="#F4D46A"/>' +
      '<g fill="#8A4A2A">' + [[104, 84, 20], [124, 92, -30], [110, 108, 60], [134, 112, 10], [118, 124, -50], [140, 88, 40]].map(([x, y, r]) => `<rect x="${x - 14}" y="${y - 4}" width="28" height="9" rx="4.5" transform="rotate(${r} ${x} ${y})"/>`).join('') + '</g>' +
      '<g fill="#7FA24A"><circle cx="72" cy="136" r="7"/><circle cx="88" cy="142" r="6"/></g>'],
    cod: ['plate', () =>
      '<ellipse cx="100" cy="104" rx="62" ry="46" fill="#F2C94C"/>' +
      '<path d="M58 96c10-22 60-26 84-8 6 6 4 18-6 24-26 14-66 12-78-2-3-4-3-9 0-14Z" fill="#FAF3EC"/>' +
      '<g fill="none" stroke="#EAD8CC" stroke-width="3"><path d="M78 84c4 8 4 18-2 26"/><path d="M98 82c4 8 4 20-2 28"/><path d="M118 84c4 8 4 18-2 26"/></g>' +
      '<path d="M60 132c14 10 36 12 48 4-12 0-30-2-48-4Z" fill="#D2412C"/><path d="M118 138c14 2 26-4 30-14-8 8-18 12-30 14Z" fill="#D2412C"/>' +
      '<circle cx="146" cy="84" r="5" fill="#4F8A3D"/><circle cx="54" cy="116" r="4" fill="#4F8A3D"/>'],
    risotto: ['bowl', () =>
      '<circle cx="100" cy="100" r="62" fill="#EFE0BC"/>' +
      scatter(13, 70, 56, 100, 100, (x, y, r) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4" ry="2" fill="#FBF5E4" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`) +
      [[82, 86], [118, 90], [98, 118]].map(([x, y]) => `<path d="M${x - 14} ${y}a14 12 0 0 1 28 0Z" fill="#8A5A33"/><rect x="${x - 5}" y="${y}" width="10" height="12" rx="3" fill="#EAD6B3"/>`).join('') +
      '<g fill="#F7E9A8"><rect x="126" y="112" width="12" height="4" rx="1"/><rect x="70" y="112" width="10" height="4" rx="1" transform="rotate(30 75 114)"/></g>'],
    chakchak: ['plate', () =>
      scatter(21, 75, 54, 100, 102, (x, y, r) => {
        const w = 8 + r() * 6;
        return `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - 3.5).toFixed(1)}" width="${w.toFixed(1)}" height="7" rx="3.5" fill="${r() > .5 ? '#E3A548' : '#CE8B2C'}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      }) +
      '<path d="M58 80c20 10 30-6 46 4s24 14 40 0" fill="none" stroke="#F5BE3D" stroke-width="5" stroke-linecap="round" opacity=".85"/>' +
      '<g fill="#8C5A2B"><circle cx="90" cy="96" r="3"/><circle cx="116" cy="112" r="3"/><circle cx="104" cy="78" r="3"/></g>'],
    talkysh: ['plate', () =>
      scatter(31, 18, 40, 100, 100, (x, y, r) =>
        `<rect x="${(x - 14).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="28" height="12" rx="6" fill="#FFF8EA" stroke="#E7D4AE" stroke-width="2" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`)],
    medovik: ['plate', () => {
      let s = '';
      for (let i = 0; i < 8; i++) s += `<rect x="${60 + i * .5}" y="${72 + i * 7}" width="${80 - i}" height="4" fill="#F7E8CC"/>`;
      return '<path d="M56 128L144 128L140 70L60 70Z" fill="#C4843A"/>' + s +
        '<path d="M60 70L140 70L146 64L66 64Z" fill="#D9A460"/>' +
        scatter(17, 16, 30, 100, 66, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${clamp(y, 60, 68).toFixed(1)}" r="2.4" fill="#A86A2A"/>`);
    }],
    latte: ['cup', () =>
      '<circle cx="100" cy="100" r="40" fill="#9A6440"/>' +
      '<path d="M100 122c-18-10-26-20-26-30 0-8 6-12 12-12 6 0 10 4 14 8 4-4 8-8 14-8 6 0 12 4 12 12 0 10-8 20-26 30Z" fill="#F6E9D8"/>' +
      '<path d="M100 114c-10-6-14-12-14-18" fill="none" stroke="#C99A72" stroke-width="2"/>'],
    raf: ['cup', () =>
      '<circle cx="100" cy="100" r="40" fill="#EFD9B6"/>' +
      '<path d="M76 104c8-18 30-24 44-10s-4 28-18 20-6-20 6-14" fill="none" stroke="#E7B24A" stroke-width="4" stroke-linecap="round"/>' +
      scatter(41, 12, 30, 100, 100, (x, y) => `<rect x="${(x - 3).toFixed(1)}" y="${(y - 2).toFixed(1)}" width="6" height="4" rx="2" fill="#C97F30"/>`)],
    tea: ['cup', () =>
      '<circle cx="100" cy="100" r="40" fill="#B5541F"/><circle cx="92" cy="92" r="16" fill="#CB6E2E" opacity=".7"/><ellipse cx="86" cy="86" rx="8" ry="4" fill="#F0A36B" opacity=".6" transform="rotate(-30 86 86)"/>' +
      '<g fill="#6E9A4E"><ellipse cx="44" cy="150" rx="9" ry="4.5" transform="rotate(-30 44 150)"/><ellipse cx="56" cy="160" rx="8" ry="4" transform="rotate(20 56 160)"/><ellipse cx="40" cy="138" rx="7" ry="3.5" transform="rotate(60 40 138)"/></g>' +
      '<g fill="#B886C8"><circle cx="52" cy="146" r="2.5"/><circle cx="48" cy="156" r="2"/></g>'],
    cocoa: ['cup', () =>
      '<circle cx="100" cy="100" r="40" fill="#5A3322"/>' +
      '<g transform="rotate(12 100 100)"><rect x="80" y="82" width="16" height="16" rx="5" fill="#FFF8F0"/><rect x="102" y="86" width="16" height="16" rx="5" fill="#F7C9D2"/><rect x="88" y="104" width="16" height="16" rx="5" fill="#FFF8F0"/><rect x="110" y="106" width="14" height="14" rx="5" fill="#F7C9D2"/></g>']
  };

  const artCache = {};
  function art(key) {
    if (artCache[key]) return artCache[key];
    const [base, fn] = ART[key];
    const inner = typeof fn === 'function' ? fn() : fn;
    return (artCache[key] = `<svg viewBox="0 0 220 200" aria-hidden="true"><g transform="translate(10 0)">${BASE[base]}${inner}</g></svg>`);
  }

  const EVENT_ICONS = {
    film: '<svg class="event__icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="28" r="9"/><circle cx="50" cy="72" r="9"/><circle cx="28" cy="50" r="9"/><circle cx="72" cy="50" r="9"/></svg>',
    cup: '<svg class="event__icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><path d="M18 40h56v14a28 28 0 0 1-56 0Z"/><path d="M74 46h6a10 10 0 0 1 0 20h-8"/><path d="M36 30c-4-6 4-8 0-16M52 30c-4-6 4-8 0-16"/></svg>',
    note: '<svg class="event__icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><path d="M36 76V24l44-10v52"/><circle cx="26" cy="76" r="10"/><circle cx="70" cy="66" r="10"/></svg>',
    mic: '<svg class="event__icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><rect x="36" y="10" width="28" height="48" rx="14"/><path d="M24 44a26 26 0 0 0 52 0M50 70v20M36 90h28"/></svg>',
    tulip: '<svg class="event__icon" viewBox="0 0 40 40" style="color:inherit"><use href="#tulip"/></svg>'
  };

  /* ================= ЗАНАВЕС И ПЕРВЫЙ ЭКРАН ================= */

  const hero = $('#hero');
  const curtain = $('.curtain');

  // Разбиваем заголовок на буквы, чтобы они выезжали по очереди
  $$('.hero__title .line, .footer__word').forEach((line, li) => {
    if (line.classList.contains('footer__word')) li = 0;
    const text = line.textContent;
    line.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      s.style.transitionDelay = (0.05 + li * 0.18 + i * 0.045) + 's';
      line.appendChild(s);
    });
  });

  function startHero() { hero.classList.add('play'); }

  let seenCurtain = false;
  try { seenCurtain = sessionStorage.getItem('curtain') === '1'; } catch (e) { /* ничего */ }

  if (reduceMotion || seenCurtain) {
    curtain.classList.add('gone');
    requestAnimationFrame(startHero);
  } else {
    const openCurtain = () => {
      curtain.classList.add('open');
      setTimeout(startHero, 450);
      setTimeout(() => curtain.classList.add('gone'), 1400);
      try { sessionStorage.setItem('curtain', '1'); } catch (e) { /* ничего */ }
    };
    // ждём шрифты, но не дольше 900 мс
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(r => setTimeout(r, 900))]).then(() => setTimeout(openCurtain, 350));
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
  (function openStatus() {
    const el = $('#open-status');
    try {
      const parts = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      const h = +parts.find(p => p.type === 'hour').value;
      const isOpen = h >= 8 && h < 23;
      el.textContent = isOpen ? 'Сейчас открыто, до 23:00' : 'Сейчас закрыто, откроемся в 8:00';
      el.parentElement.classList.toggle('closed', !isOpen);
    } catch (e) { /* оставляем текст по умолчанию */ }
  })();

  /* ================= ШАПКА И ПРОКРУТКА ================= */

  const topbar = $('.topbar');
  const progressBar = $('.progress span');
  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    topbar.classList.toggle('is-solid', y > 40);
    if (!openLayer) topbar.classList.toggle('is-hidden', y > lastY && y > 300);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    updateWords();
    updateProgram();
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); }
  }, { passive: true });

  // Появление элементов при прокрутке
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;
  function watchReveal(root = document) {
    $$('[data-reveal], .h-reveal, .footer__word', root).forEach(el => io ? io.observe(el) : el.classList.add('in'));
  }

  // Текст «О нас» подсвечивается по словам
  const wordsEl = $('[data-words]');
  let words = [];
  if (wordsEl) {
    const txt = wordsEl.textContent.trim().split(/\s+/);
    wordsEl.innerHTML = txt.map(w => `<span class="w">${w}</span>`).join(' ');
    words = $$('.w', wordsEl);
    if (reduceMotion) document.body.classList.add('no-words');
  }
  function updateWords() {
    if (!words.length || reduceMotion) return;
    const r = wordsEl.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }

  /* ================= МЕНЮ ================= */

  const tabsEl = $('.tabs');
  const pill = $('.tabs__pill');
  const dishesEl = $('#dishes');
  let currentCat = CATS[0].id;
  const catBg = Object.fromEntries(CATS.map(c => [c.id, c.bg]));

  CATS.forEach(c => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.cat = c.id;
    b.textContent = c.name;
    b.setAttribute('aria-selected', c.id === currentCat);
    tabsEl.appendChild(b);
  });

  function movePill() {
    const active = $('.tab[aria-selected="true"]', tabsEl);
    if (!active) return;
    pill.style.width = active.offsetWidth + 'px';
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function renderDishes() {
    const list = MENU.filter(d => d.cat === currentCat);
    dishesEl.innerHTML = list.map((d, i) => `
      <button class="dish" type="button" data-id="${d.id}" style="--i:${i}">
        <div class="dish__art" style="--bg:${catBg[d.cat]}">
          ${art(d.art)}
          ${d.tag ? `<span class="dish__tag ${d.tag === 'Новинка' ? 'dish__tag--new' : ''}">${d.tag}</span>` : ''}
          ${d.veg ? '<span class="dish__veg" title="Без мяса" aria-label="Без мяса">🌿</span>' : ''}
        </div>
        <div class="dish__body">
          <span class="dish__name">${d.name}</span>
          <span class="dish__desc">${d.desc}</span>
          <span class="dish__foot">
            <span class="dish__price">${rub(d.price)}<small>${d.weight}</small></span>
            <span class="add-btn" data-add="${d.id}" role="presentation">+</span>
          </span>
        </div>
      </button>`).join('');
  }

  tabsEl.addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t || t.dataset.cat === currentCat) return;
    currentCat = t.dataset.cat;
    $$('.tab', tabsEl).forEach(b => b.setAttribute('aria-selected', b === t));
    t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    movePill();
    dishesEl.classList.add('leaving');
    setTimeout(() => { dishesEl.classList.remove('leaving'); renderDishes(); }, reduceMotion ? 0 : 230);
  });

  dishesEl.addEventListener('click', e => {
    const card = e.target.closest('.dish');
    if (!card) return;
    const id = card.dataset.id;
    if (e.target.closest('[data-add]')) {
      addToCart(id, 1, e.target.closest('[data-add]'));
    } else {
      openDish(id);
    }
  });

  renderDishes();
  movePill();
  window.addEventListener('resize', movePill);
  if (document.fonts) document.fonts.ready.then(movePill);

  /* ================= КАРТОЧКА БЛЮДА ================= */

  let dishId = null, dishQty = 1;
  function openDish(id) {
    const d = MENU.find(x => x.id === id);
    dishId = id; dishQty = 1;
    const cat = CATS.find(c => c.id === d.cat);
    $('#dish-art').style.setProperty('--bg', cat.bg);
    $('#dish-art').innerHTML = art(d.art);
    $('#dish-meta').textContent = `${cat.name}, ${d.weight}${d.veg ? ', без мяса' : ''}`;
    $('#dish-name').textContent = d.name;
    $('#dish-desc').textContent = d.desc;
    updateDishBtn();
    openPanel($('#dish'));
  }
  function updateDishBtn() {
    const d = MENU.find(x => x.id === dishId);
    $('#dish-qty').textContent = dishQty;
    $('#dish-add').textContent = `Добавить за ${rub(d.price * dishQty)}`;
  }
  $('#dish').addEventListener('click', e => {
    const b = e.target.closest('[data-qty]');
    if (!b) return;
    dishQty = clamp(dishQty + +b.dataset.qty, 1, 20);
    updateDishBtn();
  });
  $('#dish-add').addEventListener('click', e => {
    addToCart(dishId, dishQty, e.currentTarget);
    closePanel();
  });

  /* ================= КОРЗИНА ================= */

  let cart = store.get('pf-cart', {});
  // убираем то, чего больше нет в меню
  Object.keys(cart).forEach(id => { if (!MENU.some(d => d.id === id)) delete cart[id]; });

  const cartBtn = $('.cart-btn');
  const cartCount = $('.cart-count');

  function cartTotal() { return Object.entries(cart).reduce((s, [id, q]) => s + MENU.find(d => d.id === id).price * q, 0); }
  function cartItems() { return Object.values(cart).reduce((a, b) => a + b, 0); }

  function renderCart() {
    const ids = Object.keys(cart);
    const count = cartItems();
    cartCount.hidden = count === 0;
    cartCount.textContent = count;
    cartBtn.setAttribute('aria-label', count ? `Корзина, товаров: ${count}` : 'Корзина');
    $('#cart-empty').hidden = ids.length > 0;
    $('#cart-foot').hidden = ids.length === 0;
    $('#cart-total').textContent = rub(cartTotal());
    $('#cart-list').innerHTML = ids.map(id => {
      const d = MENU.find(x => x.id === id);
      return `<li class="cart-item" data-id="${id}">
        <div class="cart-item__art" style="--bg:${catBg[d.cat]}">${art(d.art)}</div>
        <div><div class="cart-item__name">${d.name}</div><div class="cart-item__price">${rub(d.price * cart[id])}</div></div>
        <div class="stepper" role="group" aria-label="Количество: ${d.name}">
          <button type="button" data-cq="-1" aria-label="Меньше">−</button><output>${cart[id]}</output><button type="button" data-cq="1" aria-label="Больше">+</button>
        </div>
      </li>`;
    }).join('');
    store.set('pf-cart', cart);
  }

  function addToCart(id, qty, fromEl) {
    cart[id] = (cart[id] || 0) + qty;
    const d = MENU.find(x => x.id === id);
    flyToCart(fromEl, () => {
      renderCart();
      cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    });
    toast(`${d.name}: в корзине`);
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
    const anim = dot.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)` },
      { transform: `translate(${mx}px, ${my}px) scale(1.3)`, offset: 0.5 },
      { transform: `translate(${x1}px, ${y1}px) scale(.4)` }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.5,1)' });
    dot.style.left = '0'; dot.style.top = '0';
    anim.onfinish = () => { dot.remove(); done(); };
  }

  $('#cart-list').addEventListener('click', e => {
    const b = e.target.closest('[data-cq]');
    if (!b) return;
    const id = b.closest('.cart-item').dataset.id;
    cart[id] += +b.dataset.cq;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  });

  $('#checkout').addEventListener('click', () => {
    const mins = +$('#pickup').value;
    const t = new Date(Date.now() + mins * 60000);
    const hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0');
    const num = Math.floor(100 + Math.random() * 900);
    const total = cartTotal();
    cart = {};
    renderCart();
    showDone('Заказ принят', `Номер заказа ${num}, сумма ${rub(total)}. Заберите его у бара примерно в ${hh}:${mm}.`);
  });

  renderCart();

  /* ================= ПРОГРАММА ================= */

  const program = $('#program');
  const track = $('#events');
  const pin = $('.program__pin');

  track.innerHTML = EVENTS.map(ev => `
    <article class="event ${ev.light ? 'event--light' : ''}" style="--c:${ev.color}">
      ${EVENT_ICONS[ev.icon]}
      <div class="event__day">${ev.day}</div>
      <div class="event__time">в ${ev.time}</div>
      <h3>${ev.title}</h3>
      <p>${ev.text}</p>
      <button class="btn" type="button" data-book-weekday="${ev.weekday}" data-book-time="${ev.time}">Забронировать вечер</button>
    </article>`).join('');

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

  // На телефоне ленту можно тянуть мышью на ПК без пина
  track.addEventListener('click', e => {
    const b = e.target.closest('[data-book-weekday]');
    if (!b) return;
    presetBooking(+b.dataset.bookWeekday, b.dataset.bookTime);
  });

  /* ================= ВОПРОСЫ ================= */

  $('#faq-list').innerHTML = FAQ.map((f, i) => `
    <div class="qa">
      <button class="qa__q" type="button" aria-expanded="false" aria-controls="qa-${i}">${f.q}<span class="qa__icon" aria-hidden="true"></span></button>
      <div class="qa__a" id="qa-${i}" role="region"><div><p>${f.a}</p></div></div>
    </div>`).join('');

  $('#faq-list').addEventListener('click', e => {
    const q = e.target.closest('.qa__q');
    if (!q) return;
    const item = q.parentElement;
    const open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    q.setAttribute('aria-expanded', open);
  });

  /* ================= БРОНЬ ================= */

  const form = $('#booking-form');
  const dateInput = $('#b-date');
  const timesEl = $('#b-times');
  const phoneInput = $('#b-phone');
  let guests = 2, selTime = null;

  const pad2 = n => String(n).padStart(2, '0');
  const isoDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const today = new Date();
  const maxDay = new Date(); maxDay.setDate(maxDay.getDate() + 30);
  dateInput.min = isoDate(today);
  dateInput.max = isoDate(maxDay);
  dateInput.value = isoDate(today);

  const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '19:30', '20:00', '21:00', '22:00'];

  function renderTimes() {
    const isToday = dateInput.value === isoDate(new Date());
    const now = new Date();
    timesEl.innerHTML = SLOTS.map(t => {
      const [h, m] = t.split(':').map(Number);
      const past = isToday && (h * 60 + m) <= (now.getHours() * 60 + now.getMinutes() + 30);
      if (past && selTime === t) selTime = null;
      return `<button type="button" class="chip" data-time="${t}" aria-pressed="${selTime === t}" ${past ? 'disabled' : ''}>${t}</button>`;
    }).join('');
  }
  dateInput.addEventListener('change', () => { clearError(dateInput.closest('.field')); renderTimes(); });
  timesEl.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c || c.disabled) return;
    selTime = c.dataset.time;
    $$('.chip', timesEl).forEach(x => x.setAttribute('aria-pressed', x === c));
    clearError(timesEl.closest('.field'));
  });
  renderTimes();

  form.addEventListener('click', e => {
    const s = e.target.closest('[data-step]');
    if (!s) return;
    guests = clamp(guests + +s.dataset.step, 1, 12);
    $('#b-guests').textContent = guests;
  });

  // Маска телефона: +7 (999) 123-45-67
  phoneInput.addEventListener('input', () => {
    let d = phoneInput.value.replace(/\D/g, '');
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
    phoneInput.value = out;
    clearError(phoneInput.closest('.field'));
  });
  $('#b-name').addEventListener('input', e => clearError(e.target.closest('.field')));

  function setError(field, msg) { field.classList.add('error'); $('.field__error', field).textContent = msg; }
  function clearError(field) { field.classList.remove('error'); const s = $('.field__error', field); if (s) s.textContent = ''; }

  const fmtDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  const guestsWord = n => n % 10 === 1 && n % 100 !== 11 ? 'гость' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'гостя' : 'гостей');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    const mark = (field, msg) => { setError(field, msg); firstBad = firstBad || field; };

    if (!dateInput.value || dateInput.value < dateInput.min || dateInput.value > dateInput.max) mark(dateInput.closest('.field'), 'Выберите дату в ближайшие 30 дней.');
    if (!selTime) mark(timesEl.closest('.field'), 'Выберите время.');
    const name = $('#b-name').value.trim();
    if (name.length < 2) mark($('#b-name').closest('.field'), 'Напишите имя, чтобы мы знали, кого встречать.');
    if (phoneInput.value.replace(/\D/g, '').length !== 11) mark(phoneInput.closest('.field'), 'Введите номер полностью: +7 и 10 цифр.');

    if (firstBad) { firstBad.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); return; }

    const zone = form.zone.value;
    const b = { id: Date.now(), date: dateInput.value, time: selTime, guests, zone, name };
    const list = store.get('pf-bookings', []);
    list.push(b);
    store.set('pf-bookings', list);
    renderBookings();

    showDone('Стол забронирован', `${name}, ждём вас ${fmtDate(b.date)} в ${b.time}. ${guests} ${guestsWord(guests)}, ${zone}.`);
    form.reset();
    dateInput.value = isoDate(new Date());
    guests = 2; $('#b-guests').textContent = 2; selTime = null; renderTimes();
  });

  function renderBookings() {
    const box = $('#my-bookings');
    const todayIso = isoDate(new Date());
    const list = store.get('pf-bookings', []).filter(b => b.date >= todayIso).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    box.hidden = !list.length;
    $('ul', box).innerHTML = list.map(b => `<li><span><strong>${fmtDate(b.date)}, ${b.time}</strong><br>${b.guests} ${guestsWord(b.guests)}, ${b.zone}</span><button type="button" data-cancel="${b.id}">Отменить</button></li>`).join('');
  }
  $('#my-bookings').addEventListener('click', e => {
    const b = e.target.closest('[data-cancel]');
    if (!b) return;
    store.set('pf-bookings', store.get('pf-bookings', []).filter(x => String(x.id) !== b.dataset.cancel));
    renderBookings();
    toast('Бронь отменена');
  });
  renderBookings();

  // Кнопка на карточке вечера: ставим ближайший такой день и время
  function presetBooking(weekday, time) {
    const d = new Date();
    const now = d.getHours() * 60 + d.getMinutes();
    const [h, m] = time.split(':').map(Number);
    let add = (weekday - d.getDay() + 7) % 7;
    if (add === 0 && now + 30 >= h * 60 + m) add = 7;
    d.setDate(d.getDate() + add);
    dateInput.value = isoDate(d);
    selTime = time;
    renderTimes();
    const zone = form.querySelector('input[name="zone"][value="у сцены"]');
    if (zone) zone.checked = true;
    $('#booking').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    toast(`Выбрано: ${fmtDate(dateInput.value)}, ${time}`);
  }

  /* ================= КОНТАКТЫ ================= */

  $('#route-link').href = 'https://yandex.ru/maps/?text=' + encodeURIComponent('Казань, улица Баумана, 44');
  $('#year').textContent = new Date().getFullYear();

  /* ================= ПАНЕЛИ (меню, корзина, шторки) ================= */

  const backdrop = $('.backdrop');
  let openLayer = null, lastFocus = null;

  function openPanel(el) {
    if (openLayer === el) return;
    if (openLayer) closePanel(true);
    lastFocus = document.activeElement;
    openLayer = el;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('show');
    document.body.classList.add('locked');
    topbar.classList.remove('is-hidden');
    setTimeout(() => {
      const f = el.querySelector('.close-btn, button, a, input');
      if (f) f.focus({ preventScroll: true });
    }, 80);
  }
  function closePanel(silent) {
    if (!openLayer) return;
    openLayer.classList.remove('open');
    openLayer.setAttribute('aria-hidden', 'true');
    openLayer = null;
    if (silent !== true) {
      backdrop.classList.remove('show');
      document.body.classList.remove('locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
  }

  const PANELS = { nav: $('#nav'), cart: $('#cart'), install: $('#install') };

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) { openPanel(PANELS[opener.dataset.open]); return; }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      const href = closer.getAttribute('href');
      closePanel();
      if (href && href.startsWith('#')) { e.preventDefault(); goTo(href); }
      return;
    }
    // ссылки внутри выдвижного меню сайта
    const navLink = e.target.closest('#nav a[href^="#"]');
    if (navLink) { e.preventDefault(); closePanel(); goTo(navLink.getAttribute('href')); }
  });

  function goTo(hash) {
    const t = $(hash);
    if (t) setTimeout(() => t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }), 150);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
    // держим фокус внутри открытой панели
    if (e.key === 'Tab' && openLayer) {
      const f = $$('button:not([disabled]), a[href], input, select, textarea', openLayer).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Шторку можно смахнуть вниз пальцем
  $$('.sheet').forEach(sheet => {
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
  });

  function showDone(title, text) {
    $('#done-title').textContent = title;
    $('#done-text').textContent = text;
    openPanel($('#done'));
  }

  /* ================= УВЕДОМЛЕНИЯ ================= */

  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ================= ПРИЛОЖЕНИЕ (PWA) ================= */

  let installEvent = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; });
  window.addEventListener('appinstalled', () => { toast('Приложение установлено'); $$('[data-install]').forEach(b => b.hidden = true); });
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    $$('[data-install]').forEach(b => b.hidden = true);
  }
  document.addEventListener('click', async e => {
    if (!e.target.closest('[data-install]')) return;
    if (installEvent) {
      closePanel();
      installEvent.prompt();
      await installEvent.userChoice;
      installEvent = null;
    } else {
      openPanel(PANELS.install);
    }
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ================= СТАРТ ================= */

  setupPin();
  onScroll();
  window.addEventListener('load', setupPin);
})();
