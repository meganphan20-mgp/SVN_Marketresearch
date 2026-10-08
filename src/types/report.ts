import { IntelligenceStory } from './intelligence';

export interface ReportOpportunityItem {
  headline: string;
  targetCompanyOrProject: string;
  sector: string;
  strategicRationale: string;
  actionWindow: string;
}

export interface SuggestedBdAction {
  action: string;
  targetPartnerOrSector: string;
  priority: 'HIGH' | 'MEDIUM' | 'LONG_TERM';
  responsibleDivision: string;
  expectedOutcome: string;
}

export interface SectorIntelligenceItem {
  sectorName: string;
  keyTrend: string;
  implication: string;
}

export interface WeeklyReport {
  id: string;
  year: number;
  weekNumber: number;
  startDate: string; // ISO date (Monday)
  endDate: string;   // ISO date (Sunday)
  title: string;
  slug: string;
  
  // 12 Mandatory Report Sections
  executiveSummary: string;
  topDevelopments: Array<{
    title: string;
    summary: string;
    significance: string;
    storyId?: string;
  }>;
  topBusinessOpportunities: ReportOpportunityItem[];
  macroPolicy: string;
  maInvestment: string;
  japaneseCompanies: string;
  japaneseTradingHouses: string;
  vietnamCorporateWatch: string;
  sectorIntelligence: SectorIntelligenceItem[];
  risksAnalysis: string;
  whatSojitzShouldWatch: string;
  suggestedBdActions: SuggestedBdAction[];
  
  // Supporting references
  curatedStories: IntelligenceStory[];
  curatedStoryCount: number;
  isPublished: boolean;
  publishedAt: string;
  generatedAt: string;
}
