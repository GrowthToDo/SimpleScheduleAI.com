---
draft: false
publishDate: 2026-11-02T00:00:00Z
updateDate: 2026-11-02T00:00:00Z
author: 'Pradeep Pandey'
title: 'Nurse Scheduling Metrics: What a Small Hospital Should Track'
excerpt: >
  Payroll alone tells you how much overtime you paid last month. Matched to the posted schedule,
  the same export shows which shifts caused the overtime, and whether the same few nurses keep
  absorbing it.
image: https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: howto
tags:
  - nurse-scheduling
  - nurse-scheduling-metrics
  - critical-access-hospitals
  - how-to
  - healthcare-operations
metadata:
  canonical: 'https://simplescheduleai.com/blog/nurse-scheduling-metrics-small-hospital'
---

## Key Takeaways

- **Four numbers give you a first read on how a schedule ran.** Track overtime by where it came from and callouts per 100 scheduled shifts. Add each nurse's weekend, holiday and night shifts, and the cost of covering callouts.
- **You already have the data.** The posted schedule, the payroll export and your [callout notes](/blog/how-to-handle-nurse-callouts) are enough. No new software is needed to start.
- **Split overtime by where it came from.** Overtime the posted schedule created is a planning problem. Overtime from covering callouts is a coverage problem. The two need different fixes.
- **Count callouts against scheduled shifts.** Callouts per 100 scheduled shifts lets you compare one cycle with the next, even when the schedule changes size.
- **Read the columns together.** When the same two names sit at the top of the overtime column and the weekend column, you have found the nurses carrying the schedule.
- **Small rosters make noisy numbers.** On a roster of about 11 nurses, one nurse with the flu can be half of a cycle's callouts. Compare cycles before you draw a conclusion.

## Table of Contents

- [What Do You Need From Your Own Files to Review a Nurse Schedule?](#what-do-you-need-from-your-own-files-to-review-a-nurse-schedule)
- [How Do You Find Out Which Shifts Your Overtime Comes From?](#how-do-you-find-out-which-shifts-your-overtime-comes-from)
- [How Do You Measure Nurse Callouts?](#how-do-you-measure-nurse-callouts)
- [Are Weekend, Holiday and Night Shifts Shared Fairly Among Your Nurses?](#are-weekend-holiday-and-night-shifts-shared-fairly-among-your-nurses)
- [How Do You Calculate What Covering Nurse Callouts Costs?](#how-do-you-calculate-what-covering-nurse-callouts-costs)
- [How Often Should You Review Your Nurse Scheduling Metrics?](#how-often-should-you-review-your-nurse-scheduling-metrics)
- [What Can SimpleScheduleAI Send You for This Review?](#what-can-simplescheduleai-send-you-for-this-review)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

Nurse scheduling metrics are the few numbers that show how a schedule actually ran. The four numbers show where the overtime came from, how often nurses called out, who worked the weekends and nights, and what covering the gaps cost. At a small hospital, all four fit on one spreadsheet a nurse manager can build in an afternoon.

This guide walks through that sheet one column at a time. The examples use the roster from our [fair nurse schedule guide](/blog/fair-nurse-schedule-small-hospital): 11 nurses on 12-hour shifts, with two licensed nurses (RNs or LVNs) on every shift. Every number in the examples is made up to show the math, so redo each step with your own files.

## What Do You Need From Your Own Files to Review a Nurse Schedule?

You need three things you already keep: the posted schedule for each cycle, the payroll or timekeeping export for the same weeks, and your callout notes. A cycle here means one four-week schedule. Pull the last three cycles to start.

**The posted schedule** shows who was assigned to each shift, and whether it was a day, night, weekend or holiday shift.

**The payroll export** shows the hours each nurse was paid for, including overtime. Your payroll export may show hours by date but not by shift. If so, match each nurse's paid hours to the schedule by name and date.

**Your callout notes** show each shift a nurse called out of and how the gap was filled. A notebook at the nurses' station counts. If your notes do not say who covered a shift, the payroll export shows who worked it, and an agency shift appears on the agency invoice. If you keep no callout record at all, start one now; our guide to [handling nurse callouts](/blog/how-to-handle-nurse-callouts) lists the five fields worth writing down.

Put all three into one spreadsheet, one tab each. Then add a review tab with one row per nurse and these columns: overtime hours, extra shifts picked up, weekend shifts, holiday shifts and night shifts. Callouts and cost go in a totals row at the bottom, because they describe the whole cycle.

Compare nurses on the same hours. A part-time nurse works fewer weekends because they work fewer shifts. Keep full-time, part-time and PRN (as-needed) nurses in separate groups before you compare anyone.

## How Do You Find Out Which Shifts Your Overtime Comes From?

Sort every overtime hour into one of two piles. One pile is overtime the posted schedule created. The other is overtime from extra shifts picked up to cover a callout.

The two piles need different fixes. Posted-schedule overtime means the schedule put more than 40 hours on some nurses in one week, so you fix it when you make the next schedule. Callout-cover overtime means gaps are being filled by nurses who are already working full weeks, so you fix it in how callouts get covered.

Overtime is [generally due after 40 hours in a workweek](/blog/what-is-nursing-overtime), so it is counted by the week, not by the shift. To sort it, take one nurse's Monday-to-Sunday week:

- **Posted hours over 40.** If the posted schedule alone gave the nurse more than 40 hours, the hours past 40 are posted-schedule overtime.
- **Overtime above the posted hours.** Any overtime beyond that came from extra shifts the nurse picked up that week. A nurse posted for 36 hours who picks up one 12-hour shift works 48 hours. The 8 hours past 40 are callout-cover overtime, and the first 4 hours of the pick-up are regular pay.

Here is a worked cycle. Say payroll shows 48 overtime hours across the roster:

1. **Posted-schedule overtime: 16 hours.** Two nurses were posted for four 12-hour shifts in the same week. That is 48 hours each, so 8 overtime hours each.
2. **Callout-cover overtime: 32 hours.** Four times, a nurse posted for 36 hours picked up a 12-hour shift. Each pick-up added 8 overtime hours.
3. **Where the 32 callout-cover hours came from.** Three of the four pick-ups were night shifts, which is 24 hours. One was a weekend day shift, which is 8 hours.

In this cycle, two-thirds of the overtime came from covering callouts, and three-quarters of that was nights. The useful question is what changed about night coverage.

Night overtime carries a second cost. A nurse picking up extra nights is short on sleep as well as over budget. Night nurses "might get less sleep and poorer-quality sleep than those working the day shift," according to [training for nurses on shift work](https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod9/02.html) from the National Institute for Occupational Safety and Health (NIOSH).

Our guide to [reducing nurse overtime](/blog/how-to-reduce-nurse-overtime) covers what to do once you know where the hours come from. For the legal side, see [Texas nursing overtime rules for critical access hospitals](/blog/texas-nursing-overtime-compliance-cah).

## How Do You Measure Nurse Callouts?

Count callouts per 100 scheduled shifts, then split the count three ways: by day of the week, by shift, and by how much notice you got. A count per 100 shifts lets you compare cycles even when one cycle has more shifts than another.

On the example roster, a four-week cycle has 2 nurses × 2 shifts × 28 days = 112 scheduled shifts. Say 6 of those shifts had a callout. Six callouts in 112 shifts is 6 ÷ 112 × 100, or about 5 callouts per 100 scheduled shifts.

Then split the 6 callouts:

- **By day of the week.** Do they bunch on certain days, such as Mondays or the first day after a stretch of nights?
- **By shift.** Night shifts are half of the 112 shifts. Do more than half of the callouts land on nights?
- **By notice.** How many came the same day, and how many with a day or more of warning? Same-day callouts leave the least time to find cover, so check how many of yours ended in overtime.

We do not know of a trustworthy benchmark for a "normal" callout rate at a small hospital, so compare against your own last cycle. A rate that holds steady for three cycles is something you can plan around. Our [nurse staffing relief factor guide](/blog/nurse-staffing-relief-factor) shows how to build that real absence rate into how many nurses you need.

Be careful with small numbers. On a roster this size, one nurse with the flu who misses three shifts is half of the cycle's 6 callouts. Look for a pattern across cycles before you treat one cycle as a trend, and before you raise it with any one nurse.

## Are Weekend, Holiday and Night Shifts Shared Fairly Among Your Nurses?

Count each nurse's weekend, holiday and night shifts for the cycle, and compare each count with the average for nurses on the same hours. Look first at any nurse more than two weekend shifts above that average.

The [fair nurse schedule guide](/blog/fair-nurse-schedule-small-hospital) has the full method: which shifts to count, how to work out each nurse's fair share, and the order to fill shifts in. On the example roster, each full-time nurse works about 3 weekend shifts in a four-week cycle, so a nurse with 6 or more is more than two above.

What this sheet adds is the view across columns. Put the weekend and night counts next to the overtime and extra-shift columns. Here is a slice of the example sheet:

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full table-fixed break-words text-sm border border-slate-200">
    <caption class="text-left text-xs text-slate-600 pb-2">Example review sheet, made-up numbers: 5 of the 11 full-time nurses on the example roster, one four-week cycle</caption>
    <thead class="bg-slate-100">
      <tr>
        <th class="text-left align-top px-3 py-2 border-b border-slate-200" style="width:20%">Nurse</th>
        <th class="text-left align-top px-3 py-2 border-b border-slate-200">Overtime hours</th>
        <th class="text-left align-top px-3 py-2 border-b border-slate-200">Extra shifts picked up</th>
        <th class="text-left align-top px-3 py-2 border-b border-slate-200">Weekend shifts</th>
        <th class="text-left align-top px-3 py-2 border-b border-slate-200">Night shifts</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="align-top px-3 py-2 border-b border-slate-100">Nurse A</td><td class="align-top px-3 py-2 border-b border-slate-100">0</td><td class="align-top px-3 py-2 border-b border-slate-100">0</td><td class="align-top px-3 py-2 border-b border-slate-100">3</td><td class="align-top px-3 py-2 border-b border-slate-100">5</td></tr>
      <tr class="bg-amber-50"><td class="align-top px-3 py-2 border-b border-slate-100 font-medium">Nurse B</td><td class="align-top px-3 py-2 border-b border-slate-100">16 (8 posted, 8 from one pick-up)</td><td class="align-top px-3 py-2 border-b border-slate-100">1</td><td class="align-top px-3 py-2 border-b border-slate-100">5</td><td class="align-top px-3 py-2 border-b border-slate-100">9</td></tr>
      <tr><td class="align-top px-3 py-2 border-b border-slate-100">Nurse C</td><td class="align-top px-3 py-2 border-b border-slate-100">8 (posted)</td><td class="align-top px-3 py-2 border-b border-slate-100">0</td><td class="align-top px-3 py-2 border-b border-slate-100">2</td><td class="align-top px-3 py-2 border-b border-slate-100">4</td></tr>
      <tr class="bg-amber-50"><td class="align-top px-3 py-2 border-b border-slate-100 font-medium">Nurse D</td><td class="align-top px-3 py-2 border-b border-slate-100">16 (from two pick-ups)</td><td class="align-top px-3 py-2 border-b border-slate-100">2</td><td class="align-top px-3 py-2 border-b border-slate-100">6</td><td class="align-top px-3 py-2 border-b border-slate-100">10</td></tr>
      <tr><td class="align-top px-3 py-2">Nurse E</td><td class="align-top px-3 py-2">0</td><td class="align-top px-3 py-2">0</td><td class="align-top px-3 py-2">3</td><td class="align-top px-3 py-2">5</td></tr>
    </tbody>
  </table>
</div>

Nurse D picked up two of the night callouts and has the most weekend shifts and the most nights. Nurse B is close behind, tied with Nurse D on overtime hours and second in the other columns. The other 8 overtime hours in the cycle came from one pick-up by a nurse not shown here.

Seeing the same names in every column is worth acting on. A nurse who is always the one who says yes to the 2 a.m. call ends up with the most nights, the most overtime and the least rest. The counts let you see it before that nurse tells you about it.

## How Do You Calculate What Covering Nurse Callouts Costs?

Count the hours first, then turn them into dollars using what you actually paid. For every callout in the cycle, note how the shift was covered: an extra shift by one of your own nurses, a PRN nurse, an agency nurse, or left short.

In the example cycle, the 6 callouts were 6 shifts of 12 hours. Four were covered by your own nurses picking up an extra shift, one by a PRN nurse and one by an agency nurse.

- **Your own nurses:** 4 pick-ups × 12 hours = 48 hours. Of those 48 hours, 32 were overtime hours and 16 were regular pay, as worked out above.
- **PRN nurse:** 12 hours at your PRN pay.
- **Agency nurse:** 12 hours, at the total on the agency's invoice.

Under the federal Fair Labor Standards Act (FLSA), overtime is paid at no less than [time and a half](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime). Use the overtime amounts payroll actually paid rather than working out the rate yourself. The total is what covering callouts cost you that cycle, split by how you covered them.

Two costs will not show up on that sheet. The first is the nurse manager's own time on the phone filling shifts; our [after-hours callout coverage guide](/blog/after-hours-callout-coverage-small-hospitals) adds that to the cost of a single callout. The second is a resignation. NSI Nursing Solutions' [2026 National Health Care Retention and RN Staffing Report](https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf) puts the average cost of a bedside RN leaving at $60,090. Our guide to [the cost of losing a nurse at a rural hospital](/blog/cost-of-losing-a-nurse-rural-hospital) works through what that means at a small hospital.

## How Often Should You Review Your Nurse Scheduling Metrics?

Our suggestion is to update the sheet once at the end of every cycle, and to read three cycles side by side every quarter. The first build of the sheet takes the longest. After that, each cycle adds one set of numbers per nurse.

When the sheet shows something, change one thing and check the next cycle. If night callout cover drives the overtime, try one change to how night callouts are covered, then see whether the night overtime falls. If you change three things at once, the next cycle cannot tell you which one worked.

Keep each cycle's sheet with that cycle's posted schedule. The sheet and the schedule together show what was planned and what happened. Our guide to the [nurse schedule audit trail](/blog/nurse-schedule-audit-trail) covers what else to keep with them.

## What Can SimpleScheduleAI Send You for This Review?

SimpleScheduleAI is an [AI-native nurse scheduling service](/ai-nurse-scheduling) for Texas [Critical Access Hospitals](/critical-access-hospital-scheduling). The AI builds three draft schedules each cycle, our scheduling team checks them, and the nurse manager approves before anything posts.

For any schedule we built, the record behind it holds who worked each weekend, holiday, day and night shift. We can send those per-nurse counts for any period, on request. Those counts give you the weekend, holiday and night counts for the shifts we scheduled; extra shifts picked up still come from your callout notes. Weekend counts carry into the next cycle, so a nurse who worked extra weekends is steered toward fewer the next time.

Each draft is built to keep nurses under 40 scheduled hours in the Monday-to-Sunday week where the roster allows. Any shift that would take a nurse past the 40-hour weekly FLSA overtime threshold is flagged as overtime in the schedule. Each callout you report to us is logged with its reason.

Some honest limitations:

- The scheduler does not balance night shifts when it builds the schedule, so the night column still needs your eye.
- The scheduler does not keep a running count of charge shifts per nurse.
- SimpleScheduleAI works from scheduled hours only. It has no time clock and no payroll link, so the overtime column still comes from your payroll export.
- SimpleScheduleAI does not report costs in dollars.
- No report creates a nurse you do not have. If only four nurses can work nights, the sheet makes that risk precise but cannot fix it.

See [how it works](/how-it-works) and [pricing](/pricing). If you are comparing tools, see our guide to [nurse scheduling software for critical access hospitals](/nurse-scheduling-software).

<div class="not-prose my-10 rounded-xl bg-amber-50 border-l-4 border-amber-500 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 leading-relaxed m-0">A schedule review is worth doing for one reason: it turns a feeling into a name and a number. You may already sense where the strain is. The sheet shows whether the overtime is a planning problem or a coverage problem, and which nurses are carrying it. You do not need software for that. You need three cycles of your own files and the discipline to change one thing at a time.</p>
</div>

## What to Do This Week

1. **Monday: pull the files.** Export the last three cycles of posted schedules and payroll, and gather your callout notes for the same weeks.
2. **Tuesday: build the sheet.** One row per nurse, grouped by full-time, part-time and PRN, with columns for overtime, extra shifts, weekends, holidays and nights.
3. **Wednesday: sort the overtime.** For each nurse's week, split the overtime into posted-schedule overtime and callout-cover overtime, then sort the callout cover by shift type.
4. **Thursday: count callouts and weekends.** Work out callouts per 100 scheduled shifts, and mark anyone more than two weekend shifts above their group's average.
5. **Friday: pick one change.** Write down the one thing the sheet points to, and the number you will check at the end of next cycle.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">Every shift covered, without leaning on the same few nurses.</p>
  <p class="text-muted text-sm mb-6">AI builds your schedule, our scheduling team checks it, you approve. No IT.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="mt-4 mb-0 text-sm"><a href="https://cal.com/gautham-8bdvdx/30min" class="text-primary underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: What are the most useful nurse scheduling metrics for a small hospital?**

Start with four. The first is overtime, split into what the posted schedule created and what came from covering callouts. The second is callouts per 100 scheduled shifts. The third is each nurse's weekend, holiday and night shifts against the average for nurses on the same hours. The fourth is the cost of covering callouts by overtime, PRN or agency.

**Q: Do I need software to track nurse scheduling metrics?**

No. Every step in this guide works in a spreadsheet. Software can save the counting, but the review itself needs only your own files.

**Q: How do I calculate a nurse callout rate?**

Divide the number of shifts with a callout by the number of scheduled shifts, then multiply by 100. On a schedule of 112 shifts with 6 callouts, that is about 5 callouts per 100 scheduled shifts. Compare it with your own last few cycles.

**Q: Why doesn't my payroll overtime match the schedule?**

The posted schedule shows the plan. Payroll shows what happened, including shifts picked up after callouts and shifts that ran long. The gap between the two is why the overtime column is worth building: it shows how much overtime came from outside the posted schedule.

**Q: How many cycles of data do I need?**

Three four-week cycles is a reasonable first pass. On a small roster, one cycle can swing on a single nurse's illness, so look for the same pattern in more than one cycle before acting on it.

## Sources

1. NSI Nursing Solutions, [2026 National Health Care Retention and RN Staffing Report](https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf)
2. CDC NIOSH, [Work-Hour Training for Nurses, Module 9: why night shifts are difficult](https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod9/02.html)
3. U.S. Department of Labor, [Fact Sheet #54: The Health Care Industry and Hours Worked](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime)

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
