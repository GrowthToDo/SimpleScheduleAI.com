# Backlink Ledger

Every ask and placement, logged. Plan: `backlink-plan-2026-07.md`.
Format: `| date | target | tier/tactic | asset pitched | status | link URL |`

## Baseline (2026-07-22)

- **GSC Links export (2026-07-21): 5 referring domains** — g2.com (seller profile,
  en + es), crunchbase.com (org page), alternativeto.net (listing), reddit.com (one
  organic r/healthcare thread mention, ~17 language-variant URLs), growthtodo.com
  (founder-owned). Directory profiles pre-date this plan; claimed-status unverified.
- Bing link API: 0 known inbound links (Bing's graph lags Google's)
- Common Crawl index presence: 0 pages (AI-visibility audit 2026-07-21; Cloudflare unblock pending)

### Baseline re-check 2026-08-02

**The 5-referring-domain GSC figure REMAINS the working baseline.** Do not replace it
with a Bing number (see the anomaly below).

- **Cloudflare crawler blocking: RESOLVED (verified 2026-08-02).** All seven crawler
  user-agents return HTTP 200 with real content: Googlebot, bingbot, CCBot
  (Common Crawl), GPTBot, ClaudeBot, AhrefsBot, and desktop Chrome. Googlebot receives
  ~208KB with the correct `<title>` and zero challenge markers (no "just a moment",
  no Turnstile). Cloudflare still fronts the site but is passing bots through.
  robots.txt explicitly Allows every AI crawler. The "Cloudflare unblock pending"
  note above is therefore CLOSED.
- **Bing crawl health (Bing Webmaster API, 2026-04-14 to 2026-08-01):**
  `BlockedByRobotsTxt = 0` on EVERY day of the series. Pages in Bing's index grew
  9 -> 79; URLs returning 2xx grew 7 -> 119; recent daily crawl 20-66 pages with
  0-2 errors and no 5xx. Crawling is healthy and accelerating.
- **Bing `InLinks` anomaly — DO NOT RECORD AS BACKLINKS.** `CrawlStats.InLinks`
  reads 8 (series: 0 -> 1 on May 18 -> 6 on Jun 29 -> 9 on Jul 18 -> 8 from Jul 21,
  flat since). But three separate Bing endpoints return EMPTY and cannot enumerate
  a single link: `get_link_counts` -> `{"Links":[],"TotalPages":0}`,
  `get_url_links` (homepage) -> `{"Details":[],"TotalPages":0}`,
  `get_connected_pages` -> `[]`. The field's meaning is also unconfirmed (it sits
  beside `InIndex` as a per-day site counter and may not mean external referring
  domains at all). Treat 8 as UNVERIFIED. Cross-check via the free Moz / Common
  Crawl web-graph route before any figure enters reporting.
- **Index coverage gap to watch:** 79 pages in Bing's index against ~93 URLs
  submitted via IndexNow. Trend is upward (73 -> 79 in the five days to Aug 1 as the
  week's posts landed). Watch coverage, not crawl volume.

## Log

| Date | Target | Tier | Asset | Status | Link |
|---|---|---|---|---|---|
| 2026-07-22 | G2 profile | T0 audit | — | AUDITED: exists (en+es); bot-blocked to Claude; founder to claim + set category + paste kit copy | https://www.g2.com/sellers/simple-schedule-ai |
| 2026-07-22 | Crunchbase | T0 audit | — | AUDITED: exists; bot-blocked; founder to claim + paste kit copy | https://www.crunchbase.com/organization/simplescheduleai |
| 2026-07-22 | AlternativeTo | T0 audit | — | AUDITED: live listing; says "managed service", ORIGIN: India (founder decision), 0 likes; refresh copy in kit | https://alternativeto.net/software/simple-schedule-ai/ |
| 2026-07-22 | Reddit r/healthcare thread | T0 audit | — | Mention NOT visible in rendered thread (possibly deleted since GSC crawl); monitor only | https://www.reddit.com/r/healthcare/comments/1jvbviv/ |
| 2026-07-22 | Unlinked-mention sweep | T0 | — | No third-party unlinked mentions found; FOUND simplescheduleai.netlify.app duplicate ranking for brand -> 301 added to netlify.toml | — |
| 2026-07-22 | Gartner intake (Capterra/GetApp/SoftwareAdvice) | T0 submit | kit A | KIT READY — awaiting founder approval + submission | — |
| 2026-07-23 | G2 Digital Markets intake (Capterra family) | T0 submit | kit A + 4 screenshots | SUBMITTED by founder via app.g2digitalmarkets.com (product listing, small-business/healthcare target, flat pricing) — awaiting review; check each cabinet (Capterra/GetApp/SoftwareAdvice) separately once approved | — |
| 2026-07-22 | F6S | T0 submit | kit B | KIT READY — awaiting founder | — |
| 2026-07-23 | F6S | T0 submit | kit B | LIVE (pause resolved same day): company page with website link, LinkedIn, kit description, demo video, HR/Nurse Scheduling tags. Cosmetic TODO: rename member account "SimpleScheduleAI"->"Pradeep Pandey"; location says "Texas City, TX" (a real town — change if unintended) | https://www.f6s.com/company/simplescheduleai1 |
| 2026-07-22 | TORCH (free email) | T0 | kit D | DRAFT READY — founder sends from pradeep@ | — |
| 2026-07-22 | RHIhub resource submission | T0 | kit E | DRAFT READY — founder submits | — |
| 2026-07-23 | G2 + Crunchbase + AlternativeTo refresh | T0 claim | kit C copy | DONE by founder — profiles claimed/refreshed with kit copy (verify rendered copy + link on each in ~1wk) | see baseline URLs |
| 2026-07-23 | TORCH (free email) | T0 | kit D | SENT from pradeep@ — awaiting reply | — |
| 2026-07-23 | RHIhub resource submission | T0 | kit E | ~~SUBMITTED~~ **CORRECTED 2026-08-02: NOT SENT.** Founder confirmed only the TORCH email went out on 2026-07-23. This row previously read "SUBMITTED from pradeep@" and was wrong. RHIhub has never been contacted. Re-drafted as a FIRST pitch in `outreach/p1-association-outreach.md` section 2. | — |
| 2026-07-23 | TORCH (free email) | T0 | kit D | CONFIRMED SENT (founder screenshot 2026-08-02): sent 13:08 from pradeep@ to helpdesk@torchnet.org, bcc gautham@. Both assets pitched, vendor relationship disclosed in the opening line, no signup gate. No reply after 10 days. One follow-up drafted in `outreach/p1-association-outreach.md` section 1. | — |
| 2026-08-01 | SaaSHub | T0 submit | product-mode kit | LIVE + APPROVED. Link audit: 1 DOFOLLOW (hero CTA, empty rel) + 9 nofollow — our only confirmed dofollow directory link. Premium tier declined. | https://www.saashub.com/simplescheduleai |
| 2026-08-02 | SaaSHub URL fix | T0 | — | **RESOLVED.** The dofollow hero CTA now points at the homepage (`href="https://simplescheduleai.com" rel=""`), verified on the live listing. It previously pointed at `/product`, which is `noindex,follow`, so equity only passed through indirectly. A `/product` link remains in the hero-pricing button but carries `rel="nofollow"`, so it is irrelevant to equity. Our one confirmed dofollow directory link now lands on an indexable page. Listing still carries pre-ruling SERVICE-mode copy; refresh to product mode when convenient (cosmetic, not blocking). | https://www.saashub.com/simplescheduleai |
| 2026-08-01 | Capterra (via Gartner intake) | T0 submit | kit A | LIVE but on **capterra.in (India)**, NOT capterra.com — verified capterra.com/p/1108519 returns 404 and site search does not find us. Shows "LOCAL PRODUCT" India badge, name misspelled "SimplescheduleAI", and service pricing ($1,000 flat) instead of product $10/user. Region likely follows the vendor account country. FIX ORDER: name + URL (Product Details) -> pricing -> Capterra > International Markets for the region, else Gartner support ticket. | https://www.capterra.in/software/1108519/SimplescheduleAI |
| 2026-08-01 | Software Advice + GetApp (same Gartner listing) | T0 submit | kit A | UNPUBLISHED — both blocked only on missing descriptions. These are US .com properties, so completing them sidesteps the capterra.in problem entirely. SA/GetApp long + short descriptions and target market drafted 2026-08-01, ready to paste. | — |
| 2026-08-02 | Software Advice | T0 submit | product-mode long/short description + target market + benefits + pricing note | SUBMITTED by founder — "Under review", Gartner says 1-2 business days, notification by email. US .com property. On approval: verify rendered copy, confirm the website link points at the homepage (not /product), and check the product NAME renders "SimpleScheduleAI" not "SimplescheduleAI". | — |
| 2026-08-02 | GetApp | T0 submit | product-mode description + 7 benefit statements + $10/user pricing note | SUBMITTED by founder — "Under review", 1-2 business days. US .com property. Free-trial toggle set to No; interactive demo (/simulator) is the demo asset. Same post-approval checks as Software Advice. | — |
| 2026-08-02 | Link-type audit (6 directories) | P5 measurement | — | MEASURED on live pages: SaaSHub 1 dofollow + 9 nofollow; ITQlick nofollow (5/5); TopBestAlternatives nofollow (3/3); Elion nofollow (weak sample, 429); SoftwareWorld + TechnologyCounter UNVERIFIED (403 / JS-rendered). Directories reclassified as entity/AI-retrieval signal, not a ranking play. | — |
| 2026-08-03 | Ahrefs baseline (founder screenshots) | measurement | — | **DR 3.2, UR 4.5. 342 backlinks / 338 ref domains, of which 99.4% NOFOLLOW (directory-syndication/scraper spike, late Jul). Real equity = 2 dofollow domains: solguruz.com (DR 59) + growthtodo.com (founder-owned, DR 0.5, 3 links).** Ahrefs organic-keywords panel (1 kw / 16 traffic) is a db-floor artifact; GSC is ground truth. Ahrefs "404" list (38 pages incl /articles, texas-overtime, generator) re-verified 2026-08-03: ALL return 200 live; rows are stale crawls from the pre-unblock / pre-publish era (last crawled Apr-Jun) and the link counts on them are internal links. No 301s needed; self-heals as AhrefsBot recrawls. /cdn-cgi/l/email-protection 404 = Cloudflare artifact, ignore. Broken-backlinks report + Brand Radar are PAYWALLED on our plan — struck from the Sept audit plan; DataForSEO probes remain the brand-gap instrument. | — |
| 2026-08-03 | solguruz.com — FIRST organic third-party editorial DOFOLLOW | earned (unsolicited) | — | **VERIFIED LIVE: DR-59 dofollow, first seen 16 Jun 2026.** Their post "How to Develop a Nurse Staff Scheduling App Like ShiftKey" (updated Jul 10) cites us as a SOURCE, linking /blog/best-nurse-scheduling-software-2026 in its AI-scheduling section. Unsolicited; earned by the content itself. Note: solguruz.com also appears in ChatGPT's retrieval sources for our keywords (llm-citation-log 07-12) — the consensus flywheel working as designed. SEPT IMPLICATION: this DR-59 link points at the exact post under consolidation review; weigh external equity before any 301. | https://solguruz.com/blog/how-to-develop-a-nurse-staff-scheduling-app-like-shiftkey/ |
| 2026-08-03 | ssai-temp.netlify.app — DUPLICATE MIRROR (new finding) | hygiene | — | Second Netlify brand mirror found ranking in search, serving a full copy with `index, follow`. NOT covered by the earlier simplescheduleai.netlify.app 301. Defensive host-301 added to netlify.toml (effective only if that site deploys from this repo). **FOUNDER ACTION: check the Netlify dashboard for the ssai-temp site; delete or password-protect it if it is a manual/stale deploy.** | https://ssai-temp.netlify.app/ |

| 2026-08-04 | Gartner Digital Markets — all 3 channels | T0 verify | — | **GetApp LIVE on .com** (getapp.com/all-software/a/simplescheduleai/): correct name in title, links the HOMEPAGE not /product; outbound CTA is a tracked redirect (typical Gartner, no direct followed link). **SoftwareAdvice LIVE on .com** at both /medical/ and /scheduling/ -profile paths. **Capterra still India-only** (capterra.com/p/1108519 = 404): portal region fix still pending. Misspelling SimplescheduleAI persists in page DATA (not visible text) — the Product Details name fix still worth doing. | https://www.getapp.com/all-software/a/simplescheduleai/ |
| 2026-08-04 | Qwoted decline #2 (AI hours-saved query) | P3 triage | — | DECLINED: journalist required a US hospital AI deployment (stated twice) and excluded founders; our firsthand AI rollouts are Apollo/India and SSAI has zero deployments. Employer-risk note: current-employee commentary on Apollo internal AI decisions needs clearance. Journalist noted as on-beat for future queries. | — |
| 2026-08-04 | v0-simple-schedule-ai.vercel.app — THIRD brand mirror | hygiene | — | LIVE (200) Vercel copy found ranking in search, likely the v0 prototype; a stale mirror is serving RETIRED 60-day-pilot copy to search engines. starlit-brioche netlify mirror already dead (404). **FOUNDER/GAUTHAM ACTION: delete or password-protect the v0 project in Vercel.** ssai-temp netlify deletion still pending too. | https://v0-simple-schedule-ai.vercel.app/ |
| 2026-08-04 | Capterra US — LIVE (founder screenshot) | T0 verify | — | **capterra.com/p/10053102/SimpleScheduleAI/ live, NEW product id (old 1108519 was the India listing). Name spelled CORRECTLY, category Nurse Scheduling Software, updated Aug 4.** All 3 Gartner channels now live on .com. Pending verification (Cloudflare-challenged our browser): outbound link target (homepage vs /product) and whether service pricing was replaced by $10/user — founder can eyeball both on the listing. | https://www.capterra.com/p/10053102/SimpleScheduleAI/ |
