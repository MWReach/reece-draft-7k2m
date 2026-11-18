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

  // Enquiry form. If a Web3Forms key is set it sends straight to the inbox. Until then it prepares the
  // enquiry so the customer can send it in one tap by WhatsApp or email (both work with no third party).
  var form = doc.getElementById('enq');
  if (form) {
    var note = doc.getElementById('note');
    var PHONE = '07730 512061', WAURL = 'https://wa.me/447730512061', MAIL = 'info@reecelandscapes.co.uk';
    var clear = function () { while (note.firstChild) note.removeChild(note.firstChild); };
    var say = function (t, ok) { clear(); note.className = 'msg' + (ok ? ' ok' : ''); note.appendChild(doc.createTextNode(t)); note.hidden = false; note.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    var addLink = function (label, href, cls) { var a = doc.createElement('a'); a.className = cls; a.href = href; a.textContent = label; note.appendChild(a); };
    var offer = function (f) {
      var lines = ['Hi Reece Landscapes, I would like a quote.', '', 'Name: ' + f.name.value, 'Phone: ' + f.phone.value];
      if (f.email.value) lines.push('Email: ' + f.email.value);
      if (f.message.value) lines.push('', 'What I would like done: ' + f.message.value);
      var text = lines.join('\n');
      clear(); note.className = 'msg ok'; note.hidden = false;
      var b = doc.createElement('b'); b.textContent = 'Thanks ' + f.name.value + '. Your enquiry is ready. Choose how to send it:'; note.appendChild(b);
      addLink('Send by WhatsApp', WAURL + '?text=' + encodeURIComponent(text), 'btn');
      addLink('Send by email', 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Quote enquiry from ' + f.name.value) + '&body=' + encodeURIComponent(text), 'btn dark');
      var p = doc.createElement('span'); p.style.cssText = 'display:block;margin-top:10px;font-size:14px'; p.textContent = 'Or call us on ' + PHONE + '.'; note.appendChild(p);
      note.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name=botcheck]').checked) return;
      var key = form.querySelector('[name=access_key]').value;
      if (!key || key.indexOf('ACCESS_KEY') > -1) { offer(form); return; }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending...';
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.success) { say('Thank you. We have your enquiry and will be in touch soon.', true); form.reset(); }
          else { offer(form); }
        })
        .catch(function () { offer(form); })
        .then(function () { btn.disabled = false; btn.textContent = 'Send my enquiry'; });
    });
  }
})();
