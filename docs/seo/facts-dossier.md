# Facts Dossier — Canonical Stats, Regulations, and Product Truths

Rule (same as the competitor dossier): any fact with an entry here MUST be used with the approved wording below. A fact not in this dossier must be verified against a primary source before use, then ADDED here in the same session. Entries older than 60 days at time of use get re-verified. The mechanical enforcement lives in `scripts/lib/facts-rules.mjs` (wired into `check-blog`); when you add an entry with a drift risk, add a matching rule there.

## External facts

### Texas critical access hospital count

- Approved wording: "Texas has 93 critical access hospitals" (or "the state's 93 critical access hospitals")
- Source: RHIhub Texas state guide, "Rural Healthcare Facilities" section, shows 93 Critical Access Hospitals.
- URL: https://www.ruralhealthinfo.org/states/texas
- **93 is THE current count for all general "Texas has N CAHs" claims.** It was 91 until the 2026-08-11 re-verification; that is normal drift, not an error in the earlier figure. Do NOT use "86" as a current headline count. 86 is the OLDER Texas DSHS 2024 staffing-study survey frame (spring 2024) — see the DSHS entry below. The two differ by data vintage/scope; 86 is valid ONLY inside explicit DSHS-2024-study context (its vacancy/turnover stats depend on that 86-CAH universe), never as the present-day total.
- Note: CAH counts drift slowly as facilities convert or close; re-verify if the entry is older than 60 days at time of use.
- Verified: 2026-08-11 (live RHIhub fetch; count moved 91 -> 93, swept across all live content the same day). Prior: 2026-07-17 (fact-check agent live fetch + Flex/CMS cross-check; standardized 91-vs-86 across the site same day).

### 42 CFR 485.631(a)(5)

- Approved wording: "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients"
- Wrong: "a registered nurse must be on duty" (RN-only overstates the reg)
- Section covers: Staffing and staff responsibilities. Pin-cite for the on-duty clause: (a)(5).
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631
- Verified: 2026-07-03 (via Cornell LII cross-check)

### 42 CFR 485.635(d)

- Approved wording: a registered nurse must "provide (or assign to other personnel) the nursing care of each patient" and "supervise and evaluate the nursing care for each patient"
- Nuance: the supervise-and-evaluate clause is (d)(2), and its full text reads "A registered nurse or, where permitted by State law, a physician assistant, must supervise and evaluate the nursing care for each patient." Where the PA alternative matters (e.g., a compliance explainer), do not imply RN-only.
- Wrong: attributing this clause to 485.631; implying only an RN may supervise and evaluate (the reg allows a PA where State law permits)
- Section covers: Provision of services. Paragraph (d) heading: Standard: Nursing services.
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635
- Verified: 2026-07-04 (via Cornell LII cross-check; eCFR bot-blocks automated fetches)

### 42 CFR 485.610 (location / distance)

- Approved wording: "more than a 35-mile drive on primary roads from the nearest hospital or CAH, or more than 15 miles in areas of mountainous terrain or where only secondary roads are available"
- Necessary-provider path: closed to new entrants; only facilities certified by their state as a necessary provider BEFORE January 1, 2006 keep that designation (statutory sunset). A hospital seeking the designation today qualifies on the mileage test.
- Wrong: listing "necessary provider designation" as a current qualifying requirement alongside the mileage test (it is a closed alternative path, not an AND requirement)
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.610 (cross-check: https://www.ruralhealthinfo.org/topics/critical-access-hospitals)
- Verified: 2026-07-06 (via Cornell LII + RHIhub; eCFR bot-blocks automated fetches)

### 42 CFR 485.620 (bed cap / length of stay)

- Approved wording: "no more than 25 inpatient beds" (a); acute inpatient care "does not exceed, on an annual average basis, 96 hours per patient" (b)
- Nuance: the 96 hours is an ANNUAL AVERAGE across acute-care admissions, never a per-patient cap. Swing-bed days draw from the same 25-bed pool (485.620(a): "Inpatient beds may be used for either inpatient or swing-bed services") but sit outside the acute-care average, which is scoped to acute inpatient care.
- Wrong: "patients can only stay 96 hours"; treating swing beds as exempt from the 25-bed cap
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.620
- Verified: 2026-07-06 (via Cornell LII)

### 42 CFR 485.618 (emergency services)

- Approved wording: emergency services "available on a 24-hours a day basis"
- Related: the on-call practitioner availability window lives in this section (used by the how-to-stay-cms-compliant post)
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.618
- Verified: 2026-07-06 (via Cornell LII)

### Chartis 2026 Rural Health State of the State

- Approved figures: 41.2% of rural hospitals operating in the red nationally; split by Medicaid expansion status 34.9% (expansion states) vs 52.2% (non-expansion states); 417 rural hospitals vulnerable to closure; state vulnerable counts Texas 50 (highest), Kansas 44, Tennessee 27, Georgia 25, Mississippi 24; 331 rural hospitals stopped offering OB between 2011 and 2024; 448 stopped offering chemotherapy between 2014 and 2024; human capital = 56% of healthcare costs
- Wrong: rounding 448 chemotherapy up to "450+" (it is 448, so "nearly 450" is the honest phrasing); calling the report a "Rural Health Snapshot" (the title is "Rural Health State of the State"); applying the 41.2% national figure to a Texas hospital (Texas is a NON-EXPANSION state, so 52.2% is the applicable cohort figure)
- Report published February 10, 2026. Always attribute the year and the report name.
- Texas non-expansion status source: use [KFF State Health Facts](https://www.kff.org/affordable-care-act/state-indicator/state-activity-around-expanding-medicaid-under-the-affordable-care-act/), which lists Texas as "Not Adopted" (10 non-adopting states: AL, FL, GA, KS, MS, SC, TN, TX, WI, WY). Do NOT cite healthinsurance.org for this; it returns 403 and renders as a blocked link.
- URL: https://www.chartis.com/insights/2026-rural-health-state-state
- Verified: 2026-07-30 (primary-source fetch of the Chartis report page; KFF expansion status re-verified 2026-07-30)

### Texas Rural Health Transformation Program (RHTP)

- Approved figures: Texas first-year (Budget Period 1) award = $281,319,360.67, 100% federally funded by CMS/HHS, administered by Texas HHSC under the "Rural Texas Strong" state plan; workforce share = $99 million announced April 29, 2026 (Initiative 4, "The Next Generation of the Small Town Doctor and Team"); permitted uses are scholarships for local students, relocation or signing bonuses, and new residency training programs
- Wrong: claiming Texas funds temporary/shared/rotational STAFFING POOLS (it does not; the Texas workforce money is recruitment-and-training pipeline money). Claiming Critical Access Hospitals are named eligible (NOT VERIFIED; the Initiative 4 RFA could not be retrieved, and Initiative 1 was limited to rural hospital districts with a publicly owned and operated hospital). Using the $322M figure seen in some search summaries (unreconciled; use $99M with the April 29 2026 date). Treating the ~$1.4B five-year number as awarded (it is a state projection; only Budget Period 1 is awarded).
- Contrast fact: West Virginia announced $1.8M on July 14, 2026 for "regional, rotational staffing pools" (physicians, nurses, advanced practice providers). Say "the only state we could confirm," never "the only state in the country" (the Bipartisan Policy Center's May 19 2026 workforce roundup covers ~17 states and names no staffing pools, but predates the WV announcement).
- URLs: https://content.govdelivery.com/accounts/TXHHSC/bulletins/4143d1c (award + administrator) | https://gov.texas.gov/news/post/governor-abbott-hhsc-announce-99-million-in-federal-funding-for-rural-hospitals-to-recruit-workers ($99M workforce) | https://governor.wv.gov/article/governor-morrisey-announces-18m-investment-address-critical-healthcare-workforce-shortages (WV contrast)
- Verified: 2026-07-30 (HHSC GovDelivery bulletin fetched directly; $99M corroborated across four independent outlets. NOTE: gov.texas.gov and other texas.gov domains bot-block/fail DNS from our tooling, so re-confirm that link opens before citing it again.)

### NSI 2025

- Approved figures: average cost to replace one staff RN = $61,110; national RN turnover = 16.4% (2025 report, CY2024 data)
- Wrong: $52,350 (unverified prior-edition figure — do not assert)
- Note: the NSI PDF URL is a rolling filename and now serves the 2026 edition; keep the citation label "2025 NSI National Health Care Retention and RN Staffing Report". Do not mix editions: the 2026 edition (CY2025 data) reports 17.6% turnover and $60,090 per staff RN — those are NOT the 2025-report figures above.
- URL: https://www.nsinursingsolutions.com/Documents/Library/NSI_National_Health_Care_Retention_Report.pdf
- Verified: 2026-07-04 (URL resolves, now serving 2026 edition; 2025-report figures cross-verified via secondary citations since the 2025 PDF is no longer at this URL)

### NNU fact sheet

- Approved: "roughly 1.15 million registered nurses hold active licenses but are not working as nurses"; NNU primary source dated May 26, 2026 (BLS data released May 15, 2026); NNU President Jamie Brown, RN; quote verbatim: "The data is clear that the U.S. nursing profession has a retention crisis, not a nurse shortage."
- Source verbatim (for reference): "Nearly 1.15 million registered nurses (RNs) with active licenses are not working as nurses" — "roughly 1.15 million" is an acceptable paraphrase, "nearly" is the source's word.
- Wrong: dating the fact sheet June 3, 2026 (that is a WNY Labor Today republication)
- URL: https://www.nationalnursesunited.org/press/new-data-shows-there-is-a-nurse-retention-crisis-not-a-nurse-shortage
- Verified: 2026-07-04

### JAMA Network Open (Feb 2026)

- Approved: research letter "Organizational Factors to Reattract Nurses to Hospital Employment" (Lasater, McHugh, Muir; published online Feb 9, 2026; e2556570; DOI 10.1001/jamanetworkopen.2025.56570). Adequate staffing named by 65% OF THE NONRETIRED nurses surveyed who had left a hospital job (1,113 of the nonretired subset; overall pool 4,043).
- Wrong: citing NNU for this stat; wrong: "65% of respondents" without the nonretired qualifier.
- URL: https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2844818
- Verified: 2026-07-01

### RHIhub rural workforce

- Approved: "63.1% of primary care HPSAs are in rural areas" (HRSA, State of the Primary Care Workforce, 2025); rural provider supply below metro.
- URL: https://www.ruralhealthinfo.org/topics/health-care-workforce
- Verified: 2026-07-01

### RHIhub rural RN density

- Approved: roughly 65 registered nurses per 10,000 people in rural (nonmetro) areas versus about 99.5 in urban (metro) areas (RHIhub Healthcare Workforce page, 2024 BLS OES data; precise figures 65.1 / 99.5).
- URL: https://www.ruralhealthinfo.org/topics/health-care-workforce
- Verified: 2026-07-05 (proofread-agent live verification during nurse-retention-strategies publish)

### FLSA overtime

- Approved framing: "FLSA overtime thresholds" via DOL Fact Sheet #54 ("The Health Care Industry and Calculating Overtime Pay"; the 7(j) 8-and-80 system pays overtime over 8 hours/workday and 80 hours/14-day period). The 8-and-80 system is educational content only.
- Wrong: linking https://www.dol.gov/agencies/whd/fact-sheets/54-flsa-hospitals (stale URL held only by this dossier; every live post already uses the canonical URL below)
- URL: https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime
- Verified: 2026-07-04 (dol.gov 403-blocks automated fetches; canonical URL confirmed via search index, content cross-verified via DOL elaws FLSA Overtime Calculator Advisor, webapps.dol.gov)

### Texas overtime law (none; FLSA governs)

- Approved wording: "Texas adds no state overtime layer on top of the federal rule" / "hospital overtime is generally due after 40 hours in a workweek, at 1.5 times the regular rate" (the "generally" is load-bearing, see nuances)
- Nuance 1: Texas Labor Code chapter 62 is a minimum-wage statute only; it contains NO overtime provision, and §62.151 exempts FLSA-covered persons from the chapter entirely. Chapter 62 also preempts municipal wage ordinances (no local overtime layer either).
- Nuance 2: hospitals may elect the FLSA §7(j) 8-and-80 system instead of the 40-hour workweek (educational content only, never an SSAI feature claim).
- Nuance 3: public-agency hospital employers (e.g., hospital-district CAHs) may lawfully provide comp time at 1.5 hours per OT hour under FLSA §207(o) instead of cash overtime — avoid a flat "requires 1.5x pay" without "generally".
- Wrong: citing Texas Labor Code §62.002 as an overtime provision (it is the minimum-wage section; check-blog now blocks it); "Texas overtime law requires..."
- URL: https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime ; https://statutes.capitol.texas.gov/Docs/LA/htm/LA.62.htm
- Verified: 2026-07-11 (TWC FLSA guidance + §62.151 via Justia mirror + FS#54 quotes via compliance-vendor mirror; dol.gov and statutes.capitol.texas.gov bot-block direct fetches)
- CROSS-REF: the entry above is about overtime PAY. Mandatory overtime ASSIGNMENT is a separate question with the OPPOSITE answer — see "Texas HSC Chapter 258" below. Never write "Texas does not restrict nurse overtime" without distinguishing pay from assignment.

### Texas HSC Chapter 258 (mandatory overtime for nurses PROHIBITED)

- Approved wording: "Texas Health and Safety Code Chapter 258 prohibits a hospital from requiring a nurse to work hours beyond her scheduled shifts, and a nurse may refuse mandatory overtime." Retaliation against a refusing nurse is prohibited (§258.005).
- "Nurse" = RN or LVN licensed under Occupations Code ch. 301. Mandatory overtime excludes prescheduled on-call time and brief pre/post-shift handoff/documentation time.
- Exceptions (four, narrow): (1) health care disaster in the county or a neighboring county; (2) declared federal/state/county emergency; (3) unforeseeable emergency the hospital could not reasonably have anticipated; (4) a surgery/procedure in progress the nurse cannot safely leave. Even under the unforeseeable-emergency exception, the hospital must FIRST attempt voluntary overtime, agency nurses, and off-duty volunteers.
- Wrong: "Texas does not prohibit mandatory overtime for nurses" (a pre-rewrite callouts draft asserted this — it is the opposite of the statute); treating mandatory assignment as a routine callout-escalation step in Texas content; conflating this with the no-state-overtime-PAY-law entry above.
- URL: https://law.justia.com/codes/texas/health-and-safety-code/title-4/subtitle-b/chapter-258/ (also https://statutes.capitol.texas.gov/Docs/HS/pdf/HS.258.pdf, bot-blocked)
- Verified: 2026-08-05 (web search cross-check: texas.public.law + Justia sections 258.002/.003/.004/.005; caught while rehabbing how-to-handle-nurse-callouts, whose draft FAQ claimed the opposite)

### CAH staffing statistics pack (collected 2026-07-13 for the statistics hub)

All verified from loaded primary pages/PDFs on 2026-07-13; collected for the planned "Rural Hospital & CAH Nurse Staffing Statistics" hub. Any post may use them with the wording below.

**CAH landscape**

- 1,388 certified CAHs in the US (July 2026) — Flex Monitoring Team, Historical CAH Data. URL: https://www.flexmonitoring.org/historical-cah-data-0 (series: 1,381 Jan 2026, 1,383 Apr 2026, 1,388 Jul 2026 — the page publishes a new count roughly quarterly, so re-verify before any outreach push). Verified 2026-08-11 (live page read; site swept 1,383 -> 1,388 same day). NSI 2026 figures re-verified UNCHANGED the same day: 17.6% turnover, 8.6% vacancy, $60,090 per RN, 43 unfilled FTEs, 33.1% of hospitals above 10% vacancy, 527 hospitals across 40 states.
- 197 rural hospital closures/conversions since January 2005 (109 complete + 88 converted); 154 since 2010 — UNC Sheps Center rural closures tracker, page updated 12/4/25. URL: https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/ — Wrong: 195 (stale snippet); NO per-state Texas total is stated (never hand-count the table).
- 94% of CAH CEOs reported nursing staff difficult to recruit; 86% reported retention challenges — Flex Monitoring policy brief (Feb 2023; survey of CAH CEOs Mar-May 2022, n=155 of 404, 38% response). URL: https://www.flexmonitoring.org/sites/flexmonitoring.umn.edu/files/media/CAH_workforce_during_COVID_Barriers_and_facilitators_for_recruiting_and_retaining_staff_2025.pdf — always carry the 2022-survey date.

**National staffing & turnover (2026 NSI report, CY2025 data — do NOT mix with the 2025-edition figures elsewhere in this dossier)**

- Hospital RN turnover 17.6% average / 18.6% median (range 5.6%-40.0% by bed size); overall hospital turnover 18.5%; RN vacancy 8.6% (33.1% of hospitals at 10%+); 78 days to recruit an experienced RN; NSI-estimated national RN shortage 158,600 (avg 43 unfilled RN FTEs/hospital); cost per bedside RN departure $60,090 (average hospital loses $4.2M-$6.2M/yr; each 1% turnover change = ~$295,000/yr) — 2026 NSI National Health Care Retention & RN Staffing Report (527 hospitals, 40 states; 262,405 RNs covered). URL: https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf
- Rural vs urban RN density 65.1 vs 99.5 per 10,000 (2024 BLS OES via RHIhub) — re-confirmed unchanged 2026-07-13. URL: https://www.ruralhealthinfo.org/topics/health-care-workforce
- HRSA/NCHWA projections (released Dec 2025, horizon 2038): 108,960 RN FTE national shortage by 2038; nonmetro RN shortage projected 11% vs 2% metro. URL: https://bhw.hrsa.gov/data-research/projecting-health-workforce-supply-demand (bot-blocks direct fetch; verified via reader proxy of that URL)

**Wages (BLS May 2025 OEWS via O*NET — mean/median caveat)**

- RN wages: national $46.90/hr, $97,550/yr; Texas $46.14/hr, $95,970/yr — O*NET OnLine local-wages page for 29-1141.00 republishing BLS May 2025 wage data. URL: https://www.onetonline.org/link/localwages/29-1141.00?st=TX — CAUTION: O*NET labels these "average" but they sit at the median position; write "median (BLS May 2025, via O*NET)" or leave unlabeled. Do not claim "mean" until bls.gov is directly verifiable (bls.gov 403s automated fetches).

**Texas cut (Texas DSHS / TCNWS 2024 Hospital Nurse Staffing Study, published Feb 2025; spring-2024 survey, 297 of 739 hospitals, 40.2% response)**

- Texas has 86 CAHs across 78 counties; 50 of 86 (58.1%) responded. Rural/CAH factsheet #25-16864: https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_RuralCAH_accessible.pdf
  - **"86" is this study's spring-2024 survey frame ONLY, not the current statewide total.** The current count is 93 (RHIhub/Flex/CMS, 2026 — see "Texas critical access hospital count" entry above). Use 86 solely inside DSHS-2024-study context (all the vacancy/turnover/staff-mix stats below are computed on this 86-CAH universe, so those stats keep 86). Never write "Texas has 86 CAHs" as a present-day fact.
- Texas CAH RN vacancy 11.6% (rural non-CAH 14.3%; non-rural 16.5%) — CAHs LOWER than non-rural on vacancy.
- Texas CAH RN median turnover 18.2% — highest of the three hospital groups (rural non-CAH 15.4%; non-rural 17.4%).
- CAH staff mix: RNs are 61.0% of nursing staff (vs 80.5% non-rural); LVNs 16.4% (vs 3.6%) — the LVN-heavy mix claim.
- 74.0% of Texas CAHs reported NO change in budgeted RN FTEs (vs 36.3% non-rural); only 24.0% increased.
- Statewide: RN vacancy 16.4% (down from 17.6% in 2022); 8,575.0 of 52,369.8 RN FTEs vacant; RN median facility turnover 23.2% (down from 28.3% in 2022). Highlights factsheet #25-16865: https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_Highlights_accessible.pdf — Wrong: do not cite the factsheet's LVN vacancy line (contains a source typo "21.5% in 2022", should read 2024).

- Verified: 2026-07-13 (all loaded directly except HRSA/BLS noted above; dshs.texas.gov needed Google DNS to resolve)

### 42 CFR 482.23(b)

- Approved wording (verbatim reg text): "The nursing service must have adequate numbers of licensed registered nurses, licensed practical (vocational) nurses, and other personnel to provide nursing care to all patients as needed."
- No numeric nurse-to-patient ratio appears anywhere in 482.23. Pin-cite for the adequate-numbers clause: 482.23(b) (Standard: Staffing and delivery of care) — the lead sentence of (b), not (b)(1).
- Wrong: claiming any federal numeric ratio exists.
- Section covers: Condition of Participation: Nursing services (general hospitals).
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-C/section-482.23
- Verified: 2026-07-04 (via Cornell LII cross-check; eCFR bot-blocks automated fetches)

### California 22 CCR 70217

- Approved figures: licensed nurse-to-patient ratios of 1:5 on medical/surgical units (in effect since January 1, 2005), 1:2 in critical care units (ICU), and 1:4 in the emergency department; the regulation sets ratios for roughly 14 unit types and its operative language is "at all times."
- Wrong: 1:6 med-surg (the pre-2005 initial figure); citing a court case for the breaks-coverage point (no case precisely holds it — the regulation's own "at all times" text plus relief-nurse coverage is the support).
- URL: https://www.law.cornell.edu/regulations/california/Cal-Code-Regs-Tit-22-SS-70217
- Verified: 2026-07-04

### State ratio-law landscape (CA / OR / MA / NY)

- Approved framing: California is the longest-standing comprehensive ratio state (22 CCR 70217, fully in effect since 2005). Oregon's HB 2697 (signed August 2023) sets minimum ratios across 12 hospital unit types, phased in through mid-2026 (med-surg 1:5 moving to 1:4 in June 2026; nurse-ratio enforcement began June 1, 2025) — a second broad multi-unit ratio state, not a narrow one. Massachusetts mandates a ratio in the ICU only (MGL c. 111, § 231; 1:1 or 1:2 by acuity). New York mandates an ICU/critical-care ratio plus staffing committees and disclosure (PHL § 2805-t, 2021).
- Wrong: "California is the only state with comprehensive mandated ratios" (stale once Oregon's phase-in completed in June/July 2026); describing Oregon as regulating "one unit" or as "limited ratios"; citing the Massachusetts ICU law as § 227 (that section covers unlicensed personnel).
- URL: https://www.oregon.gov/oha/PH/PROVIDERPARTNERRESOURCES/HOSPITALSTAFFING/Documents/HOSPITALStaffingFAQ.pdf
- Verified: 2026-07-04

### Texas Health and Safety Code 257.004

- Approved wording (verbatim statute text): "At least 60 percent of the members of the committee must be registered nurses who: (1) provide direct patient care during at least 50 percent of their work time; and (2) are selected by their peers who provide direct patient care during at least 50 percent of their work time." The committee develops and recommends a nurse staffing plan to the hospital's governing body; the chapter sets no ratio.
- Acceptable compression: "at least 60 percent direct-care registered nurses" (the 50-percent-of-work-time qualifier may be omitted in summary prose, but "registered nurses" is required — LVNs do not count toward the 60 percent).
- Wrong: "60 percent nurses" without "registered".
- URL (reader-facing links): https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-004/ — statutes.capitol.texas.gov is the canonical CITATION but the host fails DNS outside the US (founder-confirmed broken 2026-07-04, India); use FindLaw for hyperlinks, keep "Texas Health and Safety Code 257.004" as the visible citation text, and label the Sources entry "FindLaw".
- Verified: 2026-07-04 (via texas.public.law cross-check)

### Texas Health and Safety Code 257.001 (who Chapter 257 covers)

- Approved wording (verbatim statute text): "'Hospital' means: (A) a general hospital or special hospital, as those terms are defined by Section 241.003, including a hospital maintained or operated by this state; or (B) a mental hospital licensed under Chapter 577." The same section defines "Patient care unit" as "a unit or area of a hospital in which registered nurses provide patient care."
- Approved framing: **Chapter 257 contains no exemption or carve-out for rural, small, or Critical Access Hospitals.** A Texas CAH is licensed as a general hospital under Chapter 241, so the nurse staffing policy, plan and committee requirements apply to it the same as to a 500-bed system hospital. This is the licensure route, not a CAH-specific provision.
- Wrong: claiming Chapter 257 exempts small or rural hospitals; claiming it applies because of anything in the CAH Conditions of Participation (42 CFR 485), which is a separate federal scheme.
- URL: https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-001.html — statutes.capitol.texas.gov fails DNS outside the US, so link FindLaw and keep "Texas Health and Safety Code 257.001" as the visible citation text.
- Verified: 2026-08-17

### Texas Health and Safety Code 257.003 (nurse staffing policy and plan)

- Approved wording (verbatim statute text, subsection (a)): the governing body must adopt, implement and enforce a written nurse staffing policy to "ensure that an adequate number and skill mix of nurses are available to meet the level of patient care needed."
- Approved wording (verbatim fragments, subsection (b)): the staffing plan must set minimum staffing levels using "multiple nurse and patient considerations" and "nursing assessment and in accordance with evidence-based safe nursing standards" (b)(2); must include methods for adjusting staffing (b)(3); and must include contingency planning for when "patient care needs unexpectedly exceed direct patient care staff resources" (b)(4). Subsection (b)(1) requires the plan to reflect current standards from accreditation organizations and nursing associations.
- **Approved framing, and the honesty guardrail: 257.003 never uses the words "acuity", "census", or "intensity of care."** Say that Texas requires a written plan matching skill mix to the level of patient care needed, and that acuity-based staffing is one recognised way to answer that requirement. Do NOT write that Texas law mandates, requires, or defines acuity-based staffing.
- **Do not stretch that guardrail into "the legislature never contemplated acuity."** An adversarial check on 2026-08-17 found that 257.002(a)(2), the Legislative Findings section, does use the phrase "patient intensity": "providing an adequate level of nurse staffing based on research findings and patient intensity." The silence claim is true of 257.003 and true on exact-phrase matching across the chapter. It is NOT true that the concept is absent. Scope any silence claim to the word and to the section.
- Wrong: "Texas requires acuity-based staffing"; attributing the word "acuity" to the statute; treating (b)(2) as setting a ratio (the chapter sets none, see 257.004).
- URL: https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-003 — same FindLaw rule as 257.001 and 257.004.
- Verified: 2026-08-17

### Aiken 2002 staffing-mortality figure (7 percent)

- Approved: each additional patient per nurse is associated with a 7% increase in the likelihood of dying within 30 days of admission (and a 7% increase in failure-to-rescue) — Aiken LH et al., "Hospital Nurse Staffing and Patient Mortality, Nurse Burnout, and Job Dissatisfaction," JAMA 2002;288(16):1987-1993. Cite the study directly for the number.
- Wrong: attributing the 7% figure to the AHRQ PSNet primer — the primer states only a general association ("increased risk of patient safety events, morbidity, and even mortality as the number of patients per nurse increases") and never states the percentage or cites Aiken. AHRQ PSNet may be cited only for that general association.
- URL: https://pubmed.ncbi.nlm.nih.gov/12387650/ (study); https://psnet.ahrq.gov/primer/nursing-and-patient-safety (general association only)
- Verified: 2026-07-04

### ANA staffing position

- Approved framing: ANA "supports enforceable ratios as an essential approach to achieving appropriate nurse staffing" and treats multiple strategies (including nurse-driven staffing committees) as complementary: "Long-standing nurse staffing challenges will require multiple strategies."
- Wrong: framing ANA as ratios-only or committees-only.
- URL: https://www.nursingworld.org/practice-policy/nurse-staffing/
- Verified: 2026-07-04

### ARISE Healthcare AI Industry Report (July 2026)

- **Source note:** ARISE (Stanford/Harvard academic collaborative), "Healthcare AI Industry Report," July 2026 edition — PDF supplied directly by the founder. UPGRADE 2026-07-12: the report's official bibliography appendix ("ARISE Industry Report Appendix vShare.pdf", Google Drive via tinyurl.com/ARISE-References-26) was fetched and the primary citations below are now verified as real, correctly-attributed publications (citation-verified; the full papers themselves were not read — quote the finding via ARISE, cite the primary by name+DOI).
- **Verified primary citations:** Black, Kameron C., et al. 2026, "Uses of Generative AI by Non-Clinician Staff at an Academic Medical Center," npj Health Systems 3(1):13, DOI 10.1038/s44401-025-00063-y. Berlin, Gretchen, et al. 2026, "Ushering in the next Era of Frontline Nursing with AI," McKinsey & Co. (https://www.mckinsey.com/industries/healthcare/our-insights/ushering-in-the-next-era-of-frontline-nursing-with-ai). Elsevier 2026, "Clinician of the Future 2026: Nurses Edition" (https://www.elsevier.com/insights/clinician-of-the-future/2026/nurses). Bedi, Suhana, Ryan Welch, et al. 2026, "HealthAdminBench: Evaluating Computer-Use Agents on Healthcare Administration Tasks," arXiv PREPRINT, DOI 10.48550/ARXIV.2604.09937 (label as preprint if cited). Angus, Derek C., et al. 2025, "The JAMA Summit Report on Artificial Intelligence," JAMA 334(18):1650, DOI 10.1001/jama.2025.18490.
- **Fact 1 — staffing/scheduling is a named AI category.** The report's own taxonomy (built with domain experts, aligned to the JAMA Summit on AI framework) names "Manage workforce capacity and resources: AI helps allocate or forecast system level resources, staffing, scheduling or operational capacity to improve care delivery and efficiency" as one of four core Administrative Workflow AI use cases. Verbatim, Figure 1 (Introduction section). Use for: legitimizing "AI-powered scheduling" as a recognized category, not marketing invention.
- **Fact 2 — nurses are the most AI-underserved clinical role.** Report states (citing Black et al. 2026, a retrospective analysis of 30,503 chat threads from a secure LLM tool at Stanford Medicine Children's Hospital, and separately Elsevier 2026 / Berlin et al. 2026): "Nurses use AI less than doctors (41% vs. 57%), and only about half report adequate institutional support, even as nursing workflows are considered a significant, but largely unrealized opportunity for AI use cases in care delivery." Approved paraphrase: "nurses use AI at lower rates than physicians (41% vs 57%), per a 2026 ARISE healthcare AI industry analysis." Do NOT attribute the percentage directly to "Elsevier" or "Berlin et al." without separately verifying those — cite "ARISE Healthcare AI Industry Report, July 2026" as the source.
- **Fact 3 — agentic AI reliability gap on admin/ops tasks.** Report cites HealthAdminBench (Bedi, Welch, et al. 2026, not independently verified): "the best agent achieved only 36.3% end-to-end task success with portal guidance and 19.3% without it, even as the strongest system reached 82.8% on individual subtasks." Use for: substantiating skepticism of "agentic AI" marketing claims (ours and competitors') — strong subtask performance does not imply reliable multi-step task completion.
- **Wrong:** implying this report covers rural, critical access, or small-hospital settings — it does not (searched, zero mentions of "rural," "critical access," "shortage," "turnover"); citing HealthAdminBench without the "preprint" label; claiming we read the primary papers' full text (we verified citations, not contents).
- Verified: 2026-07-06 (source: local PDF; full title "Healthcare AI Industry Report," ARISE-AI.ORG watermark on figures)

### Booker 2024 rostering time (BMC Nursing)

- Approved: Booker LA, Mills J, Bish M, Spong J, Deacon-Crouch M, Skinner TC. "Nurse rostering: understanding the current shift work scheduling processes, benefits, limitations, and potential fatigue risks." BMC Nursing 2024;23:295. Qualitative case study, 24 nurses responsible for rostering, three Australian hospitals (one ~900-bed metro, two regional/rural ~700 and ~200 beds). Participants described the roster build taking from about a day a month to "at least 3 days a month- sometimes I have to do them at home or on my days off" (verbatim participant quote). Rosters built 6-8 weeks ahead; done by unit managers/ANUMs or backfill.
- Use for: external grounding that manual roster-building is a substantial, days-per-month task that spills into personal time. NOT usable for: any activity-level time split (the study has no per-activity breakdown), US/CAH-specific figures, or the 8-12 hrs/week total (different scope: build task only, Australian setting).
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC11057102/ (DOI 10.1186/s12912-024-01949-2)
- Verified: 2026-07-10 (full text fetched via PMC)

### Florence admin-burden survey 2023 (Nursing in Practice)

- Approved: snapshot survey of 222 NHS and social care managers across the UK, run by healthcare app Florence, September 2023, reported by Nursing in Practice (Jerome Smail, Oct 6, 2023). Most-cited time-consuming admin tasks: rota scheduling (43%), documentation and record-keeping (30%), speaking to agencies to secure cover staff (21%). 20% of respondents spent 7-8 hours a day on admin.
- Wrong: reading the percentages as shares of TIME (they are shares of respondents citing the task); presenting it as independent academic research (vendor-run survey, attribute to Florence); applying UK agency-cover specifics to US CAHs beyond "securing cover is a major named admin task".
- URL: https://www.nursinginpractice.com/latest-news/survey-uncovers-extent-of-healthcare-admin-burden/ (403-blocks non-browser fetches, use a browser UA)
- Verified: 2026-07-10 (full text extracted)

### July 2026 nurse strikes (Nurse.org)

- Approved facts (all from the single Nurse.org report, attribute to it, do not upgrade to independent verification): five actions July 3-13, 2026 across MI/MD/KS/MA/NY. MyMichigan Medical Center Alma (~178 nurses, Michigan Nurses Association, ULP strike July 3-6, pay offer 0%/1%/1%, 98% strike authorization); Ascension Saint Agnes Baltimore (~600, NNU, one-day July 6, cut staffing hours + unsafe floating, e.g. med-surg nurses assigned to newborns); Ascension Via Christi St. Francis + St. Joseph Wichita (~1,200, NNU, one-day July 6, workplace-violence protection central + safe staffing); Brigham and Women's + MGB Home Care Boston (~4,000 + ~450, Massachusetts Nurses Association, July 8, union calls it largest nurse/HCW strike in MA history, home-care arm 7 days); St. Charles Hospital Port Jefferson NY (~300, NYSNA, from July 13, >99% authorization, staffing ratios; Catholic Health denies).
- Common-thread framing (source's own): safe staffing at or near the top of every list; "there are not enough of them at the bedside to keep patients safe."
- Wrong: "the Wichita strike ended July 10" (it was a one-day strike July 6); "five strikes between July 6 and 13" (first ran July 3-6); treating union claims (e.g. ratio violations at St. Charles) as adjudicated fact — the hospital denies them.
- URL: https://nurse.org/news/july-2026-nurse-strikes/ (Jay Wiley, July 6, 2026; page 403-blocks non-browser fetches, use a browser UA)
- Verified: 2026-07-10 (full body extracted and read)

### Nurse manager scheduling hours (first-party, 30+ interviews)

- CANONICAL SOURCE: `/blog/nurse-manager-scheduling-time-breakdown` (30+ nurse-manager interviews run before building SimpleScheduleAI). Always frame as our estimate of a typical week from those conversations, NOT a measured time study, and never as customer data (pre-launch, zero customers).
- Approved split, WEEKLY AVERAGE across a 4-week cycle, total 8-12 hrs: securing callout and absence cover 4-6 hrs (largest single consumer); collecting availability 1-1.5; building the schedule 1-1.5; adjusting the posted schedule 1-1.5; entering and distributing 1-1.5.
- UNIT TRAP (caused a live contradiction, fixed 2026-08-10): schedule building is "4 to 6 hours PER CYCLE" and ALSO "1 to 1.5 hours PER WEEK" — the same work with different denominators. The /nurse-scheduling-software chart had rendered the per-cycle figure inside a weekly chart, which inverted the ranking and made the build look like half the week. ALWAYS state the denominator.
- Wrong: "most of the week goes to building the schedule" (the build happens once per cycle); mixing this table with the /blog/healthcare-scheduling-crisis split, which cuts the week by process rather than activity and is documented in the breakdown post as having different categories.
- External context (published, weak): vendor and nursing-school blogs put nurse-manager scheduling at roughly 5-10 hrs/week (10-20 per pay period), which brackets our 8-12 range. No published study gives a reliable build-versus-cover split, so the interviews are our only source for the RANKING.
- Verified: 2026-08-10 (breakdown post cross-checked against the money-page chart; web search found no authoritative published split)

### Montefiore utilization review AI layoffs (July 2026)

- Approved facts: Montefiore eliminated 12 utilization review nurse positions across its Bronx campuses; termination notices dated May 28; positions ended July 12, 2026; the chart-review work shifted to AI-powered software from Datavant, a private-equity-backed health data company (attribute the 12/May 28/July 12/Datavant set to Nurse.org's report). NYSNA held a public action July 1, 2026 under the banner "The Bronx needs real nurses, not AI" (NYSNA press release, July 1, 2026). Utilization review role definition (Norwood News): nurses who "read patient charts and make the case for a patient's insurance company to cover the care a doctor orders."
- Verbatim quotes (never trim or paraphrase inside quote marks): Marilyn Shuler, RN, 39-year Montefiore employee facing layoff: "What we want from Montefiore is simple: stop the layoffs, keep a licensed nurse on the final review, use AI to support us instead of replacing us" (Norwood News, July 2, 2026, Síle Moloney). Nancy Hagans, NYSNA President: "Artificial intelligence should never replace real human caring from a nurse" (Norwood News). Joe Solmonese, Montefiore senior vice president: "The claims by NYSNA are inaccurate and misleading. What is true is that we are always investing in new technology to ensure the best care and outcomes for our patients" (Norwood News).
- Contract-violation claim: union representatives say the move violates the contract members won through a recent strike (WNY Labor Today, July 5, 2026). The strike's duration is NOT verified — never write "41-day strike".
- Wrong: "AI replaced bedside nurses at Montefiore" (all 12 positions were utilization review, an administrative role); adjudicating the dispute either way (union claims vs hospital denial — both are claims); quoting Montefiore's "nonclinical program that helps facilitate the paperwork process" line (secondhand, not independently verified — use only the Solmonese quote above).
- URLs: https://nurse.org/news/montefiore-nurses-laid-off-ai/ (403-blocks non-browser fetches); https://www.norwoodnews.org/nysna-allege-montefiore-plans-to-replace-some-nurses-with-ai-systems/; https://www.nysna.org/press/today-bronx-nurses-sound-alarm-montefiore-replacing-real-nurses-ai; https://www.wnylabortoday.com/news/2026/07/05/new-york-state-labor-news/the-bronx-needs-real-nurses-not-ai-nysna-represented-nurses-at-montefiore-hospital-sound-the-alarm-on-the-medical-facility-s-plans-to-replace-nurses-with-artificial-intelligence-powered-software/
- Verified: 2026-08-04 (live fetches of Norwood News, NYSNA release, WNY Labor Today; Nurse.org corroborated via search, page bot-blocked)

## Product truths

- Self-label: "AI-native nurse scheduling service". Never "managed service" as a self-label (category/comparison use is fine).
- Pricing SPLITS BY MODE (founder, 2026-07-06): SERVICE mode (canonical line, verbatim): **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees. PRODUCT mode (canonical line, verbatim): **Cost:** $10 per user per month, or $100 per user per year. Every nurse and manager on the roster is a user. No setup fees. NEVER say "no per-nurse fees" in product mode (product pricing IS per-user); never mix the two models on one page. Annual math: $100/yr vs $120 monthly-billed = two months free.
- NOT shipped (never claim as SSAI features), all CODE-VERIFIED 2026-08-10 against cah-scheduler @ 4ca898c: FLSA 8-and-80 calculation method (zero repo matches; overtime is the FLSA 7-day rule, >40h Monday-Sunday); credential/license-expiry tracking (`certifications` is a bare string array, no dates, no rule reads it); **labor cost in dollars** (no hourly-rate field exists; both cost panels render "Coming Soon", so cost claims stay in HOURS, never dollars); **nurse self-scheduling or open-shift claiming** (filling an open shift is a manager approval action); **email, SMS, or push alerting** (notifications are in-app database rows delivered by polling, no mail or SMS provider in the codebase); **per-diem bench** (no such concept exists in code); **native or installable mobile app** (web manifest has empty icons and no service worker).
- SHIPPED and CODE-VERIFIED 2026-08-10, safe to claim (see `docs/seo/product-capability-inventory-2026-08.md` for file-level evidence): three scored draft options per run (Balanced, Fairness Optimized, Cost Optimized); 22 rule evaluators, 13 hard and 9 soft; PRN availability enforced as a HARD constraint, so a per-diem nurse is never scheduled on a date they did not offer; callout ranking that puts straight-time candidates above overtime and agency last, showing the specific reason each ineligible nurse is blocked; publishing BLOCKED while hard violations remain; reproducible seeded generation written to the audit log; understaffed shifts returned with human-readable reasons; rest, consecutive-day, and 60-hour checks that carry across the schedule boundary; full roster export to Excel that round-trips the import template (no data lock-in); schedule export and audit-trail CSV.
- SAFE HARBOR: DO NOT MENTION (founder 2026-08-10). We have nothing specific to Texas Safe Harbor nursing peer review (22 TAC §217.20) in the app, and the founder ruled it out of blog content for now. Do not describe it as a feature, a roadmap item, or a gap we fill. The database fields and audit action the code inventory found are NOT a capability. Educational mentions of the statute in unrelated compliance posts are also off the table until the founder revisits.
- WHAT WE DO HAVE INSTEAD (founder 2026-08-10, matches the shipped analytics): per-nurse visibility of rule violations and overtime over a period, so the nurse manager can SEE that a particular nurse is being leaned on repeatedly and decide not to overuse her. Claimable as visibility that supports a human decision, never as an automated protection or a legal safeguard. Evidence: compliance overview (hard/soft violations, overtime instances, unfilled shifts) and overtime-by-staff in `src/app/api/analytics/route.ts`.
- AUTH / LOGIN SECURITY: a PRODUCT-mode concern only (founder 2026-08-10). Service customers have no accounts, so the `AUTH_ENABLED` flag is irrelevant to service copy and to today's risk picture. When the product launches it runs in a SEPARATE environment holding real customer data, and auth-on becomes a launch requirement there. Never use login security as a service selling point.
- SERVICE-MODE OPERATING TRUTH (founder, 2026-08-10): in service mode the hospital operates nothing, the manager included. Approval is a decision communicated over email or an agreed channel, not a click. KEEP writing "the nurse manager approves before anything posts"; NEVER write or imply "approves in the app", "logs in to review", or "from the dashboard" about a service customer. Corollary: a code STUB or PARTIAL is not automatically unavailable in service mode, because our team is part of the system. Service claim test = the software does it OR our team does it manually as a confirmed part of the routine. Product claim test = the software does it unassisted.
- LOW CENSUS (founder-confirmed 2026-08-10): we adjust the patient-load band and release excess staff when census drops. Claimable in SERVICE mode as something the service does. NOT a product claim: the code has census bands and suggestions but no send-home execution workflow (`unit.lowCensusOrder` is stored and displayed with no edit control).
- COST CLAIMS STAY IN HOURS, NEVER DOLLARS (founder 2026-08-10): hourly rates are not planned. There is no rate field, and both labor-cost analytics panels render "Coming Soon". Manager hours returned and overtime hours avoided are claimable; a dollar figure for labor cost is not, unless it is the customer's own arithmetic on their own rate (e.g. the illustrative $50/hr loaded-rate framing, which must stay labelled illustrative).
- UNITS / MULTI-SPECIALTY (founder 2026-08-10): the demo currently runs ONE department (ICU); multi-specialty is wanted for the live demo but is not what a prospect sees today. Do not showcase multi-unit or multi-specialty scheduling as a demo-able capability until the demo covers it. Per-unit configuration does exist in the data model.
- MODE SPLIT on capabilities (founder ruling 2026-08-10). Code existence is not claim permission. PRODUCT ONLY, never in service copy: the nurse portal and everything in it (nurse-reported callouts, leave requests, swap proposals, nurse-submitted PRN availability, in-app notifications), practice mode and the onboarding guide, login/roles/session security, and analytics dashboards as a "you can see" feature. In SERVICE mode the honest inverse is usually stronger: "your nurses never have to learn a new app." Service claims describe what ARRIVES (a compliant schedule, a ranked shortlist, an audit trail), never who clicked what.
- EMPLOYMENT TYPE / PRN availability (founder clarification + product screenshot, 2026-08-10). SHIPPED: a PRN Availability page ("View availability submitted by per diem (PRN) staff for scheduling") listing each PRN nurse's submitted available days with submission dates, a Missing Submissions block naming PRN staff who have not submitted yet, and a Record availability action for entering it on their behalf. Employment type (staff, per diem, agency) is collected with the roster at onboarding; schedules build around per-diem availability and the callout shortlist orders staff options ahead of per diem and agency, so per diem and agency surface after the closer options are used. Travel nurses are NOT covered by the availability page.
  - CLAIMABLE: "the service tracks per diem availability, including which PRN staff have not submitted theirs yet"; "the schedule and callout shortlist rank against it"; "employment type is part of the roster we configure at onboarding"; "staff options come ahead of per diem and agency".
  - NOT CLAIMABLE (overstates; corrected sitewide 2026-08-10): that WE "maintain the per-diem bench" or "maintain the per diem availability list", or otherwise recruit, credential, or curate the hospital's standby roster. We maintain the availability DATA; the hospital owns the bench. Also never extend the availability page to travel nurses.
  - MODE SPLIT: nurse-side submission is PRODUCT mode (per-diem availability tab in the nurse portal). SERVICE mode has no nurse-facing app, so availability reaches the system through the manager or our scheduling team; service copy says "we track", product copy may describe the page.
- Setup timeline SPLITS BY MODE (founder, 2026-07-05): SERVICE mode = TWO separate numbers that are never interchangeable — **onboarding takes 3 to 5 business days** and **the first schedule arrives inside two weeks** (founder-restated 2026-08-10; "48 hours to first schedule", "goes live in days" and "3 to 5 days to first draft" are all WRONG and were swept out of 40 files on 2026-08-10, then gated in `check-blog.mjs`) — true today, keep on service pages/posts. PRODUCT mode = setup takes ABOUT FOUR WEEKS from roster upload to first live schedule (guided setup session, rule mapping, test cycles). NEVER carry service timelines into product-mode copy. Canonical 4-week onboarding flow (founder, 2026-07-05): collect staff Excel -> set up the hospital's workspace -> import the roster -> configure units and rules together in the guided setup session -> train the DON -> go live. Name these steps when explaining the timeline; they are what makes the one-month promise safe to give. Consequence: speed-to-live is NOT a product-mode differentiator against competitors with 4-6 week implementations; product comparisons anchor on no-configuration-burden, no integration project, and simple per-user pricing instead.
- Nurse-facing portal SPLITS BY MODE (founder + product repo verified 2026-07-05): SERVICE mode = no nurse-facing app ("your staff never touches the software"). PRODUCT mode = a browser nurse portal exists (schedule calendar, log a callout, request leave/swaps, per-diem availability tab; verified in the cah-scheduler repo /my routes). Product copy may describe it; still nothing to install.
- Callout contact SPLITS BY MODE: SERVICE = log the callout with us, we update and send the corrected copy. PRODUCT = the system ranks the shortlist; THE MANAGER contacts the chosen nurse; never claim the product removes the phone call itself, only the guesswork ("three targeted calls instead of working down the roster").
- No customers, no pilots: SSAI is pre-launch. Never cite pilot observations, cohorts, facilities, or results. The free 60-day pilot offer is RETIRED; CTA = /how-it-works or /pricing + book-a-call.
- CTA pattern: one primary button + "Book a call with our team" text link below. Never /pilot.

## Maintenance log

| Date       | Change                                                         | By     |
| ---------- | -------------------------------------------------------------- | ------ |
| 2026-07-03 | Initial population from 2026-06-30..07-03 verified fact-checks | Claude |
| 2026-07-04 | Added staffing-ratio facts: 482.23(b), CA 70217, state ratio landscape (OR/MA/NY), TX 257.004, Aiken 2002/AHRQ, ANA position | Claude |
| 2026-07-06 | Added CAH CoP designation facts for requirements post: 485.610 (35/15 miles, necessary-provider sunset Jan 1 2006), 485.620 (25 beds, 96-hr annual average, swing-bed nuance), 485.618 (24-hr emergency); all verified via Cornell LII + RHIhub | Claude |
| 2026-07-06 | Added ARISE Healthcare AI Industry Report (July 2026) facts: staffing/scheduling as a named AI taxonomy category, nurse AI-adoption gap (41% vs 57%), HealthAdminBench agentic-AI reliability gap (36.3%/19.3% vs 82.8%). Source is a founder-supplied local PDF; underlying primary studies (Black et al., Bedi/Welch et al.) not independently re-verified — cite the ARISE report, not the primary studies. Confirmed report has zero rural/CAH/shortage content. | Claude |
| 2026-07-11 | Added "Texas overtime law (none; FLSA governs)" for hospital-staffing-software-features-cah: ch. 62 is minimum-wage only, §62.151 exempts FLSA-covered persons, §7(j) 8-and-80 optional, §207(o) public-agency comp-time nuance. Verified via TWC + Justia §62.151 mirror + FS#54 compliance mirror. | Claude |
| 2026-07-13 | Added "CAH staffing statistics pack" (21 stats) for the planned statistics hub: Flex Monitoring CAH count (1,383) + CEO recruiting survey, Sheps closures (197/154), 2026 NSI edition figures (17.6%/8.6%/$60,090/158,600 — CY2025 data, distinct from 2025 edition), RHIhub density re-confirmed, HRSA 2038 projections, BLS-via-O*NET wages (median caveat), full Texas DSHS 2024 HNSS cut (86 CAHs, 11.6% vacancy, 18.2% turnover, 61% RN mix, statewide 16.4%/23.2%). NOT VERIFIED list preserved in collection notes: bls.gov direct, HRSA HPSA counts, Sheps TX aggregate. | Claude |
| 2026-08-10 | BENCH-CLAIM SWEEP COMPLETED (round 2). Claude Code's suggested-task scan caught "holds your per-diem bench as a defined group" in float-pool-nursing-small-hospitals, which round 1 missed. Root cause: round 1 matched the literal phrase "maintains the per-diem bench" instead of the PATTERN, so two survivors remained in a file already edited that day (the CTA and closing paragraph of after-hours-callout-coverage). Correct sweep pattern for future use: SSAI subject (SimpleScheduleAI / the service / our team / the system / we) within the same sentence as an ownership verb (maintain, hold, keep, own, curate, manage, build) plus bench or pool. 9 spots across 3 posts corrected; sweep now returns zero. LESSON: when banning a CLAIM, sweep the pattern, never the phrasing. | Claude |
| 2026-08-10 | PRODUCT CAPABILITY INVENTORY built from the cah-scheduler source (@ 4ca898c, v1.7.26): 24 pages, 50 API routes, 22 rule evaluators, ~75 capability lines each citing a file path, written to `product-capability-inventory-2026-08.md`. Purpose: stop guessing what the product does after the site both over-claimed (per-diem bench) and under-claimed (PRN availability page) in the same week. Confirmed the two standing bans (8-and-80, credential expiry) at code level and added four new ones (labor cost in dollars, nurse self-scheduling, email/SMS alerting, native app). Founder ruled that code existence is not claim permission: the nurse portal, practice mode, and auth are PRODUCT ONLY and must never appear in service copy. | Founder + Claude |
| 2026-08-10 | EMPLOYMENT TYPE / PRN availability truth added, then upgraded the same day on a founder product screenshot. Sequence: 3 live posts claimed we "maintain the per-diem bench / availability list" (unsupported) -> corrected to roster-and-ranking -> founder showed the shipped PRN Availability page (submitted days per nurse, Missing Submissions block, Record availability action) -> claims raised to the accurate ceiling: we track per diem availability INCLUDING who has not submitted, and rank against it, but we do not recruit/credential/curate the bench. Travel nurses excluded from the availability page. Mode split recorded (nurse-side submission is product mode). Also fixed a stray "managed service" self-label. Reader-advice uses of "a maintained per diem pool" left intact and correct. | Founder + Claude |
| 2026-08-10 | Added "Nurse manager scheduling hours (first-party, 30+ interviews)" after a founder-caught contradiction: the /nurse-scheduling-software chart showed Build at 4-6 hrs/week (half the week) while the canonical breakdown post shows Build 1-1.5 hrs/week and callout cover 4-6 hrs/week. Root cause was a per-cycle figure rendered inside a weekly chart, not disagreeing data. Chart corrected to the five-activity split with the denominator stated; unit trap documented. Web search found no authoritative published build-versus-cover split. | Claude |
| 2026-08-05 | Added "Texas HSC Chapter 258 (mandatory overtime for nurses PROHIBITED)" + cross-ref from the overtime-pay entry. Caught while rehabbing how-to-handle-nurse-callouts: the old draft FAQ asserted "Texas does not prohibit mandatory overtime for nurses," the opposite of the statute. Verified via texas.public.law + Justia §§258.002-258.005. | Claude |
| 2026-08-04 | Added "Montefiore utilization review AI layoffs (July 2026)" for the will-ai-replace-nurses-montefiore-layoffs article: 12 UR positions / May 28 notices / July 12 elimination / Datavant (per Nurse.org), verbatim Shuler-Hagans-Solmonese quotes (Norwood News), NYSNA July 1 action, contract-violation claim (WNY Labor Today). Strike duration NOT verified (never "41-day"); dispute never adjudicated. Live fetches of Norwood/NYSNA/WNY; Nurse.org bot-blocked, corroborated via search. | Claude |
| 2026-08-13 | NIGHT-CLAIM CORRECTION, verified against the CODE not the doc. Founder asked whether "counting nights" is really part of our fairness practice. Checked cah-scheduler @ bd7bc05: scoring.ts contains "night" ZERO times, and no nightCount / nightsWorked / night-history field exists anywhere in src/. Analytics aggregates weekendDistribution and holidayBalance only. What DOES exist is greedy.ts/repair.ts ranking night shifts 4th in FILL DIFFICULTY, so nights are FILLED FIRST, never counted. Weekends (quota + history carryover) and holidays (versus team average) ARE counted. 27 claims corrected across 19 files; capability inventory 4.3 now documents the fill-order tiers it was missing. TWO DISTINCT SWEEP LESSONS, both now proven the hard way: the 2026-08-10 bench sweep swept the wrong PATTERN (the phrasing, not the claim); this one swept the right pattern across the wrong SURFACE SET. I swept the prose sections and treated the Our Take and CTA divs as markup rather than as prose, so both corrected claims survived inside them. A sweep needs BOTH halves: every phrasing of the claim, and every surface, including the frontmatter excerpt, HTML blocks, table cells, Sources labels and CTA copy. | Founder + Claude |
| 2026-08-17 | Added **Texas HSC 257.001** (who Chapter 257 covers) and **257.003** (nurse staffing policy and plan) for the acuity-based-staffing post. Two findings worth the entries: (1) Chapter 257 has **no rural, small-hospital or Critical Access carve-out** — a Texas CAH is caught because it is licensed as a general hospital under Chapter 241, so the written staffing policy, plan and committee obligations apply exactly as they do to a large system hospital; (2) the statute requires "an adequate number and skill mix of nurses ... to meet the level of patient care needed" and contingency planning for when "patient care needs unexpectedly exceed direct patient care staff resources", but **never uses the words acuity, census or intensity of care**. Guardrail recorded in the entry: acuity-based staffing may be described as one recognised way to satisfy 257.003, never as something Texas law mandates. Verified via FindLaw 257.001/257.003 (statutes.capitol.texas.gov stays unlinked per the existing geo-block rule). | Claude |
