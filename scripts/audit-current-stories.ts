import { getPostgresPool } from '../src/lib/database/postgres';
import { 
  getTodayLocal, 
  getPublicationDateLocal, 
  getCalendarWeekBoundariesLocal, 
  isEligibleForDailyBrief,
  isEligibleForWeeklyBrief,
  SOJITZ_TIMEZONE 
} from '../src/lib/verification/temporal-gating';

interface StoryAuditRow {
  story_title: string;
  source_published_at: string;
  source_publication_date_local: string;
  daily_brief_date: string;
  event_date: string;
  fetched_at: string;
  daily_eligible_today: boolean;
  weekly_eligible: boolean;
  reason: string;
}

export async function auditAllStories(): Promise<{
  currentDailyDate: string;
  totalEvaluated: number;
  dailyEligibleCount: number;
  dailyExcludedCount: number;
  weeklyEligibleCount: number;
  auditRows: StoryAuditRow[];
}> {
  const pool = getPostgresPool();
  const currentDailyDate = getTodayLocal();
  const { weekStart, weekEnd } = getCalendarWeekBoundariesLocal(currentDailyDate);

  const query = `
    SELECT 
      s.id as story_id,
      s.title as story_title,
      s.source_publication_date_local::text as story_pub_local,
      s.daily_brief_date::text as daily_brief_date,
      s.event_date::text as event_date,
      s.first_seen_at,
      ss.source_name,
      ss.published_at as source_published_at,
      ss.source_publication_date_local::text as ss_pub_local,
      ra.fetched_at
    FROM public.intelligence_stories s
    LEFT JOIN public.story_sources ss ON s.id = ss.story_id AND ss.is_primary_claim_source = true
    LEFT JOIN public.raw_articles ra ON ss.raw_article_id = ra.id
    ORDER BY s.created_at ASC;
  `;

  const res = await pool.query(query);
  const rows = res.rows;

  const auditRows: StoryAuditRow[] = [];
  let dailyEligibleCount = 0;
  let dailyExcludedCount = 0;
  let weeklyEligibleCount = 0;

  for (const r of rows) {
    const rawPublishedAt = r.source_published_at instanceof Date 
      ? r.source_published_at.toISOString() 
      : (r.source_published_at ? String(r.source_published_at) : null);
    
    const rawFetchedAt = r.fetched_at instanceof Date 
      ? r.fetched_at.toISOString() 
      : (r.fetched_at ? String(r.fetched_at) : 'N/A');

    const sourcePubLocal = r.ss_pub_local || r.story_pub_local || getPublicationDateLocal(rawPublishedAt) || 'UNKNOWN';
    const briefDate = r.daily_brief_date || sourcePubLocal;
    const eventDate = r.event_date || sourcePubLocal;

    const dailyEval = isEligibleForDailyBrief({
      sourcePublishedAt: rawPublishedAt,
      dailyBriefDate: currentDailyDate,
    });

    const weeklyEval = isEligibleForWeeklyBrief({
      sourcePublishedAt: rawPublishedAt,
      targetWeekDate: currentDailyDate,
    });

    if (dailyEval.isEligible) {
      dailyEligibleCount++;
    } else {
      dailyExcludedCount++;
    }

    if (weeklyEval.isEligible) {
      weeklyEligibleCount++;
    }

    auditRows.push({
      story_title: r.story_title,
      source_published_at: rawPublishedAt || 'N/A',
      source_publication_date_local: sourcePubLocal,
      daily_brief_date: briefDate,
      event_date: eventDate,
      fetched_at: rawFetchedAt,
      daily_eligible_today: dailyEval.isEligible,
      weekly_eligible: weeklyEval.isEligible,
      reason: dailyEval.isEligible 
        ? `ELIGIBLE: Source published on ${sourcePubLocal} matches Daily date ${currentDailyDate} (Asia/Ho_Chi_Minh).`
        : `EXCLUDED FROM TODAY: Source published on ${sourcePubLocal} (< today ${currentDailyDate}). Belongs to Daily Brief ${briefDate}.`,
    });
  }

  return {
    currentDailyDate,
    totalEvaluated: rows.length,
    dailyEligibleCount,
    dailyExcludedCount,
    weeklyEligibleCount,
    auditRows,
  };
}

async function run() {
  const result = await auditAllStories();
  console.log('========================================================================================');
  console.log(`STORY AUDIT REPORT — STRICT PUBLICATION DATE GATING (Timezone: ${SOJITZ_TIMEZONE})`);
  console.log(`Target Daily Brief Date: ${result.currentDailyDate}`);
  console.log(`Total Stories Evaluated: ${result.totalEvaluated}`);
  console.log(`Eligible for Today's Feed (/today): ${result.dailyEligibleCount}`);
  console.log(`Excluded from Today's Feed: ${result.dailyExcludedCount}`);
  console.log(`Eligible for Current Week Briefing: ${result.weeklyEligibleCount}`);
  console.log('========================================================================================\n');

  result.auditRows.forEach((r, idx) => {
    console.log(`--- [Story ${idx + 1}] ---`);
    console.log(`story_title:                   ${r.story_title}`);
    console.log(`source_published_at:           ${r.source_published_at}`);
    console.log(`source_publication_date_local: ${r.source_publication_date_local}`);
    console.log(`daily_brief_date:              ${r.daily_brief_date}`);
    console.log(`event_date:                    ${r.event_date}`);
    console.log(`fetched_at:                    ${r.fetched_at}`);
    console.log(`daily_eligible_today:          ${r.daily_eligible_today ? 'YES' : 'NO'}`);
    console.log(`weekly_eligible:               ${r.weekly_eligible ? 'YES' : 'NO'}`);
    console.log(`reason:                        ${r.reason}\n`);
  });

  process.exit(0);
}

if (require.main === module) {
  run().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
