-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261006000000_init_schema.sql
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
DO $$ BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not installed or requires superuser; continuing...';
END $$;

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE source_tier AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'DISCOVERY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM (
        'VERIFIED', 
        'PARTIALLY_VERIFIED', 
        'SINGLE_SOURCE', 
        'CONFLICTING', 
        'UNVERIFIED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE business_impact_type AS ENUM (
        'OPPORTUNITY', 
        'PARTNERSHIP', 
        'MA_INVESTMENT', 
        'COMPETITOR_MOVEMENT', 
        'RISK', 
        'MARKET_INTELLIGENCE'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE company_origin AS ENUM (
        'VIETNAM', 
        'JAPANESE_TRADING_HOUSE', 
        'GLOBAL_OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sector_priority AS ENUM (
        'PRIORITY_1', 
        'PRIORITY_2', 
        'MONITORING'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE feedback_vote AS ENUM (
        'USEFUL', 
        'NOT_USEFUL'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Dynamic Sectors Table (Admin can add/remove without code changes)
CREATE TABLE IF NOT EXISTS public.sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    priority sector_priority NOT NULL DEFAULT 'PRIORITY_1',
    description TEXT,
    keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Dynamic Company Watchlist Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    ticker VARCHAR(20),
    slug VARCHAR(150) NOT NULL UNIQUE,
    origin company_origin NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    industry_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    description TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Ingestion Source Registry (Tier 1/2/3 and Discovery)
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    tier source_tier NOT NULL DEFAULT 'TIER_2',
    trust_weight DECIMAL(3, 2) NOT NULL DEFAULT 0.70 CHECK (trust_weight BETWEEN 0.00 AND 1.00),
    description TEXT,
    rss_url TEXT,
    scrape_config JSONB DEFAULT '{}',
    is_official_ir BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Raw Ingested Articles Table (Audit trail & deduplication)
CREATE TABLE IF NOT EXISTS public.raw_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    author VARCHAR(255),
    published_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw_content TEXT NOT NULL,
    cleaned_content TEXT NOT NULL,
    content_hash CHAR(64) NOT NULL,
    cluster_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Intelligence Stories Table (Primary Curated Intelligence Feed)
CREATE TABLE IF NOT EXISTS public.intelligence_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    publication_date DATE NOT NULL,
    story_date DATE NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Vietnam',
    category VARCHAR(100) NOT NULL,
    primary_sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    secondary_sectors UUID[] DEFAULT '{}',
    
    -- AI Generated Executive Analysis & Strategic Relevance
    summary TEXT NOT NULL,
    why_it_matters_to_sojitz TEXT NOT NULL,
    suggested_bd_action TEXT,
    business_impact business_impact_type NOT NULL,
    relevance_score SMALLINT NOT NULL CHECK (relevance_score BETWEEN 1 AND 10),
    
    -- Source Verification Details
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    confidence_score DECIMAL(5, 2) NOT NULL CHECK (confidence_score BETWEEN 0.00 AND 100.00),
    verification_rationale TEXT NOT NULL,
    extracted_facts JSONB NOT NULL DEFAULT '{}',
    detected_conflicts JSONB NOT NULL DEFAULT '[]',
    collection_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Audit & Admin
    ai_model_used VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
    ai_analysis_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_editor_approved BOOLEAN NOT NULL DEFAULT true,
    is_high_priority BOOLEAN GENERATED ALWAYS AS (relevance_score >= 8) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Story Sources Junction Table (Multi-source evidence links)
CREATE TABLE IF NOT EXISTS public.story_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.intelligence_stories(id) ON DELETE CASCADE,
    raw_article_id UUID REFERENCES public.raw_articles(id) ON DELETE SET NULL,
    source_name VARCHAR(150) NOT NULL,
    source_tier source_tier NOT NULL,
    article_title TEXT NOT NULL,
    article_url TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    is_primary_claim_source BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Story Companies Junction Table
CREATE TABLE IF NOT EXISTS public.story_companies (
    story_id UUID NOT NULL REFERENCES public.intelligence_stories(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'SUBJECT',
    PRIMARY KEY (story_id, company_id)
);

-- 10. Weekly Market Intelligence Reports (12-Section Executive Dossier)
CREATE TABLE IF NOT EXISTS public.weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year SMALLINT NOT NULL,
    week_number SMALLINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    executive_summary TEXT NOT NULL,
    top_developments JSONB NOT NULL DEFAULT '[]',
    top_opportunities JSONB NOT NULL DEFAULT '[]',
    macro_policy TEXT NOT NULL,
    ma_investment TEXT NOT NULL,
    japanese_companies TEXT NOT NULL,
    trading_houses TEXT NOT NULL,
    vietnam_corporate_watch TEXT NOT NULL,
    sector_intelligence JSONB NOT NULL DEFAULT '{}',
    risks_analysis TEXT NOT NULL,
    sojitz_watch_list TEXT NOT NULL,
    suggested_bd_actions JSONB NOT NULL DEFAULT '[]',
    curated_story_ids UUID[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(year, week_number)
);

-- 11. User Feedback Table (Behavioral Feedback Loop)
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.intelligence_stories(id) ON DELETE CASCADE,
    vote feedback_vote NOT NULL,
    reason VARCHAR(100),
    comment TEXT,
    anonymous_session_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Behavioral Analytics Telemetry Events (16 Tracked Action Types)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(60) NOT NULL,
    story_id UUID REFERENCES public.intelligence_stories(id) ON DELETE SET NULL,
    anonymous_session_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Knowledge Bank Entities (Sojitz Internal Strategy & Business Units)
CREATE TABLE IF NOT EXISTS public.knowledge_bank_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(60) NOT NULL, -- 'BUSINESS_UNIT', 'INVESTMENT_THEME', 'PARTNER', 'COMPETITOR'
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority_keywords TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Indexes for Low-Latency Querying & Faceting
CREATE INDEX IF NOT EXISTS idx_stories_story_date ON public.intelligence_stories(story_date DESC);
CREATE INDEX IF NOT EXISTS idx_stories_relevance ON public.intelligence_stories(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.intelligence_stories(verification_status);
CREATE INDEX IF NOT EXISTS idx_stories_impact ON public.intelligence_stories(business_impact);
CREATE INDEX IF NOT EXISTS idx_stories_sector ON public.intelligence_stories(primary_sector_id);
CREATE INDEX IF NOT EXISTS idx_raw_articles_hash ON public.raw_articles(content_hash);
CREATE INDEX IF NOT EXISTS idx_story_sources_story ON public.story_sources(story_id);
CREATE INDEX IF NOT EXISTS idx_story_companies_company ON public.story_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_story_id ON public.analytics_events(story_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.analytics_events(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_story ON public.user_feedback(story_id);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_stories_search ON public.intelligence_stories 
USING gin(to_tsvector('english', title || ' ' || summary || ' ' || why_it_matters_to_sojitz));

-- 15. Row Level Security (RLS) Configuration
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_bank_entities ENABLE ROW LEVEL SECURITY;

-- Public Read-Only Policies (For internal/executive viewers and guests)
CREATE POLICY "Public read approved stories" ON public.intelligence_stories
    FOR SELECT USING (is_editor_approved = true);

CREATE POLICY "Public read story sources" ON public.story_sources
    FOR SELECT USING (true);

CREATE POLICY "Public read story companies" ON public.story_companies
    FOR SELECT USING (true);

CREATE POLICY "Public read active sectors" ON public.sectors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active companies" ON public.companies
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read published reports" ON public.weekly_reports
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public read active sources" ON public.sources
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read knowledge bank" ON public.knowledge_bank_entities
    FOR SELECT USING (is_active = true);

-- Public Write Policies for Behavioral Telemetry & Feedback
CREATE POLICY "Public insert feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert telemetry events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Service Role Full Access (For server actions, crawlers, and admin studio)
CREATE POLICY "Service role manages all stories" ON public.intelligence_stories
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages all raw articles" ON public.raw_articles
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages weekly reports" ON public.weekly_reports
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages sectors" ON public.sectors
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages companies" ON public.companies
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages sources" ON public.sources
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages feedback" ON public.user_feedback
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages analytics" ON public.analytics_events
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role manages knowledge bank" ON public.knowledge_bank_entities
    FOR ALL TO service_role USING (true);
