// This week: the Monday page. Since you last looked, the tiles, the worries (with the pages only
// being watched folded under them), the priorities (at most three or five, from Settings, and never
// padded; each says why it is there; reorder, remove, swap in, lock, copy, save as a PDF through
// #/print/week), with the line saying this week's page edit is used above them when it is, the
// biggest opportunities, the pages to leave alone this week, what is waiting, and past weeks.

import { renderCard } from './card.js';

// "Since you last looked" compares with the previous visit. The visit is recorded once per
// page load, after the first draw, and the first answer is kept so later redraws (after a
// button press) do not start comparing with the visit just recorded.
let visitRecorded = false;
let firstSince = null;

const SLOT_NOTE = {
  broken: 'Broken',
  'new-post': 'New post',
  'page-edit': 'Live page change',
  verdict: 'Verdict',
  worry: 'Worry',
  other: 'Next best',
};

export async function render(el, ctx) {
  const { api, h, fmt } = ctx;
  const week = await api.get('/api/week');
  ctx.envelope(week);
  if (firstSince === null) firstSince = week.sinceLastVisit;

  const ids = week.top5.map((c) => c.id);
  const locked = week.locked;

  // The server refuses a page edit card on a frozen page, a page git shows edited lately, or a second
  // page edit this week (409, with the reasons). The founder is asked once, and a yes sends override.
  async function saveFive(next, message, { override = false } = {}) {
    if (locked) {
      ctx.toast("This week's plan is locked. Unlock it to change this week's priorities.", 'error');
      return;
    }
    try {
      await api.post('/api/week/top5', { ids: next, ...(override ? { override: true } : {}) });
    } catch (e) {
      const held = e.status === 409 && (e.data?.frozen || e.data?.recentlyEdited || e.data?.secondThisWeek);
      if (!held || override) throw e;
      const ok = await ctx.confirmBox({
        title: 'This page should be left alone',
        body: e.message,
        confirmLabel: 'Add it anyway',
        danger: true,
      });
      if (!ok) return;
      await api.post('/api/week/top5', { ids: next, override: true });
    }
    ctx.toast(message, 'success');
    await ctx.reload();
  }

  // Adds a card to the five: appends when there is room, otherwise asks which to replace.
  // The server refuses a second live page change in the five; its plain message shows as a toast.
  // A page git shows edited lately (no card, plan row or note recorded it) asks first, the same second
  // confirm a frozen page gets on Done. `recent` is the card's eligibility.recentEdit, when it has one.
  async function swapIn(cardId, title, anchor, recent = null) {
    if (ids.includes(cardId)) {
      ctx.toast("It is already in this week's priorities.");
      return;
    }
    if (recent) {
      const ok = await ctx.confirmBox({
        title: 'This page was edited lately',
        body: `${recent.page}: ${recent.text}.\n\nA new change now muddies the verdict on that edit.`,
        confirmLabel: 'Add it anyway',
        danger: true,
      });
      if (!ok) return;
    }
    // A yes to the question above is the override the server asks for.
    const save = (next, message) =>
      saveFive(next, message, { override: Boolean(recent) }).catch((e) => ctx.toast(e.message, 'error'));
    if (ids.length < 5) return save([...ids, cardId], `Added to this week: ${title}`);
    ctx.menu(
      anchor,
      week.top5.map((c, i) => ({
        label: `Replace ${i + 1}: ${c.title.length > 48 ? `${c.title.slice(0, 46)}...` : c.title}`,
        onSelect: () =>
          save(
            ids.map((x, j) => (j === i ? cardId : x)),
            `Swapped in: ${title}`
          ),
      }))
    );
  }

  const openOpps = week.counts?.openOpportunities ?? week.opportunities.length;
  const doneCount = week.top5.filter((c) => c.state?.status === 'done').length;
  const nextVerdict = week.nextVerdict ?? null;
  const worryCounts = week.counts?.worries ?? { total: week.worries.length, needLook: week.worries.length, waiting: 0 };
  const watchingCount = (week.watching ?? []).length;

  ctx.mount(
    el,
    head(week, ctx, locked),
    week.empty
      ? h(
          'p',
          { class: 'banner banner-warn' },
          'No data has been pulled yet. Press Refresh now at the top, and this page fills in when the pull finishes.'
        )
      : null,
    week.warnings?.length ? h('p', { class: 'banner banner-warn' }, week.warnings.join(' ')) : null,
    h(
      'section',
      { class: 'section', style: { marginTop: '8px' } },
      h('h2', { class: 'section-title', style: { marginBottom: '10px' } }, 'Since you last looked'),
      h(
        'ul',
        { class: 'since' },
        firstSince.map((s) => h('li', {}, s))
      )
    ),
    h(
      'section',
      { class: 'section', 'aria-label': 'This week in numbers' },
      h(
        'div',
        { class: 'tiles' },
        tile(h, 'Done this week', `${doneCount} of ${week.top5.length}`, "of this week's priorities"),
        // The tile is a button: it takes you to the worries, which sit right under these tiles.
        h(
          'button',
          {
            type: 'button',
            class: 'tile',
            title: 'Show the worries',
            onclick: () =>
              document.getElementById('week-worries')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          },
          h('span', { class: 'tile-label' }, 'Worries'),
          h('span', { class: 'tile-value' }, fmt.num(worryCounts.total)),
          h('div', { class: 'tile-change' }, worryTileNote(worryCounts.total, watchingCount, fmt))
        ),
        tile(
          h,
          'Open opportunities',
          fmt.num(openOpps),
          openOpps ? 'not started, in progress or back again' : 'nothing open right now'
        ),
        tile(
          h,
          'Next verdict',
          nextVerdict ? nextVerdict.dateText : 'none set',
          nextVerdict ? nextVerdict.note : 'no change is waiting to be judged',
          true
        )
      )
    ),
    // The page's order: the priorities, then what only the founder can do, then the worries (the
    // Worries tile jumps there), then everything else.
    topFive(week, ctx, { ids, locked, saveFive }),
    blocked(week, ctx, { locked, swapIn }),
    worries(week, ctx, { locked, swapIn }),
    h(
      'div',
      { class: 'cols' },
      h('div', {}, biggest(week, ctx, { locked, swapIn })),
      h('div', {}, leaveAlone(week, ctx), waiting(week, ctx))
    ),
    pastWeeks(week, ctx)
  );

  if (!visitRecorded) {
    visitRecorded = true;
    // After the page is on screen (the shell inserts it once render resolves).
    setTimeout(() => api.post('/api/visit').catch(() => {}), 0);
  }
}

// The git edit on a card's eligibility, with its words, for the swap-in confirm; null otherwise.
const recentOf = (e) => (e?.recentEdit ? { page: e.recentEdit.page, text: e.text } : null);

function tile(h, label, value, change, isText = false) {
  return h(
    'div',
    { class: 'tile' },
    h('span', { class: 'tile-label' }, label),
    h('span', { class: `tile-value${isText ? ' is-text' : ''}` }, value),
    h('div', { class: 'tile-change' }, change)
  );
}

function planText(week, ctx) {
  const lines = [`SEO plan for the ${week.weekLabel.replace(/^Week/, 'week')}`];
  if (week.through) lines[0] += ` (data through ${ctx.fmt.date(week.through)})`;
  lines.push('');
  if (week.editStatus) lines.push(week.editStatus, '');
  for (const line of week.statusLines ?? []) lines.push(line, '');
  week.top5.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.title}`);
    if (c.why) lines.push(`   Why this week: ${c.why}`);
    if (c.action) lines.push(`   Do: ${c.action}`);
    if (c.test) lines.push(`   How we will know: ${c.test}`);
    if (c.state?.status && c.state.status !== 'new') lines.push(`   Status: ${c.state.status.replace('-', ' ')}`);
  });
  return lines.join('\n');
}

function head(week, ctx, locked) {
  const { h, fmt, api, confirmBox, toast } = ctx;
  const source =
    week.top5Source === 'locked'
      ? `Locked${week.lockedAt ? ` on ${fmt.date(week.lockedAt.slice(0, 10))}` : ''}.`
      : week.top5Source === 'chosen'
        ? 'You chose these.'
        : 'The desk proposed these. Reorder, remove or swap them, then lock the plan.';

  const lock = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-primary',
      onclick: async (e) => {
        const ok = await confirmBox({
          title: "Lock this week's plan?",
          body: `This saves the priorities below as the plan of record for the ${week.weekLabel.toLowerCase()}. Past weeks keep it with what got done. You can unlock it later.`,
          confirmLabel: 'Lock the plan',
        });
        if (!ok) return;
        e.target.disabled = true;
        try {
          await api.post('/api/week/lock');
          toast("This week's plan is locked.", 'success');
          await ctx.reload();
        } catch (err) {
          toast(err.message, 'error');
          e.target.disabled = false;
        }
      },
    },
    "Lock this week's plan"
  );
  const unlock = h(
    'button',
    {
      type: 'button',
      class: 'btn',
      onclick: async () => {
        try {
          await api.post('/api/week/unlock');
          toast("Unlocked. You can change this week's priorities again.", 'success');
          await ctx.reload();
        } catch (err) {
          toast(err.message, 'error');
        }
      },
    },
    'Unlock'
  );
  const copy = h(
    'button',
    {
      type: 'button',
      class: 'btn',
      onclick: async () => {
        const ok = await ctx.copyText(planText(week, ctx));
        toast(
          ok ? 'Plan copied as plain text.' : 'The browser blocked copying. Click the page once, then try again.',
          ok ? 'success' : 'error'
        );
      },
    },
    'Copy plan'
  );
  return h(
    'div',
    { class: 'page-head' },
    h(
      'div',
      {},
      h('h1', { class: 'page-title' }, week.weekLabel),
      h(
        'p',
        { class: 'page-sub' },
        week.range ? `Numbers cover ${fmt.range(week.range)}. ` : '',
        week.through ? `Search Console data runs through ${fmt.date(week.through)}.` : ''
      ),
      h('p', { class: 'page-sub', style: { marginTop: '2px' } }, source)
    ),
    h(
      'div',
      { class: 'row' },
      locked ? unlock : lock,
      copy,
      h('a', { class: 'btn', href: '#/print/week' }, 'Save the plan as a PDF')
    )
  );
}

// ------------------------------------------------------------------ the five

function topFive(week, ctx, { ids, locked, saveFive }) {
  const { h } = ctx;
  const list = h('ol', { class: 'ledger' });
  let dragFrom = null;

  const move = (from, to) => {
    if (to < 0 || to >= ids.length || from === to) return;
    const next = [...ids];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    return saveFive(next, 'Order saved.').catch((e) => ctx.toast(e.message, 'error'));
  };

  week.top5.forEach((card, i) => {
    const li = h('li', { dataset: { index: i } });
    const rank = h(
      'div',
      { class: 'rank' },
      h('span', { class: 'rank-num', 'aria-label': `Priority ${i + 1}` }, String(i + 1)),
      h('span', { class: 'rank-slot' }, SLOT_NOTE[card.slot] ?? '')
    );
    if (!locked) {
      const handle = h(
        'button',
        {
          type: 'button',
          class: 'handle',
          title: 'Drag to reorder',
          'aria-label': `Drag to reorder priority ${i + 1}`,
        },
        '≡'
      );
      handle.addEventListener('pointerdown', () => (li.draggable = true));
      handle.addEventListener('pointerup', () => (li.draggable = false));
      rank.append(
        handle,
        h(
          'div',
          { class: 'row', style: { gap: '0' } },
          h(
            'button',
            {
              type: 'button',
              class: 'icon-btn',
              'aria-label': `Move priority ${i + 1} up`,
              title: 'Move up',
              disabled: i === 0,
              onclick: () => move(i, i - 1),
            },
            '↑'
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'icon-btn',
              'aria-label': `Move priority ${i + 1} down`,
              title: 'Move down',
              disabled: i === week.top5.length - 1,
              onclick: () => move(i, i + 1),
            },
            '↓'
          )
        )
      );
      li.addEventListener('dragstart', (e) => {
        dragFrom = i;
        li.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(i));
      });
      li.addEventListener('dragend', () => {
        li.draggable = false;
        li.classList.remove('is-dragging');
        for (const x of list.children) x.classList.remove('is-drop-target');
      });
      li.addEventListener('dragover', (e) => {
        if (dragFrom === null) return;
        e.preventDefault();
        li.classList.add('is-drop-target');
      });
      li.addEventListener('dragleave', () => li.classList.remove('is-drop-target'));
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = dragFrom;
        dragFrom = null;
        if (from !== null) move(from, i);
      });
    }
    const extra = locked
      ? []
      : [
          {
            label: 'Remove from this week',
            onClick: () =>
              saveFive(
                ids.filter((x) => x !== card.id),
                ids.length === 1
                  ? 'Removed. With no cards left, the desk proposes the priorities again.'
                  : "Removed from this week's priorities. Swap another one in from Biggest opportunities."
              ),
          },
        ];
    li.append(rank, renderCard(card, ctx, { extraActions: extra }));
    list.append(li);
  });

  const reset =
    week.top5Source === 'chosen' && !locked
      ? h(
          'button',
          {
            type: 'button',
            class: 'btn btn-quiet btn-small',
            onclick: () => saveFive([], 'Back to the desk proposal.').catch((e) => ctx.toast(e.message, 'error')),
          },
          "Use the desk's proposal again"
        )
      : null;

  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, `This week's priorities (${week.top5.length})`),
      h(
        'span',
        { class: 'section-note' },
        locked
          ? "Locked. Unlock the plan to change this week's priorities."
          : 'Drag the handle or use the arrows to reorder. ',
        reset
      )
    ),
    // Once this week's page edit is used, one line says so (and when the next can go in) instead of a card.
    week.editStatus ? h('p', { class: 'section-note', style: { margin: '0 0 10px' } }, week.editStatus) : null,
    ...(week.statusLines ?? []).map((line) => h('p', { class: 'section-note', style: { margin: '0 0 10px' } }, line)),
    week.top5.length
      ? list
      : h(
          'p',
          { class: 'empty' },
          week.empty
            ? 'Nothing to propose yet. The priorities appear once the data and the plan file are read.'
            : 'Nothing else needs doing this week. The desk lists only what passes the bar, and never pads the list.'
        )
  );
}

// ------------------------------------------------------------------ the lists beside it

function biggest(week, ctx, { locked, swapIn }) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section' },
    h(
      'div',
      { class: 'section-head' },
      h('h2', { class: 'section-title' }, 'Biggest opportunities'),
      h('a', { href: '#/opportunities', class: 'btn btn-quiet btn-small' }, 'See all opportunities')
    ),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '10px' } },
      "The next ten by score that are not in this week's priorities, the ones you can work on now first. Live page changes say when they can be edited."
    ),
    week.opportunities.length
      ? h(
          'div',
          {},
          week.opportunities.map((o) =>
            renderCard(o, ctx, {
              variant: 'row',
              // An item on a page that may not be edited now is never pushed: no Swap in.
              rowActions:
                locked || o.held
                  ? []
                  : [
                      {
                        label: 'Swap in',
                        onClick: (e) => swapIn(`opp:${o.id}`, o.title, e.currentTarget, recentOf(o.eligibility)),
                      },
                    ],
            })
          )
        )
      : h('p', { class: 'empty' }, 'No open opportunities right now.')
  );
}

function sideHead(h, title, note) {
  return h(
    'div',
    { class: 'section-head', style: { marginBottom: note ? '4px' : '10px' } },
    h('h2', { class: 'section-title' }, title),
    note ? h('span', { class: 'section-note' }, note) : null
  );
}

// The line under the Worries number: what the number means, and how many pages are only being watched.
export function worryTileNote(total, watching, fmt) {
  const lead = total
    ? total === 1
      ? 'needs a look this week'
      : 'need a look this week'
    : 'nothing needs you this week';
  if (!watching) return lead;
  return `${lead}; ${fmt.num(watching)} more ${watching === 1 ? 'is' : 'are'} only being watched`;
}

// A worry is something that needs a look this week. It sits right under the tiles, with what
// happened and what to do. Pages that slipped but need nothing yet are folded under "Watching".
function worries(week, ctx, { locked, swapIn }) {
  const { h, openDrawer, closeDrawer } = ctx;
  const items = week.worries;
  const watched = week.watching ?? [];
  const details = (w, title) => () =>
    openDrawer(
      renderCard(w, ctx, {
        onChange: async () => {
          closeDrawer();
          await ctx.reload();
        },
      }),
      { title }
    );
  return h(
    'section',
    { class: 'section', id: 'week-worries' },
    sideHead(
      h,
      'Worries',
      items.length ? `${items.length} ${items.length === 1 ? 'needs' : 'need'} a look this week` : null
    ),
    items.length
      ? h(
          'ul',
          { class: 'side-list' },
          items.map((w) =>
            h(
              'li',
              { class: 'worry' },
              h('div', { style: { fontWeight: 600, overflowWrap: 'anywhere' } }, w.title),
              h('p', { class: 'item-row-line' }, w.measured),
              w.fix ? h('p', { class: 'item-row-line' }, h('strong', {}, 'What to do: '), w.fix) : null,
              w.editWhen ? h('p', { class: 'item-row-line' }, h('strong', {}, 'Page edits: '), `${w.editWhen}.`) : null,
              h(
                'div',
                { class: 'row', style: { marginTop: '8px' } },
                h(
                  'button',
                  { type: 'button', class: 'btn btn-small', onclick: details(w, 'Worry') },
                  'Details and buttons'
                ),
                locked || w.held
                  ? null
                  : h(
                      'button',
                      {
                        type: 'button',
                        class: 'btn btn-quiet btn-small',
                        onclick: (e) => swapIn(w.id, w.title, e.currentTarget, recentOf(w.eligibility)),
                      },
                      'Add to this week'
                    )
              )
            )
          )
        )
      : h(
          'p',
          { class: 'empty' },
          'Nothing needs you this week. Nothing has broken or got worse in a way you can act on.'
        ),
    watched.length
      ? h(
          'details',
          { style: { marginTop: '12px' } },
          h(
            'summary',
            {},
            `Watching, nothing to do yet (${watched.length}): pages that slipped but are best left alone for now`
          ),
          h(
            'ul',
            { class: 'side-list', style: { marginTop: '8px' } },
            watched.map((w) =>
              h(
                'li',
                {},
                h('div', { style: { fontWeight: 600, overflowWrap: 'anywhere' } }, w.title),
                h('p', { class: 'item-row-line' }, h('strong', {}, 'Why nothing to do: '), w.watch),
                h('p', { class: 'item-row-line' }, w.measured),
                w.editWhen
                  ? h('p', { class: 'item-row-line' }, h('strong', {}, 'Page edits: '), `${w.editWhen}.`)
                  : null,
                h(
                  'div',
                  { class: 'row', style: { marginTop: '8px' } },
                  w.leaveIt ? leaveItButton(w, ctx) : null,
                  h(
                    'button',
                    { type: 'button', class: 'btn btn-quiet btn-small', onclick: details(w, 'Watching') },
                    'Details'
                  )
                )
              )
            )
          )
        )
      : null
  );
}

// Leave it on a watched page: snoozes it until the date to look again. It records no page edit and
// freezes nothing, so this week's page edit stays free.
function leaveItButton(w, ctx) {
  const { h, api, toast } = ctx;
  return h(
    'button',
    {
      type: 'button',
      class: 'btn btn-primary btn-small',
      title: `Put it away until ${w.leaveIt.untilText}. No page edit is recorded and nothing is frozen.`,
      onclick: async (e) => {
        const button = e.currentTarget;
        button.disabled = true;
        try {
          await api.post(`/api/item/${encodeURIComponent(w.id)}`, { action: 'snooze', until: w.leaveIt.until });
          toast(`Left alone until ${w.leaveIt.untilText}. No page edit is recorded and nothing is frozen.`, 'success');
          await ctx.reload();
        } catch (err) {
          toast(err.message, 'error');
          if (document.contains(button)) button.disabled = false;
        }
      },
    },
    'Leave it'
  );
}

// Pages not to touch this week, each with its reason: pages with a logged edit, edits found in git, and
// pages of a split you marked leave alone. The same count, under the same name, as the Pages tile and
// Did it work, with what makes it up.
function leaveAlone(week, ctx) {
  const { h } = ctx;
  const list = week.leaveAlone ?? [];
  const summary = week.leaveAloneSummary ?? null;
  return h(
    'section',
    { class: 'section' },
    sideHead(h, summary?.name ?? 'Pages to leave alone', list.length ? `${list.length}` : null),
    summary?.text ? h('p', { class: 'section-note', style: { marginBottom: '8px' } }, `${summary.text}.`) : null,
    list.length
      ? h(
          'ul',
          { class: 'side-list' },
          list.map((x) =>
            h(
              'li',
              {},
              h(
                'a',
                {
                  href: `#/pages?page=${encodeURIComponent(x.page)}`,
                  style: { overflowWrap: 'anywhere', fontWeight: 600 },
                },
                x.page
              ),
              h('div', { class: 'small muted', style: { overflowWrap: 'anywhere' } }, x.reason)
            )
          )
        )
      : h('p', { class: 'empty' }, 'No page needs leaving alone this week.')
  );
}

function waiting(week, ctx) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section' },
    sideHead(h, 'Waiting'),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      'Nothing to do here. Shown so you know it is handled.'
    ),
    week.waiting.length
      ? h(
          'ul',
          { class: 'side-list' },
          week.waiting.map((w) =>
            h(
              'li',
              {},
              h('span', { class: 'side-date' }, w.dateText),
              h('div', { class: 'small', style: { overflowWrap: 'anywhere' } }, w.title)
            )
          )
        )
      : h('p', { class: 'empty' }, 'No verdicts or frozen pages are waiting.')
  );
}

function blocked(week, ctx, { locked, swapIn }) {
  const { h } = ctx;
  if (!week.blockedOnYou?.length) return null;
  return h(
    'section',
    { class: 'section' },
    sideHead(h, 'Waiting on you'),
    h(
      'p',
      { class: 'section-note', style: { marginBottom: '8px' } },
      'Open items from docs/seo/OPEN-WORK.md that need you.'
    ),
    h(
      'ul',
      { class: 'side-list' },
      week.blockedOnYou.map((b) =>
        h(
          'li',
          {},
          h('div', { style: { fontWeight: 600, overflowWrap: 'anywhere' } }, b.title.replace(/:\s*$/, '')),
          h('div', { class: 'small muted' }, b.section),
          locked
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  class: 'btn btn-quiet btn-small',
                  style: { marginLeft: '-8px' },
                  onclick: (e) => swapIn(b.id, b.title.replace(/:\s*$/, ''), e.currentTarget),
                },
                'Add to this week'
              )
        )
      )
    )
  );
}

function pastWeeks(week, ctx) {
  const { h } = ctx;
  return h(
    'section',
    { class: 'section' },
    sideHead(h, 'Past weeks'),
    week.pastWeeks.length
      ? week.pastWeeks.map((w) =>
          h(
            'details',
            { class: 'past' },
            h(
              'summary',
              {},
              `${w.weekLabel}: ${w.doneCount} of ${w.cards.length} done${w.locked ? '' : ' (not locked)'}`
            ),
            h(
              'ul',
              { class: 'side-list' },
              w.cards.map((c) =>
                h(
                  'li',
                  { class: 'row', style: { justifyContent: 'space-between' } },
                  h('span', { style: { overflowWrap: 'anywhere' } }, c.title),
                  h(
                    'span',
                    { class: `chip ${c.status === 'done' ? 'chip-accent' : ''}` },
                    c.status === 'done' ? 'Done' : c.status.replace('-', ' ')
                  )
                )
              )
            )
          )
        )
      : h('p', { class: 'empty' }, 'Past weeks show here once a week ends.')
  );
}
