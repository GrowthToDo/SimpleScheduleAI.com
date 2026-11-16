<!-- Reference file for .claude/skills/seo-desk.md. Field notes checked against the route code in seo-desk/lib/api/ and seo-desk/lib/api/ext/ on 2026-11-15. The code is the authority; if a field here is missing from a reply, trust the reply. -->

# SEO Desk routes: fields and units

All routes are GET, base `http://127.0.0.1:8766`. Every reply (except `/api/sources`) carries
`through`, `range` (`{start, end, text}`, can be null), `sources`, `empty` and sometimes `warnings`.
`/api/week` also warns "Recent edits from git have not been read yet. Refresh to read them." when the
repo files were read before the desk read git: then a page edited lately may be proposed.

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
`standingLine`, `editStatus`, `statusLines[]`, `top5[]`, `leaveAlone[]`, `leaveAloneSummary`, `worries[]`, `watching[]`, `waiting[]`, `nextVerdict`, `opportunities[]`
(the next ten, the ones whose page can be edited now first; each carries `held`), `counts {openOpportunities, worries {total, needLook, waiting}, watching}`, `blockedOnYou[]`,
`locked`, `pastWeeks[]`. `top5[]` is the week's priorities, most important first, and holds at most
`planSize` cards: a ceiling, never padded, so fewer is normal. Order: broken things (a dropped page, a
failed source other than the news feeds, a keyword file problem, a Bing crawl problem, a competitor change, or one card for the
technical audit's critical and high findings), two at most; the plan's next post; the Newsroom
pieces he picked on the Newsroom page (two at most; `slot` newsroom, `typeLabel` "Newsroom piece",
`source` news, `isPageEdit` false and `eligibility` null, so they never use the week's edit; `why` is
"You picked it for this week's Newsroom piece."; Done means the piece is published); the week's one page
edit while it is unused (a pinned one, else the plan's first open improve row, else the best eligible
page edit; a slipping page only when it is a worry); a verdict card only when a due change can be
read now; then tasks that are not page edits (one card asking Google to index pages that already
have 3 or more links, the best page that needs links, open work rows that are real tasks this week,
technical audit setup findings at medium or more). A content gap, question or AI card is never in it:
the plan file decides which posts are written. `statusLines` are plain sentences for things already handled or with nothing to learn (changes due
for a verdict that all overlap another edit: "12 due changes overlap other edits and cannot be read, so
there is nothing to learn from them. To clear them, open Did it work, press Judge now, then Save these
verdicts."; pages Google was already asked to index in the last 28 days): say them, never turn them
into tasks. `editStatus` is null while the week's edit is unused;
once used it is the line "This week's page edit is used (/page, 9 November). The next one can go in
from 16 November." and there is no card for it. A top-five card: `id`, `title`, `typeLabel`, `term`,
`explain`, `why` (one plain sentence on why it is in this week's list; quote it), `measured`,
`action`, `test`, `eligibility`, `page`, `isPageEdit`, `slot` (broken, new-post, newsroom, page-edit,
verdict, other), `source`, `oppId`, `state`. A verdict card reports, so it has `eligibility: null` and
`hypothesis: false`. A card on a chosen or locked week can also carry
`weekEditDone {page, date, dateText}` (or null) when another page edit is already dated this week.
`eligibility` (the same on every list: this week's priorities, the cards beside it, opportunities, insight cards,
Cannibalization, Secondary keywords, the page drawer, worries; one function) is `{eligible, from, text}` plus one of: nothing (free:
"Can be edited now", or frozen: "Leave it until 7 December"), `recentEdit {page, date, lines, until}` (git shows a commit of
15 or more changed lines in the last 28 days that no card, plan row or edit note recorded, not
counting edits within 2 days after the page was published: "Edited 9 November
(found in git, 299 lines). Leave it until 7 December unless that edit was minor"), or `weekEdit {page,
date}` (this week's one page edit is already made: "Can be edited from 16 November"). A free page
with smaller git edits adds `touched[]` and `touchedText` ("Also touched on 9 November (3 lines)").
List rows that name a page (Cannibalization pages, Secondary keywords, content gap link pages, the
Pages list, audit pages, and `fromHoldText` on link suggestions) carry `frozenUntil`,
`frozenUntilText` and `holdText`: the same function's date and words for the freeze or a git edit
(a routine link does not use the week's edit). Quote `holdText`.
`leaveAlone[]` (the pages to leave alone, one list: the Pages tile and filter and Did it work read the
same): `{page, reason, until, kind, foundInGit?}`; `kind` is logged (a Done, a plan row or an "Edit:"
note), git (15 or more changed lines found in git) or split (a split he marked leave alone on the
Cannibalization page; `until` is null, no end date). A page is listed once. `leaveAloneSummary`
`{name: "Pages to leave alone", count, logged, git, split, text}`: `text` says what makes up the count
("2 with a logged edit, 33 found in git"); quote the count under that name.
`worries[]`: `{id, kind, page, title, measured, fix, test, isPageEdit, eligibility, editWhen, held,
waitUntil?, waitUntilText?}`. A worry is something that needs a look this week (`total` and `needLook` are the same number).
`editWhen` is when the page may be edited, the same line its page detail shows: "Can be edited now",
"Can be edited from 16 November" (this week's edit is used) or "Leave it until 7 December" (its own
edit holds it). `held` is true when the page may not be edited now (no "Add to this week"). A worry's
`measured` says "last edited" only of a deliberate edit; a smaller git change reads "a small change on
3 November (1 line)".
`watching[]` has the same fields plus `watch` (the reason in plain words) and `leaveIt {until,
untilText}`, and no eligibility chip (`eligibility` is null; `editWhen` only when its own edit holds
it): a page that slipped or reads worse but is best left alone for now, because it was edited
lately (`waitUntil`), because the plan already lists its change, or because fewer people may be
searching for it. A watched page is never counted or proposed as
a worry. Leave it (its main button) snoozes it until `leaveIt.until` and records no page edit and no
freeze. A slipping page counts only when its drop survives the spike check (see Decay). A worse verdict worry comes only
from a change that reads worse the way Did it work reads it (`changeVerdict`); a verdict that another
change overlaps, or a change that reads mixed, is never a worry. `waiting[]`: `{title, date, dateText, kind: verdict|frozen}`; a
verdict row with `count` above 1 folds that day's page changes (`pages[]`). `nextVerdict`: `{ready,
date, dateText, note}`, the next date a verdict can actually be read (one function with Did it work):
`ready` is true only when a due change can be read now (the data covers its 28 days after and no other
edit overlaps it): "Ready now", note "2 page changes from 2 commits can be read". Else the day the data
covers a due change no other edit overlaps ("Waiting for data through <date>"), else the earliest
waiting change no other edit overlaps so far ("18 November", note "4 page changes can be read then"),
else "None in sight" (`date` null). When due changes overlap other edits the note ends "12 due changes
overlap other edits and cannot be read". Ignore `sinceLastVisit`; it depends on a write.

`/api/month?m=2026-10` (the Monthly report; no `m` gives the last complete month): `month`, `label`
("October 2026", or "November 2026 so far"), `soFar`, `months[] {month, label, soFar}` (every complete
month the daily rows hold, newest first), `cur` and `prev` `{start, end, days, text}`, `comparable`,
`compareText`, `standingLine`, `tiles[]` (clicks, impressions, clickRate, targetPosition; each `value`,
`change`, `changeKind`, `against`, `note`; counts also `perDay`, `prevValue`, `prevPerDay`), `series[]`,
`markers[]`, `summary[]` (three to five sentences built from the numbers; quote them, never add a
cause), `topPages[]` and `topSearches[]` (top ten: `clicks, impressions, position, prevImpressions,
change`), `targets {available, improved, held, slipped, noData, total, rows[], note}`, `done {posts[],
edits[], verdicts[], verdictsUnreadable, audit, auditText, postsNote, editsNote}`, `other {bing, ga4,
ai[], bingText, ga4Text, aiText}`, `footer[]`, `searchError`, `pulls`. Every month-on-month `change`
is on per-day averages (months differ in length) and null under 20 in the earlier month's total; the
month so far is compared with the same days at the start of the month before. A month counts only
once Search Console has data for its last day. A target improved or slipped when it moved one place or
more. A source with no numbers for the whole month is null with a plain line (`bingText`, `ga4Text`),
never zero. The month's searches come from a query-only Search Console pull, cached for good once the
month is finished (opening a month the first time can take a few seconds; 502 or 429 leaves
`searchError` and the stored numbers). `/api/month.csv?m=` is the full lists in one file, each row
with the month and its dates.

`/api/newsroom` (the Newsroom page: news from the last 14 days that fits the trendjacking method,
read each morning from 14 Google News searches and four trade press feeds; source `news` in
`sources`): `line`, `weekOf`, `feeds {readAt, status, answered, total, failed[] {name, error}, items,
window {start, end, text}, text}`, `tabs[] {key, label, count}` (fresh, covered = "Already covered or
decided", held, dropped, picked; the sidebar's `newsroom` count in `/api/nav` is the fresh count),
`cards[]`, `pastedOther[]` (pasted links that fit no topic), `picks {count, max: 2}`, `holdDays`,
`toCheck[]`, `paidLabel`, `scoreNote`. A card: `id` (news:...), `title`, `outlets[] {name, url, date,
dateText, title, google}` (one per publisher; Google News links are redirect addresses), `firstDate`,
`latestDate`, `tier` (1 or 2), `tierWords[]`, `tierText` ("Tier 1: nurse staffing, rural hospital"),
`score {relevance, rising, product, relevanceWhy, risingWhy, draft: true, toCheck[] {name, how}}`
(Relevance 1 to 5 from the tier and how many tier words; Rising 1 to 5 from how many outlets ran it,
less one when the latest is 3 to 6 days old and two at a week or more; "Can we be first" and "Citable
hook" are always to check), `paid` and `paidText` (a press release or paid placement: not citable as a
peg; when only some outlets are one, those outlets carry `paid`), `have[] {kind: article|post|log|plan,
text, words[], strength, covered, decided, exact}` (at most four; an article sharing three distinctive
words with the card's title "covers" it, two is "Close to"; a blog post is only ever "Close to"; a
topic log entry is matched by three such words or exactly by an outlet link; numbers never count),
`tab`, `topLine` (why it is not fresh), `state`, `picked`, `pasted`, `aged` (no longer in
the feeds, kept because he acted on it), `brief`. Hold and Drop are the item actions `snooze` and
`ignore`; Pick is `POST /api/newsroom/pick` (also the card's Pin), refused at a third pick a week;
`POST /api/newsroom/paste {url}` reads one public https page. None of these write a tracked file.

## Search

`/api/overview?range=7|14|28|90|480|this-month|last-month|last-quarter|custom` (custom with `start` and
`end`): `tiles[]` in the order clicks, impressions, clickRate,
targetPosition; each has `key, label, value, change, changeKind, note, enoughData, range`. Quote
the tile's own `range`. This month and last month are compared with the month before, last quarter
with the quarter before: on per-day averages when the lengths differ, and then the tile's `against`
says so ("per day, against September's 30 days") and `compareText` names both periods.
`targetPosition` always covers its own stored 28 days; its `rangeLine` says so on any other dates. `clickRate` also has `valueText` ("3.1%") and is null under 500
impressions. `targetPosition` is the like-for-like mean for the keywords we target; `detail` says
how many. `topQueries[]` (`query, clicks, impressions, position, brand`) use `queriesRange` and
`queriesNote` (7 and 480 read the 28 or 90 day list; it also says so when an older snapshot
has no query-only 90-day pull and the 90-day counts are added up across pages, which counts a
search once per page it showed). `topPages[]` (`page, clicks, impressions,
position, clickRate`) use `pagesRange`, which can be shorter than `range` when the desk holds
less page history. `short` is true, and `coverageNote` says so, when the desk holds less daily
history than the range asks for (then the big numbers make no comparison with an earlier period). `countries[]`, `devices[]` are the latest
stored 28 days whatever range you ask for (`breakdownNote` names those dates). `series[]` is clicks and impressions by day.

`/api/search?range=…&metric=…`: the older Performance data. Use it for `likeForLike {mean,
prevMean, n, targetsTotal, enough, range, prevRange}`, `targets[]` (keyword, page, position,
change, alignment: right page, wrong page, too few views or no data yet, the Keywords page's own
reading of each keyword-file target, so "right page" is the same set on both pages) and `brandSplit` (null when the per-search counts are missing).
`/api/targets/range?range=…` is the same target list for any date-bar choice (the chosen dates against
the dates before, from query-only pulls, cached): `rows[]` with `move` (improved, held or slipped by one
place or more), `likeForLike`, `moves {improved, held, slipped, noData}`, `range`, `prevRange`; its rows
carry no `alignment` (that is worked out for the stored 28 days only). When the stored search totals for the latest 28 days are a day
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
movement, queryCount, inbound, lastEdit, frozenUntil, leaveAlone, leaveAloneReason, index
(indexed|not-indexed|unknown)}` (`inbound` counts links in other pages' text; menu and footer links are
not counted, so say so); `range` is the 28 days the numbers cover. `movement` growing reads "Shown
more" and slipping "Shown less" (any rise or fall); only a page on the Decay list is "decaying".
`lastEdit` is the newest deliberate edit (logged, or 15 or more changed lines found in git).
`leaveAlone {name, count, text, notListed[]}` is the same count as This week's `leaveAloneSummary`;
`notListed` names pages to leave alone that are not live pages in the list.
`/api/page?path=/blog/x` (path must start with a slash; 404 for an unknown page): the same row plus
`queries[]` (each `impressions` is the times THIS page was shown for that search, not the times the
search was made; a search that showed two pages counts on both), `opportunities[]`, `verdicts[]`, `inboundFrom[]`, `frozen {since, until, untilText,
why}`, `smallChange` ("a small change on 3 November (1 line)", newer than the last deliberate edit, or
null) and `editWhen` (the same line its worry carries).

## Insights

Every insight route returns `term`, `explain`, `count` and `items[]`. Only open items are listed.
One owner per search: a search sits in one list only (a real split first, then the wrong page
ranking, then a runner-up when it is that page's own target or else a secondary keyword, then a
content gap, then a weak question, then a cluster conflict), so the lists never double count and the
sidebar counts follow them. Every per-search "times shown" and minimum is the real count from the
query-only pull. When a snapshot lacks that pull, or it came back empty beside the page rows, every
affected reply (these insight pages, the keyword map, `/api/targets`, `/api/opportunities`,
`/api/week`, `/api/search` for 28 days or less) carries the one warning "Per-search counts are
missing, so these lists cannot be worked out. Refresh Search Console." Quote it; never read a 0 there
as no searches.

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
action, test, eligibility, held, heldKind, evidence[], score, status, brief`. Their `priority` is null
(they rank by `score`). The ones whose page can be edited now come first.

Held items, on every list (All opportunities, the week's next ten, Runner-up, Secondary keywords,
Cannibalization, Decay): `held` is true when the item edits a page that may not be edited now, and
`heldKind` says why: page (the freeze or an edit found in git: a page to leave alone) or week (this
week's one page edit is used). A held item is never pushed: no priority (`priority` null), no Swap in,
no "Mark as started", and it comes after the items that can be worked on now. Never recommend one for this week.

`/api/insights/secondary-keywords`: `items[] {id, page, query, impressions, position,
targetKeyword, evidence, recommendation, test, eligibility, held, heldKind, frozenUntilText, adopted,
state, priority, brief}`. `finished[]` (same shape, up to 50, newest first) holds the ones marked done or
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
sections, not new pages). A search is a gap only when no live page has 10 views for it, no unwritten
plan post covers it (same words in any spelling, or two shared meaningful words) and no live page
targets it: a page with 10 views, or a page that targets it, makes it a `strengthen-page` opportunity
for that page (a page edit, on All opportunities: "Google already shows /page for this search" or
"does not rank yet for it"). `covered` counts the searches a planned post already covers and
`coveredNote` says it ("2 searches are already covered by planned posts."; null for none). A gap's
recommendation is "Consider adding a post on this to the plan".

`/api/insights/decay`: `items[]` (the slipping page cards: `page, measured, action, test,
eligibility, evidence {prev, cur, ...}, priority, brief, leaveIt, watch`), `count` (every card: the
sidebar's number), `lookCount` (the cards that need a look: the "Pages to look at" tile), `watchCount`,
`busyWeek[]`, `busyWeekNote`, `pages {decaying[], growing[]}`, `queries {decaying[], growing[]}`, `note`.
`watch` is the plain reason a card is only watched (lost demand, its own edit holds it, or the plan
already lists its change; the same function as the week's `watching[]`), else null: a watched card has
no priority, no eligibility chip (`eligibility` null), offers Leave it and comes after the others.
"Decaying" means a card on this list only. The `pages` and `queries` tables are any fall or rise in
views ("Shown less than before" and "Shown more", every page Google showed), not the Decay list. Each of the four lists stops at `shownMax` (50) rows.
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
The decay cards pass a spike check: each period is split into four 7-day weeks, and a page is decaying
only when its drop passes the threshold on the plain totals and again with the earlier period's
busiest week counted as the middle of its other three. An item's `measured` adds the week-by-week
views of both periods; its percentage stays the plain one. `busyWeek[] {page, prev, adjusted, cur,
week {start, end, views, text}, prevWeeks, curWeeks, text, caution}` lists the pages that passed only
on the plain totals ("one busy week, not a real drop"): never decaying, never a worry or a card.
Quote `text`; `caution` (or null) names a Google ranking update inside that week, never as the cause.
The Growing list and the `pages.decaying` table are not spike-checked. A lost demand item carries
`leaveIt {until, untilText}` (28 days on): Leave it records no page edit.

`/api/keyword-map/table`: `counters {all, live, ranks, pending, mapped, unmapped, opportunities,
runnerUp, cannibalized, clusterConflicts}` (`runnerUp` is the Runner-up list's number: a target row
spelled another way than the runner-up search is flagged too), `rows[] {keyword, kind (targeted|discovered), status
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
cards above (the ones whose page can be edited now first), `held {page, week, text}`: how many of these
items are on pages to leave alone (the page's "Free to edit" filter, on by default, hides those) and
how many only wait for next week's page edit (those stay in the list), with the line the page shows. `status=open` means new, in progress or came back: it is what the Open view and the
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

`/api/results`: `due[]` rows carry `dataReady`, `dataThrough` and `waitingText` ("Waiting for data
through 11 November" when the Search Console data does not cover the 28 days after yet), and
`dueReady {ready, readable, unreadable, waiting, waitThrough, waitingText, unreadableText, judgeText}`
counts them with the same reading as the week's `nextVerdict` and status line: `readable` can be read
now ("Can be read"), `unreadable` is due but another edit overlaps it ("Due but cannot be read"),
`ready` is the two together, and `judgeText` is what pressing Judge now does today ("It will mark those
12 as cannot be read and clear them from this list. Nothing is saved until you press Save these
verdicts."). Quote `judgeText`. `verdicts[] {id, page, batch, pages, changeDate, judgedOn, verdict, verdictText,
summary, before, after, control {impPct}, impChange, relImpPct, overlapping, readable, readNote,
changeId, changeVerdict, changeVerdictText, changeNote, clicksTooSmall, nearUpdates, nearUpdatesNote}`,
`verdictCounts {changes, pageResults,
byWord, text}`, `due[]`, `pending[]`, `frozen[]` (the logged edits only), `leaveAlone[]` and
`leaveAloneSummary` (the same pages to leave alone, and count, as the week), `moneyPageVerdicts[]` (with `nearUpdates` too),
`googleUpdatesNote`. `verdictCounts` counts by distinct change: rows that share a commit (a batch and
its pages) share a `changeId` and are one change; "too early" is not a verdict and is left out;
each change is read once: its batch verdict when no other change overlaps the batch, else its page
rows no other change overlaps (one word when they agree, mixed when they do not); `byWord.unreadable`
counts changes with no row that can be read. Every row carries that reading as `changeVerdict`
(`changeVerdictText`), and a row of a change with more than one row has `changeNote`, one sentence on
how the whole change reads. Quote its `text`. `verdict` is better, worse, mixed, flat, insufficient-data (shown as "Too small
to tell"); a page not judged yet is pending or "Too early". The page's tabs are page results
("Page results: All 6, Better 2, ..."), adding up to `pageResults`; a change too early to judge is not
one of them and has its own Waiting count. `summary` is a ready-made sentence with
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
keywords and their positions, from the query-only pull only. A keyword the page rows hold but that
pull does not has `impressions` and `position` null and `noTotalNote` (never page rows added up), and
`warnings` counts them; 0 means Google did not show the search at all. `/api/nav`: `counts {keywordMap, cannibalization, runnerUp,
secondaryKeywords, contentGaps, decay, internalLinks (open link suggestions), opportunities (open),
worries, auditToFix, auditOpen, auditScore}`. Each equals the first number on its page. A null
count means the source was never pulled (or no audit has run), not zero; `cannibalization` and
`contentGaps` are also null when the per-search counts are missing. `/api/jobs`: `jobs[] {key, label, writes, cost, running, last}`. `last.problems` true means the
site check or keyword check finished and found problems (not that it failed).
