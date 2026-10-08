import { AIProvider, AnalyzeClusterInput, AnalyzedStoryOutput, SynthesizeWeeklyInput } from './base';
import { WeeklyReport } from '@/types/report';

export class SimulatorAIProvider implements AIProvider {
  name = 'Deterministic Simulator';
  model = 'heuristic-analyst-v1';

  async analyzeStory(input: AnalyzeClusterInput): Promise<AnalyzedStoryOutput> {
    const isTier1Present = input.articles.some(a => a.sourceTier === 'TIER_1');
    const tier2Count = input.articles.filter(a => a.sourceTier === 'TIER_2').length;
    
    // Determine verification status
    let verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SINGLE_SOURCE' | 'UNVERIFIED' = 'PARTIALLY_VERIFIED';
    let confidenceScore = 78;

    if (isTier1Present || tier2Count >= 2) {
      verificationStatus = 'VERIFIED';
      confidenceScore = isTier1Present ? 95 : 88;
    } else if (input.articles.length === 1 && input.articles[0].sourceTier === 'TIER_3') {
      verificationStatus = 'SINGLE_SOURCE';
      confidenceScore = 52;
    }

    // Map primary sector
    const primarySectorSlug = input.taxonomySectors[0] || 'infrastructure';
    const primarySectorName = primarySectorSlug
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    // Match mentioned companies
    const companies = input.watchlistCompanies.slice(0, 2).map(name => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      origin: name.toLowerCase().includes('corporation') || name.toLowerCase().includes('shosha') 
        ? ('JAPANESE_TRADING_HOUSE' as const) 
        : ('VIETNAM' as const),
      role: 'SUBJECT',
    }));

    return {
      title: input.clusterTitle,
      summary: `Cross-source synthesis of ${input.articles.length} verified reports covering developments in ${primarySectorName}. Primary claim corroborated by ${input.articles[0]?.sourceName || 'monitoring nodes'}.`,
      category: 'Market Intelligence',
      primarySectorSlug,
      primarySectorName,
      secondarySectorSlugs: input.taxonomySectors.slice(1, 2),
      companiesMentioned: companies,
      whyItMattersToSojitz: `Direct relevance to Sojitz Vietnam's ${primarySectorName} commercial priorities. Presents potential supply chain integration or strategic co-investment alignment.`,
      suggestedBdAction: `Schedule bilateral exploratory consultation with key stakeholders; request technical briefs for potential joint venture alignment.`,
      businessImpact: 'OPPORTUNITY',
      relevanceScore: 8,
      verificationStatus,
      confidenceScore,
      verificationRationale: `Corroborated across ${input.articles.length} source publications with consensus across primary operational parameters.`,
      extractedFacts: {
        location: 'Vietnam',
        announcedTimeline: '2026-2027',
      },
      detectedConflicts: [],
    };
  }

  async synthesizeWeeklyReport(input: SynthesizeWeeklyInput): Promise<WeeklyReport> {
    const highRelevanceStories = input.stories.filter(s => s.relevanceScore >= 8);
    const now = new Date().toISOString();
    
    return {
      id: `rep-${input.year}-${input.weekNumber}`,
      year: input.year,
      weekNumber: input.weekNumber,
      startDate: input.startDate,
      endDate: input.endDate,
      title: `SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week ${input.weekNumber}, ${input.year}`,
      slug: `week-${input.year}-${input.weekNumber}`,
      executiveSummary: `During Week ${input.weekNumber} (${input.startDate} to ${input.endDate}), Vietnam's market demonstrated robust strategic momentum across infrastructure, energy transition, and domestic conglomerate restructuring. Sojitz Vietnam monitored ${input.stories.length} verified developments, identifying key commercial openings in industrial park expansion and green power direct purchase agreements.`,
      topDevelopments: highRelevanceStories.slice(0, 3).map(s => ({
        title: s.title,
        summary: s.summary,
        significance: `High strategic significance for ${s.primarySectorName} operations.`,
        storyId: s.id,
      })),
      topBusinessOpportunities: [
        {
          headline: 'Direct Power Purchase Agreement (DPPA) Rooftop Expansion',
          targetCompanyOrProject: 'Long Duc Industrial Park Rooftop Solar',
          sector: 'Renewable Energy',
          strategicRationale: 'Industrial park tenants seeking off-site renewable power offtake agreements under Decree 80/2024/ND-CP framework.',
          actionWindow: 'Q3-Q4 2026',
        },
        {
          headline: 'Cold-Chain Logistics Partnership in Southern Key Economic Zone',
          targetCompanyOrProject: 'Dong Nai Logistics Hub',
          sector: 'Logistics',
          strategicRationale: 'Expanding temperature-controlled distribution networks connecting Long Duc IP to Cai Mep port.',
          actionWindow: 'Immediate (Next 60 Days)',
        },
      ],
      macroPolicy: 'Macroeconomic indicators reflect steady GDP growth (6.8% YoY) with stable FX reserves. The State Bank of Vietnam maintained policy rates, prioritizing credit flow into green manufacturing and export-oriented processing.',
      maInvestment: 'Cross-border M&A transactions accelerated in logistics and consumer manufacturing, with Japanese, Singaporean, and domestic conglomerates deploying capital into joint ventures.',
      japaneseCompanies: 'Japanese manufacturers continued diversifying production into Northern and Southern industrial corridors, emphasizing carbon-neutral factory operations and automated assembly.',
      japaneseTradingHouses: 'Peer Sogo Shosha (Mitsubishi, Mitsui, Sumitomo, Marubeni, Itochu, Toyota Tsusho) intensified engagement in LNG receiving infrastructure, offshore wind feasibility studies, and retail logistics hubs.',
      vietnamCorporateWatch: 'Domestic conglomerates (Vingroup, Masan, THACO, Hoa Phat, Becamex) expanded manufacturing localization and sought Japanese technology partners for green transition.',
      sectorIntelligence: [
        {
          sectorName: 'Energy & Renewables',
          keyTrend: 'DPPA secondary market guidelines issued; renewable developers accelerating grid-tied capacity.',
          implication: 'Accelerates rooftop solar offtake contracts across tenant industrial facilities.',
        },
        {
          sectorName: 'Industrial Parks',
          keyTrend: 'Occupancy rates in Tier-1 provinces reached 86%; eco-industrial park certifications driving tenant premiums.',
          implication: 'Supports Long Duc Industrial Park positioning and tariff adjustments.',
        },
        {
          sectorName: 'Chemicals & Plastics',
          keyTrend: 'Polymer demand rebound in packaging and electronics compounding.',
          implication: 'Strengthens import distribution volumes for Sojitz Plastics Vietnam.',
        },
        {
          sectorName: 'Food & Retail',
          keyTrend: 'Modern trade penetration climbing, driven by convenience store expansion in suburban hubs.',
          implication: 'Enhances Huong Thuy wholesale distribution volume and retail partnership margins.',
        },
      ],
      risksAnalysis: 'Grid transmission bottlenecks in central provinces, seasonal container freight rate volatility, and regulatory processing timelines for foreign land lease approvals remain key headwinds.',
      whatSojitzShouldWatch: 'Active surveillance maintained on Long Duc Industrial Park Phase 2 land clearance, Phu My 3 BOT handover operational procedures, and Huong Thuy cold-chain fleet upgrades.',
      suggestedBdActions: [
        {
          responsibleDivision: 'Energy Solutions Division',
          action: 'Initiate DPPA offtake discussions with top-tier tenant prospects across industrial parks.',
          targetPartnerOrSector: 'EVN / MOIT / Multinational Tenants',
          priority: 'HIGH',
          expectedOutcome: 'Secure 15-20MW rooftop solar PPA pipeline',
        },
        {
          responsibleDivision: 'Industrial Infrastructure & Logistics',
          action: 'Finalize master plan for eco-industrial park upgrades at Long Duc.',
          targetPartnerOrSector: 'Dong Nai People Committee',
          priority: 'HIGH',
          expectedOutcome: 'Obtain provincial approval for green infrastructure expansion',
        },
      ],
      curatedStories: input.stories,
      curatedStoryCount: input.stories.length,
      isPublished: true,
      publishedAt: now,
      generatedAt: now,
    };
  }
}
