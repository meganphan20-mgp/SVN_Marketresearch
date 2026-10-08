'use client';

import React from 'react';
import Link from 'next/link';
import { WatchlistCompany } from '@/types/taxonomy';
import { IntelligenceStory } from '@/types/intelligence';
import { Users, ArrowRight, Building } from 'lucide-react';

interface Props {
  companies: WatchlistCompany[];
  stories: IntelligenceStory[];
}

export function CompetitorWatch({ companies, stories }: Props) {
  const tradingHouses = companies.filter(c => c.origin === 'JAPANESE_TRADING_HOUSE');

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 mb-8 shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              4. Competitor Watch: Japanese Trading Houses (Sogo Shosha)
            </h3>
            <p className="text-xs text-slate-500">
              Tracking capital allocation, concessions, and partnerships across peer Japanese houses
            </p>
          </div>
        </div>

        <Link
          href="/companies"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 transition-colors"
        >
          <span>All Watchlists</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {tradingHouses.map((house) => {
          // Count recent stories mentioning this company
          const relatedStories = stories.filter(s =>
            s.companiesMentioned.some(c => c.slug === house.slug)
          );
          const hasRecent = relatedStories.length > 0;

          return (
            <Link
              key={house.id}
              href={`/companies/${house.slug}`}
              className={`p-3 rounded border text-left flex flex-col justify-between transition-all hover:border-blue-400 group ${
                hasRecent ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'
              }`}
            >
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{house.ticker}</span>
                  {hasRecent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active intelligence in past 7 days" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                  {house.name.replace(' Corporation', '').replace(' & Co.', '')}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Stories:</span>
                <span className="font-mono font-bold text-slate-800">{relatedStories.length}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
