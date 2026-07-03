/* ============================================================
   FORM — storefront interactions
   Lightweight, dependency-free. Cart state persists in
   localStorage so the count survives navigation between pages.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Scroll progress bar ---------- */
  var indicator = document.getElementById('scrollIndicator');
  if (indicator) {
    window.addEventListener('scroll', function () {
      var dh = document.documentElement.scrollHeight - window.innerHeight;
      indicator.style.width = (dh > 0 ? (window.scrollY / dh) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.mobile-menu');
  var closeBtn = document.querySelector('.mobile-menu-close');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () { drawer.classList.add('open'); });
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', function () { drawer.classList.remove('open'); });
  }

  /* ---------- Cart count (localStorage) ---------- */
  function getCount() { return parseInt(localStorage.getItem('form_cart') || '0', 10); }
  function setCount(n) {
    localStorage.setItem('form_cart', String(n));
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n; });
  }
  setCount(getCount());

  /* ---------- Toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  /* ---------- Add to cart (any [data-add]) ---------- */
  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      setCount(getCount() + 1);
      var name = btn.getAttribute('data-add') || 'Print';
      showToast('Added <b>' + name + '</b> to cart');
    });
  });

  /* ---------- Filter chips (shop / home) ---------- */
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

  /* ---------- Product option pickers (PDP) ---------- */
  document.querySelectorAll('.option-row').forEach(function (row) {
    row.querySelectorAll('.option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        row.querySelectorAll('.option').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
      });
    });
  });

  /* ---------- PDP thumbnail swap ---------- */
  var mainImg = document.getElementById('pdpMain');
  if (mainImg) {
    document.querySelectorAll('.pdp-thumbs img').forEach(function (t) {
      t.addEventListener('click', function () { mainImg.src = t.src; });
    });
  }

  /* ---------- Newsletter / forms (demo, no backend) ---------- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.reset();
      showToast(form.getAttribute('data-demo') || 'Thanks — you are on the list');
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
