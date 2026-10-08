import { getPostgresPool } from '@/lib/database/postgres';
import { getAllArticleExtractions, getArticleExtractionByRawArticleId } from '@/lib/database/extraction-store';
import { scoreArticleRelevance } from './relevance-scorer';
import { saveArticleRelevanceScore, countArticleRelevanceScores } from '@/lib/database/relevance-store';
import { ArticleRelevanceScoreRecord } from '@/types/relevance';
import { RawArticle } from '@/types/intelligence';

export interface Phase2bPipelineParams {
  limit?: number;
  articleIds?: string[];
}

export interface Phase2bPipelineResult {
  totalProcessed: number;
  signalsDetected: number;
  nonSignalsCount: number;
  highPriorityCount: number; // relevance_score >= 8
  tierDistribution: {
    tier1_critical: number;   // 9-10
    tier2_high: number;       // 7-8
    tier3_moderate: number;   // 4-6
    tier4_low: number;        // 1-3
  };
  triageDistribution: {
    drop: number;
    watch: number;
    pick_up: number;
    research: number;
  };
  scores: ArticleRelevanceScoreRecord[];
  timestamp: string;
}

/**
 * PHASE 2B PIPELINE: POTENTIAL SIGNAL PICKUP & RELEVANCE SCORING
 * 
 * Strict Principle:
 * - Operates strictly on source-derived facts from Phase 2A extractions.
 * - Does NOT synthesize intelligence stories.
 * - Does NOT generate final BD recommendations yet (Phase 3).
 * - Persists strictly to public.article_relevance_scores.
 */
export async function runPhase2bRelevancePipeline(
  params?: Phase2bPipelineParams
): Promise<Phase2bPipelineResult> {
  const pool = getPostgresPool();

  // 1. Fetch extractions from PostgreSQL
  const extractions = await getAllArticleExtractions(params?.limit || 50);

  let filteredExtractions = extractions;
  if (params?.articleIds && params.articleIds.length > 0) {
    filteredExtractions = extractions.filter(e => params.articleIds!.includes(e.raw_article_id));
  }

  const scores: ArticleRelevanceScoreRecord[] = [];
  let signalsDetected = 0;
  let nonSignalsCount = 0;
  let highPriorityCount = 0;

  const tierDistribution = {
    tier1_critical: 0,
    tier2_high: 0,
    tier3_moderate: 0,
    tier4_low: 0,
  };

  const triageDistribution = {
    drop: 0,
    watch: 0,
    pick_up: 0,
    research: 0,
  };

  for (const extraction of filteredExtractions) {
    // 2. Fetch corresponding raw_article
    const rawRes = await pool.query(
      'SELECT * FROM public.raw_articles WHERE id = $1',
      [extraction.raw_article_id]
    );

    if (rawRes.rows.length === 0) continue;
    const rawRow = rawRes.rows[0];

    const rawArticle: RawArticle = {
      id: rawRow.id,
      sourceId: rawRow.source_code,
      publisher: rawRow.publisher,
      title: rawRow.title,
      url: rawRow.url,
      originalUrl: rawRow.original_url,
      finalUrl: rawRow.final_url,
      httpStatus: rawRow.http_status,
      publishedAt: rawRow.published_at ? new Date(rawRow.published_at).toISOString().slice(0, 10) : null,
      fetchedAt: new Date(rawRow.fetched_at).toISOString(),
      dateExtractionSource: 'JSON_LD',
      publishedAtDeltaHours: 0,
      isTimestampSuspicious: false,
      articleAgeHours: 0,
      freshnessBucket: rawRow.freshness_bucket,
      rawContent: rawRow.raw_content,
      rawContentBytes: rawRow.raw_content ? Buffer.byteLength(rawRow.raw_content, 'utf8') : 0,
      rawContentTruncated: false,
      cleanedContent: rawRow.cleaned_content,
      contentHash: rawRow.content_hash,
      fetchStatus: 'SUCCESS',
      fetchVerified: rawRow.fetch_verified,
      isArticlePage: rawRow.is_article_page,
    };

    // 3. Score relevance against Knowledge Bank
    const scoreRecord = await scoreArticleRelevance(extraction, rawArticle);

    // 4. Persist to dedicated article_relevance_scores table
    const saved = await saveArticleRelevanceScore(scoreRecord);
    scores.push(saved);

    if (saved.signal_detected) {
      signalsDetected++;
    } else {
      nonSignalsCount++;
    }

    if (saved.is_high_priority) {
      highPriorityCount++;
    }

    if (saved.relevance_score >= 9) tierDistribution.tier1_critical++;
    else if (saved.relevance_score >= 7) tierDistribution.tier2_high++;
    else if (saved.relevance_score >= 4) tierDistribution.tier3_moderate++;
    else tierDistribution.tier4_low++;

    if (saved.triage_outcome === 'DROP') triageDistribution.drop++;
    else if (saved.triage_outcome === 'WATCH') triageDistribution.watch++;
    else if (saved.triage_outcome === 'PICK_UP') triageDistribution.pick_up++;
    else if (saved.triage_outcome === 'RESEARCH') triageDistribution.research++;
  }

  return {
    totalProcessed: filteredExtractions.length,
    signalsDetected,
    nonSignalsCount,
    highPriorityCount,
    tierDistribution,
    triageDistribution,
    scores,
    timestamp: new Date().toISOString(),
  };
}
