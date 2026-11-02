# Brief: Healthcare vs Generic Scheduling Software (next-15 #12)

Brief, 2026-11-02. Draft to rewrite: `src/data/post/employee-scheduling-software-for-healthcare.md` (draft: true, treated as unverified). All vendor facts below were read on the vendor's own page on 2026-11-02 unless a cell says otherwise. "No documentation found as of Nov 2026" means the pages named were read and nothing was there; it is not a claim the feature is absent.

Labels: **FINDING** = a check was run (the command or page is named). **HYPOTHESIS** = a reading that no check has settled (the test is named).

## 0. Verdict first

- **FINDING (SERP read):** the primary keyword's SERP is a vendor list. 8 of 9 organic results are vendor-owned (listicles, product pages, guides); 1 is editorial (Zapier). Two of the top three are PATIENT scheduling pages. An AI Overview sits above all of them. No G2 or Capterra category page ranks. No result mentions critical access, CAH, 42 CFR 485 or rural (page-text grep, section 3).
- **FINDING (DataForSEO):** demand is small and falling. The "880/mo" in the plan is a 12-month figure; "employee scheduling software for healthcare" is 720 on that basis, and its last three listed months are 480 (Jul), 210 (Aug), 170 (Sep 2026). Year-on-year trend -93%. The three phrasings the plan treats as separate share one identical monthly series, so they are one cluster, not three audiences (section 1).
- **FINDING (docs read):** the old draft's central thesis is false as written. Generic tools do document overtime warnings while you schedule, skill/certification-style qualification gating, and shift change history (details in section 5). The honest line is narrower: they warn rather than block, they carry no census/ratio/charge/competency-pairing logic, and none documents CAH or hospital nurse rules.
- **FINDING (regulation, section 6):** no CAH Condition of Participation (485.631, 485.635, 485.638) and no Texas HSC ch. 257 section requires a schedule-change audit trail. One Texas licensing rule does require retention of emergency call schedules for one year (26 TAC 505.41(e)(2)(D)). The old draft's CMS claim is false.
- **Recommendation (judgment):** the post is worth writing only as the honest small-hospital line piece (the gap no ranking page fills), and only if the live posts that contradict the vendor docs are corrected in the same pass (section 4b). Reasons NOT to publish are in section 11.

## 1. Keywords (DataForSEO Labs, US, location 2840, en, pulled 2026-11-02)

Volume = DataForSEO 12-month figure. "Last 3" = Jul / Aug / Sep 2026 monthly values from the same response. KD = DataForSEO Labs keyword difficulty (backlink-based; blank = no value returned). Phrasings with an identical monthly series are one synonym cluster.

| Keyword | Vol | Last 3 (Jul/Aug/Sep) | KD | Intent | Cluster / note |
| --- | --- | --- | --- | --- | --- |
| employee scheduling software for healthcare | 720 | 480 / 210 / 170 | 0 | commercial | Cluster A. keyword-check: clear. Plan said 880; 880 belongs to the next row |
| healthcare employee scheduling software | 880 | 480 / 210 / (Sep n/a) | 2 | commercial | Cluster A (same monthly series). keyword-check: clear |
| healthcare staff scheduling software | 720 | 480 / 210 / 170 | 0 | commercial | Cluster A. Retired head term (July 2026). keyword-check: overlap with hospital-staff-scheduling-software-critical-access |
| staff scheduling software healthcare | 880 | 480 / 210 / n/a | blank | commercial | Cluster A |
| healthcare staffing scheduling software | 720 | 480 / 210 / 170 | blank | commercial | Cluster A |
| healthcare scheduling software | 590 | 1000 / 320 / 260 | 0 | commercial | Cluster B (with "scheduling software for healthcare" 590, KD 1; "scheduling software healthcare" 720, KD 1). keyword-check: clear |
| hospital scheduling software | 110 | 90 / 110 / 140 | 6 | commercial | keyword-check: EXACT collision with live `best-scheduling-software-25-bed-hospital`. Do not target |
| hospital employee scheduling software | 40 | 40 / 10 / 30 | 0 | commercial | Same series as "hospital staff scheduling software" (40, KD 0). keyword-check: overlap with 3 live posts |
| medical staff scheduling software | 390 | 20 / 10 / 20 | 9 | commercial | Misleading: the 390 is lifted by one 4,400 month (Dec 2025); recent months are 10 to 30. keyword-check: overlap with `medical-scheduling-software-buyer-guide` and `hospital-staff-scheduling-software-critical-access` |
| healthcare shift scheduling app | no data | | | | keyword-check: clear. Not in DataForSEO dataset |
| healthcare shift scheduling software | no data | | | | |
| best scheduling app for healthcare workers | no data | | | | |
| nurse scheduling software | 210 | 170 / 110 / 90 | 0 | commercial | Pillar `/nurse-scheduling-software` |

Best related suggestions (keyword_suggestions on "healthcare scheduling software"; volume, KD): home healthcare scheduling software 140 (blank); staff scheduling software for healthcare 90 (blank, last 3 all 10); patient scheduling software for healthcare 50 (out of scope: patients); appointment scheduling software for healthcare 40 (KD 6, out of scope); healthcare appointment scheduling software 30 (KD 5, out of scope); healthcare scheduling software systems 30 (KD 4); best healthcare employee scheduling software 10; best scheduling software for healthcare 10; best healthcare scheduling software 10; healthcare workforce scheduling software 10 (competition HIGH). A keyword_ideas pull on "generic vs healthcare" returned only broad head terms ("hospital", "healthcare"), nothing usable. **No measured demand exists for any "generic vs healthcare" phrasing.**

keyword-check on "healthcare vs generic scheduling software", "when i work for healthcare", "healthcare shift scheduling app": clear. "generic scheduling software for hospitals" and "scheduling software for small hospitals": overlap with `best-nurse-scheduling-software-critical-access-hospitals` and `nurse-scheduling-software-small-hospital`.

Spend: 6 DataForSEO calls (keyword_overview, bulk_keyword_difficulty, keyword_suggestions x2, keyword_ideas, serp live advanced). Response cost fields were not returned, so the figure is an estimate from list prices: about $0.06. Well under the $1 cap.

**Primary / secondary recommendation.** Primary "employee scheduling software for healthcare" (clear, matches slug and old draft). Secondary "healthcare employee scheduling software", "generic vs healthcare scheduling software". Do NOT target "healthcare staff scheduling software" (retired head term, and `best-nurse-scheduling-software-2026` already holds position 2 to 4 for it in GSC), "hospital scheduling software" or "medical staff scheduling software".

## 2. Intent verdict

**FINDING:** searchers (and Google) treat this as "show me healthcare scheduling software": a vendor list. Evidence: 8 of 9 organic results vendor-owned; ranked-list format in 4 (WaitWell, Blaze, Heyshift, Zapier); the AI Overview itself is a "Top Healthcare Scheduling Platforms" list (Vars Health, Deputy, HealthStream, Camelo, KLAS-ranked enterprise systems). Not a definition (only Workeen and Digiprima open with "what is"), and not a comparison of generic vs healthcare tools.

**HYPOTHESIS:** a decision piece will not win this list-intent SERP; its value is credibility, AI-answer citation on the "is a generic tool enough" question, and correcting our own corpus. Test: GSC position for the primary keyword 28 days after publish against the `change-log` control, as for any live post.

Google is also unsure of the intent: positions 1 and 3 are patient-appointment scheduling (WaitWell, WellSky). A related search offered in the SERP: "Best employee scheduling software for healthcare", "Medical scheduling software list", "Free employee scheduling app", "Automated employee scheduling Excel".

## 3. SERP map (DataForSEO serp/google/organic/live/advanced, depth 10, desktop, 2026-11-02)

Google redirect wrappers hid six URLs; the breadcrumb shows the real page.

| Pos | Page | Type | Generic-tool vendor's healthcare page? | Raw page words* |
| --- | --- | --- | --- | --- |
| AIO | AI Overview above all results | | Cites varshealth.com/healthcare-scheduling-software, deputy.com/industry/healthcare, shiftmed.com guide, healthstream.com/solution/scheduling, camelohq.com/industries/healthcare, klasresearch.com, cornerstonehealthcaretraining.com | |
| 1 | waitwellsoftware.com/resources/articles/best-patient-scheduling-software/ (Apr 2026) | Vendor listicle, PATIENT scheduling | No | 6,096 |
| 2 | blaze.tech/post/healthcare-scheduling-app (May 28, 2026) | Vendor listicle, patient/appointment apps | No | 4,198 |
| 3 | wellsky.com/patient-scheduling-software | Vendor product page (patient + caregiver) | No | 2,495 |
| 4 | workeen.ai/medical-staff-scheduling-software (Aug 3, 2026) | Vendor guide ("Complete Guide") | No | 4,026 |
| 5 | unrubble.com HR blog, "Top Healthcare Staff Scheduling Software for Teams" (Mar 12, 2024) | Vendor listicle; features When I Work | No (lists a generic tool) | not fetched |
| 6 | teambridge.com Healthcare | Vendor product page (staffing-agency flavour) | No | not fetched (URL hidden) |
| 7 | zapier.com/blog/best-employee-scheduling-software/ | Editorial listicle, generic (Deputy, Homebase, Sling, Connecteam, When I Work, 7shifts...) | No (not healthcare-specific) | 5,685 |
| 8 | heyshift.io/blog/best-employee-scheduling-software-for-home-healthcare-agencies (Aug 7, 2026) | Vendor listicle, home health (Heyshift, Connecteam, Deputy, Homebase, Sling) | No | 3,012 |
| 9 | digiprima.com/blogs/introduction-to-healthcare-staff-scheduling-software (Dec 19, 2023) | Vendor/agency definition blog | No | 4,641 |

*Raw page text including navigation and footer; the true body is shorter. Use as a relative band only.

No generic-tool vendor's healthcare landing page ranks organically (Deputy's appears only as an AI Overview citation).

**Table stakes (sections in 3+ results; from h2/h3 extraction of the 7 fetched pages):** a "best X" ranked list with a comparison chart or at-a-glance table (WaitWell, Blaze, Zapier, Heyshift); "how to choose / key features to look for" (WaitWell, Workeen, Heyshift, Digiprima, Zapier); FAQ block (Workeen, Heyshift, Digiprima); definition ("what is") (Workeen, Digiprima, Heyshift); pricing/cost (WaitWell, Blaze, Zapier).

**Gaps (nobody covers; grep over the 7 fetched pages for "critical access", "CAH", "rural", "485" returned 0 on all 7):** the small-hospital line where a generic tool is enough; what generic vendors document from their OWN help centers on overtime, qualifications and change history; any CMS or Texas rule text; the "warns versus blocks" distinction; an honest statement of what a nurse-scheduling product does not do (app, swaps, time clock, payroll).

**Length:** top 3 raw 2,500 to 6,100 words. A decision piece does not need that. Recommend postType `comparison` (check-blog range 1,500 to 4,500), aim 2,400 to 3,000 words.

**AI Overview:** present. Its "Key Features to Look For" bullets are credential filtering, mobile self-service, overtime and labor rule tracking, payroll and time tracking. Opening claim: "tracks credentials and availability, and manages time-off or overtime for hospitals, clinics, and care agencies." We do NOT do credential tracking, so we cannot be cited for that framing; our citable angle is the warns-versus-blocks line and the primary-source regulation facts.

## 4. Overlap with our live posts

keyword-check results are in section 1. Live posts (draft: false) that already touch this ground:

| Live post (registry primary) | What it already says about generic tools | This post does only |
| --- | --- | --- |
| `best-scheduling-software-25-bed-hospital` ("hospital scheduling software"; 25 mentions of When I Work/Homebase) | Per-tool verdicts, price table, "not appropriate for a CMS-designated CAH" | The decision test and verified capability matrix; link, do not repeat the tool profiles |
| `deputy-alternatives-healthcare` ("deputy alternatives"; 33 mentions) | Deputy and its alternatives | One matrix row; link |
| `free-nurse-scheduling-software` ("free nurse scheduling software") | Teams Shifts, Connecteam free tier, Sling free tier, Excel template | Do NOT redo free tiers or the Teams Shifts section; one sentence and a link. Teams Shifts facts live in the dossier entry added 2026-11-01 |
| `nurse-schedule-audit-trail` ("nurse schedule audit trail") | No CoP creates a documentation requirement; no retention period named; PBJ; When I Work reviewer quote | One paragraph and a link. Do not restate the regulation; add only the new 26 TAC 505.41(e)(2)(D) fact |
| `medical-scheduling-software-buyer-guide` ("medical scheduling software") | Buyer guide | Link only |
| `hospital-staff-scheduling-software-critical-access` ("hospital staff scheduling software") | CAH needs vs enterprise | Link only |
| `how-to-choose-nurse-scheduling-software` ("how to choose nurse scheduling software") | 7-point checklist | Do not write a checklist; ours is a generic-vs-healthcare line test |
| `best-nurse-scheduling-software-2026` ("best nurse scheduling software") | List of tools; holds GSC position 2 to 4 for the plan's keywords (section 8) | Do not write a list |
| `managed-service-vs-scheduling-software` | Service vs software | One sentence on the third option, link |
| `nurse-scheduling-software-vs-excel`, `can-microsoft-copilot-generate-nurse-schedule`, `healthcare-workforce-management-cah`, `hipaa-compliant-nurse-scheduling-software` | Adjacent | Link only |

**Queries where we would compete with ourselves:** "healthcare staff scheduling software" (best-nurse-scheduling-software-2026 at pos 4, hospital-staff-scheduling-software-critical-access at 34, best-scheduling-software-25-bed-hospital at 11); "hospital employee scheduling software" (three live posts at pos 1, 42, 48); "hospital scheduling software" (exact registry collision). Avoid all three as targets.

### 4b. Live posts that conflict with the vendor documentation (tell the founder; T10)

Found while reading vendor pages. These are corrections to LIVE posts, not part of the new post, but the new post cannot go live beside them unfixed.

1. `best-scheduling-software-25-bed-hospital` FAQ (about L496): "When I Work ... has no healthcare compliance features ... does not apply FLSA overtime rules by default". When I Work documents overtime alerts "based on the configured overtime thresholds" and an overtime badge while scheduling (W1, W2). Narrow to: warns, does not block, no healthcare rule set.
2. Same post (about L498-504, L324): Homebase "free tier for up to 20 staff per location". Homebase's pricing page now says "up to 10 employees" for Basic (H5, read 2026-11-02). Also the reference line "Homebase ... 4.6/5 on Capterra (5,150 reviews)" disagrees with the competitor dossier (1,151 reviews, 2026-07-15), and "When I Work at $2.50-$6" now reads $2.50 / $5 / $8 (W8). Check each.
3. `nurse-scheduling-software-minimum-employees` (about L113): says overtime tracking against FLSA thresholds is "not documented on their product pages". Overtime alerts ARE documented for When I Work, Homebase, Sling, Connecteam and Deputy (BETA). What is undocumented is a healthcare rule set, not overtime warning.
4. `free-nurse-scheduling-software` (about L182): "free options ... do not document hospital requirements like overtime tracking". Sling documents overtime alerts on its Premium plan (S1, S7); Connecteam's scheduling page says "Get alerted before you schedule overtime" (C1).
5. `nurse-schedule-audit-trail` (L118-124): the When I Work reviewer quote ("No Auditing capability") stands as a dated reviewer opinion, but When I Work documents a Shift History report covering the last 60 days (W5). Add one sentence so a reader does not conclude the tool has no change history.
6. `how-to-stay-cms-compliant-nurse-scheduling` (about L213): "does not maintain a credential log integrated with the schedule" is too absolute: When I Work tags can record certifications (W4) and Deputy offers an HR add-on that tracks "licences, qualifications, certifications, or training expiry dates" (D2). Say "does not document expiry-driven blocking for hospital use".
7. `docs/seo/competitor-dossier.md`: the Deputy, Homebase and When I Work blocks carry "Product page does not document ... credential constraints". Deputy's help center now documents Training Tags (D2); update the dossier. Connecteam and Sling have no dossier section; add them (section 10).

## 5. Generic tools, verified (the section that matters most)

Source keys are listed at the end of this section. Fragments are under 15 words. "ND" = no documentation found as of Nov 2026 in the pages named.

### 5a. Matrix

| Capability | When I Work | Homebase | Deputy | Connecteam | Sling | Teams Shifts |
| --- | --- | --- | --- | --- | --- | --- |
| Overtime warning while you schedule | Yes. "displays the overtime impact when scheduling" [W1]. Alerts use "the configured overtime thresholds" [W2]. Max-hours alert; "Users can still be scheduled past their configured max hours" [W3] | Yes. "alert you when an employee is about to hit overtime" while scheduling [H1] (marketing page; help center login-gated) | Yes, BETA. "An overtime tag will appear on any shift" that triggers overtime [D1]. Needs library pay rates: "Legacy pay rate configurations do not support these warnings" [D1]. Warns; "Schedule anyway" is offered [D1] | Yes. "Get alerted before you schedule overtime" and "Set overtime and other schedule limits before publishing" [C1] | Yes. "alerts you whenever you schedule employees into weekly overtime" [S1]; Premium plan lists "Overtime tracking" [S7] | ND on Microsoft pages (dossier 2026-11-01). Auto-assign preview lists "maximum weekly and daily hours" rules [T1] |
| Overtime threshold basis | Account thresholds; docs example uses a 40-hour weekly threshold [W1]. Daily and double overtime also supported | Not stated on page | Pay-rate rules | Custom pay-period, weekly, holiday, consecutive-day rules [C6] | "over 40 hours in a workweek" described; daily and California double-time rules [S1] | ND |
| Counts hours across 8-and-80 | ND | ND | ND | ND | ND | ND |
| Qualification / skill / certification gating | Yes. Positions plus tags. "Tags provide an additional eligibility requirement" layered on positions; tag examples include "Certifications" [W4]. OpenShift pickup limited to shifts "they are qualified to work" [W4]. No expiry dates documented | Help center login-gated, ND public. Healthcare page: "prevent staff members from clocking into shifts they're not qualified for" [H3]; open shifts handled by "requiring manager approval" [H3] | Yes. Training Tags "identify team members who are qualified, trained, or approved to work" [D2]. Expiry tracking sits in a paid HR add-on [D2] | Yes. "qualify employees for shifts independently of job qualifications" [C2]; "open shifts for qualified employees to claim" [C1] | Yes, position-based. Positions "separate your employees' skills, responsibilities, and more" [S2]; an employee sees a shift only with the same location and position on their profile [S3]. Healthcare page: "set eligibility requirements for each shift" [S6] | ND (dossier) |
| Credential expiry dates | ND | ND | HR add-on [D2]; Deputy blog claims expiry warnings at scheduling (vendor blog, not help center) | ND (HIPAA-registered account is a paid option on pricing page [C4]) | ND | ND |
| Open-shift filling rules | Qualified users only; max-hours enforcement hides OpenShifts from users who would exceed [W3]. Does not count overtime [W3] | Manager approval before the claim sticks [H3] | "serve up suitable employees who are available, qualified, and cost-efficient" [D5]: filtered, not ranked | Qualified employees claim, with approval [C1] | Visible only to matching position and location [S3] | Open-shift request, manager approves (dossier) |
| Change history / audit log | Yes. Shift History: "Shift history is available for shifts from the last 60 days" [W5]; fields include who updated the shift [W5] | Marketing page: "Managers can view a history of all shift changes" [H4]. Help center login-gated | Yes, paid tier. Shift audit report (Analytics+ only): "history of changes made to a shift including, when, what and by whom" [D3] | Yes. Scheduler activity lists shifts created, edited, deleted [C3]; viewing from Operations Basic plan, export from Expert plan [C3] | Yes. Activity log "up to 60 days in the past", admins and managers [S4]; per-shift history, web only [S4] | Yes, via Microsoft Purview audit log: "ShiftEdited" and add/delete shift events [T2]; Audit (Standard) kept 180 days for logs from Oct 17, 2023 [T2]. Microsoft: "We don't store immutable copies of Shifts data" [T1] |
| Minimum staffing / coverage requirement | ND for a per-shift headcount that blocks publishing. Pro plan lists "Custom Unit Forecasting" and "Scheduling rules" (min rest 1 to 18 hours) [W6, W8] | ND (a Capterra reviewer, not Homebase: "not able to limit number of people on a shift"; dossier) | Staff Coverage model: "set the amount of staff required" per area [D4] | ND | "slots" for required employees per job; paid plans only [S5] | ND (dossier) |
| Rest / consecutive-day rules | Min hours between shifts 1 to 12 same day, 1 to 18 different days [W6] (Pro) | ND | Consent / fair-workweek reports (US) [D3 area]; not checked further | Not checked | Not checked | Preview: "maximum consecutive days worked, and minimum rest periods" [T1] |
| Callout / replacement | "Find Replacement" lists qualified, unscheduled users (from a search summary of When I Work help; not re-read) | ND | Filtered list of available, qualified staff [D5] | "Fill call-outs fast" (healthcare page) [C5] | "Sick call-outs" tracking on Business plan [S7] | ND |
| Healthcare-specific page | Yes: "Medical & Healthcare Staff Scheduling Software"; says it "acts as scheduling software for hospitals" [W7] | Healthcare page exists; "wasn't designed for hospitals or medical staff specifically" [H3]. June 2026 guide: "nurse rotation management, or academic medical centers" are not the right fit [H2] | deputy.com/industry/healthcare plus a healthcare setup guide [D2] | Healthcare page exists [C5]; HIPAA-registered account listed with "additional fees" [C4] | Healthcare page exists: "From regional hospitals to neighborhood dentists" [S6] | No Shifts-specific healthcare or HIPAA statement (dossier) |
| Price per user per month (list, read 2026-11-02) | Essentials $2.50, Pro $5, Premium $8 [W8] | $0 Basic (1 location, up to 10 employees); $30 Essentials, $70 Plus, $120 All-in-One per LOCATION per month, unlimited employees [H5] | Lite $5, Core $6.50, Pro $9; Analytics+ $1.50 add-on (dossier, verified 2026-08-25) | Free up to 10 users; Operations Basic $29/mo for the first 30 users then $0.80 per extra user; Advanced $49 / $2.50; Expert $99 / $4.20 (page shows a second price set of $35 / $59 / $119; the pair looks like annual vs monthly, billing toggle not verified) [C4] | Free for up to 30 users on the pricing page (the healthcare page says 50); Premium $2.00 monthly or $1.70 annual; Business $4.00 or $3.40 [S7] | Included with Teams; each user needs a Teams license (dossier) |

Cells that read ND for the Teams column come from the dossier pass of 2026-11-01, not a new search; the audit-log row is new (2026-11-02).

### 5b. What the matrix supports saying

- **FINDING:** all five generic tools document an overtime warning at scheduling time. All five document a change history (Homebase only on a marketing page; its help center is behind a login). Four document qualification gating that a hospital could use for ICU/ER or charge competence (When I Work, Deputy, Connecteam, Sling). The old draft said "Not included" for each. That is wrong.
- **FINDING (docs, not a test of behavior):** the documented behavior is warn, not block, on overtime (When I Work: "Users can still be scheduled past their configured max hours"; Deputy offers "Schedule anyway"). Qualification gating is documented as filtering who can pick up or be offered a shift, and as an eligibility indicator when you drag a shift (When I Work). We did not run any tool; a hands-on trial is the only way to say what happens when a manager assigns an unqualified nurse by hand. Do not write that the tools "allow" it.
- **FINDING:** none of the sources read documents a census/ratio-based requirement, a competency pairing rule (a junior must work with a senior), charge-nurse coverage as a distinct slot, or a publish block tied to safety rules. Say "no documentation found as of Nov 2026", never "they cannot".
- **FINDING:** Homebase's own June 2026 guide says it is not the right fit for "nurse rotation management". That is the vendor drawing the line for us; quote it.
- **Not researched (so unsupported in the old draft):** per-diem or PRN pool handling in any generic tool; low-census / send-home; union rules; EHR integrations.

### 5c. Source keys (all read 2026-11-02 unless noted)

- W1 https://help.wheniwork.com/articles/overtime-visibility/ ; W2 https://help.wheniwork.com/articles/setting-overtime-alerts-computer/ ; W3 https://help.wheniwork.com/articles/max-hours-enforcement-reference/ ; W4 https://help.wheniwork.com/articles/when-to-use-positions-and-tags/ ; W5 https://help.wheniwork.com/articles/shift-history-report-details/ and https://help.wheniwork.com/articles/shift-history-computer/ ; W6 https://help.wheniwork.com/articles/scheduling-settings/ ; W7 https://wheniwork.com/industries/healthcare ; W8 https://wheniwork.com/pricing
- H1 https://joinhomebase.com/labor-law-compliance ; H2 https://www.joinhomebase.com/blog/healthcare-staff-scheduling-software (dated June 23, 2026) ; H3 https://www.joinhomebase.com/healthcare (page title still reads "in 2024") ; H4 https://www.joinhomebase.com/employee-scheduling/shift-swapping ; H5 https://joinhomebase.com/pricing/ . Homebase help center (support.joinhomebase.com) returned a login wall to a browser on 2026-11-02, so no help-center article could be read.
- D1 https://help.deputy.com/hc/en-au/articles/15192896170895-How-do-I-enable-and-understand-overtime-tags-and-warnings-on-the-schedule-BETA ; D2 https://help.deputy.com/hc/en-au/articles/4621991456527-Setting-up-Deputy-for-a-healthcare-business ; D3 https://help.deputy.com/hc/en-au/articles/12016108679823-Shift-audit-report-Analytics-only ; D4 https://help.deputy.com/hc/en-au/articles/4688843118223-Using-a-simple-staff-coverage-planner-when-scheduling ; D5 competitor-dossier Deputy block (deputy.com/features/shift-swapping, deputy.com/pricing, verified 2026-08-25)
- C1 https://connecteam.com/employee-scheduling-app/ ; C2 https://help.connecteam.com/en/articles/8693629-job-schedule-qualifying-users-to-shifts ; C3 https://help.connecteam.com/en/articles/9337115-how-to-view-the-job-scheduler-s-activity ; C4 https://connecteam.com/pricing/ ; C5 https://connecteam.com/industries/healthcare-app/ ; C6 https://connecteam.com/employee-time-clock-app/overtime
- S1 https://support.getsling.com/en/articles/4683228-set-overtime ; S2 https://support.getsling.com/en/articles/3678084-3-adding-positions ; S3 https://support.getsling.com/en/articles/6408495-available-shift-visibility ; S4 https://support.getsling.com/en/articles/6442847-activity-log and https://support.getsling.com/en/articles/1176782-viewing-shift-history ; S5 https://support.getsling.com/en/articles/3104957-getting-your-coverage-right ; S6 https://getsling.com/healthcare/ ; S7 https://getsling.com/pricing/
- T1 facts-dossier "Microsoft Teams Shifts" (2026-11-01; Microsoft pages) ; T2 https://learn.microsoft.com/en-us/purview/audit-log-activities (Teams Shifts activities table, read 2026-11-02) and https://learn.microsoft.com/en-us/purview/audit-solutions-overview

## 6. Regulation facts (text read 2026-11-02 at Cornell LII and texas.public.law)

**Question: does any CMS or Texas rule require a hospital to keep schedule-change records or staffing records?**

**FINDING (grep over the fetched section text for "schedul", "roster", "audit", "timesheet", "staffing record"):**

- 42 CFR 485.631 (Staffing and staff responsibilities): zero hits for schedule, roster or audit. The staffing text is:
  - (a)(3): "The staff is sufficient to provide the services essential to the operation of the CAH."
  - (a)(4): "A doctor of medicine or osteopathy, nurse practitioner, clinical nurse specialist, or physician assistant is available to furnish patient care services at all times the CAH operates."
  - (a)(5): "A registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients."
- 42 CFR 485.635 (Provision of services): the only "schedul" hit is "scheduled drugs". Zero hits for roster or audit. Nursing text, (d)(1): "A registered nurse must provide (or assign to other personnel) the nursing care of each patient" and "The care must be provided in accordance with the patient's needs and the specialized qualifications and competence of the staff available." (d)(2): "A registered nurse or, where permitted by State law, a physician assistant, must supervise and evaluate the nursing care for each patient". (d)(1) is a qualifications hook for assignment; it is not a records rule.
- 42 CFR 485.638 (Clinical records): patient records only; zero hits for schedule, roster, staffing, personnel.
- **There is no federal CAH rule requiring a schedule-change audit trail.** The old draft's "§485.635 requires critical access hospitals to maintain accurate, reviewable staffing records. Every schedule change must be documented" is false. This agrees with the live `nurse-schedule-audit-trail` ("Neither creates a documentation requirement"; "No Condition of Participation names a retention period for schedules").
- **Texas Health and Safety Code ch. 257** (sections 257.001 to 257.005): applies to a Texas CAH through general-hospital licensure (dossier, 257.001). It requires a written nurse staffing policy and plan and a staffing committee. 257.004(g)(4) and (5): the committee shall "evaluate, at least semiannually, the effectiveness of the official nurse services staffing plan and variations between the plan and the actual staffing" and report "aggregate variations between the staffing plan and actual staffing" to the governing body. 257.005: the hospital annually reports to the department whether it has the policy, the committee, the evaluation and the outcome measures; that report is public. **It requires comparing plan to actual staffing, but names no schedule-change log and sets no format.** Say exactly that; do not call it an audit-trail rule.
- **26 TAC 505.41 (Hospital Functions and Services; formerly 25 TAC 133.41), Cornell LII text:**
  - (e)(2)(D) (emergency services, personnel): "Schedules, names, and telephone numbers of all physicians and others on emergency call duty, including alternates, shall be maintained. Schedules shall be retained for no less than one year." **This is the one Texas rule found that requires a schedule to be kept.** It is about emergency call duty, not nurse unit schedules or schedule changes. The same subsection (e)(2)(C)(ii) names CMS-designated CAHs, which shows the chapter reaches them.
  - (o)(2)(A) (nursing services): "The nursing services shall adopt, implement and enforce a procedure to verify that hospital nursing personnel for whom licensure is required have valid and current licensure." This is a licensure-verification duty. SimpleScheduleAI does not do credential or licence tracking, so this is a case where the post must not imply we cover it.
  - (o)(2)(B): "There shall be adequate numbers of RNs, licensed vocational nurses (LVNs), and other personnel to provide nursing care to all patients as needed."
  - (o)(2)(D): an RN on duty "in each building of a licensed hospital that contains at least one nursing unit where patients are present" (already used in `nurse-schedule-audit-trail`).
  - (o)(2)(F)(iv)(IV) and (V) repeat the plan-versus-actual evaluation and report of 257.004.
- **Plain statement for the post:** no rule found requires a schedule-change audit trail; federal and Texas rules require staffing sufficiency and an RN on duty, Texas additionally requires a plan-versus-actual review and one-year retention of emergency call schedules. A change history is a practical way to answer "what happened that night", not a mandated record. Do not write "CMS requires", "surveyors require" or "CMS-compliant audit trail".
- **Not verified:** whether Texas HHSC surveyors cite 505.41 for missing schedule records in practice (no source); CMS State Operations Manual Appendix W text (cited in the live audit post; not re-read here).

## 7. Old-draft claims that are FALSE or unsupported (line numbers are the draft's)

| Line | Claim | Verdict |
| --- | --- | --- |
| 3-4 | publishDate 2026-07-10, updateDate 2026-06-04 | FIX: real dates (T12); update precedes publish |
| 8-12, 26-27, 184 | Five requirements "generic tools do not have" | FALSE for overtime warning and change history; partly false for qualification gating (section 5) |
| 29, 196 | "A managed scheduling service goes further than purpose-built healthcare software" | UNSUPPORTED; also a self-label problem (managed service only as category) |
| 44 | Generic tools "model employees as interchangeable ... cannot be addressed by configuration alone" | FALSE: positions, tags, Training Tags, shift qualifications exist (W4, D2, C2, S2) |
| 94 | "Generic tools assign whoever is available" | FALSE for the four with qualification gating; "prevent uncertified assignments automatically" is not what the docs say either (they filter and indicate) |
| 96 | "Generic tools process whatever schedule you build" | FALSE (overtime warnings at scheduling time documented for all five) |
| 98 | CMS §485.635 "requires ... accurate, reviewable staffing records. Every schedule change must be documented, who changed what, when"; link to a CMS CAH page | FALSE (section 6) |
| 98 | "Generic tools do not produce change documentation in the format required for CMS survey response" | FALSE: no format is required; generic tools document change history (W5, C3, S4, D3) |
| 100 | Callout shortlist in "10-15 minutes instead of 30-60 minutes" | INVENTED; cut |
| 102 | "Per-diem pool management ... Generic tools treat all employees identically" | UNSUPPORTED (not researched); "Healthcare-specific tools maintain separate per-diem pool" is the banned bench claim for us. SSAI claim limit: PRN availability as a hard constraint and the missing-submission flag |
| 112 | Generic tools "often outperform" on staff communication UX | UNSUPPORTED; a hospital Homebase reviewer in the dossier says "I did not like that I could not do scheduling on the app" |
| 129-152 | Table: "Not included" for certification matching, CMS audit trail, callout logic, per-diem pools; "Basic or not included" for FLSA overtime | FALSE or UNSUPPORTED (section 5) |
| 124, 156 | "Healthcare-Specific (Aladtec, SimpleScheduleAI)"; Aladtec mobile "basic" | WRONG: Aladtec is public-safety software since 2022 (founder decision 2026-10-19); mobile claim unsourced |
| 155 | When I Work/Homebase "Strong (best UX in category)" | UNSUPPORTED opinion |
| 159-161 | Setup "Days" for generic; "Days (managed service) to weeks (self-serve)" | CONFLICTS with the setup-timeline canon: onboarding 3 to 5 business days, first schedule inside two weeks. Vendor claim only for others ("up and running within days, not weeks", W7) |
| 167 | The nurse manager "is doing three jobs"; compliance work "remains entirely manual" | OVERCLAIM; rhetorical |
| 171 | SimpleScheduleAI "covers all five healthcare-specific scheduling requirements as built-in defaults" | FALSE: `certifications` is read by no rule (competency level is a different thing); no "CMS audit trail" feature; no per-diem pool; also "Request a free assessment" is not a current offer on record |
| 188 | UKG and "API Healthcare" "require IT infrastructure that most CAHs do not have" | UNSUPPORTED competitor-inflation (positioning-registry guardrail 4); cut |
| 196 | Hybrid: generic app for nurses plus a managed service for compliance | UNSUPPORTED; no integration exists between a generic tool and our output, so it implies double entry. Cut |
| 200 | "Every CAH has CMS documentation requirements, so ... the answer is effectively always yes" | FALSE and circular (section 6) |
| 204 | Compliance "has to run inside the assignment step, not bolted on"; "architectural difference" | UNSUPPORTED as stated; the real, supportable distinction is warn versus block |
| Excerpt, SVG, TOC | Inline SVG, "five requirements" framing | CUT the SVG (visual rule: no SVG); replace the frame with the decision test below |

## 8. Our GSC (https://simplescheduleai.com/, 2026-08-04 to 2026-11-01, dimensions query+page, row_limit 1000, WEB)

Filters run: query contains "healthcare" (104 rows), "employee scheduling" (10 rows), "generic" (0 rows). Also "when i work", "homebase" (0 rows each), "connecteam" (1 row), "deputy" (1 row). Clicks: 0 on every row below.

| Query | Page | Impr | Pos |
| --- | --- | --- | --- |
| employee scheduling software for healthcare | best-nurse-scheduling-software-2026 | 1 | 2.0 |
| best employee scheduling software for healthcare 2026 | best-nurse-scheduling-software-2026 | 1 | 30 |
| healthcare employee scheduling | nursing-staff-scheduling-small-hospital | 1 | 9 |
| healthcare staff scheduling software | best-nurse-scheduling-software-2026 | 8 | 4.0 |
| healthcare staff scheduling software | best-scheduling-software-25-bed-hospital | 1 | 11 |
| healthcare staff scheduling software | hospital-staff-scheduling-software-critical-access | 1 | 34 |
| staff scheduling software healthcare | best-nurse-scheduling-software-2026 | 1 | 2.0 |
| hospital employee scheduling software | best-nurse-scheduling-software-2026 / ...-critical-access-hospitals / hospital-staff-scheduling-software-critical-access | 1 each | 1 / 42 / 48 |
| employee scheduling software skilled nursing | nurse-scheduling-software (page) | 8 | 53.8 |
| healthcare rostering | nurse-rostering-vs-scheduling-software | 42 | 21.7 |
| what are the best connecteam alternatives for coordinating care teams? | deputy-alternatives-healthcare | 4 | 6.8 |

**FINDING:** no query contains "generic"; no impression for When I Work or Homebase queries. Most "healthcare" rows are long, prompt-shaped questions (AI-assistant style) with 1 to 11 impressions. Demand on our own site for this topic is effectively zero; `best-nurse-scheduling-software-2026` already absorbs the few impressions at positions 2 to 4. **HYPOTHESIS:** the 1-impression positions of 1 to 2 are noise from low-volume queries. Test: none needed; treat as no signal.

## 9. Proposed outline (comparison, aim 2,400 to 3,000 words, 2 visuals, no SVG)

Title: "Generic vs Healthcare Scheduling Software: What a Small Hospital Needs" (keeps the plan's framing; the old title "Why It Matters" is vague). Slug: keep `employee-scheduling-software-for-healthcare` (matches the primary keyword and the old canonical). Excerpt and Key Takeaways must differ (recurring defect). Service-mode copy (the registry's service column verbatim); no pricing mixing.

1. **What Is the Difference Between Generic and Healthcare Scheduling Software?** Definition in two sentences; "healthcare-specific" means rules written for clinical staffing (competency pairing, charge coverage, ratios), not "has a healthcare page". Note that four of the five tools below have a healthcare page of their own.
2. **Can a Small Hospital Use When I Work, Homebase, Deputy, Connecteam or Sling to Schedule Nurses?** Short answer plus the verified matrix (section 5a, trimmed to 7 rows, each cell sourced). Open with what they do well.
3. **Do Generic Scheduling Tools Warn You About Overtime Before You Publish?** Yes, documented for all five; they warn and let you proceed. Define "the 40-hour weekly FLSA overtime threshold" only in SSAI claims; generic educational line may say "FLSA overtime thresholds". Link `/blog/texas-nursing-overtime-compliance-cah` for 8-and-80 education only.
4. **Can a Generic Tool Make Sure Only Qualified Nurses Work the ICU or ER?** What positions, tags, Training Tags and shift qualifications do; what no page documents (competency pairing, charge-qualified slot, expiry-driven blocking). State that credential expiry tracking belongs to HR/credentialing and that we do not do it (cite 26 TAC 505.41(o)(2)(A)).
5. **Do Generic Scheduling Tools Keep a Record of Schedule Changes?** Yes, with limits (60 days for When I Work and Sling; paid tiers for Deputy and Connecteam export). Then the regulation: no schedule-change audit trail is required; the one-year emergency call schedule rule; plan-versus-actual review. One paragraph, link `/blog/nurse-schedule-audit-trail`.
6. **Does Microsoft Teams Shifts Count as a Generic Scheduling Tool?** Two sentences and a link to `/blog/free-nurse-scheduling-software`; add the new Purview audit fact.
7. **When Is a Generic Scheduling Tool Enough for a Small Hospital?** The honest line. Candidate test (each yes/no, nurse-manager language): (a) one repeating pattern and the same people, (b) no float, ICU/ER competency pairing or charge-slot logic to protect, (c) you check rest, 40-hour weeks and charge coverage by eye before you post, (d) you are comfortable that a warning is not a stop. Plus the departments where a generic tool is plainly enough (dietary, housekeeping, front desk; Homebase's own guide says non-clinical hourly teams).
8. **What Does a Generic Tool Do Better Than a Nurse Scheduling Service?** Nurse mobile apps, shift swaps and open-shift pickup, time clock, payroll, messaging, price per user. Say so plainly (inventory section 6: SSAI has none of these; in service mode "your nurses never have to learn a new app"). Show list-price arithmetic only as arithmetic on vendor prices (for example Pro at $5 x 20 users = $100 a month), never against our price in the same sentence unless the registry `pricing` line is quoted verbatim.
9. **How Does SimpleScheduleAI Differ From a Generic Scheduling Tool?** Product tie-in (section below).
Then **Our Take** (immediately before What to Do), **What to Do This Week** (run the four-question test on your own roster; ask your vendor three questions: does it warn or block, can it show who changed a shift last month, does it know your charge slot), **FAQ** (5 to 6, from the questions above), **Sources** (not bulleted raw; numbered).

Visuals (2): (1) the verified matrix; (2) a "warn versus block" decision table. Not the old SVG.

Links out (live): `/critical-access-hospital-scheduling`, `/ai-nurse-scheduling`, `/how-it-works`, `/pricing`; `/blog/nurse-schedule-audit-trail`, `free-nurse-scheduling-software`, `best-scheduling-software-25-bed-hospital`, `deputy-alternatives-healthcare`, `managed-service-vs-scheduling-software`, `how-to-choose-nurse-scheduling-software`, `texas-nursing-overtime-compliance-cah`, `can-microsoft-copilot-generate-nurse-schedule`. Inbound to add on publish: from `free-nurse-scheduling-software`, `best-scheduling-software-25-bed-hospital`, `deputy-alternatives-healthcare`, `hospital-staff-scheduling-software-critical-access`.

## 10. SSAI tie-in (inventory-supported only; service mode = the registry's service column, verbatim)

Mode: SERVICE (canonical today). Claim what ARRIVES, never who clicked. Use registry rows `triad`, `shortlist-reasons`, `fairness-record`, `callout`, `delivery-cadence`, `faq-accounts` verbatim; onboarding wording from `setup-timeline` (3 to 5 business days; first schedule inside two weeks).

**Claimable (inventory section, file evidence in the inventory):**

- 22 automated rule checks, 13 safety and 9 fairness (say "compliance and fairness rules"; "hard constraints" is acceptable).
- Safety rules enforced during generation (3.5, 4.2, 5.3): minimum staffing floor by unit (day and night), patient-to-licensed-staff ratio by census band (RN and LPN count, CNA does not), charge-nurse requirement, 10-hour minimum rest, maximum 5 consecutive days, 60 hours in any rolling 7-day window, no overlapping shifts, approved leave, PRN availability. Rest, consecutive-day and 60-hour checks carry across the schedule boundary.
- Competency rules for ICU/ER units (4.2): a nurse below competency level 2 is not placed; a Level 1 nurse needs a Level 5 preceptor on the same shift; a Level 2 needs a Level 4 or higher supervisor; charge slots need a charge-qualified nurse at level 4 or higher. Competency is a 1 to 5 level set at onboarding. **Do not call this credential or certification matching** (registry `shortlist-reasons`: say skill match, unit competency, charge-qualified, role).
- Overtime: the schedule counts only the 40-hour weekly FLSA overtime threshold (Monday to Sunday); candidates who stay under 40 hours are used before those who would go into overtime. Write exactly "the 40-hour weekly FLSA overtime threshold". Never 8-and-80.
- Warn versus block (5.3, 3.1): publishing is blocked while safety-rule violations remain (software behavior). In service copy: "the schedule you approve already respects the safety rules". This is the supportable contrast with generic tools that warn.
- Callout (4.5): ranked top-3 shortlist with reasons, straight-time candidates above overtime, agency last, ineligible nurses shown with the specific blocking rule. Use `shortlist-reasons` wording. Service: manager picks, we update the schedule and send the corrected copy.
- PRN: availability is a hard constraint (a per-diem nurse is never scheduled on a date they did not offer); missing submissions are flagged. We maintain availability data, not "the bench".
- Change record (5.4): the software keeps an append-only log with before and after snapshots across 35 action types, filterable and exportable to CSV; the service delivers "the audit trail" with each cycle (registry `delivery-cadence`). Claim it as a record of what changed and who, "visibility", never as CMS-compliant or required. Generation seeds are logged so a run can be reproduced.
- Fairness record: weekend quota with carryover, consecutive-weekend cap, holidays versus team average within each schedule; per-nurse night and charge counts "on request" only (registry `fairness-record`). Do not claim nights are balanced or holidays carry over.
- Excel roster in and roster/schedule/audit CSV out (no data lock-in).

**Must NOT claim (inventory section 6, product truths):** credential or licence expiry tracking or "credential matching"; any customer, pilot or result; a nurse-facing app (service); shift swaps or open-shift claiming by nurses; time clock or actual hours; payroll or EHR integration; email/SMS/push alerts; labor cost in dollars; a per-diem bench; 8-and-80; Safe Harbor; night fairness; "CMS-compliant audit trail"; "covers all five" anything.

**Where the post should concede (inventory 6.8, 6.9, 6.10, 6.2):** generic tools have nurse apps, swaps and open-shift pickup, time clocks, payroll links and messaging; SSAI in service mode has none of these. The honest buyer question is which problem is bigger.

## 11. Reasons NOT to publish (or to reshape)

1. **FINDING:** demand is small and falling (170 to 480 a month in the last three months for the cluster; plan's "880" is a trailing average) and no phrasing of "generic vs healthcare" has measured volume.
2. **FINDING:** the SERP is a vendor list with an AI Overview; our piece does not match the list intent. **HYPOTHESIS:** it will get few impressions. Test: change-log at 28+2 days.
3. **FINDING:** 5 live posts already cover adjacent ground, one of them (`best-scheduling-software-25-bed-hospital`) is an exact registry collision on "hospital scheduling software". Cannibalization risk is real unless the new post stays on the decision test and links out.
4. **FINDING:** publishing an honest "generic tools do document overtime warnings and change history" piece while 4 live posts say or imply the opposite (section 4b) creates a visible contradiction on our own site. Fix those first or in the same commit.
5. The honest conclusion ("many small-hospital needs are met by a generic tool; the gap is blocking and clinical rules") weakens a pure sales pitch. That is the point of the piece, but the founder should decide with that in view. The founder's own rule applies: content is credibility and LLM findability, not acquisition.
6. **Alternative:** skip a new URL and fold sections 5 and 7 into `best-scheduling-software-25-bed-hospital` (which owns the collision) as a dated H2, plus the corrections in 4b. Cheaper, no cannibalization, but loses the "generic vs healthcare" phrasing.

## 12. Facts-dossier entries that apply, and NEW facts to add (with URLs)

**Apply (read before drafting):** 42 CFR 485.631(a)(5); 42 CFR 485.635(d) (PA alternative; attribute to 485.635, not 485.631); Texas HSC 257.001, 257.003, 257.004 (add the (g)(4)-(5) quote); FLSA overtime (approved SSAI wording) and Texas overtime law; Microsoft Teams Shifts (2026-11-01); Product truths (pricing split, setup-timeline, nurse-portal split, no pilots, not-shipped list); Chapter 258 only if callouts are mentioned (mandatory overtime is prohibited for nurses).

**NEW facts to add to the dossier (all verified 2026-11-02):**

1. 42 CFR 485.631, 485.635 and 485.638 contain no requirement for schedule, roster, staffing-record or audit-trail documentation (text read, term search run). https://www.law.cornell.edu/cfr/text/42/485.631 ; /485.635 ; /485.638
2. 26 TAC 505.41(e)(2)(D): emergency call schedules "shall be retained for no less than one year". https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41
3. 26 TAC 505.41(o)(2)(A): procedure to verify valid and current licensure of nursing personnel; (o)(2)(F)(iv)(IV)-(V): semiannual plan-versus-actual evaluation. Same URL.
4. Texas HSC 257.004(g)(4)-(5) and 257.005 (annual public reporting to the department). https://texas.public.law/statutes/tex._health_and_safety_code_section_257.004 ; /257.005
5. Teams Shifts is covered by the Microsoft Purview audit log (ShiftEdited and related events); Audit (Standard) retention 180 days for logs on or after Oct 17, 2023. https://learn.microsoft.com/en-us/purview/audit-log-activities
6. Vendor capability facts in section 5a (new competitor-dossier sections for Connecteam and Sling; update Deputy, Homebase, When I Work). Include the dates and the "login-gated help center" note for Homebase.
7. Homebase self-statement (June 23, 2026): not the right fit for "nurse rotation management". https://www.joinhomebase.com/blog/healthcare-staff-scheduling-software
8. Keyword facts (not a dossier entry): cluster volumes and the 12-month series in section 1, for `keyword-gap-targets`.

## 13. Checks run (so every finding above can be re-run)

- DataForSEO Labs: keyword_overview (18 keywords), bulk_keyword_difficulty (12), keyword_suggestions ("healthcare scheduling software", "employee scheduling software for healthcare"), keyword_ideas (three seeds), serp/google/organic/live/advanced (depth 10, desktop).
- `npm run keyword-check -- "<kw>"` for 13 phrasings (results in sections 1 and 4).
- GSC `get_advanced_search_analytics`, 2026-08-04 to 2026-11-01, filters listed in section 8.
- curl of vendor pages with text extraction (scratchpad); Playwright navigation to Homebase help center (login wall); Cornell LII and texas.public.law text; term searches ("schedul", "roster", "audit", "timesheet") over 485.631, 485.635, 485.638.
- Page-text greps over seven SERP pages for "critical access", "CAH", "rural", "485".
- Not run: any hands-on trial of a generic tool; Capterra/G2 refresh; Texas HHSC survey practice; per-diem and low-census capabilities of generic tools.
