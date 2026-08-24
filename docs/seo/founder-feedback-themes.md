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

## How to run the pass

Read the draft top to bottom once per theme cluster: T1-T3 on the facts and
takeaways, T4-T8 on the language, T9-T12 on structure and corpus fit. Fix
what fails, re-run the mechanical gate if the fixes touched text, and note in
the publish commit message that the themes pass ran.
