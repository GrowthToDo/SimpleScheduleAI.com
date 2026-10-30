// Pure functions behind scripts/gsc-diagnose.mjs. No fs, no network, no clock
// reads, so every section rule is unit-testable (scripts/tests/gsc-diagnose.test.mjs).
//
// Inputs are GSC rows: page rows ({page|keys:[page], clicks, impressions, ctr,
// position}) and query,page rows ({query, page, ...} or keys:[query, page]) for a
// current and a previous 28-day window.

import { SITE, addDays, classify, controlFor } from './change-log-core.mjs';

// ---------------------------------------------------------------- thresholds

export const WINDOW_LEN = 28;
export const END_LAG_DAYS = 3; // current window ends today - 3 (GSC lag)

export const PAGE_MIN_PREV_IMP = 50; // a: pages judged
export const PAGE_TOP_N = 15; // a: rows per list
export const LOST_MIN_PREV_IMP = 20; // b
export const SPLIT_MIN_PAGES = 2; // c
export const SPLIT_MIN_IMP = 30; // c
export const SPLIT_MAX_TOP_SHARE = 0.7; // c: top page share must be BELOW this
export const QUESTION_MIN_IMP = 10; // d
export const QUESTION_MIN_WORDS = 6; // d
export const QUESTION_WEAK_POS = 15; // d: best position above this = weakly answered
export const QUESTION_RE = /^(who|what|why|how|when|where|which|can|does|do|is|are|should)\b/i;
export const NEAR_POS_MIN = 8; // e
export const NEAR_POS_MAX = 20; // e
export const NEAR_MIN_IMP = 30; // e
export const UNSERVED_MIN_IMP = 30; // f
export const UNSERVED_MIN_POS = 20; // f: best position must be ABOVE (worse than) this
export const DISPLAY_CAP = 60; // rows printed per long section (counts stay full)

export const SPLIT_NOTE =
  "Before merging anything: check whether the pages take turns (query + page + date, daily) and read each page's full query list.";

// ---------------------------------------------------------------- windows

export function diagnoseWindows(today) {
  const curEnd = addDays(today, -END_LAG_DAYS);
  const curStart = addDays(curEnd, -(WINDOW_LEN - 1));
  const prevEnd = addDays(curStart, -1);
  const prevStart = addDays(prevEnd, -(WINDOW_LEN - 1));
  return { cur: { start: curStart, end: curEnd }, prev: { start: prevStart, end: prevEnd } };
}

// ---------------------------------------------------------------- folding

// page#heading and a trailing slash both fold into the base page.
export function normPage(url) {
  return String(url || '')
    .split('#')[0]
    .replace(/\/$/, '');
}

export function pathOf(url) {
  const p = normPage(url);
  return p.startsWith(SITE) ? p.slice(SITE.length) || '/' : p;
}

const pageOf = (r) => r.page ?? r.keys?.[0] ?? r.url ?? '';
const qpOf = (r) =>
  r.query !== undefined ? { query: r.query, page: r.page } : { query: r.keys?.[0], page: r.keys?.[1] };

function addInto(acc, r) {
  const imp = r.impressions || 0;
  acc.clicks += r.clicks || 0;
  acc.impressions += imp;
  acc.posWeighted += (r.position || 0) * imp;
}

const finish = (acc) => ({
  clicks: acc.clicks,
  impressions: acc.impressions,
  ctr: acc.impressions ? acc.clicks / acc.impressions : 0,
  position: acc.impressions ? Number((acc.posWeighted / acc.impressions).toFixed(2)) : 0,
});

// Page rows -> one row per base page: [{page, clicks, impressions, ctr, position}].
export function foldPageRows(rows) {
  const map = new Map();
  for (const r of rows) {
    const page = normPage(pageOf(r));
    if (!page) continue;
    if (!map.has(page)) map.set(page, { clicks: 0, impressions: 0, posWeighted: 0 });
    addInto(map.get(page), r);
  }
  return [...map.entries()].map(([page, acc]) => ({ page, ...finish(acc) }));
}

// Query,page rows -> one row per (query, base page).
export function foldQueryPageRows(rows) {
  const map = new Map();
  for (const r of rows) {
    const { query, page: rawPage } = qpOf(r);
    const page = normPage(rawPage);
    if (!query || !page) continue;
    const key = `${query}\u0000${page}`;
    if (!map.has(key)) map.set(key, { query, page, acc: { clicks: 0, impressions: 0, posWeighted: 0 } });
    addInto(map.get(key).acc, r);
  }
  return [...map.values()].map(({ query, page, acc }) => ({ query, page, ...finish(acc) }));
}

// Per-query view over folded query,page rows: totals, best position, pages (by impressions desc).
export function groupByQuery(qpRows) {
  const map = new Map();
  for (const r of qpRows) {
    if (!map.has(r.query)) map.set(r.query, { query: r.query, impressions: 0, clicks: 0, posWeighted: 0, pages: [] });
    const q = map.get(r.query);
    q.impressions += r.impressions;
    q.clicks += r.clicks;
    q.posWeighted += r.position * r.impressions;
    q.pages.push({ page: r.page, impressions: r.impressions, clicks: r.clicks, position: r.position });
  }
  return [...map.values()].map((q) => {
    q.pages.sort((a, b) => b.impressions - a.impressions);
    const positions = q.pages.filter((p) => p.impressions > 0).map((p) => p.position);
    return {
      query: q.query,
      impressions: q.impressions,
      clicks: q.clicks,
      position: q.impressions ? Number((q.posWeighted / q.impressions).toFixed(2)) : 0,
      bestPosition: positions.length ? Math.min(...positions) : null,
      pages: q.pages,
    };
  });
}

// ---------------------------------------------------------------- a. page movement

const emptyM = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
const mOf = (m) => (m ? { clicks: m.clicks, impressions: m.impressions, ctr: m.ctr, position: m.position } : emptyM);

export function pageMovement(prevPages, curPages) {
  const control = controlFor(prevPages, curPages); // {impPct, pages} or null
  const curMap = new Map(curPages.map((p) => [p.page, p]));
  const items = [];
  for (const p of prevPages) {
    if (p.impressions < PAGE_MIN_PREV_IMP) continue;
    const prev = mOf(p);
    const cur = mOf(curMap.get(p.page));
    const c = classify(prev, cur, control);
    items.push({
      page: p.page,
      verdict: c.verdict,
      dropType: c.dropType,
      posDelta: c.posDelta,
      impPct: c.impPct,
      relImpPct: c.relImpPct,
      prev,
      cur,
    });
  }
  const key = (i) => i.relImpPct ?? i.impPct ?? 0;
  const worse = items.filter((i) => i.verdict === 'worse' || i.verdict === 'mixed').sort((a, b) => key(a) - key(b));
  const better = items.filter((i) => i.verdict === 'better').sort((a, b) => key(b) - key(a));
  return { control, judged: items.length, worse, better };
}

// ---------------------------------------------------------------- b. lost queries

// Queries with LOST_MIN_PREV_IMP+ prev impressions and zero/absent in cur, grouped by the
// page that had them. Returns [{page, totalPrevImp, queries:[{query, impressions, position}]}].
export function lostQueries(qpPrev, qpCur) {
  const prevQ = groupByQuery(qpPrev);
  const curImp = new Map(groupByQuery(qpCur).map((q) => [q.query, q.impressions]));
  const lost = new Set(
    prevQ.filter((q) => q.impressions >= LOST_MIN_PREV_IMP && !(curImp.get(q.query) > 0)).map((q) => q.query)
  );
  const byPage = new Map();
  for (const r of qpPrev) {
    if (!lost.has(r.query)) continue;
    if (!byPage.has(r.page)) byPage.set(r.page, { page: r.page, totalPrevImp: 0, queries: [] });
    const g = byPage.get(r.page);
    g.totalPrevImp += r.impressions;
    g.queries.push({ query: r.query, impressions: r.impressions, position: r.position });
  }
  const groups = [...byPage.values()];
  for (const g of groups) g.queries.sort((a, b) => b.impressions - a.impressions);
  groups.sort((a, b) => b.totalPrevImp - a.totalPrevImp);
  return { queryCount: lost.size, groups };
}

// ---------------------------------------------------------------- c. split queries

export function splitQueries(qpCur) {
  const out = [];
  for (const q of groupByQuery(qpCur)) {
    const pages = q.pages.filter((p) => p.impressions > 0);
    if (pages.length < SPLIT_MIN_PAGES || q.impressions < SPLIT_MIN_IMP) continue;
    const topShare = pages[0].impressions / q.impressions;
    if (!(topShare < SPLIT_MAX_TOP_SHARE)) continue;
    out.push({
      query: q.query,
      impressions: q.impressions,
      topShare,
      pages: pages.map((p) => ({ ...p, share: p.impressions / q.impressions })),
    });
  }
  return out.sort((a, b) => b.impressions - a.impressions);
}

// ---------------------------------------------------------------- d. questions

export function isQuestion(query) {
  const q = String(query).trim();
  return QUESTION_RE.test(q) || q.split(/\s+/).filter(Boolean).length >= QUESTION_MIN_WORDS;
}

// Grouped by the query's top page. weak = best position above QUESTION_WEAK_POS.
export function questions(qpCur) {
  const byPage = new Map();
  let count = 0;
  for (const q of groupByQuery(qpCur)) {
    if (q.impressions < QUESTION_MIN_IMP || !isQuestion(q.query)) continue;
    const top = q.pages[0].page;
    if (!byPage.has(top)) byPage.set(top, { page: top, totalImp: 0, queries: [] });
    const g = byPage.get(top);
    g.totalImp += q.impressions;
    g.queries.push({
      query: q.query,
      impressions: q.impressions,
      bestPosition: q.bestPosition,
      weak: q.bestPosition !== null && q.bestPosition > QUESTION_WEAK_POS,
    });
    count++;
  }
  const groups = [...byPage.values()];
  for (const g of groups) g.queries.sort((a, b) => b.impressions - a.impressions);
  groups.sort((a, b) => b.totalImp - a.totalImp);
  return { count, groups };
}

// ---------------------------------------------------------------- e. near page one

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word-boundary match: "tcp" matches "tcp scheduling" but not "tcpip".
export function isBrand(query, brands) {
  const q = String(query).toLowerCase();
  return brands.some((b) => new RegExp(`(^|[^a-z0-9])${escapeRe(String(b).toLowerCase())}($|[^a-z0-9])`).test(q));
}

export function nearPageOne(qpCur, brands) {
  return qpCur
    .filter(
      (r) =>
        r.position >= NEAR_POS_MIN &&
        r.position <= NEAR_POS_MAX &&
        r.impressions >= NEAR_MIN_IMP &&
        !isBrand(r.query, brands)
    )
    .sort((a, b) => b.impressions - a.impressions);
}

// ---------------------------------------------------------------- f. unserved demand

export function unservedDemand(qpCur) {
  return groupByQuery(qpCur)
    .filter((q) => q.impressions >= UNSERVED_MIN_IMP && q.bestPosition !== null && q.bestPosition > UNSERVED_MIN_POS)
    .sort((a, b) => b.impressions - a.impressions);
}

// ---------------------------------------------------------------- g. target keywords

// registry: [{slug, url, primaryKeyword}]. status: ok | mismatch | not-found.
export function targetKeywords(registry, qpCur) {
  const byQuery = new Map();
  for (const r of qpCur) {
    const k = String(r.query).toLowerCase();
    if (!byQuery.has(k)) byQuery.set(k, new Map());
    const m = byQuery.get(k);
    m.set(r.page, (m.get(r.page) || 0) + r.impressions);
  }
  const out = [];
  for (const e of registry) {
    if (!e.primaryKeyword) continue;
    const pages = byQuery.get(String(e.primaryKeyword).toLowerCase());
    if (!pages) {
      out.push({ keyword: e.primaryKeyword, url: e.url, status: 'not-found', topPage: null, impressions: 0 });
      continue;
    }
    const [topPage, impressions] = [...pages.entries()].sort((a, b) => b[1] - a[1])[0];
    const status = pathOf(topPage) === pathOf(e.url || '') ? 'ok' : 'mismatch';
    out.push({ keyword: e.primaryKeyword, url: e.url, status, topPage, impressions });
  }
  return out;
}

// ---------------------------------------------------------------- report

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|');
const n0 = (v) => Math.round(v).toLocaleString('en-US');
const pos = (v) => (v ? v.toFixed(1) : '-');
const pct = (v) => (v === null || v === undefined ? 'n/a' : `${v >= 0 ? '+' : ''}${(v * 100).toFixed(0)}%`);
const share = (v) => `${Math.round(v * 100)}%`;
const table = (head, rows) =>
  [
    `| ${head.join(' | ')} |`,
    `|${head.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
  ].join('\n');
const capNote = (shown, total) =>
  total > shown ? `\n_Showing ${shown} of ${total}; the count above is complete._\n` : '';

// Builds every section and the markdown. counts feed the run summary.
export function buildDiagnosis({ today, windows, pulls, pageCur, pagePrev, qpCur, qpPrev, brands, registry }) {
  const pc = foldPageRows(pageCur);
  const pp = foldPageRows(pagePrev);
  const qc = foldQueryPageRows(qpCur);
  const qp = foldQueryPageRows(qpPrev);

  const a = pageMovement(pp, pc);
  const b = lostQueries(qp, qc);
  const c = splitQueries(qc);
  const d = questions(qc);
  const e = nearPageOne(qc, brands);
  const f = unservedDemand(qc);
  const g = targetKeywords(registry, qc);

  const counts = {
    a: {
      judged: a.judged,
      worseMixed: a.worse.length,
      better: a.better.length,
      listed: a.worse.length + a.better.length,
    },
    b: b.queryCount,
    c: c.length,
    d: d.count,
    e: e.length,
    f: f.length,
    g: g.length,
    gMismatch: g.filter((x) => x.status === 'mismatch').length,
    gNotFound: g.filter((x) => x.status === 'not-found').length,
  };

  const L = [];
  L.push(`# GSC diagnosis ${today}`, '');
  L.push(`- Current window: ${windows.cur.start} to ${windows.cur.end} (28 days ending today - ${END_LAG_DAYS}).`);
  L.push(`- Previous window: ${windows.prev.start} to ${windows.prev.end} (the 28 days before).`);
  L.push(
    '- Clicks for individual queries are privacy-suppressed in GSC: query rows sum to less than the page totals, so never read a 0 literally.'
  );
  L.push(
    `- Rows pulled: page cur ${pulls.pageCur}, page prev ${pulls.pagePrev}, query+page cur ${pulls.qpCur}, query+page prev ${pulls.qpPrev}.`
  );
  L.push('- Rows are folded first: `page#heading` and trailing-slash variants count as the base page.', '');

  // a
  L.push('## a. Page movement', '');
  L.push(
    `Rule: pages with ${PAGE_MIN_PREV_IMP}+ previous impressions, judged by classify() against the median page's impression change; worse and mixed first (most negative vsSite first), then better (top ${PAGE_TOP_N} of each).`,
    ''
  );
  L.push(
    a.control
      ? `Control: median page impression change ${pct(a.control.impPct)} over ${a.control.pages} pages. Judged ${a.judged} pages: ${a.worse.length} worse or mixed, ${a.better.length} better.`
      : `Control: none (under 5 pages with ${PAGE_MIN_PREV_IMP}+ previous impressions), so vsSite is n/a. Judged ${a.judged} pages.`,
    ''
  );
  const moveRows = (list) =>
    list
      .slice(0, PAGE_TOP_N)
      .map((i) => [
        pathOf(i.page),
        i.verdict,
        i.dropType ?? '-',
        `${pos(i.prev.position)} -> ${pos(i.cur.position)}`,
        `${n0(i.prev.impressions)} -> ${n0(i.cur.impressions)}`,
        pct(i.relImpPct),
      ]);
  const moveHead = ['page', 'verdict', 'dropType', 'position', 'impressions', 'vsSite'];
  L.push('### Worse and mixed', '', a.worse.length ? table(moveHead, moveRows(a.worse)) : '_None._', '');
  L.push('### Better', '', a.better.length ? table(moveHead, moveRows(a.better)) : '_None._', '');

  // b
  L.push('## b. Lost queries', '');
  L.push(
    `Rule: queries with ${LOST_MIN_PREV_IMP}+ previous impressions and 0 (or absent) current impressions, grouped by the page that had them.`,
    ''
  );
  L.push(`${b.queryCount} queries across ${b.groups.length} pages.`, '');
  let shown = 0;
  for (const grp of b.groups) {
    if (shown >= DISPLAY_CAP) break;
    const take = grp.queries.slice(0, DISPLAY_CAP - shown);
    shown += take.length;
    L.push(
      `### ${pathOf(grp.page)}`,
      '',
      table(
        ['query', 'prev impressions', 'prev position'],
        take.map((q) => [q.query, n0(q.impressions), pos(q.position)])
      ),
      ''
    );
  }
  if (b.queryCount)
    L.push(
      capNote(
        shown,
        b.groups.reduce((s, x) => s + x.queries.length, 0)
      )
    );

  // c
  L.push('## c. Split queries', '');
  L.push(
    `Rule: queries in the current window with ${SPLIT_MIN_PAGES}+ distinct pages, ${SPLIT_MIN_IMP}+ total impressions, and a top page share below ${share(SPLIT_MAX_TOP_SHARE)}.`,
    ''
  );
  L.push(`${c.length} queries.`, '');
  for (const q of c.slice(0, DISPLAY_CAP)) {
    L.push(
      `### ${q.query} (${n0(q.impressions)} impressions)`,
      '',
      table(
        ['page', 'share', 'position'],
        q.pages.map((p) => [pathOf(p.page), share(p.share), pos(p.position)])
      ),
      ''
    );
  }
  L.push(capNote(Math.min(c.length, DISPLAY_CAP), c.length));
  L.push(SPLIT_NOTE, '');

  // d
  L.push('## d. Questions people ask', '');
  L.push(
    `Rule: current queries that start with a question word or run ${QUESTION_MIN_WORDS}+ words, with ${QUESTION_MIN_IMP}+ impressions, grouped by top page; "weakly answered" when the best position is above ${QUESTION_WEAK_POS}.`,
    ''
  );
  L.push(`${d.count} queries across ${d.groups.length} pages.`, '');
  shown = 0;
  for (const grp of d.groups) {
    if (shown >= DISPLAY_CAP) break;
    const take = grp.queries.slice(0, DISPLAY_CAP - shown);
    shown += take.length;
    L.push(
      `### ${pathOf(grp.page)}`,
      '',
      table(
        ['query', 'impressions', 'best position', 'flag'],
        take.map((q) => [q.query, n0(q.impressions), pos(q.bestPosition), q.weak ? 'weakly answered' : ''])
      ),
      ''
    );
  }
  L.push(capNote(shown, d.count));

  // e
  L.push('## e. Near page one', '');
  L.push(
    `Rule: query+page rows at position ${NEAR_POS_MIN} to ${NEAR_POS_MAX} with ${NEAR_MIN_IMP}+ impressions, excluding brand queries (docs/seo/brand-terms.json, word-boundary match).`,
    ''
  );
  L.push(`${e.length} rows.`, '');
  if (e.length)
    L.push(
      table(
        ['query', 'page', 'position', 'impressions'],
        e.slice(0, DISPLAY_CAP).map((r) => [r.query, pathOf(r.page), pos(r.position), n0(r.impressions)])
      ),
      ''
    );
  L.push(capNote(Math.min(e.length, DISPLAY_CAP), e.length));

  // f
  L.push('## f. Unserved demand', '');
  L.push(
    `Rule: a query we show for (${UNSERVED_MIN_IMP}+ current impressions) where the best position across our pages is worse than ${UNSERVED_MIN_POS}: no page ranks well.`,
    ''
  );
  L.push(`${f.length} queries.`, '');
  if (f.length)
    L.push(
      table(
        ['query', 'impressions', 'best position', 'best page'],
        f.slice(0, DISPLAY_CAP).map((q) => [q.query, n0(q.impressions), pos(q.bestPosition), pathOf(q.pages[0].page)])
      ),
      ''
    );
  L.push(capNote(Math.min(f.length, DISPLAY_CAP), f.length));

  // g
  L.push('## g. Target keywords vs ranking page', '');
  L.push(
    "Rule: each keyword-registry entry with a primaryKeyword, exact (case-insensitive) query match in the current pull; the page with the most impressions is compared with the entry's url.",
    ''
  );
  L.push(
    `${g.length} keywords: ${g.length - counts.gMismatch - counts.gNotFound} on the right page, ${counts.gMismatch} mismatched, ${counts.gNotFound} not found in pull.`,
    ''
  );
  const gOrder = { mismatch: 0, 'not-found': 1, ok: 2 };
  const gRows = [...g].sort((x, y) => gOrder[x.status] - gOrder[y.status] || y.impressions - x.impressions);
  if (g.length)
    L.push(
      table(
        ['keyword', 'registry url', 'top page by impressions', 'impressions', 'status'],
        gRows.map((x) => [
          x.keyword,
          x.url ?? '-',
          x.topPage ? pathOf(x.topPage) : '-',
          x.topPage ? n0(x.impressions) : '-',
          x.status === 'not-found' ? 'not found in pull' : x.status === 'mismatch' ? 'MISMATCH' : 'ok',
        ])
      ),
      ''
    );

  return {
    markdown:
      L.join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trimEnd() + '\n',
    counts,
    sections: { a, b, c, d, e, f, g },
  };
}
