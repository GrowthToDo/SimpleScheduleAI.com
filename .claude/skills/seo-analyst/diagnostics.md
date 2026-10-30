<!-- Reference file for .claude/skills/seo-analyst.md. The scripts (scripts/gsc-diagnose.mjs, scripts/lib/gsc-diagnose-core.mjs) are the authority, and the thresholds are named constants at the top of the core file; this file explains how to read the report. -->

# The monthly diagnosis: `npm run gsc-diagnose -- --pull`

The script pulls four windows itself: page and query+page for the 28 days
ending 3 days ago, and for the 28 days before that. It writes:

- `docs/seo/diagnostics/<date>.md`: the report. It is committed, because it is
  dated state.
- `docs/seo/diagnostics/raw/<date>/`: the four raw pulls, kept so a run can be
  reproduced. They are gitignored. `--from <dir>` re-runs from saved pulls.

Every section opens with its rule. What each section is for:

| Section | Read it for | Before acting |
| --- | --- | --- |
| a. Page movement | each page's drop type against the median page | Look up the page in `npm run change-log` first. If we edited it inside the window, the change log's verdict is the better read |
| b. Lost queries | searches we stopped showing for | Ignore competitor brand queries: they were never ours to win |
| c. Split queries | one query shared by 2+ of our pages | Never merge on this alone. Check whether the pages take turns (query + page + date, daily) and read each page's full query list |
| d. Questions people ask | question-shaped and long queries, grouped by page | "Weakly answered" (best position > 15) is a candidate for a new section or FAQ, not a new page by default |
| e. Near page one | positions 8–20, brands excluded | Feeds the title and link work in `docs/seo/ctr-rewrite-queue.md` |
| f. Unserved demand | queries where no page ranks better than 20 | New page or new section? Run `npm run keyword-check` first |
| g. Target keywords vs ranking page | registry keywords that land on a different page | "Not found in pull" usually means the exact phrase got no impressions this window, not that the page failed |

Brand terms for sections b and e live in `docs/seo/brand-terms.json`. When a
new competitor appears, add its name there.

Clicks for individual queries are privacy-suppressed in GSC, so query rows sum
to less than the page totals. Never read a query's 0 clicks literally. Judge
queries on impressions and position.

When you report from the diagnosis, name the section and quote its numbers. A
section shows what moved, not why. Label any cause as a hypothesis, the same as
any other claim.
