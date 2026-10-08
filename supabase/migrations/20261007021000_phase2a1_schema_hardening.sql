-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Supabase PostgreSQL Migration 20261007021000_phase2a1_schema_hardening.sql
-- Phase 2A.1 Schema & Semantic Hardening
-- ==============================================================================

-- 1. Add new columns for event date provenance and score semantics
ALTER TABLE public.article_extractions
    ALTER COLUMN event_date TYPE VARCHAR(100) USING event_date::text,
    ADD COLUMN IF NOT EXISTS event_date_confidence SMALLINT CHECK (event_date_confidence IS NULL OR (event_date_confidence BETWEEN 0 AND 100)),
    ADD COLUMN IF NOT EXISTS event_date_source VARCHAR(50),
    ADD COLUMN IF NOT EXISTS event_detection_confidence SMALLINT CHECK (event_detection_confidence IS NULL OR (event_detection_confidence BETWEEN 0 AND 100));

-- 2. Ensure extraction_quality_score allows NULL for non-events
ALTER TABLE public.article_extractions
    DROP CONSTRAINT IF EXISTS article_extractions_extraction_quality_score_check;

ALTER TABLE public.article_extractions
    ADD CONSTRAINT article_extractions_extraction_quality_score_check
    CHECK (extraction_quality_score IS NULL OR (extraction_quality_score BETWEEN 0 AND 100));

-- 3. Strict Event Taxonomy Constraint:
-- Enforce EXACTLY ONE enum value from the controlled taxonomy.
-- Strictly rejects composite values such as 'ENERGY_PROJECT / POLICY_CHANGE'.
ALTER TABLE public.article_extractions
    DROP CONSTRAINT IF EXISTS chk_primary_event_type_strict;

ALTER TABLE public.article_extractions
    ADD CONSTRAINT chk_primary_event_type_strict
    CHECK (
        primary_event_type IN (
            'INVESTMENT',
            'CAPEX',
            'NEW_FACTORY',
            'EXPANSION',
            'M&A',
            'JV',
            'PARTNERSHIP',
            'MARKET_ENTRY',
            'NEW_STORE',
            'NEW_PROJECT',
            'REGULATION',
            'POLICY_CHANGE',
            'LAND_TRANSACTION',
            'HOTEL_DEVELOPMENT',
            'LOGISTICS_PROJECT',
            'ENERGY_PROJECT',
            'PRODUCT_LAUNCH',
            'CORPORATE_RESTRUCTURING',
            'FINANCING',
            'IPO',
            'DIVESTMENT',
            'COMPETITOR_MOVE',
            'OTHER'
        )
        AND primary_event_type NOT LIKE '%/%'
        AND primary_event_type NOT LIKE '%,%'
        AND primary_event_type NOT LIKE '%+%'
    );
