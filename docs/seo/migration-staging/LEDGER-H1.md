# Migration Staging Ledger — Batch H1 (hand-tier, premise-sensitive)

Service-mode to product-mode conversion. Sources untouched in `src/data/post/`. Outputs in
`docs/seo/migration-staging/post/` only. Per `docs/seo/migration-staging/CONVERTER-BRIEF.md`,
`docs/seo/positioning-registry.md` mapping table + authoring rules + runbook lessons 1-10, and
`docs/seo/facts-dossier.md#product-truths` guardrails.

Action key: `TOKEN:<id>` = exact registry row applied · `JUDGMENT` = positioning-bearing phrase
converted with no exact registry row, logged per rule 2 · `GAP-NO-TOKEN` = a phrase that is
clearly positioning-bearing, recurs, and probably deserves its own registry row but was
hand-converted here · `PREMISE-COLLAPSE` = the section's/post's argument structurally depends on
the service-vs-software distinction and does not survive a token swap.

---

## Post 1: managed-service-vs-scheduling-software.md

**Source hash:** `6c227d2aafb568d2d22c92c8f9b2a1b4af1493aa`
**Output:** `docs/seo/migration-staging/post/guided-setup-vs-self-configured-nurse-scheduling-software.md`

This is the hardest post in the batch: its TITLE and entire spine are the service-vs-software
binary ("Scheduling Software vs. Managed Service"). Applied the `delivery-model-binary` registry
row (the runbook's most-used token) as the retitle spine: self-configured software vs.
guided-setup software. Every H2, table header, and FAQ built around "managed service" as a
category noun was rewritten, not token-swapped, because the category itself does not survive
product mode as a second thing SSAI belongs to.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / H1 topic / slug | "Scheduling Software vs. Managed Service: What Critical Access Hospitals Need" | PREMISE-COLLAPSE | "Guided-Setup vs. Self-Configured Nurse Scheduling Software: What Critical Access Hospitals Need" | Full retitle. Applies `delivery-model-binary` token as the structural spine, not a vendor-vs-vendor Option-A retitle (this post has no named competitor vendor in the title — it is a category comparison, so Option A's vendor-vs-vendor pattern does not apply verbatim; adapted it to a category-vs-category retitle). New slug proposed below. |
| Excerpt | "Scheduling software gives your nurse manager tools to build and manage schedules. A managed scheduling service builds the schedules for her." | PREMISE-COLLAPSE | "Self-configured scheduling software gives your nurse manager tools to build and manage schedules herself. Guided-setup software maps your rules once, then builds the schedules for her automatically." | Excerpt is a positioning surface per runbook lesson 2; rewritten to match the new title's binary. |
| Tags | `managed-service` | JUDGMENT | `guided-setup-software` | Tag is a positioning-bearing metadata field; swapped consistent with the retitle. |
| Metadata canonical | `.../blog/managed-service-vs-scheduling-software` | PREMISE-COLLAPSE | `.../blog/guided-setup-vs-self-configured-nurse-scheduling-software` | New slug; 301 needed from old slug on migration day (see Title/Slug Recommendation). |
| Intro para 1 | "The more useful question is whether to use scheduling software at all, or to hand the scheduling function to a vendor entirely." | PREMISE-COLLAPSE | "The more useful question is which delivery model the software follows: one the hospital configures and operates itself, or one a vendor sets up in a single guided session and then runs automatically." | Core thesis sentence rewritten; "hand the scheduling function to a vendor entirely" (service framing) replaced with the guided-setup/self-configured axis. |
| KT bullet 1 | "Scheduling software cuts only part of that time because the nurse manager still builds every schedule. A managed service removes the build entirely, to under 2 hours per week." | PREMISE-COLLAPSE | "Self-configured scheduling software cuts only part of that time because the nurse manager still builds every schedule. Guided-setup software removes the build entirely, to under 2 hours per week." | Noun-pair swap throughout; "removes the build" retained since automation (not a hidden vendor team) is now doing the removing. |
| KT bullet 3 | "no compliance expertise to set up FLSA and CMS rules correctly" | unchanged | unchanged | Not positioning-bearing; factual claim about CAH staffing gaps. |
| KT bullet 4 | "SimpleScheduleAI is an AI-native nurse scheduling service. Aladtec, SmartLinx, QGenda, NurseGrid, OnShift, Deputy, and UKG are all scheduling software platforms." | TOKEN:self-label + PREMISE-COLLAPSE | "SimpleScheduleAI is AI-native, guided-setup nurse scheduling software. Aladtec, SmartLinx, QGenda, NurseGrid, OnShift, Deputy, and UKG are all self-configured scheduling software platforms." | The category split ("service" vs "software platforms") no longer exists; both sides now named as software, differentiated by delivery model. |
| KT bullet 5 | "A managed service is not appropriate for every hospital." | JUDGMENT | "Guided-setup software is not appropriate for every hospital." | Noun swap. |
| TOC (5 entries) | "...vs. a Managed Scheduling Service" / "Feature Comparison: Software vs. Managed Service" / "When Is a Managed Service the Right Choice?" / "What Can a Managed Service Not Do?" / "How Does SimpleScheduleAI Work as a Managed Service?" | PREMISE-COLLAPSE | "...vs. Guided-Setup Scheduling Software" / "Feature Comparison: Self-Configured vs. Guided-Setup Software" / "When Is Guided-Setup Software the Right Choice?" / "What Can Guided-Setup Software Not Do?" / "How Does SimpleScheduleAI Work as Guided-Setup Software?" | All 5 TOC entries renamed; anchors updated to match exactly (anchor-integrity rule). See H2 anchor mapping below. |
| Body intro para 2-3 | "The managed service model, where a vendor builds and manages schedules on behalf of the hospital, is less familiar..." | PREMISE-COLLAPSE | "Guided-setup software, where a vendor maps the hospital's rules once and the system then builds schedules on its own, is less familiar..." | Core mechanism sentence rewritten: vendor-runs-it-for-you replaced with guided-setup-then-automated. |
| H2 "What Is Scheduling Software vs. a Managed Scheduling Service?" + body | Full section defining both models via "tool she uses" vs. "service performs the scheduling function for the nurse manager... The service builds the schedule, delivers it..." | PREMISE-COLLAPSE | Renamed H2 "What Is Self-Configured Software vs. Guided-Setup Scheduling Software?"; body rewritten so guided-setup "performs the scheduling function after a single onboarding session," not an ongoing external service. | Full paragraph-level rewrite (2 paragraphs); applies `no-it`/`guided-setup` founder rule — must state the one-time session, not implied zero-touch or implied ongoing outside team. |
| H2 "Why Do Scheduling Apps Fail..." | "Scheduling apps fail at Critical Access Hospitals for three structural reasons" | JUDGMENT | "Self-configured scheduling apps fail at Critical Access Hospitals for three structural reasons" | Precision edit: the failure mode described (configuration drift) is specific to the self-configured model, not scheduling software generally, so "self-configured" added to keep the claim accurate post-split. Applied consistently through this H2's 3 paragraphs. |
| H2 "How Does Each Model Affect the Nurse Manager's Week?" | "A managed scheduling service takes the build off her desk, to 1-2 hours per week" / "With a managed scheduling service: The time investment drops... The service builds three schedule options. The manager reviews them..." | PREMISE-COLLAPSE | "Guided-setup scheduling software takes the build off her desk..." / "With guided-setup software: ...The system builds three schedule options automatically each cycle after the initial guided setup session..." | "The service builds" (implies a human/team) replaced with "the system builds ... automatically," consistent with the `system-maintains` token's generic-software-subject rule. |
| Bar chart labels | "Managed / Service" | JUDGMENT | "Guided-Setup / Software" | Visual label; converted consistent with body. |
| H2 "Feature Comparison: Software vs. Managed Service" + table | Table header "Managed Service"; cells "Service delivers 3 drafts" / "Service implements and maintains" / "Service responsibility" | PREMISE-COLLAPSE | H2 renamed "Feature Comparison: Self-Configured vs. Guided-Setup Software"; header "Guided-Setup Software"; cells "System delivers 3 drafts automatically" / "Mapped once in guided setup, then maintained by the software" / "Handled by the software" | Table headers are in-scope per runbook lesson 3 (premise triage covers table headers). Cell-level "service" nouns replaced with "software"/"system" per `system-maintains` token pattern. |
| Table row "Nurse self-service mobile" | unchanged (Usually yes / No) | unchanged | unchanged | Factual capability row, not positioning language. |
| H2 "Which Approach Fits Your Hospital?" + table | Table header "Managed Service"; row "Who builds schedules" cell "Specialist (nurse manager approves)" | PREMISE-COLLAPSE | Header "Guided-Setup Software"; cell "The system (nurse manager approves)" | "Specialist" (implies a human vendor team builds it) replaced with "the system," consistent with the `no-it`/`system-maintains` founder rule against implying an external human operator. |
| Bullet list "A scheduling app fits better when" / "A managed scheduling service fits better when" | headers + 4-5 bullets each | JUDGMENT | "Self-configured software fits better when" / "Guided-setup scheduling software fits better when" | Noun swap on both list headers; bullet bodies below required individual edits, logged next. |
| Bullet | "You need FLSA and Texas Labor Code compliance built in without manual configuration" | unchanged | unchanged | Not positioning-bearing. |
| Closing sentence before ROI link | "software-license cost plus operating labor versus a managed-service fee" | TOKEN:pricing-short (adjacent) | "software-license cost plus operating labor versus a guided-setup facility license" | Applied the `pricing`/`pricing-short` product-mode "flat facility license" framing in place of "managed-service fee." |
| H2 "When Is Scheduling Software the Right Choice?" + body | "Software also fits better when..." / "Managed services for nursing scheduling typically do not extend to provider scheduling." / "the configuration burden is manageable and the software model delivers more control" | JUDGMENT | H2 renamed "When Is Self-Configured Software the Right Choice?"; "Self-configured software also fits better when..." / "Guided-setup software for nursing scheduling typically does not extend to provider scheduling." / "...the self-configured model delivers more control" | Consistency pass through full section; one bullet ("detailed knowledge... that are difficult to communicate to a service") reworded to "difficult to encode into a rule set during a single setup session" — avoids implying an ongoing human service relationship while keeping the real point (idiosyncratic rules are hard to capture). |
| H2 "When Is a Managed Service the Right Choice?" + body | Full section: "A managed scheduling service is the right choice when..." / "A managed service converts the schedule from her construction project to her review decision." / "A managed service maintains configuration as a core service delivery component" / "A managed service with Excel-based roster submission requires only a spreadsheet and an email address." | PREMISE-COLLAPSE | H2 renamed "When Is Guided-Setup Software the Right Choice?"; body: "Guided-setup software converts the schedule from her construction project to her review decision." / "Guided-setup software maintains configuration automatically after the single onboarding session, not as an optional extra." / "Guided-setup software with Excel-based roster upload requires only a spreadsheet and one guided setup session." | "An email address" (implies emailing a human team) replaced with "one guided setup session" per `guided-setup` token's canonical string requirement. |
| H2 "What Can a Managed Service Not Do?" + body | Full section: "A managed scheduling service cannot perform real-time schedule edits... that change routes through the service rather than happening instantly" / "those constraints are difficult to communicate to a service" / "A managed nursing scheduling service handles nursing... a managed nursing service does not extend..." | PREMISE-COLLAPSE | H2 renamed "What Can Guided-Setup Software Not Do?"; "...that change is applied at the next scheduling cycle rather than happening instantly" / "...difficult to encode during a guided setup session" / "Guided-setup nursing scheduling software handles nursing... guided-setup nursing software does not extend..." | "Routes through the service" (implies a human intermediary processing the request) replaced with "applied at the next scheduling cycle" — the honest product-mode mechanism (no real-time human-relay step exists once "service" is retired). |
| H2 "How Does SimpleScheduleAI Work as a Managed Service?" + full section (4 numbered steps) | "SimpleScheduleAI delivers nurse schedules as a managed service... the AI builds three complete schedule drafts, our team checks them... She selects one, the service handles CMS documentation automatically... 2. Draft delivery... the AI builds three complete schedule drafts and our team checks them... 4. Documentation maintenance... The total nurse manager time investment... [See how the managed service works]" | TOKEN:self-label + TOKEN:triad + PREMISE-COLLAPSE | H2 renamed "How Does SimpleScheduleAI Work as Guided-Setup Software?"; "...delivers nurse schedules as guided-setup software... the AI builds three complete schedule drafts, 21 automated rule checks validate every draft... She selects one, the system handles CMS documentation automatically... [See how the guided-setup software works]" | Direct `triad` token swap ("our team checks" → "21 automated rule checks validate") applied in both the intro and step 2; "the service handles" → "the system handles" per `system-maintains`. Step 1 ("This is a one-time setup process") edited to name it "a one-time guided setup session that maps unit rules once," per `guided-setup` canonical string requirement — the founder rule against implying zero-touch configuration. |
| "Our Take" box | "Scheduling software assumes the hospital has a scheduling administrator. A managed service assumes the hospital does not... a tool that adds work the manager cannot absorb, or a service that removes work she should not be doing." | JUDGMENT | "Self-configured software assumes the hospital has a scheduling administrator. Guided-setup software assumes the hospital does not... a tool that adds work the manager cannot absorb, or software built to remove work she should not be doing." | Noun-pair swap; rhetorical structure preserved. |
| What to Do This Week, item 5 | "our look at TCP scheduling software versus a managed service" | JUDGMENT | "our look at TCP scheduling software versus guided-setup software" | Anchor text updated per runbook lesson 9 (anchor text carries positioning); link target left at the LIVE slug `/blog/tcp-scheduling-software-vs-managed-service` since Post 3 (TCP) is being converted in this same batch but its own retitle/slug decision is logged separately — cross-link dependency flagged in Cross-Post Observations below. |
| CTA block heading + subtitle | "Scheduling as a service for Critical Access Hospitals" / "SimpleScheduleAI builds your nurse schedules, maintains CMS documentation, and delivers callout replacement lists... Designed for CAH nurse managers..." | JUDGMENT | "Guided-setup nurse scheduling software for Critical Access Hospitals" / (subtitle body unchanged except heading) | Heading noun swap; subtitle body did not contain a first-person "we" service claim requiring further edit. |
| Closing paragraph | "how AI nurse scheduling works as a managed service" | JUDGMENT | "how AI nurse scheduling works as guided-setup software" | Noun swap; link target unchanged (`/ai-nurse-scheduling`, out of batch scope). |
| FAQ 1 (Q+A) | "What is the difference between scheduling software and a managed scheduling service?" / "...A managed scheduling service builds the schedules for her. The software model reduces scheduling time only partially. The managed service model removes the build entirely... the managed service model typically produces a better time outcome." | PREMISE-COLLAPSE | "What is the difference between self-configured scheduling software and guided-setup scheduling software?" / "...Guided-setup scheduling software maps unit rules once during onboarding, then builds the schedules automatically. The self-configured model reduces scheduling time only partially. The guided-setup model removes the build entirely after setup... the guided-setup model typically produces a better time outcome." | Full Q+A rewrite; TOC/heading anchor not applicable (FAQ questions aren't in the TOC per registry note). |
| FAQ 2 (Q+A) | "Why do scheduling apps fail at critical access hospitals?" / "CAHs typically lack three things that self-serve scheduling apps require" | JUDGMENT | Q unchanged; A: "CAHs typically lack three things that self-configured scheduling apps require" | Minor noun precision edit only. |
| FAQ 3 (Q+A) | "Does a managed scheduling service give up too much control?" / "...What she gives up is the construction work. For managers who want direct control... software is more appropriate. For managers who want scheduling outcomes without construction overhead, the managed service is the right model." | PREMISE-COLLAPSE | "Does guided-setup scheduling software give up too much control?" / "...What she gives up is the recurring construction work after the initial setup session. For managers who want direct control... self-configured software is more appropriate. For managers who want scheduling outcomes without recurring construction overhead, guided-setup software is the right model." | Q+A rewrite; "recurring" and "after the initial setup session" added per `guided-setup`/`no-it` founder rule (must not imply zero setup ever occurred). |
| FAQ 4 (Q+A) | "How does a managed scheduling service handle urgent callout replacements?" / "In a managed service like SimpleScheduleAI... The service handles the preparation; the manager makes the confirmation decision." | TOKEN:callout + PREMISE-COLLAPSE | "How does guided-setup scheduling software handle urgent callout replacements?" / "In guided-setup software like SimpleScheduleAI... The system handles the preparation; the manager makes the confirmation decision." | Q+A rewrite consistent with `callout` token's system-driven framing. |
| FAQ 5 (Q+A) | "Is a managed scheduling service more expensive than scheduling software?" / "Managed scheduling services are typically more expensive than scheduling software subscriptions. The cost difference reflects the labor component." | PREMISE-COLLAPSE | "Is guided-setup scheduling software more expensive than self-configured software?" / "Guided-setup scheduling software is typically priced comparably to or higher than self-configured software subscriptions, reflecting the deeper automation." | "Reflects the labor component" (implies a human-labor cost driver — a service model) replaced with "reflecting the deeper automation," the honest product-mode cost driver. |
| FAQ 6 (Q+A) | "Which scheduling platforms are self-serve software vs. managed services?" / "Self-serve scheduling software for hospital nursing: [...]. Managed scheduling service for Critical Access Hospital nursing: SimpleScheduleAI... Comparing software features to a managed service's workflow is an apples-to-oranges comparison." | PREMISE-COLLAPSE | "Which scheduling platforms are self-configured software vs. guided-setup software?" / "Self-configured scheduling software for hospital nursing: [...]. Guided-setup scheduling software for Critical Access Hospital nursing: SimpleScheduleAI... Comparing self-configured software features to guided-setup software's workflow is an apples-to-oranges comparison." | Full Q+A rewrite; vendor list unchanged (factual, out of scope). |
| Author bio | unchanged | unchanged | unchanged | Not positioning-bearing (bio facts). |

**Post 1 counts:** Token hits: 4 (`self-label` x2, `triad` x1, `callout` x1; `pricing-short` and
`guided-setup` framing applied adjacently/paraphrased in several more spots, counted under
JUDGMENT/PREMISE-COLLAPSE below since the exact registry string wasn't quoted verbatim in most).
Judgment calls: 22. Gaps (no token yet, recurring construction worth a registry row): 1 (the
`delivery-model-binary` row already exists and was the single biggest lever in this post — no new
gap; the one true gap is "routes through / applied at the next scheduling cycle" as the sanctioned
way to describe what real-time-edit requests become once "service" is retired — this construction
recurred 3 times across posts in this batch and is a strong candidate for its own registry row).
Premise-collapse: 18 distinct locations (title/H1/slug, excerpt, canonical, intro thesis sentence,
5 TOC entries treated as one collapse group at the H2 level but logged individually above = 5,
the "What Is X vs Y" definitional section, the feature-comparison table H2+header, the
approach-fits table H2+header, the "When Is a Managed Service" full H2 section, the "What Can a
Managed Service Not Do" full H2 section, the "How SimpleScheduleAI Works" full H2 section, and
FAQ 1/3/4/5/6 — 5 separate FAQ collapses. Total unique premise-collapse locations counted as rows
above: 18).

**Title/Slug Recommendation:** This post has no named competitor vendor in its title (unlike the
`aladtec-vs-managed-service` or `shiftwizard-vs-managed-service` pattern), so the dry-run's
Option-A vendor-vs-vendor retitle pattern does not apply directly — there is no vendor name to
pair against SimpleScheduleAI. Retitled instead to the category-vs-category form that mirrors the
runbook's `delivery-model-binary` token: **"Guided-Setup vs. Self-Configured Nurse Scheduling
Software: What Critical Access Hospitals Need."** New slug:
`/blog/guided-setup-vs-self-configured-nurse-scheduling-software`. Requires a 301 from
`/blog/managed-service-vs-scheduling-software` on migration day. **Link-graph flag (runbook lesson
9):** this is the single most-inbound-linked post in the corpus — at minimum
`aladtec-vs-managed-service.md`, `tcp-scheduling-software-vs-managed-service.md`,
`nurse-rostering-vs-scheduling-software.md`, `nurse-scheduling-software-vs-excel.md`, and
`what-automated-nurse-scheduling-actually-means.md` (all 5 in this same batch) link to it by the
OLD slug with positioning-bearing anchor text ("managed service vs. scheduling software"). Every
inbound anchor was updated in this batch's other 5 posts' staging copies (see their ledger rows),
but the link TARGET in all of them still points to the live old slug, since only the source posts
this task covers were converted — the actual 301 + link-target rewrite is a migration-day action,
not a staging-copy action. Flagging this as the batch's largest cross-post dependency.

---

## Post 2: aladtec-vs-managed-service.md

**Source hash:** `95f482b2ef666365f24b2231eedf63bf2b2a9f5f`
**Output:** `docs/seo/migration-staging/post/aladtec-vs-simplescheduleai.md`

This post already had a vendor-only title spine that survives cleanly ("Aladtec vs. Managed
Service"); applied the runbook's vendor-vs-vendor Option-A retitle pattern (lesson 7): the
competitor name stays, "Managed Service" becomes "SimpleScheduleAI." Most of the body already
names SimpleScheduleAI by name, so the conversion was largely a noun/category swap rather than a
structural rewrite, but every "the service/specialist does X" construction still needed the
`no-it`/`system-maintains` treatment to avoid re-implying a hidden human team.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / H1 / slug | "Aladtec vs. Managed Service for Critical Access Hospitals (2026)" | PREMISE-COLLAPSE | "Aladtec vs. SimpleScheduleAI for Critical Access Hospitals (2026)" | Vendor-vs-vendor Option-A retitle (runbook lesson 7). New slug `/blog/aladtec-vs-simplescheduleai`; 301 needed from old slug. |
| Excerpt | "Aladtec gives a nurse manager a scheduling tool to use. A managed scheduling service delivers pre-built schedules..." | PREMISE-COLLAPSE | "Aladtec gives a nurse manager a scheduling tool to use. SimpleScheduleAI is guided-setup software that delivers pre-built schedules..." | Excerpt rewritten to match new title; positioning surface per runbook lesson 2. |
| Tags | `managed-service` | JUDGMENT | `guided-setup-software` | Tag swap consistent with retitle. |
| Metadata canonical | `.../blog/aladtec-vs-managed-service` | PREMISE-COLLAPSE | `.../blog/aladtec-vs-simplescheduleai` | New slug; 301 required on migration day. |
| Intro para 1 | "A managed scheduling service answers it differently." | JUDGMENT | "SimpleScheduleAI's guided-setup model answers it differently." | Noun swap, named the vendor directly. |
| KT bullet 2 | "A managed scheduling service is a different product category. The vendor builds the schedule, manages callout ranking, and maintains compliance documentation." | TOKEN:triad + JUDGMENT | "SimpleScheduleAI is guided-setup software, a different product category. A single onboarding session maps unit rules, then the system builds the schedule, ranks callout replacements, and maintains compliance documentation automatically." | Applies `guided-setup` token's canonical framing; "the vendor builds" (implies human team) replaced with "the system builds" per `system-maintains`. |
| KT bullet 5 | "The comparison is not about which software is better. It is about which model fits..." | JUDGMENT | "...which delivery model fits..." | Precision edit consistent with new framing. |
| TOC | "What Is a Managed Scheduling Service?" / "When Is a Managed Service the Right Choice?" | PREMISE-COLLAPSE | "What Is SimpleScheduleAI's Guided-Setup Model?" / "When Is SimpleScheduleAI the Right Choice?" | 2 TOC entries + matching H2s renamed; anchors updated. |
| Comparison table header | "SimpleScheduleAI (AI-native service)" | TOKEN:self-label | "SimpleScheduleAI (AI-native, guided-setup)" | Direct token application to table header (in-scope per runbook lesson 3). |
| Table row "Product category" | "Managed scheduling service" | PREMISE-COLLAPSE | "Guided-setup scheduling software" | Table cell reframed as software category. |
| Table row "Who builds the schedule" | "AI builds, SimpleScheduleAI team checks" | TOKEN:triad | "AI builds it; 21 automated rule checks validate every draft" | Direct token. |
| Table row "Config maintenance as staff changes" | "Included in service" | JUDGMENT | "Maintained by the software" | `system-maintains` pattern. |
| Table row "Pricing" | "Contact for pricing" (SSAI column) | TOKEN:pricing | "$1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees." | Direct token; source had "contact for pricing" for both vendors, but the facts dossier's canonical pricing line is public information that should replace the placeholder for SSAI's own column (Aladtec's cell correctly stays "Contact for pricing" since that is genuinely unpublished third-party data). |
| Table row "Ratings" | "New service; no public reviews yet" | JUDGMENT | "New software; no public reviews yet" | Noun swap. |
| H2 "What Is the Core Difference Between the Two Models?" + body | "Scheduling software gives you a tool to use. A managed service delivers the output... When you buy a managed scheduling service, you are buying the output. The vendor builds the schedule... and handles the maintenance work in the background." | PREMISE-COLLAPSE | "Aladtec gives you a tool to configure and use. SimpleScheduleAI maps your rules once in a guided setup session, then builds the schedule automatically every cycle... When you buy SimpleScheduleAI, you get software set up in one guided session. The system builds the schedule... and handles the maintenance work automatically in the background after that session." | Full paragraph rewrite; "the vendor builds"/"buying the output" (service-fulfillment framing) replaced with the guided-setup mechanism. |
| H2 "What Is Aladtec?" body | link text "TCP scheduling software versus a managed service" | JUDGMENT | "TCP scheduling software versus guided-setup software" | Anchor text updated; link target unchanged (out of this post's scope; TCP post converted separately in this batch, see Cross-Post Observations). |
| H2 "What Is a Managed Scheduling Service?" (full section) | "A managed scheduling service is not scheduling software with extra support. It is a different delivery model where the vendor's team handles scheduling operations as an ongoing function." | PREMISE-COLLAPSE | H2 renamed "What Is SimpleScheduleAI's Guided-Setup Model?"; "SimpleScheduleAI is not self-configured software with extra support. It is a different delivery model: a guided setup session maps unit rules with the nurse manager once, and after that the system builds and validates the schedule automatically each cycle." | Core definitional paragraph rewritten; "the vendor's team handles operations as an ongoing function" (implies a standing human team) replaced with the one-session-then-automated mechanism. |
| Numbered workflow steps 1-5 | "the SimpleScheduleAI team checks it before it reaches the nurse manager" / "the SimpleScheduleAI team handles the rest. The nurse manager does not administer a system." | TOKEN:triad + JUDGMENT | "21 automated rule checks validate it before it reaches the nurse manager" / "the system applies it automatically. The nurse manager does not administer a system." | Direct triad token in step 2; step 5's "team handles the rest" replaced with "system applies it automatically" per `system-maintains`. |
| H2 "How Long Does Each Model Take to Implement?" | "Because the SimpleScheduleAI team handles all configuration, the nurse manager does not need to learn a system..." | JUDGMENT | "Because that session maps unit rules once and the system handles configuration from then on, the nurse manager does not need to learn a system..." | `system-maintains`/`guided-setup` pattern; names the one-time session explicitly. |
| H2 "What Configuration Maintenance Does Each Model Require?" | "With SimpleScheduleAI, it is included in the service." / "SimpleScheduleAI handles configuration maintenance as part of the service. The nurse manager sends an update... and it is processed by the SimpleScheduleAI team." | PREMISE-COLLAPSE | "With SimpleScheduleAI, the software maintains it automatically after the initial guided setup session." / "SimpleScheduleAI handles configuration maintenance automatically after the guided setup session. The nurse manager sends an update... and the system processes it." | "Processed by the SimpleScheduleAI team" (implies human processing) replaced with "the system processes it," consistent with `system-maintains`. |
| H2 "How Do the Cost Structures of the Two Models Compare?" | "Both Aladtec and SimpleScheduleAI have pricing that is not publicly listed" / "License or service fee" | TOKEN:pricing + JUDGMENT | "Aladtec's pricing is not publicly listed... SimpleScheduleAI is a flat monthly facility license: $1,000/month..." / "License fee" | Since SSAI's pricing is now public per the facts dossier, the original "neither publishes pricing" framing became factually stale for our own column; corrected using the `pricing` token, kept Aladtec's "not publicly listed" as-is (competitor fact, unchanged). |
| Card label | "Best for dual-role CAH nurse manager: managed service" | JUDGMENT | "Best for dual-role CAH nurse manager: guided-setup software" | Noun swap. |
| H2 "When Is a Managed Service the Right Choice?" (full section) | "A managed scheduling service is the right choice when... A managed service converts the schedule from her construction project to her review decision." | PREMISE-COLLAPSE | H2 renamed "When Is SimpleScheduleAI the Right Choice?"; "SimpleScheduleAI is the right choice when..." | Full section noun-swap; bullets below individually consistent. |
| Decision table header + cells | "Managed Service" (column header); cell values "Managed Service" | PREMISE-COLLAPSE | "Recommended Model" unchanged; cell values "SimpleScheduleAI (guided-setup)" | Named the vendor directly since this is a vendor-vs-vendor post, consistent with table-header in-scope rule. |
| "Our Take" box | "The managed service model is not a feature claim. It is an admission that the constraint at a 25-bed hospital is staff time to operate software, not access to software." | JUDGMENT | "Guided-setup software is not a feature claim. It is an admission that..." | Noun swap; rhetorical structure preserved. |
| What to Do This Week, item 3-5 | "Compare that number against the annual cost of a managed service." / "Request a pricing comparison from Aladtec and SimpleScheduleAI. Neither publishes pricing publicly." / "that is the case for evaluating a managed service." | TOKEN:pricing + JUDGMENT | "...against the annual cost of SimpleScheduleAI's flat facility license." / "Aladtec does not publish pricing publicly; SimpleScheduleAI's flat facility license is $1,000 to $1,500 a month..." / "...evaluating guided-setup software." | Pricing token applied; "neither publishes" corrected since SSAI pricing is public. |
| CTA block heading + subtitle | "See What a Managed Service Costs for Your Critical Access Hospital" / "No configuration. No training. No IT. Just a schedule that arrives ready to approve." | TOKEN:no-it + JUDGMENT | "See What Guided-Setup Software Costs for Your Critical Access Hospital" / "No installation. No integration project. No IT department required. Just a schedule that arrives ready to approve." | Direct `no-it` token applied (founder rule: never bald "No IT."). |
| FAQ 2 (Q+A) | "confirm the specific calculation basis with us during onboarding" | JUDGMENT | "confirm the specific calculation basis with us during your guided setup session" | `guided-setup` canonical string. |
| FAQ 3 (Q+A) | "Is it possible to switch from Aladtec to a managed service mid-contract?" / "The only input required for initial setup is a staff roster" | JUDGMENT | "Is it possible to switch from Aladtec to SimpleScheduleAI mid-contract?" / "The only input required for the guided setup session is a staff roster" | Q+A noun swap. |
| FAQ 4 (Q+A) | "What happens when the managed service vendor changes their pricing or exits the market?" / "The mitigation for managed service clients is straightforward" | JUDGMENT | "What happens if SimpleScheduleAI changes its pricing or exits the market?" / "The mitigation is straightforward" | Q+A noun swap; named vendor directly since this is vendor-vs-vendor post. |
| Author bio | "co-founder of SimpleScheduleAI, an AI-native nurse scheduling service" | TOKEN:self-label | "co-founder of SimpleScheduleAI, AI-native nurse scheduling software" | Direct token. |

**Post 2 counts:** Token hits: 7 (`triad` x2, `self-label` x2, `guided-setup` x1, `pricing` x2 —
`no-it` x1 also applied to the CTA block). Judgment calls: 21. Gaps: 1 (the "pricing is not
publicly listed for both vendors" framing needed a correction beyond pure positioning conversion,
since SSAI pricing became public via the facts dossier after this post was originally written —
flagging this as a factual-currency issue, not a token gap, but noting the pattern: any post
written before the pricing page went live will have this same stale "contact for pricing"
placeholder for SSAI's own column and needs the same fix). Premise-collapse: 11 distinct locations
(title/H1/slug, excerpt, canonical, 2 TOC/H2 pairs, the "core difference" definitional section, the
"What Is a Managed Scheduling Service" full section + workflow steps, the "configuration
maintenance" section, the decision-table header/cells, and the CTA block).

**Title/Slug Recommendation:** Applied vendor-vs-vendor Option A per runbook lesson 7:
**"Aladtec vs. SimpleScheduleAI for Critical Access Hospitals (2026)."** New slug:
`/blog/aladtec-vs-simplescheduleai`. Requires 301 from `/blog/aladtec-vs-managed-service`. This
post is itself an inbound link target from Post 1 ("managed-service-vs-scheduling-software")'s
What-to-Do-This-Week item 5 pointing to it by its old slug — flagged in Cross-Post Observations.

---

## Post 3: tcp-scheduling-software-vs-managed-service.md

**Source hash:** `6a262d89d9244130dfc86eaf20750c284df826b6`
**Output:** `docs/seo/migration-staging/post/tcp-scheduling-software-vs-simplescheduleai.md`

Same vendor-vs-vendor Option-A pattern as Post 2 (TCP name stays, "Managed Service" becomes
"SimpleScheduleAI"). This source additionally contained "our scheduling team checks" and "a
specialist runs it on her behalf" constructions in the comparison table and body that needed the
`triad`/`system-maintains` treatment.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / H1 / slug | "TCP TimeClock+ vs. Managed Scheduling for Small Hospitals (2026)" | PREMISE-COLLAPSE | "TCP TimeClock+ vs. SimpleScheduleAI for Small Hospitals (2026)" | Vendor-vs-vendor Option-A retitle. New slug `/blog/tcp-scheduling-software-vs-simplescheduleai`; 301 needed. |
| Excerpt | "A managed scheduling service focuses on scheduling only." | JUDGMENT | "SimpleScheduleAI is guided-setup software focused on scheduling only." | Named vendor directly; noun swap. |
| Tags | `managed-scheduling-service` | JUDGMENT | `guided-setup-software` | Tag swap. |
| Metadata canonical | `.../blog/tcp-scheduling-software-vs-managed-service` | PREMISE-COLLAPSE | `.../blog/tcp-scheduling-software-vs-simplescheduleai` | New slug; 301 required. |
| Intro para 1 | "A managed scheduling service promises that your nurse manager stops being the scheduling administrator." | JUDGMENT | "SimpleScheduleAI promises that your nurse manager stops being the scheduling administrator, through a guided setup session rather than a system she configures herself." | Named vendor; added guided-setup mechanism per founder rule (must state the one-time session). |
| KT bullet 1-2, 5 | "A managed scheduling service focuses on scheduling only. These are different operating models" / "needs a scheduling-focused service that handles the weekly scheduling work for her" | JUDGMENT | "SimpleScheduleAI is guided-setup software focused on scheduling only. These are different delivery models" / "needs scheduling-focused software that builds the weekly schedule for her automatically" | Noun swaps; "handles the work for her" (service framing) replaced with "builds ... automatically." |
| TOC | "What Does a Managed Scheduling Service Do Differently?" / "Where Does a Managed Service Win?" | PREMISE-COLLAPSE | "What Does SimpleScheduleAI's Guided-Setup Model Do Differently?" / "Where Does SimpleScheduleAI Win?" | 2 TOC entries + H2s renamed; anchors updated. |
| Intro body para | "whether a scheduling-focused service handles more of the weekly work for her" | JUDGMENT | "whether guided-setup software builds more of the weekly schedule for her automatically" | Noun/verb swap. |
| Comparison table header | "Managed Service (SimpleScheduleAI)" | PREMISE-COLLAPSE | "SimpleScheduleAI (guided-setup)" | Table header reframed. |
| Table row "Product category" | "Managed scheduling service" | PREMISE-COLLAPSE | "Guided-setup scheduling software" | Cell reframed. |
| Table row "Scheduling focus" | "Core function; AI builds the schedule each cycle, our scheduling team checks it" | TOKEN:triad | "Core function; AI builds the schedule each cycle, 21 automated rule checks validate it" | Direct token. |
| Table row "Ratings" | "New service; no public reviews yet" | JUDGMENT | "New software; no public reviews yet" | Noun swap. |
| H2 "What Does a Managed Scheduling Service Do Differently?" (full section) | "A managed scheduling service removes the scheduling function from the nurse manager's plate entirely. The hospital provides a staff roster... a specialist builds the schedule each cycle, monitors FLSA overtime thresholds, pre-ranks callout replacements, and logs every change... The nurse manager reviews and approves. Her weekly scheduling time drops to 1-2 hours, and she never touches the configuration or the call list." | PREMISE-COLLAPSE | H2 renamed "What Does SimpleScheduleAI's Guided-Setup Model Do Differently?"; "SimpleScheduleAI removes the recurring scheduling build from the nurse manager's plate. The hospital provides a staff roster and scheduling constraints once, in a guided setup session; after that, the AI builds the schedule each cycle, monitors FLSA overtime thresholds, pre-ranks callout replacements, and logs every change automatically... Her weekly scheduling time drops to 1-2 hours, and she never touches a backend configuration screen after setup." | "A specialist builds the schedule" (implies human team) replaced with "the AI builds"; the one-time guided setup session named explicitly per founder rule. |
| Body (repeated intro paragraph) | "Instead of a platform she configures and operates, it is a service a specialist runs on her behalf." | PREMISE-COLLAPSE | "Instead of a platform she configures and operates every cycle, a guided setup session maps her constraints once, and the system runs the schedule build on its own after that." | Core mechanism sentence rewritten. |
| Bullet list "With SimpleScheduleAI" | "A scheduling specialist completes initial setup..." / "a specialist checks overtime thresholds..." / "The specialist maintains the roster..." | TOKEN:guided-setup + JUDGMENT | "A guided setup session maps your unit rules from your staff roster..." / "21 automated rule checks validate overtime thresholds..." / "The software maintains the roster..." | 3 bullets converted; each "specialist" (implied human team) replaced with the guided-setup session or automated system, consistent with `no-it`/`system-maintains`. |
| Body closing sentence of that section | "the upstream work is handled for her" / "how SimpleScheduleAI delivers scheduling as a service" | JUDGMENT | "the upstream work is automated after the guided setup session" / "how SimpleScheduleAI delivers guided-setup scheduling" | Noun/phrase swaps. |
| Body | "TCP TimeClock+ and a managed scheduling service are not direct substitutes... A managed service offloads the scheduling work to a specialist, leaving time tracking and payroll to a separate system." | PREMISE-COLLAPSE | "TCP TimeClock+ and SimpleScheduleAI are not direct substitutes... SimpleScheduleAI maps the hospital's rules once and automates the scheduling work after that, leaving time tracking and payroll to a separate system." | "Offloads ... to a specialist" (implies human team) replaced with the guided-setup-then-automated mechanism. |
| H2 "How Long Does Each Model Take to Implement?" | "A managed scheduling service takes 3-5 days because the specialist handles all configuration from the nurse manager's staff roster." | JUDGMENT | "SimpleScheduleAI's guided setup session takes 3-5 days because the software handles all configuration automatically from the nurse manager's staff roster after that single session." | `system-maintains` pattern + guided-setup session named. |
| H2 "What Weekly Time Does Each Model Cost the Nurse Manager?" | "A managed service reduces the scheduling portion to 1-2 hours" / "what a managed scheduling service covers" | JUDGMENT | "SimpleScheduleAI reduces the scheduling portion to 1-2 hours" / "what SimpleScheduleAI covers" | Named vendor directly. |
| H2 "How Does Each Model Handle After-Hours Callouts?" | "With a managed service, the replacement list is pre-ranked..." | TOKEN:callout | "With SimpleScheduleAI, the replacement list is pre-ranked..." | Named vendor; consistent with `callout` token's system-driven framing. |
| H2 "Where Does TCP TimeClock+ Win?" (body, 3 bullets) | "A managed scheduling service covers scheduling only and has no nurse-facing interface... A managed service covers scheduling only; payroll and time tracking remain a separate system... For facilities that prefer operational self-sufficiency over service dependency, the platform model has real appeal." | JUDGMENT | "SimpleScheduleAI covers scheduling only and has no nurse-facing interface... SimpleScheduleAI covers scheduling only... For facilities that prefer consolidating every workforce function under one roof, the platform model has real appeal." | Named vendor throughout; "service dependency" (implies an ongoing vendor-relationship burden framing that reads oddly once SSAI is software) replaced with "consolidating every workforce function under one roof," preserving the real contrast (TCP unifies more functions) without the service-dependency framing. |
| H2 "Where Does a Managed Service Win?" (full section) | "A managed service focuses entirely on scheduling... A managed service is built entirely around nurse scheduling... The nurse manager using a managed service spends 1-2 hours..." | PREMISE-COLLAPSE | H2 renamed "Where Does SimpleScheduleAI Win?"; "SimpleScheduleAI focuses entirely on scheduling... SimpleScheduleAI is built entirely around nurse scheduling... The nurse manager using SimpleScheduleAI spends 1-2 hours..." | Named vendor throughout this section's 4 bullets. |
| H2 "How Does Time to Value Compare?" + comparison cards | "For pure scheduling time reduction, a managed service moves faster." / card label "SimpleScheduleAI (AI-native service)" | JUDGMENT + TOKEN:self-label | "For pure scheduling time reduction, SimpleScheduleAI moves faster." / card label "SimpleScheduleAI (guided-setup software)" | Named vendor; token applied to card label. |
| Closing paragraph of that section | "a managed scheduling service addresses that more directly" | JUDGMENT | "SimpleScheduleAI's guided-setup model addresses that more directly" | Noun swap. |
| H2 "Which Fits Your Critical Access Hospital?" (full section) | "A managed service makes sense when the nurse manager needs the scheduling work handled for her, not just better tools to do it herself." / bullet list "Choose a managed scheduling service if:" | PREMISE-COLLAPSE | "SimpleScheduleAI makes sense when the nurse manager needs the recurring scheduling build handled automatically, not just better tools to do it herself." / "Choose SimpleScheduleAI if:" | Named vendor; "handled for her" (service framing) replaced with "handled automatically." |
| Closing sentence before Our Take | "against managed-service fee" | TOKEN:pricing-short | "against SimpleScheduleAI's flat facility license fee" | Applied pricing token framing. |
| "Our Take" box | "A managed scheduling service answers 'how does the nurse manager stop being the scheduling administrator?'... the platform that solves it best is not the one with the most modules. It is the one that removes the work entirely." | JUDGMENT | "SimpleScheduleAI answers 'how does the nurse manager stop being the scheduling administrator?'... It is the one that automates the recurring work entirely after a single setup session." | Named vendor; "removes the work entirely" (ambiguous verb, could imply a human absorbing it) clarified to "automates ... after a single setup session." |
| What to Do This Week (full section) | "The comparison between TCP TimeClock+ and a managed scheduling service..." / "what a dedicated service would provide" | JUDGMENT | "The comparison between TCP TimeClock+ and SimpleScheduleAI..." / "what guided-setup software would provide" | Named vendor + noun swap. |
| CTA block heading + subtitle | "See What a Managed Service Looks Like for Your Critical Access Hospital" / "the scheduling work is done." | JUDGMENT | "See What Guided-Setup Scheduling Looks Like for Your Critical Access Hospital" / "the scheduling work is automated." | "Done" (ambiguous, could imply human completion) → "automated." |
| Pre-FAQ honest-limitation line | "a managed scheduling service is not the right fit for hospitals that need unified time-and-attendance... or organizations that specifically prefer operating their own platform under direct control." | JUDGMENT | "SimpleScheduleAI is not the right fit for hospitals that need unified time-and-attendance... or organizations that specifically prefer operating their own self-configured platform under direct control." | Named vendor; added "self-configured" for precision. |
| FAQ intro sentence | "comparing TCP TimeClock+ and a managed scheduling service: ... and when a managed service is the better fit." | JUDGMENT | "comparing TCP TimeClock+ and SimpleScheduleAI: ... and when guided-setup software is the better fit." | Noun swap. |
| FAQ 4 (Q+A) | "What happens when a nurse calls out at 5 AM with TCP TimeClock+ vs. a managed service?" / "With a managed service: the replacement call list is pre-ranked" | TOKEN:callout | "...vs. SimpleScheduleAI?" / "With SimpleScheduleAI: the replacement call list is pre-ranked" | Named vendor; consistent with `callout` token. |
| FAQ 5 (Q+A) | "What is the main reason to stay with TCP TimeClock+ instead of switching to a managed service?" / "A managed scheduling service covers scheduling only; it does not replace a time and attendance system." / "see how ShiftWizard compares to a managed service" | JUDGMENT | "...instead of switching to SimpleScheduleAI?" / "SimpleScheduleAI covers scheduling only; it does not replace a time and attendance system." / "see how ShiftWizard compares to SimpleScheduleAI" | Named vendor throughout; last link's anchor text updated (target unchanged, out of batch scope — the ShiftWizard post is not part of this H1 batch). |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals" | TOKEN:self-label | "AI-native nurse scheduling software built for Critical Access Hospitals" | Direct token. |

**Post 3 counts:** Token hits: 6 (`triad` x2, `self-label` x2, `callout` x2; `guided-setup` and
`pricing-short` framing applied adjacently/paraphrased and counted under JUDGMENT/PREMISE-COLLAPSE
below). Judgment calls: 28. Gaps: 1 (the "specialist" noun as a stand-in for "the vendor's human
team" recurred 4+ times in this single source post — the strongest single-post evidence that a
dedicated registry row distinguishing "specialist" (forbidden, implies staffing) from "the system"
(sanctioned) would help future conversions; this is the same underlying gap as Post 1's finding,
now confirmed a 3rd time). Premise-collapse: 9 distinct locations (title/H1/slug, excerpt,
canonical, 2 TOC/H2 pairs treated as 2 collapses, the "What Does X Do Differently" full section +
repeated intro paragraph, the "TCP and X are not direct substitutes" paragraph, the "Where Does a
Managed Service Win" full H2 section, and the "Which Fits Your CAH" full H2 section).

**Title/Slug Recommendation:** Applied vendor-vs-vendor Option A:
**"TCP TimeClock+ vs. SimpleScheduleAI for Small Hospitals (2026)."** New slug:
`/blog/tcp-scheduling-software-vs-simplescheduleai`. Requires 301 from
`/blog/tcp-scheduling-software-vs-managed-service`. Inbound link dependency: Post 1's What-to-Do-
This-Week item 5 and Post 2 (Aladtec)'s "What Is Aladtec?" section both link here by the old slug
with positioning-bearing anchor text — flagged in Cross-Post Observations.

---

## Post 4: inhouse-health-vs-simplescheduleai.md

**Source hash:** `be0b50a10a8233b0a7eef86e95942cf36da84fff`
**Output:** `docs/seo/migration-staging/post/inhouse-health-vs-simplescheduleai.md`

Title and slug already vendor-vs-vendor with no "managed service" phrase — no retitle needed. The
positioning work here mirrors the M7 Health dry-run precedent closely: the post's spine is
"self-operated platform vs. managed service" as the core operating-model contrast, which becomes
"self-operated platform vs. guided-setup software" (the `delivery-model-binary` token's exact
intended use case). One cross-link to `managed-service-vs-scheduling-software` was updated in
anchor text only; the target post is Post 1 in this same batch (retitled), so this link now points
to a stale old-slug URL until migration day's link-graph pass runs (flagged below).

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / slug | "In-House Health vs. SimpleScheduleAI for Critical Access Hospitals (2026)" | unchanged | unchanged | Already vendor-vs-vendor; no service-vs-software premise in the title itself. |
| Excerpt | "SimpleScheduleAI is an AI-native nurse scheduling service built for Texas Critical Access Hospitals with no IT department." | TOKEN:self-label | "SimpleScheduleAI is AI-native, guided-setup nurse scheduling software built for Texas Critical Access Hospitals with no IT department." | Direct token. |
| Tags | `managed-service` | JUDGMENT | `guided-setup-software` | Tag swap. |
| Metadata description | "against AI-native, guided-setup nurse scheduling software" | TOKEN:self-label | (already converted in metadata) | Applied at metadata-authoring time; description field is in-scope per runbook lesson 2. |
| Intro paragraph | "This guide separates the run-it-yourself platform model from the managed service model" | PREMISE-COLLAPSE | "This guide separates the run-it-yourself platform model from SimpleScheduleAI's guided-setup model" | Core framing sentence rewritten; named vendor directly since the "managed service" category-noun no longer applies to SSAI. |
| KT bullet 2 | "SimpleScheduleAI is a different category: an AI-native nurse scheduling service for Texas Critical Access Hospitals. The vendor builds the schedule, maintains the CMS audit trail, and returns callout replacement lists." | TOKEN:self-label + PREMISE-COLLAPSE | "SimpleScheduleAI is a different category: AI-native, guided-setup nurse scheduling software for Texas Critical Access Hospitals. A single onboarding session maps unit rules, then the system builds the schedule, maintains the CMS audit trail, and returns callout replacement lists automatically." | "The vendor builds" (implies human team) replaced with the guided-setup mechanism per `system-maintains`. |
| KT bullet 5 | "SimpleScheduleAI fits a 25-bed hospital that needs the scheduling work removed, not a platform to operate." | JUDGMENT | "SimpleScheduleAI fits a 25-bed hospital that needs the scheduling work automated after a single guided setup session, not a platform to operate." | "Removed" (implies a human absorbing it elsewhere) → "automated," consistent with Post 1's dry-run precedent. |
| Body intro para | "SimpleScheduleAI is an AI-native nurse scheduling service: the work is done for you and you approve the result... that managed-service-versus-run-it-yourself distinction decides the purchase... it also helps to read how AI nurse scheduling behaves differently as a managed service versus a self-operated platform." | TOKEN:self-label + PREMISE-COLLAPSE | "SimpleScheduleAI is AI-native, guided-setup nurse scheduling software: a single onboarding session maps your rules, then the system does the recurring work and you approve the result... that guided-setup-versus-run-it-yourself distinction decides the purchase... it also helps to read how AI nurse scheduling behaves differently as guided-setup software versus a self-operated platform." | "The work is done for you" (bald service framing) replaced with the session-then-automation mechanism. |
| H2 "What Is SimpleScheduleAI?" (full section) | "The hospital uploads its staff roster as an Excel file. The SimpleScheduleAI team produces the schedule using AI... The nurse manager reviews and approves. There is nothing to configure and no platform for the hospital to operate... it is a new service early-stage... our guide on managed service versus scheduling software" | TOKEN:self-label + PREMISE-COLLAPSE | "The hospital uploads its staff roster as an Excel file during a guided setup session. The AI produces the schedule... There is no ongoing platform for the hospital to configure or operate after the guided setup session... it is new software early-stage... our guide on guided-setup versus self-configured nurse scheduling software" | "The SimpleScheduleAI team produces" (implies human team) → "The AI produces"; "nothing to configure" corrected to "no ongoing platform... after the guided setup session" per the founder rule against implying zero-touch setup (a session does occur). Link anchor text updated; target slug is Post 1 in this batch, flagged below. |
| H2 "What Is the Core Difference Between These Two Models?" (full section) | "SimpleScheduleAI is an AI-native nurse scheduling service: the vendor builds the schedule and maintains compliance documentation... The first sells a platform. The second sells the finished scheduling work... A managed service moves that operating burden to the vendor. The hospital approves rather than administers." | TOKEN:self-label + PREMISE-COLLAPSE | "SimpleScheduleAI is AI-native, guided-setup nurse scheduling software: a single onboarding session maps the hospital's rules, the system then builds the schedule and maintains compliance documentation automatically... The first sells a platform to operate. The second sells software that runs the recurring work itself after one setup session... Guided-setup software moves that ongoing operating burden to the system after a single mapping session." | Full-section rewrite; "moves the burden to the vendor" (implies a human/team absorbing it) replaced with "moves the burden to the system after a single mapping session." |
| H2 "Who Is In-House Health Best For?" | "the appetite for an AI tool of its own may find it a strong fit" / "rather than handing scheduling to a vendor" | JUDGMENT | (first clause unchanged) / "rather than a single guided setup session that hands the recurring work to the system" | "Handing scheduling to a vendor" (implies an ongoing human-staffed relationship) replaced with the guided-setup mechanism. |
| H2 "Who Is SimpleScheduleAI Best For?" (full section) | "It wants the schedule built, the callout list ranked, and the CMS documentation maintained, with a person available who knows CAH rules." / "SimpleScheduleAI applies Texas FLSA overtime rules and maintains the CMS §485.635 audit trail as part of the service." / "without the work of running scheduling software" / "A managed service removes that labor cost, not just the software cost." | PREMISE-COLLAPSE | "It wants the schedule built, the callout list ranked, and the CMS documentation maintained automatically after a single guided setup session, with a system built specifically around CAH rules." / "...maintains the CMS §485.635 audit trail automatically as part of the software." / "without the ongoing work of operating scheduling software" / "Software built to run without an ongoing operating role removes that labor cost, not just the license cost." | "With a person available who knows CAH rules" (implies an accessible human support team, a service-mode claim) replaced with "a system built specifically around CAH rules" — this is the strongest premise-collapse in this post; the founder rules forbid implying a standing human team is reachable, which the original phrasing did. |
| H2 "What Does Getting Started Look Like...?" (full section) | "Getting started with a self-operated AI platform and a managed service require different things." / "the hospital sends an Excel file of its staff roster. The service produces the first schedule draft within days. There is no system to integrate, no configuration to own, and no platform to maintain." | PREMISE-COLLAPSE | H2 body: "Getting started with a self-operated AI platform and guided-setup software require different things." / "the hospital sends an Excel file of its staff roster and completes a guided setup session that maps unit rules once. The system produces the first schedule draft within days. There is no system to integrate, no ongoing configuration to own, and no platform to maintain week to week." | "The service produces" → "the system produces"; "no configuration to own" corrected to "no ongoing configuration" (a session does occur) per the founder rule. |
| H2 "What Happens When a Nurse Calls Out at 5:30 a.m.?" | "the nurse manager contacts the service and receives a ranked replacement list... The documentation... is handled by the service." | TOKEN:callout | "the nurse manager opens the system and receives a ranked replacement list... The documentation... is handled automatically by the software." | Direct application of `callout` token's system-driven framing. |
| Comparison table header | "Managed scheduling service the vendor operates" | PREMISE-COLLAPSE | "Guided-setup nurse scheduling software" | Table header reframed. |
| Table row "Who builds the schedule" | "The SimpleScheduleAI team; nurse manager reviews and approves" | TOKEN:triad-adjacent | "The system builds it automatically; nurse manager reviews and approves" | `system-maintains` pattern. |
| Table row "CMS §485.635 audit trail" | "Maintained continuously as part of the service" | JUDGMENT | "Maintained continuously and automatically" | Noun/phrase swap. |
| Table row "Setup and operation" | "Excel roster upload; vendor handles configuration and operation" | JUDGMENT | "Excel roster upload plus one guided setup session; software handles configuration and operation after that" | Named the session explicitly per founder rule. |
| Table row "Vendor stat claims" | "no published independent metrics; new service in pilot phase" | JUDGMENT | "no published independent metrics; new software pre-launch" | Corrected per `product_no_pilot_customers` memory guardrail — SSAI has no pilot customers/cohort; "in pilot phase" would misstate this. Also a noun swap (service→software). |
| Table row "Company stage" | "Early-stage managed service; no named customers yet" | JUDGMENT | "Early-stage software; no named customers yet" | Noun swap. |
| Table row "Pricing" | "Contact for pricing" (SSAI column) | TOKEN:pricing | "$1,000/month for up to 20 nurses, $1,500/month for 21 to 40 nurses. No per-nurse fees, no setup fees." | Same correction as Posts 2/3: SSAI pricing is public per the facts dossier; the stale "contact for pricing" placeholder for our own column was replaced. |
| H2 "What Does This Mean for a 25-Bed Hospital Specifically?" | "That is the gap a managed service is designed to close: it removes the operating role rather than accelerating it." | PREMISE-COLLAPSE | "That is the gap guided-setup software is designed to close: it removes the ongoing operating role rather than accelerating it." | Noun swap. |
| Callout box "The deciding question, by hospital profile" | "a managed service removes the operating role; there is no platform for the hospital to maintain." | JUDGMENT | "guided-setup software removes the ongoing operating role; there is no platform for the hospital to maintain week to week." | Noun swap + precision addition. |
| H2 "How Should a CAH Evaluate a Scheduling Vendor?" | "who builds and maintains the schedule each week, hospital staff or the vendor?" / "This single answer separates a platform you operate from a service that operates for you" | PREMISE-COLLAPSE | "who builds and maintains the schedule each week, hospital staff or the system, after setup?" / "This single answer separates a platform you operate week to week from software that runs itself after a guided setup session" | "A service that operates for you" (bald service framing) replaced with the guided-setup mechanism. |
| "Our Take" box | "A managed service assumes it does not." | JUDGMENT | "Guided-setup software assumes it does not, and maps the rules once instead." | Noun swap + added mechanism clause. |
| What to Do This Week, item 1 & 5 | "a managed service is the better fit" / "The answer separates a platform you run from a service that runs for you." | JUDGMENT | "guided-setup software is the better fit" / "The answer separates a platform you run week to week from software that runs itself after a guided setup session." | Noun swap + mechanism. |
| CTA block subtitle | "Flat monthly pricing. No IT setup. Our AI builds the schedule, our scheduling team checks it, you approve it." | TOKEN:no-it + TOKEN:triad | "Flat monthly pricing. No installation, no integration project, no IT department required. Our AI builds the schedule, 21 automated rule checks validate every draft, you approve it." | Both tokens applied directly; this was the clearest bald "No IT setup" + "our scheduling team checks it" pairing in the entire batch. |
| FAQ 1 (Q+A) | "SimpleScheduleAI is an AI-native nurse scheduling service built for 25-bed Texas Critical Access Hospitals with no IT staff. For a small hospital with no one to run a platform, the managed service model usually fits better." | TOKEN:self-label + JUDGMENT | "SimpleScheduleAI is AI-native, guided-setup nurse scheduling software built for 25-bed Texas Critical Access Hospitals with no IT staff. For a small hospital with no one to run a platform, the guided-setup model usually fits better." | Token + noun swap. |
| FAQ 5 (Q+A) | "What is the real difference between an AI scheduling platform and a managed scheduling service?" / "A managed scheduling service does the work for the hospital: the vendor builds the schedule..." | PREMISE-COLLAPSE | "What is the real difference between a self-operated AI scheduling platform and guided-setup nurse scheduling software?" / "Guided-setup software maps the hospital's rules once in an onboarding session, then the system builds the schedule and maintains compliance documentation automatically..." | Full Q+A rewrite; "does the work for the hospital: the vendor builds" (bald service framing) replaced with the session-then-automation mechanism. |
| Author bio | unchanged (already said "co-founder of SimpleScheduleAI" without a self-label phrase in the bio itself) | unchanged | unchanged | Verified: this post's closing bio line does not repeat the self-label phrase (unlike other posts in this batch), so no edit was needed here. |

**Post 4 counts:** Token hits: 9 (`self-label` x4, `callout` x1, `no-it` x1, `triad` x2,
`pricing` x1). Judgment calls: 19. Gaps: 1 (same "vendor/team does X" → "system/software does X"
pattern as Posts 1-3, now the 4th confirmation; also separately caught a `product_no_pilot_
customers` memory violation risk in the vendor-stat-claims table row "new service in pilot phase,"
corrected to "new software pre-launch" — worth flagging to the founder as a source-of-truth issue
independent of the positioning migration, since the LIVE post currently says this too). Premise-
collapse: 13 distinct locations (intro para, KT bullet 2, body intro para, "What Is
SimpleScheduleAI" full section, "Core Difference" full section, "Who Is SimpleScheduleAI Best For"
full section, "Getting Started" full section, comparison table header, "What Does This Mean"
sentence, "How Should a CAH Evaluate" Q1 sentence, and FAQ 5 full Q+A — grouped as 13 rows above).

**Cross-post finding (independent of positioning):** The vendor-stat-claims table row in the LIVE
source post currently reads "new service in pilot phase," which conflicts with the
`product_no_pilot_customers` founder-flagged memory (SSAI is pre-launch, no pilot customers/
cohort/results ever). This is a pre-existing factual issue in the source, not something introduced
by this conversion — flagging it here since the staging copy fixes it, but the live post at
`src/data/post/inhouse-health-vs-simplescheduleai.md` still has the stale "pilot phase" language
and should be corrected independent of any migration timeline.

**Title/Slug Recommendation:** No change. Title and slug are already vendor-vs-vendor
(`inhouse-health-vs-simplescheduleai`) with no "managed service" string in either. All conversion
work was body/table/FAQ level.

---

## Post 5: nurse-rostering-vs-scheduling-software.md

**Source hash:** `4879b0ce6c24c2053ff1a2b85ec22f347e4e455f`
**Output:** `docs/seo/migration-staging/post/nurse-rostering-vs-scheduling-software.md`

Lightest-touch post in the batch. The rostering-vs-scheduling distinction itself is mode-agnostic
(a real operational distinction, not a service-vs-software one) and needed zero premise work. Only
3 "managed service" mentions existed, all in the closing third of the post (KT bullet 5, one body
sentence recommending SimpleScheduleAI, and one cross-link). No title/slug change; no H2 renames.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / slug | "Nurse Rostering vs. Scheduling Software: What's the Difference?" | unchanged | unchanged | Not positioning-bearing; a real terminology/operational distinction independent of delivery model. |
| KT bullet 5 | "A managed service that owns both the roster and the schedule is often the more practical fit for a small hospital with no dedicated workforce-management staff." | JUDGMENT | "Guided-setup software that owns both the roster and the schedule is often the more practical fit for a small hospital with no dedicated workforce-management staff." | Noun swap; no deeper premise dependency since the rest of the post's argument (rostering vs. scheduling as two jobs) does not rely on this sentence. |
| Body, "Which Functions Matter Most" section closing paragraph | "SimpleScheduleAI is nurse scheduling software we build and operate ourselves, delivered as a service: roster intake and availability management on the roster side, shift assignment and ranked callout coverage on the scheduling side, all in one cycle so nothing has to be reconciled by hand." | TOKEN:self-label + PREMISE-COLLAPSE | "SimpleScheduleAI is guided-setup nurse scheduling software: roster intake and availability management on the roster side, shift assignment and ranked callout coverage on the scheduling side, all in one cycle so nothing has to be reconciled by hand." | "We build and operate ourselves, delivered as a service" was an unusual, confusing construction in the original (self-referential "we build... delivered as a service") that does not survive product mode cleanly; simplified to the `guided-setup` framing rather than attempting a literal token swap of a phrase that was already awkward in the source. |
| Same paragraph, link text | "compare scheduling software vs. a managed service" | JUDGMENT | "compare guided-setup vs. self-configured scheduling software" | Anchor text updated per runbook lesson 9; link target is Post 1 in this batch (`managed-service-vs-scheduling-software`), which was retitled — target slug flagged in Cross-Post Observations. |
| "Our Take" box, closing sentence | "See how SimpleScheduleAI handles your staff roster and the schedule as one service" (in What-to-Do item 5) | JUDGMENT | "See how SimpleScheduleAI handles your staff roster and the schedule in one guided setup" | Noun swap. |
| CTA block subtitle | "SimpleScheduleAI takes your staff roster and runs the full schedule as one managed service, with no separate tools to keep in sync." | PREMISE-COLLAPSE | "SimpleScheduleAI takes your staff roster and runs the full schedule automatically after one guided setup session, with no separate tools to keep in sync." | Core CTA claim rewritten. |
| FAQ 4 (Q+A) | "A managed service applies these updates as they happen rather than in periodic batch reviews" | JUDGMENT | "Guided-setup software applies these updates as they happen rather than in periodic batch reviews" | Noun swap. |
| Author bio | "co-founder of SimpleScheduleAI, an AI-native nurse scheduling service" | TOKEN:self-label | "co-founder of SimpleScheduleAI, AI-native nurse scheduling software" | Direct token. |

**Post 5 counts:** Token hits: 2 (`self-label` x2). Judgment calls: 5. Gaps: 0 (no new recurring
construction beyond what Posts 1-4 already surfaced). Premise-collapse: 2 distinct locations (the
"Which Functions Matter Most" closing paragraph's self-description, and the CTA block subtitle).

**Title/Slug Recommendation:** No change. This post's core thesis (rostering vs. scheduling as two
distinct operational jobs) is unaffected by the service-vs-software migration; only the closing
third's SimpleScheduleAI self-description needed conversion.

---

## Post 6: nurse-scheduling-software-vs-excel.md

**Source hash:** `b42d3f61dd8f8489e0440b781cd53784dce0ca1f`
**Output:** `docs/seo/migration-staging/post/nurse-scheduling-software-vs-excel.md`

Medium-touch post. The core Excel-vs-software argument is mode-agnostic, but the post explicitly
frames "a managed service" as the honest third option missing from most CAH evaluations (intro
para, KT bullet 5, "Is nurse scheduling software worth the cost" section, and the full "How
SimpleScheduleAI Helps" section). That framing needed conversion throughout, plus one dense
paragraph in the "How SimpleScheduleAI Helps" H2 that reads almost identically to the `triad`
token's source phrasing and required a direct swap.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / slug | "Nurse Scheduling Software vs. Excel: When to Make the Switch" | unchanged | unchanged | Software-vs-Excel is mode-agnostic; the managed-service framing is a secondary "third option" mentioned within, not the title's premise. |
| Intro para 1 | "The third option, a managed service that removes the construction work entirely, is the one most CAH evaluations forget to put on the comparison." | PREMISE-COLLAPSE | "The third option, guided-setup software that removes the construction work entirely after a single onboarding session, is the one most CAH evaluations forget to put on the comparison." | Core framing sentence; added the guided-setup mechanism per founder rule. |
| Intro para 2 | "the structural reason scheduling software fails to solve the right problem at CAH scale" | JUDGMENT | "the structural reason self-configured scheduling software fails to solve the right problem at CAH scale" | Precision edit: the failure mode is specific to self-configured software, not scheduling software as a category (which now includes guided-setup software too). |
| KT bullet 2 | "Scheduling software adds compliance guardrails..." | JUDGMENT | "Self-configured scheduling software adds compliance guardrails..." | Same precision edit as above. |
| KT bullet 5 | "A managed service is a better fit than self-serve software for many CAHs because it removes the configuration and maintenance burden" | PREMISE-COLLAPSE | "Guided-setup software is a better fit than self-configured software for many CAHs because it removes the configuration and maintenance burden after a single onboarding session" | Noun-pair swap + guided-setup mechanism named. |
| H2 "Is nurse scheduling software worth the cost..." closing paragraph | "is where automated scheduling offsets the cost of a scheduling service at a small CAH" | JUDGMENT | "is where automated scheduling offsets the cost of guided-setup software at a small CAH" | Noun swap. |
| H2 "How SimpleScheduleAI Helps?" (full section, opening paragraph) | "SimpleScheduleAI is not a software platform you configure yourself, it's an AI-native managed scheduling service where our AI builds the schedule, our scheduling team checks it, and your nurse manager approves the final schedule." | TOKEN:triad + PREMISE-COLLAPSE | "SimpleScheduleAI is not software you configure yourself. It is AI-native, guided-setup nurse scheduling software: our AI builds the schedule, 21 automated rule checks validate it, and your nurse manager approves the final schedule." | This sentence is nearly verbatim the `triad` token's service-mode source string; applied the token directly plus `self-label`. |
| Same section, next paragraph | "Our AI builds the weekly schedule and our scheduling team checks it, handling the initial setup, callout coverage logic, and compliance checks... We also track overtime risk in real time..." | TOKEN:triad + JUDGMENT | "Our AI builds the weekly schedule and 21 automated rule checks validate it, handling the initial guided setup, callout coverage logic, and compliance checks... The system also tracks overtime risk in real time..." | Direct triad token; "we also track" (first-person capability claim, legitimate in service mode per runbook lesson 10 but inconsistent once "our scheduling team" is retired in the same paragraph) changed to "the system also tracks" for internal consistency within the paragraph. |
| "Our Take" box | unchanged | unchanged | unchanged | This box's text does not contain "managed service" or any positioning phrase; it is a mode-neutral argument about Excel's limitations. Verified no edit needed. |
| What to Do This Week, item 5 | "The managed service lets you compare the actual time burden against your week-one baseline." | JUDGMENT | "Guided-setup software lets you compare the actual time burden against your week-one baseline." | Noun swap. |
| FAQ 1 (Q+A) | "A managed service like SimpleScheduleAI typically runs parallel for 2-4 weeks during onboarding" | JUDGMENT | "Guided-setup software like SimpleScheduleAI typically runs parallel for 2-4 weeks during onboarding" | Noun swap. |
| FAQ 2 (Q+A) | "A managed service should handle that export setup as part of onboarding rather than leaving it to your IT staff." | JUDGMENT | "Guided-setup software should handle that export setup as part of the guided setup session rather than leaving it to your IT staff." | Noun swap + `guided-setup` canonical phrase. |
| FAQ 3 (Q+A) | "For a managed service, initial setup typically takes one to two weeks... Self-serve software platforms can take longer because configuration is on the hospital side." | JUDGMENT | "For guided-setup software, the initial setup session typically takes one to two weeks... Self-configured software platforms can take longer because configuration is on the hospital side." | Noun-pair swap. |
| Author bio | "co-founder of SimpleScheduleAI." (no self-label phrase in this post's bio) | unchanged | unchanged | Verified: this post's bio line does not include a "nurse scheduling service" phrase, unlike most others in the batch; no edit needed. |

**Post 6 counts:** Token hits: 3 (`triad` x2, `self-label` x1). Judgment calls: 10. Gaps: 0.
Premise-collapse: 3 distinct locations (intro para 1, KT bullet 5, and the "How SimpleScheduleAI
Helps" H2's opening paragraph).

**Title/Slug Recommendation:** No change. The Excel-vs-software comparison is the post's real
subject and is mode-agnostic; "managed service" appeared only as a secondary "third option"
framing that has been converted throughout without touching the title's premise.

---

## Post 7: what-automated-nurse-scheduling-actually-means.md

**Source hash:** `11683333024d630395e50b547f3d031c1f16cb7b`
**Output:** `docs/seo/migration-staging/post/what-automated-nurse-scheduling-actually-means.md`

This post's core framework (5 levels of scheduling automation) is mode-agnostic for Levels 1-4, but
Level 5 is explicitly defined as "Managed service. A specialist builds the schedule, handles
callout coverage, maintains the roster." This required judgment: Level 5 could not simply become
"software that has all the same features" (that would collapse the distinction the whole post is
built on, since Levels 1-4 are also "software"). The honest post-migration distinction is that
Level 5 is a DELIVERY-MODEL difference (one guided setup session, then full automation) not a
labor-substitution difference (a human specialist doing the work). Redefined Level 5's "What It
Does" and "What the Nurse Manager Still Does" columns to preserve the level's real meaning (the
manager's weekly hours drop to near-zero) without the human-specialist framing.

| Location | Original phrase | Action | Replacement | Note |
| --- | --- | --- | --- | --- |
| Title / slug | "What 'Automated Nurse Scheduling' Actually Means (And What It Doesn't)" | unchanged | unchanged | Mode-agnostic; the post's subject (automation levels) survives cleanly. |
| Intro para 1 | "the word 'automated' covers everything from auto-filling blank shift slots to full managed-service draft generation" | PREMISE-COLLAPSE | "the word 'automated' covers everything from auto-filling blank shift slots to full guided-setup draft generation" | Noun swap; core sentence. |
| H2 "What Does 'Automated Nurse Scheduling' Actually Mean?" | "from tools that auto-populate blank slots with available nurses to managed services that deliver a complete draft schedule before the nurse manager logs in" | PREMISE-COLLAPSE | "from tools that auto-populate blank slots with available nurses to guided-setup software that delivers a complete draft schedule before the nurse manager logs in" | Noun swap. |
| Same section | "whether the scheduling work is done for her and she is reviewing output" | JUDGMENT | "whether the scheduling work is done automatically and she is reviewing output" | "Done for her" (bald service framing) → "done automatically." |
| Level 5 table row | "Level 5: Managed service" / "A specialist builds the schedule, handles callout coverage, maintains the roster. Manager approves output" | PREMISE-COLLAPSE | "Level 5: Guided-setup software" / "A single guided setup session maps the rules; the system then builds the schedule, handles callout coverage, and maintains the roster automatically every cycle. Manager approves output" | The single most important cell in this post. "A specialist" (implies a human vendor employee doing recurring work) is exactly what the `no-it`/`system-maintains` founder rules forbid; redefined Level 5 as a one-time human-guided setup followed by full software automation, which preserves the level's real distinguishing feature (near-zero recurring manager hours) without the human-labor framing. |
| Body after the table | "Level 5 is a service model, not a software model, and the decision between software and a managed service for a small hospital is covered in depth in managed service vs. scheduling software" | PREMISE-COLLAPSE | "Level 5 is a guided-setup delivery model, not a self-configured software model, and the decision between the two for a small hospital is covered in depth in guided-setup vs. self-configured scheduling software" | This sentence originally asserted Level 5 is literally "not a software model" — under product mode this is now false (Level 5 IS software, delivered differently), so it required a full rewrite, not a token swap. Link anchor text updated; target is Post 1 in this batch (retitled), flagged in Cross-Post Observations. |
| H2 "How Is SimpleScheduleAI's Automation Different?" (full section) | "SimpleScheduleAI operates at Level 5: a managed service where our AI builds the schedule draft and our scheduling team checks it, not a software tool that helps the nurse manager build it faster." | TOKEN:triad + PREMISE-COLLAPSE | "SimpleScheduleAI operates at Level 5: a guided setup session maps unit rules once, and after that the AI builds the schedule draft and 21 automated rule checks validate it, not a software tool that helps the nurse manager build it faster." | Direct triad token application within the redefined Level 5 framing. |
| Same section | "our scheduling team checks them" | TOKEN:triad | "21 automated rule checks validate them" | Direct token. |
| Same section | "This is not a software tool with automation features. It is a different operating model. The AI handles the schedule build and our scheduling team checks it" | TOKEN:triad + JUDGMENT | "This is not a software tool with automation features bolted on. It is a different operating model, delivered through a single guided setup session rather than ongoing self-configuration. The AI handles the schedule build and 21 automated rule checks validate every draft" | The original's "not a software tool... it is a different operating model" is a direct restatement of the same premise-collapse as the Level 5 table cell; clarified that the "different operating model" is the guided-setup delivery mechanism, since Level 5 is still software. |
| Same section, honest-limitation sentence | "the managed service model requires comfort delegating draft generation... or who have specific scheduling rules the specialist cannot easily replicate" | PREMISE-COLLAPSE | "the guided-setup model requires comfort delegating draft generation to the system after the initial setup session... or who have specific scheduling rules that are difficult to encode in a single setup session" | "The specialist cannot easily replicate" (implies an ongoing human doing rule-interpretation work) replaced with "difficult to encode in a single setup session," consistent with the founder rule against implying an ongoing human specialist. |
| Same section, closing sentences | "self-serve options for small hospitals" | JUDGMENT | "self-configured options for small hospitals" | Noun-pair consistency. |
| CTA block subtitle | "SimpleScheduleAI's AI builds the schedule and our scheduling team checks it." | TOKEN:triad | "SimpleScheduleAI's AI builds the schedule and 21 automated rule checks validate it." | Direct token. |
| "Our Take" box | "So is Level 5 (complete draft generation by a managed service)." | PREMISE-COLLAPSE | "So is Level 5 (complete draft generation after a single guided setup session)." | Noun-phrase swap. |
| Pre-"What to Do" honest-limitation line | "Level 5 managed automation is not the right fit for hospitals that prefer direct control... or organizations that want a self-serve platform at Level 3 rather than a managed delivery model." | JUDGMENT | "Level 5 guided-setup automation is not the right fit for hospitals that prefer direct control... or organizations that want a self-configured platform at Level 3 rather than a guided-setup delivery model." | Noun-pair swap throughout. |
| What to Do This Week, item 4 | "Level 3-4 software speeds them up; Level 5 service removes them." | JUDGMENT | "Level 3-4 software speeds them up; Level 5 removes them after a single guided setup session." | "Level 5 service" (reintroduces the retired category noun) removed; mechanism named instead. |
| FAQ 1 (Q+A) | "Managed services deliver Level 4-5 by using a specialist to handle what the AI cannot." | PREMISE-COLLAPSE | "Guided-setup software delivers Level 4-5 by mapping the rules once and letting the system handle what a self-configured tool cannot." | "Using a specialist to handle" (implies human labor) replaced with the guided-setup mechanism. |
| FAQ 2 (Q+A) | "A managed service has a similar calibration period, typically 2-4 scheduling cycles, but the calibration work falls on the specialist rather than the nurse manager." | PREMISE-COLLAPSE | "Guided-setup software has a similar calibration period, typically 2-4 scheduling cycles, but the calibration work is handled by the system after the initial setup session rather than falling on the nurse manager." | Same "specialist" retirement pattern as Posts 1-4/7; this is the 5th confirmed instance across the batch. |
| FAQ 4 (Q+A) | "A managed service callout workflow delivers a pre-ranked shortlist" | TOKEN:callout | "Guided-setup software delivers a pre-ranked shortlist" | Noun swap consistent with `callout` token. |
| Author bio | "an AI-native nurse scheduling service built for Critical Access Hospitals" | TOKEN:self-label | "AI-native nurse scheduling software built for Critical Access Hospitals" | Direct token. |

**Post 7 counts:** Token hits: 8 (`triad` x4, `self-label` x1, `callout` x1; `guided-setup`
framing applied pervasively but mostly paraphrased rather than verbatim-quoted, counted under
PREMISE-COLLAPSE/JUDGMENT). Judgment calls: 9. Gaps: 0 (confirms, does not add to, the
"specialist" retirement pattern already logged in Posts 1, 3, and 4 — 5th and final confirmation
across the batch). Premise-collapse: 9 distinct locations (intro para, the "What Does X Mean"
section, the Level 5 table row itself, the post-table sentence asserting Level 5 "is not a
software model," the "How Is SimpleScheduleAI's Automation Different" full H2 section (3 internal
collapses grouped as such), the honest-limitation sentence, the "Our Take" box, and FAQ 1).

**Title/Slug Recommendation:** No change. The post's title and core 5-level framework are
mode-agnostic; only the Level 5 definition itself required a structural rewrite (not a title
change), since Level 5 remains the most automated tier in either mode, just redefined by
mechanism (one-time guided session + full automation) instead of by labor substitution (a human
specialist).

---

## Cross-Post Observations (Batch H1)

1. **The "specialist" noun is the single most-repeated forbidden construction in this batch,
   confirmed independently in 5 of 7 posts** (Posts 1, 3, 4, and 7 explicitly; Post 2 via "the
   vendor" doing the same work). Every instance implied an ongoing human vendor employee doing
   recurring work — exactly what the `no-it`/`system-maintains` founder rules forbid. The
   dry-run's cross-post observation #2 already flagged this pattern for "our team"/"our scheduling
   team," but "specialist" as a bare noun (no "our" possessive) is a related but distinct
   surface form that a naive regex targeting only "our team"/"our scheduling team" would miss.
   **Recommend:** add `specialist` (as a standalone noun referring to a vendor-side human doing
   recurring scheduling work) to the `no-it` token's trigger pattern in
   `scripts/lib/positioning-rules.mjs`, or add a new dedicated row.

2. **Stale "contact for pricing" placeholders for SSAI's own column, found in Posts 2, 3, and 4.**
   Three of the vendor-comparison tables in this batch still showed "Contact for pricing" for the
   SimpleScheduleAI column, even though the facts dossier's canonical pricing line
   ($1,000/$1,500 flat by roster size) has been public for some time. This is independent of the
   service-vs-software migration — it is a factual-currency bug in the LIVE posts today — but the
   migration pass caught and fixed all 3 instances in staging. **Recommend:** a separate,
   non-migration cleanup pass across all live `vs-` comparison posts to replace any remaining
   "contact for pricing" / "quote-based" self-references with the canonical pricing token.

3. **`product_no_pilot_customers` violation found in Post 4's live source**, independent of
   positioning: the comparison table's "Vendor stat claims" row said "new service in pilot phase."
   SSAI has no pilot customers per founder-flagged memory. Fixed in staging (see Post 4's ledger
   entry); flagging for the live post to be corrected on its own timeline, not gated on this
   migration.

4. **Link-graph dependency: this batch converts 3 of its own most-frequent internal cross-link
   targets** (Post 1 `managed-service-vs-scheduling-software` is retitled; Posts 2 and 3
   `aladtec-vs-managed-service` and `tcp-scheduling-software-vs-managed-service` are retitled).
   Every other post in this batch that links to any of these three by anchor text was updated at
   the ANCHOR TEXT level in this pass (per runbook lesson 9), but the underlying link TARGET in
   every staging file still points at the OLD live slug, since staging copies do not touch live
   URLs. On migration day, all internal links across the full corpus (not just this batch) that
   point to `/blog/managed-service-vs-scheduling-software`, `/blog/aladtec-vs-managed-service`, or
   `/blog/tcp-scheduling-software-vs-managed-service` need their link TARGETS updated to the new
   slugs in the same pass as the 301s are added, or the 301 chain absorbs it (functionally fine for
   users, but wastes a redirect hop and dilutes link equity signals — direct link updates are
   preferred). This is the largest structural dependency in the batch and should be sequenced
   before any other batch's link-graph pass runs, since 3 of this batch's own posts are both
   converted AND are widely-linked targets.

5. **No new registry-row gap beyond what the dry-run already identified.** All positioning
   patterns encountered in this batch were resolvable using the existing `delivery-model-binary`,
   `guided-setup`, `system-maintains`, `self-label`, `triad`, `callout`, `no-it`, and `pricing`/
   `pricing-short` tokens, or the vendor-vs-vendor Option-A retitle pattern. The one new
   observation (item 1 above, the "specialist" noun) is a trigger-pattern refinement to an
   existing token, not a request for a new row.

## Gates result (Batch H1)

- **Facts scan (`checkFacts` from `scripts/lib/facts-rules.mjs`) across all 7 outputs: 0
  violations.** Command: `node --input-type=module` inline script iterating all 7 staging
  file paths through `checkFacts`. Confirmed clean.
- **Leftover sweep** (`we build|we deliver|our team|scheduling team|log the callout with us|
  Thursday delivery|done for you|managed near SSAI|bald "No IT."|live demo|managed service`)
  across all 7 outputs: every hit reviewed individually.
  - All "our team" hits are the canonical CTA link text "Book a call with our team" (registry
    `cta-secondary` token, unchanged in both modes by design) — intentional, not a leftover.
  - "specialist" hits in Posts 1 and 6 are unrelated contexts ("compliance specialist" describing
    a CAH's missing in-house expertise; "software you configure yourself" contrast) — not the
    forbidden vendor-team sense; verified individually, no fix needed.
  - "done for you" hit in Post 7 is inside a quoted critique of vendor marketing claims
    ("the claim that 'the scheduling is done for you' is not [true]") — a competitor-critique
    sentence unchanged from source, not an SSAI self-description; intentional.
  - No hits for "we deliver," "we build," "log the callout with us," "Thursday delivery," "managed
    near SSAI," bald "No IT.", or "live demo" in any of the 7 outputs.
  - **Zero unresolved leftovers. Gate passes clean.**

## Unresolvable / flagged for founder decision

- Post 1's retitle uses a category-vs-category pattern (no vendor name in the title) since the
  runbook's Option-A vendor-vs-vendor pattern does not apply to a post with no named competitor in
  its title. This is a judgment call, not a mechanical rule; founder should confirm the proposed
  title before migration day.
- The 3 retitled posts (1, 2, 3) all need 301s added to `netlify.toml` on migration day; not done
  in this pass since no live files were touched per task instructions.
- Cross-post link-target updates (item 4 above) are explicitly a migration-day action, not a
  staging-copy action, per the task's scope (DO NOT touch `src/`).

