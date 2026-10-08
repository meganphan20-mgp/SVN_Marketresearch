'use client';

import React from 'react';
import Link from 'next/link';
import { WatchlistCompany } from '@/types/taxonomy';
import { IntelligenceStory } from '@/types/intelligence';
import { Building2, ArrowRight } from 'lucide-react';

interface Props {
  companies: WatchlistCompany[];
  stories: IntelligenceStory[];
}

export function CompanyWatch({ companies, stories }: Props) {
  const vnCompanies = companies.filter(c => c.origin === 'VIETNAM');

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 mb-8 shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Vietnam Corporate Watchlist
            </h3>
            <p className="text-xs text-slate-500">
              Monitoring domestic champions, private conglomerates, state infrastructure, and key targets
            </p>
          </div>
        </div>

        <Link
          href="/companies"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 transition-colors"
        >
          <span>All Companies</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {vnCompanies.map((comp) => {
          const count = stories.filter(s =>
            s.companiesMentioned.some(c => c.slug === comp.slug)
          ).length;

          return (
            <Link
              key={comp.id}
              href={`/companies/${comp.slug}`}
              className="p-3 rounded border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>{comp.ticker || 'UNLISTED'}</span>
                  {count > 0 && (
                    <span className="text-blue-700 font-bold bg-blue-50 px-1 rounded">
                      {count} items
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                  {comp.name}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
