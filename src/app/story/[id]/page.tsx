import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStoryById } from '@/lib/data/intelligence-store';
import { Header } from '@/components/layout/Header';
import { StoryDetailClientView } from '@/components/story/StoryDetailClientView';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStoryById(id);
  if (!story) return { title: 'Story Not Found | Sojitz Vietnam Market Intelligence' };
  return {
    title: `${story.title} | Sojitz Vietnam Market Intelligence`,
    description: story.summary,
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intelligence Dashboard</span>
          </Link>

          <span className="text-xs font-mono text-slate-400">
            Dossier ID: {story.id}
          </span>
        </div>

        {/* Story Detail View with Tracking & BD Actions */}
        <StoryDetailClientView story={story} />
      </main>
    </div>
  );
}
