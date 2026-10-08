import React from 'react';
import Link from 'next/link';
import { getIntelligenceStories, getCompanies } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { ArrowLeft, Globe2, Users, Building, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Vietnam–Japan Relations & Sogo Shosha Surveillance | Sojitz Vietnam',
  description: 'Intelligence stream monitoring Japanese trading houses (Sumitomo, Marubeni, Mitsui, Mitsubishi, Itochu, Toyota Tsusho, Sojitz) and bilateral economic accords.',
};

export default async function JapanHubPage() {
  const [allStories, companies] = await Promise.all([
    getIntelligenceStories(),
    getCompanies(),
  ]);

  const tradingHouses = companies.filter(c => c.origin === 'JAPANESE_TRADING_HOUSE');

  const japanStories = allStories.filter(s =>
    s.category.toLowerCase().includes('japan') ||
    s.companiesMentioned.some(c => c.origin === 'JAPANESE_TRADING_HOUSE') ||
    s.title.toLowerCase().includes('japan') ||
    s.summary.toLowerCase().includes('japan')
  );

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
              <Globe2 className="w-4 h-4 text-blue-700" />
              <span>Bilateral Strategic Surveillance • Tokyo & Hanoi Corridor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vietnam–Japan & Trading Houses Intelligence
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded">
              7 Monitored Sogo Shosha
            </span>
          </div>
        </div>

        {/* Sogo Shosha Quick Grid */}
        <div className="mb-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-700" />
            <span>Monitored Japanese Trading Houses (Sogo Shosha)</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {tradingHouses.map((th) => {
              const count = allStories.filter(s => s.companiesMentioned.some(c => c.slug === th.slug)).length;
              return (
                <Link
                  key={th.id}
                  href={`/companies/${th.slug}`}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-colors flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{th.name}</span>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{th.ticker || 'JP'}</span>
                    <span className="font-bold text-blue-900">{count} Stories</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Japan Stories Stream */}
        <div className="space-y-4">
          {japanStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </main>
    </div>
  );
}
