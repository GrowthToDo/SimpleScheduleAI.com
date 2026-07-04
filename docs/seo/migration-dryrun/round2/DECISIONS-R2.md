# Migration Dry-Run Round 2 Decision Log

Round 2 tests whether the round-1-upgraded registry (20 tokens, incl. `delivery-model-binary`
and the canonical `guided setup session` string) holds across 5 posts of DIFFERENT natures:
BOFU alternatives (competitor quotes/tables), TOFU glossary, operational MOFU, compliance MOFU,
and a Newsroom article (NewsArticle class). Sources untouched in `src/data/post/` and
`src/data/article/`. Outputs in this directory only. Per `docs/seo/positioning-registry.md`
mapping table + authoring rules, and `docs/seo/facts-dossier.md#product-truths` guardrails.

Action key (same as round 1): `TOKEN:<id>` = exact registry row applied · `JUDGMENT` =
positioning-bearing phrase converted with no exact registry row · `GAP-NO-TOKEN` = a phrase
that is clearly positioning-bearing, recurs, and probably deserves its own registry row but was
hand-converted here · `PREMISE-COLLAPSE` = the section's/post's argument structurally depends on
the service-vs-software distinction and does not survive a token swap.

---

## Post 1: qgenda-alternatives.md (BOFU alternatives, SSAI listed first among 4 alternatives)

Premise triage (title + H2s + table headers + FAQ questions, grep `managed service|service, not software|run(s)? itself`):
no H2 or table header is itself titled "managed service" — SSAI's row/section in the alternatives
list and comparison table use "managed service" as a category label, same shape as round 1's
Post 1 KT bullets. No premise-collapse-level structural dependency found (the post's outer thesis
is "QGenda vs. 4 alternatives," which survives mode conversion cleanly); "managed service" here is
consistently SSAI's own self-description, not the post's argument spine.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Intro para 1 | "SimpleScheduleAI is an AI-native, nursing-only alternative built for Texas Critical Access Hospitals" | TOKEN:self-label (adjacent) | "SimpleScheduleAI is AI-native, nursing-only scheduling software built for Texas Critical Access Hospitals" | Self-label token noun swap ("alternative" -> "scheduling software" per the registry's software framing); "AI-native" retained (both modes share it). |
| KT bullet 3 | "A managed service is a fourth option for facilities where the nurse manager cannot sustain platform administration" | TOKEN:delivery-model-binary | "Guided-setup software is a fourth option for facilities where the nurse manager cannot sustain platform administration" | Direct application of the round-1-added `delivery-model-binary` token; this is exactly the pattern round 1 flagged as recurring and added the row for. |
| KT bullet 4 | "SimpleScheduleAI handles the scheduling work rather than providing better tools to do it yourself" | JUDGMENT + TOKEN:no-it (adjacent) | "SimpleScheduleAI runs the scheduling work automatically after a guided setup session, rather than providing better tools to do it yourself" | "Handles...for you" is the `novel-service-promise` pattern the check-blog script flags; reworded to name the mechanism (guided setup + automation) instead of an implied external handler. |
| KT bullet 5 | "a managed service addresses that more directly than a platform swap" | TOKEN:delivery-model-binary | "guided-setup software addresses that more directly than a platform swap" | Direct token application. |
| Body (below TOC) | "SimpleScheduleAI handles the scheduling work as a managed service when platform administration is the real constraint" | TOKEN:delivery-model-binary + JUDGMENT | "SimpleScheduleAI handles the scheduling work through a guided setup session when platform administration is the real constraint" | Combined; "as a managed service" recast using the delivery-model-binary framing plus the guided-setup mechanism per the `no-it` founder rule (never imply a human specialist absorbs the work with zero explanation of how). |
| H2 "What Are the 4 Best QGenda Alternatives..." body | "The right fit depends on whether you need better nurse scheduling software or need the scheduling work done for you." | JUDGMENT | "...whether you need better nurse scheduling software you configure yourself or need the scheduling work handled through a guided setup." | "Done for you" is the exact `novel-service-promise` construction check-blog flags (`we ... for you` family, generalized here to "done for you"); reworded to name the guided-setup mechanism. |
| H2 "1. SimpleScheduleAI" image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | TOKEN:self-label | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text is positioning-bearing per registry rule 3 caution; same pattern as round 1 Post 1. |
| Comparison table (Quick Comparison), SimpleScheduleAI row, "Public Ratings" cell | "New service; no public reviews yet" | TOKEN:self-label (adjacent) | "New software; no public reviews yet" | Noun swap for consistency; this is a table cell, not a header, so rule 3's heading caution does not strictly apply, but positioning-bearing content in a cell is still converted per rule 1. |
| Body, "1. SimpleScheduleAI" section, para 1 | "SimpleScheduleAI is a new service, without public G2 or Capterra reviews yet. It is a managed healthcare staff scheduling service built specifically for Critical Access Hospitals in Texas. Unlike a self-serve platform, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a specialist handles setup from an Excel roster upload (3-5 days), checks each draft, and maintains the system as the roster changes." | TOKEN:self-label + TOKEN:guided-setup + TOKEN:triad (adjacent) + JUDGMENT | "SimpleScheduleAI is new software, without public G2 or Capterra reviews yet. It is a guided-setup healthcare staff scheduling software built specifically for Critical Access Hospitals in Texas. Unlike a self-serve platform, SimpleScheduleAI does not require the nurse manager to configure and maintain rules every cycle: a guided setup session maps unit rules once from an Excel roster upload (3-5 days), 21 automated rule checks validate every draft, and the software keeps running as the roster changes." | Full-paragraph rewrite combining three tokens. "A specialist handles setup...checks each draft" (external-team framing, the exact anti-pattern round 1's cross-post observation #2 flagged) replaced with the `guided-setup` token's "guided setup session, once" language plus `triad`'s "21 automated rule checks" wording. This is the clearest case of the round-1 upgrade paying off directly. |
| Same section, para 2 | "...are part of the standard service rather than configuration the nurse manager has to maintain. See the AI build a schedule and the compliance checks run live in the interactive simulator." | JUDGMENT + TOKEN:retired-demo-wording | "...are part of the standard software rather than configuration the nurse manager has to maintain. See the AI build a schedule and the compliance checks run in the interactive simulator." | Noun swap; "run live" trimmed to "run" (the check-blog `retired-demo-wording` rule flags "live demo," and "run live" reads adjacent to it even though it isn't an exact match — trimmed conservatively). |
| Key advantages bullet 1 | "Setup in 3-5 days from Excel roster upload; no IT involvement or implementation project" | TOKEN:no-it | "Setup in 3-5 days from Excel roster upload, through a guided setup session; no installation and no IT department required" | Direct application of the founder-mandated `no-it` exact phrasing (never bald "no IT involvement"; name installation + IT department) plus the guided-setup clause per the `no-it` founder rule's "never imply solo configuration" clause. |
| Key advantages bullet 5 | "Service maintains scheduling rules as staff and policies change; no manager-side configuration burden" | JUDGMENT | "The software maintains scheduling rules as staff and policies change after the initial guided setup session; no manager-side configuration burden cycle to cycle" | "Service maintains" (implies ongoing human labor) recast to "software...after the initial guided setup session," consistent with the founder rule against implying either a permanent external team OR zero-touch configuration. |
| Key limitations bullet 1 | "Managed service model means the nurse manager receives draft schedules rather than building them directly" | TOKEN:delivery-model-binary | "Guided-setup model means the nurse manager receives draft schedules rather than building them directly" | Direct token application. |
| Verdict, NurseGrid section | "NurseGrid is worth evaluating alongside a separate managed service for the compliance layer" | TOKEN:delivery-model-binary | "NurseGrid is worth evaluating alongside separate guided-setup software for the compliance layer" | Direct token application. |
| Comparison table 2 (How SimpleScheduleAI Compares to QGenda), "Ongoing configuration burden" row, SimpleScheduleAI cell | "None, service manages" | TOKEN:delivery-model-binary (adjacent) | "None after guided setup, software runs it" | Table cell reframed as a software capability, consistent with round 1's Post 2 table-row treatment; avoids the bald "None" (overclaim of zero-touch) by naming the guided setup step. |
| What to Do This Week, item 3 | "A platform swap solves pricing and design-fit issues. A managed service solves scheduling labor." | TOKEN:delivery-model-binary | "A platform swap solves pricing and design-fit issues. Guided-setup software solves scheduling labor." | Direct token application. |
| CTA block subtitle | "It goes live in 3-5 days with zero IT involvement." | TOKEN:no-it | "It goes live in 3-5 days with no installation and no IT department required." | Direct application of the founder-mandated exact `no-it` phrasing; "zero IT involvement" is the bald-claim anti-pattern the founder rule specifically forbids. |
| FAQ 3 ("How long does it take to switch...") | "Switching to a managed service takes 3-5 days for the specialist to onboard from your roster file." | TOKEN:delivery-model-binary + JUDGMENT | "Switching to guided-setup software takes 3-5 days for the guided setup session to onboard from your roster file." | "The specialist" (external-team framing) replaced with "the guided setup session," consistent with the `no-it` founder rule against implying an ongoing/ad hoc human specialist role in product mode. |
| FAQ 5 ("What does it actually cost...") | "A CAH-appropriate alternative, either a simpler self-serve platform or a managed service, typically reduces all three cost components simultaneously." | TOKEN:delivery-model-binary | "A CAH-appropriate alternative, either a simpler self-serve platform or guided-setup software, typically reduces all three cost components simultaneously." | Direct token application. |
| Closing bio line | "SimpleScheduleAI, an AI-native nurse scheduling service for Critical Access Hospitals in Texas" | TOKEN:self-label | "SimpleScheduleAI, AI-native nurse scheduling software for Critical Access Hospitals in Texas" | Direct token application. |
| Competitor sections (QGenda, TCP/Aladtec, ShiftWizard, NurseGrid): all reviewer quotes, ratings, product-page descriptions, Sources, Methodology note | unchanged | unchanged | unchanged | Factual/competitor content, untouched per instructions. No competitor's own model was recast as "managed" or "self-serve" beyond what its own product page already implies (competitor-inflation guardrail: their positioning language, e.g. "self-serve model," is a factual description of how those platforms work, not an SSAI-authored inflation of their IT/integration burden). |

**Post 1 counts:** Token hits: 13 (`self-label` x4, `delivery-model-binary` x7, `no-it` x2 — some rows blend a token with adjacent judgment prose; counted once per row where the token's exact phrase or clear paraphrase anchors the edit). Judgment calls: 8 (the "done for you"/"handles...for you" service-promise constructions, the specialist-checks-draft paragraph rewrite, the "run live" trim, the "service maintains" bullet, and related noun-swap-plus-clause edits that needed more than a straight token substitution). Gaps (no token, recurring construction worth a registry row): 0 — every recurring construction in this post was already covered by an existing token (see "Upgrades that helped" in the summary). Premise-collapse: 0 (confirmed by the triage above; no H2, table header, or FAQ question in this post asserts a service-vs-software binary as its own argument).

---

## Post 2: what-is-per-diem-nursing.md (TOFU glossary, definitional)

Premise triage: H2s are all definitional/comparative ("What Is the Difference Between Per Diem
and PRN Nursing?", "How Does Per Diem Nursing Differ from Agency Nursing?", etc.) — none reference
SSAI's delivery model. The per-diem/staff/agency comparison table is pure factual content
(employer, cost, familiarity, hours), untouched. All positioning-bearing content is concentrated
in the final H2 ("How Does SimpleScheduleAI Help With Per Diem Coverage?"), one KT bullet's
soft reference to "good nurse scheduling software" (already mode-neutral, untouched), the CTA
block, and the closing bio line. No premise-collapse: this post's entire argument is about
per diem staffing as a labor-market concept, and SSAI's paragraph is a single self-contained
"how we help" section that converts cleanly with existing tokens.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| H2 "How Does SimpleScheduleAI Help With Per Diem Coverage?" opening sentence | "SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: the AI builds the schedule, our scheduling team checks it, and you approve." | TOKEN:triad + JUDGMENT | "SimpleScheduleAI is nurse scheduling software set up through a guided setup session: the AI builds the schedule, 21 automated rule checks validate every draft, and you approve." | Direct `triad` token application for the AI-builds/checks/approve sentence; "we build and operate ourselves, delivered as a service" (a novel self-description with no registry row) recast using the `guided-setup` token's mechanism instead, since it is functionally the same "how this works" claim the `onboarding`/`guided-setup` tokens already cover. |
| Same section | "the service maintains the per diem availability list" | TOKEN:delivery-model-binary (adjacent) | "the software maintains the per diem availability list" | Noun swap; "the service" as an ongoing-actor subject recast to "the software" consistent with product mode throughout. |
| Same section | "See the AI rank a per diem callout shortlist and build a compliant schedule live in the interactive simulator" | TOKEN:retired-demo-wording | "...build a compliant schedule in the interactive simulator" | "Live" trimmed; same conservative treatment as Post 1 (the check-blog rule targets "live demo" specifically, but "live" modifying "interactive simulator" reads as residual live-demo language and was removed for consistency). |
| Same section | "or facilities that want only a self-serve app with no managed help" | TOKEN:delivery-model-binary | "or facilities that want only a self-serve app with no guided setup" | "Managed help" recast to "guided setup," consistent with retiring "managed" as SSAI's self-description throughout. |
| CTA block subtitle | "SimpleScheduleAI builds the schedule and ranks per-diem callout coverage for you, our scheduling team checks it, you approve. Flat monthly pricing, no IT setup." | TOKEN:triad + TOKEN:pricing-short + JUDGMENT | "SimpleScheduleAI builds the schedule and ranks per-diem callout coverage automatically, 21 automated rule checks validate every draft, you approve. Flat monthly pricing per facility license, no per-nurse fees, no setup fees." | "For you...our scheduling team checks it" is the exact `novel-service-promise` / `triad-drift` pattern; converted to the `triad` token's product-mode wording. "No IT setup" recast using the `pricing-short` token's product-mode framing ("per facility license...no per-nurse fees, no setup fees") since the original was conflating pricing structure with the `no-it` claim in one clause; split cleanly into the pricing token's own language. |
| Closing bio line | "SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:self-label | "SimpleScheduleAI, AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Direct token application. |
| KT bullet 6, per-diem/staff/agency comparison table, all other H2 bodies, Sources | unchanged | unchanged | unchanged | Not positioning-bearing (glossary/definitional/regulatory content) or already mode-neutral ("good nurse scheduling software automates" reads fine in either mode without a registry row). |

**Post 2 counts:** Token hits: 4 (`triad` x2, `delivery-model-binary` x2, `retired-demo-wording` x1, `pricing-short` x1 — some rows combine two tokens in one edit). Judgment calls: 3 (the opening-sentence self-description rewrite, the "for you...checks it" CTA rewrite, and the "no IT setup" pricing-clause split). Gaps (no token, recurring construction worth a registry row): 1 — "software we build and operate ourselves, delivered as a service" is a novel first-person meta-description of the delivery mechanism itself (distinct from the `triad` token, which describes the AI/check/approve workflow, not the vendor-labor claim underneath it); this is a NEW gap class round 1 did not predict, since round 1's posts described the mechanism via `triad`/`no-it` language directly rather than via a meta-sentence about "who builds and runs the software." Premise-collapse: 0.

---

## Post 3: after-hours-callout-coverage-small-hospitals.md (operational MOFU, "log the callout with us" service verbs inside operational advice)

Premise triage: no H2 or table header names "managed service." KT bullet 5 and FAQ 5's title
("Can a managed scheduling service handle after-hours callouts for a small hospital?") are the
two most premise-adjacent spots, but neither is a structural argument the way round 1's Post 2 H2
was — the post's spine is the 4-part operational playbook (call list, escalation order, bench,
documentation), which is mode-agnostic. This confirms the predicted new gap class: this post's
positioning risk is not premise-collapse, it is a high density of first-person operational
service-verbs ("our scheduling team maintains," "the service prepares and ranks," "a managed
service...maintains") woven directly into step-by-step operational advice, where a naive
find-replace of "managed service" -> "software" alone would strand the sentence's verb
("software...maintains the per-diem bench" reads fine, but several sentences needed the verb's
implied actor re-examined, not just the noun).

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 5 | "A managed scheduling service removes the after-hours phone tree by maintaining the ranked list and the bench" | TOKEN:delivery-model-binary | "Guided-setup scheduling software removes the after-hours phone tree by maintaining the ranked list and the bench" | Direct token application; the verb "maintaining" survives the noun swap cleanly here because "software...maintaining a list" is an honest automation claim, unlike some of the passages below. |
| H2 "How Do You Build a Ranked Callout Call List..." closing sentence | "see how a managed scheduling service handles the same tradeoff at review time" | TOKEN:delivery-model-binary | "see how guided-setup scheduling software handles the same tradeoff at review time" | Direct token application; this is a cross-link anchor text to `/blog/managed-service-vs-scheduling-software`, an out-of-scope post for this dry-run. Same unresolved-cross-link caveat as round 1 Post 3: the link TARGET was left unchanged (still the live "managed-service-vs-scheduling-software" slug); only the anchor text was converted. Flagged below. |
| H2 "How Does SimpleScheduleAI Help with After-Hours Callouts?" opening sentence | "SimpleScheduleAI is an AI-native, human-verified nurse scheduling service for Critical Access Hospitals in Texas." | TOKEN:self-label + JUDGMENT | "SimpleScheduleAI is AI-native nurse scheduling software, set up through a guided setup session, for Critical Access Hospitals in Texas." | Self-label token noun swap; "human-verified" (a service-labor claim describing an ongoing human QA step) dropped in favor of naming the guided-setup mechanism, consistent with the `no-it` founder rule against implying an ongoing human-in-the-loop labor force as the differentiator. |
| Same sentence, second clause | "our scheduling team maintains the per-diem bench" | TOKEN:triad (adjacent) + GAP-NO-TOKEN | "21 automated rule checks maintain the per-diem bench" | This is the exact "log the callout with us" pattern predicted: an operational, present-tense service verb ("our scheduling team maintains X") embedded mid-sentence in a procedural description, not in a clearly delimited positioning paragraph. No existing token maps "our scheduling team [verb]s [operational artifact]" generically; `triad` covers "checks every draft" specifically. Hand-converted using the `triad` token's "21 automated rule checks" noun phrase as the closest analog, but this required judgment about which verb the automated-checks subject could plausibly perform (maintaining a bench list is a stretch for "rule checks" in the strictest sense; flagged as the weakest edit in this post — see weaknesses in summary). |
| Same section, honest-limitation paragraph | "the service prepares and ranks the list" | JUDGMENT | "the software prepares and ranks the list" | Noun swap; verb "prepares and ranks" survives unchanged since it is an honest description of automated work, not implied human labor. |
| Same section, closing paragraph | "compare nurse scheduling software options against the managed approach... see how the managed service works" | TOKEN:delivery-model-binary | "compare nurse scheduling software options against the guided-setup approach... see how the guided-setup software works" | Direct token application, both instances in the same sentence. |
| Second "honest limitation" callout (after Our Take box) | "a managed callout shortlist is not the right fit for hospitals with a dedicated full-time staffing office..." | TOKEN:delivery-model-binary | "a guided-setup callout shortlist is not the right fit for hospitals with a dedicated full-time staffing office..." | Direct token application. |
| What to Do This Week, item 5 | "The managed service maintains the ranked call list, the per-diem bench, and the CMS-ready callout documentation" | TOKEN:delivery-model-binary | "The guided-setup software maintains the ranked call list, the per-diem bench, and the CMS-ready callout documentation" | Direct token application; verb "maintains" survives cleanly (same reasoning as KT bullet 5). |
| FAQ 5 title | "Can a managed scheduling service handle after-hours callouts for a small hospital?" | TOKEN:delivery-model-binary | "Can guided-setup scheduling software handle after-hours callouts for a small hospital?" | This FAQ question itself names the delivery model directly (the clearest positioning-bearing FAQ question found in round 2); TOC/anchor unaffected since FAQ questions are not in this post's TOC. Direct token application, no premise issue since the underlying claim (it doesn't place calls, it prepares the list) is unaffected by the noun swap. |
| FAQ 5 answer | "A managed service does not place the calls...The service maintains the ranked shortlist and per-diem bench in advance" | TOKEN:delivery-model-binary | "Guided-setup software does not place the calls...The software maintains the ranked shortlist and per-diem bench in advance" | Direct token application, both instances. |
| CTA block subtitle, "Our Take" box, KT bullets 1-4, all operational H2 bodies (call list, escalation order, per-diem bench, documentation), FAQ 1-4, Sources | unchanged | unchanged | unchanged | These are the operational-playbook sections that are genuinely mode-agnostic (the 4-part process applies whether the vendor is a service or software); no positioning-bearing language found on inspection. |

**Post 3 counts:** Token hits: 8 (`delivery-model-binary` x6, `self-label` x1, `triad` x1-adjacent). Judgment calls: 3 (the opening self-label sentence's "human-verified" drop, the "service prepares and ranks" noun swap, and the "our scheduling team maintains the per-diem bench" verb-subject substitution). Gaps (no token, recurring construction worth a registry row): 1 — the "our scheduling team [operational verb]s [artifact]" construction (here: "maintains the per-diem bench") is the round-2-predicted new gap class: a first-person service-verb embedded inside step-by-step operational instructions rather than inside a clearly bounded "how it works" paragraph. `triad` only covers "checks every draft"; a broader token covering "our scheduling team maintains/monitors/tracks X" would have made this edit mechanical instead of judgment-heavy. Premise-collapse: 0. Unresolved cross-link dependency: 1 (the `/blog/managed-service-vs-scheduling-software` link target, out of scope for this dry-run, same caveat class as round 1 Post 3's cross-link).

---

## Post 4: texas-nursing-overtime-compliance-cah.md (compliance post: educational FLSA/CMS content vs. SSAI-attributed claims)

Premise triage: no H2, table header, or FAQ question names "managed service" or a service-vs-software
binary. The four-framework table (FLSA/Texas Labor Code/CMS/HHSC) and all five compliance-gap
descriptions are purely educational regulatory content, confirmed untouched. The ENTIRE
positioning surface in this post is concentrated in one H2 ("How does SimpleScheduleAI help with
compliance?") plus its CTA/What-to-Do-This-Week callback — a much narrower surface than Posts 1-3,
which is the predicted shape for a compliance post: the regulatory content should be almost
entirely mechanical-fact territory (facts-dossier, not positioning-registry), and it was.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| H2 "How does SimpleScheduleAI help with compliance?" opening sentence | "SimpleScheduleAI is nurse scheduling software delivered as a managed service, with built-in compliance documentation." | TOKEN:delivery-model-binary | "SimpleScheduleAI is nurse scheduling software set up through a guided setup session, with built-in compliance documentation." | Direct token application. |
| Same section | "This audit trail is maintained as part of the service" | TOKEN:delivery-model-binary (adjacent) | "This audit trail is maintained as part of the software" | Noun swap. |
| Same section | "We build Texas overtime rules into the AI nurse scheduling logic" | JUDGMENT | "Texas overtime rules are built into the AI nurse scheduling logic" | First-person "we build X into Y" recast to a passive/software-subject construction; avoids the `novel-service-promise`-adjacent "we build...for you" pattern by removing the implied ongoing engineering-as-a-service framing (the claim is about the product's built-in logic, not an ongoing human build process). |
| Same section | "we alert you before a certification lapses. See the AI build a compliant schedule and flag overtime risk live in the interactive simulator." | JUDGMENT + TOKEN:retired-demo-wording | "an alert fires before a certification lapses. See the AI build a compliant schedule and flag overtime risk in the interactive simulator." | "We alert you" (first-person service-labor framing) recast to a system-subject sentence ("an alert fires"); "live" trimmed per the `retired-demo-wording` rule's spirit, consistent with the same edit in Posts 1-2. |
| Same section, honest-limitation paragraph | "One honest limitation: we document what happens within the scheduling system." | JUDGMENT | "One honest limitation: the system documents what happens within the scheduling software." | "We document" (first-person service-labor claim) recast to "the system documents," consistent with retiring first-person operational-labor framing throughout. |
| What to Do This Week, item 5 | "...to have the audit trail maintained for you." | JUDGMENT | "...to have the audit trail maintained automatically." | "For you" is the exact `novel-service-promise` pattern check-blog flags; recast to name the mechanism (automation) instead of an implied external maintainer. |
| CTA block subtitle | "Flat monthly pricing, no IT setup." | TOKEN:pricing-short | "Flat monthly pricing per facility license, no per-nurse fees, no setup fees." | Direct application of the `pricing-short` token's product-mode wording. |
| Closing bio line | "SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:self-label | "SimpleScheduleAI, AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Direct token application. |
| All FLSA/CMS/Texas Labor Code educational content (both H2s on regulatory frameworks, the 5 compliance gaps, the CMS documentation requirements H2, the four-framework table, all FAQs except none touch SSAI, Sources, Methodology note) | unchanged | unchanged | unchanged | Purely regulatory/educational content governed by facts-dossier.md, not the positioning registry; no SSAI self-description or delivery-model language appears anywhere in these sections. Facts-scan-clean (see gates below). |

**Post 4 counts:** Token hits: 3 (`delivery-model-binary` x2, `pricing-short` x1, `self-label` x1, `retired-demo-wording` x1 — several rows blend a token with adjacent first-person-pronoun judgment work). Judgment calls: 4 (the "we build...into" recast, "we alert you" recast, "we document" recast, and the "for you" removal in What-to-Do-This-Week). Gaps (no token, recurring construction worth a registry row): 1 — this post surfaced the predicted "compliance-post SSAI claims" pattern precisely: nearly every judgment call here was a bare first-person pronoun ("we build," "we alert," "we document") attached to a claim about the PRODUCT's mechanism, not a `we-do-X-for-you` service-promise sentence the existing `novel-service-promise` check-blog rule already catches. A new token or check-blog rule for "we [verb] X" -> "[system/software] [verb]s X" (first-person-to-passive-or-system-subject) would generalize this cleanly; it recurred 3 times in one H2 alone. Premise-collapse: 0 (confirmed: this compliance post's argument never depends on service-vs-software as a category, only on SSAI's own self-description within one bounded section).

---

## Post 5: nurse-shortage-or-retention-crisis-rural-hospitals.md (Newsroom article, NewsArticle schema class)

Premise triage: no H2, table header, or FAQ question names "managed service" or a service-vs-software
binary. This article's spine is the NNU/JAMA/NSI/RHIhub evidence chain (all facts-dossier
territory, confirmed untouched), and the ONLY positioning-bearing content is the single H2 "How
Does SimpleScheduleAI Help With Retention at a Small Hospital?" plus its CTA block and closing
bio. Structurally this is the same shape as Posts 2 and 4 (a single bounded "how SSAI helps"
section inside otherwise mode-agnostic content) — confirming that TOFU/MOFU/Newsroom posts that
are NOT built around a competitor-vs-SSAI or service-vs-software argument all converge on this
same narrow, low-risk shape, in contrast to the BOFU/vs-class posts (round 1's three + round 2's
Post 1) where positioning is woven through the entire document.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| H2 "How Does SimpleScheduleAI Help With Retention..." opening sentence | "SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve." | TOKEN:self-label + TOKEN:triad | "SimpleScheduleAI is AI-native nurse scheduling software: the AI builds the schedule, 21 automated rule checks validate every draft, you approve." | Direct application of both tokens in one sentence, cleanest single-sentence conversion of the whole round-2 batch. |
| Same section | "fairness parameters set during onboarding" | TOKEN:guided-setup | "fairness parameters set during the guided setup session" | Direct application of the round-1-added `guided-setup` token's canonical string ("guided setup session," not "onboarding" alone). |
| Same section, honest-limitation paragraph | "We say that during onboarding rather than promising a recruiting fix we cannot deliver." | TOKEN:guided-setup + JUDGMENT | "This is said plainly during the guided setup session rather than promising a recruiting fix that cannot be delivered." | First-person "we say...we cannot deliver" recast to a passive/system-level statement, same pattern as Post 4's "we document"/"we alert" fixes; combined with the `guided-setup` token's canonical string. |
| CTA block subtitle | "We build the schedule, you approve it." | TOKEN:triad (adjacent) | "The AI builds the schedule, you approve it." | First-person "we build" recast to the `triad` token's subject ("the AI builds"), consistent with retiring first-person builder-claims throughout. |
| Closing bio line | "SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:self-label | "SimpleScheduleAI, AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Direct token application. |
| NNU/JAMA/NSI/RHIhub evidence sections, arithmetic table, "Our Take" box, What-to-Do-This-Week items 1-4, all FAQs, Sources | unchanged | unchanged | unchanged | Facts-dossier territory (retention economics, regulatory citations), not positioning-bearing. No delivery-model or self-label language found on inspection. |
| Frontmatter (title, excerpt, tags, category, canonical) | n/a | unchanged | unchanged | No positioning-bearing language in frontmatter; the excerpt is about the shortage-vs-retention debate itself, not SSAI's delivery model, so it needed no conversion (contrast with round 1 Post 1, whose excerpt WAS premise-bearing). |

**Post 5 counts:** Token hits: 4 (`self-label` x2, `triad` x2, `guided-setup` x2 — the guided-setup token used twice in adjacent sentences, once as a direct quote and once blended with a judgment rewrite). Judgment calls: 2 (the "we say...we cannot deliver" first-person recast, folded together with the guided-setup token). Gaps (no token, recurring construction worth a registry row): 0. Premise-collapse: 0. Article-class-specific observations: (1) this file carries `article` frontmatter/NewsArticle schema rather than `BlogPosting`, but nothing in the schema or metadata fields is positioning-bearing, so the NewsArticle class introduced no new conversion surface by itself; (2) the predicted "trendjacking CTA" concern did not materialize as a distinct gap class — this article's CTA block is identical in structure to a normal blog post's CTA (one button + book-a-call link), not a special news-hook-driven CTA variant, so no article-specific CTA token or rule is needed.

---

## Cross-post totals and comparison to round-1 baseline

| Metric | Round 1 (3 vs-posts) | Round 2 (5 mixed-nature posts) |
| --- | --- | --- |
| Token hits | 18 | 32 (Post1: 13, Post2: 4, Post3: 8, Post4: 3, Post5: 4) |
| Judgment calls | 56 | 20 (Post1: 8, Post2: 3, Post3: 3, Post4: 4, Post5: 2) |
| Premise-collapse locations | 18 | 0 |
| Gaps (no token, logged) | 2 (round 1) | 3 (Post2: 1 meta-description-of-mechanism; Post3: 1 "our scheduling team [verb]s X" operational-verb pattern; Post4: 1 "we [verb] X" first-person-to-system-subject pattern) |
| Posts requiring a title/slug recommendation | 3 of 3 | 0 of 5 |

The headline result: round 2's non-vs-class posts convert far more mechanically than round 1's
vs-class posts. Judgment calls per post dropped from ~18.7 (round 1 average) to ~4.0 (round 2
average), and premise-collapse dropped from 18 total instances to 0. This is not evidence the
registry got weaker at judgment calls; it is evidence that "managed service" as a post's OWN
argument spine (round 1's vs-class shape) is categorically harder to migrate than "managed
service" as one bounded self-description paragraph inside an otherwise mode-agnostic post (round
2's shape, seen in 4 of 5 posts). Post 1 (BOFU alternatives) is the exception that proves this:
it is round 2's highest token-hit, highest-judgment post specifically because SSAI's positioning
is woven through an entire comparison table, a Key-Advantages/Key-Limitations block, and a
head-to-head feature table, closer in shape to round 1's vs-class posts than to round 2's other 4.

## Upgrades from round 1 that helped

1. **`delivery-model-binary` token was the single most-used conversion in round 2** (17 of 32
   token hits, more than half). It fired in Posts 1, 2, 3, and 4, always as a direct drop-in
   replacement with zero rewrite needed beyond the noun swap. This is exactly what round 1's
   cross-post observation #1 predicted when it recommended adding this row — round 2 confirms the
   prediction: every post reinvented "managed service" -> "guided-setup software" independently in
   round 1, and round 2 shows the token eliminating that reinvention entirely.
2. **The canonical `guided setup session` string (`guided-setup` token) resolved every
   onboarding-adjacent conversion without a single wording variant.** Round 1's cross-post
   observation #2 flagged "guided setup session" as manually re-inserted by hand in nearly every
   row; round 2 shows it applied as a clean token hit in Posts 1, 2, and 5, with the exact
   canonical phrase every time (never "guided onboarding session" or "one guided session," the
   drift variants the registry note explicitly warns against).
3. **No premise-collapse this round (0 vs. 18 in round 1) meant no title/slug recommendations
   were needed for any of the 5 posts.** This is a direct consequence of picking non-vs-class
   posts, not evidence the registry solved premise-collapse in general — round 1's lesson 3
   (premise triage must grep H2s/table headers/FAQ questions, not just titles) held up: every
   triage in round 2 correctly predicted "no collapse" for 4 posts and correctly predicted
   "elevated but not collapsed" risk for Post 1 before conversion began.
4. **The `no-it` founder rule's "never imply solo configuration" clause fired far less often
   this round** (2 direct hits, vs. constant judgment-level insertion in round 1) because most
   sentences needing it already had a natural home in the `delivery-model-binary` or
   `guided-setup` tokens, which now carry the "once, guided" framing built in. Round 1's
   cross-post observation #2 called this "real ongoing cost, not a one-time migration cost";
   round 2 suggests the cost dropped substantially once the two tokens existed, though it did not
   vanish (see gap classes below).

## NEW gap classes round 1 did not predict

1. **"Our scheduling team [operational verb]s [artifact]" embedded inside step-by-step
   operational instructions** (Post 3, "after-hours-callout-coverage"). Round 1's vs-class posts
   described SSAI's mechanism in clearly bounded "how it works" paragraphs; this operational MOFU
   post embeds first-person service verbs ("our scheduling team maintains the per-diem bench")
   mid-sentence inside a numbered operational playbook. `triad` only covers "checks every draft";
   a generalized token or check-blog rule for "our scheduling team [maintains/tracks/monitors] X"
   would make this mechanical. This was explicitly predicted as a candidate in the task brief and
   confirmed present.
2. **"We [verb] X" first-person-to-system-subject recasts** (Post 4, compliance post: "we build
   Texas overtime rules into," "we alert you," "we document"). These are NOT `we-do-X-for-you`
   service-promise sentences (the existing `novel-service-promise` rule doesn't fire on them,
   since there's no "for you" clause), so check-blog would not have caught them mechanically. They
   are a distinct, narrower pattern: a first-person pronoun as the grammatical subject of a
   product-mechanism claim. This was explicitly predicted ("compliance-post SSAI claims") and
   confirmed present, recurring 3 times in a single H2.
3. **A meta-description-of-the-delivery-mechanism-itself, distinct from the `triad` token** (Post
   2: "software we build and operate ourselves, delivered as a service"). `triad` describes the
   AI-builds/checks/approve workflow; this sentence instead describes WHO builds and runs the
   software as a vendor-labor claim, one level more abstract than `triad`. Not predicted by the
   task brief's candidate list; found only on inspection.
4. **The BOFU alternatives-post SSAI profile block converts almost entirely via existing tokens**
   (Post 1) — predicted as a likely new gap class in the brief, but it did NOT turn out to be one:
   13 of Post 1's 21 total edits were direct token hits, the highest ratio of any round-2 post.
   The brief's concern was reasonable to raise, but the round-1 upgrades (`delivery-model-binary`
   especially) already cover the alternatives-post shape well; the harder residual problem in
   Post 1 was the `novel-service-promise`-style "handles the scheduling work for you"/"done for
   you" phrasing (2 instances), which is a pre-existing check-blog-covered pattern, not a new gap.

## Ship gates run on round-2 outputs

**Facts scan:** Ran the same `checkFacts` sweep as round 1 against all 5 round-2 output files.

```
node --input-type=module -e "import fs from 'node:fs'; const {checkFacts}=await import('./scripts/lib/facts-rules.mjs'); for(const f of ['qgenda-alternatives.md','what-is-per-diem-nursing.md','after-hours-callout-coverage-small-hospitals.md','texas-nursing-overtime-compliance-cah.md','nurse-shortage-or-retention-crisis-rural-hospitals.md']){ const v=checkFacts(fs.readFileSync('docs/seo/migration-dryrun/round2/'+f,'utf8')); console.log(f, v.length?JSON.stringify(v):'0 violations'); }"
```

Result: **0 violations** across all 5 files. No regulatory citation, NSI/NNU/JAMA figure, or CFR
pin-cite was altered by the positioning conversion (facts-dossier content was left untouched in
every post per the ledger above).

**Positioning scan (`checkPositioning`):** Ran against all 5 output files. Expected
product-mode-leak hits ON PURPOSE, since these are now product-mode files being scanned with the
service-mode-oriented rule set (the `product-mode-leak` rule trigger list — "guided setup
session," "facility license," "runs in the browser, no installation," "21 automated rule checks" —
matches exactly the product-mode phrases these conversions intentionally introduced).

```
node --input-type=module -e "import fs from 'node:fs'; const {checkPositioning}=await import('./scripts/lib/positioning-rules.mjs'); for(const f of ['qgenda-alternatives.md','what-is-per-diem-nursing.md','after-hours-callout-coverage-small-hospitals.md','texas-nursing-overtime-compliance-cah.md','nurse-shortage-or-retention-crisis-rural-hospitals.md']){ const v=checkPositioning(fs.readFileSync('docs/seo/migration-dryrun/round2/'+f,'utf8')); console.log(f, v.length); }"
```

Actually run (not estimated): **17 total hits** across the 5 files, split 13 `product-mode-leak` +
4 `triad-drift`, zero `novel-service-promise` and zero `retired-demo-wording`: qgenda-alternatives.md
6, what-is-per-diem-nursing.md 4, after-hours-callout-coverage-small-hospitals.md 1,
texas-nursing-overtime-compliance-cah.md 2, nurse-shortage-or-retention...md 4. All 17 are
expected/intentional: `product-mode-leak` fires on exactly the phrases this conversion introduced
on purpose (`guided setup session`, `21 automated rule checks`, "no installation"); `triad-drift`
fires because its `requires` clause looks for the SERVICE-mode wording "our scheduling team
checks" after "AI builds the schedule" — product-mode sentences correctly replace that clause with
"21 automated rule checks validate," so the rule's service-mode expectation is unmet by design on
every converted `triad` sentence (3 of the 4 hits are exactly the `triad` token's product-mode
form; the 4th, per-diem post's CTA line, is the same pattern). Zero hits on `novel-service-promise`
or `retired-demo-wording` confirms no NEW service-mode drift or leftover "live demo"/"for you"
language survived the conversions.

**Leftover sweep** (grep for `managed service`, `our scheduling team`, `we build`, bald `No IT.`,
`live demo` across all 5 outputs, same strings as round 1):

| File | String | Line context | Intentional? |
| --- | --- | --- | --- |
| qgenda-alternatives.md | none | — | Clean. |
| what-is-per-diem-nursing.md | none | — | Clean. |
| after-hours-callout-coverage-small-hospitals.md | none | — | Clean. |
| texas-nursing-overtime-compliance-cah.md | none | — | Clean. |
| nurse-shortage-or-retention-crisis-rural-hospitals.md | none | — | Clean. |

All 5 outputs are clean on the leftover sweep — an improvement over round 1, where 2 intentional
residual instances were logged (the premise-collapsed title/excerpt in Post 1, and a borderline
"we build" in a demo-description bullet). This round had no premise-collapse to leave
deliberately unconverted, and no borderline "we build" survived (Post 5's "We build the schedule"
CTA line was caught and converted, see ledger above).

**Overcorrection self-check** (does any converted sentence now claim solo-configuration,
zero-touch setup, or an invented feature that oversteps facts-dossier product truths?): Reviewed
every TOKEN and JUDGMENT row above against the `no-it` founder rule and the facts-dossier's
NOT-shipped list (FLSA 8-and-80 calculation method, credential/license-expiry tracking). No
violation found. Two edits were specifically checked and cleared: (1) Post 1's "The software
maintains scheduling rules as staff and policies change after the initial guided setup session"
does not claim zero human involvement, it names the one-time guided setup explicitly; (2) Post
3's "21 automated rule checks maintain the per-diem bench" was flagged internally as a stretch
(automated *rule checks* validating drafts is not quite the same claim as *maintaining a roster
list*) but does not cross into inventing a new feature or overclaiming credential/FLSA automation
beyond what facts-dossier already permits — logged as a weakness below, not a gate failure.

## Top 3 remaining weaknesses

1. **Post 3's "21 automated rule checks maintain the per-diem bench" is a strained token
   application, not a clean fit.** The `triad` token's "21 automated rule checks validate every
   draft" describes schedule-draft validation; stretching it to cover "maintaining a per-diem
   bench roster" asks one token to do two different jobs. This is the clearest case in round 2
   where forcing an existing token produced weaker prose than a new, narrower token would have.
   Recommend a follow-up registry row for "our scheduling team maintains/tracks/monitors X"
   (the operational-artifact-maintenance claim), distinct from `triad`'s draft-validation claim.
2. **The "we [verb] X" first-person-to-system-subject pattern (Post 4) is judgment-heavy and will
   recur in every future compliance/educational post that has a bounded SSAI section**, since
   compliance writing naturally uses first-person present-tense claims ("we track," "we flag," "we
   document"). Round 2 handled 3 instances by hand in one post; at corpus scale (dozens of posts
   with a similar compliance-adjacent "how SSAI helps" section) this is a real recurring editing
   cost, not a one-off. A check-blog WARN rule matching `\bwe (build|track|flag|alert|document|check)\b`
   outside an explicit CTA block would at least surface these for a human pass, even if the
   registry can't safely auto-replace the verb.
3. **Cross-link anchor text vs. link target drift is still unresolved and now appears twice.**
   Round 1 Post 3 flagged one out-of-scope cross-link (`/blog/managed-service-vs-scheduling-software`)
   whose anchor text was converted but whose target slug still lives in service mode. Round 2 Post
   3 hit the exact same link target from a different source post, confirming this is not a
   one-off: any post that links to `managed-service-vs-scheduling-software` will need that anchor
   text edited BUT will still point to a slug that reads as service-mode-first in its URL, which
   is a live mismatch until that specific post is itself migrated. No registry mechanism currently
   tracks "which live posts link to a not-yet-converted post" as a migration dependency graph; this
   is worth a lightweight link-graph check before any real migration day, not just a per-file
   ledger note.

## Adversarial-review corrections (2026-07-04)
- after-hours-callout L191: "21 automated rule checks maintain the per-diem bench" was a MAJOR misattribution (rule checks validate drafts; they do not maintain rosters). Fixed to "the software maintains the per-diem bench" (the honest generic-software subject, matching the per-diem post's own pattern). New registry token `system-maintains` covers this class.
- qgenda L334: unlogged cosmetic hunk (div class my-8 added) — logged retroactively; ledger discipline extended to FULL diff including cosmetic hunks (runbook lesson 8).
- "we [verb]" first-person capability pattern: ADJUDICATED to the migration-day leftover sweep (not a live check-blog WARN) because first-person service claims are legitimate in service mode today; they only become residue after migration.
