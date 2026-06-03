# AEO / GEO + Search Measurement Tracking

Phase E artifact. The primary GEO KPI is **AI Share of Voice**: of the target prompts, how many cite `simplescheduleai.com` and how many recommend the product. Re-run this routine monthly and append a new dated block. Do not overwrite the baseline.

## Monthly routine

1. **Multi-index** (after any publish/deploy): `npm run indexnow`; GSC resubmit `sitemap-index.xml` + `sitemap-0.xml` (google-search-console MCP `submit_sitemap`); Bing `submit_feed` `sitemap-index.xml` (bing-webmaster MCP).
2. **GSC performance** (google-search-console MCP): `get_performance_overview` 90d; `get_search_analytics` by `query` and by `page` (row_limit 25). Log totals, top pages, and the outcome checks below.
3. **AI-citation** (dataforseo MCP `ai_optimization_llm_response`, `web_search:true`): run the 5 prompts below on ChatGPT `gpt-5` and Perplexity `sonar-pro`. For each: cited domain? recommended product? competitors surfaced? Approx cost ~$0.15/run.
4. Append results as a new dated section. Update the trend line.

### Standing prompt set

- P1: "What is the best nurse scheduling software for a critical access hospital?"
- P2: "How do small rural hospitals with no IT department manage nurse scheduling?"
- P3: "Best nurse scheduling software for a 25-bed hospital in Texas"
- P4: "How does a managed nurse scheduling service compare to scheduling software for a small rural hospital?"
- P5 (rotate): a competitor-comparison query (e.g. "M7 Health vs SimpleScheduleAI", "Smart Square alternatives for rural hospitals")

### 4–6 week GSC outcome checks (from roadmap Phase E)

- `/blog/best-nurse-scheduling-software-2026` → enters top 10 for "nurse scheduling software" (baseline: page-level avg pos 8.7, query not yet in top 25).
- `/ai-nurse-scheduling` → indexed (baseline: NOT indexed; indexing requested 2026-05-19).
- `/healthcare-staff-scheduling` → impressions trend to 0 (baseline: 1,923 impr, pos 56.8 — 301 confirmed live, GSC not yet reprocessed).
- Hub 1 `/nurse-scheduling-software` → accumulates spoke impressions (baseline: not in top 25 pages).

---

## Baseline — 2026-05-19

### Multi-index actions taken

- GSC: `sitemap-index.xml` + `sitemap-0.xml` resubmitted (status: pending processing). Prior sitemap last downloaded by Google 2026-05-16.
- IndexNow: 38 URLs → HTTP 200 OK.
- Bing: `sitemap-index.xml` feed submitted (site verified).

### GSC performance — 90d (2026-02-18 → 2026-05-19)

- Totals: **8 clicks, 6,803 impressions, CTR 0.12%, avg position 26.3**.
- Trend: impressions climbing ~17/day (mid-Apr) → ~280–310/day (mid-May); avg position improving ~50 → ~18. Clicks still near-zero (page 2–3 + scraper-style long-tail queries dominate).
- Top pages by impressions: `best-nurse-scheduling-software-2026` (1,603 impr, pos 8.7, 3 clicks); `healthcare-staff-scheduling` (1,923 impr, pos 56.8 — retired/301, expected to decay); `shiftwizard-alternatives` (570, pos 6.6); `shiftwizard-vs-managed-service` (511, pos 7.2); `qgenda-alternatives` (405, pos 7.1); `aladtec-alternatives` (360, pos 7.6); `ukg-alternatives-small-hospitals` (273, pos 10.4); pillar `critical-access-hospital-scheduling` (71 impr, pos 7.9, 2 clicks).
- Gaps: `/ai-nurse-scheduling` and `/nurse-scheduling-software` (Hub 1) not in top 25 pages (≈0 impressions). Target head terms ("nurse scheduling software", "critical access hospital scheduling") not yet in top 25 queries.

### AI-citation baseline

| Prompt                 | Engine               | Cited simplescheduleai.com?                                   | Recommended product?                  | Competitors surfaced                             |
| ---------------------- | -------------------- | ------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| P1 best sw for CAH     | ChatGPT gpt-5        | Yes — via `/blog/shiftwizard-alternatives` (listed under TCP) | No                                    | QGenda, UKG, ShiftWizard, TCP (KLAS-led)         |
| P2 rural no-IT         | ChatGPT gpt-5        | No (model did not browse)                                     | No                                    | none (generic spreadsheet answer)                |
| P3 25-bed Texas        | ChatGPT gpt-5        | No                                                            | No                                    | QGenda, Smart Square/symplr, Schedule360         |
| P1 best sw for CAH     | Perplexity sonar-pro | Yes — `/blog`                                                 | **Yes — ranked #1, "strongest fit"**  | Smart Square, QGenda, Homebase, Paycor, ShiftMed |
| P4 managed vs software | Perplexity sonar-pro | Yes — via `/blog/m7-health-vs-simplescheduleai`               | Partial (leans "start with software") | AMN, Homebase, scheduleit                        |

**AI Share of Voice (baseline): 3/5 prompts cited the domain; 1/5 recommended the product.**

Read:

- Perplexity rewards the CAH-specific content — it surfaced the blog and the M7-vs post and named SimpleScheduleAI the top CAH fit. This is the ICP-aligned win.
- ChatGPT (web.run) leans on KLAS / enterprise vendor pages; it cited the domain only through the `shiftwizard-alternatives` blog, never the pillar pages, and recommended enterprise vendors. Pillar pages are not yet cited anywhere.
- Lever implication: blog posts (not pillars) are doing the AEO citation work; the CAH-specific framing is what gets surfaced. ChatGPT visibility tracks Bing index + KLAS authority — keep Bing/IndexNow current and keep earning the CAH-niche framing.

---

## Check — 2026-06-03 (15 days after baseline)

### GSC performance — 90d (2026-03-05 → 2026-06-03)

- Totals: **12 clicks, 10,628 impressions, CTR 0.11%, avg position 23.2** (vs baseline 8/6,803/0.12%/26.3).
- Trend: impressions climbed from ~17/day in early April → 250-340/day since mid-May; avg position improved from ~50 to ~14-18. **+56% impressions in 15 days.**
- Top pages by impressions (28d): `/blog/best-nurse-scheduling-software-2026` (1,082 impr, pos 5.9), `/blog/shiftwizard-vs-managed-service` (592 impr, pos 7.4), `/blog/qgenda-alternatives` (581 impr, pos 7.7), `/blog/shiftwizard-alternatives` (521 impr, pos 6.0), `/blog/m7-health-vs-simplescheduleai` (466 impr, pos 8.5), `/blog/deputy-alternatives-healthcare` (228 impr, pos 17.0), `/blog/aladtec-alternatives` (207 impr, pos 7.3).
- Gaps: pillar `/ai-nurse-scheduling` at 46 impr / pos 10 (under-performing for AI-focused pillar); `healthcare-staff-scheduling` retired 301 still showing 60 impr/pos 48 — decaying as expected.

### AI-citation check

| Prompt                       | Engine               | Cited simplescheduleai.com?                                                                               | Recommended product?                                          | Competitors surfaced                                                                                  |
| ---------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| P1 best sw for CAH           | ChatGPT gpt-5        | **No (regression vs baseline)**                                                                           | No                                                            | M7 Health, symplr Smart Square, UKG, EasyShifts, Schedule360, Medecipher, CronShift                   |
| P1 best sw for CAH           | Perplexity sonar-pro | **Yes — PILLAR `/nurse-scheduling-software` + BOFU `/blog/best-nurse-scheduling-software-2026`**          | **Yes — #1 "strongest fit", verbatim quote from our content** | M7 Health, QGenda, OnShift, UKG, symplr                                                               |
| P2 rural no-IT               | ChatGPT gpt-5        | No                                                                                                        | No                                                            | none (generic paper+spreadsheet answer)                                                               |
| P2 rural no-IT               | Perplexity sonar-pro | No                                                                                                        | No                                                            | Nursa, AHA, academic sources (off-topic financial papers)                                             |
| P3 25-bed Texas              | ChatGPT gpt-5        | No                                                                                                        | No                                                            | QGenda, Schedule360, UKG                                                                              |
| P3 25-bed Texas              | Perplexity sonar-pro | **Yes — BOFU + PILLAR**                                                                                   | **Yes — #1 "purpose-built for 25-bed CAH"**                   | Aladtec, OnShift, EasyShifts                                                                          |
| P4 managed vs software       | ChatGPT gpt-5        | No (web_search did not fire)                                                                              | No                                                            | (generic comparison, no products named)                                                               |
| P4 managed vs software       | Perplexity sonar-pro | Partial — cited `/blog/best-nurse-scheduling-software-2026` in source list, not as primary recommendation | No                                                            | AMN, ScheduleIt, ShiftMed, Apiko (generic comparison)                                                 |
| P5 Smart Square alternatives | ChatGPT gpt-5        | **No (we have `/blog/smart-square-alternatives-small-rural-hospitals` — not indexed for this query)**     | No                                                            | ShiftWizard, Schedule360, QGenda, Intrigma, UKG, symplr; flagged AMN→symplr May 2026 acquisition news |
| P5 Smart Square alternatives | Perplexity sonar-pro | No                                                                                                        | No                                                            | Cactus, Axle Health, ShiftMed (mostly off-topic)                                                      |

**AI Share of Voice (2026-06-03):**

- Cited domain: **0/5 ChatGPT + 2.5/5 Perplexity = 2.5/10 (25%)**
- Recommended product: **0/5 ChatGPT + 2/5 Perplexity = 2/10 (20%)**
- Vs baseline: citations -0.5, recommendations +1 (doubled). ChatGPT regression (-1); Perplexity strengthened (now citing PILLAR not just blog).

### Read

- **Perplexity quality jumped.** Citations now hit pillar pages, not just the blog hub. Verbatim quote on P1 came from `best-nurse-scheduling-software-2026` opener. Today's pillar uplift work (byline, sourced hyperlinks, dark mode, "Texas HHSC" correction, definitional opener, diagrams) is showing in Perplexity.
- **ChatGPT regressed to zero.** Bing index freshness suspect — the May 19 citation via `shiftwizard-alternatives` is gone. Need urgent Bing/IndexNow re-feed of pillars + top BOFU posts. ChatGPT's competitive set: M7 Health (3 mentions), symplr Smart Square (3), UKG (4), QGenda (3), Schedule360 (3). Notably, ChatGPT did NOT mention Aladtec / Deputy / NurseGrid / OnShift / Homebase on any of these 5 prompts — our entire competitor-blog strategy targets vendors ChatGPT doesn't recommend.
- **P2 (rural no-IT) and P5 (Smart Square alternatives) are content-indexation gaps.** Both have dedicated SSAI pages but neither engine surfaced them.
- **`/blog/best-nurse-scheduling-software-2026` is the workhorse.** Cited 3 of 4 Perplexity prompts. Also #1 GSC impression page (1,082 impressions, pos 5.9). The opener is the citation surface — engineer for it on future BOFU posts.

### Action items (priority order)

1. **Run `npm run indexnow` + Bing Webmaster `submit_url` for all 3 pillars + top 5 BOFU posts.** Address ChatGPT regression.
2. **Write `Schedule360 alternatives for Critical Access Hospitals`** — ChatGPT recommends Schedule360 in 3 of 5 prompts and we have zero content positioning against it.
3. **Force re-fetch of `/blog/smart-square-alternatives-small-rural-hospitals`** via Bing Webmaster — currently not indexed for P5.
4. **Write `Nurse scheduling at hospitals with no IT department`** — direct answer to P2. We have fragments in CAH pillar but no dedicated page.
5. **Codify the "opener-as-citation-surface" rule:** new BOFU posts must name SimpleScheduleAI and one competitor in the first 60 words. Add to checklist.
6. **Next check: 2026-07-03.** Re-run same 5 prompts. Track ChatGPT recovery + P2/P5 closure.
