import { Pool } from 'pg';
import { RawArticle, FreshnessBucket } from '@/types/intelligence';

/**
 * PRODUCTION POSTGRESQL AUTHORITATIVE DATA ACCESS LAYER (PHASE 1.2)
 * 
 * Strict Production Architecture:
 * - PostgreSQL is the PRIMARY AUTHORITATIVE SOURCE OF TRUTH.
 * - Manages direct transactional pool connections to PostgreSQL.
 * - Handles insert, deduplication, reload, and freshness-based querying.
 */

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  'postgresql://postgres@localhost:5432/market_intelligence';

let poolInstance: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return poolInstance;
}

export async function isPostgresConnected(): Promise<boolean> {
  try {
    const pool = getPostgresPool();
    const res = await pool.query('SELECT 1 as live');
    return res.rows[0]?.live === 1;
  } catch (err) {
    return false;
  }
}

/**
 * Resolves a UUID source_id from sources table by sourceId, domain, or name.
 */
async function resolveSourceUuid(sourceCode: string, publisherName?: string): Promise<string | null> {
  try {
    const pool = getPostgresPool();
    // 1. Check if already valid UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sourceCode)) {
      return sourceCode;
    }
    // 2. Query sources by domain or name
    const res = await pool.query(
      `SELECT id FROM sources WHERE name ILIKE $1 OR domain ILIKE $2 LIMIT 1`,
      [publisherName || '', `%${sourceCode.replace('src-', '')}%`]
    );
    if (res.rows.length > 0) {
      return res.rows[0].id;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Inserts or deduplicates a validated raw article directly in public.raw_articles.
 * Returns the persisted record with assigned database UUID and commit timestamp.
 */
export async function insertRawArticleToPostgres(article: RawArticle): Promise<RawArticle | null> {
  const pool = getPostgresPool();
  const sourceUuid = await resolveSourceUuid(article.sourceId, article.publisher);

  const query = `
    INSERT INTO public.raw_articles (
      source_id,
      source_code,
      publisher,
      title,
      url,
      original_url,
      final_url,
      canonical_url,
      http_status,
      published_at,
      fetched_at,
      raw_content,
      cleaned_content,
      content_hash,
      fetch_status,
      fetch_verified,
      is_article_page,
      raw_content_bytes,
      raw_content_truncated,
      date_extraction_source,
      article_age_hours,
      freshness_bucket,
      validation_metadata,
      source_publication_date_local
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
    )
    ON CONFLICT (url) DO UPDATE SET
      fetched_at = EXCLUDED.fetched_at,
      fetch_verified = EXCLUDED.fetch_verified,
      is_article_page = EXCLUDED.is_article_page,
      freshness_bucket = EXCLUDED.freshness_bucket,
      article_age_hours = EXCLUDED.article_age_hours,
      source_publication_date_local = COALESCE(EXCLUDED.source_publication_date_local, public.raw_articles.source_publication_date_local)
    RETURNING *;
  `;

  const values = [
    sourceUuid,
    article.sourceId,
    article.publisher,
    article.title,
    article.url,
    article.originalUrl,
    article.finalUrl,
    article.canonicalUrl,
    article.httpStatus,
    article.publishedAt ? new Date(article.publishedAt) : null,
    article.fetchedAt ? new Date(article.fetchedAt) : new Date(),
    article.rawContent,
    article.cleanedContent,
    article.contentHash,
    article.fetchStatus || 'SUCCESS',
    article.fetchVerified,
    article.isArticlePage,
    article.rawContentBytes || Buffer.byteLength(article.rawContent, 'utf8'),
    article.rawContentTruncated || false,
    article.dateExtractionSource || 'NONE',
    article.articleAgeHours !== undefined ? article.articleAgeHours : null,
    article.freshnessBucket || 'RECENT',
    JSON.stringify(article.validationDetails || article.validationMetadata || {}),
    article.sourcePublicationDateLocal || null,
  ];

  const res = await pool.query(query, values);
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return mapPostgresRowToRawArticle(row);
}

/**
 * Reads verified raw articles directly from PostgreSQL.
 * Allows filtering strictly for Daily Phase 2 pipeline runs:
 * fetch_verified = true AND is_article_page = true AND freshness_bucket IN ('TODAY', 'RECENT')
 */
export async function getRawArticlesFromPostgres(params?: {
  sourceId?: string;
  limit?: number;
  freshnessBuckets?: FreshnessBucket[];
  verifiedOnly?: boolean;
}): Promise<RawArticle[]> {
  const pool = getPostgresPool();
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (params?.verifiedOnly !== false) {
    conditions.push('fetch_verified = true AND is_article_page = true');
  }

  if (params?.sourceId) {
    conditions.push(`(source_id::text = $${paramIdx} OR source_code = $${paramIdx})`);
    values.push(params.sourceId);
    paramIdx++;
  }

  if (params?.freshnessBuckets && params.freshnessBuckets.length > 0) {
    conditions.push(`freshness_bucket = ANY($${paramIdx})`);
    values.push(params.freshnessBuckets);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = params?.limit ? `LIMIT ${params.limit}` : '';

  const sql = `
    SELECT * FROM public.raw_articles
    ${whereClause}
    ORDER BY fetched_at DESC
    ${limitClause};
  `;

  const res = await pool.query(sql, values);
  return res.rows.map(mapPostgresRowToRawArticle);
}

export async function getRawArticleByIdFromPostgres(id: string): Promise<RawArticle | null> {
  const pool = getPostgresPool();
  const res = await pool.query('SELECT * FROM public.raw_articles WHERE id::text = $1', [id]);
  if (res.rows.length === 0) return null;
  return mapPostgresRowToRawArticle(res.rows[0]);
}

export async function countRawArticlesInPostgres(): Promise<number> {
  const pool = getPostgresPool();
  const res = await pool.query('SELECT COUNT(*) as count FROM public.raw_articles');
  return parseInt(res.rows[0].count, 10);
}

function mapPostgresRowToRawArticle(row: any): RawArticle {
  const pubDateStr = row.published_at 
    ? (row.published_at instanceof Date ? row.published_at.toISOString() : String(row.published_at))
    : null;

  const fetchedAtStr = row.fetched_at instanceof Date 
    ? row.fetched_at.toISOString() 
    : String(row.fetched_at);

  return {
    id: row.id,
    sourceId: row.source_code || (row.source_id ? String(row.source_id) : 'src-approved'),
    source_id: row.source_id ? String(row.source_id) : undefined,
    sourceCode: row.source_code,
    publisher: row.publisher || 'Approved Source',
    title: row.title,
    originalTitle: row.title,
    originalUrl: row.original_url || row.url,
    url: row.url,
    canonicalUrl: row.canonical_url,
    finalUrl: row.final_url || row.url,
    httpStatus: row.http_status,
    publishedAt: pubDateStr,
    sourcePublicationDateLocal: row.source_publication_date_local ? String(row.source_publication_date_local) : undefined,
    fetchedAt: fetchedAtStr,
    dateExtractionSource: row.date_extraction_source || 'NONE',
    publishedAtDeltaHours: row.article_age_hours !== null ? Number(row.article_age_hours) : null,
    isTimestampSuspicious: false,
    articleAgeHours: row.article_age_hours !== null ? Number(row.article_age_hours) : null,
    freshnessBucket: row.freshness_bucket,
    rawContent: row.raw_content,
    rawContentBytes: row.raw_content_bytes || (row.raw_content ? Buffer.byteLength(row.raw_content, 'utf8') : 0),
    rawContentTruncated: row.raw_content_truncated || false,
    cleanedContent: row.cleaned_content,
    contentHash: row.content_hash,
    fetchStatus: row.fetch_status || 'SUCCESS',
    fetchVerified: row.fetch_verified,
    isArticlePage: row.is_article_page,
    validationDetails: row.validation_metadata,
    validationMetadata: row.validation_metadata,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)) : undefined,
  };
}
