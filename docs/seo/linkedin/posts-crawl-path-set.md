# LinkedIn posts — crawl-path set (4 drafts, awaiting founder edit)

- Publish under: Pradeep Pandey personal profile (https://www.linkedin.com/in/pradeep-pandeyji/)
- Status: **full drafts written 2026-08-20**, below each outline. Founder to edit
  before posting. The outlines are kept above each draft so the intent stays
  visible while editing.
- Founder posting schedule (set 2026-08-20): one on Fri Aug 21, one Tue Aug 25,
  one Wed Aug 26. Post 4 should go first, it is the priority test.
- These are short POSTS, not the long-form Articles in `article-1/2/3` in this folder.

## Why these four, and why now

A full 108-URL GSC sweep on 2026-08-18 found 11 live posts unindexed by Google.
Four of them Google has **never fetched at all** ("Discovered - currently not
indexed", `last_crawled: null`). Every internal-linking remedy has now been
tried and measured: zero-inbound fixed in June, counts raised, pillar links
added 2026-08-18. It did not move them. The proof is
`managed-service-vs-scheduling-software`, which carries **18 inbound internal
links, 17 from live posts, and Google has still never fetched it once.**

LinkedIn is crawled constantly. A post linking to one of these gives Google an
**external discovery path** the page does not currently have. All four are
already crawled by Bing, so this is aimed at Google specifically.

**Set expectations honestly.** LinkedIn outbound links are nofollow. This passes
no authority and is not a ranking play. The only hypothesis being tested is
whether an external crawl path gets a never-fetched page fetched. If all four
are still unfetched after ~3 weeks, the hypothesis is dead and the answer is
backlinks, full stop.

## The mechanic that makes this work

Per the tactic reviewed 2026-08-18 (Jesper Nissen, verified in part):

- Google builds the SERP title from the **opening words of the post body**. So
  the first line is the title. Put the target phrase there and nothing else.
- Use the post's **"Copy link to post"** (three dots, upper right) to get the
  canonical indexable `/posts/` URL, not a feed URL.
- Post from the **personal profile**, not the company page.
- **Do not paste the blog post.** A near-duplicate helps nobody. Write a short,
  genuinely different take and link the full piece once.

Unverified detail: the claim that Google uses "the first 6 to 12 words" is
roughly right but spuriously precise. LinkedIn truncates by characters, not word
count. Treat "front-load the phrase" as the rule.

## Post 1 — how AI builds a schedule

- **Target:** `/blog/how-ai-builds-a-nurse-schedule`
- **First line (becomes the title):** How AI actually builds a nurse schedule, step by step
- **Angle:** Demystify. Most people picture a black box. It is a sequence of
  ordinary decisions made in an order.
- **Body:** name the sequence in plain words — read the roster, apply the hard
  requirements, fill the hardest shifts first, then balance the rest. One
  sentence on why fill ORDER matters: weekend and charge shifts get filled first
  because filling in date order leaves the same people short of hours.
- **Close:** the manager still approves. Nothing posts without a human.
- **Link:** the blog post, once, in the body.

### DRAFT

> How AI actually builds a nurse schedule, step by step.
>
> Most people picture a black box. It is closer to a checklist run in a
> particular order.
>
> First it reads the roster. Who is available, who is cleared for what, who has
> time off booked, who is close to overtime.
>
> Then it fills the hardest shifts first. Not Monday, then Tuesday, then
> Wednesday. Nights, weekends and the shifts only a few people can cover.
>
> That order is the part people miss, and it is the whole trick. Fill a schedule
> in date order and you spend your flexible people early. By the time you reach
> the shifts almost nobody can work, you have nobody left who can work them. So
> you call someone on their day off.
>
> Then it balances what is left, so the same three names are not carrying every
> weekend.
>
> A human reads the draft before your nurse manager ever sees it, and your nurse
> manager approves it before anyone works it. Nothing posts on its own.
>
> Full walkthrough of the sequence here:
> https://simplescheduleai.com/blog/how-ai-builds-a-nurse-schedule

**Notes for editing:** the fill-order paragraph is the one worth keeping. It is
the only part a reader will not have seen in a generic AI post. Cut elsewhere
before cutting that.

## Post 2 — is it safe

- **Target:** `/blog/is-ai-nurse-scheduling-safe`
- **First line:** Is AI nurse scheduling safe for a small hospital
- **Angle:** answer the question a DON actually asks before a demo.
- **Body:** separate the two fears people conflate — will it make a clinically
  unsafe assignment, and will it hold up in a survey. Say what oversight exists:
  the draft is checked before anyone sees it, the manager approves, and the
  record of what changed is kept.
- **Close:** the honest boundary. It does not decide who is qualified. Your
  roster does.
- **Link:** the blog post, once.

### DRAFT

> Is AI nurse scheduling safe for a small hospital?
>
> When a director of nursing asks me this, two different worries are usually
> bundled into one question. They are worth separating, because they have
> different answers.
>
> The first is clinical. Will it put someone on a shift they should not be on?
>
> It cannot, because it is not making that judgment. It only knows what your
> roster tells it. If your roster says a nurse is cleared for charge, it treats
> them as cleared for charge. It is not assessing anybody. That call was already
> made by your nursing leadership, and the schedule just respects it.
>
> The second worry is the survey. Will this hold up when someone asks how a shift
> got staffed?
>
> That one is really a record-keeping question. Every change gets logged with a
> timestamp, so the answer to "who changed this and when" exists without anyone
> reconstructing it from memory in survey week.
>
> The honest boundary: it does not decide who is qualified for anything. It has
> no opinion about your people. It arranges the shifts around the rules you
> already have.
>
> Longer answer, including what to ask a vendor:
> https://simplescheduleai.com/blog/is-ai-nurse-scheduling-safe

**Notes for editing:** "when a director of nursing asks me this" is the only
first-person claim in the set. Keep it only if it is true of real conversations
you have had. If not, change to "the question I get asked most is" or cut the
line. Do not let it imply customers.

## Post 3 — Aladtec comparison

- **Target:** `/blog/aladtec-vs-managed-service`
- **First line:** Aladtec vs a managed scheduling service for a small hospital
- **Angle:** a category question, not a takedown.
- **CAUTION, read before writing.** Competitor content on a personal profile is
  higher-risk than on our own blog. Load `.claude/skills/competitor-reviews.md`
  and use `docs/seo/competitor-dossier.md` wording. No unverified negatives, no
  reviewer quotes without name, role, date and source. Neutral framing only:
  what each model asks the hospital to operate.
- **Body:** the real fork is who runs it. Software means someone at the hospital
  configures and maintains it. A service means that work sits outside.
- **Close:** which fits depends on whether you have anyone to run it.
- **Link:** the blog post, once.

### DRAFT

> Aladtec vs a managed scheduling service for a small hospital.
>
> This gets framed as a product comparison. It is not really one. They are two
> different purchases, and the feature lists are not where the decision sits.
>
> Aladtec is scheduling software. It came out of public safety, fire and EMS,
> and it is genuinely good at 24/7 rotating coverage. You license it and your
> hospital runs it.
>
> A managed service is the other model. The scheduling work sits outside the
> hospital and you get a finished schedule to approve.
>
> So the question is not which has more features. It is who at your hospital
> configures the rules, keeps them current as staff change, and rebuilds the
> schedule every cycle a year from now.
>
> If you have that person and they want the job, software is the cheaper answer
> and you should buy software.
>
> If the honest answer is that it lands on the nurse manager who is also taking
> clinical shifts, more features will not fix that. A better tool still needs an
> operator.
>
> Comparison here, written to be useful whichever way you go:
> https://simplescheduleai.com/blog/aladtec-vs-managed-service

**Notes for editing:** deliberately carries no ratings, no reviewer quotes and no
criticism of Aladtec. The "genuinely good at 24/7 rotating coverage" line is
accurate and should stay; it is what keeps this from reading as a hit piece on a
personal profile. If you want it shorter, cut the two if/then paragraphs to one.

## Post 4 — software vs service

- **Target:** `/blog/managed-service-vs-scheduling-software`
- **First line:** Scheduling software vs a managed service for critical access hospitals
- **Priority: HIGHEST of the four.** This is the 18-inbound-link page Google has
  never fetched, so it is the cleanest test of whether an external path works
  where internal links completely failed.
- **Angle:** the buying decision most CAHs get wrong because they compare
  features across two things that are not the same purchase.
- **Body:** software is a tool you operate; a service is an outcome delivered.
  Comparing feature lists across them is a category error. The question to ask
  instead is who does the work every cycle.
- **Close:** the honest one, a service costs more per month and is wrong for a
  hospital that wants to run its own tool.
- **Link:** the blog post, once.

### DRAFT

> Scheduling software vs a managed service for critical access hospitals.
>
> Most small hospitals evaluate these side by side on a feature grid. That is
> the wrong grid, because they are not the same kind of purchase.
>
> Software is a tool you operate. You buy capability, and then someone at your
> hospital turns that capability into a schedule every cycle.
>
> A service is an outcome delivered. The work happens outside the building and
> you approve the result.
>
> Put those in the same comparison table and software wins every row, because
> the table is measuring features and one of the two options is not selling
> features. It is selling the work being done.
>
> The question that actually separates them: who builds the schedule in week
> six, after the setup help ends and the vendor calls stop?
>
> If your hospital has someone whose job that is, buy software. It is cheaper and
> you will get more control.
>
> And the honest half nobody puts in their own marketing: a service costs more
> per month than a licence, and it is the wrong choice for a hospital that wants
> to run its own tool. If you want the control, you should have the control.
>
> The full breakdown:
> https://simplescheduleai.com/blog/managed-service-vs-scheduling-software

**Notes for editing:** POST THIS ONE FIRST. It is the 18-inbound-link page Google
has never fetched, so it is the cleanest test in the set. The last paragraph is
the one that earns the post a reading; resist cutting it for length. Note the
post uses "managed service" as the CATEGORY term, which is allowed, and never as
our self-label.

## Before posting

- Run the pre-publish checklist's **PLAIN LANGUAGE SWEEP** over each. It applies
  to outbound copy, not just posts (see `docs/seo/backlinks-playbook.md` 8e).
- No em/en-dashes, no AI-tone vocabulary.
- Self-label "AI-native nurse scheduling service", never "managed service", even
  though posts 3 and 4 use "managed service" as the CATEGORY term. That
  distinction is live in the positioning registry.
- Zero customer, pilot or outcome claims. We are pre-launch.

## After posting

1. "Copy link to post" for each, and record the four URLs in this file.
2. Wait ~3 weeks.
3. Re-check GSC coverage state for all four via `check_indexing_issues`. Record
   the before/after here. Before state, all four on 2026-08-18: "Discovered -
   currently not indexed", `last_crawled: null`.
4. If unchanged, mark the hypothesis dead in this file so nobody retries it.
