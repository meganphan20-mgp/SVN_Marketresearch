'use client';

import React from 'react';
import { Sector, WatchlistCompany } from '@/types/taxonomy';
import { recordAnalyticsEvent } from '@/lib/analytics/tracker';
import { Search, RotateCcw } from 'lucide-react';

interface FilterState {
  query: string;
  category: string;
  sectorSlug: string;
  companySlug: string;
  impact: string;
  verificationStatus: string;
  minRelevance: number;
}

interface Props {
  sectors: Sector[];
  companies: WatchlistCompany[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function FilterBar({ sectors, companies, filters, onFilterChange, onReset }: Props) {
  const categories = [
    'All Categories',
    'M&A / Investment',
    'Government Policy and Regulation',
    'Joint Ventures',
    'Investment',
    'Vietnam–Japan Economic Relations',
    'Market Intelligence',
  ];

  const impacts = [
    { label: 'All Impacts', value: 'all' },
    { label: 'Opportunity', value: 'OPPORTUNITY' },
    { label: 'Partnership', value: 'PARTNERSHIP' },
    { label: 'M&A / Investment', value: 'MA_INVESTMENT' },
    { label: 'Competitor Movement', value: 'COMPETITOR_MOVEMENT' },
    { label: 'Risk', value: 'RISK' },
    { label: 'Market Intelligence', value: 'MARKET_INTELLIGENCE' },
  ];

  const statuses = [
    { label: 'All Verification Statuses', value: 'all' },
    { label: 'VERIFIED', value: 'VERIFIED' },
    { label: 'PARTIALLY VERIFIED', value: 'PARTIALLY_VERIFIED' },
    { label: 'SINGLE SOURCE', value: 'SINGLE_SOURCE' },
    { label: 'CONFLICTING', value: 'CONFLICTING' },
    { label: 'UNVERIFIED', value: 'UNVERIFIED' },
  ];

  const handleUpdateFilter = (key: keyof FilterState, value: any) => {
    const updated = { ...filters, [key]: value };
    onFilterChange(updated);
    if (value !== 'all' && value !== '') {
      recordAnalyticsEvent('filter', {
        metadata: { filterKey: key, filterValue: value },
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-2xs">
      {/* Top Search Input */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
            placeholder='Search intelligence (e.g. "Masan", "data center", "renewable energy", "Mitsui", "M&A logistics")...'
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-md transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Filter Select Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Sector Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Sector
          </label>
          <select
            value={filters.sectorSlug}
            onChange={(e) => handleUpdateFilter('sectorSlug', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Sectors ({sectors.length})</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name} ({s.priority === 'PRIORITY_1' ? 'P1' : 'P2'})
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Company
          </label>
          <select
            value={filters.companySlug}
            onChange={(e) => handleUpdateFilter('companySlug', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Companies</option>
            <optgroup label="Japanese Trading Houses">
              {companies.filter(c => c.origin === 'JAPANESE_TRADING_HOUSE').map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Vietnamese Conglomerates">
              {companies.filter(c => c.origin === 'VIETNAM').map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Impact Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Business Impact
          </label>
          <select
            value={filters.impact}
            onChange={(e) => handleUpdateFilter('impact', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {impacts.map((imp) => (
              <option key={imp.value} value={imp.value}>{imp.label}</option>
            ))}
          </select>
        </div>

        {/* Verification Status Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Verification Status
          </label>
          <select
            value={filters.verificationStatus}
            onChange={(e) => handleUpdateFilter('verificationStatus', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {statuses.map((st) => (
              <option key={st.value} value={st.value}>{st.label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleUpdateFilter('category', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Minimum Relevance Score Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Min Relevance
            </label>
            <span className="text-xs font-mono font-bold text-blue-900">
              {filters.minRelevance}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={filters.minRelevance}
            onChange={(e) => onFilterChange({ ...filters, minRelevance: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
