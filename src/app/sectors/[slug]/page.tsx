import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSectors, getIntelligenceStories } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { ArrowLeft, Layers } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sectors = await getSectors();
  const sector = sectors.find(s => s.slug === slug);
  if (!sector) return { title: 'Sector Not Found' };
  return {
    title: `${sector.name} Sector Intelligence | Sojitz Vietnam`,
    description: sector.description,
  };
}

export default async function SectorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sectors = await getSectors();
  const sector = sectors.find(s => s.slug === slug);

  if (!sector) {
    notFound();
  }

  const stories = await getIntelligenceStories({ sectorSlug: sector.slug });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/sectors"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sectors Directory</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">
            Sector ID: {sector.slug}
          </span>
        </div>

        {/* Sector Overview Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
              sector.priority === 'PRIORITY_1'
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {sector.priority === 'PRIORITY_1' ? 'Priority 1 Core Vertical' : 'Priority 2 Strategic Emergence'}
            </span>
            <span className="text-xs font-mono text-emerald-700 font-bold">
              {stories.length} Verified Stories
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {sector.name}
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
            {sector.description}
          </p>
        </div>

        {/* Sector Stories Feed */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 uppercase">
            Sector Intelligence Feed ({stories.length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Latest Clustered Reports
          </span>
        </div>

        {stories.length > 0 ? (
          <div className="space-y-4">
            {stories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-xs">
            No active intelligence stories currently recorded for {sector.name}.
          </div>
        )}
      </main>
    </div>
  );
}
