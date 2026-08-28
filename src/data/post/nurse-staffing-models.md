---
draft: false
publishDate: 2026-08-28T00:00:00Z
author: 'Pradeep Pandey'
title: 'Nurse Staffing Models Explained: Which One Fits a Small Hospital?'
excerpt: >
  Nursing textbooks teach four care models, and three of them need more people on the floor than a small
  hospital has at 3 a.m. Which one you run was mostly settled by your roster. The skill mix on each
  shift is the part you still control.
image: ~/assets/images/pool/ward-team-03.webp
category: Healthcare Operations
postType: mofu
tags:
  - nurse-staffing
  - nurse-scheduling
  - critical-access-hospitals
  - healthcare-operations
metadata:
  canonical: 'https://simplescheduleai.com/blog/nurse-staffing-models'
  description: 'The four traditional nurse staffing models, what each one needs to run, which ones are actually available on a 15 to 25 nurse roster, and what the rules require whichever you pick.'
---

## Key Takeaways

- A nurse staffing model describes who delivers care to which patients on a shift. That is a different question from how many nurses you need, which is a ratio, and from how sick the patients are, which is acuity.
- Nursing tradition names four: functional, team, total patient care, and primary nursing. The [federal patient-safety handbook](https://www.ncbi.nlm.nih.gov/books/NBK2635/) sorts them in one sentence: "Functional and team nursing are task-oriented and use a mix of nursing personnel; total patient care and primary nursing are patient-oriented and rely on registered nurses (RNs) to deliver care."
- With two or three licensed nurses covering a whole building, functional and team nursing have nobody to divide the work among. That leaves total patient care as the only one of the four a thin overnight roster can support.
- The one thing here worth checking tonight: federal rules let a licensed practical nurse be the licensed nurse on duty at a critical access hospital, but [Texas separately requires](https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41) an RN on duty in each building holding patients. Staff a Texas overnight on an LPN alone and the federal rule is met while the state rule is not.
- No published evidence says one model outperforms another, and the author of the federal patient-safety handbook chapter calls the research on care models "glaring in its absence."

## Table of Contents

- [What Is a Nurse Staffing Model?](#what-is-a-nurse-staffing-model)
- [What Are the Four Traditional Nursing Care Models?](#what-are-the-four-traditional-nursing-care-models)
- [Which Model Does a Small Hospital Actually Run?](#which-model-does-a-small-hospital-actually-run)
- [What Do the Rules Require Whichever Model You Pick?](#what-do-the-rules-require-whichever-model-you-pick)
- [Does the Research Say One Model Is Better?](#does-the-research-say-one-model-is-better)
- [How Does SimpleScheduleAI Handle Skill Mix?](#how-does-simplescheduleai-handle-skill-mix)
- [What to Do This Week](#what-to-do-this-week)
- [Frequently Asked Questions](#frequently-asked-questions)

Two licensed nurses are on tonight. Between them they cover the inpatient floor, whatever comes through the emergency department, and the swing beds. Nursing literature has a name for how they divide that work: a care delivery model, or staffing model. It offers four to choose from.

Three of those four need more people on the floor than you have. The choice was mostly made for you. The question that is still yours is which licenses are on the floor each night, and what that lets you ask each person to do.

## What Is a Nurse Staffing Model?

A nurse staffing model is the pattern that decides **who delivers which parts of care to which patients** during a shift. It is the organizing structure of the work itself.

Three related questions get muddled together, and separating them makes each easier to answer:

- **How many nurses do we need?** That is a ratio question, and we cover it in our guide to [nurse-to-patient ratios at a small hospital](/blog/nurse-staffing-ratios-critical-access-hospital).
- **How sick are these particular patients?** That is acuity, meaning how much nursing time each patient needs, covered in [acuity-based staffing without an acuity tool](/blog/acuity-based-staffing-small-hospital).
- **Who does what for whom once they are here?** That is the staffing model, and it is what follows.

You can run any of the four models below at any ratio.

Two terms come up throughout, so here they are up front. **Skill mix**, sometimes called license mix, means which license types are on the floor at once: registered nurses, licensed practical nurses, and unlicensed staff such as nursing assistants. A **clinical nurse specialist** is a registered nurse with advanced training in a specialty, and most small hospitals do not employ one.

## What Are the Four Traditional Nursing Care Models?

Four names come up in every nursing curriculum. What follows is what each needs in order to function, which is the part usually left out.

<div class="not-prose overflow-x-auto my-8">
  <table class="min-w-full table-fixed break-words align-top text-sm border border-slate-200 dark:border-slate-700">
    <thead class="bg-slate-50 dark:bg-slate-800">
      <tr>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">Model</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">How the work is divided</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">What it needs to run</th>
        <th class="px-3 py-2 text-left font-semibold border-b border-slate-200 dark:border-slate-700">On a night with two licensed nurses and no one else</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Functional nursing</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">By task. One person does the medication pass for everyone, another does the dressings.</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Enough staff on the floor to specialize, and a mix of license types to delegate across.</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Not available. Two people cannot each own a separate task line and still cover the floor.</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Team nursing</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">A registered nurse leads a small team of mixed license types caring for a group of patients.</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">A team: at minimum a registered nurse plus one or two other staff, per group of patients.</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Not available. Add a nursing assistant and you have one team of three, which is just the whole shift, so naming it a team changes nothing.</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-medium">Total patient care</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">One nurse does everything for their assigned patients for that shift.</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Registered nurses in sufficient number to cover the census directly.</td>
        <td class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">Workable, and the one a two-nurse night leaves you with once the others are ruled out.</td>
      </tr>
      <tr>
        <td class="px-3 py-2 font-medium">Primary nursing</td>
        <td class="px-3 py-2">One named nurse holds accountability for a patient's plan of care from admission to discharge. Other nurses carry that plan out on shifts the primary nurse is off.</td>
        <td class="px-3 py-2">A mostly registered-nurse staff, and an assignment system that names an accountable nurse per patient and records it.</td>
        <td class="px-3 py-2">Possible on paper, and rarely done. A patient often does see the same nurse throughout, but continuity by coincidence is not the model: without a named accountable nurse, this is still total patient care.</td>
      </tr>
    </tbody>
  </table>
</div>

The handbook published by AHRQ, the federal Agency for Healthcare Research and Quality, [draws the dividing line between them](https://www.ncbi.nlm.nih.gov/books/NBK2635/): "Functional and team nursing are task-oriented and use a mix of nursing personnel; total patient care and primary nursing are patient-oriented and rely on registered nurses (RNs) to deliver care."

That split is really a statement about staffing levels. Task-oriented means the work is broken into jobs and shared out among people of different license types. The point of doing that is to stretch scarce registered nurses across more patients by handing the lower-license work to somebody else. It only pays off when there is somebody else on the floor to hand it to.

## Which Model Does a Small Hospital Actually Run?

Most likely total patient care, and not because anyone chose it.

Take a night shift at a 25-bed hospital with a census of nine. Two licensed nurses cover the inpatient floor, the emergency department and the swing beds. Put one of them on medications for everybody and a single nurse is left covering the building. Call them a team and they are still two people in two places. So each nurse takes their own patients and does everything for them, which is total patient care reached by ruling out the other three.

A model adopted on paper still needs the conditions it assumed. Naming your model "team nursing" does not create a team, and the benefits described in the literature have nothing to work with if the staff those benefits depend on are not on the floor.

We looked for published guidance on the minimum staff each of these models needs and found none. If somebody quotes you a threshold number, ask where it came from.

## What Do the Rules Require Whichever Model You Pick?

Three rules survive every model choice. Two are federal and sit in neighboring sections of the same regulation, so it is worth keeping them apart: **485.631 is about who must be on duty**, and **485.635 is about what the registered nurse must do**.

**Who must be on duty: an RN is not federally required.** [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631) requires that "a registered nurse, clinical nurse specialist, or licensed practical nurse is on duty whenever the CAH has one or more inpatients." Read alone, that permits a licensed practical nurse to be the one on duty overnight.

**What the RN must do: assign and supervise, always.** [42 CFR 485.635(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635) says a registered nurse must "provide (or assign to other personnel) the nursing care of each patient," and that "a registered nurse or, where permitted by State law, a physician assistant, must supervise and evaluate the nursing care for each patient." The rule names swing-bed patients specifically, so a quiet swing bed does not fall outside it. This is the answer to a question worth settling: the delegation that functional and team nursing rely on is not something a model grants you. It is already required.

**Texas then requires the RN on site.** [26 TAC 505.41(o)(2)(D)](https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41) says: "An RN shall be on duty in each building of a licensed hospital that contains at least one nursing unit where patients are present."

**Meeting the federal on-duty rule with a licensed practical nurse alone does not meet the Texas rule** when a building holds patients. That is the practical finding, and it is worth checking against your own schedule.

Two limits on how far we can take it for you. The rule turns on what counts as a nursing unit in your building, which is a question about how your hospital is licensed and laid out, and an emergency department is exactly the case where hospitals differ. And if you are the person who would normally answer a compliance question, as many nurse leaders at this size are, there is no one to hand it to. In that case the specific question to put to your CNO, your licensing file, or Texas HHSC is this one: **which areas of our licensed premises count as nursing units for 505.41(o)(2)(D), and does an RN have to be physically present in each of those buildings overnight?** That is answerable, and it is a better question than asking whether you are compliant in general.

**Texas also spells out how assignments must be made.** The same subsection continues: "The RN shall supervise and evaluate the nursing care for each patient and assign the nursing care to other nursing personnel in accordance with the patient's needs and the specialized qualifications and competence of the nursing staff available."

That final clause is the skill-mix requirement written into state law. Assignments have to match what each person is qualified and competent to do, which is a matter of record rather than of who happens to be free. Our guide to [scheduling at a 25-bed hospital](/critical-access-hospital-scheduling) covers the coverage side of the same problem.

## Does the Research Say One Model Is Better?

No, and the handbook that catalogues the models says so itself: "What is glaring in its absence, however, is the limited research related to care models." That is [Jennings, in the AHRQ handbook quoted above](https://www.ncbi.nlm.nih.gov/books/NBK2635/), and we found nothing published since that overturns it.

What research there is points at resourcing rather than labels. [Thériault and colleagues](https://pmc.ncbi.nlm.nih.gov/articles/PMC6650648/) grouped 40 acute care units in Quebec by how well staffed they were rather than by which model they claimed, and the least resourced group "relied mainly on less qualified personnel and agency staff." That study is Canadian and describes resourcing, not care models, so read it as a picture of how staffing varies rather than a ranking to copy.

The practical use of all this is defensive. If anyone proposes moving your unit onto a named model, no published evidence says it will help, and you are entitled to ask what the proposal puts on the floor that is not there now.

## How Does SimpleScheduleAI Handle Skill Mix?

SimpleScheduleAI is an [AI-native nurse scheduling](/ai-nurse-scheduling) service for Texas hospitals of 25 beds or fewer. AI-native means the schedule is built by software rather than by a person filling in a grid, but it is run as a service: the AI builds each schedule, our scheduling team checks it, and your nurse manager approves it before anyone sees it. Your nurses never log in to anything.

Every nurse on your roster is recorded with their role, employment type, contracted hours as a full-time equivalent (FTE), competency level, what they are cross-trained for, and whether you have approved them to take charge. You tell us those last two. They are your judgment about your own staff, not ours.

The scheduler then works from them. For each scheduling period it builds three complete draft schedules rather than one, rates each on coverage, fairness, cost, preference match and skill mix, and your nurse manager picks which one to run. Three drafts means those trade-offs get weighed rather than buried in a single answer, because the fairest draft and the cheapest draft are rarely the same schedule.

Charge coverage is handled the same way. If a nurse who was holding charge calls out and nobody available is approved for charge, you are told there is no charge-qualified cover rather than handed a name who cannot hold it.

One honest limitation, covering three things this does not do. That charge check runs against the approval you recorded, not against any legal standard, so the software is not doing compliance for you and does not know your state's rules. It does not choose your care delivery model, which is a nursing leadership decision no scheduler should make for you. And it does not classify patient acuity; it schedules against the coverage requirements you set. You can see [how the service runs a cycle](/how-it-works), and our [nurse scheduling software](/nurse-scheduling-software) overview covers where the tooling helps.

<div class="not-prose my-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 px-6 py-5">
  <p class="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">Our Take</p>
  <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed m-0">
    Staffing-model language does more harm than good at small hospitals, because it offers a menu that is not really on offer. Three of the four traditional models need staff a 25-bed hospital does not have on the floor at 3 a.m., so the roster settled the question long before anyone opened a textbook. Two things underneath it are worth your attention, and both are answerable this week. Does every night meet the Texas each-building rule, which the federal on-duty rule alone does not guarantee. And are nights, weekends and holidays landing on the same three names. Fix those and the model label takes care of itself.
  </p>
</div>

## What to Do This Week

1. **Check every overnight in your last published schedule for a registered nurse.** This is the compliance one. Go shift by shift and confirm an RN was on duty in each building holding patients, including nights covered mainly by a licensed practical nurse. If you find a night without one, that is a gap to raise with your compliance lead this week, not next quarter.
2. **Pull the last three months and count the hard shifts per person by name.** Hard shifts means nights, weekends and holidays. Count each nurse's total, then sort the list. Averages hide the problem, because a fair-looking average is exactly what a roster with two overloaded people produces. If the top name carries roughly double the bottom name, you have a distribution problem worth fixing, and our guide to [reducing nurse overtime](/blog/how-to-reduce-nurse-overtime) covers the cheaper fixes first.
3. **Write down who on your roster you would actually let take charge, and check that the list is longer than two.** Charge coverage is where a thin roster fails first, because one callout can leave nobody eligible. If your list is two names, expanding it is a training decision to start now.
4. **Decide whether your competency records are current enough to assign from.** Texas requires assignments to match "the specialized qualifications and competence of the nursing staff available." If the last competency sign-off in your file is a year old, the record you would show a surveyor is not the one you are scheduling from.
5. **If anyone proposes moving you to a named staffing model, ask one question: which additional people will be on the floor?** If the answer is none, it is a renaming exercise, and no published evidence says the new name will help.

<div class="not-prose my-12 rounded-xl bg-primary/5 border border-primary/20 px-8 py-10 text-center">
  <p class="text-lg font-semibold text-default mb-2">The right license on the floor, every shift</p>
  <p class="text-muted text-sm mb-6">Every draft is scored on skill mix and coverage before it reaches you, and charge gaps are flagged rather than filled with someone who cannot hold the role. Onboarding takes 3 to 5 business days and your first schedule lands inside two weeks.</p>
  <a href="/how-it-works" class="inline-block bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">See how it works →</a>
  <p class="text-muted text-xs mt-4"><a href="https://cal.com/gautham-8bdvdx/30min" class="underline">Book a call with our team →</a></p>
</div>

## Frequently Asked Questions

**Q: What are the four nurse staffing models?**

Functional nursing divides care by task. Team nursing puts a registered nurse in charge of a mixed-license group caring for a set of patients. Total patient care gives one nurse full responsibility for their patients for that shift. Primary nursing names one nurse as accountable for a patient's plan of care from admission to discharge, with other nurses carrying out that plan on shifts the primary nurse is off.

**Q: Which nurse staffing model is best for a small hospital?**

Total patient care is usually the only one left standing, because the other three need more staff on the floor at once than a 15 to 25 nurse roster provides overnight. That is a consequence of the roster rather than a recommendation. We looked for published guidance on the minimum staff each model needs and found none.

**Q: What is the difference between a staffing model and a nurse-to-patient ratio?**

A ratio says how many patients one nurse carries. A staffing model says how the work for those patients is divided among the people on shift. You can run any of the four models at any ratio, and a ratio mandate does not tell you which model to use.

**Q: Can a licensed practical nurse cover a night shift on their own?**

Under the federal critical access hospital rule, an LPN can be the licensed nurse on duty. In Texas that is not enough on its own: 26 TAC 505.41(o)(2)(D) requires an RN on duty in each building of a licensed hospital containing at least one nursing unit where patients are present. So a Texas hospital with occupied beds needs the RN as well. Confirm your own position with your compliance lead, because licensing and building layout both affect how the rule applies to you.

**Q: Do CMS or Texas rules require a hospital to adopt a particular staffing model?**

No. Neither names functional, team, total patient care or primary nursing, and neither requires you to pick one. What they require is a registered nurse to assign and supervise the nursing care of each patient, under 42 CFR 485.635(d), and in Texas an RN on duty in each building holding patients. Those duties hold whichever model you say you run, which is why a model change that adds nobody to the floor changes very little.

## Sources

[1] Jennings BM. "Care Models." In: Hughes RG, editor. Patient Safety and Quality: An Evidence-Based Handbook for Nurses. Rockville (MD): Agency for Healthcare Research and Quality; 2008, chapter 19. [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK2635/). The task-oriented versus patient-oriented split and the limited-research finding.

[2] Thériault M, Dubois CA, Borgès da Silva R, Prud'homme A. "Nurse staffing models in acute care: A descriptive study." Nursing Open 2019;6(3):1218-1229. [PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC6650648/). Forty acute care units across four hospital centers in Quebec, sorted into four staffing configurations.

[3] [42 CFR 485.631(a)(5)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.631): the licensed nurse who must be on duty when a critical access hospital has inpatients. Permits an RN, clinical nurse specialist or LPN.

[4] [42 CFR 485.635(d)](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-485/subpart-F/section-485.635): the federal requirement that a registered nurse provide or assign the nursing care of each patient, and that a registered nurse, or a physician assistant where State law permits, supervise and evaluate it. This duty is federal, not a Texas addition.

[5] [26 TAC 505.41(o)(2)(D)](https://www.law.cornell.edu/regulations/texas/26-Tex-Admin-Code-SS-505-41), Texas hospital licensing. Two sentences in one subsection: the RN on duty in each building containing a nursing unit with patients present, which is genuinely stricter than source [3]; and a restatement of the supervise-and-assign duty from source [4], with the added clause requiring assignments to match staff qualifications and competence. Verified 2026-08-28.

---

_[Pradeep Pandey](/about/pradeep-pandey) is the co-founder of SimpleScheduleAI, an AI-native nurse scheduling service built for Critical Access Hospitals in Texas. He serves as Deputy General Manager of Operations at Apollo Hospitals and holds an MBA from IIM Trichy._
[LinkedIn →](https://www.linkedin.com/in/pradeep-pandeyji/)
