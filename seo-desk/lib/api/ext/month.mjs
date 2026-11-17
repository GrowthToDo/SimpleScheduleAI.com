// The Monthly report (GET /api/month, GET /api/month.csv) and the Target keywords for any dates
// (GET /api/targets/range). One calendar month on one page: four big numbers against the month
// before, the days of the month, a few plain sentences built from the numbers, top pages, top
// searches, the target keywords, what was done in the month, other sources and when each was pulled.
//
// Site totals and page rows are stored, so they come from the snapshot. The searches of a calendar
// month are not stored: they are pulled from Search Console by search alone (lib/month.mjs
// periodRows) and cached, for good once the month is finished. The only file a GET here writes is that
// cache. Every change against the month before is on per-day averages (months differ in length).

import { get, q, bad, sendText } from '../kit.mjs';
import { buildModel, envelope, deskToday, deliberateEditsIn, rangeOf } from '../model.mjs';
import { openServer } from '../../mcp-client.mjs';
import { liveSession, SHARED_LOCK } from './explore.mjs';
import { gscEnd } from '../../sources/gsc.mjs';
import {
  MONTH_RE,
  monthName,
  monthsAvailable,
  defaultMonth,
  monthWindows,
  periodFor,
  perDayChange,
  sumDays,
  coversRange,
  pagesFromDaily,
  periodRows,
  cachedRows,
  fetchedText,
} from '../../month.mjs';
import { targetsCompare, TARGET_MOVE_PLACES } from '../search.mjs';
import { timelineEvents, verdictRows, upsideRanking } from '../work.mjs';
import { clickRateOf, CLICK_RATE_MIN_IMPRESSIONS } from '../../insights.mjs';
import { auditInRange } from './audit.mjs';
import { checkLinesIn } from '../../ai-visibility.mjs';
import { toCsv } from '../csv.mjs';
import { n0, round1 } from '../fmt.mjs';
import { longDate, longRange } from '../../text.mjs';
import { todayIso } from '../../dates.mjs';
import { THRESHOLDS } from '../../config.mjs';

export const STANDING_LINE = 'Search numbers show findability and credibility. They are not sales.';
export const CLICKS_FLOOR_NOTE =
  'Google hides clicks on rare searches, so the clicks per search are a floor: the real numbers are higher.';
const TOP_N = 10;
const SUMMARY_MAX = 5;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const perDay = (total, days) => (days > 0 ? round1(total / days) : null);
// A per-day figure as words: one decimal while it is small, a whole number with separators from 100.
const dayText = (v) => (v === null || v === undefined ? '' : v >= 100 ? n0(Math.round(v)) : String(v));
// A click rate as words, always with one decimal so 1.0% and 0.7% read alike.
const rateText = (rate) => `${(Math.round(rate * 1000) / 10).toFixed(1)}%`;
const pctWords = (p) => (p === null ? null : `${p > 0 ? '+' : ''}${p}% per day`);
const placeWords = (v) => (v === null || v === undefined ? 'no place' : Number(v).toFixed(1));

// The newest day Search Console has data for (the stored end, held back to the newest daily row).
export const newestDay = (model) => gscEnd(model.data.gsc, model.snapObjs.gsc?.through ?? null);

// ---------------------------------------------------------------- the rows a month needs

// The month's (and the month before's) rows by search and by page. Per-search rows are always a
// query-only pull; page rows come from the stored daily page rows when they hold every day, else from
// a pull by page. The month before is read only when the site's daily rows hold all of it, so there
// is something to compare with. cacheOnly: never pull (a missing range is null).
// {query: {cur, prev}, page: {cur, prev}, pageStored: {cur, prev}, fetched: [..], pulls}.
// The ranges a month needs from Search Console: its searches (and the month before's when there is
// something to compare with), and its page rows when the stored daily page rows do not hold every day.
function needsOf(model, win, comparable) {
  const pageDaily = model.data.gsc?.pageDaily ?? [];
  const out = [];
  for (const side of comparable ? ['cur', 'prev'] : ['cur']) {
    const r = win[side];
    out.push({ side, dim: 'query', start: r.start, end: r.end });
    if (!coversRange(pageDaily, r.start, r.end)) out.push({ side, dim: 'page', start: r.start, end: r.end });
  }
  return out;
}

// got: the answer for each need (periodRows' shape, or null), in needsOf's order.
function assembleRows(model, win, needs, got) {
  const pageDaily = model.data.gsc?.pageDaily ?? [];
  const out = {
    query: { cur: null, prev: null },
    page: { cur: null, prev: null },
    pageStored: { cur: false, prev: false },
    fetched: [],
    pulls: 0,
  };
  for (const side of ['cur', 'prev']) {
    const r = win[side];
    if (needs.some((n) => n.side === side) && coversRange(pageDaily, r.start, r.end)) {
      out.page[side] = pagesFromDaily(pageDaily, r.start, r.end);
      out.pageStored[side] = true;
    }
  }
  needs.forEach((n, i) => {
    const g = got[i];
    if (!g) return;
    out[n.dim][n.side] = g.rows;
    out.fetched.push({
      what: n.dim === 'page' ? 'pages' : 'searches',
      start: n.start,
      end: n.end,
      fetchedAt: g.fetchedAt,
      finished: g.finished,
    });
    if (!g.cached) out.pulls += 1;
  });
  return out;
}

// The month's (and the month before's) rows by search and by page. Per-search rows are always a
// query-only pull; page rows come from the stored daily page rows when they hold every day, else from
// a pull by page. The month before is read only when the site's daily rows hold all of it, so there
// is something to compare with. cacheOnly: never pull (a missing range is null).
// {query: {cur, prev}, page: {cur, prev}, pageStored: {cur, prev}, fetched: [..], pulls}.
export async function rowsFor(model, win, { call, now, cacheOnly = false, comparable }) {
  const newest = newestDay(model);
  const needs = needsOf(model, win, comparable);
  const got = [];
  for (const n of needs) got.push(await periodRows(n, { call, now, newest, cacheOnly }));
  return assembleRows(model, win, needs, got);
}

// The same from the cache and the store only, synchronously (the Ask digest never pulls).
export function cachedRowsFor(model, win, { now, comparable }) {
  const newest = newestDay(model);
  const needs = needsOf(model, win, comparable);
  return assembleRows(
    model,
    win,
    needs,
    needs.map((n) => cachedRows(n, { now, newest }))
  );
}

// ---------------------------------------------------------------- the pieces

function countTile(key, label, site, win, comparable, field) {
  const total = sumDays(site, win.cur.start, win.cur.end, field);
  const before = comparable ? sumDays(site, win.prev.start, win.prev.end, field) : null;
  const change = comparable ? perDayChange(total, win.cur.days, before, win.prev.days) : null;
  const a = perDay(total, win.cur.days);
  const b = comparable ? perDay(before, win.prev.days) : null;
  const note = !site.length
    ? 'Not enough data yet.'
    : !comparable
      ? 'The desk holds no daily numbers for the month before, so there is nothing to compare with.'
      : change === null
        ? `Not enough data yet for a percentage: ${n0(before)} in ${win.prev.text}, and a change needs at least ${THRESHOLDS.PCT_MIN_BASE}.`
        : `${n0(total)} in ${plural(win.cur.days, 'day', 'days')} is ${dayText(a)} a day, against ${dayText(b)} a day from ${win.prev.text} (${n0(before)} in ${plural(win.prev.days, 'day', 'days')}).`;
  return {
    key,
    label,
    value: site.length ? total : null,
    perDay: a,
    prevValue: before,
    prevPerDay: b,
    change,
    changeKind: 'percent',
    against: change === null ? null : win.againstText,
    note,
  };
}

function rateTile(site, win, comparable) {
  const c = sumDays(site, win.cur.start, win.cur.end, 'clicks');
  const i = sumDays(site, win.cur.start, win.cur.end, 'impressions');
  const pc = comparable ? sumDays(site, win.prev.start, win.prev.end, 'clicks') : 0;
  const pi = comparable ? sumDays(site, win.prev.start, win.prev.end, 'impressions') : 0;
  const rate = clickRateOf(c, i);
  const prevRate = comparable ? clickRateOf(pc, pi) : null;
  return {
    key: 'clickRate',
    label: 'Click rate',
    value: rate,
    valueText: rate === null ? null : rateText(rate),
    change: rate !== null && prevRate !== null ? round1((c / i - pc / pi) * 100) : null,
    changeKind: 'points',
    against: rate !== null && prevRate !== null ? `against ${win.prev.text}` : null,
    note:
      rate === null
        ? `Not enough data yet: a click rate needs at least ${n0(CLICK_RATE_MIN_IMPRESSIONS)} impressions, and this month had ${n0(i)}.`
        : `Clicks divided by times shown, for the whole site.${prevRate === null ? '' : ` ${rateText(prevRate)} in ${win.prev.text}.`}`,
  };
}

function positionTile(compare, win, searchError) {
  const like = compare?.likeForLike;
  return {
    key: 'targetPosition',
    label: 'Target keyword position',
    value: like?.enough ? like.mean : null,
    prevValue: like?.enough ? like.prevMean : null,
    change: like?.enough && like.prevMean !== null ? round1(like.prevMean - like.mean) : null,
    changeKind: 'positions',
    against: like?.enough ? `against ${win.prev.text}` : null,
    note: !compare
      ? (searchError ?? 'The searches for this month have not been pulled yet.')
      : like.enough
        ? `Mean place of the ${like.n} of ${like.targetsTotal} target keywords that have data in both months, the same like for like method as Performance. A lower place is better.`
        : `Not enough data yet: only ${like.n} of ${like.targetsTotal} target keywords have data in both months.`,
  };
}

// Top rows of one dimension with the change in times shown on per-day averages.
function topRows(cur, prev, win, comparable, { key, sortBy }) {
  if (!cur) return null;
  const before = new Map((prev ?? []).map((r) => [String(r[key]).toLowerCase().trim(), r]));
  return [...cur]
    .filter((r) => r.impressions > 0)
    .sort(
      (a, b) => b[sortBy] - a[sortBy] || b.impressions - a.impressions || String(a[key]).localeCompare(String(b[key]))
    )
    .slice(0, TOP_N)
    .map((r) => {
      const p = before.get(String(r[key]).toLowerCase().trim());
      return {
        [key]: r[key],
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.impressions ? round1(r.position) : null,
        prevImpressions: comparable && prev ? (p?.impressions ?? 0) : null,
        change:
          comparable && prev ? perDayChange(r.impressions, win.cur.days, p?.impressions ?? 0, win.prev.days) : null,
      };
    });
}

// The biggest rise and fall in times shown per day, measured in views and not in percent, among pages
// shown at least 20 times the month before: a page that went from 21 views to none is a 100% fall but
// tells the reader nothing, while a page that lost a few hundred views does.
function pageMovers(cur, prev, win) {
  if (!cur || !prev) return { riser: null, faller: null };
  const now = new Map(cur.map((r) => [r.page, r]));
  const list = prev
    .filter((p) => p.impressions >= THRESHOLDS.PCT_MIN_BASE)
    .map((p) => {
      const c = now.get(p.page)?.impressions ?? 0;
      return {
        page: p.page,
        before: p.impressions,
        after: c,
        change: perDayChange(c, win.cur.days, p.impressions, win.prev.days),
        gain: c / win.cur.days - p.impressions / win.prev.days,
      };
    })
    .filter((x) => x.change !== null);
  const riser =
    list.filter((x) => x.gain > 0).sort((a, b) => b.gain - a.gain || a.page.localeCompare(b.page))[0] ?? null;
  const faller =
    list.filter((x) => x.gain < 0).sort((a, b) => a.gain - b.gain || a.page.localeCompare(b.page))[0] ?? null;
  return { riser, faller };
}

// Exported for its test only.
export const pageMoversForTest = pageMovers;

function targetsBlock(compare, searchError) {
  if (!compare)
    return { available: false, note: searchError ?? 'The searches for this month have not been pulled yet.' };
  const shared = compare.rows
    .filter((r) => r.change !== null)
    .sort(
      (a, b) =>
        Math.abs(b.change) - Math.abs(a.change) || b.impressions - a.impressions || a.keyword.localeCompare(b.keyword)
    )
    .map((r) => ({
      keyword: r.keyword,
      page: r.page,
      position: r.position,
      prevPosition: r.prevPosition,
      change: r.change,
      move: r.move,
      impressions: r.impressions,
    }));
  return {
    available: true,
    improved: compare.moves.improved,
    held: compare.moves.held,
    slipped: compare.moves.slipped,
    noData: compare.moves.noData,
    total: compare.likeForLike.targetsTotal,
    rows: shared,
    note: `A target improved or slipped when its place moved by ${TARGET_MOVE_PLACES} place or more; anything smaller held. ${plural(compare.moves.noData, 'target keyword has', 'target keywords have')} no place in one of the two months, so ${compare.moves.noData === 1 ? 'it is' : 'they are'} not in the table.`,
  };
}

// What the desk's own records say was done inside the month.
function doneBlock(model, win) {
  const { start, end } = win.cur;
  const records = (model.edits ?? []).filter((e) => e.kind !== 'manual').map((e) => e.date);
  const firstRecord = records.length ? records.reduce((a, b) => (b < a ? b : a)) : null;
  const posts = (model.edits ?? [])
    .filter((e) => e.kind === 'publish' && e.date >= start && e.date <= end)
    .map((e) => ({ page: e.page, date: e.date, dateText: longDate(e.date) }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.page.localeCompare(b.page));
  const { list, gitFrom } = deliberateEditsIn(model, start, end);
  const edits = list.map((e) => ({ page: e.page, date: e.date, dateText: longDate(e.date), why: e.why }));
  // Verdicts read inside the month, one per distinct change (lib/changes.mjs, the Did it work reading).
  const changes = new Map();
  for (const v of verdictRows(model)) {
    if (!v.judgedOn || v.judgedOn < start || v.judgedOn > end) continue;
    if (!changes.has(v.changeId)) changes.set(v.changeId, { rows: [], v });
    changes.get(v.changeId).rows.push(v);
  }
  const verdicts = [...changes.values()].map(({ rows, v }) => {
    const pages = [...new Set(rows.flatMap((r) => (r.batch ? r.pages : [r.page])).filter(Boolean))];
    return {
      changeDate: v.changeDate,
      changeDateText: longDate(v.changeDate),
      judgedOn: v.judgedOn,
      pages,
      readable: v.changeVerdict !== 'unreadable',
      reads: v.changeVerdictText,
    };
  });
  const audit = auditInRange(start, end);
  return {
    posts,
    postsNote:
      firstRecord && start < firstRecord
        ? `The desk's record of published posts starts on ${longDate(firstRecord)} ${firstRecord.slice(0, 4)}, so this list may be short.`
        : null,
    edits,
    editsNote:
      !gitFrom || start < gitFrom
        ? `Edits found in git are read for the last 35 days only${gitFrom ? ` (from ${longDate(gitFrom)})` : ''}, so before that this list holds only the edits logged on the desk.`
        : null,
    verdicts: verdicts.filter((x) => x.readable),
    verdictsUnreadable: verdicts.filter((x) => !x.readable).length,
    audit,
    auditText: audit
      ? `The last technical audit in the month ran on ${audit.dateText} and scored ${audit.score} out of 100${audit.stoppedEarly ? ', though it stopped early' : ''}.`
      : 'No audit ran in this month.',
  };
}

function otherSources(model, win, comparable) {
  const { start, end } = win.cur;
  const name = win.label;
  const bingDaily = model.data.bing?.siteDaily ?? [];
  const bing = coversRange(bingDaily, start, end)
    ? (() => {
        const clicks = sumDays(bingDaily, start, end, 'clicks');
        const impressions = sumDays(bingDaily, start, end, 'impressions');
        const before =
          comparable && coversRange(bingDaily, win.prev.start, win.prev.end)
            ? sumDays(bingDaily, win.prev.start, win.prev.end, 'impressions')
            : null;
        return {
          clicks,
          impressions,
          change: before === null ? null : perDayChange(impressions, win.cur.days, before, win.prev.days),
          against: before === null ? null : win.againstText,
        };
      })()
    : null;
  const ga4Daily = model.data.ga4?.channelsDaily ?? [];
  const ga4 = coversRange(ga4Daily, start, end)
    ? (() => {
        const by = new Map();
        for (const r of ga4Daily) {
          if (r.date < start || r.date > end) continue;
          by.set(r.channel, (by.get(r.channel) ?? 0) + (Number(r.sessions) || 0));
        }
        const channels = [...by]
          .map(([channel, sessions]) => ({ channel, sessions }))
          .sort((a, b) => b.sessions - a.sessions || a.channel.localeCompare(b.channel));
        return { total: channels.reduce((s, c) => s + c.sessions, 0), channels };
      })()
    : null;
  const ai = checkLinesIn(model.data.local?.aeo ?? [], start, end);
  return {
    bing,
    bingText: bing ? null : `The desk holds no Bing daily numbers for all of ${name}.`,
    ga4,
    ga4Text: ga4 ? null : `The desk holds no GA4 visits by channel for all of ${name}.`,
    ai,
    aiText: ai.length ? null : `No AI citation check was saved in ${name}.`,
  };
}

// Three to five sentences built only from the numbers on the page. Never a cause.
function whatChanged({ win, tiles, movers, targets, done, comparable }) {
  const out = [];
  const [clicks, imps] = tiles;
  if (imps.value !== null) {
    let s = `Google showed the site ${n0(imps.value)} times from ${win.cur.text} and sent ${plural(clicks.value, 'click', 'clicks')}`;
    s +=
      comparable && imps.change !== null
        ? `: ${dayText(imps.perDay)} times a day, against ${dayText(imps.prevPerDay)} a day from ${win.prev.text} (${pctWords(imps.change)}).`
        : '.';
    out.push(s);
  }
  if (movers.riser || movers.faller) {
    const parts = [];
    if (movers.riser)
      parts.push(
        `${movers.riser.page} rose most, from ${n0(movers.riser.before)} to ${n0(movers.riser.after)} times shown (${pctWords(movers.riser.change)})`
      );
    if (movers.faller)
      parts.push(
        `${movers.faller.page} fell most, from ${n0(movers.faller.before)} to ${n0(movers.faller.after)} (${pctWords(movers.faller.change)})`
      );
    out.push(`Among pages shown at least ${THRESHOLDS.PCT_MIN_BASE} times from ${win.prev.text}, ${parts.join('; ')}.`);
  }
  if (targets.available && targets.rows.length) {
    let s = `Of the ${plural(targets.rows.length, 'target keyword', 'target keywords')} with a place in both months, ${targets.improved} improved, ${targets.held} held and ${targets.slipped} slipped.`;
    const up = targets.rows.filter((r) => r.move === 'improved').sort((a, b) => b.change - a.change)[0];
    const down = targets.rows.filter((r) => r.move === 'slipped').sort((a, b) => a.change - b.change)[0];
    const moves = [];
    if (up)
      moves.push(`"${up.keyword}" moved up most, from ${placeWords(up.prevPosition)} to ${placeWords(up.position)}`);
    if (down)
      moves.push(
        `"${down.keyword}" slipped most, from ${placeWords(down.prevPosition)} to ${placeWords(down.position)}`
      );
    if (moves.length) s += ` ${moves.join('; ')}.`;
    out.push(s);
  }
  out.push(
    `${plural(done.posts.length, 'post was', 'posts were')} published and ${plural(done.edits.length, 'deliberate page edit was', 'deliberate page edits were')} recorded from ${win.cur.text}.`
  );
  return out.slice(0, SUMMARY_MAX);
}

// ---------------------------------------------------------------- the view

// month: 'YYYY-MM' (validated by the route). rows: rowsFor's result, or null. searchError: the plain
// sentence of a failed pull, shown where the searches would be.
export function monthView(model, month, rows, { searchError = null } = {}) {
  const gsc = model.data.gsc;
  const site = gsc?.siteDaily ?? [];
  const newest = newestDay(model);
  const months = monthsAvailable(site, newest);
  const win = monthWindows(month, newest);
  const comparable = coversRange(site, win.prev.start, win.prev.end);
  const compare = rows?.query.cur
    ? targetsCompare(
        model,
        { cur: rows.query.cur, prev: comparable ? (rows.query.prev ?? []) : [], range: win.cur, prevRange: win.prev },
        { alignment: false }
      )
    : null;
  const tiles = [
    countTile('clicks', 'Google clicks', site, win, comparable, 'clicks'),
    countTile('impressions', 'Google impressions', site, win, comparable, 'impressions'),
    rateTile(site, win, comparable),
    positionTile(compare, win, searchError),
  ];
  const movers = pageMovers(rows?.page.cur, comparable ? rows?.page.prev : null, win);
  const targets = targetsBlock(compare, searchError);
  const done = doneBlock(model, win);
  const sources = model.snapObjs ?? {};
  const pulled = (s) => (sources[s]?.pulledAt ? longDate(todayIso(new Date(sources[s].pulledAt))) : null);
  const footer = [
    newest
      ? `Search Console data runs through ${longDate(newest)} ${newest.slice(0, 4)}.`
      : 'No Search Console data has been pulled yet.',
    pulled('gsc') ? `Daily totals and page rows: Search Console, pulled on ${pulled('gsc')}.` : null,
    ...(rows?.fetched ?? []).map(
      (f) => `${f.what === 'pages' ? 'Pages' : 'Searches'} for ${longRange(f.start, f.end)}: ${fetchedText(f)}.`
    ),
    pulled('bing') ? `Bing: pulled on ${pulled('bing')}.` : null,
    pulled('ga4') ? `GA4: pulled on ${pulled('ga4')}.` : null,
    pulled('local') ? `AI citation checks and the desk's records: read on ${pulled('local')}.` : null,
  ].filter(Boolean);
  return {
    ...envelope(model, { need: ['gsc'], range: rangeOf(win.cur) }),
    month,
    label: win.label,
    soFar: win.soFar,
    months: months.map((m) => ({ month: m.month, label: m.label, soFar: m.soFar })),
    standingLine: STANDING_LINE,
    cur: win.cur,
    prev: { ...win.prev, label: monthName(win.prev.month) },
    comparable,
    compareText: comparable
      ? win.compareText
      : 'The desk holds no daily numbers for the month before, so nothing is compared.',
    tiles,
    series: site
      .filter((r) => r.date >= win.cur.start && r.date <= win.cur.end)
      .map((r) => ({ date: r.date, clicks: Number(r.clicks) || 0, impressions: Number(r.impressions) || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    markers: timelineEvents(model, { start: win.cur.start, end: win.cur.end }),
    summary: whatChanged({ win, tiles, movers, targets, done, comparable }),
    topPages: topRows(rows?.page.cur, comparable ? rows?.page.prev : null, win, comparable, {
      key: 'page',
      sortBy: 'clicks',
    }),
    topPagesNote:
      'By clicks. Times shown and average place are for the whole page. The change is in times shown per day.',
    topSearches: topRows(rows?.query.cur, comparable ? rows?.query.prev : null, win, comparable, {
      key: 'query',
      sortBy: 'impressions',
    }),
    topSearchesNote: `By times shown, from Search Console's count of each search on its own. ${CLICKS_FLOOR_NOTE}`,
    searchError,
    targets,
    done,
    other: otherSources(model, win, comparable),
    // The open opportunities with the most extra clicks a month they could bring, from the latest stored
    // 28 days (not this month): the same estimate the cards show (lib/upside.mjs).
    upside: upsideBlock(model),
    footer,
  };
}

function upsideBlock(model) {
  const r = upsideRanking(model, TOP_N);
  const dates = r.range?.text
    ? `from ${r.range.text}, the latest stored 28 days, not this month`
    : 'from the latest stored days';
  return {
    ...r,
    title: 'Most extra clicks it could bring, now',
    sectionNote: `Open opportunities ranked by the extra clicks a month each could bring, estimated ${dates}. ${r.note}`,
    empty: r.count ? null : 'No open opportunity has a click estimate right now.',
  };
}

// ---------------------------------------------------------------- the CSV

// One file with three sections (pages, searches, target keywords), every row carrying the month and
// its dates. Full lists, not only the top ten.
export function monthCsv(model, month, rows) {
  const v = monthView(model, month, rows);
  const win = monthWindows(month, newestDay(model));
  const dates = longRange(win.cur.start, win.cur.end);
  const prevDates = longRange(win.prev.start, win.prev.end);
  const before = (list, key) => new Map((list ?? []).map((r) => [String(r[key]).toLowerCase().trim(), r]));
  const lines = [];
  const add = (section, name, page, r, prev, extra = {}) =>
    lines.push({
      section,
      month: v.label,
      dates,
      prevDates: v.comparable ? prevDates : '',
      name,
      page,
      clicks: r.clicks ?? '',
      impressions: r.impressions ?? '',
      position: r.position ? round1(r.position) : '',
      prevImpressions: prev === undefined ? '' : (prev?.impressions ?? 0),
      prevPosition: extra.prevPosition ?? (prev?.position ? round1(prev.position) : ''),
      change: extra.change ?? '',
    });
  const pagePrev = v.comparable ? before(rows?.page.prev, 'page') : null;
  for (const r of [...(rows?.page.cur ?? [])].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)) {
    const p = pagePrev ? (pagePrev.get(String(r.page).toLowerCase().trim()) ?? null) : undefined;
    add('Pages', '', r.page, r, p, {
      change: pagePrev ? (perDayChange(r.impressions, win.cur.days, p?.impressions ?? 0, win.prev.days) ?? '') : '',
    });
  }
  const queryPrev = v.comparable ? before(rows?.query.prev, 'query') : null;
  for (const r of [...(rows?.query.cur ?? [])].sort((a, b) => b.impressions - a.impressions)) {
    const p = queryPrev ? (queryPrev.get(String(r.query).toLowerCase().trim()) ?? null) : undefined;
    add('Searches', r.query, '', r, p, {
      change: queryPrev ? (perDayChange(r.impressions, win.cur.days, p?.impressions ?? 0, win.prev.days) ?? '') : '',
    });
  }
  for (const r of v.targets.rows ?? [])
    add('Target keywords', r.keyword, r.page ?? '', r, undefined, { prevPosition: r.prevPosition, change: r.change });
  return toCsv(
    [
      ['section', (r) => r.section],
      ['month', (r) => r.month],
      ['date_range', (r) => r.dates],
      ['compared_with', (r) => r.prevDates],
      ['search_or_keyword', (r) => r.name],
      ['page', (r) => r.page],
      ['clicks', (r) => r.clicks],
      ['times_shown', (r) => r.impressions],
      ['average_place', (r) => r.position],
      ['times_shown_before', (r) => r.prevImpressions],
      ['place_before', (r) => r.prevPosition],
      ['change', (r) => r.change],
      [
        'change_means',
        (r) =>
          r.change === ''
            ? ''
            : r.section === 'Target keywords'
              ? 'places gained (minus is places lost)'
              : 'percent change in times shown per day',
      ],
    ],
    lines
  );
}

// ---------------------------------------------------------------- the routes

// The month asked for, or the default (the last complete month). A malformed value is a 400; a month
// the desk holds no complete data for falls back to the default with a note.
export function pickMonth(model, asked) {
  const months = monthsAvailable(model.data.gsc?.siteDaily ?? [], newestDay(model));
  const fallback = defaultMonth(months);
  if (asked && !MONTH_RE.test(asked)) throw bad('Give the month as year-month, for example 2026-10.');
  if (!asked || months.some((m) => m.month === asked)) return { month: asked || fallback, note: null };
  return {
    month: fallback,
    note: fallback
      ? `The desk holds no complete numbers for ${monthName(asked)}, so this is ${monthName(fallback)}.`
      : null,
  };
}

// The Ask digest's view of the last complete month: tiles from the stored daily rows, and the target
// keywords only when the month's searches are already cached (the digest never pulls).
export function lastMonthBrief(model) {
  const months = monthsAvailable(model.data.gsc?.siteDaily ?? [], newestDay(model));
  const month = months.find((m) => !m.soFar)?.month;
  if (!month) return null;
  const win = monthWindows(month, newestDay(model));
  const comparable = coversRange(model.data.gsc?.siteDaily ?? [], win.prev.start, win.prev.end);
  const rows = cachedRowsFor(model, win, { comparable });
  const v = monthView(model, month, rows.query.cur ? rows : null, {
    searchError: 'The searches for this month are pulled when its Monthly report is first opened.',
  });
  return {
    month: v.label,
    dates: v.cur.text,
    compareText: v.compareText,
    tiles: v.tiles.map((t) => ({
      label: t.label,
      value: t.valueText ?? t.value,
      change: t.change,
      against: t.against,
      note: t.note,
    })),
    targetKeywords: v.targets.available
      ? { improved: v.targets.improved, held: v.targets.held, slipped: v.targets.slipped, noData: v.targets.noData }
      : v.targets.note,
    summary: v.summary,
  };
}

export function makeMonthRoutes({ open = openServer, now, lock = SHARED_LOCK, waitMs, totalMs } = {}) {
  const withLive = async (fn) => {
    const live = liveSession({ open, lock, ...(waitMs ? { waitMs } : {}), ...(totalMs ? { totalMs } : {}) });
    try {
      return await fn(live.call);
    } finally {
      await live.close();
    }
  };
  // The month's rows: pulled when missing; on a failed pull, what the cache and the store hold, with
  // the plain sentence.
  const load = async (model, month) => {
    const win = monthWindows(month, newestDay(model));
    const comparable = coversRange(model.data.gsc?.siteDaily ?? [], win.prev.start, win.prev.end);
    try {
      const rows = await withLive((call) => rowsFor(model, win, { call, now, comparable }));
      return { rows, error: null };
    } catch (e) {
      if (e?.status !== 502 && e?.status !== 429) throw e;
      const rows = cachedRowsFor(model, win, { now, comparable });
      return { rows, error: e.message };
    }
  };
  return [
    get('/api/month', async (ctx) => {
      const model = buildModel();
      if (!model.data.gsc) return { ...envelope(model, { need: ['gsc'] }), month: null, months: [] };
      const { month, note } = pickMonth(model, q(ctx, 'm').trim());
      if (!month) return { ...envelope(model, { need: ['gsc'] }), month: null, months: [] };
      const { rows, error } = await load(model, month);
      return { ...monthView(model, month, rows, { searchError: error }), pulls: rows.pulls, pickNote: note };
    }),
    get('/api/month.csv', async (ctx) => {
      const model = buildModel();
      const { month } = pickMonth(model, q(ctx, 'm').trim());
      if (!month) throw bad('There is no month to export yet.');
      const { rows } = await load(model, month);
      sendText(ctx, 'text/csv; charset=utf-8', monthCsv(model, month, rows), `seo-desk-month-${month}.csv`);
    }),
    // The Target keywords list for any date-bar choice: the chosen dates against the dates before
    // (periodFor), both from query-only pulls, cached like the month's.
    get('/api/targets/range', async (ctx) => {
      const model = buildModel();
      const spec = { range: q(ctx, 'range') || '28', start: q(ctx, 'start'), end: q(ctx, 'end') };
      const newest = newestDay(model);
      const p = periodFor(spec, deskToday(), newest);
      const fetched = [];
      let pulls = 0;
      const read = async (call, r) => {
        const got = await periodRows({ dim: 'query', start: r.start, end: r.end }, { call, now, newest });
        fetched.push({ ...r, fetchedAt: got.fetchedAt, finished: got.finished });
        if (!got.cached) pulls += 1;
        return got.rows;
      };
      const [cur, prev] = await withLive(async (call) => [await read(call, p.cur), await read(call, p.prev)]);
      const compare = targetsCompare(model, { cur, prev, range: p.cur, prevRange: p.prev }, { alignment: false });
      return {
        ...envelope(model, { need: ['gsc'], range: rangeOf(p.cur) }),
        range: rangeOf(p.cur),
        prevRange: rangeOf(p.prev),
        label: p.label,
        rows: compare.rows,
        likeForLike: compare.likeForLike,
        moves: compare.moves,
        pulls,
        fetchedText: fetched.map((f) => `${longRange(f.start, f.end)}: ${fetchedText(f)}`).join('; '),
        note: 'Which page Google shows for each keyword is worked out for the stored 28 days only, so it is left out for other dates.',
      };
    }),
  ];
}

export const routes = makeMonthRoutes();
