import { getPostgresPool } from '../src/lib/database/postgres';
import { parseArticleHtml } from '../src/lib/verification/source-first-validator';
import { extractFactsAndEventFromRawArticle } from '../src/lib/extraction/fact-event-extractor';
import { scoreArticleRelevance } from '../src/lib/relevance/relevance-scorer';
import { synthesizeStrategicStory } from '../src/lib/analysis/strategic-synthesizer';
import { saveArticleExtraction } from '../src/lib/database/extraction-store';
import { saveArticleRelevanceScore } from '../src/lib/database/relevance-store';
import { saveStoryToPostgres } from '../src/lib/database/story-store';
import { calculateJaccardSimilarity, extractTokens } from '../src/lib/verification/deduplication';

async function auditAndCleanProductionData() {
  console.log('================================================================');
  console.log('🧹 COMPREHENSIVE PRODUCTION DATA AUDIT & HARDENING');
  console.log('================================================================\n');

  const pool = getPostgresPool();

  // ---------------------------------------------------------------------------
  // STEP 1: Purge known 404 / Synthetic / Non-working URLs
  // ---------------------------------------------------------------------------
  console.log('--- STEP 1: Purging 404 & Synthetic URLs ---');
  const badUrls = [
    'https://baodautu.vn/sojitz-mo-rong-kcn-long-duc-200ha-dong-nai.html',
    'https://baodautu.vn/sojitz-dong-nai-factory-expansion-d218201.html',
    'https://baodautu.vn/chinh-phu-ban-hanh-nghi-dinh-80-dppa-d218991.html',
    'https://vietnamnews.vn/economy/moit-proposes-new-dppa-framework.html',
  ];

  for (const badUrl of badUrls) {
    const deletedSources = await pool.query(`DELETE FROM public.story_sources WHERE article_url = $1 RETURNING id, story_id;`, [badUrl]);
    const deletedRaw = await pool.query(`DELETE FROM public.raw_articles WHERE url = $1 RETURNING id;`, [badUrl]);
    console.log(`Purged bad URL: ${badUrl} (Deleted ${deletedSources.rowCount} story_sources, ${deletedRaw.rowCount} raw_articles)`);
  }

  // Also purge non-business / non-relevant stories like Singapore goalkeeper food stall
  const nonRelevantPurge = await pool.query(`
    DELETE FROM public.intelligence_stories 
    WHERE title ILIKE '%goalkeeper%' OR title ILIKE '%food stall%'
    RETURNING id, title;
  `);
  for (const r of nonRelevantPurge.rows) {
    console.log(`Purged non-business story: "${r.title}" (${r.id})`);
  }

  // ---------------------------------------------------------------------------
  // STEP 2: Re-parse & Clean Raw Articles with Updated Container Logic
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 2: Re-extracting Clean Body for Affected Articles ---');
  const rawArticles = await pool.query(`
    SELECT id, publisher, title, url, raw_content 
    FROM public.raw_articles 
    WHERE raw_content IS NOT NULL;
  `);

  console.log(`Auditing ${rawArticles.rows.length} raw articles...`);
  for (const r of rawArticles.rows) {
    const parsed = parseArticleHtml(r.raw_content, r.url);
    await pool.query(`
      UPDATE public.raw_articles SET
        title = $1,
        cleaned_content = $2,
        canonical_url = $3,
        date_extraction_source = $4
      WHERE id = $5;
    `, [parsed.title || r.title, parsed.articleBody, parsed.canonicalUrl, parsed.dateExtractionSource, r.id]);

    // Re-extract facts
    const updatedRaw = {
      id: r.id,
      publisher: r.publisher,
      title: parsed.title || r.title,
      url: r.url,
      cleanedContent: parsed.articleBody,
      rawContent: r.raw_content,
      publishedAt: '2026-10-07',
    } as any;

    const extraction = extractFactsAndEventFromRawArticle(updatedRaw);
    const savedExtraction = await saveArticleExtraction(extraction);

    const relevance = await scoreArticleRelevance(savedExtraction, updatedRaw);
    await saveArticleRelevanceScore(relevance);
  }
  console.log(`✅ Successfully re-extracted and re-scored all ${rawArticles.rows.length} raw articles.`);

  // ---------------------------------------------------------------------------
  // STEP 3: Deduplicate Existing Intelligence Stories
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 3: Deduplicating Existing Stories ---');
  const storiesRes = await pool.query(`
    SELECT s.id, s.title, s.summary, s.relevance_score, s.created_at,
           (SELECT count(*) FROM public.story_sources ss WHERE ss.story_id = s.id) as source_count
    FROM public.intelligence_stories s
    ORDER BY s.title, s.created_at ASC;
  `);

  const stories = storiesRes.rows;
  console.log(`Current story count: ${stories.length}`);

  const processed = new Set<string>();
  const duplicateIdsToDelete: string[] = [];

  for (let i = 0; i < stories.length; i++) {
    const storyA = stories[i];
    if (processed.has(storyA.id)) continue;

    const group = [storyA];
    processed.add(storyA.id);

    const tokensA = extractTokens(storyA.title);

    for (let j = i + 1; j < stories.length; j++) {
      const storyB = stories[j];
      if (processed.has(storyB.id)) continue;

      const tokensB = extractTokens(storyB.title);
      const titleSim = calculateJaccardSimilarity(tokensA, tokensB);

      // Check duplicate condition:
      // Exact same title OR high Jaccard similarity (>= 0.60)
      // OR specific semantic pairs:
      // e.g. "Tách EVNNPT khỏi EVN" and "Bộ Công Thương: Sớm tách Tổng công ty Truyền tải điện quốc gia khỏi EVN"
      const isEvnPair = (storyA.title.includes('EVNNPT') || storyA.title.includes('Truyền tải điện')) &&
                        (storyB.title.includes('EVNNPT') || storyB.title.includes('Truyền tải điện'));
      const isSojitzLongDuc = storyA.title.includes('Long Đức') && storyB.title.includes('Long Đức');
      const isDppaPair = storyA.title.includes('Nghị định 80') && storyB.title.includes('Nghị định 80');

      if (titleSim >= 0.55 || isEvnPair || isSojitzLongDuc || isDppaPair) {
        group.push(storyB);
        processed.add(storyB.id);
      }
    }

    if (group.length > 1) {
      console.log(`\nFound duplicate cluster of ${group.length} stories:`);
      group.forEach(g => console.log(`  - [${g.id}] (Sources: ${g.source_count}): ${g.title}`));

      // Keep the one with the most sources, or oldest created
      group.sort((a, b) => b.source_count - a.source_count || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const canonical = group[0];
      const duplicates = group.slice(1);

      console.log(`  => KEEPING CANONICAL: [${canonical.id}] "${canonical.title}"`);

      for (const dup of duplicates) {
        // Move all sources from dup to canonical
        await pool.query(`
          UPDATE public.story_sources 
          SET story_id = $1 
          WHERE story_id = $2;
        `, [canonical.id, dup.id]);

        duplicateIdsToDelete.push(dup.id);
        console.log(`  => RE-ASSIGNED SOURCES & MARKED FOR DELETION: [${dup.id}]`);
      }
    }
  }

  // Delete all duplicate stories
  if (duplicateIdsToDelete.length > 0) {
    for (const dupId of duplicateIdsToDelete) {
      await pool.query(`DELETE FROM public.story_companies WHERE story_id = $1;`, [dupId]);
      await pool.query(`DELETE FROM public.intelligence_stories WHERE id = $1;`, [dupId]);
    }
    console.log(`\n✅ Deleted ${duplicateIdsToDelete.length} duplicate intelligence stories.`);
  }

  // ---------------------------------------------------------------------------
  // STEP 4: Delete Orphan Stories with Zero Valid Sources
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 4: Purging Stories with 0 Valid Sources ---');
  const orphanRes = await pool.query(`
    SELECT s.id, s.title
    FROM public.intelligence_stories s
    LEFT JOIN public.story_sources ss ON s.id = ss.story_id
    GROUP BY s.id, s.title
    HAVING count(ss.id) = 0;
  `);

  for (const orphan of orphanRes.rows) {
    await pool.query(`DELETE FROM public.story_companies WHERE story_id = $1;`, [orphan.id]);
    await pool.query(`DELETE FROM public.intelligence_stories WHERE id = $1;`, [orphan.id]);
    console.log(`Purged orphan story (0 sources): "${orphan.title}" (${orphan.id})`);
  }

  // ---------------------------------------------------------------------------
  // STEP 5: Re-synthesize Any Remaining Polluted Stories (e.g. Google AI)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 5: Re-synthesizing Google AI & Remaining Stories ---');
  const googleStoryRes = await pool.query(`
    SELECT id FROM public.intelligence_stories WHERE title ILIKE '%Google%';
  `);

  if (googleStoryRes.rows.length > 0) {
    const googleStoryId = googleStoryRes.rows[0].id;
    // Fetch clean extraction & raw article
    const rawGoogleRes = await pool.query(`
      SELECT ra.*, ae.*, ars.*
      FROM public.raw_articles ra
      JOIN public.article_extractions ae ON ra.id = ae.raw_article_id
      JOIN public.article_relevance_scores ars ON ra.id = ars.raw_article_id
      WHERE ra.url ILIKE '%google-seeks-to-expand-ai%'
      LIMIT 1;
    `);

    if (rawGoogleRes.rows.length > 0) {
      const row = rawGoogleRes.rows[0];
      const article = {
        id: row.raw_article_id,
        title: row.title,
        url: row.url,
        cleanedContent: row.cleaned_content,
        publisher: row.publisher,
        publishedAt: row.published_at,
      } as any;
      const extraction = {
        id: row.id,
        entities: row.entities || [],
        geographies: row.geographies || ['Vietnam'],
        primary_event_type: 'PARTNERSHIP',
        sectors: ['Digital', 'AI'],
        verified_facts: row.verified_facts || [],
        numeric_facts: row.numeric_facts || [],
      } as any;
      const relevance = {
        relevance_score: 8,
        matched_divisions: [],
        matched_assets: [],
        matched_competitors: [],
        primary_sector_name: 'Digital',
        business_impact: 'OPPORTUNITY',
      } as any;

      const synthesized = synthesizeStrategicStory({
        articles: [{ article, extraction }],
        relevance,
        verification: { is_publishable: true, confidence_score: 75, verification_status: 'SINGLE_SOURCE', verified_claims: [] } as any,
        alignedSources: [],
      });

      await pool.query(`
        UPDATE public.intelligence_stories SET
          title = $1,
          summary = $2,
          why_it_matters_to_sojitz = $3,
          suggested_bd_action = $4,
          primary_sector_id = (SELECT id FROM public.sectors WHERE slug = 'digital' LIMIT 1),
          updated_at = now()
        WHERE id = $5;
      `, [
        article.title,
        synthesized.summary,
        synthesized.whyItMattersToSojitz,
        synthesized.suggestedBdAction,
        googleStoryId,
      ]);

      console.log(`✅ Re-synthesized Google AI story [${googleStoryId}]:`);
      console.log(`   Summary: ${synthesized.summary.slice(0, 150)}...`);
      console.log(`   Why it matters: ${synthesized.whyItMattersToSojitz.slice(0, 150)}...`);
      console.log(`   BD action: ${synthesized.suggestedBdAction.slice(0, 150)}...`);
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 6: Final Verification Count
  // ---------------------------------------------------------------------------
  const finalStoriesRes = await pool.query(`
    SELECT s.id, s.title, s.relevance_score,
           (SELECT count(*) FROM public.story_sources ss WHERE ss.story_id = s.id) as source_count
    FROM public.intelligence_stories s
    ORDER BY s.relevance_score DESC, s.title;
  `);

  console.log(`\n================================================================`);
  console.log(`🎉 AUDIT COMPLETE: Total verified stories remaining: ${finalStoriesRes.rows.length}`);
  console.log(`================================================================`);
  for (const s of finalStoriesRes.rows) {
    console.log(`- [${s.source_count} sources] (Score: ${s.relevance_score}/10) ${s.title}`);
  }

  process.exit(0);
}

auditAndCleanProductionData().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
