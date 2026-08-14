# Directory NAP Consistency Audit

Listings already created by founder. The open work is **not** creating listings, it is making sure every live listing describes the business **byte-identically**. Drift across Capterra/G2/Crunchbase silently weakens the entity signal. This file is the single source of truth to check each listing against.

---

## Canonical block (the truth — every listing must match this)

```
Business name:   SimpleScheduleAI
Website:         https://simplescheduleai.com
Contact email:   hello@simplescheduleai.com
Category:        Nurse scheduling software / Healthcare staff scheduling
Founder:         Pradeep Pandey, Co-founder
Founder profile: https://simplescheduleai.com/about/pradeep-pandey
Founder LinkedIn: https://www.linkedin.com/in/pradeep-pandeyji/
Company LinkedIn: https://www.linkedin.com/company/simplescheduleai
Location/market: Texas, United States. Serves Critical Access Hospitals (25 or fewer beds).
One-liner:       AI-native nurse scheduling software for Critical Access Hospitals
                 in Texas. Runs in the browser, no installation and no integration
                 project. $10 per user per month.
Long description (<=300 chars):
  SimpleScheduleAI is AI-native nurse scheduling software built for Critical
  Access Hospitals with 25 or fewer beds. It cuts the 8 to 12 weekly hours nurse
  managers spend on schedules and callouts, with Texas overtime compliance and a
  full audit trail. 21 automated rule checks validate every draft. $10 per user
  per month, or $100 per user per year. No setup fees.
```

**Mode note (this sheet is PRODUCT mode).** Software directories list products,
so this block uses the product column of `positioning-registry.md`: software
self-label, per-user pricing, and named absences ("no installation, no
integration project") rather than a bald "No IT". Do NOT paste the service-mode
flat price ($1,000 to $1,500/month) or "no per-nurse fees" here, because product
pricing IS per user. Journalist and association pitches are the opposite case and
use the SERVICE column; that block lives in `backlinks-playbook.md` §2.

---

## Audit pass (per existing listing)

For each live listing, confirm these match the block above. Note any mismatch and fix it on the platform, then tick.

| Listing               | Name | Website | Category | Description | Founder linked | Drift found? → fix |
| --------------------- | ---- | ------- | -------- | ----------- | -------------- | ------------------ |
| Capterra              | [ ]  | [ ]     | [ ]      | [ ]         | n/a            |                    |
| G2                    | [ ]  | [ ]     | [ ]      | [ ]         | n/a            |                    |
| Software Advice       | [ ]  | [ ]     | [ ]      | [ ]         | n/a            |                    |
| GetApp                | [ ]  | [ ]     | [ ]      | [ ]         | n/a            |                    |
| Crunchbase            | [ ]  | [ ]     | n/a      | [ ]         | [ ]            |                    |
| LinkedIn company page | [ ]  | [ ]     | [ ]      | [ ]         | n/a            |                    |
| Product Hunt          | [ ]  | [ ]     | n/a      | [ ]         | [ ]            |                    |

Most common drift: shortened/auto-truncated descriptions, a different category label, missing the "Critical Access Hospitals / 25 or fewer beds" qualifier, or website with/without trailing slash. Fix to match the block exactly.

Optional: paste the live profile URLs into the tracker and an automated fetch-and-diff against this block can be run to produce an exact per-field punch list.
