<!-- Reference file for .claude/skills/seo-desk.md. Rules for answering each kind of question and five worked examples. Every figure and search phrase in the examples is INVENTED and shows shape only; never reuse them as real data. The desk's routes are the authority for what a field means. -->

# Answering from the desk

## The terms, in one plain sentence each

Say the sentence the first time you use the term.

- **Cannibalization.** Two of your pages are competing for the same search.
- **Runner-up keywords.** Searches where you sit just off page one.
- **Secondary keywords.** Searches a page already appears for but does not target.
- **Content gaps.** Searches you already appear for that no page is written for.
- **Strengthen a page.** Searches one of your pages already shows for, or targets, without ranking yet. A new post would compete with that page.
- **Decay.** Pages that are being shown less than before.
- **Keyword map.** Which keyword belongs to which page.
- **Internal links.** Links from one of our pages to another.
- **Impressions** are times shown on Google. **Click rate** is clicks divided by times shown.
- **Newsroom.** News stories from the last 14 days that fit the trendjacking method, for a `/articles` piece.

## Cannibalization

- Meaning first, then the biggest two or three searches. Give each page's `share` as a percent and
  name the `shouldWin` page.
- If `likelyFalseAlarm` is true, say so first and give `falseAlarmReason`: a pillar page and one of
  its own posts covering the same ground is on purpose. Do not suggest merging them.
- The choices on the page are consolidate (merge into one), differentiate (make each answer a
  different need) and leave alone. A `leftAlone[]` row is a split he already chose to keep; mention
  it only if asked, and never re-recommend merging it.
- `atRisk` is the weaker page. It is the one to look at first, as a hypothesis.
- `clusterConflicts[]` are keywords we might add as a new page that an existing page may already
  cover. Say the section may be better added to that page than written as a new page.
- `eligibility` covers only the pages in `editPages` (the pages the current choice would edit), so
  quote its `text` for those, not for every page named. A leave-alone choice edits none.
- Skip any search with a null share. `priority` (high, medium, low) ranks by how often the search
  is shown against the others in the list; give it as the desk's ranking, not as a finding.

## Decay and growing

Use `dropKind` as a hypothesis with its test, from that page's own numbers (the last 28 days
against the 28 before), never from site-wide searches.

- `lost-rankings`: the page's place got worse by 2 or more. Refresh the page and add links to it.
- `lost-demand`: the place held (within 1) but views fell 30 percent or more. Fewer people may be
  searching, so there may be nothing on the page to fix. Say that.
- `lost-clicks`: place and views steady but clicks fell. Look at the title and description, or an AI
  answer above us. Rare on these lists.
- `unclear`: the numbers do not show the kind of drop. Say so plainly, give `dropKindWhy`, and
  suggest looking at the page's searches in Search Console before changing anything.
- `recentDrop` true: the last two weeks are 30 percent or more under the two weeks before them.
  Say the drop is recent.

Use the item's own `recommendation` and `test`. The Growing lists (`pages.growing`,
`queries.growing`) are good news, not tasks. Call a page "decaying" only when it is a card on the Decay
list; the tables are any fall or rise ("shown less than before", "shown more"). A card with `watch` set
is only watched: give its reason, never a priority, and count it apart from `lookCount` (the pages that
need a look). An item with `held` true edits a page that may not be edited now: never recommend it for
this week; give its `eligibility.text`.

A page in `busyWeek[]` is not decaying: one week of its earlier period was unusually busy, and
without it the drop is too small. Quote its `text`, and its `caution` when set, and say there is
nothing to fix. Never call it a drop or a worry. A watched page or a lost demand item has Leave it as
its main button: it puts the item away until `leaveIt.untilText` without using the week's page changes.

## Runner-up, secondary keywords, content gaps

- Every insight item carries a `brief`, a ready-to-paste task for Claude, written with the
  recommendation labelled "Recommendation (a hypothesis)". Offer it when he asks for the task.
- Quote counts the desk gives: `totals` on Decay (its lists stop at 50 rows), `open` on link
  suggestions (`total` includes done ones), `counts.byStatus.open` on opportunities.
- Runner-up: a small push may matter. Give `measured`, then `action` as a hypothesis, then `test`.
- Extra clicks (`upside`): quote `text` as it is, a hypothesis ("about 14 extra clicks a month if
  this works, from your own 90-day page click rate, 0.78%"), with its date range. Never add estimates together and never work one
  out yourself; a card with `state` none, zero or not-enough has no number to give, so say its `text`.
  For "which change could bring the most clicks", read the digest's "Most extra clicks" section (the
  All opportunities sort of the same name), and say the estimates rest on the site's own click rates
  (`clickRates.text`), pooled as total clicks over total views. "Not enough clicks yet to estimate" means
  the band rests on under 20 clicks: say that, never a number.
- Secondary keywords: the page already shows for the search but does not target it. The
  hypothesis is to work the phrase into a heading and the opening of that page. Adopting one only
  records it; it is never a target. Doing the edit counts as one of the week's page changes, so check
  `eligibility`. `finished[]` lists the ones marked done or dismissed; Reopen is a write, so offer
  it only if he asks.
- Content gaps: lead with `title` and `why`, then the pages in `linkFrom` that could link to it on
  day one (skip frozen ones or give their date). A new post is not a page edit. A gap is something to
  consider adding to the plan, never a post to write this week: the plan file decides which posts are
  written. Quote `coveredNote` when set. A search a live page already shows for (10 views or more) or
  targets is not a gap: it is a "Strengthen a page" card on All opportunities, a page edit for that
  page, because a new post would compete with it.
- The week's priorities (`top5`): quote each card's `why`. Fewer than `planSize` is normal; never
  fill the list from elsewhere. Each page change card says in `why` whether it is the week's big or
  small change (`size`); there is at most one of each. When `editStatus` is set, quote it: it says
  which of the two is used and whether the other is still open.
- A search sits in one list only, so never add one list's count to another's for "how many
  searches need work". There are no Google and Bing cards any more: a row missing from a Bing report
  shows nothing, so never present one as a gap.

## Did it work, and what we have learned

- Start with counts: `verdictCounts.text` (judged changes, a batch commit and its pages being one;
  "too early" is not a verdict), then the due changes in the desk's own reading: `dueReady.readable`
  can be read, `dueReady.unreadable` are due but cannot be read (another edit overlaps them), and
  pending. Never say due changes are "ready to judge" when `readable` is 0; quote `judgeText` for what
  Judge now will do, and `nextVerdict` on the week for the next date one can be read.
- "Last edited" is said only of a deliberate edit (`lastEdit`); a smaller git change is "a small change
  on <date>". When a page may be edited is its `editWhen` line; quote it.
- For each judged edit give `verdictText` and quote `summary`, which already carries both date
  ranges and how the median page moved. Do not rebuild the ranges.
- `insufficient-data` reads "Too small to tell". Pending or too early reads "too early to say" with
  the `judgeFromText` date.
- If `overlapping` is true, say other edits landed in the same window, so the verdict cannot be read.
- When rows share a `changeId`, they are one change: give the change's reading from `changeNote` (the same
  reading the count uses), then the rows.
  Never present its word as a result. If `nearUpdates` is present (money pages too), add one line: a
  Google ranking update fell inside the window, so read it with care. Never call the update the cause.
- A "Better" verdict is not a result for sales.
- Lessons: `proven` with `provenDirection` `helps` or `hurts` means three or more distinct,
  non-overlapping linked changes agree. `dropped` means the linked verdicts disagree with each other, so the lesson is not
  reliable. `trial` is not a result. When one bears on a recommendation, say it in one line.

## AI visibility

- Quote `lastCheck.dateText` ("as of the check on 1 November"); the check is paid and often weeks old.
- For "do the money keywords cite us", quote `moneyCitations.text` from `/api/ai`; never count
  `moneyKeywords[].cited` yourself (that skips the 3-check gate).
- Say which kinds of question and which assistants named us, using `listedText` and `keywordText`.
  `listed` is a count, never a share. A null keyword count means "not enough data yet".
- The counts are a floor: the check lists at most 10 answers per assistant.
- AI naming us is not sales progress.

## Technical audit

Give the score, the open issue count by severity (critical, high, medium, low), then the top issues
by clicks with their `effort` and the first of their `steps`. If `editsPage` is false it is a change
to the site's setup, not a page, so it does not use the week's page changes. Lead with what is `critical`
or `high`; do not make low issues sound urgent.

## How did last month go

Read `/api/month` (no `m`: the last complete month; the Ask digest carries it as "Last complete month").
Say the month and its dates, then the four tiles with the tile's own `against` words: every change is
per day against the month before, because months differ in length ("100 times a day against 90 a day
in September, up 11.1 percent per day"). Totals stay totals. Then quote `summary` as it is; it says
what moved, never why, so add no cause. Then target keywords improved, held and slipped (one place or
more) and how many had no data in one month, then what was done (`done`). A source with no numbers for
the month (`bingText`, `ga4Text`, `aiText`) is said as that line, never as zero. For the month so far,
say it is compared with the same days at the start of the month before. If `targets` is a sentence
instead of counts, the month's searches have not been pulled yet: say the Monthly report pulls them
when it is opened. End with the standing line.

## Worked examples (invented figures, shape only)

**1. "What should I work on this week?"** Read `/api/week`. Say the week and the data date. Name
the priorities the desk proposes, in order, one plain sentence each, with the number that justifies
it and its range: "1. Write the next planned post (the plan's turn). 2. Check whether 4 past edits
worked (their 28 days are up). 3. Look at the slipping page: it was shown 300 times from 15
September to 12 October and 180 times from 13 October to 9 November." Then the one worry that has a
`fix`, labelled as a hypothesis. Then "Leave alone this week" from `leaveAlone`: "/example-page,
being measured until 7 December." A `foundInGit` row was edited in git without a card, plan row or
note: say when it was edited and the date to leave it until. If a page change slot is done, quote
`editStatus`: which of the big and small changes is spent, and that the next can go in on Monday. A row in `watching` is not a
worry and not a task: give its `watch` reason (edited lately and when to look again, or fewer people
searching so there may be nothing to fix) and never suggest editing or undoing it. If `worries` is
empty say nothing needs him this week, then how many pages are only being watched.
A worse verdict worry is an observation ("reads worse after the change"), never "the change made it
worse"; give its cautions. For the verdict date quote `nextVerdict`. End with the standing line:
these are findability numbers, not sales.

**2. "Where is cannibalization?"** Read `/api/insights/cannibalization`. "Cannibalization means two
of your pages are competing for the same search. From 13 October to 9 November, 'example search
phrase' was shown 200 times, split three ways: the main page 50 percent, one blog post 30 percent,
another 20 percent. The page that should win is the main page. Google may be unsure which page to
show. Telling the pages apart may help; it would be judged by the 28-day before and after verdict.
The blog post is eligible from 2 December." If `likelyFalseAlarm` is true: "This one is probably
on purpose: the main page and its own post cover the same ground." The searches in `together[]` are
not cannibalization: our pages showed side by side in the same results, so say so and suggest no
merge.

**3. "Why did this page drop?"** Read `/api/insights/decay`, find the page. "Decay means a page is
being shown less than before. This page was shown 380 times in the last 28 days against 650 in the
28 before (down 42 percent, 13 October to 9 November). Its place held (6.1 to 6.4), so fewer people
may be searching for it. That is a hypothesis: there may be nothing on the page to fix. Check again
in a few weeks." For `unclear`: "The numbers do not show what kind of drop this is. Look at the
page's searches in Search Console before changing anything."

**4. "Did my changes work?"** Read `/api/results`. "3 changes are judged (1 better, 2 cannot be
read), 1 is ready to judge, 2 are still waiting. The 2 October change: quoted from the desk:
<summary sentence>. Other edits landed in the same window, so it cannot be read. A Google ranking update fell
inside the window, so read it with care. 2 more verdicts are too early; the next can be judged on
21 November." Name the stale source first if one is behind.

**5. "What should I write for the Newsroom this week?"** Read `/api/newsroom` (the Ask digest carries
the suggested cards, the filter counts and today's Claude topics as "Newsroom"). Say when the feeds were
read and how many answered, then the `suggested` cards (at most five, best first, and fewer is normal:
only stories that pass all five hard filters are there) with each `suggestWhy`, and if
`topicAsk.latest` exists, its topics in short, said as hypotheses. For each: the title, its `tierText`,
its reporting (`reports.text`, "4 reports": reprints are not reporting), its Freshness and why, any
`repeat.text`, and any `have` line ("Close to /blog/example-post"). Never call a story rising, trending
or big beyond that report count and those dates, and never give the draft (Relevance x Freshness) as
the score: "Can we be first" and "Citable hook" are his checks on the card (Check the results page costs
money and only he presses it). A story in `updates` is an edit to the page its `filter.update.text`
names, with that edit date, not a new article; a story in `filtered` is never suggested, and if he asks
about one, give the filter's `name` and `text`. Say a `paid` card's `paidText`. If he has picked one already (`picks.count`),
say so; two a week is the most. Then send him to the card's **Copy brief for Claude** for the real
scoring: it checks the results page and the hook, logs the decision in the topic log and drafts only
after he says go. A card on the covered tab is already written or decided; give its `topLine` and do
not suggest it again.
