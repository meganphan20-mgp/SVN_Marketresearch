import { getRawArticlesForDailyPipeline } from '@/lib/data/raw-articles-store';
import { extractFactsAndEventFromRawArticle } from './fact-event-extractor';
import { saveArticleExtraction, countArticleExtractions } from '@/lib/database/extraction-store';
import { ArticleExtractionRecord } from '@/types/extraction';
import { RawArticle } from '@/types/intelligence';

export interface Phase2aPipelineParams {
  limit?: number;
  articleIds?: string[];
}

export interface Phase2aPipelineResult {
  totalArticlesProcessed: number;
  totalExtractionsPersisted: number;
  meaningfulEventsDetected: number;
  nonEventsDetected: number;
  averageQualityScore: number;
  extractions: ArticleExtractionRecord[];
  timestamp: string;
}

/**
 * PHASE 2A PIPELINE: FACT & EVENT EXTRACTION ONLY
 * 
 * Strict Principle:
 * - Reads only from getRawArticlesForDailyPipeline():
 *   fetch_verified = true AND is_article_page = true AND freshness_bucket IN ('TODAY', 'RECENT')
 * - Factual extraction ONLY ("WHAT HAPPENED?").
 * - Does NOT perform relevance scoring.
 * - Does NOT generate intelligence stories.
 * - Does NOT generate BD recommendations.
 * - Persists strictly to public.article_extractions.
 */
export async function runPhase2aExtraction(
  params?: Phase2aPipelineParams
): Promise<Phase2aPipelineResult> {
  // Step 1: Query strictly verified, fresh raw articles from authoritative PostgreSQL store
  let eligibleArticles: RawArticle[] = await getRawArticlesForDailyPipeline({ limit: params?.limit || 50 });

  if (params?.articleIds && params.articleIds.length > 0) {
    eligibleArticles = eligibleArticles.filter(a => params.articleIds!.includes(a.id));
  }

  const extractions: ArticleExtractionRecord[] = [];
  let meaningfulCount = 0;
  let nonEventsCount = 0;
  let totalScore = 0;

  for (const article of eligibleArticles) {
    // Step 2: Factual and Event Extraction
    const extraction = extractFactsAndEventFromRawArticle(article);

    // Step 3: Persist to dedicated article_extractions table
    const saved = await saveArticleExtraction(extraction);
    extractions.push(saved);

    if (saved.meaningful_event_detected) {
      meaningfulCount++;
    } else {
      nonEventsCount++;
    }

    if (saved.extraction_quality_score !== null) {
      totalScore += saved.extraction_quality_score;
    }
  }

  const averageQualityScore = meaningfulCount > 0 ? Math.round(totalScore / meaningfulCount) : 0;

  return {
    totalArticlesProcessed: eligibleArticles.length,
    totalExtractionsPersisted: extractions.length,
    meaningfulEventsDetected: meaningfulCount,
    nonEventsDetected: nonEventsCount,
    averageQualityScore,
    extractions,
    timestamp: new Date().toISOString(),
  };
}
