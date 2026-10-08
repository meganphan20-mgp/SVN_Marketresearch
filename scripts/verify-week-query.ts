import { getIntelligenceStories } from '../src/lib/data/intelligence-store';
import { getCalendarWeekBoundariesLocal } from '../src/lib/utils/date-boundaries';

async function testWeekQuery() {
  const { weekStart, weekEnd, weekStartTimestamp, weekEndTimestamp } = getCalendarWeekBoundariesLocal();
  console.log('Week boundaries for Asia/Ho_Chi_Minh:');
  console.log('  weekStart (Monday):', weekStart, `(${weekStartTimestamp})`);
  console.log('  weekEnd   (Sunday):', weekEnd, `(${weekEndTimestamp})`);

  const stories = await getIntelligenceStories({ timeframe: 'week' });
  console.log(`\nRetrieved ${stories.length} stories for current calendar week from PostgreSQL.`);
  
  let allInRange = true;
  for (const s of stories) {
    const pubDate = s.sourcePublicationDateLocal || s.publicationDate;
    const inRange = Boolean(pubDate && pubDate >= weekStart && pubDate <= weekEnd);
    if (!inRange) allInRange = false;
    console.log(`  - [${inRange ? 'VALID' : 'INVALID'}] "${s.title.slice(0, 50)}..." | pubDate: ${pubDate} (within ${weekStart}..${weekEnd})`);
  }

  if (allInRange && stories.length > 0) {
    console.log('\nSUCCESS: 100% of week stories are strictly within Monday-Sunday Asia/Ho_Chi_Minh calendar boundaries!');
    process.exit(0);
  } else if (stories.length === 0) {
    console.log('\nNo stories found in current week.');
    process.exit(0);
  } else {
    console.error('\nFAILURE: Some stories leak outside calendar week boundaries!');
    process.exit(1);
  }
}

testWeekQuery().catch(err => {
  console.error('Runtime error executing week query:', err);
  process.exit(1);
});
