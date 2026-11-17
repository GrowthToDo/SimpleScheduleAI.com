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
// taken from demand. "upside" is the extra clicks a month an opportunity could bring, from the
// site's own click rates (lib/upside.mjs): every preset gives it 0.21, taken evenly (0.03 each)
// from the other seven, so each preset keeps its own leaning.
const UPSIDE_SHARE = 0.03;
const withUpside = (w) => {
  const out = {};
  for (const [k, v] of Object.entries(w)) out[k] = Math.round((v - UPSIDE_SHARE) * 1000) / 1000;
  out.upside = Math.round(UPSIDE_SHARE * Object.keys(w).length * 1000) / 1000;
  return out;
};
export const PRESETS = {
  balanced: withUpside({
    demand: 0.2,
    distance: 0.2,
    importance: 0.2,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.1,
    outcome: 0.05,
  }),
  'money-pages-first': withUpside({
    demand: 0.1,
    distance: 0.15,
    importance: 0.4,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.05,
    outcome: 0.05,
  }),
  'findability-first': withUpside({
    demand: 0.3,
    distance: 0.3,
    importance: 0.1,
    confidence: 0.1,
    effort: 0.1,
    ai: 0.05,
    outcome: 0.05,
  }),
  'ai-citations-first': withUpside({
    demand: 0.1,
    distance: 0.1,
    importance: 0.15,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.35,
    outcome: 0.05,
  }),
  'interest-signals-first': withUpside({
    demand: 0.15,
    distance: 0.15,
    importance: 0.15,
    confidence: 0.15,
    effort: 0.1,
    ai: 0.05,
    outcome: 0.25,
  }),
};

export const DEFAULT_MONEY_PAGES = [
  '/',
  '/pricing',
  '/nurse-scheduling-software',
  '/ai-nurse-scheduling',
  '/critical-access-hospital-scheduling',
  '/how-it-works',
];
