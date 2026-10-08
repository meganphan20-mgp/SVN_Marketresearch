import { AnalyticsEvent, AnalyticsEventName, ExecutiveAnalyticsSummary } from '@/types/analytics';

const STORAGE_KEY = 'svn_analytics_events';
const SESSION_KEY = 'svn_anonymous_session_id';

export function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-session';
  }

  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function recordAnalyticsEvent(
  eventName: AnalyticsEventName,
  payload?: {
    storyId?: string | null;
    storyTitle?: string;
    reason?: string | null;
    comment?: string;
    sourceName?: string;
    sourceTier?: string;
    sourceUrl?: string;
    companySlug?: string;
    sectorSlug?: string;
    query?: string;
    scrollDepth?: number;
    weekSlug?: string;
    metadata?: Record<string, any>;
  }
) {
  if (typeof window === 'undefined') return;

  const sessionId = getAnonymousSessionId();
  const event: AnalyticsEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    eventName,
    anonymousSessionId: sessionId,
    sessionId,
    storyId: payload?.storyId || null,
    timestamp: new Date().toISOString(),
    metadata: {
      ...payload,
      path: window.location.pathname,
      userAgent: navigator.userAgent.slice(0, 100),
    },
  };

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const list: AnalyticsEvent[] = existing ? JSON.parse(existing) : [];
    list.unshift(event);
    // Keep last 500 events locally
    if (list.length > 500) list.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    // Forward to backend API asynchronously for Supabase persistence
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          storyId: payload?.storyId,
          anonymousSessionId: sessionId,
          payload: event.metadata,
        }),
      }).catch(() => {});

      if ((eventName === 'helpful_vote' || eventName === 'not_helpful_vote') && payload?.storyId) {
        fetch('/api/analytics/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId: payload.storyId,
            vote: eventName === 'helpful_vote' ? 'USEFUL' : 'NOT_USEFUL',
            reason: payload.reason,
            comment: payload.comment,
            anonymousSessionId: sessionId,
          }),
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Could not record analytics event locally:', err);
  }
}

// Generate realistic pre-seeded executive telemetry for /admin/analytics
export function getStoredAnalyticsSummary(): ExecutiveAnalyticsSummary {
  let localEvents: AnalyticsEvent[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) localEvents = JSON.parse(stored);
    } catch {}
  }

  // Counts of local events
  const localVotesUseful = localEvents.filter(e => e.eventName === 'helpful_vote').length;
  const localVotesNotUseful = localEvents.filter(e => e.eventName === 'not_helpful_vote').length;

  return {
    totalEventsTracked: 1845 + localEvents.length,
    uniqueSessions: 342 + (localEvents.length > 0 ? 1 : 0),
    mostViewedStories: [
      {
        storyId: 'story-001',
        title: 'Sumitomo Corp and BRG Group Break Ground on $4.2B North Hanoi Smart City with 100MW Clean Energy Grid',
        relevanceScore: 9,
        verificationStatus: 'VERIFIED',
        views: 312 + localEvents.filter(e => e.storyId === 'story-001' && e.eventName === 'story_open').length,
        usefulVotes: 48 + (localEvents.some(e => e.storyId === 'story-001' && e.eventName === 'helpful_vote') ? 1 : 0),
        notUsefulVotes: 2,
        usefulRatioPct: 96.0,
        deepReadsCount: 245,
        sourceClicksCount: 88,
      },
      {
        storyId: 'story-002',
        title: 'Vietnam Approves Landmark DPPA Decree Enabling Direct Green Power Purchase Between IPPs and Industrial Tenants',
        relevanceScore: 10,
        verificationStatus: 'VERIFIED',
        views: 288 + localEvents.filter(e => e.storyId === 'story-002' && e.eventName === 'story_open').length,
        usefulVotes: 54,
        notUsefulVotes: 1,
        usefulRatioPct: 98.2,
        deepReadsCount: 230,
        sourceClicksCount: 112,
      },
      {
        storyId: 'story-007',
        title: 'FPT Corporation and Nvidia Formalize $200M AI Factory Partnership for Vietnamese Sovereignty',
        relevanceScore: 8,
        verificationStatus: 'VERIFIED',
        views: 245,
        usefulVotes: 36,
        notUsefulVotes: 4,
        usefulRatioPct: 90.0,
        deepReadsCount: 180,
        sourceClicksCount: 64,
      },
      {
        storyId: 'story-003',
        title: 'Mitsui & Co. Finalizes $740M Gas Pipeline EPC Contract for Block B O Mon Power Complex',
        relevanceScore: 8,
        verificationStatus: 'PARTIALLY_VERIFIED',
        views: 198,
        usefulVotes: 29,
        notUsefulVotes: 3,
        usefulRatioPct: 90.6,
        deepReadsCount: 140,
        sourceClicksCount: 52,
      },
      {
        storyId: 'story-005',
        title: 'Becamex IDC and Sembcorp Announce 500-Hectare Net-Zero VSIP Industrial Park in Binh Duong',
        relevanceScore: 9,
        verificationStatus: 'VERIFIED',
        views: 176,
        usefulVotes: 31,
        notUsefulVotes: 2,
        usefulRatioPct: 93.9,
        deepReadsCount: 132,
        sourceClicksCount: 46,
      },
    ],
    mostUsefulStories: [
      {
        storyId: 'story-002',
        title: 'Vietnam Approves Landmark DPPA Decree Enabling Direct Green Power Purchase Between IPPs and Industrial Tenants',
        relevanceScore: 10,
        verificationStatus: 'VERIFIED',
        views: 288,
        usefulVotes: 54 + localVotesUseful,
        notUsefulVotes: 1 + localVotesNotUseful,
        usefulRatioPct: 98.2,
        deepReadsCount: 230,
        sourceClicksCount: 112,
      },
      {
        storyId: 'story-001',
        title: 'Sumitomo Corp and BRG Group Break Ground on $4.2B North Hanoi Smart City with 100MW Clean Energy Grid',
        relevanceScore: 9,
        verificationStatus: 'VERIFIED',
        views: 312,
        usefulVotes: 48,
        notUsefulVotes: 2,
        usefulRatioPct: 96.0,
        deepReadsCount: 245,
        sourceClicksCount: 88,
      },
      {
        storyId: 'story-005',
        title: 'Becamex IDC and Sembcorp Announce 500-Hectare Net-Zero VSIP Industrial Park in Binh Duong',
        relevanceScore: 9,
        verificationStatus: 'VERIFIED',
        views: 176,
        usefulVotes: 31,
        notUsefulVotes: 2,
        usefulRatioPct: 93.9,
        deepReadsCount: 132,
        sourceClicksCount: 46,
      },
    ],
    readingDepthFunnel: {
      opened: 1240,
      reached25: 1054, // 85%
      reached50: 890,  // 71.8%
      reached75: 682,  // 55%
      reached100: 496, // 40%
      completionRatePct: 40.0,
    },
    sourceClickThroughRates: [
      {
        sourceName: 'Ministry of Planning and Investment (MPI)',
        sourceTier: 'TIER_1',
        impressions: 890,
        clicks: 142,
        ctrPct: 15.96,
      },
      {
        sourceName: 'Nikkei Asia',
        sourceTier: 'TIER_1',
        impressions: 760,
        clicks: 128,
        ctrPct: 16.84,
      },
      {
        sourceName: 'Vietnam Investment Review (VIR)',
        sourceTier: 'TIER_2',
        impressions: 1120,
        clicks: 164,
        ctrPct: 14.64,
      },
      {
        sourceName: 'VnEconomy',
        sourceTier: 'TIER_2',
        impressions: 940,
        clicks: 118,
        ctrPct: 12.55,
      },
      {
        sourceName: 'The Investor',
        sourceTier: 'TIER_2',
        impressions: 680,
        clicks: 94,
        ctrPct: 13.82,
      },
      {
        sourceName: 'CafeF',
        sourceTier: 'TIER_3',
        impressions: 540,
        clicks: 42,
        ctrPct: 7.78,
      },
    ],
    topSectorsViewed: [
      { sectorSlug: 'industrial-parks', sectorName: 'Industrial Parks', viewCount: 412 },
      { sectorSlug: 'renewable-energy', sectorName: 'Renewable Energy', viewCount: 386 },
      { sectorSlug: 'logistics', sectorName: 'Logistics', viewCount: 295 },
      { sectorSlug: 'manufacturing', sectorName: 'Manufacturing', viewCount: 264 },
      { sectorSlug: 'retail', sectorName: 'Retail & Consumer', viewCount: 210 },
      { sectorSlug: 'ai', sectorName: 'AI & Data Centers', viewCount: 198 },
    ],
    topCompaniesSearched: [
      { companyName: 'Sumitomo Corporation', companySlug: 'sumitomo-corporation', searchAndClickCount: 184 },
      { companyName: 'Sojitz Corporation', companySlug: 'sojitz-corporation', searchAndClickCount: 172 },
      { companyName: 'Becamex IDC', companySlug: 'becamex-idc', searchAndClickCount: 146 },
      { companyName: 'Mitsui & Co.', companySlug: 'mitsui-and-co', searchAndClickCount: 128 },
      { companyName: 'Masan Group', companySlug: 'masan-group', searchAndClickCount: 115 },
      { companyName: 'Vingroup', companySlug: 'vingroup', searchAndClickCount: 104 },
    ],
    highRelevanceLowEngagementAnomalies: [
      {
        storyId: 'story-008',
        title: 'Hoa Phat Group Ships First Low-Carbon Container Batch to Europe from Hai Phong Port',
        relevanceScore: 8,
        confidenceScore: 92,
        views: 52,
        deepReads: 14,
        usefulRatioPct: 75.0,
        dropOffRatePct: 73.1,
        warningNote: 'High relevance score (8/10) but reading drop-off exceeds 70%. Summary may be overly technical or headline needs clearer BD framing for Sojitz shipping division.',
      },
      {
        storyId: 'story-006',
        title: 'Marubeni Kraft Paper Mill Expands Circular Packaging Capacity by 400,000 MT/Year in Ba Ria',
        relevanceScore: 8,
        confidenceScore: 95,
        views: 64,
        deepReads: 20,
        usefulRatioPct: 80.0,
        dropOffRatePct: 68.7,
        warningNote: 'Competitor movement story with low time-on-page. Readers drop off before reviewing why it matters to Sojitz paper trading arm.',
      },
    ],
  };
}
