// This week: the Monday page. Since you last looked, the priorities (three or five, from
// Settings; reorder, remove, swap in, lock, copy, save as a PDF through #/print/week), the biggest
// opportunities, worries, the pages to leave alone this week, what is waiting, and past weeks.

import { renderCard } from './card.js';

// "Since you last looked" compares with the previous visit. The visit is recorded once per
// page load, after the first draw, and the first answer is kept so later redraws (after a
// button press) do not start comparing with the visit just recorded.
let visitRecorded = false;
let firstSince = null;

const SLOT_NOTE = {
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

  async function saveFive(next, message) {
    if (locked) {
      ctx.toast("This week's plan is locked. Unlock it to change the five.", 'error');
      return;
    }
    await api.post('/api/week/top5', { ids: next });
    ctx.toast(message, 'success');
    await ctx.reload();
  }

  // Adds a card to the five: appends when there is room, otherwise asks which to replace.
  // The server refuses a second live page change in the five; its plain message shows as a toast.
  function swapIn(cardId, title, anchor) {
    if (ids.includes(cardId)) {
      ctx.toast("It is already in this week's five.");
      return;
    }
    const save = (next, message) => saveFive(next, message).catch((e) => ctx.toast(e.message, 'error'));
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
  const nextVerdict = week.waiting.find((w) => w.kind === 'verdict');

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
        tile(h, 'Worries', fmt.num(week.worries.length), week.worries.length ? 'need a look' : 'nothing is wrong'),
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
          nextVerdict ? nextVerdict.title.replace(/^Verdict on /, '') : 'no change is waiting to be judged',
          true
        )
      )
    ),
    topFive(week, ctx, { ids, locked, saveFive }),
    h(
      'div',
      { class: 'cols' },
      h('div', {}, biggest(week, ctx, { locked, swapIn })),
      h(
        'div',
        {},
        worries(week, ctx, { locked, swapIn }),
        leaveAlone(week, ctx),
        waiting(week, ctx),
        blocked(week, ctx, { locked, swapIn })
      )
    ),
    pastWeeks(week, ctx)
  );

  if (!visitRecorded) {
    visitRecorded = true;
    // After the page is on screen (the shell inserts it once render resolves).
    setTimeout(() => api.post('/api/visit').catch(() => {}), 0);
  }
}

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
  week.top5.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.title}`);
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
        ? 'You chose these five.'
        : 'The desk proposed these five. Reorder, remove or swap them, then lock the plan.';

  const lock = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-primary',
      onclick: async (e) => {
        const ok = await confirmBox({
          title: "Lock this week's plan?",
          body: `This saves the five below as the plan of record for the ${week.weekLabel.toLowerCase()}. Past weeks keep it with what got done. You can unlock it later.`,
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
          toast('Unlocked. You can change the five again.', 'success');
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
            label: 'Remove from the five',
            onClick: () =>
              saveFive(
                ids.filter((x) => x !== card.id),
                ids.length === 1
                  ? 'Removed. With no cards left, the desk proposes five again.'
                  : 'Removed from the five. Swap another one in from Biggest opportunities.'
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
      h('h2', { class: 'section-title' }, `Top ${week.top5.length || (week.planSize ?? 5)} this week`),
      h(
        'span',
        { class: 'section-note' },
        locked ? 'Locked. Unlock the plan to change the five.' : 'Drag the handle or use the arrows to reorder. ',
        reset
      )
    ),
    week.top5.length
      ? list
      : h('p', { class: 'empty' }, 'Nothing to propose yet. The five appear once the data and the plan file are read.')
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
      'The next ten by score that are not in the five. Live page changes say when the 28 day rule lets you edit them.'
    ),
    week.opportunities.length
      ? h(
          'div',
          {},
          week.opportunities.map((o) =>
            renderCard(o, ctx, {
              variant: 'row',
              rowActions: locked
                ? []
                : [{ label: 'Swap in', onClick: (e) => swapIn(`opp:${o.id}`, o.title, e.currentTarget) }],
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

function worries(week, ctx, { locked, swapIn }) {
  const { h, openDrawer, closeDrawer } = ctx;
  const items = week.worries;
  return h(
    'section',
    { class: 'section' },
    sideHead(h, 'Worries', items.length ? `${items.length} to look at` : null),
    items.length
      ? h(
          'ul',
          { class: 'side-list' },
          items.map((w) => {
            const details = () =>
              openDrawer(
                renderCard(w, ctx, {
                  onChange: async () => {
                    closeDrawer();
                    await ctx.reload();
                  },
                }),
                { title: 'Worry' }
              );
            return h(
              'li',
              { class: 'worry' },
              h('div', { style: { fontWeight: 600, overflowWrap: 'anywhere' } }, w.title),
              h('p', { class: 'item-row-line' }, w.measured),
              h(
                'div',
                { class: 'row', style: { marginTop: '8px' } },
                h('button', { type: 'button', class: 'btn btn-small', onclick: details }, 'Details and buttons'),
                locked
                  ? null
                  : h(
                      'button',
                      {
                        type: 'button',
                        class: 'btn btn-quiet btn-small',
                        onclick: (e) => swapIn(w.id, w.title, e.currentTarget),
                      },
                      'Add to this week'
                    )
              )
            );
          })
        )
      : h('p', { class: 'empty' }, 'Nothing has broken or got worse.')
  );
}

// Pages not to touch this week, each with its reason: frozen pages being measured, and pages of a
// split you marked leave alone.
function leaveAlone(week, ctx) {
  const { h } = ctx;
  const list = week.leaveAlone ?? [];
  return h(
    'section',
    { class: 'section' },
    sideHead(h, 'Leave these alone this week', list.length ? `${list.length}` : null),
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
