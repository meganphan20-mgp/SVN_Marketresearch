import React from 'react';
import Link from 'next/link';
import { getIntelligenceStories } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { ArrowLeft, PieChart, DollarSign, Handshake, Building2 } from 'lucide-react';

export const metadata = {
  title: 'M&A and Strategic Investment Hub | Sojitz Vietnam',
  description: 'Intelligence on Mergers & Acquisitions, strategic private equity injections, joint ventures, and FDI in Vietnam.',
};

export default async function MaPage() {
  const allStories = await getIntelligenceStories();
  const maStories = allStories.filter(s => 
    s.businessImpact === 'MA_INVESTMENT' || 
    s.businessImpact === 'PARTNERSHIP' || 
    s.category.toLowerCase().includes('m&a') ||
    s.category.toLowerCase().includes('investment') ||
    s.category.toLowerCase().includes('joint venture')
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
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-900 font-bold mb-1">
              <Handshake className="w-4 h-4 text-indigo-700" />
              <span>Capital Deployments & Strategic Transactions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              M&A, FDI & Joint Ventures Hub
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded">
              {maStories.length} Tracked Transactions & Partnerships
            </span>
          </div>
        </div>

        {/* Transaction Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Tracked Deal Value</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              $9.85B+
            </div>
            <span className="text-[11px] text-slate-400">Sum of verified deals & commitments</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Equity Injections</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              6 Deals
            </div>
            <span className="text-[11px] text-slate-400">Private equity & strategic stakes</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Joint Ventures</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              5 Major JVs
            </div>
            <span className="text-[11px] text-slate-400">Industrial, smart city & retail</span>
          </div>
        </div>

        {/* Story Feed */}
        <div className="space-y-4">
          {maStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </main>
    </div>
  );
}
