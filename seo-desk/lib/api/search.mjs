// View models for Search, Pages and one page. The target keyword mean is the like for like
// method of scripts/target-positions.mjs (see targetsView). A site wide average position is
// never produced here.

import { groupByQuery, isBrand, targetKeywords } from '../../../scripts/lib/gsc-diagnose-core.mjs';
import { addDays, todayIso } from '../dates.mjs';
import { longDate, longRange } from '../text.mjs';
import { POST_PAGE_RE, envelope, memo, linksFor, pagePath, rangeOf, lowCtrMin, checkedText } from './model.mjs';
import { deliberateEdits, timelineEvents, verdictRows, moneyPageVerdicts, opportunitiesList } from './work.mjs';
import { n0, round1, pct, sumRange, coversFrom, lower } from './fmt.mjs';

export const RANGES = [7, 28, 90, 480];
export const LIKE_MIN_N = 3;
const MOVE_PCT = 20;
// The pull asks for 5000 rows; snapshots pulled before that asked for 1000, and a count that lands
// exactly on either number is a floor.
const QUERY_ROW_LIMITS = [1000, 5000];

// ---------------------------------------------------------------- windows

export function windowsFor(model, days) {
  const end = model.snapObjs.gsc?.through ?? model.range.end;
  const cur = { start: addDays(end, -(days - 1)), end };
  const prev = { start: addDays(cur.start, -days), end: addDays(cur.start, -1) };
  return { cur, prev };
}

// ---------------------------------------------------------------- movement

// growing / slipping / new / gone / steady, or null when there is no earlier period to compare with.
export function movementOf(cur, prev, comparable = true) {
  if (!comparable) return null;
  if (prev === 0 && cur > 0) return 'new';
  if (cur === 0 && prev > 0) return 'gone';
  const p = pct(cur, prev);
  if (p !== null && p >= MOVE_PCT) return 'growing';
  if (p !== null && p <= -MOVE_PCT) return 'slipping';
  return 'steady';
}

// ---------------------------------------------------------------- page aggregates

function aggregatePages(pageDaily, start, end) {
  const map = new Map();
  for (const r of pageDaily || []) {
    if (r.date < start || r.date > end) continue;
    const a = map.get(r.page) ?? { clicks: 0, impressions: 0, posW: 0 };
    a.clicks += r.clicks || 0;
    a.impressions += r.impressions || 0;
    a.posW += (r.position || 0) * (r.impressions || 0);
    map.set(r.page, a);
  }
  return map;
}

const positionOf = (a) => (a && a.impressions ? round1(a.posW / a.impressions) : null);

export function pagesTable(model, days) {
  return memo(model, `pages:${days}`, () => {
    const pageDaily = model.data.gsc?.pageDaily;
    if (!Array.isArray(pageDaily)) return { rows: [], range: null, comparable: false };
    const { cur, prev } = windowsFor(model, days);
    const comparable = coversFrom(pageDaily, prev.start);
    const a = aggregatePages(pageDaily, cur.start, cur.end);
    const b = aggregatePages(pageDaily, prev.start, prev.end);
    const rows = [...a.keys()].map((page) => {
      const c = a.get(page);
      const p = b.get(page);
      return {
        page,
        clicks: c.clicks,
        impressions: c.impressions,
        position: positionOf(c),
        // Click rate only above the minimum number of impressions, and only for whole pages.
        ctr: c.impressions >= lowCtrMin(model) ? Math.round((c.clicks / c.impressions) * 1000) / 1000 : null,
        change: comparable ? pct(c.impressions, p?.impressions ?? 0) : null,
        movement: movementOf(c.impressions, p?.impressions ?? 0, comparable),
      };
    });
    for (const page of b.keys()) {
      if (a.has(page)) continue;
      const p = b.get(page);
      rows.push({
        page,
        clicks: 0,
        impressions: 0,
        position: null,
        ctr: null,
        // Gone from a handful of views is not "-100%": the same minimum base applies.
        change: comparable ? pct(0, p.impressions) : null,
        movement: movementOf(0, p.impressions, comparable),
      });
    }
    rows.sort((x, y) => y.impressions - x.impressions || x.page.localeCompare(y.page));
    const min = pageDaily.reduce((m, r) => (m === null || r.date < m ? r.date : m), null);
    return { rows, range: { start: cur.start < (min ?? cur.start) ? min : cur.start, end: cur.end }, comparable };
  });
}

// ---------------------------------------------------------------- searches

function byQueryMap(rows) {
  return new Map(rows.map((r) => [lower(r.query).trim(), r]));
}

export function queriesTable(model, days) {
  return memo(model, `queries:${days}`, () => {
    const gsc = model.data.gsc;
    if (!gsc) return { rows: [], range: null, comparable: false };
    const short = days <= 28;
    const curRows = short ? (gsc.queryCur ?? []) : groupByQuery(gsc.qp90 ?? []);
    const prevRows = short ? (gsc.queryPrev ?? []) : [];
    const range = short ? gsc.windows?.cur : gsc.windows?.d90;
    const comparable = short && prevRows.length > 0;
    const prev = byQueryMap(prevRows);
    const pageRows = groupByQuery(short ? (gsc.qpCur ?? []) : (gsc.qp90 ?? []));
    const top = new Map(pageRows.map((q) => [lower(q.query).trim(), q.pages[0]?.page ?? null]));
    const bing = byQueryMap(model.data.bing?.queries ?? []);
    const rows = curRows.map((r) => {
      const key = lower(r.query).trim();
      const p = prev.get(key);
      return {
        query: r.query,
        // Google hides some clicks on small searches, so no click rate is given per search.
        clicks: r.clicks,
        impressions: r.impressions,
        position: round1(r.position),
        change: comparable ? pct(r.impressions, p?.impressions ?? 0) : null,
        movement: movementOf(r.impressions, p?.impressions ?? 0, comparable),
        brand: isBrand(r.query, model.brands),
        topPage: top.get(key) ?? null,
        bingImpressions: bing.get(key)?.impressions ?? 0,
      };
    });
    const seen = new Set(curRows.map((r) => lower(r.query).trim()));
    if (comparable) {
      for (const p of prevRows) {
        if (seen.has(lower(p.query).trim())) continue;
        rows.push({
          query: p.query,
          clicks: 0,
          impressions: 0,
          position: null,
          change: pct(0, p.impressions),
          movement: 'gone',
          brand: isBrand(p.query, model.brands),
          topPage: null,
          bingImpressions: bing.get(lower(p.query).trim())?.impressions ?? 0,
        });
      }
    }
    rows.sort((x, y) => y.impressions - x.impressions || x.query.localeCompare(y.query));
    return { rows, range, comparable };
  });
}

// ---------------------------------------------------------------- target keywords

// The like for like mean of scripts/target-positions.mjs: the registry's primary keywords,
// only those with a position in BOTH periods, and the plain mean of their positions. That
// script is a command line program with no exports, so the method is mirrored here (same
// keyword rules, positions rounded to one decimal, duplicate registry keywords counted once
// per registry row). Query rows come from the query pull; a keyword missing there is taken
// from the query and page pull for the same period.
export function targetsView(model) {
  return memo(model, 'targets', () => {
    const gsc = model.data.gsc;
    const registry = (model.data.local?.registry ?? []).filter((e) => e.primaryKeyword);
    if (!gsc || !registry.length) {
      return {
        rows: [],
        likeForLike: { mean: null, prevMean: null, n: 0, targetsTotal: registry.length, enough: false },
      };
    }
    const mapFor = (rows, qpRows) => {
      const m = new Map((rows ?? []).map((r) => [lower(r.query).trim(), r]));
      for (const q of groupByQuery(qpRows ?? [])) if (!m.has(lower(q.query).trim())) m.set(lower(q.query).trim(), q);
      return m;
    };
    const curMap = mapFor(gsc.queryCur, gsc.qpCur);
    const prevMap = mapFor(gsc.queryPrev, gsc.qpPrev);
    const align = targetKeywords(registry, gsc.qpCur ?? []);
    const rows = registry.map((e, i) => {
      const key = lower(e.primaryKeyword).trim();
      const c = curMap.get(key);
      const p = prevMap.get(key);
      const a = align[i];
      return {
        keyword: e.primaryKeyword,
        page: e.url ?? null,
        slug: e.slug ?? null,
        position: c ? Number(Number(c.position).toFixed(1)) : null,
        prevPosition: p ? Number(Number(p.position).toFixed(1)) : null,
        impressions: c?.impressions ?? 0,
        rankingPage: a?.topPage ?? null,
        alignment: a?.status === 'ok' ? 'right page' : a?.status === 'mismatch' ? 'wrong page' : 'no data yet',
      };
    });
    for (const r of rows)
      r.change = r.position !== null && r.prevPosition !== null ? round1(r.prevPosition - r.position) : null;
    const shared = rows.filter((r) => r.position !== null && r.prevPosition !== null);
    const mean = (list, f) => round1(list.reduce((s, r) => s + f(r), 0) / list.length);
    const enough = shared.length >= LIKE_MIN_N;
    return {
      rows,
      likeForLike: {
        mean: enough ? mean(shared, (r) => r.position) : null,
        prevMean: enough ? mean(shared, (r) => r.prevPosition) : null,
        n: shared.length,
        targetsTotal: registry.length,
        enough,
        range: rangeOf(gsc.windows?.cur),
        prevRange: rangeOf(gsc.windows?.prev),
      },
    };
  });
}

// ---------------------------------------------------------------- the Search page

const TILE_LABEL = {
  impressions: 'Google impressions',
  clicks: 'Google clicks',
  targetPosition: 'Target keyword position (like for like)',
  searches: 'Searches we appear for',
  bing: 'Bing impressions',
  indexed: 'Pages on Google',
};
const SERIES_METRICS = ['impressions', 'clicks', 'bing'];

export function searchView(model, { days = 28, metric = 'impressions' } = {}) {
  const gsc = model.data.gsc;
  const { cur, prev } = windowsFor(model, days);
  const site = gsc?.siteDaily ?? [];
  const bingDaily = model.data.bing?.siteDaily ?? [];
  const range = rangeOf(cur);
  const tile = (key, value, change, changeKind, note, enough = true) => ({
    key,
    label: TILE_LABEL[key],
    value,
    change,
    changeKind,
    note,
    enoughData: enough,
    range,
  });
  const dayTile = (key, rows, field, only) => {
    const comparable = coversFrom(rows, prev.start);
    const c = sumRange(rows, cur.start, cur.end, field);
    const p = sumRange(rows, prev.start, prev.end, field);
    const change = comparable ? pct(c, p) : null;
    const note = !rows.length
      ? 'Not enough data yet.'
      : !comparable
        ? `Not enough history yet to compare with the ${days} days before.`
        : change === null
          ? `Not enough data yet for a percentage (the earlier period had ${n0(p)}).`
          : `Compared with ${n0(p)} in the ${days} days before (${longRange(prev.start, prev.end)}).`;
    return tile(key, rows.length ? c : null, change, 'percent', only ?? note, rows.length > 0);
  };

  const like = targetsView(model).likeForLike;
  const q28 = gsc?.windows ? { cur: gsc.windows.cur, prev: gsc.windows.prev } : null;
  const searchesNow = gsc?.queryCur?.length ?? null;
  const searchesPrev = gsc?.queryPrev?.length ?? 0;
  // Search Console returns a limited number of rows; a count that hits the limit is a floor.
  const capped = searchesNow !== null && QUERY_ROW_LIMITS.includes(searchesNow);
  const indexRows = model.index.rows ?? [];
  const hasIndex = Boolean(model.index.rows);
  const indexed = indexRows.filter((r) => r.verdict === 'indexed').length;
  const prevIndexed = model.prevIndex ? model.prevIndex.filter((r) => r.verdict === 'indexed').length : null;

  const tiles = [
    dayTile('impressions', site, 'impressions'),
    dayTile('clicks', site, 'clicks'),
    tile(
      'targetPosition',
      like.mean,
      // Positive means better (the keywords moved up), the same as every other position change.
      like.mean !== null && like.prevMean !== null ? round1(like.prevMean - like.mean) : null,
      'positions',
      like.enough
        ? `Mean over the ${like.n} of ${like.targetsTotal} target keywords that have data in both periods. A lower place is better.`
        : `Not enough data yet: only ${like.n} of ${like.targetsTotal} target keywords have data in both periods.`,
      like.enough
    ),
    tile(
      'searches',
      searchesNow,
      searchesNow !== null && !capped ? pct(searchesNow, searchesPrev) : null,
      'percent',
      !q28
        ? 'Not enough data yet.'
        : capped
          ? `Search Console returned its full ${n0(searchesNow)} rows for ${longRange(q28.cur.start, q28.cur.end)}, so the real number is higher and no change is shown.`
          : `Counted from the rows Search Console returned for ${longRange(q28.cur.start, q28.cur.end)}.`,
      searchesNow !== null
    ),
    dayTile('bing', bingDaily, 'impressions'),
    tile(
      'indexed',
      hasIndex ? indexed : null,
      prevIndexed !== null ? indexed - prevIndexed : null,
      'count',
      hasIndex
        ? `${checkedText(model)}; ${indexed} of those are on Google. A few pages are checked each morning, so each one has its own check date.`
        : 'Not enough data yet.',
      hasIndex
    ),
  ];

  const seriesMetric = SERIES_METRICS.includes(metric) ? metric : null;
  const seriesRows = metric === 'bing' ? bingDaily : site;
  const field = metric === 'bing' ? 'impressions' : metric;
  const series = seriesMetric
    ? seriesRows
        .filter((r) => r.date >= cur.start && r.date <= cur.end)
        .map((r) => ({ date: r.date, value: Number(r[field]) || 0 }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const pagesT = pagesTable(model, days);
  const queriesT = queriesTable(model, days);
  const sums = {
    brand: { impressions: 0, clicks: 0, searches: 0 },
    nonBrand: { impressions: 0, clicks: 0, searches: 0 },
  };
  for (const q of queriesT.rows) {
    const s = q.brand ? sums.brand : sums.nonBrand;
    s.impressions += q.impressions;
    s.clicks += q.clicks;
    s.searches += q.impressions > 0 ? 1 : 0;
  }
  const countries = [...(gsc?.countries ?? [])]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 12)
    .map((c) => ({ country: c.country, clicks: c.clicks, impressions: c.impressions }));
  const devices = (gsc?.devices ?? []).map((d) => ({ device: d.device, clicks: d.clicks, impressions: d.impressions }));

  return {
    ...envelope(model, { need: ['gsc', 'bing'], range }),
    days,
    metric,
    ranges: RANGES,
    tiles,
    series,
    seriesNote: seriesMetric ? null : 'This number has no daily history yet, so there is no chart for it.',
    markers: timelineEvents(model, { start: cur.start, end: cur.end }),
    pages: pagesT.rows,
    pagesRange: rangeOf(pagesT.range),
    queries: queriesT.rows,
    queriesRange: rangeOf(queriesT.range),
    brandSplit: {
      ...sums,
      clicksNote:
        'Google hides clicks for rare searches, so these click counts are a floor and the real numbers are higher.',
    },
    targets: targetsView(model).rows,
    likeForLike: like,
    countries,
    devices,
    notes: [
      `Google hides some clicks on small searches, so click rate is shown for whole pages only, and only above ${n0(lowCtrMin(model))} impressions.`,
      ...(days === 7
        ? [
            `The Searches list covers the 28 day period ${longRange(model.range.start, model.range.end)}, because Search Console is pulled in 28 day periods. Pages and the chart cover the 7 days.`,
          ]
        : []),
      'Search Console data runs about two days behind.',
    ],
  };
}

// ---------------------------------------------------------------- the Pages list

export function pageRows(model) {
  return memo(model, 'pageRows', () => {
    const local = model.data.local ?? {};
    const gsc = model.data.gsc;
    const { rows: pt, comparable } = pagesTable(model, 28);
    const byPage = new Map(pt.map((r) => [r.page, r]));
    const live = (local.livePages ?? []).map((p) => p.page);
    const pages = live.length ? live : pt.map((r) => r.page);
    const registryByUrl = new Map((local.registry ?? []).filter((r) => r.url).map((r) => [pagePath(r.url), r]));
    const targetByKey = new Map(targetsView(model).rows.map((r) => [`${r.page}|${lower(r.keyword)}`, r]));
    const queryCount = new Map();
    for (const r of gsc?.qpCur ?? []) {
      if (!queryCount.has(r.page)) queryCount.set(r.page, new Set());
      queryCount.get(r.page).add(lower(r.query));
    }
    const indexBy = new Map((model.index.rows ?? []).map((r) => [pagePath(r.page), r]));
    const bing = new Map((model.data.bing?.pages ?? []).map((r) => [pagePath(r.page), r.impressions]));
    const deliberate = deliberateEdits(model);
    return pages.map((page) => {
      const g = byPage.get(page);
      const reg = registryByUrl.get(page);
      const t = reg?.primaryKeyword ? targetByKey.get(`${reg.url}|${lower(reg.primaryKeyword)}`) : null;
      const sources = (local.inbound?.[page] ?? []).filter((s) => String(s).startsWith('/') && s !== page);
      const f = model.frozen.get(page);
      const ix = indexBy.get(page);
      return {
        page,
        kind: page.startsWith('/blog/') ? 'post' : page.startsWith('/articles/') ? 'article' : 'page',
        keyword: reg?.primaryKeyword ?? null,
        position: t?.position ?? null,
        avgPosition: g?.position ?? null,
        impressions: g?.impressions ?? 0,
        clicks: g?.clicks ?? 0,
        ctr: g?.ctr ?? null,
        change: g?.change ?? null,
        movement: g ? g.movement : comparable ? 'steady' : null,
        queryCount: queryCount.get(page)?.size ?? 0,
        inbound: new Set(sources).size,
        lastEdit: deliberate.get(page)?.[0] ?? null,
        frozenUntil: f?.until ?? null,
        index: ix?.verdict ?? null,
        lastCrawl: ix?.lastCrawl ?? null,
        indexCheckedOn: ix?.checkedAt ? todayIso(new Date(ix.checkedAt)) : null,
        bingImpressions: bing.get(page) ?? 0,
      };
    });
  });
}

export function pagesView(model) {
  return { ...envelope(model, { need: ['gsc', 'local'] }), items: pageRows(model) };
}

// ---------------------------------------------------------------- one page

export function pageView(model, path) {
  const page = pagePath(path);
  const row = pageRows(model).find((r) => r.page === page);
  if (!row) return null;
  const gsc = model.data.gsc;
  const local = model.data.local ?? {};
  const prev = new Map(
    groupByQuery((gsc?.qpPrev ?? []).filter((r) => r.page === page)).map((q) => [lower(q.query), q])
  );
  const bing = new Map((model.data.bing?.queries ?? []).map((q) => [lower(q.query).trim(), q.impressions]));
  const queries = groupByQuery((gsc?.qpCur ?? []).filter((r) => r.page === page))
    .map((q) => {
      const p = prev.get(lower(q.query));
      return {
        query: q.query,
        position: round1(q.position),
        prevPosition: p ? round1(p.position) : null,
        impressions: q.impressions,
        clicks: q.clicks,
        change: pct(q.impressions, p?.impressions ?? 0),
        bingImpressions: bing.get(lower(q.query).trim()) ?? 0,
      };
    })
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 200);
  const series = (gsc?.pageDaily ?? [])
    .filter((r) => r.page === page)
    .map((r) => ({ date: r.date, value: r.impressions || 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const start = series[0]?.date ?? addDays(model.today, -120);
  const verdicts = verdictRows(model).filter((v) => v.page === page || v.pages.includes(page));
  const money = moneyPageVerdicts(model).filter((v) => v.page === page);
  const f = model.frozen.get(page);
  const sourcesIn = (local.inbound?.[page] ?? []).filter((s) => s !== page);
  const { byPage } = opportunitiesList(model, { page });
  return {
    ...envelope(model, { need: ['gsc', 'local'] }),
    ...row,
    queries,
    queriesRange: rangeOf(gsc?.windows?.cur),
    series,
    markers: timelineEvents(model, { page, start }),
    opportunities: byPage.filter((o) => o.detected),
    verdicts: [...verdicts, ...money],
    inboundFrom: sourcesIn.filter((s) => String(s).startsWith('/')),
    inboundSiteWide: sourcesIn.some((s) => String(s).startsWith('src/components/')),
    frozen: f ? { since: f.since, until: f.until, untilText: longDate(f.until), why: f.why } : null,
    isPost: POST_PAGE_RE.test(page),
    links: linksFor(page),
  };
}
