<!-- Seeded 2026-10-30 from the main session's running list of edits to live posts (2026-10-19 to 2026-10-29). Each section maps to commits in git history; `npm run change-log` reads the commits, this file keeps the per-file detail. State, not process. -->

# Every change to live blog posts, 2026-10-19

Commits: 4d48e198 (Aladtec corrections, 23 posts) and 0443cfd3 (#7 publish + 2 inbound links).
Exact diffs: `git show 4d48e198 -- src/data/post` and `git show 0443cfd3 -- src/data/post`.

## A. Inbound links added for the new #7 post (2 live posts)

- nurse-scheduling-software-reliability-crashes.md, end of the paragraph at L71, added:
  "Being logged out partway through a task is another everyday problem, and our guide to [why a nurse scheduling app keeps logging you out](/blog/nurse-scheduling-app-login-problems) covers who sets that timer."
- best-nurse-scheduling-app.md, table row: "Adoption fails when nurses cannot see schedules on their phones" became
  "Adoption fails when nurses cannot see schedules on their phones, or [keep getting logged out](/blog/nurse-scheduling-app-login-problems)" (Prettier re-spaced the table; whitespace only otherwise).

## B. Edits made directly by the main session (not in the writer logs below)

- best-tcp-alternative-for-cah.md and tcp-scheduling-software-vs-managed-service.md: every "Humanity Scheduling" became "Humanity Schedule" (TCP's product name), 7 and 10 places. best-tcp L230 "TimeClock Plus" became "TimeClock+" to match the rest of that post.
- aladtec-alternatives.md L67: "an administrator found the first setup hard to figure out" became "an administrator found the administrator side complicated to figure out" (matches the review quote).
- best-nurse-scheduling-software-texas.md L523: "or Aladtec (self-serve; confirm which overtime rules it handles)" became "or Aladtec, if TCP confirms it supports hospital nursing (self-serve; confirm which overtime rules it handles)".
- best-scheduling-software-25-bed-hospital.md L35: "NurseGrid Manager adds a communication and visibility layer for 25-bed rosters, not a full clinical scheduling system." became "NurseGrid Manager is a self-serve scheduler for small teams, and its own pages name critical access hospitals."
- best-scheduling-software-25-bed-hospital.md L445: "NurseGrid, When I Work, and Homebase are communication and visibility layers, not clinical scheduling systems." became "NurseGrid Manager is a self-serve scheduler the manager still has to run, and When I Work and Homebase are general workforce tools, not clinical scheduling systems."

## C. The four original Aladtec/TCP posts (writer log, both rounds)


Four live posts, all still `draft: false`, nothing committed. Covers round 1 (positioning fix + new H2) and round 2 (fact-check + proofread). updateDate moved to 2026-10-19 on all four.

## src/data/post/aladtec-alternatives.md

- Opening paragraph. Old: "Your IT contractor configured Aladtec around the EMS dispatch workflow... Aladtec was built for fire and EMS dispatch. No amount of configuration turns it into hospital nursing software." New: "Your nurse manager has to find a qualified replacement for a 2 AM callout and pull together CMS §485.635 staffing records at survey time. TCP now markets Aladtec to fire and EMS agencies, not hospitals. So the question is whether a tool sold to fire and EMS agencies fits a hospital nursing unit."
- Old: "This guide compares 6 alternatives for a 25-bed CAH that needs hospital-nursing fit, not a better version of an EMS-shaped tool." New: "This guide compares six alternatives for a 25-bed CAH that needs software built around hospital nursing."
- Paragraph that introduces Aladtec. Old: "built for emergency services organizations and small healthcare teams... across fire, EMS, law enforcement, and hospital settings... its hospital-nursing deployment is a more recent expansion." New: "a scheduling platform for 24/7 shift work." Then TCP's headline quoted ("Public safety scheduling software built for 24/7 agencies."), then "names 'fire, EMS, law enforcement, and corrections agencies' as the ones it helps." Ends: "Aladtec once had a healthcare page that named hospitals and nurses. Its current pages do not mention hospitals. The dates are in the section [Does Aladtec Still Market to Hospitals?] further down."
- Why Hospitals Switch, first paragraph. Old: "because the platform's heritage is in public-safety scheduling... CAH nurse managers report... the two most common specific complaints from hospital users." New: "Hospitals look at Aladtec alternatives when the tool does not fit how hospital nursing works. Two public Capterra reviews point to friction worth testing in a demo. A nurse manager found routine schedule edits took too many clicks, and an administrator found the first setup hard to figure out."
- Image alt text. Old: "Aladtec by TCP healthcare and public safety scheduling platform". New: "Aladtec by TCP public safety scheduling platform".
- Ratings paragraph. Old: "...but the Capterra reviewers skew heavily toward fire, EMS, and law enforcement users. The minority of negative reviews from hospital users cluster around two recurring themes..." New: "The overall ratings are strong. The two older reviews below raise issues worth testing in a CAH demo."
- Sample note. Old: "most recent hospital-context reviews... several years old, and the recent Capterra reviews skew toward fire, EMS... documented support response-time SLAs, especially given the post-TCP-acquisition timeline." New: "the most recent hospital-nursing review we found on Capterra is from October 2020. CAHs evaluating Aladtec should ask TCP for a current hospital-nursing reference at CAH scale and for written support response times."
- Demo questions. Old: one 44-word sentence listing three things to ask. New: "three questions are worth asking in the demo", then three short questions (configuration as the roster changes, CMS §485.635 documentation, overtime check before callout calls).
- NEW H2 "Does Aladtec Still Market to Hospitals?" (214 words, added to the ToC). It says: no, as of October 2026. TCP's Aladtec page names fire, EMS, law enforcement and corrections agencies [7]. TCP's healthcare page links Humanity Schedule and TimeClock Plus for healthcare teams, and Aladtec appears there only for EMS agencies [8]. The 2021 release quotes both sides: Aladtec "specifically developed for Public Safety departments including EMS, Fire, Law Enforcement, Healthcare, and Dispatch", and the CEO buying Humanity "for the healthcare and retail industries" and adding Aladtec to "extend that combination to the public safety industry" [9]. Healthcare page last captured January 2022, and healthcare gone from the homepage menu between February and April 2022 [10]. It also says plainly that nothing TCP has published shows hospital customers losing support. It ends with three written questions for a TCP rep before renewal.
- Comparison table cell. Old: "Public safety, EMS, fire, small healthcare". New: "Fire, EMS, law enforcement, corrections".
- TCP Scheduling "Best for": added "This applies only if TCP confirms it supports hospital nursing."
- TCP Scheduling verdict: added ", if TCP confirms it supports hospital nursing."
- Deputy paragraph. Old: "The documented healthcare feature set is narrower than Aladtec's clinical-specific capability." New: "Deputy's healthcare page names hospitals, which Aladtec's current pages do not. The limitations below cover which compliance features that page does not describe."
- When to Stay. Added: "Before you renew, ask TCP the [three healthcare questions above], because TCP now markets Aladtec to public safety agencies."
- Control vs overhead. Old: "requires her to maintain" / "building the schedule herself". New: "requires the manager to maintain" / "building the schedule from scratch".
- Larger-hospital line: added ", if TCP confirms it supports hospital nursing." after "Aladtec's control model may be preferable".
- Sources: added [7] TCP Aladtec page, [8] TCP healthcare page, [9] TCP's 2021 acquisition release, and [10] three Wayback captures (Jan 27, Feb 2 and Apr 8, 2022), all verified 2026-10-19. Body markers [7] to [10] are now in the new H2.
- FAQ "Is Aladtec HIPAA compliant?" Old: "Aladtec is designed to be HIPAA compliant... Its documentation and business associate agreement (BAA) cover the scheduling data..." New: "TCP's public Aladtec and security pages do not address HIPAA or business associate agreements. TCP's security page lists a SOC 3 report for Aladtec, a public summary of its security controls. Before you sign, ask TCP for its HIPAA documentation and whether it will sign a business associate agreement (BAA) for your hospital."

## src/data/post/aladtec-vs-managed-service.md

- Excerpt. Old: "Aladtec gives a nurse manager..." New: "Aladtec, which TCP now markets to public safety agencies, gives a nurse manager..."
- Key Takeaway 1. Old: "Aladtec is a scheduling software platform." New: "...platform, and TCP now markets it to public safety agencies rather than hospitals."
- What Aladtec is. Old: "originally built for emergency services and expanded to healthcare." New: "built for emergency services. TCP's Aladtec page now names 'fire, EMS, law enforcement, and corrections agencies' and does not mention hospitals. Aladtec's site had a healthcare page naming hospitals and nurses until early 2022."
- Old: "Most general-purpose scheduling platforms that were not built specifically for acute hospital care share them." New: "Other scheduling platforms not built for acute hospital care can share them."
- When Is Aladtec the Right Choice: added a paragraph. "Check one thing before choosing Aladtec for a nursing unit. As of October 2026, TCP markets Aladtec to public safety agencies. TCP's healthcare page links Humanity Schedule and TimeClock Plus for healthcare teams. Aladtec appears there only for EMS agencies. Ask TCP in writing which product it would sell and support for hospital nursing."
- What to Do step 4. Old: "Request a pricing comparison from Aladtec and SimpleScheduleAI. Neither publishes pricing publicly. Get quotes from both..." New: "Compare an Aladtec quote with SimpleScheduleAI's listed pricing. Aladtec does not publish its pricing, so ask TCP for a quote. SimpleScheduleAI's flat monthly pricing is listed in the [cost comparison above]."
- Pronouns: no she/her found in this file.

## src/data/post/best-tcp-alternative-for-cah.md

- Intro. Old: "Your CAH probably bought one of them, and your nurse manager is being asked to make it cover the jobs the other two were built for. The right TCP alternative depends on..." New: "If your CAH runs one of them, the right TCP alternative depends on which gap you are trying to close. The gap might be unified time and attendance, deeper scheduling, or a tool built for hospital nursing at small scale."
- Key Takeaway. Old: "Aladtec (healthcare and public safety scheduling)". New: "Aladtec (scheduling that TCP markets to public safety agencies)".
- What Is TCP TimeClock+. Old: "Aladtec (designed for healthcare and public safety scheduling)". New: "Aladtec (marketed to fire, EMS, law enforcement and corrections agencies)".
- Pronouns. Old: "stays on her plate" / "what does she do manually?" / "at her loaded rate". New: "stays with the manager" / "what does the manager do by hand?" / "at their loaded rate".
- Aladtec image alt text: same fix as aladtec-alternatives.
- Aladtec section. Old: "designed specifically for healthcare and public safety scheduling... too basic for healthcare-specific needs, Aladtec by TCP is the purpose-built TCP alternative." New: "TCP's Aladtec page describes it as scheduling for 'fire, EMS, law enforcement, and corrections agencies,' and it does not name hospitals (link to the new H2)." Second paragraph: "Aladtec is TCP's scheduling-first product. TCP's healthcare page links Humanity Schedule and TimeClock Plus for healthcare teams. Aladtec appears there only for EMS agencies." Round 2 removed the duplicate "ask TCP which product it would propose" line, because the verdict now covers it.
- Best for. Old: "designed specifically for healthcare and EMS operations". New: "scheduling built for 24/7 shift work, such as a hospital-run EMS service, rather than time and attendance."
- Advantages. Old: "Designed for healthcare and public safety scheduling..." / "documented healthcare workflows". New: "Built as a scheduling product for 24/7 shift work..." / "Skills and certifications with expiration and renewal dates, documented on Aladtec's compliance page".
- Verdict. Old: "Worth evaluating if you need a scheduling-first tool and prefer staying with TCP Software." New: "Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing."
- FAQ "same product as Aladtec?". Old: "designed specifically for healthcare and public safety operations". New: "that TCP markets to fire, EMS, law enforcement and corrections agencies".
- FAQ "ShiftWizard or Aladtec?". Old: "designed for healthcare and public safety scheduling... need healthcare-specific scheduling depth, Aladtec by TCP is worth evaluating." New: "marketed to public safety agencies... Ask for a current hospital reference at your scale... ask TCP whether it would propose Aladtec or Humanity Schedule for a hospital nursing unit."

## src/data/post/tcp-scheduling-software-vs-managed-service.md

- Key Takeaway and FAQ. Old: "Aladtec (healthcare and public safety scheduling...)". New: "Aladtec (scheduling that TCP markets to public safety agencies...)".
- Parent-company paragraph. Old: "[Aladtec](/blog/aladtec-alternatives) for healthcare and public safety scheduling, acquired in 2021." New: "Aladtec, acquired in 2021. TCP positions Aladtec for public safety agencies ([does Aladtec still market to hospitals?](link to new H2))."
- Pronouns. Old: "for her" (Key Takeaway, line 51, decision line) / "her scheduling needs" / "Her weekly scheduling time... she never touches" / "a platform she configures... on her behalf... her constraints... her workload" / "She retains final authority... handled for her" / "she applies the constraint logic" / "her time tracking approvals" / "do it herself". New: they/them/the manager. The callout line is now "The platform shows who is available. The manager then checks each name for overtime and credentials by hand."

## Not changed (flag)

- "Humanity Scheduling" and "TimeClock+" still appear elsewhere in these posts as the product names, including titles, H2s and ToC anchors. Only the sentences about TCP's healthcare page and the new H2 now use "Humanity Schedule" and "TimeClock Plus". Renaming across the posts would break anchors, so that needs a separate decision.

## D. Batch A: 9 alternatives posts (writer log, both rounds)


## deputy-alternatives-healthcare.md

- OLD: - For hospitals that want self-serve healthcare scheduling software, Aladtec provides the strongest small-roster alternative with meaningful credential and coverage tracking.
  NEW: - For hospitals that want to stay on self-serve software, Aladtec offers certification and coverage tracking. Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies. It is worth evaluating only if TCP confirms it would sell and support it for hospital nursing.

- OLD: SimpleScheduleAI and Aladtec are the only options in this list with documented healthcare-specific scheduling capabilities. When I Work
  NEW: SimpleScheduleAI is built for hospital nurse scheduling. Aladtec is a public safety scheduling tool that also tracks certifications. When I Work

- OLD: SimpleScheduleAI and Aladtec address the compliance and credential gaps that cause hospitals to leave Deputy.
  NEW: SimpleScheduleAI addresses the compliance gaps that cause hospitals to leave Deputy. Aladtec adds certification tracking and minimum staffing rules, but TCP markets it to public safety agencies rather than hospitals.

- OLD: | You want to stay self-serve but need healthcare credential rules           | Aladtec, the most natural upgrade path from Deputy                    |
  NEW: | You want to stay self-serve and need certification tracking | Aladtec, if TCP confirms it will support hospital nursing |

- OLD: alt="Aladtec scheduling software for small hospitals and healthcare organizations"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: Aladtec is the most natural upgrade path from Deputy for small hospitals that want to stay on self-serve software but need healthcare-specific credential tracking and coverage rules. It is more expensive than Deputy but significantly less expensive than [SmartLinx](/blog/smartlinx-alternatives) or [QGenda](/blog/qgenda-alternatives), and it offers a healthcare-oriented scheduling model that Deputy does not.
  NEW: Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies. TCP markets a different product, Humanity Schedule, to healthcare. Aladtec does store skills and certifications with expiration dates, and it supports minimum staffing rules. It is more expensive than Deputy but significantly less expensive than [SmartLinx](/blog/smartlinx-alternatives) or [QGenda](/blog/qgenda-alternatives).

- OLD: **Best for:** Small hospitals that deployed Deputy for its low cost and ease of use but need credential tracking, healthcare-specific scheduling rules, and a minimum staffing enforcement model that Deputy does not provide.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, that outgrew Deputy and need certification tracking and minimum staffing rules.

- OLD: **Verdict:** The best self-serve upgrade from Deputy for small hospital nurse scheduling. Aladtec provides the healthcare credential and coverage logic that Deputy is missing, without the implementation complexity of SmartLinx or QGenda.
  NEW: **Verdict:** A capable self-serve scheduler with certification tracking and coverage rules, without the implementation complexity of SmartLinx or QGenda. Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

- OLD: 5. **If you want to stay on self-serve software, request an Aladtec trial.** Deploy Aladtec in parallel
  NEW: 5. **If you want to stay on self-serve software, ask TCP whether it will support Aladtec for hospital nursing.** If it will, request a trial and deploy Aladtec in parallel

- OLD: Aladtec is the better alternative for hospitals that want to remain on self-serve software and have a nurse manager who will invest in configuration and maintenance.
  NEW: Aladtec suits hospitals that want to remain on self-serve software and have a nurse manager who will invest in configuration and maintenance. Confirm first that TCP will sell and support it for hospital nursing.

- OLD:  Both address the healthcare compliance gaps that Deputy does not.
  NEW: (deleted)

- OLD: updateDate: 2026-05-09T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## shiftwizard-alternatives.md

- OLD: Scheduling / Aladtec (self-serve, public-safety heritage with hospital expansion)
  NEW: Scheduling / Aladtec (self-serve, marketed to public safety agencies)

- OLD: For a CAH staying on a self-serve platform, TCP/Aladtec is the closest healthcare-specific alternative at comparable cost and setup time.
  NEW: For a CAH staying on a self-serve platform, TCP/Aladtec offers comparable cost and setup time, but it is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

- OLD: >Public safety, EMS, small hospital self-serve<
  NEW: >Public safety agencies (fire, EMS, law enforcement)<

- OLD: | You want to stay on self-serve software but need healthcare credential handling                                  | TCP Scheduling (Aladtec), 4.5/5 across 94 G2 reviews                       |
  NEW: | You want to stay on self-serve software and need certification tracking | TCP Scheduling (Aladtec), if TCP confirms it will support hospital nursing |

- OLD: alt="Aladtec by TCP healthcare and public safety scheduling platform"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: TCP Scheduling Software (formerly Aladtec, acquired by TCP Software in 2021) holds 4.5/5 across 94 G2 reviews and 4.6/5 across 17 Capterra reviews (Verified 2026-07-15); small Capterra sample, larger G2 sample. The platform covers shift management, time and attendance, overtime tracking, certification tracking, and reporting across fire, EMS, law enforcement, and hospital settings. The product's heritage is in 24/7 shift-work environments; its hospital-nursing deployment is a more recent expansion of the original use case.
  NEW: Aladtec, now sold by TCP Software, holds 4.5/5 across 94 G2 reviews and 4.6/5 across 17 Capterra reviews (Verified 2026-07-15); small Capterra sample, larger G2 sample. The platform covers shift management, time and attendance, overtime tracking, certification tracking, and reporting. TCP Software markets Aladtec to fire, EMS, law enforcement and corrections agencies, and markets a different product, Humanity Schedule, to healthcare.

- OLD: **Best for:** CAHs with a designated scheduling coordinator or administrator who has time to configure and maintain a self-serve system and can sustain 4-6 hours of weekly scheduling work.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, with a scheduling coordinator who can sustain 4-6 hours of weekly scheduling work.

- OLD: **Verdict:** A reasonable self-serve alternative for a CAH that wants direct platform control and has the administrative bandwidth to configure and maintain the system.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it suits a CAH that wants direct platform control and has the bandwidth to configure and maintain the system.

- OLD: Both are self-serve hospital scheduling platforms with overlapping feature sets. ShiftWizard is built specifically for hospital nursing; TCP/Aladtec has a deeper history in 24/7 shift-work environments including EMS and law enforcement, with a more recent expansion into hospital settings.
  NEW: Both are self-serve scheduling platforms with overlapping feature sets. ShiftWizard is built specifically for hospital nursing. TCP markets Aladtec to public safety agencies, so ask TCP to confirm it will support Aladtec for hospital nursing before shortlisting it.

- OLD: updateDate: 2026-05-07T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## qgenda-alternatives.md

- OLD: /Aladtec (self-serve, healthcare and EMS focus)
  NEW: /Aladtec (self-serve, marketed to public safety agencies)

- OLD: For lower cost with healthcare scheduling depth and faster setup, TCP/Aladtec is the common starting point.
  NEW: For lower cost and faster setup, TCP/Aladtec is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

- OLD: ShiftWizard is the strongest self-serve hospital-nursing fit, TCP/Aladtec is the lower-cost faster-setup starting point, and SimpleScheduleAI handles
  NEW: ShiftWizard is the strongest self-serve hospital-nursing fit. TCP/Aladtec costs less and sets up faster, if TCP will support it for hospital nursing. SimpleScheduleAI handles

- OLD: >Public safety, EMS, fire, small healthcare<
  NEW: >Public safety agencies (fire, EMS, law enforcement)<

- OLD: Aladtec covers healthcare and public safety scheduling at a lower cost and faster setup than QGenda.
  NEW: Aladtec is a public safety scheduling tool with lower cost and faster setup than QGenda.

- OLD: alt="Aladtec by TCP healthcare and public safety scheduling platform"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: The platform's documented customer base skews toward fire, EMS, law enforcement, and security users; its hospital-nursing deployment is a more recent expansion of the original use case ([tcpsoftware.com](https://www.tcpsoftware.com)).
  NEW: TCP Software markets Aladtec to fire, EMS, law enforcement and corrections agencies, and markets a different product, Humanity Schedule, to healthcare ([tcpsoftware.com](https://www.tcpsoftware.com)).

- OLD: For a CAH coming off QGenda, TCP/Aladtec's pricing tier and faster setup may be a fit.
  NEW: For a CAH coming off QGenda, Aladtec's pricing tier and faster setup may appeal.

- OLD: Ask the vendor for current named support contacts, response-time SLA, and a recent hospital-nursing reference customer at CAH scale.
  NEW: Ask the vendor first whether TCP will sell and support Aladtec for hospital nursing. Then ask for current named support contacts, response-time SLA, and a recent hospital-nursing reference customer at CAH scale.

- OLD: **Best for:** CAHs with a scheduling coordinator or administrator who has time to configure and maintain a self-serve system and can absorb 4-6 hours of weekly scheduling administration.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, with a coordinator who can absorb 4-6 hours of weekly scheduling administration.

- OLD: - Used in CAH and EMS settings; lower cost than QGenda with faster implementation at 2-4 weeks
  NEW: - Lower cost than QGenda with faster implementation at 2-4 weeks

- OLD: - Pre-built templates for common small-hospital shift patterns
  NEW: - Templates for rotating 24/7 shift patterns

- OLD: **Verdict:** A meaningful cost and complexity reduction from QGenda for CAHs that still want a self-serve platform and have bandwidth for ongoing configuration.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it is a meaningful cost and complexity reduction from QGenda for CAHs that still want a self-serve platform and have bandwidth for ongoing configuration.

- OLD: updateDate: 2026-08-09T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## schedule360-alternatives.md

- OLD: TCP/Aladtec (self-serve, healthcare and EMS focus)
  NEW: TCP/Aladtec (self-serve, marketed to public safety agencies)

- OLD: TCP/Aladtec is the lower-cost faster-setup starting point.
  NEW: TCP/Aladtec costs less and sets up faster, if TCP will support it for hospital nursing.

- OLD: >Public safety, EMS, fire, small healthcare<
  NEW: >Public safety agencies (fire, EMS, law enforcement)<

- OLD: Aladtec covers healthcare and public safety at a lower cost with faster setup.
  NEW: Aladtec is a public safety scheduling tool with a lower cost and faster setup.

- OLD: alt="Aladtec by TCP healthcare and public safety scheduling platform"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: The platform's documented customer base skews toward fire, EMS, law enforcement, and security users; its hospital-nursing deployment is a more recent expansion of the original use case ([tcpsoftware.com](https://www.tcpsoftware.com)).
  NEW: TCP Software markets Aladtec to fire, EMS, law enforcement and corrections agencies, and markets a different product, Humanity Schedule, to healthcare ([tcpsoftware.com](https://www.tcpsoftware.com)).

- OLD: For a CAH coming off Schedule360, TCP/Aladtec's lower price point and faster setup may be a fit.
  NEW: For a CAH coming off Schedule360, Aladtec's lower price point and faster setup may appeal.

- OLD: Ask the vendor for current named support contacts, a response-time SLA, and a recent hospital-nursing reference customer at CAH scale.
  NEW: Ask the vendor first whether TCP will sell and support Aladtec for hospital nursing. Then ask for current named support contacts, a response-time SLA, and a recent hospital-nursing reference customer at CAH scale.

- OLD: **Best for:** CAHs with a scheduling coordinator or administrator who has the bandwidth to configure and maintain a self-serve system and can absorb 4 to 6 hours of weekly scheduling administration.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, with a coordinator who can absorb 4 to 6 hours of weekly scheduling administration.

- OLD: - Used in CAH and EMS settings; lower cost than enterprise healthcare platforms with faster implementation at 2 to 4 weeks
  NEW: - Lower cost than enterprise healthcare platforms with faster implementation at 2 to 4 weeks

- OLD: - Pre-built templates for common small-hospital shift patterns
  NEW: - Templates for rotating 24/7 shift patterns

- OLD: **Verdict:** A meaningful cost and setup-time reduction from a broad healthcare platform for CAHs that still want a self-serve tool and have bandwidth for ongoing configuration.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it is a meaningful cost and setup-time reduction from a broad healthcare platform for CAHs that still want a self-serve tool and have bandwidth for ongoing configuration.

- OLD: updateDate: 2026-06-04T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## onshift-alternatives.md

- OLD: - For hospitals that want self-serve software, Aladtec is the smaller-roster option with direct-outreach callout management, and SmartLinx is the path
  NEW: - For hospitals that want self-serve software, Aladtec offers direct-outreach callout management, but it is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. SmartLinx is the path

- OLD: >Public safety, EMS, small healthcare rosters<
  NEW: >Public safety agencies (fire, EMS, law enforcement)<

- OLD: alt="Aladtec by TCP scheduling software for small hospitals and emergency services"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: Its heritage is in 24/7 public-safety shift work, fire, EMS, and law enforcement, with a more recent expansion into small healthcare rosters.
  NEW: TCP Software markets Aladtec to fire, EMS, law enforcement and corrections agencies, and markets a different product, Humanity Schedule, to healthcare.

- OLD: **Best for:** Small hospitals switching from OnShift mainly because the open-shift posting model is too slow for acute care coverage gaps, and where a self-serve tool with direct-outreach callout management is an acceptable operating model.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, that are leaving OnShift because open-shift posting is too slow for acute care coverage gaps.

- OLD: **Verdict:** A reasonable self-serve alternative for hospitals leaving OnShift because of callout speed, where the direct-outreach model fits and the nurse manager has capacity for configuration maintenance.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it is a reasonable self-serve alternative for hospitals leaving OnShift because of callout speed, where the nurse manager has capacity for configuration maintenance.

- OLD: updateDate: 2026-05-23T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## smartlinx-alternatives.md

- OLD: is the right option for small rosters leaving SmartLinx because of cost-to-value mismatch.
  NEW: suits small rosters leaving SmartLinx because of cost-to-value mismatch. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

- OLD: alt="Aladtec scheduling software for small hospitals and emergency services"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: Its 24/7 coverage model, availability tracking, and minimum staffing rules handle most of what a small hospital needs without the implementation complexity of SmartLinx.
  NEW: Its 24/7 coverage model, availability tracking, and minimum staffing rules avoid the implementation complexity of SmartLinx. Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies. TCP markets a different product, Humanity Schedule, to healthcare.

- OLD: **Best for:** Small hospitals that want to move from SmartLinx to a simpler self-serve tool with lower ongoing maintenance burden, and whose primary scheduling requirements are coverage scheduling, availability tracking, and shift communication.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, that want a simpler self-serve tool for coverage scheduling, availability tracking, and shift communication.

- OLD: - Significantly faster to configure than SmartLinx; most small hospitals are operational within 4-6 weeks
  NEW: - Significantly faster to configure than SmartLinx; setup runs 4-6 weeks

- OLD: - Mobile app with strong nurse adoption reduces phone-based communication
  NEW: - Mobile app reduces phone-based communication

- OLD: **Verdict:** Aladtec is the right downgrade path from SmartLinx for hospitals that are paying for feature depth they do not use and want a simpler system with lower ongoing maintenance.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it is a simpler downgrade path for hospitals paying for SmartLinx feature depth they do not use.

- OLD: For small hospitals where the missing features were not being used in SmartLinx anyway, the tradeoff is favorable.
  NEW: For small hospitals where the missing features were not being used in SmartLinx anyway, the tradeoff can be favorable, provided TCP confirms it will support Aladtec for hospital nursing.

- OLD: updateDate: 2026-05-08T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## nursegrid-alternatives.md

- OLD: >Public safety, EMS, small healthcare<
  NEW: >Public safety agencies (fire, EMS, law enforcement)<

- OLD: alt="TCP Scheduling Aladtec workforce management platform for healthcare and public safety"
  NEW: alt="TCP Software TimeClock Plus time tracking software homepage"

- OLD: The documented customer base on Capterra skews toward fire, EMS, and law enforcement, so the nurse-facing experience is more limited than NurseGrid's, which may frustrate staff who adopted NurseGrid for its mobile app.
  NEW: Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies. TCP markets a different product, Humanity Schedule, to healthcare. Its nurse-facing experience is also more limited than NurseGrid's, which may frustrate staff who adopted NurseGrid for its mobile app.

- OLD: **Best for:** CAHs switching from NurseGrid specifically for manager-side scheduling and compliance features, where a self-serve model is still preferred and a 2-4 week setup is acceptable.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, that need manager-side scheduling NurseGrid lacks and can accept a 2-4 week setup.

- OLD: - Strong overall public ratings across a moderate G2 sample (97 reviews)
  NEW: - Strong overall public ratings across a moderate G2 sample (94 reviews)

- OLD: **Verdict:** A reasonable self-serve path for a CAH that needs manager-side scheduling capability NurseGrid does not provide and can absorb a 2-4 week setup.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it is a reasonable self-serve path for a CAH that needs manager-side scheduling NurseGrid does not provide.

- OLD: TCP Scheduling adds manager-side scheduling capability with a 2-4 week setup.
  NEW: TCP Scheduling adds manager-side scheduling capability with a 2-4 week setup, if TCP confirms it will support Aladtec for hospital nursing.

- OLD: updateDate: 2026-05-22T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z

## m7-health-alternatives.md

- OLD: alt="Aladtec by TCP healthcare and public safety scheduling platform"
  NEW: alt="Aladtec public safety scheduling software homepage"

- updateDate unchanged (alt-text-only change)

## ukg-alternatives-small-hospitals.md

- OLD: Aladtec goes live in 2-4 weeks with minimal IT involvement and is a common replacement.
  NEW: Aladtec goes live in 2-4 weeks with minimal IT involvement, if TCP confirms it will support Aladtec for hospital nursing.

- OLD: Aladtec goes live in 2 to 4 weeks with minimal IT and is a common replacement, SmartLinx is
  NEW: Aladtec goes live in 2 to 4 weeks with minimal IT, if TCP will support it for hospitals. SmartLinx is

- OLD: Aladtec goes live in 2-4 weeks with minimal IT and is the most common self-serve replacement at CAH scale.
  NEW: Aladtec goes live in 2-4 weeks with minimal IT, but TCP markets it to public safety agencies, so confirm hospital support first.

- OLD: >25-200 beds, admin capacity needed<
  NEW: >Public safety agencies (fire, EMS, law enforcement)<

- OLD: alt="Aladtec by TCP healthcare and public safety scheduling platform"
  NEW: alt="Aladtec public safety scheduling software homepage"

- OLD: Some hospitals use it, based on its Capterra reviews.
  NEW: Some hospitals have used it, based on older Capterra reviews. TCP markets a different product, Humanity Schedule, to healthcare.

- OLD: **Best for:** CAHs with a designated administrator or scheduling coordinator who has 4-6 hours per week available for scheduling administration and can manage a self-serve platform configuration.
  NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support, with a coordinator who has 4-6 hours per week for scheduling administration.

- OLD: **Verdict:** The right fit for a CAH that wants to reduce UKG complexity without outsourcing scheduling decisions.
  NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it does, it fits a CAH that wants to reduce UKG complexity without outsourcing scheduling decisions.

- OLD: updateDate: 2026-05-16T00:00:00Z
  NEW: updateDate: 2026-10-19T00:00:00Z


## nursegrid-alternatives.md (follow-up, sentence length)

- OLD: ...with a larger review base; TCP Scheduling adds...
  NEW: ...with a larger review base. TCP Scheduling adds...

## Formatting

- Prettier re-aligned the two edited markdown shortlist tables (deputy L156, shiftwizard L149); whitespace only.

# Round 2

## shiftwizard-alternatives.md

- OLD: a self-serve platform with a hospital-nursing track record,
  NEW: a self-serve platform marketed to public safety agencies,

## qgenda-alternatives.md

- OLD: TCP Scheduling or ShiftWizard for self-serve platforms,
  NEW: TCP Scheduling (only if TCP confirms it supports hospital nursing) or ShiftWizard for self-serve platforms,

- OLD: Switching to another self-serve platform (TCP, ShiftWizard) takes 2-4 weeks
  NEW: Switching to another self-serve platform (TCP, if it confirms hospital nursing support, or ShiftWizard) takes 2-4 weeks

## onshift-alternatives.md

- OLD: SimpleScheduleAI is the managed-service option when the goal is removing the scheduling work entirely, Aladtec is the smaller-roster self-serve option with direct-outreach callouts, and SmartLinx is the upgrade path for hospitals growing past 50 beds.
  NEW: SimpleScheduleAI is the managed-service option when the goal is removing the scheduling work entirely. Aladtec is the smaller-roster self-serve option with direct-outreach callouts, if TCP confirms it supports hospital nursing. SmartLinx is the upgrade path for hospitals growing past 50 beds.

## ukg-alternatives-small-hospitals.md

- OLD: though Capterra reviewers skew toward EMS and public safety rather than hospital nursing) and SmartLinx
  NEW: though Capterra reviewers skew toward EMS and public safety rather than hospital nursing, and only if TCP confirms it supports hospital nursing) and SmartLinx

## deputy-alternatives-healthcare.md

- OLD: <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">Small rosters, self-serve</td>
  NEW: <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">Public safety agencies (fire, EMS, law enforcement)</td>

- OLD: - For hospitals that want to stay on self-serve software, Aladtec offers certification and coverage tracking. Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies. It is worth evaluating only if TCP confirms it would sell and support it for hospital nursing.
  NEW: - For hospitals that want to stay on self-serve software, Aladtec offers certification and coverage tracking. It is worth evaluating only if TCP confirms it would sell and support it for hospital nursing.

- OLD: Aladtec adds certification tracking and minimum staffing rules, but TCP markets it to public safety agencies rather than hospitals.
  NEW: Aladtec adds certification tracking and minimum staffing rules.

## smartlinx-alternatives.md

- OLD: <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">Small rosters, self-serve</td>
  NEW: <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">Public safety agencies (fire, EMS, law enforcement)</td>

- OLD: suits small rosters leaving SmartLinx because of cost-to-value mismatch. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. Faster to configure than either SmartLinx or TCP Scheduling, with lower ongoing maintenance.
  NEW: suits small rosters leaving SmartLinx because of cost-to-value mismatch. Faster to configure than either SmartLinx or TCP Scheduling, with lower ongoing maintenance. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

## nursegrid-alternatives.md

- OLD: TCP Scheduling is the more management-capable platform path,
  NEW: TCP Scheduling is the more management-capable platform path if TCP confirms it supports hospital nursing,

- OLD: TCP markets a different product, Humanity Schedule, to healthcare. Its nurse-facing experience
  NEW: TCP markets a different product, Humanity Schedule, to healthcare. Aladtec's nurse-facing experience

- OLD: <img src="/images/blog/nursegrid-alternatives/TCP.webp" alt="TCP Software TimeClock Plus time tracking software homepage" width="1200" height="568"
  NEW: <img src="/images/blog/nursegrid-alternatives/Aladtec.webp" alt="Aladtec public safety scheduling software homepage" width="1200" height="571"

## m7-health-alternatives.md

- OLD: publishDate: 2026-08-19T00:00:00Z
  NEW: publishDate: 2026-08-19T00:00:00Z
updateDate: 2026-10-19T00:00:00Z

- OLD: - TCP Scheduling (Aladtec) is the simpler option for a small facility that wants a self-serve rotation tool and does not need nursing-specific rules.
  NEW: - TCP Scheduling (Aladtec) is the simpler option for a small facility that wants a self-serve rotation tool and does not need nursing-specific rules. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

- OLD: | TCP Scheduling (Aladtec), whose heritage is public safety rather than nursing |
  NEW: | TCP Scheduling (Aladtec), whose background is public safety rather than nursing |

- OLD: comes from public safety and EMS rather than from nursing. That heritage shows in both directions.
  NEW: comes from public safety and EMS rather than from nursing. That background shows in both directions.

- OLD: **Best for:** a small facility that wants a simple, self-serve rotation tool and does not need nursing-specific rules.
  NEW: **Best for:** a small facility that wants a simple, self-serve rotation tool, does not need nursing-specific rules, and has confirmed TCP will sell and support Aladtec for hospital nursing.

- OLD: **Verdict:** The lightest self-serve option here and a reasonable landing spot for a facility that wants to keep control without an enterprise implementation.
  NEW: **Verdict:** The lightest self-serve option here. If TCP confirms it would sell and support Aladtec for hospital nursing, it is a reasonable landing spot for a facility that wants to keep control without an enterprise implementation.

- OLD: M7, ShiftWizard and TCP Scheduling are all reasonable,
  NEW: M7, ShiftWizard and TCP Scheduling are all reasonable (TCP only if it confirms it will sell and support Aladtec for hospital nursing),

## Image

- Copied public/images/blog/qgenda-alternatives/Aladtec.webp (md5 6eff866e..., same file all other posts use) to public/images/blog/nursegrid-alternatives/Aladtec.webp. Old TCP.webp left on disk, now unreferenced.

## Round 2 follow-up (split sentences lengthened by the inserted condition)

- m7-health-alternatives.md OLD: M7, ShiftWizard and TCP Scheduling are all reasonable (TCP only if it confirms it will sell and support Aladtec for hospital nursing), and M7's support model
  NEW: M7, ShiftWizard and TCP Scheduling are all reasonable. TCP is reasonable only if it confirms it will sell and support Aladtec for hospital nursing. M7's support model

- nursegrid-alternatives.md OLD: ShiftWizard is the strongest self-serve hospital-nursing fit, TCP Scheduling is the more management-capable platform path if TCP confirms it supports hospital nursing, and SimpleScheduleAI is
  NEW: ShiftWizard is the strongest self-serve hospital-nursing fit. TCP Scheduling is the more management-capable platform path, if TCP confirms it supports hospital nursing. SimpleScheduleAI is

- qgenda-alternatives.md OLD: TCP Scheduling (only if TCP confirms it supports hospital nursing) or ShiftWizard for self-serve platforms, and NurseGrid Manager for a nurse-facing app.
  NEW: TCP Scheduling or ShiftWizard for self-serve platforms, and NurseGrid Manager for a nurse-facing app. Consider TCP only if it confirms it supports hospital nursing.

- ukg-alternatives-small-hospitals.md OLD: rather than hospital nursing, and only if TCP confirms it supports hospital nursing) and SmartLinx (mid-market, healthcare-specific, 3-4 months with IT capacity).
  NEW: rather than hospital nursing) and SmartLinx (mid-market, healthcare-specific, 3-4 months with IT capacity). Aladtec is worth evaluating only if TCP confirms it supports hospital nursing.


## E. Batch B: 10 roundup and guide posts (writer log, both rounds)


All files in src/data/post/. Format: OLD -> NEW. Prettier then realigned the build-vs-buy markdown table (whitespace only).

## best-nurse-scheduling-software-2026.md

1. OLD: updateDate: 2026-09-25T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: and lighter options that small and critical access hospitals use (SimpleScheduleAI, Aladtec, NurseGrid, Deputy). Two of those lighter options come from outside hospital nursing: Aladtec's own pages now market it to public safety agencies, and Deputy serves general hourly workforces.
   NEW: and lighter options that small and critical access hospitals consider (SimpleScheduleAI, Aladtec, NurseGrid, Deputy). Two of those lighter options come from outside hospital nursing. Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies, and TCP markets a different product, Humanity Schedule, to healthcare. Deputy serves general hourly workforces.

3. OLD: (table cell, Customer Focus) Public safety, EMS, fire, small healthcare
   NEW: Public safety agencies (fire, EMS, law enforcement)

4. OLD: (ratings section) Aladtec's reviewer base leans toward fire, EMS and law enforcement,
   NEW: Aladtec's reviewer base leans toward public safety agencies,

5. OLD: (Small / Rural tier list) <li>Aladtec</li>
   NEW: <li>Aladtec (if TCP supports hospitals)</li>

6. OLD: (SSAI verdict) If you want to manage scheduling yourself or have more than 50 beds, look at Aladtec or SmartLinx instead.
   NEW: If you want to manage scheduling yourself or have more than 50 beds, look at SmartLinx, or at Aladtec if TCP confirms it will support hospital nursing.

7. OLD: **Best for:** Small hospitals that want self-serve scheduling software with a low implementation burden, and are comfortable with a tool built for 24/7 public safety agencies.
   NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support.

8. OLD: - Not built for hospital nursing. As of September 2026, Aladtec's own product pages describe it as public safety scheduling software for fire, EMS, law enforcement and corrections, with no healthcare claim, and its Capterra reviewers skew the same way; complex
   NEW: - Not built for hospital nursing. As of October 2026, Aladtec's product pages make no hospital or nursing claim, and its Capterra reviewers skew toward public safety; complex

9. OLD: **Verdict:** The strongest self-serve option in this guide for hospitals under 50 beds, with one caution: the vendor now markets it to public safety, so ask TCP for a hospital nursing reference before you commit. If you have a tech-comfortable administrator and want to keep scheduling in-house, start here.
   NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it would, and you have a tech-comfortable administrator who wants to keep scheduling in-house, its low setup burden is the draw.

10. OLD: (Under 25 beds card) Want self-serve: Aladtec
   NEW: Want self-serve: Aladtec, if TCP supports hospitals

11. OLD: (25-75 beds card) SmartLinx or Aladtec
   NEW: SmartLinx, or Aladtec if TCP supports hospitals

12. OLD: (Our Take) Aladtec, SimpleScheduleAI, and SmartLinx pass that test for different bed-size ranges.
   NEW: SimpleScheduleAI and SmartLinx pass that test for different bed-size ranges, and Aladtec could too if TCP will support it for hospital nursing.

13. OLD: 2. If you are under 50 beds, put Aladtec and SimpleScheduleAI side by side. Both are options small hospitals consider, with different models: one is self-serve software, the other builds the schedule for you.
   NEW: 2. If you are under 50 beds and want self-serve software, first ask TCP whether it would sell and support Aladtec for hospital nursing. If it would, put Aladtec and SimpleScheduleAI side by side: one is self-serve software, the other builds the schedule for you.

14. OLD: (FAQ) For hospitals under 50 beds, Aladtec is the better default: lower implementation burden and credential expiration tracking. The caution is that Aladtec's own pages now market it to public safety agencies, so ask TCP for a hospital nursing reference.
   NEW: For hospitals under 50 beds, Aladtec has the lower implementation burden and stores certifications with expiration dates. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

## best-nurse-scheduling-software-critical-access-hospitals.md

1. OLD: updateDate: 2026-06-13T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: text-slate-400">Small healthcare, EMS, fire, public safety</td>
   NEW: text-slate-400">Public safety agencies (fire, EMS, law enforcement)</td>

3. OLD: look at Aladtec or one of the enterprise systems below instead.
   NEW: look at Aladtec, if TCP confirms it will support hospital nursing, or one of the enterprise systems below instead.

4. OLD: As of September 2026, its own product pages describe it as public safety scheduling software for fire, EMS, law enforcement and corrections, with no healthcare claim.
   NEW: TCP markets Aladtec to fire, EMS, law enforcement and corrections agencies, and markets a different product, Humanity Schedule, to healthcare.

5. OLD: the Capterra review base skews heavily toward fire, EMS, and law enforcement, and
   NEW: the Capterra review base skews heavily toward public safety users, and

6. OLD: **Best for:** Small Critical Access Hospitals and rural healthcare facilities that want self-serve scheduling without heavy IT involvement, and are comfortable with a tool built for public safety agencies. Strongest fit
   NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support. Strongest fit

7. OLD: **Verdict:** The strongest self-serve fit for a CAH that wants to keep scheduling in-house and has someone comfortable owning the configuration. Confirm CMS §485.635 documentation and current nurse-context references with the vendor before committing.
   NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it would, confirm CMS §485.635 documentation and current nurse-context references before committing.

8. OLD: **Cost:** Approximately $200-$450/month for small hospital staff sizes.
   NEW: **Cost:** Approximately $200-$450/month for small staff sizes.

9. OLD: text-xs">Want self-serve: Aladtec or ShiftWizard</p>
   NEW: text-xs">Want self-serve: ShiftWizard, or Aladtec if TCP supports hospitals</p>

10. OLD: text-xs">ShiftWizard or Aladtec</p>
   NEW: text-xs">ShiftWizard, or Aladtec if TCP supports hospitals</p>

11. OLD: 3. If you want to keep scheduling in-house, put Aladtec and ShiftWizard side by side and ask each for CAH-scale nursing references and a §485.635 documentation sample.
   NEW: 3. If you want to keep scheduling in-house, start with ShiftWizard, and ask TCP whether it would sell and support Aladtec for hospital nursing. Ask each for CAH-scale nursing references and a §485.635 documentation sample.

12. OLD: Aladtec has lower setup burden and strong support, though its hospital-nursing reviews are old.
   NEW: Aladtec has lower setup burden and strong support, but it is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

## hospital-staff-scheduling-software-critical-access.md

1. OLD: updateDate: 2026-05-31T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: text-slate-400">Public safety, EMS, small healthcare rosters</td>
   NEW: text-slate-400">Public safety agencies (fire, EMS, law enforcement)</td>

## best-nurse-scheduling-software-texas.md

1. OLD: publishDate: 2026-07-13T00:00:00Z
   NEW: publishDate: 2026-07-13T00:00:00Z
updateDate: 2026-10-19T00:00:00Z

2. OLD: - For larger Texas hospitals (50-200 beds), Aladtec and SmartLinx are the strongest self-serve options.
   NEW: - For larger Texas hospitals (50-200 beds), SmartLinx is the strongest self-serve option. Aladtec is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

3. OLD: text-slate-400">Good for TX small hospitals</td>
   NEW: text-slate-400">Unclear; marketed to public safety agencies</td>

4. OLD: <ul class="mb-3 space-y-1 text-sm text-slate-800 dark:text-slate-200">
      <li>SimpleScheduleAI</li>
      <li>Aladtec</li>
   NEW: <ul class="mb-3 space-y-1 text-sm text-slate-800 dark:text-slate-200">
      <li>SimpleScheduleAI</li>
      <li>Aladtec (if TCP supports hospitals)</li>

5. OLD: <ul class="mb-3 space-y-1 text-sm text-slate-800 dark:text-slate-200">
      <li>Aladtec</li>
      <li>SmartLinx</li>
   NEW: <ul class="mb-3 space-y-1 text-sm text-slate-800 dark:text-slate-200">
      <li>Aladtec (if TCP supports hospitals)</li>
      <li>SmartLinx</li>

6. OLD: For self-serve scheduling at this size, Aladtec is the right alternative.
   NEW: For self-serve scheduling at this size, consider Aladtec only if TCP confirms it will support hospital nursing.

7. OLD: alt="Aladtec scheduling software for Texas small hospitals"
   NEW: alt="Aladtec public safety scheduling software homepage"

8. OLD: Aladtec by TCP is a self-serve scheduling platform built for 24/7 shift-work environments. It holds
   NEW: Aladtec by TCP is a self-serve scheduling platform built for 24/7 shift-work environments. TCP markets it to fire, EMS, law enforcement and corrections agencies, and markets a different product, Humanity Schedule, to healthcare. It holds

9. OLD: **Best for:** Texas small hospitals under 75 beds that want to manage scheduling in-house with a proven, low-complexity self-serve platform.
   NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support.

10. OLD: - Built for 24/7 shift-work environments and used across small healthcare and public-safety agencies
   NEW: - Built for 24/7 shift-work environments at public safety agencies

11. OLD: **Verdict:** The best self-serve option for Texas small hospitals. If you want
   NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If you want

12. OLD: **Cost:** Approximately $200-$450/month for small hospital staff sizes.
   NEW: **Cost:** Approximately $200-$450/month for small staff sizes.

13. OLD: <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Aladtec</td>
        <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">High</td>
   NEW: <td class="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">Aladtec</td>
        <td class="py-3 pr-4 text-slate-600 dark:text-slate-400">Unclear; confirm TCP support</td>

14. OLD: Two viable options: SimpleScheduleAI (AI-native nurse scheduling service, Texas-specific compliance built in) or Aladtec (self-serve, Texas rules configurable). Skip everything else.
   NEW: Two options worth a look: SimpleScheduleAI (AI-native nurse scheduling service, Texas-specific compliance built in) or Aladtec (self-serve, Texas rules configurable). Consider Aladtec only if TCP confirms it will support hospital nursing. Skip everything else.

15. OLD: SmartLinx or Aladtec for nursing scheduling.
   NEW: SmartLinx for nursing scheduling, or Aladtec if TCP confirms it will support hospital nursing.

16. OLD: request information from SimpleScheduleAI and Aladtec this week. Request the same information from both:
   NEW: request information from SimpleScheduleAI this week, and ask TCP whether it would sell and support Aladtec for hospital nursing. Request the same information from both:

17. OLD: Aladtec is the right self-serve choice: proven in Texas rural hospitals, fully remote setup, and solid compliance tools.
   NEW: Aladtec is the self-serve option to check, but it is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. It sets up fully remotely.

## best-scheduling-software-25-bed-hospital.md

1. OLD: updateDate: 2026-06-03T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: - For hospitals that prefer self-serve software, Aladtec and NurseGrid Manager are the strongest fits for 25-bed rosters.
   NEW: - For hospitals that prefer self-serve software, NurseGrid Manager is a strong fit for 25-bed rosters. Aladtec is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

3. OLD: text-slate-200 align-top">Good for small rosters</td>
   NEW: text-slate-200 align-top">Unclear; marketed to public safety agencies</td>

4. OLD: alt="Aladtec scheduling software interface for small hospitals"
   NEW: alt="Aladtec public safety scheduling software homepage"

5. OLD: Aladtec was built for emergency services (EMS, fire, law enforcement) but has a solid base in small hospitals that mirrors those environments: 24/7 coverage, small rosters, mandatory staffing minimums, and a heavy callout burden. Its self-service model is genuinely accessible for nurse managers without technical backgrounds.
   NEW: Aladtec, now sold by TCP Software, is marketed to fire, EMS, law enforcement and corrections agencies. TCP markets a different product, Humanity Schedule, to healthcare. Public safety work shares some traits with a small hospital floor: 24/7 coverage, small rosters, mandatory staffing minimums, and a heavy callout burden. Its self-service model is genuinely accessible for managers without technical backgrounds.

6. OLD: **Best for:** 25-bed hospitals that want a self-serve scheduling tool and have a nurse manager willing to invest 4-6 weeks learning the system to gain ongoing autonomy.
   NEW: **Best for:** Hospital-run EMS services, or hospitals TCP confirms it will support.

7. OLD: **Verdict:** The strongest self-serve option for a 25-bed hospital that wants to own its scheduling process internally. Expect a 4-6 week ramp
   NEW: **Verdict:** Worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. If it would, expect a 4-6 week ramp

8. OLD: align-top">Aladtec - self-serve, best small fit</td>
   NEW: align-top">Aladtec - self-serve, if TCP supports hospitals</td>

9. OLD: Aladtec is competent self-serve software for hospitals that can absorb the configuration burden.
   NEW: Aladtec is competent self-serve software, but it is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.

10. OLD: 4. **If you want to self-evaluate Aladtec, request a trial.** Aladtec offers a trial period.
   NEW: 4. **If you want to self-evaluate Aladtec, request a trial.** First ask TCP whether it would sell and support Aladtec for hospital nursing. Aladtec offers a trial period.

11. OLD: but the initial setup takes 4-6 weeks and ongoing use requires 4-6 hours per week. SimpleScheduleAI
   NEW: but the initial setup takes 4-6 weeks and ongoing use requires 4-6 hours per week. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing. SimpleScheduleAI

12. OLD: small sample, reviewer base skews toward fire, EMS, and law enforcement;
   NEW: small sample, reviewer base skews toward public safety;

## build-vs-buy-hospital-scheduling-software.md

1. OLD: publishDate: 2026-09-01T00:00:00Z
   NEW: publishDate: 2026-09-01T00:00:00Z
updateDate: 2026-10-19T00:00:00Z

2. OLD: | QGenda, Aladtec, the enterprise tier from UKG |
   NEW: | QGenda, the enterprise tier from UKG |

## how-to-stay-cms-compliant-nurse-scheduling.md

1. OLD: updateDate: 2026-06-07T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: Nursing-specific platforms (NurseGrid Manager, Aladtec) are better suited
   NEW: Nursing-specific platforms such as NurseGrid Manager are better suited

## what-is-clinical-scheduling.md

1. OLD: updateDate: 2026-08-10T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: **Nurse-focused scheduling platforms** such as NurseGrid and Aladtec handle
   NEW: **Nurse-focused scheduling platforms** such as NurseGrid handle

## managed-service-vs-scheduling-software.md

1. OLD: updateDate: 2026-05-15T00:00:00Z
   NEW: updateDate: 2026-10-19T00:00:00Z

2. OLD: 5. **If you prefer self-serve software, compare Aladtec and SmartLinx.** Aladtec is faster
   NEW: 5. **If you prefer self-serve software, compare Aladtec and SmartLinx.** Aladtec is worth evaluating only if TCP confirms it would sell and support it for hospital nursing. Aladtec is faster

3. OLD: Self-serve scheduling software for hospital nursing: Aladtec, SmartLinx, QGenda, NurseGrid Manager, OnShift, Deputy, UKG.
   NEW: Self-serve scheduling software that hospitals evaluate: SmartLinx, QGenda, NurseGrid Manager, OnShift, Deputy, UKG, plus public safety scheduling tools such as Aladtec.

## rural-texas-hospital-nurse-scheduling-2026.md

1. OLD: publishDate: 2026-07-17T00:00:00Z
   NEW: publishDate: 2026-07-17T00:00:00Z
updateDate: 2026-10-19T00:00:00Z

2. OLD: Publicly reviewed platforms in this space, such as Aladtec, built their reputations on exactly those attributes.
   NEW: Some publicly reviewed scheduling tools, such as Aladtec, built their reputations on exactly those attributes.

3. OLD: Aladtec is one publicly reviewed platform that built its reputation on exactly those attributes among small agencies and facilities before the TCP Software acquisition.
   NEW: Aladtec is one publicly reviewed platform that built its reputation on exactly those attributes, mainly among public safety agencies. Now sold by TCP Software, it is marketed to fire, EMS, law enforcement and corrections agencies. TCP markets a different product, Humanity Schedule, to healthcare.

4. OLD: Aladtec surfaces in these contexts because it built a strong word-of-mouth reputation among small agency and hospital users and offered an accessible initial setup path. It is worth pairing that reputation with what reviewers actually flag.
   NEW: Aladtec surfaces in these contexts because it offered an accessible initial setup path. It is worth pairing that with what reviewers actually flag.

# Round 2

## best-scheduling-software-25-bed-hospital.md

1. OLD: NurseGrid Manager is a strong fit for 25-bed rosters.
   NEW: NurseGrid Manager adds a communication and visibility layer for 25-bed rosters, not a full clinical scheduling system.

2. OLD: which maps cleanly to hospital floors
   NEW: which resembles hospital floors

3. OLD: align-top">NurseGrid plus Aladtec</td>
   NEW: align-top">NurseGrid plus Aladtec, if TCP supports hospitals</td>

## best-nurse-scheduling-software-critical-access-hospitals.md

1. OLD: look at Aladtec, if TCP confirms it will support hospital nursing, or one of the enterprise systems below instead.
   NEW: look at one of the enterprise systems below, or at Aladtec if TCP confirms it will support hospital nursing.

## best-nurse-scheduling-software-texas.md

1. OLD: For self-serve scheduling at this size, consider Aladtec only if TCP confirms it will support hospital nursing.
   NEW: For self-serve scheduling at this size, Aladtec is the alternative covered next.

2. OLD: FLSA overtime rules, including the healthcare 8-and-80 calculation, can be configured within the platform's rule engine, though it requires setup time from whoever is managing the implementation.
   NEW: TCP's Aladtec pages describe configurable work limits and overtime rules but do not mention the FLSA 8-and-80 method, so ask TCP to show it before you buy.

3. OLD: - Overtime rules, including the healthcare 8-and-80 calculation, require manual configuration; they are not a default.
   NEW: - Overtime rules require manual configuration and are not a default. TCP's pages do not mention the 8-and-80 method.

4. OLD: or Aladtec (self-serve, Texas rules configurable). Consider Aladtec only if TCP confirms it will support hospital nursing. Skip everything else.
   NEW: or Aladtec (self-serve; confirm which overtime rules it handles). Skip everything else.

5. OLD: Request the same information from both:
   NEW: Request the same information from each:

6. OLD: FLSA overtime rules, including the healthcare 8-and-80 calculation, require configuration, but the platform supports them.
   NEW: Ask TCP to show how it handles the healthcare 8-and-80 calculation, because its pages do not mention it.

## best-nurse-scheduling-software-2026.md

1. OLD: especially if she also covers clinical shifts?
   NEW: especially if the manager also covers clinical shifts?

## rural-texas-hospital-nurse-scheduling-2026.md

1. OLD: built its reputation on exactly those attributes, mainly among public safety agencies. Now sold
   NEW: built its reputation on exactly those attributes. Now sold

Notes: 2026 post L272 'As of October 2026' kept unchanged. Rural L128 reviewer caveat is now the second fire/EMS mention (L62 is the first), not a third. No price figures touched.

## F. Aladtec price removed, 12 live posts (2026-10-20, commit d95eee0b)


Per file, OLD -> NEW for every change. Also every edited file: updateDate set to 2026-10-20T00:00:00Z.

## aladtec-alternatives.md

- OLD: `text-slate-600 dark:text-slate-400">$200-450/month, per roster</td>`
  NEW: `text-slate-600 dark:text-slate-400">Quote only (not published)</td>`
- OLD: `Aladtec costs approximately $200-450 per month for a typical small hospital roster. Deputy is significantly cheaper at $4.50 per user per month`
  NEW: `Aladtec's price is not published; TCP quotes on request, so compare it once TCP gives you a figure. Deputy lists $4.50 per user per month`
- OLD: `SmartLinx and [QGenda](/blog/qgenda-alternatives) are both higher cost than Aladtec and require quotes.`
  NEW: `SmartLinx and [QGenda](/blog/qgenda-alternatives) also require quotes.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## best-nurse-scheduling-software-critical-access-hospitals.md

- OLD: `text-slate-600 dark:text-slate-400">~$200-450</td>`
  NEW: `text-slate-600 dark:text-slate-400">Quote only (not published)</td>`
- OLD: `**Cost:** Approximately $200-$450/month for small staff sizes.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `ScheduleAnywhere lists a Basic plan from $25 per user per month, and Aladtec runs roughly $200 to $450 per month for small staff sizes.`
  NEW: `ScheduleAnywhere lists a Basic plan from $25 per user per month. Aladtec's price is not published, so compare it once TCP gives you a quote.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## best-scheduling-software-25-bed-hospital.md

- OLD: `text-slate-800 dark:text-slate-200 align-top">$200-450</td>`
  NEW: `text-slate-800 dark:text-slate-200 align-top">Quote only (not published)</td>`
- OLD: `**Cost:** $200-450 per month depending on roster size and modules. Pricing requires a quote.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `When I Work at $2.50-$6 per user per month is the lowest-cost option,`
  NEW: `Of the tools here that publish a price, When I Work at $2.50-$6 per user per month is the lowest-cost option,`
- OLD: `Aladtec starts around $200-$450/month.`
  NEW: `Aladtec requires a quote, so compare it once TCP gives you one.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## best-nurse-scheduling-software-texas.md

- OLD: `<td class="py-3 text-slate-600 dark:text-slate-400">$200-450</td>`
  NEW: `<td class="py-3 text-slate-600 dark:text-slate-400">Quote only (not published)</td>`
- OLD: `**Cost:** Approximately $200-$450/month for small staff sizes.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## best-per-diem-nurse-scheduling-software.md

- OLD: `Aladtec covers similar ground at a lower price.` (Our Take box)
  NEW: `Aladtec covers similar ground. Ask TCP for a quote, since its price is not published.`
- OLD: `<td class="py-3 text-slate-600 dark:text-slate-400">$200-450</td>`
  NEW: `<td class="py-3 text-slate-600 dark:text-slate-400">Quote only (not published)</td>`
- OLD: `**Cost:** $200-450 per month depending on roster size. Pricing requires a quote.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `Deputy at $4.50 per user per month is the lowest-cost option.`
  NEW: `Of the tools here that publish a price, Deputy at $4.50 per user per month is the lowest-cost option.`
- OLD: `Aladtec starts around $200-450 per month and provides more complete scheduling and availability management.`
  NEW: `Aladtec provides more complete scheduling and availability management, but TCP does not publish its price, so get a quote before comparing.`
- OLD: `[Deputy](/blog/deputy-alternatives-healthcare) is the lowest-cost entry point but lacks`
  NEW: `[Deputy](/blog/deputy-alternatives-healthcare) has the lowest published price here but lacks`
- OLD: `updateDate: 2026-09-25T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## deputy-alternatives-healthcare.md

- OLD: `<td class="py-3 text-slate-600 dark:text-slate-400">$200-450</td>`
  NEW: `<td class="py-3 text-slate-600 dark:text-slate-400">Quote only (not published)</td>`
- OLD: `**Cost:** $200-450 per month. Pricing requires a quote.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `It is more expensive than Deputy but significantly less expensive than [SmartLinx](/blog/smartlinx-alternatives) or [QGenda](/blog/qgenda-alternatives).`
  NEW: `Aladtec's price is not published, so get a TCP quote before comparing it with Deputy, [SmartLinx](/blog/smartlinx-alternatives) or [QGenda](/blog/qgenda-alternatives).`
- OLD: `Aladtec starts around $200-450 per month.`
  NEW: `Aladtec's price is not published; TCP quotes on request.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## smartlinx-alternatives.md

- OLD: `<td class="py-3 text-slate-600 dark:text-slate-400">$200-450</td>`
  NEW: `<td class="py-3 text-slate-600 dark:text-slate-400">Quote only (not published)</td>`
- OLD: `**Cost:** $200-450 per month depending on roster size. Pricing requires a quote.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `- Mobile app reduces phone-based communication
- Lower cost than SmartLinx for rosters under 50 nurses`
  NEW: `- Mobile app reduces phone-based communication`
- OLD: `Aladtec is $200-450 per month with a faster and less expensive implementation.`
  NEW: `Aladtec's price is not published; TCP quotes on request. Its implementation is faster than SmartLinx's.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## qgenda-alternatives.md

- OLD: `**Cost:** Approximately $200-450 per month. Pricing requires a quote.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `For lower cost and faster setup, TCP/Aladtec is worth evaluating`
  NEW: `For faster setup, TCP/Aladtec is worth evaluating`
- OLD: `TCP/Aladtec costs less and sets up faster, if TCP will support it`
  NEW: `TCP/Aladtec sets up faster, if TCP will support it`
- OLD: `Aladtec is a public safety scheduling tool with lower cost and faster setup than QGenda.`
  NEW: `Aladtec is a public safety scheduling tool with faster setup than QGenda.`
- OLD: `Aladtec's pricing tier and faster setup may appeal.`
  NEW: `Aladtec's faster setup may appeal.`
- OLD: `- Lower cost than QGenda with faster implementation at 2-4 weeks`
  NEW: `- Faster implementation than QGenda, at 2-4 weeks`
- OLD: `it is a meaningful cost and complexity reduction from QGenda`
  NEW: `it is a meaningful complexity reduction from QGenda`
- OLD: `only in platform cost and setup time.`
  NEW: `only in platform complexity and setup time.`
- OLD: `- Lower cost than QGenda, Aladtec, or ShiftWizard`
  NEW: `- Lower cost than QGenda or ShiftWizard`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## schedule360-alternatives.md

- OLD: `**Cost:** Approximately $200 to $450 per month. Pricing requires a quote.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `TCP/Aladtec costs less and sets up faster, if TCP will support it`
  NEW: `TCP/Aladtec sets up faster, if TCP will support it`
- OLD: `Aladtec is a public safety scheduling tool with a lower cost and faster setup.`
  NEW: `Aladtec is a public safety scheduling tool with faster setup.`
- OLD: `Aladtec's lower price point and faster setup may appeal.`
  NEW: `Aladtec's faster setup may appeal.`
- OLD: `- Lower cost than enterprise healthcare platforms with faster implementation at 2 to 4 weeks`
  NEW: `- Faster implementation than enterprise healthcare platforms, at 2 to 4 weeks`
- OLD: `it is a meaningful cost and setup-time reduction from a broad healthcare platform`
  NEW: `it is a meaningful setup-time reduction from a broad healthcare platform`
- OLD: `only in platform cost and time to first schedule.`
  NEW: `only in time to first schedule.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## onshift-alternatives.md

- OLD: `- Lower cost than enterprise-tier platforms with a faster implementation than UKG or SmartLinx`
  NEW: `- Faster implementation than UKG or SmartLinx`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## shiftwizard-alternatives.md

- OLD: `TCP/Aladtec offers comparable cost and setup time, but it is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.`
  NEW: `TCP/Aladtec offers comparable setup time, though TCP quotes its price only on request. It is worth evaluating only if TCP confirms it would sell and support Aladtec for hospital nursing.`
- OLD: `**Cost:** Pricing not listed publicly. Typically positions in the mid-market range.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`

## ukg-alternatives-small-hospitals.md

- OLD: `Financially, Aladtec typically costs significantly less than UKG enterprise licensing for a small facility.`
  NEW: `Aladtec's price is not published, so get a TCP quote before comparing it with UKG enterprise licensing.`
- OLD: `**Cost:** Pricing not listed publicly. Contact for quote. Typically positions below SmartLinx and well below UKG in per-facility cost.`
  NEW: `**Cost:** Not published. TCP quotes on request.`
- OLD: `updateDate: 2026-10-19T00:00:00Z`
  NEW: `updateDate: 2026-10-20T00:00:00Z`


Main-session fixes after fact-check:
- aladtec-alternatives L348: "Compared to Aladtec, Deputy is simpler to configure and lower in cost." -> "Compared to Aladtec, Deputy is simpler to configure."
- aladtec-alternatives SSAI table cells: "Excel upload, days to first draft" -> "Excel upload, first schedule inside two weeks"; "Not listed, contact for quote" -> "$1,000 to $1,500 a month, by roster size".
- best-scheduling-software-25-bed-hospital L504: "Of the tools here that publish a price, When I Work ... is the lowest-cost option" -> "Homebase has a free tier for up to 20 staff per location. Among the paid per-user plans here, When I Work ... is the lowest"; table cell "Lowest cost, no CMS survey exposure" -> "Lowest per-user price, no CMS survey exposure".
- smartlinx-alternatives L36: dropped "because of cost-to-value mismatch"; L302 "Lowest cost of any alternative in this list" -> "Lowest published price in this list"; SSAI table row: "CAHs, managed service" -> "CAHs, AI-native scheduling service", "Days, no IT needed" -> "First schedule inside two weeks, no IT needed", "Not listed" -> "$1,000 to $1,500 a month, by roster size".

## G. Inbound links for #8 (2026-10-20, commit b3025f10)

- scheduling-software-vendor-acquisition-support.md, end of the "Ask the acquiring company directly" paragraph, added:
  "Support can also change without an acquisition, and our guide to [what happens to scheduling software support after you sign](/blog/vendor-support-decline-nurse-scheduling-software) covers the support terms to put in the contract."
- nurse-scheduling-software-reliability-crashes.md, end of the holiday-weekend paragraph, added:
  "Our guide to [what happens to scheduling software support after you sign](/blog/vendor-support-decline-nurse-scheduling-software) covers how to get weekend support written into the contract."

## H. Third pillar links (2026-10-20, commit fd16dc2c)

- how-to-choose-nurse-scheduling-software.md: "SimpleScheduleAI is an AI-native nurse scheduling service:" -> "SimpleScheduleAI is an [AI-native nurse scheduling](/ai-nurse-scheduling) service:"
- what-is-a-nurse-manager.md: after "see: [Critical Access Hospital Scheduling](/critical-access-hospital-scheduling)." added "The [AI nurse scheduling](/ai-nurse-scheduling) guide explains how the drafts are built."

## I. Pronoun fixes on #7 and #8 (2026-10-20, commit 503ac177)

See `git show 503ac177 -- src/data/post` for the 14 sentence changes; #7's session table converted to the standard HTML table with unchanged text.

## J. Rural Texas Strong article went live (2026-10-24, commit 48359d53)

- rural-health-transformation-deadline-nurse-salaries (article): eligibility line rewritten (66 of 92 Texas CAHs hold workforce-grant applications on HHSC's Oct 23 list; link to the new tracker); "There are no extensions, because the law does not allow one." -> "CMS also says states cannot get more time to spend the funds."; "and there are no extensions" removed from the October 30 FAQ answer; Source 5 wording; updateDate 2026-10-24.
- rural-hospital-losses-nurse-staffing-cost (article): added "Our tracker of how much Rural Texas Strong grant money is actually signed shows how much of the Texas money is under contract so far."
- build-vs-buy-hospital-scheduling-software (blog): added "Our tracker of how much Rural Texas Strong grant money is actually signed shows how much of the Texas money is under contract."
- critical-access-conversion-nurse-staffing (article, commit 151072f7): Brattleboro backed away from closing its birthing center; Source 9 added.

## K. 2026-10-26 changes to live pages

- texas-rural-health-transformation-signed-contracts (article, commit 09183e56): 46 vague pronouns replaced with nouns; full list in rts-pronoun-changes.md.
- mandatory-nurse-overtime-by-state: added ", and our explainer on what nursing overtime is covers how the federal rule counts hours" to the pay-side pointer (commit c34a676f).
- nurse-manager-scheduling-time-breakdown: added "Our explainer on what nursing overtime is covers how the workweek and hours worked are counted." (commit c34a676f).
- how-to-reduce-nurse-overtime FAQ: "running hours against your hospital's applicable FLSA threshold" -> "scheduled hours against the 40-hour weekly FLSA overtime threshold" (commit a18f91e7).
- 8-and-80 written-agreement correction, both posts (commit a18f91e7):


Basis: 29 CFR 778.601(c) (verified live on Cornell LII 2026-10-26: agreement need not be in writing; if not, a special record under part 516 must be kept), 29 U.S.C. 207(j), 29 CFR 516.23(b).

## src/data/post/texas-nursing-overtime-compliance-cah.md (8 changes)

1. Frontmatter
   - OLD: updateDate: 2026-06-18T00:00:00Z
   - NEW: updateDate: 2026-10-26T00:00:00Z

2. Key Takeaways bullet
   - OLD: The 8-and-80 FLSA alternative requires a prior written agreement with each nurse before the work period, not a retroactive policy decision, and it does not stop daily overtime on 12-hour shifts.
   - NEW: The 8-and-80 FLSA alternative requires an agreement with each nurse made before the work period, not a retroactive policy decision, and it does not stop daily overtime on 12-hour shifts. The agreement need not be written, but an unwritten one needs a dated record of its terms.

3. FLSA section paragraph
   - OLD: The 8-and-80 method also applies only if the employer has a written agreement with each employee before work begins, not retroactively.
   - NEW: The 8-and-80 method also applies only if the employer has an agreement or understanding with each employee before work begins, not retroactively. The agreement need not be in writing. An unwritten agreement still requires a record of its terms and the date it was made ([29 CFR 778.601(c)](https://www.law.cornell.edu/cfr/text/29/778.601) and 516.23). A written, dated agreement is the easiest way to prove the arrangement.

4. Key FLSA requirements bullet
   - OLD: The 8-and-80 alternative requires a prior written agreement, verbal understanding is not sufficient
   - NEW: The 8-and-80 alternative requires an agreement made before the work it covers. A verbal agreement counts, but the hospital must keep a dated record of its terms

5. Gap 1
   - OLD: **Gap 1: No written 8-and-80 agreements.** Facilities using the 8-and-80 FLSA alternative without documented prior written agreements with each employee are technically violating FLSA even if total compensation is correct. The written agreement must exist before the work period begins. If a DOL audit occurs, the absence of these agreements exposes the facility to back-pay liability for overtime calculated at the 7-day workweek standard.
   - NEW: **Gap 1: No 8-and-80 agreement, or no record of one.** Facilities using the 8-and-80 FLSA alternative need an agreement or understanding with each employee, made before the work period begins. The agreement need not be written, but an unwritten one requires a record of its terms and the date it was made. Using 8-and-80 with no prior agreement, or with no record of one, is the violation risk, even if total compensation is correct. A written, dated agreement is the easiest proof. If a DOL audit occurs, a missing agreement or record exposes the facility to back-pay liability for overtime calculated at the 7-day workweek standard.

6. What to Do This Week, item 1
   - OLD: Confirm you have a signed 8-and-80 agreement on file for every nurse, dated before the work period it applies to. Using the 8-and-80 method without them is back-pay exposure today.
   - NEW: Confirm you have an 8-and-80 agreement for every nurse, made before the work period it applies to. A signed, dated copy on file is the easiest proof. An unwritten agreement needs a record of its terms and date. Using the 8-and-80 method without a prior agreement is back-pay exposure today.

7. FAQ answer (question text unchanged)
   - OLD: Yes. The FLSA Section 7(j) 8-and-80 overtime alternative requires a prior written agreement with each employee before the work period begins. Verbal understanding is not sufficient. Without written agreements, overtime is calculated on the standard 7-day workweek basis, and any differential must be paid retroactively in an audit.
   - NEW: Not necessarily in writing, but the hospital must be able to prove the agreement exists. The FLSA Section 7(j) 8-and-80 overtime alternative requires an agreement or understanding with each employee, made before the work period begins. If the agreement is not written, the hospital must keep a record of its terms and the date it was made (29 CFR 778.601(c) and 516.23). A written, dated agreement is the easiest way to prove the arrangement. Without a prior agreement, overtime is calculated on the standard 7-day workweek basis, and any differential must be paid retroactively in an audit.

8. A Note on Sources (added item 6)
   - OLD: (none)
   - NEW: 6. The 8-and-80 agreement or understanding, which need not be in writing if a record is kept. [29 CFR 778.601, Cornell Legal Information Institute](https://www.law.cornell.edu/cfr/text/29/778.601).

## src/data/post/how-to-reduce-nurse-overtime.md (8 changes)

1. Frontmatter
   - OLD: updateDate: 2026-08-07T00:00:00Z
   - NEW: updateDate: 2026-10-26T00:00:00Z

2. Key Takeaways bullet
   - OLD: ...is optional, requires written adoption, and is not automatically cheaper.
   - NEW: ...is optional, requires an agreement with employees made before the work it covers, and is not automatically cheaper.

3. 8-and-80 section paragraph
   - OLD: Three requirements if you do adopt 8-and-80: a written agreement with employees before the work period it covers, ... Adoption cannot be retroactive, so ask payroll one precise question: which threshold is our system using, and does it match what we have adopted in writing?
   - NEW: Three requirements if you do adopt 8-and-80: an agreement with employees made before the work period it covers, ... The agreement need not be in writing, but an unwritten one needs a record of its terms and the date it was made ([29 CFR 778.601](https://www.law.cornell.edu/cfr/text/29/778.601)). A written, dated agreement is the easiest proof. Adoption cannot be retroactive, so ask payroll one precise question: which threshold is our system using, and does it match what we have actually adopted and documented?

4. Step 4
   - OLD: ...40-hour default or written 8-and-80.
   - NEW: ...40-hour default or a documented 8-and-80 agreement.

5. Honest boundary paragraph
   - OLD: ...or substitute for the written 8-and-80 adoption.
   - NEW: ...or substitute for the 8-and-80 agreement and its records.

6. What to Do This Week, item 2
   - OLD: ...and does it match what the hospital has adopted in writing?
   - NEW: ...and does it match what the hospital has actually adopted and documented?

7. FAQ "Does the 8-and-80 rule apply to every nurse once adopted?"
   - OLD: It applies to the non-exempt employees covered by the written agreement ... If your hospital cannot produce the written agreement, assume the 40-hour default governs...
   - NEW: It applies to the non-exempt employees covered by the agreement or understanding ... A verbal agreement counts, but the hospital must keep a record of its terms and the date it was made. If your hospital cannot produce a written agreement or a dated record of one, assume the 40-hour default governs...

8. Sources (added item 4)
   - OLD: (none)
   - NEW: 4. 29 CFR 778.601, Special overtime provisions available for hospital and residential care establishments under section 7(j). [Cornell LII](https://www.law.cornell.edu/cfr/text/29/778.601)

## L. Overtime-threshold wording sweep (2026-10-26, commit 1b16ad30)

Full old -> new list: C:/Users/Admin/AppData/Local/Temp/claude/d--Pradeep-Personal-Projects-SimpleScheduleAI-com--New/7b9dfe4c-ecc3-4f2c-8dc6-3ebb7bdfc81c/scratchpad/flsa-threshold-changes.md
- texas-nursing-overtime-compliance-cah: removed "we alert you before a certification lapses".
- aladtec-vs-managed-service L453: "confirm the specific calculation basis with us during onboarding" -> "Our schedules do not apply the FLSA Section 7(j) 8-and-80 method ..., so a facility that uses that method should know our drafts count the 40-hour week only."

## M. Island shifts inbound links (2026-10-27, commit 7585dbdd)

- night-shift-nurse-schedule-coverage: added "A single night shift with days off on both sides is called an island shift, and our guide to island shifts covers how to schedule one out."
- 12-hour-hospital-shifts-scheduling: added "A single shift with days off on both sides is called an island shift, and our guide to island shifts explains how to keep a rotation free of them."

## N. island-shifts-night-nurses-cah: product section reframed (2026-10-27, commit 57c16dc2)

Founder: "If the answer is no, do we need this section?"
- H2 "Does SimpleScheduleAI Prevent Island Shifts?" (opened "No.") -> "What Does SimpleScheduleAI Check on a Night Schedule?"; TOC updated.
- Section now leads with the 22 rules and the three fatigue limits (10h rest, 5 in a row, 60h in 7 days); the missing island-shift rule is one "One honest limitation" sentence ("can be caught" at the manager's review, per reviewer).
- Callout paragraph: "The candidate list does not show the day after the open night, so check that day yourself before calling."
- FAQ "Does SimpleScheduleAI flag island shifts?" -> "How many night shifts in a row should a nurse work?" (NIOSH + Lee & Jeong, both already cited in the body).
- All four hub links kept.

## O. Inbound links for /articles/grow-your-own-nurses-texas-rural-grants (2026-10-29, commit 95a10fad)

- texas-rural-health-transformation-signed-contracts ("Does Any Rural Texas Strong Grant Pay for Nurses?"): added "Our article on using the workforce grants to grow your own nurses explains which of those four uses can pay toward training a local nurse."
- rural-health-transformation-deadline-nurse-salaries ("What Is Texas Spending Its Workforce Money On?"): added at paragraph end "We read the Texas application rules for the scholarship route in Can a Small Texas Hospital Use Rural Health Grants to Grow Its Own Nurses?"
- nurse-retention-strategies-rural-hospital (perks paragraph): added "In Texas, a state workforce grant can pay part of one perk, nursing school for a recent high school graduate (corrected from "local" in a follow-up commit), as our article on growing your own nurses explains."
