/* DuoCards landing — interakce (slot, demo balíček, scroll-flip, konfety) */
(() => {
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const APP_URL = 'https://duocards.xyz/';

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
  const tags = words.map(w => w.dataset.tag);
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
      tag.textContent = tags[idx % words.length];
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
  const factors = [0.08, 0.16, 0.11, 0.22, 0.06];
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
  const DATA = [
    { front: 'hola', code: 'ES', lang: 'es-ES', back: 'ahoj', ex: '¡Hola! ¿Qué tal?' },
    { front: 'Brücke', code: 'DE', lang: 'de-DE', back: 'most', ex: 'Die Brücke über den Fluss.' },
    { front: '猫', code: 'JA', lang: 'ja-JP', back: 'kočka', ex: '猫がかわいいです。' },
    { front: 'obrigado', code: 'PT', lang: 'pt-PT', back: 'děkuji', ex: 'Muito obrigado!' },
    { front: 'swallow', code: 'EN', lang: 'en-US', back: 'vlaštovka', ex: 'A swallow flew over us.' },
    { front: 'excusa', code: 'ES', lang: 'es-ES', back: 'výmluva', ex: 'No busques excusas.' },
    { front: 'breakthrough', code: 'EN', lang: 'en-US', back: 'průlom', ex: 'It was a real breakthrough.' },
    { front: 'merci', code: 'FR', lang: 'fr-FR', back: 'děkuji', ex: 'Merci beaucoup !' },
  ];
  const TOTAL = DATA.length;
  const queue = DATA.map(c => ({ ...c, knows: 0 }));
  const els = new Map();
  let interactions = 0;
  let finished = false;
  let resolving = false; // zámek proti dvojímu vyhodnocení během odletu karty
  let drag = null;

  const topCard = () => queue.length ? els.get(queue[0]) : null;

  const plural = n => n === 1 ? '1 karta' : (n >= 2 && n <= 4 ? `${n} karty` : `${n} karet`);

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
    el.setAttribute('aria-label', `Kartička ${c.front} — Enter otočí, šipky zařadí do hromádky`);
    const langShort = c.lang.split('-')[0];
    el.innerHTML = `
      <div class="dcard-inner">
        <div class="dface dfront">
          <span class="dcode">[${c.code}]</span>
          <span class="dword" lang="${langShort}">${c.front}</span>
          <span class="dhint">klepni = otočit</span>
          ${TTS ? `<button class="dtts" type="button" aria-label="Přehrát výslovnost">${SPEAKER_SVG}</button>` : ''}
        </div>
        <div class="dface dback">
          <span class="dcode">[CS]</span>
          <span class="dword">${c.back}</span>
          <span class="dex" lang="${langShort}">${c.ex}</span>
          ${TTS ? `<button class="dtts" type="button" aria-label="Přehrát výslovnost">${SPEAKER_SVG}</button>` : ''}
        </div>
      </div>
      <span class="stamp stamp-yes">VÍM</span>
      <span class="stamp stamp-no">NEVÍM</span>
      <span class="stamp stamp-up">NAUČENO</span>`;
    $$('.dtts', el).forEach(b => b.addEventListener('click', ev => {
      ev.stopPropagation();
      speak(c.front, c.lang);
    }));
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
      } else if (el && el.isConnected) {
        el.remove();
      }
    });
  };

  const updatePile = kind => {
    const pile = piles[kind];
    $('.pile-num', pile).textContent = counts[kind];
    pile.classList.remove('tick');
    void pile.offsetWidth; // restart animace
    pile.classList.add('tick');
  };

  const pileConfetti = pile => {
    const r = pile.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 12);
  };

  const finish = () => {
    finished = true;
    ghosts.forEach(g => g.remove());
    els.forEach(el => el.remove());
    deckEl.innerHTML = `
      <div class="result-card cardlet">
        <p class="result-big">Šlo ti to.<br>Umíš ${counts.done} z ${TOTAL}.</p>
        <p class="result-note mono">Představ si to s celým jazykem.</p>
        <a class="btn btn-dark" href="${APP_URL}" rel="noopener">Chci dalších tisíc →</a>
      </div>`;
    $('#deckActions').style.display = 'none';
    liveEl.textContent = `Demo dokončeno. Naučeno ${counts.done} z ${TOTAL} karet.`;
  };

  const resolve = (kind, dx = 0, dy = 0) => {
    if (finished || resolving || !queue.length) return;
    resolving = true;
    const c = queue[0];
    const el = els.get(c);
    if (drag && drag.el === el) { drag = null; ticker.remove(dragTick); hideGhosts(); }
    const hadFocus = el && document.activeElement === el;
    interactions++;
    if (el) {
      el.classList.add('fly');
      el.style.transform = kind === 'yes'
        ? `translate(150%, ${dy}px) rotate(30deg)`
        : kind === 'no'
          ? `translate(-150%, ${dy}px) rotate(-30deg)`
          : `translate(${dx}px, -120vh) scale(0.6)`;
    }
    setTimeout(() => {
      queue.shift();
      let msg;
      let pileKind = kind;
      if (kind === 'no') {
        queue.push(c);
        counts.no++;
        msg = `${c.front} → hromádka Nevím, vrací se na dno balíčku.`;
      } else if (kind === 'yes') {
        c.knows++;
        if (c.knows >= 3) {
          counts.done++;
          pileKind = 'done';
          msg = `${c.front} — potřetí Vím, přesouvá se do Naučeno.`;
          pileConfetti(piles.done);
        } else {
          queue.splice(Math.min(3, queue.length), 0, c);
          counts.yes++;
          msg = `${c.front} → hromádka Vím.`;
        }
      } else {
        counts.done++;
        msg = `${c.front} → hromádka Naučeno.`;
        pileConfetti(piles.done);
      }
      updatePile(pileKind);
      if (el) {
        el.remove();
        el.classList.remove('fly', 'flipped');
        el.style.transform = '';
        clearDragVars(el);
      }
      liveEl.textContent = `${msg} V balíčku: ${plural(queue.length)}.`;
      resolving = false;
      if (!queue.length || interactions >= 20) { finish(); return; }
      render();
      if (hadFocus) topCard()?.focus();
    }, 360);
  };

  $('#btnNo').addEventListener('click', () => resolve('no'));
  $('#btnYes').addEventListener('click', () => resolve('yes'));
  $('#btnDone').addEventListener('click', () => resolve('done'));
  $('#btnFlip').addEventListener('click', () => toggleFlip(topCard()));

  render();
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
