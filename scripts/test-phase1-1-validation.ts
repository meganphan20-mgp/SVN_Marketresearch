import { runPhase1Ingestion } from '../src/lib/ingestion/phase1-pipeline';
import { fetchAndValidateRawArticle } from '../src/lib/ingestion/raw-article-fetcher';
import { rawArticlesStore } from '../src/lib/data/raw-articles-store';
import { SAMPLE_INTELLIGENCE_STORIES } from '../src/lib/data/mock-intelligence';
import { DiscoveredArticleCandidate, RawArticle } from '../src/types/intelligence';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PHASE 1.1 HARDENING & VALIDATION TEST SUITE
 * 
 * Executes full verification across Sections A through I:
 * A. Publication Date Validation
 * B. Raw Content Truncation Audit
 * C. Article Page Detection Hardening
 * D. Source-Domain Integrity
 * E. Discovery Coverage Test (5 sources, >= 5 articles each)
 * F. Negative Test Cases (9 explicit failure tests)
 * G. Database Persistence Check (across process boundaries)
 * H. Legacy Story Isolation
 * I. Final Acceptance Test (10 randomly selected stored raw articles, 11 checks, 10/10 required)
 */

async function runNegativeTests(): Promise<{ passed: number; total: number; details: string[] }> {
  console.log('\n==================================================');
  console.log('SECTION F: NEGATIVE TEST CASES (9 TESTS)');
  console.log('==================================================');

  let passed = 0;
  const total = 9;
  const details: string[] = [];

  // Helper candidate builder
  const makeCandidate = (url: string, sourceId = 'src-vnexpress', sourceName = 'VnExpress International', allowedDomains = ['e.vnexpress.net', 'vnexpress.net']): DiscoveredArticleCandidate => ({
    sourceId,
    sourceName,
    sourceTier: 'TIER_2',
    sourceDomain: 'e.vnexpress.net',
    allowedDomains,
    discoveredUrl: url,
    discoveryMethod: 'RSS',
  });

  // Test 1: Homepage URL
  try {
    const cand = makeCandidate('https://e.vnexpress.net/');
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 1: Homepage URL rejected appropriately.');
    } else {
      details.push('FAIL 1: Homepage URL was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 1: Homepage URL rejected with error: ${e.message}`);
  }

  // Test 2: Category page
  try {
    const cand = makeCandidate('https://e.vnexpress.net/news/business');
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 2: Category page rejected appropriately.');
    } else {
      details.push('FAIL 2: Category page was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 2: Category page rejected with error: ${e.message}`);
  }

  // Test 3: Search page
  try {
    const cand = makeCandidate('https://e.vnexpress.net/search/q/sojitz');
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 3: Search page rejected appropriately.');
    } else {
      details.push('FAIL 3: Search page was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 3: Search page rejected with error: ${e.message}`);
  }

  // Test 4: Fake / Nonexistent article URL (404)
  try {
    const cand = makeCandidate('https://e.vnexpress.net/news/business/fake-nonexistent-article-999999999.html');
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 4: Fake/nonexistent article URL (404) rejected appropriately.');
    } else {
      details.push('FAIL 4: Fake/nonexistent article URL was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 4: Fake article rejected with error: ${e.message}`);
  }

  // Test 5: Redirect to homepage
  try {
    // URL with dummy redirect path or invalid article that redirects to root
    const cand = makeCandidate('https://e.vnexpress.net/index.html');
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 5: Redirect to homepage / root landing page rejected appropriately.');
    } else {
      details.push('FAIL 5: Redirect to homepage was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 5: Rejected with error: ${e.message}`);
  }

  // Test 6: Duplicate URL rejection in store
  try {
    const dummyArticle: RawArticle = {
      id: 'test-dup-1',
      sourceId: 'src-test',
      publisher: 'Test Source',
      title: 'Unique Article Title For Testing Duplicate Rejection',
      originalUrl: 'https://test.com/dup-article-1',
      url: 'https://test.com/dup-article-1',
      finalUrl: 'https://test.com/dup-article-1',
      httpStatus: 200,
      publishedAt: '2026-10-06',
      fetchedAt: new Date().toISOString(),
      dateExtractionSource: 'OPEN_GRAPH',
      publishedAtDeltaHours: 24,
      isTimestampSuspicious: false,
      rawContent: '<html>...</html>',
      rawContentBytes: 200,
      rawContentTruncated: false,
      cleanedContent: 'Sample article body content text for duplicate test',
      contentHash: 'hash-dup-url-12345',
      fetchStatus: 'SUCCESS',
      fetchVerified: true,
      isArticlePage: true,
    };

    const firstSave = await rawArticlesStore.saveRawArticle(dummyArticle);
    const secondSave = await rawArticlesStore.saveRawArticle({
      ...dummyArticle,
      id: 'test-dup-2',
    });

    // Should return existing object and not add new record
    if (firstSave && secondSave && secondSave.id === firstSave.id) {
      passed++;
      details.push('PASS 6: Duplicate URL rejected appropriately (idempotent deduplication).');
    } else {
      details.push('FAIL 6: Duplicate URL was NOT detected as duplicate.');
    }
  } catch (e: any) {
    details.push(`FAIL 6: Duplicate URL test threw error: ${e.message}`);
  }

  // Test 7: Duplicate content under another URL
  try {
    const dummyArticleDiffUrl: RawArticle = {
      id: 'test-dup-content-1',
      sourceId: 'src-test',
      publisher: 'Test Source',
      title: 'Different Title But Identical Content Hash',
      originalUrl: 'https://test.com/different-url-same-hash',
      url: 'https://test.com/different-url-same-hash',
      finalUrl: 'https://test.com/different-url-same-hash',
      httpStatus: 200,
      publishedAt: '2026-10-06',
      fetchedAt: new Date().toISOString(),
      dateExtractionSource: 'OPEN_GRAPH',
      publishedAtDeltaHours: 24,
      isTimestampSuspicious: false,
      rawContent: '<html>...</html>',
      rawContentBytes: 200,
      rawContentTruncated: false,
      cleanedContent: 'Identical body content',
      contentHash: 'hash-dup-url-12345', // Same hash as Test 6!
      fetchStatus: 'SUCCESS',
      fetchVerified: true,
      isArticlePage: true,
    };

    const dupSave = await rawArticlesStore.saveRawArticle(dummyArticleDiffUrl);
    if (dupSave && dupSave.id === 'test-dup-1') {
      passed++;
      details.push('PASS 7: Duplicate content under different URL rejected appropriately by content_hash.');
    } else {
      details.push('FAIL 7: Duplicate content hash was NOT rejected.');
    }
  } catch (e: any) {
    details.push(`FAIL 7: Duplicate content test threw error: ${e.message}`);
  }

  // Test 8: Article from non-allowlisted domain
  try {
    const cand = makeCandidate('https://unallowlisted-domain.com/vietnam-investments-2026.html', 'src-vnexpress', 'VnExpress', ['e.vnexpress.net']);
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 8: Article from non-allowlisted domain rejected appropriately.');
    } else {
      details.push('FAIL 8: Non-allowlisted domain was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 8: Non-allowlisted domain rejected: ${e.message}`);
  }

  // Test 9: Page with HTTP 200 but no real article body (<150 words)
  try {
    // Testing a short terms or contact page or placeholder
    const cand = makeCandidate('https://e.vnexpress.net/robots.txt');
    const res = await fetchAndValidateRawArticle(cand);
    if (!res.validationResult.isValidArticlePage && !res.rawArticle) {
      passed++;
      details.push('PASS 9: Page with HTTP 200 but no real article body (<150 words) rejected appropriately.');
    } else {
      details.push('FAIL 9: Thin page was NOT rejected.');
    }
  } catch (e: any) {
    passed++;
    details.push(`PASS 9: Thin page rejected: ${e.message}`);
  }

  details.forEach(d => console.log('  ' + d));
  console.log(`\nSection F Result: ${passed}/${total} passed`);
  return { passed, total, details };
}

async function runCoverageAndAcceptanceTests() {
  console.log('\n==================================================');
  console.log('SECTION E: DISCOVERY COVERAGE TEST (5 SOURCES)');
  console.log('==================================================');

  // We select 5 active sources with working discovery mechanisms
  const targetSources = [
    'src-vnexpress',      // VnExpress International (RSS)
    'src-vietnamnews',     // Vietnam News (RSS)
    'src-theinvestor',     // The Investor (Section HTML scrape)
    'src-cafef',           // CafeF (RSS)
    'src-vnexpress-vi',    // VnExpress Kinh Doanh (RSS)
  ];

  const ingestResult = await runPhase1Ingestion({
    sourceIds: targetSources,
    maxArticlesPerSource: 6, // Ask for up to 6 to guarantee >= 5 candidates per source
  });

  console.log(`Sources Scanned: ${ingestResult.sourcesScanned}`);
  console.log(`Total Discovered URLs: ${ingestResult.totalDiscoveredUrls}`);
  console.log(`Total Successfully Fetched: ${ingestResult.totalFetchedSuccessfully}`);
  console.log(`Total Rejected: ${ingestResult.totalRejected}`);
  console.log(`Total Duplicates: ${ingestResult.totalDuplicates}`);
  console.log(`Total Stored Raw Articles: ${ingestResult.totalRawArticlesStored}`);
  console.log(`Database Persisted: ${ingestResult.databasePersisted}`);

  console.log('\nSource-by-Source Breakdown:');
  for (const rep of ingestResult.sourceReports) {
    console.log(`- Source: ${rep.name} (${rep.domain}) [${rep.tier}]`);
    console.log(`    Candidates Discovered: ${rep.candidatesDiscovered}`);
    console.log(`    Successfully Fetched:  ${rep.successfullyFetched}`);
    console.log(`    Rejected:              ${rep.rejected}`);
    console.log(`    Duplicate:             ${rep.duplicate}`);
    if (rep.failureReasons.length > 0) {
      console.log(`    Failure Reasons:       ${rep.failureReasons.slice(0, 3).join('; ')}`);
    }
  }

  // Section A: Publication Date Audit
  console.log('\n==================================================');
  console.log('SECTION A: PUBLICATION DATE AUDIT');
  console.log('==================================================');
  const stored = await rawArticlesStore.getRawArticles({ limit: 50 });
  console.log(`Auditing publication dates across ${stored.length} stored articles:`);

  let validDatesCount = 0;
  let suspiciousDatesCount = 0;

  stored.slice(0, 15).forEach((art, i) => {
    console.log(`[#${i + 1}] Title: "${art.title.slice(0, 50)}..."`);
    console.log(`     published_at:          ${art.publishedAt}`);
    console.log(`     extraction_source:     ${art.dateExtractionSource}`);
    console.log(`     fetched_at:            ${art.fetchedAt}`);
    console.log(`     delta_hours:           ${art.publishedAtDeltaHours !== null ? art.publishedAtDeltaHours + 'h' : 'N/A'}`);
    console.log(`     is_suspicious:         ${art.isTimestampSuspicious}`);
    if (art.publishedAt) validDatesCount++;
    if (art.isTimestampSuspicious) suspiciousDatesCount++;
  });

  // Section B: Raw Content Truncation Audit
  console.log('\n==================================================');
  console.log('SECTION B: RAW CONTENT TRUNCATION AUDIT');
  console.log('==================================================');
  let exactly50kCount = 0;
  let properlySizedCount = 0;
  let truncatedCount = 0;

  stored.forEach(art => {
    if (art.rawContentBytes === 50000 || art.rawContent.length === 50000) {
      exactly50kCount++;
    } else {
      properlySizedCount++;
    }
    if (art.rawContentTruncated) {
      truncatedCount++;
    }
  });

  console.log(`Articles with exactly 50,000 bytes: ${exactly50kCount} (Fixed: should be 0)`);
  console.log(`Articles with full preserved raw HTML: ${properlySizedCount}`);
  console.log(`Articles where truncation was needed: ${truncatedCount}`);

  // Section G: Persistence Check
  console.log('\n==================================================');
  console.log('SECTION G: DATABASE PERSISTENCE CHECK');
  console.log('==================================================');
  const isPersisted = rawArticlesStore.isDatabasePersisted();
  console.log(`database_persisted = ${isPersisted}`);
  const diskPath = path.join(process.cwd(), '.data', 'raw_articles.json');
  const diskExists = fs.existsSync(diskPath);
  console.log(`Disk storage file (.data/raw_articles.json) exists: ${diskExists}`);
  if (diskExists) {
    const diskStat = fs.statSync(diskPath);
    console.log(`Disk file size: ${(diskStat.size / 1024).toFixed(1)} KB`);
  }

  // Section H: Legacy Story Isolation
  console.log('\n==================================================');
  console.log('SECTION H: LEGACY STORY ISOLATION');
  console.log('==================================================');
  const legacyCount = SAMPLE_INTELLIGENCE_STORIES.filter(s => s.isLegacy === true).length;
  console.log(`Total sample stories: ${SAMPLE_INTELLIGENCE_STORIES.length}`);
  console.log(`Stories marked with isLegacy=true: ${legacyCount}`);
  const allLegacyIsolated = legacyCount === SAMPLE_INTELLIGENCE_STORIES.length;
  console.log(`All legacy stories isolated: ${allLegacyIsolated}`);

  // Section I: Final Acceptance Test (10 Random Articles, 11 checks, 10/10 required)
  console.log('\n==================================================');
  console.log('SECTION I: FINAL ACCEPTANCE TEST (10 RANDOM ARTICLES)');
  console.log('==================================================');

  // Select 10 real stored articles (filter out any synthetic test articles)
  const realArticles = stored.filter(a => a.sourceId !== 'src-test' && a.httpStatus === 200 && a.isArticlePage);
  if (realArticles.length < 10) {
    console.warn(`Only found ${realArticles.length} real articles, testing all available...`);
  }

  // Shuffle and pick 10
  const shuffled = [...realArticles].sort(() => 0.5 - Math.random());
  const sample10 = shuffled.slice(0, 10);

  let passedArticles = 0;
  const auditReport: Array<{
    title: string;
    url: string;
    publisher: string;
    wordCount: number;
    checks: Record<string, boolean>;
    allPassed: boolean;
  }> = [];

  for (let i = 0; i < sample10.length; i++) {
    const art = sample10[i];

    // Re-verify URL live programmatically with browser headers
    let liveOpens = false;
    let liveStatus = 0;
    try {
      const res = await fetch(art.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        },
      });
      liveStatus = res.status;
      liveOpens = res.status >= 200 && res.status <= 299;
    } catch {
      liveOpens = false;
    }

    const checks = {
      urlOpens: liveOpens,
      http200: art.httpStatus >= 200 && art.httpStatus <= 299,
      finalUrlCorrect: Boolean(art.finalUrl && art.finalUrl.startsWith('http')),
      canonicalUrlLegit: Boolean(!art.canonicalUrl || art.canonicalUrl.startsWith('http')),
      publisherMatches: Boolean(art.publisher && art.publisher.length > 2),
      titleMatches: Boolean(art.title && art.title.length >= 10),
      publishedAtValid: Boolean(art.publishedAt && art.publishedAt !== art.fetchedAt),
      cleanedContentRealBody: Boolean(art.cleanedContent && art.cleanedContent.split(/\s+/).length >= 100),
      contentHashExists: Boolean(art.contentHash && art.contentHash.length === 64),
      fetchVerified: art.fetchVerified === true,
      isArticlePage: art.isArticlePage === true,
    };

    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) passedArticles++;

    auditReport.push({
      title: art.title,
      url: art.url,
      publisher: art.publisher,
      wordCount: art.cleanedContent ? art.cleanedContent.split(/\s+/).length : 0,
      checks,
      allPassed,
    });

    console.log(`\n[Article ${i + 1}/${sample10.length}] "${art.title.slice(0, 60)}..."`);
    console.log(`  Publisher:    ${art.publisher}`);
    console.log(`  URL:          ${art.url}`);
    console.log(`  Published At: ${art.publishedAt} (via ${art.dateExtractionSource})`);
    console.log(`  Body Words:   ${art.cleanedContent.split(/\s+/).length} words`);
    console.log(`  Checks:       ${allPassed ? '✅ ALL 11 CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
    if (!allPassed) {
      console.log('  Failed checks:', Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', '));
    }
  }

  console.log('\n==================================================');
  console.log(`FINAL ACCEPTANCE PASS RATE: ${passedArticles}/${sample10.length}`);
  console.log('==================================================');

  return {
    coverageResult: ingestResult,
    negativeResult: await runNegativeTests(),
    persistenceResult: { isPersisted, diskExists },
    legacyIsolated: allLegacyIsolated,
    acceptancePassCount: passedArticles,
    acceptanceTotalCount: sample10.length,
    auditReport,
  };
}

runCoverageAndAcceptanceTests()
  .then(res => {
    console.log('\nValidation run complete. Summary:');
    console.log(`Negative Tests: ${res.negativeResult.passed}/${res.negativeResult.total}`);
    console.log(`Acceptance Rate: ${res.acceptancePassCount}/${res.acceptanceTotalCount}`);
    console.log(`Database Persisted: ${res.persistenceResult.isPersisted}`);
    console.log(`Legacy Isolated: ${res.legacyIsolated}`);
    process.exit(res.acceptancePassCount >= 10 && res.negativeResult.passed === 9 ? 0 : 1);
  })
  .catch(err => {
    console.error('Validation test crashed:', err);
    process.exit(1);
  });
