import { runPhase1Ingestion, Phase1IngestionParams, Phase1IngestionResult } from '@/lib/ingestion/phase1-pipeline';
import { runPhase2aExtraction, Phase2aPipelineParams, Phase2aPipelineResult } from '@/lib/extraction/phase2a-pipeline';
import { runPhase2bRelevancePipeline, Phase2bPipelineParams, Phase2bPipelineResult } from '@/lib/relevance/phase2b-pipeline';
import { runPhase3IntelligencePipeline, Phase3PipelineOptions, Phase3PipelineResult } from '@/lib/analysis/phase3-pipeline';
import { IntelligenceStory } from '@/types/intelligence';

export interface DailyPipelineOrchestrationParams {
  sourceIds?: string[];
  maxArticlesPerSource?: number;
  minRelevanceScore?: number;
  forceReprocess?: boolean;
}

export interface DailyPipelineOrchestrationResult {
  status: 'success' | 'partial' | 'error';
  timestamp: string;
  executionDurationMs: number;
  roles: {
    role1_research_scanner: {
      sourcesScanned: number;
      candidatesDiscovered: number;
      articlesFetchedSuccessfully: number;
      articlesRejected: number;
      duplicatesSkipped: number;
      articlesStored: number;
    };
    role3_fact_event_analyst: {
      articlesProcessed: number;
      extractionsPersisted: number;
      meaningfulEventsDetected: number;
      nonEventsDetected: number;
      averageQualityScore: number;
    };
    role2_market_intelligence_analyst: {
      articlesScored: number;
      signalsDetected: number;
      highPriorityCount: number;
      triageDistribution: {
        drop: number;
        watch: number;
        pick_up: number;
        research: number;
      };
    };
    role4_and_5_strategy_bd_analyst: {
      candidatesEvaluated: number;
      storiesPublished: number;
      storiesRejectedByGate: number;
      rejectionReasons: Array<{ articleTitle: string; reason: string }>;
    };
  };
  publishedStories: IntelligenceStory[];
}

/**
 * MASTER DAILY INTELLIGENCE PIPELINE ORCHESTRATOR
 * 
 * Strict Principle:
 * Sequential 5-Role Execution Architecture:
 * 
 * ROLE 1 — RESEARCH SCANNER
 * "What has been published today across our approved sources?"
 * -> Real discovered articles only, stored into public.raw_articles.
 * 
 * ROLE 3 — FACT & EVENT ANALYST
 * "What objectively happened?"
 * -> Verified entities, events, facts, numbers, dates, and claims.
 * 
 * ROLE 2 — MARKET INTELLIGENCE ANALYST
 * "Which articles contain potentially relevant signals for Sojitz?"
 * -> 10 Sojitz Relevance Criteria -> DROP / WATCH / PICK UP / RESEARCH.
 * 
 * ROLE 4 — BUSINESS / STRATEGY ANALYST
 * "Why might this matter to Sojitz?"
 * -> Strategic implications and business relevance.
 * 
 * ROLE 5 — BD ANALYST
 * "Is there a realistic opportunity or next action?"
 * -> Opportunity hypothesis, next research step, or BD action.
 * 
 * Enforces the Golden Rule:
 * "The later roles may only operate on outputs that passed the earlier roles."
 */
export async function runDailyIntelligenceOrchestrator(
  params?: DailyPipelineOrchestrationParams
): Promise<DailyPipelineOrchestrationResult> {
  const globalStartTime = Date.now();
  console.log('[Daily Orchestrator] Starting end-to-end 5-role intelligence scan...');

  // =========================================================================
  // ROLE 1: RESEARCH SCANNER
  // Scans active sources in the Source Registry and fetches real articles.
  // =========================================================================
  console.log('[Daily Orchestrator] ROLE 1: Executing Research Scanner...');
  const phase1Result: Phase1IngestionResult = await runPhase1Ingestion({
    sourceIds: params?.sourceIds,
    maxArticlesPerSource: params?.maxArticlesPerSource || 5,
  });

  console.log(`[Daily Orchestrator] ROLE 1 finished: ${phase1Result.totalDiscoveredUrls} discovered, ${phase1Result.totalRawArticlesStored} stored.`);

  // Get raw article IDs ingested or available
  const newlyIngestedArticleIds = phase1Result.storedRawArticles.map(a => a.id);

  // =========================================================================
  // ROLE 3: FACT & EVENT ANALYST
  // Extracts objective facts, numbers, entities, events, and claims.
  // =========================================================================
  console.log('[Daily Orchestrator] ROLE 3: Executing Fact & Event Analyst...');
  const phase2aResult: Phase2aPipelineResult = await runPhase2aExtraction({
    articleIds: newlyIngestedArticleIds.length > 0 ? newlyIngestedArticleIds : undefined,
    limit: 50,
  });

  console.log(`[Daily Orchestrator] ROLE 3 finished: ${phase2aResult.totalArticlesProcessed} processed, ${phase2aResult.meaningfulEventsDetected} meaningful events.`);

  // =========================================================================
  // ROLE 2: MARKET INTELLIGENCE ANALYST
  // Evaluates extracted facts against the 10 Sojitz criteria -> DROP / WATCH / PICK UP / RESEARCH.
  // =========================================================================
  console.log('[Daily Orchestrator] ROLE 2: Executing Market Intelligence Analyst...');
  const phase2bResult: Phase2bPipelineResult = await runPhase2bRelevancePipeline({
    articleIds: newlyIngestedArticleIds.length > 0 ? newlyIngestedArticleIds : undefined,
    limit: 50,
  });

  console.log(`[Daily Orchestrator] ROLE 2 finished: Triage breakdown:`, phase2bResult.triageDistribution);

  // =========================================================================
  // ROLES 4 & 5: BUSINESS/STRATEGY ANALYST + BD ANALYST + GATING
  // Only PICK UP and qualified RESEARCH items proceed.
  // Event Deduplication, Strict Date-Gating (Asia/Ho_Chi_Minh), Source Alignment.
  // =========================================================================
  console.log('[Daily Orchestrator] ROLES 4 & 5: Executing Strategic Synthesis & Publication Gate...');
  const phase3Result: Phase3PipelineResult = await runPhase3IntelligencePipeline({
    minRelevanceScore: params?.minRelevanceScore ?? 4,
    forceReprocess: params?.forceReprocess ?? false,
  });

  console.log(`[Daily Orchestrator] ROLES 4 & 5 finished: ${phase3Result.publishedStories.length} published stories, ${phase3Result.totalRejectedByGate} rejected.`);

  const totalDuration = Date.now() - globalStartTime;

  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    executionDurationMs: totalDuration,
    roles: {
      role1_research_scanner: {
        sourcesScanned: phase1Result.sourcesScanned,
        candidatesDiscovered: phase1Result.totalDiscoveredUrls,
        articlesFetchedSuccessfully: phase1Result.totalFetchedSuccessfully,
        articlesRejected: phase1Result.totalRejected,
        duplicatesSkipped: phase1Result.totalDuplicates,
        articlesStored: phase1Result.totalRawArticlesStored,
      },
      role3_fact_event_analyst: {
        articlesProcessed: phase2aResult.totalArticlesProcessed,
        extractionsPersisted: phase2aResult.totalExtractionsPersisted,
        meaningfulEventsDetected: phase2aResult.meaningfulEventsDetected,
        nonEventsDetected: phase2aResult.nonEventsDetected,
        averageQualityScore: phase2aResult.averageQualityScore,
      },
      role2_market_intelligence_analyst: {
        articlesScored: phase2bResult.totalProcessed,
        signalsDetected: phase2bResult.signalsDetected,
        highPriorityCount: phase2bResult.highPriorityCount,
        triageDistribution: phase2bResult.triageDistribution,
      },
      role4_and_5_strategy_bd_analyst: {
        candidatesEvaluated: phase3Result.totalCandidates,
        storiesPublished: phase3Result.totalVerifiedStories,
        storiesRejectedByGate: phase3Result.totalRejectedByGate,
        rejectionReasons: phase3Result.rejectionReasons,
      },
    },
    publishedStories: phase3Result.publishedStories,
  };
}
