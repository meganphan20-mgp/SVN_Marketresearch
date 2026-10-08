-- PHASE 3.2: SOURCE-EVENT ALIGNMENT + EVENT-LEVEL DEDUPLICATION HARDENING
-- Migration: 20261007050000_phase3_2_event_alignment_and_clusters.sql

-- 1. Create event_clusters table
CREATE TABLE IF NOT EXISTS public.event_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_fingerprint TEXT NOT NULL UNIQUE,
  primary_event_type VARCHAR(100) NOT NULL,
  primary_entities JSONB NOT NULL DEFAULT '[]'::jsonb,
  event_date DATE,
  geography TEXT,
  project_or_asset TEXT,
  canonical_core_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_article_ids UUID[] NOT NULL DEFAULT '{}',
  source_ids UUID[] NOT NULL DEFAULT '{}',
  canonical_story_id UUID,
  material_update_version INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  latest_update_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_clusters_fingerprint ON public.event_clusters (event_fingerprint);
CREATE INDEX IF NOT EXISTS idx_event_clusters_event_date ON public.event_clusters (event_date);

-- 2. Add cluster_id to intelligence_stories
ALTER TABLE public.intelligence_stories
  ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES public.event_clusters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_intelligence_stories_cluster_id ON public.intelligence_stories (cluster_id);

-- 3. Add source alignment & role columns to story_sources
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'story_sources' AND column_name = 'source_role'
  ) THEN
    ALTER TABLE public.story_sources
      ADD COLUMN source_role VARCHAR(20) DEFAULT 'CORROBORATING' CHECK (source_role IN ('PRIMARY', 'CORROBORATING', 'BACKGROUND'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'story_sources' AND column_name = 'event_match_score'
  ) THEN
    ALTER TABLE public.story_sources
      ADD COLUMN event_match_score SMALLINT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'story_sources' AND column_name = 'supported_core_claim_ids'
  ) THEN
    ALTER TABLE public.story_sources
      ADD COLUMN supported_core_claim_ids TEXT[] DEFAULT '{}';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_story_sources_role ON public.story_sources (source_role);
