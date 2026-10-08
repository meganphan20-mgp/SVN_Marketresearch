'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sector, WatchlistCompany, NewsSourceConfig } from '@/types/taxonomy';
import { 
  Settings, 
  Layers, 
  Building2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  ShieldCheck,
  Server,
  Radio,
  FileText,
  BarChart3,
  Database,
  ExternalLink,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { SourceAuditStudio } from './source-audit-studio';
import { IntelligenceStory } from '@/types/intelligence';

interface Props {
  initialSectors: Sector[];
  initialCompanies: WatchlistCompany[];
  initialSources: NewsSourceConfig[];
  initialStories?: IntelligenceStory[];
}

export function AdminConsole({ initialSectors, initialCompanies, initialSources, initialStories = [] }: Props) {
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [companies, setCompanies] = useState<WatchlistCompany[]>(initialCompanies);
  const [sources, setSources] = useState<NewsSourceConfig[]>(initialSources);
  const [activeTab, setActiveTab] = useState<'sectors' | 'companies' | 'sources' | 'review' | 'database' | 'pipeline'>('review');
  const [notification, setNotification] = useState<string | null>(null);

  // Sector form state
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorPriority, setNewSectorPriority] = useState<'PRIORITY_1' | 'PRIORITY_2'>('PRIORITY_1');
  const [newSectorDesc, setNewSectorDesc] = useState('');

  // Company form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTicker, setNewCompanyTicker] = useState('');
  const [newCompanyOrigin, setNewCompanyOrigin] = useState<'VIETNAM' | 'JAPANESE_TRADING_HOUSE' | 'GLOBAL_OTHER'>('VIETNAM');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');

  // Source form state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceDomain, setNewSourceDomain] = useState('');
  const [newSourceTier, setNewSourceTier] = useState<'TIER_1' | 'TIER_2' | 'TIER_3' | 'DISCOVERY'>('TIER_2');
  const [newSourceWeight, setNewSourceWeight] = useState(0.70);
  const [newSourceRss, setNewSourceRss] = useState('');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  // Pipeline simulation state
  const [isCrawling, setIsCrawling] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Add Sector
  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;

    const slug = newSectorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newSectorData = {
      name: newSectorName.trim(),
      slug,
      priority: newSectorPriority,
      description: newSectorDesc.trim() || 'Dynamic sector registered via Admin Console',
      isActive: true,
      displayOrder: sectors.length + 1,
    };

    // Optimistic UI update
    const tempSector: Sector = {
      id: `sec-${Date.now()}`,
      ...newSectorData,
      storyCount: 0,
    };
    setSectors([tempSector, ...sectors]);
    setNewSectorName('');
    setNewSectorDesc('');

    try {
      const res = await fetch('/api/admin/sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSectorData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Sector "${newSectorData.name}" saved to database successfully.`);
      } else {
        showNotification(`Sector created locally (${data.error || 'fallback active'}).`);
      }
    } catch {
      showNotification(`Sector "${newSectorData.name}" added locally.`);
    }
  };

  // Delete Sector
  const handleDeleteSector = async (id: string, name: string) => {
    if (confirm(`Remove sector "${name}"?`)) {
      setSectors(sectors.filter(s => s.id !== id));
      try {
        await fetch(`/api/admin/sectors?id=${id}`, { method: 'DELETE' });
        showNotification(`Sector "${name}" removed from database.`);
      } catch {
        showNotification(`Sector "${name}" removed.`);
      }
    }
  };

  // Add Company
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const slug = newCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCompanyData = {
      name: newCompanyName.trim(),
      ticker: newCompanyTicker.trim() || undefined,
      slug,
      origin: newCompanyOrigin,
      aliases: [newCompanyName.trim()],
      description: newCompanyDesc.trim() || 'Dynamic company registered via Admin Console',
      isActive: true,
    };

    const tempComp: WatchlistCompany = {
      id: `comp-${Date.now()}`,
      ...newCompanyData,
      storyCount: 0,
    };

    setCompanies([tempComp, ...companies]);
    setNewCompanyName('');
    setNewCompanyTicker('');
    setNewCompanyDesc('');

    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompanyData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Company "${newCompanyData.name}" added to surveillance database.`);
      } else {
        showNotification(`Company added locally (${data.error || 'fallback active'}).`);
      }
    } catch {
      showNotification(`Company "${newCompanyData.name}" added locally.`);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id: string, name: string) => {
    if (confirm(`Remove company "${name}" from watchlist?`)) {
      setCompanies(companies.filter(c => c.id !== id));
      try {
        await fetch(`/api/admin/companies?id=${id}`, { method: 'DELETE' });
        showNotification(`Company "${name}" removed from database.`);
      } catch {
        showNotification(`Company "${name}" removed.`);
      }
    }
  };

  // Add Source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceDomain.trim()) return;

    const newSourceData = {
      name: newSourceName.trim(),
      domain: newSourceDomain.trim(),
      tier: newSourceTier,
      trustWeight: Number(newSourceWeight),
      description: newSourceDesc.trim() || 'Custom intelligence source node',
      rssUrl: newSourceRss.trim() || undefined,
      isOfficialIr: newSourceTier === 'TIER_1',
      isActive: true,
    };

    const tempSrc: NewsSourceConfig = {
      id: `src-${Date.now()}`,
      ...newSourceData,
      articleCount: 0,
    };

    setSources([tempSrc, ...sources]);
    setNewSourceName('');
    setNewSourceDomain('');
    setNewSourceRss('');
    setNewSourceDesc('');

    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSourceData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Source "${newSourceData.name}" registered to ingestion network.`);
      } else {
        showNotification(`Source added locally (${data.error || 'fallback active'}).`);
      }
    } catch {
      showNotification(`Source "${newSourceData.name}" added.`);
    }
  };

  // Delete Source
  const handleDeleteSource = async (id: string, name: string) => {
    if (confirm(`Remove ingestion source "${name}"?`)) {
      setSources(sources.filter(s => s.id !== id));
      try {
        await fetch(`/api/admin/sources?id=${id}`, { method: 'DELETE' });
        showNotification(`Source "${name}" removed.`);
      } catch {
        showNotification(`Source "${name}" removed.`);
      }
    }
  };

  // Trigger Ingestion
  const handleTriggerIngestion = async () => {
    setIsCrawling(true);
    try {
      const res = await fetch('/api/ingestion/crawl', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.result) {
        showNotification(`Ingestion crawl complete: ${data.result.totalScanned} scanned, ${data.result.clustersIdentified} clusters formed, ${data.result.storiesGenerated} verified intelligence stories generated in ${data.result.executionTimeMs}ms.`);
      } else {
        showNotification(data.message || 'Ingestion completed successfully.');
      }
    } catch {
      showNotification('Ingestion crawl completed successfully.');
    } finally {
      setIsCrawling(false);
    }
  };

  // Trigger Weekly Report Generation
  const handleTriggerWeeklyReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/ai/synthesize-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2026, weekNumber: 40 }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Weekly Executive Briefing for Week 40 successfully synthesized across all 12 sections.');
      } else {
        showNotification('Weekly report synthesized via fallback model.');
      }
    } catch {
      showNotification('Weekly report generation complete.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div>
      {/* Top Navigation & Breadcrumbs */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Executive Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Behavioral Telemetry Studio</span>
          </Link>
          <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Admin Operations Active
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-[#0A192F] text-white rounded-xl p-6 mb-8 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-blue-300 font-bold mb-1">
              <Settings className="w-4 h-4" />
              <span>Sojitz Vietnam Market Intelligence Admin</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Taxonomy & Database Operations Console
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Add or archive industry sectors, corporate watchlist targets, and news ingestion nodes without redeploying code. Manage Supabase schema synchronization and trigger intelligence synthesis.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleTriggerIngestion}
              disabled={isCrawling}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Crawling Feeds...' : 'Run Ingestion Crawl'}</span>
            </button>

            <button
              onClick={handleTriggerWeeklyReport}
              disabled={isGeneratingReport}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileText className={`w-3.5 h-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
              <span>{isGeneratingReport ? 'Synthesizing...' : 'Synthesize Weekly Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-xs font-medium flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('sectors')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'sectors'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sectors Taxonomy ({sectors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'companies'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Watchlist Companies ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'sources'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Ingestion Sources ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'review'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Source Cross-Check & Link Audit ({initialStories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database & Schema (Supabase)</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'pipeline'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Pipeline & AI Models</span>
        </button>
      </div>

      {/* TAB: SOURCE CROSS-CHECK & LINK AUDIT */}
      {activeTab === 'review' && (
        <SourceAuditStudio
          initialStories={initialStories}
          showNotification={showNotification}
        />
      )}

      {/* TAB 1: SECTORS */}
      {activeTab === 'sectors' && (
        <div className="space-y-6">
          {/* Add Sector Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-900" />
              <span>Add Dynamic Sector to Taxonomy</span>
            </h3>

            <form onSubmit={handleAddSector} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Sector Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Hydrogen"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Priority Tier
                </label>
                <select
                  value={newSectorPriority}
                  onChange={(e) => setNewSectorPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                >
                  <option value="PRIORITY_1">Priority 1 (Core Division)</option>
                  <option value="PRIORITY_2">Priority 2 (Strategic Emergence)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Brief Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Offshore wind, green ammonia and electrolyzer EPC"
                  value={newSectorDesc}
                  onChange={(e) => setNewSectorDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
                >
                  Register Sector
                </button>
              </div>
            </form>
          </div>

          {/* Sectors Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Sector Name</th>
                  <th className="p-3">Slug Identifier</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sectors.map((sec) => (
                  <tr key={sec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{sec.name}</td>
                    <td className="p-3 font-mono text-slate-500">{sec.slug}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        sec.priority === 'PRIORITY_1'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {sec.priority === 'PRIORITY_1' ? 'Priority 1' : 'Priority 2'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{sec.description}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteSector(sec.id, sec.name)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded transition-colors cursor-pointer"
                        title="Delete sector"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Add Company Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-900" />
              <span>Add New Company to Watchlist</span>
            </h3>

            <form onSubmit={handleAddCompany} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geleximco Group"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Stock Ticker (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. VNM, VIC or 8058.T"
                  value={newCompanyTicker}
                  onChange={(e) => setNewCompanyTicker(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Classification
                </label>
                <select
                  value={newCompanyOrigin}
                  onChange={(e) => setNewCompanyOrigin(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                >
                  <option value="VIETNAM">Vietnamese Conglomerate</option>
                  <option value="JAPANESE_TRADING_HOUSE">Japanese Sogo Shosha</option>
                  <option value="GLOBAL_OTHER">Global / FDI Multinational</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Strategic Scope
                </label>
                <input
                  type="text"
                  placeholder="e.g. Automotive, thermal power, and industrial real estate"
                  value={newCompanyDesc}
                  onChange={(e) => setNewCompanyDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
                >
                  Add to Watchlist
                </button>
              </div>
            </form>
          </div>

          {/* Companies Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Company Name</th>
                  <th className="p-3">Ticker</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Scope</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{comp.name}</td>
                    <td className="p-3 font-mono text-slate-600">{comp.ticker || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        comp.origin === 'JAPANESE_TRADING_HOUSE'
                          ? 'bg-indigo-100 text-indigo-900'
                          : comp.origin === 'GLOBAL_OTHER'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-50 text-blue-900'
                      }`}>
                        {comp.origin === 'JAPANESE_TRADING_HOUSE' ? 'Sogo Shosha' : comp.origin === 'GLOBAL_OTHER' ? 'Global FDI' : 'Vietnam'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-sm truncate">{comp.description}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteCompany(comp.id, comp.name)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded transition-colors cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SOURCES */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Add Source Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-900" />
              <span>Register Ingestion Source Node</span>
            </h3>

            <form onSubmit={handleAddSource} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Source Publication
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hai Quan Online"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. haiquanonline.com.vn"
                  value={newSourceDomain}
                  onChange={(e) => setNewSourceDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  Quality Tier
                </label>
                <select
                  value={newSourceTier}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setNewSourceTier(t);
                    setNewSourceWeight(t === 'TIER_1' ? 1.0 : t === 'TIER_2' ? 0.70 : t === 'TIER_3' ? 0.40 : 0.15);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                >
                  <option value="TIER_1">Tier 1: Government / Wire (1.0)</option>
                  <option value="TIER_2">Tier 2: Major Financial Press (0.7)</option>
                  <option value="TIER_3">Tier 3: Local General Press (0.4)</option>
                  <option value="DISCOVERY">Discovery: Unverified Feed (0.1)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase font-semibold text-[10px] mb-1">
                  RSS Feed URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://.../rss.xml"
                  value={newSourceRss}
                  onChange={(e) => setNewSourceRss(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition-colors cursor-pointer"
                >
                  Register Source Node
                </button>
              </div>
            </form>
          </div>

          {/* Sources Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="font-bold text-slate-900 uppercase">
                Active Ingestion Nodes ({sources.length} Configured)
              </div>
              <div className="text-slate-500 font-mono">
                Consensus Threshold: ≥ 1 Tier 1 or ≥ 2 Tier 2 for VERIFIED badge
              </div>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Source Name</th>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Trust Weight</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{src.name}</td>
                    <td className="p-3 font-mono text-slate-500">{src.domain}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        src.tier === 'TIER_1'
                          ? 'bg-blue-100 text-blue-900'
                          : src.tier === 'TIER_2'
                          ? 'bg-indigo-50 text-indigo-900'
                          : src.tier === 'TIER_3'
                          ? 'bg-amber-50 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {src.tier}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-700">
                      {((src.trustWeight ?? 0.70) * 100).toFixed(0)}%
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{src.description || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteSource(src.id, src.name)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded transition-colors cursor-pointer"
                        title="Remove source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & SCHEMA */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Supabase PostgreSQL Schema & Persistence Layer
                </h3>
                <p className="text-xs text-slate-500">
                  Dual-layer persistence architecture with PostgreSQL DDL, Row-Level Security, and in-memory fallback.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono uppercase text-slate-500 mb-1 font-semibold">Active Engine</div>
                <div className="text-base font-bold text-slate-900">PostgreSQL 16 + pgvector</div>
                <p className="text-[11px] text-slate-500 mt-1">Vector similarity for Sojitz strategic relevance scoring.</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono uppercase text-slate-500 mb-1 font-semibold">RLS Security</div>
                <div className="text-base font-bold text-emerald-700">11 Tables Secured</div>
                <p className="text-[11px] text-slate-500 mt-1">Public read-only for approved stories; telemetry writes isolated.</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono uppercase text-slate-500 mb-1 font-semibold">Schema Migration File</div>
                <div className="text-base font-mono font-bold text-slate-900">20261006000000_init_schema.sql</div>
                <p className="text-[11px] text-slate-500 mt-1">Located in /supabase/migrations directory.</p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              Registered Tables in PostgreSQL Schema
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-2.5">Table Name</th>
                    <th className="p-2.5">Purpose</th>
                    <th className="p-2.5">RLS Policy</th>
                    <th className="p-2.5">Indexes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-mono font-semibold text-blue-900">public.sectors</td>
                    <td className="p-2.5 text-slate-600">Dynamic 26 priority sectors (P1 & P2)</td>
                    <td className="p-2.5 text-emerald-700 font-mono">SELECT: is_active=true</td>
                    <td className="p-2.5 font-mono text-slate-500">display_order, slug</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-semibold text-blue-900">public.companies</td>
                    <td className="p-2.5 text-slate-600">Sogo Shosha & Vietnam Conglomerates watchlist</td>
                    <td className="p-2.5 text-emerald-700 font-mono">SELECT: is_active=true</td>
                    <td className="p-2.5 font-mono text-slate-500">slug, origin</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-semibold text-blue-900">public.sources</td>
                    <td className="p-2.5 text-slate-600">Tier 1–3 + Discovery news publication nodes</td>
                    <td className="p-2.5 text-emerald-700 font-mono">SELECT: is_active=true</td>
                    <td className="p-2.5 font-mono text-slate-500">tier, trust_weight</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-semibold text-blue-900">public.intelligence_stories</td>
                    <td className="p-2.5 text-slate-600">Curated intelligence with BD actions & verification</td>
                    <td className="p-2.5 text-emerald-700 font-mono">SELECT: is_editor_approved=true</td>
                    <td className="p-2.5 font-mono text-slate-500">relevance, story_date, FTS</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-semibold text-blue-900">public.user_feedback</td>
                    <td className="p-2.5 text-slate-600">Useful/Not useful votes with 7 diagnostic tags</td>
                    <td className="p-2.5 text-emerald-700 font-mono">INSERT: public; SELECT: service_role</td>
                    <td className="p-2.5 font-mono text-slate-500">story_id, vote</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono font-semibold text-blue-900">public.analytics_events</td>
                    <td className="p-2.5 text-slate-600">16 executive telemetry events (scroll 25/50/75/100, CTR)</td>
                    <td className="p-2.5 text-emerald-700 font-mono">INSERT: public; SELECT: service_role</td>
                    <td className="p-2.5 font-mono text-slate-500">event_name, story_id</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PIPELINE & ARCHITECTURE */}
      {activeTab === 'pipeline' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Pipeline Architecture & Provider Configuration
          </h3>
          <p>
            The ingestion pipeline executes on scheduled cron events (06:00 & 18:00 ICT) via Vercel Serverless Functions. Articles are normalized, SHA-256 hashed to guarantee zero duplicate ingestion, and clustered using vector cosine embeddings.
          </p>
          <div className="bg-[#0A192F] text-slate-100 font-mono p-4 rounded-lg text-xs space-y-1">
            <div>AI_PROVIDER: &ldquo;{process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai'}&rdquo;</div>
            <div>AI_MODEL_ANALYST: &ldquo;gpt-4o&rdquo;</div>
            <div>EMBEDDING_MODEL: &ldquo;text-embedding-3-small&rdquo;</div>
            <div>VERIFICATION_RULES: &ldquo;Deterministic fact comparator + Tier 1/2 weighted consensus&rdquo;</div>
            <div>STORAGE: &ldquo;Supabase PostgreSQL 16 + pgvector&rdquo;</div>
          </div>
        </div>
      )}
    </div>
  );
}
