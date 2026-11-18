(function () {
  var doc = document;

  // Header turns solid after scrolling (home page only; other pages are always solid)
  var h = doc.getElementById('hdr');
  if (h && !h.classList.contains('always')) {
    var s = function () { h.classList.toggle('solid', window.scrollY > 60); };
    s();
    addEventListener('scroll', s, { passive: true });
  }

  // Mobile menu
  var mb = doc.getElementById('menubtn'), mn = doc.getElementById('mnav');
  if (mb && mn) {
    mb.addEventListener('click', function () {
      var open = mn.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      mb.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Reveal on scroll
  var els = doc.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) {
      e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Gallery: filter and lightbox
  var gal = doc.querySelector('.gal[data-gallery]');
  var lb = doc.getElementById('lb');
  if (gal && lb) {
    var li = doc.getElementById('lbi'), lc = doc.getElementById('lbc');
    var btns = Array.prototype.slice.call(gal.querySelectorAll('button'));
    var cur = 0;
    var visible = function () { return btns.filter(function (b) { return !b.hidden; }); };
    var show = function (b) {
      var im = b.querySelector('img');
      li.src = im.currentSrc || im.src; li.alt = im.alt; lc.textContent = b.getAttribute('data-cap') || '';
      if (!lb.open && lb.showModal) lb.showModal();
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { cur = visible().indexOf(b); show(b); }); });
    var step = function (d) { var v = visible(); if (!v.length) return; cur = (cur + d + v.length) % v.length; show(v[cur]); };
    var pv = doc.getElementById('lbp'), nx = doc.getElementById('lbn');
    if (pv) pv.addEventListener('click', function () { step(-1); });
    if (nx) nx.addEventListener('click', function () { step(1); });
    doc.getElementById('lbx').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    var fs = doc.querySelectorAll('.filters button');
    fs.forEach(function (f) {
      f.addEventListener('click', function () {
        var cat = f.getAttribute('data-f');
        fs.forEach(function (x) { x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); });
        btns.forEach(function (b) { b.hidden = !(cat === 'all' || b.getAttribute('data-cat') === cat); });
      });
    });
  }

  // Enquiry form (Web3Forms). Until the access key is added, the form tells people to call or WhatsApp.
  var form = doc.getElementById('enq');
  if (form) {
    var note = doc.getElementById('note');
    var say = function (t, ok) { note.className = 'msg' + (ok ? ' ok' : ''); note.textContent = t; note.hidden = false; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var key = form.querySelector('[name=access_key]').value;
      if (!key || key.indexOf('ACCESS_KEY') > -1) {
        say('The online form is not switched on yet. Please call 07730 512061 or message us on WhatsApp and we will get straight back to you.', false);
        return;
      }
      if (form.querySelector('[name=botcheck]').checked) return;
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending...';
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.success) { form.reset(); say('Thank you. We have your enquiry and will be in touch soon.', true); }
          else { say('Sorry, that did not send. Please call 07730 512061 or message us on WhatsApp.', false); }
        })
        .catch(function () { say('Sorry, that did not send. Please call 07730 512061 or message us on WhatsApp.', false); })
        .then(function () { btn.disabled = false; btn.textContent = 'Send my enquiry'; });
    });
  }
})();
