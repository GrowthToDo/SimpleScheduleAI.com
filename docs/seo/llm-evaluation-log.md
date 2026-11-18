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
