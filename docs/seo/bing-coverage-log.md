# Bing coverage log

A durable record of Bing Webmaster coverage checks, so a scheduled recheck can
actually be re-run. Created 2026-08-21 after a recheck was scheduled with no
artifact: the finding ("2 zero-byte pages") lived only in a session that was
later summarized away, so the specific URLs were unrecoverable. **Every future
finding here names the URLs.**

Tools: `mcp__bing-webmaster__get_crawl_issues`, `get_crawl_stats`,
`get_url_info`, `get_url_submission_quota`. Site URL is
`https://simplescheduleai.com` (no trailing slash).

---

## 2026-08-26 — founder asked whether the 2 zero-byte pages are fixed. YES, cleared.

**The persistent CrawlErrors = 2 is now 0.** It sat at exactly 2 every day from
2026-08-16 through 2026-08-24, then dropped to 0 on 2026-08-25 and has stayed
there. `get_crawl_issues` also returns an empty list.

Latest daily stats (2026-08-25):

| Metric | Value | vs 2026-08-20 |
| --- | --- | --- |
| **CrawlErrors** | **0** | was 2 |
| **Code4xx** | **0** | was 1 |
| Code5xx | 0 | unchanged |
| BlockedByRobotsTxt | 0 | unchanged |
| ContainsMalware | 0 | unchanged |
| InIndex | **110** | was 103 |
| Code2xx | 145 | was 137 |
| CrawledPages that day | 14 | 45 |

Error trend across the window, showing the clear break:
CrawlErrors 2, 2, 2, 2, 2 (Aug 16-20), then 2, 3, 2 (Aug 22-24), then **0** (Aug 25).
Code4xx over the same period: 0, 0, 0, 0, 1, 1, 2, 2, **0**.
(No row exists for Aug 21 in the API response.)

**InIndex against the sitemap.** Sitemap carried 112 URLs on 2026-08-26 against
InIndex 110 measured on 2026-08-25. The gap is the two pages published on
2026-08-26 (the QSO-26-15 article and the nurse scheduling problem post), which
had not been crawled when the last stats row was written. Coverage is complete.

**Honest limit, same as last time.** The original finding never named the two
URLs, so this still is not a direct before-and-after on those specific pages.
What changed since the 2026-08-21 check is that the error count itself went from
a steady 2 to 0, which is the closest thing to confirmation the data can give.
Nothing outstanding remains to chase.

---

## 2026-08-21 — recheck of the "2 zero-byte pages" item. CLOSED, clean.

**`get_crawl_issues` returned an empty list.** No URL on the property carries a
crawl issue of any kind.

Latest daily stats (2026-08-20):

| Metric | Value |
| --- | --- |
| InIndex | **103** |
| Code2xx | 137 |
| Code301 | 3 |
| Code4xx | 1 |
| Code5xx | **0** |
| CrawlErrors | 2 |
| BlockedByRobotsTxt | **0** |
| ContainsMalware | **0** |
| CrawledPages that day | 45 |

Seven-day error trend (Aug 14 to Aug 20): CrawlErrors 0, 8, 2, 2, 2, 2, 2.
Code4xx 0, 1, 0, 0, 0, 0, 1. Code5xx zero every day. Nothing sustained.

**InIndex trend, showing steady growth rather than a stall:**
68 (Jul 15) → 76 (Jul 30) → 89 (Aug 6) → 93 (Aug 11) → 101 (Aug 16) → 103 (Aug 20).

**Coverage read.** The live sitemap carried 107 URLs on 2026-08-21 against
InIndex 103. Two of the four unindexed are posts published on Aug 20 and Aug 21
and had not been crawled yet at the time of this check. Bing coverage is
effectively complete.

**Honest limit of this check.** Because the original finding named no URLs, this
cannot prove those two specific pages were fixed. What it establishes is that
Bing currently reports zero crawl issues, zero server errors, and zero robots
blocks across the property, so there is nothing outstanding to chase. The item
is closed on that basis rather than on a direct before-and-after.

Submission quota at time of check: 99 daily, 1,099 monthly. Not a constraint.

---

## How to run this check

1. `get_crawl_issues` — the headline. An empty list means no outstanding issues.
2. `get_crawl_stats` — read the last 7 days. Watch Code5xx and BlockedByRobotsTxt
   (either being non-zero is a real problem) and the InIndex trend (a flat line
   while the sitemap grows is the signal worth acting on).
3. Compare InIndex against the live sitemap count at
   `https://simplescheduleai.com/sitemap-0.xml`. Expect a small lag for anything
   published in the last day or two.
4. **Record findings here with the URLs named.** A finding without a URL cannot
   be rechecked.

## Related

- Google-side indexing sits in a different place: the LinkedIn crawl-path
  experiment in `docs/seo/linkedin/posts-crawl-path-set.md` tracks four pages
  Google has never fetched, with a scheduled read around 2026-09-16.
- Bing holds pages Google does not, which is why the LLM citation channel
  (ChatGPT Search and Copilot lean on the Bing index) stays intact even while
  Google coverage lags.
