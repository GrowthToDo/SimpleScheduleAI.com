---
draft: true
publishDate: 2026-06-20T00:00:00Z
updateDate: 2026-06-26T00:00:00Z
author: 'Pradeep Pandey'
title: 'CMS PBJ Reporting and Nurse Scheduling Software for Critical Access Hospitals'
excerpt: >
  Most Critical Access Hospitals do not file CMS Payroll-Based Journal data, because swing beds are
  exempt from PBJ. This guide covers where PBJ reporting and nurse scheduling software actually fit for
  a Critical Access Hospital: the one-question test for whether you owe a filing, and what scheduling
  hands off to the payroll or PBJ vendor for the rare distinct-part skilled nursing unit that does.
image: https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Compliance
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

Swing beds are exempt from PBJ. The reporting requirement attaches to a specific kind of certified facility, and a swing-bed CAH is not that kind. The result is that most Critical Access Hospitals file nothing at all, and the few that do owe a filing know it for a separate reason. This guide gives you the one-question test that settles which group you are in, then covers what PBJ actually requires for the rare hospital that does owe it.

## Key Takeaways

- Swing beds are exempt from CMS Payroll-Based Journal (PBJ) reporting. PBJ applies only to facilities certified under 42 CFR Part 483 Subpart B, and swing-bed care at a Critical Access Hospital falls under the hospital's own certification, not that rule.
- Because swing-bed care is how the large majority of Critical Access Hospitals deliver skilled nursing, most of these hospitals file no PBJ data at all and receive no nursing-home Five-Star rating.
- The one exception is a separately certified distinct-part skilled nursing unit: its own CMS Certification Number, listed on Nursing Home Care Compare. This describes a small and shrinking minority of Critical Access Hospitals.
- The decision rule is one question. Are you listed on Nursing Home Care Compare with your own SNF CMS Certification Number? If no, you do not file PBJ.
- For the rare hospital that does run a distinct-part skilled nursing unit, PBJ is a downstream payroll-reporting task. The scheduling record hands off clean staffing-assignment data, and a payroll or PBJ vendor produces and files the actual XML.

## Table of Contents

- [Do Critical Access Hospitals Have to File PBJ Data?](#do-critical-access-hospitals-have-to-file-pbj-data)
- [How Do You Know Whether You Owe PBJ?](#how-do-you-know-whether-you-owe-pbj)
- [What Is the One Critical Access Hospital Case That Does Owe PBJ?](#what-is-the-one-critical-access-hospital-case-that-does-owe-pbj)
- [What Is CMS Payroll-Based Journal Reporting?](#what-is-cms-payroll-based-journal-reporting)
- [What Data Does PBJ Reporting Require?](#what-data-does-pbj-reporting-require)
- [What Does Nurse Scheduling Software Hand Off to a PBJ Filing?](#what-does-nurse-scheduling-software-hand-off-to-a-pbj-filing)
- [How Does SimpleScheduleAI Fit a Distinct-Part SNF Unit?](#how-does-simplescheduleai-fit-a-distinct-part-snf-unit)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

## Do Critical Access Hospitals Have to File PBJ Data?

Most Critical Access Hospitals do not file CMS Payroll-Based Journal data. PBJ applies only to facilities certified under [42 CFR Part 483 Subpart B](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B), the requirements for long-term care facilities. Swing beds operate under the hospital's own [42 CFR 482.58](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-E/section-482.58) certification and are excluded. The [CMS PBJ Policy Manual](https://www.cms.gov/files/document/pbj-policy-manual-final-v25-11-19-2018.pdf) states the requirement does not apply to swing beds.

This matters because swing-bed care is how the large majority of Critical Access Hospitals deliver skilled nursing. A swing bed lets a small rural hospital use an acute-care bed for short skilled-nursing-level stays without a separate facility, and the practice is common: 36.2% of Critical Access Hospitals had an active skilled-nursing (swing) census in 2021, per [CAHMPAS data reported by the Rural Health Information Hub](https://www.ruralhealthinfo.org/topics/critical-access-hospitals). Those beds do not appear on [Nursing Home Care Compare](https://www.medicare.gov/care-compare/), they carry no nursing-home Five-Star rating, and they are also exempt from the SNF Minimum Data Set requirement. A swing-bed census is real, ongoing care, but it is not the regulatory thing PBJ measures.

The practical takeaway is plain. If your hospital delivers its skilled nursing through swing beds, your PBJ obligation is almost certainly nothing. The next section gives you the test that confirms it in one question.

## How Do You Know Whether You Owe PBJ?

Ask one question. Is your hospital listed on Nursing Home Care Compare with its own skilled nursing facility CMS Certification Number? If the answer is no, you do not file PBJ. PBJ obligation tracks SNF certification exactly, and SNF certification is what puts a provider on Care Compare with its own number.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    The single most useful thing a rural hospital administrator can do with PBJ is confirm it does not apply. Searching your hospital on Nursing Home Care Compare takes two minutes and ends the question with a dated answer you can keep on file. Most administrators who think they have a PBJ problem do not have one, and the worst outcome is spending quarterly staff time preparing a filing no agency expects.
  </p>
</div>

To run the check, search your hospital name and state at [Nursing Home Care Compare](https://www.medicare.gov/care-compare/). A swing-bed-only CAH will not return a nursing-home listing. A hospital that operates a separately certified skilled nursing unit will appear with a distinct SNF CMS Certification Number, a Five-Star rating, and staffing measures. That listing, or its absence, is the answer. If you want it in writing, your Medicare Administrative Contractor can confirm your certification status so you have a dated record.

## What Is the One Critical Access Hospital Case That Does Owe PBJ?

The one case is a separately certified distinct-part skilled nursing unit. A small and shrinking minority of Critical Access Hospitals operate a distinct part of the building as a hospital-based SNF that is certified on its own, holds its own CMS Certification Number, and appears on Nursing Home Care Compare. That unit, not the hospital around it, carries the PBJ obligation.

A distinct-part SNF unit is a different regulatory entity from a swing bed even though both deliver skilled nursing. The unit is certified under the long-term care rules at 42 CFR Part 483, so the staffing in that unit is reported to PBJ like any freestanding nursing home. A hospital may operate at most one hospital-based SNF. If your hospital has one, you already know, because the certification, survey cycle, and Care Compare listing are separate from the hospital's.

This is the narrow exception, not the norm. Swing-bed conversion has steadily replaced hospital-based distinct-part SNF units in rural settings because swing beds carry less regulatory overhead for the same short-stay skilled care. So for the typical Critical Access Hospital, the honest answer remains: no distinct-part SNF unit, no PBJ.

## What Is CMS Payroll-Based Journal Reporting?

CMS Payroll-Based Journal reporting is a federal requirement under [Section 6106 of the Affordable Care Act](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) and [42 CFR 483.70](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.70) that mandates electronically submitted staffing data from certified skilled nursing facilities and nursing facilities every quarter. The data must include daily hours worked by staff type, whether staff are direct employees or agency, and daily resident census counts.

CMS uses PBJ data to calculate staffing metrics that appear publicly on [Nursing Home Care Compare](https://www.medicare.gov/care-compare/) and inform the Five-Star Quality Rating System. A certified SNF with low staffing hours per resident day or high agency reliance receives lower ratings, which affect Medicare referrals from discharge planners and families researching care options. Swing-bed CAHs are absent from this entire system because they are not certified SNFs.

PBJ submissions are due about 45 days after each quarter closes, on or about May 15 (Q1), August 14 (Q2), November 14 (Q3), and February 14 (Q4), per the [CMS staffing data submission schedule](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission). A certified SNF that misses a quarter's deadline automatically receives a one-star staffing rating for that quarter regardless of how well it was actually staffed. That automatic penalty only reaches a facility that is actually PBJ-obligated, so it never lands on a swing-bed CAH.

## What Data Does PBJ Reporting Require?

PBJ requires daily data, not weekly or monthly summaries. For each calendar day in the reporting period, a certified SNF submission must include:

**Staffing data:**

- Hours worked by each staff category (RN, LPN, CNA, therapy, administrative)
- Whether hours are from direct employees or contract or agency staff
- Date worked and the staff member's job title code from the CMS-defined taxonomy

**Census data:**

- Resident census for each calendar day
- This is the denominator used to calculate staffing hours per resident day

**Employee-level records:**

- For each employee with hours in the period: hire date, termination date if applicable, pay type (hourly or salaried), and hours per day

The data must be submitted in [CMS-specified XML format](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) through the iQIES system. CMS does not accept spreadsheet uploads. The XML structure must conform to the current PBJ data specification exactly, including field formats and job title codes.

That XML requirement is where a certified SNF's manual workflow breaks down. A facility with accurate staffing records in a spreadsheet still faces a translation step to produce a valid CMS submission file. A swing-bed CAH skips this translation step. A distinct-part SNF unit hands it to a payroll or PBJ vendor.

## What Does Nurse Scheduling Software Hand Off to a PBJ Filing?

For the rare Critical Access Hospital that runs a distinct-part SNF unit, nurse scheduling software produces the staffing-assignment record and the payroll or PBJ vendor produces the filing. A scheduling tool that logs every shift assignment, every change, and every substitution, with timestamps and staff identifiers, captures the raw staffing side. It does not, on its own, produce the CMS submission.

The gap between a clean scheduling record and a valid PBJ submission involves four steps the filing vendor handles:

1. **Reconciling scheduled hours against actual hours worked.** Schedules show who was supposed to work. Timekeeping or payroll records show who actually worked. PBJ requires actual hours, so a payroll feed, not a schedule, is the system of record for hours.

2. **Separating employee hours from agency hours.** PBJ reports direct-employee hours and contract or agency hours separately. A schedule that tags employment type on each shift makes that split clean rather than manual.

3. **Matching staff job title codes.** CMS requires specific job title codes from its taxonomy. Local role names are mapped to CMS codes during the vendor's setup.

4. **Producing the XML export.** A valid XML file is generated by the payroll or PBJ platform and submitted to iQIES. Scheduling does not produce this format.

Here is how those four steps map across a raw scheduling record, the full PBJ filing the vendor owns, and where a scheduling-first tool contributes:

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

Dedicated PBJ submission platforms sit on the filing side of that table. Vendors in this category include SmartLinx, OnShift, Inovalon, and Netsmart SimplePBJ; they produce and file the PBJ XML. A distinct-part SNF unit typically pairs one of those with its payroll system and its scheduling records. Confirm current capabilities with each vendor before assuming any single tool covers both scheduling and filing.

## How Does SimpleScheduleAI Fit a Distinct-Part SNF Unit?

SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: the AI builds the schedule, our scheduling team checks it, you approve. It is built for acute-care nurse scheduling at Texas Critical Access Hospitals. It does not produce or file a PBJ submission, and PBJ does not apply to the swing-bed work most of these hospitals do. You can see the full delivery model on the page describing [how SimpleScheduleAI works](/how-it-works).

For the rare Critical Access Hospital that does run a distinct-part SNF unit, the honest contribution is narrow and specific. The [AI nurse scheduling](/ai-nurse-scheduling) record gives that hospital a clean, timestamped staffing-assignment log: every published schedule, every change, and every callout substitution recorded with the date, the nurse, and the reason. A payroll or PBJ vendor can reconcile that record against actual hours when it builds the XML, instead of starting from a stack of disconnected spreadsheets. The schedule also tags direct staff against agency or per-diem coverage, which lines up with the direct-versus-agency split the filing needs.

One honest limitation: SimpleScheduleAI does not produce a PBJ file, integrate timekeeping to capture actual hours, or track resident census, so a multi-site SNF operator or a hospital that wants its scheduler to file directly to iQIES should evaluate the dedicated PBJ vendors instead. Our job is the scheduling itself; PBJ is a downstream payroll-reporting task for certified SNFs, and the scheduling record is the staffing-side source it draws on.

For the broader compliance picture at a Critical Access Hospital, including the CAH staffing and supervision requirements at [42 CFR 485.631](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631) and Texas labor law, see the guide to [critical access hospital scheduling](/critical-access-hospital-scheduling). For what [nurse scheduling software for CAHs](/nurse-scheduling-software) needs to cover, the feature overview lists the requirements that matter for small rural hospitals specifically. To keep day-to-day scheduling itself audit-ready, see how to [stay CMS compliant with nurse scheduling](/blog/how-to-stay-cms-compliant-nurse-scheduling), and for swing-bed context, read [what a Critical Access Hospital is](/blog/what-is-a-critical-access-hospital).

## What to Do This Week

Whether or not you think PBJ applies, here is a short diagnostic that settles it before the next quarter closes.

1. Run the one-question test. Search your hospital at [Nursing Home Care Compare](https://www.medicare.gov/care-compare/). If you do not appear with your own SNF CMS Certification Number, you do not file PBJ, and you can stop here.
2. Get it in writing if you want a record. Ask your Medicare Administrative Contractor to confirm your certification status, so you have a dated answer on file rather than an assumption.
3. If you do run a distinct-part SNF unit, name your filing vendor. Confirm whether your payroll system or a dedicated PBJ service produces and submits the XML to iQIES, and who owns that submission each quarter.
4. Map the staffing handoff for that unit. For the SNF unit only, write down which system owns actual hours, the direct-versus-agency split, CMS job-title codes, and the XML export, and which person does each step.
5. Tighten the scheduling layer. If your staffing records are scattered across spreadsheets, fix that first. See [how SimpleScheduleAI works](/how-it-works) for the approach we use with Texas Critical Access Hospitals, then bring the cleaned-up records to whichever vendor files your XML.

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Running a Critical Access Hospital in Texas?</p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">SimpleScheduleAI keeps a complete audit trail for every schedule and change by default, so your staffing-assignment record is clean and dated. Built for Texas Critical Access Hospitals, with flat monthly pricing and no IT setup.</p>
  <div class="flex flex-col sm:flex-row gap-3 justify-center">
    <a href="/how-it-works" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works</a>
    <a href="https://cal.com/gautham-8bdvdx/30min" class="inline-block border border-blue-600 text-blue-700 dark:text-blue-300 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 font-semibold px-6 py-3 rounded-lg transition-colors duration-200">Book a call with our team</a>
  </div>
</div>

## Frequently Asked Questions

**Q: Do Critical Access Hospitals have to submit CMS Payroll-Based Journal data?**

Most do not. PBJ applies only to certified skilled nursing facilities under 42 CFR Part 483. Swing beds, which are how the large majority of Critical Access Hospitals deliver skilled nursing, are exempt. The only CAH that files PBJ is one operating a separately certified distinct-part skilled nursing unit with its own CMS Certification Number on Nursing Home Care Compare.

**Q: Are swing beds subject to PBJ reporting?**

No. The CMS PBJ Policy Manual states the requirement does not apply to swing beds. Swing-bed care operates under the hospital's own certification at 42 CFR 482.58, not the long-term care rules at 42 CFR Part 483 that govern PBJ. Swing-bed CAHs also do not appear on Nursing Home Care Compare and receive no nursing-home Five-Star rating.

**Q: How do I know if my hospital owes PBJ?**

Ask one question. Is your hospital listed on Nursing Home Care Compare with its own skilled nursing facility CMS Certification Number? If no, you do not file PBJ. Searching your hospital name and state on Care Compare returns a nursing-home listing only if you operate a separately certified SNF unit. Your Medicare Administrative Contractor can confirm your status in writing.

**Q: What is a distinct-part SNF unit?**

A distinct-part SNF unit is a separately certified skilled nursing facility operated inside a hospital, with its own CMS Certification Number, survey cycle, and Nursing Home Care Compare listing. It is a different regulatory entity from a swing bed, even though both deliver skilled nursing. A hospital may run at most one hospital-based SNF, and that unit carries the PBJ obligation the swing beds do not.

**Q: What is the best PBJ reporting software for a hospital-based SNF unit?**

There is no single answer, because the work splits in two. Dedicated PBJ submission platforms (vendors in this space include SmartLinx, OnShift, Inovalon, and Netsmart SimplePBJ) produce and file the XML to iQIES. Scheduling and timekeeping tools feed the staffing records those platforms reconcile against. A distinct-part SNF unit usually needs one tool from each side, not one tool that claims both.

**Q: Does SimpleScheduleAI produce or file PBJ data?**

No. SimpleScheduleAI is nurse scheduling for acute-care staffing at Texas Critical Access Hospitals; it does not produce or file PBJ, and PBJ does not apply to swing-bed care. For a hospital that runs a distinct-part SNF unit, the scheduling record contributes a clean, timestamped staffing-assignment log that the payroll or PBJ vendor can reconcile against when it builds the XML.

## Sources

1. eCFR, 42 CFR Part 483 Subpart B (Requirements for Long Term Care Facilities). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B
2. eCFR, 42 CFR 483.70 (Administration). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.70
3. eCFR, 42 CFR 482.58 (Special requirements for hospital providers of long-term care services, swing beds). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-E/section-482.58
4. CMS, Payroll-Based Journal (PBJ) Policy Manual. https://www.cms.gov/files/document/pbj-policy-manual-final-v25-11-19-2018.pdf
5. CMS, Staffing Data Submission (Payroll-Based Journal). https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission
6. CMS, Care Compare. https://www.medicare.gov/care-compare/
7. Rural Health Information Hub, Critical Access Hospitals (CAHMPAS skilled-nursing census data). https://www.ruralhealthinfo.org/topics/critical-access-hospitals
8. eCFR, 42 CFR 485.631 (Condition of participation: Staffing and staff responsibilities, Critical Access Hospitals). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
