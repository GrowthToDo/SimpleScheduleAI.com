# Backlink Profile Log

Dated snapshots from Ahrefs Webmaster Tools (free; project verified via GSC 2026-07-13).
Cross-checks DataForSEO backlink endpoints (which bill per call). Feeds outreach targeting.

## 2026-07-13 — first snapshot

- **Domain Rating 3** (+1 over 30 days) · **238 referring domains (+94 in 30 days)** ·
  Site Audit health score 98 (254 crawled, 1 broken, 66 blocked).
- **The +94 spike is a spam wave, not growth.** Ahrefs tags virtually all top-DR referring
  domains as SPAM: rankyour.website, buybacklinks.agency, and dozens of near-identical
  `.shop` link-seller/PBN domains (linkrankpro.shop, pbnseolinks.shop, ...), arriving
  steadily since late March 2026. This is link-seller advertising spray, common for new
  domains. **No action needed**: Google discounts these; per current Google guidance a
  disavow is only worth filing after a manual action, which we do not have. Do NOT cite
  "238 referring domains" anywhere as a growth stat.
- **Genuine third-party editorial links: ~1.** solguruz.com (DR 56, first seen 16 Jun 2026)
  — a nurse-scheduling listicle that also appears in ChatGPT's cited sources for our
  category (see llm-citation-log.md 2026-07-12). growthtodo.com is our own property, not
  third-party. Everything else on all 5 pages is SPAM-tagged (seoagency.sale untagged but
  plainly spam).
- **Implication:** the authority gap is the whole game, as expected pre-launch. The levers
  stay: statistics hub (linkbait), directories (Capterra/TORCH), podcast/newsletter
  placements, listicle outreach (solguruz proves the listicle path works — it produced both
  a real link AND an LLM citation source).
- Re-snapshot cadence: monthly, alongside `npm run sitemap-diff`.

### Site Audit (2026-07-13, Ahrefs crawl of 10 Jul)

- **Health Score 98/100 (Excellent).** 254 internal URLs crawled; 250 success (2xx),
  3 redirects, 1 client 4xx. Most "URLs with errors" are the expected noindex pages (72),
  long titles (52), and long meta descriptions (57) — the same cosmetic items our own
  `npm run site-hygiene` classifies as non-SEO; no action.
- **Actionable:** 10 **external 4XX** (dead outbound links in posts) — these get caught and
  fixed per-post by `npm run check-links` during the content refresh, no separate pass
  needed. 1 **"Page dropped from Top 10"** (a ranking regression) and 1 H1 change flagged —
  worth a look but low urgency at this traffic level.
- No crawlability, indexability, or redirect-chain problems. The site is technically clean;
  the gap remains authority/citations, not hygiene.
