# Inbound-link recipe — Jul 2026 batch

## One-command publish (automated)

On the day you publish a post, run:

```
node scripts/publish-post.mjs <slug> --go --push
```

This does the whole atomic publish: inserts the 2 inbound links into live siblings, flips
`draft: false`, prettiers, runs the gate and sets every judgment row (proofread / factCheck /
image-eyeball / founder-approval), adds the keyword-registry entry, commits, pushes, and submits
IndexNow. After it finishes, submit the GSC sitemap (one MCP call) and confirm the live URL returns
200. Dry run first without the flags (`node scripts/publish-post.mjs <slug>`) to preview + auto-revert.

Slugs: how-to-choose-nurse-scheduling-software, cost-of-losing-a-nurse-rural-hospital,
is-ai-nurse-scheduling-safe, how-ai-builds-a-nurse-schedule, nurse-staffing-texas-2026,
8-hour-vs-12-hour-nursing-shifts, nurse-to-patient-ratios-by-state, free-nurse-schedule-templates.

The manual per-post reference below is the fallback if you ever want to place a link by hand.

---

# Manual reference

**Why a recipe, not pre-wired edits:** draft posts are not built (`src/utils/blog.ts:109` filters `!post.draft`), so a live sibling linking to a still-draft post would 404. Each post's 2 inbound links must be added **in the same commit as its `draft:false` flip** (the rural-texas pattern). The `publish-gate` `inboundLinks` row needs ≥2 live siblings pointing at the post, so these are required before each flip will pass.

For each post below: when publishing it, add the two in-prose links to the named live siblings (natural anchor, existing sentence extended), then flip + gate + commit + push together.

---

### how-to-choose-nurse-scheduling-software

- `best-nurse-scheduling-software-2026.md` — near its evaluation/"how to choose" framing: "Before comparing specific products, work the decision framework first: our [7-point checklist for choosing nurse scheduling software](/blog/how-to-choose-nurse-scheduling-software) covers the questions that decide whether a tool gets used."
- `nurse-scheduling-software-small-hospital.md` — near the buying-decision discussion: "...see the [7-point checklist for how to choose nurse scheduling software](/blog/how-to-choose-nurse-scheduling-software)."

### cost-of-losing-a-nurse-rural-hospital

- `nurse-burnout-scheduling-cah.md` — near the turnover/retention discussion: "...and for the dollar figure, see [the real cost of losing one nurse at a rural hospital](/blog/cost-of-losing-a-nurse-rural-hospital)."
- `healthcare-staffing-software-small-hospitals.md` — near a cost/turnover mention: "...the [real cost of losing one nurse](/blog/cost-of-losing-a-nurse-rural-hospital) puts a sourced number on it."

### is-ai-nurse-scheduling-safe

- `can-nurses-trust-ai-generated-schedule.md` — near the trust/oversight discussion: "...for the oversight, accuracy, and CMS angle, see [is AI nurse scheduling safe](/blog/is-ai-nurse-scheduling-safe)."
- `ai-nurse-scheduling-vs-traditional.md` — near a safety/accuracy point: "...[is AI nurse scheduling safe](/blog/is-ai-nurse-scheduling-safe) answers the oversight question directly."

### how-ai-builds-a-nurse-schedule

- `can-nurses-trust-ai-generated-schedule.md` — near a "how it works" mention: "...for the step-by-step mechanics, see [how AI actually builds a nurse schedule](/blog/how-ai-builds-a-nurse-schedule)."
- `what-automated-nurse-scheduling-actually-means.md` — near the automation explanation: "...[how AI actually builds a nurse schedule](/blog/how-ai-builds-a-nurse-schedule) walks the pipeline in plain English."

### nurse-staffing-texas-2026

- `rural-texas-hospital-nurse-scheduling-2026.md` — near a staffing-numbers reference: "...for the 2026 staffing figures behind that picture, see [nurse staffing in Texas: the 2026 numbers](/blog/nurse-staffing-texas-2026)."
- `best-nurse-scheduling-software-texas.md` — near the Texas-market framing: "...the [2026 Texas nurse staffing numbers](/blog/nurse-staffing-texas-2026) show why."

### 8-hour-vs-12-hour-nursing-shifts

- `12-hour-hospital-shifts-scheduling.md` — near the shift-length discussion: "...weighing 8s against 12s? See [8-hour vs 12-hour nursing shifts for a 25-bed hospital](/blog/8-hour-vs-12-hour-nursing-shifts)."
- `night-shift-nurse-schedule-coverage.md` — near a shift-pattern mention: "...[8-hour vs 12-hour nursing shifts](/blog/8-hour-vs-12-hour-nursing-shifts) works the tradeoff for a thin roster."

### nurse-to-patient-ratios-by-state

- `nurse-staffing-ratios-critical-access-hospital.md` — near the ratio discussion: "...for the state-by-state legal picture of which states mandate ratios, see [nurse-to-patient ratios by state](/blog/nurse-to-patient-ratios-by-state)."
- `texas-nursing-overtime-compliance-cah.md` — near a Texas-rules mention: "...and [nurse-to-patient ratios by state](/blog/nurse-to-patient-ratios-by-state) shows Texas sets no fixed ratio at all."

### free-nurse-schedule-templates

- `nurse-scheduling-software-small-hospital.md` — near a "getting started" point: "...many small hospitals start from a [free nurse schedule template](/blog/free-nurse-schedule-templates) before moving to software."
- `best-scheduling-software-25-bed-hospital.md` — near a low-cost-option mention: "...if budget is the constraint, [free nurse schedule templates](/blog/free-nurse-schedule-templates) are the honest starting point."

---

All source siblings verified live (`draft:false`) on 2026-07-18. Cross-links among the new posts can be added once both endpoints are live.
