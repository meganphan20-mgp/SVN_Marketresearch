'use client';

import React from 'react';
import { DashboardKpis } from '@/types/intelligence';
import { 
  FileSearch, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface Props {
  kpis: DashboardKpis;
}

export function KpiBanner({ kpis }: Props) {
  const statCards = [
    {
      label: 'Articles Scanned',
      value: kpis.articlesScanned.toLocaleString(),
      subtext: 'Across 14 Tier 1/2 Sources',
      icon: FileSearch,
      color: 'text-slate-700',
      bg: 'bg-slate-50',
    },
    {
      label: 'Intelligence Stories',
      value: kpis.intelligenceStories,
      subtext: 'Clustered & Deduplicated',
      icon: Layers,
      color: 'text-blue-700',
      bg: 'bg-blue-50/50',
    },
    {
      label: 'High Priority',
      value: kpis.highPriorityStories,
      subtext: 'Relevance Score 8–10',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
    },
    {
      label: 'Opportunities',
      value: kpis.opportunitiesCount,
      subtext: 'Partnerships & Off-takes',
      icon: Sparkles,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50/50',
    },
    {
      label: 'Risks',
      value: kpis.risksCount,
      subtext: 'Regulatory & Counterparty',
      icon: AlertTriangle,
      color: 'text-rose-700',
      bg: 'bg-rose-50/50',
    },
    {
      label: 'M&A Activity',
      value: kpis.maActivityCount,
      subtext: 'Deals & Strategic JVs',
      icon: TrendingUp,
      color: 'text-purple-700',
      bg: 'bg-purple-50/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`border border-slate-200 rounded-lg p-3 sm:p-3.5 bg-white shadow-2xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {stat.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
