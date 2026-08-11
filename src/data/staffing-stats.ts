// Single source of truth for the rural/CAH nurse staffing statistics.
// Imported by the statistics page AND by the .csv / .json endpoints that serve
// the same figures as a downloadable dataset, so the page, the download and the
// Dataset schema can never drift apart.

export const PAGE_URL = 'https://simplescheduleai.com/rural-hospital-nurse-staffing-statistics';

// Each stat is a self-contained, citable card. `embed` is the exact HTML a
// third party copies to their site; it links back to this hub (the point of
// an embeddable-statistics page). All figures are verified primaries — see the
// facts dossier and the Sources section below.
export const sections = [
  {
    id: 'cah-landscape',
    heading: 'Critical Access Hospital Landscape',
    intro:
      'Critical Access Hospitals (CAHs) are federally designated rural hospitals of 25 or fewer acute-care beds. For how scheduling actually works at that scale, see our guide to <a href="/critical-access-hospital-scheduling">critical access hospital scheduling</a>.',
    takeaway:
      'Nearly every Critical Access Hospital CEO calls nursing staff hard to recruit (94%), and there are 1,383 of these hospitals across the country.',
    stats: [
      {
        anchor: 'us-cah-count',
        value: '1,383',
        label: 'Certified Critical Access Hospitals in the U.S.',
        context: 'Rural hospitals of 25 or fewer acute-care beds, as of April 2026.',
        source: 'Flex Monitoring Team, Historical CAH Data',
        url: 'https://www.flexmonitoring.org/historical-cah-data-0',
      },
      {
        anchor: 'rural-closures',
        value: '197',
        label: 'Rural hospital closures and conversions since 2005',
        context: '109 fully closed and 88 converted to another care model; 154 of them since 2010.',
        source: 'UNC Sheps Center Rural Hospital Closures Tracker',
        url: 'https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/',
      },
      {
        anchor: 'cah-ceo-recruiting',
        value: '94%',
        label: 'CAH CEOs who found nursing staff hard to recruit',
        context: '86% also reported retention challenges (survey of 155 CAH CEOs, March–May 2022).',
        source: 'Flex Monitoring Team policy brief, February 2023',
        url: 'https://www.flexmonitoring.org/sites/flexmonitoring.umn.edu/files/media/CAH_workforce_during_COVID_Barriers_and_facilitators_for_recruiting_and_retaining_staff_2025.pdf',
      },
    ],
  },
  {
    id: 'national-staffing',
    heading: 'National Nurse Staffing & Turnover',
    intro:
      'The national figures below come from the 2026 NSI report (calendar-year 2025 data, 527 hospitals across 40 states). They set the backdrop small hospitals staff against; the <a href="/nurse-scheduling-software">nurse scheduling software</a> that fits a CAH has to move these numbers with far fewer resources.',
    takeaway:
      'Each nurse who leaves a hospital costs about $60,090 to replace, and the average hospital is already short 43 of them.',
    stats: [
      {
        anchor: 'rn-turnover',
        value: '17.6%',
        label: 'Average hospital RN turnover',
        context: '18.6% median, ranging from 5.6% to 40.0% depending on hospital size.',
        source: '2026 NSI National Health Care Retention & RN Staffing Report',
        url: 'https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf',
      },
      {
        anchor: 'rn-vacancy',
        value: '8.6%',
        label: 'National RN vacancy rate',
        context: 'One in three hospitals (33.1%) reports an RN vacancy rate above 10%.',
        source: '2026 NSI National Health Care Retention & RN Staffing Report',
        url: 'https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf',
      },
      {
        anchor: 'cost-per-rn',
        value: '$60,090',
        label: 'Cost of turning over one bedside RN',
        context:
          'The average hospital loses $4.2M–$6.2M a year to RN turnover; each 1% change is worth about $295,000 a year.',
        source: '2026 NSI National Health Care Retention & RN Staffing Report',
        url: 'https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf',
      },
      {
        anchor: 'rn-shortage',
        value: '158,600',
        label: 'NSI-estimated national RN shortage',
        context: 'About 43 unfilled RN positions at the average hospital; 78 days to recruit an experienced RN.',
        source: '2026 NSI National Health Care Retention & RN Staffing Report',
        url: 'https://www.nsinursingsolutions.com/documents/library/nsi_national_health_care_retention_report.pdf',
      },
    ],
  },
  {
    id: 'rural-access',
    heading: 'Rural Access & Workforce Projections',
    intro:
      'Rural facilities do not just have fewer nurses; they draw from a thinner pool that is projected to thin further. This is the structural reason a single callout can leave a CAH unit uncovered.',
    takeaway:
      'A rural county has about two-thirds the nurse density of a city, and by 2038 the rural nurse shortage is projected to reach 11%, versus 2% in metro areas.',
    stats: [
      {
        anchor: 'rn-density',
        value: '65.1 vs 99.5',
        label: 'RNs per 10,000 people, rural vs urban',
        context: 'Rural areas have roughly two-thirds the RN density of urban areas (2024 BLS OES data).',
        source: 'Rural Health Information Hub, Health Care Workforce',
        url: 'https://www.ruralhealthinfo.org/topics/health-care-workforce',
      },
      {
        anchor: 'rn-projection-2038',
        value: '108,960',
        label: 'Projected national RN FTE shortage by 2038',
        context: 'The nonmetro RN shortage is projected at 11%, versus 2% in metro areas.',
        source: 'HRSA / National Center for Health Workforce Analysis (December 2025)',
        url: 'https://bhw.hrsa.gov/data-research/projecting-health-workforce-supply-demand',
      },
    ],
  },
  {
    id: 'nurse-wages',
    heading: 'Registered Nurse Wages',
    intro:
      'Wage figures matter because overtime is charged at 1.5 times these rates. Catching overtime before a schedule posts is a direct cost lever; see <a href="/ai-nurse-scheduling">how AI nurse scheduling</a> flags approaching thresholds.',
    takeaway:
      'The median American nurse earns $97,550 a year ($95,970 in Texas), the wage base that every overtime hour is charged against.',
    stats: [
      {
        anchor: 'rn-wage-national',
        value: '$97,550',
        label: 'Median RN annual wage, national',
        context: 'About $46.90 per hour (BLS May 2025 OEWS wage data, via O*NET).',
        source: 'O*NET OnLine, 29-1141.00 (BLS May 2025 OEWS)',
        url: 'https://www.onetonline.org/link/localwages/29-1141.00?st=TX',
      },
      {
        anchor: 'rn-wage-texas',
        value: '$95,970',
        label: 'Median RN annual wage, Texas',
        context: 'About $46.14 per hour (BLS May 2025 OEWS wage data, via O*NET).',
        source: 'O*NET OnLine, 29-1141.00 (BLS May 2025 OEWS)',
        url: 'https://www.onetonline.org/link/localwages/29-1141.00?st=TX',
      },
    ],
  },
  {
    id: 'texas-cah',
    heading: 'The Texas Critical Access Hospital Picture',
    intro:
      'Texas has 91 Critical Access Hospitals today (Rural Health Information Hub, 2026), and it runs its own hospital nurse-staffing study, which lets us separate CAHs from other rural and non-rural hospitals. The figures below are from the Texas DSHS 2024 study (spring-2024 survey, published February 2025), which counted 86 CAHs in its survey frame at the time. For the compliance layer these facilities operate under, see <a href="/blog/texas-nursing-overtime-compliance-cah">Texas nursing overtime compliance</a>.',
    takeaway:
      'Texas Critical Access Hospitals fill their nursing jobs better than any other hospital type in the state, then lose those nurses faster than any of them.',
    stats: [
      {
        anchor: 'texas-cah-count',
        value: '86',
        label: 'Texas CAHs in the 2024 DSHS study frame',
        context:
          'The 2024 state survey counted 86 CAHs across 78 counties, of which 50 responded. The current federal count is 91 (Rural Health Information Hub, 2026).',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Rural/CAH factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_RuralCAH_accessible.pdf',
      },
      {
        anchor: 'texas-cah-vacancy',
        value: '11.6%',
        label: 'Texas CAH RN vacancy rate',
        context: 'Lower than rural non-CAH hospitals (14.3%) and non-rural hospitals (16.5%).',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Rural/CAH factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_RuralCAH_accessible.pdf',
      },
      {
        anchor: 'texas-cah-turnover',
        value: '18.2%',
        label: 'Texas CAH RN median turnover',
        context: 'The highest of the three groups (rural non-CAH 15.4%, non-rural 17.4%).',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Rural/CAH factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_RuralCAH_accessible.pdf',
      },
      {
        anchor: 'texas-cah-rn-mix',
        value: '61%',
        label: 'Share of Texas CAH nursing staff who are RNs',
        context: 'Versus 80.5% at non-rural hospitals; LVNs make up 16.4% of CAH nursing staff (vs 3.6%).',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Rural/CAH factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_RuralCAH_accessible.pdf',
      },
      {
        anchor: 'texas-cah-fte',
        value: '74%',
        label: 'Texas CAHs reporting no change in budgeted RN FTEs',
        context: 'Only 24% increased their budgeted RN FTEs, versus 36.3% no-change at non-rural hospitals.',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Rural/CAH factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_RuralCAH_accessible.pdf',
      },
      {
        anchor: 'texas-statewide-vacancy',
        value: '16.4%',
        label: 'Texas statewide hospital RN vacancy (2024)',
        context: 'Down from 17.6% in 2022; 8,575 of 52,369.8 RN FTEs statewide were vacant.',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Highlights factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_Highlights_accessible.pdf',
      },
      {
        anchor: 'texas-statewide-turnover',
        value: '23.2%',
        label: 'Texas statewide RN median facility turnover (2024)',
        context: 'Down from 28.3% in 2022.',
        source: 'Texas DSHS 2024 Hospital Nurse Staffing Study, Highlights factsheet',
        url: 'https://www.dshs.texas.gov/sites/default/files/chs/cnws/HNSS/2024/2024_HNSS_Highlights_accessible.pdf',
      },
    ],
  },
];

// Single source of truth for the freshness stamp: update BOTH values whenever a
// figure is re-verified. Wired to the visible "Updated" line and schema dateModified.
export const lastUpdated = 'July 25, 2026';
export const lastUpdatedISO = '2026-07-25';

export const allStats = sections.flatMap((s) => s.stats);
