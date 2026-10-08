/**
 * PHASE 2B: POTENTIAL SIGNAL PICKUP & RELEVANCE SCORING TYPES
 * 
 * Strict Principle:
 * - Relevance evaluation strictly grounded in Sojitz Vietnam Knowledge Bank.
 * - Evaluates source-derived facts from Phase 2A extractions.
 * - Scores on 1 to 10 scale adhering to Sojitz rubric.
 * - Does NOT generate BD actions or intelligence stories yet (Phase 3).
 */

export type BusinessImpactType =
  | 'OPPORTUNITY'
  | 'PARTNERSHIP'
  | 'MA_INVESTMENT'
  | 'COMPETITOR_MOVEMENT'
  | 'RISK'
  | 'MARKET_INTELLIGENCE';

export type StrategicStatus = 'OPPORTUNITY' | 'RISK' | 'WATCH';

export type SignalStrength = 'HIGH' | 'MEDIUM' | 'LOW';

export type TriageOutcome = 'DROP' | 'WATCH' | 'PICK_UP' | 'RESEARCH';

export interface MatchedCompanyRef {
  company_id: string;
  name: string;
  role: string;
  origin: string;
}

export interface MatchedSectorRef {
  sector_id: string;
  name: string;
  slug: string;
  priority: 'PRIORITY_1' | 'PRIORITY_2' | 'MONITORING';
}

export type SojitzRelevanceCriterion =
  | 'DIRECT_SOJITZ_BUSINESS'
  | 'POTENTIAL_COUNTERPARTY'
  | 'COMMERCIAL_TRANSACTION'
  | 'REGULATORY_POLICY_CHANGE'
  | 'COMPETITOR_ACTIVITY'
  | 'JAPANESE_BUSINESS_IN_VN'
  | 'SECTOR_STRATEGIC_PRIORITY'
  | 'EMERGING_CUSTOMER_DEMAND'
  | 'TECH_INFRA_STRUCTURE'
  | 'SIGNIFICANT_RISK';

export interface ArticleRelevanceScoreRecord {
  id: string;
  raw_article_id: string;
  extraction_id: string;
  
  signal_detected: boolean;
  signal_type: string;
  signal_strength: SignalStrength;

  matched_divisions: string[];
  matched_assets: string[];
  matched_competitors: string[];
  matched_priorities: string[];

  relevance_score: number; // 1 to 10
  relevance_rationale: string;

  triage_outcome: TriageOutcome; // 'DROP' | 'WATCH' | 'PICK_UP' | 'RESEARCH'
  triage_rationale?: string;

  business_impact: BusinessImpactType;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  strategic_status: StrategicStatus;

  primary_sector_id: string | null;
  primary_sector_name: string;
  secondary_sector_ids: string[];
  matched_companies: MatchedCompanyRef[];

  is_high_priority: boolean; // relevance_score >= 8

  scoring_metadata?: {
    asset_match_score: number;
    division_match_score: number;
    competitor_impact_score: number;
    sector_priority: string;
    rubric_tier: string;
    matched_criteria?: SojitzRelevanceCriterion[];
    disqualification_reasons?: string[];
    has_reasonable_business_connection?: boolean;
  };
}
