import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { recordStoryVote } from '@/lib/data/intelligence-store';

export async function POST(req: NextRequest) {
  try {
    const feedback = await req.json();

    if (!feedback.storyId || !feedback.vote) {
      return NextResponse.json({ success: false, error: 'Story ID and Vote are required' }, { status: 400 });
    }

    // Update in-memory ranking model
    await recordStoryVote(feedback.storyId, feedback.vote);

    // If Supabase is connected, persist to user_feedback table
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('user_feedback').insert({
        story_id: feedback.storyId,
        vote: feedback.vote,
        reason: feedback.reason || null,
        comment: feedback.comment || null,
        anonymous_session_id: feedback.anonymousSessionId || 'anonymous-session',
      });
      if (error) {
        console.warn('[Feedback API] Supabase write error:', error.message);
      }
    }

    return NextResponse.json({ success: true, storyId: feedback.storyId, vote: feedback.vote });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
