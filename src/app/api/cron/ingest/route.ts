import { NextRequest, NextResponse } from 'next/server';
import { runDailyIntelligenceOrchestrator } from '@/lib/orchestration/daily-pipeline-orchestrator';

/**
 * Scheduled Daily Ingestion Job.
 * Configured to run every morning at 06:00 ICT (23:00 UTC) via Vercel Cron or Supabase pg_cron.
 * 
 * Executes full 5-Role Intelligence Pipeline:
 * 1. Role 1 (Research Scanner): Scans active sources, fetches verified articles into raw_articles.
 * 2. Role 3 (Fact & Event Analyst): Semantic facts, entities, events, claims into article_extractions.
 * 3. Role 2 (Market Intelligence Analyst): Sojitz relevance criteria, 4-way triage (DROP/WATCH/PICK UP/RESEARCH).
 * 4. Role 4 & 5 (Strategy & BD Analyst): Only for qualified articles, event dedup, date gating, strategic analysis.
 */
export async function GET(req: NextRequest) {
  return handleCronIngestion(req);
}

export async function POST(req: NextRequest) {
  return handleCronIngestion(req);
}

async function handleCronIngestion(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Authorization check (if CRON_SECRET is configured)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authorization token' },
      { status: 401 }
    );
  }

  // Parse optional query params for testing/filtering
  const searchParams = req.nextUrl.searchParams;
  const maxArticles = searchParams.get('maxArticles') ? parseInt(searchParams.get('maxArticles')!, 10) : undefined;
  const minRelevance = searchParams.get('minRelevance') ? parseInt(searchParams.get('minRelevance')!, 10) : undefined;

  try {
    const result = await runDailyIntelligenceOrchestrator({
      maxArticlesPerSource: maxArticles,
      minRelevanceScore: minRelevance,
    });

    return NextResponse.json({
      status: result.status,
      timestamp: result.timestamp,
      executionDurationMs: result.executionDurationMs,
      roles: result.roles,
      publishedStoriesCount: result.publishedStories.length,
      publishedStories: result.publishedStories.map(s => ({
        id: s.id,
        title: s.title,
        relevanceScore: s.relevanceScore,
        businessImpact: s.businessImpact,
        sourcesCount: s.sources.length,
        primarySector: s.primarySectorName,
      })),
    });
  } catch (err: any) {
    console.error('[CRON /api/cron/ingest] Daily ingestion failed:', err);
    return NextResponse.json(
      { status: 'error', error: err.message || 'Ingestion job encountered an error' },
      { status: 500 }
    );
  }
}
