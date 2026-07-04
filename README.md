# FORM — The Engineering Archive

**Hand-detailed studies of the machines and structures that shaped the modern
world — printed to order on museum-grade paper.**

FORM is a print-on-demand storefront for an engineering-art archive. It's a
fast, dependency-free static website — hand-built HTML, CSS, and vanilla JS —
using an archival design system: **warm paper, black draughtsman linework, and
an archive-gold accent**, with a boxed "FORM" wordmark (Archivo display + Inter
body).

Volumes I & II — the **motorcycle studies** and the **sports-car design icons**
— are live. Volumes III–VI (Mechanical Anatomy, Blueprint, Workshop, Industrial
Icons) are scaffolded as placeholder collections. A full client-side cart and
checkout is wired, with Stripe + Supabase integration seams ready.

> Design system structure & components adapted from the supplied design template
> and re-skinned end-to-end to FORM's brand identity.

## Pages

| Page | File | What it is |
|------|------|------------|
| Home | `index.html` | Hero, four collections, the studies grid (filterable), method story, how-it-works, stats, reviews, newsletter |
| Archive | `shop.html` | Full Volume I catalog + filters, plus upcoming-volume placeholders |
| Study | `product.html` | Product detail with spec table, size/finish pickers, related studies |
| About | `about.html` | Brand story, principles, stats |

## The collection (Volume I)

Nine motorcycle studies, 1959–1980 — filterable by origin (Japanese / British /
Italian / German). Real artwork lives in `assets/art/machines/`:

`study-001-honda-cb750` · `002-triumph-t120` · `003-norton-commando` ·
`004-ducati-900ss` · `005-bmw-r80gs` · `006-yamaha-rd350` · `007-yamaha-xs650` ·
`009-suzuki-gt750` · `010-motoguzzi-lemans`

## The collection (Volume II — Automotive Design Icons)

Ten automotive studies, 1950–1987 — filterable by origin (German / British /
Italian / American / French). Artwork is 5:4 (the tiles use `.product-grid--auto`
so they render without cropping the labels):

`study-011-porsche-911` · `012-jaguar-etype` · `013-ferrari-f40` ·
`014-mercedes-300sl` · `015-ford-gt40` · `016-lamborghini-miura` ·
`017-ferrari-250gto` · `018-aston-db5` · `019-porsche-356` · `020-citroen-ds`

## The roadmap (Volumes III–VI — in development)

Four further volumes from the Collection Masterplan are scaffolded as
placeholder collections — each with **ten** planned entries and a branded
placeholder plate (`assets/art/placeholder-*.svg`), shown on the shop page
under **Roadmap**:

- **Volume III — Mechanical Anatomy** (Studies 021–030)
- **Volume IV — Blueprint Collection** (031–040)
- **Volume V — Workshop Collection** (041–050)
- **Volume VI — Industrial Icons** (051–060)

To make a volume live: drop the real 5:4/3:2 plates into `assets/art/machines/`,
swap the `.product-card--soon` cards for standard cards, and flip its collection
card from "Coming soon" to "Shop now".

## Design system

Tokens are CSS custom properties in `assets/css/form.css`:

- **Colors** — Ink `#17140F`, archive gold `#A9843C`, paper `#F3EEE3`, soft/​card paper tones, warm-black footer
- **Type** — `Archivo` (ultra-bold uppercase display) + `Inter` (body); widely-tracked uppercase archive labels
- **Shape** — landscape **3:2** print tiles, boxed wordmark, pill buttons
- **Motion** — restrained hover reveals, image scale, scroll progress bar

## Artwork & placeholders

Motorcycle studies are the real supplied art (`assets/art/machines/*.png`, 3:2).
Aviation, automotive, and architecture use **branded blueprint SVG placeholders**
(`assets/art/placeholder-*.svg`) until real art is available — swap those files
and flip the collection cards from "Coming soon" to a live grid.

To add a new study: drop the image in `assets/art/machines/`, then copy a
`.product-card` block and update the image, study number, title, spec, and price.

## Store, cart & checkout

The store is fully client-side and works today in **demo mode** (no backend
required). It upgrades to live payments + database by filling in one config file.

**Catalogue** — `assets/js/catalog.js` is the single source of truth: all 60
studies (19 live, 41 placeholder) with prices, specs, images and volume.

**Cart** — `assets/js/store.js` handles cart state (localStorage), the slide-in
cart drawer, add-to-cart (event-delegated on `[data-add-to-cart][data-id]`),
money formatting, the toast, and the checkout seam.

**Product pages** — `product.html?study=NNN` renders any study from the catalogue
(spec table, size/finish pickers with live pricing, related studies). Placeholder
studies show an "in development / notify me" state. Every product card links here.

**Pages** — home · shop · about · product · **cart** · **checkout** ·
**order-confirmation** · **search** · **account** · **help** · **shipping-returns**
· **size-guide** · **track-order** · **contact** · **sustainability** · **trade** ·
**privacy** · **terms**. All header/footer links resolve.

## Going live (Stripe + Supabase)

Nothing secret lives in this repo. To switch from demo to live:

1. **Supabase** — create a project and run `supabase/schema.sql` (orders,
   newsletter_signups, contact_messages). Copy the project URL + anon key into
   `assets/js/config.js`.
2. **Stripe Edge Function** — deploy the included function:
   ```bash
   supabase functions deploy create-checkout-session --no-verify-jwt
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set SITE_URL=https://your-domain SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=...
   ```
   Paste the function URL into `config.js -> checkoutEndpoint`.
3. **Stripe key** — add your `pk_live_…` (or `pk_test_…`) to
   `config.js -> stripePublishableKey`.

Once `checkoutEndpoint` + `stripePublishableKey` are set, checkout posts the cart
to the Edge Function, which creates a Stripe Checkout Session and redirects the
customer to pay; Stripe returns them to `order-confirmation.html`. Until then,
checkout records a local demo order so the whole flow is testable. Newsletter,
contact, and trade forms insert into Supabase when configured (else no-op).

> ⚠️ GitHub Pages is static and cannot run server code or hold secret keys — the
> Stripe secret lives only in the Supabase Edge Function. If you later want the
> whole site on one platform, Vercel/Netlify/Cloudflare can host both the static
> site and the serverless checkout endpoint.

## Run locally

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy

`.github/workflows/pages.yml` publishes to **GitHub Pages** on every push to
`main` (enable under Settings → Pages → Source → GitHub Actions). Also drop-in
ready for Netlify / Vercel / Cloudflare Pages — no build step.

## Structure

```
.
├── index.html · shop.html · product.html · about.html
├── assets/
│   ├── css/form.css      # design system + layout
│   ├── js/form.js        # cart count, filters, options, toast
│   └── art/
│       ├── machines/*.png   # Volume I motorcycle studies (real art)
│       ├── cat-*.svg        # branded blueprint placeholders (upcoming volumes)
│       └── favicon.svg
└── .github/workflows/pages.yml
```

## License

© FORM — The Engineering Archive. All rights reserved. Artwork and brand assets
are for this project's use.
