# One-Time Setup Actions (founder login required)

Two free integrations from the SEO plan (items 12, 13) that need your Google/email login,
~15 minutes total. Tell Claude when done; both feed existing workflows.

**STATUS: both completed by founder 2026-07-13.** Ahrefs AWT project live (first crawl takes
a few hours; backlink exports can be pulled for outreach targeting after that). Google
Alerts active on the six queries below.

## 1. Ahrefs Webmaster Tools (free)

Why: independent backlink profile + site audit, cross-checks DataForSEO (which bills per
call). Feeds mention-outreach targeting and the citation-gap work.

1. Go to https://ahrefs.com/webmaster-tools and create a free account.
2. Add project `simplescheduleai.com`; choose **verify via Google Search Console** (one
   click, since GSC is already yours — no DNS edit needed).
3. Let the first crawl finish (a few hours). Nothing else to configure.
4. Afterwards: exports of backlinks/referring domains can be dropped into `docs/seo/` for
   analysis whenever we run outreach targeting.

## 2. Google Alerts (free)

Why: always-on brand + competitor + niche mention radar; unlinked brand mentions are
LLM-citation fuel and outreach opportunities; competitor alerts feed the trendjacking lane.

Go to https://www.google.com/alerts (logged into the business Google account) and create
these, each set to "At most once a day", "Only the best results", Deliver to email:

| Alert query | Purpose |
| ----------- | ------- |
| "SimpleScheduleAI" | brand mentions (linked or not) |
| "M7 Health" nurse | closest competitor moves |
| YouShift scheduling | competitor (managed-mode convergence watch) |
| "critical access hospital" staffing | niche news for trendjacking |
| "nurse scheduling software" | category coverage + listicles to target |
| Texas rural hospital nurses | ICP-region news |

When an alert lands that looks citable or trendjackable, forward it into a session and the
trendjacking skill takes it from there (relevance gradient + can-we-be-first test).
