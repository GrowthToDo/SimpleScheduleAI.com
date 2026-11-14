# SEO Desk: design

Date: 2026-11-10. Status: approved by the founder 2026-11-10.

## Why this exists

The repo already has a working SEO pipeline as command-line scripts (`change-log`, `gsc-diagnose`,
`target-positions`, `llm-citations`, `keyword-check`, `sitemap-diff`, `competitor-watch`,
`site-hygiene`). Their output is scattered across terminal text, markdown reports and `.jsonl`
files, so reading it takes an analyst. The founder is not one, and wants one place that he can
open on a Monday morning and plan the week from.

In his words: "On a Monday, first thing, I would like to make the whole plan for the week. What are
the biggest opportunities I have? Is there anything I should be worried about? What should be my top
three or top five priorities for the week?" He wants it to read as easily as DataFast (Marc Lou's
analytics product), to cover the jobs CrawlRaven covers, to run locally like the lead tracker, to
update itself from every connected source, and to have plenty of buttons so he can accept, defer or
reject what it suggests.

## What it is

**SEO Desk** is a local web app on the founder's Mac. It opens in the browser at
`http://127.0.0.1:8766`, listens on this computer only, and sends nothing anywhere except the read
calls to the data sources. It opens on a page called **This week**.

## Goals

1. Monday morning in under five minutes: the top five priorities for the week, the biggest
   opportunities behind them, and anything to worry about, each in one plain sentence with the
   numbers that justify it.
2. Every suggestion can be acted on with a button: start, done, snooze, ignore, pin, note, see
   the evidence, copy a ready brief for Claude.
3. Pull from every connected source: Google Search Console, Bing Webmaster, Google Analytics 4,
   Microsoft Clarity, DataForSEO, and the repo's own records (edit verdicts, target keyword
   positions, AI citation history, keyword registry, the monthly plan, competitor snapshots).
4. Refresh itself; never show stale data without saying so.
5. Cover the jobs CrawlRaven's shipped app covers (performance, query and page explorers,
   opportunities with lifecycle, ranking settings, target keywords, annotations, GA4, technical
   status, AI surface import, CSV export), plus what this business needs that CrawlRaven lacks
   (AI citation tracking, before and after verdicts, Bing, Clarity, competitor watch).

## Non-goals

- Not hosted, not multi-user, no login. One founder, one Mac.
- Not a replacement for the publish pipeline, the monthly audit runbook or the existing scripts.
  The desk reads them and runs them; it does not fork their logic.
- No keyword research tool, no rank tracker that scrapes Google, no own web crawler of other
  sites beyond what `competitor-watch` and `sitemap-diff` already do.
- No automatic edits to site content. The desk suggests; Claude or the founder edits through the
  normal pipeline.

## Anti-goals (it has failed if it does any of these)

- Presents traffic, rankings or citations as sales progress. Customers come through personal
  contacts. A standing line on the page says so, and form submissions are labelled "interest
  signals".
- Shows a query-level click rate of 0% as fact. Search Console hides low-volume query clicks.
  Click rate is judged at page level only, and only above a minimum impression count.
- Uses site-wide average position as a headline number. It misleads while new posts publish
  weekly. The headline is the like-for-like target keyword mean from `target-positions`.
- Uses DataForSEO keyword difficulty for anything.
- States a cause without a test. Every card separates the measured fact from the suggested
  action, and the action is labelled a hypothesis with the test that will settle it.
- Shows a percentage built on tiny numbers. Below the minimum it says "not enough data yet".
- Puts search data, keys, `.mcp.json` or `.env` content into git. The repo is public.
- Spends money or changes anything outside this Mac without a confirm click that states what
  will happen.

## Constraints

- No em or en dashes in anything the founder reads. Plain spoken words; no analyst jargon
  without a one-line explanation on hover.
- Search Console data lags about two days. Every number shows the date range it covers.
- The live-page edit rule is law: one live-page improvement a week, never the same page twice
  inside 28 days, each judged on 28 days before and after. The plan for the week must obey it.
- The desk never reads `.env` files and never prints `.mcp.json`. It reads only the command,
  arguments and environment of each data connection in order to start it, the way
  `scripts/lib/gsc-mcp.mjs` already does for Search Console.
- It never signs in to Google or Microsoft on the founder's behalf. If a connection needs a
  fresh sign-in, the source shows "needs sign-in" with the step for him to take.
- Leave `src/pages/index.astro`, `src/pages/product.astro` and
  `src/components/common/StoryVideo.astro` untouched (another session is working there).

## The pages

One top navigation bar, DataFast style: big numbers, one chart, ranked lists, one date picker,
no report builder. Ten pages (the tenth, Pages, is described under Founder decisions).

### 1. This week (opens here)

Answers: what do I do this week, what is my biggest upside, should I worry?

- **Header:** "Week of 9 November", "Data through 8 November", and one dot per source (green
  fresh, amber stale, red failed, grey needs sign-in) with a **Refresh now** button.
- **Since you last looked:** two or three sentences on what changed since the last visit.
- **Top 5 priorities:** five ranked cards. The desk proposes them; the founder can pin, swap,
  drag to reorder, or remove. The proposal always follows this recipe so the week respects the
  rules:
  1. This week's new post: the first unticked row of "The 15" in the current
     `docs/seo/next-*-blogs-*.md` plan.
  2. This week's one live-page improvement: the first unticked, not frozen row of "Improve these
     live pages" in the same plan; if the plan has none, the highest-scoring eligible
     opportunity.
  3. Any verdict that is due (run the judge), or the next verdict date if none is due.
  4. The most serious worry that has a fix.
  5. The highest-scoring remaining item that is not a live-page edit (for example a link to
     earn, an AI citation gap, a founder-blocked item from `docs/seo/OPEN-WORK.md`).
- **Biggest opportunities:** the next ten opportunities by score, each marked "eligible now" or
  "eligible from [date]" under the 28-day rule.
- **Worries:** things that got worse or broke: a page dropped from Google's index, a page
  slipping against the site median, a source that failed, a crawl error, a competitor price or
  call-to-action change, a keyword registry failure.
- **Waiting:** verdicts pending with their dates, and pages frozen until a date. Nothing to do,
  shown so he knows it is handled.
- **Lock this week's plan:** saves the five as the plan of record for the week. **Copy plan**
  puts it on the clipboard as plain text. Past weeks stay viewable with what got done.

### 2. Opportunities

Answers: what else could I do, and why is it ranked where it is?

The full list behind the week page. Views: Needs attention, In progress, Snoozed, Done, Ignored,
Came back. Filter by type and by page. Bulk done and bulk ignore.

Opportunity types (plain names; thresholds live in one constants file and reuse the existing
ones in `scripts/lib/gsc-diagnose-core.mjs` where they exist):

| Type                           | Measured fact                                                                                 | Suggested action                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Near page one                  | A search sits at position 8 to 20 with 30 or more impressions in 28 days                      | Add internal links, strengthen the section              |
| Low click rate for its place   | A page's click rate is well under the usual rate for its position, page level only, 200+ imp. | Rewrite the title and description                       |
| Two pages competing            | One search splits across two or more pages, top page under 70% share                          | Pick one page, point the other at it                    |
| Slipping page                  | Impressions fell against the prior 28 days while the median page did not                      | Refresh the page                                        |
| Wrong page ranking             | A target keyword ranks with a page other than its registry page                               | Link to the right page, or re-target                    |
| Searched but not served        | A search has 30 or more impressions, best position worse than 20, no page targets it          | Write a post or add a section                           |
| Question nobody answers        | A question search of six or more words is answered only weakly (position worse than 15)       | Add a question heading with a direct answer             |
| Needs links                    | A live page has fewer than two inbound internal links                                         | Add links from named sibling pages                      |
| AI names competitors, not us   | On a money keyword the AI answer cites competitors and not us                                 | Add the missing fact or get listed on the cited source  |
| Bing sees it, Google does not  | A search has impressions on Bing and none on Google, or the reverse                           | Check indexing and the page's title on the weaker side  |
| Not on Google                  | A live page is not indexed                                                                    | Check links, then request indexing in Search Console    |

**The card.** One shape everywhere:

- Type label and a plain title naming the page.
- **Measured:** one sentence with the numbers, the source and the date range.
- **Suggested action:** one sentence. Labelled **Hypothesis**, with the test: "Judged by the
  28-day before and after verdict on [date]".
- Score, with **Why this rank** opening the evidence drawer: each signal, its weight, its
  points, and the rows behind it.
- Buttons: **Start**, **Done**, **Snooze** (1 week, 2 weeks, 4 weeks, pick a date), **Ignore**
  (asks for a short reason), **Pin to this week**, **Add note**, **Copy brief for Claude**,
  **Open the page**, **Open in Search Console**.

**Lifecycle.** New, In progress, Done, Snoozed (returns on its date), Ignored (stays ignored),
Came back (was marked done and the same problem is detected again after its judging window).
Refreshing data never loses a status or a note. Marking a live-page edit Done records the date,
freezes that page for 28 days, and schedules its verdict.

**Copy brief for Claude.** Puts a ready prompt on the clipboard: the page, the measured
evidence, the suggested action, and the repo rules that apply (which skill to load, the
publish gate, the 28-day rule). This is how a card becomes work without retyping.

### 3. Did it work?

Answers: were my past changes better, worse, or is it too early?

- Each judged edit or batch: plain verdict (better, worse, mixed, too early, too small to
  tell), before and after numbers, and the control (how the median page moved in the same
  period). Source: `docs/seo/change-log-verdicts.jsonl`.
- Pending: every edit not yet judged, with the date it becomes judgeable.
- **Judge now:** runs `npm run change-log -- judge --pull --dry-run`, shows the result, and
  asks before the real run that appends to the verdicts file.
- **Frozen pages:** which pages may not be edited again, and until when.
- **Timeline:** publishes and edits from git, manual notes, and the founder's own annotations
  (add, edit, archive), shown as markers on every chart in the desk.

### 4. Search

Answers: how is search doing, without decoding a chart?

- Six big numbers, each with change against the prior period: Google impressions, Google
  clicks, target keyword position (like for like), number of searches we appear for, Bing
  impressions, pages on Google (indexed out of live).
- One chart. Clicking a number switches the chart to it. Ranges: 7, 28, 90 days, 16 months.
- **Pages** and **Searches** lists with a movement filter (growing, slipping, new, gone),
  brand and non-brand split, country and device. Clicking a row opens a drawer with its trend
  and its related opportunities. CSV export.
- **Target keywords:** every registry keyword with its target page, position, impressions,
  which page actually ranks, and a plain alignment label (right page, wrong page, no data
  yet). The like-for-like mean is the only average shown.
- The desk keeps each day's pull, so history grows past Search Console's 16 months.

### 5. AI answers

Answers: are AI assistants naming and citing us?

- How many answers name us, per assistant, over time. Source: `docs/seo/aeo-trend.jsonl`. The
  count is labelled "at least", because the script caps it at 10 per assistant.
- Money keywords: are we cited, at what rank, and which sources and competitors are cited
  instead.
- Visits that came from AI assistants (GA4).
- **Import Google's Generative AI report:** upload the CSV exported by hand from Search
  Console (there is no API for it); the desk keeps each snapshot and shows the trend.
- **Run citation check (about $0.62):** runs `npm run llm-citations` after a confirm that
  states the cost.

### 6. Visitors

Answers: what do people do once they arrive?

- GA4: visits by channel, top landing pages, and interest signals (template download,
  calculator breakdown request, contact form), with the standing line that these are not
  sales. A note says internal traffic is not yet filtered out.
- Clarity: pages with rage clicks, dead clicks and quick backs, scroll depth on the top pages,
  JavaScript errors, with a link to open the recordings in Clarity.

### 7. Site health

Answers: is anything broken?

- **Indexing:** every live URL with its Google status and last crawl, plus Bing crawl issues.
  "New since last check" and "Fixed since last check".
- **Site check:** runs the build and `npm run site-hygiene`: broken links, duplicate or
  missing titles and descriptions, orphan pages. Button, because the build takes a few
  minutes.
- Keyword registry check (`npm run keyword-check`), sitemap status, and whether AI crawlers
  can fetch the site.
- Each issue: what was found, why it matters, the fix, the affected URLs, sorted by the
  clicks those URLs get.

### 8. Competitors

Answers: did a competitor move?

- New and removed URLs on the watched sitemaps, and changes to watched pages (title, price,
  call to action), from `sitemap-diff` and `competitor-watch`. **Check now** runs both.
- Each change has **Seen** and **Add to this week**. A reminder points to
  `docs/seo/competitor-dossier.md` for logging a real move.
- Links pulse: Bing's count of links pointing at the site, over time.

### 9. Settings

- Ranking: presets (Balanced, Money pages first, Findability first, AI citations first) and a
  slider per signal. Money pages are a list the founder edits.
- Thresholds, brand terms, refresh schedule, paid-call confirmations, source status with the
  last error for each, and a **Download everything** backup.

## How opportunities are scored

Score = sum over signals of (weight x points), shown in full in the evidence drawer. Signals:
size of the demand (impressions), distance to the goal (how close to page one, how far under
the expected click rate), page importance (money page, pillar, target keyword), confidence
(how much data), effort (title change is cheap, new post is not), and AI citation value. A
signal with too little data contributes nothing and says so. The exact weights are a builder
choice, tuned against the November audit so that its known findings rank near the top.

## Where data comes from and how it refreshes

| Source              | Reached by                                                             | Refresh                    |
| ------------------- | ---------------------------------------------------------------------- | -------------------------- |
| Search Console      | Its connection in `.mcp.json`, started the way `gsc-mcp.mjs` does      | Automatic                  |
| Bing Webmaster      | Same pattern                                                           | Automatic                  |
| GA4                 | Same pattern (property 528589584)                                      | Automatic                  |
| Clarity             | Same pattern; few questions per refresh                                | Automatic, once a day      |
| DataForSEO          | `npm run llm-citations` (paid)                                         | Button, cost confirmed     |
| Edit verdicts       | `docs/seo/change-log-verdicts.jsonl`, `npm run change-log -- due`      | Automatic (free, local)    |
| Target positions    | `docs/seo/target-positions.jsonl`, plus the desk's own query pulls     | Automatic                  |
| Plan and open work  | `docs/seo/next-*-blogs-*.md`, `docs/seo/OPEN-WORK.md`                  | Read on every load         |
| Competitors         | `npm run sitemap-diff`, `npm run competitor-watch`                     | Weekly, and a button       |
| Site check          | Build, then `npm run site-hygiene`                                     | Button                     |

Automatic means: when the desk is opened and a source is more than 12 hours old, it refreshes
in the background and the page updates when done. A failed source keeps its last good data,
turns red, and shows the error in plain words. Paid calls never run automatically.

## How it gets made (builder calls, not founder decisions, unless marked)

- **Where:** in this repo under `seo-desk/` (server, logic, page files, tests), with all pulled
  data and desk state under `seo-desk/data/`, which is gitignored. Reason: the desk reuses
  `scripts/lib/*` and reads `docs/seo/*` directly. The code holds no secrets and no data.
- **Stack:** Node 22 (already required by the repo), no new dependencies, Node's built-in web
  server, plain HTML, CSS and JavaScript for the page, JSON files for state. Same shape as the
  lead tracker (local server, static page, data folder), in the repo's own language.
- **Start:** `npm run seo-desk`, plus a double-click `Open SEO Desk.command`.
- **Reuse:** the judging and diagnosis logic is imported from `scripts/lib/change-log-core.mjs`
  and `scripts/lib/gsc-diagnose-core.mjs`, never copied. `gsc-mcp.mjs` is generalised into one
  small client that can start any of the five connections; the Search Console scripts keep
  working unchanged.
- **Safety:** listens on 127.0.0.1 only and rejects other Host headers (as the lead tracker
  does). Buttons that write to repo files (`judge`, logging a manual edit note) show what they
  will write first.
- **Tests:** unit tests for every opportunity rule, the scoring, the lifecycle transitions, the
  28-day rule and the plan parser, run with `node --test` like the existing script tests.
- **Verification before hand-over:** each number on the desk is checked against the same
  number pulled directly from its source in the same session, and the November audit's known
  findings must appear (the 12-hour shifts post growth, the Aladtec page not on Google, the
  pending verdict dates).

## Calls made after the builder review (mine, for the founder to check)

- **What freezes a page.** Only a deliberate improvement freezes a page for 28 days: a
  live-page edit card marked Done in the desk, a row in the plan's "Improve these live pages"
  table that is ticked or whose text says "Done [date]" or "Already live", or a manual entry in
  `docs/seo/change-log-notes.jsonl`. Routine commits that touch a post (inbound links added
  when another post publishes, site-wide sweeps) do not freeze it; counting them would freeze
  93 pages and leave nothing eligible. The desk still shows "also touched on [date]" on the
  card so an overlap is visible before the edit, because the judge will flag it.
- **Pages outside the blog.** `change-log` only knows `src/data/post` and `src/data/article`.
  For money pages under `src/pages` (for example `/critical-access-hospital-scheduling`) the
  desk computes the same before and after verdict itself from its own daily pulls, calling the
  same functions in `change-log-core.mjs`. The `change-log` script is not changed.
- **The plan file is read, never written.** The desk keeps its own state. When a card that
  came from the plan is marked Done, the desk reminds the founder to tick the row in the plan
  file and offers that as a line in the Claude brief.
- **Files git tracks.** The desk never commits. Its own pulls and state stay in
  `seo-desk/data/`. Target positions are computed from the desk's pulls and are not written to
  `docs/seo/target-positions.jsonl`. Four buttons run existing scripts that write tracked
  files (`Judge now`, `Run citation check`, `Check competitors now`, logging a manual edit
  note); each names the files it will change before it runs, and the changes are left
  uncommitted for the normal commit flow. So the competitor check is a button, not automatic;
  the page shows how many days ago it last ran and turns amber after seven.
- **Connections.** All five (`google-search-console`, `bing-webmaster`, `google-analytics`,
  `microsoft-clarity`, `dataforseo`) are defined in the project `.mcp.json` (names checked
  2026-11-10, values not read), so one client covers them.
- **Clarity history.** Hypothesis: Clarity only answers for the last few days. Tested once on
  2026-11-10: "last 3 days" answered, "10 to 20 October" returned an error. If that holds,
  Clarity trends exist only for days the desk pulled, which is the main argument for the
  morning background job in question 1.

## Build order

1. Engine: server, the shared connection client, refresh with freshness dots, local state.
2. This week, Opportunities, Did it work, Search. This is the first version shown to the
   founder for reaction.
3. AI answers, Visitors, Site health, Competitors, Settings.

## Founder decisions (2026-11-10)

1. **Run daily and refresh.** A background job on the Mac keeps the desk running and pulls
   every source each morning (06:00 local), so history has no gaps. Paid calls are still
   button-only.
2. **Code in this repo, data out of git.** As described under "How it gets made".
3. **Standing lists are always there, independent of the weekly five.** The Top 5 is a
   selection, not a filter. Every list below is complete, always current, and workable at any
   time, whether or not its items made this week's plan:
   - **Opportunities**, with one tab per type and its count (Near page one, Low click rate,
     Two pages competing, Slipping, Wrong page ranking, Searched but not served, Questions,
     Needs links, AI gaps, Bing and Google gaps, Not on Google) plus an All tab.
   - **Two pages competing** (cannibalisation) as its own full view: each search, the pages
     that share it, each page's share, impressions and position, the page the registry says
     should win, and the note that a split is fine when the two pages answer different needs.
   - **Pages** (page-wise keyword tracker), a tenth page in the navigation: every live page
     with its target keyword and position, impressions, clicks, movement against the prior
     period, number of searches it appears for, inbound link count, last deliberate edit,
     frozen-until date and index status. Clicking a page opens every search it ranks for
     (position, impressions, movement, on Google and on Bing), its trend chart with edit
     markers, its open opportunities, its verdict history and its buttons.
   - **Searches** and **Target keywords** lists on the Search page, as described above.
   - Every list sorts by any column, filters, searches by text and exports CSV.

## Phase 2: CrawlRaven parity (approved by the founder 2026-11-11, "Yes, build them all")

The first version covered the core. A check of the built code against CrawlRaven's documented
features found these gaps, which phase 2 closes. The Monday page stays five priorities; everything
here is a standing list or a tool.

1. **Keywords page (target keyword management).** Tabs: Targeted, Discovered, Ignored, Topics.
   Discovered lists searches the site already shows for that are not targets; each can be adopted
   (with the page meant to win it and a priority: high, medium, low) or ignored, singly or in bulk
   (up to 200). Keywords can be imported from a CSV (generic, Ahrefs or Semrush column names;
   difficulty columns are ignored). Labels: "right page", "ranks elsewhere", "not returned",
   "partial evidence", "two targets want the same search". The desk keeps adopted keywords,
   priorities and ignores in its own state; `docs/seo/keyword-registry.json` is read, never written.
   The like-for-like position stays registry-only so it stays comparable with `target-positions`.
2. **Filters and date ranges.** 7, 14, 28, 90 days, 16 months, this month, last month, last
   quarter, and a custom range. Filters: search contains, is exactly, does not contain; page the
   same; country; device. Filters show as removable chips and live in the address so a view can be
   bookmarked. A filtered or custom view pulls from Search Console on demand and is cached.
3. **Ranking distribution.** How many searches sit in places 1 to 3, 4 to 10, 11 to 20, 21 to 50
   and beyond, now against the period before.
4. **Topics and keyword map.** Searches grouped by shared words into topics, each with its
   searches, total views, the pages that serve it, whether two pages compete for it, and whether
   any page targets it. Labelled as an approximate grouping. The keyword map is the same data by
   page.
5. **Internal link suggestions.** For a page that needs links: which other live pages mention its
   keyword without linking to it, with the phrase to use as the link text. Each suggestion can be
   marked done or dismissed.
6. **Technical audit.** The desk fetches the live site's own pages and runs a focused set of
   checks in six groups (reachability and indexing, on-page, structured data, links, security,
   speed hints), each issue with severity (critical, warning, notice), what was found, why it
   matters, the fix and the affected pages sorted by clicks. Audit history, "new since last audit"
   and "fixed since last audit", an optional weekly run, CSV. Speed is labelled as hints from the
   page's weight, not measured speed.
7. **Ranking by outcomes.** GA4 interest signals per landing page become a capped score signal
   (never applied below a minimum sample; labelled interest, not sales). A strategic keywords list
   in Settings raises importance. New preset: Interest signals first.
8. **Visitors panels.** Source and medium, country and device from GA4.
9. **Annotations.** Restore an archived note; permanent delete only when archived. Google's
   published ranking updates appear automatically as markers.
10. **Searches drawer.** Clicking a search opens its trend, the pages that rank for it and Target
    or Ignore buttons; arrow keys move between rows. The same arrow keys work on Pages.
11. **Chart and monitoring controls.** Line or area, download the chart as an image, and a Pause
    monitoring switch that stops the morning refresh.

Not built, on purpose: CrawlRaven's MCP server and Chrome extension.

## Phase 3: rebuild around a sidebar and the standard names (approved by the founder 2026-11-12, "Ok, rebuild it")

The founder could not find cannibalization in the desk. It was built, but under an invented name
("Two pages competing") and two levels down. Phase 3 fixes findability and look, and adds what is
still missing against CrawlRaven's screens.

Decisions (the founder approved the layout; the three defaults below are the builder's calls and
are easy to change):

- **Layout.** A left sidebar grouped by job, replacing the top bar: Plan (This week); Search
  (Performance, Queries, Pages); Insights (Keyword map, Cannibalization, Runner-up keywords,
  Content gaps, Decay, Internal links, All opportunities); Health and AI (Technical audit, AI
  visibility, Visitors); Workspace (Did it work?, Keywords, Competitors, Settings). Each Insights
  entry shows a live count. On a phone the sidebar collapses behind a menu button.
- **Names.** The standard SEO terms are the labels: cannibalization, runner-up keywords, content
  gaps, decay, keyword map, internal links, click rate, position. Every page and card type carries
  one plain sentence under the term saying what it means ("Two of your pages are competing for the
  same search."). The plain sentences stay; the invented labels go.
- **Look.** Dark theme by default with a light switch (builder's call), one accent colour, big
  tabular numbers, monospace small labels, generous spacing. Every colour is a variable so both
  themes stay in step.
- **Performance page.** Four big numbers (clicks, impressions, whole-site click rate, target
  keyword position like for like), one chart of clicks and impressions, top queries and top pages
  side by side, countries and devices. Site-wide average position is still not shown; the fourth
  number is the like-for-like target position, with one line saying why.
- **Each insight is its own page** built from the same card: priority badge, type badge, the
  evidence line with numbers, a "Recommendation" line labelled as a hypothesis with its test, and
  Done, Snooze, Dismiss. Cannibalization shows each search with the pages splitting it, their
  shares, the page that should win, and the choice "consolidate" or "differentiate". Decay has
  Growing and Decaying tabs for pages and for searches.
- **Keyword map** as one table: keyword, status (targeted or discovered), mapped to (a page, or
  "Unmapped"), position, views, the page Google shows, with counters for opportunities, runner-up
  and cannibalized.
- **Content gaps** as cards: a proposed working title, the topic, a "Why" line from the views the
  site already earns, and the pages that should link to it on day one.
- **Technical audit.** Severity becomes critical, high, medium, low; each finding carries an
  effort tag (quick win, moderate, larger job) and an impact tag, numbered "how to fix" steps, and
  the affected pages sorted by clicks. A health card shows pages audited, open issues, last audit
  and the next scheduled one.
- **AI visibility** split by kind of question (alternatives, category, brand) and by assistant,
  from the existing citation checks. Review counts and Reddit tracking are not added (builder's
  call: new data sources, not requested twice).
- **Weekly plan export.** A print view of the week's plan with the evidence for each item, saved
  as a PDF through the browser's print dialog.
- **Claude skill** (builder's call, in place of an MCP server): `.claude/skills/seo-desk.md` lets
  Claude Code answer "what should I work on this week?", "where is cannibalization?", "what
  slipped?" from the desk's local read-only routes.
- **Reliability.** A source that fails is retried after 20 minutes, up to three times that day; the
  desk notices when the Mac wakes from sleep and refreshes what is stale; a failed morning run no
  longer sits red all day.

## Ask box and email links (approved by the founder 2026-11-14, "Yes, build both")

- **Ask.** A box in the desk where the founder types a question and reads the answer there. The
  desk gathers its own data, passes the question and that data to the Claude command-line tool
  already installed on this Mac, and shows the reply as plain text. Claude is given no tools, no
  file access and no project instructions: it can read what the desk hands it and nothing else, so
  text from outside (search phrases, competitor titles, feeds) cannot make it act. It answers under
  the same rules as the Claude skill: only from the desk's data, every number with its date range,
  recommendations as hypotheses, never sales, the one-edit-a-week rule respected, no actions taken.
  One question at a time; the last 20 questions are kept in the desk's own data folder.
- **Email links.** The technical audit used to skip every `/cdn-cgi/` address. Cloudflare's
  protected email links return 404 to crawlers (measured 2026-11-13 on five pages Ahrefs flagged).
  The audit now reports them as one low finding with the two choices: turn off Cloudflare's Email
  Address Obfuscation, or keep it and accept the report.
- Not added: testing links to other websites. The desk still contacts only the founder's own site.
