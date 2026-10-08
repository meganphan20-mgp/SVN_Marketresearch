'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShieldCheck, Menu, X, Globe, FileText, Settings } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Today', href: '/today' },
    { label: 'This Week', href: '/week' },
    { label: 'M&A', href: '/ma' },
    { label: 'Japan Companies', href: '/japan' },
    { label: 'Vietnam Companies', href: '/vietnam-companies' },
    { label: 'Sectors', href: '/sectors' },
    { label: 'Sources', href: '/sources' },
    { label: 'Weekly Report', href: '/weekly' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A192F] text-white border-b border-slate-800 shadow-md">
      {/* Top Corporate Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-inner group-hover:bg-blue-500 transition-colors">
                SVN
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-blue-300 font-semibold leading-tight">
                  SOJITZ VIETNAM
                </span>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  MARKET INTELLIGENCE
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded ml-3">
              <ShieldCheck className="w-3 h-3" />
              VERIFIED C-SUITE FEED
            </span>
          </div>

          {/* Quick Search & Tools */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded text-xs border border-slate-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search intelligence...</span>
              <kbd className="bg-slate-800 text-[10px] text-slate-400 px-1 rounded font-mono border border-slate-700">⌘K</kbd>
            </Link>

            <Link
              href="/weekly"
              className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Weekly Briefing</span>
            </Link>

            <Link
              href="/admin/analytics"
              title="Executive Telemetry & Reader Analytics"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <span className="text-xs font-mono font-bold text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-800/80 bg-indigo-950/50">ANALYTICS</span>
            </Link>

            <Link
              href="/admin"
              title="Admin & Taxonomy Management"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/search"
              className="p-2 text-slate-300 hover:text-white rounded"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Sub-Navigation Bar */}
      <div className="bg-[#0D213F] border-t border-slate-800/80 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 overflow-x-auto text-xs font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D213F] border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
            <Link
              href="/weekly/2026-w40"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-blue-400 px-3 py-1.5"
            >
              Weekly Report (W40)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
