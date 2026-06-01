---
draft: true
publishDate: 2026-06-20T00:00:00Z
updateDate: 2026-05-02T00:00:00Z
author: 'Pradeep Pandey'
title: 'CMS Payroll-Based Journal Reporting: What Your Scheduling Software Should Handle Automatically'
excerpt: >
  CMS Payroll-Based Journal reporting requires hospitals to submit detailed staffing data
  every quarter. Most nurse scheduling software leaves that reconciliation entirely to the
  nurse manager. Here is what automated PBJ support looks like, and how to tell if your
  current tool is actually producing it.
image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
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

## Key Takeaways

- CMS Payroll-Based Journal (PBJ) reporting requires long-term care facilities and some CAH swing beds to submit daily staffing data every quarter, including hours worked by staff category, agency use, and census data.
- Most general-purpose and mid-market scheduling software does not produce PBJ-ready exports. The reconciliation between scheduling records and payroll records falls to the nurse manager or billing staff manually.
- The most common PBJ compliance failure is not insufficient staffing. It is documentation gaps: the facility had adequate staff but cannot produce the records in the required format.
- A scheduling tool that logs every shift assignment and change with timestamps produces the raw data for PBJ reporting automatically. Whether it exports in CMS-required format is a separate question to ask every vendor.
- CMS publishes staffing data collected through PBJ publicly on [Nursing Home Compare](https://www.medicare.gov/care-compare/). For facilities with swing beds, that public record affects star ratings and referral patterns.

## Table of Contents

- [What is CMS Payroll-Based Journal reporting?](#what-is-cms-payroll-based-journal-reporting)
- [Which facilities are required to submit PBJ data?](#which-facilities-are-required-to-submit-pbj-data)
- [What data does PBJ reporting require?](#what-data-does-pbj-reporting-require)
- [Where does scheduling software fit in the PBJ workflow?](#where-does-scheduling-software-fit-in-the-pbj-workflow)
- [What does automated PBJ support actually look like?](#what-does-automated-pbj-support-actually-look-like)
- [How SimpleScheduleAI supports PBJ compliance](#how-simplescheduleai-supports-pbj-compliance)
- [Frequently Asked Questions](#frequently-asked-questions)

A nurse manager at a swing-bed CAH in East Texas spent two weeks every quarter manually reconciling her scheduling spreadsheets against payroll exports to produce the staffing data required for CMS Payroll-Based Journal submission. She tracked agency hours separately in a second spreadsheet. She cross-referenced census data from a third system. When she made an error in the third quarter, the submission was flagged and her facility's star rating dropped.

The problem was not that she had insufficient staff. It was that her workflow produced the right staffing but in a format that required two weeks of manual work to translate into what CMS required.

That manual translation burden is not unusual. For facilities with PBJ obligations, it is one of the highest-friction administrative tasks in the scheduling workflow, and most scheduling software does not meaningfully reduce it.

## What Is CMS Payroll-Based Journal Reporting?

CMS Payroll-Based Journal (PBJ) reporting is a federal requirement under [Section 6106 of the Affordable Care Act](https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/NursingHomeQualityInits/Payroll-Based-Journal) that mandates electronically submitted staffing data from skilled nursing facilities and nursing homes every quarter. The data must include daily hours worked by staff type, whether staff are direct employees or agency, and daily resident census counts.

CMS uses PBJ data to calculate staffing metrics that appear publicly on [Nursing Home Compare](https://www.medicare.gov/care-compare/) and inform the Five-Star Quality Rating System. Facilities with low staffing hours per resident day or high agency reliance receive lower ratings, which directly affect Medicare referrals from discharge planners and families researching care options.

PBJ submission deadlines are 45 days after the end of each calendar quarter: May 15 (Q1), August 14 (Q2), November 14 (Q3), and February 14 (Q4). Late or inaccurate submissions can trigger [CMS enforcement action](https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/NursingHomeQualityInits/Payroll-Based-Journal/PBJ-Policy-Manual.html).

## Which Facilities Are Required to Submit PBJ Data?

Certified skilled nursing facilities (SNFs) and nursing facilities participating in Medicare and Medicaid are required to submit PBJ data. The requirement does not apply to all Critical Access Hospitals directly, but it does apply to any CAH that operates certified swing beds under the [SNF swing bed program](https://www.cms.gov/medicare/payment/prospective-payment-systems/skilled-nursing-facility-snf/swing-bed-providers).

A swing-bed CAH using its acute care beds for skilled nursing level care is subject to PBJ reporting for the staffing associated with those swing-bed days. The practical implication: a CAH with swing beds has PBJ obligations that a purely acute-care CAH does not. Many rural Texas CAHs operate swing beds as a critical revenue and access component.

Facilities that are uncertain about their PBJ status should review their certification documents and confirm with their Medicare Administrative Contractor (MAC). The [CMS PBJ Policy Manual](https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/NursingHomeQualityInits/Payroll-Based-Journal/PBJ-Policy-Manual.html) is the authoritative reference.

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

The data must be submitted in [CMS-specified XML format](https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/NursingHomeQualityInits/Payroll-Based-Journal) through the QIES ASAP system. CMS does not accept spreadsheet uploads. The XML structure must conform to the current PBJ data specification exactly, including field formats and job title codes.

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

Very few scheduling tools offer all four components. Some offer partial support: an audit-quality staffing log that reduces the reconciliation burden without eliminating it entirely. Understanding which steps your current tool automates and which it leaves manual is the first diagnostic.

A practical test: ask your current scheduling software vendor to walk you through how a nurse manager would produce a PBJ submission from the tool. If the answer involves exporting to Excel and manual reconciliation, the tool is providing scheduling functionality but not PBJ automation.

## How SimpleScheduleAI Supports PBJ Compliance

SimpleScheduleAI is built for acute-care nurse scheduling at CAHs and does not provide a full PBJ submission workflow. For CAHs with swing-bed PBJ obligations, SimpleScheduleAI contributes to compliance in the following specific ways:

**What it provides:**

- A complete, timestamped audit trail of every schedule, every change, and every callout substitution. This is the documentation layer that surveyors and PBJ reconciliation both require.
- CMS §485.635-compliant staffing records for the acute-care nursing function. Every published schedule and every deviation from it is logged with the date, nurse, and reason.
- Separation of direct staff and agency/per-diem coverage in the schedule record, which reduces the manual categorization step for swing-bed PBJ reconciliation.

**What it does not provide:**

- Direct XML export for CMS PBJ submission
- Timekeeping integration to reconcile scheduled vs. actual hours
- Census data tracking

For the full PBJ workflow, facilities with swing-bed obligations typically use their payroll system (ADP, Paylocity, or similar) to generate the hours data and either a dedicated PBJ submission service or their billing vendor to produce the XML file. SimpleScheduleAI's scheduling records serve as the source documentation for the staffing side of that workflow.

If PBJ automation is a primary purchasing criterion for your facility, evaluate vendors that explicitly market PBJ-ready exports alongside their scheduling functionality. Ask for a demo of the submission workflow, not just the scheduling interface.

For the broader compliance picture at a Critical Access Hospital, including CMS §485.635 staffing documentation and Texas labor law requirements, see the guide to [critical access hospital scheduling](/critical-access-hospital-scheduling). For a comparison of what [nurse scheduling software for CAHs](/nurse-scheduling-software) needs to cover, the feature overview lists the requirements that matter for small rural hospitals specifically.

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Need CMS-compliant staffing documentation without the manual work?</p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">SimpleScheduleAI maintains a complete audit trail for every schedule and change as a default. Free pilot, no IT setup, operational in 3-5 days.</p>
  <a href="/pilot" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">Apply for a Pilot Spot →</a>
</div>

## Frequently Asked Questions

**Q: Do Critical Access Hospitals have to submit CMS Payroll-Based Journal data?**

Not all CAHs. PBJ reporting applies to certified skilled nursing facilities and nursing facilities. A CAH that operates certified swing beds under the SNF swing bed program has PBJ obligations for the staffing associated with those swing-bed days. A purely acute-care CAH without swing beds does not. Confirm your status with your Medicare Administrative Contractor and review your certification documents.

**Q: What happens if a facility submits inaccurate PBJ data?**

CMS can apply civil monetary penalties and in persistent cases initiate enforcement action including exclusion from Medicare. Beyond formal penalties, inaccurate PBJ data affects the facility's public staffing rating on Nursing Home Compare, which affects referral patterns from hospital discharge planners. A single error cycle can take two to three reporting periods to correct in the public record. The [CMS PBJ Policy Manual](https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/NursingHomeQualityInits/Payroll-Based-Journal/PBJ-Policy-Manual.html) outlines the correction process.

**Q: Can a scheduling tool alone produce a PBJ submission?**

Only if it includes timekeeping (to record actual vs. scheduled hours), employment type tracking (direct vs. agency), CMS job title code mapping, and XML export functionality. Most scheduling tools provide some but not all of these. For most small facilities, the practical workflow involves the scheduling tool for staffing records, a payroll system for actual hours, and either a billing vendor or a dedicated PBJ service to produce the submission file.

**Q: How often does CMS update the PBJ data specification?**

CMS updates the PBJ data specification periodically. The current specification and any updates are published on the [CMS PBJ resource page](https://www.cms.gov/Medicare/Quality-Initiatives-Patient-Assessment-Instruments/NursingHomeQualityInits/Payroll-Based-Journal). Facilities and vendors using PBJ export tools should confirm they are using the current specification before each quarterly submission. Submissions based on outdated specifications are rejected.

**Q: What is the relationship between PBJ staffing data and the Five-Star rating?**

CMS uses PBJ data to calculate RN hours per resident day and total staffing hours per resident day, which are two of the metrics used in the Staffing domain of the [Five-Star Quality Rating System](https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/downloads/usersguide.pdf). Facilities below the national median on these metrics receive fewer stars in the Staffing domain. For swing-bed CAHs, the Five-Star rating affects how discharge planners at regional hospitals route post-acute referrals.

---

**Written by Pradeep Pandey**
Co-founder, SimpleScheduleAI. Deputy General Manager of Operations at Apollo Hospitals. MBA from IIM Trichy (Operations & Marketing). Deep background in healthcare operations, workforce optimization, and hospital process design.
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
