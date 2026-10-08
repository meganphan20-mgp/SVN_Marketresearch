import React from 'react';
import Link from 'next/link';
import { getIntelligenceStories, getSectors, getCompanies } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { getTodayLocal } from '@/lib/verification/temporal-gating';
import { Clock, ArrowLeft, ShieldCheck, Flame, CalendarCheck } from 'lucide-react';

export const metadata = {
  title: 'News Published Today | Sojitz Vietnam Market Intelligence',
  description: 'Strict calendar-date gated daily intelligence feed. Displays exclusively news articles published on this calendar day in Asia/Ho_Chi_Minh.',
};

export default async function TodayPage() {
  const todayDate = getTodayLocal();
  const [stories, sectors, companies] = await Promise.all([
    getIntelligenceStories({ timeframe: 'today' }),
    getSectors(),
    getCompanies(),
  ]);

  const displayDate = stories.length > 0 && stories[0].dailyBriefDate ? stories[0].dailyBriefDate : todayDate;
  const isLatestCycle = displayDate !== todayDate;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Executive Dashboard</span>
          </Link>
        </div>

        {/* Page Banner */}
        <div className="mb-6 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-bold mb-1">
              <CalendarCheck className="w-4 h-4 text-blue-700" />
              <span>Strict Calendar-Date Gated • Asia/Ho_Chi_Minh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLatestCycle ? `Daily Briefing (${displayDate})` : `News Published Today (${todayDate})`}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              {isLatestCycle 
                ? `Displaying latest verified daily cycle (${displayDate}). Feed contains exclusively stories whose qualifying primary source was verified in Asia/Ho_Chi_Minh.`
                : `Feed contains exclusively stories whose primary qualifying source was published on this calendar day in Asia/Ho_Chi_Minh. Zero rolling 24-hour discovery leakage.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {stories.length} Verified Stories
            </span>
          </div>
        </div>

        {/* Stories Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {stories.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-sm">
                No intelligence stories with qualifying primary sources published on {todayDate} (Asia/Ho_Chi_Minh) yet.
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Sidebar Context */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Today&apos;s Focus Verticals</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sectors.slice(0, 8).map((sec) => (
                  <Link
                    key={sec.id}
                    href={`/sectors/${sec.slug}`}
                    className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 transition-colors"
                  >
                    {sec.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-lg p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Protocol</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All intelligence stories on this feed have undergone automated multi-source triangulation and source-tier weighting prior to dispatch.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
