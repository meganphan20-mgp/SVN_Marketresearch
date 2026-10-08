import { FreshnessBucket } from '@/types/intelligence';

/**
 * ARTICLE FRESHNESS CLASSIFICATION ENGINE (PHASE 1.2)
 * 
 * Rules:
 * TODAY:          0–24 hours
 * RECENT:         >24–72 hours
 * WEEKLY_CONTEXT: >72 hours–7 days (72–168 hours)
 * BACKGROUND:     >7–30 days (168–720 hours)
 * ARCHIVE:        >30 days (>720 hours)
 * 
 * Pipeline Gating:
 * - Daily Signal Discovery defaults to: TODAY + RECENT
 * - Weekly Intelligence may additionally use: WEEKLY_CONTEXT
 * - BACKGROUND and ARCHIVE records are persisted, but NEVER enter the daily Phase 2 pipeline.
 * - Freshness does NOT affect source URL validity (stored as independent attributes).
 */

export function classifyArticleFreshness(
  publishedAt: string | null,
  referenceTime?: string | Date
): {
  articleAgeHours: number | null;
  freshnessBucket: FreshnessBucket;
} {
  if (!publishedAt) {
    return {
      articleAgeHours: null,
      freshnessBucket: 'BACKGROUND',
    };
  }

  const pubTime = new Date(publishedAt).getTime();
  const refTime = referenceTime ? new Date(referenceTime).getTime() : Date.now();

  if (isNaN(pubTime)) {
    return {
      articleAgeHours: null,
      freshnessBucket: 'BACKGROUND',
    };
  }

  // Calculate age in hours (floor at 0 if publication timestamp has minor positive timezone skew)
  const diffHours = (refTime - pubTime) / (1000 * 3600);
  const articleAgeHours = Math.round(Math.max(0, diffHours) * 10) / 10;

  let freshnessBucket: FreshnessBucket;
  if (articleAgeHours <= 24) {
    freshnessBucket = 'TODAY';
  } else if (articleAgeHours <= 72) {
    freshnessBucket = 'RECENT';
  } else if (articleAgeHours <= 168) {
    freshnessBucket = 'WEEKLY_CONTEXT';
  } else if (articleAgeHours <= 720) {
    freshnessBucket = 'BACKGROUND';
  } else {
    freshnessBucket = 'ARCHIVE';
  }

  return {
    articleAgeHours,
    freshnessBucket,
  };
}

/**
 * Filter predicate for Daily Phase 2 pipeline consumption
 */
export function isEligibleForDailyAnalysis(freshnessBucket?: FreshnessBucket): boolean {
  return freshnessBucket === 'TODAY' || freshnessBucket === 'RECENT';
}

/**
 * Filter predicate for Weekly Phase 2 pipeline consumption
 */
export function isEligibleForWeeklyAnalysis(freshnessBucket?: FreshnessBucket): boolean {
  return freshnessBucket === 'TODAY' || freshnessBucket === 'RECENT' || freshnessBucket === 'WEEKLY_CONTEXT';
}
