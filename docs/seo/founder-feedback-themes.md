# Founder feedback themes — the final-check file

Every theme here came from founder feedback on a real post. **Process rule
(publish-pipeline.md phase 7): read the draft against this list before flipping
any post live, and fix what fails.** Judgment only; mechanical rules live in
check-blog.

**Keep this file short.** It has to be read in full, in one pass, on every
publish. A theme is one line of rule plus one line of check, with the example in
parentheses. If a new theme duplicates an existing one, sharpen the existing one
instead of adding. If the list ever exceeds ~25 themes, merge the weakest rather
than letting it grow, because an unread checklist catches nothing.

**The way to keep it short is to move rules OUT, not to refuse new ones.**
Anything a script can decide belongs in `scripts/check-blog.mjs` and gets deleted
from here. Already moved: the banned-word list, undefined shorthand, jargon
without a plain-language gloss, the canonical "What to Do This Week" heading, and
T21's system/web jargon rule (retired 2026-08-31, now a mechanical check). This
file is for judgment only. When new founder feedback arrives, ask first whether a
check can decide it; only what needs a human eye lands here.

## Facts and takeaways

**T1. Key Takeaways answer the title's question, nothing else.**
Every bullet earns its place by helping answer the exact question the title
asks. A true, interesting, well-sourced side fact still fails.
(A BLS wage bullet in a "what is a nurse manager" post: "How is KT2 relevant here?")

**T2. Every number justifies its presence to this reader.**
For each figure, say in one sentence why the ICP needs it here. If it answers a
different question, move it there or cut it.
("What is the need of this- median $117,960 in May 2024?")

**T3. State denominators and time units so numbers cannot collide.**
When two figures with different units share a paragraph, name each unit in the
sentence.
("We say 8 to 12 hours per week, and then you are talking about a 4- to 6-week cycle. Are the numbers making sense?")

**T10. One fact, one figure, across the whole corpus.**
For any load-bearing figure, grep the corpus first; reconcile before publishing.
("Have we used this number anywhere else, in other blogs?")

**T20. Under-claiming is a defect too.**
When writing a limitation, verify against the capability inventory that the
product genuinely does not do the adjacent thing. Check overclaims and
underclaims with equal care.
(Said charge concentration was entirely manual; the engine does spread charge nurses across shifts. "We try to keep charge nurse scattered, that doesnt count?")

## Language

**T4. The reader's words, not stat-speak or formal register.**
Read each abstract noun and ask whether a DON says it aloud.
("consumer" for a time cost; "patient safety" where a nurse says "falls" or "med errors")

**T5. Simple sentences. If the founder asks what a passage means, a reader is already lost.**
Any sentence needing two reads gets split. Most-repeated feedback in the project.
Two recurring shapes, both caught again 2026-08-31:
(a) **An abstract noun the reader has to decode.** "The draw is Medicare
reimbursement at 101 percent" — founder: "Do you mean reason by draw?" Name the
thing plainly: hospitals convert BECAUSE Medicare pays them more.
(b) **Three facts in one sentence.** The necessary-provider line packed a
grandfather date, a cannot-be-obtained rule and a 75 percent staff test into one
breath. If a sentence carries more than one fact the reader must retain, split it.
**check-blog already warns at 35 words. Those warnings are the signal, not noise:
every instance the founder later flagged had been flagged by the gate first and
waved through as "quote-bearing". Only a verbatim quote earns that pass.**

**T16. No abstraction without its referent.**
Every claim-bearing noun phrase says, in the same sentence, of what or to what.
The more elegant the phrase, the more likely it fails.
("The goal is a return" — return to what? "Which advisory board?")

**T22. A rule with an exception needs the exception spelled out, not compressed.**
Check: any sentence of the form "X does not count against Y, and it works both
ways" or similar. Say which cases are excluded and which still count, ideally
with a concrete instance. Symmetry phrasing reads as completeness and hides the
carve-out.
("Indian Health Service and Tribal facilities are not counted against non-IHS facilities, and the exclusion runs both ways" — not clear, and it buried that two IHS facilities DO count against each other.)

**T6. Educational posts mention us only as attribution.**
Outside the sanctioned product sections, the brand appears only where a fact
needs its source named. "Our interviews" beats the company name.
("Do we need to mention us in an educational blog?")

**T18. Third person for SimpleScheduleAI in comparisons.**
The product is a subject like any other vendor, not "we" or "ours". Author-voice
"we" for the research itself is fine, as are reviewer quotes and house labels
like Our Take. Comparison posts must still carry "nurse scheduling software" in
the sentence introducing the product (seo-aeo skill, category-line rule 3).
("Should we talk about it in first person? That's not the standard.")

## Structure

**T7. H2s are real standalone queries.**
Would someone type this heading into a search box? Every vague "it" or "this"
fails.
("What Does Texas Require?" — require about what?)

**T9. Match the live posts of the same type.**
Diff against live same-type siblings before writing, not after: which sections
exist, what goes in each, ratings not yes/no cells, competitor images.
("Please redo the blog, learn from live vs blogs on what goes where")

**T24. Never set a test we would fail.**
Any diagnostic question, checklist or "ask your vendor" list you put in front of a
reader is a standard we are implicitly claiming to meet. Before shipping one,
check the capability inventory and answer it about ourselves. If the honest
answer is no or partly, say so in the post; that is more persuasive than the
question was. Watch for the softer version too: a self-check where every item can
only be passed by buying software, which reads as a quiz whose answer key is the
CTA.
("Can you get back to last cycle's schedule as it was published?" — founder: "we
also dont do this. How are we defending this?" We reconstruct it from the change
log; we do not store a frozen copy. The post now says exactly that.)

**T19. Every advantage bullet earns its place for this post's question.**
Read each bullet and name the buying question it answers. A true, code-verified
capability that sits off-topic distracts.
(agency-skipped-on-charge in a software comparison: "is this something we should mention here?")

**T17. Table cells stand alone and differ visibly.**
(a) Read the distinguishing column alone; if two rows say the same thing, put
the real difference in the cell. (b) Read each cell cold; tables are scanned, so
"the same X", "as above" and every backward reference fails.
("what is the difference between 2nd and 3rd option?" then "same nurse-on-duty floor means? same as what?")

**T11. Tone matches structure.**
No blunt declarative immediately after a question H2; question headings get
answered, not lectured at.

**T12. Date honesty.**
No future placeholders. Update dates move only for substantive updates. Landscape
claims ("no federal law requires", "the only vendor that") carry a date
qualifier, but write it as a month, not a timestamp.
("Do we need this date?" — keep the qualifier, drop the machine formatting)

**T23. Clarity outranks the word band.**
The post-type range in check-blog is a WARN and a sanity signal, never a target.
If trimming to reach it would remove an explanation, a defined term, or worked
numbers, keep the writing and let the post run long. Say so when handing over,
rather than cutting quietly. Cut whole sections that do not earn their place;
never cut the connective tissue that tells a reader what you are talking about.
(what-is-a-baylor-shift ran 3,556 against a 2,500 mofu band after three rounds of
clarity fixes: "leave word band, the blog being clear is more important",
founder 2026-08-27. The band itself was left unchanged, so the WARN still fires.)

## Links

**T8. Inline named hyperlinks in body prose, never bracketed reference numbers.**
The Sources section keeps its numbering; the body links words.
("Why are we keeping reference numbers, we should have reference hyperlinks in main blog text.")

**T13. Every named source gets a hyperlink at first mention, including in Key Takeaways.**
A source named in the body but linked only in the Sources list fails.
(NPG 12 named in KT with no link; the Flex Monitoring brief cited in prose with no link)

**T14. Anchor the link on what the destination is about.**
("Why is the hyperlink on medicare cert and not critical access hospitals here?")

**T15. Internal link count matches live siblings.**
Count unique `/blog/` links here and in two or three live same-type posts.
Passing the required-hub gate is not the same as being well linked.
(shipped with 1 where siblings carry 5 to 17, twice)

## How to run the pass

Read the draft once per section above. Two checks are mechanical enough to run
as commands, and both have been missed by eye:

- **Links (T13, T15):** list every named source and confirm a first-mention
  link; count unique `/blog/` links against two live same-type siblings.
- **Table cells (T17):** read the distinguishing column top to bottom, then read
  each cell in isolation.

Note in the publish commit that the themes pass ran. When new founder feedback
arrives, add or sharpen a theme the same session.
