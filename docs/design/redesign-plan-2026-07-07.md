# Site Redesign Plan — founder feedback of 2026-07-07

> **For agentic workers:** each task below is scoped for a Sonnet-class worker with the exact
> acceptance criteria written in. Do NOT spawn sub-agents. Ground-truth every change with
> `git diff` + the QA protocol at the bottom. Orchestrator: dispatch one worker per task,
> verify, then move on. Phase 0 blocks everything else; Phase 2 blocks Phase 3.

**Goal:** kill the "AI-generated" look (fonts, palette, eyebrow chips, callouts, wall-of-text),
fix the mechanical bugs (nav, mobile scroll, overflow), and restructure both home pages around
Problem-Agitate-Solution, without breaking positioning rules or SEO.

**Authorities that still bind every task:** `docs/seo/positioning-registry.md` (service vs
product columns, verbatim tokens), `docs/seo/facts-dossier.md` (product truths, pricing mode
split), `docs/seo/GOVERNANCE.md` (conflict order). A redesign changes HOW things look, never
WHAT is claimed.

---

## 0. Feedback register (verbatim triage)

| # | Feedback | Workstream | Phase |
|---|----------|-----------|-------|
| 1 | PAS section right after first fold, both home pages; better H1 on product | B Copy/structure | 2 |
| 2 | "Nurse scheduling software" badge on product hero wastes prime real estate | B | 2 |
| 3 | Top navbar misaligned, mixed font sizes | A Bugs | 1 |
| 4 | Fonts feel Claude-default; use fontshare.com | C Design system | 0+2 |
| 5 | Loading states / preloaded pages on link click | A | 1 |
| 6 | Mobile scrolling not smooth, feels delayed | A | 1 |
| 7 | Eyebrow chips ("Flat price. No per-nurse fees.") = AI tell | C | 2 |
| 8 | Color scheme = default Claude; pick relevant but different | C | 0+2 |
| 9 | Mobile text overflows boxes (contact page and others) | A | 1 |
| 10 | Home pages still wall-of-text; small illustrations help | B | 2 |
| 11 | Sans-serif header + same body everywhere = Claude default | C | 0+2 |
| 12 | Callout boxes look Claude-style | C | 2 |
| 13 | More CTAs? (founder asks for judgment) | B | 2 |
| 14 | Demo link on landing to nudge to interactive demo | B | 1 |
| 15 | Blog styling diverges from site; unify | C | 3 |
| 16 | Use styles.refero.design for design.md + tokens; 6 styles to pick from | C | 0 |

## 1. Root-cause notes (from code inspection, verify before fixing)

- **#3 nav fonts:** two suspects. (a) The `Resources` trigger is a `<button>` while siblings are
  `<a>`; it also gains `font-semibold` when a child page is active (added 2026-07-06), which
  reads as a size change. (b) In the mobile menu the dropdown children render inside
  `.dropdown-menu`, which may be inheriting `text-xl` from the parent `ul` (`text-xl xl:text-base`)
  while top-level items get their own `text-[0.95rem]` — and check whether any rule leaks
  `font-heading` into the mobile dropdown. Acceptance: computed font-family, size, and weight
  identical for every nav item in both desktop and mobile menus (except the active-page state,
  which is color+underline only — consider dropping `font-semibold` from active states since
  weight changes shift layout).
- **#6 mobile scroll jank:** the `data-reveal` IntersectionObserver system animates opacity/
  translate on scroll; on mid-range Android this reads as lag, and content appears "delayed"
  because it is hidden until the observer fires. Fix: disable reveal animations below `lg`
  (render everything visible, keep animations desktop-only) or reduce to opacity-only with a
  0.2s duration and rootMargin that pre-triggers well below the fold. Also audit the hero video
  (`preload="metadata"`, fine) and any `backdrop-blur` / large `box-shadow` on scroll paths.
- **#5 prefetch:** Astro ships `astro:prefetch`. Enable `prefetch: { prefetchAll: true,
  defaultStrategy: 'viewport' }` in `astro.config` (or per-link `data-astro-prefetch`) so pages
  are fetched before click. Optionally add `<ClientRouter />` (view transitions) for
  perceived-instant navigation — test it does not break Svelte islands (DemoScheduler,
  ROICalculator) before shipping; if it does, prefetch alone is the fix.
- **#9 overflow:** audit with the seo-visual agent at 360/390px on: /contact, /pricing, /roi,
  /about, /how-it-works, /product, /. Fix class: usually a fixed-width input, an unwrapped long
  string (email/URL), or `whitespace-nowrap` on labels. Acceptance: no element's bounding box
  exceeds viewport width on any of those pages at 360px.

## 2. Phases

### Phase 0 — Style decision (founder + Fable, TODAY)
1. Founder reviews `docs/design/style-directions/preview.html` (6 boards, open locally) and picks one.
2. Pull the closest refero DESIGN.md (styles.refero.design) for the picked direction, adapt it
   into `docs/design/DESIGN.md`: font stack (fontshare), full color tokens (light + dark-band
   variants), radius/shadow/border language, callout idiom, eyebrow replacement, button system
   (keep the two-style CTA rule), illustration style.
3. `docs/design/DESIGN.md` becomes the binding authority for all Phase 2-3 work; add it to
   GOVERNANCE.md's authority list (scripts > dossier > DESIGN.md > skill > checklist for
   visual matters).

### Phase 1 — Mechanical fixes (Sonnet workers, no style dependency, ship immediately)
- T1.1 Nav alignment/typography fix (#3) — see root-cause above. Files: `src/components/widgets/Header.astro`.
- T1.2 Prefetch (#5) — `astro.config.ts` + verify islands. Acceptance: clicking any nav link on a
  warm cache renders in <100ms perceived; `npm run build` + smoke pass.
- T1.3 Mobile reveal-animation fix (#6) — `src/assets/styles/tailwind.css` motion system +
  `MotionScripts.astro`. Acceptance: no content hidden on scroll at 390px; Lighthouse mobile
  TBT does not regress.
- T1.4 Mobile overflow sweep (#9) — seo-visual audit first, then per-page fixes. Acceptance
  criteria in root-cause note.
- T1.5 Demo nudge on landing (#14) — add a quiet "Try the interactive demo" text link (btn-secondary
  or inline link) in the hero under the primary CTA pair. Service-mode copy; "interactive demo"
  wording exactly. One-line change; do not add a third button style.

### Phase 2 — Design-system application (after style pick; Sonnet workers off DESIGN.md)
- T2.1 Token swap: fonts via fontshare CDN or @fontsource equivalents, CSS variables in
  `CustomStyles.astro`, tailwind.config mapping. The ENTIRE palette changes in one commit so
  pages never mix schemes. Dark-band components (Footer, DarkHero, CallToAction, hero video
  frame) get their token variants in the same pass.
- T2.2 Eyebrow system replacement (#7): kill the pill-chip pattern site-wide. Replacement per
  DESIGN.md (e.g., small-caps rule-line labels, numbered section markers, or nothing). Grep
  targets: `tracking-[0.18em]`, `rounded-full` label spans, `uppercase` kickers. Copy inside
  them stays registry-verbatim where it is a token.
- T2.3 Callout idiom replacement (#12): Our Take amber box, blue CTA boxes in blog posts, the
  border-l-4 pattern. New idiom from DESIGN.md. NOTE: the blog Our Take/CTA structure is
  checklist-governed — update `docs/seo/pre-publish-checklist.md` + reference posts in the same
  commit (see Doc changes).
- T2.4 PAS restructure (#1):
  - Service home: new section directly after hero: Problem ("Sunday night, the schedule is
    still not done...") → Agitate (callouts, fairness complaints, the manager's unpaid second
    job; use existing verified copy fragments from BuiltForCAHs/blog corpus, no new stats) →
    Solve (the triad, verbatim registry token) with the ServiceFlow widget absorbed as the
    Solve visual. Cut/merge SoftwareVsService if the page gets too long — PAS replaces its job.
  - Product home: same pattern, product-mode column. New H1 candidates (founder picks):
    a) "Your nurse schedule, built before you ask" b) "The schedule writes itself. You sign off."
    c) "Post-ready nurse schedules without the Sunday grind". H1 rule: outcome first, no
    feature list, under 10 words, no colon.
- T2.5 Product hero badge (#2): replace the static "Nurse scheduling software" chip with
  something that earns the slot, options in DESIGN.md idiom: (a) live micro-proof rotating
  line ("21 rule checks · 3 drafts per cycle · browser only"), (b) audience marker ("For
  25-bed hospitals"), or (c) delete and let the H1 breathe. Recommendation: (b) — audience
  qualification is the one thing a first-time visitor cannot infer in 2 seconds.
- T2.6 Wall-of-text pass (#10): each home-page section gets ONE visual anchor (existing widgets,
  schedule fragments, or small illustrations per DESIGN.md's illustration style). Budget: no
  section with more than ~80 words of unbroken prose on mobile. Reuse the /how-it-works
  illustration approach the founder likes.
- T2.7 CTA density (#13) — judgment answer: do NOT add more CTA banners; add exactly two
  mid-page inline CTAs (one after PAS, one after proof/flow section) as quiet text links, and
  keep the existing hero + end band. More banners on a trust-sale reads desperate; the fix for
  conversion is the PAS hook, not CTA count.

### Phase 3 — Blog conformance (#15) (Sonnet, mechanical, after Phase 2 ships)
- T3.1 Blog layout tokens: PostLayout/prose styles pick up DESIGN.md tokens (headings font,
  link color, table borders, blockquote). Single commit.
- T3.2 In-post hardcoded styles: grep posts for `bg-blue-50`, `bg-amber-50`, `border-blue-100`,
  hex colors etc. in raw HTML blocks (CTA boxes, Our Take, comparison tables) → replace with
  the new callout/CTA idiom via find-and-replace batches. ~50 posts; batch 10 per worker with
  per-batch diffs verified; NO copy changes, class-attribute-only diffs.
- T3.3 Update the canonical reference posts + checklist text so future posts are written in the
  new idiom from day one.

## 3. QA protocol (every phase)
1. `npx prettier --write` scoped to changed files; `npm run build`; `node scripts/smoke-routes.mjs`.
2. seo-visual agent pass at 360/390/1440 on every touched page: overflow scan (scrollWidth ==
   innerWidth), tap targets >= 44px, no hidden-until-scroll content on mobile, screenshot review.
3. Judgment page-review agent for any copy-bearing change (registry/dossier conformance).
4. Founder eyeball on localhost before any push; batch pushes per phase.

## 4. Doc/checklist changes
**Now:** this plan committed; GOVERNANCE.md gets a "visual authority" line pointing at
`docs/design/DESIGN.md` (placeholder until Phase 0 completes).
**At Phase 2.3 (same commit as the callout swap):** `docs/seo/pre-publish-checklist.md` — Our
Take/CTA visual spec updated to the new idiom; reference-post list re-pointed; `check-blog.mjs`
untouched (it checks structure/wording, not classes) — verify no class-based assertions exist.
**At Phase 3.3:** blog-post template `docs/seo/blog-post-template.mdx` restyled.

## 5. Open founder decisions
1. Pick 1 of the 6 style directions (preview board).
2. Product H1: pick from T2.4's three candidates (or edit).
3. Product hero badge replacement: option a/b/c in T2.5 (recommendation: b).
4. Approve the CTA answer in T2.7 (two quiet inline CTAs, no new banners).
