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

// A page that gave an error code and used to answer is material. A failed request is a blip until
// two checks in a row record it. A page the desk has no earlier copy of, and a price or button that
// only shows up inside new text on a page with a changed list (soft), are never material.
export function isMaterial(event) {
  if (event.soft || event.noCopy) return false;
  if (event.kind === 'unreachable') return Number.isFinite(event.status) || Boolean(event.repeat);
  return MATERIAL_KINDS.has(event.kind);
}

const NO_COPY_TEXT = 'The page did not answer and the desk has no earlier copy of it';
const PRODUCT_PAGE_RE = /pricing|plans|product/i;
const isProductPage = (url) => {
  try {
    return PRODUCT_PAGE_RE.test(new URL(String(url)).pathname);
  } catch {
    return PRODUCT_PAGE_RE.test(String(url));
  }
};

// A price or button seen on a page whose same check also recorded a list change, away from a pricing
// or product page, is most likely just text inside the new item. Said so, and kept off the worries.
function soften(c) {
  const what = c.kind === 'price' ? 'A price figure' : 'A button label';
  return {
    ...c,
    soft: true,
    plain:
      c.direction === 'removed'
        ? `${what} went with text removed from this page`
        : `${what} appears in new text on this page`,
  };
}

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
// rows parseWatchLog returns: {url, key?, fetchedAt, changes, hasSnapshot?, previouslyUnreachable?,
// answeredBefore?, unreachableLastCheck?}. A row whose url is not a web address (or hasSnapshot
// false) has no saved snapshot. A sentinel is a pricing address with no snapshot that no earlier
// check shows answering; any other page that is unreachable with no copy is an ordinary event.
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

    const addEvent = (c, extra = {}) => {
      const base = { kind: c.kind, plain: c.plain, ...extra };
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
      if (noSnapshot && !row.answeredBefore) {
        if (pricing) addSentinel('still-missing');
        else addEvent({ ...first, plain: NO_COPY_TEXT }, { noCopy: true });
        continue;
      }
      const repeat = first.status === null && Boolean(row.unreachableLastCheck);
      addEvent(repeat ? { ...first, plain: `${first.plain} on two checks in a row` } : first, repeat ? { repeat } : {});
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

    const listChanged = changes.some((t) => classifyChange(t).kind === 'headings');
    const soft = listChanged && !isProductPage(row.url);
    for (const text of changes) {
      const c = classifyChange(text);
      if (c.kind === 'baseline') continue;
      for (const part of c.parts ?? [c]) {
        const priceOrButton = part.kind === 'price' || part.kind === 'cta';
        addEvent(soft && priceOrButton ? soften(part) : part, soft && priceOrButton ? { soft: true } : {});
      }
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
// A page that stops answering also carries its pages, so a second page going away is a new event.
const eventKey = (e) =>
  `${e.kind}|${e.direction ?? ''}|${e.plain}${e.kind === 'unreachable' ? `|${[...e.pages].sort().join(',')}` : ''}`;

export function eventSignature(events) {
  const keys = (events ?? [])
    .filter((e) => e.material)
    .map(eventKey)
    .sort();
  return crypto.createHash('sha1').update(keys.join('\n')).digest('hex').slice(0, 10);
}

export const competitorItemId = (host, events) => `competitor-change:${host}:${eventSignature(events)}`;

const MORE_EVENTS = 3;

// The pages to open for a set of events: https addresses from the watch data only, each once.
export function pageLinks(events) {
  const out = [];
  for (const e of events ?? [])
    for (const p of e.pages) {
      const url = safeHttps(p);
      if (url && !out.some((x) => x.url === url)) out.push({ url, label: pageNameOf(url) });
    }
  return out;
}

// What the events add up to when none is worth reading, built from their kinds.
const QUIET_PHRASE = {
  headings: 'heading changes',
  body: 'small text changes',
  unreachable: 'a page that did not answer',
  'reachable-again': 'a page that answers again',
  other: 'changes the desk does not recognise',
  price: 'a price figure in new text',
  cta: 'a button label in new text',
};
const joinWords = (list) => (list.length < 2 ? (list[0] ?? '') : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);

export function summaryLine(events) {
  const all = events ?? [];
  if (!all.length) return 'Nothing changed on the pages we watch.';
  const material = all.filter((e) => e.material).length;
  if (material) return material === 1 ? 'One change worth reading.' : `${material} changes worth reading.`;
  const kinds = [...new Set(all.map((e) => e.kind))];
  const phrases = kinds.map((k) => QUIET_PHRASE[k] ?? 'other changes');
  const priceish = kinds.includes('price') || kinds.includes('cta');
  const tail = priceish
    ? 'Nothing on the title, description or headline.'
    : 'Nothing on price, title, description, headline or buttons.';
  const lead = joinWords(phrases);
  return `Only ${lead}. ${tail}`;
}

// Worries from grouped events: one per host with at least one material event that the founder has not
// marked Seen and the dossier does not already note for that host (see raisesWorry for the one
// exception, a pricing page that has appeared). items is the saved item state by
// id (a Seen is status "done" on the card's id, and the id carries the signature of the events, so a
// new material event is a new id and the card returns). dossierLog is parseDossierLog's rows.
export function competitorWorries(hosts, { items = {}, today, dossierLog = [] } = {}) {
  const out = [];
  for (const g of hosts ?? []) {
    const material = g.events.filter((e) => e.material);
    if (!raisesWorry(material, dossierNoteFor(g.host, dossierLog, g.checkedOn))) continue;
    const id = competitorItemId(g.host, g.events);
    if (items?.[id]?.status === 'done') continue;
    const lines = material.map((e) => eventLine(g.host, e));
    const pages = pageLinks(material);
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

// The rows of the maintenance log at the end of docs/seo/competitor-dossier.md, newest first, as
// [{date, text}]. Rows are table lines that start with a date, after the "Maintenance Log" heading.
export function parseDossierLog(md) {
  const text = String(md ?? '');
  const at = text.search(/^#{1,6}\s+Maintenance Log\b/im);
  const rows = [];
  for (const line of (at >= 0 ? text.slice(at) : '').split(/\r?\n/)) {
    const m = /^\|\s*(\d{4}-\d{2}-\d{2})\s*\|(.*)$/.exec(line);
    if (m) rows.push({ date: m[1], text: m[2] });
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

const squash = (v) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// Endings that are only an ending. On any other ending the name is spelled across the dot
// (inhouse.health is "In-House Health"), and the first part alone can be an everyday word.
// "example" is the ending reserved for made-up addresses.
const PLAIN_ENDINGS = new Set(['com', 'net', 'org', 'io', 'co', 'ai', 'app', 'us', 'example']);

// What a log row can call a competitor, found inside the row with punctuation and spaces ignored:
// the whole address ("inhousehealth" from inhouse.health, so "In-House Health" matches and
// "in-house staff" in a row about someone else does not), and, when the ending is only an ending,
// the main label ("smartlinx" from smartlinx.com). A name under four letters is too loose to match on.
export function hostLabels(host) {
  const h = String(host ?? '')
    .toLowerCase()
    .replace(/^www\./, '');
  const parts = h.split('.');
  const names = [squash(h)];
  if (PLAIN_ENDINGS.has(parts[parts.length - 1])) names.push(squash(parts[0]));
  return names.filter((x, i, a) => x.length >= 4 && a.indexOf(x) === i);
}

// Whether a host's material events raise a worry given the dossier note for it (a date or null).
// A noted change raises none, with one exception: a pricing page that has appeared is the event the
// watch exists to catch, so only the founder pressing Seen hides it.
export function raisesWorry(material, noted) {
  if (!material?.length) return false;
  return !noted || material.some((e) => e.kind === 'pricing-page-appeared');
}

// The earliest log row dated on or after the check that names this host, or null: a note about
// this competitor written once that check had run. A row about someone else does not count.
export function dossierNoteFor(host, log, checkedOn) {
  if (!checkedOn) return null;
  const labels = hostLabels(host);
  if (!labels.length) return null;
  return (
    (log ?? [])
      .filter((r) => r.date >= checkedOn && labels.some((l) => squash(r.text).includes(l)))
      .map((r) => r.date)
      .sort()[0] ?? null
  );
}
