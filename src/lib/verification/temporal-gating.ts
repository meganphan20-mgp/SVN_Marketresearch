import crypto from 'crypto';

/**
 * PHASE 3.1: STRICT PUBLICATION-DATE GATING & TEMPORAL DEDUPLICATION
 * 
 * Strict Principle:
 * - DAILY intelligence feed contains ONLY news articles actually published on that calendar day.
 * - Timezone for all Daily/Weekly publication boundaries: Asia/Ho_Chi_Minh.
 * - Preserves date semantics:
 *     * published_at: timestamp supplied by publisher
 *     * source_publication_date_local: calendar date in Asia/Ho_Chi_Minh
 *     * event_date: actual date event occurred
 *     * fetched_at: crawler retrieval time
 *     * daily_brief_date: calendar day assigned from published_at in Asia/Ho_Chi_Minh
 * - Deduplication across different days: Same event repeated without material new fact is suppressed.
 * - Weekly Briefing: Monday 00:00:00 through Sunday 23:59:59 Asia/Ho_Chi_Minh.
 */

import { 
  SOJITZ_TIMEZONE,
  getLocalDateInTimeZone,
  getTodayLocal,
  getPublicationDateLocal,
  getCalendarDayBoundariesLocal,
  getCalendarWeekBoundariesLocal,
  CalendarDayBoundaries,
  CalendarWeekBoundaries,
} from '@/lib/utils/date-boundaries';

export {
  SOJITZ_TIMEZONE,
  getLocalDateInTimeZone,
  getTodayLocal,
  getPublicationDateLocal,
  getCalendarDayBoundariesLocal,
  getCalendarWeekBoundariesLocal,
};
export type { CalendarDayBoundaries, CalendarWeekBoundaries };

/**
 * Evaluates whether an article or story is eligible for a specific Daily Brief date.
 * Strict rule: DATE(source.published_at AT TIME ZONE 'Asia/Ho_Chi_Minh') === dailyBriefDate.
 */
export function isEligibleForDailyBrief(params: {
  sourcePublishedAt: string | Date | null | undefined;
  dailyBriefDate?: string;
}): {
  isEligible: boolean;
  sourcePublicationDateLocal: string | null;
  dailyBriefDate: string;
  reason: string;
} {
  const targetBriefDate = params.dailyBriefDate || getTodayLocal();
  const localPubDate = getPublicationDateLocal(params.sourcePublishedAt);

  if (!localPubDate) {
    return {
      isEligible: false,
      sourcePublicationDateLocal: null,
      dailyBriefDate: targetBriefDate,
      reason: 'Missing or unparseable source publication timestamp.'
    };
  }

  if (localPubDate === targetBriefDate) {
    return {
      isEligible: true,
      sourcePublicationDateLocal: localPubDate,
      dailyBriefDate: targetBriefDate,
      reason: `Eligible: Source published on ${localPubDate} (matches Daily date ${targetBriefDate}).`
    };
  }

  return {
    isEligible: false,
    sourcePublicationDateLocal: localPubDate,
    dailyBriefDate: targetBriefDate,
    reason: `Excluded from Daily ${targetBriefDate}: Source was published on ${localPubDate} (${localPubDate < targetBriefDate ? 'prior date' : 'future date'}).`
  };
}

/**
 * Evaluates whether a story is eligible for the current Weekly Briefing.
 * Strict rule: sourcePublicationDateLocal is between Monday and Sunday of target week.
 */
export function isEligibleForWeeklyBrief(params: {
  sourcePublishedAt: string | Date | null | undefined;
  targetWeekDate?: string;
}): {
  isEligible: boolean;
  sourcePublicationDateLocal: string | null;
  weekStart: string;
  weekEnd: string;
  reason: string;
} {
  const { weekStart, weekEnd } = getCalendarWeekBoundariesLocal(params.targetWeekDate);
  const localPubDate = getPublicationDateLocal(params.sourcePublishedAt);

  if (!localPubDate) {
    return {
      isEligible: false,
      sourcePublicationDateLocal: null,
      weekStart,
      weekEnd,
      reason: 'Missing or unparseable source publication timestamp.'
    };
  }

  if (localPubDate >= weekStart && localPubDate <= weekEnd) {
    return {
      isEligible: true,
      sourcePublicationDateLocal: localPubDate,
      weekStart,
      weekEnd,
      reason: `Eligible for Weekly Briefing (${weekStart} to ${weekEnd}): Source published on ${localPubDate}.`
    };
  }

  return {
    isEligible: false,
    sourcePublicationDateLocal: localPubDate,
    weekStart,
    weekEnd,
    reason: `Excluded from Weekly Briefing (${weekStart} to ${weekEnd}): Source published on ${localPubDate}.`
  };
}

/**
 * Generates deterministic event fingerprint for cross-day deduplication.
 */
export function generateEventFingerprint(params: {
  entities: Array<{ name: string }>;
  primaryEventType: string;
  geographies?: string[];
  primaryAsset?: string;
}): string {
  const normalizedEntities = (params.entities || [])
    .map(e => e.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, ''))
    .sort()
    .slice(0, 3)
    .join('_');

  const normalizedEventType = (params.primaryEventType || 'OTHER')
    .toUpperCase()
    .trim();

  const normalizedGeo = (params.geographies?.[0] || params.primaryAsset || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '');

  const rawKey = `${normalizedEntities}|${normalizedEventType}|${normalizedGeo}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex').slice(0, 32);
}

/**
 * Evaluates whether a newly published article on a known event represents a MATERIAL NEW FACT.
 * 
 * Material updates include:
 * - regulatory approval / license grant
 * - final deal signing / changed transaction value
 * - construction start / project completion
 * - named new partner / changed ownership
 * - cancellation / materially changed project scope
 */
export function evaluateMaterialUpdate(params: {
  existingStory: {
    eventStatus?: string;
    extractedFacts?: any;
    title: string;
  };
  newExtraction: {
    event_status?: string;
    numeric_facts?: any[];
    verified_facts?: any[];
    entities?: any[];
  };
}): {
  isMaterialUpdate: boolean;
  rationale?: string;
} {
  const { existingStory, newExtraction } = params;

  // 1. Status Progression Check
  const oldStatus = (existingStory.eventStatus || '').toUpperCase();
  const newStatus = (newExtraction.event_status || '').toUpperCase();

  if (oldStatus && newStatus && oldStatus !== newStatus) {
    if (
      (oldStatus === 'PROPOSED' && (newStatus === 'APPROVED' || newStatus === 'ANNOUNCED')) ||
      (oldStatus === 'ANNOUNCED' && (newStatus === 'UNDER_CONSTRUCTION' || newStatus === 'APPROVED')) ||
      (newStatus === 'COMPLETED' || newStatus === 'CANCELLED')
    ) {
      return {
        isMaterialUpdate: true,
        rationale: `Event status progressed materially from ${oldStatus} to ${newStatus}.`
      };
    }
  }

  // 2. Regulatory Approval Check
  const allNewClaimsText = [
    ...(newExtraction.verified_facts || []).map(f => f.claim_text || ''),
    ...(newExtraction.numeric_facts || []).map(f => f.source_text || ''),
  ].join(' ').toLowerCase();

  const approvalKeywords = [
    'phê duyệt', 'cấp phép', 'chấp thuận chủ trương', 'giấy chứng nhận đầu tư', 'khởi công', 'ký kết chính thức', 'hoàn thành', 'hủy bỏ',
    'regulatory approval', 'approved', 'license granted', 'investment certificate', 'construction start', 'groundbreaking', 'officially signed', 'final deal signing', 'completed', 'cancelled'
  ];
  for (const kw of approvalKeywords) {
    if (allNewClaimsText.includes(kw) && !existingStory.title.toLowerCase().includes(kw)) {
      return {
        isMaterialUpdate: true,
        rationale: `Material milestone detected in new source: contains "${kw}".`
      };
    }
  }

  // 3. Changed Transaction Value
  const oldVal = existingStory.extractedFacts?.dealValueUsd;
  const newVal = newExtraction.numeric_facts?.find(f => f.currency === 'USD' && f.numeric_value)?.numeric_value;
  if (oldVal && newVal && Math.abs(oldVal - newVal) > (oldVal * 0.05)) {
    return {
      isMaterialUpdate: true,
      rationale: `Materially changed transaction value from $${oldVal} to $${newVal}.`
    };
  }

  // 4. Default: No material new fact found (pure syndication / rewording)
  return {
    isMaterialUpdate: false,
    rationale: 'Article covers previously published event without material new verified facts or status changes.'
  };
}
