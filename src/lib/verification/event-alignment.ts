import { RawArticle, SourceRole, StorySourceLink } from '@/types/intelligence';
import { ArticleExtractionRecord } from '@/types/extraction';
import crypto from 'crypto';

/**
 * PHASE 3.2: SOURCE-EVENT ALIGNMENT ENGINE
 * 
 * Strict Principle:
 * A source is NOT valid merely because:
 * - URL exists
 * - publisher is trusted
 * - article contains the same company
 * - article is from the same date
 * - article is from the same sector
 * 
 * Every source attached to an intelligence story must pass THREE independent gates:
 * 1. URL_VALID (HTTP 200, valid canonical URL, fetch_verified)
 * 2. EVENT_MATCH (event_match_score >= 80)
 * 3. CORE_CLAIM_SUPPORTED (supported_core_claim_ids.length >= 1)
 * 
 * Source Roles:
 * - PRIMARY: Leading investigative/breaking source for the core event.
 * - CORROBORATING: Independent source confirming the core event and >= 1 core claim.
 * - BACKGROUND: Broader context (does NOT count towards verified_source_count or verification_status).
 */

export interface StoryEventDefinition {
  primaryEventType: string;
  primaryEntities: Array<{ name: string; role?: string }>;
  coreClaims: Array<{ id: string; claimText: string }>;
  projectOrAsset?: string;
  geography?: string;
  eventDate?: string;
  policyOrTransactionId?: string;
}

export interface SourceAlignmentResult {
  sourceId: string;
  isUrlValid: boolean;
  isEventMatched: boolean;
  isCoreClaimSupported: boolean;
  isAttachedValid: boolean;
  eventMatchScore: number;
  scoreBreakdown: {
    eventTypeScore: number;       // Max 25
    entityScore: number;          // Max 20
    claimOverlapScore: number;    // Max 25
    projectAssetScore: number;    // Max 10
    geographyScore: number;       // Max 10
    eventDateScore: number;       // Max 5
    transactionIdScore: number;   // Max 5
  };
  supportedCoreClaimIds: string[];
  sourceRole: SourceRole;
  rejectionReason?: string;
}

function normalizeStr(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Evaluates whether two entity sets overlap substantively.
 */
function computeEntityOverlap(
  sourceEntities: Array<{ name: string; role_in_event?: string }>,
  storyEntities: Array<{ name: string; role?: string }>
): number {
  if (!storyEntities || storyEntities.length === 0) return 0;
  if (!sourceEntities || sourceEntities.length === 0) return 0;

  const storyNorms = storyEntities.map(e => normalizeStr(e.name)).filter(Boolean);
  const sourceNorms = sourceEntities.map(e => normalizeStr(e.name)).filter(Boolean);

  let matchCount = 0;
  for (const sNorm of storyNorms) {
    if (sourceNorms.some(src => src.includes(sNorm) || sNorm.includes(src))) {
      matchCount++;
    }
  }

  return matchCount / storyNorms.length;
}

/**
 * Evaluates text similarity between two short claims.
 */
function computeClaimSimilarity(textA: string, textB: string): number {
  const normA = normalizeStr(textA);
  const normB = normalizeStr(textB);
  if (!normA || !normB) return 0;

  if (normA.includes(normB) || normB.includes(normA)) return 1.0;

  const wordsA = new Set(normA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normB.split(' ').filter(w => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let common = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }

  return (2 * common) / (wordsA.size + wordsB.size);
}

/**
 * Verifies the three independent gates for a source relative to an intelligence story.
 */
export function verifySourceEventAlignment(params: {
  article: RawArticle;
  extraction?: ArticleExtractionRecord | null;
  storyEvent: StoryEventDefinition;
  isPrimarySource?: boolean;
}): SourceAlignmentResult {
  const { article, extraction, storyEvent, isPrimarySource = false } = params;

  // -------------------------------------------------------------
  // GATE 1: URL_VALID
  // -------------------------------------------------------------
  const isUrlValid = Boolean(
    article.httpStatus === 200 &&
    article.fetchVerified &&
    article.finalUrl &&
    article.finalUrl.startsWith('http')
  );

  // -------------------------------------------------------------
  // GATE 2: EVENT_MATCH (Target: event_match_score >= 80)
  // Weighting:
  // - Primary event type:        25
  // - Primary entities:          20
  // - Core claim overlap:        25
  // - Project / asset identity:  10
  // - Geography:                 10
  // - Event date:                 5
  // - Transaction / policy ID:    5
  // -------------------------------------------------------------
  let eventTypeScore = 0;
  let entityScore = 0;
  let claimOverlapScore = 0;
  let projectAssetScore = 0;
  let geographyScore = 0;
  let eventDateScore = 0;
  let transactionIdScore = 0;

  const sourceEventType = extraction?.primary_event_type;
  if (sourceEventType && storyEvent.primaryEventType) {
    if (sourceEventType.toUpperCase() === storyEvent.primaryEventType.toUpperCase()) {
      eventTypeScore = 25;
    } else if (extraction?.secondary_event_types?.map(t => t.toUpperCase()).includes(storyEvent.primaryEventType.toUpperCase())) {
      eventTypeScore = 18;
    }
  }

  const sourceEntities = extraction?.entities || [];
  const entityOverlap = computeEntityOverlap(sourceEntities, storyEvent.primaryEntities);
  entityScore = Math.round(entityOverlap * 20);

  // Project or Asset Identity (10 pts)
  if (storyEvent.projectOrAsset) {
    const normAsset = normalizeStr(storyEvent.projectOrAsset);
    const contentToSearch = normalizeStr(`${article.title} ${article.cleanedContent?.slice(0, 2000)}`);
    if (contentToSearch.includes(normAsset)) {
      projectAssetScore = 10;
    }
  } else {
    // If no specific asset defined, default to full credit
    projectAssetScore = 10;
  }

  // Geography (10 pts)
  if (storyEvent.geography) {
    const normGeo = normalizeStr(storyEvent.geography);
    const sourceGeos = (extraction?.geographies || []).map(g => normalizeStr(g));
    const contentToSearch = normalizeStr(`${article.title} ${article.cleanedContent?.slice(0, 1000)}`);
    if (sourceGeos.some(g => g.includes(normGeo) || normGeo.includes(g)) || contentToSearch.includes(normGeo)) {
      geographyScore = 10;
    }
  } else {
    geographyScore = 10;
  }

  // Event Date (5 pts)
  if (storyEvent.eventDate && extraction?.event_date) {
    if (storyEvent.eventDate === extraction.event_date) {
      eventDateScore = 5;
    } else {
      const diffMs = Math.abs(new Date(storyEvent.eventDate).getTime() - new Date(extraction.event_date).getTime());
      if (diffMs <= 7 * 24 * 3600 * 1000) {
        eventDateScore = 3;
      }
    }
  } else {
    eventDateScore = 5;
  }

  // Transaction / Policy ID (5 pts)
  if (storyEvent.policyOrTransactionId) {
    const normId = normalizeStr(storyEvent.policyOrTransactionId);
    const contentToSearch = normalizeStr(`${article.title} ${article.cleanedContent?.slice(0, 2000)}`);
    if (contentToSearch.includes(normId)) {
      transactionIdScore = 5;
    }
  } else {
    transactionIdScore = 5;
  }

  // -------------------------------------------------------------
  // GATE 3: CORE CLAIM SUPPORT
  // For each story core claim, check if source provides explicit support
  // -------------------------------------------------------------
  const supportedCoreClaimIds: string[] = [];
  const sourceClaims = (extraction?.verified_facts || []).map(f => f.claim_text || '');
  const rawContent = article.cleanedContent || '';

  for (const coreClaim of storyEvent.coreClaims) {
    let claimSupported = false;

    // Direct match against extracted facts
    for (const srcClaim of sourceClaims) {
      if (computeClaimSimilarity(coreClaim.claimText, srcClaim) >= 0.55) {
        claimSupported = true;
        break;
      }
    }

    // Secondary match: check if key phrases from coreClaim appear in article body
    if (!claimSupported && rawContent) {
      const coreWords = normalizeStr(coreClaim.claimText).split(' ').filter(w => w.length > 3);
      if (coreWords.length >= 3) {
        const normContent = normalizeStr(rawContent.slice(0, 4000));
        const matchedWords = coreWords.filter(w => normContent.includes(w));
        if (matchedWords.length / coreWords.length >= 0.6) {
          claimSupported = true;
        }
      }
    }

    if (claimSupported) {
      supportedCoreClaimIds.push(coreClaim.id);
    }
  }

  if (storyEvent.coreClaims.length > 0) {
    const claimOverlapRatio = supportedCoreClaimIds.length / storyEvent.coreClaims.length;
    claimOverlapScore = Math.round(claimOverlapRatio * 25);
  } else {
    // If no explicit claims defined, evaluate content overlap
    claimOverlapScore = 20;
  }

  const eventMatchScore = Math.min(
    100,
    eventTypeScore + entityScore + claimOverlapScore + projectAssetScore + geographyScore + eventDateScore + transactionIdScore
  );

  const isEventMatched = eventMatchScore >= 80;
  const isCoreClaimSupported = supportedCoreClaimIds.length > 0;

  // -------------------------------------------------------------
  // SOURCE ROLE CLASSIFICATION
  // -------------------------------------------------------------
  let sourceRole: SourceRole = 'BACKGROUND';
  if (isPrimarySource) {
    sourceRole = 'PRIMARY';
  } else if (isUrlValid && isEventMatched && isCoreClaimSupported) {
    sourceRole = 'CORROBORATING';
  } else {
    sourceRole = 'BACKGROUND';
  }

  // Valid attachment requires all three gates
  const isAttachedValid = isUrlValid && isEventMatched && isCoreClaimSupported;

  let rejectionReason: string | undefined = undefined;
  if (!isUrlValid) {
    rejectionReason = `URL_VALID gate failed (HTTP ${article.httpStatus}, verified: ${article.fetchVerified}).`;
  } else if (!isEventMatched) {
    rejectionReason = `EVENT_MATCH gate failed (score: ${eventMatchScore}/100 < 80).`;
  } else if (!isCoreClaimSupported) {
    rejectionReason = `CORE_CLAIM_SUPPORTED gate failed (supported claims: 0). Source mentions related terms but does not support core claim.`;
  }

  return {
    sourceId: article.id,
    isUrlValid,
    isEventMatched,
    isCoreClaimSupported,
    isAttachedValid,
    eventMatchScore,
    scoreBreakdown: {
      eventTypeScore,
      entityScore,
      claimOverlapScore,
      projectAssetScore,
      geographyScore,
      eventDateScore,
      transactionIdScore,
    },
    supportedCoreClaimIds,
    sourceRole,
    rejectionReason,
  };
}
