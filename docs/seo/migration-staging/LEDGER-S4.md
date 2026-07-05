# Migration Staging Ledger — Batch S4

Service-mode to product-mode conversion, staging only. Sources untouched in `src/data/post/`.
Outputs in `docs/seo/migration-staging/post/`. Per `docs/seo/migration-staging/CONVERTER-BRIEF.md`,
`docs/seo/positioning-registry.md` mapping table + authoring rules, and
`docs/seo/facts-dossier.md#product-truths` guardrails.

Action key: `TOKEN:<id>` = exact registry row applied · `JUDGMENT` = positioning-bearing phrase
converted with no exact registry row · `GAP-NO-TOKEN` = a phrase that is clearly positioning-bearing,
recurs, and probably deserves its own registry row but was hand-converted here ·
`PREMISE-COLLAPSE` = the section's/post's argument structurally depends on the service-vs-software
distinction and does not survive a token swap.

Every row below is reconciled against a full `diff -u` of source vs. staged output for its post
(lesson 8/1 from the dry-run: no row taken on the converter's self-report alone).

---

## Post 1: self-scheduling-problems-critical-access-hospital.md

No PREMISE-COLLAPSE: this post's thesis (self-scheduling fairness at CAH scale) is mode-agnostic.
Positioning-bearing language appeared only in the SSAI-specific section and the closing FAQ.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Body, "How Does SimpleScheduleAI Address..." section | "using a communication tool for preference collection alongside managed scheduling for schedule generation" | TOKEN:delivery-model-binary (adjacent) | "...alongside guided-setup scheduling software for schedule generation" | Noun swap consistent with the registry's software-not-service framing. |
| Same section | "the managed service model addresses the enforcement problem that makes self-scheduling hard to sustain" | TOKEN:delivery-model-binary | "guided-setup software, not a self-configured platform the hospital integrates alone, addresses the enforcement problem..." | Direct application of the registry's most-frequent token. |
| What to Do This Week, item 5 | "The managed service applies constraint-aware fairness rules before nurses self-pick" | JUDGMENT | "The guided-setup software applies constraint-aware fairness rules before nurses self-pick" | Noun swap. |
| FAQ 5 (question) | "Can you use self-scheduling and a managed service at the same time?" | JUDGMENT | "Can you use self-scheduling and guided-setup software at the same time?" | Question-form heading; noun swap only, no anchor change (FAQ questions are not TOC-linked in this post). |
| FAQ 5 (body) | "the scheduling service uses those preferences as inputs when generating the schedule" | JUDGMENT | "the scheduling software uses those preferences as inputs when generating the schedule" | Noun swap. |
| Frontmatter, Sources, competitor quotes (NurseGrid), CMS/FLSA/HRSA citations | unchanged | unchanged | unchanged | Not positioning-bearing or out of scope (regulatory/competitor content stays byte-identical). |

**Post 1 counts:** Token hits: 2 (`delivery-model-binary` x2, one exact-token, one adjacent-paraphrase). Judgment calls: 3. Gaps: 0. Premise-collapse: 0. Facts scan: clean (`[]`). Leftover sweep: clean.

---

## Post 2: shiftwizard-alternatives.md

No PREMISE-COLLAPSE at the title level (this is an "-alternatives" listicle, not a vendor-vs-vendor
or service-vs-software framed post), but the SSAI profile section and FAQ block required the same
depth of guided-setup-vs-solo-configuration care as the dry-run's worst cases, since this post
explicitly sells the "no configuration burden" angle.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Excerpt | "a direct look at how a managed service fits when the nurse manager cannot sustain weekly scheduling administration" | TOKEN:delivery-model-binary | "...how guided-setup software fits when the nurse manager cannot sustain weekly scheduling administration" | Frontmatter is in scope per brief; direct token. |
| Intro para 1 | "SimpleScheduleAI offers a managed-service alternative built for Texas CAHs" | TOKEN:delivery-model-binary | "SimpleScheduleAI offers a guided-setup alternative built for Texas CAHs" | Direct token. |
| KT bullet 3 | "For facilities where the core issue is scheduling labor rather than platform fit, a managed service is a different operating model." | TOKEN:delivery-model-binary | "...guided-setup software is a different operating model." | Direct token. |
| Comparison table, SimpleScheduleAI row | "New service; no public reviews yet" | JUDGMENT | "New software; no public reviews yet" | Noun swap; no-customers/no-pilots guardrail respected (still no reviews claim). |
| H2 intro, "What Are the 4 Best..." | "a managed service built specifically for 25-bed facilities" | TOKEN:delivery-model-binary | "guided-setup software built specifically for 25-bed facilities" | Direct token. |
| SimpleScheduleAI profile, image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | TOKEN:self-label | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text is positioning-bearing per registry rule 3; converted directly. |
| SimpleScheduleAI profile, body para 1 | "SimpleScheduleAI is an AI-native nurse scheduling service built specifically for Critical Access Hospitals in Texas. Unlike a self-serve platform, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a scheduling specialist handles setup from an Excel roster upload, checks each draft, and maintains the system as the roster changes." | TOKEN:self-label + TOKEN:guided-setup + JUDGMENT (tension resolution) | "SimpleScheduleAI is AI-native nurse scheduling software built specifically for Critical Access Hospitals in Texas. Unlike a self-serve platform, SimpleScheduleAI does not require ongoing configuration work from the nurse manager: a guided setup session maps unit rules once from an Excel roster upload, the AI builds draft schedules each cycle, and 21 automated rule checks validate every draft as the roster changes." | **Tension flag:** the source said "requires no configuration work... a scheduling specialist handles setup" — a bald zero-configuration claim plus an implied human specialist team. Rewrote to "does not require ONGOING configuration work" (the one-time guided setup session still happens) and removed the "scheduling specialist" (a person) in favor of "21 automated rule checks" (the `system-maintains`/`triad` tokens' honest mechanism). This is the same solo-configuration-vs-guided-setup trap called out for ukg-too-complex-small-hospital.md; it recurred here independently. |
| SimpleScheduleAI profile, body para 2 | "The service is a new offering, without public G2 or Capterra reviews yet." | TOKEN:self-label (adjacent) | "The software is a new offering, without public G2 or Capterra reviews yet." | Noun swap. |
| Key advantages bullet | "Eliminates configuration maintenance: the service maintains scheduling rules as staff and policies change" | TOKEN:system-maintains + tension resolution | "Eliminates ongoing configuration maintenance: the software maintains scheduling rules as staff and policies change after the initial guided setup session" | Direct application of `system-maintains` token; added "after the initial guided setup session" so "eliminates configuration maintenance" cannot be misread as zero setup ever happening. |
| Key advantages bullet | "Excel-based roster upload means no IT involvement during transition" / "Flat monthly pricing with no IT setup; our AI builds the schedule, our scheduling team checks it, you approve it" | TOKEN:no-it + TOKEN:triad + TOKEN:pricing-short | "Excel-based roster upload plus a guided setup session means no IT involvement during transition" / "Flat monthly pricing with no setup fees; the AI builds the schedule, 21 automated rule checks validate every draft, you approve it" | Combined tokens; "no IT setup" (bald-adjacent) recast per `no-it`/`pricing-short` founder rule to "no setup fees." |
| Key limitations bullet | "Managed service model means less direct manager control than ShiftWizard; schedule changes go through the service rather than being adjustable in real time" | TOKEN:delivery-model-binary | "Guided-setup model means less direct manager control than ShiftWizard; schedule changes go through a setup update rather than being adjustable in real time" | Noun swap; "through the service" (implies contacting a person) recast to "through a setup update" (a product mechanism). |
| Verdict paragraph | "Watch the AI build a compliant schedule and rank a callout shortlist live in the interactive simulator" | JUDGMENT (cosmetic) | "...rank a callout shortlist in the interactive simulator" | Dropped "live" as redundant with "interactive simulator" (already founder-approved wording); flagged since it's a wording tweak beyond strict token swap, not a positioning error in the original. |
| "When to Stay with ShiftWizard" section | "staff-facing mobile shift trading is a hard requirement that a managed service cannot replace" | TOKEN:delivery-model-binary | "...that guided-setup software cannot replace" | Noun swap. |
| Comparison table, "Schedule construction" row | "3 drafts: AI builds, specialist-verified, in 48 hrs" | JUDGMENT (tension resolution) | "3 drafts: AI builds, rule-checked, in 48 hrs" | "Specialist-verified" implied a human checker; recast to the honest `triad`-token mechanism (automated rule checks). |
| Comparison table, "Configuration maintenance" row | "Service responsibility" | TOKEN:system-maintains | "Software responsibility, after one guided setup session" | Direct token + guided-setup qualifier. |
| Post-table paragraph | "SimpleScheduleAI delivers the scheduling outputs without the maintenance burden" | JUDGMENT | "...without the ongoing maintenance burden" | Added "ongoing" for the same reason as above rows: a one-time guided session is real and must not be implied away. |
| What to Do This Week, item 4 | "Compare that aggregate figure across every option you are considering, including a managed service." | TOKEN:delivery-model-binary | "...including guided-setup software." | Noun swap. |
| What to Do This Week, item 5 | "If the managed service operating model fits your constraints... SimpleScheduleAI runs on flat monthly pricing with no IT setup; the AI builds the schedule, our scheduling team checks it, and you approve it." | TOKEN:delivery-model-binary + TOKEN:triad + TOKEN:pricing-short | "If the guided-setup operating model fits your constraints... SimpleScheduleAI runs on flat monthly pricing with no setup fees; the AI builds the schedule, 21 automated rule checks validate every draft, and you approve it." | Combined tokens. |
| FAQ, "How does ShiftWizard compare to TCP/Aladtec" | "the choice between any self-serve platform and a managed service" | TOKEN:delivery-model-binary | "...and guided-setup software" | Noun swap. |
| FAQ (question) | "Can I switch from ShiftWizard to a managed service mid-contract?" | TOKEN:delivery-model-binary | "Can I switch from ShiftWizard to guided-setup software mid-contract?" | Question-heading noun swap. |
| FAQ (body) | "A managed service can typically onboard while you finish out a platform contract" | TOKEN:delivery-model-binary | "Guided-setup software can typically onboard..." | Noun swap. |
| FAQ, "Does SimpleScheduleAI have a nurse-facing mobile app?" | "No. SimpleScheduleAI is a manager-facing managed scheduling service... pair a separate staff-communication tool with a managed scheduling service." | TOKEN:delivery-model-binary | "No. SimpleScheduleAI is manager-facing nurse scheduling software... pair a separate staff-communication tool with guided-setup scheduling software." | Two instances in one answer, both converted. |
| FAQ (question + body), "What is the difference between a self-serve scheduling platform and a managed service?" | "A self-serve platform gives the nurse manager direct control and requires her to configure, build, and operate the system week to week. A managed service handles configuration, schedule generation, and system maintenance on her behalf; she reviews and approves the outputs." | PREMISE-COLLAPSE (localized) + tension resolution | "What is the difference between a self-serve scheduling platform and guided-setup software?" / "...Guided-setup software maps the rules once in a single session, then builds and maintains the schedule automatically; she reviews and approves the outputs." | This FAQ's entire premise is the self-serve-vs-managed-service binary; rewrote fully per runbook Pass-2 rule 2, preserving the real distinction (who configures, once vs. ongoing) instead of a bald service/software swap. "Handles configuration... on her behalf" (implies an external team) recast to "maps the rules once... builds and maintains automatically" (the honest guided-setup + automation mechanism). |
| Closing link text | "See how the managed service model works in practice" | TOKEN:delivery-model-binary | "See how the guided-setup model works in practice" | Noun swap. |
| Author bio | "an AI-native nurse scheduling service" | not present (source already said "SimpleScheduleAI") | n/a | No change needed here; author bio in this post doesn't carry the self-label phrase (unlike other posts' bios). |
| Sources, competitor ratings/quotes, CMS/FLSA citations | unchanged | unchanged | unchanged | Byte-identical per instructions. |

**Post 2 counts:** Token hits: 15 (`delivery-model-binary` x11, `self-label` x2, `no-it` x1, `pricing-short` x1, `triad` x2 — some counted jointly where combined in one row). Judgment calls: 6 (including 2 tension-resolution rows re-adding guided-setup framing where the source implied solo/zero configuration or a human specialist). Gaps: 0 new (the "specialist-verified"/"scheduling specialist" pattern recurred from the dry-run's known trap; no new construction). Premise-collapse: 1 localized FAQ pair (not the whole post). Facts scan: clean. Leftover sweep: clean (all "our team" hits are the standard CTA link, not service-team language).

---

## Post 3: smartlinx-alternatives.md

Same shape as Post 2: an "-alternatives" listicle, no title/H2-level premise collapse, but one
H2 ("How SimpleScheduleAI Compares to SmartLinx?") explicitly frames SmartLinx as "self-managed
software" against SimpleScheduleAI as "a service," which is the binary the runbook flags.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 3 | "It delivers the compliance documentation, callout management, and overtime tracking that SmartLinx provides, without the implementation burden, through a managed service model." | TOKEN:delivery-model-binary | "...through guided-setup software." | Direct token. |
| Comparison table, SimpleScheduleAI row | "CAHs, managed service" | TOKEN:delivery-model-binary | "CAHs, guided setup" | Table-cell noun swap. |
| H2 intro, "What Are the 5 Best..." | "SimpleScheduleAI is the only managed service on the list" | TOKEN:delivery-model-binary | "SimpleScheduleAI is the only guided-setup software on the list" | Direct token. |
| SimpleScheduleAI profile, image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | TOKEN:self-label | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text conversion, same as Post 2. |
| SimpleScheduleAI profile, body | "The managed service model means the hospital provides a roster and scheduling preferences, the AI builds the schedule, and our scheduling team checks it and handles everything else, including maintenance as staff and policies change." | TOKEN:guided-setup + TOKEN:triad + tension resolution | "A guided setup session maps unit rules with the hospital once from a roster and scheduling preferences, the AI builds the schedule, and 21 automated rule checks validate every draft after that, including maintenance as staff and policies change." | "Our scheduling team checks it and handles everything else" (human-team framing) replaced with the `triad` token's automated-check mechanism; guided-setup session named explicitly per the founder rule against implying zero-touch setup. |
| Key advantages bullet | "No ongoing IT dependency; the service manages configuration as the hospital changes" | TOKEN:system-maintains | "No ongoing IT dependency; the software maintains configuration as the hospital changes, after the initial guided setup session" | Direct token + guided-setup qualifier. |
| Key limitations bullet | "Managed service model means the nurse manager receives draft schedules rather than building them directly" | TOKEN:delivery-model-binary | "Guided-setup model means the nurse manager receives draft schedules rather than building them directly" | Noun swap. |
| Verdict paragraph | "Watch the AI build a compliant schedule and rank a callout shortlist live in the interactive simulator" | JUDGMENT (cosmetic) | "...rank a callout shortlist in the interactive simulator" | Same "live" trim as Post 2; consistency across the batch. |
| H2 "How SimpleScheduleAI Compares to SmartLinx?" intro | "SmartLinx is a self-managed software platform. SimpleScheduleAI is an AI-native nurse scheduling service." | PREMISE-COLLAPSE | "SmartLinx is a self-managed software platform that the hospital's own IT staff configure and maintain. SimpleScheduleAI is AI-native nurse scheduling software set up in one guided session and then run automatically." | The two-sentence binary ("self-managed software" vs. "a service") is the runbook's classic collapse pattern; rewrote to the honest axis (who integrates/operates vs. one guided session), consistent with the dry-run's M7 Health post treatment. |
| Comparison table, "Ongoing IT dependency" row | "None, service manages" | TOKEN:system-maintains | "None, software maintains it after guided setup" | Direct token + qualifier. |
| Comparison table, "Labor analytics dashboards" row | "Reporting via service" | JUDGMENT | "Reporting built in" | "Via service" (implies contacting a person) recast to a product capability statement. |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:self-label | "AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Direct token; author bio IS in scope (frontmatter-adjacent positioning surface per dry-run lesson 2). |
| Sources, HIPAA note, competitor facts | unchanged | unchanged | unchanged | Byte-identical. |

**Post 3 counts:** Token hits: 9 (`delivery-model-binary` x4, `self-label` x2, `system-maintains` x2, `triad` x1). Judgment calls: 3 (2 cosmetic/reporting-framing, 1 tension resolution). Gaps: 0. Premise-collapse: 1 (the "self-managed software vs. a service" H2-intro sentence pair). Facts scan: clean. Leftover sweep: clean.

---

## Post 4: ukg-alternatives-small-hospitals.md

Heaviest token density of the batch (this post's SSAI section and comparison table are almost
entirely positioning-bearing). No title-level premise collapse (it is a straight "3 best alternatives"
post, not a vendor-vs-vendor or service-vs-software framed title).

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 3 | "A managed service is the third path for CAHs with no IT and no ongoing scheduling administration bandwidth." | TOKEN:delivery-model-binary | "Guided-setup software is the third path for CAHs with no IT and no ongoing scheduling administration bandwidth." | Direct token. |
| KT bullet 4 | "For zero IT and no ongoing scheduling administration on the nurse manager's plate, SimpleScheduleAI handles both the setup and the weekly scheduling work." | TOKEN:guided-setup (adjacent) | "...SimpleScheduleAI handles the setup through a guided setup session and the weekly scheduling work automatically." | Added the guided-setup mechanism so "handles the setup" cannot be misread as either solo-manager or opaque-service. |
| KT bullet 5 | "A managed service handles most of the transition logistics on its end." | TOKEN:delivery-model-binary | "Guided-setup software handles most of the transition logistics on its end." | Noun swap. |
| Intro paragraph | "SimpleScheduleAI handles both setup and the weekly scheduling work with no IT team" | TOKEN:no-it | "...with no IT department required" | Founder rule: name what's absent, not a bald claim; "no IT team" already close, tightened to the canonical `no-it` phrasing. |
| Comparison table, "Dedicated IT department" row | "Managed service (zero IT needed)" | TOKEN:no-it | "Guided-setup software (no IT department needed)" | Direct token application in a table cell. |
| Comparison table, "Dedicated HRIS/WFM analyst" row | "Managed service handles config for you" | TOKEN:guided-setup (tension resolution) | "A guided setup session maps the rules once" | **Tension flag:** "handles config for you" is exactly the solo-vs-vendor-team ambiguity the founder rule warns about; replaced with the literal guided-setup mechanism (a single mapping session), not a vague "for you." |
| H2 "What Are the 3 Best..." intro | "SimpleScheduleAI is the only managed service and the only option that requires no IT involvement and no ongoing configuration work from the nurse manager." | TOKEN:delivery-model-binary | "SimpleScheduleAI is the only guided-setup software and the only option..." | Direct token; rest of sentence already correctly said "no ONGOING configuration work," which survives unchanged. |
| Comparison table, "Delivery model" row | "Managed service" | TOKEN:delivery-model-binary | "Guided-setup software" | Direct token. |
| SimpleScheduleAI profile, image alt text | "SimpleScheduleAI nurse scheduling managed service for critical access hospitals" | TOKEN:self-label | "SimpleScheduleAI nurse scheduling software for critical access hospitals" | Alt text conversion. |
| SimpleScheduleAI profile, body para 1 | "SimpleScheduleAI is an AI-native nurse scheduling service built specifically for Critical Access Hospitals. There is no platform to configure or maintain. The nurse manager uploads a staff roster in Excel format, the AI builds the first schedule, our team checks it, and it is delivered within 48 hours." | TOKEN:self-label + TOKEN:onboarding + TOKEN:triad (tension resolution) | "SimpleScheduleAI is AI-native nurse scheduling software built specifically for Critical Access Hospitals. There is no platform to configure or maintain. The nurse manager uploads a staff roster in Excel format, completes a guided setup session that maps unit rules once, and the AI builds the first schedule; 21 automated rule checks validate every draft, and it is delivered within 48 hours." | **Tension flag:** source said "There is no platform to configure" immediately followed by "our team checks it" — read together this risks implying either (a) zero setup happens at all, or (b) an opaque human team does it invisibly. Inserted the guided setup session explicitly (one-time, named) and swapped "our team checks it" for the `triad` token's automated-check mechanism. |
| SimpleScheduleAI profile, body para 2 | "No IT involvement. No implementation project. For a CAH coming off UKG, a managed service is typically the fastest path to operational simplicity." | TOKEN:no-it + TOKEN:delivery-model-binary | "No installation. No implementation project. For a CAH coming off UKG, guided-setup software is typically the fastest path to operational simplicity." | "No IT involvement" tightened to "No installation" (naming the specific absent thing, per `no-it` founder rule) + noun swap. |
| Key advantages bullet | "Live in 48 hours from Excel roster upload; no IT involvement or implementation project" | TOKEN:no-it + tension resolution | "Live in 48 hours from Excel roster upload through a guided setup session; no installation and no IT department required" | Added "through a guided setup session" since "no IT involvement" alone, paired with "live in 48 hours," could imply zero human-guided setup at all. |
| Key advantages bullet | "Service maintains scheduling rules as staff and policies change; no ongoing configuration burden" | TOKEN:system-maintains | "The software maintains scheduling rules as staff and policies change after the initial guided setup session; no ongoing configuration burden" | Direct token + guided-setup qualifier. |
| Key limitations bullet | "Managed service model means the nurse manager receives draft schedules rather than building them directly" | TOKEN:delivery-model-binary | "Guided-setup model means the nurse manager receives draft schedules rather than building them directly" | Noun swap. |
| Verdict paragraph | "SimpleScheduleAI requires only a current roster file and manager review time. Watch the AI build a compliant schedule and rank a callout shortlist live in the interactive simulator" | JUDGMENT (tension resolution + cosmetic) | "SimpleScheduleAI requires only a current roster file, a guided setup session, and manager review time. Watch the AI build a compliant schedule and rank a callout shortlist in the interactive simulator" | Added "a guided setup session" to the requirements list (it was silently omitted, which understates onboarding); dropped "live" per the batch-wide cosmetic consistency trim. |
| Comparison table, "Ongoing configuration burden" row | "None, service manages" | TOKEN:system-maintains | "None after guided setup, software runs it" | Direct token + guided-setup qualifier. |
| Comparison table, "Enterprise workforce analytics" row | "Reporting via service" | JUDGMENT | "Reporting via the software" | Noun swap. |
| What to Do This Week, item 3 | "A platform swap solves cost and interface issues. A managed service solves the labor and configuration burden." | TOKEN:delivery-model-binary | "...Guided-setup software solves the labor and configuration burden." | Noun swap. |
| What to Do This Week, item 5 | "Request a demo of SimpleScheduleAI framed as a UKG transition... Contact via simplescheduleai.com." | TOKEN:cta-primary (adjacent) | "Try SimpleScheduleAI framed as a UKG transition... Try the interactive simulator to see how SimpleScheduleAI handles the same requirements, or contact via simplescheduleai.com." | "Request a demo" recast to "interactive simulator" per the founder's "interactive demo/simulator only" rule (this was a live-demo-adjacent phrase, not exactly "live demo," but the same family of risk). |
| CTA block subtitle | "SimpleScheduleAI goes live in 48 hours with zero IT involvement." | TOKEN:no-it (tension resolution) | "SimpleScheduleAI goes live in 48 hours through a guided setup session, with no installation and no IT department required." | Added the guided-setup session explicitly; "zero IT involvement" alone at the CTA (highest-visibility spot) is exactly where an overclaim would do the most damage. |
| FAQ, "What does it cost to switch..." | "For a managed service, the vendor handles most of this." | TOKEN:delivery-model-binary | "For guided-setup software, the vendor handles most of this through the setup session." | Noun swap + named mechanism. |
| Author bio | "an AI-native nurse scheduling service for Critical Access Hospitals in Texas" | TOKEN:self-label | "AI-native nurse scheduling software for Critical Access Hospitals in Texas" | Direct token. |
| KT bullet 2 (unchanged) | "Based on our interviews with CAH nurse managers, most facilities on UKG use only a fraction of the platform's features..." | NOT CONVERTED — flagged, out of scope | unchanged | **Flag for founder/facts-dossier attention, not a positioning issue:** this claims real customer/interview data ("our interviews with CAH nurse managers"), which conflicts with `facts-dossier.md#product-truths` ("No customers, no pilots: SSAI is pre-launch. Never cite pilot observations..."). This is a pre-existing defect in the SOURCE post (present before this conversion), not something introduced by the positioning conversion, and is out of scope for a positioning-token pass per the brief. Left untouched in the staged copy; logged here so it surfaces for a separate facts-dossier remediation pass. |
| Sources, competitor ratings (Aladtec G2/Capterra), CMS/FLSA citations | unchanged | unchanged | unchanged | Byte-identical. |

**Post 4 counts:** Token hits: 18 (`delivery-model-binary` x9, `self-label` x3, `no-it` x4, `system-maintains` x2, `guided-setup`/`onboarding` x2, `triad` x1 — some rows combine multiple tokens). Judgment calls: 6 (4 tension-resolution rows, 2 cosmetic/reporting-framing). Gaps: 0 new. Premise-collapse: 0 (no section's argument structurally depended on service-vs-software; all conversions were token/phrase-level). Non-positioning flag: 1 (the "our interviews with CAH nurse managers" no-customers violation, pre-existing, out of scope, logged for separate remediation). Facts scan: clean (the facts-rules.mjs script's checkFacts does not currently flag this interview claim — it is a `facts-dossier.md#product-truths` "no customers/pilots" issue, not one of the external-fact rules in `facts-rules.mjs`; recommend adding a rule or a manual sweep for this pattern). Leftover sweep: clean on all migration-relevant patterns.

---

## Post 5: ukg-migration-small-hospital.md

Lightest-touch post in the batch: its body is a UKG-exit operational playbook (contract notice,
data export, parallel-run), not SSAI-positioning-heavy. Only the closing CTA/recommendation
sections carried positioning language.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| What to Do This Week, item 5 | "Ask SimpleScheduleAI to build a schedule if you are a Texas Critical Access Hospital... or watch the AI build a compliant schedule and rank a callout shortlist live in the interactive simulator." | TOKEN:cta-primary (adjacent) + JUDGMENT (cosmetic) | "Try SimpleScheduleAI's interactive simulator if you are a Texas Critical Access Hospital... or watch the AI build a compliant schedule and rank a callout shortlist in the interactive simulator." | "Ask SimpleScheduleAI to build a schedule" (implies requesting a person do it) recast to "Try SimpleScheduleAI's interactive simulator" (a direct self-serve product action); dropped "live" per batch-wide cosmetic consistency. |
| CTA block subtitle | "Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:pricing + TOKEN:no-it + TOKEN:triad | "Flat monthly pricing per facility license, no per-nurse fees, no setup fees. The AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Combined tokens: `pricing`'s product-mode "facility license" framing, `no-it`'s "no setup fees" (not bald No-IT), and `triad`'s automated-check mechanism replacing "our scheduling team." |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals in Texas" | TOKEN:self-label | "AI-native nurse scheduling software built for Critical Access Hospitals in Texas" | Direct token. |
| KT bullet 4 (unchanged) | "Based on our interviews with small hospitals that migrated off enterprise platforms, the replacement system typically felt easier to use within two weeks..." | NOT CONVERTED — flagged, out of scope | unchanged | **Same class of flag as Post 4:** this is a no-customers/no-pilots violation in `facts-dossier.md#product-truths` terms (SSAI is pre-launch; no real migration-interview data exists), pre-existing in the source, not a positioning-token issue, and out of scope for this conversion pass. Logged for separate facts-dossier remediation, not silently fixed or silently left unflagged. |
| Body (UKG exit playbook), contract/data-export/parallel-run sections | unchanged | unchanged | unchanged | Operationally educational content about UKG, not SSAI positioning; correctly out of scope. |
| Sources, FLSA/CMS citations | unchanged | unchanged | unchanged | Byte-identical. |

**Post 5 counts:** Token hits: 4 (`pricing` x1, `no-it` x1, `triad` x1, `self-label` x1). Judgment calls: 1 (the "ask SimpleScheduleAI to build" recast). Gaps: 0. Premise-collapse: 0. Non-positioning flag: 1 (interview-claim, same class as Post 4, logged not fixed). Facts scan: clean. Leftover sweep: clean.

---

## Post 6: ukg-too-complex-small-hospital.md

**This is the tension post named in the batch instructions.** Its entire thesis is that UKG's
configuration burden crushes a CAH nurse manager with no IT staff and no scheduling bandwidth. In
product mode, SSAI's contrast to that burden had to stay "guided setup session (vendor maps rules
WITH the manager, once) + browser-based + no integration project," and never drift into "the
manager configures SSAI herself, easily" — which would have undercut the post's own anti-UKG
argument (that CAH managers cannot absorb configuration burden generally, including a lighter
version of it).

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| KT bullet 3 | "SimpleScheduleAI (managed service, zero IT required)" | TOKEN:delivery-model-binary + TOKEN:no-it | "SimpleScheduleAI (guided-setup software, no IT department required)" | Direct token combination. |
| "What Works at CAH Scale" section, SimpleScheduleAI clause | "SimpleScheduleAI for CAHs where the nurse manager needs the weekly scheduling work handled without a platform to operate day to day" | unchanged | unchanged | This clause already avoided both traps (does not claim solo configuration, does not claim a service team); left as-is. |
| SimpleScheduleAI section body | "SimpleScheduleAI is AI-native nurse scheduling software built specifically for critical access hospitals. There is no platform to configure or maintain week to week. The nurse manager uploads a staff roster in Excel format, completes a guided setup session that maps unit rules with her once, and the AI builds the first schedule; 21 automated rule checks validate every draft, and it is delivered within 48 hours. Ongoing rule maintenance as staff and policies change is handled by the software after that initial session." | (already converted on arrival; verified, not re-touched) | n/a | Verified against the tension trap directly: "completes a guided setup session that maps unit rules WITH her once" is the exact sanctioned phrasing (vendor + manager together, once) — it does not say the manager configures it solo, and does not say a specialist team does recurring work. "Ongoing rule maintenance... handled by the software after that initial session" is the `system-maintains` token applied correctly (software maintains, not a team). |
| SimpleScheduleAI section, closing paragraph | "For a CAH coming off UKG, guided-setup software is typically the fastest path to operational simplicity. There is no implementation project and no ongoing IT maintenance burden; the guided setup session replaces the configuration learning curve a self-serve platform would otherwise require." | (verified) | n/a | Correctly contrasts against Aladtec's self-serve model (the OTHER real alternative in this post) rather than claiming SSAI's setup is "easy to do yourself" — the guided setup session is explicitly what replaces the self-serve learning curve, not the manager's own effort replacing it. |
| Comparison table, "IT required" row (SimpleScheduleAI column) | "None" | (verified, not changed from source) | "None" | Checked against the trap: standalone "None" in a table cell could look like a solo-config overclaim, but the row is specifically "IT required" (a true statement: SSAI needs no IT staff), not "configuration required." Cross-checked against the fuller body text above, which correctly names the guided setup session. Left as-is; recommend (not actioned here, out of scope for a token pass) a future table-header footnote clarifying "no IT" is distinct from "no setup step," since a reader skimming only the table could still misread it. |
| CTA block subtitle | "SimpleScheduleAI is built for the operational scale UKG ignores: 25 beds, no IT department, nurse manager also on clinical shifts. Flat monthly pricing, no setup fees. A guided setup session maps your unit rules once, then the AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | (verified, matches token set) | n/a | Direct, correct application of `no-it` + `pricing-short` + `guided-setup` + `triad` tokens together at the highest-visibility CTA position — the exact spot where an overclaim would do the most damage, and it does not overclaim. |
| FAQ, "What does it cost to switch from UKG..." | "Guided-setup software handles most of the transition work through its own onboarding session." | (verified) | n/a | Correct: names the vendor's onboarding session as the mechanism, not a claim that the manager configures it solo or that a hidden team does ongoing work. |
| FAQ, "What is the minimum viable scheduling tool..." | "by SimpleScheduleAI through a guided setup session with no ongoing configuration work from the nurse manager" | (verified) | n/a | Precisely threads the needle: "no ONGOING configuration work" (true, product mode) without claiming "no configuration work at all" (false/overclaim) or "a service team does it" (false in product mode). This is the canonical correct pattern for this tension across the whole batch. |

### Guided-setup-vs-solo-configuration tension log (required for this post)

1. **KT bullet 3** — source: "SimpleScheduleAI (managed service, zero IT required)." Converted to "guided-setup software, no IT department required." Resolution: the `delivery-model-binary` + `no-it` tokens together avoid both a service-team implication and a bald zero-touch claim.
2. **SimpleScheduleAI section body** (arrived pre-converted; verified) — the single highest-risk paragraph in the post, since it directly answers "how does SSAI's setup differ from UKG's burden." Verified it says the vendor maps rules "WITH her once" (guided, joint, one-time) and the software (not a person) handles ongoing maintenance. This is the load-bearing sentence for the whole post's product-mode integrity; if this sentence had said "the nurse manager configures it herself in a few minutes," the post would have silently undercut its own thesis that CAH managers cannot absorb configuration burden. It does not.
3. **Closing paragraph of the SimpleScheduleAI section** (verified) — explicitly contrasts against Aladtec's self-serve learning curve rather than claiming SSAI configuration is "easy." This preserves the post's comparative structure (three real alternatives, three real trade-offs) instead of collapsing into "just use SSAI, it's simple," which would have been both an overclaim and an anti-pattern relative to the post's own comparison table.
4. **Comparison table "IT required" row** — flagged as a residual readability risk (not a factual error): a reader who only scans the table sees "None" without the guided-setup qualifier that appears in the body text. Recommend, for a future editorial pass (out of scope here), a table footnote or an added row "Setup step" distinguishing "no IT required" from "one guided session required." Not actioned in this conversion since the table's existing "IT required: None" is accurate as stated and the fuller context is one paragraph above it.
5. **CTA block subtitle** (verified) — the single highest-visibility spot in the post; confirmed it carries the full correct token set (`no-it` + `pricing-short` + `guided-setup` + `triad`) with no shortcut to a solo-configuration claim.
6. **Two FAQ answers** (verified) — both correctly use "no ONGOING configuration work" rather than "no configuration work," which is the precise wording distinction the founder rule turns on.

**Post 6 counts:** Token hits: 2 directly logged as new changes (`delivery-model-binary` + `no-it` combined in KT bullet 3); the remainder of the post's positioning content (5 additional locations) arrived already correctly converted and was verified rather than re-edited. Judgment calls: 0 new (all verification, no rewrites needed beyond the one KT bullet). Gaps: 1 (table-footnote recommendation, not actioned, logged for a future pass). Premise-collapse: 0. Tension-log entries: 6. Facts scan: clean. Leftover sweep: clean (no "managed service," no bald "No IT.", no "live demo," no service-team language remaining anywhere in the file).

---

## Post 7: what-is-a-critical-access-hospital.md

Glossary/definitional post (postType: glossary). Almost entirely regulatory/definitional content
(42 CFR citations, CMS reimbursement mechanics, swing-bed rules) that is correctly out of scope and
byte-identical. Only the single SSAI-mention paragraph and its adjacent CTA carried positioning
language.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Body, "Why Does Critical Access Hospital Status Matter for Nurse Managers?" | "Our nurse scheduling software uses AI nurse scheduling to build the schedule against your roster and CMS staffing rules, our team checks it, you approve." | TOKEN:triad | "Our nurse scheduling software uses AI nurse scheduling to build the schedule against your roster and CMS staffing rules; 21 automated rule checks validate every draft, you approve." | Direct `triad` token application; "software" self-label was already present in source (not a service-mode phrase here), left unchanged. |
| CTA block subtitle | "SimpleScheduleAI builds the nurse schedule, our team checks it, you approve. Flat monthly pricing, no IT setup." | TOKEN:triad + TOKEN:no-it | "SimpleScheduleAI builds the nurse schedule, 21 automated rule checks validate every draft, you approve. Flat monthly pricing, no setup fees." | Combined tokens. |
| Author bio, glossary CFR/CMS/RuralHealthInfo citations, Sources list | unchanged | unchanged | unchanged | Author bio in this post already reads "AI-native nurse scheduling software" (source was already product-mode-consistent here); all regulatory content byte-identical. |

**Post 7 counts:** Token hits: 3 (`triad` x2, `no-it` x1). Judgment calls: 0. Gaps: 0. Premise-collapse: 0 (this post never argued service-vs-software; it is a CAH regulatory glossary entry with one SSAI callout paragraph). Facts scan: clean. Leftover sweep: clean.

---

## Cross-post observations

1. **`delivery-model-binary` and `guided-setup`/`no-it` combined are overwhelmingly the majority of
   this batch's edits**, exactly as the registry predicted ("THE most frequent migration
   conversion"). Across the 7 posts, `delivery-model-binary` alone accounts for roughly 30+ of the
   total token hits.

2. **The guided-setup-vs-solo-configuration tension (the batch's named risk) recurred independently
   in 4 of the 7 posts**, not just the one flagged in the task instructions (ukg-too-complex): it
   also appeared in shiftwizard-alternatives.md ("a scheduling specialist handles setup... checks
   each draft"), smartlinx-alternatives.md ("our scheduling team checks it and handles everything
   else"), and ukg-alternatives-small-hospitals.md ("Managed service handles config for you" / "our
   team checks it" paired with "There is no platform to configure"). Every instance was resolved the
   same way: name the guided setup session explicitly (vendor + manager, once) and replace any
   "team"/"specialist" checking language with the `triad` token's automated-rule-check mechanism.
   This confirms dry-run lesson 2 (cross-post observation) that this correction is real recurring
   cost, not a one-time migration cost, and strengthens the case for a dedicated registry row
   capturing the exact "specialist/team checks it" -> "21 automated rule checks validate every
   draft" substitution as its own token (currently covered only as part of `triad`, but the
   "specialist verifies" framing specifically deserves its own trigger pattern since it recurred as
   a standalone phrase separate from the "our scheduling team checks it" `triad`-adjacent phrasing).

3. **GAP-NO-TOKEN candidate:** "Service/specialist checks or verifies each draft" (e.g.
   "specialist-verified," "a scheduling specialist... checks each draft") as a distinct pattern from
   the registry's existing `triad` row (which covers "our scheduling team checks it"). Recommend
   adding an explicit trigger variant to `triad`'s regex (in the eventual `positioning-rules.mjs`)
   covering "specialist" as a noun, not just "our scheduling team," since it appeared as a
   standalone adjective ("specialist-verified") that a literal `triad`-string match would miss.

4. **No PREMISE-COLLAPSE at the title/slug level in this batch.** Unlike the dry-run's vs-class
   posts, none of these 7 titles assert a service-vs-software premise, so no Option-A retitle or
   301 was needed anywhere in S4. Two posts (shiftwizard-alternatives.md, smartlinx-alternatives.md)
   had one LOCALIZED premise-collapse each (a single FAQ pair and a single H2-intro sentence pair,
   respectively) requiring a section-level rewrite rather than a token swap, consistent with dry-run
   lesson 3 (premise triage must check H2s/FAQs, not just titles).

5. **Two pre-existing no-customers/no-pilots violations found and left untouched (correctly out of
   scope for a positioning pass), logged for separate remediation:**
   - `ukg-alternatives-small-hospitals.md`, KT bullet 2: "Based on our interviews with CAH nurse
     managers..."
   - `ukg-migration-small-hospital.md`, KT bullet 4: "Based on our interviews with small hospitals
     that migrated off enterprise platforms..."
   Both assert real customer/interview data that conflicts with `facts-dossier.md#product-truths`
   ("SSAI is pre-launch... never cite pilot observations, cohorts, facilities, or results"). Neither
   is a positioning-mode phrase (service vs. product), so converting it was out of scope for this
   batch per the brief; flagging here rather than silently leaving it unflagged or silently
   rewriting content outside the batch's mandate. `checkFacts` (facts-rules.mjs) does not currently
   have a rule pattern for this "our interviews/based on our work with" construction — recommend
   adding one, since it sits in the gap between the facts-rules script (external regulatory facts)
   and the positioning-rules script (mode framing).

6. **Anchor/H2 renames:** none of the 7 posts required a TOC/anchor rename. Every H2 in this batch
   was either already mode-neutral (e.g., "What Works at Critical Access Hospital Scale?") or a
   vendor-name section header (e.g., "SmartLinx," "Aladtec (TCP Scheduling)"), so no anchor-integrity
   fix was needed and no old->new anchor pairs exist for this batch's link-graph dependency map.

7. **Internal link anchor-text audit:** no internal link's anchor text in this batch carried
   positioning language (e.g., no link read "see our managed scheduling service"). All internal
   links (to `/how-it-works`, `/pricing`, `/roi`, `/simulator`, `/ai-nurse-scheduling`,
   `/nurse-scheduling-software`, `/critical-access-hospital-scheduling`, and sibling blog posts like
   `/blog/ukg-migration-small-hospital`, `/blog/nurse-scheduling-no-it-department-rural-hospital`,
   `/blog/cms-pbj-reporting-scheduling-software`) use topic-based or product-name anchor text, so no
   cross-post anchor-text migration or target-slug logging was required for this batch's dependency
   map.

---

## Gates run on this batch's outputs

### Facts scan (checkFacts)

Command:

```
node --input-type=module -e "
import fs from 'node:fs';
const {checkFacts}=await import('./scripts/lib/facts-rules.mjs');
const files = ['self-scheduling-problems-critical-access-hospital','shiftwizard-alternatives','smartlinx-alternatives','ukg-alternatives-small-hospitals','ukg-migration-small-hospital','ukg-too-complex-small-hospital','what-is-a-critical-access-hospital'];
let total=0;
for (const f of files) {
  const v = checkFacts(fs.readFileSync('docs/seo/migration-staging/post/'+f+'.md','utf8'));
  console.log(f+'.md:', JSON.stringify(v));
  total += v.length;
}
console.log('TOTAL VIOLATIONS:', total);
"
```

Result: **0 violations across all 7 files.** Confirmed clean per-file and corpus-wide.

### Leftover sweep

Patterns searched across all 7 staged outputs: `we build`, `we deliver`, `we configure`, `we check`,
`we send`, `log the callout with us`, `Thursday delivery`, `done for you`, `managed near SSAI`,
`No IT\.` (bald form), `live demo`, `managed service`.

| Pattern | Hits | Intentional? | Why |
| --- | --- | --- | --- |
| `we build` / `we deliver` / `we configure` / `we check` / `we send` | 0 | — | Clean. No first-person capability claims of this shape remain (dry-run lesson 10 confirms this sweep is migration-day-only and these posts had none to begin with, or they were converted to product-mode passive/third-person constructions, e.g. "the AI builds"). |
| `our team` (searched separately, broader than the brief's exact phrase list) | 7 (across 6 files) | Intentional | Every hit is the standard CTA text link "Book a call with our team" (the approved CTA pattern per facts-dossier and registry `cta-secondary`), not a service-team positioning claim. |
| `scheduling team` | 2 (ukg-too-complex-small-hospital.md) | Intentional | Both describe UKG's own required staffing ("integrated payroll-and-scheduling teams") as a competitor-fact, not SSAI's operating model. Correctly untouched. |
| `log the callout with us` | 0 | — | Clean. |
| `Thursday delivery` | 0 | — | Clean. |
| `done for you` | 0 | — | Clean. |
| `managed near SSAI` | 0 | — | Clean (pattern not present in this corpus in the first place; SSAI's own brand name never appears adjacent to "managed" in these 7 outputs). |
| `No IT\.` (bald form) | 0 | — | Clean. Every instance of "IT" absence in this batch names what's absent (installation, integration project, IT department) per the `no-it` founder rule. |
| `live demo` | 0 | — | Clean. All demo/simulator references use "interactive simulator." |
| `managed service` | 0 | — | Clean across all 7 files. Every instance found in source files was converted to `delivery-model-binary`'s "guided-setup software, not a self-configured platform the hospital integrates alone" or a direct noun-swap variant. |

**No hits require action.** All flagged rows above are confirmed intentional and correctly out of
scope (CTA pattern, competitor-fact content).

### Non-positioning flags (facts-dossier, not this batch's mandate — logged, not fixed)

Two pre-existing no-customers/no-pilots violations (see cross-post observation 5): 
`ukg-alternatives-small-hospitals.md` KT bullet 2 and `ukg-migration-small-hospital.md` KT bullet 4.
Both assert real interview/customer data SSAI does not have. Out of scope for a positioning-token
pass; recommend a separate facts-dossier remediation session addressing these two posts directly,
and consider adding a `checkFacts` rule for the "our interviews with / based on our work with"
construction so this class of violation is caught mechanically in future batches.

---

## Escalations

None requiring a stop. Two items logged above for founder/maintainer attention outside this
batch's scope (not blocking, not actioned here):

1. Two pre-existing no-customers/no-pilots claims (cross-post observation 5 / gates section) —
   recommend a separate remediation pass on `ukg-alternatives-small-hospitals.md` and
   `ukg-migration-small-hospital.md`.
2. GAP-NO-TOKEN candidate (cross-post observation 3): "specialist verifies/checks" as a distinct
   `triad`-adjacent trigger pattern, recurring independently in 3 of 7 posts in this batch alone.

## Maintenance log

| Date | Change | By |
| --- | --- | --- |
| 2026-07-05 | Batch S4 conversion: 7 posts staged to docs/seo/migration-staging/post/, ledger built from verified diffs (not converter self-report), 0 facts violations, leftover sweep clean | Claude |
