#!/usr/bin/env node
/**
 * llm-citation-check.mjs — repeatable LLM-visibility check (DataForSEO REST v3).
 *
 * Runs three checks and prints a dated block ready to paste into
 * docs/seo/llm-citation-log.md:
 *   1. Mentions dataset: is simplescheduleai.com mentioned in tracked ChatGPT answers?
 *   2. Citation gap: top cited domains for our money keywords.
 *   3. (--probes only) Live engine probes for the buyer prompts below.
 *      Probes cost real money (~$0.12 each on gpt-5.5); they never run by default.
 *
 * Credentials: env DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD, else parsed from the
 * local UNTRACKED .mcp.json. Never commit credentials.
 *
 * Usage: npm run llm-citations              (checks 1+2, no spend beyond mentions endpoints)
 *        npm run llm-citations -- --probes  (also runs the live probes)
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const KEYWORDS = ['nurse scheduling software', 'hospital staffing software'];
const PROBES = [
  'What is the best nurse scheduling software for a small critical access hospital in Texas?',
  'What are good QGenda alternatives for a 25-bed rural hospital?',
  'Can AI build a compliant nurse schedule for a critical access hospital?',
];
const PROBE_MODEL = { llm_type: 'chat_gpt', model_name: 'gpt-5.5' };

function creds() {
  if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
    return { login: process.env.DATAFORSEO_LOGIN, password: process.env.DATAFORSEO_PASSWORD };
  }
  const p = join(ROOT, '.mcp.json');
  if (existsSync(p)) {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    const s = JSON.stringify(raw);
    const login = s.match(/"DATAFORSEO_(?:USERNAME|LOGIN)"\s*:\s*"([^"]+)"/)?.[1];
    const password = s.match(/"DATAFORSEO_PASSWORD"\s*:\s*"([^"]+)"/)?.[1];
    if (login && password) return { login, password };
  }
  console.error('No DataForSEO credentials (env DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD or .mcp.json).');
  process.exit(1);
}

const { login, password } = creds();
const AUTH = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

async function dfs(path, payload) {
  const res = await fetch(`https://api.dataforseo.com/v3/${path}`, {
    method: 'POST',
    headers: { authorization: AUTH, 'content-type': 'application/json' },
    body: JSON.stringify([payload]),
    signal: AbortSignal.timeout(120000),
  });
  const json = await res.json();
  const task = json.tasks?.[0];
  if (!task || task.status_code >= 40000) {
    throw new Error(`${path}: ${task?.status_message || json.status_message || res.status}`);
  }
  return task.result;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function run() {
  const withProbes = process.argv.includes('--probes');
  console.log(`\n## ${today()} — llm-citation-check\n`);

  // 1. Own-domain mentions
  try {
    const r = await dfs('ai_optimization/llm_mentions/search/live', {
      target: [{ domain: 'simplescheduleai.com' }],
      platform: 'chat_gpt',
      limit: 10,
    });
    const items = r?.[0]?.items ?? r?.items ?? [];
    console.log(
      `### Mentions dataset: simplescheduleai.com -> ${items.length === 0 ? '**0 mentions**' : `${items.length} item groups (inspect!)`}\n`
    );
    if (items.length) console.log('```json\n' + JSON.stringify(items, null, 1).slice(0, 3000) + '\n```\n');
  } catch (e) {
    console.log(`### Mentions dataset: ERROR ${e.message}\n`);
  }

  // 2. Citation gap per keyword
  for (const kw of KEYWORDS) {
    try {
      const r = await dfs('ai_optimization/llm_mentions/top_domains/live', {
        target: [{ keyword: kw, match_type: 'partial_match' }],
        platform: 'chat_gpt',
        links_scope: 'sources',
        items_list_limit: 10,
      });
      const total = r?.[0]?.total ?? r?.[0]?.items?.[0]?.total ?? {};
      const src = (total.sources_domain ?? []).map((d) => `${d.key} (${d.mentions})`).join(', ');
      const serp = (total.search_results_domain ?? []).map((d) => `${d.key} (${d.mentions})`).join(', ');
      console.log(
        `### Citation gap — "${kw}"\n- sources: ${src || 'none tracked'}\n- search results: ${serp || 'none tracked'}\n`
      );
    } catch (e) {
      console.log(`### Citation gap — "${kw}": ERROR ${e.message}\n`);
    }
  }

  // 3. Live probes (opt-in)
  if (!withProbes) {
    console.log('(live probes skipped — pass -- --probes to run them; ~$0.12 each)');
    return;
  }
  for (const prompt of PROBES) {
    try {
      const r = await dfs('ai_optimization/chat_gpt/llm_responses/live', {
        ...PROBE_MODEL,
        user_prompt: prompt,
        web_search: true,
      });
      const item = r?.[0]?.items?.find((i) => i.type === 'message') ?? r?.[0]?.items?.at(-1);
      const text = item?.sections?.map((s) => s.text).join('\n') ?? '';
      const cites = (item?.sections ?? []).flatMap((s) => s.annotations ?? []).map((a) => a.url);
      const mentioned = /simplescheduleai/i.test(text) || cites.some((u) => /simplescheduleai/i.test(u));
      console.log(`### Probe: "${prompt}"`);
      console.log(`- model ${r?.[0]?.model_name}, ${r?.[0]?.datetime}, $${r?.[0]?.money_spent?.toFixed(3)}`);
      console.log(`- SimpleScheduleAI mentioned: ${mentioned ? '**YES**' : 'no'}`);
      console.log(`- citations: ${cites.join(' · ') || 'none'}`);
      if (mentioned) {
        const idx = text.toLowerCase().indexOf('simpleschedule');
        console.log(`- context: ...${text.slice(Math.max(0, idx - 120), idx + 240).replace(/\n/g, ' ')}...`);
      }
      console.log('');
    } catch (e) {
      console.log(`### Probe ERROR: ${e.message}\n`);
    }
  }
  console.log('Paste the relevant block into docs/seo/llm-citation-log.md (verbatim quotes, dated).');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
