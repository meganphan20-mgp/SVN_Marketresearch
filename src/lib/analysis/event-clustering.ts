import { RawArticle, EventCluster, SourceRole } from '@/types/intelligence';
import { ArticleExtractionRecord } from '@/types/extraction';
import { ArticleRelevanceScoreRecord } from '@/types/relevance';
import { getPostgresPool } from '@/lib/database/postgres';
import { evaluateMaterialUpdate } from '@/lib/verification/temporal-gating';
import crypto from 'crypto';

/**
 * PHASE 3.2: EVENT-LEVEL DEDUPLICATION & CLUSTERING ENGINE
 * 
 * Strict Principle:
 * Article deduplication is not sufficient.
 * Multiple publishers reporting the same event must produce ONE intelligence story.
 * 
 * Flow:
 * RAW ARTICLES -> EXTRACTIONS -> EVENT CLUSTERS -> CANONICAL FACTS -> ONE INTELLIGENCE STORY
 */

export interface CandidateExtractionItem {
  article: RawArticle;
  extraction: ArticleExtractionRecord;
  relevance: ArticleRelevanceScoreRecord;
}

export interface EventFingerprintInput {
  primaryEventType: string;
  entities: Array<{ name: string; role_in_event?: string; role?: string }>;
  projectOrAsset?: string;
  geography?: string;
  eventDate?: string;
  policyOrTransactionId?: string;
}

function normalizeKey(str?: string | null): string {
  if (!str) return '';
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')
    .trim();
}

/**
 * Generates a normalized, deterministic event fingerprint.
 * Format: EVENT_TYPE|ENTITIES|PROJECT_ASSET|GEO|DATE|ID
 * Example: PARTNERSHIP|ALSTOM_VINGROUP|HANOI_METRO|VN|2026-10-06
 */
export function generateCanonicalEventFingerprint(input: EventFingerprintInput): string {
  const eventType = normalizeKey(input.primaryEventType) || 'GENERAL_EVENT';
  
  const entities = (input.entities || [])
    .map(e => normalizeKey(e.name))
    .filter(Boolean)
    .sort()
    .slice(0, 3)
    .join('_') || 'UNKNOWN_ENTITY';

  const asset = normalizeKey(input.projectOrAsset) || 'GENERAL_ASSET';
  const geo = normalizeKey(input.geography) || 'VN';
  const eventDate = input.eventDate ? input.eventDate.slice(0, 10) : 'UNDATED';
  const txId = normalizeKey(input.policyOrTransactionId) || 'NO_TX';

  return `${eventType}|${entities}|${asset}|${geo}|${eventDate}|${txId}`;
}

/**
 * Calculates similarity between two event representations.
 * Score 0 to 100.
 * Weighting:
 * - Entity overlap:            25
 * - Event type:                 20
 * - Project / asset identity:   20
 * - Core claim similarity:      20
 * - Geography:                   5
 * - Event date proximity:       10
 */
export function computeSameEventScore(
  a: {
    primaryEventType: string;
    entities: Array<{ name: string }>;
    projectOrAsset?: string;
    geography?: string;
    eventDate?: string;
    claimsText?: string;
  },
  b: {
    primaryEventType: string;
    entities: Array<{ name: string }>;
    projectOrAsset?: string;
    geography?: string;
    eventDate?: string;
    claimsText?: string;
  }
): {
  score: number;
  breakdown: Record<string, number>;
  isSameEvent: boolean;
} {
  let entityScore = 0;
  let eventTypeScore = 0;
  let projectAssetScore = 0;
  let claimScore = 0;
  let geoScore = 0;
  let dateScore = 0;

  // 1. Entity Overlap (25 pts)
  const normAEntities = new Set(a.entities.map(e => normalizeKey(e.name)).filter(Boolean));
  const normBEntities = new Set(b.entities.map(e => normalizeKey(e.name)).filter(Boolean));
  if (normAEntities.size > 0 && normBEntities.size > 0) {
    let matches = 0;
    for (const ent of normAEntities) {
      if (normBEntities.has(ent) || Array.from(normBEntities).some(bEnt => bEnt.includes(ent) || ent.includes(bEnt))) {
        matches++;
      }
    }
    const overlapRatio = matches / Math.min(normAEntities.size, normBEntities.size);
    entityScore = Math.round(overlapRatio * 25);
  }

  // 2. Event Type (20 pts)
  const typeA = normalizeKey(a.primaryEventType);
  const typeB = normalizeKey(b.primaryEventType);
  if (typeA && typeB && typeA === typeB) {
    eventTypeScore = 20;
  } else if (typeA && typeB && (typeA.includes(typeB) || typeB.includes(typeA))) {
    eventTypeScore = 14;
  }

  // 3. Project / Asset Identity (20 pts)
  const assetA = normalizeKey(a.projectOrAsset);
  const assetB = normalizeKey(b.projectOrAsset);
  if (assetA && assetB && assetA === assetB) {
    projectAssetScore = 20;
  } else if (assetA && assetB && (assetA.includes(assetB) || assetB.includes(assetA))) {
    projectAssetScore = 15;
  } else if (!assetA && !assetB) {
    // If neither has a specialized asset, grant default proportional points
    projectAssetScore = 15;
  }

  // 4. Core Claim Similarity (20 pts)
  const textA = (a.claimsText || '').toLowerCase();
  const textB = (b.claimsText || '').toLowerCase();
  if (textA && textB) {
    const wordsA = new Set(textA.split(/[^a-z0-9]+/i).filter(w => w.length > 3));
    const wordsB = new Set(textB.split(/[^a-z0-9]+/i).filter(w => w.length > 3));
    if (wordsA.size > 0 && wordsB.size > 0) {
      let common = 0;
      for (const w of wordsA) {
        if (wordsB.has(w)) common++;
      }
      const similarity = (2 * common) / (wordsA.size + wordsB.size);
      claimScore = Math.round(similarity * 20);
    }
  } else {
    claimScore = 10;
  }

  // 5. Geography (5 pts)
  const geoA = normalizeKey(a.geography);
  const geoB = normalizeKey(b.geography);
  if (geoA && geoB && (geoA === geoB || geoA.includes(geoB) || geoB.includes(geoA))) {
    geoScore = 5;
  } else if (!geoA || !geoB) {
    geoScore = 3;
  }

  // 6. Event Date Proximity (10 pts)
  if (a.eventDate && b.eventDate) {
    if (a.eventDate.slice(0, 10) === b.eventDate.slice(0, 10)) {
      dateScore = 10;
    } else {
      const msA = new Date(a.eventDate).getTime();
      const msB = new Date(b.eventDate).getTime();
      const diffDays = Math.abs(msA - msB) / (24 * 3600 * 1000);
      if (diffDays <= 3) dateScore = 8;
      else if (diffDays <= 7) dateScore = 5;
    }
  } else {
    dateScore = 8;
  }

  const score = Math.min(100, entityScore + eventTypeScore + projectAssetScore + claimScore + geoScore + dateScore);
  const isSameEvent = score >= 85;

  return {
    score,
    breakdown: {
      entityScore,
      eventTypeScore,
      projectAssetScore,
      claimScore,
      geoScore,
      dateScore,
    },
    isSameEvent,
  };
}

/**
 * Finds an existing event cluster in PostgreSQL matching the candidate,
 * or creates a new one.
 */
export async function findOrCreateEventCluster(candidate: CandidateExtractionItem): Promise<{
  cluster: EventCluster;
  isExisting: boolean;
  sameEventScore?: number;
}> {
  const pool = getPostgresPool();
  const { article, extraction, relevance } = candidate;

  const projectOrAsset = relevance.matched_assets[0] || undefined;
function toValidDateString(dateStr?: string | null, fallback?: string): string | null {
  if (!dateStr) return fallback && /^\d{4}-\d{2}-\d{2}$/.test(fallback) ? fallback : null;
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  if (fallback && /^\d{4}-\d{2}-\d{2}$/.test(fallback)) {
    return fallback;
  }
  return null;
}

  const primaryEntities = extraction.entities.map(e => ({ name: e.name, role: e.role_in_event }));
  const geography = extraction.geographies[0] || 'Vietnam';
  const eventDate = extraction.event_date || article.publishedAt?.slice(0, 10) || undefined;
  const sanitizedEventDate = toValidDateString(extraction.event_date, article.publishedAt?.slice(0, 10));

  const candidateFingerprint = generateCanonicalEventFingerprint({
    primaryEventType: extraction.primary_event_type,
    entities: primaryEntities,
    projectOrAsset,
    geography,
    eventDate,
  });

  // 1. Direct fingerprint match check
  const fpRes = await pool.query(`
    SELECT * FROM public.event_clusters WHERE event_fingerprint = $1 LIMIT 1;
  `, [candidateFingerprint]);

  if (fpRes.rows.length > 0) {
    return {
      cluster: mapDbRowToCluster(fpRes.rows[0]),
      isExisting: true,
      sameEventScore: 100,
    };
  }

  // 2. Proximity fuzzy search across active clusters (within 14 days)
  const recentClustersRes = await pool.query(`
    SELECT * FROM public.event_clusters
    WHERE created_at >= NOW() - INTERVAL '14 days'
    ORDER BY latest_update_at DESC
    LIMIT 50;
  `);

  const candidateClaimsText = (extraction.verified_facts || []).map(f => f.claim_text).join(' ');

  for (const row of recentClustersRes.rows) {
    const existing = mapDbRowToCluster(row);
    const existingClaimsText = existing.canonicalCoreClaims.map(c => c.claim).join(' ');

    const sim = computeSameEventScore(
      {
        primaryEventType: extraction.primary_event_type,
        entities: primaryEntities,
        projectOrAsset,
        geography,
        eventDate,
        claimsText: candidateClaimsText,
      },
      {
        primaryEventType: existing.primaryEventType,
        entities: existing.primaryEntities,
        projectOrAsset: existing.projectOrAsset,
        geography: existing.geography,
        eventDate: existing.eventDate,
        claimsText: existingClaimsText,
      }
    );

    if (sim.isSameEvent) {
      return {
        cluster: existing,
        isExisting: true,
        sameEventScore: sim.score,
      };
    }
  }

  // 3. Create brand new cluster
  const clusterId = crypto.randomUUID();
  const canonicalClaims = (extraction.verified_facts || []).slice(0, 5).map((f, i) => ({
    id: `claim-${clusterId.slice(0, 8)}-${i + 1}`,
    claim: f.claim_text,
    verified: true,
  }));

  const insertRes = await pool.query(`
    INSERT INTO public.event_clusters (
      id,
      event_fingerprint,
      primary_event_type,
      primary_entities,
      event_date,
      geography,
      project_or_asset,
      canonical_core_claims,
      raw_article_ids,
      source_ids,
      first_seen_at,
      latest_update_at,
      material_update_version
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now(), 1
    )
    ON CONFLICT (event_fingerprint) DO UPDATE SET latest_update_at = now()
    RETURNING *;
  `, [
    clusterId,
    candidateFingerprint,
    extraction.primary_event_type,
    JSON.stringify(primaryEntities),
    sanitizedEventDate || null,
    geography,
    projectOrAsset || null,
    JSON.stringify(canonicalClaims),
    [article.id],
    [],
  ]);

  return {
    cluster: mapDbRowToCluster(insertRes.rows[0]),
    isExisting: false,
    sameEventScore: 100,
  };
}

/**
 * Merges a newly discovered article/source into an existing event cluster.
 */
export async function mergeIntoEventCluster(params: {
  clusterId: string;
  rawArticleId: string;
  sourceId?: string;
  newClaims?: Array<{ id: string; claim: string; verified: boolean }>;
  isMaterialUpdate?: boolean;
}): Promise<void> {
  const pool = getPostgresPool();
  const { clusterId, rawArticleId, sourceId, newClaims = [], isMaterialUpdate = false } = params;

  let updateSql = `
    UPDATE public.event_clusters SET
      raw_article_ids = array_append(raw_article_ids, $1),
      latest_update_at = now(),
      updated_at = now()
  `;
  const values: any[] = [rawArticleId];
  let pIdx = 2;

  if (sourceId) {
    updateSql += `, source_ids = array_append(source_ids, $${pIdx++})`;
    values.push(sourceId);
  }

  if (isMaterialUpdate) {
    updateSql += `, material_update_version = material_update_version + 1`;
  }

  updateSql += ` WHERE id = $${pIdx} AND NOT ($1 = ANY(raw_article_ids));`;
  values.push(clusterId);

  await pool.query(updateSql, values);
}

function mapDbRowToCluster(row: any): EventCluster {
  return {
    id: row.id,
    eventFingerprint: row.event_fingerprint,
    primaryEventType: row.primary_event_type,
    primaryEntities: typeof row.primary_entities === 'string' ? JSON.parse(row.primary_entities) : (row.primary_entities || []),
    eventDate: row.event_date instanceof Date ? row.event_date.toISOString().slice(0, 10) : (row.event_date ? String(row.event_date) : undefined),
    geography: row.geography || undefined,
    projectOrAsset: row.project_or_asset || undefined,
    canonicalCoreClaims: typeof row.canonical_core_claims === 'string' ? JSON.parse(row.canonical_core_claims) : (row.canonical_core_claims || []),
    rawArticleIds: row.raw_article_ids || [],
    sourceIds: row.source_ids || [],
    canonicalStoryId: row.canonical_story_id || undefined,
    materialUpdateVersion: row.material_update_version || 1,
    firstSeenAt: row.first_seen_at instanceof Date ? row.first_seen_at.toISOString() : String(row.first_seen_at),
    latestUpdateAt: row.latest_update_at instanceof Date ? row.latest_update_at.toISOString() : String(row.latest_update_at),
  };
}
