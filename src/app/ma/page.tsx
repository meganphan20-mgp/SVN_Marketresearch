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
    s.category.toLowerCase().includes('joint venture') ||
    (s.extractedFacts?.dealValueUsd != null && s.extractedFacts.dealValueUsd > 0)
  );

  // Compute metrics dynamically from verified stories
  const totalDealValueMillion = maStories.reduce((acc, s) => acc + (s.extractedFacts?.dealValueUsd || 0), 0);
  const formattedDealValue = totalDealValueMillion >= 1000
    ? `$${(totalDealValueMillion / 1000).toFixed(2)}B+`
    : totalDealValueMillion > 0
    ? `$${totalDealValueMillion.toFixed(1)}M+`
    : 'Undisclosed';

  const disclosedDealsCount = maStories.filter(s => (s.extractedFacts?.dealValueUsd || 0) > 0).length;

  const equityDealsCount = maStories.filter(s => 
    s.businessImpact === 'MA_INVESTMENT' || 
    s.category.toLowerCase().includes('m&a') || 
    (s.extractedFacts?.stakePercentage != null && s.extractedFacts.stakePercentage > 0)
  ).length;

  const jvDealsCount = maStories.filter(s => 
    s.businessImpact === 'PARTNERSHIP' || 
    s.category.toLowerCase().includes('joint venture') || 
    s.category.toLowerCase().includes('partnership') ||
    (s.extractedFacts?.keyPartners && s.extractedFacts.keyPartners.length > 0)
  ).length;

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
              {formattedDealValue}
            </div>
            <span className="text-[11px] text-slate-500">
              Sum of disclosed capital values across {disclosedDealsCount} verified transactions
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>Equity & Strategic Stakes</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {equityDealsCount} Deals
            </div>
            <span className="text-[11px] text-slate-500">
              Private equity, debt-to-equity conversions & strategic stakes
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Joint Ventures & Alliances</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {jvDealsCount} Strategic JVs
            </div>
            <span className="text-[11px] text-slate-500">
              Cross-border consortiums, infrastructure & operational alliances
            </span>
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
