import React from 'react';
import { Header } from '@/components/layout/Header';
import { KpiBanner } from '@/components/dashboard/KpiBanner';
import { TopIntelligence } from '@/components/dashboard/TopIntelligence';
import { OpportunityRadar } from '@/components/dashboard/OpportunityRadar';
import { CompanyWatch } from '@/components/dashboard/CompanyWatch';
import { CompetitorWatch } from '@/components/dashboard/CompetitorWatch';
import { SectorWatch } from '@/components/dashboard/SectorWatch';
import { DashboardClientView } from './dashboard-client-view';
import { 
  getIntelligenceStories, 
  getSectors, 
  getCompanies, 
  getDashboardKpis 
} from '@/lib/data/intelligence-store';

export const metadata = {
  title: 'SOJITZ VIETNAM MARKET INTELLIGENCE | Executive Dashboard',
  description: 'AI-powered corporate market intelligence, multi-source fact verification, and strategic insights for Sojitz Vietnam.',
};

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const initialCategory = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const initialImpact = typeof searchParams.impact === 'string' ? (searchParams.impact as any) : undefined;
  const initialTimeframe = typeof searchParams.timeframe === 'string' ? (searchParams.timeframe as any) : undefined;

  const [stories, sectors, companies, kpis] = await Promise.all([
    getIntelligenceStories({
      category: initialCategory,
      impact: initialImpact,
      timeframe: initialTimeframe,
    }),
    getSectors(),
    getCompanies(),
    getDashboardKpis(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Executive Banner & Subtitle */}
        <div className="mb-6 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-semibold mb-1">
              Internal Executive Briefing • Corporate Planning & Business Development
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Market Intelligence
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Ingestion Active • 14 Monitored Nodes</span>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <KpiBanner kpis={kpis} />

        {/* 1. Top Intelligence (High Priority Score 8-10) */}
        <TopIntelligence stories={stories} />

        {/* 2. Opportunity Radar (P1 & P2 Strategic Openings) */}
        <OpportunityRadar stories={stories} />

        {/* 3. Vietnam Corporate Watchlist */}
        <CompanyWatch companies={companies} stories={stories} />

        {/* 4. Competitor Watch: Japanese Sogo Shosha */}
        <CompetitorWatch companies={companies} stories={stories} />

        {/* 5. Sector Intelligence Watch */}
        <SectorWatch sectors={sectors} />

        {/* 6. Latest Intelligence Clustered Feed with Faceted Filter Controls */}
        <DashboardClientView
          initialStories={stories}
          sectors={sectors}
          companies={companies}
          initialCategory={initialCategory}
          initialImpact={initialImpact}
        />
      </main>

      {/* Corporate Executive Footer */}
      <footer className="bg-[#0A192F] text-slate-400 border-t border-slate-800 py-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-wider">SOJITZ VIETNAM</span>
            <span>|</span>
            <span>Market Intelligence System</span>
            <span>•</span>
            <span className="font-mono text-[11px]">Strictly Confidential / Internal Use</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Verified Primary Sources Only</span>
            <span>•</span>
            <span>Zero Hallucination Guarantee</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
