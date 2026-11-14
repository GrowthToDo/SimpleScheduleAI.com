// Performance: how Google shows the site, from GET /api/overview. Four big numbers (clicks,
// impressions, the whole-site click rate, the like-for-like target keyword position), one chart
// of clicks and impressions on two scales with the page edits and Google updates on it, the top
// queries and top pages side by side, then countries and devices. Each list links to its full
// page. There is no site-wide average position here, and no click rate on a search row: Google
// hides clicks on rare searches.
//
// Pure parts, tested in tests/shell.test.mjs:
//   changeLine(tile, days)   the small line under a big number
//   chartMarkers(markers)    edit and Google update markers, one per day and kind

import { fmt } from '../app.js';
import { twoLineChart } from '../chart.js';
import { markerText } from './markers.js';
import { countryName } from './countries.js';

export const RANGES = [
  { days: 7, label: '7 days' },
  { days: 28, label: '28 days' },
  { days: 90, label: '90 days' },
  { days: 480, label: '16 months' },
];

const rangeLabel = (days) => RANGES.find((r) => r.days === Number(days))?.label ?? `${days} days`;
const blank = (v) => v === null || v === undefined || !Number.isFinite(Number(v));

export function changeLine(tile, days) {
  if (blank(tile?.change)) return fmt.NOT_ENOUGH;
  const c = Number(tile.change);
  if (tile.changeKind === 'positions') return fmt.change(c, 'positions');
  const before = `on the ${rangeLabel(days)} before`;
  if (tile.changeKind === 'points') {
    const a = Math.abs(c).toLocaleString('en-US', { maximumFractionDigits: 1 });
    return `${c > 0 ? '+' : c < 0 ? '-' : ''}${a} ${a === '1' ? 'point' : 'points'} ${before}`;
  }
  return `${fmt.change(c, 'percent')} ${before}`;
}

export function chartMarkers(markers) {
  const groups = new Map();
  for (const m of markers ?? []) {
    if (m.kind !== 'edit' && m.kind !== 'google-update') continue;
    const key = `${m.date}|${m.kind}`;
    if (!groups.has(key)) groups.set(key, { date: m.date, kind: m.kind, items: [] });
    groups.get(key).items.push(m);
  }
  return [...groups.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((g) => ({
      date: g.date,
      kind: g.kind,
      label:
        g.kind === 'edit' && g.items.length > 1
          ? `${g.items.length} page edits: ${g.items.map((m) => m.label).join('; ')}`
          : markerText(g.items[0]),
    }));
}

const DEVICE = { desktop: 'Computer', mobile: 'Phone', tablet: 'Tablet' };

const tileValue = (t) => {
  if (blank(t.value)) return null;
  if (t.key === 'clickRate') return t.valueText ?? fmt.share(t.value);
  if (t.key === 'targetPosition') return fmt.position(t.value);
  return fmt.num(t.value);
};

export async function render(el, ctx) {
  const { api, h, params } = ctx;
  const asked = Number(params.get('range'));
  const days = RANGES.some((r) => r.days === asked) ? asked : 28;
  const data = await api.get(`/api/overview?range=${days}`);
  ctx.envelope(data);
  // The server says when it holds less history than the range asks for (data.short): data.range is
  // then what it holds, coverageNote says so, and there is no period before to compare with.
  const short = data.short === true;

  // ---------------------------------------------------------------- the head and the range
  const rangeButtons = h(
    'div',
    { class: 'seg seg-range', role: 'group', 'aria-label': 'Dates' },
    RANGES.map((r) =>
      h(
        'button',
        {
          type: 'button',
          'aria-pressed': String(r.days === days),
          onclick: () => ctx.navigate(`#/performance${r.days === 28 ? '' : `?range=${r.days}`}`),
        },
        r.label
      )
    )
  );

  // ---------------------------------------------------------------- four big numbers
  const position = data.tiles.find((t) => t.key === 'targetPosition');
  const tiles = h(
    'div',
    { class: 'tiles tiles-four' },
    data.tiles.map((t) => {
      const value = tileValue(t);
      const hover = [t.note, t.detail].filter(Boolean).join(' ');
      // With less history than the range, there is no period before to compare with. The target
      // position compares its own two 28 day periods, so it keeps its line.
      const compare = !short || t.key === 'targetPosition';
      return h(
        'div',
        {
          class: 'tile',
          role: 'group',
          title: hover,
          tabindex: 0,
          'aria-label': `${t.label}: ${value ?? fmt.NOT_ENOUGH}. ${hover}`,
        },
        h('span', { class: 'tile-label' }, t.label),
        h('span', { class: `tile-value${value === null ? ' is-text' : ''}` }, value ?? fmt.NOT_ENOUGH),
        compare ? h('div', { class: `tile-change ${fmt.direction(t.change)}` }, changeLine(t, days)) : null
      );
    })
  );

  // ---------------------------------------------------------------- the chart
  const chartBox = h('div', {});
  twoLineChart(chartBox, {
    label: 'Clicks and impressions from Google, each day',
    series: [
      { key: 'clicks', label: 'Clicks', points: data.series.map((p) => ({ date: p.date, value: p.clicks })) },
      {
        key: 'impressions',
        label: 'Impressions',
        points: data.series.map((p) => ({ date: p.date, value: p.impressions })),
      },
    ],
    markers: chartMarkers(data.markers),
  });

  ctx.mount(
    el,
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Performance'),
        h(
          'p',
          { class: 'page-sub' },
          short
            ? `How Google shows the site. ${data.coverageNote ?? ''}`.trim()
            : `How Google shows the site, ${fmt.range(data.range)}${days === 480 ? '' : ', against the same number of days before'}.`
        )
      ),
      rangeButtons
    ),
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    data.warnings?.length ? h('p', { class: 'banner banner-warn' }, data.warnings.join(' ')) : null,
    h(
      'section',
      { class: 'section section-first', 'aria-label': 'Search in numbers' },
      tiles,
      position?.note ? h('p', { class: 'tiles-note' }, position.note) : null
    ),
    h(
      'section',
      { class: 'section panel' },
      h(
        'div',
        { class: 'section-head' },
        h('h2', { class: 'section-title' }, 'Clicks and impressions, each day'),
        h('p', { class: 'section-note' }, 'Clicks on the left scale, impressions on the right.')
      ),
      chartBox
    ),
    h(
      'div',
      { class: 'cols-even' },
      topList(ctx, {
        title: 'Top queries',
        href: '#/queries',
        seeAll: 'See all queries',
        note: [
          `${fmt.range(data.queriesRange)}.`,
          data.queriesNote ?? '',
          'Google hides clicks on rare searches, so clicks here are a floor.',
        ]
          .filter(Boolean)
          .join(' '),
        rows: data.topQueries,
        name: (r) => r.query,
        nameLabel: 'Query',
        empty: 'Google has not shown the site for any search in this period.',
      }),
      topList(ctx, {
        title: 'Top pages',
        href: '#/pages',
        seeAll: 'See all pages',
        note: `${fmt.range(data.pagesRange ?? data.range)}. Click a page to open it on the Pages page.`,
        rows: data.topPages,
        name: (r) => h('a', { href: `#/pages?page=${encodeURIComponent(r.page)}` }, r.page),
        nameLabel: 'Page',
        empty: 'Google has not shown any page in this period.',
      })
    ),
    h(
      'div',
      { class: 'cols-even' },
      breakdown(ctx, {
        title: 'Countries',
        note: 'Top countries by impressions.',
        rows: data.countries,
        name: (r) => countryName(r.country),
      }),
      breakdown(ctx, {
        title: 'Devices',
        note: 'Impressions by device.',
        rows: [...data.devices].sort((a, b) => b.impressions - a.impressions),
        name: (r) => DEVICE[String(r.device).toLowerCase()] ?? String(r.device),
      })
    )
  );
}

// Ten rows: name, clicks, impressions. No click rate on a search row.
function topList(ctx, { title, href, seeAll, note, rows, name, nameLabel, empty }) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section panel' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, title),
      h('a', { class: 'btn btn-small btn-quiet', href }, seeAll)
    ),
    h('p', { class: 'section-note' }, note),
    rows.length
      ? h(
          'div',
          { class: 'table-wrap table-flush' },
          h(
            'table',
            { class: 'table table-compact' },
            h(
              'thead',
              {},
              h(
                'tr',
                {},
                h('th', { scope: 'col' }, nameLabel),
                h('th', { scope: 'col', class: 'num' }, 'Clicks'),
                h('th', { scope: 'col', class: 'num' }, 'Impressions')
              )
            ),
            h(
              'tbody',
              {},
              rows
                .slice(0, 10)
                .map((r) =>
                  h(
                    'tr',
                    {},
                    h('td', { class: 'cell-wrap' }, name(r)),
                    h('td', { class: 'num' }, fmt.num(r.clicks)),
                    h('td', { class: 'num' }, fmt.num(r.impressions))
                  )
                )
            )
          )
        )
      : h('p', { class: 'empty' }, empty)
  );
}

function breakdown(ctx, { title, note, rows, name }) {
  const { h } = ctx;
  const max = Math.max(1, ...rows.map((r) => r.impressions));
  return h(
    'section',
    { class: 'section panel' },
    h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, title)),
    h('p', { class: 'section-note' }, `${note} The latest 28 days of Search Console data.`),
    rows.length
      ? h(
          'ul',
          { class: 'share-list' },
          rows.map((r) =>
            h(
              'li',
              {},
              h(
                'div',
                { class: 'share-head' },
                h('span', {}, name(r)),
                h(
                  'span',
                  { class: 'num muted' },
                  `${fmt.num(r.impressions)} impressions, ${fmt.plural(r.clicks, 'click', 'clicks')}`
                )
              ),
              h(
                'div',
                { class: 'bar', role: 'img', 'aria-label': `${name(r)}: ${fmt.num(r.impressions)} impressions` },
                h('span', { style: { width: `${Math.max(0.5, (r.impressions / max) * 100)}%` } })
              )
            )
          )
        )
      : h('p', { class: 'empty' }, fmt.NOT_ENOUGH)
  );
}
