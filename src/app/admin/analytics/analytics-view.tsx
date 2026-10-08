'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredAnalyticsSummary } from '@/lib/analytics/tracker';
import { ExecutiveAnalyticsSummary } from '@/types/analytics';
import { 
  BarChart3, 
  ArrowLeft, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  Users, 
  Search, 
  ArrowUpRight,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';

export function AdminAnalyticsView() {
  const [summary, setSummary] = useState<ExecutiveAnalyticsSummary | null>(null);

  useEffect(() => {
    setSummary(getStoredAnalyticsSummary());
  }, []);

  if (!summary) {
    return (
      <div className="py-20 text-center text-slate-500 font-mono text-xs">
        Loading executive telemetry...
      </div>
    );
  }

  const { readingDepthFunnel } = summary;

  return (
    <div className="space-y-8">
      {/* Top Banner & KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Total Events</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {summary.totalEventsTracked.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">All interactions logged</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Unique Sessions</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {summary.uniqueSessions.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Internal & guest sessions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Completion Rate</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {readingDepthFunnel.completionRatePct}%
          </div>
          <span className="text-[11px] text-slate-400">Read 100% of intelligence</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>High-Rel Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {summary.highRelevanceLowEngagementAnomalies.length}
          </div>
          <span className="text-[11px] text-slate-400">Relevance ≥8 with drop-off</span>
        </div>
      </div>

      {/* Question 3 & 4: Reading Depth & Drop-Off Funnel */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-900" />
              <span>Reader Drop-Off & Average Reading Depth</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks user progression through full intelligence dossiers (opened vs scroll milestones).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Opened Stories ({readingDepthFunnel.opened})</span>
              <span className="font-mono text-slate-500">100%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-900 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Reached 25% Depth ({readingDepthFunnel.reached25})</span>
              <span className="font-mono text-slate-500">
                {Math.round((readingDepthFunnel.reached25 / readingDepthFunnel.opened) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-700 rounded-full" 
                style={{ width: `${(readingDepthFunnel.reached25 / readingDepthFunnel.opened) * 100}%` }} 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Reached 50% Depth - Core Analysis ({readingDepthFunnel.reached50})</span>
              <span className="font-mono text-slate-500">
                {Math.round((readingDepthFunnel.reached50 / readingDepthFunnel.opened) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${(readingDepthFunnel.reached50 / readingDepthFunnel.opened) * 100}%` }} 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Reached 75% Depth - Facts & Claims ({readingDepthFunnel.reached75})</span>
              <span className="font-mono text-slate-500">
                {Math.round((readingDepthFunnel.reached75 / readingDepthFunnel.opened) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full" 
                style={{ width: `${(readingDepthFunnel.reached75 / readingDepthFunnel.opened) * 100}%` }} 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Reached 100% Completion ({readingDepthFunnel.reached100})</span>
              <span className="font-mono text-emerald-700 font-bold">
                {readingDepthFunnel.completionRatePct}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${readingDepthFunnel.completionRatePct}%` }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Question 1 & 2: Most Viewed Stories & Most Useful Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Stories */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-700" />
              <span>Most Viewed Intelligence Stories</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Total Views</span>
          </div>

          <div className="divide-y divide-slate-100">
            {summary.mostViewedStories.map((story) => (
              <div key={story.storyId} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Link 
                    href={`/story/${story.storyId}`}
                    className="text-xs font-bold text-slate-900 hover:text-blue-900 line-clamp-2"
                  >
                    {story.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-600">Relevance: {story.relevanceScore}/10</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{story.usefulRatioPct}% Useful</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {story.views}
                  </span>
                  <span className="block text-[10px] text-slate-400">views</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Most Useful Votes Ratio */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-emerald-700" />
              <span>Highest Useful Approval Ratio</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Useful %</span>
          </div>

          <div className="divide-y divide-slate-100">
            {summary.mostUsefulStories.map((story) => (
              <div key={story.storyId} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Link 
                    href={`/story/${story.storyId}`}
                    className="text-xs font-bold text-slate-900 hover:text-blue-900 line-clamp-2"
                  >
                    {story.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="text-emerald-700 font-semibold">{story.usefulVotes} Useful Votes</span>
                    <span>•</span>
                    <span className="text-rose-600">{story.notUsefulVotes} Not Useful</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    {story.usefulRatioPct}%
                  </span>
                  <span className="block text-[10px] text-slate-400">approval</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Question 5: Source Click-Through Rate (CTR) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4 text-blue-900" />
            <span>Source Click-Through Rate (CTR) by Source Tier</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Outbound Verification Clicks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Source Name</th>
                <th className="py-2.5 px-3 font-semibold">Tier Category</th>
                <th className="py-2.5 px-3 font-semibold text-right">Story Impressions</th>
                <th className="py-2.5 px-3 font-semibold text-right">External Clicks</th>
                <th className="py-2.5 px-3 font-semibold text-right">CTR (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.sourceClickThroughRates.map((src, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{src.sourceName}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      src.sourceTier === 'TIER_1' ? 'bg-blue-50 text-blue-800' :
                      src.sourceTier === 'TIER_2' ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {src.sourceTier}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">{src.impressions}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">{src.clicks}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{src.ctrPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Question 6 & 7: Top Sectors Viewed & Top Companies Searched */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Sectors Viewed */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-700" />
              <span>Sectors Most Viewed by C-Suite</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Impressions</span>
          </div>

          <div className="space-y-2.5">
            {summary.topSectorsViewed.map((sec) => (
              <div key={sec.sectorSlug} className="flex items-center justify-between text-xs">
                <Link 
                  href={`/sectors/${sec.sectorSlug}`}
                  className="font-semibold text-slate-800 hover:text-blue-900"
                >
                  {sec.sectorName}
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-900 rounded-full" 
                      style={{ width: `${(sec.viewCount / 450) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-slate-600 font-bold w-8 text-right">{sec.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Companies Searched */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-700" />
              <span>Companies Most Searched & Filtered</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Interactions</span>
          </div>

          <div className="space-y-2.5">
            {summary.topCompaniesSearched.map((comp) => (
              <div key={comp.companySlug} className="flex items-center justify-between text-xs">
                <Link 
                  href={`/companies/${comp.companySlug}`}
                  className="font-semibold text-slate-800 hover:text-emerald-700"
                >
                  {comp.companyName}
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full" 
                      style={{ width: `${(comp.searchAndClickCount / 200) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-slate-600 font-bold w-8 text-right">{comp.searchAndClickCount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Question 8: Stories with High Relevance Score but Low Engagement (Anomalies) */}
      <section className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-200/80">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Anomaly Detection: High Relevance (≥8) but Low Engagement Stories</span>
            </h2>
            <p className="text-xs text-amber-900/80 mt-0.5">
              Identifies critical strategic intelligence that readers drop out of quickly (e.g. drop-off rate &gt;65%).
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
            Ranking Tuning Signal
          </span>
        </div>

        <div className="space-y-3">
          {summary.highRelevanceLowEngagementAnomalies.map((anom) => (
            <div key={anom.storyId} className="bg-white border border-amber-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <Link 
                  href={`/story/${anom.storyId}`}
                  className="text-sm font-bold text-slate-900 hover:text-blue-900"
                >
                  {anom.title}
                </Link>
                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                    Relevance: {anom.relevanceScore}/10
                  </span>
                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                    Drop-off: {anom.dropOffRatePct}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-amber-950/90 bg-amber-50/80 p-2.5 rounded border border-amber-200 font-medium">
                💡 <span className="font-bold">Algorithmic Diagnostic:</span> {anom.warningNote}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
