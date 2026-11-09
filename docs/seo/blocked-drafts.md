# Blocked drafts

Drafts that cannot be published by running the normal pipeline phases, because
something in the piece is wrong in a way a gate will not catch and a find/replace
will not fix. The publish-pipeline skill points here; keep this file short and
**delete rows once they are resolved**, so it stays a live list rather than a log.

| Draft | Why blocked | What has to change |
| --- | --- | --- |
| _(none as of 2026-11-09)_ | | |

The last two rows were caught by the 2026-08-12 corpus sweep. The ICU draft was rewritten around the shipped icu-competency rule and published 2026-11-03; the ER draft was deleted 2026-11-09 with the other retired drafts. That sweep removed 51 credential
overclaims from 23 live files (commit `2ca68d3a`). The approved replacement
vocabulary is the `shortlist-reasons` row in `docs/seo/positioning-registry.md`:
skill match, unit competency, charge-qualified, role. Never credential match,
filtering, enforcement or expiry in our own voice.
