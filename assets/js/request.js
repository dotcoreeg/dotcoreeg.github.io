/* DOT CORE — full request forms page */
(function () {
  'use strict';
  var R = window.DCR; if (!R) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var form = $('#rq-form'), list = $('#rq-list'), head = $('#rq-head'), prog = $('#rq-prog'), cur = null, DK = 'dc-req-draft-';
  var qs = new URLSearchParams(location.search);
  try { var t = localStorage.getItem('dc-theme'); if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) {}

  list.innerHTML = R.GROUPS.map(function (g, gi) {
    return '<p class="cathead">' + g + '</p>' + R.CATS.filter(function (c) { return c.g === gi; }).map(function (c) { return '<button type="button" class="rq-cat" data-id="' + c.id + '" aria-pressed="false">' + R.esc(c.n) + '</button>'; }).join('');
  }).join('');
  list.addEventListener('click', function (e) { var b = e.target.closest('.rq-cat'); if (b) open(b.getAttribute('data-id'), true); });

  function load(id) { try { return JSON.parse(localStorage.getItem(DK + id) || 'null'); } catch (e) { return null; } }
  function save() { if (!cur) return; try { var d = {}; [].forEach.call(form.elements, function (el) { if (!el.name || el.name === 'website' || el.name === 'consent') return; if (el.type === 'checkbox') { if (el.checked) (d[el.name] = d[el.name] || []).push(el.value); } else if (el.value) d[el.name] = el.value; }); localStorage.setItem(DK + cur.id, JSON.stringify(d)); } catch (e) {} }
  function clearDraft() { try { localStorage.removeItem(DK + cur.id); } catch (e) {} }
  function restore(d) {
    if (!d) return;
    Object.keys(d).forEach(function (k) {
      var els = form.querySelectorAll('[name="' + k + '"]');
      [].forEach.call(els, function (el) { if (el.type === 'checkbox') el.checked = [].concat(d[k]).indexOf(el.value) > -1; else el.value = d[k]; });
    });
    [].forEach.call(form.querySelectorAll('[data-k]'), function (w) { var o = w.querySelector('.other'); if (!o) return; var on = w.querySelector('input[value="Other"]:checked') || (w.querySelector('select') && w.querySelector('select').value === 'Other'); o.hidden = !on; });
  }

  function open(id, push) {
    var cat = R.CBY[id] || R.CBY.general; cur = cat;
    [].forEach.call(list.querySelectorAll('.rq-cat'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-id') === cat.id ? 'true' : 'false'); });
    if (push) { try { history.replaceState(null, '', '?type=' + cat.id); } catch (e) {} }
    document.title = cat.n + ' request — DOT CORE';
    head.innerHTML = '<p class="mono label">' + R.GROUPS[cat.g] + '</p><h2>' + R.esc(cat.n) + '</h2><p class="fdesc">' + R.esc(cat.hint) + ' Fields marked * are required. Everything else helps us reply with a precise answer.</p>';
    var secs = R.sections(cat), h = '';
    secs.forEach(function (s, i) {
      h += '<section class="rq-sec" data-sec="' + i + '"><h3><span class="mono">' + ('0' + (i + 1)).slice(-2) + '</span>' + R.esc(s[0]) + '</h3><div class="fgrid">' + s[1].map(function (f) { return R.fieldHTML(f, 'f-'); }).join('') + '</div></section>';
    });
    h += '<section class="rq-sec" data-sec="review"><h3><span class="mono">' + ('0' + (secs.length + 1)).slice(-2) + '</span>Review and send</h3><div id="rq-sum" class="rq-sum" hidden></div><input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="consent"><input type="checkbox" name="consent" required><span>I agree that DOT CORE may use this information to reply to my request, as described in the <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a>.</span></label><div class="rq-actions"><button type="button" class="btnline" id="rq-review">Review summary <b aria-hidden="true">↓</b></button><button type="submit" class="qsend"><span>Send request</span><b aria-hidden="true">→</b></button></div><p class="status" id="rq-status" role="status" aria-live="polite"></p><p class="mono mute rq-saved" id="rq-saved"></p></section>';
    form.innerHTML = h;
    prog.innerHTML = secs.map(function (s, i) { return '<a href="#" data-go="' + i + '"><i></i><span>' + R.esc(s[0]) + '</span></a>'; }).join('') + '<a href="#" data-go="review"><i></i><span>Review</span></a>';
    var d = load(cat.id), pre = {}; ['name', 'email'].forEach(function (k) { if (qs.get(k)) pre[k] = qs.get(k); });
    restore(d); [].forEach.call(Object.keys(pre), function (k) { var el = form.querySelector('[name="' + k + '"]'); if (el && !el.value) el.value = pre[k]; });
    if (d) $('#rq-saved').textContent = 'Your saved draft was restored on this device.';
    update();
  }
  function update() {
    var secs = form.querySelectorAll('.rq-sec');
    [].forEach.call(prog.children, function (a, i) {
      var s = secs[i]; if (!s) return; var req = s.querySelectorAll('[required]'), ok = true;
      [].forEach.call(req, function (el) { if (el.type === 'checkbox' ? !el.checked : !el.value.trim()) ok = false; });
      var any = [].some.call(s.querySelectorAll('input:not(.hp),select,textarea'), function (el) { return el.type === 'checkbox' ? el.checked : !!el.value; });
      a.className = (ok && any) ? 'done' : '';
    });
  }
  prog.addEventListener('click', function (e) { var a = e.target.closest('a'); if (!a) return; e.preventDefault(); var s = form.querySelector('[data-sec="' + a.getAttribute('data-go') + '"]'); if (s) s.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });

  var tmr; form.addEventListener('input', function () { clearTimeout(tmr); tmr = setTimeout(function () { save(); update(); var s = $('#rq-saved'); if (s) s.textContent = 'Draft saved on this device.'; }, 400); });
  form.addEventListener('change', function () { save(); update(); });
  R.bindOther(form);

  function groups() {
    var secs = R.sections(cur), out = [];
    secs.forEach(function (s, i) { out.push({ title: s[0], rows: R.collect(form.querySelectorAll('.rq-sec')[i], s[1]) }); });
    return out;
  }
  function say(m, bad) { var s = $('#rq-status'); s.textContent = m; s.classList.toggle('err', !!bad); }
  function validate() {
    var bad = null, missing = [];
    [].forEach.call(form.querySelectorAll('[required]'), function (el) { var empty = el.type === 'checkbox' ? !el.checked : !el.value.trim(); el.setAttribute('aria-invalid', empty ? 'true' : 'false'); if (empty) { missing.push(el); bad = bad || el; } });
    var em = form.querySelector('[name="email"]'); if (em && em.value && !R.EMAIL_RE.test(em.value.trim())) { em.setAttribute('aria-invalid', 'true'); bad = bad || em; say('Please enter a valid email address.', true); em.focus(); return false; }
    if (bad) { say(missing.length + ' required ' + (missing.length > 1 ? 'fields are' : 'field is') + ' missing.', true); bad.focus(); return false; }
    return true;
  }
  $('#rq-form').addEventListener('click', function (e) {
    if (!e.target.closest('#rq-review')) return;
    var g = groups(), box = $('#rq-sum'); box.hidden = false;
    box.innerHTML = g.map(function (s) { return s.rows.length ? '<h4 class="mono">' + R.esc(s.title) + '</h4><dl>' + s.rows.map(function (r) { return '<dt>' + R.esc(r[0]) + '</dt><dd>' + R.esc(r[1]) + '</dd>'; }).join('') + '</dl>' : ''; }).join('') || '<p>Nothing entered yet.</p>';
    box.scrollIntoView({ block: 'nearest' });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (form.querySelector('[name="website"]').value) return;
    if (!validate()) return;
    var g = groups(), ref = R.refId(), name = (form.querySelector('[name="name"]') || {}).value || '', email = form.querySelector('[name="email"]').value.trim();
    var text = R.summaryText(cur, ref, g), btn = form.querySelector('.qsend');
    R.deliver(cur, { name: name.trim(), email: email }, ref, text, 'Request form', { say: say, busy: function (b) { btn.disabled = b; }, done: function (mail) { if (!mail) { clearDraft(); form.reset(); } } });
  });

  open(qs.get('type') || 'pcb', false);
})();
