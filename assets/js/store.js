/* ============================================================
   FORM — store engine
   Cart state (localStorage) · slide-in cart drawer · add-to-cart ·
   header wiring · money helpers · toast · Stripe/Supabase seams.
   Works fully client-side ("demo" mode); goes live when config.js
   is filled in. Depends on config.js + catalog.js (loaded first).
   ============================================================ */
(function () {
  'use strict';
  var F = window.FORM = window.FORM || {};
  var cfg = F.config || {};
  var CART_KEY = 'form_cart_v2';
  var ORDER_KEY = 'form_last_order';

  /* ---------------- helpers ---------------- */
  function money(n) {
    if (n == null || isNaN(n)) return '—';
    return cfg.currencySymbol + Number(n).toFixed(2);
  }
  function byId(id) { return (F.catalog || []).filter(function (c) { return c.id === id; })[0]; }
  function size(id) { return (cfg.sizes || []).filter(function (s) { return s.id === id; })[0] || (cfg.sizes || [])[0]; }
  function finish(id) { return (cfg.finishes || []).filter(function (s) { return s.id === id; })[0] || (cfg.finishes || [])[0]; }
  function unitPrice(item) {
    var p = byId(item.id); if (!p || p.price == null) return 0;
    return p.price + (size(item.size).delta || 0) + (finish(item.finish).delta || 0);
  }
  F.money = money; F.getStudy = byId;

  /* ---------------- cart state ---------------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    syncBadges(); renderDrawer();
    document.dispatchEvent(new CustomEvent('form:cart', { detail: items }));
  }
  var Cart = {
    items: read,
    count: function () { return read().reduce(function (n, i) { return n + i.qty; }, 0); },
    subtotal: function () { return read().reduce(function (n, i) { return n + unitPrice(i) * i.qty; }, 0); },
    unitPrice: unitPrice,
    add: function (id, sz, fn, qty) {
      var p = byId(id); if (!p || p.status !== 'live') return false;
      sz = sz || (cfg.sizes[0].id); fn = fn || (cfg.finishes[0].id); qty = qty || 1;
      var items = read();
      var hit = items.filter(function (i) { return i.id === id && i.size === sz && i.finish === fn; })[0];
      if (hit) hit.qty += qty; else items.push({ id: id, size: sz, finish: fn, qty: qty });
      write(items); return true;
    },
    setQty: function (idx, qty) {
      var items = read(); if (!items[idx]) return;
      items[idx].qty = Math.max(1, qty); write(items);
    },
    remove: function (idx) { var items = read(); items.splice(idx, 1); write(items); },
    clear: function () { write([]); }
  };
  F.cart = Cart;

  /* ---------------- toast ---------------- */
  function toast(html) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.id = 'toast'; document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  F.toast = toast;

  /* ---------------- header badges ---------------- */
  function syncBadges() {
    var n = Cart.count();
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n; });
  }

  /* ---------------- cart drawer ---------------- */
  var drawer, backdrop;
  function buildDrawer() {
    backdrop = document.createElement('div'); backdrop.className = 'cart-backdrop';
    drawer = document.createElement('aside'); drawer.className = 'cart-drawer'; drawer.setAttribute('aria-label', 'Cart');
    drawer.innerHTML =
      '<div class="cart-drawer-head"><span class="cart-drawer-title">Your cart</span>' +
      '<button class="cart-drawer-close" aria-label="Close cart">&times;</button></div>' +
      '<div class="cart-drawer-body" id="cartDrawerBody"></div>' +
      '<div class="cart-drawer-foot" id="cartDrawerFoot"></div>';
    document.body.appendChild(backdrop); document.body.appendChild(drawer);
    backdrop.addEventListener('click', closeDrawer);
    drawer.querySelector('.cart-drawer-close').addEventListener('click', closeDrawer);
    drawer.addEventListener('click', onDrawerClick);
  }
  function openDrawer() { if (!drawer) buildDrawer(); renderDrawer(); document.body.classList.add('cart-open'); }
  function closeDrawer() { document.body.classList.remove('cart-open'); }
  F.openCart = openDrawer;

  function lineRow(i, idx) {
    var p = byId(i.id) || {};
    return '<div class="cart-line" data-idx="' + idx + '">' +
      '<a class="cart-line-img" href="product.html?study=' + i.id + '"><img src="' + p.img + '" alt=""></a>' +
      '<div class="cart-line-info">' +
        '<div class="cart-line-title">' + (p.title || i.id) + '</div>' +
        '<div class="cart-line-opt">' + size(i.size).label + ' · ' + finish(i.finish).label + '</div>' +
        '<div class="cart-line-qty">' +
          '<button class="qty-btn" data-act="dec" aria-label="Decrease">−</button>' +
          '<span class="qty-n">' + i.qty + '</span>' +
          '<button class="qty-btn" data-act="inc" aria-label="Increase">+</button>' +
          '<button class="cart-line-remove" data-act="rm">Remove</button>' +
        '</div>' +
      '</div>' +
      '<div class="cart-line-price">' + money(unitPrice(i) * i.qty) + '</div>' +
    '</div>';
  }
  function renderDrawer() {
    if (!drawer) return;
    var body = drawer.querySelector('#cartDrawerBody');
    var foot = drawer.querySelector('#cartDrawerFoot');
    var items = read();
    if (!items.length) {
      body.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a href="shop.html" class="btn btn-outline">Browse the archive</a></div>';
      foot.innerHTML = ''; return;
    }
    body.innerHTML = items.map(lineRow).join('');
    var sub = Cart.subtotal();
    var ship = sub >= cfg.freeShippingThreshold ? 0 : cfg.shippingFlat;
    foot.innerHTML =
      '<div class="cart-sub"><span>Subtotal</span><b>' + money(sub) + '</b></div>' +
      '<div class="cart-ship"><span>Shipping</span><b>' + (ship === 0 ? 'Free' : money(ship)) + '</b></div>' +
      '<a href="checkout.html" class="btn btn-block">Checkout · ' + money(sub + ship) + '</a>' +
      '<a href="cart.html" class="cart-viewall">View full cart</a>';
  }
  function onDrawerClick(e) {
    var line = e.target.closest('.cart-line'); if (!line) return;
    var idx = +line.getAttribute('data-idx');
    var act = e.target.getAttribute('data-act');
    if (act === 'inc') Cart.setQty(idx, read()[idx].qty + 1);
    else if (act === 'dec') Cart.setQty(idx, read()[idx].qty - 1);
    else if (act === 'rm') Cart.remove(idx);
  }

  /* ---------------- add-to-cart (event delegation) ---------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    e.preventDefault();
    var id = btn.getAttribute('data-id');
    var sz = btn.getAttribute('data-size') || undefined;
    var fn = btn.getAttribute('data-finish') || undefined;
    // PDP: read selected options live
    if (btn.hasAttribute('data-pdp')) {
      var s = document.querySelector('.option-row[data-opt="size"] .option.active');
      var f = document.querySelector('.option-row[data-opt="finish"] .option.active');
      if (s) sz = s.getAttribute('data-val'); if (f) fn = f.getAttribute('data-val');
    }
    var p = byId(id);
    if (!p || p.status !== 'live') { toast('This study is <b>coming soon</b>'); return; }
    if (Cart.add(id, sz, fn, 1)) { toast('Added <b>' + p.title + '</b> to cart'); openDrawer(); }
  });

  /* ---------------- header wiring ---------------- */
  function wireHeader() {
    document.querySelectorAll('.nav-cart').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openDrawer(); });
    });
  }

  /* ---------------- Supabase-lite (optional) ---------------- */
  F.db = {
    /* Insert a row into a table via Supabase REST, or no-op in demo mode. */
    insert: function (table, row) {
      if (!cfg.hasSupabase) { console.info('[FORM demo] would insert into', table, row); return Promise.resolve({ demo: true }); }
      return fetch(cfg.supabaseUrl + '/rest/v1/' + table, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.supabaseAnonKey,
          'Authorization': 'Bearer ' + cfg.supabaseAnonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row)
      }).then(function (r) { return r.ok ? { ok: true } : Promise.reject(r); });
    }
  };

  /* ---------------- checkout ---------------- */
  F.checkout = {
    /* Build the payload sent to Stripe/Supabase. */
    payload: function (customer) {
      var items = read().map(function (i) {
        var p = byId(i.id);
        return { id: i.id, title: p.title, size: i.size, finish: i.finish, qty: i.qty, unit: unitPrice(i) };
      });
      var sub = Cart.subtotal();
      var ship = sub >= cfg.freeShippingThreshold ? 0 : cfg.shippingFlat;
      return { items: items, subtotal: sub, shipping: ship, total: sub + ship, customer: customer || null, currency: cfg.currency };
    },
    /* Start checkout. Live → Stripe via endpoint; demo → local order. */
    start: function (customer) {
      var data = F.checkout.payload(customer);
      if (cfg.checkoutEndpoint) {
        return fetch(cfg.checkoutEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (r) { return r.json(); })
          .then(function (res) {
            if (res && res.url) { window.location.href = res.url; return; }
            throw new Error('No checkout URL returned');
          });
      }
      // demo fallback — record a local order and go to confirmation
      var order = { id: 'FORM-' + Date.now().toString(36).toUpperCase(), demo: true, placed: new Date().toISOString(), data: data };
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
      F.db.insert('orders', { ref: order.id, total: data.total, currency: data.currency, items: data.items, customer: data.customer, demo: true });
      Cart.clear();
      return Promise.resolve().then(function () { window.location.href = 'order-confirmation.html?ref=' + order.id + '&demo=1'; });
    },
    lastOrder: function () { try { return JSON.parse(localStorage.getItem(ORDER_KEY)); } catch (e) { return null; } }
  };

  /* ---------------- init ---------------- */
  function init() { syncBadges(); wireHeader(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
