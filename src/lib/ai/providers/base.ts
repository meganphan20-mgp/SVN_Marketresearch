import { ExtractedFacts, DetectedConflict, VerificationStatus, BusinessImpactType, IntelligenceStory } from '@/types/intelligence';
import { WeeklyReport } from '@/types/report';

export interface RawClusterArticle {
  sourceName: string;
  sourceTier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'DISCOVERY';
  url: string;
  publishedAt: string;
  content: string;
}

export interface AnalyzeClusterInput {
  clusterTitle: string;
  articles: RawClusterArticle[];
  taxonomySectors: string[];
  watchlistCompanies: string[];
}

export interface AnalyzedStoryOutput {
  title: string;
  summary: string;
  category: string;
  primarySectorSlug: string;
  primarySectorName: string;
  secondarySectorSlugs: string[];
  companiesMentioned: Array<{
    name: string;
    slug: string;
    ticker?: string;
    origin: 'VIETNAM' | 'JAPANESE_TRADING_HOUSE' | 'GLOBAL_OTHER';
    role?: string;
  }>;
  whyItMattersToSojitz: string;
  suggestedBdAction: string;
  businessImpact: BusinessImpactType;
  relevanceScore: number;
  verificationStatus: VerificationStatus;
  confidenceScore: number;
  verificationRationale: string;
  extractedFacts: ExtractedFacts;
  detectedConflicts: DetectedConflict[];
}

export interface SynthesizeWeeklyInput {
  year: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  stories: IntelligenceStory[];
}

export interface AIProvider {
  name: string;
  model: string;
  analyzeStory(input: AnalyzeClusterInput): Promise<AnalyzedStoryOutput>;
  synthesizeWeeklyReport(input: SynthesizeWeeklyInput): Promise<WeeklyReport>;
}
