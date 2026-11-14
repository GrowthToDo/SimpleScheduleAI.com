# SEO Desk page views: the contract

The page shell (`index.html`, `app.css`, `app.js`, `theme.js`, `views/nav.js`) draws the sidebar and
the bar at the top of the content, and routes `#/<name>` to a view module. Each page is one ES module,
loaded by the browser as it is. No build step, no npm packages, nothing fetched from the network
except the desk's own `/api/...`.

### Routes and the sidebar

`ROUTES` in `app.js` maps each route to its module in `views/` (without `.js`):

| Route                | Module                                                                                                   | Sidebar                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `ask`                | `ask` (a question answered by Claude from the desk's data; `q=` only fills the field)                    | Above the groups: Ask, with the compact ask field under it                                   |
| `week`               | `week`                                                                                                   | Plan: This week (count: worries, red above zero)                                             |
| `performance`        | `overview`                                                                                               | Search: Performance                                                                          |
| `queries`            | `search` (the Searches list, its filter bar and where searches sit; `tab=targets` opens Target keywords) | Search: Queries                                                                              |
| `pages`              | `pages`                                                                                                  | Search: Pages                                                                                |
| `keyword-map`        | `keyword-map` (one table, counters that filter it)                                                       | Insights: Keyword map                                                                        |
| `cannibalization`    | `cannibalization` (drawn by `insight.js`)                                                                | Insights: Cannibalization (amber above zero)                                                 |
| `runner-up`          | `runner-up` (drawn by `insight.js`)                                                                      | Insights: Runner-up keywords                                                                 |
| `secondary-keywords` | `secondary-keywords` (drawn by `insight.js`)                                                             | Insights: Secondary keywords                                                                 |
| `content-gaps`       | `content-gaps` (drawn by `insight.js`)                                                                   | Insights: Content gaps                                                                       |
| `decay`              | `decay` (drawn by `insight.js`)                                                                          | Insights: Decay (amber above zero)                                                           |
| `links`              | `internal-links` (wraps `links.js`)                                                                      | Insights: Internal links                                                                     |
| `opportunities`      | `opportunities`                                                                                          | Insights: All opportunities                                                                  |
| `audit`              | `health`                                                                                                 | Health and AI: Technical audit (count: open critical and high issues, "2 to fix", or a tick) |
| `ai`                 | `ai`                                                                                                     | Health and AI: AI visibility                                                                 |
| `visitors`           | `visitors`                                                                                               | Health and AI: Visitors                                                                      |
| `results`            | `results`                                                                                                | Workspace: Did it work?                                                                      |
| `keywords`           | `keywords`                                                                                               | Workspace: Keywords                                                                          |
| `competitors`        | `competitors`                                                                                            | Workspace: Competitors                                                                       |
| `settings`           | `settings`                                                                                               | Workspace: Settings                                                                          |
| `print/week`         | `print-week` (the week's plan to print or save as a PDF; This week links to it)                          | not in the sidebar                                                                           |

Old addresses keep working (`OLD_ROUTES`, `resolveRoute`): `#/health` goes to `#/audit`, `#/search` to
`#/performance`, a `#/search` link that names one of its lists or filters (`tab`, `q`, `pagefilter`,
`country`, `device`, dates) goes to `#/queries`, and `tab=pages` (on `#/search` or `#/queries`) goes to
`#/pages`, because the Pages list lives only there. Parameters are kept. The address is rewritten in
place, so Back does not bounce. Queries does not repeat Performance's big numbers, chart, countries or
devices. A hash that does not start with `#/` (the skip link's `#view`) is an in-page anchor, not an
address (`isRouteHash`); the skip link moves focus to the page without changing the address.

The sidebar groups, labels, plain sentences and count keys live in `views/nav.js` (`NAV`). Counts come
from `GET /api/nav` (`countView(entry, counts)`): before the reply the slot is empty; a key the reply
does not carry shows `-` and "Not available yet."; a null count shows `-` and names the source that has
not been pulled; the same words are in the link's name for screen readers (visually hidden), with the
visible number hidden from them. The shell recounts after every successful POST, PUT or DELETE through
`ctx.api` and after a refresh finishes, so a view never has to. Under 900 px the sidebar is a modal
panel opened by the menu button ("Open the menu" / "Close the menu") and closed by Esc, a tap outside
it, or picking a page; while it is open the page behind it is inert, and focus returns to the menu
button when it closes. The panel carries its own Close the menu button (`#side-close`), because the
menu button sits in the inert area behind it. The sticky top bar's height is measured into `--topline-h`; anything else that
sticks should sit at `top: calc(var(--topline-h) + 4px)`.

The Ask entry is not in `NAV` (the five groups stay as they are): `ASK_ENTRY` and `askBlock(h, onAsk)` in
`views/nav.js` draw the Ask link and a compact ask field above the groups; `buildNav(h, counts, {onAsk})`
puts it first, and the shell's `onAsk` hands the question to the page in memory (`handOver`) and opens `#/ask`. `views/ask.js` reads `GET /api/ask`
(`available`, `reason`, `suggestions`, `history`), sends `POST /api/ask` `{question}` and `DELETE
/api/ask` (Clear). Asking spends a Claude run, so only the founder's own action in this tab asks: Enter,
the button, a suggestion, or a question handed over by the sidebar field (`takeHandedQuestion`). A
`q=` in the address only fills the field and is then dropped from it (`startAction`), so a link from
another site or an email cannot make the desk ask. The answer is untrusted text: `answerBlocks(text)` reads paragraphs (split on blank
lines), lines starting with "- " or a number and a full stop as list items, and `**bold**`, and
`renderAnswer(h, text)` builds them with text nodes only. Never `innerHTML`, never a link made from
the answer. Both are tested in `tests/ask.test.mjs`. While a question runs the field and the
suggestions are disabled; a failure shows the server's plain sentence with Try again.

`views/nav.js` also exports `insightLinks(h, route, counts)`: the row of quick links (Decay,
Cannibalization, Runner-up keywords, Secondary keywords, Internal links, Content gaps) with their
counts, for the top of every insight page. `ctx.counts()` gives the last `/api/nav` counts (or null).
`views/insight.js` (`renderInsight(el, ctx, route)`) draws Cannibalization, Runner-up keywords,
Secondary keywords, Content gaps and Decay from `GET /api/insights/<route>`: the quick links, the term
as the title with its plain sentence, a row of counters whose first number is the sidebar's count, then
cards (or the Runner-up table). Its pure helpers (`stripHypothesis`, `dropKindText`, `runnerUpRows`,
`pageTwoCount`) are tested in `tests/views-phase3.test.mjs`. Each item's `priority`, `brief` and (for
Cannibalization) `measured` and `editPages` come from the server, with the hover line in
`priorityNote`; the page never works out a priority, a brief or a rule's number. Secondary keywords
lists the finished ones (`finished`) folded under the cards, each with Reopen.

Every sidebar number is the first number of its page, worked out by the same server function:
Internal links counts the link suggestions still to do (`/api/link-suggestions` `open`), All
opportunities the open ones (new, in progress or came back: `status=open`, the page's default view),
and on that view each type tab with its own insight page shows that page's count in its unit
(`types[].insightCount`, with `countNote` when a gap is several searches). `views/keyword-map.js` is the Keyword map; `views/print-week.js` the plan to
print. `#/opportunities?view=competing` now opens Cannibalization.

A page task replaces its own view module and does not edit `app.js`, `app.css`, `index.html`,
`theme.js`, `views/nav.js`, `views/card.js`, `views/drawer.js`, `views/table.js` or `chart.js`. If one
of those needs a change, say so in the task report.

### Colours and themes

Dark is the default; Light is a switch in the sidebar foot (`theme.js`, kept in `localStorage`). Every
colour is a CSS variable, defined once for dark under `:root` and once for light under
`:root[data-theme='light']` at the top of `app.css`. No view and no rule below those two blocks names
a colour (no hex or `rgb()`); `tests/shell.test.mjs` fails on one. Use the variables: `--bg`,
`--surface` (cards, tables), `--wash` (hover, quiet fills), `--raised`, `--line`, `--line-strong`,
`--ink`, `--muted`, `--faint`, `--accent` (lines, bars, focus), `--accent-text` (text and links in the
accent), `--accent-wash`, `--accent-line`, `--warn`, `--warn-wash`, `--warn-line`, `--bad`,
`--bad-wash`, `--bad-line`, `--series-1`, `--series-2`, `--paper` (white in both themes, for images). Amber (`--warn`) and red (`--bad`) are for
warnings and critical states only. Motion is a 120 ms fade (`--fade`) at most.

## The view module

```js
export async function render(el, ctx) {
  const data = await ctx.api.get('/api/search?range=28');
  ctx.envelope(data); // updates the source dots and "Data through" at the top of the content
  ctx.mount(el, ctx.h('h1', { class: 'page-title' }, 'Search'), maybeNull);
}
```

- `el` is a detached box. The shell swaps it in when `render` resolves, so a redraw never flashes an
  empty page. Do not measure sizes inside `render`; `lineChart` waits for a width on its own.
- Throwing (or a failed `ctx.api` call) shows a plain error banner with a Try again button.
- Use `ctx.mount(el, ...children)` or `ctx.h(...)` to add children: both skip `null`. The browser's
  own `el.append(null)` prints the word "null".
- Put `data-search` on the page's main search box: pressing `/` anywhere focuses it.

## ctx

| Field                                                                                               | What it does                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `route`                                                                                             | The route name, such as `'search'`.                                                                                                                                         |
| `params`                                                                                            | `URLSearchParams` of the part after `?` in the hash: `#/search?range=90` gives `params.get('range')`.                                                                       |
| `api.get(path)`, `api.post(path, body)`, `api.put`, `api.del(path, body?)`                          | JSON in and out. A string body is sent as `text/plain` (the AI CSV import). Rejects with `Error(message)` using the server's plain `{error}` sentence; `err.status` is set. |
| `toast(message, kind)`                                                                              | `kind`: `'info'` (default), `'success'`, `'error'`. An unhandled rejected promise also becomes an error toast.                                                              |
| `confirmBox({title, body, confirmLabel, cancelLabel, danger})`                                      | Resolves `true` or `false`. `body` keeps line breaks (`\n`).                                                                                                                |
| `promptBox({title, body, label, type, value, placeholder, min, confirmLabel, required, maxLength})` | Asks for one value. `type`: `'text'`, `'textarea'` or `'date'` (`min` is a `YYYY-MM-DD`). Resolves the trimmed text or `null`.                                              |
| `menu(anchor, [{label, onSelect}])`                                                                 | A small menu under a button (arrow keys and Esc work).                                                                                                                      |
| `copyText(text)`                                                                                    | Copies to the clipboard; resolves `true` or `false`.                                                                                                                        |
| `openDrawer(node, {title})`, `closeDrawer()`                                                        | The right side panel. Esc, the close button or a click outside closes it.                                                                                                   |
| `navigate(hash)`                                                                                    | Goes to `'#/opportunities?type=slipping'` (draws that page).                                                                                                                |
| `setParams({key: value})`                                                                           | Changes the hash query without drawing again (keep a search box's text in the address). `null` or `''` removes a key.                                                       |
| `reload()`                                                                                          | Draws the current page again with fresh data and keeps the scroll position. Call it after a POST.                                                                           |
| `envelope(data)`                                                                                    | Hands the API envelope (`sources`, `through`) to the bar at the top of the content.                                                                                         |
| `counts()`                                                                                          | The sidebar counts from the last `GET /api/nav`, or null before they arrive.                                                                                                |
| `h(tag, attrs, ...children)`                                                                        | Builds an element. `class`, `dataset`, `style` (object), `onclick` and other `on*` handlers, `value`, `checked`, `disabled`, `hidden`. Strings become text, never HTML.     |
| `mount(el, ...children)`                                                                            | Appends children, skipping `null`, `undefined` and `false`.                                                                                                                 |
| `fmt`                                                                                               | Formatting, below.                                                                                                                                                          |

`h`, `fmt`, `api` and the rest are also exported from `/app.js` for modules that need them outside
`render`: `import { h, fmt } from '../app.js';`.

### fmt

| Helper                              | Example                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fmt.num(v, {digits})`              | `12193` gives `12,193`; `null` gives `not enough data yet`                                                                                                          |
| `fmt.change(v, kind)`               | `'percent'`: `12` gives `+12%`, `-3.5` gives `-3.5%`; `'positions'`: `1.2` gives `1.2 places better`; `'count'`: `4` gives `+4`; `null` gives `not enough data yet` |
| `fmt.direction(v, {lowerIsBetter})` | `'up'`, `'down'` or `''`, for the `.tile-change.up` and `.down` colours                                                                                             |
| `fmt.date(iso)`                     | `2026-11-07` gives `7 November` (adds the year when it is not this year)                                                                                            |
| `fmt.dateShort(iso)`                | `7 Nov`                                                                                                                                                             |
| `fmt.range(r)`                      | `{start, end, text}` gives `r.text`, else `11 October to 7 November`                                                                                                |
| `fmt.position(v)`                   | `6.86` gives `6.9`; `null` gives `not enough data yet`                                                                                                              |
| `fmt.share(v, digits)`              | `0.46` gives `46%`, `0.0091` gives `0.9%`                                                                                                                           |
| `fmt.ago(iso)`                      | `just now`, `3 hours ago`, `2 days ago`                                                                                                                             |
| `fmt.plural(n, one, many)`          | `fmt.plural(3, 'page', 'pages')` gives `3 pages`                                                                                                                    |
| `fmt.isoPlus(days)`                 | today plus n days as `YYYY-MM-DD`, on this computer's calendar, like the server                                                                                     |
| `fmt.NOT_ENOUGH`                    | the exact text `not enough data yet`                                                                                                                                |

Every number on screen says the dates it covers (`fmt.range(data.range)`), and below a minimum the
page says `not enough data yet`. No em or en dashes in any text; plain words ("click rate", not
"CTR"). Search phrases from Google are data and are shown exactly as they come.

## Shared components

- `views/card.js` (insight options): `priority` (+ `priorityTitle`, the server's sentence), `chips`,
  `afterTitle`, `facts` (extra `[label, node]` rows), `afterFacts`, `endpoint(id)` (the POST address
  instead of `/api/item/<id>`), `only` (the actions offered), `ignoreAs: 'dismiss'` and `ignoreLabel`
  (a card whose button says Dismiss says Dismiss in its dialog and message too), `noPinNote`,
  `editPages` (the pages a Done edits; the confirm names every one, an empty list says no page edit is
  recorded) and `donePick` (Done first asks which page changed). A card shows its type's plain sentence
  (`explain`) under the badges. `postAction(ctx, path, body)` lives in `views/post-action.js` (no DOM, no
  `app.js`, tested in node) and is re-exported here: a 409 that carries `frozen`, `frozenPages` or
  `secondThisWeek` asks once per reason, then resends with `override: true`; any other refusal (such as
  "finished, press Reopen first") is the server's sentence as a plain message. Every Done on a page edit
  goes through it. The facts read Evidence and Recommendation (with the Hypothesis label).
- `views/card.js`: `renderCard(item, ctx, options)` draws an Opp, a week Card or a worry with every
  button (Start, Done, Snooze, Ignore, Reopen, Pin, Add note, Copy brief for Claude, Open the page, Open
  in Search Console) and the Why this rank drawer. Options: `variant: 'row'` for a compact line that
  opens into the card, `oppById` (Map) so week cards show their score, `extraActions`,
  `rowActions`, `selectable`, `onChange`. Item ids go in URLs through `encodeURIComponent`. Done on a
  live page change asks first, because it freezes the page for 28 days.
- `views/drawer.js`: `openDrawer`, `closeDrawer`, and `evidenceView(opp)` (score parts and evidence
  rows).
- `views/table.js`: `dataTable(el, {columns, rows, onRowClick, onKeyNav, rowKey, searchKeys, filters,
csvHref, onCsv, emptyText, pageSize, sort, label})` returns `{update(rows), setFilter(key),
visibleRows(), step(row, delta), markCurrent(row)}`. Click a header to sort (numbers start biggest
  first, empty values always last). Columns: `{key, label, format(value, row), sortable, align:
'right', wrap, title}`. Rows with `onRowClick` are focusable, open with Enter, and Up and Down move
  between them (showing more rows past the last one shown); `onKeyNav(row)` is called after each
  move. `rowKey(row)` finds a row again after `update` (default: the row itself). `visibleRows()` is
  every row after the search, chip and sort (not only those shown). `step(row, delta)` moves to the
  row `delta` places away, focuses and marks it (`aria-current`) and returns it, or null at either
  end. Clicks on links, buttons, inputs, selects and labels inside a row do not open it. `onCsv`
  replaces the `csvHref` link with a "Download CSV" button for lists built in the page. Also
  exported: `toCsv(header, rows)` (CRLF, quotes, a leading `= + - @` kept as text) and
  `downloadCsv(fileName, header, rows)` (saves it from the page, no network).
- `chart.js`: `lineChart(el, {series: [{date, value}], markers: [{date, label}], invert, format,
label, mode, controls, title, rangeText})` returns `{update(options), destroy()}`. Hand-written SVG,
  hover or arrow keys show the date and value, markers are dots on the bottom axis, `invert: true`
  for average place (lower is better), fewer than two points shows `not enough data yet`. `mode`:
  `'area'` (default, a light fill under the line) or `'line'`. `controls: true` adds a Line / Area
  switch (remembered in this browser) and "Download image", which saves the chart as a PNG on white
  in the light theme's colours whatever theme is on (it is meant for documents), with `title` and
  `rangeText` (default: first to last date) drawn above it, named from the title. Search and the search drawer use it.
- `chart.js`: `twoLineChart(el, {series: [{key, label, points: [{date, value}], format}] (two),
markers: [{date, kind: 'edit' | 'google-update', label}], label})`: two lines on two scales (left
  and right), a legend that toggles each line, page edits as dots on the bottom line and Google
  updates as dashed lines. The Performance page uses it.

## Filters, the search drawer and Up and Down (phase 2)

- `views/filters.js`: the filter bar for Search and Pages. `readFilters(ctx.params)` gives the state
  (`range` 7, 14, 28, 90, 480, this-month, last-month, last-quarter or custom with `start`/`end`;
  `q`/`qmode`, `pagefilter`/`pagemode` with contains, exact or excludes; `country`; `device`).
  `filterBar(ctx, {route, state, countries, today})` draws the range buttons (Custom opens two date
  fields), the filter fields (applied on Enter or Apply, never per key) and a removable chip per
  filter and for the dates, with "Clear all"; every change rewrites the address and redraws the page.
  `isExploring(state, storedRanges)` says when the lists must come from `/api/explore`, `apiQuery(state)`
  is its query string, `hashWith(hash, route, state)` and `chipsOf(state)` are the pure parts. The
  page filter is `pagefilter` in the address because `#/pages?page=/x` opens a drawer.
- A view that loads from `/api/explore` keeps the list already on screen, shows "Loading from Search
  Console" while a live pull runs, and on a 502 or 429 shows the server's sentence with Try again.
- `views/search-drawer.js`: `openSearchDrawer(query, ctx, {range, row})` (trend from
  `/api/search-detail`, the pages that rank with shares, Target or Ignore);
  `followRows(table, row, open)` opens `open(row)` in the drawer and lets Up and Down open the
  previous or next row of that table while it is open (Esc still closes, focus goes back to the row);
  `askTarget(ctx, {keywords, page})` is the Target form (page, Priority (optional), Search group
  (optional)); `adoptKeywords`, `ignoreKeywords`, `restoreKeywords` post and toast; `livePages(ctx)`
  lists the live pages for page pickers. `shareList(pages, {extra})` draws pages with the server's
  `share`; `shareText(p)` and `shareWidth(p)` are its pure parts. A null share (too few views to split)
  shows the plain count ("shown 12 times") and no bar. The Keywords Topics tab uses the same list.

## Percentages and shares come from the server

The pages never work out a percentage change or a share themselves: they format the server's
`change`, `impChange` or `share` with `fmt.change` / `fmt.share` (null reads "not enough data yet").
The server sends null under the minimum (a change needs an earlier number of at least 20; a search or
topic needs 30 views before its pages get shares; "pages compete" needs 30 views and 10 on each
page). `tests/minimum-data.test.mjs` fails if a view file contains "(a - b) / b" arithmetic.

## Chart markers

`views/markers.js` holds the label of every marker kind the server sends (`publish`, `edit`, `note`,
`annotation`, `google-update`): `markerText(m)` gives the hover line ("Google update: November
core update"), `markerLabel(kind)` the word alone. Search, Pages and Did it work all use it; a test
checks every kind in `lib/api/work.mjs` has a label.

## Buttons that cost money or write files

Before `POST /api/jobs/:key` (or anything else that spends money or writes a tracked file), show what
will happen with `confirmBox`: the cost and the files from the API (`jobs[].cost`, `jobs[].writes`).
Only then send `{confirm: true}`.

## CSS classes (all in app.css)

| Class                                                                                                                                                             | Use                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `.page-head`, `.page-title`, `.page-sub`                                                                                                                          | The top of a page: big title, one or two plain lines under it, buttons on the right |
| `.section`, `.section-head`, `.section-title`, `.section-note`                                                                                                    | A block of the page with its heading and a small note                               |
| `.cols`                                                                                                                                                           | Two columns (wide left, narrow right) that stack under 900 px                       |
| `.cols-even`, `.panel`, `.section-first`                                                                                                                          | Two equal columns that stack under 1100 px; a section drawn as a card               |
| `.tiles-four`, `.tiles-one`, `.tiles-note`, `.tile-value.is-warn`, `.is-danger`                                                                                   | Four big numbers in a row (two under 1100 px); one; the line under them             |
| `.table-flush`, `.table-compact`                                                                                                                                  | A table inside a panel without a second frame; tighter rows                         |
| `.insight-links`, `.insight-link`, `.nav-count` (`.is-warn`, `.is-danger`)                                                                                        | The insight quick links row and its counts                                          |
| `.legend`, `.legend-item`, `.seg-range`                                                                                                                           | Chart legend toggles; range buttons in a page head (inside `.seg`)                  |
| `.stack`, `.row`                                                                                                                                                  | Vertical spacing between children; a wrapping row of small things                   |
| `.tiles`, `.tile` (or `button.tile` with `aria-pressed`, laid out top down), `.tile-label`, `.tile-value` (`.is-text` for words), `.tile-change` (`.up`, `.down`) | Big numbers                                                                         |
| `.btn`, `.btn-primary`, `.btn-quiet`, `.btn-danger`, `.btn-small`, `.icon-btn`                                                                                    | Buttons. One `.btn-primary` per area                                                |
| `.chip`, `.chip-accent`, `.chip-bad`, `.chip-warn`, `.chip-hyp`                                                                                                   | Small labels. `.chip-hyp` is the dashed Hypothesis label                            |
| `.chips`, `.chip-btn` with `aria-pressed`, `.count`                                                                                                               | Filter chips                                                                        |
| `.tabs`, `.tab` with `aria-selected`, `.count`                                                                                                                    | Tabs with counts                                                                    |
| `.toolbar`, `.grow`, `.input`, `.select`                                                                                                                          | Search box, sort and CSV row                                                        |
| `.banner`, `.banner-warn`, `.banner-bad`, `.banner-accent`                                                                                                        | A message across the page                                                           |
| `.empty`, `.loading`                                                                                                                                              | Empty state (say what to do next) and loading text                                  |
| `.card`, `.card-top`, `.card-title`, `.facts`, `.card-actions`, `.card-links`                                                                                     | The card (drawn by card.js)                                                         |
| `.item-row`                                                                                                                                                       | The compact row form of a card                                                      |
| `.side-list`, `.side-date`, `.plain-list`                                                                                                                         | Lists with rules between items; a list without rules                                |
| `.share-list`, `.share-head`, `.bar` (`.is-winner`)                                                                                                               | Horizontal share bars                                                               |
| `.table-wrap`, `.table`, `.table-foot`, `.num`, `.cell-wrap`                                                                                                      | Tables (drawn by table.js)                                                          |
| `.kv`                                                                                                                                                             | A small two column list of names and values                                         |
| `.muted`, `.small`, `.num`, `.sr-only`                                                                                                                            | Text helpers                                                                        |
| `.fb`, `.fb-chips`, `.chip-x`, `.fb-loading`, `.fb-summary`, `.fb-scope`                                                                                          | The filter bar, its removable chips, the loading and summary lines under it         |
| `.chart-tools`, `.seg`                                                                                                                                            | The chart's Line / Area switch and Download image (drawn by chart.js)               |
| `.dist`, `.dist-row`, `.dist-now`, `.dist-before`                                                                                                                 | "Where searches sit": this period's bar with the period before under it             |
| `.bulk-bar`, `.fold-list`, `.fold`, `.fold-sum`, `.fold-meta`, `.fold-body`, `.switch-label`, `.dialog-wide`, `.input-small`, `.select-small`                     | Bulk buttons for a selection, folding groups (Topics, Keyword map), small controls  |

Any element with the `hidden` attribute is hidden, whatever its class sets for `display`.

The page must hold at 1280 px and at 390 px wide with no sideways scroll; wide tables scroll inside
`.table-wrap`.

## Shared page helpers (`views/jobs.js`)

For pages that run a confirmed job or show big numbers. Import what you need:
`import { jobBlock, tile, daysText } from './jobs.js';`

- `jobBlock(ctx, jobsData, key, {label, primary, confirm: {title, body, confirmLabel}})` returns
  `{button, panel, resume}`. `jobsData` is the reply of `GET /api/jobs`, fetched with the page's own
  data. Put `button` in the page head and `panel` under it. Clicking asks with `ctx.confirmBox`
  first, then sends `POST /api/jobs/<key>` with `{confirm: true}`, polls `GET /api/jobs` every
  three seconds, and calls `ctx.reload()` when the job ends. The panel shows one plain line (how it
  went and when), the job's `summary` line, and the raw output folded away under "Details from the
  script". Call `resume()` once after `ctx.mount` so a job that was already running keeps being
  followed. Did it work uses it for Judge now (`judge-preview`, then `judge`), Site health for the
  site check, the keyword check and `index-all`.
- The panel styles (`.jb-panel`, `.jb-summary`, `.jb-details`, `.jb-warn`) are in `app.css`, and so
  are the phase 2 `p2-` classes (the old `phase2.css` is folded in).
- `tile(h, label, value, change, {text, dir, warn})` draws one big number. `text: true` for a word
  value, `dir: 'up' | 'down'` colours the small line, `warn: true` makes it amber.
- `daysText(n)` gives `today`, `1 day ago` or `n days ago`.

## Card rules worth knowing

- A card with `readOnly: true` (the week's "This week's page edit is done" card) shows no buttons.
- Done on a page that is still frozen: the server answers 409 with `frozen: {page, since, until,
sinceText, untilText}` (and `frozenPages`, every frozen page when one Done edits several, as a split
  search folded into one does); `card.js` then asks a second time, plainly, naming each, and resends with
  `override: true`. `ctx.api` errors carry the whole reply as `err.data` for this.
- Done on a page edit when this week's page edit is already dated: 409 with `secondThisWeek:
{page, date, dateText}`; `card.js` asks "You already made this week's page edit on 9 November.
  The rule is one a week. Mark this one done anyway?" (`confirmSecondEdit`), then resends with
  `override: true`. "I edited a page" on Did it work does the same for the edit note. Bulk Done on
  Opportunities sends each item without the override and lists the page edits that were held back.
- The technical audit shows the server's `ruleLine`, a "Frozen until 7 December" chip on frozen
  pages and, per issue, whether its fix is the week's page edit (`editsPage`). Link suggestions show
  the same chip and warning when the page the link goes on is frozen (`fromFrozenUntil`).
- Reopen on a finished page change asks first, because the page stops being frozen.
- Charts: `lineChart` breaks the line at missing days only for a daily series (points usually one
  day apart). A sparse series (the AI answers check) is one line with a dot on every point.
