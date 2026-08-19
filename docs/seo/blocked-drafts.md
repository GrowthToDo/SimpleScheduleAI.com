# Blocked drafts

Drafts that cannot be published by running the normal pipeline phases, because
something in the piece is wrong in a way a gate will not catch and a find/replace
will not fix. The publish-pipeline skill points here; keep this file short and
**delete rows once they are resolved**, so it stays a live list rather than a log.

| Draft | Why blocked | What has to change |
| --- | --- | --- |
| `m7-health-alternatives` | **Built on a premise that is false.** Written 2026-08-19 from a competitor-dossier entry verified 2026-05-16 which said M7 is "explicitly an enterprise and health-system product" with "no documented CAH or standalone-rural reference customers." M7 has since published a Critical Access Hospital page (page-verified in a browser 2026-08-19) claiming its team handles setup, no IT burden, live in a few weeks, a dedicated account manager per nurse manager, and pricing accessible to small facilities. The draft's spine, that M7 builds for health systems and "you operate it" while we operate it for you, is therefore wrong in the excerpt, the Key Takeaways, the comparison table and two body sections. Mechanically it is clean (check-blog 0/0), which is exactly why it needs a row here. | Rewrite on the surviving distinction, which their own page supports: M7 sells setup help and support for software the hospital then operates ("stays close **until** scheduling feels effortless"; the page is otherwise adoption language about staff seeing schedules on phones and leaders gaining visibility). We do the work every cycle. Help getting started is not the same as someone doing it in week six. Also drop every "enterprise-only" absolute, and do NOT name Palestine Regional or Logan Regional as CAH references (see the live-post correction below). |
| `best-scheduling-software-er-nurses` | 29 instances of ED-credential filtering as the SSAI pitch ("the ranked replacement list is generated from ED-credentialed nurses only", "SimpleScheduleAI applies ED credential filtering automatically"). Inventory §4.6/§6.5: certifications are a `string[]` with no expiry dates, **not consulted by any rule**, and there is no ED-specific rule at all. | Needs a new differentiator. The honest ED angle is NOT credentials: it is that ED callouts need a confirmed replacement fast, and what we actually enforce is role, competency level, charge coverage and overtime headroom. Do not reuse the ICU fix here, because no ED-specific rule exists in the engine. |
| `best-scheduling-software-icu-nurses` | 22 instances of the same, framed as ICU credential filtering. | Easier fix: **`icu-competency` IS a shipped hard rule** (inventory §4.2/§4.3), so the post has a real story. Rewrite from "ICU-credentialed" to ICU competency level, which is code-verified, and keep the rest. |

Both were caught by the 2026-08-12 corpus sweep that removed 51 credential
overclaims from 23 live files (commit `2ca68d3a`). The approved replacement
vocabulary is the `shortlist-reasons` row in `docs/seo/positioning-registry.md`:
skill match, unit competency, charge-qualified, role. Never credential match,
filtering, enforcement or expiry in our own voice.
