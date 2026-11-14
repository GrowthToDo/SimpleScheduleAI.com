// Pages: the page-wise keyword tracker. Every live page with its target keyword and place,
// times shown, clicks, movement, searches, links in, last edit, frozen date and whether it is
// on Google. Clicking a page opens its drawer: every search it shows for, its trend with edit
// markers, its open opportunities, its verdicts, the pages that link to it, and its buttons.
// The address #/pages?page=/blog/x opens that page's drawer. The filter bar (filters.js) picks
// other dates or filters; the numbers then come from /api/explore, and the list on screen stays
// until they arrive. Up and Down move through the list, also with the drawer open.

import { dataTable, downloadCsv } from './table.js';
import { filterBar, readFilters, isExploring, hasFilters, apiQuery } from './filters.js';
import { followRows } from './search-drawer.js';
import { renderCard } from './card.js';
import { verdictCard } from './results.js';
import { lineChart } from '../chart.js';
import { markerText } from './markers.js';

export const MOVEMENT_LABEL = {
  growing: 'Growing',
  slipping: 'Decaying',
  new: 'New',
  gone: 'Gone',
  steady: 'Steady',
};

const INDEX_LABEL = {
  indexed: 'On Google',
  'not-indexed': 'Not on Google',
  unknown: 'Unknown',
};

const KIND_LABEL = { post: 'Blog post', article: 'Article', page: 'Site page' };

const blank = (v) => v === null || v === undefined;

export async function render(el, ctx) {
  const { api, h, fmt, params } = ctx;
  const state = readFilters(params, { today: fmt.isoPlus(0) });
  const exploring = isExploring(state, ['28']);
  const [data, options] = await Promise.all([
    api.get('/api/pages'),
    exploring ? api.get('/api/explore/options').catch(() => null) : null,
  ]);
  ctx.envelope(data);
  const base = data.items.map((r) => ({
    ...r,
    indexLabel: r.index ? INDEX_LABEL[r.index] : 'Not checked',
  }));
  let items = base;

  const count = (test) => items.filter(test).length;
  const today = fmt.isoPlus(0);
  const isFrozen = (r) => Boolean(r.frozenUntil) && r.frozenUntil >= today;

  // Filters beyond the movement chips: kind, frozen and whether the page is on Google.
  const selects = [
    {
      key: 'kind',
      label: 'Kind',
      options: [
        ['', 'Every kind'],
        ['post', 'Blog posts'],
        ['article', 'Articles'],
        ['page', 'Site pages'],
      ],
      test: (r, v) => r.kind === v,
    },
    {
      key: 'frozen',
      label: 'Frozen',
      options: [
        ['', 'Frozen or not'],
        ['yes', 'Frozen now'],
        ['no', 'Free to edit'],
      ],
      test: (r, v) => (v === 'yes' ? isFrozen(r) : !isFrozen(r)),
    },
    {
      key: 'google',
      label: 'On Google',
      options: [
        ['', 'Any index status'],
        ['indexed', 'On Google'],
        ['not-indexed', 'Not on Google'],
        ['unchecked', 'Not checked yet'],
      ],
      test: (r, v) => (v === 'unchecked' ? !r.index || r.index === 'unknown' : r.index === v),
    },
  ];
  const chosen = Object.fromEntries(selects.map((s) => [s.key, params.get(s.key) ?? '']));
  const filtered = () => items.filter((r) => selects.every((s) => !chosen[s.key] || s.test(r, chosen[s.key])));

  const selectRow = h(
    'div',
    { class: 'toolbar' },
    selects.map((s) => {
      const sel = h(
        'select',
        { class: 'select', 'aria-label': s.label },
        s.options.map(([v, label]) => h('option', { value: v }, label))
      );
      sel.value = chosen[s.key];
      sel.addEventListener('change', () => {
        chosen[s.key] = sel.value;
        ctx.setParams({ [s.key]: sel.value || null });
        table.update(filtered());
      });
      return sel;
    })
  );

  const tableBox = h('div', {});
  const table = dataTable(tableBox, {
    label: 'Live pages',
    rows: filtered(),
    rowKey: (r) => r.page,
    searchKeys: ['page', 'keyword'],
    csvHref: exploring ? null : '/api/export/pages.csv',
    // A filtered list is saved as it is on screen.
    onCsv: exploring
      ? () =>
          downloadCsv(
            `seo-desk-pages-filtered-${fmt.isoPlus(0)}.csv`,
            [
              'Page',
              'Target keyword',
              'Times shown',
              'Clicks',
              'Click rate',
              'Average place',
              'Change in times shown (%)',
              'Movement',
            ],
            table
              .visibleRows()
              .map((r) => [
                r.page,
                r.keyword,
                r.impressions,
                r.clicks,
                r.ctr,
                r.avgPosition,
                r.change,
                MOVEMENT_LABEL[r.movement] ?? '',
              ])
          )
      : null,
    sort: { key: 'impressions', dir: 'desc' },
    emptyText: exploring
      ? 'Google showed no page for these dates and filters.'
      : 'No live pages are known yet. Press Refresh now at the top.',
    onRowClick: (r) => followRows(table, r, (x) => openPageDrawer(x.page, ctx)),
    filters: Object.entries(MOVEMENT_LABEL).map(([key, label]) => ({
      key,
      label,
      test: (r) => r.movement === key,
    })),
    columns: [
      { key: 'page', label: 'Page', wrap: true },
      {
        key: 'keyword',
        label: 'Target keyword',
        wrap: true,
        title: 'The search this page is meant to win, from your keyword file',
        format: (v) => v ?? '',
      },
      {
        key: 'position',
        label: 'Keyword place',
        align: 'right',
        title: 'Average place in Google for the target keyword. Lower is better.',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      {
        key: 'avgPosition',
        label: 'Average place',
        align: 'right',
        title: 'Average place across every search this page shows for. Lower is better.',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      {
        key: 'impressions',
        label: 'Times shown',
        align: 'right',
        title: 'How many times Google showed this page',
        format: (v) => fmt.num(v),
      },
      { key: 'clicks', label: 'Clicks', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'ctr',
        label: 'Click rate',
        align: 'right',
        title:
          'Clicks divided by times shown. Shown only for pages above the minimum, because Google hides some clicks.',
        format: (v) => (blank(v) ? '' : fmt.share(v)),
      },
      {
        key: 'change',
        label: 'Change',
        align: 'right',
        title: 'Change in times shown against the 28 days before',
        format: (v) => fmt.change(v),
      },
      { key: 'movement', label: 'Movement', format: (v) => MOVEMENT_LABEL[v] ?? '' },
      {
        key: 'queryCount',
        label: 'Searches',
        align: 'right',
        title: 'How many different searches showed this page',
        format: (v) => fmt.num(v),
      },
      {
        key: 'inbound',
        label: 'Links in',
        align: 'right',
        title: 'How many of our pages link to this one',
        format: (v) => fmt.num(v),
      },
      {
        key: 'lastEdit',
        label: 'Last edit',
        title: 'The last deliberate change: a card marked done, a plan row, or an edit note',
        format: (v) => (v ? fmt.dateShort(v) : ''),
      },
      {
        key: 'frozenUntil',
        label: 'Frozen until',
        title: 'Changed on purpose, so left alone until this date for a clean verdict',
        format: (v) => (v ? fmt.dateShort(v) : ''),
      },
      { key: 'indexLabel', label: 'On Google' },
    ],
  });

  // ---------------------------------------------------------------- dates and filters
  const bar = filterBar(ctx, {
    route: 'pages',
    state,
    countries: options?.countries ?? [],
    today: fmt.isoPlus(0),
  });
  const status = h('div', {});
  const live = hasFilters(state) || !['7', '14', '28', '90'].includes(state.range);
  async function loadFiltered() {
    status.replaceChildren(
      h(
        'p',
        { class: 'banner banner-accent fb-loading', role: 'status' },
        live ? 'Loading from Search Console. A filtered or custom view takes a few seconds.' : 'Loading...'
      )
    );
    let r;
    try {
      r = await api.get(`/api/explore?dim=page&${apiQuery(state)}`);
    } catch (e) {
      status.replaceChildren(
        h(
          'div',
          { class: 'banner banner-bad', role: 'alert' },
          h('strong', {}, e.message),
          ' The list below still shows the last 28 days without filters. ',
          h('button', { type: 'button', class: 'btn btn-small', onclick: loadFiltered }, 'Try again')
        )
      );
      return;
    }
    const byPage = new Map(base.map((x) => [x.page, x]));
    const seen = new Set();
    items = r.rows.map((x) => {
      seen.add(x.key);
      return {
        ...(byPage.get(x.key) ?? { page: x.key, indexLabel: 'Not a live page' }),
        page: x.key,
        impressions: x.impressions,
        clicks: x.clicks,
        ctr: x.ctr ?? null,
        avgPosition: x.position,
        change: x.change ?? null,
        movement: x.movement,
      };
    });
    // With only other dates, live pages Google did not show still belong in the list.
    if (!hasFilters(state)) {
      for (const it of base) {
        if (!seen.has(it.page))
          items.push({ ...it, impressions: 0, clicks: 0, ctr: null, avgPosition: null, change: null, movement: null });
      }
    }
    table.update(filtered());
    status.replaceChildren(
      h(
        'p',
        { class: 'section-note fb-summary' },
        h(
          'strong',
          {},
          `${fmt.plural(r.totals?.count ?? r.rows.length, 'page', 'pages')} shown ${fmt.num(r.totals?.impressions)} times, ${fmt.plural(r.totals?.clicks ?? 0, 'click', 'clicks')}`
        ),
        `, ${fmt.range(r.range)}. ${r.source === 'stored' ? 'From the stored Search Console pull.' : r.source === 'cache' ? `Pulled from Search Console${r.fetchedOn ? ` on ${r.fetchedOn}` : ''} and kept for 12 hours.` : 'Pulled from Search Console just now.'} Times shown, clicks, click rate, average place and movement follow your dates and filters; the target keyword place, searches and links in stay on the last 28 days.`
      )
    );
  }

  const frozenNow = count(isFrozen);
  const notOnGoogle = count((r) => r.index === 'not-indexed');
  const tileBtn = (label, value, sub, filterKey) =>
    h(
      filterKey ? 'button' : 'div',
      {
        type: filterKey ? 'button' : null,
        class: 'tile',
        title: filterKey ? `Show only ${label.toLowerCase()} pages` : null,
        onclick: filterKey ? () => table.setFilter(filterKey) : null,
      },
      h('span', { class: 'tile-label' }, label),
      h('span', { class: 'tile-value' }, fmt.num(value)),
      h('div', { class: 'tile-change' }, sub)
    );

  ctx.mount(
    el,
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Pages'),
        h(
          'p',
          { class: 'page-sub' },
          'Every live page, the search it is meant to win, and how Google treats it. Click a page to see every search it shows for. ',
          data.range ? `Numbers cover ${fmt.range(data.range)}, against the 28 days before.` : ''
        )
      )
    ),
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    data.warnings?.length ? h('p', { class: 'banner banner-warn' }, data.warnings.join(' ')) : null,
    h(
      'section',
      { class: 'section', 'aria-label': 'Pages in numbers' },
      h(
        'div',
        { class: 'tiles' },
        tileBtn(
          'Live pages',
          items.length,
          notOnGoogle ? `${fmt.plural(notOnGoogle, 'is', 'are')} not on Google` : 'none known to be missing from Google'
        ),
        tileBtn(
          'Growing',
          count((r) => r.movement === 'growing'),
          'shown more than the 28 days before',
          'growing'
        ),
        tileBtn(
          'Decaying',
          count((r) => r.movement === 'slipping'),
          'shown less than the 28 days before',
          'slipping'
        ),
        tileBtn('Frozen now', frozenNow, frozenNow ? 'not to be edited yet' : 'every page is free to edit')
      )
    ),
    h('section', { class: 'section' }, bar, status, selectRow, tableBox)
  );
  if (exploring) loadFiltered();

  // A link from another page (#/pages?page=/blog/x) opens that page's drawer once.
  const wanted = params.get('page');
  if (wanted) {
    ctx.setParams({ page: null });
    setTimeout(() => openPageDrawer(wanted, ctx), 0);
  }
}

// ------------------------------------------------------------------ the page drawer

export async function openPageDrawer(path, ctx) {
  const { api, h } = ctx;
  const box = h('div', {}, h('p', { class: 'loading' }, 'Loading...'));
  ctx.openDrawer(box, { title: path });
  let p;
  try {
    p = await api.get(`/api/page?path=${encodeURIComponent(path)}`);
  } catch (e) {
    if (box.isConnected) box.replaceChildren(h('p', { class: 'banner banner-bad' }, e.message));
    return;
  }
  if (!box.isConnected) return;
  box.replaceChildren(pageDetail(p, ctx));
}

function briefText(p, fmt) {
  const lines = [`Page: ${p.links?.live ?? p.page}`];
  const range = fmt.range(p.range);
  if (p.keyword) {
    lines.push(
      `Target keyword: ${p.keyword}${blank(p.position) ? ' (no data for it in this period)' : ` (average place ${fmt.position(p.position)})`}`
    );
  }
  lines.push(
    `Google, ${range}: shown ${fmt.num(p.impressions)} times, ${fmt.num(p.clicks)} clicks, average place ${fmt.position(p.avgPosition)}${blank(p.change) ? '' : `, ${fmt.change(p.change)} times shown against the 28 days before`}.`
  );
  if (p.bingImpressions) lines.push(`Bing: shown ${fmt.num(p.bingImpressions)} times.`);
  if (p.index)
    lines.push(
      `Google index: ${INDEX_LABEL[p.index] ?? p.index}${p.lastCrawl ? `, last crawled ${p.lastCrawl}` : ''}.`
    );
  if (p.lastEdit) lines.push(`Last deliberate edit: ${p.lastEdit}.`);
  if (p.frozen) lines.push(`Frozen until ${p.frozen.until}: ${p.frozen.why}`);
  lines.push(`Links in from ${fmt.plural(p.inbound ?? 0, 'page', 'pages')}.`);
  const top = [...(p.queries ?? [])].sort((a, b) => b.impressions - a.impressions).slice(0, 15);
  if (top.length) {
    lines.push('', `Top searches on Google (${fmt.range(p.queriesRange)}):`);
    for (const q of top) {
      lines.push(
        `- "${q.query}": place ${fmt.position(q.position)}, shown ${fmt.num(q.impressions)}, clicks ${fmt.num(q.clicks)}`
      );
    }
  }
  if (p.opportunities?.length) {
    lines.push('', 'Open opportunities:');
    for (const o of p.opportunities) {
      lines.push(`- ${o.title}. Measured: ${o.measured} Hypothesis: ${o.action} Test: ${o.test}`);
    }
  }
  if (p.verdicts?.length) {
    lines.push('', 'Verdicts on past changes:');
    for (const v of p.verdicts) lines.push(`- ${v.summary}`);
  }
  return lines.join('\n');
}

function pageDetail(p, ctx) {
  const { h, fmt, toast } = ctx;
  const path = p.page;
  const section = (title, note, ...body) =>
    h(
      'section',
      { class: 'section' },
      h(
        'div',
        { class: 'section-head', style: { marginBottom: note ? '4px' : '10px' } },
        h('h3', { class: 'section-title' }, title)
      ),
      note ? h('p', { class: 'section-note', style: { marginBottom: '8px' } }, note) : null,
      ...body
    );

  const buttons = h(
    'div',
    { class: 'row' },
    p.links?.live
      ? h('a', { class: 'btn btn-small', href: p.links.live, target: '_blank', rel: 'noopener' }, 'Open the page')
      : null,
    p.links?.searchConsole
      ? h(
          'a',
          { class: 'btn btn-small', href: p.links.searchConsole, target: '_blank', rel: 'noopener' },
          'Open in Search Console'
        )
      : null,
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-small',
        onclick: async () => {
          const ok = await ctx.copyText(briefText(p, fmt));
          toast(
            ok
              ? 'Brief copied. Paste it into Claude.'
              : 'The browser blocked copying. Click the page once, then try again.',
            ok ? 'success' : 'error'
          );
        },
      },
      'Copy brief'
    )
  );

  if (p.empty) {
    return h(
      'div',
      { class: 'stack' },
      buttons,
      h('p', { class: 'empty' }, 'No search data for this page yet. It shows here after the next pull.')
    );
  }

  const facts = [
    ['Kind', KIND_LABEL[p.kind] ?? p.kind],
    ['Target keyword', p.keyword ?? 'none set in your keyword file'],
    p.keyword ? ['Place for it', blank(p.position) ? 'no data for it in this period' : fmt.position(p.position)] : null,
    ['Average place', blank(p.avgPosition) ? fmt.NOT_ENOUGH : `${fmt.position(p.avgPosition)} across every search`],
    ['Times shown', fmt.num(p.impressions)],
    ['Clicks', fmt.num(p.clicks)],
    ['Click rate', blank(p.ctr) ? 'not shown below the minimum times shown' : fmt.share(p.ctr)],
    ['Change', blank(p.change) ? fmt.NOT_ENOUGH : `${fmt.change(p.change)} times shown against the 28 days before`],
    ['Bing', `shown ${fmt.num(p.bingImpressions ?? 0)} times`],
    [
      'On Google',
      `${p.index ? INDEX_LABEL[p.index] : 'not checked yet'}${p.lastCrawl ? `, last crawled ${fmt.date(p.lastCrawl)}` : ''}`,
    ],
    ['Last edit', p.lastEdit ? fmt.date(p.lastEdit) : 'no deliberate edit on record'],
  ].filter(Boolean);

  const chartBox = h('div', {});
  lineChart(chartBox, {
    series: p.series,
    markers: p.markers.map((m) => ({ date: m.date, label: markerText(m) })),
    label: `Times ${path} was shown on Google each day`,
  });
  const seriesRange =
    p.series?.length > 1 ? `${fmt.date(p.series[0].date)} to ${fmt.date(p.series[p.series.length - 1].date)}` : '';

  const hasBing = p.queries.some((q) => q.bingImpressions > 0);
  const queryRows = p.queries.map((q) => ({
    ...q,
    moved: blank(q.prevPosition) || blank(q.position) ? null : Math.round((q.prevPosition - q.position) * 10) / 10,
  }));
  const queriesBox = h('div', {});
  dataTable(queriesBox, {
    label: `Searches that showed ${path}`,
    rows: queryRows,
    searchKeys: ['query'],
    pageSize: 25,
    sort: { key: 'impressions', dir: 'desc' },
    emptyText: 'Google has not shown this page for any search in this period.',
    columns: [
      { key: 'query', label: 'Search', wrap: true },
      {
        key: 'position',
        label: 'Place',
        align: 'right',
        title: 'Average place on Google. Lower is better.',
        format: (v) => (blank(v) ? '' : fmt.position(v)),
      },
      {
        key: 'moved',
        label: 'Movement',
        title: 'Places gained or lost against the 28 days before',
        // No earlier place can mean new, or only below the row limit before: say what is known.
        format: (v, r) =>
          blank(r.prevPosition)
            ? h('span', { class: 'muted' }, 'no earlier data')
            : blank(v)
              ? ''
              : fmt.change(v, 'positions'),
      },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
      { key: 'clicks', label: 'Clicks', align: 'right', format: (v) => fmt.num(v) },
      hasBing
        ? {
            key: 'bingImpressions',
            label: 'Bing shown',
            align: 'right',
            title: 'Times Bing showed the site for the same search',
            format: (v) => (v ? fmt.num(v) : ''),
          }
        : null,
    ].filter(Boolean),
  });

  const reopen = async () => {
    await ctx.reload();
    await openPageDrawer(path, ctx);
  };

  const verdicts = (p.verdicts ?? []).map((v) => ({
    ...v,
    verdict: v.verdict ?? (v.status === 'too-early' ? 'too-early' : null),
    batch: Boolean(v.batch),
    pages: v.pages ?? [],
  }));

  return h(
    'div',
    { class: 'stack' },
    buttons,
    p.frozen
      ? h('p', { class: 'banner banner-accent' }, h('strong', {}, `Frozen until ${p.frozen.untilText}. `), p.frozen.why)
      : null,
    section(
      'In numbers',
      `${fmt.range(p.range)}. Lower places are better.`,
      h(
        'dl',
        { class: 'kv' },
        facts.map(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])
      )
    ),
    section(
      'Times shown each day',
      `${seriesRange ? `${seriesRange}. ` : ''}Each dot on the bottom line is a publish, an edit or a note. Hover a dot to read it.`,
      chartBox
    ),
    section(
      'Every search it shows for',
      `${p.queryCount > p.queries.length ? `The top ${fmt.num(p.queries.length)} of ${fmt.num(p.queryCount)} searches by times shown` : fmt.plural(p.queries.length, 'search', 'searches')} on Google, ${fmt.range(p.queriesRange)}. Google hides clicks on rare searches, so clicks here are a floor.${hasBing ? ' Bing shown counts the whole site on Bing for the same search.' : ''}`,
      queriesBox
    ),
    section(
      'Open opportunities',
      null,
      p.opportunities.length
        ? h(
            'div',
            {},
            p.opportunities.map((o) => renderCard(o, ctx, { variant: 'row', onChange: reopen }))
          )
        : h('p', { class: 'empty' }, 'Nothing open for this page.')
    ),
    section(
      'Verdicts on past changes',
      null,
      verdicts.length
        ? h(
            'div',
            { class: 'stack' },
            verdicts.map((v) => verdictCard(v, ctx, { showPage: false }))
          )
        : h('p', { class: 'empty' }, 'No change to this page has been judged yet.')
    ),
    section(
      'Links in',
      `${fmt.plural(p.inbound ?? p.inboundFrom.length, 'page links', 'pages link')} here.${p.inboundSiteWide ? ' It is also linked from every page through the menu or footer.' : ''}`,
      p.inboundFrom.length
        ? h(
            'ul',
            { class: 'plain-list small' },
            p.inboundFrom.map((from) =>
              h(
                'li',
                {},
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'btn btn-quiet btn-small',
                    style: {
                      marginLeft: '-8px',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                      maxWidth: '100%',
                    },
                    onclick: () => openPageDrawer(from, ctx),
                  },
                  from
                )
              )
            )
          )
        : h('p', { class: 'empty' }, 'No page on the site links here yet.')
    )
  );
}
