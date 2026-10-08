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
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Sparkles,
      iconColor: 'text-emerald-700',
    },
    PARTNERSHIP: {
      label: 'Partnership',
      bg: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: Handshake,
      iconColor: 'text-blue-700',
    },
    MA_INVESTMENT: {
      label: 'M&A / Investment',
      bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      icon: TrendingUp,
      iconColor: 'text-indigo-700',
    },
    COMPETITOR_MOVEMENT: {
      label: 'Competitor Movement',
      bg: 'bg-purple-100 text-purple-900 border-purple-300',
      icon: Users,
      iconColor: 'text-purple-700',
    },
    RISK: {
      label: 'Risk',
      bg: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: AlertOctagon,
      iconColor: 'text-rose-700',
    },
    MARKET_INTELLIGENCE: {
      label: 'Market Intelligence',
      bg: 'bg-slate-200 text-slate-800 border-slate-300',
      icon: LineChart,
      iconColor: 'text-slate-700',
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
