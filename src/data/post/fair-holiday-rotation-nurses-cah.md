---
draft: true
publishDate: 2026-07-20T00:00:00Z
updateDate: 2026-04-25T00:00:00Z
author: 'Pradeep Pandey'
title: 'Fair Holiday Rotation for Nurses: A/B/C Block Method'
excerpt: >
  At a 25-bed Critical Access Hospital, the same nurses end up working Christmas every year
  unless you have a documented rotation system. The A/B/C block method divides nursing staff
  into three groups that rotate through major holidays on a fixed three-year cycle, so no
  group draws the same holiday twice in a row.
image: https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - holiday-scheduling
metadata:
  canonical: 'https://simplescheduleai.com/blog/fair-holiday-rotation-nurses-cah'
---

## Key Takeaways

- Holiday shift fairness is one of the top sources of nurse dissatisfaction at small hospitals, and it is almost always caused by the absence of a documented rotation system rather than manager favoritism.
- The A/B/C block method assigns nurses to one of three groups that rotate through major holidays on a fixed three-year cycle, so no group works the same holiday two years in a row.
- At a 25-bed CAH with 20-30 nurses, three groups of 7-10 nurses each provide enough coverage for a holiday skeleton crew without requiring agency staff.
- The method requires two setup decisions before it runs: which holidays are in rotation, and how many nurses constitute minimum safe coverage per shift.
- New hires and per-diem nurses are handled by a defined integration rule, not ad hoc manager judgment.

## Table of Contents

- [Why Holiday Scheduling Breaks Down at Small Hospitals](#why-holiday-scheduling-breaks-down)
- [What Is a Fair Holiday Rotation?](#what-is-a-fair-holiday-rotation)
- [How the A/B/C Block Method Works](#how-the-abc-block-method-works)
- [Setting Up the Rotation at a 25-Bed CAH](#setting-up-at-a-25-bed-cah)
- [Handling New Hires, Per-Diem Staff, and Callouts](#new-hires-per-diem-callouts)
- [How SimpleScheduleAI Enforces the Rotation](#how-simplescheduleai-helps)
- [Frequently Asked Questions](#frequently-asked-questions)

## Why Holiday Scheduling Breaks Down at Small Hospitals?

Every nurse manager at a Critical Access Hospital has had this conversation: a nurse pulls up last year's schedule to prove they worked Christmas when someone else had it off. The accusation might be accurate or it might be misremembered, but the manager has no clean way to verify it. Without a written rotation system, the manager must either defend a judgment call or negotiate a swap in real time, both of which signal that holiday fairness is negotiable.

The root cause is structural, not behavioral. Most CAHs assign holidays through a combination of seniority priority, manager discretion, and voluntary swaps. That combination consistently produces the same outcome: nurses who assert preferences early or have social capital with the manager get preferred dates, and nurses who say nothing or are new end up with the unfilled shifts.

At a 25-bed hospital, the problem is magnified because there is no float pool. You have 20-30 nurses covering all inpatient shifts, and the holiday skeleton crew is typically 3-5 nurses per shift. Every holiday, you need roughly the same number of bodies, which means the same distribution of sacrifice regardless of who is asking.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 280" role="img" aria-label="Holiday scheduling failure modes at CAHs: seniority-first creates the same winners every year, discretion-based creates perception of favoritism, voluntary-swap-only leaves night and weekend shifts uncovered">
  <rect width="720" height="280" fill="#f8fafc" rx="8"/>
  <text x="360" y="30" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">Holiday Scheduling Without a Rotation System</text>
  <rect x="30" y="55" width="195" height="160" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="128" y="80" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#dc2626" text-anchor="middle">Seniority-First</text>
  <text x="128" y="100" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">Senior nurses claim</text>
  <text x="128" y="114" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">preferred dates first</text>
  <text x="128" y="138" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">Result: Same nurses</text>
  <text x="128" y="152" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">get Christmas off</text>
  <text x="128" y="166" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">every year</text>
  <text x="128" y="186" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">New hires always</text>
  <text x="128" y="200" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">draw the hard dates</text>
  <rect x="262" y="55" width="195" height="160" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="360" y="80" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#dc2626" text-anchor="middle">Manager Discretion</text>
  <text x="360" y="100" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">Manager assigns based</text>
  <text x="360" y="114" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">on personal knowledge</text>
  <text x="360" y="138" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">Result: Perception of</text>
  <text x="360" y="152" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">favoritism even when</text>
  <text x="360" y="166" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">decisions are fair</text>
  <text x="360" y="186" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">No audit trail; cannot</text>
  <text x="360" y="200" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">verify past decisions</text>
  <rect x="494" y="55" width="195" height="160" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="592" y="80" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#dc2626" text-anchor="middle">Voluntary Swaps</text>
  <text x="592" y="100" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">Nurses self-organize</text>
  <text x="592" y="114" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">coverage via swaps</text>
  <text x="592" y="138" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">Result: Night and</text>
  <text x="592" y="152" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">weekend holiday shifts</text>
  <text x="592" y="166" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">go unfilled</text>
  <text x="592" y="186" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">Manager fills gaps at</text>
  <text x="592" y="200" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d" text-anchor="middle">the last minute</text>
  <text x="360" y="250" font-family="system-ui, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">All three methods share the same flaw: no documented rotation, no baseline of fairness.</text>
</svg>

The solution is not a better discretion process. It is replacing discretion with a rule-based rotation system that nurses can verify themselves.

## What Is a Fair Holiday Rotation?

A fair holiday rotation is a written, documented system that assigns nurses to holiday shifts on a predetermined cycle, typically spanning two to three years. Every nurse in the rotation can see when they are scheduled to work each major holiday, and the rotation advances automatically at the end of each cycle. No nurse works the same high-demand holiday two years in a row under a well-structured three-year rotation.

The key word is documented. A rotation that exists only in the manager's memory is functionally the same as discretion-based scheduling, because nurses cannot verify fairness and the manager cannot prove it. The system only works if it is written down, distributed, and applied consistently.

For it to qualify as fair by most nursing staff standards, the rotation should satisfy three conditions: equal frequency of holiday coverage across all staff, equal distribution of high-demand dates (Christmas Eve/Christmas Day versus lower-demand holidays like Columbus Day), and a mechanism for new hires to enter the rotation without permanently disadvantaging existing staff.

## How the A/B/C Block Method Works?

The A/B/C block method divides your nursing staff into three groups that rotate through major holidays on a fixed three-year cycle. In Year 1, Group A works Thanksgiving, Group B works Christmas, and Group C works New Year's. In Year 2, the groups advance: Group B works Thanksgiving, Group C works Christmas, and Group A works New Year's. In Year 3, Group C works Thanksgiving, Group A works Christmas, and Group B works New Year's. After Year 3, the cycle resets.

The result is that no group works the same high-demand holiday two years in a row. Group A works Christmas in Year 1, then does not work Christmas again until Year 4.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 320" role="img" aria-label="A/B/C block rotation cycle showing which nurse group works each major holiday across three years">
  <rect width="720" height="320" fill="#f8fafc" rx="8"/>
  <text x="360" y="30" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">A/B/C Block Holiday Rotation: Three-Year Cycle</text>
  <rect x="30" y="50" width="155" height="40" rx="4" fill="#e2e8f0"/>
  <text x="108" y="75" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#475569" text-anchor="middle">Holiday</text>
  <rect x="190" y="50" width="155" height="40" rx="4" fill="#dbeafe"/>
  <text x="268" y="75" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#1d4ed8" text-anchor="middle">Year 1</text>
  <rect x="350" y="50" width="155" height="40" rx="4" fill="#dcfce7"/>
  <text x="428" y="75" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#15803d" text-anchor="middle">Year 2</text>
  <rect x="510" y="50" width="155" height="40" rx="4" fill="#fef9c3"/>
  <text x="588" y="75" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#a16207" text-anchor="middle">Year 3</text>
  <rect x="30" y="100" width="155" height="45" rx="4" fill="#f1f5f9"/>
  <text x="108" y="128" font-family="system-ui, sans-serif" font-size="12" fill="#334155" text-anchor="middle">Thanksgiving</text>
  <rect x="190" y="100" width="155" height="45" rx="4" fill="#eff6ff"/>
  <text x="268" y="128" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#1d4ed8" text-anchor="middle">Group A</text>
  <rect x="350" y="100" width="155" height="45" rx="4" fill="#f0fdf4"/>
  <text x="428" y="128" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#15803d" text-anchor="middle">Group B</text>
  <rect x="510" y="100" width="155" height="45" rx="4" fill="#fefce8"/>
  <text x="588" y="128" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#a16207" text-anchor="middle">Group C</text>
  <rect x="30" y="155" width="155" height="45" rx="4" fill="#f1f5f9"/>
  <text x="108" y="183" font-family="system-ui, sans-serif" font-size="12" fill="#334155" text-anchor="middle">Christmas</text>
  <rect x="190" y="155" width="155" height="45" rx="4" fill="#eff6ff"/>
  <text x="268" y="183" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#1d4ed8" text-anchor="middle">Group B</text>
  <rect x="350" y="155" width="155" height="45" rx="4" fill="#f0fdf4"/>
  <text x="428" y="183" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#15803d" text-anchor="middle">Group C</text>
  <rect x="510" y="155" width="155" height="45" rx="4" fill="#fefce8"/>
  <text x="588" y="183" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#a16207" text-anchor="middle">Group A</text>
  <rect x="30" y="210" width="155" height="45" rx="4" fill="#f1f5f9"/>
  <text x="108" y="238" font-family="system-ui, sans-serif" font-size="12" fill="#334155" text-anchor="middle">New Year's</text>
  <rect x="190" y="210" width="155" height="45" rx="4" fill="#eff6ff"/>
  <text x="268" y="238" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#1d4ed8" text-anchor="middle">Group C</text>
  <rect x="350" y="210" width="155" height="45" rx="4" fill="#f0fdf4"/>
  <text x="428" y="238" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#15803d" text-anchor="middle">Group A</text>
  <rect x="510" y="210" width="155" height="45" rx="4" fill="#fefce8"/>
  <text x="588" y="238" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#a16207" text-anchor="middle">Group B</text>
  <text x="360" y="285" font-family="system-ui, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">After Year 3, the cycle resets. No group works the same holiday two consecutive years.</text>
</svg>

The method works with any mix of full-time, part-time, and per-diem nurses, but the initial group assignment must be randomized or agreed upon to prevent the starting point from becoming a new source of grievance.

## How Do You Set Up the Rotation at a 25-Bed CAH?

Setup requires four decisions before you launch the rotation. Make these decisions with your charge nurses present, document the outcome, and distribute it to all nursing staff before the rotation begins.

**Decision 1: Which holidays are in rotation.** Most CAHs include Thanksgiving, Christmas Eve, Christmas Day, New Year's Eve, and New Year's Day as mandatory rotation holidays. Some also include the Fourth of July, Memorial Day, and Labor Day as secondary rotation holidays. Secondary holidays can use the same A/B/C cycle offset by one position (Group B in Year 1 covers secondary holidays while Group A covers primary) or can be handled through a voluntary preference list with manager override.

**Decision 2: Minimum staffing for a holiday skeleton crew.** Determine the minimum number of RNs and CNAs required for each shift on a holiday. A typical 25-bed CAH runs 2 RNs and 2 CNAs per shift on major holidays. This is your floor; the rotation assigns people above that floor, not below it.

**Decision 3: Initial group assignment.** Divide your nursing staff into three equal groups. The fairest method is to assign nurses alphabetically by last name and divide into thirds, then conduct a one-time draw to determine which alphabetical third becomes Group A, B, or C. Nurses hired within the same quarter can be assigned together.

**Decision 4: How the rotation handles partial-year availability.** Full-time nurses participate in all holidays in their group's rotation year. Part-time nurses (0.6 FTE or above) participate in a proportional subset, typically two of the three major holidays. Per-diem nurses do not participate in the mandatory rotation but are first on the callout list for holiday coverage bonuses.

## How Do You Handle New Hires, Per-Diem Staff, and Callouts?

New hires are assigned to the group with the smallest current headcount at the time of hire. If all three groups are equal in size, the new hire is assigned to the group that has not had the most recent addition. The new hire participates in the full rotation for whatever year they join, even if they are hired mid-cycle. This means a nurse hired in October may work a major holiday within two months; communicate this during hiring to prevent surprises.

Per-diem nurses do not occupy a group slot in the mandatory rotation. They are listed on a separate holiday coverage roster, sorted by seniority. When the holiday skeleton crew needs additional staff above the mandatory minimum, the per-diem roster is worked from the top down. Per-diem nurses who decline a holiday call are moved to the bottom of the roster. This is not a penalty; it is a queue that resets annually.

Holiday callouts require a defined response protocol, not improvisation. When a nurse in the mandatory rotation calls out of a holiday shift, the replacement sequence is: (1) per-diem nurses on the holiday coverage roster, (2) nurses from the off-holiday group who have volunteered for holiday overtime, (3) nurses from the other off-holiday group. The on-call nurse manager does not personally contact nurses in random order; they work the list.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 260" role="img" aria-label="Holiday callout replacement sequence showing per-diem roster first, then voluntary overtime group, then second off-group">
  <rect width="720" height="260" fill="#f8fafc" rx="8"/>
  <text x="360" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">Holiday Callout Replacement Sequence</text>
  <rect x="30" y="50" width="140" height="80" rx="8" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="100" y="80" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8" text-anchor="middle">Step 1</text>
  <text x="100" y="96" font-family="system-ui, sans-serif" font-size="10" fill="#1e40af" text-anchor="middle">Per-diem nurses</text>
  <text x="100" y="110" font-family="system-ui, sans-serif" font-size="10" fill="#1e40af" text-anchor="middle">on holiday roster</text>
  <text x="100" y="124" font-family="system-ui, sans-serif" font-size="10" fill="#1e40af" text-anchor="middle">(seniority order)</text>
  <text x="175" y="95" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">&#8594;</text>
  <rect x="190" y="50" width="140" height="80" rx="8" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
  <text x="260" y="80" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#15803d" text-anchor="middle">Step 2</text>
  <text x="260" y="96" font-family="system-ui, sans-serif" font-size="10" fill="#166534" text-anchor="middle">Nurses from</text>
  <text x="260" y="110" font-family="system-ui, sans-serif" font-size="10" fill="#166534" text-anchor="middle">off-group who</text>
  <text x="260" y="124" font-family="system-ui, sans-serif" font-size="10" fill="#166534" text-anchor="middle">volunteered OT</text>
  <text x="335" y="95" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">&#8594;</text>
  <rect x="350" y="50" width="140" height="80" rx="8" fill="#fef9c3" stroke="#fde68a" stroke-width="1.5"/>
  <text x="420" y="80" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#a16207" text-anchor="middle">Step 3</text>
  <text x="420" y="96" font-family="system-ui, sans-serif" font-size="10" fill="#854d0e" text-anchor="middle">Second off-group</text>
  <text x="420" y="110" font-family="system-ui, sans-serif" font-size="10" fill="#854d0e" text-anchor="middle">nurses (rotation</text>
  <text x="420" y="124" font-family="system-ui, sans-serif" font-size="10" fill="#854d0e" text-anchor="middle">seniority order)</text>
  <text x="495" y="95" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">&#8594;</text>
  <rect x="510" y="50" width="175" height="80" rx="8" fill="#fee2e2" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="597" y="80" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626" text-anchor="middle">Escalation</text>
  <text x="597" y="96" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">Mandatory OT per</text>
  <text x="597" y="110" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">CMS §485.635(c)</text>
  <text x="597" y="124" font-family="system-ui, sans-serif" font-size="10" fill="#991b1b" text-anchor="middle">safe staffing rules</text>
  <text x="360" y="180" font-family="system-ui, sans-serif" font-size="11" fill="#334155" font-weight="600" text-anchor="middle">Key rule: work the list in order. Do not contact nurses at random.</text>
  <text x="360" y="198" font-family="system-ui, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Document every contact attempt and outcome in the schedule audit trail.</text>
  <text x="360" y="220" font-family="system-ui, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Per-diem nurses who decline are moved to the bottom of the holiday roster for that cycle year.</text>
</svg>

Document every contact attempt and outcome. If you ever face a CMS survey or a nurse grievance, the record of who was contacted in what order is your evidence that the process was followed correctly.

## How SimpleScheduleAI Enforces the Rotation?

[SimpleScheduleAI's nurse scheduling system](/nurse-scheduling-software) stores the A/B/C group assignments for each nurse and automatically applies rotation rules when generating holiday schedules. The system surfaces which group covers which holiday for the upcoming cycle, flags if a nurse in the off-group is being scheduled on a holiday they are not supposed to cover, and generates the per-diem coverage shortlist in seniority order when a callout occurs.

The audit trail logs every schedule change, including the reason code when a nurse from the wrong group is manually added to a holiday shift (typically because a nurse in the correct group has a documented medical leave). This record is what protects the manager when a nurse later disputes whether the rotation was followed.

SimpleScheduleAI is not the right tool if your hospital needs to integrate holiday rotation tracking with a payroll system or an EHR. It is built for [Critical Access Hospital scheduling](/critical-access-hospital-scheduling) specifically: 25 beds or fewer, no IT department, and a nurse manager who needs to go from current Excel roster to a working rotation system in under a week.

<div class="not-prose my-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
    Running a Critical Access Hospital in Texas?
  </p>
  <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
    Free 60-day pilot. No IT setup. No commitment. We build the schedule, you approve it.
  </p>
  <a
    href="/pilot"
    class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
  >
    Apply for a Pilot Spot →
  </a>
  <p class="mt-4 mb-0 text-sm"><a href="https://cal.com/gautham-8bdvdx/30min" class="text-blue-600 dark:text-blue-400 underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: What is a fair holiday rotation system for nurses?**

A fair holiday rotation assigns nurses to holiday shifts on a predetermined, documented cycle so no nurse works the same high-demand holiday two years in a row. It must be written, distributed to all staff, and applied consistently. The A/B/C block method is one of the most common approaches for hospitals with 15-40 nursing staff, because it requires no software and can be verified by any nurse who reads the rotation chart.

**Q: How do you divide nurses into groups for a holiday rotation?**

Divide nursing staff into three equal groups by an objective method, typically alphabetically by last name, then conduct a randomized draw to assign the alphabetical thirds to Group A, B, or C. Equal group size ensures equal holiday burden distribution. If group sizes are uneven because staff count is not divisible by three, assign the extra nurse to the group with the fewest members.

**Q: What happens when a nurse calls out of a mandatory holiday shift?**

Work a defined replacement sequence: first contact per-diem nurses on the holiday coverage roster (by seniority), then contact nurses from an off-group who have pre-volunteered for holiday overtime, then contact nurses from the second off-group. Document every contact attempt. Mandatory overtime under CMS §485.635(c) safe staffing rules is the last resort, not the first call.

**Q: How do you handle new hires in an existing holiday rotation?**

Assign new hires to the group with the smallest headcount at the time of hire. The new hire participates in that group's rotation for the current cycle year, even if they are hired mid-cycle. Communicate this expectation during the hiring process. New hires who are hired within 60 days of a major holiday they are assigned to cover can request a one-time swap with another new hire in a different group, subject to manager approval.

**Q: Is a written holiday rotation policy legally required for Texas CAHs?**

No specific state law requires a written holiday rotation policy. However, [Texas DSHS nurse staffing rules](https://www.dshs.texas.gov/acute-settlement-agreement) require CAHs to maintain staffing documentation sufficient to demonstrate CMS §485.635(c) compliance at all times, including holidays. A documented rotation policy supports that compliance record and also reduces nurse grievances that could escalate to the Texas Board of Nursing.

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, a managed nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
