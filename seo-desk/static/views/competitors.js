// Competitors: did a competitor move?
//
// What each watched competitor really changed (distinct events, not one line per page; pricing
// sentinels set apart; each competitor with Seen, Open their page and Add to this week), new and
// removed pages on their sitemaps, Bing's count of links to us, and the button that checks them all now.

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
.cp-summary { margin: 10px 0 0; font-size: 14px; }
.cp-event-on { color: var(--muted); font-size: 13px; }
.cp-event.is-material { font-weight: 600; }
.cp-event.is-material .cp-event-on { font-weight: 400; }
.cp-sentinel { margin: 10px 0 0; font-size: 14px; color: var(--muted); }
.cp-sentinel.is-live { color: var(--ink); font-weight: 600; }
.cp-note { margin: 8px 0 0; font-size: 13px; color: var(--muted); }
.cp-quiet li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 12px; }
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

  const hosts = data.hosts;
  const unseen = hosts.filter((g) => g.worry);
  const added = data.sitemap.reduce((s, x) => s + x.addedCount, 0);
  const stale = data.stale;

  const headline = data.lastRun
    ? `Competitors were last checked on ${data.lastRunText} (${daysText(data.daysSinceCheck)}).${stale ? ' That is more than a week ago.' : ''}`
    : 'The desk has never checked competitors. Press Check competitors now.';
  const second = data.lastRun
    ? unseen.length || added
      ? `${
          unseen.length
            ? `${fmt.plural(unseen.length, 'competitor has', 'competitors have')} a change worth reading that you have not marked as seen`
            : 'No competitor has a change you still need to read'
        }, and ${fmt.plural(added, 'new page has', 'new pages have')} appeared on their sitemaps.`
      : 'Nothing needs reading right now. Small changes and lists are shown below, but they are not worries.'
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
        tile(h, 'Changes worth reading', fmt.num(unseen.length), 'competitors you have not marked as seen'),
        tile(h, 'New competitor pages', fmt.num(added), 'on the watched sitemaps'),
        tile(
          h,
          'Pages linking to us',
          data.linksPulse?.total === null || !data.linksPulse ? fmt.NOT_ENOUGH : fmt.num(data.linksPulse.total),
          "Bing's count"
        )
      )
    ),
    changesSection(hosts, data, ctx),
    sitemapSection(data, ctx),
    linksSection(data, ctx),
    h('p', { class: 'banner banner-accent', style: { marginTop: '32px' } }, data.reminder)
  );

  check.resume();
}

// ------------------------------------------------------------------ changes on watched pages

const MAX_EVENTS = 6;

// A change on watched pages, as one line: what happened, and where it showed.
function eventItem(h, e) {
  const names = e.pageNames ?? [];
  const where = e.pages.length > 1 && names.length <= 5 ? `${e.onText}: ${names.join(', ')}` : e.onText;
  return h(
    'li',
    { class: `cp-event${e.material ? ' is-material' : ''}` },
    // A worth-reading line already says where it happened.
    e.material ? e.line : [e.plain, ' ', h('span', { class: 'cp-event-on' }, where)]
  );
}

function changesSection(hosts, data, ctx) {
  const { h, api, fmt } = ctx;
  const changed = hosts.filter((g) => g.events.length || g.sentinels.length);
  const quiet = hosts.filter((g) => !g.events.length && !g.sentinels.length);

  const markSeen = async (g, action) => {
    try {
      await api.post(`/api/item/${encodeURIComponent(g.itemId)}`, { action });
      ctx.toast(
        action === 'done' ? `Marked ${g.host} as seen.` : `${g.host} is back in the list of changes worth reading.`,
        'success'
      );
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
    if (ids.includes(g.itemId)) {
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
    if (ids.length < 5) return save([...ids, g.itemId], `Added to this week: ${g.host} made a change worth reading.`);
    ctx.menu(
      anchor,
      week.top5.map((c, i) => ({
        label: `Replace ${i + 1}: ${c.title.length > 48 ? `${c.title.slice(0, 46)}...` : c.title}`,
        onSelect: () =>
          save(
            ids.map((x, j) => (j === i ? g.itemId : x)),
            `Swapped in: ${g.host} made a change worth reading.`
          ),
      }))
    );
  };

  // One link per changed page, from the desk's own watch data and https only.
  const openLinks = (g) =>
    g.pageLinks
      .filter((p) => /^https:\/\//.test(p.url))
      .map((p) =>
        h(
          'a',
          { class: 'btn btn-small', href: p.url, target: '_blank', rel: 'noopener noreferrer', title: p.url },
          g.pageLinks.length === 1 ? 'Open their page' : `Open ${p.label}`
        )
      );

  const hostCard = (g) => {
    const material = g.events.filter((e) => e.material);
    const other = g.events.filter((e) => !e.material);
    const shown = [...material, ...other];
    const first = shown.slice(0, MAX_EVENTS);
    const rest = shown.slice(MAX_EVENTS);
    const chip = g.seen
      ? h('span', { class: 'chip chip-accent' }, 'Seen')
      : g.worry
        ? h('span', { class: 'chip chip-warn' }, 'Worth reading')
        : g.materialNoted
          ? h('span', { class: 'chip chip-accent' }, 'Already noted')
          : g.events.length
            ? h('span', { class: 'chip' }, 'Nothing to act on')
            : h('span', { class: 'chip' }, 'No change');
    return h(
      'div',
      { class: `cp-change${g.seen ? ' is-seen' : ''}`, dataset: { host: g.host } },
      h(
        'div',
        { class: 'row', style: { justifyContent: 'space-between', alignItems: 'flex-start' } },
        h(
          'div',
          {},
          h('h3', {}, g.host),
          h(
            'div',
            { class: 'muted small' },
            g.checkedText
              ? `Checked on ${g.checkedText}${g.events.length ? `. ${g.countText}.` : '.'}`
              : 'Not checked yet.'
          )
        ),
        chip
      ),
      h('p', { class: 'cp-summary' }, g.summary),
      shown.length
        ? h(
            'ul',
            { class: 'cp-lines' },
            first.map((e) => eventItem(h, e)),
            rest.length
              ? h(
                  'li',
                  {},
                  h(
                    'details',
                    {},
                    h('summary', {}, `Show ${rest.length} more`),
                    h(
                      'ul',
                      { class: 'cp-lines' },
                      rest.map((e) => eventItem(h, e))
                    )
                  )
                )
              : null
          )
        : null,
      g.sentinels.map((s) =>
        h(
          'p',
          { class: `cp-sentinel${s.state === 'appeared' ? ' is-live' : ''}` },
          s.plain,
          s.state === 'appeared'
            ? null
            : ' (the desk watches a pricing address that does not exist yet, and tells you the day it does)'
        )
      ),
      g.dossierText && g.events.length ? h('p', { class: 'cp-note' }, g.dossierText) : null,
      g.worry && g.checkOld
        ? h(
            'p',
            { class: 'cp-note' },
            `This check is ${g.daysSinceCheck} days old. Press Check competitors now for the current state.`
          )
        : null,
      g.itemId
        ? h(
            'div',
            { class: 'row', style: { marginTop: '14px' } },
            g.seen
              ? h(
                  'button',
                  { type: 'button', class: 'btn btn-small btn-quiet', onclick: () => markSeen(g, 'reopen') },
                  'Mark as not seen'
                )
              : [
                  openLinks(g),
                  h('button', { type: 'button', class: 'btn btn-small', onclick: () => markSeen(g, 'done') }, 'Seen'),
                  h(
                    'button',
                    { type: 'button', class: 'btn btn-small', onclick: (e) => addToWeek(g, e.currentTarget) },
                    'Add to this week'
                  ),
                ]
          )
        : g.materialNoted
          ? h('div', { class: 'row', style: { marginTop: '14px' } }, openLinks(g))
          : null
    );
  };

  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'What changed on pages we watch'),
      h(
        'span',
        { class: 'section-note' },
        'A price, title, description, headline, button or pricing page is worth reading, unless the competitor dossier already notes it. Lists and small text changes are shown but are not worries.'
      )
    ),
    changed.length
      ? h('div', { class: 'stack' }, changed.map(hostCard))
      : h('p', { class: 'empty' }, 'No watched page has changed at the last check.'),
    quiet.length
      ? h(
          'div',
          { style: { marginTop: '16px' } },
          h('h3', { class: 'small muted', style: { margin: '0 0 6px' } }, 'No change at the last check'),
          h(
            'ul',
            { class: 'side-list cp-quiet' },
            quiet.map((g) =>
              h(
                'li',
                {},
                h('strong', {}, g.host),
                h(
                  'span',
                  { class: 'small muted' },
                  `${fmt.plural(g.watchedPages, 'page', 'pages')} watched, none changed`
                )
              )
            )
          )
        )
      : null
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
