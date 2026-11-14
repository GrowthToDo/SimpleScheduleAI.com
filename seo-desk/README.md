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

- **This week.** What should I do this week, what is my biggest upside, and should I worry? The jobs the desk suggests, the next best chances, things that got worse, things that are just waiting, and pages to leave alone for now. You can lock the plan, and **Save the plan as a PDF** gives a clean printed copy with the evidence for each job. How many jobs it suggests, three or five, is a setting (see Settings).

### Search

- **Performance.** How is search doing? Clicks, impressions (the times the site was shown), click rate (the share of those that became clicks), and the average place of the keywords we aim at, with one chart and the top searches, top pages, countries and devices.
- **Queries.** Every search we show up for, with how it moved. A query is the words someone typed into Google.
- **Pages.** Every live page: its target keyword and place, impressions, clicks, how many searches it appears for, links pointing to it, its last edit, and whether Google has it.

### Insights

Each of these opens a list of cards. A card shows what was measured, then a recommendation labelled as a hypothesis (a good guess, not a fact) with the test that will settle it. You can mark it done, snooze it or dismiss it.

- **Keyword map.** One table of every keyword we target or could target: its status (Live when it is mapped to a live page, Pending when there is no page yet), the page it is mapped to (or "Unmapped"), its place, how often it was shown, and the page Google actually shows. A pending keyword may carry a note that an existing page may already cover it, so a section on that page may be better than a new page.
- **Cannibalization.** Two of your pages are competing for the same search. Each search with the pages splitting it and their shares. You choose **consolidate** (merge them into one), **differentiate** (make each answer a different need) or **Leave alone** (keep the split as it is; the card leaves the list and the desk stops raising it). A split can be fine when the two pages serve different needs. When the desk thinks a split is probably on purpose, for example the main page and one of its own posts, the card says so.
- **Runner-up keywords.** Searches where you sit just off page one, so a small push may matter.
- **Secondary keywords.** Searches a page already appears for but does not target. The card shows how often and at what place, and suggests working the phrase into that page. **Adopt as secondary** records it as a secondary keyword of that page. It does not become a target and does not change the target position. Marking one done counts as the week's one page edit. Under the list, the ones you marked done or dismissed are kept so you can **Reopen** one you marked by mistake; reopening a done one ends its 28 day freeze. To take back an adopted secondary keyword, use Remove on the Keywords page.
- **Content gaps.** Searches you already appear for that no page is written for, with a proposed working title and the pages that should link to it.
- **Decay.** Pages and searches that are being shown less than before, with a Growing tab beside the Decaying one. Each decaying page gets a label for the kind of drop, always a hypothesis: lost rankings (its place got worse), lost demand (its place held but fewer people searched), lost clicks at the same place, or cause unclear (the numbers do not say; look in Search Console first).
- **Internal links.** Links to add from one of our pages to another, with the words to use for the link.
- **All opportunities.** The full list behind the other pages and the week, with the reason for each rank in a "Why this rank" drawer.

### Health and AI

- **Technical audit.** Is anything broken? The desk reads our own live pages and lists problems by how serious they are (critical, high, medium, low), how big the job is (quick win, moderate, larger job), and the steps to fix each. It also shows which pages Google has and which it is missing.
  Pages that show an email address get one low finding: Cloudflare scrambles the address to hide it from spam collectors, and crawlers such as Ahrefs see the scrambled link as broken. Turning off Email Address Obfuscation in Cloudflare clears it, or you can keep the protection and leave the finding as it is.
- **AI visibility.** Are AI assistants naming and citing us? Split by kind of question (alternatives, category, brand) and by assistant. Counts read "at least", because the check looks at a limited number of answers.
- **Visitors.** What do people do once they arrive? Where visits come from, top landing pages, template downloads and form sends (these are interest, not sales), and where visitors get stuck.

### Workspace

- **Did it work?** Were my past changes better, worse, or is it too early to say? Verdicts on edits to live pages, which are still waiting, and which pages are frozen for 28 days. The button **I edited a page** records a change you made by hand so the desk can judge it. **What we have learned** is a short list of lessons you write down from the verdicts. A lesson starts as a trial, becomes proven when three linked verdicts all say better (or all say worse), and is dropped when its linked verdicts disagree.
- **Keywords.** Add or remove the keywords we aim at, pick the page meant to win each one, and import a list. Keywords you added here, and secondary keywords you adopted, are removed here with Remove.
- **Competitors.** Did a competitor move? New or removed pages, and changes to their pricing or calls to action.
- **Settings.** How the ranking works (you can change the weights), how many priorities each week (3 or 5), your money pages, strategic keywords, brand words, the state of each source and its last error, three switches (Pause monitoring, Show Google updates, Weekly technical audit), and a button to download everything.

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

The desk does not show one average place for the whole site. It misleads while new posts publish every week. The number you see is the average for the keywords we target that have data in both periods.

## The one-edit-a-week rule

One live-page improvement a week. Never the same page twice inside 28 days. Each edit is judged on the 28 days before and the 28 days after. The desk plans the week by this rule, shows the date a frozen page can be edited again, and warns before you break it.

## The dark and light look

The desk opens dark. The switch at the bottom of the menu changes it to light, and the desk remembers your choice on this computer.

## What the dots mean

Each source of data has a dot next to its name.

- **Green:** fresh. Pulled recently.
- **Amber:** stale. It is older than it should be. The desk will try again.
- **Red:** failed. The last try did not work. The desk keeps the last good data and shows the error in plain words.
- **Grey:** needs sign-in. The connection to that service has to be signed in again.

When a source fails, the desk tries it again 20 minutes later, up to three times that day. Some sources are treated differently:

- Clarity is never tried again that day, because it limits how often it answers.
- The check that asks Google whether each page is indexed is tried once more, because Google limits how many pages it will answer for in a day.
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
