# Claim-accuracy scan: low census / flex-home / VTO / send-home language

Scan date: 2026-08-10. Read-only, no edits made.

**Status re-checked 2026-09-02 (both findings verified against the tree, not assumed):**

- The `float-pool-nursing-small-hospitals` bench overclaim flagged in the notes at
  the bottom ("holds your per-diem bench as a defined group") is **RESOLVED** — the
  sentence returns zero hits. Remaining "bench" language in that post and in
  `after-hours-callout-coverage-small-hospitals` describes a roster the HOSPITAL
  builds, which is not a product claim.
- The single CHECK finding on `src/pages/proof-of-work.astro` is **STILL OPEN**,
  awaiting founder sign-off because it is an investor-facing page.

Kept as a record rather than deleted: it is the only written evidence that the
census/flex-home/VTO claim class was swept, and the search-term list is reusable.

Scope searched: `src/pages/` (30 files, all subdirectories), `src/data/post/` (120 files),
`src/data/article/` (6 files), `src/components/` (87 files) = **243 files searched**.

Search terms (case-insensitive, with variants): low census, census drop(s), census tier/band,
flex-home, flexing, send home, sent home, release staff, excess staff, overstaff(ed/ing),
understaff(ed/ing), VTO, voluntary time off, right-size, adjust staffing, reduce staffing,
cancel a shift, call off/called off, plus the exact phrase from the code-truth brief
("excess staff — consider flex-home or VTO").

**Total genuine hits (excluding CSS `flex` class names, "Flex Monitoring Team" org-name
citations, and internal code comments in `DemoScheduler.svelte`): 27**, across 1 page,
25 blog posts (one post had 2 distinct hits), and 1 component. 0 article hits.

## Verdict counts

| Verdict | Count |
| --- | --- |
| FINE | 26 |
| CHECK | 1 |
| REWORD | 0 |

**No REWORD findings.** Every sentence found either (a) describes the software computing/
flagging a requirement or a risk, never executing a release/flex/VTO action, (b) is general
industry/regulatory education about census-driven staffing or per-diem work with no claim
about our product, or (c) is a false-positive match on an unrelated phrase ("right-size the
platform," "Flex Monitoring Team," CSS `flex` utility classes).

## Findings table

| File | Exact sentence (verbatim) | Verdict | Suggested replacement |
| --- | --- | --- | --- |
| `src/pages/proof-of-work.astro` (unlisted, noindex, investor evidence page; "03 · What we built" section, engineering feature list) | "Shift-swap validation and census-driven staffing changes" | **CHECK** — ambiguous. Bundled with "shift-swap validation" (a real, code-verified computation/validation capability), so the intended meaning is almost certainly "census tiers change the computed required-staffing counts" (SHIPPED per capability inventory §3.6). But standing alone, "staffing changes" reads to an investor as the software *changing who is staffed* (i.e., executing a flex-home/send-home), which is not code-true — no workflow executes that. | "Shift-swap validation and census-driven required-staffing recalculation" (or "...and census tiers that change required staffing counts") — makes clear this is a computed requirement, not an executed staffing change. |
| `src/data/post/ukg-too-complex-small-hospital.md` | "...written for the administrator weighing whether to renew UKG or right-size to the operational requirements that define critical access hospital scheduling." | FINE | Not applicable — "right-size" refers to platform/vendor fit, not staffing levels. |
| `src/data/post/ukg-alternatives-small-hospitals.md` | "This guide compares 6 UKG alternatives for a Critical Access Hospital that needs to right-size scheduling to the operational scale the facility actually has." | FINE | Not applicable — same as above. |
| `src/data/post/float-pool-nursing-small-hospitals.md` | "Float pool nursing is the answer a big health system reaches for when one unit is short and another is overstaffed: pull a cross-trained nurse off the bench and send her where the need is." | FINE | Not applicable — general industry description of how large health systems run float pools, not an SSAI claim. |
| `src/data/post/what-is-per-diem-nursing.md` | "The cons: no health insurance or paid time off, no guaranteed hours, less continuity with patients, and being first to be floated or cancelled when census drops." | FINE | Not applicable — educational fact about per-diem employment in general, no product claim. |
| `src/data/post/what-is-nurse-rostering.md` | "Without an accurate roster, even the most carefully designed shift schedule will produce compliance gaps, unfair distribution, or overstaffing." | FINE | Not applicable — general risk statement about roster data quality, not a claim the software adjusts staffing. |
| `src/data/post/smartlinx-alternatives.md` | "This guide reviews the five best SmartLinx alternatives for hospitals ready to right-size their scheduling solution." | FINE | Not applicable — platform fit, not staffing levels. |
| `src/data/post/physician-medical-staff-scheduling-small-hospital.md` | "At 25 beds, two right-sized tools typically beat one stretched platform." | FINE | Not applicable — same pattern. |
| `src/data/post/nurse-shift-schedule-daily-coverage.md` | Heading: "How Can a Small Hospital Maintain Consistent Daily Coverage Without Overstaffing?" | FINE | Not applicable — the body text below is general operational advice (match hours to census, use on-call strategically); the "How SimpleScheduleAI Helps" paragraph underneath only claims the AI "builds the schedule and manages the callout coverage logic," no auto-flex/send-home claim. |
| `src/data/post/how-to-choose-nurse-scheduling-software.md` | "Start with fit and operating burden, not feature count. Score each vendor on seven questions: whether it is right-sized for a single unit..." | FINE | Not applicable — platform fit. |
| `src/data/post/healthcare-staffing-software-small-hospitals.md` | "Software cannot solve genuine understaffing... Healthcare staffing software optimizes the allocation of available nurses, it does not create nurses." | FINE | Not applicable — this is a limitations/honesty disclaimer explicitly stating the software does NOT solve staffing shortfalls. Well aligned with mode-applicability guidance. |
| `src/data/post/hospital-shift-schedule-reduce-overtime.md` | "If your facility is structurally understaffed, overtime is a hiring problem, not a scheduling problem. We identify this during setup rather than promising savings that aren't achievable." | FINE | Not applicable — same pattern, honest limitation. |
| `src/data/post/what-is-a-nurse-manager.md` | "...may also serve as a frontline nurse during understaffed shifts, participate in care delivery alongside the staff they supervise..." | FINE | Not applicable — describes a CAH nurse manager's real-world role, no product claim. |
| `src/data/post/best-scheduling-software-er-nurses.md` (SVG diagram text) | "Software that does not model volume-based coverage cannot flag understaffing until it is already a crisis." | FINE | Not applicable — "flag" is a detection/visibility claim (matches SHIPPED dashboard understaffed-shift counters), not an execution claim. |
| `src/data/post/best-tcp-alternative-for-cah.md` | "These gaps matter most at understaffed CAHs where the nurse manager has no scheduling coordinator to absorb the manual work..." | FINE | Not applicable — describes the buyer's situation, not the product. |
| `src/data/post/vendor-support-decline-nurse-scheduling-software.md` | "But a managed service provider who is understaffed, over-committed, or poorly run can still produce inconsistent support." | FINE | Not applicable — about vendor support staffing, unrelated topic entirely. |
| `src/data/post/nurse-scheduling-no-it-department-rural-hospital.md` | "...you have an internal-fairness problem masked as an agency-cost problem" (context: distinguishing unfair vs. understaffed schedules) | FINE | Not applicable — diagnostic advice to the reader. |
| `src/data/post/nursing-software-critical-access-hospitals.md` | "If a CAH doesn't have enough nurses to cover required shifts without exceeding overtime limits, scheduling software identifies the gap but can't fill it. Genuine understaffing is a hiring problem, not a technology problem." | FINE | Not applicable — explicit honest-limitation statement. |
| `src/data/post/nursing-scheduling-software-support.md` | "A CAH cannot run a shift understaffed because the scheduling system was unavailable and support took 4 hours to respond." | FINE | Not applicable — about support SLAs, not census/staffing execution. |
| `src/data/post/december-nurse-callout-surge-cah.md` | "December 27-30: Lowest patient volume of the year in many CAHs. Staff lean; this is when voluntary time-off requests for nurses who worked the holidays should be accommodated." | FINE | Not applicable — general seasonal-planning advice to the hospital manager (a human decision), not a claim the software executes VTO. |
| `src/data/post/healthcare-workforce-management-cah.md` | "...Workforce management failures, such as understaffed shifts, expired credentials, and undocumented substitutions, become audit findings." | FINE | Not applicable — regulatory/compliance education. |
| `src/data/post/how-to-stay-cms-compliant-nurse-scheduling.md` | "CMS expects each CAH to set adequate staffing based on patient census and acuity, and to demonstrate through records that the required nurse was on duty..." | FINE | Not applicable — describes the CMS regulatory standard, not our product. |
| `src/data/post/how-to-stay-cms-compliant-nurse-scheduling.md` | "SimpleScheduleAI is not the right fit for hospitals outside Texas, and it produces the documentation rather than making staffing decisions for you. The hospital still owns its staffing levels and its final compliance review." | FINE | Not applicable — this is an explicit, correct disclaimer that the software does NOT make staffing decisions; a model sentence for this exact concern. |
| `src/data/post/nurse-staffing-ratios-critical-access-hospital.md` | "...the committee sets staffing based on unit type, patient acuity and intensity, skill mix, the experience of the nursing staff..." | FINE | Not applicable — Texas regulatory education about staffing committees, not our product. |
| `src/data/post/what-is-healthcare-workforce-management.md` | "Demand forecasting: Using historical census and admission patterns to recommend staffing levels by shift and season" | FINE | Not applicable — listed as a generic capability of enterprise WFM vendors (Kronos/UKG, Workday, Infor), explicitly not attributed to SimpleScheduleAI. |
| `src/data/post/medical-scheduling-software-buyer-guide.md` | "A tool that wins on feature count but loses on implementation burden is the wrong tool for a short-staffed hospital." | FINE | Not applicable — about the buyer's situation. |
| `src/components/widgets/BuiltForCAHs.astro` | "At CAH staffing levels there is no slack. The replacement search has to be fast and right." | FINE | Not applicable — about callout replacement search (a real SHIPPED capability), not census/flex-home. |
| `src/data/article/will-ai-replace-nurses-montefiore-layoffs.md` | Citation: "Flex Monitoring Team, Historical CAH Data, April 2026 count." | FINE | Not applicable — proper noun (research organization name), false-positive match on "Flex." |
| `src/data/article/nurse-shortage-or-retention-crisis-rural-hospitals.md` | "...larger systems that can pay more, offer more schedule flexibility, and absorb more overhead." | FINE | Not applicable — about employer benefits in the labor market, unrelated to census/flex-home. |
| `src/data/article/st-charles-staffing-violations-detection-gap.md` | "A New York State Department of Health investigation found nearly 200 violations of the state safe-staffing law at St. Charles Hospital... with documented understaffing in the NICU, pediatrics, post-partum, the ICU, and the emergency department." (and 3 similar sentences in the same article) | FINE | Not applicable — journalistic reporting on a real, cited news event at a different hospital, not an SSAI product claim. |

## Notes / things outside this scan's scope but worth flagging separately

- `src/data/post/float-pool-nursing-small-hospitals.md` repeatedly claims the product "holds your per-diem bench as a defined group" ("it holds your per-diem bench as a defined group, so a callout generates a ranked shortlist..."). The capability inventory (`docs/seo/product-capability-inventory-2026-08.md` §3.4 and §6.11) states explicitly: **"Not a feature: there is no per-diem bench, no bench roster, no bench-health metric... Do not claim it."** This is a "bench" claim, not a census/send-home claim, so it fell outside this scan's search terms — flagging it here since it surfaced during the same pass and looks like the same category of overclaim.
