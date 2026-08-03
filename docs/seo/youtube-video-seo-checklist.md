# YouTube Video SEO Checklist (for Gautham — the YouTube lane owner)

Source: Ahrefs "Learn 80% of AEO in 19 Minutes" (Jul 2026) + our AEO gap analysis
(2026-08-03). Why this lane matters: YouTube is the most-cited domain in Google's
AI Overviews, and YouTube mentions showed the strongest correlation with ChatGPT
visibility of any factor in Ahrefs' study (0.737). GPT models train on YouTube
transcripts, so videos feed both the citation layer and the training layer.

## Strategy: search hits, not viral hits

Target evergreen queries people actively search, not spike-and-die topics. A search
hit earns steady traffic from Google + YouTube search for years, and those are the
videos AI cites. Candidate topics we already have assets for:

1. "How AI builds a nurse schedule" — screen-record the simulator; the blog post of
   the same name is live and can embed the video (two-way reinforcement).
2. "Free nurse schedule template in Excel (walkthrough)" — drives the ungated
   template; template tutorials are classic evergreen search hits.
3. "Nurse schedule generator: what free tools miss" — mirrors the live blog post.

The Remotion pipeline (ssai-launch-video/) can produce polished segments, but a
plain screen recording with voiceover is fine for search hits; production value
matters less than matching the query.

## Per-video checklist (from the Ahrefs list, all four are load-bearing)

- [ ] Exact target keyword in the video TITLE.
- [ ] Keyword within the first two lines of the DESCRIPTION.
- [ ] TIMESTAMPS in the description so YouTube generates chapters.
- [ ] SAY the keyword out loud in the video — Google parses the audio and pulls
      from it.
- [ ] Thumbnail + title framed for the searcher's question, not the brand.
- [ ] Description links: the matching blog post + /how-it-works (full URLs).
- [ ] After publish: embed the video in the matching blog post and add the video
      to that post's next refresh (freshness + format signal in one edit).

## House rules that still apply on YouTube

- Positioning: service mode ("AI-native nurse scheduling service"); pricing only
  if asked in comments = flat $1,000/$1,500 by roster size.
- No customer/pilot/outcome claims (pre-launch). No invented product features —
  the four claimable truths only (fairness distribution, ranked callout candidates
  with reasons, timestamped change log, rules configured at onboarding).
- Compliance wording: "FLSA overtime thresholds", never 8-and-80 as a feature;
  42 CFR 485.631(a)(5) for the on-duty rule.

## Measurement

Log each published video in `backlink-ledger.md` (own-property tier). The monthly
SEO audit will watch for YouTube URLs appearing as citations in the AI-answer
probes (DataForSEO) and Bing AI Performance.
