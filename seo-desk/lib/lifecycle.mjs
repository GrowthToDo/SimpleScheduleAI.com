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
      const git = seen ? lastGitEditOn(edits, row.page, seen) : null;
      if (git) {
        out.push({
          page: row.page,
          date: git,
          why: `The plan row is ticked with no date. The page's latest git edit before the desk saw the tick on ${longDate(seen)} is on ${longDate(git)}.`,
        });
      } else if (seen) {
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

// The deliberate page edit dated inside the week of `today` (Monday to Sunday), or null.
// frozen: Map<page, {since, until}>; since is the date of the page's latest deliberate edit.
export function editThisWeek(frozen, today) {
  const monday = mondayOf(today);
  const sunday = addDays(monday, 6);
  let found = null;
  for (const [page, f] of frozen ?? []) {
    if (f.since >= monday && f.since <= sunday && (!found || f.since > found.since)) found = { page, ...f };
  }
  return found;
}

// Whether a card may be this week's live page edit. The one function every list uses (the five,
// the cards beside it, All opportunities, the insight pages built from opportunities, the worries):
//   frozen           the page is inside the 28 days of a deliberate edit: {eligible: false, from}
//   recently edited  git shows a commit of 15 or more lines in the last 28 days that the freeze does
//                    not know (`recent`, from recentEdits): {eligible: false, from, recentEdit}
//   week used        `week` is true and this week's one page edit is already made on another page:
//                    {eligible: false, from: next Monday, weekEdit: {page, date}}
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
  const w = week ? editThisWeek(frozen, today) : null;
  if (w && w.page !== opp.page) {
    return { eligible: false, from: addDays(mondayOf(today), 7), weekEdit: { page: w.page, date: w.since } };
  }
  return r?.touched?.length ? { eligible: true, from: null, touched: r.touched } : { eligible: true, from: null };
}

// The words on the eligibility chip, and the extra line for smaller git edits.
export function eligibilityText(e) {
  if (!e) return null;
  if (e.text) return e.text;
  if (e.recentEdit) return recentEditText(e.recentEdit);
  if (e.weekEdit) return `Next page edit from ${longDate(e.from)}`;
  return e.eligible ? 'Eligible now' : `Eligible from ${longDate(e.from)}`;
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
