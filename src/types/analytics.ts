export type AnalyticsEventName =
  | 'dashboard_view'
  | 'story_impression'
  | 'story_open'
  | 'story_scroll_25'
  | 'story_scroll_50'
  | 'story_scroll_75'
  | 'story_scroll_100'
  | 'source_expand'
  | 'source_click'
  | 'company_click'
  | 'sector_click'
  | 'helpful_vote'
  | 'not_helpful_vote'
  | 'search'
  | 'filter'
  | 'weekly_report_open'
  | 'weekly_report_complete';

export interface AnalyticsEvent {
  id: string;
  eventName: AnalyticsEventName;
  userId?: string | null;
  anonymousSessionId: string;
  storyId?: string | null;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ReadingDepthStats {
  opened: number;
  reached25: number;
  reached50: number;
  reached75: number;
  reached100: number;
  completionRatePct: number;
}

export interface StoryEngagementMetrics {
  storyId: string;
  title: string;
  relevanceScore: number;
  verificationStatus: string;
  views: number;
  usefulVotes: number;
  notUsefulVotes: number;
  usefulRatioPct: number;
  deepReadsCount: number; // reached 50%+
  sourceClicksCount: number;
}

export interface AnomalyStoryItem {
  storyId: string;
  title: string;
  relevanceScore: number;
  confidenceScore: number;
  views: number;
  deepReads: number;
  usefulRatioPct: number;
  dropOffRatePct: number;
  warningNote: string;
}

export interface ExecutiveAnalyticsSummary {
  totalEventsTracked: number;
  uniqueSessions: number;
  mostViewedStories: StoryEngagementMetrics[];
  mostUsefulStories: StoryEngagementMetrics[];
  readingDepthFunnel: ReadingDepthStats;
  sourceClickThroughRates: Array<{
    sourceName: string;
    sourceTier: string;
    impressions: number;
    clicks: number;
    ctrPct: number;
  }>;
  topSectorsViewed: Array<{
    sectorSlug: string;
    sectorName: string;
    viewCount: number;
  }>;
  topCompaniesSearched: Array<{
    companyName: string;
    companySlug: string;
    searchAndClickCount: number;
  }>;
  highRelevanceLowEngagementAnomalies: AnomalyStoryItem[];
}
