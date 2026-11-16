// The Newsroom page (GET /api/newsroom) and its buttons: Paste a link (POST /api/newsroom/paste), Pick
// for this week and Unpick (POST /api/newsroom/pick, /api/newsroom/unpick). Hold, Drop, Reopen and Done
// are the ordinary item actions (POST /api/item/:id), and Refresh now is POST /api/refresh with
// {only: ['news']}. The cards come from api/newsroom-model.mjs; nothing here writes a tracked file.

import { get, post, bodyOf, bad } from '../kit.mjs';
import { buildModel, envelope } from '../model.mjs';
import { newsroomCards, NEWSROOM_LINE, TABS, MAX_PICKS, HOLD_DAYS } from '../newsroom-model.mjs';
import { pickNews, unpickNews, pasteLink } from '../newsroom-actions.mjs';
import { fetchPublicPage } from '../../sources/page-fetch.mjs';
import { TO_CHECK, PAID_LABEL, NEWS_DAYS } from '../../news.mjs';
import { longDate, longRange } from '../../text.mjs';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// How the feeds were read: when, how many outlets answered, and which did not.
function feedsOf(model) {
  const snap = model.snapObjs.news;
  const feeds = snap?.data?.feeds ?? [];
  const answered = feeds.filter((f) => f.ok).length;
  const failed = feeds.filter((f) => !f.ok).map((f) => ({ name: f.name, error: f.error ?? null }));
  const window =
    snap?.data?.from && snap?.data?.to
      ? { start: snap.data.from, end: snap.data.to, text: longRange(snap.data.from, snap.data.to) }
      : null;
  return {
    readAt: snap?.pulledAt ?? null,
    status: snap ? (snap.ok === false ? 'failed' : 'fresh') : 'never',
    answered,
    total: feeds.length,
    failed,
    items: (snap?.data?.items ?? []).length,
    window,
    text: !snap
      ? 'The news feeds have not been read yet. Press Refresh now.'
      : `${answered} of ${plural(feeds.length, 'feed', 'feeds')} answered, with ${plural((snap?.data?.items ?? []).length, 'item', 'items')} from ${window ? window.text : `the last ${NEWS_DAYS} days`}.`,
  };
}

export function newsroomView(model) {
  const nr = newsroomCards(model);
  const counts = Object.fromEntries(TABS.map((t) => [t.key, nr.cards.filter((c) => c.tab === t.key).length]));
  return {
    ...envelope(model, { need: ['news'] }),
    line: NEWSROOM_LINE,
    weekOf: nr.weekOf,
    weekLabel: `Week of ${longDate(nr.weekOf)}`,
    feeds: feedsOf(model),
    tabs: TABS.map((t) => ({ ...t, count: counts[t.key] })),
    cards: nr.cards,
    pastedOther: nr.pastedOther,
    picks: { count: counts.picked, max: MAX_PICKS },
    holdDays: HOLD_DAYS,
    toCheck: TO_CHECK,
    paidLabel: PAID_LABEL,
    scoreNote:
      'The draft score is the desk reading words and outlet counts. Relevance and Rising are drafts; Can we be first and Citable hook need a live search and a reading of the sources, which the brief asks Claude to do.',
  };
}

const idOf = (body) => {
  const id = String(body?.id ?? '');
  if (!/^news:[0-9a-f]{12}$/.test(id)) throw bad('id must be a Newsroom card id, such as news:0123456789ab.');
  return id;
};

// fetchPage is the guarded fetch of a pasted address; tests pass one with a fake network and DNS.
export function makeNewsroomRoutes({ fetchPage = (url) => fetchPublicPage(url) } = {}) {
  return [
    get('/api/newsroom', () => newsroomView(buildModel())),
    post('/api/newsroom/paste', async (ctx) => pasteLink(await bodyOf(ctx), { fetchPage })),
    post('/api/newsroom/pick', async (ctx) => pickNews(idOf(await bodyOf(ctx)))),
    post('/api/newsroom/unpick', async (ctx) => unpickNews(idOf(await bodyOf(ctx)))),
  ];
}

export const routes = makeNewsroomRoutes();
