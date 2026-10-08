import React from 'react';
import Link from 'next/link';
import { getIntelligenceStories, getCompanies } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { ArrowLeft, Building2, TrendingUp, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Top Vietnamese Corporations Watch | Sojitz Vietnam',
  description: 'Intelligence surveillance across leading Vietnamese conglomerates: Masan, Vingroup, Stavian, THACO, Hoa Phat, FPT, Becamex, Gelex, Vinamilk, Sabeco, Sovico, TTC.',
};

export default async function VietnamCompaniesHubPage() {
  const [allStories, companies] = await Promise.all([
    getIntelligenceStories(),
    getCompanies(),
  ]);

  const vnCompanies = companies.filter(c => c.origin === 'VIETNAM');

  const vnStories = allStories.filter(s =>
    s.companiesMentioned.some(c => c.origin === 'VIETNAM')
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
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-800 font-bold mb-1">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Domestic Champions & Conglomerate Surveillance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Leading Vietnamese Corporations
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded">
              {vnCompanies.length} Active Conglomerates Tracked
            </span>
          </div>
        </div>

        {/* Watchlist Conglomerates Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {vnCompanies.map((c) => {
              const count = allStories.filter(s => s.companiesMentioned.some(m => m.slug === c.slug)).length;
              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {c.ticker || 'UNLISTED'}
                      </span>
                      <span className="text-slate-400 font-bold">{count} Stories</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                      <Link href={`/companies/${c.slug}`} className="hover:text-emerald-700 transition-colors">
                        {c.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={`/companies/${c.slug}`}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vietnamese Companies Story Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Latest Domestic Corporate Activity
            </h2>
          </div>

          {vnStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </main>
    </div>
  );
}
