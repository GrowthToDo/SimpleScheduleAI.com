// Routes for the Overview page and the sidebar counts. The overview reads the same windows,
// movement and like for like figure as the Search page, so the two never disagree; the one new
// number is the whole-site click rate, which comes from the site totals and never from search rows.

import { get, bad, q } from '../kit.mjs';
import { buildModel, envelope, rangeOf, memo, deskToday } from '../model.mjs';
import { windowsFor, pagesTable, pagesTableFor, queriesTable, targetsView, RANGES, SUMMED_NOTE } from '../search.mjs';
import { periodFor, perDayChange } from '../../month.mjs';
import { RANGE_OPTIONS } from '../../explore.mjs';
import { gscEnd } from '../../sources/gsc.mjs';
import { timelineEvents, weekModel, openOpportunityCount } from '../work.mjs';
import { n0, round1, pct, sumRange, coversFrom } from '../fmt.mjs';
import { longRange, spanText } from '../../text.mjs';
import { latestAuditCounts } from './audit.mjs';
import { openLinkSuggestions } from './topics.mjs';
import { clickRateOf, CLICK_RATE_MIN_IMPRESSIONS } from '../../insights.mjs';
import {
  cannibalizationItems,
  runnerUpItems,
  gapItems,
  decayItems,
  keywordTable,
  secondaryKeywordItems,
  countsMissing,
} from './insights.mjs';
import { COUNTS_MISSING_NOTE } from '../../query-counts.mjs';

const TARGET_NOTE =
  'Site-wide average position misleads while new posts publish weekly, so this is the average for the keywords you target that have data in both periods.';
const TOP_N = 10;
const COUNTRIES = 10;

// ---------------------------------------------------------------- the overview

// The part of `win` the daily rows really cover: from the first row inside it (the desk may hold less
// history than the range asks for) to the end. {start, end, text, short}; text carries the years when
// the range runs across two.
function coveredRange(rows, win) {
  let first = null;
  for (const r of rows ?? [])
    if (r.date >= win.start && r.date <= win.end && (!first || r.date < first)) first = r.date;
  const short = Boolean(first) && first > win.start;
  const start = short ? first : win.start;
  return { start, end: win.end, text: spanText(start, win.end), short };
}

// The choices the date bar offers on Performance (the explorer's, so Queries and Pages read the same).
export const RANGE_SPECS = RANGE_OPTIONS.map((o) => o.value);
const MONTH_SPECS = new Set(['this-month', 'last-month']);

// The period a choice covers and the one it is compared with. 7, 28, 90 days and 16 months end on the
// stored end date and compare with the same number of days before (windowsFor). Any other choice
// (14 days, this month, last month, last quarter, a custom range) comes from periodFor: months and
// quarters are compared with the month or quarter before, on per-day averages when the lengths differ.
function periodOf(model, spec) {
  if (typeof spec === 'number') {
    const { cur, prev } = windowsFor(model, spec);
    return { cur, prev, days: spec, sameLength: true, againstText: null, compareText: null, spec: String(spec) };
  }
  const end = gscEnd(model.data?.gsc, model.snapObjs.gsc?.through ?? model.range.end);
  const p = periodFor(spec, deskToday(), end);
  return {
    cur: { start: p.cur.start, end: p.cur.end },
    prev: { start: p.prev.start, end: p.prev.end },
    days: p.cur.days,
    prevDays: p.prev.days,
    sameLength: p.sameLength,
    againstText: p.againstText,
    compareText: p.compareText,
    spec: String(spec.range),
  };
}

// spec: a number of days (7, 28, 90, 480), or {range, start, end} for any other date-bar choice.
export function overviewView(model, spec = 28) {
  const gsc = model.data.gsc;
  const period = periodOf(model, spec);
  const { cur, prev, days } = period;
  const site = gsc?.siteDaily ?? [];
  // The range the numbers and the chart really cover, never more than the desk holds.
  const covered = coveredRange(site, cur);
  const range = { start: covered.start, end: covered.end, text: covered.text };
  const pagesCovered = coveredRange(gsc?.pageDaily ?? [], cur);
  const comparable = coversFrom(site, prev.start);
  const sum = (start, end, field) => sumRange(site, start, end, field);
  const clicks = sum(cur.start, cur.end, 'clicks');
  const impressions = sum(cur.start, cur.end, 'impressions');
  const prevClicks = sum(prev.start, prev.end, 'clicks');
  const prevImpressions = sum(prev.start, prev.end, 'impressions');
  const before = period.sameLength ? `the ${days} days before` : 'the period before';

  const tile = (key, label, value, change, changeKind, note, extra = {}) => ({
    key,
    label,
    value,
    change,
    changeKind,
    note,
    enoughData: value !== null,
    range,
    ...extra,
  });
  // Periods of the same length compare totals; periods of different lengths (a month against the
  // month before) compare per-day averages, and the tile says so (against).
  const countTile = (key, label, now, earlier) => {
    const change = !comparable
      ? null
      : period.sameLength
        ? pct(now, earlier)
        : perDayChange(now, period.days, earlier, period.prevDays);
    const note = !site.length
      ? 'Not enough data yet.'
      : !comparable
        ? `Not enough history yet to compare with ${before}.`
        : change === null
          ? `Not enough data yet for a percentage (the earlier period had ${n0(earlier)}).`
          : period.sameLength
            ? `Compared with ${n0(earlier)} in ${before} (${longRange(prev.start, prev.end)}).`
            : `${n0(now)} in ${period.days} days against ${n0(earlier)} in ${period.prevDays} days (${longRange(prev.start, prev.end)}), compared per day.`;
    return tile(key, label, site.length ? now : null, change, 'percent', note, {
      against: change === null ? null : period.againstText,
    });
  };

  // The whole-site click rate: clicks over impressions from the site totals, with 500 impressions
  // behind it. The change is in percentage points, and only when both periods have enough.
  const rate = site.length ? clickRateOf(clicks, impressions) : null;
  const prevRate = comparable ? clickRateOf(prevClicks, prevImpressions) : null;
  // The change subtracts the unrounded rates, then rounds: two rates that both round to 0.7% can
  // still be 0.1 points apart.
  const rateTile = tile(
    'clickRate',
    'Click rate',
    rate,
    rate !== null && prevRate !== null ? round1((clicks / impressions - prevClicks / prevImpressions) * 100) : null,
    'points',
    rate === null
      ? `Not enough data yet: a click rate needs at least ${n0(CLICK_RATE_MIN_IMPRESSIONS)} impressions in the period, and this one had ${n0(impressions)}.`
      : 'Clicks divided by times shown, for the whole site.',
    {
      valueText: rate === null ? null : `${round1(rate * 100)}%`,
      against: period.sameLength ? null : `against ${longRange(prev.start, prev.end)}`,
    }
  );

  const like = targetsView(model).likeForLike;
  const likeRange = like.range ?? range;
  // The target keyword position covers its own stored 28 days; on any other dates its tile says so.
  const ownDates = likeRange && (likeRange.start !== range.start || likeRange.end !== range.end);
  const positionTile = tile(
    'targetPosition',
    'Target keyword position',
    like.mean,
    like.mean !== null && like.prevMean !== null ? round1(like.prevMean - like.mean) : null,
    'positions',
    TARGET_NOTE,
    {
      enoughData: like.enough,
      range: likeRange,
      rangeLine: ownDates
        ? `Covers ${likeRange.text}, the target keywords' own 28 days.${MONTH_SPECS.has(period.spec) ? ' The Monthly report has this number for the month itself.' : ''}`
        : null,
      detail: like.enough
        ? `Mean over the ${like.n} of ${like.targetsTotal} target keywords that have data in both periods. A lower place is better.`
        : `Not enough data yet: only ${like.n} of ${like.targetsTotal} target keywords have data in both periods.`,
    }
  );

  // The searches list is stored for the latest 28 and 90 days only: the nearer of the two, with its
  // own dates. Pages come from the daily page rows for the chosen dates.
  const listDays = Math.abs(days - 28) <= Math.abs(days - 90) ? 28 : 90;
  const queriesT = queriesTable(model, typeof spec === 'number' ? days : listDays);
  const pagesT = typeof spec === 'number' ? pagesTable(model, days) : pagesTableFor(model, cur, prev);
  const countries = [...(gsc?.countries ?? [])]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, COUNTRIES)
    .map((c) => ({ country: c.country, clicks: c.clicks, impressions: c.impressions }));
  const queriesRange = rangeOf(queriesT.range);
  const listOwnDates = queriesRange && (queriesRange.start !== range.start || queriesRange.end !== range.end);

  return {
    ...envelope(model, { need: ['gsc'], range }),
    days,
    spec: period.spec,
    ranges: RANGES,
    rangeSpecs: RANGE_SPECS,
    // How the numbers are compared, when it is not simply "the same number of days before".
    compareText: period.compareText,
    // True when the desk holds less daily history than the range asks for: the range is then what it
    // holds, and the big numbers make no comparison with a period before.
    short: covered.short,
    coverageNote: covered.short ? `Showing ${covered.text}: all the daily history the desk has so far.` : null,
    tiles: [
      countTile('clicks', 'Google clicks', clicks, prevClicks),
      countTile('impressions', 'Google impressions', impressions, prevImpressions),
      rateTile,
      positionTile,
    ],
    series: site
      .filter((r) => r.date >= cur.start && r.date <= cur.end)
      .map((r) => ({ date: r.date, clicks: Number(r.clicks) || 0, impressions: Number(r.impressions) || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    markers: timelineEvents(model, { start: cur.start, end: cur.end }),
    topQueries: queriesT.rows
      .filter((r) => r.impressions > 0)
      .slice(0, TOP_N)
      .map((r) => ({
        query: r.query,
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
        brand: r.brand,
      })),
    queriesRange,
    queriesNote:
      [
        typeof spec !== 'number' && listOwnDates
          ? `The searches list is stored for the latest 28 and 90 days only, so it shows ${queriesRange.text}. The Queries page pulls the exact dates.`
          : days < 28
            ? 'The searches list covers the last 28 days, because Search Console is pulled in 28 day periods.'
            : days > 28 && typeof spec === 'number'
              ? 'The searches list covers the last 90 days, the longest period the desk pulls searches for.'
              : null,
        queriesT.summed ? SUMMED_NOTE : null,
        queriesT.countsMissing ? COUNTS_MISSING_NOTE : null,
        queriesT.waitNote,
      ]
        .filter(Boolean)
        .join(' ') || null,
    // The dates the Top pages list covers (the daily page rows may hold less than the range).
    pagesRange: { start: pagesCovered.start, end: pagesCovered.end, text: pagesCovered.text },
    topPages: pagesT.rows
      .filter((r) => r.impressions > 0)
      .slice(0, TOP_N)
      .map((r) => ({
        page: r.page,
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
        clickRate: r.ctr,
      })),
    countries,
    devices: (gsc?.devices ?? []).map((d) => ({ device: d.device, clicks: d.clicks, impressions: d.impressions })),
    // Countries and devices are stored for the latest 28 days only, whatever the dates chosen.
    breakdownRange: rangeOf(gsc?.windows?.cur),
    breakdownNote: gsc?.windows?.cur
      ? `${longRange(gsc.windows.cur.start, gsc.windows.cur.end)}, the latest 28 days: countries and devices are stored for those dates only.`
      : null,
  };
}

// ---------------------------------------------------------------- the sidebar counts

const pulled = (model, source) => Boolean(model.snapObjs[source]?.pulledAt);

// One number per sidebar item, or null when the source it depends on has never been pulled: a
// missing source is not a zero. Each is the first number of its page, worked out by the same
// function the page's route uses:
//   internalLinks   the link suggestions still to do on the Internal links page
//   opportunities   the open opportunities (new, in progress or came back) on All opportunities
//   auditToFix      the latest audit's open critical and high issues (auditOpen: every open issue);
//                   the score stays on the page, auditScore is kept for older readers
export function navCounts(model) {
  const counts = memo(model, 'nav:counts', () => {
    const gsc = pulled(model, 'gsc');
    const anyData = ['gsc', 'bing', 'local'].some((s) => pulled(model, s));
    // Without the per-search counts these two lists cannot be worked out: no number (a dash), not 0.
    const counted = gsc && !countsMissing(model);
    return {
      keywordMap: gsc ? keywordTable(model).counters.all : null,
      cannibalization: counted ? cannibalizationItems(model).length : null,
      runnerUp: gsc ? runnerUpItems(model).length : null,
      contentGaps: counted ? gapItems(model).length : null,
      decay: gsc ? decayItems(model).length : null,
      secondaryKeywords: gsc ? secondaryKeywordItems(model).length : null,
      internalLinks: openLinkSuggestions(model),
      opportunities: anyData ? openOpportunityCount(model) : null,
      worries: anyData ? weekModel(model).worries.length : null,
    };
  });
  // The audit is read fresh: a run that just finished does not change the model.
  const audit = latestAuditCounts();
  return {
    ...counts,
    auditToFix: audit?.toFix ?? null,
    auditOpen: audit?.open ?? null,
    auditScore: audit?.score ?? null,
    // The sidebar shows no tick for an audit that stopped early or is more than two weeks old.
    auditStoppedEarly: audit?.stoppedEarly ?? null,
    auditOld: audit?.old ?? null,
  };
}

// ---------------------------------------------------------------- the routes

export const routes = [
  get('/api/overview', (ctx) => {
    const asked = q(ctx, 'range') === '' ? '28' : q(ctx, 'range');
    if (RANGES.includes(Number(asked)) && /^\d+$/.test(asked)) return overviewView(buildModel(), Number(asked));
    if (!RANGE_SPECS.includes(asked)) throw bad(`range must be one of: ${RANGE_SPECS.join(', ')}.`);
    return overviewView(buildModel(), { range: asked, start: q(ctx, 'start'), end: q(ctx, 'end') });
  }),
  get('/api/nav', () => {
    const model = buildModel();
    return { ...envelope(model), counts: navCounts(model) };
  }),
];
