-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261007030000_phase2b_relevance_scoring.sql
-- Phase 2B Dedicated Potential Signals & Strategic Relevance Store
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.article_relevance_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_article_id UUID NOT NULL REFERENCES public.raw_articles(id) ON DELETE CASCADE,
    extraction_id UUID NOT NULL REFERENCES public.article_extractions(id) ON DELETE CASCADE,
    
    signal_detected BOOLEAN NOT NULL DEFAULT true,
    signal_type VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
    signal_strength VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    
    matched_divisions TEXT[] DEFAULT '{}',
    matched_assets TEXT[] DEFAULT '{}',
    matched_competitors TEXT[] DEFAULT '{}',
    matched_priorities TEXT[] DEFAULT '{}',
    
    relevance_score SMALLINT NOT NULL CHECK (relevance_score BETWEEN 1 AND 10),
    relevance_rationale TEXT NOT NULL,
    
    business_impact business_impact_type NOT NULL DEFAULT 'MARKET_INTELLIGENCE',
    urgency VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    strategic_status VARCHAR(20) NOT NULL DEFAULT 'WATCH',
    
    primary_sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    secondary_sector_ids UUID[] DEFAULT '{}',
    matched_companies JSONB DEFAULT '[]'::jsonb,
    
    is_high_priority BOOLEAN GENERATED ALWAYS AS (relevance_score >= 8) STORED,
    scoring_metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_article_relevance_scores_raw_article UNIQUE (raw_article_id)
);

CREATE INDEX IF NOT EXISTS idx_relevance_scores_score ON public.article_relevance_scores(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_relevance_scores_high_priority ON public.article_relevance_scores(is_high_priority);
CREATE INDEX IF NOT EXISTS idx_relevance_scores_impact ON public.article_relevance_scores(business_impact);
CREATE INDEX IF NOT EXISTS idx_relevance_scores_raw_article ON public.article_relevance_scores(raw_article_id);
CREATE INDEX IF NOT EXISTS idx_relevance_scores_extraction ON public.article_relevance_scores(extraction_id);
