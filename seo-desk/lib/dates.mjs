// Date maths and reporting windows. All dates are 'YYYY-MM-DD' strings in UTC.

import { END_LAG_DAYS } from '../../scripts/lib/gsc-diagnose-core.mjs';

export { END_LAG_DAYS };

const DAY_MS = 86400000;
const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

// The calendar date on this machine (the desk has one user, on one Mac), not the UTC date, so
// a Done or a note made after midnight in India is stamped with that day. Pass a Date in tests.
// Every other function here counts days on 'YYYY-MM-DD' strings, so nothing else depends on the zone.
export function todayIso(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function addDays(iso, n) {
  return toIso(toMs(iso) + n * DAY_MS);
}

// Whole days from a to b (b - a).
export function daysBetween(a, b) {
  return Math.round((toMs(b) - toMs(a)) / DAY_MS);
}

// The Monday on or before the given date.
export function mondayOf(iso) {
  const dow = new Date(toMs(iso)).getUTCDay(); // 0 = Sunday
  return addDays(iso, -((dow + 6) % 7));
}

// Reporting windows. Every end is today - 3. cur and prev are 28 days each and
// touch (prev ends the day before cur starts). d90, d120 and d480 end with cur.
export function windows(today) {
  const end = addDays(today, -END_LAG_DAYS);
  const span = (days, endIso = end) => ({ start: addDays(endIso, -(days - 1)), end: endIso });
  const cur = span(28);
  const prev = span(28, addDays(cur.start, -1));
  return { cur, prev, d90: span(90), d120: span(120), d480: span(480) };
}

// Percent change from prev to cur, rounded to one decimal place. Null when the
// base is below minBase, so a jump from 3 to 9 is never shown as +200%.
export function pctChange(cur, prev, minBase = 20) {
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev < minBase || prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}
