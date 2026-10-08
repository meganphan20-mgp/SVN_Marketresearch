import { computeSha256, isNearDuplicate, extractTokens } from './deduplication';
import { RawClusterArticle } from '@/lib/ai/providers/base';

export interface RawIngestedArticle extends RawClusterArticle {
  id?: string;
  title: string;
  description?: string;
  entities?: string[];
  sectorHint?: string;
}

export interface ArticleCluster {
  id: string;
  clusterTitle: string;
  articles: RawIngestedArticle[];
  earliestDate: string;
  latestDate: string;
  entities: string[];
  sectorHints: string[];
  maxTier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'DISCOVERY';
}

const TIER_RANK: Record<string, number> = {
  TIER_1: 4,
  TIER_2: 3,
  TIER_3: 2,
  DISCOVERY: 1,
};

/**
 * Clusters a stream of raw ingested articles into coherent multi-source story events.
 * 
 * Rules:
 * - Publication dates within 72 hours (3 days)
 * - Near duplicate title or significant token overlap (Jaccard >= 0.45 for clustering, or exact entity overlap)
 */
export function clusterArticles(articles: RawIngestedArticle[]): ArticleCluster[] {
  const clusters: ArticleCluster[] = [];

  // Sort articles by publication date (newest first)
  const sorted = [...articles].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  for (const article of sorted) {
    const articleTime = new Date(article.publishedAt).getTime();
    let assignedCluster: ArticleCluster | null = null;

    for (const cluster of clusters) {
      // 1. Check 72-hour time window (72 hours = 259,200,000 ms)
      const clusterEarliest = new Date(cluster.earliestDate).getTime();
      const clusterLatest = new Date(cluster.latestDate).getTime();
      const timeDiff = Math.abs(articleTime - clusterLatest);

      if (timeDiff > 72 * 60 * 60 * 1000) {
        continue;
      }

      // 2. Check title / content similarity with cluster headline or member articles
      const { isDuplicate, similarity } = isNearDuplicate(article.title, cluster.clusterTitle, 0.40);

      // 3. Check entity intersection if available
      let entityOverlap = false;
      if (article.entities && article.entities.length > 0 && cluster.entities.length > 0) {
        const clusterEntitySet = new Set(cluster.entities.map(e => e.toLowerCase()));
        const shared = article.entities.filter(e => clusterEntitySet.has(e.toLowerCase()));
        if (shared.length >= 2) {
          entityOverlap = true;
        }
      }

      if (isDuplicate || similarity >= 0.40 || entityOverlap) {
        assignedCluster = cluster;
        break;
      }
    }

    if (assignedCluster) {
      // Add article to existing cluster
      assignedCluster.articles.push(article);

      // Update date window
      if (new Date(article.publishedAt) < new Date(assignedCluster.earliestDate)) {
        assignedCluster.earliestDate = article.publishedAt;
      }
      if (new Date(article.publishedAt) > new Date(assignedCluster.latestDate)) {
        assignedCluster.latestDate = article.publishedAt;
      }

      // Merge entities
      if (article.entities) {
        for (const e of article.entities) {
          if (!assignedCluster.entities.includes(e)) {
            assignedCluster.entities.push(e);
          }
        }
      }

      // Merge sector hints
      if (article.sectorHint && !assignedCluster.sectorHints.includes(article.sectorHint)) {
        assignedCluster.sectorHints.push(article.sectorHint);
      }

      // If this article is from a higher tier, consider using its title for the cluster
      const currentRank = TIER_RANK[assignedCluster.maxTier] || 1;
      const articleRank = TIER_RANK[article.sourceTier] || 1;
      if (articleRank > currentRank) {
        assignedCluster.maxTier = article.sourceTier;
        assignedCluster.clusterTitle = article.title;
      }
    } else {
      // Create new cluster
      const clusterId = `cluster-${computeSha256(article.title + article.publishedAt).slice(0, 12)}`;
      clusters.push({
        id: clusterId,
        clusterTitle: article.title,
        articles: [article],
        earliestDate: article.publishedAt,
        latestDate: article.publishedAt,
        entities: article.entities ? [...article.entities] : [],
        sectorHints: article.sectorHint ? [article.sectorHint] : [],
        maxTier: article.sourceTier,
      });
    }
  }

  return clusters;
}
