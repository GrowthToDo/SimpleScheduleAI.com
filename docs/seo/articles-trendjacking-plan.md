# /articles Trendjacking Plan — DR via First-and-Authoritative

_Status: approved 2026-07-01. Owner: Pradeep. Build is separate from the /blog pipeline._

## Objective

Raise Domain Rating by earning **topically-relevant** referring domains: be the first site to thoroughly answer a rising, ICP-adjacent, thin-competition question, hosted in a sectioned `/articles` area. When others research that question, we are the clearest first source, so they cite/link us.

## Locked decisions (and why)

- **Mechanism: rank-and-wait, no outreach.** On a young / low-DR domain we cannot rank-and-wait onto a breaking-viral SERP (owned by major news + Google Top Stories; we are not in Google News). Rank-and-wait works only when we are first to thoroughly answer a **rising, not-yet-saturated** question where SERP competition is thin. That is the same sweet spot the "reach" goal points to.
- **Host: `/articles` subfolder** — same domain so link equity flows to the root; sectioned so it does not blur the `/blog` nurse-scheduling topical cluster. NOT a subdomain (that would forfeit the equity that makes DR grow).
- **Scope: relevance gradient, Tier 1-2 only.** Off-topic viral (Tier 3) earns irrelevant links, junk traffic, and E-E-A-T dilution on a health-adjacent domain. A separate folder reduces cluster-blur but does NOT firewall the root domain, so scope discipline is the real protection.

## Topic scope (the relevance gradient)

- **Tier 1 (always write):** nurse staffing, rural hospital, CMS / Conditions of Participation, Texas health policy, nurse labor, shortage / turnover data drops (NSI, BLS, HRSA).
- **Tier 2 (write only if a real Critical Access Hospital / scheduling angle + a citable hook exist):** healthcare / labor-adjacent viral — nurse strikes, a viral nurse story, an AI-in-healthcare moment, a hospital-closure story.
- **Tier 3 (skip):** generic viral with a forced nurse hook.

## Weekly loop

1. **Detect (~30 min):** rising items from the last 7 days. Sources: Google Trends (DataForSEO trends), Google News / WebSearch on seeds (`nurse staffing`, `nurse shortage`, `CMS rule`, `rural hospital closure`, `nurse strike`, `Texas nursing`), r/nursing hot, trade press (Becker's, Fierce Healthcare, HealthLeaders).
2. **Score (pick 1, max 2 per week):** Relevance (1-5) x Rising (1-5) x Can-we-be-first-and-authoritative (1-5) x Citable-hook-exists (0/1). Require hook = 1 and relevance >= 3. Log what was dropped and why.
3. **Write fast (same or next day):** tight, original-angle piece with ONE citable hook (an original stat, a worked calc, a sharp framing, or a fast expert take with a quotable line), Pradeep byline, every claim sourced. Run `check-blog` + `check-links` (adapted for `/articles`).
4. **Publish:** `/articles/<slug>`, NewsArticle schema, internally linked from 2-3 related evergreen `/blog` posts, submitted via IndexNow (Bing) + GSC. Target: rising topic to published within 24-48h.
5. **Measure (monthly):** referring-domain growth via the backlinks MCP (`backlinks_summary`, `referring_domains`), plus GSC / Bing impressions and positions for the `/articles` section. Kill topics that never earn links; repeat the shapes that do.

## Guardrails

- **Accuracy is non-negotiable (YMYL).** No fabricated stats (existing hard rule). Every claim sourced and every source URL resolves.
- **One citable original hook per piece.** Reactive summaries do not get cited; an original data point, calculation, or framing does.
- **E-E-A-T:** Pradeep byline + NewsArticle schema (datePublished, author, publisher).

## Build tasks (do once, before the first article)

1. Scaffold the `/articles` route in Astro (a content collection or `pages/articles/[...slug]` mirroring the blog renderer) plus a section index at `/articles`.
2. NewsArticle schema component (instead of BlogPosting) + a section breadcrumb.
3. Teach `check-blog` / `check-links` to accept `/articles` (or a lighter gate variant for speed).
4. Add `/articles` to the sitemap and a subtle "Newsroom" / "Analysis" nav link.
5. Save the detection query set (the seeds + sources above) as a repeatable weekly checklist.

## First run

Pick one Tier-1 rising question this week, write and publish it to `/articles`, and measure referring domains at 30 days. Iterate from there.
