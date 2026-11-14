// Routes for the Overview page and the sidebar counts. The overview reads the same windows,
// movement and like for like figure as the Search page, so the two never disagree; the one new
// number is the whole-site click rate, which comes from the site totals and never from search rows.

import { get, bad, q } from '../kit.mjs';
import { buildModel, envelope, rangeOf, memo } from '../model.mjs';
import { windowsFor, pagesTable, queriesTable, targetsView, RANGES } from '../search.mjs';
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
} from './insights.mjs';

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

export function overviewView(model, days) {
  const gsc = model.data.gsc;
  const { cur, prev } = windowsFor(model, days);
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
  const countTile = (key, label, now, before) => {
    const change = comparable ? pct(now, before) : null;
    const note = !site.length
      ? 'Not enough data yet.'
      : !comparable
        ? `Not enough history yet to compare with the ${days} days before.`
        : change === null
          ? `Not enough data yet for a percentage (the earlier period had ${n0(before)}).`
          : `Compared with ${n0(before)} in the ${days} days before (${longRange(prev.start, prev.end)}).`;
    return tile(key, label, site.length ? now : null, change, 'percent', note);
  };

  // The whole-site click rate: clicks over impressions from the site totals, with 500 impressions
  // behind it. The change is in percentage points, and only when both periods have enough.
  const rate = site.length ? clickRateOf(clicks, impressions) : null;
  const prevRate = comparable ? clickRateOf(prevClicks, prevImpressions) : null;
  const rateTile = tile(
    'clickRate',
    'Click rate',
    rate,
    rate !== null && prevRate !== null ? round1((rate - prevRate) * 100) : null,
    'points',
    rate === null
      ? `Not enough data yet: a click rate needs at least ${n0(CLICK_RATE_MIN_IMPRESSIONS)} impressions in the period, and this one had ${n0(impressions)}.`
      : 'Clicks divided by times shown, for the whole site.',
    { valueText: rate === null ? null : `${round1(rate * 100)}%` }
  );

  const like = targetsView(model).likeForLike;
  const positionTile = tile(
    'targetPosition',
    'Target keyword position',
    like.mean,
    like.mean !== null && like.prevMean !== null ? round1(like.prevMean - like.mean) : null,
    'positions',
    TARGET_NOTE,
    {
      enoughData: like.enough,
      range: like.range ?? range,
      detail: like.enough
        ? `Mean over the ${like.n} of ${like.targetsTotal} target keywords that have data in both periods. A lower place is better.`
        : `Not enough data yet: only ${like.n} of ${like.targetsTotal} target keywords have data in both periods.`,
    }
  );

  const queriesT = queriesTable(model, days);
  const pagesT = pagesTable(model, days);
  const countries = [...(gsc?.countries ?? [])]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, COUNTRIES)
    .map((c) => ({ country: c.country, clicks: c.clicks, impressions: c.impressions }));

  return {
    ...envelope(model, { need: ['gsc'], range }),
    days,
    ranges: RANGES,
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
    queriesRange: rangeOf(queriesT.range),
    queriesNote:
      days < 28
        ? 'The searches list covers the last 28 days, because Search Console is pulled in 28 day periods.'
        : days > 28
          ? 'The searches list covers the last 90 days, the longest period the desk pulls searches for.'
          : null,
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
    return {
      keywordMap: gsc ? keywordTable(model).counters.all : null,
      cannibalization: gsc ? cannibalizationItems(model).length : null,
      runnerUp: gsc ? runnerUpItems(model).length : null,
      contentGaps: gsc ? gapItems(model).length : null,
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
  };
}

// ---------------------------------------------------------------- the routes

export const routes = [
  get('/api/overview', (ctx) => {
    const days = q(ctx, 'range') === '' ? 28 : Number(q(ctx, 'range'));
    if (!RANGES.includes(days)) throw bad(`range must be one of: ${RANGES.join(', ')}.`);
    return overviewView(buildModel(), days);
  }),
  get('/api/nav', () => {
    const model = buildModel();
    return { ...envelope(model), counts: navCounts(model) };
  }),
];
