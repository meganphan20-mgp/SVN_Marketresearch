-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261007020000_phase2a_article_extractions.sql
-- Phase 2A Dedicated Fact & Event Extractions Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.article_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_article_id UUID NOT NULL REFERENCES public.raw_articles(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    publisher VARCHAR(150),
    published_at TIMESTAMPTZ,
    
    meaningful_event_detected BOOLEAN NOT NULL DEFAULT true,
    primary_event_type VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    secondary_event_types TEXT[] DEFAULT '{}',
    
    event_date DATE,
    event_status VARCHAR(30) NOT NULL DEFAULT 'UNKNOWN',
    
    sectors TEXT[] DEFAULT '{}',
    sub_sectors TEXT[] DEFAULT '{}',
    geographies TEXT[] DEFAULT '{}',
    
    entities JSONB DEFAULT '[]'::jsonb,
    numeric_facts JSONB DEFAULT '[]'::jsonb,
    verified_facts JSONB DEFAULT '[]'::jsonb,
    explicit_company_statements JSONB DEFAULT '[]'::jsonb,
    source_attributed_claims JSONB DEFAULT '[]'::jsonb,
    uncertainties JSONB DEFAULT '[]'::jsonb,
    
    extraction_quality_score SMALLINT CHECK (extraction_quality_score BETWEEN 0 AND 100),
    extraction_metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_article_extractions_raw_article UNIQUE (raw_article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_extractions_event_type ON public.article_extractions(primary_event_type);
CREATE INDEX IF NOT EXISTS idx_article_extractions_status ON public.article_extractions(event_status);
CREATE INDEX IF NOT EXISTS idx_article_extractions_quality ON public.article_extractions(extraction_quality_score);
CREATE INDEX IF NOT EXISTS idx_article_extractions_raw_article ON public.article_extractions(raw_article_id);
