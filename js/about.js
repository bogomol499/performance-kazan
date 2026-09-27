/* =========================================================
   Performance — страница «О нас»
   История, команда, галерея с перетаскиванием и просмотром.
   ========================================================= */
(() => {
  'use strict';

  const { $, $$, clamp, esc, reduceMotion, tr } = PF;
  const D = window.PF_DATA;
  const A = window.PF_ART;

  // Слово в подвале — по буквам
  $$('.footer__word').forEach(el => {
    const text = el.textContent.trim();
    el.innerHTML = [...text].map(ch => `<span class="ch">${esc(ch)}</span>`).join('');
  });

  $('#ab-hero-art').innerHTML = A.scene('hall');

  /* ---------- Шапка ---------- */
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
    updateTimeline();
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); }
  }, { passive: true });

  /* ---------- История: линия заполняется при прокрутке ---------- */
  const tl = $('#timeline');
  function renderHistory() {
    $('#tl-list').innerHTML = D.HISTORY.map((h, i) => `
      <li class="tl__item ${i % 2 ? 'tl__item--r' : ''}">
        <span class="tl__dot" aria-hidden="true"></span>
        <span class="tl__year">${esc(h.year)}</span>
        <h3>${esc(tr(h.title))}</h3>
        <p>${esc(tr(h.text))}</p>
      </li>`).join('');
  }
  function updateTimeline() {
    const r = tl.getBoundingClientRect();
    const p = clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1);
    tl.style.setProperty('--tp', p.toFixed(4));
    $$('.tl__item', tl).forEach(it => {
      const ir = it.getBoundingClientRect();
      it.classList.toggle('lit', ir.top < innerHeight * 0.6);
    });
  }

  /* ---------- Команда ---------- */
  function renderTeam() {
    $('#team').innerHTML = D.TEAM.map(p => `
      <article class="team-card" tabindex="0">
        <div class="team-card__inner">
          <div class="team-card__face team-card__front">
            <div class="team-card__pic">${A.avatar(p)}</div>
            <h3>${esc(tr(p.name))}</h3>
            <p>${esc(tr(p.role))}</p>
          </div>
          <div class="team-card__face team-card__back" style="--pbg:${p.bg}">
            <p class="team-card__bio">${esc(tr(p.bio))}</p>
            <span>${esc(tr(p.name))}, ${esc(tr(p.role)).toLowerCase()}</span>
          </div>
        </div>
      </article>`).join('');
  }
  $('#team').addEventListener('click', e => {
    const c = e.target.closest('.team-card');
    if (c) c.classList.toggle('flipped');
  });
  $('#team').addEventListener('keydown', e => {
    const c = e.target.closest('.team-card');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.classList.toggle('flipped'); }
  });

  /* ---------- Галерея: тянуть, листать, открывать ---------- */
  const gal = $('#gallery');
  const track = $('#gallery-track');
  let pos = 0, target = 0, maxPos = 0, dragging = false, startX = 0, startPos = 0, moved = 0, velocity = 0, lastX = 0;

  function renderGallery() {
    track.innerHTML = D.GALLERY.map((g, i) => `
      <figure class="gallery__item" data-i="${i}">
        <div class="gallery__frame">${A.scene(g.id)}</div>
        <figcaption><span>${String(i + 1).padStart(2, '0')}</span>${esc(tr(g.title))}</figcaption>
      </figure>`).join('');
    measure();
  }
  function measure() {
    maxPos = Math.max(0, track.scrollWidth - gal.clientWidth);
    target = clamp(target, 0, maxPos);
  }
  function itemStep() { const it = $('.gallery__item', track); return it ? it.offsetWidth + 20 : 300; }

  gal.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; startX = lastX = e.clientX; startPos = target; velocity = 0;
    gal.classList.add('dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 6 && gal.setPointerCapture) { try { gal.setPointerCapture(e.pointerId); } catch (err) { /* ничего */ } }
    velocity = e.clientX - lastX; lastX = e.clientX;
    let next = startPos - dx;
    if (next < 0) next *= 0.35;
    if (next > maxPos) next = maxPos + (next - maxPos) * 0.35;
    target = next;
    if (moved > 6) e.preventDefault();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    gal.classList.remove('dragging');
    target = clamp(target - velocity * 12, 0, maxPos);
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  gal.addEventListener('click', e => {
    if (moved > 6) { e.preventDefault(); return; }
    const it = e.target.closest('.gallery__item');
    if (it) openLightbox(+it.dataset.i);
  });
  // колёсико/тачпад вбок
  gal.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); target = clamp(target + e.deltaX, 0, maxPos); }
  }, { passive: false });
  $$('[data-gal]').forEach(b => b.addEventListener('click', () => { target = clamp(target + (+b.dataset.gal) * itemStep(), 0, maxPos); }));

  (function loop() {
    pos += (target - pos) * (reduceMotion ? 1 : 0.12);
    if (Math.abs(target - pos) < 0.1) pos = target;
    track.style.transform = `translate3d(${(-pos).toFixed(1)}px,0,0)`;
    // картинки чуть наклоняются в движении
    const skew = clamp((target - pos) * -0.02, -6, 6);
    $$('.gallery__frame svg', track).forEach(s => { s.style.transform = `scale(1.12) translateX(${(skew * 4).toFixed(1)}px)`; });
    const bar = $('#gallery-bar');
    if (bar) bar.style.transform = `scaleX(${maxPos ? clamp(pos / maxPos, 0, 1) * 0.8 + 0.2 : 1})`;
    requestAnimationFrame(loop);
  })();
  window.addEventListener('resize', measure);

  /* ---------- Просмотр крупно ---------- */
  const lb = $('#lightbox');
  let lbIndex = 0;
  function showLb(i, dir = 0) {
    lbIndex = (i + D.GALLERY.length) % D.GALLERY.length;
    const g = D.GALLERY[lbIndex];
    const img = $('#lb-img');
    img.classList.remove('from-left', 'from-right');
    void img.offsetWidth;
    if (dir) img.classList.add(dir > 0 ? 'from-right' : 'from-left');
    img.innerHTML = A.scene(g.id);
    $('#lb-cap').textContent = `${lbIndex + 1} / ${D.GALLERY.length}  ${tr(g.title)}`;
  }
  function openLightbox(i) { showLb(i); PF.openPanel(lb); }
  $$('[data-lb]').forEach(b => b.addEventListener('click', () => showLb(lbIndex + (+b.dataset.lb), +b.dataset.lb)));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight') showLb(lbIndex + 1, 1);
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1, -1);
  });
  let sx = null;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    sx = null;
  });
  lb.addEventListener('click', e => { if (e.target === lb) PF.closePanel(); });

  /* ---------- Старт и смена языка ---------- */
  function renderAll() { renderHistory(); renderTeam(); renderGallery(); updateTimeline(); }
  renderAll();
  PF.on('lang', () => { renderAll(); if (lb.classList.contains('open')) showLb(lbIndex); });
  window.addEventListener('load', measure);
  onScroll();
})();
