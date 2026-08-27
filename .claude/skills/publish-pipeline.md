---
name: publish-pipeline
description: Load before writing, editing, gating, or publishing ANY blog post (src/data/post) or Newsroom article (src/data/article). The manifest-enforced publish pipeline; every phase maps to a manifest field that publish-gate must show green before the draft flip can commit.
---

# Publish Pipeline (manifest-enforced)

State lives in `.publish/<slug>.json`, not in this conversation. FIRST command on any session touching a publish: `npm run publish-gate <slug> -- --status`. The table IS the to-do list; resume from the non-green rows.

Before starting a publish, check `docs/seo/blocked-drafts.md`. Drafts listed there fail for reasons a gate cannot catch and a find/replace cannot fix; do not run the phases on one until its row is cleared.

## Model roles (post-Fable)

- Strongest available model (Opus): orchestration, drafting, judgment review, applying fixes.
- Cheaper models (Sonnet): research fan-out, fact verification, mechanical fix rounds.
- The pipeline is model-agnostic: no phase relies on a model remembering state — the manifest carries it.

## Phases -> manifest fields

1. **Research brief** (read-only agent; competitor dossier + facts dossier + checklist externals). No field; the brief feeds phase 2. BEFORE the brief: run `npm run keyword-check -- "<proposed primary keyword>"` against `docs/seo/keyword-registry.json` — an exact collision means update the existing piece instead of writing a new one; containment warns must be differentiated explicitly in the brief. When the piece goes LIVE, add its registry entry in the same session. Also worth a glance for topic ideas/urgency: `docs/seo/sitemap-snapshots/DIFFLOG.md` (competitor new pages, `npm run sitemap-diff`) and `docs/seo/llm-citation-log.md` (which domains LLMs cite for our queries, `npm run llm-citations`).
   The brief must include a SERP map for the primary keyword (via `mcp__dataforseo__serp_organic_live_advanced` or WebSearch): (a) TABLE STAKES — topics/sections appearing in 3+ of the top 10 results (baseline to rank; the draft must cover them); (b) GAPS — what none of the top results covers that we can own honestly (interview material, CAH-specific angle, worked math); (c) LENGTH — the word-count band of the top 3, as a sanity range, not a target to pad toward. Skip thin pages, forums, and results 3+ years stale when mapping.
2. **Draft** (writing agent): load `.claude/skills/seo-aeo-simplescheduleai.md` (+ `trendjacking-articles.md` for /articles, `competitor-reviews.md` for competitor content). EVERY fact with a `docs/seo/facts-dossier.md` entry uses dossier wording; new facts get verified + ADDED to the dossier in the same session. Fields this phase must leave green after step 3: `factsDossier`.
3. **Mechanical gate**: `npm run publish-gate <slug>` — fills `checkBlog`, `checkLinks`, `inboundLinks`, `image`, `prettier`, `dateSanity`, `factsDossier`. Fix every FAIL and re-run; never hand-wave a red row.
4. **Inbound links**: wire >= 2 links from LIVE sibling posts (natural in-prose anchors); re-run the gate (`inboundLinks`).
5. **Proofread agent** (`feature-dev:code-reviewer`): diff against 3 canonical posts OF THE SAME post type — BOFU/comparison: schedule360-alternatives, best-nurse-scheduling-software-2026, qgenda-alternatives; MOFU explainer/operational: self-scheduling-problems-critical-access-hospital, after-hours-callout-coverage-small-hospitals, night-shift-nurse-schedule-coverage; TOFU/glossary: 3 live same-type posts (e.g. what-is-per-diem-nursing). Judgment items only, per the catalog in `docs/seo/pre-publish-checklist.md` (ICP voice, excerpt hook, title claim, repetition/AI-tells, worked-math honesty, image family/tone); never re-check what the mechanical gate already enforced. On READY-TO-PUBLISH: `npm run publish-gate <slug> -- --set proofread=READY --by feature-dev:code-reviewer`. Any post edit AFTER the verdict stales it — re-run or re-confirm.
6. **Fact-check agent** (only when the post introduces facts NOT already in the dossier): verify each against primary sources; add them to the dossier; then `--set factcheck=PASS --by <agent>`. If every fact came from the dossier: `--set factcheck=NOT_REQUIRED`. When applying fact corrections, grep the WHOLE file for every instance of the corrected claim (excerpt, Key Takeaways, body, tables, FAQ, Sources) — never fix only the reported line numbers; a fact repeated five places must be fixed five places. Also update any source LABEL when its URL changes.
7. **Cold read (added 2026-08-27)**: a SEPARATE pass whose only job is to fail to understand things. Every other phase asks "is this correct?"; this one asks "could a nurse manager act on it?" Added because what-is-a-baylor-shift passed the mechanical gate, the proofread agent and the fact-check agent with zero failures, then took three rounds of founder feedback that were ALL comprehension: shorthand never defined, headings asking about an unnamed "it", a legal section written in the statute's vocabulary, no worked numbers.
   Run it on the drafted post with NO other context: not the brief, not the sources, not this skill. The reader is a DON at a 25-bed hospital with no legal or software background. The prompt is exactly:
   _"You are a nurse manager at a 25-bed rural hospital. Read this post once, the way you would on a phone between shifts. Then answer only these: (1) Which sentences did you have to read twice? Quote them. (2) Which words or shorthand did the post use without explaining? (3) At each heading, what question did you expect answered, and was it? (4) What would you actually DO differently on Monday? (5) Where did you stop caring? Do not look for errors, do not check facts, do not suggest rewrites. Report only what you did not understand."_
   Fix everything it names, then re-run the mechanical gate. No manifest field of its own; findings fold into `proofread`. **Never self-run this straight after drafting** — the author cannot fail to understand their own shorthand, which is exactly why the themes pass missed all of it.
8. **Founder-feedback-themes pass (final check, added 2026-08-24)**: read the draft against every theme in `docs/seo/founder-feedback-themes.md` (T1 KT-answers-title through T12 date honesty) and fix what fails. Re-run the gate if fixes touched text. Note in the commit message that the pass ran. When later founder feedback on the live post reveals a new theme, add it to that file in the same session.
   **Word-level feedback does NOT belong here.** A rejected word goes into `FOUNDER_BANNED_WORDS` in `scripts/check-blog.mjs` the same session, because a themes doc only works if someone remembers to re-read it. "arithmetic" was rejected verbally, recorded nowhere, and reached 21 live posts before anyone noticed.
9. **Founder approval**: ONLY on explicit instruction ("publish X"), never inferred: `--set founder-approval=YES --by founder`.
10. **Commit + push**: flip `draft: false`, prettier the changed files, commit. The pre-commit hook re-runs the gate and blocks if anything is red or stale. Push (deploy is Netlify-on-push). **No localhost preview step (founder 2026-08-24): blogs are not hosted locally for review; the founder reviews the LIVE page.** Verify the live URL returns 200.
11. **Founder live review, then image eyeball**: the founder reads the live post and gives feedback; apply fixes and redeploy. The hero-image eyeball happens on the live page (topic-match rule: staffing post -> staff/team imagery; compliance -> institutional/paperwork; NEVER clinical-procedure or patient-distress imagery). Then `--set image-eyeball=OK --by founder`. This row no longer blocks the commit (manifest.mjs 2026-08-24); it gates the next phase instead.
12. **Post-review submission**: ONLY after the founder's live review: submit IndexNow (Bing) + GSC sitemap; record `--set indexnow=DONE` and `--set gsc-sitemap=DONE` (non-blocking). Never submit before the review.

## Queue replenishment ritual (standing, founder 2026-08-09)

When the draft queue empties, the next topic lot is identified by re-running the
citation-shape loop, not by brainstorming:

1. Re-run live `llm_responses` probes (DataForSEO, ~$0.12/probe) on the tracked
   money prompts across ChatGPT/Perplexity/Gemini/Claude, plus the citation-gap
   instrument (`npm run llm-citations`).
2. Diff against the PRIOR probe run first: did our URLs enter any citations
   array since the last content lot? The citations array, not rankings, is the
   scoreboard for the previous lot.
3. Prompts where competitors are cited and we are absent, plus the shape diff of
   the newly cited pages, seed the next topic lot. Method reference:
   `docs/seo/citation-shape-autopsy-2026-08.md`; first output of this loop:
   `docs/seo/next-15-topics-2026-08.md`.
4. Pair with the standard inputs (keyword expansion, GSC impressions, review
   mining themes, competitor sitemap DIFFLOG) and present the lot to the founder
   as a list only; publishes remain one-at-a-time on explicit instruction.

## Ground rules carried over

- Verify subagent output against the diff, never its self-report.
- Newsroom articles follow `trendjacking-articles.md` for detection/scoring; this pipeline governs their gate + publish identically.
- `npm run smoke` after any routing/template change; CI runs it on every push.
- **Pages get a judgment review too (rule added 2026-07-04):** any NEW page or substantive copy rewrite under `src/pages/` gets a judgment review agent pass before ship (claims vs facts-dossier product truths, positioning-registry founder rules, ICP voice, internal consistency, AI-tells) — smoke only covers mechanics (title/canonical/description/h1). Pages have no manifest; the review verdict goes in the commit message.
