-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261007040000_phase3_1_temporal_gating.sql
-- Phase 3.1 Strict Publication-Date Gating & Temporal Deduplication
-- ==============================================================================

-- 1. Extend intelligence_stories with strict calendar-date fields and deduplication semantics
ALTER TABLE public.intelligence_stories 
  ADD COLUMN IF NOT EXISTS source_publication_date_local DATE,
  ADD COLUMN IF NOT EXISTS daily_brief_date DATE,
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS event_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS material_update BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS material_update_rationale TEXT;

-- Sync existing event_date with story_date if present
UPDATE public.intelligence_stories 
SET event_date = story_date 
WHERE event_date IS NULL AND story_date IS NOT NULL;

-- 2. Extend story_sources with local publication date in Asia/Ho_Chi_Minh
ALTER TABLE public.story_sources
  ADD COLUMN IF NOT EXISTS source_publication_date_local DATE;

-- Populate existing story_sources.source_publication_date_local from published_at in Asia/Ho_Chi_Minh
UPDATE public.story_sources
SET source_publication_date_local = DATE(published_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
WHERE source_publication_date_local IS NULL AND published_at IS NOT NULL;

-- Populate existing intelligence_stories dates from their primary sources
UPDATE public.intelligence_stories s
SET 
  source_publication_date_local = ss.source_publication_date_local,
  daily_brief_date = ss.source_publication_date_local
FROM public.story_sources ss
WHERE ss.story_id = s.id AND ss.is_primary_claim_source = true
  AND s.source_publication_date_local IS NULL;

-- Fallback for any story without primary source yet
UPDATE public.intelligence_stories
SET 
  source_publication_date_local = publication_date,
  daily_brief_date = publication_date
WHERE source_publication_date_local IS NULL;

-- 3. Extend raw_articles with local publication date
ALTER TABLE public.raw_articles
  ADD COLUMN IF NOT EXISTS source_publication_date_local DATE,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT now();

UPDATE public.raw_articles
SET source_publication_date_local = DATE(published_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
WHERE source_publication_date_local IS NULL AND published_at IS NOT NULL;

-- 4. Create Indexes for High-Performance Calendar Gating
CREATE INDEX IF NOT EXISTS idx_intelligence_stories_daily_date 
  ON public.intelligence_stories(daily_brief_date DESC);

CREATE INDEX IF NOT EXISTS idx_intelligence_stories_pub_date_local 
  ON public.intelligence_stories(source_publication_date_local DESC);

CREATE INDEX IF NOT EXISTS idx_intelligence_stories_event_fingerprint 
  ON public.intelligence_stories(event_fingerprint);

CREATE INDEX IF NOT EXISTS idx_story_sources_pub_date_local 
  ON public.story_sources(source_publication_date_local DESC);

CREATE INDEX IF NOT EXISTS idx_raw_articles_pub_date_local 
  ON public.raw_articles(source_publication_date_local DESC);
