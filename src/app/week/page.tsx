import React from 'react';
import Link from 'next/link';
import { getIntelligenceStories, getSectors } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { Calendar, ArrowLeft, TrendingUp, FileText } from 'lucide-react';

export const metadata = {
  title: 'This Week’s Market Intelligence | Sojitz Vietnam',
  description: 'Curated intelligence stream covering major business and political developments across Vietnam for the current week.',
};

export default async function WeekPage() {
  const [stories, sectors] = await Promise.all([
    getIntelligenceStories({ timeframe: 'week' }),
    getSectors(),
  ]);

  const highPriority = stories.filter(s => s.relevanceScore >= 8);

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

        {/* Page Header */}
        <div className="mb-6 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-bold mb-1">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Current Week Surveillance Cycle • 7-Day Window</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              This Week&apos;s Market Intelligence
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/weekly"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Synthesized Weekly Report</span>
            </Link>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Stories This Week</span>
            <span className="text-2xl font-extrabold text-slate-900">{stories.length}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] uppercase font-bold text-amber-600 block mb-1">High Priority (Score ≥ 8)</span>
            <span className="text-2xl font-extrabold text-amber-700">{highPriority.length}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Verified Integrity Rate</span>
            <span className="text-2xl font-extrabold text-emerald-700">
              {Math.round((stories.filter(s => s.verificationStatus === 'VERIFIED').length / Math.max(1, stories.length)) * 100)}%
            </span>
          </div>
        </div>

        {/* Stories Feed */}
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </main>
    </div>
  );
}
