// Item lifecycle, the 28 day freeze rule and eligibility. Every function is pure
// (no files, no clock; the caller passes `today`) except loadItems and saveItems,
// which touch state/items.json.

import { readJson, writeJson } from './store.mjs';
import { addDays, daysBetween, mondayOf } from './dates.mjs';
import { longDate } from './text.mjs';
import { planRowSize } from './sources/plan-parser.mjs';

export const FREEZE_DAYS = 28;

// ---------------------------------------------------------------- the size of a page edit

// Each week allows one big page change and one small one, on different pages (founder, 2026-11-17).
// Small: a title, meta description, heading, a single line or a single link. Big: a new or rewritten
// section. The one sentence every page and the Settings page say it in.
export const EDIT_SIZES = ['big', 'small'];
export const EDIT_RULE_TEXT =
  'Each week allows one big page change (a new or rewritten section) and one small one (a title, meta description, heading, a single line or a single link), on different pages, and no page is changed again within 28 days.';
// The opportunity types whose fix is a title or meta description change: a small change.
export const SMALL_EDIT_TYPES = ['low-click-rate'];
const isSize = (s) => EDIT_SIZES.includes(s);

// The size of a page edit: its own `size` when it has one (the founder's pick at Done, a plan row's
// tag), else 'small' for an opportunity whose fix is a title or description, else 'big'.
export function editSizeOf(x) {
  if (isSize(x?.size)) return x.size;
  return SMALL_EDIT_TYPES.includes(x?.type) ? 'small' : 'big';
}

export { planRowSize };
export const CAME_BACK_AFTER_DAYS = 30;
const DEFAULT_SNOOZE_DAYS = 7;
const ACTIONS = ['start', 'done', 'snooze', 'ignore', 'reopen', 'note', 'pin', 'unpin'];

const EDIT_NOTE = /^\s*edit:/i;
const day = (v) => (v ? String(v).slice(0, 10) : null);

export function newItem(today) {
  return { status: 'new', since: today, snoozeUntil: null, reason: null, doneAt: null, notes: [], pinnedWeek: null };
}

// Returns a new item; the input is never changed. A missing item starts as new.
// For 'done', pass {page, isPageEdit} from the opportunity so the freeze still
// holds after the opportunity stops being detected. `pages` lists every page one Done edits when
// there is more than one (a split search folded into the page that should win); each is frozen.
// `size` ('big' or 'small') is saved with a Done page edit, so the week's two slots can read it.
export function transition(item, action, { today, until, reason, text, page, pages, isPageEdit, size } = {}) {
  if (!ACTIONS.includes(action)) throw new Error(`unknown action: ${action}`);
  const cur = { ...newItem(today), ...(item || {}), notes: [...(item?.notes || [])] };

  if (cur.status === 'ignored' && action !== 'reopen' && action !== 'note') throw new Error('conflict');
  // A finished item goes back only through reopen, so a page unfreezes on purpose. Snooze and
  // ignore would drop the freeze without saying so.
  if (cur.status === 'done' && ['start', 'snooze', 'ignore'].includes(action)) throw new Error('conflict');

  const to = (status, extra = {}) => ({ ...cur, ...extra, status, since: status === cur.status ? cur.since : today });

  switch (action) {
    case 'start':
      return to('in-progress');
    case 'done':
      if (cur.status === 'done') return cur;
      return to('done', {
        doneAt: today,
        snoozeUntil: null,
        ...(page ? { page } : {}),
        ...(Array.isArray(pages) ? { pages: [...pages] } : {}),
        ...(isPageEdit !== undefined ? { isPageEdit: Boolean(isPageEdit) } : {}),
        ...(isPageEdit && isSize(size) ? { size } : {}),
      });
    case 'snooze': {
      const when = until ?? addDays(today, DEFAULT_SNOOZE_DAYS);
      if (!(when > today)) throw new Error('Snooze needs a date in the future.');
      return to('snoozed', { snoozeUntil: when });
    }
    case 'ignore':
      if (!reason || !String(reason).trim()) throw new Error('Ignoring needs a short reason.');
      return to('ignored', { reason: String(reason).trim(), snoozeUntil: null });
    case 'reopen':
      return to('new', { reason: null, snoozeUntil: null, doneAt: null });
    case 'note':
      if (!text || !String(text).trim()) throw new Error('A note needs some text.');
      return { ...cur, notes: [...cur.notes, { at: today, text: String(text).trim() }] };
    case 'pin':
      return { ...cur, pinnedWeek: mondayOf(today) };
    default: // unpin
      return { ...cur, pinnedWeek: null };
  }
}

// items: object keyed by opportunity id. detectedIds: ids found by this refresh.
// Statuses and notes are never lost.
export function reconcile(items, detectedIds, today) {
  const detected = new Set(detectedIds);
  const out = {};
  for (const [id, item] of Object.entries(items || {})) {
    let next = item;
    if (item.status === 'snoozed' && item.snoozeUntil && item.snoozeUntil <= today) {
      next = { ...item, status: 'new', since: today, snoozeUntil: null };
    } else if (
      item.status === 'done' &&
      detected.has(id) &&
      item.doneAt &&
      daysBetween(day(item.doneAt), today) > CAME_BACK_AFTER_DAYS
    ) {
      next = { ...item, status: 'came-back', since: today };
    }
    out[id] = next;
  }
  for (const id of detected) if (!out[id]) out[id] = newItem(today);
  return out;
}

// ---------------------------------------------------------------- freeze rule

// Days between the day a judging window opens (the plan's "judged from" date) and the edit it
// judges: the 28 day wait plus the two days Search Console lags.
const JUDGE_LAG_DAYS = 2;

// The key a plan row's first-seen-ticked date is stored under in state/plan-ticks.json.
export const planTickKey = (file, page) => `${file ?? ''}|${page}`;

// Plan rows that are ticked but carry no "Done <date>" or "Judge from <date>" text.
export const undatedPlanTicks = (plan) => (plan?.improve ?? []).filter((r) => r.done && !r.doneDate && !r.judgeFrom);

// The latest git edit (not a hand note) of `page` on or before `day`, or null. edits: the git edits
// the local snapshot carries ([{page, date, kind}], kind 'edit' or 'publish').
function lastGitEditOn(edits, page, day) {
  let best = null;
  for (const e of edits ?? []) {
    if (e.page !== page || e.kind === 'manual' || !e.date || e.date > day) continue;
    if (!best || e.date > best) best = e.date;
  }
  return best;
}

// Every deliberate improvement, as [{page, date, why}]. This is the one place that decides
// which edits count: a done page edit card, a plan row marked done (by its date, by its
// "judged from" date counted back, or, ticked with no date, by the latest git edit of the page on or
// before the day the desk first saw it ticked, else that day), or a manual note whose text starts
// with "Edit:". Notes about IndexNow, sitemap resubmits or indexing requests, and routine git edits,
// never count.
// planTicks: {planTickKey: 'YYYY-MM-DD'} from state/plan-ticks.json. planSeenOn: the day the
// plan was read, used for a ticked row the desk has no record of yet.
// Each edit carries its `size` ('big' or 'small'): a Done saves the size the founder picked (else its
// card's size: a plan row's tag, or editSizeOf for an opportunity); a plan row has its tag; an "Edit:"
// note is big unless the line says small.
export function deliberateEdits({ items = {}, opps = [], plan = null, edits = [], planTicks = {}, planSeenOn = null }) {
  const out = [];
  const oppById = new Map(opps.map((o) => [o.id, o]));
  const rowOf = (page) => (plan?.improve ?? []).find((r) => r.page === page) ?? null;
  for (const [id, item] of Object.entries(items)) {
    if (item.status !== 'done') continue;
    const o = oppById.get(id);
    // The pages saved at Done time win: a competing pages card can name another page today. One
    // Done may have edited several pages (a split folded into one), and each of them counts.
    const pages = Array.isArray(item.pages) ? item.pages : [item.page ?? o?.page];
    const isEdit = item.isPageEdit ?? o?.isPageEdit;
    const date = day(item.doneAt ?? item.since);
    const planRow = id.startsWith('plan-improve-') ? rowOf(id.slice('plan-improve-'.length)) : null;
    const size = isSize(item.size)
      ? item.size
      : planRow
        ? planRowSize(planRow)
        : editSizeOf({ type: o?.type ?? item.meta?.type });
    for (const page of pages) {
      if (isEdit && page && date) {
        out.push({ page, date, size, why: `You marked this page's change done on ${longDate(date)}.` });
      }
    }
  }
  for (const row of plan?.improve ?? []) {
    if (!row.done) continue;
    const size = planRowSize(row);
    if (row.doneDate) {
      out.push({
        page: row.page,
        date: row.doneDate,
        size,
        why: `The plan says this page was improved on ${longDate(row.doneDate)}.`,
      });
    } else if (row.judgeFrom) {
      out.push({
        page: row.page,
        date: addDays(row.judgeFrom, -(FREEZE_DAYS + JUDGE_LAG_DAYS)),
        size,
        why: `The plan says this change is live and is judged from ${longDate(row.judgeFrom)}.`,
      });
    } else {
      const seen = planTicks?.[planTickKey(plan.file, row.page)] ?? planSeenOn;
      const git = seen ? lastGitEditOn(edits, row.page, seen) : null;
      if (git) {
        out.push({
          page: row.page,
          date: git,
          size,
          why: `The plan row is ticked with no date. The page's latest git edit before the desk saw the tick on ${longDate(seen)} is on ${longDate(git)}.`,
        });
      } else if (seen) {
        out.push({
          page: row.page,
          date: seen,
          size,
          why: `The plan row is ticked with no date, and the desk first saw it ticked on ${longDate(seen)}.`,
        });
      }
    }
  }
  for (const e of edits) {
    if (e.kind === 'manual' && EDIT_NOTE.test(String(e.subject ?? ''))) {
      out.push({
        page: e.page,
        date: e.date,
        size: e.size === 'small' ? 'small' : 'big',
        why: `A change was logged by hand on ${longDate(e.date)}.`,
      });
    }
  }
  return out;
}

// Pages that may not be edited again, as Map<page, {until, since, why, size}>: each deliberate
// edit freezes its page for 28 days; the latest end date wins (on the same day, a big edit wins).
export function frozenPages({ items = {}, opps = [], plan = null, edits = [], planTicks, planSeenOn, today }) {
  const out = new Map();
  for (const { page, date, why, size } of deliberateEdits({ items, opps, plan, edits, planTicks, planSeenOn })) {
    const until = addDays(date, FREEZE_DAYS);
    if (!page || !date || !(until > today)) continue;
    const have = out.get(page);
    const s = size === 'small' ? 'small' : 'big';
    if (!have || until > have.until || (until === have.until && s === 'big' && have.size !== 'big'))
      out.set(page, { until, since: date, why, size: s });
  }
  return out;
}

// Dates of routine git edits and publishes for one page, oldest first, for the
// "also touched on" line. These never freeze the page.
export function touchedOn(page, edits) {
  const dates = (edits || []).filter((e) => e.page === page && e.kind !== 'manual').map((e) => e.date);
  return [...new Set(dates)].sort();
}

// ---------------------------------------------------------------- edits found in git

// A git commit that changes this many lines (added plus removed) of a page or more is a real edit; a
// smaller one (a count fixed, a link added) only touches the page, even when several land on one day.
export const RECENT_EDIT_MIN_LINES = 15;
// An edit this many days after the commit that published a page or fewer is part of publishing it.
export const AFTER_PUBLISH_DAYS = 2;

const sumBy = (rows) => {
  const byDate = new Map();
  for (const r of rows) {
    const d = byDate.get(r.date) ?? { date: r.date, lines: 0, commits: [], big: false };
    const n = Number(r.lines) || 0;
    d.lines += n;
    if (n >= RECENT_EDIT_MIN_LINES) d.big = true;
    if (r.commit && !d.commits.includes(r.commit)) d.commits.push(r.commit);
    byDate.set(r.date, d);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
};

// The content edits git shows that the freeze does not know, per page: Map<page, {edit, touched}>.
// contentEdits: [{page, date, commit, lines}] from the local snapshot (the page's own source file,
// the last 35 days, renames and the commit that first published it left out). Only edits inside the
// last 28 days count, and an edit is known when the page is frozen from a deliberate edit on that day
// or later. An edit within AFTER_PUBLISH_DAYS after a publish commit of the page is part of publishing
// it and is left out (published: Map<page, [publish dates]>). `edit` is the latest day with one commit
// of RECENT_EDIT_MIN_LINES or more: {date, lines, commits, until} (until: 28 days on; lines: that
// day's lines added up). `touched` lists the other days, oldest first: [{date, lines}]. A page with
// neither is left out.
export function recentEdits({ contentEdits = [], frozen = new Map(), today, published = new Map() }) {
  const byPage = new Map();
  for (const e of contentEdits ?? []) {
    if (!e?.page || !e.date || e.date > today || !(addDays(e.date, FREEZE_DAYS) > today)) continue;
    const f = frozen?.get(e.page);
    if (f && f.since >= e.date) continue;
    const pub = published?.get(e.page) ?? [];
    if (pub.some((p) => p <= e.date && e.date <= addDays(p, AFTER_PUBLISH_DAYS))) continue;
    if (!byPage.has(e.page)) byPage.set(e.page, []);
    byPage.get(e.page).push(e);
  }
  const out = new Map();
  for (const [page, rows] of byPage) {
    const days = sumBy(rows);
    const big = days.filter((d) => d.big).pop() ?? null;
    const touched = days.filter((d) => !d.big).map((d) => ({ date: d.date, lines: d.lines }));
    out.set(page, {
      edit: big
        ? { date: big.date, lines: big.lines, commits: big.commits, until: addDays(big.date, FREEZE_DAYS) }
        : null,
      touched,
    });
  }
  return out;
}

const lineWord = (n) => `${n} ${n === 1 ? 'line' : 'lines'}`;

// "Edited 9 November (found in git, 299 lines). Leave it until 7 December unless that edit was minor"
export const recentEditText = (r) =>
  `Edited ${longDate(r.date)} (found in git, ${lineWord(r.lines)}). Leave it until ${longDate(r.until)} unless that edit was minor`;

// "Also touched on 9 November (3 lines) and 12 November (2 lines)"
export function touchedText(touched) {
  const parts = (touched ?? []).map((t) => `${longDate(t.date)} (${lineWord(t.lines)})`);
  if (!parts.length) return null;
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  return `Also touched on ${list}`;
}

// ---------------------------------------------------------------- eligibility

// This week's two page change slots (Monday to Sunday): {big, small}, each the edit that used it,
// {page, since, until, size, found}, or null while it is free. found: 'desk' for a deliberate edit (a
// Done, a plan row, an "Edit:" note; frozen: Map<page, {since, until, size}>, since is the date of the
// page's latest deliberate edit, a missing size is big) or 'git' for an edit found in git that the desk
// did not record: one commit of RECENT_EDIT_MIN_LINES lines or more uses the big slot, a smaller one
// uses none (recent: Map<page, {edit}> from recentEdits). When two edits of one size land in a week, the
// latest names the slot.
export function editThisWeek(frozen, today, { recent = null } = {}) {
  const monday = mondayOf(today);
  const sunday = addDays(monday, 6);
  const inWeek = (d) => Boolean(d) && d >= monday && d <= sunday;
  const out = { big: null, small: null };
  const take = (e) => {
    const have = out[e.size];
    if (!have || e.since > have.since) out[e.size] = e;
  };
  for (const [page, f] of frozen ?? [])
    if (inWeek(f.since))
      take({ page, since: f.since, until: f.until, size: f.size === 'small' ? 'small' : 'big', found: 'desk' });
  for (const [page, r] of recent ?? []) {
    const g = r?.edit;
    if (!g || !inWeek(g.date)) continue;
    const f = frozen?.get(page);
    if (f && f.since >= g.date) continue;
    take({ page, since: g.date, until: g.until, size: 'big', found: 'git' });
  }
  return out;
}

// The first day of next week, when both slots are free again.
export const nextMonday = (today) => addDays(mondayOf(today), 7);

// Whether a card may be one of this week's live page changes. The one function every list uses (the
// five, the cards beside it, All opportunities, the insight pages built from opportunities, the worries):
//   frozen           the page is inside the 28 days of a deliberate edit: {eligible: false, from}
//   recently edited  git shows a commit of 15 or more lines in the last 28 days that the freeze does
//                    not know (`recent`, from recentEdits): {eligible: false, from, recentEdit}
//   slot used        `week` is true and this week's slot of the card's size (editSizeOf: big or small)
//                    is already used on another page:
//                    {eligible: false, from: next Monday, weekEdit: {page, date, size}}
//   eligible         {eligible: true, from: null}, plus `touched` when git shows smaller edits
// Only a live page edit is held back. Without `recent` and `week` this is the freeze alone.
export function eligibility(opp, frozen, today, { recent = null, week = false } = {}) {
  if (!opp.isPageEdit) return { eligible: true, from: null };
  const f = frozen?.get(opp.page);
  if (f && f.until > today) return { eligible: false, from: f.until };
  const r = recent?.get(opp.page);
  if (r?.edit && r.edit.until > today) {
    const { date, lines, until } = r.edit;
    return { eligible: false, from: until, recentEdit: { page: opp.page, date, lines, until } };
  }
  const size = editSizeOf(opp);
  const w = week ? editThisWeek(frozen, today, { recent })[size] : null;
  if (w && w.page !== opp.page) {
    return { eligible: false, from: nextMonday(today), weekEdit: { page: w.page, date: w.since, size } };
  }
  return r?.touched?.length ? { eligible: true, from: null, touched: r.touched } : { eligible: true, from: null };
}

// When a page may be edited, in the words every chip, worry and page detail uses: a page held by its
// own edit (the freeze, or an edit found in git) reads "Leave it until <date>"; a page held only because
// this week's slot of its size is used reads "Next big page change from <next Monday>" (or small); a free
// page reads "Can be edited now".
export function editWhenText(e) {
  if (!e) return null;
  if (e.eligible) return 'Can be edited now';
  if (e.weekEdit) return `Next ${e.weekEdit.size === 'small' ? 'small' : 'big'} page change from ${longDate(e.from)}`;
  return `Leave it until ${longDate(e.from)}`;
}

// The words on the eligibility chip (editWhenText; an edit found in git also says when and how big),
// and the extra line for smaller git edits.
export function eligibilityText(e) {
  if (!e) return null;
  if (e.text) return e.text;
  if (e.recentEdit) return recentEditText(e.recentEdit);
  return editWhenText(e);
}

// The eligibility with its words: {eligible, from, text, ...the state's own fields, touchedText}.
export function withEligibilityText(e) {
  if (!e) return null;
  const touched = touchedText(e.touched);
  return { ...e, text: eligibilityText(e), ...(touched ? { touchedText: touched } : {}) };
}

// ---------------------------------------------------------------- persistence

export function loadItems() {
  return readJson('state/items.json', {});
}

export function saveItems(items) {
  writeJson('state/items.json', items);
}
