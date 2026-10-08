import { NextRequest, NextResponse } from 'next/server';
import { processArticleCluster } from '@/lib/ai/story-analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.clusterTitle || !Array.isArray(body.articles) || body.articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'clusterTitle and non-empty articles array are required.' },
        { status: 400 }
      );
    }

    const story = await processArticleCluster({
      clusterTitle: body.clusterTitle,
      articles: body.articles,
    });

    return NextResponse.json({ success: true, data: story });
  } catch (error: any) {
    console.error('[API /api/ai/analyze-story] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
