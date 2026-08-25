# Founder feedback themes — the final-check file

The general themes of the founder's blog feedback, distilled so future drafts
absorb them before he reads anything. **Process rule (publish-pipeline.md): the
last step before flipping any post live is reading the draft against every
theme below and fixing what fails.** This is a judgment pass; everything
mechanical already lives in check-blog and is not repeated here.

Maintenance: when the founder gives feedback on a live post, add or sharpen a
theme in the same session. Keep each theme short: the pattern, the check
question, one real example. Delete nothing without founder agreement; this file
only works if it accumulates.

## The themes

**T1. Key Takeaways answer the title's question, nothing else.**
Check: does every KT bullet help answer the exact question the title asks?
A true, interesting, well-sourced side fact still fails.
(M7 alternatives: KT described only M7, not the alternatives. What-is-a-nurse-manager: a BLS wage-classification bullet was cut with "How is KT2 relevant here?")

**T2. Every number must justify its presence to this reader.**
Check: for each figure, can you say in one sentence why the ICP needs it right
here? If the number is context for a different question, move it to where that
question is answered, or cut it.
("What is the need of this- median $117,960 in May 2024?"; the $17M funding fact cut from the M7 post as "info not relevant for ICP".)

**T3. State denominators and time units so numbers cannot collide.**
Check: when two figures with different units share a paragraph (per week vs per
cycle, per event vs per shift), is each unit named in the sentence? The
documented unit trap (facts-dossier) is the hard version; the founder catches
the soft version too.
("We say it takes 8 to 12 hours per week, and then you are talking about a 4- to 6-week cycle. Are the numbers making sense?")

**T4. Words the reader uses, never stat-speak or formal register.**
Check: read each abstract noun and ask whether a DON says it out loud.
("consumer" for a time cost, "patient safety" where a nurse says "falls" or
"med errors", "utilized". Prefer the concrete word.)

**T5. Simple sentences; if the founder has to ask what a passage means, a reader is already lost.**
Check: any sentence that takes two reads, any passage the founder would quote
back with "make it easy to understand". Multi-clause reasoning gets split into
steps. This has been the single most repeated feedback across sessions.

**T6. Educational posts mention us only as attribution, never as a pitch.**
Check: outside the sanctioned product sections (How SSAI Helps, CTA, Our Take),
the brand appears only where a fact needs its source named, and "our
interviews" beats the company name.
("Do we need to mention us in an educational blog?" on the interviews paragraph; brand name and "before we built SimpleScheduleAI" removed, attribution kept.)

**T7. H2s are real standalone queries; no vagueness, no ambiguity.**
Check: would a person type this heading into a search box and expect this
section? "What Does Texas Require?" failed (require about what?). Every "it"
or "this" in a heading fails.

**T8. Inline named hyperlinks in body text, never bracketed reference numbers.**
Sources section keeps its numbers; body prose links words.
("Why are we keeping reference numbers, we should have reference hyperlinks in main blog text.")

**T9. Structure and depth match the live posts of the same type.**
Check: diff against live same-type siblings before writing, not after. Which
sections exist, what goes in each, comparison tables carry ratings not
yes/no cells, competitor sections carry images.
("Please redo the blog, learn from live vs blogs on what goes where, the structure, etc.")

**T10. Consistency across the corpus: one fact, one figure, everywhere.**
Check: for any load-bearing figure, grep the live corpus; if another post
states it differently, reconcile before publishing.
("Have we used this number anywhere else, in other blogs? I dont remember." Two figures in the nurse-manager draft contradicted the canonical time-breakdown post.)

**T11. Tone details next to structure: a blunt sentence beside a question H2 reads wrong.**
Check: question headings answered respectfully, no "Worth saying plainly"
style bluntness right after a question; punctuation of question H2s correct.

**T12. Date honesty: publish and update dates reflect reality.**
Check: no future placeholders; an update date only moves when the update is
substantive; if a post is edited too often, the founder prefers the update
date left alone.

**T13. Every named source gets its hyperlink at first mention, including in Key Takeaways.**
Check: walk each named document, standard, brief, or study top to bottom. Is
the first mention linked? Key Takeaways are not exempt, and a source named in
the body but only linked in the Sources list fails.
(Joint Commission post: NPG 12 named in KT with no link; the Flex Monitoring brief cited in prose with no link. Both are checklist items, both were missed.)

**T14. Anchor the link on the thing the destination is about.**
Check: for each internal link, does the anchor text name what the target page
covers? A link about critical access hospitals belongs on "critical access
hospitals", not on the nearest adjacent noun.
("Why is the hyperlink on medicare cert and not critical access hospitals here?")

**T15. Internal link count matches the live siblings, not just the required hubs.**
Check: count unique `/blog/` links and compare against two or three live posts
of the same type before publishing. Passing the required-hub gate is not the
same as being well linked.
(Joint Commission post shipped with 1 blog-to-blog link where siblings carry 5 to 9.)

**T16. No abstraction without its referent, especially the interesting ones.**
Check: every noun phrase making a claim ("a return", "the operative
requirement", "the context most coverage leaves out") must say, in the same
sentence, of what or to what. This is T5's cousin and the founder catches it
constantly; the vaguer and more elegant the phrase, the more likely it fails.
("The goal is a return" — return to what? "the operative requirement" — for what? "Which advisory board?")

**T17. Every table cell stands alone: differs visibly, and borrows nothing.**
Two failures, same table, one review apart.
Check A: read only the distinguishing column. If two rows say roughly the same
thing, put the actual distinguishing fact in the cell rather than a label that
implies one.
Check B: read each cell cold, as if it were the only one on screen. Tables are
scanned, not read top to bottom, so "the same X", "as above", "that floor" and
every other backward reference fails. Restate the thing, even at the cost of
repetition.
("In the table, what is the difference between 2nd and 3rd option?" then, after the rewrite, "same nurse-on-duty floor means? same as what?" The cell now names the rule outright.)

**T18. Third person for SimpleScheduleAI outside the mandatory category line.**
Check: in a comparison post, the product is a subject like any other vendor
("SimpleScheduleAI reads who is cleared from the roster"), not "we" or "ours".
The one fixed exception is the required BOFU category line, which contains "we
build and operate ourselves" verbatim. Author-voice "we" for the research
itself ("we found no published price") is fine, and so are reviewer quotes and
house labels like Our Take.
("Should we talk about it in first person? That's not the standard.")

**T19. Every advantage bullet must earn its place for THIS post's question.**
Check: read each bullet and ask what buying question it answers. A true,
code-verified capability that sits off-topic distracts and raises questions
the post is not answering.
(An agency-skipped-on-charge-shifts bullet in a software comparison: "is this something we should mention here?" Cut.)

**T20. Under-claiming is a defect too.**
Check: when writing a limitation, confirm the product genuinely does not do the
adjacent thing. Ask the same "verify against the inventory" question you ask of
overclaims, in the other direction.
(The post said watching charge concentration was entirely manual. The engine does spread charge-qualified nurses across shifts; what it does not do is count each nurse's charge total over time. Founder caught it: "We try to keep charge nurse scattered, that doesn't count?")

**T21. No system or web jargon in reader-facing prose.**
Check: would a DON know this term? Status codes, URL behaviour, and internal
vocabulary get translated into what the reader would observe.
("their pricing URL returns a 404" became "the pricing page is missing entirely"; "Our ICP dont know 404".)

## How to run the pass

Read the draft top to bottom once per theme cluster: T1-T3 on the facts and
takeaways, T4-T8 and T16 on the language, T9-T12 and T17 on structure and
corpus fit, T13-T15 on links. Fix what fails, re-run the mechanical gate if
the fixes touched text, and note in the publish commit message that the themes
pass ran.

Two of these are mechanical enough to run as commands, and both were missed by
eye on the first live post:

- **Links (T13, T15):** list every named source and confirm a first-mention
  link; then count unique `/blog/` links in the draft and in two live
  same-type siblings, and match the range.
- **Table rows (T17):** read the distinguishing column alone, top to bottom.
