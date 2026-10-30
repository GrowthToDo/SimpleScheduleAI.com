---
name: seo-analyst
description: Use when asked to "run the weekly change-log judge", when reading Google Search Console or GA4 data for simplescheduleai.com, when a page or the site gains or loses clicks, impressions or rankings, when deciding whether to refresh, retitle or merge pages, when asked whether a past edit to a live post worked, or when running the weekly or monthly SEO review.
---

# SEO analyst (measuring search performance)

Writing is governed by `publish-pipeline.md`; this skill governs measuring.
The judgment rules already live in CLAUDE.md (no causal claim without the
command that tested it). Baseline tests on 2026-10-30 showed agents apply those
rules well; every one of six stopped at "pull the query-level data first". So
this skill is the machinery: which pull, which script, where results go.

## Data access

- Scripts pull GSC themselves: `scripts/lib/gsc-mcp.mjs` starts the local GSC
  MCP server (configured in the untracked `.mcp.json`; never print or commit
  it) and writes the rows straight to files. Prefer `--pull` on a script over
  an MCP call in the conversation: the data never passes through the context,
  and the script does the arithmetic, never the agent. `npm run gsc-pull` saves
  any one pull to a file.
- Use the in-conversation MCP tools (`mcp__google-search-console__*`, site_url
  `https://simplescheduleai.com/`) only for small, one-off looks.
- Use `get_advanced_search_analytics` with `row_limit` 1000 or more for any
  analysis. `compare_search_periods` returns only the top N rows, so use it
  for a quick look, never as the whole picture.
- GSC lags about 2 days; the newest 2 days are incomplete. For judging, pull
  with `data_state` "final".
- GSC reports a section link (`page#heading`) as its own row. Fold it into its
  page before comparing.
- GA4 property and the AI-referral regex: step 2b of
  `docs/seo/monthly-seo-audit.md`.

## Which tool answers which question

| Question | Do this |
| --- | --- |
| Did an edit to a live post work? | `npm run change-log -- due`, then `judge --pull` (see `seo-analyst/change-log.md`) |
| What moved this month, and what to fix? | `npm run gsc-diagnose -- --pull`, report in `docs/seo/diagnostics/` (see `seo-analyst/diagnostics.md`) |
| Why did a page lose clicks? | section a of the diagnosis gives its drop type; read the page's queries in the raw pull |
| Are our target keywords moving? | `npm run target-positions` |
| Are two pages competing for one query? | that query, dimensions page + date (daily): taking turns or ranking together? Plus each page's full query list |
| Which titles to rewrite? | `docs/seo/ctr-rewrite-queue.md` |
| Are AI assistants citing us? | `npm run llm-citations` (`docs/seo/aeo-tracking.md`) |
| Which pages do AI assistants send visitors to? | GA4 `run_report`, sessionSource + landingPage, US only, regex `match_type` 6 (audit step 2b) |
| What happened this month? | `docs/seo/monthly-seo-audit.md` |

## The three drop types

| What the numbers show | Drop type | What to do |
| --- | --- | --- |
| Position worse by 1+ | lost rankings | refresh the page, add links to it |
| Position steady, impressions down 20%+ against the site | lost demand | nothing on the page to fix |
| Position steady, CTR down 30%+ | lost the click at the same position | title, snippet, or an AI answer above us |

Small-site floors: under 50 impressions in both windows means no verdict.
Under 10 clicks on both sides means clicks are noise, so judge on impressions
and position. Average position is weighted by impressions: a page that stops
appearing for deep queries shows a "better" position with no real gain.

## Cadence

- **Weekly, about 10 minutes** (founder-confirmed 2026-10-30): a cloud routine
  runs `change-log due` every Monday and lists what is due. Locally, "run the
  weekly change-log judge" means `npm run change-log -- judge --pull`, then
  report batch verdicts first, at most 3 lines each. Do not compare one week's
  traffic with the next: at about 1,100 impressions a day that is noise.
- **Monthly:** the audit runbook: step 0 judges past edits and runs
  `gsc-diagnose`.

## Common mistakes

- Judging an edit before day 30 (28 days of data plus 2 days of GSC lag).
- Reading a per-page verdict flagged `overlapping` as the effect of that one
  edit. Most of our edits overlap another edit, so the batch verdict is the
  one to read.
- Reporting a page as "up" when it only matched site-wide growth. `judge`
  subtracts the median page's change; quote `vsSite`, not raw impressions.
- Pulling a page by date breakdown through MCP. It floods the context. Pull
  each window by page instead.
