import { NextRequest, NextResponse } from 'next/server';
import { executeHistoricalDatabaseAudit } from '@/lib/data/intelligence-store';

/**
 * SECTION 13 — RECURRING LINK AUDIT CRON
 * 
 * Periodically re-checks all links for existing published data.
 * If all sources later become invalid:
 * unpublish and delete the intelligence item from the public dataset.
 */
export async function GET(req: NextRequest) {
  return handleAudit(req);
}

export async function POST(req: NextRequest) {
  return handleAudit(req);
}

async function handleAudit(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authorization token' },
      { status: 401 }
    );
  }

  try {
    const result = await executeHistoricalDatabaseAudit();
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      audit: result,
    });
  } catch (err: any) {
    console.error('[CRON /api/cron/audit-links] Recurring link audit failed:', err);
    return NextResponse.json(
      { status: 'error', error: err.message || 'Recurring audit failed' },
      { status: 500 }
    );
  }
}
