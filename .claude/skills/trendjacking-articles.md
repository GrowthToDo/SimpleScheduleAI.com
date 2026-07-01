---
name: trendjacking-articles
description: Load before writing, editing, or QA-ing a /articles "Newsroom" trendjacking piece for SimpleScheduleAI. Encodes the relevance gradient, detection loop, citable-hook rule, accuracy guardrails, and the draft-then-publish flow. Pairs with the strategy doc docs/seo/articles-trendjacking-plan.md and the blog rules in .claude/skills/seo-aeo-simplescheduleai.md.
---

# Trendjacking Articles (the /articles Newsroom method)

The goal is DR: be the first site to thoroughly answer a rising, ICP-adjacent, thin-competition question, hosted in `/articles`, so others cite us. This is rank-and-wait (no outreach): publish fast, gate, internally link, IndexNow. Strategy lives in `docs/seo/articles-trendjacking-plan.md`; this skill is the operational checklist.

Read `.claude/skills/seo-aeo-simplescheduleai.md` too. Nearly every blog rule applies here; this file only adds what is different for a news/analysis piece.

## When to use

Writing, editing, re-timing, or QA-ing any `src/data/article/*.md` (Newsroom) piece. Not for evergreen `/blog` posts (use the blog pipeline for those).

## Step 1 - Detect (weekly, ~30 min)

Scan the last 7-14 days for rising items. Sources: Google Trends (DataForSEO), Google News / WebSearch on seeds (`nurse staffing`, `nurse shortage`, `CMS rule`, `rural hospital closure`, `nurse strike`, `Texas nursing`), r/nursing hot, trade press (Becker's, Fierce Healthcare, HealthLeaders).

## Step 2 - Score and pick (1, max 2, per week)

`Relevance(1-5) x Rising(1-5) x Can-we-be-first(1-5) x Citable-hook(0/1)`. Require hook = 1 and relevance >= 3. Log what was dropped and why (no silent caps).

**Relevance gradient (the scope guardrail):**

- Tier 1 (write): nurse staffing, rural hospital finance/closures, CMS / Conditions of Participation, Texas health policy, nurse labor/unions, shortage or turnover data drops (NSI/BLS/HRSA/AHA).
- Tier 2 (write only if a real Critical Access Hospital / scheduling angle + a citable hook exist): healthcare/labor-adjacent viral moments.
- Tier 3 (skip): generic viral with a forced nurse hook.

**Can-we-be-first is the make-or-break test.** On a young / low-DR domain we cannot rank-and-wait onto a breaking hard-news SERP owned by CNN / Becker's / NPR / KFF / Fierce, and we are not in Google News. Check the SERP first: if big publishers own the head query, either take the thin _analysis / "what it means for a CAH's schedule and budget"_ long-tail, or pick a rising _question_ instead of the breaking story. Favor durable rising questions over 48-hour spikes.

## Step 3 - Write (fast, same or next day)

- **Answer-first.** State the answer / thesis in the first two sentences (these pieces are read by AI retrieval too).
- **One citable original hook per piece.** Reactive summaries do not get cited. Give each piece exactly one thing worth quoting: an original stat, a CAH-scaled worked calc, a sharp reframe, or a compliance angle. That hook is the whole point.
- **Accuracy is non-negotiable (YMYL).** No fabricated stats. No pilot / customer claims (SimpleScheduleAI is pre-launch). Every claim sourced; attribute the exact YEAR of any stat (the NSI figure in particular drifts by edition, do not mix years). Any worked math is labeled illustrative and "not a customer result".
- **Competitor mentions follow the dossier rule.** Load `.claude/skills/competitor-reviews.md`, use the dossier first, verbatim quotes only with name/role/date/source, neutral "verify with vendor" when no quote exists. Never manufacture sentiment.
- **Self-label** "AI-native nurse scheduling service", never "managed service".
- **File + frontmatter:** `src/data/article/<slug>.md`. `draft: true`. `metadata.canonical: https://simplescheduleai.com/articles/<slug>` (note `/articles/`, not `/blog/`). Pradeep byline. publishDate = today (real date; these are dated news pieces, not future-scheduled).
- **Structure:** mirror a live blog post (Key Takeaways -> TOC -> intro -> question-form H2s -> How Does SimpleScheduleAI Help -> Our Take -> What Should You Do This Week -> FAQ -> numbered Sources -> bio). The `/articles` route emits **NewsArticle** JSON-LD automatically (not BlogPosting), so no schema work in the file.
- Obey every mechanical blog guardrail: no em/en-dashes; no AI-tone; TOC anchors match headings; no `CAH` in any heading/table header; dark-mode table classes; the one-button `/how-it-works` CTA + book-a-call text link (never `/pilot`); both pillars + `/how-it-works` + `/ai-nurse-scheduling`; FLSA "overtime thresholds" not an 8-and-80 feature; tight excerpt (1-3 sentences, none over 40 words, a distinct hook).

## Step 4 - Gate

- `npm run check-links <file>` works on any path - every external source must resolve (403/429 from gov/LinkedIn is a bot-block, not broken; a 4xx elsewhere is broken).
- `npm run check-blog <file>` processes an `src/data/article` path and (since the collection-aware canonical fix) validates the `/articles/` canonical correctly, so run it and require 0 failures. Two residual gaps remain scoped to `src/data/post`: its draft-link check and its image-duplication check. So also confirm by hand that you did not link a draft post and did not reuse a pool image (add a new Unsplash id to `scripts/image-pool.json` if the pool is exhausted).
- Prettier the file.

## Step 5 - Publish (only on explicit go-ahead)

Newsroom pieces stay `draft: true` until the founder explicitly greenlights the publish (same rule as blogs). On go-ahead: flip `draft: false`, add the "Newsroom" nav link (held out of `src/navigation.ts` until the first piece is live), internally link the piece from 2-3 related evergreen `/blog` posts, then submit via IndexNow (Bing) + GSC. Target rising-topic-to-published within 24-48h.

## Step 6 - Measure (monthly)

Referring-domain growth via the backlinks MCP (`backlinks_summary`, `referring_domains`) + GSC/Bing impressions and positions for the `/articles` section. Kill topics that never earn links; repeat the shapes that do.

## The one-line test before you ship

Rising? ICP-adjacent (Tier 1-2)? A SERP a low-DR domain can actually rank on? One citable original hook? Every stat sourced with its year and no fabrication? If any answer is no, fix it or pick a different topic.
