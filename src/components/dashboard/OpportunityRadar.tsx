'use client';

import React from 'react';
import Link from 'next/link';
import { IntelligenceStory } from '@/types/intelligence';
import { Sparkles, ArrowRight, Briefcase } from 'lucide-react';
import { VerificationBadge } from '../story/VerificationBadge';

interface Props {
  stories: IntelligenceStory[];
}

export function OpportunityRadar({ stories }: Props) {
  const opportunityStories = stories.filter(
    s => s.businessImpact === 'OPPORTUNITY' || s.businessImpact === 'PARTNERSHIP'
  ).slice(0, 3);

  if (opportunityStories.length === 0) return null;

  return (
    <section className="bg-linear-to-br from-blue-950 to-slate-900 text-white rounded-xl p-5 md:p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-blue-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              2. OPPORTUNITY RADAR
              <span className="text-[10px] uppercase font-mono font-normal tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Strategic Openings
              </span>
            </h2>
            <p className="text-xs text-blue-200/80">
              High-value partnerships, concessions, and off-take opportunities tailored for Sojitz Vietnam divisions
            </p>
          </div>
        </div>

        <Link
          href="/?impact=OPPORTUNITY"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-blue-300 hover:text-white transition-colors"
        >
          <span>View all ({stories.filter(s => s.businessImpact === 'OPPORTUNITY' || s.businessImpact === 'PARTNERSHIP').length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {opportunityStories.map((story) => (
          <div
            key={story.id}
            className="bg-white/5 border border-white/10 hover:border-blue-400/40 rounded-lg p-4 flex flex-col justify-between transition-all group backdrop-blur-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-medium text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded border border-blue-800">
                  {story.primarySectorName}
                </span>
                <VerificationBadge status={story.verificationStatus} size="sm" showScore={false} />
              </div>

              <h4 className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors line-clamp-2 mb-2 leading-snug">
                <Link href={`/story/${story.id}`}>
                  {story.title}
                </Link>
              </h4>

              <div className="text-xs text-slate-300 bg-black/20 p-2.5 rounded border-l-2 border-emerald-400 mb-3 line-clamp-3">
                <span className="font-semibold text-emerald-300 block text-[11px] uppercase mb-0.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Strategic Rationale
                </span>
                {story.whyItMattersToSojitz}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-slate-400">
              <span className="font-mono text-[11px]">Relevance: {story.relevanceScore}/10</span>
              <Link
                href={`/story/${story.id}`}
                className="text-blue-300 hover:text-white inline-flex items-center gap-1 font-medium transition-colors"
              >
                <span>Read Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
