// All opportunities: the full list behind the week page. One tab per type (the standard terms)
// with its count, status views, text search, sort, bulk Done and Ignore, and CSV. The old
// "competing" full view (#/opportunities?view=competing) now lives on the Cannibalization page.

import { renderCard } from './card.js';
import { linksPanel, openCount } from './links.js';

// Open (new, in progress or came back) is the one definition the sidebar and the insight pages use;
// the server counts it. Needs attention is the new ones only.
const STATUS_VIEWS = [
  { key: 'open', label: 'Open', count: (c) => c.open ?? 0 },
  { key: 'attention', label: 'Needs attention', count: (c) => c.new ?? 0 },
  { key: 'in-progress', label: 'In progress', count: (c) => c['in-progress'] ?? 0 },
  { key: 'snoozed', label: 'Snoozed', count: (c) => c.snoozed ?? 0 },
  { key: 'done', label: 'Done', count: (c) => c.done ?? 0 },
  { key: 'ignored', label: 'Ignored', count: (c) => c.ignored ?? 0 },
  { key: 'came-back', label: 'Came back', count: (c) => c['came-back'] ?? 0 },
  {
    key: 'all',
    label: 'All',
    count: (c) => Object.entries(c).reduce((s, [k, n]) => (k === 'open' ? s : s + n), 0),
  },
];

const SORTS = [
  { key: 'score', label: 'Highest score', fn: (a, b) => (b.score?.total ?? -1) - (a.score?.total ?? -1) },
  { key: 'page', label: 'Page, A to Z', fn: (a, b) => String(a.page ?? '~').localeCompare(String(b.page ?? '~')) },
  { key: 'type', label: 'Type', fn: (a, b) => a.typeLabel.localeCompare(b.typeLabel) },
  {
    key: 'status',
    label: 'Last status change',
    fn: (a, b) => String(b.item?.since ?? '').localeCompare(String(a.item?.since ?? '')),
  },
];

const PAGE_SIZE = 30;

export async function render(el, ctx) {
  // The old full view of searches split between pages is the Cannibalization page now.
  if (ctx.params.get('view') === 'competing') {
    location.replace('#/cannibalization');
    return;
  }
  return renderList(el, ctx);
}

// ------------------------------------------------------------------ the list

async function renderList(el, ctx) {
  const { api, h, fmt, params } = ctx;
  const type = params.get('type') || 'all';
  const status = params.get('status') || 'open';
  // The Internal links tab is not an opportunity type: the list behind it comes from its own route.
  const onLinks = type === 'links';
  const query = new URLSearchParams({ type: onLinks ? 'all' : type, status });
  // The link suggestions read the site's files and take a moment, so they are asked for now and
  // filled in when they arrive: the list never waits for them, and a failure shows on their tab only.
  const linksRequest = api.get('/api/link-suggestions');
  linksRequest.catch(() => {});
  const data = await api.get(`/api/opportunities?${query}`);
  ctx.envelope(data);

  const go = (changes) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    ctx.navigate(`#/opportunities?${next}`);
  };

  const linkCount = h('span', { class: 'count', 'aria-live': 'polite' });
  const byType = data.counts.byType;
  const typeTotal = Object.values(byType).reduce((s, n) => s + n, 0);
  // On the Open view a type with its own insight page shows that page's number, in its unit, so it
  // reads the same as the sidebar (a content gap is a group of searches; the rows below are searches).
  const tabCount = (t) =>
    status === 'open' && t.insightCount !== null && t.insightCount !== undefined
      ? t.insightCount
      : (byType[t.type] ?? 0);
  const tabTitle = (t) =>
    status === 'open' && t.insightCount !== null && t.insightCount !== undefined
      ? (t.countNote ?? `${fmt.plural(t.insightCount, t.unit[0], t.unit[1])}, as on the ${t.label} page.`)
      : t.explain || null;
  const tabs = h(
    'div',
    { class: 'tabs', role: 'group', 'aria-label': 'Opportunity types' },
    [{ type: 'all', label: 'All' }, ...data.types].map((t) =>
      h(
        'button',
        {
          type: 'button',
          class: 'tab',
          'aria-pressed': String(t.type === type),
          title: t.type === 'all' ? null : tabTitle(t),
          onclick: () => go({ type: t.type }),
        },
        t.label,
        h('span', { class: 'count' }, fmt.num(t.type === 'all' ? typeTotal : tabCount(t)))
      )
    ),
    h(
      'button',
      {
        type: 'button',
        class: 'tab',
        'aria-pressed': String(onLinks),
        title: 'Sentences already on the site that could link to a page that needs links',
        onclick: () => go({ type: 'links' }),
      },
      'Internal links',
      linkCount
    )
  );

  const statusChips = h(
    'div',
    { class: 'chips', role: 'group', 'aria-label': 'Status' },
    STATUS_VIEWS.map((s) =>
      h(
        'button',
        {
          type: 'button',
          class: 'chip chip-btn',
          'aria-pressed': String(s.key === status),
          onclick: () => go({ status: s.key }),
        },
        `${s.label} `,
        h('span', { class: 'count' }, fmt.num(s.count(data.counts.byStatus)))
      )
    )
  );

  // State that lives only on this page: search text, sort, how many shown, selection.
  const state = {
    q: params.get('q') ?? '',
    sort: params.get('sort') ?? 'score',
    shown: PAGE_SIZE,
    selected: new Set(),
  };

  const search = h('input', {
    class: 'input',
    type: 'search',
    placeholder: 'Search pages, searches and titles',
    'aria-label': 'Search opportunities',
    'data-search': true,
    title: 'Press / anywhere on the page to jump here',
    value: state.q,
  });
  const sort = h(
    'select',
    { class: 'select', 'aria-label': 'Sort' },
    SORTS.map((s) => h('option', { value: s.key }, `Sort: ${s.label}`))
  );
  sort.value = state.sort;
  const csv = h('a', { class: 'btn', href: `/api/export/opportunities.csv?${query}`, download: '' }, 'Download CSV');

  const listBox = h('div', {});
  const bulkBar = h('div', { class: 'toolbar', style: { marginBottom: '8px' } });

  const visible = () => {
    const needle = state.q.trim().toLowerCase();
    const sorter = SORTS.find((s) => s.key === state.sort) ?? SORTS[0];
    return data.items
      .filter(
        (o) =>
          !needle ||
          [o.title, o.page, o.query, o.measured, o.typeLabel].some((v) =>
            String(v ?? '')
              .toLowerCase()
              .includes(needle)
          )
      )
      .sort(sorter.fn);
  };

  // The bulk bar is built once; ticking a box only updates it, so keyboard focus stays put.
  let shownRows = []; // every row that matches the filters
  let drawnRows = []; // the rows on screen now (the first pages of shownRows)
  const actionableOf = (rows) => rows.filter((o) => !['done', 'ignored'].includes(o.status));
  const chosenRows = () => shownRows.filter((o) => state.selected.has(o.id));
  const selectAll = h('input', {
    type: 'checkbox',
    'aria-label': 'Select every item shown',
    onchange: (e) => {
      for (const o of actionableOf(drawnRows)) {
        if (e.target.checked) state.selected.add(o.id);
        else state.selected.delete(o.id);
      }
      for (const box of listBox.querySelectorAll('.item-row input[type="checkbox"]')) {
        box.checked = state.selected.has(box.closest('.item-row').dataset.id);
      }
      drawBulk();
    },
  });
  const selectText = h('span', {}, 'Select all shown');
  const doneButton = h(
    'button',
    { type: 'button', class: 'btn btn-small', onclick: () => bulk(chosenRows(), 'done') },
    'Mark selected done'
  );
  const ignoreButton = h(
    'button',
    { type: 'button', class: 'btn btn-small', onclick: () => bulk(chosenRows(), 'ignore') },
    'Ignore selected'
  );
  const countText = h('span', { class: 'small muted', style: { marginLeft: 'auto' } });
  bulkBar.append(
    h('label', { class: 'row small muted', style: { gap: '6px' } }, selectAll, selectText),
    doneButton,
    ignoreButton,
    countText
  );

  const drawBulk = () => {
    const actionable = actionableOf(drawnRows);
    const chosen = chosenRows();
    selectAll.checked = actionable.length > 0 && actionable.every((o) => state.selected.has(o.id));
    selectAll.disabled = actionable.length === 0;
    selectText.textContent = chosen.length ? `${chosen.length} selected` : 'Select all shown';
    doneButton.disabled = !chosen.length;
    ignoreButton.disabled = !chosen.length;
    countText.textContent = fmt.plural(shownRows.length, 'item', 'items');
  };

  const drawList = () => {
    const rows = visible();
    shownRows = rows;
    drawnRows = [];
    for (const id of [...state.selected]) if (!rows.some((o) => o.id === id)) state.selected.delete(id);
    drawBulk();

    if (!rows.length) {
      listBox.replaceChildren(
        h(
          'p',
          { class: 'empty' },
          state.q
            ? 'Nothing matches that search. Clear it to see the whole list.'
            : status === 'attention' || status === 'open'
              ? 'Nothing is open in this group. Pick another type or status above.'
              : 'Nothing here. Pick another type or status above.'
        )
      );
      return;
    }
    const slice = rows.slice(0, state.shown);
    drawnRows = slice;
    drawBulk();
    listBox.replaceChildren();
    ctx.mount(
      listBox,
      h(
        'div',
        {},
        slice.map((o) =>
          renderCard(o, ctx, {
            variant: 'row',
            selectable: ['done', 'ignored'].includes(o.status)
              ? null
              : {
                  checked: state.selected.has(o.id),
                  onToggle: (on) => {
                    if (on) state.selected.add(o.id);
                    else state.selected.delete(o.id);
                    drawBulk();
                  },
                },
          })
        )
      ),
      rows.length > slice.length
        ? h(
            'div',
            { class: 'table-foot' },
            `Showing ${slice.length} of ${rows.length}.`,
            h(
              'button',
              {
                type: 'button',
                class: 'btn btn-small',
                onclick: () => {
                  state.shown += PAGE_SIZE;
                  drawList();
                },
              },
              `Show ${Math.min(PAGE_SIZE, rows.length - slice.length)} more`
            )
          )
        : null
    );
  };

  async function bulk(chosen, action) {
    let reason = null;
    if (action === 'ignore') {
      reason = await ctx.promptBox({
        title: `Ignore ${fmt.plural(chosen.length, 'item', 'items')}?`,
        body: 'They leave your lists and stay ignored, even when the data changes. One reason is saved on each.',
        label: 'Reason',
        placeholder: 'For example: not worth the effort this quarter',
        confirmLabel: 'Ignore them',
      });
      if (!reason) return;
    } else {
      const edits = chosen.filter((o) => o.isPageEdit);
      const ok = await ctx.confirmBox({
        title: `Mark ${fmt.plural(chosen.length, 'item', 'items')} done?`,
        body: edits.length
          ? `${fmt.plural(edits.length, 'of them is a live page change', 'of them are live page changes')}. Each of those pages is frozen for 28 days, until ${fmt.date(fmt.isoPlus(28))}, and gets its before and after verdict about ${fmt.date(fmt.isoPlus(30))}:\n${[...new Set(edits.map((o) => o.page))].join('\n')}\n\n${edits.length > 1 ? 'The rule is one live page edit a week, so the desk holds back any page edit after the first one this week, and any frozen page, and lists them. ' : ''}Only do this once the changes are live.`
          : 'None of them changes a live page, so nothing gets frozen.',
        confirmLabel: 'Mark them done',
      });
      if (!ok) return;
    }
    let okCount = 0;
    const failed = [];
    // Page edits the server held back under the one edit a week rule (a frozen page or a second
    // edit this week). Each is checked on its own, in order, with no override.
    const heldBack = [];
    for (const o of chosen) {
      try {
        await api.post(`/api/item/${encodeURIComponent(o.id)}`, reason ? { action, reason } : { action });
        okCount++;
      } catch (e) {
        if (e.status === 409 && (e.data?.frozen || e.data?.secondThisWeek)) heldBack.push(o);
        else failed.push(`${o.title}: ${e.message}`);
      }
    }
    const held = heldBack.length
      ? ` ${fmt.plural(heldBack.length, 'page edit was', 'page edits were')} held back by the one edit a week rule: ${heldBack
          .slice(0, 3)
          .map((o) => o.page ?? o.title)
          .join(
            ', '
          )}${heldBack.length > 3 ? ` and ${heldBack.length - 3} more` : ''}. Open a card to mark it done anyway.`
      : '';
    ctx.toast(
      `${action === 'done' ? 'Marked' : 'Ignored'} ${fmt.plural(okCount, 'item', 'items')}${action === 'done' ? ' done' : ''}.${held}${failed.length ? ` ${failed.length} could not be changed. ${failed[0]}` : ''}`,
      failed.length || heldBack.length ? 'error' : 'success'
    );
    await ctx.reload();
  }

  search.addEventListener('input', () => {
    state.q = search.value;
    state.shown = PAGE_SIZE;
    ctx.setParams({ q: state.q });
    drawList();
  });
  sort.addEventListener('change', () => {
    state.sort = sort.value;
    ctx.setParams({ sort: state.sort === 'score' ? null : state.sort });
    drawList();
  });

  // The selected type's plain sentence, and how its count meets the rows when the units differ.
  const selected = data.types.find((t) => t.type === type);
  const caption = selected
    ? h(
        'p',
        { class: 'op-caption' },
        `${selected.label}: ${selected.explain}`,
        status === 'open' && selected.countNote ? ` ${selected.countNote}` : '',
        selected.route ? ' ' : '',
        selected.route ? h('a', { href: `#/${selected.route}` }, `Open the ${selected.label} page`) : null,
        selected.route ? '.' : ''
      )
    : onLinks
      ? h(
          'p',
          { class: 'op-caption' },
          'Internal links: sentences already on the site that could link to a page that needs links.'
        )
      : null;

  const linksBox = onLinks
    ? h('div', {}, h('p', { class: 'loading', style: { padding: '12px 0' } }, 'Loading the link suggestions...'))
    : null;
  ctx.mount(
    el,
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, 'All opportunities'),
        h('p', { class: 'page-sub' }, 'Every open opportunity of every kind, in one list, ranked by score.'),
        data.range ? h('p', { class: 'page-sub ins-note' }, `Numbers cover ${fmt.range(data.range)}.`) : null
      ),
      h('a', { class: 'btn', href: '#/cannibalization' }, 'Open Cannibalization')
    ),
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    data.warnings?.length ? h('p', { class: 'banner banner-warn' }, data.warnings.join(' ')) : null,
    tabs,
    caption,
    linksBox
  );
  linksRequest.then(
    (linkData) => {
      linkCount.textContent = fmt.num(linkData.open ?? openCount(linkData.pages));
      if (linksBox) linksBox.replaceChildren(linksPanel(ctx, linkData));
    },
    () => {
      linkCount.textContent = '';
      if (linksBox)
        linksBox.replaceChildren(
          h(
            'p',
            { class: 'banner banner-warn' },
            'The link suggestions could not be loaded. Reload the page to try again.'
          )
        );
    }
  );
  if (onLinks) return;
  ctx.mount(
    el,
    h('div', { class: 'toolbar' }, statusChips),
    h('div', { class: 'toolbar' }, h('div', { class: 'grow' }, search), sort, csv),
    type === 'competing-pages'
      ? h(
          'p',
          { class: 'banner banner-accent', style: { marginBottom: '12px' } },
          'Each search here is split between our pages. ',
          h('a', { href: '#/cannibalization' }, 'See every split with each page’s share on the Cannibalization page'),
          '.'
        )
      : null,
    bulkBar,
    listBox
  );
  drawList();
}
