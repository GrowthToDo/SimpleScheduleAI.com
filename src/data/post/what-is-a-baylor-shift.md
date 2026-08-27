---
draft: false
publishDate: 2026-08-27T00:00:00Z
author: 'Pradeep Pandey'
title: "What Is a Baylor Shift? A Manager's Guide to Weekend Programs"
excerpt: >
  Two 12-hour weekend shifts, paid as 36 hours. Nurses know the deal. Managers need the other half:
  what it costs the hospital running it, and the overtime rule that can make it far more expensive
  than the headline pay suggests.
image: ~/assets/images/pool/payroll-desk-02.webp
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - healthcare-operations
  - nurse-staffing
metadata:
  canonical: 'https://simplescheduleai.com/blog/what-is-a-baylor-shift'
  description: 'What a Baylor shift is, where the 1981 Baylor plan came from, how weekend programs work today, and the overtime rule that changes what one costs a hospital.'
---

## Key Takeaways

- A Baylor shift is two 12-hour weekend shifts: 24 hours worked, paid as if the nurse had worked considerably more. The original 1981 plan at Baylor University Medical Center paid 36 hours for day shift and 40 for nights, [per the hospital's own published history](https://pmc.ncbi.nlm.nih.gov/articles/PMC1305904/), a distinction almost every article drops.
- Most hospital weekend programs we could find published no longer pay for more hours than the nurse works. [Duke](https://hr.duke.edu/policies/health-system-pay/), [UVA](https://careers.uvahealth.org/us/en/weekend-program) and others pay full hours with a premium on top instead.
- If your hospital uses the [8-and-80 overtime method](https://www.law.cornell.edu/uscode/text/29/207), which counts overtime over a 14-day period instead of a 7-day week, a Baylor shift generates overtime on every weekend shift, because each 12-hour shift is four hours past the eight-hour daily trigger. Under a standard 40-hour week it generates none.
- Pay the weekend premium below one and a half times the weekday rate and federal rules turn it against you: your overtime bill goes up instead of down. In the worked example below, a hospital paying 32 hours for 24 worked spends $1,493 on a weekend. One paying 36 hours spends $1,440.
- Searching in August 2026, we found no published guidance on the minimum roster size a weekend program needs, and no weekend program documented at any critical access hospital.

## Table of Contents

- [What Is a Baylor Shift?](#what-is-a-baylor-shift)
- [Do Hospitals Still Run Baylor Shifts?](#do-hospitals-still-run-baylor-shifts)
- [Does a Baylor Shift Create Overtime?](#does-a-baylor-shift-create-overtime)
- [What Does a Weekend Program Do to Everyone Else's Schedule?](#what-does-a-weekend-program-do-to-everyone-elses-schedule)
- [Can a Small Hospital Run a Baylor Shift?](#can-a-small-hospital-run-a-baylor-shift)
- [How Does SimpleScheduleAI Handle Weekend Fairness?](#how-does-simplescheduleai-handle-weekend-fairness)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

A Baylor shift is a weekend-only nursing schedule: two 12-hour shifts across Saturday and Sunday, 24 hours worked, paid as though it were considerably more. Nurses search for it because the deal is attractive. Managers are pricing something different. The number on the recruitment flyer is what the nurse takes home. The number that matters to the hospital is the total cost of covering that weekend, and an overtime rule most articles never mention sits between the two. The worked example below shows the two moving in opposite directions, with the more generous program coming out cheaper.

## What Is a Baylor Shift?

The Baylor plan has a date and a paper trail. Baylor University Medical Center in Dallas started it in 1981, and [the hospital's own peer-reviewed journal](https://pmc.ncbi.nlm.nih.gov/articles/PMC1305904/) records terms more specific than the versions circulating now:

> "A two-days alternative plan was implemented, which gave nurses the choice of working two 12-hour shifts on weekends (and receiving pay for 36 hours of work or 40 hours for the night shift) or working five 8-hour days Monday through Friday."

Two of those terms carry consequences for a manager. The plan was a **choice against** a weekday schedule, so it moved nurses off weekday lines instead of adding a weekend line on top of the roster the hospital already had. Night shift was paid 40 hours rather than 36, so nights cost more for every hour they covered. Nurses on the plan also received full-time benefits.

The idea did not start in healthcare. The same journal records that a Baylor director brought back an article about an Akron rubber plant. The plant had "created a weekend alternative under which an employee was given 32 hours' pay for 24 hours' work." Baylor took that arrangement and raised it, from a third more than straight time to half again more.

The plan worked as recruitment, and the same source gives the numbers. Baylor was losing 32 percent of its nurses a year and carrying more than 120 vacant positions. Within a week of the announcement, over 600 nurses inquired. "Over 200 were hired, and all weekend positions were filled."

Baylor also published a caution about its own plan, which the articles repeating this story leave out. A 1984 account by a Baylor nursing administrator is quoted in that same history. It said "there has been no formal study of the Two-days Alternative plan's impact on either patient care or nurses' job satisfaction and quality of life." Administrators thought morale had improved and physicians reported better relationships with nurses. Nobody measured either one. The hiring numbers were counted; the quality claims were not.

## Do Hospitals Still Run Baylor Shifts?

Yes, but weekend programs have split into two different deals, and pricing one as though it were the other will mislead you. In the first deal, a nurse is paid for more hours than the weekend actually covers. In the second, a nurse works the full hours and receives a premium on top of them.

Searching hospital career pages in August 2026, every named weekend program we found at a large health system was the second kind. The postings that still paid for more hours than worked were mostly hospice and home health. That is what a search surfaced, not a count of the market.

<div class="not-prose overflow-x-auto my-8">
  <table class="min-w-full table-fixed break-words align-top text-sm border border-slate-200 dark:border-slate-700">
    <thead class="bg-slate-50 dark:bg-slate-800">
      <tr>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Program</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Hours worked, and hours paid</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">What the hospital pays per hour actually covered</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">The Akron plant that inspired it</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Works 24 hours, paid for 32</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">A third more than straight time, which falls below the time-and-a-half line that matters for overtime</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Original Baylor plan, 1981</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Works 24 hours, paid for 36 on days and 40 on nights</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Half again more on days, two-thirds more on nights</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Virginia Mason Hospital, current nurses' contract</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Works 24 hours, "compensated for 36 hours" on days and 40 on nights, but counted as 0.6 of a full-time equivalent post</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Half again more on days, two-thirds more on nights</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Duke weekend option</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Works "24 hours within the WEO window", paid for hours worked plus a premium, six-month minimum commitment</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Not calculable: Duke publishes no premium rate</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">UVA Health weekend program</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Commits to "48 scheduled weekends in a 12 month period" at full hours plus what UVA calls "enhanced compensation"</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Not calculable: the rate appears only on individual job postings</td>
      </tr>
    </tbody>
  </table>
</div>

The Virginia Mason row holds the detail a manager should read twice. Its [contract](https://cdn.wsna.org/assets/local-unit-assets/virginia-mason-medical-center/Virginia-Mason-CBA-2023-2026-with-TOC.pdf) still carries an appendix titled "Baylor Shift Twenty-Four Hour Weekend Schedule" with the original numbers intact. The nurse is "eligible for full-time medical and insurance benefits," so that promise holds. But the position is classified as "a 0.6 FTE," and seniority and vacation accrue on hours worked rather than hours paid. Full benefits and full-time status are two different things, and only the first is what the recruitment copy promises.

## Does a Baylor Shift Create Overtime?

That depends on which overtime method your hospital adopted, a choice usually made years ago and rarely revisited since.

Under a standard 40-hour workweek, a 24-hour weekend generates no federal overtime, because 24 hours is nowhere near the 40-hour threshold.

Hospitals have a second option. [Section 7(j) of the Fair Labor Standards Act](https://www.law.cornell.edu/uscode/text/29/207) lets a hospital use a 14-day period instead of a 7-day week. Overtime is then owed for hours "in excess of eight hours in any workday and in excess of eighty hours in such fourteen-day period." That is the arrangement called 8-and-80.

The word "and" in that sentence carries the whole cost. It means the eight-hour daily trigger and the 80-hour period trigger are two separate obligations, not a choice between them. [29 CFR 778.601(d)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-G/section-778.601) makes that explicit: overtime is owed for hours over eight in a day "whether or not more than 80 hours are worked in the period."

So under 8-and-80, a 12-hour shift produces four hours of daily overtime by itself. A two-shift Baylor weekend produces eight hours of overtime a week, while the nurse works 48 hours in the 14-day period, nowhere near 80.

**Practical consequence: 8-and-80 and 12-hour weekend shifts sit badly together.** A hospital that adopted 8-and-80 when it ran 8-hour shifts, and now adds a Baylor line, owes daily overtime on every weekend shift it staffs. Two conditions on using 8-and-80 are easy to miss: the agreement must be reached **before** the work is performed, and a hospital cannot switch between the two methods to chase whichever is cheaper that month.

The weekend premium then has two separate effects on that overtime bill, and they usually get collapsed into one.

**Effect one: does the premium make each overtime hour more expensive?** Overtime is calculated from a figure called the regular rate, which is normally all the pay divided by all the hours worked. If the weekend premium counts toward that figure, the figure goes up, and every overtime hour costs more. A hospital is allowed to leave the premium out, but only if the weekend rate is at least one and a half times the weekday rate. [29 CFR 778.203](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-D/section-778.203) is blunt about what happens below that line: the extra pay "must be included in determining the employee's regular rate of pay."

**Effect two: does the premium count against the overtime you owe?** A premium clearing that same one-and-a-half-times line does more than stay out of the calculation. Under [29 U.S.C. 207(h)(2)](https://www.law.cornell.edu/uscode/text/29/207) it "shall be creditable toward overtime compensation payable pursuant to this section." In plain terms, money you have already handed over as a weekend premium can be set against the overtime bill instead of arriving on top of it.

Both effects turn on the same threshold, which produces a result most managers do not expect. Here is the same weekend run two ways, for a nurse whose ordinary weekday rate is $40 an hour, at a hospital using 8-and-80:

<div class="not-prose overflow-x-auto my-8">
  <table class="min-w-full table-fixed break-words align-top text-sm border border-slate-200 dark:border-slate-700">
    <thead class="bg-slate-50 dark:bg-slate-800">
      <tr>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">One weekend, 24 hours worked</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Paid for 36 hours</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Paid for 32 hours</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Weekend pay before overtime</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$1,440</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$1,280</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Works out to, per hour actually worked</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$60, exactly time and a half</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$53.33, a third more than straight time</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Clears the time-and-a-half line?</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Yes</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">No</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Rate the overtime is figured from</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$40, because the premium can be left out</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$53.33, because the premium must be counted in</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Overtime hours owed (four per 12-hour shift)</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">8</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">8</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Extra overtime the hospital pays</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$160 owed, covered by the premium already paid</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">$213.33, owed on top of the $1,280</td>
      </tr>
      <tr>
        <td class="px-3 py-2 font-medium">Total cost of the weekend</td>
        <td class="px-3 py-2 font-semibold">$1,440</td>
        <td class="px-3 py-2 font-semibold">$1,493.33</td>
      </tr>
    </tbody>
  </table>
</div>

The more generous program is the cheaper one. Paying for 36 hours clears the line, so the premium stays out of the overtime rate and then pays the overtime bill. Paying for 32 hours misses the line, so the premium pushes the overtime rate up and covers none of what is owed. The hospital that tried to save $160 a weekend on the headline rate pays $53.33 more.

Two cautions on those numbers. A flat lump sum paid regardless of hours worked is not an overtime premium at all, whatever its size, so it fails both tests. And how much of the credit actually lands depends on how your premium is structured and how your pay periods fall, which is a question for your payroll team using your own rates rather than these illustrative ones.

None of this is legal advice, and we could find no Department of Labor opinion letter addressing Baylor plans specifically. Anyone telling you the treatment is settled is filling a gap that exists. Price the program with your counsel, and our guide to [Texas nursing overtime compliance](/blog/texas-nursing-overtime-compliance-cah) covers the wider picture.

## What Does a Weekend Program Do to Everyone Else's Schedule?

Two things, and the second is why weekend programs get cancelled.

**A weekend program relieves weekend rotation without abolishing it.** The promise people hear is that everyone else stops working weekends. The most careful description we found is narrower: nurse leadership author [Rose Sherman](https://emergingrnleader.com/resurrecting-the-baylor-plan/) writes that Baylor nurses "worked almost every weekend while the rest of the staff **rarely** worked weekends." Rarely, not never. Every documented program is a hybrid, with the weekend crew covering the core and regular staff still rotating through holidays and gaps.

**The weekend crew is a purchased solution, and the price is load-bearing.** In March 2025, [Mission Hospital in Asheville](https://www.bpr.org/bpr-news/2025-03-06/mission-cuts-25-from-hourly-pay-for-weekend-nurses-will-require-others-to-pick-up-shifts-to-improve-staffing) cut its weekend differential from $40 an hour to $15 and announced that other nurses would be required to pick up weekend shifts. At least five weekend nurses resigned. Asheville shows the mechanism in one move: the weekend crew exists because it is paid to, and when the premium falls, weekend rotation lands back on the regular roster within weeks.

There is a continuity cost too. A dedicated weekend crew is a second staffing pool, so the weekday team comes in on Monday to patients it has not seen since Friday.

Then there is the callout problem. Nobody has measured how hard weekend-only shifts are to backfill, so we will not pretend otherwise. What is documented is how hard hospitals work to prevent it. Duke allows eight weekend shifts off a year, no more than four unscheduled, on pain of losing the premium entirely. Virginia Mason's nurses are "required to work all weekends including holiday weekends," with time off granted only through the vacation scheduling process in the same appendix. Rules that strict tell you what happens when a two-person weekend crew loses one person on a Saturday morning.

## Can a Small Hospital Run a Baylor Shift?

Nothing in federal rules prevents it. But nobody has published evidence that it works at that size, and we are not going to invent any.

We searched for a weekend option or Baylor program documented at a small, rural or critical access hospital, on that hospital's own website, and found none. Named weekend programs cluster in large systems with the volume and HR machinery to run them. Finding none is not proof that no small hospital runs one, but it does mean no small hospital is publishing a model you could copy. We also found no published guidance on the minimum roster size a weekend program needs to be viable. If you see a threshold number quoted somewhere, it was made up.

What can be said comes from the structure itself. A program paying 36 hours for 24 worked costs about half again the straight-time rate for every hour it covers, and that cost is fixed whether the weekend is busy or quiet. At a [critical access hospital](/critical-access-hospital-scheduling) running two or three nurses per shift, a dedicated weekend line commits a meaningful share of the roster to two days of the week and returns no weekday hours. Sherman's retrospective notes why Baylor programs faded once recruiting pressure eased: "many hospitals stopped using Baylor because it is more expensive than traditional staffing."

If the problem is that weekends land unfairly on the same few people, a weekend program is one answer and rebalancing the rotation you already have is another. The second is cheaper and reversible. Our comparison of [8-hour and 12-hour shifts](/blog/8-hour-vs-12-hour-nursing-shifts) and our guide to [12-hour shift patterns and coverage](/blog/12-hour-hospital-shifts-scheduling) cover the design choices underneath both.

## How Does SimpleScheduleAI Handle Weekend Fairness?

SimpleScheduleAI is an [AI-native nurse scheduling](/ai-nurse-scheduling) service for Texas hospitals of 25 beds or fewer. The AI builds each cycle's schedule, our scheduling team checks it, and the nurse manager approves it.

Weekend distribution is one of the things the engine tracks. Weekend counts carry forward between cycles rather than resetting, so a nurse who covered more weekends last cycle is weighted toward fewer in the next, and holidays are balanced against the team average. That matters here because a weekend program is one way to fix unfair weekend distribution, and a better rotation is another.

Two things SimpleScheduleAI is not the right fit for are worth stating plainly. It does not calculate your overtime: the scheduler tracks applicable overtime thresholds but does not implement the 8-and-80 method, so a hospital on that method should treat this article as background for a conversation with counsel rather than something software settles. And it does not tell you what a weekend program should pay: [the service](/how-it-works) builds and checks schedules, it does not set pay rates. Our [nurse scheduling software](/nurse-scheduling-software) overview covers where tooling helps.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    The Baylor plan solved a 1981 recruiting emergency, and it solved it well enough that 600 nurses called in a week. What gets copied from that story is the schedule. What gets left out is that Baylor never studied whether it was good for patients or for nurses, said so at the time, and that hospitals dropped it once hiring got easier because it cost more than ordinary staffing. Before pricing a weekend program, work out what you are buying with it. If you are buying recruitment in a market where you cannot hire, that is the one thing the Baylor plan has genuinely proven it can do. If you are buying weekend fairness, rebalancing the rotation you already have costs nothing, and you can reverse it without anyone resigning.
  </p>
</div>

## What to Do This Week

1. Find out whether your hospital is on the standard 40-hour workweek or the 8-and-80 method. The answer changes what a 12-hour weekend shift costs, and many managers have never been told which one they are on.
2. If you already pay a weekend differential, check whether it is at least one and a half times the weekday rate. Above that line it can be credited against overtime you owe; below it, federal rules pull it into the overtime calculation instead.
3. Count how weekends actually fell across your roster over the last three months. If two or three names carry most of them, that is the problem a weekend program would be fixing, and our guide to [reducing nurse overtime](/blog/how-to-reduce-nurse-overtime) covers the cheaper fixes first.
4. Before pricing a weekend line, price the alternative: rebalancing the rotation you already have.
5. If you go ahead, write down what happens when a weekend nurse calls out, before you need the answer at 6 a.m. on a Saturday.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">Weekends that do not land on the same three people</p>
  <p class="text-muted text-sm mb-6">Weekend counts carry forward between cycles, holidays balance against the team average. Onboarding takes 3 to 5 business days and your first schedule lands inside two weeks.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-muted text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: How many hours is a Baylor shift?**
Twenty-four hours worked, as two 12-hour weekend shifts. The pay varies. The original 1981 plan paid 36 hours for day shift and 40 for nights. Some current programs still pay more hours than worked, and many hospitals now pay full hours plus a premium instead.

**Q: Is a Baylor shift full time?**
It depends on what the hospital means by full time. Baylor nurses usually get full-time medical benefits, but the FTE code can be lower: one live contract pays close to full time while coding the position 0.6 FTE, with seniority and vacation accruing on hours worked rather than hours paid. Ask how the FTE is coded before assuming anything downstream.

**Q: Does a Baylor shift get overtime?**
Under a standard 40-hour workweek, no, because 24 hours is well under the threshold. Under the 8-and-80 method hospitals may adopt, yes: each 12-hour shift is four hours past the eight-hour daily trigger, and that applies whether or not 80 hours are worked in the period. A weekend premium worth at least one and a half times the weekday rate can be credited toward that overtime instead of paid on top of it.

**Q: Can a critical access hospital run a Baylor shift?**
Nothing prevents it, but we found no critical access hospital documenting one and no published guidance on the minimum roster size. The structural obstacle is that a dedicated weekend line commits a fixed share of a thin roster to two days a week and returns no weekday hours.

## Sources

[1] Garner LF, Bufton KA. "History of nursing at Baylor University Medical Center." Proceedings (Baylor University Medical Center) 2001;14(4):385-405. [PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC1305904/). The 1981 date, original terms, Akron precedent and recruitment figures.

[2] Plank LH. American Journal of Nursing, 1984, on the absence of any formal study of the plan. Quoted in source [1] at reference 75; not read directly.

[3] [29 U.S.C. 207](https://www.law.cornell.edu/uscode/text/29/207): the hospital 14-day option at 7(j), the premium-pay exclusion at 7(e)(6), and the crediting of qualifying premiums toward overtime owed at 7(h)(2).

[4] [29 CFR 778.601](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-G/section-778.601) on daily overtime under 8-and-80; [29 CFR 778.203](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-D/section-778.203) on premium pay and the regular rate.

[5] [Duke Health System pay policy](https://hr.duke.edu/policies/health-system-pay/) for the WEO window, commitment and absence rules; [UVA Health weekend program](https://careers.uvahealth.org/us/en/weekend-program) for the 48-weekend commitment and the "enhanced compensation" wording. UVA publishes no premium rate on that page. Verified 2026-08-27.

[6] Virginia Mason Hospital and Washington State Nurses Association agreement 2023-2026, appendix "Baylor Shift Twenty-Four Hour Weekend Schedule," pages 64-65. [wsna.org](https://cdn.wsna.org/assets/local-unit-assets/virginia-mason-medical-center/Virginia-Mason-CBA-2023-2026-with-TOC.pdf). Those pages are scanned images with no text layer, so a text search of the PDF will not find the appendix.

[7] Sherman R. "Resurrecting the Baylor Plan." Emerging RN Leader, November 11, 2021. [emergingrnleader.com](https://emergingrnleader.com/resurrecting-the-baylor-plan/).

[8] Jones A. "Mission cuts 25% from hourly pay for weekend nurses." Asheville Watchdog via Blue Ridge Public Radio, March 6, 2025. [bpr.org](https://www.bpr.org/bpr-news/2025-03-06/mission-cuts-25-from-hourly-pay-for-weekend-nurses-will-require-others-to-pick-up-shifts-to-improve-staffing).

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
