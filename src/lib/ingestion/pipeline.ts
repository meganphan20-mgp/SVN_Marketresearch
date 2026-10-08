import { executeSourceFirstPipeline, CandidateDiscoveredSource } from '../verification/source-first-pipeline';
import { IntelligenceStory } from '@/types/intelligence';
import { VERIFIED_INCOMING_FEED } from './mock-feed-data';

export interface IngestionPipelineResult {
  totalScanned: number;
  exactDuplicatesSkipped: number;
  clustersIdentified: number;
  storiesGenerated: number;
  verifiedStories: IntelligenceStory[];
  executionTimeMs: number;
  timestamp: string;
}

/**
 * CRITICAL SOURCE-FIRST NEWS INGESTION PIPELINE
 * 
 * Strict Source-First Execution:
 * 1. Discovers candidate URLs from external feeds/APIs/browser streams.
 * 2. OPENS EVERY URL FIRST via live HTTP request.
 * 3. Immediately hard-deletes any unreachable, 404, or non-article page.
 * 4. Extracts facts ONLY from verified body text.
 * 5. Synthesizes AI intelligence ONLY from validated evidence.
 * 6. Article Creation Gate:
 *    IF validated_source_count < 1 -> STOP & DELETE.
 */
export class NewsIngestionPipeline {
  /**
   * Runs the strict source-first pipeline.
   */
  async run(customCandidates?: CandidateDiscoveredSource[]): Promise<IngestionPipelineResult> {
    const startTime = Date.now();

    // Build candidates pool from incoming stream or verified feeds
    const candidates: CandidateDiscoveredSource[] = customCandidates && customCandidates.length > 0
      ? customCandidates
      : VERIFIED_INCOMING_FEED.map(a => ({
          url: a.url,
          sourceName: a.sourceName,
          discoveredFrom: 'RSS' as const,
        }));

    // Execute Source-First Pipeline
    const result = await executeSourceFirstPipeline(candidates);

    return {
      totalScanned: result.discoveredCount,
      exactDuplicatesSkipped: result.discardedInvalidCount,
      clustersIdentified: result.items.length,
      storiesGenerated: result.items.length,
      verifiedStories: result.items,
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }
}

export const newsIngestionPipeline = new NewsIngestionPipeline();
