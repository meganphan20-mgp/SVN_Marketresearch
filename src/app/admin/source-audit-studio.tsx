'use client';

import React, { useState } from 'react';
import { IntelligenceStory, StorySourceLink, LinkIntegrityStatus } from '@/types/intelligence';
import { 
  CheckCheck, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Check, 
  X, 
  Globe, 
  Filter,
  FileCheck,
  Building2,
  Trash2
} from 'lucide-react';

interface Props {
  initialStories: IntelligenceStory[];
  showNotification: (msg: string) => void;
}

export function SourceAuditStudio({ initialStories, showNotification }: Props) {
  const [stories, setStories] = useState<IntelligenceStory[]>(initialStories);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'NEEDS_AUDIT' | 'ISSUES'>('ALL');
  
  // Auditing state: { [sourceId]: boolean }
  const [verifyingSources, setVerifyingSources] = useState<Record<string, boolean>>({});
  // Cleaning state: { [storyId]: boolean }
  const [cleaningStory, setCleaningStory] = useState<Record<string, boolean>>({});
  const [isCleaningAll, setIsCleaningAll] = useState(false);
  // Section 12 Historical Database Audit state:
  const [isAuditingHistory, setIsAuditingHistory] = useState(false);
  const [historicalAuditStats, setHistoricalAuditStats] = useState<{
    inspectedStories: number;
    deletedStoriesCount: number;
    survivingStoriesCount: number;
    totalValidSourcesRetained: number;
    totalInvalidSourcesPurged: number;
    auditTimestamp: string;
  } | null>(null);
  // Step 10 Output inspection modal:
  const [cleanupModalData, setCleanupModalData] = useState<any | null>(null);

  // Editing state: { [sourceId]: string }
  const [editingUrl, setEditingUrl] = useState<Record<string, string>>({});
  // Editorial notes state: { [storyId]: string }
  const [editorialNotes, setEditorialNotes] = useState<Record<string, string>>({});
  // Expanded stories state: { [storyId]: boolean }
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>(() => {
    // Expand first 3 by default
    const init: Record<string, boolean> = {};
    initialStories.slice(0, 3).forEach(s => { init[s.id] = true; });
    return init;
  });

  // Filter stories
  const filteredStories = stories.filter(story => {
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || 
      story.title.toLowerCase().includes(q) || 
      story.sources.some(s => s.sourceName.toLowerCase().includes(q) || s.articleUrl.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (statusFilter === 'VERIFIED') {
      return story.sources.every(s => s.linkStatus === 'VERIFIED_MATCH' || s.editorReviewed);
    }
    if (statusFilter === 'NEEDS_AUDIT') {
      return story.sources.some(s => !s.linkStatus || s.linkStatus === 'PENDING_AUDIT');
    }
    if (statusFilter === 'ISSUES') {
      return story.sources.some(s => s.linkStatus === 'UNREACHABLE' || s.linkStatus === 'CONTENT_MISMATCH');
    }
    return true;
  });

  // Calculate statistics
  const totalSources = stories.reduce((acc, s) => acc + s.sources.length, 0);
  const verifiedSources = stories.reduce((acc, s) => acc + s.sources.filter(src => src.linkStatus === 'VERIFIED_MATCH' || src.editorReviewed).length, 0);
  const pendingSources = stories.reduce((acc, s) => acc + s.sources.filter(src => !src.linkStatus || src.linkStatus === 'PENDING_AUDIT').length, 0);
  const issueSources = stories.reduce((acc, s) => acc + s.sources.filter(src => src.linkStatus === 'UNREACHABLE' || src.linkStatus === 'CONTENT_MISMATCH').length, 0);

  // Run live verification on a single source link
  const handleVerifySource = async (story: IntelligenceStory, source: StorySourceLink) => {
    setVerifyingSources(prev => ({ ...prev, [source.id]: true }));

    try {
      const res = await fetch('/api/admin/verify-source-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: source.articleUrl,
          expectedTitle: source.articleTitle || story.title,
          expectedSummary: story.summary,
          expectedCompanies: story.companiesMentioned.map(c => c.name),
          expectedSector: story.primarySectorName,
          dealValueText: story.extractedFacts?.dealValueText,
          storyId: story.id,
          sourceId: source.id,
          autoUpdate: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.audit) {
        const audit = data.audit;
        // Update local state
        setStories(prevStories => prevStories.map(s => {
          if (s.id !== story.id) return s;
          return {
            ...s,
            sources: s.sources.map(src => {
              if (src.id !== source.id) return src;
              return {
                ...src,
                linkStatus: audit.linkStatus,
                httpStatus: audit.httpStatus,
                isContentMatched: audit.contentMatchScore >= 40,
                contentMatchScore: audit.contentMatchScore,
                matchedKeywords: audit.matchedKeywords,
                auditedAt: audit.auditedAt,
              };
            }),
          };
        }));

        showNotification(`Source link checked: ${audit.auditVerdict}`);
      } else {
        showNotification(`Check failed: ${data.error || 'Server error'}`);
      }
    } catch {
      showNotification('Verification request failed. Check network connection.');
    } finally {
      setVerifyingSources(prev => ({ ...prev, [source.id]: false }));
    }
  };

  // Run bulk verification for all sources in a story
  const handleVerifyAllInStory = async (story: IntelligenceStory) => {
    showNotification(`Auditing all ${story.sources.length} sources for "${story.title.slice(0, 40)}..."`);
    for (const src of story.sources) {
      await handleVerifySource(story, src);
    }
    showNotification(`Completed source audit for "${story.title.slice(0, 40)}..."`);
  };

  // STEP 10 — Run Source Integrity & Auto-Cleanup Agent on single story
  const handleAutoCleanStory = async (story: IntelligenceStory) => {
    setCleaningStory(prev => ({ ...prev, [story.id]: true }));
    showNotification(`Executing Source Integrity Auto-Cleanup on "${story.title.slice(0, 35)}..."`);

    try {
      const res = await fetch('/api/admin/clean-story-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id }),
      });

      const data = await res.json();
      if (res.ok && data.article_id) {
        setCleanupModalData(data);

        // Update local story state
        setStories(prevStories => prevStories.map(s => {
          if (s.id !== story.id) return s;
          const retainedCount = data.verified_source_count;
          const maxConf = retainedCount === 0 ? 0 : retainedCount === 1 ? 75 : retainedCount === 2 ? 95 : 100;
          return {
            ...s,
            articleStatus: data.article_status,
            verifiedSourceCount: retainedCount,
            confidenceScore: Math.min(s.confidenceScore, maxConf),
            removedSourcesLog: data.removed_sources,
            sources: s.sources
              .filter(src => data.sources.some((cs: any) => cs.publisher === src.sourceName))
              .map(src => {
                const match = data.sources.find((cs: any) => cs.publisher === src.sourceName);
                return {
                  ...src,
                  articleUrl: match?.access_url || src.articleUrl,
                  accessUrl: match?.access_url,
                  canonicalUrl: match?.canonical_url,
                  articleTitle: match?.article_title || src.articleTitle,
                  linkStatus: 'VERIFIED',
                  httpStatus: match?.http_status || 200,
                  contentMatchScore: match?.content_alignment_score || 85,
                  isContentMatched: true,
                  auditedAt: new Date().toISOString(),
                };
              }),
          };
        }));

        showNotification(`Source integrity auto-cleanup complete: ${data.verified_source_count} verified retained, ${data.removed_sources?.length || 0} purged.`);
      } else {
        showNotification(`Auto-cleanup error: ${data.error || 'Server error'}`);
      }
    } catch {
      showNotification('Failed to execute auto-cleanup. Check network connection.');
    } finally {
      setCleaningStory(prev => ({ ...prev, [story.id]: false }));
    }
  };

  // Run Auto-Cleanup across all stories
  const handleAutoCleanAll = async () => {
    setIsCleaningAll(true);
    showNotification('Running Source Integrity & Auto-Cleanup across all intelligence stories...');

    try {
      const res = await fetch('/api/admin/clean-story-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });

      const data = await res.json();
      if (res.ok && data.results) {
        showNotification(`Auto-cleanup executed across ${data.count} stories!`);
        // Refresh stories from store
        for (const story of stories) {
          const matchedResult = data.results.find((r: any) => r.article_id === story.id);
          if (matchedResult) {
            setStories(prevStories => prevStories.map(s => {
              if (s.id !== story.id) return s;
              const retainedCount = matchedResult.verified_source_count;
              const maxConf = retainedCount === 0 ? 0 : retainedCount === 1 ? 75 : retainedCount === 2 ? 95 : 100;
              return {
                ...s,
                articleStatus: matchedResult.article_status,
                verifiedSourceCount: retainedCount,
                confidenceScore: Math.min(s.confidenceScore, maxConf),
                removedSourcesLog: matchedResult.removed_sources,
                sources: s.sources.filter(src => matchedResult.sources.some((cs: any) => cs.publisher === src.sourceName)),
              };
            }));
          }
        }
      } else {
        showNotification(`Error running bulk cleanup: ${data.error}`);
      }
    } catch {
      showNotification('Failed to run bulk cleanup.');
    } finally {
      setIsCleaningAll(false);
    }
  };

  // Section 12: Run One-Time Full Historical Database Audit
  const handleHistoricalDatabaseAudit = async () => {
    if (!confirm('Execute Section 12 Historical Database Audit?\n\nRules:\n1. Every source URL is tested via live HTTP request.\n2. Any source failing HTTP 200 or article extraction is purged immediately.\n3. If valid_source_count == 0, THE ENTIRE INTELLIGENCE ITEM IS PERMANENTLY DELETED.\n\nContinue?')) {
      return;
    }

    setIsAuditingHistory(true);
    showNotification('Running Section 12 Historical Database Audit (Live HTTP verification across entire database)...');

    try {
      const res = await fetch('/api/admin/historical-cleanup', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setHistoricalAuditStats({
          inspectedStories: data.inspectedStories,
          deletedStoriesCount: data.deletedStoriesCount,
          survivingStoriesCount: data.survivingStoriesCount,
          totalValidSourcesRetained: data.totalValidSourcesRetained,
          totalInvalidSourcesPurged: data.totalInvalidSourcesPurged,
          auditTimestamp: data.auditTimestamp,
        });

        if (data.survivingStories) {
          setStories(data.survivingStories);
        }

        showNotification(
          `Historical Audit Complete: Inspected ${data.inspectedStories} items. Purged ${data.deletedStoriesCount} unverified stories. ${data.survivingStoriesCount} verified stories retained.`
        );
      } else {
        showNotification(`Historical audit failed: ${data.error || 'Server error'}`);
      }
    } catch {
      showNotification('Failed to execute historical database audit.');
    } finally {
      setIsAuditingHistory(false);
    }
  };

  // Save updated URL
  const handleSaveUrl = async (storyId: string, sourceId: string) => {
    const newUrl = editingUrl[sourceId];
    if (!newUrl) return;

    try {
      const res = await fetch('/api/admin/audit-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_link',
          storyId,
          sourceId,
          url: newUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStories(prevStories => prevStories.map(s => {
          if (s.id !== storyId) return s;
          return {
            ...s,
            sources: s.sources.map(src => {
              if (src.id !== sourceId) return src;
              return {
                ...src,
                articleUrl: newUrl,
                linkStatus: 'VERIFIED_MATCH',
                editorReviewed: true,
                auditedAt: new Date().toISOString(),
              };
            }),
          };
        }));
        setEditingUrl(prev => {
          const next = { ...prev };
          delete next[sourceId];
          return next;
        });
        showNotification('Target URL updated and approved.');
      } else {
        showNotification(`Error: ${data.error}`);
      }
    } catch {
      showNotification('Failed to update URL.');
    }
  };

  // Approve single source
  const handleApproveSource = async (storyId: string, sourceId: string) => {
    try {
      const res = await fetch('/api/admin/audit-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_source',
          storyId,
          sourceId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStories(prevStories => prevStories.map(s => {
          if (s.id !== storyId) return s;
          return {
            ...s,
            sources: s.sources.map(src => {
              if (src.id !== sourceId) return src;
              return {
                ...src,
                editorReviewed: true,
                linkStatus: 'VERIFIED_MATCH',
                auditedAt: new Date().toISOString(),
              };
            }),
          };
        }));
        showNotification('Source link approved by editor.');
      }
    } catch {
      showNotification('Failed to record source approval.');
    }
  };

  // Approve entire story
  const handleApproveStory = async (story: IntelligenceStory) => {
    const notes = editorialNotes[story.id] || 'Editorial review complete. All cited sources verified for content alignment.';

    try {
      const res = await fetch('/api/admin/audit-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_story',
          storyId: story.id,
          isEditorApproved: true,
          editorNotes: notes,
          sourceAuditStatus: 'AUDITED',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStories(prevStories => prevStories.map(s => {
          if (s.id !== story.id) return s;
          return {
            ...s,
            isEditorApproved: true,
            editorNotes: notes,
            sourceAuditStatus: 'AUDITED',
            sources: s.sources.map(src => ({
              ...src,
              editorReviewed: true,
              linkStatus: src.linkStatus || 'VERIFIED_MATCH',
            })),
          };
        }));
        showNotification(`Story "${story.title.slice(0, 40)}..." approved for publication.`);
      }
    } catch {
      showNotification('Failed to save story approval.');
    }
  };

  const getStatusBadge = (status?: LinkIntegrityStatus, isReviewed?: boolean) => {
    if (isReviewed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Editor Approved</span>
        </span>
      );
    }
    switch (status) {
      case 'VERIFIED':
      case 'VERIFIED_REDIRECT':
      case 'VERIFIED_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Verified Match</span>
          </span>
        );
      case 'SOURCE_NOT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <X className="w-3 h-3 text-rose-600" />
            <span>SOURCE_NOT_VERIFIED</span>
          </span>
        );
      case 'PARTIAL_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Partial Match</span>
          </span>
        );
      case 'CONTENT_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Content Discrepancy</span>
          </span>
        );
      case 'UNREACHABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <X className="w-3 h-3 text-rose-600" />
            <span>Unreachable URL</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span>Pending Audit</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-900 uppercase mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Source Cross-Check & Link Integrity Auditor</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Source Cross-Check & Content Alignment Studio
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Inspect verified media references, validate that destination articles are reachable (HTTP 200) and actually cover the reported transaction details, correct outdated links, and certify stories for executive dissemination.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 min-w-[90px]">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Links</div>
                <div className="text-base font-bold text-slate-900 font-mono">{totalSources}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-2 min-w-[90px]">
                <div className="text-[10px] text-emerald-700 uppercase font-semibold">Verified</div>
                <div className="text-base font-bold text-emerald-700 font-mono">{verifiedSources}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 min-w-[90px]">
                <div className="text-[10px] text-amber-700 uppercase font-semibold">Pending</div>
                <div className="text-base font-bold text-amber-800 font-mono">{pendingSources}</div>
              </div>
              {issueSources > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded px-3 py-2 min-w-[90px]">
                  <div className="text-[10px] text-rose-700 uppercase font-semibold">Issues</div>
                  <div className="text-base font-bold text-rose-700 font-mono">{issueSources}</div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={handleAutoCleanAll}
                disabled={isCleaningAll || isAuditingHistory}
                className="px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Executes Step 10 Source Integrity & Auto-Cleanup on stories"
              >
                <ShieldCheck className={`w-4 h-4 ${isCleaningAll ? 'animate-spin' : ''}`} />
                <span>{isCleaningAll ? 'Cleaning All Stories...' : 'Auto-Clean Stories'}</span>
              </button>

              <button
                onClick={handleHistoricalDatabaseAudit}
                disabled={isCleaningAll || isAuditingHistory}
                className="px-3.5 py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="SECTION 12: Run full database audit with live HTTP. Purges all 0-source stories immediately."
              >
                <Trash2 className={`w-4 h-4 ${isAuditingHistory ? 'animate-spin' : ''}`} />
                <span>{isAuditingHistory ? 'Auditing Database (HTTP)...' : 'Section 12: Historical DB Audit'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 12 Historical Database Audit Results Banner */}
        {historicalAuditStats && (
          <div className="mt-4 p-4 bg-slate-900 text-white rounded-lg border border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Section 12 Historical Database Audit Report</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(historicalAuditStats.auditTimestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-800/80 p-2 rounded">
                <div className="text-[10px] text-slate-400">Inspected</div>
                <div className="text-base font-bold text-white">{historicalAuditStats.inspectedStories}</div>
              </div>
              <div className="bg-rose-950/60 border border-rose-800/40 p-2 rounded">
                <div className="text-[10px] text-rose-300">Stories Deleted</div>
                <div className="text-base font-bold text-rose-400">{historicalAuditStats.deletedStoriesCount}</div>
              </div>
              <div className="bg-emerald-950/60 border border-emerald-800/40 p-2 rounded">
                <div className="text-[10px] text-emerald-300">Stories Survived</div>
                <div className="text-base font-bold text-emerald-400">{historicalAuditStats.survivingStoriesCount}</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded">
                <div className="text-[10px] text-emerald-400">Valid Links Kept</div>
                <div className="text-base font-bold text-emerald-300">{historicalAuditStats.totalValidSourcesRetained}</div>
              </div>
              <div className="bg-slate-800/80 p-2 rounded">
                <div className="text-[10px] text-rose-400">Invalid Links Purged</div>
                <div className="text-base font-bold text-rose-300">{historicalAuditStats.totalInvalidSourcesPurged}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search story, source, or domain..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-blue-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Filter:</span>
            <div className="flex gap-1 text-xs">
              {(['ALL', 'VERIFIED', 'NEEDS_AUDIT', 'ISSUES'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-xs font-semibold ${
                    statusFilter === tab
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab === 'ALL' ? 'All Stories' : tab === 'VERIFIED' ? 'Verified' : tab === 'NEEDS_AUDIT' ? 'Pending Audit' : 'Issues'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stories Audit List */}
      <div className="space-y-4">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No intelligence stories matched the current filter.
          </div>
        ) : (
          filteredStories.map(story => {
            const isExpanded = expandedStories[story.id] !== false;
            const hasIssues = story.sources.some(s => s.linkStatus === 'UNREACHABLE' || s.linkStatus === 'CONTENT_MISMATCH');
            const isFullyVerified = story.sources.every(s => s.linkStatus === 'VERIFIED_MATCH' || s.editorReviewed);

            return (
              <div 
                key={story.id} 
                className={`bg-white rounded-xl border transition-all shadow-2xs ${
                  story.isEditorApproved
                    ? 'border-emerald-200'
                    : hasIssues
                    ? 'border-rose-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Story Header Summary */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 rounded-t-xl border-b border-slate-100">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                        {story.primarySectorName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{story.publicationDate}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-mono text-slate-500">
                        Confidence Score: <strong className="text-slate-800">{Math.round(story.confidenceScore > 10 ? story.confidenceScore : story.confidenceScore * 10)}/100</strong>
                      </span>
                      {story.articleStatus === 'MULTI_SOURCE_VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Multi-Source Verified ({story.sources.length})
                        </span>
                      ) : story.articleStatus === 'SINGLE_SOURCE_VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-300">
                          Single-Source Verified
                        </span>
                      ) : story.articleStatus === 'NO_VERIFIED_SOURCE' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                          No Verified Source (Unpublished)
                        </span>
                      ) : null}
                      {story.isEditorApproved ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Published & Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Editorial Sign-off
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {story.title}
                    </h3>

                    {/* Entities involved */}
                    {story.companiesMentioned.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold">Entities:</span>
                        <span>{story.companiesMentioned.map(c => c.name).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      onClick={() => handleAutoCleanStory(story)}
                      disabled={cleaningStory[story.id]}
                      className="px-3 py-1.5 bg-emerald-850 hover:bg-emerald-800 bg-emerald-800 text-white text-xs font-semibold rounded border border-emerald-800 shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Run Source Integrity & Auto-Cleanup Agent (Step 10 schema)"
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${cleaningStory[story.id] ? 'animate-spin' : ''}`} />
                      <span>{cleaningStory[story.id] ? 'Cleaning...' : 'Auto-Cleanup'}</span>
                    </button>

                    <button
                      onClick={() => handleVerifyAllInStory(story)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded border border-blue-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
                      <span>Audit All</span>
                    </button>

                    <button
                      onClick={() => setExpandedStories(prev => ({ ...prev, [story.id]: !isExpanded }))}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200 transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'Collapse' : `View Sources (${story.sources.length})`}
                    </button>
                  </div>
                </div>

                {/* Sources Verification Table (Expanded) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Multi-Source Cross-Check Evidence ({story.sources.length} sources)</span>
                      <span className="text-[11px] font-normal text-slate-400 font-mono">Strict Anti-Hallucination Policy</span>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                      {story.sources.map(src => {
                        const isVerifying = verifyingSources[src.id];
                        const isEditing = editingUrl[src.id] !== undefined;

                        return (
                          <div key={src.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    src.sourceTier === 'TIER_1' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                    src.sourceTier === 'TIER_2' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                                    'bg-slate-100 text-slate-800 border border-slate-300'
                                  }`}>
                                    {src.sourceTier.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900">{src.sourceName}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    Published: {src.publishedAt?.slice(0, 10)}
                                  </span>
                                  {getStatusBadge(src.linkStatus, src.editorReviewed)}
                                </div>

                                <div className="text-xs font-semibold text-slate-800">
                                  {src.articleTitle}
                                </div>

                                {/* URL Display or Inline Editor */}
                                {isEditing ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      type="text"
                                      value={editingUrl[src.id]}
                                      onChange={e => setEditingUrl(prev => ({ ...prev, [src.id]: e.target.value }))}
                                      placeholder="https://..."
                                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-blue-600 rounded font-mono"
                                    />
                                    <button
                                      onClick={() => handleSaveUrl(story.id, src.id)}
                                      className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-600 cursor-pointer flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" /> Save
                                    </button>
                                    <button
                                      onClick={() => setEditingUrl(prev => {
                                        const next = { ...prev };
                                        delete next[src.id];
                                        return next;
                                      })}
                                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <span className="text-slate-400 font-mono text-[11px]">Destination:</span>
                                    <a
                                      href={src.articleUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-900 hover:text-blue-700 font-mono text-[11px] hover:underline flex items-center gap-1 break-all"
                                    >
                                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>{src.articleUrl}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                    </a>
                                    <button
                                      onClick={() => setEditingUrl(prev => ({ ...prev, [src.id]: src.articleUrl }))}
                                      className="text-[11px] text-slate-500 hover:text-blue-900 underline flex items-center gap-1 ml-2 cursor-pointer"
                                    >
                                      <Edit3 className="w-2.5 h-2.5" /> Edit Link
                                    </button>
                                  </div>
                                )}

                                {/* Audit Results Details */}
                                {src.matchedKeywords && src.matchedKeywords.length > 0 && (
                                  <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-100 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>
                                      <strong>Content Match Confirmed:</strong> Mentions {src.matchedKeywords.join(', ')} ({src.contentMatchScore || 85}% alignment score)
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Source Actions */}
                              <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                                <button
                                  onClick={() => handleVerifySource(story, src)}
                                  disabled={isVerifying}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-slate-200 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                                  <span>{isVerifying ? 'Checking...' : 'Check Content'}</span>
                                </button>

                                <button
                                  onClick={() => handleApproveSource(story.id, src.id)}
                                  disabled={src.editorReviewed}
                                  className={`px-2.5 py-1.5 text-xs font-semibold rounded border transition-colors inline-flex items-center gap-1 ${
                                    src.editorReviewed
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 cursor-pointer'
                                  }`}
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{src.editorReviewed ? 'Approved' : 'Approve Link'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 5 Internal Audit Log (Purged Sources) */}
                    {story.removedSourcesLog && story.removedSourcesLog.length > 0 && (
                      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Internal Audit Log — Purged Unverified Sources ({story.removedSourcesLog.length})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mb-2">
                          In accordance with the Absolute Source Integrity Policy, broken or unreachable sources are permanently removed from the published article dataset and never exposed in the public UI.
                        </div>
                        <ul className="space-y-1.5 font-mono text-[11px]">
                          {story.removedSourcesLog.map((log: any, idx: number) => (
                            <li key={idx} className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                              <span><strong className="text-slate-900">{log.publisher}:</strong> {log.reason}</span>
                              <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Purged from Story</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Editorial Sign-off Box */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex-1 w-full">
                        <label className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                          Editorial Cross-Check Notes & Certification
                        </label>
                        <input
                          type="text"
                          value={editorialNotes[story.id] ?? (story.editorNotes || '')}
                          onChange={e => setEditorialNotes(prev => ({ ...prev, [story.id]: e.target.value }))}
                          placeholder="e.g. Cross-checked with VIR & MOIT gazette; all numerical values confirmed."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-blue-900"
                        />
                      </div>

                      <div className="shrink-0 self-end sm:self-center pt-2 sm:pt-4">
                        <button
                          onClick={() => handleApproveStory(story)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>Sign-Off & Approve Story</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* STEP 10 — OUTPUT INSPECTION MODAL */}
      {cleanupModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Step 10 — Source Integrity & Auto-Cleanup Output</h3>
              </div>
              <button
                onClick={() => setCleanupModalData(null)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Publication Status</span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">{cleanupModalData.article_status}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Verified Sources Kept</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{cleanupModalData.verified_source_count}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Purged / Removed</span>
                  <span className="text-base font-bold text-rose-700 font-mono">{cleanupModalData.removed_sources?.length || 0}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Standard Step 10 JSON Contract:
                </span>
                <pre className="p-3.5 bg-slate-950 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
                  {JSON.stringify(cleanupModalData, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setCleanupModalData(null)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold cursor-pointer"
              >
                Close Output Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
