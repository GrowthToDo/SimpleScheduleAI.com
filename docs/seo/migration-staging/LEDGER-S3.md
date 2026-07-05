# Migration Ledger — Batch S3

Service-mode to product-mode conversion. Sources untouched in `src/data/post/`. Outputs in
`docs/seo/migration-staging/post/`. Per `docs/seo/positioning-registry.md` mapping table +
authoring rules, and `docs/seo/facts-dossier.md#product-truths` guardrails. Every row below
is reconciled against a full `diff` of source vs. staged output (including cosmetic hunks),
not from self-report.

Action key: `TOKEN:<id>` = exact registry row applied · `JUDGMENT` = positioning-bearing
phrase converted with no exact registry row · `GAP-NO-TOKEN` = recurring construction that
probably deserves its own registry row · `PREMISE-COLLAPSE` = section's argument structurally
depends on the service-vs-software distinction and does not survive a token swap unchanged.

---

## Post 1: nurse-scheduling-no-it-department-rural-hospital.md

Source hash: `91047fc9c080d094e2a00710c1218cc434ddd48b`. This post's premise flirts with the
no-it founder rule directly (title says "No IT Department"), so the guided-setup / one-time
setup-session framing had to be threaded through every conversion to avoid implying
zero-touch configuration.

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Frontmatter excerpt | "Texas-only managed service that requires no software installation" | TOKEN:delivery-model-binary + TOKEN:no-it | "Texas-only guided-setup nurse scheduling software that requires no installation or IT department" | Excerpt is in-scope per registry rule; combined two tokens. |
| Intro para 2 | "SimpleScheduleAI is an AI-native nurse scheduling service" | TOKEN:self-label | "AI-native nurse scheduling software" | Direct token. |
| KT bullet 1 | "...regional health-system contracts, and managed scheduling services" | JUDGMENT | "...and guided-setup scheduling software" | Category-noun retirement consistent with dry-run lesson (delivery-model-binary). |
| KT bullet 6 | "A managed service removes the build work entirely, but most managed offerings..." | TOKEN:delivery-model-binary | "Guided-setup scheduling software removes the build work entirely after a one-time setup session, but most guided-setup offerings..." | Added "after a one-time setup session" per no-it founder rule (never imply zero-touch). |
| TOC + H2 | "How Does a Managed Scheduling Service Differ From Scheduling Software?" | PREMISE-COLLAPSE | "How Does Guided-Setup Scheduling Software Differ From Self-Configured Software?" | Anchor changes: `#how-does-a-managed-scheduling-service-differ-from-scheduling-software` → `#how-does-guided-setup-scheduling-software-differ-from-self-configured-software`. TOC updated to match exactly. |
| Body, regional contract section | "...common bundled service..." | JUDGMENT | "...common bundled arrangement..." | Minor noun swap to avoid stray "service" reference to a non-SSAI vendor model; factual content (system-affiliate contracts) otherwise untouched. |
| H2 "What Nurse Scheduling Tools Work..." body | "the tools that work are the ones someone other than your nurse manager configures and maintains... or if a vendor runs it for her" | JUDGMENT | "...the ones a clinically active nurse manager can run without an installation or integration project, whether that means a vendor's guided setup or a lightweight self-configured tool... or if the vendor's guided setup absorbs the configuration work up front" | Removed "someone else configures and maintains" framing (implies an external team); replaced with guided-setup + no-installation framing per `no-it` and `delivery-model-binary` tokens. |
| Same section | "the honest split is between software you still operate and a service where the build leaves the building" | JUDGMENT | "...between software you configure and maintain yourself and software where a guided setup session moves that work off your desk" | Core delivery-model-binary retirement pattern. |
| H2 body (guided-setup section) | "A managed scheduling service is a vendor that builds the schedule from your roster and returns drafts... in a managed service, the vendor encodes credentials..." | TOKEN:delivery-model-binary + TOKEN:guided-setup | "Guided-setup scheduling software is a vendor that maps your unit rules with you once in a setup session, then generates the schedule from your roster automatically each cycle... with guided setup, the vendor maps credentials... with the manager once; with self-configured SaaS, the manager encodes and maintains all of it herself, cycle after cycle" | Full paragraph rewrite; canonical "guided setup session" string used exactly. |
| Same section | "Most managed offerings do not include..." | JUDGMENT | "Most guided-setup offerings do not include..." | Noun swap. |
| "How SimpleScheduleAI Fits" intro | "the managed-service detail below" | JUDGMENT | "the guided-setup detail below" | Noun swap. |
| Body | "The service takes an Excel roster upload... our AI builds the draft, our scheduling team checks it..." | TOKEN:onboarding + TOKEN:triad | "SimpleScheduleAI takes an Excel roster upload... a guided setup session maps your unit rules once, the AI builds the draft, 21 automated rule checks validate every draft..." | Direct application of `triad` and `onboarding` tokens; "our scheduling team checks it" retired per `team-reference` token to "21 automated rule checks validate every draft". |
| Same body | "The service is built for Texas HHSC..." | JUDGMENT | "The software is built for Texas HHSC..." | Noun swap. |
| Our Take box | "A managed service is the only model where the build work itself leaves the hospital." | TOKEN:delivery-model-binary | "Guided-setup software is the only model where the recurring build work itself leaves the manager's desk after one onboarding session." | Reworded to avoid implying an external team removed the work entirely from the hospital (no-it rule: guided setup + automation, not an offsite team). |
| What to Do item 5 | "a managed scheduling service is on the table... The onboarding includes the Excel roster upload, the 3 to 5 day go-live..." | JUDGMENT | "guided-setup scheduling software is on the table... Onboarding includes the Excel roster upload, a guided setup session, the 3 to 5 day go-live..." | Noun swap + added guided setup session to the onboarding list. |
| CTA block | "No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:no-it + TOKEN:triad | "No installation, no integration project, no IT department required. The AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Direct token application; bald "No IT setup" retired per founder rule (name what's absent). |
| FAQ 1 | "Managed services and system contracts put it on someone else." | JUDGMENT | "Guided-setup software and system contracts put it on someone else after the initial setup." | Added "after the initial setup" per no-it rule. |
| FAQ 2 (Q + A) | "difference between scheduling software and a managed scheduling service... A managed service is a vendor that builds the schedule from a roster upload and returns drafts for approval... the managed service model removes the build work, while software shifts that work into a portal" | TOKEN:delivery-model-binary | "difference between self-configured scheduling software and guided-setup scheduling software... Guided-setup software is a vendor that maps your unit rules once in a setup session, then builds the schedule from a roster upload and returns drafts for approval... the guided-setup model removes the recurring build work after one session, while self-configured software shifts that work into a portal the manager must maintain" | Full Q+A rewrite. |
| FAQ 3 (Does SimpleScheduleAI work outside Texas) | "The service is calibrated... the service is Texas-only" | JUDGMENT | "The software is calibrated... the software is Texas-only" | Noun swap. |
| FAQ 4 (Q + A) | "How long does a managed scheduling service take to go live... Other managed services range..." | TOKEN:delivery-model-binary | "How long does guided-setup scheduling software take to go live... including the guided setup session. Other guided-setup vendors range..." | Q+A rewrite; added guided setup session to the go-live description. |
| FAQ 5 | "a managed service moves the build off her desk entirely" | JUDGMENT | "guided-setup software moves the recurring build off her desk after a one-time setup session" | Avoided "entirely" (implies zero-touch); added the one-time-session qualifier per no-it rule. |

**Post 1 counts:** Token hits: 9 (`self-label` x1, `delivery-model-binary` x5, `no-it` x2, `triad` x1). Judgment calls: 11. Gaps: 0 (all recurring patterns already covered by the `delivery-model-binary` and `no-it` registry rows added in the 2026-07-04 dry-run). Premise-collapse: 1 (the "Managed Scheduling Service" H2 + its TOC anchor).

**Framing decision (no-IT founder rule):** every instance where the source implied "the build leaves the building" / "someone else configures and maintains" / "the service removes it entirely" was rewritten to name a one-time guided setup session followed by automation, never an offsite team or a zero-touch claim. The post's core premise ("hospital with no IT department") survives cleanly because the product-mode framing is "no installation, no integration project, no IT department required" plus a single guided setup session — which is exactly what the `no-it` token mandates, not a retreat from the no-IT claim.

---

## Post 2: nurse-scheduling-software-pricing.md

Source hash: `47270a8ce6f1a4f2ed00539a979b4677258c10b7`. Per task instructions, reframed to
facility-license wording per the registry `pricing`/`pricing-short` rows.

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 5 | "SimpleScheduleAI uses flat managed-service pricing ($1,000-$1,500/month...)" | TOKEN:pricing-short | "SimpleScheduleAI uses a flat facility license ($1,000-$1,500/month...)" | Direct application of the facility-license reframe. |
| H2 pricing-models body | "Managed service pricing: A managed service (like SimpleScheduleAI) includes scheduling software where the AI builds the schedule and our scheduling team checks it..." | TOKEN:pricing + TOKEN:triad | "Flat facility license: A flat facility license (like SimpleScheduleAI's) includes scheduling software where the AI builds the schedule and 21 automated rule checks validate every draft, plus a guided setup session..." | Category renamed from "Managed service pricing" to "Flat facility license" (bold label). "implementation" changed to "setup" for consistency with guided-setup framing. |
| Cost bullet, 25-bed section | "SimpleScheduleAI (managed service): ... setup is included in the managed service" | TOKEN:pricing-short | "SimpleScheduleAI (flat facility license): ... setup is included in the license" | Direct application. |
| "How SimpleScheduleAI Is Priced" body | "SimpleScheduleAI is an AI-native nurse scheduling service... No IT integration required. Setup takes 3-5 business days via Excel roster upload." | TOKEN:self-label + TOKEN:no-it + TOKEN:onboarding | "AI-native nurse scheduling software... No installation or IT integration required. Setup takes 3-5 business days via Excel roster upload and a guided setup session." | Combined 3 tokens. |
| Same section | "Pricing is flat by roster size..." | TOKEN:pricing | "Pricing is a flat facility license by roster size..." | Direct application of facility-license reframe (task-specific instruction). |
| Same section | "...it is a purpose-built managed scheduling service for Texas" | TOKEN:delivery-model-binary | "...it is purpose-built nurse scheduling software for Texas" | Noun swap. |
| What to Do item 5 | "compare a flat $1,000-$1,500/month managed cost..." | TOKEN:pricing-short | "compare a flat $1,000-$1,500/month facility license..." | Direct application. |
| CTA block | "No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:no-it + TOKEN:triad | "No installation, no integration project, no IT department required. The AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Direct token application (same canonical CTA line used across the batch). |
| FAQ 2 (free software) | "SimpleScheduleAI is a paid AI-native nurse scheduling service... but its flat pricing..." | TOKEN:self-label + TOKEN:pricing-short | "SimpleScheduleAI is paid AI-native nurse scheduling software... but its flat facility-license pricing..." | Combined tokens + facility-license reframe. |
| FAQ 4 (cheapest tool) | "SimpleScheduleAI is an AI-native nurse scheduling service at a flat $1,000-$1,500/month..." | TOKEN:self-label + TOKEN:pricing-short | "SimpleScheduleAI is AI-native nurse scheduling software at a flat facility license of $1,000-$1,500/month..." | Combined tokens. |

**Post 2 counts:** Token hits: 12 (`self-label` x3, `pricing`/`pricing-short` x6, `no-it` x2, `triad` x1, `onboarding` x1 — several rows blend 2 tokens, counted once each per blended instance). Judgment calls: 0 (this post was almost entirely direct-token, consistent with its narrow pricing focus). Gaps: 0. Premise-collapse: 0 (pricing content is a straightforward numeric/label reframe, not an argument built on the service-vs-software binary).

**Framing decision (facility-license reframe):** every "managed service" pricing reference converted to "flat facility license" per the registry `pricing`/`pricing-short` rows and the task's explicit instruction. The canonical numbers ($1,000/$1,500, no per-nurse fees, no setup fees) were left byte-identical — only the delivery-model label changed, never the figures.

---

## Post 3: nurse-scheduling-software-small-hospital.md

Source hash: `3c1a5eeaed72843d21a73f1606166fb589a84bbb`.

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 5 | "It is a platform or service built for the 20-bed hospital from the beginning." | JUDGMENT | "It is software built for the 20-bed hospital from the beginning." | Simplified the "platform or service" hedge to "software" now that SSAI's self-label is software; no information lost since the sentence's point (purpose-built, not scaled-down) survives. |
| H2 body ("Fast setup") | "Going live in 3 to 5 days via a straightforward roster upload is achievable." | TOKEN:onboarding | "Going live in 3 to 5 days via a straightforward roster upload plus a guided setup session is achievable." | Added guided setup session per no-it rule (avoid implying zero-touch setup). |
| H2 "How SimpleScheduleAI Is Built" | "SimpleScheduleAI is an AI-native nurse scheduling service... the AI builds the schedule, our scheduling team checks it..." | TOKEN:self-label + TOKEN:triad | "AI-native nurse scheduling software... the AI builds the schedule, 21 automated rule checks validate every draft..." | Direct tokens. |
| Same section | "Setup starts with an Excel upload... No IT integration, no EHR connection, no custom configuration project. The service is operational in 3 to 5 business days." | TOKEN:onboarding + TOKEN:no-it | "Setup starts with an Excel upload... and a guided setup session that maps your unit rules once. No installation, no EHR connection, no ongoing configuration project. The software is operational in 3 to 5 business days." | Combined tokens; "no custom configuration project" changed to "no ongoing configuration project" since a one-time guided session does occur. |
| CTA block | "No IT team needed." | TOKEN:no-it | "No installation, no IT department required." | Direct token. |
| FAQ 3 | "SimpleScheduleAI onboards... in 3 to 5 business days... The speed is possible because the service is managed: the specialist handles configuration..." | TOKEN:onboarding + TOKEN:delivery-model-binary | "...via Excel roster upload and a guided setup session. There is no IT setup and no EHR integration. The speed is possible because the software is built for this scale: the guided setup handles configuration up front..." | Full-sentence rewrite; "the service is managed: the specialist handles configuration" (implies an ongoing external team) replaced with the one-time guided-setup framing. |

**Post 3 counts:** Token hits: 8 (`self-label` x1, `triad` x1, `onboarding` x3, `no-it` x3). Judgment calls: 1 (the "platform or service" KT bullet simplification). Gaps: 0. Premise-collapse: 0 (the post's thesis — enterprise software doesn't fit a 20-bed hospital — is mode-agnostic and unaffected by the service/software label).

---

## Post 4: nurse-staffing-ratios-critical-access-hospital.md

Source hash: `2beee0193597527ef21d44191443e0d297faf5ab`. Mostly regulatory/factual content
(CMS, state ratio law, Aiken 2002 study) kept byte-identical per brief; only the one
SSAI-product H2 needed conversion. The `<!-- facts-ok -->` escape line on the 485.631/485.635
sentence was preserved exactly (confirmed zero diff on that line).

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| H2 "How Does SimpleScheduleAI Help" | "SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve. We build each facility's staffing plan into the scheduling logic..." | TOKEN:self-label + TOKEN:triad + TOKEN:guided-setup | "AI-native nurse scheduling software: the AI builds the schedule, 21 automated rule checks validate every draft, you approve. Your facility's staffing plan is built into the scheduling logic through a guided setup session..." | Combined 3 tokens; "We build" (first-person capability claim on staffing-plan mapping) recast as a guided setup session per `no-it` rule (system-maintains guardrail: the automated rule checks validate drafts, they don't "build" the plan — a guided setup session is the honest mechanism). |
| Same section | "...and we build the schedule that meets it." | JUDGMENT | "...and the software builds the schedule that meets it." | "We build" retired to generic software subject per `system-maintains` token guidance (the honest product-mode form). |
| CTA block | "See how SimpleScheduleAI builds your committee-approved staffing plan into every draft... We build the schedule, you approve it." | TOKEN:triad-adjacent | "...The AI builds the schedule, you approve it." | Noun swap ("we" → "the AI") consistent with the rest of the batch's `triad` token application. |

**Post 4 counts:** Token hits: 5 (`self-label` x1, `triad` x2, `guided-setup` x1, `system-maintains`-guided x1). Judgment calls: 1. Gaps: 0. Premise-collapse: 0. Regulatory content (42 CFR 482.23/485.631/485.635, California/Oregon/Massachusetts/New York ratio law, Texas HSC 257.004, Aiken 2002/AHRQ, ANA staffing position) left completely untouched — confirmed via diff, zero changes outside the one SSAI H2 and its two CTA echoes.

---

## Post 5: nursegrid-alternatives.md

Source hash: `4e8d62e74dc4e127f5f84715afb3c4f1afc17e79`. Comparison/buyer's-guide post; SSAI's own
profile section and comparison-table rows needed conversion, but competitor quotes, ratings,
and Sources section were left byte-identical.

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 5 | "...run a compliance-focused service or platform..." | JUDGMENT | "...run a compliance-focused guided-setup software or self-serve platform..." | Named both sides of the hybrid option explicitly. |
| KT bullet 6 | "SimpleScheduleAI is the managed-service option: ...our scheduling team checks and maintains it..." | TOKEN:delivery-model-binary + TOKEN:team-reference | "SimpleScheduleAI is the guided-setup option: ...21 automated rule checks validate and maintain every draft..." | Direct tokens. |
| Body (profile intro) | "SimpleScheduleAI is the managed-service option when the goal is removing the scheduling work..." | TOKEN:delivery-model-binary | "SimpleScheduleAI is the guided-setup option when the goal is removing the scheduling work..." | Direct token. |
| Comparison table, SimpleScheduleAI "Public Ratings" cell | "New service; no public reviews yet" | JUDGMENT | "New software; no public reviews yet" | Noun swap, consistent with self-label. |
| Image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | TOKEN:self-label | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text is positioning-bearing per registry rule 3; converted directly. |
| Profile #1 body | "SimpleScheduleAI is a new service... It is a managed nurse scheduling software service built specifically... while a scheduling specialist handles setup from an Excel roster upload, checks each draft, and maintains the system..." | TOKEN:self-label + TOKEN:delivery-model-binary + TOKEN:triad | "SimpleScheduleAI is new software... It is nurse scheduling software built specifically for Critical Access Hospitals in Texas, set up in a single guided session rather than configured by the manager over months... a guided setup session maps unit rules once, the AI builds draft schedules each cycle, and 21 automated rule checks validate and maintain every draft..." | Full-paragraph rewrite; "a scheduling specialist handles setup... checks each draft, and maintains the system" (implies an ongoing human team) replaced per `no-it`/`team-reference` tokens. |
| Same profile | "The service implements the hospital's rules, maintains them as staff changes occur..." | JUDGMENT | "The software applies the hospital's rules automatically after the guided setup session, and updates them when policies change." | "The service implements/maintains" (implies ongoing human labor) recast as automation-after-setup. |
| Same profile | "See how the managed service works... in the live simulator" | TOKEN:delivery-model-binary + JUDGMENT | "See how the guided-setup software works... in the interactive simulator" | "live simulator" also corrected to "interactive simulator" per founder rule (never "live demo"), caught in this same pass even though not flagged by the leftover-sweep regex. |
| Key advantages bullet | "Excel-based roster upload means the transition..." | TOKEN:onboarding | "Excel-based roster upload plus a guided setup session means the transition..." | Added guided-setup session per no-it rule. |
| Key limitations bullet | "Managed service model means less real-time manager control than a self-serve tool; mid-week changes route through the service rather than being edited instantly" | TOKEN:delivery-model-binary | "Fewer real-time, in-app manual edit controls than a self-serve tool; mid-week changes route through the system's callout and swap workflow rather than being freely edited by the manager" | Rewrote to avoid "the service" (implies a human team) as the routing mechanism; named the actual workflow (callout/swap system) instead. |
| Ratings line | "New service; no public G2 or Capterra listing yet." | JUDGMENT | "New software; no public G2 or Capterra listing yet." | Noun swap. |
| Profile #2 (ShiftWizard) "Best for" | "...where direct platform control is preferred over a managed service." | TOKEN:delivery-model-binary | "...where direct platform control is preferred over guided-setup software." | Noun swap (competitor-profile framing referencing SSAI's category, not ShiftWizard itself). |
| "How SimpleScheduleAI Compares" intro | "SimpleScheduleAI is an AI-native nurse scheduling service where a specialist handles manager-side setup, rule maintenance, draft generation, and compliance documentation." | TOKEN:self-label + TOKEN:delivery-model-binary | "SimpleScheduleAI is AI-native nurse scheduling software set up in a single guided session that then handles manager-side rule application, draft generation, and compliance documentation automatically." | Full-sentence rewrite; "a specialist handles... rule maintenance" (ongoing human team) replaced with one-time guided session + automation. |
| Comparison table, "Configuration maintenance" row | "Service responsibility" | TOKEN:delivery-model-binary | "Handled by the software after one guided session" | Table-cell reframe consistent with dry-run's "SSAI rows/cells reframed as software capabilities" instruction. |
| Body after table | "SimpleScheduleAI covers those functions and removes the construction work, but it has no nurse-facing app..." | JUDGMENT | "...removes the construction work after a single guided setup session, but it has no nurse-facing app..." | Added the guided-setup qualifier per no-it rule. |
| Same para | "...adding a compliance-focused service for scheduling management, is the more realistic path." | TOKEN:delivery-model-binary | "...adding guided-setup software for scheduling management, is the more realistic path." | Noun swap. |
| CTA block subtitle | "Setup takes 3-5 days from your Excel roster." | TOKEN:onboarding | "Setup takes 3-5 days from your Excel roster and a guided setup session." | Added guided-setup session per no-it rule. |
| FAQ 4 | "...should verify this directly with the vendor or use a compliance-capable service." | JUDGMENT | "...or use guided-setup software with that capability built in." | Noun swap. |
| FAQ 5 (Q + A) | "Does switching from NurseGrid to a managed service require IT support?... The specialist handles the full setup from the roster file..." | TOKEN:delivery-model-binary + TOKEN:onboarding | "Does switching from NurseGrid to guided-setup software require IT support?... via Excel roster upload and a guided setup session... The guided setup session handles the full configuration from the roster file..." | Q+A rewrite; "the specialist handles" (human-team framing) replaced with "the guided setup session handles" (product-mode mechanism, no team implied). |

**Post 5 counts:** Token hits: 15 (`self-label` x3, `delivery-model-binary` x8, `triad` x2, `onboarding` x2 — some blended). Judgment calls: 8. Gaps: 0. Premise-collapse: 0 (this post's core thesis — NurseGrid's manager-app gap vs. SSAI's manager-side coverage — survives the mode swap; only SSAI's own self-description needed rewriting, not the comparison's architecture). Competitor content (NurseGrid, ShiftWizard, TCP/Aladtec, Deputy, Homebase, When I Work quotes, ratings, Capterra/G2 figures, Sources section) confirmed byte-identical via diff.

---

## Post 6: nursing-scheduling-software-ai.md

Source hash: `a2cb211075e139c44369714598e34ba4d894a12e`.

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 5 | "A managed AI scheduling service is faster to implement..." | TOKEN:delivery-model-binary | "Guided-setup AI scheduling software is faster to implement..." | Direct token. |
| Limitations section | "AI scheduling learns facility-specific rules and constraints during configuration." | TOKEN:guided-setup | "...during a guided setup session." | Direct token. |
| Comparison table header | "AI-assisted (managed)" | JUDGMENT | "AI-assisted (guided setup)" | Table header category label, converted directly (not a positioning claim, per registry rule 3 caution). |
| H2 "How Does SimpleScheduleAI Use AI" body | "SimpleScheduleAI is an AI-native nurse scheduling service, not a self-serve AI tool. A scheduling specialist handles the initial configuration and ongoing calibration; the nurse manager does not interact with the AI directly." | TOKEN:self-label + TOKEN:no-it | "AI-native nurse scheduling software, not a self-serve AI tool the nurse manager configures from scratch. A guided setup session handles the initial configuration, and 21 automated rule checks maintain and calibrate it going forward; the nurse manager does not interact with the AI directly." | "A scheduling specialist handles... ongoing calibration" (implies a recurring human team) replaced with the guided-setup + automated-rule-checks framing. |
| Our Take box | "...the version worth buying is the one delivered as a service, not another login to learn." | TOKEN:delivery-model-binary | "...the version worth buying is the one set up in a single guided session, not another login to learn." | Rewritten to avoid "delivered as a service" (service-fulfillment framing). |
| What to Do item 4 | "is this a tool my manager has to learn and run, or a service that delivers reviewed drafts?" | TOKEN:delivery-model-binary | "is this a tool my manager has to learn and run every cycle, or software set up once in a guided session that then runs on its own?" | Full-clause rewrite of the binary question. |
| CTA block | "Flat monthly pricing, no IT setup." | TOKEN:no-it | "Flat monthly pricing, no installation, no IT department required." | Direct token. |
| FAQ 5 (Q + A) | "Not with a managed service model... Enterprise AI scheduling platforms require IT infrastructure... self-operated AI tools..." | TOKEN:delivery-model-binary + TOKEN:onboarding | "Not with guided-setup software... onboards via Excel roster upload and a guided setup session... self-configured AI tools..." | Q+A rewrite; "self-operated" corrected to "self-configured" for consistency with the batch's delivery-model-binary vocabulary. |
| Methodology note | "AI capabilities described reflect the SimpleScheduleAI managed service as currently delivered..." | JUDGMENT | "AI capabilities described reflect SimpleScheduleAI as currently delivered..." | Noun dropped rather than replaced (methodology notes are not a positioning claim; simplest accurate phrasing). |

**Post 6 counts:** Token hits: 6 (`delivery-model-binary` x4, `guided-setup` x1, `no-it` x1). Judgment calls: 3 (table header, methodology-note trim, "self-operated"→"self-configured" consistency edit). Gaps: 0. Premise-collapse: 0 (the post's AI-vs-manual thesis is unaffected; only SSAI's own delivery-model description needed conversion). The interview-based methodology note's "30+ nurse managers" figure is factual/out-of-scope and was left untouched.

---

## Post 7: onshift-alternatives.md

Source hash: `93e423bcfce15557f58d0b1220eb86ebc89158a8`. Same pattern as Post 5 (comparison/buyer's-guide); competitor content (OnShift, Aladtec, SmartLinx, QGenda, NurseGrid Manager, UKG quotes, ratings, Sources) confirmed byte-identical via diff.

| Location | Original | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Body (intro summary) | "SimpleScheduleAI is the managed-service option when the goal is removing the scheduling work entirely..." | TOKEN:delivery-model-binary | "SimpleScheduleAI is the guided-setup option when the goal is removing the scheduling work entirely..." | Direct token. |
| Comparison table, SimpleScheduleAI "Public Ratings" cell | "New service; no public reviews yet" | JUDGMENT | "New software; no public reviews yet" | Noun swap. |
| Image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | TOKEN:self-label | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Direct token, positioning-bearing alt text. |
| Profile #1 body | "SimpleScheduleAI is a new service... It is a managed nurse scheduling service built specifically... SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a scheduling specialist handles setup from an Excel roster upload, checks each draft, and maintains the system..." | TOKEN:self-label + TOKEN:delivery-model-binary + TOKEN:triad | "SimpleScheduleAI is new software... It is nurse scheduling software built specifically for Critical Access Hospitals in Texas, set up once through a guided setup session rather than configured by the nurse manager on an ongoing basis... SimpleScheduleAI requires no ongoing configuration work from the nurse manager after that session: the AI builds draft schedules each cycle, and 21 automated rule checks validate and maintain every draft..." | Full-paragraph rewrite; "a scheduling specialist handles setup... maintains the system" (implies a recurring human team) replaced with guided-setup + automated validation, same pattern as Post 5. |
| Same profile | "SimpleScheduleAI moves the construction and maintenance work to the service... See how the managed service works..." | TOKEN:delivery-model-binary | "SimpleScheduleAI moves the construction and maintenance work to the software after the guided setup session... See how it works..." | Noun swap + added guided-setup qualifier. |
| Key advantages bullet | "Managed service model means no implementation burden and no ongoing IT dependency" | TOKEN:no-it | "Guided-setup model means no installation, no integration project, and no ongoing IT dependency" | Direct token (name what's absent). |
| Key limitations bullet | "Managed service model means less direct manager control than OnShift's self-serve platform; schedule changes route through the service rather than being edited in real time by the manager" | TOKEN:delivery-model-binary | "Fewer real-time, in-app manual edit controls than OnShift's self-serve platform; schedule changes route through the system's callout and swap workflow rather than being edited in real time by the manager" | Same rewrite pattern as Post 5's equivalent limitation bullet: named the actual workflow instead of "the service" as an implied human team. |
| Verdict | "The managed service model eliminates the configuration overhead..." | TOKEN:delivery-model-binary | "The guided-setup model eliminates the ongoing configuration overhead..." | Noun swap + "ongoing" qualifier. |
| Ratings line | "New service; no public G2 or Capterra listing yet." | JUDGMENT | "New software; no public G2 or Capterra listing yet." | Noun swap. |
| "How SimpleScheduleAI Compares to OnShift" intro | "SimpleScheduleAI is an AI-native nurse scheduling service designed for Critical Access Hospitals, where acute care callout dynamics..." | TOKEN:self-label + TOKEN:guided-setup | "SimpleScheduleAI is AI-native nurse scheduling software designed for Critical Access Hospitals, set up once through a guided setup session, where acute care callout dynamics..." | Combined tokens. |
| Comparison table, "Operating model" row | "Managed service, specialist runs it" | TOKEN:delivery-model-binary | "Guided-setup software, runs itself after one session" | Table-cell reframe as a software capability, consistent with Post 5/2's dry-run pattern. |
| Closing cross-link paragraph | "...how AI nurse scheduling works as a managed service, and the specific compliance requirements..." | TOKEN:delivery-model-binary | "...how AI nurse scheduling works, and the specific compliance requirements..." | Simplified rather than re-deriving an equally awkward product-mode hedge (same pattern as dry-run Post 3's KT bullet 2 treatment). |
| FAQ 4 | "Compare on total operating model, not list price alone, because managed service and self-serve software costs are not directly comparable." | TOKEN:delivery-model-binary | "...because guided-setup software and self-serve software costs are not directly comparable." | Noun swap. |

**Post 7 counts:** Token hits: 13 (`self-label` x2, `delivery-model-binary` x9, `triad` x1, `no-it` x1, `guided-setup` x1 — some blended). Judgment calls: 4 (table Ratings-cell noun swaps x2, closing cross-link simplification, and the general noun-swap cleanups counted as JUDGMENT where no exact token phrase matched verbatim). Gaps: 0. Premise-collapse: 0 (OnShift's LTC-vs-acute-care thesis is unaffected by SSAI's delivery-model label; only SSAI's own profile, table cells, and verdict needed conversion).

---

## Batch-level summary

| Post | Token hits | Judgment calls | Gaps | Premise-collapse |
| --- | --- | --- | --- | --- |
| nurse-scheduling-no-it-department-rural-hospital.md | 9 | 11 | 0 | 1 (H2 + anchor) |
| nurse-scheduling-software-pricing.md | 12 | 0 | 0 | 0 |
| nurse-scheduling-software-small-hospital.md | 8 | 1 | 0 | 0 |
| nurse-staffing-ratios-critical-access-hospital.md | 5 | 1 | 0 | 0 |
| nursegrid-alternatives.md | 15 | 8 | 0 | 0 |
| nursing-scheduling-software-ai.md | 6 | 3 | 0 | 0 |
| onshift-alternatives.md | 13 | 4 | 0 | 0 |
| **Total** | **68** | **28** | **0** | **1** |

No new registry gaps surfaced in this batch — every recurring construction (the
self-configured/guided-setup binary, "the service handles/maintains" → guided-setup +
automated-rule-checks, "delivered as a service" → automation framing) was already covered by
the `delivery-model-binary`, `guided-setup`, `no-it`, `triad`, and `team-reference` rows added
in the 2026-07-04 dry-run. This batch was lighter on premise-collapse than the dry-run's
vs-class posts (1 vs. 8-9 per post) because only 2 of the 7 posts (nursegrid-alternatives,
onshift-alternatives) are comparison/buyer's-guide posts, and in both cases SSAI's own
profile/table-cell language was the only load-bearing "managed service" usage — the posts'
outer theses (NurseGrid's manager-app gap; OnShift's LTC-vs-acute-care mismatch) never
depended on the service-vs-software binary.

## Title/Slug recommendations

None of the 7 posts in this batch have "managed service" in the title or slug (Pass-2 rule 1
does not apply). No retitle or 301 needed for this batch.

## H2 anchor changes (Pass-2 rule 5 — link-graph check)

Only one H2 rename in this batch changed a TOC anchor:

- `nurse-scheduling-no-it-department-rural-hospital.md`: `#how-does-a-managed-scheduling-service-differ-from-scheduling-software` → `#how-does-guided-setup-scheduling-software-differ-from-self-configured-software`.
  Checked: no other post in `src/data/post/` or `src/data/article/` links to this specific
  anchor fragment (only to the post's root URL), so no cross-link break on migration day.

## Gates

- **Facts scan (`checkFacts`):** 0 violations across all 7 staged outputs (verified via
  `node --input-type=module` importing `scripts/lib/facts-rules.mjs`, run twice — once
  accidentally scoped to the whole `migration-staging/post/` directory including other
  batches' outputs, then correctly re-scoped to exactly these 7 filenames. Both runs: 0.)
- **Leftover sweep** (`we build|we deliver|we configure|we check|we send|our team|our
  scheduling team|log the callout with us|Thursday delivery|done for you|managed
  service|managed near|bald "No IT."|live demo`), scoped to exactly the 7 target files: every
  hit is the sanctioned "Book a call with our team" CTA text link (identical in both
  positioning modes per `facts-dossier.md#product-truths` CTA pattern and the registry's
  `cta-secondary` row). No bald "No IT.", no "managed service" as an SSAI self-label, no
  "live demo" residue, no first-person "we build/deliver/configure/check" capability claims
  survived in any of the 7 outputs. All intentional-logged, none required a fix.
- **Diff reconciliation:** every row above was verified against a full `diff` of source vs.
  staged output for all 7 files (not from self-report). Two files
  (`nurse-scheduling-no-it-department-rural-hospital.md`,
  `nurse-scheduling-software-pricing.md`) silently failed to write on the first attempt
  despite the Write tool reporting success — caught by a post-hoc `ls` verification and a
  scoped grep returning "no such file," not by the tool's own success signal. Both were
  rewritten and reconfirmed present before the gates were re-run. This is logged as a process
  finding, not a content-conversion issue.

## Escalations

None requiring founder input. No new registry rows needed (all recurring constructions in
this batch were already covered by tokens added in the 2026-07-04 dry-run). No vs-class
retitle candidates in this batch.
