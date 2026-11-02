# Brief: Nurse Schedule Data, What a Small Hospital Should Track (rewrite of cah-nurse-schedule-data-analysis)

Brief, 2026-11-02. Draft under rewrite: `src/data/post/cah-nurse-schedule-data-analysis.md` (draft: true, postType howto, 2,905 body words, target band 2,000 to 3,000). Every statement below is a finding only where a check is named; otherwise it is labeled HYPOTHESIS with the test.

## 0. Verdict in six lines

1. **Search demand does not justify this post.** 11 of the 12 requested phrases have no measurable US volume (Google Ads returns null; DataForSEO Labs returns nothing). "nurse staffing metrics" has 0 in all 60 monthly values. The only phrase with real volume nearby is "nurse overtime" (about 140/mo), which our two overtime posts already own and whose SERP is pay questions. Expect tens of impressions a month at best.
2. **The post still earns its place as a credibility and citation asset** (per memory: content is not the acquisition channel). Its job: a free, practical review sheet a nurse manager can run on one afternoon of exports, plus a source other pages can link to.
3. **Primary keyword: "nurse scheduling metrics"** (no volume data, KD n/a; chosen for intent fit, see section 1). `keyword-check` clear for it and for "nurse staffing metrics", "nurse callout rate", "nurse schedule analysis". "nursing overtime analysis" WARNS (contains "nursing overtime", owned by what-is-nursing-overtime).
4. **Heavy overlap is the real risk.** how-to-reduce-nurse-overtime already says "audit the last 90 days of overtime, scheduled or callout-driven"; how-to-handle-nurse-callouts already lists the callout log fields; fair-nurse-schedule-small-hospital already owns the count-vs-average fairness method. The new post must be the one-page combined review sheet, and link out for each method.
5. **The draft's SSAI section overclaims in at least five sentences** (section 5). Worst: it says the draft distributes night shifts by fairness parameters; the engine has no night fairness (inventory, "NOT IMPLEMENTED", grep of scoring.ts).
6. **Stale NSI edition and several unsupported assertions** (section 4). Switch to the 2026 edition: $60,090 and 17.6%.

## 1. Keywords

Method: DataForSEO keywords_data/google_ads/search_volume/live (all 12) and dataforseo_labs keyword_overview/live (all 12 plus 22 more), location 2840, en. "no data" = Google Ads returned null and Labs returned no row; that means below Google's reporting floor, not proof of zero searches. 3-month = Jul to Sep 2026 monthly values; 12-month = Oct 2025 to Sep 2026.

| Keyword | 12-mo | Last 3 mo | KD | Note |
|---|---|---|---|---|
| nurse staffing analytics | no data | no data | n/a | GSC shows 5 and 2 impressions on "nurse staffing analytics software" (software intent) |
| nurse scheduling metrics | no data | no data | n/a | SERP is closest to our intent (section 2) |
| nurse staffing metrics | 0 (60 months of 0) | 0 | n/a | Labs row exists, all zeros; SERP is ratios and outcomes (ANA, CDC NHSN, AHA, NNU) |
| nursing overtime analysis | no data | no data | n/a | keyword-check WARN vs what-is-nursing-overtime |
| nurse callout rate | no data | no data | n/a | SERP is on-call pay (ZipRecruiter, Reddit), wrong intent |
| nurse call out tracking | no data | no data | n/a | |
| sick call tracking nursing | no data | no data | n/a | |
| nursing scheduling kpis | no data | no data | n/a | |
| staffing metrics for nurse managers | no data | no data | n/a | |
| nurse schedule analysis | no data | no data | n/a | |
| hospital overtime analysis | no data | no data | n/a | |
| nurse staffing dashboard | no data | no data | n/a | |

Related terms that DO return data (from keyword_overview on 22 extra phrases and keyword_suggestions on "nurse overtime"):

| Keyword | 12-mo (mean of 12 monthly values) | Last 3 mo (mean) | KD | Note |
|---|---|---|---|---|
| nurse schedule | 1,250 (Google figure 1,300) | 1,300 | 3 | Generic; schedule-template and shift-pattern intent, owned by other posts |
| nurse staffing | 1,167 (1,300) | 1,400 | 2 | Generic head term |
| nurse staffing ratios | about 260 | 160 (Jul 170, Aug 140, Sep 170) | 9 | Ratio/outcome intent, not ours |
| nurse overtime | 146 (140) | 123 | n/a | Pay/legal intent; owned by what-is-nursing-overtime and how-to-reduce-nurse-overtime |
| nurse overtime pay | 146 (140) | 123 | n/a | Same monthly series as above |
| mandatory nurse overtime | about 120 (Sep 2025 to Aug 2026; Google figure 110) | 97 | 11 to 15 | Owned by mandatory-nurse-overtime-by-state |
| cost of nurse turnover | about 50 | 30 | n/a | cost-of-losing-a-nurse-rural-hospital |
| overtime nurse | about 40 | 33 | 6 | |
| nursing metrics | about 25 | 23 | n/a | Generic nursing quality metrics |
| nurse absenteeism | about 15 | 13 | 48 | |
| nurse call out | 10 | 10 | 11 | |
| staffing analytics | 10 | 10 | 6 | Commercial intent (software) |
| overtime analysis | 10 to 20 | 10 | 7 | Not nursing-specific |

**Primary keyword recommendation: "nurse scheduling metrics".** Honest reasoning: there is no volume on any candidate, so pick on intent fit and registry cleanliness. "nurse staffing metrics" is the better-known phrase but its SERP is ratio/outcome research from ANA, CDC NHSN and AHA, which this post is not. "nurse callout rate" is a pay SERP. "nurse scheduling metrics" returns vendor blogs and a "What are KPI's in nursing?" PAA, the nearest to a scheduling-data how-to. Secondary phrases to work into H2s/FAQ only if they read naturally: "nurse callout rate", "overtime by shift", "nurse schedule fairness". HYPOTHESIS: this post will draw almost no search traffic under any title; test: GSC for the page after 90 days (expect single or low double digits of impressions).

keyword-check results (run 2026-11-02): "nurse staffing metrics" clear; "nurse callout rate" clear; "nurse scheduling metrics" clear; "nurse schedule analysis" clear; "nursing overtime analysis" WARN, containment overlap with /blog/what-is-nursing-overtime.

## 2. SERP map

DataForSEO serp/google/organic/live/advanced, depth 10, US, 2026-11-02. AI Overview is present on all three SERPs run (flagged asynchronous, content not returned). Note: the three SERPs differ in intent, which is itself the finding: no query returns a "how to measure your own nurse schedule" page type.

| Query | What ranks | Fit |
|---|---|---|
| nurse staffing metrics | ANA "Nurse Staffing Measures", CDC NHSN Nurse Staffing Indicator Protocol, AHA staffing ratios, NNU ratios white paper, Nevada State, PMC study, NurseJournal, Medely; scholarly-articles block; related searches "pdf", "calculator" | Wrong intent (ratios and patient outcomes) |
| nurse scheduling metrics | Supplemental Health Care (scheduling challenges), Sparkco AI (automated scheduling in SNFs), a "nursing metric chart" archive page, ShiftMed knowledge center, Camelo HQ (2021), StudySmarter, Studocu, a Top-10 scheduling systems list; PAA: best scheduling app, "What are KPI's in nursing?", "What is a standard nurse schedule?" | Closest; thin, no dedicated metrics page |
| nurse callout rate | ZipRecruiter on-call pay, r/nursing, Facebook group, agency-cost pages, Sage cost-analysis of nurse overtime, Becker's cost of turnover, Major Staffing agency pricing | Wrong intent (pay) |

Neighbour pages inspected for table stakes (WebFetch 2026-11-02; found via WebSearch on the metrics theme, not necessarily ranking for the primary):

| Page | Length | Sections / what it tells a manager to track |
|---|---|---|
| Synerion, Overtime Management Playbook | about 2,400 words, generic (not nursing), no tables | Threshold alerts (worked example 32/36/38 hours), approval rules, exceptions, fairness (track distribution, flag concentration), KPIs and review cadence, FAQ |
| Medely, 6 workforce metrics that predict next month's coverage | about 1,250 words, no tables | Forward coverage risk, cost per covered hour, float pool use, time to confirmed coverage, repeat clinician rate, consecutive short-staffed shifts; formulas given |
| AORN, 3 strategies to reduce nurse labor costs | about 420 words | Equity, cross-training, key metrics (absenteeism, turnover); no overtime or call-out metric |

**Table stakes (in 3 of 3 neighbour pages or the SERP sets):** named metric list with a one-line definition; some mention of overtime as a cost driver; a "review it regularly" cadence. Only Synerion and Medely give formulas; none is a hospital with fewer than 25 beds; none shows a worked example from a roster.

**Gaps a small-hospital nurse manager would want (HYPOTHESIS that the gaps matter; the absence in the inspected pages is a finding, WebFetch 2026-11-02):**
- Sources are the exports a 25-bed hospital actually has (a posted schedule, a payroll export, a callout log that may be a notebook), not a WFM suite.
- A worked example on a roster of about 11 nurses, with small numbers, so one person's pattern is visible. The fair post already builds a roster of 11 on 12-hour shifts; reuse it by link.
- One-page review sheet layout (columns), not a dashboard.
- Honest reading rules for small numbers: with 11 nurses and a handful of callouts a month, one nurse moves the rate. Say what not to conclude.
- Scheduled versus callout-driven overtime split (also in our overtime post, so link).
- Length band: top neighbour pages run 400 to 2,400 words. The draft's 2,905 is above all of them; target 2,000 to 2,400 body words (check-blog howto range is 2,000 to 3,000).

## 3. Overlap with live posts (all draft: false, verified by grep 2026-11-02)

| Live post | Already covers (link, do not restate) | New post can own |
|---|---|---|
| fair-nurse-schedule-small-hospital (4,122 words) | What to count per nurse (weekend, holiday, charge, nights if rotating, extra callout shifts); weekend share math (38 and 62 a year); fill order; "post the counts"; This-Week step "mark anyone more than two weekend shifts above the average"; SSAI section with honest limits (no night balancing, no running charge count, holidays within schedule only, counts on request) | Where fairness sits on the monthly sheet and how it reads next to overtime and callouts (for example, "do the same names appear in the overtime column and the weekend column?"). Reuse the count-vs-average method in one paragraph and link. Do not teach the share math again. |
| how-to-reduce-nurse-overtime | Why overtime is structural; 90-day audit "scheduled or callout-driven"; running totals against 40 hours; headroom check; coverage-without-overtime rate | The measuring sheet: how to build the overtime-by-shift-type view from a payroll export and a schedule. Link for "what to do about it". |
| how-to-handle-nurse-callouts | Callout policy, ranked list, workflow, the five-field callout log, "Reduce callout frequency" (pattern reading in two sentences) | The tally of the log: by weekday, by shift, by notice given, callouts per 100 scheduled shifts. Link for the log fields and for handling. |
| after-hours-callout-coverage-small-hospitals | Four-part cost of one callout (overtime premium, agency premium, manager time, safety risk); CMS 485.635 documentation; per-diem bench | The cost column of the sheet only; link for the four-part framework |
| nurse-staffing-relief-factor | How many nurses it takes to cover a position once time off and absence are counted | Callout and absence data as an input to that factor: "your own callouts per 100 shifts is the real-world check on the relief factor". One sentence, link. |
| texas-nursing-overtime-compliance-cah | FLSA, Texas Ch. 258 mandatory overtime limits, recurring compliance gaps, documentation | Nothing legal; link once for "what the threshold is" |
| what-is-nursing-overtime | Workweek definition, hours worked, shift differential, exemption; primary keyword "nursing overtime" | Nothing; link once. Avoid titling or H2s around "nursing overtime". |
| nurse-manager-scheduling-time-breakdown | 30 to 90 min/week of manual overtime tracking; callout cover as largest time block (4 to 6 hrs/week of 8 to 12) | A way to make the review fast; may cite the time figure by link only |
| nurse-schedule-audit-trail | What to keep and how changes are recorded | Keep each cycle's sheet with the posted schedule; one sentence, link |
| cost-of-losing-a-nurse-rural-hospital | NSI $60,090 with rural math and the 78 days; it already uses the 2026 edition | Link instead of re-deriving turnover cost; use at most one sentence of NSI |
| self-scheduling-problems-critical-access-hospital | "How do you track fairness across scheduling cycles" H2 | Do not reuse that H2 wording |

Not live or not relevant: mandatory-nurse-overtime-by-state (overtime law by state, link only if needed).

## 4. Facts: every claim in the draft

NSI edition rule (dossier, "NSI 2025" entry, line 181 to 186): approved figures $61,110 and 16.4% belong to the 2025 report (CY2024). The same rolling PDF URL now serves the 2026 edition: $60,090 and 17.6%. Do not mix editions. I downloaded the PDF on 2026-11-02 and extracted text with pdftotext; the cover reads "2026 NSI National Health Care...", survey invited "January 2026", dated "March 2026". The draft links the 2025 label to a URL that serves the 2026 edition, so a reader checking the link will not find $61,110. Live posts (cost-of-losing-a-nurse-rural-hospital, 8-hour-vs-12-hour-nursing-shifts) already use $60,090. Recommendation: switch to the 2026 edition.

| # | Draft claim | Dossier match | Verdict |
|---|---|---|---|
| 1 | "the 2025 NSI report puts one avoidable RN departure at $61,110" (Key Takeaways, cost section, Sources) | Dossier "NSI 2025": "average cost to replace one staff RN = $61,110" (2025 report, CY2024). | Matches the 2025 entry but stale and the URL serves 2026. Use 2026: "the average cost of turnover for a bedside RN is $60,090" (NSI 2026 PDF, pdftotext line 110 and 336). Also drop "avoidable": NSI does not say departures are avoidable. |
| 2 | "national RN turnover: 16.4%" (Sources only) | Dossier 2025: 16.4%. 2026 entry: 17.6%. | Stale. 2026 PDF: "RN turnover is recorded at 17.6%, a 1.2% increase". Not needed in body; drop or use 17.6% with the 2026 label. |
| 3 | CDC NIOSH work-hour materials "document that long hours and night work raise fatigue and error risk" | Dossier has NIOSH Module 5 and 9 verbatim lines (circadian clock, night nurses "might get less sleep and poorer-quality sleep than those working the day shift"). | Link resolves in a browser (WebFetch 2026-11-02: title "NIOSH Training for Nurses on Shift Work and Long Work Hours"; curl gets 403 because cdc.gov blocks it, per dossier). The landing page has module headings only ("Injuries/Errors", "Be Aware of the Dangers of Sleepiness and Fatigue"), no body sentences. Supportable, but cite Module 9 p.2 (https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod9/02.html) for the night-shift sentence. |
| 4 | AHRQ PSNet "links inadequate staffing to worse patient outcomes" | Dossier Aiken entry: AHRQ primer may be cited only for the general association; never the 7%. | Link resolves (curl 200, WebFetch 2026-11-02). Verbatim: "documenting an increased risk of patient safety events, morbidity, and even mortality" as patients per nurse rise; and "Longer shifts and working overtime have also been linked to increased risk of error." The second sentence is the better fit for an overtime post. |
| 5 | "Night and weekend callout coverage is the usual culprit at a small hospital, because the pool willing to pick up those shifts is smallest" | None | UNSUPPORTED. No source; the reasoning is plausible. Rewrite as a question the reader's own data answers ("see where your overtime lands"), not a claim. HYPOTHESIS; test: ask 3 CAH nurse managers or cite a source. |
| 6 | "that hidden concentration is the most common source of scheduling grievances on a small nursing team" | None | UNSUPPORTED, and "most common" is blocked by feedback_no_fabricated_stats. Cut. A sourced alternative: NSI 2026 lists "scheduling conflict" among the top reasons staff RNs voluntarily resigned (PDF extract: "Personal issues, relocation, retirement, career advancement, and scheduling conflict were at the top of the list"). |
| 7 | "hospitals that run this once tend to run it every quarter, because the first pass almost always finds one nurse quietly carrying too much" (Our Take) | None | FABRICATED/UNSUPPORTED, pre-launch company with no customers. Cut. |
| 8 | "Callout frequency is predictable at the roster level even though any single callout is not" | None | UNSUPPORTED as a general claim. Replace with a testable instruction: "after three cycles you can see whether yours is steady". |
| 9 | "Eight to twelve weeks, or two to three scheduling cycles, is usually enough to see a pattern rather than noise" | None | UNSUPPORTED rule of thumb. State it as our suggestion for a first pass, and add the small-number caution. NSI-sourced alternative none. |
| 10 | "Build-order effects: whoever fills the schedule assigns the easy shifts first and backfills the hard ones" | Partly echoes the fair post's fill-order method | HYPOTHESIS, no source. The fair post says the fix is fill hardest first; link instead of asserting a cause. |
| 11 | "A healthy pattern is overtime that is low and roughly proportional to the shift's share" / "healthy callout rate you can plan around" | None | These are the author's judgment, no benchmark. Do not add numeric "healthy" thresholds. WebSearch surfaced benchmarks (overtime and call-off under 3 to 5% from a role-description page; "top 10% take over 30% of overtime" from a Synerion vendor blog; Medely's alert thresholds are its own). All are vendor or generic and unverified. Do not use. |
| 12 | "40-hour weekly FLSA overtime threshold" in SSAI section; "applicable FLSA overtime thresholds" (plural) in the Texas-compliance sentence | feedback_no_8and80_overclaim: say "the 40-hour weekly FLSA overtime threshold", not "applicable" or plural | Fix the plural/"applicable" sentence. Singular wording is correct. |
| 13 | Illustrative: agency $95/hr vs per diem $55/hr, 12-hour night, $480 gap | None | Placeholders flagged as such, but invented. Replace with a sourced agency figure: NSI 2026 "nurse travel rates average $91/hour and range to $160/hour" (PDF extract line 468; context: hospitals bridging gaps). Per diem rate: no source; tell the reader to use their own. Keep the hours-based method; product cost claims stay in hours. |
| 14 | Four data sources "no new software required" | None | Method claim, fine. Note payroll export may lack shift type, so the join is by date and nurse (workable, say so). |
| 15 | Coefficient of variation | None | Statistics, correct, but jargon. Cut it; use the fair post's count-vs-average rule ("more than two weekend shifts above the cycle's average"). Keep one FAQ only if a reader might search it, with a plain explanation. |
| 16 | "We are pre-launch and have none" (twice, plus "because we are pre-launch") | memory: no pilot customers, never cite pilot results | The honesty is right, the repetition is awkward. Use one line near the worked example: "These numbers are made up to show the arithmetic." |
| 17 | Healthy 12-hour shifts link, self-scheduling link | n/a | Both slugs exist (12-hour-hospital-shifts-scheduling, self-scheduling-problems-critical-access-hospital); recheck at gate. |

New facts available (read in the NSI 2026 PDF, would need dossier entries via a fact-check pass): travel nurse rate "$91/hour" average, range to "$160/hour"; "less than half (46.1%) of the respondents track" the cost of turnover; "scheduling conflict" among the top reasons RNs resigned; "A quantifiable measure of the severity of a hospitals vacancy rate is contract labor and overtime usage" (NSI 2026, vacancy section, which supports tracking overtime). Cite by report section, not page numbers (pdftotext gave no page numbers).

## 5. Product claims, service mode

Source: `docs/seo/product-capability-inventory-2026-08.md`, section 1b (analytics dashboards and operational counters are PRODUCT-LEANING: in service copy claim the reporting we deliver, not the dashboard), sections 3.2, 3.8, "Holidays, nights and charge counts" (line 426 onward), 4.6, 5.1, 6.

**Allowed (service mode):**
- The AI builds three draft options, our team checks each, the nurse manager approves by email or agreed channel. Never "in the app", "dashboard", "log in".
- Overtime: computed on the 40-hour, Monday to Sunday FLSA week from SCHEDULED shift hours; each assignment carries an overtime flag; the draft is built to avoid overtime where the roster allows. Say "scheduled hours", never actual or paid overtime (no time clock, no payroll, inventory 6 items 2 and 3).
- Callouts: when a nurse calls out, the manager gets a ranked shortlist with reasons; the callout is logged with a reason and the escalation steps taken are recorded (step-level only; it does NOT record who was phoned or what was said, founder correction 2026-09-02).
- Weekend balancing: weekend quota per cycle with carryover from the prior period, and a cap on consecutive weekends. Approved line (fair post): per-nurse weekend and holiday counts sit behind every schedule and we can send that record on request.
- Holidays: "balanced against the team's average within each schedule"; holiday list set at onboarding. No carryover across schedules, no year rotation, no quota.
- Nights: "The scheduler does not balance night shifts when it builds the schedule. Every shift in the schedule record is marked day or night, so we can send a per-nurse night count for any period we built, on request."
- Charge: "does not keep a running count of charge shifts"; the record marks who held charge, so a count can be read off it. Offer on request NOT yet in service runbook R1 (inventory line 461): add charge to R1 before the post promises it, or leave the offer out.
- Audit trail: append-only change log, exportable as CSV (link nurse-schedule-audit-trail).
- Onboarding: 3 to 5 business days; first schedule inside two weeks.

**Forbidden / must not imply:**
- Labor cost in dollars, overtime dollars, agency spend tracking, cost reports (STUB, "Coming Soon", no hourly-rate field; founder ruling 4: all cost claims stay in hours).
- Actual-hours or paid-overtime tracking, payroll or timekeeping integration, reconciliation with payroll.
- Night fairness (NOT IMPLEMENTED), running charge counts, year-over-year holiday rotation, holiday quota.
- Callout analytics delivered to the hospital (day-of-week or shift patterns, callout rate) as a service output: the analytics endpoint has a callout frequency trend, but that is dashboard-leaning and not a runbook deliverable. HYPOTHESIS that the team could run it on request; test: ask the founder or check scheduler runbook R1.
- "Agency tracking" or "per diem bench" features (none exist; agency is a bookkeeping action).
- Nurse-reported callouts, nurse portal, anything requiring a nurse login.
- Safe Harbor: do not mention.
- Seniority rules (hireDate unread), shift bidding.
- A fifth-nurse limitation line is fine and honest; keep it.

**Draft sentences that overclaim (all in "How Does SimpleScheduleAI Help You Analyze Your Schedule?", plus Key Takeaways, This-Week step 5 and the CTA):**
1. "the four measurements in this guide become a byproduct of the scheduling work" and "Overtime exposure, callout frequency, and per-nurse weekend and holiday counts are tracked as the schedule is built": overstates. Cost is not tracked at all; callout frequency is not a delivered report; overtime is scheduled hours only.
2. "the draft distributes weekend and night shifts against the fairness parameters set during onboarding": FALSE for nights. Weekends yes (quota and carryover). Fix: weekends only, and say nights are not balanced.
3. "A system that tracks running hours against the 40-hour weekly FLSA overtime threshold flags the risk while the schedule is still a draft": acceptable only if written as scheduled hours and "the draft is built to stay under it where the roster allows". "A night callout does not quietly push someone past their limit" implies live actual-hours tracking; cut.
4. "so concentration is prevented rather than discovered": overclaims; prevented for weekends only, within the limits above.
5. Step 5 and CTA: "see how a schedule built inside the system produces these four measurements automatically" and "tracks overtime, callouts, and shift fairness as it builds the schedule, so the numbers are there when you need them": cut or rewrite to "we can send you the per-nurse weekend, holiday and night counts for any schedule we built". Also "reconstructing them from payroll each quarter" implies we replace payroll data; cut.
6. Related: "Because the schedule is built inside the system rather than a spreadsheet": service customers do not use a system; say "when we build your schedule".

Suggested replacement paragraph (service mode, plain words): when we build your schedule, the record behind it holds who worked each weekend, holiday, day and night shift, and we can send those per-nurse counts for any period we built. Weekend counts carry into the next cycle; the draft is built to keep nurses under 40 scheduled hours where the roster allows. We do not balance night shifts, track charge shifts, see your actual hours, or report dollars, so the overtime and cost columns of your sheet still come from your payroll export. Closing limitation: a report cannot create a fifth night nurse.

## 6. Our GSC (https://simplescheduleai.com/, WEB, 2026-08-04 to 2026-11-01, dimensions query+page)

Pulled with server-side "contains" filters (the unfiltered top-1000 had more rows, so filters were used instead): metric, kpi, analy, call, overtime, data. Zero clicks on every row.

| Filter | Result |
|---|---|
| metric | none |
| kpi | none |
| callout rate | none (the "call" filter found no "callout rate" query) |
| analytics ("analy") | 11 rows, all 1 to 13 impressions: "nurse staffing analytics software" 2 impr pos 29 (best-nurse-scheduling-software-2026) and 5 impr pos 40.8 (best-nurse-scheduling-software-critical-access-hospitals); "critical access hospital data analytics" 1 impr pos 78; long AI-style prompts about Smart Square, QGenda, SmartLinx analytics 1 to 13 impr, positions 2 to 10 |
| overtime | 28 rows. Largest relevant: "mandatory overtime for nurses" 17 impr pos 58.2 (mandatory-nurse-overtime-by-state); "do nurses get paid overtime" 6 impr pos 8.3; "nurse overtime" 3 impr pos 27.3 (texas-nursing-overtime-compliance-cah) and 3 impr pos 11.3 (what-is-nursing-overtime); "reduce overtime healthcare staffing" 2 impr pos 92.5. None about analyzing or tracking overtime |
| data | 9 rows: "cms staffing data public use file" 23 impr pos 19.1 (cms-pbj-reporting-scheduling-software); "ukg data conversion" 23 impr; none about schedule data analysis |
| call | 47 rows; callout-relevant: "shift callout process" 1 impr pos 49 (12-hour-hospital-shifts-scheduling), "shift callout platform" 1 impr. Nothing for callout rate or tracking |

Finding: we have no impressions on any metrics, KPI, callout-rate or schedule-data query. Consistent with the zero volume above. The post would be a new topic for the site, not a rescue of a query we already show for.

## 7. Proposed outline

Working title: "Nurse Scheduling Metrics: What a Small Hospital Should Track" (keeps the primary; drops "(and Why)"). postType howto, 2,000 to 2,400 body words, target about 2,200. Excerpt must differ from the intro and from Key Takeaways (recurring defect). No "CAH" in headings or tables (recurring defect), plain words, no em-dashes.

Frame: one afternoon, four columns on one sheet, for a roster of about 11 nurses. Hold the whole post to "what to count, how to read it, what NOT to conclude from small numbers".

H2s (each a standalone question a nurse manager would type):
1. **What do you need to pull from your own files to review a nurse schedule?** The four sources (posted schedule, payroll export, callout notebook or log, the last few cycles' schedules). Say plainly that payroll rarely carries shift type, so join by nurse and date. Say what you will NOT have: actual hours if you only have the schedule.
2. **How do you find out which shifts your overtime comes from?** Tag each overtime hour by day, evening, night, weekend; split scheduled versus callout-driven (link how-to-reduce-nurse-overtime for the 90-day audit and the fix). Worked example with made-up round numbers, labeled as made up. Link what-is-nursing-overtime for the 40-hour week and texas-nursing-overtime-compliance-cah. Threshold wording: "the 40-hour weekly FLSA overtime threshold".
3. **How many callouts is too many?** Honest answer: no source gives a number we trust. Count callouts per 100 scheduled shifts, then split by weekday, shift and notice given (same day versus a day or more). Compare with your own last cycle. Link how-to-handle-nurse-callouts for the log fields and handling; link nurse-staffing-relief-factor for "does your real absence rate match the allowance you built in?" Small-number caution: with a handful of callouts a month, one nurse moves the rate.
4. **How do you check whether the hard shifts are shared fairly?** Reuse the fair post's rule in one paragraph: count each nurse's weekend, holiday and night shifts, compare with the cycle's average, look at anyone more than two weekend shifts above it. Link fair-nurse-schedule-small-hospital for the share math, what to count and the fill order. New angle owned here: read fairness next to the overtime and callout columns ("are the same two names in all three?"). No coefficient of variation.
5. **How do you put a cost on what the sheet shows?** Method in hours first (overtime hours, callout shifts filled by overtime versus per diem versus agency), then dollars from the reader's own pay rates. Sourced anchors: NSI 2026 travel nurse rate "$91/hour, range to $160/hour"; turnover cost $60,090 per bedside RN (link cost-of-losing-a-nurse-rural-hospital, do not re-derive). Link after-hours-callout-coverage-small-hospitals for the four-part cost of one callout.
6. **How often should you review it, and what should you do with what you find?** Each cycle for 5 minutes, deeper review quarterly (our suggestion, labeled as such). One page per cycle kept with the posted schedule (link nurse-schedule-audit-trail). Reading rules: change one thing, check the next cycle.
7. **What can SimpleScheduleAI send you for this review?** Only what section 5 allows: per-nurse weekend, holiday and night counts for any schedule we built (nights flagged as counts, not balanced), scheduled-hours overtime, the audit record. Honest limits (no actual hours, no dollars, no night balancing, no charge count). Closing: a report cannot create a fifth night nurse.
8. **Our Take** (immediately before What to Do): one honest paragraph, no invented "tend to run it quarterly".
9. **What to do this week** (this week plan with days, like the fair post): pull exports, build the four columns, mark anyone over the weekend average, tally callouts, write the one thing to change. One book-a-call link, no "see how the system produces these automatically".
10. **FAQ**, 4 to 5 questions: Do I need software? How much data do I need? What is a callout rate and how do I count it? Why does payroll not match my schedule? Is overtime the same as extra hours for a part-timer? (Source of the 40-hour week: link.)
11. **Sources**: NSI 2026 (label and URL as in cost-of-losing-a-nurse-rural-hospital), AHRQ PSNet primer, NIOSH Module 9 page, DOL fact sheet 54 if cited. No bulleted source list in prose; follow the blog template.

Tables: one four-row table (metric, source file, how to count, what a surprise looks like). Avoid "healthy versus concerning" numeric thresholds; use "compare with your last cycle".

## 8. Risks

1. **Cannibalization and thin value.** About 60% of the draft's method already exists across three live posts. Without the "one sheet, small-roster worked example, small-number caution" angle it duplicates them. Mitigation: link-out discipline in section 3; keep each method to a paragraph.
2. **Overclaiming SSAI.** Section 5, especially nights and "automatic" measurements. The fair post is the live reference for approved wording; match it.
3. **Unsupported claims creeping back** (#5, #6, #7, #8 in section 4). check-blog may not catch them; the fact-check agent must.
4. **Numbers without sources.** Any benchmark percentages for "healthy" overtime or callout rates come from vendor pages; do not use. Worked-example numbers must be labeled made up and kept round.
5. **NSI edition mix.** Use the 2026 edition throughout and label it that way; do not cite $61,110 or 16.4%.
6. **Dollar example vs founder ruling.** Cost stays in hours for product claims; reader-facing dollars use the reader's own rates plus the NSI-sourced travel rate. Avoid implying SSAI computes dollars.
7. **Small-number misreads.** An 11-nurse roster makes rates noisy; the post must say so or it will push managers into blaming one person.
8. **Callout log data quality.** Many CAHs keep no log; the post should say start one now (link handle-callouts) rather than assume it exists.
9. **No traffic expectation.** Do not report impressions as acquisition (founder 2026-08-30). Success measure: a link target for the callout, overtime and fair posts, and a usable asset for outreach.
10. **cdc.gov blocks curl (403).** Verify the NIOSH links with WebFetch or a browser at the gate, as noted in the dossier.

## 9. Spend and method notes

DataForSEO about $0.30 (reported costs: search_volume 0.09 twice, bulk_keyword_difficulty 0.013 twice, keyword_overview 0.012 twice; keyword_ideas, three keyword_suggestions and four SERP calls unreported but small; one SERP call errored and was repeated). One keyword_ideas call with a broad seed returned generic "nurse" head terms and was not used. WebSearch and WebFetch used for SERP neighbours and the NSI/AHRQ/NIOSH checks. Not run: Bing Webmaster, Ahrefs.
