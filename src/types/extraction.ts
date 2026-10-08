/**
 * PHASE 2A / 2A.1: FACT & EVENT EXTRACTION TYPES
 * 
 * Strict Principle:
 * - Factual extraction ONLY.
 * - Answers: "WHAT HAPPENED?"
 * - Does NOT answer: "WHY IT MATTERS", "IS THIS AN OPPORTUNITY", "WHAT BD SHOULD DO".
 * - 100% traceability to raw_article_id.
 * - Single controlled enum for primary_event_type (no composite values).
 * - Entity classification separated from event role.
 * - Numeric qualifier preservation.
 */

export const EVENT_TYPES = [
  'INVESTMENT',
  'CAPEX',
  'NEW_FACTORY',
  'EXPANSION',
  'M&A',
  'JV',
  'PARTNERSHIP',
  'MARKET_ENTRY',
  'NEW_STORE',
  'NEW_PROJECT',
  'REGULATION',
  'POLICY_CHANGE',
  'LAND_TRANSACTION',
  'HOTEL_DEVELOPMENT',
  'LOGISTICS_PROJECT',
  'ENERGY_PROJECT',
  'PRODUCT_LAUNCH',
  'CORPORATE_RESTRUCTURING',
  'FINANCING',
  'IPO',
  'DIVESTMENT',
  'COMPETITOR_MOVE',
  'OTHER'
] as const;

export type EventType = typeof EVENT_TYPES[number];

export function isValidEventType(val: unknown): val is EventType {
  if (typeof val !== 'string') return false;
  if (val.includes('/') || val.includes(',') || val.includes('+')) return false;
  return EVENT_TYPES.includes(val as EventType);
}

export type EventStatus =
  | 'ANNOUNCED'
  | 'PLANNED'
  | 'PROPOSED'
  | 'APPROVED'
  | 'UNDER_CONSTRUCTION'
  | 'LAUNCHED'
  | 'COMPLETED'
  | 'ONGOING'
  | 'CANCELLED'
  | 'UNKNOWN';

export const EVENT_STATUSES = [
  'ANNOUNCED',
  'PLANNED',
  'PROPOSED',
  'APPROVED',
  'UNDER_CONSTRUCTION',
  'LAUNCHED',
  'COMPLETED',
  'ONGOING',
  'CANCELLED',
  'UNKNOWN'
] as const;

export type EntityType =
  | 'COMPANY'
  | 'GOVERNMENT_AGENCY'
  | 'INVESTOR'
  | 'PARTNER'
  | 'SUBSIDIARY'
  | 'PERSON'
  | 'LOCATION'
  | 'PROJECT'
  | 'BRAND';

export const EVENT_ROLES = [
  'INVESTOR',
  'DEVELOPER',
  'ACQUIRER',
  'TARGET',
  'SELLER',
  'BUYER',
  'PARTNER',
  'SUPPLIER',
  'CUSTOMER',
  'FINANCIER',
  'REGULATOR',
  'PROJECT_OWNER',
  'SUBJECT',
  'OTHER'
] as const;

export type EventRole = typeof EVENT_ROLES[number];

export function isValidEventRole(val: unknown): val is EventRole {
  return typeof val === 'string' && EVENT_ROLES.includes(val as EventRole);
}

export interface ExtractedEntity {
  name: string;
  entity_type: EntityType;
  entity_subtype?: string | null;
  role_in_event: EventRole;
  aliases_found: string[];
}

export const NUMERIC_QUALIFIERS = [
  'EXACT',
  'APPROXIMATELY',
  'UP_TO',
  'AT_LEAST',
  'MORE_THAN',
  'LESS_THAN',
  'EXPECTED',
  'TARGET',
  'RANGE'
] as const;

export type NumericQualifier = typeof NUMERIC_QUALIFIERS[number];

export interface ExtractedNumericFact {
  fact_type: string;
  raw_value: string;
  numeric_value: number | null;
  currency: string | null;
  unit: string | null;
  qualifier: NumericQualifier;
  source_text: string;
}

export interface ExtractedClaim {
  claim_id: string;
  claim_text: string;
  evidence_text: string;
  raw_article_id: string;
  source_id: string;
  source_url: string;
  confidence: number; // 0 - 100
  evidence_start_offset?: number | null;
  evidence_end_offset?: number | null;
}

export interface ArticleExtractionRecord {
  id: string;
  raw_article_id: string;
  source_url: string;
  publisher: string;
  published_at: string | null;

  meaningful_event_detected: boolean;

  primary_event_type: EventType;
  secondary_event_types: EventType[];

  event_date: string | null;
  event_date_confidence: number | null;
  event_date_source: string | null;
  event_status: EventStatus;

  sectors: string[];
  sub_sectors: string[];
  geographies: string[];

  entities: ExtractedEntity[];

  numeric_facts: ExtractedNumericFact[];

  verified_facts: ExtractedClaim[];
  explicit_company_statements: ExtractedClaim[];
  source_attributed_claims: ExtractedClaim[];
  uncertainties: ExtractedClaim[];

  event_detection_confidence: number; // 0 - 100
  extraction_quality_score: number | null; // 0 - 100 (null if meaningful_event_detected is false)
  extraction_metadata?: {
    entity_score: number;       // max 25
    event_score: number;        // max 25
    traceability_score: number; // max 25
    numeric_score: number;      // max 15
    uncertainty_score: number;  // max 10
  };
}
