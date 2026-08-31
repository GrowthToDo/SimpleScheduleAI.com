---
draft: true
publishDate: 2026-08-31T00:00:00Z
author: 'Pradeep Pandey'
title: 'Who Changed the Schedule? Audit Trails in Nurse Scheduling'
excerpt: >
  Most guidance on staffing audit trails is written for nursing homes filing Payroll-Based Journal
  data. A critical access hospital usually files none of it, so its record keeping answers to a
  different question, asked by a surveyor standing in front of you.
image: ~/assets/images/pool/swap-calendar-01.webp
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - critical-access-hospitals
  - healthcare-operations
  - compliance
metadata:
  canonical: 'https://simplescheduleai.com/blog/nurse-schedule-audit-trail'
  description: 'What a nurse schedule audit trail is, why most published guidance is aimed at nursing homes rather than hospitals, what a critical access hospital actually has to show, and how to tell whether your current tool records changes at all.'
---

## Key Takeaways

- A schedule audit trail is a record of what the schedule said, what changed, who changed it, and when. The posted schedule alone is not one, because it only shows the final state.
- Most published guidance on staffing records is written for skilled nursing facilities filing Payroll-Based Journal data. Swing beds are exempt from PBJ, so most critical access hospitals file none of it and the guidance does not transfer.
- What a hospital actually answers to is narrower and more immediate: a surveyor comparing the staff in front of them to the schedule you handed over, and asking about the difference.
- Whether your current tool keeps this record is worth checking rather than assuming. One hospital IT admin reviewing a general-purpose scheduling app wrote that it has "No Auditing capability to see if unauthorized changes were made, and does not work for complex workflows."
- The gap that matters sits between publishing the schedule and working it: two or three weeks of edits, swaps and callout replacements that the posted version never shows. You can close it by hand, in a spreadsheet tab or a notebook, for nothing.

## Table of Contents

- [What Is a Nurse Schedule Audit Trail?](#what-is-a-nurse-schedule-audit-trail)
- [Why Does Most Audit-Trail Guidance Not Apply to a Hospital?](#why-does-most-audit-trail-guidance-not-apply-to-a-hospital)
- [What Does a Surveyor Actually Ask For?](#what-does-a-surveyor-actually-ask-for)
- [Does Your Current Tool Record Changes at All?](#does-your-current-tool-record-changes-at-all)
- [How Does SimpleScheduleAI Record Schedule Changes?](#how-does-simplescheduleai-record-schedule-changes)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

The schedule you posted three weeks ago is not the schedule that got worked. Somebody swapped a Tuesday, somebody called out on the Saturday and was replaced at 6 a.m., and a shift got extended when the census climbed. If the only record you keep is the current state of the grid, all of that is gone.

An audit trail exists to capture exactly that difference. This guide covers what one is and why most published advice about them is aimed at a kind of facility you probably are not. It also gives you a way to find out, in about ten minutes, whether the tool you use today records anything at all.

## What Is a Nurse Schedule Audit Trail?

A schedule audit trail is a separate record of **what changed on the schedule, who changed it, and when**. It sits next to the schedule as its own list, rather than being something you can read off the schedule itself.

The difference is between a snapshot and a story. Your posted schedule is a snapshot: it tells you who is working the 15th. An audit trail is the story of how it got that way. It tells you the 15th was assigned to one nurse when the cycle was published, then reassigned eleven days later, and that a named person made that change at a recorded time.

A useful entry answers four questions:

- **What** was the shift, and what did it change from and to.
- **Who** made the change, as a named person rather than a shared login.
- **When** it happened, as a timestamp rather than a date.
- **Why**, where a reason exists: a callout, a leave approval, a census change.

Spreadsheets are where this usually breaks down. A spreadsheet holds the current state well and keeps no history unless somebody deliberately saves a separate copy. The file that survives is normally the one overwritten last, and it is called something like Schedule_FINAL.

**You can fix this by hand, and if you are running the schedule in Excel today you should start there rather than waiting for a budget.** A change log is not a piece of software. It is a list. Two habits produce one:

1. **The morning you post the schedule, save a dated copy and do not touch it again.** `Schedule_2026-09_POSTED.xlsx`. That single file is what "as published" means, and it costs you ten seconds.
2. **Keep a running list of changes, one line each, in a tab of the same workbook or a notebook by the phone.** A line only needs five things:

> `2026-09-12 | Night, 7p-7a, Med-Surg | Dana out sick, Maria covered | approved by me | 05:50`

That is a real audit trail. It is not worse than a software one because it is handwritten; it is worse only if it is incomplete or you cannot find it. A paper schedule on the wall with changes written on it in pen counts too, as long as somebody dates the changes and the sheet gets filed at the end of the cycle rather than binned.

**How long to keep it.** No Condition of Participation names a retention period for schedules specifically, so there is no clean number we can give you. The practical floor is your survey cycle, which means keeping at least the period a surveyor could ask about. Your administrator or medical records lead will know what your hospital's retention policy already says, and the schedule should follow it rather than have its own rule.

Our comparison of [nurse scheduling software and Excel](/blog/nurse-scheduling-software-vs-excel) covers the wider trade-off. The honest summary for this one thing: a manual log works and costs nothing, and its weakness is that it depends on somebody remembering at 5:50 in the morning.

## Why Does Most Audit-Trail Guidance Not Apply to a Hospital?

Because most of the published guidance is written for nursing homes, and the reporting system it is built around does not reach most critical access hospitals.

Searching for staffing audit requirements in August 2026, most of what came back was about **Payroll-Based Journal reporting, usually shortened to PBJ**. That is the system nursing homes use to send their staffing hours to Medicare on a fixed schedule, where the numbers then appear publicly on the government's Nursing Home Care Compare website. Advice written for that world is about making submitted hours match payroll, and it is genuinely demanding.

**A swing-bed critical access hospital is usually not in that system at all.** The obligation follows a particular kind of certification, the one nursing homes hold, and swing-bed care sits under the hospital's own certification instead. So most critical access hospitals file no PBJ data whatsoever.

**The test is one question, so here it is rather than a link.** Is your hospital listed on [Nursing Home Care Compare](https://www.medicare.gov/care-compare/) with its own separate skilled nursing facility certification number? Search your hospital name and state. A swing-bed-only hospital returns no nursing-home listing. If you get no listing, you do not file PBJ. The main exception is a hospital running a separately certified distinct-part skilled nursing unit, which is certified as a skilled nursing facility and surveyed in its own right. Our guide to [CMS PBJ reporting and scheduling software](/blog/cms-pbj-reporting-scheduling-software) covers that case in full.

This is more than a technicality, because it changes what you are keeping records **for**. A nursing home keeps them to survive a data submission. A hospital keeps them to answer a person.

## What Does a Surveyor Actually Ask For?

They compare what they can see to what you gave them, and ask about the difference.

A critical access hospital answers instead to the Conditions of Participation, which are the federal rules a hospital has to meet to bill Medicare at all, and which a surveyor checks in person rather than through a data upload. Two of them land directly on the schedule:

- [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631) requires that "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients." The worked schedule is how you show it happened.
- [42 CFR 485.635(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635) requires that a registered nurse "provide (or assign to other personnel) the nursing care of each patient," and that a registered nurse, or a physician assistant where State law permits, supervise and evaluate that care.

Neither creates a documentation requirement. What both create is a claim about the past that a surveyor may ask you to substantiate, and substantiating it is what a record is for. CMS survey guidance for critical access hospitals ([State Operations Manual Appendix W](https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/downloads/som107ap_w_cah.pdf)) has surveyors determine compliance through observation, interviews and review of records, which is why what you can produce matters as much as what you did. Our guide to [staying CMS compliant through the schedule](/blog/how-to-stay-cms-compliant-nurse-scheduling) covers the wider record set, and our [critical access hospital scheduling](/critical-access-hospital-scheduling) overview covers the coverage requirements underneath all of it.

The practical failure is rarely the posted schedule, which is usually fine. It is the distance between the posted schedule and the worked one. A surveyor who sees a licensed practical nurse on the floor on a night your schedule shows a registered nurse is not accusing anyone of anything. They are asking what happened, and "we swapped it, I think in the second week" is a worse answer than a dated line in a log.

**If you are in Texas, that particular example is more than a paperwork question.** The federal rule allows a licensed practical nurse to be the licensed nurse on duty, but [26 TAC 505.41(o)(2)(D)](https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41) separately requires an RN on duty in each building of a licensed hospital containing at least one nursing unit where patients are present. So a swap that satisfies the federal rule can still leave the state one unmet. If you find one of those in your own records, raise it with whoever handles compliance rather than simply writing it down.

## Does Your Current Tool Record Changes at All?

Possibly not, and this is worth ten minutes rather than an assumption.

Scheduling tools built for retail and hospitality often treat the schedule as a live document to be kept current, which is exactly right for a coffee shop and leaves nothing behind. A hospital IT admin reviewing [When I Work](/blog/best-nurse-scheduling-app) on Capterra put it plainly:

> "No Auditing capability to see if unauthorized changes were made, and does not work for complex workflows."
>
> Jonathan R, IT Admin, Hospital and Health Care, 51 to 200 employees, February 25, 2026, Capterra

One review is not a verdict, and When I Work is well rated overall at 4.5 out of 5 across roughly 1,300 Capterra reviews as of August 2026. The quote is here because of who wrote it. An IT admin at a healthcare organization of 51 to 200 people is close to your scale, and he is describing this exact gap in a tool he already had.

Three questions will tell you where you stand, and they apply whether your schedule lives in software, a spreadsheet or a binder:

1. **Can you find out who made a change?** Not who is assigned now, but who did the reassigning. In software this fails when a login is shared, so it is worth checking whether yours are individual. On paper it fails when changes go on in pen with no initials.
2. **Can you get back to last cycle's schedule as it was published?** If the only copy is the one you have been editing, the answer is no, and that is true of most spreadsheets and some software.
3. **Can you hand the record to somebody else?** Printed, emailed, or copied into a file. A record only you can reach, in a tool only you log into, is not much use when you are on leave and a question arrives.

Failing all three is common and it is fixable by hand, using the dated copy and the running list described above. What you should not do is assume you pass because you own a scheduling tool. That is the assumption the reviewer above turned out to be wrong about.

## How Does SimpleScheduleAI Record Schedule Changes?

SimpleScheduleAI is an [AI-native nurse scheduling](/ai-nurse-scheduling) service for Texas hospitals of 25 beds or fewer. The AI builds each schedule, our scheduling team checks it, and your nurse manager approves it.

The change log is kept for you rather than by you. Every schedule change is recorded as it happens, with the person who made it and the time. Ask for it narrowed to one nurse, one kind of change or one date range, and it comes back to you as a spreadsheet file you can email or print, so the record never sits locked inside our system.

Callouts get the same treatment, including who was contacted and in what order, not just who ended up working. If a drop in patient numbers leaves a shift with more nurses than it needs, the entry says so in those words, so the record shows why somebody was taken off rather than just showing that they were.

Two details exist because a question from a surveyor is not the same as a question from a nurse. Any schedule the system built can be rebuilt later exactly as it was first produced, so "what did it originally give us" has an answer. And when the software leaves a shift short while staff were available, without a rule that explains it, that entry gets flagged instead of passing quietly. The awkward cases stay in the record.

One honest limitation, and it is a real one. This records scheduling decisions. It is not a compliance system. It does not know your state's nursing rules, it does not track when a certification expires, and it will not tell you whether you met a Condition of Participation. Our [nurse scheduling software](/nurse-scheduling-software) overview covers the rest, and [how the service runs a cycle](/how-it-works) covers what arrives each period.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    Audit trails get sold as a compliance feature, which sets the bar in the wrong place and makes them look like something you only need if an inspector is coming. The everyday case is stronger. At a hospital where two or three people can change the schedule and everybody is busy, the record is how you answer a question about last month without relying on memory. A surveyor is the rare version of that question. The common version is a nurse who believes she has been given more weekends than her share, and the difference between an argument and a conversation is whether anyone can pull up what actually happened. That is worth ten seconds a day whether you ever buy software or not, and a dated file plus a running list gets you most of the way there.
  </p>
</div>

## What to Do This Week

1. **Start the dated copy on Monday, before anything else.** The next time you post a schedule, save a second file with the date in its name and never open it again. You now have an "as published" version, which is the half of an audit trail most hospitals are missing, and it took ten seconds.
2. **Add a changes tab to that workbook, or put a notebook by the phone.** One line per change: date, which shift, what happened, who approved it, what time. Start with the next change you make rather than trying to backfill.
3. **Reconstruct one callout from last month as a test.** Who was on, who covered, who decided. If it takes you more than a few minutes, that is your answer about the current system, and items 1 and 2 are the fix. If you cannot reconstruct it at all, do not try to recover the rest; just start from here.
4. **Settle the PBJ question in two minutes.** Search your hospital on Nursing Home Care Compare. No nursing-home listing means you do not file, and most critical access hospitals do not. Write the answer down somewhere your administrator can find it, because this question comes back.
5. **Ask your administrator one question: how long do we keep staffing records?** The schedule should follow the hospital's existing retention policy rather than have a rule of its own, and most managers have never been told what that policy says.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">A record of every schedule change, without keeping it yourself</p>
  <p class="text-muted text-sm mb-6">Every change recorded with who made it and when, searchable, and exportable as a spreadsheet. Onboarding takes 3 to 5 business days and your first schedule lands inside two weeks.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-muted text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: What is a schedule audit trail?**

A record of what changed on the schedule, who changed it, and when, kept separately from the schedule itself. The posted schedule shows the current state. The audit trail shows the history that produced it, which is what you need when someone asks about a shift that happened weeks ago.

**Q: Does a critical access hospital have to keep one?**

No rule uses that phrase. What the Conditions of Participation require is that a licensed nurse was on duty whenever there was an inpatient, and that a registered nurse provided or assigned the nursing care of each patient. Both are claims about the past that you have to be able to support, and a change record is the practical way to do it.

**Q: Is this the same as Payroll-Based Journal reporting?**

No, and most critical access hospitals do not file PBJ at all. The obligation follows the kind of certification nursing homes hold, and swing-bed care sits under the hospital's own certification instead. A separately certified distinct-part skilled nursing unit is the exception.

**Q: Can a spreadsheet be an audit trail?**

Yes, if you save a dated copy the day you post it and keep a running list of changes in a separate tab. What does not work is one file that gets edited in place, because it records the present and nothing else. The habit is the hard part, not the tool.

**Q: Which gap is hardest to reconstruct later?**

The period between publishing the schedule and working it. The published version is a document and it tends to survive. The changes after it are events, and events go unrecorded unless somebody writes them down at the time.

## Sources

[1] [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631): the licensed nurse who must be on duty whenever a critical access hospital has one or more inpatients.

[2] [42 CFR 485.635(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635): at (d)(1) the registered nurse's duty to provide or assign the nursing care of each patient; at (d)(2) the duty to supervise and evaluate it, which falls to a registered nurse or, where State law permits, a physician assistant.

[3] Jonathan R, IT Admin, Hospital and Health Care, 51 to 200 employees, review of When I Work, February 25, 2026. [Capterra](https://www.capterra.com/p/121248/When-I-Work/reviews/). Quote re-verified verbatim on the live page 2026-08-31, alongside the 4.5 out of 5 average across 1,300 reviews cited above.

[4] PBJ scope and the swing-bed position are covered with their primary sources in our guide to [CMS PBJ reporting and scheduling software](/blog/cms-pbj-reporting-scheduling-software).

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
