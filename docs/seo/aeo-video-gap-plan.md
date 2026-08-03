# AEO Gap Plan — decisions record (Ahrefs "80% of AEO" video, Aug 2026)

Gap analysis presented 2026-08-02; founder decisions 2026-08-03. This file is the
durable record so the parked items resurface deliberately, not by accident.

## Already covered (verified, no action)

Query fan-out via hub-and-spoke + registry; list/comparison formats (confirmed by
our own probes as what gets cited); BLUF/atomic/entity-rich structure (codified in
the seo-aeo skill); AI-crawler access (robots.txt allows all major bots, verified
200s, Cloudflare unblocked); brand-gap measurement via DataForSEO llm-citations +
live probes + Bing AI Performance (Ahrefs Brand Radar is PAYWALLED on our plan —
our instruments stay).

## Decisions (founder, 2026-08-03)

| Item | Decision | Status |
| --- | --- | --- |
| Simple-sentence enforcement | **DO NOW** ("we miss it at times") | DONE 2026-08-03: check-blog WARNs on body sentences >35 words (cap 5/file); writing rule added to the seo-aeo skill §3.2. First test run confirmed 5+ hits on every recent post, so the gap was real. |
| GA4 AI-referral tracking | **DO — via MCP access** (both founders have GA4 access; property G-J2WK4QR3RC) | DONE 2026-08-03: analytics-mcp==0.7.0 wired + VERIFIED with live queries. Baseline recorded: 0 US AI-referral sessions in the trailing 90 days. Critical catch on first pull: 168 chatgpt.com sessions existed but were founder verification clicks from Hyderabad/Bengaluru (~1 user), which unfiltered would have faked a #2-channel story. Standing methodology (US-only + AI-source regex) written into monthly-seo-audit.md step 2b. Pending founder-side: GA4 internal-traffic IP filter; cosmetic: property currency is GBP, should be USD. |
| Self-reported attribution ("How did you hear about us?") | **PARKED** (founder: "leave for now") | Re-raise at launch: it is the cheapest high-signal instrument (Ahrefs: AI = 0.5% of visits, 12.1% of signups) and matters most once real prospects book calls. |
| YouTube search hits | **YES — Gautham owns the lane** | Checklist + starter topics handed over: `youtube-video-seo-checklist.md`. Audit watches for YouTube citations in AI answers. |
| Quora / niche forums (UGC beyond Reddit-monitor) | **PARKED** (founder: "leave for later") | Re-raise after the association/editorial dofollow lane is running; founder-authentic rules would apply as with Reddit. |
| Cloudflare bot-activity tracking | **UNBLOCKED — founder has PAID Cloudflare access** | Add to the monthly audit as a founder-side check: Cloudflare dashboard AI-crawler analytics (which pages GPTBot/ClaudeBot/CCBot re-crawl = likely citation sources). Optional later: Cloudflare MCP for API pulls. |
| Content refresh program (76% of ChatGPT-cited pages refreshed <30 days) | Accepted in principle (no explicit founder ruling yet) | Proposed shape: monthly refresh rotation in the audit — genuinely update the N oldest/most-cited live posts; REAL updates only, never date-bumping. Confirm N and start month with founder at the Sept audit. |
| AI filter in keyword vetting (click-play vs mention-play) | Accepted in principle | Add one classification line to the research-brief step of the publish pipeline at next skill touch. |

## Standing tension (hold, do not act)

The video: content length shows ~zero correlation with citations (half of cited
pages <1,000 words). Our gate: MOFU 1500-2500. Not a contradiction (ranking still
wants depth; AI chunks regardless), but consciously permit short atomic answer
pages for pure mention-play queries when the case arises.
