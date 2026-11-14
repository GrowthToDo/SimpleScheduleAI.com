// Item lifecycle, the 28 day freeze rule and eligibility. Every function is pure
// (no files, no clock; the caller passes `today`) except loadItems and saveItems,
// which touch state/items.json.

import { readJson, writeJson } from './store.mjs';
import { addDays, daysBetween, mondayOf } from './dates.mjs';
import { longDate } from './text.mjs';

export const FREEZE_DAYS = 28;
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
export function transition(item, action, { today, until, reason, text, page, pages, isPageEdit } = {}) {
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

// Every deliberate improvement, as [{page, date, why}]. This is the one place that decides
// which edits count: a done page edit card, a plan row marked done (by its date, by its
// "judged from" date counted back, or, ticked with no date, by the day the desk first saw it
// ticked), or a manual note whose text starts with "Edit:". Notes about IndexNow, sitemap
// resubmits or indexing requests, and routine git edits, never count.
// planTicks: {planTickKey: 'YYYY-MM-DD'} from state/plan-ticks.json. planSeenOn: the day the
// plan was read, used for a ticked row the desk has no record of yet.
export function deliberateEdits({ items = {}, opps = [], plan = null, edits = [], planTicks = {}, planSeenOn = null }) {
  const out = [];
  const oppById = new Map(opps.map((o) => [o.id, o]));
  for (const [id, item] of Object.entries(items)) {
    if (item.status !== 'done') continue;
    const o = oppById.get(id);
    // The pages saved at Done time win: a competing pages card can name another page today. One
    // Done may have edited several pages (a split folded into one), and each of them counts.
    const pages = Array.isArray(item.pages) ? item.pages : [item.page ?? o?.page];
    const isEdit = item.isPageEdit ?? o?.isPageEdit;
    const date = day(item.doneAt ?? item.since);
    for (const page of pages) {
      if (isEdit && page && date) {
        out.push({ page, date, why: `You marked this page's change done on ${longDate(date)}.` });
      }
    }
  }
  for (const row of plan?.improve ?? []) {
    if (!row.done) continue;
    if (row.doneDate) {
      out.push({
        page: row.page,
        date: row.doneDate,
        why: `The plan says this page was improved on ${longDate(row.doneDate)}.`,
      });
    } else if (row.judgeFrom) {
      out.push({
        page: row.page,
        date: addDays(row.judgeFrom, -(FREEZE_DAYS + JUDGE_LAG_DAYS)),
        why: `The plan says this change is live and is judged from ${longDate(row.judgeFrom)}.`,
      });
    } else {
      const seen = planTicks?.[planTickKey(plan.file, row.page)] ?? planSeenOn;
      if (seen) {
        out.push({
          page: row.page,
          date: seen,
          why: `The plan row is ticked with no date, and the desk first saw it ticked on ${longDate(seen)}.`,
        });
      }
    }
  }
  for (const e of edits) {
    if (e.kind === 'manual' && EDIT_NOTE.test(String(e.subject ?? ''))) {
      out.push({ page: e.page, date: e.date, why: `A change was logged by hand on ${longDate(e.date)}.` });
    }
  }
  return out;
}

// Pages that may not be edited again, as Map<page, {until, since, why}>: each deliberate
// edit freezes its page for 28 days; the latest end date wins.
export function frozenPages({ items = {}, opps = [], plan = null, edits = [], planTicks, planSeenOn, today }) {
  const out = new Map();
  for (const { page, date, why } of deliberateEdits({ items, opps, plan, edits, planTicks, planSeenOn })) {
    const until = addDays(date, FREEZE_DAYS);
    if (!page || !date || !(until > today)) continue;
    const have = out.get(page);
    if (!have || until > have.until) out.set(page, { until, since: date, why });
  }
  return out;
}

// Dates of routine git edits and publishes for one page, oldest first, for the
// "also touched on" line. These never freeze the page.
export function touchedOn(page, edits) {
  const dates = (edits || []).filter((e) => e.page === page && e.kind !== 'manual').map((e) => e.date);
  return [...new Set(dates)].sort();
}

// Only a live page edit is held back by the 28 day rule.
export function eligibility(opp, frozen, today) {
  if (!opp.isPageEdit) return { eligible: true, from: null };
  const f = frozen?.get(opp.page);
  if (f && f.until > today) return { eligible: false, from: f.until };
  return { eligible: true, from: null };
}

// ---------------------------------------------------------------- persistence

export function loadItems() {
  return readJson('state/items.json', {});
}

export function saveItems(items) {
  writeJson('state/items.json', items);
}
