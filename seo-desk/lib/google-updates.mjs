// Google's public Search Status feed (https://status.search.google.com/incidents.json), read for
// the ranking updates it announces, so the charts can mark them and a verdict can say that one
// fell inside its dates. Nothing here needs a sign-in.

import { longDate } from './text.mjs';

export const FEED_URL = 'https://status.search.google.com/incidents.json';
const FETCH_TIMEOUT_MS = 10000;
// The feed is a few hundred kilobytes; anything over this is not the feed we know.
export const MAX_FEED_BYTES = 1024 * 1024;
const MAX_TITLE = 200;
// The feed is asked at most once a day, and the Did it work page says so once the last good read
// is older than STALE_DAYS.
const REFRESH_MS = 24 * 3600 * 1000;
const STALE_DAYS = 3;

// "core update", "spam update", "helpful content update", "reviews update" and the like.
const RANKING_RE =
  /\b(core|spam|helpful content|reviews?|page experience|site reputation abuse|ranking)\s+(system\s+)?updates?\b/i;

const clean = (v) =>
  String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim();

// One incident to 'ranking' when its title names a ranking update. Only the title counts: a
// message can mention an update in passing. Discover is a separate surface from Search results,
// so it never counts.
export function classifyIncident(raw) {
  const title = clean(raw?.external_desc ?? raw?.title).slice(0, MAX_TITLE);
  if (/discover/i.test(title)) return 'other';
  return RANKING_RE.test(title) ? 'ranking' : 'other';
}

// '2026-05-21T15:40:00+00:00' to '2026-05-21'; anything that does not start with a date is null.
const dayOf = (v) => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v ?? ''));
  return m ? m[1] : null;
};

// The feed's JSON to [{id, title, start, end|null, kind: 'ranking'|'other'}], oldest first.
// An entry that cannot be read (no start date) is skipped. A feed that is not a list, or whose
// entries none can be read, has changed shape: that is an error, never a silently empty list.
export function parseIncidents(json) {
  const list = Array.isArray(json) ? json : Array.isArray(json?.incidents) ? json.incidents : null;
  if (!list) throw new Error('the feed has a different shape than expected (no list of incidents)');
  const out = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const start = dayOf(raw.begin);
    if (!start) continue;
    const title = clean(raw.external_desc ?? raw.title).slice(0, MAX_TITLE) || 'Google Search update';
    const end = dayOf(raw.end);
    out.push({
      id: clean(raw.id) || `${start}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title,
      start,
      end: end && end >= start ? end : end ? start : null,
      kind: classifyIncident(raw),
    });
  }
  if (list.length && !out.length)
    throw new Error('the feed has a different shape than expected (no incident could be read)');
  return out.sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
}

// Reads the feed with a 10 second limit. Returns {updates, warning}. On any failure (offline, not
// a 200, cut off, changed shape) the previous list comes back unchanged with one line saying why.
export async function fetchGoogleUpdates(fetchImpl = fetch, previous = []) {
  try {
    const res = await fetchImpl(FEED_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tooBig = new Error('the feed is larger than 1 MB');
    if (Number(res.headers?.get?.('content-length')) > MAX_FEED_BYTES) throw tooBig;
    const text = await res.text();
    if (Buffer.byteLength(text, 'utf8') > MAX_FEED_BYTES) throw tooBig;
    return { updates: parseIncidents(JSON.parse(text)), warning: null };
  } catch (e) {
    const why = String(e?.message ?? e)
      .replace(/\s+/g, ' ')
      .slice(0, 120);
    return {
      updates: Array.isArray(previous) ? previous : [],
      warning: `googleUpdates: kept the previous list (${why})`,
    };
  }
}

// The feed at most once a day. previous: {updates, fetchedAt, triedAt} from the last snapshot
// (fetchedAt: the last good read; triedAt: the last time it was asked, good or not). Returns the
// same shape plus warning. Inside a day of the last try nothing is asked and nothing changes.
export async function refreshGoogleUpdates({ fetchImpl = fetch, previous = {}, now = Date.now() } = {}) {
  const at = Number(now);
  const list = Array.isArray(previous?.updates) ? previous.updates : [];
  const fetchedAt = previous?.fetchedAt ?? null;
  const triedAt = previous?.triedAt ?? null;
  const last = Date.parse(triedAt ?? '');
  if (Number.isFinite(last) && at - last >= 0 && at - last < REFRESH_MS)
    return { updates: list, fetchedAt, triedAt, warning: null };
  const stamp = new Date(at).toISOString();
  const r = await fetchGoogleUpdates(fetchImpl, list);
  return { updates: r.updates, fetchedAt: r.warning ? fetchedAt : stamp, triedAt: stamp, warning: r.warning };
}

// The plain line for Did it work when the update list is old: null while the last good read is
// at most STALE_DAYS old, or when the feed was never asked. today is 'YYYY-MM-DD'.
export function staleUpdatesNote({ fetchedAt = null, triedAt = null } = {}, today) {
  if (!fetchedAt) return triedAt ? "Google's update list could not be read yet." : null;
  const day = String(fetchedAt).slice(0, 10);
  const age = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`)) / 86400000;
  return age > STALE_DAYS ? `Google's update list could not be refreshed since ${longDate(day)}.` : null;
}
