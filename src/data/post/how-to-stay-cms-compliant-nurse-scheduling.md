---
draft: false
publishDate: 2026-06-07T00:00:00Z
updateDate: 2026-06-07T00:00:00Z
author: 'Pradeep Pandey'
title: 'How to Stay CMS Compliant with Nurse Scheduling at Critical Access Hospitals'
excerpt: >
  A CMS surveyor does not grade whether your staffing felt right. They check whether
  your records prove the required nurse was on duty and the on-call practitioner was
  available. A Critical Access Hospital can staff adequately and still draw a finding
  because it cannot produce that proof on request. This guide covers what §485.635
  requires, the records a surveyor asks for, and how to keep them current without
  adding hours to your week.
image: https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: howto
tags:
  - cms-compliance
  - nurse-scheduling
  - critical-access-hospitals
  - how-to
  - healthcare-operations
metadata:
  canonical: 'https://simplescheduleai.com/blog/how-to-stay-cms-compliant-nurse-scheduling'
---

Your staffing is compliant. Your documentation might not be able to prove it. At a Critical Access Hospital, those are two different problems, and the second one is what fails a CMS survey.

This guide covers what CMS actually evaluates in CAH nurse staffing, the three records a surveyor asks for, the gaps that draw findings, and how to keep the documentation current without adding hours to the nurse manager's week.

## Key Takeaways

- CMS Conditions of Participation for Critical Access Hospitals (§485.635) require that nursing services be "sufficient to meet the needs of patients." Surveyors evaluate this against your staffing records, not your policy statements.
- Surveyors cite the records, not your intentions. A CAH can have the right nurse on every shift and still draw a finding if it cannot produce the schedule, the worked record, and the credential proof a surveyor asks for.
- Three documents form the core of a defensible CMS staffing record: the published schedule, the time and attendance record (who actually worked), and a credential log (what qualifications each nurse held at the time of each shift).
- The biggest compliance risk in nurse scheduling is a published schedule that shows coverage but does not match reality. If a nurse called out and was replaced, the replacement and their credentials must be documented. A schedule showing the original nurse's name and a payroll record showing someone else's is a discrepancy that surveyors notice.
- Automatic CMS documentation, where the scheduling system generates survey-ready staffing records from the published schedule, removes the manual assembly burden. SimpleScheduleAI generates this documentation by default. Most general-purpose scheduling software does not.

## Table of Contents

- [What CMS §485.635 Actually Requires for Nurse Staffing?](#what-cms-485635-actually-requires-for-nurse-staffing)
- [What Are the Three Documents CMS Surveyors Request?](#what-are-the-three-documents-cms-surveyors-request)
- [What Are the Common Compliance Gaps in Critical Access Hospital Nurse Scheduling?](#what-are-the-common-compliance-gaps-in-critical-access-hospital-nurse-scheduling)
- [How Do You Build a Compliant Documentation System?](#how-do-you-build-a-compliant-documentation-system)
- [What to Do When a Surveyor Arrives Unannounced?](#what-to-do-when-a-surveyor-arrives-unannounced)
- [How Scheduling Software Affects CMS Compliance?](#how-scheduling-software-affects-cms-compliance)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

CMS surveyors do not grade your staffing instincts. They grade your records. A CAH that has adequate nurses on every shift but cannot produce records showing who those nurses were, what their credentials were, and that the required emergency-care practitioner was available is in a worse position during a survey than a hospital with thinner coverage and complete, accurate records.

The compliance work happens before the surveyor arrives, not when they walk through the door.

## What CMS §485.635 Actually Requires for Nurse Staffing?

CMS Conditions of Participation for Critical Access Hospitals are codified at [42 CFR Part 485, Subpart F](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635); the designation-wide set, from location to bed caps, is mapped in our [critical access hospital requirements](/blog/critical-access-hospital-requirements) reference. Three sections govern who must be staffed and what you have to be able to show:

**Nursing services, [§485.635(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635) [1]:** Nursing services must meet the needs of patients. A registered nurse must provide, or assign to other personnel, the nursing care of each patient, and a registered nurse (or, where state law permits, a physician assistant) must supervise and evaluate that care. A nursing care plan must be kept current for each inpatient.

**On-duty nurse, [§485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631) [2]:** A registered nurse, clinical nurse specialist, or licensed practical nurse must be on duty whenever the CAH has one or more inpatients. A licensed practical nurse (LVN in Texas) may be the on-duty nurse. The registered-nurse obligation is the provide-and-supervise role above, not a second nurse on every shift.

**Emergency-care availability, [§485.618(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.618) [3]:** A doctor of medicine or osteopathy, physician assistant, nurse practitioner, or clinical nurse specialist with emergency-care training must be on call and available on site within 30 minutes, or within 60 minutes if the CAH is in a designated frontier or remote area. This 30-minute standard is an emergency-services requirement. It is not a rule that a registered nurse must be on call to back up every licensed-practical-nurse shift, which is a common misreading.

**What surveyors document against:**

- Patient care assignments are documented
- Records show the required nurse was on duty whenever inpatients were present
- The on-call emergency-care practitioner and the response-time commitment are recorded
- Credential verification supports that staff delivering care were appropriately qualified

The standard does not specify a minimum nurse-to-patient ratio, a gap we unpack fully in [safe staffing and nurse-to-patient ratios at a Critical Access Hospital](/blog/nurse-staffing-ratios-critical-access-hospital). CMS expects each CAH to set adequate staffing based on patient census and acuity, and to demonstrate through records that the required nurse was on duty and the required emergency-care practitioner was available during any period under review.

<div class="not-prose my-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5">
  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">CMS §485.635: what surveyors evaluate in CAH nursing records</p>
  <div class="space-y-2">
    <div class="rounded-lg bg-blue-600 dark:bg-blue-700 px-4 py-3">
      <p class="font-semibold text-sm text-white m-0">Staffing records: who was on duty, when</p>
      <p class="text-xs text-blue-100 m-0">Published schedule plus actual time and attendance plus callout replacements</p>
    </div>
    <div class="rounded-lg bg-blue-800 dark:bg-blue-900 px-4 py-3">
      <p class="font-semibold text-sm text-white m-0">Credential records: qualifications at time of service</p>
      <p class="text-xs text-blue-100 m-0">License numbers, ACLS and BLS dates, charge designation sign-off</p>
    </div>
    <div class="rounded-lg bg-[#1A2332] dark:bg-[#1A2332] px-4 py-3">
      <p class="font-semibold text-sm text-white m-0">Nurse and emergency-provider availability</p>
      <p class="text-xs text-[#FAF7F2] m-0">On-duty nurse per shift (485.631); emergency practitioner on call within 30 minutes (485.618)</p>
    </div>
    <div class="rounded-lg bg-slate-700 dark:bg-slate-600 px-4 py-3">
      <p class="font-semibold text-sm text-white m-0">Policy alignment</p>
      <p class="text-xs text-slate-200 m-0">Written patient care policies the records must match</p>
    </div>
  </div>
  <p class="text-xs text-slate-500 dark:text-slate-400 mt-3 m-0">Source: CMS Conditions of Participation for Critical Access Hospitals, 42 CFR §485.635, §485.631, and §485.618 (eCFR).</p>
</div>

## What Are the Three Documents CMS Surveyors Request?

When a CMS surveyor requests staffing records for a CAH, they ask for three categories of documentation covering the period under review:

**1. The published nursing schedule**

The schedule showing which nurses were assigned to each shift, including designation (RN, LVN, charge RN). This is typically produced from your scheduling system or maintained in a binder.

**2. Actual time and attendance records**

Payroll or time clock records showing who actually worked each shift. These records should match the schedule except where documented callout events resulted in replacements.

**3. Credential verification records**

Evidence that nurses on duty during the survey period held the licenses and certifications required for their role. This includes: current RN or LVN license, ACLS or BLS certifications where required, and charge competency sign-off for charge-designated shifts.

The surveyor is comparing these three documents. A mismatch between the schedule and the time and attendance record without a documented callout explanation is a finding. A time and attendance record showing a nurse on duty without a credential record confirming their license status is a finding.

<div class="not-prose my-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <p class="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">1. Published schedule</p>
    <p class="text-xs text-slate-600 dark:text-slate-400 m-0">Who was assigned to each shift, with role (RN, LVN, charge RN).</p>
  </div>
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <p class="font-semibold text-sm text-primary dark:text-[#7BAF9B] mb-2">2. Time and attendance</p>
    <p class="text-xs text-slate-600 dark:text-slate-400 m-0">Who actually worked each shift, matching the schedule except for documented callout replacements.</p>
  </div>
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <p class="font-semibold text-sm text-green-800 dark:text-green-300 mb-2">3. Credential verification</p>
    <p class="text-xs text-slate-600 dark:text-slate-400 m-0">License and certification status held at the time of each shift (RN/LVN license, ACLS/BLS, charge sign-off).</p>
  </div>
</div>
<p class="text-xs text-slate-500 dark:text-slate-400 mt-2 m-0">The three records a CMS surveyor cross-checks under 42 CFR §485.635 (eCFR).</p>

## What Are the Common Compliance Gaps in Critical Access Hospital Nurse Scheduling?

**Gap 1: Schedule and time and attendance discrepancies**

A nurse is shown on the published schedule but called out. The replacement nurse is not added to the schedule record. The schedule shows the original nurse, payroll shows a different nurse. No documentation explains the change.

Fix: Document every callout replacement in the schedule record at the time it occurs. The replacement's name, credentials, and shift should be added to the scheduling documentation on the day of the event.

**Gap 2: Credential records not current**

A nurse's ACLS certification expired three months ago. The scheduling system shows them as charge-eligible. They served as charge nurse on several shifts during the survey period. The surveyor finds no valid ACLS certificate for those dates.

Fix: Credential expiration dates should be tracked in the scheduling system. When a credential expires, the nurse's shift eligibility is updated immediately. Most scheduling software requires manual credential updates. A managed service like SimpleScheduleAI maintains credential records as part of the service.

**Gap 3: No documented emergency-care availability**

An overnight shift is covered by a licensed practical nurse on duty, which §485.631 permits. What is missing is the record showing that the required emergency-care practitioner, a physician, physician assistant, nurse practitioner, or clinical nurse specialist, was on call and available within the window §485.618 requires. The surveyor asks for that on-call record and it does not exist.

Fix: For every shift, log the on-duty nurse and the on-call emergency-care practitioner: name, role, contact information, and the confirmed response-time commitment (30 minutes, or 60 in a designated frontier or remote area). This record must exist for every shift in the review period.

**Gap 4: Documentation assembled during the survey**

The surveyor arrives and the nurse manager spends the next two hours assembling staffing records from three different sources. The documentation is incomplete because some records were never created in real-time.

Fix: Documentation should be maintained continuously and be retrievable on request without a scramble. Real-time documentation (recording shifts as they occur, logging callout replacements immediately) prevents survey-week reconstruction.

## How Do You Build a Compliant Documentation System?

A compliant documentation system does not require expensive software. It requires consistency. The following three-component system works for any CAH:

**Component 1: A schedule binder (or equivalent digital folder)**

Maintain a printed or digital copy of every published schedule. When callout replacements occur, annotate the schedule with the replacement nurse's name, credentials, and the time the replacement was confirmed. This binder covers the published + actual discrepancy that surveyors check.

**Component 2: A credential master list**

A spreadsheet or folder with the following per nurse: RN/LVN license number and state, license expiration date, ACLS and BLS certification cards (photo or PDF), charge competency sign-off date, and any specialty certifications required for their role. Update immediately when credentials renew or expire.

**Component 3: An on-call log**

For every shift, record the emergency-care practitioner on call (physician, physician assistant, nurse practitioner, or clinical nurse specialist), their contact number, the shift date and time, and the confirmed response-time commitment. This log responds to the §485.618 emergency-availability standard (on site within 30 minutes, or 60 in a designated frontier or remote area). Where a licensed practical nurse is the on-duty nurse, also note the registered nurse responsible for providing and supervising nursing care under §485.635(d).

<div class="not-prose my-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <p class="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">1. Schedule binder</p>
    <p class="text-xs text-slate-600 dark:text-slate-400 m-0">Published schedule per cycle, callout replacements annotated in real time. Maintained continuously and retained per your facility's record-retention policy.</p>
  </div>
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <p class="font-semibold text-sm text-primary dark:text-[#7BAF9B] mb-2">2. Credential master list</p>
    <p class="text-xs text-slate-600 dark:text-slate-400 m-0">License numbers and expiration dates, ACLS and BLS certificates, charge sign-off dates. Updated immediately on change, linked to the schedule record.</p>
  </div>
  <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
    <p class="font-semibold text-sm text-green-800 dark:text-green-300 mb-2">3. On-call log</p>
    <p class="text-xs text-slate-600 dark:text-slate-400 m-0">Emergency-care practitioner on call per shift, contact number, 30-minute response confirmed (60 in frontier or remote areas). Required by 485.618.</p>
  </div>
</div>

## What to Do When a Surveyor Arrives Unannounced?

CMS surveys for CAHs can be unannounced. When a surveyor arrives, the compliance readiness checklist is:

**Immediate response (first 30 minutes):**

1. Notify the hospital administrator and medical director per your survey management protocol.
2. Do not provide documentation before the surveyor formally requests it. Understand what they are requesting before you respond.
3. Identify who will be the primary documentation point of contact during the survey.

**When staffing records are requested:**

1. Pull the schedule binder for the requested period.
2. Pull the time and attendance records from payroll for the same period.
3. Pull the credential master list.
4. Pull the on-call log for any shifts where an LVN was on duty.
5. Note any discrepancies between the schedule and time and attendance records. Prepare a brief explanation for each: callout event, documented replacement, credentials confirmed.

**Do not reconstruct documentation during the survey.** A document created in response to a surveyor request that is dated as if it were created prior carries significant risk. If documentation does not exist, acknowledge the gap factually and do not fabricate.

## How Scheduling Software Affects CMS Compliance?

The documentation burden described above is manual unless your scheduling system generates it automatically. This §485.635 staffing record is a separate obligation from CMS Payroll-Based Journal reporting, which most CAHs do not file at all; our guide to [CMS PBJ reporting and nurse scheduling software](/blog/cms-pbj-reporting-scheduling-software) gives the one-question test for whether your facility owes a filing.

Most general-purpose scheduling software (Deputy, When I Work, standard workforce tools) produces schedules and time tracking. It does not generate CMS-formatted staffing documentation, does not maintain a credential log integrated with the schedule, and does not flag when a shift would have no qualified RN on duty or on call.

Nursing-specific platforms (NurseGrid Manager, Aladtec) are better suited to healthcare but still require manual setup and maintenance to connect credential records to scheduling records in a format that satisfies CMS documentation requests.

[SimpleScheduleAI](/how-it-works) uses [AI nurse scheduling](/ai-nurse-scheduling) to build each schedule and generate CMS §485.635-formatted staffing documentation automatically from it. When a callout replacement occurs, the replacement and their credentials are captured in the documentation record. When a CMS surveyor requests staffing records, the nurse manager pulls the pre-built report. There is no assembly required. To watch the §485.635 compliance checklist tick off as the AI builds a schedule, try the [scheduling simulator](/simulator). For the wider category, see our [nurse scheduling software](/nurse-scheduling-software) overview and the [critical access hospital scheduling](/critical-access-hospital-scheduling) guide.

For a CAH that has had a CMS finding related to staffing documentation, or that has an upcoming survey and knows its current documentation is not complete, this is the most direct path to survey readiness.

One honest limitation: SimpleScheduleAI is not the right fit for hospitals outside Texas, and it produces the documentation rather than making staffing decisions for you. The hospital still owns its staffing levels and its final compliance review.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">The hard part of CMS staffing compliance is not the nurse on the floor. It is proving, months later, that she was there and qualified. The fix is boring and it works: capture the schedule, the worked record, and the credential status the day each shift happens, not the week the surveyor calls. A managed service earns its place here only if it produces that record as a byproduct of building the schedule, so the proof exists before anyone asks for it.</p>
</div>

## What to Do This Week

1. **Pull your staffing records for a recent month.** Can you produce the schedule, time and attendance, and credential records for every shift in that period? If assembling those three documents means a scramble across binders, payroll exports, and memory, your documentation system is not survey-ready.

2. **Check your on-call log.** For every shift in the past 30 days, do you have a written record showing the emergency-care practitioner on call (physician, PA, NP, or CNS) and their confirmed response time? Under §485.618 that record is required, and a missing one is an active compliance gap.

3. **Audit your credential master list for expirations.** Check ACLS and BLS expiration dates for all nurses currently on the schedule. Any nurse whose credentials have lapsed should be removed from eligible rotation for the shifts requiring those credentials.

4. **If you are a Texas Critical Access Hospital, [See how it works](/how-it-works).** Our AI builds your schedule from an Excel roster upload, our scheduling team checks it and attaches the §485.635 documentation to each cycle, so you can compare it against your current records.

5. **Verify your callout replacement documentation process.** When a nurse calls out and is replaced, is the replacement and their credentials added to the scheduling record that day? Or is it recorded only in payroll, leaving a schedule-vs-payroll discrepancy?

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Running a Critical Access Hospital in Texas?</p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it.</p>
  <a href="/how-it-works" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-slate-500 dark:text-slate-400 text-xs mt-4">Prefer to talk first? <a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team</a>.</p>
</div>

## Frequently Asked Questions

**How far back do CMS surveyors request staffing records?**

It depends on the survey type and what triggered it. A complaint investigation tends to focus on a specific recent period, while a recertification survey can look across the certification cycle. Because you cannot predict the window in advance, the practical standard is to keep complete, retrievable staffing records on a rolling basis rather than for a fixed number of days.

**What happens if we had a staffing gap during the survey period?**

A staffing gap (a shift where minimum staffing was not maintained) is a serious finding but not automatically a condition of participation violation. CMS evaluates whether the gap was isolated and whether the hospital has a process to prevent recurrence. A documented gap with a documented corrective action is better than an undocumented gap discovered during the survey. If a gap occurred, acknowledge it in your documentation with the circumstances and the corrective steps taken.

**Does CMS specify a minimum nurse-to-patient ratio for Critical Access Hospitals?**

CMS does not specify a minimum nurse-to-patient ratio for CAHs. The standard is that nursing services be "sufficient to meet the needs of patients" as determined by each patient's plan of care. Surveyors evaluate this through documentation of patient acuity and the staffing levels provided, not against a fixed ratio. However, a CAH that routinely staffs a 25-bed unit with a single LVN and no on-duty RN on days with high-acuity patients is likely to receive a finding regardless of the absence of a specific ratio standard.

**Can a sole proprietor or administrator also serve as the charge nurse on the schedule for CMS documentation purposes?**

CMS requires that a registered nurse provide and supervise nursing care under §485.635(d). A nurse who is both an administrator and a licensed RN can fulfill that supervisory role if they are actively overseeing nursing care. A non-nurse administrator cannot. Keep this separate from the §485.618 emergency-care requirement, where the on-call practitioner available within 30 minutes is a physician, physician assistant, nurse practitioner, or clinical nurse specialist, not necessarily the supervising registered nurse.

**How does SimpleScheduleAI handle CMS documentation when a nurse's credentials change mid-cycle?**

When a nurse's credentials change (renewal, expiration, or new certification), the SimpleScheduleAI team updates the credential record in the system. Future schedule documentation reflects the updated credential status. For historical documentation, the credential record at the time of each shift is preserved, the documentation shows what credentials each nurse held at the time of each shift, which is what CMS requires for retrospective review.

## Sources

[1] Centers for Medicare & Medicaid Services. Conditions of Participation: Provision of services (nursing services), 42 CFR §485.635(d). [eCFR](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635). Verified 2026-06-06.

[2] Centers for Medicare & Medicaid Services. Conditions of Participation: Staffing and staff responsibilities, 42 CFR §485.631(a)(5). [eCFR](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631). Verified 2026-06-06.

[3] Centers for Medicare & Medicaid Services. Conditions of Participation: Emergency services, 42 CFR §485.618(d). [eCFR](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.618). Verified 2026-06-06.

**Methodology note:** Regulatory claims reference the CMS Conditions of Participation for Critical Access Hospitals (42 CFR Part 485, Subpart F), verified against the current eCFR text on 2026-06-06. SimpleScheduleAI produces the staffing documentation; the hospital retains responsibility for staffing decisions and final compliance.

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
