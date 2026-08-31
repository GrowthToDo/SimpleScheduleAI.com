---
draft: false
publishDate: 2026-08-11T00:00:00Z
updateDate: 2026-08-11T00:00:00Z
author: 'Pradeep Pandey'
title: 'Self-Scheduling for Nurses vs. Cyclical Scheduling: Which Fits a Small Hospital?'
excerpt: >
  Both models promise fairness and both quietly break it the same way, through the exceptions.
  Which one fits a small hospital comes down to a question the feature comparisons skip: whether
  anyone on your unit has the bandwidth to enforce the rules every single cycle.
image: https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: comparison
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - self-scheduling
  - cyclical-scheduling
metadata:
  canonical: 'https://simplescheduleai.com/blog/cyclical-scheduling-vs-self-scheduling-small-hospital'
  description: 'Self-scheduling for nurses or a cyclical rotation: how the two models compare on predictability, fairness, flexibility and manager effort at a small hospital, and how to pick between them.'
---

Ask two nurse managers at small hospitals whether self-scheduling or a fixed rotation is the fairer way to build a schedule, and you would get opposite answers, both from experience. One will tell you self-scheduling let her staff build their lives around their shifts. The other will tell you self-scheduling handed the good weekends to whoever submits fastest, and that a fixed rotation ended the argument.

They are both right, because the model does not decide fairness. What happens to the exceptions decides it, and at a small hospital the exceptions are most of the work. This guide defines both models plainly, compares them on the dimensions that decide the fit, and is honest about the one question that usually settles it.

## Key Takeaways

- Self-scheduling for nurses is the better fit when morale and flexibility matter more than a fixed pattern; cyclical scheduling is the better fit when your priority is predictability, fairness by design, and the lowest possible manager workload.
- Self-scheduling lets nurses pick their own shifts within rules, which lifts autonomy but has to be policed for first-mover advantage, holiday and weekend stacking, and burden concentration. The failure modes and their fixes are covered in the guide to [self-scheduling problems at a critical access hospital](/blog/self-scheduling-problems-critical-access-hospital).
- Cyclical (rotational) scheduling is a fixed repeating pattern each nurse follows cycle after cycle, so fairness is baked into the pattern and the manager rebuilds almost nothing each period.
- A hybrid puts each model where it is strongest: a fixed cyclical backbone for the shifts nobody volunteers for, with self-pick for the flexible remainder.
- Either model needs explicit fairness tracking, a rotation count or a load record carried across cycles, or the same few reliable nurses quietly absorb the worst shifts until they resign.

## Table of Contents

- [What Is Self-Scheduling?](#what-is-self-scheduling)
- [What Is Cyclical Scheduling?](#what-is-cyclical-scheduling)
- [How Do Self-Scheduling and Cyclical Scheduling Compare?](#how-do-self-scheduling-and-cyclical-scheduling-compare)
- [Which Scheduling Model Fits Your Situation?](#which-scheduling-model-fits-your-situation)
- [When Does Self-Scheduling Fit a Small Hospital Best?](#when-does-self-scheduling-fit-a-small-hospital-best)
- [When Does Cyclical Scheduling Fit a Small Hospital Best?](#when-does-cyclical-scheduling-fit-a-small-hospital-best)
- [Why Does a Hybrid Model Fit a Small Hospital?](#why-does-a-hybrid-model-fit-a-small-hospital)
- [How Does SimpleScheduleAI Help?](#how-does-simplescheduleai-help)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

The fastest way to decide skips the philosophy and asks one question about your own unit: is there a person here with the time and the standing to enforce fairness rules every single cycle, including the cycle where a well-liked nurse has claimed every Saturday off this quarter? A yes makes self-scheduling worth its upkeep. A no means a cyclical backbone will treat your staff more fairly than a self-scheduling policy nobody has the hours to police. Everything below is the detail behind that question.

## What Is Self-Scheduling?

Self-scheduling lets nurses pick their own shifts within defined rules, usually inside an open window before the schedule is finalized. Instead of following a fixed pattern, each nurse claims the shifts that fit her life, and the manager assembles the results into a coverage plan. Done well, it raises autonomy, engagement, and satisfaction, which is why the model has spread across hospital nursing.

The flexibility is real, and so is the failure mode. Self-scheduling only works when coverage rules are enforced before nurses can claim shifts. Without guardrails, three patterns take over at a small hospital: first-mover advantage, where the fastest submitters take the best shifts; holiday and weekend stacking, where the same nurses work Christmas year after year because nothing carries last year's load forward; and burden concentration, where a nurse claims nothing but weekday day shifts. That last one is worth spelling out, because it is the pattern managers notice last. The nights and weekends she did not claim do not disappear; they still have to be covered, and on a small unit only a handful of nurses are qualified and available to cover them. So one nurse's clean run of weekdays arrives on a named colleague's schedule as another night, and the colleague can see exactly whose choice put it there. We work through each pattern, and the fixes, in the guide to [self-scheduling problems at a critical access hospital](/blog/self-scheduling-problems-critical-access-hospital).

At a 25-bed hospital with 15 to 20 nurses on a unit, the shift pool is too small to absorb that imbalance. When most nurses avoid nights and weekends, the gap between what gets chosen and what needs covering is structural rather than a matter of individual bad behavior. Someone, usually the manager, then patches it by calling the same reliable people who said yes last time.

## What Is Cyclical Scheduling?

Cyclical scheduling, also called rotational scheduling, is a fixed repeating pattern that each nurse follows cycle after cycle. Once the master rotation is set, the schedule regenerates itself: the same sequence of days, evenings, nights, and days off repeats on a set loop, so a nurse can look weeks ahead and know exactly when she works. Fairness is built into the pattern rather than negotiated each period.

The appeal for a small hospital is predictability and effort. A nurse manager who also carries clinical shifts does not want to rebuild the roster from scratch every two weeks. With a cyclical pattern, the base schedule is settled once. After that the manager handles the exceptions and nothing else: callouts, leave requests, and swaps. Because every nurse rotates through the same distribution of nights and weekends over the full cycle, the model is inherently equitable: no one can front-run the desirable shifts, because no one picks. A predictable rotation is also easier on the body. The [CDC NIOSH training on shift work and long work hours](https://www.cdc.gov/niosh/work-hour-training-for-nurses/) documents that predictable, well-rested rotations reduce the fatigue and error risk that irregular, last-minute scheduling introduces.

The cost is rigidity. A fixed pattern does not bend easily to individual preferences or life changes. A nurse whose childcare situation shifts, or who simply hates the rotation she landed in, has limited room to move without the manager reworking the master pattern for everyone. Cyclical scheduling optimizes for the unit's stability rather than the individual's flexibility.

## How Do Self-Scheduling and Cyclical Scheduling Compare?

Self-scheduling wins on flexibility and morale. Cyclical scheduling wins on predictability, fairness by design, and low manager effort. A hybrid sits between them: a cyclical backbone with a self-pick layer, trading a little of each model's strength for balance. The table below lays out the tradeoff on the dimensions that decide the fit for a small hospital.

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200 dark:border-slate-700">
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Dimension</th>
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Self-scheduling</th>
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Cyclical (rotational)</th>
        <th class="align-top text-left py-3 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Hybrid</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Predictability</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Low, varies each cycle</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Very high, fixed loop</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Moderate to high</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Fairness</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Must be policed</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Built into the pattern</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Backbone fair, rest tracked</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Flexibility</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">High, nurse-driven</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Low, slow to change</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Flexible on the open layer</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Manager effort</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">High, ongoing policing</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Very low once set</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Moderate</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Main risk</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Burden concentration</td>
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Rigidity drives attrition</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Complexity of two systems</td>
      </tr>
    </tbody>
  </table>
</div>

The pattern in the table is the whole decision in miniature. Self-scheduling trades stability and upkeep for autonomy. Cyclical trades flexibility for stability and near-zero upkeep. Neither eliminates the fairness problem on its own: self-scheduling reopens it every cycle unless rules carry forward, and cyclical solves it in the base pattern while leaving it open in the exceptions.

## Which Scheduling Model Fits Your Situation?

The fit depends less on which model is fairer in principle than on three things you already know about your unit: what your turnover looks like, who has the bandwidth to enforce rules, and how many of your nurses can work nights. The table below maps the common situations to the model that usually suits them.

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="border-b border-slate-200 dark:border-slate-700">
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Your situation</th>
        <th class="align-top text-left py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Likely fit</th>
        <th class="align-top text-left py-3 font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800">Why</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Turnover is your biggest problem and preferences vary widely</td>
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Self-scheduling</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Autonomy is the retention lever, and varied preferences mean claims rarely collide</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">The manager is also carrying clinical shifts</td>
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Cyclical</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Enforcement every cycle is the cost of self-scheduling, and that bandwidth rarely exists</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Only a handful of nurses are night-eligible</td>
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Cyclical, at least for nights</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">A rotation shares a burden few nurses claim voluntarily</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Several nurses want the same weekday days, and nobody volunteers for nights or weekends</td>
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Hybrid</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">Each model goes where it works: rotation for the avoided shifts, self-pick for the rest</td>
      </tr>
      <tr class="border-b border-slate-100 dark:border-slate-800">
        <td class="align-top py-3 pr-4 text-slate-700 dark:text-slate-300">Staff have asked for a schedule they can plan a year around</td>
        <td class="align-top py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Cyclical</td>
        <td class="align-top py-3 text-slate-700 dark:text-slate-300">A fixed loop is visible months out; a self-pick cycle is not</td>
      </tr>
    </tbody>
  </table>
</div>

## When Does Self-Scheduling Fit a Small Hospital Best?

Self-scheduling fits best when nurse retention hinges on autonomy, preferences differ a lot across the staff, and the manager has the bandwidth or the tooling to enforce fairness rules every cycle. It works cleanly for weekday day shifts, where nurses want different things and a claim by one does not automatically hurt another.

The retention argument for self-scheduling is autonomy over hours: a nurse who can build her schedule around her life has one fewer reason to leave, and retention is the single most expensive problem a small roster faces. Separately, the [AHRQ primer on nursing and patient safety](https://psnet.ahrq.gov/primer/nursing-and-patient-safety) ties working conditions and nurse well-being to care quality and safety outcomes.

The catch is enforcement, and this is what usually settles the model choice. Self-scheduling holds only when the fairness rules are applied before preferences are honored, every cycle, without exception. Enforcement takes no software, just someone with the time and the standing to say no to a nurse who claimed a fifth good weekend in a row. A manager who is also covering clinical shifts rarely has both, which is why self-scheduling that looks fair on paper drifts into concentration in practice. If your honest answer is that nobody on the unit has that bandwidth, treat it as an argument for a cyclical backbone instead of an argument to try harder. If unplanned gaps are your recurring pain, the same discipline shows up in [after-hours callout coverage at small hospitals](/blog/after-hours-callout-coverage-small-hospitals).

## When Does Cyclical Scheduling Fit a Small Hospital Best?

Cyclical scheduling fits best when coverage needs are stable, the nurse manager has little time to rebuild schedules, and the staff values a predictable rhythm they can plan their lives around. It shines on the hardest-to-fill shifts, nights and weekends, where a fixed rotation guarantees everyone shares the load and no one has to be talked into covering.

For a 25-bed hospital running 24/7 nursing, a cyclical backbone removes the recurring negotiation that eats a manager's week. The rotation is designed once to satisfy coverage and equity, then it repeats. Nurses know their nights and weekends months out, which supports the pre-sleep and family planning that reduce fatigue on long shifts, the same reason [12-hour hospital shifts](/blog/12-hour-hospital-shifts-scheduling) need rest-gap rules designed into the pattern instead of bolted on after a callout. Cyclical also pairs well with a small night-eligible pool, because it distributes the night burden by design instead of leaving it to whoever answers the phone, a recurring failure in [night shift nurse schedule coverage](/blog/night-shift-nurse-schedule-coverage).

The limit is life change. A fixed rotation asks nurses to fit their lives to the pattern. When enough of them cannot, rigidity itself becomes an attrition driver, and the manager either grants one-off exceptions that erode the pattern's fairness, or reworks the master rotation for everyone. That is the tradeoff to weigh honestly before committing.

## Why Does a Hybrid Model Fit a Small Hospital?

A hybrid captures the strongest part of each model: a fixed cyclical backbone for the shifts nobody volunteers for, plus a self-pick layer for the flexible remainder. Nights, weekends, and holidays go on a tracked rotation so the burden is shared by design. Weekday day shifts open for self-selection so nurses keep real autonomy over the part of the schedule where preferences actually differ.

Cyclical handles the shifts where self-scheduling breaks, the ones everyone avoids, and self-scheduling handles the shifts where a fixed rotation is needlessly rigid. What the hybrid does not do is remove the need for fairness tracking. The rotation still needs a visible count so exceptions do not quietly reconcentrate nights on the willing few, and the self-pick layer still needs a cross-cycle record so the same nurses do not stack the good weekends. Whether a nurse asked for a shift or was assigned it, the honest question is the same: is the load shared, and can you prove it? The real work is tracking rotation and fairness under whichever mix you run. For the wider picture of what unmanaged scheduling costs a small hospital, see [the scheduling crisis at critical access hospitals](/blog/healthcare-scheduling-crisis).

## How Does SimpleScheduleAI Help?

SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve. The tracking is the part we own, whichever way the shifts get decided, because that is what determines whether a model holds past a few cycles.

Every draft distributes weekends and holidays against a running per-nurse count, and weekend history carries across scheduling periods, so the nurses who covered last period's weekends are not first in line again this period. Holiday load is scored against the team average. A per-unit weekend quota and a consecutive-weekend cap set the boundaries, and every draft, swap, and callout replacement is logged with a timestamp, so when a nurse asks why she has three of the last six weekends the answer is in the record we keep instead of in anyone's recollection. For Texas Critical Access Hospitals, every draft also tracks each nurse's running hours against the applicable FLSA overtime thresholds, so a swap or a callout does not quietly push someone into unplanned overtime.

One honest limitation, and it matters most on this topic: we do not run a nurse-facing self-scheduling portal. Nurses do not log in, bid on open shifts, or claim them. The nurse manager collects preferences and gives them to us, and the fairness distribution is applied before those preferences are honored. That gives you the fairness outcome self-scheduling is supposed to produce without a bidding window to police, and it does mean that if nurse self-service access is a hard requirement for your unit, we are not the right fit on that axis. A second limitation worth stating: the fairness logic can only distribute the availability that exists. If a rotation is impossible because too few nurses can work nights, the system flags the coverage risk accurately, and it cannot manufacture night-eligible staff.

You can watch the AI build a schedule and rank callout replacements in the [interactive simulator](/simulator), or read the full process on our [nurse scheduling software](/nurse-scheduling-software) page, our [critical access hospital scheduling](/critical-access-hospital-scheduling) hub, or [how the scheduling process works](/how-it-works) step by step. For how AI-built schedules earn a manager's trust, see [can nurses trust an AI-generated schedule](/blog/can-nurses-trust-ai-generated-schedule) and the [AI nurse scheduling](/ai-nurse-scheduling) overview.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">The self-scheduling versus cyclical debate is usually framed as fairness against flexibility, and that framing is a trap. Cyclical is fair only in the base pattern, and self-scheduling is flexible only until the good shifts run out. Both quietly reconcentrate burden the moment the exceptions start, a swap here, a favor there, and nobody planned for either. The model you pick matters less than whether you can see the rotation count and the accumulated load at a glance. Pick the mix your staff will accept, then track it relentlessly. The tracking is the job.</p>
</div>

## What to Do This Week

1. Name the person who will enforce fairness rules every cycle, or accept that the answer is no. Then name what you are optimizing for: predictability and low effort point to cyclical, morale and flexibility point to self-scheduling.
2. Pull your last eight weeks of schedules and count nights, weekends, and holidays per nurse. If two or three names carry most of them, your current model, whatever you call it, is already concentrating burden.
3. Separate your shifts into two buckets: the ones nobody volunteers for and the ones where preferences genuinely differ. That split is the blueprint for a hybrid, cyclical for the first bucket, self-pick for the second.
4. Decide how you will carry fairness across cycles, a rotation count or a cross-cycle load record, and pick that mechanism before you pick the model, because the model fails without it.
5. Book a call with our team to see how a draft would distribute weekends and holidays across your specific roster, with the running count and the audit trail included.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">
    Running a Critical Access Hospital in Texas?
  </p>
  <p class="text-muted text-sm mb-6">
    See how SimpleScheduleAI distributes weekends and holidays against a running per-nurse count, and fills nights first because they are hardest to cover, whichever scheduling model you run. We build the schedule, you approve it.
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

**Q: What is the difference between self-scheduling and cyclical scheduling?**

Self-scheduling lets nurses pick their own shifts within rules, which adds flexibility and morale but has to be policed for first-mover advantage and burden concentration. Cyclical scheduling is a fixed repeating pattern each nurse follows cycle after cycle, so fairness is built into the pattern and the manager rebuilds almost nothing.

**Q: How do you decide between self-scheduling and a cyclical rotation?**

Start with the bandwidth question rather than the philosophy. Self-scheduling holds only if someone enforces the fairness rules before preferences are honored, every cycle. If your unit has that person, self-scheduling buys you real retention value. If the nurse manager is also covering clinical shifts, a cyclical backbone delivers fairness without depending on enforcement that will not happen.

**Q: Is cyclical scheduling better than self-scheduling for a small hospital?**

Neither is universally better. Cyclical wins when you need predictability, fairness by design, and low manager effort. Self-scheduling wins when morale and flexibility matter more. A hybrid, with a cyclical backbone for nights and weekends and self-pick for the flexible remainder, is a common landing point because each model is strongest where the other fails.

**Q: What are the disadvantages of cyclical scheduling?**

The main disadvantage is rigidity. A fixed rotation does not bend easily to preferences or life changes, so a nurse whose circumstances shift has little room to move without the manager reworking the pattern for everyone. If enough nurses cannot fit their lives to the rotation, the rigidity itself becomes a retention risk.

**Q: Can you combine self-scheduling and cyclical scheduling?**

Yes, and it is a common arrangement. A hybrid puts a fixed cyclical rotation on the shifts nobody volunteers for, nights, weekends, and holidays, and opens weekday day shifts for self-selection. The tradeoff is running two systems at once, so the rotation still needs a count and the self-pick layer still needs a cross-cycle record to keep both fair.

## Sources

1. CDC NIOSH, [Training for Nurses on Shift Work and Long Work Hours](https://www.cdc.gov/niosh/work-hour-training-for-nurses/)
2. AHRQ PSNet, [Nursing and Patient Safety](https://psnet.ahrq.gov/primer/nursing-and-patient-safety)

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
