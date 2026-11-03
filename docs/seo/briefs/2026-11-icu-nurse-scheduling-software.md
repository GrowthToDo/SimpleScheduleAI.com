# Research brief: Best ICU Nurse Scheduling Software (rewrite of `best-scheduling-software-icu-nurses.md`)

- Post type: bofu. Old draft (`src/data/post/best-scheduling-software-icu-nurses.md`, draft: true) is NOT a source. Reuse no fact from it.
- Brief date: 2026-11-03. Every fact below carries its URL and check date. "VERBATIM" marks a quoted string. WebFetch passes pages through an extraction model, so spot-check any VERBATIM line in a real browser before it goes into the post.
- **Status: COMPLETE.** Research was split across four agents (vendor groups x3, ICU primary sources x1) plus my own DataForSEO, SERP, GSC and corpus work. I spot-checked the load-bearing agent claims myself on 2026-11-03: the symplr rename, In-House's ICU line, AACN Standard 7 and the Joynt 2011 CAH ICU figure. All four matched. Everything else from the agents is labelled "(agent)".
- **Dossier updates are owed** (this task was read-only for the dossiers). See section 6.

---

## 0. Verdict up front

- **FINDING (DataForSEO Google Ads + Labs, US/English, pulled 2026-11-03): no measurable search demand exists for any "ICU + scheduling software" phrasing.** All nine software/skill phrasings returned no volume.
- **FINDING (DataForSEO SERP, 2026-11-03): Google does not treat "icu nurse scheduling software" as its own intent.** The top 10 is generic nurse-scheduling directories and thin vendor blogs. None of the results is an ICU-specific page.
- Consequence: this post cannot be justified on search demand. It can only be justified as (1) a citable answer for LLM prompts like "best ICU nurse scheduling software for a small hospital", and (2) a sales asset for CAHs that run a small ICU or special-care unit. **Most CAHs have no ICU.** The newest peer-reviewed figure is 380 of 1,268 CAHs (30.0%), from 2008-2009 data (Joynt et al., JAMA 2011; section 4.4). No current count exists. Founder decision needed: publish, merge into an existing post, or reframe (options in section 2d).

---

## 1. Demand

Source: DataForSEO `keywords_data/google_ads/search_volume/live`, `dataforseo_labs/google/keyword_overview/live`, `bulk_keyword_difficulty/live`, `keyword_suggestions/live` (seed "icu nurse"), location 2840, en. Pulled 2026-11-03. Volume = 12-month average. Last 3 = Jul / Aug / Sep 2026.

### 1a. Requested phrasings

| Keyword | Volume | KD | Last 3 (Jul/Aug/Sep) | Note |
|---|---|---|---|---|
| icu nurse scheduling | no data | no data | no data | |
| icu scheduling software | no data | no data | no data | |
| icu nurse scheduling software | no data | no data | no data | |
| icu staffing software | no data | no data | no data | |
| critical care nurse scheduling | no data | no data | no data | |
| icu nurse scheduling app | no data | no data | no data | |
| icu scheduling | no data | no data | no data | |
| nurse competency scheduling | no data | no data | no data | |
| skill based nurse scheduling | no data | no data | no data | |
| icu nurse staffing | 10 | no data | 10 / 20 / 30 | Google Ads; competition LOW, CPC bid range $1.17 to $15.74 |
| icu nurse schedule | 70 | 0 | 70 / 90 / 70 | Labs; intent informational. SERP (1b) is nurse-career content |

### 1b. Related keywords (best seeds)

| Keyword | Volume | KD | Last 3 | Intent |
|---|---|---|---|---|
| icu staffing | 210 | no data | 50 / 70 / 90 | informational. **Average is inflated by Oct 2025 (1,300) and Nov 2025 (720); the 10 months since run 20 to 110.** Treat real volume as about 50 to 90 |
| icu nurse to patient ratio / icu nurse patient ratio | 90 | 8 | 70 / 70 / 90 | informational |
| icu nurse hours | 70 | no data | 70 / 90 / 70 | informational |
| icu nurse schedule | 70 | 0 | 70 / 90 / 70 | informational |
| icu staff nurse interview questions and answers pdf | 30 | no data | 30 / 40 / 30 | informational (off-topic) |
| icu nurse night shift / night shift icu nurse | 20 | no data | 40 / 30 / 20 | informational |
| night shift icu nurse salary | 20 | 14 | 10 / 20 / 10 | off-topic |
| icu staffing ratios | 10 | 27 | 10 / 20 / no data | informational |
| icu nurse staffing ratios | 10 | 2 | 10 / 10 / 10 | informational |
| massachusetts icu nurse staffing law | 10 | no data | no data / 10 / 10 | informational |
| icu staff nurse | 10 | 2 | 10 / 20 / 30 | informational |
| skill based scheduling | 10 | no data | 10 / no data / no data | informational |
| icu nurse staffing models, nurse staffing in the icu, typical icu nurse schedule, icu nurse work hours | no volume | | | |
| acuity based staffing software | no volume | | | commercial |
| **Context, parent terms:** nurse scheduling software | 210 | no data | 170 / 110 / 90 | commercial; trend -47% quarterly, CPC $43.34 |
| nurse staffing software | 50 | no data | 50 / 30 / 40 | commercial; CPC $38.12 |

- **FINDING:** best ICU-specific commercial phrase = none. Best ICU-specific phrase with any volume that a scheduling vendor could plausibly serve = **"icu nurse to patient ratio" (90/mo, KD 8)**, informational.
- **Our own GSC (property https://simplescheduleai.com/, 2026-08-01 to 2026-11-01, query contains "icu"):** 8 rows, 22 impressions total, 0 clicks. Largest: "nurse to patient ratio in icu" 10 impressions at avg position 29.3, landing on `/blog/nurse-staffing-ratios-critical-access-hospital`. The `sc-domain:` property returned 403 (permission), the URL-prefix property worked.
- Spend: 9 DataForSEO calls (2 Ads/difficulty, 2 overview, 1 ideas, 1 suggestions, 4 SERP incl. 4 failed 40101 retries not billed as results). Cost field not returned.

---

## 2. SERP map

DataForSEO `serp/google/organic/live/advanced` and `/regular`, location "United States", English, pulled 2026-11-03. (location_code 2840 returned "40101 Internal SE Server Error" three times; location_name worked.)

### 2a. "icu nurse scheduling software" (the title phrase; no volume)

AI Overview present but asynchronous (content not returned).

| # | URL | Type | Notes / headings |
|---|---|---|---|
| 1 | softwareadvice.com.au/directory/4377/nurse-scheduling/software | Directory | 403 to WebFetch. A WebSearch run by a research agent on 2026-11-03 surfaced **SimpleScheduleAI's own listings on softwareadvice.com.au and getapp.co.uk** for this query (search-indicated, not page-verified) |
| 2 | YouTube, Cresco International "CleverShift" | Vendor video, 2023-01-23 | 280+ views. Stale and thin |
| 3 | everexpanse.com/nursing-scheduling-software-free.html | Vendor blog (booking platform) | About 700 to 800 words. H2s: Quick Takeaways / Why Nursing Scheduling Software Free Matters / Capabilities to Prioritize / How EverExpanse Booking Platform Fits / Common Mistakes to Avoid / Implementation View. No ICU, competency or charge mention. Thin template page |
| 4 | getapp.com nurse scheduling | Directory | 403 to WebFetch |
| 5 | sparkco.ai/blog/nurse-shift-scheduling-software-streamline-staffing-for-snfs | Vendor blog, SNF focus, 2025-07-30 | About 1,900 words. H2s: Introduction / Current Challenges in Nurse Shift Scheduling Software / How Sparkco AI Transforms… / Measurable Benefits and ROI / Implementation Best Practices / Real-World Examples. No ICU, no charge, no ratios |
| 6 | soon.works blog, "7 Workforce Management Platforms Revolutionizing…" | Vendor listicle, 2024-10-07 | Guessed URL 404'd; not fetched. Snippet names NurseGrid |
| 7 | everexpanse.com/nurse-shift-platform.html | Vendor blog | About 700 words, same template as #3. No ICU |
| 8 | slashdot.org nurse scheduling software | Directory | Snippet names IntelyCare |
| 9 | ebool.com/nurse-scheduling-software | Directory | Lists EasyShifts, NurseGrid, Schedule360 |

### 2b. Cross-checks

- **"icu scheduling software" (2026-11-03):** healthcare APPOINTMENT and clinical-software listicles (schedulingkit, ClickUp, saascounter, three gitnux pages incl. "Top 10 Best Critical Care Software", ClockFlex, GetApp hospice, medappz "Critical Care clinic software"). Google reads "ICU software" as clinical systems, not staff scheduling.
- **"icu nurse schedule" (70/mo):** AI Overview on ICU nurses' 3x12 pattern; results are career content (healthecareers, Altera, Incredible Health, AMU, Nursa, Reddit, Achieve Test Prep, Facebook). Nurse-side intent. Not a buyer SERP.
- **"icu staffing":** academic/organizational (criticalcarescience.org 2026, Kaiser Permanente Division of Research "Intensive Care Unit Staffing in the United States", AONL 2024-07-23 "Leaders, staff collaborate to create ICU nurse staffing guidelines", SCCM Critical Care Statistics, IHS RRM ICU reference, a Texas staffing agency, Healthcare Dive 2014).
- **"icu nurse to patient ratio" (90/mo, KD 8):** AI Overview cites NYSNA, AACN press release ("Standards Published for Critical Care Nurse Staffing", April 23, 2024), NY DOH staffing grids, Wolters Kluwer, Nevada State, PubMed. Organic: AJIC Lasater 2021, BACCN standards PDF, NNU ratios, PMC 2025, Cape Cod Healthcare (posts its own ICU ratio quarterly), Reddit/Quora forum block, NurseJournal 2023, DiVA 2023, UT Arlington 2020. **Our `nurse-staffing-ratios-critical-access-hospital` already sits at ~29 for the near-identical query.**
- **"best icu nurse scheduling software":** DataForSEO returned 40101 errors. WebSearch (2026-11-03) returned generic nurse-scheduling roundups: cal.com, everhour, indeavor, Capterra, fitsmallbusiness, makeshift (2023), plus bytebloc ICU posts (Dec 2019, mainly physician scheduling, about 450 words).

### 2c. Analysis (thin, forum and 3+-year-stale results skipped: YouTube 2023, everexpanse x2, bytebloc 2019, directories that 403)

- **(a) TABLE STAKES** (sections in 3+ of the usable results: Sparkco, cal.com, soon.works snippet, directories): definition of nurse scheduling software; benefits; key features to look for (self-scheduling, shift swaps, mobile app, open-shift posting, credential/certification tracking, integrations); a vendor list or comparison table; how to choose; FAQ. cal.com (about 2,500 to 3,000 words, H1 "8 Best Nurse Scheduling Software", byline Mar 31 2026) names Cal.com, QGenda, Shiftboard, NurseGrid, symplr Workforce, Connecteam, Schedule360, Inovalon, and mentions ICU only in passing ("the ICU, ER, and specialty care").
- **(b) GAPS nobody covers** (checked on the pages above, 2026-11-03): what actually makes ICU scheduling different (competency pairing of novice with experienced nurses, charge-qualified coverage every shift, 1:1 / 1:2 patient assignment versus shift staffing, census swings in a 2 to 6 bed unit); the legal frame (no federal ratio; California 1:2; Massachusetts and New York ICU laws; Texas has none, only a staffing committee and plan); what each vendor's own pages document versus what is marketing; and the small-hospital case (a CAH ICU or special-care unit with 6 to 12 nurses, where one callout removes the only ICU-competent nurse on nights). No result addresses small or rural hospitals at all.
- **(c) LENGTH band of the top 3 fetchable results:** about 750 (everexpanse), 1,900 (Sparkco), 2,500 to 3,000 (cal.com, from the companion search). The directories were not fetchable. Recommendation: 1,800 to 2,400 words; the depth should go into the vendor-evidence table, not padding.

### 2d. Shape options for the founder (judgment, not a finding)

1. **Publish as bofu, framed for small hospitals** ("ICU Nurse Scheduling Software for Small Hospitals: What Each Vendor Documents"). LLM-citation play, near-zero organic volume. Cannibalization risk with `/nurse-scheduling-software` and `best-nurse-scheduling-software-2026`, because Google maps the phrase to generic nurse scheduling (keyword-check output, section 5).
2. **Merge** the ICU angle into `best-charge-nurse-scheduling-software` or `nurse-staffing-ratios-critical-access-hospital` as an H2, and retire the draft.
3. **Reframe to the only ICU phrase with volume**, "icu nurse to patient ratio" (90, KD 8), as a mofu that ends in scheduling. But `nurse-staffing-ratios-critical-access-hospital` already ranks ~29 for that query, so this would cannibalize; better to strengthen that page.

---

## 3. Vendor facts

Dossier read first: `docs/seo/competitor-dossier.md` sections Aladtec, Deputy, In-House Health, M7 Health, NurseGrid, OnShift, QGenda, ShiftWizard, SmartLinx, symplr Smart Square, UKG (2026-11-03). 60-day window = verified on or after 2026-09-04. The "charge-scheduling capability" blocks for most vendors are dated **2026-08-25, outside the window**, so live re-checks were run. Rule for the writer: "not documented on [page], checked 2026-11-03" is the only allowed absence wording.

### 3.1 symplr: now "symplr Scheduling (formerly Smart Square)" — CHANGED

Pages: https://www.symplr.com/products/smart-square (I spot-checked this page myself 2026-11-03), https://www.symplr.com/products/symplr-workforce (agent, 2026-11-03).

- **Rename, VERBATIM:** title "symplr Scheduling Healthcare Scheduling Software for Better Staff Management | symplr"; H1 "symplr Scheduling Healthcare Scheduling Software | symplr"; "See what our customers are saying about symplr Scheduling (formerly Smart Square®)". **The dossier's "Smart Square® Scheduling and Staff Planning" (2026-10-06) is out of date, and the live post `what-is-symplr-smart-square` should be checked for the name.**
- (i) Skill: VERBATIM "AI evaluates historical data, patient volume, and skill mix to recommend optimal staffing levels." / "Every shift gets the right coverage and skill mix to support safe, efficient care without last-minute scrambling." The words "qualified", "competency", "charge", "ICU", "critical care" do not appear on the Smart Square page (spot-check, 2026-11-03). Workforce page, VERBATIM (agent): "Open shifts posted to qualified staff automatically, up to 30 days in advance." Classification: skill mix as a forecasting/recommendation input; an enforced per-shift competency requirement is not documented on either page. "Nurse competency integration" survives only in the July 2, 2025 acquisition press release, not on a product page.
- (ii) Charge nurse: not documented on either page, checked 2026-11-03.
- (iii) Census/grids: VERBATIM "the predictions pass through the staffing matrices for each unit/service area" (spot-checked); "Forecast staffing needs up to 120 days in advance with 96 percent accuracy" (vendor claim, agent). Census/ratio/acuity words not on either page.
- (iv) Open shifts: "Patented open shift management"; "Automate shift communication and bidding to fill up to 75 percent of open hours early" (agent, VERBATIM). Filtered to "qualified" and incentive-driven; ranking and sick-call workflow not documented.
- (v) Pricing: symplr.com/pricing 404 (agent); Capterra "Contact vendor for pricing" (dossier, 2026-10-06, in window).
- (vi) ICU page: none found.
- ShiftSelect: symplr.com/products/shiftselect 404; the name survives only in the symplr Workforce iOS app listing (agent). Do not list separately.
- Segment: named customers are health systems (Hackensack Meridian, Bellin, University of Kansas Health System, Penn State Health; agent). Best in KLAS Scheduling: Nurse & Staff 2025 and 2026 (dossier, 2026-10-06, vendor releases).

### 3.2 M7 Health — live, rural/CAH positioning reconfirmed

Pages (agent, 2026-11-03): https://www.m7health.com/platform, homepage, /who-we-help, /sitemap.xml, https://www.m7health.com/blogs/critical-access-hospital-scheduling-software (live).
- (i) Skill/competency: not documented on /platform, homepage, /who-we-help. Closest VERBATIM: "automatically balances" … "schedules around staff preferences and clinical requirements" ("clinical requirements" undefined).
- (ii) Charge: not documented on product pages.
- (iii) Census: VERBATIM "M7's AI forecasts patient census and staffing demand based on historical patterns" (/platform FAQ). Ratio/acuity not on /platform. Acuity appears only in a CEO blog post.
- (iv) Open shifts: VERBATIM "routes open shifts only to eligible staff before a gap becomes a crisis." ("eligible" undefined; filtered, ranking not documented).
- (v) Pricing: /pricing 404; CAH blog FAQ VERBATIM "M7 is priced to be accessible for smaller facilities" (no figure).
- (vi) ICU: not documented on any page checked; no sitemap URL contains an ICU term.
- Segment, VERBATIM: "M7 is designed to serve the full range of health systems, including smaller community and rural hospitals" (/platform). CAH blog lines match dossier ("nurse-built scheduling platform that fits how small rural hospitals actually work"; "dedicated account manager"; onboarded CAHs "across Utah, Mississippi, and Alabama"). Still no named standalone CAH customer. Dossier guardrails stand: never write that M7 is enterprise-only or ignores CAHs; M7 is not YC-backed.

### 3.3 In-House Health — the only vendor with ICU product copy

Page: https://www.inhouse.health/product (I spot-checked it myself 2026-11-03).
- (vi) ICU, VERBATIM: "…but In-House can give recommendations even for high acuity units like ICUs" (under Who We Serve, Inpatient Acute).
- (iii) Census/acuity, VERBATIM: "Predictive scheduling uses AI to forecast patient census, acuity levels and staffing needs in advance"; "Proprietary algorithm segments each shift by workload, factoring in patient acuity, volume of admits/discharges". **Correction to the agent's framing:** the line "rounding, 1:1 care, and caregiver-specific ratios" sits under **Inpatient Behavioral**, not ICU. Do not attach it to ICU. HPPD lines sit under **Skilled Nursing**.
- (i) Skill, VERBATIM: "Our AI-driven scheduling predicts patient workload and balances the skill mix of your available staff"; "…with regulatory and skill mix requirements". Balanced/complied-with, not stated as a hard per-shift rule.
- (ii) Charge: not documented on homepage, /product, /skilled-nursing (agent).
- (iv) Open shifts: routed to "those likeliest to pick them up" (agent, VERBATIM); qualification filtering not documented.
- (v) Pricing: /pricing 404 (agent).
- CHANGED vs dossier (agent, not spot-checked): homepage tile now "2 / Weeks to implement with immediate budget impact" (dossier had "4 Weeks to implement", 2026-08-10); /about no longer lists Sergey Vasilenko. "Former critical care nurse" is now sourced only to Pulse2 (May 18, 2024); do not cite it without a current primary source.
- Segment: nav "Hospitals" and "Skilled Nursing"; small/rural/CAH not documented. No G2/Capterra listing (dossier 2026-08-10, outside window; UNVERIFIED today).

### 3.4 Deputy — generic, published pricing, area training requirements

Agent, 2026-11-03 (help.deputy.com returned 403 to WebFetch).
- (i) VERBATIM: "Feel confident that every shift swap complies with training requirements or maximum permitted hours." / "Find available, qualified colleagues" (https://www.deputy.com/features/shift-swapping); "Automatically factor in staff availability, training, and spread of hours" (/features/auto-scheduling); "Bring together staff preferences, certifications, time off, and patient coverage requirements to optimize your operations" (/industry/healthcare). Training Tags "identify team members who are qualified, trained, or approved to work" (dossier, help center read 2026-11-02, in window). The "Not trained" warning with "Roster anyway" and a "Bypass scheduling warnings" permission is **SNIPPET-ONLY, UNVERIFIED**.
- (ii) Charge: not documented on /industry/healthcare, /features/scheduling-software, /features/auto-scheduling, /features/shift-swapping, checked 2026-11-03.
- (iii) Ratio/census: not documented on /industry/healthcare. Staff Coverage planner = headcount per area (dossier 2026-11-02).
- (iv) VERBATIM "the Deputy app will serve up suitable employees who are available, qualified, and cost-efficient" (shift-swapping). Filtered, not ranked.
- (v) Pricing, https://www.deputy.com/pricing, VERBATIM: Lite "$5", Core "$6.50", Pro "$9" "per user per month (USD excl. all applicable taxes)". Add-ons: Payroll $8 per user per month "+ $49 monthly base fee" (new vs dossier), HR $2, Messaging+ $1.95, Analytics+ $1.50. Minimum USD $30/month per invoice on monthly plans from September 1, 2025.
- (vi) ICU: none on vendor pages. Traps: the Zwanger-Pesiri "filter my staff by their training" line is a customer testimonial; a May 31 2026 Deputy blog uses an ICU example as general advice, not a feature claim.

### 3.5 OnShift (a ShiftKey brand) — EXCLUDE

Agent, 2026-11-03. VERBATIM "OnShift is 100% dedicated to the long-term post-acute care and senior living industry." (https://www.onshift.com/company/about-us); scheduling page "Made Just For Senior Care". Census here = HPPD care budgets (senior care). Callout recommendations "based on cost and availability" and "work history, availability, and cost". /pricing 404. No ICU or hospital copy since a 2010 release. Charge not documented (scheduling page, X app release, Schedule X user guide).

### 3.6 SmartLinx — EXCLUDE

Agent, 2026-11-03. H1 VERBATIM "Smarter Employee Scheduling Software for Senior Care Teams" (https://www.smartlinx.com/solutions/scheduling/); nav lists Skilled Nursing, Assisted Living, Senior Living, Continuing Care, Healthcare Staffing, Managed Service Providers. New vs dossier: "Automatically Staff to Census, Acuity, and HPPD" (resident census, not ICU ratios). License checks at CNA/LPN/RN level. Callouts: qualified staff notified to claim. /pricing 404. No hospital, acute or ICU copy. The dossier's "50-200 bed range" was not found; the landing page says "150-5,000+ employees" (get.smartlinx.com/nurse-scheduling-software).

### 3.7 Aladtec (TCP Software) — EXCLUDE

Agent, 2026-11-03, https://www.tcpsoftware.com/products/aladtec/: title VERBATIM "24/7 Public Safety Employee Scheduling Software | Aladtec"; body names "fire, EMS, law enforcement, and corrections agencies". No hospital, nurse or ICU in body copy. Matches the dossier's 2026-10-19 timeline (in window). Guardrail: never write that Aladtec "dropped" healthcare.

### 3.8 UKG (agent, live in Playwright 2026-11-03; ukg.com 403s WebFetch)

Pages: ukg.com/products/ukg-clinical-scheduling-extensions (CSE), ukg.com/industry-solutions/healthcare, ukg.com/industry-solutions/healthcare/hospitals-and-health-systems (HHS), ukg.com/products/features/scheduling.
- (i) VERBATIM (CSE): "Automatically enforce nurse-patient ratios, licensure requirements, and labor laws to stay audit-ready and minimize compliance risks." (UNCHANGED from dossier) and "…build efficient, flexible schedules that factor in employee skills, licensure, experience, and preferences". Marketing copy. **library.ukg.com now redirects to a login page, so the dossier's help-doc quotes (skills and certifications, Call List, undercoverage arrow) are NOT RE-LOCATED. Do not cite them.**
- (ii) Charge: not a documented requirement. One customer-story line on HHS ("charge nurses and leaders can make adjustments in the moment") describes users, not a feature.
- (iii) VERBATIM (CSE): "Proactively predict patient volume with census, acuity, and churn data"; "When combined with UKG Advanced Scheduler, UKG Clinical Scheduling Extensions streamline shift-based staffing…" (add-on on top of an add-on, UNCHANGED). The "Acuity-based staffing is imperative" line is a testimonial.
- (iv) VERBATIM (HHS): "UKG Pro Advanced Scheduling… provides intelligence, rule checking, shift cover functionality…". Filtered vs ranked not documented publicly.
- (v) ukg.com/pricing 404. (vi) No ICU, intensive care or critical care on the four pages.
- Segment VERBATIM: "We've partnered with more than 3,500 hospitals and 10,000 post acute care facilities" (UNCHANGED). No CAH or rural page.

### 3.9a QGenda (agent, WebFetch + Playwright 2026-11-03)

Pages: qgenda.com/nurse-and-staff-scheduling-software/ (NSS), qgenda.com/for-nurses/ (FN), qgenda.com/hospital-health-systems/ (HHS).
- (i) Visibility only, UNCHANGED, VERBATIM (FN): "system-wide visibility into available staff, along with skills, preferences, hours worked, and work target status…". No enforced skill requirement documented.
- (ii) Charge: not documented on NSS, FN, HHS.
- (iii) NEW vs dossier, VERBATIM (NSS): "Integration with the EHR automatically sends patient census and acuity data to QGenda to inform staffing and deployment decisions." FN analytics cover "nurse-to-patient ratios" as reporting, not enforcement.
- (iv) UNCHANGED, VERBATIM (FN): "QGenda makes it simple to identify floaters and other internal resources who are qualified to work and send mobile notifications to fill open shifts before turning to premium labor options." Qualification-filtered, not ranked. Becky Mitchell (WVU Medicine) lines are a testimonial.
- (v) qgenda.com/pricing/ 404. (vi) No ICU copy.
- **CHANGED, segment, VERBATIM (HHS): "Learn why hospitals and health systems – from large enterprises to small community facilities – trust QGenda…".** The dossier line "NO CAH, rural, or small-hospital segment anywhere" is now wrong as to "small". Rural and CAH are still not named. Never write "QGenda ignores small hospitals".

### 3.9b ShiftWizard by HealthStream (agent, 2026-11-03)

shiftwizard.com still 301s to healthstream.com/solution/scheduling/nurse-and-staff-scheduling/shiftwizard (SW).
- (i) No skill or competency scheduling rule documented on SW. Skills/credential language belongs to other HealthStream products.
- (ii) Charge: not documented on SW or the Acuity & Assignment Manager page (AAM).
- (iii) **Ratio/acuity language lives in a separate product.** AAM (healthstream.com/solution/scheduling/nurse-and-staff-scheduling/acuity-assignment-manager), VERBATIM: "The system continuously updates staffing assignments to align with mandated staffing ratios, nursing hours per patient day, and workload matrices." and "Yes, Acuity and Assignment Manager is sold with our workforce scheduling solution ShiftWizard." SW itself, VERBATIM: "Schedule the right staff every time with Predictive Census".
- (iv) Open shifts: no qualification filtering or ranking documented; no public help center found.
- (v) No price; healthstream.com/pricing 404. (vi) No ICU copy.
- Segment, NEW, VERBATIM (SW FAQ): "Yes. ShiftWizard was designed for health systems, with tools to manage complexity across locations."
- **CHANGED, Workday claim inconsistent on one page:** tile "ShiftWizard is the first healthcare scheduling solution with Workday-certified integration." vs FAQ "…the only healthcare scheduling solution with certified Workday integration." If cited at all, quote one as a HealthStream claim.

### 3.9c NurseGrid Manager (agent; help center read in-page in Playwright 2026-11-03, all 30 topics; landing still "Last updated: 9/9/2025")

- (i) Enforced by POSITION only, VERBATIM (Schedule_Mgmt/Schedule_Requirements.htm): "if you set only an RN coverage requirement for Day shifts, no LPNs or CNAs would be able to sign up for that Day shift in self-scheduling." (UNCHANGED). Credentials are a filter: "narrow the list by position, FTE status, credentials, or tags." (Adding_Events.htm). "Skill", "competency", "certification" appear in none of the 30 topics.
- (ii) **NEW: charge is a shift toggle and a staff attribute, no requirement.** VERBATIM: "Use the Charge Shift, Preceptor Shift, and Overtime Shift toggles as needed." (Adding_Events.htm); "You can quickly add team members by position, FTE status, or charge trained status." (Messaging.htm); "for charge shifts, staff will be counted once in their position row and once in their Charge row." Nothing in the 30 topics restricts a charge shift to charge-trained staff (state as "not documented", never "allows untrained staff").
- (iii) No census, acuity or ratio in the 30 topics. Pre-publish red cell, VERBATIM: "If your coverage requirement is not met, the cell will be red with a dog-ear appearing in the lower right corner." Limitation, VERBATIM: "Coverage requirements currently do not appear elsewhere in the app and do not automatically create or approve open shift requests."
- (iv) Topic renamed "Creating Open Shifts". VERBATIM: "Eligible employees are listed on the Not Working and Available to Work tabs."; "If a staff member calls in sick, you can record their call-off." Availability-filtered, not qualification-ranked.
- (v) VERBATIM: "$5 per month, per staff member. Got 25 staff? That's $125/month. Easy math." and "FOR TEAMS OF 2 TO 250" (nursegrid.com/for-organizations/nursegrid-manager/).
- (vi) No ICU copy. Segment VERBATIM: "Usually teams with 250 staff or fewer. Think critical access hospitals, hospital departments, surgery centers, clinics, and more." Still the only vendor that names CAHs.

### 3.9 SERP presence

None of the 11 candidates has its own page in the DataForSEO top 10 for "icu nurse scheduling software" (2026-11-03). NurseGrid appears only inside snippets (soon.works, ebool). In companion WebSearches (agents, 2026-11-03), QGenda and symplr Workforce appear only inside cal.com's list, and "Kronos (UKG)" and ShiftWizard only inside a third-party guide on virtosoftware.com. No vendor-owned page ranked.

### 3.10 Recommendation (5 to 7)

| Vendor | Call | Reason |
|---|---|---|
| symplr Scheduling (formerly Smart Square) | INCLUDE | KLAS category leader; skill-mix forecasting, unit staffing matrices, open shifts to qualified staff. Enterprise; no price; no ICU/charge copy |
| UKG (Advanced Scheduling + Clinical Scheduling Extensions) | INCLUDE | Only vendor whose own page claims to "enforce nurse-patient ratios, licensure requirements" (re-read live 2026-11-03), plus census/acuity forecasting. Add-on-to-an-add-on stacking; enterprise; no price |
| QGenda | INCLUDE | EHR census/acuity feed, qualified-floater notification, skills visibility. Now says "small community facilities"; no charge or ratio rule; no price |
| In-House Health | INCLUDE | Only vendor with ICU product copy and acuity-driven workload forecasting; no price, no small-hospital positioning |
| M7 Health | INCLUDE | Most direct rural/CAH rival; census forecasting, eligible-only routing; no ICU/charge/competency copy |
| NurseGrid Manager | INCLUDE | Only vendor naming CAHs; published $5/staff/month; per-position coverage requirement with pre-publish red cells; charge-shift toggle but no documented charge requirement |
| ShiftWizard (+ Acuity & Assignment Manager) | INCLUDE as 7th, or swap for Deputy | Hospital nurse scheduler "designed for health systems"; ratio/HPPD language only in the separately sold AAM. Name both products |
| Deputy | OPTIONAL | Generic, published pricing, area training requirements; no charge/ratio. Useful as the "generic tool" contrast, but the post is about ICU-capable tools |

Recommended seven: UKG, symplr Scheduling, QGenda, ShiftWizard (+AAM), In-House Health, M7 Health, NurseGrid Manager. Deputy goes in a one-line "if you only need a generic tool" note. **No vendor's own pages document an enforced ICU competency-pairing rule (novice with experienced nurse) or a charge-qualified-only requirement** (all eleven checked 2026-11-03). That is the honest gap for SSAI to own, stated as "not documented on the pages checked", never as "they cannot".
| OnShift, SmartLinx, Aladtec | EXCLUDE | Post-acute/senior care (OnShift, SmartLinx) and public safety (Aladtec) by their own current copy |

---

## 4. ICU staffing facts (primary sources)

### 4.1 Federal ratio — none (facts-dossier, approved wording)
- 42 CFR 482.23(b), VERBATIM: "The nursing service must have adequate numbers of licensed registered nurses, licensed practical (vocational) nurses, and other personnel to provide nursing care to all patients as needed." No numeric ratio anywhere in 482.23. https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-C/section-482.23 (dossier verified 2026-07-04, outside 60 days but regulation text; re-check before publish).
- 42 CFR 485.631(a)(5) approved wording: "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients" (re-verified 2026-08-31). Never RN-only. https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631
- 42 CFR 485.635(d): RN must "provide (or assign to other personnel) the nursing care of each patient"; (d)(2) allows a PA where State law permits (re-verified 2026-08-31).

### 4.2 Texas — staffing committee and plan, no ratio (facts-dossier)
- Tex. Health & Safety Code 257.004, VERBATIM: "At least 60 percent of the members of the committee must be registered nurses who: (1) provide direct patient care during at least 50 percent of their work time; and (2) are selected by their peers…". The chapter sets no ratio. Link via FindLaw: https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-004/
- 257.003(a), VERBATIM: policy must "ensure that an adequate number and skill mix of nurses are available to meet the level of patient care needed." Guardrail: 257.003 never says "acuity" or "census"; 257.002(a)(2) does say "patient intensity". https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-003
- 257.001: no exemption for small, rural or Critical Access Hospitals (licensure route via Chapter 241). Verified 2026-08-17.
- 257.004 re-read live 2026-11-03 (agent, FindLaw "Current as of January 01, 2026"), VERBATIM: (a) "A hospital shall establish a nurse staffing committee as a standing committee of the hospital."; (e) "The committee shall meet at least quarterly."; (g)(1) "develop and recommend to the hospital's governing body a nurse staffing plan". No ratio.
- NEW, not in the facts-dossier: 257.005(a-1), VERBATIM: "The chief nursing officer of each hospital shall attest to the accuracy of information reported under Subsection (a)." (https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-005/). The attribution to HB 2187 (89th Leg., eff. Sept 1, 2025) is search-snippet only: UNVERIFIED.
- **No Texas ICU ratio law.** Safe wording (agent): "Texas sets no ICU nurse-to-patient ratio in statute or hospital licensing rules, as of November 2026." Basis: Ch. 257 text (2026-11-03) and 26 TAC 505.41(o) (facts-dossier L548, 2026-08-20). HB 1420 (89R, 2025), reportedly an HHSC STUDY of critical-care patient limits with a report due Dec 1, 2026, is snippet-only and UNVERIFIED (capitol.texas.gov fails DNS; LegiScan 403). Do not cite it.

### 4.3 State ICU ratios (facts-dossier approved framing)
- California 22 CCR 70217: 1:2 in critical care units, "at all times" (https://www.law.cornell.edu/regulations/california/Cal-Code-Regs-Tit-22-SS-70217).
- Massachusetts: ICU only, MGL c. 111, § 231, 1:1 or 1:2 by acuity (never cite § 227).
- New York: ICU/critical-care ratio plus committees and disclosure (PHL § 2805-t, 2021). Oregon HB 2697: 12 unit types.

### 4.4 AACN (re-read by me 2026-11-03 for the 2024 standards)
- **"AACN Standards for Appropriate Staffing in Adult Critical Care"**, release dated "April 23, 2024", seven standards (https://www.aacn.org/newsroom/standards-published-for-critical-care-nurse-staffing). VERBATIM:
  - Std 7: "Organizational staffing plans anticipate that critically ill or injured patients generally require a ratio of one nurse to two patients."
  - Std 3: "For every shift, patient assignments are based on an accurate assessment of the current nursing workload generated by each patient's needs and align nurse competency with patient characteristics."
  - Std 4: "Clinical leaders such as charge nurses, educators and nurse managers are not included in patient assignments, except in rare crisis situations."
  - Std 5: "Staffing plans and patient assignments support the unique needs of nurses who are new to the unit."
  - Std 2: "Hospital patient care areas establish, evaluate and refine unit-specific staffing guidelines based upon their impact on patient and nurse outcomes."
  - Std 1: "Direct care nurses participate in all aspects of staffing: planning, implementation and evaluation."
- **Precise verdict on 1:2:** a planning anticipation ("anticipate … generally require"), not a fixed or mandated minimum. AACN's pages never use Google's word "baseline". The full PDF is sign-in gated (BLOCKED). AACN blog, Jun 22 2026 (agent), VERBATIM: "Appropriate staffing is not a fixed number" (https://www.aacn.org/blog/nurse-staffing-vital-for-workforce-sustainability). **No formal AACN position for or against legislated ratios was found: never write "AACN opposes ratios" or "AACN endorses a mandated 1:2".**
- Approved sentence: "AACN's 2024 standards say staffing plans should anticipate that critically ill patients generally need one nurse for every two patients."
- Healthy Work Environment "Appropriate Staffing" (agent), VERBATIM: "Staffing must ensure the effective match between patient needs and nurse competencies." No ratio on that page (https://www.aacn.org/nursing-excellence/healthy-work-environments/appropriate-staffing).
- Std 4 is a scheduling fact: AACN says the charge nurse should not carry a patient assignment, so a 1:2 ICU with a charge nurse needs the charge nurse ON TOP of the bedside count.

### 4.5 CAHs and ICUs
- 42 CFR 485.620(a), VERBATIM (agent, Cornell LII): "Except as permitted for CAHs having distinct part units under § 485.647, the CAH maintains no more than 25 inpatient beds. Inpatient beds may be used for either inpatient or swing-bed services." https://www.law.cornell.edu/cfr/text/42/485.620 (eCFR redirects automated fetches to an unblock page).
- SOM Appendix W, tag **C-0902** (agent; working URL https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/downloads/som107ap_w_cah.pdf, header "Rev. 247; Issued: 09-18-26"; the URL in the task 404s). VERBATIM: "Any bed used for inpatient services at any time must be counted when assessing compliance with the 25 inpatient bed limit." The "do not count" list (exam tables, stretchers, OR tables, recovery beds used exclusively post-anesthesia, delivery beds, bassinets, ED stretchers, DPU beds) does NOT include ICU beds. **Inference, label it as one:** an ICU bed used for inpatients counts inside the 25.
- **Count of CAHs with ICUs: no current number exists.** Best sources, always dated:
  - Joynt KE, Harris Y, Orav EJ, Jha AK. "Quality of care and patient outcomes in critical access rural hospitals." JAMA. 2011 Jul 6;306(1):45-52. PMID 21730240 (re-read by me 2026-11-03). VERBATIM: "1268 CAHs (26.8%) were less likely to have intensive care units (380 [30.0%] vs 2581 [74.4%], P < .001)". Data are 2008-2009 discharges.
  - Freeman V, Walsh J, Rudolf M, Slifkin R. "Intensive Care in Critical Access Hospitals." NC Rural Health Research and Policy Analysis Center, Working Paper No. 81, March 2005 (not peer-reviewed; HRSA-funded). https://www.shepscenter.unc.edu/wp-content/uploads/2014/10/WP81.pdf. VERBATIM (agent): "Two hundred and twenty CAHs (26%) were identified as providing intensive care in at least one of the cost report years"; among 63 interviewed: "The nurse to patient ratio ranged from 1:1 to 1:3 with the majority (60%) reporting a ratio of 1:2."; "The average number of intensive care beds was 3.5."; "In general, nurse to patient ratio not technology could arguably be the defining characteristic of intensive care in Critical Access Hospitals."
  - Do NOT use the Chartis "about 870 ICU beds" figure (PDF 404, UNVERIFIED).
  - SCCM (citing AHA 2023), VERBATIM (agent): "5222 of these had at least 25 acute care beds and at least 1 ICU bed" (https://www.sccm.org/communications/critical-care-statistics). Its 25-bed floor excludes most CAHs; not CAH-applicable.

### 4.6 Benner (agent)
- Benner P. From novice to expert. Am J Nurs. 1982 Mar;82(3):402-7. PMID 6917683, https://pubmed.ncbi.nlm.nih.gov/6917683/, DOI 10.2307/3462928.
- Book: Benner P. From Novice to Expert: Excellence and Power in Clinical Nursing Practice. Menlo Park, CA: Addison-Wesley; 1984.
- Stage names, VERBATIM via a peer-reviewed secondary (McHugh MD, Lake ET, Res Nurs Health 2010;33(4):276-287, https://pmc.ncbi.nlm.nih.gov/articles/PMC2998339/): "novice, advanced beginner, competent, proficient, and expert." The 1982 full text is paywalled, so cite McHugh and Lake for the names.
- Use: SSAI's competency levels 1 to 5 can be explained in Benner's terms, but never claim SSAI's levels ARE Benner's stages unless the founder confirms that mapping.

### 4.7 CCRN (agent; https://www.aacn.org/certification/get-certified/ccrn-adult)
- VERBATIM: "A current, unencumbered U.S. RN or APRN license is required."; Two-Year Option "1,750 hours in direct care of acutely/critically ill adult patients during the previous two years, with 875 of those hours accrued in the most recent year preceding application"; Five-Year Option "minimum of 2,000 hours … with 144 of those hours accrued in the most recent year"; "CCRN® (Adult) is a specialty certification."
- AACN does not use the word "voluntary" on the pages checked. Write "a specialty certification".
- Legal requirement: none in 42 CFR 482.23 or 485.631 (both read in full, 2026-11-03). Texas 26 TAC 505 and the Nursing Practice Act were NOT checked for certification. Safe wording: "No federal Condition of Participation requires CCRN to work in an ICU."
- SSAI guardrail: the scheduler does not read certifications in any rule (capability inventory). Never imply SSAI checks CCRN.

---

## 5. Our corpus overlap

### 5a. Keyword check
`npm run keyword-check -- "icu nurse scheduling software"` (2026-11-03): heavy word-overlap with 12 registered posts (best-nurse-scheduling-software-2026, best-nurse-scheduling-software-critical-access-hospitals, free-nurse-scheduling-software, hipaa-compliant-nurse-scheduling-software, nurse-scheduling-software-pricing, nurse-scheduling-software-small-hospital, nurse-scheduling-software-vs-excel, how-to-choose-nurse-scheduling-software, best-nurse-scheduling-software-texas, switching-from-excel-to-nurse-scheduling-software, nurse-scheduling-software-minimum-employees, nurse-scheduling-software-implementation-time) plus **containment overlap with the money page `/nurse-scheduling-software`**. Combined with the SERP (2a), the cannibalization risk is real: differentiate on "ICU / special-care unit at a small hospital" explicitly.

ICU mentions in live posts (grep `\bicu\b|intensive care|critical care`, src/data/post, draft: false): nurse-to-patient-ratios-by-state (7), nurse-staffing-ratios-critical-access-hospital (6), onshift-alternatives (3), what-is-a-float-pool-nurse (2), deputy-alternatives-healthcare (2), what-is-the-nurse-scheduling-problem, nurse-rostering-vs-scheduling-software, free-nurse-scheduling-software (1 each).

### 5b. Three best inbound links (quoted sentence where the link fits)
1. `src/data/post/free-nurse-scheduling-software.md:134`: "A spreadsheet or a personal calendar app does not know that one nurse is ICU-qualified and another is not." Link "ICU-qualified".
2. `src/data/post/what-is-a-float-pool-nurse.md:53`: "A nurse signed off for medical surgical and telemetry floats between those two. She does not float to critical care." Link "critical care".
3. `src/data/post/nurse-staffing-ratios-critical-access-hospital.md:56`: "…1 nurse to 5 patients on medical-surgical units, 1 to 2 in the ICU and other critical care, and 1 to 4 in the emergency department…". Link "the ICU". Alternative: `onshift-alternatives.md:82` "In acute care, an ED or ICU shift may require ACLS, TNCC, or CCRN certification…".

### 5c. Outbound sibling links (all draft: false, checked 2026-11-03)
best-charge-nurse-scheduling-software, nurse-staffing-ratios-critical-access-hospital, nurse-to-patient-ratios-by-state, acuity-based-staffing-small-hospital, nurse-staffing-models (has "How Does SimpleScheduleAI Handle Skill Mix?"), how-to-handle-nurse-callouts, best-nurse-scheduling-software-critical-access-hospitals, what-is-a-float-pool-nurse, nurse-staffing-texas-2026, what-is-nursegrid-manager, what-is-symplr-smart-square, m7-health-alternatives. Not live (do not link): hospital-callout-coverage-ranked-shortlist, staff-scheduling-software-healthcare-vs-generic.

### 5d. What SSAI can claim on ICU (from `docs/seo/product-capability-inventory-2026-08.md`, code-verified)
- Hard rules include `icu-competency`, `level1-preceptor`, `level2-supervision`, `charge-nurse`, `patient-ratio` (22 evaluators, 13 hard / 9 soft). ICU/ER: competency level below 2 is not placed; Level 1 needs a Level 5 preceptor on the same shift; Level 2 needs a Level 4+ supervisor; charge slots need charge-qualified and level 4+ (inventory section 4.2).
- Census bands map a patient count to required RNs/LPNs/CNAs/charge and a patient-to-licensed-staff ratio per unit (SHIPPED). Census/acuity is BOTH-mode claimable.
- Callout: charge-gap warning when no charge-qualified candidate exists (SHIPPED).
- Limits to state: no credential expiry tracking; certifications are not read by any rule; multi-unit scheduling "(ICU) today" caveat at inventory line ~101 must be read before claiming multi-unit ICU scheduling. Competency levels are the hospital's own sign-off, recorded at onboarding.

### 5e. Live-post issues found incidentally (not fixed; read-only task)
- `deputy-alternatives-healthcare.md:73` says "Deputy's product page does not document credential-based assignment logic". Deputy's own pages document training requirements on swaps and Training Tags (3.4). Likely stale.
- `best-scheduling-software-25-bed-hospital.md:561` says "NurseGrid Manager runs approximately $150-$300/month". NurseGrid publishes $5 per staff member per month (dossier 2026-09-08).
- `what-is-symplr-smart-square.md` predates the rename to "symplr Scheduling (formerly Smart Square)".
- `onshift-alternatives.md:163` says "CMS §485.635 staffing documentation is logged automatically". The 2026-11-02 brief found no "CMS audit trail" feature. UNVERIFIED overclaim; check against the inventory.

---

## 6. Dossier updates owed (not made: task was read-only outside this file)

Competitor dossier (plus maintenance-log entries):
- symplr: product renamed "symplr Scheduling (formerly Smart Square®)"; ShiftSelect page 404; "staffing matrices" and "posted to qualified staff" lines.
- QGenda: HHS page now says "from large enterprises to small community facilities"; EHR census/acuity feed line; ratio reporting in analytics.
- UKG: library.ukg.com help docs now login-gated, so three quoted help-doc lines are not re-locatable.
- ShiftWizard: Acuity & Assignment Manager carries the ratio/HPPD language and is "sold with" ShiftWizard; "designed for health systems" FAQ; inconsistent "first"/"only" Workday wording.
- NurseGrid: help topics load in a browser; Charge Shift / Preceptor Shift toggles; "charge trained status" attribute; topic renamed "Creating Open Shifts".
- In-House: ICU line; implementation tile now "2 Weeks"; /about no longer lists Vasilenko.
- M7: /platform "eligible staff" and "smaller community and rural hospitals" lines; CAH blog live 2026-11-03.
- Deputy: "complies with training requirements" swap line; Payroll $49 base fee; pricing re-verified 2026-11-03.
- OnShift: HPPD care budgets, census on schedule, X app "likelihood to accept". SmartLinx: census/acuity/HPPD staffing; "150-5,000+ employees" replaces the unsourced "50-200 bed range".

Facts dossier: AACN 2024 Standard 7 and Std 4 (with the WRONG list); AACN HWE staffing sentence; Appendix W C-0902 bed-count quote and the working SOM URL; Joynt 2011 and Freeman 2005 CAH ICU figures (always dated); Benner citations; CCRN eligibility; Texas 257.005(a-1) CNO attestation (2025 amendment, HB 2187 link unverified).

---

## Sources (checked 2026-11-03 unless noted)
DataForSEO endpoints listed in 1 and 2; GSC URL-prefix property; https://sparkco.ai/blog/nurse-shift-scheduling-software-streamline-staffing-for-snfs; https://everexpanse.com/nursing-scheduling-software-free.html; https://everexpanse.com/nurse-shift-platform.html; https://cal.com/blog/nurse-scheduling-software; https://www.bytebloc.com/blog/best-practices-for-optimal-intensive-care-scheduling--.aspx; https://www.symplr.com/products/smart-square; https://www.symplr.com/products/symplr-workforce; https://www.m7health.com/platform; https://www.m7health.com/blogs/critical-access-hospital-scheduling-software; https://www.inhouse.health/product; https://www.deputy.com/pricing; https://www.deputy.com/features/shift-swapping; https://www.deputy.com/industry/healthcare; https://www.onshift.com/company/about-us; https://www.smartlinx.com/solutions/scheduling/; https://www.tcpsoftware.com/products/aladtec/; https://www.aacn.org/newsroom/standards-published-for-critical-care-nurse-staffing (snippet only); facts-dossier and competitor-dossier entries as dated.
