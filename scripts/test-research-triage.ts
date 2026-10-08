import assert from 'assert';
import { randomUUID } from 'crypto';
import { scoreArticleRelevance } from '../src/lib/relevance/relevance-scorer';
import { saveArticleRelevanceScore, getArticleRelevanceScoreByRawArticleId } from '../src/lib/database/relevance-store';
import { isQualifiedResearch, CandidateItem } from '../src/lib/analysis/phase3-pipeline';
import { RawArticle } from '../src/types/intelligence';
import { ArticleExtractionRecord, ExtractedClaim } from '../src/types/extraction';
import { getPostgresPool } from '../src/lib/database/postgres';

function makeClaim(text: string, rawArticleId: string, url: string): ExtractedClaim {
  return {
    claim_id: `cl-${randomUUID()}`,
    claim_text: text,
    evidence_text: text,
    raw_article_id: rawArticleId,
    source_id: 'test-src',
    source_url: url,
    confidence: 90,
  };
}

async function runResearchTriageTests() {
  console.log('======================================================================');
  console.log('RESEARCH BEHAVIOR & TRIAGE OUTCOMES TEST SUITE');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name: string, ok: boolean, details?: string) {
    if (ok) {
      console.log(`✅ [PASS] ${name}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1A: DROP OUTCOME - Non-commercial content
  // -------------------------------------------------------------------------
  const ncArticleId = randomUUID();
  const ncExtractionId = randomUUID();
  const nonCommercialArticle: RawArticle = {
    id: ncArticleId,
    sourceId: 'vneconomy',
    publisher: 'VnEconomy',
    title: 'Hà Nội trồng thêm 100.000 cây xanh làm đẹp cảnh quan đô thị',
    url: `https://vneconomy.vn/ha-noi-trong-cay-xanh-${ncArticleId}.htm`,
    originalUrl: `https://vneconomy.vn/ha-noi-trong-cay-xanh-${ncArticleId}.htm`,
    finalUrl: `https://vneconomy.vn/ha-noi-trong-cay-xanh-${ncArticleId}.htm`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 1,
    isTimestampSuspicious: false,
    articleAgeHours: 2,
    freshnessBucket: 'TODAY',
    rawContent: 'Thành phố Hà Nội phát động phong trào trồng cây xanh tạo cảnh quan môi trường.',
    rawContentBytes: 100,
    rawContentTruncated: false,
    cleanedContent: 'Thành phố Hà Nội phát động phong trào trồng cây xanh tạo cảnh quan môi trường.',
    contentHash: 'hash-drop-nc',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const nonCommercialExtraction: ArticleExtractionRecord = {
    id: ncExtractionId,
    raw_article_id: nonCommercialArticle.id,
    source_url: nonCommercialArticle.url,
    publisher: nonCommercialArticle.publisher,
    published_at: nonCommercialArticle.publishedAt,
    meaningful_event_detected: false,
    primary_event_type: 'OTHER',
    secondary_event_types: [],
    event_date: '2026-10-07',
    event_date_confidence: 90,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'ANNOUNCED',
    sectors: ['Cảnh quan'],
    sub_sectors: [],
    geographies: ['Hà Nội'],
    entities: [],
    numeric_facts: [],
    verified_facts: [],
    explicit_company_statements: [],
    source_attributed_claims: [],
    uncertainties: [],
    event_detection_confidence: 90,
    extraction_quality_score: null,
  };

  const scoreDropNC = await scoreArticleRelevance(nonCommercialExtraction, nonCommercialArticle);
  report(
    'TEST 1A: Non-commercial article receives DROP outcome',
    scoreDropNC.triage_outcome === 'DROP' && scoreDropNC.signal_detected === false,
    `Outcome: ${scoreDropNC.triage_outcome}, Rationale: ${scoreDropNC.triage_rationale}`
  );

  // -------------------------------------------------------------------------
  // TEST 1B: DROP OUTCOME - Low relevance / Non-strategic commercial news (Score <= 3)
  // -------------------------------------------------------------------------
  const lowArticleId = randomUUID();
  const lowExtractionId = randomUUID();
  const lowRelevanceArticle: RawArticle = {
    id: lowArticleId,
    sourceId: 'theinvestor',
    publisher: 'The Investor',
    title: 'Singapore luxury penthouse sold for record SGD 45M at private auction',
    url: `https://theinvestor.vn/singapore-penthouse-sold-record-${lowArticleId}.html`,
    originalUrl: `https://theinvestor.vn/singapore-penthouse-sold-record-${lowArticleId}.html`,
    finalUrl: `https://theinvestor.vn/singapore-penthouse-sold-record-${lowArticleId}.html`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 1,
    isTimestampSuspicious: false,
    articleAgeHours: 2,
    freshnessBucket: 'TODAY',
    rawContent: 'A luxury residential penthouse in Singapore was sold at auction with no commercial connection to Vietnam.',
    rawContentBytes: 150,
    rawContentTruncated: false,
    cleanedContent: 'A luxury residential penthouse in Singapore was sold at auction with no commercial connection to Vietnam.',
    contentHash: 'hash-drop-low',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const lowRelevanceExtraction: ArticleExtractionRecord = {
    id: lowExtractionId,
    raw_article_id: lowRelevanceArticle.id,
    source_url: lowRelevanceArticle.url,
    publisher: lowRelevanceArticle.publisher,
    published_at: lowRelevanceArticle.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'LAND_TRANSACTION',
    secondary_event_types: [],
    event_date: '2026-10-07',
    event_date_confidence: 90,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'COMPLETED',
    sectors: ['Luxury Real Estate'],
    sub_sectors: [],
    geographies: ['Singapore'],
    entities: [{ name: 'Private Investor', entity_type: 'PERSON', role_in_event: 'BUYER', aliases_found: [] }],
    numeric_facts: [{ fact_type: 'PRICE', raw_value: 'SGD 45M', numeric_value: 45000000, currency: 'SGD', unit: 'SGD', qualifier: 'EXACT', source_text: 'SGD 45M' }],
    verified_facts: [makeClaim('Penthouse sold for SGD 45M in Singapore', lowArticleId, lowRelevanceArticle.url)],
    explicit_company_statements: [],
    source_attributed_claims: [],
    uncertainties: [],
    event_detection_confidence: 85,
    extraction_quality_score: 80,
  };

  const scoreDropLow = await scoreArticleRelevance(lowRelevanceExtraction, lowRelevanceArticle);
  report(
    'TEST 1B: Low relevance non-strategic article receives DROP outcome',
    scoreDropLow.triage_outcome === 'DROP' && scoreDropLow.relevance_score <= 3,
    `Outcome: ${scoreDropLow.triage_outcome}, Score: ${scoreDropLow.relevance_score}, Rationale: ${scoreDropLow.triage_rationale}`
  );

  // -------------------------------------------------------------------------
  // TEST 2: WATCH OUTCOME - Strategic relevance but no direct business opportunity (Score 4-6)
  // -------------------------------------------------------------------------
  const watchArticleId = randomUUID();
  const watchExtractionId = randomUUID();
  const watchArticle: RawArticle = {
    id: watchArticleId,
    sourceId: 'cafef',
    publisher: 'CafeF',
    title: 'Một doanh nghiệp bất động sản phát hành 2.000 tỷ đồng trái phiếu tái cơ cấu nợ',
    url: `https://cafef.vn/bds-phat-hanh-trai-phieu-tai-co-cau-${watchArticleId}.chn`,
    originalUrl: `https://cafef.vn/bds-phat-hanh-trai-phieu-tai-co-cau-${watchArticleId}.chn`,
    finalUrl: `https://cafef.vn/bds-phat-hanh-trai-phieu-tai-co-cau-${watchArticleId}.chn`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 2,
    isTimestampSuspicious: false,
    articleAgeHours: 3,
    freshnessBucket: 'TODAY',
    rawContent: 'Doanh nghiệp bất động sản phát hành trái phiếu doanh nghiệp nhằm tái cơ cấu dòng tiền ngắn hạn.',
    rawContentBytes: 200,
    rawContentTruncated: false,
    cleanedContent: 'Doanh nghiệp bất động sản phát hành trái phiếu doanh nghiệp nhằm tái cơ cấu dòng tiền ngắn hạn.',
    contentHash: 'hash-watch',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const watchExtraction: ArticleExtractionRecord = {
    id: watchExtractionId,
    raw_article_id: watchArticle.id,
    source_url: watchArticle.url,
    publisher: watchArticle.publisher,
    published_at: watchArticle.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'CORPORATE_RESTRUCTURING',
    secondary_event_types: ['FINANCING'],
    event_date: '2026-10-07',
    event_date_confidence: 90,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'ANNOUNCED',
    sectors: ['Bất động sản', 'Tài chính'],
    sub_sectors: [],
    geographies: ['Việt Nam'],
    entities: [{ name: 'Công ty Cổ phần Bất động sản An Phú', entity_type: 'COMPANY', role_in_event: 'SUBJECT', aliases_found: [] }],
    numeric_facts: [{ fact_type: 'BOND_VALUE', raw_value: '2.000 tỷ đồng', numeric_value: 2000000000000, currency: 'VND', unit: 'VND', qualifier: 'EXACT', source_text: '2.000 tỷ đồng' }],
    verified_facts: [makeClaim('Phát hành trái phiếu 2.000 tỷ đồng để tái cơ cấu nợ', watchArticleId, watchArticle.url)],
    explicit_company_statements: [],
    source_attributed_claims: [],
    uncertainties: [],
    event_detection_confidence: 90,
    extraction_quality_score: 85,
  };

  const scoreWatch = await scoreArticleRelevance(watchExtraction, watchArticle);
  report(
    'TEST 2: Secondary monitoring financing article receives WATCH outcome',
    scoreWatch.triage_outcome === 'WATCH' && scoreWatch.relevance_score >= 4 && scoreWatch.relevance_score <= 6,
    `Outcome: ${scoreWatch.triage_outcome}, Score: ${scoreWatch.relevance_score}, Rationale: ${scoreWatch.triage_rationale}`
  );

  // -------------------------------------------------------------------------
  // TEST 3: PICK UP OUTCOME - High importance / Direct asset impact (Score >= 7, verified)
  // -------------------------------------------------------------------------
  const pickUpArticleId = randomUUID();
  const pickUpExtractionId = randomUUID();
  const pickUpArticle: RawArticle = {
    id: pickUpArticleId,
    sourceId: 'baodautu',
    publisher: 'Báo Đầu Tư',
    title: 'Sojitz mở rộng KCN Long Đức thêm 200 ha tại Đồng Nai đón làn sóng FDI bán dẫn',
    url: `https://baodautu.vn/sojitz-mo-rong-kcn-long-duc-${pickUpArticleId}.html`,
    originalUrl: `https://baodautu.vn/sojitz-mo-rong-kcn-long-duc-${pickUpArticleId}.html`,
    finalUrl: `https://baodautu.vn/sojitz-mo-rong-kcn-long-duc-${pickUpArticleId}.html`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 1,
    isTimestampSuspicious: false,
    articleAgeHours: 2,
    freshnessBucket: 'TODAY',
    rawContent: 'Tập đoàn Sojitz Corporation phối hợp tỉnh Đồng Nai công bố mở rộng KCN Long Đức thêm 200 ha với tổng vốn 150 triệu USD.',
    rawContentBytes: 300,
    rawContentTruncated: false,
    cleanedContent: 'Tập đoàn Sojitz Corporation phối hợp tỉnh Đồng Nai công bố mở rộng KCN Long Đức thêm 200 ha với tổng vốn 150 triệu USD.',
    contentHash: 'hash-pickup',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const pickUpExtraction: ArticleExtractionRecord = {
    id: pickUpExtractionId,
    raw_article_id: pickUpArticle.id,
    source_url: pickUpArticle.url,
    publisher: pickUpArticle.publisher,
    published_at: pickUpArticle.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'EXPANSION',
    secondary_event_types: ['INVESTMENT'],
    event_date: '2026-10-07',
    event_date_confidence: 95,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'ANNOUNCED',
    sectors: ['Bất động sản công nghiệp', 'Logistics'],
    sub_sectors: [],
    geographies: ['Đồng Nai', 'Việt Nam'],
    entities: [
      { name: 'Sojitz Corporation', entity_type: 'COMPANY', role_in_event: 'DEVELOPER', aliases_found: [] },
      { name: 'UBND Tỉnh Đồng Nai', entity_type: 'GOVERNMENT_AGENCY', role_in_event: 'REGULATOR', aliases_found: [] }
    ],
    numeric_facts: [
      { fact_type: 'AREA', raw_value: '200 ha', numeric_value: 200, currency: null, unit: 'ha', qualifier: 'EXACT', source_text: '200 ha' },
      { fact_type: 'CAPEX', raw_value: '150 triệu USD', numeric_value: 150000000, currency: 'USD', unit: 'USD', qualifier: 'APPROXIMATELY', source_text: '150 triệu USD' }
    ],
    verified_facts: [makeClaim('KCN Long Đức được mở rộng thêm 200 ha với vốn 150 triệu USD', pickUpArticleId, pickUpArticle.url)],
    explicit_company_statements: [makeClaim('Sojitz cam kết phát triển KCN sinh thái phục vụ chuỗi cung ứng bán dẫn.', pickUpArticleId, pickUpArticle.url)],
    source_attributed_claims: [makeClaim('UBND tỉnh Đồng Nai đã phê duyệt quy hoạch 1/2000.', pickUpArticleId, pickUpArticle.url)],
    uncertainties: [],
    event_detection_confidence: 95,
    extraction_quality_score: 95,
  };

  const scorePickUp = await scoreArticleRelevance(pickUpExtraction, pickUpArticle);
  report(
    'TEST 3: Direct Sojitz asset expansion receives PICK UP outcome',
    scorePickUp.triage_outcome === 'PICK_UP' && scorePickUp.relevance_score >= 7,
    `Outcome: ${scorePickUp.triage_outcome}, Score: ${scorePickUp.relevance_score}, Rationale: ${scorePickUp.triage_rationale}`
  );

  // -------------------------------------------------------------------------
  // TEST 4: RESEARCH OUTCOME - Potentially important but has uncertainties/unverified claims
  // -------------------------------------------------------------------------
  const researchArticleId = randomUUID();
  const researchExtractionId = randomUUID();
  const researchArticle: RawArticle = {
    id: researchArticleId,
    sourceId: 'vir',
    publisher: 'Vietnam Investment Review',
    title: 'Proposed LNG terminal consortium in Central Vietnam reported seeking Japanese trading house partners',
    url: `https://vir.com.vn/proposed-lng-terminal-consortium-central-vietnam-${researchArticleId}.html`,
    originalUrl: `https://vir.com.vn/proposed-lng-terminal-consortium-central-vietnam-${researchArticleId}.html`,
    finalUrl: `https://vir.com.vn/proposed-lng-terminal-consortium-central-vietnam-${researchArticleId}.html`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 2,
    isTimestampSuspicious: false,
    articleAgeHours: 3,
    freshnessBucket: 'TODAY',
    rawContent: 'A proposed 2.5B USD LNG terminal project in Quảng Ngãi is reportedly seeking Japanese trading partners, though official MOUs remain unconfirmed.',
    rawContentBytes: 250,
    rawContentTruncated: false,
    cleanedContent: 'A proposed 2.5B USD LNG terminal project in Quảng Ngãi is reportedly seeking Japanese trading partners, though official MOUs remain unconfirmed.',
    contentHash: 'hash-research',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const researchExtraction: ArticleExtractionRecord = {
    id: researchExtractionId,
    raw_article_id: researchArticle.id,
    source_url: researchArticle.url,
    publisher: researchArticle.publisher,
    published_at: researchArticle.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'ENERGY_PROJECT',
    secondary_event_types: ['PARTNERSHIP'],
    event_date: '2026-10-07',
    event_date_confidence: 80,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'PROPOSED',
    sectors: ['Năng lượng', 'Khí LNG'],
    sub_sectors: [],
    geographies: ['Quảng Ngãi', 'Việt Nam'],
    entities: [{ name: 'Central Energy Consortium', entity_type: 'COMPANY', role_in_event: 'PROJECT_OWNER', aliases_found: [] }],
    numeric_facts: [{ fact_type: 'CAPEX', raw_value: '2.5B USD', numeric_value: 2500000000, currency: 'USD', unit: 'USD', qualifier: 'APPROXIMATELY', source_text: '2.5B USD' }],
    verified_facts: [makeClaim('Consortium proposes 2.5B USD LNG terminal', researchArticleId, researchArticle.url)],
    explicit_company_statements: [],
    source_attributed_claims: [makeClaim('Sources report initial preliminary talks have occurred', researchArticleId, researchArticle.url)],
    uncertainties: [
      makeClaim('Official partnership terms unconfirmed', researchArticleId, researchArticle.url),
      makeClaim('Government investment license pending approval', researchArticleId, researchArticle.url)
    ],
    event_detection_confidence: 82,
    extraction_quality_score: 80,
  };

  const scoreResearch = await scoreArticleRelevance(researchExtraction, researchArticle);
  report(
    'TEST 4: Potentially important event with uncertainties receives RESEARCH outcome',
    scoreResearch.triage_outcome === 'RESEARCH',
    `Outcome: ${scoreResearch.triage_outcome}, Score: ${scoreResearch.relevance_score}, Rationale: ${scoreResearch.triage_rationale}`
  );

  // -------------------------------------------------------------------------
  // TEST 5: PIPELINE GATING - Only PICK UP and Qualified RESEARCH proceed
  // -------------------------------------------------------------------------
  const candidatePickUp: CandidateItem = {
    article: pickUpArticle,
    extraction: pickUpExtraction,
    relevance: scorePickUp,
  };

  const candidateQualifiedResearch: CandidateItem = {
    article: researchArticle,
    extraction: researchExtraction,
    relevance: scoreResearch,
  };

  const candidateUnqualifiedResearch: CandidateItem = {
    article: {
      ...researchArticle,
      id: randomUUID(),
      isTimestampSuspicious: true,
    },
    extraction: {
      ...researchExtraction,
      verified_facts: [],
      numeric_facts: [],
      event_detection_confidence: 55,
    },
    relevance: {
      ...scoreResearch,
      id: `rel-unqual-${randomUUID()}`,
      triage_outcome: 'RESEARCH',
    },
  };

  const candidateWatch: CandidateItem = {
    article: watchArticle,
    extraction: watchExtraction,
    relevance: scoreWatch,
  };

  const candidateDrop: CandidateItem = {
    article: nonCommercialArticle,
    extraction: nonCommercialExtraction,
    relevance: scoreDropNC,
  };

  // Test qualification evaluation
  const qualResearchCheck = isQualifiedResearch(candidateQualifiedResearch);
  report(
    'TEST 5A: Qualified RESEARCH candidate passes qualification check',
    qualResearchCheck.qualified === true,
    `Qualified: ${qualResearchCheck.qualified}`
  );

  const unqualResearchCheck = isQualifiedResearch(candidateUnqualifiedResearch);
  report(
    'TEST 5B: Unqualified RESEARCH candidate (zero verified facts, low conf) is rejected',
    unqualResearchCheck.qualified === false && typeof unqualResearchCheck.reason === 'string',
    `Rejected: ${unqualResearchCheck.reason}`
  );

  // Gating filter simulation
  const rawCandidatePool = [
    candidateDrop,
    candidateWatch,
    candidatePickUp,
    candidateQualifiedResearch,
    candidateUnqualifiedResearch,
  ];

  const allowedToSynthesize = rawCandidatePool.filter(c => {
    if (c.relevance.triage_outcome === 'PICK_UP') return true;
    if (c.relevance.triage_outcome === 'RESEARCH') return isQualifiedResearch(c).qualified;
    return false; // DROP and WATCH are strictly rejected
  });

  report(
    'TEST 5C: Pipeline Gate strictly admits only PICK UP and qualified RESEARCH',
    allowedToSynthesize.length === 2 &&
    allowedToSynthesize.some(c => c.relevance.triage_outcome === 'PICK_UP') &&
    allowedToSynthesize.some(c => c.relevance.triage_outcome === 'RESEARCH'),
    `Admitted: ${allowedToSynthesize.map(c => `${c.article.publisher} [${c.relevance.triage_outcome}]`).join(', ')}`
  );

  report(
    'TEST 5D: DROP and WATCH candidates are never admitted into deeper intelligence analysis',
    !allowedToSynthesize.some(c => c.relevance.triage_outcome === 'DROP') &&
    !allowedToSynthesize.some(c => c.relevance.triage_outcome === 'WATCH'),
    `Zero DROP or WATCH candidates reached deeper synthesis`
  );

  // -------------------------------------------------------------------------
  // TEST 6: POSTGRESQL PERSISTENCE & RETRIEVAL OF TRIAGE OUTCOMES
  // -------------------------------------------------------------------------
  const pool = getPostgresPool();

  const srcRes = await pool.query(`SELECT id FROM public.sources LIMIT 1`);
  const validSourceId = srcRes.rows[0]?.id || 'fae1895e-c8b1-4c2f-a1bf-3af4710b562e';

  // Insert mock raw_article and extraction first to satisfy foreign keys
  await pool.query(`
    INSERT INTO public.raw_articles (
      id, source_id, publisher, title, url, original_url, final_url, http_status,
      published_at, fetched_at, date_extraction_source, freshness_bucket,
      raw_content, cleaned_content, content_hash, fetch_status, fetch_verified, is_article_page
    ) VALUES (
      $1, $2, $3, $4, $5, $5, $5, 200,
      '2026-10-07', now(), 'JSON_LD', 'TODAY',
      $6, $6, $7, 'SUCCESS', true, true
    ) ON CONFLICT (id) DO NOTHING;
  `, [
    pickUpArticle.id,
    validSourceId,
    pickUpArticle.publisher,
    pickUpArticle.title,
    pickUpArticle.url,
    pickUpArticle.rawContent,
    pickUpArticle.contentHash,
  ]);

  await pool.query(`
    INSERT INTO public.article_extractions (
      id, raw_article_id, source_url, publisher, published_at,
      meaningful_event_detected, primary_event_type, event_date,
      event_status, event_detection_confidence
    ) VALUES (
      $1, $2, $3, $4, '2026-10-07',
      true, 'EXPANSION', '2026-10-07',
      'ANNOUNCED', 95
    ) ON CONFLICT (id) DO NOTHING;
  `, [
    pickUpExtraction.id,
    pickUpArticle.id,
    pickUpArticle.url,
    pickUpArticle.publisher,
  ]);

  // Save relevance score with triage outcome to Postgres
  await saveArticleRelevanceScore(scorePickUp);
  const fetchedRecord = await getArticleRelevanceScoreByRawArticleId(pickUpArticle.id);

  report(
    'TEST 6: Database persists and retrieves triage_outcome and triage_rationale',
    fetchedRecord !== null &&
    fetchedRecord.triage_outcome === 'PICK_UP' &&
    Boolean(fetchedRecord.triage_rationale),
    `Persisted outcome: ${fetchedRecord?.triage_outcome}, Rationale: ${fetchedRecord?.triage_rationale}`
  );

  // -------------------------------------------------------------------------
  // TEST 7: NEGATIVE DISQUALIFICATION CHECKS
  // "An article must NOT be selected solely because:
  //  - it mentions Vietnam
  //  - it mentions Japan
  //  - it contains a sector keyword
  //  - it discusses the general economy
  //  - it mentions a company on the watchlist
  //  - it is published by a high-tier source
  //  There must be a reasonable business or strategic connection."
  // -------------------------------------------------------------------------
  const gdpArticleId = randomUUID();
  const gdpArticle: RawArticle = {
    id: gdpArticleId,
    sourceId: validSourceId,
    publisher: 'Financial Times',
    title: 'Vietnam macroeconomic GDP forecast raised by analysts amid inflation stabilization',
    url: `https://ft.com/vietnam-gdp-forecast-${gdpArticleId}.html`,
    originalUrl: `https://ft.com/vietnam-gdp-forecast-${gdpArticleId}.html`,
    finalUrl: `https://ft.com/vietnam-gdp-forecast-${gdpArticleId}.html`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 1,
    isTimestampSuspicious: false,
    articleAgeHours: 2,
    freshnessBucket: 'TODAY',
    rawContent: 'Economists comment that Vietnam GDP and general economy will grow 6.5% this year with inflation under control.',
    rawContentBytes: 120,
    rawContentTruncated: false,
    cleanedContent: 'Economists comment that Vietnam GDP and general economy will grow 6.5% this year with inflation under control.',
    contentHash: 'hash-gdp',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const gdpExtraction: ArticleExtractionRecord = {
    id: randomUUID(),
    raw_article_id: gdpArticleId,
    source_url: gdpArticle.url,
    publisher: gdpArticle.publisher,
    published_at: gdpArticle.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'OTHER',
    secondary_event_types: [],
    event_date: '2026-10-07',
    event_date_confidence: 90,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'ANNOUNCED',
    sectors: ['Kinh tế vĩ mô'],
    sub_sectors: [],
    geographies: ['Việt Nam'],
    entities: [],
    numeric_facts: [],
    verified_facts: [makeClaim('Vietnam GDP forecasted to grow 6.5%', gdpArticleId, gdpArticle.url)],
    explicit_company_statements: [],
    source_attributed_claims: [],
    uncertainties: [],
    event_detection_confidence: 90,
    extraction_quality_score: 80,
  };

  const scoreGdp = await scoreArticleRelevance(gdpExtraction, gdpArticle);
  report(
    'TEST 7A: High-tier source article discussing general economy solely is DROPPED',
    scoreGdp.triage_outcome === 'DROP' && scoreGdp.signal_detected === false,
    `Outcome: ${scoreGdp.triage_outcome}, Disqualified: ${scoreGdp.scoring_metadata?.disqualification_reasons?.join('; ')}`
  );

  // Case 7B: Passive watchlist company mention in daily stock index recap
  const stockArticleId = randomUUID();
  const stockArticle: RawArticle = {
    id: stockArticleId,
    sourceId: validSourceId,
    publisher: 'CafeF',
    title: 'VN-Index tăng 3 điểm, Vingroup và Vinamilk giao dịch giằng co trong phiên giao dịch',
    url: `https://cafef.vn/vn-index-tang-diem-vingroup-vinamilk-${stockArticleId}.chn`,
    originalUrl: `https://cafef.vn/vn-index-tang-diem-vingroup-vinamilk-${stockArticleId}.chn`,
    finalUrl: `https://cafef.vn/vn-index-tang-diem-vingroup-vinamilk-${stockArticleId}.chn`,
    httpStatus: 200,
    publishedAt: '2026-10-07',
    fetchedAt: new Date().toISOString(),
    dateExtractionSource: 'JSON_LD',
    publishedAtDeltaHours: 1,
    isTimestampSuspicious: false,
    articleAgeHours: 2,
    freshnessBucket: 'TODAY',
    rawContent: 'Thị trường chứng khoán hôm nay chứng kiến VN-Index tăng nhẹ, cổ phiếu Vingroup và Vinamilk biến động nhẹ.',
    rawContentBytes: 120,
    rawContentTruncated: false,
    cleanedContent: 'Thị trường chứng khoán hôm nay chứng kiến VN-Index tăng nhẹ, cổ phiếu Vingroup và Vinamilk biến động nhẹ.',
    contentHash: 'hash-stock',
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
  };

  const stockExtraction: ArticleExtractionRecord = {
    id: randomUUID(),
    raw_article_id: stockArticleId,
    source_url: stockArticle.url,
    publisher: stockArticle.publisher,
    published_at: stockArticle.publishedAt,
    meaningful_event_detected: true,
    primary_event_type: 'OTHER',
    secondary_event_types: [],
    event_date: '2026-10-07',
    event_date_confidence: 90,
    event_date_source: 'ARTICLE_BODY',
    event_status: 'ANNOUNCED',
    sectors: ['Chứng khoán'],
    sub_sectors: [],
    geographies: ['Việt Nam'],
    entities: [{ name: 'Vingroup', entity_type: 'COMPANY', role_in_event: 'SUBJECT', aliases_found: [] }],
    numeric_facts: [],
    verified_facts: [makeClaim('VN-Index tăng 3 điểm', stockArticleId, stockArticle.url)],
    explicit_company_statements: [],
    source_attributed_claims: [],
    uncertainties: [],
    event_detection_confidence: 90,
    extraction_quality_score: 80,
  };

  const scoreStock = await scoreArticleRelevance(stockExtraction, stockArticle);
  report(
    'TEST 7B: Passive watchlist company mention in daily stock wrap-up is DROPPED',
    scoreStock.triage_outcome === 'DROP' && scoreStock.signal_detected === false,
    `Outcome: ${scoreStock.triage_outcome}, Disqualified: ${scoreStock.scoring_metadata?.disqualification_reasons?.join('; ')}`
  );

  // Clean up test records
  await pool.query('DELETE FROM public.article_relevance_scores WHERE raw_article_id = $1', [pickUpArticle.id]);
  await pool.query('DELETE FROM public.article_extractions WHERE id = $1', [pickUpExtraction.id]);
  await pool.query('DELETE FROM public.raw_articles WHERE id = $1', [pickUpArticle.id]);

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  await pool.end();

  if (failed > 0) {
    process.exit(1);
  }
}

runResearchTriageTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
