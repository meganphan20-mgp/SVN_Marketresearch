import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanies, getIntelligenceStories } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { ArrowLeft, Building2, Globe, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companies = await getCompanies();
  const company = companies.find(c => c.slug === slug);
  if (!company) return { title: 'Company Not Found' };
  return {
    title: `${company.name} Intelligence Dossier | Sojitz Vietnam`,
    description: company.description,
  };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companies = await getCompanies();
  const company = companies.find(c => c.slug === slug);

  if (!company) {
    notFound();
  }

  const stories = await getIntelligenceStories({ companySlug: company.slug });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Companies Directory</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">
            Entity Slug: {company.slug}
          </span>
        </div>

        {/* Company Overview Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {company.origin === 'JAPANESE_TRADING_HOUSE' ? 'Japanese Trading House (Sogo Shosha)' : 'Vietnamese Conglomerate'}
            </span>
            {company.ticker && (
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                Ticker: {company.ticker}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            {company.name}
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl mb-4">
            {company.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
            <span>Aliases: {company.aliases.join(', ')}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold font-mono">
              {stories.length} Verified Stories Monitored
            </span>
          </div>
        </div>

        {/* Intelligence Feed for this Company */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 uppercase">
            Intelligence Dossier History ({stories.length})
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
            No intelligence stories currently recorded for {company.name}.
          </div>
        )}
      </main>
    </div>
  );
}
