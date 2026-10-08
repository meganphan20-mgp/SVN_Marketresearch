import { NextRequest, NextResponse } from 'next/server';
import { auditSourceLink } from '@/lib/verification/source-link-verifier';
import { updateStorySourceLink } from '@/lib/data/intelligence-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Map input fields (supporting both standard agent contract and admin parameters)
    const article_title = body.article_title || body.expectedTitle || '';
    const source_name = body.source_name || body.sourceName || 'Unknown Source';
    const source_url = body.source_url || body.url || '';
    const expected_publish_date = body.expected_publish_date || body.publishedAt || '';
    const expected_entities = body.expected_entities || body.expectedCompanies || [];
    const expected_event = body.expected_event || body.expectedSector || '';
    const expected_claims = body.expected_claims || (body.dealValueText ? [body.dealValueText] : []);
    const language = body.language || 'vi';
    const source_tier = body.source_tier || 'TIER_2';

    const storyId = body.storyId;
    const sourceId = body.sourceId;
    const autoUpdate = body.autoUpdate !== false;

    if (!source_url || typeof source_url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid source_url is required for audit.' },
        { status: 400 }
      );
    }

    const auditOutput = await auditSourceLink({
      article_title,
      source_name,
      source_url,
      expected_publish_date,
      expected_entities,
      expected_event,
      expected_claims,
      language,
      source_tier,
    });

    // Automatically update the source in runtime state if storyId and sourceId are provided
    if (storyId && sourceId && autoUpdate) {
      await updateStorySourceLink(storyId, sourceId, {
        articleUrl: auditOutput.final_url,
        linkStatus: auditOutput.audit_status,
        httpStatus: auditOutput.http_status || undefined,
        isContentMatched: auditOutput.content_alignment_score >= 40,
        contentMatchScore: auditOutput.content_alignment_score,
        matchedKeywords: expected_entities.filter(() => auditOutput.entity_match_score > 0),
        auditedAt: new Date().toISOString(),
        fullAuditOutput: auditOutput,
      });
    }

    // Return the exact JSON schema defined in Step 11 alongside standard response wrapper
    return NextResponse.json({
      success: true,
      audit: auditOutput, // Exact Step 11 JSON schema
      result: auditOutput,
    });
  } catch (error: any) {
    console.error('[API /api/admin/verify-source-link] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Source link audit failed.' },
      { status: 500 }
    );
  }
}
