<!-- Reference file for .claude/skills/seo-analyst.md. The scripts (scripts/change-log.mjs, scripts/lib/change-log-core.mjs) are the authority; this file explains how to run them. -->

# Change log: judging edits to live posts

## What counts as a change

Git history is the log. Every commit that touches a live post
(`src/data/post`) or Newsroom article (`src/data/article`) is an entry:
`publish` when the page went live in that commit, `edit` otherwise. Commits on
the same page on the same day collapse into one entry. Draft-only commits are
ignored.

Changes made outside git, such as a GSC indexing request, go in
`docs/seo/change-log-notes.jsonl` as one line each:
`{"date":"YYYY-MM-DD","slug":"...","text":"...","source":"manual"}`. Add a
`url` field when the slug has no file. The human detail of large edit batches
lives in `docs/seo/change-log/`.

## Workflow

1. `npm run change-log -- due` lists edits old enough to judge (28 days of
   data plus 2 days of GSC lag), grouped by change date. Judging started with
   October 2026 edits; the script sets that date.
2. For each change date it prints two windows. The change day itself is
   excluded:
   - before: the 28 days before the change
   - after: the 28 days after the change
3. Normally run `npm run change-log -- judge --pull --dry-run`, then without
   `--dry-run`. The script pulls every window itself. The manual route below
   is the fallback when the local GSC server is unavailable.
   Manual route: pull each window with `get_advanced_search_analytics`, dimension `page`,
   `row_limit` 1000, `data_state` "final". That is about 190 rows a call. Save
   one file:
   `{"windows":[{"changeDate":"YYYY-MM-DD","before":<response>,"after":<response>}]}`.
   The raw MCP response, a `{rows:[...]}` object or a bare array all work.
   Do not request a page,date pull over MCP: it runs to about 16,000 rows and
   floods the context. `judge --daily <file>` exists only for a page,date pull
   that is already in a file.
4. `npm run change-log -- judge --from <file> --dry-run` shows the verdicts
   without writing anything. Without `--dry-run` it appends one verdict per
   page, and one `batch:<commit>` verdict for any commit that touched 3 or
   more pages, to `docs/seo/change-log-verdicts.jsonl`. A judged entry never
   comes due again. Pass `--today` only when testing.

## Reading a verdict

- `verdict`:
  - `better`
  - `worse`, with `dropType` naming which of the three drop types
  - `mixed`: signals point both ways, such as a rank gain while impressions
    fall behind the control
  - `flat`
  - `insufficient-data`: under 50 impressions in both windows
- `impPct` is the page's raw impression change.
- `vsSite` (`relImpPct`) is that change minus the control. The control is the
  median page's change over pages with 50+ impressions, so one breakout page
  cannot move it. The impressions signals use `vsSite`.
- Section-link rows (`page#heading`) are folded into their page.
- `overlapping`: another edit or publish on the same page within 28 days. Read
  the batch verdict instead.
- `clicksTooSmall`: under 10 clicks on both sides. Ignore the click change.
- A verdict is a signal, not proof. To present one as a finding, quote the
  numbers and name the pull, the same as any other claim.
