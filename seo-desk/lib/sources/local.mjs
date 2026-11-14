// Local repo sources: change-log verdicts, AEO trend, keyword registry, the monthly plan,
// open work, competitor logs, recent git edits, the live sitemap and internal links.
//
// Nothing here needs a sign-in. Each part is read on its own: one part failing leaves
// that part empty (or, for the live sitemap, at its previous value) and adds a line to
// data.warnings, so one bad file never blanks the whole snapshot.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readJson } from '../store.mjs';
import { addDays } from '../dates.mjs';
import { SITE } from '../config.mjs';
import { parsePlan, findPlanFile } from './plan-parser.mjs';
import { AI_CRAWLERS, robotsAllows } from '../robots.mjs';
import { refreshGoogleUpdates } from '../google-updates.mjs';
import { parseDossierLog } from '../competitor-changes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(HERE, '../../..');
const FETCH_TIMEOUT_MS = 10000;
const INBOUND_DIRS = ['src/data/post', 'src/data/article', 'src/pages', 'src/components'];
const LINK_EXT = /\.(md|mdx|astro|html|tsx|jsx|ts|js)$/i;

// ---------------------------------------------------------------- small readers

const readText = (file) => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
};

// One record per good line; bad lines are skipped.
export function readJsonl(file) {
  const text = readText(file);
  if (text === null) return [];
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // skip
    }
  }
  return out;
}

const stripMd = (s) => s.replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- open work

const FOUNDER_RE = /blocked on the founder/i;

// docs/seo/OPEN-WORK.md to [{section, text, blockedOnFounder}]. Table rows and list
// items become one entry each; a table row joins its cells with ": ". blockedOnFounder
// is true under a "Blocked on the founder" heading or bold lead-in.
export function parseOpenWork(md) {
  const out = [];
  const lines = String(md ?? '').split(/\r?\n/);
  let section = '';
  let founder = false;
  let item = null;
  const flush = () => {
    if (item) out.push({ section: item.section, text: stripMd(item.text), blockedOnFounder: item.founder });
    item = null;
  };
  const isSeparator = (l) => /^\|?\s*:?-{2,}/.test(l.trim()) && l.includes('|');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    const heading = /^#{2,3}\s+(.*)$/.exec(t);
    if (heading) {
      flush();
      section = stripMd(heading[1]).replace(/^\d+[a-z]?\.\s*/i, '');
      founder = FOUNDER_RE.test(heading[1]);
      continue;
    }
    const lead = /^\*\*(.+?)\*\*:?\s*$/.exec(t);
    if (lead) {
      flush();
      founder = FOUNDER_RE.test(lead[1]);
      continue;
    }
    if (t.startsWith('|')) {
      flush();
      if (isSeparator(t) || (i + 1 < lines.length && isSeparator(lines[i + 1]))) continue; // header or rule
      const cells = t
        .replace(/^\||\|$/g, '')
        .split(/(?<!\\)\|/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length) out.push({ section, text: stripMd(cells.join(': ')), blockedOnFounder: founder });
      continue;
    }
    const bullet = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(t);
    if (bullet) {
      flush();
      item = { section, text: bullet[1], founder };
      continue;
    }
    if (item && t && /^\s/.test(line)) {
      item.text += ` ${t}`;
      continue;
    }
    flush();
  }
  flush();
  return out;
}

// ---------------------------------------------------------------- competitor logs

// Blocks of a log: [{date, lines}] in file order. Several blocks can share a date.
function blocksOf(md) {
  const blocks = [];
  let cur = null;
  for (const line of String(md ?? '').split(/\r?\n/)) {
    const h = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/.exec(line);
    if (h) {
      cur = { date: h[1], lines: [] };
      blocks.push(cur);
    } else if (cur) cur.lines.push(line);
  }
  return blocks;
}

// Every block on the latest date, lines joined in order. Null when there are none.
function latestBlock(md) {
  const blocks = blocksOf(md);
  if (!blocks.length) return null;
  const date = blocks
    .map((b) => b.date)
    .sort()
    .pop();
  return { date, lines: blocks.filter((b) => b.date === date).flatMap((b) => b.lines) };
}

// Entries are "- host: summary" lines followed by indented "  - detail" lines.
function entriesOf(lines) {
  const entries = [];
  let cur = null;
  for (const line of lines) {
    const top = /^- ([^\s:]+): (.*)$/.exec(line);
    if (top) {
      cur = { key: top[1], summary: top[2].trim(), details: [] };
      entries.push(cur);
      continue;
    }
    const detail = /^\s+- (.*)$/.exec(line);
    if (detail && cur) cur.details.push(detail[1].trim());
    else if (line.trim() && cur) cur.details.push(line.trim()); // format drift: keep the text
  }
  return entries;
}

// DIFFLOG.md latest block to [{host, fetchedAt, added, removed, status, addedCount, removedCount}].
// The log lists new URLs but not removed ones, so removed stays [] and removedCount carries the "-N".
export function parseSitemapDiff(md) {
  const block = latestBlock(md);
  if (!block) return [];
  return entriesOf(block.lines).map((e) => {
    const counts = /^\+(\d+)\s*\/\s*-(\d+)/.exec(e.summary);
    const added = e.details.map((d) => /^NEW:\s*(\S+)/.exec(d)?.[1]).filter(Boolean);
    const status = counts
      ? 'diff'
      : /baseline/i.test(e.summary)
        ? 'baseline'
        : /unreachable/i.test(e.summary)
          ? 'unreachable'
          : 'other';
    return {
      host: e.key,
      fetchedAt: block.date,
      added,
      removed: [],
      status,
      addedCount: counts ? Number(counts[1]) : added.length,
      removedCount: counts ? Number(counts[2]) : 0,
    };
  });
}

// WATCHLOG.md latest block to
// [{url, key, fetchedAt, changes, hasSnapshot, previouslyUnreachable, answeredBefore, unreachableLastCheck}].
// Entries without a recognised "N change(s)" line keep their whole summary as one changes string.
// key is the log's own label for the page (host__path). hasSnapshot says the desk holds a saved
// snapshot for it (a page that never answered has none, and its url stays the key).
// previouslyUnreachable: the page's most recent earlier entry could not load it (how a pricing
// address that has just started answering is told from a page watched for the first time).
// answeredBefore: some earlier check shows the page answering. unreachableLastCheck: the check just
// before this one could not load it (two failures in a row).
export function parseWatchLog(md, snapshotUrl = () => null) {
  const block = latestBlock(md);
  if (!block) return [];
  const before = new Map();
  const everAnswered = new Set();
  const earlier = blocksOf(md).filter((b) => b.date < block.date);
  const lastDate =
    earlier
      .map((b) => b.date)
      .sort()
      .pop() ?? null;
  const lastCheck = new Map();
  for (const b of earlier) {
    for (const e of entriesOf(b.lines)) {
      const down = /^unreachable/.test(e.summary);
      before.set(e.key, down ? 'unreachable' : 'answered');
      if (!down) everAnswered.add(e.key);
      if (b.date === lastDate) lastCheck.set(e.key, down ? 'unreachable' : 'answered');
    }
  }
  return entriesOf(block.lines).map((e) => {
    const many = /^\d+ change\(s\)/.test(e.summary);
    const changes = many ? e.details : [e.summary, ...e.details];
    const snap = snapshotUrl(e.key);
    return {
      url: snap || e.key,
      key: e.key,
      fetchedAt: block.date,
      changes,
      hasSnapshot: Boolean(snap),
      previouslyUnreachable: before.get(e.key) === 'unreachable',
      answeredBefore: everAnswered.has(e.key),
      unreachableLastCheck: lastCheck.get(e.key) === 'unreachable',
    };
  });
}

// The saved snapshots of the watched pages, [{key, url, fetchedAt}], for telling a page that has
// never answered from one that used to. Unreadable files are skipped.
export function listSnapshots(dir) {
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  const out = [];
  for (const f of files.sort()) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (j?.url) out.push({ key: f.replace(/\.json$/, ''), url: String(j.url), fetchedAt: j.fetchedAt ?? null });
    } catch {
      // skip a file that is not a snapshot
    }
  }
  return out;
}

// ---------------------------------------------------------------- pages and links

// File path to the page path it is served at, or null when it is not a page.
export function pageOfFile(file) {
  const f = file.replace(/\\/g, '/');
  if (f.startsWith('/')) return f; // already a page path
  let m = /^src\/data\/post\/(.+)\.(?:md|mdx)$/.exec(f);
  if (m) return `/blog/${m[1]}`;
  m = /^src\/data\/article\/(.+)\.(?:md|mdx)$/.exec(f);
  if (m) return `/articles/${m[1]}`;
  m = /^src\/pages\/(.+)\.(?:astro|md|mdx|html)$/.exec(f);
  if (m && !m[1].includes('[')) {
    const route = m[1].replace(/(^|\/)index$/, '');
    return route ? `/${route}` : '/';
  }
  return null;
}

const SITE_HOST_RE = /^https?:\/\/(?:www\.)?simplescheduleai\.com/i;

function linkPath(target) {
  let t = target.trim().replace(SITE_HOST_RE, '');
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  t = t.split(/[?#]/)[0].replace(/\/$/, '');
  return t || '/';
}

// Every internal link target in one file's text, as a set of page paths.
function linkTargets(text) {
  const out = new Set();
  const add = (t) => {
    const p = linkPath(t);
    if (p) out.add(p);
  };
  for (const m of text.matchAll(/\]\(\s*<?([^)\s>]+)/g)) add(m[1]);
  for (const m of text.matchAll(/href\s*=\s*["']([^"']+)["']/g)) add(m[1]);
  for (const m of text.matchAll(/https?:\/\/(?:www\.)?simplescheduleai\.com(\/[^\s"'<>)\]]*)?/gi))
    add((m[1] || '/').replace(/[.,;:!?]+$/, '') || '/');
  return out;
}

// {'/blog/x': [sources]} for every page given, counting each distinct source once. A
// source is the page a file serves (a component file stays as its path). A link from a
// page to itself is ignored. Links are Markdown ](/p), href="/p" and the absolute URL.
export function countInbound(files, pages) {
  const wanted = new Set((pages || []).map((p) => (typeof p === 'string' ? p : p?.page)).filter(Boolean));
  const inbound = Object.fromEntries([...wanted].map((p) => [p, new Set()]));
  for (const { path: file, text } of files || []) {
    const source = pageOfFile(file) || file;
    for (const target of linkTargets(String(text ?? ''))) {
      if (target === source || !wanted.has(target)) continue;
      inbound[target].add(source);
    }
  }
  return Object.fromEntries(Object.entries(inbound).map(([p, set]) => [p, [...set].sort()]));
}

const loc = (block) => /<loc>\s*([^<]+?)\s*<\/loc>/.exec(block)?.[1];
const lastmod = (block) => /<lastmod>\s*([^<]+?)\s*<\/lastmod>/.exec(block)?.[1] ?? null;

// A sitemap <urlset> to [{page, lastmod}]. page is the URL path ('/' for the home page).
export function parseSitemap(xml) {
  const out = [];
  for (const m of String(xml ?? '').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const url = loc(m[1]);
    if (!url) continue;
    let page;
    try {
      page = new URL(url).pathname.replace(/\/$/, '') || '/';
    } catch {
      continue;
    }
    out.push({ page, lastmod: lastmod(m[1]) });
  }
  return out;
}

// A <sitemapindex> to the child sitemap URLs.
export function parseSitemapIndex(xml) {
  return [...String(xml ?? '').matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g)].map((m) => loc(m[1])).filter(Boolean);
}

// ---------------------------------------------------------------- live fetches

async function fetchText(url, fetchImpl) {
  const res = await fetchImpl(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: 'application/xml,text/xml' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// The live pages from the public sitemap. Throws on any failure so the caller can
// keep the previous list.
export async function fetchLivePages(fetchImpl = fetch) {
  const indexXml = await fetchText(`${SITE}/sitemap-index.xml`, fetchImpl);
  const children = parseSitemapIndex(indexXml);
  const urls = children.length ? children : [`${SITE}/sitemap-0.xml`];
  const byPage = new Map();
  for (const u of urls) for (const row of parseSitemap(await fetchText(u, fetchImpl))) byPage.set(row.page, row);
  if (!byPage.size) throw new Error('The sitemap listed no pages.');
  return [...byPage.values()].sort((a, b) => a.page.localeCompare(b.page));
}

// ---------------------------------------------------------------- AI crawlers

// Whether each AI crawler may fetch the home page, from the live robots.txt (10 second limit).
// On a failed fetch the previous answer is kept, with the error, so the page never goes blank.
export async function checkRobots(fetchImpl, previous = null) {
  try {
    const res = await fetchImpl(`${SITE}/robots.txt`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status} for robots.txt`);
    // No robots.txt at all means every crawler may fetch every page.
    const text = res.ok ? await res.text() : '';
    return {
      ok: true,
      checkedAt: new Date().toISOString(),
      error: null,
      crawlers: AI_CRAWLERS.map((agent) => ({ agent, allowed: robotsAllows(text, agent, '/') })),
    };
  } catch (e) {
    const error = `Could not read robots.txt: ${String(e?.message ?? e).slice(0, 120)}`;
    return previous?.crawlers
      ? { ...previous, error }
      : { ok: false, checkedAt: null, error, crawlers: AI_CRAWLERS.map((agent) => ({ agent, allowed: null })) };
  }
}

// ---------------------------------------------------------------- git edits

const POST_ROOTS = ['src/data/post', 'src/data/article', 'src/pages'];

// `git log --name-status` output (format "@@hash|date|subject") to
// [{page, date, kind, subject}]. kind is 'publish' for an added file, else 'edit'.
export function parseGitEdits(log) {
  const edits = new Map();
  let head = null;
  for (const line of String(log ?? '').split(/\r?\n/)) {
    if (line.startsWith('@@')) {
      const [, date, ...rest] = line.slice(2).split('|'); // hash, date, subject
      head = { date, subject: rest.join('|') };
      continue;
    }
    if (!head || !line.trim()) continue;
    const cols = line.split('\t');
    const status = cols[0];
    if (status.startsWith('D')) continue;
    const file = cols[cols.length - 1];
    const page = pageOfFile(file);
    if (!page || !LINK_EXT.test(file)) continue;
    const kind = status.startsWith('A') ? 'publish' : 'edit';
    const key = `${page}|${head.date}|${kind}`;
    if (!edits.has(key)) edits.set(key, { page, date: head.date, kind, subject: head.subject });
  }
  return [...edits.values()];
}

// change-log-notes.jsonl records to edits of kind 'manual', pointed at /blog/<slug>.
export function notesToEdits(notes) {
  return notes
    .filter((n) => n?.date && n?.slug)
    .map((n) => ({
      page: n.slug.startsWith('/') ? n.slug : `/blog/${n.slug}`,
      date: n.date,
      kind: 'manual',
      subject: String(n.text ?? ''),
    }));
}

function gitEdits(repoRoot) {
  const log = execFileSync(
    'git',
    ['log', '--since=120.days', '--no-merges', '--name-status', '--format=@@%H|%cs|%s', '--', ...POST_ROOTS],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 30000 }
  );
  return parseGitEdits(log);
}

// ---------------------------------------------------------------- due entries

function dueEntries(repoRoot, today) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-due-'));
  const out = path.join(dir, 'due.json');
  try {
    execFileSync(process.execPath, ['scripts/change-log.mjs', 'due', '--today', today, '--json', out], {
      cwd: repoRoot,
      stdio: 'ignore',
      timeout: 60000,
    });
    const parsed = JSON.parse(fs.readFileSync(out, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- inbound sources

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (LINK_EXT.test(e.name)) out.push(full);
  }
  return out;
}

function inboundFor(repoRoot, pages) {
  const files = [];
  for (const dir of INBOUND_DIRS)
    for (const full of walk(path.join(repoRoot, dir))) {
      const text = readText(full);
      if (text !== null) files.push({ path: path.relative(repoRoot, full).replace(/\\/g, '/'), text });
    }
  return countInbound(files, pages);
}

// ---------------------------------------------------------------- the pull

// {today, repoRoot?, fetchImpl?} -> snapshot (not written). Never throws for a bad part.
export async function pullLocal({ today, repoRoot = DEFAULT_REPO_ROOT, fetchImpl = fetch, now = Date.now() } = {}) {
  const warnings = [];
  const attempt = (label, fn, fallback) => {
    try {
      return fn();
    } catch (e) {
      warnings.push(`${label}: ${String(e?.message ?? e).slice(0, 160)}`);
      return fallback;
    }
  };
  const seo = (f) => path.join(repoRoot, 'docs/seo', f);

  const verdicts = readJsonl(seo('change-log-verdicts.jsonl'));
  const aeo = readJsonl(seo('aeo-trend.jsonl'));
  const registry = attempt(
    'registry',
    () =>
      JSON.parse(readText(seo('keyword-registry.json')) ?? '[]').map((r) => ({
        slug: r.slug,
        type: r.type,
        url: r.url,
        primaryKeyword: r.primaryKeyword,
        pillar: r.pillar ?? null,
      })),
    []
  );

  const planFile = findPlanFile(repoRoot);
  const plan = planFile
    ? parsePlan(readText(planFile) ?? '', path.relative(repoRoot, planFile).replace(/\\/g, '/'))
    : { file: null, error: 'No docs/seo/next-*-blogs-*.md plan file found.', posts: [], improve: [] };

  const openWork = parseOpenWork(readText(seo('OPEN-WORK.md')) ?? '');

  const snapDir = seo('competitor-snapshots');
  const snapshotUrl = (key) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(snapDir, `${key}.json`), 'utf8')).url || null;
    } catch {
      return null;
    }
  };
  const sitemapLog = readText(seo('sitemap-snapshots/DIFFLOG.md'));
  const watchLog = readText(seo('competitor-snapshots/WATCHLOG.md'));
  const sitemap = parseSitemapDiff(sitemapLog);
  const watch = parseWatchLog(watchLog, snapshotUrl);
  const lastRun = [...sitemap.map((s) => s.fetchedAt), ...watch.map((w) => w.fetchedAt)].sort().pop() ?? null;
  const snapshots = listSnapshots(snapDir);
  // The dossier's maintenance log rows of the last 120 days (date and text), so the page can say
  // whether a note about a given competitor already exists.
  const dossierFrom = addDays(today, -120);
  const dossierLog = parseDossierLog(readText(seo('competitor-dossier.md'))).filter((r) => r.date >= dossierFrom);

  const due = attempt('due', () => dueEntries(repoRoot, today), []);
  const edits = attempt('edits', () => gitEdits(repoRoot), []).concat(
    notesToEdits(readJsonl(seo('change-log-notes.jsonl')))
  );
  edits.sort((a, b) => b.date.localeCompare(a.date) || a.page.localeCompare(b.page));

  let livePages;
  try {
    livePages = await fetchLivePages(fetchImpl);
  } catch (e) {
    warnings.push(`livePages: kept the previous list (${String(e?.message ?? e).slice(0, 120)})`);
    livePages = readJson('snap/local.json', null)?.data?.livePages ?? [];
  }

  const robots = await checkRobots(fetchImpl, readJson('snap/local.json', null)?.data?.robots ?? null);

  // Google's ranking updates, for the chart markers and the verdict cards. The feed is asked at
  // most once a day (this pull runs on every page load); a failed read keeps the last list and the
  // date of the last good read, which Did it work shows once it is old.
  const prevLocal = readJson('snap/local.json', null)?.data ?? {};
  const googleUpdates = await refreshGoogleUpdates({
    fetchImpl,
    previous: {
      updates: prevLocal.googleUpdates ?? [],
      fetchedAt: prevLocal.googleUpdatesFetchedAt ?? null,
      triedAt: prevLocal.googleUpdatesTriedAt ?? null,
    },
    now,
  });
  if (googleUpdates.warning) warnings.push(googleUpdates.warning);

  const pagePaths = [...new Set([...livePages.map((p) => p.page), ...registry.map((r) => r.url).filter(Boolean)])];
  const inbound = attempt('inbound', () => inboundFor(repoRoot, pagePaths), {});

  return {
    source: 'local',
    ok: true,
    status: 'fresh',
    pulledAt: new Date().toISOString(),
    through: today,
    error: null,
    data: {
      verdicts,
      due,
      aeo,
      registry,
      plan,
      openWork,
      competitors: { sitemap, watch, lastRun, snapshots, dossierLog },
      edits,
      livePages,
      inbound,
      robots,
      googleUpdates: googleUpdates.updates,
      googleUpdatesFetchedAt: googleUpdates.fetchedAt,
      googleUpdatesTriedAt: googleUpdates.triedAt,
      warnings,
    },
  };
}
