# Brief: Nurse On-Call Scheduling at a Small Hospital (2026-11-26)

Plan item #4 in `docs/seo/next-15-blogs-2026-11.md`. Post type: MOFU operational explainer. Reader: nurse manager / DON or administrator at a Texas Critical Access Hospital (25 beds or fewer). Read-method tags: [curl] raw page fetched and text-extracted by this agent; [WebFetch] page read through the fetch tool (model-mediated extraction, so quotes are cross-checked against a second source where possible); [dossier] already in `docs/seo/facts-dossier.md`, not re-read unless stated.

Working title: "Nurse On-Call Scheduling at a Small Hospital: Rotation, Pay and Fairness"

## Keyword data and registry

- Primary "on call schedule" 480/mo; secondaries "on-call scheduling software" 170, "on call schedule template" 140 (from the plan file; not re-pulled). Bing saw "nurse on call scheduling for small hospital". Skip "on call nurse" (advice-line SERP; the plan file says so and the "nurse on call schedule" SERP below confirms the pollution).
- `npm run keyword-check -- "on call schedule"` run 2026-11-26: "no collisions - clear to brief". The registry entry still has to be added before the publish gate runs.

## Overlap with live posts (grep of `src/data/post` for "on-call|on call", 2026-11-26)

38 files mention on-call. None owns the planned on-call rotation. The ones the draft must link to and not repeat:

| Post | What it already owns | How this post handles it |
|---|---|---|
| `after-hours-callout-coverage-small-hospitals` (live, canonical MOFU) | The 2 AM callout: ranked call list, escalation order, per-diem bench. Uses "on-call charge nurse" as the person who works the list. | Link once from the "called in" section: "when the on-call nurse is not enough, see the callout playbook". Do not rebuild a call list. |
| `low-census-small-hospital` (live) | H2 "Is On-Call During Low Census Paid Time?" quotes 785.17 | Link for the low-census case. This post goes further: the regular-rate rule (778.223) and FS#53 Example #12, which no live post cites. |
| `texas-nursing-overtime-compliance-cah` (live) | "Gap 5: On-call and callback records incomplete" (one paragraph, sends reader to counsel) | Link as the compliance-audit companion. |
| `mandatory-nurse-overtime-by-state` (live) | Texas and NY exclude prescheduled on-call from mandatory overtime | Link. **Possible defect found, not ours to fix in this brief:** lines 58 and 228 credit only New York with barring on-call as a substitute ("New York separately bars an employer from using on-call time as a way around the limit"). Texas has the same bar: HSC 258.003(c) and 26 TAC 505.41(o)(3)(D), both quoted below. "Separately" reads as if Texas lacks it. Flag to the founder for a SMALL edit on that page. |
| `physician-medical-staff-scheduling-small-hospital` (live) | Provider call (485.618(d)); says SSAI does not schedule physicians | One-line link to keep this post nurse-only. |
| `how-to-stay-cms-compliant-nurse-scheduling` (live) | 485.618 on-call practitioner log | Link only if 485.618 comes up. |
| `fair-holiday-rotation-nurses-cah`, `self-scheduling-problems-critical-access-hospital` (live) | Rotation fairness method, multi-cycle fairness tracking | Link from the fairness section; reuse the idea of a running count, not the text. |
| `what-is-nursing-overtime` (live) | One bullet on on-call | Link from the pay section. |
| `nurse-shift-schedules-types-rotation-patterns` (DRAFT, plan item #13) | H2 "What Are On-Call and PRN Shifts on a Nurse Schedule?" + FAQ "Does on-call time count as mandatory overtime in Texas?" | Overlap risk when #13 ships. Keep #13's on-call section to a definition plus a link here. |
| `free-nurse-schedule-templates` (live) | Says a template should have "fields for on-call assignment" | Link from the template section (and back). |

## Part 1. SERP map [DFS /v3/serp/google/organic/live/advanced and /live/regular, US 2840, en, depth 10, pulled 2026-11-26]

DataForSEO returned Google redirect URLs, so breadcrumbs identify the pages. Each SERP had 7 to 9 organic rows.

**"on call schedule"** (advanced): AI Overview first. It defines on-call scheduling as standby shifts outside regular hours "widely used in IT operations, healthcare, and emergency services", lists rotations (primary/secondary/backup), escalation paths, "Size the rotation sustainably: Aim for at least 3 people (5+ is often ideal)", rotate weekends and holidays evenly, "follow local labor and overtime rules". AIO citations: Everbridge, symplr healthcare glossary, Indeed, OnPage, Xurrent, ServiceNow, Atlassian, oncallscheduler.com, YouTube. Image pack: TaskCall, Atlassian Opsgenie, template.net, AlertOps, Derdack, oncalls.com, HeyOnCall, Freshservice. Organic: (1) CrowdReviews "On Schedule vs. OnCall" (thin compare page, skipped); (2) creativetemplate.net "10+ On Call Schedule Templates"; PAA ("What does on-call shift mean?", others off-topic); (3) myshyft.com on-call scheduling strategies; (4) dev.to on-call tools (Mar 2025, DevOps); (5) TaskCall YouTube (2023); (6) myshyft.com on-call team rotation; (7) Pagerly, Slack on-call (2024); (8) Pinterest template.

**"on call schedule template"** (regular): Microsoft Excel templates; itoc360 "On-Call Schedule Template for Engineering Teams" (May 2026); PaperMD "Call schedule generator ... for physicians and residents"; OnPage free on-call generator; template.net; Reddit r/excel (6 years old, skipped); Pinterest; Venngage ("Ideal for scheduling doctors or staff").

**"nurse on call schedule"** (regular): nurse triage call centers (2 results), yourco.io "Healthcare Call-Offs", Reddit and allnurses forum threads (skipped), Instagram, Prisma Health triage, staffdna.com "On Call Pay for Nurses: A 9-Point Checklist" (Oct 31, 2026), Oregon nurse advice line.

**"on-call scheduling software"** (regular): Rootly, Guideflow (PagerDuty, Splunk OnCall, xMatters...), myhospitalnow (IT/DevOps), Homebase and others for call centers. Zero healthcare vendors.

**"hospital nurse on call rotation policy"** (regular, my probe): allnurses and Reddit threads, Eolas, lawguru (2009), playerzero (IT), a Jefferson rotating-shifts literature review, myamericannurse telephone triage. No hospital policy and no regulator ranks.

**Intent the SERP shows.** The head term is mostly IT/DevOps incident on-call (tools, rotations, escalation) plus template galleries; healthcare is a minority voice (symplr glossary inside the AIO, Indeed's general guide). "on-call scheduling software" is entirely IT and call-center tooling, so this post will not rank for it and should not try; it can mention the phrase once. Physician call appears only as a generator (PaperMD). Nurse-specific on-call content that ranks is forums plus one staffing-company pay article. Hypothesis (not tested): the realistic win is the long tail (Bing's "nurse on call scheduling for small hospital", "nurse on call rotation", "on call pay for nurses") and LLM citation, not the 480/mo head term.

**(a) Table stakes (3+ of the top results or the AIO cover):**
1. Definition of an on-call schedule / standby outside regular hours (AIO, Indeed, symplr, Everbridge, Shyft glossary).
2. Rotation structure: weekly or nightly rotations, primary and backup on-call (AIO, Indeed, itoc360, OnPage generator, Atlassian).
3. Fairness and burnout: rotate weekends and holidays evenly, team size, time between rotations (AIO, dev.to "Maximum one week on-call at a time", Indeed "Best practices", Shyft).
4. A template / calendar view: daily, weekly, monthly (creativetemplate, template.net, Venngage, Microsoft, Pinterest).
5. Contact and escalation: who to reach and how (AIO, Everbridge, OnPage, Indeed "Clarify the guidelines").
6. Time-off and swaps (AIO, OnPage generator "PTO", Indeed).
7. A nod to labor and pay rules (AIO "follow local labor and overtime rules"; staffdna; symplr FAQ "legal requirements vary by state").

**(b) Gaps we can own honestly** (checked against the pages I could open: Indeed, symplr, creativetemplate, Everbridge, staffdna; Shyft returned 403 and is unchecked):
1. The federal hours-worked test with the primary text: 785.17, 785.16, and DOL Fact Sheet #53 Example #12 (a rotating LPN on-call within 45 minutes of the facility). No ranked page quotes any of them.
2. The regular-rate rule: standby pay must go into the overtime rate (29 CFR 778.223(b)). Nobody ranked covers it. Worked math below.
3. Call-back minimums are a policy choice, and how they interact with overtime (778.221). staffdna mentions callback rates without the rule.
4. Texas: on-call time is defined in law as compensated availability; prescheduled on-call is outside mandatory overtime; a hospital may not use on-call as a substitute for mandatory overtime; and the hospital's nurse staffing plan must say how on-call time will be used (26 TAC 505.41). Nothing ranked mentions any of it.
5. CAH Conditions of Participation: an on-call nurse at home does not satisfy 485.631(a)(5); the only on-call timing rule in the CAH CoPs is for practitioners (485.618(d)). No ranked page says this.
6. Small-roster rotation math: how many on-call nights each nurse carries on a 12-RN unit, and the minimum number of eligible nurses a nightly slot needs under a one-per-week cap. The AIO's "at least 3 people (5+ is often ideal)" is IT advice; a hospital night slot that runs 7 nights a week needs more.
7. A nurse on-call template with the fields a hospital needs (eligible nurses, contact, response expectation, standby rate, call-in hours, rest before next shift). Templates that rank are generic grids.

**(c) Length.** Substantive top results [curl, tag-stripped, includes some nav text, approximate]: Indeed 1,928 words; creativetemplate.net 666; symplr glossary 560; Everbridge 606; staffdna 2,413 (with heavy footer/blog chrome; body is shorter). Shyft pages returned 403 (unmeasured). Band of the top 3 substantive pages: roughly 650 to 1,900 words. Our canonical MOFU posts run 2,787 (night shift), 3,205 (self-scheduling), 3,424 (callout) body words. Target 2,200 to 2,800; do not pad toward the canonical length.

## Part 2. Primary sources (verbatim, read 2026-11-26 unless stated)

### Federal pay rules (FLSA)

1. **29 CFR 785.17** [curl, Cornell LII https://www.law.cornell.edu/cfr/text/29/785.17]. ALREADY IN DOSSIER (Low census entry, L593): "an employee required to remain 'on the employer's premises or so close thereto that he cannot use the time effectively for his own purposes is working while 'on call''; one 'merely required to leave word at his home or with company officials where he may be reached is not working while on call.'" Re-read today, full text: "An employee who is required to remain on call on the employer's premises or so close thereto that he cannot use the time effectively for his own purposes is working while 'on call'. An employee who is not required to remain on the employer's premises but is merely required to leave word at his home or with company officials where he may be reached is not working while on call." Matches.

2. **29 CFR 785.16(a)** [curl, Cornell LII https://www.law.cornell.edu/cfr/text/29/785.16]. NEW. "Periods during which an employee is completely relieved from duty and which are long enough to enable him to use the time effectively for his own purposes are not hours worked. He is not completely relieved from duty and cannot use the time effectively for his own purposes unless he is definitely told in advance that he may leave the job and that he will not have to commence work until a definitely specified hour has arrived." Use: optional, one sentence; 785.17 carries the point.

3. **DOL Fact Sheet #53, The Health Care Industry and Hours Worked** [curl with curl UA, https://www.dol.gov/agencies/whd/fact-sheets/53-healthcare-hours-worked; page says "Revised July 2009"]. DOSSIER has a paraphrase only (FLSA definitions entry, L360: "On-call: on premises or so close the employee cannot use the time effectively = working; carrying a phone at home generally not, but responding time and return-to-work time are paid"). NEW verbatim:
   - "An employee who is required to remain on call on the employer's premises or so close to the premises that the employee cannot use the time effectively for his or her own purpose is considered working while on-call. An employee who is required to carry a cell phone, or a beeper, or who is allowed to leave a message where he or she can be reached is not working (in most cases) while on-call. Additional constraints on the employee's freedom could require this time to be compensated."
   - Example #12: "An assisted living facility has four LPN wellness coordinators who are paid hourly. They rotate being on-call each week. They are required to carry a cell phone and be within 45 minutes of the facility when they are on-call. They are not paid for all time spent carrying the cell phone but are paid for time spent responding to calls and time when they have returned to work at the assisted living facility. Does this comply with the FLSA? Yes."
   - Guardrails: "in most cases" and "Additional constraints ... could require this time to be compensated" are load-bearing. Never write that at-home on-call is never hours worked. Example #12 is an assisted living facility, not a hospital; say so. Never turn "within 45 minutes" into a safe-harbor response time.

4. **29 CFR 778.223(b), on-call pay goes into the regular rate** [curl, Cornell LII https://www.law.cornell.edu/cfr/text/29/778.223]. NEW, and the most useful fact nobody ranked covers. "To the extent that these hours are regarded as working time, payment made as compensation for these hours obviously cannot be characterized as 'payments not for hours worked.' Such compensation is treated in the same manner as compensation for any other working time and is, of course, included in the regular rate of pay." Then the on-call example: "an employment contract may provide that employees who are assigned to take calls for specific periods will receive a payment of $5 for each 8-hour period during which they are 'on call' in addition to pay at their regular (or overtime) rate for hours actually spent in making calls. If the employees who are thus on call are not confined to their homes or to any particular place, but may come and go as they please, provided that they leave word where they may be reached, the hours spent 'on call' are not considered as hours worked. Although the payment received by such employees for such 'on call' time is, therefore, not allocable to any specific hours of work, it is clearly paid as compensation for performing a duty involved in the employee's job and is not of a type excludable under section 7(e)(2). The payment must therefore be included in the employee's regular rate in the same manner as any payment for services, such as an attendance bonus, which is not related to any specific hours of work."
   - Approved plain wording (proposed): "A standby payment for being on call still counts when the overtime rate is worked out, even when the on-call hours themselves are not hours worked."
   - The $5 figure is the regulation's illustration; never present it as a typical rate.

5. **29 CFR 778.221(a), call-back pay** [curl, Cornell LII https://www.law.cornell.edu/cfr/text/29/778.221]. NEW. "Typically, 'call-back' or 'call-out' payments are made pursuant to agreement or established practice and consist of a specified number of hours' pay at the applicable straight time or overtime rates received by an employee on occasions when, after his scheduled hours of work have ended and without prearrangement, he responds to a call from his employer to perform extra work. The amount by which the specified number of hours' pay exceeds the compensation for hours actually worked is considered as a payment that is not made for hours worked. As such, it may be excluded from the computation of the employee's regular rate and cannot be credited toward statutory overtime compensation due the employee. Payments that are prearranged, however, may not be excluded from the regular rate." Also: "The key inquiry for determining prearrangement is whether the extra work was anticipated and therefore reasonably could have been scheduled."
   - (b) illustration (verbatim opening): "An employment agreement provides a minimum of 3 hours' pay at time and one-half for any employee called back to work outside his scheduled hours."
   - Guardrail: whether a planned on-call rotation's call-ins count as "prearranged" is a legal question we do not answer. Write the rule and send the reader to counsel or payroll; never state that a hospital's call-back guarantee is or is not excludable.

6. **DOL Field Operations Handbook 32d04a** [curl, https://www.dol.gov/agencies/whd/field-operations-handbook/chapter-32]. NEW, supporting only. "Where an employee is guaranteed pay for a minimum number of hours, if, on infrequent or sporadic occasions, he/she reports for work at his/her scheduled time and is not given work for the specified number of hours, or if he/she is called back to work outside of his/her regular schedule, the amount paid over and above what the employee would have received, if paid at his/her customary rate only for hours actually worked, need not be included in computing his/her regular rate of pay."

7. **Does the FLSA require a call-back minimum or standby pay?** No DOL sentence that says so in those words was found (one WebSearch, plus a read of the DOL FLSA FAQ and FOH chapter 32). What DOL does say [curl, https://www.dol.gov/agencies/whd/flsa/faq], NEW: "The FLSA does not require payment for time not worked, such as vacations, sick leave or holidays (Federal or otherwise)." and "The FLSA does not require extra pay for weekend or night work." Together with 778.221's "made pursuant to agreement or established practice", the honest wording is: "Federal law does not set a call-back minimum or a standby rate; those are hospital policy. What federal law does require is pay for the hours actually worked, and overtime on them past 40 in the workweek." Do not put "the FLSA does not require call-back pay" in quotation marks or attribute it to DOL as a quote.

8. **40-hour week, 1.5x, Texas adds no overtime layer, 8-and-80.** ALREADY IN DOSSIER ("FLSA overtime", "Texas overtime law (none; FLSA governs)", "FLSA definitions"). Use dossier wording: "the 40-hour weekly FLSA overtime threshold" for any SSAI claim; "hospital overtime is generally due after 40 hours in a workweek, at 1.5 times the regular rate". Nurse exemption (FS#17N) also in dossier: RNs paid hourly "should receive overtime pay". Not re-read today.

### Texas

9. **Tex. Health & Safety Code 258.001(3), definition of on-call time** [WebFetch, texas.public.law https://texas.public.law/statutes/tex._health_and_safety_code_section_258.001, page "verified as up to date on May 26, 2025"; cross-checked word for word against the same definition in 26 TAC 505.41(o)(3)(A)(i), item 12, read by curl]. NEW. "'On-call time' means time spent by a nurse who is not working but who is compensated for availability." History: "Added by Acts 2009, 81st Leg., R.S., Ch. 742 (S.B. 476), Sec. 1, eff. September 1, 2009."

10. **HSC 258.002, mandatory overtime and the on-call exclusion** [WebFetch, texas.public.law ...section_258.002; cross-checked against 26 TAC 505.41(o)(3)(A)(ii), item 12]. DOSSIER has the first half ("a requirement that a nurse work hours or days that are in addition to the hours or days scheduled") and the exclusion as a paraphrase ("Mandatory overtime excludes prescheduled on-call time and brief pre/post-shift handoff/documentation time"). NEW verbatim second sentence: "In determining whether work is mandatory overtime, prescheduled on-call time or time immediately before or after a scheduled shift necessary to document or communicate patient status to ensure patient safety is not included."
    - Answer to the task's question: yes, prescheduled on-call time is excluded from mandatory overtime in Texas.

11. **HSC 258.003(c), no substituting on-call for mandatory overtime** [WebFetch, texas.public.law ...section_258.003; phrase confirmed in a search index across texas.public.law, Justia 2023, legalfix and the capitol PDF listing; identical text read by curl in 26 TAC 505.41(o)(3)(D), item 12]. NEW, not in dossier. "(a) A hospital may not require a nurse to work mandatory overtime, and a nurse may refuse to work mandatory overtime. (b) This section does not prohibit a nurse from volunteering to work overtime. (c) A hospital may not use on-call time as a substitute for mandatory overtime."
    - Plain wording (proposed): "Texas lets a hospital schedule on-call time, but it cannot use on-call as a back door to the overtime it is not allowed to require."
    - OUR READING, NOT LAW, never in the post without counsel framing: because 258.001(3) defines on-call time as time "compensated for availability", an unpaid "we may call you" list may not be on-call time under the chapter at all, so requiring a nurse on that list to come in could fall under mandatory overtime. Raise it as a question for the hospital's counsel, never as a conclusion.

12. **26 TAC 505.41(o), Texas hospital licensing rule (transferred from 25 TAC 133.41 eff. 1/31/2025)** [curl, Cornell LII https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41]. NEW for the on-call lines (the dossier has 505.41(o)(1)(A), (o)(2)(B) and (o)(2)(D) only).
    - (o)(2)(G)(ii)(IV): the official nurse services staffing plan "shall: ... (IV) include how on-call time will be used". The same plan list also requires (III) "a contingency plan when patient care needs unexpectedly exceed direct patient care staff resources", and the staffing committee's evaluation uses operational outcomes including "on-call use, or overtime rates".
    - (o)(3): "Mandatory overtime. The hospital shall adopt, implement, and enforce policies on use of mandatory overtime. (A) As used in this subsection: (i) 'on-call time' means time spent by a nurse who is not working but who is compensated for availability; and (ii) 'mandatory overtime' means a requirement that a nurse work hours or days that are in addition to the hours or days scheduled, regardless of the length of a scheduled shift or the number of scheduled shifts each week. Mandatory overtime does not include prescheduled on-call time or time immediately before or after a scheduled shift necessary to document or communicate patient status to ensure patient safety. (B) A hospital may not require a nurse to work mandatory overtime, and a nurse may refuse to work mandatory overtime. (C) This section does not prohibit a nurse from volunteering to work overtime. (D) A hospital may not use on-call time as a substitute for mandatory overtime."
    - (o)(3)(F) (note the licensing rule adds "and document" to the statute's wording): "the hospital shall, to the extent possible, make and document a good faith effort to meet the staffing need through voluntary overtime, including calling per diems and agency nurses, assigning floats, or requesting an additional day of work from off-duty employees."
    - Physician on-call, for contrast only: (e)(2)(C)(ii) "hospitals designated as CAHs by the CMS ... shall have a physician on-call and able to respond in person, or by radio or telephone within 30 minutes." (e)(2)(D): "Schedules, names, and telephone numbers of all physicians and others on emergency call duty, including alternates, shall be maintained. Schedules shall be retained for no less than one year." Our reading: "others on emergency call duty" may cover a nurse who takes emergency-department call; do not state that as settled.
    - This is the post's strongest Texas-specific line: the hospital's staffing plan must already say how on-call is used, so the on-call rotation is a staffing-plan item, not just a calendar.

13. **Any Texas rule limiting how often a nurse may be on call:** NOT FOUND. Checked: HSC 258.001 to 258.004 (no frequency limit) and the full text of 26 TAC 505.41 (every "on-call" occurrence listed above; none caps frequency). Not checked: Texas Board of Nursing rules (22 TAC 217), HSC 257.006/257.007 added by HB 2187 (89R). Write "we found no Texas rule that caps how often a nurse is on call", never "Texas has no limit".

14. **Texas HB 2187 (89R)**, ALREADY IN DOSSIER (Mandatory nurse overtime, other states, "Pending" bullet): signed 2025-06-20, effective 2025-09-01, adds HSC 257.006 (anti-retaliation) and 257.007 (HHSC complaint process). Not re-read. Mention only if the draft discusses complaints.

### CMS Conditions of Participation for CAHs

15. **42 CFR 485.631(a)(5)** [curl, Cornell LII, re-read today]. ALREADY IN DOSSIER, approved wording: "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients". Raw text today: "(5) A registered nurse, clinical nurse specialist , or licensed practical nurse is on duty whenever the CAH has one or more inpatients." Use: an on-call nurse at home is not "on duty"; the on-call slot sits on top of the on-duty nurse, never in place of. (The "on duty means physically present" step is our reading; the draft rotation-patterns post already makes the same point.) Pair with Texas 505.41(o)(2)(D) per dossier: "An RN shall be on duty in each building of a licensed hospital that contains at least one nursing unit where patients are present." (re-read today, matches).

16. **42 CFR 485.635(d)(1)-(2)** [curl, Cornell LII, re-read today]. ALREADY IN DOSSIER, matches: RN "must provide (or assign to other personnel) the nursing care of each patient"; (d)(2) RN "or, where permitted by State law, a physician assistant, must supervise and evaluate".

17. **42 CFR 485.618(d)(1)** [curl, Cornell LII, re-read today]. ALREADY IN DOSSIER (Transmittal 247 entry): a doctor, PA, NP or CNS "with training or experience in emergency care, on call and immediately available by telephone or radio contact, and available on site within ... 30 minutes, on a 24-hour a day basis" (60 minutes where the (d)(1)(ii) conditions are met). Raw text today matches. This is the practitioner rule; say plainly it does not apply to nurses.

18. **Does any CMS rule set a response time for on-call NURSES?** NOT FOUND, by grep. I fetched 24 sections of 42 CFR Part 485 Subpart F at Cornell LII (485.601, .603, .604, .606, .608, .610, .612, .614, .616, .618, .620, .623, .625, .627, .631, .635, .638, .639, .640, .641, .643, .645, .647, .649) and grepped each for "on call", "on-call", "response time" and "within N minutes". Every hit was in 485.618(d) (practitioners). Zero hits elsewhere, including 485.631 and 485.635. Approved wording: "The CAH rules set an on-call response time for the emergency practitioner, not for nurses." Caveat: CMS SOM Appendix W interpretive guidance was NOT re-read (cms.gov PDF returned 403 today), so say "the regulations", not "CMS guidance".

### Practice example (one example, not a norm)

19. **University of Rochester Policy 220, On-Call Pay** ("Last Revised On 12/2024") and **Policy 214, Call-In Pay** [curl, https://www.rochester.edu/policies/policy/on-call-pay and https://www.rochester.edu/policies/policy/call-in-pay/]. NEW. Applies to "All hourly paid staff", not nurses only; a large New York academic employer, not a CAH.
    - Definition: on call means "Be prepared to come to the University within approximately 30 minutes of the request."
    - Rates: "Staff in all Divisions except Division 50 (SMH) who are on call for periods of 8-11 hours (Short Call) will be paid $12.50 for the period. Staff on call for periods of 12-24 hours (Long Call) will be paid $18.50 for the period. Staff in Division 50 will be paid $16.00 for periods of short call and $24.00 for long call."
    - Call-in: "Staff called to work while on call will receive their regular rate of pay for actual hours worked or the equivalent of at least 4 hours at their regular rate of pay (whichever amount is greater), in addition to the appropriate on-call pay."
    - Frequency safety valve: staff "called in to work while on call for a particular shift with such frequency that their non-working time may not be used effectively as their own, may apply to the departmental administrator" to be paid for the whole on-call shift.
    - Guardrails: present as "one published policy, from a large New York university health employer". Do not expand "SMH". Do not average or generalise it.
    - DO NOT USE: staffdna.com's "$3-$8 per hour for standby plus time-and-a-half for actual callback hours is a common range" (unsourced staffing-company claim). No BLS or national survey figure for nurse on-call pay was found (not searched beyond the SERP and one WebSearch); write "no national figure we could verify".

## Part 3. Product truth (carried from the main session, code-verified; do not claim more)

Mode check (`product-capability-inventory-2026-08.md` §1b): rules configuration is BOTH modes. Service copy says the rules are "configured with you at onboarding" and describes what arrives (a schedule that already respects the caps), never buttons. Nurse-facing anything is PRODUCT ONLY.

Claimable:
- The scheduler supports an "on-call" shift type a unit can add (inventory L455: shift definitions typed `day`, `night`, `evening` or `on_call`).
- A hard rule caps on-call per nurse per week (default 1) and on-call weekends per nurse per month (default 1), both set per unit (inventory L366, L556; `on-call-limits.ts`; part of the 22 rules, 13 hard, per dossier).
- On-call shifts do not count toward the unit's regular staffing headcount by default.
- On-call is the last shift type the generator fills (inventory L349, L406, priority 6), after charge, ICU/ER, night and day shifts.

NOT claimable (say what it does not do, plainly):
- The cost estimate does not price on-call shifts: no standby or call-back pay modelling.
- No tracking of whether an on-call nurse was actually called in, or for how long.
- So: the post cannot claim SSAI catches the regular-rate issue or the overtime from call-in hours. The honest line: the schedule spreads on-call within the caps you set; the hours a nurse works after being called in belong in your timekeeping system, and payroll applies the overtime rules.
- Open for the founder (see questions): whether an on-call assignment counts toward the 60-hour rolling cap, the 10-hour rest rule, and the 40-hour week check.

## Part 4. Worked example (illustrative, not a customer result; all rates are made up and labelled as such)

**Setup.** A 12-RN med-surg unit at a 25-bed hospital. One RN is always on duty (485.631(a)(5); Texas each-building rule). On top of that, one on-call slot every night (7 nights a week), for a second nurse if census or acuity jumps.

**How many on-call nights each nurse carries.** A 30-day month has 30 on-call nights. Spread across 12 nurses that is 2.5 nights each (so six nurses carry 3 and six carry 2). If 4 of the 12 are permanent night staff kept off call, 30 / 8 = 3.75 nights each.

**The cap check (uses the product defaults; the math holds for any manual rotation with the same policy).** With a limit of one on-call night per nurse per week, a slot that runs 7 nights a week needs at least 7 eligible nurses. With 8 eligible nurses the week fills with one to spare; with 6 it cannot fill without breaking the limit. Weekends: a month has 4 or 5 weekends, so a one-on-call-weekend-per-month limit needs at least 4 to 5 eligible nurses for the weekend slots alone. [ADD: how the scheduler counts an "on-call weekend" before this line names the product; see founder question 1.] Contrast for the post: the AI Overview's "at least 3 people" is IT advice for weekly rotations and does not fit a nightly hospital slot.

**Fairness across months.** 30 nights do not split evenly into 12; the two nurses who carried 3 in October should carry 2 in November. Keep a running count per nurse (the same idea as the holiday rotation post), weighted for weekend nights, so the extra night rotates rather than landing on the same people.

**The FLSA consequence when called in (illustrative rates).** Nurse works three 12-hour shifts (36 hours) at $40/hour and holds 2 on-call nights that week at a flat $20 per night (illustrative; the Rochester policy is one real example of per-period rates). She is called in for 4 hours one night and 3 hours the other.
- Hours worked: 36 + 4 + 3 = 43, so 3 overtime hours (on-call hours at home are not hours worked if she only has to be reachable, per 785.17 and FS#53).
- Straight-time pay: 36 x $40 + 7 x $40 + 2 x $20 = $1,440 + $280 + $40 = $1,760.
- Regular rate (standby pay included, per 778.223(b)): $1,760 / 43 = $40.93.
- Overtime premium: 0.5 x $40.93 x 3 = $61.40. Total for the week: $1,821.40.
- If payroll leaves the standby pay out of the rate: 0.5 x $40 x 3 = $60.00, an underpayment of $1.40 that week. Small per nurse, but it repeats every week a nurse is on call and called in.
- The bigger exposure is the restriction, not the rate: if the policy kept her so tied down she "cannot use the time effectively for his own purposes" (785.17), both 12-hour on-call nights could become hours worked: 36 + 24 = 60 hours, 20 of them overtime. Which side of that line a policy falls on is fact-specific; send the reader to counsel. (All arithmetic re-run in python3 by this agent: 1760, 40.9302, 61.40, 1821.40, 60.00.)
- If the hospital offers a call-back minimum (e.g., 3 hours guaranteed for a 1-hour call), the unworked guaranteed hours may be excludable from the regular rate and cannot be credited toward overtime (778.221), unless the call-in was prearranged. Say it once, then counsel.
- Texas line: the call-in itself is not mandatory overtime when the on-call time was prescheduled (258.002), but on-call cannot be used as a substitute for mandatory overtime (258.003(c)).

## Part 5. Proposed outline (question H2s)

Key Takeaways (5 bullets: what an on-call rotation is and is not; the hours-worked test; standby pay is in the overtime rate; Texas on-call and the staffing plan; how to spread it fairly on a small roster).

Intro (no H2): the posted on-call rotation is planned weeks ahead; this post is about that plan. The 2 AM callout is a different problem (link to the callout post).

1. `## What Is a Nurse On-Call Schedule at a Small Hospital?` (definition; on-call vs PRN vs on duty; on-call is layered on top of the on-duty nurse required by 485.631(a)(5); who typically takes call is left general unless the founder answers)
2. `## Does On-Call Time Count as Hours Worked for Nurses?` (785.17, FS#53 lines + Example #12, "in most cases", the restriction test)
3. `## How Should On-Call Nurses Be Paid When They Are Called In?` (hours worked + overtime past 40; standby pay goes into the regular rate, 778.223(b); call-back minimums are policy and how 778.221 treats them; Rochester as one example; worked pay math lives here or in section 6)
4. `## What Does Texas Law Say About Nurse On-Call Time?` (258.001(3) definition, 258.002 exclusion, 258.003(c) no-substitute, 505.41(o)(2)(G)(ii)(IV) staffing plan must say how on-call is used, (o)(3)(F) document good-faith effort; no frequency cap found; our-reading note on unpaid lists goes to counsel)
5. `## Does CMS Set a Response Time for On-Call Nurses?` (no: grep result; 485.618(d) is practitioners at 30/60 minutes; Texas 505.41(e)(2)(C)(ii) physician 30 minutes; the hospital sets its own nurse response expectation in policy)
6. `## How Many On-Call Nights Should Each Nurse Carry on a 12-Nurse Unit?` (worked example: 2.5 per month, 7-eligible-nurse minimum under a one-per-week limit, weekend count, FLSA call-in week)
7. `## How Do You Spread On-Call Fairly Across a Small Nursing Staff?` (running count, weekend weighting, carry-over month to month, swaps, volunteers first; link holiday rotation and self-scheduling posts)
8. `## What Should an On-Call Schedule Template Include?` (template intent: fields table: date, on-call nurse, backup, phone, response expectation, standby rate, called in yes/no, start/end of call-in hours, rest before next shift; where it gets posted; link free templates post)
9. `## How Does SimpleScheduleAI Handle On-Call Shifts?` (only Part 3 claims: on-call shift type, weekly and weekend caps set per unit at onboarding, not counted in headcount by default, filled after regular shifts; plainly: no standby or call-back pay in the cost estimate, no call-in tracking, so call-in hours go to timekeeping and payroll)
10. `## Our Take` (immediately before What to Do, per the CTA + Our Take standard; founder view if answered, else cut)
11. `## What to Do This Week` (5 steps: pull last quarter's on-call list and count nights per nurse; check the written on-call policy states the restriction (where to be, how fast) and the standby rate; ask payroll whether standby pay is in the overtime rate; open the nurse staffing plan and confirm it says how on-call time is used; set a per-nurse monthly limit and a running count)
12. `## Frequently Asked Questions` (Is on-call the same as PRN? Can a Texas hospital require a nurse to take call? [answer carefully: on-call written into the schedule is outside mandatory overtime; requiring extra beyond the schedule is not; counsel for the rest] Do on-call hours count toward the 40-hour week? Is a nurse paid for on-call time at home? Does an on-call nurse count as the nurse on duty? Does federal law require a call-back minimum?)
13. `## Sources` (numbered, not bulleted)

H2s 1 to 9 checked: each is a standalone question, no "it", nothing after the "?". Our Take, What to Do This Week, FAQ and Sources are the standard fixed headings of the canonical MOFU posts.

## Claims we must NOT make

- That an on-call nurse at home satisfies 485.631(a)(5) or the Texas each-building RN rule.
- That CMS sets a response time for on-call nurses, or that "within 45 minutes" (FS#53 Example #12) or "30 minutes" (485.618, 505.41(e)) applies to nurses.
- That the FLSA requires standby pay or a call-back minimum; or that at-home on-call is never hours worked (FS#53 says "in most cases").
- That a call-back guarantee is or is not excludable for a given hospital (prearrangement is fact-specific).
- That Texas caps how often a nurse is on call (none found), or that unpaid on-call lists are illegal in Texas (our reading only).
- Any typical on-call pay rate (staffdna's range is unsourced; Rochester is one example).
- SSAI prices on-call, models call-back pay, tracks call-ins, or alerts on regular-rate errors. Any nurse-facing on-call feature in service copy.
- Any CAH, pilot or customer anecdote about on-call (pre-launch, no customers).

## Verification ledger

| Item | Status | Method |
|---|---|---|
| SERPs: on call schedule, on call schedule template, nurse on call schedule, on-call scheduling software, hospital nurse on call rotation policy | PULLED | DFS live advanced (first) and live regular (rest), US, 2026-11-26 |
| Page lengths: Indeed, symplr, creativetemplate, Everbridge, staffdna | MEASURED (approx., includes chrome) | curl + tag strip |
| Shyft (myshyft.com) pages | NOT OPENED | 403 to curl and WebFetch |
| 29 CFR 785.16, 785.17, 778.221, 778.222, 778.223 | VERIFIED verbatim | curl Cornell LII |
| DOL FS#53 on-call text + Example #12 | VERIFIED verbatim | curl dol.gov (curl UA) |
| DOL FLSA FAQ lines; FOH 32d04a | VERIFIED verbatim | curl dol.gov |
| A DOL sentence saying "FLSA does not require call-back pay" | NOT FOUND | WebSearch + FAQ + FOH ch. 32 read |
| HSC 258.001(3), 258.002, 258.003 | VERIFIED (WebFetch) + cross-checked against identical text in 26 TAC 505.41(o)(3) by curl; 258.003(c) phrase also matched in a search index | texas.public.law via WebFetch; curl to texas.public.law, Justia and FindLaw returned 403; statutes.capitol.texas.gov returned a JavaScript shell with no statute text |
| HSC 258.004 | DOSSIER wording stands; WebFetch summary shows no on-call subsection | WebFetch |
| 26 TAC 505.41 (o)(2)(D), (o)(2)(G)(ii)(IV), (o)(3), (e)(2)(C)(ii), (e)(2)(D) | VERIFIED verbatim | curl Cornell LII (transfer note: "Transferred from 25 TAC § 133.41 ... eff. 1/31/2025") |
| 42 CFR 485.631(a)(5), 485.635(d), 485.618(d)(1) | VERIFIED verbatim, match dossier | curl Cornell LII |
| No CMS on-call nurse response time | VERIFIED by grep of 24 Subpart F sections | curl Cornell LII + python grep |
| CMS SOM Appendix W | NOT RE-READ | cms.gov PDF 403 today |
| Texas on-call frequency limit | NOT FOUND in HSC 258, 26 TAC 505.41; 22 TAC 217 and HSC 257.006/.007 not checked | curl / WebFetch |
| Rochester Policies 220 and 214 | VERIFIED verbatim | curl rochester.edu |
| National on-call pay figure | NOT FOUND | SERP + one WebSearch |
| TWC "Waiting or On-Call Time" page (efte.twc.texas.gov) | NOT OPENED | curl connection failed |
| Worked-example arithmetic | VERIFIED | python3 |
| SSAI capability statements | CARRIED from main session; inventory lines L349, L366, L406, L455, L556 read | file read |

Dossier additions the drafting session should make (new facts above): 785.16(a); FS#53 verbatim on-call lines and Example #12; 778.223(b); 778.221(a); DOL FAQ two lines; HSC 258.001(3) and 258.003(c) verbatim; 258.002 second sentence verbatim; 26 TAC 505.41(o)(2)(G)(ii)(IV), (o)(3)(D), (o)(3)(F) "make and document", (e)(2)(C)(ii), (e)(2)(D); the Subpart F grep result; Rochester policy as a practice example.

## Founder questions

No interview debrief exists in the repo (searched `docs/`, `.claude/` and `~/Projects` for debrief files; only `docs/strategy/INTERVIEW-QUESTIONS.md` exists, and the 30+ pre-build interviews survive only as the aggregate hours split in the dossier, with nothing on on-call). So no interview question is asked.

1. **product:** How does the scheduler count an "on-call weekend" for the one-per-month cap (one on-call shift on a Saturday or Sunday, or a Friday night too?), and does the "per week" cap run on the Monday-to-Sunday week the overtime check uses?
   - Why it matters: the worked example tells a DON the minimum number of eligible nurses a nightly on-call slot needs. That number depends on how the week and the weekend are counted.
   - On "I don't know": the post states the caps as "a weekly limit and a monthly weekend limit, set per unit" with no counting detail, and the weekend-capacity line in the worked example is written for a manual rotation, without naming the product.

2. **product:** When a nurse is assigned an on-call shift, does that assignment count toward the 60-hour rolling-week limit, the 10-hour rest rule before her next shift, and the 40-hour week the overtime check uses?
   - Why it matters: a nurse on call the night before a 7 AM shift is the fatigue question a DON will ask, and the answer decides whether the post can say the schedule protects rest around on-call nights.
   - On "I don't know": the post makes no claim either way and tells the manager to set her own rest rule for the morning after a call-in.

3. **founder view:** Why are the defaults one on-call shift per nurse per week and one on-call weekend per month?
   - Why it matters: a DON setting up a rotation wants a starting number with a reason. A builder's reason ("so no nurse is on call more than X nights a month on a 12-nurse unit") is first-party material no ranked page has.
   - On "I don't know": the post presents the defaults as starting settings each unit changes at onboarding, with no rationale.

4. **founder view:** The scheduler places on-call shifts but does not price standby or call-back pay and does not record call-ins. Is that a deliberate line (pay rules belong to payroll and timekeeping) or something not yet built?
   - Why it matters: the reader will ask why the cost estimate ignores on-call. A stated reason reads as a design choice; silence reads as a gap.
   - On "I don't know": the post states plainly what the scheduler does not do and says call-in hours belong in the timekeeping system, with no reason given and nothing about plans.

5. **founder view (for Our Take):** What would you tell a DON at a 25-bed hospital about who should take call: every staff RN, volunteers first, or a paid on-call pool?
   - Why it matters: Our Take needs a position, and the SERP has no small-hospital opinion.
   - On "I don't know": the Our Take section is cut, and the fairness section keeps the neutral running-count method.

### Founder answers (2026-11-26)

- Q1 and Q2 were answered from the code instead of the founder (main session, cah-scheduler read 2026-11-26): the weekly cap runs Monday to Sunday (`getWeekStart`); an on-call weekend is any on-call shift on a Saturday or Sunday, and a Saturday and Sunday of the same weekend count once (`getWeekendId`). Q2 (60-hour window, rest, 40-hour check) is not settled cleanly from the code, so the post makes no claim either way. Also found: the callout shortlist (`src/lib/coverage/find-candidates.ts`) hard-codes the on-call limits at 1 per week and 1 weekend per month instead of reading the unit setting; flagged to the founder, not a post claim.
- Q3 (why the defaults): "Rest and fairness." Chosen so no nurse is on call more than about one night a week and one weekend a month, keeping rest and spreading call; units change them at onboarding.
- Q4 (no pay pricing or call-in records): "Deliberate: payroll's job." Pay rules and call-in hours belong in timekeeping and payroll.
- Q5 (Our Take): "Every staff RN, rotated." Volunteers first, then every eligible RN in a rotation with a running count, so call does not fall on the same few.
