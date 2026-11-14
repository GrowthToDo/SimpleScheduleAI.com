// The insight pages, one module: Cannibalization, Runner-up keywords, Secondary keywords, Content
// gaps and Decay. Each page has the row of insight quick links, the standard term as its title
// with the one plain sentence under it, a row of counters (the first is the count the sidebar
// shows), then its cards or its table.
//
//   renderInsight(el, ctx, route)   route: 'cannibalization' | 'runner-up' | 'secondary-keywords'
//                                   | 'content-gaps' | 'decay'
//
// The pure helpers below (stripHypothesis, dropKindText, runnerUpRows, pageTwoCount) import nothing
// from the browser at load time, so node tests can run them. Every search phrase, page path and
// sentence from the server is data and goes in as text. Priorities, briefs, shares, changes and the
// hover lines with numbers in them come from the server (null means not enough data yet); this page
// never works out a percentage, a priority or a brief, and draws no bar for a null share.

import { insightLinks, entryFor, countText } from './nav.js';
import { renderCard, priorityChip, postAction } from './card.js';
import { dataTable } from './table.js';

const SITE = 'https://simplescheduleai.com';

// ------------------------------------------------------------------ pure helpers

// The server writes "Hypothesis: may ..."; the card already shows a Hypothesis label beside it.
export function stripHypothesis(text) {
  const t = String(text ?? '')
    .replace(/^\s*Hypothesis:\s*/i, '')
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

// The chip for a kind of drop on a Decay card or row.
const DROP_KIND = {
  'lost-rankings': 'Lost rankings',
  'lost-demand': 'Lost demand',
  'lost-clicks': 'Lost clicks at the same position',
  unclear: 'Kind of drop: not clear from the numbers',
};
export const dropKindText = (kind) => DROP_KIND[kind] ?? DROP_KIND.unclear;

// Runner-up opportunities as table rows: the place and times shown come from the evidence row for
// the same search and page (else the first one).
export function runnerUpRows(items) {
  return (items ?? []).map((o) => {
    const ev = (o.evidence ?? []).find((e) => e.query === o.query && e.page === o.page) ?? o.evidence?.[0] ?? {};
    return {
      id: o.id,
      query: o.query ?? ev.query ?? o.title,
      page: o.page ?? ev.page ?? null,
      position: typeof ev.position === 'number' ? ev.position : null,
      impressions: typeof ev.impressions === 'number' ? ev.impressions : null,
      opp: o,
    };
  });
}

// How many rows sit on page two (place after 10, up to 20).
export const pageTwoCount = (rows) =>
  (rows ?? []).filter((r) => typeof r.position === 'number' && r.position > 10 && r.position <= 20).length;

// ------------------------------------------------------------------ shared page parts

const ONLY = ['done', 'snooze', 'ignore', 'reopen'];

function pageLink(h, page) {
  return h('a', { class: 'page-path', href: `#/pages?page=${encodeURIComponent(page)}` }, page);
}

function frozenChip(h, text, page) {
  return text
    ? h(
        'span',
        {
          class: 'chip chip-hyp',
          title: `${page} was changed on purpose and is being measured. Editing it now would blur that verdict.`,
        },
        `Frozen until ${text}`
      )
    : null;
}

// The top of every insight page: quick links, the term, its plain sentence, a note, the counters.
function head(ctx, route, data, nav, { note = null, tiles = [], tools = null } = {}) {
  const { h } = ctx;
  const entry = entryFor(route);
  return [
    insightLinks(h, route, nav?.counts ?? ctx.counts() ?? {}),
    h(
      'div',
      { class: 'page-head' },
      h(
        'div',
        {},
        h('h1', { class: 'page-title' }, data.term ?? entry.label),
        h('p', { class: 'page-sub' }, data.explain ?? entry.explain),
        note ? h('p', { class: 'page-sub ins-note' }, note) : null
      ),
      tools
    ),
    data.empty
      ? h('p', { class: 'banner banner-warn' }, 'No search data has been pulled yet. Press Refresh now at the top.')
      : null,
    data.warnings?.length ? h('p', { class: 'banner banner-warn' }, data.warnings.join(' ')) : null,
    tiles.length
      ? h(
          'div',
          { class: `tiles ins-tiles${tiles.length === 4 ? ' tiles-four' : ''}`, 'aria-label': 'Counts' },
          tiles.map((t) =>
            h(
              'div',
              { class: 'tile', title: t.title ?? null },
              h('span', { class: 'tile-label' }, t.label),
              h('span', { class: `tile-value${t.warn ? ' is-warn' : ''}` }, t.value),
              t.note ? h('div', { class: 'tile-change' }, t.note) : null
            )
          )
        )
      : null,
  ];
}

const rangeNote = (ctx, data) => (data.range ? `Numbers cover ${ctx.fmt.range(data.range)}.` : null);

// A card that has no item behind it (a cluster conflict): the same look, no buttons. The
// recommendation is shown once, without its "Hypothesis:" label, beside the Hypothesis chip.
function plainCard(
  h,
  { priority, priorityTitle = null, label, labelTitle = null, title, evidence, recommendation, test = null }
) {
  return h(
    'article',
    { class: 'card' },
    h(
      'div',
      { class: 'card-top' },
      priority ? priorityChip(h, priority, priorityTitle) : null,
      h('span', { class: 'chip', title: labelTitle }, label)
    ),
    labelTitle ? h('p', { class: 'card-explain' }, labelTitle) : null,
    h('h3', { class: 'card-title' }, title),
    h(
      'dl',
      { class: 'facts' },
      h('dt', {}, 'Evidence'),
      h('dd', {}, evidence),
      h('dt', {}, 'Recommendation'),
      h(
        'dd',
        {},
        stripHypothesis(recommendation),
        ' ',
        h('span', { class: 'chip chip-hyp', title: 'A suggestion, not a fact. The test settles it.' }, 'Hypothesis'),
        test ? h('span', { class: 'test' }, test) : null
      )
    )
  );
}

// A list of cards with "Show all" past the first few.
function cardList(ctx, cards, { first = 12, emptyText }) {
  const { h } = ctx;
  if (!cards.length) return h('p', { class: 'empty' }, emptyText);
  const box = h('div', { class: 'stack' });
  const draw = (n) => {
    const shown = cards.slice(0, n);
    box.replaceChildren(...shown);
    if (cards.length > n) {
      box.append(
        h(
          'button',
          { type: 'button', class: 'btn btn-small', onclick: () => draw(cards.length) },
          `Show all ${cards.length}`
        )
      );
    }
  };
  draw(first);
  return box;
}

const reloadFrom = (ctx) => async () => {
  ctx.closeDrawer();
  await ctx.reload();
};

// ------------------------------------------------------------------ the entry point

const LOADERS = {
  cannibalization: cannibalizationPage,
  'runner-up': runnerUpPage,
  'secondary-keywords': secondaryPage,
  'content-gaps': gapsPage,
  decay: decayPage,
};

export async function renderInsight(el, ctx, route) {
  const [data, nav] = await Promise.all([
    ctx.api.get(`/api/insights/${route}`),
    ctx.api.get('/api/nav').catch(() => null),
  ]);
  ctx.envelope(data);
  return LOADERS[route](el, ctx, data, nav);
}

// ------------------------------------------------------------------ Cannibalization

const CHOICES = [
  {
    key: 'consolidate',
    label: 'Consolidate',
    title: 'Fold the weaker pages into the page that should win, so one page holds the search.',
  },
  {
    key: 'differentiate',
    label: 'Differentiate',
    title: 'Change the angle of each page so each answers its own need.',
  },
  {
    key: 'leave-alone',
    label: 'Leave alone',
    title: 'A split is fine when the pages serve different needs. It leaves this list until you undo it.',
  },
];

async function saveChoice(ctx, id, choice) {
  await ctx.api.post(`/api/insights/cannibalization/${encodeURIComponent(id)}/choice`, { choice });
  const words = {
    consolidate: 'Saved: consolidate. The recommendation now says how.',
    differentiate: 'Saved: differentiate. The recommendation now says how.',
    'leave-alone': 'Saved: leave alone. It moved to the Left alone list at the bottom.',
  };
  ctx.toast(choice ? words[choice] : 'Choice cleared.', 'success');
  await ctx.reload();
}

function shareRows(ctx, it) {
  const { h, fmt } = ctx;
  return h(
    'ul',
    { class: 'share-list ins-shares' },
    it.pages.map((p) => {
      const wins = p.page === it.shouldWin;
      const share =
        p.share === null || p.share === undefined
          ? `shown ${fmt.plural(p.impressions, 'time', 'times')}`
          : p.share === 0 && p.impressions > 0
            ? 'under 1% of times shown'
            : `${fmt.share(p.share)} of times shown`;
      const text = `${share}, place ${fmt.position(p.position)}`;
      return h(
        'li',
        {},
        h(
          'div',
          { class: 'share-head' },
          h(
            'span',
            { class: 'ins-share-page' },
            pageLink(h, p.page),
            wins
              ? h(
                  'span',
                  { class: 'chip chip-accent', title: 'The page the keyword file names, else the one shown most' },
                  'Should win'
                )
              : null,
            frozenChip(h, p.frozenUntilText, p.page)
          ),
          h('span', { class: 'num muted' }, text)
        ),
        p.share === null || p.share === undefined
          ? null
          : h(
              'div',
              { class: `bar${wins ? ' is-winner' : ''}`, role: 'img', 'aria-label': `${p.page}: ${text}` },
              h('span', { style: { width: `${Math.max(0.5, Number(p.share) * 100)}%` } })
            )
      );
    })
  );
}

function choiceRow(ctx, it) {
  const { h } = ctx;
  return h(
    'div',
    { class: 'ins-choice' },
    h('span', { class: 'small muted' }, 'Your call:'),
    h(
      'div',
      { class: 'chips', role: 'group', 'aria-label': `What to do about "${it.query}"` },
      CHOICES.map((c) =>
        h(
          'button',
          {
            type: 'button',
            class: 'chip chip-btn',
            title: c.title,
            'aria-pressed': String(it.choice === c.key),
            onclick: async (e) => {
              // Kept in a variable: after the await, the event no longer has a current target.
              const button = e.currentTarget;
              button.disabled = true;
              try {
                await saveChoice(ctx, it.id, it.choice === c.key ? null : c.key);
              } catch (err) {
                ctx.toast(err.message, 'error');
                if (button.isConnected) button.disabled = false;
              }
            },
          },
          c.label
        )
      )
    ),
    h(
      'span',
      { class: 'small muted ins-choice-note' },
      'Leave alone when the pages serve different needs; a split is fine then.'
    )
  );
}

function cannibalCard(ctx, it, data) {
  const { h, fmt } = ctx;
  const action = stripHypothesis(it.recommendation);
  const facts = [];
  if (it.atRisk) {
    facts.push([
      'Views at risk',
      h(
        'span',
        {},
        `${fmt.plural(it.atRisk.impressions, 'view', 'views')} and ${fmt.plural(it.atRisk.clicks ?? 0, 'click', 'clicks')} on `,
        pageLink(h, it.atRisk.page),
        ', the weaker page of the split. They may move if the pages are merged.'
      ),
    ]);
  }
  if (it.likelyFalseAlarm && it.falseAlarmReason) facts.push(['Likely false alarm', it.falseAlarmReason]);
  const item = {
    id: it.id,
    typeLabel: it.term ?? 'Cannibalization',
    explain: it.explain,
    title: it.query,
    measured: it.measured,
    action,
    test: it.test,
    page: it.shouldWin,
    isPageEdit: true,
    eligibility: it.eligibility,
    item: it.state,
    links: it.shouldWin ? { live: `${SITE}${it.shouldWin}` } : null,
    brief: it.brief,
  };
  // Differentiate edits the page whose angle changed, so Done asks which one; the others name the
  // pages the server says the Done edits (editPages), every one of them in the confirm.
  const donePick =
    it.choice === 'differentiate'
      ? [
          ...it.pages.map((p) => ({ label: `I changed the angle of ${p.page}`, page: p.page })),
          { label: 'No page changed yet: mark it done without a page edit', page: null },
        ]
      : null;
  return renderCard(item, ctx, {
    priority: it.priority,
    priorityTitle: data.priorityNote,
    editPages: it.editPages ?? (it.shouldWin ? [it.shouldWin] : []),
    donePick,
    chips: [
      it.likelyFalseAlarm
        ? h('span', { class: 'chip chip-hyp', title: it.falseAlarmReason ?? '' }, 'Likely false alarm')
        : null,
      it.choice
        ? h('span', { class: 'chip chip-accent' }, `Chosen: ${CHOICES.find((c) => c.key === it.choice)?.label}`)
        : null,
    ],
    afterTitle: shareRows(ctx, it),
    facts,
    afterFacts: choiceRow(ctx, it),
    only: ONLY,
    ignoreLabel: 'Dismiss',
    noPinNote: true,
  });
}

function leftAloneSection(ctx, list) {
  const { h, fmt } = ctx;
  if (!list?.length) return null;
  return h(
    'details',
    { class: 'section ins-fold' },
    h('summary', {}, `Left alone (${list.length})`),
    h(
      'p',
      { class: 'small muted', style: { margin: '6px 0 10px' } },
      'Splits you marked leave alone. They stay out of the count and the weekly plan until you undo the choice.'
    ),
    h(
      'ul',
      { class: 'side-list' },
      list.map((it) =>
        h(
          'li',
          { class: 'ins-left' },
          h(
            'div',
            {},
            h('strong', {}, it.query),
            h(
              'div',
              { class: 'small muted' },
              `Shown ${fmt.plural(it.impressions, 'time', 'times')} across ${fmt.plural(it.pages.length, 'page', 'pages')}.`
            )
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              onclick: async (e) => {
                const button = e.currentTarget;
                button.disabled = true;
                try {
                  await saveChoice(ctx, it.id, null);
                } catch (err) {
                  ctx.toast(err.message, 'error');
                  if (button.isConnected) button.disabled = false;
                }
              },
            },
            'Undo'
          )
        )
      )
    )
  );
}

function conflictSection(ctx, conflicts, data) {
  const { h, fmt } = ctx;
  const cards = conflicts.map((c) =>
    plainCard(h, {
      priority: c.priority,
      priorityTitle: data.priorityNote,
      label: 'Cluster conflict',
      labelTitle: 'A search no page targets yet that sits in a topic one of your pages already covers.',
      title: c.keyword,
      evidence: h(
        'span',
        {},
        `"${c.keyword}" is shown ${fmt.plural(c.impressions, 'time', 'times')} at place ${fmt.position(c.position)}, and it falls in a topic `,
        pageLink(h, c.page),
        ` already targets ("${c.targetKeyword}").`
      ),
      recommendation: c.recommendation,
      test: c.test,
    })
  );
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Planned keyword may already be covered'),
      h('span', { class: 'section-note' }, fmt.plural(conflicts.length, 'search', 'searches'))
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '12px' } },
      'Searches no page targets yet that fall in a topic one of your pages already covers. A new page here could end up competing with that one.'
    ),
    cardList(ctx, cards, { first: 6, emptyText: 'No planned keyword overlaps a page you already have.' })
  );
}

function cannibalizationPage(el, ctx, data, nav) {
  const { h, fmt } = ctx;
  const items = data.items ?? [];
  const conflicts = data.clusterConflicts ?? [];
  const falseAlarms = items.filter((it) => it.likelyFalseAlarm).length;
  ctx.mount(
    el,
    head(ctx, 'cannibalization', data, nav, {
      note: rangeNote(ctx, data),
      tiles: [
        {
          label: 'Searches to decide',
          value: countText(data.count),
          warn: data.count > 0,
          note: 'split between our pages',
        },
        {
          label: 'Likely false alarms',
          value: fmt.num(falseAlarms),
          note: 'a pillar page and one of its own posts',
        },
        { label: 'Left alone', value: fmt.num(data.leftAlone?.length ?? 0), note: 'splits you chose to keep' },
        { label: 'May already be covered', value: fmt.num(conflicts.length), note: 'planned keywords, see below' },
      ],
    }),
    h(
      'section',
      { class: 'section ins-first' },
      cardList(
        ctx,
        items.map((it) => cannibalCard(ctx, it, data)),
        { first: 20, emptyText: 'No search is split between two of your pages right now.' }
      )
    ),
    leftAloneSection(ctx, data.leftAlone),
    conflictSection(ctx, conflicts, data)
  );
}

// ------------------------------------------------------------------ Runner-up keywords

function runnerUpPage(el, ctx, data, nav) {
  const { h, fmt } = ctx;
  const rows = runnerUpRows(data.items);
  const onTwo = pageTwoCount(rows);
  const push = (row) =>
    ctx.openDrawer(renderCard(row.opp, ctx, { onChange: reloadFrom(ctx) }), {
      title: data.term ?? 'Runner-up keywords',
    });
  const box = h('div', {});
  ctx.mount(
    el,
    head(ctx, 'runner-up', data, nav, {
      note: rangeNote(ctx, data),
      tiles: [
        { label: 'Searches just off the top', value: countText(data.count), note: 'open, not started or in progress' },
      ],
    }),
    h(
      'div',
      { class: 'ins-headline' },
      h('span', { class: 'chip chip-accent ins-big-chip' }, `${fmt.num(onTwo)} on page 2`),
      h(
        'p',
        {},
        `${fmt.plural(onTwo, 'search sits', 'searches sit')} on page two of Google, and ${fmt.plural(rows.length - onTwo, 'more sits', 'more sit')} low on page one. A small push on the page may move them up.`
      )
    ),
    h('section', { class: 'section ins-first' }, box)
  );
  dataTable(box, {
    label: 'Runner-up keywords',
    rows,
    rowKey: (r) => r.id,
    searchKeys: ['query', 'page'],
    sort: { key: 'impressions', dir: 'desc' },
    emptyText: 'No search sits just off page one right now.',
    onRowClick: push,
    columns: [
      { key: 'query', label: 'Keyword', wrap: true },
      {
        key: 'page',
        label: 'Page',
        wrap: true,
        format: (v) => (v ? pageLink(h, v) : h('span', { class: 'muted' }, 'none')),
      },
      { key: 'position', label: 'Place', align: 'right', format: (v) => fmt.position(v) },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v) },
      {
        key: 'id',
        label: '',
        sortable: false,
        format: (v, r) =>
          h(
            'button',
            { type: 'button', class: 'btn btn-small', 'aria-label': `Push "${r.query}"`, onclick: () => push(r) },
            'Push'
          ),
      },
    ],
  });
}

// ------------------------------------------------------------------ Secondary keywords

const secondaryPath = (id) => `/api/insights/secondary-keywords/${encodeURIComponent(id)}`;

function secondaryCard(ctx, it, data) {
  const { h } = ctx;
  const path = secondaryPath;
  const action = stripHypothesis(it.recommendation);
  const item = {
    id: it.id,
    typeLabel: 'Secondary keyword',
    explain: it.explain,
    title: 'Secondary keyword on a page you already have',
    measured: it.evidence,
    action,
    test: it.test,
    page: it.page,
    isPageEdit: true,
    eligibility: it.eligibility,
    item: it.state,
    links: { live: `${SITE}${it.page}` },
    brief: it.brief,
  };
  const adopt = async () => {
    const res = await postAction(ctx, path(it.id), { action: 'adopt' });
    if (!res) return;
    ctx.toast(
      `Adopted "${it.query}" as a secondary keyword of ${it.page}. It is not a target and does not count in the target position.`,
      'success'
    );
    await ctx.reload();
  };
  return renderCard(item, ctx, {
    priority: it.priority,
    priorityTitle: data.priorityNote,
    chips: [
      h('span', { class: 'chip', title: "The page's own target keyword" }, `Target: ${it.targetKeyword}`),
      it.adopted ? h('span', { class: 'chip chip-accent' }, 'Adopted as secondary') : null,
      frozenChip(h, it.frozenUntilText, it.page),
    ],
    endpoint: path,
    only: ['done', 'ignore', 'reopen'],
    ignoreAs: 'dismiss',
    noPinNote: true,
    extraActions: it.adopted || it.state?.status === 'ignored' ? [] : [{ label: 'Adopt as secondary', onClick: adopt }],
  });
}

// Searches marked done or dismissed, newest first, folded away like Left alone, so a mistaken Done
// (which froze the page and used the week's one edit) can be found and reopened.
function finishedSection(ctx, list) {
  const { h, fmt } = ctx;
  if (!list?.length) return null;
  const reopen = async (it, button) => {
    if (it.state?.status === 'done') {
      const ok = await ctx.confirmBox({
        title: 'Reopen this page change?',
        body: `${it.page} will no longer be frozen, and the desk will treat the change as not done. Only reopen it if the change never went live.`,
        confirmLabel: 'Reopen it',
      });
      if (!ok) return;
    }
    button.disabled = true;
    try {
      await ctx.api.post(secondaryPath(it.id), { action: 'reopen' });
      ctx.toast('Reopened. It is back in the list above.', 'success');
      await ctx.reload();
    } catch (err) {
      ctx.toast(err.message, 'error');
      if (button.isConnected) button.disabled = false;
    }
  };
  return h(
    'details',
    { class: 'section ins-fold' },
    h('summary', {}, `Done or dismissed (${list.length})`),
    h(
      'p',
      { class: 'small muted', style: { margin: '6px 0 10px' } },
      'Searches you marked done or dismissed, newest first. Reopen one you marked by mistake; reopening a done one ends its page freeze.'
    ),
    h(
      'ul',
      { class: 'side-list' },
      list.map((it) =>
        h(
          'li',
          { class: 'ins-left' },
          h(
            'div',
            {},
            h('strong', {}, it.query),
            h(
              'div',
              { class: 'small muted' },
              `${it.page}. ${
                it.state?.status === 'done'
                  ? `Done on ${fmt.date(it.state.doneAt ?? it.state.since)}.`
                  : `Dismissed on ${fmt.date(it.state?.since)}.`
              }`
            )
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn-small',
              'aria-label': `Reopen "${it.query}" on ${it.page}`,
              onclick: (e) => reopen(it, e.currentTarget),
            },
            'Reopen'
          )
        )
      )
    )
  );
}

function secondaryPage(el, ctx, data, nav) {
  const { fmt } = ctx;
  const items = data.items ?? [];
  const pages = new Set(items.map((it) => it.page)).size;
  ctx.mount(
    el,
    head(ctx, 'secondary-keywords', data, nav, {
      note: `${rangeNote(ctx, data) ?? ''} Adopting one records it as a secondary keyword of that page; it never becomes a target.`.trim(),
      tiles: [
        {
          label: 'Searches to work in',
          value: countText(data.count),
          note: `on ${fmt.plural(pages, 'page', 'pages')}`,
        },
        {
          label: 'Adopted as secondary',
          value: fmt.num(items.filter((it) => it.adopted).length),
          note: 'still open until the page is changed',
        },
      ],
    }),
    ctx.h(
      'section',
      { class: 'section ins-first' },
      cardList(
        ctx,
        items.map((it) => secondaryCard(ctx, it, data)),
        { first: 15, emptyText: 'No page is shown often for a search it does not target.' }
      )
    ),
    finishedSection(ctx, data.finished)
  );
}

// ------------------------------------------------------------------ Content gaps

function gapCard(ctx, g) {
  const { h, fmt } = ctx;
  const action = stripHypothesis(g.recommendation);
  const searches = h(
    'ul',
    { class: 'plain-list ins-searches' },
    (g.searches ?? []).map((s) =>
      h(
        'li',
        {},
        h('span', {}, s.query),
        h(
          'span',
          { class: 'num muted' },
          `shown ${fmt.plural(s.impressions, 'time', 'times')}, best place ${fmt.position(s.position)}`
        )
      )
    )
  );
  const linkFrom = g.linkFrom?.length
    ? h(
        'ul',
        { class: 'plain-list ins-searches' },
        g.linkFrom.map((l) =>
          h(
            'li',
            {},
            h('span', {}, pageLink(h, l.page), frozenChip(h, l.frozenUntilText, l.page)),
            l.reasonText ? h('span', { class: 'ins-reason' }, l.reasonText) : null
          )
        )
      )
    : h('span', { class: 'muted' }, 'No live page says these words, shows for these searches or covers the topic yet.');
  const item = {
    id: g.id,
    typeLabel: g.term ?? 'Content gaps',
    explain: g.explain,
    title: g.title,
    measured: null,
    action,
    test: g.test,
    page: null,
    isPageEdit: false,
    item: g.state,
    brief: g.brief,
  };
  return renderCard(item, ctx, {
    priority: g.priority,
    priorityTitle: 'Priority by how often these searches are shown, against the other gaps.',
    chips: [h('span', { class: 'chip', title: 'The words these searches share' }, `Topic: ${g.topic}`)],
    facts: [
      ['Why', g.why],
      ['Searches behind it', searches],
      ['Link to it from', linkFrom],
    ],
    endpoint: (id) => `/api/insights/content-gaps/${encodeURIComponent(id)}`,
    only: ONLY,
    ignoreLabel: 'Dismiss',
    noPinNote: true,
  });
}

function gapsPage(el, ctx, data, nav) {
  const { fmt } = ctx;
  const items = data.items ?? [];
  const shown = items.reduce((s, g) => s + (g.impressions ?? 0), 0);
  ctx.mount(
    el,
    head(ctx, 'content-gaps', data, nav, {
      note: `${rangeNote(ctx, data) ?? ''} Done, Snooze and Dismiss act on every search in the gap.`.trim(),
      tiles: [
        { label: 'Gaps', value: countText(data.count), note: 'topics with no page written for them' },
        { label: 'Times shown', value: fmt.num(shown), note: 'across the searches in these gaps' },
      ],
    }),
    ctx.h(
      'section',
      { class: 'section ins-first' },
      cardList(
        ctx,
        items.map((g) => gapCard(ctx, g)),
        { first: 20, emptyText: 'Every search you appear for has a page written for it.' }
      )
    )
  );
}

// ------------------------------------------------------------------ Decay

function decayCard(ctx, o, data) {
  const { h } = ctx;
  const action = stripHypothesis(o.recommendation) || o.action;
  return renderCard({ ...o, action }, ctx, {
    priority: o.priority,
    priorityTitle: data.priorityNote,
    chips: [
      h(
        'span',
        {
          class: `chip ${o.dropKind && o.dropKind !== 'unclear' ? 'chip-warn' : ''}`.trim(),
          title: o.dropKindLabel ?? '',
        },
        dropKindText(o.dropKind)
      ),
      o.recentDrop ? h('span', { class: 'chip chip-bad', title: data.recentDropNote ?? null }, 'Recent drop') : null,
    ],
    facts: o.dropKindWhy ? [['Kind of drop', o.dropKindWhy]] : [],
    only: ONLY,
    ignoreLabel: 'Dismiss',
    noPinNote: true,
  });
}

const DECAY_VIEWS = [
  { key: 'pages', label: 'Pages' },
  { key: 'queries', label: 'Searches' },
];
const DECAY_DIRS = [
  { key: 'decaying', label: 'Decaying' },
  { key: 'growing', label: 'Growing' },
];

function decayTables(ctx, data) {
  const { h, fmt, params } = ctx;
  let view = DECAY_VIEWS.some((v) => v.key === params.get('view')) ? params.get('view') : 'pages';
  let dir = DECAY_DIRS.some((d) => d.key === params.get('dir')) ? params.get('dir') : 'decaying';
  const tabs = h('div', { class: 'ins-tabs' });
  const box = h('div', {});
  const draw = () => {
    const group = (list, current, set, label) =>
      h(
        'div',
        { class: 'tabs', role: 'group', 'aria-label': label },
        list.map((t) =>
          h(
            'button',
            {
              type: 'button',
              class: 'tab',
              'aria-pressed': String(t.key === current),
              onclick: () => {
                set(t.key);
                ctx.setParams({ view: view === 'pages' ? null : view, dir: dir === 'decaying' ? null : dir });
                draw();
              },
            },
            t.label,
            h(
              'span',
              { class: 'count' },
              // The true number of rows (the lists stop at 50), from the server.
              fmt.num(
                label === 'Pages or searches'
                  ? (data.totals?.[t.key]?.[dir] ?? data[t.key]?.[dir]?.length ?? 0)
                  : (data.totals?.[view]?.[t.key] ?? data[view]?.[t.key]?.length ?? 0)
              )
            )
          )
        )
      );
    tabs.replaceChildren(
      group(DECAY_VIEWS, view, (k) => (view = k), 'Pages or searches'),
      group(DECAY_DIRS, dir, (k) => (dir = k), 'Decaying or growing')
    );
    const key = view === 'pages' ? 'page' : 'query';
    const columns = [
      {
        key,
        label: view === 'pages' ? 'Page' : 'Search',
        wrap: true,
        format: (v) => (view === 'pages' ? pageLink(h, v) : v),
      },
      { key: 'impressions', label: 'Times shown', align: 'right', format: (v) => fmt.num(v), title: 'Last 28 days' },
      { key: 'prevImpressions', label: 'The 28 days before', align: 'right', format: (v) => fmt.num(v) },
      { key: 'change', label: 'Change', align: 'right', format: (v) => fmt.change(v) },
      { key: 'position', label: 'Place', align: 'right', format: (v) => fmt.position(v) },
    ];
    if (view === 'pages' && dir === 'decaying') {
      columns.push({
        key: 'dropKind',
        label: 'Kind of drop',
        wrap: true,
        format: (v, r) =>
          h(
            'span',
            { class: 'row' },
            h('span', { class: 'chip', title: r.dropKindWhy ?? '' }, dropKindText(v)),
            r.recentDrop
              ? h('span', { class: 'chip chip-bad', title: data.recentDropNote ?? null }, 'Recent drop')
              : null
          ),
      });
    }
    const table = h('div', {});
    const shown = data.shownText?.[view]?.[dir] ?? null;
    box.replaceChildren(
      ...[table, shown ? h('p', { class: 'small muted', style: { marginTop: '8px' } }, shown) : null].filter(Boolean)
    );
    dataTable(table, {
      label: `${dir === 'decaying' ? 'Decaying' : 'Growing'} ${view === 'pages' ? 'pages' : 'searches'}`,
      rows: data[view]?.[dir] ?? [],
      columns,
      searchKeys: [key],
      emptyText: dir === 'decaying' ? 'Nothing is being shown much less than before.' : 'Nothing is growing yet.',
    });
  };
  draw();
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Every page and search, last 28 days against the 28 before'),
      h('span', { class: 'section-note' }, data.note ?? '')
    ),
    tabs,
    box
  );
}

function decayPage(el, ctx, data, nav) {
  const { fmt } = ctx;
  const items = data.items ?? [];
  ctx.mount(
    el,
    head(ctx, 'decay', data, nav, {
      note: 'Each card names the kind of drop the numbers point to, as a hypothesis, with the fix that goes with it.',
      tiles: [
        { label: 'Pages to look at', value: countText(data.count), warn: data.count > 0, note: 'open decay cards' },
        {
          label: 'Recent drops',
          value: fmt.num(items.filter((o) => o.recentDrop).length),
          note: 'in the last 14 days',
        },
        {
          label: 'Pages decaying',
          value: fmt.num(data.totals?.pages?.decaying ?? data.pages?.decaying?.length ?? 0),
          note: 'last 28 days',
        },
        {
          label: 'Pages growing',
          value: fmt.num(data.totals?.pages?.growing ?? data.pages?.growing?.length ?? 0),
          note: 'last 28 days',
        },
      ],
    }),
    ctx.h(
      'section',
      { class: 'section ins-first' },
      cardList(
        ctx,
        items.map((o) => decayCard(ctx, o, data)),
        { first: 12, emptyText: 'No page has lost enough views to look at.' }
      )
    ),
    decayTables(ctx, data)
  );
}
