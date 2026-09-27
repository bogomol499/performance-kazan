/* =========================================================
   Performance — рисунки, нарисованные кодом (SVG):
   блюда, иконки вечеров, портреты команды, галерея.
   ========================================================= */
window.PF_ART = (() => {
  'use strict';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

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


  /* ---------- Дополнительные основы для конструктора ---------- */
  ART.eggs = ['plate', () =>
    '<rect x="52" y="64" width="96" height="76" rx="16" fill="#C98A3E"/><rect x="60" y="72" width="80" height="60" rx="12" fill="#E9BE7A"/>' +
    '<path d="M62 92c2-16 22-22 34-14s10 26-4 30-32-2-30-16Z" fill="#FFFDF7"/><circle cx="80" cy="96" r="9" fill="#F4B01E"/>' +
    '<path d="M104 106c2-14 20-20 30-12s8 22-4 26-28-2-26-14Z" fill="#FFFDF7"/><circle cx="118" cy="108" r="8" fill="#F4B01E"/>' +
    '<g fill="#5E9B4B"><circle cx="70" cy="120" r="2.5"/><circle cx="130" cy="84" r="2.5"/><circle cx="96" cy="126" r="2.5"/></g>'];
  ART.croissant0 = ['plate', () =>
    '<path d="M44 112C60 58 140 58 156 112c-12-8-20-8-26-4-6-14-18-20-30-20s-24 6-30 20c-6-4-14-4-26 4Z" fill="#D08A36"/>' +
    '<path d="M70 108c6-14 18-20 30-20s24 6 30 20" fill="none" stroke="#A9661F" stroke-width="3"/><path d="M84 74l4 18M116 74l-4 18M100 70v18" stroke="#A9661F" stroke-width="3"/>'];

  /* ---------- 3D-тарелка для первого экрана (слои) ---------- */
  function plate3d() {
    const L = (z, svg, cls = '') => `<div class="p3d__layer ${cls}" style="--z:${z}px"><svg viewBox="0 0 200 200" aria-hidden="true">${svg}</svg></div>`;
    return L(-30, '<circle cx="100" cy="100" r="92" fill="rgba(0,0,0,.35)"/>', 'p3d__shadow') +
      L(0, '<circle cx="100" cy="100" r="90" fill="#F6F7F4"/><circle cx="100" cy="100" r="90" fill="none" stroke="#DDE3DE" stroke-width="3"/>') +
      L(6, '<circle cx="100" cy="100" r="70" fill="#FFFFFF"/><circle cx="100" cy="100" r="70" fill="none" stroke="#E6EAE5" stroke-width="2"/>') +
      L(14, '<path d="M100 52L148 136Q100 152 52 136Z" fill="#B8712A" stroke="#B8712A" stroke-width="16" stroke-linejoin="round"/>') +
      L(26, '<path d="M100 58L144 132Q100 146 56 132Z" fill="#D08A36" stroke="#D08A36" stroke-width="12" stroke-linejoin="round"/>') +
      L(36, '<path d="M100 66L138 128Q100 140 62 128Z" fill="#E6A857" stroke="#E6A857" stroke-width="8" stroke-linejoin="round"/><path d="M100 70v30M136 126l-28-16M64 126l28-16" stroke="#B46E24" stroke-width="3" stroke-dasharray="5 5"/>') +
      L(44, '<circle cx="100" cy="108" r="11" fill="#7A4516"/><circle cx="100" cy="108" r="6" fill="#5B3210"/>') +
      L(60, '<g fill="#F4F0E6" opacity=".55"><path d="M92 90c-6-10 6-14 0-24" stroke="#F4F0E6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M106 88c-6-10 6-14 0-24" stroke="#F4F0E6" stroke-width="3" fill="none" stroke-linecap="round"/></g>', 'p3d__steam');
  }

  /* ---------- Портреты команды ---------- */
  function avatar(p) {
    const hair = {
      bun: `<circle cx="100" cy="46" r="18" fill="${p.hair}"/><path d="M62 88c0-30 16-46 38-46s38 16 38 46c-8-14-22-22-38-22s-30 8-38 22Z" fill="${p.hair}"/>`,
      short: `<path d="M62 86c-2-30 14-46 38-46s40 14 38 46c-6-16-20-24-38-24s-32 8-38 24Z" fill="${p.hair}"/>`,
      long: `<path d="M56 150c-6-40-2-78 12-94 10-12 22-16 32-16s22 4 32 16c14 16 18 54 12 94l-14-4c4-30 2-56-4-68-6 6-16 10-26 10s-20-4-26-10c-6 12-8 38-4 68Z" fill="${p.hair}"/>`,
      curly: [[70, 64], [84, 50], [100, 44], [116, 50], [130, 64], [136, 80], [64, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${p.hair}"/>`).join(''),
      side: `<path d="M62 84c0-28 16-44 40-44 20 0 36 12 36 34-12-6-30-10-50-6-12 2-20 8-26 16Z" fill="${p.hair}"/>`
    }[p.hairStyle];
    return `<svg viewBox="0 0 200 200" aria-hidden="true">
      <rect width="200" height="200" fill="${p.bg}"/>
      <circle cx="160" cy="40" r="46" fill="rgba(255,255,255,.28)"/>
      <path d="M30 200c6-40 34-62 70-62s64 22 70 62Z" fill="${p.top}"/>
      <rect x="88" y="112" width="24" height="30" rx="10" fill="${p.skin}"/>
      ${p.hairStyle === 'long' ? hair : ''}
      <ellipse cx="100" cy="88" rx="36" ry="40" fill="${p.skin}"/>
      ${p.hairStyle !== 'long' ? hair : `<path d="M64 80c4-24 18-36 36-36s32 12 36 36c-10-10-22-14-36-14s-26 4-36 14Z" fill="${p.hair}"/>`}
      <circle cx="86" cy="92" r="3.5" fill="#1E1A18"/><circle cx="114" cy="92" r="3.5" fill="#1E1A18"/>
      <path d="M88 108q12 10 24 0" stroke="#1E1A18" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="78" cy="104" r="6" fill="#E88C7A" opacity=".35"/><circle cx="122" cy="104" r="6" fill="#E88C7A" opacity=".35"/>
    </svg>`;
  }

  /* ---------- Иллюстрации для галереи ---------- */
  const lamp = (x, len) => `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#D4A955" stroke-width="2"/><circle cx="${x}" cy="${len + 14}" r="60" fill="url(#glow)"/><path d="M${x - 18} ${len + 14}a18 18 0 0 1 36 0Z" fill="#D4A955"/>`;
  const SCENES = {
    hall: () => `
      <rect width="800" height="560" fill="#0F3D3E"/>
      <rect x="0" y="380" width="800" height="180" fill="#0B2E2F"/>
      <rect x="260" y="150" width="280" height="200" fill="#9A2439"/>
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${262 + i * 40}" y="150" width="14" height="200" fill="#7E1C2E"/>`).join('')}
      <rect x="240" y="340" width="320" height="30" fill="#D4A955"/>
      ${lamp(140, 90)}${lamp(400, 60)}${lamp(660, 90)}
      ${[[150, 440], [400, 470], [650, 440]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="90" ry="22" fill="#D4A955"/><rect x="${x - 6}" y="${y}" width="12" height="70" fill="#8C6A2E"/><rect x="${x - 120}" y="${y - 30}" width="26" height="90" rx="8" fill="#16514F"/><rect x="${x + 94}" y="${y - 30}" width="26" height="90" rx="8" fill="#16514F"/>`).join('')}`,
    stage: () => `
      <rect width="800" height="560" fill="#0B1F20"/>
      <path d="M330 0L130 560H670L470 0Z" fill="url(#cone)"/>
      <ellipse cx="400" cy="500" rx="300" ry="40" fill="#D4A955" opacity=".25"/>
      <rect x="170" y="330" width="220" height="110" rx="10" fill="#0E2322"/><rect x="170" y="300" width="220" height="40" rx="10" fill="#1B2F2E"/>
      <rect x="185" y="440" width="12" height="60" fill="#0E2322"/><rect x="365" y="440" width="12" height="60" fill="#0E2322"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${178 + i * 15}" y="320" width="10" height="16" fill="${i % 3 === 1 ? '#0E2322' : '#EEF2EE'}"/>`).join('')}
      <ellipse cx="520" cy="360" rx="44" ry="70" fill="#8C4A2A"/><ellipse cx="520" cy="300" rx="34" ry="44" fill="#8C4A2A"/><rect x="514" y="160" width="12" height="130" fill="#5B3210"/>
      <circle cx="640" cy="420" r="46" fill="#B8324B"/><circle cx="640" cy="420" r="30" fill="#EEF2EE" opacity=".85"/><ellipse cx="700" cy="350" rx="36" ry="8" fill="#D4A955"/>
      <g fill="#E8C77F"><path d="M300 150v-60l40-10v56" stroke="#E8C77F" stroke-width="6" fill="none"/><circle cx="292" cy="152" r="12"/><circle cx="332" cy="140" r="12"/></g>`,
    bar: () => `
      <rect width="800" height="560" fill="#16514F"/>
      ${[110, 200, 290].map(y => `<rect x="60" y="${y}" width="680" height="10" fill="#D4A955"/>`).join('')}
      ${[110, 200, 290].map((y, r) => Array.from({ length: 11 }, (_, i) => { const h = 40 + ((i * 7 + r * 3) % 4) * 8; const c = ['#B8324B', '#A8D8CB', '#E8C77F', '#EEF2EE', '#9A6A3A'][(i + r) % 5]; return `<rect x="${80 + i * 60}" y="${y - h}" width="26" height="${h}" rx="8" fill="${c}"/><rect x="${88 + i * 60}" y="${y - h - 14}" width="10" height="16" rx="3" fill="${c}"/>`; }).join('')).join('')}
      <rect x="0" y="360" width="800" height="200" fill="#0B2E2F"/><rect x="0" y="350" width="800" height="24" fill="#D4A955"/>
      <rect x="520" y="250" width="150" height="100" rx="14" fill="#C9CFCB"/><rect x="540" y="270" width="110" height="30" rx="6" fill="#0E2322"/><circle cx="560" cy="325" r="10" fill="#0E2322"/><circle cx="630" cy="325" r="10" fill="#0E2322"/>
      ${[150, 300, 450].map(x => `<rect x="${x}" y="420" width="10" height="140" fill="#8C6A2E"/><ellipse cx="${x + 5}" cy="420" rx="40" ry="12" fill="#B8324B"/>`).join('')}`,
    latte: () => `
      <rect width="800" height="560" fill="#8C5A33"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${i * 72}" width="800" height="2" fill="#7A4B28"/>`).join('')}
      <ellipse cx="410" cy="300" rx="250" ry="230" fill="rgba(0,0,0,.2)"/>
      <circle cx="400" cy="280" r="240" fill="#F4F4F0"/><circle cx="400" cy="280" r="190" fill="none" stroke="#E0E3DE" stroke-width="4"/>
      <rect x="560" y="250" width="140" height="60" rx="30" fill="#F4F4F0" stroke="#E0E3DE" stroke-width="6"/>
      <circle cx="400" cy="280" r="150" fill="#FFFFFF" stroke="#E0E3DE" stroke-width="6"/><circle cx="400" cy="280" r="126" fill="#9A6440"/>
      <g fill="#F6E9D8"><path d="M400 390c-50-30-66-70-50-110 12 18 30 28 50 30 20-2 38-12 50-30 16 40 0 80-50 110Z"/><path d="M400 300c-26-10-40-40-30-70 10 12 20 18 30 20 10-2 20-8 30-20 10 30-4 60-30 70Z"/><path d="M400 222c-14-6-20-22-14-38 6 8 10 10 14 10s8-2 14-10c6 16 0 32-14 38Z"/><rect x="396" y="380" width="8" height="30" rx="4"/></g>`,
    echpochmak: () => `
      <rect width="800" height="560" fill="#0B2E2F"/>
      <rect x="90" y="90" width="620" height="400" rx="30" fill="#2F3634"/><rect x="110" y="110" width="580" height="360" rx="20" fill="#3A4240"/>
      ${[[220, 200], [400, 200], [580, 200], [220, 370], [400, 370], [580, 370]].map(([x, y]) => `<path d="M${x} ${y - 70}L${x + 70} ${y + 50}Q${x} ${y + 72} ${x - 70} ${y + 50}Z" fill="#C97F30" stroke="#C97F30" stroke-width="20" stroke-linejoin="round"/><path d="M${x} ${y - 52}L${x + 54} ${y + 42}Q${x} ${y + 58} ${x - 54} ${y + 42}Z" fill="#E1A052" stroke="#E1A052" stroke-width="10" stroke-linejoin="round"/><circle cx="${x}" cy="${y + 12}" r="12" fill="#6B3F1E"/>`).join('')}
      <g stroke="#EEF2EE" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35"><path d="M390 60c-14-20 14-26 0-50"/><path d="M420 60c-14-20 14-26 0-50"/></g>`,
    window: () => `
      <rect width="800" height="560" fill="#1B2B4A"/>
      <circle cx="620" cy="110" r="40" fill="#F6E7B0"/>
      <path d="M0 330h120v-120h40v-30h60v150h80v-90l60-40 60 40v90h90v-170h30v-40h20v40h30v170h110v-110h100v150H0Z" fill="#0F2438"/>
      <path d="M520 160c0-40 30-60 30-80 0 20 30 40 30 80Z" fill="#2B7C75"/><rect x="512" y="160" width="76" height="12" fill="#2B7C75"/>
      ${[[150, 240], [190, 240], [250, 260], [330, 280], [470, 230], [540, 250], [680, 300], [720, 300]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="22" fill="#F2C94C" opacity=".85"/>`).join('')}
      <rect x="0" y="330" width="800" height="230" fill="#2E3A4F"/>
      ${[80, 330, 580].map(x => `<rect x="${x}" y="250" width="8" height="120" fill="#0E1726"/><circle cx="${x + 4}" cy="246" r="14" fill="#F6E7B0"/><circle cx="${x + 4}" cy="246" r="44" fill="#F6E7B0" opacity=".15"/>`).join('')}
      <rect x="0" y="0" width="800" height="560" fill="none" stroke="#16514F" stroke-width="44"/>
      <rect x="390" y="0" width="20" height="560" fill="#16514F"/><rect x="0" y="270" width="800" height="16" fill="#16514F"/>
      <rect x="0" y="500" width="800" height="60" fill="#D4A955"/>
      <rect x="120" y="470" width="80" height="40" rx="8" fill="#B8324B"/><circle cx="600" cy="480" r="28" fill="#F4F4F0"/><circle cx="600" cy="480" r="20" fill="#9A6440"/>`
  };
  function scene(id) {
    return `<svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="glow"><stop offset="0" stop-color="#F6D98B" stop-opacity=".55"/><stop offset="1" stop-color="#F6D98B" stop-opacity="0"/></radialGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E7B0" stop-opacity=".5"/><stop offset="1" stop-color="#F6E7B0" stop-opacity=".05"/></linearGradient>
      </defs>${SCENES[id]()}</svg>`;
  }

  return { art, rng, scatter, EVENT_ICONS, plate3d, avatar, scene };
})();
