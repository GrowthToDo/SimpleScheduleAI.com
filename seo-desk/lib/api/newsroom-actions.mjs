// What the Newsroom page's buttons change: Pick for this week and Unpick (stored as the item's pin, with
// the story kept in its meta), and Paste a link (state/news-pasted.json). Hold, Drop, Reopen and Done go
// through the ordinary item actions (snooze, ignore with a reason, reopen, done). Nothing here writes a
// tracked file.

import crypto from 'node:crypto';
import { readJson, writeJson } from '../store.mjs';
import { transition, loadItems, saveItems } from '../lifecycle.mjs';
import { getWeek, setTop5, planSizeOf } from '../week.mjs';
import { plain } from '../text.mjs';
import { readPage } from '../sources/page-fetch.mjs';
import { buildModel, invalidate, itemOf, itemState } from './model.mjs';
import { weekModel, currentTop5 } from './work.mjs';
import {
  newsroomCards,
  storyOf,
  loadPasted,
  PASTED_FILE,
  PASTED_MAX,
  MAX_PICKS,
  PICK_LIMIT,
  loadChecks,
  saveChecks,
} from './newsroom-model.mjs';

const fail = (status, message) => Object.assign(new Error(message), { status });
const WEEKS_FILE = 'state/weeks.json';

// The item as it is saved for a story: the item's own state plus the story, so the card outlives the feed.
export const newsMeta = (card) => ({ kind: 'news', title: plain(card.title), isPageEdit: false, story: storyOf(card) });

// Where a picked story goes in a chosen list: after the cards that come before it in the proposal
// (broken things, the new post, other Newsroom pieces).
const BEFORE_NEWS = new Set(['broken', 'new-post', 'newsroom']);

export function pickNews(id) {
  const model = buildModel();
  const nr = newsroomCards(model);
  const card = nr.byId.get(id);
  if (!card) throw fail(404, 'The desk does not know that story. Refresh the page.');
  const weekOf = nr.weekOf;
  const cur = itemOf(model, id);
  if (cur?.status === 'ignored') throw fail(409, 'You dropped this story. Press Reopen first.');
  if (cur?.pinnedWeek === weekOf && card.picked)
    return { id, item: itemState(model, id), picked: true, message: 'It is already picked for this week.' };
  if (card.tier === 3)
    throw fail(400, 'This story fits none of the Newsroom topics (Tier 3), and the method says to skip those.');
  const others = nr.cards.filter((c) => c.id !== id && c.picked).length;
  if (others >= MAX_PICKS) throw fail(409, PICK_LIMIT);
  const stored = getWeek(weekOf);
  if (stored?.locked) throw fail(409, "This week's plan is locked. Unlock it on This week before you pick a story.");

  const itemsBefore = loadItems();
  const weeksBefore = readJson(WEEKS_FILE, {});
  let next = cur?.status === 'snoozed' ? transition(cur, 'reopen', { today: model.today }) : cur;
  next = { ...transition(next, 'pin', { today: model.today }), meta: newsMeta(card) };
  saveItems({ ...itemsBefore, [id]: next });

  const undo = () => {
    saveItems(itemsBefore);
    writeJson(WEEKS_FILE, weeksBefore);
    invalidate();
  };
  if (stored?.top5?.length) {
    const ids = stored.top5.filter((x) => x !== id);
    if (ids.length >= 5) {
      undo();
      throw fail(
        409,
        "This week's list already holds five cards. Remove one on This week first, then pick this story."
      );
    }
    const { pool } = weekModel(model);
    let at = 0;
    while (at < ids.length && BEFORE_NEWS.has(pool.get(ids[at])?.slot)) at++;
    setTop5(weekOf, [...ids.slice(0, at), id, ...ids.slice(at)]);
  }
  invalidate();
  const after = buildModel();
  if (!currentTop5(after).cards.some((c) => c.id === id)) {
    undo();
    throw fail(
      409,
      `This week's list holds ${planSizeOf()} cards, and the things that come before a Newsroom piece already fill it. Set the plan size to 5 in Settings, or pick it next week.`
    );
  }
  return {
    id,
    item: itemState(after, id),
    picked: true,
    message: "Picked for this week. It is in This week's priorities as a Newsroom piece.",
  };
}

export function unpickNews(id) {
  const model = buildModel();
  const nr = newsroomCards(model);
  const cur = itemOf(model, id);
  if (!nr.byId.has(id) && !cur) throw fail(404, 'The desk does not know that story. Refresh the page.');
  const stored = getWeek(nr.weekOf);
  if (stored?.locked && stored.top5?.includes(id))
    throw fail(409, "This week's plan is locked. Unlock it on This week before you unpick a story.");
  const card = nr.byId.get(id);
  const next = { ...transition(cur, 'unpin', { today: model.today }), meta: card ? newsMeta(card) : cur?.meta };
  saveItems({ ...loadItems(), [id]: next });
  if (stored?.top5?.includes(id) && !stored.locked)
    setTop5(
      nr.weekOf,
      stored.top5.filter((x) => x !== id)
    );
  invalidate();
  return {
    id,
    item: itemState(buildModel(), id),
    picked: false,
    message: "Unpicked. It is off This week's priorities.",
  };
}

// ---------------------------------------------------------------- paste a link

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);

// Reads the page (fetchPage: the guarded fetch) and keeps it as a pasted card, newest first, at most 50.
// A pasted entry the founder already held, dropped or picked lives on in its item, so it is the first to go.
export async function pasteLink(body, { fetchPage }) {
  const raw = String(body?.url ?? '').trim();
  if (!raw) throw fail(400, 'Paste one https address.');
  if (raw.length > 2000) throw fail(400, 'That address is too long to be a news page.');
  const page = await fetchPage(raw);
  const info = readPage(page.html, page.url);
  if (!info.title) throw fail(400, 'The page has no title the desk can read, so no card was made.');
  const model = buildModel();
  const entry = {
    id: `news:${hash(page.url)}`,
    url: page.url,
    title: info.title,
    publisher: info.publisher,
    date: info.date,
    description: info.description,
    pastedAt: new Date().toISOString(),
  };
  const open = (p) => {
    const it = itemOf(model, p.id);
    return !it || ((it.status === 'new' || it.status === 'in-progress') && !it.pinnedWeek);
  };
  const rest = loadPasted().filter((p) => p.url !== entry.url && p.id !== entry.id);
  const list = [entry, ...rest.filter(open), ...rest.filter((p) => !open(p))].slice(0, PASTED_MAX);
  writeJson(PASTED_FILE, list);
  invalidate();
  const card = newsroomCards(buildModel()).byId.get(entry.id) ?? null;
  return {
    card,
    message: card
      ? card.tier === 3
        ? 'Read. It fits none of the Newsroom topics, so it is shown apart, under Paste a link.'
        : `Read. The card is on the ${card.tab === 'fresh' ? 'Fresh' : 'Already covered or decided'} tab.`
      : 'Read, but no card could be made from it.',
  };
}

// ---------------------------------------------------------------- the person's checks (package 8c)

// "Check the results page": one live Google results page from DataForSEO, for the reader's question
// (prefilled from the card's subject key, editable). It costs money, so it never runs on its own: the
// first POST without {confirm: true} is refused with what it does and what it costs, the same confirm
// step the AI citation check uses. The client is lib/mcp-client.mjs openServer('dataforseo'); tests
// inject their own. The desk does not judge the list: it keeps it with the card, and Can we be first
// stays the founder's check.
export const SERP_COST = 'about $0.002';
export const SERP_TOOL = 'api_request';
export const SERP_PATH = '/v3/serp/google/organic/live/regular';
export const SERP_WHAT = `Asks DataForSEO for the top ten Google results in the United States for the question in the box, once. It costs ${SERP_COST} and writes only the desk's own state. The desk shows the list and does not judge it: Can we be first stays your check.`;
export const serpConfirmText = (query) =>
  `Confirm first: Check the results page asks DataForSEO for the top ten Google results for "${query}". It costs ${SERP_COST} and writes only the desk's own state. Send {"confirm": true} to run it.`;
export const SERP_BUSY = 'A results page check is already running. Wait for it, then press again.';

const newsId = (body) => {
  const id = String(body?.id ?? '');
  if (!/^news:[0-9a-f]{12}$/.test(id)) throw fail(400, 'id must be a Newsroom card id, such as news:0123456789ab.');
  return id;
};

const domainOf = (u, given) => {
  if (given) return String(given).replace(/^www\./, '');
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// The top ten organic results anywhere in a DataForSEO reply: [{rank, title, domain, url}].
export function topTen(data) {
  const found = [];
  const walk = (v, depth) => {
    if (!v || depth > 8 || found.length >= 50) return;
    if (Array.isArray(v)) {
      for (const x of v) walk(x, depth + 1);
      return;
    }
    if (typeof v !== 'object') return;
    if ((v.type === 'organic' || (!v.type && v.title && v.url)) && v.url) {
      found.push({
        rank: Number(v.rank_group ?? v.rank_absolute ?? found.length + 1),
        title: plain(String(v.title ?? '')),
        domain: domainOf(v.url, v.domain),
        url: /^https?:\/\//.test(String(v.url)) ? String(v.url) : null,
      });
      return;
    }
    for (const x of Object.values(v)) walk(x, depth + 1);
  };
  walk(data, 0);
  return found
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

let serpRunning = false;

export async function checkSerp(body, { openClient }) {
  const id = newsId(body);
  const query = plain(String(body?.query ?? ''))
    .replace(/\s+/g, ' ')
    .trim();
  if (query.length < 2 || query.length > 120) throw fail(400, 'Type the question to search, 2 to 120 characters.');
  if (body?.confirm !== true) throw fail(400, serpConfirmText(query));
  const model = buildModel();
  const card = newsroomCards(model).byId.get(id);
  if (!card) throw fail(404, 'The desk does not know that story. Refresh the page.');
  if (serpRunning) throw fail(429, SERP_BUSY);
  serpRunning = true;
  let data;
  try {
    const client = await openClient();
    try {
      data = await client.call(SERP_TOOL, {
        method: 'POST',
        path: SERP_PATH,
        data: [{ keyword: query, location_code: 2840, language_code: 'en', depth: 10 }],
      });
    } finally {
      client.close?.();
    }
  } catch (e) {
    if (e?.status) throw e;
    const signIn = e?.kind === 'needs-sign-in';
    throw fail(
      502,
      signIn
        ? 'DataForSEO needs sign in on this Mac, so the results page was not checked. Nothing was charged by the desk.'
        : 'DataForSEO did not answer, so the results page was not checked. Try again later.'
    );
  } finally {
    serpRunning = false;
  }
  const items = topTen(data);
  if (!items.length) throw fail(502, 'DataForSEO sent back no results for that search, so nothing was kept.');
  const serp = { query, checkedAt: new Date().toISOString(), date: model.today, items, cost: SERP_COST };
  const all = loadChecks();
  saveChecks({ ...all, [id]: { ...(all[id] ?? {}), serp } });
  invalidate();
  return {
    id,
    serp,
    message: 'The top ten results are kept with the card. Read them and set Can we be first yourself.',
  };
}

// The founder's two checks on a card: Can we be first (1 to 5) and Citable hook (0 or 1). null clears one.
export function setNewsScore(body) {
  const id = newsId(body);
  const model = buildModel();
  if (!newsroomCards(model).byId.get(id)) throw fail(404, 'The desk does not know that story. Refresh the page.');
  const all = loadChecks();
  const next = { ...(all[id] ?? {}) };
  if ('first' in (body ?? {})) {
    const v = body.first;
    if (v !== null && !(Number.isInteger(v) && v >= 1 && v <= 5))
      throw fail(400, 'Can we be first is a whole number from 1 to 5, or empty.');
    next.first = v;
  }
  if ('hook' in (body ?? {})) {
    const v = body.hook;
    if (v !== null && v !== 0 && v !== 1) throw fail(400, 'Citable hook is 0 or 1, or empty.');
    next.hook = v;
  }
  next.setAt = new Date().toISOString();
  saveChecks({ ...all, [id]: next });
  invalidate();
  const card = newsroomCards(buildModel()).byId.get(id);
  return {
    id,
    score: card?.score ?? null,
    message: card?.score?.complete
      ? 'Both checks are set. The card shows its full score.'
      : 'Saved. The card shows its draft score until both checks are set.',
  };
}
