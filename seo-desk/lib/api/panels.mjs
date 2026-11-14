// View models for AI answers, Visitors, Site health, Competitors and Settings.

import { readJson } from '../store.mjs';
import { PRESETS, THRESHOLDS, STALE_HOURS, DAILY_HOUR } from '../config.mjs';
import { LABEL as SIGNAL_LABEL, MEANING as SIGNAL_MEANING, SIGNAL_ORDER } from '../score.mjs';
import { addDays, daysBetween, todayIso } from '../dates.mjs';
import { longDate, plain } from '../text.mjs';
import {
  envelope,
  rangeOf,
  linksFor,
  pagePath,
  itemState,
  itemOf,
  SOURCES,
  ADJUSTABLE_THRESHOLDS,
  checkedText,
} from './model.mjs';
import { INDEX_PER_RUN } from '../sources/index.mjs';
import { pagesTable } from './search.mjs';
import { outcomeSignal, OUTCOME_MIN_SESSIONS } from '../targets.mjs';
import { isInterestEvent } from '../sources/ga4.mjs';
import { pct, sumRange } from './fmt.mjs';
import { parseHygiene } from './site-check.mjs';
import { AI_CRAWLERS } from '../robots.mjs';
import { MIN_CHECKS } from '../ai-visibility.mjs';
import {
  groupChanges,
  countChanges,
  countText,
  classifyChange,
  competitorItemId,
  eventLine,
  safeHttps,
  hostOf,
  dossierEntryAfter,
  STALE_CHECK_DAYS,
} from '../competitor-changes.mjs';

const PLATFORM = { chat_gpt: 'ChatGPT', google: 'Google AI answers', perplexity: 'Perplexity', copilot: 'Copilot' };
const platformLabel = (p) => PLATFORM[p] || String(p || 'An AI assistant').replace(/_/g, ' ');

// The 28 days ending at a source's own through date, and the 28 before.
function twoWindows(through, fallbackEnd) {
  const end = through || fallbackEnd;
  const cur = { start: addDays(end, -27), end };
  const prev = { start: addDays(cur.start, -28), end: addDays(cur.start, -1) };
  return { cur, prev };
}

export const AI_IMPORTS_FILE = 'state/ai-imports.json';
export const loadAiImports = () => {
  const v = readJson(AI_IMPORTS_FILE, []);
  return Array.isArray(v) ? v : [];
};

// ---------------------------------------------------------------- AI answers

export function aiView(model) {
  const local = model.data.local ?? {};
  const byDate = new Map();
  for (const line of local.aeo ?? []) if (line?.date) byDate.set(line.date, line); // a repeated date keeps the last line
  const lines = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));

  const trend = lines.map((line) => {
    const byPlatform = {};
    for (const r of line.rows ?? []) {
      const names = r.kind === 'own-mention' || r.ourPresent === true;
      if (names) byPlatform[r.platform] = (byPlatform[r.platform] ?? 0) + 1;
    }
    return { date: line.date, byPlatform, total: Object.values(byPlatform).reduce((s, n) => s + n, 0) };
  });
  const platforms = [...new Set(lines.flatMap((l) => (l.rows ?? []).map((r) => r.platform).filter(Boolean)))].map(
    (p) => ({
      platform: p,
      label: platformLabel(p),
    })
  );

  const latest = lines[lines.length - 1] ?? null;
  const keywords = new Map();
  for (const r of latest?.rows ?? []) {
    if (r.keyword === undefined) continue;
    const k = keywords.get(r.keyword) ?? { keyword: r.keyword, cited: false, platforms: [] };
    if (r.ourPresent) k.cited = true;
    k.platforms.push({
      platform: r.platform,
      label: platformLabel(r.platform),
      cited: Boolean(r.ourPresent),
      rank: r.ourRank ?? null,
      sources: (r.topSources ?? []).map(([domain, count]) => ({ domain, count })),
      competitors: (r.competitors ?? []).map(([domain, count]) => ({ domain, count })),
    });
    keywords.set(r.keyword, k);
  }

  const ga = model.data.ga4;
  const w = twoWindows(model.snapObjs.ga4?.through, model.range.end);
  const aiRows = ga?.ai ?? [];
  const bySource = new Map();
  const daily = new Map();
  for (const r of aiRows) {
    daily.set(r.date, (daily.get(r.date) ?? 0) + r.sessions);
    if (r.date >= w.cur.start && r.date <= w.cur.end)
      bySource.set(r.source, (bySource.get(r.source) ?? 0) + r.sessions);
  }
  const visitsCur = sumRange(aiRows, w.cur.start, w.cur.end, 'sessions');
  const visitsPrev = sumRange(aiRows, w.prev.start, w.prev.end, 'sessions');

  const imports = loadAiImports();
  const last = imports[imports.length - 1] ?? null;
  const days = latest ? daysBetween(latest.date, model.today) : null;

  return {
    ...envelope(model, { need: ['local', 'ga4'] }),
    platforms,
    trend,
    atLeastNote: 'These counts are a floor. The citation check lists at most 10 answers per assistant.',
    latestCheck: latest ? { date: latest.date, dateText: longDate(latest.date), daysAgo: days } : null,
    moneyKeywords: [...keywords.values()],
    // The money keywords that cite us, as the one gated "N of M" this page shows: the pair only from
    // MIN_CHECKS keyword checks, else null, with the sentence to show either way.
    moneyCitations: moneyCitationsOf([...keywords.values()]),
    visitsFromAi: {
      range: rangeOf(w.cur),
      total: ga ? visitsCur : null,
      prevTotal: ga ? visitsPrev : null,
      change: ga ? pct(visitsCur, visitsPrev) : null,
      series: [...daily.entries()]
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      bySource: [...bySource.entries()]
        .map(([source, sessions]) => ({ source, sessions }))
        .sort((a, b) => b.sessions - a.sessions),
    },
    imports: {
      count: imports.length,
      trend: imports.map((i) => ({ date: i.date, dateText: longDate(i.date), rowCount: i.rowCount, totals: i.totals })),
      latest: last
        ? {
            date: last.date,
            columns: last.columns,
            rowCount: last.rowCount,
            totals: last.totals,
            rows: last.rows.slice(0, 50),
          }
        : null,
      how: 'Export the Generative AI report from Search Console by hand (there is no API for it), then upload the CSV here. Each upload is kept as its own dated snapshot.',
    },
    check: { job: 'citations', cost: 'about $0.62', writes: ['docs/seo/aeo-trend.jsonl'] },
  };
}

// ---------------------------------------------------------------- Visitors

const EVENT_LABEL = [
  [/template/i, 'Template downloads'],
  [/calculator|roi/i, 'Calculator breakdown requests'],
  [/contact|generate_lead/i, 'Contact form'],
  [/form/i, 'Form activity'],
];

function sumByPage(days, key, field) {
  const map = new Map();
  for (const d of days) for (const r of d[key] ?? []) map.set(r.page, (map.get(r.page) ?? 0) + (r[field] ?? 0));
  return [...map.entries()].map(([page, v]) => ({ page, v })).sort((a, b) => b.v - a.v || a.page.localeCompare(b.page));
}

// How Google Analytics words some names, in plain words.
const BREAKDOWN_LABEL = { '(not set)': 'Not recorded', '(direct) / (none)': 'Direct', '(none)': 'Not recorded' };

// One breakdown (sources, countries, devices) as rows with change and share, biggest first.
function breakdownOf(list) {
  const rows = Array.isArray(list) ? list : [];
  const total = rows.reduce((t, r) => t + (r.sessions ?? 0), 0);
  return {
    available: Array.isArray(list),
    total,
    rows: rows.map((r) => ({
      name: r.name,
      label: BREAKDOWN_LABEL[r.name] ?? r.name,
      sessions: r.sessions,
      prevSessions: r.prevSessions,
      change: pct(r.sessions, r.prevSessions),
      share: total ? Math.round((r.sessions / total) * 1000) / 1000 : null,
    })),
  };
}

export function visitorsView(model) {
  const ga = model.data.ga4;
  const w = twoWindows(model.snapObjs.ga4?.through, model.range.end);
  const channelsDaily = ga?.channelsDaily ?? [];
  const cur = new Map();
  const prev = new Map();
  const daily = new Map();
  for (const r of channelsDaily) {
    const d = daily.get(r.date) ?? { date: r.date, total: 0, byChannel: {} };
    d.total += r.sessions;
    d.byChannel[r.channel] = (d.byChannel[r.channel] ?? 0) + r.sessions;
    daily.set(r.date, d);
    if (r.date >= w.cur.start && r.date <= w.cur.end) cur.set(r.channel, (cur.get(r.channel) ?? 0) + r.sessions);
    else if (r.date >= w.prev.start && r.date <= w.prev.end)
      prev.set(r.channel, (prev.get(r.channel) ?? 0) + r.sessions);
  }
  const total = [...cur.values()].reduce((s, n) => s + n, 0);
  const prevTotal = [...prev.values()].reduce((s, n) => s + n, 0);
  const channels = [...cur.entries()]
    .map(([channel, sessions]) => ({
      channel,
      sessions,
      prevSessions: prev.get(channel) ?? 0,
      change: pct(sessions, prev.get(channel) ?? 0),
      share: total ? Math.round((sessions / total) * 1000) / 1000 : null,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  const landing = (ga?.landing ?? []).slice(0, 30).map((r) => ({
    page: r.page,
    sessions: r.sessions,
    prevSessions: r.prevSessions,
    change: pct(r.sessions, r.prevSessions),
    engagedSessions: r.engagedSessions,
    engagementRate: r.sessions >= 20 ? Math.round((r.engagedSessions / r.sessions) * 100) / 100 : null,
    links: linksFor(r.page),
  }));

  const interestSignals = (ga?.events ?? [])
    .filter((e) => isInterestEvent(e.name))
    .map((e) => ({
      name: e.name,
      label: EVENT_LABEL.find(([re]) => re.test(e.name))?.[1] ?? e.name,
      count: e.count,
      prevCount: e.prevCount,
      change: pct(e.count, e.prevCount),
    }));

  // Form, calculator and template uses per landing page; the share of 5 uses is what ranking sees.
  const outcomeRows = (ga?.outcomes ?? [])
    .map((r) => ({
      page: r.page,
      events: r.events,
      sessions: r.sessions,
      signal: outcomeSignal(r.page, ga.outcomes),
      links: linksFor(r.page),
    }))
    .sort((a, b) => b.events - a.events || b.sessions - a.sessions || a.page.localeCompare(b.page))
    .slice(0, 30);

  const clarity = model.data.clarity;
  const days = Object.entries(clarity?.days ?? {})
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const scroll = new Map();
  for (const d of days) {
    for (const r of d.scroll ?? []) {
      const s = scroll.get(r.page) ?? { sum: 0, n: 0 };
      s.sum += r.depth;
      s.n += 1;
      scroll.set(r.page, s);
    }
  }
  const errors = new Map();
  for (const d of days) for (const e of d.jsErrors ?? []) errors.set(e.message, (errors.get(e.message) ?? 0) + e.count);
  const top = (key) =>
    sumByPage(days, key, 'count')
      .slice(0, 15)
      .map(({ page, v }) => ({ page, count: v, links: linksFor(page) }));

  return {
    ...envelope(model, { need: ['ga4', 'clarity'], range: rangeOf(w.cur) }),
    standingLine:
      'Visits and form submissions are interest signals, not sales. Customers come through personal contacts.',
    internalTrafficNote:
      'Our own visits are not filtered out of Google Analytics yet, so small numbers include some internal traffic.',
    channels: {
      range: rangeOf(w.cur),
      total,
      // All visits against the 28 days before, null under the minimum base.
      change: pct(total, prevTotal),
      rows: channels,
      series: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
    },
    landing,
    interestSignals,
    outcomes: {
      available: Array.isArray(ga?.outcomes),
      minSessions: OUTCOME_MIN_SESSIONS,
      rows: outcomeRows,
      note: `Uses of a form, calculator or template after landing on the page, over the last 28 days. These are interest signals, not sales. A page needs ${OUTCOME_MIN_SESSIONS} visits before its interest counts in the ranking.`,
    },
    sourceMedium: breakdownOf(ga?.sourceMedium),
    countries: breakdownOf(ga?.countries),
    devices: breakdownOf(ga?.devices),
    clarity: clarity
      ? {
          available: true,
          daysCovered: days.length,
          firstDay: days[0]?.date ?? null,
          lastDay: days[days.length - 1]?.date ?? null,
          sessions: days.reduce((s, d) => s + (d.sessions ?? 0), 0),
          rage: top('rage'),
          dead: top('dead'),
          quickBack: top('quickBack'),
          scroll: [...scroll.entries()]
            .map(([page, s]) => ({ page, depth: Math.round(s.sum / s.n) }))
            .sort((a, b) => a.depth - b.depth)
            .slice(0, 15),
          jsErrors: [...errors.entries()]
            .map(([message, count]) => ({ message: plain(message), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15),
          note: 'Clarity only answers for the last few days, so this trend starts on the first day the desk pulled it.',
          recordingsUrl: 'https://clarity.microsoft.com/',
        }
      : { available: false, note: 'Clarity has not been pulled yet.', recordingsUrl: 'https://clarity.microsoft.com/' },
  };
}

// ---------------------------------------------------------------- Site health

const lastJob = (key) => readJson('state/jobs.json', {})?.last?.[key] ?? null;

export function healthView(model) {
  const clicksBy = new Map(pagesTable(model, 28).rows.map((r) => [r.page, r.clicks]));
  const prevVerdict = new Map((model.prevIndex ?? []).map((r) => [pagePath(r.page), r.verdict]));
  const index = (model.index.rows ?? []).map((r) => {
    const page = pagePath(r.page);
    const before = prevVerdict.get(page);
    const changedSinceLast = !before
      ? null
      : r.verdict === 'not-indexed' && before === 'indexed'
        ? 'new-problem'
        : r.verdict === 'indexed' && before === 'not-indexed'
          ? 'fixed'
          : null;
    return {
      page,
      verdict: r.verdict,
      reason: plain(r.reason),
      lastCrawl: r.lastCrawl ?? null,
      checkedAt: r.checkedAt ?? null,
      checkedOn: r.checkedAt ? todayIso(new Date(r.checkedAt)) : null,
      clicks: clicksBy.get(page) ?? 0,
      changedSinceLast,
      links: linksFor(page),
    };
  });
  index.sort((a, b) => b.clicks - a.clicks || a.page.localeCompare(b.page));
  const count = (v) => index.filter((r) => r.verdict === v).length;

  const bingIssues = (model.data.bing?.crawlIssues ?? []).map((c) => ({
    url: c.url,
    page: pagePath(c.url),
    issue: plain(c.issue),
    clicks: clicksBy.get(pagePath(c.url)) ?? 0,
  }));

  // Each issue: what was found, why it matters, the fix, the pages, sorted by the clicks they get.
  const issues = [];
  const notIndexed = index.filter((r) => r.verdict === 'not-indexed');
  if (notIndexed.length) {
    issues.push({
      id: 'not-indexed',
      what: `${notIndexed.length} live ${notIndexed.length === 1 ? 'page is' : 'pages are'} not on Google.`,
      why: 'A page that is not on Google cannot be found by anyone searching.',
      fix: 'Link to each page from two related pages Google already crawls, then request indexing in Search Console.',
      urls: notIndexed.map((r) => ({ page: r.page, clicks: r.clicks })),
    });
  }
  const groups = new Map();
  for (const c of bingIssues) groups.set(c.issue, [...(groups.get(c.issue) ?? []), c]);
  for (const [issue, list] of groups) {
    issues.push({
      id: `bing:${issue}`,
      what: `Bing reports: ${issue}`,
      why: 'Bing feeds Microsoft Copilot and other search tools, so a crawl problem there hides the page from them.',
      fix: 'Open the page in Bing Webmaster Tools, fix what it names, then ask Bing to crawl it again.',
      urls: list.map((c) => ({ page: c.page, clicks: c.clicks })),
    });
  }
  for (const w of model.warnings ?? []) {
    issues.push({
      id: `warn:${w}`,
      what: 'One of the desk checks did not finish.',
      why: 'Part of what the desk shows may be missing until it does.',
      fix: 'Press Refresh now. If it happens again, the details below say where it stopped.',
      urls: [],
      details: [String(w)],
    });
  }
  // The last site check, read into the same shape and sorted with everything else.
  const siteCheck = lastJob('site-check');
  const hygiene = siteCheck?.output?.length ? parseHygiene(siteCheck.output) : { issues: [], unparsed: [] };
  for (const i of hygiene.issues) {
    issues.push({
      ...i,
      source: 'site-check',
      urls: i.urls.map((u) => ({
        page: pagePath(u.page),
        detail: u.detail,
        clicks: clicksBy.get(pagePath(u.page)) ?? 0,
      })),
    });
  }
  for (const i of issues) {
    i.source = i.source ?? 'desk';
    i.severity = i.severity ?? 'fail';
    i.urls.sort((a, b) => b.clicks - a.clicks || a.page.localeCompare(b.page));
    i.clicks = i.urls.reduce((s, u) => s + u.clicks, 0);
  }
  issues.sort((a, b) => b.clicks - a.clicks || a.id.localeCompare(b.id));

  const lastmods = (model.data.local?.livePages ?? [])
    .map((p) => p.lastmod)
    .filter(Boolean)
    .sort();
  const keywordCheck = lastJob('keyword-check');
  const robots = model.data.local?.robots ?? null;
  const allowedBy = new Map((robots?.crawlers ?? []).map((c) => [c.agent, c.allowed]));
  return {
    ...envelope(model, { need: ['gsc', 'bing', 'local', 'index'] }),
    indexSummary: {
      indexed: count('indexed'),
      notIndexed: count('not-indexed'),
      unknown: count('unknown'),
      checked: model.index.checked,
      live: model.index.live,
      text: `${checkedText(model)}. Search Console answers for ${INDEX_PER_RUN} pages each morning, oldest check first, so every page is checked again every few days.`,
    },
    index,
    newSinceLast: index.filter((r) => r.changedSinceLast === 'new-problem').map((r) => r.page),
    fixedSinceLast: index.filter((r) => r.changedSinceLast === 'fixed').map((r) => r.page),
    comparedWith: model.prevIndex ? 'the previous refresh' : null,
    bingCrawlIssues: bingIssues,
    issues,
    siteCheck: {
      job: 'site-check',
      writes: ['dist/'],
      last: siteCheck,
      issues: hygiene.issues.length,
      output: siteCheck?.output ?? null,
      unparsed: hygiene.unparsed,
    },
    keywordCheck: { job: 'keyword-check', writes: [], last: keywordCheck },
    sitemap: {
      pages: model.data.local?.livePages?.length ?? null,
      newestLastmod: lastmods[lastmods.length - 1] ?? null,
    },
    aiCrawlers: {
      checked: Boolean(robots?.checkedAt),
      checkedAt: robots?.checkedAt ?? null,
      checkedOn: robots?.checkedAt ? todayIso(new Date(robots.checkedAt)) : null,
      error: robots?.error ? plain(robots.error) : null,
      crawlers: AI_CRAWLERS.map((agent) => {
        const allowed = allowedBy.get(agent);
        return {
          agent,
          allowed: allowed ?? null,
          status: allowed === true ? 'Allowed' : allowed === false ? 'Blocked' : 'Not checked yet',
        };
      }),
      note: "From the site's robots.txt, read with every refresh: whether each AI crawler may fetch the home page.",
    },
  };
}

// ---------------------------------------------------------------- Competitors

// What each watched competitor did, in plain events. The check writes one line per changed page;
// lib/competitor-changes.mjs folds those into distinct events (a list that repeats on five pages is
// one event), sets the pricing sentinels apart and says which events are worth a worry.
// New keys beside the old ones: hosts[], totals, loggedInDossier lines, check age.
export function competitorsView(model) {
  const c = model.data.local?.competitors ?? { sitemap: [], watch: [], lastRun: null };
  const days = c.lastRun ? daysBetween(c.lastRun, model.today) : null;
  const sitemap = (c.sitemap ?? []).map((s) => ({
    host: s.host,
    fetchedAt: s.fetchedAt,
    fetchedText: longDate(s.fetchedAt),
    daysSinceCheck: daysBetween(s.fetchedAt, model.today),
    status: s.status,
    addedCount: s.addedCount ?? s.added?.length ?? 0,
    removedCount: s.removedCount ?? s.removed?.length ?? 0,
    added: (s.added ?? []).slice(0, 20),
    removed: (s.removed ?? []).slice(0, 20),
  }));

  const snapshots = c.snapshots ?? null;
  const grouped = groupChanges(c.watch ?? [], snapshots ? new Set(snapshots.map((s) => s.url)) : null);
  const byHost = new Map(grouped.map((g) => [g.host, g]));
  const watchedPages = new Map();
  for (const s of snapshots ?? []) {
    const host = hostOf(s.url);
    watchedPages.set(host, (watchedPages.get(host) ?? 0) + 1);
    if (!byHost.has(host)) byHost.set(host, { host, events: [], sentinels: [], checkedOn: null });
  }

  const hosts = [...byHost.values()].map((g) => {
    const counts = countChanges(g);
    const material = g.events.filter((e) => e.material);
    const itemId = material.length ? competitorItemId(g.host, g.events) : null;
    const it = itemId ? itemOf(model, itemId) : null;
    const checkedOn = g.checkedOn ?? c.lastRun;
    const age = checkedOn ? daysBetween(checkedOn, model.today) : null;
    const noted = dossierEntryAfter(c.dossierLogDates ?? [], checkedOn);
    const links = [];
    for (const e of material)
      for (const p of e.pages) {
        const url = safeHttps(p);
        if (url && !links.some((x) => x.url === url))
          links.push({ url, label: new URL(url).pathname.replace(/\/+$/, '') || 'home page' });
      }
    return {
      host: g.host,
      itemId,
      seen: Boolean(it?.status === 'done'),
      state: itemId ? itemState(model, itemId) : null,
      worry: Boolean(itemId) && !(it?.status === 'done'),
      checkedOn,
      checkedText: checkedOn ? longDate(checkedOn) : null,
      daysSinceCheck: age,
      checkOld: age !== null && age > STALE_CHECK_DAYS,
      watchedPages: watchedPages.get(g.host) ?? 0,
      counts,
      countText: countText(counts),
      summary: !counts.events
        ? 'Nothing changed on the pages we watch.'
        : material.length
          ? `${material.length === 1 ? 'One change' : `${material.length} changes`} worth reading.`
          : 'Only headings or small text changes. Nothing on price, title, description, headline or buttons.',
      events: g.events.map((e) => ({
        kind: e.kind,
        plain: e.plain,
        line: material.includes(e) ? eventLine(g.host, e).sentence : e.plain,
        pages: e.pages.map(safeHttps).filter(Boolean),
        pageNames: e.pageNames,
        onText: e.onText,
        material: e.material,
      })),
      sentinels: g.sentinels,
      pageLinks: links,
      loggedInDossier: Boolean(noted),
      dossierLoggedOn: noted,
      dossierText: noted ? `Already noted in the competitor dossier on ${longDate(noted)}.` : null,
    };
  });
  hosts.sort(
    (a, b) =>
      Number(b.worry) - Number(a.worry) ||
      Number(b.counts.events > 0) - Number(a.counts.events > 0) ||
      a.host.localeCompare(b.host)
  );

  // The old per-page rows, kept for the readers of /api/competitors that still use them. Their text is
  // the plain events now, and Seen is the host's Seen.
  const hostOfRow = new Map(hosts.map((h) => [h.host, h]));
  const watch = (c.watch ?? []).map((w) => {
    const host = hostOf(w.url);
    const h = hostOfRow.get(host);
    const id = h?.itemId ?? `competitor-change:${host}`;
    return {
      id,
      host,
      url: /^https?:\/\//i.test(String(w.url)) ? w.url : null,
      pricing: String(w.url).includes('__pricing'),
      fetchedAt: w.fetchedAt,
      fetchedText: longDate(w.fetchedAt),
      daysSinceCheck: daysBetween(w.fetchedAt, model.today),
      changes: (w.changes ?? []).map((t) => classifyChange(t).plain),
      seen: Boolean(h?.seen),
      state: itemState(model, id),
    };
  });

  const totals = hosts.reduce(
    (t, h) => ({
      events: t.events + h.counts.events,
      pages: t.pages + h.counts.pages,
      material: t.material + h.counts.material,
    }),
    { events: 0, pages: 0, material: 0 }
  );
  const links = model.data.bing?.links ?? null;
  return {
    ...envelope(model, { need: ['local'] }),
    lastRun: c.lastRun,
    lastRunText: c.lastRun ? longDate(c.lastRun) : null,
    daysSinceCheck: days,
    stale: days === null ? true : days > 7,
    sitemap,
    watch,
    hosts,
    totals,
    worries: hosts.filter((h) => h.worry).length,
    linksPulse: links
      ? { total: links.total ?? null, history: links.history ?? [], note: "Bing's count of pages linking to the site." }
      : null,
    reminder: 'When a competitor makes a real move, log it in docs/seo/competitor-dossier.md.',
    check: {
      job: 'competitors',
      cost: null,
      writes: ['docs/seo/sitemap-snapshots/', 'docs/seo/competitor-snapshots/'],
    },
  };
}

// ---------------------------------------------------------------- Settings

const PRESET_LABEL = {
  balanced: 'Balanced',
  'money-pages-first': 'Money pages first',
  'findability-first': 'Findability first',
  'ai-citations-first': 'AI citations first',
  'interest-signals-first': 'Interest signals first',
};

export const THRESHOLD_LABEL = {
  WINDOW_LEN: 'Days in each comparison period',
  END_LAG_DAYS: 'Days Search Console data runs behind',
  PAGE_MIN_PREV_IMP: 'Impressions a page needs before its movement is judged',
  PAGE_TOP_N: 'Pages listed in a movement report',
  LOST_MIN_PREV_IMP: 'Earlier impressions a search needs to count as lost',
  SPLIT_MIN_PAGES: 'Pages that share a search before it counts as competing',
  SPLIT_MIN_IMP: 'Impressions a shared search needs to be flagged',
  SPLIT_MAX_TOP_SHARE: 'Top page share below which a search counts as split',
  QUESTION_MIN_IMP: 'Impressions a question needs to be flagged',
  QUESTION_MIN_WORDS: 'Words that make a search count as a question',
  QUESTION_WEAK_POS: 'Position worse than this counts as a weak answer',
  NEAR_POS_MIN: 'Nearest position that counts as near page one',
  NEAR_POS_MAX: 'Furthest position that counts as near page one',
  NEAR_MIN_IMP: 'Impressions a near page one search needs',
  UNSERVED_MIN_IMP: 'Impressions a search needs to count as unserved',
  UNSERVED_MIN_POS: 'Best position worse than this counts as unserved',
  LOW_CTR_MIN_IMP: 'Impressions a page needs before click rate is judged',
  SLIP_MIN_PREV_IMP: 'Earlier impressions a page needs before it can count as slipping',
  SLIP_DROP: 'Fall in impressions that counts as slipping (0.3 is 30%)',
  NEEDS_LINKS_MIN: 'Inbound links a live page should have',
  PCT_MIN_BASE: 'Smallest earlier number a percentage is shown for',
};

function moneyCitationsOf(keywords) {
  const checked = keywords.length;
  const enough = checked >= MIN_CHECKS;
  const cited = enough ? keywords.filter((k) => k.cited).length : null;
  return {
    checked,
    cited,
    enough,
    text: !checked
      ? 'No money keyword has been checked yet.'
      : !enough
        ? `Not enough data yet: ${checked} money ${checked === 1 ? 'keyword was' : 'keywords were'} checked, and a count needs ${MIN_CHECKS}.`
        : cited === 0
          ? `None of the ${checked} money keywords checked cites us yet.`
          : `${cited} of the ${checked} money keywords checked cite us.`,
  };
}

export function settingsView(model) {
  const s = model.settings;
  return {
    ...envelope(model),
    preset: s.preset,
    presets: Object.entries(PRESETS).map(([key, weights]) => ({ key, label: PRESET_LABEL[key] ?? key, weights })),
    weights: s.weights,
    signals: SIGNAL_ORDER.map((key) => ({ key, label: SIGNAL_LABEL[key], meaning: SIGNAL_MEANING[key] })),
    moneyPages: s.moneyPages,
    strategicKeywords: s.strategicKeywords,
    paused: s.paused,
    weeklyAudit: s.weeklyAudit,
    showGoogleUpdates: s.showGoogleUpdates,
    planSize: s.planSize,
    thresholds: Object.entries(THRESHOLDS).map(([key, def]) => ({
      key,
      label: THRESHOLD_LABEL[key] ?? key,
      value: s.thresholds[key] ?? def,
      default: def,
      overridden: s.thresholds[key] !== undefined && s.thresholds[key] !== def,
      adjustable: ADJUSTABLE_THRESHOLDS.includes(key),
    })),
    brands: model.brands,
    brandFile: 'docs/seo/brand-terms.json',
    schedule: {
      dailyHour: DAILY_HOUR,
      staleHours: STALE_HOURS,
      text: s.paused
        ? 'The desk is paused: nothing refreshes on its own. "Refresh now" still works.'
        : `Every source refreshes at ${DAILY_HOUR}:00 each morning, and when you open the desk and a source is more than ${STALE_HOURS} hours old.`,
    },
    paidCalls:
      'Paid calls never run on their own. The AI citation check costs about $0.62 and runs only after you confirm.',
    backup: {
      url: '/api/backup',
      what: 'Your statuses, notes, annotations, weekly plans, settings and the history the desk has kept.',
    },
    sourceNames: SOURCES,
  };
}
