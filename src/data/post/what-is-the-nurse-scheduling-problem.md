---
draft: false
publishDate: 2026-08-26T00:00:00Z
author: 'Pradeep Pandey'
title: 'What Is the Nurse Scheduling Problem? The Math Behind an 18-Nurse Roster'
excerpt: >
  Operations research has studied nurse scheduling as a formal problem for decades, and proven
  realistic versions of it hard. What decides how hard yours is turns out to be something you
  control: how the rules are written.
image: ~/assets/images/pool/manual-scheduling-01.webp
imageCredit: 'AI-generated illustration'
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - healthcare-operations
  - ai-scheduling
metadata:
  canonical: 'https://simplescheduleai.com/blog/what-is-the-nurse-scheduling-problem'
  description: 'The nurse scheduling problem is a formal optimization problem in operations research. What it means, what is proven about its difficulty, and why it applies to a small hospital roster.'
---

## Key Takeaways

- The nurse scheduling problem is the formal name operations researchers give to assigning nurses to shifts under constraints. The same problem is called the nurse rostering problem, and the literature treats the two names as one problem.
- Realistic versions have been proven hard. A [2023 paper in Operations Research Letters](https://doi.org/10.1016/j.orl.2023.07.004) proved that a version with coverage requirements, day-off requests, and banned shift sequences is NP-hard even with only three shift types. NP-hard means no known method reliably finds the provably best answer as the problem grows, not that the problem is unsolvable.
- The blanket claim that all versions are hard is wrong, and researchers have said so. Some versions are solvable quickly, and a [2016 paper](https://lirias.kuleuven.be/retrieve/47b4a798-fe84-44ea-9810-d435455c0cfc) explicitly set out to refute the assumption that every version is hard.
- What decides which one you have is how your rules are written. A limit counted in days is tractable. The same limit counted in night shifts is not.
- Difficulty tracks how much of your roster each day consumes, not how many nurses you have. A small hospital using 5 of 18 nurses daily has far less freedom than a large one using 40 of 400.

## Table of Contents

- [What Is the Nurse Scheduling Problem?](#what-is-the-nurse-scheduling-problem)
- [How Many Schedules Are Possible at an 18-Nurse Hospital?](#how-many-schedules-are-possible-at-an-18-nurse-hospital)
- [Is the Nurse Scheduling Problem Really NP-Hard?](#is-the-nurse-scheduling-problem-really-np-hard)
- [Why Does a Small Roster Not Make It Easy?](#why-does-a-small-roster-not-make-it-easy)
- [What Do Real Scheduling Systems Do About It?](#what-do-real-scheduling-systems-do-about-it)
- [How Does SimpleScheduleAI Approach It?](#how-does-simplescheduleai-approach-it)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

The nurse scheduling problem is the formal name operations research gives to the job a nurse manager does every cycle: assign nurses to shifts so every shift is covered, every rule is respected, and the result is as fair as it can be. It has its own research literature going back decades, and realistic versions of it have been proven mathematically hard. This guide covers what is actually established, what is commonly claimed and wrong, and why a small hospital roster sits inside that research rather than beneath it.

## What Is the Nurse Scheduling Problem?

It is a constrained assignment problem: a set of nurses, a set of shifts across a planning period, and a set of rules the assignment has to satisfy. In the literature those rules split into two kinds, defined in [the field's standard survey](https://lirias.kuleuven.be/retrieve/df8f1e47-2dd9-4f30-844d-3ea6dd15a96d) by Burke and colleagues: hard constraints, which "must be satisfied at all costs," and soft constraints, which "are desirable but which may need to be violated in order to generate a workable solution."

That distinction is the whole shape of the problem. Coverage is hard: the shift needs a nurse. A request for a Friday off is usually soft: you honor it if you can. Every scheduling tool you have used, including a spreadsheet, is an attempt to satisfy the hard ones and do well on the soft ones.

| Rule type       | Burke's definition                                                                     | On an 18-nurse roster                                                                    | What it does to the schedule                                                  |
| --------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Hard constraint | "must be satisfied at all costs"                                                       | A licensed nurse on duty whenever there is an inpatient; nobody works two shifts at once | A schedule that breaks one is not a schedule, however good it looks otherwise |
| Soft constraint | "desirable but which may need to be violated in order to generate a workable solution" | A request for Friday off; weekends spread evenly across the year                         | Honored where possible, and traded against each other when they collide       |

Which of your own rules sit in which row is a decision you make, not a fact about nursing, and it is the decision that sets how hard your schedule is to build.

One naming point, because it causes confusion when you go looking for the research. The same problem appears as the **nurse rostering problem**, and Burke's survey notes that other authors "deliberately do not distinguish between rostering and scheduling." Our glossary draws a working distinction between [nurse rostering](/blog/what-is-nurse-rostering) as maintaining the staff record and scheduling as building the timetable. That split is operationally useful, but the academic literature does not observe it.

## How Many Schedules Are Possible at an 18-Nurse Hospital?

More than you can search by hand, and the math is worth doing because most published claims about it are not sourced.

Take a realistic small hospital unit: 18 nurses, a 4-week cycle, and a daily requirement of 3 nurses on days and 2 on nights. Nobody works twice in one day. Count the ways to staff a single day:

- Choose 3 of 18 nurses for days: 816 ways.
- Choose 2 of the remaining 15 for nights: 105 ways.
- One day: 816 x 105 = **85,680** possible staffings.

Now do that for 28 days. If the days were independent, the count is 85,680 to the power of 28, which is about **1.3 x 10^138**. Written out, that is roughly a 1 followed by 138 zeros.

That is an exact count of the rosters satisfying coverage and one-shift-per-day, so it is an upper bound on the fully legal ones. Rest rules, contracts, and skill mix only remove options. To feel the size: a computer checking a trillion schedules per second would need about **4 x 10^118 years** to see them all, roughly 10^108 times the age of the universe.

What matters about that number is the consequence: you cannot reach a good schedule by checking every option. Every method that works, including the one in your head, is a way of not looking at almost all of them.

Burke's survey sets up an illustrative ward of a head nurse, 15 nurses, three caretakers and two trainees. It calls that setup "rather simple" and observes "there is an extremely high number of possible solutions," leaving the math undone. The deliberately simplified example in the field's standard reference is the staffing of a small hospital.

## Is the Nurse Scheduling Problem Really NP-Hard?

Specific versions, yes, proven. All versions, no, and saying so is a mistake the research community has called out directly.

First, what the term means in plain language. A problem is NP-hard when no known method reliably finds the provably best answer as the problem grows. It does not mean unsolvable, and it does not mean a computer cannot help. It means the guarantee of optimality is what becomes unaffordable, which is why the rest of this article is about good schedules rather than perfect ones.

The strongest and most recent result is from [den Hartog, Hoogeveen and van der Zanden](https://doi.org/10.1016/j.orl.2023.07.004), published in Operations Research Letters in 2023. They proved that a version "with coverage constraints, day off requests, and forbidden sequences of shifts of length 2 is NP-hard in the strong sense, even if there are only three work shifts and a day off shift involved."

Read that list again, because it is not an abstract construction. Coverage requirements, requested days off, and a ban on particular shift pairings such as a night followed by a day, with three shift types. That is a small hospital's schedule. The hardness result lands exactly on the situation a nurse manager is in.

The caution matters just as much. In 2016 [Smet and colleagues](https://lirias.kuleuven.be/retrieve/47b4a798-fe84-44ea-9810-d435455c0cfc) published a paper in the European Journal of Operational Research to correct the record. Their abstract says the field's "general assumption is that these problems, even in their most simplified form, are NP-hard. However, such claims are rarely supported with a proof for the problem under study. The present paper refutes this assumption." They then give efficient formulations for several rostering problems. Two of the standard benchmark datasets turn out to be solvable quickly for feasibility, though finding a _good_ roster is a different question from finding a legal one.

So difficulty depends on the version, and the most practical finding in the literature is what decides it.

**How you write a rule changes whether it is hard.** Smet and colleagues found that "the granularity of a counter constraint has a significant impact on a problem's complexity. Defining a counter for days worked allows the problem to be solved as a minimum cost network flow problem, whereas restricting the number of shifts worked of each type makes the problem NP-complete." Their conclusion is blunt: "the difference between easy and hard problems corresponds to defining constraints on day-level or on shift-level."

In your language: a policy of "no more than 12 shifts a month" is computationally easy. A policy of "no more than 4 _night_ shifts a month" is the version that is provably hard. Same intent, very different difficulty. That is worth knowing before you write the next staffing policy.

## Why Does a Small Roster Not Make It Easy?

Two answers, and the first one is a genuine caution against overclaiming.

**On pure combinatorics, small often is easier.** The [standard nurse rostering benchmark set](https://www.schedulingbenchmarks.org/nrp/) runs from 8 to 150 employees, and 23 of its 24 instances have been solved to proven optimality. The one that resists is the largest. Testing those instances, [Burke and Curtois](https://www.schedulingbenchmarks.org/papers/new_approaches_to_nurse_rostering_benchmark_instances.pdf) found the exact method, branch and price, "outperforms on the smaller instances," while their heuristic did better on the large ones. Anyone telling you an 18-nurse roster is computationally worse than a 200-nurse one is selling something.

**What predicts difficulty is how much of your roster each day consumes, rather than how many nurses you have.** [Vanhoucke and Maenhout](http://wps-feb.ugent.be/Papers/wp_05_339.pdf) measured this directly, defining coverage constrainedness as "the average number of nurses required per day divided by the number of nurses." Their finding: it "has a positive correlation with problem complexity," because "if more nurses are required by the hospital, then the freedom to schedule a subset of nurses on a particular shift/day without violating case-specific constraints is dramatically reduced."

That ratio is where a [critical access hospital](/critical-access-hospital-scheduling) sits badly. A large hospital needing 40 of 400 nurses on a given day has enormous freedom. A small hospital needing 5 of 18 is using a far larger share of its roster every single day, and each rule you add cuts into a much thinner remainder. Skill mix tightens it further: [Aickelin and Li](https://arxiv.org/pdf/0803.2975) note that "higher qualified nurses can substitute less qualified nurses but not vice versa," so the substitutions available to you only run one way.

The consequence shows up as fragility rather than compute time. Burke's survey names the failure directly: the situation to avoid is one where "just one person calling in sick causes a chain reaction of disruptions throughout the hospital because that person is the only scheduled person with a particular expertise." Its remedy is to put two or more people with that expertise on the same shift. At 25 beds that is often arithmetically impossible. You cannot double-cover a skill only three people hold.

## What Do Real Scheduling Systems Do About It?

They stop chasing the best possible schedule and find a good one quickly instead. Burke's survey goes further than calling optimality impractical: for most real problems "the goal of finding the 'optimal' solution is not only completely infeasible, it is also largely meaningless. Hospital administrators want to quickly generate a high quality schedule that satisfies all hard constraints and as many of a wide range of soft constraints as possible."

[Choy and Cheong's](https://arxiv.org/abs/1205.2200) 15-nurse ICU study shows both halves of that trade. Working in spreadsheet software, they found the general-purpose solver engines "did not manage to solve the problem, even after increasing the number of iterations," and that was on a simplified version carrying only the hard constraints. Their purpose-built heuristic produced good, legal schedules "usually within minutes," and they report its failure rate plainly: "10% of the simulation runs resulted in failure or objective function value which are extremely large."

That last sentence is the most useful thing here for anyone buying software. A fast scheduler will sometimes produce a poor answer, so the response is to run it again and look at more than one result. Any vendor claiming their scheduler produces the mathematically optimal roster for a real hospital is describing something the research says is out of reach at realistic problem sizes.

## How Does SimpleScheduleAI Approach It?

SimpleScheduleAI is an [AI-native nurse scheduling](/ai-nurse-scheduling) service for Texas hospitals of 25 beds or fewer. The AI builds each cycle's schedule, our scheduling team checks it, and the nurse manager approves it.

The approach matches that trade rather than pretending to escape it. Coverage and safety rules are hard constraints a draft satisfies before anyone sees it; fairness measures like weekend and holiday distribution are optimized rather than guaranteed. Each cycle produces **three scored options** rather than one answer presented as correct, which follows directly from what Choy and Cheong describe: when a fast method can occasionally return a poor result, seeing several candidates is how you catch it.

Two boundaries. We do not claim mathematical optimality, because at this problem size the literature says nobody credibly can. And we are a scheduling service, not an operations research consultancy, so we will not model your ward or prove anything about your constraint set. For the step-by-step of a build, [how AI actually builds a nurse schedule](/blog/how-ai-builds-a-nurse-schedule) walks through it; [a full cycle](/how-it-works) and the [nurse scheduling software](/nurse-scheduling-software) overview cover the rest.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    The useful finding here is that how you word a rule changes whether the problem is tractable, which matters more than the size of the number. Most staffing policies get written for the nursing committee, without much thought for whatever has to satisfy them afterward, and a policy that caps night shifts specifically is measurably harder to schedule around than one that caps shifts generally. Both may be defensible on fairness grounds. If you are writing or revising one, it is worth knowing that the second version is cheaper to satisfy, and asking whether the first is buying you enough to be worth the difficulty.
  </p>
</div>

## What to Do This Week

1. Pull your staffing policy and mark every rule that counts a specific shift type rather than counting days. Those are the expensive ones.
2. For each of those, ask whether a day-level version would achieve the same intent. Where it would, you have a cheaper rule for free.
3. Separate your rules into ones that must always hold and ones you want honored where possible. If your current tool treats them the same, it cannot make the trade every scheduling method has to make. The same split decides whether [self-scheduling](/blog/self-scheduling-problems-critical-access-hospital) helps or quietly shifts the work.
4. If your scheduling tool gives you exactly one schedule, ask the vendor what happens when it produces a poor one, and how you would know.
5. Count how long your last schedule took to build and how many times it was rebuilt after a callout. Rebuilding is the same problem again under time pressure, and it is where [callout coverage](/blog/after-hours-callout-coverage-small-hospitals) breaks down.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">Three scored options, not one answer</p>
  <p class="text-muted text-sm mb-6">Coverage and safety rules satisfied before you see a draft, fairness measured across cycles. Onboarding takes 3 to 5 business days and your first schedule lands inside two weeks.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-muted text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: Is the nurse scheduling problem the same as the nurse rostering problem?**
Yes. The research literature uses the names interchangeably, and Burke's survey notes that other authors deliberately do not distinguish between them. Our glossary separates rostering (maintaining the staff record) from scheduling (building the timetable), which is a useful operational distinction but not one the academic literature makes. If you are comparing products rather than papers, [nurse rostering versus scheduling software](/blog/nurse-rostering-vs-scheduling-software) covers how vendors use the two words.

**Q: Is the nurse scheduling problem NP-hard?**
Specific realistic versions have been proven NP-hard, including one with coverage constraints, day-off requests, and forbidden shift sequences, using only three shift types (den Hartog and colleagues, 2023). A blanket claim that every version is hard is not supported: a 2016 paper in the European Journal of Operational Research explicitly refuted that assumption.

**Q: What makes one version harder than another?**
Largely how the rules are counted. Limiting days worked keeps the problem tractable; limiting a specific shift type makes it NP-complete. A cap on total shifts is easier to satisfy than a cap on night shifts.

**Q: Can software find the perfect schedule?**
Not at realistic hospital sizes. The standard survey calls optimality for real problems "not only completely infeasible" but "largely meaningless," on the grounds that what administrators actually want is a high quality schedule quickly. It separately notes that models simple enough to solve optimally tend to be too simple for a real hospital. Practical systems produce good schedules fast instead, which is why seeing several options matters.

**Q: Does a small hospital have an easier version of this problem?**
On raw combinatorics, often yes. What makes a small hospital hard is the ratio: needing 5 nurses daily from a roster of 18 leaves far less room than 40 from 400, and thin coverage removes the option of putting two qualified people on the same shift.

## Sources

[1] Burke, E. K., De Causmaecker, P., Vanden Berghe, G., Van Landeghem, H. "The State of the Art of Nurse Rostering." Journal of Scheduling 7(6), 2004, 441-499. [KU Leuven open access](https://lirias.kuleuven.be/retrieve/df8f1e47-2dd9-4f30-844d-3ea6dd15a96d).

[2] den Hartog, S. J. M., Hoogeveen, H., van der Zanden, T. C. "On the complexity of Nurse Rostering problems." Operations Research Letters 51(5), 2023, 483-487. [doi.org/10.1016/j.orl.2023.07.004](https://doi.org/10.1016/j.orl.2023.07.004).

[3] Smet, P., Brucker, P., De Causmaecker, P., Vanden Berghe, G. "Polynomially solvable personnel rostering problems." European Journal of Operational Research 249(1), 2016, 67-75. [KU Leuven open access](https://lirias.kuleuven.be/retrieve/47b4a798-fe84-44ea-9810-d435455c0cfc).

[4] Aickelin, U., Li, J. "An Estimation of Distribution Algorithm for Nurse Scheduling." Annals of Operations Research 155(1), 2007, 289-309. [arXiv:0803.2975](https://arxiv.org/pdf/0803.2975).

[5] Choy, M., Cheong, M. "A Greedy Double Swap Heuristic for Nurse Scheduling." [arXiv:1205.2200](https://arxiv.org/abs/1205.2200).

[6] Vanhoucke, M., Maenhout, B. "Characterisation and Generation of Nurse Scheduling Problem Instances." Ghent University working paper 05/339, 2005. [ugent.be](http://wps-feb.ugent.be/Papers/wp_05_339.pdf).

[7] Burke, E. K., Curtois, T. "New approaches to nurse rostering benchmark instances." European Journal of Operational Research 237(1), 2014, 71-81. [schedulingbenchmarks.org](https://www.schedulingbenchmarks.org/papers/new_approaches_to_nurse_rostering_benchmark_instances.pdf).

[8] Nurse rostering benchmark instances and their best known solutions. [schedulingbenchmarks.org](https://www.schedulingbenchmarks.org/nrp/). Verified 2026-08-26.

[9] Combinatorics in this article are our own calculations from the stated assumptions, shown so they can be checked.

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
