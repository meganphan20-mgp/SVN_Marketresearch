import { NextRequest, NextResponse } from 'next/server';
import { detectFactConflicts } from '@/lib/verification/conflict-detector';
import { calculateConfidenceScore } from '@/lib/verification/confidence-scorer';
import { validateExternalUrl } from '@/lib/verification/url-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articles = body.articles;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request body must include non-empty "articles" array.' },
        { status: 400 }
      );
    }

    // 1. Detect conflicts
    const conflictResult = detectFactConflicts(
      articles.map((a: any) => ({
        sourceName: a.sourceName || 'Unknown Source',
        url: a.url,
        content: a.content || a.summary || '',
        extractedFacts: a.extractedFacts,
      }))
    );

    // 2. Validate external URLs
    const validatedUrls = articles.map((a: any) => ({
      original: a.url,
      ...validateExternalUrl(a.url),
    }));

    // 3. Calculate confidence score
    const confidenceResult = calculateConfidenceScore({
      sources: articles.map((a: any) => ({
        sourceName: a.sourceName || 'Unknown Source',
        sourceTier: a.sourceTier || 'DISCOVERY',
        isOfficialIr: a.isOfficialIr || a.sourceName?.includes('Ministry') || a.sourceName?.includes('SBV'),
      })),
      conflictResult,
    });

    return NextResponse.json({
      success: true,
      data: {
        confidenceScore: confidenceResult.confidenceScore,
        verificationStatus: confidenceResult.verificationStatus,
        verificationRationale: confidenceResult.verificationRationale,
        conflictResult: {
          hasConflicts: conflictResult.hasConflicts,
          conflictCount: conflictResult.conflicts.length,
          conflicts: conflictResult.conflicts,
        },
        urlValidation: validatedUrls,
      },
    });
  } catch (error: any) {
    console.error('[API /api/ingestion/verify] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification calculation failed' },
      { status: 500 }
    );
  }
}
