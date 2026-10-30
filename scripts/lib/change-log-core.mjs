// Pure functions behind scripts/change-log.mjs. No fs, no git, no clock reads,
// so every rule here is unit-testable (scripts/tests/change-log.test.mjs).

export const SITE = 'https://simplescheduleai.com';
export const WINDOW_DAYS = 28;
export const GSC_LAG_DAYS = 2;
const EPS = 1e-9;

// ---------------------------------------------------------------- dates

const DAY_MS = 86400000;
const toMs = (d) => Date.parse(`${d}T00:00:00Z`);

export function addDays(date, n) {
  return new Date(toMs(date) + n * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(a, b) {
  return Math.round((toMs(b) - toMs(a)) / DAY_MS);
}

// The change day itself is excluded from both windows.
export function windowsFor(changeDate) {
  return {
    before: { start: addDays(changeDate, -WINDOW_DAYS), end: addDays(changeDate, -1) },
    after: { start: addDays(changeDate, 1), end: addDays(changeDate, WINDOW_DAYS) },
  };
}

// ---------------------------------------------------------------- git log

const CONTENT_PATH = /^src\/data\/(?:post\/[^/]+\.mdx?|article\/[^/]+\.md)$/;

export function isContentPath(p) {
  return CONTENT_PATH.test(p);
}

export function slugOf(p) {
  return p
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '');
}

export function urlOf(p) {
  return `${p.startsWith('src/data/article/') ? '/articles' : '/blog'}/${slugOf(p)}`;
}

// Expects: git log --date=short --format=@@%H%x09%ad%x09%s --name-status
// Returns commits oldest first, each with its A/M/R content files (D dropped).
export function parseGitLog(text) {
  const commits = [];
  let cur = null;
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('@@')) {
      const [hash, date, ...rest] = line.slice(2).split('\t');
      cur = { hash, date, subject: rest.join('\t'), files: [] };
      commits.push(cur);
      continue;
    }
    if (!cur || !line.trim()) continue;
    const parts = line.split('\t');
    const status = parts[0][0];
    if (status === 'R') {
      if (isContentPath(parts[2])) cur.files.push({ status: 'R', path: parts[2], oldPath: parts[1] });
    } else if (status === 'A' || status === 'M') {
      if (isContentPath(parts[1])) cur.files.push({ status, path: parts[1], oldPath: parts[1] });
    }
  }
  return commits.reverse();
}

// ---------------------------------------------------------------- live / publish

// Live = frontmatter has `draft: false` or no draft key at all.
export function isLive(fileText) {
  const m = fileText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return true;
  const d = m[1].match(/^draft:\s*["']?(true|false)["']?\s*(?:#.*)?$/m);
  return !(d && d[1] === 'true');
}

export function detectKind({ existsInParent, parentDraft }) {
  return !existsInParent || parentDraft === true ? 'publish' : 'edit';
}

// ---------------------------------------------------------------- entries

// candidates: [{date, slug, url, kind, hash, subject}] oldest first.
export function collapse(candidates) {
  const map = new Map();
  for (const c of candidates) {
    const key = `${c.slug}|${c.date}`;
    let e = map.get(key);
    if (!e) {
      e = { date: c.date, slug: c.slug, url: c.url, kind: c.kind, commits: [], notes: [] };
      map.set(key, e);
    }
    if (c.kind === 'publish') e.kind = 'publish';
    if (!e.commits.some((x) => x.hash === c.hash)) e.commits.push({ hash: c.hash, subject: c.subject });
  }
  return [...map.values()];
}

// A note on the same slug+date attaches to that entry. Otherwise it becomes its own
// 'manual' entry (one per slug+date, notes combined).
export function attachNotes(entries, notes, resolveUrl = () => null) {
  const out = entries.map((e) => ({ ...e, notes: [...e.notes] }));
  for (const n of notes) {
    const hit = out.find((e) => e.slug === n.slug && e.date === n.date && e.kind !== 'manual');
    if (hit) {
      hit.notes.push(n.text);
      continue;
    }
    const manual = out.find((e) => e.slug === n.slug && e.date === n.date && e.kind === 'manual');
    if (manual) {
      manual.notes.push(n.text);
      continue;
    }
    out.push({
      date: n.date,
      slug: n.slug,
      url: n.url || resolveUrl(n.slug),
      kind: 'manual',
      commits: [],
      notes: [n.text],
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
}

// overlapping = another edit/publish of the same slug within 28 days either side.
export function flagOverlaps(entries) {
  return entries.map((e) => ({
    ...e,
    overlapping: entries.some(
      (o) =>
        o !== e &&
        o.slug === e.slug &&
        (o.kind === 'edit' || o.kind === 'publish') &&
        Math.abs(daysBetween(e.date, o.date)) <= WINDOW_DAYS
    ),
  }));
}

// ---------------------------------------------------------------- due

export function isDueDate(changeDate, today) {
  return daysBetween(changeDate, today) >= WINDOW_DAYS + GSC_LAG_DAYS;
}

export function isJudged(entry, verdicts) {
  return verdicts.some((v) => v.slug === entry.slug && v.changeDate === entry.date);
}

export function dueEntries(entries, verdicts, today) {
  return entries.filter(
    (e) => (e.kind === 'edit' || e.kind === 'manual') && isDueDate(e.date, today) && !isJudged(e, verdicts)
  );
}

export function groupByDate(entries) {
  const map = new Map();
  for (const e of entries) {
    if (!map.has(e.date)) map.set(e.date, []);
    map.get(e.date).push(e);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

// ---------------------------------------------------------------- GSC rows

// Accept the whole MCP response, a {rows:[...]} object, or a bare array
// (same approach as scripts/target-positions.mjs --record).
export function extractRows(raw) {
  if (typeof raw === 'string') raw = JSON.parse(raw);
  if (raw && !Array.isArray(raw) && typeof raw.result === 'string') raw = JSON.parse(raw.result);
  const rows = Array.isArray(raw) ? raw : raw?.rows;
  return Array.isArray(rows) ? rows : null;
}

const emptyMetrics = () => ({ clicks: 0, impressions: 0, ctr: 0, position: 0 });

// One daily pull (dimensions page,date) can serve every window: slice it to
// [start, end] and sum per page, position impression-weighted. Returns
// page-dimension rows in the same shape a per-window pull would have.
export function rowsForWindow(dailyRows, start, end) {
  const byPage = new Map();
  for (const r of dailyRows) {
    const page = r.keys?.[0] ?? r.page;
    const date = r.keys?.[1] ?? r.date;
    if (!page || !date || date < start || date > end) continue;
    const acc = byPage.get(page) || { clicks: 0, impressions: 0, posWeighted: 0 };
    acc.clicks += r.clicks || 0;
    acc.impressions += r.impressions || 0;
    acc.posWeighted += (r.position || 0) * (r.impressions || 0);
    byPage.set(page, acc);
  }
  return [...byPage.entries()].map(([page, a]) => ({
    keys: [page],
    clicks: a.clicks,
    impressions: a.impressions,
    ctr: a.impressions ? a.clicks / a.impressions : 0,
    position: a.impressions ? a.posWeighted / a.impressions : 0,
  }));
}

// Earliest and latest date present in a daily pull.
export function dailySpan(dailyRows) {
  let min = null;
  let max = null;
  for (const r of dailyRows) {
    const d = r.keys?.[1] ?? r.date;
    if (!d) continue;
    if (!min || d < min) min = d;
    if (!max || d > max) max = d;
  }
  return { min, max };
}

// Metrics for one page url. Matches the full url or the same url with a trailing
// slash; if both appear they are summed (position impression-weighted). A page
// missing from the pull has zero impressions.
export function metricsFor(rows, url) {
  const full = `${SITE}${url}`;
  const wanted = new Set([full, `${full}/`]);
  let clicks = 0;
  let impressions = 0;
  let posWeighted = 0;
  for (const r of rows) {
    // GSC reports a section link (page#heading) as its own row; it is the
    // same page, so fold it in.
    const key = (r.page || r.keys?.[0] || r.url || '').split('#')[0];
    if (!wanted.has(key)) continue;
    clicks += r.clicks || 0;
    impressions += r.impressions || 0;
    posWeighted += (r.position || 0) * (r.impressions || 0);
  }
  if (impressions === 0) return emptyMetrics();
  return {
    clicks,
    impressions,
    ctr: clicks / impressions,
    position: Number((posWeighted / impressions).toFixed(2)),
  };
}

// Whole-pull totals: the control. A page-dimension pull with a high row_limit
// covers every page, so its sum is the site for that window.
export function siteTotals(rows) {
  let clicks = 0;
  let impressions = 0;
  for (const r of rows) {
    clicks += r.clicks || 0;
    impressions += r.impressions || 0;
  }
  return { clicks, impressions };
}

// The control for judging a page: the MEDIAN page's impression change between
// the two windows, over pages with 50+ impressions before. A site total is no
// good here: one breakout page (12-hour-hospital-shifts-scheduling went
// 3,799 -> 9,066 in Sep-Oct 2026, about a third of the site) drags the total so
// far that every ordinary page reads as lost demand. Null under 5 pages.
export function controlFor(beforeRows, afterRows) {
  const fold = (rows) => {
    const m = new Map();
    for (const r of rows) {
      const k = (r.page || r.keys?.[0] || r.url || '').split('#')[0].replace(/\/$/, '');
      m.set(k, (m.get(k) || 0) + (r.impressions || 0));
    }
    return m;
  };
  const b = fold(beforeRows);
  const a = fold(afterRows);
  const changes = [];
  for (const [k, imp] of b) if (imp >= 50) changes.push(((a.get(k) || 0) - imp) / imp);
  if (changes.length < 5) return null;
  changes.sort((x, y) => x - y);
  const mid = Math.floor(changes.length / 2);
  const impPct = changes.length % 2 ? changes[mid] : (changes[mid - 1] + changes[mid]) / 2;
  return { impPct, pages: changes.length };
}

// Sum several pages' metrics into one (position impression-weighted). Used to
// judge a batch edit (one commit touching many pages) as a single change.
export function aggregate(list) {
  let clicks = 0;
  let impressions = 0;
  let posWeighted = 0;
  for (const m of list) {
    clicks += m.clicks;
    impressions += m.impressions;
    posWeighted += m.position * m.impressions;
  }
  if (impressions === 0) return emptyMetrics();
  return { clicks, impressions, ctr: clicks / impressions, position: Number((posWeighted / impressions).toFixed(2)) };
}

// ---------------------------------------------------------------- classification

const round = (v, d) => (v === null ? null : Number(v.toFixed(d)));

// site (optional): {impPct} from controlFor(), or {before:{impressions},
// after:{impressions}} totals for the same windows. When given, the impressions signals use the page's change MINUS the
// site's change, so a page that merely rode site-wide growth reads as flat.
export function classify(before, after, site = null) {
  const clicksTooSmall = before.clicks < 10 && after.clicks < 10;

  const posDelta = before.impressions === 0 || after.impressions === 0 ? null : before.position - after.position;
  const rawImpPct = before.impressions === 0 ? null : (after.impressions - before.impressions) / before.impressions;
  const siteImpPct =
    site && typeof site.impPct === 'number'
      ? site.impPct
      : site && site.before?.impressions > 0
        ? (site.after.impressions - site.before.impressions) / site.before.impressions
        : null;
  const impPct = rawImpPct === null ? null : siteImpPct === null ? rawImpPct : rawImpPct - siteImpPct;
  const ctrRel = before.ctr === 0 ? null : (after.ctr - before.ctr) / before.ctr;

  const out = {
    posDelta: round(posDelta, 2),
    impPct: round(rawImpPct, 4),
    siteImpPct: round(siteImpPct, 4),
    relImpPct: round(siteImpPct === null ? null : impPct, 4),
    ctrRel: round(ctrRel, 4),
    signals: [],
    dropType: null,
    verdict: 'flat',
    clicksTooSmall,
  };

  if (before.impressions < 50 && after.impressions < 50) {
    out.verdict = 'insufficient-data';
    return out;
  }

  const signals = [];
  if (posDelta !== null && posDelta >= 1 - EPS) signals.push('ranking-up');
  if (posDelta !== null && posDelta <= -1 + EPS) signals.push('ranking-down');
  if (impPct !== null && impPct >= 0.2 - EPS) signals.push('impressions-up');
  if (impPct !== null && impPct <= -0.2 + EPS) signals.push('impressions-down');
  const samePosition = posDelta === null || Math.abs(posDelta) < 1 - EPS;
  if (samePosition && before.impressions >= 100 && after.impressions >= 100 && ctrRel !== null) {
    if (ctrRel >= 0.3 - EPS) signals.push('ctr-up-same-position');
    if (ctrRel <= -0.3 + EPS) signals.push('ctr-down-same-position');
  }
  out.signals = signals;

  if (signals.includes('ranking-down')) out.dropType = 'lost-rankings';
  else if (signals.includes('impressions-down')) out.dropType = 'lost-demand';
  else if (signals.includes('ctr-down-same-position')) out.dropType = 'lost-ctr-same-position';

  // Opposite signals (e.g. up 7 positions but impressions behind the control)
  // are 'mixed', never folded into better or worse.
  const good = ['ranking-up', 'ctr-up-same-position', 'impressions-up'].some((s) => signals.includes(s));
  if (out.dropType && good) out.verdict = 'mixed';
  else if (out.dropType) out.verdict = 'worse';
  else if (good) out.verdict = 'better';
  return out;
}
