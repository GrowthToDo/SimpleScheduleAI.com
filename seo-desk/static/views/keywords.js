// Keywords: the searches you want to win and the page meant to win each one. Tabs: Targeted (your
// keyword file plus the ones added here, with priority, page and search group), Discovered
// (searches Google already shows the site for that no target covers: target or ignore, one at a
// time or up to 200 at once), Ignored (bring them back), Topics (searches grouped by shared
// words) and Searches by page (every page with the searches it shows for; the Keyword map page is
// the one table of every keyword). Keywords can be imported
// from a CSV. The address #/keywords?tab=discovered opens a tab.

import { mount } from '../app.js';
import { dataTable, downloadCsv } from './table.js';
import {
  openSearchDrawer,
  followRows,
  askTarget,
  adoptKeywords,
  ignoreKeywords,
  restoreKeywords,
  livePages,
  prioritySelect,
  PRIORITY_HELP,
  shareList,
} from './search-drawer.js';

const TABS = [
  { key: 'targeted', label: 'Targeted' },
  { key: 'discovered', label: 'Discovered' },
  { key: 'ignored', label: 'Ignored' },
  { key: 'topics', label: 'Topics' },
  { key: 'map', label: 'Searches by page' },
];

const LABELS = {
  'right page': { text: 'Right page', cls: 'chip-accent', help: 'Google shows the page meant to win it.' },
  'ranks elsewhere': {
    text: 'Ranks elsewhere',
    cls: 'chip-warn',
    help: 'Google shows a different page of ours for this search.',
  },
  'not returned': { text: 'Not shown yet', cls: 'chip-bad', help: 'Google has not shown the site for this search.' },
  'partial evidence': {
    text: 'Too few views to tell',
    cls: '',
    help: 'Fewer than 10 views, so which page wins is not clear yet.',
  },
};

const ORIGIN_TEXT = { registry: 'from your keyword file', adopted: 'added here' };
const MAX_SELECT = 200;
const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
const BRAND_LABEL = 'Searches for a brand name';

// Empties `el` and appends the children, skipping null and flattening lists (replaceChildren would
// print them).
const refill = (el, ...kids) => {
  el.replaceChildren();
  return mount(el, ...kids);
};

const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase();
const blank = (v) => v === null || v === undefined;

// ------------------------------------------------------------------ the CSV preview (pure)

const HEADERS = {
  keyword: ['keyword', 'query', 'search'],
  page: ['url', 'page', 'current url'],
  priority: ['priority'],
};
const MAX_ROWS = 5000;
const MAX_KEYWORD = 120;

function readCsv(text) {
  const src = String(text ?? '').replace(/^\uFEFF/, '');
  const out = [];
  let cells = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let start = 1;
  const end = () => {
    cells.push(field);
    if (cells.some((c) => c !== '')) out.push({ line: start, cells });
    cells = [];
    field = '';
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else {
        if (ch === '\n') line++;
        field += ch;
      }
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      cells.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      end();
      line++;
      start = line;
    } else field += ch;
  }
  end();
  return out;
}

const foldPage = (p) => {
  const s = String(p ?? '')
    .trim()
    .replace(/^https?:\/\/(www\.)?simplescheduleai\.com/i, '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '');
  return s === '' ? '/' : s;
};

// What an import would add and what it would skip, read the way the desk reads it. targets: Set of
// lower-case keywords already targeted; live: Set of live page paths (optional). The desk checks
// again on import, and also skips a row with no page when no page ranks for the search.
export function previewKeywordCsv(text, { targets = new Set(), live = null } = {}) {
  const records = readCsv(text);
  if (!records.length) return { rows: [], skipped: [{ line: 1, why: 'The file is empty.' }] };
  const head = records[0].cells.map((c) => String(c).trim().toLowerCase().replace(/\s+/g, ' '));
  const col = Object.fromEntries(
    Object.entries(HEADERS).map(([k, names]) => [k, head.findIndex((x) => names.includes(x))])
  );
  if (col.keyword < 0)
    return {
      rows: [],
      skipped: [{ line: records[0].line, why: 'No column is named keyword, query or search, so nothing can be read.' }],
    };
  const rows = [];
  const skipped = [];
  const seen = new Set();
  for (const [i, rec] of records.slice(1).entries()) {
    if (i >= MAX_ROWS) {
      skipped.push({ line: rec.line, why: `Only the first ${MAX_ROWS.toLocaleString('en-US')} rows are read.` });
      break;
    }
    const cell = (c) => (c >= 0 ? String(rec.cells[c] ?? '').trim() : '');
    const keyword = cell(col.keyword);
    const why = !keyword
      ? 'There is no keyword on this row.'
      : keyword.length > MAX_KEYWORD
        ? `The keyword is longer than ${MAX_KEYWORD} characters.`
        : seen.has(norm(keyword))
          ? 'That keyword is already earlier in the file.'
          : targets.has(norm(keyword))
            ? 'That keyword is already a target.'
            : null;
    if (keyword) seen.add(norm(keyword));
    const page = cell(col.page) ? foldPage(cell(col.page)) : null;
    const notLive = !why && page && live && !live.has(page) ? `${page} is not a live page on the site.` : null;
    if (why || notLive) {
      skipped.push({ line: rec.line, why: why ?? notLive });
      continue;
    }
    const priority = cell(col.priority).toLowerCase();
    rows.push({ keyword, page, priority: ['high', 'medium', 'low'].includes(priority) ? priority : null });
  }
  return { rows, skipped };
}

// The adopt items for a bulk Target. With no single page chosen each search goes to the page
// Google shows for it; a search whose page is missing or not live is set aside (one bad row would
// otherwise refuse all of them). An empty `live` set means the live pages are unknown: only rows
// with no page at all are set aside, and the desk checks the rest on save.
export function bulkTargetItems(rows, choice, live) {
  const items = [];
  const skipped = [];
  for (const r of rows) {
    const page = choice.page ?? r.rankingPage ?? null;
    if (!page || (live.size && !live.has(page))) {
      skipped.push(r);
      continue;
    }
    items.push({
      keyword: r.keyword,
      page,
      priority: choice.priority ?? null,
      intentGroup: choice.intentGroup ?? null,
    });
  }
  return { items, skipped };
}

// ------------------------------------------------------------------ the page

export async function render(el, ctx) {
  const { api, h, fmt, params } = ctx;
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'targeted';
  const days = params.get('days') === '90' ? 90 : 28;
  const single = params.get('single') === '1';
  const all = params.get('all') === '1';

  const [targeted, tabData, pages] = await Promise.all([
    api.get('/api/targets?tab=targeted'),
    tab === 'discovered' || tab === 'ignored'
      ? api.get(`/api/targets?tab=${tab}`)
      : tab === 'topics'
        ? api.get(`/api/topics?range=${days}&minSearches=${single ? 1 : 2}${all ? '&all=1' : ''}`)
        : tab === 'map'
          ? api.get(`/api/keyword-map?range=${days}`)
          : null,
    livePages(ctx).catch(() => []),
  ]);
  ctx.envelope(targeted);
  const live = new Set(pages);
  const today = fmt.isoPlus(0);

  const rows = targeted.rows;
  const counts = targeted.counts;
  const fromFile = rows.filter((r) => r.origin === 'registry').length;
  const byLabel = (l) => rows.filter((r) => r.label === l).length;
  const goTab = (key, extra = {}) => {
    const p = new URLSearchParams();
    if (key !== 'targeted') p.set('tab', key);
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    const q = p.toString();
    ctx.navigate(`#/keywords${q ? `?${q}` : ''}`);
  };

  const tileBtn = (label, value, sub, onclick, warn = false) =>
    h(
      onclick ? 'button' : 'div',
      { type: onclick ? 'button' : null, class: 'tile', onclick },
      h('span', { class: 'tile-label' }, label),
      h('span', { class: 'tile-value' }, fmt.num(value)),
      h('div', { class: `tile-change${warn ? ' jb-warn' : ''}` }, sub)
    );

  const conflicts = targeted.conflicts ?? [];
  const conflictBanner = conflicts.length
    ? h(
        'div',
        { class: 'banner banner-warn' },
        h('strong', {}, 'Two targets want the same search. '),
        'Keywords in one search group should share one page. Pick one page for each group below.',
        h(
          'ul',
          { class: 'kw-conflicts' },
          conflicts.map((c) =>
            h(
              'li',
              {},
              `Search group "${c.intentGroup}": ${c.keywords.map((k) => `"${k}"`).join(', ')} point at ${c.pages.join(' and ')}.`
            )
          )
        )
      )
    : null;

  const tabs = h(
    'div',
    { class: 'tabs', role: 'tablist', 'aria-label': 'Keyword lists' },
    TABS.map((t) => {
      const count =
        t.key === 'targeted'
          ? counts.targeted
          : t.key === 'discovered'
            ? counts.discovered
            : t.key === 'ignored'
              ? counts.ignored
              : t.key === tab && t.key === 'topics'
                ? tabData.total
                : t.key === tab && t.key === 'map'
                  ? tabData.total
                  : null;
      return h(
        'button',
        {
          type: 'button',
          class: 'tab',
          role: 'tab',
          'aria-selected': String(t.key === tab),
          onclick: () => goTab(t.key),
        },
        t.label,
        blank(count) ? null : h('span', { class: 'count' }, fmt.num(count))
      );
    })
  );

  const panel = h('div', { role: 'tabpanel', 'aria-label': TABS.find((t) => t.key === tab).label });
  const shared = { ctx, live, pages, today, rows };
  if (tab === 'targeted') targetedPanel(panel, targeted, shared);
  else if (tab === 'discovered') discoveredPanel(panel, tabData, shared);
  else if (tab === 'ignored') ignoredPanel(panel, tabData, shared);
  else if (tab === 'topics') topicsPanel(panel, tabData, { ...shared, days, single, all, goTab });
  else mapPanel(panel, tabData, { ...shared, days, goTab });

  ctx.mount(
    el,
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Keywords'),
        h(
          'p',
          { class: 'page-sub' },
          'The searches you want to win and the page meant to win each one. ',
          targeted.range ? `Numbers cover ${fmt.range(targeted.range)}.` : ''
        )
      ),
      h(
        'div',
        { class: 'row' },
        h('button', { type: 'button', class: 'btn', onclick: () => importDialog(ctx, rows, live) }, 'Import a CSV'),
        h('a', { class: 'btn', href: '/api/export/targets-all.csv', download: '' }, 'Download CSV')
      )
    ),
    targeted.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    targeted.warnings?.length ? h('p', { class: 'banner banner-warn' }, targeted.warnings.join(' ')) : null,
    h(
      'section',
      { class: 'section', 'aria-label': 'Keywords in numbers', style: { marginTop: 0 } },
      h(
        'div',
        { class: 'tiles' },
        tileBtn(
          'Keywords you target',
          counts.targeted,
          `${fmt.num(fromFile)} from your keyword file, ${fmt.num(counts.targeted - fromFile)} added here`,
          () => goTab('targeted')
        ),
        tileBtn('On the right page', byLabel('right page'), 'Google shows the page meant to win'),
        tileBtn(
          'Ranks elsewhere',
          byLabel('ranks elsewhere'),
          'Google shows a different page',
          null,
          byLabel('ranks elsewhere') > 0
        ),
        tileBtn('Found, not targeted', counts.discovered, 'searches no target covers yet', () => goTab('discovered'))
      )
    ),
    conflictBanner ? h('div', { class: 'section', style: { marginTop: '20px' } }, conflictBanner) : null,
    h('section', { class: 'section', style: { marginTop: '32px' } }, tabs, panel),
    secondarySection(ctx, targeted.secondary)
  );
}

// ------------------------------------------------------------------ Secondary keywords

// The searches adopted as secondary keywords of a page (from the Secondary keywords page), folded
// away, each with Remove. Removing one changes nothing else: it was never a target.
function secondarySection(ctx, list) {
  const { h, fmt, api, toast } = ctx;
  if (!list?.length) return null;
  const remove = async (x, button) => {
    button.disabled = true;
    try {
      await api.del('/api/targets/secondary', { keyword: x.keyword, page: x.page });
      toast(`Removed "${x.keyword}" as a secondary keyword of ${x.page}.`, 'success');
      await ctx.reload();
    } catch (err) {
      toast(err.message, 'error');
      if (button.isConnected) button.disabled = false;
    }
  };
  return h(
    'details',
    { class: 'section p2-fold', id: 'secondary-keywords' },
    h('summary', {}, `Secondary keywords (${list.length})`),
    h(
      'p',
      { class: 'small muted' },
      'Searches you adopted as secondary keywords of a page. They are not targets and do not count in the target position. Remove one you no longer want; nothing else changes.'
    ),
    h(
      'ul',
      { class: 'side-list' },
      list.map((x) =>
        h(
          'li',
          { class: 'ins-left' },
          h(
            'div',
            {},
            h('strong', {}, x.keyword),
            h('div', { class: 'small muted' }, `${x.page}${x.addedOn ? `, added ${fmt.date(x.addedOn)}` : ''}`)
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              'aria-label': `Remove "${x.keyword}" as a secondary keyword of ${x.page}`,
              onclick: (e) => remove(x, e.currentTarget),
            },
            'Remove'
          )
        )
      )
    )
  );
}

// ------------------------------------------------------------------ Targeted

function labelChip(h, label) {
  const l = LABELS[label];
  return l ? h('span', { class: `chip ${l.cls}`, title: l.help }, l.text) : '';
}

const drawerRow = (r) => ({
  impressions: r.impressions,
  position: r.position,
  topPage: r.rankingPage ?? r.page ?? null,
});

function targetedPanel(box, data, { ctx, live, today }) {
  const { h, fmt, api } = ctx;
  const listId = 'kw-live-pages';
  const datalist = h(
    'datalist',
    { id: listId },
    [...live].map((p) => h('option', { value: p }))
  );

  const save = async (row, change, word) => {
    try {
      const r = await api.put('/api/targets', { keyword: row.keyword, ...change });
      Object.assign(row, change, r);
      ctx.toast(`${word} saved for "${row.keyword}".`, 'success');
      return true;
    } catch (e) {
      ctx.toast(e.message, 'error');
      return false;
    }
  };

  const priorityCell = (v, r) => {
    const sel = prioritySelect(v ?? '', `Priority (optional) for ${r.keyword}`);
    sel.classList.add('select-small');
    sel.title = PRIORITY_HELP;
    sel.addEventListener('change', async () => {
      const ok = await save(r, { priority: sel.value || null }, 'Priority');
      if (!ok) sel.value = r.priority ?? '';
    });
    return sel;
  };

  const pageCell = (v, r) => {
    if (r.origin !== 'adopted') return h('span', { class: 'kw-path' }, v ?? '');
    const input = h('input', {
      class: 'input input-small kw-path-input',
      type: 'text',
      value: v ?? '',
      list: listId,
      'aria-label': `Page meant to win ${r.keyword}`,
      title: 'Pick a live page from the list, then press Enter',
    });
    input.addEventListener('change', async () => {
      const next = input.value.trim();
      if (next === r.page) return;
      if (!live.has(next)) {
        ctx.toast(`${next || 'That'} is not a live page on the site. Pick one from the list.`, 'error');
        input.value = r.page ?? '';
        return;
      }
      if (!(await save(r, { page: next }, 'Page'))) input.value = r.page ?? '';
      else ctx.reload();
    });
    return input;
  };

  const groupCell = (v, r) => {
    if (r.origin !== 'adopted')
      return h('span', { class: 'muted small', title: 'Set search groups in your keyword file' }, v ?? '');
    const input = h('input', {
      class: 'input input-small',
      type: 'text',
      value: v ?? '',
      maxlength: 60,
      placeholder: 'none',
      'aria-label': `Search group for ${r.keyword}`,
      title: 'Give searches the same group when one page should win them all. Press Enter to save.',
    });
    input.addEventListener('change', async () => {
      if (await save(r, { intentGroup: input.value.trim() || null }, 'Search group')) ctx.reload();
      else input.value = r.intentGroup ?? '';
    });
    return input;
  };

  const remove = async (r) => {
    const ok = await ctx.confirmBox({
      title: 'Stop targeting this search?',
      body: `"${r.keyword}" leaves your target list. Nothing changes on the site or in Google.`,
      confirmLabel: 'Stop targeting',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del('/api/targets', { keyword: r.keyword });
      ctx.toast(`"${r.keyword}" is no longer a target.`, 'success');
      ctx.reload();
    } catch (e) {
      ctx.toast(e.message, 'error');
    }
  };

  const tableBox = h('div', {});
  ctx.mount(
    box,
    datalist,
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      `Every keyword you target, ${fmt.range(data.range)}. Keywords from your keyword file keep their page; only their priority changes here. Keywords added here can change page, priority and search group, and can be removed. Click a keyword to see its trend.`
    ),
    tableBox
  );
  const table = dataTable(tableBox, {
    label: 'Target keywords',
    rows: data.rows,
    rowKey: (r) => r.keyword,
    searchKeys: ['keyword', 'page', 'rankingPage', 'intentGroup'],
    sort: { key: 'impressions', dir: 'desc' },
    emptyText: 'No target keywords yet. Target a search from the Discovered tab or import a CSV.',
    onCsv: () =>
      downloadCsv(
        `seo-desk-targets-${today}.csv`,
        [
          'Keyword',
          'Page',
          'Priority',
          'Search group',
          'Where it came from',
          'Place',
          'Times shown',
          'Page Google shows',
          'Verdict',
        ],
        table
          .visibleRows()
          .map((r) => [
            r.keyword,
            r.page,
            r.priority,
            r.intentGroup,
            ORIGIN_TEXT[r.origin],
            r.position,
            r.impressions,
            r.rankingPage,
            LABELS[r.label]?.text ?? '',
          ])
      ),
    filters: [
      ...Object.entries(LABELS).map(([key, l]) => ({ key, label: l.text, test: (r) => r.label === key })),
      { key: 'file', label: 'From your keyword file', test: (r) => r.origin === 'registry' },
      { key: 'here', label: 'Added here', test: (r) => r.origin === 'adopted' },
    ],
    onRowClick: (r) => followRows(table, r, (x) => openSearchDrawer(x.keyword, ctx, { row: drawerRow(x) })),
    columns: [
      {
        key: 'keyword',
        label: 'Keyword',
        wrap: true,
        format: (v, r) =>
          h(
            'span',
            { class: 'kw-name' },
            h('span', {}, v),
            h(
              'span',
              { class: 'small muted' },
              `${ORIGIN_TEXT[r.origin] ?? ''}${r.addedOn ? ` on ${fmt.dateShort(r.addedOn)}` : ''}`
            )
          ),
      },
      { key: 'page', label: 'Page meant to win', wrap: true, format: pageCell },
      { key: 'priority', label: 'Priority (optional)', title: PRIORITY_HELP, format: priorityCell },
      {
        key: 'intentGroup',
        label: 'Search group',
        title: 'Searches in one group should be won by one page',
        format: groupCell,
      },
      {
        key: 'position',
        label: 'Place',
        align: 'right',
        title: 'Average place on Google. Lower is better.',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
      { key: 'rankingPage', label: 'Page Google shows', wrap: true, format: (v) => v ?? '' },
      { key: 'label', label: 'Right page?', format: (v) => labelChip(h, v) },
      {
        key: 'origin',
        label: '',
        sortable: false,
        format: (v, r) =>
          v === 'adopted'
            ? h('button', { type: 'button', class: 'btn btn-small btn-quiet', onclick: () => remove(r) }, 'Remove')
            : '',
      },
    ],
  });
}

// ------------------------------------------------------------------ Discovered and Ignored

// A list with checkboxes and a bar of bulk buttons (at most 200 at once).
function selectableList(box, ctx, { rows, note, label, emptyText, csvName, bulk, rowActions, extraColumns = [] }) {
  const { h, fmt } = ctx;
  const selected = new Set();
  const countText = h('strong', {});
  const bulkButtons = bulk.map((b) =>
    h(
      'button',
      {
        type: 'button',
        class: `btn btn-small${b.primary ? ' btn-primary' : ''}`,
        onclick: async () => {
          const chosen = rows.filter((r) => selected.has(r.keyword));
          if (chosen.length) await b.run(chosen);
        },
      },
      b.label
    )
  );
  const bar = h(
    'div',
    { class: 'bulk-bar', hidden: true, 'aria-live': 'polite' },
    countText,
    ...bulkButtons,
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-small btn-quiet',
        onclick: () => {
          selected.clear();
          sync();
        },
      },
      'Clear selection'
    )
  );
  const selectAll = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-small',
      onclick: () => {
        const visible = table.visibleRows();
        for (const r of visible) {
          if (selected.size >= MAX_SELECT) break;
          selected.add(r.keyword);
        }
        if (visible.length > MAX_SELECT)
          ctx.toast(`Selected the first ${MAX_SELECT}. Act on them, then select the next ones.`);
        sync();
      },
    },
    'Select all shown'
  );
  const sync = () => {
    bar.hidden = selected.size === 0;
    countText.textContent = `${fmt.num(selected.size)} selected`;
    for (const cb of box.querySelectorAll('input[data-kw]')) cb.checked = selected.has(cb.dataset.kw);
  };

  const tableBox = h('div', {});
  ctx.mount(
    box,
    h('p', { class: 'section-note', style: { marginBottom: '8px' } }, note),
    h(
      'div',
      { class: 'row', style: { marginBottom: '10px' } },
      selectAll,
      h('span', { class: 'small muted' }, `Up to ${MAX_SELECT} at once.`)
    ),
    bar,
    tableBox
  );
  const table = dataTable(tableBox, {
    label,
    rows,
    rowKey: (r) => r.keyword,
    searchKeys: ['keyword', 'rankingPage'],
    sort: { key: 'impressions', dir: 'desc' },
    emptyText,
    onCsv: () =>
      downloadCsv(
        csvName,
        ['Search', 'Times shown', 'Place', 'Page Google shows'],
        table.visibleRows().map((r) => [r.keyword, r.impressions, r.position, r.rankingPage])
      ),
    onRowClick: (r) => followRows(table, r, (x) => openSearchDrawer(x.keyword, ctx, { row: drawerRow(x) })),
    columns: [
      {
        key: 'pick',
        label: 'Pick',
        sortable: false,
        format: (v, r) => {
          const cb = h('input', {
            type: 'checkbox',
            checked: selected.has(r.keyword),
            'aria-label': `Select ${r.keyword}`,
            dataset: { kw: r.keyword },
          });
          cb.addEventListener('change', () => {
            if (cb.checked && selected.size >= MAX_SELECT) {
              cb.checked = false;
              ctx.toast(`At most ${MAX_SELECT} at once. Act on these first.`, 'error');
              return;
            }
            if (cb.checked) selected.add(r.keyword);
            else selected.delete(r.keyword);
            sync();
          });
          return cb;
        },
      },
      { key: 'keyword', label: 'Search', wrap: true },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'position',
        label: 'Place',
        align: 'right',
        title: 'Average place on Google. Lower is better.',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      { key: 'rankingPage', label: 'Page Google shows', wrap: true, format: (v) => v ?? '' },
      ...extraColumns,
      {
        key: 'actions',
        label: '',
        sortable: false,
        format: (v, r) => h('span', { class: 'row kw-actions' }, rowActions(r)),
      },
    ],
  });
  return table;
}

function discoveredPanel(box, data, { ctx, today, live }) {
  const { h, fmt } = ctx;
  const target = async (chosen) => {
    const choice = await askTarget(ctx, {
      keywords: chosen.map((r) => r.keyword),
      page: chosen.length === 1 ? chosen[0].rankingPage : null,
    });
    if (!choice) return;
    const { items, skipped } = bulkTargetItems(chosen, choice, live);
    if (skipped.length) {
      ctx.toast(
        `${fmt.plural(skipped.length, 'search was', 'searches were')} left out because the page Google shows for ${skipped.length === 1 ? 'it' : 'them'} is not a live page on the site. Target ${skipped.length === 1 ? 'it' : 'them'} one at a time and pick a page.`,
        items.length ? 'info' : 'error',
        { ms: 9000 }
      );
    }
    if (items.length && (await adoptKeywords(ctx, items))) ctx.reload();
  };
  const ignore = async (chosen) => {
    if (
      await ignoreKeywords(
        ctx,
        chosen.map((r) => r.keyword)
      )
    )
      ctx.reload();
  };
  selectableList(box, ctx, {
    rows: data.rows,
    label: 'Searches found, not targeted',
    note: `Searches Google showed the site for at least ${fmt.plural(data.minImpressions ?? 20, 'time', 'times')}, ${fmt.range(data.range)}, that no target covers. Brand searches are left out. Target the ones worth winning, ignore the rest. Click a search to see its trend.`,
    emptyText: 'Every search with enough views is already a target or ignored.',
    csvName: `seo-desk-discovered-${today}.csv`,
    bulk: [
      { label: 'Target selected', primary: true, run: target },
      { label: 'Ignore selected', run: ignore },
    ],
    rowActions: (r) => [
      h('button', { type: 'button', class: 'btn btn-small', onclick: () => target([r]) }, 'Target'),
      h('button', { type: 'button', class: 'btn btn-small btn-quiet', onclick: () => ignore([r]) }, 'Ignore'),
    ],
  });
}

function ignoredPanel(box, data, { ctx, today }) {
  const { h, fmt } = ctx;
  const restore = async (chosen) => {
    if (
      await restoreKeywords(
        ctx,
        chosen.map((r) => r.keyword)
      )
    )
      ctx.reload();
  };
  selectableList(box, ctx, {
    rows: data.rows,
    label: 'Ignored searches',
    note: `Searches you set aside. They stay off the Discovered list until you bring them back. Numbers cover ${fmt.range(data.range)}.`,
    emptyText: 'Nothing is ignored.',
    csvName: `seo-desk-ignored-${today}.csv`,
    bulk: [{ label: 'Bring back selected', primary: true, run: restore }],
    rowActions: (r) => [
      h('button', { type: 'button', class: 'btn btn-small', onclick: () => restore([r]) }, 'Bring back'),
    ],
  });
}

// ------------------------------------------------------------------ Topics and Keyword map

function rangeChips(h, days, onPick) {
  return h(
    'div',
    { class: 'chips', role: 'group', 'aria-label': 'Period' },
    [28, 90].map((d) =>
      h(
        'button',
        { type: 'button', class: 'chip chip-btn', 'aria-pressed': String(d === days), onclick: () => onPick(d) },
        `${d} days`
      )
    )
  );
}

// A list of folding groups with a search box above it. groups: [{key, text (searched), summary(),
// body()}]; a body is built the first time its group opens.
function foldList(box, ctx, { groups, label, emptyText, pageSize = 60 }) {
  const { h } = ctx;
  let shown = pageSize;
  let needle = '';
  const list = h('div', { class: 'fold-list', 'aria-label': label });
  const foot = h('div', { class: 'table-foot' });
  const draw = () => {
    const hits = groups.filter((g) => !needle || g.text.includes(needle));
    refill(
      list,
      ...(hits.length
        ? hits.slice(0, shown).map((g) => {
            const body = h('div', { class: 'fold-body' });
            const d = h('details', { class: 'fold' }, h('summary', {}, g.summary()), body);
            d.addEventListener('toggle', () => {
              if (d.open && !body.childNodes.length) ctx.mount(body, g.body());
            });
            return d;
          })
        : [h('p', { class: 'empty' }, groups.length ? 'Nothing matches. Clear the search.' : emptyText)])
    );
    const more = hits.length - Math.min(hits.length, shown);
    refill(
      foot,
      h('span', {}, hits.length ? `Showing ${Math.min(shown, hits.length)} of ${hits.length}.` : ''),
      more > 0
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              onclick: () => {
                shown += pageSize;
                draw();
              },
            },
            `Show ${Math.min(pageSize, more)} more`
          )
        : null
    );
  };
  const search = h('input', {
    class: 'input',
    type: 'search',
    placeholder: 'Search',
    'aria-label': `Search ${label}`,
    'data-search': true,
    title: 'Press / anywhere on the page to jump here',
  });
  search.addEventListener('input', () => {
    needle = search.value.trim().toLowerCase();
    shown = pageSize;
    draw();
  });
  draw();
  return { search, list, foot };
}

function topicsPanel(box, data, { ctx, days, single, all, goTab, live }) {
  // The address keeps the period, single searches and "all" together.
  const topicsTab = (changes) =>
    goTab('topics', {
      days: (changes.days ?? days) === 90 ? '90' : '',
      single: (changes.single ?? single) ? '1' : '',
      all: (changes.all ?? all) ? '1' : '',
    });
  const { h, fmt } = ctx;
  const adoptLead = async (t) => {
    const lead = t.queries[0];
    const page = t.pages[0]?.page ?? lead.page;
    const choice = await askTarget(ctx, { keywords: [lead.query], page: live.has(page) ? page : null });
    if (!choice) return;
    if (await adoptKeywords(ctx, [{ keyword: lead.query, ...choice }])) ctx.reload();
  };
  const groups = (data.topics ?? []).map((t) => ({
    key: t.id,
    text: [t.label, ...t.queries.map((q) => q.query)].join(' ').toLowerCase(),
    summary: () =>
      h(
        'span',
        { class: 'fold-sum' },
        h('span', { class: 'fold-title' }, t.label),
        h(
          'span',
          { class: 'fold-meta' },
          h(
            'span',
            { class: 'small muted num' },
            `${fmt.plural(t.queries.length, 'search', 'searches')}, shown ${fmt.num(t.impressions)} times`
          ),
          t.competing
            ? h(
                'span',
                {
                  class: 'chip chip-warn',
                  title: data.competingNote ?? null,
                },
                'Pages compete'
              )
            : null,
          t.targeted
            ? h('span', { class: 'chip chip-accent' }, t.targetPage ? `Targeted: ${t.targetPage}` : 'Targeted')
            : t.label === BRAND_LABEL
              ? null
              : h('span', { class: 'chip chip-hyp' }, 'Not targeted')
        )
      ),
    body: () => {
      const tableBox = h('div', {});
      dataTable(tableBox, {
        label: `Searches in ${t.label}`,
        rows: t.queries,
        pageSize: 10,
        sort: { key: 'impressions', dir: 'desc' },
        columns: [
          { key: 'query', label: 'Search', wrap: true },
          { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
          { key: 'position', label: 'Place', align: 'right', format: (v) => (blank(v) ? '' : fmt.position(v)) },
          { key: 'page', label: 'Page Google shows most', wrap: true, format: (v) => v ?? '' },
        ],
      });
      const canAdopt = !t.targeted && t.label !== BRAND_LABEL && t.queries.length;
      return [
        canAdopt
          ? h(
              'div',
              { class: 'row', style: { marginBottom: '12px' } },
              h(
                'button',
                { type: 'button', class: 'btn btn-primary btn-small', onclick: () => adoptLead(t) },
                'Adopt the lead search'
              ),
              h('span', { class: 'small muted' }, `"${t.queries[0].query}", the busiest search in this topic.`)
            )
          : null,
        tableBox,
        t.pages.length
          ? h(
              'div',
              { style: { marginTop: '14px' } },
              h(
                'p',
                { class: 'small muted' },
                t.pages.some((p) => !blank(p.share))
                  ? 'Pages that serve this topic, by share of its views.'
                  : `Pages that serve this topic. It has too few views to split into shares (${fmt.NOT_ENOUGH}).`
              ),
              shareList(t.pages)
            )
          : null,
      ];
    },
  }));
  const { search, list, foot } = foldList(box, ctx, {
    groups,
    label: 'Topics',
    emptyText: single
      ? 'No topics yet.'
      : 'No topic has two or more searches yet. Turn on single searches to see the rest.',
  });
  const singleSwitch = h('input', {
    type: 'checkbox',
    checked: single,
    onchange: (e) => topicsTab({ single: e.target.checked }),
  });
  ctx.mount(
    box,
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '10px' } },
      `${data.note ?? ''} ${fmt.range(data.range)}. Showing ${fmt.num(data.shown ?? 0)} of ${fmt.plural(data.total ?? 0, 'topic', 'topics')}${single ? '' : ' with two or more searches'}.${data.ungroupedNote ? ` ${data.ungroupedNote}` : ''} `,
      (data.total ?? 0) > (data.shown ?? 0)
        ? h(
            'button',
            { type: 'button', class: 'btn btn-small btn-quiet', onclick: () => topicsTab({ all: true }) },
            `Show all ${fmt.num(data.total)} topics`
          )
        : null
    ),
    h(
      'div',
      { class: 'toolbar' },
      h('div', { class: 'grow' }, search),
      rangeChips(h, days, (d) => topicsTab({ days: d })),
      h('label', { class: 'switch-label' }, singleSwitch, 'Show single searches'),
      h(
        'a',
        {
          class: 'btn btn-small',
          href: `/api/export/topics.csv?range=${days}&minSearches=${single ? 1 : 2}`,
          download: '',
        },
        'Download CSV'
      )
    ),
    list,
    foot
  );
}

function mapPanel(box, data, { ctx, days, goTab, rows, today }) {
  const { h, fmt } = ctx;
  const targetsOf = new Map();
  for (const r of rows) {
    if (!r.page) continue;
    if (!targetsOf.has(r.page)) targetsOf.set(r.page, []);
    targetsOf.get(r.page).push(r.keyword);
  }
  const groups = (data.pages ?? []).map((p) => {
    const targets = targetsOf.get(p.page) ?? [];
    return {
      key: p.page,
      text: [p.page, ...p.queries.map((q) => q.query)].join(' ').toLowerCase(),
      summary: () =>
        h(
          'span',
          { class: 'fold-sum' },
          h('span', { class: 'fold-title kw-path' }, p.page),
          h(
            'span',
            { class: 'fold-meta' },
            h(
              'span',
              { class: 'small muted num' },
              `${fmt.plural(p.queries.length, 'search', 'searches')}, shown ${fmt.num(p.impressions)} times`
            ),
            targets.length
              ? h(
                  'span',
                  { class: 'chip chip-accent' },
                  `Target: ${targets[0]}${targets.length > 1 ? ` and ${targets.length - 1} more` : ''}`
                )
              : h('span', { class: 'chip chip-hyp' }, 'No target keyword')
          )
        ),
      body: () => {
        const tableBox = h('div', {});
        dataTable(tableBox, {
          label: `Searches that show ${p.page}`,
          rows: p.queries,
          pageSize: 10,
          sort: { key: 'impressions', dir: 'desc' },
          columns: [
            { key: 'query', label: 'Search', wrap: true },
            { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
            { key: 'position', label: 'Place', align: 'right', format: (v) => (blank(v) ? '' : fmt.position(v)) },
          ],
        });
        return [
          h(
            'p',
            { class: 'row', style: { marginBottom: '10px' } },
            h(
              'a',
              { class: 'btn btn-small', href: `#/pages?page=${encodeURIComponent(p.page)}` },
              'Open the page details'
            )
          ),
          tableBox,
        ];
      },
    };
  });
  const { search, list, foot } = foldList(box, ctx, {
    groups,
    label: 'Searches by page',
    emptyText: 'No page has shown for a search yet.',
  });
  ctx.mount(
    box,
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '10px' } },
      `Every page with the searches it shows for, busiest first, ${fmt.range(data.range)}. The same data as Topics, seen by page. The Keyword map page has every keyword in one table.`
    ),
    h(
      'div',
      { class: 'toolbar' },
      h('div', { class: 'grow' }, search),
      rangeChips(h, days, (d) => goTab('map', { days: d === 90 ? '90' : '' })),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-small',
          onclick: () =>
            downloadCsv(
              `seo-desk-keyword-map-${today}.csv`,
              ['Page', 'Search', 'Times shown', 'Place'],
              (data.pages ?? []).flatMap((p) => p.queries.map((q) => [p.page, q.query, q.impressions, q.position]))
            ),
        },
        'Download CSV'
      )
    ),
    list,
    foot
  );
}

// ------------------------------------------------------------------ CSV import

function importDialog(ctx, rows, live) {
  const { h, fmt } = ctx;
  const targets = new Set(rows.map((r) => norm(r.keyword)));
  let text = null;
  const dialog = h('dialog', { class: 'dialog dialog-wide' });
  const close = (changed) => {
    dialog.close();
    dialog.remove();
    if (changed) ctx.reload();
  };
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close(false);
  });
  const file = h('input', { type: 'file', accept: '.csv,text/csv', class: 'input', 'aria-label': 'CSV file' });
  const preview = h('div', { class: 'kw-preview', 'aria-live': 'polite' });
  const go = h('button', { type: 'button', class: 'btn btn-primary', disabled: true }, 'Import');
  const cancel = h('button', { type: 'button', class: 'btn', onclick: () => close(false) }, 'Cancel');

  const skippedList = (items) =>
    h(
      'ul',
      { class: 'plain-list small kw-skips' },
      items.slice(0, 12).map((s) => h('li', {}, s.line ? `Line ${s.line}: ${s.why}` : `"${s.keyword}": ${s.why}`)),
      items.length > 12 ? h('li', { class: 'muted' }, `and ${fmt.num(items.length - 12)} more`) : null
    );

  file.addEventListener('change', async () => {
    const f = file.files?.[0];
    go.disabled = true;
    text = null;
    if (!f) return refill(preview);
    if (f.size > IMPORT_MAX_BYTES) {
      refill(preview, h('p', { class: 'dialog-error' }, 'This file is over 2 MB. Split it into smaller files.'));
      return;
    }
    text = await f.text();
    const p = previewKeywordCsv(text, { targets, live: live.size ? live : null });
    go.disabled = !p.rows.length;
    go.textContent = p.rows.length ? `Import ${fmt.plural(p.rows.length, 'keyword', 'keywords')}` : 'Import';
    refill(
      preview,
      h('h3', { class: 'kw-preview-title' }, `Will be added: ${fmt.num(p.rows.length)}`),
      p.rows.length
        ? h(
            'ul',
            { class: 'plain-list small' },
            p.rows
              .slice(0, 8)
              .map((r) =>
                h(
                  'li',
                  {},
                  `"${r.keyword}" for ${r.page ?? 'the page that ranks for it'}${r.priority ? `, ${r.priority} priority` : ''}`
                )
              ),
            p.rows.length > 8 ? h('li', { class: 'muted' }, `and ${fmt.num(p.rows.length - 8)} more`) : null
          )
        : null,
      p.skipped.length
        ? [
            h('h3', { class: 'kw-preview-title' }, `Will be skipped: ${fmt.num(p.skipped.length)}`),
            skippedList(p.skipped),
          ]
        : null,
      h(
        'p',
        { class: 'small muted' },
        'The desk checks every row again when you import. A row with no page uses the page that ranks for it, and is skipped when no page ranks yet.'
      )
    );
  });

  go.addEventListener('click', async () => {
    if (!text) return;
    go.disabled = true;
    go.textContent = 'Importing...';
    try {
      const r = await ctx.api.post('/api/targets/import', text);
      refill(
        preview,
        h('p', { class: 'banner banner-accent' }, `Added ${fmt.plural(r.imported, 'keyword', 'keywords')}.`),
        r.skipped?.length
          ? [h('h3', { class: 'kw-preview-title' }, `Skipped: ${fmt.num(r.skipped.length)}`), skippedList(r.skipped)]
          : null
      );
      file.disabled = true;
      go.remove();
      cancel.textContent = 'Close';
      cancel.onclick = () => close(r.imported > 0);
      dialog.addEventListener('cancel', () => r.imported > 0 && ctx.reload(), { once: true });
      cancel.focus();
    } catch (e) {
      go.disabled = false;
      go.textContent = 'Try again';
      preview.prepend(h('p', { class: 'dialog-error' }, e.message));
    }
  });

  dialog.append(
    h(
      'form',
      { method: 'dialog', onsubmit: (e) => e.preventDefault() },
      h('h2', {}, 'Import keywords from a CSV'),
      h(
        'p',
        { class: 'dialog-body' },
        'A file from Search Console, Ahrefs, Semrush or a spreadsheet. The desk reads the column named keyword, query or search, and the page (url, page or current url) and priority when they are there. Difficulty and other columns are ignored. The file can have up to 5,000 rows and 2 MB, and the desk keeps at most 2,000 added keywords in all.'
      ),
      h('div', { class: 'dialog-field' }, file),
      preview,
      h('div', { class: 'dialog-actions' }, cancel, go)
    )
  );
  document.body.append(dialog);
  dialog.showModal();
  file.focus();
}
