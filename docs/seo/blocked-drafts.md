# Blocked drafts

Drafts that cannot be published by running the normal pipeline phases, because
something in the piece is wrong in a way a gate will not catch and a find/replace
will not fix. The publish-pipeline skill points here; keep this file short and
**delete rows once they are resolved**, so it stays a live list rather than a log.

| Draft | Why blocked | What has to change |
| --- | --- | --- |
| `best-scheduling-software-er-nurses` | 29 instances of ED-credential filtering as the SSAI pitch ("the ranked replacement list is generated from ED-credentialed nurses only", "SimpleScheduleAI applies ED credential filtering automatically"). Inventory §4.6/§6.5: certifications are a `string[]` with no expiry dates, **not consulted by any rule**, and there is no ED-specific rule at all. | Needs a new differentiator. The honest ED angle is NOT credentials: it is that ED callouts need a confirmed replacement fast, and what we actually enforce is role, competency level, charge coverage and overtime headroom. Do not reuse the ICU fix here, because no ED-specific rule exists in the engine. |
| `best-scheduling-software-icu-nurses` | 22 instances of the same, framed as ICU credential filtering. | Easier fix: **`icu-competency` IS a shipped hard rule** (inventory §4.2/§4.3), so the post has a real story. Rewrite from "ICU-credentialed" to ICU competency level, which is code-verified, and keep the rest. |

Both were caught by the 2026-08-12 corpus sweep that removed 51 credential
overclaims from 23 live files (commit `2ca68d3a`). The approved replacement
vocabulary is the `shortlist-reasons` row in `docs/seo/positioning-registry.md`:
skill match, unit competency, charge-qualified, role. Never credential match,
filtering, enforcement or expiry in our own voice.
