'use client';

import React from 'react';
import { BusinessImpactType } from '@/types/intelligence';
import { Sparkles, Handshake, TrendingUp, Users, AlertOctagon, LineChart } from 'lucide-react';

interface Props {
  impact: BusinessImpactType;
  size?: 'sm' | 'md';
}

export function ImpactBadge({ impact, size = 'md' }: Props) {
  const config = {
    OPPORTUNITY: {
      label: 'Opportunity',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
      icon: Sparkles,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    PARTNERSHIP: {
      label: 'Partnership',
      bg: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700',
      icon: Handshake,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    MA_INVESTMENT: {
      label: 'M&A / Investment',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700',
      icon: TrendingUp,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    COMPETITOR_MOVEMENT: {
      label: 'Competitor Movement',
      bg: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
      icon: Users,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    RISK: {
      label: 'Risk',
      bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
      icon: AlertOctagon,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    MARKET_INTELLIGENCE: {
      label: 'Market Intelligence',
      bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: LineChart,
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  }[impact];

  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded border ${sizeClass} ${config.bg}`}>
      <Icon className={`w-3.5 h-3.5 shrink-0 ${config.iconColor}`} />
      <span>{config.label}</span>
    </span>
  );
}
