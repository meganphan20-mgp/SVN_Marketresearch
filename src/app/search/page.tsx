import React from 'react';
import { getIntelligenceStories, getSectors, getCompanies } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { SearchClientView } from './search-client-view';

export const metadata = {
  title: 'Search Historical Intelligence | Sojitz Vietnam',
  description: 'Search across titles, summaries, companies, sectors, and Sojitz strategic relevance analyses.',
};

export default async function SearchPage() {
  const [stories, sectors, companies] = await Promise.all([
    getIntelligenceStories(),
    getSectors(),
    getCompanies(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchClientView
          allStories={stories}
          sectors={sectors}
          companies={companies}
        />
      </main>
    </div>
  );
}
