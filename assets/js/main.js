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
    ctx.globalAlpha = .5; ctx.fillText('FIG. 04 · TRAJECTORY TRACKING', 14, 36);
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
  var SC_DUR = 7000, SC_NAMES = ['MECHANICAL', 'PCB', 'EMBEDDED', 'ROBOTICS', 'AUTOMATION'];
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
    var ctx = this.ctx, w = this.w, h = this.h, now = now_(), s = this.sw || (this.sw = { i: 0, t0: now }), i, el, tot = SC_DUR / 1000, NS = SC_NAMES.length;
    if (reduce) s.i = 0; else if (now - s.t0 > SC_DUR) { s.i = (s.i + 1) % NS; s.t0 = now; }
    var H = [['MECHANICAL DESIGN — 3D MODEL', 'FIG. 01 · PARAMETRIC CAD'], ['PCB CORE — HARDWARE', 'FIG. 02 · SIGNAL ROUTING'], ['EMBEDDED CORE — FIRMWARE', 'FIG. 03 · SENSOR TO BUS'], null, ['AUTOMATION CORE — CONTROL', 'FIG. 05 · CLOSED-LOOP CONTROL']];
    [this.drawMech, this.drawTraces, this.drawEmbedded, this.drawRobot, this.drawAutomation][s.i].call(this);
    if (H[s.i]) hdr(this, H[s.i][0], H[s.i][1], s.i === 1);
    el = (now - s.t0) / 1000;
    var f = el < .45 ? 1 - el / .45 : (tot - el < .45 ? 1 - (tot - el) / .45 : 0);
    if (f > 0 && !reduce) { ctx.globalAlpha = f; ctx.fillStyle = this.bg; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
    ctx.font = MONO; var x = 14, y = h - 16, short = w < 600; this.ind = [];
    for (i = 0; i < NS; i++) {
      var tx = short ? '0' + (i + 1) : '0' + (i + 1) + ' ' + SC_NAMES[i], tw = ctx.measureText(tx).width;
      ctx.fillStyle = this.ink; ctx.globalAlpha = i === s.i ? 1 : .38; ctx.fillText(tx, x, y);
      if (i === s.i) { ctx.fillRect(x, y + 5, tw, 1); ctx.globalAlpha = .35; ctx.fillRect(x, y + 5, tw * Math.min(1, el / tot), 1.6); }
      this.ind.push({ a: x - 6, b: x + tw + 6, i: i }); x += tw + (short ? 12 : 16);
    }
    ctx.globalAlpha = 1;
  };

  /* ---------- Mechanical design: parametric 3D model (gear) with drawing-sheet details ---------- */
  function rot3(p, ay, ax) {
    var x1 = p[0] * Math.cos(ay) + p[2] * Math.sin(ay), z1 = -p[0] * Math.sin(ay) + p[2] * Math.cos(ay);
    return [x1, p[1] * Math.cos(ax) - z1 * Math.sin(ax), p[1] * Math.sin(ax) + z1 * Math.cos(ax)];
  }
  Art.prototype.drawMech = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = this.ink, bg = this.bg, T = now_() / 1000, i, k = Math.min(w, h), man = this.mx > -999;
    var cx = w * .56, cy = h * .47, S = k * .3, ay = .65 + .5 * Math.sin(T * .4) + (man ? (this.mx - w / 2) / w * 3 : 0), ax = -.55 + (man ? (this.my - h / 2) / h * 1.1 : 0) + .06 * Math.sin(T * .7), spin = T * .5;
    ctx.clearRect(0, 0, w, h); gridDots(this, cx, cy, Math.max(18, k / 16)); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.font = MONO;
    var N = 14, prof = [], tz = .3;
    for (i = 0; i < N * 4; i++) { var a = i / (N * 4) * TAU + spin, r = [.8, 1, 1, .8][i % 4]; prof.push([r * Math.cos(a), r * Math.sin(a)]); }
    function P(x, y, z) { var q = rot3([x, y, z], ay, ax), f = 1 / (1 + q[2] * .12); return [cx + q[0] * S * f, cy + q[1] * S * f, q[2]]; }
    var front = prof.map(function (p) { return P(p[0], p[1], tz); }), back = prof.map(function (p) { return P(p[0], p[1], -tz); });
    var fz = rot3([0, 0, tz], ay, ax)[2], bz = rot3([0, 0, -tz], ay, ax)[2];
    function poly(pts, al, close) { ctx.globalAlpha = al; ctx.beginPath(); pts.forEach(function (p, n) { n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); if (close) ctx.closePath(); ctx.stroke(); }
    ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
    // side edges
    ctx.globalAlpha = .28; ctx.beginPath(); for (i = 0; i < front.length; i++) { ctx.moveTo(front[i][0], front[i][1]); ctx.lineTo(back[i][0], back[i][1]); } ctx.stroke();
    var fa = fz > bz ? 1 : .4, ba = fz > bz ? .4 : 1;
    poly(back, ba, true); poly(front, fa, true);
    function circ(r, z, al) { var pts = []; for (var q = 0; q < 40; q++) { var t = q / 40 * TAU; pts.push(P(r * Math.cos(t), r * Math.sin(t), z)); } poly(pts, al, true); }
    circ(.3, tz, fa); circ(.3, -tz, ba); circ(.52, tz, fa * .8); circ(.52, -tz, ba * .8);
    // bore axis (centre line)
    var ax1 = P(0, 0, -tz - .5), ax2 = P(0, 0, tz + .5); ctx.setLineDash([8, 3, 2, 3]); ctx.globalAlpha = .45; ctx.beginPath(); ctx.moveTo(ax1[0], ax1[1]); ctx.lineTo(ax2[0], ax2[1]); ctx.stroke(); ctx.setLineDash([]);
    // front orthographic view (drawing sheet)
    var ox = w * .15, oy = h * .5, os = S * .56;
    ctx.globalAlpha = .9; ctx.beginPath(); prof.forEach(function (p, n) { n ? ctx.lineTo(ox + p[0] * os, oy + p[1] * os) : ctx.moveTo(ox + p[0] * os, oy + p[1] * os); }); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(ox, oy, os * .3, 0, TAU); ctx.stroke(); ctx.globalAlpha = .4; ctx.setLineDash([8, 3, 2, 3]); ctx.beginPath(); ctx.moveTo(ox - os * 1.2, oy); ctx.lineTo(ox + os * 1.2, oy); ctx.moveTo(ox, oy - os * 1.2); ctx.lineTo(ox, oy + os * 1.2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = ink; ctx.globalAlpha = .55; ctx.fillText('FRONT', ox - 16, oy + os * 1.35);
    // dimension line
    var dy = oy - os * 1.22; ctx.globalAlpha = .7; ctx.beginPath(); ctx.moveTo(ox - os, dy); ctx.lineTo(ox + os, dy); ctx.moveTo(ox - os, dy - 5); ctx.lineTo(ox - os, dy + 5); ctx.moveTo(ox + os, dy - 5); ctx.lineTo(ox + os, dy + 5); ctx.stroke();
    ctx.fillStyle = bg; ctx.globalAlpha = 1; ctx.fillRect(ox - 12, dy - 7, 24, 14); ctx.fillStyle = ink; ctx.globalAlpha = .8; ctx.textAlign = 'center'; ctx.fillText('Ø D', ox, dy + 3.5); ctx.textAlign = 'left';
    // axis triad
    var tx = w - 56, ty = 78, ax3 = [[1, 0, 0, 'X'], [0, -1, 0, 'Y'], [0, 0, 1, 'Z']];
    ax3.forEach(function (v) { var q = rot3(v, ay, ax); ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + q[0] * 34, ty + q[1] * 34); ctx.stroke(); ctx.globalAlpha = .6; ctx.fillText(v[3], tx + q[0] * 43 - 3, ty + q[1] * 43 + 3); });
    // title block
    var bx = w - 146, by = h - 62; ctx.globalAlpha = 1; ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(bx, by, 132, 48); ctx.beginPath(); ctx.moveTo(bx, by + 24); ctx.lineTo(bx + 132, by + 24); ctx.moveTo(bx + 66, by + 24); ctx.lineTo(bx + 66, by + 48); ctx.stroke();
    ctx.fillStyle = ink; ctx.globalAlpha = .8; ctx.fillText('PART · SPUR GEAR', bx + 6, by + 15); ctx.globalAlpha = .55; ctx.fillText('REV A', bx + 6, by + 40); ctx.fillText('SCALE 1:1', bx + 72, by + 40); ctx.globalAlpha = 1;
  };

  /* ---------- Model-Based Design: closed-loop plant/controller model with the MBD workflow ---------- */
  Art.prototype.drawMbd = function () {
    var ctx = this.ctx, w = this.w, h = this.h, ink = this.ink, bg = this.bg, T = now_() / 1000, i, cy = h * .46, bh = Math.min(46, h * .21), fs = w < 520 ? 8.5 : 10;
    ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.font = '500 ' + fs + 'px "JetBrains Mono",ui-monospace,monospace';
    // model canvas grid
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = .09; ctx.beginPath();
    for (i = 0; i < w; i += 24) { ctx.moveTo(i, 0); ctx.lineTo(i, h); } for (i = 0; i < h; i += 24) { ctx.moveTo(0, i); ctx.lineTo(w, i); } ctx.stroke();
    var x0 = w * .06, xs = w * .16, xp = w * .335, pw = w * .14, xg = w * .565, xo = w * .79, xsc = w * .87, fy = cy + h * .25;
    var main = [[x0, cy], [xs - 8, cy], [xs + 8, cy], [xp - pw / 2, cy], [xp + pw / 2, cy], [xg - pw / 2, cy], [xg + pw / 2, cy], [xsc, cy]];
    var fb = [[xo, cy], [xo, fy], [xs, fy], [xs, cy + 8]];
    ctx.globalAlpha = .75; ctx.lineWidth = 1.3; pl(ctx, main.slice(0, 2)); pl(ctx, main.slice(2, 4)); pl(ctx, main.slice(4, 6)); pl(ctx, main.slice(6, 8)); pl(ctx, fb);
    function arrow(x, y, d) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6 * d, y - 3.5); ctx.lineTo(x - 6 * d, y + 3.5); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = ink; arrow(xs - 8, cy, 1); arrow(xp - pw / 2, cy, 1); arrow(xg - pw / 2, cy, 1); arrow(xsc, cy, 1); ctx.beginPath(); ctx.moveTo(xs, cy + 8); ctx.lineTo(xs - 3.5, cy + 14); ctx.lineTo(xs + 3.5, cy + 14); ctx.closePath(); ctx.fill();
    // packets
    var pk = [main.slice(0, 2).concat(main.slice(2)), fb];
    for (i = 0; i < 3; i++) { var pt = plAt([main[0], main[1], main[3], main[5], main[7]], ((T * .22 + i / 3) % 1)); ctx.globalAlpha = 1; ctx.fillRect(pt[0] - 2.4, pt[1] - 2.4, 4.8, 4.8); }
    for (i = 0; i < 2; i++) { var pf = plAt(fb, ((T * .22 + i / 2 + .3) % 1)); ctx.fillRect(pf[0] - 2.4, pf[1] - 2.4, 4.8, 4.8); }
    // blocks
    function blk(cx, wd, t1, t2) { ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(cx - wd / 2, cy - bh / 2, wd, bh); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.strokeRect(cx - wd / 2, cy - bh / 2, wd, bh); ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.globalAlpha = .95; ctx.fillText(t1, cx, cy - 1); ctx.globalAlpha = .55; ctx.fillText(t2, cx, cy + fs + 3); ctx.textAlign = 'left'; }
    blk(xp, pw, 'PID', 'C(s)'); blk(xg, pw, 'PLANT', 'G(s)');
    // sum junction
    ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(xs, cy, 8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(xs - 5.5, cy - 5.5); ctx.lineTo(xs + 5.5, cy + 5.5); ctx.moveTo(xs - 5.5, cy + 5.5); ctx.lineTo(xs + 5.5, cy - 5.5); ctx.globalAlpha = .5; ctx.stroke();
    ctx.globalAlpha = .75; ctx.fillStyle = ink; ctx.fillText('+', xs - 18, cy - 5); ctx.fillText('−', xs + 8, cy + 22);
    ctx.beginPath(); ctx.arc(xo, cy, 2.6, 0, TAU); ctx.fill();
    // signal names
    ctx.globalAlpha = .6; ctx.fillText('r(t)', x0 - 4, cy - 10); ctx.fillText('e(t)', (xs + xp - pw / 2) / 2 - 10, cy - 10); ctx.fillText('u(t)', (xp + pw / 2 + xg - pw / 2) / 2 - 10, cy - 10); ctx.fillText('y(t)', (xg + pw / 2 + xo) / 2 - 8, cy - 10); ctx.fillText('feedback', (xo + xs) / 2 - 22, fy - 7);
    // scope block with response
    var sw = w * .115, sh = bh * 1.5, sx = xsc, sy = cy - sh / 2, u = (T % 4.5) / 4.5, rf = function (q) { return 1 - Math.exp(-4 * q) * Math.cos(11 * q); };
    ctx.globalAlpha = 1; ctx.fillStyle = bg; ctx.fillRect(sx, sy, sw, sh); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.strokeRect(sx, sy, sw, sh);
    ctx.globalAlpha = .3; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(sx + 4, sy + sh * .3); ctx.lineTo(sx + sw - 4, sy + sh * .3); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 1; ctx.lineWidth = 1.3; ctx.beginPath(); for (i = 0; i <= Math.round(u * 40); i++) { var q = i / 40, yy = sy + sh - 5 - rf(q) * sh * .55; i ? ctx.lineTo(sx + 4 + q * (sw - 8), yy) : ctx.moveTo(sx + 4, yy); } ctx.stroke();
    // workflow chips (V-model steps)
    var wf = ['REQ', 'MODEL', 'SIM', 'CODEGEN', 'HIL'], act = reduce ? 3 : Math.floor(T / 1.3) % wf.length, x = 14, y = h - 16;
    for (i = 0; i < wf.length; i++) { var tw = ctx.measureText(wf[i]).width; ctx.fillStyle = ink; ctx.globalAlpha = i === act ? 1 : .38; ctx.fillText(wf[i], x, y); if (i === act) ctx.fillRect(x, y + 5, tw, 1.3); x += tw + 8; if (i < wf.length - 1) { ctx.globalAlpha = .3; ctx.fillText('→', x, y); x += 18; } }
    // header
    ctx.fillStyle = ink; ctx.globalAlpha = .95; ctx.fillText('MODEL-BASED DESIGN', 14, 22); ctx.globalAlpha = .5; ctx.fillText('FIG. 00 · PLANT / CONTROLLER LOOP', 14, 36); ctx.globalAlpha = 1;
  };

  /* ---------- Glyph library (small, meaningful, hover-reactive) ---------- */
  function gearPath(c, r, n, ph) { c.beginPath(); for (var i = 0; i < n * 4; i++) { var a = ph + i / (n * 4) * TAU, rr = [.82, 1, 1, .82][i % 4] * r; i ? c.lineTo(rr * Math.cos(a), rr * Math.sin(a)) : c.moveTo(rr * Math.cos(a), rr * Math.sin(a)); } c.closePath(); }
  var GLYPHS = {
    gear: function (c, s, T, hv) { var sp = T * (.5 + hv * 1.4); c.save(); c.translate(-s * .28, -s * .12); gearPath(c, s * .78, 12, sp); c.stroke(); c.beginPath(); c.arc(0, 0, s * .2, 0, TAU); c.stroke(); c.restore(); c.save(); c.translate(s * .62, s * .5); gearPath(c, s * .4, 6, -sp * 2 + .26); c.stroke(); c.beginPath(); c.arc(0, 0, s * .1, 0, TAU); c.stroke(); c.restore(); },
    gauge: function (c, s, T, hv) {
      var a0 = Math.PI * .85, a1 = Math.PI * 2.15, i, oy = s * .15; c.beginPath(); c.arc(0, oy, s * .9, a0, a1); c.stroke();
      for (i = 0; i <= 10; i++) { var a = a0 + (a1 - a0) * i / 10, r2 = s * (i % 5 ? .8 : .7); c.beginPath(); c.moveTo(s * .9 * Math.cos(a), oy + s * .9 * Math.sin(a)); c.lineTo(r2 * Math.cos(a), oy + r2 * Math.sin(a)); c.stroke(); }
      c.lineWidth = 4; c.beginPath(); c.arc(0, oy, s * .62, a0 + (a1 - a0) * .3, a0 + (a1 - a0) * .7); c.stroke(); c.lineWidth = 1.3;
      var v = .5 + .38 * Math.sin(T * (1 + hv * 2)) * (.6 + .4 * Math.sin(T * .37)), an = a0 + (a1 - a0) * v; c.beginPath(); c.moveTo(0, oy); c.lineTo(s * .78 * Math.cos(an), oy + s * .78 * Math.sin(an)); c.stroke(); c.beginPath(); c.arc(0, oy, s * .07, 0, TAU); c.fill();
    },
    revs: function (c, s, T, hv, a) {
      var k = Math.floor(T * (.8 + hv)) % 4, i, j;
      for (i = 2; i >= 0; i--) { c.globalAlpha = 1 - i * .28; c.fillStyle = a.bg; c.fillRect(-s * .45 - i * s * .16, -s * .65 + i * s * .16, s * .9, s * 1.2); c.strokeRect(-s * .45 - i * s * .16, -s * .65 + i * s * .16, s * .9, s * 1.2); }
      c.globalAlpha = .7; for (j = 0; j < 4; j++) { var y = -s * .4 + j * s * .2; c.beginPath(); c.moveTo(-s * .3, y); c.lineTo(-s * .3 + s * .6 * (j === 3 ? .5 : 1), y); c.stroke(); }
      c.globalAlpha = 1; c.fillStyle = a.ink; c.font = '500 ' + Math.round(s * .2) + 'px "JetBrains Mono",monospace'; c.fillText('REV ' + 'ABCD'[k], -s * .3, s * .42);
    },
    lock: function (c, s, T, hv, a) {
      var ph = (T * .6) % 1; c.fillStyle = a.bg; c.fillRect(-s * .55, -s * .05, s * 1.1, s * .85); c.strokeRect(-s * .55, -s * .05, s * 1.1, s * .85);
      c.beginPath(); c.moveTo(-s * .36, -s * .05); c.lineTo(-s * .36, -s * .3); c.arc(0, -s * .3, s * .36, Math.PI, 0); c.lineTo(s * .36, -s * .05); c.stroke();
      c.fillStyle = a.ink; c.beginPath(); c.arc(0, s * .28, s * .1, 0, TAU); c.fill(); c.fillRect(-s * .03, s * .28, s * .06, s * .22);
      c.globalAlpha = (1 - ph) * (.3 + hv * .5); c.beginPath(); c.arc(0, s * .28, s * .1 + ph * s * .5, 0, TAU); c.stroke(); c.globalAlpha = 1;
    },
    target: function (c, s, T, hv) {
      [.3, .6, .9].forEach(function (r) { c.globalAlpha = .6; c.beginPath(); c.arc(0, 0, s * r, 0, TAU); c.stroke(); });
      c.globalAlpha = .4; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.moveTo(0, -s); c.lineTo(0, s); c.stroke();
      var k = (T * (.35 + hv * .6)) % 1, rr = s * .95 * (1 - k), an = T * 2.4, x = rr * Math.cos(an), y = rr * Math.sin(an);
      c.globalAlpha = .45; c.beginPath(); c.moveTo(0, 0); c.lineTo(x, y); c.stroke(); c.globalAlpha = 1; c.beginPath(); c.arc(x, y, s * .07, 0, TAU); c.fill();
      if (k > .88) { c.beginPath(); c.arc(0, 0, s * .14, 0, TAU); c.fill(); }
    },
    steps: function (c, s, T, hv) {
      var n = 4, bw = s * .48, bh = s * .3, x0 = -s * .95, y0 = s * .8, i;
      for (i = 0; i < n; i++) c.strokeRect(x0 + i * bw, y0 - (i + 1) * bh, bw, (i + 1) * bh);
      var k = (T * (.35 + hv * .5)) % 1.3, p = Math.min(1, k) * (n - .001), si = Math.floor(p), f = p - si, px = x0 + (si + f) * bw + bw * .3, py = y0 - (si + 1) * bh - Math.sin(f * Math.PI) * bh * .8 - s * .1;
      c.beginPath(); c.arc(px, py, s * .09, 0, TAU); c.fill();
      var fx = x0 + n * bw - bw * .3, fy = y0 - n * bh; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy - s * .5); c.lineTo(fx + s * .3, fy - s * .4); c.lineTo(fx, fy - s * .3); c.stroke();
    },
    cube: function (c, s, T, hv) {
      var ay = T * (.5 + hv), ax = .6, V = [], i, E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
      for (i = 0; i < 8; i++) V.push(rot3([(i & 1 ? 1 : -1) * .62 * s, (i & 2 ? 1 : -1) * .62 * s, (i & 4 ? 1 : -1) * .62 * s], ay, ax));
      E.forEach(function (e) { var z = (V[e[0]][2] + V[e[1]][2]) / 2; c.globalAlpha = Math.max(.25, Math.min(1, .6 + z / s * .5)); c.beginPath(); c.moveTo(V[e[0]][0], V[e[0]][1]); c.lineTo(V[e[1]][0], V[e[1]][1]); c.stroke(); }); c.globalAlpha = 1;
    },
    check: function (c, s, T, hv) {
      var k = (T * (.5 + hv * .7)) % 1.5, i;
      for (i = 0; i < 3; i++) {
        var y = -s * .6 + i * s * .6; c.strokeRect(-s * .8, y - s * .17, s * .34, s * .34); c.globalAlpha = .6; c.beginPath(); c.moveTo(-s * .3, y); c.lineTo(s * .8 - (i === 1 ? s * .3 : 0), y); c.stroke(); c.globalAlpha = 1;
        var p = Math.min(1, Math.max(0, k * 3 - i)); if (p > 0) { c.beginPath(); c.moveTo(-s * .74, y); c.lineTo(-s * .74 + s * .1 * Math.min(1, p * 2), y + s * .1 * Math.min(1, p * 2)); if (p > .5) c.lineTo(-s * .64 + s * .22 * (p - .5) * 2, y + s * .1 - s * .3 * (p - .5) * 2); c.stroke(); }
      }
    },
    blocks: function (c, s, T, hv, a) {
      var N = [[-.8, .35], [0, -.4], [.8, .35]], i, L = [[0, 1], [1, 2], [0, 2]];
      c.globalAlpha = .6; L.forEach(function (l) { c.beginPath(); c.moveTo(N[l[0]][0] * s, N[l[0]][1] * s); c.lineTo(N[l[1]][0] * s, N[l[1]][1] * s); c.stroke(); });
      c.globalAlpha = 1; L.forEach(function (l, q) { var u = (T * (.4 + hv * .5) + q * .33) % 1; c.fillRect(N[l[0]][0] * s + (N[l[1]][0] - N[l[0]][0]) * s * u - 2.5, N[l[0]][1] * s + (N[l[1]][1] - N[l[0]][1]) * s * u - 2.5, 5, 5); });
      for (i = 0; i < 3; i++) { c.fillStyle = a.bg; c.fillRect(N[i][0] * s - s * .24, N[i][1] * s - s * .2, s * .48, s * .4); c.strokeRect(N[i][0] * s - s * .24, N[i][1] * s - s * .2, s * .48, s * .4); } c.fillStyle = a.ink;
    },
    magnify: function (c, s, T, hv, a) {
      c.globalAlpha = .6; c.beginPath(); c.moveTo(-s, s * .3); c.lineTo(-s * .5, s * .3); c.lineTo(-s * .3, -s * .2); c.lineTo(s * .1, -s * .2); c.lineTo(s * .3, s * .3); c.lineTo(s, s * .3); c.stroke(); c.globalAlpha = 1;
      var mx = Math.sin(T * (.8 + hv)) * s * .5, my = -s * .05 + Math.cos(T * (.6 + hv)) * s * .15; c.fillStyle = a.bg; c.globalAlpha = .85; c.beginPath(); c.arc(mx, my, s * .36, 0, TAU); c.fill(); c.globalAlpha = 1; c.stroke();
      c.beginPath(); c.moveTo(mx + s * .26, my + s * .26); c.lineTo(mx + s * .6, my + s * .6); c.lineWidth = 3; c.stroke(); c.lineWidth = 1.3;
    },
    wave: function (c, s, T, hv) {
      var x; c.globalAlpha = .4; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(-s, -s * .5); c.lineTo(s, -s * .5); c.moveTo(-s, s * .5); c.lineTo(s, s * .5); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
      c.beginPath(); for (x = -s; x <= s; x += 3) { var y = Math.sin(x / s * 5 + T * (2 + hv * 3)) * s * .38; x === -s ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    },
    box: function (c, s, T, hv, a) {
      var lift = (.5 + .5 * Math.sin(T * (1.2 + hv))) * s * .35; c.fillStyle = a.bg; c.fillRect(-s * .6, -s * .1, s * 1.2, s * .8); c.strokeRect(-s * .6, -s * .1, s * 1.2, s * .8);
      c.beginPath(); c.moveTo(-s * .6, -s * .1 - lift); c.lineTo(s * .6, -s * .1 - lift); c.lineTo(s * .8, -s * .4 - lift); c.lineTo(-s * .4, -s * .4 - lift); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(s * .6, -s * .1); c.lineTo(s * .8, -s * .4); c.lineTo(s * .8, s * .4); c.lineTo(s * .6, s * .7); c.stroke();
      c.beginPath(); c.moveTo(0, s * .4); c.lineTo(0, -s * .3 - lift); c.moveTo(-s * .12, -s * .18 - lift); c.lineTo(0, -s * .3 - lift); c.lineTo(s * .12, -s * .18 - lift); c.stroke();
    },
    pin: function (c, s, T, hv) {
      var ph = (T * .6) % 1; c.beginPath(); c.arc(0, -s * .25, s * .4, Math.PI * .83, Math.PI * 2.17, false); c.lineTo(0, s * .62); c.closePath(); c.stroke(); c.beginPath(); c.arc(0, -s * .25, s * .12, 0, TAU); c.fill();
      c.globalAlpha = (1 - ph) * (.5 + hv * .4); c.beginPath(); c.ellipse(0, s * .66, s * (.25 + ph * .75), s * (.07 + ph * .2), 0, 0, TAU); c.stroke(); c.globalAlpha = 1;
    }
  };
  Art.prototype.drawGlyph = function () {
    var ctx = this.ctx, w = this.w, h = this.h, T = now_() / 1000, g = GLYPHS[this.cv.getAttribute('data-g')], s = Math.min(w, h) * .36;
    this.hv = (this.hv || 0) + ((this.mx > -999 ? 1 : 0) - (this.hv || 0)) * .12;
    ctx.clearRect(0, 0, w, h); if (!g) return;
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.strokeStyle = this.ink; ctx.fillStyle = this.ink; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.globalAlpha = .92;
    g(ctx, s, T, this.hv, this); ctx.restore(); ctx.globalAlpha = 1;
  };

  /* CTA: companions for each word of the sentence + drafting ruler + pointer crosshair (interactive) */
  Art.prototype.drawCtaExtras = function () {
    var ctx = this.ctx, w = this.w, h = this.h, T = now_() / 1000, self = this, ink = this.ink, bg = this.bg;
    if (!this.wd) { this.wd = $$('.cta__words span'); this.wh = [0, 0, 0]; }
    var cr = this.cv.getBoundingClientRect(), wide = w > 760;
    ctx.font = '500 9px "JetBrains Mono",ui-monospace,monospace'; ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    this.wd.forEach(function (sp, i) {
      var r = sp.getBoundingClientRect(), rx = r.left - cr.left, ry = r.top - cr.top, rw = r.width, rh = r.height, cy = ry + rh / 2;
      var inside = self.mx > rx - 20 && self.mx < rx + rw + 20 && self.my > ry && self.my < ry + rh;
      self.wh[i] += ((inside ? 1 : 0) - self.wh[i]) * .12; var hv = self.wh[i];
      if (!wide) return;
      var s = Math.min(44, rh * .3), gx = i === 1 ? rx - Math.max(90, s * 2.4) : rx + rw + Math.max(90, s * 2.4);
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.globalAlpha = .55 + .4 * hv;
      if (i === 0) {
        var d = s * (1.15 - .8 * hv) + s * .2 * Math.sin(T * 1.3) * (1 - hv);
        ctx.beginPath(); ctx.moveTo(gx - d, cy); ctx.lineTo(gx + d, cy); ctx.stroke();
        [-1, 1].forEach(function (q) { ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(gx + q * d, cy, s * .2, 0, TAU); ctx.fill(); ctx.stroke(); });
        if (hv > .4) { ctx.globalAlpha = hv * (1 - (T * .8) % 1) * .8; ctx.beginPath(); ctx.arc(gx, cy, s * .3 + ((T * .8) % 1) * s, 0, TAU); ctx.stroke(); }
        ctx.globalAlpha = .5; ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText('CONNECT', gx, cy + s * 1.1);
      } else if (i === 1) {
        var p = hv > .5 ? 1 : (T * .3) % 1;
        ctx.beginPath(); ctx.arc(gx, cy, s, 0, TAU); ctx.globalAlpha *= .5; ctx.stroke(); ctx.globalAlpha = .55 + .4 * hv; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, cy, s, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke(); ctx.lineWidth = 1.3;
        var k = .42 * (1 + hv * .25) * s; ctx.beginPath(); ctx.moveTo(gx - k * .6, cy - k); ctx.lineTo(gx + k, cy); ctx.lineTo(gx - k * .6, cy + k); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = .5; ctx.textAlign = 'center'; ctx.fillText('LAUNCH', gx, cy + s * 1.9);
        // drafting ruler to the left of the word
        var x1 = Math.round(rx - 26), x0 = Math.round(Math.max(24, w * .04)), ry2 = cy + rh * .42, off = (x0 % 10), xx;
        if (x1 - x0 > 140) {
          ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(x0, ry2); ctx.lineTo(x1, ry2);
          for (xx = x0; xx <= x1; xx += 10) { var big = ((xx - x0) % 100) === 0; ctx.moveTo(xx, ry2); ctx.lineTo(xx, ry2 + (big ? 9 : 4)); }
          ctx.stroke(); ctx.globalAlpha = .45; ctx.textAlign = 'left';
          for (xx = x0; xx <= x1; xx += 100) ctx.fillText(String(xx - x0), xx + 2, ry2 + 20);
          var mk = self.mx > x0 && self.mx < x1 && Math.abs(self.my - ry2) < 90 ? self.mx : x0 + ((T * 60) % (x1 - x0));
          ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(mk, ry2 - 8); ctx.lineTo(mk, ry2 + 4); ctx.stroke(); ctx.fillText('X ' + Math.round(mk - x0), mk + 4, ry2 - 8);
        }
      } else {
        var n = hv > .5 ? 3 : 1 + Math.floor((T * .8) % 3), b = s * .62, q;
        for (q = 0; q < n; q++) { var by = cy + s * .75 - q * b * 1.05; ctx.globalAlpha = .7 + .3 * hv; ctx.fillStyle = (q === 2 && n === 3 && hv > .5) ? ink : bg; ctx.fillRect(gx - b / 2, by - b / 2, b, b); ctx.strokeRect(gx - b / 2, by - b / 2, b, b); }
        ctx.globalAlpha = .5; ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText('BUILD', gx, cy + s * 1.55);
      }
      ctx.textAlign = 'left';
    });
    // pointer crosshair with coordinates
    if (this.mx > -999) {
      ctx.strokeStyle = ink; ctx.globalAlpha = .16; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(this.mx, 0); ctx.lineTo(this.mx, h); ctx.moveTo(0, this.my); ctx.lineTo(w, this.my); ctx.stroke();
      ctx.fillStyle = ink; ctx.globalAlpha = .5; ctx.fillText(Math.round(this.mx) + ' , ' + Math.round(this.my), this.mx + 8, this.my - 8);
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
    var ctx = this.ctx, w = this.w, h = this.h, T = now_() / 1000, i, cx = w * (w < 700 ? .62 : .72), cy = h * .3, Rr = Math.min(w * .22, h * .22);
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = this.ink; ctx.fillStyle = this.ink; ctx.lineWidth = 1; ctx.font = '500 10px "JetBrains Mono",ui-monospace,monospace';
    ctx.globalAlpha = .2; ctx.beginPath(); ctx.moveTo(cx - Rr * 1.25, cy); ctx.lineTo(cx + Rr * 1.25, cy); ctx.moveTo(cx, cy - Rr * 1.25); ctx.lineTo(cx, cy + Rr * 1.25); ctx.stroke();
    [.34, .66, 1].forEach(function (f) { ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(cx, cy, Rr * f, 0, TAU); ctx.stroke(); ctx.setLineDash([]); });
    for (i = 0; i < 4; i++) { var ph = (T * .16 + i / 4) % 1; ctx.globalAlpha = (1 - ph) * .55; ctx.beginPath(); ctx.arc(cx, cy, Rr * ph, 0, TAU); ctx.stroke(); }
    var rot = reduce ? 0 : T * .04; ctx.globalAlpha = .45; ctx.beginPath();
    for (i = 0; i < 120; i++) { var a = i / 120 * TAU + rot, l = i % 10 === 0 ? 9 : 4; ctx.moveTo(cx + (Rr * 1.12) * Math.cos(a), cy + (Rr * 1.12) * Math.sin(a)); ctx.lineTo(cx + (Rr * 1.12 + l) * Math.cos(a), cy + (Rr * 1.12 + l) * Math.sin(a)); }
    ctx.stroke();
    var cards = [['PCB', 0, -1], ['EMBEDDED', 1, 0], ['ROBOTICS', 0, 1], ['AUTOMATION', -1, 0]];
    if (w >= 700) cards.forEach(function (c, q) { var x = cx + c[1] * Rr, y = cy + c[2] * Rr; ctx.globalAlpha = 1; node(this, x, y, 5, q === 0); ctx.fillStyle = this.ink; ctx.globalAlpha = .7; ctx.textAlign = c[1] === 1 ? 'left' : c[1] === -1 ? 'right' : 'center'; ctx.fillText(c[0], x + c[1] * 12, y + (c[2] === 0 ? 3.5 : c[2] * 18)); }, this);
    ctx.textAlign = 'left'; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();
    if (w >= 700) { ctx.globalAlpha = .5; ctx.fillText('30.05°N  31.34°E', cx + 14, cy - 14); } ctx.globalAlpha = 1;
    this.drawCtaExtras();
  };
  var MODES = { cores: 'drawCores', mbd: 'drawMbd', glyph: 'drawGlyph', orbit: 'drawOrbit', flow: 'drawFlow', net: 'drawNet', voices: 'drawVoices', faq: 'drawFaq', network: 'drawNetwork', beacon: 'drawBeacon' };
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

  /* ---------------- request routing: contact box + specialty forms ---------------- */
  var fS = function (k, l, o, r) { return { k: k, l: l, t: 'select', o: o, r: r }; },
      fT = function (k, l, r) { return { k: k, l: l, t: 'text', r: r }; },
      fU = function (k, l, r) { return { k: k, l: l, t: 'url', r: r }; },
      fC = function (k, l, o) { return { k: k, l: l, t: 'checks', o: o }; },
      fD = function (k, l, r) { return { k: k, l: l, t: 'date', r: r }; },
      fA = function (k, l, r) { return { k: k, l: l, t: 'area', r: r }; };
  var STAGE = fS('stage', 'Project stage', ['Idea', 'Requirements defined', 'Design exists', 'Prototype exists', 'In production']),
      WHEN = fS('when', 'Target timeline', ['Flexible', 'Within 1 month', '1–3 months', 'More than 3 months']),
      BUDGET = fS('budget', 'Budget status', ['Not decided yet', 'Approved', 'Seeking funding', 'Student / non-profit']),
      LINK = fU('link', 'Link to files or references (Drive, GitHub…)'),
      DESC = fA('desc', 'Describe what you need', true),
      QTY = fS('qty', 'Quantity', ['Single prototype', 'Small batch', 'Pilot run', 'Production']);
  var AREAS = ['PCB design', 'Embedded systems', 'Robotics', 'Automation', 'Mechanical design', 'Power electronics', 'IoT', 'AI', 'Model-based design', 'Testing', 'Business / operations', 'Other'];
  var CATS = [
    { id: 'pcb', g: 0, n: 'PCB design & hardware', kw: /\b(pcb|schematic|gerber|layout|altium|kicad|bom|hardware design|circuit board)\b/i, hint: 'Schematic, layout, DFM/DFT and BOM work.', q: ['layers', 'when'],
      f: [fS('layers', 'Layers', ['1–2', '4', '6', '8 or more', 'Not sure']), fC('services', 'Services needed', ['Schematic design', 'PCB layout', 'DFM / DFT review', 'BOM optimisation', 'Prototype coordination', 'Full design package']), fS('type', 'Circuit type', ['Digital', 'Analog', 'Mixed-signal', 'High-speed', 'RF', 'Power']), QTY, fS('files', 'Existing material', ['Nothing yet', 'Specification only', 'Schematic', 'Schematic + layout', 'Fabrication files']), WHEN, LINK, DESC] },
    { id: 'embedded', g: 0, n: 'Embedded systems & firmware', kw: /\b(firmware|stm32|esp32|mcu|embedded|rtos|arduino|microcontroller|bootloader|risc-?v)\b/i, hint: 'Firmware, drivers, RTOS and hardware bring-up.', q: ['mcu', 'when'],
      f: [fT('mcu', 'MCU / platform (if known)'), fC('services', 'Services needed', ['Firmware development', 'Drivers & peripherals', 'RTOS', 'Bootloader / OTA update', 'Code review', 'Hardware bring-up']), fT('ifaces', 'Interfaces (UART, SPI, I²C, CAN…)'), STAGE, WHEN, LINK, DESC] },
    { id: 'robotics', g: 0, n: 'Robotics & motion control', kw: /\b(robot|robotics|manipulator|kinematic|servo|ros2?|gripper|mobile robot)\b/i, hint: 'Manipulators, mobile robots, motion control and research platforms.', q: ['type', 'stage'],
      f: [fS('type', 'System type', ['Manipulator / arm', 'Mobile robot', 'Gripper / end-effector', 'Motion control', 'Research platform', 'Other']), fC('services', 'Services needed', ['Concept & feasibility', 'Mechanical design', 'Electronics', 'Control software', 'Simulation', 'Prototype build']), fT('spec', 'Payload / reach / speed (if known)'), STAGE, WHEN, LINK, DESC] },
    { id: 'automation', g: 0, n: 'Automation & industrial control', kw: /\b(plc|scada|hmi|automation|conveyor|industrial control|control panel|retrofit)\b/i, hint: 'Machine control, production lines, panels and monitoring.', q: ['area', 'controller'],
      f: [fS('area', 'Application', ['Machine control', 'Production line', 'Process monitoring', 'Control panel design', 'Retrofit / upgrade', 'Other']), fS('controller', 'Controller', ['PLC', 'Microcontroller / custom', 'SCADA / HMI', 'Not decided']), fT('io', 'Approx. number of inputs / outputs'), STAGE, WHEN, LINK, DESC] },
    { id: 'mechanical', g: 0, n: 'Mechanical design & 3D modelling', kw: /\b(cad|solidworks|3d model|enclosure|mechanical|cnc|3d print|housing|bracket|fusion 360)\b/i, hint: 'CAD, enclosures, drawings and design for manufacturing.', q: ['process', 'stage'],
      f: [fC('services', 'Services needed', ['3D modelling (CAD)', 'Enclosure design', '2D manufacturing drawings', 'Design for manufacturing', 'Simulation (FEA)', 'Prototype / 3D printing']), fS('process', 'Intended process', ['3D printing', 'CNC machining', 'Sheet metal', 'Injection moulding', 'Not decided']), fT('size', 'Approx. size / constraints'), STAGE, WHEN, LINK, DESC] },
    { id: 'power', g: 0, n: 'Power electronics', kw: /\b(power supply|smps|inverter|converter|battery|bms|motor driver|charger|buck|boost)\b/i, hint: 'Supplies, converters, motor drivers and battery systems.', q: ['type', 'level'],
      f: [fS('type', 'System type', ['AC-DC supply', 'DC-DC converter', 'Motor driver', 'Battery / BMS', 'Charger', 'Inverter', 'Other']), fT('ratings', 'Input / output ratings (if known)'), fS('level', 'Power level', ['Below 100 W', '100 W – 1 kW', 'Above 1 kW', 'Not sure']), STAGE, WHEN, LINK, DESC] },
    { id: 'iot', g: 0, n: 'IoT & connected devices', kw: /\b(iot|mqtt|lora|gateway|connected device|telemetry|wireless sensor)\b/i, hint: 'Devices, connectivity, gateways and dashboards.', q: ['conn', 'stage'],
      f: [fS('conn', 'Connectivity', ['Wi-Fi', 'Bluetooth', 'LoRa', 'Cellular', 'Ethernet', 'Not decided']), fS('cloud', 'Cloud / dashboard needed', ['Yes', 'No', 'Not sure']), fT('devices', 'Number of devices (approx.)'), STAGE, WHEN, LINK, DESC] },
    { id: 'ai', g: 0, n: 'AI & intelligent systems', kw: /\b(machine learning|ai|computer vision|neural|object detection|edge ai|predictive)\b/i, hint: 'Vision, analytics and edge intelligence for engineered systems.', q: ['need', 'data'],
      f: [fS('need', 'Use case', ['Computer vision', 'Predictive maintenance', 'Signal / sensor analytics', 'Edge AI deployment', 'Other']), fS('data', 'Data', ['Available', 'Needs collection', 'Not sure']), fS('deploy', 'Deployment', ['Edge device', 'Cloud', 'Not decided']), STAGE, WHEN, LINK, DESC] },
    { id: 'mbd', g: 0, n: 'Model-based design & simulation', kw: /\b(simulink|model-?based|mbd|simulation|hil|sil|code generation|plant model)\b/i, hint: 'System modelling, controller design, simulation and verification.', q: ['tool', 'stage'],
      f: [fC('services', 'Services needed', ['System modelling', 'Controller design', 'Simulation & verification', 'Automatic code generation', 'SIL / HIL testing']), fS('tool', 'Tooling', ['MATLAB / Simulink', 'Open-source (Modelica, Python)', 'No preference']), fT('domain', 'Domain (motor control, power, vehicle…)'), STAGE, WHEN, LINK, DESC] },
    { id: 'prototype', g: 0, n: 'Prototyping & small batches', kw: /\b(prototype|prototyping|assembly|small batch|pilot run)\b/i, hint: 'Prototype builds and small-batch coordination.', q: ['qty', 'when'],
      f: [fC('services', 'Services needed', ['PCB fabrication', 'Assembly', 'Enclosure', 'Functional test', 'Small batch']), QTY, fS('files', 'Existing material', ['Nothing yet', 'Schematic / drawings', 'Fabrication files', 'Full package']), WHEN, LINK, DESC] },
    { id: 'test', g: 0, n: 'Testing & validation', kw: /\b(test plan|validation|testing|verification|reliability|emc|test fixture)\b/i, hint: 'Functional, reliability and pre-compliance testing, test fixtures.', q: ['stage', 'when'],
      f: [fC('services', 'Services needed', ['Functional testing', 'Reliability testing', 'EMC pre-compliance', 'Test fixture design', 'Test automation']), fT('product', 'Product / standard concerned'), STAGE, WHEN, LINK, DESC] },
    { id: 'review', g: 0, n: 'Design review & consulting', kw: /\b(design review|review my|consult|second opinion|audit)\b/i, hint: 'Independent review of schematics, layouts, firmware or architecture.', q: ['type', 'when'],
      f: [fS('type', 'What should be reviewed', ['Schematic', 'PCB layout', 'Firmware', 'System architecture', 'General consulting']), fS('files', 'Material available', ['Schematic', 'Schematic + layout', 'Source code', 'Documentation only']), WHEN, LINK, DESC] },
    { id: 'repair', g: 0, n: 'Debugging & repair', kw: /\b(debug|repair|not working|doesn'?t work|fault|burnt|short circuit|troubleshoot)\b/i, hint: 'Fault finding and repair review for boards and devices.', q: ['device', 'fault'],
      f: [fT('device', 'Device / board'), fS('fault', 'Symptom', ['No power', 'Intermittent', 'Overheating', 'Communication fault', 'Wrong output', 'Other']), fS('docs', 'Schematics available', ['Yes', 'Partly', 'No']), LINK, DESC] },
    { id: 'education', g: 1, n: 'Training & workshops', kw: /\b(training|workshop|course|teach|bootcamp|lecture)\b/i, hint: 'Technical workshops and engineering training.', q: ['audience', 'format'],
      f: [fS('audience', 'Audience', ['University / students', 'Company team', 'Individual']), fT('topics', 'Topics of interest'), fS('size', 'Group size', ['1–10', '11–30', 'More than 30']), fS('format', 'Format', ['On-site', 'Online', 'Either']), WHEN, DESC] },
    { id: 'student', g: 1, n: 'Student project & scholarship', kw: /\b(student|scholarship|graduation project|thesis|university project|capstone)\b/i, hint: 'Engineering support and the planned scholarship programme.', q: ['level', 'area'],
      f: [fS('level', 'Applicant', ['Undergraduate', 'Graduate', 'Researcher', 'Startup team']), fT('inst', 'University / institution'), fS('area', 'Project area', AREAS), fS('need', 'What you need', ['Engineering support', 'Scholarship consideration', 'Mentoring']), BUDGET, LINK, DESC] },
    { id: 'research', g: 1, n: 'Research collaboration', kw: /\b(research|paper|co-?author|lab|joint project|academic)\b/i, hint: 'Joint projects, research prototypes and testing.', q: ['org', 'type'],
      f: [fT('org', 'Institution / lab', true), fS('type', 'Collaboration type', ['Joint project', 'Prototype for research', 'Testing / data', 'Publication']), fS('area', 'Field', AREAS), LINK, DESC] },
    { id: 'careers', g: 2, n: 'Careers & hiring', kw: /\b(job|hiring|career|careers|cv|resume|intern|internship|vacancy|position|apply)\b/i, hint: 'Join DOT CORE. Share a link to your CV; attachments are not collected here.', q: ['area', 'link'],
      f: [fS('area', 'Area of interest', AREAS, true), fS('level', 'Level', ['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead']), fS('mode', 'Work mode', ['On-site (Cairo)', 'Hybrid', 'Remote']), fU('link', 'Portfolio / LinkedIn / GitHub', true), fU('cv', 'Link to your CV'), fA('desc', 'Short message', true)] },
    { id: 'partnership', g: 2, n: 'Partnerships & agreements', kw: /\b(partner|partnership|collaborat|agreement|mou|sponsor|distribut|invest)\w*/i, hint: 'Technology, manufacturing, university and commercial partnerships.', q: ['org', 'type'],
      f: [fT('org', 'Organisation', true), fS('type', 'Partnership type', ['Technology partner', 'Manufacturing partner', 'University', 'Distributor', 'Investor', 'Other']), fT('region', 'Country / region'), fU('web', 'Website'), fA('desc', 'Proposal in brief', true)] },
    { id: 'supplier', g: 2, n: 'Suppliers & vendors', kw: /\b(supplier|vendor|we supply|our products|catalog(ue)?|quotation for you)\b/i, hint: 'Components, fabrication, assembly, tools and services.', q: ['company', 'offer'],
      f: [fT('company', 'Company', true), fS('offer', 'What you offer', ['Components', 'PCB fabrication', 'Assembly', 'Tools & equipment', 'Software / services', 'Other']), fU('web', 'Website'), fA('desc', 'Details', true)] },
    { id: 'events', g: 2, n: 'Events & speaking', kw: /\b(conference|event|speaker|keynote|exhibition|expo|summit|invite|invitation)\b/i, hint: 'Conferences, exhibitions, talks and sponsorship.', q: ['event', 'date'],
      f: [fT('event', 'Event name', true), fS('role', 'Request', ['Speaker invitation', 'Exhibition', 'Workshop', 'Sponsorship', 'Other']), fT('date', 'Date'), fT('place', 'Location / online'), fU('web', 'Event website'), fA('desc', 'Details', true)] },
    { id: 'press', g: 2, n: 'Press & media', kw: /\b(press|journalist|interview|media|article|magazine)\b/i, hint: 'Interviews, features and statements.', q: ['outlet', 'type'],
      f: [fT('outlet', 'Outlet / publication', true), fS('type', 'Request', ['Interview', 'Feature', 'Statement', 'Other']), fD('deadline', 'Deadline'), fA('desc', 'Request details', true)] },
    { id: 'complaint', g: 2, n: 'Complaint', kw: /\b(complain|complaint|refund|unhappy|dissatisf|not satisfied|unacceptable|escalat)\w*/i, hint: 'Report a problem with our work or conduct. Your complaint will be reviewed in confidence.', q: ['nature', 'ref'],
      f: [fS('nature', 'Nature of the complaint', ['Quality of work', 'Delay', 'Communication', 'Billing', 'Conduct', 'Data / IP concern', 'Other'], true), fT('ref', 'Project / reference (if any)'), fD('date', 'When it happened'), fS('outcome', 'Outcome you expect', ['Correction of the work', 'Explanation', 'Refund / adjustment', 'Process improvement', 'Not sure']), fA('desc', 'What happened', true)] },
    { id: 'general', g: 2, n: 'General inquiry', kw: null, hint: 'Anything else.', q: [], f: [fA('desc', 'Your message', true)] }
  ];
  var GROUPS = ['Engineering services', 'Programs', 'Company'], CBY = {}; CATS.forEach(function (c) { CBY[c.id] = c; });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function fieldHTML(f, pre, req) {
    var id = pre + f.k, r = (f.r || req) ? ' required' : '', lab = '<label for="' + id + '">' + esc(f.l) + (f.r ? ' *' : '') + '</label>';
    if (f.t === 'select') return '<div class="field">' + lab + '<select id="' + id + '" name="' + f.k + '"' + r + '><option value="">Select…</option>' + f.o.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></div>';
    if (f.t === 'checks') return '<fieldset class="field full checks"><legend>' + esc(f.l) + '</legend><div class="opts">' + f.o.map(function (o) { return '<label><input type="checkbox" name="' + f.k + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>'; }).join('') + '</div></fieldset>';
    if (f.t === 'area') return '<div class="field full">' + lab + '<textarea id="' + id + '" name="' + f.k + '"' + r + '></textarea></div>';
    return '<div class="field">' + lab + '<input id="' + id + '" name="' + f.k + '" type="' + f.t + '"' + r + (f.t === 'url' ? ' inputmode="url" placeholder="https://"' : '') + '></div>';
  }
  function collect(root, cat, keys) {
    var out = [], seen = {};
    cat.f.forEach(function (f) {
      if (keys && keys.indexOf(f.k) < 0) return; if (seen[f.k]) return; seen[f.k] = 1;
      if (f.t === 'checks') { var v = $$('input[name="' + f.k + '"]:checked', root).map(function (x) { return x.value; }); if (v.length) out.push([f.l, v.join(', ')]); }
      else { var el = $('[name="' + f.k + '"]', root); if (el && el.value.trim()) out.push([f.l, el.value.trim()]); }
    });
    return out;
  }
  function deliver(cat, who, rows, source, ui) {
    var subject = '[DOT CORE] ' + cat.n + (who.name ? ' — ' + who.name : ' — ' + who.email);
    var lines = ['Request type: ' + cat.n, 'Source: ' + source, 'Name: ' + (who.name || '-'), 'Email: ' + who.email];
    if (who.org) lines.push('Organisation: ' + who.org);
    lines.push(''); rows.forEach(function (r) { lines.push(r[0] + ': ' + r[1]); });
    if (FORM_ENDPOINT) {
      ui.busy(true); ui.say('Sending…');
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ subject: subject, type: cat.n, source: source, name: who.name, email: who.email, organization: who.org || '', details: rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') }) })
        .then(function (r) { if (!r.ok) throw 0; ui.done(); ui.say('Thank you. Your message was sent.'); })
        .catch(function () { ui.say('Could not send. Please email ' + CONTACT_EMAIL + ' directly.', true); })
        .then(function () { ui.busy(false); });
    } else {
      ui.say('Opening your email app…');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    }
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* --- detailed specialty forms --- */
  var forms = $('#forms'), form = $('#form'), curCat = 'pcb';
  function renderForm(id, keep) {
    if (!form) return; var cat = CBY[id] || CBY.pcb; curCat = cat.id;
    var kept = {}; ['name', 'email', 'org'].forEach(function (k) { var el = $('[name="' + k + '"]', form); if (el) kept[k] = el.value; });
    $$('#cats .cat').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-id') === cat.id ? 'true' : 'false'); });
    form.innerHTML =
      '<p class="fdesc"><b>' + esc(cat.n) + '.</b> ' + esc(cat.hint) + '</p><div class="fgrid">' +
      '<div class="field"><label for="f-name">Name *</label><input id="f-name" name="name" autocomplete="name" required></div>' +
      '<div class="field"><label for="f-email">Email *</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>' +
      '<div class="field"><label for="f-org">Company / university</label><input id="f-org" name="org" autocomplete="organization"></div>' +
      cat.f.map(function (f) { return fieldHTML(f, 'f-'); }).join('') + '</div>' +
      '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label class="consent"><input type="checkbox" name="consent" required><span>I agree that DOT CORE may use these details to reply to this request. <a href="privacy.html">Privacy policy</a></span></label>' +
      '<p class="status" id="status" role="status" aria-live="polite"></p>' +
      '<button class="submit" id="submit" type="submit"><span>Send request</span><b aria-hidden="true">↗</b></button>';
    Object.keys(kept).forEach(function (k) { var el = $('[name="' + k + '"]', form); if (el && kept[k]) el.value = kept[k]; });
  }
  if (form) {
    var cats = $('#cats'), html = '';
    GROUPS.forEach(function (g, gi) { html += '<p class="mono mute cathead">' + g + '</p><div class="catrow">' + CATS.filter(function (c) { return c.g === gi; }).map(function (c) { return '<button type="button" class="cat" data-id="' + c.id + '" aria-pressed="false">' + esc(c.n) + '</button>'; }).join('') + '</div>'; });
    cats.innerHTML = html;
    cats.addEventListener('click', function (e) { var b = e.target.closest('.cat'); if (b) renderForm(b.getAttribute('data-id')); });
    renderForm('pcb');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var st = $('#status', form), btn = $('#submit', form), cat = CBY[curCat], fd = new FormData(form);
      function say(m, bad) { st.textContent = m; st.classList.toggle('err', !!bad); }
      if (fd.get('website')) return;
      var name = (fd.get('name') || '').trim(), email = (fd.get('email') || '').trim();
      if (!name) return say('Please add your name.', true);
      if (!EMAIL_RE.test(email)) return say('Please enter a valid email address.', true);
      var miss = cat.f.filter(function (f) { if (!f.r) return false; var el = $('[name="' + f.k + '"]', form); return !el || !el.value.trim(); })[0];
      if (miss) return say('Please complete: ' + miss.l + '.', true);
      if (!fd.get('consent')) return say('Please confirm the consent box.', true);
      deliver(cat, { name: name, email: email, org: (fd.get('org') || '').trim() }, collect(form, cat), 'Request form', { say: say, busy: function (b) { btn.disabled = b; }, done: function () { renderForm(curCat); } });
    });
  }

  /* --- contact box: purpose-based simple fields, never blocks sending --- */
  var qb = $('#quick');
  if (qb) {
    var qsel = $('#q-purpose'), qdyn = $('#q-dyn'), qmsg = $('#q-msg'), qhint = $('#q-hint'), qst = $('#q-status'), qbtn = $('.qsend', qb), qtimer;
    var og = '<option value="">Choose a purpose…</option>';
    GROUPS.forEach(function (g, gi) { og += '<optgroup label="' + g + '">' + CATS.filter(function (c) { return c.g === gi; }).map(function (c) { return '<option value="' + c.id + '">' + esc(c.n) + '</option>'; }).join('') + '</optgroup>'; });
    qsel.innerHTML = og;
    var qsay = function (m, bad) { qst.textContent = m; qst.classList.toggle('err', !!bad); };
    function qRender() {
      var cat = CBY[qsel.value], h = '<div class="field"><label for="q-name">Name</label><input id="q-name" name="name" autocomplete="name"></div><div class="field"><label for="q-email">Email *</label><input id="q-email" name="email" type="email" autocomplete="email" required></div>';
      if (cat) cat.q.forEach(function (k) { var f = cat.f.filter(function (x) { return x.k === k; })[0]; if (f) h += fieldHTML(f, 'q-'); });
      var keepN = $('#q-name') ? $('#q-name').value : '', keepE = $('#q-email') ? $('#q-email').value : '';
      qdyn.innerHTML = h; $('#q-name').value = keepN; $('#q-email').value = keepE;
      $$('#disc .tile').forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-spec') === qsel.value ? 'true' : 'false'); });
      qHint();
    }
    function qHint() {
      var cur = CBY[qsel.value], txt = qmsg.value, guess = null, out = '';
      if (txt.length > 12) CATS.forEach(function (c) { if (!guess && c.kw && c.kw.test(txt) && c.id !== qsel.value) guess = c; });
      if (guess) out = 'This sounds like <b>' + esc(guess.n) + '</b>. <button type="button" data-switch="' + guess.id + '">Use this purpose</button> <button type="button" data-open="' + guess.id + '">Open the ' + esc(guess.n) + ' form</button> You can also send your message as written.';
      else if (cur && cur.id !== 'general') out = 'Need to give more detail? The <b>' + esc(cur.n) + '</b> form asks what our engineers need to reply faster. <button type="button" data-open="' + cur.id + '">Open the form</button> Or send from here as it is.';
      qhint.hidden = !out; qhint.innerHTML = out;
    }
    qsel.addEventListener('change', qRender);
    qmsg.addEventListener('input', function () { clearTimeout(qtimer); qtimer = setTimeout(qHint, 350); });
    qhint.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-switch')) { qsel.value = b.getAttribute('data-switch'); qRender(); }
      else if (b.hasAttribute('data-open')) { renderForm(b.getAttribute('data-open')); var em = $('#q-email').value, nm = $('#q-name').value; if (em) $('#f-email').value = em; if (nm) $('#f-name').value = nm; forms.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
    $$('#disc .tile').forEach(function (t) {
      t.addEventListener('click', function () { qsel.value = t.getAttribute('data-spec'); qRender(); qmsg.focus({ preventScroll: true }); });
    });
    qRender();
    qb.addEventListener('submit', function (e) {
      e.preventDefault(); if ($('[name="website"]', qb).value) return;
      var cat = CBY[qsel.value], email = $('#q-email').value.trim(), msg = qmsg.value.trim();
      if (!cat) return qsay('Please choose what this is about.', true);
      if (!EMAIL_RE.test(email)) return qsay('Please enter a valid email address.', true);
      if (!msg) return qsay('Please write a short message.', true);
      var rows = collect(qdyn, cat, cat.q); rows.push(['Message', msg]);
      deliver(cat, { name: $('#q-name').value.trim(), email: email }, rows, 'Contact box', { say: qsay, busy: function (b) { qbtn.disabled = b; }, done: function () { qmsg.value = ''; qRender(); } });
    });
  }
})();
