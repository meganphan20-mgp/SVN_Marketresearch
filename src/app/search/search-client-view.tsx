'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { IntelligenceStory } from '@/types/intelligence';
import { Sector, WatchlistCompany } from '@/types/taxonomy';
import { StoryCard } from '@/components/story/StoryCard';
import { recordAnalyticsEvent } from '@/lib/analytics/tracker';
import { Search, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  allStories: IntelligenceStory[];
  sectors: Sector[];
  companies: WatchlistCompany[];
}

export function SearchClientView({ allStories, sectors, companies }: Props) {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');

  const suggestions = [
    'Masan',
    'data center',
    'renewable energy',
    'Mitsui',
    'M&A logistics',
    'DPPA',
    'Sumitomo',
    'Stavian',
    'Long Duc',
    'Vingroup',
  ];

  const searchResults = useMemo(() => {
    return allStories.filter((story) => {
      if (query.trim() !== '') {
        const q = query.toLowerCase().trim();
        const inTitle = story.title.toLowerCase().includes(q);
        const inSummary = story.summary.toLowerCase().includes(q);
        const inWhy = story.whyItMattersToSojitz.toLowerCase().includes(q);
        const inSector = story.primarySectorName.toLowerCase().includes(q);
        const inCategory = story.category.toLowerCase().includes(q);
        const inCompanies = story.companiesMentioned.some(
          c => c.name.toLowerCase().includes(q) || (c.ticker && c.ticker.toLowerCase().includes(q))
        );
        if (!inTitle && !inSummary && !inWhy && !inSector && !inCategory && !inCompanies) {
          return false;
        }
      }

      if (selectedSector !== 'all' && story.primarySectorSlug !== selectedSector) {
        return false;
      }

      if (selectedCompany !== 'all' && !story.companiesMentioned.some(c => c.slug === selectedCompany)) {
        return false;
      }

      return true;
    });
  }, [allStories, query, selectedSector, selectedCompany]);

  // Telemetry tracking for search query
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      recordAnalyticsEvent('search', {
        query: query.trim(),
        metadata: {
          resultsCount: searchResults.length,
          selectedSector,
          selectedCompany,
        },
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [query, searchResults.length, selectedSector, selectedCompany]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Historical Intelligence Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Full-spectrum search across titles, executive summaries, mentioned companies, sectors, and Sojitz strategic analyses.
        </p>
      </div>

      {/* Main Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-2xs">
        <div className="relative mb-3">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, companies, commodities, or strategic topics..."
            className="w-full pl-11 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-colors"
            autoFocus
          />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs mb-4">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
          </span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => setQuery(sug)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              &ldquo;{sug}&rdquo;
            </button>
          ))}
        </div>

        {/* Facet Refinements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Filter by Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-800"
            >
              <option value="all">All Sectors ({sectors.length})</option>
              {sectors.map(s => (
                <option key={s.id} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Filter by Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-800"
            >
              <option value="all">All Companies ({companies.length})</option>
              {companies.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Search Results ({searchResults.length})
        </h2>
        {(query || selectedSector !== 'all' || selectedCompany !== 'all') && (
          <button
            onClick={() => { setQuery(''); setSelectedSector('all'); setSelectedCompany('all'); }}
            className="text-xs text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Search</span>
          </button>
        )}
      </div>

      {/* Results List */}
      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-500 text-xs">
          No intelligence records found matching &ldquo;{query}&rdquo;.
        </div>
      )}
    </div>
  );
}
