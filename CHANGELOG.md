# Changelog

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
