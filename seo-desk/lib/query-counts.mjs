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
