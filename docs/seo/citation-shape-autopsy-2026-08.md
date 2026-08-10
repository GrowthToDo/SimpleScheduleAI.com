# Citation-Shape Autopsy — August 2026

Why LLM answers cite competitor pages and not ours on four money prompts, and what shape edits would close the gap.

- **Run date:** 2026-08-09
- **Method:** DataForSEO `/v3/ai_optimization/{model}/llm_responses/live` with web search enabled, US context. Models: `gpt-5.5` (ChatGPT), `sonar` (Perplexity), `gemini-3.5-flash` (Gemini), `claude-sonnet-5` (Claude). 12 successful calls (gemini required a retry without the country field).
- **All edit recommendations in Section 5 are FOUNDER-GATED. Money pages are edit-gated; nothing here authorizes a change.**

## 0. Measurement protocol (added 2026-08-10 — read before any re-probe)

**Frozen prompts.** These four strings are frozen. Re-probes use them verbatim,
on the same four models, with web search enabled, US context. Never reword a
prompt after seeing an answer you did not like — the moment the wording moves,
the trend line is measuring our edits to the question instead of our position in
the answer.

| ID | Frozen prompt string | Engines | Location |
| --- | --- | --- | --- |
| P1 | `what is the best nurse scheduling software` | gpt-5.5, sonar, gemini-3.5-flash, claude-sonnet-5 | United States |
| P2 | `best hospital staffing software for a small hospital` | same four | United States |
| P3 | `what is AI nurse scheduling and which tools do it` | same four | United States |
| P4 | `qgenda alternatives` | same four | United States |

Baseline run: 2026-08-09. Next re-probe: ~2026-08-23, and thereafter whenever the
publish queue empties.

**Four tracking states, not yes/no.** Being recommended and being cited are two
different leaderboards with two different fixes, and our own baseline proves it:
Perplexity P3 named us in the answer AND cited us, while Perplexity P4 cited
`/blog/qgenda-alternatives` in the sources and never mentioned us in the answer
text. Record every cell as one of:

- **CITED** — named in the answer text and linked in the sources.
- **MENTIONED** — named in the answer text, not linked.
- **SOURCED** — linked in the sources, not named in the answer text.
- **ABSENT** — neither. (`NO DATA` where the probe failed or was not run.)

**Gap taxonomy.** Label every non-CITED cell with the gap that explains it, because
each one has a different fix and three of the four are not content edits:

- **Decision gap** — the answer is not framed around a decision we win. Fix: content.
- **Entity gap** — the model does not reliably know what we are. Fix: entity signals.
- **Evidence gap** — we make claims the model cannot verify (no numbers, no dates,
  no named sources). Fix: content.
- **Distribution gap** — our page is fine; the answer is assembled from third-party
  pages we are absent from. Fix: get onto those pages. Not an edit to ours.

Our QGenda page is a **distribution gap** — shape-competitive, absent from the
closed club of pages the answers are built from. That is why the fix routes to
T1.3 listicle-gap pitches in the backlink plan and not to a page rewrite.

## 1. Citation matrix (prompt x model)

States per Section 0: CITED / MENTIONED / SOURCED / ABSENT. Gap label in brackets.

| Prompt | ChatGPT (gpt-5.5) | Perplexity (sonar) | Gemini (3.5-flash) | Claude (sonnet-5) |
| --- | --- | --- | --- | --- |
| P1 "what is the best nurse scheduling software" | ABSENT [distribution] | ABSENT [distribution] | ABSENT [entity] | ABSENT [distribution] |
| P2 "best hospital staffing software for a small hospital" | ABSENT [distribution] | ABSENT [distribution] | NO DATA | NO DATA |
| P3 "what is AI nurse scheduling and which tools do it" | ABSENT [entity] | **CITED** (`/ai-nurse-scheduling` + homepage) | NO DATA | NO DATA |
| P4 "qgenda alternatives" | ABSENT [distribution] | **SOURCED** (`/blog/qgenda-alternatives`, not named in answer text) | ABSENT [distribution] | ABSENT [distribution] |

**Presence: 2 of 12 — one CITED, one SOURCED.** Both on Perplexity. ChatGPT, Gemini, and Claude never surface us.
**Dominant gap: distribution (7 of 10 non-present cells).** The answers are assembled
from third-party pages we are absent from, not from a defect in our own pages.

### Cited domains per cell (deduped, social noise trimmed)

- **ChatGPT P1:** softwareadvice.com, getapp.com (category directories only; answer named UKG, QGenda, Shiftboard, OnShift, NurseGrid, When I Work, Connecteam)
- **ChatGPT P2:** amnhealthcare (Smart Square PR), g2.com (ShiftWizard reviews), klasresearch.com, fitsmallbusiness.com
- **ChatGPT P3:** symplr press release, klasresearch.com (x2), qgenda.com, wikipedia (HealthRoster)
- **ChatGPT P4:** perfectserve.com compare page, cbinsights, withassured.com, capterra.com alternatives, g2.com alternatives, medstafftracker.com
- **Perplexity P1 (18 urls):** cal.com blog, virtosoftware, fitsmallbusiness, guideflow, worldmetrics, apiko, varshealth, capterra resources, connecteam listicle, myhospitalnow, shiftboard, indeavor, klasresearch, symplr, nursegrid, reddit r/nursing, inhouse.health, f6s
- **Perplexity P2 (19 urls):** whatisbluesky ("...in 2026"), worldmetrics, bullhorn, zipdo, varshealth, apiko, gitnux, connecteam (x2), shiftboard, deputy, reddit, staftr ("2025"), definitivehc, onpage ("2025"), hiringaiguide, shiftmed
- **Perplexity P3 (19 urls):** 5x pmc.ncbi/jmir academic papers, shiftable.app, virtosoftware, statera-ai, inhouse.health, nursingworld.org, soonest.io, ateamsoftsolutions, **simplescheduleai.com/ai-nurse-scheduling**, **simplescheduleai.com/**, quantiphi case study, workeen.ai, reddit, clevelandclinic
- **Perplexity P4 (20 urls):** perfectserve compare, cbinsights, softwaresuggest, fitgap, selecthub, medstafftracker, reddit, withassured, getapp, krowdbase, g2, softwareadvice, schedulingwiz, capterra.ca, **simplescheduleai.com/blog/qgenda-alternatives**, saasworthy, webcatalog, sanishift, aviahealth, trythrawn
- **Gemini P1/P4:** citations are vertexaisearch redirect blobs (unresolvable); answer text named symplr, QGenda, UKG/Kronos, ShiftWizard, Shiftboard, Smartlinx, OnShift, NurseGrid (P1); QGenda, PerfectServe/Lightning Bolt, Amion, symplr, ShiftWizard, Aladtec/TCP, Humanity (P4). No SSAI.
- **Claude P1:** cal.com, indeavor, virtosoftware, apiko. **Claude P4:** perfectserve, g2, withassured, sanishift, medstafftracker, schedulingwiz. No SSAI.

Key observation: **ChatGPT, Claude, and Perplexity converge on the same 5-6 third-party P4 pages** (perfectserve, withassured, medstafftracker, g2, sanishift, schedulingwiz). The P4 answer set is a closed club; membership is the game.

## 2. Shape table — the cited pages

Fetched 10 of 13 targets (virtosoftware.com 403, fitsmallbusiness.com 403, schedulingwiz.com 404 — all three still cited by LLMs, so blocking us does not block crawlers-for-LLMs).

| Page (publisher) | Answer-first open? | Question H2s | Named-competitor table | Numbers/dates | 200-400w chunks | Brand+category | FAQ | Fresh date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cal.com/blog/nurse-scheduling-software (Cal.com) | No (problem-frame) | Yes, 3+ of 16 | Yes but empty data rows; 8 tools ranked in prose | 33% burnout stat; multiple 2025-2026 dates | Mostly, some 600w | ~8x | 5 Qs | Yes, several |
| apiko.com/blog/nurse-scheduling-software (Apiko) | No (problem-frame) | 1 + 11-question checklist | No table; 7 vendor cards w/ pros/cons + Capterra quotes | CSAT 9.6/10, impl. weeks, Aug 2025 date | Yes | ~7x (each vendor's first sentence) | Checklist-as-FAQ | Yes |
| indeavor.com/blog/nurse-scheduling-software (Indeavor) | No (anecdote) | FAQ Qs only | Yes: 5 rows (Platform / Best For / Key Feature) | BLS 189,100 RN openings; 41.5%; 47%/52%/64% outcome claims; $5/user/mo | Yes, 250-350w | 6+ | 5 Qs | No visible date |
| capterra.com/resources/nurse-scheduling-software (Capterra) | Partial | None | No table; 4 tools w/ rating + review count + pricing each | 4.7/5 (90+ reviews), $29/mo; published 2020 | Shorter (150-200w) | 3x | No | **Stale (2020)** — still cited |
| connecteam.com/top-nurse-scheduling-software-solutions (Connecteam) | Yes (definition) | Yes, 3 ("What is / How does it work / How much") | Yes: 5 tools x 9 attribute rows | $29/mo, $2/user, 4.6-4.8 ratings; "17 considered, 10 reviewed, 5 chosen" methodology | Yes | High ("Best all-in-one nurse scheduling software: Connecteam") | 3 Qs | Updated Nov 2024 |
| perfectserve.com/compare/best-qgenda-competitors (PerfectServe) | Yes-ish (problem+Quick Summary) | ~22 headings incl. "Our Shortlist: The Top 3 QGenda Alternatives in 2026" | Yes: 8 competitors x Tool/Best-for/Capabilities/Price | KLAS wins 2017-2026; 82%/98% reductions; 1,300 hrs -> 260 hrs case | Yes, dominant | High | 4 collapsible Qs | Updated May 19, 2026 |
| medstafftracker.com/blog/qgenda-alternatives (Med Staff Tracker) | No (context first) | Mixed ("Why Look for QGenda Alternatives?") | Yes: 6 platforms x 5 criteria | QGenda "$500-$1,000+/mo"; Amion "$449/yr"; Feb 2026 dateline | Yes, 250-400w | High (each H3 = "Brand: category positioning") | No | Feb 2026 |
| withassured.com/alternative/qgenda (Assured) | No (defines QGenda first) | Yes, 6 question H2s | Yes, labeled "Comparison Table of the 6 Best QGenda Alternatives" | 48hrs vs 60-120 days; 95%; 82%; 98%; "9 of 10 US hospitals" | Yes, 200-350w per alternative | High | **5 Qs incl. literal "What is the best alternative to QGenda?"** | Updated 07/09/2026 |
| sanishift.com/en/qgenda-alternative (SaniShift) | **Yes, first sentence** | Yes + FAQ ("What is the best QGenda alternative for a small medical group?") | Criterion matrix, QGenda vs SaniShift, 6 rows | $99/mo repeated 5+ times; $15,000 license TCO math; "Source notes checked June 10, 2026" | Yes, 150-300w | High, segment-scoped ("QGenda alternative for small medical groups") | 5 Qs | Yes, x4 |
| klasresearch.com Best in KLAS 2025 (KLAS) | Yes (ranked scores immediately) | Declarative | Ranked table: Smart Square 89.0, ShiftWizard 84.5, QGenda 79.5, symplr 77.5 + 4 unranked | 100-pt scores, 2005-2026 award history | Data-dense, short | Yes (vendor+product) | No | 2025 cycle |
| varshealth.com (Vars Health) | fetch truncated | — | — | Title carries "in 2026" | — | — | — | Yes (title) |

### Recurring shape signature of cited pages

1. **Multi-vendor named comparison** — every content page names 4-8 competing products; most put them in a literal table with Best-for / rating / price / setup columns.
2. **Year-stamped freshness** — "in 2026" in H1 or a visible Updated <2026 date> (perfectserve, withassured, sanishift, medstafftracker, whatisbluesky, varshealth, staftr, onpage). Exception: Capterra survives on domain authority with a 2020 page.
3. **Question H2s + FAQ blocks** with the literal query as a question ("What is the best alternative to QGenda?").
4. **Brand-next-to-category first sentences** for every vendor mentioned ("X is a [category] built for [segment]").
5. **Hard numbers in claim sentences** — ratings with review counts, $/mo prices, implementation weeks, % outcomes, KLAS scores.
6. **200-400 word standalone chunks**, one vendor or one criterion per chunk (liftable passages).
7. **Segment-scoping as differentiation** — sanishift ranks despite being tiny by owning "QGenda alternative for small medical groups"; it is cited by Perplexity AND Claude.
8. **Vendor self-advocacy does not disqualify** — perfectserve, withassured, sanishift, medstafftracker, connecteam, cal.com, apiko, indeavor are ALL vendors ranking themselves first. LLMs cite them anyway because the page shape is an evaluator's shape.

## 3. Our two pages on the same checklist

### /nurse-scheduling-software (money page)

| Checklist item | Score |
| --- | --- |
| Answer-first open | **Partial** — first 40 words define the category ("Nurse scheduling software builds rosters that respect credentials, overtime limits, and CMS staffing rules...") but never answer "which is best" |
| Question H2s | **Good** — 6 of 12 headings interrogative |
| Named-competitor table | **MISSING** — the one table compares "Manual spreadsheet / Generic employee app / SimpleScheduleAI." Zero competitor products named anywhere. Every cited P1 page names 4-8 |
| Numbers+dates | **Good** — 8-12 hrs/wk, $26,000 shadow salary, $50/hr, 3-5 day onboarding, $2-$8/nurse/mo market band, Published Mar 31 2026 / Updated Jun 1 2026 |
| 200-400w chunks | **Good** — dominant |
| Brand+category | **Good** — 5 direct co-locations |
| FAQ | **Good** — 8 Q&A pairs; but none is the literal "What is the best nurse scheduling software...?" |
| Freshness | **Good** dates, but no year in title/H1 |

### /blog/qgenda-alternatives

| Checklist item | Score |
| --- | --- |
| Answer-first open | **Yes** — "The best QGenda alternatives for a 25-bed critical access hospital fit nurse scheduling without a physician-group platform or an IT team." |
| Question H2s | **Good** — 7 of 13 |
| Named-competitor table | **Yes** — 5 rows (QGenda, TCP/Aladtec, ShiftWizard, NurseGrid, SSAI) with ratings, review counts, setup times. But cited P4 pages carry 6-8 rows and include the physician-lane names LLMs actually recite (Lightning Bolt/PerfectServe, Amion/Doximity, TigerConnect, symplr) |
| Numbers+dates | **Good** — G2/Capterra scores w/ counts, $1,000-$1,500/mo SSAI pricing, 6-12 wks vs 3-5 days, Updated May 16 2026, footnoted sources w/ verification dates |
| 200-400w chunks | **Good** |
| Brand+category | **High** |
| FAQ | **Yes (5)** — but no literal "What is the best alternative to QGenda?" question |
| Freshness | Updated date yes; no year in H1/title |

**Verdict:** the QGenda post is already shape-competitive — and it IS cited (Perplexity). Its gap on ChatGPT/Claude/Gemini is club membership (those models cite the same 6 third-party pages), i.e., authority/off-site, not on-page shape. The /nurse-scheduling-software page has a real shape gap: it is a single-vendor pitch page being asked a multi-vendor question.

## 4. DIFF — what cited pages have that ours lack

1. **P1 pages are listicles; our P1 page is a vendor page.** All four models answer "best nurse scheduling software" from multi-option roundups (or KLAS rankings). A page that names only itself cannot be the source for a "best of" answer. This is the single biggest structural mismatch.
2. **No named competitors on /nurse-scheduling-software.** Cited pages name 4-8 products with ratings/prices; our comparison table's rows are "manual spreadsheet" and "generic app."
3. **No "best" assertion answering the query.** Our page defines the category; cited pages open with or quickly reach a ranked/short-listed answer ("Our Shortlist: The Top 3 ... in 2026").
4. **No year in titles.** Multiple cited pages carry "2025/2026" in H1; both our pages carry the date only in the byline.
5. **Missing the literal best-question FAQ string.** withassured/sanishift put "What is the best [alternative to] QGenda?" verbatim in FAQ; direct answer-string harvest for LLMs.
6. **No third-party authority anchors on the money page.** ChatGPT leans hard on KLAS (cited in 3 of 4 ChatGPT answers). Our software page never references KLAS/G2/Capterra data; our QGenda post does (and is the one that gets cited).
7. **P4 club membership is off-site.** ChatGPT/Claude P4 citations are 100% third-party alternatives pages and directories (g2, capterra, softwareadvice, cbinsights, selecthub, saasworthy...) — SSAI is absent from every one of those lists. No on-page edit fixes that; outreach/listings do.

## 5. EDIT LIST — numbered, per page (RECOMMENDATIONS ONLY — FOUNDER-GATED)

These money pages are edit-gated. Nothing below should be applied without explicit founder approval. Competitor claims must come from `docs/seo/competitor-dossier.md` per the competitor data rule; product-mode token rules per `docs/seo/positioning-registry.md`.

### /nurse-scheduling-software

1. **Add a named-competitor comparison table** (5-6 rows): SSAI, ShiftWizard (HealthStream), symplr/Smart Square, QGenda, Connecteam or NurseGrid — columns: Best for / Public ratings (G2+Capterra w/ counts, dossier-sourced) / Setup time / Pricing model / Small-hospital fit. Keep the existing method table (spreadsheet vs generic app vs SSAI) as a second table; it answers a different question.
2. **Rework the opening ~40 words to answer the "best" question segment-first**, e.g. "The best nurse scheduling software depends on hospital size: large systems buy Smart Square or QGenda; a 25-bed critical access hospital needs [criteria]. Below: how the options compare." (Exact copy founder-drafted; keeps no-overclaim rules.)
3. **Add FAQ entry with the literal query as its question:** "What is the best nurse scheduling software for a small hospital?" with a 2-3 sentence multi-option answer that names competitors and then scopes SSAI to the CAH segment.
4. **Add third-party authority anchors:** one sentence citing the Best in KLAS 2025 nurse-scheduling ranking (Smart Square 89.0, ShiftWizard 84.5, QGenda 79.5) with the honest framing that those are enterprise tools — positions the page as an evaluator, which is the shape every cited page has.
5. **Add a year freshness cue** to title/H1 (e.g. "...for Small Hospitals in 2026") and surface the "Updated" date near the top. Requires committing to refreshing the page each cycle (monthly audit ritual can own it).
6. **Segment-scope the H1/meta the way sanishift does** ("QGenda alternative for small medical groups" won them citations from two models): consider "Nurse Scheduling Software for Critical Access Hospitals (2026)" rather than the bare head term — we win the scoped question, not the head term.

### /blog/qgenda-alternatives

7. **Add FAQ entry:** literal "What is the best alternative to QGenda?" with a direct first-sentence answer (segmented: physician groups vs small-hospital nursing).
8. **Expand the comparison table from 5 to 7-8 rows** adding the physician-lane names every LLM recites — PerfectServe/Lightning Bolt, Amion (Doximity), TigerConnect — with a "Physician-focused vs nurse-focused" column. Ours would become the only alternatives page that segments nurse vs physician scheduling, which is exactly the axis LLM answers currently blur. All claims dossier-verified first.
9. **Add the year to H1/title** ("QGenda Alternatives in 2026: ...") — every P4 club page carries a 2026 stamp.
10. **Keep and protect /ai-nurse-scheduling** — it is our only text-mention win (Perplexity P3 named SSAI and cited that page + homepage). P3 answers also cite 5 academic papers (PMC/JMIR); adding a short research-grounded section citing 1-2 of those same papers would deepen the co-citation neighborhood. No restructuring; incremental only.

## 6. BONUS — outreach targets (P4 lane priority, then P1)

Third-party pages LLMs already cite; getting SSAI listed/mentioned on these is the only route into the ChatGPT/Claude P4 answer club.

### P4 (QGenda-alternatives lane) — highest priority

| Page | Publisher | Cited by |
| --- | --- | --- |
| medstafftracker.com/blog/qgenda-alternatives/ | Med Staff Tracker (vendor blog) | ChatGPT, Perplexity, Claude |
| withassured.com/alternative/qgenda | Assured (vendor) | ChatGPT, Perplexity, Claude |
| schedulingwiz.com/blog/qgenda-alternatives-comparison | SchedulingWiz | Perplexity, Claude |
| g2.com/products/qgenda/competitors/alternatives | G2 (listing — requires SSAI G2 profile) | ChatGPT, Perplexity, Claude |
| capterra.com/p/90628/QGenda/alternatives + capterra.ca | Capterra (listing — requires SSAI Capterra profile) | ChatGPT, Perplexity |
| softwaresuggest.com/qgenda/alternatives | SoftwareSuggest (directory) | Perplexity |
| selecthub.com/workforce-management-software/qgenda/alternatives/ | SelectHub (directory) | Perplexity |
| us.fitgap.com/products/023085/qgenda/alternatives | Fitgap (directory) | Perplexity |
| saasworthy.com/product-alternative/39939/qgenda | SaaSworthy (directory) | Perplexity |
| krowdbase.com/alternatives/qgenda | Krowdbase (directory) | Perplexity |
| webcatalog.io/en/apps/qgenda/alternatives | WebCatalog (directory) | Perplexity |
| cbinsights.com/company/qgenda/alternatives-competitors | CB Insights (profile-driven) | ChatGPT, Perplexity |

### P1/P2 (roundup lane)

| Page | Publisher | Cited by |
| --- | --- | --- |
| cal.com/blog/nurse-scheduling-software | Cal.com | Perplexity, Claude |
| apiko.com/blog/nurse-scheduling-software/ | Apiko | Perplexity (P1+P2), Claude |
| virtosoftware.com/team/nurse-scheduling-software/ | Virto Software | Perplexity (P1+P3), Claude |
| indeavor.com/blog/nurse-scheduling-software/ | Indeavor | Perplexity, Claude |
| fitsmallbusiness.com/nurse-scheduling-software/ | Fit Small Business (editorial — pitchable) | Perplexity, ChatGPT |
| capterra.com/resources/nurse-scheduling-software/ | Capterra editorial | Perplexity |
| myhospitalnow.com top-10 nurse scheduling | MyHospitalNow | Perplexity |
| varshealth.com best-nurse-scheduling-software-hospitals | Vars Health | Perplexity (3 pages across P1/P2) |
| whatisbluesky.com best-vms-healthcare-staffing 2026 | BlueSky | Perplexity |
| klasresearch.com (Scheduling: Nurse & Staff category) | KLAS Research (long-term: requires customer evidence; not actionable pre-launch) | ChatGPT (3 of 4 answers) |

**Total: 22 targets (12 P4-lane, 10 P1/P2-lane).** Directory-lane submissions follow the PRODUCT-mode rules (product column of positioning registry, $10/user/mo tokens). Note: existing directory listings (G2/Capterra product profiles) are prerequisites for appearing on their auto-generated "QGenda alternatives" pages — that alone may be the cheapest P4-club entry.

## API spend

- Main 12-call run: $0.5022 (includes 2 failed gemini calls at $0)
- Gemini rerun (2 calls): $0.1213
- Models list endpoints: $0.00
- **Total: ~$0.62 of the $3.00 cap.**
