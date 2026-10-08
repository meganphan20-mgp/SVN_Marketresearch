-- PHASE 2B / 3 HARDENING: RESEARCH TRIAGE OUTCOMES AND SOURCE TIER DEFINITIONS
-- Migration: 20261007060000_research_triage_and_source_tiers.sql

-- 1. Add triage_outcome to article_relevance_scores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'article_relevance_scores' AND column_name = 'triage_outcome'
  ) THEN
    ALTER TABLE public.article_relevance_scores
      ADD COLUMN triage_outcome VARCHAR(20) DEFAULT 'WATCH' 
      CHECK (triage_outcome IN ('DROP', 'WATCH', 'PICK_UP', 'RESEARCH'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'article_relevance_scores' AND column_name = 'triage_rationale'
  ) THEN
    ALTER TABLE public.article_relevance_scores
      ADD COLUMN triage_rationale TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_article_relevance_triage_outcome ON public.article_relevance_scores (triage_outcome);

-- 2. Update Source Tiers according to updated De_bai.md:
-- Tier 1: Official Government Gazettes, Financial Times, VnEconomy, VnExpress, VietnamNet, Vietnam News, The Investor, CafeF, Tuoi Tre Online, Thanh Nien News, Dau tu, CafeBiz
-- Tier 2: Reuters, Bloomberg, Nikkei Asia, Vietnam Investment Review (VIR), MPI, MOIT, State Bank of Vietnam (SBV), SSC/HOSE/HNX, Corporate Investor Relations
-- Tier 3: Saigon Times, Industry Associations, Specialized Trade Journals
-- Discovery: LinkedIn, Corporate Blogs, Aggregators

-- Tier 1 Updates (Weight 1.0)
UPDATE public.sources SET tier = 'TIER_1', trust_weight = 1.0 WHERE domain IN (
  'theinvestor.vn',
  'vneconomy.vn',
  'e.vnexpress.net',
  'vnexpress.net',
  'baodautu.vn',
  'cafef.vn',
  'tuoitrenews.vn',
  'tuoitre.vn',
  'thanhnien.vn',
  'vietnamnet.vn',
  'vietnamnews.vn',
  'cafebiz.vn',
  'ft.com',
  'chinhphu.vn'
);

-- Tier 2 Updates (Weight 0.7)
UPDATE public.sources SET tier = 'TIER_2', trust_weight = 0.7 WHERE domain IN (
  'reuters.com',
  'bloomberg.com',
  'asia.nikkei.com',
  'nikkei.com',
  'vir.com.vn',
  'mpi.gov.vn',
  'moit.gov.vn',
  'sbv.gov.vn',
  'hsx.vn',
  'hnx.vn',
  'ssc.gov.vn',
  'sojitz.com'
);

-- Tier 3 Updates (Weight 0.4)
UPDATE public.sources SET tier = 'TIER_3', trust_weight = 0.4 WHERE domain IN (
  'thesaigontimes.vn',
  'nangluongvietnam.vn'
);

-- Discovery Updates (Weight 0.1)
UPDATE public.sources SET tier = 'DISCOVERY', trust_weight = 0.1 WHERE domain IN (
  'industry-discovery.internal',
  'linkedin.com',
  'vietnam-briefing.com'
);
