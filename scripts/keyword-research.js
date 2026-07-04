// scripts/keyword-research.js
// Usage: node scripts/keyword-research.js "seed1,seed2,seed3"
// Reads: .env.local (DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD)
// Writes: docs/keywords/keywords-YYYY-MM-DD.csv

const path = require('path');
const fs = require('fs');
const https = require('https');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const k = line.slice(0, eqIdx).trim();
      const v = line.slice(eqIdx + 1).trim();
      if (k && !process.env[k]) process.env[k] = v;
    }
  }
}

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!LOGIN || !PASSWORD) {
  console.error('Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to .env.local');
  process.exit(1);
}

const AUTH = Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');

function dfsPost(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'api.dataforseo.com',
        path: endpoint,
        method: 'POST',
        headers: {
          Authorization: `Basic ${AUTH}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.status_code && parsed.status_code !== 20000) {
              reject(new Error(`DataForSEO error ${parsed.status_code}: ${parsed.status_message}`));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`Parse error: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getKeywordIdeas(seeds) {
  const body = seeds.map((seed) => ({
    keyword: seed,
    language_code: 'en',
    location_code: 2840,
    limit: 30,
  }));
  const res = await dfsPost('/v3/dataforseo_labs/google/keyword_ideas/live', body);
  const seen = new Set(seeds);
  const keywords = [...seeds];
  for (const task of res.tasks || []) {
    for (const item of task.result?.[0]?.items || []) {
      if (!seen.has(item.keyword)) {
        seen.add(item.keyword);
        keywords.push(item.keyword);
      }
    }
  }
  return keywords;
}

async function getVolumes(keywords) {
  const results = {};
  for (let i = 0; i < keywords.length; i += 1000) {
    const res = await dfsPost('/v3/keywords_data/google_ads/search_volume/live', [
      { keywords: keywords.slice(i, i + 1000), language_code: 'en', location_code: 2840 },
    ]);
    for (const task of res.tasks || [])
      for (const item of task.result || []) results[item.keyword] = item.search_volume ?? 0;
  }
  return results;
}

async function getDifficulty(keywords) {
  const results = {};
  for (let i = 0; i < keywords.length; i += 1000) {
    const res = await dfsPost('/v3/dataforseo_labs/google/bulk_keyword_difficulty/live', [
      { keywords: keywords.slice(i, i + 1000), language_code: 'en', location_code: 2840 },
    ]);
    for (const task of res.tasks || [])
      for (const item of task.result || []) results[item.keyword] = item.keyword_difficulty ?? null;
  }
  return results;
}

async function getIntent(keywords) {
  const results = {};
  for (let i = 0; i < keywords.length; i += 1000) {
    const res = await dfsPost('/v3/dataforseo_labs/google/search_intent/live', [
      { keywords: keywords.slice(i, i + 1000), language_code: 'en', location_code: 2840 },
    ]);
    for (const task of res.tasks || [])
      for (const item of task.result || []) results[item.keyword] = item.search_intent ?? 'unknown';
  }
  return results;
}

async function getTop3DR(keywords) {
  const results = {};
  for (const kw of keywords) {
    const res = await dfsPost('/v3/serp/google/organic/live/advanced', [
      { keyword: kw, language_code: 'en', location_code: 2840, depth: 3 },
    ]);
    const items = (res.tasks?.[0]?.result?.[0]?.items || []).filter((i) => i.type === 'organic').slice(0, 3);
    results[kw] = items.length ? Math.round(items.reduce((s, i) => s + (i.domain_rank ?? 0), 0) / items.length) : null;
    await sleep(300);
  }
  return results;
}

function classifyBucket(intent) {
  const i = (intent || '').toLowerCase();
  if (i.includes('commercial') || i.includes('transactional')) return 'Solution';
  if (i.includes('navigational')) return 'Brand';
  return 'Problem';
}

async function main() {
  const seedArg = process.argv[2] || 'nurse scheduling,critical access hospital scheduling,nurse scheduling software';
  const seeds = seedArg
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Seeds: ${seeds.join(', ')}`);
  process.stdout.write('Fetching keyword ideas... ');
  const keywords = await getKeywordIdeas(seeds);
  console.log(`${keywords.length} found`);

  process.stdout.write('Fetching volumes + difficulty + intent... ');
  const [volumes, difficulty, intent] = await Promise.all([
    getVolumes(keywords),
    getDifficulty(keywords),
    getIntent(keywords),
  ]);
  console.log('done');

  const worthFetching = keywords.filter((k) => (volumes[k] ?? 0) > 10);
  console.log(`Fetching SERP top-3 DR for ${worthFetching.length} keywords (volume > 10)...`);
  const top3DR = await getTop3DR(worthFetching);

  const rows = keywords.map((kw) => ({
    keyword: kw,
    volume: volumes[kw] ?? 0,
    difficulty: difficulty[kw] ?? '',
    intent: intent[kw] ?? 'unknown',
    bucket: classifyBucket(intent[kw]),
    avg_top3_dr: top3DR[kw] ?? '',
    winnable: (volumes[kw] ?? 0) > 50 && top3DR[kw] != null && top3DR[kw] < 50,
  }));

  rows.sort((a, b) => Number(b.winnable) - Number(a.winnable) || b.volume - a.volume);

  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), 'docs', 'keywords');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `keywords-${date}.csv`);

  const lines = [
    'keyword,volume,difficulty,intent,bucket,avg_top3_dr,winnable',
    ...rows.map(
      (r) =>
        `"${r.keyword.replace(/"/g, '""')}",${r.volume},${r.difficulty},"${r.intent}","${r.bucket}",${r.avg_top3_dr},${r.winnable}`
    ),
  ];
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  const winnable = rows.filter((r) => r.winnable).length;
  console.log(`\nSaved ${rows.length} keywords → ${path.relative(process.cwd(), outPath)}`);
  console.log(`Winnable (vol>50 & avg_top3_dr<50): ${winnable}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
