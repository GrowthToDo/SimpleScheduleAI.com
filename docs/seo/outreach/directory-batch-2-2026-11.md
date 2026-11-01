# Directory batch 2 (shortlist, 2026-11-01)

Prompted by a founder-shared X post (@anaestheticdev, 2026-09-24) that reported
DR 0 to 25 in two weeks from 57 live free directory listings. Our own 2026-08-03
measurement (DR 3.2, 338 referring domains, 99.4% nofollow) showed that link
count alone does not move DR. Ahrefs DR counts followed links only, so this
batch keeps only directories whose free listing gives a followed link.

Status: **SHORTLIST, awaiting founder go.** Nothing submitted. Copy comes from
`docs/seo/directory-listing-sheet.md` (product mode, fixed in c7a5e2c5).

## How the list was built

1. Source: the MIT-licensed catalog in `sasuke007/submit-to-directories`
   (2,823 records, a third party's research, last verified Sep 2026). The
   skill itself was NOT installed; only the JSON was read.
2. Filter: the catalog says dofollow, free, no badge, DR 30+, not paid-only.
   That left 84. Link farms ("internet directory" sites), developer and MCP
   lists, design galleries and non-English sites were dropped by hand, then
   well-known B2B directories and the post's named sites were added: 45 checked.
3. Check: three agents read the raw HTML of 1 to 12 existing listings per
   directory and the submission or pricing page (curl only, nothing submitted).
4. Spot-check: 13 of the "followed" verdicts were re-fetched by the main
   session. All 13 had a followed product link and no page-level nofollow
   (meta robots and X-Robots-Tag checked).

The DR figures below are the catalog's numbers and were not re-checked.

## Submit (free listing, followed link seen, no badge required)

| Directory | Catalog DR | Kind | Free listing | Account | Note |
| --- | --- | --- | --- | --- | --- |
| featuredcustomers.com | 71 | B2B software, has an Employee Scheduling category | "Verified Free" profile | form (name, company, email, phone) | profile leans on customer references, which we do not have yet |
| startupstash.com | 64 | curated startup tools | application (Typeform) | no, work email | editorial pick, may decline |
| business-software.com | 50 | older B2B software directory (HR, medical) | "no cost" | contact form | CAPTCHA, founder submits |
| best-ai.org | 45 | AI tools list (German) | "Free Forever" | likely | affiliate listings are sponsored, others followed |
| buildvoyage.com | 40 | small SaaS directory | free, 48h review | no | only 4 of 8 sampled listings followed; reason not stated |
| foundigy.com | 38 | startup showcase | free "for now", 2-day review | Google Form, likely Google sign-in | |
| product-tower.com | 33 | launch directory (Turkey-based) | "completely free" | Google or GitHub login | |
| thetoolbus.ai | 31 | utility site with an AI directory | free after review | no | |
| trendystartups.com | 31 | older startup directory | free | yes (free signup) | queue of "a few months" |
| aitoolslist.io | 30 | AI tools review blog | discretionary | no (Tally form) | adds tools "if it fits our criteria" |

## Followed only if earned or paid (skip unless the founder wants to pay)

| Directory | Catalog DR | Condition seen |
| --- | --- | --- |
| uneed.best | 75 | free launch is followed only at 20 upvotes; we have no audience to upvote it, and asking contacts to upvote is gaming |
| tinylaunch.com | 73 | followed for the top 3 of a launch, or Premium $39 |
| aitoolscapital.com | 34 | samples were followed, but its promo page sells "dofollow" as a $19 tier |
| indiehackerstacks.com | 30 | free tier "Get a backlink", $40 tier sells "dofollow"; samples were followed, so unclear |

## Excluded

- **Badge or backlink on our site required** (our no-reciprocity guardrail):
  twelve.tools, launchigniter.com, startupbase.io, smolstartup.com,
  aitoolcenter.com, right-ai.com, aitoolfinder.com.
- **Paid only:** spotsaas.com, toolsfine.com ($16), aiwith.me ($26.90),
  startuplist.ing ($4), productdirs.com ($9.90).
- **Nofollow:** getlatka.com, crozdesk.com, cuspera.com, softwaresuggest.com,
  goodfirms.co, startupranking.com, sidehunt.io, builtbyindies.com,
  aiai.tools, awesome.tools (advertises "Do-follow", 12 of 12 sampled were
  nofollow).
- **Redirect or JavaScript-only link:** futuretools.io (302 via its own /go/),
  saasworthy.com.
- **Editorial only:** rundown.ai (newsletter picks), oecd.ai (vets tools for
  trustworthy-AI use; a scheduler is unlikely to qualify).
- **Unknown, Cloudflare-blocked to curl:** sourceforge.net, trustradius.com,
  theresanaiforthat.com; peerlist.io renders by JavaScript. Check in a real
  browser only if the founder wants them.

## Measurement (the test)

- Before: founder's current Ahrefs DR and the count of followed referring
  domains (last reading 2026-08-03: DR 3.2, 2 followed domains).
- After: the same two numbers 4 weeks after the last listing goes live. Log
  both in `backlink-ledger.md`. Also record which of the 10 went live and
  whether each live listing's link is followed (the free tier can differ from
  the sampled listings).
- Expected effect is a hypothesis. None of these sites reach US hospital
  buyers; the only gain is DR and a little entity coverage.
