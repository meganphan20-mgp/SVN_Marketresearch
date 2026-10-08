import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { AdminAnalyticsView } from './analytics-view';
import { ArrowLeft, BarChart3, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Executive Telemetry & Reader Analytics | Sojitz Vietnam',
  description: 'Behavioral intelligence analytics: reading depth, useful votes, drop-off rates, source CTR, and recommendation ranking optimization signals.',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Management Console</span>
          </Link>

          <span className="text-xs font-mono text-slate-400">
            System Telemetry Engine • Active Stream
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-900 font-bold mb-1">
              <BarChart3 className="w-4 h-4 text-indigo-700" />
              <span>Executive Telemetry & Recommendation Feedback System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Behavioral & Intelligence Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tracks reader drop-off, reading depth, useful vs not useful signals, and algorithmic ranking adjustments over time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Ingestion Stream
            </span>
          </div>
        </div>

        {/* Analytics View */}
        <AdminAnalyticsView />
      </main>
    </div>
  );
}
