# Competitor Backlink Gap Report — July 2026

**Backlink plan Tier 2.3** · Our domain: `simplescheduleai.com`
**Data source:** DataForSEO Backlinks API (live) · **Pulled:** 2026-07-25
**Goal:** referring domains that link to **2+** nurse/healthcare shift-scheduling competitors but **not** to us — the earnable-link universe.

## Competitor set (all resolved HTTP 200, all had backlink data)

| Competitor | Referring domains (live) |
|---|---|
| qgenda.com | 947 |
| aladtec.com | 644 |
| nursegrid.com | 525 |
| smartlinx.com | 440 |
| shiftwizard.com | 253 |
| m7health.com | 89 |
| cronshift.com | 11 |

cronshift.com resolved and was included (only 11 referring domains — negligible, contributes a handful of overlaps).

## Method

The DataForSEO `domain_intersection` endpoint runs a strict **AND** across all targets (7 targets → only 1 domain, `drjack.world`, links to all seven) and its `exclude_targets` parameter throws a server-side Internal Error, so it cannot express "links to 2+." Method fell back to **`referring_domains` per competitor, full sets pulled (limit 1000, ordered by rank desc), intersected locally.** Our own site (pre-launch, ~5 referring domains) was filtered locally rather than server-side.

**A referring domain is a "gap" if it links to ≥2 competitors and is not in our known referring set** (g2.com, crunchbase.com, alternativeto.net, reddit.com, growthtodo.com per the GSC baseline).

- **Rank** = DataForSEO backlink rank of the referring domain (0/`<1` = below the score threshold, not necessarily worthless — many legitimate niche sites score 0).
- **Spam** = DataForSEO backlink spam score (0–100). Rows with spam >25 were treated as link-farm/PBN noise and excluded from the curated table.
- **Sample linking-page URL** is **not** included: `referring_domains` returns aggregate stats only, and pulling one live backlink URL per domain would be 40+ extra paid calls. To find the linking page for any row, run `site:<domain> qgenda OR nursegrid OR aladtec` — cost $0.

## Headline numbers

- **447** referring domains link to **2+** competitors (the raw gap universe).
- Tier breakdown: **1** links to all 7 · **18** link to 6 · **52** link to 5 · **49** link to 4 · **77** link to 3 · **250** link to 2.
- **225** survive a spam ≤25 filter; **169** survive after also dropping automated aggregators (see Excluded noise).
- **Already-have flag:** exactly **1** gap domain is already ours — **crunchbase.com** (links to 5 competitors; we hold it, do not re-pursue). No other overlap with our 5 known referring domains.

### Excluded noise (do not pursue)

Two clusters were removed before ranking:

1. **PBN / link-farm cluster** (spam 50–70, links to 6): `drjack.world`, `read.org.in`, `sergechel.info`, `ycm.info`, `alljobs.info`, `globalecommerce.org`, `australianwebdirectory.pro/.shop`, `thebestbacklinksavailable.click`, plus a set of URL-shortener throwaways (`anchorurl.cloud`, `shortenurls.eu`, `buzzshrink.website`). These are toxic; ignore.
2. **Automated, non-outreachable aggregators** (low spam but zero pursuit value): website-value/SEO checkers (`blankx.com`, `clientsbee.com`, `siteprice.org`, `compworth.com`, `apibit.com`, `tokenpedia.com`), email-scrapers (`zoominfo` partially, `contactout.com`, `neverbounce.com`, `lusha.com`, `leadiq.com`, `skrapp.io`, `getemail.io`, `wiza.co`), and login-portal spam (`loginssearch.com`, `*.web.app`, `*.pages.dev`). Kept out of the shortlist even where they appear in the table for completeness.

## Ranked gap domains (top ~44, curated, spam ≤25)

Sorted by number of competitors linked, then rank. Company-database and email-tool rows are shown for completeness but are largely auto-generated (low realistic-earn value).

| Referring domain | # comps | Rank | Spam | Earn-pattern | Links to | Already have |
|---|---|---|---|---|---|---|
| cbinsights.com | 6 | 28 | 1 | company database | aladtec, m7, nursegrid, qgenda, shiftwizard, smartlinx | - |
| zoominfo.com | 6 | <1 | 5 | company database | aladtec, m7, nursegrid, qgenda, shiftwizard, smartlinx | - |
| nerdisa.com | 5 | 205 | 5 | directory/listing | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| growjo.com | 5 | 102 | 0 | company database | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| mergr.com | 5 | 59 | 3 | company database | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| ailternative.com | 5 | 51 | 25 | directory/listing | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| crunchbase.com | 5 | <1 | 11 | company database | m7, nursegrid, qgenda, shiftwizard, smartlinx | **yes** |
| dealroom.co | 5 | <1 | 0 | company database | aladtec, m7, nursegrid, qgenda, shiftwizard | - |
| pitchbook.com | 5 | <1 | 0 | company database | m7, nursegrid, qgenda, shiftwizard, smartlinx | - |
| wifitalents.com | 5 | <1 | 0 | stats/data site | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| worldmetrics.org | 5 | <1 | 0 | stats/data site | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| themedicalpractice.com | 5 | <1 | 0 | healthcare resource | aladtec, nursegrid, qgenda, shiftwizard, smartlinx | - |
| hitconsultant.net | 4 | 76 | 0 | editorial/news | nursegrid, qgenda, shiftwizard, smartlinx | - |
| theorg.com | 4 | 68 | 7 | company database | m7, qgenda, shiftwizard, smartlinx | - |
| medium.com | 4 | <1 | 0 | editorial/contributor | m7, qgenda, shiftwizard, smartlinx | - |
| technologycounter.com | 4 | <1 | 10 | directory/listing | nursegrid, qgenda, shiftwizard, smartlinx | - |
| medassistantjobs.com | 4 | <1 | 0 | directory/listing (jobs) | nursegrid, qgenda, shiftwizard, smartlinx | - |
| saashub.com | 4 | <1 | 0 | review site | aladtec, nursegrid, qgenda, smartlinx | - |
| topbestalternatives.com | 4 | <1 | 5 | directory/listing | aladtec, nursegrid, qgenda, smartlinx | - |
| alternative.to | 4 | <1 | 3 | directory/listing | aladtec, qgenda, shiftwizard, smartlinx | - |
| hoursfinder.com | 4 | <1 | 0 | directory/listing | aladtec, nursegrid, qgenda, shiftwizard | - |
| connecteam.com | 4 | <1 | 0 | roundup/listicle (competitor blog) | aladtec, nursegrid, qgenda, shiftwizard | - |
| makeshift.ca | 4 | <1 | 0 | roundup/listicle (competitor blog) | nursegrid, qgenda, shiftwizard, smartlinx | - |
| aviahealth.com | 3 | 205 | 2 | resource page (assoc/network) | nursegrid, qgenda, shiftwizard | - |
| itqlick.com | 3 | 150 | 6 | review site | aladtec, qgenda, smartlinx | - |
| justuseapp.com | 3 | 96 | 0 | directory/listing | nursegrid, qgenda, smartlinx | - |
| appsruntheworld.com | 3 | 35 | 0 | directory/listing (enterprise apps) | qgenda, shiftwizard, smartlinx | - |
| ghpnews.digital | 3 | 7 | 0 | editorial/news | nursegrid, qgenda, smartlinx | - |
| softwareworld.co | 3 | <1 | 1 | roundup/listicle ("best software") | nursegrid, qgenda, smartlinx | - |
| builtin.com | 3 | <1 | 1 | directory/listing (company profiles) | m7, nursegrid, qgenda | - |
| techrseries.com | 3 | <1 | 0 | editorial/news (HR tech) | aladtec, qgenda, smartlinx | - |
| elion.health | 3 | <1 | 5 | resource (health-IT directory) | m7, qgenda, shiftwizard | - |
| nurse.org | 2 | <1 | 0 | resource/community (nursing) | m7, nursegrid | - |
| peoplemanagingpeople.com | 2 | 39 | 0 | roundup/listicle (HR editorial) | aladtec, qgenda | - |
| healthworkscollective.com | 2 | 17 | 0 | editorial/contributor (health) | nursegrid, smartlinx | - |
| healthitanswers.net | 2 | <1 | 0 | editorial/news (health IT) | qgenda, smartlinx | - |
| beckersasc.com | 2 | <1 | 25 | editorial/news (Becker's) | nursegrid, qgenda | - |
| rockhealth.com | 2 | <1 | 5 | editorial/research (digital health) | m7, nursegrid | - |
| healthstream.com | 2 | 295 | 1 | resource (healthcare vendor) | nursegrid, shiftwizard | - |
| uic.edu | 2 | 141 | 9 | resource page (.edu) | nursegrid, qgenda | - |
| rutgers.edu | 2 | <1 | 0 | resource page (.edu) | qgenda, smartlinx | - |
| vanderbilt.edu | 2 | <1 | 15 | resource page (.edu) | nursegrid, qgenda | - |
| uclahealth.org | 2 | <1 | 10 | resource page (health system) | nursegrid, qgenda | - |

## Prioritized shortlist — 10 most pursuable

Doctrine applied: **free only** (no paid directories, no reciprocity), list as **software** in the nurse/medical-staff-scheduling category, **flat pricing**. Assets available to pitch: (a) free ungated Excel nurse-scheduling **template**, (b) journalist-grade **stats page** `simplescheduleai.com/rural-hospital-nurse-staffing-statistics`, (c) our software listing itself.

| # | Domain | Earn-pattern | Why pursuable | Asset / angle to pitch | Effort |
|---|---|---|---|---|---|
| 1 | saashub.com | review site | Free vendor self-submit; links to 4 competitors already | Directory listing (software, "nurse scheduling") | Low |
| 2 | softwareworld.co | roundup/listicle | Free "best software" listing + runs category roundups; links to 3 | Directory listing + pitch inclusion in a nurse-scheduling roundup | Low |
| 3 | technologycounter.com | directory/listing | Free vendor listing; links to 4 | Directory listing (software) | Low |
| 4 | topbestalternatives.com / alternative.to | directory/listing | Free alternatives listing; links to 4 each (distinct from alternativeto.net we already hold) | Directory listing as an alternative to QGenda/NurseGrid | Low |
| 5 | itqlick.com | review site | Free vendor profile w/ pricing; links to 3; rank 150 | Directory listing (flat pricing is a differentiator to feature) | Low–Med |
| 6 | hitconsultant.net | editorial/news | Health-IT newsroom, rank 76, spam 0; links to 4 — our single highest-authority editorial gap | Stats-page citation — pitch a rural-CAH nurse-staffing data story | Med (high value) |
| 7 | nurse.org | resource/community | Nursing audience = adjacent ICP; spam 0; links to 2 | Stats-page citation + free template as a nurse-manager resource | Med |
| 8 | peoplemanagingpeople.com | roundup/listicle | HR editorial that publishes scheduling-software roundups; rank 39; links to 2 | Listicle-gap (get added to their scheduling roundup) + stats citation | Med |
| 9 | beckersasc.com | editorial/news | Becker's = hospital-exec audience = exact ICP; links to 2 | Stats-page citation (data pitch to editor) | Med–High |
| 10 | aviahealth.com | resource page (assoc/network) | Health-system innovation network that lists scheduling vendors; rank 205; links to 3 | Vendor/resource listing + stats-page reference | Med–High |

**Bench (next up if shortlist stalls):** `healthworkscollective.com` and `healthitanswers.net` (health-IT contributor/editorial, stats-citation, Med); the `.edu` cluster `uic.edu` / `rutgers.edu` / `vanderbilt.edu` and `uclahealth.org` (resource-page link building — pitch the free Excel template as a nursing-program/faculty resource; High authority, High effort, one page each); `elion.health` (health-IT tool directory, free listing, Low).

**Explicitly de-prioritized:** company databases (`cbinsights`, `zoominfo`, `growjo`, `mergr`, `pitchbook`, `dealroom`, `theorg`, `builtin`) auto-generate profiles and rarely reward outreach; email-finder tools (`getemail.io`, `wiza.co`, etc.) are scrapers; competitor-owned roundup blogs (`connecteam.com`, `makeshift.ca`) won't link to a rival. `crunchbase.com` — **already ours**, skip.

## Outreach playbook — how to actually get each link

The reach-out method is completely different per earn-pattern. Grouped by how you win the link, easiest first. All email goes from **pradeep@simplescheduleai.com**; free only, no reciprocity, no payment.

### A. Self-serve directory / review listings — do these first (no gatekeeper, ~10 min each)

**Targets:** saashub.com, softwareworld.co, technologycounter.com, topbestalternatives.com, itqlick.com, elion.health (bench: builtin.com).

**Method:** no email, no permission. On each site find the **"Submit software" / "Add your product" / "For vendors" / "Claim this listing"** link (usually in the footer or a top-nav "Vendors" item), create the listing, done. Reuse the Tier-0 submission kit copy verbatim so every listing is consistent:

- **Category:** nurse scheduling / medical staff scheduling (fall back to employee scheduling if unavailable).
- **Description:** kit short + long description — list as **software**, with operated-for-you as the differentiator.
- **Pricing:** flat monthly (this is a live advantage on itqlick and others that display pricing — you stand out against enterprise "contact us").
- **Links:** homepage + the interactive demo (never call it "live demo").
- **Logo:** the Route mark PNG.

Batch all six in one sitting. Before submitting topbestalternatives.com / **alternative.to**, confirm alternative.to is not just a mirror of **alternativeto.net** (which we already hold) — if it is, skip to avoid duplicate work.

### B. Editorial / data-citation pitches — the stats page is the hook (highest value)

**Targets:** hitconsultant.net (health-IT news, our highest-authority gap), beckersasc.com (Becker's — hospital-exec ICP), healthitanswers.net, healthworkscollective.com, techrseries.com.

**Method:** this is proactive HARO. Pitch a **data story built on the stats page, not the product.**
1. Find the writer who covers nurse staffing/workforce: Google `site:hitconsultant.net nurse staffing` (repeat per outlet), grab the recent byline + email.
2. Send a short pitch. Template:

> **Subject:** 2026 rural nurse-staffing data (sourced, embeddable) for [outlet]
>
> Hi [name] — I saw your piece on [topic]. I maintain a free, primary-sourced dataset on rural and Critical Access Hospital nurse staffing that might be useful for a data angle: critical access hospitals run the *lowest* RN vacancy but the *highest* turnover of any hospital group, and each RN departure costs about $60,090. Every figure links to its source (NSI, AHRQ, HRSA, Texas DSHS) and is embeddable: simplescheduleai.com/rural-hospital-nurse-staffing-statistics
>
> Happy to give a quick expert quote too — I run hospital operations and build nurse-scheduling tech. No ask; just thought the data could serve a story.
>
> Pradeep Pandey, co-founder, SimpleScheduleAI

Effort medium, but these are the links worth the most.

### C. Nursing resource / community

**Target:** nurse.org (bench: healthstream.com).

**Method:** pitch the **free ungated Excel template + stats page** as a genuine nurse-manager resource, via their contact/contribute form or editorial email. Angle: a real free tool for nurse managers, no signup. Same no-reciprocity email shape as B, swapping the template in as the asset.

### D. Roundup / listicle inclusion (this is Tier 1.3)

**Targets:** softwareworld.co (also runs category roundups), peoplemanagingpeople.com. (Skip connecteam.com / makeshift.ca — competitor-owned, they won't link a rival.)

**Method:** email the author of their "best nurse/healthcare scheduling software" roundup. Pitch the **missing category** — operated-for-you scheduling for ≤25-bed hospitals — with an edit-ready 2-sentence blurb + screenshots so inclusion is one copy-paste. If they ask for payment, decline politely and offer a Pradeep expert quote instead.

### E. .edu resource pages — highest authority, highest effort, do last

**Targets:** uic.edu, rutgers.edu, vanderbilt.edu, uclahealth.org.

**Method:** one page at a time, fully personalized. Find the specific nursing-program or nurse-manager resource page that already links a competitor (`site:uic.edu nurse scheduling`), then email the faculty member or librarian who maintains it, offering the **free Excel template** as a no-cost teaching/practice resource for students or staff. Never templated — .edu editors reject bulk pitches; one genuine, specific email per page.

### Suggested sequence

- **Week 1:** Batch A (six self-serve listings in one session) — fast, guaranteed, warms up the profile.
- **Week 2:** B (2–3 editorial data pitches) + D (1–2 listicle pitches).
- **Week 3:** C (nurse.org) + begin E (1–2 personalized .edu emails).
- **Monthly:** re-run this gap report (`seo-dataforseo` domain-intersection) to catch new overlaps as competitors earn links; fold into the monthly SEO audit.

Log every submission and pitch in `backlink-ledger.md` with date, target, asset, and status, same as Tier 0.

## DataForSEO spend

| Calls | Purpose | Cost (USD) |
|---|---|---|
| Structure/mode probes (2-target, 7-target diag, referring_domains probe) | endpoint validation | ~$0.079 |
| 7 × `referring_domains` full pulls (all competitors) | gap dataset | ~$0.266 |
| **Total** | | **≈ $0.345** |

Failed calls (invalid-field errors and the `exclude_targets` Internal Errors) were billed $0. No per-domain backlink-URL calls were made (would have added 40+ calls) — sample linking pages are recoverable free via `site:` search.
