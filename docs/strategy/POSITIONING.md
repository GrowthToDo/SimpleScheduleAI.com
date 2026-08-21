# Positioning statements — SimpleScheduleAI

> ⚠️ **NOT FINAL, but no longer blocked on structure.** All 7 inherited messages
> walked (P1-P9, one retired), three roles gap-filled (P10, P11, P12), closing
> adversarial press RUN and returned DO NOT FINALIZE on ten findings.
>
> **Status 2026-08-21.** The five falsifiable claims were fixed on 2026-08-16
> (see "Fixed after the press"). The **five structural findings are now worked**:
> four are closed and one is deliberately held.
>
> | Finding | Status |
> | --- | --- |
> | 1. P4 not registry-verbatim | **CLOSED.** P4 now quotes the `triad` row exactly. The live drift at `index.astro:122` that caused it is fixed (commit `6b3b8d29`). |
> | 2. Governance claim false as executed | **CLOSED.** See "Registry amendment table". |
> | 3. No statement carries a mode label | **CLOSED.** Every statement carries one; twins authored. |
> | 4. N8 has no statement | **CLOSED.** P12 added. |
> | 5. P11 builds on forbidden N9 | **HELD, by design.** P11 is not proposed for adoption. Its N3 mechanism is separated as P11a. Unholds when the CNO interviews settle N9. |
>
> **What still gates shipping is founder approval, not open structure.** Nothing
> here flows into `positioning-registry.md` until the founder approves the
> amendment table. The lower-severity findings below are also unapplied.

## Fixed after the press (2026-08-16)

Five claims were falsifiable as written and are corrected above:

1. **P11 asserted holiday load "carried across scheduling periods".** False.
   Only weekend counts carry (`scoring.ts` §3 `historicalWeekendCounts`); holiday
   fairness is scored against the **team average inside the period** (factor 9).
   The correct wording was sitting in this file's own annotation while the copy
   said otherwise.
2. **P11 said "every hard shift", which reaches nights.** Nights are on the
   NOT CLAIMABLE list: `scoring.ts` contains "night" zero times, and this exact
   claim was swept from 27 places across 19 files on 2026-08-12 at the founder's
   instruction. Reintroducing it here was the worst miss in the walk.
3. **P8 led with "The schedule goes out on time."** Deleted. Its opposite ("our
   schedules go out late") is nobody's strategy, so it fails the Opposite Test as
   table stakes; it is a **deliverable** framing of the kind this file killed M5
   for; and it is a delivery-record claim from a company that has never run a
   cycle for a paying hospital.
4. **P2 and P7 said "nothing for you to operate".** `NEEDS-STACK.md` N2 already
   corrected that overclaim: she still sends PTO, known constraints and ED spikes
   every week (registry `weekly-inputs`), and approves out of band. P2 now states
   the bounded truth, and the section heading changed from "What you make
   obsolete" to "What we take over".
5. **P1 carried an em-dash**, which the registry forbids in both columns and the
   global tone rule bans outright. Now a comma.

## The press findings and how each was worked (2026-08-21)

Kept in full as the record. Each now carries its resolution; the file's status
table at the top is the summary.

1. **CLOSED.** **P4 is NOT registry-verbatim, despite saying it is.** The `triad` row reads
   "AI builds **your** schedule, our scheduling team checks it, you approve.
   **No IT.**" P4 copied `src/pages/index.astro:122`, which has already drifted
   from the registry. Either quote the row exactly or open a registry amendment
   — but do not call a changed line canon. **Also file the live drift at
   index.astro:122 as a separate defect.**
2. **CLOSED** by the Registry amendment table. **The governance claim is true as intent, false as executed.** P7 and P9 are
   drop-in replacements for the `value-prop` and `pricing-short` rows, drafted to
   shipping spec (P7 even carries a character count). P9 additionally breaks
   registry authoring rule 5, "never restate pricing in any other shape". A
   section listing every registry row this file would amend, each with its
   product-mode twin authored, must exist before adoption.
3. **CLOSED.** Every statement now carries one. **No statement carries a mode label.** Registry authoring rule 2: a
   service-mode phrase without a product-mode twin is migration debt. Six novel
   statements here generate six units of it.
4. **CLOSED** by P12. **N8, the second promise, has no statement at all.** `NEEDS-STACK.md`
   instructs "promise N3 and N8". N3 has three statements; N8 has zero, despite
   having the most registry-backed proof already written (`delivery-cadence`,
   `callout`, and the founder's own 2026-08-15 correction about absorbed change).
5. **HELD by design**, with the shippable half separated as P11a. **P11 builds copy on N9, which `NEEDS-STACK.md` forbids** until the CNO
   interviews settle that level. The explicit refusal sentence mitigates but does
   not override a standing instruction. Hold P11, or ship only its
   weekend/holiday mechanism, which sits at N3 and needs no N9 reference.

Lower-severity findings from the press, not yet applied: P6's provenance is
graded OBSERVED when the dossier requires REPORTED, and its "on top of your
clinical shifts" clause is unsourced; P5 still leans on subtraction and its
"Those hours" has no antecedent inside the statement; the argument that "No
per-nurse fees" is an affordability identity is contested — at $37.50 per nurse
per month against product mode's $10, it is a **model** contrast that is more
expensive per head, which is a More-for-More device rather than a discount
signal; no counter-statement exists against Excel, which `NEEDS-STACK.md` calls
the real default alternative; and P3 is a headline any vendor could paste.

Targets the **nurse manager, DON or CNO** at a Texas Critical Access Hospital of
25 beds or fewer, per `NEEDS-STACK.md` (levels cited as N-numbers) and
`VOTERS.md` (zero voters; the plate-clearing commitment is the standout
investment candidate, the publish gate is the secondary pillar). No
ideal-customer definition or interview-findings file exists, so statements are
caveated accordingly.

**Declared pricing strategy: More for More** (founder, 2026-08-16). Every
statement is checked against it. Two consequences that bind this whole file:

1. **Affordability may not lead.** Price may appear; the affordability identity
   may not. "No per-nurse fees", "No IT setup" and the monthly figure become
   supporting detail, never headline claims.
2. **Superiority may not be asserted.** `VOTERS.md` returned zero voters and
   found the "nobody else does this" rarity claim false (YouShift offers
   end-to-end managed scheduling for clinical teams). So the More-for-More story
   rests on **completeness and craft**, which we can show, not on being best,
   which we cannot yet prove.

> ⚠️ **GOVERNANCE.** `docs/seo/positioning-registry.md` remains the AUTHORITY on
> approved wording and the service/product mode split. This file **proposes**.
> Anything adopted must flow back into the registry as an updated row, or we end
> up with two competing sources of approved copy — the exact drift class this
> repo spent 2026-08-14 removing.

## What you promise (one level up)

**P1.** **"Every shift covered, without leaning on whoever always says yes."**
[N3 — the promise level: every shift covered by someone who can actually do it,
without leaning on the same few people] [MODE: service. Twin authored below; identical, the claim names no operator.]
Reworked from: "Every shift covered — without asking the same three nurses
again." (candidate), which the founder correctly rejected: "three" reads as a
counted number and is not true for every hospital. The specificity now sits on
the recognisable *behaviour* rather than on a count we cannot support.
Gates: value framing — more of something the reader is counted on (coverage that
holds), not less of a negative. Opposite test — PASSES; optimising purely for
fill rate and letting fairness fall where it lands is a real strategy
competitors run. Price story — consistent with More for More: it claims
thoroughness, not a discount.

**P7.** **"Every shift covered, without leaning on whoever always says yes. Nurse
scheduling for Texas hospitals of 25 beds or fewer."**
[N3 promise + N2 obsolete-brag; meta description, so it carries an SEO job as
well as a positioning one] [MODE: service. Amends the registry `value-prop` row; twin authored below.]
Reworked from M4: "Scheduling stress drives your best nurses out and burns your
budget. You get a compliant, post-ready schedule every cycle, callout coverage
handled."
Gates on the original: the second sentence was a **deliverable pitch** (naming
what arrives in her inbox rather than what changes); both sentences **widened**
via "and" and a trailing comma clause, which reads as an average rather than a
maximum; and "burns your budget" is a **cost frame** aimed at a scoreboard the
nurse manager does not own — that is the administrator's line, not hers, and it
contradicts More for More.
The rewrite leads with the promise, then narrows with an audience qualifier
(specificity applied to the claim's extent) rather than widening with a list. The
trailing clause passes the deletion test: removing it makes the sentence broader,
so it is working.
Founder instruction 2026-08-16: keep "nurse scheduling" discoverable. Placed in
the second sentence so the promise still leads. **154 characters**, inside the
140-160 meta-description band.

**P12.** **"A schedule your nurses can build a life around, cycle after cycle."**
[N8 — the second promise: my nurses can plan their lives around the schedule, and
the changes that do come don't blow up their week]
[MODE: service. Product twin authored in the registry amendment table below.]
Gap-filled 2026-08-21 to close the open finding that N8, which `NEEDS-STACK.md`
names as a promise sibling to N3, had no statement while N3 had three.

Why this level needs its own promise rather than folding into N3: the
adversarial pass showed N1 bundles two jobs with different parents. Patching
holes leads to coverage, which is N3. Getting the schedule *out* leads to
predictability, which is N8. Guarantee perfect coverage with nothing ever posted
and the unit still collapses.

Gates. **Value framing** — it promises more of something she is counted on for,
staff who can plan, rather than relief from a negative; the rejected drafts
("your nurses stop asking when the schedule is coming", "stop being blindsided")
were both less-of-a-negative and failed here. **Opposite test — PASSES**, and
this is the one worth stating: "keep the schedule fluid right up to the day" is
a real strategy that per diem marketplaces and gig-shift apps actively sell.
**Price story** — consistent with More for More; it claims reliability and craft,
not a lower price. **Deliverable check** — deliberately not "you get the schedule
on Thursday", which would name what arrives in her inbox rather than what changes
for her people.

Proof already written and registry-backed: `delivery-cadence` (a post-ready
schedule on a known day each cycle), `callout` (we generate ranked replacements,
she picks, **we** update the schedule and send the corrected copy), and the
founder's 2026-08-15 correction that the change is absorbed on our side rather
than handed back to her.

**Honest boundary, and it constrains the wording.** `delivery-cadence` is
delivery to the *manager*, not publication to nurses. We do not control when she
posts. "Cycle after cycle" therefore carries the cadence claim we can support
without implying we control what her nurses see or when. Do not extend this
statement to advance-notice claims, which belong to her posting policy and, in
committee states, to her staffing plan.

## What we take over (below)

**P2.** **"You send us PTO and constraints. We do the rest."**
[N2 — the roster upkeep and tool operation we take over] [MODE: service. Twin authored below; the sentence names an operator, so the twin differs.]
Reworked from: the third clause of a rejected candidate, "Your unit covered,
your rotation fair, and nothing for you to operate." The founder liked the line;
the wording failed the clause test, because deleting the conjunction and
everything after it made the sentence broader rather than sharper, which means
the list was diluting the claim. Split rather than cut: this clause is doing a
different job — bragging about the level below — so it earns its own statement.
Caveat carried from `VOTERS.md`: this is the investment candidate, not a proven
voter. It must not be worded to imply the bet is already validated in market.

**P5.** **"Those hours go back to the floor."**
[N2/N1 — the consequence of taking the build and upkeep off her plate] [MODE: service. Twin authored below; identical.]
Reworked from M3: "Your nurse manager spends a day and a half every week
building the schedule. We give it back."
Gates: the original was a savings pitch, the one framing the method says never to
use, because it caps the price at a fraction of the hours saved — and under More
for More it actively tells the smart-choice story instead of the best-in-class
one. The repair sends the time somewhere the reader is counted on, which is the
founder's own framing of the product: take it off her plate so she can do the
work she likes. Opposite test — PASSES; plenty of tools are sold on giving the
manager a better console to work in, i.e. keeping her in the tool rather than out
of it.

**P8.** **"When something slips on our side, you have a name and a number, not a
ticket queue."**
[N1/N3 — the craft-and-care claim for the pricing block] [MODE: SERVICE-ONLY. No product twin is possible; see the amendment table.]
Reworked from M5: "A compliant, post-ready schedule every cycle. Flat monthly
pricing."
Gates on the original: **deliverable pitch** (a schedule arriving, not something
changing for her), and "flat monthly pricing" is an affordability identity in a
headline slot, which More for More forbids. Also inaccurate as written — pricing
is banded by roster size, $1,000 up to 20 nurses and $1,500 for 21 to 40, so
"flat" is shorthand for "not per-nurse" and reads as a cheapness promise when
stacked beside two other absence claims.
Two refinements applied to the founder's chosen candidate: "cycle" replaced with
"the schedule", because "cycle" is our vocabulary and hers is the schedule; and
"someone is accountable" replaced with the concrete proof, since show-don't-tell
demands the artifact rather than the adjective. The proof exists: a named contact
(Pradeep), a direct number shared at onboarding and deliberately never published
on a page, and a 1-hour business-hours response commitment for coverage-blocking
issues (`positioning-registry.md`, `escalation` row).
Opposite test — PASSES; self-serve software's entire model is that you run it and
you own the outcome.

**P9.** **"$1,000 to $1,500 a month, by roster size."**
[supporting detail, not a claim] [MODE: service. Amends the registry `pricing-short` row; twin authored below.]
Reworked from M6: "$1,000 to $1,500 a month, by roster size. No IT setup. No
per-nurse fees."
The price stays; the two absence claims are **demoted out of the headline slot**
to supporting detail elsewhere on the page. Under More for More the price may
appear but the affordability identity may not, and "No per-nurse fees" is an
affordability identity.

> ⚠️ **Founder decision, recorded with its risk.** "No per-nurse fees" is the
> sharpest contrast against per-seat competitors and may be converting today.
> Demoting it is a framework prediction, not evidence about our buyers. The
> change is reversible; watch it if shipped.

## Commiseration (inciting events)

**P6.** **"Eight to twelve hours a week, on top of your clinical shifts."**
[commiseration; provenance: OBSERVED — 30+ pre-build nurse-manager interviews,
recorded in the facts dossier as an estimate of a typical week, explicitly not a
measured time study]
Supporting copy, not a claim. Uses the **honest range**. See the truth finding
under P5's source message.

**P3.** **"Stop Rebuilding the Nurse Schedule Every Sunday Night."**
[commiseration; provenance: HYPOTHESIZED — founder's line drawn from the
pre-build interviews, never message-tested]
Kept as-is, reclassified. As a *promise* it fails twice: it frames relief from a
negative rather than more of a positive, and its opposite ("keep rebuilding it
every Sunday") is nobody's strategy, so the Opposite Test kills it as a
differentiating claim. As commiseration it is doing the right job: vivid,
specific, and naming the moment she is actually in. It stays as the headline
**provided a value-framed promise sits beside it** — which is what P1 is for.

## What you do (your level — features)

**P4.** **"AI builds your schedule, our scheduling team checks it, you approve. No IT."**
[N1 — what we do] [MODE: service. Product twin exists in the registry `triad` row.]
Quoted VERBATIM from the `triad` row in `positioning-registry.md`, founder-set
canon, and this file only proposes.
**Corrected 2026-08-21.** The earlier version of this statement read "AI builds
**the** schedule … you approve." with no "No IT.", because it was copied from
`src/pages/index.astro:122` rather than from the registry, and that line had
drifted. The live drift is now fixed (2026-08-21, commit `6b3b8d29`): the page
and the registry row agree again, so P4 can be what it always claimed to be.
Diagnosis: it is a **mechanism pitch** — every clause's subject is how the
product works. But mechanism claims are not banned, they are demoted, and this
one belongs exactly here, at our level, as the feature that explains how the P1
promise is kept. Two things save it. It passes the **Opposite Test**, which is
unusual for a mechanism claim: the opposite is "the AI builds it and nobody
checks it", which is a real strategy every pure-automation competitor runs. And
under More for More it speaks craft and care rather than price.
**The sentence was never the problem; its slot was.** It sits in the hero
subtitle where the promise belongs, which is why the live hero reads
commiseration, then mechanism, then savings, with no value claim anywhere. It
should sit beneath P1.

## Against the adjacent occupants (gap-fill)

**P10.** **"An agency booking covers tonight. It doesn't change who gets asked
tomorrow."**
[counters the labour-source occupants at N3 — agency and travel staffing firms,
per diem agencies, float pools, overtime] [MODE: service. Twin authored below; identical.]
Gap-filled, not reworked from existing copy.

**Written carefully, because the previous attempt at this argument was wrong.**
An earlier draft of `VOTERS.md` claimed agency was our real competitive
alternative and that a DON who calls an agency "never needs us at all". That was
false: she has covered one shift and still has the rest of the cycle to build.
Agency solves a **supply** problem, we solve an **allocation** problem, so they
are complements. This statement therefore counters agency **only on the rotation
question**, which is genuinely ours, and claims no displacement.
Opposite test — PASSES; "book agency and let the rotation sort itself out" is
exactly what many hospitals do today.
What she keeps by buying at our level: her own staff on the shifts, continuity of
care, and a rotation that still means something next month.

## Aspiration (reference, never promise)

**P11.** **"Weekend shifts are counted per nurse and the count carries into the
next scheduling period; holidays are scored against the team's average. The same
names don't keep landing on the weekends by default. Whether that keeps someone
from leaving is not ours to claim."**
[references N5 — keep my nurses from quitting — and N9 — my nurses aren't so worn
down that something goes wrong — without promising either] [MODE: n/a — HELD, not proposed for adoption. See finding 5 below.]
Gap-filled. Aspiration copy shows the part we play and never claims the outcome.
The second sentence is doing deliberate work: with zero customers we have no
retention evidence whatsoever, and an explicit refusal reads stronger than a
hedge. It also protects against the N9 warning in `NEEDS-STACK.md`, which flags
that level as the least-evidenced in the file and forbids building copy on it
until the CNO interviews settle it.
Mechanism is real and code-backed: weekend counts carry across periods and
holiday load is scored against the team average.

## Retired without a statement (stays after finalization)

- **M7: "Your Sunday nights back: the week's schedule arrives done."** — killed
  by the value gate as a **deliverable** framing ("the schedule arrives") bolted
  to a **savings** framing ("your Sunday nights back"), which is both failure
  modes in one line. Its ground is now covered by P3 (the commiseration
  headline, which owns the Sunday-night image) and P5 ("Those hours go back to
  the floor", which sends the time somewhere she is counted on). Retiring rather
  than rewriting, because a compliant version would simply duplicate P3 and P5.

## Live-copy defects found during the walk — BOTH FIXED 2026-08-21

**Both are now resolved and live.** Kept here as the record of what the walk
found and how each closed, because one of them did not close the way this file
predicted.

- **Homepage "a day and a half every week" → FIXED** to the sourced range, "8 to
  12 hours every week" (commit `6b3b8d29`). This file called it correctly: a
  confirmed fact worded to imply more than it says.
- **`/how-it-works` "1 to 2" → NOT a fabrication after all.** This file recorded
  it as an unsourced outcome projection and it was briefly removed on that basis.
  The founder confirmed 2026-08-19 that 1 to 2 hours of review is the designed
  manager load and is deliberately generous. The real defect was that the figure
  had **no facts-dossier entry**, which is why it read as unsourced to a
  fact-check pass. It is restored, with the unit and activity now stated ("1 to 2
  hours of review" rather than a bare "1 to 2"), and a dossier entry records it
  as a founder-stated design figure with its framing rules.
- **Lesson worth keeping:** "absent from the dossier" is not the same as "false".
  The walk was right that the number was unsupported *as published* and wrong
  that it was unsupportable.

### 2. `/how-it-works` claims an outcome we have no basis for

`src/pages/how-it-works.astro:69` — subtitle, live: *"Scheduling workload drops
from 8 to 12 hours a week to **1 to 2**."*

The 8-to-12 figure is sourced. **"1 to 2" appears zero times in the facts
dossier** — verified by search 2026-08-16. It is an outcome projection published
by a company with zero customers, in the same sentence as a sourced number, which
is what makes it read as equally evidenced. Same defect class as the
day-and-a-half figure below, found by the adversarial press rather than by the
walk. Note the pattern: the walk checked the homepage and stopped, so a sourced
number sitting next to an unsourced one on a different page survived.

### 1. Homepage overstates the sourced range

**"a day and a half every week"** on the homepage (`src/pages/index.astro:127`)
overstates the sourced range. The facts dossier records **8 to 12 hours a week**
from the 30+ interviews, framed as an estimate of a typical week and explicitly
not a measured time study. "A day and a half" is twelve hours, the top of the
range, presented as the norm. The truth gate catches this as a confirmed fact
worded to imply more than it says. **Fix the live page to the honest range
regardless of whether any positioning statement here is adopted.**

## Registry amendment table (adoption plan)

Written 2026-08-21 to close two open findings: the governance claim was true as
intent but false as executed, and no statement carried a mode label. Every
statement below now declares its mode, and every one that would change or add a
registry row has its **product-mode twin authored here**, per registry authoring
rule 2: a service-mode phrase without a product-mode twin is migration debt.

**Nothing here is adopted.** This is the list a founder approves before anything
flows into `positioning-registry.md`. The registry stays the authority.

### Rows this file would AMEND

| Row | Current service column | Proposed | Product-mode twin (proposed) |
| --- | --- | --- | --- |
| `value-prop` | You get a compliant, post-ready schedule every cycle, callout coverage handled. | **P7:** Every shift covered, without leaning on whoever always says yes. Nurse scheduling for Texas hospitals of 25 beds or fewer. | Every shift covered, without leaning on whoever always says yes. Nurse scheduling software for hospitals of 25 beds or fewer. |
| `pricing-short` | $1,000 to $1,500 a month, by roster size. No IT setup. No per-nurse fees. | **P9:** $1,000 to $1,500 a month, by roster size. | $10 per user per month, or $100 per user per year. |

Two notes on the `pricing-short` amendment. It does not restate pricing in a new
shape; it is the same row with the two absence claims removed, because More for
More permits the price to appear but not the affordability identity. And the
founder's recorded dissent stands: "No per-nurse fees" may be converting today,
demoting it is a framework prediction rather than evidence, and the change is
reversible.

### Rows this file would ADD

| Proposed row | Service mode | Product-mode twin (proposed) |
| --- | --- | --- |
| `promise-coverage` | **P1:** Every shift covered, without leaning on whoever always says yes. | Every shift covered, without leaning on whoever always says yes. |
| `promise-predictability` | **P12:** A schedule your nurses can build a life around, cycle after cycle. | A schedule your nurses can build a life around, cycle after cycle. |
| `inputs-short` | **P2:** You send us PTO and constraints. We do the rest. | You enter PTO and constraints. The engine does the rest. |
| `hours-returned` | **P5:** Those hours go back to the floor. | Those hours go back to the floor. |
| `accountability` | **P8:** When something slips on our side, you have a name and a number, not a ticket queue. | *No twin. See below.* |
| `rotation-vs-agency` | **P10:** An agency booking covers tonight. It doesn't change who gets asked tomorrow. | An agency booking covers tonight. It doesn't change who gets asked tomorrow. |

**P8 cannot have a product-mode twin, and that is the finding, not an omission.**
Its whole content is that a named human on our side is accountable when something
slips. In product mode the hospital operates the software and there is no "our
side" to be accountable for a schedule we did not run. Writing a twin would
manufacture a support promise the product tier does not make. **Recommendation:
mark `accountability` service-only in the registry**, which the table already
supports (rows may be service-only where the claim is structurally service-bound),
rather than authoring a twin to satisfy the rule mechanically.

P1, P5, P10 and P12 carry identical twins because they are claims about the
customer's outcome, not about who operates the tool. That is expected and is not
a copy-paste error: mode only bites where the sentence names an operator.

### Statements NOT proposed for the registry

- **P3** and **P6** are commiseration and supporting copy, not positioning
  claims, so they do not need rows.
- **P4** already IS the `triad` row, quoted verbatim. No amendment.
- **P11** is held (see below), so it is not proposed for adoption.

## Finding 5 — P11 held, with the shippable half separated

`NEEDS-STACK.md` forbids building copy on N9 until the CNO interviews settle
that level, and the explicit refusal sentence inside P11 mitigates but does not
override a standing instruction. **P11 is held in full.**

The mechanism inside it does not depend on N9 and sits at N3, where we already
have a promise. It is separated here so the useful half is not lost:

> **P11a (shippable):** "Weekend shifts are counted per nurse and the count
> carries into the next scheduling period; holidays are scored against the
> team's average. The same names don't keep landing on the weekends by default."
> [N3 — mechanism supporting the coverage promise] [MODE: service; twin identical,
> the mechanism is the same in both tiers]

P11a drops only the final sentence, which is the sentence that reaches N9 and
N5. Code-backed and verified: weekend counts carry across periods
(`scoring.ts` §3 `historicalWeekendCounts`), holiday load is scored against the
team average (factor 9). Nights remain NOT CLAIMABLE.

**Unhold condition:** the CNO interview chain runs and N9 settles. Until then,
neither P11 nor any retention or patient-safety framing ships.

## Facts to verify

- None outstanding for P1 to P6; the statements assert behaviour, or use the
  sourced range, deliberately.

## Next steps

To be written at finalization.
