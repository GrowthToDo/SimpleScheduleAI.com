# Positioning Registry: Service Mode to Product Mode

One source for every positioning-bearing phrase on the site and in the blog corpus.
Service mode is canonical today (all live pages, all new blogs). Product mode is used
by `/product` now, and by everything else only after the founder-approved migration.
Same authority level as the facts dossier for positioning phrases; GOVERNANCE.md
conflict rule applies (scripts > dossier > skill > checklist). The `pricing` row
mirrors `facts-dossier.md#product-truths`; on any drift, the facts dossier wins on
the numbers and this registry wins on the mode framing.

Hard guardrails that bind BOTH columns (facts-dossier.md#product-truths):
never the FLSA calculation method (say "FLSA overtime thresholds"); never
credential/license-expiry tracking; never customers, pilots, cohorts, or results;
pricing numbers SPLIT BY MODE (founder 2026-07-06): SERVICE = $1,000 / $1,500 flat
monthly by roster size, no per-nurse fees, no setup fees. PRODUCT = $10 per user
per month or $100 per user per year, no setup fees; NEVER "no per-nurse fees" in
product mode (product pricing IS per-user). Never mix the two models in one page.
No em-dashes or en-dashes in either column. No check-blog AI-tone phrases.

## Mapping table

| Token | Service mode (canonical, verbatim on site today) | Product mode (for /product now; site-wide after migration) | Service source |
| --- | --- | --- | --- |
| `self-label` | An AI-native nurse scheduling service for Texas Critical Access Hospitals. | AI-native nurse scheduling software for Texas Critical Access Hospitals. | index.astro hero subtitle |
| `triad` | AI builds your schedule, our scheduling team checks it, you approve. No IT. | The AI builds your schedule, 21 automated rule checks validate every draft, you approve. Runs in the browser, no installation, no IT department required. | index.astro hero subtitle |
| `triad-long` | Our AI builds your schedule. Our scheduling team checks every draft. Your manager approves. | The AI builds your schedule. Built-in quality checks validate every draft. Your manager approves. | how-it-works.astro DarkHero subtitle |
| `onboarding` (= landing FAQ 1, "How long does it take to get started?") | Under two weeks. You send us your staff list and shift structure via Excel. We configure the rules, run a test cycle, and hand you a draft schedule for review. No IT involvement required. | About four weeks, every step accounted for: staff Excel in, workspace set up, roster imported, units and rules configured in a guided setup session, DON trained, go live. No installation, no integration project. (Superseded 2026-07-05 by facts-dossier#product-truths setup-timeline; old "Under two weeks" product cell was STALE, never reuse.) | index.astro FAQ + faqSchema (service); product.astro FAQ 1 (product) |
| `delivery` | You get a PDF and Excel file by Thursday. That's it. | You export a post-ready PDF and a full Excel workbook every cycle, ready by Thursday. | index.astro FAQ 2 (second sentence) |
| `delivery-cadence` | Every Thursday: a post-ready schedule, scored options, and the audit trail. Delivered at 3pm (or your chosen cadence). Just post and hand off. | Ready every Thursday 3pm (or your chosen cadence). No more spreadsheet chaos. Just post and hand off. | WeeklyPackage.astro title + subtitle (service copy updated 2026-07-12, landing redesign) |
| `callout` (= landing FAQ 5, "Who do we contact when there's a call-out at 2AM?") | Log the callout with us and the system generates the top 3 replacement candidates with reasons, checked by our scheduling team. You pick, we update the schedule and send the corrected copy. No phone tree, and we're reachable if something unusual comes up. | Log the callout and the system ranks the top 3 replacement candidates with reasons: skills, role, charge coverage, overtime risk. You pick one and reach out to that nurse; once they accept, you record it and a corrected copy is ready to post. (Updated 2026-07-12 to match facts-dossier#product-truths callout-contact split: the manager contacts the nurse; the schedule does NOT auto-update.) | index.astro FAQ + faqSchema (service); product.astro FAQ 3 (product) |
| `pricing` | **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees. | **Cost:** $10 per user per month, or $100 per user per year. Every nurse and manager on the roster is a user. No setup fees. | facts-dossier.md#product-truths (canonical) |
| `pricing-short` | $1,000 to $1,500 a month, by roster size. No IT setup. No per-nurse fees. | $10 per user per month, or $100 per user per year. No setup fees. | index.astro CallToAction subtitle |
| `cta-primary` | Get your first schedule (href /contact) | Try the interactive demo (href /simulator) | index.astro Hero action |
| `cta-secondary` | Book a call with our team (href https://cal.com/gautham-8bdvdx/30min) | Book a call with our team (href https://cal.com/gautham-8bdvdx/30min). Identical in both modes. | index.astro Hero action |
| `faq-accounts` (landing FAQ 2, "Do my nurses need to create accounts or download anything?") | No. Your staff never touches the software. You get a PDF and Excel file by Thursday. That's it. | No. There is no nurse-facing app to roll out. The manager works in the schedule and exports a post-ready PDF and Excel file by Thursday. Staff see the posted schedule, nothing to download. | index.astro FAQ + faqSchema |
| `faq-existing-system` (landing FAQ 3, "What if we already have a scheduling system?") | We are built to replace spreadsheets or a basic tool that doesn't enforce rules. We don't replace your EMR. We deliver the schedule so you don't have to build it. | It replaces spreadsheets or a basic tool that does not enforce rules. It does not replace your EMR. It builds the schedule so you do not have to. | index.astro FAQ + faqSchema |
| `faq-unit-rules` (landing FAQ 4, "How do you handle our unit-specific rules?") | We configure them before your first cycle. Charge nurse requirements, skill mix ratios, on-call limits: all mapped to your unit. Changes take effect the next cycle. | You set them once during onboarding. Charge nurse requirements, skill mix ratios, on-call limits: all mapped to your unit. Rule changes take effect the next cycle. | index.astro FAQ + faqSchema |
| `team-reference` | checked by our scheduling team / our scheduling team checks it (any "our scheduling team" construction) | validated by the built-in quality checks (21 automated rules) | index.astro, how-it-works.astro, pricing.astro |
| `escalation` (added 2026-07-12, founder commitments) | Named contact = Pradeep, co-founder; direct number shared at onboarding, NEVER published on a page. Coverage-blocking issues (uncovered shift, schedule cannot post): response within 1 hour in business hours, 3 hours after hours (softened from any-hour 2026-07-13 to avoid a single-point-of-failure 24/7 SLA). Everything else: same business day. Wrong draft: corrected copy the same day. Trust line: "If something slips on our side, you hear it from us first." | "Our support team stays a call away." NO 1-hour or any-hour commitments in product mode; the written protocol is a service-mode differentiator. | EscalationPromise.astro (how-it-works), pricing.astro reference line |
| `retainer-itemization` (added 2026-07-12) | Four groups on /pricing "What the month buys": The cycle runs / Someone is accountable / Changes are included / The paper trail. Rule changes are INCLUDED and uncapped ("applied for the next cycle"), consistent with faq-unit-rules. Manager summary = what-we-did ledger: drafts built, callouts covered, changes applied. | n/a (product pricing is per-user, no retainer framing) | pricing.astro monthBuys |
| `product-to-service-upgrade` (added 2026-07-12) | n/a | Rather have all of it done for you? That's the service. (links /how-it-works; placed after the guided-setup section; the ONLY sanctioned cross-mode link on /product) | product.astro |
| `no-it` | No IT involvement required. / No IT Setup / No new software for your staff. | No installation, no integration project, no IT department required. Runs in the browser; nurses need no accounts. Founder rules (2026-07-04): in product mode NEVER use the bald service-style claim 'No IT.'; always name what is absent (installation/integration/IT department). AND never claim the manager configures rules solo: setup is 'guided setup session' (vendor maps unit rules with the manager, once); only the ONGOING weekly cycle is manager-alone. Claiming solo rule-configuration contradicts our own anti-UKG/QGenda thesis that CAH managers cannot absorb configuration burden. | index.astro eyebrow, how-it-works.astro |
| `delivery-model-binary` | a managed service, not software the hospital runs itself | guided-setup software, not a self-configured platform the hospital integrates alone | THE most frequent migration conversion (dry-run 2026-07-04: needed 8+ times across 3 posts); use this exact pair, do not re-derive |
| `guided-setup` | We configure your rules before your first cycle. | A guided setup session maps your unit rules with you, once. | CANONICAL STRING: always exactly 'guided setup session' (not 'guided onboarding session'/'one guided session'); load-bearing for the no-it founder rule |
| `shortlist-reasons` | ranked by skill match, competency for the unit, charge coverage, and overtime risk | the engine ranks by skill match, unit competency, charge coverage, and overtime risk | ADDED 2026-08-12 after a corpus sweep found SSAI claiming credential matching/filtering/enforcement in 51 places across 23 live files, including one live post asserting "Credential expiration dates are tracked against each nurse's profile". Inventory §4.6/§6.5: `staff.certifications` is a `string[]` with NO expiry dates and **is not consulted by any rule**; competency is a separate 1-5 integer WITH a hard rule (icu-competency) and a skill-mix soft rule. So: **NEVER** credential match / credential-filtered / credential enforcement / credential tracking / credential expiration in OUR voice. **ALWAYS** skill match, unit competency, charge-qualified, role. Competitor descriptions and statements of what a hospital NEEDS may keep the word "credential" — the ban is scoped to our own claims. |
| `fairness-record` | we can send you that record on request | you can export the per-nurse weekend and holiday distribution yourself | ADDED 2026-08-11 after the runbook step was written (`docs/ops/service-runbook.md` R1: DON or nurse manager emails, we send per-nurse night/weekend/holiday counts as PDF or spreadsheet, 1 business day, our scheduling team). Service form is BOUNDED to "on request" — never widen to "whenever you need it" / "any time", which reintroduces the 24/7 SLA shape the `escalation` row was deliberately softened to avoid. Product form is self-serve export, never "we send". |
| `system-maintains` | our scheduling team maintains the [per-diem bench / availability list / roster] and keeps it current | the software maintains the [artifact] and keeps it current | NEVER attribute roster/list maintenance to '21 automated rule checks' (those validate drafts only); generic software subject is the honest product form (round-2 Major finding) |
| `setup-timeline` | Onboarding takes 3 to 5 business days. First schedule inside two weeks. | Setup takes about four weeks from roster upload to your first live schedule: a guided setup session maps your unit rules, then test cycles verify them before you go live. | FOUNDER RULE 2026-07-05: never carry service timelines into product mode. FOUNDER RULE 2026-08-10: the service pair is exactly TWO numbers and they are not interchangeable — **onboarding = 3 to 5 business days**, **first schedule = inside two weeks**. Any claim that the schedule itself lands in 48 hours, or "in days", or "3 to 5 days", is WRONG (it collapses the onboarding number onto the delivery number); swept out of 40 files on 2026-08-10 and gated in `check-blog.mjs`. Per-cycle DRAFT turnaround claims are separate from setup claims and must be clearly steady-state |
| `value-prop` | You get a compliant, post-ready schedule every cycle, callout coverage handled. | A compliant, post-ready schedule every cycle, with callout coverage built in. | index.astro meta description |
| `weekly-inputs` | Send us PTO, known constraints, or ED spikes. We take the "messy" data and process it into a clean, logical draft. | Enter PTO, known constraints, and ED spikes. The engine turns messy inputs into a clean, logical draft. | WeeklyCadence.astro step 02 |

Maintenance log addition 2026-08-11: added the `fairness-record` row, the first row created by the written-routine route rather than from existing copy. Sequence was runbook step first (`docs/ops/service-runbook.md` R1, founder-confirmed same day), then the registry row with its product-mode twin, then the wording became publishable. A pre-publish review had blocked the claim in `cyclical-scheduling-vs-self-scheduling-small-hospital.md` precisely because the runbook step did not exist yet; that is the intended order and worth repeating for the next unwritten routine (low census is the open one).

Maintenance log addition 2026-07-13: added `escalation`, `retainer-itemization`, and `product-to-service-upgrade` rows for the service-legibility batch (EscalationPromise.astro on /how-it-works, pricing.astro "What the month buys", product.astro upgrade line). Escalation response-time commitments are founder-set (Pradeep, co-founder; coverage-blocking 1hr in business hours / 3hr after; same-business-day otherwise).

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
6. Enforcement: built in `scripts/lib/positioning-rules.mjs` (`checkPositioning`),
   wired into `scripts/check-blog.mjs` as a WARN over `src/data/post/*` bodies.
   Covers product-mode phrase leaks, triad wording drift, novel
   we-do-X-for-you constructions, and retired "live demo" wording. Honors a
   `<!-- positioning-ok -->` per-line opt-out, mirroring `<!-- facts-ok -->`.
   Tests: `scripts/tests/positioning-rules.test.mjs`.

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

### Dry-run lessons (2026-07-04, 3 vs-posts converted + adversarially reviewed)

Measured: token hits 18, judgment calls 56, premise-collapse locations 18 across 3 posts. The vs-class is NOT mostly mechanical; budget a hand-rewrite tier for it.

1. **Diff-grounded decision ledger is mandatory.** Every converted post gets a line-by-line ledger verified against `git diff`/file diff, never from the converter's self-report (Post 2's log under-reported: silent excerpt/tags/intro edits). Same rule as feedback_verify_subagent_edits.
2. **Frontmatter is a positioning surface.** title, excerpt, description, tags are IN scope for conversion AND for the ledger; excerpt edits are SEO-visible.
3. **Premise triage greps H2s and comparison-table headers, not just titles/slugs.** The worst premise collapse in the dry run lived in an internal H2 of a post whose title never says "managed service". Triage pattern: grep 'managed service|service, not software|run(s)? itself' across title+H2s+table headers+FAQ questions.
4. **Competitor-inflation guardrail (product-mode edition).** Retiring "managed service" pulls conversions toward casting competitors as "integration-heavy". Never state a competitor's IT/integration lift beyond its own cited product page; reframe OUR model, not their burden.
5. **H2 renames change anchor slugs.** Every premise-collapse H2 rename = a TOC anchor change + potential inbound-fragment break; the ledger must list old->new anchors.
6. **Ship gates for real migration:** facts scan 0, check-blog corpus 0 hard failures, the leftover sweep (we build/we deliver/our team/hands it to you/done for you/Thursday-delivery framing/bald No IT), and the overcorrection sweep (solo-config implications, invented features, zero-touch setup).

7. **vs-class retitle pattern (founder decision 2026-07-04, Option A):** on migration day, "X vs. Managed Service" posts retitle to vendor-vs-vendor: "X vs. SimpleScheduleAI: Which Nurse Scheduling Software Fits a Critical Access Hospital? (2026)", with a NEW slug (x-vs-simplescheduleai) and a 301 from the old managed-service slug in netlify.toml. Applied in the dry-run to shiftwizard-vs-managed-service.

8. **Ledger reconciles to the FULL diff, including cosmetic/CSS hunks.** Round 2 leaked one unlogged class-attribute change; completeness claims require hunk-level reconciliation, not positioning-lines-only.
9. **Link-graph check before migration day:** any internal link whose ANCHOR TEXT carries positioning ("managed scheduling service") must migrate its anchor AND have its target slug's migration status checked in the same pass; two rounds hit anchor-vs-target drift on /blog/managed-service-vs-scheduling-software. Build the slug dependency map before the corpus pass.
10. **"we [verb]" sweep is migration-day-only.** First-person capability claims (we build/track/flag/alert/document/check) are legitimate service-mode copy today; add the verb list to the migration leftover sweep, NOT to live check-blog WARNs.
11. **Non-prose positioning surfaces are first-class conversion targets.** Image alt text, rating/comparison table cells, and author bios carry the same "SimpleScheduleAI is a service" self-label as body prose, but every leftover sweep to date (H2, S3, and others) scoped its greps to prose capability-claim verbs and missed these surfaces entirely. The residue survived 6 batches uncaught: `alt="SimpleScheduleAI managed nurse scheduling service..."`, `New service; no public reviews yet` table cells, and the standing bio sentence "...an AI-native nurse scheduling service built for Critical Access Hospitals in Texas." across most staged files. Two greps are now a MANDATORY ship gate on every batch, run in addition to the leftover sweep, before a batch's gates can be marked clean:
    ```
    grep -niE 'alt="[^"]*(managed|service)' docs/seo/migration-staging/post/*.md
    grep -niE 'new service|weekly service|default service|standard service|is an AI-native nurse scheduling service' docs/seo/migration-staging/post/*.md
    ```
    Any hit that is not a legitimate category/competitor reference (e.g. a competitor's own "emergency services" industry description, or the category contrast "software vs. a managed service") is residue and must be fixed before the batch ships.

Dry-run artifacts: docs/seo/migration-dryrun/ (3 converted posts + DECISIONS.md; NOT for publication).

## Maintenance log

| Date       | Change                                              | By     |
| ---------- | --------------------------------------------------- | ------ |
| 2026-07-04 | Initial registry: 18 rows, authoring rules, runbook | Claude |
| 2026-07-04 | Built `positioning-rules.mjs` + check-blog WARN wiring (authoring-rule enforcement, not the Pass-1 migration script) | Claude |
| 2026-07-05 | Swept SSAI self-referential "service" residue from non-prose surfaces (alt text, table cells, author bios) across 13 staged files in batches H2 and S3; added runbook lesson 11 and the two mandatory ship-gate greps | Claude |
