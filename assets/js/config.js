/* ============================================================
   FORM — runtime configuration
   ------------------------------------------------------------
   This is the single place to switch the store from local "demo"
   mode to live payments + database. Nothing here is secret — only
   PUBLIC keys/URLs belong in this file. Secret keys live server-side
   in the Supabase Edge Function (see /supabase).

   HOW TO GO LIVE:
   1. Create a Supabase project → paste its URL + anon (public) key.
   2. Deploy the `create-checkout-session` Edge Function (see
      supabase/functions) and paste its URL into checkoutEndpoint.
   3. Add your Stripe PUBLISHABLE key (pk_live_… or pk_test_…).
   When checkoutEndpoint is set, checkout posts the cart to it and
   redirects to Stripe Checkout. Until then, checkout runs a local
   demo order so the whole flow is testable end-to-end.
   ============================================================ */
window.FORM = window.FORM || {};

FORM.config = {
  brand: 'FORM',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 150,
  shippingFlat: 12,

  /* ---- Supabase (public values only) ---- */
  supabaseUrl: '',        // e.g. 'https://xxxx.supabase.co'
  supabaseAnonKey: '',    // the public anon key

  /* ---- Stripe (publishable key only) ---- */
  stripePublishableKey: '',   // 'pk_live_…' or 'pk_test_…'

  /* ---- Checkout endpoint (Supabase Edge Function URL) ---- */
  checkoutEndpoint: '',   // e.g. 'https://xxxx.supabase.co/functions/v1/create-checkout-session'

  /* ---- Print options (price deltas in whole currency units) ---- */
  sizes: [
    { id: 'a4', label: 'A4 · 8×12"',  delta: 0 },
    { id: 'a3', label: 'A3 · 12×18"', delta: 8 },
    { id: 'a2', label: 'A2 · 16×24"', delta: 22 },
    { id: 'a1', label: 'A1 · 24×36"', delta: 40 }
  ],
  finishes: [
    { id: 'matte',    label: 'Archival Matte',     delta: 0 },
    { id: 'textured', label: 'Fine-Art Textured',  delta: 6 },
    { id: 'framed',   label: 'Framed (Oak)',       delta: 45 }
  ]
};

/* True when live payments are wired up. */
FORM.config.isLive = Boolean(FORM.config.checkoutEndpoint && FORM.config.stripePublishableKey);
FORM.config.hasSupabase = Boolean(FORM.config.supabaseUrl && FORM.config.supabaseAnonKey);
