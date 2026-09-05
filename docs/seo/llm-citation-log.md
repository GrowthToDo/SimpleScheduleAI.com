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

## 2026-07-13 — multi-engine browser probes (same prompt)

Prompt (all engines): "What is the best nurse scheduling software for a small critical access hospital in Texas?" Run live via browser (Playwright).

- **Google AI Overview — FEATURED #1 + CITED.** Named SimpleScheduleAI the first of three picks, cited simplescheduleai.com. Verbatim: "Best AI-Native Service (Managed): SimpleScheduleAI is purpose-built for Texas Critical Access Hospitals. It eliminates complex self-serve software setups by acting as an AI service that handles scheduling, callouts, and Texas compliance audit trails automatically." Aladtec (2nd), ShiftWizard (3rd). Screenshot saved this session. ADDED to /proof-of-work.
- **Perplexity — NOT featured.** Recommended ShiftWizard (1st), Deputy, and "Scheduling Wizard" (schedulingwiz.com). Notable: it surfaced the managed-service CONCEPT but attributed it to schedulingwiz.com, not us — a positioning gap to close. Cited only schedulingwiz.com. NOT added to the public box (founder rule: only feature engines where we appear). Re-probe monthly.
- **Bing Copilot — NOT featured** (probed by founder after clearing a human-verification CAPTCHA). Verbatim: "the best nurse scheduling software options are Thrive, When I Work, and ShiftWizard. Thrive excels at compliance and audit readiness, When I Work is highly user-friendly for shift swaps and communication, and ShiftWizard offers strong automation for recurring shifts." No SimpleScheduleAI. NOT added to the public box (founder rule). Notable gap: Copilot grounds on the Bing index where we rank #1-2 organically for this query, yet its generated answer picked other vendors — organic rank does not guarantee the citation. Re-probe monthly.
- **Bing organic (not an AI answer):** we hold organic position 1 for this exact query ("Best Nurse Scheduling Software for Critical Access Hospitals (2026)") — already covered in the proof-of-work Bing table, logged here for completeness.

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

## 2026-07-22 — live multi-engine probes (DataForSEO, post top-up)

Fresh read (dataset was stale at 07-12; these are live-query answers). **6 of 9 mentions across 3 engines**, up sharply from July: Perplexity went 0 -> 3/3.

**Prompts:** (1) best nurse scheduling software for a small CAH in Texas; (2) good QGenda alternatives for a 25-bed rural hospital; (3) can AI build a compliant nurse schedule for a CAH.

- **ChatGPT gpt-5.5 — 1/3.** Prompt 1 YES: named "Best fit: SimpleScheduleAI" for a small CAH in Texas, cited /blog/best-nurse-scheduling-software-critical-access-hospitals (utm_source=openai). Prompts 2, 3: not named.
- **Perplexity sonar-pro — 3/3 (breakthrough; was NOT featured on 2026-07-13).** Prompt 1: named SimpleScheduleAI + Aladtec as "the most specialized options" for a CAH in Texas, cited 4 URLs (/nurse-scheduling-software, /blog, /blog/best-nurse-scheduling-software-texas, /blog/nursegrid-alternatives). Prompt 2 YES: cited /blog/qgenda-alternatives. Prompt 3 YES.
- **Gemini 2.5-flash — 2/3.** Prompts 1 and 2 YES; prompt 3 no.

**Read:** the comparison/alternatives blog posts (best-for-CAH, best-texas, qgenda-alternatives, nursegrid-alternatives) are the workhorses getting cited across engines. Retrieval-layer visibility is strong and improving; parametric (training) layer still blocked (Common Crawl 0 pages, Cloudflare AI-crawler block pending). Run cost: dataset $0.607 + 9 probes ~$1.0.

## 2026-09-05 — dataset re-run plus AI Overview and web-mention checks (Ahrefs opportunity review)

Triggered by the founder asking which Ahrefs "Opportunities" rows apply to us. Dataset lookups only, no live probes. `npm run llm-citations` spend $0.613; DataForSEO SERP checks $0.022; content-analysis search ~$0.10 estimated (the MCP AI-mode responses strip the `cost` field).

### Own-domain mentions (unchanged in kind since the 2026-09-01 audit)

- **ChatGPT: 3 answers**, same three as 2026-09-01 ("what is the q shift in nursing?", "what is shiftwizard?", "do nurses work 3 or 4 12-hour shifts?").
- **Google AI Overviews: 6 answers**, down from 7 on 2026-09-01. The four "free nurse scheduling software" variants (vol 40 each) still cite `/blog/free-nurse-scheduling-software`; "nurse staff scheduling" (vol 110) still cites the pillar; "scheduling app for nurses" (vol 50) still cites `/blog/best-nurse-scheduling-app`. **Dropped: "staff scheduling software healthcare" (vol 50).** One sample; do not read as a trend until the October run.
- Competitor-displacement half of the run **worked this time** (it returned Internal Error on 2026-09-01): for "nurse scheduling software" ChatGPT's tracked sources are snapschedule.com (8), shiftboard.com (8), reddit.com (8); we are absent. "hospital staffing software", "ai nurse scheduling", "qgenda alternatives": nothing tracked either way.

### AI Overview presence on our zero-click page-1 queries (live SERP, US desktop, 2026-09-05)

The five real queries where GSC shows us at position 2 to 8 with zero clicks over 90 days. No featured snippet on any of them; the click absorber is the AI Overview.

| Query (GSC impr, our pos) | AIO | Cited inside the AIO | Us cited |
| --- | --- | --- | --- |
| how do clinical staff rate shiftwizard's self-service features… (154, #4) | yes | capterra, healthstream, softwareadvice, apps.apple, klasresearch, getapp, g2 | no |
| does shiftwizard help hospital managers build compliant… (109, #5) | yes | healthstream, getapp, varshealth, apiko, marketplace.workday | no |
| how does shiftwizard compare to kronos healthcare… (71, #4) | yes | ukg, cookchildrensconnect, marketplace.aviahealth, comparehris, varshealth, trythrawn, apiko, **simplescheduleai** | yes, 8th of 8 |
| in house scheduling (46, #6) | yes | **simplescheduleai**, inhouse.health, rosterlab, apps.apple, startupintros | yes |
| aladtec star ems (53, not top 10 this pull) | no | n/a | n/a |

**What this changes.** The audit's drafted snippet rewrites for the ShiftWizard cluster were written on the assumption that a tighter answer capsule wins the click. On the two biggest queries the AIO is a synthesis of review-site evidence (Capterra, G2, Software Advice, KLAS), and `/blog/shiftwizard-vs-managed-service`, the page that wins those queries organically, carries **zero attributed reviewer quotes** (checked 2026-09-05: 9 quoted spans after stripping HTML, none within 220 characters of a review attribution). `/blog/shiftwizard-alternatives` carries 24 blockquotes and ranks lower. The dossier holds 8 verified ShiftWizard quotes, two of them page-verified 2026-08-09 and 2026-08-14, inside the 60-day window. The evidence, not the capsule, is what the AIO cites. Raw SERPs: session scratchpad `aio-check-1..5.json`, `aio-check-1b..3b.json`.

### Web brand mentions (DataForSEO content_analysis, 2026-09-05)

21 unique URLs for "simplescheduleai" / "SimpleScheduleAI"; zero for "Simple Schedule AI". **Every one is a Gartner Digital Markets regional mirror of our own three directory listings** (Capterra 1108519, GetApp 2112943, Software Advice 560696) across ccTLDs. No blog, news, forum, or LinkedIn mention exists in this index. Of 16 fetched: 12 UNLINKED by the literal href test, 4 unfetchable (ccTLD DNS from our side), 0 LINKED. Caveat: GDM routes "Visit Website" through a tracking redirect, so UNLINKED here does not mean no referral. **Conclusion: the "unlinked brand mentions" opportunity does not apply; there are no third-party mentions to convert.** Consistent with pre-launch and with content not being the acquisition channel.
