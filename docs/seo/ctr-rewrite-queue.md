# GSC Low-CTR Rewrite Queue

**Purpose:** monthly queue of query/page pairs where Google is already showing us in results (impressions + a rankable position) but searchers are not clicking. These are the highest-leverage, lowest-effort SEO fixes on the site — no new content, no backlinks, just making the title/meta/H1 answer what the searcher actually typed.

**Scope rule (hard):** a rewrite touches title tag, meta description, and/or on-page H1 phrasing **only**. Never change body claims, stats, pricing, or product capability language to chase CTR — that is a fact-check violation, not a CTR fix. Every rewrite gets founder review before it ships (no auto-publish off this queue).

## How to regenerate this queue

1. Load the GSC tool: `ToolSearch` with `select:mcp__google-search-console__get_advanced_search_analytics`.
2. Pull `dimensions="query,page"` for `site_url="https://simplescheduleai.com/"`, last 28 days (omit `start_date`/`end_date` for the default window), in three paginated calls:
   - `row_limit=100, start_row=0`
   - `row_limit=100, start_row=100`
   - `row_limit=100, start_row=200`
   - Stop early if any page returns fewer than 100 rows (means you've hit the end of the data).
   - Note: `sort_by` is ignored by this API wrapper (results come back alphabetical by query) — pull everything across the three calls and filter/sort yourself; don't rely on the API to pre-sort.
3. Filter to the rewrite queue: **impressions ≥ 15 AND position ≤ 25**.
4. Compute an expected-CTR band by position and flag rows whose actual CTR is below the bottom of the band (or exactly 0% with 15+ impressions):

   | Position | Expected CTR band |
   |---|---|
   | 1–3 | > 8% |
   | 4–10 | 2–8% |
   | 11–20 | 0.5–2% |
   | 21–25 | 0.2–1% |

5. Exclude obvious junk/scraper queries before writing the table: gibberish prefixes (e.g. "4nurse"), quoted operator strings with `-site:` exclusions (bot/scraper fingerprints, not real searches), and queries naming cities/regions we don't serve.
6. Sort the surviving rows by impressions descending, write the dated queue section below (new `## YYYY-MM-DD queue` heading each run — keep prior queues for trend history, don't overwrite), and run `npx prettier --write docs/seo/ctr-rewrite-queue.md`.

---

## 2026-07-12 queue

Pulled 2026-07-12, GSC window 2026-06-14 to 2026-07-12 (last 28 days, default). 300 query×page rows pulled across 3 paginated calls (100/100/100, all full pages). 13 rows met the impressions ≥ 15 AND position ≤ 25 threshold; all 13 are shown below (none excluded as junk — the long natural-language queries below are unusual but are legitimate long-tail searches, not scraper strings). **Data caveat (explained):** every one of the 300 query×page rows shows 0 clicks, yet the same property reports 22 clicks in this window at the date dimension (16 in June + 10 in July 1-9, verified 2026-07-11 during the proof-of-work pull). That is GSC privacy filtering: at low volumes, clicks are suppressed at query granularity (anonymized queries) while remaining in totals. So 0% CTR per query row does NOT mean zero clicks sitewide — it means query-level CTR is not yet measurable for this property. Treat this queue as an impressions-weighted title/meta improvement list, not proof that any given query converts at exactly 0%; the per-query CTR signal will firm up as volume grows.

| Query | Page | Impressions | Position | CTR | Expected band | Note |
|---|---|---|---|---|---|---|
| does shiftwizard help hospital managers build compliant nurse and clinical staff schedules while controlling overtime and managing certifications? | /blog/shiftwizard-vs-managed-service | 61 | 8.9 | 0% | 2–8% | 0% at page-1 position; title/meta likely reads as a generic "vs" comparison, not an answer to the compliance/overtime/certification question in the query |
| how do clinical staff rate shiftwizard's self-service features for healthcare staff managing shift requests, trades, and schedule visibility from a mobile app? | /blog/shiftwizard-vs-managed-service | 59 | 7.9 | 0% | 2–8% | same page, second high-volume long-tail miss; query is about mobile self-service specifically |
| m7 health | /blog/m7-health-vs-simplescheduleai | 44 | 15.6 | 0% | 0.5–2% | branded competitor-name search, page ranks page-2; 0% CTR on a brand query is unusual |
| best nurse scheduling software | /nurse-scheduling-software | 35 | 18.9 | 0% | 0.5–2% | head commercial term, page-2 position, flagship money page |
| nurse rostering software | /blog/nurse-rostering-vs-scheduling-software | 30 | 14.5 | 0% | 0.5–2% | direct category search landing on a definitional "vs" post |
| aladtec star ems | /blog/aladtec-alternatives | 27 | 6.9 | 0% | 2–8% | brand + product-line query, page-1 position |
| how do clinical staff rate shiftwizard's self-service features for healthcare staff managing shift requests, trades, and schedule visibility from a mobile app? | /blog/shiftwizard-alternatives | 27 | 5.6 | 0% | 2–8% | same long-tail query as row 2, different landing page (dupe/cannibalization risk between the two ShiftWizard posts) |
| nurse scheduling software free | /blog/free-nurse-scheduling-software | 22 | 13.6 | 0% | 0.5–2% | |
| best aladtec alternatives | /blog/aladtec-alternatives | 20 | 2.5 | 0% | > 8% | **most severe gap in the queue** — top-3 average position with literally 0% CTR; expected 8%+ |
| hospital staff scheduling | /blog/hospital-staff-scheduling-software-critical-access | 20 | 14.7 | 0% | 0.5–2% | |
| free nurse scheduling program | /blog/free-nurse-scheduling-software | 19 | 12.9 | 0% | 0.5–2% | |
| free nurse scheduling software | /blog/free-nurse-scheduling-software | 19 | 11.9 | 0% | 0.5–2% | |
| pbj reporting software | /blog/cms-pbj-reporting-scheduling-software | 17 | 16.9 | 0% | 0.5–2% | |

### Top 5 candidates

1. **`/blog/shiftwizard-vs-managed-service`** (120 impressions across two long-tail queries, positions 7.9–8.9, 0% CTR) — title reads as a head-to-head "vs" comparison; searchers are typing specific compliance/overtime/certification and mobile-self-service questions. Rewrite the title/meta to lead with the question being asked ("Does ShiftWizard handle overtime and certification compliance?") rather than the generic vs-framing.
2. **`/blog/aladtec-alternatives`** (47 impressions combined, best query at position 2.5 with 0% CTR) — biggest gap in the whole queue: a top-3 ranking should be pulling 8%+ CTR and is pulling none. Check the live SERP snippet for a truncated/unappealing title or a competing internal result cannibalizing the click.
3. **`/blog/m7-health-vs-simplescheduleai`** (44 impressions, position 15.6, 0% CTR) — brand-name query ("m7 health") landing page-2; front-load "M7 Health" earlier in the title tag so it matches the exact brand search, and sharpen the meta description toward comparison/pricing intent.
4. **`/nurse-scheduling-software`** (35 impressions on "best nurse scheduling software", position 18.9, 0% CTR) — the flagship money page is being read by Google as a vendor homepage, not a "best of" roundup; test a title that leads with "Best Nurse Scheduling Software" framing to match listicle-style searcher intent.
5. **`/blog/nurse-rostering-vs-scheduling-software`** (30 impressions, position 14.5, 0% CTR) — query is a direct category/product search ("nurse rostering software") but the page is framed as a definitional rostering-vs-scheduling explainer; lead the title with the product-category match before the vs-angle.

---

## Refresh 2026-07-22 — page-2 goldmine run (90-day window Apr 23 to Jul 21)

764 query/page rows pulled. Bands: A = position 11-20 with >=30 impressions (page-2
goldmine); B = position 4-10.9 with >=50 impressions (near-top CTR). Per-query clicks
are privacy-suppressed at our volume — never read 0 clicks literally.

### Queue (drafted rewrites, AWAITING FOUNDER REVIEW — nothing shipped)

| # | Page | Target queries (impr, pos) | Change |
|---|---|---|---|
| R1 | /blog/m7-health-vs-simplescheduleai | m7 health ochsner (150, 11.0) · m7 health (96, 15.8) | Title + excerpt: add the Ochsner semantic |
| R2 | /blog/free-nurse-scheduling-software | free nurse scheduling software (38, 11.9) + 2 variants (~105 combined) | Title + excerpt: promise real options + our free template |
| R3 | /blog/shiftwizard-vs-managed-service | what is shiftwizard (114, 9.2) · 2 long eval questions (271 combined, 7-8) | Title: claim the what-is intent; owns eval questions |
| R4 | /blog/shiftwizard-alternatives | same eval questions split here (223 combined, 4.5-6.7) | Excerpt only: de-emphasize self-service/eval language -> pure switching intent (cannibalization split) |
| R5 | /blog/hospital-staff-scheduling-software-critical-access | hospital staff scheduling (35, 14.6) | Excerpt only |
| R6 (low) | /blog/nurse-rostering-vs-scheduling-software | nurse rostering software (30, 14.5) | Optional excerpt sharpen |

Drafted copy lives in the session review table (2026-07-22); on approval each edit
ships as title/meta(excerpt)-only diffs, one commit, then re-measure in 28 days.

> **2026-09-01 — the drafted copy above is GONE.** It was written into a chat
> review table and never to disk, so the exact wording did not survive the
> session. Only the intent column above remains. **Rule from now on: no rewrite
> is "drafted" until the exact before/after strings are in this file.** The
> 2026-09-01 queue below follows that rule.

---

## 2026-09-01 queue — triaged against the corrected method

The 2026-09 audit established that **title rewrites only pay in Band B (positions
4-10.9)**. At positions 12-20 nobody scrolls to page 2 and then declines to click
over wording, so Band A is a link-and-authority worklist instead. Proof: the
`free-nurse-scheduling-software` title was rewritten 2026-08-02 and its seven
variants (424 impressions) did not move off 12.4-15.7.

### Disposition of the six July items

| #  | Page                                                    | Disposition                                                                                                                             |
| -- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| R1 | /blog/m7-health-vs-simplescheduleai                      | **KILLED.** The Ochsner cluster is 2,003 impressions of M7 login navigation, not demand. Winning it wins nothing. Never re-queue.          |
| R2 | /blog/free-nurse-scheduling-software                     | **SHIPPED 2026-08-02, no effect.** Reclassified as a Band A link problem. Do not rewrite a third time.                                     |
| R3 | /blog/shiftwizard-vs-managed-service                     | **STILL VALID — now the top item.** 400 impressions, positions 6.7-8.7, 0 clicks. Copy drafted below.                                      |
| R4 | /blog/shiftwizard-alternatives                           | **STILL VALID, ships with R3.** Same-intent split. Copy drafted below.                                                                     |
| R5 | /blog/hospital-staff-scheduling-software-critical-access | **RECLASSIFIED** to the link worklist (36 impressions at 15.3 — Band A).                                                                   |
| R6 | /blog/nurse-rostering-vs-scheduling-software             | **RECLASSIFIED** to the link worklist (99 impressions at 11.3 — Band A).                                                                   |

Six drafted items reduce to two that survive the corrected method.

### N1 + N2 — the ShiftWizard pair (ship together, one commit)

These two pages split four queries between them. The fix is not consolidation;
each page keeps its own intent and the metadata is sharpened so Google can tell
them apart. `/blog/shiftwizard-alternatives` currently outranks its sibling on
both shared queries while receiving fewer impressions, which is the signature of
an unresolved split.

**N1. `/blog/shiftwizard-vs-managed-service`** — 400 impressions across four
queries at 6.7-8.7, 0 clicks. Owns EVALUATION intent ("what is it, does it do X").

- Title BEFORE: `What Is ShiftWizard? A Review vs a Managed Scheduling Service (2026)`
- Title AFTER: `What Is ShiftWizard? Overtime, Certifications and Self-Service Reviewed (2026)`
- Meta BEFORE: `Does ShiftWizard control overtime, track certifications, and give staff mobile self-service? What the software does, and what a managed service does for you.`
- Meta AFTER: unchanged — it already names all three query nouns and is doing its job.
- Why: the three highest-volume queries name overtime, certification compliance
  or mobile self-service by name. `What Is ShiftWizard` stays first because it is
  itself a 69-impression query at position 8.7. The words that come out are
  `A Review vs a Managed Scheduling Service`, which describes our format rather
  than answering their question, and which duplicates the sibling page's intent.

**N2. `/blog/shiftwizard-alternatives`** — 120 impressions on the same two
evaluation queries at 5.3-6.9, 0 clicks. Owns SWITCHING intent.

- Title BEFORE: `4 Best ShiftWizard Alternatives for Critical Access Hospitals (2026)`
- Title AFTER: unchanged. It is already unambiguously switching-intent.
- Meta BEFORE: `Four ShiftWizard alternatives for a critical access hospital, compared on operating model, not just features, when the nurse manager cannot run scheduling weekly.`
- Meta AFTER: `Leaving ShiftWizard? Four alternatives for a 25-bed hospital, compared on switching cost, setup burden, and who runs the schedule after go-live.`
- Why: the current meta opens on what the alternatives are compared ON, which
  reads as evaluation. Opening on `Leaving ShiftWizard?` states the intent in the
  first two words. The body already carries the switching framing; this is
  metadata only, no claims touched.

**Measurement:** re-pull the four ShiftWizard queries at the 2026-10-01 audit. The
test is clicks appearing at all, not position — we already hold page 1.

### Band A link worklist (NOT rewrites)

Diagnosed 2026-09-01. Internal-link counts across 142 posts and articles:

| Inbound | Page                                          | Impressions / position     |
| ------- | --------------------------------------------- | -------------------------- |
| 119     | /nurse-scheduling-software (pillar)           | already ranks              |
| 118     | /critical-access-hospital-scheduling (pillar)  | already ranks              |
| 5       | /blog/nurse-rostering-vs-scheduling-software   | 99 impr, 11.3              |
| 4       | /blog/free-nurse-schedule-templates            | template cluster           |
| 4       | /blog/nurse-schedule-generator                 | template cluster           |
| 3       | **/blog/free-nurse-scheduling-software**       | **424 impr, 12.4-15.7**    |
| 2       | /blog/hospital-staff-scheduling-software-critical-access | 36 impr, 15.3   |
| 2       | /blog/best-per-diem-nurse-scheduling-software  | 30 impr, 11.7              |
| 1       | **/resources/nurse-schedule-template**         | **241 impr, 14.5-20**      |

Every post links to the two pillars, which already rank. The two pages with the
most page-2 demand on the site carry three and one inbound link. Separately, the
free/template intent is split across FOUR URLs sharing twelve internal links.
Both problems are ours to fix and cost nothing but editing time.

