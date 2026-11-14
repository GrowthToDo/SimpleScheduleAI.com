// Thresholds, weights, presets and defaults for the SEO Desk.

import {
  WINDOW_LEN,
  END_LAG_DAYS,
  PAGE_MIN_PREV_IMP,
  PAGE_TOP_N,
  LOST_MIN_PREV_IMP,
  SPLIT_MIN_PAGES,
  SPLIT_MIN_IMP,
  SPLIT_MAX_TOP_SHARE,
  QUESTION_MIN_IMP,
  QUESTION_MIN_WORDS,
  QUESTION_WEAK_POS,
  NEAR_POS_MIN,
  NEAR_POS_MAX,
  NEAR_MIN_IMP,
  UNSERVED_MIN_IMP,
  UNSERVED_MIN_POS,
} from '../../scripts/lib/gsc-diagnose-core.mjs';

export const SITE = 'https://simplescheduleai.com';
export const GA4_PROPERTY = '528589584';
export const PORT = 8766;
export const STALE_HOURS = 12;
export const DAILY_HOUR = 6;

export const THRESHOLDS = {
  // Re-exported from scripts/lib/gsc-diagnose-core.mjs so the desk and the
  // monthly diagnose script judge the same way.
  WINDOW_LEN,
  END_LAG_DAYS,
  PAGE_MIN_PREV_IMP,
  PAGE_TOP_N,
  LOST_MIN_PREV_IMP,
  SPLIT_MIN_PAGES,
  SPLIT_MIN_IMP,
  SPLIT_MAX_TOP_SHARE,
  QUESTION_MIN_IMP,
  QUESTION_MIN_WORDS,
  QUESTION_WEAK_POS,
  NEAR_POS_MIN,
  NEAR_POS_MAX,
  NEAR_MIN_IMP,
  UNSERVED_MIN_IMP,
  UNSERVED_MIN_POS,
  // Desk-only.
  LOW_CTR_MIN_IMP: 200,
  SLIP_MIN_PREV_IMP: 50,
  SLIP_DROP: 0.3,
  NEEDS_LINKS_MIN: 2,
  PCT_MIN_BASE: 20,
};

// Weight per scoring signal; each preset sums to 1. "outcome" is the interest from visitors
// (form, calculator and template events per landing page); the older presets give it 0.05,
// taken from demand.
export const PRESETS = {
  balanced: { demand: 0.2, distance: 0.2, importance: 0.2, confidence: 0.15, effort: 0.1, ai: 0.1, outcome: 0.05 },
  'money-pages-first': {
    demand: 0.1,
    distance: 0.15,
    importance: 0.4,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.05,
    outcome: 0.05,
  },
  'findability-first': {
    demand: 0.3,
    distance: 0.3,
    importance: 0.1,
    confidence: 0.1,
    effort: 0.1,
    ai: 0.05,
    outcome: 0.05,
  },
  'ai-citations-first': {
    demand: 0.1,
    distance: 0.1,
    importance: 0.15,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.35,
    outcome: 0.05,
  },
  'interest-signals-first': {
    demand: 0.15,
    distance: 0.15,
    importance: 0.15,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.05,
    outcome: 0.25,
  },
};

export const DEFAULT_MONEY_PAGES = [
  '/',
  '/pricing',
  '/nurse-scheduling-software',
  '/ai-nurse-scheduling',
  '/critical-access-hospital-scheduling',
  '/how-it-works',
];

// Expected click rate by Google position, 1 to 20.
export const EXPECTED_CTR = {
  1: 0.28,
  2: 0.15,
  3: 0.1,
  4: 0.07,
  5: 0.05,
  6: 0.04,
  7: 0.03,
  8: 0.025,
  9: 0.02,
  10: 0.018,
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [11 + i, 0.01])),
};
