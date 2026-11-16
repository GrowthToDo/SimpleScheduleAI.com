// News feeds for the Newsroom page: free public RSS, no accounts. One GET per feed per run, a normal
// user agent, 20 seconds and 2 MB at most per feed, and no other site. A feed that fails is named in
// the snapshot's warnings; the rest still count. Only items from the last 14 days are kept.
//
// Returns a snapshot {source: 'news', ok, status, pulledAt, through, error, data} and writes nothing
// (lib/refresh.mjs writes data/snap/news.json).

import { parseFeed, NEWS_DAYS } from '../news.mjs';
import { addDays } from '../dates.mjs';
import { plainError } from '../text.mjs';

export const FEED_TIMEOUT_MS = 20000;
export const FEED_MAX_BYTES = 2 * 1024 * 1024;
const PARALLEL = 4;

export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// The searches, from the skill's seeds and the topic log. Each is one Google News search, US English,
// the last 14 days.
export const SEEDS = [
  'nurse staffing',
  'nurse shortage',
  'CMS rule hospital',
  'Conditions of Participation',
  'rural hospital closure',
  'critical access hospital',
  'nurse strike',
  'nurse union',
  'Texas nursing',
  'Texas hospital',
  'Rural Health Transformation',
  'Texas Medicaid',
  'nurse turnover',
  'NSI nursing report',
];

export const googleNewsUrl = (seed) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(seed).replace(/%20/g, '+')}+when:${NEWS_DAYS}d&hl=en-US&gl=US&ceid=US:en`;

// Trade press feeds, each confirmed with one plain GET on 2026-11-16. HealthLeaders
// (healthleadersmedia.com/rss.xml) answered with a bot check page, not a feed, so it is left out.
export const TRADE_FEEDS = [
  { name: "Becker's Hospital Review", url: 'https://www.beckershospitalreview.com/feed/' },
  { name: 'Fierce Healthcare', url: 'https://www.fiercehealthcare.com/rss/xml' },
  { name: 'KFF Health News', url: 'https://kffhealthnews.org/feed/' },
  { name: 'The Daily Yonder', url: 'https://dailyyonder.com/feed/' },
];

// Every feed the pull reads, in one list: [{name, url, google}].
export const FEEDS = [
  ...SEEDS.map((seed) => ({ name: `Google News: ${seed}`, url: googleNewsUrl(seed), google: true })),
  ...TRADE_FEEDS.map((f) => ({ ...f, google: false })),
];

// The body of one response as text, refusing more than `max` bytes.
async function readCapped(res, max) {
  const len = Number(res.headers.get('content-length'));
  if (Number.isFinite(len) && len > max) throw new Error(`the feed is larger than ${Math.round(max / 1048576)} MB`);
  if (!res.body?.getReader) {
    const t = await res.text();
    if (Buffer.byteLength(t) > max) throw new Error(`the feed is larger than ${Math.round(max / 1048576)} MB`);
    return t;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel().catch(() => {});
      throw new Error(`the feed is larger than ${Math.round(max / 1048576)} MB`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
}

// One feed: {ok, items, error}. Never throws.
export async function readFeed(
  feed,
  { fetchImpl = fetch, signal, timeoutMs = FEED_TIMEOUT_MS, maxBytes = FEED_MAX_BYTES } = {}
) {
  const ctrl = new AbortController();
  const timer = setTimeout(
    () => ctrl.abort(new Error(`no answer in ${Math.round(timeoutMs / 1000)} seconds`)),
    timeoutMs
  );
  const stop = () => ctrl.abort(new Error('the refresh was stopped'));
  signal?.addEventListener?.('abort', stop, { once: true });
  try {
    const res = await fetchImpl(feed.url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
        'accept-encoding': 'gzip, deflate',
      },
    });
    if (!res.ok) throw new Error(`it answered ${res.status}`);
    const text = await readCapped(res, maxBytes);
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(text)) throw new Error('it did not send a feed');
    return { ok: true, items: parseFeed(text, { name: feed.google ? '' : feed.name, google: feed.google }) };
  } catch (e) {
    const why = ctrl.signal.aborted && ctrl.signal.reason ? ctrl.signal.reason : e;
    return { ok: false, items: [], error: plainError(why) };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', stop);
  }
}

// {today, fetchImpl?, signal?, feeds?} -> the snapshot. ok is false only when no feed answered.
export async function pullNews({ today, fetchImpl = fetch, signal, feeds = FEEDS, timeoutMs, maxBytes } = {}) {
  const from = addDays(today, -NEWS_DAYS);
  const results = new Array(feeds.length);
  let next = 0;
  const worker = async () => {
    while (next < feeds.length) {
      const i = next++;
      results[i] = await readFeed(feeds[i], { fetchImpl, signal, timeoutMs, maxBytes });
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL, feeds.length) }, worker));
  const items = [];
  const feedRows = feeds.map((f, i) => {
    const r = results[i];
    const kept = r.items
      .filter((it) => it.date && it.date >= from && it.date <= today)
      .map((it) => ({ ...it, feed: f.name, google: Boolean(f.google) }));
    items.push(...kept);
    return {
      name: f.name,
      url: f.url,
      google: Boolean(f.google),
      ok: r.ok,
      items: kept.length,
      error: r.error ?? null,
    };
  });
  const failed = feedRows.filter((f) => !f.ok);
  const answered = feedRows.length - failed.length;
  const warnings = failed.map((f) => `${f.name} did not answer: ${f.error}`);
  const pulledAt = new Date().toISOString();
  if (!answered) {
    return {
      source: 'news',
      ok: false,
      status: 'failed',
      pulledAt,
      through: today,
      error: `None of the ${feeds.length} news feeds answered. The first said: ${failed[0]?.error ?? 'no answer'}`,
      data: { feeds: feedRows, items: [], from, to: today, warnings },
    };
  }
  return {
    source: 'news',
    ok: true,
    status: 'fresh',
    pulledAt,
    through: today,
    error: failed.length ? `${failed.length} of ${feeds.length} news feeds did not answer.` : null,
    data: { feeds: feedRows, items, from, to: today, warnings },
  };
}
