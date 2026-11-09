# Brief: data-conversion section, ukg-migration-small-hospital (2026-11-09)

Method tags: DFS = DataForSEO MCP api_request; PW = Playwright MCP (ukg.com 403s curl/WebFetch even with a browser UA, Cloudflare challenge; Playwright loaded the pages); WF = WebFetch; WS = WebSearch; READ = repo file.

## 1. Search intent (DFS SERP live/advanced, US/en, depth 10, run 2026-11-09)

**Finding: the SERP intent is migrating TO UKG, not off it. The live post is written for the opposite intent.**

"ukg data conversion" (SERP): UKG Marketplace partner listings (Scanoptics x2, document scanning/data conversion "into the UKG product suite"), Mosaic Consulting "integrating third-party or legacy data into UKG Pro CORE utilizing UKG data conversion templates", UKG partner-certification page ("UKG Pro Data Conversion Certification"), day2hr.com ("migrates employee, payroll, and historical data from your legacy system into UKG Pro"), Rockcrest HR data conversion, TestAssure (Pro WFM migration testing, Jun 2026), Healthcare IT Leaders (Jul 2023). People Also Ask: "How do you do data conversion?", "Has UKG Dimensions changed?". Related: "ukg data conversion pdf / software / training". This is implementer-vendor territory, mostly UKG Pro (HCM) not scheduling.

"ukg migration" (SERP): AI Overview is entirely TO UKG Pro WFM from Workforce Central (cites archondatastore, HRchitect, Healthcare IT Leaders, TestAssure, UKG white paper and Migration Assessment PDF). Organic: HealthNET Systems ("more than a simple lift and shift"), Kaizen Analytix, Simms & Associates (Healthcare), Healthcare IT Leaders video, Settle (consulting-led delivery "$250K to $600K" per snippet), In-Workforce, HRchitect, Argano. Zero results about leaving UKG. Related searches are login queries.

Table stakes (every ranker covers): WFC to Pro WFM path, lift-and-shift vs transform, historical timecard/schedule data archived not converted, integrations rebuilt (Boomi), testing/parallel pay runs, dates (Dec 31 2025 / Mar 31 2027). Gap nobody fills: what this means for a 25-bed hospital with no IT, no consultant budget, and the option of leaving UKG instead of re-implementing it.

Volumes (DFS google_ads search_volume/live, US, run 2026-11-09): ukg migration 10/mo; workforce central end of life 10; kronos workforce central end of life 10 (20 in Oct 2025); ukg data conversion, ukg data migration, ukg pro wfm migration, kronos migration returned NO volume data (not the same as zero). Total demand is tiny; GSC (given) is the better signal: 19 / 4 / 1 impressions.

## 2. Primary sources (PW, 2026-11-09)

- WFC end of life date: NO primary UKG page stating the dates was reachable. UKG's healthcare EOL webinar replay (ukg.com/resources/webinar-replay/whats-scoop-workforce-central-end-life-qa-ukg-healthcare-customers) returned "You are not authorized to access this page." Keep secondary sources: Healthcare IT Leaders (WF, published Oct 20, 2022): "On October 20, 2022, [UKG] announced plans to retire its Workforce Central product"; "WFC customers on the Kronos Private Cloud (KPC) will have support until December 31, 2025"; "WFC customers that host on-premises will have support through March 31, 2027." RSM US (WF, Mar 20, 2024, rsmus.com/insights/technology/ukg/ukg-workforce-central-support-is-ending-do-you-have-a-plan): "Workforce Central on-premises end of engineering - Dec. 31, 2025"; "Workforce Central on-premises end of life - March 31, 2027"; "UKG Pro Workforce Management provides a migration path from the legacy solution." Nuance: engineering stopped Dec 31, 2025; March 31, 2027 is end of life/support. Say "support ends".
- Primary, reachable: https://www.ukg.com/support-policies-and-services (PW): UKG gives "notice of the date of termination of engineering for Workforce Central released versions ... typically eighteen months or more prior to the end of engineering date." Also "UKG may discontinue support for the Software upon 30 days written notice to Customer, or at the anniversary date of the relevant Agreement, whichever is longer." (This is UKG ending support, NOT a customer termination notice period.)
- Primary: https://www.ukg.com/learn/resources/white-paper/end-end-migration-ukg-pro-workforce-management (PW; gated behind a form, intro text only): "migrating to the UKG Pro Workforce Management (formerly known as UKG Dimensions) platform"; "How your existing reports and integrations can be converted or improved"; "Integration Hub, powered by Dell Boomi". Full text not reachable; its two PDFs (2025-09 CV1377 and 2023-09 SV0252 assessment) fetched but no text extractor available (no poppler), so UNREAD.

## 3. What conversion means (all vendor/partner; none is UKG data-object documentation)

- Healthcare IT Leaders (WF, Jul 27, 2023, UKG partner selling migration): "Data, such as timecard and schedule history does not migrate from WFC to UKG Dimensions."; "you will have to archive your existing WFC database for historical reporting."; "UKG does provide tools to help migrate a significant portion of the configuration"; "Advanced Scheduling may require more effort during migration." Nothing on employee records or accruals.
- HRchitect (WF, Jul 24 2024, updated Jul 1 2026, partner): "old and non-active configurations are not brought over during the migration to UKG Pro WFM"; integrations via Boomi. No accrual/timecard/pay-rule detail.
- Mosaic (WF): lists "Data Conversion" and "Integrations built" as a phase; no detail. HealthNET: 403 (snippet only: "While some elements can be migrated with ease, other elements will have to be ..."). 
- WS summaries (secondary, UNVERIFIED at source): pay/work rules need new configuration; WIM-based integrations do not carry over. Employee records and accrual balances: not confirmed by any source read. Label HYPOTHESIS that they convert via templates.
- So: schedules/timecard history = archived, not converted (partner-stated, consistent across sources); configuration = partly tool-migrated, partly rebuilt; integrations = rebuilt.

## 4. Customer data export

- Primary, WFC only: https://www.ukg.com/ukg-workforce-central-historical-data-options (PW): "You have multiple options to use your historical Workforce Central data post termination of your Workforce Central agreement, provided that you request a copy of your data from UKG within 30 days of termination." Options: Prime Care Technologies primeARCHIVE; "Store your database in your organization's network. You many then write SQL queries against the historical database running Microsoft SQL Server"; or a separate limited-use UKG license with UKG professional services installing WFC and a database copy.
- Pro WFM report-export / data-extract / Data Hub documentation: not publicly documented (library.ukg.com is login-gated per dossier 2026-11-03). WS found only third-party CSV connectors (Sourcetable, CData ODBC), not UKG docs.

## 5. What SimpleScheduleAI can and cannot say (READ product-capability-inventory-2026-08.md 1b, 3.7, 6)

Can say (BOTH modes, service-critical): Excel roster import (5-sheet template, per-row validation errors shown before commit); roster export to Excel (GET /api/import, round-trips into import template, "no data lock-in out"); schedule export to Excel (grid, leave and callouts, per-staff); audit trail CSV. Service copy: describe what ARRIVES (we load your roster from a spreadsheet at onboarding; you get Excel/PDF), not buttons. Caveat: the only UI button for roster export is mislabelled "Download Template"; avoid "export your data any time" until fixed (open question 11). Import is destructive (replaces all data).
Must not say: payroll/HRIS integration, UKG/Kronos integration, time clock or punches or timecard history, credential expiry tracking (certifications are plain strings, no dates), labor cost in dollars, nurse self-service import, EHR integration.

## 6. Existing post claims (post lines 31, 93-97, 167, 208-242)

- "UKG exports sometimes truncate certification records or omit per-diem staff": UNVERIFIED. No source found; no UKG doc, no partner source. Remove or recast as "check certifications and per-diem staff for completeness" (an instruction, not a claim). Also "certifications and expiration dates" in the roster list conflicts with SSAI having no expiry tracking.
- "export format is their format, not a universal standard ... proprietary database structure": PARTLY supported. UKG's own page says the WFC historical database runs on Microsoft SQL Server (a standard engine), schema is UKG's. "Proprietary" is an unsupported characterisation; "5-10 hours of cleaning" is also unsourced.
- "UKG contracts typically include 30-90 day termination notice and often auto-renew": UNVERIFIED. Contract terms are customer-specific; the only UKG policy text found (30 days written notice) is UKG discontinuing support, a different thing. Recast as "check your contract" with no typical range.
- Post-wide issue: "UKG will provide it on request during the contract period" conflicts with UKG's own page (WFC: request within 30 days AFTER termination). Verify before keeping.

## Proposed H2 and outline

H2: **What Happens to Your Schedule and Staff Data When You Move Off UKG Workforce Central?**
- Open with who this is for: Workforce Central on-premises, support ends March 31, 2027 (Private Cloud ended Dec 31, 2025; cite Healthcare IT Leaders and RSM, not UKG).
- Two paths: re-implement on UKG Pro Workforce Management (UKG names it the migration path) or move to something else; the data question is the same.
- What partners say does not convert: timecard and schedule history; archive the WFC database (HITL quote).
- What is rebuilt: integrations (Boomi), non-active configuration left behind, pay/work rules need re-setup (attribute to partners).
- What you can keep: UKG's own page: request a copy within 30 days of termination; options include SQL Server on your network, archive service.
- What a small hospital actually needs: a clean roster (names, employment type incl. per-diem, units, seniority) as a spreadsheet; schedule history is a want, not a need.
- How SSAI handles it (service voice): we load the roster from an Excel file during onboarding and you can get your data back out as Excel.

## Claims we must NOT make

- Any WFC to Pro WFM data-object list (employee records, accruals convert) as fact; any UKG-stated "does not migrate" (the quote is a partner's).
- A UKG page as source for the EOL dates; a typical notice period; "export truncates certifications/omits per-diem"; "5-10 hours".
- SSAI integrates with, imports directly from, or reads UKG; imports timecards/punches/accruals/pay rules; tracks credential expiry; replaces payroll or timekeeping.
- Costs/timelines ($250K-$600K, 6-15 months) as UKG guidance (consultant marketing).
- Em-dashes, "CAH" in the H2, nurses logging in (service mode).
