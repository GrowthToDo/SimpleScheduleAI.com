---
draft: true
publishDate: 2026-06-20T00:00:00Z
updateDate: 2026-06-22T00:00:00Z
author: 'Pradeep Pandey'
title: 'CMS Payroll-Based Journal Reporting: What Scheduling Software Hands Off to PBJ'
excerpt: >
  If your Critical Access Hospital runs swing beds, CMS Payroll-Based Journal reporting turns your
  quarterly scheduling records into a public staffing rating with a hard deadline attached. This
  guide maps the four steps between a scheduling record and a valid PBJ file, and gives you the one
  question that tells you whether your tool covers them.
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

Consider a familiar pattern at swing-bed Critical Access Hospitals. A nurse manager spends days each quarter reconciling scheduling spreadsheets against payroll exports to produce the staffing data CMS Payroll-Based Journal submission requires. Agency hours sit in a second spreadsheet. Census data lives in a third system. One transcription error gets the file flagged, and the facility's public staffing rating takes the hit. Under CMS rules, a facility that misses the deadline automatically receives a [one-star staffing rating](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) for that quarter regardless of how well it was actually staffed.

The issue in that pattern is rarely the staffing itself. The floor was covered. The workflow simply produced the right hours in a format that took days of manual work to translate into what CMS will accept.

That translation burden is common for facilities with PBJ obligations. It is one of the higher-friction administrative tasks tied to the scheduling workflow, and most scheduling software does little to reduce it.

## Key Takeaways

- CMS Payroll-Based Journal (PBJ) reporting requires long-term care facilities and some CAH swing beds to submit daily staffing data every quarter, including hours worked by staff category, agency use, and census data.
- Most general-purpose and mid-market scheduling software does not produce PBJ-ready exports. The reconciliation between scheduling records and payroll records falls to the nurse manager or billing staff manually.
- A frequent PBJ failure mode is documentation, not staffing levels. A facility can have adequate staff on the floor and still miss the submission because the records were never captured in the format CMS requires.
- A scheduling tool that logs every shift assignment and change with timestamps produces the raw data for PBJ reporting automatically. Whether it exports in CMS-required format is a separate question to ask every vendor.
- CMS publishes staffing data collected through PBJ publicly on [Nursing Home Compare](https://www.medicare.gov/care-compare/). For facilities with swing beds, that public record affects star ratings and referral patterns.

## Table of Contents

- [What Is CMS Payroll-Based Journal Reporting?](#what-is-cms-payroll-based-journal-reporting)
- [Which Facilities Are Required to Submit PBJ Data?](#which-facilities-are-required-to-submit-pbj-data)
- [What Data Does PBJ Reporting Require?](#what-data-does-pbj-reporting-require)
- [Where Does Scheduling Software Fit in the PBJ Workflow?](#where-does-scheduling-software-fit-in-the-pbj-workflow)
- [What Does Automated PBJ Support Actually Look Like?](#what-does-automated-pbj-support-actually-look-like)
- [How Does SimpleScheduleAI Support PBJ Compliance?](#how-does-simplescheduleai-support-pbj-compliance)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

## What Is CMS Payroll-Based Journal Reporting?

CMS Payroll-Based Journal (PBJ) reporting is a federal requirement under [Section 6106 of the Affordable Care Act](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) that mandates electronically submitted staffing data from skilled nursing facilities and nursing homes every quarter. The data must include daily hours worked by staff type, whether staff are direct employees or agency, and daily resident census counts.

CMS uses PBJ data to calculate staffing metrics that appear publicly on [Nursing Home Compare](https://www.medicare.gov/care-compare/) and inform the Five-Star Quality Rating System. Facilities with low staffing hours per resident day or high agency reliance receive lower ratings, which directly affect Medicare referrals from discharge planners and families researching care options.

PBJ submissions are due about 45 days after each quarter closes, on or about May 15 (Q1), August 14 (Q2), November 14 (Q3), and February 14 (Q4), per the [CMS staffing data submission schedule](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission). Late or inaccurate submissions affect the facility's public staffing rating and can prompt CMS follow-up.

## Which Facilities Are Required to Submit PBJ Data?

Certified skilled nursing facilities (SNFs) and nursing facilities participating in Medicare and Medicaid are required to submit PBJ data. The requirement does not apply to all Critical Access Hospitals directly, but it does apply to any CAH that operates certified swing beds under the [SNF swing bed program](https://www.cms.gov/medicare/payment/prospective-payment-systems/skilled-nursing-facility-snf/swing-bed-providers).

A swing-bed CAH using its acute care beds for skilled nursing level care is subject to PBJ reporting for the staffing associated with those swing-bed days. The practical implication: a CAH with swing beds has PBJ obligations that a purely acute-care CAH does not. Many rural Texas CAHs operate swing beds as a critical revenue and access component.

Facilities that are uncertain about their PBJ status should review their certification documents and confirm with their Medicare Administrative Contractor (MAC). The [CMS PBJ Policy Manual](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) is the authoritative reference.

## What Data Does PBJ Reporting Require?

PBJ requires daily data, not weekly or monthly summaries. For each calendar day in the reporting period, the submission must include:

**Staffing data:**

- Hours worked by each staff category (RN, LPN, CNA, therapy, administrative)
- Whether hours are from direct employees or contract/agency staff
- Date worked and the staff member's job title code from the CMS-defined taxonomy

**Census data:**

- Resident census for each calendar day
- This is the denominator used to calculate staffing hours per resident day

**Employee-level records:**

- For each employee with hours in the period: hire date, termination date (if applicable), pay type (hourly vs. salaried), and hours per day

The data must be submitted in [CMS-specified XML format](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) through the QIES ASAP system. CMS does not accept spreadsheet uploads. The XML structure must conform to the current PBJ data specification exactly, including field formats and job title codes.

That XML requirement is where most manual workflows break down. A facility with accurate staffing records in a spreadsheet still faces a translation step to produce a valid CMS submission file.

## Where Does Scheduling Software Fit in the PBJ Workflow?

Scheduling software fits in the PBJ workflow at the point where staffing records are created. A scheduling tool that logs every shift assignment, every change, and every substitution, with timestamps and staff identifiers, produces the raw data that PBJ reporting requires.

The gap between "raw scheduling data" and "CMS-ready PBJ submission" involves:

1. **Reconciling scheduled hours against actual hours worked.** Schedules show who was supposed to work. Timekeeping or payroll records show who actually worked. PBJ requires actual hours, not scheduled hours. Tools that cannot reconcile these two sources leave that reconciliation to a manual step.

2. **Separating employee hours from agency hours.** PBJ requires that direct-employee hours and contract/agency hours be reported separately. A scheduling tool that does not track employment type creates a manual categorization step.

3. **Matching staff job title codes.** CMS requires specific job title codes from its taxonomy. A scheduling tool that uses job titles that do not map directly to CMS codes requires a manual translation.

4. **Producing the XML export.** Even facilities with accurate, categorized, reconciled staffing data still need to produce a valid XML file. Without a tool that generates this format, a third-party service or manual XML construction is required.

## What Does Automated PBJ Support Actually Look Like?

Automated PBJ support means the scheduling or timekeeping tool reduces or eliminates each of those four manual steps. Fully automated PBJ support looks like this:

- The tool logs actual hours (not just scheduled hours) from timekeeping integration or direct time entry
- Direct employee vs. agency staffing is tracked as a field on each shift record
- Job title codes are mapped from the facility's role definitions to CMS taxonomy codes during setup
- The tool generates a CMS-compliant XML export file that can be submitted directly to QIES ASAP

Here is how those four steps map across a raw scheduling record, a fully automated PBJ workflow, and where a scheduling-first tool like SimpleScheduleAI lands:

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="border-b border-slate-200 dark:border-slate-700">
        <th class="text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">PBJ handoff step</th>
        <th class="text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">Raw scheduling record</th>
        <th class="text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">Full PBJ automation</th>
        <th class="text-left py-3 font-semibold text-slate-900 dark:text-slate-100">Where SimpleScheduleAI lands</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Actual hours worked</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Scheduled hours only</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Pulled from timekeeping</td>
        <td class="py-3 text-slate-700 dark:text-slate-300">Scheduled hours, no timekeeping integration</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Direct vs. agency split</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Often untracked</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Field on every shift</td>
        <td class="py-3 text-slate-700 dark:text-slate-300">Tracked in the schedule record</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">CMS job-title codes</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Local titles only</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Mapped at setup</td>
        <td class="py-3 text-slate-700 dark:text-slate-300">Local roles, mapped manually downstream</td>
      </tr>
      <tr>
        <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">XML export to QIES ASAP</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Not produced</td>
        <td class="py-3 pr-4 text-slate-700 dark:text-slate-300">Generated by the tool</td>
        <td class="py-3 text-slate-700 dark:text-slate-300">Not produced, handled by a PBJ vendor</td>
      </tr>
    </tbody>
  </table>
</div>

Very few scheduling tools offer all four components. Some offer partial support: an audit-quality staffing log that reduces the reconciliation burden without eliminating it entirely. Understanding which steps your current tool automates and which it leaves manual is the first diagnostic.

A practical test: ask your current scheduling software vendor to walk you through how a nurse manager would produce a PBJ submission from the tool. If the answer involves exporting to Excel and manual reconciliation, the tool is providing scheduling functionality but not PBJ automation.

## How Does SimpleScheduleAI Support PBJ Compliance?

SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: the AI builds the schedule, our scheduling team checks it, you approve. It is built for acute-care nurse scheduling at Texas Critical Access Hospitals and does not produce a PBJ submission file. What it does is keep the staffing side of the record clean, so the documentation that feeds a PBJ reconciliation is already there when the quarter closes.

For CAHs with swing-bed PBJ obligations, the [AI nurse scheduling](/ai-nurse-scheduling) record contributes in three specific ways. You can see the full delivery model on the page describing [how SimpleScheduleAI works](/how-it-works).

**What it provides:**

- A complete, timestamped audit trail of every schedule, every change, and every callout substitution. This is the documentation layer that both surveyor reviews and PBJ reconciliation draw on. Every published schedule and every deviation from it is logged with the date, the nurse, and the reason.
- Separation of direct staff and agency or per-diem coverage in the schedule record, which reduces the manual categorization step for swing-bed PBJ reconciliation.
- A consistent source of staffing-assignment data that a payroll or PBJ-submission vendor can reconcile against, rather than a stack of disconnected spreadsheets.

**What it does not provide:**

- Direct XML export for CMS PBJ submission
- Timekeeping integration to reconcile scheduled hours against actual hours worked
- Census data tracking

One honest limitation: if a single tool that produces and submits the PBJ file is your primary purchasing criterion, SimpleScheduleAI is not that tool, and a swing-bed-heavy facility, a multi-site SNF operator, or a hospital that wants its scheduler to file directly to QIES ASAP should evaluate the dedicated PBJ vendors instead. For the full workflow, facilities with swing-bed obligations typically use their payroll system (ADP, Paylocity, or similar) to generate the hours data, then a dedicated PBJ submission service or their billing vendor to produce the XML file. SimpleScheduleAI's scheduling records serve as the source documentation for the staffing side of that workflow.

If PBJ automation is a primary purchasing criterion, evaluate vendors that explicitly market PBJ-ready exports alongside their scheduling functionality. Ask for a demo of the submission workflow, not just the scheduling interface.

For the broader compliance picture at a Critical Access Hospital, including the CAH staffing and supervision requirements at [42 CFR 485.631](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631) and Texas labor law, see the guide to [critical access hospital scheduling](/critical-access-hospital-scheduling). For a comparison of what [nurse scheduling software for CAHs](/nurse-scheduling-software) needs to cover, the feature overview lists the requirements that matter for small rural hospitals specifically. To keep day-to-day scheduling itself audit-ready, see how to [stay CMS compliant with nurse scheduling](/blog/how-to-stay-cms-compliant-nurse-scheduling), and for swing-bed context, read [what a Critical Access Hospital is](/blog/what-is-a-critical-access-hospital).

## What to Do This Week

If your CAH has swing-bed PBJ obligations, here is a short diagnostic you can run before the next quarter closes.

1. Confirm your PBJ status. Pull your CMS certification documents and verify whether your swing beds are certified under the SNF swing-bed program. If you are unsure, ask your Medicare Administrative Contractor in writing so you have a dated answer on file.
2. Run the vendor test. Ask your current scheduling vendor to walk a nurse manager through producing a PBJ submission from the tool. If the answer involves exporting to Excel and reconciling by hand, you have a manual gap, not an automated workflow.
3. Map your four steps. Write down, for each of the four handoff steps (actual hours, employee vs. agency, CMS job-title codes, XML export), which system owns it today and which person does it manually.
4. Date your audit trail. Check that your scheduling record captures every shift change with a timestamp, a nurse, and a reason. That log is the staffing-side source documentation a PBJ reconciliation and a surveyor both lean on.
5. Tighten the scheduling layer. If your staffing records are scattered across spreadsheets, fix that first. See [how SimpleScheduleAI works](/how-it-works) for the managed approach we use with Texas Critical Access Hospitals, then bring the cleaned-up records to whichever PBJ-submission vendor files your XML.

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Want CMS-ready staffing documentation without the quarterly spreadsheet scramble?</p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">SimpleScheduleAI keeps a complete audit trail for every schedule and change by default, so the staffing side of your PBJ reconciliation is already in order. Built for Texas Critical Access Hospitals, with flat monthly pricing and no IT setup.</p>
  <a href="/how-it-works" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how SimpleScheduleAI works →</a>
  <p class="mt-4 mb-0 text-sm"><a href="https://cal.com/gautham-8bdvdx/30min" class="text-blue-600 dark:text-blue-400 underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: Do Critical Access Hospitals have to submit CMS Payroll-Based Journal data?**

Not all CAHs. PBJ reporting applies to certified skilled nursing facilities and nursing facilities. A CAH that operates certified swing beds under the SNF swing bed program has PBJ obligations for the staffing associated with those swing-bed days. A purely acute-care CAH without swing beds does not. Confirm your status with your Medicare Administrative Contractor and review your certification documents.

**Q: What happens if a facility submits inaccurate PBJ data?**

CMS can apply civil monetary penalties for noncompliance. The more common consequence is the public record: inaccurate or missing PBJ data lowers the facility's staffing rating on Nursing Home Compare, which affects referral patterns from hospital discharge planners, and a correction can take more than one reporting period to surface. The [CMS PBJ Policy Manual](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission) outlines the correction process.

**Q: Can a scheduling tool alone produce a PBJ submission?**

Only if it includes timekeeping (to record actual vs. scheduled hours), employment type tracking (direct vs. agency), CMS job title code mapping, and XML export functionality. Most scheduling tools provide some but not all of these. For most small facilities, the practical workflow involves the scheduling tool for staffing records, a payroll system for actual hours, and either a billing vendor or a dedicated PBJ service to produce the submission file.

**Q: How often does CMS update the PBJ data specification?**

CMS updates the PBJ data specification periodically. The current specification and any updates are published on the [CMS PBJ resource page](https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission). Facilities and vendors using PBJ export tools should confirm they are using the current specification before each quarterly submission. Submissions based on outdated specifications are rejected.

**Q: What is the best PBJ reporting software for a CAH?**

There is no single answer, because the category splits in two. Dedicated PBJ submission platforms (vendors in this space include Smartlinx, OnShift, Inovalon, and Netsmart SimplePBJ) produce and file the XML to QIES ASAP. Scheduling and timekeeping tools feed the staffing records those platforms reconcile against. Confirm current capabilities with each vendor; a CAH usually needs one tool from each side, not one tool that claims both.

**Q: What is the relationship between PBJ staffing data and the Five-Star rating?**

CMS uses PBJ data to calculate RN hours per resident day and total staffing hours per resident day, which are two of the metrics used in the Staffing domain of the [Five-Star Quality Rating System](https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/downloads/usersguide.pdf). Facilities below the national median on these metrics receive fewer stars in the Staffing domain. For swing-bed CAHs, the Five-Star rating affects how discharge planners at regional hospitals route post-acute referrals.

## Sources

1. CMS, Staffing Data Submission (Payroll-Based Journal). https://www.cms.gov/medicare/quality/nursing-home-improvement/staffing-data-submission
2. CMS, Care Compare. https://www.medicare.gov/care-compare/
3. CMS, Skilled Nursing Facility (SNF) Swing Bed Providers. https://www.cms.gov/medicare/payment/prospective-payment-systems/skilled-nursing-facility-snf/swing-bed-providers
4. eCFR, 42 CFR Section 485.631 (Condition of participation: Staffing and staff responsibilities, Critical Access Hospitals). https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631
5. CMS, Five-Star Quality Rating System Technical Users' Guide. https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/downloads/usersguide.pdf

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
