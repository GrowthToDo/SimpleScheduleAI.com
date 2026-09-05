# Keyword Gap Targets — Competitor + Intent + AEO Pull

**Generated:** 2026-06-05 · **Method:** DataForSEO (live), US/en · **Cost:** ~$1.00 / 13 calls
**Approach:** competitor-gap mining + intent-filtered pool + AEO citation gap (we have near-zero GSC traffic, so we mine competitors + intent, not our own search data).

> Refresh cadence: re-run quarterly, or when a new competitor surfaces in an LLM citation check. Feed the top targets into the 3-agent blog pipeline.

---

## 2026-09-05 refresh

> **Guardrail on the #1 row, added by the reviewing session the same day.** `/healthcare-staff-scheduling` was RETIRED and deleted on 2026-07-01 (commit c2679e1) by founder decision: the big players own that head term, and the pillar is `/ai-nurse-scheduling` with `/nurse-scheduling-software` as the surviving money page. "healthcare staff scheduling software" is that term plus a modifier. Do not rebuild a page for it without a fresh founder decision; the 880 figure is an Ads range midpoint (140 to 2,400), not a measured volume.

**Generated:** 2026-09-05 · **Method:** same as June (DataForSEO Labs competitor-gap mining + intent-filtered pool + AEO citation gap from `llm-citation-log.md` 2026-09-05), US/en, location 2840 · **Cost:** ~$0.27 est. / 15 calls (method line at the end of this section)

### (a) June top-15 vs live coverage (registry match on primaryKeyword or slug, `keyword-registry.json`, 110 entries)

| June # | June target | Status | Live piece (slug) |
|---|---|---|---|
| 1 | best nurse scheduling software for critical access hospitals | covered | `best-nurse-scheduling-software-critical-access-hospitals` |
| 2 | nurse scheduling software | covered | `nurse-scheduling-software` (pillar) |
| 3 | critical access hospital scheduling | covered | `critical-access-hospital-scheduling` (pillar) |
| 4 | managed nurse scheduling (service vs software) | covered | `managed-service-vs-scheduling-software`, `shiftwizard-vs-managed-service`, `tcp-scheduling-software-vs-managed-service` |
| 5 | hospital scheduling software | covered | `best-scheduling-software-25-bed-hospital` |
| 6 | nurse scheduling software for hospitals without IT | covered | `nurse-scheduling-no-it-department-rural-hospital` |
| 7 | physician scheduling software | **not covered** | unregistered draft only: `physician-medical-staff-scheduling-small-hospital` (draft: true) |
| 8 | cah scheduling software | partial | no page targets the phrase; the CAH pillar absorbs it |
| 9 | ai nurse scheduling | covered | `ai-nurse-scheduling` (pillar) |
| 10 | small hospital scheduling software | covered | `nurse-scheduling-software-small-hospital` |
| 11 | shift scheduling software for nurses | partial | no dedicated page; `nurse-scheduling-software` pillar absorbs it |
| 12 | critical access hospital staff scheduling compliance | covered | `how-to-stay-cms-compliant-nurse-scheduling`, `texas-nursing-overtime-compliance-cah` |
| 13 | nurse rostering | covered | `what-is-nurse-rostering`, `nurse-rostering-vs-scheduling-software` |
| 14 | healthcare workforce management software | covered | `healthcare-workforce-management-cah` |
| 15 | medical / provider credentialing software | **not covered, by design** | product does no credential tracking (founder 2026-06-23); retire from the list |

Score: 11 covered, 2 partial (#8, #11), 2 uncovered (#7 has a draft; #15 retired). Outside the registry: 41 files in `src/data/post` are `draft: true` and unregistered; several already sit on targets below and are flagged in the table.

### (b) New top 15 (not in the registry; same columns as June)

| # | Target keyword / topic | Vol | Intent | KD | Source | Why winnable |
|---|---|---|---|---|---|---|
| 1 | **healthcare staff scheduling software** | 880 (Ads; monthly range 140 to 2,400, CPC $162) | commercial | **0** | comp-gap | In-House Health is the only tracked rival on it, at #50; no named incumbent in the top 10 of the ranked_keywords pulls. Unregistered draft `staff-scheduling-software-healthcare-vs-generic` sits on the adjacent angle |
| 2 | **nurse staffing and scheduling** (cluster: nurse staff scheduling, staffing and scheduling in nursing) | 90 x 3 (CPC $14) | informational | **0** | intent + comp-gap | In-House Health ranks 16 to 19 on all three; a sourced staffing-vs-scheduling explainer for a 25-bed unit owns the cluster. Draft `nursing-staff-scheduling-best-practices-25-bed` exists |
| 3 | **critical access hospital conditions of participation** | 40 | informational | **2** | AEO-gap | Sibling of June #12 (compliance lane); a 42 CFR 485 subpart F page for administrators, cite-first. Exact ICP, near-zero KD |
| 4 | **critical access hospital list** | 140 (CPC $11.62) | informational | 13 | intent | National extension of the Texas data-asset post (topic 17); same sourcing warning applies (Flex Monitoring / CMS files need a human fetch) |
| 5 | **nurse staffing software** | 70 | commercial | **0** | intent | Uncontested commercial variant; staffing-vs-scheduling framing keeps it honest about what the product does |
| 6 | **self scheduling software for nurses** | 30 | commercial | 0 to 5 | comp-gap (domain_intersection) | The only qgenda x nursegrid overlap with commercial intent (qgenda #6, nursegrid #4, both on generic pages). Draft `self-scheduling-manager-workload-trap` exists; the registered cyclical-vs-self post is the natural host |
| 7 | **nurse shift schedule** | 110 (CPC $23.65) | informational | **3** | intent | Draft `nurse-shift-schedule-daily-coverage` exists; TOFU that feeds the 12-hour and 8-vs-12 posts |
| 8 | **scheduling software for nurses** | 320 (CPC $24) | commercial | 6 | comp-gap | In-House Health #23; treat as an on-page secondary for the `nurse-scheduling-software` pillar rather than a new post |
| 9 | **hospital staffing software** | 320 (single Jan-26 spike of 3,600; 10 every other month) | commercial | **0** | AEO-gap | ChatGPT tracks nothing for it either way (log 2026-09-05). Registry has `hospital-staffing-software-features-cah`; the head phrase itself has no page. Discount the volume |
| 10 | **healthcare workforce scheduling software** | 390 (Aug-25 spike of 4,400; 10 every other month) | commercial | **0** | comp-gap | In-House Health #39; same spike caveat as #9. Secondary for `healthcare-workforce-management-cah`, not a new post |
| 11 | **nurse staffing coordinator** | 70 | informational | **0** | intent | Role explainer, sibling of the charge-nurse and nurse-manager posts that already rank |
| 12 | **critical access hospital swing bed requirements** | 30 | transactional | **0** | intent | Pairs with the PBJ swing-bed finding (swing beds exempt from PBJ); staffing angle only |
| 13 | **nurse rotation schedule** | 20 | informational | 3 | intent | Draft `how-to-build-fair-nurse-rotation` exists; fair-holiday-rotation post is the inbound anchor |
| 14 | **nurse scheduling system** | 20 (CPC $92.75) | commercial | 25 | intent | Highest CPC in the pool; small but pure buyer intent |
| 15 | **how long are nursing shifts** | 390 (Labs) | informational | **0** | intent | In-House Health 21 to 29; overlaps `8-hour-vs-12-hour-nursing-shifts`, so an answer capsule on that post may be enough |

Dropped from the pool: every m7health.com and smartlinx.com ranked keyword above 100/mo is navigational (Ochsner/Workday logins, SmartLinx logins), confirming the July M7 mirage note; the `nurse staffing agencies` family (2,400, KD 64) is agency intent; `nursing home scheduling software` (110) is SNF, not ICP; `nurse staffing app` (70, KD 29, competition HIGH) and `short staffing in nursing` (110, KD 31) lose on KD for their volume; `physician scheduling software` (390, KD 0) is a June carry-over, not new.

### (c) What changed since June

1. Coverage: 11 of the June 15 now have a live registered page (June had 4 live: #2, #3, #4, #9); the two gaps left are physician scheduling (draft exists, unregistered) and credentialing (retired, product does not do it).
2. Head term drift: "nurse scheduling software" fell 390 to 320 in the Ads dataset and Labs no longer reports a KD for it (was 1); "hospital scheduling software" held 210 and KD dropped 9 to 2. Neither has a new incumbent.
3. The real SERP rival is now In-House Health (inhouse.health), ranking 16 to 50 across the commercial cluster; qgenda and nursegrid overlap on only 3 keywords, shiftwizard.com still has zero indexed keywords (qgenda x shiftwizard intersection returned empty).
4. AEO (log 2026-09-05): ChatGPT's tracked sources for "nurse scheduling software" are snapschedule, shiftboard and reddit, we are absent; Google AIO cites us on "in house scheduling" and the ShiftWizard-vs-Kronos query but dropped "staff scheduling software healthcare" (vol 50). The AIO cites reviewer evidence, not answer capsules, which is why #1 and #2 above should carry attributed quotes.
5. Volume quality: three of the biggest new numbers (#1, #9, #10) are single-month spikes in the Ads history; rank them on KD and ICP fit, not on the headline volume.

**Method/cost line.** 15 DataForSEO calls: Labs keyword_ideas (5 seeds, 120 rows), related_keywords ("nurse scheduling software", depth 2), keyword_suggestions x6 (nurse scheduling, hospital scheduling, nurse staffing, critical access hospital, rural hospital, nurse schedule), domain_intersection x2 (qgenda x nursegrid: 3 rows; qgenda x shiftwizard: 0 rows, not an error), ranked_keywords x3 (m7health.com, smartlinx.com, inhouse.health), google_ads search_volume (24 keywords, 10 returned), bulk_keyword_difficulty (24). The MCP AI-mode responses strip the `cost` field; the estimate from published prices (Labs $0.01/task + $0.0001/row, Ads volume $0.05/task) is ~$0.27 against a $2.50 cap. No endpoint errored. `ai_optimization` LLM-mention endpoints were not re-run (dataset re-run already logged 2026-09-05).

---


## Top 15 Ranked Targets (act on these)

| # | Target keyword / topic | Vol | Intent | KD | Source | Why winnable |
|---|---|---|---|---|---|---|
| 1 | **best nurse scheduling software for critical access hospitals** | low, ultra-qualified | commercial | low | AEO-gap | ChatGPT recommends generic tools, cites **no web sources** — one sourced "best for CAH" page can own SERP + LLM citation |
| 2 | **nurse scheduling software** | 390 (CPC $31) | comm./nav | **1** | intent + comp-gap | KD=1, no incumbent owns it; flagship commercial term (this is the existing Hub 1 target) |
| 3 | **critical access hospital scheduling** | low | transactional 0.66 | low | intent + AEO-win | Already a cited pillar page in ChatGPT; near-zero competition |
| 4 | **managed nurse scheduling (service vs software)** | low | transactional 0.62 | low | intent + AEO-win | We are already the **primary** ChatGPT source; defend + expand the cluster |
| 5 | **hospital scheduling software** | 210 (CPC $56) | commercial | 9 | intent + comp-gap | Low KD, qgenda only loosely present |
| 6 | **nurse scheduling software for hospitals without IT** | low | commercial | low | AEO-gap | LLMs cite M7/ShiftWorx/Shiftable, not us; matches our "no IT" pitch exactly |
| 7 | **physician scheduling software** | 390 (CPC $32) | commercial | 8 | intent + comp-gap | qgenda at pos 4 is beatable; relevant for CAH multi-role coverage |
| 8 | **cah scheduling software** | low | commercial 0.98 | low | intent | Exact-niche, near-zero competition, perfect ICP |
| 9 | **ai nurse scheduling** | low | transactional 0.70 | low | intent | Core AI differentiator; uncontested |
| 10 | **small hospital scheduling software** | low | commercial 0.94 | low | intent | High commercial intent, exact ICP |
| 11 | **shift scheduling software for nurses** | low | commercial 0.97 | low | intent | Very high commercial intent, long-tail, Easy |
| 12 | **critical access hospital staff scheduling compliance** | low | info/comm | low | AEO-gap | ChatGPT answers with **zero citations** — a sourced CMS CoP / 42 CFR §482 / FLSA page can become THE cited source |
| 13 | **nurse rostering** | low | transactional 0.59 | 16 | intent | Transactional, winnable KD |
| 14 | **healthcare workforce management software** | 390 (CPC $14) | commercial 0.99 | 29 | intent + comp-gap | qgenda ranks #1 — harder; medium-term target |
| 15 | **medical / provider credentialing software** | 90–320 | commercial 1.0 | 2–11 | comp-gap | qgenda's turf but low KD; adjacent play only if product adds credential tracking |

---

## AEO / LLM Citation Gap (ChatGPT, web search)

**Already winning (defend):**
- "how to schedule nurses in a small rural hospital" → our CAH pillar page is cited.
- "managed nurse scheduling service vs software" → we are the **primary** cited source (both `shiftwizard-vs-managed-service` + `tcp-scheduling-software-vs-managed-service` posts).

**Open lanes (we're absent, high leverage):**
1. **"best nurse scheduling software for critical access hospitals"** — ChatGPT names UKG/AMiON/Shiftboard/ScheduleAnywhere/Aladtec/NurseGrid from memory, **cites no web source**. Highest-value single play.
2. **"nurse scheduling software for hospitals without IT staff"** — LLM cites a different tier: **M7 Health, ShiftWorx, SmartLinx, ScheduleForward, Shiftable, EasyShifts, Time360**. None in our dossier. Our "no IT" angle should own this.
3. **"critical access hospital staff scheduling compliance"** — ChatGPT answered with **zero citations**. Pure open lane for a sourced compliance page.

---

## New competitors surfaced (NOT in dossier — add per competitor-data rule)

LLM-cited for CAH/no-IT/best-for queries: **M7 Health, ShiftWorx, ScheduleForward, Shiftable, EasyShifts, SmartLinx, ScheduleAnywhere, AMiON, NurseGrid.**
These are the *real* AI-search competitors for our intent — more relevant to LLM visibility than some incumbents currently tracked.

---

## Competitor SERP read (Table A)

- **qgenda.com** — the only named incumbent with a real generic commercial footprint, but it owns **credentialing**, not nurse scheduling (e.g. "healthcare workforce management software" #1, "physician scheduling software" #4). Beatable on nurse-specific terms.
- **smart-square.com** — ranks almost entirely on branded/employee-portal navigational terms (e.g. "ssm smart square"). No generic commercial real estate.
- **aladtec.com** — ranks for **EMS/fire/police** ("ems manager" #1, "fire manager" #1), not nurse scheduling. Not a true nurse-scheduling SERP competitor.
- **shiftwizard.com** — **zero ranked keywords** in the DataForSEO index (negligible organic footprint).
- **deputy.com / tcpsoftware.com** — skipped per-domain (horizontal/noisy, budget).

**Bottom line:** the generic commercial nurse-scheduling SERP is largely **uncontested** by the named incumbents. KD is low across the niche (confirms "nurse scheduling software" KD=1).

---

## Data gaps / limitations

- `ai_opt_llm_ment_top_domains` / `top_pages` — **not on current DataForSEO subscription** (Code 40204). LLM-mention tracking unavailable; ChatGPT scraper covered the citation analysis instead.
- Most niche long-tail volumes are sub-100/mo (Google Ads returned full volume for top 10 only; rest from Labs).
- "nurse scheduling software" / "nurse scheduling app" label navigational (brand-seeking) but carry strong commercial secondary intent + high CPC ($16–32).
