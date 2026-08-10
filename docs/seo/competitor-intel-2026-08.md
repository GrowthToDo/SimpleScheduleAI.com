# Competitor Intelligence — August 2026

First full run of the competitor watch. What the modern nurse-scheduling vendors
are doing on SEO, which keywords they actually hold, how their positioning moved,
and what they charge (or refuse to publish).

- **Run date:** 2026-08-10
- **Sources:** DataForSEO Labs (`domain_rank_overview`, `ranked_keywords`) and
  Backlinks (`bulk_referring_domains`, `referring_domains`, `domain_pages_summary`,
  `domain_intersection`); live page fetches via `npm run competitor-watch`;
  sitemap deltas via `npm run sitemap-diff`.
- **Scope note:** this covers the *modern* cohort we actually collide with in AI
  answers and small-hospital shortlists. The enterprise incumbents (QGenda,
  symplr, UKG) are covered in the dossier and are not the subject here.
- **Priority (founder, 2026-08-10): In-House Health is the competitor to watch,
  not M7.** They are the more active one. Section 7 is the deep read; M7 stays on
  the watchlist for positioning moves, not as the benchmark.

---

## 1. The headline finding

**Nobody in the modern cohort has an organic content business.** M7 Health looks
like the strongest player by every vanity metric — 79 ranked keywords, 944
estimated monthly organic visits, 101 referring domains, $17M raised — and
essentially all of it is navigational traffic from one customer's nurses plus
links from job boards and VC firms. The non-brand SERP in our category is still
unclaimed by any of the AI-native vendors.

That is the strategic fact underneath everything below: we are not fighting for
share of an occupied space. We are the only one of this cohort building for
organic and AI-answer demand at all.

---

## 2. Organic footprint, side by side

| Domain | Ranked keywords | Est. organic visits/mo | Top-10 positions | New keywords |
| --- | --- | --- | --- | --- |
| m7health.com | 79 | 944 | 21 | 42 |
| youshift.com | 11 | 44 | 0 | 11 |
| **simplescheduleai.com** | **28** | **11** | **0** | **27** |

M7's 944 visits are not a content win. Their top 25 keywords by traffic value,
in order, are: `m7 health login`, `m7 ochsner`, `m7 ochsner login`, `m7 login`,
`m7 schedule`, `m7 health careers`, `m7 health ochsner`, `m7 scheduling app`,
`ochsner m7 health`, `m7 app`, `m7 health app`, `m7 login ochsner`,
`m7 health app download`, `m7 scheduling login`, `ochsner m7 health login`,
`ochweb`, `m7 company`, `m7 login employee`, `m7 app download`,
`m7 health login app`, `m7 scheduling sign in`, `st francis m7 health`,
`ochsner workday`, `m7 health app login`, `m7 health login app free`.

Twenty-four of twenty-five are branded, and most carry the customer's name.
This is Ochsner nurses finding the login page. Strip it out and M7 has almost no
organic demand capture. Their two non-brand entries (`ochweb` at position 15,
`ochsner workday` at position 34) are also Ochsner's, ranked accidentally.

**What this means for us.** Our 28 keywords with 8 sitting in positions 11-20 and
27 of them new is a younger but structurally different profile: non-brand, intent
carrying, and climbing. We should stop benchmarking against M7's headline traffic
number — it measures their sales success, not their search position.

---

## 3. Backlink reality

| Domain | Referring domains | Nofollow share |
| --- | --- | --- |
| onshift.com | 1,087 | 23% |
| qgenda.com | 1,060 | 32% |
| aladtec.com | 702 | 28% |
| nursegrid.com | 556 | 22% |
| smartlinx.com | 490 | 24% |
| shiftwizard.com | 262 | 27% |
| m7health.com | 101 | 21% |
| inhouse.health | 92 | 24% |
| youshift.com | 54 | 43% |
| shiftable.app | 19 | 79% |
| **simplescheduleai.com** | **4** | **50%** |

M7's 101 breaks down as: their ATS (breezy.hr, 23 links), job boards
(jobgether, startup.jobs, designjobs.careers, digital-health-jobs, bestpmjobs,
engineeringjobs.net, jobboardly), VC firms (lakehouse.vc, 25madison,
everywhere.vc, threshold.vc, january.ventures, heidiroizen.com), data
aggregators (Crunchbase, CB Insights, ZoomInfo, Growjo, healthtechalpha), and a
long tail of spam. Forty-seven of them point at the bare homepage. Their best
content page has one backlink.

Two links in that profile are worth noting: **ionl.org** (Illinois Organization
of Nurse Leaders) and **scionhealth.com** (a customer's own newsroom). Those are
the two link types that are actually earnable in this category — state nurse
leader associations and customer newsrooms — and both are already lanes in the
backlink plan (P1/P2 association outreach; customer PR, which we cannot use until
we have a customer).

Full link-gap analysis and the decision to downgrade competitor backlink mining
to a quarterly one-hour pass: see the T2.3 block in `backlink-plan-2026-07.md`.

---

## 4. Positioning moves

### M7 Health — category expansion and a move down-market

**Category label changed.** Previously "Nurse Scheduling and Labor Optimization
for Health Systems" (dossier, verified 2026-05-16). Now, verbatim from the
homepage on 2026-08-10:

> "The AI-powered workforce operations platform for healthcare"
> "Built for the realities of clinical staffing and scheduling"

That is a move off nurse-specific language and onto the same "workforce
operations / workforce management" ground QGenda and symplr already hold. It
widens their story and weakens their differentiation against the incumbents.

**Nav added an ROI Calculator and an Implementation page.** Both are
objection-handling assets, and both aim at the two objections that decide our
deals. The Impact Calculator's first question is **"How many beds do you have?"**
— bed count is now their sizing input — and it surfaces figures of $25,000,
$12,000 and $20,000. The Implementation page is the sharper one:

> "A Hands-On Rollout That Actually Works" — "Most hospitals are fully live in a
> few weeks", a four-week week-by-week plan (integration, unit setup, training,
> go-live), "Your IT team's role is minimal—mostly coordination and sign-off",
> "Pre-built integrations with most major systems".

They are answering "how long and how hard" head-on. Our answer to the same
question is structurally stronger — in service mode the hospital operates nothing
at all — but we should assume a buyer comparing us has read that page.

**The customer wall moved down-market.** Named logos now include Palestine
Regional, Ennis Regional, Cornerstone Round Rock, Georgetown, Carolina Pines,
Logan Regional, Sage West, Vaughan, Andalusia, Bolivar Medical Center,
Livingston, Bourbon Community, Clark Regional, Hillsboro, Beaver Valley, Milford
Memorial, Parkview Regional — small rural and community hospitals, several of
them in Texas, arriving through the Lifepoint and ScionHealth parent systems
alongside Ochsner and Kindred.

**Read this precisely.** They are reaching rural hospitals *through corporate
parents*, not selling to independent hospitals one at a time. Bed counts for
those facilities are not verified and most are almost certainly above the 25-bed
CAH ceiling. **Do not write that M7 now serves CAHs.** The dossier's standing
line still holds: no named standalone CAH customer or case study exists. What has
changed is that the rural-community-hospital claim now has a logo wall behind it,
where in May it had only positioning copy.

### In-House Health — the real content competitor

The one to watch. Positioning, verbatim:

> "Restore Sustainability to Nursing" / "AI-driven Scheduling and Management
> Platform for Modern Nursing Teams." — self-label "AI-driven Nurse Scheduling
> Platform"

Homepage leads with four numbers: **$270K cost savings per unit per year, 5.5
hours weekly time savings per user, 31% improvement in shifts at budget, 4 weeks
to implement.** No pricing. They run roughly 35 blog posts, real case studies
(`/case-studies/the-center-at-lowry`), a founder podcast circuit, and they have
expanded into skilled nursing (`/skilled-nursing`).

They already occupy topics we are publishing into — `great-clinical-scheduling-system`
and `the-black-hole-of-clinical-scheduling` sit directly against our just-published
`what-is-clinical-scheduling`, and `the-future-of-ai-agents-in-nurse-scheduling`
and `ai-driven-predictive-nurse-scheduling` sit against our pillar. They were
cited by Perplexity on two of our four money prompts in the citation autopsy.
Their dossier section has been updated with an August block covering all of this.

### YouShift — broadest claim, thinnest execution

> "The Operating System for Healthcare Workforce" / "AI-powered scheduling,
> staffing optimization, and workforce intelligence — all in one platform."

Aimed at "hospital systems and physician groups". Pricing withheld, stated as
"based on organizational size, number of clinicians, and deployment scope".
Technically they are the weakest site in the cohort: **no sitemap.xml and no
robots.txt at all** (both return the site's 404 page), 11 ranked keywords, and
they are the only competitor whose sitemap our radar cannot track.

---

## 5. Pricing

Nobody in the cohort publishes a price. M7, In-House Health and YouShift all
route every funnel to a demo form; `m7health.com/pricing` and
`inhouse.health/pricing` both 404. YouShift states its pricing model in an FAQ
without a number. The watcher now holds both 404s as **pricing sentinels** — the
day either URL returns a page, a competitor has published a price and we will see
it in the next run.

This is a standing advantage we already act on: our flat published price is a
differentiator precisely because the category treats price as a sales-gated
secret. It also means every price comparison we publish must stay sourced to what
a vendor actually states, never inferred.

---

## 6. What changes for us

1. **Stop benchmarking on M7's traffic number.** It measures Ochsner's nurse
   headcount, not their search position. The non-brand SERP is open.
2. **Treat In-House Health, not M7, as the content and AEO rival to track.** They
   have the largest content library in the cohort, real case studies, and LLM
   citations on our money prompts. Their dossier section now carries the August
   block; the topics where they already hold ground (clinical scheduling, AI
   agents in scheduling, float pools) need our versions to be better, not just
   present.
3. **The implementation objection is now contested.** M7 has a page-length answer
   to "how long and how hard". Our `/how-it-works` and service-mode story need to
   read as decisively as that page does, on the axis where we are genuinely
   different: they minimise the hospital's work, we remove it.
4. **Watch the bed-count framing.** M7's calculator now sizes by beds. If they
   publish a small-bed tier or a CAH case study, that is the moment their CAH
   claim stops being content-led. The watcher will catch the page; the dossier
   line must be updated the same day.
5. **Do not follow the category into "workforce operations".** M7 moving to that
   label vacates the nurse-specific ground they used to hold. Our positioning
   registry keeps us on the service language; this is a reason to hold it.

---

## 7. In-House Health, read closely (founder directive 2026-08-10: watch them, not M7)

They are the most active competitor in our space, so they get the deeper read.
The conclusion is counterintuitive and worth stating plainly: **their content is
worse than ours by every standard we have codified, it earns them almost nothing
in Google, and LLMs cite them anyway.**

### What their content actually earns

42 ranked keywords. Their **top organic page is `/baa`** — a Business Associate
Agreement legal page — ranking position 6 for `baa definition` (260/mo), plus
`baa abbreviation`, `what does baa stand for`, `baa law`, `baa legal term`. That
one accidental page is roughly two-thirds of their non-brand organic traffic.

Their ~35 blog posts earn essentially nothing. The best performer is
`/blog-post/the-shift-dilemma` at position 29 for `how long are nursing shifts`
(390/mo). Their homepage sits at position 50 for `healthcare staff scheduling
software` (1,000/mo), 23 for `scheduling software for nurses` (320/mo), 41 for
`hospital staffing software`, 39 for `healthcare workforce scheduling software`.
Everything else in their top-25 is the generic phrase "in house" and their own
brand, which they rank for because of the domain name.

### What their content looks like

Two representative posts, structure verified 2026-08-10:

| | `great-clinical-scheduling-system` | `the-future-of-ai-agents-in-nurse-scheduling` |
| --- | --- | --- |
| Length | ~450-500 words | ~1,200 words |
| H2s | 2 real ones | "The Challenge", "Why Current Systems Fail", "Enter the AI Agent", "The Vision", "Embracing the Future" |
| Opens with | rhetorical question | rhetorical question |
| Answer-first | no | no |
| Tables / FAQ | none | none |
| Sourced numbers | none | one (Indeed "Pulse of Healthcare 2025") |
| Named author | Ari Brenner | Dr. Beth Meyers |

Vague non-question headings, no answer-first openings, no tables, no FAQ blocks,
almost no sourced numbers. Our own posts beat this on every dimension in the
AEO standards.

### So why do LLMs cite them and not us?

Because citation is not being decided by page shape. It is being decided by how
well-attested the **entity** is across the rest of the web. They have Fierce
Healthcare and Businesswire coverage, an HLTH panel, three podcast appearances
(Nurse Converse, Nurse Rosa's Insights, The Beat), a named case study
(`/case-studies/the-center-at-lowry`), a founder who was a critical care nurse,
and 92 referring domains. We have four referring domains and no press.

This is the same conclusion the citation-shape autopsy reached from the other
direction — 7 of our 10 non-present cells are **distribution gaps** — and it now
has a control group. Improving our page shape further has diminishing returns.
Getting the entity attested does not.

### The three things worth copying

1. **The founder podcast circuit.** Three of their "blog posts" are podcast
   appearances. Nurse-audience podcasts book founders readily, it costs nothing
   but Pradeep's hour, and every appearance is a third-party page that names the
   company next to the category. This is the single most copyable item here and
   it belongs in the backlink plan as a founder-powered lane alongside HARO.
2. **An interview series with named external nurse leaders** ("Insightful Talks
   with...", "Tech Talks with..."). It produces firsthand voice we do not have,
   it builds a relationship with every interviewee, and it is the direct antidote
   to the commodity-content problem (our compliance post scored 14/100 on the
   proprietary-evidence framework). Every episode is also a person who might
   later give a quote, a review, or an introduction.
3. **Definitional pages punch far above their effort.** Their `/baa` page was
   never meant to rank and it out-earns their entire blog. We already have a
   glossary post type; building definitional pages deliberately for the terms
   adjacent to our category is cheap, ranks easily, and is exactly the shape LLMs
   lift as a standalone passage.

### What not to copy

Their publishing cadence and their content shape. Thirty-five posts producing
about two organic visits a month is not a model to follow. Volume is not what is
working for them; attestation is.

## 8. How this gets re-run

Monthly, as part of the 1st-of-month audit:

```
npm run sitemap-diff        # new/removed competitor URLs
npm run competitor-watch    # H1, title, meta, H2 set, CTA, price changes
```

Then the quarterly DataForSEO pass (one hour, timeboxed): `domain_rank_overview`
for each competitor plus ours, `ranked_keywords` for any competitor whose keyword
count moved more than 20%, and the T2.3 link-gap intersection.

Known coverage gaps in the automated pass, recorded so they are not rediscovered:
YouShift ships no sitemap; ShiftWizard serves a Webflow catch-all page at every
sitemap path; aladtec.com's robots.txt is Cloudflare-blocked (its homepage
fetches fine). Anything on those three needs a manual look.
