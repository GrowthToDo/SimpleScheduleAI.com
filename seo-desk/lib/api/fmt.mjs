// Small number and date helpers shared by the API view models. Pure functions.

import { pctChange } from '../dates.mjs';
import { THRESHOLDS } from '../config.mjs';

export const n0 = (v) => Math.round(Number(v) || 0).toLocaleString('en-US');
export const round1 = (v) => Math.round(v * 10) / 10;
export const pos1 = (v) => (Number.isFinite(v) ? Number(v).toFixed(1) : null);

// Percent change, or null when the base is below the minimum (so 3 to 9 is never "+200%").
export const pct = (cur, prev, minBase = THRESHOLDS.PCT_MIN_BASE) => pctChange(cur, prev, minBase);

// 12.5 -> '12.5%' (signed), for sentences.
export const pctText = (p) => (p === null || p === undefined ? '' : `${p > 0 ? '+' : ''}${p}%`);

// Sum of one field over rows whose date is inside [start, end].
export function sumRange(rows, start, end, field) {
  let total = 0;
  for (const r of rows || []) if (r.date >= start && r.date <= end) total += Number(r[field]) || 0;
  return total;
}

// True when the rows cover every day from `start` (first row on or before it).
export function coversFrom(rows, start) {
  let min = null;
  for (const r of rows || []) if (r.date && (min === null || r.date < min)) min = r.date;
  return min !== null && min <= start;
}

export const lower = (s) => String(s ?? '').toLowerCase();
