import { getSources } from '@/lib/data/intelligence-store';
import { discoverArticlesFromSource } from './source-discovery';
import { fetchAndValidateRawArticle } from './raw-article-fetcher';
import { rawArticlesStore } from '@/lib/data/raw-articles-store';
import { RawArticle, DiscoveredArticleCandidate, ArticlePageValidationResult } from '@/types/intelligence';

export interface Phase1IngestionParams {
  sourceIds?: string[];
  maxArticlesPerSource?: number;
}

export interface SourceIngestionReport {
  id: string;
  name: string;
  domain: string;
  tier: string;
  candidatesDiscovered: number;
  successfullyFetched: number;
  rejected: number;
  duplicate: number;
  failureReasons: string[];
}

export interface Phase1IngestionResult {
  sourcesScanned: number;
  sourcesProcessed: Array<{ id: string; name: string; domain: string; tier: string; discoveredCount: number }>;
  sourceReports: SourceIngestionReport[];
  totalDiscoveredUrls: number;
  totalFetchedSuccessfully: number;
  totalRejected: number;
  totalDuplicates: number;
  totalRawArticlesStored: number;
  storedRawArticles: RawArticle[];
  databasePersisted: boolean;
  executionTimeMs: number;
  timestamp: string;
}

/**
 * PHASE 1 / 1.1 INGESTION PIPELINE: SOURCE DISCOVERY + RAW ARTICLE INGESTION
 * 
 * Strict Source-First Execution:
 * 1. Queries only configured active sources from the source registry.
 * 2. Visits/scans sources using RSS or category discovery.
 * 3. Captures real published URLs returned by the source mechanism.
 * 4. Fetches and validates actual article content (HTTP 200, valid body >= 150 words, domain integrity).
 * 5. Extracts published_at with priority (OG -> JSON-LD -> RSS -> HTML time -> null).
 * 6. Stores articles in raw_articles with disk/database persistence.
 * 7. NEVER generates an intelligence story.
 * 8. NEVER invokes an LLM.
 */
export async function runPhase1Ingestion(
  params?: Phase1IngestionParams
): Promise<Phase1IngestionResult> {
  const startTime = Date.now();
  const allSources = await getSources();

  // Filter to active approved sources
  let targetSources = allSources.filter(s => s.isActive);
  if (params?.sourceIds && params.sourceIds.length > 0) {
    targetSources = targetSources.filter(s => params.sourceIds!.includes(s.id));
  }

  const maxPerSource = params?.maxArticlesPerSource || 5;
  const sourceReports: SourceIngestionReport[] = [];
  const storedArticles: RawArticle[] = [];
  let totalDiscovered = 0;
  let totalFetched = 0;
  let totalRejected = 0;
  let totalDuplicates = 0;

  for (const source of targetSources) {
    // 1. Discover actual published articles from the source
    const candidates: DiscoveredArticleCandidate[] = await discoverArticlesFromSource(source, maxPerSource);
    totalDiscovered += candidates.length;

    let sourceFetched = 0;
    let sourceRejected = 0;
    let sourceDuplicate = 0;
    const sourceFailures: string[] = [];

    // 2. Fetch and validate each discovered article
    for (const candidate of candidates) {
      const { rawArticle, validationResult } = await fetchAndValidateRawArticle(candidate);

      if (rawArticle && validationResult.isValidArticlePage) {
        sourceFetched++;
        totalFetched++;

        // 3. Store in raw_articles
        const saved = await rawArticlesStore.saveRawArticle(rawArticle);
        if (saved) {
          if (saved.id === rawArticle.id) {
            storedArticles.push(saved);
          } else {
            // Already existed (duplicate)
            sourceDuplicate++;
            totalDuplicates++;
          }
        }
      } else {
        sourceRejected++;
        totalRejected++;
        if (validationResult.failureReasons.length > 0) {
          sourceFailures.push(...validationResult.failureReasons);
        }
      }
    }

    sourceReports.push({
      id: source.id,
      name: source.name,
      domain: source.domain,
      tier: source.tier,
      candidatesDiscovered: candidates.length,
      successfullyFetched: sourceFetched,
      rejected: sourceRejected,
      duplicate: sourceDuplicate,
      failureReasons: Array.from(new Set(sourceFailures)),
    });
  }

  return {
    sourcesScanned: targetSources.length,
    sourcesProcessed: sourceReports.map(r => ({
      id: r.id,
      name: r.name,
      domain: r.domain,
      tier: r.tier,
      discoveredCount: r.candidatesDiscovered,
    })),
    sourceReports,
    totalDiscoveredUrls: totalDiscovered,
    totalFetchedSuccessfully: totalFetched,
    totalRejected,
    totalDuplicates,
    totalRawArticlesStored: storedArticles.length,
    storedRawArticles: storedArticles,
    databasePersisted: rawArticlesStore.isDatabasePersisted(),
    executionTimeMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}
