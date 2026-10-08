import { NextRequest, NextResponse } from 'next/server';
import { newsIngestionPipeline } from '@/lib/ingestion/pipeline';

export async function POST(req: NextRequest) {
  try {
    let customArticles = undefined;
    try {
      const body = await req.json();
      if (body.articles && Array.isArray(body.articles)) {
        customArticles = body.articles;
      }
    } catch {
      // Empty body is valid: defaults to verified incoming news feed
    }

    const result = await newsIngestionPipeline.run(customArticles);

    return NextResponse.json({
      success: true,
      message: `Ingestion completed. ${result.storiesGenerated} verified intelligence stories generated from ${result.totalScanned} scanned articles.`,
      result,
    });
  } catch (error: any) {
    console.error('[API /api/ingestion/crawl] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ingestion pipeline execution failed' },
      { status: 500 }
    );
  }
}
