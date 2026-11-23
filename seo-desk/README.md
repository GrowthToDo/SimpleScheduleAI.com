# SEO Desk

A private page on your own computer that shows how the website is doing in search, and what to do about it this week. Only you can see it. The desk never edits a page of the website and never sends anything anywhere. A few buttons do save record files in the website folder; each one says so first (see "Buttons that change files in the repo").

One thing to hold on to while you read it: rankings, views and visits are not sales. Customers come through personal contacts. The desk tracks how easy we are to find, and says so on every page.

## Start it

Double-click `Open SEO Desk.command` in the `seo-desk` folder. It opens the desk in your browser at http://127.0.0.1:8766. If the desk was not running, the file starts it first and waits a few seconds.

You can also start it from Terminal, in the website folder:

    npm run seo-desk

If you installed the daily run (see below), the desk is already running whenever your Mac is on, and the same file simply opens the page.

The desk opens on "This week". If a source of data is more than 12 hours old, it refreshes in the background and the page updates when it is done.

## The layout

The menu is down the left side: Ask at the very top, then five groups. At the top of the page you see "Data through" with a date, one dot for each source of data, and a **Refresh now** button. On a phone the menu folds away behind a menu button.

Every page has a plain sentence under its title saying what it means. Every number says which dates it covers. Search Console runs about two days behind, so the newest two days are never in.

Some menu names have a number beside them. It is not the same kind of number everywhere. This week counts worries. Technical audit shows how many critical and high issues are open to fix first, or a tick when there are none (the score out of 100 is on the page). Keyword map counts keywords. The Insights pages count what is still open. A dash means that data has not been pulled yet.

### Ask

- **Ask.** Type a question in plain words and read the answer on the page, for example "What should I work on this week?" or "Why did a page drop?". The small box at the top of the menu does the same from any page. The desk hands your question and its own numbers to Claude: your question and the desk's search and visitor numbers are sent to Claude to write the answer. Claude is given only the desk's numbers and is told to answer from them. Check a number on its page before you act on it. Claude can read the desk but cannot change anything: it has no tools, opens no files and takes no action, so it tells you which page and button to use instead. It uses the Claude sign-in on this Mac. If the page says Claude is not signed in, open the Claude app or type `claude` in Terminal, sign in, then press **Try again**. Answers take a few seconds to a minute, one question at a time. The last 20 questions and answers are kept in the desk's data folder on this Mac; **Clear** removes them.

### Plan

- **This week.** What should I do this week, what is my biggest upside, and should I worry? The jobs the desk suggests, the next best chances, things that got worse, things that are just waiting, and pages to leave alone for now. The jobs are the real top things for this week, most important first: anything broken, the next post in your plan, the Newsroom pieces you picked on the Newsroom page (two at most, never a page change), the week's big page change and small page change while each is still free (each says which it is, and they are never the same page or two pages that compete for one search), a check on past changes once one can be read (it finished its 28 days, the data covers them and no other edit overlaps it), then small tasks that are not page changes (asking Google to index pages that already have links, a page that needs links, open work, a setup fix from the technical audit). Each job says why it is on the list. A "write a post" idea is never one of them: your plan file decides which posts get written. Once this week's big or small change is made, one line says which ("This week's big change is used (/page, 23 November); the small one is still open."). Fewer jobs than the setting is normal; the desk never pads the list. Adding a page change to the jobs for a page that is frozen, was edited lately (found in git), or when this week's page change of that size is already made asks you first, the same way marking a change done does. You can lock the plan, and **Save the plan as a PDF** gives a clean printed copy with the evidence for each job. How many jobs it suggests is a setting (see Settings): up to three or up to five, real tasks only, and fewer when fewer qualify. The Next verdict tile gives the next date a verdict can actually be read; changes that are due but overlap another edit cannot be read, and the week says so in one line with the buttons that clear them (Judge now, then Save these verdicts on Did it work). "Pages to leave alone" is one count, the same here, on Pages and on Did it work, with what makes it up (logged edits, edits found in git, splits you chose to keep). Every worry says when its page may be edited ("Can be edited from 16 November" or "Leave it until 7 December"), in the same words as the page's own detail, and "last edited" is said only of a deliberate edit; a small git change reads "a small change on 3 November (1 line)". An item on a page that may not be edited now is never pushed: no Swap in, no "Mark as started", no priority, and it sits after the items you can work on now. On every other card not yet started the main button is "Copy brief for Claude": paste the brief into Claude Code to do the work, because the desk never changes the site itself. "Mark as started" only records that the work began, and Done records that it is live. All opportunities hides those by default (Free to edit) and says how many it hides. A worry is only something that needs a look this week; a page that slipped but is best left alone for now (it was just edited, your plan already lists its change, or fewer people are searching for it) is listed under "Watching, nothing to do yet", and the Worries tile takes you straight to the list. **Leave it** on a watched page puts it away until the date to look again; it does not count as the week's page change and freezes nothing.
- **Monthly report.** How did one calendar month go? Pick a month (every full month the desk holds, newest first; the current month is marked "so far"); the address keeps it, so a report can be bookmarked. From the top: the month and its dates, then four big numbers (Google clicks, Google impressions, click rate and the average place of the keywords we aim at), each against the month before. Months have different numbers of days, so every change is worked out per day and says so ("per day, against September's 30 days"); the totals stay totals. The current month is compared with the same days at the start of the month before. A month only appears once Search Console has finished its last day. Then a chart of each day of the month with page edits and Google updates, a few plain sentences built from the numbers (what moved, never why), the top 10 pages and top 10 searches (clicks on rare searches are a floor, because Google hides some), the keywords we aim at (how many improved, held or slipped by one place or more, and how many had no data in one of the two months), what was done in the month from the desk's own records (posts published, deliberate page edits, verdicts read and how each reads, the last technical audit score in the month), and other sources (Bing, visits by channel, the AI citation check) only when the desk holds that month's numbers; otherwise one line says it cannot answer, never a zero. The footer says when each source was pulled. The month's searches are pulled from Search Console the first time a month is opened (a few seconds) and kept, for good once the month is over. **Save as PDF** prints it on A4 in black on white from either theme, **Copy as text** gives a plain version for an email, and **Download CSV** gives every page, search and target keyword of the month, each row with the month and its dates. It is the page for the monthly audit on the 1st.
- **Newsroom.** What could I write for the Newsroom this week? At the top, **Suggested for this week** shows at most five stories, and fewer when fewer qualify (the list is never padded): only fresh Tier 1 and 2 stories that pass five hard filters, that you have not held or dropped and that are not only a press release. The filters are your own checks, done first: (a) the story applies to a Critical Access Hospital (a story about OPPS, IPPS, the Physician Fee Schedule, nursing homes or PBJ does not, unless it names critical access hospitals); (b) it is not already covered (when one of our live pages already carries its number, its rule section, or its program and measure together, it goes under **Update an existing page** with that page and the date it can be edited); (c) it has a Texas angle (a story about another state and not Texas fails, unless our Texas version is live, which makes it an update); (d) a quotable primary source can exist (a contract still in talks or a tentative deal with no public terms fails, as does a story only paywalled outlets ran); (e) enough reporting, or a dated change ahead (a story only one outlet reported, with no dated change ahead, is not rising yet; a Texas rural or critical access story passes on one report). Medicare's 340B payment rate, residency slots and school nurses also fail (a), and a story that names no US state and no federal rule or program fails (c). When nothing passes, the list says so and stays empty. Stories that fail sit folded under **Filtered out**, each with the filter's name and its reason, and the counts by filter. The score is Relevance x Freshness: Freshness is high for a new main fact (a number or a rule) in the last week, stays high while a dated change in the story is still ahead, and fades fast for a story with nothing new in it. Stories are counted by distinct reports, not reprints ("2 reports, 12 reprints of one wire story"), and stories about the same place, program and topic (a state, a program such as Medicaid, and a topic such as a backlog) are one card. A story about the same place and subject as a piece we published in the last 45 days loses some score and names those pieces ("Second Texas Medicaid piece in six weeks", with each piece and its date), so you can judge whether the angle is new. A story about Texas or critical access counts a little more. Each says in one line why ("Tier 1, Texas, 4 reports in 5 days, nothing on our site yet"), and the sidebar number counts only these. Every card has **Your checks**: **Check the results page** looks up the reader's question (prefilled, and you can change it) on Google through DataForSEO; it costs about $0.002, asks you first, and never runs on its own. The desk keeps the top ten titles and sites with the card and does not judge them: you set **Can we be first** (1 to 5) and **Citable hook** (0 or 1) yourself, and until both are set the card shows its draft score. Under it, **Ask Claude for this week's topic** sends Claude the method, the five filters, the top 40 fresh stories that pass them, each filtered story with its reason, our articles, the last 90 days of the topic log and the plan's next five posts, and shows up to three topics with why each fits, how it differs from what we published, the angle for a small Texas hospital and a possible hook marked "to verify", each with its own Copy brief for Claude. It uses your own Claude sign in on this Mac, costs no money, takes up to two minutes, runs only when you press it, and its answer is kept for the day. Every story of the last 14 days is folded below. Stories that share one of our topics ("Medicaid expansion", the Rural Health Transformation awards) within 10 days are one card, and word forms match (expand and expansion). Each morning the desk reads 14 Google News searches (the method's seeds, such as nurse staffing, rural hospital closure, Texas Medicaid) and four trade press feeds (Becker's Hospital Review, Fierce Healthcare, KFF Health News, The Daily Yonder), keeps the last 14 days, and turns them into one card per story. The top says when the feeds were read and how many answered; **Refresh now** reads only the news feeds again. Each card shows every outlet that ran the story (with its date and a link that opens in a new tab), its tier from the method's relevance gradient with the words that put it there ("Tier 1: nurse staffing, rural hospital"; Tier 3 is never shown), and a draft score: Relevance and Freshness are the desk's drafts, while "Can we be first" and "Citable hook" are your checks, because they need the results page and a reading of the sources. A press release or paid placement says it is not citable as a peg. Under "What we already have" the card names the article that covers it, a blog post close to it, a decision in your topic log (`docs/seo/articles-trendjacking-plan.md`: dropped, held, parked or being written, with the date and reason) or the plan post it matches, with the words that matched. The tabs are Fresh, Already covered or decided, Held, Dropped and Picked, each with its count; the sidebar number is the Fresh count. **Copy brief for Claude** is the main button: the brief loads the method, lists the story and its outlets, and asks Claude to check the results page and the hook, score it, log the decision in the topic log, and write a draft only after you say go. **Hold** puts a story away until a date (a week by default), **Drop** needs a short reason, and **Reopen** brings either back. **Pick for this week** puts it into This week as a "Newsroom piece", after the new post and before the page change; at most two a week, and it never uses the week's page changes. **Published** (Done) records the piece is live. **Paste a link you found** reads one https news page (public sites only) and makes the same card. Nothing on this page writes a file in the repo.

### Search

- **Performance.** How is search doing? Clicks, impressions (the times the site was shown), click rate (the share of those that became clicks), and the average place of the keywords we aim at, with one chart and the top searches, top pages, countries and devices. The same date bar as Queries and Pages (7, 14, 28, 90 days, 16 months, this month, last month, last quarter or your own dates), kept in the address. This month and last month are compared with the month before, and last quarter with the quarter before, per day when their lengths differ, and the page says so. A block that cannot follow the dates says which dates it shows: the keyword average always covers its own latest 28 days, the top searches the stored 28 or 90 days, and countries and devices the latest 28 days.
- **Queries.** Every search we show up for, with how it moved. A query is the words someone typed into Google. The Target keywords tab follows the dates you pick too (pulled from Search Console the first time, then kept), and its CSV names the dates on every row and in the file name.
- **Pages.** Every live page: its target keyword and place, impressions, clicks, how many searches it appears for, links pointing to it, its last edit, and whether Google has it.

### Insights

Each of these opens a list of cards. A card shows what was measured, then a recommendation labelled as a hypothesis (a good guess, not a fact) with the test that will settle it. You can mark it done, snooze it or dismiss it. Each card also says how many extra Google clicks a month the change could bring ("About 8 extra clicks a month if this works (an estimate from your own click rates, 18 October to 14 November)"), with the sum behind it; a card of a kind the desk cannot estimate says so. See **Extra clicks estimate** below.

- **Keyword map.** One table of every keyword we target or could target: its status (Live when it is mapped to a live page, Pending when there is no page yet), the page it is mapped to (or "Unmapped"), its place, how often it was shown, and the page Google actually shows. A pending keyword may carry a note that an existing page may already cover it, so a section on that page may be better than a new page.
- **Cannibalization.** Two of your pages are competing for the same search. Each search with the pages splitting it and their shares. You choose **consolidate** (merge them into one), **differentiate** (make each answer a different need) or **Leave alone** (keep the split as it is; the card leaves the list and the desk stops raising it). A split can be fine when the two pages serve different needs. When the desk thinks a split is probably on purpose, for example the main page and one of its own posts, the card says so.
- **Runner-up keywords.** Searches where you sit just off page one, so a small push may matter.
- **Secondary keywords.** Searches a page already appears for but does not target. The card shows how often and at what place, and suggests working the phrase into that page. **Adopt as secondary** records it as a secondary keyword of that page. It does not become a target and does not change the target position. Marking one done counts as one of the week's page changes (big unless you pick small). Under the list, the ones you marked done or dismissed are kept so you can **Reopen** one you marked by mistake; reopening a done one ends its 28 day freeze. To take back an adopted secondary keyword, use Remove on the Keywords page.
- **Content gaps.** Searches you already appear for that no page is written for, with a proposed working title and the pages that should link to it. Each is something to consider adding to the plan. A search one of your pages already shows for (10 times or more) or targets is not a gap: it becomes a "Strengthen a page" card for that page on All opportunities, because a new post would compete with it. A search a planned post already covers is left out, and the page says how many.
- **Decay.** The pages that passed the drop rule and the spike check (the only pages the desk calls decaying). A card whose advice is to leave the page (fewer people searching, or edited lately) is marked Watching instead of a priority and sits after the cards to look at; the Pages to look at tile counts only those. Below, every page and search shown less or shown more than before, any fall or rise. Each decaying page gets a label for the kind of drop, always a hypothesis: lost rankings (its place got worse), lost demand (its place held but fewer people searched), lost clicks at the same place, or cause unclear (the numbers do not say; look in Search Console first). The card, its brief, All opportunities and the worry on This week all give the recommendation and test of that kind of drop. A page whose earlier four weeks held one unusually busy week is not counted as decaying when, without that week, the drop is too small: it is folded under "One busy week, not a real drop", with the week's dates and both numbers. Each decaying page shows its views week by week. A lost demand card offers **Leave it**, which puts it away for 28 days without using the week's page change.
- **Internal links.** Links to add from one of our pages to another, with the words to use for the link.
- **All opportunities.** The full list behind the other pages and the week, with the reason for each rank in a "Why this rank" drawer. **Sort: Most extra clicks** puts the ones with the biggest click estimate first; the line under the title says which click rates the estimates rest on, and the CSV has an `extra_clicks_a_month_estimate` column. There are no cards for a page or search that shows on Google and not on Bing (or the other way): Bing's reports list only part of what Bing shows, so a row missing from them proves nothing. Bing's own figures stay on Performance and in the Bing column of the Queries list.

### Health and AI

- **Technical audit.** Is anything broken? The desk reads our own live pages and lists problems by how serious they are (critical, high, medium, low), how big the job is (quick win, moderate, larger job), and the steps to fix each. When a check is new since the last audit, the pages it finds are listed apart, never as new problems. A setting that touches every page (the title ending, the inline stylesheet) is one finding, not a page edit. A run made before one of its checks changed says so once at the top ("This run used older rules for N checks. Run the audit again."), and those findings do not say they count as the week's page edit. It also shows which pages Google has and which it is missing, and how old the oldest answer from Search Console is. A page Google is missing gets the same advice there and on its Not indexed card. Every count of links to a page counts links written in other pages' text; menu and footer links are not counted, so a page linked only from the footer reads 0.
  Pages that show an email address get one low finding: Cloudflare scrambles the address to hide it from spam collectors, and crawlers such as Ahrefs see the scrambled link as broken. Turning off Email Address Obfuscation in Cloudflare clears it, or you can keep the protection and leave the finding as it is.
- **AI visibility.** Are AI assistants naming and citing us? Split by kind of question (alternatives, category, brand) and by assistant. Counts read "at least", because the check looks at a limited number of answers.
- **Visitors.** What do people do once they arrive? Where visits come from, top landing pages, template downloads and form sends (these are interest, not sales), and where visitors get stuck.

### Workspace

- **Did it work?** Were my past changes better, worse, or is it too early to say? Verdicts on edits to live pages (its tabs count page results; a change too early to judge has its own Waiting count), how many due changes can be read and how many cannot (another edit overlaps them), what Judge now will do today, which are still waiting, and the pages to leave alone (the same count as This week). The button **I edited a page** records a change you made by hand so the desk can judge it. **What we have learned** is a short list of lessons you write down from the verdicts. A lesson starts as a trial, becomes proven when three separate linked changes all say better (or all say worse), and is dropped when its linked verdicts disagree. Pages changed in one commit are one change, and a verdict that another change overlaps says it cannot be read, so it does not count. When the verdict on a whole commit cannot be read, the change is read from its pages that no other edit overlaps: all better reads better, all worse reads worse, both reads mixed. The verdict count, the list and the worries on This week all use that one reading. The verdict count on the page counts changes the same way and leaves out the ones that are too early.
- **Keywords.** Add or remove the keywords we aim at, pick the page meant to win each one, and import a list. Keywords you added here, and secondary keywords you adopted, are removed here with Remove.
- **Competitors.** Did a competitor move? New or removed pages, and changes to their pricing or calls to action.
- **Settings.** How the ranking works (you can change the weights; Upside, the extra clicks estimate, is one of the eight and gets 21% in every ready-made setting, 3% taken from each of the other seven), how many priorities each week (up to 3 or up to 5, real tasks only, fewer when fewer qualify), your money pages, strategic keywords, brand words, the state of each source and its last error, three switches (Pause monitoring, Show Google updates, Weekly technical audit), and a button to download everything.

## The words the desk uses

- **Search Console.** Google's free tool that reports how the site shows up in search. Most of the numbers come from it.
- **Impressions.** The times a page was shown in search results. Some pages say "views" or "times shown"; it is the same thing.
- **Click rate.** Out of the times a page showed in search, how often someone clicked. Judged per page only, and only when there are enough impressions to mean something.
- **Position.** The place on Google's results page. 1 is the top. Page one ends at 10.
- **Target keyword.** The one search a page is written to win.
- **Indexed.** Google has added the page to its search results. A page that is not indexed cannot show up.
- **Money pages.** The pages that sell the service. You list them in Settings.
- **Cannibalization.** Two of your pages competing for the same search.
- **Runner-up keyword.** A search where you sit just off page one.
- **Secondary keyword.** A search a page already shows for but is not written to win.
- **Content gap.** A search we already appear for but no page is written for.
- **Decay.** A page or search that is being shown less than before.
- **Keyword map.** Which keyword belongs to which page.
- **Internal link.** A link from one of our pages to another.
- **Hypothesis.** A suggestion that may help. The desk never says it knows the cause.
- **Extra clicks estimate.** How many more Google clicks a month a change could bring, worked out from your own site's click rates, never from industry averages. The rate is pooled: all the clicks divided by all the times shown, over the last 90 days (28 when the 90-day search list is missing), for your searches shown 20 times or more, brand searches left out, in four groups by place (1 to 3, 4 to 5, 6 to 10, 11 to 20). A group with fewer than 20 clicks says "Not enough clicks yet to estimate" instead of a number. The page rate is the same over your pages. The card's own times shown and clicks are the latest 28 days. A runner-up keyword is times shown x (your rate at positions 3 to 5 minus its own rate), the value if the page reaches the top 5. A low click rate page in the top 5 uses its group's rate; lower down, your page rate. An unanswered question uses your rate across all searches. Each line names the rate and its days ("from your own 90-day page click rate, 0.78%, 17 August to 14 November"). A low click rate card is a page on page one (position 10 or better), shown 200 times or more in the latest 28 days, whose click rate is under half your own page rate; it is titled "gets fewer clicks than your other pages" and never quotes an industry figure. A page that lost rankings counts the clicks it lost. Everything else (cannibalization, internal links, not indexed, Newsroom, verdicts, a drop from lower demand) has no estimate. Under 20 times shown says not enough data, and zero or below shows no estimate. Months are 28 days x 30 / 28. It is a hypothesis, and the Upside signal in the score reads it on a log scale (1,000 a month is the top). The Monthly report lists the biggest ones under "Most extra clicks it could bring, now", and Ask Claude carries the same list.

The desk does not show one average place for the whole site. It misleads while new posts publish every week. The number you see is the average for the keywords we target that have data in both periods.

## The weekly page change rule

Each week allows one big live-page change and one small one, on different pages (changed from one a week on 17 November 2026). Big means a new or rewritten section. Small means a title, meta description, heading, a single line or a single link. A row in the plan's "Improve these live pages" table is big or small by the BIG: or SMALL: its "What to do" starts with (an untagged row is big). An opportunity whose fix is a title or meta description (low click rate) is small and every other one is big; a pick beside Done ("This was a small change" or "This was a big change") records the size you choose. Never the same page twice inside 28 days, and never two pages that compete for the same search in one week. Each edit is judged on the 28 days before and the 28 days after. The desk plans the week by this rule (one big and one small card, each saying which it is), shows the date a frozen page can be edited again, and warns before you break it. Settings shows the rule in one line.

The desk also reads the repo's git history for the last 35 days. A page changed by 15 or more lines in one commit in the last 28 days (not counting fixes made within 2 days after it was published) that no card, plan row or "Edit:" note recorded shows "Edited 9 November (found in git, 299 lines). Leave it until 7 December unless that edit was minor". The desk does not propose it for the week, lists it under Leave these alone, and asks again before you mark a change to it done. A smaller change only adds an "Also touched on" line, and does not use either of the week's page changes; an edit of 15 lines or more found in git uses the big one. Once this week's big or small change is made, every other page change of that size says when the next one can go in ("Next big page change from 30 November"). If git cannot be read, the desk says so at the top of each page and goes by the freeze alone. If the repo files were last read before the desk read git, This week says "Recent edits from git have not been read yet. Refresh to read them."

## The dark and light look

The desk opens dark. The switch at the bottom of the menu changes it to light, and the desk remembers your choice on this computer.

## What the dots mean

Each source of data has a dot next to its name.

- **Green:** fresh. Pulled recently.
- **Amber:** stale. It is older than it should be. The desk will try again.
- **Red:** failed. The last try did not work. The desk keeps the last good data and shows the error in plain words.
- **Grey:** needs sign-in. The connection to that service has to be signed in again.

When a source fails, the desk tries it again 20 minutes later, up to three times that day. Some sources are treated differently:

- Clarity limits how often it answers, so a Clarity error is not tried again that day. The one exception is when Clarity does not answer at all (it hangs until the time limit). Then the desk tries it once more, an hour later.
- The check that asks Google whether each page is indexed is tried once more, because Google limits how many pages it will answer for in a day.
- The news feeds for the Newsroom page are tried once more, because they are read once each morning. One feed that does not answer never stops the others; the Newsroom page names it.
- A source that needs sign-in is not tried again, because waiting does not fix it. You sign in (see below).

The desk never tries again while a refresh is already running. After the last allowed try it waits for the next morning. If your Mac sleeps and wakes, the desk notices and refreshes whatever is out of date. A failed morning run does not leave a red dot sitting there all day.

## What costs money

One thing: **Run citation check** on the AI visibility page. It costs about $0.62 each time, and the page shows the current cost. It always asks first and tells you the cost. Nothing else in the desk costs money, and nothing paid ever runs by itself.

## Buttons that change files in the repo

The desk never edits a page of the website. But a few buttons run a script that writes to files in the website folder. Each one names the files first and waits for your yes. Nothing is committed or published for you. The changes show up as ordinary edits you can look at and commit yourself.

Four buttons save record files:

- **Judge now** (Did it work?): adds new verdicts to `docs/seo/change-log-verdicts.jsonl`. It shows a trial run first.
- **Run citation check** (AI visibility): adds a line to `docs/seo/aeo-trend.jsonl`. This is the one that costs money.
- **Check competitors now** (Competitors): updates the saved snapshots and logs in `docs/seo/competitor-snapshots/` and `docs/seo/sitemap-snapshots/`.
- **I edited a page** (Did it work?): adds a line to `docs/seo/change-log-notes.jsonl`.

Three buttons on the Technical audit page are different:

- **Run site check** builds the site and looks for broken links, missing titles and pages nothing links to. It writes the `dist/` build folder, which git does not track. Nothing else.
- **Run the technical audit** reads your live pages one at a time. It writes no file in the repo.
- **Check every page on Google now** asks Search Console about every live page, 40 at a time. It writes no file in the repo and takes half an hour or more.

Everything else the desk does, such as marking a card done, writes only inside the desk's own folder.

## Where the data lives

The desk keeps everything it pulls, your statuses, notes, lessons, settings and weekly plans in the `seo-desk/data/` folder on this computer. That folder is never added to git, so none of it leaves your machine. Keeping each day's pull means the history grows past the 16 months that Search Console keeps. **Download everything** in Settings makes a backup.

The logs for the background run are in `seo-desk/data/logs/`.

## The daily refresh

While the desk is running, it refreshes all its sources by itself every day at 06:00. The weekly technical audit, when its switch is on, runs by itself every Monday after that. To stop all of it for a while, turn on **Pause monitoring** in Settings. **Refresh now** still works while paused.

To keep the desk running whenever your Mac is on, install it once. In Terminal, from the website folder:

    node seo-desk/install-daily.mjs

To look at what it would install without changing anything, add `--print`.

To remove it:

    node seo-desk/install-daily.mjs --remove

Running the install again is safe. It replaces the earlier copy. If the desk stops opening after a Node upgrade, run the installer again.

## If a dot goes grey

A grey dot means that service needs you to sign in again. Sign in the usual way, the same way you did when you first connected it. The desk never signs in for you and never asks for a password. When you are back in, press **Refresh now** and the dot turns green.

## Ask Claude about the desk

With the desk running, you can ask Claude Code questions in plain words, for example:

- What should I work on this week?
- Where is cannibalization?
- Which pages are decaying?
- Did my changes work?
- What have our edits taught us?
- Is anything broken on the site?

Claude reads the desk's own answers and nothing else, quotes the dates they cover, and says when a source is behind. It only reads. It never marks things done, refreshes, or runs a paid check unless you ask for that in your own words. If the desk is not running, Claude says so and gives the start command above. The instructions Claude follows are in `.claude/skills/seo-desk.md`, with notes beside it in `.claude/skills/seo-desk/`.
