# Backlink Plan — July 2026 (low-hanging fruit first)

Source frame: 8 link-building tactics (borjafat thread, Jul 2026), translated to SSAI's
reality: pre-launch, ~zero existing backlinks (Bing link API: 0 known inbound,
2026-07-22), no affiliate program, founder-led. Doubly motivated by the AI-visibility
audit (2026-07-21): backlinks now also buy Common Crawl crawl priority (harmonic
centrality), i.e. AI-training-layer visibility, not just Google rank.

**Founder decisions (2026-07-22):** free-only placements (value-based quid pro quo OK,
never paid, never systematic link exchange) · HARO YES (~1-2h/wk, details below) ·
TORCH free channels only (no membership) · no DataForSEO top-up yet (free data sources
only) · outreach identity = pradeep@ (mailbox/alias must be created first — see
prerequisites).

**Guardrails (bind every pitch):** positioning-registry-verbatim product copy; no
pilot/customer/outcome claims; statistics only from facts-dossier with primary sources;
no fabricated anecdotes ever (HARO included); quid pro quo = contribute value (expert
quote, data, the free template) — never "link for link" (Google link-scheme policy);
YMYL-adjacent site = zero gray-hat tolerance. Log every ask/placement in
`backlink-ledger.md`.

---

## PRIORITY OVERRIDE — dofollow first (founder instruction 2026-08-01)

Founder: "for rest of the plan, focus on dofollow stuff more, prioritize it."
This section reorders the tiers below; it does not delete them. The plan's own
reality check already pointed here ("one TORCH/.edu/news link is worth fifty
directory scraps") — this makes it the operating order.

**Measured link types (2026-08-01, live pages inspected, not assumed):**

| Target | Link type | Basis |
| --- | --- | --- |
| SaaSHub | 1 dofollow (hero CTA) + 9 nofollow | our own live listing |
| ITQlick | nofollow | 5/5 external nofollow |
| TopBestAlternatives | nofollow | 3/3 external nofollow |
| Elion | nofollow (weak sample) | 429 rate-limit, 1 link seen |
| SoftwareWorld / TechnologyCounter | UNVERIFIED | 403 / JS-rendered |

Software directories are therefore an **entity + AI-retrieval play, not a ranking
play**. They stay in the plan, capped at one batched session, no paid tiers.

**Do in this order:**

1. **P1 — Association + .gov-adjacent resource pages (highest dofollow odds, best
   topical fit).** TORCH free surfaces, RHIhub "suggest a resource", NRHA, state
   Offices of Rural Health. These are .org/.edu-class editorial pages that almost
   always link followed, and our free ungated assets (Excel template + statistics
   page) are exactly what their resource lists carry. This is T1.2 promoted to the
   top of the plan.
2. **P2 — .edu nursing-school resource pages.** Same pitch, same assets. Highest
   per-link value available to us and reliably dofollow. Prospect nursing student /
   career resource pages and clinical-toolkit pages.
3. **P3 — Editorial placements (HARO / Qwoted / Featured / Help a B2B Writer).**
   Trade and news placements are usually followed and carry DR the directories
   cannot. Keep the existing weekly loop and the hard rules below. Triage bar:
   answer only nurse staffing / scheduling / rural hospital / CMS-FLSA / healthcare-AI
   / hospital-operations queries. Decline off-domain queries (a thin answer costs
   future standing) — see the ledger for the 2026-07-31 Qwoted learning-tech decline.
4. **P4 — Listicle-gap pitches (T1.3) and Moving Man (T2.2).** Editorial pages,
   normally followed, but lower hit-rate and more effort per link than P1-P3.
5. **P5 — Software directories (the six).** One batched session using the
   product-mode kit. Do not iterate, do not pay, do not chase.

## REJECTED TACTICS REGISTER (standing filter, opened 2026-08-10)

Tactics arrive faster than they can be evaluated from scratch. This is the
running list of what we have looked at and refused, with the reason, so the next
one takes thirty seconds instead of an hour and the answer stays consistent.

**The one filter that decides most cases:** judge a link by whether a real person
in our ICP could plausibly arrive through it. Referring-domain count is a vanity
number, and we have our own proof: the 2026-08-03 measurement found 338 referring
domains at 99.4% nofollow, nearly all directory syndication, with exactly two
genuinely followed domains. More of that changes nothing.

**Target-selection rule (added 2026-08-10).** The standard advice is to rank
prospect pages by referring domains. In this niche that selector is wrong, and
the T2.3 run below is the proof: the pages with link mass are funding
announcements and job boards, while the pages that actually decide a buyer's
shortlist have almost no links at all. Rank prospects by **how often an LLM
answer cites them on our money prompts** instead — that is measured on the
surface where our buyers ask the question. The citation-shape autopsy already
produces this list (perfectserve, withassured, medstafftracker, sanishift,
schedulingwiz, aviahealth, plus the G2/Capterra alternatives pages); it feeds
T1.3, not a link-reclamation play.

| Tactic | Source | Why rejected |
| --- | --- | --- |
| Inserting our links into Wikipedia by swapping dead citations | hridoyreh, Jul 2026 | Wikipedia external links have been nofollow since 2007, so there is no equity. Its dead-link policy requires replacing a dead citation with an ARCHIVED copy of the original, not a different site, so the edit itself breaks policy and reads as self-citation. For a healthcare vendor pitching hospital associations, being seen editing Wikipedia to promote itself is a reputational loss far bigger than any link. |
| Self-created Google properties (Google Sites, Google Docs, Blogger pages) linking back | hridoyreh, Jul 2026 | Self-created links, explicitly discounted by Google's link-spam policy. Inflates Ahrefs, moves nothing. |
| Posting in the Search Console community "acting like you know nothing" to drop a link | hridoyreh, Jul 2026 | Deliberate deception. Fails our own honesty standard before it fails Google's, and forum links are nofollow anyway. |
| Building a Chrome extension purely to earn a Web Store link | hridoyreh, Jul 2026 | No ICP fit. Hospital administrators do not install browser extensions to solve scheduling. |
| Automated reciprocal link-exchange networks (e.g. Distribb "Exchange Only") | borjafat, Aug 2026 | An automated link scheme; the source article itself concedes Google warns against exactly this. Violates our no-reciprocity guardrail. |
| Dropping our links into nursing communities (r/nursing and similar) | standing rule | Vendor links in threads about nurses' working conditions read as ambulance-chasing, and most subs remove vendor content. |
| Mass directory submission beyond one batched session | 2026-08-01 measurement | Measured: almost entirely nofollow. Kept as an entity and AI-retrieval signal only, capped, never iterated, never paid. |
| A second cheap-model CLI (Kimi K3 subagents) to run the "heavy digging" tier | borjafat "Last Word", Aug 2026 | A second vendor CLI and a second plaintext API key on a repo that has already leaked credentials once, to save tokens on work our own tier ladder already routes to a cheap model. The saving is real and the marginal value here is not. |
| Transcribing the top-10 YouTube videos as a content-gap input | borjafat "Last Word", Aug 2026 | Nurse-scheduling YouTube is thin and vendor-produced. Our 1-star review mining and Reddit passes already surface sharper unanswered questions for a fraction of the effort. |
| Multi-touch automated cold-email cadences to editorial and association contacts | borjafat "Last Word", Aug 2026 | Rural health in Texas is a small community and the founder sends personally. A three-touch automated sequence to association staff costs more relationship than any link it wins. One follow-up, written by hand, is the ceiling. |
| Retail AEO stack: product feeds, GTIN/SKU, Product/Offer/AggregateRating schema | alexgroberman / Microsoft AEO-GEO guide, Aug 2026 | Written for retailers with a catalog and shopping agents. We have no SKUs and no reviews to aggregate, and its schema-stacking emphasis runs against Part 0 (Google's May 2026 guidance: structured data is not required for AI features). |

**Adopted inversion from the Wikipedia thread:** do not put links INTO Wikipedia,
mine it. Articles on critical access hospitals, rural health, and nurse staffing
carry curated citation lists of primary sources (CMS, HRSA, AHA, state health
departments). Those are simultaneously facts for the dossier and organizations
whose resource pages are P1/P2 outreach targets. Same search, opposite direction,
entirely legitimate.

**Quotable-asset lane (added 2026-08-05, first asset: the Montefiore article).**
Newsroom analysis pieces are a different asset class from the template and the
statistics page: they state a sourced position on a live story, which is what
journalists and newsletters cite. The lane stays rank-and-wait at its core (no
cold outreach for links to news pieces), with exactly three sanctioned uses per
asset and two standing prohibitions:

- USE 1 — journalist queries (P3 amplifier): when a Qwoted/Connectively query
  touches the story the asset covers, answer on-spec as usual and close with the
  published analysis link. The asset upgrades the answer; it is not a substitute
  for answering the actual question.
- USE 2 — founder LinkedIn post, framed exactly as the article is framed
  (concerns legitimate, sorting rule, no product sell). Zero risk, free reach.
- USE 3 — at most ONE news-tip email per asset to a confirmed vendor-linking
  editorial outlet (HIStalk-class). Two lines, no ask beyond "may be useful".
  Optional soft share to a journalist who has already quoted the founder
  (relationship building, never a link request).
- NEVER: post the link into nursing/labor community threads (r/nursing etc.) —
  a vendor link in a thread about AI-driven layoffs reads as ambulance-chasing
  and violates most subs' vendor rules. NEVER pitch union or labor press on a
  story where we are an interested vendor.
- Downstream: citations or LLM pickups earned by an asset become credibility
  lines in later ASHHRA/HFMA-class editorial pitches. Log pickups in the ledger.

**Two housekeeping items that gate P1-P3 value:**
- Fix the SaaSHub URL so our one confirmed dofollow link stops pointing at the
  `noindex` `/product` page (re-verification pending as of 2026-08-01).
- Clear the Connectively/Featured profile verification (needs the SimpleScheduleAI
  Experience entry on the founder's public LinkedIn) — until it is verified, P3
  pitches carry less weight.

---

## Tier 0 — self-serve, free, no permission needed (~1 session)

**Baseline correction (GSC Links export, 2026-07-21):** Google already counts 5
referring domains — G2 (seller profile exists), Crunchbase (org page exists),
AlternativeTo (listing exists), one organic Reddit r/healthcare thread mention, and
growthtodo.com (founder-owned). Bing still reports 0 (its graph lags). So Tier 0
splits into audit-existing vs submit-new:

- [ ] **Audit + claim the 3 existing profiles** (G2 seller page, Crunchbase org,
      AlternativeTo listing): confirm ownership/claimed status, refresh copy to
      registry-verbatim positioning + flat pricing, add screenshots and the correct
      site links. Note honestly: review solicitation is POST-launch only (no
      customers = no reviews; never seed fake ones).
- [ ] **Submit the missing directories** — exactly the aggregators ChatGPT cites that
      we are NOT on: Capterra + GetApp + Software Advice (one Gartner Digital Markets
      intake covers all three) and F6S. Prep: submission kit (logo, 3-4 product
      screenshots from /product/simulator, registry-verbatim short + long
      descriptions, category "Medical Scheduling / Nurse Scheduling Software", flat
      pricing). Claude drafts kit -> founder approves -> submit. Free tiers only.
- [ ] **Reddit (carefully):** verify the existing r/healthcare mention's context (who
      posted, what it says) — it may be the exact thread ChatGPT cites for our head
      keyword. Standing rule stays: NO mass posting, no astroturf (memory: mass
      Reddit rejected). Permitted: founder participating authentically under his own
      flair where he has real expertise, at most occasionally. This item is monitor +
      understand, not a growth channel.
**Product-vs-service doctrine for directories (founder question, 2026-07-22):** most
of these platforms list software products only. We list legitimately as SOFTWARE per
the governance category line ("nurse scheduling software we build and operate
ourselves, delivered as a service"): category = software, operated-for-you = the
differentiating feature, never a category exit. Assets that satisfy product intakes:
the public no-signup simulator (= demo link), product screenshots, registry feature
list. PRICING RULE — SUPERSEDED 2026-08-01 by founder ruling; see
`outreach/tier0-submission-kit.md`. The rule is now the PITCH MODE, not the channel:
software directories are product-mode pitches and publish **$10 per user per month /
$100 per user per year**; anything pitched as a service (associations, RHIhub/TORCH,
editorial, HARO) keeps the flat **$1,000/$1,500 per facility** offer matching
/pricing. Never both models in one listing. (The prior rule mandated service pricing
everywhere on the price-contradiction argument; the founder's call is that the mode
we pitch in governs.) Fallback if an intake reviewer rejects the software framing:
use the platform's professional-services category if one exists, else skip — a
miscategorized listing is worse than none. G2 already accepted us; its audit includes
checking which category the existing profile sits in.

- [ ] **TORCH free surfaces**: resource-library submission (free template + statistics
      page), any free vendor/community listing. No membership purchase.
- [ ] **Unlinked-mention sweep** (tactic 8): Bing/Google/Brave queries for
      "SimpleScheduleAI" -site:simplescheduleai.com, founder name + product name.
      Any mention without a link -> polite attribution ask from pradeep@.
- [ ] **Baseline snapshot recorded in ledger**: GSC = 5 referring domains
      (2026-07-21 export, received); Bing = 0 (lags); CC referring-domains lookup
      (webgraph.metehan.ai Referring Domains checker) still pending.

## Tier 1 — asset-powered outreach, free (weeks 1-3)

- [ ] **T1.1 Statistics-page upgrade to journalist grade**
      (/rural-hospital-nurse-staffing-statistics): visible "Updated <date>" stamp,
      short quotable takeaway per section, every figure linked to primary source
      (NSI 2026, DSHS 2024 with 86-frame caveat, HRSA, RHIhub 91-CAH count), anchor
      ids per stat for deep-linking. This page is the ammo for HARO + all pitches.
- [ ] **T1.2 Template resource-page outreach**: prospect pages = "nurse scheduling
      resources", nurse-manager toolkits, nursing-school student/career resource pages
      (.edu gold), rural-health association resource lists (NRHA, state offices of
      rural health — free listings). Pitch: genuinely free, ungated Excel template;
      one-paragraph email from pradeep@; no reciprocity asked.
- [ ] **T1.3 Listicle-gap pitches** (tactic 1), free-only: targets already logged by
      our AEO snapshots as winning our citations — Connecteam "best nurse scheduling
      software", Shiftboard, SnapSchedule, HealthStream, Zoho roundup + any new ones
      each monthly snapshot surfaces. Pitch = the missing category ("operated-for-you
      scheduling for <=25-bed hospitals"), edit-ready blurb, screenshots. If they ask
      for payment: decline politely, offer value instead (founder expert quote for a
      future piece, or our data). Expect low hit-rate; cost is one email each.

## Tier 2 — ongoing engines (week 2 onward)

- [ ] **T2.1 HARO/journalist pipeline** (founder-powered; full playbook below).
- [ ] **T2.2 Moving Man** (tactic 7). CORRECTED 2026-07-25 after verifying the
      transitions and old-URL status (the earlier premise was partly wrong):
      - **Kronos -> UKG: STRONGEST.** kronos.com 301-redirects to ukg.com (brand
        renamed 2022). This is a brand-rename/"outdated info" play, not a hard 404:
        pages still saying "Kronos" for healthcare scheduling are outdated. Rich
        legacy link base. Replacements: `kronos-nurse-scheduling-problems-small-hospitals`,
        `ukg-alternatives-small-hospitals`, `ukg-too-complex-small-hospital`.
      - **Aladtec -> TCP: WEAK.** aladtec.com 308-redirects to a LIVE Aladtec-branded
        page on tcpsoftware.com — content preserved, links still resolve, so the
        "broken/moved" hook is thin. Only deep old aladtec.com URLs that now 404 are
        worth it. Replacements: `aladtec-alternatives`, `best-tcp-alternative-for-cah`.
      - **OnShift -> ~~Workday~~ ShiftKey: DROP.** The plan's "OnShift->Workday" was
        WRONG. OnShift was acquired by **ShiftKey** (2022, fully integrated 2023), and
        **onshift.com is still live (HTTP 200)** — no broken-URL opportunity. `onshift-alternatives`
        stays useful for other plays, just not Moving Man.
      Prospecting via Common Crawl web-graph + seo-backlinks agent (Moz free tier),
      free-first, small capped DataForSEO pull only if needed. Pitch: "the Kronos
      resource you reference is now UKG's enterprise suite; here is a current,
      independent comparison for small hospitals" — only where our page genuinely
      serves the link's purpose.
      **Pitch shape (upgraded 2026-08-10).** Name the exact article and the exact
      link, show the upgrade in one line, and make swapping a two-second decision.
      Before writing, pull the linked page's archived version to see what it looked
      like when it earned the link, and read the anchor text and the sentence around
      it — the link was given for one specific reason, and the pitch has to speak to
      that reason rather than to our page in general. One follow-up maximum, written
      by hand. We are handing someone a current version of something they already
      chose to link to, not asking them to admire a new post.
- [x] **T2.3 Competitor backlink reverse-engineering** (tactic 2): UNPARKED and
      RUN 2026-08-10 (DataForSEO topped up). The run answered the question and the
      answer downgrades the tactic. Findings, so nobody re-parks or re-runs it
      hoping for a different result:
      - **There is no editorial link club to break into.** M7 Health has 90
        referring main domains, and the profile is a hiring-and-fundraising
        artifact, not a content one: breezy.hr (their ATS, 23 links), jobgether,
        startup.jobs, designjobs.careers, digital-health-jobs, bestpmjobs,
        engineeringjobs.net + VC firms (lakehouse.vc, 25madison, everywhere.vc,
        threshold.vc, january.ventures, heidiroizen.com) + data aggregators
        (Crunchbase, CB Insights, ZoomInfo, Growjo, healthtechalpha). None of it
        is replicable by us and none of it is worth replicating.
      - **No competitor content page has earned links.** 47 of M7's referring
        domains point at the bare homepage. Their best-performing content page
        (`/resources/better-nurse-schedules-reduce-turnover`) has exactly ONE
        backlink, spam score 35. The "find the competitor page with 120 referring
        domains and beat it" premise does not exist in this niche.
      - **The link-gap intersection is mostly junk.** Domains linking to
        NurseGrid + ShiftWizard + SmartLinx but not us, top 30: two real names
        (aviahealth.com, technologycounter.com), three data aggregators
        (CB Insights, Growjo, Mergr), and 25 scraper/stat-spam/directory domains
        (worldmetrics.org, wifitalents.com, nerdisa.com, ebool.com and similar).
      - **Two genuine prospects came out of it**, both already reachable through
        existing lanes: **aviahealth.com** (also appears in our LLM citation
        autopsy for "QGenda alternatives" — so it is a listicle-gap target under
        T1.3, not a link-reclamation target) and **technologycounter.com** (a
        software directory, folds into the capped P5 batch).
      - **Standing rule: rerun at most quarterly, timeboxed to one hour.** Two
        usable prospects per run does not justify a monthly engine. The two
        .edu links pointing at M7's homepage are the only lead worth a second
        look next quarter (identify which universities and why).

- [ ] **T2.4 Founder podcast circuit** (added 2026-08-10, founder-powered, free).
      Copied from In-House Health, where it visibly works: three of their
      "blog posts" are podcast appearances (Nurse Converse — a Nurse.org property,
      Nurse Rosa's Insights, The Beat at HLTH), and their LLM citations trace to
      that kind of third-party attestation rather than to their page structure
      (their content is weaker than ours and ranks nowhere; see
      `competitor-intel-2026-08.md` §7). Nurse-audience and rural-health podcasts
      book founders readily. Each appearance is a third-party page that names the
      company next to the category, plus a show-notes link, plus a relationship.
      Cost is an hour of the founder's time per episode.
      - Pitch angle: the CAH scheduling reality (one manager, no scheduler, no IT),
        not the product. Same rule as the quotable-asset lane — the appearance
        earns the mention, we never ask for a link.
      - Targets to research on unpark: Nurse Converse (Nurse.org), Nurse Rosa's
        Insights, The Handoff, Rural Health Leadership Radio (directly on-ICP),
        HIStalk-adjacent health-IT shows.
      - Sequencing: this outranks further content-shape work. Our shape advantage
        is already real; the gap the autopsy measured is distribution.
- [ ] **T2.5 Nurse-leader interview series** (added 2026-08-10, founder-powered).
      Also copied from In-House Health ("Insightful Talks with…", "Tech Talks
      with…"). Named external nurse leaders, published as a recurring series.
      Solves three problems at once: it is the only realistic source of firsthand
      voice while we are pre-launch, it is the direct fix for the commodity-content
      score (our compliance post graded 14/100 on proprietary evidence), and every
      interviewee becomes a person who may later give a quote, a review, or an
      introduction. Founder-gated on cadence; a series that stops after two
      episodes is worse than none.

## Explicitly skipped

- Paid placements and paid directories (founder decision).
- Tactic 6 "editorial backlink network" (Distribb = the thread author's product;
  coordinated networks violate Google link-spam policy; unacceptable risk).
- Guest-post mills, mass cold templates, anything needing invented data.

---

## HARO playbook (the founder's Q2 answer)

**Setup (once, ~30 min):**
1. Create pradeep@simplescheduleai.com (prerequisite for all outreach).
2. Register free accounts: HARO (now at featured.com — Cision's Connectively
   shut down 2024-12-09; Featured.com acquired + revived HARO Apr 2025 as the
   free email digest; sign up "as an Expert"), Qwoted (qwoted.com, sign up "as a
   source"), Help a B2B Writer (helpab2bwriter.com, "sign up as a source").
   Profile bio (honest, verifiable): "Pradeep Pandey — co-founder of SimpleScheduleAI
   (AI-native nurse scheduling service for rural US hospitals) and Deputy General
   Manager of Operations at Apollo Hospitals; 7 years in hospital operations across
   19 hospitals / 2,000+ beds. MBA, IIM Trichy." Topics: nurse staffing/scheduling,
   hospital operations, rural healthcare, healthcare AI, burnout/retention.

**Weekly loop (target 1-2h total):**
1. Founder scans digests ~10 min/day for queries matching our topics; forwards
   promising ones (paste into session) — selection bar: we have REAL expertise or a
   dossier-sourced number for it, and the outlet is real.
2. Claude drafts the response same day: direct answer first, ONE specific insight,
   <=200 words, statistics-page link as supporting source, zero product pitch.
3. Founder edits into his own voice (mandatory — journalists smell ghost-writing),
   sends from pradeep@ before the deadline. Deadlines are hours, not days: same-day
   or skip.
4. Log every pitch + outcome in the ledger. Expect ~1 placement per 10-20 responses;
   the wins are DR60-90 news/trade links that also feed AI-citation surfaces.

**Hard rules:** never invent an anecdote, patient story, or number; India-based ops
experience is framed honestly (it is real and impressive); SSAI described only in the
bio line, not the quote body; decline queries outside real expertise.

---

## Prerequisites / open items
- [x] pradeep@ mailbox — EXISTS (founder confirmed 2026-07-22).
- [x] GSC Links export — received 2026-07-22 (5 referring domains).
- [ ] DataForSEO top-up whenever ready -> unparks T2.3 + richer Moving-Man data + AEO snapshots.

## Measurement (monthly, alongside the AEO snapshot)
- Bing link API counts (free; baseline 0 on 2026-07-22).
- CC web-graph referring domains + (post-unblock) CC index presence.
- Ledger: asks sent / placements won / links live, by tier.
- Reality check: pre-launch, the goal is 10-20 real, relevant links in 90 days, not
  volume. One TORCH/.edu/news link is worth fifty directory scraps.
