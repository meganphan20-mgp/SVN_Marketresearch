import { 
  getPublicationDateLocal, 
  getTodayLocal, 
  getCalendarWeekBoundariesLocal, 
  isEligibleForDailyBrief, 
  isEligibleForWeeklyBrief, 
  generateEventFingerprint, 
  evaluateMaterialUpdate,
  SOJITZ_TIMEZONE 
} from '../src/lib/verification/temporal-gating';

async function runPhase31Tests() {
  console.log('=================================================================');
  console.log('PHASE 3.1: STRICT PUBLICATION-DATE GATING & DEDUPLICATION TEST SUITE');
  console.log(`Timezone: ${SOJITZ_TIMEZONE}`);
  console.log('=================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(testName: string, condition: boolean, detail: string) {
    if (condition) {
      console.log(`[PASS] ${testName}: ${detail}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName}: ${detail}`);
      failedCount++;
    }
  }

  // Anchor date for simulation: 2026-10-07 (Asia/Ho_Chi_Minh)
  const targetDailyDate = '2026-10-07';

  // -------------------------------------------------------------
  // TEST A: Published today 08:00, Fetched today 09:00 -> Daily today = YES
  // -------------------------------------------------------------
  {
    // 08:00 Asia/Ho_Chi_Minh is 01:00 UTC
    const sourcePublishedAt = '2026-10-07T08:00:00+07:00';
    const fetchedAt = '2026-10-07T09:00:00+07:00';

    const result = isEligibleForDailyBrief({
      sourcePublishedAt,
      dailyBriefDate: targetDailyDate
    });

    assert(
      'TEST A',
      result.isEligible === true && result.sourcePublicationDateLocal === '2026-10-07',
      `Published today 08:00, fetched 09:00 => Daily eligible = YES (local date: ${result.sourcePublicationDateLocal})`
    );
  }

  // -------------------------------------------------------------
  // TEST B: Published yesterday 20:00, Fetched today 07:00 (Age < 24h) -> Daily today = NO
  // -------------------------------------------------------------
  {
    // Yesterday 20:00 Asia/Ho_Chi_Minh (2026-10-06T20:00:00+07:00)
    // Fetched today 07:00 (2026-10-07T07:00:00+07:00). Age is 11 hours (< 24h)
    const sourcePublishedAt = '2026-10-06T20:00:00+07:00';
    const fetchedAt = '2026-10-07T07:00:00+07:00';

    const result = isEligibleForDailyBrief({
      sourcePublishedAt,
      dailyBriefDate: targetDailyDate
    });

    assert(
      'TEST B',
      result.isEligible === false && result.sourcePublicationDateLocal === '2026-10-06',
      `Published yesterday 20:00, fetched today 07:00 (age 11h < 24h) => Daily today = NO (belongs to ${result.sourcePublicationDateLocal})`
    );
  }

  // -------------------------------------------------------------
  // TEST C: Published today, Event occurred 2 weeks ago -> Daily today = YES
  // -------------------------------------------------------------
  {
    const sourcePublishedAt = '2026-10-07T10:30:00+07:00';
    const eventDate = '2026-09-23'; // 2 weeks prior

    const result = isEligibleForDailyBrief({
      sourcePublishedAt,
      dailyBriefDate: targetDailyDate
    });

    assert(
      'TEST C',
      result.isEligible === true && result.sourcePublicationDateLocal === '2026-10-07',
      `Published today, event date was 2 weeks ago (${eventDate}) => Daily today = YES (gated by source publication date, not event date)`
    );
  }

  // -------------------------------------------------------------
  // TEST D: Published today, Fetched tomorrow -> Belongs to Daily publication date, not fetch date
  // -------------------------------------------------------------
  {
    const sourcePublishedAt = '2026-10-07T14:00:00+07:00';
    const fetchedAt = '2026-10-08T03:00:00+07:00'; // Fetched next calendar day

    const resultForOct7 = isEligibleForDailyBrief({
      sourcePublishedAt,
      dailyBriefDate: '2026-10-07'
    });

    const resultForOct8 = isEligibleForDailyBrief({
      sourcePublishedAt,
      dailyBriefDate: '2026-10-08'
    });

    assert(
      'TEST D',
      resultForOct7.isEligible === true && resultForOct8.isEligible === false,
      `Published Oct 7, fetched Oct 8 => belongs to Daily 2026-10-07 (YES), NOT Daily 2026-10-08 (NO)`
    );
  }

  // -------------------------------------------------------------
  // TEST E: Same event yesterday, rewritten by another outlet today with no new material fact
  // -> Do NOT create duplicate Daily story (material_update = false)
  // -------------------------------------------------------------
  {
    const existingStory = {
      title: 'Mitsui & Co. Dự kiến Tham gia Đường ống Khí Lô B - Ô Môn',
      eventStatus: 'ANNOUNCED',
      extractedFacts: {
        dealValueUsd: 740000000,
        dealValueText: '$740M',
      }
    };

    const newExtractionWithoutNewFact = {
      event_status: 'ANNOUNCED',
      numeric_facts: [
        { currency: 'USD', numeric_value: 740000000, raw_value: '$740M' }
      ],
      verified_facts: [
        { claim_text: 'Mitsui quan tâm đến dự án đường ống khí Lô B' }
      ],
      entities: [{ name: 'Mitsui & Co.' }]
    };

    const evalResult = evaluateMaterialUpdate({
      existingStory,
      newExtraction: newExtractionWithoutNewFact
    });

    assert(
      'TEST E',
      evalResult.isMaterialUpdate === false,
      `Repeated event with no new material fact => material_update = FALSE (duplicate suppressed: "${evalResult.rationale}")`
    );
  }

  // -------------------------------------------------------------
  // TEST F: Same event yesterday, new source today announces regulatory approval
  // -> Daily today = YES, material_update = true
  // -------------------------------------------------------------
  {
    const existingStory = {
      title: 'Mitsui & Co. Dự kiến Tham gia Đường ống Khí Lô B - Ô Môn',
      eventStatus: 'ANNOUNCED',
      extractedFacts: {
        dealValueUsd: 740000000,
      }
    };

    const newExtractionWithRegulatoryApproval = {
      event_status: 'APPROVED',
      numeric_facts: [
        { currency: 'USD', numeric_value: 740000000, raw_value: '$740M' }
      ],
      verified_facts: [
        { claim_text: 'Chính phủ chính thức cấp phép và phê duyệt hợp đồng EPC cho tập đoàn Mitsui' }
      ],
      entities: [{ name: 'Mitsui & Co.' }]
    };

    const evalResult = evaluateMaterialUpdate({
      existingStory,
      newExtraction: newExtractionWithRegulatoryApproval
    });

    assert(
      'TEST F',
      evalResult.isMaterialUpdate === true,
      `Same event yesterday, new source today announces regulatory approval => material_update = TRUE ("${evalResult.rationale}")`
    );
  }

  // -------------------------------------------------------------
  // TEST G: Source published within current Monday-Sunday week -> Weekly eligible = YES
  // -------------------------------------------------------------
  {
    // Week for 2026-10-07: Monday 2026-10-05 to Sunday 2026-10-11
    const { weekStart, weekEnd } = getCalendarWeekBoundariesLocal('2026-10-07');
    const sourcePublishedAt = '2026-10-06T11:00:00+07:00'; // Tuesday

    const result = isEligibleForWeeklyBrief({
      sourcePublishedAt,
      targetWeekDate: '2026-10-07'
    });

    assert(
      'TEST G',
      result.isEligible === true && result.weekStart === '2026-10-05' && result.weekEnd === '2026-10-11',
      `Source published on ${result.sourcePublicationDateLocal} within current week (${weekStart} to ${weekEnd}) => Weekly eligible = YES`
    );
  }

  // -------------------------------------------------------------
  // TEST H: Source published before current week -> Weekly eligible = NO
  // -------------------------------------------------------------
  {
    // Week for 2026-10-07: Monday 2026-10-05 to Sunday 2026-10-11
    // Prior Sunday was 2026-10-04
    const sourcePublishedAt = '2026-10-04T22:30:00+07:00';

    const result = isEligibleForWeeklyBrief({
      sourcePublishedAt,
      targetWeekDate: '2026-10-07'
    });

    assert(
      'TEST H',
      result.isEligible === false && result.sourcePublicationDateLocal === '2026-10-04',
      `Source published on ${result.sourcePublicationDateLocal} before Monday 2026-10-05 => Weekly eligible = NO`
    );
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n=================================================================');
  console.log(`TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED.`);
  console.log('=================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase31Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
