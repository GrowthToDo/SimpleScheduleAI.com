# Brief: state-by-state HOSPITAL nurse staffing laws, as of November 2026

For the live post `/blog/nurse-to-patient-ratios-by-state` (file `src/data/post/nurse-to-patient-ratios-by-state.md`).
Research date: 2026-11-25. Scope: licensed nurses in hospitals only. Aides, nursing homes and mandatory-overtime laws are out of scope.

Rules used: a bill that passed one chamber, died, or was vetoed is NOT law and is listed only under "Not law". Anything I could not read at a primary source is marked NOT VERIFIED.

## How the sources were read (access caveats)

- Most state legislature sites (cga.ct.gov, oregonlegislature.gov, ilga.gov, malegislature.gov, mgaleg.maryland.gov, nysenate.gov via some paths, leg.state.nv.us, code.wvlegislature.gov) refuse direct fetches from this machine (ECONNREFUSED or 403/timeouts). I read them through Wayback Machine captures (`web.archive.org/web/<date>id_/<original URL>`), which return the raw official page. The capture date is given per row. The same network block already affects `check-links` for malegislature.gov (see dossier).
- Texas statutes site and Colorado statutes were NOT readable on the official sites. Texas was read on texas.public.law and FindLaw (mirrors, "current as of 2026-01-01" / "up to date" May 2025), and the 2025 amending bill on capitol.texas.gov. Colorado was read on colorado.public.law (capture 2025-08-09).
- WebFetch summarises pages and limits quotes, so where a verbatim sentence below is marked "(read in full)" I read the whole page text myself; otherwise the quote is the tool's short extract.
- Federal: eCFR read 2026-11-25 through the eCFR versioner API.

## 1. Verified table (every cell checked against the source named in section 3)

Publishable form for the post. "Ratio" means a numeric nurse-to-patient limit set in statute or state regulation. "Committee" means a state-required staffing committee plus a staffing plan. "Plan/disclosure" means a required plan filing or public staffing reporting, with no committee mandate.

| State | Type | The law (citation) | What it requires | Year |
|---|---|---|---|---|
| California | Ratio (all unit types) | Cal. Health & Safety Code § 1276.4 (AB 394); 22 CCR § 70217 | Fixed maximum patients per licensed nurse by unit: for example 1:2 critical care, 1:4 emergency department, 1:5 medical-surgical. Penalties of $15,000 first and $30,000 later violations under HSC § 1280.3(f)(1). | AB 394 signed 1999; ratio regulations in force 2004 (med-surg 1:6 fell to 1:5 on 1/1/2005); penalties raised eff. 1/1/2026 |
| Oregon | Ratio (all unit types) plus committee | ORS 441.762 to 441.795 (2023 Or. Laws ch. 507, HB 2697); ratios in ORS 441.765 | A direct-care RN may be assigned no more than 2 patients in ICU, 4 in medical-surgical (from July 1, 2026; 5 before), 4 in the ED (average over 12 hours), and so on by unit; a staffing committee plan can replace the default ratios unit by unit. Swing-bed patients are exempt. | 2023; med-surg 1:4 operative July 1, 2026 |
| Massachusetts | Ratio (ICU only) | M.G.L. c. 111, § 231 (Ch. 155, Acts of 2014); 958 CMR 8.00 | ICU patient assignment for a registered nurse is 1:1 or 1:2, by patient stability as measured by a certified acuity tool. No hospital-wide ratio. | 2014 |
| New York | Ratio (ICU and critical care only) plus committee plus disclosure | PHL § 2805-t (L. 2021 ch. 155) for committees, plans and disclosure; 10 NYCRR § 405.22(a)(5) for the ratio | Committee writes an annual clinical staffing plan; hospitals disclose staffing publicly; by regulation there must be at least one RN for every two ICU or critical care patients. All other units run on the committee plan. | Committee law 2021; ICU 1:2 regulation eff. 7/19/2023 |
| Connecticut | Committee | Conn. Gen. Stat. § 19a-89e | Dedicated staffing committee (direct-care RNs a majority) writes the nurse staffing plan; hospital reports the plan to DPH twice a year and its compliance every six months; civil penalties. | 2008 (PA 08-79); amended 2015, 2023, 2024 |
| Illinois | Committee | 210 ILCS 85/10.10 | Nursing care committee (at least 55% direct-care RNs) prepares a written hospital-wide plan with minimum RN-to-patient staffing for each inpatient unit; plan is posted; no statutory number. | Current text P.A. 102-4 (2021) with later amendments through 2024; original enactment year NOT VERIFIED |
| Nevada | Committee (large hospitals only) | NRS 449.242 to 449.2428 | Applies only to hospitals in counties of 100,000 or more people with more than 70 beds: a staffing committee and a documented staffing plan. Does not reach a 25-bed hospital. | 2013; amended 2017 |
| Ohio | Committee | Ohio Rev. Code §§ 3727.51 to 3727.54 | Hospital-wide nursing care committee (at least half direct-care RNs) recommends, and the hospital adopts, a written evidence-based nursing staffing plan; plan filed with the Department of Health every even-numbered year. | 2008 (HB 346); filing duty added 2017 |
| Texas | Committee | Tex. Health & Safety Code §§ 257.003 to 257.007 | Standing nurse staffing committee, at least 60% direct-care RNs, recommends a plan; governing body must adopt, implement and enforce a written nurse staffing policy and an official plan; annual report to the state; HHSC complaint and anti-retaliation provisions since 9/1/2025. No ratio. | 2009 (SB 476); enforcement added 2025 (HB 2187) |
| Washington | Committee | RCW 70.41.420 | Hospital staffing committee (at least 50% direct-care nursing staff) produces an annual unit and shift staffing plan; hospital must staff to the plan from July 1, 2025 and report compliance; critical access hospitals are exempt from the compliance report and may use flexible approaches. | 2008; amended 2017 and 2023 (2023 c 114) |
| Colorado | Committee | C.R.S. § 25-3-128 (HB22-1401, ch. 178, Laws 2022) | Nurse staffing committee (at least 60% clinical staff nurses) develops an annual master staffing plan with minimum staffing per inpatient unit and ED set under Board of Health rules; plan goes to the state each year. No statutory ratio. | 2022 |
| Maryland | Committee (new, phased) | Md. Code, Health-General §§ 19-393 to 19-397 (Safe Staffing Act of 2026; Chs. 235 and 236, Laws of 2026) | Each hospital must form a clinical staffing committee (by July 1, 2027) and implement a committee-finalized staffing plan (by July 1, 2028); plans posted on each unit; reports to the Maryland Health Care Commission from 2030. No ratio. | Approved 4/28/2026; effective 10/1/2026 |
| West Virginia | Committee/plan (narrow) | W. Va. Code § 16B-3-20 | Facilities must build an acuity-based patient classification system (by July 1, 2024) and have unit nurse staffing committees (at least 51% direct-care RNs) review it every year. No ratio. | 2024 (SB 300, per the code site's bill history) |
| Minnesota | Plan/disclosure | Minn. Stat. § 144.7055 | Chief nursing executive writes a core staffing plan for each unit, consulting staff; hospitals send plans and actual direct-care hours to the Minnesota Hospital Association for public posting. No committee, no ratio. | 2013 (c 51) |
| New Jersey | Plan/disclosure (ratios reported, not mandated) | N.J.S.A. 26:2H-5g; N.J.A.C. 8:43G-17A.5 | Hospitals must post daily, on each unit, the number of nurses and the patient-to-nurse ratio actually staffed, report it monthly to the state, and the state publishes it quarterly. The law sets no minimum ratio. | 2005 (L. 2005 c. 21) |
| Rhode Island | Plan/disclosure | R.I. Gen. Laws § 23-17.17-8 | Each licensed hospital files its core staffing plan (nurses per unit and shift) with the Department of Health every January. No committee, no ratio. | 2005 (P.L. 2005 ch. 45 and 60); amended 2008 |
| Vermont | Plan/disclosure (thin) | 18 V.S.A. § 9405b(a)(4) | The state's comparative hospital quality report must include nurse staffing information (such as skill mix and nursing care hours per patient day). No committee, no ratio. | Section added 2003; year the nurse-staffing item was inserted NOT VERIFIED |

## 2. Counts and how they were derived

Derived only from the 17 rows above (nothing from an uncited list):

- Numeric nurse-to-patient ratio in statute or state regulation: **4 states** (California, Oregon, Massachusetts, New York). Split: 2 cover many unit types (California, Oregon); 2 cover the ICU or critical care only (Massachusetts, New York).
- Committee and plan law with no numeric ratio: **9 states** (Connecticut, Illinois, Nevada, Ohio, Texas, Washington, Colorado, Maryland, West Virginia). Nevada reaches only large hospitals; West Virginia is the narrowest; Maryland is not fully phased in until July 1, 2028.
- Plan filing or public disclosure only: **4 states** (Minnesota, New Jersey, Rhode Island, Vermont).
- Total with at least one verified hospital nurse staffing law: **4 + 9 + 4 = 17 states.** Oregon and New York also carry committee provisions, and Illinois, Washington and New York also carry disclosure provisions; each state is counted once, in its strongest tier.
- Change against the current post (3 ratio + 8 committee + 3 disclosure = 14): New York moves from committee to ratio; Minnesota moves from committee to disclosure; Colorado, Maryland and West Virginia are added (Colorado 2022, West Virginia 2024, Maryland 2026).
- This is a verified floor, not a proven complete census. The ANA page says "16 states" as of March 2022; the ANA page returned 403 to me and I saw its grouping only in a search summary (committees CT, IL, NV, NY, OH, OR, TX, WA; Minnesota core staffing plan; ratios CA and MA; disclosure IL, NJ, NY, RI, VT). That grouping names 14 distinct states, so two of ANA's 16 are not identified here. Do not print "16" as current, and do not print "17 is every state". Safe wording: "at least 17 states".

## 3. Evidence per state (verbatim sentence, URL, date read)

"Read" dates are 2026-11-25 unless a Wayback capture date is shown. Quotes marked (full) were read in the complete page text.

### California
- Statute HSC § 1276.4(a) (full): "the State Department of Public Health shall adopt regulations that establish minimum, specific, and numerical licensed nurse-to-patient ratios by licensed nurse classification and by hospital unit". (g): rural general acute care hospitals may get waivers; (a) says flexibility "shall be considered" for rural general acute care hospitals.
- Regulation 22 CCR 70217: critical care 1:2, ED 1:4 (critical care in ED 1:2), pediatric 1:4, step-down 1:4, telemetry 1:4, medical-surgical 1:5 (summary read; the 1:2 critical care sentence verbatim per dossier re-verification 2026-11-03: "The licensed nurse-to-patient ratio in a critical care unit shall be 1:2 or fewer at all times.").
- Penalties HSC § 1280.3(f)(1) (full): $15,000 first violation, $30,000 second and later. Amended by Stats. 2025, ch. 773 (SB 596), "Effective January 1, 2026".
- HSC § 1276.4 was amended by Stats. 2025, ch. 21 (AB 116), eff. June 30, 2025, adding acute psychiatric hospital ratio rulemaking. A law-firm note (Holland & Knight, June 2026) reports psychiatric-hospital ratio emergency regulations took effect June 1, 2026. That last point is secondary; the ratios there are NOT in the table because I did not read them.
- AB 394 year: signed 1999 (secondary: CDPH letter and search summaries). Regulations in force 2004 (secondary; the regulation page notes restored pre-11-12-2004 text and shows the 1/1/2005 med-surg step).
- URLs: https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=HSC&sectionNum=1276.4 (Wayback 2026-04-03); https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=HSC&sectionNum=1280.3 (Wayback 2026-02-07); https://www.law.cornell.edu/regulations/california/Cal-Code-Regs-Tit-22-SS-70217 (2026-11-25).

### Oregon
- ORS 441.765(2)(b) (full): "In an intensive care unit, a direct care registered nurse is assigned to no more than two patients."
- ORS 441.765(2)(j) as amended, operative July 1, 2026 (full): "In a medical-surgical unit, a direct care registered nurse is assigned to no more than four patients." The version operative until July 1, 2026 says "five patients" (same section, reproduced in the statute note). ED: average no more than one to four over 12 hours, never more than five at one time (2)(a)(B).
- ORS 441.766(1)(c): ratios "do not apply to the care of ... Patients in swing beds, as defined by the Centers for Medicare and Medicaid Services". Same section exempts psychiatric units and ICU/critical units "in circumstances prescribed by the hospital nurse staffing committee".
- ORS 441.765(7)(a): if the committee adopted a unit plan, the hospital must follow that plan; (7)(b): if not, the statutory ratios apply by default.
- ORS 441.792 and 441.793: warning, then civil penalties of $1,750, $2,500, $5,000 on the second, third and fourth violation within four years.
- History line in the statute: [2023 c.507 §§6, 17; 2025 c.506 §§1, 2]. Note says the section 17 amendments "become operative July 1, 2026". No critical-access carve-out appears in ORS 441.760 to 441.795 as read. The older committee law's origin year was not read: do not date Oregon's committee requirement.
- URL: https://www.oregonlegislature.gov/bills_laws/ors/ors441.html (Wayback capture 2026-11-16).

### Massachusetts
- M.G.L. c. 111, § 231 (full): "in all intensive care units the patient assignment for the registered nurse shall be 1:1 or 1:2 depending on the stability of the patient as assessed by the acuity tool and by the staff nurses in the unit".
- HPC page: "Chapter 155 of the Acts of 2014, An Act relative to patient limits in all hospital intensive care units (codified at MGL c. 111, sec. 231)". Regulation 958 CMR 8.00 (HPC approval June 2015, secondary). Sign date June 30, 2014 and effective Sept. 28, 2014 are secondary (search summaries); use only "2014".
- URLs: https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXVI/Chapter111/Section231 (Wayback 2026-11-16); https://masshpc.gov/regulations-guidance/icu-nurse-staffing (Wayback 2026-04-11).

### New York (resolved at the primary source)
- The statute does not contain the ratio. PHL § 2805-t (nysenate.gov, 2021-06-25 revision) requires: a clinical staffing committee in each general hospital by January 1, 2022; an annual clinical staffing plan, implemented from January 1, 2023; posting; public disclosure of nurse staffing and outcomes; and directs the Commissioner to promulgate ICU and critical care staffing regulations that consider "a minimum standard of twelve hours of registered nurse care per patient per day" (subd. 5(b)(ii)). Subd. 4(a): plans must include "specific guidelines or ratios, matrices, or grids".
- The ratio is in regulation: 10 NYCRR § 405.22(a)(5) (full): "There shall be a minimum of one registered professional nurse assigned to care for every two patients that an attending practitioner determines to require intensive or critical care." Cornell LII notes: "Amended New York State Register July 19, 2023/Volume XLV, Issue 29, eff. 7/19/2023". Exceptions: patient no longer needs critical care or is awaiting transfer; ICU bed used because no other bed was open and the practitioner found no critical-care need. Complaints go to the clinical staffing committee first, to the Department after 90 days.
- The Department's adopted-rule document (regs.health.ny.gov, "Clinical Staffing in General Hospitals", read via Wayback 2026-05-16) states: authority "Sections 2803 and 2805-t(5) of the Public Health Law"; the February 16, 2022 proposal "did not establish staffing ratios for ICU and critical care units" and "This regulation, as revised, now requires one registered professional nurse for every two intensive care or critical care patients." Section 2805-t was added by "Chapter 155 of the Laws of 2021".
- Verdict: New York has both a committee law and an ICU-only ratio rule. The post's "committee-only" is wrong. The dossier's "PHL § 2805-t (2021)" attribution of the ratio is half right: 2805-t is the authority, but the 1:2 number is in 405.22(a)(5), effective 2023.
- URLs: https://www.nysenate.gov/legislation/laws/PBH/2805-T (2026-11-25); https://www.law.cornell.edu/regulations/new-york/10-NYCRR-405.22 (Wayback 2026-01-07).

### Connecticut
- Conn. Gen. Stat. § 19a-89e(c)(1) (full): "Each hospital shall establish a dedicated hospital staffing committee to assist in the preparation of the nurse staffing plan required pursuant to subsection (b) of this section."
- Direct-care RNs must be at least 50% of the committee and one more than the non-direct-care RNs; hospitals report the plan to DPH by January 1 and July 1; subsection (n) requires a six-month compliance report on at least 80% of staffing assignments in the plan; (o) penalties of $3,500 (first) and $5,000 (later).
- History (statute text): "P.A. 08-79, S. 1; P.A. 15-91, S. 1; P.A. 23-204, S. 54; P.A. 24-68, S. 46." My first guess of § 19a-127o was wrong; that is not the section.
- URL: https://www.cga.ct.gov/current/pub/chap_368a.htm (Wayback 2026-10-30).

### Illinois
- 210 ILCS 85/10.10(c)(1) (full): "Every hospital shall implement a written hospital-wide staffing plan, prepared by a nursing care committee or committees, that provides for minimum direct care professional registered nurse-to-patient staffing needs for each inpatient care unit, including inpatient emergency departments."
- (d)(1): committee meets at least 6 times a year, at least 55% direct-care RNs. Source line: "P.A. 102-4, eff. 4-27-21; 102-641, eff. 8-27-21; 102-813, eff. 5-13-22; 103-211, eff. 1-1-24; 103-605, eff. 7-1-24." P.A. 97-423 (2011) "amends" the section, so an earlier version exists; I did not find its original year.
- URL: https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=021000850K10.10 (Wayback 2025-10-04, document 021000850K10.10.htm); https://ilga.gov/ftp/Public%20Acts/97/097-0423.htm (Wayback 2025-03-31).

### Nevada
- NRS 449.242(1) (full): "each hospital located in a county whose population is 100,000 or more and which is licensed to have more than 70 beds shall establish a staffing committee to develop a written policy as required pursuant to NRS 449.2423 and a documented staffing plan as required pursuant to NRS 449.2421".
- Section history: "Added to NRS by 2013, 2143". The 2025 expansion (SB 182, committees plus maximum ratios) was vetoed; see "Not law".
- URL: https://www.leg.state.nv.us/nrs/nrs-449.html (Wayback 2026-11-16).

### Ohio
- ORC 3727.53(A) (full): "each hospital shall create an evidence-based written nursing services staffing plan guiding the assignment of nurses hospital-wide."
- 3727.51: committee, "At least fifty per cent of the committee's membership shall consist of registered nurses who provide direct patient care". 3727.54(B): "beginning in 2018, a hospital shall submit to the department of health, by March 1 of each even-numbered year, a copy of the hospital's nursing services staffing plan". Pages show "Effective: September 12, 2008 ... House Bill 346 - 127th General Assembly" (3727.51 to .53) and "Effective: September 29, 2017 ... House Bill 49 - 132nd General Assembly" (3727.54).
- URLs: https://codes.ohio.gov/ohio-revised-code/section-3727.51 (Wayback 2026-11-16), .52 (2025-11-15), .53 (2026-05-14), .54 (2026-03-10).

### Texas
- HSC § 257.004(a): "A hospital shall establish a nurse staffing committee as a standing committee of the hospital." (d): at least 60% of members must be registered nurses who spend at least half their time in direct care and are chosen by peers. (g)(4): committee must "at least semiannually" evaluate the plan and "the variations between the plan and actual staffing". Section history: "Added by Acts 2009, 81st Leg., R.S., Ch. 742 (S.B. 476), Sec. 1, eff. September 1, 2009."
- HSC § 257.003(a): the governing body must "adopt, implement, and enforce a written nurse staffing policy"; (c)(2): the plan's levels and current staffing levels per unit and shift must be readily available to nurses at the start of each shift.
- HSC § 257.005: annual report to the department on whether a policy was adopted and a committee exists; information is public.
- HB 2187 (89R), enrolled version read at https://capitol.texas.gov/tlodocs/89R/billtext/html/HB02187F.htm: adds § 257.006 (anti-retaliation) and § 257.007 (HHSC enforcement and complaint process), an attestation by the chief nursing officer under § 257.005(a-1), and parallel overtime provisions in ch. 258. Action history (capitol.texas.gov): passed House 5/2/2025, passed Senate 5/20/2025, signed by the Governor 6/20/2025, effective 9/1/2025. It does NOT amend § 257.004.
- Whether a critical access hospital is a "hospital" under § 257.001 depends on Health & Safety Code § 241.003, which I did not read; do not claim either way.
- URLs: https://texas.public.law/statutes/tex._health_&_safety_code_section_257.004 (and .003, .005); https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-004/ ("Current as of January 01, 2026").

### Washington
- RCW 70.41.420(1) (full): "By January 1, 2024, each hospital shall establish a hospital staffing committee, either by creating a new committee or assigning the functions of the hospital staffing committee to an existing nurse staffing committee."
- (7)(a) (full): "Beginning July 1, 2025, each hospital shall implement the staffing plan and assign nursing staff to each patient care unit in accordance with the plan except in instances of unforeseeable emergent circumstances."
- (7)(b)(iv): the compliance-reporting duty "does not apply to" critical access hospitals, hospitals with fewer than 25 acute care licensed beds, certain sole community hospitals and an island hospital in Skagit county. (10): "Critical access hospitals may develop flexible approaches".
- History: "[ 2023 c 114 s 3 ; 2017 c 249 s 2 ; 2008 c 47 s 3 .]"
- URL: https://app.leg.wa.gov/RCW/default.aspx?cite=70.41.420 (Wayback 2026-11-16).

### Colorado
- C.R.S. § 25-3-128(2)(a) (full): "On or before September 1, 2022, each hospital shall establish a nurse staffing committee pursuant to rules promulgated by the state board of health, either by creating a new committee or assigning the nurse staffing functions to an existing hospital staffing committee."
- (2)(b)(I): annual master nurse staffing plan that "Includes minimum staffing requirements as established in rules promulgated by the state board of health for each inpatient unit and emergency department". The 2023 proposed rule attachment for 6 CCR 1011-1, Chapter 4 (sos.state.co.us) contains no use of the word "ratio" (searched the full text); I did not read the final adopted rule.
- HB22-1401: Chapter 178, Laws of 2022, signed May 18, 2022 (secondary: bill page summaries).
- URL: https://colorado.public.law/statutes/crs_25-3-128 (Wayback 2025-08-09; a mirror, not the official site).

### Maryland
- Enacted text read in the Chapter laws: https://mgaleg.maryland.gov/2026RS/Chapters_noln/CH_236_hb0624e.pdf (HB 624, Chapter 236) and https://mgaleg.maryland.gov/2026RS/Chapters_noln/CH_235_sb0411t.pdf (SB 411, Chapter 235). Title: "(Safe Staffing Act of 2026)". Both end: "Approved by the Governor, April 28, 2026." and "this Act shall take effect October 1, 2026."
- § 19-394(c)(1) (enacted text is in capitals): "EACH HOSPITAL LICENSED UNDER THIS TITLE SHALL ESTABLISH AND MAINTAIN A CLINICAL STAFFING COMMITTEE". § 19-394(d): the chief nurse executive drafts a plan and the committee finalizes it. Section 2: committees due "on or before ... July 1, 2027". Section 3: plans implemented "on or before July 1, 2028". § 19-397: reports to the Maryland Health Care Commission "BEGINNING IN 2030". § 19-394(a): does not apply to State hospitals.
- Caution: the chapter PDF prints struck and inserted words together, so committee composition (bed-count tiers, optional members) was not read cleanly. The table says nothing about composition for that reason.
- No ratio anywhere in the text read.

### West Virginia
- W. Va. Code § 16B-3-20(c)(2) (full): "Direct each unit nurse staffing committee to annually review the facility's current acuity-based patient classification system and submit recommendations to the facility for changes based on current standards of practice". (c)(1): develop the system "by July 1, 2024". Definition: unit nurse staffing committee has "a minimum of 51 percent of direct-care registered nurses".
- The code site's bill history for the section lists "2024 Regular Session SB300" (Enrolled Committee Substitute for Senate Bill 300). I did not read the bill title. The statute never sets a ratio and never says "committee shall be established" in as many words; it is the narrowest row in the table.
- URL: https://code.wvlegislature.gov/16B-3-20/ (Wayback 2025-10-10).

### Minnesota
- Minn. Stat. § 144.7055 subd. 2(a) (full): "The chief nursing executive or nursing designee of every reporting hospital in Minnesota under section 144.50 will develop a core staffing plan for each patient care unit." Subd. 3: plans go to the Minnesota Hospital Association for its quality report website; actual direct patient care hours are posted quarterly. History: "2013 c 51 s 1".
- No committee requirement exists in the 2026 statute book. The 2022 and 2023 bills that would have created § 144.7053 (nurse staffing committees; "Keeping Nurses at the Bedside Act") were never enacted: the 2026 Chapter 144 table of sections goes from § 144.7055 straight to § 144.706, and there is no § 144.7053. The only new § 144.7051 (2026 Laws ch. 127, art. 3, § 6) is a hospital stabilization reserve, not staffing (Senate act summary read).
- URLs: https://www.revisor.mn.gov/statutes/cite/144.7055 (Wayback 2026-11-16); https://www.revisor.mn.gov/statutes/cite/144 (Wayback 2026-07-15).

### New Jersey
- N.J.S.A. 26:2H-5g(a) (full): a general hospital "shall compile, and shall post daily in the patient care area of each unit of the hospital and provide upon request to a member of the public, information detailing for each unit and for the end of the prevailing shift ... the number of registered professional nurses providing direct patient care and the ratio of patients to registered professional nurses". (d): monthly report to the commissioner; the commissioner publishes quarterly. Source note: "L.2005,c.21,s.2."
- NJ DOH nurse-to-patient staffing page describes only posting and reporting, and no required ratio. N.J.A.C. 8:43G-17A.5 (Cornell): "Each general hospital shall report the following information to the Department once a month on a web-based interface", amended eff. 1/16/2018.
- URLs: https://law.justia.com/codes/new-jersey/title-26/section-26-2h-5g/ (Wayback 2026-11-05); https://www.nj.gov/health/healthcarequality/health-care-professionals/nurse-to-patient-staffing.

### Rhode Island
- R.I. Gen. Laws § 23-17.17-8(a) (full): "Annually in the month of January, every licensed hospital shall submit to the Rhode Island department of health, its core-staffing plan." History: "P.L. 2005, ch. 45, § 1; P.L. 2005, ch. 60, § 1; P.L. 2008, ch. 475, § 53." Chapter is the Health Care Quality Program.
- R.I. Gen. Laws ch. 23-17.20 ("Healthcare Facilities Staffing") is a mandatory-overtime chapter, not a ratio or committee law.
- URL: https://webserver.rilegislature.gov/Statutes/TITLE23/23-17.17/23-17.17-8.htm (Wayback 2026-01-20).

### Vermont
- 18 V.S.A. § 9405b(a)(4) (full): the report includes "Valid, reliable, and useful information on nurse staffing, including comparisons to appropriate industry benchmarks for safety." History: "Added 2003, No. 53, § 5; amended 2005 ... 2023, No. 113 (Adj. Sess.), § E.345.1, eff. July 1, 2024."
- No other Vermont hospital nurse staffing statute found (searched; 18 V.S.A. § 1852 read, no staffing duty).
- URL: https://legislature.vermont.gov/statutes/section/18/221/09405b (Wayback 2026-07-11).

### Federal
- No federal nurse-to-patient ratio law or rule exists. 42 CFR § 482.23(b), first sentence (extract): "The nursing service must have adequate numbers of licensed registered nurses, licensed practical (vocational) nurses," and other personnel to provide nursing care to all patients as needed. Paragraph (b)(3): "A registered nurse must supervise and evaluate the nursing care for each patient." Source citation shows last amendment 84 FR 51819 (Sept. 30, 2019). Dossier already carries "No numeric nurse-to-patient ratio appears anywhere in 482.23."
- 42 CFR § 485.631(a)(5) (extract): a registered nurse, clinical nurse specialist or licensed practical nurse "is on duty whenever the CAH has one or more inpatients." A coverage rule, not a ratio.
- Pending, introduced, not law: Nurse Staffing Standards for Hospital Patient Safety and Quality Care Act of 2025, **S. 1709** (Padilla; introduced May 12, 2025; referred to Senate HELP; text read at govinfo.gov) and **H.R. 3415** (119th Congress; introduced May 2025, Schakowsky; title and number from govinfo and search results, status not read at congress.gov). Both would set minimum RN-to-patient ratios by unit. Neither has passed either chamber as far as I found; I did not read congress.gov action pages, so say "introduced" only.
- URLs: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-C/section-482.23 ; https://www.govinfo.gov/content/pkg/BILLS-119s1709is/html/BILLS-119s1709is.htm

## 4. Answer to "legal nurse to patient ratio" (one sentence we can support)

No federal law sets a nurse-to-patient ratio; in state law or regulation only California and Oregon (many unit types) and Massachusetts and New York (ICU or critical care only) set a numeric hospital ratio, and everywhere else the legal standard is a staffing plan, usually written by a staffing committee, not a number.

## 5. Small-hospital notes that are verified (useful for the CAH angle)

- California: HSC § 1276.4(g) lets the department grant waivers to rural general acute care hospitals meeting 22 CCR 70059.1; (a) says flexibility "shall be considered" for them.
- Oregon: ratios do not apply to swing-bed patients (ORS 441.766(1)(c)); the committee can substitute its own approved plan per unit; no critical access carve-out found.
- Nevada: committee law reaches only hospitals over 70 beds in counties of 100,000 or more, so a 25-bed hospital is outside it.
- Washington: critical access hospitals are exempt from the compliance report and may use flexible committee methods.
- Texas: hospitals must make planned and actual staffing for each unit and shift available to nurses at the start of each shift (§ 257.003(c)(2)) and the committee must evaluate plan-versus-actual variations semiannually (§ 257.004(g)(4)).

## 6. Disagreements with the current post and the dossier

Post (`nurse-to-patient-ratios-by-state.md`):
1. **New York is not committee-only.** It has an ICU and critical-care 1:2 ratio in 10 NYCRR 405.22(a)(5), effective 7/19/2023. Move it to the ratio tier (ICU-only, like Massachusetts). The table row "New York's plan may add unit-level numbers by regulation" is stale: the regulation already exists.
2. **"Only three states put a ratio in law" is wrong**: four (CA, OR, MA, NY). Key Takeaways, the first section, the tier table, "What to Do This Week" step 1 and the FAQ "Which states have mandated nurse-to-patient ratios" all repeat "three" or "California, Oregon, and Massachusetts".
3. **Minnesota is not a committee state.** Minn. Stat. § 144.7055 is a plan-and-disclosure law. The committee bills (§ 144.7053) never became law.
4. **Missing states:** Colorado (2022), West Virginia (2024), Maryland (2026, Safe Staffing Act of 2026). "About a dozen more states" in Key Takeaways becomes 13 (9 committee + 4 disclosure).
5. **Oregon timing:** the statute says the medical-surgical 1:4 amendment is "operative July 1, 2026", not "June 2026", and as of November 2026 it is already in force. "Phase in through mid-2026" and "is already out of date" in the Key Takeaways and FAQ should be rewritten in the past tense.
6. **Texas record-keeping claim is not in the statute.** The post says (FAQ and body) the hospital "must keep records showing the plan was followed on each shift". §§ 257.003 to 257.005 as read contain no record-keeping duty. What they do say: the governing body must adopt, implement and enforce the written policy and plan; the plan and current staffing per unit and shift must be available to nurses at the start of each shift; the committee evaluates plan-versus-actual variations at least semiannually; the hospital reports annually to the state. Also "written, adopted staffing plan" is fine, but the committee only "develops and recommends" (257.004(g)(1)); the governing body adopts under 257.003.
7. **Texas change not in the post:** HB 2187 (eff. 9/1/2025) added HHSC enforcement, a complaint process and anti-retaliation protection (§§ 257.006, 257.007) and a chief-nursing-officer attestation. "Texas has no enforcement" must never be written.
8. **ANA "16 states as of March 2022"** is a true historical statement but stale: Colorado, West Virginia and Maryland have been added since, Oregon and New York moved up, and I could not read the ANA page (403).
9. The post's Washington, Ohio, Connecticut, Illinois, Nevada, Texas, New Jersey, Rhode Island and Vermont placements are correct at the tier level. Nevada should carry the "large hospitals only" qualifier; Vermont's entry is a quality-report item, not a staffing statute of its own.

Dossier (`docs/seo/facts-dossier.md`):
1. "New York mandates an ICU/critical-care ratio plus staffing committees and disclosure (PHL § 2805-t, 2021)": the substance is right, the cite is incomplete. The ratio is 10 NYCRR 405.22(a)(5) (2023), authorised by § 2805-t(5); § 2805-t itself sets no number (it directs regulations and a 12-hours-of-RN-care-per-patient-day minimum standard to be considered). The post's "committee-only" is the error, not the dossier's substance.
2. "med-surg 1:5 moving to 1:4 in June 2026": statute text says operative **July 1, 2026**. "Nurse-ratio enforcement began June 1, 2025" was not re-checked here.
3. "Texas HB 2187 (89R) ... NOT verified as passed" is now verified: signed 6/20/2025, effective 9/1/2025 (also adds § 258.006). The dossier line should be updated by the main session; I edited nothing.
4. "Wrong: citing the Massachusetts ICU law as § 227" stands. MA § 231 re-read via Wayback 2026-11-16; text matches the dossier.
5. The dossier's "published state counts are disputed and uncited" holds for ratio and committee counts as well, not just overtime.

## 7. NOT VERIFIED

- ANA tracker page content and its two unnamed states of the "16" (page returned 403; seen in a search summary only).
- Illinois § 10.10 original enactment year; Oregon committee law origin year; Vermont year the nurse-staffing item entered § 9405b(a)(4).
- California: AB 394 chapter number and signing date (1999 is secondary); ratio regulation effective date "2004" (secondary); acute psychiatric hospital ratios and their June 1, 2026 effective date (law-firm note only).
- Massachusetts: signing date June 30, 2014 and effective date Sept. 28, 2014 (secondary); 958 CMR 8.00 amendments since 2015 not checked.
- Maryland: committee composition, because the chapter PDF shows struck and inserted text together.
- Colorado: final adopted rule text (only the 2023 proposed rule attachment was searched, and it has no "ratio").
- West Virginia: SB 300 title and whether the section pre-dates 2024 (the code site lists only the 2024 bill).
- Texas: official statutes site not readable; whether a critical access hospital is a § 257.001 "hospital".
- Federal: congress.gov action pages for S. 1709 and H.R. 3415 (introduced-only status is from govinfo and search results).
- Other states searched for 2022 to 2026 hospital staffing laws with nothing found (not proof of absence): Alaska (only a nurse-overtime law, AS 18.20.400 and following; SB 283 introduced 2026-04-15, referred, no enactment evidence), Delaware (nursing-home staffing only), Virginia (nursing-facility staffing and a voluntary VHHA/VNA committee model; no hospital statute), Michigan, Pennsylvania, Maine, New Mexico, Hawaii, Wisconsin, Idaho, Missouri, Indiana, Georgia, Kentucky, Tennessee, Louisiana. For New Mexico HB 172 (2026) and Hawaii SB 2763 / HB 1865 (2026) the final outcome is NOT VERIFIED (no source shows enactment; trackers show stalled). Idaho: one search summary claims a statutory ban on staffing minimums; I could not find it, so nothing is claimed.

## 8. Not law (never list as law)

- **Nevada SB 182 (2025):** passed the legislature (Senate 5/22/2025, Assembly 6/2/2025 per bill-tracker summaries) and was **vetoed by the Governor on June 12, 2025** (tracker record and a nurse.org headline; the veto message PDF itself was unreadable). It would have added technical and service staffing committees and maximum ratios. The Nov 2026 NRS chapter 449 text contains no such provisions, consistent with the veto.
- **Pennsylvania Patient Safety Act, HB 106 (2023-24):** passed the House in June 2023 (119-84 per two outlets, 109-84 per one); never got a Senate vote; the bill was reintroduced by Sen. Collett and sits in Senate committee as of May 2026 (secondary sources; palegis.us not readable). Some commercial guides claim 2026 Senate passage; I found no primary support.
- **Maine LD 1639 (131st Legislature, 2024):** passed the Senate 22-13 in March 2024, never voted in the House, not law.
- **Michigan Safe Patient Care Act** (HB 4311 / SB 228 in 2023-24 and later numbers): no evidence of passage.
- **Minnesota "Keeping Nurses at the Bedside Act" / § 144.7053:** never enacted.
- **New Jersey A.4143 "signed January 2026 for ICU 1:2":** no such bill found; the NJ Department of Health still describes posting and reporting only; the live NJ bills I saw (A.2418, A.1974, S.3022) are introduced bills. Treat the claim as false until a primary source shows otherwise.
- **New Mexico HB 172 (2026) "Safe Staffing Act", HB 72 and HB 138 (2025); Alaska SB 283 / HB 351; Hawaii SB 2763 / HB 1865; Ohio ratio bills (HB 154 and later); Illinois "Safe Patient Limits"; Massachusetts S.758 / H.1243; New York S.8083 and A.7095 (2025):** introduced or stalled, not law.
- **Federal S. 1709 and H.R. 3415 (119th Congress):** introduced, not law.

## 9. Wrong, never write

- "Three states have nurse-to-patient ratio laws" or "California, Oregon, Massachusetts are the only ratio states" (four: add New York ICU).
- "New York is a committee-only state" or "New York has no ratio."
- "Minnesota requires staffing committees" or "Minnesota passed the Keeping Nurses at the Bedside Act."
- "Nevada has a ratio law" or "Nevada's committee law covers every hospital" (large hospitals only; the 2025 ratio bill was vetoed).
- "Pennsylvania / Maine / Michigan / New Jersey / New Mexico has a mandated ratio law."
- "Washington has nurse-to-patient ratios" (committee law; plan-based).
- "Colorado sets ratios" (committee plus plan; no statutory ratio). "Maryland sets ratios" (it does not, and it is not fully in force until July 1, 2028).
- "Oregon does not set numeric minimums" (it does) and "Oregon's medical-surgical ratio moves to 1:4 in June 2026" (July 1, 2026).
- "California is the only state with comprehensive ratios" (stale; Oregon is a second multi-unit ratio state).
- "Massachusetts has a hospital-wide ratio" (ICU only; the default is not "1:1"; cite § 231, never § 227).
- "Texas requires a ratio," "Texas is disclosure-only," "Texas has no enforcement" (HB 2187, 2025), or "Texas hospitals must keep shift-by-shift compliance records" as a statutory duty.
- "The ANA counts 16 states" as a current figure, or "17 states" as a complete census (it is a verified floor).
- Any claim that a federal nurse-to-patient ratio law or CMS ratio rule exists (CMS says "adequate numbers"; critical access hospitals have a coverage rule, not a ratio).
- "Illinois / Ohio / Connecticut requires a ratio in the statute" (committee plans may contain ratios the committee sets, but the statute sets none).
- "California's psychiatric hospital ratios" with specific numbers (not read).
