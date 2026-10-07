# Brief: JAMA Network Open, Texas rural hospital closures and mortality (Newsroom)

Brief, 2026-10-07. Load `.claude/skills/trendjacking-articles.md` before drafting.

## 1. Verified study facts

Read from the full text and Supplement 1 via Europe PMC (PMC13621260); jamanetwork.com 403s our tools. Poisler MA, Gujral K. JAMA Netw Open. 2026;9(9):e2636325, published September 28, 2026.

- **License: CC-BY-NC-ND, not CC-BY.** It "does not permit alteration or commercial use". Quote briefly with attribution; describe and link the maps and tables, never reproduce them.
- **Design** (Abstract): "county-year cohort study ... 2 complementary difference-in-difference study designs with data from January 1, 2006, to December 31, 2019." Closures 2007 to 2018. 2020 excluded for COVID.
- **Counties** (Results, Analytic Sample): "Of all 254 Texas counties ... a total of 79 were excluded for suppressed death count in CDC WONDER. None of the excluded counties was a closure county." eTable 3: dropped if any year had "fewer than 10 observations". Excluded counties averaged **4,439 people** (included 148,168); 92.4% rural vs 60.0%.
- **Closures**: "all 14 rural hospital closures (approximately 8% of rural hospitals in Texas)". Conversions to outpatient or ER-only sat in the control group.
- **Conditions** (Outcome): AMI, stroke, sepsis, asthma or COPD, as deaths per 100,000 residents.
- **Main estimates** (Primary Analysis, Table 3):
  - Adjacent-county design (71 treated, 104 control): "11.60 (95% CI, 4.62-18.58) ... (P = .001)".
  - HSA design (53 treated, 122 control): "11.52 (95% CI, 0.46-22.58) ... (P = .04)".
  - Both are "a 5.4% increase compared with baseline mortality in affected counties."
- **5.4% denominator**: Table 3 divides by the unprinted "preclosure mean ... in the treatment group". Do not recompute from Table 1's 2006 baseline (225.4 gives 5.1%). Key Points rounds to "5%"; use 5.4%.
- **Weaker results to report honestly**:
  - Callaway-Sant'Anna estimator, adjacent design: "12.89 [95% CI, −0.39 to 26.17] ... P = .06", not significant.
  - HSA design without the closure counties: "9.54 ... P = .16", not significant.
  - Adjacent design without the closure counties: "10.46 [95% CI, 2.81-18.11] ... P = .008", so neighbouring counties were affected.
- **The 6.85 is not a main estimate.** It comes from the Stansberry et al definition, which also counts trauma, unintentional injury, poisoning and self-harm. In the adjacent design it is "6.85 (95% CI, −2.31 to 16.01)", and in the HSA design it is −3.36. Neither is significant. The acute-only Jiang definition gave 8.21 (2.08 to 14.34): the link holds for acute emergencies, not injuries.
- **Limitations** (verbatim): residual confounding because they "could not adjust for more granular patient-level or health system differences". The excluded counties "were more rural and smaller ... which limits generalizability to the most remote communities". "we could not isolate the exact mechanisms". Results "may be conservative or downward biased".
- **CAH, staffing, EMS**: no mention of critical access hospitals, nurses or staffing. EMS and clinicians appear only in the Introduction, citing other studies: "lengthened emergency medical services transport times ... and accelerated clinician outmigration". Discussion's possible drivers ("transport delays, overcrowding at nearby hospitals ...") were not measured.

## 2. Which hospitals closed

Yes, Supplement eTable 1 names all 14. The UNC Sheps Center tracker ("Updated 12/4/25", read 2026-10-07) "Medicare Payment" column marks **3 of the 14 as CAHs**:

- Good Shepherd Medical Center, Linden (2014, 25 beds)
- Hunt Regional Community Hospital of Commerce (2015, 24 beds)
- Little River Healthcare Rockdale (2018, 25 beds)

The other 11 were PPS or MDH. Sheps' 3 Texas conversions in those years (Wise Bridgeport, ETMC Mount Vernon, Stamford) were excluded. Never state a Sheps Texas total (dossier rule).

## 3. SERP and demand

- `npm run keyword-check`: "rural hospital closure mortality" and "what happens when a rural hospital closes" are clear. "rural hospital closures texas" warns on word overlap with `/blog/rural-texas-hospital-nurse-scheduling-2026`.
- DataForSEO: "rural hospital closures" 1,000/mo, KD 38, down 55% year on year; "texas rural hospital closures" 10/mo, KD 19; no volume data for the mortality or "what happens" phrasings.
- **Primary keyword: "rural hospital closure mortality". Secondary: "rural hospital closures texas".** Both SERPs are thin and old: CMS 1995, NBER/Health Affairs 2019, D Magazine 2018, Becker's 2018, and a 2024 AHA abstract (P224, Texas).
- No news outlet has covered the study (WebSearch, 2026-10-07). (Becker's "closures increase mortality" hit is the 2019 California study.)

## 4. The hook (illustrative; shows an association, not a cause)

Formula: 11.60 x county population / 100,000 = extra deaths a year. Populations are Census Vintage 2024 estimates. Cite QuickFacts.

- **Limestone County** (Limestone Medical Center, Groesbeck, 20-bed CAH), 22,569 people: 11.60 x 22,569 / 100,000 = **2.6 a year** (CI 1.0 to 4.2), about 10 over the four years.
- **Hamilton County** (Hamilton General Hospital, 25 beds), 8,644 people: 11.60 x 8,644 / 100,000 = **about 1 a year** (CI 0.4 to 1.6).

Caveat, stated plainly: counties with too few deaths to report were dropped. They averaged 4,439 people and cover much of West Texas and the Panhandle (Figure 1). For a hospital in one of them the study says nothing either way, which is not a finding of no effect. The maps have no county labels: never claim a named county was in the sample.

## 5. Accuracy guardrails

- Association, not cause. Never write "closures killed".
- The study shows nothing about nurse staffing or any effect specific to CAHs. 11 of the 14 closures were not CAHs.
- Data ends 2019: before COVID, REHs and the 2026 Medicaid freeze.
- Arithmetic in the same sentence as every number. Any "neighbours carry the load" claim cites 10.46 and says the mechanism was not measured.
- No product H2. Footer note only (nothing we sell keeps a neighbour open), carrying the pillar and /how-it-works links.

## 6. Proposed piece

- **Title:** "Do More People Die When a Rural Texas Hospital Closes? What a New JAMA Study Found"
- **Excerpt:** "After 14 rural Texas hospitals closed, deaths from heart attack, stroke, sepsis and COPD rose about 12 per 100,000 a year, next door as well as in the closure county."
- **Key Takeaways:** 11.60 and 11.52 extra deaths per 100,000 a year (5.4%); neighbouring counties too (10.46); 3 of 14 closures were CAHs; smallest counties excluded; association, not cause.
- **H2s:**
  - What Did the JAMA Study on Texas Rural Hospital Closures Find?
  - Which Texas Hospitals Closed?
  - How Many Extra Deaths Is That for a Small Texas County?
  - Why Were the Smallest Texas Counties Left Out?
  - Does a Neighbouring Hospital Closure Affect Your Emergency Room?
  - What Does the Study Not Prove?
- **What to Do This Week:**
  - List the hospitals in your EMS and transfer radius and check them against the Chartis vulnerable list (Texas 50).
  - Re-read your AMI, stroke and sepsis protocols against C-0896, and confirm which staff you named for annual training.
  - Ask your EMS director how run times change if your nearest neighbour closes.
  - Check who covers the ER on nights and weekends if volume rises.
- **FAQ:** Did the closures cause the deaths? Were any CAHs? Does it apply to frontier counties? What is a difference-in-differences study? Have other states seen this (California, NBER 2019)?
- **Sources:**
  - https://doi.org/10.1001/jamanetworkopen.2026.36325
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC13621260/
  - https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/
  - https://www.chartis.com/insights/2026-rural-health-state-state
  - Census QuickFacts pages for Limestone and Hamilton counties
- **Internal links out:** the four live articles (rural-hospital-losses, critical-access-conversion, rural-emergency-hospital-bill, texas-medicaid-freeze), /articles/cms-c-0896-emergency-protocols-critical-access-hospitals, /blog/critical-access-hospitals-in-texas, /blog/rural-texas-hospital-nurse-scheduling-2026.
- **Should link in:** /articles/rural-hospital-losses-nurse-staffing-cost (vulnerable-50 section) and /blog/critical-access-hospitals-in-texas.

## 7. Open questions

1. CC-BY-NC-ND: embed the map or link only? Default link.
2. Is AHA abstract P224 (2024) a precursor? Check authors first.
3. Were Limestone and Hamilton in the sample? Calc stays illustrative regardless.
4. Name the three CAH closures? Founder call on tone.
5. Add the study, 3-of-14 split and 4,439 figure to `docs/seo/facts-dossier.md` when drafting.
