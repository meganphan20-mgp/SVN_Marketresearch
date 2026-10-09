'use client';

import React, { useState, useMemo } from 'react';
import { IntelligenceStory } from '@/types/intelligence';
import { Sector, WatchlistCompany } from '@/types/taxonomy';
import { StoryCard } from '@/components/story/StoryCard';
import { FilterBar } from '@/components/filters/FilterBar';
import { CheckCircle2, Newspaper, Sparkles, Filter } from 'lucide-react';

interface Props {
  initialStories: IntelligenceStory[];
  sectors: Sector[];
  companies: WatchlistCompany[];
  initialCategory?: string;
  initialImpact?: string;
}

export function DashboardClientView({
  initialStories,
  sectors,
  companies,
  initialCategory,
  initialImpact,
}: Props) {
  const [filters, setFilters] = useState({
    query: '',
    category: initialCategory || 'all',
    sectorSlug: 'all',
    companySlug: 'all',
    impact: initialImpact || 'all',
    verificationStatus: 'all',
    minRelevance: 1,
    timeframe: 'all',
  });

  // Client-side instant filtering across all specified parameters
  const filteredStories = useMemo(() => {
    return initialStories.filter((story) => {
      // 1. Text Search across Title, Summary, Companies, Sectors, Categories, Sojitz Relevance Analysis
      if (filters.query.trim() !== '') {
        const q = filters.query.toLowerCase().trim();
        const inTitle = story.title.toLowerCase().includes(q);
        const inSummary = story.summary.toLowerCase().includes(q);
        const inWhy = story.whyItMattersToSojitz.toLowerCase().includes(q);
        const inSector = story.primarySectorName.toLowerCase().includes(q);
        const inCategory = story.category.toLowerCase().includes(q);
        const inCompanies = story.companiesMentioned.some(
          (c) => c.name.toLowerCase().includes(q) || (c.ticker && c.ticker.toLowerCase().includes(q))
        );
        if (!inTitle && !inSummary && !inWhy && !inSector && !inCategory && !inCompanies) {
          return false;
        }
      }

      // 2. Sector Filter
      if (filters.sectorSlug !== 'all' && story.primarySectorSlug !== filters.sectorSlug) {
        return false;
      }

      // 3. Company Filter
      if (filters.companySlug !== 'all' && !story.companiesMentioned.some((c) => c.slug === filters.companySlug)) {
        return false;
      }

      // 4. Category Filter
      if (filters.category !== 'all' && story.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // 5. Impact Filter
      if (filters.impact !== 'all' && story.businessImpact !== filters.impact) {
        return false;
      }

      // 6. Verification Status Filter
      if (filters.verificationStatus !== 'all' && story.verificationStatus !== filters.verificationStatus) {
        return false;
      }

      // 7. Relevance Score Slider
      if (story.relevanceScore < filters.minRelevance) {
        return false;
      }

      // 8. Timeframe Filter
      if (filters.timeframe === 'today') {
        const pubDate = story.sourcePublicationDateLocal || story.publicationDate || story.storyDate;
        if (!pubDate || pubDate < '2026-10-08') {
          return false;
        }
      } else if (filters.timeframe === 'week') {
        const pubDate = story.sourcePublicationDateLocal || story.publicationDate || story.storyDate;
        if (!pubDate || pubDate < '2026-10-05') {
          return false;
        }
      }

      return true;
    });
  }, [initialStories, filters]);

  // Top High-Priority Intelligence (Relevance Score >= 8)
  const topIntelligenceStories = useMemo(() => {
    return filteredStories.filter((s) => s.relevanceScore >= 8);
  }, [filteredStories]);

  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      sectorSlug: 'all',
      companySlug: 'all',
      impact: 'all',
      verificationStatus: 'all',
      minRelevance: 1,
      timeframe: 'all',
    });
  };

  return (
    <section className="mt-2">
      {/* Faceted Filter Toolbar */}
      <FilterBar
        sectors={sectors}
        companies={companies}
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* 6. Latest Intelligence Feed Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-slate-700" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
            {filters.query || filters.sectorSlug !== 'all' || filters.companySlug !== 'all' || filters.impact !== 'all'
              ? 'Filtered Intelligence Results'
              : '6. Latest Intelligence'}
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing <span className="font-bold text-slate-900">{filteredStories.length}</span> verified stories
        </div>
      </div>

      {/* Stories List */}
      {filteredStories.length > 0 ? (
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center">
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            No intelligence stories matched your criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Try adjusting your search query, lowering the minimum relevance slider, or clearing the active sector and verification filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            Clear All Active Filters
          </button>
        </div>
      )}
    </section>
  );
}
