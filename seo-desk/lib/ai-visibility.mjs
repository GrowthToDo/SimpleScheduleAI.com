// AI visibility by kind of question: what the last citation check found, split by what the question
// was about (our own name, an alternative or a comparison, the kind of product, anything else) and by
// assistant.
//
// Two kinds of evidence, never put in one ratio. The check lists answers where an assistant named us;
// those can only be counted ("listed"), because a miss never appears in that list. The keyword checks
// can miss, so only they read as "N of M", and only from MIN_CHECKS checks; under that they carry no
// numbers. The check lists at most 10 answers per assistant, so counts are a floor. Nothing here says
// why an assistant did or did not name us.

import { todayIso, daysBetween } from './dates.mjs';
import { longDate } from './text.mjs';

export const MIN_CHECKS = 3;
const NOT_ENOUGH = 'Not enough data yet.';

export const KINDS = [
  { kind: 'brand', label: 'Questions that name us' },
  { kind: 'alternatives', label: 'Alternatives and comparisons' },
  { kind: 'category', label: 'Questions about the kind of product' },
  { kind: 'other', label: 'Other questions' },
];

const PLATFORM = { chat_gpt: 'ChatGPT', google: 'Google AI answers', perplexity: 'Perplexity', copilot: 'Copilot' };
const assistantLabel = (p) => PLATFORM[p] || String(p || 'An AI assistant').replace(/_/g, ' ');

export const NOTE =
  'These counts are a floor. The citation check lists at most 10 answers per assistant, and it lists an answer only when an assistant named us, so the listed count is a number of answers, never a share. Only the keyword checks can miss, so only they read as "N of M", and a keyword line reads "not enough data yet" until it rests on at least 3 checks.';

// ---------------------------------------------------------------- reading a question

// Lower case, every run of other characters read as one space, so "Plan-it" and "plan it" match.
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// True when the text holds the name as whole words.
const hasName = (text, name) => {
  const n = norm(name);
  return n.length > 0 && ` ${text} `.includes(` ${n} `);
};

const COMPARING = /\b(alternatives?|vs|versus|compar(?:e|es|ed|ison|ing))\b/;
// The kind of product: scheduling or rostering in itself, or a piece of software for staff.
const PRODUCT_WORD = /\b(schedul(?:ing|er)|roster(?:ing)?|staffing)\b/;
const TOOL_WORD = /\b(software|app|apps|tool|tools|platform|system|systems)\b/;
const STAFF_WORD = /\b(nurse|nurses|nursing|hospital|shift|shifts|staff|clinic|clinics|schedule)\b/;

// brand: names us. alternatives: asks for alternatives or a comparison, or names a competitor.
// category: names the kind of product with no brand. other: anything else.
export function classifyQuestion(text, { brands = [], competitors = [] } = {}) {
  const t = norm(text);
  if (!t) return 'other';
  if (brands.some((b) => hasName(t, b))) return 'brand';
  if (COMPARING.test(t) || competitors.some((c) => hasName(t, c))) return 'alternatives';
  if (PRODUCT_WORD.test(t) || (TOOL_WORD.test(t) && STAFF_WORD.test(t))) return 'category';
  return 'other';
}

// The name a website goes by: "https://www.rotawise.com/pricing" and "rotawise.com" both give
// "rotawise". Names under 3 characters are dropped; they would match inside ordinary words.
const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'gov', 'ac']);
function stemOf(hostOrUrl) {
  let host = String(hostOrUrl ?? '').trim();
  try {
    host = new URL(/^[a-z]+:\/\//i.test(host) ? host : `https://${host}`).hostname;
  } catch {
    // keep the text as it was
  }
  const parts = host
    .toLowerCase()
    .replace(/^www\./, '')
    .split('.')
    .filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  const i = parts.length >= 3 && SECOND_LEVEL.has(parts[parts.length - 2]) ? parts.length - 3 : parts.length - 2;
  return parts[i];
}

// hosts: websites or addresses. own: our own names or websites, left out of the answer.
export function competitorNamesFrom(hosts = [], { own = [] } = {}) {
  const ours = new Set(own.map((o) => norm(stemOf(o))).filter(Boolean));
  const out = new Set();
  for (const h of hosts) {
    const stem = stemOf(h);
    if (stem.length >= 3 && !ours.has(norm(stem))) out.add(stem);
  }
  return [...out];
}

// ---------------------------------------------------------------- counting

// One saved row as a check, of one of two kinds that are never put in one ratio.
// listed: a row from the "where are we named" list. It exists only because an assistant named us, so
// it can say we were named and nothing about misses; it counts as linked when it lists a page of ours.
// keyword: a row from the keyword check, where a miss is possible: named and linked when we are among
// its cited sources. Anything else is not a check.
function checkOf(r) {
  if (!r || typeof r !== 'object') return null;
  if (r.kind === 'own-mention') {
    return {
      type: 'listed',
      text: r.question,
      platform: r.platform,
      named: true,
      cited: Array.isArray(r.citedUrls) && r.citedUrls.length > 0,
    };
  }
  if (r.keyword !== undefined) {
    return {
      type: 'keyword',
      text: r.keyword,
      platform: r.platform,
      named: r.ourPresent === true,
      cited: r.ourPresent === true,
    };
  }
  return null;
}

// The newest saved line; a date saved twice keeps its last line.
function latestLine(lines) {
  let best = null;
  for (const l of Array.isArray(lines) ? lines : []) {
    if (!l || typeof l.date !== 'string' || !l.date) continue;
    if (!best || l.date >= best.date) best = l;
  }
  return best;
}

const many = (n, one, more) => `${n} ${n === 1 ? one : more}`;

// listed: a count of answers, never a share. keywordChecked, keywordNamed and keywordCited: the only
// numbers that may be shown as "N of M", and only from MIN_CHECKS keyword checks; under that they carry
// no numbers and the plain line says so.
function tally(checks) {
  const listed = checks.filter((c) => c.type === 'listed');
  const keyword = checks.filter((c) => c.type === 'keyword');
  const enough = keyword.length >= MIN_CHECKS;
  const named = keyword.filter((c) => c.named).length;
  const cited = keyword.filter((c) => c.cited).length;
  const listedText = listed.length
    ? `We were named in ${many(listed.length, 'answer', 'answers')} the check listed.`
    : 'The check listed no answers that named us.';
  const keywordText = enough
    ? `Named us in at least ${named} of ${keyword.length} keyword checks; linked to us in at least ${cited}.`
    : NOT_ENOUGH;
  return {
    listed: listed.length,
    listedLinked: listed.filter((c) => c.cited).length,
    keywordChecked: keyword.length,
    keywordNamed: enough ? named : null,
    keywordCited: enough ? cited : null,
    keywordEnough: enough,
    listedText,
    keywordText,
    text: `${listedText} ${keywordText}`,
  };
}

// aeoLines: the saved lines of docs/seo/aeo-trend.jsonl ({date, engines, rows}).
// cfg: {brands, competitors, today}. Competitor names in the keyword rows are added to cfg.competitors.
export function visibility(aeoLines, cfg = {}) {
  const line = latestLine(aeoLines);
  const checks = (line?.rows ?? []).map(checkOf).filter(Boolean);
  const seen = (Array.isArray(aeoLines) ? aeoLines : []).flatMap((l) =>
    (l?.rows ?? []).flatMap((r) => (Array.isArray(r?.competitors) ? r.competitors.map((c) => c?.[0]) : []))
  );
  const competitors = [
    ...(cfg.competitors ?? []),
    ...competitorNamesFrom(seen.filter(Boolean), { own: cfg.brands ?? [] }),
  ];
  const kindCfg = { brands: cfg.brands ?? [], competitors };

  const kinds = new Map(KINDS.map((k) => [k.kind, []]));
  const assistants = new Map();
  for (const c of checks) {
    kinds.get(classifyQuestion(c.text, kindCfg)).push(c);
    const key = c.platform ?? '';
    if (!assistants.has(key)) assistants.set(key, []);
    assistants.get(key).push(c);
  }

  const today = cfg.today ?? process.env.SEO_DESK_TODAY ?? todayIso();
  return {
    byKind: KINDS.map((k) => ({ kind: k.kind, label: k.label, ...tally(kinds.get(k.kind)) })),
    byAssistant: [...assistants.entries()]
      .map(([platform, list]) => ({ platform, assistant: assistantLabel(platform), ...tally(list) }))
      .sort(
        (a, b) => b.listed + b.keywordChecked - (a.listed + a.keywordChecked) || a.assistant.localeCompare(b.assistant)
      ),
    lastCheck: line ? { date: line.date, dateText: longDate(line.date), daysAgo: daysBetween(line.date, today) } : null,
    note: NOTE,
  };
}
