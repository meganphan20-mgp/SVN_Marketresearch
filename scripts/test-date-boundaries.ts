import { 
  getCalendarWeekBoundariesLocal, 
  getCalendarDayBoundariesLocal, 
  getLocalDateInTimeZone, 
  getTodayLocal, 
  getPublicationDateLocal,
  SOJITZ_TIMEZONE 
} from '../src/lib/utils/date-boundaries';

async function runDateBoundariesTests() {
  console.log('=================================================================');
  console.log('DATE BOUNDARIES & TEMPORAL INTEGRITY UNIT TEST SUITE');
  console.log(`Timezone: ${SOJITZ_TIMEZONE}`);
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, detail: string) {
    if (condition) {
      console.log(`[PASS] ${testName}: ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Wednesday in the middle of a week
  // Date: 2026-10-07 (Wednesday)
  // Expected Week: Monday 2026-10-05 to Sunday 2026-10-11
  // -------------------------------------------------------------
  {
    const boundaries = getCalendarWeekBoundariesLocal('2026-10-07');
    assert(
      'TEST 1.1 (Wednesday - Week Start)',
      boundaries.weekStart === '2026-10-05',
      `Week start for Wed 2026-10-07 is Mon 2026-10-05 (got: ${boundaries.weekStart})`
    );
    assert(
      'TEST 1.2 (Wednesday - Week End)',
      boundaries.weekEnd === '2026-10-11',
      `Week end for Wed 2026-10-07 is Sun 2026-10-11 (got: ${boundaries.weekEnd})`
    );
    assert(
      'TEST 1.3 (Wednesday - Timestamps)',
      boundaries.weekStartTimestamp === '2026-10-05T00:00:00.000+07:00' &&
      boundaries.weekEndTimestamp === '2026-10-11T23:59:59.999+07:00',
      `Exact UTC+7 timestamps generated correctly`
    );
  }

  // -------------------------------------------------------------
  // TEST 2: Monday boundary
  // Date: 2026-10-05 (Monday)
  // Expected Week: Monday 2026-10-05 to Sunday 2026-10-11
  // -------------------------------------------------------------
  {
    const boundaries = getCalendarWeekBoundariesLocal('2026-10-05');
    assert(
      'TEST 2.1 (Monday Boundary - Week Start)',
      boundaries.weekStart === '2026-10-05',
      `Week start for Mon 2026-10-05 is Mon 2026-10-05 (got: ${boundaries.weekStart})`
    );
    assert(
      'TEST 2.2 (Monday Boundary - Week End)',
      boundaries.weekEnd === '2026-10-11',
      `Week end for Mon 2026-10-05 is Sun 2026-10-11 (got: ${boundaries.weekEnd})`
    );
  }

  // -------------------------------------------------------------
  // TEST 3: Sunday boundary
  // Date: 2026-10-11 (Sunday)
  // Expected Week: Monday 2026-10-05 to Sunday 2026-10-11
  // -------------------------------------------------------------
  {
    const boundaries = getCalendarWeekBoundariesLocal('2026-10-11');
    assert(
      'TEST 3.1 (Sunday Boundary - Week Start)',
      boundaries.weekStart === '2026-10-05',
      `Week start for Sun 2026-10-11 is Mon 2026-10-05 (got: ${boundaries.weekStart})`
    );
    assert(
      'TEST 3.2 (Sunday Boundary - Week End)',
      boundaries.weekEnd === '2026-10-11',
      `Week end for Sun 2026-10-11 is Sun 2026-10-11 (got: ${boundaries.weekEnd})`
    );
  }

  // -------------------------------------------------------------
  // TEST 4: Month transition
  // Date: 2026-10-01 (Thursday)
  // Expected Week: Monday 2026-09-28 (September) to Sunday 2026-10-04 (October)
  // -------------------------------------------------------------
  {
    const boundaries = getCalendarWeekBoundariesLocal('2026-10-01');
    assert(
      'TEST 4.1 (Month Transition - Week Start)',
      boundaries.weekStart === '2026-09-28',
      `Week start for Thu 2026-10-01 spans backwards to Mon 2026-09-28 (got: ${boundaries.weekStart})`
    );
    assert(
      'TEST 4.2 (Month Transition - Week End)',
      boundaries.weekEnd === '2026-10-04',
      `Week end for Thu 2026-10-01 spans forwards to Sun 2026-10-04 (got: ${boundaries.weekEnd})`
    );
  }

  // -------------------------------------------------------------
  // TEST 5: Year transition
  // Date: 2025-01-01 (Wednesday)
  // Expected Week: Monday 2024-12-30 (Previous Year) to Sunday 2025-01-05 (New Year)
  // -------------------------------------------------------------
  {
    const boundaries = getCalendarWeekBoundariesLocal('2025-01-01');
    assert(
      'TEST 5.1 (Year Transition - Week Start)',
      boundaries.weekStart === '2024-12-30',
      `Week start for Wed 2025-01-01 spans back to Mon 2024-12-30 (got: ${boundaries.weekStart})`
    );
    assert(
      'TEST 5.2 (Year Transition - Week End)',
      boundaries.weekEnd === '2025-01-05',
      `Week end for Wed 2025-01-01 spans forward to Sun 2025-01-05 (got: ${boundaries.weekEnd})`
    );
    assert(
      'TEST 5.3 (Year Transition - UTC offset check)',
      boundaries.startDate.toISOString() === '2024-12-29T17:00:00.000Z' &&
      boundaries.endDate.toISOString() === '2025-01-05T16:59:59.999Z',
      `UTC translation matches UTC+7 (got: ${boundaries.startDate.toISOString()} - ${boundaries.endDate.toISOString()})`
    );
  }

  // -------------------------------------------------------------
  // TEST 6: Calendar Day Boundaries
  // Date: 2026-10-07
  // -------------------------------------------------------------
  {
    const day = getCalendarDayBoundariesLocal('2026-10-07');
    assert(
      'TEST 6.1 (Calendar Day DateStr)',
      day.dateStr === '2026-10-07',
      `DateStr is 2026-10-07`
    );
    assert(
      'TEST 6.2 (Calendar Day Timestamps)',
      day.dayStartTimestamp === '2026-10-07T00:00:00.000+07:00' &&
      day.dayEndTimestamp === '2026-10-07T23:59:59.999+07:00',
      `Day boundaries span 00:00:00.000 to 23:59:59.999 in UTC+7`
    );
  }

  // -------------------------------------------------------------
  // TEST 7: getLocalDateInTimeZone & getPublicationDateLocal
  // -------------------------------------------------------------
  {
    // 2026-10-06T18:00:00Z -> UTC+7 is 2026-10-07 01:00:00 (Next day in Vietnam)
    const localDateNext = getPublicationDateLocal('2026-10-06T18:00:00Z');
    assert(
      'TEST 7.1 (UTC to Asia/Ho_Chi_Minh shift)',
      localDateNext === '2026-10-07',
      `2026-10-06 18:00 UTC shifts to 2026-10-07 in Asia/Ho_Chi_Minh (got: ${localDateNext})`
    );

    // 2026-10-06T15:00:00Z -> UTC+7 is 2026-10-06 22:00:00 (Same day in Vietnam)
    const localDateSame = getPublicationDateLocal('2026-10-06T15:00:00Z');
    assert(
      'TEST 7.2 (UTC to Asia/Ho_Chi_Minh evening)',
      localDateSame === '2026-10-06',
      `2026-10-06 15:00 UTC stays 2026-10-06 in Asia/Ho_Chi_Minh (got: ${localDateSame})`
    );
  }

  console.log('\n=================================================================');
  console.log(`UNIT TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED.`);
  console.log('=================================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runDateBoundariesTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
