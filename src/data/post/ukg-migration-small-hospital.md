---
draft: false
publishDate: 2026-05-07T00:00:00Z
updateDate: 2026-11-09T00:00:00Z
author: 'Pradeep Pandey'
title: 'UKG Migration Guide for Critical Access Hospitals'
excerpt: >
  Support for on-premises Kronos Workforce Central, UKG's older timekeeping and scheduling system, ends
  March 31, 2027. Before you choose what comes next, find out what happens to your schedule and
  staff data.
image: https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - scheduling-software
metadata:
  canonical: 'https://simplescheduleai.com/blog/ukg-migration-small-hospital'
---

## Key Takeaways

- On-premises Kronos Workforce Central loses support on March 31, 2027, according to UKG partners [Healthcare IT Leaders](https://healthcareitleaders.com/blog/ukg-workforce-central-wfc-end-of-life) and [RSM US](https://www.rsmus.com/insights/technology/ukg/ukg-workforce-central-support-is-ending-do-you-have-a-plan). Plan to move before then, either onto UKG Pro Workforce Management or off UKG
- UKG partner Healthcare IT Leaders says timecard and schedule history do not migrate to UKG Pro Workforce Management, so the old database is archived for reporting
- [UKG's own page](https://www.ukg.com/ukg-workforce-central-historical-data-options) ties your options for using that history after your agreement ends to a copy requested within 30 days of termination
- If Workforce Central also runs your time clock or sends hours to payroll, those jobs need a new home too, even if you move nurse scheduling somewhere else
- What a 25-bed hospital most needs to carry over is a clean nurse roster, and we suggest planning about eight weeks for a switch to a smaller scheduling tool

## Table of Contents

- [Why Is Your Hospital Facing a UKG Migration Now?](#why-is-your-hospital-facing-a-ukg-migration-now)
- [Should a Small Hospital Move to UKG Pro Workforce Management or Leave UKG?](#should-a-small-hospital-move-to-ukg-pro-workforce-management-or-leave-ukg)
- [What Happens to Your Schedule and Staff Data When You Leave Workforce Central?](#what-happens-to-your-schedule-and-staff-data-when-you-leave-workforce-central)
- [What Should You Check in Your UKG Contract Before Giving Notice?](#what-should-you-check-in-your-ukg-contract-before-giving-notice)
- [How Long Does It Take to Move a Small Hospital Off UKG Scheduling?](#how-long-does-it-take-to-move-a-small-hospital-off-ukg-scheduling)
- [How Should You Tell Nurses About a Scheduling System Change?](#how-should-you-tell-nurses-about-a-scheduling-system-change)
- [What Should a Small Hospital Look for in a UKG Replacement?](#what-should-a-small-hospital-look-for-in-a-ukg-replacement)
- [Where Does SimpleScheduleAI Fit in a UKG Migration?](#where-does-simplescheduleai-fit-in-a-ukg-migration)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

## Why Is Your Hospital Facing a UKG Migration Now?

UKG is retiring Kronos Workforce Central, its older system for timekeeping, scheduling, and payroll. Two UKG partners report that support for copies running on a hospital's own servers ends March 31, 2027. A hospital still on Workforce Central should plan to move before then, either to UKG's newer product or to another vendor.

[Healthcare IT Leaders](https://healthcareitleaders.com/blog/ukg-workforce-central-wfc-end-of-life), a UKG implementation partner, reported the retirement in October 2022. It says customers who run Workforce Central on their own servers "will have support through March 31, 2027". It says customers on the Kronos Private Cloud, a hosting option run by UKG, would "lose access to their cloud-hosted instance of WFC on December 31, 2025." WFC is short for Workforce Central. Another partner, [RSM US](https://www.rsmus.com/insights/technology/ukg/ukg-workforce-central-support-is-ending-do-you-have-a-plan), gives the same March 31, 2027 date and notes that "UKG Pro Workforce Management provides a migration path from the legacy solution."

UKG Pro Workforce Management is UKG's newer workforce management product. UKG says [the UKG Dimensions name is now UKG Pro Workforce Management](https://www.ukg.com/ukg-dimensions-now-ukg-pro-workforce-management), so older articles call it Dimensions. If you are not sure which UKG product your hospital runs, or where it runs, your IT contact or UKG account team can tell you.

A [Critical Access Hospital](/critical-access-hospital-scheduling) can end up on Workforce Central without choosing it. A health system or rural network may have standardized on Kronos for every member hospital, or an administrator may have brought it from a larger hospital. The end of support turns an old question about fit into a deadline.

## Should a Small Hospital Move to UKG Pro Workforce Management or Leave UKG?

The answer depends on who will run the new system once it starts. Partner [HRchitect](https://hrchitect.com/migrating-to-ukg-pro-wfm/) describes a "lift and shift" move in which its team reviews the old setup so that "old and non-active configurations are not brought over". Even that path takes people to review and set up the new system. A hospital with IT staff or a health-system team can carry the work. A 25-bed hospital whose nurse manager also carries patients should compare it with leaving.

Workforce Central can do more than scheduling. Healthcare IT Leaders describes it as covering time and attendance, absence management, scheduling, and payroll. Map what it does for your hospital before you price anything. The table gives three example situations.

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200">
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">Your situation</th>
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">Likely fit</th>
        <th class="align-top text-left py-3 font-semibold text-slate-900 bg-slate-50">Why</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">Your health system runs UKG for every member hospital</td>
        <td class="align-top py-3 pr-4 text-slate-700">Move to UKG Pro Workforce Management with the rest of your health system</td>
        <td class="align-top py-3 text-slate-700">Your health system's IT team carries the setup, and timekeeping stays with one vendor</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">Independent hospital with an IT lead and a UKG-trained HR team</td>
        <td class="align-top py-3 pr-4 text-slate-700">Price both paths side by side</td>
        <td class="align-top py-3 text-slate-700">You have the people to run a new UKG setup, so cost and fit decide</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">Independent hospital, no IT department, nurse manager builds the schedule</td>
        <td class="align-top py-3 pr-4 text-slate-700">Move nurse scheduling to a tool sized for a small hospital, and decide separately where the time clock and payroll go</td>
        <td class="align-top py-3 text-slate-700">A full UKG Pro setup takes configuration work this hospital may not have staff for</td>
      </tr>
    </tbody>
  </table>
</div>

If you leave UKG for nurse scheduling only, the time clock and the payroll feed still need a home, by March 31, 2027 if Workforce Central runs on your own servers. The payroll feed is the set of hours that flows from the time clock into payroll. RSM lists time and attendance among the UKG Pro Workforce Management modules but does not name payroll. Ask UKG which product covers each job, or move them to another vendor. For more on why enterprise platforms strain a small hospital, see our guide to [UKG being too complex for a small hospital](/blog/ukg-too-complex-small-hospital).

## What Happens to Your Schedule and Staff Data When You Leave Workforce Central?

Your past timecards and schedules stay behind, but you may be able to keep a copy. UKG partner Healthcare IT Leaders says that history does not migrate to UKG Pro Workforce Management. UKG's own page ties your options for using it after your agreement ends to a copy requested within 30 days of termination. Plan both steps before the agreement ends.

[Healthcare IT Leaders](https://www.healthcareitleaders.com/blog/ukg-dimensions-migration-what-customers-should-know/) puts the first part plainly: "Data, such as timecard and schedule history does not migrate from WFC to UKG Dimensions. So, you will have to archive your existing WFC database for historical reporting." No source we found lists exactly which staff records move to the new product. Ask your UKG team for that list in writing.

UKG's [historical data page](https://www.ukg.com/ukg-workforce-central-historical-data-options) covers the second part. Your options for using the old data after termination apply "provided that you request a copy of your data from UKG within 30 days of termination". The options include an outside archive service, keeping the database on your own network, or, for cloud-hosted customers, a paid limited license from UKG. A 25-bed hospital without a database specialist should look at the archive service first. Ask your UKG team whether the 30-day window also applies if you move to UKG Pro Workforce Management instead of ending your agreement.

For a small hospital, the data that matters most is a short list:

- **The nurse roster.** Names, employment type (full time, part time, per diem), home unit, skills, and seniority date. Any new scheduling system needs this on day one. Check that every per-diem nurse made it into the export.
- **Recent schedules.** Enough past schedules to see each nurse's recent weekends, nights, and holidays, so the first new schedule is fair. Save them as reports you can open without UKG.
- **Overtime by nurse.** The hours history behind your overtime spend. It is your baseline for judging whether the new process works.

Payroll and timekeeping records follow your payroll process, not your scheduling tool. Agree with finance where those records will live before the agreement ends.

## What Should You Check in Your UKG Contract Before Giving Notice?

Read the term, renewal, and termination sections of your own contract before you decide anything. Notice periods and renewal terms differ from contract to contract, and the notice date in the contract can set when you have to start. Your administrator or finance office may hold the signed copy.

Answer three questions from the contract itself. First, when does the current term end, and does it renew automatically? If it does, a missed notice date can commit you to another term. Second, how much written notice does termination require, and who must receive it? Third, what does the contract say about returning your data after termination? Put the three answers on one page and share it with finance before anyone talks to a vendor.

## How Long Does It Take to Move a Small Hospital Off UKG Scheduling?

Plan on about eight weeks to switch to a smaller nurse scheduling tool. Spend four weeks choosing the tool and setting it up. Run both schedules side by side for two weeks. Then post from the new system for two weeks while the old one stays open for reference. To finish by March 31, 2027, start by early February 2027.

This plan assumes you are leaving UKG for nurse scheduling. If your health system is moving you to UKG Pro Workforce Management, its project plan sets the dates, but the data, roster, and side-by-side steps still apply. The plan below is our suggestion, not a UKG requirement. Count the weeks back from your cutover day, the first day the old system is no longer used.

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200">
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 bg-slate-50">When</th>
        <th class="align-top text-left py-3 font-semibold text-slate-900 bg-slate-50">What to do</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">Before anything else</td>
        <td class="align-top py-3 text-slate-700">Find the date your contract notice is due. If it falls more than eight weeks before cutover, that date sets your start.</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">8 weeks before cutover</td>
        <td class="align-top py-3 text-slate-700">Choose the replacement. Name one person, usually the nurse manager, to own the move.</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">6 weeks before cutover</td>
        <td class="align-top py-3 text-slate-700">Export the nurse roster and recent schedule reports. Start setting up the new system.</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">4 weeks before cutover</td>
        <td class="align-top py-3 text-slate-700">Build each schedule in both systems. Post from UKG only, and compare the two before every posting.</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">2 weeks before cutover</td>
        <td class="align-top py-3 text-slate-700">Post from the new system. Keep UKG open so staff can look up past schedules.</td>
      </tr>
      <tr class="border-b border-slate-100">
        <td class="align-top py-3 pr-4 font-medium text-slate-800">Cutover day and after</td>
        <td class="align-top py-3 text-slate-700">Stop using UKG for scheduling. Request your historical data copy within 30 days of termination.</td>
      </tr>
    </tbody>
  </table>
</div>

Running both schedules for two weeks is extra work. It is also how you catch a missing nurse or a wrong rule before it reaches a posted schedule.

## How Should You Tell Nurses About a Scheduling System Change?

Tell charge nurses first, in person, before any notice goes to UKG. Then tell the floor. Cover the honest reason for the change, the dates, and what stays the same, such as how requests and weekend rotation work. Nurses should hear about the change from you before they hear it from each other.

Keep the message short and specific. Say why you are changing: cost, the work it takes to run, or the end of Workforce Central support. Give the date of the first schedule from the new system, and name the person to ask. Charge nurses who know the plan early can answer questions on shift, at hours when the nurse manager is not there.

## What Should a Small Hospital Look for in a UKG Replacement?

Look for a replacement a nurse manager can run without an IT department. Six checks matter most at 25 beds: setup time, overtime visibility, callout support, no required EHR connection, getting your data back out, and how hours reach your time clock and payroll. Score every candidate on the same six, including any UKG option.

1. **Setup time.** Ask how many weeks from contract to first live schedule, and who does the setup work.
2. **Overtime visibility.** The schedule should show each nurse's hours against the 40-hour weekly overtime threshold before you post it. The [Department of Labor's Fact Sheet #54](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime) explains how hospital overtime is counted.
3. **Callout support.** When a nurse calls out, the tool should rank who can cover without going into overtime.
4. **No EHR connection required.** A scheduling tool that needs an Epic or Cerner connection adds a project a small hospital may not have staff for.
5. **Getting your data out.** Ask how you would export your roster and schedules if you ever leave. This migration is the reason to ask.
6. **Time clock and payroll.** Ask whether the tool exchanges hours with your time clock and payroll, or whether that stays with another system.

Our [nurse scheduling software](/nurse-scheduling-software) guide compares options on these points.

## Where Does SimpleScheduleAI Fit in a UKG Migration?

SimpleScheduleAI is an [AI-native nurse scheduling](/ai-nurse-scheduling) service for Texas Critical Access Hospitals: the AI builds your schedule, our scheduling team checks it, you approve. It replaces the nurse scheduling part of UKG only. It does not replace UKG's time clock, payroll, or HR records, and it does not connect to UKG.

On the six checks: onboarding takes 3 to 5 business days, and your first schedule arrives inside two weeks. You send us your staff list in Excel, and an export from UKG can be the starting point. Each nurse's scheduled hours are tracked against the 40-hour weekly FLSA overtime threshold. When a nurse calls out, you get a ranked replacement shortlist. Nothing connects to your EHR, and your roster and schedules come back to you as Excel files.

On the sixth check, the answer is no. SimpleScheduleAI works with scheduled hours, not clocked hours, and it does not send hours to payroll. Your time clock and payroll keep doing that job, so they need their own plan, by March 31, 2027 if Workforce Central runs on your own servers. See the full process on our [how it works](/how-it-works) page.

SimpleScheduleAI is not the right fit for a hospital that wants one vendor for scheduling, timekeeping, and payroll, or for a hospital outside our Texas Critical Access focus.

<div class="not-prose my-10 rounded-xl bg-amber-50 border-l-4 border-amber-500 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 leading-relaxed m-0">The end of Workforce Central is a rare chance for a small hospital to choose its scheduling tool on purpose instead of inheriting one. Start with the data, because UKG ties your use of the old history to a request made within 30 days of termination, and that deadline is easy to miss. Then decide on fit. If your health system will carry a UKG Pro setup, staying may be easiest. If the nurse manager would carry it alone, a smaller tool for nurse scheduling is worth pricing, with the time clock and payroll planned separately.</p>
</div>

## What to Do This Week

1. **Find out which UKG product you run.** Ask your IT contact or UKG account team whether you are on Workforce Central or UKG Pro Workforce Management. Also ask whether it runs on your own servers or on UKG's.
2. **Get the contract dates.** Ask your administrator or finance office for the term end date, the renewal terms, the notice period, and any data-return clause, on one page.
3. **List what UKG does for you.** Scheduling, time clock, payroll feed, HR records. Each item needs a home after the move.
4. **Export the nurse roster now.** Ask whoever runs UKG reports at your hospital to export it, then check it for every per-diem nurse and every unit.
5. **Book a call if you are a Texas Critical Access Hospital** weighing a smaller tool for nurse scheduling. We will walk through how your roster would load and what the first schedule would look like.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">
    Running a Critical Access Hospital in Texas?
  </p>
  <p class="text-muted text-sm mb-6">
    Flat monthly pricing. No IT setup. AI builds your schedule, our scheduling team checks it, you approve.
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

**Q: When does Kronos Workforce Central support end?**

UKG partners Healthcare IT Leaders and RSM US report that support for Workforce Central running on a hospital's own servers ends March 31, 2027. Customers on the Kronos Private Cloud, a hosting option run by UKG, were to lose access on December 31, 2025. Confirm the date for your installation with your UKG account team.

**Q: Will I lose my schedule history if I move to UKG Pro Workforce Management?**

Healthcare IT Leaders says timecard and schedule history do not migrate, so the old database is archived for reporting. UKG's own page says your options for using that history after termination depend on requesting a copy within 30 days of termination. Ask your UKG team how that applies to your move.

**Q: If I leave UKG for scheduling, what happens to my time clock and payroll?**

They still need a new home. Healthcare IT Leaders describes Workforce Central as a suite that includes time and attendance and payroll. It says the legacy Kronos 4500 time clock is being retired along with it. Ask UKG whether UKG Pro Workforce Management covers both, or move them to another vendor. Plan that alongside the scheduling change.

**Q: What is the notice period to cancel UKG?**

It depends on your contract. Read the term, renewal, and termination sections, and note the date your written notice must arrive. If the contract renews automatically, a missed notice date can commit you to another term.

**Q: Can SimpleScheduleAI replace UKG at a small hospital?**

It can replace the nurse scheduling part for a Texas Critical Access Hospital. It does not replace UKG's time clock, payroll, or HR records, and it does not connect to UKG. You send your staff list in Excel, and onboarding takes 3 to 5 business days.

## Sources

1. Healthcare IT Leaders, [UKG Workforce Central (WFC) End of Life: What Customers Should Know](https://healthcareitleaders.com/blog/ukg-workforce-central-wfc-end-of-life)
2. RSM US, [UKG Workforce Central support is ending: do you have a plan?](https://www.rsmus.com/insights/technology/ukg/ukg-workforce-central-support-is-ending-do-you-have-a-plan)
3. UKG, [UKG Dimensions is now UKG Pro Workforce Management](https://www.ukg.com/ukg-dimensions-now-ukg-pro-workforce-management)
4. HRchitect, [Migrating to UKG Pro WFM From UKG (Kronos) Workforce Central](https://hrchitect.com/migrating-to-ukg-pro-wfm/)
5. Healthcare IT Leaders, [UKG Dimensions Migration: What Customers Should Know](https://www.healthcareitleaders.com/blog/ukg-dimensions-migration-what-customers-should-know/)
6. UKG, [Options for Continued Use of Historical Workforce Central Data](https://www.ukg.com/ukg-workforce-central-historical-data-options)
7. U.S. Department of Labor, [Fact Sheet #54: The Health Care Industry and Calculating Overtime Pay](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime)

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
