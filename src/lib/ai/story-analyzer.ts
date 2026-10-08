import { getActiveAiProvider } from './provider-factory';
import { RawClusterArticle, AnalyzedStoryOutput } from './providers/base';
import { getSectors, getCompanies } from '@/lib/data/intelligence-store';
import { IntelligenceStory } from '@/types/intelligence';

export async function processArticleCluster(params: {
  clusterTitle: string;
  articles: RawClusterArticle[];
}): Promise<IntelligenceStory> {
  const [sectors, companies] = await Promise.all([
    getSectors(),
    getCompanies(),
  ]);

  const provider = getActiveAiProvider();
  
  const analyzed: AnalyzedStoryOutput = await provider.analyzeStory({
    clusterTitle: params.clusterTitle,
    articles: params.articles,
    taxonomySectors: sectors.map(s => s.slug),
    watchlistCompanies: companies.map(c => c.name),
  });

  const slug = analyzed.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const storyId = `story-${Date.now()}`;
  const now = new Date().toISOString();
  const todayDate = now.split('T')[0];

  const story: IntelligenceStory = {
    id: storyId,
    title: analyzed.title,
    slug,
    publicationDate: todayDate,
    storyDate: todayDate,
    country: 'Vietnam',
    category: analyzed.category,
    primarySectorSlug: analyzed.primarySectorSlug,
    primarySectorName: analyzed.primarySectorName,
    secondarySectors: analyzed.secondarySectorSlugs,
    companiesMentioned: analyzed.companiesMentioned.map((c, i) => ({
      id: `c-${storyId}-${i}`,
      name: c.name,
      slug: c.slug,
      ticker: c.ticker,
      origin: c.origin,
      role: c.role || 'SUBJECT',
    })),
    summary: analyzed.summary,
    whyItMattersToSojitz: analyzed.whyItMattersToSojitz,
    suggestedBdAction: analyzed.suggestedBdAction,
    businessImpact: analyzed.businessImpact,
    relevanceScore: analyzed.relevanceScore,
    verificationStatus: analyzed.verificationStatus,
    confidenceScore: analyzed.confidenceScore,
    verificationRationale: analyzed.verificationRationale,
    extractedFacts: analyzed.extractedFacts,
    detectedConflicts: analyzed.detectedConflicts,
    sources: params.articles.map((a, i) => ({
      id: `src-${storyId}-${i}`,
      sourceName: a.sourceName,
      sourceTier: a.sourceTier,
      articleTitle: params.clusterTitle,
      articleUrl: a.url,
      publishedAt: a.publishedAt,
      isPrimaryClaimSource: i === 0,
    })),
    originalUrls: params.articles.map(a => a.url),
    isHighPriority: analyzed.relevanceScore >= 8,
    aiModelUsed: provider.name + ' (' + provider.model + ')',
    dateCollected: todayDate,
    aiAnalysisTimestamp: now,
    collectionTimestamp: now,
  };

  return story;
}

export async function analyzeCluster(params: {
  clusterTitle: string;
  articles: RawClusterArticle[];
  taxonomySectors?: string[];
  watchlistCompanies?: string[];
}): Promise<AnalyzedStoryOutput> {
  const [sectors, companies] = await Promise.all([
    getSectors(),
    getCompanies(),
  ]);

  const provider = getActiveAiProvider();
  return provider.analyzeStory({
    clusterTitle: params.clusterTitle,
    articles: params.articles,
    taxonomySectors: params.taxonomySectors || sectors.map(s => s.slug),
    watchlistCompanies: params.watchlistCompanies || companies.map(c => c.name),
  });
}

export const storyAnalyzer = {
  processArticleCluster,
  analyzeCluster,
};

