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
  var ACCENT = '#0b0b0b';
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
    if (this.mode === 'cores') host.addEventListener('click', function (e) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (y < self.h - 36 || !self.ind || !self.sw) return;
      self.ind.forEach(function (q) { if (x >= q.a && x <= q.b) { self.sw.i = q.i; self.sw.t0 = performance.now(); self.draw(); } });
    });
  }
  Art.prototype.size = function () {
    var r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(r.width, 1); this.h = Math.max(r.height, 1);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.mode === 'traces' || this.mode === 'cores') this.build();
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
  /* ---------- shared helpers ---------- */
  var MONO = '500 10px "JetBrains Mono",ui-monospace,monospace', TAU = 6.2832;
  function pl(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.stroke(); }
  function plAt(p, u) {
    var L = 0, i, s = [], d;
    for (i = 1; i < p.length; i++) { var l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); s.push(l); L += l; }
    d = Math.max(0, Math.min(1, u)) * L;
    for (i = 0; i < s.length; i++) { if (d <= s[i]) { var f = s[i] ? d / s[i] : 0; return [p[i][0] + (p[i + 1][0] - p[i][0]) * f, p[i][1] + (p[i + 1][1] - p[i][1]) * f]; } d -= s[i]; }
    return p[p.length - 1];
  }
  Art.prototype.bgc = function () {
    var e = this.cv, c;
    while (e) { c = getComputedStyle(e).backgroundColor; if (c && c !== 'transparent' && !/,\s*0\)$/.test(c)) return c; e = e.parentElement; }
    return '#fff';
  };
  function now_() { return reduce ? 2200 : performance.now(); }
  function hdr(a, t1, t2, back) {
    var ctx = a.ctx; ctx.font = MONO;
    if (back) { ctx.globalAlpha = .92; ctx.fillStyle = a.bg; ctx.fillRect(8, 8, 230, 34); }
    ctx.fillStyle = a.ink; ctx.globalAlpha = .95; ctx.fillText(t1, 14, 22);
    ctx.globalAlpha = .5; ctx.fillText(t2, 14, 36); ctx.globalAlpha = 1;
  }
  function gridDots(a, ox, oy, gs) {
    var ctx = a.ctx, x, y; ctx.fillStyle = a.ink; ctx.globalAlpha = .14;
    for (x = ox % gs; x < a.w; x += gs) for (y = oy % gs; y < a.h; y += gs) ctx.fillRect(x - .6, y - .6, 1.3, 1.3);
    ctx.globalAlpha = 1;
  }
  function node(a, x, y, r, on) {
    var ctx = a.ctx; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = on ? a.ink : a.bg; ctx.fill(); ctx.strokeStyle = a.ink; ctx.lineWidth = 1.3; ctx.stroke();
  }

  /* ---------- Hero: the Cores, one at a time ---------- */
  var SC_DUR = 7000, SC_NAMES = ['PCB', 'EMBEDDED', 'ROBOTICS', 'AUTOMATION'];
  Art.prototype.drawEmbedded = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = this.ink, bg = this.bg, T = now_() / 1000, i, j, p, k = Math.min(w, h);
    var cx = w * .5, cy = h * .53, s = k * .3, bw = Math.max(50, Math.min(64, w * .13)), bh = 24, pins = 6;
    ctx.clearRect(0, 0, w, h);gridDots(this, cx, cy, Math.max(18, k / 16));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.font = MONO;
    function pinY(n) { return cy - s / 2 + (n + 1) * s / (pins + 1); }
    var routes = [], L = ['SENSOR', 'ADC', 'I²C'], R = ['UART', 'CAN'];
    for (j = 0; j < 3; j++) { var by = cy + (j - 1) * s * .52, py = pinY([1, 2, 4][j]), mx = w * .5 - s / 2 - 20 - j * 7; routes.push({ p: [[14 + bw, by], [mx, by], [mx, py], [cx - s / 2 - 8, py]], x: 14, y: by, n: L[j], dir: 1, o: j * .31 }); }
    for (j = 0; j < 2; j++) { var by2 = cy + (j - .5) * s * .7, py2 = pinY([2, 4][j]), mx2 = cx + s / 2 + 20 + j * 8; routes.push({ p: [[cx + s / 2 + 8, py2], [mx2, py2], [mx2, by2], [w - 14 - bw, by2]], x: w - 14 - bw, y: by2, n: R[j], dir: 1, o: .5 + j * .37 }); }
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    routes.forEach(function (r) {
      ctx.globalAlpha = .4; pl(ctx, r.p);
      ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(r.x, r.y - bh / 2, bw, bh); ctx.globalAlpha = .9; ctx.strokeRect(r.x, r.y - bh / 2, bw, bh);
      ctx.fillStyle = ink; ctx.globalAlpha = .75; ctx.textAlign = 'center'; ctx.fillText(r.n, r.x + bw / 2, r.y + 3.5); ctx.textAlign = 'left';
      for (var q = 0; q < 3; q++) { var u = (T * .38 + r.o + q / 3) % 1, pt = plAt(r.p, u); ctx.globalAlpha = 1; ctx.fillStyle = ink; ctx.fillRect(pt[0] - 2.5, pt[1] - 2.5, 5, 5); }
    });
    // chip + pins
    ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
    ctx.lineWidth = 1.2; ctx.beginPath();
    for (i = 1; i <= pins; i++) {
      var f = i * s / (pins + 1);
      ctx.moveTo(cx - s / 2 + f, cy - s / 2); ctx.lineTo(cx - s / 2 + f, cy - s / 2 - 8);
      ctx.moveTo(cx - s / 2 + f, cy + s / 2); ctx.lineTo(cx - s / 2 + f, cy + s / 2 + 8);
      ctx.moveTo(cx - s / 2, cy - s / 2 + f); ctx.lineTo(cx - s / 2 - 8, cy - s / 2 + f);
      ctx.moveTo(cx + s / 2, cy - s / 2 + f); ctx.lineTo(cx + s / 2 + 8, cy - s / 2 + f);
    }
    ctx.stroke(); ctx.globalAlpha = .4; ctx.lineWidth = 1; ctx.strokeRect(cx - s * .3, cy - s * .3, s * .6, s * .6);
    ctx.beginPath(); ctx.arc(cx - s / 2 + 8, cy - s / 2 + 8, 2.2, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText('MCU', cx, cy + 3.5); ctx.textAlign = 'left';
    // clock above the chip
    var wy = cy - s / 2 - 24, wp = 18, off = (T * 30) % (wp * 2), xx;
    ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath();
    for (xx = -wp * 2; xx < s + wp * 2; xx += wp) { var X = cx - s / 2 + xx - off + wp * 2, hi = (Math.floor(xx / wp) % 2 === 0); }
    var pts = [], seg;
    for (seg = 0; seg < s / wp + 4; seg++) { var x0 = cx - s / 2 - off + seg * wp, yy = (seg % 2) ? wy : wy - 8; pts.push([x0, yy], [x0 + wp, yy]); }
    ctx.save(); ctx.beginPath(); ctx.rect(cx - s / 2, wy - 14, s, 22); ctx.clip();
    ctx.beginPath(); pts.forEach(function (q, n) { n ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    ctx.globalAlpha = .45; ctx.fillStyle = ink; ctx.fillText('CLK', cx - s / 2, wy - 18);
    // readout
    var pc = ('0000' + ((T * 977) | 0 & 0xffff).toString(16).toUpperCase()).slice(-4);
    ctx.globalAlpha = .85; ctx.fillText('PC  0x08' + pc, 14, 56); ctx.fillText('IRQ ' + (((T * 3) | 0) % 8), 14, 70); ctx.globalAlpha = .6; ctx.fillText('STATE RUN', 14, 84);
    // UART bit stream panel
    var sw = Math.min(150, w * .32), sh = 34, sx0 = w - sw - 14, sy0 = h - sh - 14, bits = 22, bwid = sw / bits, sh0 = (T * 4) | 0;
    ctx.globalAlpha = .3; ctx.strokeRect(sx0, sy0, sw, sh);
    ctx.globalAlpha = 1; ctx.lineWidth = 1.3; ctx.beginPath();
    for (i = 0; i < bits; i++) { var bit = ((((i + sh0) * 2654435761) >>> 7) & 1), yb = sy0 + (bit ? 8 : sh - 8); i ? ctx.lineTo(sx0 + i * bwid, yb) : ctx.moveTo(sx0, yb); ctx.lineTo(sx0 + (i + 1) * bwid, yb); }
    ctx.stroke(); ctx.globalAlpha = .45; ctx.fillText('UART TX', sx0, sy0 - 6); ctx.globalAlpha = 1;
  };
  Art.prototype.drawAutomation = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = this.ink, bg = this.bg, T = now_() / 1000, i, x;
    var by = h * .74, v = 46, sp = Math.max(96, w * .17), bwid = 34, bhei = 26, xs = w * .4, xp = w * .68;
    ctx.clearRect(0, 0, w, h);gridDots(this, 10, by, Math.max(18, Math.min(w, h) / 16));
    ctx.font = MONO; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // belt + rollers
    ctx.strokeStyle = ink; ctx.lineWidth = 1.3; ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(w, by); ctx.moveTo(0, by + 10); ctx.lineTo(w, by + 10); ctx.stroke();
    ctx.lineWidth = 1; for (x = 14; x < w; x += 30) { ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, by + 5, 5, 0, TAU); ctx.fill(); ctx.stroke(); var an = T * v / 5 + x; ctx.beginPath(); ctx.moveTo(x, by + 5); ctx.lineTo(x + 4 * Math.cos(an), by + 5 + 4 * Math.sin(an)); ctx.stroke(); }
    // sensor + beam
    var shy = by - 78, blocked = false, kmax = Math.floor(T * v / sp) + 1, kmin = Math.ceil((T * v - w - sp) / sp), count = Math.max(0, Math.floor((T * v - xs) / sp) + 1);
    var rej = 0; for (i = 0; i < count; i++) if (i % 4 === 0) rej++;
    for (i = kmin; i <= kmax; i++) {
      var bx = T * v - i * sp, y0 = by - bhei, al = 1;
      if (Math.abs(bx - xs) < bwid / 2 + 2) blocked = true;
      if (i % 4 === 0 && bx > xp) { var dd = bx - xp; y0 -= dd * .55; al = Math.max(0, 1 - dd / 90); }
      if (al <= 0) continue;
      ctx.globalAlpha = al; ctx.fillStyle = bg; ctx.fillRect(bx - bwid / 2, y0, bwid, bhei); ctx.strokeStyle = ink; ctx.lineWidth = 1.3; ctx.strokeRect(bx - bwid / 2, y0, bwid, bhei);
      ctx.globalAlpha = al * .4; ctx.beginPath(); ctx.moveTo(bx - bwid / 2, y0 + 8); ctx.lineTo(bx + bwid / 2, y0 + 8); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.strokeStyle = ink; ctx.lineWidth = 1.3; ctx.fillStyle = bg;
    ctx.fillRect(xs - 9, shy, 18, 14); ctx.strokeRect(xs - 9, shy, 18, 14);
    ctx.setLineDash(blocked ? [] : [3, 4]); ctx.globalAlpha = blocked ? 1 : .5; ctx.beginPath(); ctx.moveTo(xs, shy + 14); ctx.lineTo(xs, by); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = ink; ctx.globalAlpha = .55; ctx.fillText('SENSOR', xs - 22, shy - 6);
    // pusher (reject station)
    var ext = 0; for (i = kmin; i <= kmax; i++) { if (i % 4 === 0) { var e = 1 - Math.min(1, Math.abs(T * v - i * sp - (xp - 14)) / 16); ext = Math.max(ext, e); } }
    ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(xp - 14, shy - 6, 28, 14); ctx.strokeRect(xp - 14, shy - 6, 28, 14);
    ctx.beginPath(); ctx.moveTo(xp, shy + 8); ctx.lineTo(xp, shy + 8 + ext * 36); ctx.stroke(); ctx.fillStyle = ink; ctx.fillRect(xp - 8, shy + 8 + ext * 36 - 1, 16, 3);
    ctx.globalAlpha = .55; ctx.fillText('REJECT', xp - 20, shy - 12);
    // PID step response
    var sw = Math.min(190, w * .34), sh = 64, sx0 = w - sw - 14, sy0 = 56, u = (T % 5) / 5, rf = function (q) { return 1 - Math.exp(-3.4 * q) * Math.cos(10 * q); }, pv = rf(u);
    ctx.globalAlpha = .3; ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(sx0, sy0, sw, sh);
    ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(sx0, sy0 + sh * .3); ctx.lineTo(sx0 + sw, sy0 + sh * .3); ctx.stroke(); ctx.setLineDash([]);
    function yr(q) { return sy0 + sh - rf(q) * sh * .55 - 4; }
    ctx.globalAlpha = .3; ctx.beginPath(); for (i = 0; i <= 60; i++) { var qq = i / 60; i ? ctx.lineTo(sx0 + qq * sw, yr(qq)) : ctx.moveTo(sx0, yr(0)); } ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 1.6; ctx.beginPath(); for (i = 0; i <= Math.round(u * 60); i++) { var q2 = i / 60; i ? ctx.lineTo(sx0 + q2 * sw, yr(q2)) : ctx.moveTo(sx0, yr(0)); } ctx.stroke();
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(sx0 + u * sw, yr(u), 2.8, 0, TAU); ctx.fill();
    ctx.globalAlpha = .45; ctx.fillText('SP / PV', sx0, sy0 - 6);
    ctx.globalAlpha = .85; ctx.fillText('COUNT ' + ('0000' + (count % 10000)).slice(-4), 14, 56); ctx.fillText('REJECT ' + ('0000' + (rej % 10000)).slice(-4), 14, 70);
    ctx.globalAlpha = .6; ctx.fillText('SP 100.0   PV ' + (pv * 100).toFixed(1), 14, 84); ctx.globalAlpha = 1;
  };
  Art.prototype.drawCores = function () {
    var ctx = this.ctx, w = this.w, h = this.h, now = now_(), s = this.sw || (this.sw = { i: 0, t0: now }), i, el, tot = SC_DUR / 1000;
    if (reduce) s.i = 2; else if (now - s.t0 > SC_DUR) { s.i = (s.i + 1) % 4; s.t0 = now; }
    var H = [['PCB CORE — HARDWARE', 'FIG. 01 · SIGNAL ROUTING'], ['EMBEDDED CORE — FIRMWARE', 'FIG. 02 · SENSOR TO BUS'], null, ['AUTOMATION CORE — CONTROL', 'FIG. 04 · CLOSED-LOOP CONTROL']];
    if (s.i === 0) this.drawTraces(); else if (s.i === 1) this.drawEmbedded(); else if (s.i === 2) this.drawRobot(); else this.drawAutomation();
    if (H[s.i]) hdr(this, H[s.i][0], H[s.i][1], s.i === 0);
    el = (now - s.t0) / 1000;
    var f = el < .45 ? 1 - el / .45 : (tot - el < .45 ? 1 - (tot - el) / .45 : 0);
    if (f > 0 && !reduce) { ctx.globalAlpha = f; ctx.fillStyle = this.bg; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    // Core index (click to jump)
    ctx.font = MONO; var x = 14, y = h - 16, short = w < 560; this.ind = [];
    for (i = 0; i < 4; i++) {
      var tx = '0' + (i + 1) + (short ? '' : ' ' + SC_NAMES[i]), tw = ctx.measureText(tx).width;
      ctx.fillStyle = this.ink; ctx.globalAlpha = i === s.i ? 1 : .38; ctx.fillText(tx, x, y);
      if (i === s.i) { ctx.fillRect(x, y + 5, tw, 1); ctx.globalAlpha = .35; ctx.fillRect(x, y + 5, tw * Math.min(1, el / tot), 1.6); }
      this.ind.push({ a: x - 6, b: x + tw + 6, i: i }); x += tw + (short ? 12 : 18);
    }
    ctx.globalAlpha = 1;
  };

  /* ---------- Section motion ---------- */
  Art.prototype.region = function () { var w = this.w, h = this.h, narrow = w < 520; return { x0: w * (narrow ? .38 : .44), x1: w - 20, y0: 58, y1: h - 52 }; };
  Art.prototype.drawOrbit = function () {
    var ctx = this.ctx, R = this.region(), T = now_() / 1000, i, cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, rm = Math.min((R.x1 - R.x0) / 2, (R.y1 - R.y0) / 2) - 8;
    ctx.clearRect(0, 0, this.w, this.h); ctx.font = '500 9px "JetBrains Mono",ui-monospace,monospace'; ctx.strokeStyle = this.ink; ctx.lineWidth = 1;
    var sp = [.55, .42, .33, .26];
    for (i = 0; i < 4; i++) {
      var r = rm * (.34 + i * .22), a = T * sp[i] + i * 1.7;
      ctx.globalAlpha = .26; ctx.setLineDash(i ? [3, 5] : []); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      var nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a); ctx.globalAlpha = 1; node(this, nx, ny, 5.5, i === 0);
      ctx.fillStyle = this.ink; ctx.globalAlpha = .65; ctx.fillText('0' + (i + 1), nx + 9, ny - 8);
    }
    var ph = (T * .5) % 1; ctx.globalAlpha = (1 - ph) * .5; ctx.beginPath(); ctx.arc(cx, cy, 12 + ph * 16, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillStyle = this.ink; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, TAU); ctx.fill();
    ctx.globalAlpha = .55; ctx.textAlign = 'right'; ctx.fillText('● ACTIVE   ○ PLANNED', R.x1, this.h - 18); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  };
  Art.prototype.drawFlow = function () {
    var ctx = this.ctx, R = this.region(), T = now_() / 1000, i, cy = (R.y0 + R.y1) / 2, n = 5, names = ['REQ', 'ARCH', 'BUILD', 'VERIFY', 'HAND'], xs = [];
    ctx.clearRect(0, 0, this.w, this.h); ctx.font = '500 9px "JetBrains Mono",ui-monospace,monospace';
    for (i = 0; i < n; i++) xs.push(R.x0 + 8 + i * (R.x1 - R.x0 - 16) / (n - 1));
    var p = reduce ? 1.1 : (T * .22) % 1.3, f = Math.min(p, 1) * (n - 1);
    ctx.strokeStyle = this.ink; ctx.lineWidth = 1; ctx.globalAlpha = .3; ctx.beginPath(); ctx.moveTo(xs[0], cy); ctx.lineTo(xs[n - 1], cy); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(xs[0], cy); ctx.lineTo(xs[0] + (xs[n - 1] - xs[0]) * f / (n - 1), cy); ctx.stroke();
    for (i = 0; i < n - 1; i++) { var gx = (xs[i] + xs[i + 1]) / 2; ctx.globalAlpha = f > i + .5 ? 1 : .35; ctx.beginPath(); ctx.moveTo(gx, cy - 9); ctx.lineTo(gx, cy + 9); ctx.stroke(); }
    for (i = 0; i < n; i++) {
      ctx.globalAlpha = 1; node(this, xs[i], cy, 6.5, f >= i - .01 && p > .01);
      ctx.fillStyle = this.ink; ctx.globalAlpha = f >= i ? .85 : .4; ctx.textAlign = 'center'; ctx.fillText(names[i], xs[i], cy + 26); ctx.fillText('0' + (i + 1), xs[i], cy - 18);
    }
    ctx.textAlign = 'left'; ctx.globalAlpha = .55; ctx.fillStyle = this.ink; ctx.textAlign = 'right'; ctx.fillText('REVIEW GATE ▏BETWEEN STAGES', R.x1, this.h - 18); ctx.textAlign = 'left';
    if (p < 1.001) { ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(xs[0] + (xs[n - 1] - xs[0]) * f / (n - 1), cy, 2.6, 0, TAU); ctx.fillStyle = this.bg; ctx.fill(); }
    ctx.globalAlpha = 1;
  };
  Art.prototype.drawNet = function () {
    var ctx = this.ctx, R = this.region(), T = now_() / 1000, i; R.x0 = Math.max(R.x0, this.w * .5); var cx = (R.x0 + R.x1) / 2, ty = R.y0 + 8, ly = R.y1 - 4, bus = (ty + ly) / 2, names = ['PCB', 'EMB', 'ROB', 'AUT'], xs = [];
    ctx.clearRect(0, 0, this.w, this.h); ctx.font = '500 9px "JetBrains Mono",ui-monospace,monospace'; ctx.strokeStyle = this.ink; ctx.lineWidth = 1;
    for (i = 0; i < 4; i++) xs.push(R.x0 + 14 + i * (R.x1 - R.x0 - 28) / 3);
    var paths = xs.map(function (x) { return [[cx, ty], [cx, bus], [x, bus], [x, ly]]; });
    ctx.globalAlpha = .35; paths.forEach(function (p) { pl(ctx, p); });
    for (i = 0; i < 4; i++) { var u = ((T * .26 + i * .12) % 1.4) / 1.4, pt = plAt(paths[i], u); ctx.globalAlpha = 1; ctx.fillStyle = this.ink; ctx.fillRect(pt[0] - 2.5, pt[1] - 2.5, 5, 5); }
    ctx.globalAlpha = 1; node(this, cx, ty, 7, true);
    for (i = 0; i < 4; i++) { node(this, xs[i], ly, 6, i === 0); ctx.fillStyle = this.ink; ctx.globalAlpha = .7; ctx.textAlign = 'center'; ctx.fillText(names[i], xs[i], ly - 12); ctx.globalAlpha = 1; }
    ctx.globalAlpha = .6; ctx.fillStyle = this.ink; ctx.fillText('FOUNDER', cx + 12, ty + 3); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  };
  Art.prototype.drawVoices = function () {
    var ctx = this.ctx, R = this.region(), T = now_() / 1000, i, nb = Math.max(10, Math.floor((R.x1 - R.x0) / 7)), cy = (R.y0 + R.y1) / 2, mh = (R.y1 - R.y0) / 2;
    ctx.clearRect(0, 0, this.w, this.h); ctx.strokeStyle = this.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
    var env = Math.pow(.5 + .5 * Math.sin(T * 1.3), 1.5) * (.65 + .35 * Math.sin(T * 5.1));
    for (i = 0; i < nb; i++) {
      var x = R.x0 + 4 + i * (R.x1 - R.x0 - 8) / (nb - 1), cw = Math.sin(i / (nb - 1) * Math.PI), a = .12 + .88 * Math.abs(Math.sin(i * .45 + T * 3) * Math.cos(i * .21 - T * 1.7)), hh = mh * (.08 + .9 * env * a * (.4 + .6 * cw));
      ctx.globalAlpha = .35 + .6 * (hh / mh); ctx.beginPath(); ctx.moveTo(x, cy - hh); ctx.lineTo(x, cy + hh); ctx.stroke();
    }
    ctx.font = '500 9px "JetBrains Mono",ui-monospace,monospace'; ctx.fillStyle = this.ink; ctx.globalAlpha = .55; ctx.textAlign = 'right'; ctx.fillText('CLIENT FEEDBACK', R.x1, this.h - 18); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  };
  Art.prototype.drawFaq = function () {
    var ctx = this.ctx, R = this.region(), T = now_() / 1000, i, j, cy = (R.y0 + R.y1) / 2, xs = [R.x0 + 8, R.x0 + (R.x1 - R.x0) * .42, R.x1 - 12];
    ctx.clearRect(0, 0, this.w, this.h); ctx.font = '500 10px "JetBrains Mono",ui-monospace,monospace'; ctx.strokeStyle = this.ink; ctx.lineWidth = 1;
    var span = R.y1 - R.y0, l2 = [0, 1, 2, 3].map(function (q) { return R.y0 + span * (q + .5) / 4; }), l1 = [(l2[0] + l2[1]) / 2, (l2[2] + l2[3]) / 2];
    function curve(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2); ctx.stroke(); }
    ctx.globalAlpha = .3; l1.forEach(function (y, a) { curve(xs[0], cy, xs[1], y); [0, 1].forEach(function (b) { curve(xs[1], y, xs[2], l2[a * 2 + b]); }); });
    var cyc = reduce ? 0 : Math.floor(T / 3.6) % 4, ph = reduce ? 1 : (T % 3.6) / 3.6, a = cyc >> 1, lf = cyc;
    var prog = Math.min(1, ph / .6);
    ctx.globalAlpha = 1; ctx.lineWidth = 1.8;
    var seg1 = Math.min(1, prog * 2), seg2 = Math.max(0, prog * 2 - 1);
    ctx.save(); ctx.beginPath(); ctx.rect(xs[0] - 4, 0, (xs[1] - xs[0]) * seg1 + 4, this.h); ctx.clip(); curve(xs[0], cy, xs[1], l1[a]); ctx.restore();
    if (seg2 > 0) { ctx.save(); ctx.beginPath(); ctx.rect(xs[1] - 1, 0, (xs[2] - xs[1]) * seg2 + 1, this.h); ctx.clip(); curve(xs[1], l1[a], xs[2], l2[lf]); ctx.restore(); }
    node(this, xs[0], cy, 7, true); ctx.fillStyle = this.bg; ctx.textAlign = 'center'; ctx.fillText('?', xs[0], cy + 3.6);
    l1.forEach(function (y, q) { node(this, xs[1], y, 4.5, q === a && prog > .5); }, this);
    l2.forEach(function (y, q) { var on = q === lf && prog >= 1; node(this, xs[2], y, on ? 7 : 4.5, on); if (on) { ctx.fillStyle = this.bg; ctx.fillText('A', xs[2], y + 3.6); } }, this);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  };
  Art.prototype.drawNetwork = function () {
    var ctx = this.ctx, R = this.region(), T = now_() / 1000, i, cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, rm = Math.min((R.x1 - R.x0) / 2, (R.y1 - R.y0) / 2) - 6, N = 8, pts = [];
    ctx.clearRect(0, 0, this.w, this.h); ctx.strokeStyle = this.ink; ctx.lineWidth = 1;
    for (i = 0; i < N; i++) { var a = i / N * TAU + T * .06, r = rm * (i % 2 ? .62 : .95) * (1 + .04 * Math.sin(T * .8 + i * 2)); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * .92]); }
    ctx.globalAlpha = .18; ctx.beginPath(); for (i = 0; i < N; i++) { ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[(i + 1) % N][0], pts[(i + 1) % N][1]); } ctx.stroke();
    ctx.globalAlpha = .38; for (i = 0; i < N; i++) pl(ctx, [[cx, cy], pts[i]]);
    for (i = 0; i < N; i++) { var u = ((T * .3 + i * .17) % 1.3) / 1.3, pt = plAt(i % 2 ? [pts[i], [cx, cy]] : [[cx, cy], pts[i]], u); ctx.globalAlpha = 1; ctx.fillStyle = this.ink; ctx.fillRect(pt[0] - 2.2, pt[1] - 2.2, 4.4, 4.4); }
    for (i = 0; i < N; i++) { ctx.globalAlpha = 1; ctx.fillStyle = this.bg; ctx.fillRect(pts[i][0] - 5, pts[i][1] - 5, 10, 10); ctx.strokeStyle = this.ink; ctx.lineWidth = 1.2; ctx.strokeRect(pts[i][0] - 5, pts[i][1] - 5, 10, 10); }
    ctx.fillStyle = this.ink; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill(); var ph = (T * .5) % 1; ctx.globalAlpha = (1 - ph) * .5; ctx.beginPath(); ctx.arc(cx, cy, 12 + ph * 14, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  };
  Art.prototype.drawBeacon = function () {
    var ctx = this.ctx, w = this.w, h = this.h, T = now_() / 1000, i, cx = w * (w < 700 ? .62 : .7), cy = h * .39, Rr = Math.min(w * .26, h * .3);
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = this.ink; ctx.fillStyle = this.ink; ctx.lineWidth = 1; ctx.font = '500 10px "JetBrains Mono",ui-monospace,monospace';
    ctx.globalAlpha = .2; ctx.beginPath(); ctx.moveTo(cx - Rr * 1.25, cy); ctx.lineTo(cx + Rr * 1.25, cy); ctx.moveTo(cx, cy - Rr * 1.25); ctx.lineTo(cx, cy + Rr * 1.25); ctx.stroke();
    [.34, .66, 1].forEach(function (f) { ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(cx, cy, Rr * f, 0, TAU); ctx.stroke(); ctx.setLineDash([]); });
    for (i = 0; i < 4; i++) { var ph = (T * .16 + i / 4) % 1; ctx.globalAlpha = (1 - ph) * .55; ctx.beginPath(); ctx.arc(cx, cy, Rr * ph, 0, TAU); ctx.stroke(); }
    var rot = reduce ? 0 : T * .04; ctx.globalAlpha = .45; ctx.beginPath();
    for (i = 0; i < 120; i++) { var a = i / 120 * TAU + rot, l = i % 10 === 0 ? 9 : 4; ctx.moveTo(cx + (Rr * 1.12) * Math.cos(a), cy + (Rr * 1.12) * Math.sin(a)); ctx.lineTo(cx + (Rr * 1.12 + l) * Math.cos(a), cy + (Rr * 1.12 + l) * Math.sin(a)); }
    ctx.stroke();
    var cards = [['PCB', 0, -1], ['EMBEDDED', 1, 0], ['ROBOTICS', 0, 1], ['AUTOMATION', -1, 0]];
    cards.forEach(function (c, q) { var x = cx + c[1] * Rr, y = cy + c[2] * Rr; ctx.globalAlpha = 1; node(this, x, y, 5, q === 0); ctx.fillStyle = this.ink; ctx.globalAlpha = .7; ctx.textAlign = c[1] === 1 ? 'left' : c[1] === -1 ? 'right' : 'center'; ctx.fillText(c[0], x + c[1] * 12, y + (c[2] === 0 ? 3.5 : c[2] * 18)); }, this);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();
    ctx.globalAlpha = .5; ctx.fillText('30.05°N  31.34°E', cx + 14, cy - 14); ctx.globalAlpha = 1;
  };
  var MODES = { cores: 'drawCores', orbit: 'drawOrbit', flow: 'drawFlow', net: 'drawNet', voices: 'drawVoices', faq: 'drawFaq', network: 'drawNetwork', beacon: 'drawBeacon' };
  Art.prototype.draw = function () {
    ACCENT = this.ink = getComputedStyle(this.cv).color; this.bg = this.bgc();
    if (MODES[this.mode]) return this[MODES[this.mode]]();
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
      if (now - a.last < (a.mode === 'robot' || a.mode === 'cores' ? 30 : 50)) return;
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
