// The eleven opportunity detectors. Pure functions: no files, no network, no
// clock (cfg.today is passed in). Each detector takes the source snapshots'
// .data and returns Opportunity[]. A detector whose inputs are missing returns
// [] and never throws.
//
// The shared detectors in scripts/lib/gsc-diagnose-core.mjs do the finding for
// near-page-one, competing-pages, slipping, wrong-page, unserved and question,
// so the desk and the monthly diagnose script always agree.

import crypto from 'node:crypto';
import {
  nearPageOne,
  splitQueries,
  questions,
  unservedDemand,
  targetKeywords,
  pageMovement,
  groupByQuery,
  isBrand,
} from '../../scripts/lib/gsc-diagnose-core.mjs';
import { THRESHOLDS, DEFAULT_MONEY_PAGES, EXPECTED_CTR } from './config.mjs';
import { windows as reportingWindows, daysBetween, todayIso } from './dates.mjs';
import { longDate, longRange } from './text.mjs';

export const RULE_TYPES = [
  'near-page-one',
  'low-click-rate',
  'competing-pages',
  'slipping',
  'wrong-page',
  'unserved',
  'question',
  'needs-links',
  'ai-gap',
  'engine-gap',
  'not-indexed',
];

const PAGE_EDIT_TEST = 'Judged by the 28-day before and after verdict.';
const POST_PAGE_RE = /^\/(blog|articles)\/[^/]+$/;
const LEGAL_RE = /^\/(privacy|terms|cookie|cookies|legal|disclaimer)(\/|-|$)/i;
const EVIDENCE_CAP = 5;

// Desk-only numbers that config.mjs does not carry yet; overridable via cfg.thresholds.
const DEFAULTS = { ENGINE_BING_MIN_IMP: 20, ENGINE_GOOGLE_MIN_IMP: 30, NOT_INDEXED_MIN_DAYS: 14 };

// Effort signal: higher means cheaper. 0.9 title or link change, 0.6 section, 0.2 new post.
const EFFORT = {
  'near-page-one': 0.6,
  'low-click-rate': 0.9,
  'competing-pages': 0.6,
  slipping: 0.6,
  'wrong-page': 0.6,
  unserved: 0.2,
  question: 0.6,
  'needs-links': 0.9,
  'ai-gap': 0.6,
  'engine-gap': 0.6,
  'not-indexed': 0.9,
};

// ---------------------------------------------------------------- small helpers

// '11 October to 7 November', the way every other page of the desk writes dates.
export function rangeText(range) {
  if (!range?.start || !range?.end) return 'the latest pull';
  return longRange(range.start, range.end);
}

const n0 = (v) => Math.round(v).toLocaleString('en-US');
const pos1 = (v) => Number(v).toFixed(1);
const pct0 = (frac) => `${Math.round(frac * 100)}%`;
const pct1 = (frac) => `${(frac * 100).toFixed(1)}%`;
const plural = (n, one, many) => (n === 1 ? one : many);

function listText(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const normPath = (p) => {
  const s = String(p ?? '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '');
  return s === '' ? '/' : s;
};

const pathFromUrl = (u) => {
  const s = String(u ?? '');
  const m = s.match(/^https?:\/\/[^/]+(\/.*)?$/i);
  return normPath(m ? (m[1] ?? '/') : s);
};

const isArr = Array.isArray;

export function opportunityId(type, page, query) {
  return crypto
    .createHash('sha1')
    .update(`${type}|${page ?? ''}|${query ?? ''}`)
    .digest('hex')
    .slice(0, 12);
}

// ---------------------------------------------------------------- context

function contextOf(snaps, cfg = {}) {
  const t = { ...DEFAULTS, ...THRESHOLDS, ...(cfg.thresholds || {}) };
  const today = cfg.today || todayIso();
  const gsc = snaps?.gsc ?? null;
  const local = snaps?.local ?? null;
  const fallback = reportingWindows(today);
  const win = gsc?.windows?.cur && gsc?.windows?.prev ? gsc.windows : fallback;
  const money = new Set((cfg.moneyPages ?? DEFAULT_MONEY_PAGES).map(normPath));
  const registry = (isArr(local?.registry) ? local.registry : []).filter((r) => r && r.url);
  const registryByUrl = new Map(registry.map((r) => [normPath(r.url), r]));
  const pillars = new Set(registry.filter((r) => r.type === 'pillar').map((r) => normPath(r.url)));
  for (const r of registry) if (r.pillar) pillars.add(normPath(r.pillar));

  const aeoLines = isArr(local?.aeo) ? local.aeo : [];
  const latestAeo = aeoLines.length
    ? aeoLines.reduce((best, line) => (String(line.date) >= String(best.date) ? line : best))
    : null;
  let citedPaths = null;
  if (latestAeo) {
    citedPaths = new Set();
    for (const row of latestAeo.rows || []) for (const u of row.citedUrls || []) citedPaths.add(pathFromUrl(u));
  }

  return {
    t,
    today,
    gsc,
    bing: snaps?.bing ?? null,
    local,
    cur: win.cur,
    prev: win.prev,
    brands: cfg.brands || [],
    money,
    registry,
    registryByUrl,
    pillars,
    latestAeo,
    citedPaths,
    pageCur: null,
  };
}

// page -> {clicks, impressions, position} for one window, from pageDaily.
function aggregatePages(pageDaily, range) {
  const map = new Map();
  for (const r of pageDaily || []) {
    if (!r.page || r.date < range.start || r.date > range.end) continue;
    const key = normPath(r.page);
    if (!map.has(key)) map.set(key, { clicks: 0, impressions: 0, posWeighted: 0 });
    const a = map.get(key);
    a.clicks += r.clicks || 0;
    a.impressions += r.impressions || 0;
    a.posWeighted += (r.position || 0) * (r.impressions || 0);
  }
  const out = new Map();
  for (const [page, a] of map) {
    out.set(page, {
      page,
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: a.impressions ? a.clicks / a.impressions : 0,
      position: a.impressions ? Number((a.posWeighted / a.impressions).toFixed(2)) : 0,
    });
  }
  return out;
}

function pageCurOf(ctx) {
  if (!ctx.gsc || !isArr(ctx.gsc.pageDaily)) return null;
  if (!ctx.pageCur) ctx.pageCur = aggregatePages(ctx.gsc.pageDaily, ctx.cur);
  return ctx.pageCur;
}

// Impressions for a page in the current window; null when Search Console data is absent.
function pageImpressions(ctx, page) {
  const m = pageCurOf(ctx);
  if (!m || !page) return null;
  return m.get(normPath(page))?.impressions ?? 0;
}

function importanceOf(ctx, page) {
  if (!page) return 0.3;
  const p = normPath(page);
  if (ctx.money.has(p)) return 1;
  if (ctx.pillars.has(p)) return 0.7;
  if (ctx.registryByUrl.has(p)) return 0.5;
  return 0.3;
}

function gateFor(ctx, type) {
  const t = ctx.t;
  return (
    {
      'near-page-one': t.NEAR_MIN_IMP,
      'low-click-rate': t.LOW_CTR_MIN_IMP,
      'competing-pages': t.SPLIT_MIN_IMP,
      slipping: t.SLIP_MIN_PREV_IMP,
      unserved: t.UNSERVED_MIN_IMP,
      question: t.QUESTION_MIN_IMP,
      'engine-gap': t.ENGINE_BING_MIN_IMP,
    }[type] ?? 0
  );
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// spec: {type, page, query, title, measured, action, test, isPageEdit, range, source, evidence,
//        impressions (number|null), distance (number), effort (number), ai (number, optional)}
function build(ctx, spec) {
  const page = spec.page ?? null;
  const query = spec.query ?? null;
  const imps = Number.isFinite(spec.impressions) ? spec.impressions : null;
  // AI value: 1 when the rule itself is about AI answers, 0.5 when AI answers already cite the page,
  // 0 when they do not, null when there is no AI citation data at all.
  let ai = spec.ai;
  if (ai === undefined) {
    if (ctx.citedPaths === null) ai = null;
    else ai = page && ctx.citedPaths.has(normPath(page)) ? 0.5 : 0;
  }
  return {
    id:
      spec.idPage === undefined ? opportunityId(spec.type, page, query) : opportunityId(spec.type, spec.idPage, query),
    type: spec.type,
    page,
    query,
    title: spec.title,
    measured: spec.measured,
    action: spec.action,
    test: spec.test ?? PAGE_EDIT_TEST,
    isPageEdit: spec.isPageEdit,
    range: spec.range,
    source: spec.source,
    evidence: spec.evidence ?? [],
    signals: {
      demand: imps === null ? null : clamp01(Math.log10(1 + imps) / 3.5),
      distance: spec.distance === null || spec.distance === undefined ? 0.5 : clamp01(spec.distance),
      importance: importanceOf(ctx, page),
      confidence: imps === null || imps < gateFor(ctx, spec.type) ? null : Math.min(1, imps / 200),
      effort: spec.effort ?? EFFORT[spec.type],
      ai,
    },
  };
}

// ---------------------------------------------------------------- Google query rules

export function detectNearPageOne(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!isArr(ctx.gsc?.qpCur)) return [];
  const range = ctx.cur;
  return nearPageOne(ctx.gsc.qpCur, ctx.brands).map((r) =>
    build(ctx, {
      type: 'near-page-one',
      page: r.page,
      query: r.query,
      title: `"${r.query}" is close to page one`,
      measured: `From ${rangeText(range)}, ${r.page} showed up ${n0(r.impressions)} times in search results for "${r.query}", at an average position of ${pos1(r.position)}. Page one ends at position 10.`,
      action: `Rework ${r.page} so it answers "${r.query}" more directly: put the answer near the top and add a section on what searchers still need.`,
      isPageEdit: true,
      range,
      source: 'gsc',
      evidence: [r],
      impressions: r.impressions,
      distance: (21 - r.position) / 13,
    })
  );
}

export function detectCompetingPages(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!isArr(ctx.gsc?.qpCur)) return [];
  const range = ctx.cur;
  return splitQueries(ctx.gsc.qpCur)
    .filter((q) => !isBrand(q.query, ctx.brands))
    .map((q) => {
      const top = q.pages[0];
      const shown = q.pages.slice(0, EVIDENCE_CAP);
      const listed = listText(shown.map((p) => `${p.page} (${pct0(p.share)})`));
      return build(ctx, {
        type: 'competing-pages',
        idPage: '', // keyed on the query alone so the item keeps its status when the top page swaps
        page: top.page,
        query: q.query,
        title: `${q.pages.length} of our pages compete for "${q.query}"`,
        measured: `From ${rangeText(range)}, "${q.query}" showed our site ${n0(q.impressions)} times, split across ${q.pages.length} pages: ${listed}. The top page holds only ${pct0(q.topShare)} of the views.`,
        action: `Pick one page to own "${q.query}": strengthen ${top.page}, and change or link the other pages so they stop answering the same question. First check whether the pages take turns rather than compete.`,
        isPageEdit: true,
        range,
        source: 'gsc',
        evidence: shown,
        impressions: q.impressions,
        distance: 0.5,
      });
    });
}

export function detectWrongPage(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!isArr(ctx.gsc?.qpCur) || !ctx.registry.length) return [];
  const range = ctx.cur;
  return targetKeywords(ctx.registry, ctx.gsc.qpCur)
    .filter((r) => r.status === 'mismatch')
    .map((r) =>
      build(ctx, {
        type: 'wrong-page',
        page: r.url,
        query: r.keyword,
        title: `The wrong page ranks for "${r.keyword}"`,
        measured: `From ${rangeText(range)}, "${r.keyword}" showed ${r.topPage} ${n0(r.impressions)} times, not ${r.url}, the page we wrote for it.`,
        action: `Make ${r.url} the clear answer for "${r.keyword}": use that phrase in its title and first paragraph, and link to it from ${r.topPage}.`,
        isPageEdit: true,
        range,
        source: 'gsc',
        evidence: [r],
        impressions: r.impressions,
        distance: 0.5,
      })
    );
}

export function detectUnserved(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!isArr(ctx.gsc?.qpCur)) return [];
  const range = ctx.cur;
  const targeted = new Set(ctx.registry.map((r) => String(r.primaryKeyword || '').toLowerCase()).filter(Boolean));
  return unservedDemand(ctx.gsc.qpCur)
    .filter((q) => !isBrand(q.query, ctx.brands) && !targeted.has(String(q.query).toLowerCase()))
    .map((q) => {
      const closest = q.pages[0]?.page;
      return build(ctx, {
        type: 'unserved',
        page: null,
        query: q.query,
        title: `People search "${q.query}" and none of our pages rank for it`,
        measured: `From ${rangeText(range)}, "${q.query}" showed our site ${n0(q.impressions)} times, but our best position was ${pos1(q.bestPosition)}, past page two.${closest ? ` The closest page is ${closest}.` : ''}`,
        action: `Write a post that answers "${q.query}" directly. Check first that it is not already a section of an existing page.`,
        test: 'Judged by whether the new post shows up in Search Console for this phrase within 28 days of going live.',
        isPageEdit: false,
        range,
        source: 'gsc',
        evidence: [
          {
            query: q.query,
            impressions: q.impressions,
            bestPosition: q.bestPosition,
            pages: q.pages.slice(0, EVIDENCE_CAP),
          },
        ],
        impressions: q.impressions,
        distance: 0.5,
      });
    });
}

export function detectQuestion(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!isArr(ctx.gsc?.qpCur)) return [];
  const range = ctx.cur;
  const out = [];
  for (const group of questions(ctx.gsc.qpCur).groups) {
    for (const q of group.queries) {
      if (!q.weak || isBrand(q.query, ctx.brands)) continue;
      out.push(
        build(ctx, {
          type: 'question',
          page: group.page,
          query: q.query,
          title: `Readers ask "${q.query}" and we answer it weakly`,
          measured: `From ${rangeText(range)}, "${q.query}" showed ${group.page} ${n0(q.impressions)} times, and our best position was ${pos1(q.bestPosition)}, so almost nobody sees our answer.`,
          action: `Add a short, direct answer to "${q.query}" under its own heading on ${group.page}.`,
          isPageEdit: true,
          range,
          source: 'gsc',
          evidence: [{ query: q.query, page: group.page, impressions: q.impressions, bestPosition: q.bestPosition }],
          impressions: q.impressions,
          distance: 0.5,
        })
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------- Google page rules

export function detectLowClickRate(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  const pages = pageCurOf(ctx);
  if (!pages) return [];
  const range = ctx.cur;
  const out = [];
  for (const p of pages.values()) {
    if (p.impressions < ctx.t.LOW_CTR_MIN_IMP || !(p.position > 0) || p.position > 15) continue;
    const expected = EXPECTED_CTR[Math.min(20, Math.max(1, Math.round(p.position)))];
    if (!(p.ctr < 0.5 * expected)) continue;
    out.push(
      build(ctx, {
        type: 'low-click-rate',
        page: p.page,
        query: '',
        title: `${p.page} gets fewer clicks than its position suggests`,
        measured: `From ${rangeText(range)}, ${p.page} appeared ${n0(p.impressions)} times in search results at an average position of ${pos1(p.position)}, but only ${n0(p.clicks)} ${plural(p.clicks, 'person', 'people')} clicked, a click rate of ${pct1(p.ctr)}. Pages at that position usually get about ${pct1(expected)}.`,
        action: `Rewrite the title and the short description shown in search results for ${p.page} so they promise what the page delivers.`,
        isPageEdit: true,
        range,
        source: 'gsc',
        evidence: [p],
        impressions: p.impressions,
        distance: 1 - p.ctr / expected,
      })
    );
  }
  return out;
}

const changeWords = (frac) =>
  Math.abs(frac) < 0.005 ? 'stayed flat' : `${frac < 0 ? 'fell' : 'rose'} ${pct0(Math.abs(frac))}`;

export function detectSlipping(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!isArr(ctx.gsc?.pageDaily)) return [];
  const cur = aggregatePages(ctx.gsc.pageDaily, ctx.cur);
  const prev = aggregatePages(ctx.gsc.pageDaily, ctx.prev);
  const move = pageMovement([...prev.values()], [...cur.values()]);
  if (!move.control) return []; // no median page to compare with yet
  const median = move.control.impPct;
  const range = { start: ctx.prev.start, end: ctx.cur.end };
  return [...move.worse, ...move.better]
    .filter(
      (i) =>
        i.prev.impressions >= ctx.t.SLIP_MIN_PREV_IMP &&
        i.impPct !== null &&
        i.impPct <= -ctx.t.SLIP_DROP &&
        i.impPct - median <= -ctx.t.SLIP_DROP
    )
    .map((i) =>
      build(ctx, {
        type: 'slipping',
        page: i.page,
        query: '',
        title: `${i.page} lost ${pct0(-i.impPct)} of its search views`,
        measured: `${i.page} showed up ${n0(i.prev.impressions)} times from ${rangeText(ctx.prev)} and ${n0(i.cur.impressions)} times from ${rangeText(ctx.cur)}, a drop of ${pct0(-i.impPct)}. The middle page on our site ${changeWords(median)} over the same dates.`,
        action: `Compare ${i.page} with the pages now ranking above it and refresh the sections that have gone stale.`,
        isPageEdit: true,
        range,
        source: 'gsc',
        evidence: [i],
        impressions: i.prev.impressions,
        distance: Math.min(1, -i.impPct),
      })
    );
}

// ---------------------------------------------------------------- local rules

export function detectNeedsLinks(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  const raw = ctx.local?.inbound;
  // An empty map means the link count failed, not that nothing is linked.
  if (!isArr(ctx.local?.livePages) || !raw || !Object.keys(raw).length) return [];
  const range = { start: ctx.today, end: ctx.today };
  const inbound = new Map(Object.entries(raw).map(([k, v]) => [normPath(k), isArr(v) ? v : []]));
  const out = [];
  for (const lp of ctx.local.livePages) {
    const page = normPath(lp.page);
    // Posts and articles only: index pages, the home page and legal pages are reached by navigation.
    if (!POST_PAGE_RE.test(page) || LEGAL_RE.test(page)) continue;
    if (!inbound.has(page)) continue; // never counted, so we cannot say it has no links
    const sources = inbound.get(page).map(String);
    // A shared component (header, footer, post layout) that links here counts as site-wide navigation.
    if (sources.some((src) => src.startsWith('src/components/'))) continue;
    // Only real pages count; src/pages/... entries are listing templates, not pages that link.
    const from = new Set(sources.filter((src) => src.startsWith('/')).map(normPath));
    from.delete(page);
    if (from.size >= ctx.t.NEEDS_LINKS_MIN) continue;
    out.push(
      build(ctx, {
        type: 'needs-links',
        page,
        query: '',
        title: `${page} has almost no links from our own pages`,
        measured: `As of ${rangeText(range)}, ${from.size} other ${plural(from.size, 'page', 'pages')} on our site ${plural(from.size, 'links', 'link')} to ${page}. Two or more is the minimum we want.`,
        action: `Add links to ${page} from at least two related pages, using words that describe what it covers.`,
        test: 'Judged by the page’s inbound link count after the links go in, then its search views over the next 28 days.',
        isPageEdit: false,
        range,
        source: 'local',
        evidence: [{ page, inboundPages: [...from] }],
        impressions: pageImpressions(ctx, page),
        distance: 0.5,
      })
    );
  }
  return out;
}

const PLATFORM = { chat_gpt: 'ChatGPT', google: 'Google AI answers', perplexity: 'Perplexity', copilot: 'Copilot' };
const platformName = (p) => PLATFORM[p] || String(p || 'an AI engine').replace(/_/g, ' ');
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function detectAiGap(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  if (!ctx.latestAeo) return [];
  const date = ctx.latestAeo.date;
  const range = { start: date, end: date };
  const byKeyword = new Map();
  for (const row of ctx.latestAeo.rows || []) {
    if (!row || row.keyword === undefined || row.ourPresent !== false) continue;
    if (!isArr(row.competitors) || !row.competitors.length) continue;
    const k = String(row.keyword).toLowerCase();
    if (!byKeyword.has(k)) byKeyword.set(k, { keyword: row.keyword, rows: [] });
    byKeyword.get(k).rows.push(row);
  }
  const out = [];
  for (const { keyword, rows } of byKeyword.values()) {
    const match = ctx.registry.find((r) => String(r.primaryKeyword || '').toLowerCase() === keyword.toLowerCase());
    const moneyMatch = [...ctx.money].find((p) => p === `/${slugify(keyword)}`);
    const page = match ? normPath(match.url) : (moneyMatch ?? null);
    const totals = new Map();
    for (const r of rows)
      for (const [domain, n] of r.competitors)
        totals.set(domain.replace(/^www\./, ''), (totals.get(domain.replace(/^www\./, '')) || 0) + n);
    const domains = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([d]) => d);
    const engines = listText([...new Set(rows.map((r) => platformName(r.platform)))]);
    out.push(
      build(ctx, {
        type: 'ai-gap',
        page,
        query: keyword,
        title: `AI answers for "${keyword}" cite competitors, not us`,
        measured: `On ${rangeText(range)}, ${engines} answered "${keyword}" without naming us. They cited ${listText(domains)}.`,
        action: `Add a clear, sourced answer for "${keyword}" to ${page ?? 'the page you want cited'}, so AI answers have something to quote.`,
        test: `Judged by the next weekly AI citation check: are we named for "${keyword}"?`,
        isPageEdit: false,
        range,
        source: 'local',
        evidence: rows,
        impressions: null,
        distance: 0.5,
        effort: page ? 0.6 : 0.2,
        ai: 1,
      })
    );
  }
  return out;
}

export function detectNotIndexed(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  // The index checks source, or the table older Search Console snapshots carried.
  const indexRows = isArr(snaps?.index?.pages) ? snaps.index.pages : ctx.gsc?.index;
  if (!isArr(indexRows) || !isArr(ctx.local?.livePages)) return [];
  const range = { start: ctx.today, end: ctx.today };
  const live = new Map(ctx.local.livePages.map((p) => [normPath(p.page), p]));
  // Only a publish says when a page went live. A later edit, or the sitemap's last changed date,
  // says nothing about its age, so a page with no publish in the 120 days of history is old.
  const published = new Map();
  for (const e of isArr(ctx.local.edits) ? ctx.local.edits : []) {
    if (e.kind !== 'publish') continue;
    const key = normPath(e.page);
    if (!published.has(key) || e.date < published.get(key)) published.set(key, e.date);
  }
  const out = [];
  for (const row of indexRows) {
    if (row.verdict !== 'not-indexed') continue;
    const page = normPath(row.page);
    if (!live.has(page)) continue;
    const since = published.get(page) ?? null;
    const age = since ? daysBetween(since, ctx.today) : null;
    if (age !== null && !(age > ctx.t.NOT_INDEXED_MIN_DAYS)) continue;
    const ageText =
      age === null
        ? `It has been live for more than ${ctx.t.NOT_INDEXED_MIN_DAYS} days.`
        : `It went live about ${age} days ago (published ${longDate(since)}).`;
    out.push(
      build(ctx, {
        type: 'not-indexed',
        page,
        query: '',
        title: `${page} is still not in Google's index`,
        measured: `As of ${rangeText(range)}, Search Console says ${page} is not indexed. ${ageText}`,
        action: `Link to ${page} from two related pages that Google already crawls, then request indexing in Search Console.`,
        test: 'Judged by whether Search Console reports the page as indexed within 14 days of the fix.',
        isPageEdit: false,
        range,
        source: 'gsc',
        evidence: [row],
        impressions: pageImpressions(ctx, page),
        distance: 0.5,
      })
    );
  }
  return out;
}

// ---------------------------------------------------------------- Bing vs Google

export function detectEngineGap(snaps, cfg) {
  const ctx = contextOf(snaps, cfg);
  const range = ctx.cur;
  const out = [];
  const bingQueries = isArr(ctx.bing?.queries) ? ctx.bing.queries : null;
  const googleRows = isArr(ctx.gsc?.qpCur) ? ctx.gsc.qpCur : null;
  const googleQueries = new Set();
  for (const r of googleRows || []) googleQueries.add(String(r.query).toLowerCase());
  for (const r of isArr(ctx.gsc?.queryCur) ? ctx.gsc.queryCur : []) googleQueries.add(String(r.query).toLowerCase());
  const bingSet = new Set((bingQueries || []).map((r) => String(r.query).toLowerCase()));
  // Bing snapshots now sum each search over Google's 28 days; older ones summed everything.
  const sameDates = Boolean(ctx.bing?.windows?.cur);

  // Bing shows us, Google does not.
  // Needs real Search Console rows: an empty pull would otherwise flag every Bing query.
  if (bingQueries && googleQueries.size > 0) {
    for (const b of bingQueries) {
      if (b.impressions < ctx.t.ENGINE_BING_MIN_IMP || isBrand(b.query, ctx.brands)) continue;
      if (googleQueries.has(String(b.query).toLowerCase())) continue;
      out.push(
        build(ctx, {
          type: 'engine-gap',
          page: null,
          query: b.query,
          title: `Bing shows us for "${b.query}" but Google does not`,
          measured: sameDates
            ? `From ${rangeText(range)}, Bing showed our site ${n0(b.impressions)} times for "${b.query}", while Google Search Console has no rows for it over the same dates.`
            : `Bing showed our site ${n0(b.impressions)} times for "${b.query}" in its report, which runs back further than 28 days, while Google Search Console has no rows for it from ${rangeText(range)}.`,
          action: `Write or adjust a page for "${b.query}" so Google can show us for it too, since Bing already does.`,
          test: `Judged by whether "${b.query}" appears in Search Console within 28 days of the change.`,
          isPageEdit: false,
          range,
          source: 'bing',
          evidence: [b],
          impressions: b.impressions,
          distance: 0.5,
          effort: 0.2,
        })
      );
    }
  }

  // Google shows a money or pillar page, Bing does not.
  if (bingQueries && googleRows) {
    for (const q of groupByQuery(googleRows)) {
      if (q.impressions < ctx.t.ENGINE_GOOGLE_MIN_IMP || isBrand(q.query, ctx.brands)) continue;
      if (bingSet.has(String(q.query).toLowerCase())) continue;
      const top = q.pages[0].page;
      if (importanceOf(ctx, top) < 0.7) continue;
      out.push(
        build(ctx, {
          type: 'engine-gap',
          page: top,
          query: q.query,
          title: `Google shows ${top} for "${q.query}" but Bing does not`,
          measured: `From ${rangeText(range)}, "${q.query}" showed ${top} ${n0(q.impressions)} times on Google, and the search is missing from Bing's report${sameDates ? ' for the same dates' : ''}.`,
          action: `Check that ${top} is indexed in Bing, submit it through Bing Webmaster if it is not, and compare its title with what Bing shows.`,
          test: `Judged by whether "${q.query}" appears in Bing's query report within 28 days of the fix.`,
          isPageEdit: false,
          range,
          source: 'gsc',
          evidence: [{ query: q.query, impressions: q.impressions, pages: q.pages.slice(0, EVIDENCE_CAP) }],
          impressions: q.impressions,
          distance: 0.5,
        })
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------- all

export const DETECTORS = [
  detectNearPageOne,
  detectLowClickRate,
  detectCompetingPages,
  detectSlipping,
  detectWrongPage,
  detectUnserved,
  detectQuestion,
  detectNeedsLinks,
  detectAiGap,
  detectEngineGap,
  detectNotIndexed,
];

// snaps: {gsc, bing, ga4, clarity, local}, each a snapshot .data or null.
// cfg: {thresholds, moneyPages, brands, today}.
export function detectAll(snaps, cfg) {
  const s = snaps || {};
  return DETECTORS.flatMap((detect) => detect(s, cfg));
}
