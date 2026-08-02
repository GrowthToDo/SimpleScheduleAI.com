---
draft: false
publishDate: 2026-08-02T00:00:00Z
author: 'Pradeep Pandey'
title: 'Fair Holiday Rotation for Nurses: A/B/C Block Method'
excerpt: >
  At a 25-bed Critical Access Hospital, the same nurses end up working Christmas every year
  unless you have a documented rotation system. The A/B/C block method divides nursing staff
  into three groups that rotate through major holidays on a fixed three-year cycle, so no
  group draws the same holiday twice in a row.
image: https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - holiday-scheduling
metadata:
  canonical: 'https://simplescheduleai.com/blog/fair-holiday-rotation-nurses-cah'
---

## Key Takeaways

- Holiday shift fairness is a recurring flashpoint at small hospitals, and the usual cause is the absence of a documented rotation system rather than any actual favoritism by the manager.
- The A/B/C block method assigns nurses to one of three groups that rotate through major holidays on a fixed three-year cycle, so no group works the same holiday two years in a row.
- At a 25-bed CAH with 20-30 nurses, three groups of 7-10 nurses each provide enough coverage for a holiday skeleton crew without requiring agency staff.
- The method requires two setup decisions before it runs: which holidays are in rotation, and how many nurses constitute minimum safe coverage per shift.
- New hires and per-diem nurses enter through a defined integration rule, which removes the ad hoc manager judgment that creates most of the grievances.

## Table of Contents

- [Why Does Holiday Scheduling Break Down at Small Hospitals?](#why-does-holiday-scheduling-break-down-at-small-hospitals)
- [What Is a Fair Holiday Rotation?](#what-is-a-fair-holiday-rotation)
- [How Does the A/B/C Block Method Work?](#how-does-the-abc-block-method-work)
- [How Do You Set Up the Rotation at a 25-Bed Hospital?](#how-do-you-set-up-the-rotation-at-a-25-bed-hospital)
- [How Do You Handle New Hires, Per-Diem Staff, and Callouts?](#how-do-you-handle-new-hires-per-diem-staff-and-callouts)
- [How Does SimpleScheduleAI Help With a Holiday Rotation?](#how-does-simplescheduleai-help-with-a-holiday-rotation)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

## Why Does Holiday Scheduling Break Down at Small Hospitals?

Every nurse manager at a Critical Access Hospital has had this conversation: a nurse pulls up last year's schedule to prove they worked Christmas when someone else had it off. The accusation might be accurate or it might be misremembered, but the manager has no clean way to verify it. Without a written rotation system, the manager must either defend a judgment call or negotiate a swap in real time, both of which signal that holiday fairness is negotiable.

The root cause is structural. Most CAHs assign holidays through a combination of seniority priority, manager discretion, and voluntary swaps. That combination consistently produces the same outcome: nurses who assert preferences early or have social capital with the manager get preferred dates, and nurses who say nothing or are new end up with the unfilled shifts.

At a 25-bed hospital, the problem is magnified because there is no float pool. You have 20-30 nurses covering all inpatient shifts, and the holiday skeleton crew is typically 3-5 nurses per shift. Every holiday, you need roughly the same number of bodies, which means the same distribution of sacrifice regardless of who is asking.

<div class="not-prose my-8">
  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Holiday scheduling without a rotation system</p>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-red-600 dark:bg-red-700 px-4 py-2"><p class="text-xs font-bold text-white m-0">Seniority-first</p></div>
      <div class="px-4 py-3">
        <p class="text-xs text-slate-700 dark:text-slate-300 m-0">Senior nurses claim preferred dates first.</p>
        <p class="text-xs font-semibold text-red-800 dark:text-red-300 mt-2 mb-0">Result: the same nurses get Christmas off every year, and new hires always draw the hard dates.</p>
      </div>
    </div>
    <div class="rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-red-600 dark:bg-red-700 px-4 py-2"><p class="text-xs font-bold text-white m-0">Manager discretion</p></div>
      <div class="px-4 py-3">
        <p class="text-xs text-slate-700 dark:text-slate-300 m-0">The manager assigns from personal knowledge of the staff.</p>
        <p class="text-xs font-semibold text-red-800 dark:text-red-300 mt-2 mb-0">Result: a perception of favoritism even when every decision was fair, with no audit trail to check past years against.</p>
      </div>
    </div>
    <div class="rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-red-600 dark:bg-red-700 px-4 py-2"><p class="text-xs font-bold text-white m-0">Voluntary swaps only</p></div>
      <div class="px-4 py-3">
        <p class="text-xs text-slate-700 dark:text-slate-300 m-0">Nurses self-organize coverage between themselves.</p>
        <p class="text-xs font-semibold text-red-800 dark:text-red-300 mt-2 mb-0">Result: night and weekend holiday shifts go unfilled, and the manager closes the gaps at the last minute.</p>
      </div>
    </div>
  </div>
  <p class="text-xs text-slate-600 dark:text-slate-400 mt-3 mb-0">All three share one flaw: no documented rotation, so there is no baseline of fairness to check against.</p>
</div>

The solution replaces discretion with a rule-based rotation system that nurses can verify for themselves. A better discretion process does not fix it, because the verification problem remains.

## What Is a Fair Holiday Rotation?

A fair holiday rotation is a written, documented system that assigns nurses to holiday shifts on a predetermined cycle, typically spanning two to three years. Every nurse in the rotation can see when they are scheduled to work each major holiday, and the rotation advances automatically at the end of each cycle. No nurse works the same high-demand holiday two years in a row under a well-structured three-year rotation.

The key word is documented. A rotation that exists only in the manager's memory is functionally the same as discretion-based scheduling, because nurses cannot verify fairness and the manager cannot prove it. The system only works if it is written down, distributed, and applied consistently.

For it to qualify as fair by most nursing staff standards, the rotation should satisfy three conditions: equal frequency of holiday coverage across all staff, equal distribution of high-demand dates (Christmas Eve/Christmas Day versus lower-demand holidays like Columbus Day), and a mechanism for new hires to enter the rotation without permanently disadvantaging existing staff.

## How Does the A/B/C Block Method Work?

The A/B/C block method divides your nursing staff into three groups that rotate through major holidays on a fixed three-year cycle. In Year 1, Group A works Thanksgiving, Group B works Christmas, and Group C works New Year's. In Year 2, the groups advance: Group B works Thanksgiving, Group C works Christmas, and Group A works New Year's. In Year 3, Group C works Thanksgiving, Group A works Christmas, and Group B works New Year's. After Year 3, the cycle resets.

The result is that no group works the same high-demand holiday two years in a row. Group B works Christmas in Year 1, then does not work Christmas again until Year 4.

<div class="not-prose overflow-x-auto my-8">
  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">A/B/C block holiday rotation: the three-year cycle</p>
  <table class="w-full text-xs sm:text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="bg-slate-100 dark:bg-slate-700">
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:25%">Holiday</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:25%">Year 1</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:25%">Year 2</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:25%">Year 3</th>
      </tr>
    </thead>
    <tbody>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">Thanksgiving</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group A</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group B</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group C</td>
      </tr>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">Christmas</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group B</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group C</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group A</td>
      </tr>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">New Year&rsquo;s</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group C</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group A</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Group B</td>
      </tr>
    </tbody>
  </table>
  <p class="text-xs text-slate-600 dark:text-slate-400 mt-3 mb-0">After Year 3 the cycle resets. No group works the same holiday two years running.</p>
</div>

The method works with any mix of full-time, part-time, and per-diem nurses, but the initial group assignment must be randomized or agreed upon to prevent the starting point from becoming a new source of grievance.

## How Do You Set Up the Rotation at a 25-Bed Hospital?

Setup requires four decisions before you launch the rotation. Make these decisions with your charge nurses present, document the outcome, and distribute it to all nursing staff before the rotation begins.

**Decision 1: Which holidays are in rotation.** Typical mandatory rotation holidays are Thanksgiving, Christmas Eve, Christmas Day, New Year's Eve, and New Year's Day. Some also include the Fourth of July, Memorial Day, and Labor Day as secondary rotation holidays. Secondary holidays can use the same A/B/C cycle offset by one position (Group B in Year 1 covers secondary holidays while Group A covers primary) or can be handled through a voluntary preference list with manager override.

**Decision 2: Minimum staffing for a holiday skeleton crew.** Determine the minimum number of RNs and aides required for each shift on a holiday. As an illustration, a 25-bed hospital might set 2 RNs and 2 aides per shift as its holiday floor, though your number will be specific to your unit and census. This is a floor the rotation always staffs at or above.

**Decision 3: Initial group assignment.** Divide your nursing staff into three equal groups. The fairest method is to assign nurses alphabetically by last name and divide into thirds, then conduct a one-time draw to determine which alphabetical third becomes Group A, B, or C. Nurses hired within the same quarter can be assigned together.

**Decision 4: How the rotation handles partial-year availability.** Full-time nurses participate in all holidays in their group's rotation year. Part-time nurses (0.6 FTE or above) participate in a proportional subset, typically two of the three major holidays. Per-diem nurses do not participate in the mandatory rotation but are first on the callout list for holiday coverage bonuses.

## How Do You Handle New Hires, Per-Diem Staff, and Callouts?

New hires are assigned to the group with the smallest current headcount at the time of hire. If all three groups are equal in size, the new hire is assigned to the group that has not had the most recent addition. The new hire participates in the full rotation for whatever year they join, even if they are hired mid-cycle. This means a nurse hired in October may work a major holiday within two months; communicate this during hiring to prevent surprises.

Per-diem nurses do not occupy a group slot in the mandatory rotation. They are listed on a separate holiday coverage roster, sorted by seniority. When the holiday skeleton crew needs additional staff above the mandatory minimum, the per-diem roster is worked from the top down. Per-diem nurses who decline a holiday call move to the bottom of the roster. The queue resets annually, so a decline carries no lasting penalty.

Holiday callouts need a defined response protocol written before the holiday arrives. When a nurse in the mandatory rotation calls out of a holiday shift, the replacement sequence is: (1) per-diem nurses on the holiday coverage roster, (2) nurses from the off-holiday group who have volunteered for holiday overtime, (3) nurses from the other off-holiday group. The on-call nurse manager does not personally contact nurses in random order; they work the list.

<div class="not-prose my-8">
  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Holiday callout replacement sequence</p>
  <ol class="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <li class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-slate-700 dark:bg-slate-600 px-3 py-2"><p class="text-xs font-bold text-white m-0">Step 1</p></div>
      <div class="px-3 py-3"><p class="text-xs text-slate-700 dark:text-slate-300 m-0">Per-diem nurses on the holiday roster, in seniority order.</p></div>
    </li>
    <li class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-slate-700 dark:bg-slate-600 px-3 py-2"><p class="text-xs font-bold text-white m-0">Step 2</p></div>
      <div class="px-3 py-3"><p class="text-xs text-slate-700 dark:text-slate-300 m-0">Nurses from an off-group who pre-volunteered for holiday overtime.</p></div>
    </li>
    <li class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-slate-700 dark:bg-slate-600 px-3 py-2"><p class="text-xs font-bold text-white m-0">Step 3</p></div>
      <div class="px-3 py-3"><p class="text-xs text-slate-700 dark:text-slate-300 m-0">The second off-group, in rotation seniority order.</p></div>
    </li>
    <li class="rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div class="bg-red-600 dark:bg-red-700 px-3 py-2"><p class="text-xs font-bold text-white m-0">Escalation</p></div>
      <div class="px-3 py-3"><p class="text-xs text-slate-700 dark:text-slate-300 m-0">Mandatory overtime, only as far as needed to hold the on-duty requirement.</p></div>
    </li>
  </ol>
  <p class="text-xs text-slate-600 dark:text-slate-400 mt-3 mb-0">Work the list in order and record every contact attempt and outcome in your schedule documentation. A per-diem nurse who declines moves to the bottom of the roster for that cycle year.</p>
</div>

Document every contact attempt and outcome. If you ever face a CMS survey or a nurse grievance, the record of who was contacted in what order is your evidence that the process was followed correctly.

## How Does SimpleScheduleAI Help With a Holiday Rotation?

[SimpleScheduleAI](/nurse-scheduling-software) is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve. To be clear about what that means for a rotation: the service does not store your A/B/C groups or track the cycle position as a feature. The rotation chart, meaning who sits in which group and which year the cycle is in, lives in your written policy document, and the review step is where you hold the draft against it.

What the service does contribute sits underneath the rotation. Fairness rules distribute nights, weekends, and holidays evenly when drafts are built, with a running per-nurse count, so holiday load cannot quietly concentrate on the same few people between rotation years. When a holiday callout occurs, the system ranks the top replacement candidates with reasons: skills, role, charge coverage, and overtime risk. And every schedule change is logged with a timestamp, so when a nurse later disputes whether the rotation was followed, you have the record of what each holiday schedule was and when it changed. The log records changes and timestamps; the reasoning behind a manual substitution is yours to note in the policy file.

One honest limitation: SimpleScheduleAI is not the right tool if your hospital needs holiday rotation tracking wired into a payroll system or an EHR. It is built for [critical access hospital scheduling](/critical-access-hospital-scheduling) specifically, meaning 25 beds or fewer and a nurse manager without an IT department behind her. You send us your staff list and shift structure via Excel, we configure the rules, run a test cycle, and hand you a draft schedule for review, with the first schedule in under two weeks. For how the drafts are built against your rules, see [AI nurse scheduling](/ai-nurse-scheduling), and for the end-to-end cycle see [how it works](/how-it-works).

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    The argument about holiday fairness is almost never really about one Christmas. It is about a nurse having no way to check whether the last three years were even, and a manager having no way to prove they were. A written rotation ends that argument by making the answer lookupable by anyone, which is why the documentation matters more than the particular method you choose. Set it up in August or September, when nobody is emotional about it. Trying to introduce a rotation in mid-November, with the assignments already visible, turns a policy decision into a negotiation about specific people and specific dates.
  </p>
</div>

## What to Do This Week

1. **Pull the last two years of holiday schedules.** Count, per nurse, how many of Thanksgiving, Christmas, and New Year's they worked. If two or three names carry a clearly heavier load, you have the evidence that a rotation is needed, and the starting point for who goes in which group.
2. **Write down your holiday skeleton crew number.** The minimum RNs and aides per shift on a holiday. Everything else in the rotation sits on top of this floor, and the floor has to satisfy the on-duty requirement.
3. **Decide which holidays are in rotation before you assign anyone.** Deciding the holiday list after people see their assignments guarantees an argument about the list.
4. **Draw the groups by an objective method and record the draw.** Alphabetical thirds with a one-time randomized draw for which third becomes A, B, or C. The record of the draw is what makes it defensible later.
5. **Distribute the rotation in writing before October.** Nurses need to plan family travel. A rotation published after Halloween solves next year's problem instead of this one.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">
    Running a Critical Access Hospital in Texas?
  </p>
  <p class="text-muted text-sm mb-6">
    Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it.
  </p>
  <a
    href="/how-it-works"
    class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
  >
    See how it works →
  </a>
  <p class="mt-4 mb-0 text-sm"><a href="https://cal.com/gautham-8bdvdx/30min" class="text-primary underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: What is a fair holiday rotation system for nurses?**

A fair holiday rotation assigns nurses to holiday shifts on a predetermined, documented cycle so no nurse works the same high-demand holiday two years in a row. It must be written, distributed to all staff, and applied consistently. The A/B/C block method is a common approach at small hospitals because it requires no software and can be verified by any nurse who reads the rotation chart.

**Q: How do you divide nurses into groups for a holiday rotation?**

Divide nursing staff into three equal groups by an objective method, typically alphabetically by last name, then conduct a randomized draw to assign the alphabetical thirds to Group A, B, or C. Equal group size ensures equal holiday burden distribution. If group sizes are uneven because staff count is not divisible by three, assign the extra nurse to the group with the fewest members.

**Q: What happens when a nurse calls out of a mandatory holiday shift?**

Work a defined replacement sequence: first contact per-diem nurses on the holiday coverage roster (by seniority), then contact nurses from an off-group who have pre-volunteered for holiday overtime, then contact nurses from the second off-group. Document every contact attempt. Mandatory overtime is the last resort rather than the first call. The floor you cannot drop below is the CMS on-duty requirement at [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631): a registered nurse, clinical nurse specialist, or licensed practical nurse on duty whenever the hospital has one or more inpatients.

**Q: How do you handle new hires in an existing holiday rotation?**

Assign new hires to the group with the smallest headcount at the time of hire. The new hire participates in that group's rotation for the current cycle year, even if they are hired mid-cycle. Communicate this expectation during the hiring process. New hires who are hired within 60 days of a major holiday they are assigned to cover can request a one-time swap with another new hire in a different group, subject to manager approval.

**Q: Is a written holiday rotation policy legally required for a Texas Critical Access Hospital?**

No. No federal or Texas rule requires a written holiday rotation policy specifically. What CMS does require is continuous coverage: under [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631), a registered nurse, clinical nurse specialist, or licensed practical nurse must be on duty whenever the hospital has one or more inpatients, and holidays are no exception. A documented rotation is not itself the requirement; it is how a small hospital reliably meets the requirement on the days coverage is hardest to fill, and it gives you a record of how each holiday was staffed.

## Sources

1. CMS Conditions of Participation for Critical Access Hospitals, on-duty licensed nurse requirement: a registered nurse, clinical nurse specialist, or licensed practical nurse must be on duty whenever the hospital has one or more inpatients. [eCFR, 42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631).

2. Nursing services standard for Critical Access Hospitals under the Conditions of Participation. [eCFR, 42 CFR 485.635(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635).

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
