---
draft: true
publishDate: 2026-08-25T00:00:00Z
updateDate: 2026-08-18T00:00:00Z
author: 'Pradeep Pandey'
title: 'How to Reduce Nurse Overtime at a Critical Access Hospital'
excerpt: >
  Nurse overtime at a Critical Access Hospital is not random. It comes from three
  predictable sources: callout coverage that defaults to the same willing nurses,
  schedules built without real-time hour tracking, and a thin roster that makes
  saying no to overtime feel clinically unsafe. This guide covers each source and
  what to do about it.
image: https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: howto
tags:
  - nurse-overtime
  - nurse-scheduling
  - critical-access-hospitals
  - how-to
  - healthcare-operations
metadata:
  canonical: 'https://simplescheduleai.com/blog/how-to-reduce-nurse-overtime'
---

## Key Takeaways

- Nurse overtime at a Critical Access Hospital (CAH) is almost always structural, not behavioral. It is not that nurses are working overtime because they want the pay. It is that the scheduling process creates overtime conditions that are difficult to avoid.
- The three root causes of CAH nurse overtime are: callout defaults (the same nurses always get called first), scheduled hour blind spots (the schedule is built without tracking hours in the current 14-day pay period), and roster thinness (there are not enough nurses to cover callouts without someone going over threshold).
- Fixing callout defaults is the fastest lever. Changing who gets called first during a callout event, based on overtime risk, not availability or familiarity, immediately reduces unplanned overtime without changing the schedule.
- The FLSA 8-and-80 rule for healthcare employers is not automatic. CAHs must adopt it in writing. Hospitals that are still calculating overtime on a standard 40-hour workweek threshold are both overpaying on overtime and using the wrong legal standard.
- Overtime is not eliminated by having enough nurses. It is managed by having enough nurses and a scheduling process that tracks hours accurately, distributes callout burden equitably, and raises a flag before a nurse crosses the threshold.

## Table of Contents

- [Why CAH Nurse Overtime Is Structural, Not Random](#why-cah-nurse-overtime-is-structural-not-random)
- [Root Cause 1: Callout Defaults](#root-cause-1-callout-defaults)
- [Root Cause 2: Scheduled Hour Blind Spots](#root-cause-2-scheduled-hour-blind-spots)
- [Root Cause 3: Roster Thinness](#root-cause-3-roster-thinness)
- [The FLSA 8-and-80 Rule: Are You Using It Correctly?](#the-flsa-8-and-80-rule-are-you-using-it-correctly)
- [A Step-by-Step Overtime Reduction Process](#a-step-by-step-overtime-reduction-process)
- [When Overtime Cannot Be Eliminated](#when-overtime-cannot-be-eliminated)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

Nurse overtime at a small hospital does not feel like a system problem. It feels like a staffing problem. When a nurse calls out at 11 PM and the only available replacement is already at 70 hours this pay period, the immediate response is: call them anyway, pay the overtime, and move on. Multiply that response by 2-3 callouts per week for 52 weeks and the overtime bill becomes a line item that leadership notices but no one has a clear plan to reduce.

The structural fix is not hiring more nurses, though that helps. It is building a scheduling and callout process that tracks hours accurately and distributes the callout burden across the full roster rather than defaulting to the same people.

## Why CAH Nurse Overtime Is Structural, Not Random?

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" role="img" aria-label="Three structural overtime sources at a Critical Access Hospital">
  <title>Three Structural Sources of CAH Nurse Overtime</title>
  <rect width="720" height="280" fill="#f8fafc" rx="10"/>
  <text x="360" y="28" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#0f172a" text-anchor="middle">Three Structural Sources of CAH Nurse Overtime</text>
  <rect x="30" y="48" width="205" height="210" fill="white" rx="8" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="30" y="48" width="205" height="40" fill="#dc2626" rx="8"/>
  <rect x="30" y="79" width="205" height="9" fill="#dc2626"/>
  <text x="133" y="72" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white" text-anchor="middle">Callout Defaults</text>
  <text x="133" y="110" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">The nurse manager calls</text>
  <text x="133" y="126" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">whoever answers fastest.</text>
  <text x="133" y="142" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">The same 2-3 nurses absorb</text>
  <text x="133" y="158" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">most callout shifts.</text>
  <text x="133" y="184" font-family="system-ui,sans-serif" font-size="10" fill="#dc2626" text-anchor="middle" font-weight="600">Fix: rank by OT risk first,</text>
  <text x="133" y="198" font-family="system-ui,sans-serif" font-size="10" fill="#dc2626" text-anchor="middle">availability second</text>
  <rect x="258" y="48" width="205" height="210" fill="white" rx="8" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="258" y="48" width="205" height="40" fill="#d97706" rx="8"/>
  <rect x="258" y="79" width="205" height="9" fill="#d97706"/>
  <text x="361" y="72" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white" text-anchor="middle">Hour Blind Spots</text>
  <text x="361" y="110" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">Schedule built without</text>
  <text x="361" y="126" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">checking current hours.</text>
  <text x="361" y="142" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">Nurse already at 68 hrs</text>
  <text x="361" y="158" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">gets a 12-hr callout shift.</text>
  <text x="361" y="184" font-family="system-ui,sans-serif" font-size="10" fill="#d97706" text-anchor="middle" font-weight="600">Fix: display running hours</text>
  <text x="361" y="198" font-family="system-ui,sans-serif" font-size="10" fill="#d97706" text-anchor="middle">before every assignment</text>
  <rect x="486" y="48" width="205" height="210" fill="white" rx="8" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="486" y="48" width="205" height="40" fill="#7c3aed" rx="8"/>
  <rect x="486" y="79" width="205" height="9" fill="#7c3aed"/>
  <text x="589" y="72" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white" text-anchor="middle">Roster Thinness</text>
  <text x="589" y="110" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">Not enough nurses to</text>
  <text x="589" y="126" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">cover callouts without</text>
  <text x="589" y="142" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">someone going over</text>
  <text x="589" y="158" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">the 80-hr threshold.</text>
  <text x="589" y="184" font-family="system-ui,sans-serif" font-size="10" fill="#7c3aed" text-anchor="middle" font-weight="600">Fix: PRN pool + cross-train</text>
  <text x="589" y="198" font-family="system-ui,sans-serif" font-size="10" fill="#7c3aed" text-anchor="middle">to expand the available pool</text>
</svg>

## Root Cause 1: Callout Defaults

The most common driver of preventable overtime at a CAH is callout default behavior. When a nurse calls out, the nurse manager calls whoever comes to mind first, usually the nurse who always answers, the one who lives closest, or the one who was last scheduled.

That approach distributes callout burden based on familiarity and availability, not overtime risk. The result is predictable: the same nurses accumulate callout hours on top of their scheduled hours, cross the 80-hour threshold in a 14-day period, and generate overtime liability that could have been avoided if someone had called a different nurse first.

**The fix is a ranked callout list.**

Before any callout call is made, the nurse manager should be looking at a list that shows:

1. Hours worked in the current 14-day period (FLSA 8-and-80 reference)
2. Whether the nurse has the credentials the open shift requires
3. Whether the nurse is available (not already scheduled that day)

The list should be sorted by overtime risk ascending, the nurse with the fewest current-period hours who meets credential requirements gets called first.

This is not complicated to build manually. A spreadsheet with running hour totals updated after each shift can serve this purpose. The difficulty is maintaining it consistently under the time pressure of a midnight callout.

Scheduling software with callout management features can automate this ranking. A managed scheduling service like [SimpleScheduleAI](/) surfaces this ranked list automatically. But even without software, establishing the habit of checking hours before calling reduces overtime meaningfully.

## Root Cause 2: Scheduled Hour Blind Spots

The second cause of overtime is schedule construction without hour tracking. A nurse manager building a 4-week rotation in a spreadsheet typically works from availability, who is not already scheduled, not from hours. If a nurse was scheduled for 72 hours in the first 10 days of a 14-day period and an extra callout shift is added on day 11, that nurse is now over the FLSA 8-and-80 threshold.

This type of overtime is not a callout surprise. It is a schedule construction error. The nurse was assigned too many hours in the same 14-day window before the callout even occurred.

**The fix is visible running hour totals.**

When building or modifying a schedule, the nurse manager should be able to see, for each nurse, the running total of scheduled hours in the current and next 14-day period. Any nurse approaching 72 hours scheduled should be flagged as overtime risk before additional shifts are assigned.

If you are scheduling in Excel, add a column per nurse tracking hours in the current 14-day window. If you are using scheduling software, verify that the overtime threshold is set to the 8-and-80 rule and that flagging occurs when a nurse approaches 72-80 hours in a period.

## Root Cause 3: Roster Thinness

The third cause is structural and cannot be solved by process alone: a roster that is too thin to absorb callouts without someone going over the overtime threshold.

A 25-bed CAH with 18 nurses running 21 shifts per week has approximately 60-70% roster utilization. On paper, there is capacity. In practice, once scheduled hours, credential constraints, availability constraints, and charge nurse requirements are applied, the available pool for any given callout is often 2-4 people. If those 2-4 people are already at 64+ hours in the period, every callout generates overtime.

**The fix is PRN pool depth and cross-training.**

Increasing the PRN bench, even by 2-3 nurses, meaningfully expands the callout pool. PRN nurses are typically paid only for hours worked and can be called for specific shifts without affecting full-time employees' hour totals.

Cross-training staff nurses for additional units (or for charge designation) also expands the eligible pool. A nurse who can cover both the medical-surgical unit and the emergency department provides twice the scheduling flexibility during callout events.

Hiring is a real constraint. But targeted additions to the PRN bench, specifically for callout coverage, typically show ROI within one quarter when measured against the overtime cost they displace.

## The FLSA 8-and-80 Rule: Are You Using It Correctly?

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 300" role="img" aria-label="Comparison of standard 40-hour overtime versus FLSA 8-and-80 rule for healthcare employers">
  <title>Standard vs. FLSA 8-and-80 Overtime: Side-by-Side Comparison</title>
  <rect width="720" height="300" fill="#f8fafc" rx="10"/>
  <text x="360" y="28" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#0f172a" text-anchor="middle">Standard Overtime vs. FLSA 8-and-80 Rule</text>
  <!-- Left column: standard -->
  <rect x="40" y="48" width="290" height="230" fill="white" rx="8" stroke="#fca5a5" stroke-width="1.5"/>
  <rect x="40" y="48" width="290" height="40" fill="#dc2626" rx="8"/>
  <rect x="40" y="79" width="290" height="9" fill="#dc2626"/>
  <text x="185" y="72" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white" text-anchor="middle">Standard 40-Hour Rule (Default)</text>
  <text x="185" y="110" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">Overtime owed after 40 hrs/week</text>
  <text x="185" y="130" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">Example: nurse works 4 x 12-hr shifts</text>
  <text x="185" y="146" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">= 48 hrs this week = 8 hrs OT owed</text>
  <text x="185" y="170" font-family="system-ui,sans-serif" font-size="11" fill="#6b7280" text-anchor="middle">Even if nurse only works 32 hrs</text>
  <text x="185" y="186" font-family="system-ui,sans-serif" font-size="11" fill="#6b7280" text-anchor="middle">the following week (total 80 hrs)</text>
  <text x="185" y="202" font-family="system-ui,sans-serif" font-size="11" fill="#6b7280" text-anchor="middle">OT was still owed in Week 1</text>
  <text x="185" y="232" font-family="system-ui,sans-serif" font-size="10" fill="#dc2626" text-anchor="middle" font-weight="600">Less flexible for 12-hr shift scheduling</text>
  <text x="185" y="248" font-family="system-ui,sans-serif" font-size="10" fill="#dc2626" text-anchor="middle">Higher OT cost when nurses work 3x12</text>
  <!-- Right column: 8-and-80 -->
  <rect x="390" y="48" width="290" height="230" fill="white" rx="8" stroke="#86efac" stroke-width="1.5"/>
  <rect x="390" y="48" width="290" height="40" fill="#16a34a" rx="8"/>
  <rect x="390" y="79" width="290" height="9" fill="#16a34a"/>
  <text x="535" y="72" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white" text-anchor="middle">FLSA 8-and-80 Rule (Healthcare)</text>
  <text x="535" y="110" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">OT owed after 8 hrs/day OR 80 hrs in</text>
  <text x="535" y="126" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">14-day period, whichever is higher</text>
  <text x="535" y="146" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">Example: nurse works 4 x 12-hr shifts</text>
  <text x="535" y="162" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">= 48 hrs this week = 0 OT owed yet</text>
  <text x="535" y="178" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">(only 8-hr daily threshold exceeded,</text>
  <text x="535" y="194" font-family="system-ui,sans-serif" font-size="11" fill="#374151" text-anchor="middle">not 80-hr bi-weekly threshold)</text>
  <text x="535" y="232" font-family="system-ui,sans-serif" font-size="10" fill="#16a34a" text-anchor="middle" font-weight="600">Requires written agreement with employees</text>
  <text x="535" y="248" font-family="system-ui,sans-serif" font-size="10" fill="#16a34a" text-anchor="middle">Must be adopted before first pay period</text>
</svg>

The FLSA 8-and-80 rule is available to "hospitals and residential care establishments" under FLSA Section 7(j). It is not automatic. To use it legally, a CAH must:

1. Enter a written agreement with employees (individual or collective bargaining agreement) before the work period begins
2. Designate a fixed 14-day work period (it cannot change from period to period)
3. Calculate overtime against both the daily 8-hour threshold and the 80-hour bi-weekly threshold, paying at the higher rate

Many CAHs believe they are using the 8-and-80 rule when they are actually using a standard 40-hour calculation. Ask your HR department or payroll vendor specifically: what is the overtime threshold in your payroll system? If the answer is 40 hours per workweek, you may not have the 8-and-80 rule in place.

If you have not adopted the 8-and-80 rule, consult an employment attorney or HR advisor before implementing it. Retroactive adoption is not allowed, and errors in implementation create wage and hour liability.

For CAHs that have properly adopted the 8-and-80 rule, the scheduling implication is clear: you can schedule a nurse for four 12-hour shifts in a week (48 hours) without triggering overtime, as long as their total in the 14-day period stays at or below 80 hours. That flexibility is not available under the standard 40-hour rule.

## What Is a Step-by-Step Overtime Reduction Process?

**Step 1: Audit the last 90 days of overtime.** Pull payroll records and identify which nurses generated overtime, how many overtime hours each accumulated, and whether the overtime was planned (scheduled) or unplanned (callout coverage). This identifies whether your problem is schedule construction or callout defaults.

**Step 2: Identify your callout default pattern.** Review the last 30 days of callout events. For each event: who was called first, who actually covered, and what their hours were at the time. If the same 3 nurses covered most callouts regardless of their hour totals, callout defaults are your primary problem.

**Step 3: Build a ranked callout list.** Create a simple spreadsheet with columns: nurse name, credentials, running hours in current 14-day period, availability flag. Sort by hours ascending. Before every callout call, consult this list. Call from the top.

**Step 4: Verify your overtime threshold.** Confirm with payroll that you are calculating overtime under the correct rule for your adoption status. If you have adopted 8-and-80, confirm the system reflects it. If you have not, evaluate whether adoption makes sense for your staffing model.

**Step 5: Add a running hour check to your schedule build process.** Before publishing any schedule, verify that no nurse is scheduled for more than 72 hours in any 14-day window (leaving room for one unplanned callout shift without overtime). Adjust before publishing.

**Step 6: Evaluate PRN bench depth.** Compare your callout coverage success rate (how often did you cover the shift without overtime?) against your PRN roster size. If coverage required overtime more than 40% of the time, your PRN bench is insufficient and expansion is the structural fix.

## When Overtime Cannot Be Eliminated?

Some overtime at a CAH is not eliminable. Census surges, multiple simultaneous callouts, and mandatory coverage requirements mean that there will be weeks where overtime happens despite a sound process.

The goal is not zero overtime. It is predictable, defensible overtime: overtime that occurs because the situation genuinely required it, that was documented, that was assigned to the nurse with the lowest overtime exposure among those available, and that was calculated correctly.

Preventable overtime, overtime that occurred because the wrong nurse was called first, or because a schedule was built without hour tracking, or because the overtime threshold was set incorrectly, is a different category. That is the target.

<img src="/images/blog/how-to-reduce-nurse-overtime/SimpleScheduleAI.webp" alt="SimpleScheduleAI automated overtime tracking for CAH nurse scheduling" width="1200" height="630" loading="lazy" class="rounded-lg border border-slate-200 my-4" />

SimpleScheduleAI handles steps 1-6 above as part of the managed service: callout ranking is automated by OT risk and credentials, running hour totals are tracked continuously, and FLSA overtime thresholds are applied by default. The nurse manager reviews the callout ranking and makes the call. The calculation is already done.

## What to Do This Week?

1. **Pull your last 90-day overtime report from payroll.** Identify the top 3 nurses by overtime hours. If those same nurses are also your most frequent callout responders, callout defaults are your primary problem.

2. **Check your payroll overtime threshold.** Ask your payroll vendor or HR: is overtime calculated at 40 hours per workweek or under the FLSA 8-and-80 rule? If you do not know, that is a gap worth closing.

3. **Create a ranked callout list today.** Even in Excel: names, credentials, hours this pay period, available or not. Use it for every callout this week. See if the nurse called first is actually the one with the lowest overtime risk.

4. **Request a free overtime analysis from SimpleScheduleAI.** The analysis reviews your current OT patterns, callout process, and threshold configuration. Visit [SimpleScheduleAI.com](/) to schedule.

5. **Identify one cross-training candidate.** Which staff nurse, if cross-trained for an additional unit or for charge designation, would most expand your callout coverage pool? Cross-training one nurse adds more scheduling flexibility than most other interventions.

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Reduce Overtime Without Adding Staff</p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">SimpleScheduleAI ranks every callout replacement by overtime risk and credentials automatically. The nurse manager calls from the ranked list. No calculation. No defaults. First schedule within 48 hours.</p>
  <a href="/pricing" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See pricing →</a>
  <p class="mt-4 mb-0 text-sm"><a href="https://cal.com/gautham-8bdvdx/30min" class="text-blue-600 dark:text-blue-400 underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**How much nurse overtime is typical at a 25-bed Critical Access Hospital?**

There is no published benchmark specifically for 25-bed CAH nursing overtime. Based on industry survey data from NSI Nursing Solutions and AONL, small hospitals (under 100 beds) typically run nursing overtime costs of 5-12% of total nursing labor cost. For a CAH, the range can be wider because the thin roster provides less buffer against callout-driven overtime. A hospital where overtime exceeds 15% of nursing labor cost likely has a structural scheduling problem, not just a staffing shortage.

**Does the FLSA 8-and-80 rule apply to all nurses at our CAH?**

The 8-and-80 rule applies to all non-exempt employees at a hospital or residential care establishment, if the employer has properly adopted it through a written agreement. RNs and LVNs are generally non-exempt (unless they meet the FLSA professional exemption threshold for highly compensated employees). Before applying the 8-and-80 rule to any category of employees, verify their classification and confirm the written agreement requirement is met.

**Can we require nurses to take callout shifts to prevent overtime gaps?**

Texas does not have a mandatory overtime law prohibiting nurse managers from requiring nurses to cover shifts. Some hospitals have mandatory overtime policies for emergency coverage situations. However, relying on mandatory overtime as a regular coverage strategy is both a recruitment/retention problem and an indication that the scheduling process is not managing coverage proactively. Mandatory overtime that exceeds safe working hours (typically more than 12-16 consecutive hours) also creates patient safety concerns.

**Our overtime is primarily from scheduled shifts, not callouts. What does that mean?**

Scheduled overtime (overtime that appears in the published schedule, not from callouts) indicates a schedule construction problem. Either the schedule is being built without checking 14-day hour totals, or the roster is too thin to fill all required shifts without assigning overtime hours to full-time nurses. If this is the pattern, the fixes are: verify overtime threshold settings in your scheduling system, add hour tracking to your schedule build process, and evaluate whether PRN bench expansion can absorb the hours that are currently assigned to full-time staff.

**How does SimpleScheduleAI prevent overtime during callout events?**

When a callout event is entered into SimpleScheduleAI, the system generates a ranked replacement list that sorts candidates by: credential match (only nurses who can cover the specific shift requirements appear), hours worked in the current 14-day period (nurses further from the 80-hour threshold appear higher), and historical response rate. The nurse manager calls from the top of the list. The system does not allow a nurse at risk of overtime to appear at the top of the callout list, they are ranked lower until a nurse with lower hour exposure has been contacted first.

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
