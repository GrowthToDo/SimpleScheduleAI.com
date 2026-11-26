# Next 15 blogs: November 2026 plan

Made 2026-11-09 and approved by the founder the same day: publish one at a time, top to bottom unless a
better week calls for another. The October list (`next-15-blogs-2026-10.md`) is done: 13 live, 2
set aside (#4 shift rotation patterns, #12 healthcare vs generic software).

Sources:

- **Google Search Console** (GSC): 2026-08-09 to 2026-11-06, final data, 1,707
  queries. "GSC 129 at 34.8" = 129 impressions at average position 34.8.
- **Bing Webmaster**: weekly query stats, 2026-08-07 to 2026-11-06 (1,293 impressions).
- **Search volume**: Google Ads US monthly searches, 12-month average (DataForSEO).
  Keyword difficulty came back as 0 for most terms, so it is not used here.
- **Competitor gaps**: DataForSEO ranked keywords for ShiftMed, NurseGrid, symplr,
  QGenda and In-House Health, checked against our 114 live posts and the keyword registry.
- **Monthly audits**: November and October audits, GEO report, AEO tracking.
- **Drafts**: all 24 unpublished drafts, triaged.

What a searcher wants is a hypothesis unless the line says the SERP was checked.

## How to use this file

Same as October. Say "write #N" and Claude runs the normal pipeline
(`.claude/skills/publish-pipeline.md`). Tick the box when an item goes live.

**Effort key:** _New_ = written from scratch. _Retarget_ = an existing draft is reused for
a new keyword. Every item is New unless marked: none of the 24 drafts is close to ready.

## The 15

| #   | Done | Working title | Primary keyword | Why this one (demand) | Watch out for |
| --- | ---- | ------------- | --------------- | --------------------- | ------------- |
| 1   | [x]  | Safe Harbor Nursing in Texas: What a DON Does When a Nurse Invokes It | safe harbor nursing | 1,000 searches/mo (+50 "texas"). SERP checked: Reddit, StatPearls, the Texas Board of Nursing rule and a university form. No vendor and no hospital-operations answer. No live post mentions it | Texas Board of Nursing rule text read at source (22 TAC 217.19/217.20). It is about unsafe assignments, so it is staffing, but never imply the software decides safety. Done 2026-11-16 |
| 2   | [x]  | Low Census at a Small Hospital: Who Goes Home and How to Rotate It Fairly (live 2026-11-18 as /blog/low-census-small-hospital, titled "Low Census at a Critical Access Hospital: Who Goes Home and What You Pay") | low census | 1,600/mo ("low census nursing" 70). SERP checked: union and hospital policy pages. ShiftMed ranks 12 to 29 | Service framing only: the capability inventory says the low-census action cannot be claimed in product mode |
| 3   | [x]  | What Is a Swing Bed? Staffing a Critical Access Hospital Swing-Bed Program | what is a swing bed | 1,000/mo; "swing bed program" 210; "cah swing bed requirements" 30. Swing beds appear only inside the CNA post | SERP is CMS and patient pages, so an administrator angle ranking is a hypothesis. Dossier already holds the swing-bed PBJ exemption and 485.645 facts Done 2026-11-23 |
| 4   | [x]  | Nurse On-Call Scheduling at a Small Hospital (live 2026-11-26 as /blog/nurse-on-call-schedule) | on call schedule | 480/mo; "on-call scheduling software" 170; "on call schedule template" 140. Bing: 12 impressions incl. "nurse on call scheduling for small hospital" | Skip "on call nurse" (1,600): SERP is nurse advice lines. On-call limits are a shipped rule. Done 2026-11-26. Check GSC for "on call schedule" from about 2026-12-24 |
| 5   | [ ]  | Position Control for Nursing: Matching Budgeted FTEs to the Schedule | position control | 480/mo. ShiftMed ranks #4 (live SERP #1) | Position control usually draws on payroll and HR data; we have no payroll or HRIS link, so keep it to the schedule side |
| 6   | [ ]  | Staffing Grids and Nursing Hours per Patient Day at a Small Hospital | staffing grid | "staffing grid" 140 + "staff grid" 140; HPPD variants about 200. HPPD is mentioned in 5 posts but owned by none | "staffing grid" is partly NurseGrid brand searches. Census bands that set required RNs/LPNs/CNAs are shipped |
| 7   | [ ]  | Clinical Ladder Levels and How They Shape a Small Hospital's Schedule | clinical ladder nursing | 260/mo ("…program" 170). GSC 129 at 34.8 across 16 queries, landing on the wrong page (best-CAH list) | No ladder management or credential tracking. Only the preceptor and supervision-level rules are real |
| 8   | [ ]  | Nurse Fatigue and the Schedule: What a Small Hospital Can Control | nurse fatigue | 260/mo. symplr glossary ranks 12 to 27 | The 12-hour shifts post has fatigue sections; decide the split before writing so the two do not compete |
| 9   | [ ]  | Flexible Scheduling for Nurses at a Small Hospital | flexible scheduling for nurses | 170/mo. ShiftMed #1, QGenda #14. No live page | No nurse self-service logins (service mode); frame flexibility as what the manager offers |
| 10  | [ ]  | Block Scheduling in Nursing | block scheduling nursing | 110/mo. GSC 22 at 32.2 (lands on the 12-hour post); Bing 11. No live post mentions it | SERP mixes nursing and operating-room block scheduling; write for nursing |
| 11  | [ ]  | What Is an Open Shift, and How Does a Small Hospital Fill One? | open shift meaning | 110/mo. ShiftMed ranks 4 to 5 | Skip "open shifts" (320): mostly Red Hat OpenShift |
| 12  | [ ]  | PRN Nurse: What It Means and How PRN Staff Fit a Small Hospital Schedule | prn nurse | "prn nurse" 3,600; "prn meaning nursing" 1,900; "per diem vs prn" 1,000. GSC 0 even though the per-diem post has a PRN section | **Your call:** first try retitling `what-is-per-diem-nursing`; a new page risks competing with it and the PRN pool post |
| 13  | [ ]  | 12-Hour Rotating Shift Patterns for Nurses | 12 hour rotating shift schedule | 590/mo ("rotating shift schedule" 210). GSC rotating cluster 135 at 15.9 | _Retarget_ the set-aside draft `nurse-shift-schedules-types-rotation-patterns`. Open October item: read the Q1 title test first. DuPont/Pitman intent not checked |
| 14  | [ ]  | The Staffing Coordinator at a Critical Access Hospital | nurse staffing coordinator | 70/mo; GSC 11. On the September gap list | "staffing coordinator" (1,300) is likely job-seeker intent; aim at the nurse-staffing version |
| 15  | [ ]  | Incremental Overtime: The Hours That Add Up Before Anyone Notices | incremental overtime | 90/mo. ShiftMed ranks #10 | Could be a section of `how-to-reduce-nurse-overtime` instead; check before writing |

## Improve these live pages instead of writing new ones

**Pace (founder-agreed 2026-11-09, changed 2026-11-17): each week, one BIG live-page change (a new
or rewritten section) and one SMALL one (a title, meta description, heading, a single line or
link), on different pages, alongside the week's new post.** Each row's "What to do" starts with
BIG or SMALL; an untagged row counts as BIG. Two pages that compete for the same search never go
in the same week, and a site-wide sweep never goes in alongside them. Google has no penalty for improving pages, as far as we know; the reason to
space them out is measurement. `npm run change-log` judges each edit on 28 days of Search
Console data before and after, and a second edit to the same page inside those 28 days
makes that page's verdict unreadable. So: never edit the same page twice within 28 days,
move `updateDate` only for a real change, and leave the pages edited on 2026-11-09 (UKG,
critical access hospital scheduling, the 92-count sweep pages, the RHTP article) alone until
their verdicts come due around 2026-12-09.

| Done | Live page | Search to win | What to do |
| ---- | --------- | ------------- | ---------- |
| [x]  | `/blog/nurse-rostering-vs-scheduling-software` | 354 impressions at 12.4 (210/mo) | Already live: the R1 title shipped 2026-11-01 (88e6cc2d). Judge from 2026-12-01; no edits before then |
| [ ]  | `/blog/12-hour-hospital-shifts-scheduling` | "how many hours do nurses work" cluster: about 1,790/mo, GSC 225 at 20.2 (211 on this post); Bing 272 | BIG: Add a section; a new page would split the post that carries a third of site growth |
| [x]  | `/resources/nurse-schedule-template` | "nursing staff schedule template": 37 impressions in 28 days to 2026-11-14, split with `/blog/free-nurse-scheduling-software` (7.7) while this page sits at 21.2 | SMALL: Cannibalization fix (founder go 2026-11-17): add "nursing staff schedule template" wording to the title and H1 so the template page owns template searches. Leave the free post alone (held to 2026-12-01; it already links here) Done 2026-11-17: title "Nurse Schedule Template: Free Nursing Staff Schedule Template (Excel)", H1 "Free nursing staff schedule template for small hospitals". Judge from about 2026-12-17 |
| [x]  | `/blog/nurse-to-patient-ratios-by-state` | "nurse patient ratio laws by state" 21.5, "legal nurse to patient ratio" 15.0 (28 days to 2026-11-14). These searches moved here from `/blog/nurse-staffing-ratios-critical-access-hospital`, which held them at 4.3 and 7.0 | BIG: Decay fix (founder go 2026-11-17): make this the clear owner of state ratio-law searches and strengthen it. Test: the by-state search climbs from 21.5 in the 28 days after Done 2026-11-25: title now "Nurse-to-Patient Ratio Laws by State", new verified 17-state law table, NY ICU ratio, MN, OR date and TX corrections. Judge from about 2026-12-25 |
| [ ]  | `/blog/nurse-staffing-ratios-critical-access-hospital` | Views fell from about 600 to 280 a month, place 6.8 to 9.5, as its ratio-law searches moved to the by-state posts | BIG: Decay fix (founder go 2026-11-17), the week after the by-state edit: keep the CAH-specific ratio rules here and point the state-law part at `/blog/nurse-to-patient-ratios-by-state` with a clear link |
| [ ]  | `/blog/best-nurse-scheduling-app` | "nurse schedule app free": 40 impressions in 28 days to 2026-11-14, split with `/blog/free-nurse-scheduling-software` (7.8) while this page sits at 9.7 | SMALL: Cannibalization fix (founder go 2026-11-17): one plain line near the top pointing free-app readers to the free post; keep this post about paid and mobile apps |
| [ ]  | `/blog/8-hour-vs-12-hour-nursing-shifts` | 1,184 impressions at 8.9 with 1 click in 28 days to 2026-11-14 (2 of 863 the 28 days before); "8 hour vs 12 hour night shift" rose from 6 to 15 | SMALL: new title and meta description that answer the 8 vs 12 hour question for a small hospital, and one FAQ answer on night shifts. Backlog plan 2026-11-17; desk estimate about 9 clicks a month |
| [x]  | `/blog/nurse-staffing-models` | "team nursing" 720, functional 480, primary 320, all with 0 GSC; ChatGPT already names us for "4 models of nursing care" | Add model-name sections or retitle. Done 2026-11-16: retitled with all four model names and one H2 per model. Judge from about 2026-12-16 |
| [ ]  | `/blog/what-is-a-float-pool-nurse` | "float nurse" 720/mo; GSC 19 at 49 | Check overlap with the other float post first |
| [ ]  | `/blog/acuity-based-staffing-small-hospital` | 159 impressions at 17.5 (110/mo) | Strengthen |
| [ ]  | `/blog/what-is-symplr-smart-square` | "best alternative to avantas" 50 at 3.2 | Add an Avantas-history section from the dossier |
| [ ]  | `/critical-access-hospital-scheduling` | "cah staffing rules" | Done 2026-11-09 (04d9bbad): staffing-rules section added. Judge from 2026-12-09 |

## Drafts to retire (DONE 2026-11-09: 23 deleted on the founder's yes)

None of the 23 was ever live and no live page linked to any of them (checked 2026-11-09), so the
deletion has no search effect. Git history keeps every file.

All 24 drafts were triaged on 2026-11-09. None is close to ready. Two more join the
October retire list: `nursing-software-critical-access-hospitals` and
`healthcare-staffing-solutions-critical-access-hospitals` (April-era, "managed service"
self-label, uncited 8 to 12 hour figures). The four review-mining drafts carry
unverified reviewer quotes and must never be finished. `nurse-shift-schedules-types-rotation-patterns`
is kept for #13.

## Left out, and why

- Hospitalist and physician questions (272 impressions): we do not schedule physicians.
- Scheduling API and integration questions: we do not integrate.
- Night shift differential (390/mo): a payroll topic.
- Credential questions: we do not track credentials.
- "nurse schedule" / "rn schedule" (1,300 each): NurseGrid's homepage owns them; likely nurse-app intent.
- "cms staffing" (880): nursing-home rule intent.
- Self-scheduling: two live posts already own it, and we have no nurse self-scheduling.
- Charge nurse report sheet: deferred in October (patient-level form).

## AI citations

ChatGPT's top sources for "critical access hospital" and "nurse staffing" are CMS,
Wikipedia, RHIhub, Leapfrog and trade press, with no vendor in the top list (DataForSEO
LLM mentions, 2026-11-09). Hypothesis: our posts on those topics get cited only when
they are grounded in primary sources (42 CFR 485, Texas rules). Test: re-run the check
30 days after #1 and #3 go live.
