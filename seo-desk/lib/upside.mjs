// The extra clicks a month each opportunity could bring, estimated from the site's OWN click rates
// (never industry averages). Pure functions: no files, no clock.
//
// The medians come from the query-only Search Console pull for the latest stored period
// (query-counts.mjs realQueryCounts, never sums of page rows), brand searches left out, counting only
// searches shown UPSIDE_MIN_IMP times or more (UPSIDE_FALLBACK_IMP when fewer than
// UPSIDE_FALLBACK_SEARCHES searches reach it). Positions are rounded to whole numbers; a position with
// fewer than POOL_MIN searches reads its pool (1 to 3, 4 to 5, 6 to 10, 11 to 20) instead.
//
// Per opportunity type (the 28-day figure is turned into a month as x 30 / the period's days):
//   near-page-one    real views x (median at positions 3 to 5 minus its own rate), IF it reaches the top 5
//   low-click-rate   top 5: views x (median at its position minus its own rate); lower: views x (median
//                    page rate minus its own rate), the "shown but not clicked" estimate
//   slipping         lost rankings: the clicks lost (earlier period minus latest); other kinds: none
//   question         real views x (site median minus its own rate)
//   anything else    no estimate for this kind
// A rate needs THRESHOLDS.PCT_MIN_BASE views (the desk's minimum base for a percentage), else "not
// enough data". A result of zero or below is no estimate.

import { realQueryCounts } from './query-counts.mjs';
import { isBrand } from '../../scripts/lib/gsc-diagnose-core.mjs';
import { THRESHOLDS } from './config.mjs';
import { daysBetween } from './dates.mjs';
import { longRange } from './text.mjs';

export const UPSIDE_MIN_IMP = 100;
export const UPSIDE_FALLBACK_IMP = 20;
export const UPSIDE_FALLBACK_SEARCHES = 20;
export const POOL_MIN = 5;
export const POOLS = [
  [1, 3],
  [4, 5],
  [6, 10],
  [11, 20],
];
// The Upside signal is log10(1 + clicks a month) / UPSIDE_LOG_TOP: 1,000 extra clicks a month is the top.
export const UPSIDE_LOG_TOP = 3;

const n0 = (v) => Math.round(v).toLocaleString('en-US');
const rate2 = (r) => `${(r * 100).toFixed(2)}%`;
const times = (n) => `${n0(n)} ${n === 1 ? 'time' : 'times'}`;
const searchesWord = (n) => `${n0(n)} ${n === 1 ? 'search' : 'searches'}`;

export function median(values) {
  const v = [...values].sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

const stat = (list) => ({ median: median(list), n: list.length });

// The rows that count: shown `min` times or more, else the fallback gate when too few reach it.
function gated(rows) {
  const strict = rows.filter((r) => r.impressions >= UPSIDE_MIN_IMP);
  if (strict.length >= UPSIDE_FALLBACK_SEARCHES) return { min: UPSIDE_MIN_IMP, rows: strict };
  return { min: UPSIDE_FALLBACK_IMP, rows: rows.filter((r) => r.impressions >= UPSIDE_FALLBACK_IMP) };
}

// The site's own click rates for one period. gsc: the Search Console snapshot data; range: {start, end}
// of the stored latest period. {available, range: {start, end, text}, days, minImpressions, searches,
// positions: [{position, median, n}], bands: [{from, to, median, n}], top5: {median, n} (positions 3 to
// 5 together), site: {median, n}, pages: {median, n, minImpressions}, text}.
export function clickRates(gsc, { brands = [], range = null } = {}) {
  const r = range ?? gsc?.windows?.cur ?? null;
  const days = r?.start && r?.end ? daysBetween(r.start, r.end) + 1 : null;
  const rangeOut = r?.start && r?.end ? { start: r.start, end: r.end, text: longRange(r.start, r.end) } : null;
  const real = realQueryCounts(gsc, 'cur');
  const none = {
    available: false,
    range: rangeOut,
    days,
    minImpressions: null,
    searches: 0,
    positions: [],
    bands: [],
    top5: { median: null, n: 0 },
    site: { median: null, n: 0 },
    pages: { median: null, n: 0, minImpressions: null },
    text: 'Not enough data for click estimates: the per-search counts from Search Console are missing.',
  };
  if (!real || !days) return none;
  const all = [...real.values()].filter((s) => s.impressions > 0 && s.position > 0 && !isBrand(s.query, brands));
  const { min, rows } = gated(all);
  const counted = rows.map((s) => ({ rate: s.clicks / s.impressions, position: Math.round(s.position) }));
  const byPos = new Map();
  for (const c of counted) byPos.set(c.position, [...(byPos.get(c.position) ?? []), c.rate]);
  const positions = [...byPos.keys()]
    .sort((a, b) => a - b)
    .map((position) => ({ position, ...stat(byPos.get(position)) }));
  const inRange = (from, to) => counted.filter((c) => c.position >= from && c.position <= to).map((c) => c.rate);
  const bands = POOLS.map(([from, to]) => ({ from, to, ...stat(inRange(from, to)) }));

  // Pages: each page's own views and clicks in the period, from the daily page rows.
  const pageMap = new Map();
  for (const p of gsc?.pageDaily ?? []) {
    if (!p?.page || p.date < r.start || p.date > r.end) continue;
    const a = pageMap.get(p.page) ?? { clicks: 0, impressions: 0 };
    a.clicks += Number(p.clicks) || 0;
    a.impressions += Number(p.impressions) || 0;
    pageMap.set(p.page, a);
  }
  const pageRows = gated([...pageMap.values()].filter((p) => p.impressions > 0));
  const pages = { ...stat(pageRows.rows.map((p) => p.clicks / p.impressions)), minImpressions: pageRows.min };

  const out = {
    available: counted.length > 0,
    range: rangeOut,
    days,
    minImpressions: min,
    searches: counted.length,
    positions,
    bands,
    top5: stat(inRange(3, 5)),
    site: stat(counted.map((c) => c.rate)),
    pages,
  };
  out.text = out.available
    ? `From ${rangeOut.text}: ${searchesWord(out.searches)} shown ${n0(min)} times or more, brand searches left out. Median click rate ${rate2(out.site.median)} across them, ${out.top5.n ? rate2(out.top5.median) : 'none'} at positions 3 to 5 (${searchesWord(out.top5.n)}), and ${pages.n ? rate2(pages.median) : 'none'} across ${n0(pages.n)} ${pages.n === 1 ? 'page' : 'pages'} shown ${n0(pages.minImpressions)} times or more.`
    : `Not enough data for click estimates: no search outside the brand list was shown ${n0(UPSIDE_FALLBACK_IMP)} times or more from ${rangeOut.text}.`;
  return out;
}

// The median click rate for a page at `position`: that rounded position's own median when POOL_MIN or
// more searches share it, else its pool's. {median, n, label} or null when nothing counts there.
export function medianAt(rates, position) {
  const p = Math.max(1, Math.round(Number(position) || 0));
  const own = rates?.positions?.find((x) => x.position === p);
  if (own && own.n >= POOL_MIN) return { median: own.median, n: own.n, label: `position ${p}` };
  const band = rates?.bands?.find((b) => p >= b.from && p <= b.to);
  if (!band || !band.n) return null;
  return { median: band.median, n: band.n, label: `positions ${band.from} to ${band.to}` };
}

// ---------------------------------------------------------------- one opportunity

export const NO_ESTIMATE = {
  state: 'none',
  clicks: null,
  text: 'No click estimate for this kind.',
  how: null,
  short: 'No estimate',
};
const notEnough = (why) => ({
  state: 'not-enough',
  clicks: null,
  text: `Not enough data for a click estimate: ${why}`,
  how: null,
  short: 'Not enough data',
});
// short: the few words a table cell shows.
export const estimate = (clicks, text, how = null) => ({
  state: 'estimate',
  clicks,
  text,
  how,
  short: `About ${n0(clicks)}`,
});

const key = (q) =>
  String(q ?? '')
    .trim()
    .toLowerCase();

// gain: the extra clicks in `days` days; how: the arithmetic in words. A gain that rounds to zero or
// below a month is no estimate.
function monthly(gain, days, { lead, source, range }, how) {
  const month = (gain * 30) / days;
  const clicks = Math.round(month);
  const howText = `${how} Over a month: ${gain.toFixed(1)} x 30 / ${days} = ${month.toFixed(1)}.`;
  if (!(clicks > 0))
    return {
      state: 'zero',
      clicks: null,
      text: 'No click estimate: at your own click rates this would not add clicks.',
      how: howText,
      short: 'None',
    };
  return estimate(
    clicks,
    `About ${n0(clicks)} extra ${clicks === 1 ? 'click' : 'clicks'} a month ${lead} (an estimate from ${source}, ${range}).`,
    howText
  );
}

const MIN_BASE = () => THRESHOLDS.PCT_MIN_BASE;

// One search's own numbers from the query-only pull, or a not-enough reason.
function searchOf(real, query) {
  const s = real?.get(key(query));
  if (!s) return { why: 'Search Console has no per-search count for this search.' };
  if (!(s.impressions >= MIN_BASE())) return { why: `the search was shown fewer than ${MIN_BASE()} times.` };
  return { s, rate: s.clicks / s.impressions };
}

// opp: a detected opportunity ({type, query, page, evidence, range, dropKind}). ctx: {rates (clickRates),
// real (realQueryCounts 'cur')}. Returns {state: 'estimate' | 'zero' | 'not-enough' | 'none', clicks
// (whole clicks a month, only for an estimate), text (the card's line), how (the arithmetic, or null)}.
export function upsideOf(opp, { rates, real } = {}) {
  const type = opp?.type;
  const ratesRange = rates?.range?.text ?? 'the latest period';
  const own = { source: 'your own click rates', range: ratesRange };
  const daysOf = rates?.days ?? 28;

  if (type === 'near-page-one' || type === 'question') {
    if (!rates?.available) return notEnough('your own click rates could not be worked out.');
    const { s, rate, why } = searchOf(real, opp.query);
    if (!s) return notEnough(why);
    const target = type === 'near-page-one' ? rates.top5 : rates.site;
    if (!target.n) return notEnough('no search counted at those positions.');
    const where =
      type === 'near-page-one'
        ? `Searches at positions 3 to 5 get a median click rate of ${rate2(target.median)} (${searchesWord(target.n)}).`
        : `Your searches get a median click rate of ${rate2(target.median)} (${searchesWord(target.n)}).`;
    const gain = s.impressions * (target.median - rate);
    return monthly(
      gain,
      daysOf,
      { lead: type === 'near-page-one' ? 'if the page reaches the top 5' : 'if this works', ...own },
      `"${s.query}" was shown ${times(s.impressions)} and clicked ${times(s.clicks)} (${rate2(rate)}). ${where} ${n0(s.impressions)} x (${rate2(target.median)} minus ${rate2(rate)}) = ${gain.toFixed(1)} clicks.`
    );
  }

  if (type === 'low-click-rate') {
    if (!rates?.available) return notEnough('your own click rates could not be worked out.');
    const p = opp.evidence?.[0];
    if (!p || !(p.impressions >= MIN_BASE())) return notEnough(`the page was shown fewer than ${MIN_BASE()} times.`);
    const rate = (p.clicks || 0) / p.impressions;
    const top5 = Math.round(p.position) <= 5;
    const m = top5 ? medianAt(rates, p.position) : rates.pages.n ? { ...rates.pages, label: null } : null;
    if (!m) return notEnough('no search or page counted at that position.');
    const where = top5
      ? `Searches at ${m.label} get a median click rate of ${rate2(m.median)} (${searchesWord(m.n)}).`
      : `The median page on your site gets a click rate of ${rate2(m.median)} (${n0(m.n)} ${m.n === 1 ? 'page' : 'pages'}).`;
    const gain = p.impressions * (m.median - rate);
    return monthly(
      gain,
      daysOf,
      { lead: 'if this works', ...own },
      `${p.page ?? opp.page} was shown ${times(p.impressions)} at an average position of ${Number(p.position).toFixed(1)} and clicked ${times(p.clicks || 0)} (${rate2(rate)}). ${where} ${n0(p.impressions)} x (${rate2(m.median)} minus ${rate2(rate)}) = ${gain.toFixed(1)} clicks.`
    );
  }

  if (type === 'slipping') {
    if (opp.dropKind === 'lost-demand')
      return {
        ...NO_ESTIMATE,
        text: 'No click estimate: fewer people may be searching for this, so there may be nothing to fix.',
      };
    if (opp.dropKind !== 'lost-rankings') return NO_ESTIMATE;
    const e = opp.evidence?.[0];
    const before = e?.prev ?? {};
    const after = e?.cur ?? {};
    if (!(before.impressions >= MIN_BASE()))
      return notEnough(`the page was shown fewer than ${MIN_BASE()} times before.`);
    const span = opp.range?.start && opp.range?.end ? daysBetween(opp.range.start, opp.range.end) + 1 : null;
    const days = span ? Math.round(span / 2) : daysOf;
    const lost = (before.clicks || 0) - (after.clicks || 0);
    return monthly(
      lost,
      days,
      {
        lead: 'if this works',
        source: 'the clicks the page lost',
        range: opp.range?.start ? longRange(opp.range.start, opp.range.end) : ratesRange,
      },
      `The page had ${n0(before.clicks || 0)} clicks in the earlier ${days} days and ${n0(after.clicks || 0)} in the latest, ${n0(lost)} fewer.`
    );
  }

  return NO_ESTIMATE;
}

// The Upside score signal: 0..1 on a log scale for an estimate, else null (adds 0 points).
export const upsideSignal = (u) =>
  u?.state === 'estimate' && u.clicks > 0 ? Math.min(1, Math.log10(1 + u.clicks) / UPSIDE_LOG_TOP) : null;

// Why a null Upside adds nothing, for the "why this rank" line.
export const upsideNullWhy = (u) =>
  u?.state === 'not-enough'
    ? 'not enough data yet'
    : u?.state === 'zero'
      ? 'the estimate is zero or below'
      : 'no click estimate for this kind';
