// The Newsroom's checks before a story is suggested (package 8c): the founder's own checks, done by
// the desk where words can do them. Pure functions only: no files, no network, no clock.
//
//   subjectOf(text)                 the subject key: a place, a main entity and a topic noun
//   reportsOf(items)                distinct reporting: syndicated copies collapse into their source
//   factsOf(text), pageFacts(md)    numbers, rule sections, programs and measure phrases
//   upcomingDateIn(text, today)     a dated change still ahead ("January 1, 2027")
//   freshnessOf(...)                Freshness (1 to 5)
//   hardFilters(card, have)         the five hard filters (a to e), each failure with a plain reason
//   repetitionOf(subject, ...)      our pieces on the same place and entity in the last 45 days

import { daysBetween } from './dates.mjs';
import { longDate } from './text.mjs';

const lower = (s) => String(s ?? '').toLowerCase();
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------- places

export const STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington state',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];
// Short forms headlines use. A bare "Washington" is left out: in policy news it is the federal government.
const STATE_SHORT = {
  'Mass.': 'Massachusetts',
  'Calif.': 'California',
  'Fla.': 'Florida',
  'Okla.': 'Oklahoma',
  'Tenn.': 'Tennessee',
  'Mich.': 'Michigan',
  'Minn.': 'Minnesota',
  'Penn.': 'Pennsylvania',
  'Ariz.': 'Arizona',
  'Ark.': 'Arkansas',
  'Ky.': 'Kentucky',
  'N.Y.': 'New York',
  'N.J.': 'New Jersey',
  'N.C.': 'North Carolina',
  'S.C.': 'South Carolina',
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const STATE_RES = [
  ...STATES.map((s) => [s === 'Washington state' ? 'Washington' : s, new RegExp(`\\b${esc(s)}\\b`, 'i')]),
  ...Object.entries(STATE_SHORT).map(([k, v]) => [v, new RegExp(`(^|[^A-Za-z])${esc(k)}`)]),
];

// The states a text names, in the order they appear ("Virginia" inside "West Virginia" is not Virginia).
export function placesIn(text) {
  const t = String(text ?? '');
  const found = [];
  for (const [name, re] of STATE_RES) {
    const m = re.exec(t);
    if (!m) continue;
    if (name === 'Virginia' && !new RegExp('(?<!West )\\bVirginia\\b', 'i').test(t)) continue;
    if (name === 'Kansas' && !/(?<!Ar)kansas\b/i.test(t)) continue;
    found.push([name, m.index]);
  }
  return [...new Map(found.sort((a, b) => a[1] - b[1])).keys()];
}

// Texas when the text names it (the founder's market), else the first state named, else national.
export const placeOf = (text) => {
  const p = placesIn(text);
  return p.includes('Texas') ? 'Texas' : (p[0] ?? 'national');
};

// ---------------------------------------------------------------- entities, topics, measures

// Rule and statute sections: "section 71112", "CMS-1234-F", "42 CFR 482.23", "P.L. 119-21".
export function sectionsIn(text) {
  const t = String(text ?? '');
  const out = [];
  for (const m of t.matchAll(/\b(?:section|sec\.)\s*(\d{3,6}[a-z]?)\b/gi)) out.push(`section ${m[1].toLowerCase()}`);
  for (const m of t.matchAll(/§\s*(\d{3,6}[a-z]?)\b/g)) out.push(`section ${m[1].toLowerCase()}`);
  for (const m of t.matchAll(/\bCMS-(\d{4})-([A-Z]{1,3})\b/gi)) out.push(`CMS-${m[1]}-${m[2].toUpperCase()}`);
  for (const m of t.matchAll(/\b(\d{1,2})\s*CFR\s*(\d+(?:\.\d+)?)/gi)) out.push(`${m[1]} CFR ${m[2]}`);
  for (const m of t.matchAll(/\bP\.?\s?L\.?\s?(\d{2,3})-(\d{1,3})\b/g)) out.push(`P.L. ${m[1]}-${m[2]}`);
  return [...new Set(out)];
}

// Programs and subjects, most specific first. A named rule section and a named hospital or union are
// added between them by entitiesIn.
const PROGRAMS = [
  ['Rural Health Transformation', /\brural health transformation\b|\brhtp\b|\brural health (fund|awards?)\b/],
  ['OPPS', /\bopps\b|\boutpatient prospective payment\b/],
  ['IPPS', /\bipps\b|\binpatient prospective payment\b/],
  ['Physician Fee Schedule', /\bphysician fee schedule\b/],
  ['PBJ', /\bpbj\b|\bpayroll[- ]based journal\b/],
  ['Conditions of Participation', /\bconditions of participation\b/],
];
const BROAD_PROGRAMS = [
  ['Medicaid', /\bmedicaid\b/],
  ['Medicare', /\bmedicare\b/],
  ['critical access hospital', /\bcritical access\b/],
  ['rural hospital', /\brural (hospitals?|health care|healthcare|facilit(y|ies))\b/],
];
const UNION = /\bnurses'? (unions?|association)\b|\bnational nurses united\b|\bunion nurses\b|\bnurses’ unions?\b/i;
// Words a named hospital never starts with.
const NOT_A_NAME = new Set(
  [
    'the',
    'a',
    'an',
    'rural',
    'community',
    'regional',
    'county',
    'general',
    'state',
    'urban',
    'local',
    'new',
    'small',
    'public',
    'private',
    'teaching',
    'critical',
    'access',
    'children’s',
    "children's",
    'texas',
    'hospital',
    'health',
    'how',
    'why',
    'what',
    'when',
    'will',
    'could',
    'at',
    'in',
    'for',
    'and',
    'of',
  ].concat(STATES.map((s) => s.toLowerCase()))
);
const HOSPITAL_NAME =
  /((?:[A-Z][\w'’.-]*)(?:\s+(?:and|&|of)\s+[A-Z][\w'’.-]*|\s+[A-Z][\w'’.-]*){0,4})\s+([Hh]ospital|[Mm]edical [Cc]enter|[Hh]ealth [Ss]ystem|Healthcare)\b/g;
const titleCase = (s) => s.replace(/(^|\s)([a-z])/g, (m, a, b) => `${a}${b.toUpperCase()}`);

// A named hospital or system ("Pinecrest Valley Hospital"), or null.
export function namedHospital(text) {
  for (const m of String(text ?? '').matchAll(HOSPITAL_NAME)) {
    const words = m[1].split(/\s+/);
    while (words.length && NOT_A_NAME.has(words[0].toLowerCase())) words.shift();
    // One spelling for one hospital: a curly apostrophe is a straight one, the suffix capitalized.
    if (words.length && !NOT_A_NAME.has(words[words.length - 1].toLowerCase()))
      return `${words.join(' ').replace(/’/g, "'")} ${titleCase(m[2])}`;
  }
  return null;
}

// Every entity a text names, most specific first.
export function entitiesIn(text) {
  const t = lower(text);
  const out = [];
  for (const [name, re] of PROGRAMS.slice(0, 1)) if (re.test(t)) out.push(name);
  out.push(...sectionsIn(text));
  for (const [name, re] of PROGRAMS.slice(1)) if (re.test(t)) out.push(name);
  const named = namedHospital(text);
  if (named) out.push(named);
  if (UNION.test(String(text ?? ''))) out.push('nurses union');
  for (const [name, re] of BROAD_PROGRAMS) if (re.test(t)) out.push(name);
  return out;
}

const TOPICS = [
  ['backlog', /\bbacklogs?\b/],
  ['expansion', /\bexpan(sion|d|ds|ded|ding)\b/],
  ['closure', /\bclos(ure|ures|ing|es)\b|\bshut(s|ting|ters|tered)?\b/],
  ['strike', /\bstrik(e|es|ing)\b|\bwalk ?outs?\b|\bwalk(s|ing)? off the job\b/],
  ['award', /\bawards?\b|\bawarded\b/],
  ['cut', /\bcuts?\b|\bcutting\b/],
  ['deadline', /\bdeadlines?\b/],
  ['ratio', /\bratios?\b/],
  ['work requirements', /\bwork (requirements?|rules)\b/],
  ['lawsuit', /\blawsuits?\b|\bsues\b|\bsued\b/],
  ['freeze', /\bfreez(e|es)\b|\bfrozen\b/],
  ['layoffs', /\blayoffs?\b/],
];

// The topic noun that comes first in the text, or null.
export function topicIn(text) {
  const t = lower(text);
  let best = null;
  for (const [name, re] of TOPICS) {
    const m = re.exec(t);
    if (m && (!best || m.index < best[1])) best = [name, m.index];
  }
  return best ? best[0] : null;
}

// What a story counts or reports. Each phrase has the wordings that mean it.
const MEASURES = [
  ['per resident', /\bper (rural )?(resident|person|capita)\b/],
  [
    'application backlog',
    /\b(applications?|enrollment|eligibility|medicaid|snap|renewals?)( and snap)?( application)? backlogs?\b|\bbacklogs? of (pending )?(applications|renewals)\b|\bpending (medicaid )?applications\b/,
  ],
  [
    'at risk of closure',
    /\bat[- ]risk\b|\bvulnerable to clos\w+|\b(fac\w+|risk of|threat of) closures?\b|\bcould close\b/,
  ],
  ['retroactive coverage', /\bretroactive (coverage|eligibility|medicaid)\b|\bback coverage\b/],
  [
    'operating losses',
    /\boperating (margins?|loss(es)?)\b|\b(hospital|financial) losses\b|\bin the red\b|\bbad debt\b|\bnegative margins?\b|\blos(e|es|ing) money\b/,
  ],
  ['staffing ratio', /\b(staffing|nurse[- ]to[- ]patient) ratios?\b/],
  ['turnover rate', /\bturnover rates?\b/],
  ['vacancy rate', /\bvacancy rates?\b/],
  ['work requirements', /\bwork (requirements?|rules)\b/],
  ['expansion', /\bexpan(sion|d|ds|ded|ding)\b/],
];

export const measuresIn = (text) => MEASURES.filter(([, re]) => re.test(lower(text))).map(([name]) => name);

// ---------------------------------------------------------------- numbers and dates

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
const MONTH_RE =
  '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?';
const DATE_RE = new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`, 'gi');
const monthOf = (s) => MONTHS.findIndex((m) => m.startsWith(s.toLowerCase().replace('.', '').slice(0, 3))) + 1;

// Every date a text gives as "January 1, 2027" or "Jan. 1" (this year's when no year is given).
export function datesIn(text, today) {
  const out = [];
  for (const m of String(text ?? '').matchAll(DATE_RE)) {
    const mo = monthOf(m[1]);
    const day = Number(m[2]);
    if (!mo || day < 1 || day > 31) continue;
    const year = m[3] ? Number(m[3]) : Number(String(today).slice(0, 4));
    out.push(`${year}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return out;
}

// The first date a text gives that is still ahead of today, or null.
export function upcomingDateIn(text, today) {
  return (
    datesIn(text, today)
      .filter((d) => d > today)
      .sort()[0] ?? null
  );
}

// The numbers a text reports, as written keys ("$70", "412118", "4.5%"), without dates, years and
// rule sections.
export function numbersIn(text) {
  let t = String(text ?? '').replace(DATE_RE, ' ');
  for (const re of [
    /\b(?:section|sec\.)\s*\d+[a-z]?\b/gi,
    /§\s*\d+/g,
    /\bCMS-\d{4}-[A-Z]+\b/gi,
    /\b\d{1,2}\s*CFR\s*\d+(?:\.\d+)?/gi,
    /\bP\.?\s?L\.?\s?\d{2,3}-\d{1,3}\b/g,
  ])
    t = t.replace(re, ' ');
  const out = [];
  for (const m of t.matchAll(/(\$)?(\d[\d,]*(?:\.\d+)?)\s?(%|percent\b|million\b|billion\b|[mbk]\b)?/gi)) {
    const digits = m[2].replace(/,/g, '').replace(/\.$/, '');
    if (!m[1] && !m[3] && /^(19|20)\d\d$/.test(digits)) continue;
    const unit = (m[3] ?? '').toLowerCase().replace('percent', '%');
    out.push(`${m[1] ?? ''}${digits}${unit === 'million' ? 'm' : unit === 'billion' ? 'b' : unit}`);
  }
  return [...new Set(out)];
}

// The facts that can date a story: its numbers (a lone digit such as "2 years" is not one) and rule
// sections.
export const mainFactsIn = (text) => [...numbersIn(text).filter((k) => !/^\d$/.test(k)), ...sectionsIn(text)];

// A number key as a person writes it: "237505" as "237,505", "$15m" as "$15 million".
export function showFact(key) {
  const m = /^(\$?)(\d+)(\.\d+)?(%|m|b|k)?$/.exec(String(key));
  if (!m) return String(key);
  const whole = m[2].length >= 4 ? Number(m[2]).toLocaleString('en-US') : m[2];
  const unit = { m: ' million', b: ' billion', k: ' thousand', '%': '%' }[m[4] ?? ''] ?? '';
  return `${m[1]}${whole}${m[3] ?? ''}${unit}`;
}

// A number specific enough that a page carrying it is carrying the same fact: four digits or more, or
// three with a decimal point. "$70" or "44" appear on pages by chance.
const significant = (key) => {
  const d = key.replace(/[^\d]/g, '');
  return d.length >= 4 || (d.length >= 3 && key.includes('.'));
};
export const significantNumbersIn = (text) => numbersIn(text).filter(significant);

// {entities, measures, numbers, sections, places}: the facts of a story's text.
export function factsOf(text) {
  return {
    entities: entitiesIn(text),
    measures: measuresIn(text),
    numbers: numbersIn(text),
    sections: sectionsIn(text),
    places: placesIn(text),
  };
}

// The facts of one of our pages (or the facts dossier), compact enough to keep in the local snapshot:
// {pairs: ["entity|measure"], tx: ["entity|measure"], numbers, sections}. A pair counts only when the
// entity and the measure sit in the same paragraph or list line; tx holds the pairs whose paragraph
// names Texas. Link addresses are left out (an address is not what the page says).
export function pageFacts(markdown) {
  const text = String(markdown ?? '')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const pairs = new Set();
  const tx = new Set();
  const units = text.split(/\n\s*\n/).flatMap((b) => b.split(/\n(?=\s*(?:[-*]|\d+\.)\s)/));
  for (const u of units) {
    const ents = entitiesIn(u);
    const meas = measuresIn(u);
    if (!ents.length || !meas.length) continue;
    const texas = /\btexas\b/i.test(u);
    for (const e of ents)
      for (const m of meas) {
        if (e === m) continue;
        pairs.add(`${e}|${m}`);
        if (texas) tx.add(`${e}|${m}`);
      }
  }
  return {
    pairs: [...pairs].sort(),
    tx: [...tx].sort(),
    numbers: significantNumbersIn(text).sort(),
    sections: sectionsIn(text).sort(),
  };
}

// ---------------------------------------------------------------- rule 1: the subject key

// The reader's question for a results page check, from the subject key ("texas medicaid backlog
// hospital"); the headline's first words when the key has nothing. Always editable on the card.
function queryOf(parts, text) {
  let words = parts.join(' ').toLowerCase();
  if (!words)
    words = lower(text)
      .replace(/[^a-z0-9$ ]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8)
      .join(' ');
  if (!/\b(hospitals?|nurs\w*)\b/.test(words)) words = `${words} hospital`;
  return words.replace(/\s+/g, ' ').trim();
}

// {place, entity, topic, key, text, query}. key is null unless a main entity and a topic are found:
// stories join on a key only when all three parts match.
export function subjectOf(text) {
  const place = placeOf(text);
  const entity = entitiesIn(text)[0] ?? null;
  const topic = topicIn(text);
  // A named hospital is its own place: one headline names its state and the next does not.
  const named = entity && entity === namedHospital(text);
  const key = entity && topic ? `${named ? 'named' : place}|${entity}|${topic}` : null;
  const parts = [place === 'national' ? null : place, entity, topic].filter(Boolean);
  return {
    place,
    entity,
    topic,
    key,
    text: parts.length ? parts.join(', ') : null,
    query: queryOf(parts, text),
  };
}

// ---------------------------------------------------------------- rule 2: reports, not reprints

const SYNDICATED = [
  /\b(?:originally|first) (?:published|appeared|ran) (?:by|in|on|at)\s+(?:the\s+)?([A-Z][\w&'’-]*(?:\s+[A-Z][\w&'’-]*){0,4})/,
  /\brepublished (?:from|with permission (?:from|of))\s+(?:the\s+)?([A-Z][\w&'’-]*(?:\s+[A-Z][\w&'’-]*){0,4})/i,
];

// The outlet a description says the story came from, or null.
export function syndicatedFrom(description) {
  for (const re of SYNDICATED) {
    const m = re.exec(String(description ?? ''));
    if (m) return m[1].replace(/[.,;:]+$/, '').trim();
  }
  return null;
}

const normTitle = (s) =>
  lower(s)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const firstSentence = (s) => normTitle(String(s ?? '').split(/(?<=[.!?])\s/)[0]);

// {reports, reprints, source, text, units}. One item per outlet; copies are joined when a description
// says where the story was first published (and that outlet's own item joins them as the original),
// when the headline is the same word for word, or when the description's first sentence is. A unit is
// one report; every item in it but the original is a reprint.
export function reportsOf(items) {
  const byOutlet = new Map();
  for (const it of items ?? []) {
    const k = lower(it.publisher || it.name || it.link);
    if (!byOutlet.has(k)) byOutlet.set(k, it);
  }
  const list = [...byOutlet.values()].map((it) => ({
    it,
    from: syndicatedFrom(it.description),
    title: normTitle(it.title),
    first: it.description ? firstSentence(it.description) : '',
    pub: lower(it.publisher || it.name),
  }));
  const parent = list.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const join = (a, b) => (parent[find(b)] = find(a));
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (
        (a.from && b.from && lower(a.from) === lower(b.from)) ||
        (a.from && lower(a.from) === b.pub) ||
        (b.from && lower(b.from) === a.pub) ||
        (a.title.length >= 20 && a.title === b.title) ||
        (a.first.length >= 40 && a.first === b.first)
      )
        join(i, j);
    }
  const groups = new Map();
  list.forEach((x, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), x]));
  const units = [...groups.values()].map((g) => {
    g.sort((a, b) => String(a.it.date).localeCompare(String(b.it.date)));
    const from = g.find((x) => x.from)?.from ?? null;
    const original = (from && g.find((x) => x.pub === lower(from))) || (from ? null : g[0]);
    const source = from ?? (original?.it.publisher || original?.it.name || null);
    return {
      source,
      items: g.map((x) => x.it),
      original: original?.it ?? null,
      reprints: g.length - (original ? 1 : 0),
      date: g[0].it.date ?? null,
    };
  });
  const reprints = units.reduce((s, u) => s + u.reprints, 0);
  const withCopies = units.filter((u) => u.reprints > 0).sort((a, b) => b.reprints - a.reprints);
  const source = withCopies[0]?.source ?? null;
  const text = `${plural(units.length, 'report', 'reports')}${
    reprints ? `, ${plural(reprints, 'reprint', 'reprints')}, ${withCopies.length > 1 ? 'most ' : ''}of ${source}` : ''
  }`;
  return { reports: units.length, reprints, source, text, units };
}

// ---------------------------------------------------------------- rule 4: freshness

// {freshness, why, factDate, upcoming}. A new main fact (a number or a rule section in the card's own
// title and description, else the one its reports carry most) in the last 7 days scores 3 from one
// report, 4 from two and 5 from three or more; an older one 2. A dated
// change still ahead keeps a story at 4 (5 when its fact is also new). A story with no fact of its own
// is a spike: 2 (3 from three reports) for two days, then 1.
export function freshnessOf({ lead, items, reports, today, firstDate, latestDate }) {
  const factsIn = (it) => new Set(mainFactsIn(`${it.title ?? ''} ${it.description ?? ''}`));
  let facts = mainFactsIn(lead);
  // A lead with no number of its own ("Lawmakers demand action on the backlog") takes the fact its
  // reports carry most often, the earliest on a tie.
  if (!facts.length) {
    const seen = new Map();
    for (const it of [...(items ?? [])].sort((a, b) => String(a.date).localeCompare(String(b.date))))
      for (const x of factsIn(it)) seen.set(x, (seen.get(x) ?? 0) + 1);
    const top = [...seen.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top) facts = [top[0]];
  }
  const carries = (it) => {
    const have = factsIn(it);
    return facts.some((x) => have.has(x));
  };
  const dated = (items ?? [])
    .filter((it) => it.date && carries(it))
    .map((it) => it.date)
    .sort();
  const factDate = facts.length ? (dated[0] ?? firstDate) : null;
  const upcoming = upcomingDateIn([lead, ...(items ?? []).map((it) => it.title ?? '')].join(' . '), today);
  const age = factDate ? daysBetween(factDate, today) : null;
  const many = reports >= 3;
  const shown = facts.slice(0, 2).map(showFact).join(', ');
  if (upcoming) {
    const recent = age !== null && age <= 7;
    return {
      freshness: recent ? 5 : 4,
      why: `A dated change is still ahead: ${longDate(upcoming)} ${upcoming.slice(0, 4)}.${
        recent ? ` Its main fact (${shown}) first ran on ${longDate(factDate)}.` : ''
      }`,
      factDate,
      upcoming,
    };
  }
  if (factDate) {
    if (age <= 7)
      return {
        freshness: many ? 5 : reports === 2 ? 4 : 3,
        why: `Its main fact (${shown}) first ran on ${longDate(factDate)}, within the last 7 days, in ${plural(reports, 'report', 'reports')}.`,
        factDate,
        upcoming: null,
      };
    return {
      freshness: 2,
      why: `Its main fact (${shown}) first ran on ${longDate(factDate)}, more than 7 days ago.`,
      factDate,
      upcoming: null,
    };
  }
  const latestAge = latestDate ? daysBetween(latestDate, today) : 99;
  return {
    freshness: latestAge <= 2 ? (many ? 3 : 2) : 1,
    why: `No new number or rule in it, so it fades fast: the latest report ran on ${latestDate ? longDate(latestDate) : 'an unknown date'}.`,
    factDate: null,
    upcoming: null,
  };
}

// ---------------------------------------------------------------- rule 3: the hard filters

export const FILTERS = {
  a: 'Applies to a Critical Access Hospital',
  b: 'Not already covered',
  c: 'A Texas angle exists',
  d: 'A quotable primary source can exist',
  e: 'Enough reporting, or a dated change ahead',
};

// The one-report bar (filter e): a story only one outlet reported, with no dated change ahead, is not rising
// yet. A Texas story about rural hospitals or critical access is let through on one report.
export const ONE_REPORT_REASON =
  'Only one outlet reported it and it names no dated change ahead, so it is not rising yet. It comes back if more outlets report it.';

const PAYMENT_RULES = /\bopps\b|\bipps\b|\b(out|in)patient prospective payment\b|\bphysician fee schedule\b/;
// Medicare's 340B payment cut is an OPPS rate, and Critical Access Hospitals are paid on cost.
const MEDICARE_340B = (t) => /\b340b\b/.test(t) && /\b(medicare|payments?|cuts?|reimburs\w*)\b/.test(t);
const MEDICARE_340B_REASON =
  "It is about Medicare's 340B payment rate, which is set under OPPS. Critical Access Hospitals are paid on cost, so this does not reach our reader.";
// Medicare-funded residency slots go to teaching hospitals; Critical Access Hospitals rarely train residents.
// School nurses work for school districts, not hospitals.
const SCHOOL_NURSE =
  /\bschool nurses?\b|\bnurse at (your|their|a) (child'?s|kid'?s) school\b|\bno nurse at\b[^.]*\bschool\b/;
const SCHOOL_NURSE_REASON = 'It is about school nurses, not a hospital, so this does not reach our reader.';
// A story with no US state and no federal signal may not be about the US at all (Mindanao) or names only a
// city (Kenosha): either way there is no Texas angle to write.
const FEDERAL =
  /\b(cms|hhs|federal|congress|senate|congressional|medicare|medicaid|nationwide|national|across the country|countrywide|u\.?s\.?|united states|america'?s?|american|states|trump|biden|white house|kff|aha|hrsa|bls|nsi|opps|ipps|340b|critical access|conditions of participation|physician fee schedule)\b/;
const NO_PLACE_REASON =
  'It names no US state and no federal rule or program, so it may not be about Texas or the US at all: there is no Texas angle to write.';
const RESIDENCY = /\bresidency (slots?|positions?)\b|\bgraduate medical education\b|\bgme\b/;
const RESIDENCY_REASON =
  "It is about teaching hospitals' residency slots. Critical Access Hospitals rarely train residents, so this does not reach our reader.";
const NURSING_HOMES =
  /\bnursing (homes?|facilit(y|ies))\b|\bskilled nursing\b|\bsnfs?\b|\bpbj\b|\bpayroll[- ]based journal\b|\blong[- ]term care facilit/;
export const CAH_REASON =
  'Critical Access Hospitals are paid on cost and are exempt from OPPS and IPPS, so this does not reach our reader.';
const NURSING_HOME_REASON =
  'It is about nursing homes or skilled nursing facilities, not a Critical Access Hospital, so this does not reach our reader.';

// Labor news whose terms are not public: a contract still in talks, or a tentative deal.
const LABOR =
  /\b(unable|fail(s|ed)?) to (come to|reach) (an |a )?(agreement|deal)\b|\btentative (agreement|deal|contract)\b|\breach(es|ed)? (a )?(tentative )?(deal|agreement)\b|\bcontract (talks|negotiations?|fight|deal|agreement)\b|\bbargaining\b|\bnegotiat\w+|\b(open-ended|planned|potential|looming) ([\w'’]+ ){0,3}strike\b|\bstrike (looms|vote|notice|averted)\b|\bavert(s|ed|ing)? (a |an )?(open-ended |indefinite )?strike\b/;
const PUBLISHED_TERMS =
  /\bratif(y|ies|ied)\b|\bterms (include|released|published|of the (new )?contract)\b|\d+(\.\d+)?% raises?\b/;
const LABOR_REASON =
  'A labor contract still in talks, or a tentative deal whose terms are not public: there is nothing to quote yet.';

// Outlets whose stories sit behind a paywall. A story only these ran has no source a reader can check.
// Kept in one list so it is easy to change.
export const PAYWALLED = [
  'The Wall Street Journal',
  'The New York Times',
  'The Washington Post',
  'Bloomberg',
  'Financial Times',
  'The Boston Globe',
  'Modern Healthcare',
  'STAT+',
  'Houston Chronicle',
  'The Dallas Morning News',
  'Politico Pro',
  'Axios Pro',
];
const PAYWALL_KEYS = new Set(PAYWALLED.map((s) => normTitle(s).replace(/^the /, '')));
const isPaywalled = (name) => PAYWALL_KEYS.has(normTitle(name).replace(/^the /, ''));

export const PRIMARY_TO_CHECK =
  'Primary source: to check (the statute, the Federal Register, state data or a published report).';

const reason = (filter, text, covered = false) => ({ filter, name: FILTERS[filter], text, covered });

// What one page shares with the story's facts: {pairs, numbers, sections, score}.
function sharedWith(facts, pf, { texas = false } = {}) {
  const pairsOn = new Set(texas ? (pf?.tx ?? []) : (pf?.pairs ?? []));
  const pairs = [];
  for (const e of facts.entities) for (const m of facts.measures) if (pairsOn.has(`${e}|${m}`)) pairs.push([e, m]);
  const nums = new Set(pf?.numbers ?? []);
  const secs = new Set(pf?.sections ?? []);
  const numbers = facts.numbers.filter(significant).filter((x) => nums.has(x));
  const sections = facts.sections.filter((x) => secs.has(x));
  return { pairs, numbers, sections, score: pairs.length + 2 * (numbers.length + sections.length) };
}

const whatOf = (s) =>
  [
    ...s.sections,
    ...s.numbers.map((x) => `the number ${showFact(x)}`),
    ...s.pairs.slice(0, 1).map(([e, m]) => `${e} and ${m}`),
  ].join(', ');

// The best page for a test: the most shared facts, then the page whose own title or address names the
// shared measure (two) or entity (one), then the newest.
function bestPage(pages, test) {
  let best = null;
  for (const p of pages ?? []) {
    if (!p?.facts) continue;
    const s0 = test(p.facts);
    if (!s0.score) continue;
    const own = `${p.title ?? ''} ${slugWords(p.page)}`;
    const ownM = new Set(measuresIn(own));
    const ownE = new Set(entitiesIn(own));
    const boost = s0.pairs.some(([, m]) => ownM.has(m)) ? 2 : s0.pairs.some(([e]) => ownE.has(e)) ? 1 : 0;
    const s = { ...s0, score: s0.score * 10 + boost };
    if (
      !best ||
      s.score > best.s.score ||
      (s.score === best.s.score && String(p.publishDate) > String(best.p.publishDate))
    )
      best = { p, s };
  }
  return best;
}

// {passed, group, reasons, update, primary}. group: 'pass' (it may be suggested), 'update' (an existing
// page of ours already carries it: update that page, with the edit date from the one eligibility
// function, holdOf) or 'filtered'. Each reason: {filter, name, text, covered}.
//   card    a story card (title, description, outlets)
//   have    {pages: [{page, kind, title, publishDate, facts}], dossier: facts or null, holdOf(page)}
export function hardFilters(
  card,
  { pages = [], dossier = null, holdOf = () => ({ eligible: true }), today = null } = {}
) {
  const lead = `${card.title ?? ''} ${card.description ?? ''}`;
  const all = [lead, ...(card.outlets ?? []).map((o) => o.title ?? '')].join(' . ');
  const facts = factsOf(lead);
  const reasons = [];
  let cover = null;

  // a. Applies to a Critical Access Hospital.
  if (!/\bcritical access\b/i.test(all)) {
    if (PAYMENT_RULES.test(lower(lead))) reasons.push(reason('a', CAH_REASON));
    else if (MEDICARE_340B(lower(lead))) reasons.push(reason('a', MEDICARE_340B_REASON));
    else if (RESIDENCY.test(lower(lead))) reasons.push(reason('a', RESIDENCY_REASON));
    else if (SCHOOL_NURSE.test(lower(lead))) reasons.push(reason('a', SCHOOL_NURSE_REASON));
    else if (NURSING_HOMES.test(lower(lead))) reasons.push(reason('a', NURSING_HOME_REASON));
  }

  // b. Not already covered.
  const onPage = bestPage(pages, (pf) => sharedWith(facts, pf));
  if (onPage) {
    cover = onPage.p.page;
    reasons.push(
      reason(
        'b',
        `Already covered: ${onPage.p.page} already carries ${whatOf(onPage.s)}. A new piece would compete with our own page.`,
        true
      )
    );
  } else if (dossier) {
    const s = sharedWith(facts, dossier);
    if (s.score)
      reasons.push(
        reason(
          'b',
          `Already covered: the facts dossier (docs/seo/facts-dossier.md) already holds ${whatOf(s)}, so it is not new to us.`,
          true
        )
      );
  }

  // c. A Texas angle exists. National stories pass when they carry a federal signal.
  const places = facts.places;
  // A story with no US state and no federal signal is told last, after the more specific reasons.
  const noPlace = !places.length && !FEDERAL.test(lower(all));
  if (places.length && !places.includes('Texas')) {
    const named = places.slice(0, 3).join(' and ');
    const tx = bestPage(pages, (pf) => sharedWith({ ...facts, numbers: [], sections: [] }, pf, { texas: true }));
    const txDossier = dossier && sharedWith({ ...facts, numbers: [], sections: [] }, dossier, { texas: true }).score;
    if (tx) {
      cover = cover ?? tx.p.page;
      reasons.push(
        reason(
          'c',
          `It names ${named}, not Texas. Our Texas version is already live: ${tx.p.page} carries the Texas figure for ${tx.s.pairs[0][1]}.`,
          true
        )
      );
    } else if (txDossier) {
      reasons.push(
        reason(
          'c',
          `It names ${named}, not Texas. The facts dossier holds the Texas figure for ${facts.measures[0]}, so it is not new to us.`,
          true
        )
      );
    } else {
      reasons.push(
        reason(
          'c',
          `It names ${named} and not Texas, and neither our pages nor the facts dossier hold a Texas figure for ${
            facts.measures[0] ?? 'what it reports'
          }, so there is no Texas angle to write.`
        )
      );
    }
  }

  // d. A quotable primary source can exist.
  if (LABOR.test(lower(all)) && !PUBLISHED_TERMS.test(lower(all))) reasons.push(reason('d', LABOR_REASON));
  else {
    const names = (card.outlets ?? []).map((o) => o.name).filter(Boolean);
    if (names.length && names.every(isPaywalled))
      reasons.push(
        reason(
          'd',
          `Every outlet that ran it is behind a paywall (${names.join(', ')}), so there is no source a reader could check.`
        )
      );
  }

  // e. Enough reporting, or a dated change ahead (skipped when the card does not say how many reported it).
  const reported = card.reports?.reports ?? null;
  if (reported !== null && reported < 2 && !reasons.length && !noPlace) {
    const texasRural = facts.places.includes('Texas') && /\b(rural|critical access)\b/i.test(all);
    const dated = today ? Boolean(upcomingDateIn(all, today)) : false;
    if (!texasRural && !dated) reasons.push(reason('e', ONE_REPORT_REASON));
  }

  if (noPlace && !reasons.some((r) => r.filter === 'c')) reasons.push(reason('c', NO_PLACE_REASON));

  let update = null;
  if (cover) {
    const hold = holdOf(cover) ?? { eligible: true };
    update = {
      page: cover,
      eligibleFrom: hold.eligible ? null : (hold.from ?? null),
      // The eligibility function's own words when it gives them ("Leave it until 9 December").
      text: `Update an existing page: ${cover}. ${
        hold.text
          ? `${hold.text}.`
          : hold.eligible || !hold.from
            ? 'It can be edited now.'
            : `Can be edited from ${longDate(hold.from)}.`
      }`,
    };
  }
  const group = !reasons.length ? 'pass' : update && reasons.every((r) => r.covered) ? 'update' : 'filtered';
  return { passed: !reasons.length, group, reasons, update, primary: reasons.length ? null : PRIMARY_TO_CHECK };
}

// ---------------------------------------------------------------- rule 5: repetition

export const REPEAT_DAYS = 45;
export const REPEAT_PENALTY = 4;
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];
const slugWords = (page) =>
  String(page ?? '')
    .split('/')
    .pop()
    .replace(/-/g, ' ');

// {count, penalty, text, pieces}: our posts and articles of the last 45 days on the same place and
// main entity as the story, newest first. A person judges whether the angle differs.
export function repetitionOf(subject, { content = [], today }) {
  if (!subject?.entity) return { count: 0, penalty: 0, text: null, pieces: [] };
  const pieces = (content ?? [])
    .filter((c) => c.publishDate && c.publishDate <= today && daysBetween(c.publishDate, today) <= REPEAT_DAYS)
    .filter((c) => {
      const s = subjectOf(`${c.title ?? ''} ${slugWords(c.page)}`);
      return s.place === subject.place && s.entity === subject.entity;
    })
    .sort((a, b) => String(b.publishDate).localeCompare(String(a.publishDate)))
    .map((c) => ({ page: c.page, publishDate: c.publishDate }));
  if (!pieces.length) return { count: 0, penalty: 0, text: null, pieces: [] };
  const where = subject.place === 'national' ? '' : `${subject.place} `;
  return {
    count: pieces.length,
    penalty: pieces.length * REPEAT_PENALTY,
    text: `${ORDINALS[pieces.length] ?? `${pieces.length + 1}th`} ${where}${subject.entity} piece in six weeks: ${pieces
      .map((p) => `${p.page} (${longDate(p.publishDate)})`)
      .join(', ')}.`,
    pieces,
  };
}
