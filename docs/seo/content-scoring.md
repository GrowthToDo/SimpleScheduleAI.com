# Content scoring: is it differentiated, and can our reader use it?

Two separate questions, two separate rubrics. A post can be highly differentiated
and unreadable, or perfectly clear and pure commodity. Do not average them.

| Rubric | Asks | Status | Where it lives |
| --- | --- | --- | --- |
| Commodity grade | Is this worth citing, or could anyone have written it? | Manual, no tooling yet | This doc |
| ICP cold read | Can a DON at a 25-bed hospital understand and use it? | Scripted, ADVISORY | `npm run cold-read` |

---

## 1. Commodity grade (6 dimensions)

**Provenance note, 2026-09-21.** This framework was worked out in a session and
never written to the repo. It was reconstructed from the record; the six
dimension names are as originally agreed. **The weights below were NOT part of
the original and are a proposal, not a founder decision.** Change them freely.

The one worked example that survives: our compliance post graded **14/100**,
which is pure commodity.

| # | Dimension | Weight | Scores high when | Scores zero when |
| --- | --- | --- | --- | --- |
| 1 | Proprietary evidence | 25 | Data only we hold, or a primary source we read that nobody else did | Everything is a rewrite of secondary coverage |
| 2 | Firsthand | 20 | Written from operating experience or a real conversation | Written from other blog posts |
| 3 | Specificity | 15 | Named figures, dates, rules, worked math | "Many hospitals struggle with staffing" |
| 4 | Point of view | 15 | Takes a position a competitor would not | Balanced to the point of saying nothing |
| 5 | LLM moat | 15 | An answer an LLM cannot synthesise from the open web | Reproducible by a model from general knowledge |
| 6 | Information gain | 10 | Adds something the top 10 results do not contain | Restates the SERP consensus |

**The honest-fix rule.** A low grade is fixed by getting real first-party data or
doing the worked math. It is never fixed by manufacturing receipts, inventing
statistics, or implying customer experience we do not have. We are pre-launch
with zero customers, and that constraint is not negotiable for a score.

**Worked example of a high score earned honestly.** The RHTP article
(2026-09-21) scores well on dimensions 1 and 6 because we downloaded seven
federal documents, text-extracted them, and grep-verified that float pools,
locum tenens, agency staffing and scheduling software appear in none of them.
That absence is a finding nobody else published. It cost one agent pass and no
invented data.

---

## 2. ICP cold read (scripted, advisory)

### Why this exists

The cold read is pipeline phase 7. It always returned an essay, so no two posts
were comparable and nothing could be tracked. It is also, measurably, the
highest-yield gate we run. On the RHTP draft (2026-09-21), the cold read and the
correctness proofread ran on the same text and overlapped on almost nothing:

| Cold read found | Proofread found |
| --- | --- |
| "three years" where the rest said five (a real error) | Title claimed a "most" with no data |
| "obligate" used 14 times, never defined | Excerpt duplicated a Key Takeaway |
| Oct 30 was the state's deadline, not the reader's | Two H2s unanswerable out of context |
| Four places the reader stopped reading | Bracketed citations (theme T8) |

The correctness reviewer read it as a document. The cold reader read it as a
person with a shift to cover, and caught the only outright factual
inconsistency.

### The split that makes the number honest

**The agent reports observations. The script does the arithmetic.** An agent
asked to self-report "82/100" invents a number. An agent asked to list the
sentences it reread is reporting something it observed. So the agent never sees
a weight and never returns a score.

### Running it

```
npm run cold-read record <slug> --from <observations.json>
npm run cold-read status <slug>
npm run cold-read trend
```

`observations.json`:

```json
{
  "icp": "DON at a 25-bed rural hospital, reading once on a phone",
  "intent": "act",
  "sections": [{ "heading": "...", "rereadCount": 0, "answeredItsQuestion": true, "quitHere": false }],
  "undefinedTerms": ["obligate"],
  "mondayActions": ["check contracts for non-competes"],
  "blockedActions": ["ask the state office, no office named"]
}
```

### Intent, because not every post is for the same job

Founder call, 2026-09-21: the metric depends on the subject. Set `intent` per post.

| `intent` | The post is for | Weighting |
| --- | --- | --- |
| `act` | Getting someone to do something on Monday | actionability .40, comprehension .25, headings .20, attention .15 |
| `trust` | Being believed and forwarded to the CEO | comprehension .30, headings .25, attention .25, actionability .20 |
| `both` | Genuinely both | comprehension .28, actionability .28, headings .22, attention .22 |

### The four parts

- **comprehension** `100 * (1 - (rereads + undefinedTerms) / (6 * sections))`.
  Six friction points per section scores zero. Length-independent by design, so a
  long post is not punished for being long.
- **headings** percentage of question-H2s that answered their own question.
- **actionability** `mondayActions / (mondayActions + blockedActions)`. Asking the
  reader to do something you have not equipped them to do costs you here. That is
  deliberate: "ask your state office" without naming the office is the failure
  shape this is built to catch.
- **attention** percentage of sections the reader did not quit at.

The constants are a **first calibration** and are expected to move.

### Known flaws, found on run 1 (2026-09-21). Left in deliberately.

Founder call: gather data across ~7 posts before calibrating, so the fix is made
against real spread rather than one sample. Both flaws are live today.

1. **`undefinedTerms` is unstable and currently dominates.** On the first scored
   post the reader listed 37 terms, including "CMS" and "per diem", which drove
   comprehension to 12.1 and pulled the overall down more than anything else. A
   less exhaustive reader would list ten. **This input measures agent
   thoroughness as much as post difficulty, so comprehension is not yet
   comparable between posts.** Treat the overall as directional and read the
   parts separately. Likely fix: split the field into terms that BLOCKED
   comprehension (scored) and terms merely noticed (not scored).
2. **Non-question H2s are judged on `answeredItsQuestion`.** "Sources" was
   marked false on run 1 and cost headings score, which is meaningless because
   Sources is not a question. Likely fix: only score H2s ending in a question
   mark.

3. **`blockedActions` is looser than it looks.** After run 1 this doc claimed
   actionability was the stable sub-score. **Run 2 refuted that** and the claim is
   withdrawn. The second reader counted as blocked several things that are not
   instructions in the post at all ("use any of this outside Texas", "act if the
   window has already passed"), which inflates the denominator on a reader-by-reader
   basis. Likely fix: restrict `blockedActions` to steps the post actually
   instructs.

**The noise floor.** Runs 1 and 2 scored the same article 50 and 53.4. The text
changed between them, so that spread is part revision and part reader variance
and the two cannot be separated at n=2. Until several posts have been scored,
**treat any difference under about 5 points as noise.** On run 2, `headings`
moved 90.9 to 100 purely because a different reader marked the non-question
"Sources" heading true, which is flaw 2 above, not an improvement in the writing.

What the cold read is unambiguously good at, on both runs, is naming specific
defects. Run 1 found ten unusable instructions. Run 2 found that telling the
reader to produce overtime "in hours and in dollars" is not doable by a DON,
because pay rates sit with payroll, a defect introduced by the run-1 fix itself.
**Read the lists. The number is only for tracking.**

### Advisory now, mandatory later

Founder call, 2026-09-21: advisory for 6 to 7 posts, tune, then make it blocking.

It is advisory by construction, not by convention. Scores are written to
`manifest.scores`, which `manifestStatus()` never reads, so a bad score
**cannot** block a commit. `npm run cold-read trend` counts down the remaining
posts to the calibration review.

**To promote it to blocking** (one deliberate change, after calibration):

1. Add `coldRead` to `RECORDED_FIELDS` and `BLOCKING_RECORDED` in `scripts/lib/manifest.mjs`.
2. Add an `ACCEPTED.coldRead` threshold.
3. Add the row to the publish-gate table and to `publish-pipeline.md` phase 7.

Until then a low score is information, not a veto.

### What the score cannot tell you

It measures whether the reader could follow and use the post. It says nothing
about whether the post is true, differentiated, or worth writing. Those are the
fact-check, the proofread, and the commodity grade above. A post can score 100
here and still be worthless.
