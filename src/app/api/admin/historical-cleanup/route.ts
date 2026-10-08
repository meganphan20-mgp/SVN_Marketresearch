import { NextRequest, NextResponse } from 'next/server';
import { executeHistoricalDatabaseAudit } from '@/lib/data/intelligence-store';

/**
 * SECTION 12 — HISTORICAL DATABASE CLEANUP ENDPOINT
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
export async function POST(req: NextRequest) {
  try {
    const result = await executeHistoricalDatabaseAudit();
    const { getIntelligenceStories } = await import('@/lib/data/intelligence-store');
    const survivingStories = await getIntelligenceStories();
    return NextResponse.json({
      status: 'success',
      ...result,
      survivingStories,
    });
  } catch (error: any) {
    console.error('[API /api/admin/historical-cleanup] Audit failed:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Historical cleanup failed' },
      { status: 500 }
    );
  }
}
