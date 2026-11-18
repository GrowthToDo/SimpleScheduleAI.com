#!/usr/bin/env node
/**
 * llm-citation-check.mjs — repeatable AEO snapshot, upstream half (DataForSEO REST v3).
 *
 * "Upstream" = whether AI engines actually MENTION/CITE us and who wins the citation
 * instead. This is the signal that matters pre-launch (GA4 AI-referral clicks are still
 * ~0). The downstream half (did a citation drive a click) — a GA4 AI-referral pull —
 * is not built yet; it needs a GA4 property id + read-only credentials.
 *
 * Each run:
 *   1. Own-domain mentions — is simplescheduleai.com in the tracked LLM-mention dataset,
 *      per engine?
 *   2. Citation gap + competitor displacement — for each money keyword, the top cited
 *      domains per engine, whether WE appear, and which known competitors appear instead.
 *   3. Appends a machine-readable snapshot line to docs/seo/aeo-trend.jsonl (for charting
 *      movement over time) and prints a human block for docs/seo/llm-citation-log.md.
 *   4. (--probes only) Live multi-engine probes for the buyer prompts below. Probes cost
 *      real money (~$0.12 each); they never run by default.
 *
 * Credentials: env DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD, else parsed from the
 * local UNTRACKED .mcp.json. Never commit credentials.
 *
 * Usage:
 *   npm run llm-citations                 checks 1-3 on the mentions dataset (chat_gpt + google AIO)
 *   npm run llm-citations -- --probes     also runs the live multi-engine probes (spend)
 *   npm run llm-citations -- --eval       ONLY the evaluation (perception) probes, ~$1.08;
 *                                         full answers go to docs/seo/llm-evaluation-log.md
 *   npm run llm-citations -- --eval --dry-run   list the prompts and flags, no spend
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREND_FILE = join(ROOT, 'docs', 'seo', 'aeo-trend.jsonl');

// Money keywords for the citation-gap view. Kept to head terms: the mentions
// dataset only returns domains for higher-volume phrases (long-tail CAH terms
// come back "none tracked"), and each lookup costs ~$0.10 — no point paying for
// empty results. The CAH-specific signal lives in the live probes instead.
const KEYWORDS = [
  'nurse scheduling software',
  'hospital staffing software',
  'ai nurse scheduling',
  'qgenda alternatives',
];

const OWN = 'simplescheduleai.com';

// Known competitors (domain -> label) for the displacement view. Sourced from
// docs/seo/competitor-dossier.md; m7health.com and cronshift.com are the flagged
// active AEO competitors, schedulingwiz.com surfaced in Perplexity's answer.
const COMPETITORS = {
  'm7health.com': 'M7 Health',
  'cronshift.com': 'CronShift',
  'qgenda.com': 'QGenda',
  'shiftwizard.com': 'ShiftWizard',
  'symplr.com': 'symplr Smart Square',
  'schedulingwiz.com': 'Scheduling Wizard',
  'deputy.com': 'Deputy',
  'aladtec.com': 'Aladtec',
  'nursegrid.com': 'NurseGrid',
  'wheniwork.com': 'When I Work',
  'smartlinx.com': 'SmartLinx',
  'amion.com': 'AMiON',
};

// The LLM-mentions DATASET only covers these two platforms (verified via the
// endpoint's platform enum, 2026-07-18). 'google' = Google AI Overviews, where
// we are currently featured #1 — worth tracking distinctly from ChatGPT.
const DATASET_PLATFORMS = ['chat_gpt', 'google'];

// Live probe engines (opt-in, real spend) — a SEPARATE endpoint that does support
// perplexity/gemini/claude. Model names verified via
// ai_optimization/<engine>/llm_responses/models on 2026-07-18.
const PROBE_ENGINES = [
  { se: 'chat_gpt', model_name: 'gpt-5.5' },
  { se: 'perplexity', model_name: 'sonar-pro' },
  { se: 'gemini', model_name: 'gemini-2.5-flash' },
];
const PROBES = [
  'What is the best nurse scheduling software for a small critical access hospital in Texas?',
  'What are good QGenda alternatives for a 25-bed rural hospital?',
  'Can AI build a compliant nurse schedule for a critical access hospital?',
];

// Evaluation probes (added 2026-11-18, from George Chasiotis's MicroConf Europe 2026
// talk). The PROBES above are "topical": they measure whether we are named. These
// ask an engine to evaluate us on one buyer criterion, which shows PERCEPTION: does
// the answer describe SimpleScheduleAI the way the product and service really work?
// Template: "Evaluate <brand> on its ability to <criterion> <desired outcome>."
// Ground truth to judge against: docs/seo/positioning-registry.md (service vs product
// columns) and docs/seo/product-capability-inventory-2026-08.md §6 (notable absences).
const EVAL_PROBES = [
  'Evaluate SimpleScheduleAI on its ability to build a monthly nurse schedule for a 25-bed critical access hospital that keeps nurses under 40 hours a week and spreads nights and weekends fairly.',
  'Evaluate SimpleScheduleAI on its ability to help a small rural hospital fill a shift when a nurse calls out at 3 a.m.',
  'Evaluate SimpleScheduleAI on its pricing and setup for a small critical access hospital with no IT department: what does it cost, and how long until the first schedule?',
];

// Claims an answer might make that are WRONG about us (inventory §6, memory rules).
// A hit is a flag for a human to read in context, not a verdict: "does not offer
// credential tracking" also matches.
const PERCEPTION_FLAGS = [
  [/credential|licen[cs]e (expir|track|renew)/i, 'credential or licence tracking (we have none, inventory §6.5)'],
  [
    /\b(epic|cerner|meditech|kronos|ukg|workday|adp|paycom)\b|ehr integration|payroll integration/i,
    'an integration (none exist, §6.1-2)',
  ],
  [/mobile app|ios app|android app|app store|google play/i, 'a native mobile app (none, §6.8)'],
  [
    /self[- ]schedul|shift bidding|claim open shifts|bid on shifts/i,
    'nurse self-scheduling or bidding (none, §6.9 and §6.15)',
  ],
  [/\b(sms|text message|texts? (the )?nurses)\b/i, 'SMS notifications (in-app only, §6.10)'],
  [/time ?clock|timesheet|punch(es)? in/i, 'time clock or actual hours (scheduled hours only, §6.3)'],
  [/free trial|free pilot|pilot program/i, 'a free trial or pilot (retired; demo only)'],
  [/\b(used by|trusted by|customers report|clients report|case stud)/i, 'customers or results (pre-launch, none)'],
  [/travel nurs/i, 'travel-nurse management (none, §6.6)'],
  [/physician|provider scheduling|\bMDs?\b/i, 'physician scheduling (nursing only, §6.7)'],
  [
    /\$\s?\d[\d,.]*/,
    'a price: check it is $1,000/$1,500 flat (service) or $10 per user per month (product), never mixed',
  ],
  [
    /not (familiar|aware)|no (reliable |specific )?information|could not find|couldn't find|unable to find/i,
    'the engine does not know us (visibility gap, not a perception gap)',
  ],
];
const EVAL_LOG = join(ROOT, 'docs', 'seo', 'llm-evaluation-log.md');

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

let SPEND = 0;

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
  SPEND += task.cost || 0;
  return task.result;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Normalise a top_domains result into a flat [domain, mentions] list.
function domainRows(result, field) {
  const total = result?.[0]?.total ?? result?.[0]?.items?.[0]?.total ?? {};
  return (total[field] ?? []).map((d) => [String(d.key), Number(d.mentions) || 0]);
}

async function probe(eng, prompt) {
  const r = await dfs(`ai_optimization/${eng.se}/llm_responses/live`, {
    model_name: eng.model_name,
    user_prompt: prompt,
    web_search: true,
  });
  const item = r?.[0]?.items?.find((i) => i.type === 'message') ?? r?.[0]?.items?.at(-1);
  const text = item?.sections?.map((s) => s.text).join('\n') ?? '';
  const cites = (item?.sections ?? []).flatMap((s) => s.annotations ?? []).map((a) => a.url);
  return { r, text, cites };
}

// Evaluation probes only (no dataset pulls). Prints a summary and appends every full
// answer to docs/seo/llm-evaluation-log.md, because perception is judged by reading.
async function runEval({ dryRun }) {
  const runs = PROBE_ENGINES.length * EVAL_PROBES.length;
  console.log(`\n## ${today()} — AI perception check (evaluation prompts)\n`);
  console.log(
    `${EVAL_PROBES.length} prompts x ${PROBE_ENGINES.length} engines = ${runs} probes (~$${(runs * 0.12).toFixed(2)})\n`
  );
  if (dryRun) {
    for (const p of EVAL_PROBES) console.log(`- ${p}`);
    console.log(`\nFlags checked: ${PERCEPTION_FLAGS.map(([, why]) => why).join('; ')}`);
    console.log('\n(--dry-run: nothing sent, nothing spent)');
    return;
  }
  const log = [`\n## ${today()} — evaluation prompts\n`];
  for (const prompt of EVAL_PROBES) {
    log.push(`### "${prompt}"\n`);
    for (const eng of PROBE_ENGINES) {
      try {
        const { r, text, cites } = await probe(eng, prompt);
        const hits = PERCEPTION_FLAGS.filter(([re]) => re.test(text)).map(([, why]) => why);
        const ownCited = cites.filter((u) => /simplescheduleai/i.test(u));
        console.log(`#### ${eng.se} (${eng.model_name}) — "${prompt.slice(0, 70)}..."`);
        console.log(`- $${(r?.[0]?.money_spent ?? 0).toFixed(3)} · our pages cited: ${ownCited.length}`);
        console.log(`- check in context: ${hits.length ? hits.join('; ') : 'no flags'}\n`);
        log.push(`#### ${eng.se} (${eng.model_name})\n`);
        log.push(`- Our pages cited: ${ownCited.join(' · ') || 'none'}`);
        log.push(`- Other citations: ${cites.filter((u) => !/simplescheduleai/i.test(u)).join(' · ') || 'none'}`);
        log.push(`- Flags to check in context: ${hits.length ? hits.join('; ') : 'none'}`);
        log.push(`- Verdict (fill in by hand): accurate / gap: ...\n`);
        log.push(
          text
            .split('\n')
            .map((l) => `> ${l}`)
            .join('\n') + '\n'
        );
      } catch (e) {
        console.log(`#### ${eng.se} (${eng.model_name}) — ERROR ${e.message}\n`);
        log.push(`#### ${eng.se} (${eng.model_name}): ERROR ${e.message}\n`);
      }
    }
  }
  appendFileSync(EVAL_LOG, log.join('\n') + '\n');
  console.log(`Full answers appended -> docs/seo/llm-evaluation-log.md (fill in each Verdict line)`);
  console.log(`Total spend this run: $${SPEND.toFixed(3)}`);
}

async function run() {
  if (process.argv.includes('--eval')) return runEval({ dryRun: process.argv.includes('--dry-run') });
  const withProbes = process.argv.includes('--probes');
  const platforms = DATASET_PLATFORMS;

  console.log(`\n## ${today()} — AEO snapshot (upstream / LLM mentions)\n`);
  console.log(`Dataset engines: ${platforms.join(', ')} (chat_gpt = ChatGPT, google = Google AI Overviews)\n`);

  const snapshot = { date: today(), engines: platforms, rows: [] };

  // 1. Own-domain mentions per engine — surface the question, which of OUR URLs
  // is cited, and when. A cited URL that now 404s is a citation leaking to a dead
  // page; the script flags each cited path so that's visible at a glance.
  console.log('### Own-domain mentions — simplescheduleai.com\n');
  for (const platform of platforms) {
    try {
      const r = await dfs('ai_optimization/llm_mentions/search/live', {
        target: [{ domain: OWN }],
        platform,
        limit: 10,
      });
      const items = r?.[0]?.items ?? r?.items ?? [];
      if (items.length === 0) {
        console.log(`- **${platform}**: 0 mentions`);
        continue;
      }
      console.log(`- **${platform}**: ${items.length} answer(s) citing us`);
      for (const it of items) {
        const ourUrls = [
          ...new Set((it.sources ?? []).filter((s) => (s.domain || '').includes(OWN)).map((s) => s.url)),
        ];
        const loc = it.location_code === 2840 ? 'US' : `loc ${it.location_code}`;
        console.log(
          `  - "${it.question}" (${loc}, vol ${it.ai_search_volume ?? '?'}, last ${String(it.last_response_at).slice(0, 10)})`
        );
        for (const u of ourUrls) console.log(`      cited: ${u}`);
        snapshot.rows.push({
          kind: 'own-mention',
          platform,
          question: it.question,
          location: it.location_code,
          citedUrls: ourUrls,
          lastResponseAt: String(it.last_response_at).slice(0, 10),
        });
      }
    } catch (e) {
      console.log(`- **${platform}**: ERROR ${e.message}`);
    }
  }
  console.log('');

  // 2. Citation gap + competitor displacement per keyword (chat_gpt dataset —
  // google top_domains returns nothing, so we don't pay for it here).
  console.log('### Citation gap + competitor displacement (chat_gpt dataset)\n');
  for (const kw of KEYWORDS) {
    try {
      const r = await dfs('ai_optimization/llm_mentions/top_domains/live', {
        target: [{ keyword: kw, match_type: 'partial_match' }],
        platform: 'chat_gpt',
        links_scope: 'sources',
        items_list_limit: 10,
      });
      const sources = domainRows(r, 'sources_domain');
      const ourRank = sources.findIndex(([d]) => d.includes(OWN));
      const ourPresent = ourRank >= 0;
      const comps = sources
        .filter(([d]) => Object.keys(COMPETITORS).some((c) => d.includes(c)))
        .map(([d, m]) => {
          const key = Object.keys(COMPETITORS).find((c) => d.includes(c));
          return { label: COMPETITORS[key], domain: d, mentions: m };
        });
      const top3 = sources
        .slice(0, 3)
        .map(([d, m]) => `${d} (${m})`)
        .join(', ');
      console.log(
        `- **"${kw}"**: us=${ourPresent ? `#${ourRank + 1}` : 'ABSENT'}` +
          ` · top: ${top3 || 'none tracked'}` +
          ` · competitors: ${comps.length ? comps.map((c) => `${c.label} (${c.mentions})`).join(', ') : 'none'}`
      );
      snapshot.rows.push({
        keyword: kw,
        platform: 'chat_gpt',
        ourPresent,
        ourRank: ourPresent ? ourRank + 1 : null,
        topSources: sources.slice(0, 5),
        competitors: comps.map((c) => [c.domain, c.mentions]),
      });
    } catch (e) {
      console.log(`- **"${kw}"**: ERROR ${e.message}`);
    }
  }
  console.log('');

  // 3. Append machine-readable trend line
  try {
    appendFileSync(TREND_FILE, JSON.stringify(snapshot) + '\n');
    console.log(`Trend line appended -> docs/seo/aeo-trend.jsonl`);
  } catch (e) {
    console.log(`(could not append trend line: ${e.message})`);
  }
  console.log(`Dataset spend this run: $${SPEND.toFixed(3)}\n`);

  // 4. Live probes (opt-in, real spend)
  if (!withProbes) {
    console.log('(live probes skipped — pass -- --probes to run them; ~$0.12 each, multiple engines)');
    return;
  }
  console.log('### Live multi-engine probes\n');
  for (const eng of PROBE_ENGINES) {
    for (const prompt of PROBES) {
      try {
        const { r, text, cites } = await probe(eng, prompt);
        const mentioned = /simplescheduleai/i.test(text) || cites.some((u) => /simplescheduleai/i.test(u));
        console.log(`#### ${eng.se} (${eng.model_name}) — "${prompt}"`);
        console.log(`- ${r?.[0]?.datetime ?? ''} · $${(r?.[0]?.money_spent ?? 0).toFixed(3)}`);
        console.log(`- SimpleScheduleAI mentioned: ${mentioned ? '**YES**' : 'no'}`);
        console.log(`- citations: ${cites.join(' · ') || 'none'}`);
        if (mentioned) {
          const idx = text.toLowerCase().indexOf('simpleschedule');
          console.log(`- context: ...${text.slice(Math.max(0, idx - 120), idx + 240).replace(/\n/g, ' ')}...`);
        }
        console.log('');
      } catch (e) {
        console.log(`#### ${eng.se} (${eng.model_name}) — "${prompt}": ERROR ${e.message}\n`);
      }
    }
  }
  console.log(`Total spend this run (dataset + probes): $${SPEND.toFixed(3)}`);
  console.log('Paste the relevant blocks into docs/seo/llm-citation-log.md (verbatim quotes, dated).');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
