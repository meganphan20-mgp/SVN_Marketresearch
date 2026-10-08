'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { IntelligenceStory } from '@/types/intelligence';
import { VerificationBadge } from './VerificationBadge';
import { ImpactBadge } from './ImpactBadge';
import { FeedbackWidget } from './FeedbackWidget';
import { recordAnalyticsEvent } from '@/lib/analytics/tracker';
import { 
  Calendar, 
  Building2, 
  ExternalLink, 
  Briefcase, 
  AlertTriangle,
  Scale,
  ShieldCheck,
  Target,
  Clock,
  Globe,
  Share2,
  Check
} from 'lucide-react';

interface Props {
  story: IntelligenceStory;
}

export function StoryDetailClientView({ story }: Props) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Record story_open event
    recordAnalyticsEvent('story_open', {
      storyId: story.id,
      storyTitle: story.title,
    });

    // Reading depth scroll milestones (25%, 50%, 75%, 100%)
    const milestones = { 25: false, 50: false, 75: false, 100: false };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = Math.min(100, Math.round((window.scrollY / scrollHeight) * 100));

      if (progress >= 25 && !milestones[25]) {
        milestones[25] = true;
        recordAnalyticsEvent('story_scroll_25', { storyId: story.id, storyTitle: story.title, scrollDepth: 25 });
      }
      if (progress >= 50 && !milestones[50]) {
        milestones[50] = true;
        recordAnalyticsEvent('story_scroll_50', { storyId: story.id, storyTitle: story.title, scrollDepth: 50 });
      }
      if (progress >= 75 && !milestones[75]) {
        milestones[75] = true;
        recordAnalyticsEvent('story_scroll_75', { storyId: story.id, storyTitle: story.title, scrollDepth: 75 });
      }
      if (progress >= 95 && !milestones[100]) {
        milestones[100] = true;
        recordAnalyticsEvent('story_scroll_100', { storyId: story.id, storyTitle: story.title, scrollDepth: 100 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [story.id, story.title]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">Tier 1 Official / Wire</span>;
      case 'TIER_2':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">Tier 2 Press</span>;
      case 'DISCOVERY':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">Discovery Only</span>;
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">Tier 3 Media</span>;
    }
  };

  return (
    <article className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-8">
      {/* Metadata Top Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Publication: {story.publicationDate}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Event Date: {story.storyDate}
          </span>
          <span className="text-slate-300">•</span>
          <Link 
            href={`/sectors/${story.primarySectorSlug}`}
            onClick={() => recordAnalyticsEvent('sector_click', { sectorSlug: story.primarySectorSlug, storyId: story.id })}
            className="font-medium text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-100"
          >
            Sector: {story.primarySectorName}
          </Link>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">Category: {story.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-mono inline-flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> {story.country}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied' : 'Share Intelligence'}</span>
        </button>
      </div>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
        {story.title}
      </h1>

      {/* Badges & Scores Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge status={story.verificationStatus} confidenceScore={story.confidenceScore} size="lg" />
          <ImpactBadge impact={story.businessImpact} />
          {story.isHighPriority && (
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
              High Priority
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-slate-400 text-[10px] uppercase">Relevance to Sojitz</div>
            <div className="text-base font-bold text-slate-900">{story.relevanceScore} / 10</div>
          </div>
          <div className="text-right border-l border-slate-200 pl-4">
            <div className="text-slate-400 text-[10px] uppercase">Confidence Score</div>
            <div className="text-base font-bold text-emerald-700">
              {story.confidenceScore > 10 ? Math.round(story.confidenceScore) : Math.round(story.confidenceScore * 10)} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Mentioned Watchlist Companies */}
      {story.companiesMentioned.length > 0 && (
        <div className="mb-6 p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-blue-950 flex items-center gap-1.5 mr-2">
            <Building2 className="w-4 h-4 text-blue-700" /> Watchlist Entities Involved:
          </span>
          {story.companiesMentioned.map((comp) => (
            <Link
              key={comp.id}
              href={`/companies/${comp.slug}`}
              onClick={() => recordAnalyticsEvent('company_click', { companySlug: comp.slug, storyId: story.id })}
              className="font-semibold text-slate-800 bg-white hover:bg-blue-100 px-2.5 py-1 rounded border border-blue-200 transition-colors inline-flex items-center gap-1"
            >
              <span>{comp.name}</span>
              {comp.ticker && <span className="text-slate-400 text-[11px] font-mono">({comp.ticker})</span>}
            </Link>
          ))}
        </div>
      )}

      {/* Core Short Summary */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Executive Intelligence Summary
        </h2>
        <p className="text-base text-slate-800 leading-relaxed">
          {story.summary}
        </p>
      </div>

      {/* Why It Matters To Sojitz Vietnam */}
      <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Briefcase className="w-4 h-4" />
          <span>Why It Matters To Sojitz Vietnam</span>
        </div>
        <p className="text-slate-100 leading-relaxed text-sm md:text-base">
          {story.whyItMattersToSojitz}
        </p>
      </div>

      {/* Suggested BD Action Callout Box */}
      {story.suggestedBdAction && (
        <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl p-5 mb-8 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider mb-2">
            <Target className="w-4 h-4 text-emerald-700" />
            <span>Suggested Business Development (BD) Action</span>
          </div>
          <p className="text-emerald-950 leading-relaxed text-sm md:text-base font-medium">
            {story.suggestedBdAction}
          </p>
        </div>
      )}

      {/* Extracted Facts Matrix */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-900" />
          <span>Cross-Checked Fact & Claim Matrix</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {story.extractedFacts.dealValueText && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-400 uppercase font-semibold block text-[10px] mb-1">
                Transaction / Investment Value
              </span>
              <span className="font-bold text-slate-900 text-sm font-mono">
                {story.extractedFacts.dealValueText}
              </span>
            </div>
          )}

          {story.extractedFacts.stakePercentage && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-400 uppercase font-semibold block text-[10px] mb-1">
                Equity Stake Percentage
              </span>
              <span className="font-bold text-slate-900 text-sm font-mono">
                {story.extractedFacts.stakePercentage}%
              </span>
            </div>
          )}

          {story.extractedFacts.capacityOrSize && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-400 uppercase font-semibold block text-[10px] mb-1">
                Project Size / Capacity
              </span>
              <span className="font-semibold text-slate-900">
                {story.extractedFacts.capacityOrSize}
              </span>
            </div>
          )}

          {story.extractedFacts.location && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-400 uppercase font-semibold block text-[10px] mb-1">
                Geographic Location
              </span>
              <span className="font-semibold text-slate-900">
                {story.extractedFacts.location}
              </span>
            </div>
          )}

          {story.extractedFacts.announcedTimeline && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-400 uppercase font-semibold block text-[10px] mb-1">
                Announced Timeline
              </span>
              <span className="font-semibold text-slate-900">
                {story.extractedFacts.announcedTimeline}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Audit & Conflicts */}
      <div className="mb-8 p-5 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Multi-Source Verification Audit Trail</span>
        </h2>
        <p className="text-xs text-slate-700 leading-relaxed mb-3">
          {story.verificationRationale}
        </p>

        {story.detectedConflicts.length > 0 && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Detected Reporting Conflicts ({story.detectedConflicts.length})</span>
            </div>
            {story.detectedConflicts.map((conflict, i) => (
              <div key={i} className="pl-5 mt-1">
                <span className="font-semibold">{conflict.discrepancyNote}</span>
                <div className="font-mono text-[11px] text-rose-800 mt-0.5">
                  • {conflict.sourceA.name}: &ldquo;{conflict.sourceA.claim}&rdquo;
                  <br />
                  • {conflict.sourceB.name}: &ldquo;{conflict.sourceB.claim}&rdquo;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 9 & 11 — PUBLIC UI: ONLY VALIDATED SOURCES */}
      {(() => {
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
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>
                  {uniqueSources.length >= 2 
                    ? `Verified Supporting Sources (${uniqueSources.length})` 
                    : `Verified Source (${uniqueSources.length})`}
                </span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-mono">
                {uniqueSources.length >= 2 ? 'Multi-Source Verified' : 'Single-Source Verified'}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-950 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Source-First Guarantee:</strong> Every displayed intelligence item originates directly from a verified article destination opened, inspected, and validated with HTTP 200.
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
              {uniqueSources.map((src) => {
            const targetUrl = src.validatedUrl || src.canonicalUrl || src.accessUrl || src.articleUrl;
            const displayTitle = src.sourceTitle || src.articleTitle;
            return (
              <div key={src.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-2xl">
                  {/* Publisher & Publication Date */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTierBadge(src.sourceTier)}
                    <span className="font-bold text-slate-900 text-xs">{src.publisher || src.sourceName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Published: {new Date(src.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Exact Article Headline */}
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {displayTitle}
                  </h4>
                </div>

                {/* [Access Source] Button pointing to validated or canonical URL */}
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSourceClick(src)}
                  className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded shadow-2xs transition-colors whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Access Source</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                </a>
              </div>
            );
          })}
            </div>
          </div>
        );
      })()}

      {/* Reader Feedback Section (Requirement 8) */}
      <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200 mb-6">
        <FeedbackWidget storyId={story.id} storyTitle={story.title} />
      </div>

      {/* System Audit Meta */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Collection Timestamp: {story.collectionTimestamp || story.dateCollected}</span>
        <span>AI Engine: {story.aiModelUsed}</span>
        <span>Analysis Timestamp: {story.aiAnalysisTimestamp}</span>
      </div>
    </article>
  );
}
