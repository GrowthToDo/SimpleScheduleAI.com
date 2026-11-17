// One card for every opportunity, week card and worry.
//
//   renderCard(item, ctx, options) -> HTMLElement
//
// item is any of the three API shapes: an Opp (from /api/opportunities or week.opportunities),
// a Card (week.top5) or a worry (week.worries). options:
//   variant       'full' (default) or 'row' (a compact line that opens into the full card)
//   oppById       optional Map of Opp id -> Opp; week cards and worries no longer need it
//                 (they carry their own score, typeLabel, test and brief)
//   extraActions  [{label, onClick, primary}] buttons the host page adds (Remove, Swap in)
//   selectable    {checked, onToggle(bool)} shows a checkbox (bulk actions)
//   onChange      called after a button changed the item; default ctx.reload()
//
// Options the insight pages use (views/insight.js):
//   priority      'high' | 'medium' | 'low': a priority badge before the type badge;
//                 priorityTitle is its hover line
//   chips         extra nodes after the type badge (a drop kind, a topic)
//   afterTitle    nodes under the title (share bars, a list of searches)
//   facts         extra [label, node] rows in the card's facts, before the recommendation
//   afterFacts    nodes after the facts (choice buttons)
//   endpoint      (id) => the POST address for the buttons; default /api/item/<id>
//   only          the actions to offer, from start, done, snooze, ignore, reopen (default all)
//   ignoreAs      'dismiss': the Ignore button reads Dismiss and sends {action: 'dismiss'} with no
//                 reason (the secondary keyword route); default Ignore with a reason
//   ignoreLabel   the words on the Ignore button (default Ignore); 'Dismiss' also makes its
//                 dialog and its message say Dismiss
//   noPinNote     true hides Pin to this week and Add note (routes that do not take them)
//   editPages     the pages a Done edits (default: the card's page when it is a page edit). The
//                 Done confirm names every one; an empty list says no page edit is recorded
//   donePick      [{label, page}]: Done first asks which page was changed (a menu); the chosen page
//                 is sent as `page` and named in the confirm, null sends no page
//
// From the item itself: `why` (a week card: why it is in this week's list) shows first in the facts,
// and `leaveIt` ({until, untilText}: a card whose own advice is to leave its page alone) makes Leave it
// the main button. Leave it snoozes the item until that date and records no page edit and no freeze;
// Done stays, not as the main button, and its confirm says it counts as this week's page edit.
//
// postAction(ctx, path, body) sends one action with the one-edit-a-week checks (post-action.js): a
// 409 with `frozen`, `frozenPages` or `secondThisWeek` asks again, plainly, then resends with
// override; any other refusal shows the server's sentence. Any page that marks a page edit done
// goes through it.

import { h as el } from '../app.js';
import { evidenceView } from './drawer.js';
import { postAction as sendAction, secondEditText, confirmSecondEdit, frozenBox } from './post-action.js';

const SLOT_LABEL = {
  broken: 'Broken',
  'new-post': 'New post',
  'page-edit': 'Live page change',
  verdict: 'Verdict',
  worry: 'Worry',
  other: 'Opportunity',
};

const WORRY_LABEL = {
  'dropped-from-index': 'Dropped from Google',
  'slipping-page': 'Decay',
  'verdict-worse': 'A change made things worse',
  'crawl-issue': 'Crawl problem',
  'registry-fail': 'Keyword check failed',
  'source-failed': 'Data source failed',
  'competitor-change': 'Competitor change',
};

// The Monday of this week, 'YYYY-MM-DD', on this computer's calendar like the server.
function thisMonday() {
  const d = new Date();
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(m.getDate()).padStart(2, '0')}`;
}

// Brings the three shapes to one.
export function normalize(item, oppById) {
  if (item.kind && item.fix !== undefined) {
    const opp = item.oppId ? oppById?.get(item.oppId) : null;
    return {
      kind: 'worry',
      id: item.id,
      label: WORRY_LABEL[item.kind] ?? 'Worry',
      explain: item.explain ?? null,
      chipClass: 'chip-bad',
      title: item.title,
      measured: item.measured,
      action: item.fix,
      actionLabel: 'Recommendation',
      test: item.test ?? opp?.test ?? null,
      page: item.page,
      isPageEdit: item.isPageEdit,
      eligibility: item.eligibility ?? opp?.eligibility ?? null,
      waitUntilText: item.waitUntilText ?? null,
      leaveIt: item.leaveIt ?? null,
      editWhen: item.editWhen ?? null,
      held: Boolean(item.held),
      opp,
      oppId: item.oppId ?? null,
      score: opp?.score ?? null,
      state: item.state,
      brief: item.brief ?? opp?.brief ?? null,
      links: item.links,
      note: null,
      competitor: item.competitor ?? null,
      upside: item.upside ?? opp?.upside ?? null,
    };
  }
  if (item.slot) {
    const opp = item.oppId ? oppById?.get(item.oppId) : null;
    return {
      kind: 'card',
      id: item.id,
      label: item.typeLabel ?? opp?.typeLabel ?? SLOT_LABEL[item.slot] ?? 'Card',
      explain: item.explain ?? opp?.explain ?? null,
      chipClass: item.slot === 'worry' ? 'chip-bad' : 'chip-accent',
      title: item.title,
      measured: item.measured,
      action: item.action,
      actionLabel: 'Recommendation',
      test: item.test,
      page: item.page,
      isPageEdit: item.isPageEdit,
      eligibility: item.eligibility,
      opp,
      oppId: item.oppId ?? null,
      score: item.score ?? opp?.score ?? null,
      source: item.source,
      state: item.state,
      brief: item.brief,
      links: item.links,
      note: item.note ?? null,
      why: item.why ?? null,
      leaveIt: item.leaveIt ?? null,
      hypothesis: item.hypothesis !== false,
      editPages: item.editPages ?? null,
      competitor: item.competitor ?? null,
      held: Boolean(item.held),
      upside: item.upside ?? opp?.upside ?? null,
    };
  }
  return {
    kind: 'opp',
    id: item.id,
    label: item.typeLabel ?? item.type,
    explain: item.explain ?? null,
    chipClass: 'chip-accent',
    title: item.title,
    measured: item.measured,
    action: item.action,
    actionLabel: 'Recommendation',
    test: item.test,
    page: item.page,
    isPageEdit: item.isPageEdit,
    eligibility: item.eligibility,
    opp: item,
    oppId: item.id,
    score: item.score ?? null,
    state: item.item ?? { status: item.status },
    brief: item.brief,
    links: item.links,
    note: item.detected === false ? 'The desk no longer finds this in the latest data.' : null,
    leaveIt: item.leaveIt ?? null,
    held: Boolean(item.held),
    upside: item.upside ?? null,
  };
}

function statusChip(state, fmt) {
  const s = state?.status ?? 'new';
  if (s === 'in-progress') return ['chip-accent', `Started ${fmt.dateShort(state.since)}`];
  if (s === 'snoozed') return ['chip', `Snoozed until ${fmt.dateShort(state.snoozeUntil)}`];
  if (s === 'done') return ['chip-accent', `Done on ${fmt.dateShort(state.doneAt ?? state.since)}`];
  if (s === 'ignored') return ['chip', state.reason ? `Ignored: ${state.reason}` : 'Ignored'];
  if (s === 'came-back') return ['chip-warn', 'Came back after it was done'];
  return null;
}

// The eligibility chip is about the one live-page edit a week and the 28-day freeze, so a card that
// edits no page (a setup task such as checking a page in Bing Webmaster Tools) shows none.
export const showsEligibility = (n) => Boolean(n?.eligibility) && n.isPageEdit !== false;

// The Hypothesis chip sits beside a recommendation. A card that only reports (a verdict is due) has
// none, and neither has a competitor change.
export const showsHypothesis = (n) => Boolean(n?.action) && !n.competitor && n.hypothesis !== false;

function chips(n, fmt) {
  const out = [];
  const st = statusChip(n.state, fmt);
  if (st) out.push(ctxChip(st[0], st[1]));
  if (n.state?.pinnedWeek && n.state.pinnedWeek >= thisMonday())
    out.push(ctxChip('chip-accent', 'Pinned to this week'));
  if (n.waitUntilText) out.push(ctxChip('chip-warn', `Leave alone until ${n.waitUntilText}`));
  if (showsEligibility(n)) {
    out.push(
      n.eligibility.eligible
        ? ctxChip('', n.eligibility.text ?? 'Can be edited now')
        : ctxChip('chip-warn', n.eligibility.text ?? `Leave it until ${fmt.date(n.eligibility.from)}`)
    );
  }
  return out;
}

// The line for smaller git edits on an eligible page ("Also touched on 9 November (3 lines)").
const touchedLine = (n) =>
  showsEligibility(n) && n.eligibility.touchedText
    ? el('p', { class: 'small muted', style: { margin: '4px 0 0' } }, `${n.eligibility.touchedText}.`)
    : null;

const ctxChip = (cls, text) => el('span', { class: `chip ${cls}`.trim() }, text);

// When the page may be edited (a worry's editWhen, the same words the page's own detail shows), unless
// the eligibility chip already says exactly that.
const editWhenLine = (n) =>
  n.editWhen && !(showsEligibility(n) && n.eligibility.text === n.editWhen)
    ? el('p', { class: 'small muted', style: { margin: '4px 0 0' } }, `${n.editWhen}.`)
    : null;

const PRIORITY_WORD = { high: 'High priority', medium: 'Medium priority', low: 'Low priority' };

// The priority badge: high is filled in the accent, medium is outlined in it, low is quiet.
// `title` is the server's sentence on how the priority was decided (the page never restates the rule).
export function priorityChip(h, priority, title = null) {
  return h('span', { class: `chip prio prio-${priority}`, title: title || null }, PRIORITY_WORD[priority] ?? priority);
}

// ------------------------------------------------------------------ the buttons

// The checks after an action live in post-action.js (no DOM, tested in node). They are re-exported
// here for the pages that already import them from this module.
export { secondEditText, confirmSecondEdit, frozenBox };

// Sends one action through the one-edit-a-week checks (see post-action.js).
export const postAction = (ctx, path, body) => sendAction(ctx, path, body);

const itemPath = (id) => `/api/item/${encodeURIComponent(id)}`;

const dismissing = (options) => options.ignoreAs === 'dismiss' || options.ignoreLabel === 'Dismiss';

async function runAction(n, ctx, options, action, extra = {}) {
  const { toast, fmt } = ctx;
  const path = (options.endpoint ?? itemPath)(n.id);
  const res = await postAction(ctx, path, { action, ...extra });
  if (res === null) return;
  const messages = {
    start: 'Marked as started. Press Done when the change is live.',
    done: n.competitor ? 'Marked as seen. It comes back if something new changes.' : 'Marked done.',
    snooze: `Snoozed until ${fmt.date(res?.item?.snoozeUntil ?? extra.until)}. It comes back on its own then.`,
    ignore: 'Ignored. It stays out of your lists until you reopen it.',
    dismiss: 'Dismissed. It stays out of this list until you reopen it.',
    reopen: 'Reopened. It is back in Needs attention.',
    note: 'Note added.',
    pin: "Pinned to this week. When the desk proposes this week's priorities, pinned items come first.",
    unpin: 'Unpinned.',
  };
  // A card that says Dismiss says it in its message too, whatever the route calls the action.
  let msg = action === 'ignore' && dismissing(options) ? messages.dismiss : messages[action];
  const freezes = res?.freezes ?? (res?.freeze ? [res.freeze] : []);
  if (freezes.length)
    msg += ` ${freezes.map((f) => f.page).join(' and ')} ${freezes.length === 1 ? 'is' : 'are'} frozen until ${freezes[0].untilText}.`;
  if (res?.reminder) msg += ` ${res.reminder}`;
  toast(msg, 'success');
  await (options.onChange ? options.onChange(action, res) : ctx.reload());
}

function guard(fn, ctx) {
  return async (e) => {
    const button = e?.currentTarget;
    if (button) button.disabled = true;
    try {
      await fn(e);
    } catch (err) {
      ctx.toast(err.message, 'error');
    } finally {
      if (button && document.contains(button)) button.disabled = false;
    }
  };
}

// The pages a Done edits: the card's own list when it has one (a split search), else its page.
const donePagesOf = (n, options) =>
  options.editPages ?? n.opp?.editPages ?? n.editPages ?? (n.isPageEdit && n.page ? [n.page] : []);

// The confirm before Done: it names every page the Done edits, or says no page edit is recorded.
// weekEdit: true adds that the Done counts as this week's one page edit (a card whose own advice is to
// leave the page alone, where Leave it is the main button).
export function doneConfirmText(pages, { frozenUntil, verdictAbout, isPageEdit = true, weekEdit = false }) {
  if (!pages.length) {
    return {
      title: 'Mark this done?',
      body: isPageEdit
        ? 'This records no page edit, so no page is frozen and this week’s one page edit is not used.'
        : 'This changes no live page, so nothing is frozen.',
      confirmLabel: 'Yes, mark it done',
    };
  }
  const one = pages.length === 1;
  const list = one ? pages[0] : `${pages.slice(0, -1).join(', ')} and ${pages[pages.length - 1]}`;
  return {
    title: one ? 'Mark this page change done?' : `Mark this change to ${pages.length} pages done?`,
    body:
      `This records today as the day ${list} changed.\n\n` +
      `${one ? 'The page is' : 'Each of these pages is'} then frozen for 28 days, until ${frozenUntil}, so no other change goes on ${one ? 'it' : 'them'}. ` +
      `${one ? 'Its' : 'Their'} before and after verdict is scheduled for about ${verdictAbout}.\n\n` +
      (weekEdit
        ? "This counts as this week's one page edit. To leave the page alone instead, press Leave it.\n\n"
        : '') +
      'Only press this once the change is live on the site.',
    confirmLabel: 'Yes, mark it done',
  };
}

async function doDone(n, ctx, options, anchor = null, picked = undefined) {
  const { fmt, confirmBox } = ctx;
  // Some cards first ask which page was changed (Differentiate on a split search).
  if (options.donePick && picked === undefined && anchor) {
    ctx.menu(
      anchor,
      options.donePick.map((p) => ({
        label: p.label,
        onSelect: guard(() => doDone(n, ctx, options, anchor, p.page), ctx),
      }))
    );
    return;
  }
  const pages = picked !== undefined ? (picked ? [picked] : []) : donePagesOf(n, options);
  const asks = n.isPageEdit || options.editPages || n.editPages || n.opp?.editPages || options.donePick;
  if (asks) {
    const ok = await confirmBox(
      doneConfirmText(pages, {
        frozenUntil: fmt.date(fmt.isoPlus(28)),
        verdictAbout: fmt.date(fmt.isoPlus(30)),
        isPageEdit: Boolean(n.isPageEdit),
        weekEdit: Boolean(n.leaveIt),
      })
    );
    if (!ok) return;
  }
  await runAction(n, ctx, options, 'done', picked ? { page: picked } : {});
}

// Leave it: snoozes the item until its look-again date. It records no page edit and freezes nothing.
async function doLeave(n, ctx, options) {
  const res = await postAction(ctx, (options.endpoint ?? itemPath)(n.id), { action: 'snooze', until: n.leaveIt.until });
  if (res === null) return;
  ctx.toast(
    `Left alone until ${n.leaveIt.untilText}. No page edit is recorded and nothing is frozen. It comes back on its own then.`,
    'success'
  );
  await (options.onChange ? options.onChange('snooze', res) : ctx.reload());
}

// Reopening a finished page change ends its freeze, so the page asks first.
async function doReopen(n, ctx, options) {
  if (n.state?.status === 'done' && n.isPageEdit) {
    const ok = await ctx.confirmBox({
      title: 'Reopen this page change?',
      body: `${n.page ?? 'The page'} will no longer be frozen, and the desk will treat the change as not done. Only reopen it if the change never went live.`,
      confirmLabel: 'Reopen it',
    });
    if (!ok) return;
  }
  await runAction(n, ctx, options, 'reopen');
}

async function doIgnore(n, ctx, options) {
  if (options.ignoreAs === 'dismiss') return runAction(n, ctx, options, 'dismiss');
  // A card whose button says Dismiss uses the same word in its question.
  const word = dismissing(options) ? 'Dismiss' : 'Ignore';
  const reason = await ctx.promptBox({
    title: `${word} this item?`,
    body: `It leaves your lists and stays ${word === 'Dismiss' ? 'dismissed' : 'ignored'}, even when the data changes. A short reason helps you remember why.`,
    label: 'Reason',
    placeholder: 'For example: this page answers a different need',
    confirmLabel: `${word} it`,
  });
  if (reason) await runAction(n, ctx, options, 'ignore', { reason });
}

async function doNote(n, ctx, options) {
  const text = await ctx.promptBox({
    title: 'Add a note',
    label: 'Note',
    type: 'textarea',
    placeholder: 'What you did, decided or want to remember',
    confirmLabel: 'Add note',
  });
  if (text) await runAction(n, ctx, options, 'note', { text });
}

function snoozeMenu(n, ctx, options, anchor) {
  const { fmt, menu, promptBox } = ctx;
  const weeks = (w) => ({
    label: `${w} ${w === 1 ? 'week' : 'weeks'} (until ${fmt.dateShort(fmt.isoPlus(w * 7))})`,
    onSelect: guard(() => runAction(n, ctx, options, 'snooze', { until: fmt.isoPlus(w * 7) }), ctx),
  });
  menu(anchor, [
    weeks(1),
    weeks(2),
    weeks(4),
    {
      label: 'Pick a date...',
      onSelect: guard(async () => {
        const until = await promptBox({
          title: 'Snooze until',
          body: 'The item comes back to Needs attention on this date.',
          type: 'date',
          min: fmt.isoPlus(1),
          value: fmt.isoPlus(14),
          confirmLabel: 'Snooze',
        });
        if (until) await runAction(n, ctx, options, 'snooze', { until });
      }, ctx),
    },
  ]);
}

// The desk never changes the site, so the work on a card starts with its brief: copied here, pasted
// into Claude Code. On a card not started yet (and not one to leave alone, held or finished) Copy
// brief for Claude is the main button; once started, Done is.
export function briefIsMain(n, options = {}) {
  const s = n?.state?.status ?? 'new';
  if (!n?.brief || n.competitor || n.held) return false;
  if (options.only && !options.only.includes('start')) return false;
  const leave = Boolean(n.leaveIt) && s !== 'done' && s !== 'ignored' && s !== 'snoozed';
  return !leave && (s === 'new' || s === 'came-back');
}

export const BRIEF_HINT =
  'Copy the brief and paste it into Claude Code to do the work. The desk never changes the site itself.';

async function copyBrief(n, ctx) {
  const ok = await ctx.copyText(n.brief);
  ctx.toast(
    ok
      ? 'Brief copied. Paste it into Claude Code to start the work, then press Mark as started here.'
      : 'The browser blocked copying. Click the page once, then try again.',
    ok ? 'success' : 'error'
  );
}

function actionButtons(n, ctx, options) {
  const { h } = ctx;
  const s = n.state?.status ?? 'new';
  const btn = (label, fn, cls = '') =>
    h('button', { type: 'button', class: `btn btn-small ${cls}`.trim(), onclick: guard(fn, ctx) }, label);
  const out = [];
  const offer = (action) => !options.only || options.only.includes(action);
  // A competitor change is read, not worked on: Seen (it hides until something new changes) and Snooze.
  if (n.competitor) {
    if (s !== 'done' && s !== 'ignored') {
      out.push(btn('Seen', () => runAction(n, ctx, options, 'done'), 'btn-primary'));
      if (s !== 'snoozed') {
        const snooze = h(
          'button',
          { type: 'button', class: 'btn btn-small', 'aria-haspopup': 'menu' },
          'Snooze',
          h('span', { 'aria-hidden': 'true' }, ' ▾')
        );
        snooze.addEventListener('click', () => snoozeMenu(n, ctx, options, snooze));
        out.push(snooze);
      }
    }
    if (s !== 'new') out.push(btn('Reopen', () => doReopen(n, ctx, options)));
    return out;
  }
  // A card whose own advice is to leave the page alone: Leave it is the main button, and no other is.
  const leave = Boolean(n.leaveIt) && s !== 'done' && s !== 'ignored' && s !== 'snoozed';
  if (leave) out.push(btn('Leave it', () => doLeave(n, ctx, options), 'btn-primary'));
  // A held item (its page may not be edited now) is never pushed: no start and no main button.
  const briefMain = briefIsMain(n, options);
  if (briefMain) out.push(btn('Copy brief for Claude', () => copyBrief(n, ctx), 'btn-primary'));
  if ((s === 'new' || s === 'came-back') && offer('start') && !n.held)
    out.push(btn('Mark as started', () => runAction(n, ctx, options, 'start')));
  if (s !== 'done' && s !== 'ignored') {
    if (offer('done'))
      out.push(
        btn(
          'Done',
          (e) => doDone(n, ctx, options, e?.currentTarget ?? null),
          !leave && !n.held && !briefMain && (s === 'in-progress' || !offer('start')) ? 'btn-primary' : ''
        )
      );
    if (s !== 'snoozed' && offer('snooze')) {
      const snooze = h(
        'button',
        { type: 'button', class: 'btn btn-small', 'aria-haspopup': 'menu' },
        'Snooze',
        h('span', { 'aria-hidden': 'true' }, ' ▾')
      );
      snooze.addEventListener('click', () => snoozeMenu(n, ctx, options, snooze));
      out.push(snooze);
    }
    if (offer('ignore'))
      out.push(
        btn(options.ignoreLabel ?? (options.ignoreAs === 'dismiss' ? 'Dismiss' : 'Ignore'), () =>
          doIgnore(n, ctx, options)
        )
      );
  }
  if (s !== 'new' && offer('reopen')) out.push(btn('Reopen', () => doReopen(n, ctx, options)));
  for (const x of options.extraActions ?? []) out.push(btn(x.label, x.onClick, x.primary ? 'btn-primary' : ''));
  return out;
}

function linkButtons(n, ctx, options) {
  const { h } = ctx;
  const quiet = (label, fn) =>
    h('button', { type: 'button', class: 'btn btn-quiet btn-small', onclick: guard(fn, ctx) }, label);
  const out = [];
  const pinned = n.state?.pinnedWeek && n.state.pinnedWeek >= thisMonday();
  if (!n.competitor && !options.noPinNote && n.state?.status !== 'ignored' && n.state?.status !== 'done') {
    out.push(quiet(pinned ? 'Unpin' : 'Pin to this week', () => runAction(n, ctx, options, pinned ? 'unpin' : 'pin')));
  }
  if (!options.noPinNote) out.push(quiet('Add note', () => doNote(n, ctx, options)));
  // When the brief is the card's main button it is not repeated here.
  if (n.brief && !briefIsMain(n, options)) {
    out.push(quiet('Copy brief for Claude', () => copyBrief(n, ctx)));
  }
  const link = (label, href) =>
    h('a', { class: 'btn btn-quiet btn-small', href, target: '_blank', rel: 'noopener noreferrer' }, label);
  // The pages to read come from the desk's own watch data and must be https.
  if (n.competitor) {
    const pages = (n.competitor.pages ?? []).filter((p) => /^https:\/\//.test(p.url));
    for (const p of pages) out.push(link(pages.length === 1 ? 'Open their page' : `Open ${p.label}`, p.url));
  }
  if (n.links?.live) out.push(link('Open the page', n.links.live));
  if (n.links?.searchConsole) out.push(link('Open in Search Console', n.links.searchConsole));
  return out;
}

// The full Opp behind a card, for the evidence drawer. A week card carries its score but not
// its evidence rows, so those come from the page view of the card's page.
async function fullOpp(n, ctx) {
  if (n.opp?.evidence) return n.opp;
  if (n.oppId && n.page) {
    try {
      const view = await ctx.api.get(`/api/page?path=${encodeURIComponent(n.page)}`);
      const found = (view.opportunities ?? []).find((o) => o.id === n.oppId);
      if (found) return found;
    } catch {
      // fall back to the score alone
    }
  }
  return { title: n.title, score: n.score, evidence: [], touchedOn: [], range: null };
}

function scoreBlock(n, ctx) {
  const { h, fmt, openDrawer } = ctx;
  if (!n.score) {
    if (n.kind === 'card' && n.source === 'plan')
      return h('span', { class: 'card-score muted small' }, 'From the plan');
    return null;
  }
  return h(
    'span',
    { class: 'card-score' },
    h('span', { class: 'muted small' }, 'Score'),
    h('b', {}, fmt.num(n.score.total)),
    h(
      'button',
      {
        type: 'button',
        class: 'btn btn-quiet btn-small',
        onclick: guard(
          async () => openDrawer(evidenceView(await fullOpp(n, ctx), fmt), { title: 'Why this rank' }),
          ctx
        ),
      },
      'Why this rank'
    )
  );
}

// ------------------------------------------------------------------ the card

// The extra clicks a month the card could bring (the server's sentence, lib/upside.mjs), with the
// arithmetic behind it when there is one. A card with no estimate says so in the server's words.
export function upsideFact(n, h = el) {
  if (!n?.upside?.text) return null;
  return [
    h('dt', {}, 'Extra clicks'),
    h('dd', { class: 'upside-line' }, n.upside.text, n.upside.how ? h('span', { class: 'test' }, n.upside.how) : null),
  ];
}

function fullCard(n, ctx, options) {
  const { h } = ctx;
  const notes = n.state?.notes ?? [];
  return h(
    'article',
    { class: 'card', dataset: { id: n.id } },
    h(
      'div',
      { class: 'card-top' },
      options.priority && !n.held ? priorityChip(h, options.priority, options.priorityTitle) : null,
      h('span', { class: `chip ${n.chipClass}` }, n.label),
      options.chips ?? null,
      chips(n, ctx.fmt),
      scoreBlock(n, ctx)
    ),
    touchedLine(n),
    editWhenLine(n),
    n.explain ? h('p', { class: 'card-explain' }, n.explain) : null,
    h('h3', { class: 'card-title' }, n.title),
    options.afterTitle ?? null,
    h(
      'dl',
      { class: 'facts' },
      n.why ? [h('dt', {}, 'Why this week'), h('dd', {}, n.why)] : null,
      n.measured ? [h('dt', {}, 'Evidence'), h('dd', {}, n.measured)] : null,
      upsideFact(n, h),
      (options.facts ?? []).map(([label, node]) => [h('dt', {}, label), h('dd', {}, node)]),
      n.action
        ? [
            h('dt', {}, n.actionLabel),
            n.competitor
              ? h('dd', {}, n.action)
              : h(
                  'dd',
                  {},
                  n.action,
                  ' ',
                  showsHypothesis(n)
                    ? h(
                        'span',
                        { class: 'chip chip-hyp', title: 'A suggestion, not a fact. The test below settles it.' },
                        'Hypothesis'
                      )
                    : null,
                  n.test ? h('span', { class: 'test' }, n.test) : null
                ),
          ]
        : null
    ),
    options.afterFacts ?? null,
    n.note ? h('p', { class: 'card-note banner banner-warn' }, n.note) : null,
    notes.length
      ? h(
          'ul',
          { class: 'card-notes' },
          notes.slice(-3).map((x) => h('li', {}, h('span', { class: 'muted' }, `${ctx.fmt.dateShort(x.at)}: `), x.text))
        )
      : null,
    h('div', { class: 'card-actions' }, actionButtons(n, ctx, options)),
    briefIsMain(n, options) ? h('p', { class: 'muted small', style: { margin: '6px 0 0' } }, BRIEF_HINT) : null,
    h('div', { class: 'card-links' }, linkButtons(n, ctx, options))
  );
}

// Rows the person opened stay open when the page redraws after a button press.
const expanded = new Set();

function rowCard(n, ctx, options) {
  const { h, fmt } = ctx;
  const row = h('div', { class: 'item-row', dataset: { id: n.id } });
  const score = n.score ? fmt.num(n.score.total) : '';
  // The bulk select box stays in the left column whether the row is open or closed.
  const left = options.selectable
    ? h(
        'div',
        { class: 'score-big' },
        h('input', {
          type: 'checkbox',
          checked: options.selectable.checked,
          'aria-label': `Select ${n.title}`,
          onchange: (e) => options.selectable.onToggle(e.target.checked),
        }),
        score ? h('small', {}, score) : null
      )
    : h('div', { class: 'score-big' }, score || '\u00a0', score ? h('small', {}, 'score') : null);
  const open = ({ focus = true } = {}) => {
    expanded.add(n.id);
    row.className = `item-row is-open${options.selectable ? ' has-select' : ''}`;
    const less = h('button', { type: 'button', class: 'btn btn-quiet btn-small' }, 'Show less');
    less.addEventListener('click', () => {
      expanded.delete(n.id);
      const back = rowCard(n, ctx, {
        ...options,
        selectable: options.selectable && {
          ...options.selectable,
          checked: Boolean(left.querySelector('input')?.checked),
        },
      });
      row.replaceWith(back);
      back.querySelector('.item-row-side .btn:last-child')?.focus();
    });
    const body = h('div', {}, fullCard(n, ctx, options), h('div', { style: { marginTop: '6px' } }, less));
    row.replaceChildren(...(options.selectable ? [left, body] : [body]));
    if (focus) body.querySelector('button')?.focus();
  };
  const details = h(
    'button',
    { type: 'button', class: 'btn btn-small', 'aria-expanded': 'false', onclick: () => open() },
    'Details'
  );
  row.append(
    left,
    h(
      'div',
      {},
      h('div', { class: 'item-row-title' }, n.title),
      n.measured ? h('div', { class: 'item-row-line' }, n.measured) : null,
      n.upside?.text ? h('div', { class: 'item-row-line upside-line' }, n.upside.text) : null,
      h(
        'div',
        { class: 'item-row-meta' },
        h('span', { class: `chip ${n.chipClass}` }, n.label),
        chips(n, fmt),
        n.state?.notes?.length ? el('span', { class: 'chip' }, fmt.plural(n.state.notes.length, 'note', 'notes')) : null
      ),
      touchedLine(n)
    ),
    h(
      'div',
      { class: 'item-row-side' },
      (options.rowActions ?? []).map((x) =>
        h('button', { type: 'button', class: 'btn btn-small', onclick: guard(x.onClick, ctx) }, x.label)
      ),
      details
    )
  );
  if (expanded.has(n.id)) open({ focus: false });
  return row;
}

export function renderCard(item, ctx, options = {}) {
  const n = normalize(item, options.oppById);
  return options.variant === 'row' ? rowCard(n, ctx, options) : fullCard(n, ctx, options);
}
