import { SOJITZ_VIETNAM_DIVISIONS, SOJITZ_RELEVANCE_RUBRIC } from '../knowledge/sojitz-context';

export function buildStoryAnalysisSystemPrompt(): string {
  const divisionsSummary = SOJITZ_VIETNAM_DIVISIONS.map(d => 
    `- ${d.name} (${d.code}): Focus on ${d.coreFocus}. Existing assets: ${d.existingAssetsAndPartnerships.join(', ')}. Target partners: ${d.targetPartners.join(', ')}.`
  ).join('\n');

  return `You are the Chief Intelligence Analyst for SOJITZ VIETNAM, a premier Japanese general trading company (Sogo Shosha) operating in Vietnam.

Your objective is to transform raw, multi-source business news clusters into executive-grade market intelligence dossiers for Sojitz Vietnam's Country Management, Business Development, Strategy, and Investment committees.

SOJITZ VIETNAM BUSINESS DIVISIONS:
${divisionsSummary}

${SOJITZ_RELEVANCE_RUBRIC}

STRICT ANTI-HALLUCINATION & INTEGRITY RULES:
1. NEVER invent deal sizes, quotes, partner names, dates, or URLs. Every numerical figure and factual claim must originate directly from the source texts provided.
2. If sources disagree on numerical values, timelines, or entities, you MUST explicitly flag them in "detectedConflicts".
3. Evaluate verification status objectively:
   - VERIFIED: Corroborated by at least 1 Tier 1 source (MPI, SBV, HOSE, Nikkei, Reuters, Bloomberg) or multiple consistent Tier 2 sources.
   - PARTIALLY_VERIFIED: Reported by a single Tier 2 business press source with credible details.
   - SINGLE_SOURCE: Reported by only one regional or local Tier 3 source.
   - CONFLICTING: Sources contradict each other on transaction scale, parties, or timelines.
   - UNVERIFIED: Uncorroborated market rumor or early signal.
4. Calculate Confidence Score (0 to 100 integer scale) based on source tier weights and cross-corroboration.
5. In "whyItMattersToSojitz", directly identify which Sojitz business division is impacted and how it connects to ongoing operations or strategic priorities.
6. In "suggestedBdAction", formulate a crisp, practical, C-suite actionable recommendation. MUST identify:
   - Specific Sojitz action unit (e.g., Energy Solutions Division, Long Duc IP Team, Huong Thuy Distribution, Chemicals Trading).
   - Counterpart entity or government department to engage.
   - Concrete next step (e.g., request NDA, initiate DPPA offtake discussion, propose cold-chain distribution partnership, submit tenant RFP).
7. ALL OUTPUTS IN ENGLISH: Every single field in the JSON (title, summary, whyItMattersToSojitz, suggestedBdAction, verificationRationale, etc.) MUST be written in fluent, professional business English. If source articles are in Vietnamese, translate all facts and analysis into English.

OUTPUT FORMAT:
Respond with ONLY valid JSON strictly matching the specified JSON schema without any conversational prose.`;
}

export function buildStoryAnalysisUserPrompt(params: {
  clusterTitle: string;
  articles: Array<{
    sourceName: string;
    sourceTier: string;
    url: string;
    publishedAt: string;
    content: string;
  }>;
  taxonomySectors: string[];
  watchlistCompanies: string[];
}): string {
  const articlesText = params.articles.map((a, idx) => `
[ARTICLE ${idx + 1}]
Source: ${a.sourceName} (${a.sourceTier})
URL: ${a.url}
Published: ${a.publishedAt}
Content:
${a.content.slice(0, 3000)}
`).join('\n---\n');

  return `Analyze the following news cluster for Sojitz Vietnam:

CLUSTER TITLE: ${params.clusterTitle}
AVAILABLE SECTORS: ${params.taxonomySectors.join(', ')}
WATCHLIST COMPANIES: ${params.watchlistCompanies.join(', ')}

ARTICLES IN CLUSTER:
${articlesText}

Produce JSON with this exact structure:
{
  "title": "Clear, informative executive headline (12-18 words)",
  "summary": "3-4 concise sentences synthesizing core facts, numerical deal metrics, entities, and timelines.",
  "category": "e.g. M&A / Investment | Government Policy and Regulation | Joint Ventures | FDI | Bilateral Trade",
  "primarySectorSlug": "Matching sector slug from available sectors",
  "primarySectorName": "Matching sector name",
  "secondarySectorSlugs": ["optional secondary slugs"],
  "companiesMentioned": [
    { "name": "Company Name", "slug": "company-slug", "origin": "VIETNAM | JAPANESE_TRADING_HOUSE | GLOBAL_OTHER", "role": "ACQUIRER | TARGET | PARTNER | REGULATOR" }
  ],
  "whyItMattersToSojitz": "Strategic analysis explaining commercial implications for Sojitz Vietnam divisions (2-3 sentences).",
  "suggestedBdAction": "Actionable next step identifying Sojitz division, target counterpart, and concrete proposal (1-2 sentences).",
  "businessImpact": "OPPORTUNITY | PARTNERSHIP | MA_INVESTMENT | COMPETITOR_MOVEMENT | RISK | MARKET_INTELLIGENCE",
  "relevanceScore": 1 to 10 integer,
  "verificationStatus": "VERIFIED | PARTIALLY_VERIFIED | SINGLE_SOURCE | CONFLICTING | UNVERIFIED",
  "confidenceScore": 0 to 100 integer,
  "verificationRationale": "1-2 sentences explaining why this status and score were assigned based on source tiers and cross-corroboration.",
  "extractedFacts": {
    "dealValueUsd": "e.g. $150M or null",
    "location": "e.g. Dong Nai Province",
    "regulatoryBody": "e.g. Ministry of Industry and Trade (MOIT)",
    "announcedTimeline": "e.g. Q3 2026 - 2028"
  },
  "detectedConflicts": [
    { "field": "deal_size", "sourceA": { "name": "...", "claim": "..." }, "sourceB": { "name": "...", "claim": "..." }, "discrepancyNote": "..." }
  ]
}`;
}
