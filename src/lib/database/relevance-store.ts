import { getPostgresPool } from './postgres';
import { ArticleRelevanceScoreRecord } from '@/types/relevance';

/**
 * ARTICLE RELEVANCE SCORES DATABASE STORE (PHASE 2B)
 * 
 * Strict Principles:
 * - Dedicated storage layer: public.article_relevance_scores.
 * - Under NO CIRCUMSTANCE writes to intelligence_stories.
 * - Every record references raw_articles.id and article_extractions.id.
 */

export async function saveArticleRelevanceScore(
  record: ArticleRelevanceScoreRecord
): Promise<ArticleRelevanceScoreRecord> {
  const pool = getPostgresPool();

  const query = `
    INSERT INTO public.article_relevance_scores (
      raw_article_id,
      extraction_id,
      signal_detected,
      signal_type,
      signal_strength,
      matched_divisions,
      matched_assets,
      matched_competitors,
      matched_priorities,
      relevance_score,
      relevance_rationale,
      triage_outcome,
      triage_rationale,
      business_impact,
      urgency,
      strategic_status,
      primary_sector_id,
      secondary_sector_ids,
      matched_companies,
      scoring_metadata
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    )
    ON CONFLICT (raw_article_id) DO UPDATE SET
      extraction_id = EXCLUDED.extraction_id,
      signal_detected = EXCLUDED.signal_detected,
      signal_type = EXCLUDED.signal_type,
      signal_strength = EXCLUDED.signal_strength,
      matched_divisions = EXCLUDED.matched_divisions,
      matched_assets = EXCLUDED.matched_assets,
      matched_competitors = EXCLUDED.matched_competitors,
      matched_priorities = EXCLUDED.matched_priorities,
      relevance_score = EXCLUDED.relevance_score,
      relevance_rationale = EXCLUDED.relevance_rationale,
      triage_outcome = EXCLUDED.triage_outcome,
      triage_rationale = EXCLUDED.triage_rationale,
      business_impact = EXCLUDED.business_impact,
      urgency = EXCLUDED.urgency,
      strategic_status = EXCLUDED.strategic_status,
      primary_sector_id = EXCLUDED.primary_sector_id,
      secondary_sector_ids = EXCLUDED.secondary_sector_ids,
      matched_companies = EXCLUDED.matched_companies,
      scoring_metadata = EXCLUDED.scoring_metadata,
      updated_at = now()
    RETURNING *;
  `;

  const values = [
    record.raw_article_id,
    record.extraction_id,
    record.signal_detected,
    record.signal_type,
    record.signal_strength,
    record.matched_divisions,
    record.matched_assets,
    record.matched_competitors,
    record.matched_priorities,
    record.relevance_score,
    record.relevance_rationale,
    record.triage_outcome || 'WATCH',
    record.triage_rationale || null,
    record.business_impact,
    record.urgency,
    record.strategic_status,
    record.primary_sector_id,
    record.secondary_sector_ids,
    JSON.stringify(record.matched_companies),
    JSON.stringify(record.scoring_metadata || {}),
  ];

  const res = await pool.query(query, values);
  const row = res.rows[0];

  return {
    ...record,
    id: row.id,
    is_high_priority: row.is_high_priority,
    triage_outcome: row.triage_outcome || record.triage_outcome,
    triage_rationale: row.triage_rationale || record.triage_rationale,
  };
}

export async function getArticleRelevanceScoreByRawArticleId(
  rawArticleId: string
): Promise<ArticleRelevanceScoreRecord | null> {
  const pool = getPostgresPool();
  const res = await pool.query(
    'SELECT * FROM public.article_relevance_scores WHERE raw_article_id = $1',
    [rawArticleId]
  );
  if (res.rows.length === 0) return null;
  return mapRowToRelevanceRecord(res.rows[0]);
}

export async function countArticleRelevanceScores(): Promise<number> {
  const pool = getPostgresPool();
  const res = await pool.query('SELECT COUNT(*) as count FROM public.article_relevance_scores');
  return parseInt(res.rows[0].count, 10);
}

function mapRowToRelevanceRecord(row: any): ArticleRelevanceScoreRecord {
  return {
    id: row.id,
    raw_article_id: row.raw_article_id,
    extraction_id: row.extraction_id,
    signal_detected: row.signal_detected,
    signal_type: row.signal_type,
    signal_strength: row.signal_strength,
    matched_divisions: row.matched_divisions || [],
    matched_assets: row.matched_assets || [],
    matched_competitors: row.matched_competitors || [],
    matched_priorities: row.matched_priorities || [],
    relevance_score: Number(row.relevance_score),
    relevance_rationale: row.relevance_rationale,
    triage_outcome: row.triage_outcome || 'WATCH',
    triage_rationale: row.triage_rationale || '',
    business_impact: row.business_impact,
    urgency: row.urgency,
    strategic_status: row.strategic_status,
    primary_sector_id: row.primary_sector_id || null,
    primary_sector_name: '', // populated by join if needed
    secondary_sector_ids: row.secondary_sector_ids || [],
    matched_companies: typeof row.matched_companies === 'string' 
      ? JSON.parse(row.matched_companies) 
      : (row.matched_companies || []),
    is_high_priority: row.is_high_priority,
    scoring_metadata: typeof row.scoring_metadata === 'string' 
      ? JSON.parse(row.scoring_metadata) 
      : (row.scoring_metadata || {}),
  };
}
