import { NextRequest, NextResponse } from 'next/server';
import { cleanStorySources, cleanAllStoriesSources, getStoryById } from '@/lib/data/intelligence-store';
import { auditAndCleanStorySources } from '@/lib/verification/source-link-verifier';

/**
 * STEP 10 — FINAL OUTPUT ENDPOINT
 * 
 * Executes the Source Integrity & Auto-Cleanup Agent.
 * Permanently removes unverified/broken links, replaces with independently verified URLs if found,
 * ensures access_url is returned, sets article_status, and applies the confidence score hard cap.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyId, all, customStory } = body;

    // Mode 1: Clean custom story passed in payload
    if (customStory) {
      const { cleanupResult } = await auditAndCleanStorySources(customStory);
      return NextResponse.json(cleanupResult);
    }

    // Mode 2: Clean all stories in intelligence store
    if (all) {
      const results = await cleanAllStoriesSources();
      return NextResponse.json({
        success: true,
        count: results.length,
        results,
      });
    }

    // Mode 3: Clean single story by ID
    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required for single story cleanup.' },
        { status: 400 }
      );
    }

    const cleaned = await cleanStorySources(storyId);
    if (!cleaned) {
      return NextResponse.json(
        { error: `Story not found with ID: ${storyId}` },
        { status: 404 }
      );
    }

    // Return the exact Step 10 JSON specification
    return NextResponse.json(cleaned.cleanupResult);
  } catch (error: any) {
    console.error('[API /api/admin/clean-story-sources] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-cleanup execution failed.' },
      { status: 500 }
    );
  }
}
