import { IntelligenceStory } from '@/types/intelligence';
import { SOJITZ_VIETNAM_DIVISIONS } from '../knowledge/sojitz-context';

export function buildWeeklySynthesisSystemPrompt(): string {
  return `You are the Lead Strategic Advisor compiling the official WEEKLY EXECUTIVE INTELLIGENCE BRIEFING for SOJITZ VIETNAM Country Management and Board.

Your report must synthesize all verified intelligence collected during the week into an executive-grade, 12-section confidential briefing.

THE 12 MANDATORY BRIEFING SECTIONS:
1. Executive Summary: High-level overview of the week's key themes and macro direction (200-300 words).
2. Top Developments: 3-5 most critical market events of the week with quantitative metrics.
3. Top Opportunities: Actionable commercial openings, concessions, and tenders for Sojitz.
4. Macroeconomic & Policy Analysis: GDP, inflation, SBV monetary circulars, FX, and FDI disbursement trends.
5. M&A & Strategic Investment Watch: Deals announced or closed, valuation multiples, and foreign acquirers.
6. Japanese Companies in Vietnam: New factory setups, capital expansions, and bilateral delegations.
7. Japanese Trading Houses Surveillance: Concrete capital allocation and joint venture moves across the 7 Sogo Shosha (Mitsubishi, Mitsui, Sumitomo, Itochu, Marubeni, Toyota Tsusho, Sojitz).
8. Vietnam Corporate Watch: Domestic champions (Vingroup, Masan, Stavian, THACO, Hoa Phat, FPT, Sovico, Gelex, TTC, Becamex, Vinamilk, Sabeco).
9. Sector Intelligence: Key shifts across Priority 1 core trading sectors and Priority 2 emergence sectors.
10. Risks & Headwinds: Regulatory delays, power bottlenecks, FX fluctuations, and counterparty risks.
11. Sojitz Vietnam Watch List: Ongoing developments directly touching Sojitz assets (Long Duc IP, Phu My 3, Huong Thuy, Vinabeef).
12. Suggested Actions for Business Development: Division-by-division concrete executive action items.

TONE & STYLE:
- Information-dense, executive tone.
- Zero fluff, zero generic platitudes.
- Reference verified primary numbers, partners, and decree numbers.

OUTPUT FORMAT:
Return valid JSON strictly adhering to the WeeklyReport schema.`;
}

export function buildWeeklySynthesisUserPrompt(params: {
  year: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  stories: IntelligenceStory[];
}): string {
  const storiesSummary = params.stories.map((s, idx) => `
[STORY ${idx + 1}]
Title: ${s.title}
Date: ${s.storyDate}
Sector: ${s.primarySectorName}
Companies: ${s.companiesMentioned.map(c => c.name).join(', ') || 'None'}
Impact: ${s.businessImpact} | Relevance: ${s.relevanceScore}/10 | Verification: ${s.verificationStatus} (${s.confidenceScore}%)
Summary: ${s.summary}
Why It Matters to Sojitz: ${s.whyItMattersToSojitz}
BD Action: ${s.suggestedBdAction || 'N/A'}
Facts: ${JSON.stringify(s.extractedFacts)}
`).join('\n---\n');

  return `Compile the Weekly Executive Intelligence Briefing for Year ${params.year}, Week ${params.weekNumber} (${params.startDate} to ${params.endDate}).

TOTAL STORIES AVAILABLE: ${params.stories.length}
STORIES DATASET:
${storiesSummary}

Generate JSON with the exact following schema:
{
  "title": "SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week ${params.weekNumber}, ${params.year}",
  "slug": "week-${params.year}-${params.weekNumber}",
  "year": ${params.year},
  "weekNumber": ${params.weekNumber},
  "startDate": "${params.startDate}",
  "endDate": "${params.endDate}",
  "executiveSummary": "Comprehensive 3-paragraph executive overview.",
  "topDevelopments": [
    { "title": "...", "description": "...", "impact": "HIGH | CRITICAL", "sector": "..." }
  ],
  "topOpportunities": [
    { "title": "...", "description": "...", "targetDivision": "...", "estimatedValue": "..." }
  ],
  "macroPolicy": "Narrative covering GDP, SBV policy, interest rates, and planning decrees.",
  "maInvestment": "Narrative and list of tracked M&A and FDI transactions.",
  "japaneseCompanies": "Analysis of Japanese FDI projects and business delegations.",
  "tradingHouses": "Comparative intelligence on peer Japanese Sogo Shosha moves.",
  "vietnamCorporateWatch": "Surveillance on domestic conglomerates and private champions.",
  "sectorIntelligence": {
    "energy": "...",
    "industrialParks": "...",
    "chemicalsPlastics": "...",
    "foodRetail": "...",
    "logistics": "..."
  },
  "risksAnalysis": "Critical analysis of macroeconomic, supply chain, and policy bottlenecks.",
  "sojitzWatchList": "Actionable monitoring list for active Sojitz Vietnam operational nodes.",
  "suggestedBdActions": [
    { "division": "Energy Solutions", "action": "...", "counterpart": "...", "priority": "P1" },
    { "division": "Industrial Parks", "action": "...", "counterpart": "...", "priority": "P1" },
    { "division": "Chemicals & Plastics", "action": "...", "counterpart": "...", "priority": "P1" },
    { "division": "Foods & Retail", "action": "...", "counterpart": "...", "priority": "P2" }
  ]
}`;
}
