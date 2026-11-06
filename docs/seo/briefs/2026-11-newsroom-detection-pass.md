# Newsroom detection pass, 2026-11-06

_Window: items published 2026-10-23 to 2026-11-06. Method: `.claude/skills/trendjacking-articles.md`; history and held/dropped topics: `docs/seo/articles-trendjacking-plan.md`. Research brief only: nothing drafted, nothing committed._

Score = Relevance (1-5) x Rising (1-5) x Can-we-be-first (1-5) x Citable hook (0/1). Keep requires hook = 1 and relevance >= 3.

**Tools used:** WebSearch (standard + extended) on every seed in the brief; WebFetch; Federal Register API (public-inspection and documents endpoints); the CARE rule PDF downloaded and read as text (`pdftotext`, 378 pages, 12,196 lines); DataForSEO `serp/google/organic/live/regular` (3 queries) and `keywords_data/google_trends/explore/live` (5 terms, US, 2026-08-06 to 2026-11-06).

**Environment limits that affected this pass:** every Texas state host (`www.hhs.texas.gov`, `pfd.hhs.texas.gov`, `gov.texas.gov`) failed DNS from this machine all session (WebFetch `ENOTFOUND`/`EAI_AGAIN`; curl status 000). Becker's returns 403 to WebFetch. So no Texas primary document and no Becker's body text was read this pass; items that depend on them are marked UNVERIFIED.

**Trends read (DataForSEO, US, daily, relative 0-100 within the 5-term set):** "CMS proposed rule" reached 13 on 2026-11-05, its highest value in the 3-month window (3-month average 3). "rural health transformation" ran 30 to 38 on most weekdays from 2026-10-26 to 2026-11-05 (average 24). "nurse strike" ran 16 to 29 (average 8). "nurse staffing" ran 41 to 52 (average 44, flat). The series is sparse before 2026-10-23 (many days with no value), so read it as direction only, not as volume.

---

## 1. Every item considered

| # | Item | Outlet | Date | URL | R | Ri | F | H | Score | Keep/drop and why |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CARE proposed rule (CMS-3484-P) removes the CAH emergency services readiness staff training rule, 42 CFR 485.618(e)(2), plus CAH OB staff training and OB QAPI | CMS fact sheet; Federal Register public inspection 2026-22812 | Issued 2026-11-05; FR publication 2026-11-10 | https://www.cms.gov/newsroom/fact-sheets/medicare-medicaid-programs-cutting-administrative-requirements-excellence-patient-care-care-cms-3484 ; https://public-inspection.federalregister.gov/2026-22812.pdf | 5 | 4 | 5 | 1 | **100** | **KEEP, recommended.** Tier 1 CMS/CoP, every CAH, issued 1 day ago, and it reverses part of the rule our live C-0896 piece explains. SERP has no page on it yet. Hook verified from the rule text. |
| 2 | Same rule: CAH distance eligibility codified ("acute care hospital" excludes psych, LTCH, rehab and now REHs) + CAA 2026 section 241 exemption, which CMS says covers four facilities | Same document | Same | Same | 4 | 3 | 4 | 1 | **48** | **KEEP as an UPDATE** to `/articles/cms-cah-location-eligibility-review-2026`, not a new piece. Two new facts (REH exclusion, "four facilities", exemption not time-limited). No staffing angle of its own. |
| 3 | "$87 Million for 129 Rural Healthcare Providers Across Texas" (Rural Texas Strong), and whether Texas committed its first-year money by the 2026-10-30 federal deadline | CMS press release | 2026-10-29 | https://www.cms.gov/newsroom/press-releases/trump-administration-announces-87-million-129-rural-healthcare-providers-across-texas | 5 | 3 | 4 | 0 (pending) | **0 now; 60 if the hook verifies** | **HOLD as an UPDATE** to `/articles/texas-rural-health-transformation-signed-contracts`. The hook needs HHSC's post-Oct-30 award list, which could not be reached (DNS). See section 2, candidate C. |
| 4 | HHSC "plans to award $78 million" to 216 providers | HHSC release (search snippet only) | 2026-10-15 | https://www.hhs.texas.gov/news/2026/10/gov-abbott-hhsc-announce-recipients-78-million-rural-texas-strong-grants | 5 | 1 | 3 | 0 | 0 | Drop as a standalone: before the window, and it is one of the weekly intent-to-award batches folded into item 3. |
| 5 | Brigham and Women's nurses (about 4,000) reject tentative contract; Nurse.org headline says an open-ended strike is set for Nov 12 | WBUR; Nurse.org (headline only) | 2026-10-23; ~2026-11 | https://www.wbur.org/news/2026/10/23/brigham-nurses-union-contract-vote-no ; https://nurse.org/news/ | 2 | 4 | 1 | 0 | 0 | Drop. Urban academic hospital in Boston, no CAH or Texas link, Boston press owns the SERP. Overlaps `july-2026-nurse-strikes-staffing`. Strike date seen only as a headline (UNVERIFIED). |
| 6 | Allegheny General (Pittsburgh) nurses ratify 3-year deal with staffing commitments and $35M for wages | Patch | 2026-10-27 | https://patch.com/pennsylvania/pittsburgh/1-500-nurses-pittsburgh-hospital-reach-contract-agreement | 2 | 1 | 2 | 0 | 0 | Drop. Urban, resolved, no hook. |
| 7 | Nurse.org voter survey (830 nurses) and 2026 midterm results for nurse candidates | Nurse.org | 2026-11 | https://nurse.org/news/nurse-voter-survey-2026-results/ ; https://nurse.org/news/nurses-on-the-ballot-2026-election-results/ | 2 | 3 | 1 | 0 | 0 | Drop. Publisher's own non-random survey; electoral politics on a YMYL domain is Tier 3 for us. |
| 8 | "Rural hospitals revamp nurse staffing strategies for 2027" (Columbus, Neb., CNO on an "inverted experience pyramid"; NRHA "nearly 70%" of rural counties are shortage areas) | Becker's | 2026-10-30 | https://www.beckershospitalreview.com/workforce/rural-hospitals-revamp-nurse-staffing-strategies-for-2027/ | 4 | 2 | 2 | 0 | 0 | Drop. Feature with no new data; Nebraska; body unread (403), snippet only. A possible evergreen blog idea (experience mix on nights), not a Newsroom peg. |
| 9 | "Rural hospital layoffs rise in 2026 as closures fall" | Becker's | mid-Oct 2026 (exact date not confirmed) | https://www.beckershospitalreview.com/finance/rural-hospital-layoffs-rise-in-2026-as-closures-fall/ | 3 | 2 | 1 | 0 | 0 | Drop. Likely before the window, Becker's owns it, no Texas or scheduling hook. |
| 10 | "New data shows 44 Oklahoma rural hospitals face closure" | KFOR | ~2026-11-03 to 05 | https://kfor.com/news/new-data-shows-44-oklahoma-rural-hospitals-face-closure | 3 | 2 | 2 | 0 | 0 | Drop. Oklahoma; the "44" source was not identified (a CHQPR-based local report says 45 of 73); `rural-hospital-losses-nurse-staffing-cost` already covers the CHQPR data for Texas. |
| 11 | Mercy Health closes labor and delivery at St. Joseph Hospital, Warren, Ohio (OB-GYN shortage) | Ideastream | 2026-11-04 | https://www.ideastream.org/health/2026-11-04/trumbull-county-will-have-no-hospital-labor-and-delivery-unit-after-st-joseph-move | 2 | 2 | 2 | 0 | 0 | Drop. Not a CAH; a physician shortage, not nursing. |
| 12 | Memorial Hospital of Sweetwater County (WY) approves audit; operating margin 12.2% vs 5.8% | SweetwaterNOW | 2026-11-05 | https://www.sweetwaternow.com/mhsc-approves-audit-expects-1-5-million-in-rural-health-care-funding/ | 2 | 1 | 3 | 0 | 0 | Drop. Local finance item, no staffing angle. |
| 13 | Redeemer Health (PA) Chapter 11; 239-bed Holy Redeemer Hospital sale or closure considered | Medical Daily | ~2026-11 | https://medicaldaily.com/redeemer-health-holy-redeemer-hospital-bankruptcy-480761 | 1 | 2 | 1 | 0 | 0 | Drop. Not rural, not a CAH. |
| 14 | CY 2027 OPPS/ASC final rule | Federal Register 2026-22739 | 2026-11-06 | https://www.federalregister.gov/documents/2026/11/06/2026-22739/medicare-program-hospital-outpatient-prospective-payment-and-ambulatory-surgical-center-payment | 3 | 4 | 1 | 0 | 0 | Drop. Payment rule (CAHs are paid on cost), trade press owns it. Not read; if a CAH CoP item turns up in it later, revisit. |
| 15 | CMS proposed rule implementing CAA 2026 sections 6219, 6220, 6224 | Federal Register 2026-21420 | 2026-10-20 | https://www.federalregister.gov/documents/2026/10/20/2026-21420/medicare-program-implementation-of-sections-6219-6220-and-6224-of-the-consolidated-appropriations | 1 | 1 | 2 | 0 | 0 | Drop. Part D cost-sharing, provider directories, PBMs. No CAH content. Also 3 days before the window. |
| 16 | Texas Board of Nursing October 2026 Bulletin (search snippet: about 593,807 licenses, about 12,728 more than prior fiscal year) | Texas BON | 2026-10 | https://www.bon.texas.gov/pdfs/newsletter_pdfs/2026/2026-10_TBON_Bulletin_Final.pdf | 3 | 1 | 3 | 0 | 0 | Drop. License counts are not a shortage signal by themselves; primary unread (UNVERIFIED figures). |
| 17 | OBBBA Medicaid cut analyses (American HHM 2026-10-28; Floridian on Florida's $193.7M RHTP award) | Consulting blog; state outlet | late Oct 2026 | https://www.americanhhm.com/articles/obbba-medicaid-cuts-hospital-financial-impact | 3 | 2 | 1 | 0 | 0 | Drop. No new data; consulting and advocacy rewrites of older CBO/KFF numbers. |
| 18 | Government shutdown effects on hospitals | (searched) | n/a | https://aasm.org/congress-ends-partial-government-shutdown-and-extends-telehealth-flexibilities-and-the-work-gpci-floor-through-2027/ | n/a | n/a | n/a | 0 | 0 | No October 2026 shutdown found. The CAA 2026 (Feb 2026) extended Medicare telehealth flexibilities through 2027-12-31 per AASM. Nothing to write. |
| 19 | Joint Commission NPG 12 | (searched) | n/a | n/a | 4 | 1 | n/a | 0 | 0 | No new 2027 update found; NPG 12 has been in effect since 2026-01-01 and is covered by `joint-commission-nurse-staffing-standards`. |
| 20 | Mandatory overtime / staffing-ratio laws | (searched) | n/a | n/a | 4 | 1 | n/a | 0 | 0 | No law signed in the window found. |
| 21 | Travel nurse / agency rates | (searched) | n/a | n/a | 4 | 1 | n/a | 0 | 0 | No October 2026 rate report found (newest Vivian data in results is October 2024). |
| 22 | Texas legislature interim hearings on rural hospitals / nursing | (searched) | n/a | n/a | 5 | 1 | n/a | 0 | 0 | No hearing in the window found. Worth a direct check of Texas Legislature Online once the Texas hosts resolve. |
| 23 | HRSA / NSI / BLS / AHA workforce data drops | (searched) | n/a | n/a | 5 | 1 | n/a | 0 | 0 | No new edition found in the window. |

Already logged as dropped earlier on 2026-11-06 (plan doc): HealthTech rural security recruitment, score 0.

---

## 2. Top 3

### A. CMS proposes to drop the CAH emergency-readiness training rule seven weeks after telling surveyors how to check it (score 100, RECOMMENDED)

**Angle (one sentence):** On November 5, CMS proposed removing the annual emergency-readiness training requirement at 42 CFR 485.618(e)(2), the same rule its Transmittal 247 (Sept 18) turned into survey tag C-0896, so a DON needs to know what is gone, what stays, and what to keep doing until a final rule.

**The one citable hook:** CMS's own savings table for this repeal assumes **every** clinician at a critical access hospital takes the training, against one in five at a larger hospital, because "CAHs, which are smaller in size, are likely to have medical staff that work across units." On CMS's numbers that is 68,234 CAH staff, 96,892 staff hours and $11,061,162 a year across 1,329 CAHs. Divided out (our arithmetic, an average, labelled illustrative): about 51 clinicians, 73 staff hours and $8,300 per CAH per year. CAHs carry 17% of the rule's emergency-training savings while holding 2.7% of certified beds. That is a sourced, CAH-scaled number nobody has published, and the "staff work across units" line is CMS stating in writing the cross-coverage reality of a small hospital's schedule.

**Verified facts (all read in the rule text, public inspection PDF 2026-22812, unless noted):**

- Header: "This document is scheduled to be published in the Federal Register on 2026-11-10". Docket "[CMS-3484-P]", "RIN 0938-AW04", "ACTION: Proposed rule." 378 pages. Filed for public inspection 2026-11-05, 4:15 PM ET (Federal Register API).
- Comment deadline: "by [INSERT DATE 60 DAYS AFTER DATE OF PUBLICATION IN THE FEDERAL REGISTER]". 60 days after 2026-11-10 is **2027-01-09** (our calculation; confirm against the published Federal Register version on or after Nov 10).
- Section heading: "2. Proposal to Remove Emergency Services Readiness Staff Training (§ 485.618(e)(2))". Amendatory text: "35. Section 485.618 is amended by removing and reserving paragraph (e)(2)."
- What the current rule requires (CMS's own description): "As of July 1, 2025, § 485.618(e)(2) requires CAHs to train applicable staff annually on the protocols and provisions implemented pursuant to the emergency services readiness requirements at § 485.618(e)." The governing body identifies which staff; the CAH must "document in their personnel records that the training was successfully completed and demonstrate staff knowledge".
- What stays: "Existing requirements for CAHs in other subsections of § 485.618 require CAHs to have adequate provisions and protocols to meet the emergency needs of patients." Only paragraph (e)(2) is removed, so the protocols and provisions in (e) remain. RIA: "hospitals and CAHs are still required to have adequate provisions and protocols to meet the emergency needs of patients".
- CMS reversing itself: "In the CY 2025 OPPS/ASC final rule, CMS disagreed with commenters who argued that the emergency services readiness staff training requirements at § 485.618(e)(2) were duplicative of existing CoPs (89 FR 94472). CMS is now reconsidering that position in light of changed circumstances, including the issuance of E.O. 14219 and E.O. 14192".
- CMS's stated reason for small hospitals: "the ongoing annual compliance burden, particularly for small and rural CAHs with limited staffing and financial resources, outweighs the incremental benefit".
- RIA assumptions (section "8. Emergency Services Readiness Staff Training for Hospitals (§ 482.55(c)(3)) and CAHs (§ 485.618(e)(2))"): initial training "takes 3 hours per employee", refresher "1 hour per employee", turnover "approximately 21 percent" (footnote: NSI 2024 report), and "We assume, therefore, that 20 percent of medical staff in hospitals and 100 percent of medical staff in CAHs would receive the training." Trained staff are assumed to include "LPNs, LVNs), RNs, nurse anesthetists, nurse midwives, nurse practitioners, physician assistants, physicians, and surgeons."
- Table 48, CAH row: 1,329 providers; 0.027 share of certified beds; 68,234 medical staff; $11,061,162 financial savings; 53,905 refresher hours + 42,987 initial hours = 96,892 hours. Hospital row: 3,319 providers; $54,063,623; 473,579 hours. Table 49 year 1 total: "$65,124,785" and "570,471" hours (the two rows sum to this exactly). Text: "would save hospitals and CAHs more than $65 million and 570 thousand hours annually" and "total 10-year savings of $651 million".
- Same rule, related CAH items: CAH OB staff training at 485.649(c) (effective 2027-01-01) proposed for removal, "$28.1 million and 205,200 hours of staff time over a 10-year period across all CAHs, translating to approximately $2.8 million and 20,520 staff hours annually"; CAH OB QAPI at 485.641(d)(4) and (e)(2) proposed for removal, "$3,439,885 and 20,328 staff hours annually". For the two Jan 1, 2027 items only, CMS writes: "although it is unlikely that this proposed rule will be finalized before January 1, 2027, we would request that our surveyors conducting surveys after that date focus on those CoPs that are not potentially subject to imminent revision." That sentence appears only in the OB training and OB QAPI sections (lines checked: 585, 996, 3315, 3474), **not** in the 485.618(e)(2) section.
- Whole-rule figures, CMS fact sheet (2026-11-05): "CMS estimates the proposals would save $320 million" and "returning more than 3.26 million hours of staff time to providers." Rule summary: CAHs "average annual savings of $16.6 million and $166 million over 10 years".
- CAH context CMS itself cites in the preamble: "Between 2010 and May 2026, 51 CAHs either closed completely or ended inpatient services"; "since 2023, 23 CAHs have converted to REHs" (Sheps Center, accessed May 2026); "absence of hospital-based obstetric services in 60 percent of rural counties" (U. Minnesota RHRC, Jan 2026).
- The rule does not mention Transmittal 247, tag C-0896 or QSO-26-07. A case-insensitive grep of the full text for "transmittal", "C-0896", "QSO-26-07" and "interpretive guidance" returns only two footnotes citing the hospital Appendix A transmittals page (lines 497 and 2977).

**Accuracy guardrails for the writer:**

- It is a **proposal**. 485.618(e)(2) is in force today and C-0896 still tells surveyors to check it. Nothing in the rule asks surveyors to stop citing it before a final rule (verified, see above). The "What to do this week" section must say keep training and keep the records.
- Do not present "$173 million and 1,640,108 staff hours annually" as a CAH figure. The rule's CAH section quotes that 2024 estimate, but the same figure appears word for word in the hospital section (line 802), so it is the combined hospital-plus-CAH number from the CY 2025 final rule. The RIA's current savings estimate for the repeal is $65.1M a year combined. Why the two differ is a HYPOTHESIS (the 2024 figure likely counted first-year initial training for all staff); settle it by reading 89 FR 94545-94546 before writing any sentence about the gap.
- The per-CAH figures are our division of CMS's totals: an average that rests on CMS's assumption that 100% of CAH clinicians are trained. Label "illustrative, derived from CMS's Table 48, not a measured cost".
- CMS's justification leans on accreditation standards. Our facts dossier allows only the historical framing: "an earlier Flex Monitoring policy brief, from when the national count stood at 1,328 critical access hospitals, found only 30 percent held accreditation". Never state it as the current share.
- No force-fit product section. Footer note only.

**SERP check (DataForSEO, Google US, 2026-11-06, top 10):**

- "CMS CARE proposed rule critical access hospitals": no page about this rule. Results are 2022 CAH CoP proposals (hancockdaniel.com, advis.com), CMS QSO memos from 2015 to 2024, georgetown.edu (2024), azaleahealth.com, medicareadvocacy.org.
- "emergency services readiness staff training critical access hospital": no page about the repeal. Healthlinx blog, a 4-year-old video, fusionmedstaff, hsdl.org (2019), JD Supra (2022), PubMed (2019), ECRI.
- "CMS CARE rule conditions of participation": no page about this rule; generic CoP explainers (phoenixmed.net, cms.gov 2008, NCBI 1990, THA webinar page).
- Who will own it: Becker's already has "CMS proposes broad rollback of conditions of participation: 11 notes" (indexed in WebSearch, not in the Google top 10 yet; body 403). Expect law firms and trade press (Hall Render, McDermott+, Fierce, AHA News) within days on the whole-rule head term. The CAH-and-training long tail is open today, and the window is short. Can-we-be-first = 5.

**Overlap:**

- `src/data/article/cms-c-0896-emergency-protocols-critical-access-hospitals.md`: direct. Its Key Takeaways say "the rule already requires staff to be trained on it every year", and line 81 quotes 485.618(e)(2). The new piece should link it, and the C-0896 article needs a one-line dated update note pointing to the proposal (do not rewrite it; the rule is still in force).
- Blog posts citing 485.618 (`critical-access-hospital-requirements`, `how-to-stay-cms-compliant-nurse-scheduling`, `night-shift-nurse-schedule-coverage`, `physician-medical-staff-scheduling-small-hospital`, `what-is-clinical-scheduling`): grep shows they cite 485.618(a) and (d) (24-hour emergency services, 30-minute practitioner), not (e)(2) training. No edits needed unless the repeal is finalized.
- `rural-emergency-hospital-bill-nurse-staffing`: mentions obstetric units only in passing. No conflict.

**CAH / Texas link:** The rule applies to every CAH with emergency services, and that is every CAH, since CAHs must provide 24/7 emergency care. Texas has 93 CAHs (facts dossier, RHIhub). Texas-specific: the rule touches only federal CoPs; Texas hospital licensing rules (26 TAC 505) are unchanged by it. Do not multiply 93 by the per-CAH average without labelling it a rough illustration.

**Still to verify before writing:**

1. The published Federal Register version on 2026-11-10: FR citation, page numbers, printed comment date.
2. 89 FR 94545-94546 (CY 2025 OPPS final rule) for the $1.73B / $173M estimate and what it covered, before any sentence comparing the two numbers.
3. Whether CMS has issued or will issue a QSO memo on survey enforcement of 485.618(e)(2) or C-0896 while the proposal is pending. Search cms.gov QSO list the day of writing.
4. Any NRHA, AHA, THA or TORCH statement on the rule (none found today).
5. Becker's "11 notes" body (blocked); only needed if we quote it, which we should not need to.

### B. CARE rule, CAH distance eligibility: four facilities exempt, and REHs no longer count as nearby hospitals (score 48, UPDATE not a new piece)

**Angle:** CMS proposes to write its "like hospital" distance policy into the regulation itself, adds Rural Emergency Hospitals to the list of facilities that do not count against a CAH's 35-mile test, and says Congress's section 241 exemption covers four facilities with no end date.

**Citable hook:** "CMS determined that four facilities met the necessary criteria" for the CAA 2026 section 241 exemption, and CMS views that exemption "as not being time-limited and as applying to all future distance reviews." The REH exclusion is new relative to QSO-26-15-CAH, which our live article describes (it lists psychiatric, LTCH and rehabilitation hospitals only).

**Verified facts (rule text, 2026-22812):**

- Proposed 485.610(c)(3): an acute care hospital "does not include a psychiatric hospital ... a long-term care hospital ... or a rehabilitation hospital". "We are also proposing to add rural emergency hospital (REH) ... to this exclusion because REHs do not provide acute inpatient care services".
- Section 241, CAA 2026 (Pub. L. 119-75, enacted 2026-02-02): no distance enforcement against facilities certified as CAHs as of 2024-01-01 that received a CMS noncompliance letter between 2024-12-01 and 2026-01-01; facilities terminated in that window solely on distance must be recertified.
- "As of January 2026, there were approximately 1,400 CAHs."
- The rule cites "QSO-26-15-CAH ... issued August 21, 2026", the memo our live article covers.

**SERP:** same query as A. The live article's ranking is unknown for this; a Google result for "CMS updates critical access hospital status review policy" (a post with "30+ reactions, 2 months ago") sits at position 7.

**Overlap:** `src/data/article/cms-cah-location-eligibility-review-2026.md` (lines 106 and 199-200 list the psych/LTCH/rehab exclusion; no mention of REHs, section 241, or the proposal). Also `critical-access-hospitals-in-texas`, `what-is-a-critical-access-hospital`, `critical-access-hospital-requirements` (distance rule mentions; check them only if the proposal is finalized).

**CAH / Texas link:** Applies to every CAH's location test. Whether any of the four exempt facilities is in Texas is **UNVERIFIED**: the rule does not name them.

**Still to verify:** the identity or state of the four facilities (CMS may not disclose); whether section 241's text matches CMS's summary (read Pub. L. 119-75, Div. B, Title II, sec. 241 on congress.gov).

### C. Did Texas commit its first-year rural health money by the October 30 deadline? (score 0 now; 60 if the hook verifies; UPDATE not a new piece)

**Angle:** A follow-up to our Oct 24 piece: the federal obligation deadline for Texas's first-year RHTP money passed on October 30; how much of the $281.3M is now under signed contract, and what happened to the rest.

**The hook it would need:** HHSC's first award list dated after 2026-10-30, compared with the 2026-10-23 list our article used ($223.0M listed, $87.4M signed, on 159 of 441 applications). **Not obtained:** every Texas state host failed DNS from this machine all session.

**What was verified (CMS release, 2026-10-29, read directly):** "Today, the Trump Administration announced $87 million" for "129 rural healthcare providers" through Rural Texas Strong; uses include recruiting and retaining "physicians, emergency medical personnel, and other healthcare professionals". It calls the money "one part of the larger overall funding amount awarded to Texas for fiscal year 2026". It does not mention October 30, obligation, contracts or a recipient list. One congressman's quote in the release says "68 rural hospital districts and authorities", which does not match 129 and is not reconciled in the release.

**Trap to log (important for accuracy):** this October 29 "$87 million" is **not** the same thing as our article's "$87.4 million signed". Search snippets of the HHSC releases describe each weekly batch as money HHSC "plans to award", with "Funding will be available after contracts are finalized" (Oct 15: $78M to 216 providers; Oct 22: $8M to 28; Oct 29: $87M to 129). Two different "$87 million" figures a week apart invite a misquote, including of our own headline. The snippet wording is UNVERIFIED until the HHSC releases are read directly.

**SERP:** not run for this item this pass (the hook is not verified, so there is no piece to rank yet).

**Overlap:** `texas-rural-health-transformation-signed-contracts` (the article to update), `rural-health-transformation-deadline-nurse-salaries` (the Oct 30 deadline explainer), `grow-your-own-nurses-texas-rural-grants`.

**CAH / Texas link:** direct; Texas CAHs and hospital districts are among the applicants (the Oct 24 article's own count of CAH rows applies).

**Still to verify:** HHSC's post-Oct-30 award list (xlsx on pfd.hhs.texas.gov, Rural Health Transformation page); the Oct 29 HHSC/Governor release text ("plans to award" wording); whether HHSC or CMS has said anything about funds not committed by Oct 30. Run from a network where the Texas hosts resolve, or open in the founder's browser.

---

## 3. Recommendation

**Write A this week:** a new `/articles` piece on the CARE proposal's removal of the CAH emergency-readiness training rule. Working question for the H1: "Is CMS Dropping the Emergency Readiness Training Rule for Critical Access Hospitals?"

Why A:

- It scores highest (100) and is the only Tier 1 item in the window whose hook is verified from the primary document.
- It is one day old with no page about it on the SERP, and it hits every CAH, Texas included.
- It continues a live article (C-0896), so the internal-link path is already there, and our earlier reading gives us an explanation nobody else can give quickly: what the rule did, how surveyors were told to check it on Sept 18, and what CMS now proposes to drop.
- The hook is CMS's own arithmetic on CMS's own page, scaled to one hospital, with the "staff work across units" line as the scheduling link. It needs no product claim and no force-fit.

The answer-first line is simple and true: not yet. The training rule is still in force, the protocols requirement stays even if the proposal is finalized, and comments are due around January 9, 2027.

Pair it with B as a same-day update to the location-eligibility article. Fold the OB training and OB QAPI changes (Jan 1, 2027 dates, surveyor-focus sentence) into A as one section, not a separate piece. Hold C until HHSC's post-deadline list can be read. Update the plan doc's 2026-11-06 section with this pass after the founder picks.

**Failed or unverified this pass:**

- C's hook: no Texas primary reachable.
- Brigham Nov 12 strike date: headline only.
- KFOR's "44": source not identified.
- TBON license counts: snippet only.
- Becker's bodies: 403.
- The meaning of the $173M versus $65M gap inside the CARE rule: hypothesis only.
