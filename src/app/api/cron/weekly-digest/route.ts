import { NextRequest, NextResponse } from 'next/server';
import { weeklySynthesizer } from '@/lib/ai/weekly-synthesizer';
import { getCalendarWeekBoundariesLocal } from '@/lib/utils/date-boundaries';

/**
 * Scheduled Friday Weekly Executive Report Compilation Job.
 * Configured to run every Friday at 17:00 ICT (10:00 UTC) via Vercel Cron or pg_cron.
 * 
 * Strict Principle:
 * - Uses exact calendar-week boundaries (Monday 00:00:00 to Sunday 23:59:59 Asia/Ho_Chi_Minh).
 * - Synthesizes official 12-section C-Suite briefing from verified stories.
 * - Stores report transactionally in PostgreSQL public.weekly_reports.
 * - Generates email digest dispatch payload for Sojitz management.
 */
export async function GET(req: NextRequest) {
  return handleWeeklyCompilation(req);
}

export async function POST(req: NextRequest) {
  return handleWeeklyCompilation(req);
}

async function handleWeeklyCompilation(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authorization token' },
      { status: 401 }
    );
  }

  try {
    const { year, weekNumber, weekStart, weekEnd } = getCalendarWeekBoundariesLocal();

    console.log(`[CRON /api/cron/weekly-digest] Compiling Weekly Executive Report for Year ${year} Week ${weekNumber} (${weekStart} to ${weekEnd})...`);

    const report = await weeklySynthesizer.generateWeeklyReport({
      year,
      weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
    });

    // Executive digest email payload stub for Sojitz Vietnam Leadership
    const emailDigest = {
      recipientGroup: 'sojitz-vietnam-executives@sojitz.com',
      subject: `[Sojitz Executive Briefing] Week ${report.weekNumber}, ${report.year} (${report.startDate} - ${report.endDate})`,
      topDevelopmentsCount: report.topDevelopments?.length || 0,
      opportunitiesCount: report.topBusinessOpportunities?.length || 0,
      reportUrl: `/weekly/${report.slug}`,
      status: 'QUEUED_FOR_DISPATCH',
    };

    return NextResponse.json({
      status: 'success',
      reportId: report.id,
      title: report.title,
      slug: report.slug,
      weekNumber: report.weekNumber,
      year: report.year,
      dateRange: {
        startDate: report.startDate,
        endDate: report.endDate,
        timezone: 'Asia/Ho_Chi_Minh',
      },
      storiesIncluded: report.curatedStoryCount,
      topDevelopmentsCount: report.topDevelopments?.length || 0,
      opportunitiesCount: report.topBusinessOpportunities?.length || 0,
      emailDigest,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[CRON /api/cron/weekly-digest] Compilation failed:', err);
    return NextResponse.json(
      { status: 'error', error: err.message || 'Weekly compilation failed' },
      { status: 500 }
    );
  }
}
