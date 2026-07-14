# "CAHs have no IT" Overstatement — Sitewide Audit (pending sweep)

**The error:** many live posts assert as fact that a Critical Access Hospital has **no IT
department / no IT team / no IT staff**. That overstates. Per HealthIT.gov / rural-health
research (and founder domain knowledge), CAHs have **limited** IT — typically one person, a
contracted MSP, or IT shared through a regional-system affiliation — not zero. What they
lack is a **dedicated IT-plus-HRIS-plus-workforce-management bench** that an enterprise
platform assumes.

**Keep vs fix (the judgment per instance):**
- KEEP — product/capability claims about OUR service or a tool: "No IT setup", "no IT
  involvement required", "runnable with no IT team", "set up without an IT department".
  These describe what the service/tool requires, not what the hospital has. Accurate.
- FIX — factual claims about what a CAH HAS: "the hospital has no IT department", "no IT
  staff to configure it", "CAHs operate with no dedicated IT department at all", "the nurse
  manager is the IT support", "there is no IT department to maintain it".
  Reframe to: "limited IT (typically one person or a contracted service), and no dedicated
  HRIS or workforce-management staff".

**Reference correction (already applied):** kronos-nurse-scheduling-problems-small-hospitals
(commit 33a748a) is the worked example of the reframe. best-nurse-scheduling-software-texas
was audited and is clean (no such claim).

## Live posts carrying the factual overstatement (audit 2026-07-14; verify each line)

- ai-nurse-scheduling-vs-traditional.md — "there is no IT department" (CAH claim)
- best-nurse-scheduling-software-critical-access-hospitals.md — "no IT department behind her"; "A CAH has no workforce-management analyst or HRIS team"; constraint list "no IT department" (money-cluster; priority)
- critical-access-hospital-requirements.md — "small teams that often have no IT department"
- float-pool-nursing-small-hospitals.md — "no on-site IT to manage a competency matrix"
- healthcare-workforce-management-cah.md — "Most critical access hospitals operate with no dedicated IT department at all" (strongest overstatement; priority)
- hipaa-compliant-nurse-scheduling-software.md — "with no IT department"
- hospital-staff-scheduling-software-critical-access.md — "no IT department" (x4), incl. "There is no IT department to configure and maintain it"
- hospital-staffing-software-features-cah.md — "no IT department", "no IT team", heading "Without an IT Department" (note: this is the pillar-linked features post)
- inhouse-health-vs-simplescheduleai.md — "no IT department/staff" (x6)
- m7-health-vs-simplescheduleai.md — "no IT department/staff" (x5)

Borderline / likely KEEP (product-capability framing, review each): aladtec-alternatives
("runnable with no IT team"), and the many "no IT setup / no IT involvement" CTA lines.

## Execution notes
- Reframe per the keep-vs-fix rule above; do NOT blanket-replace (breaks legit product claims).
- After each edit: `node scripts/check-blog.mjs <path>`.
- Pairs naturally with the Texas-overtime sweep (docs/seo/texas-overtime-correction-sweep.md)
  — several of the same posts appear on both lists; batch them into one correctness pass.
