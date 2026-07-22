# DESIGN.md — SimpleScheduleAI Visual Authority

**Status: BINDING** (founder decision 2026-07-21: the current theme IS the style pick —
redesign-plan Phase 0 closed with "current theme, formalized"). For visual matters the
authority order is: scripts > dossier > **DESIGN.md** > skill > checklist (GOVERNANCE.md).
A visual change conforms to this file or updates this file in the same commit.

## 1. Tokens (single source of truth)

Defined in `src/components/CustomStyles.astro`; Tailwind maps them in `tailwind.config.js`.
Never hardcode these hues — use the utility/token. Arbitrary-value `[#hex]` classes for
brand hues are banned (swept to zero 2026-07-21; keep it that way).

| Token | Value | Usage |
|---|---|---|
| `primary` | rgb(45 90 74) forest green | Buttons, links, accents, eyebrows |
| `secondary` | rgb(35 71 57) | Primary-button hover |
| `ink` | #1A2332 navy | Headings/body text, dark bands/canvas |
| `ivory` | #FAF7F2 warm ivory | Page background, text on dark bands |
| `sage` | #7BAF9B light green | Badges, dots, quiet accents (never body text on ivory) |
| `green-deep` | #234739 | Secondary green where primary is too light |
| `default` / `muted` | ink / ink-64% | Body text / secondary text |
| `hairline` | ink-12% | Borders (`border-hairline` utility) |
| Amber accent | #d9a441 (decks) / amber-50..500 (Our Take) | The single warm accent |

Theme mode: **light only** (`config.yaml ui.theme: 'light:only'`). `dark:` classes are
unreachable; never required (check-blog WARNs only). Existing dark: code may remain.

## 2. Type

- **Fraunces Variable** = display: h1-h3 global rule + `font-heading`. Weights 600/900.
- **Inter Variable** = body/UI. Loaded once via @fontsource in CustomStyles.astro.
- Standalone artifacts (decks, generated heroes, xlsx masthead) load Fraunces/Inter
  independently and must use the same pairing.

## 3. Components and idioms

- **Buttons:** `.btn-primary` (filled green) / `.btn-secondary` (outline) /
  `.btn-secondary-dark` (outline on dark bands) / `.btn-tertiary`. No other button styles;
  no raw-styled `<a>` buttons.
- **Page hero:** `DarkHero` widget (ink band, sage badge chip, ivory Fraunces H1).
  Homepage's custom `Hero` + station backdrop is a sanctioned exception (conversion
  redesign 2026-07-12).
- **Eyebrow:** uppercase `tracking-[0.18em] text-primary` (tracking-widest tolerated).
- **FAQ:** `FAQs` accordion widget on pages. (Resource pages with bespoke FAQ markup:
  converge opportunistically.)
- **Dark bands** (Footer, CallToAction, DarkHero, deck canvas): bg-ink, ivory text,
  sage accents, `.btn-secondary-dark`.
- **Decks** (`slides*.astro`, `proof-of-work/slides`): ink canvas #1A2332 (panel
  #141b28-#1c2636 ramp), sage + forest accents, amber #d9a441 highlight, Fraunces
  display. Never blue/violet/neon/pink.

## 4. Blog/article in-post idioms (checklist-governed)

- **CTA box:** exactly one per post: `not-prose my-12 rounded-xl bg-primary/5 border
  border-primary/20 px-8 py-10 text-center` box, `text-default` headline, `text-muted`
  subtext, one `bg-primary hover:bg-secondary` button -> /how-it-works, and a `text-primary`
  cal.com text link under it. (Recolored blue -> brand green site-wide 2026-07-22; the gate
  counts CTA boxes by `rounded-xl bg-primary/5`.) The mid-post free-template callout uses the
  same brand tint at `my-8 rounded-lg`.
- **Our Take:** amber `bg-amber-50 border-l-4 border-amber-500`, immediately before
  What-to-Do.
- **Tables:** slate borders (`border-slate-300`); dark: variants optional (light-only).
- **Visuals:** Tailwind div/table constructs; brand hues via `bg-[#1A2332]`-class tokens
  in .md content are tolerated (Tailwind tokens unavailable in md HTML at authoring
  time = use the hex-matching classes already in the corpus); avoid teal/purple/pink/
  indigo entirely.
- **Heroes:** free Unsplash photos preferred when a relevant one exists; branded
  generated heroes (`scripts/gen-hero.mjs`, 110px side safe-zone) are the fallback
  (pool exhausted 2026-07). Both are sanctioned.

## 5. Do not

- No new hex literals for brand hues in class attributes (use tokens).
- No new button variants; no third CTA style.
- No dark:-required rules; no dark-mode work without a founder decision to re-enable.
- No blue/violet/neon accents anywhere; semantic status colors (red/green/amber chips
  in product-demo mockups) are allowed but never as brand chrome.
- SVG brand marks keep literal hex (fill attrs can't use Tailwind) — Route mark colors:
  ink stroke, sage dot, primary #2D5A4A on light.

## 6. Reference implementations

Page: `src/pages/pricing.astro` · Widget band: `Footer.astro` · Deck:
`src/pages/proof-of-work/slides.astro` · Post idioms: `free-nurse-schedule-templates.md`
· Conformance state + deferred recolor list: `theme-conformance-audit-2026-07-21.md`.
