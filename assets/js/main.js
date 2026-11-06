(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');

  // nav background on scroll
  var nav = d.getElementById('nav');
  function onScroll() { nav.classList.toggle('on', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  var burger = d.getElementById('burger'), links = d.getElementById('navLinks');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // reveal on scroll
  var items = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // FAQ: keep one open at a time
  var det = d.querySelectorAll('.faq__list details');
  det.forEach(function (el) {
    el.addEventListener('toggle', function () {
      if (el.open) det.forEach(function (o) { if (o !== el) o.open = false; });
    });
  });


  // theme toggle
  var tb = d.getElementById('theme'), metaTheme = d.querySelector('meta[name=theme-color]');
  function applyTheme(t) {
    if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    tb.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#f4f3ef' : '#0a0a0a');
  }
  var saved = null;
  try { saved = localStorage.getItem('dc-theme'); } catch (e) {}
  applyTheme(saved === 'light' ? 'light' : 'dark');
  tb.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('dc-theme', next); } catch (e) {}
  });

  // Cairo clock
  var clk = d.getElementById('clock');
  function tick() {
    try {
      clk.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit' });
    } catch (e) { clk.textContent = ''; }
  }
  if (clk) { tick(); setInterval(tick, 30000); }

  // year
  var yr = d.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
