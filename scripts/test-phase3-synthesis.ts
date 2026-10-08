import { getPostgresPool } from '../src/lib/database/postgres';
import { RawArticle, IntelligenceStory } from '../src/types/intelligence';
import { ArticleExtractionRecord } from '../src/types/extraction';
import { ArticleRelevanceScoreRecord } from '../src/types/relevance';
import { 
  verifyStoryClaimsAndSources, 
  verifyArticleClaimsAndContent 
} from '../src/lib/verification/claim-verifier';
import { synthesizeStrategicStory } from '../src/lib/analysis/strategic-synthesizer';
import { 
  saveStoryToPostgres, 
  getIntelligenceStoriesFromPostgres,
  getStoryByIdFromPostgres 
} from '../src/lib/database/story-store';
import { runPhase3IntelligencePipeline } from '../src/lib/analysis/phase3-pipeline';
import { getDashboardKpis } from '../src/lib/data/intelligence-store';

/**
 * PHASE 3: COMPREHENSIVE VERIFICATION & SYNTHESIS TEST SUITE
 * 
 * Verifies:
 * 1. Strict Grounding & Publication Gate Enforcement (0 source = 0 story)
 * 2. Claim-Level Verification, Alignment Scoring & Confidence Capping (1 src <= 75%, 2 src <= 95%)
 * 3. Strategic & BD Synthesis Quality (Grounded Summary, Why It Matters, Suggested BD Actions)
 * 4. Production Database Transactional Integrity (intelligence_stories, story_sources, story_companies)
 * 5. Live End-to-End Pipeline Execution on Eligible Database Articles
 */

async function runPhase3TestSuite() {
  console.log('======================================================================');
  console.log('PHASE 3: STRATEGIC SYNTHESIS & PUBLICATION GATE TEST SUITE');
  console.log('======================================================================\n');

  const pool = getPostgresPool();

  // Baseline audit
  const initialStoryCountRes = await pool.query('SELECT COUNT(*) as count FROM public.intelligence_stories');
  const initialSourcesCountRes = await pool.query('SELECT COUNT(*) as count FROM public.story_sources');
  const initialCompCountRes = await pool.query('SELECT COUNT(*) as count FROM public.story_companies');
  
  console.log(`[Baseline Audit] Initial State in PostgreSQL:`);
  console.log(`- intelligence_stories: ${initialStoryCountRes.rows[0].count}`);
  console.log(`- story_sources: ${initialSourcesCountRes.rows[0].count}`);
  console.log(`- story_companies: ${initialCompCountRes.rows[0].count}\n`);

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      testsPassed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (details) console.error(`         Details: ${details}`);
    }
  }

  // =========================================================================
  // TEST 1: STRICT GROUNDING & PUBLICATION GATE ENFORCEMENT
  // =========================================================================
  console.log('######################################################################');
  console.log('TEST 1: STRICT GROUNDING & PUBLICATION GATE ENFORCEMENT');
  console.log('######################################################################\n');

  // Case 1A: Attempt to verify candidate with 0 articles
  const zeroArticleVerif = verifyStoryClaimsAndSources({ articles: [] });
  assert(
    zeroArticleVerif.is_publishable === false && zeroArticleVerif.confidence_score === 0,
    'Publication Gate: Zero articles provided -> is_publishable must be false',
    `is_publishable=${zeroArticleVerif.is_publishable}, reason=${zeroArticleVerif.publication_gate_reason}`
  );

  // Case 1B: Attempt to save story with 0 sources to PostgreSQL
  const orphanStory: IntelligenceStory = {
    id: 'orphan-story-01',
    title: 'Hypothetical Unbacked Story',
    slug: 'hypothetical-unbacked-story',
    publicationDate: '2026-10-07',
    storyDate: '2026-10-07',
    country: 'Vietnam',
    category: 'Energy',
    primarySectorName: 'Energy',
    primarySectorSlug: 'energy',
    companiesMentioned: [],
    summary: 'Made up story from model memory.',
    whyItMattersToSojitz: 'No backing sources.',
    businessImpact: 'OPPORTUNITY',
    suggestedBdAction: 'Do nothing.',
    relevanceScore: 9,
    verificationStatus: 'UNVERIFIED',
    confidenceScore: 90,
    verificationRationale: 'Unverified',
    extractedFacts: {},
    detectedConflicts: [],
    sources: [], // ZERO SOURCES
    originalUrls: [],
    aiModelUsed: 'gpt-4o',
    dateCollected: '2026-10-07',
    collectionTimestamp: new Date().toISOString(),
    aiAnalysisTimestamp: new Date().toISOString(),
    sourceGrounded: false,
    isPublished: false,
  };

  const orphanSaveResult = await saveStoryToPostgres(orphanStory);
  assert(
    orphanSaveResult.success === false,
    'Database Gate: Rejects saving story with 0 sources',
    `Save result error: ${orphanSaveResult.error}`
  );

  // Verify that zero rows were inserted into public.intelligence_stories
  const orphanCheck = await pool.query("SELECT COUNT(*) FROM public.intelligence_stories WHERE slug = 'hypothetical-unbacked-story'");
  assert(
    parseInt(orphanCheck.rows[0].count, 10) === 0,
    'Database Integrity: Zero orphan stories persisted in intelligence_stories'
  );

  // =========================================================================
  // TEST 2: CLAIM-LEVEL VERIFICATION & CONFIDENCE HARD CAPPING
  // =========================================================================
  console.log('\n######################################################################');
  console.log('TEST 2: CLAIM-LEVEL VERIFICATION & CONFIDENCE HARD CAPPING');
  console.log('######################################################################\n');

  // Mock Article A: Real content with verified claims
  const mockArticleA: RawArticle = {
    id: 'p3-test-art-a',
    sourceId: 'src-baodautu',
    publisher: 'Báo Đầu Tư',
    title: 'Sojitz Mở rộng KCN Long Đức với Vốn Đầu tư $45M',
    originalUrl: 'https://baodautu.vn/sojitz-long-duc-45m.html',
    url: 'https://baodautu.vn/sojitz-long-duc-45m.html',
    finalUrl: 'https://baodautu.vn/sojitz-long-duc-45m.html',
    httpStatus: 200,
    publishedAt: '2026-10-07T08:00:00Z',
    fetchedAt: '2026-10-07T09:00:00Z',
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 1.0,
    isTimestampSuspicious: false,
    rawContent: 'Tập đoàn Sojitz Corporation cùng liên doanh KCN Long Đức công bố đầu tư 45 triệu USD mở rộng hạ tầng khu công nghiệp tại tỉnh Đồng Nai vào ngày 07/10/2026.',
    rawContentBytes: 250,
    rawContentTruncated: false,
    cleanedContent: 'Tập đoàn Sojitz Corporation cùng liên doanh KCN Long Đức công bố đầu tư 45 triệu USD mở rộng hạ tầng khu công nghiệp tại tỉnh Đồng Nai vào ngày 07/10/2026.',
    contentHash: 'hash-mock-a',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const mockExtractionA: ArticleExtractionRecord = {
    id: 'ext-mock-a',
    raw_article_id: mockArticleA.id,
    source_url: mockArticleA.url,
    publisher: mockArticleA.publisher,
    published_at: mockArticleA.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'EXPANSION',
    secondary_event_types: ['NEW_FACTORY'],
    event_date: '2026-10-07',
    event_date_confidence: 90,
    event_date_source: 'ARTICLE_CONTENT',
    event_status: 'ANNOUNCED',
    sectors: ['Industrial Parks', 'Infrastructure'],
    sub_sectors: [],
    geographies: ['Đồng Nai'],
    entities: [
      { name: 'Sojitz Corporation', entity_type: 'COMPANY', role_in_event: 'INVESTOR', aliases_found: [] },
      { name: 'KCN Long Đức', entity_type: 'PROJECT', role_in_event: 'SUBJECT', aliases_found: [] }
    ],
    numeric_facts: [
      { fact_type: 'DEAL_VALUE', raw_value: '45 triệu USD', numeric_value: 45000000, currency: 'USD', unit: 'USD', qualifier: 'EXACT', source_text: '45 triệu USD' }
    ],
    verified_facts: [
      {
        claim_id: 'cl-01',
        claim_text: 'Sojitz đầu tư 45 triệu USD mở rộng hạ tầng KCN Long Đức',
        evidence_text: 'đầu tư 45 triệu USD mở rộng hạ tầng khu công nghiệp',
        raw_article_id: mockArticleA.id,
        source_id: mockArticleA.sourceId,
        source_url: mockArticleA.url,
        confidence: 90,
      }
    ],
    explicit_company_statements: [],
    source_attributed_claims: [],
    uncertainties: [],
    event_detection_confidence: 95,
    extraction_quality_score: 90,
  };

  // Case 2A: Single-Source Verification & Confidence Cap
  const singleSourceVerif = verifyStoryClaimsAndSources({
    articles: [{ article: mockArticleA, extraction: mockExtractionA }]
  });

  assert(
    singleSourceVerif.is_publishable === true,
    'Claim Verification: Single verified article with matching claims passes publication gate'
  );
  assert(
    singleSourceVerif.verification_status === 'SINGLE_SOURCE',
    'Verification Status: Single source outlet assigned SINGLE_SOURCE status',
    `Status received: ${singleSourceVerif.verification_status}`
  );
  assert(
    singleSourceVerif.confidence_score <= 75,
    'Confidence Hard Cap: 1 source confidence strictly capped at <= 75%',
    `Score received: ${singleSourceVerif.confidence_score}%`
  );
  assert(
    singleSourceVerif.overall_alignment_score >= 80,
    'Alignment Score: High textual claim alignment score (>= 80%)',
    `Alignment score: ${singleSourceVerif.overall_alignment_score}`
  );

  // Case 2B: Multi-Source Corroboration (2 sources)
  const mockArticleB: RawArticle = {
    ...mockArticleA,
    id: 'p3-test-art-b',
    sourceId: 'src-vnexpress',
    publisher: 'VnExpress',
    url: 'https://vnexpress.net/sojitz-dong-nai-45m.html',
    cleanedContent: 'VnExpress: Sojitz và các đối tác rót thêm 45 triệu USD vào khu công nghiệp Long Đức tại Đồng Nai.',
  };
  const mockExtractionB: ArticleExtractionRecord = {
    ...mockExtractionA,
    id: 'ext-mock-b',
    raw_article_id: mockArticleB.id,
    source_url: mockArticleB.url,
    publisher: mockArticleB.publisher,
  };

  const multiSourceVerif = verifyStoryClaimsAndSources({
    articles: [
      { article: mockArticleA, extraction: mockExtractionA },
      { article: mockArticleB, extraction: mockExtractionB }
    ]
  });

  assert(
    multiSourceVerif.verified_source_count === 2,
    'Multi-Source: Correctly counts 2 verified supporting sources'
  );
  assert(
    multiSourceVerif.verification_status === 'VERIFIED',
    'Multi-Source Status: Multi-source corroborated outlet assigned VERIFIED status',
    `Status received: ${multiSourceVerif.verification_status}`
  );
  assert(
    multiSourceVerif.confidence_score <= 95 && multiSourceVerif.confidence_score > 75,
    'Multi-Source Confidence: 2 sources confidence elevated above 75% and capped at <= 95%',
    `Score received: ${multiSourceVerif.confidence_score}%`
  );

  // =========================================================================
  // TEST 3: STRATEGIC & BD SYNTHESIS QUALITY AUDIT
  // =========================================================================
  console.log('\n######################################################################');
  console.log('TEST 3: STRATEGIC & BD SYNTHESIS QUALITY AUDIT');
  console.log('######################################################################\n');

  const mockRelevanceA: ArticleRelevanceScoreRecord = {
    id: 'rel-mock-a',
    raw_article_id: mockArticleA.id,
    extraction_id: mockExtractionA.id,
    signal_detected: true,
    signal_type: 'INFRASTRUCTURE_EXPANSION',
    signal_strength: 'HIGH',
    matched_divisions: ['INFRA_LOGISTICS'],
    matched_assets: ['Long Đức Industrial Park'],
    matched_competitors: [],
    matched_priorities: ['KCN Long Đức expansion', 'Eco-Industrial Park transition'],
    relevance_score: 10,
    relevance_rationale: 'Direct operational impact on Sojitz flagship asset Long Đức IP in Đồng Nai.',
    triage_outcome: 'PICK_UP',
    triage_rationale: 'Flagship asset direct impact',
    business_impact: 'OPPORTUNITY',
    urgency: 'HIGH',
    strategic_status: 'OPPORTUNITY',
    primary_sector_id: null,
    primary_sector_name: 'Industrial Parks',
    secondary_sector_ids: [],
    matched_companies: [
      { company_id: 'fc157978-a598-4fbc-9006-3f51b93e6c4c', name: 'Sojitz Corporation', role: 'INVESTOR', origin: 'JAPANESE_TRADING_HOUSE' }
    ],
    is_high_priority: true,
  };

  const synthesizedStory = synthesizeStrategicStory({
    articles: [
      { article: mockArticleA, extraction: mockExtractionA },
      { article: mockArticleB, extraction: mockExtractionB }
    ],
    relevance: mockRelevanceA,
    verification: multiSourceVerif,
    modelName: 'gpt-4o',
  });

  assert(
    synthesizedStory.title.length > 20 && !synthesizedStory.title.includes('AI Generated'),
    'Headline Quality: Factual, executive headline generated without AI artifacts',
    `Title: "${synthesizedStory.title}"`
  );
  assert(
    synthesizedStory.summary.includes('Long Đức') && synthesizedStory.summary.includes('45 triệu USD'),
    'Summary Quality: Summary strictly grounded in verified facts, entities and deal values',
    `Summary: "${synthesizedStory.summary.slice(0, 100)}..."`
  );
  assert(
    synthesizedStory.whyItMattersToSojitz.includes('Long Đức') && synthesizedStory.whyItMattersToSojitz.includes('Hạ tầng'),
    'Why It Matters: Directly references Sojitz core asset (Long Đức) and business division (Hạ tầng & Logistics)',
    `Why It Matters: "${synthesizedStory.whyItMattersToSojitz.slice(0, 120)}..."`
  );
  assert(
    synthesizedStory.suggestedBdAction.includes('Long Đức') && synthesizedStory.suggestedBdAction.length >= 50,
    'BD Action Quality: Realistic, concrete, actionable recommendation for Sojitz teams',
    `BD Action: "${synthesizedStory.suggestedBdAction.slice(0, 120)}..."`
  );
  assert(
    synthesizedStory.extractedFacts.dealValueUsd === 45000000 && synthesizedStory.extractedFacts.location === 'Đồng Nai',
    'Extracted Facts Object: Structured numeric deal value and geography populated correctly'
  );

  // =========================================================================
  // TEST 4: TRANSACTIONAL POSTGRESQL PERSISTENCE AUDIT
  // =========================================================================
  console.log('\n######################################################################');
  console.log('TEST 4: TRANSACTIONAL POSTGRESQL PERSISTENCE AUDIT');
  console.log('######################################################################\n');

  // Insert mock raw article A into public.raw_articles first to satisfy foreign key
  await pool.query(`
    INSERT INTO public.raw_articles (
      id, source_id, publisher, title, url, original_url, final_url, http_status,
      published_at, fetched_at, raw_content, cleaned_content, content_hash,
      fetch_status, fetch_verified, is_article_page
    ) VALUES (
      'a0000000-0000-0000-0000-000000000001',
      (SELECT id FROM public.sources LIMIT 1),
      $1, $2, $3, $4, $5, 200, now(), now(), $6, $7, 'test-hash-4a',
      'SUCCESS', true, true
    )
    ON CONFLICT (id) DO NOTHING;
  `, [
    mockArticleA.publisher, mockArticleA.title, mockArticleA.url, mockArticleA.originalUrl, mockArticleA.finalUrl,
    mockArticleA.rawContent, mockArticleA.cleanedContent
  ]);

  synthesizedStory.id = 'b0000000-0000-0000-0000-000000000001';
  synthesizedStory.sources[0].sourceId = 'a0000000-0000-0000-0000-000000000001';

  const saveRes = await saveStoryToPostgres(synthesizedStory);
  assert(
    saveRes.success === true,
    'Transactional Save: Successfully saved intelligence story to PostgreSQL',
    `Error if any: ${saveRes.error}`
  );

  // Verify persistence in public.intelligence_stories
  const storyCheck = await pool.query('SELECT * FROM public.intelligence_stories WHERE id = $1', [synthesizedStory.id]);
  assert(
    storyCheck.rows.length === 1,
    'Persistence Check: Record exists in public.intelligence_stories'
  );
  assert(
    storyCheck.rows[0].is_high_priority === true,
    'Generated Column Check: is_high_priority computed automatically as true for score 10'
  );

  // Verify persistence in public.story_sources
  const sourcesCheck = await pool.query('SELECT * FROM public.story_sources WHERE story_id = $1', [synthesizedStory.id]);
  assert(
    sourcesCheck.rows.length >= 1,
    'Junction Check: Supporting source rows saved in public.story_sources',
    `Count: ${sourcesCheck.rows.length}`
  );
  assert(
    sourcesCheck.rows[0].url_verified === true && sourcesCheck.rows[0].claim_verified === true,
    'Verification Flags: url_verified and claim_verified are true in story_sources'
  );

  // Verify retrieval via getIntelligenceStoriesFromPostgres
  const retrievedStories = await getIntelligenceStoriesFromPostgres({ minRelevance: 8 });
  const foundSaved = retrievedStories.find(s => s.id === synthesizedStory.id);
  assert(
    Boolean(foundSaved && foundSaved.sources.length >= 1),
    'Query Store Integration: getIntelligenceStoriesFromPostgres returns story with joined sources',
    `Found: ${Boolean(foundSaved)}, Sources: ${foundSaved?.sources.length}`
  );

  // Clean up mock test fixture
  await pool.query('DELETE FROM public.intelligence_stories WHERE id = $1', [synthesizedStory.id]);
  await pool.query("DELETE FROM public.raw_articles WHERE id = 'a0000000-0000-0000-0000-000000000001'");

  // =========================================================================
  // TEST 5: LIVE END-TO-END PIPELINE EXECUTION
  // =========================================================================
  console.log('\n######################################################################');
  console.log('TEST 5: LIVE END-TO-END PIPELINE EXECUTION (MIN SCORE >= 4)');
  console.log('######################################################################\n');

  const pipelineResult = await runPhase3IntelligencePipeline({ minRelevanceScore: 4 });

  console.log(`\n[Pipeline Output Metrics]:`);
  console.log(`- Total candidate articles evaluated: ${pipelineResult.totalCandidates}`);
  console.log(`- Total stories synthesized & published: ${pipelineResult.totalVerifiedStories}`);
  console.log(`- Total candidate rejected by publication gate: ${pipelineResult.totalRejectedByGate}`);
  console.log(`- Pipeline duration: ${pipelineResult.executionDurationMs}ms\n`);

  assert(
    pipelineResult.totalVerifiedStories > 0,
    'Live Pipeline: Successfully synthesized and published stories with score >= 4',
    `Published count: ${pipelineResult.totalVerifiedStories}`
  );

  // Audit database state after pipeline run
  const dbStoriesRes = await pool.query('SELECT id, title, relevance_score, confidence_score, verification_status, business_impact, publication_date FROM public.intelligence_stories ORDER BY relevance_score DESC');
  console.log(`[Authoritative Database Audit] intelligence_stories in PostgreSQL (${dbStoriesRes.rows.length} total):`);
  
  for (const s of dbStoriesRes.rows) {
    const srcCountRes = await pool.query('SELECT COUNT(*) as count FROM public.story_sources WHERE story_id = $1', [s.id]);
    const srcCount = parseInt(srcCountRes.rows[0].count, 10);
    console.log(`  * [Score ${s.relevance_score}/10 | Conf ${s.confidence_score}% | ${s.verification_status} | ${srcCount} sources]`);
    console.log(`    Title: "${s.title}"`);
  }

  // Hard Constraint Audit: Check for any orphan stories
  const orphanAuditRes = await pool.query(`
    SELECT COUNT(*) as count 
    FROM public.intelligence_stories s
    WHERE NOT EXISTS (SELECT 1 FROM public.story_sources ss WHERE ss.story_id = s.id);
  `);
  const orphanCount = parseInt(orphanAuditRes.rows[0].count, 10);
  assert(
    orphanCount === 0,
    'Hard Architecture Constraint: ZERO orphan stories exist in PostgreSQL (Every story has >= 1 source)',
    `Orphan count: ${orphanCount}`
  );

  // Verify dashboard KPIs reflect the published stories
  const kpis = await getDashboardKpis();
  console.log(`\n[Dashboard KPIs Audit]:`);
  console.log(`- Articles Scanned: ${kpis.articlesScanned}`);
  console.log(`- Intelligence Stories: ${kpis.intelligenceStories}`);
  console.log(`- High Priority Stories: ${kpis.highPriorityStories}`);
  console.log(`- Opportunities: ${kpis.opportunitiesCount}`);
  console.log(`- Verified Count: ${kpis.verifiedCount}`);

  assert(
    kpis.intelligenceStories >= pipelineResult.totalVerifiedStories,
    'KPI Consistency: Dashboard intelligenceStories KPI accurately reflects published stories'
  );

  // Clean close pool
  await pool.end();

  console.log('\n======================================================================');
  console.log(`PHASE 3 TEST SUMMARY: ${testsPassed} / ${totalTests} TESTS PASSED`);
  console.log('======================================================================\n');

  if (testsPassed === totalTests) {
    console.log('>>> ALL PHASE 3 ACCEPTANCE CRITERIA VERIFIED AND PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.error('>>> SOME PHASE 3 TESTS FAILED! <<<\n');
    process.exit(1);
  }
}

runPhase3TestSuite().catch(err => {
  console.error('[Phase 3 Test Suite FATAL ERROR]:', err);
  process.exit(1);
});
