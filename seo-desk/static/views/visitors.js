// Visitors: what do people do once they arrive?
//
// Visits by channel, top landing pages and interest signals (never sales), then what Clarity
// saw: angry clicks, dead clicks, quick backs, scroll depth and page errors.

import { lineChart } from '../chart.js';
import { dataTable } from './table.js';
import { tile } from './jobs.js';

const CSS = `
.vs-signals { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.vs-signal { border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; }
.vs-signal b { display: block; font-size: 28px; line-height: 1.15; font-variant-numeric: tabular-nums; }
.vs-clarity { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px 36px; margin-top: 16px; }
.vs-clarity h3 { font-size: 16px; margin-bottom: 2px; }
.vs-clarity .vs-hint { color: var(--muted); font-size: 13px; margin-bottom: 8px; }
.vs-line { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--line); font-size: 14px; }
.vs-line > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.vs-line > span:last-child { font-variant-numeric: tabular-nums; white-space: nowrap; }
.vs-none { padding: 10px 0; color: var(--muted); font-size: 14px; border-top: 1px solid var(--line); }
.vs-chart { margin-top: 18px; }
`;

const MIN_VISITS = 20;
const CLARITY_URL = 'https://clarity.microsoft.com/';

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const data = await api.get('/api/visitors');
  ctx.envelope(data);

  const ch = data.channels;
  const rows = ch.rows ?? [];
  const top = rows[0] ?? null;
  // The server sends the change, null under the minimum base.
  const totalChange = ch.change ?? null;
  const enough = ch.total >= MIN_VISITS;

  const headline = top
    ? `${fmt.plural(ch.total, 'visit', 'visits')} came to the site from ${fmt.range(ch.range)}. The most came from ${top.channel}${enough ? `, ${fmt.share(top.share)} of all visits` : ''}.${enough ? '' : ` There are too few visits to say which channel leads (${fmt.NOT_ENOUGH}).`}`
    : `No visits were recorded from ${fmt.range(ch.range)}.`;

  ctx.mount(
    el,
    h('style', {}, CSS),
    h(
      'div',
      { class: 'page-head' },
      h('div', {}, h('h1', { class: 'page-title' }, 'Visitors'), h('p', { class: 'page-sub' }, headline))
    ),
    data.empty
      ? h(
          'p',
          { class: 'banner banner-warn' },
          'No data has been pulled yet. Press Refresh now at the top of the page.'
        )
      : null,
    h(
      'div',
      { class: 'stack' },
      h('p', { class: 'banner banner-accent' }, h('strong', {}, 'Not sales. '), data.standingLine),
      h('p', { class: 'banner' }, data.internalTrafficNote)
    ),
    h(
      'section',
      { class: 'section', style: { marginTop: '28px' }, 'aria-label': 'Visitors in numbers' },
      h(
        'div',
        { class: 'tiles' },
        tile(
          h,
          'Visits',
          fmt.num(ch.total),
          totalChange === null
            ? `${fmt.NOT_ENOUGH} for a comparison`
            : `${fmt.change(totalChange, 'percent')} on the 28 days before`,
          { dir: fmt.direction(totalChange) }
        ),
        tile(
          h,
          'Biggest channel',
          top ? top.channel : 'none yet',
          top ? (enough ? `${fmt.share(top.share)} of visits` : fmt.NOT_ENOUGH) : '',
          {
            text: true,
          }
        ),
        ...(data.interestSignals.length
          ? data.interestSignals.map((x) => tile(h, x.label, fmt.num(x.count), 'interest signal, not a sale'))
          : [tile(h, 'Interest signals', fmt.num(0), 'none recorded, and not sales either way')])
      )
    ),
    channelSection(data, ctx),
    breakdownSection(data, ctx),
    landingSection(data, ctx),
    signalSection(data, ctx),
    outcomeSection(data, ctx),
    claritySection(data, ctx)
  );
}

function changeSentence(fmt, row) {
  if (row.change !== null && row.change !== undefined)
    return `${fmt.change(row.change, 'percent')} on the 28 days before`;
  if (row.prevSessions === 0 && row.sessions > 0) return 'new, none in the 28 days before';
  return `${fmt.NOT_ENOUGH} to compare with the 28 days before`;
}

function changeText(fmt, row, prev, cur) {
  if (row.change !== null && row.change !== undefined) return fmt.change(row.change, 'percent');
  if (prev === 0 && cur > 0) return 'new';
  return fmt.NOT_ENOUGH;
}

// ------------------------------------------------------------------ channels

function channelSection(data, ctx) {
  const { h, fmt } = ctx;
  const ch = data.channels;
  const enough = ch.total >= MIN_VISITS;
  const box = h('div', { class: 'vs-chart' });
  lineChart(box, { series: ch.series.map((d) => ({ date: d.date, value: d.total })), label: 'Visits per day' });
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Where visits came from'),
      h(
        'span',
        { class: 'section-note' },
        `${fmt.range(ch.range)}. The line below shows every day since the desk started keeping it.`
      )
    ),
    ch.rows.length
      ? h(
          'ul',
          { class: 'share-list', style: { marginTop: '0' } },
          ch.rows.map((r) =>
            h(
              'li',
              {},
              h(
                'div',
                { class: 'share-head' },
                h('span', { class: 'page-path' }, r.channel),
                h(
                  'span',
                  { class: 'num muted' },
                  h('strong', { style: { color: 'var(--ink)' } }, fmt.plural(r.sessions, 'visit', 'visits')),
                  `  ${enough ? `${fmt.share(r.share)}, ` : ''}${changeSentence(fmt, r)}`
                )
              ),
              enough
                ? h('div', { class: 'bar' }, h('span', { style: { width: `${Math.round(r.share * 100)}%` } }))
                : null
            )
          )
        )
      : h('p', { class: 'empty' }, 'No visits were recorded in this period.'),
    box
  );
}

// ------------------------------------------------------------------ source, country, device

export const WAITING = 'This fills in after the next refresh.';
const BREAKDOWN_SHOWN = 8;

// How a breakdown panel reads: 'waiting' before the first pull that has it, 'none' with no
// visits, else 'ok' with `enough` true when the total clears the minimum for shares and bars.
export function breakdownState(b, min = MIN_VISITS) {
  if (!b || b.available === false) return { state: 'waiting', enough: false };
  if (!b.rows?.length || !b.total) return { state: 'none', enough: false };
  return { state: 'ok', enough: b.total >= min };
}

function breakdownPanel(ctx, title, hint, b) {
  const { h, fmt } = ctx;
  const { state, enough } = breakdownState(b);
  const box = h('div', {});
  let all = false;
  const draw = () => {
    if (state === 'waiting') return box.replaceChildren(h('div', { class: 'vs-none' }, WAITING));
    if (state === 'none')
      return box.replaceChildren(h('div', { class: 'vs-none' }, 'No visits were recorded in this period.'));
    const rows = all ? b.rows : b.rows.slice(0, BREAKDOWN_SHOWN);
    box.replaceChildren();
    ctx.mount(
      box,
      h(
        'ul',
        { class: 'share-list' },
        rows.map((r) =>
          h(
            'li',
            {},
            h(
              'div',
              { class: 'share-head' },
              h('span', { class: 'page-path' }, r.label ?? r.name),
              h(
                'span',
                { class: 'num muted' },
                h('strong', { style: { color: 'var(--ink)' } }, fmt.plural(r.sessions, 'visit', 'visits')),
                `  ${enough && r.share !== null && r.share !== undefined ? `${fmt.share(r.share)}, ` : ''}${changeText(fmt, r, r.prevSessions, r.sessions)}`
              )
            ),
            enough && typeof r.share === 'number'
              ? h('div', { class: 'bar' }, h('span', { style: { width: `${Math.round(r.share * 100)}%` } }))
              : null
          )
        )
      ),
      enough ? null : h('p', { class: 'small muted' }, `Too few visits for shares (${fmt.NOT_ENOUGH}).`),
      b.rows.length > BREAKDOWN_SHOWN
        ? h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small btn-quiet',
              style: { marginTop: '6px' },
              onclick: () => {
                all = !all;
                draw();
              },
            },
            all ? 'Show fewer' : `Show all ${b.rows.length}`
          )
        : null
    );
  };
  draw();
  return h('div', {}, h('h3', {}, title), h('p', { class: 'vs-hint' }, hint), box);
}

function breakdownSection(data, ctx) {
  const { h, fmt } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Sources, countries and devices'),
      h(
        'span',
        { class: 'section-note' },
        `${fmt.range(data.channels.range)}. The change compares with the 28 days before, and needs 20 earlier visits.`
      )
    ),
    h(
      'div',
      { class: 'p2-breakdowns' },
      breakdownPanel(
        ctx,
        'Where visits came from, by source',
        'The site or service that sent each visit.',
        data.sourceMedium
      ),
      breakdownPanel(ctx, 'Countries', 'Where visitors were when they came.', data.countries),
      breakdownPanel(ctx, 'Devices', 'Phone, computer or tablet.', data.devices)
    )
  );
}

// ------------------------------------------------------------------ interest by landing page

function outcomeSection(data, ctx) {
  const { h, fmt } = ctx;
  const o = data.outcomes ?? { available: false, rows: [] };
  const min = o.minSessions ?? 30;
  const head = h(
    'div',
    { class: 'section-head' },
    h('h2', { class: 'section-title' }, 'Interest by landing page'),
    h('span', { class: 'section-note' }, 'Interest signals, not sales.')
  );
  if (!o.available) {
    return h('section', { class: 'section' }, head, h('p', { class: 'empty' }, WAITING));
  }
  const box = h('div', {});
  dataTable(box, {
    label: 'Interest by landing page',
    searchKeys: ['page'],
    sort: { key: 'events', dir: 'desc' },
    pageSize: 15,
    emptyText: 'Nobody used a form, the calculator or the template after landing in this period.',
    rows: o.rows.map((r) => ({ ...r, counts: r.sessions >= min, live: r.links?.live ?? null })),
    columns: [
      { key: 'page', label: 'Page people landed on', wrap: true },
      {
        key: 'events',
        label: 'Uses',
        align: 'right',
        title: 'Times a visitor used a form, the calculator or the template after landing here',
        format: (v) => fmt.num(v),
      },
      { key: 'sessions', label: 'Visits', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'counts',
        label: 'Counts in the ranking',
        sortable: false,
        format: (v) =>
          v
            ? h('span', { class: 'chip chip-accent' }, 'Yes')
            : h('span', { class: 'muted small' }, `needs ${min} visits`),
      },
      {
        key: 'live',
        label: 'Link',
        sortable: false,
        format: (v) =>
          v && /^https:\/\//.test(v) ? h('a', { href: v, target: '_blank', rel: 'noopener' }, 'Open') : '',
      },
    ],
  });
  return h(
    'section',
    { class: 'section' },
    head,
    h('p', { class: 'banner banner-accent', style: { marginBottom: '12px' } }, h('strong', {}, 'Not sales. '), o.note),
    box
  );
}

// ------------------------------------------------------------------ landing pages

function landingSection(data, ctx) {
  const { h, fmt } = ctx;
  const box = h('div', {});
  dataTable(box, {
    label: 'Pages people landed on',
    searchKeys: ['page'],
    sort: { key: 'sessions', dir: 'desc' },
    pageSize: 15,
    emptyText: 'No landing pages were recorded in this period.',
    rows: data.landing.map((r) => ({
      ...r,
      rate: r.sessions >= 20 ? r.engagementRate : null,
      live: r.links?.live ?? null,
    })),
    columns: [
      { key: 'page', label: 'Page', wrap: true },
      { key: 'sessions', label: 'Visits', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'prevSessions',
        label: 'Before',
        align: 'right',
        title: 'Visits in the 28 days before',
        format: (v) => fmt.num(v),
      },
      {
        key: 'change',
        label: 'Change',
        align: 'right',
        format: (v, r) =>
          h(
            'span',
            { class: `tile-change ${fmt.direction(v)}`.trim(), style: { margin: 0 } },
            changeText(fmt, r, r.prevSessions, r.sessions)
          ),
      },
      {
        key: 'rate',
        label: 'Stayed and read',
        align: 'right',
        title: 'Share of visits that lasted over 10 seconds, viewed two pages or did something that counts',
        format: (v) => (v === null ? h('span', { class: 'muted' }, fmt.NOT_ENOUGH) : fmt.share(v)),
      },
      {
        key: 'live',
        label: 'Link',
        sortable: false,
        format: (v) =>
          v && /^https:\/\//.test(v) ? h('a', { href: v, target: '_blank', rel: 'noopener' }, 'Open') : '',
      },
    ],
  });
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Pages people landed on'),
      h(
        'span',
        { class: 'section-note' },
        `${fmt.range(data.channels.range)}. A share of visits is shown only for pages with 20 visits or more.`
      )
    ),
    box
  );
}

// ------------------------------------------------------------------ interest signals

function signalSection(data, ctx) {
  const { h, fmt } = ctx;
  const items = data.interestSignals;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Interest signals'),
      h(
        'span',
        { class: 'section-note' },
        `${fmt.range(data.channels.range)}. A signal means someone showed interest. It is not a sale.`
      )
    ),
    items.length
      ? h(
          'div',
          { class: 'vs-signals' },
          items.map((s) =>
            h(
              'div',
              { class: 'vs-signal' },
              h('span', { class: 'tile-label' }, s.label),
              h('b', {}, fmt.num(s.count)),
              h('div', { class: 'small muted' }, `${fmt.num(s.prevCount)} in the 28 days before`),
              s.name === 'form_start'
                ? h(
                    'div',
                    { class: 'small muted', style: { marginTop: '4px' } },
                    'People who started filling in a form, not people who sent one.'
                  )
                : null
            )
          )
        )
      : h('p', { class: 'empty' }, 'No interest signals were recorded in this period.')
  );
}

// ------------------------------------------------------------------ Clarity

function claritySection(data, ctx) {
  const { h, fmt } = ctx;
  const c = data.clarity;
  const link = h(
    'a',
    { class: 'btn btn-small', href: CLARITY_URL, target: '_blank', rel: 'noopener' },
    'Open recordings in Clarity'
  );
  const head = h('div', { class: 'section-head' }, h('h2', { class: 'section-title' }, 'What Clarity saw'), link);
  if (!c.available) {
    return h(
      'section',
      { class: 'section' },
      head,
      h(
        'p',
        { class: 'empty' },
        `${c.note} Press Refresh now at the top of the page to pull it. You can watch recordings in Clarity meanwhile.`
      )
    );
  }

  const none =
    c.daysCovered <= 1 ? 'Nothing recorded for this day' : `Nothing recorded for these ${c.daysCovered} days`;
  const pageLine = (page, right) => h('div', { class: 'vs-line' }, h('span', {}, page), h('span', {}, right));
  const list = (title, hint, rows, make) =>
    h(
      'div',
      {},
      h('h3', {}, title),
      h('p', { class: 'vs-hint' }, hint),
      rows.length ? rows.slice(0, 8).map(make) : h('div', { class: 'vs-none' }, none)
    );

  return h(
    'section',
    { class: 'section' },
    head,
    h(
      'p',
      { class: 'section-note' },
      c.daysCovered > 1
        ? `${fmt.plural(c.sessions, 'visit', 'visits')} recorded over ${c.daysCovered} days, ${fmt.date(c.firstDay)} to ${fmt.date(c.lastDay)}. `
        : `${fmt.plural(c.sessions, 'visit', 'visits')} recorded on ${fmt.date(c.lastDay)}. `,
      c.note
    ),
    h(
      'div',
      { class: 'vs-clarity' },
      list('Rage clicks', 'People clicked the same spot many times, fast. Often something is stuck.', c.rage, (r) =>
        pageLine(r.page, fmt.plural(r.count, 'time', 'times'))
      ),
      list('Dead clicks', 'People clicked on something that did nothing.', c.dead, (r) =>
        pageLine(r.page, fmt.plural(r.count, 'time', 'times'))
      ),
      list('Quick backs', 'People left the page almost at once and went back.', c.quickBack, (r) =>
        pageLine(r.page, fmt.plural(r.count, 'time', 'times'))
      ),
      list('How far people scroll', 'The average share of the page people reached, shortest first.', c.scroll, (r) =>
        pageLine(r.page, `${Math.round(r.depth)}% of the page`)
      ),
      list('Page errors', 'Something broke in the visitor’s browser.', c.jsErrors, (r) =>
        pageLine(r.message, fmt.plural(r.count, 'time', 'times'))
      )
    )
  );
}
