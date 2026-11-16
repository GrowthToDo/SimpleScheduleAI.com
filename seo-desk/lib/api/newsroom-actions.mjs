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
