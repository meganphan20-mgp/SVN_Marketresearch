import { getPostgresPool } from './postgres';
import { 
  ArticleExtractionRecord, 
  isValidEventType, 
  isValidEventRole 
} from '@/types/extraction';

/**
 * ARTICLE EXTRACTIONS DATABASE STORE (PHASE 2A / 2A.1)
 * 
 * Strict Principles:
 * - Dedicated storage layer: public.article_extractions.
 * - Under NO CIRCUMSTANCE writes to intelligence_stories.
 * - Every extraction references raw_articles.id.
 * - Runtime validation guarantees 0 composite event types and 100% claim provenance.
 */

export function assertValidExtractionRecord(record: ArticleExtractionRecord): void {
  // 1. Strict Event Taxonomy Check: exactly ONE valid enum value
  if (!isValidEventType(record.primary_event_type)) {
    throw new Error(
      `Strict Taxonomy Violation: primary_event_type must be a single controlled enum value without composite characters ('/', ',', '+'). Received: "${record.primary_event_type}"`
    );
  }

  // 2. Controlled Role Validation
  for (const entity of record.entities) {
    if (!isValidEventRole(entity.role_in_event)) {
      throw new Error(
        `Role Violation: entity "${entity.name}" has invalid role_in_event "${entity.role_in_event}". Must be one of controlled EVENT_ROLES.`
      );
    }
  }

  // 3. Claim Provenance Check
  const allClaims = [
    ...record.verified_facts,
    ...record.explicit_company_statements,
    ...record.source_attributed_claims,
    ...record.uncertainties,
  ];

  for (const claim of allClaims) {
    if (!claim.raw_article_id || !claim.source_url || !claim.evidence_text) {
      throw new Error(
        `Provenance Violation: claim "${claim.claim_id}" is missing raw_article_id, source_url, or evidence_text.`
      );
    }
  }

  // 4. Score Semantics Check
  if (!record.meaningful_event_detected && record.extraction_quality_score !== null) {
    throw new Error(
      `Score Semantics Violation: when meaningful_event_detected is false, extraction_quality_score must be null.`
    );
  }
}

export async function saveArticleExtraction(
  record: ArticleExtractionRecord
): Promise<ArticleExtractionRecord> {
  // Enforce runtime integrity assertions before writing
  assertValidExtractionRecord(record);

  const pool = getPostgresPool();

  const query = `
    INSERT INTO public.article_extractions (
      raw_article_id,
      source_url,
      publisher,
      published_at,
      meaningful_event_detected,
      primary_event_type,
      secondary_event_types,
      event_date,
      event_date_confidence,
      event_date_source,
      event_status,
      sectors,
      sub_sectors,
      geographies,
      entities,
      numeric_facts,
      verified_facts,
      explicit_company_statements,
      source_attributed_claims,
      uncertainties,
      event_detection_confidence,
      extraction_quality_score,
      extraction_metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
    )
    ON CONFLICT (raw_article_id) DO UPDATE SET
      meaningful_event_detected = EXCLUDED.meaningful_event_detected,
      primary_event_type = EXCLUDED.primary_event_type,
      secondary_event_types = EXCLUDED.secondary_event_types,
      event_date = EXCLUDED.event_date,
      event_date_confidence = EXCLUDED.event_date_confidence,
      event_date_source = EXCLUDED.event_date_source,
      event_status = EXCLUDED.event_status,
      sectors = EXCLUDED.sectors,
      sub_sectors = EXCLUDED.sub_sectors,
      geographies = EXCLUDED.geographies,
      entities = EXCLUDED.entities,
      numeric_facts = EXCLUDED.numeric_facts,
      verified_facts = EXCLUDED.verified_facts,
      explicit_company_statements = EXCLUDED.explicit_company_statements,
      source_attributed_claims = EXCLUDED.source_attributed_claims,
      uncertainties = EXCLUDED.uncertainties,
      event_detection_confidence = EXCLUDED.event_detection_confidence,
      extraction_quality_score = EXCLUDED.extraction_quality_score,
      extraction_metadata = EXCLUDED.extraction_metadata,
      updated_at = now()
    RETURNING *;
  `;

  const values = [
    record.raw_article_id,
    record.source_url,
    record.publisher,
    record.published_at ? new Date(record.published_at) : null,
    record.meaningful_event_detected,
    record.primary_event_type,
    record.secondary_event_types,
    record.event_date,
    record.event_date_confidence,
    record.event_date_source,
    record.event_status,
    record.sectors,
    record.sub_sectors,
    record.geographies,
    JSON.stringify(record.entities),
    JSON.stringify(record.numeric_facts),
    JSON.stringify(record.verified_facts),
    JSON.stringify(record.explicit_company_statements),
    JSON.stringify(record.source_attributed_claims),
    JSON.stringify(record.uncertainties),
    record.event_detection_confidence,
    record.extraction_quality_score,
    JSON.stringify(record.extraction_metadata || {}),
  ];

  const res = await pool.query(query, values);
  const row = res.rows[0];

  return {
    ...record,
    id: row.id,
  };
}

export async function getArticleExtractionByRawArticleId(
  rawArticleId: string
): Promise<ArticleExtractionRecord | null> {
  const pool = getPostgresPool();
  const res = await pool.query(
    'SELECT * FROM public.article_extractions WHERE raw_article_id = $1',
    [rawArticleId]
  );
  if (res.rows.length === 0) return null;
  return mapRowToExtractionRecord(res.rows[0]);
}

export async function getAllArticleExtractions(
  limit = 100
): Promise<ArticleExtractionRecord[]> {
  const pool = getPostgresPool();
  const res = await pool.query(
    'SELECT * FROM public.article_extractions ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return res.rows.map(mapRowToExtractionRecord);
}

export async function countArticleExtractions(): Promise<number> {
  const pool = getPostgresPool();
  const res = await pool.query('SELECT COUNT(*) as count FROM public.article_extractions');
  return parseInt(res.rows[0].count, 10);
}

function mapRowToExtractionRecord(row: any): ArticleExtractionRecord {
  return {
    id: row.id,
    raw_article_id: row.raw_article_id,
    source_url: row.source_url,
    publisher: row.publisher,
    published_at: row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : null,
    meaningful_event_detected: row.meaningful_event_detected,
    primary_event_type: row.primary_event_type,
    secondary_event_types: row.secondary_event_types || [],
    event_date: row.event_date || null,
    event_date_confidence: row.event_date_confidence != null ? Number(row.event_date_confidence) : null,
    event_date_source: row.event_date_source || null,
    event_status: row.event_status,
    sectors: row.sectors || [],
    sub_sectors: row.sub_sectors || [],
    geographies: row.geographies || [],
    entities: typeof row.entities === 'string' ? JSON.parse(row.entities) : (row.entities || []),
    numeric_facts: typeof row.numeric_facts === 'string' ? JSON.parse(row.numeric_facts) : (row.numeric_facts || []),
    verified_facts: typeof row.verified_facts === 'string' ? JSON.parse(row.verified_facts) : (row.verified_facts || []),
    explicit_company_statements: typeof row.explicit_company_statements === 'string' ? JSON.parse(row.explicit_company_statements) : (row.explicit_company_statements || []),
    source_attributed_claims: typeof row.source_attributed_claims === 'string' ? JSON.parse(row.source_attributed_claims) : (row.source_attributed_claims || []),
    uncertainties: typeof row.uncertainties === 'string' ? JSON.parse(row.uncertainties) : (row.uncertainties || []),
    event_detection_confidence: row.event_detection_confidence != null ? Number(row.event_detection_confidence) : 90,
    extraction_quality_score: row.extraction_quality_score != null ? Number(row.extraction_quality_score) : null,
    extraction_metadata: typeof row.extraction_metadata === 'string' ? JSON.parse(row.extraction_metadata) : (row.extraction_metadata || {}),
  };
}
