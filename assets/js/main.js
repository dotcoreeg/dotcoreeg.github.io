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
  Art.prototype.draw = function () {
    if (this.mode === 'traces') return this.drawTraces();
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
      if (now - a.last < 50) return;
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

  /* ---------------- optional hero video ---------------- */
  var hv = $('.hx-a2 video');
  if (hv) {
    hv.addEventListener('canplay', function () { hv.parentElement.classList.add('has-video'); hv.play && hv.play().catch(function () {}); });
    hv.addEventListener('error', function () { hv.parentElement.classList.remove('has-video'); hv.remove(); });
    if (reduce) { hv.removeAttribute('autoplay'); hv.pause && hv.pause(); }
  }

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
