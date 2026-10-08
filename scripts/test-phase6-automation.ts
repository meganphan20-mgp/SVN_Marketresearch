import { getPostgresPool } from '../src/lib/database/postgres';
import { runDailyIntelligenceOrchestrator } from '../src/lib/orchestration/daily-pipeline-orchestrator';
import { weeklySynthesizer } from '../src/lib/ai/weekly-synthesizer';
import { getWeeklyReports, getWeeklyReport } from '../src/lib/data/intelligence-store';
import { getCalendarWeekBoundariesLocal } from '../src/lib/utils/date-boundaries';

async function runAutomationTest() {
  console.log('================================================================');
  console.log('🧪 TESTING PHASE 6: AUTOMATION & SCHEDULED WORKFLOWS');
  console.log('================================================================\n');

  const pool = getPostgresPool();

  // Test 1: Daily Pipeline Orchestrator (5 Roles Sequentially)
  console.log('--- TEST 1: End-to-End Daily 5-Role Pipeline Orchestration ---');
  // Use a targeted subset of sources (Tier 1 & Tier 2) to test fast and reliably
  const targetSources = ['src-baodautu', 'src-theinvestor'];
  const dailyResult = await runDailyIntelligenceOrchestrator({
    sourceIds: targetSources,
    maxArticlesPerSource: 2,
    minRelevanceScore: 4,
  });

  console.log('Daily Orchestration Result Status:', dailyResult.status);
  console.log('Role 1 (Research Scanner):', dailyResult.roles.role1_research_scanner);
  console.log('Role 3 (Fact & Event Analyst):', dailyResult.roles.role3_fact_event_analyst);
  console.log('Role 2 (Market Intelligence Analyst):', dailyResult.roles.role2_market_intelligence_analyst);
  console.log('Roles 4 & 5 (Strategy & BD Analyst):', {
    candidatesEvaluated: dailyResult.roles.role4_and_5_strategy_bd_analyst.candidatesEvaluated,
    storiesPublished: dailyResult.roles.role4_and_5_strategy_bd_analyst.storiesPublished,
    storiesRejectedByGate: dailyResult.roles.role4_and_5_strategy_bd_analyst.storiesRejectedByGate,
  });
  console.log(`Published Stories: ${dailyResult.publishedStories.length}`);
  console.log(`Total Execution Duration: ${dailyResult.executionDurationMs}ms\n`);

  if (dailyResult.status !== 'success') {
    throw new Error('Daily pipeline orchestrator failed');
  }

  // Test 2: Friday Weekly Executive Briefing Compilation
  console.log('--- TEST 2: Weekly Executive Briefing Synthesis & Persistence ---');
  const boundaries = getCalendarWeekBoundariesLocal();
  console.log(`Current Week Boundaries (Asia/Ho_Chi_Minh): Week ${boundaries.weekNumber}, ${boundaries.year} (${boundaries.weekStart} to ${boundaries.weekEnd})`);

  const report = await weeklySynthesizer.generateWeeklyReport({
    year: boundaries.year,
    weekNumber: boundaries.weekNumber,
    startDate: boundaries.weekStart,
    endDate: boundaries.weekEnd,
  });

  console.log('Generated Weekly Report:');
  console.log(`- ID: ${report.id}`);
  console.log(`- Title: ${report.title}`);
  console.log(`- Slug: ${report.slug}`);
  console.log(`- Date Range: ${report.startDate} to ${report.endDate}`);
  console.log(`- Executive Summary (${report.executiveSummary.length} chars)`);
  console.log(`- Top Developments Count: ${report.topDevelopments?.length}`);
  console.log(`- Business Opportunities Count: ${report.topBusinessOpportunities?.length}`);
  console.log(`- Sector Intelligence Items: ${report.sectorIntelligence?.length}`);
  console.log(`- Suggested BD Actions: ${report.suggestedBdActions?.length}`);

  // Test 3: Verify Persistence in PostgreSQL weekly_reports table
  console.log('\n--- TEST 3: Verifying PostgreSQL weekly_reports Database Storage ---');
  const pgCheck = await pool.query(`
    SELECT id, year, week_number, start_date, end_date, title, slug, is_published, created_at
    FROM public.weekly_reports
    WHERE slug = $1;
  `, [report.slug]);

  if (pgCheck.rows.length === 0) {
    throw new Error(`Report with slug ${report.slug} not found in public.weekly_reports table!`);
  }

  console.log('✅ PostgreSQL Record Verified:');
  console.log(pgCheck.rows[0]);

  // Test 4: Query via IntelligenceStore
  console.log('\n--- TEST 4: Verifying IntelligenceStore Integration ---');
  const allReports = await getWeeklyReports();
  console.log(`Total Weekly Reports in Store: ${allReports.length}`);
  const fetchedReport = await getWeeklyReport(report.slug);
  if (!fetchedReport || fetchedReport.slug !== report.slug) {
    throw new Error(`Failed to fetch report by slug "${report.slug}" from intelligence store!`);
  }
  console.log(`✅ Successfully fetched report "${fetchedReport.title}" by slug "${report.slug}" from intelligence store.`);

  console.log('\n================================================================');
  console.log('🎉 ALL PHASE 6 AUTOMATION TESTS PASSED CLEANLY!');
  console.log('================================================================');
  process.exit(0);
}

runAutomationTest().catch(err => {
  console.error('❌ Phase 6 Automation Test Failed:', err);
  process.exit(1);
});
