# Product Positioning + Website Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship (1) an unlisted `/product` page presenting the offering as software, (2) a landing page cut from 12 sections to 7 with the launch video in the hero, (3) `docs/seo/positioning-registry.md`, the service-mode/product-mode phrase registry that makes a future positioning migration deterministic. LOCAL ONLY: nothing is committed or pushed; the founder reviews localhost first.

**Architecture:** The registry (Task 1) is the single source for every positioning-bearing phrase, same pattern as `docs/seo/facts-dossier.md`; `/product` copy comes verbatim from its product-mode column, all live/new service content from its service-mode column. `/product` is a normal Astro page that is noindexed, sitemap-excluded, and absent from navigation. Landing widgets that are cut stay on disk; three of them move to `/how-it-works`.

**Tech Stack:** Astro static site (existing), Tailwind with house tokens (`bg-page`, `font-heading`, `text-muted`, `border-hairline`, `data-reveal`, `dark:` variants), zero new npm dependencies, existing verification scripts (`npm run build`, `npm run smoke`, `npm run check`).

**Spec:** `docs/superpowers/specs/2026-07-04-product-positioning-website-design.md` — follow it on any ambiguity.

## Global Constraints

1. **LOCAL ONLY. Zero `git commit`, zero `git push`, anywhere in this plan.** Every task ends with a local verification command instead of a commit. The founder approves localhost before anything is committed (separate, later instruction).
2. **Product-truths guardrails** (from `docs/seo/facts-dossier.md#product-truths`, they bind product-mode copy exactly as hard as service-mode copy):
   - Never claim the FLSA **8-and-80** calculation method. Say "FLSA overtime thresholds".
   - Never claim **credential/license-expiry tracking**.
   - Never claim or imply **customers, pilots, cohorts, or results**. SSAI is pre-launch. The free pilot offer is retired; never link `/pilot`.
   - Pricing is only ever: **$1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees.** Product-mode reframes the *label* ("flat facility license") but never the numbers.
3. **Copy rules for every string written in this plan's tasks:** no em-dashes (—) or en-dashes (–) anywhere, including HTML attributes and comments in copy files; none of the check-blog AI-tone phrases: `delve`, `dive into`, `it's worth noting`, `in conclusion`, `in summary`, `robust`, `leverage`, `game-changing`, `seamless`, `comprehensive solution`, `transformative`, `at the end of the day`, `unlock`, `harness`, `navigating`, `streamline`, `serves as`, `stands as`, `marks a`, `represents a`.
4. **House Tailwind idioms** for any new markup: `bg-page` sections, `font-heading` display headings, `data-reveal` / `data-reveal-group` scroll reveals, `text-muted` secondary text, `border-hairline` borders, and `dark:` variants on every light-background surface that hardcodes a color.
5. **/product privacy:** `metadata.robots = { index: false, follow: true }`, excluded from the sitemap filter in `astro.config.ts`, and **NOT added to `src/navigation.ts`** (do not touch that file at all).
6. **No widget file is deleted.** The landing cut removes imports and usages only; `ScheduleStability.astro` stays on disk unused (archived per spec).
7. **Positioning copy is registry-governed.** Task 5's page copy quotes Task 1's product-mode column verbatim. If an executor believes a phrase must change, the registry row changes first, then the page.
8. **Formatting:** run `npx prettier --write <file>` on each created/modified file at the end of its task (never repo-wide). This satisfies `npm run check`'s prettier pass without touching unrelated files.

## File Structure (created / modified)

```
docs/seo/positioning-registry.md          # CREATE  (Task 1)
public/videos/ssai-launch-landscape.mp4   # CREATE  (Task 2, binary copy)
src/pages/index.astro                     # MODIFY  (Task 2 video, Task 3 cut)
netlify.toml                              # MODIFY  (Task 2 headers)
src/pages/how-it-works.astro              # MODIFY  (Task 4)
src/components/widgets/QualityChecks.astro# MODIFY  (Task 4, one link href)
src/pages/product.astro                   # CREATE  (Task 5)
astro.config.ts                           # MODIFY  (Task 6)
```

---

### Task 1: Positioning registry (`docs/seo/positioning-registry.md`)

**Files:**

- Create: `docs/seo/positioning-registry.md`

This is the single source for every positioning-bearing phrase. Service-mode column = canonical today (verbatim quotes from the live site). Product-mode column = used by `/product` now and by everything after a future migration. GOVERNANCE.md conflict rule applies at dossier level: for the `pricing` row the facts dossier stays the ultimate authority on the numbers; this registry mirrors it and owns only the mode framing.

- [ ] **Step 1: Create the file with EXACTLY this content**

````markdown
# Positioning Registry: Service Mode to Product Mode

One source for every positioning-bearing phrase on the site and in the blog corpus.
Service mode is canonical today (all live pages, all new blogs). Product mode is used
by `/product` now, and by everything else only after the founder-approved migration.
Same authority level as the facts dossier for positioning phrases; GOVERNANCE.md
conflict rule applies (scripts > dossier > skill > checklist). The `pricing` row
mirrors `facts-dossier.md#product-truths`; on any drift, the facts dossier wins on
the numbers and this registry wins on the mode framing.

Hard guardrails that bind BOTH columns (facts-dossier.md#product-truths):
never the FLSA 8-and-80 method (say "FLSA overtime thresholds"); never
credential/license-expiry tracking; never customers, pilots, cohorts, or results;
pricing numbers only ever $1,000 / $1,500 flat, no per-nurse fees, no setup fees.
No em-dashes or en-dashes in either column. No check-blog AI-tone phrases.

## Mapping table

| Token | Service mode (canonical, verbatim on site today) | Product mode (for /product now; site-wide after migration) | Service source |
| --- | --- | --- | --- |
| `self-label` | An AI-native nurse scheduling service for Texas Critical Access Hospitals. | AI-native nurse scheduling software for Texas Critical Access Hospitals. | index.astro hero subtitle |
| `triad` | AI builds your schedule, our scheduling team checks it, you approve. No IT. | The AI builds your schedule, 21 automated rule checks validate every draft, you approve. No IT. | index.astro hero subtitle |
| `triad-long` | Our AI builds your schedule. Our scheduling team checks every draft. Your manager approves. | The AI builds your schedule. Built-in quality checks validate every draft. Your manager approves. | how-it-works.astro DarkHero subtitle |
| `onboarding` (= landing FAQ 1, "How long does it take to get started?") | Under two weeks. You send us your staff list and shift structure via Excel. We configure the rules, run a test cycle, and hand you a draft schedule for review. No IT involvement required. | Under two weeks. Load your staff list and shift structure from the Excel roster you already keep, set your rules once, and run a test cycle to review your first draft schedule. No IT involvement required. | index.astro FAQ + faqSchema |
| `delivery` | You get a PDF and Excel file by Thursday. That's it. | You export a post-ready PDF and a full Excel workbook every cycle, ready by Thursday. | index.astro FAQ 2 (second sentence) |
| `delivery-cadence` | Delivered every Thursday 3pm (or your chosen cadence). No more spreadsheet chaos. Just post and hand off. | Ready every Thursday 3pm (or your chosen cadence). No more spreadsheet chaos. Just post and hand off. | WeeklyPackage.astro subtitle |
| `callout` (= landing FAQ 5, "Who do we contact when there's a call-out at 2AM?") | Log the callout with us and the system generates the top 3 replacement candidates with reasons, checked by our scheduling team. You pick, we update the schedule and send the corrected copy. No phone tree, and we're reachable if something unusual comes up. | Log the callout and the system generates the top 3 replacement candidates with reasons: skills, role, charge coverage, overtime risk. You pick one, the schedule updates, and a corrected copy is ready to post. No phone tree. | index.astro FAQ + faqSchema |
| `pricing` | **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees. | **Cost:** Flat facility license by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees. | facts-dossier.md#product-truths (canonical) |
| `pricing-short` | $1,000 to $1,500 a month, by roster size. No IT setup. No per-nurse fees. | $1,000 to $1,500 a month per facility license, by roster size. No per-nurse fees, no setup fees. | index.astro CallToAction subtitle |
| `cta-primary` | Get your first schedule (href /contact) | Try the live demo (href /simulator) | index.astro Hero action |
| `cta-secondary` | Book a call with our team (href https://cal.com/gautham-8bdvdx/30min) | Book a call with our team (href https://cal.com/gautham-8bdvdx/30min). Identical in both modes. | index.astro Hero action |
| `faq-accounts` (landing FAQ 2, "Do my nurses need to create accounts or download anything?") | No. Your staff never touches the software. You get a PDF and Excel file by Thursday. That's it. | No. There is no nurse-facing app to roll out. The manager works in the schedule and exports a post-ready PDF and Excel file by Thursday. Staff see the posted schedule, nothing to download. | index.astro FAQ + faqSchema |
| `faq-existing-system` (landing FAQ 3, "What if we already have a scheduling system?") | We are built to replace spreadsheets or a basic tool that doesn't enforce rules. We don't replace your EMR. We deliver the schedule so you don't have to build it. | It replaces spreadsheets or a basic tool that does not enforce rules. It does not replace your EMR. It builds the schedule so you do not have to. | index.astro FAQ + faqSchema |
| `faq-unit-rules` (landing FAQ 4, "How do you handle our unit-specific rules?") | We configure them before your first cycle. Charge nurse requirements, skill mix ratios, on-call limits: all mapped to your unit. Changes take effect the next cycle. | You set them once during onboarding. Charge nurse requirements, skill mix ratios, on-call limits: all mapped to your unit. Rule changes take effect the next cycle. | index.astro FAQ + faqSchema |
| `team-reference` | checked by our scheduling team / our scheduling team checks it (any "our scheduling team" construction) | validated by the built-in quality checks (21 automated rules) | index.astro, how-it-works.astro, pricing.astro |
| `no-it` | No IT involvement required. / No IT Setup / No new software for your staff. | No IT project. Runs in the browser; nurses need no accounts. | index.astro eyebrow, how-it-works.astro |
| `value-prop` | You get a compliant, post-ready schedule every cycle, callout coverage handled. | A compliant, post-ready schedule every cycle, with callout coverage built in. | index.astro meta description |
| `weekly-inputs` | Send us PTO, known constraints, or ED spikes. We take the "messy" data and process it into a clean, logical draft. | Enter PTO, known constraints, and ED spikes. The engine turns messy inputs into a clean, logical draft. | WeeklyCadence.astro step 02 |

Notes on the five landing FAQ answers: they map to rows `onboarding`, `faq-accounts`,
`faq-existing-system`, `faq-unit-rules`, and `callout`. The FAQ questions themselves are
mode-neutral and identical in both modes, except FAQ 5 where product mode drops the
"Who do we contact" framing and asks: "What happens when there's a call-out at 2AM?"

## Authoring rules for new service-mode content (blogs and pages)

1. Any positioning-bearing claim (who builds, who checks, who delivers, what arrives,
   what it costs, how onboarding works) uses the service-mode column VERBATIM. Do not
   paraphrase a row; quote it.
2. No novel "we do X for you" constructions outside this table. If a new one is truly
   needed, add a row (with its product-mode equivalent authored at the same time)
   BEFORE using the phrase. A service-mode phrase without a product-mode twin is
   migration debt.
3. Keep positioning claims out of H2s/H3s, table headers, and image alt text wherever
   possible. Headings carry the topic ("Callout coverage at 2AM"), not the mode
   ("We cover your callouts"). This keeps the future migration a body-text swap and
   protects TOC anchors.
4. Blog FAQ answers that touch positioning quote a registry row verbatim, then may add
   post-specific detail AFTER the quoted sentence(s), never blended into them.
5. The `pricing` row is the facts-dossier canonical line; it is already enforced
   mechanically. Never restate pricing in any other shape.
6. Future enforcement (spec only, DO NOT build now): a check-blog WARN that flags
   "we build/check/deliver/configure/send" constructions in `src/data/post/*` that do
   not match a service-mode row, modeled on `scripts/lib/facts-rules.mjs`.

## Migration-day runbook (service mode to product mode, future founder decision)

Run only on an explicit founder go-ahead. Three passes, in order:

### Pass 1: deterministic swap (script, spec only today)

Build `scripts/lib/positioning-rules.mjs` modeled exactly on
`scripts/lib/facts-rules.mjs`:

- Export `POSITIONING_RULES`: one entry per registry row with `id` (the token),
  `trigger` (regex matching the service-mode phrase and near-verbatim drift of it),
  `replacement` (the product-mode column string), and `anchor`
  (`positioning-registry.md#mapping-table`).
- Export `checkPositioning(body)` returning `{line, id, text, anchor}` violations,
  honoring a `<!-- positioning-ok -->` line escape (mirrors `<!-- facts-ok -->`) for
  deliberate service-mode mentions (e.g. quoting the old positioning historically).
- Companion CLI `scripts/migrate-positioning.mjs`: `--dry-run` lists every match per
  file under `src/pages/` + `src/data/post/` + `src/data/article/`; `--write` applies
  exact-trigger replacements only; anything that triggers but is not an exact match is
  printed for the judgment pass, never auto-rewritten.
- Tests in `scripts/tests/positioning-rules.test.mjs` (node --test), one fixture per
  row, before any `--write` run.

### Pass 2: judgment list (hand review, never scripted)

1. Posts with "managed service" in the title or slug (e.g.
   `aladtec-vs-managed-service`): the service model IS the subject. Founder decides
   per post: retitle and reframe, keep as a category comparison written in third
   person, or retire with a 301.
2. Comparison content where service-vs-software is the argument itself: the
   `SoftwareVsService` widget and any software-vs-service blog posts. These need a
   rewrite or removal, not a token swap.
3. Schema: `/pricing` Service schema flips to SoftwareApplication; the homepage
   SoftwareApplication description and the how-it-works `featureList` get re-checked
   against the product-mode column.
4. `/product` flip to primary: remove `robots: { index: false }`, remove the
   `!page.includes('/product')` sitemap exclusion in `astro.config.ts`, add the page
   to `src/navigation.ts`, and decide the homepage and `/product` relationship (merge
   or coexist).
5. Self-label governance: update `facts-dossier.md#product-truths` self-label row and
   the check-blog "managed service" WARN in the same session, plus the maintenance
   logs of both dossiers.

### Pass 3: gates

`npm run check-blog -- --all` clean, `npm run check-links` clean,
`npm run build && npm run smoke` clean, then the standard judgment-only review pass
on every rewritten post before any draft flips.

## Maintenance log

| Date       | Change                                              | By     |
| ---------- | --------------------------------------------------- | ------ |
| 2026-07-04 | Initial registry: 18 rows, authoring rules, runbook | Claude |
````

- [ ] **Step 2: Prettier the file**

Run: `npx prettier --write docs/seo/positioning-registry.md`

- [ ] **Step 3: Verify (local only, no commit)**

Run this one-liner from the repo root:

`node -e "const t=require('fs').readFileSync('docs/seo/positioning-registry.md','utf8'); const rows=t.split(/\r?\n/).filter((l)=>l.startsWith('| `')).length; console.log('data rows:', rows); if(t.includes('—')||t.includes('–')){console.error('FAIL: em/en-dash found');process.exit(1);} if(/8[- ]and[- ]80/.test(t)){console.error('FAIL: 8-and-80 claim found');process.exit(1);} console.log('OK');"`

Expected output: `data rows: 18` then `OK`. Manual spot check: the `pricing` row matches `facts-dossier.md#product-truths` verbatim on the numbers ($1,000 / $1,500, no per-nurse fees, no setup fees).

---

### Task 2: Hero video on the landing page

**Files:**

- Create: `public/videos/ssai-launch-landscape.mp4` (binary copy, ~2.5 MB)
- Modify: `src/pages/index.astro` (Hero content slot)
- Modify: `netlify.toml` (cache header for `/videos/*`)

The 16:9 launch video renders inside the Hero content slot, above the existing eyebrow line. `autoplay muted loop playsinline preload="metadata"`, no poster (first frame arrives via preload; no ffmpeg locally). A tiny `is:inline` script stops the loop under `prefers-reduced-motion`. It must be `is:inline`: the Hero widget renders the content slot through `set:html`, so a processed (hoisted) script would be dropped.

- [ ] **Step 1: Copy the rendered video into public/**

PowerShell, from the repo root:

```powershell
New-Item -ItemType Directory -Force "public\videos"
Copy-Item "D:\Pradeep\Personal\Projects\ssai-launch-video\out\ssai-launch-landscape.mp4" "public\videos\ssai-launch-landscape.mp4"
```

- [ ] **Step 2: Insert the video block in `src/pages/index.astro`**

Exact edit (old -> new). Old string:

```astro
    <Fragment slot="content">
      <div class="mt-9 flex flex-col items-center gap-2.5 text-center reveal-delay-4" data-reveal>
```

New string:

```astro
    <Fragment slot="content">
      <div class="mx-auto mt-10 max-w-4xl reveal-delay-4" data-reveal>
        <div
          class="overflow-hidden rounded-2xl border border-hairline bg-[#1A2332] shadow-[0_14px_40px_-28px_rgb(26_35_50/0.35)]"
        >
          <video
            id="hero-launch-video"
            class="aspect-video w-full"
            src="/videos/ssai-launch-landscape.mp4"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-label="Product overview video: the AI fills a blank nurse schedule, validates 21 rules, and ranks callout replacements"
          ></video>
        </div>
      </div>
      <script is:inline>
        // Respect prefers-reduced-motion: stop the hero video's autoplay loop.
        (function () {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            var v = document.getElementById('hero-launch-video');
            if (v) {
              v.removeAttribute('autoplay');
              v.removeAttribute('loop');
              v.pause();
            }
          }
        })();
      </script>
      <div class="mt-9 flex flex-col items-center gap-2.5 text-center reveal-delay-4" data-reveal>
```

(The existing eyebrow div and interview line stay untouched below the inserted block.)

- [ ] **Step 3: Add the `/videos/*` cache header to `netlify.toml`**

Exact edit (old -> new). Old string:

```toml
[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

New string:

```toml
[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Self-hosted launch videos: long cache. If a video is ever re-rendered, rename the
# file (e.g. ssai-launch-landscape-v2.mp4) so the immutable cache busts.
[[headers]]
  for = "/videos/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

- [ ] **Step 4: Prettier the edited Astro file**

Run: `npx prettier --write src/pages/index.astro`

- [ ] **Step 5: Verify (local only, no commit)**

```powershell
if ((Get-Item "public\videos\ssai-launch-landscape.mp4").Length -gt 2000000) { "video OK" } else { "video MISSING/TRUNCATED" }
Select-String -Path "src\pages\index.astro" -Pattern "is:inline","hero-launch-video","playsinline" | Measure-Object | Select-Object Count
Select-String -Path "netlify.toml" -Pattern "/videos/\*"
```

Expected: `video OK`; Count >= 3; one netlify.toml match. Then `npm run dev` and confirm on http://localhost:4321 that the video autoplays muted, loops, and sits in a rounded 16:9 frame above the "Texas Critical Access Hospitals" eyebrow.

---

### Task 3: Landing page cut (12 sections to 7)

**Files:**

- Modify: `src/pages/index.astro`

Remove SchedulerDemoSection (already on /how-it-works), ScheduleStability (archived), QualityChecks, WeeklyCadence, CalloutDetail (all three move to /how-it-works in Task 4). Keep the widget files on disk. Resulting landing order: Hero (+video), SoftwareVsService, BuiltForCAHs, WeeklyPackage, FounderSection, FAQs, CallToAction.

- [ ] **Step 1: Trim the import block**

Exact edit (old -> new). Old string:

```astro
import Hero from '~/components/widgets/Hero.astro';
import HeroStationBackdrop from '~/components/widgets/HeroStationBackdrop.astro';
import SchedulerDemoSection from '~/components/widgets/SchedulerDemoSection.astro';
import SoftwareVsService from '~/components/widgets/SoftwareVsService.astro';
import BuiltForCAHs from '~/components/widgets/BuiltForCAHs.astro';
import ScheduleStability from '~/components/widgets/ScheduleStability.astro';
import WeeklyPackage from '~/components/widgets/WeeklyPackage.astro';
import QualityChecks from '~/components/widgets/QualityChecks.astro';
import WeeklyCadence from '~/components/widgets/WeeklyCadence.astro';
import CalloutDetail from '~/components/widgets/CalloutDetail.astro';
import FounderSection from '~/components/widgets/FounderSection.astro';
```

New string:

```astro
import Hero from '~/components/widgets/Hero.astro';
import HeroStationBackdrop from '~/components/widgets/HeroStationBackdrop.astro';
import SoftwareVsService from '~/components/widgets/SoftwareVsService.astro';
import BuiltForCAHs from '~/components/widgets/BuiltForCAHs.astro';
import WeeklyPackage from '~/components/widgets/WeeklyPackage.astro';
import FounderSection from '~/components/widgets/FounderSection.astro';
```

- [ ] **Step 2: Remove the SchedulerDemoSection usage**

Exact edit (old -> new). Old string:

```astro
  <!-- Scheduler Demo Widget (animated end-to-end demo + AI engine pitch) -->
  <SchedulerDemoSection />

  <!-- Software vs Service Comparison -->
```

New string:

```astro
  <!-- Software vs Service Comparison -->
```

- [ ] **Step 3: Remove ScheduleStability, QualityChecks, WeeklyCadence, CalloutDetail usages**

Exact edit (old -> new). Old string:

```astro
  <!-- Schedule Stability -->
  <ScheduleStability />

  <!-- Weekly Package -->
  <WeeklyPackage />

  <!-- Quality Checks -->
  <QualityChecks />

  <!-- Weekly Cadence -->
  <WeeklyCadence />

  <!-- Callout Detail -->
  <CalloutDetail />

  <!-- Founder Section -->
```

New string:

```astro
  <!-- Weekly Package -->
  <WeeklyPackage />

  <!-- Founder Section -->
```

- [ ] **Step 4: Prettier**

Run: `npx prettier --write src/pages/index.astro`

- [ ] **Step 5: Verify (local only, no commit)**

```powershell
Select-String -Path "src\pages\index.astro" -Pattern "SchedulerDemoSection|ScheduleStability|QualityChecks|WeeklyCadence|CalloutDetail" | Measure-Object | Select-Object Count
Test-Path "src\components\widgets\ScheduleStability.astro"
Test-Path "src\components\widgets\SchedulerDemoSection.astro"
```

Expected: Count = 0; both `Test-Path` = True (files kept on disk). Then on `npm run dev`, the landing page shows exactly 7 sections in order: Hero (with video), SoftwareVsService, BuiltForCAHs, WeeklyPackage, FounderSection, FAQs, CallToAction.

---

### Task 4: Move QualityChecks, WeeklyCadence, CalloutDetail to /how-it-works

**Files:**

- Modify: `src/pages/how-it-works.astro`
- Modify: `src/components/widgets/QualityChecks.astro` (one link href)

Placement decision (read from the current page flow: DarkHero, send/get section, SchedulerDemoSection, Steps, ComplianceRules, FAQs, CTA): **WeeklyCadence goes right after Steps** (Steps explains the four-step collaboration; WeeklyCadence zooms into the weekly rhythm once rules are locked). **QualityChecks goes right before ComplianceRules** (it introduces the "21 rules" number as a dark band; ComplianceRules then lists them). **CalloutDetail goes after ComplianceRules, before FAQs** (the exception path, right before the FAQ that mentions callouts). Final order: DarkHero, send/get, SchedulerDemoSection, Steps, WeeklyCadence, QualityChecks, ComplianceRules, CalloutDetail, FAQs, CTA.

One consequential detail: QualityChecks contains a "See every rule we check" link hardcoded to `/how-it-works`. On the landing page that was navigation; on /how-it-works itself it would be a self-link. After Task 3, /how-it-works is this widget's ONLY consumer, so the href changes to the `#compliance-rules` anchor and the ComplianceRules usage gets that id (its `WidgetWrapper` already accepts `id`).

- [ ] **Step 1: Add the three imports in `src/pages/how-it-works.astro`**

Exact edit (old -> new). Old string:

```astro
import Steps from '~/components/widgets/Steps.astro';
import ComplianceRules from '~/components/widgets/ComplianceRules.astro';
```

New string:

```astro
import Steps from '~/components/widgets/Steps.astro';
import WeeklyCadence from '~/components/widgets/WeeklyCadence.astro';
import QualityChecks from '~/components/widgets/QualityChecks.astro';
import ComplianceRules from '~/components/widgets/ComplianceRules.astro';
import CalloutDetail from '~/components/widgets/CalloutDetail.astro';
```

- [ ] **Step 2: Place the widgets in the page flow**

Exact edit (old -> new). Old string:

```astro
  <!-- 13 + 8 Rules Detail -->
  <ComplianceRules />

  <!-- FAQ -->
```

New string:

```astro
  <!-- Weekly cadence: how a week runs once the rules are locked -->
  <WeeklyCadence />

  <!-- 21 automated quality checks (dark band, leads into the full rule list) -->
  <QualityChecks />

  <!-- 13 + 8 Rules Detail -->
  <ComplianceRules id="compliance-rules" />

  <!-- Callout workflow detail (the exception path) -->
  <CalloutDetail />

  <!-- FAQ -->
```

- [ ] **Step 3: Re-point the QualityChecks internal link to the rules anchor**

In `src/components/widgets/QualityChecks.astro`, exact edit (old -> new). Old string:

```astro
      <a
        href="/how-it-works"
```

New string:

```astro
      <a
        href="#compliance-rules"
```

- [ ] **Step 4: Prettier**

Run: `npx prettier --write src/pages/how-it-works.astro src/components/widgets/QualityChecks.astro`

- [ ] **Step 5: Verify (local only, no commit)**

```powershell
Select-String -Path "src\pages\how-it-works.astro" -Pattern "WeeklyCadence|QualityChecks|CalloutDetail" | Measure-Object | Select-Object Count
Select-String -Path "src\pages\how-it-works.astro" -Pattern 'ComplianceRules id="compliance-rules"'
Select-String -Path "src\components\widgets\QualityChecks.astro" -Pattern 'href="#compliance-rules"'
```

Expected: Count = 6 (3 imports + 3 usages); one match each for the id and the anchor href. Then on `npm run dev`, http://localhost:4321/how-it-works shows the new order and clicking "See every rule we check" scrolls to the 21-rules section on the same page.

---

### Task 5: `/product` page (`src/pages/product.astro`)

**Files:**

- Create: `src/pages/product.astro`

The offering presented as shipping software. All positioning copy is the product-mode column of the Task 1 registry, verbatim. Unlisted: `robots: { index: false, follow: true }` (Task 6 adds the sitemap exclusion; navigation.ts is never touched). Exactly one h1 (DarkHero), one canonical, one meta description; the smoke gate checks all three on every built page. Schema mirrors the SoftwareApplication shape already on /how-it-works. Real capabilities only: no 8-and-80, no credential tracking, no customers or pilots.

- [ ] **Step 1: Create `src/pages/product.astro` with EXACTLY this content**

```astro
---
import Layout from '~/layouts/PageLayout.astro';
import SchemaOrg from '~/components/common/SchemaOrg.astro';
import DarkHero from '~/components/widgets/DarkHero.astro';
import SchedulerDemoSection from '~/components/widgets/SchedulerDemoSection.astro';
import FAQs from '~/components/widgets/FAQs.astro';
import CallToAction from '~/components/widgets/CallToAction.astro';
import { Icon } from 'astro-icon/components';

const metadata = {
  title: 'Product Tour | AI Nurse Scheduling Software',
  description:
    'AI-native nurse scheduling software for Texas Critical Access Hospitals: three schedule draft modes, 21 automated rule checks, callout replacement shortlists, PDF and Excel exports.',
  robots: { index: false, follow: true },
  canonical: 'https://simplescheduleai.com/product',
};

const ctaLink = 'https://cal.com/gautham-8bdvdx/30min';

const features = [
  {
    icon: 'tabler:sparkles',
    title: 'AI schedule generation',
    description:
      'Three draft modes per cycle: balanced, fairness-optimized, and cost-optimized. Pick the trade-off that fits your unit.',
  },
  {
    icon: 'tabler:scale',
    title: 'Fairness tracking',
    description:
      'Weekends, holidays, overtime, and charge duty distribution tracked automatically across the roster, so rotations stay defensible.',
  },
  {
    icon: 'tabler:clock-hour-4',
    title: 'FLSA overtime threshold tracking',
    description:
      'Scheduled hours are tracked against FLSA overtime thresholds as the grid fills, so overtime risk is flagged before the schedule posts.',
  },
  {
    icon: 'tabler:user-search',
    title: 'Callout replacement shortlist',
    description:
      'Log the callout and the system generates the top 3 replacement candidates with reasons: skills, role, charge coverage, overtime risk.',
  },
  {
    icon: 'tabler:file-export',
    title: 'PDF and Excel exports',
    description:
      'Export a post-ready PDF for the unit board and a full Excel workbook with the exceptions log and a complete audit trail.',
  },
  {
    icon: 'tabler:table-import',
    title: 'Excel onboarding, no IT',
    description:
      'Load your staff list and shift structure from the Excel roster you already keep. Set your rules once. No IT project.',
  },
];

const tiers = [
  {
    name: 'Core',
    price: '$1,000',
    roster: 'Up to 20 nurses',
    note: 'For single-unit Critical Access Hospitals.',
    featured: false,
  },
  {
    name: 'Plus',
    price: '$1,500',
    roster: '21 to 40 nurses',
    note: 'For larger or multi-unit rosters.',
    featured: true,
  },
];

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SimpleScheduleAI',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Healthcare Scheduling Software',
  operatingSystem: 'Web',
  url: 'https://simplescheduleai.com/product',
  description:
    'AI-native nurse scheduling software for critical access hospitals. Generates balanced, fairness-optimized, and cost-optimized schedule drafts, ranks callout replacements, tracks FLSA overtime thresholds, and exports post-ready PDF and Excel schedules.',
  audience: {
    '@type': 'Audience',
    audienceType: 'Nurse Managers, Directors of Nursing, CAH Administrators',
  },
  featureList: [
    'AI-generated nurse schedules',
    'Three draft options: balanced, fairness-optimized, cost-optimized',
    'Real-time callout replacement shortlist',
    'Excel roster upload',
    'Texas overtime compliance tracking',
    'Audit trail logging',
  ],
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '1000',
    highPrice: '1500',
    offerCount: '2',
    description: 'Flat monthly price per facility, by roster size',
  },
};
---

<Layout metadata={metadata}>
  <SchemaOrg slot="head" schema={[softwareAppSchema]} />

  <!-- Product hero -->
  <DarkHero
    badge="Product tour"
    title="The nurse schedule builds itself. You approve it."
    subtitle="AI-native nurse scheduling software for Texas Critical Access Hospitals. The AI builds your schedule, 21 automated rule checks validate every draft, you approve. No IT."
    actions={[
      { text: 'Try the live demo', href: '/simulator', variant: 'primary' },
      { text: 'Book a call with our team', href: ctaLink, variant: 'secondary' },
    ]}
  />

  <!-- Feature grid -->
  <section class="bg-page">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">What the software does</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Six capabilities, one weekly schedule
        </h2>
        <p class="mt-4 text-lg text-muted">
          Everything below runs in the product today. Watch the engine work in the live demo further down.
        </p>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
        {
          features.map((feature) => (
            <div class="rounded-2xl border border-hairline bg-white p-6 dark:bg-slate-800">
              <Icon name={feature.icon} class="h-6 w-6 text-primary" />
              <h3 class="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p class="mt-2 text-muted">{feature.description}</p>
            </div>
          ))
        }
      </div>
    </div>
  </section>

  <!-- Live demo (same engine as /simulator) -->
  <SchedulerDemoSection
    tagline="Live demo"
    title="Watch it fill a week."
    subtitle="The engine checks 13 safety rules and 8 fairness rules as it fills every slot, then ranks callout replacements the same way. The interactive demo runs in your browser, free, no signup."
    ctaText="Try the live demo"
    ctaHref="/simulator"
  />

  <!-- Pricing -->
  <section class="bg-page">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div class="max-w-2xl" data-reveal>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pricing</p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">One flat facility license</h2>
        <p class="mt-4 text-lg text-muted">
          Flat facility license by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No
          per-nurse fees, no setup fees.
        </p>
      </div>

      <div class="mt-10 grid gap-6 md:grid-cols-2" data-reveal-group>
        {
          tiers.map((tier) => (
            <div
              class={`rounded-2xl border p-8 ${tier.featured ? 'border-primary/50 bg-primary/5' : 'border-hairline bg-white dark:bg-slate-800'}`}
            >
              <h3 class="text-xl font-bold">{tier.name}</h3>
              <p class="mt-4 text-4xl font-bold">
                {tier.price}
                <span class="text-base font-medium text-muted">/month</span>
              </p>
              <p class="mt-1 text-sm font-medium text-primary">{tier.roster}</p>
              <p class="mt-2 text-sm text-muted">{tier.note}</p>
            </div>
          ))
        }
      </div>

      <p class="mt-6 text-center text-sm text-muted">
        Billed monthly, cancel anytime. If your roster size changes, your plan adjusts at the next billing cycle.
        Rosters above 40 nurses or multi-facility groups,
        <a href={ctaLink} class="text-primary underline">talk to us</a>.
      </p>
    </div>
  </section>

  <!-- FAQ -->
  <FAQs
    title="Questions about the product"
    tagline="Common questions"
    items={[
      {
        title: 'How long does it take to get started?',
        description:
          'Under two weeks. Load your staff list and shift structure from the Excel roster you already keep, set your rules once, and run a test cycle to review your first draft schedule. No IT involvement required.',
      },
      {
        title: 'Do my nurses need to create accounts or download anything?',
        description:
          'No. There is no nurse-facing app to roll out. The manager works in the schedule and exports a post-ready PDF and Excel file by Thursday. Staff see the posted schedule, nothing to download.',
      },
      {
        title: 'What if we already have a scheduling system?',
        description:
          'It replaces spreadsheets or a basic tool that does not enforce rules. It does not replace your EMR. It builds the schedule so you do not have to.',
      },
      {
        title: 'How do you handle our unit-specific rules?',
        description:
          'You set them once during onboarding. Charge nurse requirements, skill mix ratios, on-call limits: all mapped to your unit. Rule changes take effect the next cycle.',
      },
      {
        title: "What happens when there's a call-out at 2AM?",
        description:
          'Log the callout and the system generates the top 3 replacement candidates with reasons: skills, role, charge coverage, overtime risk. You pick one, the schedule updates, and a corrected copy is ready to post. No phone tree.',
      },
    ]}
  />

  <!-- Call to Action -->
  <CallToAction
    title="See the schedule build itself.<br/>Flat facility license."
    subtitle="$1,000 to $1,500 a month per facility license, by roster size. No per-nurse fees, no setup fees."
    tagline="Simple pricing"
    actions={[
      { variant: 'primary', text: 'Try the live demo', href: '/simulator' },
      { variant: 'secondary', text: 'Book a call with our team', href: ctaLink },
    ]}
  />
</Layout>
```

- [ ] **Step 2: Prettier**

Run: `npx prettier --write src/pages/product.astro`

- [ ] **Step 3: Verify (local only, no commit)**

```powershell
Select-String -Path "src\pages\product.astro" -Pattern "8-and-80|8 and 80|credential|pilot" | Measure-Object | Select-Object Count
Select-String -Path "src\pages\product.astro" -Pattern "index: false, follow: true"
Select-String -Path "src\navigation.ts" -Pattern "/product" | Measure-Object | Select-Object Count
```

Expected: first Count = 0 (no banned claims), one robots match, navigation Count = 0 (nav untouched). Then on `npm run dev`, http://localhost:4321/product renders: dark hero with both CTAs, 6-card feature grid, animated scheduler demo, pricing tiers, 5 FAQs, closing CTA. Full meta assertions (1 h1, 1 canonical, description) run in Task 7 via `npm run smoke`.

---

### Task 6: Sitemap exclusion for /product (`astro.config.ts`)

**Files:**

- Modify: `astro.config.ts`

Add the `/product` exclusion beside the existing `/simulator` exclusion in the sitemap filter. Note this excludes any URL containing the substring `/product`; no current or planned route collides (verified against `src/pages/` today), and the comment records the flip condition.

- [ ] **Step 1: Edit the sitemap filter**

Exact edit (old -> new). Old string:

```ts
        !page.includes('/ask') &&
        !page.includes('/simulator') &&
```

New string:

```ts
        !page.includes('/ask') &&
        !page.includes('/simulator') &&
        // Unlisted product-positioning page (noindex); remove this line together
        // with the robots noindex in product.astro when the founder flips the
        // positioning experiment live (see docs/seo/positioning-registry.md runbook).
        !page.includes('/product') &&
```

- [ ] **Step 2: Prettier**

Run: `npx prettier --write astro.config.ts`

- [ ] **Step 3: Verify (local only, no commit)**

```powershell
Select-String -Path "astro.config.ts" -Pattern "'/product'"
```

Expected: exactly one match inside the sitemap filter. Full sitemap content verification runs in Task 7 after a build.

---

### Task 7: Local verification suite (no commit, no push)

**Files:** none created or modified. This task only runs checks. Do NOT commit or push anything; the plan ends with the founder reviewing localhost.

- [ ] **Step 1: Full build**

Run: `npm run build`

Expected: build completes with no errors. Then:

```powershell
Test-Path "dist\product\index.html"
Test-Path "dist\videos\ssai-launch-landscape.mp4"
(Get-ChildItem -Recurse -Filter "index.html" dist | Measure-Object).Count
```

Expected: True, True, and **141** pages (the pre-change build emitted 140; /product is the only new route).

- [ ] **Step 2: Smoke gate**

Run: `npm run smoke`

Expected output: `smoke-routes: all pass`. This asserts /product has exactly 1 title, 1 canonical, a meta description, and exactly 1 h1, plus all key routes and redirect targets still exist.

- [ ] **Step 3: /product is noindexed but crawl-followable**

```powershell
Select-String -Path "dist\product\index.html" -Pattern 'noindex'
Select-String -Path "dist\product\index.html" -Pattern 'rel="canonical" href="https://simplescheduleai.com/product'
```

Expected: one robots meta match containing `noindex` (with `follow`), one canonical match.

- [ ] **Step 4: Sitemap excludes /product and keeps everything else**

```powershell
Select-String -Path "dist\sitemap*.xml" -Pattern '<loc>https://simplescheduleai.com/product' | Measure-Object | Select-Object Count
Select-String -Path "dist\sitemap*.xml" -Pattern '<loc>https://simplescheduleai.com/pricing' | Measure-Object | Select-Object Count
Select-String -Path "dist\sitemap*.xml" -Pattern '<loc>https://simplescheduleai.com/how-it-works' | Measure-Object | Select-Object Count
```

Expected: 0, then 1, then 1 (or more if trailing-slash variants; the /product count MUST be 0).

- [ ] **Step 5: Repo checks**

Run: `npm run check`

Expected: astro check, eslint, and prettier all pass (prettier was already run per-file in each task; if it flags a file this plan touched, run `npx prettier --write` on that file only).

- [ ] **Step 6: Manual localhost checklist for the founder**

Run `npm run dev`, review http://localhost:4321:

1. **Landing hero video:** autoplays muted, loops, rounded 16:9 frame above the eyebrow line; with DevTools emulation of `prefers-reduced-motion: reduce` and a hard reload, the video does not autoplay.
2. **Landing is about half its old length:** exactly 7 sections (Hero + video, SoftwareVsService, BuiltForCAHs, WeeklyPackage, FounderSection, FAQs, CallToAction); no scheduler animation, stability, quality-checks, cadence, or callout sections remain.
3. **/how-it-works:** WeeklyCadence appears after the 4-step process, QualityChecks (dark band) before the 21-rules list, CalloutDetail before the FAQ; "See every rule we check" scrolls in-page to the rules.
4. **/product renders end to end:** dark hero (H1 + 2 CTAs), 6 feature cards, live scheduler demo animation, pricing tiers, 5 FAQs, closing CTA; "Try the live demo" goes to /simulator; "Book a call with our team" goes to cal.com.
5. **Navigation unchanged:** header and footer contain no /product link anywhere.
6. **Dark mode:** toggle it; the /product feature cards and pricing tiers stay readable.

STOP after this checklist. Nothing is committed; the founder decides the next step.

---

## Task summary

| # | Task | Output |
| --- | --- | --- |
| 1 | Positioning registry | `docs/seo/positioning-registry.md`: 18-row service/product mapping, authoring rules, migration runbook |
| 2 | Hero video | Video copied to `public/videos/`, rendered in the Hero content slot, `/videos/*` cache header |
| 3 | Landing cut | index.astro trimmed from 12 sections to 7; widget files kept on disk |
| 4 | How-it-works additions | WeeklyCadence, QualityChecks, CalloutDetail placed; rules anchor wired |
| 5 | /product page | Complete `src/pages/product.astro` in product-mode registry copy, noindexed |
| 6 | Sitemap filter | `/product` excluded in astro.config.ts |
| 7 | Verification | build (141 pages), smoke, sitemap assertions, `npm run check`, founder checklist |
