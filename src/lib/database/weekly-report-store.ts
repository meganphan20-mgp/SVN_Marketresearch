import { getPostgresPool } from './postgres';
import { WeeklyReport } from '@/types/report';
import { SAMPLE_WEEKLY_REPORT } from '@/lib/data/mock-intelligence';
import crypto from 'crypto';

/**
 * PRODUCTION POSTGRESQL WEEKLY REPORT STORE
 * 
 * Strict Principle:
 * - Persists and queries official 12-section C-Suite Weekly Briefing reports.
 * - Table: public.weekly_reports
 */

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function saveWeeklyReportToPostgres(report: WeeklyReport): Promise<{
  success: boolean;
  reportId?: string;
  error?: string;
}> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM public.weekly_reports WHERE slug = $1 LIMIT 1', [report.slug]);
    const reportId = existing.rows.length > 0 ? existing.rows[0].id : (isUuid(report.id) ? report.id : crypto.randomUUID());

    const query = `
      INSERT INTO public.weekly_reports (
        id, year, week_number, start_date, end_date, title, slug,
        executive_summary, top_developments, top_opportunities,
        macro_policy, ma_investment, japanese_companies, trading_houses,
        vietnam_corporate_watch, sector_intelligence, risks_analysis,
        sojitz_watch_list, suggested_bd_actions, curated_story_ids,
        is_published, published_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, now(), now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        year = EXCLUDED.year,
        week_number = EXCLUDED.week_number,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        executive_summary = EXCLUDED.executive_summary,
        top_developments = EXCLUDED.top_developments,
        top_opportunities = EXCLUDED.top_opportunities,
        macro_policy = EXCLUDED.macro_policy,
        ma_investment = EXCLUDED.ma_investment,
        japanese_companies = EXCLUDED.japanese_companies,
        trading_houses = EXCLUDED.trading_houses,
        vietnam_corporate_watch = EXCLUDED.vietnam_corporate_watch,
        sector_intelligence = EXCLUDED.sector_intelligence,
        risks_analysis = EXCLUDED.risks_analysis,
        sojitz_watch_list = EXCLUDED.sojitz_watch_list,
        suggested_bd_actions = EXCLUDED.suggested_bd_actions,
        curated_story_ids = EXCLUDED.curated_story_ids,
        is_published = EXCLUDED.is_published,
        published_at = EXCLUDED.published_at,
        updated_at = now();
    `;

    // Filter valid UUID story IDs for PostgreSQL uuid[] column
    const curatedIds = (report.curatedStories || [])
      .map(s => s.id)
      .filter(id => isUuid(id));

    await client.query(query, [
      reportId,
      report.year,
      report.weekNumber,
      report.startDate,
      report.endDate,
      report.title,
      report.slug,
      report.executiveSummary,
      JSON.stringify(report.topDevelopments || []),
      JSON.stringify(report.topBusinessOpportunities || []),
      report.macroPolicy,
      report.maInvestment,
      report.japaneseCompanies,
      report.japaneseTradingHouses,
      report.vietnamCorporateWatch,
      JSON.stringify(report.sectorIntelligence || []),
      report.risksAnalysis,
      report.whatSojitzShouldWatch,
      JSON.stringify(report.suggestedBdActions || []),
      curatedIds,
      report.isPublished ?? true,
      report.publishedAt || new Date().toISOString(),
    ]);

    await client.query('COMMIT');
    console.log(`[WeeklyReportStore] Saved weekly report ${reportId} (${report.slug}) to PostgreSQL.`);
    return { success: true, reportId };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[WeeklyReportStore] Error saving weekly report to PostgreSQL:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

export async function getWeeklyReportsFromPostgres(): Promise<WeeklyReport[]> {
  const pool = getPostgresPool();
  try {
    const res = await pool.query(`
      SELECT * FROM public.weekly_reports
      ORDER BY year DESC, week_number DESC;
    `);

    if (res.rows.length === 0) {
      return [SAMPLE_WEEKLY_REPORT];
    }

    return res.rows.map(mapPostgresRowToWeeklyReport);
  } catch (err) {
    console.warn('[WeeklyReportStore] PostgreSQL query failed, falling back to mock:', err);
    return [SAMPLE_WEEKLY_REPORT];
  }
}

export async function getWeeklyReportBySlugFromPostgres(slug: string): Promise<WeeklyReport | null> {
  const pool = getPostgresPool();
  try {
    const raw = (slug || '').trim().toLowerCase();
    let normalized = raw;
    const match = raw.match(/^(?:2026-)?w?(\d{1,2})$/i);
    const weekNum = match ? parseInt(match[1], 10) : null;
    if (weekNum) {
      normalized = `2026-w${weekNum}`;
    }

    const res = await pool.query(`
      SELECT * FROM public.weekly_reports
      WHERE slug = $1 
         OR slug = $2 
         OR LOWER(slug) = LOWER($1) 
         OR id::text = $1 
         OR ($3::smallint IS NOT NULL AND week_number = $3::smallint)
      ORDER BY year DESC, week_number DESC
      LIMIT 1;
    `, [slug, normalized, weekNum]);

    if (res.rows.length === 0) {
      if (slug === SAMPLE_WEEKLY_REPORT.slug || slug === SAMPLE_WEEKLY_REPORT.id || normalized === SAMPLE_WEEKLY_REPORT.slug) {
        return SAMPLE_WEEKLY_REPORT;
      }
      return null;
    }

    const report = mapPostgresRowToWeeklyReport(res.rows[0]);
    if (Array.isArray(res.rows[0].curated_story_ids) && res.rows[0].curated_story_ids.length > 0) {
      try {
        const { getIntelligenceStoriesFromPostgres } = await import('./story-store');
        const allStories = await getIntelligenceStoriesFromPostgres();
        const idSet = new Set(res.rows[0].curated_story_ids);
        report.curatedStories = allStories.filter(s => idSet.has(s.id));
        if (report.curatedStories.length > 0) {
          report.curatedStoryCount = report.curatedStories.length;
        }
      } catch (e) {
        console.warn('[WeeklyReportStore] Error populating curated stories:', e);
      }
    }
    return report;
  } catch (err) {
    console.warn(`[WeeklyReportStore] PostgreSQL query for slug "${slug}" failed:`, err);
    if (slug === SAMPLE_WEEKLY_REPORT.slug || slug === SAMPLE_WEEKLY_REPORT.id) {
      return SAMPLE_WEEKLY_REPORT;
    }
    return null;
  }
}

function mapPostgresRowToWeeklyReport(row: any): WeeklyReport {
  return {
    id: row.id,
    year: row.year,
    weekNumber: row.week_number,
    startDate: row.start_date instanceof Date ? row.start_date.toISOString().slice(0, 10) : String(row.start_date || '').slice(0, 10),
    endDate: row.end_date instanceof Date ? row.end_date.toISOString().slice(0, 10) : String(row.end_date || '').slice(0, 10),
    title: row.title,
    slug: row.slug,
    executiveSummary: row.executive_summary,
    topDevelopments: Array.isArray(row.top_developments) ? row.top_developments : [],
    topBusinessOpportunities: Array.isArray(row.top_opportunities) ? row.top_opportunities : [],
    macroPolicy: row.macro_policy || '',
    maInvestment: row.ma_investment || '',
    japaneseCompanies: row.japanese_companies || '',
    japaneseTradingHouses: row.trading_houses || '',
    vietnamCorporateWatch: row.vietnam_corporate_watch || '',
    sectorIntelligence: Array.isArray(row.sector_intelligence) ? row.sector_intelligence : [],
    risksAnalysis: row.risks_analysis || '',
    whatSojitzShouldWatch: row.sojitz_watch_list || '',
    suggestedBdActions: Array.isArray(row.suggested_bd_actions) ? row.suggested_bd_actions : [],
    curatedStories: [],
    curatedStoryCount: Array.isArray(row.curated_story_ids) ? row.curated_story_ids.length : 0,
    isPublished: row.is_published,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : (row.published_at || new Date().toISOString()),
    generatedAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at || new Date().toISOString()),
  };
}
