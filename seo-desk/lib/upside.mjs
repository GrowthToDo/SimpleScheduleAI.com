// The extra clicks a month each opportunity could bring, estimated from the site's OWN click rates
// (never industry averages). Pure functions: no files, no clock.
//
// The rates are POOLED: for each position band, the total clicks divided by the total views of the
// non-brand searches in it, from the 90-day query-only Search Console rows (query-counts.mjs
// realQueryCounts 'd90'), else the 28-day ones, never sums of page rows. A search counts when it was
// shown SEARCH_MIN_IMP times or more; its average place is rounded and falls in a band (1 to 3, 4 to 5,
// 6 to 10, 11 to 20). A pool with fewer than RATE_MIN_CLICKS clicks gives no rate: "not enough clicks
// yet to estimate". The page rate is the same over the daily page rows of the same days (pages shown
// SEARCH_MIN_IMP times or more). Medians of near-zero rates said nothing on a site this small.
//
// Per opportunity type, from the card's own 28-day numbers (turned into a month as x 30 / its days):
//   near-page-one    real views x (pooled rate at positions 3 to 5 minus its own), IF it reaches the top 5
//   low-click-rate   top 5: views x (its band's pooled rate minus its own); lower: views x (the pooled
//                    page rate minus its own), the "shown but not clicked" estimate
//   slipping         lost rankings: the clicks lost (earlier period minus latest); other kinds: none
//   question         real views x (pooled rate across all searches minus its own)
//   anything else    no estimate for this kind
// The card's own numbers need THRESHOLDS.PCT_MIN_BASE views, else "not enough data". A result of zero
// or below is no estimate.

import { realQueryCounts } from './query-counts.mjs';
import { isBrand } from '../../scripts/lib/gsc-diagnose-core.mjs';
import { THRESHOLDS } from './config.mjs';
import { daysBetween } from './dates.mjs';
import { longRange } from './text.mjs';

export const SEARCH_MIN_IMP = 20;
export const RATE_MIN_CLICKS = 20;
export const BANDS = [
  [1, 3],
  [4, 5],
  [6, 10],
  [11, 20],
];
// The Upside signal is log10(1 + clicks a month) / UPSIDE_LOG_TOP: 1,000 extra clicks a month is the top.
export const UPSIDE_LOG_TOP = 3;

const n0 = (v) => Math.round(v).toLocaleString('en-US');
// A click rate for a sentence: two decimals under 1% ("0.21%"), one above ("1.7%").
export const rateText = (r) => `${(r * 100).toFixed(r < 0.01 ? 2 : 1)}%`;
const times = (n) => `${n0(n)} ${n === 1 ? 'time' : 'times'}`;
const clicksWord = (n) => `${n0(n)} ${n === 1 ? 'click' : 'clicks'}`;
const rangeOf = (r) => (r?.start && r?.end ? { start: r.start, end: r.end, text: longRange(r.start, r.end) } : null);
const daysOf = (r) => (r?.start && r?.end ? daysBetween(r.start, r.end) + 1 : null);

// One pool: {clicks, impressions, searches (or pages), rate (null under RATE_MIN_CLICKS clicks)}.
function pool(rows) {
  const clicks = rows.reduce((t, r) => t + r.clicks, 0);
  const impressions = rows.reduce((t, r) => t + r.impressions, 0);
  return {
    clicks,
    impressions,
    searches: rows.length,
    rate: clicks >= RATE_MIN_CLICKS && impressions > 0 ? clicks / impressions : null,
  };
}

const poolWords = (p, label) =>
  p.rate === null
    ? `${label}: not enough clicks yet (${clicksWord(p.clicks)} from ${n0(p.impressions)} views)`
    : `${label}: ${rateText(p.rate)} (${clicksWord(p.clicks)} from ${n0(p.impressions)} views)`;

// The pooled page rate over `win`: each page's own views and clicks from the daily page rows, the pages
// shown SEARCH_MIN_IMP times or more, total clicks over total views. {clicks, impressions, pages, rate}.
function pageRateOf(gsc, win) {
  const pageMap = new Map();
  for (const p of gsc?.pageDaily ?? []) {
    if (!p?.page || p.date < win.start || p.date > win.end) continue;
    const a = pageMap.get(p.page) ?? { clicks: 0, impressions: 0 };
    a.clicks += Number(p.clicks) || 0;
    a.impressions += Number(p.impressions) || 0;
    pageMap.set(p.page, a);
  }
  const counted = pool([...pageMap.values()].filter((p) => p.impressions >= SEARCH_MIN_IMP));
  return { clicks: counted.clicks, impressions: counted.impressions, pages: counted.searches, rate: counted.rate };
}

// The site's own pooled click rates. gsc: the Search Console snapshot data; range: the stored latest
// 28 days, the period the cards' own numbers come from. {available, window ('90-day' | '28-day'),
// range and days (the days the rates cover), cardRange and cardDays (the cards' period),
// minImpressions, minClicks, searches, bands: [{from, to, label, clicks, impressions, searches, rate}],
// top5 (positions 3 to 5 together), site (every counted search), pages ({clicks, impressions, pages,
// rate}), text}.
export function clickRates(gsc, { brands = [], range = null } = {}) {
  const card = range ?? gsc?.windows?.cur ?? null;
  const d90 = realQueryCounts(gsc, 'd90');
  const use90 = Boolean(d90?.size && gsc?.windows?.d90?.start);
  const real = use90 ? d90 : realQueryCounts(gsc, 'cur');
  const win = use90 ? gsc.windows.d90 : card;
  const window = use90 ? '90-day' : '28-day';
  const base = {
    window,
    range: rangeOf(win),
    days: daysOf(win),
    cardRange: rangeOf(card),
    cardDays: daysOf(card),
    minImpressions: SEARCH_MIN_IMP,
    minClicks: RATE_MIN_CLICKS,
  };
  const empty = { clicks: 0, impressions: 0, searches: 0, rate: null };
  // The page rate needs only the daily page rows, so it is there even without the per-search counts.
  const pages = base.days ? pageRateOf(gsc, win) : { clicks: 0, impressions: 0, pages: 0, rate: null };
  if (!real || !base.days || !base.cardDays)
    return {
      ...base,
      available: false,
      searches: 0,
      bands: [],
      top5: { ...empty, label: 'positions 3 to 5' },
      site: { ...empty, label: 'all your searches' },
      pages,
      text: 'Not enough data for click estimates: the per-search counts from Search Console are missing.',
    };
  const rows = [...real.values()]
    .filter((s) => s.impressions >= SEARCH_MIN_IMP && s.position > 0 && !isBrand(s.query, brands))
    .map((s) => ({ ...s, place: Math.max(1, Math.round(s.position)) }));
  const inBand = (from, to) => rows.filter((s) => s.place >= from && s.place <= to);
  const bands = BANDS.map(([from, to]) => ({
    from,
    to,
    label: `positions ${from} to ${to}`,
    ...pool(inBand(from, to)),
  }));

  const out = {
    ...base,
    available: rows.length > 0,
    searches: rows.length,
    bands,
    top5: { from: 3, to: 5, label: 'positions 3 to 5', ...pool(inBand(3, 5)) },
    site: { label: 'all your searches', ...pool(rows) },
    pages,
  };
  out.text = out.available
    ? `Your own ${window} click rates, ${base.range.text}, from ${n0(rows.length)} ${rows.length === 1 ? 'search' : 'searches'} shown ${SEARCH_MIN_IMP} times or more (brand searches left out), total clicks over total views: ${[...bands, out.top5, out.site].map((b) => poolWords(b, b.label)).join('; ')}; ${poolWords(pages, `${n0(pages.pages)} pages`)}. A rate needs ${RATE_MIN_CLICKS} clicks.`
    : `Not enough data for click estimates: no search outside the brand list was shown ${SEARCH_MIN_IMP} times or more from ${base.range.text}.`;
  return out;
}

// The band a place falls in (its average rounded), or null past position 20.
export function bandAt(rates, position) {
  const p = Math.max(1, Math.round(Number(position) || 0));
  return rates?.bands?.find((b) => p >= b.from && p <= b.to) ?? null;
}

// The words a card says about one pooled rate: "your own 90-day click rate at positions 3 to 5, 0.9%"
// for a line, and "(36 clicks from 2,600 views, 31 July to 28 October)" for its sum.
const poolSource = (rates, p, kind) =>
  kind === 'page'
    ? `your own ${rates.window} page click rate, ${rateText(p.rate)}`
    : `your own ${rates.window} click rate ${kind === 'site' ? 'across' : 'at'} ${p.label}, ${rateText(p.rate)}`;
const poolTotals = (rates, p) =>
  `${clicksWord(p.clicks)} from ${n0(p.impressions)} views, ${rates.range?.text ?? 'the stored days'}`;

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
// A pool under RATE_MIN_CLICKS clicks: no rate, so no number.
const notEnoughClicks = (rates, p, what) => ({
  state: 'not-enough',
  clicks: null,
  text: `Not enough clicks yet to estimate: ${what} had ${poolTotals(rates, p)}, and a rate needs ${RATE_MIN_CLICKS} clicks.`,
  how: null,
  short: 'Not enough clicks',
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
// below a month is no estimate, and shows no number (never a negative one).
function monthly(gain, days, { lead, source, range, zero = null }, how) {
  const month = (gain * 30) / days;
  const clicks = Math.round(month);
  const howText = `${how} Over a month: ${gain.toFixed(1)} x 30 / ${days} = ${month.toFixed(1)}.`;
  if (!(clicks > 0))
    return {
      state: 'zero',
      clicks: null,
      text: zero ?? 'No click estimate: at your own click rate this would not add clicks.',
      how: null,
      short: 'None',
    };
  return estimate(
    clicks,
    `About ${n0(clicks)} extra ${clicks === 1 ? 'click' : 'clicks'} a month ${lead} (an estimate from ${source}${range ? `, ${range}` : ''}).`,
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
// (whole clicks a month, only for an estimate), text (the card's line), how (the arithmetic, or null),
// short (a table cell)}.
export function upsideOf(opp, { rates, real } = {}) {
  const type = opp?.type;
  const cardDays = rates?.cardDays ?? 28;
  const cardText = rates?.cardRange?.text ?? 'the latest 28 days';
  const rateRange = rates?.range?.text ?? null;

  if (type === 'near-page-one' || type === 'question') {
    if (!rates?.available) return notEnough('your own click rates could not be worked out.');
    const { s, rate, why } = searchOf(real, opp.query);
    if (!s) return notEnough(why);
    const kind = type === 'near-page-one' ? 'band' : 'site';
    const p = kind === 'band' ? rates.top5 : rates.site;
    const what = kind === 'band' ? 'your searches at positions 3 to 5' : 'your searches';
    if (p.rate === null) return notEnoughClicks(rates, p, what);
    const gain = s.impressions * (p.rate - rate);
    return monthly(
      gain,
      cardDays,
      {
        lead: type === 'near-page-one' ? 'if the page reaches the top 5' : 'if this works',
        source: poolSource(rates, p, kind),
        range: rateRange,
      },
      `"${s.query}" was shown ${times(s.impressions)} and clicked ${times(s.clicks)} (${rateText(rate)}) from ${cardText}. Your own ${rates.window} click rate ${kind === 'site' ? 'across' : 'at'} ${p.label} is ${rateText(p.rate)} (${poolTotals(rates, p)}). ${n0(s.impressions)} x (${rateText(p.rate)} minus ${rateText(rate)}) = ${gain.toFixed(1)} clicks.`
    );
  }

  if (type === 'low-click-rate') {
    if (!rates) return notEnough('your own click rates could not be worked out.');
    const e = opp.evidence?.[0];
    if (!e || !(e.impressions >= MIN_BASE())) return notEnough(`the page was shown fewer than ${MIN_BASE()} times.`);
    const rate = (e.clicks || 0) / e.impressions;
    const top5 = Math.round(e.position) <= 5;
    const p = top5 ? bandAt(rates, e.position) : rates.pages;
    if (!p) return notEnough('no search counted at that position.');
    const what = top5 ? `your searches at ${p.label}` : 'your pages';
    if (p.rate === null) return notEnoughClicks(rates, p, what);
    const where = top5
      ? `Your own ${rates.window} click rate at ${p.label} is ${rateText(p.rate)} (${poolTotals(rates, p)}).`
      : `Your own ${rates.window} page click rate is ${rateText(p.rate)} (${poolTotals(rates, p)}, ${n0(p.pages)} pages shown ${SEARCH_MIN_IMP} times or more).`;
    const gain = e.impressions * (p.rate - rate);
    return monthly(
      gain,
      cardDays,
      { lead: 'if this works', source: poolSource(rates, p, top5 ? 'band' : 'page'), range: rateRange },
      `${e.page ?? opp.page} was shown ${times(e.impressions)} at an average position of ${Number(e.position).toFixed(1)} and clicked ${times(e.clicks || 0)} (${rateText(rate)}) from ${cardText}. ${where} ${n0(e.impressions)} x (${rateText(p.rate)} minus ${rateText(rate)}) = ${gain.toFixed(1)} clicks.`
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
    const days = span ? Math.round(span / 2) : cardDays;
    const lost = (before.clicks || 0) - (after.clicks || 0);
    return monthly(
      lost,
      days,
      {
        lead: 'if this works',
        source: 'the clicks the page lost',
        zero: 'No click estimate: the page did not lose clicks.',
        range: opp.range?.start ? longRange(opp.range.start, opp.range.end) : cardText,
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
