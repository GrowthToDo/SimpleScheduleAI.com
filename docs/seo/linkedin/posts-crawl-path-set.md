# LinkedIn posts — crawl-path set (4 outlines, DRAFT)

- Publish under: Pradeep Pandey personal profile (https://www.linkedin.com/in/pradeep-pandeyji/)
- Status: outlines only, not written. Awaiting founder go-ahead.
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
- **Close:** the honest one — a service costs more per month and is wrong for a
  hospital that wants to run its own tool.
- **Link:** the blog post, once.

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
