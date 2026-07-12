# LLM Citation Log

Dated, verifiable record of SimpleScheduleAI's visibility in AI answer engines, plus the
citation-gap picture (which domains LLMs cite for our money queries). Feeds: the weekly
citation check, mention-outreach targeting (plan items 7/8), and the /proof-of-work
AI-visibility section.

How to re-run: `npm run llm-citations` (DataForSEO REST; needs `DATAFORSEO_LOGIN` /
`DATAFORSEO_PASSWORD` env vars, or reads local untracked `.mcp.json`). Live probes cost
about $0.12 each on gpt-5.5; the script only runs probes with `-- --probes`. The same
checks can be run interactively through the DataForSEO MCP tools
(`ai_opt_llm_ment_search`, `ai_opt_llm_ment_top_domains`, `ai_optimization_llm_response`).

Honesty rules: log verbatim what the engine said, with model, date, and prompt. A single
probe is one sample, not a rank claim — never write "ChatGPT recommends us" from one
response. Mentions-dataset zeros get logged too.

---

## 2026-07-12 — baseline

### Mentions dataset (ChatGPT platform, DataForSEO llm_mentions)

- `simplescheduleai.com` mentions in tracked ChatGPT answers: **0** (empty result set).
  Honest baseline; the dataset tracks a sample of prompts, not all traffic.

### Citation gap — who ChatGPT cites for "nurse scheduling software" prompts (partial match, US/en)

14 tracked mentions, ai_search_volume 235.

| Cited as SOURCE (in answers) | Mentions |
| ---------------------------- | -------- |
| snapschedule.com             | 8        |
| shiftboard.com               | 8        |
| reddit.com                   | 8        |
| healthstream.com             | 8        |
| workforce.com                | 7        |

| In SEARCH RESULTS the engine saw | Mentions |
| -------------------------------- | -------- |
| f6s.com                          | 11       |
| vivian.com                       | 8        |
| varshealth.com                   | 8        |
| totalmed.com                     | 8        |
| picktime.com                     | 7        |

Also present: getapp.com, capterra.com, carepatron.com, clickup.com, solguruz.com,
worldmetrics.org. Brand entities in tracked answers: UKG Dimensions, ShiftWizard,
ShiftMed, ShiftKey, QGenda.

Implication: aggregators/directories (f6s, Capterra, GetApp) and vendor blogs earn the
citations; Reddit is a first-class source. Supports the directories (item 7) and
third-party-mentions (item 8) plans.

### Live probe #1 — ChatGPT

- Prompt: "What is the best nurse scheduling software for a small critical access hospital in Texas?"
- Model: gpt-5.5 (resolved gpt-5.5-2026-04-23), web_search: true, via DataForSEO
- Datetime: 2026-07-12 16:01 UTC · cost $0.12
- **Result: SimpleScheduleAI NAMED and CITED.** Verbatim: 'Best "small CAH-specific"
  emerging option: **SimpleScheduleAI** — worth evaluating if you want a managed/AI-assisted
  service for Texas CAHs, but it appears newer and should be vetted carefully because
  public review history is limited.' Included in the 5-vendor shortlist and the comparison
  table ("Texas CAHs wanting managed scheduling help · CAH-specific positioning, low
  internal admin burden · Newer; verify references, security, integrations, contract terms").
- Cited source: https://simplescheduleai.com/nurse-scheduling-software (with utm_source=openai)
- Other citations in the answer: klasresearch.com (Best in KLAS 2025), dshs.texas.gov
  (2024 Hospital Nurse Staffing Survey: Rural and CAHs).
- Engine's fan-out queries included: "CMS critical access hospital conditions of
  participation nursing staff 485.635" and "Texas Health and Safety Code chapter 257
  nurse staffing committee hospital" — both squarely inside our content universe.
- Note: the engine echoed our own comparison page's honesty note ("newer service with
  limited public reviews") back as its caveat. Honest limitations get quoted; they read
  as credibility, not weakness.
