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
- Wrong: attributing this clause to 485.631
- Section covers: Provision of services.
- URL: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635
- Verified: 2026-07-03

### NSI 2025

- Approved figures: average cost to replace one staff RN = $61,110; national RN turnover = 16.4% (2025 report, CY2024 data)
- Wrong: $52,350 (unverified prior-edition figure — do not assert)
- Note: the NSI PDF URL is a rolling filename and now serves the 2026 edition; keep the citation label "2025 NSI National Health Care Retention and RN Staffing Report".
- URL: https://www.nsinursingsolutions.com/Documents/Library/NSI_National_Health_Care_Retention_Report.pdf
- Verified: 2026-07-02

### NNU fact sheet

- Approved: "roughly 1.15 million registered nurses hold active licenses but are not working as nurses"; NNU primary source dated May 26, 2026 (BLS data released May 15, 2026); NNU President Jamie Brown, RN; quote verbatim: "The data is clear that the U.S. nursing profession has a retention crisis, not a nurse shortage."
- Wrong: dating the fact sheet June 3, 2026 (that is a WNY Labor Today republication)
- URL: https://www.nationalnursesunited.org/press/new-data-shows-there-is-a-nurse-retention-crisis-not-a-nurse-shortage
- Verified: 2026-07-01

### JAMA Network Open (Feb 2026)

- Approved: research letter "Organizational Factors to Reattract Nurses to Hospital Employment" (Lasater, McHugh, Muir; published online Feb 9, 2026; e2556570; DOI 10.1001/jamanetworkopen.2025.56570). Adequate staffing named by 65% OF THE NONRETIRED nurses surveyed who had left a hospital job (1,113 of the nonretired subset; overall pool 4,043).
- Wrong: citing NNU for this stat; wrong: "65% of respondents" without the nonretired qualifier.
- URL: https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2844818
- Verified: 2026-07-01

### RHIhub rural workforce

- Approved: "63.1% of primary care HPSAs are in rural areas" (HRSA, State of the Primary Care Workforce, 2025); rural provider supply below metro.
- URL: https://www.ruralhealthinfo.org/topics/health-care-workforce
- Verified: 2026-07-01

### FLSA overtime

- Approved framing: "FLSA overtime thresholds" via DOL Fact Sheet #54. The 8-and-80 system is educational content only.
- URL: https://www.dol.gov/agencies/whd/fact-sheets/54-flsa-hospitals
- Verified: 2026-07-03

## Product truths

- Self-label: "AI-native nurse scheduling service". Never "managed service" as a self-label (category/comparison use is fine).
- Pricing (canonical line, verbatim): **Cost:** Flat monthly price by roster size: $1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees.
- NOT shipped (never claim as SSAI features): FLSA 8-and-80 calculation method; credential/license-expiry tracking.
- No customers, no pilots: SSAI is pre-launch. Never cite pilot observations, cohorts, facilities, or results. The free 60-day pilot offer is RETIRED; CTA = /how-it-works or /pricing + book-a-call.
- CTA pattern: one primary button + "Book a call with our team" text link below. Never /pilot.

## Maintenance log

| Date       | Change                                                         | By     |
| ---------- | -------------------------------------------------------------- | ------ |
| 2026-07-03 | Initial population from 2026-06-30..07-03 verified fact-checks | Claude |
