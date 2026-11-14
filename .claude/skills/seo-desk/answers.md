<!-- Reference file for .claude/skills/seo-desk.md. Rules for answering each kind of question and four worked examples. Every figure and search phrase in the examples is INVENTED and shows shape only; never reuse them as real data. The desk's routes are the authority for what a field means. -->

# Answering from the desk

## The terms, in one plain sentence each

Say the sentence the first time you use the term.

- **Cannibalization.** Two of your pages are competing for the same search.
- **Runner-up keywords.** Searches where you sit just off page one.
- **Secondary keywords.** Searches a page already appears for but does not target.
- **Content gaps.** Searches you already appear for that no page is written for.
- **Decay.** Pages that are being shown less than before.
- **Keyword map.** Which keyword belongs to which page.
- **Internal links.** Links from one of our pages to another.
- **Impressions** are times shown on Google. **Click rate** is clicks divided by times shown.

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
`queries.growing`) are good news, not tasks.

## Runner-up, secondary keywords, content gaps

- Every insight item carries a `brief`, a ready-to-paste task for Claude, written with the
  recommendation labelled "Recommendation (a hypothesis)". Offer it when he asks for the task.
- Quote counts the desk gives: `totals` on Decay (its lists stop at 50 rows), `open` on link
  suggestions (`total` includes done ones), `counts.byStatus.open` on opportunities.
- Runner-up: a small push may matter. Give `measured`, then `action` as a hypothesis, then `test`.
- Secondary keywords: the page already shows for the search but does not target it. The
  hypothesis is to work the phrase into a heading and the opening of that page. Adopting one only
  records it; it is never a target. Doing the edit counts as the week's page edit, so check
  `eligibility`. `finished[]` lists the ones marked done or dismissed; Reopen is a write, so offer
  it only if he asks.
- Content gaps: lead with `title` and `why`, then the pages in `linkFrom` that could link to it on
  day one (skip frozen ones or give their date). A new post is not a page edit.

## Did it work, and what we have learned

- Start with counts: judged, due (28 days up, not judged yet) and pending.
- For each judged edit give `verdictText` and quote `summary`, which already carries both date
  ranges and how the median page moved. Do not rebuild the ranges.
- `insufficient-data` reads "Too small to tell". Pending or too early reads "too early to say" with
  the `judgeFromText` date.
- If `overlapping` is true, say the verdict cannot be pinned on one edit. If `nearUpdates` is
  present, add one line: a Google ranking update fell inside the window, so read it with care.
  Never call the update the cause.
- A "Better" verdict is not a result for sales.
- Lessons: `proven` with `provenDirection` `helps` or `hurts` means three or more linked verdicts
  agree. `dropped` means the linked verdicts disagree with each other, so the lesson is not
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
to the site's setup, not a page, so it does not use the week's edit. Lead with what is `critical`
or `high`; do not make low issues sound urgent.

## Worked examples (invented figures, shape only)

**1. "What should I work on this week?"** Read `/api/week`. Say the week and the data date. Name
the priorities the desk proposes, in order, one plain sentence each, with the number that justifies
it and its range: "1. Write the next planned post (the plan's turn). 2. Check whether 4 past edits
worked (their 28 days are up). 3. Look at the slipping page: it was shown 300 times from 15
September to 12 October and 180 times from 13 October to 9 November." Then the one worry that has a
`fix`, labelled as a hypothesis. Then "Leave alone this week" from `leaveAlone`: "/example-page,
being measured until 7 December." If the page edit slot is done, say this week's page edit is spent
and the next can go in on Monday. End with the standing line: these are findability numbers, not
sales.

**2. "Where is cannibalization?"** Read `/api/insights/cannibalization`. "Cannibalization means two
of your pages are competing for the same search. From 13 October to 9 November, 'example search
phrase' was shown 200 times, split three ways: the main page 50 percent, one blog post 30 percent,
another 20 percent. The page that should win is the main page. Google may be unsure which page to
show. Telling the pages apart may help; it would be judged by the 28-day before and after verdict.
The blog post is eligible from 2 December." If `likelyFalseAlarm` is true: "This one is probably
on purpose: the main page and its own post cover the same ground."

**3. "Why did this page drop?"** Read `/api/insights/decay`, find the page. "Decay means a page is
being shown less than before. This page was shown 380 times in the last 28 days against 650 in the
28 before (down 42 percent, 13 October to 9 November). Its place held (6.1 to 6.4), so fewer people
may be searching for it. That is a hypothesis: there may be nothing on the page to fix. Check again
in a few weeks." For `unclear`: "The numbers do not show what kind of drop this is. Look at the
page's searches in Search Console before changing anything."

**4. "Did my changes work?"** Read `/api/results`. "6 changes are judged, 1 is ready to judge, 2
are still waiting. The 2 October change: Worse, quoted from the desk: <summary sentence>. Another
change overlapped it, so the result cannot be pinned on one edit. A Google ranking update fell
inside the window, so read it with care. 2 more verdicts are too early; the next can be judged on
21 November." Name the stale source first if one is behind.
