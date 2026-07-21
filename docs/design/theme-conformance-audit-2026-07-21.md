# Theme Conformance Audit — 2026-07-21

Three parallel audits (all site pages, all 120 posts + 3 articles, and the token/layout layer)
answering: **is everything following the same theme?** Report + plan only; no changes made.
Companion to `redesign-plan-2026-07-07.md` — that plan CHANGES the theme (Phase 0 style pick
still open); this audit measures consistency of the CURRENT theme and marks every fix as
**NOW** (survives any redesign) or **DEFER** (Phase 2/3 would redo it).

## A. What the theme officially is (as implemented)

- Palette: forest green `rgb(45 90 74)` primary · ink navy `#1A2332` · warm ivory `#FAF7F2`
  · sage accent `#7BAF9B` (NO token — magic hex) · hairline `ink/12%`
- Type: Fraunces Variable (headings, global h1-h3 rule + `font-heading`) · Inter Variable (body)
- Buttons: `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-tertiary` via `ui/Button.astro`
- Page hero: `DarkHero` widget · eyebrow: uppercase `tracking-[0.18em] text-primary`
- FAQ: `FAQs` accordion widget
- Blog idioms: blue CTA box (`bg-blue-50` + `bg-blue-600` button + cal.com text link),
  amber Our Take (`bg-amber-50 border-l-4 border-amber-500`), slate-bordered tables with
  `dark:` variants, hero images Unsplash (legacy) or branded `~/assets/.../heroes/*.webp` (new)
- Theme mode: **`light:only`** (config.yaml) — forced light, no dark rendering possible

## B. Findings

### B1. Structural / bugs
1. **Invalid class `bg-primary/10/40`** ×2 on `ai-nurse-scheduling.astro` (double opacity
   modifier — renders broken). Real bug.
2. **All `dark:` styling is dead code.** `light:only` short-circuits the theme script before
   any dark check; 155 `dark:` occurrences in widgets alone + hundreds across posts can never
   render. The standing blog rule "every table needs dark: variants" currently produces
   unreachable code. Needs a stance (see Decisions).
3. `layouts/MarkdownLayout.astro` is dead (unimported) and carries off-brand `blue-600` prose
   links; `SinglePost.astro` prose has `dark:prose-a:text-blue-400` (unreachable, off-brand).

### B2. Token layer (single-source-of-truth failures)
4. Palette defined twice: CSS vars (`--aw-color-*`) AND independent Tailwind hexes
   (`ink`, `ivory`). Editing one does not move the other.
5. Sage `#7BAF9B` and `#234739` used across ~20 widget files with no token at all.
6. "Secondary button on dark surface" re-implemented ad hoc **three ways** (Footer,
   CallToAction, DarkHero) with raw hex, instead of one shared class.
7. ~50 hardcoded brand-hex instances across widgets (Footer 14, DarkHero 7, CallToAction 5,
   CalloutDetail, QualityChecks, ScheduleStability, ComplianceRules, Logo, Favicons...).
   Values are on-palette (not a visual defect) but bypass the variables — every future
   palette change must find them all by grep.

### B3. Pages (25 + subdirs)
8. **Pillar sub-theme:** `critical-access-hospital-scheduling`, `nurse-scheduling-software`,
   `ai-nurse-scheduling` use `text-slate-*` everywhere instead of `text-default/muted` tokens
   (consistent with each other, inconsistent with the system). `rural-...-statistics` is closer
   to correct.
9. **Off-palette accents on pages:** product.astro demo chips (green/amber/gray),
   proof-of-work charts (blue/teal/amber/emerald), nurse-scheduling-software bar chart
   (orange/purple + `dark:bg-blue-700`), articles index `dark:hover:text-blue-700`,
   article back-link `dark:text-blue-400`.
10. **Bespoke outline button** `btn text-white border-white/30 hover:bg-white/10` on
    about/ask/proof-of-work/privacy/terms dark bands; bare `btn` (no variant) on 404 +
    pricing non-featured tier.
11. **Hand-rolled heroes/headers** (no DarkHero): index (deliberate — Jul-12 conversion
    redesign), contact, simulator, ask, proof-of-work. Contact/simulator/ask also skip
    `font-heading` and use `text-gray-900`-style non-token text classes.
12. **Legacy slide decks fully off-brand:** `slides.astro`, `slide1.astro`, `slide2.astro`,
    `slides-preview.astro` (self-labeled "temp — delete after picking"). Neon palettes,
    system fonts, no site Layout. All noindex. `proof-of-work/slides.astro` is the one
    on-brand deck (Fraunces + sage) — keep as the deck template.
13. resources/nurse-schedule-template: hand-built FAQ markup (not the FAQs widget) + the
    site's only `bg-blue-50` page band (blog-CTA idiom leaked onto a page).

### B4. Blog/articles (120 posts, 3 articles)
14. **CTA conformance: 97/120 canonical.** Deviants: 20 legacy posts with text-link-only CTAs
    (incl. all six `what-is-*`), 2 posts (`best-scheduling-software-er-nurses`, `-icu-nurses`)
    with light-only boxes + "Request a Demo"→/contact + no cal.com link + pre-FAQ placement,
    1 post (`shiftwizard-alternatives`) with `dark:bg-blue-950` variant. Zero double-button
    deviants remain (old defect fully retired).
15. **Our Take: 66/66 canonical amber.** 54 posts (mostly older/TOFU) have none — structural
    backlog, not drift.
16. **Tables: 9 posts violate the dark-variant rule** (list in agent output; all older
    best-of/comparison posts). ~40 others use valid-but-different dark class sets (idiom
    drift, readable either way). Moot unless dark mode ever ships — see Decision 1.
17. **Hero images: 111 Unsplash vs 9 branded.** Two visual generations of the blog with no
    migration plan. Articles: 3/3 Unsplash, otherwise fully canonical.
18. Off-palette hues (teal/purple/pink/indigo) in only 5 posts (crisis, after-hours,
    pricing, can-nurses-trust, buyer-guide). Zero inline `style=` colors anywhere.

## C. Founder decisions needed

1. **Dark mode stance.** (a) Commit to shipping dark eventually → keep the table rule, fix
   the 9 offenders + ER/ICU boxes + blog prose dark-link; or (b) stay light-only → retire
   the dark-table rule (stop writing new dark: code; leave existing harmless), delete the
   memory rule. Recommendation: **(b)** until the redesign's style pick decides otherwise —
   writing unreachable code as a gate requirement is pure cost.
2. **Delete the three off-brand slide decks + slides-preview?** All noindex scratch;
   slides-preview is self-labeled temp. Recommendation: delete all four, keep
   proof-of-work/slides.astro.
3. **Style-board pick (redesign Phase 0)** — still open since Jul 7 and it gates every
   recoloring decision below. The longer it stays open, the more work lands twice.
4. **Blog hero migration**: leave the 111 Unsplash heroes, or batch-migrate to branded
   heroes (gen-hero exists, ~2 min/post mechanical)? Recommendation: migrate opportunistically
   (whenever a post is edited), full batch only after Phase 0 (brand look may change).

## D. The plan

### Phase N — NOW (survives any redesign; mechanical; ~1 session)
- N1. Fix `bg-primary/10/40` bug (2 spots). [5 min]
- N2. Token unification: add `sage` + `green-deep` tokens; point Tailwind `ink`/`ivory` at
  the CSS vars; single source of truth. No visual change. [30 min]
- N3. One `.btn-secondary-dark` class; replace the 3 ad-hoc dark-band secondary buttons +
  bare-`btn` stragglers (404, pricing tier, ask, proof-of-work). No visual change intended. [45 min]
- N4. Pillar pages: `text-slate-*` → token classes, mechanical sweep, visually identical. [1 hr]
- N5. Delete dead `MarkdownLayout.astro`; fix `SinglePost` prose dark-link to primary (or
  strip per Decision 1). [10 min]
- N6. Delete slide decks per Decision 2. [10 min]
- N7. Blog CTA structure batch: upgrade the 20 legacy text-link posts to the canonical CTA box
  (current blue idiom — recolor happens in Phase 3 of redesign if style changes); normalize
  ER/ICU posts (canonical box, cal.com link, end placement) + shiftwizard variant. Copy rules:
  registry-verbatim, no new claims. [1 session, batched, diff-verified per batch]
- N8. Per Decision 1(b): retire dark-table rule in checklist + memory; else fix the 9 offenders.
- QA: prettier scoped, npm build, smoke-routes, seo-visual pass on touched pages, founder
  eyeball before push (per redesign-plan QA protocol).

### Phase D — DEFER to redesign (blocked on Phase 0 style pick)
- All recoloring: blog blue-CTA idiom, amber Our Take idiom, slate table borders, the 5
  off-palette-hue posts, product/proof-of-work chart palettes, resource-page blue band.
- Eyebrow system replacement (redesign T2.2), callout idiom (T2.3), hero-widget convergence
  for contact/simulator/ask (fold into T2.6 wall-of-text pass).
- Resource-page FAQ → FAQs widget (batch with T2.3 so it is restyled once).
- Blog hero full migration (Decision 4).
- SchedulerDemo.svelte mock-UI colors: leave — it is a product screenshot idiom, decide in
  Phase 2 whether to brand-tint it.

### Sequencing note
N-phase makes the future Phase 2 token swap STRICTLY easier (one variable file to edit
instead of ~50 grep targets). Nothing in N-phase paints anything the redesign would repaint —
except N7's CTA boxes, which reuse the existing blue idiom on purpose: structure now, color
later, so the 20 posts are not deviant twice.
