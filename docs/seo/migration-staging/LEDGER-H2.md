# Migration Staging Ledger — Batch H2

Hand-tier batch: flagged for our-team-verb constructions, first-person compliance sections, or links to not-yet-migrated managed-service slugs. Converted per `docs/seo/migration-staging/CONVERTER-BRIEF.md`, `docs/seo/positioning-registry.md`, and `docs/seo/facts-dossier.md`.

Posts (6):

1. `src/data/post/best-scheduling-software-25-bed-hospital.md` -> `docs/seo/migration-staging/post/best-scheduling-software-25-bed-hospital.md` (source-hash `3aab0a1af7f126e54bd9b879df0596ed814257ec`)
2. `src/data/post/cms-pbj-reporting-scheduling-software.md` -> `docs/seo/migration-staging/post/cms-pbj-reporting-scheduling-software.md` (source-hash `088e0187660e01b6cf97579c66b233ae8df18635`)
3. `src/data/post/healthcare-workforce-management-cah.md` -> `docs/seo/migration-staging/post/healthcare-workforce-management-cah.md` (source-hash `06f2e40abf66997ae94886904fc6d9ed5745edea`)
4. `src/data/post/hospital-staff-scheduling-software-critical-access.md` -> `docs/seo/migration-staging/post/hospital-staff-scheduling-software-critical-access.md` (source-hash `ebee4b641ef4d3f2ce6cd481566ac7ad27caee33`)
5. `src/data/post/schedule360-alternatives.md` -> `docs/seo/migration-staging/post/schedule360-alternatives.md` (source-hash `25aca6018de2e71e8fe4dba299590ddaa79f164b`)
6. `src/data/post/smart-square-alternatives-small-rural-hospitals.md` -> `docs/seo/migration-staging/post/smart-square-alternatives-small-rural-hospitals.md` (source-hash `caa9d0ff18a49f1242569c8858e34c28b687d75c`)

No `src/` files touched. No commits made.

---

## Post 1: best-scheduling-software-25-bed-hospital.md

| Location | Original | Type | Replacement | Note |
| --- | --- | --- | --- | --- |
| Body, "1. SimpleScheduleAI" intro | "The managed service model means a nurse manager uploads the roster via Excel and defines preferences and constraints; the AI builds three complete schedule drafts, our team checks them, and they arrive within 48 hours." | TOKEN: `delivery-model-binary` + `team-reference` | "It is guided-setup software, not a self-configured platform the hospital integrates alone: a nurse manager uploads the roster via Excel and defines preferences and constraints; the AI builds three complete schedule drafts, 21 automated rule checks validate each one, and they arrive within 48 hours." | `our team checks them` -> `21 automated rule checks validate each one` (system-maintains-adjacent; rule-check attribution, not roster/list maintenance) |
| Body, Key limitations (SimpleScheduleAI) | "Managed service model means the nurse manager receives draft schedules rather than building them directly..." | JUDGMENT (delivery-model-binary derivative) | "Guided-setup software means the nurse manager receives draft schedules rather than building them directly..." | Direct swap, no registry row exact match |
| Body, Verdict (SimpleScheduleAI) link anchor | `[managed service vs scheduling software](/blog/managed-service-vs-scheduling-software)` | Anchor text migration (lesson 9) | `[guided-setup software vs. self-configured platforms](/blog/managed-service-vs-scheduling-software)` | href unchanged; see Dependency Map below |
| Decision table row | "Managed service is acceptable" | JUDGMENT | "Guided-setup software is a fit" | Table cell, non-heading |
| Body, "How Does SimpleScheduleAI Fit the 25-Bed Model?" | "The managed service model is the structural differentiator. Rather than configuring software and maintaining it, the nurse manager at a 25-bed CAH submits a roster and preferences; the AI builds three draft schedules and our team checks them..." | TOKEN: `delivery-model-binary` + `team-reference` | "Guided-setup software, not a self-configured platform the hospital integrates alone, is the structural differentiator. Rather than configuring software and maintaining it, the nurse manager at a 25-bed CAH submits a roster and preferences; the AI builds three draft schedules and 21 automated rule checks validate each one..." | Same pair as row 1 |
| Body, same section, honest-limitation sentence | "...organizations that specifically want to operate self-serve software under their own control rather than approve managed-service drafts." | JUDGMENT | "...rather than approve guided-setup drafts." | Minimal swap |
| Our Take callout | "...a managed service is the only model that removes scheduling work entirely." | JUDGMENT | "...guided-setup software is the only model that removes scheduling work entirely." | Direct swap |
| What to Do This Week, item 3 | "The managed service lets you compare actual time burden against your week-one baseline." | JUDGMENT | "This guided-setup model lets you compare actual time burden against your week-one baseline." | Direct swap |
| FAQ 1 answer | "...the managed service model typically produces a better time ROI." | JUDGMENT | "...guided-setup software typically produces a better time ROI." | Direct swap |
| FAQ 5 ("What is the difference...") answer, closing sentence | "...while a managed service removes the build entirely." | JUDGMENT | "...while guided-setup software removes the build entirely." | FAQ question itself unchanged (category-comparison question is mode-neutral per registry note 1; "managed scheduling service" retained as the generic category term in the question and first sentence of the answer, consistent with dossier "category/comparison use is fine") |
| Body, Verdict (Aladtec) link anchor | `[Aladtec vs managed service](/blog/aladtec-vs-managed-service)` | **CORRECTION, consolidation pass 2026-07-05** — anchor text migration (lesson 9), missed in original batch conversion | `[Aladtec vs SimpleScheduleAI](/blog/aladtec-vs-managed-service)` | href unchanged; slug renames to `aladtec-vs-simplescheduleai` in the 301 pass on migration day, not here. See `docs/seo/migration-staging/SLUG-DEPENDENCY-MAP.md`. |

Frontmatter: reviewed (title, excerpt, description, tags) — no positioning-bearing phrases found; unchanged.

H2/TOC renames: none in this post.

Facts/regulatory/competitor content: byte-identical (Aladtec, NurseGrid, When I Work, Homebase quotes, ratings, Sources section, CMS §485.635, FLSA, NSI 2024 stat all untouched).

---

## Post 2: cms-pbj-reporting-scheduling-software.md

| Location | Original | Type | Replacement | Note |
| --- | --- | --- | --- | --- |
| Body, "How Does SimpleScheduleAI Fit a Distinct-Part SNF Unit?" opening | "SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: the AI builds the schedule, our scheduling team checks it, you approve" | TOKEN: `delivery-model-binary` + `team-reference` | "SimpleScheduleAI is guided-setup nurse scheduling software, not a self-configured platform the hospital integrates alone: the AI builds the schedule, 21 automated rule checks validate it, you approve" | Removed first-person "we build and operate ourselves" per hand-tier flag; `our scheduling team checks it` -> `21 automated rule checks validate it` |
| Body, same section, second paragraph | "The rest of the filing is not ours: SimpleScheduleAI does not produce a PBJ file..." | JUDGMENT | "The rest of the filing is not part of the service: SimpleScheduleAI does not produce a PBJ file..." | Removed first-person possessive "ours" |
| What to Do This Week, item 5 | "See [how SimpleScheduleAI works](/how-it-works) for the approach we use with Texas Critical Access Hospitals..." | JUDGMENT | "See [how SimpleScheduleAI works](/how-it-works) for the approach used with Texas Critical Access Hospitals..." | Removed first-person "we use" per hand-tier flag |

Frontmatter: reviewed — no positioning phrases; unchanged.

H2/TOC renames: none.

Internal links: no links to `/blog/managed-service-vs-scheduling-software` or other not-yet-migrated managed-service slugs in this post. No dependency-map entries.

Facts/regulatory content: byte-identical (42 CFR Part 483, 482.58, PBJ Policy Manual, CAHMPAS 36.2% stat, Sources section all untouched).

---

## Post 3: healthcare-workforce-management-cah.md

| Location | Original | Type | Replacement | Note |
| --- | --- | --- | --- | --- |
| Key Takeaways, last bullet | "A managed service approach delivers the first two capabilities without requiring the hospital to configure or maintain a software platform." | JUDGMENT | "Guided-setup software delivers the first two capabilities without requiring the hospital to configure or maintain a software platform itself." | Direct swap |
| Body, "Which WFM Capabilities... Need First?" closing sentence + link | "A managed service can deliver the first two without any internal implementation, which is the difference between [a managed service and scheduling software](/blog/managed-service-vs-scheduling-software) you operate yourself." | TOKEN: `delivery-model-binary` (body) + anchor text migration (lesson 9) | "Guided-setup software can deliver the first two without any internal implementation, which is the difference between [guided-setup software and a self-configured platform](/blog/managed-service-vs-scheduling-software) you operate yourself." | href unchanged; see Dependency Map |
| Comparison table, "Ongoing maintenance" row, CAH-service column | "Service team handles updates" | JUDGMENT (`system-maintains`-adjacent) | "Software maintains rules and keeps them current" | Rule-maintenance attributed to the software per system-maintains token intent, not a human team |
| Comparison table, "Scheduling output" row, CAH-service column | "Drafted by service; manager approves" | JUDGMENT | "Drafted by the software; manager approves" | Direct swap |
| Body, "How Does SimpleScheduleAI Help?" opening | "SimpleScheduleAI is an AI-native nurse scheduling service for [nurse scheduling at critical access hospitals](/critical-access-hospital-scheduling): the AI builds the schedule, our scheduling team checks it, you approve. We are deliberately scoped to the scheduling side of critical access hospital WFM... Our team handles the weekly scheduling work using [AI nurse scheduling](/ai-nurse-scheduling) tooling..." | TOKEN: `team-reference` + JUDGMENT (first-person "We"/"Our team") | "...the AI builds the schedule, 21 automated rule checks validate it, you approve. It is deliberately scoped to the scheduling side of critical access hospital WFM... The [AI nurse scheduling](/ai-nurse-scheduling) engine handles the weekly scheduling work..." | Two first-person "we/our" constructions removed per hand-tier flag in addition to the team-reference token |
| Body, same section, second paragraph | "We track overtime risk against the applicable FLSA threshold in real time. We do not offer credential expiration tracking, multi-facility analytics dashboards, or EHR-embedded time-and-attendance." | JUDGMENT (first-person "we") | "Overtime risk is tracked against the applicable FLSA threshold in real time. Credential expiration tracking, multi-facility analytics dashboards, and EHR-embedded time-and-attendance are not offered." | Passive-voice rewrite removes two "we" constructions; no fact changed (NOT-shipped list matches facts-dossier.md#product-truths) |
| Body, same section, honest-limitation sentence | "...if your WFM challenge is primarily a staffing shortage rather than a scheduling process problem, a managed scheduling service will not solve it." | JUDGMENT | "...guided-setup software will not solve it." | Direct swap |
| What to Do This Week, item 5 | "[Book a call with our team](...) to see whether a managed scheduling service fits your hospital..." | JUDGMENT | "[Book a call with our team](...) to see whether guided-setup software fits your hospital..." | "our team" retained — it is the standing CTA link text (`cta-secondary` registry row: "Book a call with our team", identical in both modes), not a capability claim |
| FAQ 2 answer | "A structured scheduling process or managed service that maintains an audit trail is a significant improvement over informal tracking." | JUDGMENT | "A structured scheduling process or guided-setup software that maintains an audit trail is a significant improvement over informal tracking." | Direct swap |

Frontmatter: reviewed — no positioning phrases; unchanged.

H2/TOC renames: none (no H2 in this post carries "managed service" in its heading text; "How Does SimpleScheduleAI Help?" heading is neutral).

Facts/regulatory content: byte-identical (42 CFR 485.635, 485.631, FLSA fact sheet #54, 1,350+ CAH count, NSI 2024 $56,300 turnover stat, Sources section all untouched). Note: this post still cites "2024 NSI... Retention Report" at $56,300 — this is the OLDER 2024-edition figure, distinct from the facts-dossier's 2025-report ($61,110) and 2026-edition ($60,090) figures; left untouched as out of scope for a positioning-only conversion pass (not a positioning phrase), flagged here for a future facts-accuracy pass, not fixed in this batch.

Internal links: 1 link to `/blog/managed-service-vs-scheduling-software`, anchor text migrated. Logged in Dependency Map below.

---

## Post 4: hospital-staff-scheduling-software-critical-access.md

| Location | Original | Type | Replacement | Note |
| --- | --- | --- | --- | --- |
| Key Takeaways, last bullet | "A managed scheduling service removes the operate-the-software burden entirely. Self-serve software keeps it." | JUDGMENT | "Guided-setup software removes the operate-the-software burden entirely. Self-serve software keeps it." | Direct swap |
| **H2 + TOC rename (premise-triage, lesson 3/5)** | H2: `## Is Self-Serve Software or a Managed Service Right for Your Hospital?` / TOC: `[Is Self-Serve Software or a Managed Service Right for Your Hospital?](#is-self-serve-software-or-a-managed-service-right-for-your-hospital)` | PREMISE-COLLAPSE (H2 carries positioning per registry runbook lesson 3) | H2: `## Is Self-Serve Software or Guided-Setup Software Right for Your Hospital?` / TOC: `[Is Self-Serve Software or Guided-Setup Software Right for Your Hospital?](#is-self-serve-software-or-guided-setup-software-right-for-your-hospital)` | **Anchor slug changed**: old `#is-self-serve-software-or-a-managed-service-right-for-your-hospital` -> new `#is-self-serve-software-or-guided-setup-software-right-for-your-hospital`. No inbound fragment links to this anchor found elsewhere in the corpus (checked via grep across `src/data/post` and `src/data/article` for the old anchor string — 0 hits) |
| Body, under renamed H2, para 1 | "Self-serve software is right when the hospital has a dedicated scheduler or a nurse manager with protected administrative hours and IT support. A managed service is right when the nurse manager takes clinical shifts..." | TOKEN: `delivery-model-binary` | "...Guided-setup software is right when the nurse manager takes clinical shifts..." | Direct swap |
| Body, under renamed H2, para 3 + link | "A managed scheduling service shifts the construction work to the vendor. The nurse manager moves from builder to reviewer and approver... For a fuller breakdown of the two models, see [scheduling software versus a managed service](/blog/managed-service-vs-scheduling-software)." | TOKEN: `delivery-model-binary` (body) + anchor text migration (lesson 9) | "Guided-setup software shifts the construction work to the AI and the system's automated rule checks. The nurse manager moves from builder to reviewer and approver... see [scheduling software versus guided-setup software](/blog/managed-service-vs-scheduling-software)." | "shifts the construction work to the vendor" -> "to the AI and the system's automated rule checks" (avoids attributing the shift to a human vendor/team); href unchanged, see Dependency Map |
| Body, under renamed H2, para 4 | "...self-serve software is the better fit and a managed service gives up control you would actually use." | JUDGMENT | "...self-serve software is the better fit and guided-setup software gives up control you would actually use." | Direct swap |
| Body, "How Does SimpleScheduleAI Fit a Critical Access Hospital?" opening | "...the AI builds three complete schedule drafts and our scheduling team checks each one within 48 hours..." | TOKEN: `team-reference` | "...the AI builds three complete schedule drafts and 21 automated rule checks validate each one within 48 hours..." | Direct token swap |
| Body, same section, limitation sentence | "...real-time direct schedule edits route through the service rather than happening instantly in a self-service interface." | JUDGMENT | "...real-time direct schedule edits route through the software rather than happening instantly in a self-service interface." | Minor: "the service" -> "the software" for consistency with guided-setup framing |
| Comparison table, "Setup at a Critical Access Hospital" row, SimpleScheduleAI | "Managed; no IT, Excel roster in" | JUDGMENT | "Guided setup session; no IT, Excel roster in" | Uses `guided-setup` registry token wording ("A guided setup session maps your unit rules with you, once.") |
| Closing CTA block | "SimpleScheduleAI's AI builds your nurse schedules and our team checks them, maintains CMS §485.635 documentation..." | TOKEN: `team-reference` | "SimpleScheduleAI's AI builds your nurse schedules and 21 automated rule checks validate them, maintains CMS §485.635 documentation..." | Direct swap |
| FAQ 1 (best hospital staff scheduling software) answer | "...is usually better served by a managed scheduling service than by self-serve software." | JUDGMENT | "...is usually better served by guided-setup software than by self-serve software." | Direct swap |
| FAQ 4 heading + answer | Q: "How is a managed scheduling service different from scheduling software?" / A: "Scheduling software gives the nurse manager tools to build schedules herself. A managed scheduling service builds them for her and delivers drafts for approval. Software reduces scheduling time but keeps the construction work in-house. A managed service removes it. At a CAH where the manager takes clinical shifts, the managed model usually produces a better time outcome." | JUDGMENT (question retained as category-neutral per registry note 1; answer converted) | Q: "How is guided-setup scheduling software different from self-serve scheduling software?" / A: "Self-serve scheduling software gives the nurse manager tools to build schedules herself. Guided-setup software builds them for her and delivers drafts for approval. Self-serve software reduces scheduling time but keeps the construction work in-house. Guided-setup software removes it. At a CAH where the manager takes clinical shifts, the guided-setup model usually produces a better time outcome." | Question reworded too (not left as bald "managed scheduling service" per hand-tier flag on this post: this FAQ pair explicitly frames the category distinction as the post's own voice, not a quoted external term, so it was converted in full rather than left per registry note 1's narrower carve-out) |
| FAQ 5 answer, closing sentence | "Callout replacement and CMS §485.635 documentation are handled by the service rather than in the spreadsheet." | JUDGMENT | "Callout replacement and CMS §485.635 documentation are handled automatically rather than in the spreadsheet." | Removed "by the service" (human/vendor framing) in favor of "automatically" |

Frontmatter: reviewed — no positioning phrases; unchanged.

Internal links: 2 links to not-yet-migrated managed-service slugs. Both logged in Dependency Map below:

- `/blog/managed-service-vs-scheduling-software` (anchor migrated, see rows above)
- `/blog/aladtec-vs-managed-service` (**CORRECTION, consolidation pass 2026-07-05**: anchor text migrated from "Aladtec versus a managed service" to "Aladtec vs SimpleScheduleAI" — the product-mode anchor for a vs-class title reference, per the Option-A vendor-vs-vendor retitle pattern in registry lesson 7. Href unchanged (`/blog/aladtec-vs-managed-service`); the slug itself renames to `aladtec-vs-simplescheduleai` in the 301 pass on migration day, not in this anchor-text fix. See `docs/seo/migration-staging/SLUG-DEPENDENCY-MAP.md`.)

Facts/regulatory content: byte-identical (Deputy/ShiftWizard/Aladtec ratings, FLSA 8-and-80 educational framing, CMS §485.635, Sources section, Rural Health Information Hub link all untouched). Note: this post's FLSA 8-and-80 language ("Hospitals can use the FLSA 8-and-80 overtime system...") remains educational/third-party framing throughout (never claimed as an SSAI-built feature) — consistent with the project's no-8-and-80-overclaim rule; left untouched as it predates and is outside this positioning conversion's scope.

---

## Post 5: schedule360-alternatives.md

| Location | Original | Type | Replacement | Note |
| --- | --- | --- | --- | --- |
| Key Takeaways, 4th bullet | "...A managed service is a fourth option for facilities where the nurse manager cannot sustain platform administration alongside clinical duties." | JUDGMENT | "...Guided-setup software is a fourth option for facilities where the nurse manager cannot sustain platform administration alongside clinical duties." | Direct swap |
| Key Takeaways, 5th bullet | "...SimpleScheduleAI handles the schedule build, the callout coverage, and the CMS audit trail as part of a managed service for Texas Critical Access Hospitals." | JUDGMENT | "...SimpleScheduleAI handles the schedule build, the callout coverage, and the CMS audit trail as guided-setup software for Texas Critical Access Hospitals." | Direct swap |
| Body, intro recap paragraph | "SimpleScheduleAI handles the scheduling work as a managed service when platform administration is the real constraint." | JUDGMENT | "SimpleScheduleAI handles the scheduling work as guided-setup software when platform administration is the real constraint." | Direct swap |
| Body, "1. SimpleScheduleAI" opening + link | "It is a managed [nurse scheduling software](/nurse-scheduling-software) service built specifically for Texas Critical Access Hospitals. Unlike a self-serve platform, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a specialist handles setup from an Excel roster upload (3 to 5 days), checks each draft, and maintains the system as the roster and policies change. For the broader category framing, see our comparison of [managed service vs. scheduling software](/blog/managed-service-vs-scheduling-software)." | TOKEN: `delivery-model-binary` + `guided-setup` (body) + anchor text migration (lesson 9) | "It is guided-setup [nurse scheduling software](/nurse-scheduling-software), not a self-configured platform the hospital integrates alone, built specifically for Texas Critical Access Hospitals. Unlike a self-serve platform, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a guided setup session handles setup from an Excel roster upload (3 to 5 days), 21 automated rule checks validate each draft, and the software maintains the system as the roster and policies change. For the broader category framing, see our comparison of [guided-setup software vs. scheduling software](/blog/managed-service-vs-scheduling-software)." | "a specialist handles setup" -> "a guided setup session handles setup" (canonical string per `guided-setup` registry token); "checks each draft" -> "21 automated rule checks validate each draft" (`team-reference`); "the system" maintenance reattributed from an implied human to "the software" (`system-maintains`); href unchanged, see Dependency Map |
| Body, same section, Key advantages bullet | "Service maintains scheduling rules as staff and policies change; no manager-side configuration burden between releases" | JUDGMENT (`system-maintains`) | "The software maintains scheduling rules as staff and policies change; no manager-side configuration burden between releases" | Direct swap |
| Body, same section, Key limitations bullet | "Managed service model means the nurse manager receives draft schedules rather than building them directly; less real-time control than a self-serve platform like Schedule360" | JUDGMENT | "Guided-setup software model means the nurse manager receives draft schedules rather than building them directly; less real-time control than a self-serve platform like Schedule360" | Direct swap |
| Comparison table ("How SimpleScheduleAI Compares to Schedule360"), "Delivery model" row | "Managed service (AI builds, scheduler checks)" | JUDGMENT | "Guided-setup software (AI builds, automated rule checks validate)" | "scheduler checks" -> "automated rule checks validate" (`team-reference`) |
| Same table, "Ongoing configuration burden" row | "None; service maintains rules between releases" | JUDGMENT (`system-maintains`) | "None; the software maintains rules between releases" | Direct swap |
| What to Do This Week, item 3 | "A platform swap solves design-fit issues. A managed service solves scheduling labor." | JUDGMENT | "A platform swap solves design-fit issues. Guided-setup software solves scheduling labor." | Direct swap |
| FAQ 3 answer | "Switching to a managed service takes 3 to 5 days for the specialist to onboard from your roster file." | JUDGMENT | "Switching to guided-setup software takes 3 to 5 days from an Excel roster upload." | Removed "the specialist to onboard" (human-agent framing); reworded to match the `guided-setup` token's system framing |
| FAQ 5 answer, closing sentence | "A CAH-appropriate alternative, either a hospital-nursing self-serve platform or a managed service, typically reduces both cost components and the configuration burden simultaneously." | JUDGMENT | "A CAH-appropriate alternative, either a hospital-nursing self-serve platform or guided-setup software, typically reduces both cost components and the configuration burden simultaneously." | Direct swap |

Frontmatter: reviewed — no positioning phrases; unchanged.

H2/TOC renames: none (no H2 in this post carries "managed service" in heading text).

Internal links: 1 link to `/blog/managed-service-vs-scheduling-software`, anchor text migrated. Logged in Dependency Map below.

Facts/regulatory content: byte-identical (Schedule360 KLAS/Capterra/SelectHub citations, ShiftWizard/Aladtec/NurseGrid ratings and quotes, CMS §485.635, FLSA, Texas Labor Code link, Sources section all untouched).

---

## Post 6: smart-square-alternatives-small-rural-hospitals.md

| Location | Original | Type | Replacement | Note |
| --- | --- | --- | --- | --- |
| Key Takeaways, 4th bullet | "...SimpleScheduleAI is the managed-service alternative." | JUDGMENT | "...SimpleScheduleAI is the guided-setup alternative." | Direct swap |
| Body, intro recap paragraph | "SimpleScheduleAI is the managed-service option when the goal is removing the scheduling work entirely." | JUDGMENT | "SimpleScheduleAI is the guided-setup option when the goal is removing the scheduling work entirely." | Direct swap |
| Body, "1. SimpleScheduleAI" opening | "It is a managed [nurse scheduling service](/how-it-works) built specifically for Critical Access Hospitals in Texas. Where Smart Square is a self-serve enterprise platform configured and maintained by labor-management staff, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a specialist handles setup from an Excel roster upload, checks each draft, and maintains the system as the roster changes." | TOKEN: `delivery-model-binary` (implicit) + `guided-setup` + `team-reference` + `system-maintains` | "It is guided-setup [nurse scheduling software](/how-it-works) built specifically for Critical Access Hospitals in Texas. Where Smart Square is a self-serve enterprise platform configured and maintained by labor-management staff, SimpleScheduleAI requires no configuration work from the nurse manager: the AI builds draft schedules each cycle, while a guided setup session handles setup from an Excel roster upload, 21 automated rule checks validate each draft, and the software maintains the system as the roster changes." | Same pattern as post 5's SimpleScheduleAI section |
| Body, same section, next paragraph | "The service implements the hospital's rules, maintains them as staff changes occur, and updates them when policies change." | JUDGMENT (`system-maintains`) | "The software implements the hospital's rules, maintains them as staff changes occur, and updates them when policies change." | Direct swap |
| Body, same section, Key limitations bullet | "Managed service model means less direct manager control than a self-serve platform; schedule changes go through the service rather than being adjustable in real time by the manager" | JUDGMENT | "Guided-setup software model means less direct manager control than a self-serve platform; schedule changes go through the software rather than being adjustable in real time by the manager" | Direct swap |
| Body, "2. ShiftWizard" opening | "The tradeoff relative to a managed service is ownership." | JUDGMENT | "The tradeoff relative to guided-setup software is ownership." | Direct swap |
| Body, "How SimpleScheduleAI Compares to Smart Square?" opening + link | "...SimpleScheduleAI is an AI-native nurse scheduling service sized to a single Critical Access Hospital, where a scheduling specialist handles setup, rule maintenance, and draft generation... For a deeper treatment of the model difference, see [managed scheduling service vs. scheduling software](/blog/managed-service-vs-scheduling-software)." | TOKEN: `guided-setup` (body) + anchor text migration (lesson 9) | "...where a guided setup session handles setup, rule maintenance, and draft generation... see [guided-setup software vs. scheduling software](/blog/managed-service-vs-scheduling-software)." | href unchanged, see Dependency Map |
| Comparison table ("How SimpleScheduleAI Compares to Smart Square"), "Operating model" row | "Managed service, specialist-run" | JUDGMENT | "Guided-setup software, AI-run with automated rule checks" | Direct swap, avoids "specialist" (human) framing |
| Same table, "Staff needed to run it" row | "None; service handles it" | JUDGMENT | "None; the software handles it" | Direct swap |
| Same table, "Configuration maintenance" row | "Service responsibility" | JUDGMENT (`system-maintains`) | "Handled by the software" | Direct swap |
| Our Take-adjacent paragraph before callout | "...an enterprise platform's value largely depends on capabilities a single facility does not use, while the operating overhead still applies. For a hospital inside a large health system, Smart Square's analytics depth is the point and a single-facility managed service would not fit." | JUDGMENT | "...and a single-facility guided-setup product would not fit." | Direct swap |
| What to Do This Week, item 4 | "Ask how a managed service would handle the same scenarios without adding work to the nurse manager." | JUDGMENT | "Ask how guided-setup software would handle the same scenarios without adding work to the nurse manager." | Direct swap |
| FAQ 1 answer | "...SimpleScheduleAI is an AI-native nurse scheduling service sized to a single 25-bed Critical Access Hospital and run by a scheduling specialist rather than the hospital." | JUDGMENT (`team-reference`-adjacent) | "...and run through a guided setup session rather than by the hospital." | Direct swap |
| FAQ 4 answer, closing sentence | "By contrast, a managed service like SimpleScheduleAI starts from an Excel roster upload and produces a first draft in days, because the service handles setup rather than the hospital configuring the platform itself." | JUDGMENT | "By contrast, guided-setup software like SimpleScheduleAI starts from an Excel roster upload and produces a first draft in days, because the software handles setup rather than the hospital configuring the platform itself." | Direct swap |
| **Mechanical fix (not positioning)** | TOC entry `[What to Do This Week](#what-to-do-this-week)` | Transcription-error fix, caught by `check-blog` hard-fail on first run | `[What to Do This Week?](#what-to-do-this-week)` | Source heading is `## What to Do This Week?` (with `?`); my first draft dropped the `?` from the TOC anchor text only, causing a TOC-heading text mismatch. Fixed before finalizing; confirmed source itself passes check-blog with 0 failures, so this was introduced during transcription, not present upstream |

Frontmatter: reviewed — no positioning phrases; unchanged.

H2/TOC renames: none positioning-related (the mechanical TOC fix above is not a rename, it restores exact source wording).

Internal links: 1 link to `/blog/managed-service-vs-scheduling-software`, anchor text migrated. Logged in Dependency Map below.

Facts/regulatory content: byte-identical (Smart Square/symplr KLAS and Capterra citations, ShiftWizard/NurseGrid/Deputy/When I Work/Smartlinx ratings and quotes, CMS §485.635, FLSA 8-and-80 educational framing, Sources section all untouched).

---

## Dependency Map (lesson 9: internal links to not-yet-migrated managed-service slugs)

| Target slug | Referenced from (this batch) | Anchor text before -> after | Target migration status (checked this session) |
| --- | --- | --- | --- |
| `/blog/managed-service-vs-scheduling-software` | Post 1 (best-scheduling-software-25-bed-hospital.md), Post 3 (healthcare-workforce-management-cah.md), Post 4 (hospital-staff-scheduling-software-critical-access.md), Post 5 (schedule360-alternatives.md), Post 6 (smart-square-alternatives-small-rural-hospitals.md) | Varies per post (see rows above); all migrated to a "guided-setup software vs. self-configured / scheduling software" style phrase | **Live `src/` file unchanged** at `src/data/post/managed-service-vs-scheduling-software.md` (source-hash `6c227d2aafb568d2d22c92c8f9b2a1b4af1493aa` as of this session) — href kept as-is per brief. **However**, a staged conversion of this exact post already exists from a prior batch at `docs/seo/migration-staging/post/guided-setup-vs-self-configured-nurse-scheduling-software.md`, retitled "Guided-Setup vs. Self-Configured Nurse Scheduling Software: What Critical Access Hospitals Need." That staged file has not been published/renamed in `src/`, so the live URL and slug are still `/blog/managed-service-vs-scheduling-software` today. **Flag for migration day**: when that staged post goes live, if its canonical slug changes, every href logged in this batch (5 posts, 6 link instances) needs a URL update pass too, not just anchor text — currently only anchor text was in scope per this batch's instructions ("migrate the anchor TEXT per registry, keep the href"). |
| `/blog/aladtec-vs-managed-service` | Post 1 (best-scheduling-software-25-bed-hospital.md, 2 instances: "Aladtec vs managed service" verdict link and Sources reference is absent, only the verdict-section link), Post 4 (hospital-staff-scheduling-software-critical-access.md, "Aladtec versus a managed service" in the roundup-links sentence) | **Not migrated in this batch** — left as "Aladtec vs managed service" / "Aladtec versus a managed service" | Live `src/data/post/aladtec-vs-managed-service.md` exists and has **not** been staged/converted by any batch found this session (`docs/seo/migration-staging/post/` has no `aladtec-vs-managed-service.md` and no renamed equivalent). Per registry lesson 7, this is a vs-class post whose eventual treatment is a full retitle to "Aladtec vs. SimpleScheduleAI" with a new slug and 301, not an anchor-text-only swap — judged out of scope for a mechanical anchor migration in this batch and left untouched. Flagging for the vs-class retitle pass. |

---

## Gates

- **Facts scan (`checkFacts` via `npm run check-blog`)**: 0 hard failures across all 6 staged outputs. Confirmed by running `node scripts/check-blog.mjs` against each staged file individually.
- **check-blog hard-fail gate**: 1 hard failure found and fixed (Post 6's TOC/heading mismatch on "What to Do This Week" — a transcription slip introduced by the converter, confirmed absent from the live source via a source-file check-blog run). After the fix, all 6 staged files return 0 hard failures.
- **Remaining WARN-level output** (not gates, reported for completeness): pre-existing warnings carried over unchanged from source (body word count outside post-type range on posts 2, 3, 4; image-family reuse on posts 1, 4, 5; "author bio does not reference CAH" on posts 4, 6; "volume language 'consistently'" on post 3 — all present in the original `src/` files too, not introduced this session) plus new `[product-mode-leak]` / `[triad-drift]` WARNs on posts 1, 2, 3, 4, 5, 6 wherever a converted sentence now contains product-mode phrasing ("guided-setup software," "21 automated rule checks," etc.) inside what the live `check-blog` script still classifies as service-mode content. This is expected and inherent to a mid-migration staged file — the positioning WARN rule polices the live corpus, not staging output, and these WARNs will resolve once the whole corpus flips together on migration day.
- **Leftover sweep** (`we build/deliver/configure/check/send`, `our team/scheduling team/specialist`, `log the callout with us`, `Thursday delivery`, `done for you`, `managed near SSAI`, bald `No IT.`, `live demo`):
  - `we build/deliver/configure/check/send`: 0 hits.
  - `our team` / `our scheduling team` / `our specialist`: only the standing CTA link text "Book a call with our team →" (6 instances, one per post) — this is the registry's `cta-secondary` row, identical in both service and product mode, not a capability claim. Intentional, not touched.
  - `log the callout with us`: 0 hits.
  - `Thursday delivery`: 0 hits.
  - `done for you`: 1 hit (Post 5, "need the scheduling work done for you") — pre-existing in source unchanged, third-person framing describing reader need, not a first-person "we do it for you" construction. Intentional-logged, not fixed.
  - `managed` (near SSAI): 6 raw hits, all accounted for above — 5 are the `/blog/managed-service-vs-scheduling-software` href (kept per brief) plus 1 `/blog/aladtec-vs-managed-service` href (kept, vs-class out of scope) plus 2 FAQ mentions of the generic "managed scheduling service" category term in Post 1 and Post 4, both permitted under the dossier's "category/comparison use is fine" carve-out and both paired with a converted answer describing SSAI's own model in guided-setup terms.
  - Bald `"No IT."`: 0 hits.
  - `live demo`: 0 hits.

## Unresolvable / flagged for follow-up

1. **`/blog/aladtec-vs-managed-service`** (2 references, posts 1 and 4): left un-migrated per vs-class scope (registry lesson 7); needs its own retitle/301 pass, not an anchor-text swap.
2. **Post 3's NSI stat**: cites "2024 NSI... Retention Report" at $56,300, which is neither the facts-dossier's 2025-report figure ($61,110) nor its 2026-edition figure ($60,090). Not a positioning issue and out of scope for this batch's mandate, but flagged for a facts-accuracy pass.
3. **Anchor slug change on Post 4**: the renamed H2 (`#is-self-serve-software-or-a-managed-service-right-for-your-hospital` -> `#is-self-serve-software-or-guided-setup-software-right-for-your-hospital`) had no inbound fragment references found in a corpus-wide grep this session, but that check was limited to `src/data/post` and `src/data/article`; it does not cover any external backlinks or bookmarked URLs pointing at the old fragment.
4. **`managed-service-vs-scheduling-software` staged-but-not-live status**: see Dependency Map note — if the staged retitle (`guided-setup-vs-self-configured-nurse-scheduling-software.md`) ships with a new slug, all 6 href instances logged in this batch will need a follow-up URL-update pass in addition to the anchor-text work already done here.

## Correction (2026-07-05): SSAI self-referential "service" residue swept

The original batch left the product's own self-description as "service" in several
non-prose surfaces that this batch's leftover sweep did not check (image alt text, rating
table cells, author bios) plus a few body sentences that had been converted to "guided-setup
software" everywhere except the noun itself. Fixed in this session, file/line/old->new:

| File | Line | Old | New |
| --- | --- | --- | --- |
| best-scheduling-software-25-bed-hospital.md | 183 | "SimpleScheduleAI is an AI-native nurse scheduling service designed from the start for..." | "...an AI-native nurse scheduling software designed from the start for..." |
| best-scheduling-software-25-bed-hospital.md | 203 | "**Ratings:** New service; no public G2 or Capterra reviews yet." | "**Ratings:** New software; no public G2 or Capterra reviews yet." |
| best-scheduling-software-25-bed-hospital.md | 494 | "SimpleScheduleAI is an AI-native nurse scheduling service: the manager submits..." | "SimpleScheduleAI is AI-native nurse scheduling software: the manager submits..." |
| best-scheduling-software-25-bed-hospital.md | 510 | "...SimpleScheduleAI is an AI-native nurse scheduling service. Aladtec, NurseGrid..." | "...SimpleScheduleAI is guided-setup software: the AI builds the drafts, not a human team behind a managed service. Aladtec, NurseGrid..." (FAQ question kept as-is: the category contrast between software and a managed service is legitimate; only the answer's SSAI self-placement was rewritten to the software side) |
| best-scheduling-software-25-bed-hospital.md | 514 | Author bio: "...an AI-native nurse scheduling service built for Critical Access Hospitals in Texas." | "...an AI-native nurse scheduling software company built for Critical Access Hospitals in Texas." |
| cms-pbj-reporting-scheduling-software.md | 155 | "The rest of the filing is not part of the service: SimpleScheduleAI does not produce a PBJ file..." | "...not part of the software: SimpleScheduleAI does not produce a PBJ file..." |
| cms-pbj-reporting-scheduling-software.md | 220 | Author bio, same "service" phrase | Same "software company" substitution |
| healthcare-workforce-management-cah.md | 163 | "A CAH-specific scheduling service is usually priced as a flat monthly fee..." | "CAH-specific scheduling software is usually priced as a flat monthly fee..." |
| healthcare-workforce-management-cah.md | 220 | "SimpleScheduleAI is an AI-native nurse scheduling service for [nurse scheduling at critical access hospitals]..." | "SimpleScheduleAI is AI-native nurse scheduling software for [nurse scheduling at critical access hospitals]..." |
| healthcare-workforce-management-cah.md | 222 | "The service is built specifically for Texas critical access hospitals..." | "The software is built specifically for Texas critical access hospitals..." |
| healthcare-workforce-management-cah.md | 273 | Author bio, same "service" phrase | Same "software company" substitution |
| hospital-staff-scheduling-software-critical-access.md | 128 | "New service; no public reviews yet" (table cell) | "New software; no public reviews yet" |
| hospital-staff-scheduling-software-critical-access.md | 151 | "SimpleScheduleAI is an AI-native, human-verified nurse scheduling service built specifically for Texas Critical Access Hospitals." | "SimpleScheduleAI is AI-native nurse scheduling software with 21 automated rule checks, built specifically for Texas Critical Access Hospitals." (dropped "human-verified," which was service-model residue) |
| schedule360-alternatives.md | 188 | "New service; no public reviews yet" (table cell) | "New software; no public reviews yet" |
| schedule360-alternatives.md | 201 | Image alt: "SimpleScheduleAI managed nurse scheduling service for Texas Critical Access Hospitals" | "SimpleScheduleAI guided-setup nurse scheduling software for Texas Critical Access Hospitals" |
| schedule360-alternatives.md | 203 | "SimpleScheduleAI is a new service, without public G2 or Capterra reviews yet." | "SimpleScheduleAI is new software, without public G2 or Capterra reviews yet." |
| schedule360-alternatives.md | 205 | "...built into the default service... part of the standard service rather than configuration..." | "...built into the default configuration... part of the standard software rather than configuration..." |
| schedule360-alternatives.md | 394 | "Automatic default; included in weekly service" (table cell) | "Automatic default; included weekly" |
| schedule360-alternatives.md | 490 | Author bio, same "service" phrase | Same "software company" substitution |
| smart-square-alternatives-small-rural-hospitals.md | 120, 187 | "New service; no public reviews yet" / "**Ratings:** New service..." (table cell + prose, both instances) | "New software; no public reviews yet" (both) |
| smart-square-alternatives-small-rural-hospitals.md | 163 | Image alt: "SimpleScheduleAI managed nurse scheduling service for critical access hospitals" | "SimpleScheduleAI guided-setup nurse scheduling software for critical access hospitals" |
| smart-square-alternatives-small-rural-hospitals.md | 165 | "SimpleScheduleAI is a new service, without public Capterra or G2 reviews yet." | "SimpleScheduleAI is new software, without public Capterra or G2 reviews yet." |
| smart-square-alternatives-small-rural-hospitals.md | 433 | "SimpleScheduleAI is an AI-native nurse scheduling service sized to a single Critical Access Hospital..." | "SimpleScheduleAI is AI-native nurse scheduling software sized to a single Critical Access Hospital..." |
| smart-square-alternatives-small-rural-hospitals.md | 525 | "SimpleScheduleAI is an AI-native nurse scheduling service for one 25-bed Critical Access Hospital." | "SimpleScheduleAI is AI-native nurse scheduling software for one 25-bed Critical Access Hospital." |
| smart-square-alternatives-small-rural-hospitals.md | 563 | "SimpleScheduleAI is an AI-native nurse scheduling service sized to a single 25-bed Critical Access Hospital..." | "SimpleScheduleAI is AI-native nurse scheduling software sized to a single 25-bed Critical Access Hospital..." |

Verified: `checkFacts` still 0 hard failures on all 6 posts; `check-blog` hard-fail count
unchanged at 0 for this batch's posts after the fix; the alt-text and "new/weekly/default/
standard service" residual greps now return only legitimate hits (Aladtec's own "emergency
services" industry description in unrelated posts). See `docs/seo/positioning-registry.md`
lesson 11 for the standing rule this correction produced.
