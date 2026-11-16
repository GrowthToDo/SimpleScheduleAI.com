// The Newsroom: news items from the feeds turned into topic cards for the trendjacking method
// (.claude/skills/trendjacking-articles.md). Pure functions only: no files, no network, no clock (the
// caller passes `today`).
//
//   parseFeed(xml, {name, google})   RSS items and Atom entries: title, link, date, publisher, description
//   groupStories(items)              items that are the same story, by the words their titles share
//   storyCards(items, {today})       one card per story (Tier 1 and 2 only), best first
//   tierOf(text), draftScore(...)    the relevance gradient and the two parts of the score the desk can draft
//   parseTopicLog(md)                the HELD, PARKED, DROPPED and WRITING entries of the topic log
//   matchHave(card, have)            what the site has already written, planned or decided about it
//   newsBrief(card)                  the "Copy brief for Claude" text

import crypto from 'node:crypto';
import { wordsOf, STOP_WORDS } from './topics.mjs';
import { foldWord } from './targets.mjs';
import { addDays, daysBetween } from './dates.mjs';
import { longDate, plain } from './text.mjs';

// Items from the last 14 days only.
export const NEWS_DAYS = 14;

// ---------------------------------------------------------------- reading a feed

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: '-' };

export function decodeEntities(s) {
  return String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : '';
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const unCdata = (s) => String(s ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

// Text with every tag gone and entities decoded (twice: a feed often escapes its HTML once more).
export function stripHtml(s) {
  let t = unCdata(s);
  for (let i = 0; i < 2; i++) t = decodeEntities(t.replace(/<[^>]*>/g, ' '));
  t = t.replace(/<[^>]*>/g, ' ');
  return plain(t.replace(/\s+/g, ' ').trim());
}

const tagText = (block, name) => {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i').exec(block);
  return m ? m[1] : null;
};

// A date in any of the shapes feeds use, as YYYY-MM-DD, or null.
export function feedDate(raw) {
  const s = stripHtml(raw ?? '');
  if (!s) return null;
  let t = Date.parse(s);
  // "Nov 14, 2026 7:00pm" needs a space before pm.
  if (!Number.isFinite(t)) t = Date.parse(s.replace(/(\d)(am|pm)\b/i, '$1 $2'));
  if (!Number.isFinite(t)) {
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
  }
  return new Date(t).toISOString().slice(0, 10);
}

// Google News titles end in " - Publisher".
export function splitGoogleTitle(title) {
  const t = String(title ?? '');
  const at = t.lastIndexOf(' - ');
  if (at <= 0) return { title: t.trim(), publisher: null };
  return { title: t.slice(0, at).trim(), publisher: t.slice(at + 3).trim() || null };
}

const httpsOnly = (u) => {
  try {
    const url = new URL(String(u ?? '').trim());
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

const MAX_DESCRIPTION = 400;

// Items and entries of one feed: [{title, link, date, publisher, description}]. `name` is the
// feed's own name, the publisher when an item names none. `google`: titles end in " - Publisher".
// An item without a title or an https link is dropped. Never throws.
export function parseFeed(xml, { name = '', google = false } = {}) {
  const text = String(xml ?? '');
  const out = [];
  const blocks = text.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) ?? [];
  for (const block of blocks) {
    let title = stripHtml(tagText(block, 'title'));
    const linkTag = tagText(block, 'link');
    const hrefs = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map((m) => m[1]);
    const alt =
      hrefs.find((a) => /rel=["']alternate["']/i.test(a) && /href=/i.test(a)) ?? hrefs.find((a) => /href=/i.test(a));
    const altHref = alt ? /href=["']([^"']+)["']/i.exec(alt)?.[1] : null;
    const link = httpsOnly(decodeEntities(unCdata(linkTag ?? '').trim()) || decodeEntities(altHref ?? ''));
    let publisher = stripHtml(tagText(block, 'source')) || null;
    if (google) {
      const split = splitGoogleTitle(title);
      title = split.title;
      publisher = publisher || split.publisher;
    }
    if (!title || !link) continue;
    const date = feedDate(
      tagText(block, 'pubDate') ?? tagText(block, 'published') ?? tagText(block, 'updated') ?? tagText(block, 'dc:date')
    );
    let description = stripHtml(
      tagText(block, 'description') ?? tagText(block, 'summary') ?? tagText(block, 'content') ?? ''
    );
    // A news search repeats the title (and the publisher) as its description.
    if (google) description = '';
    if (description.length > MAX_DESCRIPTION)
      description = `${description.slice(0, MAX_DESCRIPTION).replace(/\s+\S*$/, '')}...`;
    out.push({ title, link, date, publisher: publisher || name || null, description });
  }
  return out;
}

// ---------------------------------------------------------------- words

// Words a headline uses that say nothing about which story it is.
const NEWS_STOP = new Set(
  [
    'say',
    'said',
    'says',
    'new',
    'more',
    'after',
    'before',
    'over',
    'amid',
    'may',
    'might',
    'just',
    'still',
    'also',
    'get',
    'make',
    'take',
    'way',
    'now',
    'first',
    'last',
    'back',
    'out',
    'up',
    'down',
    'off',
    'all',
    'some',
    'most',
    'many',
    'much',
    'being',
    'their',
    'they',
    'them',
    'he',
    'she',
    'his',
    'her',
    'us',
    'if',
    'so',
    'no',
    'one',
    'two',
    'year',
    'week',
    'day',
    'report',
    'news',
    'update',
    'here',
    'know',
  ].map((w) => w.toLowerCase())
);

// Words almost every story in this feed shares. Two stories never count as one story, or as covered,
// on these alone.
const DOMAIN = new Set([
  'nurse',
  'nursing',
  'hospital',
  'health',
  'healthcare',
  'care',
  'rural',
  'patient',
  'medical',
  'critical',
  'access',
  'staff',
  'staffing',
  'shortage',
  'strike',
  'worker',
  'union',
  'contract',
]);

// Everyday words a headline and a page title share by chance. They never make two stories one, and
// never make a story covered.
const GENERIC = new Set(
  [
    'work',
    'best',
    'strong',
    'general',
    'don',
    'top',
    'big',
    'help',
    'need',
    'use',
    'way',
    'time',
    'hour',
    'change',
    'want',
    'start',
    'end',
    'high',
    'low',
    'late',
    'early',
    'open',
    'full',
    'part',
    'find',
    'show',
    'look',
    'lead',
    'set',
    'put',
    'keep',
    'give',
    'go',
    'come',
    'see',
    'call',
    'face',
    'hold',
    'reach',
    'move',
    'push',
    'watch',
    'join',
    'guide',
    'what',
    'other',
    'million',
    'billion',
    'program',
    'fund',
    'funding',
    'new',
  ].map((w) => w.toLowerCase())
);

// One word folded to the form its relatives share: foldWord (lib/targets.mjs: "awards" and "award",
// "expands" and "expand", "nurses" and "nurse") and three endings it leaves alone, so "expansion" meets
// "expand", "extension" meets "extend" and "transformation" meets "transform".
export function fold(word) {
  let w = foldWord(String(word ?? '').toLowerCase());
  if (/ansion$/.test(w)) w = w.replace(/ansion$/, 'and');
  else if (/ension$/.test(w)) w = w.replace(/ension$/, 'end');
  else if (/ation$/.test(w) && w.length - 5 >= 5) w = w.slice(0, -5);
  return w;
}

const FOLDED = (set) => new Set([...set].map(fold));
const STOP = FOLDED(STOP_WORDS);
const NEWS_STOP_F = FOLDED(NEWS_STOP);
const DOMAIN_F = FOLDED(DOMAIN);
const GENERIC_F = FOLDED(GENERIC);

// The meaningful words of a text in order, folded, repeats kept (for phrases).
function sequence(text) {
  const out = [];
  for (const raw of wordsOf(text)) {
    if (STOP_WORDS.has(raw) || NEWS_STOP.has(raw)) continue;
    if ([...raw].length < 2 && !/^\p{N}$/u.test(raw)) continue;
    const w = fold(raw);
    if (STOP.has(w) || NEWS_STOP_F.has(w)) continue;
    out.push(w);
  }
  return out;
}

const meaningful = (text) => [...new Set(sequence(text))];
const isDistinctive = (w) => !DOMAIN_F.has(w) && !GENERIC_F.has(w) && !/\p{N}/u.test(w);

// {all, distinctive}: the meaningful words of a text (folded), and those not in DOMAIN or GENERIC.
export function storyWords(text) {
  const all = meaningful(text);
  // A word with a digit in it ("2027", "12", "$8M") is never a distinctive word: it matches by chance.
  return { all, distinctive: all.filter(isDistinctive) };
}

// The way each folded word was written in `text`, to show matched words as the story wrote them.
function surfaceOf(text) {
  const m = new Map();
  for (const w of wordsOf(text)) if (!m.has(fold(w))) m.set(fold(w), w);
  return m;
}

const sharedOf = (a, b) => {
  const set = new Set(b);
  return [...new Set(a)].filter((w) => set.has(w));
};

export function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / (A.size + B.size - n);
}

// Two titles are the same story when they share three distinctive words and overlap strongly, or two
// distinctive words and overlap very strongly.
export const SAME_STORY = { strongShared: 3, strongJaccard: 0.35, minShared: 2, minJaccard: 0.6 };

export function sameStory(a, b) {
  const s = sharedOf(a.distinctive, b.distinctive).length;
  const j = jaccard(a.all, b.all);
  return (
    (s >= SAME_STORY.strongShared && j >= SAME_STORY.strongJaccard) ||
    (s >= SAME_STORY.minShared && j >= SAME_STORY.minJaccard)
  );
}

// ---------------------------------------------------------------- tiers

const has = (re) => (t) => re.test(t);
const both = (a, b) => (t) => a.test(t) && b.test(t);
const NURSE = /\bnurs(e|es|ing)\b/;
const HEALTH = /\b(health|hospitals?|nurs\w*|medical|clinics?|patients?|medicaid|medicare|rural)\b/;

// The skill's relevance gradient, in the order the words are shown.
const TIER1 = [
  [
    'nurse staffing',
    has(
      /\bnurs(e|es|ing) staffing\b|\bstaffing (ratios?|levels?|shortages?|mandates?)\b|nurse-to-patient|safe staffing/
    ),
  ],
  ['nurse shortage', has(/\bnurs(e|es|ing) shortages?\b|\bshortage of nurses\b/)],
  ['rural hospital', has(/\brural (hospitals?|health)\b/)],
  ['critical access', has(/\bcritical access\b/)],
  ['CMS rule', has(/\bcms\b|\bcenters for medicare\b/)],
  ['Conditions of Participation', has(/\bconditions of participation\b/)],
  [
    'Medicare or Medicaid rule',
    both(/\b(medicare|medicaid)\b/, /\b(rules?|cuts?|payments?|reimbursement|funding|freeze|policy|waiver)\b/),
  ],
  ['Texas health policy', both(/\btexas\b/, HEALTH)],
  [
    'nurse labor or unions',
    has(/\bnurses?'? unions?\b|\bunion nurses\b|\bnurses association\b|\bcollective bargaining\b|\bnurse contracts?\b/),
  ],
  [
    'shortage or turnover data',
    (t) =>
      /\b(nsi|bls|hrsa|aha)\b/.test(t) && /\b(reports?|survey|data|projections?|turnover)\b/.test(t)
        ? true
        : /\bturnover\b/.test(t) && NURSE.test(t),
  ],
];

const TIER2 = [
  ['nurse strike', both(/\bstrikes?|striking\b/, NURSE)],
  ['AI in healthcare', both(/\bai\b|\bartificial intelligence\b/, HEALTH)],
  [
    'hospital closure',
    has(
      /\bhospitals?\b[^.]*\b(close|closes|closing|closure|closed|shut|shuts|shutting|shutters?)\b|\b(closes|closing|closure|shuts|shutting)\b[^.]*\bhospitals?\b/
    ),
  ],
  [
    'hospital finance',
    both(
      /\b(hospitals?|health systems?)\b/,
      /\b(financ\w*|budgets?|layoffs?|losses|margins?|bankrupt\w*|deficits?|job cuts)\b/
    ),
  ],
];

const lower = (s) => String(s ?? '').toLowerCase();

// {tier: 1 | 2 | 3, words}. Tier 3 is everything else and is never shown.
export function tierOf(text) {
  const t = lower(text);
  const one = TIER1.filter(([, test]) => test(t)).map(([w]) => w);
  if (one.length) return { tier: 1, words: one };
  const two = TIER2.filter(([, test]) => test(t)).map(([w]) => w);
  // A nurse story with nothing else is the skill's "viral nurse story" shape.
  if (!two.length && NURSE.test(t)) two.push('a nurse story');
  if (two.length) return { tier: 2, words: two };
  return { tier: 3, words: [] };
}

export const tierText = ({ tier, words }) =>
  tier === 3
    ? 'Tier 3: none of the Newsroom topics is in its title or description'
    : `Tier ${tier}: ${words.join(', ')}`;

// ---------------------------------------------------------------- paid placements

export const PAID_LABEL = 'Press release or paid placement: not citable as a peg, use its primary sources';
const PAID_HOSTS = [
  'globenewswire',
  'prnewswire',
  'businesswire',
  'openpr',
  'einpresswire',
  'financialcontent',
  'marketersmedia',
  'accesswire',
];
const PAID_NAMES =
  /\b(globe ?newswire|pr ?newswire|business ?wire|openpr|ein presswire|financialcontent|marketersmedia|accesswire)\b/i;
const PAID_TEXT = /\bpaid advertisement\b|\bpress release\b|\bsponsored content\b/i;

const hostOf = (u) => {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return '';
  }
};

export function isPaid(it) {
  const host = hostOf(it?.link ?? it?.url);
  if (PAID_HOSTS.some((p) => host.includes(p))) return true;
  if (PAID_NAMES.test(String(it?.publisher ?? it?.name ?? ''))) return true;
  return PAID_TEXT.test(String(it?.description ?? ''));
}

// ---------------------------------------------------------------- one story

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const pluralOf = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------- topic phrases

// Names the news uses for a topic our pages call something else. Each alias (its words, in any order)
// stands for the topic phrase it names. Kept in one list so it is easy to change.
export const TOPIC_ALIASES = [
  { topic: 'rural health transformation', words: ['rural', 'health', 'awards'] },
  { topic: 'rural health transformation', words: ['rural', 'health', 'fund'] },
  { topic: 'rural health transformation', words: ['rural', 'health', '10b'] },
  { topic: 'rural health transformation', words: ['rhtp'] },
];

// A phrase our pages share with more pages than this is a theme of the whole site, not a topic.
export const TOPIC_MAX_PAGES = 4;
// Stories sharing a topic phrase are one card when they ran within this many days of each other.
export const TOPIC_GROUP_DAYS = 10;
// A topic made only of these words matches a page ("Close to") but never makes two stories one card:
// "Texas Medicaid" alone covers a backlog, a lawsuit and an expansion.
const BROAD = new Set([
  ...DOMAIN_F,
  ...[
    'texas',
    'medicaid',
    'medicare',
    'cms',
    'state',
    'federal',
    'rule',
    'law',
    'bill',
    'policy',
    'county',
    'hospital',
  ].map(fold),
]);

const keyOf = (words) => [...new Set(words)].sort().join(' ');

// The topic phrases of our own pages and topic log: every run of two or three meaningful words in a
// title or a page address, folded and taken in any order, that has a distinctive word, no number, and
// is on at most TOPIC_MAX_PAGES pages; plus the aliases. Map<key, {key, words, aliases, pages, logs,
// groups}>: pages are page paths, logs are log entry titles, groups says whether it can join stories.
export function buildTopics({ content = [], log = [] } = {}) {
  const found = new Map();
  const add = (words, src, kind) => {
    const uniq = [...new Set(words)];
    if (uniq.length < 2 || uniq.some((w) => /\p{N}/u.test(w)) || !uniq.some(isDistinctive)) return;
    const key = keyOf(uniq);
    const t = found.get(key) ?? { key, words: uniq.sort(), aliases: [], pages: new Set(), logs: new Set() };
    t[kind].add(src);
    found.set(key, t);
  };
  const runs = (text, src, kind) => {
    const seq = sequence(text);
    for (let i = 0; i < seq.length; i++) {
      if (i + 1 < seq.length) add(seq.slice(i, i + 2), src, kind);
      if (i + 2 < seq.length) add(seq.slice(i, i + 3), src, kind);
    }
  };
  for (const c of content ?? []) {
    runs(c.title, c.page, 'pages');
    runs(slugWords(c.page), c.page, 'pages');
  }
  for (const e of log ?? []) runs(e.title, e.title, 'logs');
  const out = new Map();
  for (const t of found.values()) {
    if (t.pages.size > TOPIC_MAX_PAGES) continue;
    out.set(t.key, { ...t, groups: t.words.some((w) => !BROAD.has(w)) });
  }
  for (const a of TOPIC_ALIASES) {
    const key = keyOf(sequence(a.topic));
    const t = out.get(key) ?? {
      key,
      words: sequence(a.topic).sort(),
      aliases: [],
      pages: new Set(),
      logs: new Set(),
      groups: true,
    };
    t.aliases = [...t.aliases, [...new Set(sequence(a.words.join(' ')))]];
    out.set(key, t);
  }
  return out;
}

// The topic keys a text holds: all of a topic's words, or all of one alias's words, anywhere in it.
export function topicsIn(text, topics) {
  if (!topics?.size) return [];
  const have = new Set(sequence(text));
  const all = (ws) => ws.length && ws.every((w) => have.has(w));
  return [...topics.values()].filter((t) => all(t.words) || t.aliases.some(all)).map((t) => t.key);
}

// Items that are the same story, each group oldest first: their titles overlap strongly (sameStory),
// or they share one of our topic phrases that can join stories and ran within TOPIC_GROUP_DAYS of each
// other; joined through any member. The same link twice is one item.
export function groupStories(items, { topics = null } = {}) {
  const seen = new Set();
  const list = [];
  for (const it of items ?? []) {
    if (!it?.link || seen.has(it.link)) continue;
    seen.add(it.link);
    list.push({ it, w: storyWords(it.title), t: topics ? topicsIn(it.title, topics) : [] });
  }
  const parent = list.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const near = (a, b) => a.it.date && b.it.date && Math.abs(daysBetween(a.it.date, b.it.date)) <= TOPIC_GROUP_DAYS;
  const sharesTopic = (a, b) => a.t.some((k) => topics.get(k)?.groups && b.t.includes(k));
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++)
      if (sameStory(list[i].w, list[j].w) || (sharesTopic(list[i], list[j]) && near(list[i], list[j])))
        parent[find(j)] = find(i);
  const groups = new Map();
  list.forEach((x, i) => {
    const r = find(i);
    groups.set(r, [...(groups.get(r) ?? []), x.it]);
  });
  return [...groups.values()].map((g) => g.sort((a, b) => String(a.date).localeCompare(String(b.date))));
}

const RISING_BY_OUTLETS = (n) => (n >= 8 ? 5 : n >= 5 ? 4 : n >= 3 ? 3 : n);

// The two parts of the method's score the desk can draft. Relevance (1 to 5) from the tier and how many
// of its words the story has; Rising (1 to 5) from how many outlets ran it, less one when the latest is
// three to six days old and two when it is a week or older.
export function draftScore(tierInfo, outlets, latestDate, today) {
  const n = tierInfo.words.length;
  const relevance = tierInfo.tier === 1 ? Math.min(5, 2 + n) : tierInfo.tier === 2 ? Math.min(3, 1 + n) : 1;
  const count = outlets.length;
  // A page with no date of its own is treated as a week old or more.
  const age = latestDate ? daysBetween(latestDate, today) : NEWS_DAYS;
  const less = age >= 7 ? 2 : age >= 3 ? 1 : 0;
  const rising = Math.max(1, Math.min(5, RISING_BY_OUTLETS(count)) - less);
  return {
    relevance,
    rising,
    product: relevance * rising,
    draft: true,
    relevanceWhy: `${tierText(tierInfo)}.`,
    risingWhy: latestDate
      ? `${pluralOf(count, 'outlet', 'outlets')} ran it, the latest on ${longDate(latestDate)}.`
      : `${pluralOf(count, 'outlet', 'outlets')} ran it, with no date given.`,
  };
}

// The two parts only a live search and a reading of the sources can settle (the brief asks Claude).
export const TO_CHECK = [
  {
    name: 'Can we be first',
    how: 'Search the head question and see who owns the results page. If big publishers own it, take the thin analysis angle or a rising question instead.',
  },
  {
    name: 'Citable hook',
    how: 'Read the primary sources and name the one original stat, worked calculation or reframe worth quoting, or say there is none.',
  },
];

const titleOf = (group) => {
  // The title that shares the most words with the others; a trade press title before a news search one.
  const ws = group.map((it) => new Set(storyWords(it.title).all));
  let best = 0;
  let bestScore = -1;
  group.forEach((it, i) => {
    let s = 0;
    ws.forEach((w, j) => {
      if (i !== j) for (const x of ws[i]) if (w.has(x)) s++;
    });
    if (!it.google) s += 0.5;
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  });
  return group[best].title;
};

// The outlets of a story, one per publisher: its first item (the direct link before a news search link).
function outletsOf(group) {
  const by = new Map();
  for (const it of group) {
    const name = plain(it.publisher || hostOf(it.link) || 'Unknown outlet');
    const key = name.toLowerCase();
    const had = by.get(key);
    if (!had || (had.google && !it.google)) by.set(key, { ...it, name });
  }
  return [...by.values()]
    .map((it) => ({
      name: it.name,
      url: it.link,
      date: it.date ?? null,
      dateText: it.date ? longDate(it.date) : null,
      title: it.title,
      google: Boolean(it.google),
      ...(isPaid(it) ? { paid: true } : {}),
    }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.name.localeCompare(b.name));
}

// One card from one story's items. tierInfo may be given (a pasted page reads its description too).
export function storyCard(group, { today, pasted = false } = {}) {
  const title = plain(titleOf(group));
  const text = group.map((it) => `${it.title} ${it.description ?? ''}`).join(' ');
  const t = tierOf(text);
  const outlets = outletsOf(group);
  const dates = group
    .map((it) => it.date)
    .filter(Boolean)
    .sort();
  const firstDate = dates[0] ?? null;
  const latestDate = dates[dates.length - 1] ?? null;
  // A story is a paid placement only when every outlet is one: a press release copy among real reports
  // is marked on its own outlet line instead.
  const paid = group.every(isPaid);
  return {
    id: `news:${hash(group[0].link)}`,
    title,
    description: plain(group.find((it) => it.description)?.description ?? ''),
    outlets,
    firstDate,
    latestDate,
    firstText: firstDate ? longDate(firstDate) : null,
    latestText: latestDate ? longDate(latestDate) : null,
    tier: t.tier,
    tierWords: t.words,
    tierText: tierText(t),
    score: draftScore(t, outlets, latestDate, today),
    paid,
    ...(paid ? { paidText: PAID_LABEL } : {}),
    pasted,
  };
}

export const byScore = (a, b) =>
  b.score.product - a.score.product ||
  String(b.latestDate).localeCompare(String(a.latestDate)) ||
  a.title.localeCompare(b.title);

// Tier 1 and 2 cards from the items of the last 14 days, best draft score first, newest first on ties.
export function storyCards(items, { today, topics = null }) {
  const from = addDays(today, -NEWS_DAYS);
  const recent = (items ?? []).filter((it) => it?.date && it.date >= from && it.date <= today);
  return groupStories(recent, { topics })
    .map((g) => storyCard(g, { today }))
    .filter((c) => c.tier !== 3)
    .sort(byScore);
}

// ---------------------------------------------------------------- the topic log

// "HELD - title", and "WRITING (founder go 2026-10-29) - title".
const STATUS_RE = /^(HELD|PARKED|DROPPED|WRITING)\b(?:\s*\([^)]*\))?\s*-\s*/;
const URL_RE = /https:\/\/[^\s)>\]"']+/g;
const STATUS_DATE = {
  HELD: /\*\*Held on:\*\*\s*(\d{4}-\d{2}-\d{2})/,
  PARKED: /\*\*Parked on:\*\*\s*(\d{4}-\d{2}-\d{2})/,
  DROPPED: /\*\*Dropped on:\*\*\s*(\d{4}-\d{2}-\d{2})/,
};

const cleanMd = (s) =>
  plain(
    String(s ?? '')
      .replace(/\*\*|`|_/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
const linksIn = (s) => [...new Set((String(s).match(URL_RE) ?? []).map((u) => u.replace(/[.,;:]+$/, '')))];

// The reason after a log bullet's bold title: a leading "(outlet, date)" and "score 0 ..." go, then the
// first sentence (a sentence ends at a stop followed by a space and a capital, so "$3.9M" stays whole).
function reasonOf(rest) {
  let r = cleanMd(rest)
    .replace(/^\s*\([^)]*\)\s*/, '')
    .replace(/^[:.\s]*score\s+\d+\b[^.]*\.\s*/i, '')
    .replace(/^[:.\s]+/, '');
  r = r.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)[0]?.trim() ?? '';
  if (r.length > 220) r = `${r.slice(0, 217).replace(/\s+\S*$/, '')}...`;
  return r ? `${r[0].toUpperCase()}${r.slice(1)}` : null;
}

// The bullets of a section, each with its indented continuation lines joined on.
function bulletsOf(lines) {
  const out = [];
  for (const line of lines) {
    if (/^- /.test(line)) out.push(line.slice(2));
    else if (/^\s+\S/.test(line) && out.length && out[out.length - 1] !== null)
      out[out.length - 1] += ` ${line.trim()}`;
    else if (line.trim()) out.push(null);
  }
  return out.filter(Boolean);
}

// A bullet that records a decision: its bold title starts with a status, or the bullet scores 0 (dropped).
function bulletEntry(b, date) {
  const m = /^\*\*(.+?)\*\*(.*)$/.exec(b);
  if (!m) return null;
  const head = m[1].trim();
  // A label such as "**Dropped on:**" or "**Reason:**" is a field of its heading's entry, not an entry.
  if (head.endsWith(':')) return null;
  const status = STATUS_RE.exec(head)?.[1] ?? (/\bscore\s+0\b/i.test(m[2]) ? 'DROPPED' : null);
  if (!status) return null;
  return {
    status,
    title: cleanMd(head.replace(STATUS_RE, '')),
    date,
    reason: status === 'DROPPED' ? reasonOf(m[2]) : null,
    links: linksIn(b),
  };
}

// Every decision the log records: [{status, title, date, reason, links}]. Status is HELD, PARKED,
// DROPPED or WRITING. A "### STATUS - title" heading is one entry (its date from "Held on" and the
// like, its reason from "Reason:"). Under a "### Detection pass YYYY-MM-DD" heading, and under any heading
// after one (a pass's dropped list can sit under the next HELD heading), each bullet with a bold title is
// one entry, dated by that pass, when the title starts with a status or the bullet scores 0 (dropped).
export function parseTopicLog(md) {
  const out = [];
  const sections = [];
  let cur = null;
  for (const line of String(md ?? '').split(/\r?\n/)) {
    const h = /^###\s+(.*)$/.exec(line);
    if (h) {
      cur = { head: h[1].trim(), lines: [] };
      sections.push(cur);
    } else if (/^##?\s/.test(line)) {
      cur = null;
    } else if (cur) cur.lines.push(line);
  }
  let pass = null;
  for (const s of sections) {
    const body = s.lines.join('\n');
    const status = STATUS_RE.exec(s.head)?.[1];
    const passDate = /^Detection pass\s+(\d{4}-\d{2}-\d{2})/i.exec(s.head)?.[1];
    if (passDate) pass = passDate;
    if (status) {
      const reason = /\*\*Reason:\*\*\s*([^\n]+(?:\n\s+[^\n-][^\n]*)*)/.exec(body)?.[1];
      out.push({
        status,
        title: cleanMd(s.head.replace(STATUS_RE, '')),
        date: STATUS_DATE[status]?.exec(body)?.[1] ?? null,
        reason: reason ? reasonOf(reason) : null,
        links: linksIn(body),
      });
    }
    if (!pass) continue;
    for (const b of bulletsOf(s.lines)) {
      const e = bulletEntry(b, pass);
      if (e) out.push(e);
    }
  }
  return out;
}

const LOG_WORDS = {
  HELD: (e) => `Held since ${longDate(e.date)}: ${e.title}`,
  PARKED: (e) => `Parked since ${longDate(e.date)}: ${e.title}`,
  WRITING: (e) => `Writing since ${longDate(e.date)}: ${e.title}`,
  DROPPED: (e) => `Dropped on ${longDate(e.date)}: ${e.reason ?? e.title}`,
};
const logText = (e) =>
  e.date ? LOG_WORDS[e.status](e) : `${e.status[0]}${e.status.slice(1).toLowerCase()}: ${e.reason ?? e.title}`;

// ---------------------------------------------------------------- what we already have

// A match is strong at three shared distinctive words and close at two. Only a strong match (or an outlet
// link in the log) moves a card off Fresh, so a short title sharing two words never hides a story.
export const HAVE_MATCH = { strong: 3, close: 2 };
// A piece older than this never "covers" a story: the story can still be a new angle on it.
export const COVERED_DAYS = 60;
export const HAVE_MAX = 4;

const topicStrength = (words) => (words.length >= 3 && words.filter(isDistinctive).length >= 2 ? 'strong' : 'close');

const strengthOf = (shared) =>
  shared.length >= HAVE_MATCH.strong ? 'strong' : shared.length >= HAVE_MATCH.close ? 'close' : null;

const normUrl = (u) => {
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^www\./, '')}${x.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return String(u ?? '').toLowerCase();
  }
};

const slugWords = (page) =>
  String(page ?? '')
    .split('/')
    .pop()
    .replace(/-/g, ' ');

// What the site has already written, planned or decided about a card, each line with the words that
// matched: [{kind, text, words, strength, covered, decided, exact, page}]. kind: article (a live
// /articles piece: "Covered by" when strong), post (a live /blog post: always "Close to"), log (an entry
// of the topic log: strong, or exact when an outlet's link is in it), plan (a post the plan has not
// written yet). have: {content: [{page, kind, title, publishDate}], registry, log, plan}.
export function matchHave(
  card,
  { content = [], registry = [], log = [], plan = null, topics = null, today = null } = {}
) {
  // The card's own title only: the titles of thirty outlets together share a word with almost anything.
  const text = String(card.title ?? '');
  const mine = storyWords(text).distinctive;
  const out = [];
  // Words are matched folded ("expansion" and "expand"), and shown as the story wrote them.
  const titles = [text, ...(card.outlets ?? []).map((o) => o.title ?? '')];
  const surface = surfaceOf(titles.join(' '));
  const shown = (words) => words.map((w) => surface.get(w) ?? w).sort();
  // The story's topics: in its own title, or in the titles of two of its outlets.
  const count = new Map();
  for (const t of titles.slice(1)) for (const k of topicsIn(t, topics)) count.set(k, (count.get(k) ?? 0) + 1);
  const mineTopics = new Set([...topicsIn(text, topics), ...[...count].filter(([, n]) => n >= 2).map(([k]) => k)]);
  // The longest topic a page or log entry shares with the story, and its words.
  const topicWith = (has) => {
    let best = null;
    for (const k of mineTopics) {
      const t = topics?.get(k);
      if (t && has(t) && (!best || t.words.length > best.words.length)) best = t;
    }
    return best;
  };
  const recent = (date) => !today || !date || daysBetween(date, today) <= COVERED_DAYS;
  const keyword = new Map((registry ?? []).map((r) => [r.url, r.primaryKeyword ?? '']));
  for (const c of content ?? []) {
    const theirs = storyWords(`${c.title} ${slugWords(c.page)} ${keyword.get(c.page) ?? ''}`).distinctive;
    const topic = topicWith((t) => t.pages.has(c.page));
    let words = sharedOf(mine, theirs).sort();
    let strength = strengthOf(words);
    if (topic) {
      // A shared topic is close; the topic with a second distinctive word (three words in all, two of them
      // distinctive) is strong.
      words = [...new Set([...topic.words, ...words])];
      strength = topicStrength(words);
    }
    if (!strength) continue;
    const when = c.publishDate ? ` (published ${longDate(c.publishDate)})` : '';
    // Only a recent article covers a story: an older piece leaves room for the new angle.
    const covered = c.kind === 'article' && strength === 'strong' && recent(c.publishDate);
    out.push({
      kind: c.kind,
      page: c.page,
      text: `${covered ? 'Covered by' : 'Close to'} ${c.page}${c.kind === 'article' ? when : ''}`,
      words: shown(words),
      strength,
      covered,
      decided: false,
      ...(topic ? { topic: topic.key } : {}),
      publishDate: c.publishDate ?? null,
    });
  }
  const links = new Set((card.outlets ?? []).map((o) => normUrl(o.url)));
  for (const e of log ?? []) {
    const exact = (e.links ?? []).some((l) => links.has(normUrl(l)));
    const theirs = storyWords(e.title).distinctive;
    let words = sharedOf(mine, theirs).sort();
    let strength = strengthOf(words);
    const topic = topicWith((t) => t.logs.has(e.title));
    if (topic) {
      words = [...new Set([...topic.words, ...words])];
      if (topicStrength(words) === 'strong') strength = 'strong';
    }
    if (!exact && strength !== 'strong') continue;
    out.push({
      kind: 'log',
      text: logText(e),
      words: shown(words),
      strength: 'strong',
      covered: false,
      decided: true,
      exact,
      status: e.status,
    });
  }
  for (const p of plan?.posts ?? []) {
    if (p.done) continue;
    const theirs = storyWords(`${p.title} ${p.keyword ?? ''}`).distinctive;
    const words = sharedOf(mine, theirs).sort();
    const strength = strengthOf(words);
    if (!strength) continue;
    out.push({
      kind: 'plan',
      text: `In your post plan as #${p.n}: ${plain(p.title)}`,
      words: shown(words),
      strength,
      covered: false,
      decided: false,
    });
  }
  // At most HAVE_MAX lines: what covers or decides it first, then the closest by shared words.
  const rank = (x) => (x.covered ? 0 : x.decided ? 1 : x.kind === 'plan' ? 2 : 3);
  return out
    .map((x, i) => ({ x, i }))
    .sort((a, b) => rank(a.x) - rank(b.x) || b.x.words.length - a.x.words.length || a.i - b.i)
    .slice(0, HAVE_MAX)
    .map(({ x }) => x);
}

// ---------------------------------------------------------------- the brief

// The "Copy brief for Claude" text for one card: the skill first, the story and every outlet, the draft
// score with its two parts to check, what we already have, then the steps.
export function newsBrief(card) {
  const L = [];
  L.push('Task for the SimpleScheduleAI website: a possible Newsroom piece (/articles).');
  L.push('');
  L.push('Load .claude/skills/trendjacking-articles.md and follow it.');
  L.push('');
  L.push(`The story: ${plain(card.title)}`);
  const outlets = card.outlets ?? [];
  L.push(`Outlets (${outlets.length}):`);
  for (const o of outlets)
    L.push(
      `- ${plain(o.name)}, ${o.date ? longDate(o.date) : 'no date given'}: ${o.url}${o.paid ? ' (a press release or paid placement: not citable as a peg)' : ''}`
    );
  if (card.firstDate && card.latestDate)
    L.push(
      card.firstDate === card.latestDate
        ? `Seen on ${longDate(card.firstDate)}.`
        : `First seen ${longDate(card.firstDate)}, latest ${longDate(card.latestDate)}.`
    );
  if (card.paid) {
    L.push('');
    L.push(`Warning: ${PAID_LABEL}.`);
  }
  L.push('');
  L.push('Draft score from the desk (a draft, not the score):');
  L.push(
    `- Relevance ${card.score.relevance} of 5: ${plain(card.tierText ?? card.score.relevanceWhy)}.`.replace(
      /\.\.$/,
      '.'
    )
  );
  L.push(`- Rising ${card.score.rising} of 5: ${plain(card.score.risingWhy)}`);
  for (const t of TO_CHECK) L.push(`- ${t.name}: to check. ${t.how}`);
  L.push('');
  L.push('What we already have:');
  const have = card.have ?? [];
  if (!have.length) L.push('- Nothing the desk could match by title words. Check the site and the topic log anyway.');
  for (const x of have) L.push(`- ${plain(x.text)}${x.words?.length ? ` (shared words: ${x.words.join(', ')})` : ''}`);
  L.push('');
  L.push('Steps:');
  const steps = [
    'Check the results page for the head question: can we be first? If big publishers own it, find the thin analysis angle or a rising question instead.',
    'Read the primary sources and name the one citable hook, or say there is none.',
    'Score it: Relevance x Rising x Can we be first x Citable hook. It needs a hook and a relevance of 3 or more.',
    'Log the decision, kept or dropped with the reason, in docs/seo/articles-trendjacking-plan.md under "### Detection pass YYYY-MM-DD" with today\'s date.',
    'Write a draft only after the founder says go. It stays draft: true until he says to publish.',
  ];
  steps.forEach((s, i) => L.push(`${i + 1}. ${s}`));
  return L.join('\n');
}
