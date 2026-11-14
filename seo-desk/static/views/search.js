// Queries: every search Google shows the site for. The filter bar (dates, search, page, country,
// device), the Searches and Target keywords lists, then where searches sit on Google. The big
// numbers, the chart, countries and devices live on Performance (overview.js); the Pages list lives
// on Pages (pages.js). A filter or a date range the stored pulls do not cover makes the Searches
// list come from Search Console live (/api/explore); the list already on screen stays until the new
// one arrives, and stays when it fails. Clicking a search opens its drawer; Up and Down move
// through the list. There is no site-wide average place anywhere: the only average is the like for
// like target keyword mean.

import { dataTable, downloadCsv } from './table.js';
import { openPageDrawer, MOVEMENT_LABEL } from './pages.js';
import { filterBar, readFilters, isExploring, hasFilters, apiQuery, RANGES as FILTER_RANGES } from './filters.js';
import { openSearchDrawer, followRows } from './search-drawer.js';

// Kept for any module that imported the country names from here; the table lives in countries.js.
export { COUNTRY } from './countries.js';

// The ranges /api/search answers itself; a list for any other range comes from /api/explore.
const SEARCH_RANGES = ['7', '28', '90', '480'];

// Live Search Console pulls run one at a time on the server, so the page asks for one at a time.
let liveChain = Promise.resolve();
const oneAtATime = (fn) => {
  const run = liveChain.then(fn, fn);
  liveChain = run.catch(() => {});
  return run;
};

const TABS = ['queries', 'targets'];
const DEFAULT_TAB = 'queries';

const ALIGNMENT_CHIP = { 'right page': 'chip-accent', 'wrong page': 'chip-warn' };

const blank = (v) => v === null || v === undefined;

export async function render(el, ctx) {
  const { api, h, fmt, params } = ctx;
  const state = readFilters(params, { today: fmt.isoPlus(0) });
  const days = SEARCH_RANGES.includes(state.range) ? Number(state.range) : 28;
  const exploring = isExploring(state, SEARCH_RANGES);
  let tab = TABS.includes(params.get('tab')) ? params.get('tab') : DEFAULT_TAB;
  const [data, options] = await Promise.all([
    api.get(`/api/search?range=${days}`),
    api.get('/api/explore/options').catch(() => null),
  ]);
  ctx.envelope(data);
  const view = { state, exploring, days, options };

  const bar = filterBar(ctx, {
    route: ctx.route,
    state,
    countries: options?.countries ?? [],
    today: fmt.isoPlus(0),
  });
  const pickedLabel = FILTER_RANGES.find((r) => r.value === state.range)?.label ?? '';
  const scopeNote = !SEARCH_RANGES.includes(state.range)
    ? `The Searches list follows the dates${hasFilters(state) ? ' and filters' : ''} you picked${state.range === 'custom' ? '' : ` (${pickedLabel.toLowerCase()})`}.`
    : null;

  // ---------------------------------------------------------------- the lists

  const countEls = new Map();
  view.setCount = (key, n) => {
    const c = countEls.get(key);
    if (c) c.textContent = fmt.num(n);
  };
  const panels = {
    queries: {
      label: 'Searches',
      count: data.queries.length,
      build: (box) => queriesTable(box, data, ctx, view),
    },
    targets: { label: 'Target keywords', count: data.targets.length, build: (box) => targetsTable(box, data, ctx) },
  };
  const panelBox = h('div', {});
  const built = new Map();
  const tabButtons = new Map();
  const showTab = (key) => {
    tab = key;
    for (const [k, b] of tabButtons) b.setAttribute('aria-selected', String(k === key));
    if (!built.has(key)) {
      const box = h('div', { role: 'tabpanel', 'aria-label': panels[key].label });
      panels[key].build(box);
      built.set(key, box);
    }
    panelBox.replaceChildren(built.get(key));
  };
  const tabs = h(
    'div',
    { class: 'tabs', role: 'tablist', 'aria-label': 'Lists' },
    TABS.map((key) => {
      const b = h(
        'button',
        {
          type: 'button',
          class: 'tab',
          role: 'tab',
          onclick: () => {
            ctx.setParams({ tab: key === DEFAULT_TAB ? null : key });
            showTab(key);
          },
        },
        panels[key].label,
        h('span', { class: 'count' }, fmt.num(panels[key].count))
      );
      countEls.set(key, b.querySelector('.count'));
      tabButtons.set(key, b);
      return b;
    })
  );
  showTab(tab);

  ctx.mount(
    el,
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Queries'),
        h(
          'p',
          { class: 'page-sub' },
          'Every search Google showed the site for. Clicks, impressions and the chart are on ',
          h('a', { href: '#/performance' }, 'Performance'),
          '; every page is on ',
          h('a', { href: '#/pages' }, 'Pages'),
          '. ',
          data.through ? `Search Console data runs through ${fmt.date(data.through)}.` : ''
        )
      )
    ),
    bar,
    scopeNote ? h('p', { class: 'small muted fb-scope' }, scopeNote) : null,
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    data.warnings?.length ? h('p', { class: 'banner banner-warn' }, data.warnings.join(' ')) : null,
    h('section', { class: 'section', style: { marginTop: '24px' } }, tabs, panelBox),
    distributionSection(ctx, state),
    data.notes?.length
      ? h(
          'div',
          { class: 'section' },
          data.notes.map((n) => h('p', { class: 'small muted', style: { margin: '2px 0' } }, n))
        )
      : null
  );
}

// ------------------------------------------------------------------ lists

const movementFilters = (rows) =>
  rows.some((r) => r.movement)
    ? Object.entries(MOVEMENT_LABEL).map(([key, label]) => ({ key, label, test: (r) => r.movement === key }))
    : [];

const movementNote = (h, rows) =>
  rows.length && !rows.some((r) => r.movement)
    ? h(
        'p',
        { class: 'small muted', style: { marginBottom: '8px' } },
        'Movement needs an earlier period of the same length, so it is blank for this range.'
      )
    : null;

// The explorer behind a filtered or custom view. Shows a loading line in `status`, then a summary
// of what came back, and hands the reply to onLoaded. A failure (or a busy Search Console) keeps
// the list on screen and says so, with Try again.
function loadExplore(ctx, { dim, state, status, onLoaded }) {
  const { h, fmt } = ctx;
  const storedFor = dim === 'page' ? ['7', '14', '28', '90'] : ['28', '90'];
  const live = hasFilters(state) || !storedFor.includes(state.range);
  const run = () => {
    status.replaceChildren(
      h(
        'p',
        { class: 'banner banner-accent fb-loading', role: 'status' },
        live ? 'Loading from Search Console. A filtered or custom view takes a few seconds.' : 'Loading...'
      )
    );
    return oneAtATime(() => ctx.api.get(`/api/explore?dim=${dim}&${apiQuery(state)}`)).then(
      (r) => {
        const t = r.totals ?? {};
        const what = dim === 'page' ? ['page', 'pages'] : ['search', 'searches'];
        const prev = t.prev
          ? `, against ${fmt.plural(t.prev.count, what[0], what[1])} shown ${fmt.num(t.prev.impressions)} times the period before`
          : '';
        const source =
          r.source === 'stored'
            ? 'From the stored Search Console pull.'
            : r.source === 'cache'
              ? `Pulled from Search Console${r.fetchedOn ? ` on ${r.fetchedOn}` : ''} and kept for 12 hours.`
              : 'Pulled from Search Console just now.';
        const notes = (r.notes ?? []).filter((n) => dim === 'page' || !/click/i.test(n));
        status.replaceChildren(
          h(
            'p',
            { class: 'section-note fb-summary' },
            h(
              'strong',
              {},
              `${fmt.plural(t.count ?? r.rows.length, what[0], what[1])}, shown ${fmt.num(t.impressions)} times, ${fmt.plural(t.clicks ?? 0, 'click', 'clicks')}`
            ),
            `${prev}. ${fmt.range(r.range)}. ${source}${notes.length ? ` ${notes.join(' ')}` : ''}`
          )
        );
        onLoaded(r);
      },
      (e) => {
        status.replaceChildren(
          h(
            'div',
            { class: 'banner banner-bad', role: 'alert' },
            h('strong', {}, e.message),
            ' The list below is still the one for the stored dates, without your filters. ',
            h('button', { type: 'button', class: 'btn btn-small', onclick: run }, 'Try again')
          )
        );
      }
    );
  };
  run();
}

function queriesTable(box, data, ctx, view) {
  const { h, fmt } = ctx;
  const { days, state, exploring } = view;
  const split = data.brandSplit;
  const splitLine = (label, s) =>
    h(
      'div',
      { class: 'tile' },
      h('span', { class: 'tile-label' }, label),
      h('span', { class: 'tile-value' }, fmt.num(s.searches)),
      h(
        'div',
        { class: 'tile-change' },
        `searches, shown ${fmt.num(s.impressions)} times, ${fmt.plural(s.clicks, 'click', 'clicks')}`
      )
    );
  // The drawer's trend covers the same dates as the list.
  const drawerRange = exploring
    ? apiQuery({ ...state, q: '', pagefilter: '', country: '', device: '' })
    : `range=${days <= 28 ? 28 : 90}`;
  const tableBox = h('div', {});
  const status = h('div', {});
  ctx.mount(
    box,
    h(
      'p',
      { class: 'section-note', style: { margin: '10px 0 8px' } },
      `Every search Google showed the site for${exploring ? '' : `, ${fmt.range(data.queriesRange)}`}. Search phrases are shown exactly as people typed them.${split && !exploring ? '' : ' Google hides clicks on rare searches, so clicks are a floor and there is no click rate per search.'} Click a search to see its trend and the pages that show for it; Up and Down move through the list.`
    ),
    split && !exploring
      ? h(
          'div',
          { style: { marginBottom: '6px' } },
          h(
            'div',
            { class: 'tiles' },
            splitLine("Brand searches (ours or a competitor's name)", split.brand),
            splitLine('Other searches', split.nonBrand)
          ),
          h('p', { class: 'small muted', style: { margin: '6px 0 10px' } }, split.clicksNote)
        )
      : null,
    exploring ? status : movementNote(h, data.queries),
    tableBox
  );
  const table = dataTable(tableBox, {
    label: 'Searches',
    rows: data.queries,
    rowKey: (r) => r.query,
    searchKeys: ['query', 'topPage'],
    filters: [
      ...movementFilters(data.queries),
      { key: 'brand', label: 'Brand', test: (r) => r.brand },
      { key: 'other', label: 'Not brand', test: (r) => !r.brand },
    ],
    csvHref: exploring ? null : `/api/export/queries.csv?range=${days}`,
    onCsv: exploring
      ? () =>
          downloadCsv(
            `seo-desk-searches-filtered-${fmt.isoPlus(0)}.csv`,
            [
              'Search',
              'Times shown',
              'Clicks (at least)',
              'Average place',
              'Change in times shown (%)',
              'Movement',
              'Brand',
            ],
            table
              .visibleRows()
              .map((r) => [
                r.query,
                r.impressions,
                r.clicks,
                r.position,
                r.change,
                MOVEMENT_LABEL[r.movement] ?? '',
                r.brand ? 'yes' : '',
              ])
          )
      : null,
    sort: { key: 'impressions', dir: 'desc' },
    emptyText: 'Google has not shown the site for any search in this period.',
    onRowClick: (r) =>
      followRows(table, r, (x) =>
        openSearchDrawer(x.query, ctx, { range: drawerRange, row: x, filtered: hasFilters(state) })
      ),
    columns: [
      { key: 'query', label: 'Search', wrap: true },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'clicks',
        label: 'Clicks',
        align: 'right',
        title: 'Google hides clicks on rare searches, so this is a floor',
        format: (v) => fmt.num(v),
      },
      {
        key: 'position',
        label: 'Average place',
        align: 'right',
        title: 'Lower is better',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      {
        key: 'change',
        label: 'Change',
        align: 'right',
        title: 'Change in times shown against the period before',
        format: (v) => fmt.change(v),
      },
      { key: 'movement', label: 'Movement', format: (v) => MOVEMENT_LABEL[v] ?? '' },
      {
        key: 'brand',
        label: 'Brand',
        title: "Has a product name in it, ours or a competitor's, from docs/seo/brand-terms.json",
        format: (v) => (v ? 'Brand' : ''),
      },
      exploring ? null : { key: 'topPage', label: 'Page shown most', wrap: true, format: (v) => v ?? '' },
      exploring
        ? null
        : {
            key: 'bingImpressions',
            label: 'Bing shown',
            align: 'right',
            title: 'Times Bing showed the site for the same search',
            format: (v) => (v ? fmt.num(v) : ''),
          },
    ].filter(Boolean),
  });
  if (exploring) {
    loadExplore(ctx, {
      dim: 'query',
      state,
      status,
      onLoaded: (r) => {
        const rows = r.rows.map((x) => ({
          query: x.key,
          clicks: x.clicks,
          impressions: x.impressions,
          position: x.position,
          change: x.change ?? null,
          movement: x.movement,
          brand: Boolean(x.brand),
        }));
        table.update(rows);
        view.setCount('queries', rows.length);
      },
    });
  }
}

// ------------------------------------------------------------------ where searches sit

const BUCKET_TEXT = {
  '1 to 3': ['Places 1 to 3', 'the top of page one'],
  '4 to 10': ['Places 4 to 10', 'the rest of page one'],
  '11 to 20': ['Places 11 to 20', 'page two'],
  '21 to 50': ['Places 21 to 50', 'pages three to five'],
  '51 and beyond': ['Place 51 and beyond', 'further back'],
};

function distributionSection(ctx, state) {
  const { h, fmt } = ctx;
  const body = h('div', {}, h('p', { class: 'loading', style: { padding: '12px 0' } }, 'Loading...'));
  const note = h('p', { class: 'section-note', style: { marginBottom: '12px' } });
  const rangeOnly = apiQuery({ ...state, q: '', pagefilter: '', country: '', device: '' });
  const load = () => {
    if (!['28', '90'].includes(state.range))
      body.replaceChildren(
        h('p', { class: 'loading', style: { padding: '12px 0' } }, 'Loading from Search Console...')
      );
    oneAtATime(() => ctx.api.get(`/api/distribution?${rangeOnly}`)).then(
      (d) => {
        const max = Math.max(1, ...d.buckets.flatMap((b) => [b.count, b.prevCount ?? 0]));
        note.textContent = `How many searches sit at each place on Google, ${fmt.range(d.range)}${d.comparable ? ', against the same number of days before' : ''}. ${fmt.plural(d.searches, 'search', 'searches')} in all. ${d.note ?? ''}${hasFilters(state) ? ' Your filters do not change this view.' : ''}`;
        body.replaceChildren(
          h(
            'ul',
            { class: 'dist' },
            d.buckets.map((b) => {
              const [label, sub] = BUCKET_TEXT[b.bucket] ?? [b.bucket, ''];
              const moved = blank(b.prevCount) ? null : b.count - b.prevCount;
              return h(
                'li',
                { class: 'dist-row' },
                h('div', { class: 'dist-label' }, h('span', {}, label), h('span', { class: 'small muted' }, sub)),
                h(
                  'div',
                  {
                    class: 'dist-bars',
                    role: 'img',
                    'aria-label': `${label}: ${fmt.num(b.count)} searches${blank(b.prevCount) ? '' : `, ${fmt.num(b.prevCount)} the period before`}`,
                  },
                  h('span', { class: 'dist-now', style: { width: `${Math.max(0.5, (b.count / max) * 100)}%` } }),
                  blank(b.prevCount)
                    ? null
                    : h('span', {
                        class: 'dist-before',
                        style: { width: `${Math.max(0.5, (b.prevCount / max) * 100)}%` },
                      })
                ),
                h(
                  'div',
                  { class: 'dist-num' },
                  h('strong', { class: 'num' }, fmt.num(b.count)),
                  h(
                    'span',
                    { class: `small num ${moved ? (moved > 0 ? 'dist-up' : 'dist-down') : 'muted'}` },
                    blank(b.prevCount)
                      ? 'no earlier period'
                      : `${fmt.num(b.prevCount)} before (${fmt.change(moved, 'count')})`
                  )
                )
              );
            })
          ),
          h(
            'p',
            { class: 'dist-key small muted' },
            h('span', { class: 'dist-swatch dist-now' }),
            'This period ',
            h('span', { class: 'dist-swatch dist-before' }),
            'The period before'
          )
        );
      },
      (e) => {
        note.textContent = '';
        body.replaceChildren(
          h(
            'p',
            { class: 'banner banner-bad', role: 'alert' },
            `${e.message} `,
            h('button', { type: 'button', class: 'btn btn-small', onclick: load }, 'Try again')
          )
        );
      }
    );
  };
  load();
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head', style: { marginBottom: '4px' } },
      h('h2', { class: 'section-title' }, 'Where searches sit')
    ),
    note,
    body
  );
}

function targetsTable(box, data, ctx) {
  const { h, fmt } = ctx;
  const like = data.likeForLike;
  const summary =
    like && like.enough && !blank(like.mean)
      ? `Like for like: the target keywords with a place in both periods sit at an average place of ${fmt.position(like.mean)}, over ${fmt.plural(like.n, 'keyword', 'keywords')} of ${like.targetsTotal}${blank(like.prevMean) ? '' : `, against ${fmt.position(like.prevMean)} for ${fmt.range(like.prevRange)}`}. Lower is better. This is the only average place on the desk, because a site-wide average drifts every time a new post starts ranking.`
      : `Not enough data yet for a like for like average: only ${fmt.plural(like?.n ?? 0, 'target keyword has', 'target keywords have')} a place in both periods.`;
  const tableBox = h('div', {});
  ctx.mount(
    box,
    h('p', { class: 'banner banner-accent', style: { margin: '10px 0' } }, summary),
    h(
      'p',
      { class: 'row', style: { marginBottom: '10px' } },
      h('a', { class: 'btn btn-small', href: '#/keywords' }, 'Open the Keywords page'),
      h(
        'span',
        { class: 'small muted' },
        'Target more searches, set priorities and see what Google shows the site for that no target covers.'
      )
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      `Every keyword in your keyword file with the page meant to win it, ${fmt.range(like?.range ?? data.range)}. The average above uses only these, so it stays comparable over time; searches targeted on the Keywords page are not mixed in. Click one to open its page.`
    ),
    tableBox
  );
  dataTable(tableBox, {
    label: 'Target keywords',
    rows: data.targets,
    searchKeys: ['keyword', 'page', 'rankingPage'],
    filters: [
      { key: 'right', label: 'Right page', test: (r) => r.alignment === 'right page' },
      { key: 'wrong', label: 'Wrong page', test: (r) => r.alignment === 'wrong page' },
      { key: 'none', label: 'No data yet', test: (r) => r.alignment === 'no data yet' },
    ],
    csvHref: '/api/export/targets.csv',
    sort: { key: 'impressions', dir: 'desc' },
    emptyText: 'Your keyword file has no keywords yet.',
    onRowClick: (r) => openPageDrawer(r.page, ctx),
    columns: [
      { key: 'keyword', label: 'Keyword', wrap: true },
      { key: 'page', label: 'Target page', wrap: true },
      {
        key: 'position',
        label: 'Place',
        align: 'right',
        title: 'Average place on Google. Lower is better.',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      {
        key: 'prevPosition',
        label: 'Before',
        align: 'right',
        title: 'Average place in the period before',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      {
        key: 'change',
        label: 'Movement',
        title: 'Places gained or lost against the period before',
        format: (v) => (blank(v) ? '' : fmt.change(v, 'positions')),
      },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
      { key: 'rankingPage', label: 'Page Google shows', wrap: true, format: (v) => v ?? '' },
      {
        key: 'alignment',
        label: 'Right page?',
        format: (v) => h('span', { class: `chip ${ALIGNMENT_CHIP[v] ?? ''}` }, v),
      },
    ],
  });
}
