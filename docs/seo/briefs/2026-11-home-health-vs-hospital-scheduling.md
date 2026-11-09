# Brief: Home Health vs Hospital Scheduling (next-15 #15)

Date: 2026-11-09. Phase 1 research only. Every finding names its check; anything without one is labelled HYPOTHESIS.

## 1. Keyword collision

- `npm run keyword-check -- "home health scheduling software"`, `"home health vs hospital scheduling"`, `"home health care scheduling"`: all three returned "no collisions, clear to brief". No containment warns. `grep -i "home.health|home care" docs/seo/keyword-registry.json` found nothing.
- Proposed registry entry (the registry has no secondary field, so the secondary goes in `note`):
  - slug `home-health-care-scheduling-vs-hospital` (keep the old draft slug; it is the canonical in the draft frontmatter), type `post`, url `/blog/home-health-care-scheduling-vs-hospital`
  - primaryKeyword `home health scheduling software`, pillar `/critical-access-hospital-scheduling`
  - note: "Where-we-stop piece for hospitals that also run a home health agency. Secondary: home health vs hospital scheduling (10/mo). AI-answer and sales asset, not a ranking play: the SERP is vendor pages for home care agencies. Siblings: float-pool-nursing-small-hospitals, deputy-alternatives-healthcare."

## 2. Demand

DataForSEO `/v3/keywords_data/google_ads/search_volume/live`, US, 2026-11-09:

| Phrase | Vol/mo |
| --- | --- |
| home care scheduling software | 320 |
| home health scheduling | 210 |
| home health scheduler | 210 (same bucket as above) |
| **home health scheduling software** | **140** (12-mo range 70 to 320; last 4 months 70 to 90) |
| evv home health | 110 |
| home health care scheduling | 20 |
| home health staffing software | 20 |
| home health vs hospital | 10 |
| hospital based home health agency / hospital based home health | no data |

Chosen primary: **home health scheduling software (140)**, per the plan. The recent trend is 70 to 90, so treat 140 as generous. The "home health vs hospital" comparison framing has effectively no demand (10).

GSC, `get_advanced_search_analytics`, sc-domain:simplescheduleai.com, 2026-08-10 to 2026-11-08, query contains:
- "home health": 4 rows, 19 impressions, 0 clicks. Largest: "top home health care scheduling software" 13 impr at position 9.0, landing on `/blog/best-nurse-scheduling-software-2026`. The other three are agency-framed long questions landing on `nurse-scheduling-software-pricing` and `free-nurse-scheduling-software`.
- "home care": 8 rows, 20 impressions, 0 clicks, pages `nurse-scheduling-software-pricing`, `nurse-scheduling-software-implementation-time`, `/pricing`.
- Total 39, not the plan's 48; the plan's window and filter are unknown (HYPOTHESIS: different date window).
- Page contains "home-health": no rows. Query contains "evv" or "visit verification": no rows.
- Reading: the impressions are agency-framed (agency, caregiver). Zero come from a hospital that runs an agency. HYPOTHESIS, test: no GSC query exists for that reader yet, so the post serves AI answers and sales conversations, not search.

## 3. SERP map

DataForSEO `/v3/serp/google/organic/live/advanced`, "home health scheduling software", US/en, depth 10, 2026-11-09.

Result set: AI Overview citing AxisCare, ShiftCare, WellSky, Skedulo, CareSmartz360, Caring Data. Organic: Homecare Homebase, planningpme (thin), a Reddit thread (skip), CareVoyant, ShiftCare blog (Aug 2025), Teambridge, Enginehire, Caring Data (Jul 2026), Aaniie. Every result is a vendor or a home-care-agency buying guide. **Page-type mismatch: our "where we stop" explainer is not what this SERP rewards.** Expect no ranking; value is AI-answer and sales use.

(a) Table stakes (AI Overview text plus the three pages I fetched: HCHB, Caring Data, CareSmartz360; the other organic results were read from snippets only): caregiver or clinician matching by skills, availability and location; routing and travel time; EVV or GPS verification; billing and payroll linkage; mobile app; continuity of care.

(b) Gaps nobody covers (WebFetch of the three pages found no mention of hospital-based agencies or inpatient on any): a hospital-based agency at a small rural hospital; one staff pool serving inpatient shifts and home visits; what a hospital administrator should ask before buying one tool for both; where an inpatient tool stops.

(c) Length band: HCHB about 1,100; Caring Data about 1,000; CareSmartz360 about 2,200 words (WebFetch estimates, not counts). Target 1,300 to 1,700 words.

## 4. Facts

Dossier check: `grep -i "EVV|Cures|part 484|home health agency|hospital-based" docs/seo/facts-dossier.md` returned nothing. Only 485.631(a)(5) is in the dossier (line 41, re-verified 2026-11-03). Every item below except that one is NEW and needs a dossier entry.

1. **EVV scope.** medicaid.gov "Electronic Visit Verification", https://www.medicaid.gov/medicaid/home-community-based-services/guidance/electronic-visit-verification-evv, fetched 2026-11-09. Verbatim as returned: "Section 12006(a) of the 21st Century Cures Act" "mandates that states implement EVV for all Medicaid personal care services (PCS)"; "home health services (HHCS) that require an in-home visit by a provider"; "all Medicaid-funded PCS by January 1, 2020"; "HHCS by January 1, 2023". Statute: 42 U.S.C. 1396b(l) (Medicaid payments to States), Cornell LII, 2026-11-09: "with respect to any amount expended for personal care services or home health care services requiring an in-home visit"; "furnished in a calendar quarter beginning on or after January 1, 2020"; "The term 'home health care services' means services described in section 1396d(a)(7)". Medicaid only, binding on states. NEW. Not verified: any state-level (Texas HHSC) detail; do not state.
2. **HHA conditions of participation = 42 CFR Part 484.** Cornell LII 2026-11-09: heading "42 CFR Part 484 - HOME HEALTH SERVICES"; 484.1(a)(1) "Sections 1861(o) and 1891 of the Act, which establish the conditions that an HHA must meet" "in order to participate in the Medicare program". NEW. eCFR itself was unreachable (redirect to an unblock page), so Cornell is the source, same as the dossier's practice.
3. **CAH staffing 485.631(a)(5).** Cornell 2026-11-09, matches dossier: "(5) A registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients." ALREADY IN DOSSIER. Also 485.635(d) read: no "home health" in 485.635; "Nursing services must meet the needs of patients." 
4. **CAHs can run a home health agency.** No eCFR or CMS regulatory sentence found; RHIhub (HRSA-funded) topic page https://www.ruralhealthinfo.org/topics/home-health, 2026-11-09: "Facility-based home health agencies may be operated by a hospital, skilled nursing facility, or other facility."; "18.6% of Critical Access Hospitals (CAHs) and 29.2% of other rural hospitals offer home health services" (2022 data, page's own framing; the page says roughly half of CAHs counting health-system or joint-venture offerings). Authoritative, NOT a primary regulation. CMS "Hospitals" page, 2026-11-09, says components certified as other provider types, including "Home Health Agency", are "not considered parts of the hospital". That page is about hospitals generally, not CAHs. **Separate certification and a separate provider number for a CAH's agency: NOT verified** (CMS CCN ranges seen in search results only). Say "operated by", never "must be separately certified".
5. Old-draft wrong claims to drop: Aladtec "purpose-built for inpatient nursing" (dossier: public safety only), "credential enforcement", "CMS audit trail documentation", "ClearCare/Kinnser" product mapping (unverified), "will never exist", "separate tools typically needed".

## 5. Competitors (home health vendors are NOT in the competitor dossier; proposed new section)

Live pages fetched 2026-11-09:
- **WellSky**, "Home Health Care Software | WellSky", https://wellsky.com/home-health-software/: "optimizes intake, eligibility, and scheduling"; "schedule entire episodes of care in seconds"; "simplified schedules, real-time EVV, and offline access". Page has no routing content (describe only as "not on this page").
- **Homecare Homebase**, "Smart Scheduling Automation for Efficient Workflow", https://hchb.com/hchb-smart-scheduling-automation/: "automates visit planning within configurable agency guardrails"; "territory and mileage limits"; "nightly optimization plus real-time automation for admits, reassignments, declined visits". Blog page https://hchb.com/scheduling-software-for-home-care-that-supports-clinicians/: "optimizing routes so clinicians are not zigzagging across a territory".
- **AlayaCare**, "Home Care Scheduling Software | AlayaCare", https://www.alayacare.com/home-care-software/scheduling: "AI-powered scheduling engine matches caregivers to patients based on acuity, geography"; "supports a connected workflow from scheduling to electronic visit verification".
- AxisCare 403'd, Axxess page 404'd (not used). Aladtec and ShiftWizard: dossier lines 107-150 and 1295-1330 read. Aladtec = public safety only ("Public safety scheduling software built for 24/7 agencies"), no healthcare claim; ShiftWizard = HealthStream, hospital and health-system nursing, no CAH named. Do not cite either as home health or small-hospital proof. Neutral framing; no absence claims about any vendor.

## 6. Product boundaries

Inventory MODE APPLICABILITY: service copy claims what ARRIVES, never nurse logins. Relevant, claimable in service voice: the scheduling engine and compliant output; callout ranked shortlist; PRN availability as a hard constraint; Excel roster in, schedule export out; rules configured with you at onboarding. Employment types include `float` and `per_diem`. Canonical lines (registry, verbatim): triad "AI builds your schedule, our scheduling team checks it, you approve. No IT."; rule count **22 evaluators (13 safety + 9 fairness)**; setup-timeline "Onboarding takes 3 to 5 business days. First schedule inside two weeks."; pricing "Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees."

Must state we do NOT do (inventory §6): home health visits or visit-based scheduling; routing or travel time; EVV (no time clock or actual-hours tracking, #3); per-visit billing or any billing; EHR integration (#1); payroll (#2); credential expiry tracking (#5); non-nursing roles (`RN | LPN | CNA` only, #7: no therapists, social workers); multi-hospital or multi-tenant (#13); native mobile app (#8).

OPEN FOUNDER QUESTION: could the engine schedule a nurse who works both inpatient shifts and home visits? HYPOTHESIS, test: founder ruling or code check of how a non-shift assignment would be represented. Until settled, the post must not say SSAI covers the inpatient half of a mixed nurse's week.

## 7. Internal links

Live posts, `draft: false` per frontmatter. No live post targets this intent (registry clear; the only home-health-slug file is the draft).

Link TO the new post:
1. `deputy-alternatives-healthcare`, line 334: "Deputy remains adequate for non-clinical healthcare settings: outpatient clinics without inpatient care, home health agencies with stable caregiver pools, and administrative staff scheduling within a hospital." Anchor "home health agencies" fits. Caution: this claim and line 340 say Deputy works for home health; the new post says EVV and routing are table stakes, so reconcile (flag for the proofread agent).
2. `free-nurse-scheduling-software`, line 88: "For a small clinic, a home health agency, or any setting with predictable hours, free tools are often enough on their own." Anchor "a home health agency".
3. `float-pool-nursing-small-hospitals`, line 26: "...regional or shared-staffing arrangements with nearby facilities". A sentence about nurses shared with the hospital's own agency fits the "shared staff" section.

Link OUT: `/critical-access-hospital-scheduling`, `/nurse-scheduling-software`, `float-pool-nursing-small-hospitals`, `best-nurse-scheduling-software-critical-access-hospitals`, `cms-pbj-reporting-scheduling-software` (the "which certification number does what" logic is the same style), `/how-it-works`, `/pricing`.

## Outline (H2s, no "CAH")

1. Can one scheduling tool cover both home health and inpatient nursing?
2. How is scheduling a home health visit different from scheduling a hospital shift?
3. Which federal rules apply to a hospital's home health agency?
4. What is electronic visit verification and does it affect a hospital's scheduling tool?
5. What do home health scheduling vendors actually advertise?
6. What does an inpatient scheduling service cover, and what does it leave to your home health system?
7. What should a hospital with its own home health agency ask before buying a scheduling tool?
8. FAQ (grouped).

## Claims we must NOT make

- That SSAI does any home health task, EVV, routing, visit scheduling, billing, or covers nurses' home visits (open question above).
- That EVV applies to Medicare, or to all home health. It is Medicaid PCS and HHCS only.
- That a CAH's agency has a separate provider number or CCN (unverified).
- Any Texas licensing or Texas EVV claim (unchecked).
- Any feature-absence claim about a named vendor, or "you must use separate tools" / "will never exist".
- That Aladtec or ShiftWizard serves home health.
- "Credential enforcement or tracking", pilots or customers, "managed service" as self-label (use "AI-native nurse scheduling service"), "48 hours", "no per-nurse fees" mixed with product pricing.
- The 140/mo figure as expected traffic; no em or en dashes.

## Proposed dossier additions (not made)

EVV (section 12006, 42 USC 1396b(l), dates, Medicaid-only); 42 CFR Part 484 / 484.1; RHIhub 18.6% CAH and "facility-based" HHA sentences; home health vendor section (WellSky, HCHB, AlayaCare quotes above, dated 2026-11-09).
