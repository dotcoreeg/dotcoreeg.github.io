(function () {
  'use strict';

  /* ---------------- configuration ----------------
     Contact form: GitHub Pages is static, so the form needs a form backend.
     1. Create a free form at https://formspree.io (or similar) pointing to dot.core.eg@gmail.com
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
    drawAll();
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
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------------- clocks ---------------- */
  var clocks = $$('time[data-tz]');
  function tick() {
    var now = new Date();
    clocks.forEach(function (el) {
      try {
        el.textContent = now.toLocaleTimeString('en-GB', { timeZone: el.getAttribute('data-tz'), hour: '2-digit', minute: '2-digit' });
      } catch (e) { el.textContent = ''; }
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 15000); }
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- reveal + counters ---------------- */
  function count(el) {
    var to = parseInt(el.getAttribute('data-count'), 10) || 0, pad = parseInt(el.getAttribute('data-pad'), 10) || 0;
    function fmt(n) { var s = String(n); while (s.length < pad) s = '0' + s; return s; }
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1500;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }
  var revealEls = $$('.rv, .mask');
  var counters = $$('[data-count]');
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
    counters.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
  // hero headline plays immediately
  setTimeout(function () { $$('.hero .mask').forEach(function (m, i) { setTimeout(function () { m.classList.add('in'); }, i * 140); }); }, 80);

  /* ---------------- FAQ: one open at a time ---------------- */
  var det = $$('.faq details');
  det.forEach(function (el) {
    el.addEventListener('toggle', function () {
      if (el.open) det.forEach(function (o) { if (o !== el) o.open = false; });
    });
  });

  /* ---------------- halftone art (original generative dot-matrix) ---------------- */
  var arts = [];
  function Art(cv) {
    var self = this;
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.mode = cv.getAttribute('data-ht') || 'field';
    this.step = parseFloat(cv.getAttribute('data-step')) || 10;
    this.seed = parseFloat(cv.getAttribute('data-seed')) || 1;
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
  };
  Art.prototype.val = function (x, y) {
    var w = this.w, h = this.h, t = this.t, s = this.seed, nx = x / w, ny = y / h, v;
    if (this.mode === 'person') {
      // abstract head-and-shoulders silhouette (neutral placeholder portrait)
      var hx = (nx - .5) / .2, hy = (ny - .37) / .24, head = hx * hx + hy * hy;
      var sx = (nx - .5) / .5, sy = (ny - 1.02) / .42, sh = sx * sx + sy * sy;
      var nk = Math.abs(nx - .5) < .07 && ny > .5 && ny < .72 ? 1 : 0;
      var light = .62 + .38 * (1 - nx) + .08 * Math.sin(s * 2 + ny * 5);
      if (head < 1) v = (.9 - .35 * head) * light;
      else if (sh < 1 || nk) v = (.78 - .25 * sh) * light;
      else v = .12 + .1 * Math.sin(nx * 7 + s) * Math.sin(ny * 6 - s);
      v += .04 * Math.sin(t + nx * 9 + ny * 7);
    } else {
      v = .5 + .2 * Math.sin(nx * 5.1 + s + t * .55) + .2 * Math.sin(ny * 6.3 - s * 1.7 - t * .45) + .14 * Math.sin((nx + ny) * 9 + t * .35);
      var cx = (.5 + Math.sin(s) * .12) * w, cy = (.52 + Math.cos(s) * .08) * h;
      var dd = Math.hypot(x - cx, y - cy) / Math.min(w * 1.1, h * 1.1);
      var ring = Math.abs(Math.sin(dd * 15 - t * .7));
      v = v * .55 + ring * .55 * (1 - Math.min(dd, 1) * .55);
      v *= .55 + .45 * Math.min(1, dd * 1.6 + .2);
    }
    var md = Math.hypot(x - this.mx, y - this.my);
    if (md < 130) v += (1 - md / 130) * .55;
    return v;
  };
  Art.prototype.draw = function () {
    var ctx = this.ctx, st = this.step, w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getComputedStyle(this.cv).color;
    ctx.beginPath();
    var r = st * .5, off = st / 2;
    for (var y = off; y < h; y += st) {
      for (var x = off; x < w; x += st) {
        var v = this.val(x, y); if (v < .06) continue;
        v = v > 1 ? 1 : v;
        var rad = r * Math.pow(v, 1.35) * .96;
        if (rad < .35) continue;
        ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, 6.2832);
      }
    }
    ctx.fill();
  };
  var artEls = $$('canvas[data-ht]');
  artEls.forEach(function (cv) { arts.push(new Art(cv)); });
  function drawAll() { arts.forEach(function (a) { a.draw(); }); }
  function loop(now) {
    requestAnimationFrame(loop);
    arts.forEach(function (a) {
      if (!a.vis || a.mode === 'person' && a.mx < -999) return;
      if (now - a.last < 42) return;
      a.last = now; a.t += .035; a.draw();
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
