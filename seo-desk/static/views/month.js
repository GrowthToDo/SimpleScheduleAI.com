// Monthly report (#/month?m=2026-10): one calendar month on one printable page, from GET /api/month.
// The month picker (every complete month the desk holds, newest first, the current one "so far"),
// four big numbers against the month before (per day, because months differ in length), the days of
// the month with page edits and Google updates, a few plain sentences built from the numbers, top
// pages and searches, the target keywords, what was done in the month, other sources and when each
// was pulled. Save as PDF prints it (the print styles in app.css: light, no sidebar, A4), Copy as text
// gives a plain version for an email, Download CSV the full lists with the month on every row.
//
// The server works out every number and percentage; this page only formats them. Text from data goes
// in as text nodes.
//
// Pure parts, tested in tests/month.test.mjs (no browser needed):
//   tileChangeText(tile, fmt)   the small line under a big number
//   monthText(data, fmt)        the whole report as plain text, for Copy as text

import { twoLineChart } from '../chart.js';
import { chartMarkers } from './overview.js';

export const PRINT_TITLE = 'Monthly report';

const blank = (v) => v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v));

// "+11.1% per day, against September's 30 days", "+0.7 points against 1 September to 30 September",
// "0.4 places better against ...", or "not enough data yet".
export function tileChangeText(t, fmt) {
  if (blank(t?.change)) return fmt.NOT_ENOUGH;
  const c = Number(t.change);
  let head;
  if (t.changeKind === 'positions') head = fmt.change(c, 'positions');
  else if (t.changeKind === 'points') {
    const a = Math.abs(c).toLocaleString('en-US', { maximumFractionDigits: 1 });
    head = `${c > 0 ? '+' : c < 0 ? '-' : ''}${a} ${a === '1' ? 'point' : 'points'}`;
  } else head = fmt.change(c, 'percent');
  return t.against ? `${head} ${t.against}` : head;
}

export const tileValueText = (t, fmt) => {
  if (blank(t?.value)) return fmt.NOT_ENOUGH;
  if (t.key === 'clickRate') return t.valueText ?? fmt.share(t.value);
  if (t.key === 'targetPosition') return fmt.position(t.value);
  return fmt.num(t.value);
};

const changeCell = (v, fmt) => (blank(v) ? fmt.NOT_ENOUGH : fmt.change(v, 'percent'));
const placeCell = (v, fmt) => (blank(v) ? '' : fmt.position(v));

// The report as plain text: the same sections and the same server sentences, no arithmetic.
export function monthText(d, fmt) {
  const out = [];
  const line = (s = '') => out.push(s);
  line(`SEO report: ${d.label}`);
  line(`${d.cur.text}. ${d.compareText}`);
  line(d.standingLine);
  line();
  line('In numbers');
  for (const t of d.tiles) line(`- ${t.label}: ${tileValueText(t, fmt)} (${tileChangeText(t, fmt)})`);
  line();
  line('What changed, in plain words');
  for (const s of d.summary ?? []) line(`- ${s}`);
  line();
  line(`Top pages, ${d.cur.text}`);
  if (d.topPages?.length)
    for (const r of d.topPages)
      line(
        `- ${r.page}: ${fmt.num(r.clicks)} clicks, shown ${fmt.num(r.impressions)} times, place ${placeCell(r.position, fmt) || 'none'}, change ${changeCell(r.change, fmt)}`
      );
  else line(`- ${d.searchError ?? 'No page rows for this month.'}`);
  line();
  line(`Top searches, ${d.cur.text}`);
  if (d.topSearches?.length) {
    for (const r of d.topSearches)
      line(
        `- ${r.query}: shown ${fmt.num(r.impressions)} times, ${fmt.num(r.clicks)} clicks, place ${placeCell(r.position, fmt) || 'none'}, change ${changeCell(r.change, fmt)}`
      );
    line(d.topSearchesNote);
  } else line(`- ${d.searchError ?? 'No searches for this month.'}`);
  line();
  line('Target keywords');
  if (d.targets?.available) {
    line(`${d.targets.improved} improved, ${d.targets.held} held, ${d.targets.slipped} slipped. ${d.targets.note}`);
    for (const r of d.targets.rows)
      line(
        `- ${r.keyword} (${r.page ?? 'no page'}): ${placeCell(r.prevPosition, fmt)} to ${placeCell(r.position, fmt)}, ${fmt.change(r.change, 'positions')}, shown ${fmt.num(r.impressions)} times`
      );
  } else line(d.targets?.note ?? '');
  line();
  line('What was done in the month');
  line(
    `- Posts published: ${d.done.posts.length ? d.done.posts.map((p) => `${p.page} (${p.dateText})`).join(', ') : 'none'}`
  );
  line(
    `- Deliberate page edits: ${d.done.edits.length ? d.done.edits.map((e) => `${e.page} (${e.dateText})`).join(', ') : 'none'}`
  );
  line(
    `- Verdicts read: ${d.done.verdicts.length ? d.done.verdicts.map((v) => `${v.pages.join(' and ')}, changed ${v.changeDateText}: ${v.reads}`).join('; ') : 'none'}${d.done.verdictsUnreadable ? ` (${d.done.verdictsUnreadable} more could not be read)` : ''}`
  );
  line(`- ${d.done.auditText}`);
  line();
  line('Other sources');
  const o = d.other;
  line(
    `- Bing: ${o.bing ? `${fmt.num(o.bing.clicks)} clicks, shown ${fmt.num(o.bing.impressions)} times` : o.bingText}`
  );
  line(
    `- GA4 visits: ${o.ga4 ? `${fmt.num(o.ga4.total)} in all; ${o.ga4.channels.map((c) => `${c.channel} ${fmt.num(c.sessions)}`).join(', ')}` : o.ga4Text}`
  );
  if (o.ai.length) for (const a of o.ai) line(`- AI citation check, ${a.dateText}: ${a.text}`);
  else line(`- ${o.aiText}`);
  line();
  for (const f of d.footer ?? []) line(f);
  return out.join('\n');
}

export async function render(el, ctx) {
  const { api, h, fmt, params } = ctx;
  const asked = String(params.get('m') ?? '').trim();
  const d = await api.get(`/api/month${asked ? `?m=${encodeURIComponent(asked)}` : ''}`);
  ctx.envelope(d);

  if (!d.month) {
    ctx.mount(
      el,
      h('h1', { class: 'page-title' }, 'Monthly report'),
      h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
    );
    return;
  }

  // ---------------------------------------------------------------- the picker and the buttons
  const picker = h(
    'select',
    {
      class: 'select',
      'aria-label': 'Month',
      onchange: (e) => ctx.navigate(`#/month?m=${encodeURIComponent(e.currentTarget.value)}`),
    },
    d.months.map((m) => h('option', { value: m.month }, m.label))
  );
  picker.value = d.month;
  const copyBtn = h(
    'button',
    {
      type: 'button',
      class: 'btn',
      onclick: async () => {
        const ok = await ctx.copyText(monthText(d, fmt));
        ctx.toast(
          ok ? 'Copied the report as plain text.' : 'Could not copy. Select the text and copy it by hand.',
          ok ? 'success' : 'error'
        );
      },
    },
    'Copy as text'
  );
  const tools = h(
    'div',
    { class: 'mr-tools row' },
    h('label', { class: 'mr-pick' }, h('span', { class: 'small muted' }, 'Month'), picker),
    h('button', { type: 'button', class: 'btn btn-primary', onclick: () => window.print() }, 'Save as PDF'),
    copyBtn,
    h('a', { class: 'btn', href: `/api/month.csv?m=${encodeURIComponent(d.month)}` }, 'Download CSV')
  );

  // ---------------------------------------------------------------- the pieces
  const section = (title, note, ...body) =>
    h(
      'section',
      { class: 'mr-section' },
      h('h2', { class: 'mr-h2' }, title),
      note ? h('p', { class: 'mr-note' }, note) : null,
      ...body
    );

  const tiles = h(
    'div',
    { class: 'tiles tiles-four' },
    d.tiles.map((t) => {
      const value = tileValueText(t, fmt);
      return h(
        'div',
        { class: 'tile', role: 'group', tabindex: 0, title: t.note, 'aria-label': `${t.label}: ${value}. ${t.note}` },
        h('span', { class: 'tile-label' }, t.label),
        h('span', { class: `tile-value${blank(t.value) ? ' is-text' : ''}` }, value),
        h('div', { class: `tile-change ${fmt.direction(t.change)}` }, tileChangeText(t, fmt)),
        h('div', { class: 'tile-change mr-tile-note' }, t.note)
      );
    })
  );

  const chartBox = h('div', {});
  twoLineChart(chartBox, {
    label: `Clicks and impressions from Google, each day of ${d.label}`,
    series: [
      { key: 'clicks', label: 'Clicks', points: d.series.map((p) => ({ date: p.date, value: p.clicks })) },
      {
        key: 'impressions',
        label: 'Impressions',
        points: d.series.map((p) => ({ date: p.date, value: p.impressions })),
      },
    ],
    markers: chartMarkers(d.markers),
  });

  const table = (head, rows, cells) =>
    h(
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
            head.map(([label, num]) => h('th', { scope: 'col', class: num ? 'num' : null }, label))
          )
        ),
        h(
          'tbody',
          {},
          rows.map((r) =>
            h(
              'tr',
              {},
              cells(r).map(([v, num]) => h('td', { class: num ? 'num' : 'cell-wrap' }, v))
            )
          )
        )
      )
    );

  const pagesBody = d.topPages?.length
    ? table(
        [['Page'], ['Clicks', true], ['Times shown', true], ['Average place', true], ['Change in times shown', true]],
        d.topPages,
        (r) => [
          [r.page],
          [fmt.num(r.clicks), true],
          [fmt.num(r.impressions), true],
          [placeCell(r.position, fmt), true],
          [changeCell(r.change, fmt), true],
        ]
      )
    : h('p', { class: 'empty' }, d.searchError ?? 'Google showed no page in this month.');

  const searchesBody = d.topSearches?.length
    ? table(
        [['Search'], ['Times shown', true], ['Clicks', true], ['Average place', true], ['Change in times shown', true]],
        d.topSearches,
        (r) => [
          [r.query],
          [fmt.num(r.impressions), true],
          [fmt.num(r.clicks), true],
          [placeCell(r.position, fmt), true],
          [changeCell(r.change, fmt), true],
        ]
      )
    : h('p', { class: 'empty' }, d.searchError ?? 'Google showed the site for no search in this month.');

  const t = d.targets;
  const targetsBody = t.available
    ? h(
        'div',
        {},
        h(
          'div',
          { class: 'mr-counts' },
          [
            ['Improved', t.improved],
            ['Held', t.held],
            ['Slipped', t.slipped],
            ['No data in one month', t.noData],
          ].map(([label, n]) =>
            h(
              'div',
              { class: 'mr-count' },
              h('strong', { class: 'num' }, fmt.num(n)),
              h('span', { class: 'small muted' }, label)
            )
          )
        ),
        t.rows.length
          ? table(
              [
                ['Keyword'],
                ['Page'],
                [`Place, ${d.label}`, true],
                [`Place, ${d.prev.label}`, true],
                ['Change', true],
                ['Times shown', true],
              ],
              t.rows,
              (r) => [
                [r.keyword],
                [r.page ?? ''],
                [placeCell(r.position, fmt), true],
                [placeCell(r.prevPosition, fmt), true],
                [fmt.change(r.change, 'positions'), true],
                [fmt.num(r.impressions), true],
              ]
            )
          : h('p', { class: 'empty' }, 'No target keyword had a place in both months.')
      )
    : h('p', { class: 'empty' }, t.note);

  const listOr = (items, empty) =>
    items.length
      ? h(
          'ul',
          { class: 'plain-list mr-list' },
          items.map((x) => h('li', {}, x))
        )
      : h('p', { class: 'muted' }, empty);
  const done = d.done;
  const doneBody = h(
    'div',
    { class: 'mr-done' },
    h('h3', { class: 'mr-h3' }, `Posts published (${done.posts.length})`),
    listOr(
      done.posts.map((p) => `${p.dateText}: ${p.page}`),
      'No post was published in this month.'
    ),
    done.postsNote ? h('p', { class: 'mr-note' }, done.postsNote) : null,
    h('h3', { class: 'mr-h3' }, `Deliberate page edits (${done.edits.length})`),
    listOr(
      done.edits.map((e) => `${e.dateText}: ${e.page}`),
      'No deliberate page edit is on record for this month.'
    ),
    done.editsNote ? h('p', { class: 'mr-note' }, done.editsNote) : null,
    h('h3', { class: 'mr-h3' }, `Verdicts read in the month (${done.verdicts.length})`),
    listOr(
      done.verdicts.map((v) => `${v.reads}: the ${v.changeDateText} change to ${v.pages.join(' and ')}`),
      'No verdict could be read in this month.'
    ),
    done.verdictsUnreadable
      ? h(
          'p',
          { class: 'mr-note' },
          `${fmt.plural(done.verdictsUnreadable, 'more change was', 'more changes were')} due but cannot be read, because other edits landed in the same weeks.`
        )
      : null,
    h('h3', { class: 'mr-h3' }, 'Technical audit'),
    h('p', {}, done.auditText)
  );

  const o = d.other;
  const otherBody = h(
    'ul',
    { class: 'plain-list mr-list' },
    h(
      'li',
      {},
      h('strong', {}, 'Bing: '),
      o.bing
        ? `${fmt.plural(o.bing.clicks, 'click', 'clicks')}, shown ${fmt.num(o.bing.impressions)} times${blank(o.bing.change) ? '' : ` (times shown ${fmt.change(o.bing.change, 'percent')} ${o.bing.against})`}.`
        : o.bingText
    ),
    h(
      'li',
      {},
      h('strong', {}, 'Visits (GA4): '),
      o.ga4
        ? `${fmt.num(o.ga4.total)} in all: ${o.ga4.channels.map((c) => `${c.channel} ${fmt.num(c.sessions)}`).join(', ')}.`
        : o.ga4Text
    ),
    ...(o.ai.length
      ? o.ai.map((a) => h('li', {}, h('strong', {}, `AI citation check, ${a.dateText}: `), a.text))
      : [h('li', {}, h('strong', {}, 'AI citation check: '), o.aiText)])
  );

  ctx.mount(
    el,
    tools,
    d.pickNote ? h('p', { class: 'banner banner-warn' }, d.pickNote) : null,
    d.searchError
      ? h(
          'p',
          { class: 'banner banner-bad', role: 'alert' },
          d.searchError,
          ' ',
          h('button', { type: 'button', class: 'btn btn-small', onclick: () => ctx.reload() }, 'Try again')
        )
      : null,
    d.warnings?.length ? h('p', { class: 'banner banner-warn' }, d.warnings.join(' ')) : null,
    h(
      'article',
      { class: 'mr-sheet' },
      h(
        'header',
        { class: 'mr-head' },
        h('h1', { class: 'page-title mr-h1' }, d.label),
        h('p', { class: 'mr-sub' }, `${d.cur.text}. ${d.compareText}`),
        h('p', { class: 'mr-sub' }, d.standingLine)
      ),
      section('In numbers', null, tiles),
      section(
        'Clicks and impressions, each day',
        'Clicks on the left scale, impressions on the right. Dots on the bottom line are page edits; dashed lines are Google updates.',
        chartBox
      ),
      section(
        'What changed, in plain words',
        'Built from the numbers on this page. They say what moved, not why.',
        h(
          'ul',
          { class: 'mr-list mr-summary' },
          (d.summary ?? []).map((s) => h('li', {}, s))
        )
      ),
      section(d.topPages?.length ? `Top ${d.topPages.length} pages` : 'Top pages', d.topPagesNote, pagesBody),
      section(
        d.topSearches?.length ? `Top ${d.topSearches.length} searches` : 'Top searches',
        d.topSearchesNote,
        searchesBody
      ),
      section('Target keywords', t.available ? t.note : null, targetsBody),
      section('What was done in the month', "From the desk's own records.", doneBody),
      section(
        'Other sources',
        'Each source is shown only when the desk holds its numbers for the whole month.',
        otherBody
      ),
      h(
        'footer',
        { class: 'mr-foot' },
        (d.footer ?? []).map((f) => h('p', {}, f))
      )
    )
  );
}
