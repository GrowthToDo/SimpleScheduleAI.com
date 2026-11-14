import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

// AI visibility by kind of question. Everything is synthetic: invented questions and invented
// competitor names, a temp data folder and a temp repo folder. No network.

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-desk-aivis-'));
const DATA = path.join(root, 'data');
const REPO = path.join(root, 'repo');
fs.mkdirSync(path.join(DATA, 'snap'), { recursive: true });
fs.mkdirSync(path.join(DATA, 'state'), { recursive: true });
fs.mkdirSync(path.join(REPO, 'docs/seo'), { recursive: true });
process.env.SEO_DESK_DATA = DATA;
process.env.SEO_DESK_REPO = REPO;
process.env.SEO_DESK_TODAY = '2026-11-10';

const { classifyQuestion, visibility, MIN_CHECKS, competitorNamesFrom } = await import('../lib/ai-visibility.mjs');
const { createServer } = await import('../server.mjs');
const { invalidate } = await import('../lib/api/model.mjs');

after(() => fs.rmSync(root, { recursive: true, force: true }));

const BRANDS = ['simplescheduleai', 'simple schedule ai'];
const COMPETITORS = ['Rotawise', 'Shiftly Health', 'plan-it'];
const cfg = { brands: BRANDS, competitors: COMPETITORS, today: '2026-11-10' };

// ---------------------------------------------------------------- classifyQuestion

test('classifyQuestion: a question that names us is a brand question', () => {
  assert.equal(classifyQuestion('is SimpleScheduleAI any good?', cfg), 'brand');
  assert.equal(classifyQuestion('what does Simple Schedule AI cost', cfg), 'brand');
  assert.equal(classifyQuestion('simplescheduleai vs rotawise', cfg), 'brand', 'naming us comes first');
});

test('classifyQuestion: alternatives, comparisons and competitor names', () => {
  assert.equal(classifyQuestion('rotawise alternatives for small hospitals', cfg), 'alternatives');
  assert.equal(classifyQuestion('Shiftly Health vs a spreadsheet', cfg), 'alternatives');
  assert.equal(classifyQuestion('shift software versus paper rota', cfg), 'alternatives');
  assert.equal(
    classifyQuestion('how does auto scheduling compare with manual, compared to a clipboard', cfg),
    'alternatives'
  );
  assert.equal(classifyQuestion('is rotawise free?', cfg), 'alternatives', 'a competitor name alone counts');
  assert.equal(classifyQuestion('what is plan-it pricing', cfg), 'alternatives', 'a name with a hyphen');
  assert.equal(classifyQuestion('is there an alternative to paper rotas', cfg), 'alternatives');
});

test('classifyQuestion: a competitor name matches only as a whole word or phrase', () => {
  const c = { competitors: ['rotawise', 'smart square'] };
  assert.equal(classifyQuestion('myrotawise login help', c), 'other');
  assert.equal(classifyQuestion('rotawisedom pricing', c), 'other');
  assert.equal(classifyQuestion('how does smartsquare work', c), 'other');
  assert.equal(classifyQuestion('how does smart squared work', c), 'other');
  assert.equal(classifyQuestion('how does Smart Square work?', c), 'alternatives');
  assert.equal(classifyQuestion('rotawise, pricing?', c), 'alternatives');
});

test('classifyQuestion: the kind of product without a brand is a category question', () => {
  assert.equal(classifyQuestion('best nurse scheduling software for a small hospital', cfg), 'category');
  assert.equal(classifyQuestion('nursing roster software', cfg), 'category');
  assert.equal(classifyQuestion('nurse staff scheduling', cfg), 'category');
  assert.equal(classifyQuestion('free scheduling tool for clinics', cfg), 'category');
});

test('classifyQuestion: everything else is other, and empty input never throws', () => {
  assert.equal(classifyQuestion('what is the q shift in nursing?', cfg), 'other');
  assert.equal(classifyQuestion('what is the 2 3 2 schedule for nurses?', cfg), 'other');
  assert.equal(classifyQuestion('do nurses work 3 days on 4 days off?', cfg), 'other');
  assert.equal(classifyQuestion('', cfg), 'other');
  assert.equal(classifyQuestion(null, cfg), 'other');
  assert.equal(classifyQuestion('anything', {}), 'other');
  assert.equal(classifyQuestion('vsphere training', cfg), 'other', 'vs must be a whole word');
});

test('competitorNamesFrom turns hosts into names, drops the ones that are too short and ignores our own', () => {
  const names = competitorNamesFrom(
    ['www.rotawise.com', 'shiftly.health', 'x.io', 'https://www.plan-it.example/about'],
    {
      own: ['simplescheduleai.com'],
    }
  );
  assert.deepEqual(names.sort(), ['plan-it', 'rotawise', 'shiftly']);
  assert.deepEqual(
    competitorNamesFrom(['simplescheduleai.com', 'www.simplescheduleai.com'], { own: ['simplescheduleai'] }),
    []
  );
});

// ---------------------------------------------------------------- visibility

const own = (platform, question, citedUrls = []) => ({
  kind: 'own-mention',
  platform,
  question,
  location: 1,
  citedUrls,
  lastResponseAt: '2026-10-20',
});
const kw = (platform, keyword, ourPresent, competitors = []) => ({
  keyword,
  platform,
  ourPresent,
  ourRank: ourPresent ? 2 : null,
  topSources: [['www.example-one.test', 3]],
  competitors,
});

const SAMPLE = [
  {
    date: '2026-10-01',
    engines: ['chat_gpt', 'google'],
    rows: [own('chat_gpt', 'old question about rotas'), kw('chat_gpt', 'old keyword', false)],
  },
  {
    date: '2026-11-01',
    engines: ['chat_gpt', 'google'],
    rows: [
      own('chat_gpt', 'is SimpleScheduleAI good for a small hospital', ['https://simplescheduleai.com/blog/a']),
      own('chat_gpt', 'simplescheduleai pricing'),
      own('google', 'what does simple schedule ai do'),
      own('chat_gpt', 'rotawise alternatives', ['https://simplescheduleai.com/blog/b']),
      own('google', 'rotawise vs plan-it'),
      own('chat_gpt', 'is rotawise free'),
      kw('google', 'nurse scheduling software', false, [['www.rotawise.com', 3]]),
      kw('chat_gpt', 'nurse scheduling software', true),
      kw('google', 'hospital shift software', false),
      own('chat_gpt', 'what is the q shift in nursing'),
      own('google', 'what is a 2 3 2 schedule'),
      kw('google', 'shiftly alternatives', false, [['shiftly.health', 2]]),
    ],
  },
];

test('visibility counts listed answers and keyword checks apart, by kind of question', () => {
  const v = visibility(SAMPLE, cfg);
  assert.deepEqual(
    v.byKind.map((k) => k.kind),
    ['brand', 'alternatives', 'category', 'other']
  );
  const by = Object.fromEntries(v.byKind.map((k) => [k.kind, k]));
  // brand: three listed answers, one of them with a link to a page of ours; no keyword checks
  assert.equal(by.brand.listed, 3);
  assert.equal(by.brand.listedLinked, 1);
  assert.equal(by.brand.listedText, 'We were named in 3 answers the check listed.');
  assert.equal(by.brand.keywordChecked, 0);
  assert.equal(by.brand.keywordEnough, false);
  assert.equal(by.brand.keywordText, 'Not enough data yet.');
  // alternatives: three listed answers and one keyword check (under the minimum)
  assert.equal(by.alternatives.listed, 3);
  assert.equal(by.alternatives.keywordChecked, 1);
  assert.equal(by.alternatives.keywordNamed, null);
  assert.equal(by.alternatives.keywordCited, null);
  // category: three keyword checks, one of them naming us and linking to us; nothing listed
  assert.equal(by.category.listed, 0);
  assert.equal(by.category.listedText, 'The check listed no answers that named us.');
  assert.equal(by.category.keywordChecked, 3);
  assert.equal(by.category.keywordEnough, true);
  assert.equal(by.category.keywordNamed, 1);
  assert.equal(by.category.keywordCited, 1);
  assert.equal(by.category.keywordText, 'Named us in at least 1 of 3 keyword checks; linked to us in at least 1.');
  // other: two listed answers
  assert.equal(by.other.listed, 2);
  assert.equal(MIN_CHECKS, 3);
  assert.equal(
    visibility([{ date: '2026-11-02', rows: [own('chat_gpt', 'a rota question')] }], cfg).byKind[3].listedText,
    'We were named in 1 answer the check listed.'
  );
});

test('a listed answer never sits in a ratio: no field pairs listed answers with a total', () => {
  const v = visibility(SAMPLE, cfg);
  for (const row of [...v.byKind, ...v.byAssistant]) {
    assert.equal(row.checked, undefined);
    assert.equal(row.named, undefined);
    assert.equal(row.cited, undefined);
    assert.doesNotMatch(row.listedText, /\bof\b/);
  }
  const text = JSON.stringify(v);
  assert.doesNotMatch(text, /10 of 10|named us in at least \d+ of \d+ answers/i);
});

test('visibility counts by assistant with the same split, the same gate and plain assistant names', () => {
  const v = visibility(SAMPLE, cfg);
  const by = Object.fromEntries(v.byAssistant.map((a) => [a.platform, a]));
  assert.equal(by.chat_gpt.assistant, 'ChatGPT');
  assert.equal(by.google.assistant, 'Google AI answers');
  assert.equal(by.chat_gpt.listed, 5);
  assert.equal(by.chat_gpt.listedLinked, 2);
  assert.equal(by.chat_gpt.keywordChecked, 1);
  assert.equal(by.chat_gpt.keywordEnough, false);
  assert.equal(by.chat_gpt.keywordNamed, null);
  assert.equal(by.google.listed, 3);
  assert.equal(by.google.listedLinked, 0);
  assert.equal(by.google.keywordChecked, 3);
  assert.equal(by.google.keywordEnough, true);
  assert.equal(by.google.keywordNamed, 0);
  assert.equal(by.google.keywordCited, 0);
  assert.equal(by.google.keywordText, 'Named us in at least 0 of 3 keyword checks; linked to us in at least 0.');
  assert.equal(v.byAssistant[0].platform, 'chat_gpt', 'most checks first');
  const small = visibility([{ date: '2026-11-02', rows: [own('perplexity', 'a'), kw('perplexity', 'b', true)] }], cfg);
  assert.equal(small.byAssistant[0].assistant, 'Perplexity');
  assert.equal(small.byAssistant[0].keywordEnough, false);
  assert.equal(small.byAssistant[0].keywordNamed, null);
  assert.match(small.byAssistant[0].text, /not enough data yet/i);
});

test('visibility reports the last check, the floor note, and never states a cause', () => {
  const v = visibility(SAMPLE, cfg);
  assert.deepEqual(v.lastCheck, { date: '2026-11-01', dateText: '1 November', daysAgo: 9 });
  assert.match(v.note, /at most 10 answers per assistant/);
  assert.match(v.note, /not enough data yet/i);
  assert.doesNotMatch(JSON.stringify(v), /[–—]/);
  assert.doesNotMatch(JSON.stringify(v), /\b(because|due to|caused|so that)\b/i);
});

test('visibility reads the newest line even when the file is out of order, and a repeated date keeps the last line', () => {
  const lines = [
    { date: '2026-11-01', rows: [own('chat_gpt', 'first copy of the day')] },
    { date: '2026-10-01', rows: [own('chat_gpt', 'much older'), own('chat_gpt', 'much older two')] },
    { date: '2026-11-01', rows: [own('chat_gpt', 'second copy a'), own('chat_gpt', 'second copy b')] },
  ];
  const v = visibility(lines, cfg);
  assert.equal(v.lastCheck.date, '2026-11-01');
  assert.equal(
    v.byKind.reduce((s, k) => s + k.listed, 0),
    2
  );
});

test('visibility with no data lists every kind with nothing counted', () => {
  for (const input of [
    [],
    null,
    undefined,
    [{ date: '2026-11-01' }],
    [{ date: '2026-11-01', rows: [{ x: 1 }, null] }],
  ]) {
    const v = visibility(input, cfg);
    assert.equal(v.byKind.length, 4);
    assert.ok(
      v.byKind.every(
        (k) => k.listed === 0 && k.keywordChecked === 0 && k.keywordEnough === false && k.keywordNamed === null
      )
    );
    assert.deepEqual(v.byAssistant, []);
  }
  assert.equal(visibility([], cfg).lastCheck, null);
  assert.equal(visibility([{ date: '2026-11-01' }], cfg).lastCheck.date, '2026-11-01');
});

test('competitor names in the keyword rows join the names the caller supplies', () => {
  const lines = [
    {
      date: '2026-11-01',
      rows: [
        kw('google', 'x', false, [['www.zorbaplan.com', 2]]),
        own('chat_gpt', 'is zorbaplan worth it'),
        own('chat_gpt', 'zorbaplan pricing'),
        own('chat_gpt', 'zorbaplan login'),
      ],
    },
  ];
  const v = visibility(lines, { brands: BRANDS, competitors: [], today: '2026-11-10' });
  assert.equal(v.byKind.find((k) => k.kind === 'alternatives').listed, 3);
});

// ---------------------------------------------------------------- the route

let server;
let port;
before(async () => {
  server = createServer({ autoRefresh: false, staticDir: root });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
});
after(async () => {
  await new Promise((r) => server.close(r));
});

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port, path: url }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode, text, json: JSON.parse(text) });
        });
      })
      .on('error', reject);
  });
}

test('GET /api/ai-visibility with nothing checked yet answers 200 and says it is empty', async () => {
  invalidate();
  const r = await get('/api/ai-visibility');
  assert.equal(r.status, 200);
  assert.equal(r.json.empty, true);
  assert.equal(r.json.byKind.length, 4);
  assert.deepEqual(r.json.byAssistant, []);
  assert.equal(r.json.lastCheck, null);
  assert.ok(Array.isArray(r.json.sources));
});

test('GET /api/ai-visibility reads the saved check, the brand terms and the watched competitors', async () => {
  fs.writeFileSync(
    path.join(REPO, 'docs/seo/brand-terms.json'),
    JSON.stringify(['simplescheduleai', 'rotawise', 'tcp', 'plan-it'])
  );
  fs.writeFileSync(
    path.join(DATA, 'snap/local.json'),
    JSON.stringify({
      source: 'local',
      ok: true,
      status: 'fresh',
      pulledAt: '2026-11-09T06:00:00.000Z',
      through: '2026-11-09',
      data: {
        aeo: SAMPLE,
        competitors: {
          sitemap: [{ host: 'www.zorbaplan.com', status: 'baseline' }],
          watch: [{ url: 'https://www.shiftly.health/pricing', fetchedAt: '2026-11-08', changes: [] }],
          lastRun: '2026-11-08',
        },
      },
    })
  );
  invalidate();
  const r = await get('/api/ai-visibility');
  assert.equal(r.status, 200);
  assert.equal(r.json.empty, false);
  const by = Object.fromEntries(r.json.byKind.map((k) => [k.kind, k]));
  assert.equal(by.brand.listed, 3);
  assert.equal(by.alternatives.listed + by.alternatives.keywordChecked, 4);
  assert.equal(by.category.keywordChecked, 3);
  assert.equal(by.other.listed, 2);
  assert.equal(r.json.lastCheck.date, '2026-11-01');
  assert.ok(r.json.through !== undefined && Array.isArray(r.json.sources));
  assert.doesNotMatch(r.text, /[–—]/);
});
