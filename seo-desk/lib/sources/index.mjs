// Index checks: asks Search Console whether each live page is on Google. Its own source, so a
// slow inspection never holds up the performance pulls.
//
// Each run inspects at most INDEX_PER_RUN pages, those never checked first and then the ones
// checked longest ago, and carries every earlier result forward with the time it was checked.
// So the whole site is covered over a few mornings, and the job "Check every page on Google
// now" runs this again and again until every page has a fresh answer.

import { openServer, McpError } from '../mcp-client.mjs';
import { pathOf } from '../../../scripts/lib/gsc-diagnose-core.mjs';
import { GSC_SITE_URL, normIndex } from './gsc.mjs';
import { plainError } from '../text.mjs';

export const INDEX_PER_RUN = 40;
const CHUNK = 10;
// The engine stops the source at 15 minutes; the puller stops starting new batches a little
// before that, so what it checked is saved instead of thrown away.
export const INDEX_DEADLINE_MS = 12 * 60 * 1000;
const QUOTA_RE = /quota|rate.?limit|\b429\b|resource.?exhausted/i;

const urlFor = (page) => GSC_SITE_URL.replace(/\/$/, '') + (page.startsWith('/') ? page : `/${page}`);

// The pages to check next: never checked first, then the oldest check, then by path.
export function pickPages(livePaths, rows, cap = INDEX_PER_RUN) {
  const at = new Map((rows ?? []).map((r) => [r.page, r.checkedAt ?? '']));
  return [...livePaths]
    .sort((a, b) => (at.get(a) ?? '').localeCompare(at.get(b) ?? '') || a.localeCompare(b))
    .slice(0, cap);
}

const notChecked = (page) => ({
  page,
  verdict: 'unknown',
  reason: 'Not checked yet',
  lastCrawl: null,
  checkedAt: null,
});

// {today, livePages, prev, seed?, seedCheckedAt?, session?, signal?, cap?, deadlineMs?} -> snapshot.
// prev: the last index snapshot. seed: the old Search Console index table, used once when there
// is no index snapshot yet. A sign-in error propagates; a quota or other error keeps what this run
// checked. A run that checked nothing at all is a failure (the engine then keeps the old data).
export async function pullIndex({
  today,
  livePages = [],
  prev = null,
  seed = null,
  seedCheckedAt = null,
  session,
  signal,
  cap = INDEX_PER_RUN,
  deadlineMs = INDEX_DEADLINE_MS,
  open = openServer,
} = {}) {
  const started = Date.now();
  const live = [...new Set((livePages ?? []).map((p) => pathOf(typeof p === 'string' ? p : p?.page)).filter(Boolean))];
  if (!live.length) throw new McpError('The live page list is empty, so there is nothing to check.');

  const earlier = Array.isArray(prev?.data?.pages)
    ? prev.data.pages
    : (seed ?? []).map((r) => ({ ...r, page: pathOf(r.page), checkedAt: r.checkedAt ?? seedCheckedAt ?? null }));
  const byPage = new Map(earlier.map((r) => [r.page, r]));
  const todo = pickPages(live, earlier, cap);

  const own = !session;
  const s = session || (await open('google-search-console', { signal }));
  const fresh = new Map();
  let error = null;
  try {
    for (let i = 0; i < todo.length; i += CHUNK) {
      if (signal?.aborted) {
        error = 'The check was stopped before it finished.';
        break;
      }
      if (Date.now() - started > deadlineMs) {
        error = `Stopped after ${fresh.size} pages to stay inside the time limit. The rest are checked next time.`;
        break;
      }
      const chunk = todo.slice(i, i + CHUNK);
      try {
        const res = await s.call('batch_url_inspection', {
          site_url: GSC_SITE_URL,
          urls: chunk.map(urlFor).join('\n'),
        });
        const results = Array.isArray(res?.results) ? res.results : [];
        const byUrl = new Map(results.map((r) => [pathOf(r.url ?? r.page_url ?? ''), r]));
        const at = new Date().toISOString();
        for (const page of chunk) {
          const r = normIndex({ ...(byUrl.get(page) || { error: 'No result returned' }), url: urlFor(page) });
          fresh.set(page, { ...r, page, reason: r.reason, checkedAt: at });
        }
      } catch (e) {
        if (e instanceof McpError && e.kind === 'needs-sign-in' && !QUOTA_RE.test(e.message)) throw e;
        error = QUOTA_RE.test(String(e?.message))
          ? `Search Console said its daily inspection quota is used up after ${fresh.size} pages. The rest are checked next time.`
          : `Search Console stopped answering after ${fresh.size} pages: ${plainError(e)}`;
        break;
      }
    }
  } finally {
    if (own) s.close();
  }

  if (!fresh.size && todo.length) {
    return { source: 'index', ok: false, status: 'failed', pulledAt: null, through: null, error, data: {} };
  }
  const pages = live.map((page) => fresh.get(page) ?? byPage.get(page) ?? notChecked(page));
  return {
    source: 'index',
    ok: true,
    status: 'fresh',
    pulledAt: new Date().toISOString(),
    through: today,
    error,
    data: {
      pages,
      live: live.length,
      checked: pages.filter((r) => r.checkedAt).length,
      checkedThisRun: fresh.size,
      cap,
    },
  };
}
