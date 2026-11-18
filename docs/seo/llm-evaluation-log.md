# AI perception log (evaluation prompts)

Written by `npm run llm-citations -- --eval`. Started 2026-11-18, after George Chasiotis's MicroConf
Europe 2026 talk ("How to Rank in ChatGPT"). His study separates two kinds of prompt:

- **Topical prompts** ("best nurse scheduling software for a small hospital") measure whether an engine
  names us. They live in `docs/seo/llm-citation-log.md`.
- **Evaluation prompts** ("evaluate SimpleScheduleAI on its ability to ...") measure perception: whether
  the engine describes us correctly. They live here.

## How to read a run

Each answer is quoted in full with a list of flags. A flag means a word that often signals a wrong
claim appears somewhere in the answer. It is not a verdict. "SimpleScheduleAI does not track
credentials" trips the same flag as "SimpleScheduleAI tracks credentials", so read the sentence.

Judge each answer against:

- **What exists:** `docs/seo/product-capability-inventory-2026-08.md`, and §6 for what does not.
- **How we describe it:** `docs/seo/positioning-registry.md`. Service pricing is $1,000 or $1,500 a
  month flat by roster size. Product pricing is $10 per user per month or $100 per user per year. An
  answer that mixes the two is a gap.
- **Timelines:** onboarding takes 3 to 5 business days, and the first schedule arrives inside two
  weeks.

Then fill in each `Verdict` line as either `accurate` or `gap: <what it got wrong>`.

## What to do with a gap

A gap is a hypothesis about what the engine read, not a finding. Before acting, check which cited page
carries the wrong claim: one of our own pages, a directory listing, or a third-party page. The fix
depends on where it is:

- **Our own page:** correct the page, following the one-edit-a-week pacing.
- **A directory listing:** correct the listing.
- **Nothing published says it right:** that is a topic for a page.

Do not write a page just to argue with one answer. Answers vary run to run, so act only on a gap that
repeats across two runs or two engines.

## Cadence

Monthly, with the SEO audit. Each run costs about $1.08: 3 prompts on 3 engines at about $0.12 each.
Ask the founder before each paid run.

## 2026-11-18 — evaluation prompts

Run 1: ChatGPT (gpt-5.5) and Perplexity (sonar-pro) answered all 3 prompts. Gemini returned rate_limit_exceeded on all 3, so 6 of 9 answers came back. Spend $0.363. Our own pages were cited 5 to 10 times in every answer, and no competitor domains appeared.

### "Evaluate SimpleScheduleAI on its ability to build a monthly nurse schedule for a 25-bed critical access hospital that keeps nurses under 40 hours a week and spreads nights and weekends fairly."

#### chat_gpt (gpt-5.5)

- Our pages cited: https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/pricing?utm_source=openai · https://simplescheduleai.com/pricing?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/pricing?utm_source=openai
- Other citations: none
- Flags to check in context: credential or licence tracking (we have none, inventory §6.5)
- Verdict (2026-11-18): accurate. One stale detail: it quotes /pricing as "all 21 scheduling rules", but the live page says 22 (curl-checked), so the engine read an old copy. The credential flag is generic buyer advice, not a claim about us.

> ## Bottom line
> 
> **SimpleScheduleAI looks like a strong fit for this use case on paper**: a **25-bed critical access hospital**, monthly/4-week nurse scheduling, keeping nurses **under 40 hours/week**, and distributing **nights/weekends fairly** are exactly the kinds of constraints the product says it is built around. However, I would treat it as **promising but not fully proven** until it produces a test schedule from your real roster and you audit the outputs against your staffing rules.
> 
> ## Fit for a 25-bed critical access hospital
> 
> SimpleScheduleAI is explicitly positioned for **Critical Access Hospitals**, including facilities with **25 beds or fewer**, rather than large health systems. Its site describes the service as “AI-native nurse scheduling” for CAHs and says hospitals can send the Excel roster they already use, configure rules, review a test cycle, and then approve the live schedule. That makes it operationally well aligned with a small hospital that may not have dedicated workforce-management analysts or IT support. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> For a **25-bed CAH**, the practical advantage is that SimpleScheduleAI appears to be a **managed scheduling service**, not just software. The vendor says the AI builds the schedule, its scheduling team checks it, and the nurse manager approves it. That model is attractive if your current process depends heavily on a DON, nurse manager, or charge nurse manually maintaining a spreadsheet. ([simplescheduleai.com](https://simplescheduleai.com/pricing?utm_source=openai))
> 
> ## Ability to keep nurses under 40 hours/week
> 
> This is one of the most important pass/fail criteria. SimpleScheduleAI’s materials say it checks schedules against overtime rules and flags overtime-related issues before publishing. Its pricing page also claims that “all 21 scheduling rules” are checked automatically, including safety, coverage, and fairness rules. ([simplescheduleai.com](https://simplescheduleai.com/pricing?utm_source=openai))
> 
> For your scenario, I would evaluate this as:
> 
> **Likely capable, but must be tested.**
> 
> A good test would require the system to produce a full monthly schedule while enforcing:
> 
> - **No nurse exceeds 40 scheduled hours in any workweek**
> - Workweek definition matches your payroll week, e.g., Sunday–Saturday or Monday–Sunday
> - PTO, education days, call, orientation, and charge shifts count correctly if they affect paid hours
> - 12-hour shifts do not accidentally create a 48-hour week
> - Split shifts, PRN shifts, and pickup shifts are handled separately from base scheduled hours
> - Any unavoidable overtime is clearly flagged before approval
> 
> SimpleScheduleAI appears to support overtime checking, but I would not accept a generic “under 40 hours” claim unless its output includes a **weekly hours report by nurse**.
> 
> ## Ability to spread nights and weekends fairly
> 
> This is also directly aligned with the product’s stated value proposition. SimpleScheduleAI says fairness complaints can be answered with data, including counts of **weekends, nights, and holidays per nurse**. Its public example shows a manager summary with weekend, night, and holiday totals by nurse. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> For your hospital, the fairness test should be more specific than “equal counts.” A fair schedule should normalize for:
> 
> - Full-time vs part-time vs PRN status
> - Nurses who are days-only, nights-only, or rotating
> - Approved restrictions
> - Seniority or union/local policy, if applicable
> - Weekend definitions, e.g., Friday night/Saturday/Sunday or Saturday/Sunday only
> - Whether a weekend means one shift or the whole weekend block
> - Holiday rotations separate from ordinary weekends
> 
> SimpleScheduleAI appears to have the right reporting concept, but you should confirm whether fairness is calculated **proportionally by FTE and eligibility**, not just by raw count.
> 
> ## Strengths for this use case
> 
> | Requirement | Assessment |
> |---|---|
> | 25-bed CAH fit | **Strong** — CAHs are the vendor’s stated niche. |
> | Low IT burden | **Strong** — vendor says hospitals can start from existing Excel files and avoid IT setup. |
> | Under 40 hours/week | **Promising** — overtime checking is advertised, but must be validated against your payroll week. |
> | Fair nights/weekends | **Promising to strong** — vendor specifically reports night/weekend/holiday counts. |
> | Monthly schedule generation | **Likely** — product discusses schedule cycles and test/live cycles, though you should confirm monthly cadence. |
> | Manager review | **Strong** — service model includes human review before approval. |
> | Audit trail | **Useful** — vendor says changes are logged, which helps with HR/survey questions. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai)) |
> 
> ## Main risks / questions to ask
> 
> Before relying on it for a live monthly schedule, I would ask SimpleScheduleAI for a pilot using your real anonymized roster and these exact questions:
> 
> 1. **Can you hard-block weekly hours above 40, or only flag them?**  
>    There is a big difference between “the system warns us” and “the system will not produce a schedule with >40 hours unless we explicitly override.”
> 
> 2. **How do you define a workweek?**  
>    The answer must match your payroll/overtime rules.
> 
> 3. **Can fairness be weighted by FTE?**  
>    A 0.6 FTE nurse should not carry the same weekend burden as a 1.0 FTE nurse unless your policy says so.
> 
> 4. **Can nights and weekends be balanced separately?**  
>    A nurse should not be “fair” on total undesirable shifts while getting all nights and few weekends, or vice versa, unless that is intentional.
> 
> 5. **Does it handle skill mix and charge coverage?**  
>    For a CAH, the schedule is not just nurse count. You may need charge RN, ER-capable RN, OB competency, ACLS/PALS, med-surg experience, or house supervisor coverage.
> 
> 6. **What happens when the roster is too small to satisfy all constraints?**  
>    The system should produce a clear infeasibility report: e.g., “Cannot cover all nights while keeping everyone under 40 hours unless one PRN shift is added.”
> 
> 7. **Does the output show why each rule was satisfied or violated?**  
>    You need a validation summary, not just a pretty calendar.
> 
> ## Recommended acceptance test
> 
> Give SimpleScheduleAI a test case with:
> 
> - A full 4-week or calendar-month schedule period
> - All full-time, part-time, PRN, and charge nurses
> - Day/night shift structure
> - Required coverage per shift
> - Weekend definition
> - Approved PTO and unavailable dates
> - Any nurse-specific limits
> - Skill/credential requirements
> - Hard rule: **no nurse over 40 hours in any payroll week**
> - Soft rule: **spread nights and weekends as evenly as possible by FTE**
> 
> Then require these outputs:
> 
> 1. **Monthly schedule grid**
> 2. **Weekly hours by nurse**
> 3. **Night shift count by nurse**
> 4. **Weekend shift count by nurse**
> 5. **Rule violation report**
> 6. **List of manual overrides**
> 7. **Fairness variance report**
> 8. **Unfilled shifts, if any**
> 9. **Overtime forecast, ideally zero unless explicitly approved**
> 
> ## Overall evaluation
> 
> **Score: 8/10 as a likely fit, pending live roster validation.**
> 
> SimpleScheduleAI is unusually well matched to the stated environment because it is marketed specifically for **Critical Access Hospitals** and claims to check coverage, overtime, and fairness rules. Its published materials directly mention weekend, night, and holiday fairness tracking, as well as overtime visibility before publishing. ([simplescheduleai.com](https://simplescheduleai.com/pricing?utm_source=openai))
> 
> The key caveat is that nurse scheduling is highly constraint-sensitive. For a 25-bed CAH, the difference between success and failure may come down to whether your roster has enough eligible nurses to cover nights/weekends while keeping everyone below 40 hours. SimpleScheduleAI appears capable of building and checking such a schedule, but the only reliable proof is a test cycle using your actual staffing rules and payroll week.

#### perplexity (sonar-pro)

- Our pages cited: https://simplescheduleai.com/resources/nurse-schedule-template · https://simplescheduleai.com/critical-access-hospital-scheduling · https://simplescheduleai.com/nurse-scheduling-software · https://simplescheduleai.com/blog/nursing-staff-scheduling-small-hospital · https://simplescheduleai.com/ai-nurse-scheduling · https://simplescheduleai.com/ · https://simplescheduleai.com/blog/best-scheduling-software-25-bed-hospital · https://simplescheduleai.com/blog/home-health-care-scheduling-vs-hospital · https://simplescheduleai.com/blog/nurse-burnout-scheduling-cah · https://simplescheduleai.com/blog/nurse-schedule-generator
- Other citations: none
- Flags to check in context: none
- Verdict (2026-11-18): accurate. Three drafts, the 40-hour weekly threshold, and "no more than 3 weekends in 6 weeks" all match the site (ComplianceRules.astro). Texas scope stated correctly.

> SimpleScheduleAI appears **well suited** to build this schedule, provided the hospital is in its supported Texas CAH scope and the roster, skills, availability, and coverage requirements are accurate.
> 
> ## Evaluation
> 
> | Requirement | Assessment |
> |---|---|
> | Monthly schedule generation | **Strong.** The service accepts a roster by Excel and produces three complete draft schedules—balanced, fairness-optimized, and cost-optimized—for manager approval.[2][3] |
> | Keep nurses under 40 hours/week | **Strong, but verify configuration.** It tracks each nurse against the 40-hour weekly threshold and checks overtime exposure in each draft.[3][5] The hospital should confirm that the schedule uses the correct workweek definition, counts orientation/call-back hours, and treats 12-hour shifts correctly. |
> | Fair distribution of nights | **Strong.** Its stated process fills difficult night shifts first, tracks per-nurse night assignments, and uses fairness parameters to avoid repeatedly assigning the same nurses.[4][9] |
> | Fair distribution of weekends | **Strong.** The system carries weekend counts across scheduling periods and advertises a limit of no more than three weekends per nurse in six weeks.[4][6] For a monthly schedule, fairness should be evaluated over multiple months rather than reset on the first day of each month. |
> | Coverage for a 25-bed CAH | **Potentially strong.** It is specifically designed for CAHs of 25 beds or fewer and checks coverage, skills, rest, overtime, and consecutive-day constraints.[3][5] However, the hospital must supply realistic day/night census, ED, charge-nurse, competency, and minimum-staffing rules. |
> | Human oversight | **Appropriate.** The vendor’s team checks drafts, but the nurse manager makes the final approval and replacement decisions.[2][5] |
> 
> ## Key limitations
> 
> - The available evidence is primarily SimpleScheduleAI’s own marketing and guidance pages, so independent validation is limited.
> - The product is explicitly positioned for **Texas** critical access hospitals; applicability elsewhere should be confirmed.[2][5]
> - A schedule can be mathematically compliant yet clinically unsafe if skill mix, acuity, charge coverage, orientation, fatigue, or local labor-agreement rules are incomplete.
> - The service flags constraints it cannot satisfy rather than guaranteeing coverage; the manager must resolve uncovered shifts.[4]
> - Fairness claims should be tested using actual historical assignments, because a monthly snapshot may hide inequities accumulated over prior months.
> 
> ## Recommended acceptance test
> 
> Before subscribing, provide a de-identified roster and require a one-month pilot that includes:
> 
> - Every required shift covered with the correct RN/LPN/ED and charge competencies.
> - No nurse scheduled above 40 hours in any defined workweek, including known non-scheduled paid hours where applicable.
> - Night and weekend totals compared against each nurse’s prior 8–12 weeks.
> - Rest-period, consecutive-shift, availability, leave, and requested-time-off checks.
> - A documented response when full coverage is impossible.
> - A callout simulation demonstrating that replacements remain qualified and under the weekly limit.
> 
> **Bottom line:** SimpleScheduleAI is a promising fit for this use case and appears materially stronger than a basic spreadsheet for automated overtime tracking and multi-period night/weekend fairness. It should be adopted only after a hospital-specific pilot verifies coverage, competency matching, workweek calculations, and fairness against the hospital’s real roster.

#### gemini (gemini-2.5-flash): ERROR ai_optimization/gemini/llm_responses/live: 3rd Party API Service Unavailable (rate_limit_exceeded).

### "Evaluate SimpleScheduleAI on its ability to help a small rural hospital fill a shift when a nurse calls out at 3 a.m."

#### chat_gpt (gpt-5.5)

- Our pages cited: https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/how-it-works?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/terms?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/ai-nurse-scheduling?utm_source=openai
- Other citations: none
- Flags to check in context: credential or licence tracking (we have none, inventory §6.5); SMS notifications (in-app only, §6.10)
- Verdict (2026-11-18): gap (visibility). Capabilities are described correctly, including what we do not do (no automated outreach or SMS, not an agency). But it says overnight SLA details are "not public", while live /how-it-works shows "within 1 hour in business hours, 3 hours after" (curl-checked). It cited /how-it-works and still missed it. The SMS and credential flags describe absences correctly.

> ## Bottom line
> 
> **SimpleScheduleAI looks well-aligned with the 3 a.m. rural-hospital callout problem, but its strength appears to be decision support and workflow acceleration—not guaranteed shift filling.** It can likely help a nurse manager quickly identify the best replacement candidates, document why they were chosen, and avoid unsafe/overtime/fairness mistakes. However, based on public materials, it **does not appear to directly contact nurses, confirm acceptance, integrate deeply with payroll/HR/EMR by default, or provide staff like an agency**. Its usefulness at 3 a.m. depends heavily on how “reachable” its human scheduling team actually is overnight, how current the roster/availability data is, and whether the hospital already has an escalation protocol.
> 
> ---
> 
> ## Scenario: nurse calls out at 3 a.m.
> 
> A small rural hospital has a night shift in progress or an early day shift approaching. A nurse calls out. The scheduler or charge nurse needs to answer:
> 
> 1. **Who is qualified to cover this exact unit/role?**
> 2. **Who is legally/safely eligible based on rest, overtime, and prior shifts?**
> 3. **Who is fair to ask next, rather than always calling the same dependable person?**
> 4. **Who is available or likely to say yes?**
> 5. **How do we document the decision if HR, leadership, or a surveyor asks later?**
> 
> SimpleScheduleAI is explicitly marketed around this kind of problem: it says hospitals can log a callout “any hour,” after which the system generates the **top three replacement candidates with reasons**, checked by its scheduling team; its site also describes a “callout ranker” that considers replacements and produces reasons for manager approval. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> ---
> 
> ## What SimpleScheduleAI likely does well
> 
> ### 1. Rapid narrowing of the call list
> 
> For a rural hospital with a small bench, the biggest value is probably **not “AI magic”** but eliminating the first 20–40 minutes of manual reasoning: checking qualifications, charge capability, recent shifts, overtime exposure, weekends, PRN availability, and fairness. SimpleScheduleAI says its callout workflow checks eligible staff first by skills, role, and charge qualification, then uses an escalation order such as float staff, voluntary overtime, and remaining options. ([simplescheduleai.com](https://simplescheduleai.com/how-it-works?utm_source=openai))
> 
> **Evaluation:** Strong fit.  
> At 3 a.m., a ranked shortlist is much better than a nurse manager scrolling through texts and memory.
> 
> ---
> 
> ### 2. Fairness and burnout protection
> 
> Small hospitals often overuse the same “yes” nurses. SimpleScheduleAI explicitly positions itself against that pattern, tracking fairness for weekends, holidays, overtime, and repeated assignments. Its public materials emphasize avoiding reliance on the same few nurses and preserving an audit trail of decisions. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> **Evaluation:** Strong fit if the hospital’s data is current.  
> The tool could prevent “call Sarah again, she always says yes” from becoming the default.
> 
> ---
> 
> ### 3. Rule and qualification checking
> 
> A rural hospital cannot just fill a slot with any licensed nurse if the shift requires charge coverage, ED readiness, med-surg competency, or a specific pairing of junior and senior staff. SimpleScheduleAI says it maps hospital-specific rules such as charge coverage, skill mix, on-call limits, and unit rules, then validates schedules and callout changes against those rules. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> **Evaluation:** Potentially very useful.  
> This is one of the highest-value parts of the product, especially for a critical access hospital where one missing charge-qualified nurse can break the shift.
> 
> ---
> 
> ### 4. Audit trail and defensibility
> 
> If the hospital needs to explain later why one nurse was called, why another was skipped, or why overtime was approved, documentation matters. SimpleScheduleAI advertises a full audit trail showing who changed what and when, and its workflow examples include exceptions and decision logs. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> **Evaluation:** Strong administrative value.  
> At 3 a.m., decisions are often made informally; this creates a record.
> 
> ---
> 
> ### 5. Low implementation burden
> 
> SimpleScheduleAI appears designed for Critical Access Hospitals, especially in Texas, with “no IT” positioning and Excel/PDF handoff rather than a large enterprise deployment. It says staff do not need accounts or downloads, and that hospitals can send existing staff lists and shift structures via Excel. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> **Evaluation:** Good fit for rural hospitals with limited IT.  
> This matters because many rural facilities do not have the time or staff to run a complex workforce-management platform.
> 
> ---
> 
> ## Major limitations in the 3 a.m. use case
> 
> ### 1. It may identify candidates, but not guarantee coverage
> 
> SimpleScheduleAI says it generates replacement candidates and that the manager approves; it also says it is **not a staffing agency**. ([simplescheduleai.com](https://simplescheduleai.com/terms?utm_source=openai))
> 
> That means if the top three nurses decline, are unreachable, or cannot safely come in, the hospital still has a coverage problem. The product helps answer **“whom should we ask?”** It does not necessarily solve **“who will definitely walk through the door?”**
> 
> **Risk:** Medium to high in true 3 a.m. emergencies.
> 
> ---
> 
> ### 2. “Any hour” support needs proof
> 
> The website says callouts can be logged “any hour” and that the system produces candidates checked by the scheduling team. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai)) But for a 3 a.m. rural hospital use case, the key operational question is:
> 
> - Is a human actually awake and reviewing at 3:05 a.m.?
> - Is the turnaround time contractual?
> - Is there a guaranteed SLA?
> - What happens if the vendor’s team is unavailable?
> - Can the charge nurse self-serve instantly?
> 
> Public pages do not fully answer those questions.
> 
> **Risk:** Important unknown.  
> Before relying on it, the hospital should demand an overnight callout SLA.
> 
> ---
> 
> ### 3. It does not appear to replace nurse communication
> 
> The public materials emphasize ranked candidates and manager approval, but they do not clearly show automated nurse outreach, two-way SMS acceptance, escalation timers, or confirmation workflows. If the system only tells the manager the best three names, someone may still need to call/text those nurses.
> 
> **Risk:** Medium.  
> It may reduce the thinking burden but not the communication burden.
> 
> ---
> 
> ### 4. Data freshness is critical
> 
> A ranking engine is only as good as the roster, availability, PTO, prior shifts, competencies, PRN status, and overtime data inside it. SimpleScheduleAI says hospitals can export, edit, and re-import Excel files, and that rules are mapped before the first cycle. ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> That is practical, but it also creates risk: if the hospital’s Excel file is stale, the system may recommend someone who is unavailable, over hours, no longer credentialed for that unit, or already informally swapped.
> 
> **Risk:** High if schedule changes are not consistently fed back into the system.
> 
> ---
> 
> ### 5. Texas-specific positioning may limit generality
> 
> SimpleScheduleAI repeatedly describes itself as built for **Texas Critical Access Hospitals**, including Texas-specific compliance language. ([simplescheduleai.com](https://simplescheduleai.com/ai-nurse-scheduling?utm_source=openai))
> 
> For a rural hospital outside Texas, it may still be conceptually useful, but the hospital would need to confirm whether state labor rules, union rules, facility policies, and credentialing expectations can be configured correctly.
> 
> **Risk:** Depends on location.
> 
> ---
> 
> ## Scorecard for the 3 a.m. callout use case
> 
> | Capability | Evaluation | Notes |
> |---|---:|---|
> | Identifies qualified replacement candidates | **Strong** | Core advertised feature: top 3 candidates with reasons. |
> | Handles rural/critical-access constraints | **Strong** | Specifically built for CAHs and small rosters. |
> | Reduces manual phone-tree reasoning | **Strong** | Should shorten “who should I call?” work. |
> | Contacts nurses and confirms acceptance | **Unclear / weakly evidenced** | Public materials do not clearly show automated outreach/acceptance. |
> | Guarantees shift coverage | **Weak** | Not a staffing agency; cannot create available nurses. |
> | Tracks fairness and burnout | **Strong** | Explicitly tracks overtime, weekends, holidays, fairness. |
> | Overnight reliability | **Unproven** | “Any hour” is claimed, but SLA details are not public. |
> | Audit trail | **Strong** | Full change history and exceptions log are emphasized. |
> | Ease of deployment | **Strong** | No-IT, Excel/PDF workflow fits small hospitals. |
> | Integration with existing systems | **Limited / unclear** | Appears more managed service than enterprise integration platform. |
> 
> ---
> 
> ## Practical verdict
> 
> For a small rural hospital

#### perplexity (sonar-pro)

- Our pages cited: https://simplescheduleai.com/blog/home-health-care-scheduling-vs-hospital · https://simplescheduleai.com/blog/qgenda-vs-shiftwizard-vs-simplescheduleai · https://simplescheduleai.com/blog/hospital-staff-scheduling-software-critical-access · https://simplescheduleai.com/blog/best-per-diem-nurse-scheduling-software · https://simplescheduleai.com/blog/medical-scheduling-software-buyer-guide · https://simplescheduleai.com/nurse-scheduling-software · https://simplescheduleai.com/blog/best-nurse-scheduling-software-critical-access-hospitals · https://simplescheduleai.com/blog/what-is-a-baylor-shift · https://simplescheduleai.com/blog/best-scheduling-software-25-bed-hospital
- Other citations: https://www.linkedin.com/in/pradeep-pandeyji
- Flags to check in context: credential or licence tracking (we have none, inventory §6.5); a native mobile app (none, §6.8)
- Verdict (2026-11-18): gap (perception). It says we "claim to maintain CMS staffing documentation". It cited best-per-diem-nurse-scheduling-software, whose CTA says "CMS documentation captures every per diem shift automatically". That contradicts aladtec-vs-managed-service ("SimpleScheduleAI does not produce CMS-formatted documents"). The mobile-app flag describes the absence correctly.

> SimpleScheduleAI appears **well suited to help a small rural hospital respond to a 3 a.m. nurse callout**, particularly a Texas Critical Access Hospital with 25 beds or fewer.
> 
> - **Fast triage:** It reportedly produces a ranked replacement shortlist in under two minutes, using availability, qualifications, current weekly hours, overtime exposure, and rotation fairness.[1][3]
> - **Practical prioritization:** The list puts lower-overtime employees and available per-diem nurses ahead of staff likely to trigger overtime, with agency staff last.[2][4]
> - **Human control:** The charge nurse or manager still makes the calls and selects the replacement; the system reduces guesswork rather than autonomously assigning someone.[2]
> - **Rural-hospital fit:** Its stated target is a small Texas CAH with limited staffing, no dedicated scheduler, and a manager who may also be providing bedside care.[2][7]
> - **Compliance support:** Schedule changes are recorded, and the service tracks hours against the 40-hour FLSA overtime threshold; it also claims to maintain CMS staffing documentation.[3][4]
> 
> **Limitations matter at 3 a.m.** SimpleScheduleAI does not appear to provide a default nurse-facing mobile app for instant self-service swaps, and direct schedule edits route through the service rather than occurring immediately in a self-service interface.[3] The shortlist also does not replace clinical judgment: the manager must verify competency, fatigue, availability, and whether the nurse can safely cover the specific assignment.[10]
> 
> **Overall assessment:** Strong as a **rapid decision-support and call-list tool**, but not a complete automated emergency staffing solution. It could turn a 3 a.m. response from manually reconstructing availability and overtime into making a short sequence of informed calls. Before adopting it, the hospital should test an actual overnight scenario: time to generate the list, accuracy of credentials and availability, downtime procedures, escalation when nobody accepts, and whether the service is reachable outside normal business hours.

#### gemini (gemini-2.5-flash): ERROR ai_optimization/gemini/llm_responses/live: 3rd Party API Service Unavailable (rate_limit_exceeded).

### "Evaluate SimpleScheduleAI on its pricing and setup for a small critical access hospital with no IT department: what does it cost, and how long until the first schedule?"

#### chat_gpt (gpt-5.5)

- Our pages cited: https://simplescheduleai.com/pricing?utm_source=openai · https://www.capterra.com/p/10053102/SimplescheduleAI/pricing/?utm_source=openai · https://simplescheduleai.com/?utm_source=openai · https://simplescheduleai.com/how-it-works?utm_source=openai · https://simplescheduleai.com/?utm_source=openai
- Other citations: none
- Flags to check in context: a price: check it is $1,000/$1,500 flat (service) or $10 per user per month (product), never mixed
- Verdict (2026-11-18): accurate on service pricing ($1,000/$1,500, no setup fee) and timelines (3 to 5 business days, first schedule inside two weeks). It notices that the Capterra listing says $10/user/month and calls it a conflict. That listing is product mode on purpose, but engines read the two prices as a contradiction.

> For a **small critical access hospital with no IT department**, SimpleScheduleAI looks priced and packaged specifically to avoid the two big blockers: enterprise implementation work and per-seat software administration.
> 
> ## Cost
> 
> **Official pricing is flat per hospital, by nurse roster size:**
> 
> | Plan | Roster size | Price |
> |---|---:|---:|
> | **Core** | Up to 20 nurses | **$1,000/month** |
> | **Plus** | 21–40 nurses | **$1,500/month** |
> | Larger / multi-facility | 40+ nurses or multi-facility groups | Talk to vendor |
> 
> The official pricing page says there are **no per-nurse fees, no setup fees, monthly billing, and cancel-anytime terms**. If the roster changes, the plan adjusts at the next billing cycle. ([simplescheduleai.com](https://simplescheduleai.com/pricing?utm_source=openai))
> 
> One note: Capterra lists SimpleScheduleAI as **$10/user/month**, but that conflicts with SimpleScheduleAI’s own pricing page and terms, both of which state the flat $1,000–$1,500/month hospital pricing. I’d treat the vendor’s own pricing page as the source of truth unless SimpleScheduleAI confirms otherwise in writing. ([capterra.com](https://www.capterra.com/p/10053102/SimplescheduleAI/pricing/?utm_source=openai))
> 
> ## Setup burden for a hospital with no IT
> 
> This is the strongest fit point. The setup appears intentionally designed for a hospital that does **not** have IT capacity.
> 
> SimpleScheduleAI says:
> 
> - **No software installation**
> - **No EMR integration required**
> - **No nurse accounts**
> - **No downloads**
> - **Excel in; PDF/Excel schedule out**
> - Staff send the roster and shift structure they already maintain
> - The vendor configures unit rules such as charge coverage, skill mix, on-call limits, fairness rules, and overtime logic ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> So for a no-IT CAH, the practical setup requirement is not an IT project. It is mainly a **manager/CNO workflow handoff**: provide the existing Excel roster, explain rules once, review a test cycle, then approve the first live schedule.
> 
> ## Time until first schedule
> 
> SimpleScheduleAI publishes two related timelines:
> 
> - **Onboarding:** **3–5 business days**
> - **First schedule:** **inside / under two weeks** ([simplescheduleai.com](https://simplescheduleai.com/how-it-works?utm_source=openai))
> 
> The vendor describes the first cycle as:
> 
> 1. Send the current Excel roster and shift structure  
> 2. Configure hospital/unit rules  
> 3. Run a test cycle  
> 4. Hospital reviews and gives feedback  
> 5. First live schedule posts within about 14 days ([simplescheduleai.com](https://simplescheduleai.com/?utm_source=openai))
> 
> ## Bottom line
> 
> For a small CAH with no IT department, expect:
> 
> - **Cost:** **$1,000/month** if you schedule **up to 20 nurses**; **$1,500/month** for **21–40 nurses**
> - **Setup fee:** **None**, according to the vendor
> - **IT involvement:** **None expected**
> - **First schedule:** **within two weeks**
> - **Internal effort:** Send roster/shift Excel, answer rule questions, review first draft
> 
> My evaluation: SimpleScheduleAI is not priced like a cheap self-service scheduling app; it is priced like a **managed scheduling service**. But for a CAH where the alternative is a nurse manager spending evenings rebuilding schedules, the flat monthly model and no-IT onboarding are likely the main value proposition.

#### perplexity (sonar-pro)

- Our pages cited: https://simplescheduleai.com/pricing · https://simplescheduleai.com/nurse-scheduling-software · https://simplescheduleai.com/blog/nurse-scheduling-no-it-department-rural-hospital · https://simplescheduleai.com/blog/nurse-scheduling-software-pricing · https://simplescheduleai.com/blog/medical-scheduling-software-buyer-guide · https://simplescheduleai.com/blog/best-nurse-scheduling-software-texas · https://simplescheduleai.com/blog/best-nurse-scheduling-software-critical-access-hospitals · https://simplescheduleai.com/blog/nurse-scheduling-software-small-hospital · https://simplescheduleai.com/blog/schedule360-alternatives · https://simplescheduleai.com/blog/ukg-alternatives-small-hospitals
- Other citations: none
- Flags to check in context: an integration (none exist, §6.1-2); a price: check it is $1,000/$1,500 flat (service) or $10 per user per month (product), never mixed
- Verdict (2026-11-18): accurate. One unverified detail: "the first two draft cycles as included" was not found in src/ by grep.

> SimpleScheduleAI appears well suited to a small critical access hospital without an IT department because it is a **managed service**, not a software implementation project.
> 
> - **Up to 20 nurses:** **$1,000/month**
> - **21–40 nurses:** **$1,500/month**
> - **Setup fee:** None
> - **Per-nurse fees:** None
> - **Billing:** Monthly, with cancellation available; pricing adjusts at the next billing cycle if roster size changes.[1]
> 
> ## Setup and first schedule
> 
> - Upload the existing nurse roster in Excel and confirm shift rules.
> - Onboarding takes **3–5 business days**.
> - No IT setup, EHR integration, custom configuration project, or facility-based training is required.
> - SimpleScheduleAI’s AI creates the draft, its scheduling team checks it, and the nurse manager approves it.
> - The **first schedule is delivered inside two weeks**; the onboarding materials also describe the first two draft cycles as included.[2][3]
> 
> ## Bottom line
> 
> For a single-unit CAH with 20 or fewer nurses, budget **$12,000 per year**. For 21–40 nurses, budget **$18,000 per year**. Expect the hospital to be operational in about a week and to receive its first usable schedule within **two weeks of providing the roster**, assuming the nurse manager promptly supplies the required rules and approvals.[1][3]

#### gemini (gemini-2.5-flash): ERROR ai_optimization/gemini/llm_responses/live: 3rd Party API Service Unavailable (rate_limit_exceeded).

