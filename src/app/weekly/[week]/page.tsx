import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWeeklyReport, getWeeklyReports } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryCard } from '@/components/story/StoryCard';
import { WeeklyReportTracker } from '@/components/analytics/WeeklyReportTracker';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  Users, 
  Layers, 
  Briefcase, 
  Compass, 
  ArrowLeft,
  Printer,
  ExternalLink
} from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const report = await getWeeklyReport(week);
  if (!report) return { title: 'Report Not Found | Sojitz Vietnam Market Intelligence' };
  return {
    title: `${report.title} | Sojitz Vietnam Market Intelligence`,
    description: report.executiveSummary.slice(0, 160),
  };
}

export default async function WeeklyReportPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const report = await getWeeklyReport(week);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />
      <WeeklyReportTracker weekSlug={report.slug} year={report.year} weekNumber={report.weekNumber} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Control Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Published: {new Date(report.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Report Container */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 md:p-10">
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-bold mb-2">
              <FileText className="w-4 h-4 text-blue-800" />
              <span>C-Suite Intelligence Briefing • Monday–Sunday Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              {report.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold">
                Coverage: {report.startDate} to {report.endDate}
              </span>
              <span>•</span>
              <span>Year {report.year} • Week {report.weekNumber}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{report.curatedStoryCount || report.curatedStories?.length || 0} High-Value Curated Stories</span>
            </div>
          </div>

          {/* 1. EXECUTIVE SUMMARY */}
          <section className="mb-10 bg-slate-900 text-white rounded-xl p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Executive Summary</span>
            </h2>
            <p className="text-slate-100 leading-relaxed text-sm sm:text-base font-normal">
              {report.executiveSummary}
            </p>
          </section>

          {/* 2. TOP DEVELOPMENTS */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-900" />
              <span>2. Top Developments</span>
            </h2>
            <div className="space-y-4">
              {report.topDevelopments.map((dev, idx) => {
                const matchedStory = report.curatedStories?.find(
                  s => (dev.storyId && (s.id === dev.storyId || s.slug === dev.storyId)) ||
                       s.title.toLowerCase().trim() === dev.title.toLowerCase().trim()
                );
                const storyHref = dev.storyId 
                  ? `/story/${dev.storyId}` 
                  : matchedStory 
                    ? `/story/${matchedStory.id}` 
                    : null;

                return (
                  <div key={idx} className="border-l-4 border-blue-900 pl-4 py-1">
                    {storyHref ? (
                      <Link
                        href={storyHref}
                        className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors mb-1"
                        title="View detailed verified intelligence story dossier"
                      >
                        <span className="group-hover:underline">{dev.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0 transition-colors" />
                      </Link>
                    ) : (
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{dev.title}</h3>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed mb-1.5">{dev.summary}</p>
                    <div className="text-xs font-semibold text-blue-950 bg-blue-50 p-2 rounded">
                      <span className="uppercase text-[10px] text-blue-700 font-bold block mb-0.5">Strategic Significance for Sojitz</span>
                      {dev.significance}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. TOP BUSINESS OPPORTUNITIES */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>3. Top Business Opportunities</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.topBusinessOpportunities.map((opp, idx) => {
                const matchedStory = report.curatedStories?.find(
                  s => s.title.toLowerCase().includes(opp.headline.toLowerCase().slice(0, 25)) ||
                       (opp.targetCompanyOrProject && s.companiesMentioned?.some(c => c.name.toLowerCase().includes(opp.targetCompanyOrProject.toLowerCase())))
                );
                const oppHref = matchedStory ? `/story/${matchedStory.id}` : null;

                return (
                  <div key={idx} className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold mb-1">
                        {opp.sector} • {opp.actionWindow}
                      </div>
                      {oppHref ? (
                        <Link
                          href={oppHref}
                          className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors mb-2 leading-snug"
                          title="View related intelligence story dossier"
                        >
                          <span className="group-hover:underline">{opp.headline}</span>
                          <ExternalLink className="w-3 h-3 text-emerald-600/70 group-hover:text-emerald-800 shrink-0 transition-colors" />
                        </Link>
                      ) : (
                        <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{opp.headline}</h3>
                      )}
                      <div className="text-xs text-slate-700 mb-2 leading-relaxed">{opp.strategicRationale}</div>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/60 text-[11px] font-semibold text-emerald-900">
                      Target: {opp.targetCompanyOrProject}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. MACRO & POLICY */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-700" />
              <span>4. Macro & Policy Environment</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {report.macroPolicy}
            </p>
          </section>

          {/* 5. M&A / INVESTMENT */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-700" />
              <span>5. M&A & Capital Deployment</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {report.maInvestment}
            </p>
          </section>

          {/* 6. JAPANESE COMPANIES */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-800" />
              <span>6. Japanese Companies in Vietnam</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {report.japaneseCompanies}
            </p>
          </section>

          {/* 7. JAPANESE TRADING HOUSES */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-700" />
              <span>7. Japanese Trading House Activity (Sogo Shosha)</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {report.japaneseTradingHouses}
            </p>
          </section>

          {/* 8. VIETNAM CORPORATE WATCH */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-800" />
              <span>8. Vietnam Corporate Watch</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {report.vietnamCorporateWatch}
            </p>
          </section>

          {/* 9. SECTOR INTELLIGENCE */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>9. Sector Intelligence Matrix</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.sectorIntelligence.map((sec, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-4">
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                    {sec.sectorName}
                  </div>
                  <div className="text-xs text-slate-800 font-medium mb-2">{sec.keyTrend}</div>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-0.5">Strategic Implication:</span>
                    {sec.implication}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10. RISKS */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>10. Market & Regulatory Risks</span>
            </h2>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-950 leading-relaxed">
              {report.risksAnalysis}
            </div>
          </section>

          {/* 11. WHAT SOJITZ SHOULD WATCH */}
          <section className="mb-10">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-900" />
              <span>11. What Sojitz Should Watch Next</span>
            </h2>
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg text-sm text-blue-950 leading-relaxed">
              {report.whatSojitzShouldWatch}
            </div>
          </section>

          {/* 12. SUGGESTED BUSINESS DEVELOPMENT ACTIONS */}
          <section className="mb-12">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span>12. Suggested Business Development Actions</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Action Item</th>
                    <th className="p-3">Target Partner / Vertical</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Division</th>
                    <th className="p-3">Target Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.suggestedBdActions.map((action, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{action.action}</td>
                      <td className="p-3 text-slate-700">{action.targetPartnerOrSector}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                          action.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {action.priority}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{action.responsibleDivision}</td>
                      <td className="p-3 text-emerald-800 font-medium">{action.expectedOutcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CURATED HIGH-VALUE INTELLIGENCE STORIES SECTION */}
          <section className="pt-8 border-t border-slate-200">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center justify-between">
              <span>Curated High-Value Intelligence Stories ({report.curatedStoryCount})</span>
              <span className="text-xs font-normal text-slate-500 font-mono">Score 8.0 - 10.0</span>
            </h2>
            <div className="space-y-4">
              {report.curatedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
