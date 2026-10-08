import { IntelligenceStory, DashboardKpis, VerificationStatus, BusinessImpactType, StorySourceLink, StoryFilterParams } from '@/types/intelligence';
import { Sector, WatchlistCompany, NewsSourceConfig } from '@/types/taxonomy';
import { WeeklyReport } from '@/types/report';
import { 
  INITIAL_SECTORS, 
  INITIAL_COMPANIES, 
  INITIAL_SOURCES,
  SAMPLE_INTELLIGENCE_STORIES, 
  SAMPLE_WEEKLY_REPORT, 
  MOCK_KPIS 
} from './mock-intelligence';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { 
  getWeeklyReportsFromPostgres, 
  getWeeklyReportBySlugFromPostgres, 
  saveWeeklyReportToPostgres 
} from '@/lib/database/weekly-report-store';
import { 
  rawArticlesStore, 
  getRawArticles, 
  saveRawArticle, 
  getRawArticleCount, 
  getRawArticlesForDailyPipeline, 
  getRawArticlesForWeeklyPipeline 
} from './raw-articles-store';
export { 
  rawArticlesStore, 
  getRawArticles, 
  saveRawArticle, 
  getRawArticleCount, 
  getRawArticlesForDailyPipeline, 
  getRawArticlesForWeeklyPipeline 
};
import { 
  getIntelligenceStoriesFromPostgres, 
  getStoryByIdFromPostgres, 
  saveStoryToPostgres, 
  deleteStoryFromPostgres 
} from '@/lib/database/story-store';
import { isPostgresConnected, getPostgresPool } from '@/lib/database/postgres';

// In-memory runtime state for dynamic sector and company management without code modifications
let sectorsState: Sector[] = [...INITIAL_SECTORS];
let companiesState: WatchlistCompany[] = [...INITIAL_COMPANIES];
let sourcesState: NewsSourceConfig[] = [...INITIAL_SOURCES];
let storiesState: IntelligenceStory[] = [...SAMPLE_INTELLIGENCE_STORIES];

export async function getSources(): Promise<NewsSourceConfig[]> {
  if (await isPostgresConnected()) {
    try {
      const pool = getPostgresPool();
      const { rows } = await pool.query(`
        SELECT id, name, domain, tier, trust_weight, description, is_active, rss_url, is_official_ir
        FROM sources
        ORDER BY trust_weight DESC, name ASC
      `);
      if (rows && rows.length > 0) {
        return rows.map((row: any) => {
          const initMatch = INITIAL_SOURCES.find(s => s.domain === row.domain || s.name === row.name);
          return {
            id: row.id,
            name: row.name,
            domain: row.domain,
            tier: row.tier,
            trustWeight: Number(row.trust_weight),
            description: row.description,
            articleCount: 0,
            isActive: row.is_active,
            rssUrl: row.rss_url || initMatch?.rssUrl,
            allowedDomains: initMatch?.allowedDomains || [row.domain],
            isOfficialIr: row.is_official_ir ?? (row.tier === 'TIER_1'),
          };
        });
      }
    } catch (e) {
      console.warn('[Intelligence Store] Postgres fetch sources fallback:', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('trust_weight', { ascending: false });
      
      if (!error && data && data.length > 0) {
        return data.map((row: any) => {
          const initMatch = INITIAL_SOURCES.find(s => s.domain === row.domain || s.name === row.name);
          return {
            id: row.id,
            name: row.name,
            domain: row.domain,
            tier: row.tier,
            trustWeight: Number(row.trust_weight),
            description: row.description,
            articleCount: 0,
            isActive: row.is_active,
            rssUrl: row.rss_url || initMatch?.rssUrl,
            allowedDomains: initMatch?.allowedDomains || [row.domain],
            isOfficialIr: row.is_official_ir ?? (row.tier === 'TIER_1'),
          };
        });
      }
    } catch (e) {
      console.warn('[Intelligence Store] Supabase fetch sources fallback:', e);
    }
  }
  return [...sourcesState];
}

export async function addSource(source: Omit<NewsSourceConfig, 'id' | 'articleCount'>): Promise<NewsSourceConfig> {
  const newSource: NewsSourceConfig = {
    id: `src-${Date.now()}`,
    ...source,
    articleCount: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sources').insert({
        name: newSource.name,
        domain: newSource.domain,
        tier: newSource.tier,
        trust_weight: newSource.trustWeight,
        description: newSource.description,
        is_active: newSource.isActive,
        rss_url: newSource.rssUrl,
      });
    } catch (e) {
      console.warn('[Intelligence Store] Supabase add source error:', e);
    }
  }

  sourcesState = [newSource, ...sourcesState];
  return newSource;
}

export async function deleteSource(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sources').delete().eq('id', id);
    } catch (e) {
      console.warn('[Intelligence Store] Supabase delete source error:', e);
    }
  }
  sourcesState = sourcesState.filter(s => s.id !== id);
  return true;
}

export async function getSectors(): Promise<Sector[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          priority: row.priority,
          description: row.description,
          isActive: row.is_active,
          displayOrder: row.display_order,
          storyCount: storiesState.filter(s => s.primarySectorSlug === row.slug).length,
        }));
      }
    } catch (e) {
      console.warn('[Intelligence Store] Supabase fetch sectors fallback:', e);
    }
  }
  return [...sectorsState];
}

export async function getCompanies(): Promise<WatchlistCompany[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          ticker: row.ticker,
          slug: row.slug,
          origin: row.origin,
          aliases: row.aliases || [],
          description: row.description,
          websiteUrl: row.website_url,
          isActive: row.is_active,
          storyCount: storiesState.filter(s => s.companiesMentioned.some(c => c.slug === row.slug)).length,
        }));
      }
    } catch (e) {
      console.warn('[Intelligence Store] Supabase fetch companies fallback:', e);
    }
  }
  return [...companiesState];
}

export async function addSector(sector: Omit<Sector, 'id' | 'storyCount'>): Promise<Sector> {
  const newSector: Sector = {
    id: `sec-${Date.now()}`,
    ...sector,
    storyCount: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sectors').insert({
        name: newSector.name,
        slug: newSector.slug,
        priority: newSector.priority,
        description: newSector.description,
        is_active: newSector.isActive,
        display_order: newSector.displayOrder,
      });
    } catch (e) {
      console.warn('[Intelligence Store] Supabase add sector error:', e);
    }
  }

  sectorsState = [newSector, ...sectorsState];
  return newSector;
}

export async function deleteSector(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('sectors').delete().eq('id', id);
    } catch (e) {
      console.warn('[Intelligence Store] Supabase delete sector error:', e);
    }
  }
  sectorsState = sectorsState.filter(s => s.id !== id);
  return true;
}

export async function addCompany(company: Omit<WatchlistCompany, 'id' | 'storyCount'>): Promise<WatchlistCompany> {
  const newCompany: WatchlistCompany = {
    id: `comp-${Date.now()}`,
    ...company,
    storyCount: 0,
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('companies').insert({
        name: newCompany.name,
        ticker: newCompany.ticker,
        slug: newCompany.slug,
        origin: newCompany.origin,
        aliases: newCompany.aliases,
        description: newCompany.description,
        is_active: newCompany.isActive,
      });
    } catch (e) {
      console.warn('[Intelligence Store] Supabase add company error:', e);
    }
  }

  companiesState = [newCompany, ...companiesState];
  return newCompany;
}

export async function deleteCompany(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('companies').delete().eq('id', id);
    } catch (e) {
      console.warn('[Intelligence Store] Supabase delete company error:', e);
    }
  }
  companiesState = companiesState.filter(c => c.id !== id);
  return true;
}

export type { StoryFilterParams } from '@/types/intelligence';

export async function getIntelligenceStories(filters?: StoryFilterParams): Promise<IntelligenceStory[]> {
  if (await isPostgresConnected()) {
    try {
      const pgStories = await getIntelligenceStoriesFromPostgres(filters);
      return pgStories;
    } catch (e) {
      console.warn('[Intelligence Store] PostgreSQL fetch error:', e);
    }
  }

  let stories = [...storiesState];

  // STEP 7 & 8 — PUBLICATION RULE & CONFIDENCE HARD CAP
  stories = stories
    .filter(story => {
      // DO NOT publish the article when verified_source_count == 0 unless editor explicitly overrides
      if (story.articleStatus === 'NO_VERIFIED_SOURCE' && !story.isEditorApproved) {
        return false;
      }
      if (story.isPublished === false && !story.isEditorApproved) {
        return false;
      }
      return true;
    })
    .map(story => {
      // Step 8: Confidence Hard Cap
      const verifiedCount = story.sources.length;
      let maxConfidence = 0;
      if (verifiedCount === 0) maxConfidence = 0;
      else if (verifiedCount === 1) maxConfidence = 75;
      else if (verifiedCount === 2) maxConfidence = 95;
      else maxConfidence = 100;

      const finalConfidence = Math.min(story.confidenceScore, maxConfidence);
      const articleStatus = story.articleStatus || (
        verifiedCount >= 2 ? 'MULTI_SOURCE_VERIFIED' :
        verifiedCount === 1 ? 'SINGLE_SOURCE_VERIFIED' : 'NO_VERIFIED_SOURCE'
      );

      return {
        ...story,
        confidenceScore: finalConfidence,
        articleStatus,
        verifiedSourceCount: verifiedCount,
        sources: story.sources.map(src => ({
          ...src,
          accessUrl: src.accessUrl || src.articleUrl,
          canonicalUrl: src.canonicalUrl || src.accessUrl || src.articleUrl,
        })),
      };
    });

  if (!filters) {
    return stories;
  }

  // 1. Text Search across Title, Summary, Companies, Sectors, Categories, Sojitz Relevance Analysis
  if (filters.query && filters.query.trim() !== '') {
    const q = filters.query.toLowerCase().trim();
    stories = stories.filter(story => {
      const matchTitle = story.title.toLowerCase().includes(q);
      const matchSummary = story.summary.toLowerCase().includes(q);
      const matchWhy = story.whyItMattersToSojitz.toLowerCase().includes(q);
      const matchSector = story.primarySectorName.toLowerCase().includes(q);
      const matchCategory = story.category.toLowerCase().includes(q);
      const matchCompanies = story.companiesMentioned.some(c => 
        c.name.toLowerCase().includes(q) || (c.ticker && c.ticker.toLowerCase().includes(q))
      );
      return matchTitle || matchSummary || matchWhy || matchSector || matchCategory || matchCompanies;
    });
  }

  // 2. Sector Filter
  if (filters.sectorSlug && filters.sectorSlug !== 'all') {
    stories = stories.filter(s => s.primarySectorSlug === filters.sectorSlug);
  }

  // 3. Company Filter
  if (filters.companySlug && filters.companySlug !== 'all') {
    stories = stories.filter(s => s.companiesMentioned.some(c => c.slug === filters.companySlug));
  }

  // 4. Category Filter
  if (filters.category && filters.category !== 'all') {
    stories = stories.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
  }

  // 5. Business Impact Filter
  if (filters.impact && filters.impact !== ('all' as any)) {
    stories = stories.filter(s => s.businessImpact === filters.impact);
  }

  // 6. Verification Status Filter
  if (filters.verificationStatus && filters.verificationStatus !== ('all' as any)) {
    stories = stories.filter(s => s.verificationStatus === filters.verificationStatus);
  }

  // 7. Minimum Relevance Score
  if (filters.minRelevance && filters.minRelevance > 1) {
    stories = stories.filter(s => s.relevanceScore >= filters.minRelevance!);
  }

  // 8. Timeframe Filter
  if (filters.timeframe === 'today') {
    stories = stories.filter(s => s.storyDate === '2026-10-05');
  } else if (filters.timeframe === 'week') {
    stories = stories.filter(s => s.storyDate >= '2026-09-28');
  }

  // 9. Behavioral Adaptive Ranking:
  return stories.sort((a, b) => {
    const statsA = storyFeedbackStats[a.id] || { useful: 0, notUseful: 0 };
    const statsB = storyFeedbackStats[b.id] || { useful: 0, notUseful: 0 };

    const effectiveScoreA = a.relevanceScore + (statsA.useful * 0.4) - (statsA.notUseful * 0.6);
    const effectiveScoreB = b.relevanceScore + (statsB.useful * 0.4) - (statsB.notUseful * 0.6);

    if (Math.abs(effectiveScoreB - effectiveScoreA) > 0.05) {
      return effectiveScoreB - effectiveScoreA;
    }
    return new Date(b.storyDate).getTime() - new Date(a.storyDate).getTime();
  });
}

// In-memory behavioral feedback store for real-time recommendation tuning
const storyFeedbackStats: Record<string, { useful: number; notUseful: number }> = {};

export async function recordStoryVote(storyId: string, vote: 'USEFUL' | 'NOT_USEFUL'): Promise<void> {
  if (!storyFeedbackStats[storyId]) {
    storyFeedbackStats[storyId] = { useful: 0, notUseful: 0 };
  }
  if (vote === 'USEFUL') {
    storyFeedbackStats[storyId].useful += 1;
  } else {
    storyFeedbackStats[storyId].notUseful += 1;
  }
}

export async function getStoryById(id: string): Promise<IntelligenceStory | null> {
  if (await isPostgresConnected()) {
    try {
      const pgStory = await getStoryByIdFromPostgres(id);
      return pgStory;
    } catch (e) {
      console.warn('[Intelligence Store] PostgreSQL fetch story error:', e);
    }
  }

  const story = storiesState.find(s => s.id === id || s.slug === id);
  return story || null;
}

export async function deleteStory(id: string): Promise<boolean> {
  if (await isPostgresConnected()) {
    try {
      await deleteStoryFromPostgres(id);
    } catch (e) {
      console.warn('[Intelligence Store] PostgreSQL delete story fallback:', e);
    }
  }

  storiesState = storiesState.filter(s => s.id !== id && s.slug !== id);
  return true;
}

/**
 * SECTION 10 & 8 — DATABASE CONSTRAINT ENFORCEMENT
 * An intelligence item must never exist without a validated source.
 * Before publishing: verified_source_count >= 1.
 * Otherwise: DELETE intelligence_item.
 */
export async function saveStory(story: IntelligenceStory): Promise<IntelligenceStory | null> {
  const validSources = (story.sources || []).filter(src => {
    const url = src.accessUrl || src.articleUrl;
    return Boolean(url && url.startsWith('http') && (!src.httpStatus || (src.httpStatus >= 200 && src.httpStatus < 300)));
  });

  if (validSources.length < 1) {
    // HARD DELETE: An intelligence item must never exist without a validated source.
    storiesState = storiesState.filter(s => s.id !== story.id && s.slug !== story.slug);
    if (await isPostgresConnected()) {
      await deleteStoryFromPostgres(story.id);
    }
    return null;
  }

  story.sources = validSources;
  story.verifiedSourceCount = validSources.length;
  story.articleStatus = validSources.length >= 2 ? 'MULTI_SOURCE_VERIFIED' : 'SINGLE_SOURCE_VERIFIED';

  // Section 8: Confidence Hard Cap
  const maxConf = validSources.length === 1 ? 75 : validSources.length === 2 ? 95 : 100;
  story.confidenceScore = Math.min(story.confidenceScore, maxConf);

  if (await isPostgresConnected()) {
    try {
      await saveStoryToPostgres(story);
    } catch (e) {
      console.warn('[Intelligence Store] PostgreSQL save story fallback:', e);
    }
  }

  const existingIdx = storiesState.findIndex(s => s.id === story.id);
  if (existingIdx >= 0) {
    storiesState[existingIdx] = story;
  } else {
    storiesState = [story, ...storiesState];
  }
  return story;
}

/**
 * SECTION 12 — HISTORICAL DATABASE CLEANUP
 * 
 * Runs a full database audit across all intelligence items:
 * 1. retrieve every source URL
 * 2. open the URL
 * 3. validate the article
 * 4. remove invalid sources
 * 5. recount valid sources
 * 
 * If valid_source_count == 0:
 * DELETE THE ENTIRE INTELLIGENCE ITEM.
 * Do not send it to admin review.
 * Do not retain it as draft.
 * Do not display it anywhere.
 */
export async function executeHistoricalDatabaseAudit(): Promise<{
  inspectedStories: number;
  deletedStoriesCount: number;
  survivingStoriesCount: number;
  totalValidSourcesRetained: number;
  totalInvalidSourcesPurged: number;
  auditTimestamp: string;
}> {
  const { openAndValidateSourceUrl, toStorySourceLink } = await import('@/lib/verification/source-first-validator');
  
  let deletedStoriesCount = 0;
  let totalValidSourcesRetained = 0;
  let totalInvalidSourcesPurged = 0;
  const initialCount = storiesState.length;
  const survivors: IntelligenceStory[] = [];

  for (const story of [...storiesState]) {
    const validSources: StorySourceLink[] = [];

    for (const src of story.sources) {
      const url = src.accessUrl || src.articleUrl;
      const validated = await openAndValidateSourceUrl(url, src.sourceName);

      if (validated) {
        validSources.push(toStorySourceLink(validated, validSources.length === 0));
        totalValidSourcesRetained++;
      } else {
        totalInvalidSourcesPurged++;
      }
    }

    // SECTION 12 RULE: If valid_source_count == 0: DELETE THE ENTIRE INTELLIGENCE ITEM
    if (validSources.length === 0) {
      deletedStoriesCount++;
      continue; // Purged!
    }

    // Update surviving story
    const verifiedSourceCount = validSources.length;
    const maxConf = verifiedSourceCount === 1 ? 75 : verifiedSourceCount === 2 ? 95 : 100;

    survivors.push({
      ...story,
      sources: validSources,
      originalUrls: validSources.map(s => s.accessUrl || s.articleUrl),
      verifiedSourceCount,
      articleStatus: verifiedSourceCount >= 2 ? 'MULTI_SOURCE_VERIFIED' : 'SINGLE_SOURCE_VERIFIED',
      confidenceScore: Math.min(story.confidenceScore, maxConf),
      verificationStatus: verifiedSourceCount >= 2 ? 'VERIFIED' : 'SINGLE_SOURCE',
    });
  }

  storiesState = survivors;

  return {
    inspectedStories: initialCount,
    deletedStoriesCount,
    survivingStoriesCount: survivors.length,
    totalValidSourcesRetained,
    totalInvalidSourcesPurged,
    auditTimestamp: new Date().toISOString(),
  };
}

export async function getWeeklyReport(slug?: string): Promise<WeeklyReport> {
  if (!slug) {
    const all = await getWeeklyReportsFromPostgres();
    return all[0] || SAMPLE_WEEKLY_REPORT;
  }
  const report = await getWeeklyReportBySlugFromPostgres(slug);
  return report || SAMPLE_WEEKLY_REPORT;
}

export async function getWeeklyReports(): Promise<WeeklyReport[]> {
  return getWeeklyReportsFromPostgres();
}

export async function saveWeeklyReport(report: WeeklyReport): Promise<WeeklyReport> {
  await saveWeeklyReportToPostgres(report);
  return report;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const stories = await getIntelligenceStories();
  const rawArticleCount = await getRawArticleCount();
  return {
    ...MOCK_KPIS,
    articlesScanned: Math.max(MOCK_KPIS.articlesScanned, rawArticleCount),
    intelligenceStories: stories.length,
    highPriorityStories: stories.filter(s => s.relevanceScore >= 8).length,
    opportunitiesCount: stories.filter(s => s.businessImpact === 'OPPORTUNITY').length,
    risksCount: stories.filter(s => s.businessImpact === 'RISK').length,
    maActivityCount: stories.filter(s => s.businessImpact === 'MA_INVESTMENT' || s.category.includes('M&A')).length,
    verifiedCount: stories.filter(s => s.verificationStatus === 'VERIFIED').length,
  };
}

export async function updateStorySourceLink(
  storyId: string,
  sourceId: string,
  updates: Partial<import('@/types/intelligence').StorySourceLink>
): Promise<boolean> {
  const story = storiesState.find(s => s.id === storyId);
  if (!story) return false;
  const src = story.sources.find(s => s.id === sourceId);
  if (!src) return false;
  Object.assign(src, updates);
  if (updates.articleUrl) {
    story.originalUrls = story.sources.map(s => s.articleUrl);
  }
  return true;
}

export async function updateStoryAuditStatus(
  storyId: string,
  updates: { isEditorApproved?: boolean; editorNotes?: string; sourceAuditStatus?: 'AUDITED' | 'NEEDS_REVIEW' | 'FLAGGED' }
): Promise<boolean> {
  const story = storiesState.find(s => s.id === storyId);
  if (!story) return false;
  Object.assign(story, updates);
  return true;
}

/**
 * Runs the Source Integrity & Auto-Cleanup Agent on a single story.
 * Permanently removes unverified/broken links, saves canonical access_url,
 * caps confidence, and sets article publication status.
 */
export async function cleanStorySources(storyId: string) {
  const story = storiesState.find(s => s.id === storyId || s.slug === storyId);
  if (!story) return null;
  const { auditAndCleanStorySources } = await import('@/lib/verification/source-link-verifier');
  const { cleanupResult, updatedStory } = await auditAndCleanStorySources(story);
  await saveStory(updatedStory);
  return { cleanupResult, updatedStory };
}

/**
 * Runs the Source Integrity & Auto-Cleanup Agent across all stories in runtime memory.
 */
export async function cleanAllStoriesSources() {
  const { auditAndCleanStorySources } = await import('@/lib/verification/source-link-verifier');
  const results = [];
  for (const story of [...storiesState]) {
    const { cleanupResult, updatedStory } = await auditAndCleanStorySources(story);
    await saveStory(updatedStory);
    results.push(cleanupResult);
  }
  return results;
}

export const intelligenceStore = {
  getSources,
  addSource,
  deleteSource,
  getSectors,
  addSector,
  deleteSector,
  getCompanies,
  addCompany,
  deleteCompany,
  getIntelligenceStories,
  recordStoryVote,
  getStoryById,
  saveStory,
  deleteStory,
  executeHistoricalDatabaseAudit,
  updateStorySourceLink,
  updateStoryAuditStatus,
  cleanStorySources,
  cleanAllStoriesSources,
  getWeeklyReport,
  getWeeklyReports,
  saveWeeklyReport,
  getDashboardKpis,
  getRawArticles,
  saveRawArticle,
  getRawArticleCount,
};


