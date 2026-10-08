import { NextRequest, NextResponse } from 'next/server';
import { updateStorySourceLink, updateStoryAuditStatus, getStoryById } from '@/lib/data/intelligence-store';
import { validateExternalUrl } from '@/lib/verification/url-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, storyId, sourceId, url, editorNotes, isEditorApproved, sourceAuditStatus } = body;

    if (!storyId) {
      return NextResponse.json({ success: false, error: 'storyId is required' }, { status: 400 });
    }

    if (action === 'update_link') {
      if (!sourceId || !url) {
        return NextResponse.json({ success: false, error: 'sourceId and url are required to update link' }, { status: 400 });
      }

      const val = validateExternalUrl(url);
      if (!val.isValid) {
        return NextResponse.json({ success: false, error: `Invalid URL: ${val.rejectionReason}` }, { status: 400 });
      }

      await updateStorySourceLink(storyId, sourceId, {
        articleUrl: val.normalizedUrl,
        editorReviewed: true,
        linkStatus: 'VERIFIED_MATCH',
        auditedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Source link URL successfully updated and validated.',
      });
    }

    if (action === 'approve_source') {
      if (!sourceId) {
        return NextResponse.json({ success: false, error: 'sourceId required' }, { status: 400 });
      }

      await updateStorySourceLink(storyId, sourceId, {
        editorReviewed: true,
        linkStatus: 'VERIFIED_MATCH',
        auditedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Source link approved by editor.',
      });
    }

    if (action === 'approve_story') {
      await updateStoryAuditStatus(storyId, {
        isEditorApproved: isEditorApproved !== undefined ? isEditorApproved : true,
        editorNotes,
        sourceAuditStatus: sourceAuditStatus || 'AUDITED',
      });

      const updated = await getStoryById(storyId);
      return NextResponse.json({
        success: true,
        message: 'Story editorial audit status updated.',
        story: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action specified' }, { status: 400 });
  } catch (err: any) {
    console.error('[API /api/admin/audit-story] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Audit action failed' },
      { status: 500 }
    );
  }
}
