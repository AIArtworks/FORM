# FORM — The Engineering Archive

**Hand-detailed studies of the machines and structures that shaped the modern
world — printed to order on museum-grade paper.**

FORM is a print-on-demand storefront for an engineering-art archive. It's a
fast, dependency-free static website — hand-built HTML, CSS, and vanilla JS —
using an archival design system: **warm paper, black draughtsman linework, and
an archive-gold accent**, with a boxed "FORM" wordmark (Archivo display + Inter
body).

Volumes I & II — the **motorcycle studies** and the **automotive design icons**
— are live. Aviation and architecture are scaffolded as upcoming volumes.

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

## Design system

Tokens are CSS custom properties in `assets/css/form.css`:

- **Colors** — Ink `#17140F`, archive gold `#A9843C`, paper `#F3EEE3`, soft/​card paper tones, warm-black footer
- **Type** — `Archivo` (ultra-bold uppercase display) + `Inter` (body); widely-tracked uppercase archive labels
- **Shape** — landscape **3:2** print tiles, boxed wordmark, pill buttons
- **Motion** — restrained hover reveals, image scale, scroll progress bar

## Artwork & placeholders

Motorcycle studies are the real supplied art (`assets/art/machines/*.png`, 3:2).
Aviation, automotive, and architecture use **branded blueprint SVG placeholders**
(`assets/art/cat-*.svg`) until real art is available — swap those files and flip
the category cards from "Coming soon" to a live grid.

To add a new study: drop the image in `assets/art/machines/`, then copy a
`.product-card` block and update the image, study number, title, spec, and price.

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
