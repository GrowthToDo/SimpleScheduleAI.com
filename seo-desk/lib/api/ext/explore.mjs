// Explorer routes: filtered and custom range views, the ranking distribution, the detail of one
// search, and the lists the filter bar offers. Views with no filters on a standard range are
// served from the stored Search Console pulls; everything else is one live pull (two calls),
// cached for 12 hours. A failed live pull is a 502 with one plain sentence; the page keeps what
// it was showing and says the filtered view could not be loaded.

import { get, q, bad } from '../kit.mjs';
import { buildModel, envelope, deskToday, lowCtrMin } from '../model.mjs';
import { openServer, SERVER_KEYS, McpError } from '../../mcp-client.mjs';
import { isBrand } from '../../../../scripts/lib/gsc-diagnose-core.mjs';
import { longDate, longRange } from '../../text.mjs';
import {
  RANGE_OPTIONS,
  resolveRange,
  buildFilters,
  filterChips,
  explore,
  storedExplore,
  distribution,
  searchDetail,
  countryName,
  deviceName,
} from '../../explore.mjs';

const LIVE_LIMIT_MS = 60000;
const WAIT_MS = 20000;
const DISTRIBUTION_ROWS = 5000;
const STORED_DAYS = ['7', '14', '28', '90'];

// One live Search Console session at a time. acquire() waits up to waitMs for its turn, then
// refuses with a plain 429. release() hands the turn straight to the next waiter.
export function makeLock() {
  let held = false;
  const waiters = [];
  return {
    acquire(waitMs) {
      if (!held) {
        held = true;
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        const w = { resolve };
        w.timer = setTimeout(() => {
          waiters.splice(waiters.indexOf(w), 1);
          reject(
            Object.assign(new Error('Search Console is busy with another request. Try again in a moment.'), {
              status: 429,
            })
          );
        }, waitMs);
        waiters.push(w);
      });
    },
    release() {
      const w = waiters.shift();
      if (w) {
        clearTimeout(w.timer);
        w.resolve();
      } else held = false;
    },
  };
}

// One lazily opened Search Console session for one request. It opens on the first call (so a cached
// or stored answer starts no process), is stopped after 60 seconds whatever it is doing, and close()
// always ends it.
export function liveSession({ open = openServer, totalMs = LIVE_LIMIT_MS, lock = makeLock(), waitMs = WAIT_MS } = {}) {
  const ac = new AbortController();
  let timer = null;
  let opening = null;
  let acquired = false;
  const session = () => {
    if (!opening) {
      opening = lock.acquire(waitMs).then(() => {
        acquired = true;
        timer = setTimeout(() => ac.abort(), totalMs);
        return open(SERVER_KEYS.gsc, { signal: ac.signal, timeoutMs: totalMs });
      });
    }
    return opening;
  };
  return {
    async call(tool, args) {
      try {
        const s = await session();
        return await s.call(tool, args);
      } catch (e) {
        if (e?.status === 429) throw e;
        if (ac.signal.aborted)
          throw new McpError(`Search Console timed out after ${Math.round(totalMs / 1000)} seconds.`, {
            kind: 'failed',
          });
        throw e;
      }
    },
    async close() {
      clearTimeout(timer);
      if (!opening) return;
      try {
        (await opening).close();
      } catch {
        // it never opened
      } finally {
        if (acquired) {
          acquired = false;
          lock.release();
        }
      }
    },
  };
}

const rangeSpecOf = (ctx) => ({ range: q(ctx, 'range') || '28', start: q(ctx, 'start'), end: q(ctx, 'end') });

// The range for the reply: the dates, the label, and the same dates as words.
function rangeFor(ctx, today) {
  const r = resolveRange(rangeSpecOf(ctx), today);
  return { ...r, text: longRange(r.start, r.end) };
}

const withText = (range) => ({ ...range, text: longRange(range.start, range.end) });

const filterParamsOf = (ctx) => ({
  q: q(ctx, 'q'),
  qmode: q(ctx, 'qmode'),
  page: q(ctx, 'page'),
  pmode: q(ctx, 'pmode'),
  country: q(ctx, 'country'),
  device: q(ctx, 'device'),
});

const fetchedOn = (iso) => (iso ? longDate(iso.slice(0, 10)) : null);

export function makeRoutes({ open = openServer, now, waitMs = WAIT_MS, totalMs = LIVE_LIMIT_MS } = {}) {
  const lock = makeLock();
  // Runs `fn(call)` with a live call and always closes the session afterwards.
  const withLive = async (fn) => {
    const live = liveSession({ open, lock, waitMs, totalMs });
    try {
      return await fn(live.call);
    } finally {
      await live.close();
    }
  };

  return [
    get('/api/explore', async (ctx) => {
      const model = buildModel();
      const dim = q(ctx, 'dim') || 'query';
      if (dim !== 'query' && dim !== 'page') throw bad('The list must be by search (query) or by page.');
      const spec = rangeSpecOf(ctx);
      const range = rangeFor(ctx, deskToday());
      const params = filterParamsOf(ctx);
      const filters = buildFilters(params);
      const chips = filterChips(params);
      const ctrMin = lowCtrMin(model);

      let result = null;
      if (!filters.length && STORED_DAYS.includes(spec.range)) {
        result = storedExplore(model.data.gsc, {
          through: model.snapObjs.gsc?.through,
          dim,
          days: Number(spec.range),
          ctrMin,
        });
        if (result) result = { ...result, fetchedAt: model.snapObjs.gsc?.pulledAt ?? null, source: 'stored' };
      }
      if (!result) {
        const r = await withLive((call) => explore({ dim, range, filters, limit: 1000 }, { call, now, ctrMin }));
        result = { ...r, source: r.cached ? 'cache' : 'live' };
      }
      const shown = withText(result.range);
      const rows =
        dim === 'query' ? result.rows.map((r) => ({ ...r, brand: isBrand(r.key, model.brands) })) : result.rows;
      return {
        ...envelope(model, { need: ['gsc'], range: { ...result.range, text: shown.text } }),
        dim,
        filters: result.filters,
        chips,
        rows,
        totals: result.totals,
        comparable: result.comparable,
        truncated: result.truncated,
        source: result.source,
        cached: result.cached,
        fetchedAt: result.fetchedAt,
        fetchedOn: fetchedOn(result.fetchedAt),
        notes: [
          dim === 'page'
            ? `Click rate is shown only for pages with at least ${ctrMin} impressions, because Google hides some clicks.`
            : 'Google hides some clicks on small searches, so no click rate is shown for searches and the click counts are a floor.',
          ...(result.comparable
            ? []
            : ['There is no earlier period to compare this view with, so there is no movement.']),
          ...(result.truncated ? [`Only the top ${rows.length} rows are shown; there are more.`] : []),
        ],
      };
    }),

    get('/api/distribution', async (ctx) => {
      const model = buildModel();
      const spec = rangeSpecOf(ctx);
      const range = rangeFor(ctx, deskToday());
      const ctrMin = lowCtrMin(model);
      let result = null;
      if (spec.range === '28' || spec.range === '90') {
        result = storedExplore(model.data.gsc, {
          through: model.snapObjs.gsc?.through,
          dim: 'query',
          days: Number(spec.range),
          limit: 25000,
          ctrMin,
        });
        if (result) result = { ...result, fetchedAt: model.snapObjs.gsc?.pulledAt ?? null, source: 'stored' };
      }
      if (!result) {
        const r = await withLive((call) =>
          explore({ dim: 'query', range, filters: [], limit: DISTRIBUTION_ROWS }, { call, now, ctrMin })
        );
        result = { ...r, source: r.cached ? 'cache' : 'live' };
      }
      return {
        ...envelope(model, { need: ['gsc'], range: withText(result.range) }),
        buckets: distribution(result.rows, { comparable: result.comparable }),
        searches: result.totals.count,
        comparable: result.comparable,
        truncated: result.truncated,
        source: result.source,
        cached: result.cached,
        fetchedAt: result.fetchedAt,
        note: 'Each search is counted once, at its average place weighted by how often it appeared. Searches that appeared very rarely may be missing.',
      };
    }),

    get('/api/search-detail', async (ctx) => {
      const model = buildModel();
      const query = q(ctx, 'query').trim();
      if (!query) throw bad('Give the search to look at, for example ?query=nurse scheduling.');
      const range = rangeFor(ctx, deskToday());
      const r = await withLive((call) => searchDetail(query, range, { call, now }));
      return {
        ...envelope(model, { need: ['gsc'], range }),
        ...r,
        range,
        fetchedOn: fetchedOn(r.fetchedAt),
        source: r.cached ? 'cache' : 'live',
      };
    }),

    get('/api/explore/options', () => {
      const model = buildModel();
      const gsc = model.data.gsc;
      const bySize = (a, b) => b.impressions - a.impressions;
      return {
        ...envelope(model, { need: ['gsc'] }),
        countries: (gsc?.countries ?? [])
          .map((c) => ({ code: c.country, name: countryName(c.country), impressions: c.impressions }))
          .sort(bySize),
        devices: (gsc?.devices ?? [])
          .map((d) => ({ code: d.device, name: deviceName(d.device), impressions: d.impressions }))
          .sort(bySize),
        ranges: RANGE_OPTIONS,
        modes: [
          { value: 'contains', label: 'contains' },
          { value: 'exact', label: 'is exactly' },
          { value: 'excludes', label: 'does not contain' },
        ],
      };
    }),
  ];
}

export const routes = makeRoutes();
