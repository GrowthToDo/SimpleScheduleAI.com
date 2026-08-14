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

## Target 4: Chief Healthcare Executive — VERIFIED AND OPEN (2026-08-14)

The best-fit target found so far, and the guidelines below are quoted from their
own submission page, read in a real browser (the page 403s automated fetchers).

- **Route:** email the editor, Ron Southwick, at **rsouthwick@mjhlifesciences.com**.
  Verbatim from the page: "Send them to me: rsouthwick@mjhlifesciences.com."
- **Format:** opinion pieces, published under the "Viewpoint" label.
- **Length:** "around 600-700 words". Not a hard limit, but "if a submitted piece
  is more than 1,000 words, there's a good chance it will be sent back".
- **Who they take:** "We love hearing from hospital executives, but we want to
  hear from doctors, nurses, financial officers, technology leaders, and anyone
  from the healthcare ecosystem."
- **Bio format:** a photo plus "a very short description of the author at the
  end (Example: Jane Doe is CEO of Metropolis Health)."
- **Style:** AP style, plain conversational English, no footnotes.

Three rules that decide whether this works for us:

1. **Non-promotional, and they say it is non-negotiable.** Verbatim: "Contributed
   features must be non-promotional and vendor-neutral, avoiding any overt or
   subtle promotion of specific companies or products." They explicitly route
   promotional material to paid sponsored content instead. So the piece argues an
   idea; SimpleScheduleAI appears only in the one-line author bio.
2. **The link mechanism is citation, not promotion.** They take no footnotes, but
   "it's a good idea to link to studies or news stories that are relevant." Our
   statistics page is a legitimate thing to link as a data source in a piece
   about rural staffing. That is the dofollow path here, and it only works if
   the data genuinely supports the argument.
3. **Human authors only, stated explicitly.** Verbatim: "We don't want pieces
   created by AI. We expect contributed features to be written by human authors.
   We understand if contributors are using AI tools to assist in research or spur
   ideas. But we're only taking articles from real people." **This piece has to
   be written by Pradeep.** I can assemble the evidence, check the facts and
   pressure-test the argument; the draft itself must be his. Submitting an
   AI-written piece here would breach a stated condition and burn the outlet
   permanently.

**Angle that fits their audience and their rules.** Hospital executives, not
nurse managers, so lead with the money and the asset that is already bought:
scheduling software that was purchased and is now being worked around. The
argument is vendor-neutral because it indicts no product. Automation gets
abandoned when nobody owns the configuration, and a hospital under 25 beds does
not staff the super-user role the platforms assume. The evidence is public
reviewer accounts plus the rural staffing data, and the practical takeaway is
the override count and the parallel-spreadsheet test. Nothing in that argument
requires naming us.

Status: **PROSPECT, ready to pitch.** Needs Pradeep to write it.

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
| 2026-08-14 | — | File opened. Citation-targeting mechanic checked and found to have no pitchable targets | — |
| 2026-08-14 | NRHA Rural Health Voices | Read their blog page | DISQUALIFIED: staff and vetted partners only, no contributed route |
| 2026-08-14 | American Nurse Journal | Read author guidelines | VERIFIED OPEN but POOR FIT: wants evidence-based clinical content (treatments, procedures, diagnostics) and the author is not a nurse. Blog/Perspectives (600-1200 words) is the only plausible slot. Park unless a genuinely clinical angle appears |
| 2026-08-14 | **Chief Healthcare Executive** | Read submission guidelines in a real browser | **VERIFIED OPEN, BEST FIT.** Viewpoint pieces, 600-700 words, editor address recorded above. Non-promotional and human-author rules both explicit. Ready to pitch; needs Pradeep to write |
