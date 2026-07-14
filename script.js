/* DuoCards landing — interakce (slot, demo balíček, scroll-flip, konfety) */
(() => {
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const APP_URL = 'https://app.duocards.xyz/';

/* Scroll bez # v URL */
(() => {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  document.querySelectorAll('[data-scroll-to]').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById(el.dataset.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* Safari theme-color = barva hero sekce */
(() => {
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  const sync = () => {
    meta.content = getComputedStyle(document.documentElement).getPropertyValue('--chrome-bg').trim();
  };
  sync();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
})();

const SPEAKER_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M16 8a5 5 0 0 1 0 8" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>';

/* ---------- jediná globální rAF smyčka ---------- */
const ticker = (() => {
  const fns = new Set();
  let running = false;
  const loop = () => {
    if (!fns.size || document.hidden) { running = false; return; }
    fns.forEach(f => f());
    requestAnimationFrame(loop);
  };
  const start = () => {
    if (!running && fns.size && !document.hidden) { running = true; requestAnimationFrame(loop); }
  };
  document.addEventListener('visibilitychange', start);
  return {
    add(f) { fns.add(f); start(); },
    remove(f) { fns.delete(f); },
  };
})();

/* ---------- výslovnost (TTS) ---------- */
const TTS = 'speechSynthesis' in window;
const speak = (text, lang) => {
  if (!TTS) return;
  try {
    speechSynthesis.cancel();
    speechSynthesis.resume?.();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch (e) { /* bez zvuku */ }
};

/* ---------- reveal: jeden IntersectionObserver ---------- */
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('live'); io.unobserve(e.target); }
  }
}, { threshold: 0.25 });
$$('[data-live]').forEach(el => io.observe(el));
$$('.wt').forEach(t => $$('.wm', t).forEach((wm, i) => $('.w', wm).style.setProperty('--wi', i)));

/* ---------- 01 hero: slot machine ---------- */
(() => {
  const track = $('#slotTrack');
  const tag = $('#slotTag');
  if (!track) return;
  const words = $$('.slot-word', track);
  const getTags = () => words.map(w => w.dataset.tag);
  let i = 0;
  let tagTimer = 0;

  if (REDUCED) $('#slot').classList.add('slot--fade');
  else track.appendChild(words[0].cloneNode(true)); // klon pro plynulou smyčku

  const items = () => [...track.children];
  const setActive = idx => items().forEach((w, k) => w.classList.toggle('active', k === idx));
  const showTag = idx => {
    tag.classList.remove('show');
    clearTimeout(tagTimer);
    tagTimer = setTimeout(() => {
      tag.textContent = getTags()[idx % words.length];
      tag.classList.add('show');
    }, 1200);
  };

  setActive(0);
  showTag(0);

  let heroVisible = true;
  new IntersectionObserver(es => { heroVisible = es.some(e => e.isIntersecting); }).observe($('.hero'));

  setInterval(() => {
    if (document.hidden || !heroVisible) return;
    i++;
    if (REDUCED) {
      i %= words.length;
      setActive(i);
      showTag(i);
      return;
    }
    setActive(i);
    showTag(i);
    track.style.transform = `translateY(${-items()[i].offsetTop}px)`;
    if (i === words.length) {
      // klon prvního slova doběhl — skok bez animace zpět na začátek
      setTimeout(() => {
        track.classList.add('notrans');
        track.style.transform = 'translateY(0)';
        i = 0;
        setActive(0);
        requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove('notrans')));
      }, 520);
    }
  }, 2400);
})();

/* ---------- 01 hero: náklon za kurzorem ---------- */
(() => {
  if (REDUCED || !FINE) return;
  const el = $('#heroTilt');
  const hero = $('.hero');
  if (!el) return;
  let mx = 0, my = 0, rx = 0, ry = 0, active = false;
  addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  const tilt = () => {
    ry = lerp(ry, mx * 1.5, 0.08);
    rx = lerp(rx, -my * 1.5, 0.08);
    el.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
  };
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !active) { active = true; ticker.add(tilt); }
    else if (!e.isIntersecting && active) { active = false; ticker.remove(tilt); }
  })).observe(hero);
})();

/* ---------- zbloudilé kartičky: paralaxa ---------- */
(() => {
  if (REDUCED) return;
  const strays = $$('.stray');
  if (!strays.length) return;
  const factors = [0.16, 0.11, 0.22, 0.06];
  let lastY = -1;
  ticker.add(() => {
    if (scrollY === lastY) return;
    lastY = scrollY;
    strays.forEach((s, k) => {
      s.style.transform = `translate3d(0, ${(-scrollY * factors[k % factors.length]).toFixed(1)}px, 0)`;
    });
  });
})();

/* ---------- pauza nekonečných CSS animací mimo viewport ---------- */
(() => {
  const vo = new IntersectionObserver(es => es.forEach(e => {
    e.target.classList.toggle('anim-off', !e.isIntersecting);
  }), { rootMargin: '120px' });
  $$('.hero, .marquee-band, .chapter.bg-blue, .player, .sec-stats, .sec-final').forEach(el => vo.observe(el));
})();

/* ---------- konfety ---------- */
const CONF_COLORS = ['#4f46e5', '#7c3aed', '#34d399', '#f59e0b', '#818cf8'];
let confLayer = null;
const burst = (x, y, count) => {
  if (REDUCED) return;
  if (!confLayer) {
    confLayer = document.createElement('div');
    confLayer.className = 'confetti-layer';
    document.body.appendChild(confLayer);
  }
  const parts = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'confetto';
    el.style.background = CONF_COLORS[i % CONF_COLORS.length];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    confLayer.appendChild(el);
    parts.push({
      el, x: 0, y: 0,
      vx: (Math.random() - 0.5) * 10,
      vy: -(3 + Math.random() * 6),
      r: Math.random() * 360,
      vr: (Math.random() - 0.5) * 24,
    });
  }
  let frames = 0;
  const step = () => {
    frames++;
    for (const p of parts) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
      if (frames > 40) p.el.style.opacity = String(Math.max(0, 1 - (frames - 40) / 20));
    }
    if (frames < 60) requestAnimationFrame(step);
    else parts.forEach(p => p.el.remove());
  };
  requestAnimationFrame(step);
};

const deckFeedback = (kind, x, y) => {
  if (REDUCED) return;
  const el = document.createElement('span');
  el.className = `deck-feedback ${kind}`;
  el.textContent = kind === 'done' ? '★ LEARNED' : kind === 'yes' ? '✓ NICE' : '↺ AGAIN';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 760);
};

/* Krátké UI tóny bez audio souborů; kontext vzniká až po interakci uživatele. */
let feedbackAudio = null;
const playFeedbackSound = kind => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    feedbackAudio ||= new AudioCtx();
    if (feedbackAudio.state === 'suspended') void feedbackAudio.resume();
    const now = feedbackAudio.currentTime + .01;
    const notes = kind === 'done'
      ? [[523.25, 0, .18, .055], [659.25, .07, .2, .045], [783.99, .14, .24, .04]]
      : kind === 'yes'
        ? [[523.25, 0, .14, .045], [659.25, .075, .18, .038]]
        : [[246.94, 0, .12, .025], [196, .07, .16, .02]];
    notes.forEach(([frequency, delay, duration, volume]) => {
      const oscillator = feedbackAudio.createOscillator();
      const gain = feedbackAudio.createGain();
      oscillator.type = kind === 'no' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, now + delay);
      gain.gain.setValueAtTime(.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(volume, now + delay + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
      oscillator.connect(gain).connect(feedbackAudio.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + duration + .02);
    });
  } catch (e) { /* zvukové efekty jsou jen bonus */ }
};

/* ---------- 03 demo balíček ---------- */
(() => {
  const deckEl = $('#deck');
  if (!deckEl) return;
  const liveEl = $('#deckLive');
  const piles = {
    no: $('[data-pile="no"]'),
    yes: $('[data-pile="yes"]'),
    done: $('[data-pile="done"]'),
  };
  const counts = { no: 0, yes: 0, done: 0 };
  const L = () => window.DuoI18n.T[window.DuoI18n.getLang()];
  const cardBack = c => (window.DuoI18n.getLang() === 'cs' ? c.backCs : c.backEn);
  const backCode = () => (window.DuoI18n.getLang() === 'cs' ? 'CS' : 'EN');
  const DATA = [
    { front: 'hola', code: 'ES', lang: 'es-ES', backEn: 'hello', backCs: 'ahoj', ex: '¡Hola! ¿Qué tal?' },
    { front: 'Brücke', code: 'DE', lang: 'de-DE', backEn: 'bridge', backCs: 'most', ex: 'Die Brücke über den Fluss.' },
    { front: '猫', code: 'JA', lang: 'ja-JP', backEn: 'cat', backCs: 'kočka', ex: '猫がかわいいです。' },
    { front: 'obrigado', code: 'PT', lang: 'pt-PT', backEn: 'thank you', backCs: 'děkuji', ex: 'Muito obrigado!' },
    { front: 'swallow', code: 'EN', lang: 'en-US', backEn: 'swallow (bird)', backCs: 'vlaštovka', ex: 'A swallow flew over us.' },
    { front: 'excusa', code: 'ES', lang: 'es-ES', backEn: 'excuse', backCs: 'výmluva', ex: 'No busques excusas.' },
    { front: 'breakthrough', code: 'EN', lang: 'en-US', backEn: 'breakthrough', backCs: 'průlom', ex: 'It was a real breakthrough.' },
    { front: 'merci', code: 'FR', lang: 'fr-FR', backEn: 'thank you', backCs: 'děkuji', ex: 'Merci beaucoup !' },
  ];
  const TOTAL = DATA.length;
  const queue = DATA.map(c => ({ ...c, knows: 0 }));
  const els = new Map();
  let interactions = 0;
  let finished = false;
  let resolving = false; // zámek proti dvojímu vyhodnocení během odletu karty
  let drag = null;

  const topCard = () => queue.length ? els.get(queue[0]) : null;

  const plural = n => L().cardPlural(n);

  const cardHtml = c => {
    const labels = L();
    return `
      <div class="dcard-inner">
        <div class="dface dfront">
          <span class="dcode">[${c.code}]</span>
          <span class="dword" lang="${c.lang.split('-')[0]}">${c.front}</span>
          <span class="dhint">${labels.cardHint}</span>
          ${TTS ? `<button class="dtts" type="button" aria-label="${labels.speakAria}">${SPEAKER_SVG}</button>` : ''}
        </div>
        <div class="dface dback">
          <span class="dcode">[${backCode()}]</span>
          <span class="dword">${cardBack(c)}</span>
          <span class="dex" lang="${c.lang.split('-')[0]}">${c.ex}</span>
          ${TTS ? `<button class="dtts" type="button" aria-label="${labels.speakAria}">${SPEAKER_SVG}</button>` : ''}
        </div>
      </div>
      <span class="stamp stamp-yes">${labels.stampYes}</span>
      <span class="stamp stamp-no">${labels.stampNo}</span>
      <span class="stamp stamp-up">${labels.stampUp}</span>`;
  };

  const refreshCards = () => {
    els.forEach((el, c) => {
      el.setAttribute('aria-label', L().cardAria(c.front));
      const hint = $('.dhint', el);
      if (hint) hint.textContent = L().cardHint;
      const code = $('.dface.dback .dcode', el);
      if (code) code.textContent = `[${backCode()}]`;
      const back = $('.dface.dback .dword', el);
      if (back) back.textContent = cardBack(c);
      const sy = $('.stamp-yes', el);
      const sn = $('.stamp-no', el);
      const su = $('.stamp-up', el);
      if (sy) sy.textContent = L().stampYes;
      if (sn) sn.textContent = L().stampNo;
      if (su) su.textContent = L().stampUp;
      $$('.dtts', el).forEach(b => b.setAttribute('aria-label', L().speakAria));
    });
  };

  /* obtisková stopa */
  const GHOSTS = FINE ? 3 : 2;
  const ghosts = REDUCED ? [] : [...Array(GHOSTS)].map(() => {
    const g = document.createElement('span');
    g.className = 'ghostcard';
    deckEl.appendChild(g);
    return g;
  });
  const hideGhosts = () => ghosts.forEach(g => { g.style.opacity = '0'; });

  const toggleFlip = el => { if (el) el.classList.toggle('flipped'); };

  const clearDragVars = el => {
    ['--st-yes', '--st-no', '--st-up', '--tint-yes', '--tint-no'].forEach(v => el.style.removeProperty(v));
  };

  const dragTick = () => {
    if (!drag) return;
    const { el, dx, dy, trail } = drag;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${(dx * 0.06).toFixed(2)}deg)`;
    const nx = clamp01(Math.abs(dx) / 90);
    const ny = clamp01(-dy / 90);
    const upGesture = dy < 0 && Math.abs(dy) > Math.abs(dx);
    el.style.setProperty('--st-yes', dx > 0 && !upGesture ? nx.toFixed(3) : '0');
    el.style.setProperty('--st-no', dx < 0 && !upGesture ? nx.toFixed(3) : '0');
    el.style.setProperty('--st-up', upGesture ? ny.toFixed(3) : '0');
    el.style.setProperty('--tint-yes', dx > 0 && !upGesture ? (nx * 0.28).toFixed(3) : '0');
    el.style.setProperty('--tint-no', dx < 0 && !upGesture ? (nx * 0.28).toFixed(3) : '0');
    piles.yes.classList.toggle('lift', dx > 30 && !upGesture);
    piles.no.classList.toggle('lift', dx < -30 && !upGesture);
    piles.done.classList.toggle('lift', upGesture && dy < -30);
    if (ghosts.length) {
      trail.push([dx, dy]);
      if (trail.length > 16) trail.shift();
      ghosts.forEach((g, k) => {
        const idx = trail.length - 1 - (k + 1) * 4;
        if (idx >= 0) {
          const [gx, gy] = trail[idx];
          g.style.opacity = ['0.3', '0.18', '0.08'][k];
          g.style.transform = `translate(${gx}px, ${gy}px) rotate(${(gx * 0.06).toFixed(2)}deg)`;
          g.style.borderColor = dx > 0 ? 'var(--blue)' : dx < 0 ? 'var(--coral)' : 'var(--ink)';
        } else {
          g.style.opacity = '0';
        }
      });
    }
  };

  const finishDrag = () => {
    const { el, dx, dy } = drag;
    drag = null;
    ticker.remove(dragTick);
    el.classList.remove('dragging');
    el.style.willChange = '';
    hideGhosts();
    Object.values(piles).forEach(p => p.classList.remove('lift'));
    setTimeout(() => { delete el.dataset.moved; }, 0);
    clearDragVars(el);
    if (dy < -80 && Math.abs(dy) > Math.abs(dx)) resolve('done', dx, dy);
    else if (dx > 90) resolve('yes', dx, dy);
    else if (dx < -90) resolve('no', dx, dy);
    else el.style.transform = ''; // pružinový návrat přes základní transition
  };

  const bindDrag = el => {
    el.addEventListener('pointerdown', ev => {
      if (finished || resolving || drag || el !== topCard() || ev.target.closest('.dtts')) return;
      el.setPointerCapture(ev.pointerId);
      drag = { el, id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, dx: 0, dy: 0, trail: [] };
      el.classList.add('dragging');
      el.style.willChange = 'transform';
      delete el.dataset.moved;
      ticker.add(dragTick);
    });
    el.addEventListener('pointermove', ev => {
      if (!drag || drag.el !== el || drag.id !== ev.pointerId) return;
      drag.dx = ev.clientX - drag.x0;
      drag.dy = ev.clientY - drag.y0;
      if (Math.hypot(drag.dx, drag.dy) > 6) el.dataset.moved = '1';
    });
    const up = ev => { if (drag && drag.el === el && drag.id === ev.pointerId) finishDrag(); };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  const makeCard = c => {
    const el = document.createElement('article');
    el.className = 'dcard';
    el.tabIndex = 0;
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', L().cardAria(c.front));
    el.innerHTML = cardHtml(c);
    $$('.dtts', el).forEach(b => {
      const play = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const isBack = !!ev.currentTarget.closest('.dback');
        speak(isBack ? cardBack(c) : c.front, c.lang);
        b.classList.add('is-speaking');
        clearTimeout(b._speakTimer);
        b._speakTimer = setTimeout(() => b.classList.remove('is-speaking'), 520);
      };
      b.addEventListener('pointerdown', ev => ev.stopPropagation(), { passive: true });
      b.addEventListener('pointerup', ev => ev.stopPropagation(), { passive: true });
      b.addEventListener('click', play);
    });
    el.addEventListener('click', () => {
      if (el === topCard() && !el.dataset.moved && !finished) toggleFlip(el);
    });
    el.addEventListener('keydown', ev => {
      if (el !== topCard() || finished) return;
      if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); toggleFlip(el); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); resolve('yes'); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); resolve('no'); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); resolve('done'); }
    });
    bindDrag(el);
    return el;
  };

  const render = () => {
    queue.forEach((c, i) => {
      let el = els.get(c);
      if (i < 4) {
        if (!el) { el = makeCard(c); els.set(c, el); }
        if (!el.isConnected) deckEl.appendChild(el);
        el.style.setProperty('--i', i);
        el.classList.toggle('is-top', i === 0);
      } else if (el && el.isConnected) {
        el.classList.remove('is-top');
        el.remove();
      }
    });
  };

  const animateNextCard = () => {
    if (REDUCED) return;
    const next = topCard();
    if (!next) return;
    next.classList.remove('promoted');
    void next.offsetWidth;
    next.classList.add('promoted');
    setTimeout(() => next.classList.remove('promoted'), 520);
  };

  const updatePile = kind => {
    const pile = piles[kind];
    $('.pile-num', pile).textContent = counts[kind];
    pile.classList.remove('tick');
    void pile.offsetWidth; // restart animace
    pile.classList.add('tick');
    pile.classList.remove('celebrate');
    void pile.offsetWidth;
    pile.classList.add('celebrate');
  };

  const pileConfetti = pile => {
    const r = pile.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 12);
  };

  const mobileLearnedEffect = () => {
    if (REDUCED || !matchMedia('(max-width: 560px)').matches) return;
    deckEl.classList.remove('mobile-learned');
    void deckEl.offsetWidth;
    deckEl.classList.add('mobile-learned');
    setTimeout(() => deckEl.classList.remove('mobile-learned'), 850);
  };

  const finish = () => {
    finished = true;
    ghosts.forEach(g => g.remove());
    els.forEach(el => el.remove());
    deckEl.innerHTML = `
      <div class="result-card cardlet">
        <p class="result-big">${L().demoResult(counts.done, TOTAL)}</p>
        <p class="result-note mono">${L().demoResultNote}</p>
        <a class="btn btn-dark" href="${APP_URL}" rel="noopener">${L().demoResultCta}</a>
      </div>`;
    $('#deckActions').style.display = 'none';
    liveEl.textContent = L().demoDoneLive(counts.done, TOTAL);
  };

  const resolve = (kind, dx = 0, dy = 0) => {
    if (finished || resolving || !queue.length) return;
    resolving = true;
    const c = queue[0];
    const el = els.get(c);
    const landingKind = kind === 'yes' && c.knows >= 2 ? 'done' : kind;
    playFeedbackSound(landingKind);
    navigator.vibrate?.(landingKind === 'done' ? [12, 24, 18] : 10);
    if (landingKind === 'done') mobileLearnedEffect();
    if (drag && drag.el === el) { drag = null; ticker.remove(dragTick); hideGhosts(); }
    const hadFocus = el && document.activeElement === el;
    interactions++;
    if (el) {
      el.classList.add('fly', `fly-${landingKind}`);
      el.style.transform = kind === 'yes'
        ? `translate(150%, ${dy}px) rotate(30deg)`
        : kind === 'no'
          ? `translate(-150%, ${dy}px) rotate(-30deg)`
          : `translate(${dx}px, -120vh) scale(0.6)`;
      const r = el.getBoundingClientRect();
      deckFeedback(landingKind, r.left + r.width / 2, r.top + 54);
      if (landingKind !== 'no') {
        burst(r.left + r.width / 2, r.top + r.height * .34, landingKind === 'done' ? 32 : 18);
      }
    }
    setTimeout(() => {
      queue.shift();
      let msg;
      let pileKind = kind;
      if (kind === 'no') {
        queue.push(c);
        counts.no++;
        msg = L().msgNo(c.front);
      } else if (kind === 'yes') {
        c.knows++;
        if (c.knows >= 3) {
          counts.done++;
          pileKind = 'done';
          msg = L().msgYesDone(c.front);
          pileConfetti(piles.done);
        } else {
          queue.splice(Math.min(3, queue.length), 0, c);
          counts.yes++;
          msg = L().msgYes(c.front);
        }
      } else {
        counts.done++;
        msg = L().msgDone(c.front);
        pileConfetti(piles.done);
      }
      updatePile(pileKind);
      if (el) {
        el.remove();
        el.classList.remove('fly', 'fly-yes', 'fly-no', 'fly-done', 'flipped');
        el.style.transform = '';
        clearDragVars(el);
      }
      liveEl.textContent = L().msgQueue(msg, queue.length);
      resolving = false;
      if (!queue.length || interactions >= 20) { finish(); return; }
      render();
      animateNextCard();
      if (hadFocus) topCard()?.focus();
    }, 600);
  };

  $('#btnNo').addEventListener('click', () => resolve('no'));
  $('#btnYes').addEventListener('click', () => resolve('yes'));
  $('#btnDone').addEventListener('click', () => resolve('done'));
  $('#btnFlip').addEventListener('click', () => toggleFlip(topCard()));

  render();

  window.DuoI18n.onLangChange(() => {
    if (finished) finish();
    else refreshCards();
  });
})();

/* ---------- 04.3 slovo letí z titulků do balíčku ---------- */
(() => {
  const player = $('#player');
  if (!player || REDUCED) return;
  const hot = $('#subHot');
  const icon = $('#deckIcon');
  let timer = 0;
  const fly = () => {
    const pr = player.getBoundingClientRect();
    const hr = hot.getBoundingClientRect();
    const ir = icon.getBoundingClientRect();
    const dx = (ir.left + ir.width / 2) - (hr.left + hr.width / 2);
    const dy = (ir.top + ir.height / 2) - (hr.top + hr.height / 2);
    const fw = document.createElement('span');
    fw.className = 'fly-word';
    fw.style.left = `${hr.left - pr.left}px`;
    fw.style.top = `${hr.top - pr.top}px`;
    fw.style.setProperty('--dx', `${dx.toFixed(0)}px`);
    fw.style.setProperty('--dy', `${dy.toFixed(0)}px`);
    fw.innerHTML = `<span class="fly-x"><span class="fly-y">${hot.textContent}</span></span>`;
    player.appendChild(fw);
    setTimeout(() => {
      icon.classList.add('pulse');
      setTimeout(() => icon.classList.remove('pulse'), 320);
    }, 780);
    setTimeout(() => fw.remove(), 1000);
  };
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !timer) { fly(); timer = setInterval(fly, 4000); }
    else if (!e.isIntersecting && timer) { clearInterval(timer); timer = 0; }
  }), { threshold: 0.4 }).observe(player);
})();

/* ---------- 05 čísla: count-up + razítka s pozdravem ---------- */
(() => {
  const sec = $('#stats');
  if (!sec) return;
  const vals = $$('.stat-val');
  const obs = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    obs.disconnect();
    vals.forEach(n => {
      const target = +n.dataset.target;
      if (REDUCED) { n.textContent = target; return; }
      const t0 = performance.now();
      const tick = now => {
        const t = clamp01((now - t0) / 1200);
        n.textContent = t >= 1 ? target : Math.round(target * (1 - Math.pow(2, -10 * t)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.35 });
  obs.observe(sec);

  $$('.stamp-btn').forEach((b, i) => {
    b.style.setProperty('--n', i);
    b.style.setProperty('--rot', `${(Math.random() * 6 - 3).toFixed(1)}deg`);
    const say = () => speak(b.dataset.greet, b.dataset.lang);
    b.addEventListener('mouseenter', say);
    b.addEventListener('focus', say);
    b.addEventListener('click', say);
  });
})();

/* ---------- 06 finále: scroll-flip, magnet, konfety ---------- */
(() => {
  const sec = $('#final');
  const card = $('#flipCard');
  const btn = $('#finalCta');
  const wrap = $('#magnetWrap');
  if (!sec) return;

  btn.addEventListener('click', e => {
    if (REDUCED) return; // rovnou navigovat
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // otevření v novém tabu nechat prohlížeči
    e.preventDefault();
    const r = btn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 40);
    setTimeout(() => { location.href = APP_URL; }, 350);
  });

  if (REDUCED) return;

  let pulsed = false;
  const flip = () => {
    const r = sec.getBoundingClientRect();
    const p = clamp01((innerHeight - r.top) / innerHeight);
    card.style.setProperty('--p', p.toFixed(4));
    if (!pulsed && p >= 0.98) {
      pulsed = true;
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 480);
    }
  };

  let mx = -1e4, my = -1e4, tx = 0, ty = 0;
  const magnet = () => {
    const r = wrap.getBoundingClientRect();
    const dx = mx - (r.left + r.width / 2);
    const dy = my - (r.top + r.height / 2);
    const near = Math.hypot(dx, dy) < 140;
    tx = lerp(tx, near ? Math.max(-12, Math.min(12, dx * 0.12)) : 0, 0.15);
    ty = lerp(ty, near ? Math.max(-12, Math.min(12, dy * 0.12)) : 0, 0.15);
    wrap.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
  };
  if (FINE) {
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  }

  let active = false;
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !active) {
      active = true;
      ticker.add(flip);
      if (FINE) ticker.add(magnet);
    } else if (!e.isIntersecting && active) {
      active = false;
      ticker.remove(flip);
      ticker.remove(magnet);
    }
  })).observe(sec);
})();

})();
