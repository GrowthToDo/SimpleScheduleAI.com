# Brief: What Is a Swing Bed? Staffing a Critical Access Hospital Swing-Bed Program (next-15 #3)

Date: 2026-11-23. Phase 1 research only. Every finding names its check; anything without one is labelled HYPOTHESIS or NOT VERIFIED. "Date read" for every source below is 2026-11-23 unless stated.

Source note: Cornell LII (law.cornell.edu) was read by direct fetch and the text extracted, so quotes below are verbatim from the page text. ssa.gov returned 403 (so section 1883 was read at its Cornell mirror, 42 U.S.C. 1395tt). eCFR was not fetched (the dossier records that it bot-blocks). The CMS Medicare Benefit Policy Manual ch. 8 URL I tried returned 404; coverage facts were read at 42 CFR 409.30 and 409.61, the CMS MLN swing-bed fact sheet and medicare.gov instead.

## 1. Keyword collision and demand

- `npm run keyword-check -- "what is a swing bed"`: "no collisions, clear to brief". `grep -i swing docs/seo/keyword-registry.json` finds only the PBJ and CNA notes. Proposed registry entry: slug `what-is-a-swing-bed`, type `post`, url `/blog/what-is-a-swing-bed`, primaryKeyword `what is a swing bed`, pillar `/critical-access-hospital-scheduling`; note: secondaries "swing bed program" (210), "critical access hospital swing bed requirements"; siblings `cna-patient-ratio-laws-by-state`, `cms-pbj-reporting-scheduling-software`.
- DataForSEO `/v3/keywords_data/google_ads/search_volume/live`, US, 2026-11-23:

| Phrase | Vol/mo | Note |
| --- | --- | --- |
| what is a swing bed | 1,000 | Oct 2026 1,300; 12 months 880 to 1,300 |
| swing bed program | 210 | Oct 2026 390; 12 months 140 to 390 |
| swing bed | 5,400 | head term; Oct 2026 6,600 |
| swing bed hospital | 2,900 | Oct 2026 4,400 |
| swing bed vs snf | 50 | |
| swing bed medicare | 50 | |
| swing bed requirements | 10 | |
| **cah swing bed requirements** | **no data** | Google Ads returns null today |
| swing bed critical access hospital, swing bed nurse staffing, how long can you stay in a swing bed | no data | |

- DISAGREEMENT with the plan: the plan's "cah swing bed requirements 30" has no volume in the Ads data now. `docs/seo/keyword-gap-targets.md` row 12 gives 30 to "critical access hospital swing bed requirements", a different phrase. Use the spelled-out phrase as the secondary and do not promise the CAH-abbreviation phrase any traffic.
- GSC (`get_advanced_search_analytics`, sc-domain:simplescheduleai.com, 2026-08-23 to 2026-11-20, query contains "swing"): no rows. The site has zero swing-bed search visibility today, so this is a new-ground post, not a refresh.

## 2. SERP map

Pulled twice on 2026-11-23, DataForSEO `serp/google/organic/live/advanced` (with PAA click depth 2, about $0.01) and `.../regular` ($0.002), location 2840, "en", depth 10. The two pulls share no organic URL, so the SERP is volatile and also dual-intent (a porch "swinging bed" shows up in 2 of 9 results in pull 2).

**Pull 1 (advanced).** AI Overview citing RHIhub Rural Monitor, East Adams Rural Healthcare, CMS "Swing Bed Providers", Haskell Memorial Hospital, Grace Cottage Hospital, Kentucky Hospital Association, Rivers Health, two YouTube videos. Video pack (two Facebook hospital videos, an Advocate YouTube video from 2012). Organic: Valley County Health System (NE), Lafayette Hospital + Clinics (WI), Hospital Authority of Miller County (GA), Adams Memorial Hospital (PDF), Prague Regional Memorial Hospital (OK), Ritzville/East Adams Rural Healthcare (Feb 2025), Martin County Hospital District (Stanton, TX; a Facebook post), Franciscan Healthcare (PDF). Related searches: "Swing bed Medical", "Swing Bed rehab", "Swing bed hospital".

**Pull 2 (regular).** Taber's Medical Dictionary (twice), "Swing Bed Meaning" (porch bed or hospital program), a Spanish-language swing bed hospital page, an Instagram post, Gunnison Valley Health (May 2024), LeadingAge Michigan "Hospital Swing Beds", "What Is a Swinging Bed", Qualaris topic library (an audit form).

Every ranking result is a patient-facing hospital page, a dictionary, social media or a reference. None is an administrator or DON resource.

**(a) Table stakes.** Evidence base: pages I fetched and read (Valley County, Lafayette, Prague, Definitive HC glossary, East Adams, Haskell, Marshfield Clinic, Kansas Health System, OSF, RHIhub Rural Monitor) plus the AI Overview text. Several hospital pages (Miller County, East Adams on a second URL, LeadingAge) blocked automated fetch (403 or a WAF block), so those were read from snippets only.
- Definition as a status, not a place: a hospital bed that "swings" between acute care and skilled nursing (all ten, plus the AI Overview).
- Who it is for: recovering from surgery, stroke, illness; IV antibiotics; wound care; rehab (nine of ten).
- Services: skilled nursing, PT/OT/speech, IV therapy, wound care (nine of ten).
- Care close to home, same team, family nearby (six of ten).
- Medicare or insurance coverage mentioned (about five; usually one line). The 3-day qualifying stay is explicit on only two of the pages I read (Lafayette: "three day or longer hospitalization"; Prague: "at least three days"), so by the 3-of-10 test it is NOT table stakes, but the PAA asks "Will Medicare pay" so cover it.
- Length of stay (three of ten, all self-reported averages: Marshfield 7 to 14 days, Prague 1 to 3 weeks, OSF "no set duration").
- Difference from a skilled nursing facility: the AI Overview prompt, a PAA, and OSF only.

**(b) Gaps none of them covers.** I found none of these on any page read:
- Who staffs swing-bed patients and what the rules say (485.635(d), 485.631(a)(5)); that 483.35 is not carried over; that no federal nurse ratio exists for these patients.
- Swing beds draw from the same 25-bed pool and sit outside the 96-hour average.
- How the hospital is paid (101% of reasonable cost for a CAH versus SNF PPS for other rural hospitals) and the consequences (no MDS for a CAH, no SNF QRP data, no PBJ).
- The carried-over Part 483 list and what it adds to nursing workload (comprehensive assessment, interdisciplinary care plan with an RN and a nurse aide, discharge summary).
- Texas: the Medicaid Swing Bed Program rule with its 30-day threshold (26 TAC 554.2326).
- Scheduling a floor that mixes ED, acute and swing patients when the swing census moves (existing coverage is only a sentence in `float-pool-nursing-small-hospitals` and `nurse-staffing-models`).

**(c) Length.** Hospital pages: Valley County about 226 words, Lafayette about 204, Prague about 295, Definitive HC about 239, Haskell about 470, Marshfield about 430, Kansas Health System about 400, East Adams about 700, OSF about 1,000 (WebFetch estimates for the last five; extraction counts for the first four). RHIhub Rural Monitor is about 3,700 words (extraction count, may include comments). Typical ranking page is 200 to 700 words. Sanity range only, not a target. `check-blog.mjs` ranges: glossary 600 to 1,600, mofu 1,500 to 2,500. With the staffing and Texas sections this outline fits mofu; recommend `postType: mofu`, 1,700 to 2,300 words. If the founder wants the shorter glossary shape, drop H2s 6, 8 and 10.

**(d) People Also Ask, verbatim (pull 1; answers were async AI Overviews and were not captured):**
1. What is a swing bed at the hospital?
2. How to make a swing bed at home?
3. What is a swing down bed rail?
4. What is a swinging bed outside called?
5. How long can a person stay in a swing bed?
6. What is the difference between a SNF and a swing bed?
7. How long can a Medicare patient stay in a swing bed?
8. Is swing bed the same as rehab?
9. Will Medicare pay for a swing bed?

Items 2 to 4 are furniture queries; ignore them. Items 1, 5 to 9 map to the FAQ block.

**Intent mismatch (HYPOTHESIS, not a finding).** The primary keyword is a patient and family query; the reader we want is a DON or administrator. The post can still rank on the definition and Medicare answers, but ranking above hospital pages is unproven. Test: GSC for the page at 28 days, query "what is a swing bed" and "swing bed program", position and impressions. The administrator angle is better judged by "critical access hospital swing bed requirements" style queries, which have no measured volume. Do not report this post's traffic as acquisition (founder rule 2026-08-30).

## 3. Proposed H2 outline

Every H2 is a typed question; none says "CAH". TS = answers a table-stakes topic; GAP = owns a gap. Lead with a 40 to 60 word answer to H2 1 inside the intro.

1. **What is a swing bed?** (TS) Status, not a place. Quote SOM Appendix W: "A 'swing-bed' is a change in reimbursement status." The bed stays; the patient stays a hospital patient ("swing-bed patients are not SNF patients").
2. **Which hospitals can have swing beds?** (TS plus GAP) Rural hospitals under 100 beds (482.58) and critical access hospitals (485.645). Name both citations; the dossier and live PBJ post lean on only one of them (see Section 7).
3. **Who qualifies for a swing bed, and how long can a patient stay?** (TS; PAA 5, 7) 3 consecutive inpatient days (409.30), 100 benefit-period days with coinsurance from day 21 (409.61; medicare.gov 2026 figure), and "There is no length of stay restriction for any CAH swing-bed patient" (SOM). Keep the Medicare limit and the facility rule apart.
4. **Does Medicare pay for a swing bed, and how is the hospital paid?** (TS plus GAP; PAA 9) Patient side: SNF cost-sharing. Hospital side: 101% of reasonable cost for a critical access hospital, SNF PPS for other rural hospitals. Add: no MDS for the critical access hospital, no SNF quality reporting data.
5. **How is a swing bed different from a skilled nursing facility?** (TS plus GAP; PAA 6, 8) The eight carried-over Part 483 items, what is not on the list, the distinct-part unit as the separate case, and a one-sentence link to the PBJ post. Include "Is it the same as rehab?" here.
6. **Do swing beds count against the 25-bed limit and the 96-hour average?** (GAP) Same pool: 485.620(a). Outside the average: MLN and RHIhub. Link `critical-access-hospital-requirements` for the rest.
7. **What nursing rules apply to swing-bed patients?** (GAP, the core) 485.635(d)(1) to (4); 485.631(a)(5) with the SOM "including patients in a swing bed" line; 483.35 not on the 485.645(d) list; no federal ratio. Link `cna-patient-ratio-laws-by-state` for the ratio detail instead of repeating its table.
8. **What extra work does a swing-bed patient add for the nursing team?** (GAP) Assessment, interdisciplinary care plan, discharge summary, social services, rehab, nutrition (all from the 485.645(d) list). Say plainly which parts are the regulation and which are our reading of the workload (the workload reading is an inference; label it).
9. **How do you staff swing beds when the census moves?** (GAP) One floor mixing emergency, acute and swing patients; the swing census moves with discharges to home; link `low-census-small-hospital`, `float-pool-nursing-small-hospitals`, `nurse-staffing-models`. Any product statement here is bounded by Founder question 1 and 2.
10. **Does Texas treat swing beds differently?** (GAP) 26 TAC 554.2326 Medicaid Swing Bed Program: counties of 100,000 or less; one 30-day stay per resident per year threshold. No swing-bed text found in 26 TAC 505.2 or 505.41. See Section 7, item D2 before writing.
11. **FAQ block:** PAA 1, 5, 7, 8, 9 plus "Do swing beds file PBJ or MDS?"

## 4. Verified-facts table

"In dossier?" is checked against `docs/seo/facts-dossier.md` (greps for swing, 485.645, 485.620, 485.635, PBJ, 96). URLs are the ones fetched.

| # | Fact | Verbatim quote | URL | In dossier? |
| --- | --- | --- | --- | --- |
| 1 | Statutory basis: section 1883 of the Act = 42 U.S.C. 1395tt (ssa.gov 403; Cornell mirror, page carries "§ 1883") | "(a)(1) Any hospital which has an agreement under section 1395cc of this title may (subject to subsection (b)) enter into an agreement with the Secretary under which its inpatient hospital facilities may be used for the furnishing of services of the type which, if furnished by a skilled nursing facility, would constitute extended care services." | https://www.law.cornell.edu/uscode/text/42/1395tt | No |
| 2 | Statutory eligibility | "(b) ... The Secretary may not enter into an agreement under this section with any hospital unless, except as provided under subsection (g), the hospital is located in a rural area and has less than 100 beds." | same | No |
| 3 | Statutory CAH payment | "(a)(3) Notwithstanding any other provision of this subchapter, a critical access hospital shall be paid for covered skilled nursing facility services furnished under an agreement entered into under this section on the basis of equal to 101 percent of the reasonable costs of such services" | same | No |
| 4 | Statute names a staffing hook for social services | "(f) ... shall be required to meet those conditions applicable to skilled nursing facilities relating to discharge planning and the social services function (and staffing requirements to satisfy it)" | same | No |
| 5 | Non-CAH rural hospital swing beds: 42 CFR 482.58(a) | "(1) The facility has fewer than 100 hospital beds, excluding beds for newborns and beds in intensive care type inpatient units"; "(2) The hospital is located in a rural area. This includes all areas not delineated as 'urbanized' areas by the Census Bureau, based on the most recent census." Also (a)(3) no 24-hour nursing waiver; (a)(4) no swing-bed termination in the two years before application | https://www.law.cornell.edu/cfr/text/42/482.58 | No |
| 6 | 482.58(b) carried-over list is shorter than the CAH list: seven items (resident rights; admission, transfer, discharge; abuse; social services; discharge summary 483.20(l); specialized rehab; dental). No comprehensive assessment or nutrition item | "(5) Discharge summary ( § 483.20(l) )." | same | No |
| 7 | CAH eligibility, 485.645(a) | "(1) The facility has been certified as a CAH by CMS under § 485.606(b) of this subpart; and (2) The facility provides not more than 25 inpatient beds. Any bed of a unit of the facility that is licensed as a distinct-part SNF at the time the facility applies to the State for designation as a CAH is not counted under paragraph (a) of this section." | https://www.law.cornell.edu/cfr/text/42/485.645 (amended through 84 FR 51828, Sept. 30, 2019) | Partial (485.645(d) only) |
| 8 | CAH payment pointer, 485.645(c) | "Payment for post-hospital SNF-level of care services is made in accordance with the payment provisions in § 413.114 of this chapter." | same | No |
| 9 | **Current 485.645(d) list.** Intro: "The CAH is substantially in compliance with the following SNF requirements contained in subpart B of part 483 of this chapter:" (1) Resident rights (483.10(b)(7), (c)(1), (c)(2)(iii), (c)(6), (d), (e)(2) and (4), (f)(4)(ii) and (iii), (g)(8) and (17), (g)(18) introductory text, and (h)); (2) Admission, transfer, and discharge rights (483.5 definition of transfer and discharge, 483.15(c)(1) to (5), (7), (8), (9)); (3) Freedom from abuse, neglect and exploitation (483.12(a)(1), (a)(2), (a)(3)(i), (a)(3)(ii), (a)(4), (b)(1), (b)(2), (c)(1) to (4)); (4) Social services (483.40(d)); (5) Comprehensive assessment, comprehensive care plan, and discharge planning (483.20(b), 483.21(b) and (c)(2)); (6) Specialized rehabilitative services (483.65); (7) Dental services (483.55(a)(2) to (5) and (b)); (8) Nutrition (483.25(g)(1) and (g)(2)) | "(8) Nutrition ( § 483.25(g)(1) and (g)(2) of this chapter)." | same | Partial: dossier says 483.35 is not on the list; the eight items are not listed |
| 10 | The (d)(5) carve-out that answers the MDS question | "except that the CAH is not required to use the resident assessment instrument (RAI) specified by the State that is required under § 483.20(b), or to comply with the requirements for frequency, scope, and number of assessments prescribed in § 413.343(b)" | same | No |
| 11 | What the 2019 rule removed from the swing-bed lists (read in the final rule's summary) | "We are removing the cross-reference to Sec. 483.24(c) at Sec. 482.58(b)(4) ... and Sec. 485.645(d)(4) ... requiring that the facility provide an ongoing activity program"; also removed: the 483.10(f)(9) cross-reference, 483.70(p) (full-time social worker above 120 beds) and 483.55(a)(1) (routine and 24-hour emergency dental care) | https://www.govinfo.gov/content/pkg/FR-2019-09-30/html/2019-20736.htm (84 FR, Sept. 30, 2019, "Hospital and CAH Swing-Bed Requirements"; page number not captured) | No |
| 12 | 25-bed pool shared | "Inpatient beds may be used for either inpatient or swing-bed services." | https://www.law.cornell.edu/cfr/text/42/485.620 | **Yes** (line 78) |
| 13 | 96-hour average excludes swing-bed time (CMS source for the dossier's nuance) | "CAHs don't include time spent providing skilled nursing swing bed services in their required 96-hour annual average length of stay calculation." | https://www.cms.gov/files/document/mln006951-swing-bed-services.pdf (MLN006951, May 2025); RHIhub corroborates: "Time spent in a CAH swing bed" is listed among items not included | Partial (the nuance yes; the CMS source no) |
| 14 | CAH swing-bed payment, CMS wording | "We exempt CAH swing bed services from the SNF PPS and pay them based on 101% of reasonable cost of the services." Non-CAH: "We pay hospitals offering swing bed SNF-level services (excluding CAHs) under the SNF Prospective Payment System (PPS)." | MLN006951 above; also https://www.cms.gov/medicare/payment/prospective-payment-systems/skilled-nursing-facility-snf/swing-bed-providers (page last modified 07/23/2026) | No |
| 15 | CAH payment, regulation | "Posthospital SNF care furnished in general routine inpatient beds in CAHs is paid based on reasonable cost for cost reporting periods beginning on or after July l, 2002 and before January 1, 2004, and is paid based on 101 percent of reasonable cost for cost reporting periods beginning on and after January 1, 2004" (413.114(a)(2)); non-CAH rural hospitals "in accordance with the provisions of the prospective payment system for SNFs" | https://www.law.cornell.edu/cfr/text/42/413.114 | No |
| 16 | 3-day qualifying stay | "Have been hospitalized in a participating or qualified hospital or participating CAH, for medically necessary inpatient hospital or inpatient CAH care, for at least 3 consecutive calendar days, not counting the date of discharge" (409.30(a)(1)); "Posthospital SNF care, including SNF-type care furnished in a hospital or CAH that has a swing-bed approval, is covered only if the beneficiary meets the requirements of this section" | https://www.law.cornell.edu/cfr/text/42/409.30 ; MLN: "We require a 3-consecutive-day inpatient hospital or CAH stay before admitting a Medicare patient to a swing bed in any hospital or CAH." | No |
| 17 | Benefit period | "(b) Posthospital SNF care furnished by a SNF, or by a hospital or a CAH with a swing-bed approval. Up to 100 days are available in each benefit period after discharge from a hospital or CAH. For the first 20 days, Medicare pays for all covered services. For the 21st through 100th day, Medicare pays for all covered services except for a daily coinsurance amount that is the beneficiary's responsibility." | https://www.law.cornell.edu/cfr/text/42/409.61 | No |
| 18 | Patient cost (date-sensitive) | "Days 21–100: You pay $217 each day ($222 in 2027). ... Part A limits SNF coverage to 100 days in each benefit period." Also "Swing bed services are provided when a hospital or critical access hospital with a Medicare agreement 'swings' its beds and provides either acute hospital or SNF-level care, as needed." | https://www.medicare.gov/coverage/skilled-nursing-facility-snf-care ; https://www.medicare.gov/coverage/swing-bed-services | No |
| 19 | MDS: non-CAH versus CAH | "Non-CAH swing bed hospitals are required to complete the MDS assessment to meet this requirement." For CAHs: "There is no requirement for a CAH to use the MDS form for recording the patient assessment or for nursing care planning." (SOM Appendix W, C-1600 guideline) | CMS Swing Bed Providers page above; https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/downloads/som107ap_w_cah.pdf (Rev. 247 header; swing-bed tags Rev. 200). MDS = the RAI is my pairing from the CMS page, which says the SNF PPS "relies on information from a resident assessment instrument" and then requires non-CAH hospitals to "complete the MDS assessment" | No |
| 20 | SNF quality reporting | "According to the FY 2016 SNF PPS final rule (80 FR 46429), critical access hospitals (CAHs) with swing beds are not required to submit quality data under the SNF QRP." "Note: Non-CAH swing beds are subject to SNF QRP requirements." | https://www.cms.gov/files/document/pac-snf-quickreferenceguide-20260423.pdf (read as extracted; the 80 FR rule itself not read) | No |
| 21 | Swing-bed patients belong to the hospital | "Swing-bed patients receive a SNF level of care, and the CAH is reimbursed for providing a SNF level of care, however swing-bed patients are not SNF patients. Swing-bed patients in CAHs are considered to be patients of the CAH." Also "There is no length of stay restriction for any CAH swing-bed patient." and "Swing-beds need not be located in a special section of the CAH." | SOM Appendix W, C-1600 interpretive guidelines (URL above) | No |
| 22 | RN provides or assigns, and supervises | 485.635(d)(1): "A registered nurse must provide ( or assign to other personnel) the nursing care of each patient, including patients at a SNF level of care in a swing-bed CAH. The care must be provided in accordance with the patient's needs and the specialized qualifications and competence of the staff available." (d)(2): "A registered nurse or , where permitted by State law, a physician assistant , must supervise and evaluate the nursing care for each patient, including patients at a SNF level of care in a swing-bed CAH." (d)(3) drugs and IVs by or under an RN, MD/DO or (where State law permits) PA; (d)(4) "A nursing care plan must be developed and kept current for each inpatient." | https://www.law.cornell.edu/cfr/text/42/485.635 (last amended 87 FR 72309, Nov. 23, 2022) | **Yes** (lines 58 to 63, 878) |
| 23 | Licensed nurse on duty covers swing-bed patients (SOM, not the CFR text) | CFR 485.631(a)(5): "A registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients." SOM C-1046 guideline: "...whenever the CAH has one or more inpatients (including patients in a swing bed receiving long term care services)." | https://www.law.cornell.edu/cfr/text/42/485.631 ; SOM Appendix W | Partial (485.631(a)(5) yes; the SOM swing-bed gloss no) |
| 24 | SOM on sufficiency and schedules | "Staffing schedules must be reviewed and revised as necessary to meet patient care needs and to make adjustments for nursing staff absenteeism." and "A registered nurse must either provide directly, or assign to other staff, the required nursing care for each CAH patient, including patients receiving swing bed services." | SOM Appendix W, C-1046 | No |
| 25 | 483.35 (nursing services) is not carried over: confirmed by reading all eight items in row 9 and 483.35's own text | 483.35(a)(1): "The facility must provide services by sufficient numbers of each of the following types of personnel on a 24-hour basis to provide nursing care to all residents in accordance with resident care plans" | https://www.law.cornell.edu/cfr/text/42/483.35 | **Yes** (line 694) |
| 26 | Workload items that DO carry over | 483.20(b)(1)(xviii): "The assessment process must include direct observation and communication with the resident, as well as communication with licensed and nonlicensed direct care staff members on all shifts." 483.21(b)(2)(ii): care plan "Prepared by an interdisciplinary team, that includes but is not limited to— (A) The attending physician. (B) A registered nurse with responsibility for the resident. (C) A nurse aide with responsibility for the resident." SOM reproduces the 7-day care-plan and 14-day, significant-change and 12-month assessment timeframes for swing beds and notes "The timeframes prescribed in § 413.343(b) of this chapter do not apply to CAHs." (read in the SOM reproduction; 483.21(b)(2)(i) "7 days" not separately read at Cornell) | https://www.law.cornell.edu/cfr/text/42/483.20 ; .../483.21 ; SOM C-1620 | No |
| 27 | Nutrition and rehab items | 483.25(g)(1) "Maintains acceptable parameters of nutritional status, such as usual body weight or desirable body weight range and electrolyte balance, unless the resident's clinical condition demonstrates that this is not possible or resident preferences indicate otherwise"; (g)(2) "Is offered sufficient fluid intake to maintain proper hydration and health". Therapeutic diet is (g)(3), which is NOT on the list. 483.65(a): the facility must "(1) Provide the required services; or (2) ... obtain the required services from an outside resource" | https://www.law.cornell.edu/cfr/text/42/483.25 ; .../483.65 | No |
| 28 | Texas Medicaid Swing Bed Program | "HHSC operates the Medicaid Swing Bed Program for rural hospitals located in counties with populations of 100,000 or less." "...HHSC makes payment to the hospital using the same procedures and the same Resource Utilization Group daily rates that the Texas Health and Human Services Commission authorizes for reimbursing NFs" (a); "(f) ... if the rural hospital's swing beds are used for more than one 30-day length of stay per year, per resident the hospital must comply with the full Nursing Facility Requirements." (g) full-time licensed nursing facility administrator above that threshold; (h) staff development requirement (554.1929) satisfied only if "no more than one 30-day length of stay per year, per resident"; (c) must hold a Medicare swing-bed certification | https://law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-554-2326 (history line: amended eff. 12/6/2022) | No |
| 29 | No swing-bed text in Texas hospital licensing | Zero hits for "swing" in 26 TAC 505.1, .2, .21, .22, .41 to .49 (13 pages, Cornell LII, text-searched). This is a negative finding on those sections only, not the whole of chapter 505 | https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41 and siblings | No |
| 30 | Prevalence (only number found) | "According to Critical Access Hospital Measurement and Performance Assessment System (CAHMPAS) Data Summary , 64.3% of Critical Access Hospitals managed Rural Health Clinics and 36.2% provided skilled nursing care in 2021." The page does not use the word swing for this figure. | https://www.ruralhealthinfo.org/topics/critical-access-hospitals | Used in the PBJ post with a gloss the page does not support (see Section 7, D4) |
| 31 | Context from RHIhub (WebFetch paraphrase, short quotes only) | Rural Monitor, 2021-08-11, Kay Miller Temple: a swing bed is "a change in reimbursement status" (citing CMS); one Illinois CAH network report: 17 of 48 responding CAHs (35%) had swing-bed revenue above 20% of total inpatient revenue. Re-read before quoting: this came through WebFetch, not extraction | https://www.ruralhealthinfo.org/rural-monitor/swing-beds | No |

## 5. Existing coverage on the site (link, do not repeat)

- `cna-patient-ratio-laws-by-state` (live): section "Do Swing Beds Count as Nursing Home Beds for Staffing?" with the full carried-over versus not-carried-over table, the 485.631(a)(5) sentence, the distinct-part unit, and a FAQ answer. The new post should state the list once in prose and link there for the ratio question.
- `cms-pbj-reporting-scheduling-software` (live): the one-question PBJ test, 36.2% figure, distinct-part unit, MDS exemption in one clause. Link, do not rebuild.
- `critical-access-hospital-requirements` (live): 96-hour average and "Swing-bed days ... count within the 25-bed cap but sit outside the acute-care average." The new post's H2 6 should be two sentences plus a link.
- `nurse-staffing-models` (live): 485.635(d) provide-or-assign and supervise, with swing-bed patients named.
- `low-census-small-hospital`, `float-pool-nursing-small-hospitals`, `what-is-a-critical-access-hospital`: each carries one swing-bed sentence only.
- The SERP gap table: none of those posts defines a swing bed, covers Medicare and payment, the MDS, or Texas Medicaid. That is the new post's space.

## 6. Product facts (no web; `docs/seo/product-capability-inventory-2026-08.md`, `docs/ops/service-runbook.md`)

- The product has no swing-bed concept: `grep -n -i swing` on the inventory finds only the unrelated word "swing" at line 115, and the runbook has no swing-bed entry.
- The one related feature (inventory section 3.6, mode applicability row "BOTH", claimable either way as engine behaviour): census bands map a patient-count range to required RNs, LPNs, CNAs and charge nurses per unit; the manager sets a per-shift tier (Blue, Green, Yellow, Red) at `/census`; the tier adds extra required staff and the generator honours it. In service mode the description is "census and acuity tiers driving required staff".
- Section 6 absences that bite here: no per-patient acuity scoring beyond the four-tier band; no forecasting or predictive census (item 18); `sitterCount` is a STUB with no effect; low-census execution is not in the software (section 5.5).
- Runbook R2 (low census, written, claimable, founder-confirmed 2026-11-18): the nurse manager tells us the census has changed; we return revised schedule options the same business day; nothing changes until the manager approves; on the shift itself the charge nurse sends someone home under the hospital's own order. R2's "do not widen" rule: never write that the software flags overstaffed shifts or suggests who to send home. R1 (fairness record) is not relevant to swing beds.
- What this means for the post: we can honestly describe the staffing rules and how a swing-bed patient changes the census a floor is staffed to. Whether swing-bed patients are counted in the census tier or band is not written down anywhere. See Founder questions.

## 7. Disagreements with the dossier and live posts, and things to fix

- **D1 (none on the core quotes).** The dossier's 485.620(a), 485.635(d)(1) and (d)(2), 483.35-not-on-list and PBJ wording all match the source text I read. No change needed to those rows.
- **D2 (Texas overlay, needs a decision).** The dossier line "CAH swing beds are NOT nursing home beds for staffing" (and the CNA post's "No") is true of the federal list in 485.645(d). Texas adds 26 TAC 554.2326 for hospitals in the Texas Medicaid Swing Bed Program: past one 30-day stay per resident per year, the hospital "must comply with the full Nursing Facility Requirements", and the administrator and staff-development rules switch on at the same threshold. Whether those "full Nursing Facility Requirements" include 554.1002 (the dossier's "one licensed nursing staff person for each 20 residents or a minimum of .4 licensed-care hours per resident day") is an INFERENCE I have not tested. Test: read 26 TAC 554.1002 and Chapter 554's scope sections at Cornell, then ask HHSC (the HHSC website itself was not checked). Until then write only the 554.2326(f) sentence, scoped to hospitals in that program, and never "Texas swing beds follow nursing home staffing rules".
- **D3 (wrong citation in a live post).** `cms-pbj-reporting-scheduling-software` line 58 and its Sources list say swing beds operate under the hospital's "42 CFR 482.58" certification. 482.58 governs non-CAH rural hospitals; critical access hospitals are under 485.645. (485.606(a)(2) mentions 482.58 for designation, which may be how it crept in.) A CAH reader would be sent to the wrong section.
- **D4 (overstated gloss in a live post).** The same post says "36.2% of Critical Access Hospitals had an active skilled-nursing (swing) census in 2021, per CAHMPAS data reported by RHIhub" and, just before, calls swing-bed care how "the large majority" of CAHs deliver skilled nursing. The RHIhub sentence says "provided skilled nursing care in 2021" with no "swing" and no "active census", and 36.2% is not a large majority.
- **D5 (wording rule).** `what-is-a-critical-access-hospital` line 42: "Because those swing beds are exempt, most CAHs do not file CMS Payroll-Based Journal data". Dossier rule is to scope to PBJ in the same sentence ("exempt from PBJ"). It is arguably scoped by context; flag for the next sweep.
- **D6 (stale CMS text).** SOM Appendix W's regulatory-authority summary for swing beds (around its swing-bed survey module) still lists "Patients Activities" among the CAH swing-bed requirements, but the current 485.645(d) has no activities item (removed by the 2019 rule). Do not cite the SOM summary list for the 485.645(d) content; cite the CFR.
- **D7 (statutory cite).** MLN006951 attributes swing-bed authority to "Section 1861(e) of the Social Security Act", while 413.114(a) and the Cornell notes use section 1883. Cite 1883 for the agreement and payment rule.
- **D8 (volume).** See Section 1: "cah swing bed requirements" has no Ads volume today.

## 8. "Wrong, never write" list

Seen circulating, with where:
1. "Swing Bed services are unique to Critical Access Hospitals" (Lafayette Hospital + Clinics, SERP snippet, 2026-11-23). Wrong: rural non-CAH hospitals under 100 beds qualify under 482.58 and 1395tt(b).
2. Treating a swing bed as a unit or place ("What is a Swing Bed Unit?", McLeod Health page title in WebSearch results). SOM: "Swing-beds need not be located in a special section of the CAH."
3. "Most Medicare Advantage plans don't participate in swing bed programs" (Valley County Health System news item, 2023-era) versus "Medicare and most Medicare Advantage plans" cover it (Miller County snippet). They contradict; I could not verify either. Write nothing about Medicare Advantage.
4. "CAHs with swing beds ... must report data on certain measures of quality to Medicare through the SNF Quality Reporting Program" (data.medicare.gov widget snippet in a WebSearch result, not opened). It contradicts CMS's April 2026 quick reference guide (row 20). Do not write either direction without reading 80 FR 46429.
5. The 36.2% figure as "swing census" or as proof a "large majority" use swing beds (own PBJ post; see D4).
6. Self-reported stay averages ("7 to 14 days", "1 to 3 weeks") presented as a rule. The rule is: no length-of-stay restriction for a CAH swing-bed patient (SOM), Medicare covers up to 100 days per benefit period (409.61).

Guardrails drawn from the sources (not seen circulating, but each is an easy slip):
7. A bare "swing beds are exempt" or "exempt from staffing rules." Write "the nursing services standard (483.35) is not on the 485.645(d) list" and "exempt from PBJ" (dossier). 485.635(d)(1) names swing-bed patients explicitly.
8. "A swing-bed-only hospital" (dossier founder correction 2026-08-31).
9. "Swing beds are paid under the SNF PPS" for a CAH. CAH: 101% of reasonable cost (MLN; 413.114(a)(2)). Non-CAH rural hospitals: SNF PPS.
10. "CAH swing beds must complete the MDS." CAH: no (485.645(d)(5); SOM). Non-CAH: yes (CMS page). Still a comprehensive assessment and care plan are required; do not write "no assessment".
11. "Swing beds need an activities program or a full-time social worker." Both references were removed in 2019. Social services (483.40(d)) remains.
12. "Swing beds are exempt from the 25-bed cap or the 96-hour average." Same pool of 25 beds; swing-bed time is outside the 96-hour average only.
13. "Swing-bed patients are SNF patients." SOM: they "are not SNF patients" and are patients of the CAH. A distinct-part SNF unit is a different entity.
14. "A swing bed can be an ICU bed or a bed in a distinct-part unit." MLN: not ICU, newborn or distinct-part rehab or psychiatric beds. (MLN says that list for approved swing-bed hospitals in general; for CAHs it separately says a CAH "may not use a bed within these units for swing bed services".)
15. Quoting the patient coinsurance without a year. $217 a day is the 2026 figure ($222 in 2027).
16. "Texas swing-bed hospitals follow nursing home staffing rules", or the opposite, until D2 is resolved.
17. The Texas citation "25 TAC 133" (dossier: moved to 26 TAC chapter 505 on 2025-01-31).
18. Anything about the software handling swing-bed patients, flagging swing census, or forecasting (inventory section 6).

## 9. Recommended internal links (all checked: `draft: false`, publishDate on or before 2026-11-18)

- `/blog/cna-patient-ratio-laws-by-state` (2026-08-21): swing beds and ratios; main contextual link from H2 5 and 7.
- `/blog/cms-pbj-reporting-scheduling-software` (2026-06-26): H2 5 (PBJ and the distinct-part unit).
- `/blog/critical-access-hospital-requirements` (2026-07-06): H2 6 (25 beds, 96 hours).
- `/blog/what-is-a-critical-access-hospital` (2026-06-20): H2 2 (what the designation is).
- `/blog/nurse-staffing-models` (2026-08-28): H2 7 (provide or assign, supervise).
- `/blog/joint-commission-nurse-staffing-standards` (2026-08-24): H2 7 (485.631(a)(5)).
- `/blog/low-census-small-hospital` (2026-11-18): H2 9 (when the swing census drops).
- `/blog/float-pool-nursing-small-hospitals` (2026-07-03): H2 9 (cross-training across ED, swing and med-surg).
- `/blog/critical-access-hospitals-in-texas` (2026-09-04): H2 10 (which Texas hospitals this affects; the list does not say which have swing beds).
- `/critical-access-hospital-scheduling` (page, pillar), and `/articles/critical-access-conversion-nurse-staffing` (draft false, 2026-08-31) only if the conversion angle fits.

Inbound: after publish, add links to the new post from `cna-patient-ratio-laws-by-state`, `cms-pbj-reporting-scheduling-software` and `critical-access-hospital-requirements`.

## 10. NOT VERIFIED (everything I could not confirm)

- ssa.gov section 1883 text: 403. Read at the Cornell mirror of 42 U.S.C. 1395tt only.
- Medicare Benefit Policy Manual chapter 8: the cms.gov URL I tried was 404, and the mirrors found by search were not opened. Coverage facts above come from the CFR, MLN and medicare.gov.
- Medicare Advantage coverage of swing beds: two pages contradict; no primary source read.
- Daily skilled-need standard (42 CFR 409.31) and the "5 days a week" therapy claim on patient pages: not read.
- Whether "full Nursing Facility Requirements" in 26 TAC 554.2326(f) brings in 554.1002 staffing numbers: inference only (D2).
- Current Texas Medicaid swing-bed payment method: 554.2326(a) as published at Cornell (amended eff. 2022-12-06) names RUG daily rates; a May 2024 and July 2025 Texas Register proposal about PDPM-based or reimbursement changes surfaced in search snippets and I could not confirm adoption (texreg.sos.state.tx.us does not resolve here; hhs.texas.gov and TMHP pages were not opened).
- Any Texas licensing rule specific to hospital swing beds: none found in 13 chapter 505 sections (row 29); the rest of chapter 505 not searched.
- How many Texas hospitals run swing beds, and any Flex Monitoring Team or HRSA swing-bed share: not found. Only the RHIhub 36.2% skilled-nursing figure exists, with the wording problem in D4.
- SNF QRP exemption: read only in the CMS quick reference guide, not in the 80 FR 46429 rule text.
- Exact page number of the 2019 swing-bed paragraph in 84 FR (the extraction places it near page 51735 to 51736).
- Page-by-page word counts for Miller County, East Adams (second URL), LeadingAge: blocked.

## Founder questions

No interview debrief exists in the repo (`find` for debrief files returns nothing; only `docs/strategy/INTERVIEW-QUESTIONS.md`), so I ask no interview question.

1. **Product.** Is a swing-bed patient counted in the census that sets the daily census tier or census band when we build a hospital's schedule, and may the post say so? Facts I can state: the software has no swing-bed concept; census bands and the Blue/Green/Yellow/Red tier map a patient count to required staff per unit; the inventory records no per-patient acuity and no forecasting; the written routine R2 covers "the census has changed" but does not mention swing beds. Why it matters to the reader: a Texas floor mixes emergency, acute and swing patients, so "who counts as census" decides the staffing number. If the answer is "I don't know" or "not yet written": the post says nothing about how swing-bed patients enter our census, and talks only about the regulation and what the nurse manager should tell the scheduling team.
2. **Product.** When a swing-bed admission or discharge changes the census, is that a message under R2 ("the nurse manager tells us the census has changed", same business day), and does onboarding ask how many beds are used as swing beds? Why it matters: it would let the post end with one honest, runbook-backed sentence for a swing-bed hospital. If "no" or "unknown": the post gets no service sentence in the swing-bed staffing section, and any mention of the service stays in the standard end block.
3. **Founder view.** Should the post take a position on how to staff swing-bed patients (for example "count them like any other occupied bed on the floor, because 485.635(d) gives them the same RN duty"), given the federal rules set no ratio and Texas hospital licensing sets "adequate numbers" with no numeric ratio? Why it matters: this is the one place the post could be more than a definition. It is an opinion, so it must be written as his. If "I don't know": the post states the rules, says there is no federal ratio for swing-bed patients, and leaves the staffing decision to the Director of Nursing.
4. **Founder view.** Texas Medicaid's swing-bed rule (26 TAC 554.2326) says a hospital in the program that keeps a resident past one 30-day stay a year "must comply with the full Nursing Facility Requirements". Do you want the post to surface this, and do you approve adding a Texas qualifier to the standing dossier line "CAH swing beds are NOT nursing home beds for staffing" (and to the CNA post)? Why it matters: it is the one Texas-specific swing-bed staffing trigger found, and the published line currently has no Texas caveat. If "I don't know": the post mentions the 30-day sentence in one scoped sentence with a "confirm with HHSC" note, and the dossier change is queued until 554.1002 has been read.

### Founder answers (2026-11-23)

1. **Census tier.** ANSWERED: don't claim anything about how swing-bed patients enter our census.
2. **Routine.** ANSWERED: yes, a swing admission or discharge that changes the census goes through the existing low-census routine R2 (the nurse manager tells us, and we send revised options for approval the same business day). The founder asked: "only if it makes sense". It does, because R2 is scoped to "the census has changed" and is not limited to low census.
3. **Our Take.** ANSWERED: staff swing-bed patients like any occupied bed, "only if it makes sense". It does: they come from the same 25-bed pool (485.620(a)) and carry the same RN duty (485.635(d)(1)). Plan for the extra items in 485.645(d), such as the comprehensive assessment, care plan, discharge planning and social services.
   The founder also asked whether swing beds need their own unit, like ICU. Answer given: no. A swing bed is a status on an ordinary bed, cared for by the same nurses. Only a separately certified skilled nursing unit with its own staff would be a separate unit. (Multi-unit scheduling is not demo-able anyway, inventory item 5.)
4. **Texas 30-day rule.** ANSWERED: surface it in one scoped sentence with "confirm with HHSC". Add a Texas caveat to the dossier line and to the CNA post.
