'use client';

import React from 'react';
import { IntelligenceStory } from '@/types/intelligence';
import { StoryCard } from '@/components/story/StoryCard';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  stories: IntelligenceStory[];
}

export function TopIntelligence({ stories }: Props) {
  // Top High-Priority Intelligence (Relevance Score >= 8), sorted by score desc, max 3 items
  const topStories = [...stories]
    .filter((s) => s.relevanceScore >= 8)
    .sort((a, b) => b.relevanceScore - a.relevanceScore || b.confidenceScore - a.confidenceScore)
    .slice(0, 3);

  if (topStories.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-900 text-white flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
              1. Top Intelligence
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded font-semibold">
            {topStories.length} High-Impact Stories (Relevance 8–10)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {topStories.map((story) => (
          <StoryCard key={`top-${story.id}`} story={story} />
        ))}
      </div>
    </section>
  );
}
