// What really happened on a competitor's watched pages, in plain words. Pure functions: no files,
// no clock (the caller passes `today`), no network.
//
// The watch log (docs/seo/competitor-snapshots/WATCHLOG.md) records one line per changed page, so
// a heading list that repeats on five pages shows up as five changes, and a pricing address that
// has never existed shows up as "unreachable" every month. This module turns those rows into
// distinct events per competitor, sets the pricing sentinels apart (a sentinel answering 404 is
// its normal state, not a change), and says which events are worth a founder's attention.

import crypto from 'node:crypto';
import { daysBetween } from './dates.mjs';
import { longDate, plain } from './text.mjs';

// Kinds of event. `baseline` (the first look at a page) is not a change and never becomes an event.
export const KINDS = [
  'price',
  'cta',
  'title',
  'description',
  'h1',
  'headings',
  'body',
  'unreachable',
  'reachable-again',
  'other',
];

// Events worth a worry. `unreachable` counts only on a page that used to answer and now gives an
// error code (see isMaterial); `pricing-page-appeared` is the one the sentinels exist to catch.
const MATERIAL_KINDS = new Set(['price', 'cta', 'title', 'description', 'h1', 'pricing-page-appeared']);

export const STALE_CHECK_DAYS = 14;

// ---------------------------------------------------------------- reading one change string

// '"a", "b"' to ['a', 'b']. The log joins values with `", "`, so a value holding that is split in two.
function quotedList(s) {
  const t = String(s ?? '').trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1).split('", "');
  return t ? [t] : [];
}

const q = (s) => `"${plain(s)}"`;
const sayValue = (s) => (s === '(none)' || s === '' ? 'empty' : q(s));
const words = (n) => `${n} ${n === 1 ? 'word' : 'words'}`;

// The address as the log keeps it, to the page it is: '/', '/product', or 'a watched page'.
function pageNameOf(url) {
  try {
    const u = new URL(String(url));
    const path = u.pathname.replace(/\/+$/, '');
    return path === '' ? 'home page' : path;
  } catch {
    return 'watched page';
  }
}

// One raw change string to {kind, plain, ...}. Headings and buttons that were added or removed
// come back as one object listing every value in `items`, and `parts` has one object per value
// (groupChanges counts each value on its own). Unknown wording becomes kind 'other', shown as it is.
export function classifyChange(text) {
  const raw = String(text ?? '').trim();

  let m = /^(title|description|h1): "([\s\S]*?)" -> "([\s\S]*)"$/.exec(raw);
  if (m) {
    const [, kind, was, now] = m;
    const what = {
      title: 'The page title',
      description: 'The description shown in search results',
      h1: 'The headline at the top of the page',
    }[kind];
    return {
      kind,
      was,
      now,
      plain: `${what} changed: was ${sayValue(was)}, now ${sayValue(now)}`,
    };
  }

  m = /^(h2s|ctas|prices) (added|removed): ([\s\S]*)$/.exec(raw);
  if (m) {
    const kind = { h2s: 'headings', ctas: 'cta', prices: 'price' }[m[1]];
    const direction = m[2];
    const items = quotedList(m[3]);
    const one = (value) => {
      const added = direction === 'added';
      const sentence = {
        headings: added ? `New heading: ${q(value)}` : `Heading removed: ${q(value)}`,
        cta: added ? `New button: ${q(value)}` : `Button removed: ${q(value)}`,
        price: added ? `A price appeared: ${q(value)}` : `A price went away: ${q(value)}`,
      }[kind];
      return { kind, direction, items: [value], plain: sentence };
    };
    const parts = items.map(one);
    if (items.length <= 1) return { ...(parts[0] ?? { kind, direction, items: [], plain: plain(raw) }), parts };
    const added = direction === 'added';
    const lead = {
      headings: added ? 'New headings' : 'Headings removed',
      cta: added ? 'New buttons' : 'Buttons removed',
      price: added ? 'Prices appeared' : 'Prices went away',
    }[kind];
    return { kind, direction, items, plain: `${lead}: ${items.map(q).join(', ')}`, parts };
  }

  m = /^body text changed with no heading\/CTA\/price move \(([+-]?\d+) words?\)$/.exec(raw);
  if (m) {
    const delta = Number(m[1]);
    const size = Math.abs(delta);
    const how = delta === 0 ? 'same length' : `${words(size)} ${delta > 0 ? 'more' : 'fewer'}`;
    return { kind: 'body', delta, plain: `The page text changed${size <= 20 ? ' slightly' : ''} (${how})` };
  }

  m = /^unreachable \((?:HTTP (\d{3})|([^)]*))\)$/.exec(raw);
  if (m) {
    const status = m[1] ? Number(m[1]) : null;
    const why = status
      ? String(status)
      : /fetch failed|timeout|abort/i.test(m[2] ?? '')
        ? 'the request failed'
        : plain(m[2]);
    return { kind: 'unreachable', status, plain: `The page did not answer (${why})` };
  }

  if (/^baseline stored/i.test(raw)) {
    return { kind: 'baseline', plain: 'The desk looked at this page for the first time' };
  }

  return { kind: 'other', plain: plain(raw) };
}

// ---------------------------------------------------------------- sentinels

// A pricing address the watch checks only to catch the day it starts answering. Pass the address of
// a row whose page is unreachable and the desk's saved snapshots (a Set, Map, array or plain object
// keyed by address). With no saved snapshot the page has never answered, so it is a sentinel, and
// answering 404 is its normal state. Without a snapshot list, an address that is not a web address
// (the log's own "host__pricing" label) has no snapshot.
export function isSentinel(url, snapshotsByUrl = null) {
  const u = String(url ?? '');
  if (snapshotsByUrl) {
    if (snapshotsByUrl instanceof Set || snapshotsByUrl instanceof Map) return !snapshotsByUrl.has(u);
    if (Array.isArray(snapshotsByUrl)) return !snapshotsByUrl.includes(u);
    return !Object.hasOwn(snapshotsByUrl, u);
  }
  return !/^https?:\/\//i.test(u);
}

const isPricingAddress = (url, key) => {
  if (/__pricing$/i.test(String(key ?? ''))) return true;
  if (/__pricing$/i.test(String(url ?? ''))) return true;
  try {
    return /^\/pricing\/?$/i.test(new URL(String(url)).pathname);
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------- grouping

export function hostOf(url) {
  const raw = String(url ?? '');
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return raw.split('__')[0];
  }
}

// A safe link target: an https address from the watch data, or null. Never built from free text.
export function safeHttps(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

export const isMaterial = (event) =>
  MATERIAL_KINDS.has(event.kind) || (event.kind === 'unreachable' && Number.isFinite(event.status));

const onText = (pages) => {
  if (pages.length !== 1) return `on ${pages.length} pages`;
  const name = pageNameOf(pages[0]);
  return name === 'home page'
    ? 'on its home page'
    : name === 'watched page'
      ? 'on a watched page'
      : `on its ${name} page`;
};

// groupChanges(watchRows, snapshotsByUrl?) to
//   [{host, events: [{kind, plain, pages, pageNames, onText, material, ...}],
//     sentinels: [{url, state: 'still-missing' | 'appeared', plain}], checkedOn}]
// one event per distinct change per host, listing every page it showed on. watchRows are the
// rows parseWatchLog returns: {url, key?, fetchedAt, changes, hasSnapshot?, previouslyUnreachable?}.
// A row whose url is not a web address (or hasSnapshot false) has never been saved as a snapshot.
export function groupChanges(watchRows, snapshotsByUrl = null) {
  const hosts = new Map();
  const hostEntry = (host) => {
    if (!hosts.has(host)) hosts.set(host, { host, events: new Map(), sentinels: new Map(), checkedOn: null });
    return hosts.get(host);
  };

  for (const row of watchRows ?? []) {
    const changes = (row.changes ?? []).map((c) => String(c));
    if (!changes.length) continue;
    const host = hostOf(row.url);
    const h = hostEntry(host);
    if (!h.checkedOn || row.fetchedAt > h.checkedOn) h.checkedOn = row.fetchedAt;
    const pricing = isPricingAddress(row.url, row.key);
    const first = classifyChange(changes[0]);

    const addEvent = (c) => {
      const base = { kind: c.kind, plain: c.plain };
      const key = `${c.kind}|${c.direction ?? ''}|${c.plain}`;
      const cur = h.events.get(key) ?? {
        ...base,
        ...(c.was !== undefined ? { was: c.was, now: c.now } : {}),
        ...(c.direction ? { direction: c.direction, items: c.items } : {}),
        ...(c.status !== undefined ? { status: c.status } : {}),
        ...(c.delta !== undefined ? { delta: c.delta } : {}),
        pages: [],
      };
      if (!cur.pages.includes(row.url)) cur.pages.push(row.url);
      h.events.set(key, cur);
    };
    const addSentinel = (state) => {
      const url = /^https?:\/\//i.test(String(row.url)) ? row.url : null;
      h.sentinels.set(String(row.url), {
        url,
        state,
        plain: state === 'appeared' ? 'A pricing page has appeared' : 'Still no pricing page',
      });
    };

    // A page the watch could not load.
    if (changes.length === 1 && first.kind === 'unreachable') {
      const noSnapshot = row.hasSnapshot === false ? true : isSentinel(row.url, snapshotsByUrl);
      if (noSnapshot) addSentinel('still-missing');
      else addEvent(first);
      continue;
    }

    // The first look at a page. Only one that was a sentinel until now means anything.
    if (changes.length === 1 && first.kind === 'baseline') {
      if (!row.previouslyUnreachable) continue;
      if (pricing) {
        addSentinel('appeared');
        addEvent({ kind: 'pricing-page-appeared', plain: 'A pricing page has appeared' });
      } else {
        addEvent({ kind: 'reachable-again', plain: 'A page that did not answer before is answering now' });
      }
      continue;
    }

    for (const text of changes) {
      const c = classifyChange(text);
      if (c.kind === 'baseline') continue;
      for (const part of c.parts ?? [c]) addEvent(part);
    }
  }

  return [...hosts.values()]
    .map((h) => ({
      host: h.host,
      events: [...h.events.values()].map((e) => {
        const pageNames = e.pages.map(pageNameOf);
        return { ...e, pageNames, onText: onText(e.pages), material: isMaterial(e) };
      }),
      sentinels: [...h.sentinels.values()],
      checkedOn: h.checkedOn,
    }))
    .sort((a, b) => a.host.localeCompare(b.host));
}

// How many distinct events and how many pages really changed. Sentinels never count, and neither
// does an event that only says a sentinel answered 404.
export function countChanges(hostGroup) {
  const pages = new Set();
  let events = 0;
  let material = 0;
  for (const e of hostGroup?.events ?? []) {
    events += 1;
    if (e.material) material += 1;
    for (const p of e.pages) pages.add(p);
  }
  return { events, pages: pages.size, material };
}

export const countText = (counts) =>
  counts.events === 0
    ? 'No changes'
    : `${counts.events} ${counts.events === 1 ? 'change' : 'changes'} on ${counts.pages} ${counts.pages === 1 ? 'page' : 'pages'}`;

// ---------------------------------------------------------------- the worry

// One plain sentence about one event, with the competitor named.
export function eventLine(host, e) {
  const on = e.onText;
  let headline;
  let detail = '';
  switch (e.kind) {
    case 'h1':
      headline = `${host} changed the headline ${on}`;
      detail = `was ${sayValue(e.was)}, now ${sayValue(e.now)}`;
      break;
    case 'title':
      headline = `${host} changed the page title ${on}`;
      detail = `was ${sayValue(e.was)}, now ${sayValue(e.now)}`;
      break;
    case 'description':
      headline = `${host} changed the description shown in search results ${on}`;
      detail = `was ${sayValue(e.was)}, now ${sayValue(e.now)}`;
      break;
    case 'price':
      headline =
        e.direction === 'removed' ? `${host} no longer shows a price ${on}` : `${host} now shows a price ${on}`;
      detail = (e.items ?? []).map(q).join(', ');
      break;
    case 'cta':
      headline = e.direction === 'removed' ? `${host} removed a button ${on}` : `${host} added a button ${on}`;
      detail = (e.items ?? []).map(q).join(', ');
      break;
    case 'pricing-page-appeared':
      headline = `${host} has published a pricing page`;
      break;
    case 'unreachable':
      headline = `${host} stopped answering ${on}`;
      detail = e.plain.replace(/^The page did not answer \(|\)$/g, '');
      break;
    default:
      headline = `${host}: ${e.plain}`;
  }
  return { headline, detail, sentence: `${headline}${detail ? `: ${detail}` : ''}.` };
}

// The signature of the events a Seen covers: material events only, so a new blog post in a list
// never brings a seen card back, and a new price or headline always does.
export function eventSignature(events) {
  const keys = (events ?? [])
    .filter((e) => e.material)
    .map((e) => `${e.kind}|${e.direction ?? ''}|${e.plain}`)
    .sort();
  return crypto.createHash('sha1').update(keys.join('\n')).digest('hex').slice(0, 10);
}

export const competitorItemId = (host, events) => `competitor-change:${host}:${eventSignature(events)}`;

const MORE_EVENTS = 3;

// Worries from grouped events: one per host with at least one material event the founder has not
// marked Seen. items is the saved item state by id (a Seen is status "done" on the card's id, and the
// id carries the signature of the events, so a new material event is a new id and the card returns).
export function competitorWorries(hosts, { items = {}, today } = {}) {
  const out = [];
  for (const g of hosts ?? []) {
    const material = g.events.filter((e) => e.material);
    if (!material.length) continue;
    const id = competitorItemId(g.host, g.events);
    if (items?.[id]?.status === 'done') continue;
    const lines = material.map((e) => eventLine(g.host, e));
    const pages = [];
    for (const e of material)
      for (const p of e.pages) {
        const url = safeHttps(p);
        if (url && !pages.some((x) => x.url === url)) pages.push({ url, label: pageNameOf(url) });
      }
    const age = g.checkedOn && today ? daysBetween(g.checkedOn, today) : 0;
    const shown = lines.slice(0, MORE_EVENTS).map((l) => l.sentence);
    const extra = lines.length - shown.length;
    const stale =
      age > STALE_CHECK_DAYS
        ? ` This check is ${age} days old. Press Check competitors now for the current state.`
        : '';
    out.push({
      id,
      kind: 'competitor-change',
      page: null,
      isPageEdit: false,
      title: lines.length === 1 ? lines[0].headline : `${g.host} made ${lines.length} changes worth reading`,
      measured: `The competitor check on ${longDate(g.checkedOn)} found this. ${shown.join(' ')}${
        extra > 0 ? ` And ${extra} more.` : ''
      }${stale}`,
      fix:
        'Read the changed ' +
        (new Set(material.flatMap((e) => e.pages)).size === 1 ? 'page' : 'pages') +
        '. If it changes a claim on one of our comparison pages, note it in the competitor dossier.',
      competitor: {
        host: g.host,
        signature: eventSignature(g.events),
        checkedOn: g.checkedOn,
        pages,
        events: material.map((e) => ({ kind: e.kind, plain: eventLine(g.host, e).sentence, pages: e.pages.length })),
      },
    });
  }
  return out;
}

// The text "Copy brief for Claude" gives for a competitor card: read the dossier first, read the
// page itself, log a real move there. Takes the card (title, measured, competitor.pages).
export function competitorBrief(card) {
  const lines = [];
  lines.push(`Task for the SimpleScheduleAI website: ${plain(card.title)}`);
  lines.push('');
  lines.push(`What we measured: ${plain(card.measured)}`);
  lines.push(`Recommendation: ${plain(card.action)}`);
  const pages = card.competitor?.pages ?? [];
  if (pages.length) {
    lines.push('');
    lines.push('Pages to read:');
    for (const p of pages) lines.push(`- ${p.url}`);
  }
  lines.push('');
  lines.push('Rules for this repo:');
  lines.push(
    '1. Read docs/seo/competitor-dossier.md first. Its maintenance log is the authority on what has already been checked.'
  );
  lines.push('2. Open the changed page and read what it says now. Do not rely on this summary alone.');
  lines.push(
    '3. If it is a real move (a price, a new headline, a new button, a new pricing page), log it in the maintenance log of docs/seo/competitor-dossier.md with the date and the exact words.'
  );
  lines.push(
    '4. If it changes a claim on one of our comparison pages, tell the founder which page, and edit it only through the blog pipeline.'
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------- the dossier's maintenance log

// The dates of the maintenance log rows at the end of docs/seo/competitor-dossier.md, newest first.
// Rows are table lines that start with a date, after the "Maintenance Log" heading.
export function parseDossierLogDates(md) {
  const text = String(md ?? '');
  const at = text.search(/^#{1,6}\s+Maintenance Log\b/im);
  const dates = new Set();
  for (const line of (at >= 0 ? text.slice(at) : '').split(/\r?\n/)) {
    const m = /^\|\s*(\d{4}-\d{2}-\d{2})\s*\|/.exec(line);
    if (m) dates.add(m[1]);
  }
  return [...dates].sort().reverse();
}

// The earliest log entry dated on or after the check, or null: the dossier already holds a note
// written once that check had run.
export function dossierEntryAfter(dates, checkedOn) {
  if (!checkedOn) return null;
  return [...(dates ?? [])].filter((d) => d >= checkedOn).sort()[0] ?? null;
}
