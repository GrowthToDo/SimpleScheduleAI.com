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
4. **Backlink pulse**: Bing `get_link_counts` + GSC Links UI export ask (founder,
   quarterly is enough) -> update backlink-ledger.md baseline block; review ledger
   asks-vs-placements; nudge stalled founder-side items.
5. **Crawl/AI-visibility pulse** (from the Common Crawl guide): CC index presence
   (`curl index.commoncrawl.org/<latest>-index?url=simplescheduleai.com/*`), robots.txt
   spot-check for the Cloudflare managed AI-block (until founder disables it),
   CCBot/GPTBot UA fetch = 200.
6. **Keyword-registry hygiene**: `npm run keyword-check` — 0 fails required.
7. **Report**: one summary message — movements, drafted rewrites awaiting approval,
   founder-action list, and any anomaly (indexing drops, new competitor pages,
   citation changes).

## Standing constraints
- No body-copy changes to chase CTR (fact-check violation).
- All rewrites founder-gated; everything else here is read-only or already-sanctioned.
- If a data source is unavailable (DFS empty, GSC auth), note it and continue — a
  partial audit that runs beats a complete one that doesn't.
