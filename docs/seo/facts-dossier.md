# Facts Dossier — Canonical Stats, Regulations, and Product Truths

Rule (same as the competitor dossier): any fact with an entry here MUST be used with the approved wording below. A fact not in this dossier must be verified against a primary source before use, then ADDED here in the same session. Entries older than 60 days at time of use get re-verified. The mechanical enforcement lives in `scripts/lib/facts-rules.mjs` (wired into `check-blog`); when you add an entry with a drift risk, add a matching rule there.

## External facts

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

## Product truths

- Self-label: "AI-native nurse scheduling service". Never "managed service" as a self-label (category/comparison use is fine).
- Pricing (canonical line, verbatim): **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees.
- NOT shipped (never claim as SSAI features): FLSA 8-and-80 calculation method; credential/license-expiry tracking.
- Setup timeline SPLITS BY MODE (founder, 2026-07-05): SERVICE mode = first schedule in under two weeks (3 to 5 day onboarding) — true today, keep on service pages/posts. PRODUCT mode = setup takes ABOUT FOUR WEEKS from roster upload to first live schedule (guided setup session, rule mapping, test cycles). NEVER carry service timelines into product-mode copy. Consequence: speed-to-live is NOT a product-mode differentiator against competitors with 4-6 week implementations; product comparisons anchor on no-configuration-burden, no integration project, and flat pricing instead.
- No customers, no pilots: SSAI is pre-launch. Never cite pilot observations, cohorts, facilities, or results. The free 60-day pilot offer is RETIRED; CTA = /how-it-works or /pricing + book-a-call.
- CTA pattern: one primary button + "Book a call with our team" text link below. Never /pilot.

## Maintenance log

| Date       | Change                                                         | By     |
| ---------- | -------------------------------------------------------------- | ------ |
| 2026-07-03 | Initial population from 2026-06-30..07-03 verified fact-checks | Claude |
| 2026-07-04 | Added staffing-ratio facts: 482.23(b), CA 70217, state ratio landscape (OR/MA/NY), TX 257.004, Aiken 2002/AHRQ, ANA position | Claude |
