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
| 2026-08-01 | SaaSHub | T0 submit | product-mode kit | LIVE + APPROVED. Link audit: 1 DOFOLLOW (hero CTA, empty rel) + 9 nofollow — our only confirmed dofollow directory link. PROBLEM: it points at /product (noindex,follow), so equity only passes through. URL change to homepage submitted, PENDING SaaSHub re-verification. Listing carries pre-ruling SERVICE-mode copy; refresh to product mode when the URL edit clears. Premium tier declined. | https://www.saashub.com/simplescheduleai |
| 2026-08-01 | Capterra (via Gartner intake) | T0 submit | kit A | LIVE but on **capterra.in (India)**, NOT capterra.com — verified capterra.com/p/1108519 returns 404 and site search does not find us. Shows "LOCAL PRODUCT" India badge, name misspelled "SimplescheduleAI", and service pricing ($1,000 flat) instead of product $10/user. Region likely follows the vendor account country. FIX ORDER: name + URL (Product Details) -> pricing -> Capterra > International Markets for the region, else Gartner support ticket. | https://www.capterra.in/software/1108519/SimplescheduleAI |
| 2026-08-01 | Software Advice + GetApp (same Gartner listing) | T0 submit | kit A | UNPUBLISHED — both blocked only on missing descriptions. These are US .com properties, so completing them sidesteps the capterra.in problem entirely. SA/GetApp long + short descriptions and target market drafted 2026-08-01, ready to paste. | — |
| 2026-08-02 | Software Advice | T0 submit | product-mode long/short description + target market + benefits + pricing note | SUBMITTED by founder — "Under review", Gartner says 1-2 business days, notification by email. US .com property. On approval: verify rendered copy, confirm the website link points at the homepage (not /product), and check the product NAME renders "SimpleScheduleAI" not "SimplescheduleAI". | — |
| 2026-08-02 | GetApp | T0 submit | product-mode description + 7 benefit statements + $10/user pricing note | SUBMITTED by founder — "Under review", 1-2 business days. US .com property. Free-trial toggle set to No; interactive demo (/simulator) is the demo asset. Same post-approval checks as Software Advice. | — |
| 2026-08-02 | Link-type audit (6 directories) | P5 measurement | — | MEASURED on live pages: SaaSHub 1 dofollow + 9 nofollow; ITQlick nofollow (5/5); TopBestAlternatives nofollow (3/3); Elion nofollow (weak sample, 429); SoftwareWorld + TechnologyCounter UNVERIFIED (403 / JS-rendered). Directories reclassified as entity/AI-retrieval signal, not a ranking play. | — |

