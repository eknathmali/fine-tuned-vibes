/* ============================================================
   EKNATH MALI PORTFOLIO — main.js
   Neural Canvas · Typewriter · Observers · Music · Cursor
   ============================================================ */

'use strict';

/* ── Helpers ── */
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
const cursorEl = qs('#cursor');
let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursorEl.style.left = mx + 'px';
  cursorEl.style.top  = my + 'px';
});

document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursorEl.style.opacity = '1'; });

const hoverTargets = 'a, button, .flip-card, .spill, .impact-card, .ach-card, .contact-item, .social-btn';
qsa(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => cursorEl.classList.add('hovered'));
  el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovered'));
});

/* ============================================================
   2. NAVBAR — scroll + active + mobile
   ============================================================ */
const navbar    = qs('#navbar');
const navMenuBtn = qs('#navMenuBtn');
const navMobile = qs('#navMobile');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  highlightNav();
}, { passive: true });

function highlightNav() {
  const sections  = qsa('section[id]');
  const navLinks  = qsa('.nav-links a, .nav-mobile a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

navMenuBtn.addEventListener('click', () => navMobile.classList.toggle('open'));
qsa('a', navMobile).forEach(a => a.addEventListener('click', () => navMobile.classList.remove('open')));

/* ============================================================
   3. NEURAL NETWORK CANVAS
   ============================================================ */
const canvas = qs('#neuralCanvas');
const ctx    = canvas.getContext('2d');

const NODE_COUNT      = 65;
const CONNECTION_DIST = 160;
const MOUSE_DIST      = 220;

let W, H, nodes = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createNodes() {
  nodes = Array.from({ length: NODE_COUNT }, () => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    vx:   (Math.random() - 0.5) * 0.45,
    vy:   (Math.random() - 0.5) * 0.45,
    r:    Math.random() * 2.2 + 0.8,
    cyan: Math.random() > 0.55,
  }));
}

resizeCanvas();
createNodes();

window.addEventListener('resize', () => {
  resizeCanvas();
  createNodes();
}, { passive: true });

function drawCanvas() {
  ctx.clearRect(0, 0, W, H);

  /* connections between nearby nodes */
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx   = nodes[i].x - nodes[j].x;
      const dy   = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONNECTION_DIST) {
        const alpha = (1 - dist / CONNECTION_DIST) * 0.22;
        const col   = nodes[i].cyan
          ? `rgba(34,211,238,${alpha})`
          : `rgba(168,85,247,${alpha})`;
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth   = 0.8;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  /* lines from nearby nodes to mouse */
  nodes.forEach(n => {
    const dist = Math.hypot(n.x - mx, n.y - my);
    if (dist < MOUSE_DIST) {
      const alpha = (1 - dist / MOUSE_DIST) * 0.55;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
      ctx.lineWidth   = 1.2;
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(mx, my);
      ctx.stroke();
    }
  });

  /* nodes */
  nodes.forEach(n => {
    const col = n.cyan ? '#22D3EE' : '#A855F7';
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle  = col;
    ctx.shadowBlur = 10;
    ctx.shadowColor = col;
    ctx.fill();
    ctx.shadowBlur = 0;

    /* move */
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
  });
}

(function loop() {
  drawCanvas();
  requestAnimationFrame(loop);
})();

/* ============================================================
   4. TYPEWRITER
   ============================================================ */
const roles = [
  'LLM Systems',
  'RAG Pipelines',
  'Multi-Agent Orchestration',
  'AI Microservices',
  'Generative AI Applications'
];

const twEl     = qs('#twText');
const TYPE_SPD = 75;
const DEL_SPD  = 38;
const PAUSE    = 1900;

let rIdx = 0, cIdx = 0, deleting = false;

function typewriter() {
  const word = roles[rIdx];
  if (!deleting) {
    twEl.textContent = word.slice(0, ++cIdx);
    if (cIdx === word.length) {
      deleting = true;
      setTimeout(typewriter, PAUSE);
      return;
    }
  } else {
    twEl.textContent = word.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
    }
  }
  setTimeout(typewriter, deleting ? DEL_SPD : TYPE_SPD);
}
typewriter();

/* ============================================================
   5. SCROLL REVEAL
   ============================================================ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

qsa('.reveal').forEach(el => revealObs.observe(el));

/* Trigger hero immediately (above fold) */
const heroReveal = qs('#hero .reveal');
if (heroReveal) heroReveal.classList.add('visible');

/* ============================================================
   6. COUNTER ANIMATION
   ============================================================ */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value    = Math.round(easeOutCubic(progress) * target);
    /* Format: values ≥ 10000 shown as "10K" etc */
    el.textContent = value >= 10000
      ? (value / 1000).toFixed(0) + 'K'
      : value;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target >= 10000
        ? (target / 1000).toFixed(0) + 'K'
        : target;
    }
  }
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

qsa('.counter').forEach(el => counterObs.observe(el));

/* ============================================================
   7. CGPA PROGRESS RING
   ============================================================ */
(function initRing() {
  const ring = qs('#cgpaRing');
  if (!ring) return;

  /* r = 62 → circumference = 2π × 62 ≈ 389.557 */
  const CIRC = 2 * Math.PI * 62;
  ring.style.strokeDasharray  = CIRC;
  ring.style.strokeDashoffset = CIRC; /* starts empty */

  const ringObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* 9.46 out of 10 → fill 94.6% of the ring */
        const offset = CIRC * (1 - 9.46 / 10);
        ring.style.strokeDashoffset = offset;
        ringObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  ringObs.observe(ring);
})();

/* ============================================================
   8. MUSIC PLAYER
   ============================================================ */
(function initMusic() {
  const audio      = qs('#bgMusic');
  const musicBtn   = qs('#musicToggle');
  const musicLabel = qs('#musicLabel');
  let   playing    = false;

  if (!audio || !musicBtn) return;

  audio.volume = 0.45;

  musicBtn.addEventListener('click', () => {
    if (!playing) {
      audio.play().then(() => {
        playing = true;
        musicBtn.classList.add('playing');
        musicLabel.textContent = 'Banjaare ♪';
      }).catch(() => {
        /* autoplay policy — user gesture already happened, try again */
        audio.muted = false;
        audio.play();
        playing = true;
        musicBtn.classList.add('playing');
        musicLabel.textContent = 'Banjaare ♪';
      });
    } else {
      audio.pause();
      playing = false;
      musicBtn.classList.remove('playing');
      musicLabel.textContent = 'Play Banjaare ♪';
    }
  });

  /* Cursor hover on music button */
  musicBtn.addEventListener('mouseenter', () => cursorEl.classList.add('hovered'));
  musicBtn.addEventListener('mouseleave', () => cursorEl.classList.remove('hovered'));
})();

/* ============================================================
   9. SMOOTH SCROLL for anchor links
   ============================================================ */
qsa('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = qs(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   10. SECTION GRID BACKGROUND GLOW (subtle radial glow per section)
   ============================================================ */
(function sectionGlow() {
  const sections = qsa('.section');
  const glowObs  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.style.setProperty(
        '--glow-opacity',
        entry.isIntersecting ? '1' : '0'
      );
    });
  }, { threshold: 0.2 });
  sections.forEach(s => glowObs.observe(s));
})();

/* ============================================================
   11. HERO NAME SHATTER EFFECT
   Letters split into individual spans, explode on hover,
   repel from cursor in real-time, spring back on leave.
   ============================================================ */
(function initNameShatter() {
  const heroName = qs('.hero-name');
  if (!heroName) return;

  /* Preserve accessibility — label h1 before mangling DOM */
  heroName.setAttribute('aria-label', 'Eknath Mali');

  /* ---- Wrap each character in a .char span ---- */
  /* Preserves leading/trailing whitespace (newlines, indentation) as plain
     text nodes so they never become inline-block spans that break layout  */
  function wrapChars(textNode) {
    const text    = textNode.textContent;
    const trimmed = text.trim();
    if (!trimmed) return;

    const leadEnd    = text.indexOf(trimmed[0]);
    const trailStart = text.lastIndexOf(trimmed[trimmed.length - 1]) + 1;
    const frag       = document.createDocumentFragment();

    /* leading whitespace stays as a plain text node */
    if (leadEnd > 0)
      frag.appendChild(document.createTextNode(text.slice(0, leadEnd)));

    /* wrap only visible characters */
    [...trimmed].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'char';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      frag.appendChild(s);
    });

    /* trailing whitespace (e.g. word-separator space) stays as plain text */
    if (trailStart < text.length)
      frag.appendChild(document.createTextNode(text.slice(trailStart)));

    textNode.parentNode.replaceChild(frag, textNode);
  }

  /* Split direct text node "Eknath" inside h1 */
  [...heroName.childNodes].forEach(n => {
    if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) wrapChars(n);
  });

  /* Split "Mali" inside .name-accent */
  const nameAccent = qs('.name-accent', heroName);
  if (nameAccent) {
    [...nameAccent.childNodes].forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) wrapChars(n);
    });
  }

  /* ---- Build per-character data ---- */
  const MAX_X        = 95;
  const MAX_Y        = 72;
  const REPEL_R      = 145;
  const REPEL_STR    = 90;

  const chars = qsa('.char', heroName).map(el => ({
    el,
    tx: 0, ty: 0, rot: 0, scl: 1,
    natX: 0, natY: 0,
    maxRot:   (Math.random() - 0.5) * 54,
    scatDist: 44 + Math.random() * 50,
  }));

  /* ---- Helpers ---- */
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function applyT(c) {
    c.el.style.transform =
      `translate(${c.tx}px,${c.ty}px) rotate(${c.rot}deg) scale(${c.scl})`;
  }

  /* ---- Cache natural (un-transformed) center positions ---- */
  function cachePos() {
    chars.forEach(c => {
      const r = c.el.getBoundingClientRect();
      c.natX = r.left + r.width  * 0.5;
      c.natY = r.top  + r.height * 0.5;
    });
  }

  /* Cache after fonts are ready so measurements are accurate */
  (document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve()
  ).then(cachePos);
  window.addEventListener('resize', cachePos, { passive: true });

  let hovering = false;

  /* ---- Phase 1: Explode outward on hover ---- */
  function doScatter() {
    chars.forEach(c => {
      const a = Math.random() * Math.PI * 2;
      c.tx  = clamp(Math.cos(a) * c.scatDist, -MAX_X, MAX_X);
      c.ty  = clamp(Math.sin(a) * c.scatDist, -MAX_Y, MAX_Y);
      c.rot = c.maxRot;
      c.scl = 0.68 + Math.random() * 0.55;
      c.el.style.transition = 'transform 0.40s cubic-bezier(0.34,1.28,0.64,1)';
      applyT(c);
    });
    /* After scatter animation ends, remove transition so cursor repulsion is instant */
    setTimeout(() => chars.forEach(c => (c.el.style.transition = '')), 440);
  }

  /* ---- Phase 2: Repel each char away from cursor ---- */
  function doRepel(cursorX, cursorY) {
    chars.forEach(c => {
      /* Visual position = natural position + current offset */
      const vx = c.natX + c.tx;
      const vy = c.natY + c.ty;
      const dx = vx - cursorX;
      const dy = vy - cursorY;
      const d  = Math.hypot(dx, dy) || 1;

      if (d < REPEL_R) {
        const f = (1 - d / REPEL_R) * REPEL_STR;
        c.tx  = clamp(c.tx  + (dx / d) * f * 0.065, -MAX_X, MAX_X);
        c.ty  = clamp(c.ty  + (dy / d) * f * 0.065, -MAX_Y, MAX_Y);
        c.rot = clamp(c.rot + (dx / d) * 2.0 * 0.065, -68, 68);
        c.scl = Math.max(0.45, c.scl - 0.004);
      }
      applyT(c);
    });
  }

  /* ---- Phase 3: Spring back home on leave ---- */
  function doReturn() {
    heroName.classList.remove('shatter-active');
    chars.forEach(c => {
      c.tx = 0; c.ty = 0; c.rot = 0; c.scl = 1;
      c.el.style.transition = 'transform 0.68s cubic-bezier(0.34,1.56,0.64,1)';
      applyT(c);
    });
    setTimeout(() => chars.forEach(c => (c.el.style.transition = '')), 720);
  }

  /* ---- Event listeners ---- */
  heroName.addEventListener('mouseenter', () => {
    if (hovering) return;
    hovering = true;
    /* Cancel any in-progress return animation */
    chars.forEach(c => (c.el.style.transition = 'none'));
    heroName.classList.add('shatter-active');
    doScatter();
    cursorEl.classList.add('hovered');
  });

  heroName.addEventListener('mousemove', e => {
    if (hovering) doRepel(e.clientX, e.clientY);
  });

  heroName.addEventListener('mouseleave', () => {
    hovering = false;
    doReturn();
    cursorEl.classList.remove('hovered');
  });
})();
