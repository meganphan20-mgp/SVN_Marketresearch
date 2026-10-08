import React from 'react';
import Link from 'next/link';
import { getSources } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { ShieldCheck, ArrowLeft, ExternalLink, Globe, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const metadata = {
  title: 'Source Registry & Trust Tiers | Sojitz Vietnam Market Intelligence',
  description: 'Verified source registry, tier classifications (Tier 1, Tier 2, Tier 3, Discovery), trust weighting, and anti-hallucination protocols.',
};

export default async function SourcesDirectoryPage() {
  const sources = await getSources();

  const tier1 = sources.filter(s => s.tier === 'TIER_1');
  const tier2 = sources.filter(s => s.tier === 'TIER_2');
  const tier3 = sources.filter(s => s.tier === 'TIER_3');
  const discovery = sources.filter(s => s.tier === 'DISCOVERY');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Executive Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Source Ingestion & Evidence Integrity Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Source Directory & Trust Tiers
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Strict tier hierarchy preventing misinformation. All intelligence claims require multi-source triangulation with zero fabricated URLs.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded font-semibold">
              {sources.length} Certified Ingestion Nodes
            </span>
          </div>
        </div>

        {/* Tier Methodology Explainer Box */}
        <div className="mb-8 bg-slate-900 text-white rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Multi-Source Verification & Tier Weighting Model</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
              <span className="font-bold text-blue-400 block mb-1">Tier 1: Weight 1.0</span>
              <p>Government gazettes, stock exchanges, corporate IR statements, and global wires (Reuters, Nikkei, Bloomberg, FT).</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
              <span className="font-bold text-slate-300 block mb-1">Tier 2: Weight 0.7</span>
              <p>Leading Vietnamese economic and investment media (VIR, VnEconomy, VnExpress, VietnamNet, The Investor).</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
              <span className="font-bold text-amber-400 block mb-1">Tier 3: Weight 0.4</span>
              <p>Specialist trade journals, industry portals (CafeF, Saigon Times) providing granular market chatter.</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
              <span className="font-bold text-purple-400 block mb-1">Discovery: Weight 0.1</span>
              <p>Early-signal detection (LinkedIn, corporate blogs). Triggers immediate crawler corroborate before publishing.</p>
            </div>
          </div>
        </div>

        {/* Tier 1 Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase">
              Tier 1: Official & Authoritative Primary Sources ({tier1.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier1.map((src) => (
              <div key={src.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      TIER 1 PRIMARY
                    </span>
                    <span className="text-emerald-700 font-bold">Weight: 1.0</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{src.name}</h3>
                  <div className="text-xs text-blue-700 font-mono mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{src.domain}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {src.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{src.isOfficialIr ? 'Official Gazette / IR' : 'Global Wire'}</span>
                  <span className="font-bold text-slate-700">{src.articleCount} Scanned Articles</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tier 2 Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-slate-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase">
              Tier 2: Premier Vietnamese Business & Economic Press ({tier2.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier2.map((src) => (
              <div key={src.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-slate-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      TIER 2 PRESS
                    </span>
                    <span className="text-slate-600 font-bold">Weight: 0.7</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{src.name}</h3>
                  <div className="text-xs text-blue-700 font-mono mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{src.domain}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {src.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>National Coverage</span>
                  <span className="font-bold text-slate-700">{src.articleCount} Scanned Articles</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tier 3 Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <h2 className="text-base font-bold text-slate-900 uppercase">
              Tier 3: Specialist & Financial Media ({tier3.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier3.map((src) => (
              <div key={src.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      TIER 3 SPECIALIST
                    </span>
                    <span className="text-amber-700 font-bold">Weight: 0.4</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{src.name}</h3>
                  <div className="text-xs text-blue-700 font-mono mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{src.domain}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {src.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Industry Specific</span>
                  <span className="font-bold text-slate-700">{src.articleCount} Scanned Articles</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discovery Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <h2 className="text-base font-bold text-slate-900 uppercase">
              Discovery Only Nodes ({discovery.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discovery.map((src) => (
              <div key={src.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    DISCOVERY SIGNAL
                  </span>
                  <span className="text-purple-700 font-bold">Weight: 0.1</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{src.name}</h3>
                <div className="text-xs text-blue-700 font-mono mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>{src.domain}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {src.description}
                </p>
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Cannot verify alone; triggers automatic corroboration workflow.</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
