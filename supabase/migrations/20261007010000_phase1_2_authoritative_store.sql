-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261007010000_phase1_2_authoritative_store.sql
-- Phase 1.2 Production Data Readiness & Freshness Classification
-- ==============================================================================

ALTER TABLE public.raw_articles
    ALTER COLUMN published_at DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS original_url TEXT,
    ADD COLUMN IF NOT EXISTS validation_metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS raw_content_bytes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS raw_content_truncated BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS date_extraction_source VARCHAR(30) DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS article_age_hours NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS freshness_bucket VARCHAR(30) DEFAULT 'RECENT';

ALTER TABLE public.raw_articles ALTER COLUMN source_id DROP NOT NULL;
ALTER TABLE public.raw_articles ADD COLUMN IF NOT EXISTS source_code VARCHAR(100);

-- Indices for fast production querying by freshness and verified state
CREATE INDEX IF NOT EXISTS idx_raw_articles_freshness ON public.raw_articles(freshness_bucket);
CREATE INDEX IF NOT EXISTS idx_raw_articles_age ON public.raw_articles(article_age_hours);
CREATE INDEX IF NOT EXISTS idx_raw_articles_verified_article ON public.raw_articles(fetch_verified, is_article_page, freshness_bucket);
