// The real number of times each search showed the site, from the query-only Search Console pulls.
//
// The query and page rows (qpCur, qpPrev, qp90) count a search once for every page it showed, so
// adding them up per search can count one search two or three times. Every per-search total,
// minimum, brand split and position bucket the desk shows comes from here instead.

const PULLS = { cur: 'queryCur', prev: 'queryPrev', d90: 'query90' };

const keyOf = (q) =>
  String(q ?? '')
    .trim()
    .toLowerCase();

// gsc: the Search Console snapshot data. range: 'cur' (the stored 28 days), 'prev' (the 28 days
// before) or 'd90' (the stored 90 days). Returns Map(lower-cased, trimmed search -> {query,
// impressions, clicks, position}), query as Search Console wrote it, or null when the snapshot has
// no query-only pull for that range (a snapshot from before the 90-day one existed): the caller then
// says so or pulls live, and never falls back to a sum of page rows silently.
export function realQueryCounts(gsc, range) {
  const field = PULLS[range];
  if (!field) throw new Error('realQueryCounts range must be cur, prev or d90.');
  const rows = gsc?.[field];
  if (!Array.isArray(rows)) return null;
  const out = new Map();
  for (const r of rows) {
    const key = keyOf(r.query);
    if (!key || out.has(key)) continue;
    out.set(key, {
      query: String(r.query).trim(),
      impressions: Number(r.impressions) || 0,
      clicks: Number(r.clicks) || 0,
      position: Number(r.position) || 0,
    });
  }
  return out;
}

// Said once in every reply whose lists need the per-search counts when the query-only pull for the
// latest 28 days is missing, or empty beside query and page rows (a pull that failed, not a site no
// one searched): those lists cannot be worked out.
export const COUNTS_MISSING_NOTE =
  'Per-search counts are missing, so these lists cannot be worked out. Refresh Search Console.';
export function countsMissingIn(gsc) {
  if (!gsc) return false;
  const real = realQueryCounts(gsc, 'cur');
  return !real || (real.size === 0 && (gsc.qpCur ?? []).length > 0);
}

// Said where searches are compared with the 28 days before but the stored totals of the latest period
// are a day short (an older snapshot whose last day was cut back, sources/gsc.mjs capSnapshot). The
// totals cannot be re-cut, so no change is shown rather than a biased one.
export const QUERY_WAIT_NOTE =
  'The stored search totals for the latest period are one day shorter than the period before, so the comparison of searches waits for the next Search Console refresh.';
// Whether the stored search totals for the latest 28 days and the 28 before cover the same number of
// days. No stored windows: nothing to say against them.
export function queryPeriodsEven(gsc) {
  const w = gsc?.windows;
  if (!w?.cur || !w?.prev) return true;
  const days = (r) => Math.round((Date.parse(`${r.end}T00:00:00Z`) - Date.parse(`${r.start}T00:00:00Z`)) / 86400000);
  return days(w.cur) === days(w.prev);
}
