import React from 'react';
import Link from 'next/link';
import { getCompanies, getIntelligenceStories } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { Building2, ArrowRight, ArrowLeft, Users, Shield } from 'lucide-react';

export const metadata = {
  title: 'Company Watchlist | Sojitz Vietnam Market Intelligence',
  description: 'Corporate watchlist tracking Vietnamese conglomerates and Japanese General Trading Houses (Sogo Shosha).',
};

export default async function CompaniesDirectoryPage() {
  const [companies, stories] = await Promise.all([
    getCompanies(),
    getIntelligenceStories(),
  ]);

  const tradingHouses = companies.filter(c => c.origin === 'JAPANESE_TRADING_HOUSE');
  const vietnamCompanies = companies.filter(c => c.origin === 'VIETNAM');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intelligence Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Corporate Watchlist Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Dynamic surveillance portfolio covering Japanese trading house competitors and top Vietnamese conglomerates.
          </p>
        </div>

        {/* Section 1: Japanese Trading Houses */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <Users className="w-5 h-5 text-indigo-700" />
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              Japanese General Trading Houses (Sogo Shosha)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradingHouses.map((comp) => {
              const related = stories.filter(s =>
                s.companiesMentioned.some(c => c.slug === comp.slug)
              );

              return (
                <div
                  key={comp.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span className="font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                        {comp.ticker || 'TOKYO'}
                      </span>
                      <span className="font-bold text-slate-700">
                        {related.length} Active Stories
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      <Link href={`/companies/${comp.slug}`} className="hover:text-blue-900 transition-colors">
                        {comp.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {comp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Aliases: {comp.aliases.slice(0, 2).join(', ')}
                    </span>
                    <Link
                      href={`/companies/${comp.slug}`}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Vietnamese Conglomerates */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <Building2 className="w-5 h-5 text-blue-800" />
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              Vietnamese Conglomerates & Champions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vietnamCompanies.map((comp) => {
              const related = stories.filter(s =>
                s.companiesMentioned.some(c => c.slug === comp.slug)
              );

              return (
                <div
                  key={comp.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span className="font-semibold text-blue-950 bg-blue-50 px-2 py-0.5 rounded">
                        {comp.ticker || 'UNLISTED'}
                      </span>
                      <span className="font-bold text-slate-700">
                        {related.length} Active Stories
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      <Link href={`/companies/${comp.slug}`} className="hover:text-blue-900 transition-colors">
                        {comp.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {comp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Aliases: {comp.aliases.slice(0, 2).join(', ')}
                    </span>
                    <Link
                      href={`/companies/${comp.slug}`}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
