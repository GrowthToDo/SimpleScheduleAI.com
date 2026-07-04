# Product Positioning + Website Restructure — Design Spec

Date: 2026-07-04
Status: Founder-approved design (verbal, this session). LOCAL-ONLY implementation first; commit/push only on founder review of localhost.

## Goals

1. `/product` page: the offering presented as software ("if we had a product, how would it look"), unlisted, usable in conversations day one, flippable to a live positioning experiment later.
2. Landing page cut from 12 sections to 7, with the 16:9 launch video in the hero.
3. A positioning-token registry making a future service→product migration (blogs + pages) deterministic, and keeping all NEW service-mode content migration-ready.

## Architecture: positioning-token registry (Approach A)

`docs/seo/positioning-registry.md` = single source for every positioning-bearing phrase: service-mode column (canonical, used by all live content and new blogs) ↔ product-mode column (used by /product now, by everything after migration). Same pattern as the facts dossier. GOVERNANCE.md conflict rule applies; registry sits at dossier level for positioning phrases.

## Part 1 — /product page

- `src/pages/product.astro` → `/product`. NOT in navigation. `metadata.robots = {index:false, follow:true}` + excluded in astro.config sitemap filter (alongside /simulator's existing exclusion).
- Phase 2 (explicit founder decision later): remove noindex + sitemap exclusion to run the positioning experiment.
- Copy: product-mode column of the registry. Written as shipping software: AI schedule generation (3 draft modes), fairness tracking, FLSA threshold tracking, callout replacement shortlist, PDF/Excel exports, guided Excel onboarding, audit trail. The human scheduling-team layer is reframed as built-in quality checks.
- Visual proof: links/embeds of the existing simulator (/simulator) and SchedulerDemoSection animation — real artifacts only.
- Hard guardrails: product-truths from facts-dossier still bind (no 8-and-80 claim, no credential tracking, no customers/pilots, real pricing $1,000/$1,500 reframed as facility license). Page carries the same SoftwareApplication schema shape as /how-it-works.
- Sections: product hero → feature grid (6) → live-demo section → pricing → product-mode FAQ (5, mapped in registry) → CTA.

## Part 2 — Landing page (12 → 7) + hero video

Keep: Hero (+video), SoftwareVsService, BuiltForCAHs, WeeklyPackage, FounderSection, FAQs, CallToAction.
Cut: SchedulerDemoSection (already on /how-it-works), ScheduleStability (archived, component kept unused), QualityChecks / WeeklyCadence / CalloutDetail (MOVED to /how-it-works, their natural home).

Video: `public/videos/ssai-launch-landscape.mp4` (2.5MB, self-hosted). Rendered inside the Hero content slot above the tagline: rounded 16:9 frame, `autoplay muted loop playsinline preload="metadata"`, `aria-label`, paused via small inline script under `prefers-reduced-motion`. netlify.toml: long-cache header for `/videos/*`. No poster (no ffmpeg locally; first frame via preload).

## Part 3 — Positioning registry + migration playbook

`docs/seo/positioning-registry.md`:
1. Mapping table (service ↔ product) for: self-label, the build/check/approve triad, onboarding language, delivery language, callout language, pricing line, CTA texts, FAQ answers, team references.
2. Authoring rules for new service-mode blogs: registry phrases verbatim; no novel "we do X for you" constructions; positioning claims out of H2s/alt text where possible; model-FAQ answers quote registry lines. (Future: check-blog WARN for off-registry positioning phrasing — spec'd only.)
3. Migration-day runbook: deterministic registry-driven swap pass (script spec, facts-rules architecture) → judgment list (managed-service-vs titles, comparison posts where the service model IS the argument, schema updates, /product flip to primary) → gates (check-blog corpus, smoke, dossier product-truths update).

## Out of scope

Executing any migration; building the migration script; indexing /product; deleting archived widget components.

## Verification (local)

`npm run build` + `npm run smoke` (new /product page must pass meta checks; sitemap must NOT contain /product) + `npm run check` + Playwright/manual localhost review by founder. Zero commits until founder approves localhost.
