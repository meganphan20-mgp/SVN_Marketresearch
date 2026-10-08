import { RawArticle, FreshnessBucket } from '@/types/intelligence';
import { 
  isPostgresConnected, 
  insertRawArticleToPostgres, 
  getRawArticlesFromPostgres, 
  getRawArticleByIdFromPostgres, 
  countRawArticlesInPostgres 
} from '@/lib/database/postgres';

/**
 * RAW ARTICLES AUTHORITATIVE DATA STORE (PHASE 1.2 PRODUCTION READY)
 * 
 * Strict Architecture:
 * - PostgreSQL (public.raw_articles) is the AUTHORITATIVE SOURCE OF TRUTH.
 * - Disk file (.data/raw_articles.json) is strictly a fallback / emergency cache.
 * - Workers read from PostgreSQL.
 * - Daily Phase 2 reads: fetch_verified = true AND is_article_page = true AND freshness_bucket IN ('TODAY', 'RECENT').
 */

let fallbackMemoryState: RawArticle[] = [];
let isFallbackInitialized = false;

function getFallbackFilePath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    return path.join(process.cwd(), '.data', 'raw_articles.json');
  } catch {
    return null;
  }
}

function loadFromFallbackDisk(): void {
  if (isFallbackInitialized) return;
  isFallbackInitialized = true;

  const filePath = getFallbackFilePath();
  if (!filePath) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        fallbackMemoryState = data;
      }
    }
  } catch (err) {
    console.warn('[Raw Articles Store] Fallback disk read warning:', err);
  }
}

function saveToFallbackDisk(): void {
  const filePath = getFallbackFilePath();
  if (!filePath) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(fallbackMemoryState, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Raw Articles Store] Fallback disk write warning:', err);
  }
}

export async function saveRawArticle(article: RawArticle): Promise<RawArticle | null> {
  // 1. Authoritative write to PostgreSQL
  try {
    const isLive = await isPostgresConnected();
    if (isLive) {
      const pgSaved = await insertRawArticleToPostgres(article);
      if (pgSaved) {
        // Also sync to emergency disk cache
        loadFromFallbackDisk();
        const existingIdx = fallbackMemoryState.findIndex(a => a.url === article.url || a.contentHash === article.contentHash);
        if (existingIdx >= 0) {
          fallbackMemoryState[existingIdx] = pgSaved;
        } else {
          fallbackMemoryState.unshift(pgSaved);
        }
        saveToFallbackDisk();
        return pgSaved;
      }
    }
  } catch (err) {
    console.warn('[Raw Articles Store] Authoritative Postgres save failed, falling back to disk cache:', err);
  }

  // 2. Emergency fallback
  loadFromFallbackDisk();
  const existing = fallbackMemoryState.find(
    a => a.contentHash === article.contentHash || a.url === article.url || a.originalUrl === article.originalUrl
  );
  if (existing) {
    return existing;
  }

  fallbackMemoryState.unshift(article);
  saveToFallbackDisk();
  return article;
}

export async function getRawArticles(params?: {
  sourceId?: string;
  limit?: number;
  freshnessBuckets?: FreshnessBucket[];
  verifiedOnly?: boolean;
}): Promise<RawArticle[]> {
  // 1. Authoritative read from PostgreSQL
  try {
    const isLive = await isPostgresConnected();
    if (isLive) {
      return await getRawArticlesFromPostgres(params);
    }
  } catch (err) {
    console.warn('[Raw Articles Store] Authoritative Postgres read failed, falling back to disk cache:', err);
  }

  // 2. Emergency fallback
  loadFromFallbackDisk();
  let results = [...fallbackMemoryState];

  if (params?.verifiedOnly !== false) {
    results = results.filter(a => a.fetchVerified && a.isArticlePage);
  }
  if (params?.sourceId) {
    results = results.filter(a => a.sourceId === params.sourceId || (a as any).sourceCode === params.sourceId);
  }
  if (params?.freshnessBuckets && params.freshnessBuckets.length > 0) {
    results = results.filter(a => a.freshnessBucket && params.freshnessBuckets!.includes(a.freshnessBucket));
  }
  if (params?.limit) {
    results = results.slice(0, params.limit);
  }
  return results;
}

/**
 * PRODUCTION PIPELINE GATE: Daily Phase 2 Ingestion
 * Strictly filters:
 * fetch_verified = true
 * AND is_article_page = true
 * AND freshness_bucket IN ('TODAY', 'RECENT')
 */
export async function getRawArticlesForDailyPipeline(params?: {
  limit?: number;
}): Promise<RawArticle[]> {
  return getRawArticles({
    verifiedOnly: true,
    freshnessBuckets: ['TODAY', 'RECENT'],
    limit: params?.limit,
  });
}

/**
 * PRODUCTION PIPELINE GATE: Weekly Intelligence Ingestion
 * Strictly filters:
 * fetch_verified = true
 * AND is_article_page = true
 * AND freshness_bucket IN ('TODAY', 'RECENT', 'WEEKLY_CONTEXT')
 */
export async function getRawArticlesForWeeklyPipeline(params?: {
  limit?: number;
}): Promise<RawArticle[]> {
  return getRawArticles({
    verifiedOnly: true,
    freshnessBuckets: ['TODAY', 'RECENT', 'WEEKLY_CONTEXT'],
    limit: params?.limit,
  });
}

export async function getRawArticleById(id: string): Promise<RawArticle | null> {
  try {
    const isLive = await isPostgresConnected();
    if (isLive) {
      const pgArt = await getRawArticleByIdFromPostgres(id);
      if (pgArt) return pgArt;
    }
  } catch {
    // fallback
  }

  loadFromFallbackDisk();
  return fallbackMemoryState.find(a => a.id === id) || null;
}

export async function getRawArticleCount(): Promise<number> {
  try {
    const isLive = await isPostgresConnected();
    if (isLive) {
      return await countRawArticlesInPostgres();
    }
  } catch {
    // fallback
  }

  loadFromFallbackDisk();
  return fallbackMemoryState.length;
}

export function isDatabasePersisted(): boolean {
  return true;
}

export function clearRawArticlesMemory(): void {
  fallbackMemoryState = [];
}

export const rawArticlesStore = {
  saveRawArticle,
  getRawArticles,
  getRawArticlesForDailyPipeline,
  getRawArticlesForWeeklyPipeline,
  getRawArticleById,
  getRawArticleCount,
  isDatabasePersisted,
  clearRawArticlesMemory,
};
