import { getActiveAiProvider } from './provider-factory';
import { getIntelligenceStories } from '@/lib/data/intelligence-store';
import { WeeklyReport } from '@/types/report';
import { getCalendarWeekBoundariesLocal } from '@/lib/utils/date-boundaries';
import { saveWeeklyReportToPostgres } from '@/lib/database/weekly-report-store';

export async function generateWeeklyReport(params?: {
  year?: number;
  weekNumber?: number;
  startDate?: string;
  endDate?: string;
}): Promise<WeeklyReport> {
  const boundaries = getCalendarWeekBoundariesLocal();
  const year = params?.year || boundaries.year;
  const weekNumber = params?.weekNumber || boundaries.weekNumber;
  const startDate = params?.startDate || boundaries.weekStart;
  const endDate = params?.endDate || boundaries.weekEnd;

  // Strict Week Boundary Query (Monday 00:00:00 to Sunday 23:59:59 Asia/Ho_Chi_Minh)
  let stories = await getIntelligenceStories({ timeframe: 'week' });
  
  // If no stories exist in this specific week yet, query top published stories for grounding
  if (stories.length === 0) {
    stories = await getIntelligenceStories();
  }

  const provider = getActiveAiProvider();

  const report = await provider.synthesizeWeeklyReport({
    year,
    weekNumber,
    startDate,
    endDate,
    stories: stories.slice(0, 20),
  });

  // Ensure slug follows standard format
  if (!report.slug || report.slug.startsWith('week-')) {
    report.slug = `${year}-w${weekNumber}`;
  }

  await saveWeeklyReportToPostgres(report);
  return report;
}

export async function synthesizeWeeklyReport(params: {
  year: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  stories: any[];
}): Promise<WeeklyReport> {
  const provider = getActiveAiProvider();
  const report = await provider.synthesizeWeeklyReport({
    year: params.year,
    weekNumber: params.weekNumber,
    startDate: params.startDate,
    endDate: params.endDate,
    stories: params.stories,
  });

  if (!report.slug || report.slug.startsWith('week-')) {
    report.slug = `${params.year}-w${params.weekNumber}`;
  }

  await saveWeeklyReportToPostgres(report);
  return report;
}

export const weeklySynthesizer = {
  generateWeeklyReport,
  synthesizeWeeklyReport,
};
