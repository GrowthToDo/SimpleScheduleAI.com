// Competitors: did a competitor move?
//
// New and removed pages on their sitemaps, changes to the pages we watch (each with Seen and
// Add to this week), Bing's count of links to us, and the button that checks them all now.

import { lineChart } from '../chart.js';
import { jobBlock, tile, daysText } from './jobs.js';

const CSS = `
.cp-change { border: 1px solid var(--line); border-radius: var(--radius); padding: 16px 18px; }
.cp-change.is-seen { background: var(--wash); }
.cp-change h3 { font-size: 17px; overflow-wrap: anywhere; }
.cp-pages { margin: 4px 0 0; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
.cp-lines { margin: 10px 0 0; padding-left: 18px; font-size: 14px; }
.cp-lines li { overflow-wrap: anywhere; }
.cp-lines li + li { margin-top: 3px; }
.cp-group + .cp-group { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }
.cp-sitemaps details { margin-top: 6px; }
.cp-sitemaps summary { cursor: pointer; font-size: 13px; color: var(--accent); }
.cp-urls { margin: 6px 0 0; padding-left: 18px; font-size: 13px; overflow-wrap: anywhere; }
.cp-chart { margin-top: 12px; }
`;

const shortUrl = (u) =>
  String(u)
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const [data, jobs] = await Promise.all([api.get('/api/competitors'), api.get('/api/jobs')]);
  ctx.envelope(data);

  const check = jobBlock(ctx, jobs, 'competitors', {
    label: 'Check competitors now',
    primary: true,
    confirm: {
      title: 'Check the competitors now?',
      body:
        'This visits the competitors’ public sitemaps and the pages we watch, and compares them with the last check.\n\n' +
        `It writes new snapshot files into ${data.check.writes.join(' and ')}, which are tracked in git, so they will show up as changes to commit.\n\n` +
        'It takes a little while and costs nothing.',
      confirmLabel: 'Check now',
    },
  });

  const groups = groupWatch(data.watch);
  const unseen = groups.filter((g) => !g.seen);
  const added = data.sitemap.reduce((s, x) => s + x.addedCount, 0);
  const stale = data.stale;

  const headline = data.lastRun
    ? `Competitors were last checked on ${data.lastRunText} (${daysText(data.daysSinceCheck)}).${stale ? ' That is more than a week ago.' : ''}`
    : 'The desk has never checked competitors. Press Check competitors now.';
  const second = data.lastRun
    ? unseen.length || added
      ? `${fmt.plural(unseen.length, 'competitor has', 'competitors have')} changes you have not marked as seen, and ${fmt.plural(added, 'new page has', 'new pages have')} appeared on their sitemaps.`
      : 'Nothing has changed that you have not already seen.'
    : '';

  ctx.mount(
    el,
    h('style', {}, CSS),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'Competitors'),
        h('p', { class: 'page-sub' }, headline),
        second ? h('p', { class: 'page-sub', style: { marginTop: '2px' } }, second) : null
      ),
      h('div', { class: 'row' }, check.button)
    ),
    check.panel,
    stale
      ? h(
          'p',
          { class: 'banner banner-warn', style: { marginTop: '16px' } },
          data.lastRun
            ? `It has been ${data.daysSinceCheck} days since the last check, so what you see may be out of date. Press Check competitors now.`
            : 'No check has been recorded yet.'
        )
      : null,
    data.empty
      ? h(
          'p',
          { class: 'banner banner-warn' },
          'No data has been pulled yet. Press Refresh now at the top of the page.'
        )
      : null,
    h(
      'section',
      { class: 'section', style: { marginTop: '24px' }, 'aria-label': 'Competitors in numbers' },
      h(
        'div',
        { class: 'tiles' },
        tile(
          h,
          'Days since last check',
          data.daysSinceCheck === null ? 'never' : fmt.num(data.daysSinceCheck),
          stale ? 'over a week, check again' : 'within a week',
          { warn: stale }
        ),
        tile(h, 'Changes not seen yet', fmt.num(unseen.length), 'competitors with a changed page'),
        tile(h, 'New competitor pages', fmt.num(added), 'on the watched sitemaps'),
        tile(
          h,
          'Pages linking to us',
          data.linksPulse?.total === null || !data.linksPulse ? fmt.NOT_ENOUGH : fmt.num(data.linksPulse.total),
          "Bing's count"
        )
      )
    ),
    changesSection(groups, data, ctx),
    sitemapSection(data, ctx),
    linksSection(data, ctx),
    h('p', { class: 'banner banner-accent', style: { marginTop: '32px' } }, data.reminder)
  );

  check.resume();
}

// One card per competitor: the API keys "Seen" by competitor, so every page of one competitor
// shares the same id. Pages with the same list of changes are shown as one entry.
function groupWatch(watch) {
  const byId = new Map();
  for (const w of watch) {
    const g = byId.get(w.id) ?? {
      id: w.id,
      host: w.host,
      fetchedText: w.fetchedText,
      seen: w.seen,
      state: w.state,
      entries: new Map(),
    };
    const name = w.url ? shortUrl(w.url) : w.pricing ? `${w.host} pricing page` : `${w.host} watched page`;
    const key = w.changes.join('\n');
    const e = g.entries.get(key) ?? { pages: [], changes: w.changes };
    e.pages.push(name);
    g.entries.set(key, e);
    byId.set(w.id, g);
  }
  return [...byId.values()]
    .map((g) => ({ ...g, entries: [...g.entries.values()] }))
    .sort((a, b) => Number(a.seen) - Number(b.seen) || a.host.localeCompare(b.host));
}

// ------------------------------------------------------------------ changes on watched pages

function changesSection(groups, data, ctx) {
  const { h, api } = ctx;

  const markSeen = async (g, action) => {
    try {
      await api.post(`/api/item/${encodeURIComponent(g.id)}`, { action });
      ctx.toast(action === 'done' ? `Marked ${g.host} as seen.` : `${g.host} is back in the unseen list.`, 'success');
      await ctx.reload();
    } catch (e) {
      ctx.toast(e.message, 'error');
    }
  };

  const addToWeek = async (g, anchor) => {
    let week;
    try {
      week = await api.get('/api/week');
    } catch (e) {
      ctx.toast(e.message, 'error');
      return;
    }
    if (week.locked) {
      ctx.toast("This week's plan is locked. Unlock it on This week to change the five.", 'error');
      return;
    }
    const ids = week.top5.map((c) => c.id);
    if (ids.includes(g.id)) {
      ctx.toast("It is already in this week's five.");
      return;
    }
    const save = async (next, message) => {
      try {
        await api.post('/api/week/top5', { ids: next });
        ctx.toast(message, 'success');
      } catch (e) {
        ctx.toast(e.message, 'error');
      }
    };
    if (ids.length < 5) return save([...ids, g.id], `Added to this week: ${g.host} changed a page.`);
    ctx.menu(
      anchor,
      week.top5.map((c, i) => ({
        label: `Replace ${i + 1}: ${c.title.length > 48 ? `${c.title.slice(0, 46)}...` : c.title}`,
        onSelect: () =>
          save(
            ids.map((x, j) => (j === i ? g.id : x)),
            `Swapped in: ${g.host} changed a page.`
          ),
      }))
    );
  };

  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Changes on pages we watch'),
      h('span', { class: 'section-note' }, 'Title, price and call to action changes. Unseen ones first.')
    ),
    groups.length
      ? h(
          'div',
          { class: 'stack' },
          groups.map((g) =>
            h(
              'div',
              { class: `cp-change${g.seen ? ' is-seen' : ''}` },
              h(
                'div',
                { class: 'row', style: { justifyContent: 'space-between', alignItems: 'flex-start' } },
                h(
                  'div',
                  {},
                  h('h3', {}, g.host),
                  h('div', { class: 'muted small' }, `Found at the check on ${g.fetchedText}.`)
                ),
                g.seen
                  ? h('span', { class: 'chip chip-accent' }, 'Seen')
                  : h('span', { class: 'chip chip-warn' }, 'Not seen yet')
              ),
              g.entries.map((e) =>
                h(
                  'div',
                  { class: 'cp-group' },
                  h(
                    'p',
                    { class: 'cp-pages' },
                    e.pages.length > 1 ? `Pages: ${e.pages.join(', ')}` : `Page: ${e.pages[0]}`
                  ),
                  h(
                    'ul',
                    { class: 'cp-lines' },
                    e.changes.map((c) => h('li', {}, c))
                  )
                )
              ),
              h(
                'div',
                { class: 'row', style: { marginTop: '14px' } },
                g.seen
                  ? h(
                      'button',
                      { type: 'button', class: 'btn btn-small btn-quiet', onclick: () => markSeen(g, 'reopen') },
                      'Mark as not seen'
                    )
                  : [
                      h(
                        'button',
                        { type: 'button', class: 'btn btn-small', onclick: () => markSeen(g, 'done') },
                        'Seen'
                      ),
                      h(
                        'button',
                        { type: 'button', class: 'btn btn-small', onclick: (e) => addToWeek(g, e.currentTarget) },
                        'Add to this week'
                      ),
                    ]
              )
            )
          )
        )
      : h('p', { class: 'empty' }, 'No watched page has changed at the last check.')
  );
}

// ------------------------------------------------------------------ sitemaps

function sitemapSection(data, ctx) {
  const { h } = ctx;
  const list = (urls, count) => [
    ...urls.map((u) => h('li', {}, shortUrl(u))),
    count > urls.length ? h('li', { class: 'muted' }, `and ${count - urls.length} more`) : null,
  ];
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'New and removed pages on competitor sitemaps'),
      h('span', { class: 'section-note' }, 'A new page often means a new blog post or a new product page.')
    ),
    data.sitemap.length
      ? h(
          'ul',
          { class: 'side-list cp-sitemaps' },
          data.sitemap.map((s) =>
            h(
              'li',
              {},
              h(
                'div',
                { class: 'row', style: { justifyContent: 'space-between' } },
                h('strong', {}, s.host),
                s.status === 'unreachable'
                  ? h('span', { class: 'chip chip-warn' }, 'Could not be reached')
                  : h(
                      'span',
                      { class: 'row' },
                      h('span', { class: `chip${s.addedCount ? ' chip-accent' : ''}` }, `${s.addedCount} new`),
                      h('span', { class: 'chip' }, `${s.removedCount} removed`)
                    )
              ),
              h('div', { class: 'small muted' }, `Checked ${s.fetchedText}.`),
              s.addedCount
                ? h(
                    'details',
                    {},
                    h('summary', {}, `Show the ${s.addedCount} new ${s.addedCount === 1 ? 'page' : 'pages'}`),
                    h('ul', { class: 'cp-urls' }, list(s.added, s.addedCount))
                  )
                : null,
              s.removedCount
                ? h(
                    'details',
                    {},
                    h('summary', {}, `Show the ${s.removedCount} removed ${s.removedCount === 1 ? 'page' : 'pages'}`),
                    h('ul', { class: 'cp-urls' }, list(s.removed, s.removedCount))
                  )
                : null
            )
          )
        )
      : h('p', { class: 'empty' }, 'No sitemap has been compared yet. Press Check competitors now.')
  );
}

// ------------------------------------------------------------------ links pulse

function linksSection(data, ctx) {
  const { h, fmt } = ctx;
  const lp = data.linksPulse;
  const box = h('div', { class: 'cp-chart' });
  if (lp)
    lineChart(box, {
      series: lp.history.map((p) => ({ date: p.date, value: p.total })),
      label: 'Pages linking to our site, by day',
    });
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Links pointing at us'),
      h('span', { class: 'section-note' }, lp?.note ?? '')
    ),
    lp
      ? h(
          'div',
          {},
          h(
            'p',
            {},
            `Bing counts ${fmt.plural(lp.total ?? 0, 'page', 'pages')} linking to the site. The line fills in as the desk keeps each day.`
          ),
          box
        )
      : h('p', { class: 'empty' }, 'Bing has not been pulled yet.')
  );
}
