'use client';

import React from 'react';
import Link from 'next/link';
import { Sector } from '@/types/taxonomy';
import { Layers, ArrowRight } from 'lucide-react';

interface Props {
  sectors: Sector[];
  activeSectorSlug?: string;
  onSelectSector?: (slug: string) => void;
}

export function SectorWatch({ sectors, activeSectorSlug, onSelectSector }: Props) {
  const priority1 = sectors.filter(s => s.priority === 'PRIORITY_1');
  const priority2 = sectors.filter(s => s.priority === 'PRIORITY_2');

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 mb-8 shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              5. Sector Watch: Priority 1 & 2 Divisions
            </h3>
            <p className="text-xs text-slate-500">
              Priority 1 core trading divisions & Priority 2 strategic emergence sectors
            </p>
          </div>
        </div>

        <Link
          href="/sectors"
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 transition-colors"
        >
          <span>All Sectors</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Priority 1 Sectors */}
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Priority 1: Core Sojitz Verticals</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {priority1.map((sec) => (
            <Link
              key={sec.id}
              href={`/sectors/${sec.slug}`}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                activeSectorSlug === sec.slug
                  ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                  : 'bg-slate-50 hover:bg-blue-50 text-slate-800 border-slate-200 hover:border-blue-300'
              }`}
            >
              <span>{sec.name}</span>
              {sec.storyCount !== undefined && sec.storyCount > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">({sec.storyCount})</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Priority 2 Sectors */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Priority 2: Strategic Emergence & Decarbonization</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {priority2.map((sec) => (
            <Link
              key={sec.id}
              href={`/sectors/${sec.slug}`}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                activeSectorSlug === sec.slug
                  ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{sec.name}</span>
              {sec.storyCount !== undefined && sec.storyCount > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">({sec.storyCount})</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
