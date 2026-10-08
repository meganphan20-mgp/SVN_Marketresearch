'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Check, X, MessageSquareQuote } from 'lucide-react';
import { NotUsefulReason } from '@/types/intelligence';
import { recordAnalyticsEvent } from '@/lib/analytics/tracker';

interface Props {
  storyId: string;
  storyTitle?: string;
  compact?: boolean;
}

const REASONS: NotUsefulReason[] = [
  'Not relevant to Sojitz',
  'Already known',
  'Too generic',
  'Too old',
  'Weak analysis',
  'Wrong sector/company',
  'Other',
];

export function FeedbackWidget({ storyId, storyTitle, compact = false }: Props) {
  const [vote, setVote] = useState<'USEFUL' | 'NOT_USEFUL' | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<NotUsefulReason | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Load existing vote from localStorage if already voted in this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`svn_feedback_${storyId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setVote(parsed.vote);
          setSubmitted(true);
        } catch {}
      }
    }
  }, [storyId]);

  const handleUseful = () => {
    setVote('USEFUL');
    setSubmitted(true);
    setShowReasonModal(false);

    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`svn_feedback_${storyId}`, JSON.stringify({
        vote: 'USEFUL',
        timestamp: new Date().toISOString(),
      }));
    }

    // Telemetry tracking
    recordAnalyticsEvent('helpful_vote', {
      storyId,
      storyTitle,
    });
  };

  const handleNotUseful = () => {
    setVote('NOT_USEFUL');
    setShowReasonModal(true);

    recordAnalyticsEvent('not_helpful_vote', {
      storyId,
      storyTitle,
    });
  };

  const submitNotUsefulReason = () => {
    setSubmitted(true);
    setShowReasonModal(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`svn_feedback_${storyId}`, JSON.stringify({
        vote: 'NOT_USEFUL',
        reason: selectedReason,
        comment,
        timestamp: new Date().toISOString(),
      }));
    }

    recordAnalyticsEvent('not_helpful_vote', {
      storyId,
      storyTitle,
      reason: selectedReason,
      comment,
    });
  };

  return (
    <div className={`pt-3 border-t border-slate-100 ${compact ? 'text-xs' : 'text-xs'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
          <span>Was this intelligence useful?</span>
        </div>

        {submitted ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {vote === 'USEFUL' ? 'Feedback recorded: Useful' : 'Feedback recorded: Not Useful'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUseful}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-medium transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-3 h-3 text-slate-500 hover:text-emerald-600" />
              <span>Useful</span>
            </button>

            <button
              onClick={handleNotUseful}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 font-medium transition-colors cursor-pointer"
            >
              <ThumbsDown className="w-3 h-3 text-slate-500 hover:text-rose-600" />
              <span>Not Useful</span>
            </button>
          </div>
        )}
      </div>

      {/* Structured Reason Drawer / Modal */}
      {showReasonModal && (
        <div className="mt-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900">
              Why was this not useful? (Optional feedback to tune ranking)
            </span>
            <button
              onClick={() => setShowReasonModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedReason(r)}
                className={`px-2.5 py-1.5 rounded border text-left transition-colors font-medium text-[11px] ${
                  selectedReason === r
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Additional feedback details (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900"
            />
            <button
              onClick={submitNotUsefulReason}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs whitespace-nowrap cursor-pointer transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
