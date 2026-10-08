import React from 'react';
import { getSectors, getCompanies, getSources } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { AdminConsole } from './admin-console';

export const metadata = {
  title: 'Admin Management Console | Sojitz Vietnam Market Intelligence',
  description: 'Manage dynamic sectors, watchlist companies, ingestion sources, and trigger intelligence synthesis without source code changes.',
};

export default async function AdminPage() {
  const [sectors, companies, sources, stories] = await Promise.all([
    getSectors(),
    getCompanies(),
    getSources(),
    import('@/lib/data/intelligence-store').then(m => m.getIntelligenceStories()),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminConsole
          initialSectors={sectors}
          initialCompanies={companies}
          initialSources={sources}
          initialStories={stories}
        />
      </main>
    </div>
  );
}
