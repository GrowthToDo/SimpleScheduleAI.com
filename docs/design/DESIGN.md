# DESIGN.md — Clinical Calm (Direction 5)

Chosen by the founder 2026-07-09 from `docs/design/style-directions/preview.html`.
This file is the **visual law** for every page and post (see GOVERNANCE.md). A visual rule
never changes what a sentence says: copy stays bound by the positioning registry and dossiers.

## Idea

Healthcare-modern without the cliché. Misty neutrals, slate blue, sage, soft geometry.
Feels like a calm shift at 3 AM: quiet, legible, trustworthy. The serif carries the
character; the layout never shouts.

## Type (Fontshare, self-hosted variable woff2 in /public/fonts)

| Role | Family | Weights | Notes |
| --- | --- | --- | --- |
| Headings (h1-h3, display) | **Erode** (variable) | 500-620, default 600 | letter-spacing -0.01em, text-wrap balance |
| Body, UI, buttons | **Author** (variable) | 400/500/600 | the quiet workhorse; never Inter |
| Fallbacks | Georgia, serif / system-ui, sans-serif | | |

CSS variables: `--aw-font-heading: 'Erode-Variable'`, `--aw-font-sans: 'Author-Variable'`.

## Color tokens

| Token | Value | Replaces (old) | Use |
| --- | --- | --- | --- |
| ink / text | `#2A3138` (rgb 42 49 56) | `#1A2332` ink navy | headings, body, dark bands (Footer, DarkHero, CTA) |
| primary / accent | `#34495C` (rgb 52 73 92) | `#2D5A4A` forest green | buttons, links, active nav, logo tile |
| secondary (hover) | `#2A3B4C` (rgb 42 59 76) | `#234739` green hover | button hover |
| sage (support) | `#8FB3A3` (rgb 143 179 163) | `#7BAF9B` | dots, dark-surface accents, callout fill (16%) |
| soft sky | `#C9DAE3` | (new) | tertiary tint, illustration support |
| page bg | `#F2F5F5` mist | `#FAF7F2` warm ivory | page background, light text on dark bands |
| hairline | `rgb(42 49 56 / 12%)` | ink-navy 12% | borders, rules |

Rules: one accent (slate) carries the system; sage is support only; never introduce
new hues per-page. Dark bands use ink `#2A3138` with mist text at /85 and sage accents.

## Shape and surface

- Radius: cards/panels `rounded-2xl` (soft geometry is part of the direction); buttons `rounded-lg`.
- Borders: hairline over shadow. Shadows only for elevated mockup frames (existing recipe).
- Keep the paper-grain utility but at mist tone.

## Idioms

- **Eyebrow** (replaces pill chips, Phase 2.2): small-caps label preceded by a 26px
  hairline dash in accent, no background, no border-radius pill. Pattern:
  `<p class="eyebrow">` with `::before` rule-line, tracking 0.14em, uppercase, slate.
- **Callout / Our Take** (Phase 2.3): soft filled panel — sage at 16% fill,
  `rounded-2xl`, small-caps slate label, body text ink/85. No amber, no border-l-4,
  no icon.
- **CTA system**: unchanged two-style rule (btn-primary solid slate / btn-secondary
  quiet outline), one height, never two solids adjacent.
- **Active nav**: slate text + underline bar (already shipped), colors follow tokens.

## Imagery and illustration

Muted, palette-matched photography (mist/sage/slate range; avoid warm-orange stock).
Small illustrations: thin-line, single-weight strokes in slate with sage fills, no
gradients, no 3D. Product mockups keep the existing frame recipe with new tokens.

## Brand mark

The Route mark geometry is unchanged. Tile/accent colors move with the tokens:
favicon tile `#34495C`, route stroke mist `#F2F5F5`, dot sage `#8FB3A3`. Header mark
uses `currentColor` and adapts automatically.

## Out of scope for the token swap (tracked separately)

- Blog post in-body hardcoded classes (Phase 3, `redesign-plan-2026-07-07.md`).
- The standalone slide decks (`/slides`, `/proof-of-work/slides`) — presentation
  artifacts with their own palettes; do not restyle.
