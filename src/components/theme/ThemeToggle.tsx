'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('svn_theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('svn_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md bg-slate-800/60 border border-slate-700/60 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'light' ? 'Chuyển sang Tone Tối (Dark Mode)' : 'Chuyển sang Tone Sáng (Light Mode)'}
      aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white shadow-xs group"
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-3.5 h-3.5 text-blue-300 group-hover:text-blue-200 transition-transform group-hover:-rotate-12" />
          <span className="hidden sm:inline text-[11px] text-slate-300">Tone tối</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-300 group-hover:text-amber-200 transition-transform group-hover:rotate-45" />
          <span className="hidden sm:inline text-[11px] text-amber-200">Tone sáng</span>
        </>
      )}
    </button>
  );
}
