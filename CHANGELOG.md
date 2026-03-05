# Changelog

## [Unreleased] — 2026-03-05 (session 3)

### Privacy Policy page (/privacy) — new
- Created full Privacy Policy page matching site dark theme
- Sections: overview, what we collect, what we do not collect, how we use it, third-party services (Google Sheets), data retention, user rights, security, changes
- Explicit HIPAA disclaimer: no patient data collected, not acting as a Business Associate
- Dark slate-950 hero matching landing page; white content section; dark slate-900 contact band at bottom

### Terms of Service page (/terms) — new
- Created full Terms of Service page matching site dark theme
- Sections: agreement, service description, pilot program terms, your responsibilities, no medical/legal/HR advice, no patient data, IP, liability limit (zero during pilot), no warranties, governing law (Texas), changes
- Pilot terms explicitly spelled out: free 60 days, no auto-renewal, no surprise billing, either party can exit
- Same layout pattern as Privacy page

### About page (/about) — theme update
- Converted from light card hero to dark slate-950 hero matching landing page and pilot page
- Added eyebrow badge ("About Us"), white h1, slate-400 description, Book a Call CTA
- Stats section: moved to white bg with teal uppercase labels
- Principles section: moved to slate-50 bg with section eyebrow label
- What we do / do not do: updated list items to use dot bullet pattern matching pilot page
- New dark slate-900 CTA section at bottom replacing teal band

### Footer
- Added Privacy and Terms links to bottom bar alongside Contact and About

### Contact page (/contact) — theme update
- Converted from light hero to dark slate-950 hero matching site pattern
- Eyebrow badge "Talk to us", white h1, slate-400 description, secondary CTA links
- Form and contact details moved into white bg section below

### Articles index (/articles) — theme update
- Converted from light hero to dark slate-950 hero matching site pattern
- Eyebrow badge "From the team", white h1, slate-400 description
- Article grid moved into white bg section below

### Article detail (/articles/[slug]) — theme update
- Converted from light hero to dark slate-950 hero matching site pattern
- Back link in teal-400, date in slate-500, article title as white h1, description in slate-400
- Prose content and CTA box moved into white bg section below

## [Unreleased] — 2026-03-03 (session 2)

### HeroContent (homepage hero)
- H1: "You focus on patients. We handle the schedule." → "Your nurses shouldn't be leaving over a spreadsheet."
- CTA button: "Apply for a Pilot Spot" → "Claim a Pilot Spot"

### CTA section (homepage bottom)
- CTA button: "Apply for a Pilot Spot" → "Claim a Pilot Spot"
- Replaced 101-word paragraph with 3 scannable bullets under "What you get for 60 days, free"
- Post-pilot framing moved to separate sentence below bullets

### QualityChecks section
- H2: "Scheduling rules validated automatically" → "Every schedule is compliant before it posts."
- Full 21-rule grid removed; condensed to big stat + 2-sentence summary + link to /how-it-works

### SoftwareVsService section
- Service subtitle: "(We deliver validated schedules, you approve)" → "(We deliver post-ready schedules, you approve)"
- Service bullet: added "to deliver compliant, fair schedules" to compliance rule count

### WeeklyPackage section
- Deliverable renamed: "Scenario Comparison" → "Schedule Options"
- Description updated: "Pick the best fit." → "You pick the best fit."

### FounderSection
- Pradeep bio: "7 years in healthcare, including Apollo Hospitals. Watched scheduling break teams from the inside, and decided to fix it." → "7 years inside hospital operations. Watched scheduling break good nurses and decided to fix it before it happened to your unit."
- Gautham bio: "3x founder with 15 years in tech. Building the systems that make this work at scale." → "3x founder, 15 years in tech. Built the system so it works without your nurses or staff touching any software."

### ScheduleStability section
- Metrics updated to outcome language:
  - "On-Time" → "On-Time Every Week"
  - "No coverage gaps" / "Coverage gaps caught before staff see the board." → "Zero Coverage Gaps" / "Gaps caught before staff see the board, not after."
  - "Clean Escalation" / "Call-outs go through the system, not your phone." → "Call-Outs Handled" / "Replacements surface automatically. Call-outs stop coming to your phone."
  - "OT Flags" → "OT Flagged Early"
  - "Audit-Ready" description: added "always current"

### ROISection
- Removed duplicate heading and description (already present in the /roi page hero)

### How It Works page
- Delivery bullet: "Multiple variants to compare (coverage vs cost vs fairness)" → "Multiple schedule drafts showing different coverage, cost, and fairness trade-offs"
- Delivery box description: removed "Excel workbook" from delivery list

### index.astro
- Removed CalloutWorkflow section (import and usage)

## [Unreleased] — 2026-03-03

### Email
- Changed contact email sitewide from `hello@simplescheduleai.com` to `support@simplescheduleai.com`
  - `src/pages/contact.astro`
  - `src/components/sections/Footer.astro`

### HeroVideo (homepage scheduler mock-up)
- Fixed low-contrast text: changed all role labels (RN, CNA, LPN) and section headers from `text-slate-500/600` to `text-slate-400` for legibility on dark background
- Replaced jargon with CNO-appropriate language:
  - "17 soft violations" → "17 fairness flags"
  - "0 hard violations" → "0 compliance violations"
  - "Soft Violations — 17 total" → "Fairness Flags: 17 total"
  - "13 hard rules — all passed" → "13 compliance rules, all passed"
  - "17 soft flags" → "17 fairness flags"
  - "1 soft" badge → "1 flag"
  - "5/3/2/1 violations" in Affected Staff panel → "5/3/2/1 flags"
- Removed em-dash from window chrome title: "CAH Scheduler — Week of Jun 2-8" → "CAH Scheduler: Week of Jun 2-8"

### How It Works page
- Added full "21 rules validated on every schedule" section between the 4-step workflow and FAQ:
  - Left card (dark red): 13 Compliance and Safety Rules — must pass on every draft
  - Right card (teal): 8 Fairness and Preference Goals — optimized on every draft
- Rule corrections based on clinical review:
  - Merged rules 4+5 (rest gap + night-to-day flip were the same concept) into: "Minimum rest between shifts: 11 hours standard, 12 hours after a night shift"
  - Replaced "Safe Harbor trigger documented when applicable" (not system-detectable) with: "All schedule changes are documented with the approver detail"
  - Replaced "No split-shift assignments..." (unclear) with: "No double-booking: a nurse cannot be assigned to overlapping shifts"
  - Weekend equity rule uses "should" language to reflect soft goal: "no nurse should work more than 3 weekends in any 6-week period"
  - Removed "(Christmas Eve and Day count as one)" parenthetical from holiday rule
- FAQ answer for "How is fairness tracked?" updated to remove Christmas Eve/Day parenthetical and clarify weekend language
- Removed em-dashes from all visible text throughout the page

### Pilot page
- Removed em-dashes from step headings:
  - "Initial setup — Week 1" → "Initial setup: Week 1"
  - "Weekly delivery cadence — Weeks 2 to 8" → "Weekly delivery cadence: Weeks 2 to 8"
  - "Strategic review — Day 60" → "Strategic review: Day 60"

### CalloutDetail section
- Removed em-dashes from all visible copy:
  - "Call-out at 2AM — what happens next" → "Call-out at 2AM: what happens next"
  - "James W. — Night shift, MS Unit." → "James W., Night shift, MS Unit."
  - "hours — 4 qualified nurses found" → "hours. 4 qualified nurses found."
  - "Manager approves — 1 click" → "Manager approves in 1 click"
  - "confirmed at 1.5× — charge mix protected on next shift" → "confirmed at 1.5x. Charge mix protected on next shift."
- Fixed unrendered markdown: `**Exceptions + Decisions Log**` → "Exceptions and Decisions Log" (plain text)

### BuiltForCAHs section
- Weekend fairness language changed to soft-goal phrasing: "No nurse should work more than 3 weekends per 6-week period"
- Holiday language simplified: "Fair rotation tracked annually across the team" (removed Christmas Eve/Day detail)
