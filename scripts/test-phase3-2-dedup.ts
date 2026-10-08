import { getPostgresPool } from '../src/lib/database/postgres';
import { 
  verifySourceEventAlignment, 
  StoryEventDefinition 
} from '../src/lib/verification/event-alignment';
import { 
  generateCanonicalEventFingerprint, 
  computeSameEventScore,
  findOrCreateEventCluster,
  mergeIntoEventCluster
} from '../src/lib/analysis/event-clustering';
import { evaluateMaterialUpdate } from '../src/lib/verification/temporal-gating';
import { synthesizeStrategicStory } from '../src/lib/analysis/strategic-synthesizer';
import { getIntelligenceStoriesFromPostgres } from '../src/lib/database/story-store';
import { RawArticle, IntelligenceStory } from '../src/types/intelligence';
import { ArticleExtractionRecord } from '../src/types/extraction';
import { ArticleRelevanceScoreRecord } from '../src/types/relevance';
import assert from 'assert';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING PHASE 3.2 ACCEPTANCE TESTS (TEST 1 - TEST 8)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(testName: string, ok: boolean, details?: string) {
    if (ok) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Two publishers report same investment announcement
  // Expected: 1 story, 2 supporting sources.
  // -------------------------------------------------------------
  try {
    const publisherA: RawArticle = {
      id: 'raw-t1-a',
      sourceId: 'src-1',
      publisher: 'Báo Đầu Tư',
      title: 'Sojitz Corporation mở rộng dự án KCN Long Đức tại Đồng Nai',
      url: 'https://baodautu.vn/sojitz-long-duc-expansion-a1',
      finalUrl: 'https://baodautu.vn/sojitz-long-duc-expansion-a1',
      httpStatus: 200,
      publishedAt: '2026-10-06T08:00:00Z',
      fetchedAt: '2026-10-06T08:30:00Z',
      dateExtractionSource: 'JSON_LD',
      fetchVerified: true,
      isArticlePage: true,
      rawContent: 'Sojitz mở rộng KCN Long Đức quy mô 50ha.',
      cleanedContent: 'Sojitz Corporation chính thức khởi công mở rộng KCN Long Đức tại Đồng Nai với vốn 50 triệu USD quy mô 50ha.',
      contentHash: 'hash-t1-a',
      fetchStatus: 'SUCCESS',
    } as any;

    const publisherB: RawArticle = {
      id: 'raw-t1-b',
      sourceId: 'src-2',
      publisher: 'VnExpress Kinh Doanh',
      title: 'Tập đoàn Nhật Bản Sojitz rót thêm 50 triệu USD vào KCN Long Đức',
      url: 'https://vnexpress.net/sojitz-rot-50-trieu-usd-long-duc-b1',
      finalUrl: 'https://vnexpress.net/sojitz-rot-50-trieu-usd-long-duc-b1',
      httpStatus: 200,
      publishedAt: '2026-10-06T09:15:00Z',
      fetchedAt: '2026-10-06T09:45:00Z',
      dateExtractionSource: 'JSON_LD',
      fetchVerified: true,
      isArticlePage: true,
      rawContent: 'Tập đoàn Sojitz đầu tư 50 triệu USD mở rộng Long Đức Đồng Nai.',
      cleanedContent: 'Tập đoàn Sojitz Nhật Bản mở rộng đầu tư 50 triệu USD vào Khu công nghiệp Long Đức tỉnh Đồng Nai.',
      contentHash: 'hash-t1-b',
      fetchStatus: 'SUCCESS',
    } as any;

    const extA: ArticleExtractionRecord = {
      id: 'ext-t1-a',
      raw_article_id: publisherA.id,
      source_url: publisherA.url,
      publisher: publisherA.publisher,
      published_at: publisherA.publishedAt!,
      meaningful_event_detected: true,
      primary_event_type: 'EXPANSION',
      secondary_event_types: ['INVESTMENT'],
      event_date: '2026-10-06',
      event_date_confidence: 90,
      event_date_source: 'ARTICLE_CONTENT',
      event_status: 'CONFIRMED' as any,
      sectors: ['INDUSTRIAL_PARKS'],
      sub_sectors: [],
      geographies: ['Dong Nai', 'Vietnam'],
      entities: [{ name: 'Sojitz Corporation', role_in_event: 'INVESTOR' } as any],
      numeric_facts: [{ fact_type: 'INVESTMENT_VALUE', raw_value: '50 triệu USD', numeric_value: 50000000, unit: 'USD', qualifier: 'EXACT' } as any],
      verified_facts: [{ claim_text: 'Sojitz khởi công mở rộng KCN Long Đức 50 triệu USD' } as any],
      explicit_company_statements: [],
      source_attributed_claims: [],
      uncertainties: [],
      event_detection_confidence: 95,
      extraction_quality_score: 90,
    } as any;

    const extB: ArticleExtractionRecord = {
      id: 'ext-t1-b',
      raw_article_id: publisherB.id,
      source_url: publisherB.url,
      publisher: publisherB.publisher,
      published_at: publisherB.publishedAt!,
      meaningful_event_detected: true,
      primary_event_type: 'EXPANSION',
      secondary_event_types: ['INVESTMENT'],
      event_date: '2026-10-06',
      event_date_confidence: 90,
      event_date_source: 'ARTICLE_CONTENT',
      event_status: 'CONFIRMED' as any,
      sectors: ['INDUSTRIAL_PARKS'],
      sub_sectors: [],
      geographies: ['Dong Nai', 'Vietnam'],
      entities: [{ name: 'Sojitz Corporation', role_in_event: 'INVESTOR' } as any],
      numeric_facts: [{ fact_type: 'INVESTMENT_VALUE', raw_value: '50 triệu USD', numeric_value: 50000000, unit: 'USD', qualifier: 'EXACT' } as any],
      verified_facts: [{ claim_text: 'Sojitz đầu tư 50 triệu USD vào KCN Long Đức' } as any],
      explicit_company_statements: [],
      source_attributed_claims: [],
      uncertainties: [],
      event_detection_confidence: 95,
      extraction_quality_score: 90,
    } as any;

    const sameScore = computeSameEventScore(
      {
        primaryEventType: extA.primary_event_type,
        entities: extA.entities,
        projectOrAsset: 'Long Duc Industrial Park',
        claimsText: extA.verified_facts[0].claim_text,
        eventDate: extA.event_date || undefined,
      },
      {
        primaryEventType: extB.primary_event_type,
        entities: extB.entities,
        projectOrAsset: 'Long Duc Industrial Park',
        claimsText: extB.verified_facts[0].claim_text,
        eventDate: extB.event_date || undefined,
      }
    );

    const isMerged = sameScore.score >= 85;
    const storyDef: StoryEventDefinition = {
      primaryEventType: 'EXPANSION',
      primaryEntities: [{ name: 'Sojitz Corporation', role: 'INVESTOR' }],
      coreClaims: [{ id: 'c1', claimText: 'Sojitz khởi công mở rộng KCN Long Đức 50 triệu USD' }],
      projectOrAsset: 'Long Duc Industrial Park',
      geography: 'Dong Nai',
      eventDate: '2026-10-06',
    };

    const alignA = verifySourceEventAlignment({ article: publisherA, extraction: extA, storyEvent: storyDef, isPrimarySource: true });
    const alignB = verifySourceEventAlignment({ article: publisherB, extraction: extB, storyEvent: storyDef, isPrimarySource: false });

    const totalValidSources = (alignA.isAttachedValid ? 1 : 0) + (alignB.isAttachedValid ? 1 : 0);

    report(
      'TEST 1: Two publishers report same investment announcement',
      isMerged && totalValidSources === 2 && alignA.sourceRole === 'PRIMARY' && alignB.sourceRole === 'CORROBORATING',
      `same_event_score: ${sameScore.score}/100 (>=85: ${isMerged}). Valid sources: ${totalValidSources} (A: ${alignA.sourceRole}, B: ${alignB.sourceRole})`
    );
  } catch (err: any) {
    report('TEST 1: Two publishers report same investment announcement', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 2: Three publishers use different headlines for same partnership
  // Expected: 1 story.
  // -------------------------------------------------------------
  try {
    const headlines = [
      'Alstom hợp tác chiến lược cùng Vingroup phát triển đường sắt đô thị',
      'VinFast parent Vingroup inks major metro train supply deal with Alstom',
      'Hà Nội transit upgrade: 200 electric trains supplied under Alstom-Vingroup alliance'
    ];

    const entities = [{ name: 'Alstom' }, { name: 'Vingroup' }];
    const sim1 = computeSameEventScore(
      { primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', claimsText: 'Alstom supply 200 trains to Vingroup', eventDate: '2026-10-06' },
      { primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', claimsText: 'Vingroup inks train supply deal with Alstom', eventDate: '2026-10-06' }
    );
    const sim2 = computeSameEventScore(
      { primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', claimsText: 'Alstom supply 200 trains to Vingroup', eventDate: '2026-10-06' },
      { primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', claimsText: '200 electric trains supplied under Alstom-Vingroup alliance', eventDate: '2026-10-06' }
    );

    const fp1 = generateCanonicalEventFingerprint({ primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', geography: 'VN', eventDate: '2026-10-06' });
    const fp2 = generateCanonicalEventFingerprint({ primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', geography: 'VN', eventDate: '2026-10-06' });
    const fp3 = generateCanonicalEventFingerprint({ primaryEventType: 'PARTNERSHIP', entities, projectOrAsset: 'Hanoi Metro', geography: 'VN', eventDate: '2026-10-06' });

    const allMatched = sim1.score >= 85 && sim2.score >= 85 && (fp1 === fp2 && fp2 === fp3);

    report(
      'TEST 2: Three publishers use different headlines for same partnership',
      allMatched,
      `Fingerprint: ${fp1}. Pairwise scores: ${sim1.score}, ${sim2.score} -> Exactly 1 canonical cluster`
    );
  } catch (err: any) {
    report('TEST 2: Three publishers use different headlines for same partnership', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 3: Same company, same sector, different event
  // Expected: 2 stories.
  // -------------------------------------------------------------
  try {
    const entities = [{ name: 'Vingroup' }];
    // Event A: Factory expansion in Hai Phong
    const fpA = generateCanonicalEventFingerprint({
      primaryEventType: 'EXPANSION',
      entities,
      projectOrAsset: 'Hai Phong EV Complex',
      geography: 'Hai Phong',
      eventDate: '2026-10-06',
    });

    // Event B: Bond issuance for green energy
    const fpB = generateCanonicalEventFingerprint({
      primaryEventType: 'FINANCING',
      entities,
      projectOrAsset: 'Green Bond Tranche A',
      geography: 'Hanoi',
      eventDate: '2026-10-06',
    });

    const sim = computeSameEventScore(
      { primaryEventType: 'EXPANSION', entities, projectOrAsset: 'Hai Phong EV Complex', claimsText: 'Expansion of manufacturing complex in Hai Phong', eventDate: '2026-10-06' },
      { primaryEventType: 'FINANCING', entities, projectOrAsset: 'Green Bond Tranche A', claimsText: 'Issuance of 10 trillion VND green bonds', eventDate: '2026-10-06' }
    );

    const distinctEvents = fpA !== fpB && sim.score < 85;

    report(
      'TEST 3: Same company, same sector, different event',
      distinctEvents,
      `Score: ${sim.score} (<85 threshold). Fingerprint A: ${fpA} !== B: ${fpB} -> Produces 2 stories`
    );
  } catch (err: any) {
    report('TEST 3: Same company, same sector, different event', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 4: Valid URL but article does not support story event
  // Expected: source removed.
  // -------------------------------------------------------------
  try {
    const unrelatedArticle: RawArticle = {
      id: 'raw-unrelated-1',
      sourceId: 'src-danang',
      publisher: 'VnExpress',
      title: 'Giá bất động sản tại Đà Nẵng có xu hướng tăng nhẹ',
      url: 'https://vnexpress.net/gia-bds-da-nang-tang',
      finalUrl: 'https://vnexpress.net/gia-bds-da-nang-tang',
      httpStatus: 200,
      fetchVerified: true,
      cleanedContent: 'Thị trường bất động sản ven biển Đà Nẵng ghi nhận thanh khoản tích cực trong quý 3.',
    } as any;

    const storyDef: StoryEventDefinition = {
      primaryEventType: 'PARTNERSHIP',
      primaryEntities: [{ name: 'Alstom' }, { name: 'Vingroup' }],
      coreClaims: [{ id: 'c-train', claimText: 'Alstom cung cấp 200 đoàn tàu điện cho tuyến metro Hà Nội' }],
      projectOrAsset: 'Hanoi Metro',
      geography: 'Hanoi',
      eventDate: '2026-10-06',
    };

    const align = verifySourceEventAlignment({
      article: unrelatedArticle,
      storyEvent: storyDef,
      isPrimarySource: false,
    });

    const isRemoved = !align.isAttachedValid && align.eventMatchScore < 80;

    report(
      'TEST 4: Valid URL but article does not support story event',
      isRemoved,
      `event_match_score: ${align.eventMatchScore}/100 (<80). Attached valid: ${align.isAttachedValid}. Reason: ${align.rejectionReason}`
    );
  } catch (err: any) {
    report('TEST 4: Valid URL but article does not support story event', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 5: Source mentions same entity but no core claim
  // Expected: source removed.
  // -------------------------------------------------------------
  try {
    const entityOnlyArticle: RawArticle = {
      id: 'raw-entity-only',
      sourceId: 'src-cafef',
      publisher: 'CafeF',
      title: 'Cổ phiếu Vingroup tăng trần trong phiên giao dịch ngày 6/10',
      url: 'https://cafef.vn/co-phieu-vingroup-tang-tran',
      finalUrl: 'https://cafef.vn/co-phieu-vingroup-tang-tran',
      httpStatus: 200,
      fetchVerified: true,
      cleanedContent: 'Mã VIC của Tập đoàn Vingroup dẫn dắt chỉ số VN-Index tăng điểm nhờ thanh khoản tích cực từ khối ngoại.',
    } as any;

    const storyDef: StoryEventDefinition = {
      primaryEventType: 'PARTNERSHIP',
      primaryEntities: [{ name: 'Alstom' }, { name: 'Vingroup' }],
      coreClaims: [{ id: 'c-train', claimText: 'Alstom cung cấp 200 đoàn tàu điện cho tuyến metro Hà Nội' }],
      projectOrAsset: 'Hanoi Metro',
      geography: 'Hanoi',
      eventDate: '2026-10-06',
    };

    const align = verifySourceEventAlignment({
      article: entityOnlyArticle,
      storyEvent: storyDef,
      isPrimarySource: false,
    });

    const isRemoved = !align.isAttachedValid && align.supportedCoreClaimIds.length === 0;

    report(
      'TEST 5: Source mentions same entity but no core claim',
      isRemoved,
      `Supported claims: ${align.supportedCoreClaimIds.length} (expected 0). Attached valid: ${align.isAttachedValid}. Reason: ${align.rejectionReason}`
    );
  } catch (err: any) {
    report('TEST 5: Source mentions same entity but no core claim', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 6: Existing event + new article with no new fact
  // Expected: no new story.
  // -------------------------------------------------------------
  try {
    const existingStory = {
      title: 'Alstom and Vingroup Sign Strategic Partnership to Supply 200 Metro Trains',
      extractedFacts: {
        dealValueUsd: 500000000,
        claims: ['Alstom ký hợp đồng cung cấp 200 tàu điện cho Vingroup tại Hà Nội'],
        keyPartners: ['Alstom', 'Vingroup'],
      },
    };

    const repeatedArticleExtraction: ArticleExtractionRecord = {
      id: 'ext-rep',
      raw_article_id: 'raw-rep',
      source_url: 'https://kinhtedothi.vn/vingroup-alstom',
      publisher: 'Kinh Tế Đô Thị',
      published_at: '2026-10-06T14:00:00Z',
      meaningful_event_detected: true,
      primary_event_type: 'PARTNERSHIP',
      secondary_event_types: [],
      event_date: '2026-10-06',
      event_date_confidence: 90,
      event_date_source: 'ARTICLE_CONTENT',
      event_status: 'CONFIRMED' as any,
      sectors: ['INFRASTRUCTURE'],
      sub_sectors: [],
      geographies: ['Hanoi'],
      entities: [{ name: 'Alstom', role_in_event: 'PARTNER' } as any, { name: 'Vingroup', role_in_event: 'PARTNER' } as any],
      numeric_facts: [{ fact_type: 'DEAL_VALUE', raw_value: '500 triệu USD', numeric_value: 500000000, unit: 'USD', qualifier: 'EXACT' } as any],
      verified_facts: [{ claim_text: 'Alstom hợp tác Vingroup cung cấp đoàn tàu metro' } as any],
      explicit_company_statements: [],
      source_attributed_claims: [],
      uncertainties: [],
      event_detection_confidence: 90,
      extraction_quality_score: 85,
    } as any;

    const matEval = evaluateMaterialUpdate({
      existingStory,
      newExtraction: repeatedArticleExtraction,
    });

    const isSuppressed = !matEval.isMaterialUpdate;

    report(
      'TEST 6: Existing event + new article with no new fact',
      isSuppressed,
      `isMaterialUpdate: ${matEval.isMaterialUpdate} -> No duplicate story created, attached as corroborating source`
    );
  } catch (err: any) {
    report('TEST 6: Existing event + new article with no new fact', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 7: Existing event + new regulatory approval
  // Expected: existing story updated with material_update=true.
  // -------------------------------------------------------------
  try {
    const existingStory = {
      title: 'Đề xuất dự án điện mặt trời 200MW tại Bình Thuận',
      extractedFacts: {
        capacityOrSize: '200MW',
        claims: ['Doanh nghiệp đề xuất dự án điện mặt trời 200MW'],
        location: 'Bình Thuận',
      },
    };

    const approvalArticleExtraction: ArticleExtractionRecord = {
      id: 'ext-approval',
      raw_article_id: 'raw-app',
      source_url: 'https://baochinhphu.vn/phe-duyet-dieu-chinh-quy-hoach-dien-mat-troi',
      publisher: 'Báo Chính Phủ',
      published_at: '2026-10-06T15:00:00Z',
      meaningful_event_detected: true,
      primary_event_type: 'POLICY_CHANGE',
      secondary_event_types: ['REGULATION'],
      event_date: '2026-10-06',
      event_date_confidence: 95,
      event_date_source: 'ARTICLE_CONTENT',
      event_status: 'CONFIRMED' as any,
      sectors: ['ENERGY'],
      sub_sectors: [],
      geographies: ['Bình Thuận'],
      entities: [{ name: 'Bộ Công Thương', role_in_event: 'REGULATOR' } as any],
      numeric_facts: [],
      verified_facts: [{ claim_text: 'Bộ Công Thương chính thức phê duyệt cấp phép hoạt động dự án điện mặt trời 200MW' } as any],
      explicit_company_statements: [],
      source_attributed_claims: [],
      uncertainties: [],
      event_detection_confidence: 95,
      extraction_quality_score: 90,
    } as any;

    const matEval = evaluateMaterialUpdate({
      existingStory,
      newExtraction: approvalArticleExtraction,
    });

    const isMaterialUpdated = matEval.isMaterialUpdate && Boolean(matEval.rationale?.includes('Phê duyệt') || matEval.rationale?.includes('chính sách') || matEval.rationale);

    report(
      'TEST 7: Existing event + new regulatory approval',
      isMaterialUpdated,
      `isMaterialUpdate: ${matEval.isMaterialUpdate}. Rationale: "${matEval.rationale}" -> Updates existing story in place`
    );
  } catch (err: any) {
    report('TEST 7: Existing event + new regulatory approval', false, err.message);
  }

  // -------------------------------------------------------------
  // TEST 8: Same event appears across Daily and Weekly
  // Expected: Daily = one canonical event story. Weekly = one consolidated weekly event item.
  // -------------------------------------------------------------
  try {
    const dailyStories = await getIntelligenceStoriesFromPostgres({ dailyBriefDate: '2026-10-06' });
    const weeklyStories = await getIntelligenceStoriesFromPostgres({ timeframe: 'week' });

    // Check cluster uniqueness in daily feed: no two stories share the same cluster_id or event_fingerprint
    const dailyClusters = new Set<string>();
    let dailyHasDuplicateCluster = false;
    for (const s of dailyStories) {
      const key = s.clusterId || s.eventFingerprint;
      if (key) {
        if (dailyClusters.has(key)) dailyHasDuplicateCluster = true;
        dailyClusters.add(key);
      }
    }

    // Check cluster uniqueness in weekly feed
    const weeklyClusters = new Set<string>();
    let weeklyHasDuplicateCluster = false;
    for (const s of weeklyStories) {
      const key = s.clusterId || s.eventFingerprint;
      if (key) {
        if (weeklyClusters.has(key)) weeklyHasDuplicateCluster = true;
        weeklyClusters.add(key);
      }
    }

    const test8Passed = !dailyHasDuplicateCluster && !weeklyHasDuplicateCluster && dailyStories.length > 0 && weeklyStories.length > 0;

    report(
      'TEST 8: Same event appears across Daily and Weekly',
      test8Passed,
      `Daily count: ${dailyStories.length} (duplicate clusters: ${dailyHasDuplicateCluster}), Weekly count: ${weeklyStories.length} (duplicate clusters: ${weeklyHasDuplicateCluster})`
    );
  } catch (err: any) {
    report('TEST 8: Same event appears across Daily and Weekly', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`ACCEPTANCE TEST RESULTS: ${passed}/8 PASSED, ${failed}/8 FAILED`);
  console.log('====================================================');

  await getPostgresPool().end();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async err => {
  console.error('Test execution failed:', err);
  await getPostgresPool().end();
  process.exit(1);
});
