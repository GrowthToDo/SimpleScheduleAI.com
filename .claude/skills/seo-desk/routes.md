<!-- Reference file for .claude/skills/seo-desk.md. Field notes checked against the route code in seo-desk/lib/api/ and seo-desk/lib/api/ext/ on 2026-11-13. The code is the authority; if a field here is missing from a reply, trust the reply. -->

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
`standingLine`, `top5[]`, `leaveAlone[]`, `worries[]`, `waiting[]`, `opportunities[]` (the next ten),
`blockedOnYou[]`, `locked`, `pastWeeks[]`. A top-five card: `id`, `title`, `typeLabel`, `term`,
`explain`, `measured`, `action`, `test`, `eligibility {eligible, from, text}`, `page`, `isPageEdit`,
`slot` (new-post, page-edit, verdict, worry, other), `source`, `oppId`, `state`. A card on a chosen
or locked week can also carry `weekEditDone {page, date, dateText}` (or null) when another page edit
is already dated this week. `leaveAlone[]`: `{page, reason, until}`; `until` is null for a split
he marked leave alone on the Cannibalization page (no end date). `worries[]`: `{id, kind, page, title, measured, fix, test, isPageEdit}`.
`waiting[]`: `{title, date, dateText, kind: verdict|frozen}`. Ignore `sinceLastVisit`; it depends on
a write.

## Search

`/api/overview?range=7|28|90|480`: `tiles[]` in the order clicks, impressions, clickRate,
targetPosition; each has `key, label, value, change, changeKind, note, enoughData, range`. Quote
the tile's own `range`. `clickRate` also has `valueText` ("3.1%") and is null under 500
impressions. `targetPosition` is the like-for-like mean for the keywords we target; `detail` says
how many. `topQueries[]` (`query, clicks, impressions, position, brand`) use `queriesRange` and
`queriesNote` (7 and 480 read the 28 or 90 day list). `topPages[]` (`page, clicks, impressions,
position, clickRate`) use `pagesRange`, which can be shorter than `range` when the desk holds
less page history. `short` is true, and `coverageNote` says so, when the desk holds less daily
history than the range asks for (then the big numbers make no comparison with an earlier period). `countries[]`, `devices[]` are the latest
stored 28 days whatever range you ask for. `series[]` is clicks and impressions by day.

`/api/search?range=…&metric=…`: the older Performance data. Use it for `likeForLike {mean,
prevMean, n, targetsTotal, enough, range, prevRange}`, `targets[]` (keyword, page, position,
change, alignment) and `brandSplit`.

`/api/explore?dim=query|page&range=…`: `rows[] {key, clicks, impressions, position, ctr (pages
only, gated), prev, change, movement, brand}`, `totals`, `comparable`, `truncated`, `source`
(stored, live or cache), `fetchedOn`, `notes[]`, `chips[]`. `movement` is growing, slipping, new,
gone, steady or null. Stored with no filter for searches at 28 and 90 days and pages at 7, 14, 28
and 90. Everything else is a live Search Console pull (two calls, cached 12 hours; 429 when busy,
502 when it fails). Same for `/api/distribution` (stored for 28 and 90) and `/api/search-detail?query=`
(always live). Stay on stored ranges unless he asks for a filtered view.

`/api/pages`: `items[] {page, kind, keyword, position, impressions, clicks, ctr, change,
movement, queryCount, inbound, lastEdit, frozenUntil, index (indexed|not-indexed|unknown)}`.
`/api/page?path=/blog/x` (path must start with a slash; 404 for an unknown page): the same row plus
`queries[]`, `opportunities[]`, `verdicts[]`, `inboundFrom[]`, `frozen {since, until, untilText,
why}`.

## Insights

Every insight route returns `term`, `explain`, `count` and `items[]`. Only open items are listed.

`/api/insights/cannibalization`: `items[] {id, query, impressions, shouldWin, pages[{page, share,
impressions, position, frozenUntil, frozenUntilText}], note, measured, choice, recommendation,
test, editPages[], eligibility, atRisk {page, impressions, clicks}, likelyFalseAlarm,
falseAlarmReason, priority, brief}`. `choice` is consolidate, differentiate, leave-alone or null.
`atRisk` is the weaker page of the split. `editPages` are the pages the current choice would
edit (a leave-alone choice edits none), and `eligibility` covers those pages only. `likelyFalseAlarm`
is true when one page is the pillar page and the other is one of its own posts (the reason is in
`falseAlarmReason`). `priority` is high, medium or low by how often the search is shown against the
others in the list (`priorityNote` says so). `brief` is a ready-to-paste task for Claude whose
recommendation line reads "Recommendation (a hypothesis)". Also `leftAlone[]` (splits he marked leave alone,
same shape, not counted in `count`) and `clusterConflicts[]` (`{keyword, page, targetKeyword,
impressions, position, recommendation, test}`: a keyword we might add as a new page that an
existing page may already cover). A search needs 30 views to be listed.

`/api/insights/runner-up`: `items[]` are opportunity cards: `id, page, query, title, measured,
action, test, eligibility, evidence[], score, status, brief`. Their `priority` is null (they rank by
`score`).

`/api/insights/secondary-keywords`: `items[] {id, page, query, impressions, position,
targetKeyword, evidence, recommendation, test, eligibility, frozenUntilText, adopted, state,
priority, brief}`. `finished[]` (same shape, up to 50, newest first) holds the ones marked done or
dismissed. A mistaken Done froze the page and used the week's edit, so Reopen on a finished one is
a write: only when he asks, in his own words. A
search a page already shows for (30 or more views in 28 days) that the page does not target. At
most three per page. Adopting one only records it; it never becomes a target. Marking one done
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
before). The window is fixed: the last 28 days against the 28 before. Brand searches are left out
of `queries`.

`/api/keyword-map/table`: `counters {all, live, pending, mapped, unmapped, opportunities,
runnerUp, cannibalized, clusterConflicts}`, `rows[] {keyword, kind (targeted|discovered), status
(live|pending), mappedTo, origin, source, volume, position, impressions, rankingPage, flags,
clusterConflict}`. `status` is live when the keyword is mapped to a live page; every unmapped row
is pending. `clusterConflict` (`{page, keyword, recommendation, test}`) says an existing page may
already cover a pending keyword, so add a section there instead of a new page.

`/api/link-suggestions?page=/blog/x`: `total`, `open` and `pages[] {page, title, keyword,
keywordSource, reasons, suggestions[{to, toTitle, from, fromTitle, anchor, context, status,
fromFrozenUntil, fromFrozenUntilText}], dismissed}`. The number of links still to add is `open`;
`total` also counts ones already done. The titles are the pages' own titles (null when unknown).
Without `page` it lists every page with a needs-links or runner-up opportunity. A suggestion on a
frozen `from` page would edit that page, so check `fromFrozenUntilText`.

`/api/opportunities?type=&status=open&page=`: `counts {byType, byStatus}`, `items[]` as the
cards above. `status=open` means new, in progress or came back: it is what the Open view and the
sidebar count use, and `counts.byStatus.open` is its size. `status=attention` is new only. Other
values are one status each (done, ignored, snoozed) or `all`. Types: near-page-one, low-click-rate, competing-pages, slipping, wrong-page,
unserved, question, needs-links, ai-gap, engine-gap, not-indexed.

## Health and AI

`/api/audit`: `health {pagesAudited, pagesKnown, openIssues, toFix, bySeverity, score,
lastAuditText, nextAuditText}` (`toFix` is the open critical and high issues, the ones to do first), `audit {score, counts, issues[], stoppedEarly}`, `comparison` (null on a first run;
`added[]`, `fixed[]`), `weeklyAudit`. Issue: `{id, name, severity (critical|high|medium|low),
effort (quick win|moderate|larger job), impact, what, why, fix, steps[], pages[{page, clicks,
frozenUntilText, isNew}], editsPage, siteWide, clicks}`. `editsPage` false means it is a change to
the site's setup, not to a page, so it does not use the week's edit.

`/api/ai-visibility`: `byKind[]` (brand, alternatives, category, other) and `byAssistant[]`
(ChatGPT, Google AI answers). Counts: `listed`, `listedLinked`, `keywordChecked`, `keywordNamed`,
`keywordCited`, `keywordEnough`, plus ready-made `listedText` and `keywordText`. `lastCheck {date,
dateText, daysAgo}` and `note`. `listed` is a count of answers that named us, never a share: do not
divide it by anything. `keywordNamed` and `keywordCited` are null under 3 keyword checks ("not
enough data yet"). Counts are for the newest saved check only and are a floor.
`/api/ai`: `trend[]`, `platforms[]`, `moneyKeywords[] {keyword, cited, platforms[]}`, `moneyCitations
{checked, cited, enough, text}`, `latestCheck`, `visitsFromAi`, `imports`, `check {job, cost, writes}`.
Use `moneyCitations` for "how many money keywords cite us": its `cited` is null until `enough`
(3 or more checked), and `text` is the sentence. Never count `moneyKeywords[].cited` yourself, which
skips that gate.

`/api/visitors`: `channels {range, total, rows[], series[]}`, `landing[]`, `interestSignals[]`,
`clarity`, `standingLine`. `/api/health`: `indexSummary {indexed, notIndexed, unknown, checked,
live, text}`, `index[] {page, verdict, reason, lastCrawl, checkedOn, clicks, changedSinceLast}`,
`newSinceLast[]`, `fixedSinceLast[]`, `bingCrawlIssues[]`, `issues[]`, `aiCrawlers`.

## Workspace

`/api/results`: `verdicts[] {id, page, batch, pages, changeDate, judgedOn, verdict, verdictText,
summary, before, after, control {impPct}, impChange, relImpPct, overlapping, clicksTooSmall,
nearUpdates, nearUpdatesNote}`, `due[]`, `pending[]`, `frozen[]`, `moneyPageVerdicts[]`,
`googleUpdatesNote`. `verdict` is better, worse, mixed, flat, insufficient-data (shown as "Too small
to tell"); a page not judged yet is pending or "Too early". `summary` is a ready-made sentence with
both date ranges; quote it rather than rebuilding the ranges. `control.impPct` is how the median
page moved over the same days (a fraction). `nearUpdates` (`[{label, date}]`) means a Google
ranking update fell inside the judged window: mention it as a caution, never as the cause.
`overlapping` means another change touched the page, so the verdict cannot be pinned on one edit.

`/api/lessons`: `counts {trial, proven, dropped, all}`, `items[] {id, text, status, manual,
statusNote, provenDirection, verdicts[{id, known, page, changeDate, verdict, verdictText}]}`.
`proven` means three or more linked verdicts agree and are all better or all worse;
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
count means the source was never pulled (or no audit has run), not zero. `/api/jobs`: `jobs[] {key, label, writes, cost, running, last}`.
