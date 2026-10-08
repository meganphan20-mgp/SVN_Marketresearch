import React from 'react';
import Link from 'next/link';
import { getWeeklyReports } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { FileText, ArrowRight, Calendar, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Weekly Intelligence Reports Archive | Sojitz Vietnam',
  description: 'Weekly C-suite market intelligence reports covering Vietnam economy, policy, M&A, and Japanese trading house activity.',
};

export default async function WeeklyIndexPage() {
  const reports = await getWeeklyReports();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Weekly Intelligence Reports Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Official 12-section Monday–Sunday executive synthesis reports compiled for Sojitz Vietnam management.
          </p>
        </div>

        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-blue-900 font-semibold font-mono mb-1.5">
                  <span className="bg-blue-900 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded shadow-2xs">
                    W{rep.weekNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    <span>Coverage: {rep.startDate} to {rep.endDate}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Year {rep.year}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  <Link href={`/weekly/${rep.slug}`} className="hover:text-blue-900 transition-colors">
                    {rep.title}
                  </Link>
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                  {rep.executiveSummary}
                </p>
              </div>

              <Link
                href={`/weekly/${rep.slug}`}
                className="self-start sm:self-center px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Read Full Briefing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
