# Monthly SEO Audit — runbook

Founder trigger (1st of each month, any session): **"run the monthly SEO audit"**.
Claude executes every step, presents drafted fixes for founder review, ships only
title/meta/H1 rewrites after approval. First run under this runbook: 2026-08-01.

## Steps (in order)

1. **Page-2 goldmine** (the core, from the 20-prompt thread + ctr-rewrite-queue.md):
   pull GSC `query,page` for trailing 90 days (`get_advanced_search_analytics`).
   Band A = position 11-20, >=30 impressions; Band B = position 4-10.9, >=50.
   Per-query clicks are privacy-suppressed — never read 0 literally. Draft exact
   title/excerpt rewrites (scope rule: title/meta/H1 ONLY, founder review, one
   commit). Compare last month's shipped rewrites: position/impressions delta on
   their target queries -> log outcome in ctr-rewrite-queue.md.
2. **AEO snapshot**: `npm run llm-citations` (dataset endpoints; ~$0.30-0.60 —
   SKIP with a note if DataForSEO balance is empty). Appends docs/seo/aeo-trend.jsonl.
2b. **GA4 AI-referral pull** (google-analytics MCP, wired 2026-08-03): `run_report` on
   property 528589584, dims `sessionSource`, metrics `sessions,totalUsers`, trailing 90
   days, dimension_filter = country "United States" AND sessionSource regex
   `chatgpt|openai|perplexity|claude|copilot|gemini`. **Baseline 2026-08-03: 0 US
   sessions.** NEVER report the unfiltered number: founder verification clicks from
   Hyderabad/Bengaluru produced 168 chatgpt.com sessions from ~1 user in the same
   window and would fake a "#2 channel" story. Directional metric only (paid-ChatGPT
   in-content links pass no referrer). Structural fix pending: GA4 internal-traffic
   IP filter (founder-side); the US-only proxy breaks if founders browse from the US.
3. **Competitor radar** (both free, no API spend):
   - `npm run sitemap-diff` — new/removed competitor URLs. Feeds the trendjacking
     radar and tells us what they are publishing.
   - `npm run competitor-watch` — H1, title, meta, H2 set, CTA and price changes on
     17 watched pages. This is the one that catches positioning moves: the sitemap
     radar showed 0 new M7 URLs on 2026-08-10 while their homepage H1 had been
     rewritten to a new category label. Two of the watched URLs are **pricing
     sentinels** (`m7health.com/pricing`, `inhouse.health/pricing`) — they 404
     today; the day either returns a page, a competitor has published a price.
   - Anything that moves goes into the dossier's maintenance log the same day, with
     the verbatim before/after. Known gaps: YouShift ships no sitemap, ShiftWizard
     serves a Webflow catch-all, aladtec.com robots.txt is Cloudflare-blocked.
   - Quarterly (not monthly) DataForSEO pass, timeboxed to one hour:
     `domain_rank_overview` for each competitor plus ours, `ranked_keywords` for any
     whose keyword count moved >20%, and the T2.3 link-gap intersection. Baseline
     and method: `docs/seo/competitor-intel-2026-08.md`.
4. **Backlink pulse**: Bing `get_link_counts` + GSC Links UI export ask (founder,
   quarterly is enough) -> update backlink-ledger.md baseline block; review ledger
   asks-vs-placements; nudge stalled founder-side items.
5. **Crawl/AI-visibility pulse** (from the Common Crawl guide): CC index presence
   (`curl index.commoncrawl.org/<latest>-index?url=simplescheduleai.com/*`), robots.txt
   spot-check for the Cloudflare managed AI-block (until founder disables it),
   CCBot/GPTBot UA fetch = 200.
6. **Keyword-registry hygiene**: `npm run keyword-check` — 0 fails required.
6b. **Target-keyword positions** (added 2026-08-30, founder-requested): the
   only position number worth reporting. Run `npm run target-positions -- --keywords`
   for the list, pull GSC `dimensions=query` for the month with `row_limit 500`,
   then `npm run target-positions -- --record <rows.json> --label YYYY-MM-DD`
   and `npm run target-positions` for the movement table. The MCP pull is large
   enough that the tool writes it to a file; pass that file path straight to
   `--record` rather than reading it into context.
   **Report the like-for-like mean, never the site-wide GSC average.** Site-wide
   average position is impression-weighted, so while we publish weekly it drifts
   worse every time Google finds a new deep-ranking query for us. Worked example
   from the founder's 2026-08-30 question, kept because it will recur: site
   average went 12.7 -> 13.2 week over week while impressions rose 27% and clicks
   58%. Nothing had deranked. `best-nurse-scheduling-software-critical-access-hospitals`
   fell 20 -> 44.9 purely because Google began matching it to a new "clinical
   ladder software" cluster at positions 35-61, which is nursing career
   progression and not scheduling at all.
   Second thing this instrument shows: **how many targets return nothing.**
   Baseline 2026-08-28: only 14 of 101 registry keywords had any GSC data. That
   count moving is a better health signal than any average.
7. **Report**: one summary message — movements, drafted rewrites awaiting approval,
   founder-action list, and any anomaly (indexing drops, new competitor pages,
   citation changes).

## Standing constraints
- No body-copy changes to chase CTR (fact-check violation).
- All rewrites founder-gated; everything else here is read-only or already-sanctioned.
- If a data source is unavailable (DFS empty, GSC auth), note it and continue — a
  partial audit that runs beats a complete one that doesn't.
- **DataForSEO spend (founder, 2026-08-10): no fixed ceiling, but be frugal — and
  never skip something that needs a cadence in order to save credits.** Prefer
  small `limit` values, filter server-side, and reuse a pull rather than
  re-requesting it. Cadence beats completeness.
