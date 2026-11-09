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
| 1   | [ ]  | Safe Harbor Nursing in Texas: What a DON Does When a Nurse Invokes It | safe harbor nursing | 1,000 searches/mo (+50 "texas"). SERP checked: Reddit, StatPearls, the Texas Board of Nursing rule and a university form. No vendor and no hospital-operations answer. No live post mentions it | Texas Board of Nursing rule text read at source (22 TAC 217.19/217.20). It is about unsafe assignments, so it is staffing, but never imply the software decides safety |
| 2   | [ ]  | Low Census at a Small Hospital: Who Goes Home and How to Rotate It Fairly | low census | 1,600/mo ("low census nursing" 70). SERP checked: union and hospital policy pages. ShiftMed ranks 12 to 29 | Service framing only: the capability inventory says the low-census action cannot be claimed in product mode |
| 3   | [ ]  | What Is a Swing Bed? Staffing a Critical Access Hospital Swing-Bed Program | what is a swing bed | 1,000/mo; "swing bed program" 210; "cah swing bed requirements" 30. Swing beds appear only inside the CNA post | SERP is CMS and patient pages, so an administrator angle ranking is a hypothesis. Dossier already holds the swing-bed PBJ exemption and 485.645 facts |
| 4   | [ ]  | Nurse On-Call Scheduling at a Small Hospital | on call schedule | 480/mo; "on-call scheduling software" 170; "on call schedule template" 140. Bing: 12 impressions incl. "nurse on call scheduling for small hospital" | Skip "on call nurse" (1,600): SERP is nurse advice lines. On-call limits are a shipped rule |
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

**Pace (founder-agreed 2026-11-09): one live-page improvement a week, alongside the week's
new post.** Google has no penalty for improving pages, as far as we know; the reason to
space them out is measurement. `npm run change-log` judges each edit on 28 days of Search
Console data before and after, and a second edit to the same page inside those 28 days
makes that page's verdict unreadable. So: never edit the same page twice within 28 days,
move `updateDate` only for a real change, and leave the pages edited on 2026-11-09 (UKG,
critical access hospital scheduling, the 92-count sweep pages, the RHTP article) alone until
their verdicts come due around 2026-12-09.

| Done | Live page | Search to win | What to do |
| ---- | --------- | ------------- | ---------- |
| [x]  | `/blog/nurse-rostering-vs-scheduling-software` | 354 impressions at 12.4 (210/mo) | Already live: the R1 title shipped 2026-11-01 (88e6cc2d). Judge from 2026-12-01; no edits before then |
| [ ]  | `/blog/12-hour-hospital-shifts-scheduling` | "how many hours do nurses work" cluster: about 1,790/mo, GSC 225 at 20.2 (211 on this post); Bing 272 | Add a section; a new page would split the post that carries a third of site growth |
| [ ]  | `/blog/nurse-staffing-models` | "team nursing" 720, functional 480, primary 320, all with 0 GSC; ChatGPT already names us for "4 models of nursing care" | Add model-name sections or retitle |
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
