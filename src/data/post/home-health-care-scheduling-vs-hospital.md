---
draft: false
publishDate: 2026-11-09T00:00:00Z
updateDate: 2026-11-09T00:00:00Z
author: 'Pradeep Pandey'
title: 'Home Health Scheduling Software vs. Hospital Scheduling for Critical Access Hospitals'
excerpt: >
  Your home health schedule and your inpatient schedule can each look fine on their own. A
  nurse who works both can still end the week past 40 hours, and neither schedule will show
  it.
image: https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: mofu
tags:
  - home-health-scheduling
  - hospital-scheduling
  - critical-access-hospitals
metadata:
  canonical: 'https://simplescheduleai.com/blog/home-health-care-scheduling-vs-hospital'
---

## Key Takeaways

- Home health scheduling plans visits at patients' homes across a service area. Hospital nurse scheduling plans shifts in one building. Each kind of tool is built around one of those two jobs
- Home health scheduling software is built for routing between homes, each patient's ordered visits, and [electronic visit verification (EVV)](https://www.medicaid.gov/medicaid/home-community-based-services/guidance/electronic-visit-verification-evv), which states must require for Medicaid-paid home visits
- A hospital's home health agency that bills Medicare follows its own federal rules in [42 CFR Part 484](https://www.law.cornell.edu/cfr/text/42/part-484). The inpatient unit follows the Critical Access Hospital rules
- A hospital that runs both usually needs a home health system for the visits and a nurse scheduling tool or service for the inpatient shifts
- If the hospital employs one nurse for both jobs, overtime counts every hour that nurse worked for the hospital that week, including driving between homes. Someone has to add the two schedules together

## Table of Contents

- [How Is Home Health Scheduling Different From Hospital Shift Scheduling?](#how-is-home-health-scheduling-different-from-hospital-shift-scheduling)
- [Which Federal Rules Apply to a Hospital's Home Health Agency?](#which-federal-rules-apply-to-a-hospitals-home-health-agency)
- [Does Electronic Visit Verification Apply to Hospital Nurse Shifts?](#does-electronic-visit-verification-apply-to-hospital-nurse-shifts)
- [What Does Home Health Scheduling Software Do?](#what-does-home-health-scheduling-software-do)
- [What Happens When the Same Nurse Works Home Visits and Hospital Shifts?](#what-happens-when-the-same-nurse-works-home-visits-and-hospital-shifts)
- [Should a Hospital With a Home Health Agency Buy One Scheduling Tool or Two?](#should-a-hospital-with-a-home-health-agency-buy-one-scheduling-tool-or-two)
- [Where Does SimpleScheduleAI Stop for a Hospital That Runs Home Health?](#where-does-simplescheduleai-stop-for-a-hospital-that-runs-home-health)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

Many small rural hospitals run a home health agency alongside the inpatient unit. The [Rural Health Information Hub](https://www.ruralhealthinfo.org/topics/home-health), citing 2022 research, puts it at 18.6% of Critical Access Hospitals offering home health services directly. Counting home health run through a health system or joint venture, the share is 49.6%, about half. If your hospital runs an agency, home health scheduling software and hospital nurse scheduling can look like one purchase. The two tools plan different kinds of work. This guide explains what each schedule has to do, which federal rules sit behind each, and what to watch when the same nurses work both.

## How Is Home Health Scheduling Different From Hospital Shift Scheduling?

Home health scheduling assigns a clinician to a visit at a patient's home, so the schedule is a route through a service area. Hospital nurse scheduling assigns a nurse to a shift on a unit, so the schedule is coverage for every hour the unit has patients. The work, the place, and the record that the work happened all differ.

A home health scheduler starts from each patient's plan of care, the written plan that sets which visits the patient gets and how often. Each visit needs a certain kind of clinician, such as a nurse or a physical therapist. The scheduler then fits those visits to clinicians by skill, availability, and where they live and drive. A rural service area makes travel time the hard part.

An inpatient scheduler at a [Critical Access Hospital](/critical-access-hospital-scheduling) starts from the unit. Someone has to be on duty every hour there are patients, and the hard parts are coverage, callouts, fair weekends and nights, and the hours each nurse has already worked. The table puts the two side by side.

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200">
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">Question</th>
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">Home health visit schedule</th>
        <th class="align-top text-left py-3 font-semibold text-slate-900 bg-slate-50">Inpatient nurse shift schedule</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-900">What gets scheduled</td>
        <td class="align-top py-3 pr-4 text-slate-700">One visit to one patient's home</td>
        <td class="align-top py-3 text-slate-700">One shift on one hospital unit</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-900">Where the work happens</td>
        <td class="align-top py-3 pr-4 text-slate-700">Patients' homes spread across the agency's service area</td>
        <td class="align-top py-3 text-slate-700">Inside the hospital building</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-900">Who is scheduled</td>
        <td class="align-top py-3 pr-4 text-slate-700">Nurses, therapists, aides, and social workers, by visit</td>
        <td class="align-top py-3 text-slate-700">RNs, LVNs, and aides, by shift</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-900">What drives the schedule</td>
        <td class="align-top py-3 pr-4 text-slate-700">Each patient's plan of care and the drive between homes</td>
        <td class="align-top py-3 text-slate-700">Patient count on the unit and who must be on duty</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-900">Proof the work happened</td>
        <td class="align-top py-3 pr-4 text-slate-700">Electronic visit verification for Medicaid-funded visits</td>
        <td class="align-top py-3 text-slate-700">The posted schedule and the record of every change to it</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-900">Federal conditions of participation</td>
        <td class="align-top py-3 pr-4 text-slate-700">Home health agencies, 42 CFR Part 484</td>
        <td class="align-top py-3 text-slate-700">Critical Access Hospitals, 42 CFR Part 485 Subpart F</td>
      </tr>
    </tbody>
  </table>
</div>

## Which Federal Rules Apply to a Hospital's Home Health Agency?

A home health agency (HHA) that bills Medicare follows its own federal conditions of participation (the rules a provider must meet to bill Medicare) in 42 CFR Part 484, even when a hospital runs it. The inpatient unit follows the Critical Access Hospital conditions in 42 CFR Part 485. In practice, the agency's schedule is driven by each patient's plan of care, and the unit's schedule is driven by the rule to keep a licensed nurse on duty.

The plan of care is where visit frequency comes from: [42 CFR 484.60](https://www.law.cornell.edu/cfr/text/42/484.60) requires it to include the "frequency and duration of visits to be made."

The inpatient side runs on a different clause. Under [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631), a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients. That sentence is why the inpatient schedule is built around unbroken coverage. Part 484 has no clause requiring a nurse on duty around the clock.

## Does Electronic Visit Verification Apply to Hospital Nurse Shifts?

Electronic visit verification (EVV) is an electronic record that a home visit happened, and it applies to home visits only. Section 12006(a) of the 21st Century Cures Act requires states to use it for Medicaid personal care services and for Medicaid home health services that need an in-home visit. Inpatient shifts inside the hospital are outside the requirement.

[Medicaid.gov](https://www.medicaid.gov/medicaid/home-community-based-services/guidance/electronic-visit-verification-evv) sets the dates: states had to cover personal care services by January 1, 2020 and home health care services by January 1, 2023. The requirement comes from Medicaid payment law, [42 U.S.C. 1396b(l)](https://www.law.cornell.edu/uscode/text/42/1396b) (Cornell LII). A state that does not require EVV loses part of its federal Medicaid matching funds. The rule ties to Medicaid-paid visits, so a visit paid only by Medicare falls outside it.

EVV is the practical reason a hospital's agency needs its own system. If your agency sees Medicaid patients at home, those visits have to be verified electronically, and many home health systems bundle scheduling with that proof. Your agency's billing office can tell you whether any visits are Medicaid-paid. Your state Medicaid agency can tell you which EVV system it accepts.

## What Does Home Health Scheduling Software Do?

Home health scheduling software plans visits around each patient's plan of care and the clinician's drive. When you compare products for your agency, look for four things: visit and episode scheduling, travel and territory limits, matching the right clinician to each patient, and EVV for Medicaid visits. An episode of care is the block of visits a patient gets for one stretch of treatment.

Between them, the vendors' own product pages, read in November 2026, mention all four:

- [WellSky](https://wellsky.com/home-health-software/) says its home health software "optimizes intake, eligibility, and scheduling," can "schedule entire episodes of care in seconds," and offers "real-time EVV."
- [Homecare Homebase](https://hchb.com/hchb-smart-scheduling-automation/) says its scheduling "automates visit planning within configurable agency guardrails," including "territory and mileage limits."
- [AlayaCare](https://www.alayacare.com/home-care-software/scheduling) says its engine "matches caregivers to patients based on acuity, geography, and compliance requirements in real time" and "supports a connected workflow from scheduling to electronic visit verification."

Each of those features assumes the work is a visit to someone's home. An inpatient unit has no route, no episode of care, and no visit to verify. For the inpatient side of the comparison, our guide to the [best nurse scheduling software for critical access hospitals](/blog/best-nurse-scheduling-software-critical-access-hospitals) covers the tools built for shifts.

## What Happens When the Same Nurse Works Home Visits and Hospital Shifts?

When the hospital employs a nurse for both agency visits and inpatient shifts, the 40-hour weekly overtime threshold is counted on the whole workweek. Count every hour the nurse worked for your hospital that week, not only the hours on your unit. Two separate schedules can each look fine while the combined week runs past 40 hours.

The Department of Labor's [Fact Sheet #54](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime) gives a plain example. An employee works 40 hours as a nurse's aide and 16 hours as a receptionist for the same employer in one workweek. That employee has 56 hours for overtime purposes. Swap in home visits and inpatient shifts and the math is the same. Driving counts too: under [29 CFR 785.38](https://www.law.cornell.edu/cfr/text/29/785.38), "travel from job site to job site during the workday, must be counted as hours worked." Our explainer on [nursing overtime](/blog/what-is-nursing-overtime) covers the rest of the rule.

Here is an illustrative week, not a real case. A nurse is scheduled for three 12-hour inpatient shifts, which is 36 hours. On a day off, the agency books the nurse for home visits that take 8 hours, counting the driving between homes. Each schedule shows under 40 hours. The combined week is 36 plus 8, or 44 hours, so 4 hours are overtime.

Unless the two systems are connected, neither tool sees the other's hours. If the hospital employs the nurse for both jobs, both sets of hours are paid through the hospital's payroll, so payroll is where to add them. Ask payroll for a weekly list of anyone over 40 combined hours. If a nurse paid by the hour already went over, the overtime for that week is still owed. The fix going forward is to plan the next week across both schedules.

If nurses move between your agency and your unit, read our guide to [float pool nursing at small hospitals](/blog/float-pool-nursing-small-hospitals). It explains why a 25-bed hospital covers gaps with cross-training and a per-diem bench instead of a formal pool.

## Should a Hospital With a Home Health Agency Buy One Scheduling Tool or Two?

A hospital with a home health agency is usually better served by two tools. The agency needs a home health system that schedules visits, plans routes, and records EVV. The inpatient unit needs [nurse scheduling software](/nurse-scheduling-software) or a service built for shift coverage. A product built for one job may be weaker on the side it was not built for, so ask any vendor for a sample week of each side. Physician call raises the same question, covered in our guide to [physician and medical-staff scheduling](/blog/physician-medical-staff-scheduling-small-hospital).

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200">
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">Your situation</th>
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">Recommended fit</th>
        <th class="align-top text-left py-3 font-semibold text-slate-900 bg-slate-50">Why</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">The agency's visit schedule is the pain</td>
        <td class="align-top py-3 pr-4 text-slate-700">A home health system with scheduling and EVV</td>
        <td class="align-top py-3 text-slate-700">Routes, care plans, and visit verification are its core job</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">The inpatient schedule eats the manager's week</td>
        <td class="align-top py-3 pr-4 text-slate-700">A nurse scheduling tool or service for the unit</td>
        <td class="align-top py-3 text-slate-700">Coverage, callouts, and weekly hours are its core job</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">Both hurt, and some nurses work both sides</td>
        <td class="align-top py-3 pr-4 text-slate-700">Both tools, plus a weekly check of combined hours</td>
        <td class="align-top py-3 text-slate-700">Each tool sees only its own schedule, and overtime counts the total</td>
      </tr>
    </tbody>
  </table>
</div>

## Where Does SimpleScheduleAI Stop for a Hospital That Runs Home Health?

SimpleScheduleAI is [AI-native nurse scheduling](/ai-nurse-scheduling) software, delivered as a service: the AI builds the inpatient nursing schedule, a scheduling team checks it, and the nurse manager approves. It schedules shifts for Texas Critical Access Hospitals. It does not schedule home health visits, plan routes, record EVV, or bill for visits.

On the inpatient side, it takes your roster from Excel and builds draft schedules against the coverage rules set up with you at onboarding. When a nurse calls out, you get a ranked replacement shortlist, which helps when you are working a callout at night (see our guide to [after-hours callout coverage](/blog/after-hours-callout-coverage-small-hospitals)). It tracks each nurse's scheduled hours against the 40-hour weekly FLSA overtime threshold and logs every change to the schedule. The full process is on our [how it works](/how-it-works) page.

Its limits matter for a hospital with an agency. It schedules RNs, LPNs, and CNAs only, so therapists, social workers, and home health aides are outside it. It counts only the shifts it schedules. If a nurse also makes home visits that week, those hours do not appear in its count, so the payroll check of combined hours described earlier still has to happen. For the visit side, use a home health system such as the ones named above.

SimpleScheduleAI is not the right fit for a hospital that wants one tool to run both its agency's visits and its inpatient shifts.

<div class="not-prose my-10 rounded-xl bg-amber-50 border-l-4 border-amber-500 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 leading-relaxed m-0">A hospital with a home health agency runs two different scheduling jobs, and each one deserves a tool built for it. The visit schedule needs routes and EVV. The inpatient schedule needs unbroken coverage and an honest count of hours. The risk sits in the gap between the two: a nurse who works both can go into overtime without either schedule showing it. Plan on a tool built for each job, and assign one person to check the combined hours each week.</p>
</div>

## What to Do This Week

1. List every nurse who worked both home visits and inpatient shifts in the last month. That list tells you how big the combined-hours problem is.
2. Ask payroll for those nurses' total hours in one recent workweek, both jobs combined. Count driving between homes as work time. Check anyone over 40 against the overtime actually paid.
3. Ask your agency's billing office whether any home visits are Medicaid-paid. If they are, ask your state Medicaid agency which EVV system it accepts, and write the answer down before anyone shops for software.
4. Ask each vendor directly whether it was built for home visits or for hospital shifts. If it claims both, ask to see a sample week of the side you care about.
5. If the inpatient schedule is the bigger burden, book a call with our team to see how we would build it and handle callouts.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">
    Running a Critical Access Hospital in Texas?
  </p>
  <p class="text-muted text-sm mb-6">
    See how SimpleScheduleAI handles the inpatient nursing schedule: coverage, callouts, and weekly hours. We build the schedule, you approve it.
  </p>
  <a
    href="/how-it-works"
    class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
  >
    See how it works →
  </a>
  <p class="mt-4 text-sm text-muted">
    Or <a href="https://cal.com/gautham-8bdvdx/30min" class="text-primary underline">book a call with our team</a>.
  </p>
</div>

## Frequently Asked Questions

**Q: What is the difference between home health scheduling software and hospital scheduling software?**

Home health scheduling software assigns clinicians to visits at patients' homes, plans the drive between them, and often records electronic visit verification. Hospital nurse scheduling software assigns nurses to shifts on a unit and tracks coverage, callouts, and weekly hours.

**Q: Can one scheduling tool handle both home health visits and inpatient nursing shifts?**

A vendor may say it covers both, but the two jobs pull in different directions: routes and visit proof on one side, unbroken unit coverage on the other. A single tool tends to serve one side better than the other. Ask any vendor that claims both to show you a real sample week of each before you buy.

**Q: Does electronic visit verification apply to hospital inpatient shifts?**

No. Under section 12006(a) of the 21st Century Cures Act, EVV covers Medicaid personal care services and Medicaid home health services that need an in-home visit. States had to cover home health care services by January 1, 2023. Inpatient shifts inside the hospital are outside the requirement.

**Q: How do I count overtime for a nurse who works home visits and hospital shifts?**

Add every hour the nurse worked for your hospital in the workweek, across both schedules. Department of Labor Fact Sheet #54 gives the example of an employee with 40 hours in one job and 16 in another for the same employer: 56 hours count for overtime. Driving between patients' homes during the workday counts as hours worked too. Unless the two systems are connected, neither one adds those hours for you, so ask payroll for the combined total.

**Q: Does SimpleScheduleAI schedule home health visits?**

No. SimpleScheduleAI is an AI-native nurse scheduling service for inpatient nursing shifts at Texas Critical Access Hospitals. It does not schedule home visits, plan routes, or record EVV, and it counts only the hours on the schedule it builds. For the agency's visits, use a home health system.

## Sources

1. Rural Health Information Hub, [Home Health](https://www.ruralhealthinfo.org/topics/home-health)
2. Cornell LII, [42 CFR Part 484, Home Health Services](https://www.law.cornell.edu/cfr/text/42/part-484)
3. Cornell LII, [42 CFR 484.60, Care planning, coordination of services, and quality of care](https://www.law.cornell.edu/cfr/text/42/484.60)
4. eCFR, [42 CFR 485.631, Condition of Participation: Staffing and staff responsibilities](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631)
5. Medicaid.gov, [Electronic Visit Verification (EVV)](https://www.medicaid.gov/medicaid/home-community-based-services/guidance/electronic-visit-verification-evv)
6. Cornell LII, [42 U.S.C. 1396b, Payment to States](https://www.law.cornell.edu/uscode/text/42/1396b)
7. U.S. Department of Labor, [Fact Sheet #54: The Health Care Industry and Calculating Overtime Pay](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime)
8. Cornell LII, [29 CFR 785.38, Travel that is part of day's work](https://www.law.cornell.edu/cfr/text/29/785.38)
9. WellSky, [Home Health Care Software](https://wellsky.com/home-health-software/)
10. Homecare Homebase, [Smart Scheduling Automation](https://hchb.com/hchb-smart-scheduling-automation/)
11. AlayaCare, [Home Care Scheduling Software](https://www.alayacare.com/home-care-software/scheduling)

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
