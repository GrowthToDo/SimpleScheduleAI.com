<!-- Reference file for .claude/skills/seo-desk.md. Field notes checked against the route code in seo-desk/lib/api/ and seo-desk/lib/api/ext/ on 2026-11-14. The code is the authority; if a field here is missing from a reply, trust the reply. -->

# SEO Desk routes: fields and units

All routes are GET, base `http://127.0.0.1:8766`. Every reply (except `/api/sources`) carries
`through`, `range` (`{start, end, text}`, can be null), `sources`, `empty` and sometimes `warnings`.

## Units

- `change` fields are already percent: `-43.3` means down 43.3 percent. It is null when the earlier
  period had under 20 views. Say "not enough data yet".
- `share`, `clickRate`, `ctr`, `impPct`, `relImpPct` are fractions: `0.46` is 46 percent,
  `-0.0159` is minus 1.6 percent. Read them aloud as percent; do not compute others yourself.
- The overview `clickRate` tile `change` is in percentage points, and `targetPosition` `change`
  is places gained (positive means better; a lower place number is better).
- Dates in text are written "9 November". `through` and `changeDate` are `YYYY-MM-DD`.

## Plan

`/api/week`: `weekOf`, `weekLabel`, `planSize` (3 or 5), `top5Source` (proposed, chosen or locked),
`standingLine`, `top5[]`, `leaveAlone[]`, `worries[]`, `waiting[]`, `nextVerdict`, `opportunities[]`
(the next ten), `counts {openOpportunities, worries {total, needLook, waiting}}`, `blockedOnYou[]`,
`locked`, `pastWeeks[]`. A top-five card: `id`, `title`, `typeLabel`, `term`, `explain`, `measured`,
`action`, `test`, `eligibility`, `page`, `isPageEdit`, `slot` (new-post, page-edit, verdict, worry,
other), `source`, `oppId`, `state`. A card that only reports (this week's edit is done, a verdict)
has `eligibility: null` and `hypothesis: false`. A card on a chosen or locked week can also carry
`weekEditDone {page, date, dateText}` (or null) when another page edit is already dated this week.
`eligibility` (the same on every list: the five, the cards beside it, opportunities, insight cards
built from opportunities, worries) is `{eligible, from, text}` plus one of: nothing (free, or
frozen: "Eligible from 7 December"), `recentEdit {page, date, lines, until}` (git shows an edit of
10 or more lines in the last 28 days that no card, plan row or edit note recorded: "Edited 9 November
(found in git, 299 lines). Leave it until 7 December unless that edit was minor"), or `weekEdit {page,
date}` (this week's one page edit is already made: "Next page edit from 16 November"). A free page
with smaller git edits adds `touched[]` and `touchedText` ("Also touched on 9 November (3 lines)").
`leaveAlone[]`: `{page, reason, until, foundInGit?}`; `until` is null for a split he marked leave
alone on the Cannibalization page (no end date); `foundInGit` marks a page held by a git edit.
`worries[]`: `{id, kind, page, title, measured, fix, test, isPageEdit, eligibility, waitUntil?,
waitUntilText?}`. A worry with `waitUntil` is on a page edited lately: its fix is to leave it alone
until that date, and it is not counted in `counts.worries.needLook`. A worse verdict worry comes only
from a change that reads worse the way Did it work reads it (`changeVerdict`); a verdict that another
change overlaps, or a change that reads mixed, is never a worry. `waiting[]`: `{title, date, dateText, kind: verdict|frozen}`; a
verdict row with `count` above 1 folds that day's page changes (`pages[]`). `nextVerdict`: `{ready,
date, dateText, note}`; `ready` is true when change-log has edits due now ("12 page changes from 7
commits ready to judge"). Ignore `sinceLastVisit`; it depends on a write.

## Search

`/api/overview?range=7|28|90|480`: `tiles[]` in the order clicks, impressions, clickRate,
targetPosition; each has `key, label, value, change, changeKind, note, enoughData, range`. Quote
the tile's own `range`. `clickRate` also has `valueText` ("3.1%") and is null under 500
impressions. `targetPosition` is the like-for-like mean for the keywords we target; `detail` says
how many. `topQueries[]` (`query, clicks, impressions, position, brand`) use `queriesRange` and
`queriesNote` (7 and 480 read the 28 or 90 day list; it also says so when an older snapshot
has no query-only 90-day pull and the 90-day counts are added up across pages, which counts a
search once per page it showed). `topPages[]` (`page, clicks, impressions,
position, clickRate`) use `pagesRange`, which can be shorter than `range` when the desk holds
less page history. `short` is true, and `coverageNote` says so, when the desk holds less daily
history than the range asks for (then the big numbers make no comparison with an earlier period). `countries[]`, `devices[]` are the latest
stored 28 days whatever range you ask for. `series[]` is clicks and impressions by day.

`/api/search?range=…&metric=…`: the older Performance data. Use it for `likeForLike {mean,
prevMean, n, targetsTotal, enough, range, prevRange}`, `targets[]` (keyword, page, position,
change, alignment) and `brandSplit`. When the stored search totals for the latest 28 days are a day
short of the 28 before, `notes[]` says the comparison of searches waits for the next refresh, and the
searches list and tile carry no change.

`/api/explore?dim=query|page&range=…`: `rows[] {key, clicks, impressions, position, ctr (pages
only, gated), prev, change, movement, brand}`, `totals`, `siteTotals`, `comparable`, `truncated`,
`source` (stored, live or cache), `fetchedOn`, `notes[]`, `chips[]`. `totals.impressions` for pages
adds up each page (page impressions: a search that showed two pages counts twice); `siteTotals
{impressions, clicks}` is the site's own total for the same dates, given for pages with no filter
and null otherwise. `movement` is growing, slipping, new, gone, steady or null; null means no
earlier period, nothing in either period, or too few views to judge (new and gone need 20 views in
the period that has them, a change needs 20 in the earlier one). Stored with no filter for searches
at 28 and 90 days (90 only once the snapshot holds the query-only 90-day pull) and pages at 7, 14,
28 and 90. Live ranges end on `through`, the same day as the stored lists. Everything else is a
live Search Console pull (two calls, cached 12 hours; 429 when busy, 502 when it fails). Same for
`/api/distribution` (stored for 28 and 90) and `/api/search-detail?query=` (always live; its
`totals {impressions, clicks, position}` are the search's own, from its pull by date). Stay on
stored ranges unless he asks for a filtered view.

`/api/pages`: `items[] {page, kind, keyword, position, impressions, clicks, ctr, change,
movement, queryCount, inbound, lastEdit, frozenUntil, index (indexed|not-indexed|unknown)}`
(`inbound` counts links in other pages' text; menu and footer links are not counted, so say so);
`range` is the 28 days the numbers cover.
`/api/page?path=/blog/x` (path must start with a slash; 404 for an unknown page): the same row plus
`queries[]` (each `impressions` is the times THIS page was shown for that search, not the times the
search was made; a search that showed two pages counts on both), `opportunities[]`, `verdicts[]`, `inboundFrom[]`, `frozen {since, until, untilText,
why}`.

## Insights

Every insight route returns `term`, `explain`, `count` and `items[]`. Only open items are listed.
One owner per search: a search sits in one list only (a real split first, then the wrong page
ranking, then a runner-up when it is that page's own target or else a secondary keyword, then a
content gap, then a weak question, then a cluster conflict), so the lists never double count and the
sidebar counts follow them. Every per-search "times shown" and minimum is the real count from the
query-only pull. When a snapshot lacks that pull, `warnings[]` says the per-search counts are
missing and the lists that need a minimum are empty.

`/api/insights/cannibalization`: `items[] {id, query, impressions, shouldWin, pages[{page, share,
impressions, position, frozenUntil, frozenUntilText}], note, measured, choice, recommendation,
test, editPages[], eligibility, atRisk {page, impressions, clicks}, likelyFalseAlarm,
falseAlarmReason, priority, brief}`. `choice` is consolidate, differentiate, leave-alone or null.
`impressions` is the real number of times the search showed the site; `pages` are only the pages
with 10 or more views for it, and `share` is each page's part of our pages' views. A search is a
split only when its real searches are 30 or more, a page with 10 or more views for it is better than position 20 and our pages'
views are under 1.3 times the searches. `atRisk` is the weaker page of the split. `editPages` are the pages the current choice would
edit (a leave-alone choice edits none), and `eligibility` covers those pages only. `likelyFalseAlarm`
is true when one page is the pillar page and the other is one of its own posts, both with 10 or more
views, and the keyword file does not give this search to either (the reason is in
`falseAlarmReason`). `priority` is high, medium or low by how often the search is shown against the
others in the list (`priorityNote` says so). `brief` is a ready-to-paste task for Claude whose
recommendation line reads "Recommendation (a hypothesis)". Also `leftAlone[]` (splits he marked leave alone,
same shape, not counted in `count`), `together[]` (`{id, query, impressions, pageViews, ratio,
pages[{page, impressions, position}], note}`: searches where our pages' views are 1.3 times the
searches or more, so the pages are shown together in the same results; not cannibalization, no
action, not counted; `togetherNote` says so) and `clusterConflicts[]` (`{keyword, page, targetKeyword,
impressions, position, recommendation, test}`: a Search Console search no page targets that holds
every word of a live page's target keyword, so that page may already cover it).

`/api/insights/runner-up`: `items[]` are opportunity cards: `id, page, query, title, measured,
action, test, eligibility, evidence[], score, status, brief`. Their `priority` is null (they rank by
`score`).

`/api/insights/secondary-keywords`: `items[] {id, page, query, impressions, position,
targetKeyword, evidence, recommendation, test, eligibility, frozenUntilText, adopted, state,
priority, brief}`. `finished[]` (same shape, up to 50, newest first) holds the ones marked done or
dismissed. A mistaken Done froze the page and used the week's edit, so Reopen on a finished one is
a write: only when he asks, in his own words. A
search a page already shows for (30 or more views in 28 days) that no page targets in any spelling
(nor with the same meaningful words joined or ordered differently),
sharing two or more meaningful words with that page's target. One search goes to one page only, the
best placed. At most three per page. A Done runner-up for the same page and search closes it too. Adopting one only records it; it never becomes a target. Marking one done
counts as the week's page edit.

`/api/insights/content-gaps`: `items[] {id, title, topic, searches[{query, impressions, position}],
impressions, why, recommendation, test, linkFrom[{page, frozenUntil, frozenUntilText, reason,
reasonText}], priority (high|medium|low), brief, state}`. `linkFrom` is always a list (possibly
empty). `reason` is mentions (the page already says these words), shown (Google already shows the
page for these searches) or topic (same topic); `reasonText` says it in a sentence.
Searches that an existing page may already cover are left out (they are secondary keywords or
sections, not new pages).

`/api/insights/decay`: `items[]` (the slipping page cards: `page, measured, action, test,
eligibility, evidence {prev, cur, ...}, priority, brief`), `pages {decaying[], growing[]}`,
`queries {decaying[], growing[]}`, `note`. Each of the four lists stops at `shownMax` (50) rows.
The true sizes are in `totals {pages {growing, decaying}, queries {growing, decaying}}` and
`shownText` says "Showing the first 50 of N" when one was cut. Quote `totals`, not the length of
a list. Each page row: `{page, impressions, prevImpressions, position, change,
movement}`; decaying page rows and every item also carry `dropKind` (lost-rankings, lost-demand,
lost-clicks or unclear), `dropKindLabel`, `dropKindWhy` (one sentence with that page's own
numbers), `recommendation` and `recentDrop` (the last 14 days are 30 percent or more under the 14
before). An item's `action` and `test` are the kind-of-drop recommendation and its test, the same
words All opportunities, the brief and the week's worry give (one source, `lib/decay.mjs`). The
window is fixed: the last 28 days against the 28 before, two periods of equal length from the daily
page rows. Brand searches are left out of `queries`. `queriesNote` is set (and the searches lists are
empty) when the stored search totals for the latest period are a day short of the period before;
the comparison of searches then waits for the next Search Console refresh. Say so; do not compare.

`/api/keyword-map/table`: `counters {all, live, ranks, pending, mapped, unmapped, opportunities,
runnerUp, cannibalized, clusterConflicts}`, `rows[] {keyword, kind (targeted|discovered), status
(live|ranks|pending), mappedTo, origin, source, volume, position, impressions, rankingPage, flags,
clusterConflict}`. `status` is live when the keyword is mapped to a live page; ranks when no page
targets it but a live page already shows at position 10 or better; otherwise pending. `clusterConflict` (`{page, keyword, recommendation, test}`) says an existing page may
already cover a pending keyword, so add a section there instead of a new page.

`/api/link-suggestions?page=/blog/x`: `total`, `open` and `pages[] {page, title, linkedFrom,
linkedFromText, keyword, keywordSource, reasons, suggestions[{to, toTitle, from, fromTitle, anchor,
context, status, fromFrozenUntil, fromFrozenUntilText}], dismissed}`. `pages` are the pages that
would gain from more links; `linkedFrom` is how many other pages link to each now in their page text
(menu and footer links are not counted; null when never
counted, which is not zero) and `linkedFromText` says it in a sentence. The number of links still to add is `open`;
`total` also counts ones already done. The titles are the pages' own titles (null when unknown).
Without `page` it lists every page with a needs-links or runner-up opportunity. A suggestion on a
frozen `from` page would edit that page, so check `fromFrozenUntilText`.

`/api/opportunities?type=&status=open&page=`: `counts {byType, byStatus}`, `items[]` as the
cards above. `status=open` means new, in progress or came back: it is what the Open view and the
sidebar count use, and `counts.byStatus.open` is its size. `status=attention` is new only. Other
values are one status each (done, ignored, snoozed) or `all`. Types: near-page-one, low-click-rate, competing-pages, slipping, wrong-page,
unserved, question, needs-links, ai-gap, not-indexed. The Google and Bing cards (engine-gap) are
retired: neither Bing report can show that a page or search is missing from Bing, so the desk raises
none. Never suggest checking a page in Bing because a Bing report lacks it. Bing's own figures stay
on Performance and in the Bing columns of the Queries list.

## Health and AI

`/api/audit`: `health {pagesAudited, pagesKnown, openIssues, toFix, bySeverity, score,
lastAuditText, nextAuditText}` (`toFix` is the open critical and high issues, the ones to do first), `audit {score, counts, issues[], stoppedEarly, groups[{group, label, score, note}], clicksRange, clicksNote}`, `comparison` (null on a first run;
`added[]`, `fixed[]`, `byNewCheck[]`, `byNewCheckText`), `weeklyAudit`. Issue: `{id, name, severity (critical|high|medium|low),
effort (quick win|moderate|larger job), impact, what, why, fix, steps[], pages[{page, clicks,
frozenUntilText, isNew, newCheck}], editsPage, siteWide, clicks}`. `editsPage` false means it is a change to
the site's setup, not to a page, so it does not use the week's edit. New and fixed compare only
checks that ran in both audits; `byNewCheck` lists pages found by a check the earlier audit did not
have: never call those new problems (their pages have `newCheck` true, `isNew` false). Page clicks
are Search Console's days, quote `clicksNote`. A score of 100 means nothing is open; a group's `note`
says what its score covers. Two site setup findings: `title-template-long` (titles long only because
of the shared ending) and `inline-css-heavy`; page weight (`page-code-large`) leaves out inline
styles and scripts, and every size is before compression. `audit.olderRules` counts the checks whose
rule changed after the run was made, and `audit.olderRulesNote` says once "This run used older rules
for N checks. Run the audit again."; those issues have `olderRule` true and `editsPage` false, and their
last step says to run the audit again before acting on them. Never say such a finding counts as the
week's page edit.

`/api/ai-visibility`: `byKind[]` (brand, alternatives, category, other) and `byAssistant[]`
(ChatGPT, Google AI answers). Counts: `listed`, `listedLinked`, `keywordChecked`,
`keywordCited`, `keywordEnough`, plus ready-made `listedText` and `keywordText`. `lastCheck {date,
dateText, daysAgo}` and `note`. `listed` is a count of answers that named us, never a share: do not
divide it by anything. `keywordCited` is null under 3 keyword checks ("not enough data yet"). A
keyword check says only whether our site is among the top sources the answers cite; it never tests
whether they name us. Counts are for the newest saved check only and are a floor.
`/api/ai`: `trend[]` (listed answers that name us only), `platforms[]` (every assistant a check
asked), `moneyKeywords[] {keyword, cited, platforms[]}`, `keywordCheck {date, dateText, fromLatest,
note}`, `moneyCitations {checked, cited, enough, text}`, `latestCheck {date, dateText, daysAgo,
engines, answersFrom, answersTo, answersText}`, `visitsFromAi {range, prevRange, total, prevTotal,
...}`, `imports`, `check {job, cost, writes}`. The check reads a stored set of AI answers: quote
`answersText` for their own dates. When `keywordCheck.fromLatest` is false the newest check's
keyword part returned nothing and the rows are from `keywordCheck.date`. Use `moneyCitations` for
"how many money keywords cite us": its `cited` is null until `enough` (3 or more checked), and `text`
is the sentence. Never count `moneyKeywords[].cited` yourself, which skips that gate.

`/api/visitors`: `channels {range, total, rows[], series[]}`, `landing[]`, `interestSignals[]`,
`clarity`, `standingLine`, `shareMinVisits`. Every `share` and `engagementRate` is null under 30
visits: say "not enough data yet". `clarity.scroll[] {page, depth, days}` is an average of daily
figures over `days` days. `/api/health`: `indexSummary {indexed, notIndexed, unknown, checked,
live, notChecked, oldestCheckedOn, answersText, lastRun, text}`, `index[] {page, verdict, reason,
lastCrawl, checkedOn, clicks, changedSinceLast}`, `newSinceLast[]`, `fixedSinceLast[]`,
`comparedPages`, `comparedText`, `bingCrawlIssues[]`, `issues[]`, `aiCrawlers`. `checked` is the
live pages that have an answer, not pages asked today: quote `answersText`, which gives the oldest
answer's date. An empty `newSinceLast` covers only the `comparedPages` asked again since the
previous refresh. Not-on-Google issues: `not-indexed` (few links), `not-indexed-linked` (3 or more
links: request indexing), `not-indexed-excluded` (the page itself keeps it out; links do not help). The
link counts are links in other pages' text; menu and footer links are not counted, so a footer page
can read 0. Each Not indexed card gives the same advice Site health gives its page.

## Workspace

`/api/results`: `verdicts[] {id, page, batch, pages, changeDate, judgedOn, verdict, verdictText,
summary, before, after, control {impPct}, impChange, relImpPct, overlapping, readable, readNote,
changeId, changeVerdict, changeVerdictText, changeNote, clicksTooSmall, nearUpdates, nearUpdatesNote}`,
`verdictCounts {changes, pageResults,
byWord, text}`, `due[]`, `pending[]`, `frozen[]`, `moneyPageVerdicts[]` (with `nearUpdates` too),
`googleUpdatesNote`. `verdictCounts` counts by distinct change: rows that share a commit (a batch and
its pages) share a `changeId` and are one change; "too early" is not a verdict and is left out;
each change is read once: its batch verdict when no other change overlaps the batch, else its page
rows no other change overlaps (one word when they agree, mixed when they do not); `byWord.unreadable`
counts changes with no row that can be read. Every row carries that reading as `changeVerdict`
(`changeVerdictText`), and a row of a change with more than one row has `changeNote`, one sentence on
how the whole change reads. Quote its `text`. `verdict` is better, worse, mixed, flat, insufficient-data (shown as "Too small
to tell"); a page not judged yet is pending or "Too early". `summary` is a ready-made sentence with
both date ranges; quote it rather than rebuilding the ranges. `control.impPct` is how the median
page moved over the same days (a fraction). `nearUpdates` (`[{label, date}]`) means a Google
ranking update fell inside the judged window: mention it as a caution, never as the cause.
`overlapping` means other edits landed in the same window, so the verdict cannot be read (`readNote`
says so, and `summary` starts with it).

`/api/lessons`: `counts {trial, proven, dropped, all}`, `items[] {id, text, status, manual,
statusNote, provenDirection, verdicts[{id, known, page, changeDate, verdict, verdictText,
overlapping}]}`. `proven` means three or more distinct linked changes agree and are all better or
all worse (pages changed in one commit are one change, and an overlapped verdict does not count);
`provenDirection` is then `helps` or `hurts`. `dropped` means the linked verdicts disagree. Three
"no real change" or three "mixed" stay a trial. `statusNote` is one plain sentence on why.

`/api/competitors`: `lastRunText`, `daysSinceCheck`, `stale`, `sitemap[]`, `watch[]` (one row per
changed page, in plain words), `linksPulse`, `totals {events, pages, material}` (a repeated list on
several pages is one event; pricing sentinels are never counted), `worries` (competitors with an
unseen change worth reading) and `hosts[]`, one per watched competitor: `events[] {kind, plain,
line, pages, pageNames, onText, material}`, `sentinels[] {url, state, plain}`, `counts`,
`summary`, `worry`, `seen`, `materialNoted`, `loggedInDossier`, `dossierNotedOn`, `dossierText`.
A change the dossier already notes for that competitor is shown but is not a worry. A competitor
worry on `/api/week` has no test, no hypothesis flag and no Search Console link; its card id carries
the events it covers, so Seen holds until a new event appears.
`/api/settings`: weights, money pages, brand words, `strategicKeywords`, switches (`paused`,
`weeklyAudit`, `showGoogleUpdates`), `schedule`, `planSize` (3 or 5). `/api/targets`: target
keywords and their positions. `/api/nav`: `counts {keywordMap, cannibalization, runnerUp,
secondaryKeywords, contentGaps, decay, internalLinks (open link suggestions), opportunities (open),
worries, auditToFix, auditOpen, auditScore}`. Each equals the first number on its page. A null
count means the source was never pulled (or no audit has run), not zero. `/api/jobs`: `jobs[] {key, label, writes, cost, running, last}`. `last.problems` true means the
site check or keyword check finished and found problems (not that it failed).
