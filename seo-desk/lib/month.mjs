// Calendar months for the Monthly report, and the Search Console rows of any date range the stored
// pulls do not hold, cached on disk. Pure logic plus the cache; the live call is injected
// (`call(tool, args)`), so nothing here opens a server. The routes in lib/api/ext/month.mjs supply it.
//
// The rules for the numbers (audit defects once, kept out on purpose):
//   - Months differ in length, so every change against the month before is worked out on per-day
//     averages and says so. Totals are shown as totals.
//   - A month counts only when Search Console has data for its last day (the newest day that has a
//     row). The current month is "so far" and is compared with the same number of days at the start
//     of the month before.
//   - A change needs at least 20 in the earlier period's total (pct's base), else it is null.
//   - Per-search numbers come from query-only pulls; per-page numbers from page rows.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { dataDir, readJson, writeJson } from './store.mjs';
import { addDays, daysBetween, todayIso, pctChange } from './dates.mjs';
import { longDate, longRange } from './text.mjs';
import { THRESHOLDS } from './config.mjs';
import { pullRows, resolveRange } from './explore.mjs';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// '2026-10' -> 'October 2026'; 'October' alone with {short: true}.
export const monthName = (m, { short = false } = {}) => {
  const [y, mo] = String(m).split('-').map(Number);
  return short ? MONTHS[mo - 1] : `${MONTHS[mo - 1]} ${y}`;
};

const firstDay = (m) => `${m}-01`;
export const monthOf = (iso) => String(iso).slice(0, 7);
// The month before '2026-01' is '2025-12'.
export function monthBefore(m) {
  const [y, mo] = m.split('-').map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`;
}
export function lastDay(m) {
  const [y, mo] = m.split('-').map(Number);
  return new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10);
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------- the months

// Every complete calendar month the daily rows cover, newest first, with the current month first as
// "so far" when the newest data day falls inside it. A month is complete when the daily rows start on
// or before its first day and reach its last day (`end`: the newest day Search Console has data for).
// [{month, label, start, end, days, soFar}].
export function monthsAvailable(siteDaily, end) {
  let first = null;
  for (const r of siteDaily ?? []) if (r?.date && (first === null || r.date < first)) first = r.date;
  if (!first || !end) return [];
  const out = [];
  let m = monthOf(end);
  while (firstDay(m) >= first) {
    const me = lastDay(m);
    if (me <= end) {
      out.push({
        month: m,
        label: monthName(m),
        start: firstDay(m),
        end: me,
        days: daysBetween(firstDay(m), me) + 1,
        soFar: false,
      });
    } else {
      out.push({
        month: m,
        label: `${monthName(m)} so far`,
        start: firstDay(m),
        end,
        days: daysBetween(firstDay(m), end) + 1,
        soFar: true,
      });
    }
    m = monthBefore(m);
  }
  return out;
}

// The newest complete month, else the month so far, else null.
export const defaultMonth = (months) => (months.find((m) => !m.soFar) ?? months[0] ?? null)?.month ?? null;

// The month's dates and the dates it is compared with. A complete month is compared with the whole
// month before; the month so far with the same number of days at the start of the month before (held
// to that month's last day, so 31 days so far in March meet February's 28). Both carry `days`.
// {month, label, soFar, cur: {start, end, days}, prev: {month, start, end, days}, compareText}.
export function monthWindows(month, end) {
  const start = firstDay(month);
  const me = lastDay(month);
  const soFar = me > end;
  const curEnd = soFar ? end : me;
  const days = daysBetween(start, curEnd) + 1;
  const pm = monthBefore(month);
  const pStart = firstDay(pm);
  const pLast = lastDay(pm);
  const pEnd = soFar ? [addDays(pStart, days - 1), pLast].sort()[0] : pLast;
  const prevDays = daysBetween(pStart, pEnd) + 1;
  const name = monthName(month, { short: true });
  const prevName = monthName(pm, { short: true });
  return {
    month,
    label: soFar ? `${monthName(month)} so far` : monthName(month),
    soFar,
    cur: { start, end: curEnd, days, text: longRange(start, curEnd) },
    prev: { month: pm, start: pStart, end: pEnd, days: prevDays, text: longRange(pStart, pEnd) },
    // How every change on the page is worked out, in words.
    compareText: soFar
      ? `Changes are per day: ${longRange(start, curEnd)} (${plural(days, 'day', 'days')}) against the same days at the start of ${prevName}, ${longRange(pStart, pEnd)}${prevDays === days ? '' : ` (${plural(prevDays, 'day', 'days')})`}.`
      : `Changes are per day, against ${prevName}'s ${prevDays} days (${name} has ${days}).`,
    // The short form under each tile.
    againstText: soFar
      ? `per day, against 1 to ${Number(pEnd.slice(8))} ${prevName}`
      : `per day, against ${prevName}'s ${prevDays} days`,
  };
}

// The dates of any date-bar choice and the dates it is compared with, for the pages that compare two
// periods (Performance, the Target keywords tab). spec: '7' | '14' | '28' | '90' | '480' |
// 'this-month' | 'last-month' | 'last-quarter' | 'custom' (with start and end), as resolveRange
// takes it; end: the newest data day. This month and last month are compared the way the Monthly
// report compares them (monthWindows), last quarter with the quarter before, anything else with the
// same number of days directly before. {cur, prev, label, sameLength, againstText, compareText}.
export function periodFor(spec, today, end) {
  const r = resolveRange(spec, today, { through: end });
  const name = String((spec && typeof spec === 'object' ? spec.range : spec) ?? '28');
  if (name === 'this-month' || name === 'last-month') {
    const w = monthWindows(monthOf(r.start), r.end);
    return {
      cur: w.cur,
      prev: w.prev,
      label: r.label,
      sameLength: w.cur.days === w.prev.days,
      againstText: w.againstText,
      compareText: w.compareText,
    };
  }
  const cur = { start: r.start, end: r.end, days: daysBetween(r.start, r.end) + 1, text: longRange(r.start, r.end) };
  let prev;
  if (name === 'last-quarter') {
    const qStart = r.start;
    const back = monthBefore(monthBefore(monthBefore(monthOf(qStart))));
    prev = { start: firstDay(back), end: addDays(qStart, -1) };
  } else {
    prev = { start: r.prevStart, end: r.prevEnd };
  }
  prev = { ...prev, days: daysBetween(prev.start, prev.end) + 1, text: longRange(prev.start, prev.end) };
  const sameLength = cur.days === prev.days;
  return {
    cur,
    prev,
    label: r.label,
    sameLength,
    againstText: sameLength
      ? `on the ${plural(prev.days, 'day', 'days')} before`
      : `per day, against the ${prev.days} days of ${prev.text}`,
    compareText: sameLength
      ? `Compared with the ${plural(prev.days, 'day', 'days')} before, ${prev.text}.`
      : `Changes are per day: ${cur.text} (${plural(cur.days, 'day', 'days')}) against ${prev.text} (${plural(prev.days, 'day', 'days')}).`,
  };
}

// The change in per-day averages, in percent, or null when the earlier period's TOTAL is under the
// minimum base (20): a period of 3 is never "+200%" because it was spread over fewer days.
export function perDayChange(cur, curDays, prev, prevDays, minBase = THRESHOLDS.PCT_MIN_BASE) {
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || !(curDays > 0) || !(prevDays > 0)) return null;
  if (!(prev >= minBase) || prev === 0) return null;
  return pctChange(cur / curDays, prev / prevDays, 0);
}

// The total of a field over the daily rows inside [start, end].
export function sumDays(rows, start, end, field) {
  let total = 0;
  for (const r of rows ?? []) if (r.date >= start && r.date <= end) total += Number(r[field]) || 0;
  return total;
}

// True when the daily rows hold every day of [start, end]: the first row on or before start and the
// newest on or after end.
export function coversRange(rows, start, end) {
  let min = null;
  let max = null;
  for (const r of rows ?? []) {
    if (!r?.date) continue;
    if (min === null || r.date < min) min = r.date;
    if (max === null || r.date > max) max = r.date;
  }
  return min !== null && min <= start && max >= end;
}

// Page rows from the stored daily page rows: one per page, position weighted by impressions.
export function pagesFromDaily(pageDaily, start, end) {
  const map = new Map();
  for (const r of pageDaily ?? []) {
    if (r.date < start || r.date > end) continue;
    const a = map.get(r.page) ?? { page: r.page, clicks: 0, impressions: 0, w: 0 };
    a.clicks += Number(r.clicks) || 0;
    a.impressions += Number(r.impressions) || 0;
    a.w += (Number(r.position) || 0) * (Number(r.impressions) || 0);
    map.set(r.page, a);
  }
  return [...map.values()].map(({ page, clicks, impressions, w }) => ({
    page,
    clicks,
    impressions,
    position: impressions ? Math.round((w / impressions) * 100) / 100 : 0,
  }));
}

// ---------------------------------------------------------------- the cache of pulled ranges

const CACHE_DIR = 'cache/periods';
const ROW_LIMIT = 25000;
// Entries for a range that may still change (it ends on the newest data day) last for that day; the
// files are cleared after DAY_KEEP_MS. Finished ranges stay, at most FINAL_MAX of them.
const DAY_KEEP_MS = 2 * 86400 * 1000;
const FINAL_MAX = 400;
const nowMs = (now) => (now instanceof Date ? now.getTime() : Number.isFinite(Number(now)) ? Number(now) : Date.now());

const keyOf = (o) => crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex');
const fileOf = (key, final) => `${CACHE_DIR}/${final ? 'f' : 'd'}-${key}.json`;

// A range is finished, and never changes again, when it ends before the newest data day or is a
// complete calendar month (its last day has data).
export const isFinished = ({ start, end }, newest) =>
  Boolean(newest) && (end < newest || (start.endsWith('-01') && end === lastDay(monthOf(start)) && end <= newest));

function readEntry(key, final, at) {
  const e = readJson(fileOf(key, final), null);
  if (!e || typeof e.fetchedAt !== 'string' || !Array.isArray(e.rows)) return null;
  if (final) return e;
  // A range that may still change is good for the day it was pulled on (this computer's calendar).
  return todayIso(new Date(Date.parse(e.fetchedAt))) === todayIso(new Date(at)) ? e : null;
}

function writeEntry(key, final, entry, at) {
  writeJson(fileOf(key, final), entry);
  // Pruned by file stats only (no file is opened).
  const dir = path.join(dataDir(), CACHE_DIR);
  try {
    const finals = [];
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      const full = path.join(dir, f);
      let mtime;
      try {
        mtime = fs.statSync(full).mtimeMs;
      } catch {
        continue;
      }
      if (f.startsWith('d-') && at - mtime > DAY_KEEP_MS) fs.rmSync(full, { force: true });
      else if (f.startsWith('f-')) finals.push({ full, mtime });
    }
    finals.sort((a, b) => b.mtime - a.mtime);
    for (const e of finals.slice(FINAL_MAX)) fs.rmSync(e.full, { force: true });
  } catch {
    // the cache is only a speed-up
  }
}

// The cached rows for one range, read only (no pull, nothing written), or null: the same answer as
// periodRows when it has them.
export function cachedRows({ dim, start, end }, { now, newest } = {}) {
  if (dim !== 'query' && dim !== 'page') throw new Error('periodRows dim must be query or page.');
  const at = nowMs(now);
  const finished = isFinished({ start, end }, newest);
  const key = keyOf({ k: 'period', dim, start, end, limit: ROW_LIMIT });
  const hit = readEntry(key, true, at) ?? readEntry(key, false, at);
  return hit ? { rows: hit.rows, fetchedAt: hit.fetchedAt, cached: true, finished } : null;
}

// The Search Console rows for one range by search ('query', a query-only pull) or by page ('page'),
// from the cache, else pulled once and cached: for good when the range is finished (isFinished), for
// the day otherwise. cacheOnly: return null instead of pulling (the Ask digest never pulls).
// Returns {rows, fetchedAt, cached, finished} or null (cacheOnly and not cached). A failed pull throws
// the explorer's plain sentence (status 502) and caches nothing.
export async function periodRows({ dim, start, end }, { call, now, newest, cacheOnly = false } = {}) {
  const hit = cachedRows({ dim, start, end }, { now, newest });
  if (hit || cacheOnly) return hit;
  const at = nowMs(now);
  const finished = isFinished({ start, end }, newest);
  const key = keyOf({ k: 'period', dim, start, end, limit: ROW_LIMIT });
  const rows = await pullRows(call, { dimensions: dim, start, end, filters: [], rowLimit: ROW_LIMIT });
  const fetchedAt = new Date(at).toISOString();
  writeEntry(key, finished, { fetchedAt, dim, start, end, rows }, at);
  return { rows, fetchedAt, cached: false, finished };
}

// "Pulled from Search Console on 15 November and kept for good." and the like, for a footer.
export function fetchedText(r) {
  if (!r?.fetchedAt) return null;
  const day = longDate(todayIso(new Date(Date.parse(r.fetchedAt))));
  return r.finished ? `pulled on ${day} and kept, because those days are final` : `pulled on ${day}, kept for that day`;
}
