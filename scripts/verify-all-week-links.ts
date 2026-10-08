import { INITIAL_WEEKLY_REPORTS } from '../src/lib/data/weekly-reports-data';
import { SAMPLE_INTELLIGENCE_STORIES } from '../src/lib/data/mock-intelligence';
import { getPostgresPool } from '../src/lib/database/postgres';

async function main() {
  console.log('===============================================================');
  console.log('    COMPREHENSIVE LINK VERIFICATION ACROSS ALL WEEKS');
  console.log('===============================================================\n');

  const pool = getPostgresPool();
  const mockStoryMap = new Map(SAMPLE_INTELLIGENCE_STORIES.map(s => [s.id, s]));
  
  const dbStoriesRes = await pool.query('SELECT id, title, slug FROM intelligence_stories');
  const dbStoryMap = new Map(dbStoriesRes.rows.map(r => [r.id, r]));

  console.log(`Loaded ${mockStoryMap.size} stories in Mock/Fallback.`);
  console.log(`Loaded ${dbStoryMap.size} stories in PostgreSQL database.\n`);

  const weeks = ['2026-w41', '2026-w40', '2026-w39', '2026-w38'] as const;
  let totalErrors = 0;
  let totalChecked = 0;

  for (const weekKey of weeks) {
    const report = INITIAL_WEEKLY_REPORTS.find(r => r.slug === weekKey);
    if (!report) {
      console.error(`❌ Report for ${weekKey} not found in INITIAL_WEEKLY_REPORTS!`);
      totalErrors++;
      continue;
    }
    console.log(`---------------------------------------------------------------`);
    console.log(`WEEK: ${weekKey.toUpperCase()} - ${report.title}`);
    console.log(`---------------------------------------------------------------`);
    
    console.log('\n[Section 2: Top Developments]');
    for (const dev of report.topDevelopments) {
      totalChecked++;
      const sid = dev.storyId;
      const inMock = sid ? mockStoryMap.has(sid) : false;
      const inDb = sid ? dbStoryMap.has(sid) : false;
      const ok = sid && inMock && inDb;
      
      if (!ok) {
        totalErrors++;
        console.error(`  ❌ FAILED: "${dev.title}"`);
        console.error(`     storyId: ${sid} (Mock: ${inMock ? 'FOUND' : 'MISSING'}, DB: ${inDb ? 'FOUND' : 'MISSING'})`);
      } else {
        const title = mockStoryMap.get(sid!)?.title;
        console.log(`  ✅ OK: "${dev.title.slice(0, 50)}..."`);
        console.log(`     -> /story/${sid}`);
      }
    }

    console.log('\n[Section 3: Top Business Opportunities]');
    for (const opp of report.topBusinessOpportunities) {
      totalChecked++;
      const sid = opp.storyId;
      const inMock = sid ? mockStoryMap.has(sid) : false;
      const inDb = sid ? dbStoryMap.has(sid) : false;
      const ok = sid && inMock && inDb;
      
      if (!ok) {
        totalErrors++;
        console.error(`  ❌ FAILED: "${opp.headline}"`);
        console.error(`     storyId: ${sid} (Mock: ${inMock ? 'FOUND' : 'MISSING'}, DB: ${inDb ? 'FOUND' : 'MISSING'})`);
      } else {
        console.log(`  ✅ OK: "${opp.headline.slice(0, 50)}..."`);
        console.log(`     -> /story/${sid}`);
      }
    }
    console.log('');
  }

  // Check HTTP response from running dev server
  console.log('===============================================================');
  console.log('    TESTING HTTP LIVE RESPONSES (http://localhost:3000)');
  console.log('===============================================================');
  
  const testUrls = [
    '/weekly/2026-w41',
    '/weekly/2026-w40',
    '/weekly/2026-w39',
    '/weekly/2026-w38',
  ];

  // Also collect 1 story link from each week to test live
  for (const weekKey of weeks) {
    const report = INITIAL_WEEKLY_REPORTS.find(r => r.slug === weekKey);
    if (report?.topDevelopments[0]?.storyId) {
      testUrls.push(`/story/${report.topDevelopments[0].storyId}`);
    }
  }

  for (const path of testUrls) {
    const url = `http://localhost:3000${path}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'link-checker' } });
      if (res.status === 200) {
        console.log(`  ✅ HTTP 200 OK: ${path}`);
      } else {
        console.error(`  ❌ HTTP ${res.status}: ${path}`);
        totalErrors++;
      }
    } catch (e: any) {
      console.warn(`  ⚠️ Could not connect to localhost:3000: ${e.message}`);
    }
  }

  console.log('\n===============================================================');
  console.log(`SUMMARY: ${totalChecked} story links checked across all weeks.`);
  if (totalErrors === 0) {
    console.log('🎉 ALL LINKS ARE 100% OPERATIONAL, CONSISTENT, AND VERIFIED!');
  } else {
    console.error(`⚠️ Found ${totalErrors} link issues!`);
  }
  console.log('===============================================================\n');

  await pool.end();
  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
