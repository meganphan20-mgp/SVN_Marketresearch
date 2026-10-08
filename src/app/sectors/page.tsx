import React from 'react';
import Link from 'next/link';
import { getSectors, getIntelligenceStories } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { Layers, ArrowRight, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Industry Sectors Intelligence | Sojitz Vietnam',
  description: 'Priority 1 and Priority 2 industry sector intelligence for Sojitz Vietnam.',
};

export default async function SectorsDirectoryPage() {
  const [sectors, stories] = await Promise.all([
    getSectors(),
    getIntelligenceStories(),
  ]);

  const priority1 = sectors.filter(s => s.priority === 'PRIORITY_1');
  const priority2 = sectors.filter(s => s.priority === 'PRIORITY_2');

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
            Industry Sector Intelligence Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Dynamic strategic verticals monitored across Vietnam: Priority 1 core operations and Priority 2 strategic emergence.
          </p>
        </div>

        {/* Priority 1 Sectors */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              Priority 1: Core Sojitz Verticals ({priority1.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priority1.map(sec => {
              const count = stories.filter(s => s.primarySectorSlug === sec.slug).length;
              return (
                <div
                  key={sec.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                        Priority 1
                      </span>
                      <span className="font-bold text-slate-700">
                        {count} Stories
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      <Link href={`/sectors/${sec.slug}`} className="hover:text-blue-900 transition-colors">
                        {sec.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {sec.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={`/sectors/${sec.slug}`}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>Explore Sector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Priority 2 Sectors */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-slate-400" />
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              Priority 2: Strategic Emergence & Decarbonization ({priority2.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priority2.map(sec => {
              const count = stories.filter(s => s.primarySectorSlug === sec.slug).length;
              return (
                <div
                  key={sec.id}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        Priority 2
                      </span>
                      <span className="font-bold text-slate-700">
                        {count} Stories
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      <Link href={`/sectors/${sec.slug}`} className="hover:text-blue-900 transition-colors">
                        {sec.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {sec.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={`/sectors/${sec.slug}`}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>Explore Sector</span>
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
