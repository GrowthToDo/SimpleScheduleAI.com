// Keyword map: every keyword you target or already show for, in one table. Four big counters
// (All keywords, Opportunities, Runner-up, Cannibalized) and a row of filter chips (All, Mapped,
// Unmapped, Opportunities, Runner-up, Cannibalized) filter it; a text search, the CSV, and on each
// row Map to a page (or Change page) and Ignore, through the existing keyword routes.
//
// From GET /api/keyword-map/table: counters {all, mapped, unmapped, opportunities, runnerUp,
// cannibalized, ...} and rows {keyword, kind, status 'live'|'pending', mappedTo, origin, source,
// volume, position, impressions, rankingPage, flags, clusterConflict}.
//
// The pure helpers (KM_FILTERS, filterRows, sourceTags, statusText) import nothing from the
// browser at load time. Keywords and page paths are data and go in as text.

import { insightLinks, entryFor, countText } from './nav.js';
import { dataTable } from './table.js';
import { askTarget, adoptKeywords, ignoreKeywords, livePages } from './search-drawer.js';

const has = (r, flag) => (r.flags ?? []).includes(flag);

export const KM_FILTERS = [
  { key: 'all', label: 'All', counter: 'all', test: () => true },
  { key: 'mapped', label: 'Mapped', counter: 'mapped', test: (r) => Boolean(r.mappedTo) },
  { key: 'unmapped', label: 'Unmapped', counter: 'unmapped', test: (r) => !r.mappedTo },
  { key: 'opportunities', label: 'Opportunities', counter: 'opportunities', test: (r) => (r.flags ?? []).length > 0 },
  { key: 'runner-up', label: 'Runner-up', counter: 'runnerUp', test: (r) => has(r, 'runner-up') },
  { key: 'cannibalized', label: 'Cannibalized', counter: 'cannibalized', test: (r) => has(r, 'cannibalized') },
];

// The four big counters; each filters the table like its chip.
const TILES = [
  { key: 'all', label: 'All keywords' },
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'runner-up', label: 'Runner-up' },
  { key: 'cannibalized', label: 'Cannibalized' },
];

export function filterRows(rows, key) {
  const f = KM_FILTERS.find((x) => x.key === key) ?? KM_FILTERS[0];
  return (rows ?? []).filter(f.test);
}

const SOURCE_LABEL = { file: 'Keyword file', 'search-console': 'Search Console', import: 'Imported' };
export const sourceTags = (row) => (row.source ?? []).map((s) => SOURCE_LABEL[s] ?? s);

export const statusText = (row) => (row.status === 'live' ? 'Live' : 'Pending');

const FLAG_LABEL = { 'runner-up': 'Runner-up', cannibalized: 'Cannibalized', 'wrong-page': 'Wrong page ranking' };

// ------------------------------------------------------------------ the page

export async function render(el, ctx) {
  const { api, h, fmt, params } = ctx;
  const [data, nav] = await Promise.all([api.get('/api/keyword-map/table'), api.get('/api/nav').catch(() => null)]);
  ctx.envelope(data);
  const entry = entryFor('keyword-map');
  const rows = data.rows ?? [];
  const counters = data.counters ?? {};
  const withVolume = rows.some((r) => typeof r.volume === 'number');
  let filter = KM_FILTERS.some((f) => f.key === params.get('show')) ? params.get('show') : 'all';

  const tiles = h('div', { class: 'tiles tiles-four km-tiles', role: 'group', 'aria-label': 'Filter by counter' });
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter the keywords' });
  const tableBox = h('div', {});

  const pick = (key) => {
    filter = key;
    ctx.setParams({ show: key === 'all' ? null : key });
    drawFilters();
    table.update(filterRows(rows, filter));
  };

  const drawFilters = () => {
    tiles.replaceChildren(
      ...TILES.map((t) => {
        const f = KM_FILTERS.find((x) => x.key === t.key);
        return h(
          'button',
          {
            type: 'button',
            class: 'tile',
            'aria-pressed': String(filter === t.key),
            title: `Show ${t.label.toLowerCase()} in the table`,
            onclick: () => pick(t.key),
          },
          h('span', { class: 'tile-label' }, t.label),
          h('span', { class: 'tile-value' }, countText(counters[f.counter]))
        );
      })
    );
    chips.replaceChildren(
      ...KM_FILTERS.map((f) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            'aria-pressed': String(filter === f.key),
            onclick: () => pick(f.key),
          },
          `${f.label} `,
          h('span', { class: 'count' }, countText(counters[f.counter]))
        )
      )
    );
  };

  const pageLink = (p) => h('a', { class: 'page-path', href: `#/pages?page=${encodeURIComponent(p)}` }, p);

  async function mapRow(r) {
    const choice = await askTarget(ctx, { keywords: [r.keyword], page: r.mappedTo ?? r.rankingPage });
    if (!choice) return;
    if (r.origin === 'adopted') {
      try {
        await api.put('/api/targets', {
          keyword: r.keyword,
          page: choice.page,
          ...(choice.priority ? { priority: choice.priority } : {}),
          ...(choice.intentGroup ? { intentGroup: choice.intentGroup } : {}),
        });
        ctx.toast(`"${r.keyword}" now maps to ${choice.page}.`, 'success');
      } catch (e) {
        ctx.toast(e.message, 'error');
        return;
      }
    } else if (!(await adoptKeywords(ctx, [{ keyword: r.keyword, ...choice }]))) return;
    await ctx.reload();
  }

  async function ignoreRow(r) {
    const ok = await ctx.confirmBox({
      title: 'Ignore this search?',
      body: `"${r.keyword}" leaves the keyword map and the discovered list. You can bring it back from the Ignored tab on the Keywords page.`,
      confirmLabel: 'Ignore it',
    });
    if (ok && (await ignoreKeywords(ctx, [r.keyword]))) await ctx.reload();
  }

  const keywordCell = (v, r) =>
    h(
      'div',
      { class: 'km-keyword' },
      h('span', {}, v),
      h(
        'span',
        { class: 'km-tags' },
        sourceTags(r).map((t) => h('span', { class: 'km-tag' }, t)),
        (r.flags ?? []).map((f) =>
          h('span', { class: `chip ${f === 'cannibalized' ? 'chip-warn' : ''}`.trim() }, FLAG_LABEL[f] ?? f)
        ),
        r.clusterConflict
          ? h(
              'span',
              {
                class: 'chip chip-warn km-flag',
                title: `This search falls in a topic that page already targets ("${r.clusterConflict.keyword}"). A section there may serve it better than a new page.`,
              },
              'May be covered by ',
              r.clusterConflict.page
            )
          : null
      )
    );

  const columns = [
    { key: 'keyword', label: 'Keyword', wrap: true, format: keywordCell },
    {
      key: 'status',
      label: 'Status',
      title: 'Live: mapped to a live page. Pending: no page yet.',
      format: (v, r) => h('span', { class: `chip ${v === 'live' ? 'chip-accent' : ''}`.trim() }, statusText(r)),
    },
    {
      key: 'mappedTo',
      label: 'Mapped to',
      wrap: true,
      format: (v) => (v ? h('span', { class: 'km-page' }, pageLink(v)) : h('span', { class: 'muted' }, 'Unmapped')),
    },
    withVolume
      ? {
          key: 'volume',
          label: 'Monthly searches',
          align: 'right',
          title: 'From the file you imported. Shown only when the file had it.',
          format: (v) => (typeof v === 'number' ? fmt.num(v) : ''),
        }
      : null,
    {
      key: 'position',
      label: 'Place',
      align: 'right',
      format: (v) => (typeof v === 'number' ? fmt.position(v) : h('span', { class: 'muted' }, 'not shown')),
    },
    {
      key: 'impressions',
      label: 'Times shown',
      align: 'right',
      format: (v) => (typeof v === 'number' ? fmt.num(v) : ''),
    },
    {
      key: 'rankingPage',
      label: 'Page Google shows',
      wrap: true,
      format: (v, r) =>
        v
          ? h(
              'span',
              { class: 'km-page' },
              pageLink(v),
              r.mappedTo && v !== r.mappedTo
                ? h('span', { class: 'small muted km-diff' }, ' not the mapped page')
                : null
            )
          : '',
    },
    {
      key: 'origin',
      label: '',
      sortable: false,
      format: (v, r) =>
        v === 'registry'
          ? h('span', { class: 'small muted', title: 'Change it in the keyword file.' }, 'From the keyword file')
          : h(
              'span',
              { class: 'row km-actions' },
              h(
                'button',
                { type: 'button', class: 'btn btn-small', onclick: () => mapRow(r) },
                v === 'adopted' ? 'Change page' : 'Map to a page'
              ),
              v === 'discovered'
                ? h(
                    'button',
                    { type: 'button', class: 'btn btn-small btn-quiet', onclick: () => ignoreRow(r) },
                    'Ignore'
                  )
                : null
            ),
    },
  ].filter(Boolean);

  ctx.mount(
    el,
    insightLinks(h, 'keyword-map', nav?.counts ?? ctx.counts() ?? {}),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, entry.label),
        h('p', { class: 'page-sub' }, entry.explain),
        h(
          'p',
          { class: 'page-sub ins-note' },
          `${data.orderNote ?? ''} ${data.range ? `Numbers cover ${fmt.range(data.range)}.` : ''}`.trim()
        )
      )
    ),
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    tiles,
    h('div', { class: 'toolbar km-chips' }, chips),
    withVolume
      ? null
      : h(
          'p',
          { class: 'small muted', style: { margin: '0 0 12px' } },
          'Monthly searches show here once a keyword file you import has them.'
        ),
    tableBox
  );
  drawFilters();
  const table = dataTable(tableBox, {
    label: 'Keyword map',
    rows: filterRows(rows, filter),
    columns,
    rowKey: (r) => r.keyword,
    searchKeys: ['keyword', 'mappedTo', 'rankingPage'],
    csvHref: '/api/export/keyword-map.csv',
    emptyText: 'No keyword yet. Add targets on the Keywords page, or pull Search Console first.',
  });
  // Warm the page list so Map to a page opens without a wait.
  livePages(ctx).catch(() => {});
}
