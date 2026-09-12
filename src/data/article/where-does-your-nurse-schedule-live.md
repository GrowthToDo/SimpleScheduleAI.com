---
draft: false
publishDate: 2026-09-12T00:00:00Z
updateDate: 2026-09-12T00:00:00Z
author: 'Pradeep Pandey'
title: 'Where Does Your Nurse Schedule Live, and Who Can See It?'
excerpt: >
  A nurse schedule names a person, a place and an hour, weeks ahead. When a scheduling tool is in
  the news, hospitals ask whether patient records got out. Here none did, and the schedule still put
  the staff on it at risk. Where do the copies of yours live, and who can see each one?
image: ~/assets/images/pool/phone-tree-02.webp
imageCredit: 'AI-generated illustration'
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - data-privacy
  - rural-health
  - healthcare-operations
metadata:
  canonical: 'https://simplescheduleai.com/articles/where-does-your-nurse-schedule-live'
  description: 'Clinician schedules and cell numbers sat on the open web at about fifty health systems. What a nurse schedule reveals, where the copies live at a small hospital, and what to ask your vendor.'
---

## Key Takeaways

- The [Philadelphia Inquirer](https://www.inquirer.com/health/qgenda-schedule-privacy-links-cell-numbers-20260831.html) found that about fifty health systems had web pages showing clinician schedules, and in some cases cell phone numbers, reachable without a login. Penn Medicine, Johns Hopkins Medicine and the University of California San Francisco were among them.
- No patient information was involved. The platform in question does not hold any. That is exactly why the usual privacy reflex misses what is at stake.
- A schedule states where a named person will physically be, at what hour, weeks in advance. Security and privacy experts told the Inquirer that combining that with a cell number is what creates the risk.
- How the pages became public has not been established, and the Inquirer is explicit about that. No harm to any worker has been reported. What is documented is that the tool has a feature for sharing a schedule without a login, and that these pages were reachable without one.
- At least ten health systems removed the public link or added a password after being contacted by reporters.
- A 25-bed hospital rarely has one schedule. It has a posted copy, a texted copy, an emailed copy and a file on a shared drive, and each copy answers "who can see it" differently.

## Table of Contents

- [What Happened at About Fifty Health Systems?](#what-happened-at-about-fifty-health-systems)
- [Why Is a Nurse Schedule a Safety Document?](#why-is-a-nurse-schedule-a-safety-document)
- [Where Does a Small Hospital's Schedule Actually Live?](#where-does-a-small-hospitals-schedule-actually-live)
- [Who Is Responsible for Locking It Down, the Vendor or the Hospital?](#who-is-responsible-for-locking-it-down-the-vendor-or-the-hospital)
- [What Should You Ask a Scheduling Vendor About Public Schedule Access?](#what-should-you-ask-a-scheduling-vendor-about-public-schedule-access)
- [How Does SimpleScheduleAI Help?](#how-does-simplescheduleai-help)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

When this story broke in August, the natural first question was whether any patient records had been exposed. None had been. That answer is true, and it lets a hospital stop too early, because the people a schedule exposes are the staff on it rather than the patients.

So the useful question is not whether a large health system got caught out. It is where the copies of your own schedule come to rest, and who can see each one.

## What Happened at About Fifty Health Systems?

The [Philadelphia Inquirer reported on 31 August 2026](https://www.inquirer.com/health/qgenda-schedule-privacy-links-cell-numbers-20260831.html) that daily work schedules and cell phone numbers of healthcare workers were publicly reachable. The pages were hosted by the scheduling vendor QGenda. Reporters started from a confidential tip about three East Coast health systems and identified roughly fifty institutions with public pages. Those named include Penn Medicine, Children's Hospital of Philadelphia, ChristianaCare, Johns Hopkins Medicine, the University of California San Francisco and Cedars-Sinai Medical Center.

First, nobody has established how this happened. The Inquirer says so plainly. It is not clear how the schedules became public, how long they were reachable, how much administrators knew, or whether anyone looking to cause harm ever opened one. What is documented is that QGenda offers a "QuickLinks" feature letting "any staff member without a QGenda account" reach a schedule. That is a reasonable thing for a hospital to want, and a dangerous setting to leave switched on. Nobody has shown that this feature is how each of these pages became reachable, so treat it as the likely explanation and not a proven one. QGenda's own materials acknowledge that on-call schedules "may contain sensitive information" and carry a risk of "unauthorized access or data breaches". The company did not respond to the Inquirer's requests for comment.

No patient data was exposed, because the platform does not hold any. A hospital that checks for exposed patient records, finds none, and stops there has answered the wrong question. The names, shifts and phone numbers on the page all belong to staff.

At least ten health systems, including Johns Hopkins and UCSF, removed the public link or added a password requirement after reporters contacted them.

## Why Is a Nurse Schedule a Safety Document?

A schedule doubles as a movement log for named people. It says a specific nurse is on nights in the emergency department on the 14th, the 15th and the 16th, three weeks before it happens. Pair that with a mobile number and you have published where someone will be and how to reach them.

That combination is the risk the experts quoted by the Inquirer pointed to. Sharona Hoffman, a law professor at Case Western Reserve University, said the combination of cell numbers and work schedules "could be used to cause harm, whether by patients, politically motivated individuals, or stalkers". Will Owen of the Surveillance Technology Oversight Project told the paper that "hospitals must scrutinize the platforms they work with in their data collection to minimize information that can be weaponized". Doctors quoted in the piece were most worried about colleagues who provide care that draws threats, naming work with undocumented patients and gender-affirming and abortion care.

Worth saying plainly: no one has reported being harmed because of these pages. The concern is what the combination makes possible, not a documented incident.

For a rural hospital the exposure runs the other way from what you might expect. A 400-bed system has dozens of nurses on any given night, so a schedule identifies a crowd. At 25 beds, the [night shift may be two people](/blog/night-shift-nurse-schedule-coverage). A published schedule there describes two named individuals, and in a small town most readers can already put a face and an address to the name.

## Where Does a Small Hospital's Schedule Actually Live?

This is the part the national coverage cannot help you with, because a small hospital's schedule usually does not live in one system at all. Before deciding whether a vendor is the risk, count the copies.

Walk your own cycle and mark each place a copy comes to rest.

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-xs sm:text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="bg-slate-100 dark:bg-slate-700">
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100 align-top" style="width:30%">Where a copy ends up</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100 align-top" style="width:34%">Who can actually see it</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100 align-top" style="width:36%">The question to ask</th>
      </tr>
    </thead>
    <tbody>
      <tr class="bg-white dark:bg-slate-800">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100 align-top">Printed on the unit wall</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Anyone who walks past, including visitors and contractors</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Does it need full names and mobile numbers, or would first name and last initial do?</td>
      </tr>
      <tr class="bg-slate-50 dark:bg-slate-900">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100 align-top">A group text or WhatsApp thread</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Everyone in the thread, plus anyone they forward it to, forever</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Who is still in that thread after leaving, and who removes them?</td>
      </tr>
      <tr class="bg-white dark:bg-slate-800">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100 align-top">An emailed PDF</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Every recipient, and their personal mail if they forward it home</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Does it go to a distribution list nobody has pruned in two years?</td>
      </tr>
      <tr class="bg-slate-50 dark:bg-slate-900">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100 align-top">A shared drive or cloud folder</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Whoever the folder was shared with, which is rarely reviewed</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Is the link set to anyone with the link, and who last checked?</td>
      </tr>
      <tr class="bg-white dark:bg-slate-800">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100 align-top">Inside the scheduling platform</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Account holders, plus anyone reachable through a sharing feature</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">Is there a share-without-login option, and is it switched on?</td>
      </tr>
      <tr class="bg-slate-50 dark:bg-slate-900">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100 align-top">A staffing agency or travel-nurse contact</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">A third party outside your control entirely</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300 align-top">What did you send them, and did it include phone numbers?</td>
      </tr>
    </tbody>
  </table>
</div>

Expect several rows to apply at once rather than just one. The scheduling platform is a single row out of six, which is the point. Auditing the vendor while the group text keeps circulating fixes the smallest leak first.

## Who Is Responsible for Locking It Down, the Vendor or the Hospital?

Both. The vendor owns the default and owes you a plain description of what a setting does. The hospital owns the settings on its own account. The usual failure is mundane: a setting someone switched on three years ago for a good reason, which nobody has looked at since that person left.

Some hospitals go through their software once a year and confirm who still has access to what. If yours does, add the scheduling tool to that list and write down whose job it is to check. Plenty of small hospitals have no such review and nobody in IT to run one. There, the version that works is a calendar reminder for the nurse manager or the administrator to re-open the sharing settings every time someone leaves.

## What Should You Ask a Scheduling Vendor About Public Schedule Access?

Six questions, and they work on any vendor including this one. Ask for a demonstration rather than an assurance. If you do not hold the contract, and most nurse managers do not, send these to whoever does, usually the administrator or whoever signed the software. A good answer is a screen share of your own account. A bad answer is the word "secure" without a setting attached to it.

1. **Can a schedule be reached without logging in?** Vendors name this differently, so ask by what it does rather than by feature name. Then have them show you where it lives and what it is set to on your account today.
2. **What exactly appears on a shared schedule?** Surnames, mobile numbers, home unit, or just first name and shift. Show me the actual output, not the settings page.
3. **Who at our hospital can turn public sharing on?** Any manager, or only an administrator, and does anything notify us when it changes?
4. **When someone leaves, what happens to their access and their phone number?** Walk through it step by step for a nurse who quit last month.
5. **What do you send to a third party, like an agency?** Ask for a sample of the actual file.
6. **Can you show me a log of who viewed or changed the schedule?** A record of changes is not the same as a record of views; ask which one you get.

Write the answers down. The value of asking is not the reassurance, it is having a dated record of what you were told.

The question underneath all six, and the one a nurse manager asks first: were we one of the fifty? The only reliable way to find out is to ask your vendor in writing whether any public link exists on your account, and to open the setting yourself. Do not go hunting for other hospitals' pages to compare against.

## How Does SimpleScheduleAI Help?

It helps less than you might expect from a vendor writing about this, and being straight about that is the point of the section.

SimpleScheduleAI is an AI-native nurse scheduling service for Critical Access Hospitals in Texas. The AI builds the schedule, a scheduling team checks it, and the nurse manager approves it. The approved schedule reaches the nurse manager as a PDF and an Excel file, and the hospital posts it however it posts schedules today. Nurses do not log into anything, because there is nothing for them to log into.

That moves the question rather than settling it. Once a PDF is in the manager's hands, it goes on a wall or into a text thread like any other schedule, and every row in the table above applies again. This removes one place the schedule can sit. It does not remove the other five, and no vendor's product page should claim otherwise.

What is genuinely useful here is narrower. Every schedule change is logged with a timestamp and the log exports, so "who changed this and when" has an answer. That is the [audit trail a surveyor asks about](/blog/nurse-schedule-audit-trail), and it is a change record rather than a view record. Ask us question six above and that is the honest answer you will get.

One honest limitation, and it bears directly on this article: because nurses have no app, they see the schedule the old way, on a wall or in a message from their manager. That is the same paper trail described above. If you want nurses viewing and swapping shifts themselves, this is the wrong tool and you want a self-serve platform such as the ones reviewed in our [nurse scheduling app comparison](/blog/best-nurse-scheduling-app). It is also not built for hospitals outside Texas or rosters above 40 nurses.

None of the above is a security claim, and we would rather not make one. Put the six questions to us the same way you would to anyone else. For how the service works in full, see [how it works](/how-it-works), our [nurse scheduling software](/nurse-scheduling-software) hub, the rules that shape [critical access hospital scheduling](/critical-access-hospital-scheduling), and how [AI nurse scheduling](/ai-nurse-scheduling) builds a draft.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    The reflex when a scheduling story breaks is to check whether patient data moved, find that it did not, and move on. That reflex is what let these pages sit open. A schedule is the one routine document that pins a named person to a place and an hour, weeks ahead, and at a hospital where the night shift is two people it identifies them completely. Treat it as staff safety information and the right questions follow on their own.
  </p>
</div>

## What to Do This Week

1. **Count your copies.** Walk one cycle and list every place the schedule comes to rest, using the table above. Expect more than one.
2. **Open your scheduling tool and look for a share-without-login setting.** Find out whether it exists and what it is set to. If you cannot find it in ten minutes, that is your first question for the vendor.
3. **Check what is actually printed on the wall copy.** If it carries full names and mobile numbers, ask whether the unit needs both. First name and last initial usually tells three nurses named Jessica apart without publishing anyone in full.
4. **Prune one distribution list and one group thread.** Start with people who have left. This is the cheapest fix on the list and nobody ever schedules it.
5. **Put scheduling into your next access review by name.** A date and an owner, alongside the systems you already review.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">The schedule, built and checked, before Thursday</p>
  <p class="text-muted text-sm mb-6">SimpleScheduleAI builds three drafts against your rules, a scheduling team checks them, and your nurse manager approves the one to post. Built for Texas Critical Access Hospitals with 25 beds or fewer.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-muted text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

### What happened and how bad is it

**Was this a data breach?**

The reporting describes a configuration problem rather than an intrusion. Pages that a vendor feature makes reachable without a login were left reachable, and reporters found them. Whether it meets any given legal definition of a breach depends on the state and on what was exposed, which is a question for your counsel rather than for a vendor's article.

**Was patient information exposed?**

No. The Inquirer reported that the platform does not contain patient information. That is why treating this purely as a privacy incident understates it; the exposure was of staff, not patients. Where scheduling genuinely does touch patient data, and when a business associate agreement is required, is a separate question covered in our guide to [HIPAA and scheduling software](/blog/hipaa-compliant-nurse-scheduling-software).

**Does this mean the vendor is unsafe to use?**

That is not what the reporting shows. The controls existed and were not enabled by the health systems using them. The useful question is not which vendor to avoid, it is which settings are switched on in your own account today.

### What a small hospital should do

**How do I find out whether our schedule is reachable?**

Ask your vendor, in writing, whether any public or no-login link exists on your account, and open the sharing settings yourself while you wait for the answer. Keep the reply. If you have no scheduling platform, the same question applies to your shared drive and any folder link set to "anyone with the link".

**We only have 30 nurses. Is this really our problem?**

The smaller the roster, the more completely a schedule identifies individuals. Two named people on a night shift in a small town is more identifying, not less, than forty names at a large hospital.

**We do not use a scheduling platform at all, just a spreadsheet. Are we fine?**

The platform is one row of six in the table above. A spreadsheet emailed to a stale distribution list and printed with mobile numbers on it reaches the same outcome by a slower route.

**Who at a small hospital should own this?**

Whoever owns the software contract, usually the administrator, owns the vendor questions. The nurse manager owns the copies: the wall, the thread, the emailed file. Splitting it that way keeps it from becoming an IT project nobody has staff for.

**What is the single highest-value thing to check?**

Whether any tool you use can show the schedule to someone who is not logged in, and whether that is currently switched on. Everything else on the list is worth doing, but that is the one that put fifty health systems in the news.

## Sources

[1] Philadelphia Inquirer, "Links exposed physician cell numbers and work schedules at health systems in Philly and nationwide", 31 August 2026. The source for every factual claim about the incident in this piece. [inquirer.com](https://www.inquirer.com/health/qgenda-schedule-privacy-links-cell-numbers-20260831.html). Retrieved 2026-09-12.

[2] Becker's Hospital Review, "Nearly 50 hospitals, health systems had public links exposing clinician schedules: Report". Secondary trade coverage of the same reporting. [beckershospitalreview.com](https://www.beckershospitalreview.com/healthcare-information-technology/digital-health/nearly-50-hospitals-health-systems-had-public-links-exposing-clinician-schedules-report/). Retrieved 2026-09-12.

**A note on sources:** every factual claim about the incident above comes from the Philadelphia Inquirer's reporting, which is the primary account. Becker's is listed as corroborating trade coverage and is not quoted here, because its page blocks automated retrieval and we do not quote what we cannot read directly. Quotations from security and privacy experts appear as the Inquirer published them. SimpleScheduleAI competes with the vendor named in this story, which is a reason to read our framing critically; the advice above is written to apply to any scheduling tool, including ours.

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy (Operations and Marketing). His work focuses on workforce optimization and scheduling operations for Critical Access Hospitals and other small rural facilities._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
