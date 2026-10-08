⸻
Executive Overview
The Sojitz Vietnam Market Intelligence Platform is an enterprise-grade, source-first research system. Its research flow starts from a user-maintained input list of approved online newspapers, official portals, IR pages, RSS feeds, and trusted discovery sources. The platform must first visit and ingest real articles from those configured sources, then identify potentially relevant developments, verify the underlying URLs and article content, classify and score the findings, and only after that generate business analysis, strategic implications, and suggested BD actions for Sojitz Vietnam.

Non-negotiable research principle:

SOURCE FIRST → ARTICLE FIRST → FACTS FIRST → RELEVANCE / CLASSIFICATION → ANALYSIS.

The platform is strictly prohibited from generating a hypothetical intelligence story first and then searching for links that appear to support it. An intelligence story may only be created from one or more real articles successfully fetched from the configured source universe.

Tailored for Sojitz Vietnam's Business Development, Strategy, Investment, and Executive Management teams, the platform converts verified source material into actionable business opportunities, competitive movements, policy signals, market intelligence, and risk alerts.
⸻
1. System Architecture

graph TD
    subgraph Source Universe - User Configured Inputs
        SourceList[Approved Source Registry / Input List]
        RSS[RSS Feeds]
        News[Online Newspaper Sections]
        Gov[Official Government / IR Portals]
        SourceList --> RSS
        SourceList --> News
        SourceList --> Gov
    end

    subgraph Source-First Research & Ingestion
        Crawler[Source Scanner / Crawler]
        URLGate[URL + Article Fetch Validation]
        RawStore[(raw_articles / staging)]
        RSS --> Crawler
        News --> Crawler
        Gov --> Crawler
        Crawler --> URLGate
        URLGate -->|Valid real article only| RawStore
        URLGate -->|Invalid / inaccessible / non-article| Drop[Discard]
    end

    subgraph Intelligence Selection Pipeline
        Dedupe[Deduplication & Event Clustering]
        Extract[Entity / Event / Claim Extraction]
        Potential[Potential Signal Detector]
        Relevance[Business Relevance Scoring]
        Classification[Sector / Event / Impact Classification]
        KB[Sojitz Vietnam Knowledge Bank]

        RawStore --> Dedupe
        Dedupe --> Extract
        Extract --> Potential
        Potential --> Relevance
        KB --> Relevance
        Relevance --> Classification
    end

    subgraph Analysis Pipeline
        Verify[Source / Fact Verification]
        Strategy[Strategic & BD Analysis]
        Story[Evidence-Grounded Intelligence Story]
        Classification --> Verify
        Verify -->|Verified facts only| Strategy
        Strategy --> Story
    end

    subgraph Production & Presentation
        StoryDB[(intelligence_stories + story_sources)]
        Dashboard[Executive / BD Dashboard]
        Reports[Daily / Weekly Briefings]
        Story --> StoryDB
        StoryDB --> Dashboard
        StoryDB --> Reports
    end


Mandatory Research Flow Contract

The production research workflow must operate in this exact order:

1. Read the approved source input list (sources where is_active = true).
2. Visit / scan those sources using RSS, section pages, APIs, sitemaps, or direct crawling.
3. Collect real article URLs first. No AI-generated URLs are allowed.
4. Fetch each article and confirm that the final destination is a real article page.
5. Store fetched articles in staging (raw_articles) only after successful fetch and content extraction.
6. Extract events, entities, claims, numbers, dates, and locations from the source article itself.
7. Evaluate potential business relevance against the Sojitz Knowledge Bank.
8. Discard low-value / irrelevant items before expensive analysis.
9. Classify relevant items by sector, event type, business impact, company, geography, and urgency.
10. Verify facts and source-to-claim alignment.
11. Generate Why it matters, opportunity hypotheses, risks, and suggested BD actions only from verified source facts.
12. Create an intelligence story only after the previous steps pass.
13. Every published story must retain direct traceability to its original source article(s).

Forbidden workflow:

AI GENERATES STORY
→ AI GENERATES / GUESSES HEADLINE
→ AI SEARCHES FOR A MATCHING SOURCE
→ SOURCE IS ATTACHED AFTERWARD


Required workflow:

APPROVED SOURCE LIST
→ REAL ARTICLE
→ VERIFIED URL + CONTENT
→ FACT / EVENT EXTRACTION
→ POTENTIAL SIGNAL PICKUP
→ RELEVANCE SCORE
→ CLASSIFICATION
→ BUSINESS ANALYSIS
→ INTELLIGENCE OUTPUT


Hard rule: If the platform cannot trace a story or factual claim back to at least one successfully fetched source article, that story or claim must not be published.

Core Architecture Components
1. Frontend / Application Layer (Next.js 16 + React 19 + Tailwind CSS v4):
    - Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR) for ultra-fast intelligence loading.
    - Executive minimal corporate UI: High information density, clear typography, dark/light contrast, no distracting animations.
    - Modular viewports: Desktop-first executive dashboard, mobile-responsive briefing view, and print/PDF-ready weekly briefing.

2. Data & Persistence Layer (Supabase / PostgreSQL + pgvector):
    - Relational integrity linking raw articles, semantic event clusters, stories, companies, and sources.
    - Dynamic schema allowing non-technical admins to add sectors and watchlist companies without code changes.
    - Built-in Row-Level Security (RLS) enforcing strict public/private boundaries.
    - Vector embeddings support for matching news against Sojitz Knowledge Bank investment criteria.

3. Source-First Research & Verification Engine:
    - Scans only the configured, active source universe before any intelligence synthesis occurs.
    - Captures real article URLs from RSS feeds, publisher pages, APIs, sitemaps, and official portals.
    - Fetches and validates the actual article page before storing it in raw_articles.
    - Rejects invalid URLs, non-article pages, inaccessible pages that cannot be verified, fabricated URLs, and source/article mismatches.
    - Performs event clustering only on already-fetched source articles.
    - Evaluates claims using source tier weighting (Tier 1: 1.0, Tier 2: 0.7, Tier 3: 0.4, Discovery: 0.1).
    - Strictly associates every published factual claim with one or more fetched source records.

4. Potential Signal Selection, Strategic Relevance & BD Action Engine:
    - Starts from fetched source articles, never from AI-generated story ideas.
    - Detects potentially valuable developments such as investment, M&A, JV, market entry, expansion, regulation, procurement, new projects, competitor movement, risks, and emerging demand.
    - Evaluates relevance (1–10) strictly based on Sojitz Vietnam's strategic priorities.
    - Classifies relevant items before generating any executive synthesis.
    - Generates concrete BD implications and suggested actions only after the underlying source facts pass validation.
    - Provider-agnostic interface supporting OpenAI, Anthropic, and Google Gemini via swappable adapters.

5. Behavioral Analytics & Feedback Engine:
    - Real-time client telemetry capturing scroll milestones (25%, 50%, 75%, 100%), source clicks, company/sector filtering, and useful/not useful votes with diagnostic reasons.
    - Feedback loop: Signals adjust future story ranking and spotlight models.
⸻
2. Folder Structure

svn-market-intelligence/
├── public/
│   ├── brand/                     # Sojitz logos, corporate marks, favicons
│   └── icons/                     # Sector and company badges
├── src/
│   ├── app/                       # Next.js App Router (All 16+ Requested Routes)
│   │   ├── layout.tsx             # Root layout with top nav & session provider
│   │   ├── page.tsx               # Primary Executive Dashboard (/)
│   │   ├── today/                 # Real-time Daily Intelligence Feed (/today)
│   │   │   └── page.tsx
│   │   ├── week/                  # Current Week Focus (/week)
│   │   │   └── page.tsx
│   │   ├── ma/                    # M&A, FDI & Joint Ventures Hub (/ma)
│   │   │   └── page.tsx
│   │   ├── japan/                 # Japan-Vietnam & Trading Houses Hub (/japan)
│   │   │   └── page.tsx
│   │   ├── vietnam-companies/     # Leading VN Conglomerates Watch (/vietnam-companies)
│   │   │   └── page.tsx
│   │   ├── companies/             # Watchlist Directory (/companies)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/            # Company Profile & Intelligence History
│   │   │       └── page.tsx
│   │   ├── sectors/               # Sector Directory (/sectors)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/            # Sector Intelligence Stream
│   │   │       └── page.tsx
│   │   ├── story/
│   │   │   └── [id]/              # Deep Story Intelligence & Verification Breakdown
│   │   │       └── page.tsx
│   │   ├── weekly/                # Weekly Executive Briefings Archive (/weekly)
│   │   │   ├── page.tsx
│   │   │   └── [week]/            # Specific Week Briefing (/weekly/[week])
│   │   │       └── page.tsx
│   │   ├── sources/               # Source Directory & Trust Tiers (/sources)
│   │   │   └── page.tsx
│   │   ├── search/                # Full-text & faceted search (/search)
│   │   │   └── page.tsx
│   │   ├── admin/                 # Admin Control Panel (/admin)
│   │   │   ├── page.tsx           # Taxonomy & Intelligence Editor
│   │   │   ├── companies/         # Dynamic Company CRUD
│   │   │   │   └── page.tsx
│   │   │   ├── sectors/           # Dynamic Sector CRUD
│   │   │   │   └── page.tsx
│   │   │   ├── sources/           # Dynamic Source CRUD
│   │   │   │   └── page.tsx
│   │   │   └── analytics/         # Deep Behavioral & Feedback Analytics (/admin/analytics)
│   │   │       └── page.tsx
│   │   └── api/                   # API Route Handlers
│   │       ├── analytics/         # Event tracking ingestion endpoint (/api/analytics)
│   │       │   └── route.ts
│   │       ├── feedback/          # Story useful/not useful vote endpoint (/api/feedback)
│   │       │   └── route.ts
│   │       ├── ingestion/         # Trigger or webhook for feed crawler (/api/ingestion)
│   │       │   └── route.ts
│   │       └── weekly/generate/   # Trigger weekly executive report synthesis
│   │           └── route.ts
│   ├── components/                # Modular UI Components
│   │   ├── layout/
│   │   │   ├── header.tsx         # Executive top navigation with live clock & search
│   │   │   ├── navigation.tsx     # Route tabs (Today, M&A, Japan, Companies, Sectors)
│   │   │   └── footer.tsx         # Legal, disclaimer & corporate info
│   │   ├── dashboard/
│   │   │   ├── kpi-banner.tsx     # 6 Critical Metrics (Scanned, Stories, High Pri, Opps, Risks, M&A)
│   │   │   ├── top-intelligence.tsx
│   │   │   ├── opportunity-radar.tsx
│   │   │   ├── company-watch.tsx
│   │   │   ├── competitor-watch.tsx
│   │   │   ├── sector-watch.tsx
│   │   │   └── latest-feed.tsx
│   │   ├── story/
│   │   │   ├── story-card.tsx     # Information-dense story card
│   │   │   ├── verification-badge.tsx
│   │   │   ├── impact-badge.tsx
│   │   │   ├── relevance-meter.tsx
│   │   │   ├── source-drawer.tsx  # Multi-source evidence breakdown
│   │   │   ├── bd-action-box.tsx  # Highlighted BD action recommendation
│   │   │   └── feedback-widget.tsx# "Was this intelligence useful?" modal + voting
│   │   ├── weekly/
│   │   │   ├── executive-summary.tsx
│   │   │   ├── macro-policy-section.tsx
│   │   │   ├── shosha-section.tsx # Japanese Trading Houses overview
│   │   │   ├── sector-table.tsx
│   │   │   └── print-button.tsx
│   │   ├── analytics/
│   │   │   ├── reading-depth-chart.tsx
│   │   │   ├── useful-vote-ratio.tsx
│   │   │   ├── drop-off-funnel.tsx
│   │   │   └── anomaly-table.tsx  # High relevance + low engagement stories
│   │   ├── ui/                    # Reusable primitives (Buttons, Badges, Modals, Tables)
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   └── toast.tsx
│   │   └── tracking/
│   │       └── scroll-tracker.tsx # IntersectionObserver scroll milestone sensor
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server Component client (cookies/headers)
│   │   │   └── admin.ts           # Service role client (bypasses RLS for workers)
│   │   ├── ai/
│   │   │   ├── provider-factory.ts# Multi-provider router (OpenAI, Gemini, Anthropic)
│   │   │   ├── prompts/           # Specialized prompts (relevance, verification, BD action)
│   │   │   ├── relevance-engine.ts
│   │   │   └── weekly-synthesizer.ts
│   │   ├── verification/
│   │   │   ├── deduplication.ts   # SHA256 & text similarity hashing
│   │   │   ├── clustering.ts      # Multi-source article clustering
│   │   │   ├── tier-evaluator.ts  # Source tier weighting (Tier 1/2/3/Discovery)
│   │   │   ├── conflict-detector.ts
│   │   │   └── confidence-scorer.ts # 0-100 score calculator
│   │   ├── analytics/
│   │   │   ├── client-tracker.ts  # SendBeacon / fetch event logger
│   │   │   └── session.ts         # Anonymous UUID session cookie manager
│   │   ├── knowledge/
│   │   │   ├── sojitz-profile.ts  # Sojitz Vietnam business divisions & strategic themes
│   │   │   └── default-taxonomy.ts# Seed data for priority sectors & watchlists
│   │   └── utils.ts
│   └── types/
│       ├── intelligence.ts        # Story, Source, Verification, Impact types
│       ├── taxonomy.ts            # Sector, Company, Source registry types
│       ├── report.ts              # Weekly report structure
│       └── analytics.ts           # Event schema & metric types
├── supabase/
│   ├── migrations/                # SQL schema migrations
│   │   └── 20261006000000_init_schema.sql
│   └── seed.sql                   # Realistic production seed dataset
├── next.config.ts
├── tailwind.config.ts / postcss.config.mjs
└── package.json

⸻
3. Database Schema (PostgreSQL DDL)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Definitions
CREATE TYPE source_tier AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'DISCOVERY');
CREATE TYPE verification_status AS ENUM (
    'VERIFIED', 
    'PARTIALLY_VERIFIED', 
    'SINGLE_SOURCE', 
    'CONFLICTING', 
    'UNVERIFIED'
);
CREATE TYPE business_impact_type AS ENUM (
    'OPPORTUNITY', 
    'PARTNERSHIP', 
    'MA_INVESTMENT', 
    'COMPETITOR_MOVEMENT', 
    'RISK', 
    'MARKET_INTELLIGENCE'
);
CREATE TYPE company_origin AS ENUM ('VIETNAM', 'JAPANESE_TRADING_HOUSE', 'GLOBAL_OTHER');
CREATE TYPE sector_priority AS ENUM ('PRIORITY_1', 'PRIORITY_2', 'MONITORING');
CREATE TYPE user_role AS ENUM ('ADMIN', 'INTERNAL_USER', 'GUEST');
CREATE TYPE feedback_vote AS ENUM ('USEFUL', 'NOT_USEFUL');

-- 1. Dynamic Sectors Table (Admin configurable)
CREATE TABLE public.sectors (
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

-- 2. Dynamic Companies Watchlist Table (Admin configurable)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    ticker VARCHAR(20),
    slug VARCHAR(150) NOT NULL UNIQUE,
    origin company_origin NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    description TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Source Registry & Trust Tiers
CREATE TABLE public.sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    tier source_tier NOT NULL DEFAULT 'TIER_2',
    rss_url TEXT,
    is_official_ir BOOLEAN DEFAULT false,
    trust_weight NUMERIC(3,2) NOT NULL DEFAULT 0.70, -- Tier 1: 1.0, Tier 2: 0.7, Tier 3: 0.4, Disc: 0.1
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Raw Ingested Articles
CREATE TABLE public.raw_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    author VARCHAR(255),
    published_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    http_status SMALLINT NOT NULL,
    final_url TEXT NOT NULL,
    canonical_url TEXT,
    fetch_verified BOOLEAN NOT NULL DEFAULT false,
    is_article_page BOOLEAN NOT NULL DEFAULT false,
    raw_content TEXT NOT NULL,
    cleaned_content TEXT NOT NULL,
    content_hash CHAR(64) NOT NULL, -- SHA-256 for exact match
    sim_hash VARCHAR(64),           -- MinHash for near-duplicate clustering
    cluster_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Curated Intelligence Stories
CREATE TABLE public.intelligence_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    publication_date DATE NOT NULL,
    event_date DATE NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Vietnam',
    category VARCHAR(100) NOT NULL,
    primary_sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    secondary_sectors UUID[] DEFAULT '{}',
    
    -- Executive Synthesis
    summary TEXT NOT NULL,
    why_it_matters_to_sojitz TEXT NOT NULL,
    business_impact business_impact_type NOT NULL,
    suggested_bd_action TEXT NOT NULL,
    relevance_score SMALLINT NOT NULL CHECK (relevance_score BETWEEN 1 AND 10),
    
    -- Source Verification Details
    verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
    confidence_score SMALLINT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    verification_rationale TEXT NOT NULL,
    extracted_facts JSONB NOT NULL DEFAULT '{}',
    detected_conflicts JSONB NOT NULL DEFAULT '[]',
    
    -- Audit & Publication
    ai_model_used VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
    collection_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    source_grounded BOOLEAN NOT NULL DEFAULT false,
    is_publishable BOOLEAN NOT NULL DEFAULT false,
    is_editor_approved BOOLEAN NOT NULL DEFAULT true, -- optional editorial review of analysis, never a fallback for missing sources
    is_high_priority BOOLEAN GENERATED ALWAYS AS (relevance_score >= 8) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Story Sources Junction (Evidence & URL integrity)
CREATE TABLE public.story_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.intelligence_stories(id) ON DELETE CASCADE,
    raw_article_id UUID REFERENCES public.raw_articles(id) ON DELETE SET NULL,
    source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
    source_name VARCHAR(150) NOT NULL,
    source_tier source_tier NOT NULL,
    article_title TEXT NOT NULL,
    article_url TEXT NOT NULL,
    final_url TEXT NOT NULL,
    canonical_url TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    url_verified BOOLEAN NOT NULL DEFAULT false,
    event_verified BOOLEAN NOT NULL DEFAULT false,
    claim_verified BOOLEAN NOT NULL DEFAULT false,
    content_alignment_score SMALLINT CHECK (content_alignment_score BETWEEN 0 AND 100),
    is_primary_claim_source BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Story Companies Junction
CREATE TABLE public.story_companies (
    story_id UUID NOT NULL REFERENCES public.intelligence_stories(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'SUBJECT', -- ACQUIRER, TARGET, PARTNER, COMPETITOR, SUBJECT
    PRIMARY KEY (story_id, company_id)
);

-- 8. User Feedback Table
CREATE TABLE public.user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.intelligence_stories(id) ON DELETE CASCADE,
    user_id UUID,                     -- Nullable for external guest sessions
    anonymous_session_id VARCHAR(64) NOT NULL,
    vote feedback_vote NOT NULL,
    reason VARCHAR(100),              -- e.g. 'Not relevant to Sojitz', 'Too old', etc.
    feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Behavioral Analytics Events Table
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(60) NOT NULL,
    user_id UUID,                     -- Null for anonymous
    anonymous_session_id VARCHAR(64) NOT NULL,
    story_id UUID REFERENCES public.intelligence_stories(id) ON DELETE SET NULL,
    session_id VARCHAR(64) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Weekly Executive Reports Table
CREATE TABLE public.weekly_reports (
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
    UNIQUE(year, week_number)
);

-- 11. Knowledge Bank Entities (Sojitz Internal Strategy Store)
CREATE TABLE public.knowledge_bank_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(60) NOT NULL, -- 'BUSINESS_UNIT', 'INVESTMENT_THEME', 'PARTNER', 'COMPETITOR'
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority_keywords TEXT[] DEFAULT '{}',
    embedding vector(1536),        -- For semantic retrieval
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for High Performance
CREATE INDEX idx_stories_story_date ON public.intelligence_stories(story_date DESC);
CREATE INDEX idx_stories_relevance ON public.intelligence_stories(relevance_score DESC);
CREATE INDEX idx_stories_verification ON public.intelligence_stories(verification_status);
CREATE INDEX idx_stories_impact ON public.intelligence_stories(business_impact);
CREATE INDEX idx_stories_sector ON public.intelligence_stories(primary_sector_id);
CREATE INDEX idx_story_sources_story ON public.story_sources(story_id);
CREATE INDEX idx_story_companies_company ON public.story_companies(company_id);
CREATE INDEX idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_story_id ON public.analytics_events(story_id);
CREATE INDEX idx_analytics_session ON public.analytics_events(anonymous_session_id);
CREATE INDEX idx_feedback_story ON public.user_feedback(story_id);
CREATE INDEX idx_stories_fts ON public.intelligence_stories USING gin(to_tsvector('english', title || ' ' || summary || ' ' || why_it_matters_to_sojitz));

⸻
4. Event Tracking Schema

Tracked Event Types (16 Specific Actions)
Event Name	Trigger Context	Associated Data Payload
dashboard_view	User loads / or sub-dashboards	{ path, referrer, session_duration_sec }
story_impression	Story card appears in viewport	{ story_id, position_index, list_type }
story_open	User clicks to view detailed story	{ story_id, source_route, time_to_click_ms }
story_scroll_25	User scrolls 25% of story detail	{ story_id, dwell_time_ms }
story_scroll_50	User scrolls 50% of story detail	{ story_id, dwell_time_ms }
story_scroll_75	User scrolls 75% of story detail	{ story_id, dwell_time_ms }
story_scroll_100	User scrolls 100% of story detail	{ story_id, dwell_time_ms }
source_expand	User expands evidence / sources drawer	{ story_id, source_count }
source_click	User clicks an external verified source URL	{ story_id, source_url, source_tier, source_name }
company_click	User clicks on a mentioned company tag	{ company_id, company_slug, origin }
sector_click	User clicks on a sector filter tag	{ sector_id, sector_slug }
helpful_vote	User marks story as "Useful"	{ story_id, vote: 'USEFUL' }
not_helpful_vote	User marks "Not Useful"	{ story_id, vote: 'NOT_USEFUL', reason: '...' }
search	User performs a keyword search	{ query, results_count, filters_applied }
filter	User toggles impact/tier/date filters	{ filter_key, filter_value }
weekly_report_open	User opens weekly briefing view	{ week_slug, year, week_number }
weekly_report_complete	User scrolls to end of weekly report	{ week_slug, read_time_seconds }

Analytics Queries answering Executive Questions:
1. Most Viewed Stories:
2. SELECT s.id, s.title, s.relevance_score, COUNT(e.id) as views
3. FROM intelligence_stories s
4. JOIN analytics_events e ON e.story_id = s.id AND e.event_name = 'story_open'
5. GROUP BY s.id, s.title, s.relevance_score
6. ORDER BY views DESC LIMIT 10;

2. Most Useful Intelligence:
3. SELECT s.id, s.title,
4.   COUNT(CASE WHEN f.vote = 'USEFUL' THEN 1 END) as useful_votes,
5.   COUNT(CASE WHEN f.vote = 'NOT_USEFUL' THEN 1 END) as not_useful_votes,
6.   ROUND(COUNT(CASE WHEN f.vote = 'USEFUL' THEN 1 END)::numeric / NULLIF(COUNT(f.id), 0) * 100, 1) as useful_pct
7. FROM intelligence_stories s
8. LEFT JOIN user_feedback f ON f.story_id = s.id
9. GROUP BY s.id, s.title
10. HAVING COUNT(f.id) >= 3
11. ORDER BY useful_pct DESC LIMIT 10;

3. Drop-off / Reading Depth:
4. SELECT 
5.   COUNT(CASE WHEN event_name = 'story_open' THEN 1 END) as opened,
6.   COUNT(CASE WHEN event_name = 'story_scroll_25' THEN 1 END) as reached_25,
7.   COUNT(CASE WHEN event_name = 'story_scroll_50' THEN 1 END) as reached_50,
8.   COUNT(CASE WHEN event_name = 'story_scroll_75' THEN 1 END) as reached_75,
9.   COUNT(CASE WHEN event_name = 'story_scroll_100' THEN 1 END) as reached_100
10. FROM analytics_events
11. WHERE story_id IS NOT NULL;

4. Source Click-Through Rate (CTR):
5. SELECT ss.source_name, ss.source_tier,
6.   COUNT(DISTINCT se.id) as story_impressions,
7.   COUNT(DISTINCT ce.id) as outbound_clicks,
8.   ROUND(COUNT(DISTINCT ce.id)::numeric / NULLIF(COUNT(DISTINCT se.id), 0) * 100, 2) as ctr_pct
9. FROM story_sources ss
10. LEFT JOIN analytics_events se ON se.story_id = ss.story_id AND se.event_name = 'story_impression'
11. LEFT JOIN analytics_events ce ON ce.story_id = ss.story_id AND ce.event_name = 'source_click'
12. GROUP BY ss.source_name, ss.source_tier
13. ORDER BY outbound_clicks DESC;

5. High Relevance but Low Engagement Anomaly Detection:
6. SELECT s.id, s.title, s.relevance_score,
7.   COUNT(CASE WHEN e.event_name = 'story_open' THEN 1 END) as opens,
8.   COUNT(CASE WHEN e.event_name = 'story_scroll_50' THEN 1 END) as deep_reads
9. FROM intelligence_stories s
10. LEFT JOIN analytics_events e ON e.story_id = s.id
11. WHERE s.relevance_score >= 8
12. GROUP BY s.id, s.title, s.relevance_score
13. HAVING COUNT(CASE WHEN e.event_name = 'story_scroll_50' THEN 1 END) < 3;

⸻
5. AI Processing Architecture

Architecture & Swappable Interface
export interface AIProvider {
  analyzeStory(rawCluster: ArticleCluster, knowledgeContext: SojitzKnowledgeContext): Promise<StoryAnalysisOutput>;
  synthesizeWeeklyReport(stories: IntelligenceStory[]): Promise<WeeklyReportSynthesisOutput>;
}

Adapters: OpenAIProvider (GPT-4o), GeminiProvider (Gemini 1.5 Pro), AnthropicProvider (Claude 3.5 Sonnet).

Source-First Intelligence Processing Pipeline

1. Source Scan / Article Discovery
    - Iterate through the active source input list.
    - Discover real article URLs from configured newspaper sections, RSS feeds, APIs, sitemaps, government portals, and corporate IR pages.
    - Do not ask an LLM to invent possible news or possible URLs.

2. Fetch & Source Integrity Validation
    - Open the discovered URL.
    - Follow redirects and record final_url / canonical_url.
    - Require a successful real article page and extractable article body.
    - If fetch or article validation fails, discard the item before analysis.

3. Article Extraction
    - From the fetched article itself, extract entities, companies, agencies, locations, dates, amounts, project scale, event type, and source-supported claims.
    - Preserve the original publisher headline separately from any generated intelligence headline.

4. Potential Signal Pickup
    - Evaluate whether the article contains a potentially valuable business signal.
    - Examples: investment, M&A, JV, new project, expansion, market entry, regulation, infrastructure, procurement, partnership, competitor movement, supply-chain change, demand shift, or material risk.
    - Low-value / irrelevant articles are archived or discarded and do not become intelligence stories.

5. Knowledge Bank Matching & Relevance Scoring
    - Compare the source-derived event against Sojitz's business portfolio, assets, strategic priorities, watchlists, target companies, sectors, and capabilities.
    - Score relevance on the 1–10 rubric.
    - Relevance scoring must evaluate the source-derived event, not a generated hypothesis.

6. Classification
    - Assign sector, event type, geography, entities, business impact type, urgency, opportunity/risk/watch status, and relevant Sojitz business unit.

7. Fact / Claim Verification
    - Confirm source-to-claim alignment.
    - Where multiple source articles cover the same event, cluster and compare them.
    - Any unsupported fact is removed rather than sent to an editor for source repair.

8. Strategic & BD Analysis
    - Only after source facts are verified, generate:
        - summary
        - why_it_matters_to_sojitz
        - opportunity / risk interpretation
        - suggested BD action
    - Clearly distinguish source facts from AI analysis / inference.

9. Publish Gate
    - A story may be created only if at least one verified source article and at least one verified fact remain.
    - No source = no story.
    - Invalid / unrelated sources are deleted automatically and are not placed into an admin source-review queue.

10. Weekly Synthesis
- Aggregate only published, source-grounded intelligence stories into executive reports.
⸻
6. Source Integrity & Multi-Source Verification Architecture

Approved Source Input List
        ↓
Scan Source / Discover Real Article URL
        ↓
Fetch URL + Follow Redirect
        ↓
Validate HTTP + Real Article Page + Extractable Content
        ↓
INVALID ─────────────→ DISCARD
        ↓ VALID
Store in raw_articles / staging
        ↓
Extract Event + Entities + Claims
        ↓
Potential Signal / Relevance Gate
        ↓
LOW RELEVANCE ───────→ ARCHIVE / DISCARD
        ↓ RELEVANT
Event Clustering Across Already-Fetched Articles
        ↓
Source-to-Event Alignment
        ↓
Source-to-Claim Verification
        ↓
Remove Unsupported Facts / Sources
        ↓
Strategic Analysis + BD Action
        ↓
Publish only if verified_source_count >= 1


SOJITZ RELEVANCE CHECK

An article should be considered potentially relevant if it provides evidence of one or more of the following:

1. A development directly affecting an existing Sojitz business or investment.

2. A potential customer, supplier, partner, investor, or counterparty.

3. A new investment, factory, project, expansion, JV, M&A transaction, market entry, or financing event.

4. Regulatory or policy changes that may affect Sojitz businesses.

5. Competitor activity.

6. Activity involving Japanese companies or Japanese trading houses in Vietnam.

7. Sector developments relevant to Sojitz strategic priorities.

8. Emerging customer needs that may create business demand.

9. New technologies, infrastructure, or market structures that could support future business development.

10. Significant risks or market disruptions.

An article must NOT be selected solely because:

- it mentions Vietnam
- it mentions Japan
- it contains a sector keyword
- it discusses the general economy
- it mentions a company on the watchlist
- it is published by a high-tier source

There must be a reasonable business or strategic connection.


ROLE SEQUENCE

The AI must perform the following roles sequentially.

ROLE 1 — RESEARCH SCANNER
Question:
What has been published in the Input Source List?

Output:
Real discovered articles only.

ROLE 2 — MARKET INTELLIGENCE ANALYST
Question:
Which articles contain potentially relevant signals for Sojitz?

Output:
DROP / WATCH / PICK UP / RESEARCH.

ROLE 3 — FACT & EVENT ANALYST
Question:
What objectively happened?

Output:
Verified entities, events, facts, numbers, dates, and claims.

ROLE 4 — BUSINESS / STRATEGY ANALYST
Question:
Why might this matter to Sojitz?

Output:
Business relevance and strategic implications.

ROLE 5 — BD ANALYST
Question:
Is there a realistic opportunity or next action?

Output:
Opportunity hypothesis, next research step, or BD action.

The later roles may only operate on outputs that passed the earlier roles.


Source Tier Definitions
- Tier 1 (Official & Global Authoritative - Weight 1.0):
    - Official Government Gazettes,   Financial Times,VnEconomy, VnExpress, VietnamNet, Vietnam News, The Investor, CafeF, Tuoi Tre Online, Thanh Nien News, Dau tu, CafeBiz
- Tier 2 (Premier Vietnamese Business & Economic Media - Weight 0.7):
    - Reuters, Bloomberg, Nikkei Asia, Vietnam Investment Review (VIR), , MPI, MOIT, State Bank of Vietnam (SBV), SSC/HOSE/HNX, Corporate Investor Relations,
- Tier 3 (Specialist & Domestic Financial Portals - Weight 0.4):
    -  Saigon Times, Industry Associations, Specialized Trade Journals.
- Discovery Only (Weight 0.1):
    - LinkedIn, Corporate Blogs, Aggregators. Cannot verify a story alone; triggers crawler corroboration.

Verification Status Decision Matrix
- VERIFIED:
    - $\ge 1$ Tier 1 source OR $\ge 2$ concordant Tier 2 sources with 0 detected conflicts.
- PARTIALLY_VERIFIED:
    - $\ge 2$ sources agree on core event, but minor discrepancies exist (e.g., timeline difference or pending regulatory approval).
- SINGLE_SOURCE:
    - Exactly 1 Tier 1 or Tier 2 source reported. Uncorroborated by peers.
- CONFLICTING:
    - Two or more credible sources report contradictory numbers (e.g., Stake size 49% vs 51%, deal valuation discrepancy $>10%$).
- UNVERIFIED:
    - Reported only by Tier 3 or Discovery sources without confirmation.

Mathematical Confidence Score ($0 - 100$)
$$\text{Score} = \min\left(100, \left( \sum_{s \in \text{Sources}} \text{TierWeight}(s) \times 35 \right) - (\text{ConflictPenalty} \times 30) + (\text{OfficialIRBonus} \times 15)\right)$$

Strict Source-First Integrity Rule
The platform never hallucinates or synthesizes external URLs and never creates an intelligence story before discovering the underlying source article.

Every published story_sources record must originate from an actual fetched raw_articles record and satisfy:

- fetch_verified = true
- is_article_page = true
- url_verified = true
- event_verified = true
- claim_verified = true for at least one claim

A URL being reachable is not sufficient. The article must concern the same event and explicitly support at least one factual claim used by the intelligence story.

If a candidate source fails URL, event, or claim verification, it is removed automatically. If a story has zero remaining verified sources, the entire story is deleted / not created. Missing-source failures are not sent to admin for manual repair.
⸻
7. Authentication Model

- Supabase Authentication:
    - Secure session handling via @supabase/ssr with HttpOnly cookies.
    - Email Magic Link and Corporate Google / Azure SSO options for Sojitz internal staff.
- User Roles & Permissions:
    - ADMIN:
        - Manage dynamic Sector taxonomy (Add/Edit/Archive sectors & keywords).
        - Manage dynamic Company Watchlist (Add/Edit companies, tickers, origins).
        - Manage Source Registry & trust weights.
        - Review / edit business interpretation and taxonomy. Source-integrity failures are machine-rejected and are not sent to admin for manual link repair.
        - Access deep behavioral analytics (/admin/analytics).
    - INTERNAL_USER (BD, Management, Strategy, Investment):
        - Personalized dashboard feeds, bookmarking, export to PDF, high-priority story notifications.
        - Submit "Useful / Not Useful" feedback with structured diagnostic tags.
    - GUEST (External authorized links):
        - Read-only viewing of shared story links (/story/[id]) and weekly reports (/weekly/[week]).
        - Anonymous session ID generated in local cookie (anon_sess_uuid).
        - Zero exposure to internal user identities or administrative controls.
⸻
8. Public / Private Access Model & Data Isolation

graph LR
    Visitor[Incoming Request] --> Router{Route Pattern}
    
    Router -->|/story/:id, /weekly/:week, /| PublicCheck[RLS Public Policy: is_editor_approved = true]
    Router -->|/admin, /admin/*| AuthCheck{Authenticated & Role == ADMIN?}
    
    AuthCheck -->|Yes| AdminAccess[Grant Admin Studio Access]
    AuthCheck -->|No| RedirectLogin[Redirect to Auth Login]
    
    PublicCheck --> Masking[Data Masker: Strip User IDs & Internal Notes]
    Masking --> Response[Client Render]


Data Privacy & Security Safeguards:
1. Row-Level Security (RLS): Enforced directly at the PostgreSQL layer. Anonymous clients cannot query unapproved stories, raw logs, or user feedback lists.
2. PII Masking: Public endpoints and client state never contain employee emails, internal user IDs, or internal BD notes.
3. Environment Security: All AI keys (OPENAI_API_KEY, GEMINI_API_KEY), Supabase service role keys, and scraping credentials reside in server-side environment variables and are never bundled into the client browser.
⸻
9. 7-Phase Development Checkpoints

[Phase 1] UI Prototype & Mock Intelligence Feed
    ├── Executive Dashboard UI (/), Filter Toolbar, KPI Banner
    ├── 16 Required Routes (Today, M&A, Japan, Companies, Sectors, Weekly, Sources, Admin)
    ├── Information-dense Story Cards, Verification Badges, BD Action Callouts
    └── Interactive "Was this useful?" feedback modal & anonymous tracker stub
    
[Phase 2] Supabase Database & Dynamic Taxonomy
    ├── Execute PostgreSQL migration (Sectors, Companies, Sources, Stories, Feedback, Analytics)
    ├── Seed comprehensive realistic data (Top VN Conglomerates, Japanese Trading Houses)
    ├── RLS policies configuration & Supabase client integration
    └── Dynamic Admin CRUD interfaces for Sectors and Companies

[Phase 3] Analytics & Reader Feedback Telemetry
    ├── IntersectionObserver scroll milestone sensors (25%, 50%, 75%, 100%)
    ├── Outbound source link click & dwell-time tracker
    ├── Useful / Not Useful voting engine with 7 structured diagnostic reasons
    └── Executive Analytics Dashboard (/admin/analytics) with reading depth funnel & anomalies

[Phase 4] Source-First Ingestion & Verification Pipeline
    ├── User-configured source registry / input list is the mandatory research starting point
    ├── News crawler & RSS ingestion pipeline visits approved Tier 1, 2, and 3 publications
    ├── Real URL discovery, HTTP fetch validation, redirect handling, and article-body extraction
    ├── Invalid / inaccessible / non-article URLs are automatically discarded
    ├── Content deduplication (SHA-256) & event clustering only after successful article fetch
    └── Source-to-event and source-to-claim verification gates

[Phase 5] AI Potential-Signal, Relevance & Strategic Analysis Engine
    ├── Provider-agnostic AI interface (OpenAI / Gemini / Anthropic)
    ├── Event/entity/claim extraction from fetched source content
    ├── Potential-signal pickup before expensive analysis
    ├── Knowledge Bank matcher grounded in Sojitz Vietnam business priorities
    ├── 1-10 relevance scoring and business classification
    ├── BD Action synthesizer grounded only in verified facts
    └── Automated Weekly Executive Briefing synthesis from published source-grounded stories

[Phase 6] Automation & Scheduled Workflows
    ├── Daily ingestion cron job & batch intelligence processing
    ├── Auto-clustering, relevance filtering, classification, verification, and source-grounded story generation
    └── Friday weekly executive briefing compilation & email digest trigger

[Phase 7] Production Hardening & Deployment
    ├── Performance optimization (Lighthouse 95+, zero layout shift)
    ├── Security audit (RLS validation, XSS prevention, rate limiting)
    ├── Vercel deployment & production Supabase link
    └── Executive user handbook & operational playbook

⸻
10. Acceptance Criteria for Each Phase

Phase 1: UI Prototype with Rich Mock Data
- [ ] Header renders exact branding: SOJITZ VIETNAM MARKET INTELLIGENCE.
- [ ] Dashboard displays all 6 KPIs: Articles Scanned, Intelligence Stories, High Priority, Opportunities, Risks, M&A Activity.
- [ ] All 6 Dashboard Sections render with information density: Top Intelligence, Opportunity Radar, Company Watch, Competitor Watch, Sector Watch, Latest Feed.
- [ ] All 16 primary routes are navigated smoothly without 404s.
- [ ] Every story card displays: Title, Dates, Category, Sector, Companies, Summary, Why it matters to Sojitz, Business Impact badge, BD Action, Relevance score (1–10), Confidence score (0–100), Verification badge, and Source links.
- [ ] Interactive "Was this useful?" feedback modal opens and records votes smoothly.
- [ ] Weekly Report page displays all 12 executive sections with a clean print/PDF view.

Phase 2: Database & Dynamic Taxonomy
- [ ] Supabase schema deploys cleanly with zero SQL errors.
- [ ] Admin can add, update, and archive sectors and companies via /admin without touching source code.
- [ ] RLS policies verified: Anonymous requests can only read approved stories and public taxonomy; raw articles and analytics writes are secured.
- [ ] Seed data populates all Priority 1 and Priority 2 sectors and watchlist companies (Masan, Vingroup, FPT, Hoa Phat, Sojitz, Marubeni, etc.).

Phase 3: Analytics & Feedback Engine
- [ ] Scroll tracking records milestones at 25%, 50%, 75%, and 100% reading depth into analytics_events.
- [ ] Outbound verified source clicks record source name, tier, and target URL.
- [ ] Reader "Not Useful" votes capture one of the 7 diagnostic tags (e.g. Not relevant to Sojitz, Already known, Weak analysis).
- [ ] Admin Analytics page displays: most-viewed stories, useful vote percentage, drop-off reading depth, and anomaly alerts (stories with Relevance $\ge 8$ but $<25%$ scroll depth).

Phase 4: Source-First News Ingestion & Verification
- [ ] Every research run begins by iterating through the active configured source input list.
- [ ] Every candidate intelligence item originates from at least one successfully fetched real article URL.
- [ ] The system never generates an intelligence story first and searches for evidence afterward.
- [ ] Every raw_articles record has a real discovered URL, successful fetch result, and extractable article body.
- [ ] Invalid, inaccessible, fabricated, non-article, or mismatched sources are automatically discarded with no admin source-review fallback.
- [ ] Duplicate articles are caught via SHA-256 and clustered by event only after source fetch.
- [ ] Zero fabricated / guessed URLs exist across production data.
- [ ] Reachable-but-unrelated URLs fail event/claim verification and cannot become supporting sources.

Phase 5: Potential Signal, Relevance, Classification & Strategic Analysis
- [ ] AI analyzes only fetched article content from Phase 4.
- [ ] Potential signals are selected from actual source articles before intelligence synthesis.
- [ ] Stories receive consistent relevance scores (1–10) adhering to Sojitz's strategic rubric.
- [ ] Every story is classified by sector, event type, entity, geography, business impact, and priority.
- [ ] Every factual claim is traceable to at least one verified source record.
- [ ] Suggested BD actions are generated only after source/fact verification and clearly separated from verified facts.
- [ ] If all supporting sources or facts are removed, the intelligence story is automatically deleted / not created.
- [ ] Weekly synthesis uses only source-grounded, published stories.

Phase 6: Automation & Workflow
- [ ] Scheduled cron scans the configured source input list, ingests real articles, filters potential signals, verifies facts, and publishes only source-grounded intelligence.
- [ ] Weekly report triggers automatically every Friday afternoon for executive review.

Phase 7: Production Hardening & Deployment
- [ ] Next.js production build (npm run build) completes with 0 errors and 0 type warnings.
- [ ] Application deployed to Vercel with environment variables securely set.
- [ ] End-to-end responsiveness tested on desktop (1920px, 1440px), tablet (1024px), and mobile (390px).
⸻Prepared for Sojitz Vietnam Management & Strategy Team.