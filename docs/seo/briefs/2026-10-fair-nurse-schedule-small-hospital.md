# Brief: How to Build a Fair Nurse Schedule at a Small Hospital (next-15 #5)

Brief, 2026-10-15. Primary keyword "fair nurse schedule"; `keyword-check` clear. GSC, Bing and DataForSEO MCPs were down, so the demand figures are RECORDED. Only the SERP is fresh.

## 1. Demand

- RECORDED (next-15 row 5 only): Bing 42 impressions on fairness and holiday questions; GSC "nurse rotation schedule" at position 5.4. No breakdown exists: grep of monthly-audits, ctr-rewrite-queue, keyword-gap-targets and bing-coverage-log found no such rows.
- RECORDED (keyword-gap-targets row 13, DataForSEO 2026-09-05): "nurse rotation schedule" 20/mo, KD 3.
- **Landing page: NOT RECORDED.** Hypothesis: /blog/fair-holiday-rotation-nurses-cah, the only live post with "rotation" in its title. Test: GSC, query "nurse rotation schedule", dimension page, 2026-07-02 to 09-30.
- **Intent warning (fresh):** the "nurse rotation schedule" SERP is shift patterns, #4's intent. Use "fair nurse rotation" here; founder may hand that keyword to #4.

## 2. Cannibalization map

| Live post (registry primary) | Owns | #5 does only |
| --- | --- | --- |
| fair-holiday-rotation-nurses-cah ("fair holiday rotation for nurses") | A/B/C holiday method | Holiday counts per nurse, link |
| nursing-staff-scheduling-small-hospital ("nursing staff scheduling"; H2 "How Do You Keep a Nurse Schedule Fair for Weekends and Holidays?") | Headcount, build steps, callouts | Reuses its two-nurse example by link |
| cyclical-scheduling-vs-self-scheduling-small-hospital ("self scheduling for nurses") | Choosing a model | One sentence, link |
| self-scheduling-problems-critical-access-hospital ("self-scheduling problems"; H2 "How Do You Track Fairness Across Multiple Scheduling Cycles?") | Fairness under self-scheduling | Manager-built schedules; avoid its H2 wording |
| self-scheduling-manager-workload-trap ("self scheduling nursing"); what-is-a-baylor-shift; what-is-a-charge-nurse | Self-scheduling disputes; weekend programs; charge role | One sentence each, link |
| Held #4 nurse-shift-schedules-types-rotation-patterns ("nurse shift schedule") | Patterns, weekends per pattern | No pattern tables |

**#5 owns** per-nurse load on a small roster (8-hour and 12-hour), what to count, fill order, fair unevenness, seniority, showing the counts. **Not:** headcount, holiday method, model choice, patterns.

**T10, tell the founder:** (a) #3's example threshold "No more than two weekends in a four-week cycle" fails on 8-hour shifts in #3's own example: an even split gives about 2.4 weekends per 4 weeks. Do not repeat it. (b) The holiday post's groups assume 20 to 30 nurses. At 10 or 11 nurses a group is 3 or 4 nurses: a group of 4 covers a 12-hour holiday (4 needed), and no group covers an 8-hour one (6 needed).

## 3. SERP (WebSearch, fresh)

Academic papers lead both fairness queries; skipped, as were ByteBloc (2022, thin) and HealthStream rotation (2021). Mapped: HealthStream fairness (2025-03, about 1,100 words), Nursa holiday staffing (2024-12, about 2,100), Connecteam (2026-08, about 3,300). On seniority, Nursa alone: "prioritize requests off by senior staff (but don't overdo it)".

- **Table stakes:** written rules; spread weekends, holidays, nights; preferences; shifts in a row; visible schedule; favoritism.
- **Gaps:** nobody counts each nurse's weekend or holiday shifts, or shows exemptions and charge landing on a few nurses.
- **Length:** about 1,100 to 3,300 words.

## 4. Draft audit

No reviewer quotes, competitor claims or CFR cites in either draft.

**A. fair-nurse-schedule-critical-access-hospital**

| Claim (line) | Verdict |
| --- | --- |
| 2099 publish date; 2026-04-01 update (3-4) | FIX: real dates (T12) |
| Excerpt "nights", "without manual tracking"; TL;DR (8-11, 23) | FIX: new hook, Key Takeaways |
| NSI 2025 $61,110 (27-29, 47, 371) | FIX: 2026 NSI $60,090 (dossier L294; corpus uses it). Out of KT (T1) |
| "typically 4-8 / 4-6 weeks" (35, 95) | FIX: "for example 4 or 6 weeks" |
| Full-time = 36 hours (39) | FIX: 0.9 of full time (#3 L65) |
| "15-20 staff", "60%", "mathematically likely", "3-4 nurses absorb 50%", "same 2-3 nurses", per-diem attrition (44-83) | CUT the figures; KEEP the mechanism |
| "3-4 weekend shifts" per 4 weeks (100, 323) | FIX: hook |
| "15 minutes", "30 to 45 minutes", "15 to 30" (105, 251) | CUT |
| 2x-weekend check; "two above average" (112, 178) | KEEP, labelled example |
| "3-4 consecutive nights" (118) | CUT |
| "three or four" charge-qualified (130) | FIX: at least 5, 6 on 12-hour (#3 L103-105) |
| "8 weekend days" (165) | FIX: shifts = days x shifts x nurses |
| Inline SVG (187-232); tools H2, "managed scheduling services" (263-291) | CUT |
| Product: "holiday rotation cycles, charge duty frequency, night shift caps by FTE" (297) | FIX: weekend quota with carryover, consecutive-weekend cap, holidays vs team average, charge spread (inventory 4.3, L267). CUT nights, cycles, FTE |
| "fairness summary per nurse" (300) | FIX: drafts scored on Fairness (L208); `fairness-record` "we can send you that record on request" |
| "availability update workflow" (308) | CUT |
| CTA about overtime (375) | FIX: `triad` |
| "Most managers", "common tiebreaker", "Most per diem agreements" (331-343) | CUT |

**B. seniority-vs-fairness-nurse-scheduling**

| Claim (line) | Verdict |
| --- | --- |
| "leading driver of turnover", "3-4 nights/month", 8% turnover, 4-5 year wait (25-43) | CUT (NSI says 17.6%) |
| AONL survey link (45) | CUT (404; dossier L436 bars AONL) |
| Two SVGs, "67/47/33/20% CAHs surveyed" (49-120) | CUT (fabricated) |
| Three policy parameters (72-76) | KEEP |
| "Typical" tiers 6/4/3/2 (82-89) | FIX: "one example policy" |
| Pushback: "accepted lower pay", "common approach" (126-132) | CUT those; KEEP grace period |
| Title VII "protected right", ADA childcare (138-140) | CUT; "route accommodations through HR" |
| Product stores seniority tiers, caps, flags (146-150) | CUT: `hireDate` never read, no bidding (inventory 4.6) |
| Union boundary; "days rather than months" (152) | KEEP boundary; FIX to `setup-timeline` |
| Per-diem seniority, "Many CAHs", "At most hospitals", "Most CAH policies" (142-186) | CUT |

No Texas or union seniority claim survives; no source gives a Texas CAH union rate, so state none.

## 5. Merge plan

- **postType `howto`** (band 2,000 to 3,000; aim about 2,600). Diff against nursing-staff-scheduling-small-hospital, how-to-handle-nurse-callouts, how-to-reduce-nurse-overtime. 3 visuals, no SVG.
- **Title:** keep. **Slug:** `fair-nurse-schedule-small-hospital` (matches title and #3; free while unpublished).

| H2 | Serves | Fed by |
| --- | --- | --- |
| What Makes a Nurse Schedule Fair? | primary | A 32-42; B 68 |
| How Many Weekend and Holiday Shifts Does Each Nurse Work on a Small Roster? | Bing; gap | NEW hook |
| Which Shifts Should You Count for Every Nurse? | table stakes | A 49-53, 93-98 (reader tallies nights) |
| In What Order Should You Fill Shifts to Keep a Nurse Schedule Fair? | build | A 151-185 |
| When Is an Uneven Nurse Schedule Still Fair? | gap | A 121-149; B 136 |
| How Should Seniority Factor Into a Fair Nurse Schedule? | seniority | B 72-89, 126-132 |
| How Do You Show Nurses Their Schedule Is Fair? | table stakes | A 234-261 |
| How Does SimpleScheduleAI Keep a Nurse Schedule Fair? | product | FIX rows. Boundaries: no night count, no seniority, no self-scheduling. The inventory shows no year-over-year holiday cycle; founder confirms (T20) |

Then Our Take, What to Do This Week, FAQ (A 334-355, B 172-190, fixed) and Sources.

**Hook (our arithmetic, script-checked, labelled illustrative):** #3's two nurses on every shift, 104 weekend days, the holiday post's 5 holidays, one shift per nurse per day, even split.

| | 12-hour | 8-hour |
| --- | --- | --- |
| Nurses (#3 example) | 11 | 10 |
| Nurses needed each weekend day or holiday | 4 | 6 |
| Weekend shifts per nurse per year | about 38 (19 full weekends) | about 62 (31 full weekends) |
| One nurse exempt: each other nurse gains | about 4 weekend shifts | about 7 weekend shifts |
| Holiday shifts per nurse per year | about 2 | 3 |
| Charge share of a charge nurse's shifts, 6 / 8 qualified | 9 in 10 / 2 in 3 | 4 in 5 / 3 in 5 |

The citable line: every weekend shift one nurse does not work is a shift someone else on the roster works.

## 6. Links

**Out (live):** /critical-access-hospital-scheduling, /ai-nurse-scheduling, /how-it-works, /pricing; /blog/ nursing-staff-scheduling-small-hospital, fair-holiday-rotation-nurses-cah, cyclical-scheduling-vs-self-scheduling-small-hospital, self-scheduling-problems-critical-access-hospital, self-scheduling-manager-workload-trap, what-is-a-baylor-shift, what-is-a-charge-nurse, nurse-staffing-relief-factor, 8-hour-vs-12-hour-nursing-shifts, cost-of-losing-a-nurse-rural-hospital. Not held #4.

**In:**

- `nursing-staff-scheduling-small-hospital.md` L173: "Set a number for weekends, count weekends and holidays for every nurse, and carry the counts from one cycle to the next." Anchor: "count weekends and holidays for every nurse".
- `cyclical-scheduling-vs-self-scheduling-small-hospital.md` L203: "Decide how you will carry fairness across cycles, a rotation count or a cross-cycle load record..." Anchor: "carry fairness across cycles".
- `fair-holiday-rotation-nurses-cah.md` L83: "...because nurses cannot verify fairness and the manager cannot prove it." Anchor: "nurses cannot verify fairness".

## 7. New facts (drop all)

Title VII and ADA law (not in the dossier); seniority or union prevalence (no source); fairness causing turnover (AONL barred).

**Founder conflict:** runbook R1 puts nights in the on-request record; live #3 says "The service does not count nights per nurse." Claim weekends and holidays only.

## 8. Source drafts

Retire the seniority draft after this goes live (about 400 words carry over; its product section is wrong). List it under next-15 "Already copied into a keeper"; delete on the founder's yes. No redirect needed.
