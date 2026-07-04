---
name: publish-pipeline
description: Load before writing, editing, gating, or publishing ANY blog post (src/data/post) or Newsroom article (src/data/article). The manifest-enforced publish pipeline; every phase maps to a manifest field that publish-gate must show green before the draft flip can commit.
---

# Publish Pipeline (manifest-enforced)

State lives in `.publish/<slug>.json`, not in this conversation. FIRST command on any session touching a publish: `npm run publish-gate <slug> -- --status`. The table IS the to-do list; resume from the non-green rows.

## Model roles (post-Fable)

- Strongest available model (Opus): orchestration, drafting, judgment review, applying fixes.
- Cheaper models (Sonnet): research fan-out, fact verification, mechanical fix rounds.
- The pipeline is model-agnostic: no phase relies on a model remembering state — the manifest carries it.

## Phases -> manifest fields

1. **Research brief** (read-only agent; competitor dossier + facts dossier + checklist externals). No field; the brief feeds phase 2.
2. **Draft** (writing agent): load `.claude/skills/seo-aeo-simplescheduleai.md` (+ `trendjacking-articles.md` for /articles, `competitor-reviews.md` for competitor content). EVERY fact with a `docs/seo/facts-dossier.md` entry uses dossier wording; new facts get verified + ADDED to the dossier in the same session. Fields this phase must leave green after step 3: `factsDossier`.
3. **Mechanical gate**: `npm run publish-gate <slug>` — fills `checkBlog`, `checkLinks`, `inboundLinks`, `image`, `prettier`, `dateSanity`, `factsDossier`. Fix every FAIL and re-run; never hand-wave a red row.
4. **Inbound links**: wire >= 2 links from LIVE sibling posts (natural in-prose anchors); re-run the gate (`inboundLinks`).
5. **Proofread agent** (`feature-dev:code-reviewer`): diff against 3 canonical posts OF THE SAME post type — BOFU/comparison: schedule360-alternatives, best-nurse-scheduling-software-2026, qgenda-alternatives; MOFU explainer/operational: self-scheduling-problems-critical-access-hospital, after-hours-callout-coverage-small-hospitals, night-shift-nurse-schedule-coverage; TOFU/glossary: 3 live same-type posts (e.g. what-is-per-diem-nursing). Judgment items only (ICP voice, excerpt hook, title claim, repetition/AI-tells, worked-math honesty). On READY-TO-PUBLISH: `npm run publish-gate <slug> -- --set proofread=READY --by feature-dev:code-reviewer`. Any post edit AFTER the verdict stales it — re-run or re-confirm.
6. **Fact-check agent** (only when the post introduces facts NOT already in the dossier): verify each against primary sources; add them to the dossier; then `--set factcheck=PASS --by <agent>`. If every fact came from the dossier: `--set factcheck=NOT_REQUIRED`.
7. **Human image eyeball**: founder (or a human) looks at the rendered hero. Topic-match rule: staffing post -> staff/team imagery; compliance -> institutional/paperwork; NEVER clinical-procedure or patient-distress imagery. Then `--set image-eyeball=OK`.
8. **Founder approval**: ONLY on explicit instruction ("publish X"), never inferred: `--set founder-approval=YES --by founder`.
9. **Commit + push**: flip `draft: false`, prettier the changed files, commit. The pre-commit hook re-runs the gate and blocks if anything is red or stale. Push (deploy is Netlify-on-push).
10. **Post-publish**: submit IndexNow (Bing) + GSC sitemap; record `--set indexnow=DONE` and `--set gsc-sitemap=DONE` (non-blocking). Verify the live URL returns 200.

## Ground rules carried over

- Verify subagent output against the diff, never its self-report.
- Newsroom articles follow `trendjacking-articles.md` for detection/scoring; this pipeline governs their gate + publish identically.
- `npm run smoke` after any routing/template change; CI runs it on every push.
