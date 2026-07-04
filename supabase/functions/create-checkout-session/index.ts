// ============================================================
// FORM — Stripe Checkout Session (Supabase Edge Function)
// Deploy:  supabase functions deploy create-checkout-session --no-verify-jwt
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_live_... \
//                               SITE_URL=https://your-domain \
//                               SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
// Then paste the function URL into assets/js/config.js -> checkoutEndpoint
// ============================================================
import Stripe from "https://esm.sh/stripe@16?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://aiartworks.github.io/FORM";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function saveOrder(ref: string, sessionId: string, data: any) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ref, stripe_session_id: sessionId,
      email: data.customer?.email ?? null,
      customer: data.customer ?? null,
      items: data.items, subtotal: data.subtotal,
      shipping: data.shipping, total: data.total,
      currency: data.currency ?? "USD", status: "pending",
    }),
  }).catch((e) => console.error("saveOrder failed", e));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const data = await req.json();
    const ref = "FORM-" + Date.now().toString(36).toUpperCase();
    const currency = (data.currency ?? "usd").toLowerCase();

    const line_items = (data.items ?? []).map((i: any) => ({
      quantity: i.qty,
      price_data: {
        currency,
        unit_amount: Math.round(Number(i.unit) * 100),
        product_data: {
          name: `${i.title} — Study print`,
          description: [i.size, i.finish].filter(Boolean).join(" · "),
        },
      },
    }));

    if (data.shipping && Number(data.shipping) > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(Number(data.shipping) * 100),
          product_data: { name: "Shipping" },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      line_items,
      customer_email: data.customer?.email,
      success_url: `${SITE_URL}/order-confirmation.html?ref=${ref}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart.html`,
      metadata: { ref },
    });

    await saveOrder(ref, session.id, data);

    return new Response(JSON.stringify({ url: session.url, ref }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
