# Brief: Low Census at a Small Hospital (2026-11-18)

Working title: "Low Census at a Small Hospital: Who Goes Home and How to Rotate It Fairly". Reader: DON / nurse manager at a Texas CAH (25 beds or fewer, roster 15 to 40). Voice: educational, hospital operations. Read-method tags: [curl] raw page fetched and text-extracted today; [WebFetch] tool read today (summarising model, so quotes there are checked only as far as the tool returned them); [DFS] DataForSEO API today; [Snippet] WebSearch snippet only = UNVERIFIED.

## Keyword data [DFS /v3/keywords_data/google_ads/search_volume/live, US, 2026-11-18]

| Keyword | Vol/mo | Note |
|---|---|---|
| low census | 1,600 | 12-mo range 1,300 to 1,900 |
| what does low census mean | 260 | |
| low census hospital | 140 | spiky (20 to 390) |
| low census nursing | 70 | |
| low census pay | 30 | |
| low census policy | 10 | |

## Part 1. SERP map [DFS /v3/serp/google/organic/live/advanced, US 2840, en, depth 10]

DataForSEO returned Google redirect URLs, so the breadcrumb is the identifier. Each SERP had only 7 to 9 organic rows, the rest being AI Overview, images, PAA and related searches. A "low census" AI Overview is present and cites IntelyCare (intelycare.com/facilities/resources/5-ways-to-manage-a-low-census/), Cascade (cascadestaff.com/understanding-low-census-pay/), Careflow, SEIU 1199NW PDF, and Reddit.

**"low census"** organic: (1) Facebook group post, Sterile Processing Professionals, "Low census affecting hospital jobs": social. (2) allnurses.com "How Does Your Hospital Decide Who is Called Off for Low ..." (2014): forum. (3) cdn.ymaws.com/.../ppmc "ONA Proposal November 29, 2016 ARTICLE 24": union contract proposal (host path says ppmc; "ONA" is the title, I did not read the PDF, 403 to curl). (4) Facebook fb-answers "Low Census Meaning at Work": social Q&A. (5) community.babycenter.com "Low census policies" (2011): forum; snippet "voluntary and mandatory". (6) allnurses.com "low census - General Nursing" (2003): forum, on-call pay. (7) ultragrouphealthcare.com "Low Census Plans (Mayday Plans)" (2024): vendor blog, [curl] 430 words, about rehab referral marketing, NOT staffing (intent mismatch). (8) mangoapps.com Template Library "Shift Cancellation and Low Census Log Template": vendor template [Snippet+DFS description: "record low-census cancellations, rotation patterns, and manager approval"]. Related: "Low census reddit", "Low census california". PAA (all collapsed, AI-generated): generic nursing stress questions.

**"low census nursing"** organic: Reddit r/nursing "Home health rn w/low census"; union "Article 24 Low Census Union Proposal 1 1/17/22" (ymaws ppmc); allnurses "Sign off/low census policy" (2018, "$4/hr if on call. PTO can be used if on call or low censused"); Facebook nursing-home post; BabyCenter "Low census policies"; allnurses "Low Census and Job dissatisfaction" (2021, "small rural hospital"); MangoApps log template; Facebook "What is the definition of low census in hospitals?". Related: low census nursing salary / reddit / jobs / pay.

**"low census policy"** organic is mostly off-topic: MedCity/Medigy nursing-home CMS staffing rule (2023), Reddit threads, Glassdoor layoffs thread, NursingHome411 staffing reports (2020, 2024). PAA: "What is the meaning of low census?", "How many staff should be in a nursing home?", "What are the safe staffing ratios for hospitals?", "What are the minimum staffing requirements for nursing homes in Kentucky?". No ranked page is a hospital-DON policy guide.

**Page types across all three:** forum 6, social 4, union document 2, vendor 3 (one off-topic), no hospital, no professional body, no regulator.

**(a) Table stakes (3+ results/sources cover):** definition of low census (IntelyCare, Cascade x2, AIO, Facebook answer); voluntary vs mandatory (Cascade pay, BabyCenter, allnurses, SEIU, ONA); cancellation order (IntelyCare, AIO, SEIU, allnurses); pay options: guaranteed minimum, low-census PTO bank, standby/on-call stipend, unpaid or PTO (Cascade pay, SEIU, allnurses 2003 and 2018); union contract language (ONA x2, SEIU, WSNA).

**(b) Gaps a small-hospital DON can own** (tested against what I read; none is covered by a page I read in depth):
1. How far down census can go before a legal floor stops you (nobody ties low census to 485.631 or a state floor; Cascade only says "make sure the staff that's staying isn't going to end up with unsafe nurse-to-patient ratios"). Confirmed gap.
2. Fair rotation with worked counts for a roster of 15 to 40 (Cascade says "rotation system, reverse seniority, or random selection" with no counts; SEIU describes "equitable rotation" without method). Confirmed gap in pages read.
3. Exempt versus hourly nurse (IntelyCare mentions misclassification in one clause; nothing on salary-basis). Gap.
4. Texas specific pay answer (Cascade pay says "In many states, labor laws require partial payment", with no state answer). Gap.
5. On-call during low census (Cascade: "federal law may consider that compensable time", no test). Gap.
6. CAH framing: nothing ranked mentions a 25-bed hospital. IntelyCare and Cascade are large-facility and staffing-vendor voice. Hypothesis (unchecked in volume): "low census hospital" demand (140) is the closer fit to our reader.

**(c) Word-count band.** Top 3 organic rows are a Facebook post, a forum thread and a union PDF, so no band exists. The three content pages that actually answer the query (AIO citations) [curl, tag-stripped, includes some nav text, approximate]: IntelyCare 5 Ways 1,369 words; Cascade low census pay 1,497; Cascade what it means 1,839. Recommendation: 1,800 to 2,300 words (above all three, because worked counts and the legal sections add length).

## Part 2. Primary sources (verbatim)

**2.1 FLSA salary basis, 29 CFR 541.602** [curl, https://www.law.cornell.edu/cfr/text/29/541.602, 2026-11-18]
- (a)(1): "Subject to the exceptions provided in paragraph (b) of this section, an exempt employee must receive the full salary for any week in which the employee performs any work without regard to the number of days or hours worked. Exempt employees need not be paid for any workweek in which they perform no work."
- (a)(2): "An employee is not paid on a salary basis if deductions from the employee's predetermined compensation are made for absences occasioned by the employer or by the operating requirements of the business. If the employee is ready, willing and able to work, deductions may not be made for time when work is not available."
- (b)(1): "Deductions from pay may be made when an exempt employee is absent from work for one or more full days for personal reasons, other than sickness or disability." (b) lists seven exceptions (personal full days, sickness plan, offsets for jury/witness/military pay, major safety rules, unpaid disciplinary suspension, first/last week, FMLA). Employer-initiated low-census cancellation is not among them.
- So the answer to the example question is: employer-occasioned absences are NOT a permitted deduction, per (a)(2). This is the regulation's text; applying it to a nurse's day off is my reading, to be framed "ask HR counsel".
- 541.603(a) [curl, .../541.603]: "An employer who makes improper deductions from salary shall lose the exemption if the facts demonstrate that the employer did not intend to pay employees on a salary basis."
- 541.301(e)(2) [curl, .../29/541.301]: "Registered nurses who are registered by the appropriate State examining board generally meet the duties requirements for the learned professional exemption. Licensed practical nurses and other similar health care employees, however, generally do not qualify as exempt learned professionals". Salary-level threshold NOT read today (541.600); do not quote a dollar figure.
- Not read, UNVERIFIED: whether an employer may charge a salaried nurse's PTO bank for the cancelled day (DOL opinion letters). Do not state.

**2.2 On-call time, 29 CFR 785.17 and 785.16** [curl, https://www.law.cornell.edu/cfr/text/29/785.17 and .../785.16]
- 785.17: "An employee who is required to remain on call on the employer's premises or so close thereto that he cannot use the time effectively for his own purposes is working while 'on call'. An employee who is not required to remain on the employer's premises but is merely required to leave word at his home or with company officials where he may be reached is not working while on call."
- 785.16(a): "Periods during which an employee is completely relieved from duty and which are long enough to enable him to use the time effectively for his own purposes are not hours worked. He is not completely relieved from duty and cannot use the time effectively for his own purposes unless he is definitely told in advance that he may leave the job and that he will not have to commence work until a definitely specified hour has arrived. Whether the time is long enough to enable him to use the time effectively for his own purposes depends upon all of the facts and circumstances of the case."
- DOL Fact Sheet 22 [WebFetch, https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked; dol.gov returned 403 to curl]: "Additional constraints on the employee's freedom could require this time to be compensated." Fetch tool output only; use Cornell text for any quote.

**2.3 Texas**
- Reporting-time pay: no Texas statute or rule found. Searches run (4 WebSearches, 2026-11-18): "Texas law reporting time pay employee sent home early no state requirement Texas Payday Law"; "Texas Labor Code 61.001 Payday Law wages minimum guaranteed pay sent home early ... reporting pay"; "Texas Workforce Commission partial unemployment ..."; "Texas Labor Code 201.091 partial unemployment ...". The statutes site is geo-blocked, so absence is NOT proven at statute level. Supporting secondary source [WebFetch, https://www.findlaw.com/state/texas-law/texas-wage-and-hour-laws.html, heading "Reporting Time Pay and Split-Shift Premiums"]: "Unlike some states, Texas doesn't require reporting time pay when a worker shows up but is sent home early." (FindLaw is secondary; label it so.)
- Texas Payday Law, Labor Code 61.001(7) [curl, https://texas.public.law/statutes/tex._labor_code_section_61.001]: "'Wages' means compensation owed by an employer for: (A) labor or services rendered by an employee, whether computed on a time, task, piece, commission, or other basis; and (B) vacation pay, holiday pay, sick leave pay, parental leave pay, or severance pay owed to an employee under a written agreement with the employer or under a written policy of the employer." Implication (my reading, flag as such): a written low-census pay promise could become enforceable wages, so write the policy carefully.
- Partial unemployment, Labor Code 201.091(b) [curl, https://texas.public.law/statutes/tex._labor_code_section_201.091]: "An individual is partially unemployed in a benefit period of less than full-time work if the individual's wages payable for that benefit period are less than the sum of: (1) the benefit amount the individual would be entitled to receive if the individual was totally unemployed; and (2) the greater of: (A) $5; or (B) 25 percent of the benefit amount." 201.091(e): "an individual is not considered unemployed and is not eligible to receive benefits for any benefit period during which the individual works the individual's customary full-time hours". Shared Work, 215.002 [curl, texas.public.law/statutes/tex._labor_code_section_215.002]: "The commission, under a voluntary shared work unemployment compensation program designed to reduce unemployment and stabilize the work force, shall allow participating employees shared work benefits." Shared Work is for planned reduced hours of an affected unit, not day-by-day cancellations (hypothesis).
- **TWC pages: UNREACHABLE.** WebFetch and curl both failed DNS (getaddrinfo ENOTFOUND for twc.texas.gov, www.twc.texas.gov, efte.twc.texas.gov). One Wayback attempt was blocked by the permission classifier and not retried. Nothing from TWC itself is quotable; claims about eligibility must stay at statute text or be dropped. Mirror caveat: texas.public.law copies the statute (verified "May 26, 2025" on the page); currency after that date not checked.

**2.4 Staffing floors (facts-dossier.md, approved wording, not re-derived)**
- 42 CFR 485.631(a)(5): "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients". Wrong: "a registered nurse must be on duty". Dossier URL https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631; dossier re-verified 2026-11-03 at Cornell LII (https://www.law.cornell.edu/cfr/text/42/485.631): "(5) A registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients." "No ratio or certification requirement anywhere in 485.631."
- 26 TAC 505.41(o)(2)(D): "An RN shall be on duty in each building of a licensed hospital that contains at least one nursing unit where patients are present." (dossier, verified 2026-08-19 via Cornell LII). Citation note: never write 25 TAC 133.41; it moved to 26 TAC 505.41 on 2025-01-31.
- Texas H&S Code 257.003: written nurse staffing policy to "ensure that an adequate number and skill mix of nurses are available to meet the level of patient care needed"; plan sets minimum staffing levels (b)(2), methods for adjusting staffing (b)(3). Guardrail: 257.003 never uses "acuity", "census" or "intensity of care"; do not write that Texas mandates census-based staffing; (257.004 sets no ratio). Source in dossier: https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-003, verified 2026-08-17.
- Implication for the post: the federal and state floors turn on having inpatients, not on a number. With one inpatient, one licensed nurse must be on duty; the written Texas plan is the real minimum. I have no source for how a CAH handles zero-inpatient ED coverage; leave it out or mark as out of scope.

**2.5 Definitions and practice (examples of practice, NOT law)**
- Vendor definition, IntelyCare [curl, https://www.intelycare.com/facilities/resources/5-ways-to-manage-a-low-census/]: "Low census happens when there's a significant decrease in the number of patients in your facility or floor, regardless of whether it's expected." Same page: "The policy should define the process for deciding who will get called off first (e.g., travel nurses, per diem, staffing agencies, nurses earning overtime pay, etc.)."
- Vendor definition, Cascade [curl, https://cascadestaff.com/what-does-low-census-mean-in-healthcare/]: "if your hospital usually staffs for 30 inpatients but today only 10 beds are filled, you're facing low census." Cascade pay page [curl, https://cascadestaff.com/understanding-low-census-pay/]: "A good policy specifies how call-offs are decided; it's usually decided by a rotation system, reverse seniority, or random selection. For example, if one nurse was called off last week, the next person on the list goes home this time." Pay options listed there: "Partial Pay or Minimum Pay Guarantees", "Low Census PTO", "On-Call or Standby Pay", "PTO or Unpaid Time Off".
- Hospital policy, small Washington hospital (Ferry County, Policy 14.1.013 Nurse Staffing Matrix, revised 02/10/2022; the document does not itself say "critical access", it lists swing-bed matrices) [curl+PDFKit, https://doh.wa.gov/sites/default/files/legacy/Documents/2300/HospPolicies/FerryCountyNS.pdf]: "Low census is defined as a decline in patient care requirements resulting in temporary staff hour reduction. During periods of low census, the CNO or Nurse Manager will first ask for volunteers to take time off before determining and implementing the reduced staffing schedule required. In the event there are no volunteers, RN Management will endeavor to rotate low census equitably among nurses assigned to each area by shift, subject to competence, ability, and availability." On call: "Voluntary On-Call personnel will be utilized for additional staffing needs ... On call hourly wage will be compensated per RN Union Contract language." Matrix example: "1 Registered Nurse or LPN for one to six patients depending on their acuity."
- Union example, SEIU Healthcare 1199NW guide to the St. Elizabeth Hospital contract (WA, large hospital, 2024-10-18) [curl+PDFKit, https://www.seiu1199nw.org/wp-content/uploads/2024/10/bb-100924-seh.pdf]: cut order "First Cut - Agency/Contract Workers/Travelers ... Next Cut - Overtime Work, Next Cut - Volunteers, Next Cut - Extra Shifts (not overtime), Next Cut - Per Diem, Next Cut - Part-Time Nurses, Next Cut - Full Time"; "Standby pay": "$4.25 per hour"; "a low census fund equivalent to six hundred (600) nursing hours per calendar year"; mandatory low census "based on an equitable rotation within the shift for that Hospital unit". Contract-specific, not a model for a 20-nurse hospital.
- Union example, WSNA bulletin: [Snippet only] "Mandatory Low Census (MLC) hours are limited to (48) hours per each designated six month period." UNVERIFIED (wsna.org URL 404'd to curl). Do not use.
- No professional-body definition found (ANA/AONL search, one WebSearch). Do not attribute a definition to a professional body.

## Part 3. Repo

Live posts (frontmatter `draft: false`, all verified by grep) and inbound link placement. Blog URL form is `/blog/<slug>`. Only one live post mentions the term at all (how-to-reduce-nurse-overtime, line 127), so this post has no cannibalisation risk.

| Slug | Title | Inbound sentence (file line) |
|---|---|---|
| how-to-reduce-nurse-overtime | How to Reduce Nurse Overtime at a Critical Access Hospital | L127 "Placed on windows that are reliably low-census, on-call holds coverage available without loading scheduled hours into the period." Link "low-census". |
| what-is-per-diem-nursing | What Is Per Diem Nursing? How It Works in Critical Access Hospitals | L60 "...no guaranteed hours, less continuity with patients, and being first to be floated or cancelled when census drops." |
| fair-nurse-schedule-small-hospital | How to Build a Fair Nurse Schedule at a Small Hospital | L117 "Count five things for every nurse, every cycle." No existing low-census sentence; add one clause: a low-census send-home count belongs beside weekends, holidays, charge. |
| float-pool-nursing-small-hospitals | Float Pool Nursing: Why 25-Bed Hospitals Don't Have One, and What Works Instead | L40 "...when one unit is short and another is overstaffed: pull a cross-trained nurse off the bench and send her where the need is." |
| how-to-handle-nurse-callouts | How to Handle Nurse Callouts at a Critical Access Hospital | L158 "If census is low and minimum staffing holds with the nurses on shift, a voluntary two-to-four-hour extension..." (note: that line is about extension, not send-home; link on "census is low"). |
| acuity-based-staffing-small-hospital | Acuity-Based Staffing at a Small Hospital: A Practical Guide | L80 "Use census bands with a named skill mix." Link a new sentence: what happens when census falls below the lowest band. |

Extra: texas-nursing-overtime-compliance-cah (L75 "On-call and callback time may count as hours worked depending on conditions"); nurse-staffing-ratios-critical-access-hospital (outbound for floors); what-is-nursing-overtime (outbound, 40-hour week); after-hours-callout-coverage-small-hospitals (outbound, on-call). Do not call a post "on-call coverage guide" unless the title says so.

**What SimpleScheduleAI may and may not claim about low census today**
- Inventory [docs/seo/product-capability-inventory-2026-08.md L581]: "Per-unit send-home order and a per-nurse 'available for VTO' flag and `flexHoursYearToDate` counter are stored and editable, and the assignment-dialog *suggests* who to flex when a shift is overstaffed. There is **no workflow that executes a flex-home** — nothing writes assignment status `flexed`, nothing increments `flexHoursYearToDate`, and nothing emits the `flex_home` audit action." L272: `lowCensusOrder` "displayed on the unit card, but there is **no form control to change either**".
- Service claim [facts-dossier L1024, founder 2026-08-10]: "we adjust the patient-load band and release excess staff when census drops. Claimable in SERVICE mode as something the service does. NOT a product claim". But the inventory (written-routine test, L133 onward) says: "safe in a live sales conversation, and NOT yet safe as published site copy", and service-runbook.md L67 lists low census under "Routines still UNWRITTEN (not claimable in published copy)".
- Net: published copy may NOT say SSAI handles, executes, automates or adjusts low census. The only wording the inventory calls honest (product mode) is "flags overstaffed shifts and suggests who to flex." Also claimable as visibility: the audit trail names "the resulting position" and says "excess staff" when a shift goes over requirement. Whether to use even that in a service-mode blog is a founder call; default recommendation is zero capability claims in this post, educational only. Cost claims stay in hours, never dollars.

## Proposed outline (question H2s)
1. What does low census mean at a small hospital?
2. Who goes home first when census drops?
3. How low can census go before a staffing rule stops you? (485.631(a)(5), 505.41(o)(2)(D), 257.003, dossier wording only)
4. How do you rotate low census fairly with a roster of 20 nurses? (worked counts)
5. Do you have to pay a nurse who is sent home in Texas?
6. What happens to PTO when a nurse is sent home for low census?
7. Can you dock a salaried nurse for a low-census day? (541.602)
8. Is on-call during low census paid time? (785.16, 785.17)
9. Can a nurse whose shifts are cut get unemployment benefits in Texas? (statute text only)
10. What should a written low census policy say?
11. FAQ block (grouped, per standard)

Worked-count design for H2 4 (illustrative arithmetic, labelled hypothetical, no real data): 6 RNs on a day shift, census needs 5, so 1 goes home; maintain a low-census list ordered by fewest send-homes this year; ties break by who was cut longest ago; a volunteer takes no count if the policy says so, otherwise it counts; skill-mix check before each pick (the Ferry County "subject to competence, ability, and availability").

## Claims we must NOT make
- SSAI handles, automates, executes or adjusts low census (inventory, runbook above). No "send-home workflow".
- Any "Texas law requires pay for sent-home shifts" (none found) or "Texas law forbids it" (absence is not proven; statutes site geo-blocked).
- Any TWC eligibility or benefit-amount claim (TWC unreachable).
- That an exempt nurse "can never" be docked (541.602(b) has exceptions); say employer-occasioned absence is not one of them.
- "Texas requires census-based or acuity-based staffing" (257.003 guardrail); "RN must be on duty at a CAH" (485.631 allows RN, CNS or LPN).
- That the St. Elizabeth or ONA terms are law or typical. Examples of practice only. No percent or "most hospitals" claim (no fabricated stats), no pilot or customer anecdotes, no "we've seen".
- FLSA wording: "the 40-hour weekly overtime threshold", never 8-and-80 overclaim. No em dashes, no vague pronouns, H2s as standalone queries.
- Legal advice: frame as "ask HR counsel".

## Verification ledger
| Claim | Status | Source / method |
|---|---|---|
| Keyword volumes | VERIFIED | DFS keywords_data 2026-11-18 |
| SERP rows, PAA, related, AIO refs | VERIFIED (as returned) | DFS SERP; non-ranked pages' sections only for ones fetched |
| 541.602(a)(1),(a)(2),(b)(1) text; 541.603(a) | VERIFIED | curl LII |
| 541.301(e)(2) RN exemption sentence | VERIFIED | curl LII |
| 785.17, 785.16(a) text | VERIFIED | curl LII |
| Fact Sheet 22 quote | PARTLY (tool summary) | WebFetch dol.gov |
| Tex. Labor Code 61.001(7), 201.091, 215.002 text | VERIFIED (mirror) | curl texas.public.law, page dated 2025-05-26 |
| No Texas reporting-time pay law | UNVERIFIED at statute; FindLaw secondary quote read | WebFetch FindLaw; 4 searches listed above |
| TWC content | UNREACHABLE | ENOTFOUND |
| 485.631(a)(5), 505.41(o)(2)(D), 257.003 wording | VERIFIED (dossier, dates above), not re-read today | facts-dossier.md |
| Ferry County policy quotes | VERIFIED | curl PDF + PDFKit text |
| SEIU St. Elizabeth guide quotes | VERIFIED | curl PDF + PDFKit text |
| IntelyCare and Cascade quotes | VERIFIED | curl |
| WSNA 48-hour limit | UNVERIFIED (snippet) | WebSearch |
| ANA/AONL low census definition | NOT FOUND | one search |
| Exempt nurse PTO offset; salary threshold amount | UNVERIFIED | not read |
| SSAI capability statements | VERIFIED | inventory L111-137, L272, L581; runbook L67; dossier L1024 |

## Founder questions

1. **product:** Can the post claim a low-census service routine? ANSWERED 2026-11-18: the nurse manager tells us the census changed; we change the schedule (options of which staff to add or remove) and send it back for approval. Timing, after discussion: same business day, not the 1-hour/3-hour callout promise. Written into `docs/ops/service-runbook.md` as R2.
2. **founder view:** What should Our Take recommend? ANSWERED 2026-11-18: volunteers first, then rotation by a running count.
3. **interview:** none asked; no interview debrief exists in `docs/strategy/`.
