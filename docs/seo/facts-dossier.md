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

### ARISE Healthcare AI Industry Report (July 2026)

- **Source note:** ARISE (Stanford/Harvard academic collaborative), "Healthcare AI Industry Report," July 2026 edition — PDF supplied directly by the founder, not a live-fetched URL. The report itself is the verified source for the three facts below; each also names an underlying primary study, which was NOT independently re-fetched/verified (the report's own bibliography sits behind a Google Drive link that did not render). Treat the primary-study attributions as one-hop/secondary — cite the ARISE report, not the underlying study, unless that study is separately verified.
- **Fact 1 — staffing/scheduling is a named AI category.** The report's own taxonomy (built with domain experts, aligned to the JAMA Summit on AI framework) names "Manage workforce capacity and resources: AI helps allocate or forecast system level resources, staffing, scheduling or operational capacity to improve care delivery and efficiency" as one of four core Administrative Workflow AI use cases. Verbatim, Figure 1 (Introduction section). Use for: legitimizing "AI-powered scheduling" as a recognized category, not marketing invention.
- **Fact 2 — nurses are the most AI-underserved clinical role.** Report states (citing Black et al. 2026, a retrospective analysis of 30,503 chat threads from a secure LLM tool at Stanford Medicine Children's Hospital, and separately Elsevier 2026 / Berlin et al. 2026): "Nurses use AI less than doctors (41% vs. 57%), and only about half report adequate institutional support, even as nursing workflows are considered a significant, but largely unrealized opportunity for AI use cases in care delivery." Approved paraphrase: "nurses use AI at lower rates than physicians (41% vs 57%), per a 2026 ARISE healthcare AI industry analysis." Do NOT attribute the percentage directly to "Elsevier" or "Berlin et al." without separately verifying those — cite "ARISE Healthcare AI Industry Report, July 2026" as the source.
- **Fact 3 — agentic AI reliability gap on admin/ops tasks.** Report cites HealthAdminBench (Bedi, Welch, et al. 2026, not independently verified): "the best agent achieved only 36.3% end-to-end task success with portal guidance and 19.3% without it, even as the strongest system reached 82.8% on individual subtasks." Use for: substantiating skepticism of "agentic AI" marketing claims (ours and competitors') — strong subtask performance does not imply reliable multi-step task completion.
- **Wrong:** citing "Black et al. 2026" or "Bedi, Welch, et al. 2026" as if independently verified against the primary paper; implying this report covers rural, critical access, or small-hospital settings — it does not (searched, zero mentions of "rural," "critical access," "shortage," "turnover").
- Verified: 2026-07-06 (source: local PDF; full title "Healthcare AI Industry Report," ARISE-AI.ORG watermark on figures)

### July 2026 nurse strikes (Nurse.org)

- Approved facts (all from the single Nurse.org report, attribute to it, do not upgrade to independent verification): five actions July 3-13, 2026 across MI/MD/KS/MA/NY. MyMichigan Medical Center Alma (~178 nurses, Michigan Nurses Association, ULP strike July 3-6, pay offer 0%/1%/1%, 98% strike authorization); Ascension Saint Agnes Baltimore (~600, NNU, one-day July 6, cut staffing hours + unsafe floating, e.g. med-surg nurses assigned to newborns); Ascension Via Christi St. Francis + St. Joseph Wichita (~1,200, NNU, one-day July 6, workplace-violence protection central + safe staffing); Brigham and Women's + MGB Home Care Boston (~4,000 + ~450, Massachusetts Nurses Association, July 8, union calls it largest nurse/HCW strike in MA history, home-care arm 7 days); St. Charles Hospital Port Jefferson NY (~300, NYSNA, from July 13, >99% authorization, staffing ratios; Catholic Health denies).
- Common-thread framing (source's own): safe staffing at or near the top of every list; "there are not enough of them at the bedside to keep patients safe."
- Wrong: "the Wichita strike ended July 10" (it was a one-day strike July 6); "five strikes between July 6 and 13" (first ran July 3-6); treating union claims (e.g. ratio violations at St. Charles) as adjudicated fact — the hospital denies them.
- URL: https://nurse.org/news/july-2026-nurse-strikes/ (Jay Wiley, July 6, 2026; page 403-blocks non-browser fetches, use a browser UA)
- Verified: 2026-07-10 (full body extracted and read)

## Product truths

- Self-label: "AI-native nurse scheduling service". Never "managed service" as a self-label (category/comparison use is fine).
- Pricing SPLITS BY MODE (founder, 2026-07-06): SERVICE mode (canonical line, verbatim): **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees. PRODUCT mode (canonical line, verbatim): **Cost:** $10 per user per month, or $100 per user per year. Every nurse and manager on the roster is a user. No setup fees. NEVER say "no per-nurse fees" in product mode (product pricing IS per-user); never mix the two models on one page. Annual math: $100/yr vs $120 monthly-billed = two months free.
- NOT shipped (never claim as SSAI features): FLSA 8-and-80 calculation method; credential/license-expiry tracking.
- Setup timeline SPLITS BY MODE (founder, 2026-07-05): SERVICE mode = first schedule in under two weeks (3 to 5 day onboarding) — true today, keep on service pages/posts. PRODUCT mode = setup takes ABOUT FOUR WEEKS from roster upload to first live schedule (guided setup session, rule mapping, test cycles). NEVER carry service timelines into product-mode copy. Canonical 4-week onboarding flow (founder, 2026-07-05): collect staff Excel -> set up the hospital's workspace -> import the roster -> configure units and rules together in the guided setup session -> train the DON -> go live. Name these steps when explaining the timeline; they are what makes the one-month promise safe to give. Consequence: speed-to-live is NOT a product-mode differentiator against competitors with 4-6 week implementations; product comparisons anchor on no-configuration-burden, no integration project, and simple per-user pricing instead.
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
