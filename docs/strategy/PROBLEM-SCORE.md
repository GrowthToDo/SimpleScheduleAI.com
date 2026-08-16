# Problem Score — AI-native nurse scheduling service for Critical Access Hospitals

**Status: COMPLETE.** All seven criteria walked with the founder on 2026-08-15
and 2026-08-16, and three scenarios scored — A (Texas CAH), B (all US CAH),
C (skilled nursing). Home care was ruled out as a scenario by the founder and is
recorded in the expansion map as a candidate second *product*.

The flag carried through the whole walk turned out to be the finding: every
expansion market either requires a different product or fails on the same two
cells as the anchor market. See **The master variable**.

## Target market (Scenario A)

**Buyer:** the signer at a Texas Critical Access Hospital of 25 beds or fewer —
administrator or CEO, with the DON or CNO as champion. (Two heads: per
`NEEDS-STACK.md` the nurse manager feels the pain and uses the output; the
administrator controls the budget. Scored on the signer, since Lucrative and
Liquid are budget questions.)
**Problem:** the nurse schedule is rebuilt by hand every cycle and patched by
phone when someone calls out.
**Trade-offs, deliberate:** no nurse-facing app; no payroll or HRIS integration;
Texas only; 25 beds or fewer.
**Price:** $1,000 to $1,500 a month, banded by roster size.
**Ambition:** **scale-up** (founder, 2026-08-16). CAHs are a beachhead chosen for
acute pain and thin competition; the intended path is Texas CAH → all CAH →
medium → large.
**Evidence:** 30+ pre-build nurse-manager interviews. **Zero customers, zero
delivered cycles, zero retention data.**

## Scores (Scenario A)

| Criterion  | Value  | Justification                                                                                                                                                                                                                                                                                                                                     | Class  |
| :--------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| Plausible  | **93** | Hard count, used as-is per the rubric's data exception: 93 Critical Access Hospitals in Texas (RHIhub Texas state guide, in the facts dossier). Effectively all of them build nurse schedules, so the problem-having population equals the population. **The framework's reference point for a business market is ~100k; this is ~1,000× below it.** | [data] |
| Self-Aware | **1.0** | Founder proposed 0.8-0.9; off-scale values are refused, so the choice was 0.5 or 1.0. What carries the 1.0 is **demonstrated purchase behaviour, not stated awareness**: they already buy scheduling software, find it does not fit the pain, and revert to Excel. Independently corroborated in our own competitor corpus (the QGenda reviewer: "I just stopped using the automation") rather than resting on founder recollection. Two caveats recorded: the 30+ interviews are **selection-biased for this criterion specifically** (people who agree to discuss scheduling with a scheduling founder pre-select for caring), so the interviews are not what earns the score; and the founder's own exception — facilities under ~10 staff stop feeling it — is a **market-definition floor**, not a score adjustment. | [research] |
| Lucrative  | **$1k** | Scores the allocation the market **demonstrably** makes, per the rubric, not our sticker price. Founder confirms these buyers pay **per-user pricing**, roughly $5-10/nurse/month; on a 20-nurse roster that is $1,200-2,400/year, the `$1k` band. Our service asks $12,000-18,000/year, the `$10k` band. **A ~10× gap between what this market spends on scheduling and what we charge, with zero customers proving it can be crossed.** The strategic reading: at 10× the software line we are not selling into the software budget but into the labour budget (manager hours, agency premium, turnover cost) — coherent with the service thesis, but it requires funding from a category most CAHs do not have. Corollary: **product mode at $10/user/month is ~$2,400/year on a 20-nurse roster, the same `$1k` band as competitors, while the service sits a band above** — the two modes occupy different budget categories and different budget holders. | [data] |
| Liquid     | **0.1** | Founder: an annual decision. Consistent with SaaS renewal norms and with the Deputy 12-month commitment documented verbatim in the competitor dossier. Recorded nuance rather than averaged away: CAHs **affiliated with a parent health system are closer to 0.01**, because the parent signs an enterprise multi-year contract and the CAH is told the system is "already set up" — the pattern our UKG research documents. The 0.1 applies to independent CAHs. | [research] |
| Eager (identity) | **0.1** | Structural challenges, accepted by the founder without argument (2026-08-16). **Zero customers means zero references**, in a segment that asks for them early, and part of what we sell is the paper trail a CMS surveyor reads — so the buyer is trusting a first-of-its-kind vendor with documentation that carries citation risk. "You have been in business a year" lands harder when the downside is a survey finding. The single-founder service model adds the obvious question of what happens if he is unavailable during a scheduling week. **This is the one criterion a handful of reference customers moves directly**, which is the strongest argument for prioritising the NAINA CNO introductions. | [reasoning] |
| Eager (comparative) | **0.5** | Not 1.0: the rarity claim is **false** and `VOTERS.md` records why — YouShift sells end-to-end managed scheduling (dossier line 1058), and the platforms market at the coverage level too, so "one-of-a-kind with no viable alternative" fails. Not 0.1 either: for a hospital with no IT staff and a DON who takes clinical shifts, "we operate it, you do not" is a material difference a meaningful fraction would choose on its own. That is the definition of the middle value. Caveat carried from the voters work: **no buyer has yet accepted a cost for this difference**, so 0.5 is argued, not demonstrated. | [reasoning] |
| Enduring   | **0.5** | Recurring problem, recurring revenue — the middle value by definition. Not 1.0, and the reason is a deliberate choice rather than a gap: we **refuse lock-in**. No payroll or HRIS integration, exports that round-trip, and the hospital keeps its own Excel. That is honourable and it costs us here. Two risks recorded rather than smoothed over: **zero retention data** (the rubric's stated press on this criterion, and we fail it), and the abandonment pattern documented in our own published research — this market demonstrably walks away from scheduling tools it has already bought. A service is abandoned differently from software, but nothing in our evidence says it is abandoned less. | [reasoning] |

## The verdict

```
Scenario A — Texas CAH
93 × 1.0 × $1k × 0.1 × 0.1 × 0.5 × 0.5 = 232.5   ÷ 625,000 = 0.0004

Scenario B — every CAH in the United States (1,388)
1,388 × 1.0 × $1k × 0.1 × 0.1 × 0.5 × 0.5 = 3,470   ÷ 625,000 = 0.0056
```

Read at its power of ten: **not a viable business model as scored**, by roughly
three orders of magnitude, and going national does not rescue it.

**The dominant weak link is Plausible, not the two 0.1s.** That matters because
the instinct is to blame the reference problem and the annual decision cycle,
both of which are fixable. Market size is not.

Sensitivity, so the arithmetic is not mistaken for pessimism about execution.
Every one of these is Scenario B — the entire national CAH market:

| If we also fix…                                             | Score |
| :---------------------------------------------------------- | ----: |
| nothing (as scored)                                          | 0.0056 |
| the reference problem entirely (Eager-identity 0.1 → 0.5)    | 0.028 |
| …and win the full budget we ask for (Lucrative $1k → $10k)   | 0.28 |
| …and achieve genuine lock-in (Enduring 0.5 → 1.0)            | 0.56 |

**Still below 1 with every fixable weakness fixed.** At this price and these
conversion assumptions the model needs on the order of **250,000 buyers** to
clear 1.0. There are 1,388 Critical Access Hospitals in the country.

### What this does and does not say

It does **not** say the problem is unreal, the product is bad, or the founder is
wrong about the pain. Every criterion that measures whether the pain exists and
whether buyers recognise it scored at or near the top of its scale. Self-Aware
came in at 1.0 on demonstrated purchase behaviour.

It says one thing, narrowly: **a business whose total addressable market is
Critical Access Hospitals cannot become a scale-up by winning.** It can be an
excellent niche company replacing a salary — the exception the rubric explicitly
grants for a small market at a high price, which is exactly our shape — but that
is a different ambition from the one the founder stated (2026-08-16: "we want to
make it scale-up").

**Therefore the scale-up case does not rest on this business succeeding. It
rests on the expansion market, which has not been scored.** That is Scenario C,
and the flag in this file's header — that the expansion market may require a
different product rather than the same product sold wider — is now the single
most consequential open question in the strategy.

## Scenario C — the expansion map

The header's flag turned out to be the finding. Sorting candidate markets by
whether they schedule the way we schedule matters more than sorting them by size.

| Candidate market | Count | Same scheduling problem? | Status |
| :--- | ---: | :--- | :--- |
| Texas CAH | 93 | yes — this is the anchor | scored: **0.0004** |
| All US CAH | 1,388 | yes | scored: **0.0056** |
| Skilled nursing facilities | 15,400 | **yes** — shifts on a roster, in a building | scored below: **0.06** |
| US hospitals above 25 beds | ~4,700 | yes, but the sale requires integrations, SOC 2 and enterprise procurement | scored as-is: **0.0038**; as a rebuilt enterprise company: **1.88** |
| Home health / home care | ~12,000 certified, plus a larger non-medical market | **no** | **out of scope as a scenario** |

**Home care is out, and the founder is the one who ruled it out** (2026-08-16:
"Definitely 2 diff markets, problems are different"). The reason is structural,
not commercial: we schedule **shifts on a unit** — weekend and holiday fairness
across a fixed roster, a callout shortlist, coverage of a floor. Home care
schedules **visits across a geography** — client-to-caregiver matching, travel
time, continuity of caregiver, and Electronic Visit Verification. The founder's
market research rates it highly on budget and buying speed, and that may well be
right; it is a candidate for a **second product**, and it is not a way to make
this one bigger. Recorded here so it is not re-proposed as a scenario later.

Also recorded, because it is a real gap: **the competitor dossier contains
nothing on this space.** No WellSky, AlayaCare, AxisCare, HHAeXchange, Axxess,
MatrixCare or ClearCare. Any move in that direction starts from zero verified
competitive intelligence, against incumbents better funded than the CAH field.

### The master variable

Across every scenario above, the same lever dominates — and it is not market
size. Holding the other scores where Scenario A set them, here is the market
size each budget band would require to reach a score of 1.0:

| Budget the market allocates | References fixed? | Buyers needed for 1.0 |
| :--- | :--- | ---: |
| `$1k` (what they demonstrably spend on scheduling software) | no | **250,000** |
| `$1k` | yes | **50,000** |
| `$10k` (a services budget) | yes | **5,000** |

There is no category of facility that schedules nurses on shifts and contains
250,000 buyers. At `$10k` with references, **skilled nursing alone clears it**,
and even the national CAH market becomes arguable.

**So the decisive question is not whether these buyers have the problem —
Self-Aware scored 1.0 on demonstrated purchase behaviour — but whether anyone
will pay roughly ten times the software line for it.** That is the service
thesis stated as a number, and it is the one claim in this entire file with zero
supporting evidence. It follows that the first customer conversations must test
**price**, not problem. The problem is settled; the price is the company.

## Scenario C — skilled nursing facilities (15,400)

Scored 2026-08-16 at the founder's instruction. Only the cells that differ from
Scenario A are argued; the rest carry over with their reasoning intact.

### The regulatory argument for this market no longer exists

Recorded first because it was the argument this section was going to lead with,
and the research killed it. **CMS repealed the long-term care minimum staffing
standards effective 2 February 2026** — the 3.48 total nursing hours per
resident day, the 0.55 RN and 2.45 nurse-aide components, and the 24/7 RN
presence requirement are all gone. Federal district courts in the Northern
District of Texas and the Northern District of Iowa vacated them as exceeding
CMS's statutory authority, and Public Law 119-21 imposes a **ten-year moratorium
on enforcement running to October 2034**. What remains is the older statutory
floor: eight consecutive hours of RN service daily and a full-time director of
nursing.

Two consequences, and they point in opposite directions. The compliance forcing
function that would have made staffing urgent for every SNF administrator is
**gone for a decade**, which is a real argument for scoring this market lower
than instinct suggests. But the operational pain — callouts, agency spend,
turnover — is untouched by a repeal, and PBJ payroll-based reporting and the
Five-Star staffing rating both survive. **The market still has the problem; it
just no longer has a regulator insisting it solve it.**

### Scores

| Criterion | Value | Change from Scenario A | Class |
| :--- | :--- | :--- | :--- |
| Plausible | **15,400** | Up ~165× from Texas CAH, ~11× from national CAH. Hard count (Definitive Healthcare, accessed July 2026). Structurally the same scheduling problem: shifts on a roster inside one building, with callouts, coverage and weekend fairness. | [data] |
| Self-Aware | **1.0** | Unchanged, but **the justification is narrower than Scenario A's**. It rests only on demonstrated purchase behaviour — OnShift is long-term-care native and SmartLinx sells specifically into LTC and post-acute — and no longer on any regulatory pressure. | [research] |
| Lucrative | **$1k** | Carried over as an **assumption, and this is the weakest cell in the file.** Neither OnShift nor SmartLinx publishes pricing; both are quote-only, so there is no public evidence of the allocation either way. Nursing homes are thinner-margined than CAHs, which argues against a higher band, but nothing here is evidenced. | [assumption] |
| Liquid | **0.1** | Unchanged as a headline, with a **worse** nuance than Scenario A. A substantial share of US nursing homes are chain-affiliated, and a chain buys centrally — the same pattern that puts parent-system CAHs at 0.01. No credible aggregate ownership percentage was findable, so the drag is recorded as material and unquantified rather than guessed at. | [research] |
| Eager (identity) | **0.1** | Unchanged. The reference problem is identical and does not care which building the nurses work in. | [reasoning] |
| Eager (comparative) | **0.5** | Unchanged value, **weaker footing.** The differentiator still holds — an independent SNF has no more IT staff than a CAH — but the field is denser than CAH's: OnShift and SmartLinx are both LTC-native, where the CAH market is served by generalists. One countervailing signal worth chasing: SmartLinx markets to organisations of 150 to 5,000+ employees, well above a single independent nursing home, which hints the incumbents are built for chains and may under-serve independents. | [reasoning] |
| Enduring | **0.5** | Unchanged. Recurring problem, recurring revenue, no lock-in by choice. | [reasoning] |

```
15,400 × 1.0 × $1k × 0.1 × 0.1 × 0.5 × 0.5 = 38,500   ÷ 625,000 = 0.06
```

**0.06 — eleven times better than the national CAH market, and still an order of
magnitude short of viable.** It behaves exactly as the master-variable table
predicts: fix the reference problem and it reaches 0.31; move the budget to a
services band as well and it reaches **3.1, a scale-up**.

### What Scenario C settles

Three scenarios have now been scored across a 165× range of market size, and
**every one of them fails on the same two cells.** Market size was never the
lever; it was the thing that looked like the lever. Skilled nursing is worth
pursuing as the natural second market — same product, same thesis, eleven times
the buyers, and possibly a set of independents the LTC incumbents are too big to
serve — but it does not rescue the model on its own, and no market will.

**The company's viability turns on proving one number: that a facility will pay
roughly ten times the software line for someone to operate scheduling for
them.** Everything else in this file is either settled or fixable. That is not.

### Before this market is entered

- **The dossier is in better shape here than expected, and the gap is narrow.**
  An earlier draft of this section claimed neither incumbent had an entry; that
  was wrong and the file disproves it. **SmartLinx has a full section**
  (dossier line 788, Capterra ID 154002, refreshed 2026-08-16 in this session's
  Playwright pass). **OnShift** has no dedicated section but is researched: the
  maintenance log records its ownership resolved on 2026-08-06 — ShiftKey
  acquired it, invested 2022 with full integration in July 2023, cross-checked
  against shiftkey.com, Mergr and PitchBook — and we have a published
  `onshift-alternatives` post. The actual gap is one dedicated OnShift section.
  Worth noting as a genuine asset for this direction: our LTC-adjacent
  competitive coverage is already most of the way there.
- **Verify the independent-versus-chain split** with real CMS ownership data. It
  moves Liquid, and Liquid is one of the two cells that decides the score.
- **Test the SmartLinx under-serving hypothesis** rather than repeating it. It
  is currently one marketing page's stated employee range, which is a lead, not
  a finding.


| Liquid     | **0.1** | Founder: an annual decision. Consistent with SaaS renewal norms and with the Deputy 12-month commitment documented verbatim in the competitor dossier. Recorded nuance rather than averaged away: CAHs **affiliated with a parent health system are closer to 0.01**, because the parent signs an enterprise multi-year contract and the CAH is told the system is "already set up" — the pattern our UKG research documents. The 0.1 applies to independent CAHs. | [research] |

