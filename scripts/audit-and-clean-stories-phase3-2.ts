import { getPostgresPool } from '../src/lib/database/postgres';
import { verifySourceEventAlignment, StoryEventDefinition } from '../src/lib/verification/event-alignment';
import { generateCanonicalEventFingerprint, computeSameEventScore } from '../src/lib/analysis/event-clustering';
import crypto from 'crypto';

export interface AuditAndCleanResult {
  stories_before: number;
  sources_before: number;
  unrelated_sources_removed: number;
  duplicate_story_groups_found: number;
  duplicate_stories_merged: number;
  stories_after: number;
  sources_after: number;
  orphan_sources: number;
  stories_with_zero_valid_sources: number;
}

export async function runAuditAndClean(): Promise<AuditAndCleanResult> {
  const pool = getPostgresPool();
  console.log('====================================================');
  console.log('STARTING PHASE 3.2: DATABASE AUDIT & CLEANUP');
  console.log('====================================================');

  // 1. Initial State
  const initialStoriesRes = await pool.query('SELECT count(*) FROM public.intelligence_stories;');
  const stories_before = Number(initialStoriesRes.rows[0].count);

  const initialSourcesRes = await pool.query('SELECT count(*) FROM public.story_sources;');
  const sources_before = Number(initialSourcesRes.rows[0].count);

  console.log(`[Before Audit] Stories: ${stories_before}, Sources: ${sources_before}`);

  // 2. Audit Attached Sources against the 3 Gates
  // Gate 1: URL_VALID, Gate 2: EVENT_MATCH (>=80), Gate 3: CORE_CLAIM_SUPPORTED (>=1)
  let unrelated_sources_removed = 0;

  const sourcesQuery = `
    SELECT 
      ss.id as source_id,
      ss.story_id,
      ss.raw_article_id,
      ss.source_name,
      ss.article_title,
      ss.article_url,
      ss.final_url,
      ss.is_primary_claim_source,
      s.title as story_title,
      s.category as story_category,
      s.extracted_facts,
      ra.http_status,
      ra.fetch_verified,
      ra.cleaned_content,
      ae.primary_event_type,
      ae.secondary_event_types,
      ae.entities,
      ae.geographies,
      ae.event_date,
      ae.verified_facts
    FROM public.story_sources ss
    JOIN public.intelligence_stories s ON ss.story_id = s.id
    LEFT JOIN public.raw_articles ra ON ss.raw_article_id = ra.id
    LEFT JOIN public.article_extractions ae ON ra.id = ae.raw_article_id;
  `;
  const allSourcesRes = await pool.query(sourcesQuery);

  for (const row of allSourcesRes.rows) {
    const rawArticle = {
      id: row.raw_article_id || row.source_id,
      title: row.article_title || row.story_title,
      url: row.article_url,
      finalUrl: row.final_url || row.article_url,
      httpStatus: row.http_status || 200,
      fetchVerified: row.fetch_verified !== false,
      cleanedContent: row.cleaned_content || '',
    };

    const storyClaims = (row.extracted_facts?.claims || []).map((c: any, i: number) => ({
      id: `claim-${i}`,
      claimText: typeof c === 'string' ? c : (c.claim || ''),
    }));

    if (storyClaims.length === 0 && row.verified_facts) {
      row.verified_facts.forEach((vf: any, i: number) => {
        storyClaims.push({ id: `vf-${i}`, claimText: vf.claim_text });
      });
    }

    const storyEvent: StoryEventDefinition = {
      primaryEventType: row.primary_event_type || row.story_category || 'GENERAL',
      primaryEntities: (row.entities || []).map((e: any) => ({ name: e.name, role: e.role_in_event })),
      coreClaims: storyClaims,
      geography: (row.geographies || [])[0] || 'Vietnam',
      eventDate: row.event_date,
    };

    const alignment = verifySourceEventAlignment({
      article: rawArticle as any,
      extraction: row.primary_event_type ? {
        id: 'ext-aud',
        raw_article_id: row.raw_article_id,
        primary_event_type: row.primary_event_type,
        secondary_event_types: row.secondary_event_types || [],
        entities: row.entities || [],
        geographies: row.geographies || [],
        event_date: row.event_date,
        verified_facts: row.verified_facts || [],
      } as any : null,
      storyEvent,
      isPrimarySource: Boolean(row.is_primary_claim_source),
    });

    if (!alignment.isAttachedValid) {
      console.warn(`[REMOVING UNRELATED SOURCE] ID: ${row.source_id} ("${row.article_title}") from Story: "${row.story_title}": ${alignment.rejectionReason}`);
      await pool.query('DELETE FROM public.story_sources WHERE id = $1', [row.source_id]);
      unrelated_sources_removed++;
    } else {
      // Update source with verified role, match score, and claim IDs
      await pool.query(`
        UPDATE public.story_sources SET
          source_role = $1,
          event_match_score = $2,
          supported_core_claim_ids = $3,
          url_verified = true,
          event_verified = true,
          claim_verified = true
        WHERE id = $4;
      `, [alignment.sourceRole, alignment.eventMatchScore, alignment.supportedCoreClaimIds, row.source_id]);
    }
  }

  // 3. Group Stories by same_event_score / event_fingerprint
  const storiesRes = await pool.query(`
    SELECT 
      s.id,
      s.title,
      s.category,
      s.relevance_score,
      s.material_update,
      s.extracted_facts,
      s.source_publication_date_local,
      s.daily_brief_date,
      s.event_date,
      s.created_at
    FROM public.intelligence_stories s
    ORDER BY s.created_at ASC;
  `);

  const stories = storiesRes.rows;
  const groups: Array<any[]> = [];
  const processedStoryIds = new Set<string>();

  for (let i = 0; i < stories.length; i++) {
    const current = stories[i];
    if (processedStoryIds.has(current.id)) continue;

    const group = [current];
    processedStoryIds.add(current.id);

    // Compute canonical event representation for current
    const currentFacts = current.extracted_facts || {};
    const currentEntities = (currentFacts.keyPartners || []).map((p: string) => ({ name: p }))
      .concat((currentFacts.entities || []).map((e: any) => ({ name: typeof e === 'string' ? e : e.name })));
    
    // Also parse entities from title if empty
    if (currentEntities.length === 0) {
      const words = current.title.split(' ').slice(0, 4);
      currentEntities.push({ name: words.join(' ') });
    }

    const currentFp = generateCanonicalEventFingerprint({
      primaryEventType: current.category || 'GENERAL',
      entities: currentEntities,
      projectOrAsset: currentFacts.projectOrAsset,
      geography: 'Vietnam',
      eventDate: current.event_date ? String(current.event_date).slice(0, 10) : undefined,
    });

    for (let j = i + 1; j < stories.length; j++) {
      const peer = stories[j];
      if (processedStoryIds.has(peer.id)) continue;

      const peerFacts = peer.extracted_facts || {};
      const peerEntities = (peerFacts.keyPartners || []).map((p: string) => ({ name: p }))
        .concat((peerFacts.entities || []).map((e: any) => ({ name: typeof e === 'string' ? e : e.name })));
      if (peerEntities.length === 0) {
        const words = peer.title.split(' ').slice(0, 4);
        peerEntities.push({ name: words.join(' ') });
      }

      const peerFp = generateCanonicalEventFingerprint({
        primaryEventType: peer.category || 'GENERAL',
        entities: peerEntities,
        projectOrAsset: peerFacts.projectOrAsset,
        geography: 'Vietnam',
        eventDate: peer.event_date ? String(peer.event_date).slice(0, 10) : undefined,
      });

      const sameFp = currentFp === peerFp;
      const sim = computeSameEventScore(
        {
          primaryEventType: current.category || 'GENERAL',
          entities: currentEntities,
          projectOrAsset: currentFacts.projectOrAsset,
          claimsText: JSON.stringify(currentFacts),
          eventDate: current.event_date ? String(current.event_date).slice(0, 10) : undefined,
        },
        {
          primaryEventType: peer.category || 'GENERAL',
          entities: peerEntities,
          projectOrAsset: peerFacts.projectOrAsset,
          claimsText: JSON.stringify(peerFacts),
          eventDate: peer.event_date ? String(peer.event_date).slice(0, 10) : undefined,
        }
      );

      // Same event check (threshold >= 85 or identical fingerprint or high title similarity)
      const normCurTitle = current.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const normPeerTitle = peer.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const titleMatch = normCurTitle.includes(normPeerTitle) || normPeerTitle.includes(normCurTitle);

      if (sameFp || sim.isSameEvent || (sim.score >= 75 && titleMatch)) {
        group.push(peer);
        processedStoryIds.add(peer.id);
      }
    }

    groups.push(group);
  }

  const duplicateGroups = groups.filter(g => g.length > 1);
  const duplicate_story_groups_found = duplicateGroups.length;
  let duplicate_stories_merged = 0;

  console.log(`[Grouping Result] Total story groups: ${groups.length}. Groups with duplicates: ${duplicate_story_groups_found}`);

  // 4. Merge duplicate stories within each group into ONE canonical story & cluster
  for (const group of groups) {
    // Sort so canonical is chosen: prioritize material_update, then relevance_score DESC, then newest created_at DESC
    group.sort((a, b) => {
      if (b.material_update && !a.material_update) return 1;
      if (a.material_update && !b.material_update) return -1;
      if (b.relevance_score !== a.relevance_score) return b.relevance_score - a.relevance_score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const canonicalStory = group[0];
    const duplicates = group.slice(1);

    const clusterId = crypto.randomUUID();
    const groupFacts = canonicalStory.extracted_facts || {};
    const groupEntities = (groupFacts.keyPartners || []).map((p: string) => ({ name: p }))
      .concat((groupFacts.entities || []).map((e: any) => ({ name: typeof e === 'string' ? e : e.name })));
    if (groupEntities.length === 0) {
      groupEntities.push({ name: canonicalStory.title.split(' ').slice(0, 4).join(' ') });
    }

    const canonicalFingerprint = generateCanonicalEventFingerprint({
      primaryEventType: canonicalStory.category || 'GENERAL',
      entities: groupEntities,
      projectOrAsset: groupFacts.projectOrAsset,
      geography: 'Vietnam',
      eventDate: canonicalStory.event_date ? String(canonicalStory.event_date).slice(0, 10) : undefined,
    });

    const canonicalClaims = (groupFacts.claims || []).map((c: any, i: number) => ({
      id: `claim-${clusterId.slice(0, 8)}-${i + 1}`,
      claim: typeof c === 'string' ? c : (c.claim || ''),
      verified: true,
    }));

    // Insert or update event cluster
    const clusterInsertRes = await pool.query(`
      INSERT INTO public.event_clusters (
        id, event_fingerprint, primary_event_type, primary_entities, event_date,
        geography, project_or_asset, canonical_core_claims, canonical_story_id,
        first_seen_at, latest_update_at, material_update_version
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now(), $10
      )
      ON CONFLICT (event_fingerprint) DO UPDATE SET
        canonical_story_id = EXCLUDED.canonical_story_id,
        latest_update_at = now()
      RETURNING id;
    `, [
      clusterId,
      canonicalFingerprint,
      canonicalStory.category || 'GENERAL',
      JSON.stringify(groupEntities),
      canonicalStory.event_date || null,
      'Vietnam',
      groupFacts.projectOrAsset || null,
      JSON.stringify(canonicalClaims),
      canonicalStory.id,
      canonicalStory.material_update ? 2 : 1,
    ]);

    const actualClusterId = clusterInsertRes.rows[0].id;

    // Link canonical story to cluster
    await pool.query(`
      UPDATE public.intelligence_stories SET
        cluster_id = $1,
        event_fingerprint = $2
      WHERE id = $3;
    `, [actualClusterId, canonicalFingerprint, canonicalStory.id]);

    // Merge duplicates into canonicalStory
    for (const dup of duplicates) {
      console.log(`[MERGING DUPLICATE] Story ID: ${dup.id} ("${dup.title}") -> Canonical: ${canonicalStory.id} ("${canonicalStory.title}")`);

      // Re-map sources: avoid duplicate source attachments for identical article_url / raw_article_id
      const dupSourcesRes = await pool.query('SELECT * FROM public.story_sources WHERE story_id = $1', [dup.id]);
      for (const src of dupSourcesRes.rows) {
        const existingCheck = await pool.query(`
          SELECT id FROM public.story_sources 
          WHERE story_id = $1 AND (raw_article_id = $2 OR article_url = $3)
          LIMIT 1;
        `, [canonicalStory.id, src.raw_article_id, src.article_url]);

        if (existingCheck.rows.length > 0) {
          // Already present on canonical story -> delete duplicate source row
          await pool.query('DELETE FROM public.story_sources WHERE id = $1', [src.id]);
        } else {
          // Re-map to canonical story
          await pool.query('UPDATE public.story_sources SET story_id = $1 WHERE id = $2', [canonicalStory.id, src.id]);
        }
      }

      // Re-map user feedback
      await pool.query('UPDATE public.user_feedback SET story_id = $1 WHERE story_id = $2', [canonicalStory.id, dup.id]);

      // Re-map analytics events
      await pool.query('UPDATE public.analytics_events SET story_id = $1 WHERE story_id = $2', [canonicalStory.id, dup.id]);

      // Re-map story companies
      await pool.query(`
        INSERT INTO public.story_companies (story_id, company_id, role)
        SELECT $1, company_id, role FROM public.story_companies WHERE story_id = $2
        ON CONFLICT DO NOTHING;
      `, [canonicalStory.id, dup.id]);
      await pool.query('DELETE FROM public.story_companies WHERE story_id = $1', [dup.id]);

      // Delete the duplicate story record
      await pool.query('DELETE FROM public.intelligence_stories WHERE id = $1', [dup.id]);
      duplicate_stories_merged++;
    }

    // Update canonical story verified_source_count and update cluster raw_article_ids and source_ids
    const attachedSourcesRes = await pool.query(`
      SELECT id, raw_article_id, source_role FROM public.story_sources WHERE story_id = $1;
    `, [canonicalStory.id]);

    const validVerifiedCount = attachedSourcesRes.rows.filter(
      r => r.source_role === 'PRIMARY' || r.source_role === 'CORROBORATING'
    ).length;

    const rawIds = attachedSourcesRes.rows.map(r => r.raw_article_id).filter(Boolean);
    const srcIds = attachedSourcesRes.rows.map(r => r.id);

    await pool.query(`
      UPDATE public.event_clusters SET
        raw_article_ids = $1,
        source_ids = $2
      WHERE id = $3;
    `, [rawIds, srcIds, actualClusterId]);
  }

  // 5. Query Final State & Verification Metrics
  const finalStoriesRes = await pool.query('SELECT count(*) FROM public.intelligence_stories;');
  const stories_after = Number(finalStoriesRes.rows[0].count);

  const finalSourcesRes = await pool.query('SELECT count(*) FROM public.story_sources;');
  const sources_after = Number(finalSourcesRes.rows[0].count);

  const orphanSourcesRes = await pool.query(`
    SELECT count(*) FROM public.story_sources 
    WHERE story_id NOT IN (SELECT id FROM public.intelligence_stories);
  `);
  const orphan_sources = Number(orphanSourcesRes.rows[0].count);

  const zeroSourcesRes = await pool.query(`
    SELECT count(*) FROM public.intelligence_stories 
    WHERE id NOT IN (
      SELECT story_id FROM public.story_sources 
      WHERE source_role IN ('PRIMARY', 'CORROBORATING')
    );
  `);
  const stories_with_zero_valid_sources = Number(zeroSourcesRes.rows[0].count);

  const result: AuditAndCleanResult = {
    stories_before,
    sources_before,
    unrelated_sources_removed,
    duplicate_story_groups_found,
    duplicate_stories_merged,
    stories_after,
    sources_after,
    orphan_sources,
    stories_with_zero_valid_sources,
  };

  console.log('====================================================');
  console.log('PHASE 3.2 AUDIT & CLEANUP COMPLETE. METRICS:');
  console.log(JSON.stringify(result, null, 2));
  console.log('====================================================');

  return result;
}

if (require.main === module) {
  runAuditAndClean()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Audit and cleanup failed:', err);
      process.exit(1);
    });
}
