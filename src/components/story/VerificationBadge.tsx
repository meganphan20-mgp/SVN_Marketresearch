'use client';

import React from 'react';
import { VerificationStatus } from '@/types/intelligence';
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, HelpCircle } from 'lucide-react';

interface Props {
  status: VerificationStatus;
  confidenceScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export function VerificationBadge({ status, confidenceScore, size = 'md', showScore = true }: Props) {
  const config = {
    VERIFIED: {
      label: 'VERIFIED',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      tooltip: 'Cross-verified across ≥2 independent sources or confirmed by official Tier 1 filing',
    },
    PARTIALLY_VERIFIED: {
      label: 'PARTIALLY VERIFIED',
      bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      tooltip: 'Core event confirmed, but minor discrepancies exist across reported figures or timelines',
    },
    SINGLE_SOURCE: {
      label: 'SINGLE SOURCE',
      bg: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700',
      icon: Shield,
      iconColor: 'text-sky-600 dark:text-sky-400',
      tooltip: 'Reported by one credible media outlet. Corroborating sources pending',
    },
    CONFLICTING: {
      label: 'CONFLICTING',
      bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
      icon: ShieldAlert,
      iconColor: 'text-rose-600 dark:text-rose-400',
      tooltip: 'Credible sources report materially conflicting terms or contradictory facts',
    },
    UNVERIFIED: {
      label: 'UNVERIFIED',
      bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: HelpCircle,
      iconColor: 'text-slate-500 dark:text-slate-400',
      tooltip: 'Reported only in secondary blogs or trade channels without independent confirmation',
    },
  }[status];

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center font-semibold rounded border tracking-wide uppercase font-mono ${sizeClasses} ${config.bg}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${config.iconColor}`} />
      <span>{config.label}</span>
      {showScore && confidenceScore !== undefined && (
        <span className="opacity-80 font-normal ml-0.5 border-l border-current pl-1.5">
          {confidenceScore > 10 ? Math.round(confidenceScore) : Math.round(confidenceScore * 10)}%
        </span>
      )}
    </span>
  );
}
