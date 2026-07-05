<!-- MIGRATION STAGING COPY - NOT FOR PUBLICATION - source: src/data/post/cms-pbj-reporting-scheduling-software.md - source-hash: 088e0187660e01b6cf97579c66b233ae8df18635 -->

---
draft: false
publishDate: 2026-06-26T00:00:00Z
updateDate: 2026-06-26T00:00:00Z
author: 'Pradeep Pandey'
title: 'CMS PBJ Reporting and Nurse Scheduling Software for Critical Access Hospitals'
excerpt: >
  Most Critical Access Hospitals do not file CMS Payroll-Based Journal data, because swing beds are
  exempt from PBJ. This guide gives the one-question test for whether you owe a filing, and shows what
  nurse scheduling software hands off when a hospital does.
image: https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Compliance
postType: mofu
tags:
  - cms-compliance
  - pbj-reporting
  - nurse-scheduling
  - critical-access-hospitals
  - healthcare-compliance
metadata:
  canonical: 'https://simplescheduleai.com/blog/cms-pbj-reporting-scheduling-software'
---

Picture a nurse manager at a swing-bed Critical Access Hospital who hears that CMS Payroll-Based Journal reporting is due in 45 days and starts pulling exports from the nurse scheduling software to reconcile against payroll. Days of work get scheduled for a filing the hospital almost certainly does not owe. The premise sounds plausible: swing beds deliver skilled nursing care, PBJ collects skilled nursing staffing data, so swing beds must report. That chain breaks at the first link.

Swing beds are exempt from PBJ. The reporting requirement attaches to a specific kind of certified facility, and a swing-bed CAH is not that kind, so most Critical Access Hospitals file nothing at all. This guide gives you the one-question test that settles which group you are in, then covers what PBJ requires for the rare hospital that does owe it.

## Key Takeaways

- Swing beds are exempt from CMS Payroll-Based Journal (PBJ) reporting. PBJ applies only to facilities certified under 42 CFR Part 483 Subpart B, and swing-bed care falls under the hospital's own certification, not that rule.
- Because swing-bed care is how most Critical Access Hospitals deliver skilled nursing, the large majority file no PBJ data at all and carry no nursing-home Five-Star rating.
- The one exception is a separately certified distinct-part skilled nursing unit, with its own CMS Certification Number and a Care Compare listing. That describes a small and shrinking minority of these hospitals.
- The decision rule is one question. Are you listed on Nursing Home Care Compare with your own SNF CMS Certification Number? If no, you do not file PBJ.
- For the rare hospital that does, PBJ is a downstream payroll-reporting task: the scheduling record hands off clean staffing-assignment data, and a payroll or PBJ vendor produces and files the XML.

## Table of Contents

- [What Is CMS Payroll-Based Journal Reporting?](#what-is-cms-payroll-based-journal-reporting)
- [Do Critical Access Hospitals Have to File PBJ Data?](#do-critical-access-hospitals-have-to-file-pbj-data)
- [How Do You Know Whether You Owe PBJ?](#how-do-you-know-whether-you-owe-pbj)
- [What Is the One Critical Access Hospital Case That Does Owe PBJ?](#what-is-the-one-critical-access-hospital-case-that-does-owe-pbj)
- [What Data Does PBJ Reporting Require?](#what-data-does-pbj-reporting-require)
- [What Does Nurse Scheduling Software Hand Off to a PBJ Filing?](#what-does-nurse-scheduling-software-hand-off-to-a-pbj-filing)
- [How Does SimpleScheduleAI Fit a Distinct-Part SNF Unit?](#how-does-simplescheduleai-fit-a-distinct-part-snf-unit)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

## What Is CMS Payroll-Based Journal Reporting?

CMS Payroll-Based Journal reporting is a federal requirement under [Section 6106 of the Affordable Care Act](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) and [42 CFR 483.70](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.70) that mandates electronically submitted staffing data from certified skilled nursing facilities and nursing facilities every quarter.

CMS uses PBJ data to calculate the staffing metrics that appear publicly on [Nursing Home Care Compare](https://www.medicare.gov/care-compare/) and feed the Five-Star Quality Rating System, so low staffing hours per resident day or heavy agency reliance pull a certified SNF's rating down and steer Medicare referrals away.

PBJ submissions are due about 45 days after each quarter closes, on or about May 15 (Q1), August 14 (Q2), November 14 (Q3), and February 14 (Q4), per the [CMS staffing data submission schedule](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission). A certified SNF that misses a deadline automatically receives a one-star staffing rating for that quarter, regardless of how well it was actually staffed.

## Do Critical Access Hospitals Have to File PBJ Data?

Most Critical Access Hospitals do not file CMS Payroll-Based Journal data. The requirement reaches only facilities certified under [42 CFR Part 483 Subpart B](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B), and swing beds operate under the hospital's own [42 CFR 482.58](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-E/section-482.58) certification instead. The [CMS PBJ Policy Manual](https://www.cms.gov/medicare/quality-initiatives-patient-assessment-instruments/nursinghomequalityinits/downloads/pbj-policy-manual-final-v25-11-19-2018.pdf) states plainly that the requirement does not apply to swing beds.

This matters because swing-bed care is how the large majority of Critical Access Hospitals deliver skilled nursing, and the practice is common: 36.2% of Critical Access Hospitals had an active skilled-nursing (swing) census in 2021, per [CAHMPAS data reported by the Rural Health Information Hub](https://www.ruralhealthinfo.org/topics/critical-access-hospitals). Those beds do not appear on [Nursing Home Care Compare](https://www.medicare.gov/care-compare/), carry no nursing-home Five-Star rating, and are exempt from the SNF Minimum Data Set requirement too.

## How Do You Know Whether You Owe PBJ?

Ask one question. Is your hospital listed on Nursing Home Care Compare with its own skilled nursing facility CMS Certification Number? If no, you do not file PBJ, because the obligation tracks SNF certification exactly.

To run the check, search your hospital name and state at [Nursing Home Care Compare](https://www.medicare.gov/care-compare/). A swing-bed-only hospital returns no nursing-home listing; one that operates a separately certified skilled nursing unit appears with its own SNF CMS Certification Number and a Five-Star rating. For a dated record, your Medicare Administrative Contractor can confirm your certification status in writing.

## What Is the One Critical Access Hospital Case That Does Owe PBJ?

One configuration does carry the obligation: a separately certified distinct-part skilled nursing unit, run by a small and shrinking minority of Critical Access Hospitals. That unit, not the hospital around it, owes PBJ.

The unit is a different regulatory entity from a swing bed even though both deliver skilled nursing: it is certified under the long-term care rules at 42 CFR Part 483, so its staffing goes to PBJ. A hospital may run at most one, and if yours has one you already know, because its certification and Care Compare listing are separate from the hospital's. Their number keeps falling, because swing-bed conversion has steadily replaced these units in rural settings: swing beds carry less regulatory overhead for the same short-stay skilled care.

## What Data Does PBJ Reporting Require?

PBJ requires daily data, not weekly or monthly summaries. For each calendar day in the reporting period, a certified SNF submission must include:

**Staffing data:**

- Hours worked by each staff category (RN, LPN, CNA, therapy, administrative)
- Whether hours are from direct employees or contract or agency staff
- Date worked and the staff member's job title code from the CMS-defined taxonomy

**Census data:**

- Resident census for each calendar day, the denominator for staffing hours per resident day

**Employee-level records:**

- For each employee with hours in the period: hire date, termination date if applicable, pay type (hourly or salaried), and hours per day

The data must be submitted in [CMS-specified XML format](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) through the iQIES system. CMS does not accept spreadsheet uploads, and the XML must conform to the current PBJ data specification exactly, including field formats and job title codes. That translation step, from accurate records to a valid file, is where a certified SNF's manual workflow breaks down.

## What Does Nurse Scheduling Software Hand Off to a PBJ Filing?

For the rare Critical Access Hospital that runs a distinct-part SNF unit, scheduling and filing split between two systems: the scheduling tool logs every shift assignment, change, and substitution with timestamps and staff identifiers, and the payroll or PBJ vendor turns that into the CMS submission. Four steps separate a clean scheduling record from a valid filing, and the vendor owns each one:

1. **Reconciling scheduled hours against actual hours worked.** Schedules show who was supposed to work; PBJ requires actual hours, so a timekeeping or payroll feed, not the schedule, is the system of record.

2. **Separating employee hours from agency hours.** PBJ reports direct-employee and contract or agency hours separately, so a schedule that tags employment type on each shift makes that split clean rather than manual.

3. **Matching staff job title codes.** CMS requires specific codes from its taxonomy; local role names are mapped to them during the vendor's setup.

4. **Producing the XML export.** A valid XML file is generated by the payroll or PBJ platform and submitted to iQIES. Scheduling does not produce this format.

The table below maps those four steps across the raw scheduling record, the full vendor filing, and the scheduling contribution to each:

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200 dark:border-slate-700">
        <th class="text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 align-top">PBJ handoff step</th>
        <th class="text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 align-top">Raw scheduling record</th>
        <th class="text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 align-top">Full PBJ filing (payroll or PBJ vendor)</th>
        <th class="text-left py-3 font-semibold text-slate-900 dark:text-slate-100 align-top">Scheduling contribution</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 align-top">Actual hours worked</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Scheduled hours only</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Pulled from timekeeping or payroll</td>
        <td class="py-3 text-slate-700 dark:text-slate-300 align-top">Scheduled baseline to reconcile against</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 align-top">Direct vs. agency split</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Often untracked</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Reported as separate fields</td>
        <td class="py-3 text-slate-700 dark:text-slate-300 align-top">Tagged on each shift in the schedule</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 align-top">CMS job-title codes</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Local titles only</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Mapped to CMS taxonomy at setup</td>
        <td class="py-3 text-slate-700 dark:text-slate-300 align-top">Consistent local roles to map from</td>
      </tr>
      <tr>
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 align-top">XML export to iQIES</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Not produced</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300 align-top">Generated and filed by the vendor</td>
        <td class="py-3 text-slate-700 dark:text-slate-300 align-top">Not produced</td>
      </tr>
    </tbody>
  </table>
</div>

Dedicated PBJ submission platforms sit on the filing side of that table. Vendors in this category include SmartLinx, OnShift, Inovalon, and Netsmart SimplePBJ; they produce and file the PBJ XML, and a distinct-part SNF unit typically pairs one with its payroll system and scheduling records. Confirm current capabilities before assuming any single tool covers both scheduling and filing.

## How Does SimpleScheduleAI Fit a Distinct-Part SNF Unit?

SimpleScheduleAI is guided-setup nurse scheduling software, not a self-configured platform the hospital integrates alone: the AI builds the schedule, 21 automated rule checks validate it, you approve (see the full model in [how SimpleScheduleAI works](/how-it-works)). It is built for acute-care nurse scheduling at Texas Critical Access Hospitals, where the swing-bed work most of these hospitals do falls outside PBJ entirely.

For the rare Critical Access Hospital that does run a distinct-part SNF unit, the contribution is narrow. The [AI nurse scheduling](/ai-nurse-scheduling) record gives that hospital a clean, timestamped staffing-assignment log, with every schedule, change, and callout substitution carrying its date, nurse, and reason, and direct staff tagged against agency or per-diem coverage. That is the staffing side a payroll or PBJ vendor reconciles against when it builds the XML. The rest of the filing is not part of the software: SimpleScheduleAI does not produce a PBJ file, integrate timekeeping for actual hours, or track resident census. So it is not the right fit for a multi-site SNF operator or a hospital that wants its scheduler to file directly to iQIES; those should use the dedicated PBJ vendors instead.

To see the scheduling layer that produces that staffing-assignment log, watch the AI build a compliant schedule and rank a callout shortlist live in the [interactive simulator](/simulator). For the broader compliance picture, including the staffing and supervision requirements at [42 CFR 485.631](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631) and Texas labor law, see the guide to [critical access hospital scheduling](/critical-access-hospital-scheduling), and the feature overview for [nurse scheduling software for CAHs](/nurse-scheduling-software). To keep day-to-day scheduling audit-ready, see how to [stay CMS compliant with nurse scheduling](/blog/how-to-stay-cms-compliant-nurse-scheduling), and for swing-bed context, read [what a Critical Access Hospital is](/blog/what-is-a-critical-access-hospital).

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    The single most useful thing a rural hospital administrator can do with PBJ is confirm it does not apply. Searching your hospital on Nursing Home Care Compare takes two minutes and ends the question with a dated answer you can keep on file. The worst outcome is spending quarterly staff time preparing a filing no agency expects.
  </p>
</div>

## What to Do This Week

Whether or not you think PBJ applies, here is a short diagnostic that settles it before the next quarter closes.

1. Run the one-question test. Search your hospital at [Nursing Home Care Compare](https://www.medicare.gov/care-compare/). If you do not appear with your own SNF CMS Certification Number, you do not file PBJ, and you can stop here.
2. Get it in writing if you want a record. Ask your Medicare Administrative Contractor to confirm your certification status, so you have a dated answer rather than an assumption.
3. If you do run a distinct-part SNF unit, name your filing vendor. Confirm whether your payroll system or a dedicated PBJ service produces and submits the XML to iQIES, and who owns that each quarter.
4. Map the staffing handoff for that unit. Write down which system owns actual hours, the direct-versus-agency split, CMS job-title codes, and the XML export, and who does each step.
5. Tighten the scheduling layer. If your staffing records are scattered across spreadsheets, fix that first. See [how SimpleScheduleAI works](/how-it-works) for the approach used with Texas Critical Access Hospitals, then bring the cleaned-up records to whichever vendor files your XML.

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Running a Critical Access Hospital in Texas?</p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">SimpleScheduleAI keeps a complete audit trail for every schedule and change by default, so your staffing-assignment record is clean and dated. Built for Texas Critical Access Hospitals, with flat monthly pricing and no IT setup.</p>
  <a href="/pricing" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See pricing →</a>
  <p class="text-slate-500 dark:text-slate-400 text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: Do Critical Access Hospitals have to submit CMS Payroll-Based Journal data?**

Most do not. PBJ applies only to certified skilled nursing facilities under 42 CFR Part 483, and swing beds, which is how most Critical Access Hospitals deliver skilled nursing, are exempt. The only one that files is a hospital running a separately certified distinct-part SNF unit with its own CMS Certification Number on Care Compare.

**Q: Are swing beds subject to PBJ reporting?**

No. The CMS PBJ Policy Manual states the requirement does not apply to swing beds. Swing-bed care operates under the hospital's own certification at 42 CFR 482.58, not the long-term care rules at 42 CFR Part 483 that govern PBJ, so those beds also carry no Care Compare listing or Five-Star rating.

**Q: How do I know if my hospital owes PBJ?**

Ask one question. Is your hospital listed on Nursing Home Care Compare with its own skilled nursing facility CMS Certification Number? If no, you do not file PBJ. Your Medicare Administrative Contractor can confirm your status in writing.

**Q: What is a distinct-part SNF unit?**

A distinct-part SNF unit is a separately certified skilled nursing facility operated inside a hospital, with its own CMS Certification Number, survey cycle, and Care Compare listing. Unlike a swing bed, it is certified under 42 CFR Part 483, so it carries the PBJ obligation swing beds do not. A hospital may run at most one.

**Q: What is the best PBJ reporting software for a hospital-based SNF unit?**

There is no single answer, because the work splits in two. Dedicated PBJ platforms such as SmartLinx, OnShift, Inovalon, and Netsmart SimplePBJ produce and file the XML to iQIES, while scheduling and timekeeping tools feed the staffing records they reconcile against. A distinct-part SNF unit usually needs one tool from each side, not one that claims both.

**Q: Does SimpleScheduleAI produce or file PBJ data?**

No. SimpleScheduleAI is nurse scheduling for acute-care staffing at Texas Critical Access Hospitals; it does not produce or file PBJ, and PBJ does not apply to swing-bed care. For a hospital that runs a distinct-part SNF unit, the scheduling record contributes the timestamped staffing-assignment log the payroll or PBJ vendor reconciles against.

## Sources

1. eCFR, 42 CFR Part 483 Subpart B (Requirements for Long Term Care Facilities). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B
2. eCFR, 42 CFR 483.70 (Administration). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.70
3. eCFR, 42 CFR 482.58 (Special requirements for hospital providers of long-term care services, swing beds). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-E/section-482.58
4. CMS/QTSO, Payroll-Based Journal (PBJ) Reference and Manuals. https://qtso.cms.gov/vendors/payroll-based-journal-pbj-vendors/reference-manuals
5. CMS, Staffing Data Submission (Payroll-Based Journal). https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission
6. CMS, Care Compare. https://www.medicare.gov/care-compare/
7. Rural Health Information Hub, Critical Access Hospitals (CAHMPAS skilled-nursing census data). https://www.ruralhealthinfo.org/topics/critical-access-hospitals
8. eCFR, 42 CFR 485.631 (Condition of participation: Staffing and staff responsibilities, Critical Access Hospitals). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling software company built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
