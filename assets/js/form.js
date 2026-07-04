/* ============================================================
   FORM — UI interactions (non-cart).
   Cart/checkout live in store.js; this handles page chrome.
   ============================================================ */
(function () {
  'use strict';
  var F = window.FORM = window.FORM || {};
  function toast(msg) { (F.toast || function (m) { console.log(m); })(msg); }

  /* Scroll progress */
  var indicator = document.getElementById('scrollIndicator');
  if (indicator) {
    window.addEventListener('scroll', function () {
      var dh = document.documentElement.scrollHeight - window.innerHeight;
      indicator.style.width = (dh > 0 ? (window.scrollY / dh) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* Mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.mobile-menu');
  var closeBtn = document.querySelector('.mobile-menu-close');
  if (toggle && drawer) toggle.addEventListener('click', function () { drawer.classList.add('open'); });
  if (closeBtn && drawer) closeBtn.addEventListener('click', function () { drawer.classList.remove('open'); });

  /* Filter chips */
  document.querySelectorAll('[data-filters]').forEach(function (row) {
    var grid = document.querySelector(row.getAttribute('data-filters'));
    row.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        row.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var cat = chip.getAttribute('data-cat');
        if (!grid) return;
        grid.querySelectorAll('.product-card').forEach(function (card) {
          var show = cat === 'all' || card.getAttribute('data-cat') === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* Option pickers (size / finish) — generic toggle */
  document.querySelectorAll('.option-row').forEach(function (row) {
    row.querySelectorAll('.option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        row.querySelectorAll('.option').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        document.dispatchEvent(new CustomEvent('form:option'));
      });
    });
  });

  /* PDP thumbnail swap */
  var mainImg = document.getElementById('pdpMain');
  if (mainImg) {
    document.querySelectorAll('.pdp-thumbs img').forEach(function (t) {
      t.addEventListener('click', function () { mainImg.src = t.src; });
    });
  }

  /* Demo forms (newsletter, notify, etc.) */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (form.querySelector('input[type=email]') || {}).value;
      if (email && F.db) F.db.insert('newsletter_signups', { email: email, source: form.getAttribute('data-source') || 'site' });
      form.reset();
      toast(form.getAttribute('data-demo') || 'Thanks — you are on the list');
    });
  });

  /* Footer year */
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
