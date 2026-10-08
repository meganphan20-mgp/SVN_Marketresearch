import { getPostgresPool } from '@/lib/database/postgres';
import { RawArticle, IntelligenceStory, StorySourceLink, EventCluster } from '@/types/intelligence';
import { ArticleExtractionRecord } from '@/types/extraction';
import { ArticleRelevanceScoreRecord } from '@/types/relevance';
import { verifyStoryClaimsAndSources, StoryVerificationResult } from '@/lib/verification/claim-verifier';
import { synthesizeStrategicStory } from './strategic-synthesizer';
import { saveStoryToPostgres } from '@/lib/database/story-store';
import { 
  getPublicationDateLocal, 
  getTodayLocal, 
  evaluateMaterialUpdate 
} from '@/lib/verification/temporal-gating';
import {
  findOrCreateEventCluster,
  mergeIntoEventCluster,
  generateCanonicalEventFingerprint
} from '@/lib/analysis/event-clustering';
import {
  verifySourceEventAlignment,
  StoryEventDefinition
} from '@/lib/verification/event-alignment';

/**
 * PHASE 3 PIPELINE: CLAIM VERIFICATION, STRATEGIC ANALYSIS & PUBLICATION GATE
 * 
 * Strict Principle:
 * - SOURCE-FIRST, FACTS-FIRST, RELEVANCE-FIRST, THEN STRATEGIC SYNTHESIS.
 * - Input: verified articles with Phase 2A extractions and Phase 2B relevance scores.
 * - Enforces Publication Gate: every published story must trace to >= 1 verified article and >= 1 verified fact.
 * - Saves transactionally to PostgreSQL (intelligence_stories, story_sources, story_companies).
 */

export interface Phase3PipelineOptions {
  minRelevanceScore?: number; // default 4 (monitor/moderate threshold)
  clusterWindowHours?: number; // default 72h
  forceReprocess?: boolean;
}

export interface Phase3PipelineResult {
  totalCandidates: number;
  totalVerifiedStories: number;
  totalRejectedByGate: number;
  publishedStories: IntelligenceStory[];
  rejectionReasons: Array<{ articleTitle: string; reason: string }>;
  executionDurationMs: number;
}

export interface CandidateItem {
  article: RawArticle;
  extraction: ArticleExtractionRecord;
  relevance: ArticleRelevanceScoreRecord;
}

/**
 * RESEARCH TRIAGE QUALIFICATION GATE
 * Rule: "Only PICK UP and qualified RESEARCH items may proceed into deeper intelligence analysis."
 * A RESEARCH item qualifies if:
 * 1. Has >= 1 verified fact or quantitative fact.
 * 2. Event detection confidence >= 0.70.
 * 3. Not marked with suspicious timestamp.
 */
export function isQualifiedResearch(candidate: CandidateItem): { qualified: boolean; reason?: string } {
  const { article, extraction } = candidate;

  const hasVerifiedFacts = (extraction.verified_facts && extraction.verified_facts.length > 0) ||
                           (extraction.numeric_facts && extraction.numeric_facts.length > 0);
  if (!hasVerifiedFacts) {
    return {
      qualified: false,
      reason: 'Zero verified facts or quantitative data points established.'
    };
  }

  if (extraction.event_detection_confidence != null && extraction.event_detection_confidence < 0.70) {
    return {
      qualified: false,
      reason: `Event detection confidence too low (${extraction.event_detection_confidence} < 0.70).`
    };
  }

  if (article.isTimestampSuspicious) {
    return {
      qualified: false,
      reason: 'Suspicious publication timestamp pending verification.'
    };
  }

  return { qualified: true };
}

export async function runPhase3IntelligencePipeline(
  options: Phase3PipelineOptions = {}
): Promise<Phase3PipelineResult> {
  const startTime = Date.now();
  const minScore = options.minRelevanceScore ?? 4;
  const pool = getPostgresPool();

  console.log(`[Phase 3 Pipeline] Starting execution (minRelevanceScore: ${minScore})...`);

  // 1. Fetch eligible candidates from PostgreSQL (Phase 2A + 2B)
  const query = `
    SELECT 
      ra.id as raw_id,
      ra.source_id,
      ra.publisher,
      ra.title as raw_title,
      ra.url as raw_url,
      ra.original_url,
      ra.final_url,
      ra.canonical_url,
      ra.http_status,
      ra.published_at,
      ra.fetched_at,
      ra.raw_content,
      ra.cleaned_content,
      ra.content_hash,
      ra.fetch_verified,
      ra.is_article_page,
      ra.freshness_bucket,
      ra.date_extraction_source,
      ra.article_age_hours,
      ra.raw_content_bytes,
      ra.raw_content_truncated,
      ra.fetch_status,
      ra.validation_metadata,
      ae.id as extraction_id,
      ae.meaningful_event_detected,
      ae.primary_event_type,
      ae.secondary_event_types,
      ae.event_date,
      ae.event_status,
      ae.sectors as extraction_sectors,
      ae.geographies,
      ae.entities,
      ae.numeric_facts,
      ae.verified_facts,
      ae.explicit_company_statements,
      ae.source_attributed_claims,
      ae.uncertainties,
      ae.event_detection_confidence,
      ars.id as relevance_id,
      ars.signal_detected,
      ars.signal_type,
      ars.signal_strength,
      ars.matched_divisions,
      ars.matched_assets,
      ars.matched_competitors,
      ars.matched_priorities,
      ars.relevance_score,
      ars.relevance_rationale,
      ars.business_impact,
      ars.urgency,
      ars.strategic_status,
      ars.primary_sector_id,
      sec.name as primary_sector_name,
      ars.secondary_sector_ids,
      ars.matched_companies,
      ars.is_high_priority,
      ars.triage_outcome,
      ars.triage_rationale
    FROM public.article_relevance_scores ars
    JOIN public.article_extractions ae ON ars.extraction_id = ae.id
    JOIN public.raw_articles ra ON ars.raw_article_id = ra.id
    LEFT JOIN public.sectors sec ON ars.primary_sector_id = sec.id
    WHERE ars.signal_detected = true 
      AND ars.triage_outcome IN ('PICK_UP', 'RESEARCH')
      AND ars.relevance_score >= $1
      AND ra.fetch_verified = true
      AND ra.http_status = 200
    ORDER BY ars.relevance_score DESC, ra.published_at DESC;
  `;

  const res = await pool.query(query, [minScore]);
  const rows = res.rows;
  console.log(`[Phase 3 Pipeline] Retrieved ${rows.length} eligible candidates with score >= ${minScore}.`);

  const candidates: CandidateItem[] = rows.map(r => {
    const vMeta = r.validation_metadata || {};
    return {
      article: {
        id: r.raw_id,
        sourceId: r.source_id,
        publisher: r.publisher,
        title: r.raw_title,
        url: r.raw_url,
        originalUrl: r.original_url || r.raw_url,
        finalUrl: r.final_url || r.raw_url,
        canonicalUrl: r.canonical_url,
        httpStatus: r.http_status,
        publishedAt: r.published_at instanceof Date ? r.published_at.toISOString() : (r.published_at ? String(r.published_at) : null),
        fetchedAt: r.fetched_at instanceof Date ? r.fetched_at.toISOString() : String(r.fetched_at),
        dateExtractionSource: r.date_extraction_source || 'JSON_LD',
        publishedAtDeltaHours: vMeta.publishedAtDeltaHours != null ? Number(vMeta.publishedAtDeltaHours) : null,
        isTimestampSuspicious: Boolean(vMeta.isTimestampSuspicious),
        articleAgeHours: r.article_age_hours != null ? Number(r.article_age_hours) : null,
        freshnessBucket: r.freshness_bucket,
        rawContent: r.raw_content || '',
        rawContentBytes: r.raw_content_bytes != null ? Number(r.raw_content_bytes) : (r.raw_content?.length || 0),
        rawContentTruncated: Boolean(r.raw_content_truncated),
        cleanedContent: r.cleaned_content || '',
        contentHash: r.content_hash,
        fetchStatus: r.fetch_status || 'SUCCESS',
        fetchVerified: r.fetch_verified,
        isArticlePage: r.is_article_page,
      },
    extraction: {
      id: r.extraction_id,
      raw_article_id: r.raw_id,
      source_url: r.raw_url,
      publisher: r.publisher,
      published_at: r.published_at instanceof Date ? r.published_at.toISOString() : String(r.published_at),
      meaningful_event_detected: r.meaningful_event_detected,
      primary_event_type: r.primary_event_type,
      secondary_event_types: r.secondary_event_types || [],
      event_date: r.event_date,
      event_date_confidence: 80,
      event_date_source: 'ARTICLE_CONTENT',
      event_status: r.event_status,
      sectors: r.extraction_sectors || [],
      sub_sectors: [],
      geographies: r.geographies || [],
      entities: r.entities || [],
      numeric_facts: r.numeric_facts || [],
      verified_facts: r.verified_facts || [],
      explicit_company_statements: r.explicit_company_statements || [],
      source_attributed_claims: r.source_attributed_claims || [],
      uncertainties: r.uncertainties || [],
      event_detection_confidence: r.event_detection_confidence,
      extraction_quality_score: 85,
    },
    relevance: {
      id: r.relevance_id,
      raw_article_id: r.raw_id,
      extraction_id: r.extraction_id,
      signal_detected: r.signal_detected,
      signal_type: r.signal_type,
      signal_strength: r.signal_strength,
      matched_divisions: r.matched_divisions || [],
      matched_assets: r.matched_assets || [],
      matched_competitors: r.matched_competitors || [],
      matched_priorities: r.matched_priorities || [],
      relevance_score: r.relevance_score,
      relevance_rationale: r.relevance_rationale,
      business_impact: r.business_impact,
      urgency: r.urgency,
      strategic_status: r.strategic_status,
      primary_sector_id: r.primary_sector_id,
      primary_sector_name: r.primary_sector_name,
      secondary_sector_ids: r.secondary_sector_ids || [],
      matched_companies: r.matched_companies || [],
      is_high_priority: r.is_high_priority,
      triage_outcome: r.triage_outcome || 'WATCH',
      triage_rationale: r.triage_rationale || '',
    }
  };
});

  // 2. Research Triage Qualification Gate
  // Rule: "Only PICK UP and qualified RESEARCH items may proceed into deeper intelligence analysis."
  const publishedStories: IntelligenceStory[] = [];
  const rejectionReasons: Array<{ articleTitle: string; reason: string }> = [];
  const qualifiedCandidates: CandidateItem[] = [];

  for (const candidate of candidates) {
    if (candidate.relevance.triage_outcome === 'PICK_UP') {
      qualifiedCandidates.push(candidate);
    } else if (candidate.relevance.triage_outcome === 'RESEARCH') {
      const qualCheck = isQualifiedResearch(candidate);
      if (qualCheck.qualified) {
        qualifiedCandidates.push(candidate);
      } else {
        console.warn(`[Phase 3 Pipeline] Disqualified RESEARCH item "${candidate.article.title}": ${qualCheck.reason}`);
        rejectionReasons.push({
          articleTitle: candidate.article.title,
          reason: `[RESEARCH TRIAGE GATE] ${qualCheck.reason}`,
        });
      }
    } else {
      rejectionReasons.push({
        articleTitle: candidate.article.title,
        reason: `[TRIAGE GATE] Outcome "${candidate.relevance.triage_outcome}" is ineligible for deeper intelligence analysis.`,
      });
    }
  }

  // 3. Canonical Event Clustering (Part B & C)
  // Flow: RAW ARTICLES -> EXTRACTIONS -> EVENT CLUSTER -> CANONICAL FACTS -> ONE STORY
  const clusterMap = new Map<string, { cluster: EventCluster; items: CandidateItem[] }>();

  for (const candidate of qualifiedCandidates) {
    const { cluster } = await findOrCreateEventCluster(candidate);
    if (!clusterMap.has(cluster.id)) {
      clusterMap.set(cluster.id, { cluster, items: [] });
    }
    clusterMap.get(cluster.id)!.items.push(candidate);
  }

  console.log(`[Phase 3 Pipeline] Clustered ${qualifiedCandidates.length} qualified candidates into ${clusterMap.size} canonical event clusters.`);

  // 4. Process each canonical event cluster through Source-Event Alignment & Publication Gate

  for (const { cluster, items } of clusterMap.values()) {
    const primaryCandidate = items[0];

    // Check if a canonical story already exists for this event cluster in PostgreSQL
    let existingStory: any = null;
    if (cluster.canonicalStoryId) {
      const sRes = await pool.query(`SELECT * FROM public.intelligence_stories WHERE id = $1 LIMIT 1`, [cluster.canonicalStoryId]);
      if (sRes.rows.length > 0) existingStory = sRes.rows[0];
    }
    if (!existingStory) {
      const sRes = await pool.query(
        `SELECT * FROM public.intelligence_stories WHERE cluster_id = $1 OR event_fingerprint = $2 LIMIT 1`,
        [cluster.id, cluster.eventFingerprint]
      );
      if (sRes.rows.length > 0) existingStory = sRes.rows[0];
    }

    // Build canonical StoryEventDefinition
    const storyEvent: StoryEventDefinition = {
      primaryEventType: cluster.primaryEventType,
      primaryEntities: cluster.primaryEntities,
      coreClaims: cluster.canonicalCoreClaims.map(c => ({ id: c.id, claimText: c.claim })),
      projectOrAsset: cluster.projectOrAsset,
      geography: cluster.geography,
      eventDate: cluster.eventDate,
    };

    if (existingStory) {
      // EVENT ALREADY PUBLISHED: Process new candidate articles against existing canonical story
      for (const item of items) {
        // Source-Event Alignment (Gates 1, 2, 3)
        const alignment = verifySourceEventAlignment({
          article: item.article,
          extraction: item.extraction,
          storyEvent,
          isPrimarySource: false,
        });

        if (!alignment.isAttachedValid) {
          console.warn(`[Source Alignment REJECTED] "${item.article.title}": ${alignment.rejectionReason}`);
          continue;
        }

        // Evaluate Material Update Rule (Part B.7 & B.8)
        const matEval = evaluateMaterialUpdate({
          existingStory: {
            title: existingStory.title,
            extractedFacts: existingStory.extracted_facts,
          },
          newExtraction: item.extraction,
        });

        if (matEval.isMaterialUpdate) {
          console.log(`[Material Update DETECTED] Updating existing story "${existingStory.title}": ${matEval.rationale}`);
          const newExtractedFacts = {
            ...(existingStory.extracted_facts || {}),
            materialUpdates: [
              ...((existingStory.extracted_facts || {}).materialUpdates || []),
              {
                rationale: matEval.rationale,
                timestamp: new Date().toISOString(),
                sourceTitle: item.article.title,
                facts: (item.extraction.verified_facts || []).map(f => f.claim_text),
              }
            ]
          };

          await pool.query(`
            UPDATE public.intelligence_stories SET
              material_update = true,
              material_update_rationale = $1,
              extracted_facts = $2,
              last_verified_at = now(),
              updated_at = now()
            WHERE id = $3;
          `, [matEval.rationale, JSON.stringify(newExtractedFacts), existingStory.id]);

          // Attach verified source as CORROBORATING or PRIMARY
          const srcPubDateLocal = getPublicationDateLocal(item.article.publishedAt) || getTodayLocal();
          await pool.query(`
            INSERT INTO public.story_sources (
              id, story_id, raw_article_id, source_name, source_tier, article_title,
              article_url, final_url, canonical_url, published_at, source_publication_date_local,
              url_verified, event_verified, claim_verified, content_alignment_score,
              is_primary_claim_source, source_role, event_match_score, supported_core_claim_ids, created_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, 'TIER_1', $4,
              $5, $6, $7, $8, $9,
              true, true, true, $10,
              false, 'CORROBORATING', $11, $12, now()
            )
            ON CONFLICT (story_id, article_url) DO UPDATE SET
              url_verified = true,
              event_verified = true,
              claim_verified = true;
          `, [
            existingStory.id, item.article.id, item.article.publisher, item.article.title,
            item.article.url, item.article.finalUrl || item.article.url, item.article.canonicalUrl || null,
            item.article.publishedAt, srcPubDateLocal, alignment.eventMatchScore,
            alignment.eventMatchScore, alignment.supportedCoreClaimIds
          ]);

          await mergeIntoEventCluster({
            clusterId: cluster.id,
            rawArticleId: item.article.id,
            isMaterialUpdate: true,
          });
        } else {
          // No material update: attach as corroborating source if useful, DO NOT CREATE NEW STORY
          console.log(`[Event Deduplication SUPPRESSED] Attaching "${item.article.title}" as corroborating source to existing story "${existingStory.title}".`);
          const srcPubDateLocal = getPublicationDateLocal(item.article.publishedAt) || getTodayLocal();
          await pool.query(`
            INSERT INTO public.story_sources (
              id, story_id, raw_article_id, source_name, source_tier, article_title,
              article_url, final_url, canonical_url, published_at, source_publication_date_local,
              url_verified, event_verified, claim_verified, content_alignment_score,
              is_primary_claim_source, source_role, event_match_score, supported_core_claim_ids, created_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, 'TIER_1', $4,
              $5, $6, $7, $8, $9,
              true, true, true, $10,
              false, 'CORROBORATING', $11, $12, now()
            )
            ON CONFLICT (story_id, article_url) DO UPDATE SET
              url_verified = true,
              event_verified = true,
              claim_verified = true;
          `, [
            existingStory.id, item.article.id, item.article.publisher, item.article.title,
            item.article.url, item.article.finalUrl || item.article.url, item.article.canonicalUrl || null,
            item.article.publishedAt, srcPubDateLocal, alignment.eventMatchScore,
            alignment.eventMatchScore, alignment.supportedCoreClaimIds
          ]);

          await mergeIntoEventCluster({
            clusterId: cluster.id,
            rawArticleId: item.article.id,
            isMaterialUpdate: false,
          });
        }
      }
      continue;
    }

    // NEW EVENT CLUSTER: Synthesize ONE canonical story
    // Run Source-Event Alignment on ALL candidate items in cluster
    const validItems: CandidateItem[] = [];
    const alignedSources: StorySourceLink[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const alignment = verifySourceEventAlignment({
        article: item.article,
        extraction: item.extraction,
        storyEvent,
        isPrimarySource: idx === 0,
      });

      if (alignment.isAttachedValid) {
        validItems.push(item);
        const srcPubDateLocal = getPublicationDateLocal(item.article.publishedAt) || getTodayLocal();
        alignedSources.push({
          id: `src-${item.article.id}-${idx}`,
          sourceId: item.article.id,
          sourceName: item.article.publisher || 'Unknown Publisher',
          sourceTier: 'TIER_1',
          articleTitle: item.article.title,
          articleUrl: item.article.url,
          validatedUrl: item.article.finalUrl || item.article.url,
          canonicalUrl: item.article.canonicalUrl || undefined,
          publishedAt: item.article.publishedAt || new Date().toISOString(),
          sourcePublicationDateLocal: srcPubDateLocal,
          firstSeenAt: item.article.fetchedAt,
          isPrimaryClaimSource: idx === 0,
          linkStatus: 'VERIFIED',
          isContentMatched: true,
          contentMatchScore: alignment.eventMatchScore,
          sourceRole: alignment.sourceRole,
          eventMatchScore: alignment.eventMatchScore,
          supportedCoreClaimIds: alignment.supportedCoreClaimIds,
          isUrlValid: alignment.isUrlValid,
          isEventMatched: alignment.isEventMatched,
          isCoreClaimSupported: alignment.isCoreClaimSupported,
        });
      } else {
        console.warn(`[Source Alignment REJECTED] "${item.article.title}": ${alignment.rejectionReason}`);
      }
    }

    if (validItems.length === 0) {
      console.warn(`[Cluster REJECTED] "${primaryCandidate.article.title}": 0 valid sources passed alignment gates.`);
      rejectionReasons.push({
        articleTitle: primaryCandidate.article.title,
        reason: 'Zero supporting sources passed Source-Event Alignment gates.',
      });
      continue;
    }

    // Run claim verification across all valid sources in the cluster
    const verification = verifyStoryClaimsAndSources({
      articles: validItems.map(c => ({
        article: c.article,
        extraction: c.extraction,
      }))
    });

    if (!verification.is_publishable) {
      console.warn(`[Publication Gate REJECTED] "${primaryCandidate.article.title}": ${verification.publication_gate_reason}`);
      rejectionReasons.push({
        articleTitle: primaryCandidate.article.title,
        reason: verification.publication_gate_reason || 'Failed publication gate criteria.',
      });
      continue;
    }

    // Synthesize grounded strategic story
    const story = synthesizeStrategicStory({
      articles: validItems.map(c => ({
        article: c.article,
        extraction: c.extraction,
      })),
      relevance: validItems[0].relevance,
      verification,
      modelName: 'gpt-4o',
      clusterId: cluster.id,
      eventFingerprint: cluster.eventFingerprint,
      alignedSources,
    });

    // Persist transactionally to PostgreSQL
    const saveResult = await saveStoryToPostgres(story);
    if (!saveResult.success) {
      console.error(`[Phase 3 Pipeline] Database save failed for "${story.title}":`, saveResult.error);
      rejectionReasons.push({
        articleTitle: story.title,
        reason: `Database persistence failed: ${saveResult.error}`,
      });
      continue;
    }

    story.id = saveResult.storyId || story.id;
    publishedStories.push(story);

    // Update event cluster with canonical story ID
    await pool.query(`
      UPDATE public.event_clusters SET
        canonical_story_id = $1,
        latest_update_at = now(),
        updated_at = now()
      WHERE id = $2;
    `, [story.id, cluster.id]);

    console.log(`[Phase 3 PUBLISHED] "${story.title}" (Score: ${story.relevanceScore}/10, Conf: ${story.confidenceScore}%, Sources: ${story.sources.length})`);
  }

  const duration = Date.now() - startTime;
  console.log(`[Phase 3 Pipeline] Finished in ${duration}ms. Published: ${publishedStories.length}, Rejected: ${rejectionReasons.length}.`);

  return {
    totalCandidates: candidates.length,
    totalVerifiedStories: publishedStories.length,
    totalRejectedByGate: rejectionReasons.length,
    publishedStories,
    rejectionReasons,
    executionDurationMs: duration,
  };
}
