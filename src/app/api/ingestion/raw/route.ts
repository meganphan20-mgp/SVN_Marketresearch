import { NextRequest, NextResponse } from 'next/server';
import { runPhase1Ingestion } from '@/lib/ingestion/phase1-pipeline';
import { rawArticlesStore } from '@/lib/data/raw-articles-store';

/**
 * PHASE 1 API: SOURCE DISCOVERY + RAW ARTICLE INGESTION
 * 
 * GET: Returns existing raw_articles records.
 * POST: Triggers live source discovery and stores real raw articles.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const articles = await rawArticlesStore.getRawArticles({ sourceId, limit });
    const count = await rawArticlesStore.getRawArticleCount();

    return NextResponse.json({
      success: true,
      totalCount: count,
      returnedCount: articles.length,
      data: articles,
    });
  } catch (error: any) {
    console.error('[API /api/ingestion/raw GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let sourceIds: string[] | undefined = undefined;
    let maxArticlesPerSource = 5;

    try {
      const body = await req.json();
      if (body.sourceIds && Array.isArray(body.sourceIds)) {
        sourceIds = body.sourceIds;
      }
      if (typeof body.maxArticlesPerSource === 'number') {
        maxArticlesPerSource = body.maxArticlesPerSource;
      }
    } catch {
      // Empty body is valid
    }

    const result = await runPhase1Ingestion({ sourceIds, maxArticlesPerSource });

    return NextResponse.json({
      success: true,
      phase: 'PHASE_1_SOURCE_DISCOVERY_AND_RAW_INGESTION',
      message: `Ingestion completed. Discovered ${result.totalDiscoveredUrls} URLs across ${result.sourcesScanned} sources. Stored ${result.totalRawArticlesStored} verified raw articles. Zero intelligence stories generated.`,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/ingestion/raw POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
