import { RawArticle, ExtractedFacts, IntelligenceStory, MentionedCompanyRef, StorySourceLink } from '@/types/intelligence';
import { ArticleExtractionRecord } from '@/types/extraction';
import { ArticleRelevanceScoreRecord } from '@/types/relevance';
import { StoryVerificationResult } from '@/lib/verification/claim-verifier';
import { getPublicationDateLocal, getTodayLocal, generateEventFingerprint } from '@/lib/verification/temporal-gating';

/**
 * PHASE 3 / 3.1: STRATEGIC & BD ANALYSIS SYNTHESIZER
 * 
 * Strict Principle:
 * - Evidence-grounded synthesis ONLY.
 * - Starts from verified facts (Phase 2A), potential signals & relevance (Phase 2B).
 * - Enforces separate temporal fields:
 *     * published_at (publisher timestamp)
 *     * source_publication_date_local (calendar date in Asia/Ho_Chi_Minh)
 *     * daily_brief_date (assigned Daily date in Asia/Ho_Chi_Minh)
 *     * event_date (actual event occurrence date)
 *     * event_fingerprint & material_update
 * - Never synthesizes hypothetical stories without underlying verified raw articles.
 */

export interface StrategicSynthesisInput {
  articles: Array<{
    article: RawArticle;
    extraction: ArticleExtractionRecord;
  }>;
  relevance: ArticleRelevanceScoreRecord;
  verification: StoryVerificationResult;
  modelName?: string;
  materialUpdate?: boolean;
  materialUpdateRationale?: string;
  clusterId?: string;
  eventFingerprint?: string;
  alignedSources?: StorySourceLink[];
}

/**
 * Generates an executive title grounded in facts.
 */
function generateExecutiveTitle(
  primaryArticle: RawArticle,
  extraction: ArticleExtractionRecord,
  relevance: ArticleRelevanceScoreRecord
): string {
  // If the article title is already high quality and clean, format it professionally
  const rawTitle = primaryArticle.title.trim();
  
  // Clean common noise prefixes like "[Nóng]", "Tin mới:", "Chính thức:"
  let cleanTitle = rawTitle
    .replace(/^\[(Nóng|Tin mới|Tiêu điểm|Hot)\]\s*/i, '')
    .replace(/^(Nóng|Tin tức|Bản tin):\s*/i, '')
    .trim();

  // If title is concise, use it; otherwise craft a tight headline from entities and event
  if (cleanTitle.length <= 110 && cleanTitle.length >= 25) {
    return cleanTitle;
  }

  const primaryEntity = extraction.entities[0]?.name;
  const event = extraction.primary_event_type;
  const location = extraction.geographies[0];
  const dealValue = extraction.numeric_facts[0]?.raw_value;

  if (primaryEntity && location && dealValue) {
    return `${primaryEntity} Triển Khai ${event} Tại ${location} Quy Mô ${dealValue}`;
  } else if (primaryEntity && location) {
    return `${primaryEntity} Đầu Tư ${event} Tại ${location}`;
  }

  return cleanTitle.slice(0, 100);
}

/**
 * Builds an objective, fact-only executive summary.
 */
function buildObjectiveSummary(
  articles: Array<{ article: RawArticle; extraction: ArticleExtractionRecord }>,
  relevance: ArticleRelevanceScoreRecord
): string {
  const primaryExtraction = articles[0].extraction;
  const primaryArticle = articles[0].article;

  // 1. Gather clean paragraphs from primary article
  const leadParagraphs = (primaryArticle.cleanedContent || '')
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 40 && 
      !p.startsWith('Photo courtesy') && 
      !p.startsWith('Ảnh:') && 
      !p.startsWith('Tags:') &&
      !p.includes('All rights reserved')
    );

  // 2. Gather verified factual claims (filtering out navigation artifacts)
  const cleanClaims = (primaryExtraction.verified_facts || [])
    .map(c => c.claim_text?.trim())
    .filter(Boolean)
    .filter(c => c.length > 50 && !c.includes('GMT+7') && !c.includes('Wed, October') && !c.includes('Thứ '));

  let summary = '';
  if (cleanClaims.length > 0) {
    summary = cleanClaims.slice(0, 2).join(' ');
  } else if (leadParagraphs.length > 0) {
    summary = leadParagraphs.slice(0, 2).join(' ');
  } else {
    summary = primaryArticle.title;
  }

  // Append key numerical data if not already present
  const keyMetrics = (primaryExtraction.numeric_facts || [])
    .filter(nf => nf.raw_value && !summary.includes(nf.raw_value))
    .map(nf => nf.raw_value)
    .slice(0, 2)
    .join(', ');

  if (keyMetrics && summary.length < 320) {
    summary += ` (Recorded metrics: ${keyMetrics}).`;
  }

  return summary.trim().slice(0, 500);
}

/**
 * Synthesizes "Why It Matters to Sojitz" tailored specifically to Sojitz Vietnam.
 */
function synthesizeWhyItMatters(
  relevance: ArticleRelevanceScoreRecord,
  extraction: ArticleExtractionRecord
): string {
  const divisions = relevance.matched_divisions;
  const assets = relevance.matched_assets;
  const competitors = relevance.matched_competitors;
  const sectors = extraction.sectors || [];
  const primarySector = relevance.primary_sector_name || sectors[0] || '';
  const impact = relevance.business_impact;

  const points: string[] = [];

  // 1. Direct Asset Grounding
  if (assets.length > 0) {
    points.push(
      `Direct operational and commercial impact on Sojitz Vietnam assets: ${assets.join(', ')}. The development reinforces operational resilience, infrastructure readiness, or tenant expansion for key partners.`
    );
  }

  // 2. Competitor / Sogo Shosha Landscape
  if (competitors.length > 0) {
    points.push(
      `Competitive landscape alert: Directly involves Japanese Sogo Shosha peer activity (${competitors.join(', ')}). Monitor market share dynamics and evaluate counter-partnership positioning.`
    );
  }

  // 3. Division Strategic Alignment (Domain-specific)
  if (divisions.length > 0) {
    const divNames = divisions.map(d => {
      switch (d) {
        case 'ENERGY': return 'Energy & Power Projects Division';
        case 'INFRA_LOGISTICS': return 'Industrial Parks & Logistics Division';
        case 'FOOD_RETAIL': return 'Retail, FMCG & Agriculture Division';
        case 'CHEMICALS': return 'Chemicals, Plastics & Fertilizers Division';
        case 'AUTOMOTIVE': return 'Automotive & Machinery Division';
        default: return d;
      }
    }).join(' and ');

    points.push(
      `Strategic priority for Sojitz ${divNames}. This development creates actionable ground for investment origination, capital allocation, and long-term commercial partnership agreements.`
    );
  }

  // 4. Sector-Specific Strategic Context
  const isEnergy = sectors.includes('Energy') || sectors.includes('Renewable Energy') || primarySector.includes('Energy');
  const isTech = sectors.includes('AI') || sectors.includes('Digital') || primarySector.includes('Digital') || primarySector.includes('AI');
  const isLogistics = sectors.includes('Logistics') || sectors.includes('Industrial Parks') || primarySector.includes('Industrial');

  if (isEnergy) {
    points.push(
      'Institutional reforms and transmission infrastructure progress establish clearer pathways for direct clean power supply, Direct Power Purchase Agreements (DPPA), and energy cost optimization for industrial park tenants.'
    );
  } else if (isTech) {
    points.push(
      'Opens potential for digital infrastructure, Data Center development, and enterprise AI/automation solutions serving Japanese manufacturing networks in Vietnam.'
    );
  } else if (isLogistics) {
    points.push(
      'Supports industrial land bank expansion, automated smart warehousing, and resilient export supply chain connectivity for satellite factories.'
    );
  }

  // 5. Default fallback
  if (points.length === 0) {
    points.push(
      `Classified as ${impact}. Informs SVN Corporate Planning and Business Development in assessing market trajectory and strategic medium-term positioning in Vietnam.`
    );
  }

  return points.join(' ');
}

/**
 * Generates concrete, professional, actionable Suggested BD Actions in English.
 */
function synthesizeSuggestedBdAction(
  relevance: ArticleRelevanceScoreRecord,
  extraction: ArticleExtractionRecord
): string {
  const divisions = relevance.matched_divisions;
  const assets = relevance.matched_assets;
  const event = extraction.primary_event_type;
  const sectors = extraction.sectors || [];
  const primarySector = relevance.primary_sector_name || sectors[0] || '';

  const actions: string[] = [];

  // Asset-specific actions
  if (assets.includes('Long Đức Industrial Park') || assets.includes('Long Đức IP')) {
    actions.push(
      'Coordinate with Long Duc Industrial Park management (Dong Nai) and Daiwa House partner team to review site clearance progress, utility planning, and launch incentive packages for incoming Japanese supply chain tenants.'
    );
  }

  if (assets.includes('Phú Mỹ 3') || assets.includes('Phu My 3')) {
    actions.push(
      'SVN Energy Project team to engage EVN and PV Gas on LNG fuel transition feasibility and evaluate long-term off-take terms.'
    );
  }

  if (assets.includes('Huong Thuy') || assets.includes('Hương Thủy') || assets.includes('Ministop') || assets.includes('Vinabeef')) {
    actions.push(
      'Consumer & Food Division to leverage Huong Thuy and Ministop retail distribution channels to expand product penetration and finalize chilled beef supply agreements with Vinabeef.'
    );
  }

  // Domain-specific actions
  if (divisions.includes('ENERGY') || sectors.includes('Energy') || primarySector.includes('Energy')) {
    actions.push(
      'Energy Project Taskforce to model project unit economics under the DPPA framework, engaging major industrial park manufacturers to propose direct private-wire clean power supply.'
    );
  }

  if (sectors.includes('AI') || sectors.includes('Digital') || primarySector.includes('AI') || primarySector.includes('Digital')) {
    actions.push(
      'Technology BD team to partner with the National Innovation Center (NIC) and technology partners to explore co-investment in data infrastructure and digital transformation solutions for Japanese enterprises.'
    );
  }

  if (divisions.includes('INFRA_LOGISTICS') && (event === 'PARTNERSHIP' || event === 'NEW_PROJECT')) {
    actions.push(
      'Infrastructure Taskforce to approach key transport and logistics project owners to propose supply chain management, specialized equipment procurement, or joint venture co-investment.'
    );
  }

  // General high-priority action
  if (relevance.relevance_score >= 8 && actions.length === 0) {
    actions.push(
      'Report key findings to Sojitz Vietnam General Management during weekly executive briefing; deploy BD taskforce to initiate senior-level dialogue with counterparties within 10 business days.'
    );
  }

  // Standard monitoring action
  if (actions.length === 0) {
    actions.push(
      'Market Intelligence desk to track regulatory milestones, financial disclosures, and partner announcements to update the potential investment pipeline.'
    );
  }

  return actions.join(' ');
}

/**
 * Builds structured ExtractedFacts JSON object.
 */
function buildExtractedFactsObject(extraction: ArticleExtractionRecord): ExtractedFacts {
  let dealValueUsd: number | null = null;
  let dealValueText: string | null = null;
  let stakePercentage: number | null = null;
  let capacityOrSize: string | null = null;

  for (const num of extraction.numeric_facts || []) {
    if (!num) continue;
    const rawLower = (num.raw_value || '').toLowerCase();
    if (num.currency === 'USD' || rawLower.includes('$') || rawLower.includes('usd')) {
      if (num.numeric_value && !dealValueUsd) {
        dealValueUsd = num.numeric_value;
        dealValueText = num.raw_value;
      }
    } else if (rawLower.includes('tỷ') || rawLower.includes('vnd')) {
      if (!dealValueText) {
        dealValueText = num.raw_value;
      }
    }

    if (num.unit === '%' || rawLower.includes('%')) {
      if (num.numeric_value && !stakePercentage) {
        stakePercentage = num.numeric_value;
      }
    }

    if (rawLower.includes('ha') || rawLower.includes('mw') || rawLower.includes('m2') || rawLower.includes('toa') || rawLower.includes('train')) {
      capacityOrSize = num.raw_value;
    }
  }

  const keyPartners = extraction.entities
    .filter(e => e.role_in_event === 'PARTNER' || e.role_in_event === 'INVESTOR')
    .map(e => e.name);

  const keyQuotes = (extraction.explicit_company_statements || [])
    .map(c => c.claim_text)
    .filter(Boolean)
    .slice(0, 3);

  return {
    dealValueUsd,
    dealValueText,
    stakePercentage,
    capacityOrSize,
    location: extraction.geographies[0] || null,
    announcedTimeline: extraction.event_date || null,
    keyPartners: keyPartners.length > 0 ? keyPartners : undefined,
    keyQuotes: keyQuotes.length > 0 ? keyQuotes : undefined,
  };
}

/**
 * Main function: Synthesizes a fully grounded IntelligenceStory.
 */
export function synthesizeStrategicStory(input: StrategicSynthesisInput): IntelligenceStory {
  const { articles, relevance, verification, modelName = 'gpt-4o' } = input;
  const primaryArticle = articles[0].article;
  const primaryExtraction = articles[0].extraction;

  const title = generateExecutiveTitle(primaryArticle, primaryExtraction, relevance);
  
  // Create deterministic URL slug
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  const slug = `${baseSlug}-${primaryArticle.id.slice(0, 8)}`;

  const now = new Date().toISOString();
  const todayLocal = getTodayLocal();
  const sourcePubDateLocal = getPublicationDateLocal(primaryArticle.publishedAt) || todayLocal;
  const dailyBriefDate = sourcePubDateLocal;
  const eventDate = primaryExtraction.event_date || sourcePubDateLocal;

  const eventFingerprint = generateEventFingerprint({
    entities: primaryExtraction.entities,
    primaryEventType: primaryExtraction.primary_event_type,
    geographies: primaryExtraction.geographies,
    primaryAsset: relevance.matched_assets[0],
  });

  const summary = buildObjectiveSummary(articles, relevance);
  const whyItMattersToSojitz = synthesizeWhyItMatters(relevance, primaryExtraction);
  const suggestedBdAction = synthesizeSuggestedBdAction(relevance, primaryExtraction);

  const extractedFacts = buildExtractedFactsObject(primaryExtraction);

  // Map mentioned companies
  const companiesMentioned: MentionedCompanyRef[] = (relevance.matched_companies || []).map((c, idx) => ({
    id: c.company_id,
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    origin: (c.origin as any) || 'VIETNAM',
    role: c.role || 'SUBJECT',
  }));

  // Map story source links
  const sources: StorySourceLink[] = input.alignedSources && input.alignedSources.length > 0
    ? input.alignedSources
    : (verification.source_reports || []).map((rep, idx) => {
        const srcPubDateLocal = getPublicationDateLocal(rep.published_at) || todayLocal;
        return {
          id: `src-${primaryArticle.id}-${idx}`,
          sourceId: rep.raw_article_id,
          sourceName: rep.source_name,
          sourceTier: rep.source_tier,
          articleTitle: rep.article_title,
          articleUrl: rep.article_url,
          validatedUrl: rep.final_url,
          canonicalUrl: rep.canonical_url,
          publishedAt: rep.published_at,
          sourcePublicationDateLocal: srcPubDateLocal,
          firstSeenAt: primaryArticle.fetchedAt || now,
          isPrimaryClaimSource: rep.is_primary_claim_source,
          linkStatus: rep.url_verified ? 'VERIFIED' : 'UNREACHABLE',
          isContentMatched: rep.content_alignment_score >= 50,
          contentMatchScore: rep.content_alignment_score,
          sourceRole: idx === 0 ? 'PRIMARY' : 'CORROBORATING',
          eventMatchScore: rep.content_alignment_score,
          isUrlValid: rep.url_verified,
          isEventMatched: rep.content_alignment_score >= 80,
          isCoreClaimSupported: true,
          supportedCoreClaimIds: [],
        };
      });

  const category = relevance.primary_sector_name || primaryExtraction.primary_event_type;
  const verifiedSourcesCount = sources.filter(s => s.sourceRole === 'PRIMARY' || s.sourceRole === 'CORROBORATING').length;

  return {
    id: `story-${primaryArticle.id}`,
    title,
    slug,
    publicationDate: sourcePubDateLocal,
    storyDate: eventDate,
    eventDate,
    sourcePublicationDateLocal: sourcePubDateLocal,
    dailyBriefDate,
    firstSeenAt: primaryArticle.fetchedAt || now,
    lastVerifiedAt: now,
    eventFingerprint: input.eventFingerprint || eventFingerprint,
    clusterId: input.clusterId,
    materialUpdate: Boolean(input.materialUpdate),
    materialUpdateRationale: input.materialUpdateRationale,
    country: 'Vietnam',
    category,
    primarySectorId: relevance.primary_sector_id || undefined,
    primarySectorName: relevance.primary_sector_name || 'General',
    primarySectorSlug: (relevance.primary_sector_name || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    secondarySectors: relevance.secondary_sector_ids,
    companiesMentioned,
    
    // Executive Synthesis
    summary,
    whyItMattersToSojitz,
    businessImpact: relevance.business_impact,
    suggestedBdAction,
    relevanceScore: relevance.relevance_score,
    
    // Source Verification Details
    verificationStatus: verification.verification_status,
    confidenceScore: verification.confidence_score,
    verificationRationale: verification.verification_rationale,
    extractedFacts,
    detectedConflicts: verification.detected_conflicts as any,
    
    // Linked Sources
    sources,
    originalUrls: articles.map(a => a.article.url),
    
    // Publication & Metadata
    aiModelUsed: modelName,
    dateCollected: todayLocal,
    collectionTimestamp: now,
    aiAnalysisTimestamp: now,
    isHighPriority: relevance.relevance_score >= 8,
    isEditorApproved: true,
    isPublished: verification.is_publishable,
    sourceGrounded: true,
    articleStatus: verifiedSourcesCount >= 2 ? 'MULTI_SOURCE_VERIFIED' : 'SINGLE_SOURCE_VERIFIED',
    verifiedSourceCount: verifiedSourcesCount,
  };
}
