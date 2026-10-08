import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    if (!event.eventName) {
      return NextResponse.json({ success: false, error: 'Event name is required' }, { status: 400 });
    }

    // If Supabase is connected, persist to analytics_events table
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('analytics_events').insert({
        event_name: event.eventName,
        story_id: event.storyId || null,
        anonymous_session_id: event.anonymousSessionId || 'anonymous-session',
        payload: event.payload || {},
      });
      if (error) {
        console.warn('[Analytics API] Supabase write error:', error.message);
      }
    }

    return NextResponse.json({ success: true, received: event.eventName });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
