# Migration Staging Ledger — Batch S2 (SCRIPT-TIER)

Service-mode to product-mode conversion, staging only. Sources untouched in `src/data/post/`.
Outputs in `docs/seo/migration-staging/post/`. Per `docs/seo/positioning-registry.md` mapping
table + authoring rules + dry-run lessons 1-10, `docs/seo/facts-dossier.md#product-truths`,
and `docs/seo/migration-staging/CONVERTER-BRIEF.md`. Converted 2026-07-05.

Action key: `TOKEN:<id>` = registry row applied · `JUDGMENT` = positioning-bearing phrase
converted with no exact registry row · `GAP` = recurring construction deserving a new
registry row · `PREMISE-COLLAPSE` = argument structurally depends on the service-vs-software
distinction. Every row below is reconciled against the FULL file diff (including cosmetic
hunks, lesson 8); diff line counts per post are stated in each counts line.

Batch note (per task brief): the CMS/HIPAA/compliance posts carry first-person "we [verb]"
SSAI sections; all were recast to system-subject per the round-2 compliance dry-run pattern
("we document" -> "the system documents"; "we alert" -> "an alert fires") without inventing
capabilities. Two credential-records claims are escalated (see Escalations).

---

## Post 1: float-pool-nursing-small-hospitals.md (source-hash 28a9a4671b8f918bc5726e5e51e468b963877ea1)

Premise triage (title + H2s + table headers + FAQ questions, grep `managed service|service, not software|run(s)? itself`):
no hit anywhere. Positioning is bounded in the "How Does SimpleScheduleAI Help Small Hospitals
Cover Gaps?" H2 + CTA block + closing bio. The models comparison table (float pool / per-diem
bench / cross-training / shared staffing) is operational-educational, untouched. The internal
link anchor "nurse scheduling with no IT department" describes the HOSPITAL's condition (a
topic slug), not an SSAI "No IT." claim — left unchanged. No premise collapse.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| SSAI H2, opening sentences | "SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve. We do not try to give a small hospital a float pool it cannot staff." | TOKEN:self-label + TOKEN:triad + JUDGMENT | "SimpleScheduleAI is AI-native nurse scheduling software: the AI builds the schedule, 21 automated rule checks validate every draft, you approve. It does not try to give a small hospital a float pool it cannot staff." | Both tokens direct; "We do not try" recast to system subject ("It does not try"). |
| Same H2, honest-limitation para | "We are direct about that during onboarding rather than promising a bench we cannot fill." | TOKEN:guided-setup + JUDGMENT | "That is said plainly during the guided setup session rather than promising a bench that cannot be filled." | Round-2 Post 5 pattern (first-person -> passive + canonical guided-setup string). |
| Same H2, closing para | "rank a callout shortlist live in the [interactive simulator](/simulator)" | JUDGMENT (retired-demo-wording adjacent) | "rank a callout shortlist in the [interactive simulator](/simulator)" | "Live" trimmed, consistent with rounds 1-2 treatment of residual live-demo language. |
| CTA block subtitle | "We build the schedule, you approve it." | TOKEN:triad (adjacent) | "The AI builds the schedule, you approve it." | First-person builder claim recast to the triad subject. |
| Closing bio line | "an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:self-label | "AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Direct token. |
| Frontmatter (title/excerpt/tags), KT bullets, TOC, all operational H2 bodies, comparison table, Our Take, What-to-do 1-4, FAQs, Sources | unchanged | unchanged | unchanged | Not positioning-bearing; regulatory content (485.631, NSI, RHIhub, AONL) byte-identical. "Book a call with our team" retained (cta-secondary token, identical in both modes). |

**Post 1 counts:** diff = 5 hunks, all logged. Token hits: 5 (`self-label` x2, `triad` x2 [1 adjacent], `guided-setup` x1). Judgment calls: 3 ("We do not try" recast, "We are direct" recast, "live" trim). Gaps: 0. Premise-collapse: 0.

---

## Post 2: free-nurse-scheduling-software.md (source-hash 3cdf256711117a18a1bf9bd33f3d6b50b4c995a6)

Premise triage: no H2, table header, or FAQ question names "managed service" or a
service-vs-software binary. The free-tool gap table and all NurseGrid/Connecteam/Sling
product-page descriptions are competitor-factual, untouched. Positioning concentrated in the
"How Does SimpleScheduleAI Help a Critical Access Hospital?" H2, the CTA, one FAQ pricing
sentence, and the bio. No premise collapse.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| SSAI H2, opening sentence | "SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: the AI builds the schedule, our scheduling team checks it, and you approve." | TOKEN:triad + TOKEN:guided-setup + JUDGMENT | "SimpleScheduleAI is nurse scheduling software set up through a guided setup session: the AI builds the schedule, 21 automated rule checks validate every draft, and you approve." | Exact instance of round-2 gap class 3 (meta-description of the delivery mechanism, "software we build and operate ourselves"); resolved with the same guided-setup + triad combination round 2 used. |
| Same H2, para 2 | "We turn that into three schedule drafts, balanced, fairness-optimized, and cost-optimized" | JUDGMENT | "The AI turns that into three schedule drafts, balanced, fairness-optimized, and cost-optimized" | First-person -> AI subject; the 3-mode generation is a real dossier-listed feature, no invention. |
| Same para | "rank that callout shortlist live in the [interactive simulator](/simulator)" | JUDGMENT (retired-demo-wording adjacent) | "rank that callout shortlist in the [interactive simulator](/simulator)" | "Live" trimmed. |
| Same H2, honest-limitation para | "It is a management-side service for the nurse manager, not a self-service portal for staff." | JUDGMENT | "It is management-side software for the nurse manager, not a self-service portal for staff." | Noun swap; the honest limitation (not a staff-facing portal) survives unchanged in product mode. |
| CTA block subtitle | "with overtime and callouts handled for you" | TOKEN:value-prop (adjacent) + JUDGMENT | "with overtime tracking and callout coverage built in" | "Handled for you" is the novel-service-promise pattern; recast to the value-prop token's product-mode "built in" framing. |
| FAQ "How much does paid nurse scheduling software cost..." | "SimpleScheduleAI uses flat pricing instead: $1,000 per month for up to 20 nurses and $1,500 per month for 21 to 40, with no per-seat math." | TOKEN:pricing (adjacent) | "SimpleScheduleAI uses a flat facility license instead: $1,000 per month for up to 20 nurses and $1,500 per month for 21 to 40, with no per-seat math." | Product-mode "flat facility license" framing per the pricing row; numbers untouched (facts-dossier canonical values). |
| Closing bio line | "an AI-native nurse scheduling service built for..." | TOKEN:self-label | "AI-native nurse scheduling software built for..." | Direct token. |
| Frontmatter, KT bullets, TOC, all free-tool H2s and gap table, Our Take, What-to-do 1-5, FAQs 1-3 + 5, Sources | unchanged | unchanged | unchanged | Competitor/product-page facts byte-identical; What-to-do #5 already uses "AI-native option" (mode-neutral). |

**Post 2 counts:** diff = 6 hunks (7 replacements; two share one line), all logged. Token hits: 5 (`triad` x1, `guided-setup` x1, `value-prop` x1 adjacent, `pricing` x1 adjacent, `self-label` x1). Judgment calls: 5. Gaps: 0 (the meta-description construction was round-2 gap class 3, already documented there; no NEW gap class). Premise-collapse: 0.

---

## Post 3: healthcare-scheduling-crisis.md (source-hash a4d314c8f4b0e810b90c1f823c5b1db24fb01ffa)

Premise triage: the closest call of the batch. H2 "Does Buying Scheduling Software Fix These
Problems?" argues that purchased scheduling software often SHIFTS the burden (configuration,
reliability, support) — but its argument is about generic/competitor software-adoption failure
backed by verbatim reviewer quotes, not an SSAI service-vs-software claim, and its resolution
("a mismatch between the tools available and the operational reality of a 25-bed rural
hospital") survives product mode intact because guided-setup software answers the
configuration-burden objection directly. Section left byte-identical. The one direct
service-vs-software assertion ("It is not a self-serve software tool") lives inside the SSAI H2
and was converted (row below). Standalone honest-limitation and What-to-do #5 name "managed
service" — bounded self-description, token-converted. NOT premise-collapse.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| SSAI H2, opening | "SimpleScheduleAI is an AI-native, human-verified scheduling service built for Critical Access Hospitals. You keep your Excel roster; our AI handles the scheduling logic." | TOKEN:self-label + TOKEN:guided-setup + JUDGMENT | "SimpleScheduleAI is AI-native nurse scheduling software, set up through a guided setup session, built for Critical Access Hospitals. You keep your Excel roster; the AI handles the scheduling logic." | "Human-verified" (ongoing human-QA labor claim) dropped per round-2 Post 3 precedent; "our AI" -> "the AI". |
| Same H2, para 2 | "It is not a self-serve software tool. A scheduling specialist checks every draft and handles setup and ongoing support, which means there is no learning curve for your team." | TOKEN:delivery-model-binary (adjacent) + TOKEN:guided-setup + TOKEN:triad + TOKEN:faq-accounts (adjacent) + JUDGMENT | "It is not a self-configured platform the hospital integrates alone. A guided setup session maps your unit rules with you, once, and 21 automated rule checks validate every draft; there is no nurse-facing app for your staff to learn." | External-specialist framing removed per the no-it founder rule; "no learning curve for your team" (zero-adjustment overclaim in product mode, where the manager DOES work in the software) narrowed to the honest faq-accounts claim (no nurse-facing app). |
| Same H2, honest-limitation para | "a staffing mix we have not calibrated before, the initial setup period may take longer. We surface this during onboarding." | TOKEN:guided-setup + JUDGMENT | "a staffing mix the system has not been calibrated for before, the initial setup period may take longer. This is surfaced during the guided setup session." | Two "we [verb]" recasts to system-subject/passive (round-2 Post 4 pattern). |
| Standalone honest-limitation (after stat cards) | "a managed scheduling service is not the right fit for facilities over 50 beds..." | TOKEN:delivery-model-binary | "guided-setup scheduling software is not the right fit for facilities over 50 beds..." | Direct token; the rest of the limitation (cell-by-cell control preference) survives honestly — SSAI still generates drafts rather than manual cell-editing. |
| What to Do This Week, item 5 | "The managed service removes the friction points without adding software for your team to learn." | TOKEN:delivery-model-binary + JUDGMENT | "Guided-setup software removes the friction points without adding a nurse-facing app for your staff to learn." | "Without adding software" is internally contradictory once SSAI IS software; narrowed to the honest no-nurse-facing-app claim (faq-accounts framing). |
| Frontmatter, $26K math, all five friction-point H2s, both charts, version-drift graphic, reviewer quotes (Courtney D. / CNO Capterra), "Does Buying Scheduling Software Fix These Problems?" H2 body, Our Take, What-to-do 1-4, FAQs, Sources, bio | unchanged | unchanged | unchanged | Reviewer quotes and dated stats byte-identical. Bio here has no self-label ("co-founder of SimpleScheduleAI. He serves as...") so no bio edit in this post. "After two months of interviews... we identified" retained: research-voice "we" (the company did the interviews), not a service-capability claim. |

**Post 3 counts:** diff = 5 hunks, all logged. Token hits: 8 (`delivery-model-binary` x3 [1 adjacent], `guided-setup` x3, `self-label` x1, `triad` x1; `faq-accounts` used as framing inside two rows, counted with them). Judgment calls: 5 ("human-verified" drop, specialist-paragraph rewrite, two we-verb recasts, "without adding software" narrowing). Gaps: 0. Premise-collapse: 0 (triage above).

---

## Post 4: hipaa-compliant-nurse-scheduling-software.md (source-hash 401a112e4fd6d755ab9cc602dbb1be300a0c211a)

Premise triage: no H2, table header, or FAQ question names "managed service" or the binary.
The workforce-data-vs-PHI table and the vendor-question table are educational, untouched. All
HIPAA/BAA regulatory content is facts territory, byte-identical. Positioning concentrated in
the "How SimpleScheduleAI Handles HIPAA Compliance" H2 + bio. No premise collapse.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| SSAI H2, para 1 | "The managed service uses [AI nurse scheduling](/ai-nurse-scheduling) that operates on workforce data only" | TOKEN:delivery-model-binary | "The guided-setup software uses [AI nurse scheduling](/ai-nurse-scheduling) and operates on workforce data only" | Token swap; "that"->"and" grammar adjustment within the same hunk (logged per lesson 8). |
| Same para | anchor text "[how the managed service works](/how-it-works)" | TOKEN:delivery-model-binary + anchor-text migration | "[how the software works](/how-it-works)" | Positioning-bearing ANCHOR TEXT converted; link TARGET (/how-it-works) unchanged. Dependency-map entry (lesson 9): /how-it-works page itself converts on migration day. |
| Same H2, para 4 | "Either way, the service is operated for you, so a Texas Critical Access Hospital with [no IT department](/blog/nurse-scheduling-no-it-department-rural-hospital) does not have to stand up new infrastructure or manage a HIPAA posture for the scheduling tool in-house." | TOKEN:no-it + JUDGMENT | "Either way, the software runs in the browser with no installation and no integration project, so a Texas Critical Access Hospital with [no IT department](...) does not have to stand up new infrastructure or manage a HIPAA posture for the scheduling tool in-house." | "Operated for you" (service-promise) removed; no-it token names what is absent (installation/integration), never the bald claim. The "no IT department" anchor describes the hospital's condition, unchanged. |
| Same H2, honest-limitation para | "not in the nurse scheduling managed service" | TOKEN:delivery-model-binary (adjacent) | "not in the nurse scheduling software" | Noun swap. |
| Closing bio line | "an AI-native nurse scheduling service built for..." | TOKEN:self-label | "AI-native nurse scheduling software built for..." | Direct token. |
| Frontmatter, opening scenario, all HIPAA/BAA/PHI H2s and tables, penalty figures, Our Take, What-to-do, CTA block, FAQs, Sources | unchanged | unchanged | unchanged | CTA subtitle already system-subject ("SimpleScheduleAI runs on workforce data only... it will sign a BAA"). Penalty figures/dates byte-identical. |

**Post 4 counts:** diff = 4 hunks (5 replacements; two share para 1's line), all logged. Token hits: 5 (`delivery-model-binary` x3 [1 adjacent], `no-it` x1, `self-label` x1). Judgment calls: 2 ("operated for you" recast; grammar adjustment). Gaps: 0. Premise-collapse: 0. Cross-link dependencies: 1 (anchor-text conversion pointing at /how-it-works, see row 2).

---

## Post 5: how-to-stay-cms-compliant-nurse-scheduling.md (source-hash 224e8409aa0d822d7f08ebadbd3ce70a816448b4)

Premise triage: no H2, table header, or FAQ question names "managed service" or the binary
("How Scheduling Software Affects CMS Compliance?" is mode-neutral and its body already treats
SSAI as generating documentation). "Managed service" appears twice in body prose (Gap 2 fix,
Our Take), both bounded self-descriptions. All §485.635/631/618 regulatory content, the
three-documents framework, and the survey-response checklist are facts territory,
byte-identical. No premise collapse. This is the batch's heaviest "we [verb]"/team-labor post.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Gap 2 fix paragraph | "Most scheduling software requires manual credential updates. A managed service like SimpleScheduleAI maintains credential records as part of the service." | TOKEN:delivery-model-binary + TOKEN:system-maintains | "Most scheduling software requires manual credential updates. Guided-setup software like SimpleScheduleAI maintains the credential records and keeps them current." | System-maintains pattern (software subject, "keeps them current"), NOT attributed to rule checks. ESCALATED: see Escalations — the underlying claim (source and converted) sits close to the NOT-shipped credential/license-expiry tracking feature. |
| Our Take box | "A managed service earns its place here only if it produces that record as a byproduct of building the schedule" | TOKEN:delivery-model-binary | "Guided-setup software earns its place here only if it produces that record as a byproduct of building the schedule" | Direct token. |
| What to Do This Week, item 4 | "Our AI builds your schedule from an Excel roster upload, our scheduling team checks it and attaches the §485.635 documentation to each cycle" | TOKEN:triad + JUDGMENT | "The AI builds your schedule from an Excel roster upload, 21 automated rule checks validate every draft, and the §485.635 documentation is attached to each cycle" | Triad token; the team's attach-verb recast to passive system subject ("is attached"). |
| CTA block subtitle | "Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:pricing-short + TOKEN:triad | "Flat monthly pricing per facility license, no per-nurse fees, no setup fees. The AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Bald "No IT setup" removed per the founder no-it rule (never the bald claim); pricing clause split into the pricing-short product-mode framing (round-2 Post 2/4 precedent); triad direct. |
| FAQ "How does SimpleScheduleAI handle CMS documentation when a nurse's credentials change mid-cycle?" | "the SimpleScheduleAI team updates the credential record in the system" | TOKEN:system-maintains (adjacent) + JUDGMENT | "the credential record is updated in the system" | Team-labor claim recast to passive record-update; the honest historical-preservation sentence after it unchanged. Same escalation as Gap 2 row. |
| Closing bio line | "an AI-native nurse scheduling service built for..." | TOKEN:self-label | "AI-native nurse scheduling software built for..." | Direct token. |
| Frontmatter, KT bullets, all regulatory H2s (§485.635/631/618), three-documents section, gaps 1/3/4, documentation-system components, survey-arrival checklist, software-comparison paragraphs (Deputy/When I Work/NurseGrid Manager/Aladtec), honest limitation ("produces the documentation rather than making staffing decisions for you"), Methodology note, FAQs 1-4, Sources | unchanged | unchanged | unchanged | Competitor characterizations left exactly as sourced (no competitor-inflation). "Rather than making staffing decisions for you" retained: it NEGATES a service promise, honest in both modes. KT bullet 5 and the §485.635-documentation paragraph were already system-subject ("the scheduling system generates...", "SimpleScheduleAI generates this documentation by default"). |

**Post 5 counts:** diff = 6 hunks, all logged. Token hits: 8 (`delivery-model-binary` x2, `system-maintains` x2 [1 adjacent], `triad` x2, `pricing-short` x1, `self-label` x1). Judgment calls: 3 (attach-verb passive recast, team-updates passive recast, No-IT-setup/pricing clause split). Gaps: 0 (the "we/team [verb]" class is round-2 gap class 2, already adjudicated to the migration-day sweep). Premise-collapse: 0. Escalations: 2 (credential-records claims, see below).

---

## Post 6: night-shift-nurse-schedule-coverage.md (source-hash 4ae3f1e6fd3dd5e7c545fcfa5778484a55b82307)

Premise triage: no hit in title, H2s, the rotating-vs-permanent table headers, or FAQ
questions. All CMS (485.618/631/635), NIOSH, and NSI content byte-identical (including the
`<!-- facts-ok -->` marked lines). Positioning bounded in the SSAI H2 + CTA + bio. No collapse.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| SSAI H2, opening | "SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve. We build night coverage constraints directly into the scheduling logic for each facility." | TOKEN:self-label + TOKEN:triad + JUDGMENT | "SimpleScheduleAI is AI-native nurse scheduling software: the AI builds the schedule, 21 automated rule checks validate every draft, you approve. Night coverage constraints are built directly into the scheduling logic for each facility." | Tokens direct; "We build X into Y" -> passive product-mechanism claim (round-2 Post 4 "we build Texas overtime rules into" precedent). |
| Same sentence, next clause | "fairness parameters set during onboarding" | TOKEN:guided-setup | "fairness parameters set during the guided setup session" | Canonical string (round-2 Post 5 exact precedent). |
| Same H2, honest-limitation para | "We are direct about this during onboarding rather than promising a fix we cannot deliver." | TOKEN:guided-setup + JUDGMENT | "This is said plainly during the guided setup session rather than promising a fix that cannot be delivered." | First-person recast + canonical guided-setup string. |
| Same H2, closing para | "watch it build a night-covered week live in the [interactive simulator](/simulator)" | JUDGMENT (retired-demo-wording adjacent) | "watch it build a night-covered week in the [interactive simulator](/simulator)" | "Live" trimmed. |
| CTA block subtitle | "We build the schedule, you approve it." | TOKEN:triad (adjacent) | "The AI builds the schedule, you approve it." | Same as Post 1. |
| Closing bio line | "an AI-native nurse scheduling service built for..." | TOKEN:self-label | "AI-native nurse scheduling software built for..." | Direct token. |
| Frontmatter, KT bullets, TOC, all coverage-requirements/patterns/rotating-vs-permanent H2s and table, "How Do Scheduling Systems Ensure..." H2 (already generic-system subject), Our Take, What-to-do, FAQs, Sources | unchanged | unchanged | unchanged | The four-things list ("A system that manages night coverage well does four things") is already software-subject and mode-neutral. |

**Post 6 counts:** diff = 5 hunks (6 replacements; two share the opening line), all logged. Token hits: 6 (`self-label` x2, `triad` x2 [1 adjacent], `guided-setup` x2). Judgment calls: 3 ("We build X into Y" passive, "We are direct" recast, "live" trim). Gaps: 0. Premise-collapse: 0.

---

## Post 7: nurse-burnout-scheduling-cah.md (source-hash 2c7bef927fd4688f5adfe191aa85114e83014c84)

Premise triage: no hit in title, H2s, controls-table headers, or FAQ questions. ANA/NIOSH/NSI/
AONL content byte-identical. Positioning bounded in the SSAI H2 + CTA + bio. No collapse.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| SSAI H2, opening sentence | "SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve." | TOKEN:self-label + TOKEN:triad | "SimpleScheduleAI is AI-native nurse scheduling software: the AI builds the schedule, 21 automated rule checks validate every draft, you approve." | Direct tokens. |
| Same sentence, next clause | "fairness parameters set during onboarding" | TOKEN:guided-setup | "fairness parameters set during the guided setup session" | Canonical string. |
| Same H2, para 2 | "which you can watch it do live in our [interactive simulator](/simulator)" | JUDGMENT (retired-demo-wording adjacent) | "which you can watch it do in our [interactive simulator](/simulator)" | "Live" trimmed. |
| Same H2, honest-limitation para | "and we say so during onboarding rather than promising a fix we cannot deliver." | TOKEN:guided-setup + JUDGMENT | "and that is said plainly during the guided setup session rather than promising a fix that cannot be delivered." | First-person recast + canonical string. |
| CTA block subtitle | "We build the schedule, you approve it." | TOKEN:triad (adjacent) | "The AI builds the schedule, you approve it." | Same as Posts 1/6. |
| Closing bio line | "an AI-native nurse scheduling service built for..." | TOKEN:self-label | "AI-native nurse scheduling software built for..." | Direct token. |
| "we address it directly in [can nurses trust an AI-generated schedule](/blog/can-nurses-trust-ai-generated-schedule)" | unchanged | unchanged (intentional) | unchanged | Editorial/authorial "we" referring to our published blog coverage, not a service-capability claim; retained and logged as intentional. |
| Frontmatter, KT bullets, all burnout-mechanism H2s, controls table, "What Can the Schedule Not Fix" H2, Our Take, What-to-do, FAQs, Sources | unchanged | unchanged | unchanged | Not positioning-bearing. |

**Post 7 counts:** diff = 5 hunks (6 replacements; two share the opening line), all logged. Token hits: 6 (`self-label` x2, `triad` x2 [1 adjacent], `guided-setup` x2). Judgment calls: 2 ("we say so" recast, "live" trim). Gaps: 0. Premise-collapse: 0.

---

## Batch totals

| Metric | S2 total (7 posts) |
| --- | --- |
| Token hits | 43 (delivery-model-binary 8, self-label 10, triad 10, guided-setup 10, system-maintains 2, pricing/pricing-short 2, no-it 1, value-prop 1 adj; faq-accounts used as framing within 2 rows) |
| Judgment calls | 23 |
| Gaps (new, no token) | 0 — every judgment call landed in a gap class already documented in DECISIONS-R2 (meta-description-of-mechanism; "we [verb] X" first-person-to-system-subject; team-labor recasts) |
| Premise-collapse | 0 |
| H2 renames / TOC anchor changes | 0 |
| Cross-link anchor-text migrations | 1 (hipaa post: "how the managed service works" -> "how the software works", target /how-it-works unchanged; dependency-map entry) |

## Gates (run 2026-07-05 on the 7 staged outputs)

**Facts scan (`checkFacts` via scripts/lib/facts-rules.mjs):** 0 violations on all 7 files.

**Leftover sweep** (grep: we build/we deliver/we configure/we check/we send/our team/scheduling
team/log the callout with us/Thursday delivery/done for you/managed/bald "No IT."/live demo):

| File | Hit | Disposition |
| --- | --- | --- |
| float-pool | "how do we build a float pool... how do we cover a callout" (H2 body) | Intentional: hospital-reader voice inside a rhetorical question; the subject is the hospital, not SSAI. |
| float-pool, free-nurse, healthcare-crisis, hipaa, cms-compliant, night-shift, nurse-burnout | "book a call with our team" (CTA text link and/or What-to-do item; 9 instances total) | Intentional: `cta-secondary` registry token, identical in both modes by design. |
| healthcare-crisis | "unmanaged" ("the sign-up order goes unmanaged") | False positive: substring of the "managed" grep; not a delivery-model use. |
| all 7 | "managed service", "scheduling team", "No IT.", "live demo", "done for you", "Thursday delivery", "log the callout with us", "we deliver/configure/check/send" | Zero hits. |

## Escalations

1. **Credential-records claims in how-to-stay-cms-compliant (2 locations) sit close to a
   NOT-shipped feature.** The source post claims SSAI "maintains credential records as part of
   the service" (Gap 2 fix) and that "the SimpleScheduleAI team updates the credential record
   in the system" (FAQ). Facts-dossier product truths forbid claiming credential/license-expiry
   TRACKING as an SSAI feature. These sentences describe credential-record ROSTER maintenance
   (updating records when the hospital reports a change), not expiry tracking/alerting, so they
   were converted grammatically (system-maintains pattern: "maintains the credential records
   and keeps them current" / "the credential record is updated in the system") without adding
   any tracking/alerting claim. But the line between "maintains credential records" and the
   forbidden "credential tracking" is thin enough that a founder read is warranted — in the
   LIVE service-mode source as well as in this staged copy. Not silently fixed, not silently
   dropped.
2. **healthcare-scheduling-crisis: "no learning curve for your team" (source) is a
   zero-adjustment overclaim in product mode** (the manager does work in the software).
   Narrowed in staging to the faq-accounts-framed honest claim ("no nurse-facing app for your
   staff to learn"). Flagging because the live service-mode source's claim is also strong;
   founder may want the live page reviewed independently of migration.
3. **healthcare-scheduling-crisis CTA subtitle asserts "returning 8 to 10 hours per week to
   clinical leadership."** Untouched (not positioning), but it reads adjacent to a results
   claim for a pre-launch product with no customers; flagged for the no-customers guardrail
   owner to adjudicate. Source and staging both carry it.
4. **Cross-link dependency (lesson 9):** hipaa post's converted anchor "how the software works"
   points at /how-it-works, whose page copy converts on migration day; keep in the slug
   dependency map. No S2 post links to /blog/managed-service-vs-scheduling-software.
5. **Concurrency note:** two stray sub-agents (spawned before the do-it-yourself course
   correction) wrote scratch ledgers (LEDGER-S2-batchA/B.md) and briefly raced on the same
   output paths mid-session. Final on-disk content of all 7 outputs was re-verified after the
   race: headers + source-hashes confirmed, diffs against sources reconciled row-by-row above.
   THIS file (LEDGER-S2.md) is the authoritative S2 ledger.
