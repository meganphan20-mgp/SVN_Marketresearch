'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IntelligenceStory } from '@/types/intelligence';
import { VerificationBadge } from './VerificationBadge';
import { ImpactBadge } from './ImpactBadge';
import { FeedbackWidget } from './FeedbackWidget';
import { recordAnalyticsEvent } from '@/lib/analytics/tracker';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Building2, 
  Share2, 
  Check, 
  AlertCircle,
  Briefcase,
  Target
} from 'lucide-react';

interface Props {
  story: IntelligenceStory;
  showFullDetails?: boolean;
}

export function StoryCard({ story, showFullDetails = false }: Props) {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(showFullDetails);
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/story/${story.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSources = () => {
    const nextState = !isSourcesExpanded;
    setIsSourcesExpanded(nextState);
    if (nextState) {
      recordAnalyticsEvent('source_expand', {
        storyId: story.id,
        storyTitle: story.title,
      });
    }
  };

  const handleSourceClick = (src: any) => {
    recordAnalyticsEvent('source_click', {
      storyId: story.id,
      storyTitle: story.title,
      sourceName: src.sourceName,
      sourceTier: src.sourceTier,
      sourceUrl: src.articleUrl,
    });
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'TIER_1':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">Tier 1 Official</span>;
      case 'TIER_2':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">Tier 2 Press</span>;
      case 'DISCOVERY':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">Discovery Signal</span>;
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">Tier 3 Media</span>;
    }
  };

  return (
    <article id={`story-${story.id}`} className="bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-all duration-150 p-5 md:p-6 mb-4 scroll-mt-20">
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {story.sourcePublicationDateLocal || story.dailyBriefDate || story.storyDate}
          </span>
          <span className="text-slate-300">•</span>
          <Link 
            href={`/sectors/${story.primarySectorSlug}`}
            onClick={() => recordAnalyticsEvent('sector_click', { sectorSlug: story.primarySectorSlug, storyId: story.id })}
            className="font-medium text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
          >
            {story.primarySectorName}
          </Link>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">{story.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-mono text-[11px]">{story.country}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Relevance Score Pill */}
          <div 
            title="Strategic Relevance to Sojitz Vietnam (1–10)"
            className="flex items-center gap-1 bg-slate-900 text-white text-xs font-mono font-bold px-2.5 py-1 rounded shadow-xs"
          >
            <span className="text-slate-400 font-normal text-[10px]">RELEVANCE</span>
            <span>{story.relevanceScore}/10</span>
          </div>

          <button
            onClick={handleShare}
            title="Copy shareable link"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2 leading-snug">
        <Link 
          href={`/story/${story.id}`} 
          onClick={() => recordAnalyticsEvent('story_open', { storyId: story.id, storyTitle: story.title })}
          className="hover:text-blue-900 transition-colors"
        >
          {story.title}
        </Link>
      </h3>

      {/* Status Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <VerificationBadge status={story.verificationStatus} confidenceScore={story.confidenceScore} />
        <ImpactBadge impact={story.businessImpact} />
        {story.isHighPriority && (
          <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
            High Priority
          </span>
        )}
        {story.materialUpdate && (
          <span 
            title={story.materialUpdateRationale || 'Material new verified facts reported'} 
            className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300"
          >
            Material Update
          </span>
        )}
      </div>

      {/* Mentioned Companies */}
      {story.companiesMentioned.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
          <span className="text-slate-500 font-medium inline-flex items-center gap-1 mr-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Watchlist:
          </span>
          {story.companiesMentioned.map((comp) => (
            <Link
              key={comp.id}
              href={`/companies/${comp.slug}`}
              onClick={() => recordAnalyticsEvent('company_click', { companySlug: comp.slug, storyId: story.id })}
              className="inline-flex items-center gap-1 font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 transition-colors"
            >
              <span>{comp.name}</span>
              {comp.ticker && <span className="text-[10px] text-slate-400 font-mono">({comp.ticker})</span>}
            </Link>
          ))}
        </div>
      )}

      {/* Summary Narrative */}
      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        {story.summary}
      </p>

      {/* Why It Matters To Sojitz - Strategic Callout Box */}
      <div className="bg-slate-50 border-l-4 border-blue-900 rounded-r-md p-3.5 mb-3 text-sm">
        <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs uppercase tracking-wider mb-1">
          <Briefcase className="w-3.5 h-3.5 text-blue-900" />
          <span>Why It Matters to Sojitz Vietnam</span>
        </div>
        <p className="text-slate-800 leading-relaxed text-[13.5px]">
          {story.whyItMattersToSojitz}
        </p>
      </div>

      {/* Suggested BD Action Callout */}
      {story.suggestedBdAction && (
        <div className="bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-md p-3.5 mb-4 text-sm">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs uppercase tracking-wider mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-700" />
            <span>Suggested BD Action</span>
          </div>
          <p className="text-emerald-900 leading-relaxed text-[13.5px] font-medium">
            {story.suggestedBdAction}
          </p>
        </div>
      )}

      {/* Conflicts & Discrepancies Alert Box (If present) */}
      {story.detectedConflicts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-3 mb-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Cross-Source Discrepancy Detected ({story.detectedConflicts.length})</span>
          </div>
          {story.detectedConflicts.map((c, idx) => (
            <div key={idx} className="text-rose-800 pl-5 mb-1 last:mb-0">
              <span className="font-semibold">{c.discrepancyNote}</span>
              <div className="mt-0.5 text-rose-700 font-mono text-[11px]">
                [{c.sourceA.name}]: &ldquo;{c.sourceA.claim}&rdquo; vs [{c.sourceB.name}]: &ldquo;{c.sourceB.claim}&rdquo;
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supporting Sources Accordion Drawer */}
      {(() => {
        // Deduplicate sources by URL to guarantee no duplicate link cards
        const map = new Map<string, typeof story.sources[0]>();
        for (const src of story.sources || []) {
          const url = (src.validatedUrl || src.canonicalUrl || src.accessUrl || src.articleUrl || '').trim();
          const key = url || src.id;
          if (!map.has(key)) {
            map.set(key, src);
          }
        }
        const uniqueSources = Array.from(map.values());

        return (
          <div className="border-t border-slate-100 pt-3 mb-3">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleSources}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 py-1 transition-colors cursor-pointer"
              >
                <span>
                  {uniqueSources.length >= 2 
                    ? `Verified Supporting Sources (${uniqueSources.length})` 
                    : `Verified Source (${uniqueSources.length})`}
                </span>
                {isSourcesExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <span className="text-[11px] text-slate-400 font-mono">
                Analyzed: {story.aiModelUsed} • {new Date(story.aiAnalysisTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {isSourcesExpanded && (
              <div className="mt-3 space-y-2.5 pl-1 border-l-2 border-slate-200 ml-1">
                {uniqueSources.map((src) => {
                  const targetUrl = src.validatedUrl || src.canonicalUrl || src.accessUrl || src.articleUrl;
                  const displayTitle = src.sourceTitle || src.articleTitle;
                  return (
                    <div key={src.id} className="text-xs pl-3 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group hover:bg-slate-50/80 rounded transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {getTierBadge(src.sourceTier)}
                          <span className="font-bold text-slate-900">{src.publisher || src.sourceName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-mono" title={`Original UTC: ${src.publishedAt}`}>
                            Published: {new Date(src.publishedAt).toLocaleString('en-US', {
                              timeZone: 'Asia/Ho_Chi_Minh',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })} (Asia/Ho_Chi_Minh)
                          </span>
                        </div>
                        <div className="text-slate-800 font-medium line-clamp-1">
                          {displayTitle}
                        </div>
                      </div>

                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleSourceClick(src)}
                        className="self-start sm:self-center px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 rounded transition-colors whitespace-nowrap inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>Access Source</span>
                        <ExternalLink className="w-3 h-3 text-blue-700" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Reader Feedback Widget (Requirement 8) */}
      <FeedbackWidget storyId={story.id} storyTitle={story.title} />
    </article>
  );
}

