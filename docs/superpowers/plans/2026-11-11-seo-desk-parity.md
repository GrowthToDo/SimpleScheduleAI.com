# SEO Desk Phase 2 (CrawlRaven parity) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the feature gaps between the SEO Desk and CrawlRaven's shipped app: keyword management, filters and custom ranges, ranking distribution, topics, link suggestions, a technical audit, outcome-weighted ranking, more GA4 panels, annotation restore, Google update markers, search drawers and chart controls.

**Architecture:** Same app (`seo-desk/`, Node 22, no dependencies). Each back-end feature is its own module plus one route file dropped into `seo-desk/lib/api/ext/` (auto-loaded; `seo-desk/lib/api.mjs` is not edited). Pages are plain ES modules under `seo-desk/static/views/`.

**Tech Stack:** Node 22 ESM, `node:test`, vanilla JS, hand-written SVG.

**Spec:** `docs/superpowers/specs/2026-11-10-seo-desk-design.md`, section "Phase 2: CrawlRaven parity" (plus the whole document's Anti-goals and Constraints, which still bind).

## Global Constraints

- Everything in `.superpowers/sdd/2026-11-10-seo-desk/context.md` "Global Constraints" still binds (no dashes or jargon in person-readable text, never read `.env*`, never print `.mcp.json`, nothing under `seo-desk/data/` in git, synthetic fixtures, 127.0.0.1 only, reuse not copy from `scripts/lib/`, do not modify `scripts/`, `docs/` or `src/`, page-level click rate only, no site-wide average position, no keyword difficulty, minimum-data gates, confirm before anything that costs money or writes tracked files).
- Route files: a feature's routes live in ONE new file `seo-desk/lib/api/ext/<feature>.mjs` exporting `routes` (an array of `{method, path, handler}`), built with the helpers in `seo-desk/lib/api/kit.mjs` (`get, post, put, del, q, bodyOf, bad, sendText`). Every GET returns `{...envelope(model), ...}` from `seo-desk/lib/api/model.mjs` and returns 200 with `empty:true` when there is no data. Do not edit `seo-desk/lib/api.mjs`.
- File ownership is exclusive. A task edits only the files its "Files" line lists. If a change is needed elsewhere, record it in the report as a concern.
- Desk state for new features lives in new files under `state/` in the data dir, written through `seo-desk/lib/store.mjs`.
- The real desk runs under launchd on port 8766 with real data. Never stop it, never POST to it, never write to `seo-desk/data/`. Develop against a COPY of the data folder (`SEO_DESK_DATA=<copy>`) on your own port with `createServer({autoRefresh:false})`.
- No MCP child process may be left running after a task. Never run Clarity, the citation check, `judge`, `competitors` or the edit-note endpoint.
- Each task writes its routes' response shapes to `.superpowers/sdd/2026-11-11-seo-desk-parity/api-<feature>.md`.
- Tests: `node --test seo-desk/tests/*.test.mjs` passes (226 at the start); new logic is test-first; tests never touch the network or spawn real servers.
- Workers commit their own task with explicit paths only; never `git add -A`, push, stash, reset or switch branches.

## Review Focus

1. A filtered or custom-range view whose live pull fails or is slow: the page keeps the unfiltered data and says in plain words that the filtered view could not be loaded. (Task 2 test)
2. A CSV import with a byte-order mark, quoted commas, blank rows, 10,000 rows or no keyword column: clean rows are imported, the rest are counted and explained, nothing throws. (Task 1 test)
3. The audit meeting a page that redirects, times out, returns 500 or is not HTML: the page becomes an issue, the audit continues, and the run always finishes. (Task 4 test)
4. Topic grouping on one-word searches, non-English text and brand names: no topic of everything, no crash, brand searches kept apart. (Task 3 test)
5. Google's update feed being unreachable or changing shape: the previous markers stay, nothing breaks. (Task 5 test)
6. An adopted keyword that is also in the registry, or adopted twice with different pages: one row, the registry wins, the conflict is labelled. (Task 1 test)

---

### Task 1: Keyword management, outcome signal, GA4 panels, pause switch (back end)

**Files:** Create `seo-desk/lib/targets.mjs`, `seo-desk/lib/api/ext/targets.mjs`, `seo-desk/tests/targets.test.mjs`. Modify `seo-desk/lib/score.mjs`, `seo-desk/lib/config.mjs`, `seo-desk/lib/sources/ga4.mjs`, `seo-desk/lib/api/model.mjs`, `seo-desk/lib/api/panels.mjs` (visitors and settings views only), `seo-desk/lib/api/actions.mjs` (`changeSettings` only), `seo-desk/lib/refresh.mjs` (the pause check only), and their existing tests.

**Produces:**

- `state/targets.json`: `{adopted: [{keyword, page, priority, intentGroup, source: 'discovered'|'import', addedOn}], ignored: [keyword], priorities: {keyword: 'high'|'medium'|'low'}}`. Keywords are compared lower-cased and trimmed.
- `allTargets({registry, state}) -> [{keyword, page, priority, intentGroup, origin: 'registry'|'adopted'}]` (registry wins on a duplicate); `discovered({qpCur, targets, ignored, brands, minImpressions=20}) -> [{query, impressions, position, rankingPage}]`; `labelTarget(target, qpCur) -> 'right page'|'ranks elsewhere'|'not returned'|'partial evidence'` (partial evidence: fewer than 10 impressions); `intentConflicts(targets) -> [{intentGroup, keywords, pages}]` (same group, different pages); `parseKeywordCsv(text) -> {rows: [{keyword, page, priority, volume}], skipped: [{line, why}]}` accepting header names `keyword|query|search`, `url|page|current url`, `priority`, `volume|search volume` in any case, a byte-order mark, quoted fields, at most 5,000 rows, difficulty columns ignored.
- Routes: `GET /api/targets?tab=targeted|discovered|ignored` (rows carry position, impressions, ranking page, label, priority, origin); `POST /api/targets/adopt` `{items:[{keyword, page, priority?, intentGroup?}]}` (1 to 200, page must be a live page); `POST /api/targets/ignore` `{keywords:[]}`; `POST /api/targets/restore` `{keywords:[]}`; `PUT /api/targets` `{keyword, page?, priority?, intentGroup?}` (adopted rows fully editable; registry rows accept `priority` only); `DELETE /api/targets` `{keyword}` (adopted only); `POST /api/targets/import` (raw CSV body, max 2 MB) returning `{imported, skipped}`; `GET /api/export/targets-all.csv`.
- Score: a `priority` on a target multiplies the `importance` signal (high 1.0, medium 0.8, low 0.5, capped at 1); `settings.strategicKeywords: [string]` sets importance to 1 for opportunities whose query or target keyword matches; a new signal `outcome` in 0..1 from GA4 interest-signal events per landing page (`min(1, events/5)`), `null` when the page has fewer than 30 sessions in the period; new preset `interest-signals-first`; existing presets give `outcome` weight 0.05 taken from `demand` so weights still sum to 1.
- GA4: pulls `landingPage` x `eventName` event counts for the interest events, and sessions by `sessionSourceMedium`, `country`, `deviceCategory` (current and previous 28 days) into `ga4.data.outcomes: [{page, events, sessions}]`, `sourceMedium`, `countries`, `devices` (each `[{name, sessions, prevSessions}]`). `/api/visitors` returns them.
- `settings.paused: boolean`: when true the morning schedule and `ensureFresh` do nothing and `/api/sources` carries `paused: true`; "Refresh now" still works.

- [ ] Tests first for every pure function above with the Review Focus cases 2 and 6; adoption of a non-live page is a 400; registry rows reject a page change; an ignored keyword disappears from Discovered and reappears after restore; `outcome` is null under 30 sessions; presets sum to 1; a paused desk skips the schedule.
- [ ] Implement, write `api-targets.md`, commit.

### Task 2: Explorer: filters, custom ranges, ranking distribution, search detail (back end)

**Files:** Create `seo-desk/lib/explore.mjs`, `seo-desk/lib/api/ext/explore.mjs`, `seo-desk/tests/explore.test.mjs`.

**Produces:**

- `resolveRange(spec, today) -> {start, end, prevStart, prevEnd, label}` for `7|14|28|90|480`, `this-month`, `last-month`, `last-quarter`, and `custom` with `start`/`end` (ISO, start <= end, end <= today minus 3, span <= 480 days).
- `buildFilters({q, qmode, page, pmode, country, device}) -> filters[]` for the Search Console tool (`contains|equals|notContains` map from `contains|exact|excludes`); validation errors are 400 with plain words.
- `explore({dim: 'query'|'page', range, filters, limit=1000}, {call}) -> {rows: [{key, clicks, impressions, position, prev: {...}|null, movement}], totals, range, filters, cached, fetchedAt}`: two live pulls (current and previous period) through an injected `call(tool, args)`; results cached in `cache/explore/<sha1 of params>.json` for 12 hours; a failed pull throws an error whose message is one plain sentence.
- `distribution(rows) -> [{bucket: '1 to 3'|'4 to 10'|'11 to 20'|'21 to 50'|'51 and beyond', count, prevCount}]` from query rows with positions, counting a search once at its impression-weighted position.
- `searchDetail(query, range, {call}) -> {query, series: [{date, impressions, clicks, position}], pages: [{page, impressions, clicks, position, share}]}` (two live pulls: `date` and `page`, both filtered to the exact query).
- Routes: `GET /api/explore?dim=&range=&start=&end=&q=&qmode=&page=&pmode=&country=&device=`; `GET /api/distribution?range=` (uses stored pulls for 28 and 90 days, else explore); `GET /api/search-detail?query=&range=`; `GET /api/explore/options` (countries and devices seen in the stored pulls, with plain names).
- The live `call` opens the Search Console server through `seo-desk/lib/mcp-client.mjs` with an `AbortSignal` and a 60 second limit, and always closes it.

- [ ] Tests first with an injected `call`: every range spec, every filter mode, invalid input, cache hit within 12 hours and miss after, a failing pull, distribution buckets at the edges (3.0, 3.01, 10, 20, 50), Review Focus case 1.
- [ ] One live check against a copy of the data: an explore call filtered to a page containing `12-hour` for a 14-day range returns rows; record only counts. Confirm no `mcp-gsc` child is left.
- [ ] Write `api-explore.md`, commit.

### Task 3: Topics, keyword map, internal link suggestions (back end)

**Files:** Create `seo-desk/lib/topics.mjs`, `seo-desk/lib/links.mjs`, `seo-desk/lib/api/ext/topics.mjs`, `seo-desk/tests/topics.test.mjs`.

**Produces:**

- `tokens(query) -> [string]` (lower-case, strips punctuation, drops stop words and words of one letter, light stemming of plural `s`/`es`); `topicsOf(queryRows, {brands, minShared=2}) -> [{id, label, queries: [{query, impressions, position, page}], impressions, pages: [{page, impressions, share}], competing: boolean, targeted: boolean, targetPage}]`: searches join a topic when they share at least two non-stop tokens with its core (greedy, highest-impression search seeds a topic; a search with fewer than two usable tokens forms its own single-search topic only when it has 30 or more impressions); brand searches go to one topic labelled "Searches for a brand name"; `label` is the seed search; `competing` when two or more pages each hold 20 percent or more of the topic's impressions; `targeted` when a registry or adopted keyword falls in the topic.
- `keywordMap(queryPageRows) -> [{page, queries: [{query, impressions, position}], impressions}]`.
- `linkSuggestions({targetPage, keyword, posts, inbound, max=5}) -> [{to, from, anchor, context}]`: `posts` is `[{page, text}]` (markdown body of live posts and pages read from `src/data/post`, `src/data/article`, `src/pages`); a suggestion is another page whose text contains the keyword or its two-or-more-token core as a phrase, does not already link to the target, and is not the target; `anchor` is the matched phrase as written; `context` is the sentence around it (at most 160 characters); ranked by the from-page's impressions. `loadPosts(repoRoot)` reads the files (front matter stripped, drafts skipped) and is cached by file mtime.
- Suggestion state `state/link-suggestions.json`: `{[to + '|' + from]: {status: 'done'|'dismissed', at}}`.
- Routes: `GET /api/topics?range=28|90` ; `GET /api/keyword-map`; `GET /api/link-suggestions?page=` (omit `page` for every page that has a needs-links or near-page-one opportunity, top five each); `POST /api/link-suggestions` `{to, from, status: 'done'|'dismissed'|'open'}`; `GET /api/export/topics.csv`, `GET /api/export/link-suggestions.csv`.

- [ ] Tests first, including Review Focus case 4, a search joining exactly one topic, stable topic ids across two runs, a page that already links being excluded, anchors preserving original case, drafts skipped.
- [ ] Live sanity on a copy of the data: report topic count, the size of the largest topic, and how many link suggestions the top five needy pages get (counts only).
- [ ] Write `api-topics.md`, commit.

### Task 4: Technical audit (back end)

**Files:** Create `seo-desk/lib/audit/crawl.mjs`, `seo-desk/lib/audit/checks.mjs`, `seo-desk/lib/audit/run.mjs`, `seo-desk/lib/api/ext/audit.mjs`, `seo-desk/tests/audit.test.mjs`. Modify `seo-desk/lib/jobs.mjs` (register the `audit` job only), `seo-desk/lib/refresh.mjs` (the weekly hook only).

**Produces:**

- `fetchPage(url, {fetchImpl, timeoutMs=15000}) -> {url, status, finalUrl, redirects, headers, html, ms, bytes, error}` (follows at most 5 redirects by hand, records each hop; only `https://simplescheduleai.com/` URLs are ever fetched; 1 request at a time with a 300 ms pause; user agent `SSAI-SEO-Desk-Audit`).
- `extract(html, url) -> {title, description, canonical, robotsMeta, h1s, headings, links: [{href, text, internal}], images: [{src, alt, hasSize}], jsonLd: [{raw, parsed|null, error}], scripts: {count, blocking}, stylesheets, wordCount, lang, viewport, og: {title, description, image}}` with a small tolerant parser (regular expressions over tags; no dependency).
- `CHECKS`: at least 40 checks, each `{id, group, severity: 'critical'|'warning'|'notice', what(pageOrSite), why, fix, test(page, site) -> boolean|detail}`, in six groups:
  - Reachability and indexing: non-200 status, redirect chain longer than 1, redirect to a different host, `noindex` on a page in the sitemap, canonical missing, canonical pointing elsewhere, page in the sitemap but not linked from any page, page linked but not in the sitemap, `http://` version not redirecting, trailing-slash duplicate.
  - On-page: title missing, title over 60 characters, title under 20, duplicate title, description missing, description over 160, description under 70, duplicate description, no H1, more than one H1, H1 equal to title, heading level skipped, fewer than 300 words on a post, `lang` missing, viewport missing.
  - Structured data: no JSON-LD on a post, JSON-LD that does not parse, Article without `headline`, `datePublished` or `author`, FAQPage with no questions, BreadcrumbList missing on a post, Organization missing on the home page.
  - Links: internal link returning 4xx or 5xx, internal link that redirects, link with empty text, more than 150 links on a page, external link over plain http.
  - Security: no HSTS header, mixed content reference, no `X-Content-Type-Options`, cookie without `Secure`.
  - Speed hints (labelled hints, not measured speed): HTML over 200 KB, more than 3 blocking scripts in the head, image without width and height, image without `alt`, more than 15 scripts, no compression header.
- `runAudit({pages, fetchImpl, onProgress, clicksByPage}) -> {startedAt, finishedAt, pagesChecked, score: 0..100, groups: [{group, score}], issues: [{id, group, severity, what, why, fix, pages: [{page, detail, clicks}]}]}`; score is 100 minus weighted share of pages with critical (weight 3), warning (1), notice (0.25) issues, floored at 0. A page that cannot be fetched is itself an issue and never stops the run.
- History: each run saved to `audits/<startedAt>.json`, index in `state/audits.json` (keep the last 26). `compareAudits(prev, cur) -> {added: [issue+pages], fixed: [...], unchanged: number}`.
- Job `audit` ("Run the technical audit": fetches the live site's own pages, costs nothing, writes no repo file). `settings.weeklyAudit: boolean` (default false): when true the first full morning refresh on a Monday starts the audit after the sources finish.
- Routes: `GET /api/audit` (latest run, group scores, issues sorted by severity then clicks, comparison with the run before, history list); `GET /api/audit/:startedAt`; `GET /api/export/audit.csv` (severity, check, group, page, detail, clicks, status new|unchanged); `POST /api/audit/settings` `{weeklyAudit}`.

- [ ] Tests first with HTML fixtures and an injected `fetchImpl`: each check fires on a bad fixture and stays quiet on a good one; Review Focus case 3; only the site's own host is fetched; compare finds added and fixed; history keeps 26.
- [ ] One live audit against the real site from a copy of the data (about 150 pages, a few minutes): report pages checked, score, and issue counts per severity (no page content).
- [ ] Write `api-audit.md`, commit.

### Task 5: Annotation restore and Google update markers (back end)

**Files:** Create `seo-desk/lib/google-updates.mjs`, `seo-desk/lib/api/ext/notes.mjs`, `seo-desk/tests/notes.test.mjs`. Modify `seo-desk/lib/sources/local.mjs` (add the updates fetch only), `seo-desk/lib/api/actions.mjs` (annotation functions only), `seo-desk/lib/api/work.mjs` (the timeline and markers builders only).

**Produces:**

- `parseIncidents(json) -> [{id, title, start, end|null, kind: 'ranking'|'other'}]` for Google's Search Status feed (`https://status.search.google.com/incidents.json`), tolerant of missing fields; `fetchGoogleUpdates(fetchImpl)` with a 10 second limit, keeping the previous list on any failure; stored in `local.data.googleUpdates`.
- Markers and the timeline include ranking updates as `{date, endDate, label, kind: 'google-update'}`; a per-user toggle `settings.showGoogleUpdates` (default true).
- Annotations: `archived` notes are hidden by default; `POST /api/annotations/:id/restore`; `DELETE /api/annotations/:id` archives a live note and permanently deletes an already-archived one (the response says which happened); `GET /api/annotations?archived=1` lists archived notes; each note has `title, date, endDate, category, detail`.
- Verdict cards: each verdict in `/api/results` gains `nearUpdates: [{label, date}]` for ranking updates inside its before or after window, with the plain note "A Google ranking update fell inside this period, so read this verdict with care."

- [ ] Tests first: feed parsing on a good fixture, a truncated one and a changed shape (Review Focus case 5); restore; delete twice; archived listing; `nearUpdates` window edges.
- [ ] One live fetch of the feed: report how many ranking updates fall in the last 480 days.
- [ ] Write `api-notes.md`, commit.

### Task 6: Pages for Keywords, filters, distribution, topics, search drawer, chart controls

**Files:** Create `seo-desk/static/views/keywords.js`, `seo-desk/static/views/filters.js`, `seo-desk/static/views/search-drawer.js`. Modify `seo-desk/static/app.js` (the eleventh route "Keywords" between Search and Pages), `seo-desk/static/app.css`, `seo-desk/static/chart.js`, `seo-desk/static/views/table.js`, `seo-desk/static/views/search.js`, `seo-desk/static/views/pages.js` (arrow keys and the filter bar only), `seo-desk/static/README-views.md`.

- [ ] `filters.js`: one filter bar component (range buttons 7, 14, 28, 90 days, 16 months, This month, Last month, Last quarter, Custom with two date inputs; Search and Page text filters each with contains, is exactly, does not contain; Country; Device) rendering removable chips, reading and writing the address hash, with "Clear all". Used by Search and Pages.
- [ ] `search.js`: when a filter or a non-stored range is active the Pages and Searches lists come from `/api/explore` with a visible "Loading from Search Console" state and a plain failure line that keeps the unfiltered list; a "Where searches sit" section draws `/api/distribution` as horizontal bars with the period before beside each; the Target keywords tab links to the Keywords page.
- [ ] `search-drawer.js`: clicking a search opens its trend (`/api/search-detail`), the pages that rank for it with shares, and Target (choose page and priority) or Ignore buttons; Up and Down arrows move to the next row in both the Searches and Pages tables (add `onKeyNav` to `table.js`), Esc closes.
- [ ] `keywords.js`: tabs Targeted, Discovered, Ignored, Topics, Keyword map; adopt and ignore singly and in bulk (select up to 200); edit page, priority and group inline for adopted rows, priority only for registry rows; label chips; "two targets want the same search" banner from `intentConflicts`; CSV import with a preview of what will be added and what was skipped and why; Topics as expandable groups with competing and not-targeted chips and "Adopt the lead search"; CSV exports.
- [ ] `chart.js`: `mode: 'line'|'area'` with a small switch, and "Download image" (SVG to PNG through a canvas, white background, title and date range drawn in).
- [ ] Verify in a real browser on a copy of the data: no console errors; a custom range and each filter mode load and show chips; adopt, ignore, restore, edit and import work and survive reload; arrow keys move the drawer; the image downloads; layout holds at 390 px. Screenshots of Keywords and filtered Search at 1280 px.

### Task 7: Pages for the audit, visitors panels, settings, annotations, link suggestions

**Files:** Create `seo-desk/static/views/audit.js`, `seo-desk/static/views/links.js`, `seo-desk/static/phase2.css`. Modify `seo-desk/static/index.html` (link `phase2.css` only), `seo-desk/static/views/health.js`, `seo-desk/static/views/visitors.js`, `seo-desk/static/views/settings.js`, `seo-desk/static/views/results.js` (annotations and verdict notes only), `seo-desk/static/views/opportunities.js` (an "Internal links" tab only), `seo-desk/static/views/drawer.js` (a suggestions block only).

- [ ] `audit.js` inside Site health: overall score and six group scores as tiles, "New since last audit" and "Fixed since last audit", issues grouped by severity with what, why, fix and the affected pages sorted by clicks (each with Open the page and Open in Search Console), a history list to open an earlier run, "Run the technical audit" behind a confirm that says it fetches your own live pages, costs nothing and writes no file in the repo, a weekly switch, CSV. Speed checks carry the line "Hints from the page's weight, not measured speed."
- [ ] `visitors.js`: three more panels (Where visits came from by source, Countries, Devices) with the same minimum-visits gate; the interest-signal counts per landing page with the standing not-sales line.
- [ ] `settings.js`: Strategic keywords list editor; the new preset; Pause monitoring switch with a plain explanation; Show Google updates switch; Weekly audit switch.
- [ ] `results.js`: archived notes list with Restore and Delete for good (confirm), Google update markers in the timeline with their own chip, and the "read with care" note on verdicts that have `nearUpdates`.
- [ ] `links.js` + `opportunities.js` + `drawer.js`: an "Internal links" tab listing suggestions (link from, to, the words to link, the sentence), each with Done, Dismiss and Copy as a brief for Claude; the same block inside an opportunity's drawer when its page has suggestions.
- [ ] Verify in a real browser on a copy of the data: no console errors on Site health, Visitors, Settings, Did it work? and Opportunities; every confirm opens with the right words (cancel them, except running the audit once against the copy); switches persist across reload and are restored; layout holds at 390 px. Screenshots of the audit and the Internal links tab at 1280 px.
