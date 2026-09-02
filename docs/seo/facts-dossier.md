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
- Verified: 2026-07-03 (via Cornell LII cross-check). Re-verified live at Cornell LII 2026-08-31, unchanged.

### 42 CFR 485.635(d)

- Approved wording: a registered nurse must "provide (or assign to other personnel) the nursing care of each patient" and "supervise and evaluate the nursing care for each patient"
- Nuance: the supervise-and-evaluate clause is (d)(2), and its full text reads "A registered nurse or, where permitted by State law, a physician assistant, must supervise and evaluate the nursing care for each patient." Where the PA alternative matters (e.g., a compliance explainer), do not imply RN-only.
- Wrong: attributing this clause to 485.631; implying only an RN may supervise and evaluate (the reg allows a PA where State law permits)
- Section covers: Provision of services. Paragraph (d) heading: Standard: Nursing services.
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635
- Verified: 2026-07-04 (via Cornell LII cross-check; eCFR bot-blocks automated fetches). Re-verified live at Cornell LII 2026-08-31, unchanged, including the physician-assistant alternative at (d)(2).

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

### Mandatory nurse overtime, the OTHER states (six verified 2026-09-02)

Companion to the Texas ch. 258 entry above. Collected while writing
`mandatory-nurse-overtime-by-state`. Each was read against its governing text;
do NOT extend this list without doing the same.

- **New York.** CAUTION, corrected 2026-09-02 by an adversarial fact-check: §167 has NO anti-retaliation clause. All seven subdivisions were read via the nysenate.gov openleg text. Its only enforcement mechanism is a civil penalty against the employer for the overtime violation itself, not a protected right for the nurse. Secondary sources (law-firm and union summaries) DO assert a retaliation bar for New York and they are wrong; a draft of the state-map post carried that error into four separate places off one search summary. Never write that New York protects a refusing nurse from retaliation. Labor Law §167 restricts requiring RNs and LPNs to work beyond regularly scheduled hours. Four exceptions (health care disaster; declared emergency; unforeseen emergency that could not be prudently planned for; ongoing procedure). "Regularly scheduled hours" INCLUDES prescheduled on-call time and shift-report time, and an employer may not substitute on-call time for mandatory overtime. Penalties (amended effective 2023-06-28): $1,000 / $2,000 / $3,000 for first / second / third violation within 12 months. URL: https://dol.ny.gov/mandatory-overtime-nurses (primary, NY DOL).
- **Pennsylvania.** Cite the STATUTE for the details, not the agency page: the 10-hours-off rule and the retaliation bar are at 43 P.S. §932.3(d) and (b) respectively (https://codes.findlaw.com/pa/title-43-ps-labor/pa-st-sect-43-932-3/). The pa.gov Act 102 summary page is three paragraphs and contains neither. Act 102 of 2008 (Prohibition of Excessive Overtime in Health Care Act), effective 2009-07-01. A facility may not require work beyond an agreed to, predetermined and regularly scheduled shift. Exceptions: unforeseeable emergent circumstance; completing a procedure in progress. 10 consecutive hours off owed after more than 12 consecutive hours worked (waivable by the employee). Anti-retaliation. URL: https://www.pa.gov/agencies/dli/resources/compliance-laws-and-regulations/labor-management-relations/labor-law/act-102
- **Washington.** Pin-cite corrected 2026-09-02: the anti-retaliation language (discrimination, dismissal, discharge, threat of discipline or other penalty for refusing) is in **RCW 49.28.140(2)**, the SAME section as the prohibition. RCW 49.28.150 is NOT a retaliation provision; its entire text directs the Department of Labor and Industries to investigate complaints. RCW 49.28.140: "No employee of a health care facility may be required to work overtime." Covers the whole facility, not nurses alone. Exceptions include unforeseeable emergent circumstances and completing a procedure in progress. 8 consecutive hours off offered after more than 12 consecutive hours. URL: https://app.leg.wa.gov/RCW/default.aspx?cite=49.28.140
- **California.** NOT a statute: IWC Wage Order 5, 8 CCR 11050. No employee on a 12-hour shift may be required to work more than 12 hours in 24 unless the Chief Nursing Officer or authorized executive declares a health care emergency, and the employer must show (a) the emergency exists, (b) all reasonable steps were taken to provide required staffing, (c) continued overtime is still necessary. Nobody may be required past 16 hours in 24 absent voluntary mutual agreement. URL: https://www.law.cornell.edu/regulations/california/8-CCR-11050
- **Massachusetts.** M.G.L. c. 111 §226. Defines mandatory overtime as hours beyond the predetermined and regularly scheduled hours, which themselves may not exceed 12 in any 24. Permitted only in an emergency where patient safety requires it and there is no reasonable alternative, and only after a good faith effort at voluntary coverage. Carries the quotable line: "Mandatory overtime shall not be used as a practice for providing appropriate staffing for the level of patient care required." Instances must be reported to the Department of Public Health. URL: https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXVI/Chapter111/Section226
- **Oregon.** HB 2697 (2023 Or. Laws ch. 507), effective 2023-09-01. May not require nursing staff (RN, LPN AND CNA) beyond the prearranged shift, past 48 hours in a hospital-defined work week, or past 12 hours in 24. Current codification is ORS 441.770 (confirmed 2026-09-02 against the Oregon Health Authority HB 2697 FAQ). CAUTION: the pre-2023 citation ORS 441.166 is what most secondary sources still give, and ORS 441.192 (which some sources cite) is a DIFFERENT statute about outside employment. Cite the session law, not a section number, until the renumbering is confirmed. URL: https://www.oregonlegislature.gov/bills_laws/lawsstatutes/2023orlaw0507.pdf
- **The state COUNT is disputed and every published list is uncited.** AFT says 16 states (no date, no citations). Law-firm and advocacy lists say 18 (Alaska, California, Connecticut, Illinois, Maine, Maryland, Massachusetts, Minnesota, Missouri, New Hampshire, New Jersey, New York, Oregon, Pennsylvania, Rhode Island, Texas, Washington, West Virginia); one carries a "reviewed Mar 03, 2016" stamp. Approved wording: name both counts, adopt neither, and say how many we verified ourselves. Wrong: asserting "18 states prohibit mandatory nurse overtime" as fact.
- **Texas enforcement (added 2026-09-02, WEAKER verification than the rest of this entry).** Ch. 258 has its own enforcement/complaint-resolution section at §258.006, the state health agency has jurisdiction, and the anti-retaliation protection covers a nurse who REPORTS a violation, not only one who refuses. Confirmed by search summaries only: law.justia.com and texas.public.law both 403 automated fetches, so the section text was not read directly. Approved wording keeps it general ("the chapter carries its own enforcement and complaint-resolution section"); do NOT state a specific agency, penalty amount or complaint procedure until someone reads §258.006 in a browser. The chapter also does not appear to impose a Massachusetts-style hospital reporting duty; write that as an absence in the sections read, never as a confirmed exemption.
- **Pending, as of 2026-09:** federal Nurse Overtime and Patient Safety Act (S.5319 / H.R.10056), ANA-endorsed 2026-08-12, in committee. Michigan SB 296 of 2025 passed the Senate April 2026, referred to the House, not enacted. Texas HB 2187 (89R) surfaced in search as directing HHSC to build a formal complaint process; NOT verified as passed, so do not cite it. Re-check all three before reusing.
- Verified: 2026-09-02 (each state read against the linked primary or official page; AFT and the 18-state lists read and found citation-free)

### CAH staffing statistics pack (collected 2026-07-13 for the statistics hub)

All verified from loaded primary pages/PDFs on 2026-07-13; collected for the planned "Rural Hospital & CAH Nurse Staffing Statistics" hub. Any post may use them with the wording below.

**CAH landscape**

- 1,388 certified CAHs in the US (July 2026) — Flex Monitoring Team, Historical CAH Data. URL: https://www.flexmonitoring.org/historical-cah-data-0 (series: 1,381 Jan 2026, 1,383 Apr 2026, 1,388 Jul 2026 — the page publishes a new count roughly quarterly, so re-verify before any outreach push). Verified 2026-08-11 (live page read; site swept 1,383 -> 1,388 same day). NSI 2026 figures re-verified UNCHANGED the same day: 17.6% turnover, 8.6% vacancy, $60,090 per RN, 43 unfilled FTEs, 33.1% of hospitals above 10% vacancy, 527 hospitals across 40 states.
- 197 rural hospital closures/conversions since January 2005 (109 complete + 88 converted); 154 since 2010 — UNC Sheps Center rural closures tracker, page updated 12/4/25. URL: https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/ — Wrong: 195 (stale snippet); NO per-state Texas total is stated (never hand-count the table).
- 94% of CAH CEOs reported nursing staff difficult to recruit; 86% reported retention challenges — Flex Monitoring policy brief (Feb 2023; survey of CAH CEOs Mar-May 2022, n=155 of 404, 38% response). URL: https://www.flexmonitoring.org/sites/flexmonitoring.umn.edu/files/media/CAH_workforce_during_COVID_Barriers_and_facilitators_for_recruiting_and_retaining_staff_2025.pdf — always carry the 2022-survey date.

**National staffing & turnover (2026 NSI report, CY2025 data — do NOT mix with the 2025-edition figures elsewhere in this dossier)**

- Hospital RN turnover 17.6% average / 18.6% median (range 5.6%-40.0% by bed size); overall hospital turnover 18.5%; RN vacancy 8.6% (33.1% of hospitals at 10%+); 78 days to fill an RN vacancy; NSI-estimated national RN shortage 158,600 (avg 43 unfilled RN FTEs/hospital); cost per bedside RN departure $60,090 (average hospital loses $4.2M-$6.2M/yr; each 1% turnover change = ~$295,000/yr) — 2026 NSI National Health Care Retention & RN Staffing Report (527 hospitals, 40 states; 262,405 RNs covered). URL: https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf
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

### Charge nurse: what the role is (ANA + RegisteredNursing.org)

- Approved wording (ANA, verbatim): "Charge nurses oversee the operations of their specific nursing unit during a set period while working alongside the team." ANA lists charge duties including "Ensuring staff adheres to workplace protocols and procedures", "Overseeing the smooth transition from one shift to another", and "Creating and evaluating staffing plans and schedules". ANA's nurse-manager contrast: "Nurse managers are licensed nurses in upper management positions. Because their roles are mainly administrative, they often work in an office environment versus a clinical setting."
- Approved wording (RegisteredNursing.org, verbatim): **"The position is an assignment, not a separate license or title."** Also: "No nationally recognized charge-nurse-specific certification exists"; "most charge nurses still take a patient assignment on top of their leadership duties"; "The role is layered on, not swapped in."
- **Why these two sources and not one.** ANA is the professional body and gives the cleanest definition and the manager contrast, but its page does NOT say whether charge is a shift assignment or a standing title. Do not attribute the assignment-versus-title point to ANA. That point comes from RegisteredNursing.org, which states it explicitly.
- Attribution rule for the "most charge nurses" line: it is RegisteredNursing.org's volume claim, not ours. Quote it with attribution, never restate it in our own voice as "most charge nurses do X".
- Wrong: claiming a charge nurse certification or license exists; claiming ANA defines charge as a rotating assignment; asserting in our own voice how many charge nurses carry a patient load.
- URL: https://www.nursingworld.org/content-hub/resources/nursing-resources/charge-nurse-vs-nurse-manager/ (ANA); https://www.registerednursing.org/specialty/charge-nurse/ (RegisteredNursing.org)
- Verified: 2026-08-18 (nurse.com bot-blocks automated fetches; both sources above loaded normally)

### Charge nurse: preparation gap (American Nurse Journal)

- Approved wording (verbatim): charge nurses are "frontline leaders" who "act as go-to resource problem solvers, overseers of patient safety and care quality, policy enforcers, and operational experts responsible for processes including staffing and coordinating nurse-patient assignments." On preparation: "Traditionally, nurses learn the charge nurse role over time as they progress from novice to expert," and **"Many organizations lack role-specific competency-based orientation, leaving nurses to learn on the job."**
- Source: Bilyeu et al., American Nurse Journal (2023). This is the ANA's own journal, so it is the strongest authority we have on the role and it corroborates the assignment framing without stating it directly.
- **Why this entry exists.** An adversarial fact-check on 2026-08-18 found that the whole "charge is an assignment, not a title" thesis rested on RegisteredNursing.org alone, a commercial nursing-education site, because the ANA charge-vs-manager page does not address the question. This entry adds an authoritative second source for the surrounding claim that the role is learned on the job rather than credentialed.
- **Practice varies, and it IS sourced.** RegisteredNursing.org carries this verbatim, in two places on the same page already cited above: "In many hospitals, the charge nurse role is a rotating assignment given to experienced staff nurses on a per-shift basis, not a formal title change. In other settings, it is a permanent, posted position with its own job description and pay grade." Also: "Some hospitals rotate the responsibility among experienced staff nurses on a shift-by-shift basis... Others appoint a permanent charge nurse for each shift or post the role as a formal position requiring an application and interview process." Do NOT state flatly that charge is always an assignment; quote this instead. (Recorded 2026-08-18 after a first pass hedged the point as an unsourced generalisation while the quote sat unused in a source the post already cited. The allnurses page carrying similar wording bot-blocks at 403 and is not needed.)
- Wrong: citing this source for the assignment-versus-title point, which it does not make; treating "learn on the job" as a claim that charge nurses are untrained.
- URL: https://www.myamericannurse.com/magnet-and-the-charge-nurse-role/
- Verified: 2026-08-18

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
- **NEVER CREDIT THIS FIGURE TO NSI OR AONL. Both attributions were live and both were false (found and fixed 2026-08-20).** NSI's National Health Care Retention & RN Staffing Report measures turnover, vacancy, recruitment difficulty and cost per departure across 527 acute-care hospitals. It contains nothing about how a nurse manager spends their week. AONL was cited for it via two URLs that both 404 (`aonl.org/resources/nursing-workforce-now` and `/resources/nurse-manager-workforce-survey`), and AONL's Nurse Manager Competencies detail has still never been parsed. The figure is OURS, from 30+ interviews.
- **Do not leave it uncredited either.** A bare "8 to 12 hours per week" reads as an industry benchmark, which is the uncited-stat defect. Attribute to our own interviews and link `/blog/nurse-manager-scheduling-time-breakdown` for the activity split. As of 2026-08-20 roughly 27 files still state the range with no attribution at all; that sweep is open.
- **Dollar conversions are allowed only in the reader's own arithmetic.** The $50/hr loaded-rate framing giving about $26,000/yr must show the rate, be labelled illustrative, and invite the reader to substitute their own number (see the hours-never-dollars rule). "At an average RN compensation level" without a stated rate is NOT acceptable; it reads as a published benchmark.
- Verified: 2026-08-10 (breakdown post cross-checked against the money-page chart; web search found no authoritative published split)

### Nurse manager vs charge nurse: authority, supervisory status, pay, credentials

Verified 2026-08-19 for the `nurse-manager-vs-charge-nurse` post. Every figure below is page-verified at the named primary source, not from an aggregator.

**BLS pay and occupation codes (bls.gov blocks WebFetch and curl; page-verified via Playwright):**

- Registered nurses: "The median annual wage for registered nurses was $93,600 in May 2024." Quick Facts labels it "2024 Median Pay", $45.00/hour. SOC **29-1141**.
- Medical and health services managers: "The median annual wage for medical and health services managers was $117,960 in May 2024." Quick Facts "2024 Median Pay", $56.71/hour. SOC **11-9111**.
- **THE STRONG CLAIM, and it is ours to make:** the 2018 SOC detailed-occupation list contains NO entry for "Nurse Manager" and NO entry for "Charge Nurse". Verified against the full list at bls.gov/soc/2018/major_groups.htm. Charge nurses are counted inside Registered Nurses (29-1141); nurse managers inside Medical and Health Services Managers (11-9111). The BLS medical-and-health-services-managers page does not name "nurse manager" anywhere.
- Use for: the honest reframe that every competing article quotes an aggregator salary for a job title the federal wage survey does not track. NOT usable for: a "charge nurse salary" or "nurse manager salary" figure. Those do not exist at BLS; never manufacture one by averaging aggregators.
- Always state the survey month ("May 2024"), because the OOH Quick Facts label says only "2024".

**Supervisory status under the NLRA — three different senses of "supervisor", never conflate them:**

- *Oakwood Healthcare, Inc.*, 348 NLRB 686 (2006): found "12 permanent charge nurses employed in 5 of 10 patient care units" were statutory supervisors, and "none of the rotating charge nurses was a supervisor." Part-time supervision test: whether the individual spends "a regular and substantial portion" of work time on supervisory functions, with status found at "at least 10-15 percent" of total work time. Source: Congressional Research Service RL34350 (NLRB.gov's case lookup refused connection; cite CRS and name the case).
- *NLRB v. Kentucky River Community Care*, 532 U.S. 706 (2001), page-verified at Cornell LII 2026-08-19: "Respondent carries the burden of proving the nurses' supervisory status." The Court rejected the Board's position that employees do not exercise "independent judgment" when applying "ordinary professional or technical judgment in directing less-skilled employees," calling it a "categorical exclusion into statutory text that does not suggest its existence."
- **Guardrail:** never write "charge nurses are supervisors" or "are not supervisors". The holding is fact-specific and turns on permanent vs rotating assignment. Frame as worth asking HR counsel; never give legal advice.

**Texas hospital licensing — CITATION MOVED, do not use the old number:**

- 25 TAC § 133.41 was **transferred to 26 TAC § 505.41 effective 2025-01-31** (the transfer notice was published in the January 10, 2025 Texas Register, TRD-202406365; the 2025-01-10 date some sources give is the publication date, not the effective date). Any source citing "25 TAC 133" for Texas hospital licensing is stale. We have never cited the old number anywhere in the corpus (swept 2026-08-19); keep it that way.
- 26 TAC § 505.41(o)(1)(A): "Nursing services shall be under the administrative authority of a chief nursing officer (CNO) who shall be an RN."
- 26 TAC § 505.41(o)(2)(D): "The RN shall supervise and evaluate the nursing care for each patient and assign the nursing care to other nursing personnel"; "An RN shall be on duty in each building of a licensed hospital that contains at least one nursing unit where patients are present."
- **Why this matters and how to frame it:** the federal CAH Conditions of Participation require no nurse manager and no director of nursing (485.631(a)(1) names the required professional staff without any nursing leadership role; 485.635(d) says only that nursing services must meet patients' needs). Texas imposes the CNO requirement through STATE licensing instead. So at a Texas CAH the nursing leadership layer exists because the state requires it, not because CMS does. Verified via Cornell LII 2026-08-19.

**Nurse leadership credentials (page-verified 2026-08-19):**

- AONL issues **CNML** (Certified Nurse Manager and Leader), "designed exclusively for nurse managers", and **CENP** (Certified in Executive Nursing Practice), for nurse executives. Source: aonl.org/initiatives/certification.
- ANCC issues **NE-BC** (Nurse Executive Board Certified). Source: nursingworld.org/our-certifications/nurse-executive/.
- Contrast with the charge nurse side, already in the dossier: RegisteredNursing.org, "No nationally recognized charge-nurse-specific certification exists."
- **AONL GUARDRAIL:** the AONL Nurse Manager Competencies detail lives in a PDF that has not been parsed. Do NOT attribute any staffing/scheduling competency, any hours benchmark, or the 8-12 hour figure to AONL. The `what-is-a-nurse-manager` draft once made exactly that false attribution; corrected 2026-08-22 during its publish pass (the figure is OURS, from 30+ interviews, and the draft now credits them).

### CNA and aide staffing ratios: hospitals vs nursing homes

Verified 2026-08-20 for the `cna-patient-ratio-laws-by-state` post. **The core trap: almost every published CNA ratio is nursing home law.** Never place one in a sentence a hospital reader could take as their own; always put "nursing facility" or "skilled nursing facility" in the SAME sentence as any long-term-care number.

- **Hospitals: Oregon is the only state with a CNA cap in statute**, as far as we can establish (as of August 2026). ORS 441.768, verbatim: "A hospital may not assign a certified nursing assistant to more than seven patients at a time during a day or evening shift or to more than 11 patients at a time during a night shift." Enacted 2023 c.507 §8. Page-verified 2026-08-20; no 2026 amendment shown. Always date-qualify and hedge ("the only state we can find"), because this is proving a negative.
- **Oregon exceptions guardrail:** ORS 441.766 lists exceptions to the RN ratios in 441.765 only and never references the CNA section. Oregon also runs a rural variance path on the nurse ratios. **Do NOT write that no exception exists for the aide cap** — that is an argument from statutory silence. OAR 333 was not checked. Correct framing: the exceptions statute addresses only the nurse ratios; ask the Oregon Health Authority.
- **Federal LTC minimum staffing standards REPEALED.** Interim final rule published 2025-12-03, effective 2026-02-02. Removed the 24/7 onsite RN requirement and the hours-per-resident-day figures: 0.55 RN, **2.45 nurse aide**, 3.48 total. Mechanism is statutory: section 71111 of P.L. 119-21 "precludes CMS from implementing, administering, or enforcing the minimum staffing standards" until after 2034-09-30. Surviving: RN 8 consecutive hrs/day 7 days, full-time RN director of nursing, "sufficient nursing staff." Source: [Federal Register via govinfo](https://www.govinfo.gov/content/pkg/FR-2025-12-03/html/2025-21792.htm). **The 2.45 was the only federal aide number that has ever existed.** Any guide still quoting it as current predates Feb 2026. Note: a lawsuit ran in parallel, so this is often miscalled a court vacatur; the statute is the operative event.
- **CAH swing beds are NOT nursing home beds for staffing.** 42 CFR 485.645(d) lists the Part 483 requirements that carry over to swing beds, and **§483.35 (nursing services) is not on that list.** Verified on govinfo and Cornell LII. **Write it as "the standard is not on that list," NEVER as a blanket "swing beds are exempt"** — the CAH's own §485.631 obligations still apply to those patients. Structurally identical to the PBJ split already in this dossier.
- **Distinct-part SNF unit is the other half**, and it is an INFERENCE from the separate-certification structure, not a quoted CMS line. Safe wording: "certified as a skilled nursing facility and surveyed against Part 483 in its own right." Do not state it as a quoted rule.
- **Texas sets no CNA ratio in either setting.** Hospitals: 26 TAC §505.41(o) requires "adequate numbers of RNs, licensed vocational nurses (LVNs), and other personnel" with no numeric ratio and no mention of aides at all (verified 2026-08-20). Nursing facilities: 26 TAC §554.1002, "Additional Nursing Services Staffing Requirements," sets "one licensed nursing staff person for each 20 residents or a minimum of .4 licensed-care hours per resident day" and **no aide ratio** (verified 2026-08-20 at Cornell LII).
- **BROKEN SOURCE, do not link:** `hhs.texas.gov` pages for the Nurse Aide Registry return 403 to tooling AND "Access Denied" in a real browser (founder-confirmed 2026-08-21). The pages exist but are access-controlled. Cite the agency in prose without a hyperlink.
- **Do NOT reuse these secondary claims**, both found circulating and neither supportable: "only 10 states have legal requirements for CNA patient ratios"; "California, Illinois, Oregon and Nevada have numeric CNA ratios" (the page carrying it does not mention CNAs at all). California's hospital rule, 22 CCR 70217, sets licensed-nurse ratios and no aide ratio.

### Manager time under the service: 1 to 2 hours of review (founder-stated design figure)

- APPROVED CLAIM: under SimpleScheduleAI the nurse manager's weekly scheduling workload is 1 to 2 hours, and that work is REVIEW, not building. Pair it with the 8-12 hour baseline above as the before/after.
- SOURCE AND FRAMING: founder-stated, confirmed 2026-08-19. This is what the service is designed to require of the manager, and the founder's position is that 1 to 2 hours is deliberately generous. It is NOT a measured customer outcome and never can be presented as one, because we are pre-launch with zero customers. Frame as what the service asks of the manager, never as "hospitals we work with report" or any observed/pilot result.
- Always name the unit and the activity: "1 to 2 hours of review," not a bare "1 to 2." A bare number invites the reader to assume it is build time, which is the opposite of the point.
- Wrong: attributing it to a study, a customer, a pilot, or a benchmark; using it as a guaranteed outcome ("your manager will spend 1 to 2 hours"); stating it in dollars (cost claims stay in hours — see the hours-never-dollars rule).
- Live usages as of 2026-08-19: `/nurse-scheduling-software` comparison chart, `/how-it-works` hero subtitle, `/blog/nursing-scheduling-software-ai` (intro + table), `/blog/nurse-manager-scheduling-time-breakdown` FAQ.
- HISTORY: this figure had no dossier entry until 2026-08-19, so a fact-check pass flagged it as unsourced and it was briefly removed from `/how-it-works` before the founder confirmed it. The entry exists so that does not recur.
- Verified: 2026-08-19 (founder confirmation)

### Montefiore utilization review AI layoffs (July 2026)

- Approved facts: Montefiore eliminated 12 utilization review nurse positions across its Bronx campuses; termination notices dated May 28; positions ended July 12, 2026; the chart-review work shifted to AI-powered software from Datavant, a private-equity-backed health data company (attribute the 12/May 28/July 12/Datavant set to Nurse.org's report). NYSNA held a public action July 1, 2026 under the banner "The Bronx needs real nurses, not AI" (NYSNA press release, July 1, 2026). Utilization review role definition (Norwood News): nurses who "read patient charts and make the case for a patient's insurance company to cover the care a doctor orders."
- Verbatim quotes (never trim or paraphrase inside quote marks): Marilyn Shuler, RN, 39-year Montefiore employee facing layoff: "What we want from Montefiore is simple: stop the layoffs, keep a licensed nurse on the final review, use AI to support us instead of replacing us" (Norwood News, July 2, 2026, Síle Moloney). Nancy Hagans, NYSNA President: "Artificial intelligence should never replace real human caring from a nurse" (Norwood News). Joe Solmonese, Montefiore senior vice president: "The claims by NYSNA are inaccurate and misleading. What is true is that we are always investing in new technology to ensure the best care and outcomes for our patients" (Norwood News).
- Contract-violation claim: union representatives say the move violates the contract members won through a recent strike (WNY Labor Today, July 5, 2026). The strike's duration is NOT verified — never write "41-day strike".
- Wrong: "AI replaced bedside nurses at Montefiore" (all 12 positions were utilization review, an administrative role); adjudicating the dispute either way (union claims vs hospital denial — both are claims); quoting Montefiore's "nonclinical program that helps facilitate the paperwork process" line (secondhand, not independently verified — use only the Solmonese quote above).
- URLs: https://nurse.org/news/montefiore-nurses-laid-off-ai/ (403-blocks non-browser fetches); https://www.norwoodnews.org/nysna-allege-montefiore-plans-to-replace-some-nurses-with-ai-systems/; https://www.nysna.org/press/today-bronx-nurses-sound-alarm-montefiore-replacing-real-nurses-ai; https://www.wnylabortoday.com/news/2026/07/05/new-york-state-labor-news/the-bronx-needs-real-nurses-not-ai-nysna-represented-nurses-at-montefiore-hospital-sound-the-alarm-on-the-medical-facility-s-plans-to-replace-nurses-with-artificial-intelligence-powered-software/
- Verified: 2026-08-04 (live fetches of Norwood News, NYSNA release, WNY Labor Today; Nurse.org corroborated via search, page bot-blocked)

### QSO-26-15-CAH: CAH rural and distance eligibility review (August 21, 2026)

Added 2026-08-26. **The founder supplied the PDF directly; all facts below are read from the
primary document**, not from search summaries. cms.gov 403s automated fetchers and the PDF text
does not extract in a browser, so re-verification means opening the file. URL:
https://www.cms.gov/files/document/qso-26-15-cah-original-release-2026-08-21.pdf

- **Identity:** Ref QSO-26-15-CAH, dated August 21, 2026, to State Survey Agency Directors, from
  the Directors of the Quality, Safety & Oversight Group and the Survey & Operations Group
  (signed Karen L. Tritz and Melissa C. Daly). Subject: "Critical Access Hospital (CAH) Evaluation
  of Compliance with the Rural and Distance Requirements". **Effective 30 days after issuance**
  (so on or about September 20, 2026). **Supersedes S&C-16-08-CAH**, now expired.
- **DECENNIAL REVIEWS START IN CY 2033, NOT NOW.** Verbatim: "decennial reviews beginning in CY
  2033" and "Beginning in CY 2033, all existing CAHs will be evaluated for compliance with rural
  status and distance eligibility requirements. This status review will then be performed every
  ten years hence." Search summaries omitted the 2033 date and made this read as immediate. **Never
  write that a ten-year review cycle starts now.**
- **THE ONE-YEAR / TWO-YEAR DISCREPANCY (our original finding, worth citing carefully).** The memo
  body and the SOM attachment give different windows for the same situation:
  - Memo body, "Decennial Evaluations" section (p4): "The CAH will generally be allowed **two
    years** to attempt to reclassify as rural, convert to acute care hospital or rural emergency
    hospital status, or have its Medicare participation terminated."
  - Memo body, "Adverse Determinations" (p4): "allowed generally **two years**".
  - SOM attachment, new-ACH trigger (p20): "The CAH will be allowed generally **one-year**".
  - SOM attachment, decennial section (p21): "will generally be allowed **one year**".
  - SOM attachment, Example B1 (p22): "generally afforded **one year**".
  **Frame as an observed discrepancy and tell readers to confirm with CMS. Never assert which
  window controls.** Contact given in the memo: CAHReviewTeam@cms.hhs.gov.
- **Triggers for an eligibility review:** proximal ACH (a new acute care hospital seeking initial
  Medicare certification near an existing CAH, or one identified later through updated data); new
  CAH certification or conversion; decennial review from CY 2033. CMS "may perform a distance or
  rural eligibility review of a CAH at any time."
- **What does NOT count toward the distance test:** "Psychiatric hospitals, LTCHs, or
  Rehabilitation hospitals are not considered acute care hospitals and therefore will not factor
  into a CAH's distance eligibility calculation."
- **IHS/Tribal exclusion, and the nuance that gets lost.** Verbatim: "the proximity of IHS/Tribal
  hospitals or CAHs and non-IHS/Tribal hospitals or CAHs to each other is not considered." The
  exclusion runs ONLY ACROSS that line. The memo's own examples make it explicit: a non-tribal
  applicant 10 miles from an IHS hospital is fine (Example 1), and a tribal CAH 17 miles from a
  non-tribal CAH is fine (Example 2), but a TRIBAL hospital 33 miles from an IHS hospital DOES fail
  (Example 3), because both sit on the same side of the line. Never write this as a blanket "IHS
  facilities are not counted" — two IHS/Tribal facilities count against each other normally.
- **Islands:** a CAH is compliant on distance if the island is entirely surrounded by water, the
  CAH is the only hospital or CAH on it, and the island is not accessible by any roads. The rural
  requirement still applies.
- **Necessary provider (NP):** state designation before January 1, 2006 exempts a CAH from the
  DISTANCE requirement only, never from the RURAL requirement. If CMS cannot confirm NP status, the
  CAH has **60 days** from the date of the CMS letter to submit supplementary evidence, and "the
  burden is on the CAH". Qualifying evidence examples: a pre-2006 state letter naming the CAH; a
  2005-or-earlier edition of the state Rural Health Plan naming it; the plan's criteria plus
  evidence it met them plus a signed state statement; or a pre-2006 state law or regulation plus
  the same.
- **Rural status mechanics:** determined from OMB CBSA delineations as adopted in the IPPS final
  rule (proposed April, final August, effective October 1). Separate and PRE-EXISTING rule: a CAH
  that falls inside a CBSA after a redelineation "may continue to retain its CAH status up to two
  years after the effective date". Do not confuse this two-year grace period with the adverse
  determination window above.
- **Operational change worth naming:** "State Survey Agency and CMS-Approved Accrediting
  Organization recertification surveys may be performed based on the CAH's existing recertification
  schedule and no longer require confirmation from CMS of rural and distance eligibility to
  proceed."
- **Provider-based location (PBL) trap:** CMS "recommends a CAH seek an advance determination of
  compliance with CAH location requirements prior to adding a PBL." An off-campus provider-based
  facility created or acquired on or after January 1, 2008 must ITSELF be more than 35 miles (15 in
  mountainous terrain or secondary-roads areas) from another hospital or CAH. If it breaks
  eligibility the CAH goes on a 90-day termination track with three options: terminate, undo or
  move the PBL, or convert to a hospital.
- **THE STAFFING HOOK, and it is in the regulation itself (485.610(d)).** A necessary-provider CAH
  that relocates keeps its grandfathered status only if the new location "Serves at least 75 percent
  of the same service area", "Provides at least 75 percent of the same services", and "Is staffed by
  75 percent of the same staff (including medical staff, contracted staff, and employees)". The
  guidance explicitly contemplates hospitals that cannot meet the staff test: those "that have
  difficulty meeting the 75 percent same staff criterion due to historically high staff turnover
  and/or vacancy rates" may document the effect, but must show active recruitment and that the
  cause is "circumstances beyond the CAH's control rather than the relocation". The three staff
  categories are combined, not measured separately. Full staff-test text, verbatim: "Is staffed by
  75 percent of the same staff (including medical staff, contracted staff, and employees) that were
  on staff at the original location."
  - **The recruitment evidence is a "such as" list, not a required checklist.** Verbatim: the CAH
    "should also provide documentation of efforts it is making to reduce turnover, such as evidence
    of active recruitment efforts, i.e., posting of vacancies, participating in job fairs, and
    evidence of outreach to professional schools and universities." Note "professional schools and
    universities", NOT "nursing schools". Never present these as things CMS requires.
  - **A replacement building counts as a relocation.** Verbatim: "All newly constructed necessary
    provider CAH facilities are considered relocated facilities. This includes construction of a new
    facility that replaces the existing CAH main campus, even when on the same site as the original
    building."
  - PBL wording is "created or acquired on or after January 1, 2008" — acquisition counts, not just
    construction.
- **Origin:** OIG report "Most Critical Access Hospitals Would Not Meet the Location Requirements if
  Required to Re-enroll in Medicare", released August 14, 2013 (OEI-05-12-00080). CMS concurred with
  its recommendation to periodically reassess compliance.
- Verified: 2026-08-26 (primary document read in full)

### Two surveys, not one: CMS versus state licensing

Founder correction 2026-08-31 ("Do surveyor not check the state rule?"), after a
draft treated "a surveyor" as a single actor checking only federal rules.

- **A CMS survey** determines compliance with the federal Conditions of
  Participation, for a CAH at 42 CFR Part 485 Subpart F, through observation,
  interviews and record review (CMS State Operations Manual Appendix W).
- **A state licensing survey is separate**, run by the state agency (Texas HHSC
  for a Texas hospital) against state rules, which are stricter in places. The
  clearest example already in this dossier: federal 485.631(a)(5) permits an LPN
  as the licensed nurse on duty, while 26 TAC 505.41(o)(2)(D) requires an RN on
  duty in each building containing an occupied nursing unit.
- **How to write it:** never say "a surveyor" as though one inspection covers
  everything. Name which survey you mean, and where a state rule is stricter, say
  the same schedule has to satisfy both.

### PBJ and swing beds: the split, and the wording rule

Added 2026-08-31 after a fact-check found this entry missing. The facts lived only
inside `src/data/post/cms-pbj-reporting-scheduling-software.md`, and a second post
(`nurse-schedule-audit-trail`) then leaned on them with no dossier row to check
against. Line 333 of this file already referred to "the PBJ split already in this
dossier", which was not true until now.

- **Most Critical Access Hospitals file no PBJ data at all.** Payroll-Based Journal
  reporting attaches to the skilled-nursing certification, and swing-bed care sits
  under the hospital's own certification instead.
- **The decision rule is one question:** is the hospital listed on Nursing Home Care
  Compare with its own skilled nursing facility CMS Certification Number? If no, it
  does not file PBJ. Check at https://www.medicare.gov/care-compare/ — a
  swing-bed-only hospital returns no nursing-home listing.
- **The exception** is a separately certified distinct-part skilled nursing unit.
  That unit, not the hospital around it, owes PBJ.
- **WORDING RULE, same shape as the 483.35 rule below.** Always scope the exemption
  to the reporting: write "swing beds are exempt **from PBJ**", never a bare "swing
  beds are exempt". The hospital's own 485.631 obligations still apply to those
  patients, and a bare exemption reads as though they do not. A fact-check caught
  exactly this leak in the audit-trail draft on 2026-08-31.
- **NEVER write "a swing-bed-only hospital".** Founder correction 2026-08-31: a CAH
  is not swing-bed-only; it runs acute beds and may also use swing beds. The test
  turns on whether a **separately certified skilled nursing unit** exists, not on
  swing beds at all. Correct phrasing: "a hospital without a separately certified
  skilled nursing unit returns no nursing-home listing, whether or not it uses
  swing beds." The wrong phrasing was live in two posts before this.
- **Do not state the distinct-part position as a quoted CMS line.** It is an
  inference from the separate-certification structure. Safe wording: "certified as a
  skilled nursing facility and surveyed against Part 483 in its own right."
- **Avoid "small and shrinking minority"** unless the sibling post's reasoning is
  carried with it. The trend half is unsourced.

### Nursing care delivery models (the traditional four) and the evidence for them

- **The four traditional models** are functional nursing, team nursing, total patient care and primary nursing. Source: Jennings BM, "Care Models," chapter 19 in Hughes RG (ed.), _Patient Safety and Quality: An Evidence-Based Handbook for Nurses_, AHRQ, 2008. URL: https://www.ncbi.nlm.nih.gov/books/NBK2635/
- **Approved verbatim quote (the split):** "Functional and team nursing are task-oriented and use a mix of nursing personnel; total patient care and primary nursing are patient-oriented and rely on registered nurses (RNs) to deliver care."
- **Approved verbatim quote (the evidence gap):** "What is glaring in its absence, however, is the limited research related to care models." Attribute to the chapter's author (Jennings), not to AHRQ as an agency finding.
- **Guardrail — the chapter covers far more than four.** It also discusses patient-focused care, the nursing partnership model, Partners in Patient Care, disease management, consumer-directed and professional agency models, service-line delivery, restorative care and emotion-oriented care. Say "four traditional models," never "the four models."
- **Guardrail — primary nursing is about ACCOUNTABILITY, not continuity.** It means a named nurse holds 24-hour accountability for a patient's plan of care admission to discharge, with associate nurses carrying out that plan on the primary nurse's days off. It does NOT require the same nurse to be physically present across the stay. A small hospital where a patient happens to see the same nurse is NOT running primary nursing; that is continuity by coincidence. This exact error was caught in the nurse-staffing-models draft, 2026-08-28.
- **Thériault M, Dubois CA, Borgès da Silva R, Prud'homme A.** "Nurse staffing models in acute care: A descriptive study." _Nursing Open_ 2019;6(3):1218-1229. https://pmc.ncbi.nlm.nih.gov/articles/PMC6650648/ — 40 acute care units across four hospital centers in Quebec, grouped into four staffing configurations by resource level, staff mix and team stability. Approved quotes: the least resourced model "relied mainly on less qualified personnel and agency staff"; the most resourced had "the lowest patient-to-nurse ratio in the sample."
- **Guardrail on Thériault:** it describes RESOURCING, not which named care model a unit follows, and it is Canadian, so license categories do not map cleanly onto US practice. Never present it as a ranking of the four models.
- **No published minimum roster size per model.** Searched 2026-08-28, found none. Frame as our own negative finding ("we looked and found none"), never as an established fact about the literature.

### RN supervision duty: FEDERAL first, Texas second (a correction worth remembering)

- **The supervise-and-assign duty is FEDERAL, not a Texas addition.** 42 CFR 485.635(d)(1): a registered nurse must "provide (or assign to other personnel) the nursing care of each patient, including patients at a SNF level of care in a swing-bed CAH." 485.635(d)(2): "A registered nurse or, where permitted by State law, a physician assistant, must supervise and evaluate the nursing care for each patient."
- **What Texas genuinely ADDS** is the each-building rule, 26 TAC 505.41(o)(2)(D): "An RN shall be on duty in each building of a licensed hospital that contains at least one nursing unit where patients are present."
- **The full Texas assignment sentence, same subsection, quote it complete:** "The RN shall supervise and evaluate the nursing care for each patient and assign the nursing care to other nursing personnel in accordance with the patient's needs and the specialized qualifications and competence of the nursing staff available." The trailing qualifications-and-competence clause is the skill-mix requirement; truncating the quote before it drops the load-bearing part.
- **The useful practical finding:** federal 485.631(a)(5) permits an RN, CNS **or LPN** as the licensed nurse on duty, so an LPN-only overnight satisfies the federal rule. In Texas it does not, because of the each-building RN rule. Always pair this with "confirm with your compliance lead," since licensing and building layout affect application.
- **Wrong framing to avoid:** "Texas requires the RN to supervise and assign" or "state law sitting on top of the federal minimum" applied to the supervision duty. Caught in the nurse-staffing-models draft 2026-08-28, where it ran through the Key Takeaways, the body, the FAQ and the Sources block.
- Citation currency: Texas moved hospital licensing from 25 TAC Chapter 133 to 26 TAC Part 1 Chapter 505 in January 2025. Cornell LII renders 505.41; texreg.sos.state.tx.us DNS-fails from this environment. Verified 2026-08-28.

### Joint Commission nurse staffing (NPG 12, Accreditation 360, staffing-effectiveness history)

Added 2026-08-24 for the joint-commission-nurse-staffing-standards post. jointcommission.org 403-blocks automated readers, so official-page claims are verified via named secondary reporting; the secondary source is part of the citation, keep it.

- **National Performance Goal 12** ("Health Professional Resource Management"), effective **January 1, 2026**. Goal text, verbatim: "The hospital is staffed to meet the needs of the patients it serves, and staff are competent to provide safe, quality care." Verified via AACN newsroom (Oct 21, 2025, aacn.org/newsroom/nurse-staffing-identified-as-new-joint-commission-national-performance-goal) and Advisory Board Daily Briefing (Nov 3, 2025, advisory.com/daily-briefing/2025/11/03/joint-commission-nursing-ec). Official page (403-blocked): jointcommission.org/en-us/standards/national-performance-goals/health-professional-resource-management.
- **No ratios, ever.** TJC has never set a numeric nurse-to-patient ratio and NPG 12 does not. Advisory Board: the language "is not specific about what 'adequate' staffing levels are required to meet patient care needs." Ratio mandates are STATE law. Never attribute a ratio to TJC.
- NPG 12 is one of **14 National Performance Goals that replaced the National Patient Safety Goals** effective 2026-01-01 (Relias, relias.com/blog/joint-commission-national-performance-goals-are-here: "no new requirements have been added. Instead, existing requirements have been clarified and reorganized."). NEVER call NPG 12 a "National Patient Safety Goal" and never use the circulating "NPSG.00.12.01" designation (unsourced).
- **Accreditation 360**: announced June 30, 2025; removed **714 requirements** from the hospital program; manual explicitly flags CMS-directed CoPs; introduced NPGs and the SAFEST recognition program. Verified via AHA News (aha.org/news/headline/2025-06-30-joint-commission-streamlines-accreditation-process-removes-over-700-requirements).
- **The 24/7-RN line is hospital-CoP-derived.** Advisory Board describes NPG 12 as expecting "an RN on duty to either directly provide care for patients or supervise nursing care provided by other staff 24/7". That derives from the HOSPITAL CoP (482.23(b)). The CAH floor is different and laxer: 485.631(a)(5) RN/CNS/LPN on duty whenever one or more inpatients. Never present 24/7 RN as a CAH legal requirement.
- **Staffing-effectiveness history (the verified sequence):** introduced July 2002 (screening indicators correlating staffing to outcomes) -> suspended 2009 (PI.04.01.01 hospitals / HR.1.30 LTC; feedback: did not meaningfully improve quality/safety, consumed extensive resources, among most frequently cited findings) -> interim standards effective July 1, 2010 (LD.04.04.05 EP 13 board reporting + PI.02.01.01 EPs 12-14 staffing adequacy in event analysis) -> persisted (still in effect 2021 per a State of Alaska document, snippet-verified) -> superseded by Accreditation 360 / NPG 12 in 2025-26. Source: McGuireWoods client alert, Feb 2010 (mcguirewoods.com/client-resources/alerts/2010/2/thejointcommissionapprovesinterimstaffingeffectivenessstandardsforhospitalslongtermcareorganizations/). There is NO citable 2013 retirement event. WRONG: "first time ever the Joint Commission has addressed staffing" (common in 2025-26 coverage). RIGHT: "first time staffing is a named National Performance Goal."
- **CAH accreditation share:** deemed status for CAHs available via 4 CMS-approved accreditors: ACHC, CIHQ, DNV, TJC (RHIhub, ruralhealthinfo.org/topics/critical-access-hospitals; 1,388 CAHs as of July 2026 per Flex Monitoring count on the same page). Flex Monitoring Team Policy Brief #33, exact title "Evidence-Based Medication Safety Quality Improvement Programs and Strategies for CAHs" (flexmonitoring.org/sites/flexmonitoring.umn.edu/files/media/policybrief33-med-safety-qi-cah-1.pdf; publication page /publication/evidence-based-medication-safety-quality-improvement-programs-and-strategies-cahs; host is the documented bot-block false positive, loads in a real browser): "Only 30% of the 1,328 CAHs are accredited", accredited CAHs skew larger/system-affiliated. The 1,328 denominator dates the figure (roughly 2013 era) — ALWAYS frame as historical ("an earlier Flex Monitoring policy brief"), never as the current share. TJC's claim of accrediting more CAHs than any other accreditor is from its own program page (snippet-verified only).
- ANA president Jennifer Mensik Kennedy on NPG 12 (as reported by Advisory Board), full verbatim: "Today's achievement is a defining moment for the nursing profession and for patient care across the nation." (The "across the nation" tail was missing from the first recording; fact-check agent caught it 2026-08-24.)
- **Requirement-level detail (12.01.01 / 12.02.01 / 12.04.01 / 12.06.01 breakdowns) is snippet-only and paraphrase.** Do not cite specific requirement numbers or EP text until page-verified against the TJC manual. The post deliberately describes surveyor expectations generically (staffing plan, nursing-leadership direction, competency documentation).
- Legacy standard numbers (LD.04.04.05, PI.02.01.01, PI.04.01.01, HR.1.30) are usable ONLY in the history, past tense. Post-2026 the operative citation is NPG 12.
- Verified: 2026-08-24 (AACN, Advisory Board, AHA, Relias, McGuireWoods, RHIhub page-verified this session; TJC and Flex PDFs bot-blocked, snippet-corroborated)

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
| 2026-08-24 | Added "Joint Commission nurse staffing (NPG 12, Accreditation 360, staffing-effectiveness history)" for the joint-commission-nurse-staffing-standards post: NPG 12 goal text + effective date, no-ratio guardrail, 714-requirement Accreditation 360 context, 2002->2009->2010 staffing-effectiveness sequence (no 2013 event exists), CAH deemed-status routes + historical 30% accreditation share (1,328-CAH era, always framed historical), 24/7-RN-is-hospital-CoP guardrail. TJC and Flex PDFs bot-blocked; secondary verification chain recorded per fact. | Claude |
| 2026-08-28 | Added **nursing care delivery models** (AHRQ/Jennings chapter 19 + Thériault 2019) and **RN supervision duty: federal first, Texas second** for the nurse-staffing-models post. The second entry exists because the draft got the framing backwards: it presented the RN supervise-and-assign duty as a Texas addition when 42 CFR 485.635(d) already imposes it on every CAH, and the error ran through the Key Takeaways, body, FAQ and Sources. Only the each-building rule is genuinely Texas-only. Also recorded: primary nursing is defined by named 24-hour ACCOUNTABILITY with associate nurses, not by the same nurse recurring across a stay (draft had this wrong too), and the Texas assignment quote must be carried complete through its qualifications-and-competence clause. | Claude |
| 2026-08-17 | Added **Texas HSC 257.001** (who Chapter 257 covers) and **257.003** (nurse staffing policy and plan) for the acuity-based-staffing post. Two findings worth the entries: (1) Chapter 257 has **no rural, small-hospital or Critical Access carve-out** — a Texas CAH is caught because it is licensed as a general hospital under Chapter 241, so the written staffing policy, plan and committee obligations apply exactly as they do to a large system hospital; (2) the statute requires "an adequate number and skill mix of nurses ... to meet the level of patient care needed" and contingency planning for when "patient care needs unexpectedly exceed direct patient care staff resources", but **never uses the words acuity, census or intensity of care**. Guardrail recorded in the entry: acuity-based staffing may be described as one recognised way to satisfy 257.003, never as something Texas law mandates. Verified via FindLaw 257.001/257.003 (statutes.capitol.texas.gov stays unlinked per the existing geo-block rule). | Claude |
