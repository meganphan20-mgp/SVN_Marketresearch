import { ArticleExtractionRecord } from '@/types/extraction';
import { RawArticle } from '@/types/intelligence';
import { 
  ArticleRelevanceScoreRecord, 
  BusinessImpactType, 
  StrategicStatus, 
  SignalStrength,
  TriageOutcome,
  SojitzRelevanceCriterion
} from '@/types/relevance';
import { matchKnowledgeBank } from './knowledge-bank-matcher';

/**
 * PHASE 2B RELEVANCE SCORER & RESEARCH TRIAGE
 * 
 * Strict Principle:
 * - Relevance evaluation strictly grounded in Sojitz Vietnam Knowledge Bank.
 * - Adheres to Sojitz 1-10 Rubric:
 *   9-10: Critical / Direct Impact (Sojitz assets, key partners, direct Sogo Shosha moves)
 *   7-8:  High Importance (Major policy decree or M&A in Priority 1 sectors)
 *   4-6:  Moderate / Monitor (Priority 2 sectors, financing, macro indicators)
 *   1-3:  Low / Informational (General business news, overseas luxury property, non-strategic)
 * - Triage Outcomes:
 *   DROP: No meaningful relevance to Sojitz.
 *   WATCH: Strategic relevance but no direct business opportunity.
 *   PICK UP: Meaningful signal that should enter the intelligence pipeline.
 *   RESEARCH: Potentially important but requires additional verification or context.
 */

export async function scoreArticleRelevance(
  extraction: ArticleExtractionRecord,
  rawArticle: RawArticle
): Promise<ArticleRelevanceScoreRecord> {
  const extractionId = extraction.id;
  const rawArticleId = extraction.raw_article_id;

  // 1. Fail-safe: Non-Commercial Articles
  if (!extraction.meaningful_event_detected) {
    return {
      id: `rel-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      raw_article_id: rawArticleId,
      extraction_id: extractionId,
      signal_detected: false,
      signal_type: 'NON_COMMERCIAL',
      signal_strength: 'LOW',
      matched_divisions: [],
      matched_assets: [],
      matched_competitors: [],
      matched_priorities: [],
      relevance_score: 1,
      relevance_rationale: 'Non-commercial content contains no structured business or commercial event.',
      triage_outcome: 'DROP',
      triage_rationale: 'The article has no meaningful commercial relevance to Sojitz.',
      business_impact: 'MARKET_INTELLIGENCE',
      urgency: 'LOW',
      strategic_status: 'WATCH',
      primary_sector_id: null,
      primary_sector_name: 'None',
      secondary_sector_ids: [],
      matched_companies: [],
      is_high_priority: false,
      scoring_metadata: {
        asset_match_score: 0,
        division_match_score: 0,
        competitor_impact_score: 0,
        sector_priority: 'NONE',
        rubric_tier: 'NON_COMMERCIAL',
      },
    };
  }

  // 2. Knowledge Bank Matching
  const kbMatch = await matchKnowledgeBank(extraction, rawArticle.title);

  const matchedAssets = kbMatch.matchedAssets;
  const matchedCompetitors = kbMatch.matchedCompetitors;
  const matchedDivisions = kbMatch.matchedDivisions.map(d => d.code);
  const matchedPriorities = kbMatch.matchedPriorities;
  const matchedCompanies = kbMatch.matchedCompanies;
  const primarySector = kbMatch.primarySector;
  const secondarySectorIds = kbMatch.secondarySectors.map(s => s.sector_id);

  let relevance_score = 3;
  let relevance_rationale = '';
  let rubric_tier = 'TIER_4_LOW';
  let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let strategic_status: StrategicStatus = 'WATCH';
  let signal_strength: SignalStrength = 'MEDIUM';
  let signal_type = 'MARKET_DEVELOPMENT';

  // Check 1: TIER 1 (9 - 10) - CRITICAL / DIRECT ASSET IMPACT
  const hasDirectAssetImpact = matchedAssets.length > 0;
  const hasDirectCompetitorMove = matchedCompetitors.length > 0 && (
    matchedDivisions.includes('INFRA_LOGISTICS') ||
    matchedDivisions.includes('ENERGY') ||
    matchedDivisions.includes('CHEMICALS') ||
    matchedDivisions.includes('FOOD_RETAIL')
  );
  const isSojitzEntity = extraction.entities.some(e => e.name.toLowerCase().includes('sojitz'));

  if (hasDirectAssetImpact || isSojitzEntity) {
    relevance_score = 10;
    rubric_tier = 'TIER_1_DIRECT_ASSET';
    urgency = 'HIGH';
    strategic_status = 'OPPORTUNITY';
    signal_strength = 'HIGH';
    signal_type = 'DIRECT_ASSET_IMPACT';
    relevance_rationale = `Direct operational and commercial impact on Sojitz Vietnam assets: ${matchedAssets.join(', ') || 'Sojitz Corporation'}.`;
  } else if (hasDirectCompetitorMove) {
    relevance_score = 9;
    rubric_tier = 'TIER_1_COMPETITOR';
    urgency = 'HIGH';
    strategic_status = 'WATCH';
    signal_strength = 'HIGH';
    signal_type = 'COMPETITOR_MOVEMENT';
    relevance_rationale = `Major strategic move by Japanese Sogo Shosha competitor (${matchedCompetitors.join(', ')}) in Sojitz core division line (${matchedDivisions.join(', ')}).`;
  } 
  // Check 2: TIER 2 (7 - 8) - HIGH IMPORTANCE
  // Major regulatory decree or high-value M&A/Capex in Priority 1 sectors
  else if (
    (extraction.primary_event_type === 'POLICY_CHANGE' || extraction.primary_event_type === 'REGULATION') &&
    (primarySector?.priority === 'PRIORITY_1' || matchedDivisions.length > 0)
  ) {
    relevance_score = 8;
    rubric_tier = 'TIER_2_POLICY_DECREE';
    urgency = 'HIGH';
    strategic_status = 'OPPORTUNITY';
    signal_strength = 'HIGH';
    signal_type = 'REGULATORY_CHANGE';
    relevance_rationale = `Major regulatory decree / policy change impacting Sojitz Priority 1 sector (${primarySector?.name || matchedDivisions.join(', ')}). Enables commercial framework expansion.`;
  } else if (
    (extraction.primary_event_type === 'INVESTMENT' || 
     extraction.primary_event_type === 'NEW_FACTORY' || 
     extraction.primary_event_type === 'EXPANSION' || 
     extraction.primary_event_type === 'PARTNERSHIP' || 
     extraction.primary_event_type === 'LOGISTICS_PROJECT' ||
     extraction.primary_event_type === 'ENERGY_PROJECT') &&
    (primarySector?.priority === 'PRIORITY_1' || matchedDivisions.includes('INFRA_LOGISTICS') || matchedDivisions.includes('ENERGY'))
  ) {
    relevance_score = 8;
    rubric_tier = 'TIER_2_PRIORITY_1_TRANSACTION';
    urgency = 'HIGH';
    strategic_status = 'OPPORTUNITY';
    signal_strength = 'HIGH';
    signal_type = 'SECTOR_EXPANSION';
    relevance_rationale = `Strategic commercial expansion / partnership in Sojitz Priority 1 sector (${primarySector?.name || 'Infrastructure & Energy'}) with direct potential for industrial park leasing or supply chain integration.`;
  } 
  // Check 3: TIER 3 (4 - 6) - MODERATE / MONITOR
  // Financing, corporate debt restructuring, or Priority 2 sectors (Real Estate, General Finance, Automotive)
  else if (
    extraction.primary_event_type === 'FINANCING' ||
    extraction.primary_event_type === 'CORPORATE_RESTRUCTURING' ||
    primarySector?.priority === 'PRIORITY_2' ||
    primarySector?.slug === 'real-estate'
  ) {
    relevance_score = 5;
    rubric_tier = 'TIER_3_MONITOR_FINANCE';
    urgency = 'MEDIUM';
    strategic_status = 'WATCH';
    signal_strength = 'MEDIUM';
    signal_type = 'FINANCIAL_RESTRUCTURING';
    relevance_rationale = `Corporate financing / restructuring in secondary monitoring sector (${primarySector?.name || 'Financial Services'}). Relevant for monitoring market liquidity, debt exposure, and real estate developer solvency.`;
  } else if (
    extraction.primary_event_type === 'OTHER' && 
    (rawArticle.title.toLowerCase().includes('nhập khẩu') || rawArticle.title.toLowerCase().includes('xuất khẩu') || rawArticle.title.toLowerCase().includes('thương mại'))
  ) {
    relevance_score = 5;
    rubric_tier = 'TIER_3_MACRO_INDICATOR';
    urgency = 'MEDIUM';
    strategic_status = 'WATCH';
    signal_strength = 'MEDIUM';
    signal_type = 'MACROECONOMIC_INDICATOR';
    relevance_rationale = `Macroeconomic trade volume indicator tracking bilateral import/export dynamics affecting supply chains and freight flows.`;
  }
  // Check 4: TIER 4 (1 - 3) - LOW / INFORMATIONAL
  // Overseas luxury properties, isolated tenders, or general non-core items
  else if (extraction.primary_event_type === 'LAND_TRANSACTION' && extraction.geographies.includes('Singapore')) {
    relevance_score = 2;
    rubric_tier = 'TIER_4_LOW_OVERSEAS';
    urgency = 'LOW';
    strategic_status = 'WATCH';
    signal_strength = 'LOW';
    signal_type = 'OVERSEAS_ASSET_AUCTION';
    relevance_rationale = `Overseas luxury residential property transaction with no direct operational or strategic angle for Sojitz Vietnam business lines.`;
  } else {
    relevance_score = 3;
    rubric_tier = 'TIER_4_INFORMATIONAL';
    urgency = 'LOW';
    strategic_status = 'WATCH';
    signal_strength = 'LOW';
    signal_type = 'GENERAL_BUSINESS_NEWS';
    relevance_rationale = `General commercial news with limited direct commercial implications for Sojitz Vietnam divisions.`;
  }

  // 4. SOJITZ RELEVANCE CHECK: 10 Positive Criteria & Negative Disqualifiers
  const matchedCriteria: SojitzRelevanceCriterion[] = [];
  const disqualificationReasons: string[] = [];

  const textCorpus = `${rawArticle.title}\n${rawArticle.cleanedContent || ''}\n${extraction.source_url}`.toLowerCase();

  // 1. A development directly affecting an existing Sojitz business or investment
  if (hasDirectAssetImpact || isSojitzEntity) {
    matchedCriteria.push('DIRECT_SOJITZ_BUSINESS');
  }

  // 2. A potential customer, supplier, partner, investor, or counterparty
  const hasCounterparty = extraction.entities.some(e => 
    ['CUSTOMER', 'SUPPLIER', 'PARTNER', 'INVESTOR', 'BUYER', 'TARGET', 'DEVELOPER'].includes(e.role_in_event)
  ) || matchedPriorities.some(p => p.startsWith('Partner Link:'));
  if (hasCounterparty) {
    matchedCriteria.push('POTENTIAL_COUNTERPARTY');
  }

  // 3. A new investment, factory, project, expansion, JV, M&A transaction, market entry, or financing event
  const isCommercialEvent = [
    'INVESTMENT', 'CAPEX', 'NEW_FACTORY', 'EXPANSION', 'JV', 'M&A',
    'PARTNERSHIP', 'MARKET_ENTRY', 'NEW_PROJECT', 'NEW_STORE',
    'LOGISTICS_PROJECT', 'ENERGY_PROJECT', 'HOTEL_DEVELOPMENT',
    'LAND_TRANSACTION', 'FINANCING', 'IPO'
  ].includes(extraction.primary_event_type);
  if (isCommercialEvent) {
    matchedCriteria.push('COMMERCIAL_TRANSACTION');
  }

  // 4. Regulatory or policy changes that may affect Sojitz businesses
  if (['POLICY_CHANGE', 'REGULATION'].includes(extraction.primary_event_type)) {
    matchedCriteria.push('REGULATORY_POLICY_CHANGE');
  }

  // 5. Competitor activity
  if (matchedCompetitors.length > 0 || extraction.primary_event_type === 'COMPETITOR_MOVE') {
    matchedCriteria.push('COMPETITOR_ACTIVITY');
  }

  // 6. Activity involving Japanese companies or Japanese trading houses in Vietnam
  const hasJapaneseBusinessInVn = matchedCompanies.some(c => 
    c.origin === 'JAPAN' || c.origin === 'JAPANESE_TRADING_HOUSE'
  ) || extraction.entities.some(e => 
    e.name.toLowerCase().includes('japan') || 
    e.name.toLowerCase().includes('nhật bản') ||
    (e.aliases_found || []).some(a => a.toLowerCase().includes('japan'))
  );
  if (hasJapaneseBusinessInVn) {
    matchedCriteria.push('JAPANESE_BUSINESS_IN_VN');
  }

  // 7. Sector developments relevant to Sojitz strategic priorities
  if (matchedPriorities.length > 0 || primarySector?.priority === 'PRIORITY_1') {
    matchedCriteria.push('SECTOR_STRATEGIC_PRIORITY');
  }

  // 8. Emerging customer needs that may create business demand
  if (
    textCorpus.includes('nhu cầu') || textCorpus.includes('tiêu thụ') ||
    textCorpus.includes('đơn hàng') || textCorpus.includes('chuỗi cung ứng') ||
    textCorpus.includes('procurement') || textCorpus.includes('customer demand')
  ) {
    matchedCriteria.push('EMERGING_CUSTOMER_DEMAND');
  }

  // 9. New technologies, infrastructure, or market structures supporting future BD
  if (
    extraction.primary_event_type === 'LOGISTICS_PROJECT' || 
    extraction.primary_event_type === 'ENERGY_PROJECT' ||
    textCorpus.includes('hạ tầng') || textCorpus.includes('dppa') ||
    textCorpus.includes('quy hoạch điện') || textCorpus.includes('bán dẫn') ||
    textCorpus.includes('semiconductor') || textCorpus.includes('grid infrastructure')
  ) {
    matchedCriteria.push('TECH_INFRA_STRUCTURE');
  }

  // 10. Significant risks or market disruptions
  if (
    extraction.primary_event_type === 'CORPORATE_RESTRUCTURING' ||
    extraction.primary_event_type === 'DIVESTMENT' ||
    textCorpus.includes('rủi ro') || textCorpus.includes('vỡ nợ') ||
    textCorpus.includes('thanh tra') || textCorpus.includes('áp thuế') ||
    textCorpus.includes('tariff') || textCorpus.includes('disruption')
  ) {
    matchedCriteria.push('SIGNIFICANT_RISK');
  }

  // NEGATIVE DISQUALIFICATION CHECKS:
  // An article must NOT be selected solely because:
  // - it mentions Vietnam
  // - it mentions Japan
  // - it contains a sector keyword
  // - it discusses the general economy
  // - it mentions a company on the watchlist
  // - it is published by a high-tier source
  // There must be a reasonable business or strategic connection.
  const hasConcreteEvent = 
    isCommercialEvent || 
    ['POLICY_CHANGE', 'REGULATION', 'CORPORATE_RESTRUCTURING', 'DIVESTMENT'].includes(extraction.primary_event_type) || 
    extraction.secondary_event_types.some(t => ['FINANCING', 'INVESTMENT', 'M&A', 'JV'].includes(t)) ||
    hasDirectAssetImpact || 
    hasDirectCompetitorMove;

  // Rule A: General economic discussion only
  const isGeneralEconomicOnly = 
    extraction.primary_event_type === 'OTHER' &&
    !hasConcreteEvent &&
    (textCorpus.includes('gdp') || textCorpus.includes('lạm phát') || textCorpus.includes('tăng trưởng kinh tế') || textCorpus.includes('kinh tế vĩ mô') || textCorpus.includes('macroeconomic')) &&
    matchedPriorities.length === 0 && matchedDivisions.length === 0;

  if (isGeneralEconomicOnly) {
    disqualificationReasons.push('Disqualified: Article discusses general economy solely without concrete corporate action or strategic link to Sojitz.');
  }

  // Rule B: Passive watchlist company mention only (e.g. daily stock market index recap)
  const isPassiveWatchlistMentionOnly = 
    extraction.primary_event_type === 'OTHER' &&
    !hasConcreteEvent &&
    matchedCompanies.length > 0 &&
    (textCorpus.includes('vn-index') || textCorpus.includes('chứng khoán') || textCorpus.includes('phiên giao dịch') || textCorpus.includes('bảng giá') || textCorpus.includes('hose') || textCorpus.includes('hnx'));

  if (isPassiveWatchlistMentionOnly) {
    disqualificationReasons.push('Disqualified: Passive mention of watchlist company in financial market recap without corporate transaction.');
  }

  // Rule C: Generic country mention only (Vietnam / Japan) with no business connection
  const isGenericCountryMentionOnly = 
    extraction.primary_event_type === 'OTHER' &&
    !hasConcreteEvent &&
    matchedDivisions.length === 0 &&
    matchedCompanies.length === 0 &&
    (textCorpus.includes('việt nam') || textCorpus.includes('nhật bản') || textCorpus.includes('vietnam') || textCorpus.includes('japan'));

  if (isGenericCountryMentionOnly) {
    disqualificationReasons.push('Disqualified: Mentions Vietnam/Japan solely without business or strategic relevance.');
  }

  const hasReasonableBusinessConnection = 
    matchedCriteria.length > 0 && 
    disqualificationReasons.length === 0 &&
    (hasConcreteEvent || matchedPriorities.length > 0 || (matchedDivisions.length > 0 && relevance_score >= 4));

  if (!hasReasonableBusinessConnection) {
    relevance_score = Math.min(relevance_score, 3);
    rubric_tier = 'DISQUALIFIED_SUPERFICIAL';
    urgency = 'LOW';
    strategic_status = 'WATCH';
    signal_strength = 'LOW';
  }

  // 5. Research Triage Outcomes:
  // DROP: The article has no meaningful relevance to Sojitz.
  // WATCH: The article may have strategic relevance but does not currently indicate a direct business opportunity.
  // PICK UP: The article contains a meaningful signal that should enter the intelligence pipeline.
  // RESEARCH: The article appears potentially important but requires additional verification or context before a conclusion can be made.
  let triage_outcome: TriageOutcome = 'WATCH';
  let triage_rationale = '';

  const hasUncertaintiesOrUnverifiedClaims = Boolean(
    (extraction.uncertainties && extraction.uncertainties.length > 0) ||
    extraction.event_status === 'PROPOSED' ||
    extraction.event_status === 'UNKNOWN' ||
    (extraction.verified_facts && extraction.verified_facts.length === 0) ||
    (extraction.event_detection_confidence != null && extraction.event_detection_confidence < 0.75)
  );

  if (!hasReasonableBusinessConnection || relevance_score <= 3) {
    triage_outcome = 'DROP';
    triage_rationale = disqualificationReasons[0] || 'The article has no meaningful relevance to Sojitz.';
  } else if (relevance_score >= 5 && hasUncertaintiesOrUnverifiedClaims) {
    triage_outcome = 'RESEARCH';
    triage_rationale = 'The article appears potentially important but requires additional verification or context before a conclusion can be made.';
  } else if (relevance_score >= 7) {
    triage_outcome = 'PICK_UP';
    triage_rationale = 'The article contains a meaningful signal that should enter the intelligence pipeline.';
  } else {
    triage_outcome = 'WATCH';
    triage_rationale = 'The article may have strategic relevance but does not currently indicate a direct business opportunity.';
  }

  const signal_detected = triage_outcome !== 'DROP';

  // 6. Business Impact Classification
  let business_impact: BusinessImpactType = 'MARKET_INTELLIGENCE';
  if (matchedCompetitors.length > 0) {
    business_impact = 'COMPETITOR_MOVEMENT';
  } else if (extraction.primary_event_type === 'M&A' || extraction.primary_event_type === 'FINANCING') {
    business_impact = 'MA_INVESTMENT';
  } else if (extraction.primary_event_type === 'PARTNERSHIP' || extraction.primary_event_type === 'JV') {
    business_impact = 'PARTNERSHIP';
  } else if (relevance_score >= 8) {
    business_impact = 'OPPORTUNITY';
  } else {
    business_impact = 'MARKET_INTELLIGENCE';
  }

  const is_high_priority = relevance_score >= 8;

  return {
    id: `rel-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    raw_article_id: rawArticleId,
    extraction_id: extractionId,
    signal_detected,
    signal_type,
    signal_strength,
    matched_divisions: matchedDivisions,
    matched_assets: matchedAssets,
    matched_competitors: matchedCompetitors,
    matched_priorities: matchedPriorities,
    relevance_score,
    relevance_rationale,
    triage_outcome,
    triage_rationale,
    business_impact,
    urgency,
    strategic_status,
    primary_sector_id: primarySector?.sector_id || null,
    primary_sector_name: primarySector?.name || 'Cross-Sector',
    secondary_sector_ids: secondarySectorIds,
    matched_companies: matchedCompanies,
    is_high_priority,
    scoring_metadata: {
      asset_match_score: matchedAssets.length > 0 ? 10 : 0,
      division_match_score: matchedDivisions.length * 2,
      competitor_impact_score: matchedCompetitors.length > 0 ? 9 : 0,
      sector_priority: primarySector?.priority || 'MONITORING',
      rubric_tier,
      matched_criteria: matchedCriteria,
      disqualification_reasons: disqualificationReasons,
      has_reasonable_business_connection: hasReasonableBusinessConnection,
    },
  };
}
