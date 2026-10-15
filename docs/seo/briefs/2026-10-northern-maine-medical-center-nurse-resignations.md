# Brief: Northern Maine Medical Center ER nurse resignations (Newsroom)

Brief, 2026-10-15. Load `.claude/skills/trendjacking-articles.md` before drafting. Plan entry:
`docs/seo/articles-trendjacking-plan.md`, "HELD - Northern Maine Medical Center ED nurse
resignations". Draft: `src/data/article/northern-maine-medical-center-er-nurse-schedule.md`.

## 1. Sources read (originals, 2026-10-15)

All four news pages were downloaded with curl and their paragraph text extracted locally, so
the quotes below are from the page HTML, not from a model summary. Curly quotes in the
originals are shown straight.

1. **The Maine Monitor, John Forbes, "Half of emergency room nurses in northern Maine hospital
   quit", published 2026-10-01 11:26 ET** (schema `datePublished`). The direct fetch WORKED this
   time with curl and a browser user agent (WebFetch still fails with "Header overflow"). The
   Yahoo syndicated copy was not needed.
   https://themainemonitor.org/half-nurses-fort-kent-quit/
2. **Bangor Daily News, Kathleen Phalen Tomaselli, "6 emergency nurses at Aroostook hospital
   resign amid dwindling morale", 2026-10-01 (page shows updated 2026-10-02).**
   https://www.bangordailynews.com/2026/10/01/aroostook/aroostook-health/emergency-nurses-northern-maine-medical-center-resign/
3. **Bangor Daily News, Kathleen Phalen Tomaselli, "NMMC emergency nurses blame toxic work
   environment for mass resignations", 2026-10-02.**
   https://www.bangordailynews.com/2026/10/02/aroostook/aroostook-health/nmmc-emergency-nurse-resignations-toxic-work-environment/
4. **CMS Provider Data Catalog, Hospital General Information** (dataset xubh-q36u, modified
   2026-07-22, released 2026-08-13), queried through the data.cms.gov API for state = ME.
   https://data.cms.gov/provider-data/dataset/xubh-q36u

Never cite news.ssbcrack.com (unsourced rewrite site; it still shows up in search results for
this story).

## 2. Each plan figure, checked

| Plan figure (UNVERIFIED on 2026-10-07)        | Result                                     | Verbatim                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 25 beds                                       | VERIFIED (two outlets)                     | Monitor: "the 25-bed critical access hospital". BDN (both days): "The critical access 25-bed hospital's emergency department".                                                                                                                                                                                                                                                                              |
| Critical Access Hospital status               | VERIFIED (primary)                         | CMS Hospital General Information row: facility_id 201317, "NORTHERN MAINE MEDICAL CENTER", FORT KENT, ME, hospital_type "Critical Access Hospitals", emergency_services "Yes". Flex Monitoring's list 403s our tools (WebFetch and curl), so CMS was used instead. Monitor adds the hospital "has taken steps ... including converting to critical access hospital status". No designation date found.   |
| About 7,000 ER visits a year                  | VERIFIED                                   | BDN: "treats approximately 7,000 patients annually, averaging 19 patient visits per day." Monitor: "It averages 19 patient visits per day ... and one to two patient visits at night." (7,000 / 365 = 19.2)                                                                                                                                                                                              |
| 13 RNs in June, 10 full-time, 3 per diem      | VERIFIED                                   | Monitor: "In June, the emergency department had 13 registered nurses. Ten worked full time, and three worked flexible, per-diem shifts as needed."                                                                                                                                                                                                                                                        |
| 5 full-time + 1 per diem left or gave notice  | VERIFIED                                   | Monitor: "Since then, five full-time nurses and one per-diem nurse have left the hospital or put in their notice, said Maxwell and Kim Paradis". BDN 10/01: "In the last month and a half, six nurses, five full-time and one per diem, will have left the 13-nurse unit, she said."                                                                                                                     |
| 3 contract nurses                             | VERIFIED (union source)                    | Monitor: "Maxwell said the emergency department has taken on three contract nurses so far."                                                                                                                                                                                                                                                                                                              |
| Night registration clerk cut Sep 6            | VERIFIED (union source)                    | Monitor: "Then, on Sept. 6, the hospital eliminated the waiting room clerk position responsible for checking patients into the emergency department at night, Maxwell and Paradis said." Hospital says remaining staff "are trained on the registration process". BDN: "the 11 p.m. to 7 a.m. night shift".                                                                                            |
| Two-to-one overnight RN plan withdrawn        | VERIFIED, with a correction                | Monitor: "the hospital told employees it would cut overnight staff in the emergency department further, moving from two registered nurses to one nurse and a nurse technician, Maxwell said. The hospital scrapped the change ... '[It is] not a model we are moving to,' Sime confirmed." Correction: the plan was one RN PLUS a nurse technician, not one RN alone.                                    |
| Night staffing                                | VERIFIED (hospital statement)              | Monitor: overnight "staffed during this time by two registered nurses, one nurse practitioner or physician assistant, one physician, one security officer and a nurse supervisor, who does not take on an assigned patient load, according to the hospital's statement." Also: "The hospital previously had only one registered nurse on staff overnight until 2023, when it added another nurse".        |
| Letter: day/night rotation, scheduling changes | VERIFIED as BDN's paraphrase, NOT letter text | BDN 10/02: "At issue ... as stated in the letter to Zewe, include ... staff are pressured into working a shift rotation (a mix of day and night shifts); working short staffed; and changes to scheduling practices." The letter itself is not published. Attribute as "the letter, as the Bangor Daily News described it". Only letter words in quote marks: "nurses are walking out of the hospital and are not coming back." |
| Traveler pay $50-90/hr plus housing           | CORRECTED                                  | BDN 10/02: "The hospital is offering the traveling nurses $50 an hour and $90 an hour for overtime as well as paid housing for a 16-week contract, according to Maxwell." It is $50 regular and $90 overtime, per a union nurse, not a $50 to $90 range, and not confirmed by the hospital.                                                                                                              |
| Hospital's explanation                        | VERIFIED                                   | BDN 10/01 (Sime, reported speech): "Two RN's left for promotional opportunities into leadership positions at other facilities, one left to become a travel RN, one left to move out of state, one was a per diem RN used intermittently as needed, three of these RN's asked to remain in a per diem status and/or applied for other positions within the hospital, she said." Direct: "The ER remains staffed with fully qualified staff including RNs". BDN 10/02: "other opportunities and a move out of the area". Monitor: "Northern Maine Medical Center maintains a staffing model designed to provide safe, continuous emergency care 24 hours a day, seven days a week, ensuring patients have access to care at all times." |
| $3.6M FY2025 loss                             | VERIFIED, kept OUT of the article          | Monitor: "the hospital ended its 2025 fiscal year with $3.6 million in losses ... according to its tax forms." Hospital: finances have "vastly improved, year over year." Left out: it answers a different question (T2) and placed next to the clerk cut it would imply a motive no source states.                                                                                                       |

Also verified and usable: union contract ratified in May (BDN, Monitor); nurses represented by
the Maine State Nurses Association / National Nurses Organizing Committee; next-closest ER in
Caribou, "nearly an hour's drive away" (Monitor); the hospital "hires contract staff in the
event of an unexpected staff departure to maintain coverage until a replacement is recruited"
(Monitor, Sime).

**Shift length: NOT published.** No source says whether the ER nurses work 12-hour or 8-hour
shifts. The 11 p.m. to 7 a.m. window is the hospital's description of overnight, and the
clerk's shift, so it does not settle the nurses' shift length. The article shows both patterns
and says so.

**Day staffing: NOT published as a number.** Two RNs is published only for overnight. A union
nurse told WAGM (10/12) that an unfilled "mid-shift nurse ... left the busiest part of the shift
with only two nurses", which implies two RNs is the floor by day as well. The article treats
two nurses around the clock as a floor and says so.

**Rotating-shift health or retention claim: NONE.** No primary study was read, so the article
makes no claim about what rotation does to nurses' health or turnover. (Search results surface a
2025 WESA story and UK press, neither a primary study.)

## 3. What changed since October 2

- **WAGM-TV, 2026-10-06, "Six Emergency Department Nurses Leave N.M.M.C."** Adds that "several
  others have given notice". Lists the Maine State Nurses Association's reasons, including
  "pressure of shift rotations and changing schedules". Quotes the hospital's press release: "In
  the event of an unexpected staff departure, Northern Maine Medical Center utilizes highly
  experienced travel Registered Nurses to maintain coverage while recruiting qualified staff",
  plus growth in "trauma surgery, orthopedics, cardiology, urology, pain management and
  rehabilitation and therapy services".
  https://www.wagmtv.com/2026/10/06/six-emergency-department-nurses-leave-nmmc/
- **NMMC Board of Trustees letter, "Emergency Department Quality Outcomes Reassurance Letter"
  (nmmc.org, undated, released the week of 2026-10-05 per WAGM).** nmmc.org 403s both WebFetch
  and curl and has no Wayback copy, so it was NOT read directly. Carry it only through WAGM's
  wording (10/12): "The Board called it safe, well-staffed, and says it delivers high-quality
  care. The Board also said that staffing levels are planned around patient volume and acuity
  and are reviewed every shift." Search snippets also show "not supported by our data, our
  oversight, or most importantly our quality outcomes"; do not quote it until read directly.
- **WAGM-TV, 2026-10-12, "NMMC Nurse Speaks Out on Recent Nurse Departures".** Terry Caron, an
  NMMC nurse: "they are also having nurses rotate shifts from day to night/night to day and then
  they also changed the way scheduling was handled for no reason." Also the unfilled mid-shift
  nurse quote above. The hospital "responded by referring to last week's statement."
  https://www.wagmtv.com/2026/10/12/nmmc-nurse-speaks-out-recent-nurse-departures/
- **No ER closure, diversion, state action, or union press release found** (WebSearch for
  diversion / Maine DHHS / legislator; National Nurses United Maine press page lists nothing on
  NMMC for September or October 2026). Searched 2026-10-15.

## 4. SERP check (WebSearch, 2026-10-15; DataForSEO and GSC down this session)

- **"Northern Maine Medical Center nurses resign"** and variants: owned by BDN, The Maine Monitor,
  WAGM, The County (BDN syndication) and ssbcrack. We cannot take the news head.
- **"how many nurses does it take to staff a small emergency room 24/7 two nurses per shift"**:
  thin. State staffing-plan PDFs (Washington), locum job posts, a Thieme paper. No page does the
  weekly shift arithmetic for 12-hour and 8-hour patterns. This is the opening.
- **"nurses quit over mandatory day night shift rotation"**: UK press, WESA 2025, academic
  abstracts. No small-hospital scheduling answer.
- `npm run keyword-check`: "how many nurses to staff a 24 hour er", "emergency room nurse
  staffing two nurses", "rotating day night shifts nurses" and "northern maine medical center
  nurses" are all clear.
- **Primary keyword: "how many nurses to staff a 24 hour er". Secondary: "northern maine medical
  center nurses".**

## 5. Overlap

- `src/data/article/nurse-shortage-or-retention-crisis-rural-hospitals.md` already has "What Does
  One Avoidable Resignation Cost a Small Roster?" (NSI $61,110 replacement cost). This piece does
  NOT price a resignation. It counts shifts and nights.
- `src/data/article/july-2026-nurse-strikes-staffing.md` covers strikes and state staffing laws.
  Light overlap only on "nurse labor". No strike here; the contract was ratified in May.
- The shift arithmetic must agree with the corpus (T10): 2 nurses around the clock = 336 nurse
  hours a week = 28 twelve-hour shifts (as in `nursing-staff-scheduling-small-hospital`), 17,520
  hours a year, about 10.6 nurses on 12-hour shifts or 9.6 on 8-hour shifts once time off is
  counted (`fair-nurse-schedule-small-hospital`, `nurse-staffing-relief-factor`). A 3x12 nurse =
  36 hours a week (dossier, Hunt 2018, 0.9 FTE).

## 6. The hook (our illustrative arithmetic, built only from published headcounts)

Floor: two RNs on duty every hour of the week = 2 x 168 = 336 nurse hours.

|                                  | 12-hour shifts           | 8-hour shifts            |
| -------------------------------- | ------------------------ | ------------------------ |
| Nurse shifts a week              | 2 x 2 x 7 = 28           | 3 x 2 x 7 = 42           |
| Night shifts a week              | 7 x 2 = 14               | 7 x 2 = 14               |
| One full-time nurse (assumption) | 3 shifts, 36 hours       | 5 shifts, 40 hours       |
| 10 full-time nurses (June)       | 30 shifts, 2 spare       | 50 shifts, 8 spare       |
| 5 full-time nurses (now)         | 15 shifts, 13 short      | 25 shifts, 17 short      |
| Plus 3 contract nurses at the same hours | 24 shifts, 4 short | 40 shifts, 2 short      |
| Nights per full-time nurse if only full-timers work nights | 14 / 10 = 1.4, then 14 / 5 = 2.8 | same |

Caveats stated in the article: shift length and full-time hours are not published; two RNs is
the published night figure and a floor by day; the spare shifts must also cover vacation, sick
time and training; three departing nurses asked to stay per diem or move to other hospital
jobs, so some hours may stay; hires since June are not reported. Labelled "our arithmetic, not
the hospital's numbers."

Withdrawn plan: one RN a night = 7 x 1 = 7 RN night shifts a week instead of 14.

## 7. Guardrails

- Labor dispute: neutral. Every union claim attributed; the hospital's explanation in its own
  words in the same section. No "toxic" in our voice.
- Not a Texas story; say so in the intro. Texas link = 42 CFR 485.618 (24-hour emergency
  services at every critical access hospital) and Texas HSC Chapter 258 (no mandatory overtime;
  dossier wording). No claim that Texas hospitals face this dispute.
- No product H2. Footer note only. The product does not count nights (dossier 2026-08-13), so
  nothing near the night-share math may imply it does.
- No study vocabulary, no health or retention claim about rotation.

## 8. Outline

- **Title:** "Who Covers the Nights When Half an ER's Nurses Leave? The Northern Maine Medical
  Center Math"
- **H2s:**
  - What Happened to the Emergency Room Nurses at Northern Maine Medical Center?
  - How Is the Northern Maine Medical Center Emergency Room Staffed at Night?
  - How Many Nurse Shifts Does a 24-Hour ER With Two Nurses Need Each Week?
  - What Does Losing 5 of 10 Full-Time ER Nurses Do to the Schedule?
  - Why Do Night Shifts Get Harder to Cover When an ER Loses Nurses?
  - Why Should a Texas Critical Access Hospital Care About a Maine Emergency Room?
  - What to Do This Week / FAQ / Sources / footer note
- **Internal links out:** /blog/nursing-staff-scheduling-small-hospital,
  /blog/nurse-staffing-relief-factor, /blog/8-hour-vs-12-hour-nursing-shifts,
  /blog/night-shift-nurse-schedule-coverage, /blog/what-is-per-diem-nursing,
  /articles/nurse-shortage-or-retention-crisis-rural-hospitals, plus the four footer pages.
- **Should link in (on publish):** /blog/night-shift-nurse-schedule-coverage and
  /articles/nurse-shortage-or-retention-crisis-rural-hospitals.

## 9. Open questions for the founder

1. WAGM is outside the plan's "only these" source list. It is the only record of the Board letter
   and of anything after October 2, so it is cited. Keep?
2. Image: `callout-night-03.webp` (night desk, open 11P-7A slots, "EMERGENCY" sign). The screen
   reads "MED SURG" and a wall poster reads "we are HEROES"; eyeball for tone.
3. Re-check for news on the publish day (more notices were reported on October 6).
