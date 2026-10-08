-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261007000000_enforce_source_first_integrity.sql
-- Phase 1 Schema Conformance & Source-First Integrity Enforcements
-- ==============================================================================

-- 1. Upgrade raw_articles table schema
ALTER TABLE public.raw_articles 
    ADD COLUMN IF NOT EXISTS http_status SMALLINT NOT NULL DEFAULT 200,
    ADD COLUMN IF NOT EXISTS final_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    ADD COLUMN IF NOT EXISTS fetch_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_article_page BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS sim_hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS fetch_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    ADD COLUMN IF NOT EXISTS publisher VARCHAR(150);

-- Populate initial values for existing rows
UPDATE public.raw_articles 
SET 
    final_url = url WHERE final_url = '';
UPDATE public.raw_articles 
SET 
    fetch_verified = true, 
    is_article_page = true 
WHERE raw_content IS NOT NULL AND length(raw_content) > 100;

-- 2. Upgrade intelligence_stories table schema
ALTER TABLE public.intelligence_stories
    ADD COLUMN IF NOT EXISTS source_grounded BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_publishable BOOLEAN NOT NULL DEFAULT false;

-- 3. Upgrade story_sources junction schema
ALTER TABLE public.story_sources
    ADD COLUMN IF NOT EXISTS final_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    ADD COLUMN IF NOT EXISTS url_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS event_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS claim_verified BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS content_alignment_score SMALLINT CHECK (content_alignment_score BETWEEN 0 AND 100);

UPDATE public.story_sources 
SET 
    final_url = article_url WHERE final_url = '';

-- 4. Indices for fast lookup on raw_articles
CREATE INDEX IF NOT EXISTS idx_raw_articles_source_id ON public.raw_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_raw_articles_fetched_at ON public.raw_articles(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_articles_content_hash ON public.raw_articles(content_hash);
