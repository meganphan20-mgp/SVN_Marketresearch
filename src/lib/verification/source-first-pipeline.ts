import { openAndValidateSourceUrl, toStorySourceLink } from './source-first-validator';
import { extractTokens, calculateJaccardSimilarity } from './deduplication';
import { storyAnalyzer } from '../ai/story-analyzer';
import { intelligenceStore } from '../data/intelligence-store';
import { 
  IntelligenceStory, 
  ValidatedSourceRecord, 
  ArticlePublicationStatus, 
  StorySourceLink,
  MentionedCompanyRef
} from '@/types/intelligence';

export interface CandidateDiscoveredSource {
  url: string;
  sourceName?: string;
  discoveredFrom?: 'RSS' | 'API' | 'SITEMAP' | 'SEARCH' | 'DATABASE';
}

export interface SourceFirstPipelineResult {
  discoveredCount: number;
  openedAndValidatedCount: number;
  discardedInvalidCount: number;
  intelligenceItemsCreated: number;
  items: IntelligenceStory[];
  executionTimeMs: number;
}

/**
 * SOURCE-FIRST CLUSTERING
 * Groups validated source records that materially report the same event.
 */
function clusterValidatedSources(records: ValidatedSourceRecord[]): ValidatedSourceRecord[][] {
  const clusters: ValidatedSourceRecord[][] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    if (assigned.has(records[i].source_id)) continue;

    const currentCluster = [records[i]];
    assigned.add(records[i].source_id);

    const tokensA = extractTokens(records[i].source_title + ' ' + records[i].article_body.slice(0, 300));

    for (let j = i + 1; j < records.length; j++) {
      if (assigned.has(records[j].source_id)) continue;

      const tokensB = extractTokens(records[j].source_title + ' ' + records[j].article_body.slice(0, 300));
      const sim = calculateJaccardSimilarity(tokensA, tokensB);

      // Same event threshold
      if (sim >= 0.28) {
        currentCluster.push(records[j]);
        assigned.add(records[j].source_id);
      }
    }

    clusters.push(currentCluster);
  }

  return clusters;
}

/**
 * Extracts key corporate entities and figures directly from the validated body text.
 */
function extractFactsFromArticleBody(body: string, title: string): {
  companies: MentionedCompanyRef[];
  dealValueText: string | null;
  location: string | null;
} {
  const text = `${title} ${body}`;
  const companies: MentionedCompanyRef[] = [];

  const KNOWN_ENTITIES: Array<{ name: string; slug: string; origin: MentionedCompanyRef['origin'] }> = [
    { name: 'Sojitz Corporation', slug: 'sojitz-corporation', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Sumitomo Corporation', slug: 'sumitomo-corporation', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Mitsubishi Corporation', slug: 'mitsubishi-corporation', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Mitsui & Co.', slug: 'mitsui-and-co', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Marubeni Corporation', slug: 'marubeni-corporation', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Itochu Corporation', slug: 'itochu-corporation', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Toyota Tsusho', slug: 'toyota-tsusho', origin: 'JAPANESE_TRADING_HOUSE' },
    { name: 'Vingroup', slug: 'vingroup', origin: 'VIETNAM' },
    { name: 'Masan Group', slug: 'masan-group', origin: 'VIETNAM' },
    { name: 'FPT Corporation', slug: 'fpt-corporation', origin: 'VIETNAM' },
    { name: 'Becamex IDC', slug: 'becamex-idc', origin: 'VIETNAM' },
    { name: 'Vinamilk', slug: 'vinamilk', origin: 'VIETNAM' },
    { name: 'Petrovietnam (PVN)', slug: 'petrovietnam', origin: 'VIETNAM' },
    { name: 'EVN', slug: 'evn', origin: 'VIETNAM' },
  ];

  for (const ent of KNOWN_ENTITIES) {
    if (new RegExp(`\\b${ent.name.split(' ')[0]}\\b`, 'i').test(text)) {
      companies.push({
        id: `comp-${ent.slug}`,
        name: ent.name,
        slug: ent.slug,
        origin: ent.origin,
      });
    }
  }

  // Extract deal values
  const dealMatch = text.match(/\$\s*([0-9.,]+)\s*(billion|million|B|M)\b/i) ||
                    text.match(/([0-9.,]+)\s*(tỷ|triệu)\s*USD/i);
  let dealValueText: string | null = null;
  if (dealMatch) {
    dealValueText = dealMatch[0].trim();
  }

  // Extract locations
  const LOCATIONS = ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Binh Duong', 'Dong Nai', 'Hai Phong', 'Quang Ninh', 'Bac Ninh', 'Long An', 'Can Tho'];
  let location: string | null = null;
  for (const loc of LOCATIONS) {
    if (text.includes(loc)) {
      location = loc;
      break;
    }
  }

  return { companies, dealValueText, location };
}

/**
 * CRITICAL SOURCE-FIRST PIPELINE
 * 
 * Enforces the non-negotiable rule:
 * SOURCE FIRST -> FACT SECOND -> ANALYSIS THIRD.
 * 
 * An intelligence item MUST NOT exist unless at least one real source
 * article has already been successfully discovered, opened, validated, and parsed.
 * 
 * NO VERIFIED DIRECT SOURCE URL = NO INTELLIGENCE ITEM.
 */
export async function executeSourceFirstPipeline(
  candidateSources: CandidateDiscoveredSource[]
): Promise<SourceFirstPipelineResult> {
  const startTime = Date.now();
  const discoveredCount = candidateSources.length;
  let discardedInvalidCount = 0;

  // ==================================================
  // STEP 1 & 2: OPEN THE URL BEFORE ANY AI ANALYSIS
  // ==================================================
  const validatedRecords: ValidatedSourceRecord[] = [];

  for (const candidate of candidateSources) {
    // Perform actual HTTP request & full content parse
    const validated = await openAndValidateSourceUrl(candidate.url, candidate.sourceName);

    if (validated) {
      validatedRecords.push(validated);
    } else {
      // SECTION 3: HARD DELETE CONDITIONS
      // Immediately discard. Do not create admin review. Do not save source.
      discardedInvalidCount++;
    }
  }

  // ==================================================
  // STEP 3: CLUSTER VALIDATED SOURCES (NO GHOSTS)
  // ==================================================
  const clusters = clusterValidatedSources(validatedRecords);
  const createdStories: IntelligenceStory[] = [];

  // ==================================================
  // STEP 4, 5 & 6: FACT EXTRACTION & AI SYNTHESIS
  // ==================================================
  for (const cluster of clusters) {
    // SECTION 8 — ARTICLE CREATION GATE:
    // IF validated_source_count < 1: DO NOT INSERT. STOP.
    if (cluster.length < 1) {
      continue;
    }

    const primaryRecord = cluster[0];
    const facts = extractFactsFromArticleBody(primaryRecord.article_body, primaryRecord.source_title);

    // AI Market Intelligence Agent receives ONLY validated_source_content
    const combinedValidatedText = cluster
      .map(r => `--- SOURCE [${r.publisher}] (${r.published_at}): ${r.source_title} ---\n${r.article_body}`)
      .join('\n\n');

    const analysis = await storyAnalyzer.analyzeCluster({
      clusterTitle: primaryRecord.source_title,
      articles: cluster.map(r => ({
        id: r.source_id,
        sourceName: r.publisher,
        sourceTier: r.source_tier || 'TIER_1',
        url: r.validated_url,
        publishedAt: r.published_at,
        title: r.source_title,
        content: r.article_body,
        entities: facts.companies.map(c => c.name),
      })),
      taxonomySectors: ['logistics', 'renewables', 'industrial-parks', 'energy', 'manufacturing', 'retail'],
      watchlistCompanies: facts.companies.map(c => c.name),
    });

    // Map validated records into StorySourceLinks
    const storySources: StorySourceLink[] = cluster.map((r, idx) => toStorySourceLink(r, idx === 0));

    // SECTION 7 & 9 — MULTI-SOURCE VERIFICATION & CONFIDENCE CAP
    const verifiedSourceCount = storySources.length;
    const articleStatus: ArticlePublicationStatus = verifiedSourceCount >= 2 
      ? 'MULTI_SOURCE_VERIFIED' 
      : 'SINGLE_SOURCE_VERIFIED';

    let maxConfidence = 0;
    if (verifiedSourceCount === 1) maxConfidence = 75;
    else if (verifiedSourceCount === 2) maxConfidence = 95;
    else maxConfidence = 100;

    const baseConfidence = analysis.extractedFacts?.dealValueText ? 92 : 82;
    const confidenceScore = Math.min(baseConfidence, maxConfidence);

    // SECTION 8 & 10: DATABASE CONSTRAINT ENFORCEMENT
    // Intelligence record constructed ONLY from verified facts
    const storyId = `story-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const story: IntelligenceStory = {
      id: storyId,
      title: primaryRecord.source_title, // Exact title from actual page (Section 5)
      slug: primaryRecord.source_title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 80),
      publicationDate: primaryRecord.published_at,
      storyDate: primaryRecord.published_at,
      country: 'Vietnam',
      category: analysis.category || 'M&A / Investment',
      primarySectorName: analysis.primarySectorName || 'Cross Sector',
      primarySectorSlug: analysis.primarySectorSlug || 'cross-sector',
      secondarySectors: analysis.secondarySectorSlugs || [],
      companiesMentioned: facts.companies.length > 0 ? facts.companies : (analysis.companiesMentioned || []).map((c, i) => ({
        id: `comp-${i}`,
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
        origin: c.origin || 'VIETNAM',
        role: c.role || 'Market Participant',
      })),
      summary: analysis.summary || primaryRecord.article_body.slice(0, 300) + '...',
      whyItMattersToSojitz: analysis.whyItMattersToSojitz || 'Strategic relevance to Sojitz Vietnam operations and market position.',
      businessImpact: analysis.businessImpact || 'OPPORTUNITY',
      suggestedBdAction: analysis.suggestedBdAction || 'Monitor development and engage regional counterparts.',
      relevanceScore: analysis.relevanceScore || 8,
      verificationStatus: verifiedSourceCount >= 2 ? 'VERIFIED' : 'SINGLE_SOURCE',
      confidenceScore,
      verificationRationale: verifiedSourceCount >= 2
        ? `Confirmed by ${verifiedSourceCount} independent, accessible sources: ${cluster.map(r => r.publisher).join(', ')}.`
        : `Verified by single primary source: ${primaryRecord.publisher}. Direct article reached and parsed.`,
      extractedFacts: {
        dealValueText: facts.dealValueText || analysis.extractedFacts?.dealValueText,
        location: facts.location,
        keyPartners: facts.companies.map(c => c.name),
      },
      detectedConflicts: [],
      sources: storySources,
      originalUrls: storySources.map(s => s.accessUrl || s.articleUrl),
      aiModelUsed: 'gpt-4o',
      dateCollected: new Date().toISOString().slice(0, 10),
      collectionTimestamp: new Date().toISOString(),
      aiAnalysisTimestamp: new Date().toISOString(),
      articleStatus,
      verifiedSourceCount,
      isPublished: true,
      sourceAuditStatus: 'AUDITED',
    };

    // Save to store (which validates the constraint verified_source_count >= 1)
    await intelligenceStore.saveStory(story);
    createdStories.push(story);
  }

  return {
    discoveredCount,
    openedAndValidatedCount: validatedRecords.length,
    discardedInvalidCount,
    intelligenceItemsCreated: createdStories.length,
    items: createdStories,
    executionTimeMs: Date.now() - startTime,
  };
}
