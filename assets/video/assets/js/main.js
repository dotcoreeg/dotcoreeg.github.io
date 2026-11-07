(function () {
  'use strict';

  /* ---------------- configuration ----------------
     Contact form: GitHub Pages is static, so the form needs a form backend.
     1. Create a free form at https://formspree.io (or similar) that forwards to dot.core.eg@gmail.com
     2. Paste its endpoint below, e.g. 'https://formspree.io/f/xxxxxxxx'
     While empty, the form opens the visitor's email app with the message prefilled. */
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'dot.core.eg@gmail.com';

  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js');

  /* ---------------- theme ---------------- */
  var tb = $('#theme'), meta = $('meta[name=theme-color]');
  function applyTheme(t) {
    if (t === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    if (tb) tb.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0b0b0b' : '#fafaf8');
    readAccent(); drawAll();
  }
  if (tb) {
    tb.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('dc-theme', next); } catch (e) {}
    });
    tb.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  /* ---------------- mobile menu ---------------- */
  var burger = $('#burger'), links = $('#navLinks');
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
    d.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------------- contact drawer ---------------- */
  var drawer = $('#drawer'), scrim = $('#scrim'), openBtn = $('#openDrawer'), closeBtn = $('#closeDrawer');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) { scrim.hidden = false; requestAnimationFrame(function () { scrim.classList.add('on'); }); closeBtn.focus(); }
    else { scrim.classList.remove('on'); setTimeout(function () { scrim.hidden = true; }, 400); if (openBtn) openBtn.focus(); }
    d.body.style.overflow = open ? 'hidden' : '';
  }
  if (drawer && openBtn) {
    openBtn.addEventListener('click', function () { setMenu(false); setDrawer(true); });
    closeBtn.addEventListener('click', function () { setDrawer(false); });
    scrim.addEventListener('click', function () { setDrawer(false); });
    $('#drawerGo').addEventListener('click', function () { setDrawer(false); });
    $$('.copy', drawer).forEach(function (b) {
      b.addEventListener('click', function () {
        var txt = b.getAttribute('data-copy');
        function done() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
        else {
          var t = d.createElement('textarea'); t.value = txt; d.body.appendChild(t); t.select();
          try { d.execCommand('copy'); } catch (e) {} d.body.removeChild(t); done();
        }
      });
    });
  }
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); if (drawer && drawer.classList.contains('open')) setDrawer(false); }
  });

  /* ---------------- clocks (digital + analog) ---------------- */
  var clocks = $$('time[data-tz]'), analog = $$('[data-ac]');
  function hm(tz, now) {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now), h = 0, m = 0;
      p.forEach(function (x) { if (x.type === 'hour') h = parseInt(x.value, 10) % 24; if (x.type === 'minute') m = parseInt(x.value, 10); });
      return [h, m];
    } catch (e) { return null; }
  }
  function tick() {
    var now = new Date();
    clocks.forEach(function (el) {
      var t = hm(el.getAttribute('data-tz'), now);
      el.textContent = t ? ('0' + t[0]).slice(-2) + ':' + ('0' + t[1]).slice(-2) : '';
    });
    analog.forEach(function (el) {
      var t = hm(el.getAttribute('data-ac'), now); if (!t) return;
      var hands = el.querySelectorAll('i');
      hands[0].style.transform = 'rotate(' + (((t[0] % 12) + t[1] / 60) * 30) + 'deg)';
      hands[1].style.transform = 'rotate(' + (t[1] * 6) + 'deg)';
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 15000); }
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- reveal + counters + line drawing ---------------- */
  $$('.draw circle,.draw rect,.draw path,.draw ellipse,.draw line').forEach(function (e) { e.setAttribute('pathLength', '1'); });
  function count(el) {
    var to = parseInt(el.getAttribute('data-count'), 10) || 0, pad = parseInt(el.getAttribute('data-pad'), 10) || 0;
    function fmt(n) { var s = String(n); while (s.length < pad) s = '0' + s; return s; }
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }
  var revealEls = $$('.rv, .mask, .draw, [data-count]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.hasAttribute('data-count')) count(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
  setTimeout(function () { $$('.hero .mask').forEach(function (m, i) { setTimeout(function () { m.classList.add('in'); }, i * 160); }); }, 80);

  /* ---------------- FAQ: one open at a time ---------------- */
  var det = $$('.faq details');
  det.forEach(function (el) {
    el.addEventListener('toggle', function () {
      if (el.open) det.forEach(function (o) { if (o !== el) o.open = false; });
    });
  });

  /* ---------------- halftone art (original generative dot-matrix) ---------------- */
  var arts = [];
  var ACCENT = '#C2703D';
  function readAccent() { var v = getComputedStyle(root).getPropertyValue('--accent').trim(); if (v) ACCENT = v; }
  readAccent();
  function Art(cv) {
    var self = this;
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.mode = cv.getAttribute('data-ht') || 'field';
    this.step = parseFloat(cv.getAttribute('data-step')) || 8;
    this.seed = parseFloat(cv.getAttribute('data-seed')) || 1;
    this.emblem = cv.getAttribute('data-emblem') === '1';
    this.t = this.seed * 3; this.mx = -9999; this.my = -9999; this.vis = false; this.last = 0;
    this.size();
    var host = cv.parentElement;
    host.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect(); self.mx = e.clientX - r.left; self.my = e.clientY - r.top;
    });
    host.addEventListener('pointerleave', function () { self.mx = self.my = -9999; });
  }
  Art.prototype.size = function () {
    var r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(r.width, 1); this.h = Math.max(r.height, 1);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.mode === 'traces') this.build();
  };
  Art.prototype.val = function (x, y) {
    var w = this.w, h = this.h, t = this.t, s = this.seed, nx = x / w, ny = y / h, v;
    if (this.mode === 'person') {
      var hx = (nx - .5) / .2, hy = (ny - .37) / .24, head = hx * hx + hy * hy;
      var sx = (nx - .5) / .5, sy = (ny - 1.02) / .42, sh = sx * sx + sy * sy;
      var nk = Math.abs(nx - .5) < .07 && ny > .5 && ny < .72 ? 1 : 0;
      var light = .62 + .38 * (1 - nx) + .08 * Math.sin(s * 2 + ny * 5);
      if (head < 1) v = (.9 - .35 * head) * light;
      else if (sh < 1 || nk) v = (.78 - .25 * sh) * light;
      else v = .12 + .1 * Math.sin(nx * 7 + s) * Math.sin(ny * 6 - s);
      v += .04 * Math.sin(t + nx * 9 + ny * 7);
    } else {
      // layered cloud-like field
      v = .5 + .2 * Math.sin(nx * 4.3 + s + t * .4) + .2 * Math.sin(ny * 5.1 - s * 1.3 - t * .35)
        + .12 * Math.sin(nx * 7 + ny * 5 + t * .3 + s) + .09 * Math.sin(nx * 17 - ny * 13 + s * 2 + t * .2)
        + .05 * Math.sin(nx * 31 + ny * 27 - t * .5);
      v = v * .9 + .2;
      if (this.emblem) {
        // the "core": a ring and a dot, rendered as a lighter region in the texture
        var cx = w * .5, cy = h * .5, R = Math.min(w, h) * .34, dd = Math.hypot(x - cx, y - cy);
        var ring = Math.abs(dd - R) < R * .075, dot = dd < R * .24;
        if (ring || dot) v *= .16;
        else if (dd < R * 1.04 && dd > R * .24) v *= .78;
      }
    }
    var md = Math.hypot(x - this.mx, y - this.my);
    if (md < 120) v += (1 - md / 120) * .5;
    return v;
  };

  /* PCB routing animation: signals converge into the Core */
  Art.prototype.build = function () {
    var w = this.w, h = this.h, n = Math.max(6, Math.min(14, Math.round(h / 36)));
    var cx = w * .5, cy = h * .5, gap = Math.max(5, Math.min(9, h / (n * 3.4)));
    var cw = Math.min(w * .2, 120), ch = (n - 1) * gap + 30, m = 22;
    this.chip = { x: cx - cw / 2, y: cy - ch / 2, w: cw, h: ch, n: n, gap: gap };
    this.paths = [];
    var seed = this.seed;
    for (var side = -1; side <= 1; side += 2) {
      for (var i = 0; i < n; i++) {
        var sy = h * .09 + h * .82 * i / (n - 1), ty = cy + (i - (n - 1) / 2) * gap;
        var ex = side < 0 ? this.chip.x : this.chip.x + cw, sx = side < 0 ? 0 : w;
        var maxDy = (side < 0 ? ex : w - ex) - m - 14, dy = Math.abs(sy - ty);
        if (dy > maxDy) { sy = ty + (sy > ty ? 1 : -1) * maxDy; dy = maxDy; }
        var bend = side < 0 ? ex - dy - m : ex + dy + m;
        var pts = [[sx, sy], [bend, sy], [side < 0 ? ex - m : ex + m, ty], [ex, ty]];
        if (side > 0) pts.reverse(); // right side: signal leaves the Core
        var len = 0, cum = [0];
        for (var k = 1; k < pts.length; k++) { len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); cum.push(len); }
        var r1 = Math.abs(Math.sin(seed * 12.9 + i * 78.2 + side * 3.1)) ;
        this.paths.push({ pts: pts, cum: cum, len: len, phase: r1, speed: 55 + r1 * 70, side: side });
      }
    }
  };
  Art.prototype.at = function (p, d) {
    if (d <= 0 || d >= p.len) return null;
    for (var k = 1; k < p.cum.length; k++) {
      if (d <= p.cum[k]) {
        var f = (d - p.cum[k - 1]) / (p.cum[k] - p.cum[k - 1]);
        return [p.pts[k - 1][0] + (p.pts[k][0] - p.pts[k - 1][0]) * f, p.pts[k - 1][1] + (p.pts[k][1] - p.pts[k - 1][1]) * f];
      }
    }
    return null;
  };
  Art.prototype.drawTraces = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = getComputedStyle(this.cv).color, c = this.chip, i, k;
    ctx.clearRect(0, 0, w, h);
    // faint board grid
    ctx.fillStyle = ink; ctx.globalAlpha = .12;
    for (var gx = 12; gx < w; gx += 24) for (var gy = 12; gy < h; gy += 24) ctx.fillRect(gx, gy, 1.2, 1.2);
    ctx.globalAlpha = .38; ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.lineJoin = 'round';
    ctx.beginPath();
    this.paths.forEach(function (p) { ctx.moveTo(p.pts[0][0], p.pts[0][1]); for (var k = 1; k < p.pts.length; k++) ctx.lineTo(p.pts[k][0], p.pts[k][1]); });
    ctx.stroke();
    // pads at outer ends
    ctx.globalAlpha = .6;
    this.paths.forEach(function (p) { var e = p.side < 0 ? p.pts[0] : p.pts[p.pts.length - 1]; ctx.beginPath(); ctx.arc(e[0] + (p.side < 0 ? 4 : -4), e[1], 2.6, 0, 6.2832); ctx.stroke(); });
    // core package
    ctx.globalAlpha = 1; ctx.lineWidth = 1.2;
    ctx.fillStyle = getComputedStyle(this.cv.parentElement).backgroundColor || 'transparent';
    ctx.fillRect(c.x, c.y, c.w, c.h); ctx.strokeRect(c.x, c.y, c.w, c.h);
    var rr = Math.min(c.w, c.h) * .3; ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, rr, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, rr * .38, 0, 6.2832); ctx.fill();
    // signal pulses
    if (!reduce) {
      ctx.fillStyle = ACCENT;
      for (i = 0; i < this.paths.length; i++) {
        var p = this.paths[i], head = ((this.t * 1.25 * p.speed / p.len + p.phase) % 1.6) * p.len;
        for (k = 0; k < 9; k++) {
          var pt = this.at(p, head - k * 5); if (!pt) continue;
          ctx.globalAlpha = (1 - k / 9) * .95; ctx.beginPath(); ctx.arc(pt[0], pt[1], 1.9 - k * .1, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  };

  /* Oscilloscope: the validation side of the work (test, measure, verify) */
  Art.prototype.drawScope = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = getComputedStyle(this.cv).color, x, u, y, cy = h * .5;
    ctx.clearRect(0, 0, w, h);
    var div = Math.max(28, Math.min(w, h) / 5);
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = .13; ctx.beginPath();
    for (x = w / 2 % div; x < w; x += div) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (y = cy % div; y < h; y += div) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
    ctx.globalAlpha = .3; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    var amp = h * .26, off = this.t * 55, period = Math.max(140, w / 3.2), TAU = 6.2832;
    // CH2: clean sine reference
    ctx.globalAlpha = .38; ctx.beginPath();
    for (x = 0; x <= w; x += 3) { y = cy + h * .06 + Math.sin((x + off * .6) / period * TAU) * amp * .55; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    // CH1: digital signal with ringing on the edges (copper)
    ctx.globalAlpha = 1; ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.beginPath();
    for (x = 0; x <= w; x += 2) {
      u = (x + off) / period;
      var s = Math.sin(u * TAU), sq = s > 0 ? 1 : -1, edge = Math.exp(-Math.abs(s) * 14);
      y = cy - amp * (sq * (1 - edge) + Math.tanh(s * 9) * edge * .9 + .1 * Math.sin(u * TAU * 14) * edge);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = ink; ctx.globalAlpha = .65; ctx.font = '500 10px "JetBrains Mono",ui-monospace,monospace';
    ctx.fillText('CH1  3.3 V', 12, 20); ctx.globalAlpha = .4; ctx.fillText('CH2  REF', 12, 34);
    ctx.textAlign = 'right'; ctx.globalAlpha = .45; ctx.fillText('1 ms/div', w - 12, h - 12); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  };

  /* Robotics Core R&D: a 2-link arm (inverse kinematics) tracking a target, with live telemetry */
  Art.prototype.drawRobot = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = getComputedStyle(this.cv).color;
    var bg = getComputedStyle(this.cv.parentElement).backgroundColor || '#000', k = Math.min(w / 1.6, h), i, x, y;
    var T = reduce ? 1.7 : performance.now() / 1000, PI = Math.PI;
    var rb = this.rb || (this.rb = { tg: null, trail: [], a1: [], a2: [], t0: T });
    var L1 = .37 * k, L2 = .30 * k, R = L1 + L2, bx = w * .27, by = h * .86, manual = this.mx > -999;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // blueprint dot grid
    ctx.fillStyle = ink; ctx.globalAlpha = .15; var gs = Math.max(18, k / 16);
    for (x = bx % gs; x < w; x += gs) for (y = by % gs; y < h; y += gs) ctx.fillRect(x - .6, y - .6, 1.3, 1.3);
    // ground, hatch, base
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = .5;
    ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(w, by);
    for (x = bx - 70; x <= bx + 70; x += 8) { ctx.moveTo(x, by); ctx.lineTo(x - 6, by + 7); }
    ctx.stroke();
    ctx.globalAlpha = .9; ctx.fillStyle = bg; ctx.fillRect(bx - 28, by - 15, 56, 15); ctx.strokeRect(bx - 28, by - 15, 56, 15);
    // reach envelope
    ctx.setLineDash([3, 6]); ctx.globalAlpha = .3; ctx.beginPath(); ctx.arc(bx, by, R, PI, 2 * PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(bx, by, Math.abs(L1 - L2), PI, 2 * PI); ctx.stroke(); ctx.setLineDash([]);
    // planned path (figure eight)
    var pcx = bx + .72 * R * Math.cos(.66), pcy = by - .72 * R * Math.sin(.66), pax = .2 * R, pay = .13 * R;
    ctx.globalAlpha = .18; ctx.beginPath();
    for (i = 0; i <= 90; i++) { var uu = i / 90 * 2 * PI; x = pcx + pax * Math.sin(uu); y = pcy - pay * Math.sin(2 * uu); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // target
    var u = (T - rb.t0) * .55 + 1.2, px = pcx + pax * Math.sin(u), py = pcy - pay * Math.sin(2 * u);
    if (manual) { px = this.mx; py = this.my; }
    if (py > by - 14) py = by - 14;
    if (!rb.tg) rb.tg = { x: px, y: py };
    rb.tg.x += (px - rb.tg.x) * .14; rb.tg.y += (py - rb.tg.y) * .14;
    // inverse kinematics (elbow up)
    var dx = rb.tg.x - bx, dy = by - rb.tg.y, d = Math.hypot(dx, dy) || 1, dd = Math.min(Math.max(d, Math.abs(L1 - L2) + 4), R - 2);
    var ux = dx / d * dd, uy = dy / d * dd;
    var c2 = Math.max(-1, Math.min(1, (dd * dd - L1 * L1 - L2 * L2) / (2 * L1 * L2)));
    var th2 = -Math.acos(c2), th1 = Math.atan2(uy, ux) - Math.atan2(L2 * Math.sin(th2), L1 + L2 * Math.cos(th2));
    var j1x = bx + L1 * Math.cos(th1), j1y = by - L1 * Math.sin(th1), a12 = th1 + th2;
    var tx = j1x + L2 * Math.cos(a12), ty = j1y - L2 * Math.sin(a12);
    // trail (copper)
    rb.trail.push([tx, ty]); if (rb.trail.length > 90) rb.trail.shift();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.7;
    for (i = 1; i < rb.trail.length; i++) { ctx.globalAlpha = i / rb.trail.length * .9; ctx.beginPath(); ctx.moveTo(rb.trail[i - 1][0], rb.trail[i - 1][1]); ctx.lineTo(rb.trail[i][0], rb.trail[i][1]); ctx.stroke(); }
    // links
    function link(x1, y1, x2, y2, wd) {
      var len = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1), r = wd / 2;
      ctx.save(); ctx.translate(x1, y1); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(len, -r); ctx.arc(len, 0, r, -PI / 2, PI / 2); ctx.lineTo(0, r); ctx.arc(0, 0, r, PI / 2, PI * 1.5); ctx.closePath();
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.globalAlpha = .95; ctx.stroke();
      ctx.setLineDash([4, 5]); ctx.globalAlpha = .35; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
    link(bx, by - 8, j1x, j1y, 17); link(j1x, j1y, tx, ty, 13);
    // joints
    function joint(cx, cy, r) { ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, 2 * PI); ctx.fill(); }
    joint(bx, by - 8, 9); joint(j1x, j1y, 7); joint(tx, ty, 4.5);
    // gripper
    var op = .3 + .22 * Math.sin(T * 2.2), gl = 17;
    ctx.strokeStyle = ink; ctx.lineWidth = 1.6; ctx.globalAlpha = .95; ctx.beginPath();
    [op, -op].forEach(function (o) { var ang = -(a12 + o); ctx.moveTo(tx, ty); ctx.lineTo(tx + gl * Math.cos(ang), ty + gl * Math.sin(ang)); ctx.lineTo(tx + gl * Math.cos(ang) + 5 * Math.cos(ang + (o > 0 ? 1.3 : -1.3)), ty + gl * Math.sin(ang) + 5 * Math.sin(ang + (o > 0 ? 1.3 : -1.3))); });
    ctx.stroke();
    // joint angle arcs (copper) + labels
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.5; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(bx, by - 8, 34, 0, -th1, true); ctx.stroke();
    ctx.beginPath(); ctx.arc(j1x, j1y, 26, -th1, -a12, th2 > 0); ctx.stroke();
    var deg = function (r) { var v = Math.round(r * 180 / PI * 10) / 10; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '°'; };
    ctx.font = '500 10px "JetBrains Mono",ui-monospace,monospace'; ctx.fillStyle = ACCENT;
    ctx.fillText('θ1', bx + 40, by - 18); ctx.fillText('θ2', j1x + 30, j1y - 8);
    // target crosshair
    ctx.strokeStyle = ink; ctx.globalAlpha = .8; ctx.lineWidth = 1; ctx.beginPath();
    ctx.arc(rb.tg.x, rb.tg.y, 6, 0, 2 * PI); ctx.moveTo(rb.tg.x - 12, rb.tg.y); ctx.lineTo(rb.tg.x + 12, rb.tg.y); ctx.moveTo(rb.tg.x, rb.tg.y - 12); ctx.lineTo(rb.tg.x, rb.tg.y + 12); ctx.stroke();
    ctx.fillStyle = ink; ctx.globalAlpha = .55; ctx.fillText('TGT', rb.tg.x + 10, rb.tg.y - 9);
    // link labels
    ctx.globalAlpha = .5; ctx.fillText('L1', (bx + j1x) / 2 - 22, (by + j1y) / 2 - 8); ctx.fillText('L2', (j1x + tx) / 2 + 12, (j1y + ty) / 2 - 10);
    // telemetry
    rb.a1.push(th1); rb.a2.push(th2); if (rb.a1.length > 110) { rb.a1.shift(); rb.a2.shift(); }
    ctx.globalAlpha = .95; ctx.fillStyle = ink; ctx.fillText('ROBOTICS CORE — R&D', 14, 22);
    ctx.globalAlpha = .5; ctx.fillText('FIG. 03 · TRAJECTORY TRACKING', 14, 36);
    ctx.globalAlpha = .85; ctx.fillText('θ1 ' + deg(th1) + '   θ2 ' + deg(th2), 14, 56);
    ctx.fillText('TCP ' + ((tx - bx) / R).toFixed(2) + ' / ' + ((by - ty) / R).toFixed(2), 14, 70);
    ctx.globalAlpha = .6; ctx.fillText('MODE ' + (manual ? 'MANUAL' : 'AUTO'), 14, 84);
    // sparkline panel
    var sw = Math.min(150, w * .32), sh = 38, sx0 = w - sw - 14, sy0 = h - sh - 14;
    ctx.globalAlpha = .3; ctx.strokeStyle = ink; ctx.strokeRect(sx0, sy0, sw, sh);
    function spark(arr, col, a) { ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = 1.3; ctx.beginPath(); for (var q = 0; q < arr.length; q++) { var vx = sx0 + q / 109 * sw, vy = sy0 + sh / 2 - (arr[q] / PI) * sh * .8; q ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy); } ctx.stroke(); }
    spark(rb.a2, ink, .55); spark(rb.a1, ACCENT, 1);
    ctx.fillStyle = ink; ctx.globalAlpha = .45; ctx.fillText('JOINT ANGLES', sx0, sy0 - 6);
    // corner marks
    ctx.strokeStyle = ink; ctx.globalAlpha = .4; ctx.lineWidth = 1; ctx.beginPath();
    [[6, 6, 1, 1], [w - 6, 6, -1, 1], [6, h - 6, 1, -1], [w - 6, h - 6, -1, -1]].forEach(function (c) { ctx.moveTo(c[0], c[1] + c[3] * 10); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] + c[2] * 10, c[1]); });
    ctx.stroke(); ctx.globalAlpha = 1;
  };
  Art.prototype.draw = function () {
    if (this.mode === 'traces') return this.drawTraces();
    if (this.mode === 'robot') return this.drawRobot();
    if (this.mode === 'scope') return this.drawScope();
    var ctx = this.ctx, st = this.step, w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(this.cv).color;
    ctx.beginPath();
    var r = st * .5, off = st / 2;
    for (var y = off; y < h; y += st) {
      for (var x = off; x < w; x += st) {
        var v = this.val(x, y); if (v < .06) continue;
        v = v > 1 ? 1 : v;
        var rad = r * Math.pow(v, 1.12) * .98;
        if (rad < .3) continue;
        ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, 6.2832);
      }
    }
    ctx.fill();
    if (this.emblem) { ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(w * .5, h * .5, Math.min(w, h) * .34 * .13, 0, 6.2832); ctx.fill(); }
  };
  $$('canvas[data-ht]').forEach(function (cv) { arts.push(new Art(cv)); });
  function drawAll() { arts.forEach(function (a) { a.draw(); }); }
  function loop(now) {
    requestAnimationFrame(loop);
    arts.forEach(function (a) {
      if (!a.vis || (a.mode === 'person' && a.mx < -999)) return;
      if (now - a.last < (a.mode === 'robot' ? 30 : 50)) return;
      a.last = now; a.t += .04; a.draw();
    });
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = arts.filter(function (x) { return x.cv === en.target; })[0];
        if (a) { a.vis = en.isIntersecting; if (a.vis) a.draw(); }
      });
    }, { rootMargin: '100px' });
    arts.forEach(function (a) { vio.observe(a.cv); });
  } else { arts.forEach(function (a) { a.vis = true; }); }
  var rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz); rz = setTimeout(function () { arts.forEach(function (a) { a.size(); a.draw(); }); }, 150);
  });
  drawAll();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { arts.forEach(function (a) { a.size(); a.draw(); }); });
  if (!reduce && arts.length) requestAnimationFrame(loop);

  /* ---------------- optional videos (hero + backgrounds) ---------------- */
  var vids = $$('.hx-a2 video, .vbg video');
  vids.forEach(function (v) {
    v.muted = true;
    v.addEventListener('canplay', function () { v.parentElement.classList.add('has-video'); });
    v.addEventListener('error', function () { v.parentElement.classList.remove('has-video'); v.remove(); });
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
      }, { threshold: 0.05 }).observe(v);
    }
  });

  /* ---------------- testimonial slider ---------------- */
  var track = $('#slides');
  if (track) {
    var slides = $$('.slide', track), n = slides.length, idx = 0, dots = $('#dots');
    var cur = $('#sCur'), tot = $('#sTot');
    if (tot) tot.textContent = ('0' + n).slice(-2);
    slides.forEach(function (_, i) {
      var b = d.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dots.appendChild(b);
    });
    function go(i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== idx)); });
      $$('button', dots).forEach(function (b, k) { b.setAttribute('aria-current', String(k === idx)); });
      if (cur) cur.textContent = ('0' + (idx + 1)).slice(-2);
    }
    $('#sPrev').addEventListener('click', function () { go(idx - 1); });
    $('#sNext').addEventListener('click', function () { go(idx + 1); });
    var sx = null;
    track.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    track.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    });
    $('#voices').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(idx + 1); else if (e.key === 'ArrowLeft') go(idx - 1);
    });
    go(0);
  }

  /* ---------------- quick email -> full form ---------------- */
  var quick = $('#quick');
  if (quick) {
    quick.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#q-email').value.trim(), fe = $('#f-email');
      if (v) fe.value = v;
      var target = $('#f-name'); if (!v) target = fe;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () { target.focus({ preventScroll: true }); }, 500);
    });
  }

  /* ---------------- contact form ---------------- */
  var form = $('#form');
  if (form) {
    var status = $('#status'), btn = $('#submit');
    function say(msg, bad) { status.textContent = msg; status.classList.toggle('err', !!bad); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get('website')) return; // honeypot
      var name = (data.get('name') || '').trim(), email = (data.get('email') || '').trim(), msg = (data.get('message') || '').trim();
      if (!name || !msg) { say('Please add your name and a short description of the project.', true); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Please enter a valid email address.', true); return; }
      var payload = { name: name, email: email, organization: data.get('organization') || '', type: data.get('type') || '', message: msg };
      if (FORM_ENDPOINT) {
        btn.disabled = true; say('Sending…');
        fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { if (!r.ok) throw new Error('bad'); form.reset(); say('Thank you. Your inquiry was sent.'); })
          .catch(function () { say('Could not send. Please email ' + CONTACT_EMAIL + ' directly.', true); })
          .then(function () { btn.disabled = false; });
      } else {
        var subject = encodeURIComponent(payload.type + ' — ' + name);
        var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nOrganization: ' + payload.organization + '\nRequest: ' + payload.type + '\n\n' + msg);
        say('Opening your email app…');
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
      }
    });
  }
})();
