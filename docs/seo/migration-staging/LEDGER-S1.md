# Migration Staging Ledger — Batch S1 (regenerated, corpus-consolidation pass)

Service-mode to product-mode conversion. Sources untouched in `src/data/post/`. Outputs in
`docs/seo/migration-staging/post/` only. Per `docs/seo/migration-staging/CONVERTER-BRIEF.md`,
`docs/seo/positioning-registry.md` mapping table + authoring rules + runbook lessons 1-10, and
`docs/seo/facts-dossier.md#product-truths` guardrails.

**Regeneration note:** this ledger was rebuilt during the full-corpus consolidation pass
(2026-07-05) because the original S1 converter run died before writing its ledger file. Every
row below was built from a fresh `diff` of the live source in `src/data/post/` against the
staged output in `docs/seo/migration-staging/post/` (staging header line stripped before
diffing), not from any prior self-report. Source hashes below match the `source-hash` recorded
in each staged file's header exactly — no drift between staging and this regeneration.

Action key: `TOKEN:<id>` = exact registry row applied · `JUDGMENT` = positioning-bearing phrase
converted with no exact registry row, logged per rule 2 · `GAP-NO-TOKEN` = a phrase that is
clearly positioning-bearing, recurs, and probably deserves its own registry row but was
hand-converted here · `PREMISE-COLLAPSE` = the section's/post's argument structurally depends on
the service-vs-software distinction and does not survive a token swap · `CORRECTION` = a
violation found during this regeneration's mandatory verification and fixed in place.

Posts (7):

1. `src/data/post/12-hour-hospital-shifts-scheduling.md` -> `docs/seo/migration-staging/post/12-hour-hospital-shifts-scheduling.md` (source-hash `c4ce3066844d5871ec334991bb042d1e1f7bedd4`)
2. `src/data/post/aladtec-alternatives.md` -> `docs/seo/migration-staging/post/aladtec-alternatives.md` (source-hash `983f46ed2ee1a0e4aa7905f0262ac6d089f9fbbb`)
3. `src/data/post/best-nurse-scheduling-software-2026.md` -> `docs/seo/migration-staging/post/best-nurse-scheduling-software-2026.md` (source-hash `e06f5509ff17d294f1175d375731655987da0ffb`)
4. `src/data/post/best-nurse-scheduling-software-critical-access-hospitals.md` -> `docs/seo/migration-staging/post/best-nurse-scheduling-software-critical-access-hospitals.md` (source-hash `3f21fae756f487796f990b7fba0a15a1c620ee23`)
5. `src/data/post/best-tcp-alternative-for-cah.md` -> `docs/seo/migration-staging/post/best-tcp-alternative-for-cah.md` (source-hash `8da64cddc3a393b590bb069df637548674823529`)
6. `src/data/post/can-nurses-trust-ai-generated-schedule.md` -> `docs/seo/migration-staging/post/can-nurses-trust-ai-generated-schedule.md` (source-hash `2b8a3f3c6033acfd1fa100cd3853e35a4d0d74af`)
7. `src/data/post/deputy-alternatives-healthcare.md` -> `docs/seo/migration-staging/post/deputy-alternatives-healthcare.md` (source-hash `4f6e4db26ba982a8384ed7c178a3f39e1939604e`)

No `src/` files touched by this regeneration except the one `CORRECTION` in Post 5 (applied
directly to the already-staged output file, not to `src/`). No commits made by this ledger
build; the consolidation commit covers everything in one commit per the task instructions.

Cosmetic note (all 7 posts, not logged per-row below): the converter run prepended a single
leading blank line before the frontmatter `---` fence in every staged file. Cosmetic only, no
content or rendering impact; not a positioning conversion and not corrected (matches the
existing convention across the other 34 staged files, which show the same artifact).

---

## Post 1: 12-hour-hospital-shifts-scheduling.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Body, "How is SimpleScheduleAI's 12-hour scheduling different?" opening | "SimpleScheduleAI is an AI-native, human-verified scheduling service. Our AI builds your 12-hour shift schedules for critical access hospitals... and our scheduling team checks every draft before it reaches you for review." | TOKEN:`self-label` + TOKEN:`team-reference` | "SimpleScheduleAI is AI-native nurse scheduling software. The AI builds your 12-hour shift schedules for critical access hospitals... and 21 automated rule checks validate every draft before it reaches you for review." | Direct token application; "our scheduling team checks" -> "21 automated rule checks validate" |
| Same section, fatigue-guard sentence | "we flag any draft where a nurse is assigned more than 3 consecutive shifts..." | JUDGMENT | "the system flags any draft where a nurse is assigned more than 3 consecutive shifts..." | First-person "we" removed per migration-day "we [verb]" sweep (runbook lesson 10) |
| Same section, honest-limitation sentence | "One honest limitation: our system works best with a stable roster... the initial setup and calibration requires more time. We surface this in onboarding." | JUDGMENT + TOKEN:`guided-setup`-adjacent | "One honest limitation: the system works best with a stable roster... the initial setup and calibration requires more time. The guided setup session surfaces this early." | "We surface this in onboarding" -> canonical "guided setup session" framing; first-person "we/our" removed |
| What to Do This Week, item 5 | "5. ... The managed service delivers a compliant 12-hour shift schedule each cycle with the fairness, fatigue, and overtime guards already applied." | TOKEN:`delivery-model-binary` (derivative) | "5. ... The software generates a compliant 12-hour shift schedule each cycle with the fairness, fatigue, and overtime guards already applied." | Direct swap: "managed service" (noun) -> "the software"; "delivers" -> "generates" |
| CTA callout body copy | "...before the schedule lands in your inbox. You review and approve." | JUDGMENT | "...before the draft reaches you. You review and approve." | Minor wording normalization to "draft" language used elsewhere in the corpus; not a registry token but consistent with draft-review framing |
| Author bio | "co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas." | TOKEN:`self-label` | "co-founder of SimpleScheduleAI, AI-native nurse scheduling software built for Critical Access Hospitals in Texas." | Standard author-bio self-label swap, consistent across all 41 staged files |

Frontmatter: reviewed (title, excerpt, description, tags) — no positioning-bearing phrases found; unchanged.

H2/TOC renames: none in this post.

Facts/regulatory/competitor content: byte-identical (FLSA 8-and-80 educational framing, CMS references, consecutive-shift/fatigue rules, all body statistics untouched). No competitor blockquotes in this post (verified: 0 `> ` lines in either version).

**Verification (mandatory sweep):** no bald "No IT.", no "live demo" string, canonical "guided setup session" phrasing used correctly, no invented features (only registry-listed capabilities referenced: AI generation, fatigue/coverage rule checks, guided setup). No violations found in this post.

---

## Post 2: aladtec-alternatives.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Key Takeaways, bullet 1 | "...For a hospital that needs the scheduling handled rather than a better tool to do it themselves, SimpleScheduleAI is the managed service alternative." | TOKEN:`delivery-model-binary` | "...For a hospital that wants the scheduling work automated rather than a better tool to do it themselves, SimpleScheduleAI is the guided-setup software alternative." | Direct swap |
| Intro para (below TOC) | "...SimpleScheduleAI is the managed-service option when the goal is removing the scheduling work rather than buying a better tool to do it yourself." | TOKEN:`delivery-model-binary` | "...SimpleScheduleAI is the guided-setup software option when the goal is automating the scheduling work rather than buying a better tool to do it yourself." | Direct swap |
| Quick-comparison table, SimpleScheduleAI row | "New service; no public reviews yet" | JUDGMENT | "New software; no public reviews yet" | Noun swap, non-heading table cell |
| Section "1. SimpleScheduleAI", image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | JUDGMENT (image alt is a positioning surface) | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text swap |
| Same section, opening para | "SimpleScheduleAI is a new service, without public G2 or Capterra reviews yet. It is a managed [nurse scheduling service](/how-it-works) built specifically for Critical Access Hospitals in Texas. Unlike a self-serve platform, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a scheduling specialist handles setup from an Excel roster upload, checks each draft, and maintains the system as the roster changes." | TOKEN:`self-label` + TOKEN:`guided-setup` + TOKEN:`system-maintains` | "SimpleScheduleAI is new software, without public G2 or Capterra reviews yet. It is AI-native [nurse scheduling software](/how-it-works) built specifically for Critical Access Hospitals in Texas. Unlike a self-serve platform, SimpleScheduleAI requires no ongoing configuration work from the nurse manager: a guided setup session maps your unit rules from an Excel roster upload, once. After that the AI builds draft schedules each cycle, 21 automated rule checks validate every draft, and the software maintains the roster and rules as staff changes occur." | Multi-token sentence; "scheduling specialist" (human) fully removed per `system-maintains` guardrail (never attribute roster/rule maintenance to a human team member in product mode) |
| Same section, next para | "The service implements the hospital's rules, maintains them as staff changes occur, and updates them when policies change." | TOKEN:`system-maintains` | "The software implements the hospital's rules, maintains them as staff changes occur, and applies rule updates when policies change." | Direct swap |
| Key advantages bullet | "Eliminates configuration maintenance burden: the service maintains scheduling rules as staff and policies change" | TOKEN:`system-maintains` | "Eliminates ongoing configuration maintenance burden: the software maintains scheduling rules as staff and policies change" | Direct swap |
| Key limitations bullet | "Managed service model means less direct manager control than Aladtec; schedule changes go through the service rather than being adjustable in real time by the manager" | JUDGMENT | "Draft-selection model means less hands-on schedule construction than Aladtec; the manager reviews and adjusts AI-generated drafts rather than building the schedule shift by shift" | Reframed from control-loss framing to draft-review framing, consistent with dry-run lesson on honest limitations |
| Cost line | "Pricing not listed on website. Contact for a quote." | GAP-NO-TOKEN (pricing-disclosure gap, not a registry token but recurring across the corpus) | "Flat facility license by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees." | Applies TOKEN:`pricing` verbatim from the registry; several S1/S2/S3/S4 posts share this exact gap (pre-migration copy predates the facts-dossier pricing disclosure) |
| "How SimpleScheduleAI Compares to Aladtec" section opener | "SimpleScheduleAI is an AI-native nurse scheduling service where a scheduling specialist handles setup, rule maintenance, and draft generation." | TOKEN:`self-label` + TOKEN:`guided-setup` + TOKEN:`system-maintains` | "SimpleScheduleAI is AI-native nurse scheduling software where a guided setup session maps your unit rules once, and the software handles rule maintenance and draft generation after that." | Same guardrail as row 5: human "specialist" removed |
| Comparison table row, "Configuration maintenance" | "Service responsibility" | TOKEN:`system-maintains` | "Handled by the software" | Direct swap |
| Comparison table row, "Pricing model" | "Not listed, contact for quote" | GAP-NO-TOKEN (pricing) | "Flat facility license by roster size" | Same pricing gap as above |
| CTA callout copy | "SimpleScheduleAI eliminates the configuration burden..." | JUDGMENT | "SimpleScheduleAI eliminates the ongoing configuration burden..." | Minor: "ongoing" added for consistency with guided-setup-once framing |
| FAQ "Is SimpleScheduleAI better than Aladtec?" answer | "...SimpleScheduleAI is an AI-native nurse scheduling service with less direct manager control than Aladtec's self-serve model. For a nurse manager who also takes clinical shifts, the managed service model typically produces a better time outcome..." | TOKEN:`self-label` + JUDGMENT | "...SimpleScheduleAI is AI-native nurse scheduling software built on a draft-review model, with less hands-on schedule construction than Aladtec's self-serve model. For a nurse manager who also takes clinical shifts, the guided-setup model typically produces a better time outcome..." | Multi-phrase conversion, same draft-review reframe as Key limitations row |
| FAQ "How hard is it to migrate?" answer | "For a managed service like SimpleScheduleAI, migration is straightforward: the nurse manager provides a current roster in Excel and the service handles setup." | TOKEN:`delivery-model-binary` + TOKEN:`guided-setup` | "For guided-setup software like SimpleScheduleAI, migration is straightforward: the nurse manager provides a current roster in Excel and a guided setup session maps the rules once." | Direct swap |
| FAQ "What does Aladtec cost..." answer, closing sentence | "SimpleScheduleAI pricing is not listed publicly." | GAP-NO-TOKEN (pricing) | "SimpleScheduleAI is $1,000 to $1,500 a month per facility license, by roster size. No per-nurse fees, no setup fees." | TOKEN:`pricing`/`pricing-short` applied |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:`self-label` | "AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Standard swap |

Frontmatter: reviewed — no positioning-bearing phrases in title/excerpt/description/tags; unchanged.

H2/TOC renames: none in this post (H2 "How SimpleScheduleAI Compares to Aladtec?" unchanged; body-only conversion under it).

Facts/regulatory/competitor content: byte-identical (Aladtec/TCP ratings, Capterra/G2 numbers, migration/cost data for Deputy/NurseGrid/SmartLinx/QGenda, Sources section all untouched. 0 blockquote diffs.)

**Verification (mandatory sweep):** no bald "No IT.", no "live demo" string, canonical "guided setup session" used exactly where present, no invented features, no human "specialist/team" left attributed to ongoing rule/roster maintenance. No violations found in this post.

---

## Post 3: best-nurse-scheduling-software-2026.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Frontmatter excerpt | "...and whether you want to manage scheduling yourself or hand it off." | JUDGMENT (frontmatter is in scope per runbook lesson 2) | "...and whether you want to build schedules yourself or have the AI build them." | Excerpt is SEO-visible; converted consistent with body framing |
| Key Takeaways bullet | "Managed scheduling services now compete directly with self-serve software. Where scheduling is the manager's biggest time drain, managed service often wins on ROI." | TOKEN:`delivery-model-binary` | "Guided-setup AI scheduling software now competes directly with self-serve platforms. Where scheduling is the manager's biggest time drain, the guided-setup model often wins on ROI." | Direct swap |
| Intro para (below TOC) | "...SimpleScheduleAI is the only one purpose-built for that context and delivered as [AI nurse scheduling](/ai-nurse-scheduling) as a service..." | JUDGMENT | "...SimpleScheduleAI is the only one purpose-built for that context, built around [AI nurse scheduling](/ai-nurse-scheduling) with a guided setup..." | Direct swap, link target unchanged |
| Same section, next para | "...lightweight or managed options for small and critical access hospitals..." | JUDGMENT | "...lightweight or guided-setup options for small and critical access hospitals..." | Direct swap |
| Quick Comparison table, SimpleScheduleAI row (2 cells) | "New service; no public reviews yet" / "Not listed" (pricing cell) | JUDGMENT + GAP-NO-TOKEN (pricing) | "New software; no public reviews yet" / "$1,000-1,500 flat" | Pricing cell now discloses TOKEN:`pricing` numbers instead of leaving it blank |
| Section "Should You Consider a Managed Scheduling Service?" body (2 paras) | "Self-serve software assumes your nurse manager will log in, configure rules, build schedules, and maintain the system... Managed scheduling services take a different approach: a scheduling team handles the weekly build and the manager approves." | TOKEN:`delivery-model-binary` + TOKEN:`guided-setup` | "...Guided-setup AI software takes a different approach: a guided setup session maps the rules once, the AI handles the weekly build, and the manager approves." | Human "scheduling team" removed; H2 text itself was NOT renamed in source diff (H2 wording unchanged in this hunk — only body prose converted, see next row for the actual heading check) |
| SimpleScheduleAI profile section, image alt + opening para | "SimpleScheduleAI is a new service... It is an AI-native nurse scheduling service rather than self-serve software: the AI builds the weekly schedule from your roster, a scheduling specialist checks it, and the nurse manager approves." | TOKEN:`self-label` + TOKEN:`team-reference` | "SimpleScheduleAI is new software... It is AI-native nurse scheduling software rather than a self-configured platform: the AI builds the weekly schedule from your roster, 21 automated rule checks validate every draft, and the nurse manager approves." | "a scheduling specialist checks it" -> "21 automated rule checks validate every draft"; "the team" (callout paragraph) -> "the system" (same para, callout sentence) |
| Key advantages bullet | "No IT setup or configuration required - goes live in days" | TOKEN:`no-it` | "No installation, no integration project, no ongoing configuration - goes live in days" | Applies the founder-rule `no-it` replacement (never bald "No IT"; name what is absent) |
| Key limitations bullet | "Not a self-serve tool. If your hospital wants to own and manage scheduling internally, this is not the right fit." | JUDGMENT | "Not a build-it-yourself tool. If your hospital wants the manager to hand-construct schedules in a fully self-configured platform, this is not the right fit." | Reworded for product-mode consistency |
| Verdict sentence | "If you want to manage scheduling yourself..." | JUDGMENT | "If you want to configure and build schedules yourself..." | Direct swap |
| Cost line | "Pricing not listed on website. Contact for a quote." | GAP-NO-TOKEN (pricing) | "Flat facility license by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees." | TOKEN:`pricing` applied |
| Aladtec section, cross-link sentence | "...For the operating-model comparison between a self-serve platform like Aladtec and a managed service, see our [Aladtec vs. managed scheduling service comparison](/blog/aladtec-vs-managed-service)." | Anchor text migration (lesson 9) | "...For the operating-model comparison between a self-serve platform like Aladtec and guided-setup software, see our [Aladtec vs. SimpleScheduleAI comparison](/blog/aladtec-vs-managed-service)." | href unchanged; anchor migrated to the Option-A vendor-vs-vendor form; logged in dependency map |
| "2026 Landscape" callout, bold lead sentence | "**Managed scheduling services emerged as a real category.** ... In 2026, managed scheduling services handle the weekly build for a flat fee." | TOKEN:`delivery-model-binary` | "**Guided-setup scheduling emerged as a real alternative.** ... In 2026, guided-setup AI software handles the weekly build for a flat fee." | Direct swap |
| "How Does SimpleScheduleAI Fit" section opener | "SimpleScheduleAI is an AI-native nurse scheduling service for Critical Access Hospitals in Texas under 50 beds... You send us your roster via Excel. Our AI builds the weekly schedule using fairness, overtime, and compliance rules, our scheduling team checks it, and you approve." | TOKEN:`self-label` + TOKEN:`weekly-inputs` + TOKEN:`team-reference` | "SimpleScheduleAI is AI-native nurse scheduling software for Critical Access Hospitals in Texas under 50 beds... You load your roster from the Excel file you already keep. The AI builds the weekly schedule using fairness, overtime, and compliance rules, 21 automated rule checks validate every draft, and you approve." | Multi-token; "You send us" (first-person, human-inbound) -> "You load" (product-mode `weekly-inputs` framing) |
| Persona-fit callout box | "Want managed: SimpleScheduleAI" | JUDGMENT | "Want guided-setup: SimpleScheduleAI" | Label swap, non-heading UI text |
| What to Do This Week, item 2 | "...one is self-serve software, the other builds the schedule for you." | JUDGMENT | "...one is self-serve software you configure and run, the other is guided-setup software that builds the schedule for you." | Direct swap |
| CTA callout copy | "Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:`no-it` + TOKEN:`team-reference` | "Flat monthly pricing. No installation, no IT project. The AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Multi-token application |
| FAQ "cheapest nurse scheduling software" answer | "SimpleScheduleAI uses flat monthly pricing by roster size..." | JUDGMENT | "SimpleScheduleAI uses a flat monthly facility license by roster size..." | Minor: "pricing" -> "facility license" for consistency with `pricing` token wording |
| FAQ heading + answer (last FAQ) | Q: "What is the difference between scheduling software and a managed scheduling service?" A: "Scheduling software is a tool your nurse manager logs into, configures, and uses to build schedules each week. A managed scheduling service provides a scheduling team that builds the schedule for you, using your rules and roster, and your manager reviews and approves. Where the nurse manager is also clinically active, managed service often solves the real problem... where software only shifts the work to a different tool." | JUDGMENT (question converted in full; this FAQ pair frames the category distinction in the post's own voice, not a quoted external term, consistent with the H2-post-4 precedent in LEDGER-H2) | Q: "What is the difference between self-serve scheduling software and guided-setup scheduling software?" A: "Self-serve scheduling software is a tool your nurse manager logs into, configures, and uses to build schedules each week. Guided-setup software maps your rules once in a guided setup session, then the AI builds the schedule from your rules and roster, and your manager reviews and approves. Where the nurse manager is also clinically active, the guided-setup model often solves the real problem... where self-serve software only shifts the work to a different tool." | Human "scheduling team" removed from the answer |

Frontmatter: title/tags reviewed, no other positioning phrases found besides the excerpt row above.

H2/TOC renames: the H2 "Should You Consider a Managed Scheduling Service?" text itself was checked against the staged file and found UNCHANGED in the diff (only the body prose beneath it converted). **GAP flagged for migration day**: this H2 still reads "Managed Scheduling Service" and should be triaged alongside the anchor-fragment sweep in the dependency map, since its body now argues the guided-setup case under an unconverted heading. Logged here rather than silently fixed, since H2/TOC renames are explicitly an anchor-integrity decision (runbook lesson 5) reserved for the hand-tier premise triage, not a script-tier default; flagging for the SLUG-DEPENDENCY-MAP and for founder review on migration day.

Facts/regulatory/competitor content: byte-identical (NSI 2024 stat, Aladtec/UKG/QGenda ratings and cost figures, FLSA and CMS references, Sources section untouched). 0 blockquote diffs.

**Verification (mandatory sweep):** no bald "No IT." (the one `no-it` token instance uses the full founder-rule replacement), no "live demo" string, canonical "guided setup session" used correctly, no invented features. **One GAP found** (H2 "Managed Scheduling Service" left unconverted) — not a hard violation of the founder rules (no invented feature, no false claim), but flagged as migration-day debt above and in the dependency map rather than silently left unlogged.

---

## Post 4: best-nurse-scheduling-software-critical-access-hospitals.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Comparison table, SimpleScheduleAI row (2 cells) | "Texas Critical Access Hospitals; nurse scheduling software operated for you" / "New service; no public reviews yet" | JUDGMENT | "Texas Critical Access Hospitals; guided-setup nurse scheduling software" / "New software; no public reviews yet" | Direct swap, non-heading table cells |
| Section "1. SimpleScheduleAI", image alt text | "SimpleScheduleAI AI-native nurse scheduling service for Critical Access Hospitals" | JUDGMENT | "SimpleScheduleAI AI-native nurse scheduling software for Critical Access Hospitals" | Alt text swap |
| Same section, opening para | "SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: the AI builds the schedule, our scheduling team checks it, you approve. It is a new service... You send your roster as an Excel file... When a nurse calls out, the team surfaces a ranked shortlist... The service is currently focused on Texas, where the state overtime rules and the managed-service model are most developed." | TOKEN:`self-label` + TOKEN:`team-reference` + TOKEN:`weekly-inputs` | "SimpleScheduleAI is AI-native nurse scheduling software: the AI builds your schedule, 21 automated rule checks validate every draft, you approve. It is new software... You load your roster from an Excel file... When a nurse calls out, the system surfaces a ranked shortlist... The software is currently focused on Texas, where its state overtime rule coverage is deepest." | First-person "we build and operate ourselves" removed entirely; "the team" -> "the system" (twice); "You send" -> "You load" |
| Key limitations bullet | "Not a self-serve platform you configure and run yourself." (bolded lead) | unchanged (already product-neutral) | unchanged | Not positioning-bearing on its own; left as-is |
| Verdict sentence | "If you want to manage scheduling in-house..." | JUDGMENT | "If you want to configure and run a scheduling platform yourself..." | Direct swap |
| Cost line | "Flat monthly price by roster size: $1,000/month..." | TOKEN:`pricing` (wording alignment) | "Flat facility license by roster size: $1,000/month..." | "price" -> "facility license" to match the registry's exact `pricing` row wording |
| "Which Is Right for Your Hospital?" H2 body opener | "...do you want to run scheduling yourself, or hand it off?" | JUDGMENT | "...do you want to build schedules yourself, or have the AI build them?" | Direct swap |
| Persona-fit callout box | "Want managed: SimpleScheduleAI" | JUDGMENT | "Want guided-setup: SimpleScheduleAI" | Label swap |
| "How Does SimpleScheduleAI Fit" section, simulator link | "...try the [live scheduling simulator](/simulator)." | JUDGMENT (retired "live demo"-adjacent wording) | "...try the [interactive scheduling simulator](/simulator)." | "live" swapped for "interactive" per the corpus-wide retired-wording rule (no "live demo"); simulator link target unchanged |
| What to Do This Week, item 5 | "...let us build a schedule against your actual roster..." | JUDGMENT | "...have the AI build a schedule against your actual roster..." | First-person "us" removed |
| CTA callout copy | "Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:`no-it` + TOKEN:`team-reference` | "Flat monthly pricing. No installation, no IT project. The AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Multi-token application, identical pattern to Post 3 |
| FAQ heading + answer | Q: "What is the difference between scheduling software and a managed scheduling service for a CAH?" A: "Scheduling software is a tool your nurse manager logs into, configures, and runs each week; a managed service provides a team that builds the schedule for you, and your manager reviews and approves. For a CAH where the manager is also clinical with no IT department, a managed service removes the build burden that software only relocates." | JUDGMENT (question converted in full, same precedent as Post 3) | Q: "What is the difference between self-serve scheduling software and guided-setup scheduling software for a CAH?" A: "Self-serve scheduling software is a tool your nurse manager logs into, configures, and runs each week; guided-setup software maps your rules once in a guided setup session, then the AI builds the schedule and your manager reviews and approves. For a CAH where the manager is also clinical with no IT department, the guided-setup model removes the build burden that self-serve software only relocates." | Human "team" removed |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:`self-label` | "AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Standard swap |

Frontmatter: reviewed — no positioning phrases in title/excerpt/description/tags; unchanged.

H2/TOC renames: none in this post (all H2 headings checked against staged output — no positioning nouns in any heading text).

Facts/regulatory/competitor content: byte-identical (Aladtec/ShiftWizard/NurseGrid/CronShift data, CMS §485.635, FLSA overtime threshold link, Sources section, methodology note all untouched). 0 blockquote diffs.

**Verification (mandatory sweep):** no bald "No IT." (both `no-it` instances use the founder-rule replacement in full), **"live" scheduling simulator corrected to "interactive"** during this regeneration's verification (found in the diff read; the staged file already had this converted correctly — confirmed as a proper conversion, not left as "live demo"), canonical "guided setup session" used correctly, no invented features. No violations found requiring further correction in this post.

---

## Post 5: best-tcp-alternative-for-cah.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Frontmatter metadata description | "...Compare ShiftWizard, Aladtec by TCP, NurseGrid, and SimpleScheduleAI managed service to find the right fit for your CAH." | JUDGMENT (frontmatter in scope) | "...Compare ShiftWizard, Aladtec by TCP, NurseGrid, and SimpleScheduleAI guided-setup software to find the right fit for your CAH." | Meta description is SEO-visible; converted |
| Key Takeaways bullet 1 | "...do you want the scheduling work done for you?" | JUDGMENT | "...do you want the AI to build the schedule for you?" | Direct swap |
| Key Takeaways bullet 3 | "For structural burden reduction, SimpleScheduleAI is the managed service alternative: a specialist builds, the nurse manager approves, live in 3-5 days." | TOKEN:`delivery-model-binary` | "For structural burden reduction, SimpleScheduleAI is the guided-setup software alternative: the AI builds, the nurse manager approves, live in 3-5 days." | Human "a specialist builds" -> "the AI builds" |
| Key Takeaways bullet 4 | "...This is the main reason to stay with TCP over a managed service." | JUDGMENT | "...This is the main reason to stay with TCP over SimpleScheduleAI." | "a managed service" (category noun) -> named competitor, avoids the retired category framing |
| TOC entry + matching H2 | "Scenario 2: Scheduling Work Done for You" / `#scenario-2-scheduling-work-done-for-you` | JUDGMENT (H2+TOC pair, not flagged PREMISE-COLLAPSE since the post's title/spine is not the service-vs-software binary) | "Scenario 2: The AI Builds the Schedule for You" / `#scenario-2-the-ai-builds-the-schedule-for-you` | **Anchor slug changed**: old `#scenario-2-scheduling-work-done-for-you` -> new `#scenario-2-the-ai-builds-the-schedule-for-you`. Logged in dependency map. |
| Body, "What Does TCP TimeClock+ Cover" section | "...the hospital-specific workflows that a dedicated nurse scheduling tool or managed service handles as a primary function." | JUDGMENT | "...the hospital-specific workflows that a dedicated, purpose-built nurse scheduling tool handles as a primary function." | "or managed service" category dropped, folded into "purpose-built" |
| Body, under renamed H2 (Scenario 2) | "**SimpleScheduleAI** is the managed service alternative to TCP TimeClock+. It does not replace TCP with a different platform; it replaces the self-serve model entirely. The AI generates the weekly schedule; a scheduling specialist handles configuration and roster maintenance and checks the schedule, and the nurse manager reviews drafts and approves. Our breakdown of [TCP scheduling software versus a managed service](/blog/tcp-scheduling-software-vs-managed-service) lays out that model difference in full." | TOKEN:`delivery-model-binary` + TOKEN:`guided-setup` + TOKEN:`system-maintains` + anchor text migration (lesson 9) | "**SimpleScheduleAI** is the guided-setup software alternative to TCP TimeClock+. It does not replace TCP with another platform to operate; it replaces the self-serve model entirely. A guided setup session maps your unit rules once; after that the AI generates the weekly schedule, 21 automated rule checks validate every draft, the software maintains the roster as staff change, and the nurse manager reviews drafts and approves. Our breakdown of [TCP scheduling software versus guided-setup software](/blog/tcp-scheduling-software-vs-managed-service) lays out that model difference in full." | Human "scheduling specialist" fully removed; href unchanged, anchor migrated, logged in dependency map |
| Comparison table, "Setup" row, SimpleScheduleAI cell | "3-5 days (specialist configures)" | TOKEN:`guided-setup` | "3-5 days (guided setup session)" | Direct swap |
| Comparison table, "Callout coverage" row, SimpleScheduleAI cell | "Pre-ranked shortlist delivered" | JUDGMENT | "Pre-ranked shortlist generated" | "delivered" (human-delivery framing) -> "generated" (system framing) |
| Body, "How Do the Main TCP Alternatives Compare?" section opener | "...hospital-specific self-serve scheduling platforms, a different TCP product designed specifically for healthcare scheduling, and managed services." | JUDGMENT | "...hospital-specific self-serve scheduling platforms, a different TCP product designed specifically for healthcare scheduling, and guided-setup software." | Category noun swap |
| Section "SimpleScheduleAI", image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | JUDGMENT | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text swap |
| Same section, opening para | "SimpleScheduleAI is an AI-native nurse scheduling service, not a self-serve platform. The AI generates the weekly schedule; a scheduling specialist handles configuration and roster maintenance and checks the schedule. The nurse manager reviews drafts and approves. This is the only option in this list that does not require the nurse manager to operate scheduling software on an ongoing basis." | TOKEN:`self-label` + TOKEN:`guided-setup` + TOKEN:`system-maintains` | "SimpleScheduleAI is AI-native nurse scheduling software, not a self-serve platform the hospital configures alone. A guided setup session maps your unit rules once; the AI generates the weekly schedule, 21 automated rule checks validate every draft, and the software maintains the roster as staff change. The nurse manager reviews drafts and approves. This is the only option in this list that does not require the nurse manager to configure and maintain scheduling software on an ongoing basis." | Same "specialist" removal pattern as prior posts |
| Best-for line | "CAH nurse managers who want the scheduling work handled rather than a better tool..." | JUDGMENT | "CAH nurse managers who want the scheduling work automated rather than a better tool..." | "handled" (human) -> "automated" (system) |
| Key advantages bullet | "Callout coverage shortlists delivered pre-ranked..." | JUDGMENT | "Callout coverage shortlists generated pre-ranked..." | Same delivered->generated pattern |
| Verdict sentence | "...or [see how the managed service works](/how-it-works)." | Anchor text migration (lesson 9) | "...or [see how the guided-setup software works](/how-it-works)." | href unchanged (`/how-it-works`, internal page not a blog slug — no dependency-map slug-rename entry needed, page itself is out of migration scope) |
| Cost line | "Starting pricing available at [how it works](/how-it-works)." | GAP-NO-TOKEN (pricing) | "Flat facility license by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees." | TOKEN:`pricing` applied directly instead of an indirect link-out |
| "Four Questions" list, item 1 | "The answer should be in days (managed service) or weeks (self-serve platform)." | JUDGMENT | "The answer should be in days (guided-setup software) or weeks (self-serve platform)." | Direct swap |
| What to Do This Week, item 1 | "Clarify what TCP problem you are actually trying to solve. Is it cost, configuration complexity, lack of CAH-specific compliance, or **the absence of a managed delivery model**?" | **CORRECTION** — this hunk was NOT converted in the original batch run; found during this regeneration's mandatory leftover sweep (byte-identical to `src/`) | "...or the absence of a guided-setup delivery model?" | **Violation found and fixed in this pass.** "Managed delivery model" is a positioning-bearing noun phrase describing SSAI's own operating model, left unconverted while every other instance in this post was migrated. Fixed directly in the staged file (`docs/seo/migration-staging/post/best-tcp-alternative-for-cah.md` line 359) during consolidation. |
| What to Do This Week, item 5 | "The managed service delivers a compliant schedule each cycle without configuration, IT setup, or TCP-style implementation overhead." | TOKEN:`delivery-model-binary` | "The software generates a compliant schedule each cycle without ongoing configuration, IT integration, or TCP-style implementation overhead." | Direct swap |
| CTA callout copy | "SimpleScheduleAI delivers the scheduling outputs TCP buyers needed without the configuration burden." | JUDGMENT | "SimpleScheduleAI delivers the scheduling outputs TCP buyers needed without the ongoing configuration burden." | Minor: "ongoing" added |
| FAQ "fastest way to switch" answer | "Switching to a managed service is the fastest path: 3-5 days from roster upload to first draft schedule, with the service team handling configuration." | TOKEN:`delivery-model-binary` + TOKEN:`guided-setup` | "Switching to guided-setup software is the fastest path: 3-5 days from roster upload to first draft schedule, with a guided setup session mapping the rules once." | Human "service team" removed |
| Author bio | "an AI-native nurse scheduling service for Critical Access Hospitals in Texas" | TOKEN:`self-label` | "AI-native nurse scheduling software for Critical Access Hospitals in Texas" | Standard swap |

Frontmatter: title/excerpt/tags reviewed — only the metadata description (row 1) carried a positioning phrase; rest unchanged.

H2/TOC renames: 1 pair (Scenario 2 heading, see row above). Logged in dependency map.

Internal links: 1 link to a not-yet-migrated managed-service slug, anchor migrated (`/blog/tcp-scheduling-software-vs-managed-service`, appears twice: body Scenario-2 paragraph and SimpleScheduleAI-section paragraph, both migrated identically). Logged in dependency map.

Facts/regulatory/competitor content: byte-identical (ShiftWizard/Aladtec/NurseGrid ratings and cost data, TCP TimeClock+ product-page claims, Sources section untouched). 0 blockquote diffs.

**Verification (mandatory sweep):** no bald "No IT." remaining, no "live demo" string, canonical "guided setup session" used correctly throughout. **One CORRECTION applied** (the "managed delivery model" leftover in What-to-Do-This-Week item 1, detailed above) — this was the only hard violation found across all 7 S1 files during this regeneration's verification pass.

---

## Post 6: can-nurses-trust-ai-generated-schedule.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| What to Do This Week, item 5 | "Our AI-native nurse scheduling service delivers AI-generated schedules with the auditability, fairness tracking, and human-override workflow already wired in." | TOKEN:`self-label` | "Our AI-native nurse scheduling software produces schedules with the auditability, fairness tracking, and human-override workflow already wired in." | Direct swap; "delivers AI-generated" -> "produces" (avoids redundant "AI" repetition, not positioning-driven) |
| FAQ "How does AI scheduling handle a nurse who has special circumstances" answer | "The manager enters relevant constraints as part of setup and updates them as circumstances change." | TOKEN:`guided-setup` | "Relevant constraints are entered during the guided setup session, and the manager updates them as circumstances change." | Direct swap to canonical "guided setup session" string |

Frontmatter: reviewed — no positioning-bearing phrases; unchanged (this post's frontmatter had none to begin with).

H2/TOC renames: none in this post.

Facts/regulatory/competitor content: byte-identical (no competitor mentions in this post; it is a trust/AI-transparency explainer, not a comparison post). 0 blockquote diffs.

**Verification (mandatory sweep):** no bald "No IT.", no "live demo" string, canonical "guided setup session" used correctly, no invented features. This is the smallest diff in the S1 batch (2 hunks); no violations found.

---

## Post 7: deputy-alternatives-healthcare.md

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Quick Comparison table, SimpleScheduleAI row (2 cells) | "CAHs, managed service" / "New service; no public reviews yet" / "Not listed" (pricing cell) | JUDGMENT + GAP-NO-TOKEN (pricing) | "CAHs, guided-setup software" / "New software; no public reviews yet" / "$1,000-1,500 flat" | Pricing cell now discloses TOKEN:`pricing` figures |
| Section "1. SimpleScheduleAI", image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | JUDGMENT | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text swap |
| Same section, mechanism para | "The AI-native, human-verified model means the hospital does not install software or maintain configuration. The nurse manager uploads a roster in Excel, the AI builds three schedule drafts and our scheduling team checks each one before delivery, she selects one, and the AI callout module handles coverage gaps with a ranked shortlist filtered by credentials and overtime status. See [how it works](/how-it-works) for the full service model." | TOKEN:`self-label` + TOKEN:`team-reference` + TOKEN:`no-it` (derivative) | "The AI-native model means the hospital runs no installation or integration project and carries no ongoing configuration burden. The nurse manager uploads a roster in Excel, the AI builds three schedule drafts and 21 automated rule checks validate each one, she selects one, and the AI callout module handles coverage gaps with a ranked shortlist filtered by credentials and overtime status. See [how it works](/how-it-works) for the full operating model." | "human-verified" dropped (implies a person verifies, contradicts `team-reference`); "our scheduling team checks" -> "21 automated rule checks validate"; "full service model" -> "full operating model" |
| Key advantages bullet | "Managed service eliminates implementation cost and ongoing IT dependency" | TOKEN:`delivery-model-binary` (derivative) | "Guided setup eliminates implementation cost and ongoing IT dependency" | "Managed service" (noun subject) -> "Guided setup"; not the full "guided setup session" phrase since this sentence uses it as a general noun-subject, not a reference to the specific onboarding event (consistent with how the same token is used elsewhere in the corpus, e.g. LEDGER-S2/S3 "guided setup" as bare noun in advantage bullets) |
| Key limitations bullet | "Managed service model with less direct manager control than Deputy's self-serve platform" | JUDGMENT | "Draft-selection model with less hands-on schedule construction than Deputy's self-serve platform; the manager reviews and adjusts AI-generated drafts rather than building each schedule herself" | Same draft-review reframe pattern as Post 2 |
| Ratings line | "New service; no public reviews yet." | JUDGMENT | "New software; no public reviews yet." | Noun swap |
| Cost line | "Pricing not listed on website. Contact for a quote." | GAP-NO-TOKEN (pricing) | "Flat facility license by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees." | TOKEN:`pricing` applied |
| Comparison table, "Pricing" row, SimpleScheduleAI cell | "Not listed, contact for quote" | GAP-NO-TOKEN (pricing) | "Flat facility license by roster size" | Same pricing gap |
| Honest-limitation sentence (near closing CTA) | "...facilities that specifically need a low-cost general workforce tool rather than a managed nurse-scheduling service." | JUDGMENT | "...facilities that specifically need a low-cost general workforce tool rather than purpose-built nurse scheduling software." | Direct swap |
| FAQ "cost difference between Deputy and healthcare scheduling software" answer | "SmartLinx and SimpleScheduleAI do not publish pricing and require a quote." | GAP-NO-TOKEN (pricing) | "SmartLinx does not publish pricing and requires a quote. SimpleScheduleAI is $1,000 to $1,500 a month per facility license, by roster size, with no per-nurse fees and no setup fees." | Sentence split so SimpleScheduleAI's own disclosed pricing (TOKEN:`pricing`) is separated from SmartLinx's undisclosed pricing (competitor fact, left untouched) |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:`self-label` | "AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Standard swap |

Frontmatter: reviewed — no positioning phrases in title/excerpt/description/tags; unchanged.

H2/TOC renames: none in this post.

Facts/regulatory/competitor content: byte-identical (Deputy per-user pricing, Aladtec/NurseGrid/SmartLinx data, Sources section, product-page capability notes untouched). 0 blockquote diffs.

**Verification (mandatory sweep):** no bald "No IT.", no "live demo" string, "Guided setup eliminates..." bare-noun usage checked against the canonical-string rule and judged compliant (rule requires the exact phrase "guided setup session" when referring to the onboarding event itself; this sentence uses "Guided setup" as a general subject noun, matching a pattern already present elsewhere in the batch ledgers), no invented features. No violations found in this post.

---

## Batch-level facts scan and leftover sweep (all 7 posts)

Ran the CONVERTER-BRIEF gate greps across all 7 staged files as part of this regeneration:

- `we build|we deliver|we configure|we check|we send` (first-person capability claims): 0 hits remaining after the Post 1/2/3/4 fixes logged above.
- `our team|our scheduling team|our specialist` outside the canonical CTA link text: 0 hits.
- `log the callout with us`: 0 hits.
- Bald `No IT.` (period-terminated, standalone claim): 0 hits.
- `live demo`: 0 hits. One "live scheduling simulator" instance in Post 4 confirmed already converted to "interactive scheduling simulator" in the staged output.
- `managed` near "SimpleScheduleAI"/"SSAI" in body prose (excluding competitor mentions and the registry's own `delivery-model-binary` explanatory text): 1 hit found and fixed (Post 5, logged above as a CORRECTION).
- Invented features (credential/license-expiry tracking, pilots/cohorts/customers, EHR integration claims, staff-facing mobile app) attributed to SimpleScheduleAI: 0 hits. All credential-expiration and pilot mentions found in-corpus refer to competitors (Aladtec) or are generic vendor-evaluation criteria, not SSAI claims.

**Result: 1 violation found, 1 corrected (Post 5). 1 GAP flagged for migration-day judgment, not a hard violation (Post 3 H2 heading).**
