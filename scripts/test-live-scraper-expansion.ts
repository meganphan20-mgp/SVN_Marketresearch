import { getSources } from '../src/lib/data/intelligence-store';
import { discoverArticlesFromSource } from '../src/lib/ingestion/source-discovery';
import { fetchAndValidateRawArticle } from '../src/lib/ingestion/raw-article-fetcher';
import { saveRawArticle, getRawArticleCount } from '../src/lib/data/raw-articles-store';
import { getPostgresPool, isPostgresConnected } from '../src/lib/database/postgres';
import { DiscoveredArticleCandidate, RawArticle } from '../src/types/intelligence';

/**
 * LIVE MULTI-SOURCE SCRAPER EXPANSION TEST SUITE
 * 
 * Verifies live connectivity, discovery, body extraction, date parsing,
 * and PostgreSQL persistence across Tier 1, Tier 2, and Tier 3 sources.
 */
async function runLiveScraperExpansionTest() {
  console.log('========================================================================');
  console.log('🚀 LIVE MULTI-SOURCE SCRAPER EXPANSION TEST SUITE');
  console.log('========================================================================\n');

  // 1. Verify PostgreSQL Database Connectivity
  const dbConnected = await isPostgresConnected();
  console.log(`[DB Check] PostgreSQL connected: ${dbConnected ? '✅ YES' : '❌ NO'}`);
  if (!dbConnected) {
    console.error('Fatal: PostgreSQL connection is required for live scraper expansion.');
    process.exit(1);
  }

  const countBefore = await getRawArticleCount();
  console.log(`[DB Check] Raw articles in PostgreSQL before test: ${countBefore}\n`);

  // 2. Fetch all active sources
  const allSources = await getSources();
  const activeSources = allSources.filter(s => s.isActive && s.rssUrl);
  console.log(`[Source Registry] Loaded ${allSources.length} total sources (${activeSources.length} active with discovery endpoints)\n`);

  // Select target test sources spanning Tier 1, Tier 2, Tier 3
  // Including RSS feeds and HTML Section scrapers
  const targetSourceIds = [
    'baodautu',      // Báo Đầu Tư (Section Scrape)
    'theinvestor',   // The Investor (Section Scrape)
    'vneconomy',     // VnEconomy (Section Scrape)
    'vir',           // VIR (Section Scrape)
    'cafebiz',       // CafeBiz (RSS)
    'vietnamnet',    // VietnamNet (RSS)
    'cafef',         // CafeF (RSS)
    'tuoitre',       // Tuoi Tre (RSS)
    'thanhnien',     // Thanh Nien (RSS)
    'vietnamnews',   // Vietnam News (RSS UTF-16)
    'nikkei',        // Nikkei Asia (RSS)
  ];

  const testSources = activeSources.filter(s => 
    targetSourceIds.some(id => s.domain.includes(id) || s.name.toLowerCase().includes(id))
  );

  console.log(`[Test Selection] Testing ${testSources.length} representative sources across Tier 1 & Tier 2:`);
  testSources.forEach(s => console.log(`  - [${s.tier}] ${s.name} (${s.domain}) -> ${s.rssUrl}`));
  console.log('\n------------------------------------------------------------------------');

  const sourceResults: Array<{
    name: string;
    domain: string;
    tier: string;
    discoveredCount: number;
    fetchedCount: number;
    sampleArticle?: {
      title: string;
      url: string;
      publishedAt: string | null;
      dateSource: string;
      localDate: string | null;
      wordCount: number;
    };
    errors: string[];
  }> = [];

  let totalDiscoveredAll = 0;
  let totalFetchedAll = 0;
  let totalStoredAll = 0;

  for (const source of testSources) {
    console.log(`\n🔍 Scanning source: ${source.name} (${source.domain})...`);
    const errors: string[] = [];

    // Step A: Discover candidate articles
    let candidates: DiscoveredArticleCandidate[] = [];
    try {
      candidates = await discoverArticlesFromSource(source, 3); // Test with 3 candidates per source
    } catch (err: any) {
      errors.push(`Discovery error: ${err.message}`);
    }

    console.log(`   Found ${candidates.length} candidate article URLs.`);
    totalDiscoveredAll += candidates.length;

    let fetchedCount = 0;
    let sampleArticle: any = null;

    // Step B: Fetch and validate each article
    for (const cand of candidates) {
      try {
        const { rawArticle, validationResult } = await fetchAndValidateRawArticle(cand);

        if (rawArticle && validationResult.isValidArticlePage) {
          fetchedCount++;
          totalFetchedAll++;

          // Step C: Persist to PostgreSQL raw_articles
          const saved = await saveRawArticle(rawArticle);
          if (saved) {
            totalStoredAll++;
          }

          if (!sampleArticle) {
            sampleArticle = {
              title: rawArticle.title,
              url: rawArticle.url,
              publishedAt: rawArticle.publishedAt,
              dateSource: rawArticle.dateExtractionSource,
              localDate: rawArticle.sourcePublicationDateLocal || null,
              wordCount: rawArticle.cleanedContent.split(/\s+/).length,
            };
          }
        } else {
          if (validationResult.failureReasons.length > 0) {
            errors.push(`${cand.discoveredUrl.slice(0, 50)}...: ${validationResult.failureReasons.join(', ')}`);
          }
        }
      } catch (err: any) {
        errors.push(`Fetch error on ${cand.discoveredUrl}: ${err.message}`);
      }
    }

    if (sampleArticle) {
      console.log(`   ✅ Fetched ${fetchedCount}/${candidates.length} valid articles.`);
      console.log(`   Sample: "${sampleArticle.title}"`);
      console.log(`   Words: ${sampleArticle.wordCount} | Published: ${sampleArticle.publishedAt} (${sampleArticle.dateSource}) | Local Date: ${sampleArticle.localDate}`);
    } else {
      console.log(`   ⚠️ 0 valid articles extracted from ${candidates.length} candidates.`);
      if (errors.length > 0) {
        console.log(`   Reasons: ${errors[0]}`);
      }
    }

    sourceResults.push({
      name: source.name,
      domain: source.domain,
      tier: source.tier,
      discoveredCount: candidates.length,
      fetchedCount,
      sampleArticle,
      errors,
    });
  }

  // 3. Post-run Database Verification
  const countAfter = await getRawArticleCount();
  const pool = getPostgresPool();
  const dbSampleRes = await pool.query(`
    SELECT publisher, title, url, published_at, source_publication_date_local, 
           LENGTH(cleaned_content) as body_length
    FROM public.raw_articles 
    WHERE fetched_at >= NOW() - INTERVAL '5 minutes'
    ORDER BY fetched_at DESC
    LIMIT 5
  `);

  console.log('\n========================================================================');
  console.log('📊 LIVE SCRAPER EXPANSION AUDIT REPORT');
  console.log('========================================================================');
  console.log(`Sources Tested:                     ${testSources.length}`);
  console.log(`Total URLs Discovered:             ${totalDiscoveredAll}`);
  console.log(`Total Articles Fetched & Verified:  ${totalFetchedAll}`);
  console.log(`Total Persisted to PostgreSQL:      ${totalStoredAll}`);
  console.log(`DB Count Before:                    ${countBefore}`);
  console.log(`DB Count After:                     ${countAfter}`);
  console.log(`Net New Articles Stored:           ${countAfter - countBefore}`);
  console.log('------------------------------------------------------------------------');

  console.log('\nSource-by-Source Summary:');
  for (const r of sourceResults) {
    const statusIcon = r.fetchedCount > 0 ? '✅' : (r.discoveredCount > 0 ? '⚠️' : '❌');
    console.log(`${statusIcon} ${r.name.padEnd(30)} | Discovered: ${r.discoveredCount} | Verified: ${r.fetchedCount}`);
    if (r.sampleArticle) {
      console.log(`   └─ "${r.sampleArticle.title.slice(0, 65)}..."`);
      console.log(`      (${r.sampleArticle.wordCount} words, pubDate: ${r.sampleArticle.publishedAt || 'N/A'}, dateSource: ${r.sampleArticle.dateSource})`);
    }
  }

  if (dbSampleRes.rows.length > 0) {
    console.log('\nLatest Live Articles in PostgreSQL:');
    dbSampleRes.rows.forEach((row, i) => {
      console.log(`${i + 1}. [${row.publisher}] ${row.title.slice(0, 60)}...`);
      console.log(`   URL: ${row.url}`);
      console.log(`   PubDate: ${row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : 'N/A'} | Local Date: ${row.source_publication_date_local || 'N/A'} | Body: ${row.body_length} chars\n`);
    });
  }

  // Acceptance Verification:
  const successfulSources = sourceResults.filter(r => r.fetchedCount > 0);
  const successRate = (successfulSources.length / testSources.length) * 100;
  console.log(`Live Source Success Rate: ${successfulSources.length}/${testSources.length} (${successRate.toFixed(1)}%)`);

  if (successfulSources.length >= 8) {
    console.log('\n🎉 PHASE 4 LIVE MULTI-SOURCE SCRAPER EXPANSION: PASSED!');
  } else {
    console.error('\n❌ Less than 8 sources succeeded. Check network connectivity or source rules.');
    process.exit(1);
  }

  await pool.end();
}

runLiveScraperExpansionTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
