---
name: seo-desk
description: Use when the founder asks what to work on this week, where cannibalization is, what the runner-up keywords, secondary keywords, content gaps or decaying pages are, how the site is doing in search, whether past edits worked, what lessons the edits taught, what the technical audit found, whether AI assistants name us, or any question the local SEO Desk (http://127.0.0.1:8766) can answer. Reads the desk's read-only routes with curl. Never changes anything.
---

# SEO Desk (answering from the desk)

The SEO Desk is a local app on the founder's Mac. It already pulls Search Console, Bing, GA4,
Clarity and the repo's own records, scores them and applies the one-edit-a-week rule. Ask the
desk; do not rebuild its numbers from raw sources. The founder's guide to it is
`seo-desk/README.md`. Route code is in `seo-desk/lib/api/` and `seo-desk/lib/api/ext/`.

Route fields: `.claude/skills/seo-desk/routes.md`. How to answer each kind of question, with
worked examples: `.claude/skills/seo-desk/answers.md`. Read the one you need first; the route
code is the authority if they disagree.

## Standing rule: every number comes from a desk route, with its own date range

Every number in an answer comes from a route you called in this answer. Quote the row it came
from and the range that belongs to that number ("/blog/x, shown 312 times, 13 October to 9
November"). Ranges differ inside one reply, so never reuse one for another: each overview tile
has its own `range`, the searches list has `queriesRange`, the top pages list `pagesRange`, a verdict has its `changeDate`, an AI
check has its `lastCheck` date. `range` can be null when the desk has no data; then say so.
Never estimate, round up a guess, carry a number over from memory or an earlier session, or fill
a gap. If the desk has no figure, say "the desk has no figure for that".

## Hard rules

1. **GET only.** Never send a POST, PUT or DELETE to the desk. That covers: marking an item done,
   snoozed or ignored; choosing or locking the week; refresh; any job (`/api/jobs/*`); settings;
   annotations and edit notes; lessons (add, change, delete); secondary keyword actions (adopt,
   done, dismiss); a cannibalization choice (consolidate, differentiate, leave alone); content gap
   actions; link suggestion marks; keyword adopt, ignore, import or delete; the AI CSV import; the
   audit switch. Do one only when the founder asks for that exact action in his own words, and say
   first what it will change. Never POST to `/api/jobs/*` on a guess.
2. **Money and tracked files.** The citation check costs money. Read its cost from `/api/jobs`
   (the `citations` job, field `cost`), never hard-code it. Never start it, by the desk's job or
   by `npm run llm-citations`, unless the founder says so after you state the cost. The jobs
   `judge`, `competitors` and the edit note write tracked files in the repo: same rule.
3. **Answer only from what the routes return.** No answer means say so. Never fill a gap from
   older reports or a number that looks plausible.
4. **Read `warnings` and `sources` first.** Any reply can carry `warnings`. When the opportunity
   rules fail, the insight lists come back empty, which looks like "none". If `warnings` is
   present, say "the desk could not work this out" and quote it. Never say "there are none" then.
5. **Say freshness first** if any source the answer rests on is behind (below).
6. **Facts and hypotheses stay apart.** The measured line is a fact. The `action`, `recommendation`
   or worry `fix` is a hypothesis: label it, give its `test`, say "may", never "will" or "because".
7. **Traffic is not sales.** Customers come through personal contacts. Never call impressions,
   clicks, rankings, citations, visits, template downloads or form sends progress toward
   customers. Form sends and downloads are "interest signals".
8. **Respect the edit rule** (section below). Never suggest a second page edit in a week where one
   is done, or any edit to a frozen page.
9. **Small numbers are not findings.** A `null` means the desk found too little data: say "not
   enough data yet". Never work out a percentage yourself from raw counts. Never state a search's
   0 clicks as fact (Search Console hides clicks on rare searches). Click rate is page level only.
   There is no site-wide average position; use the target keyword position. In AI visibility,
   never turn `listed` into a share or a rate; the keyword counts are null under 3 checks.
   Quote a count the desk gives (`totals`, `open`, `moneyCitations`), never one you made by
   counting a list: lists can be cut short and counts can be gated.

## When the desk does not answer

- Connection refused (curl exit 7, no output): the desk is not running. Tell him to start it with
  `npm run seo-desk` from the website folder, or double-click `seo-desk/Open SEO Desk.command`.
  Give no numbers.
- 404 on a route in the tables: check the spelling and the path first. Do not stop or restart the
  desk yourself. If it still 404s, tell him the desk may be running old code and needs a restart.
- `empty: true`: nothing has been pulled yet for that page. Say that.
- 429 or 502 on a live Search Console view: say Search Console was busy or slow and offer to try
  again. Do not loop.
- A question the routes do not cover: say the desk does not answer it. Offer to look at the repo's
  own files, and label them as a different, possibly older source.

## Freshness

Every reply carries `through` (the data's last day), `range` and `sources`:
`[{source, status, through, error, ageHours, retryAt}]`. Status is `fresh`, `stale`, `failed`,
`needs-sign-in` or `never`. Sources: `gsc` search numbers, `bing` Bing, `ga4` visitors, `clarity`
page behaviour, `index` indexed or not, `dfs` AI checks (its `through` is the date of the last
paid check, often weeks old, so say "as of the check on 1 November"), `local` plan, verdicts and
records. If a source the answer depends on is not `fresh`, open with one plain line: "Search
Console data is stale; the last good pull runs through 6 November." A failed source keeps its last
good data, so numbers still exist; state the date they cover. `GET /api/sources` lists them (a bare
list, not an envelope).

## Which route for which question

Base `http://127.0.0.1:8766`, always `curl -s`. Trim big replies with `jq`. Fields and units are
in `.claude/skills/seo-desk/routes.md`.

| Question | Route |
| --- | --- |
| What should I work on this week? | `/api/week` |
| How is search doing? | `/api/overview?range=28` (7, 28, 90, 480) |
| Which searches or pages grow or slip? | `/api/explore?dim=query` or `dim=page` |
| One page in full, or every page | `/api/page?path=/blog/x`, `/api/pages` |
| Cannibalization | `/api/insights/cannibalization` |
| Runner-up keywords | `/api/insights/runner-up` |
| Secondary keywords | `/api/insights/secondary-keywords` |
| Content gaps | `/api/insights/content-gaps` |
| Decay (and growing) | `/api/insights/decay` |
| Keyword map | `/api/keyword-map/table` |
| Internal links to add | `/api/link-suggestions?page=/blog/x` |
| Everything open, ranked | `/api/opportunities?status=open` (`attention` is new only) |
| Technical audit | `/api/audit` |
| Do AI assistants name us? | `/api/ai-visibility` (counts), `/api/ai` (trend, `moneyCitations`, visits) |
| What do visitors do? | `/api/visitors` |
| Is anything not on Google? | `/api/health` |
| Did my changes work? | `/api/results` |
| What did the edits teach us? | `/api/lessons` |
| Competitor moves | `/api/competitors` |
| Settings, targets, counts, sources, jobs | `/api/settings`, `/api/targets`, `/api/nav`, `/api/sources`, `/api/jobs` |

`/api/backup` and `/api/export/<list>.csv` are read-only downloads. Do not fetch them unless asked.
`/api/explore` is stored for 28 and 90 days (searches) and 7, 14, 28 and 90 (pages) with no
filter; any other range or any filter makes a live Search Console pull, so stay on stored ranges
unless he asks for a filtered view, and quote `source` and `fetchedOn`.

## The edit rule in the data

- A card or item with `eligibility: {eligible: false, text: "Eligible from 7 December"}` may not be
  edited yet. Quote `text`. Frozen pages carry `frozenUntilText` (cannibalization pages, content gap
  `linkFrom`, secondary keywords, audit pages) or `fromFrozenUntilText` (link suggestions).
- `/api/pages` `frozenUntil` and `/api/results` `frozen` list pages inside their 28 days.
- When `/api/week` has a top-five card `page-edit-done-<weekOf>`, or a card with a `weekEditDone`
  object, this week's page edit is spent. Say so and name the next Monday.
- Settings, redirects, the sitemap, server headers and routine link swaps do not count as the
  week's page edit; audit issues say so in `editsPage`. A new post is not a page edit. Marking a
  secondary keyword done counts as a page edit.
- Verdicts are judged 28 days after a change. A page that is pending or too early gets "too early
  to say" with its date, not a guess.

## Weekly review

- **How many priorities.** `planSize` on `/api/week` is 3 or 5 (the founder sets it in Settings).
  Give no more than the length of `top5`; never pad it.
- **Leave alone this week.** After the priorities, add the `leaveAlone` list when it is present:
  each page with the desk's `reason` and `until` (null `until` means a split he chose to keep as it
  is, with no end date). If the key is absent or empty, skip the section.
- **Lessons and decay.** Read `/api/lessons` before recommending; say in one line when a `proven`
  or `dropped` lesson bears on it. Suggest decay fixes by `dropKind`. Details in `answers.md`.
- **Worries** carry `fix`, not `action`. Give the one that has a fix.

## Cautions and shape

- Do not recommend merging two pages without saying the split may be fine when they serve
  different needs. If `likelyFalseAlarm` is true, say it is probably on purpose.
- Do not chase impressions. A Google ranking update near a verdict is a caution, never the cause.
- Plain spoken words, no dashes. Lead with the answer, then the evidence with its dates, then the
  hypothesis and its test, then the date rule. Stay short. Give each standard term (Cannibalization,
  Runner-up keywords, Secondary keywords, Content gaps, Decay, Keyword map, Internal links) its one
  plain sentence the first time. Worked examples are in `.claude/skills/seo-desk/answers.md`.
