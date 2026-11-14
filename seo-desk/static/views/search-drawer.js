// The search drawer, and the pieces the Keywords page shares with it.
//
//   openSearchDrawer(query, ctx, {range, row, filtered})  the search's trend (live from Search Console), the
//        pages that show for it with their shares, and Target or Ignore. `range` is the query
//        string for the period ('range=28', or a custom range); `row` is the list row, whose
//        numbers show at once while the trend loads.
//   followRows(table, row, open)  while the drawer opened from `row` is open, Up and Down open the
//        previous or next row of `table` (a dataTable) with `open(row)`. Esc still closes.
//   askTarget(ctx, {keywords, page})  the "Target" form: the page meant to win it, Priority
//        (optional), Search group (optional). Resolves {page, priority, intentGroup} or null.
//   adoptKeywords(ctx, items), ignoreKeywords(ctx, keywords), restoreKeywords(ctx, keywords)
//        the writes, each ending in one plain toast; resolve true when something changed.
//   livePages(ctx)  the live pages, for the page pickers (fetched once a minute at most).

import { h, fmt } from '../app.js';
import { isDrawerOpen, closeDrawer } from './drawer.js';
import { lineChart } from '../chart.js';

const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase();
const blank = (v) => v === null || v === undefined;

// ------------------------------------------------------------------ page shares

// A page's share of a search or topic, as the server sent it. The server sends null when there
// are too few views to split, and then the plain count is shown and no bar is drawn.
export const shareText = (p) =>
  blank(p.share)
    ? `shown ${fmt.num(p.impressions)} ${Number(p.impressions) === 1 ? 'time' : 'times'}`
    : `${fmt.share(p.share)} of times shown`;
export const shareWidth = (p) => (blank(p.share) ? null : `${Math.max(0.5, Number(p.share) * 100)}%`);

// The list of pages with their shares. `extra(p)` adds words after the share (place, clicks).
export function shareList(pages, { extra = null } = {}) {
  return h(
    'ul',
    { class: 'share-list' },
    pages.map((p, i) => {
      const width = shareWidth(p);
      const text = [shareText(p), extra ? extra(p) : null].filter(Boolean).join(', ');
      return h(
        'li',
        {},
        h(
          'div',
          { class: 'share-head' },
          h('span', { class: 'page-path' }, p.page),
          h('span', { class: 'num muted' }, text)
        ),
        width
          ? h(
              'div',
              { class: `bar${i === 0 ? ' is-winner' : ''}`, role: 'img', 'aria-label': `${p.page}: ${shareText(p)}` },
              h('span', { style: { width } })
            )
          : null
      );
    })
  );
}

// ------------------------------------------------------------------ live pages and target lists

let pagesCache = null;
export function livePages(ctx) {
  if (!pagesCache || Date.now() - pagesCache.at > 60000) {
    const at = Date.now();
    const promise = ctx.api
      .get('/api/pages')
      .then((d) => d.items.map((r) => r.page).sort((a, b) => a.localeCompare(b)))
      .catch((e) => {
        pagesCache = null;
        throw e;
      });
    pagesCache = { at, promise };
  }
  return pagesCache.promise;
}

let listsCache = null;
// {targets: Map(keyword -> {page, origin}), ignored: Set(keyword)}
function keywordLists(ctx) {
  if (!listsCache || Date.now() - listsCache.at > 30000) {
    const at = Date.now();
    const promise = Promise.all([
      ctx.api.get('/api/targets?tab=targeted'),
      ctx.api.get('/api/targets?tab=ignored'),
    ]).then(([t, i]) => ({
      targets: new Map(t.rows.map((r) => [norm(r.keyword), { page: r.page, origin: r.origin }])),
      ignored: new Set(i.rows.map((r) => norm(r.keyword))),
    }));
    promise.catch(() => {
      listsCache = null;
    });
    listsCache = { at, promise };
  }
  return listsCache.promise;
}
const forgetLists = () => {
  listsCache = null;
};

// ------------------------------------------------------------------ writes

const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

export async function adoptKeywords(ctx, items) {
  forgetLists();
  try {
    const r = await ctx.api.post('/api/targets/adopt', { items });
    const first = r.skipped?.[0];
    if (r.adopted) {
      ctx.toast(
        `${plural(r.adopted, 'search is', 'searches are')} now a target.${r.skipped?.length ? ` ${plural(r.skipped.length, 'was', 'were')} skipped: ${first.why}` : ''}`,
        'success'
      );
    } else {
      ctx.toast(first ? `Nothing was added. ${first.why}` : 'Nothing was added.', 'error');
    }
    return r.adopted > 0;
  } catch (e) {
    ctx.toast(e.message, 'error');
    return false;
  }
}

export async function ignoreKeywords(ctx, keywords) {
  forgetLists();
  try {
    await ctx.api.post('/api/targets/ignore', { keywords });
    ctx.toast(
      `Ignored ${plural(keywords.length, 'search', 'searches')}. You can bring ${keywords.length === 1 ? 'it' : 'them'} back from the Ignored tab on the Keywords page.`,
      'success'
    );
    return true;
  } catch (e) {
    ctx.toast(e.message, 'error');
    return false;
  }
}

export async function restoreKeywords(ctx, keywords) {
  forgetLists();
  try {
    await ctx.api.post('/api/targets/restore', { keywords });
    ctx.toast(`Brought back ${plural(keywords.length, 'search', 'searches')}.`, 'success');
    return true;
  } catch (e) {
    ctx.toast(e.message, 'error');
    return false;
  }
}

// ------------------------------------------------------------------ the Target form

export const PRIORITY_HELP =
  'High counts a quarter more when the desk ranks work, low counts half. Medium is the same as none.';

export function prioritySelect(value = '', label = 'Priority (optional)') {
  const sel = h(
    'select',
    { class: 'select', 'aria-label': label },
    h('option', { value: '' }, 'No priority'),
    h('option', { value: 'high' }, 'High'),
    h('option', { value: 'medium' }, 'Medium'),
    h('option', { value: 'low' }, 'Low')
  );
  sel.value = value ?? '';
  return sel;
}

// keywords: [string]; page: the page to start with (the page Google shows most).
export async function askTarget(ctx, { keywords, page = null }) {
  let pages;
  try {
    pages = await livePages(ctx);
  } catch (e) {
    ctx.toast(e.message, 'error');
    return null;
  }
  const many = keywords.length > 1;
  return new Promise((resolve) => {
    const dialog = h('dialog', { class: 'dialog' });
    const done = (value) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      done(null);
    });
    const pageSel = h(
      'select',
      { class: 'select', 'aria-label': 'Page meant to win it', 'data-autofocus': true },
      many
        ? h('option', { value: '' }, 'For each search, the page Google shows most')
        : h('option', { value: '' }, 'Choose a page'),
      pages.map((p) => h('option', { value: p }, p))
    );
    pageSel.value = !many && page && pages.includes(page) ? page : '';
    const prio = prioritySelect('');
    const group = h('input', {
      class: 'input',
      type: 'text',
      maxlength: 60,
      placeholder: 'for example rota templates',
      'aria-label': 'Search group (optional)',
    });
    const error = h('p', { class: 'dialog-error', hidden: true });
    const field = (label, control, help) =>
      h(
        'label',
        { class: 'dialog-field kw-field' },
        h('span', { class: 'small' }, label),
        control,
        help ? h('span', { class: 'small muted' }, help) : null
      );
    dialog.append(
      h(
        'form',
        {
          method: 'dialog',
          onsubmit: (e) => {
            e.preventDefault();
            if (!many && !pageSel.value) {
              error.textContent = 'Choose the page meant to win this search first.';
              error.hidden = false;
              pageSel.focus();
              return;
            }
            done({
              page: pageSel.value || null,
              priority: prio.value || null,
              intentGroup: group.value.trim() || null,
            });
          },
        },
        h('h2', {}, many ? `Target ${plural(keywords.length, 'search', 'searches')}` : 'Target this search'),
        h(
          'p',
          { class: 'dialog-body' },
          many
            ? 'The desk then tracks whether Google shows the page you pick for each of them.'
            : `"${keywords[0]}". The desk then tracks whether Google shows the page you pick for it.`
        ),
        field('Page meant to win it', pageSel),
        field('Priority (optional)', prio, PRIORITY_HELP),
        field('Search group (optional)', group, 'Give searches the same group when one page should win them all.'),
        error,
        h(
          'div',
          { class: 'dialog-actions' },
          h('button', { type: 'button', class: 'btn', onclick: () => done(null) }, 'Cancel'),
          h('button', { type: 'submit', class: 'btn btn-primary' }, many ? 'Target them' : 'Target it')
        )
      )
    );
    document.body.append(dialog);
    dialog.showModal();
    pageSel.focus();
  });
}

// ------------------------------------------------------------------ Up and Down between rows

let nav = null;

export function followRows(table, row, open) {
  // openDrawer returns focus, on close, to whatever had focus when it opened, and opening a new
  // drawer first closes the old one, which hands focus back to the old drawer's row. So the old
  // drawer is closed here, then focus goes to this row (without scrolling the page away), and
  // only then the drawer opens: this row is what Esc, the close button or a click outside return to.
  if (isDrawerOpen()) closeDrawer();
  table.markCurrent?.(row);
  table.focusRow?.(row);
  open(row);
  const panels = document.querySelectorAll('aside.drawer');
  nav = { table, row, open, panel: panels[panels.length - 1] ?? null };
}

function onArrow(e) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (!nav || !isDrawerOpen() || !nav.panel?.isConnected) return;
  if (document.querySelector('dialog[open]')) return;
  if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
  if (!nav.panel.contains(e.target) && e.target !== document.body) return;
  const next = nav.table.step(nav.row, e.key === 'ArrowDown' ? 1 : -1);
  e.preventDefault();
  if (!next) return;
  // The row has focus now, so the new drawer hands focus back to it when it closes.
  followRows(nav.table, next, nav.open);
}

if (typeof document !== 'undefined') document.addEventListener('keydown', onArrow);

// ------------------------------------------------------------------ the drawer

const METRICS = [
  { key: 'impressions', label: 'Times shown' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'position', label: 'Average place', invert: true },
];

export function openSearchDrawer(query, ctx, { range = 'range=28', row = null, filtered = false } = {}) {
  // The trend has no filters, so a filtered list row's numbers would not match it: with filters on,
  // every number in the drawer comes from the trend's own pull.
  const own = filtered ? null : row;
  const status = h('div', { class: 'row' }, h('span', { class: 'small muted' }, 'Checking whether it is a target...'));
  const facts = h('div', {});
  const trend = h('div', {}, h('p', { class: 'loading sd-loading' }, 'Loading from Search Console...'));
  const pagesBox = h('div', {});
  const box = h(
    'div',
    { class: 'stack sd' },
    status,
    filtered
      ? h(
          'p',
          { class: 'banner banner-accent small' },
          'Your filters are not used here: these numbers, the trend and the pages cover every page, country and device for this search.'
        )
      : null,
    facts,
    h(
      'section',
      { class: 'section' },
      h(
        'div',
        { class: 'section-head', style: { marginBottom: '4px' } },
        h('h3', { class: 'section-title' }, 'Each day')
      ),
      trend
    ),
    h(
      'section',
      { class: 'section' },
      h(
        'div',
        { class: 'section-head', style: { marginBottom: '4px' } },
        h('h3', { class: 'section-title' }, 'Pages that show for it')
      ),
      pagesBox
    ),
    h(
      'p',
      { class: 'small muted' },
      'Google hides clicks on rare searches, so clicks here are a floor. Up and Down arrows open the next search; Esc closes.'
    )
  );
  ctx.openDrawer(box, { title: query });

  const showFacts = (numbers) =>
    facts.replaceChildren(
      h(
        'dl',
        { class: 'kv' },
        h('dt', {}, 'Times shown'),
        h('dd', {}, fmt.num(numbers.impressions)),
        h('dt', {}, 'Clicks'),
        h('dd', {}, `${fmt.num(numbers.clicks)} (at least)`),
        h('dt', {}, 'Average place'),
        h('dd', {}, blank(numbers.position) ? fmt.NOT_ENOUGH : `${fmt.position(numbers.position)}, lower is better`),
        numbers.rangeText ? [h('dt', {}, 'Dates'), h('dd', {}, numbers.rangeText)] : null
      )
    );
  // Keyword rows carry no clicks; their numbers wait for the trend.
  if (own && own.clicks !== undefined) showFacts(own);

  let topPage = row?.topPage ?? null;

  // Target or Ignore, or what is already true about the search.
  const drawStatus = async () => {
    let lists;
    try {
      lists = await keywordLists(ctx);
    } catch (e) {
      status.replaceChildren(h('span', { class: 'small muted' }, e.message));
      return;
    }
    if (!box.isConnected) return;
    const target = lists.targets.get(norm(query));
    const ignored = lists.ignored.has(norm(query));
    const toKeywords = h(
      'a',
      { class: 'btn btn-small btn-quiet', href: '#/keywords', onclick: () => ctx.closeDrawer() },
      'Open the Keywords page'
    );
    if (target) {
      status.replaceChildren(
        h(
          'span',
          { class: 'chip chip-accent' },
          `A target for ${target.page}, ${target.origin === 'registry' ? 'from your keyword file' : 'added here'}`
        ),
        toKeywords
      );
    } else if (ignored) {
      status.replaceChildren(
        h('span', { class: 'chip' }, 'Ignored'),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-small',
            onclick: async () => {
              if (await restoreKeywords(ctx, [query])) drawStatus();
            },
          },
          'Bring it back'
        )
      );
    } else {
      status.replaceChildren(
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-primary btn-small',
            onclick: async () => {
              const choice = await askTarget(ctx, { keywords: [query], page: topPage });
              if (!choice) return;
              const ok = await adoptKeywords(ctx, [{ keyword: query, ...choice }]);
              if (ok) drawStatus();
            },
          },
          'Target this search'
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn-small',
            onclick: async () => {
              if (await ignoreKeywords(ctx, [query])) drawStatus();
            },
          },
          'Ignore'
        )
      );
    }
  };
  drawStatus();

  // The trend is a live pull, so it waits a moment: arrowing through rows pulls only where you stop.
  const load = async () => {
    trend.replaceChildren(h('p', { class: 'loading sd-loading' }, 'Loading from Search Console...'));
    let d;
    try {
      d = await ctx.api.get(`/api/search-detail?query=${encodeURIComponent(query)}&${range}`);
    } catch (e) {
      if (!box.isConnected) return;
      trend.replaceChildren(
        h(
          'p',
          { class: 'banner banner-bad' },
          `${e.message} `,
          h('button', { type: 'button', class: 'btn btn-small', onclick: load }, 'Try again')
        )
      );
      return;
    }
    if (!box.isConnected) return;
    const imp = d.pages.reduce((a, p) => a + (p.impressions || 0), 0);
    const placed = d.pages.filter((p) => !blank(p.position) && p.impressions);
    const weighted = placed.reduce((a, p) => a + p.position * p.impressions, 0);
    const weight = placed.reduce((a, p) => a + p.impressions, 0);
    showFacts({
      impressions: own?.impressions ?? imp,
      clicks: own?.clicks ?? d.pages.reduce((a, p) => a + (p.clicks || 0), 0),
      position: own?.position ?? (weight ? weighted / weight : null),
      rangeText: fmt.range(d.range),
    });
    topPage = d.pages[0]?.page ?? topPage;
    drawTrend(d);
    drawPages(d);
  };

  const drawTrend = (d) => {
    let metric = METRICS[0];
    const chartBox = h('div', {});
    const seriesOf = (m) => d.series.map((p) => ({ date: p.date, value: p[m.key] }));
    const title = (m) => `${m.label} for "${query}", each day`;
    const chips = h(
      'div',
      { class: 'chips', role: 'group', 'aria-label': 'What to chart', style: { marginBottom: '8px' } },
      METRICS.map((m) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            'aria-pressed': String(m === metric),
            onclick: (e) => {
              metric = m;
              for (const b of chips.children) b.setAttribute('aria-pressed', String(b === e.currentTarget));
              chart.update({ series: seriesOf(m), invert: Boolean(m.invert), label: title(m), title: title(m) });
            },
          },
          m.label
        )
      )
    );
    trend.replaceChildren(
      h(
        'p',
        { class: 'section-note', style: { marginBottom: '8px' } },
        `${fmt.range(d.range)}.${d.fetchedOn ? ` Pulled from Search Console on ${d.fetchedOn}.` : ''}`
      ),
      chips,
      chartBox
    );
    const chart = lineChart(chartBox, {
      series: seriesOf(metric),
      label: title(metric),
      title: title(metric),
      rangeText: fmt.range(d.range),
      controls: true,
    });
  };

  const drawPages = (d) => {
    if (!d.pages.length) {
      pagesBox.replaceChildren(
        h('p', { class: 'empty' }, 'Google did not show any page for this search in this period.')
      );
      return;
    }
    const split = d.pages.some((p) => !blank(p.share));
    pagesBox.replaceChildren(
      h(
        'p',
        { class: 'section-note' },
        split
          ? 'Share of the times this search showed the site, by page.'
          : `The pages that showed for this search. It has too few views to split into shares (${fmt.NOT_ENOUGH}).`
      ),
      shareList(d.pages, {
        extra: (p) => `place ${fmt.position(p.position)}, ${fmt.plural(p.clicks, 'click', 'clicks')}`,
      })
    );
  };

  setTimeout(() => {
    if (box.isConnected) load();
  }, 350);
  return box;
}
