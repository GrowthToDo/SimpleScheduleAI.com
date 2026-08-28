---
publishDate: 2026-08-17T00:00:00Z
author: 'Pradeep Pandey'
title: 'Acuity-Based Staffing at a Small Hospital: A Practical Guide'
excerpt: >
  Texas already requires a written staffing plan that matches skill mix to the level of patient
  care needed. The statute never says acuity. At a 25-bed hospital the hard part is not the tier
  chart, it is having the right license on the floor at 3am.
image: ~/assets/images/pool/ward-team-01.webp
category: Healthcare Operations
postType: mofu
draft: false
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - healthcare-operations
  - nurse-staffing
metadata:
  canonical: 'https://simplescheduleai.com/blog/acuity-based-staffing-small-hospital'
---

## Key Takeaways

- Acuity-based staffing sets nursing requirements from how sick the patients are, not just how many there are. A unit with 9 stable patients and a unit with 9 unstable ones need different teams.
- No federal rule sets a numeric nurse-to-patient ratio. A Critical Access Hospital's own nursing standard says only that "nursing services must meet the needs of patients."
- Texas requires every licensed hospital to adopt a written nurse staffing policy. It must ensure "an adequate number and skill mix of nurses" to meet "the level of patient care needed." No exemption exists for small or rural hospitals.
- Acuity models built for large hospitals assume you can add another registered nurse. At a Texas Critical Access Hospital, registered nurses are 61.0% of nursing staff against 80.5% at non-rural hospitals, so the binding constraint is license type, not headcount.
- A small hospital does not need a scored acuity instrument to start. Three or four census bands, each naming the required RN, LPN and aide count, is a defensible plan you can write this month.

## Table of Contents

- [What Is Acuity-Based Staffing?](#what-is-acuity-based-staffing)
- [Does Texas Require a Small Hospital to Staff by Acuity?](#does-texas-require-a-small-hospital-to-staff-by-acuity)
- [Why Do Large-Hospital Acuity Tools Fail at 25 Beds?](#why-do-large-hospital-acuity-tools-fail-at-25-beds)
- [How Do You Set Acuity Tiers Without Buying an Acuity Tool?](#how-do-you-set-acuity-tiers-without-buying-an-acuity-tool)
- [What Does It Cost You When the Acuity Call Is Wrong?](#what-does-it-cost-you-when-the-acuity-call-is-wrong)
- [How Does SimpleScheduleAI Handle Census and Acuity?](#how-does-simplescheduleai-handle-census-and-acuity)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

Most staffing grids at small hospitals run on one number: how many patients are in the building. It is easy to count and easy to defend at a budget meeting. It says nothing about whether tonight's nine patients include two fresh post-ops and a confused fall risk.

Acuity-based staffing is the attempt to fix that gap. The published guidance on it is written for hospitals with a nursing informatics team, a validated scoring instrument, and a shared governance council. A 25-bed hospital has a director of nursing who also takes clinical shifts. That distance between the guidance and the building runs through every part of [critical access hospital scheduling](/critical-access-hospital-scheduling).

## What Is Acuity-Based Staffing?

Acuity-based staffing decides how many nurses you need, and which kind, from how sick your patients are rather than from how many of them there are. A patient recovering quietly from a planned procedure and a patient in active alcohol withdrawal both count as one patient on the census board. They do not take the same amount of nursing time.

There are two ways to do it. You can buy a tool that scores every patient one by one and adds the scores up. Or you can sort the whole unit into a few levels, such as light, normal and heavy, and set different staffing for each level. Both count as acuity-based staffing. Only the first one costs money.

What the answer tells you matters more than how you worked it out. If your method gives you only a total number of people, it can still leave you short. The count can be right while the mix is wrong, because an extra aide does not cover an assessment only an RN can do. How that mix gets divided up on the shift is a separate question again, covered in our guide to [nurse staffing models](/blog/nurse-staffing-models).

## Does Texas Require a Small Hospital to Staff by Acuity?

No. Texas does not require acuity-based staffing, and no Texas law sets a nurse-to-patient ratio. What Texas does require is a written staffing plan, and that plan has to answer the same question acuity models answer. This is why the topic comes up in surveys and committee meetings. For the ratio side of it, see our guide to [nurse staffing ratios at a critical access hospital](/blog/nurse-staffing-ratios-critical-access-hospital). Accreditors ask a version of the same question too; the [Joint Commission nurse staffing standards](/blog/joint-commission-nurse-staffing-standards) that took effect in 2026 require needs-based staffing without setting a number.

Texas Health and Safety Code 257.003 puts the obligation on the governing body. It must adopt, implement and enforce a written nurse staffing policy. That policy has to "ensure that an adequate number and skill mix of nurses are available to meet the level of patient care needed."

The plan itself has three more requirements. It must set minimum staffing using "multiple nurse and patient considerations" and "nursing assessment and in accordance with evidence-based safe nursing standards." It must include a method for adjusting staffing. It must include contingency planning for when "patient care needs unexpectedly exceed direct patient care staff resources."

The statute never uses the word acuity. It describes the problem acuity models solve, then leaves the method to the hospital.

Two details matter for a small hospital. Chapter 257 covers any general or special hospital licensed under Chapter 241, with no carve-out for rural or Critical Access facilities. A 25-bed hospital in Texas owes the same written plan as a 500-bed one. And the committee that recommends the plan must be at least 60 percent registered nurses who give direct patient care.

Federal rules do not add a number either, and the wording differs by facility type. For general hospitals the rule asks for "adequate numbers" of registered nurses, licensed practical nurses and other personnel, with no ratio. Critical Access Hospitals fall under a different part. There the standard reads only that "nursing services must meet the needs of patients." A few states do set ratios in their own law, which we map in [nurse-to-patient ratios by state](/blog/nurse-to-patient-ratios-by-state). Texas is not one of them. The nursing profession has not settled the question either. The American Nurses Association supports enforceable ratios while saying "long-standing nurse staffing challenges will require multiple strategies."

## Why Do Large-Hospital Acuity Tools Fail at 25 Beds?

They fail because they answer the wrong question. A scoring tool tells you tonight's unit needs 4.7 nurses' worth of staffing instead of 3.9. At a large hospital the house supervisor pulls the difference from a float pool. At a small hospital there is no float pool, and the answer to "we need another nurse" is a phone call to someone who already worked yesterday.

The bigger mismatch is skill mix. These tools assume the next person you add is a registered nurse, and that any RN will do. Rural staffing data says otherwise. At Texas Critical Access Hospitals, registered nurses make up 61.0% of nursing staff against 80.5% at non-rural hospitals, and licensed vocational nurses make up 16.4% against 3.6%.

That mix is how rural hospitals actually staff, and it changes what a useful answer looks like. When the patients get sicker on a unit staffed mostly by LVNs, what runs out first is scope of practice. A third aide does not cover an assessment an LVN is not licensed to do.

Measurement cost is the third problem. Scoring every patient every shift takes real nursing time. Where the charge nurse also carries an assignment, a fifteen-minute scoring tool competes with patient care, and loses.

## How Do You Set Acuity Tiers Without Buying an Acuity Tool?

Use census bands with a named skill mix. Group your realistic patient loads into three or four bands, and for each band write down the exact number of registered nurses, licensed vocational nurses, aides and [charge coverage](/blog/what-is-a-charge-nurse) the unit requires. Then add one modifier for the nights when the patients are heavier than the count suggests.

Bands work as your written plan because they do what the law asks. They state minimum staffing, they take the patients into account, and they leave room for a contingency line. A director of nursing can build one in an afternoon, and a charge nurse can apply it in ten seconds at handoff.

<div class="not-prose overflow-x-auto my-8">
  <table class="min-w-full table-fixed break-words align-top text-sm border border-slate-200 dark:border-slate-700">
    <thead class="bg-slate-50 dark:bg-slate-800">
      <tr>
        <th class="px-4 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Band</th>
        <th class="px-4 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Patients</th>
        <th class="px-4 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Required licensed staff</th>
        <th class="px-4 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Charge coverage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">Low</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">1 to 6</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">1 RN, 1 LVN</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">Working charge</td>
      </tr>
      <tr>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">Standard</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">7 to 12</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">2 RN, 1 LVN</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">Working charge</td>
      </tr>
      <tr>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">High</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">13 to 18</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">3 RN, 1 LVN</td>
        <td class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">Dedicated charge</td>
      </tr>
      <tr>
        <td class="px-4 py-2">Surge</td>
        <td class="px-4 py-2">19 to 25</td>
        <td class="px-4 py-2">4 RN, 2 LVN</td>
        <td class="px-4 py-2">Dedicated charge</td>
      </tr>
    </tbody>
  </table>
</div>

Those numbers are illustrative. Your bands come from your own unit and your own committee.

The modifier is the part people skip. It is also the part that makes this acuity-based instead of just counting patients. Give the charge nurse one call at handoff: is tonight heavier than the count suggests? If yes, the band moves up a step. Write down what triggers it. Fresh post-op, active withdrawal, a one-to-one observation need and an unstable transfer waiting on a bed are the usual four.

One caution on that last trigger. A patient needing one-to-one observation does not fit a band model, because the sitter cannot count toward unit coverage. Handle sitters separately.

## What Does It Cost You When the Acuity Call Is Wrong?

It costs in two directions, and small hospitals track only one.

Understaffing is the direction everyone watches. The unit runs short, the charge nurse picks up an assignment, and charting and discharge teaching slip. The cost shows up later as people leaving, the pattern we trace in [nurse burnout and the schedule](/blog/nurse-burnout-scheduling-cah). Texas Critical Access Hospitals report a median registered nurse turnover of 18.2%, the highest of the three Texas hospital groups, ahead of rural non-CAH at 15.4% and non-rural at 17.4%.

Overstaffing is the direction that gets missed. A unit banded for 12 patients while holding 5 carries an extra licensed nurse for twelve hours. Nobody files an incident report. The money leaves the budget anyway, and 74.0% of Texas Critical Access Hospitals report no change in budgeted registered nurse FTEs, so it is not replaced.

Acuity work is about being wrong less often in both directions. Anyone promising it will eliminate the problem has not staffed a unit where the same three nurses cover every hard week.

## How Does SimpleScheduleAI Handle Census and Acuity?

SimpleScheduleAI is an AI-native nurse scheduling service for Texas Critical Access Hospitals. We build the schedule, our scheduling team checks it, and your nurse manager approves it.

On this problem, our scheduler uses the banded model described above, not per-patient scoring. Each unit gets its own census bands. A band takes a range of patient numbers and sets how many registered nurses, licensed vocational nurses, aides and charge nurses that range requires, plus a patient-to-licensed-staff ratio. Census Bands is one of the five sheets in the Excel onboarding template, so your bands go in during setup.

When a shift needs a higher tier, you tell us and our scheduling team sets it against that date. The staffing requirement for that shift updates from the tier, and the generator honours the higher number as it builds and repairs the schedule. Nobody has to remember to enforce it.

Two boundaries decide whether this fits your hospital. There is no per-patient acuity scoring. **We are not right for a hospital whose staffing plan depends on scoring each patient on a validated instrument and summing the result.** One-to-one sitters are also not handled. The field exists but no scheduling rule reads it, so sitter coverage stays a manual decision outside the tool.

One detail in that ratio is easy to miss and it changes the numbers. Registered nurses and licensed vocational nurses both count as licensed staff. Aides do not. Check that this matches your own scope-of-practice policy before your bands go in.

Watch the AI build a week against a census band in the [interactive simulator](/simulator), or see [how AI nurse scheduling works](/ai-nurse-scheduling) and our overview of [nurse scheduling software](/nurse-scheduling-software).

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    Most small hospitals do not have an acuity problem. They have a written-plan problem that shows up as one during a survey. The staffing already flexes, because the charge nurse flexes it every shift using experience nobody wrote down. Getting that judgment onto paper as three or four bands beats any scoring tool, and it survives the day that charge nurse retires.
  </p>
</div>

## What to Do This Week

1. **Pull your last 60 days of midnight census and find your real bands.** Set the band edges where your data already sits, not where a textbook puts them.
2. **Write a skill mix for each band, not a headcount.** Name the required registered nurses, licensed vocational nurses and aides separately. A band reading "3 licensed staff" can be filled by a combination that cannot legally do the work.
3. **Define the triggers that bump a shift up a band.** Ask your charge nurses what makes a night heavy and write down the four they name most. That is your acuity modifier, built by the people who apply it.
4. **Check your plan and your committee against Texas Health and Safety Code 257.** The plan needs minimum staffing levels, a way to adjust them, and a contingency plan. Most small hospitals are thin on the last one. The committee needs at least 60 percent direct-care registered nurses.
5. **See whether a banded model fits your unit.** Start at [how it works](/how-it-works).

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">Put your staffing plan into the schedule itself</p>
  <p class="text-muted text-sm mb-6">SimpleScheduleAI holds your census bands and acuity tiers as scheduling requirements, so the plan applies every cycle instead of living in a binder. Built for Texas Critical Access Hospitals.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-muted text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: What is the difference between acuity-based staffing and a nurse-to-patient ratio?**

A ratio fixes the number of patients one nurse may take, regardless of how sick those patients are. Acuity-based staffing varies the requirement with the intensity of care the current patients need. A ratio is simpler to audit. An acuity model fits the unit more closely and takes more work to run.

**Q: Does a Critical Access Hospital in Texas need a written nurse staffing plan?**

Yes. Texas Health and Safety Code Chapter 257 applies to general and special hospitals licensed under Chapter 241 and contains no exemption for rural, small or Critical Access facilities. The written policy, the staffing plan and the nurse staffing committee obligations apply at 25 beds.

**Q: Can you do acuity-based staffing without buying an acuity scoring tool?**

Yes. Census bands with a defined skill mix per band, plus a small set of written triggers that move a shift up a band, satisfy the same planning question without per-patient scoring. It costs the charge nurse seconds per shift rather than minutes.

## Sources

[1] Texas Health and Safety Code 257.003, Nurse Staffing Policy and Plan. [FindLaw](https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-003).

[2] Texas Health and Safety Code 257.001, Definitions. [FindLaw](https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-001.html).

[3] Texas Health and Safety Code 257.004, Nurse Staffing Committee. [FindLaw](https://codes.findlaw.com/tx/health-and-safety-code/health-safety-sect-257-004/).

[4] 42 CFR 482.23(b), Condition of Participation: Nursing services (general hospitals). [eCFR](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482/subpart-C/section-482.23).

[5] 42 CFR 485.635(d), Standard: Nursing services (Critical Access Hospitals). [Cornell LII](https://www.law.cornell.edu/cfr/text/42/485.635).

[6] Texas Department of State Health Services, 2024 Hospital Nurse Staffing Survey highlights (staff mix and turnover by hospital group). [DSHS](https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_Highlights_accessible.pdf).

[7] American Nurses Association, nurse staffing position. [nursingworld.org](https://www.nursingworld.org/practice-policy/nurse-staffing/).

**Methodology note:** The band table is illustrative. Set your own requirements locally with your staffing committee.

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy (Operations and Marketing). His work focuses on workforce optimization and scheduling operations for Critical Access Hospitals and other small rural facilities._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
