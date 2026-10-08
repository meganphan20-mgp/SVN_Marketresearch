import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyReport } from '@/lib/ai/weekly-synthesizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const year = Number(body.year) || 2026;
    const weekNumber = Number(body.weekNumber) || 40;
    const startDate = body.startDate || '2026-09-28';
    const endDate = body.endDate || '2026-10-04';

    const report = await generateWeeklyReport({
      year,
      weekNumber,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error('[API /api/ai/synthesize-weekly] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
