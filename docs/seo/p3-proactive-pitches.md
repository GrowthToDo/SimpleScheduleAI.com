# P3 proactive editorial pitches

**Opened 2026-08-14.** P3 in `backlink-plan-2026-07.md` is editorial placements.
Until now it has been run entirely REACTIVELY: watch Qwoted and Connectively,
answer on-spec queries, decline off-spec ones. That works (it produced the
nursemagazine.co dofollow on 2026-08-12) but it only fires when a journalist
happens to ask. This file is the proactive half: outlets we approach, with the
asset and the angle for each.

Both gates that were throttling P3 are cleared: the SaaSHub dofollow URL was
fixed 2026-08-02, and the Connectively profile was verified 2026-08-04.

## First, a mechanic that is NOT available (checked on fresh data 2026-08-14)

The plan's adopted "AI-cited listicle targeting" mechanic says to pitch the
pages LLMs actually cite, since a link there is worth many times a random
listicle. Re-ran the citation-gap pull ($0.609) to get a current target list.

For "nurse scheduling software" the cited sources are `snapschedule.com`,
`shiftboard.com`, `reddit.com`, `healthstream.com` and `workforce.com`. Every
one is a competitor's own domain or Reddit. **There is nothing pitchable in the
cited set**, and that is true on August data, not just the July snapshot.

Do not spend a session on this mechanic. Re-check it on the monthly audit; it
becomes live the moment an independent editorial domain enters the cited set.

The same pull did confirm the retrieval layer is working: Google AI Overviews
now cites us on four answers including "nurse staff scheduling" (vol 110) and
"scheduling app for nurses" (vol 50), against a zero baseline in July. Two of
those cite the retired `/healthcare-staff-scheduling` URL, which 301s correctly
to `/nurse-scheduling-software`, so the citation is not wasted. Verified
2026-08-14.

## What we have to pitch

Three assets, in order of how hard they are for anyone else to copy:

1. **The rural hospital nurse staffing statistics page** (`/rural-hospital-nurse-staffing-statistics`,
   plus its `.csv` and `.json` endpoints). Journalist-grade, sourced, machine
   readable. This is the strongest asset we own for editorial outreach and the
   one designed for exactly this use.
2. **The free Excel scheduling template** (ungated). Fits association and
   resource-page formats rather than press.
3. **Two recent evidence-led posts**, both built on dossier-verified primary
   sources rather than opinion: why nurse managers stop using scheduling
   automation, and how long scheduling software implementation takes.

## Targets

Status vocabulary: PROSPECT (identified, not contacted), VERIFY (needs a human
to confirm the submission route), SENT, REPLIED, PLACED.

| # | Outlet | Route | Asset + angle | Status |
| --- | --- | --- | --- | --- |
| 1 | ~~**NRHA Rural Health Voices**~~ | — | — | **DISQUALIFIED 2026-08-14.** The blog page states verbatim: "NRHA publishes blogs written by NRHA staff and vetted NRHA Partner organizations." It is not open to contributed pitches, and no submission route is published. The only way in is partner status, which is a paid-membership decision for the founder, not an editorial pitch. Do not re-prospect this as a P3 target |
| 2 | **NRHA Rural Horizons** (quarterly member magazine) | Member magazine | Same anchor, longer form. Likely subject to the same member/partner gate as the blog; check before drafting anything | VERIFY (low confidence) |
| 3 | **HIStalk** | Tip / contributed | Health IT audience. Founder sent a Tier 2 mail 2026-08-14; treat any reply as the opening | SENT (P2) |

**What target 1 taught, before we spent a session on it.** The obvious
association targets are member-gated rather than editorially open, and the gate
is invisible until you read the outlet's own page. Verify the submission route
FIRST, on the outlet's site, before writing a word of pitch copy. That check
cost one page fetch and removed the top-ranked target.

## Rules for this lane

- **Never invent a contact address.** Every route above is marked VERIFY until a
  human has confirmed the actual submission path on the outlet's own site. An
  invented editor email is worse than no pitch, and this file is exactly where
  that mistake would be easy to make.
- Pitch the ASSET, not the product. The statistics page earns the link; the
  product is the byline, not the subject.
- Same triage bar as the reactive lane: nurse staffing, scheduling, rural
  hospital, CMS or FLSA compliance, healthcare AI, hospital operations. Anything
  off-domain gets declined, because a thin placement costs future standing.
- One outlet at a time. This lane is judged on placements, not on volume sent.

## Log

| Date | Outlet | Action | Result |
| --- | --- | --- | --- |
| 2026-08-14 | — | File opened. Citation-targeting mechanic checked and found to have no pitchable targets. NRHA blog and magazine identified as the first proactive prospects | — |
