---
draft: false
publishDate: 2026-08-04T00:00:00Z
author: 'Pradeep Pandey'
title: 'Nurse Scheduling Software Employee Minimums: What to Do With 18 Nurses'
excerpt: >
  You may have read that some scheduling platforms require 100 employees. We could not
  verify that number anywhere. The real barrier is simpler: most scheduling products are
  built and priced for hospitals much larger than yours, and the vendors say so on their
  own websites.
image: https://images.unsplash.com/photo-1600091474842-83bb9c05a723?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80
category: Healthcare Operations
postType: mofu
tags:
  - nurse-scheduling
  - scheduling-software
  - critical-access-hospitals
  - small-hospitals
  - healthcare-operations
metadata:
  canonical: 'https://simplescheduleai.com/blog/nurse-scheduling-software-minimum-employees'
---

## Key Takeaways

- No major nurse scheduling vendor publishes a hard employee minimum. The widely repeated "100-employee minimum" claim traces to a single third-party account of a sales call, so treat it as unverified.
- The real exclusion is structural. Vendors signal their intended customer through their own marketing ranges, implementation models, and pricing floors. Shiftboard's site, for example, markets to organizations of 25 to 100,000 employees.
- An 18-nurse roster sits at or below the bottom of most platforms' advertised ranges. The product may technically run, but its analytics, self-scheduling logic, and optimization features assume a bigger staff.
- The practical test beats any stated minimum: ask each vendor for their median time from roster upload to a posted schedule, and whether a facility your size can run the platform without IT staff.
- Purpose-built small-facility options exist but are rare. Evaluate them on setup speed, compliance coverage, and callout handling rather than feature breadth.

## Table of Contents

- [Is There Really a Nurse Scheduling Software With a 100-Employee Minimum?](#is-there-really-a-nurse-scheduling-software-with-a-100-employee-minimum)
- [How Do Vendors Signal Their Real Minimum?](#how-do-vendors-signal-their-real-minimum)
- [Why Do Scheduling Platforms Underperform on Small Rosters?](#why-do-scheduling-platforms-underperform-on-small-rosters)
- [What Can an 18-Nurse Hospital Actually Use?](#what-can-an-18-nurse-hospital-actually-use)
- [How Should You Evaluate Scheduling Software at This Size?](#how-should-you-evaluate-scheduling-software-at-this-size)
- [How Does SimpleScheduleAI Handle Small Rosters?](#how-does-simplescheduleai-handle-small-rosters)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

A Critical Access Hospital administrator shopping for nurse scheduling software keeps hitting the same wall. She finds a product with strong reviews and a helpful-sounding sales rep. Then she mentions she has 18 nurses, and the conversation changes.

Sometimes the rep is direct: the platform is built for larger organizations. Sometimes nobody says it and the contract gets signed. The mismatch surfaces months later as unused features, an implementation that assumed IT staff she does not have, and analytics screens with too little data to mean anything.

This guide covers what is actually verifiable about employee minimums, how to read the signals vendors do publish, and how to evaluate the options that remain at your size.

## Is There Really a Nurse Scheduling Software With a 100-Employee Minimum?

Not verifiably. A "minimum 100 employees" claim about Shiftboard circulates in software roundups, but the only public trace we could find is a [competitor's review article](https://connecteam.com/reviews/shiftboard) recounting what its author was told in a sales conversation. That is one secondhand account. It is not a published policy, and it does not appear in Shiftboard's own materials or in customer reviews.

What Shiftboard's own site does say is more useful. It [markets its platform to organizations of 25 to 100,000 employees](https://www.shiftboard.com/). An 18-nurse hospital sits below the bottom of that range. Shiftboard never has to turn you away; the range on its own website already tells you the product was built for bigger teams.

That distinction matters for how you evaluate everything in this category. Published hard minimums are rare. Soft floors, expressed through marketing ranges, pricing structures, and implementation assumptions, are everywhere. The rest of this guide is about reading them.

## How Do Vendors Signal Their Real Minimum?

Vendors signal their intended customer size in four places, none of which is labeled "minimum."

<div class="not-prose overflow-x-auto my-8">
  <table class="w-full text-xs sm:text-sm border-collapse table-fixed break-words">
    <thead>
      <tr class="bg-slate-100 dark:bg-slate-700">
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:24%">Signal</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:38%">What it looks like</th>
        <th class="border border-slate-300 dark:border-slate-600 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100" style="width:38%">What it tells an 18-nurse hospital</th>
      </tr>
    </thead>
    <tbody>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">Marketing range</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">"For organizations of 25 to 100,000 employees" on the vendor's own site</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">If your roster sits at or below the bottom of the range, you are the edge case, and edge cases get the least product attention</td>
      </tr>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">Implementation model</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">A formal project phase with data migration, configuration, and training, measured in weeks or months</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">The vendor assumes someone owns the project full time. At your size, that person is the nurse manager, who already has a job</td>
      </tr>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">Pricing structure</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Per-module pricing, annual contracts, setup fees, or quotes only after a demo</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Module stacking prices assume the spend is spread across hundreds of seats. Twenty seats carry the same overhead alone</td>
      </tr>
      <tr class="align-top">
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 font-medium text-slate-900 dark:text-slate-100">Feature architecture</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">Analytics dashboards, self-scheduling marketplaces, float pool routing</td>
        <td class="border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">These features need volume to work. A 20-person roster does not generate it, so the headline features sit idle</td>
      </tr>
    </tbody>
  </table>
</div>

The pattern holds across the enterprise tier. QGenda's customer base skews toward physician groups and larger health systems, which is why small facilities end up searching for [QGenda alternatives](/blog/qgenda-alternatives). UKG positions its workforce suite at enterprise scale, which is why we cover it separately in [why UKG is too complex for a small hospital](/blog/ukg-too-complex-small-hospital). These vendors do not publish employee minimums. Their marketing, pricing, and setup requirements still make the intended customer size clear.

## Why Do Scheduling Platforms Underperform on Small Rosters?

Because their core value comes from optimization across volume, and a small roster does not produce volume.

Analytics need data points. An overtime-concentration dashboard built for a 400-nurse system reads as noise when it has 18 inputs. Self-scheduling logic needs enough nurses competing for shifts that conflict resolution has work to do. Automated callout routing assumes a pool of candidates; at a small hospital the pool is a short list of named people, and the manager already knows them.

There is also a support economics problem. A customer running a platform at the edge of its design envelope generates expensive support tickets about use cases the product never anticipated. Some vendors decline that business quietly, through pricing or sales guidance. That is likely how minimum-size guidance ends up in sales conversations without ever appearing in writing.

None of this makes the platforms bad. It makes them built for someone else, which is a different problem, and the one a small-hospital buyer actually has to solve. It is the same structural mismatch we describe in [why hospitals switch back from scheduling software to Excel](/blog/switching-from-excel-to-nurse-scheduling-software): the software works as designed, for a customer with a scheduling department.

## What Can an 18-Nurse Hospital Actually Use?

The realistic field at this size falls into three groups.

**Simple self-serve platforms.** Tools like [Aladtec](/blog/aladtec-vs-managed-service) serve smaller operations with simpler setup than the enterprise tier. The trade: the nurse manager configures and operates the system herself, and healthcare-specific compliance coverage varies by product. Verify what each tool actually enforces.

**Generic scheduling tools.** Deputy, When I Work, and similar products are affordable and easy to start. They were built for retail and hospitality, so hospital requirements arrive as open questions. Overtime tracking against FLSA thresholds, staffing-record documentation, and credential matching are not documented on their product pages, and a business-associate agreement may not be advertised, a distinction we unpack in [HIPAA-compliant nurse scheduling software](/blog/hipaa-compliant-nurse-scheduling-software). Verify each directly with the vendor before trusting a schedule to one; our guide to [Deputy alternatives for healthcare](/blog/deputy-alternatives-healthcare) covers the category.

**Operated scheduling services.** The model shifts from buying a platform to receiving a schedule. Setup is faster because there is no configuration project on your side, and the operating burden the enterprise tier assumes you can absorb is exactly what the service takes over. The trade is less direct control over every variable, which we compare honestly in [managed service versus scheduling software](/blog/managed-service-vs-scheduling-software).

## How Should You Evaluate Scheduling Software at This Size?

Four criteria separate tools that work at 18 nurses from tools that merely install.

**Time to a posted schedule.** The useful bar: a posted schedule within two weeks, without IT involvement. Ask every vendor for their median time from roster upload to first published schedule. Vague answers predict long implementations.

**No IT dependency for routine changes.** A shift rule change should not require a support ticket. Facilities at this size run on limited IT, typically one person or a contracted service, so any platform that assumes an IT queue will stall on ordinary work.

**Healthcare compliance built in.** Hours tracked against applicable [FLSA overtime thresholds](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime) while the draft is built, not discovered at payroll. Coverage rules that respect the on-duty requirement for a Critical Access Hospital. A timestamped record of schedule changes.

**Callout coverage from your real roster.** No float pool exists at this size, so the tool must rank replacements from the nurses you actually have, weighing credentials and overtime exposure. A tool that only builds the grid leaves the 2 a.m. problem untouched, which is why we treat the callout question as the decisive one in [what a nurse schedule generator does and misses](/blog/nurse-schedule-generator).

Run every candidate through those four. Most of what appears in a general search will fail at least one. That is the market telling you who each product was built for.

## How Does SimpleScheduleAI Handle Small Rosters?

SimpleScheduleAI is an AI-native nurse scheduling service: the AI builds the schedule, our scheduling team checks it, you approve. It was designed from the small-roster context up, for [critical access hospital scheduling](/critical-access-hospital-scheduling) specifically, so there is no employee minimum. Pricing is a flat monthly price by roster size, with no per-nurse fees and no setup fees.

Onboarding matches the two-week bar above. You send us your staff list and shift structure via Excel. We configure the rules, run a test cycle, and hand you a draft schedule for review, with no IT involvement required. When a nurse calls out, the system ranks the top replacement candidates with reasons: skills, role, charge coverage, and overtime risk. Every schedule change is logged with a timestamp, and the service works from roster and shift data rather than clinical records.

One honest limitation: this model is built for facilities of 25 beds and under, and our published pricing covers rosters up to 40 nurses. A hospital growing past Critical Access scale, or one that needs deep analytics dashboards and direct payroll integration, has different evaluation criteria and will be better served by the mid-market tier. For how the drafts get built, see [AI nurse scheduling](/ai-nurse-scheduling); for the wider feature picture at this size, see the [nurse scheduling software](/nurse-scheduling-software) guide.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    We could not verify the 100-employee minimum this post's keyword is built on, and we think that is the more useful finding. Buyers at small hospitals keep inheriting claims from software roundups that nobody sourced. The signals worth trusting are the ones vendors publish about themselves. Read the marketing range on their own site, the shape of their implementation project, and how they answer when you ask for a median time to a posted schedule. A vendor whose range starts above your roster is answering your question honestly, just not in the field labeled minimum.
  </p>
</div>

## What to Do This Week

1. **Write your actual numbers at the top of your evaluation notes.** Roster size, beds, and who would operate the tool. Every vendor conversation gets measured against that line, and it keeps a demo built for 400 nurses from selling features your 18 will never trigger.
2. **Check each candidate vendor's own site for its stated range.** If their marketing starts above your roster size, treat that as their answer about fit.
3. **Ask the two questions that expose soft minimums.** Median time from roster upload to a posted schedule, and which configuration steps your staff performs. Neither can be answered with a feature list.
4. **Verify compliance claims in writing.** Overtime threshold tracking, staffing-record documentation, and a business-associate agreement. If a vendor does not advertise one, confirm with the vendor rather than assuming.
5. **See how an operated service handles an 18-nurse roster.** Walk through the cycle at [how it works](/how-it-works), or book a call to talk through your facility.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">No minimum. Built for 18 nurses, not 180.</p>
  <p class="text-muted text-sm mb-6">SimpleScheduleAI is purpose-built for Texas Critical Access Hospitals. Flat monthly pricing by roster size, no IT setup, first schedule in under two weeks.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="mt-4 mb-0 text-sm"><a href="https://cal.com/gautham-8bdvdx/30min" class="text-primary underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

### The Minimum Question

**Q: Does Shiftboard have a 100-employee minimum?**

Not that can be verified. Shiftboard publishes no minimum, and the 100-employee figure traces to one third-party account of a sales conversation rather than a policy or customer review. What its site does state is a target range of 25 to 100,000 employees. If your roster sits near or below the bottom of a vendor's advertised range, ask the vendor directly whether they serve facilities your size, and treat the answer as part of the evaluation.

**Q: Do any nurse scheduling vendors publish hard employee minimums?**

Published hard minimums are rare in this category. The common pattern is a soft floor expressed through marketing ranges, implementation requirements, and pricing structure. That is why the practical tests, median time to a posted schedule and IT dependency, tell you more than searching for a stated minimum.

### Options at Small Scale

**Q: Is there scheduling software designed for hospitals with 25 or fewer beds?**

Purpose-built options are rare because most development investment targets mid-market and enterprise buyers. The realistic field is simple self-serve platforms, generic tools with compliance gaps to verify, and operated services. SimpleScheduleAI is one of the few services designed specifically for Critical Access Hospital scale. Whichever direction you take, the four evaluation criteria above matter more than any product label.

**Q: If I have 18 nurses today, will I outgrow a small-facility tool?**

At most Critical Access Hospitals, the timeline is long. The federal designation caps a CAH at [no more than 25 inpatient beds](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.620), which bounds roster size. A facility planning to grow past the designation should plan a scheduling transition as part of that move. A facility staying at CAH scale can expect a purpose-built tool or service to remain the right fit.

## Sources

1. Shiftboard target-customer range (organizations of 25 to 100,000 employees). [Shiftboard](https://www.shiftboard.com/), site marketing, verified June 2026.

2. The origin of the "minimum 100 employees" claim: a third-party review article recounting a sales conversation. [Connecteam, Shiftboard review](https://connecteam.com/reviews/shiftboard). Cited here as the trace of the claim, not as a verified policy.

3. FLSA healthcare overtime guidance. [U.S. Department of Labor, Fact Sheet #54](https://www.dol.gov/agencies/whd/fact-sheets/54-healthcare-overtime).

4. Critical Access Hospital bed limit (no more than 25 inpatient beds). [eCFR, 42 CFR 485.620](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.620).

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
