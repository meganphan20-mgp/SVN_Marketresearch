# SOJITZ VIETNAM MARKET INTELLIGENCE (SVN-MI)

> **Executive-grade corporate intelligence web platform engineered for Sojitz Vietnam.**  
> Monitors Vietnamese macroeconomics, M&A transactions, FDI flows, Sogo Shosha competitor movements, and policy developments to generate actionable business development intelligence and weekly executive briefings.

---

## 1. System Overview & Core Objectives

**Sojitz Vietnam Market Intelligence** is built for internal leadership, business development, strategy, and investment teams at Sojitz Vietnam. It provides:
1. **Daily Intelligence Aggregation**: Scans high-authority news publications and official regulatory gazettes across Vietnam and Japan.
2. **Multi-Source Verification**: Employs SHA-256 deduplication, 72-hour sliding event clustering, fact-conflict detection, and source trust weighting (Tier 1 to Discovery).
3. **Strategic Relevance Analysis**: Evaluates news against Sojitz's 5 operational divisions (Energy Solutions, Chemicals & Plastics, Industrial Infrastructure & Logistics, Foods & Retail, Mobility) with a 1–10 scoring rubric.
4. **Concrete BD Action Synthesis**: Directly identifies target counterparts, Sojitz action units, and transaction types (e.g., offtake, co-investment, supplier replacement).
5. **Behavioral Telemetry & Adaptive Feed Ranking**: Continuously optimizes intelligence recommendations based on reading depth (milestones at 25%, 50%, 75%, 100%), outbound citation CTR, and structured reader feedback.
6. **Executive Briefing Synthesis**: Generates full 12-section weekly executive reports with clean PDF/print export capabilities.

---

## 2. Architecture & Technology Stack

- **Framework**: Next.js 16.3.8 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4 (Executive corporate minimal design, high information density, sleek enterprise color palette)
- **Database & Storage**: PostgreSQL via Supabase with Row Level Security (RLS) & pg_trgm
- **AI Processing Layer**: Provider-agnostic AI engine supporting:
  - **Gemini 1.5 Pro** (`gemini-1.5-pro`)
  - **OpenAI GPT-4o** (`gpt-4o`)
  - **Anthropic Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`)
  - **Deterministic Offline Simulator** (instant zero-latency local fallback)
- **Verification Engine**: SHA-256 canonical hashing, Jaccard token similarity, 72-hour event clustering, numerical conflict detection, and strict anti-hallucination URL verification gate.

---

## 3. Platform Routes & Navigation (16 Primary Routes)

| Route | Description |
|---|---|
| `/` | **Executive Intelligence Dashboard**: 6 core sections (Top Intelligence, Opportunity Radar, Company Watch, Competitor Watch, Sector Watch, Latest Feed) |
| `/today` | Filtered view for today's newly collected intelligence stories |
| `/week` | Rolling 7-day consolidated intelligence feed |
| `/ma` | Dedicated M&A, joint ventures, and strategic investments portal |
| `/japan` | Vietnam–Japan economic relations, JETRO updates, and bilateral MoUs |
| `/vietnam-companies` | Focus feed tracking Top 100 Vietnamese conglomerates (Masan, Vingroup, FPT, Hoa Phat, etc.) |
| `/companies` | Directory of monitored enterprises with tier and origin breakdowns |
| `/companies/[slug]` | Enterprise dossier showing history, ticker, sector, and linked stories |
| `/sectors` | Complete taxonomy of Priority 1 and Priority 2 business sectors |
| `/sectors/[slug]` | Deep-dive sector feed with active investment opportunities |
| `/story/[id]` | Comprehensive Story Dossier with verification rationale, conflict analysis, extracted facts, and milestone scroll telemetry |
| `/weekly` | Archive of published Weekly Executive Reports |
| `/weekly/[week]` | 12-section executive briefing with print/PDF layout |
| `/sources` | Registry of 16+ monitored media nodes categorized by Trust Tier |
| `/admin` | Administrative Studio for dynamic management of Sectors, Companies, Sources, and manual crawler triggers |
| `/admin/analytics` | Executive Telemetry Studio tracking reading depth, drop-off funnels, useful vote ratios, source CTR, and engagement anomalies |

---

## 4. Verification & Scoring Formulas

### A. Mathematical Confidence Score ($0 - 100$)
$$\text{Score} = \min\left(100, \max\left(0, \left( \sum_{s \in \text{Sources}} \text{TierWeight}(s) \times 35 \right) - (\text{ConflictPenalty} \times 30) + (\text{OfficialIRBonus} \times 15) \right)\right)$$

- **Tier 1 (Weight 1.0)**: Official Government Gazettes, MPI, MOIT, SBV, Reuters, Bloomberg, Nikkei Asia.
- **Tier 2 (Weight 0.7)**: Vietnam Investment Review (VIR), VnEconomy, VnExpress, VietnamNet, The Investor.
- **Tier 3 (Weight 0.4)**: CafeF, Saigon Times, Industry Associations.
- **Discovery (Weight 0.1)**: Corporate blogs, aggregators.

### B. Behavioral Adaptive Feed Ranking
$$\text{Effective Score} = \text{Base Relevance (1–10)} + (\text{Useful Votes} \times 0.40) - (\text{Not Useful Votes} \times 0.60)$$

- Elevates stories confirmed impactful by internal teams.
- Deprecates low-quality or irrelevant items based on diagnostic feedback.

### C. Source Link Audit Agent Workflow (Zero-Hallucination Gate)

```
DISCOVER ARTICLE
        ↓
   GET REAL URL
        ↓
   LINK AUDIT
        ↓
  CONTENT AUDIT
        ↓
   CLAIM AUDIT
        ↓
     PASS?
   ↙        ↘
 YES         NO
  ↓           ↓
 SAVE   REPAIR SEARCH
              ↓
         VERIFY AGAIN
```

1. **DISCOVER ARTICLE**: Ingest raw news items or claims from media streams.
2. **GET REAL URL**: Normalize candidate URL, validate syntax, reject placeholder domains (`example.com`, `dummy`, malformed slugs) with `INVALID_URL`.
3. **LINK AUDIT**: Execute HEAD/GET requests with redirect following. Audit final destination URL to ensure it did not redirect to a domain homepage, search page, login, or generic news category page.
4. **CONTENT AUDIT**: Extract page `<title>`, `<meta property="og:title">`, and `<link rel="canonical">`. Compute Title (20%), Entity (20%), Event (25%), and Date (10%) alignment scores.
5. **CLAIM AUDIT**: Validate specific claimed facts against explicit textual evidence (`SUPPORTED`, `PARTIALLY_SUPPORTED`, `NOT_SUPPORTED`, `CONTRADICTED`). Never infer numbers or terms from context.
6. **PASS DECISION**:
   - **YES** (`VERIFIED` or `VERIFIED_REDIRECT` with score $\ge 60$): Save story and mark `counts_as_verified_source = true`.
   - **NO** (`NOT_FOUND`, `CONTENT_MISMATCH`, `INVALID_URL`, `PARTIAL_MATCH`):
     - Trigger **REPAIR SEARCH**: Search publisher domain for legitimate reporting matching headline and entities.
     - Execute **VERIFY AGAIN**: Re-run full Link + Content + Claim Audit on candidate replacement URL. Only replace if status becomes `VERIFIED` or `VERIFIED_REDIRECT`. Never generate a guessed slug.

---

## 5. Environment Variables & Setup

Create a `.env.local` file with the following keys (see [`.env.example`](file:///Users/DungPhan/Projects/SVN/SVN_Marketresearch/.env.example)):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider Configuration ('gemini' | 'openai' | 'anthropic' | 'simulator')
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Automation & Cron Secret
CRON_SECRET=your-secret-cron-token
```

---

## 6. Local Development & Deployment

### Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build Production Bundle
```bash
npm run build
```

### Database Deployment (Supabase)
1. Run [`supabase/migrations/20261006000000_init_schema.sql`](file:///Users/DungPhan/Projects/SVN/SVN_Marketresearch/supabase/migrations/20261006000000_init_schema.sql) in the Supabase SQL Editor.
2. Run [`supabase/seed.sql`](file:///Users/DungPhan/Projects/SVN/SVN_Marketresearch/supabase/seed.sql) to seed default taxonomy and initial intelligence items.

---

## 7. Automated Scheduled Jobs

- **Daily Ingestion (`/api/cron/ingest`)**:
  - Runs daily at 06:00 ICT.
  - Crawls monitored sources, deduplicates, clusters, performs verification scoring, analyzes strategic relevance, and auto-drafts intelligence.
- **Friday Executive Compilation (`/api/cron/weekly-digest`)**:
  - Runs every Friday at 17:00 ICT.
  - Curates top stories of the week and compiles the 12-section executive briefing.

---

## 8. Source Integrity & Auto-Cleanup Policy (Steps 1–10)

The platform enforces the **Absolute Source Integrity Policy**:
> **Invalid or unverified links must NEVER be displayed to users.**
> Either:
> `VERIFY → KEEP`
> or
> `FAIL → REPAIR → VERIFY → KEEP`
> or
> `FAIL → DELETE`
> *(There is no fourth option).*

### 10-Step Operational Workflow
1. **Step 1 — Test Provided URL**: Live HTTP request, redirect audit, page title, canonical URL, and body content extraction.
2. **Step 2 — Invalid Conditions**: 404, 410, DNS errors, generic homepages/categories, and content mismatches marked invalid.
3. **Step 3 — Auto Repair**: Independent candidate search across verified discovery pools (entities + event + date + keywords). Zero URL hallucination.
4. **Step 4 — Verify Replacement**: Re-verification requiring HTTP 200, correct publisher, correct entity, and event alignment $\ge 80/100$.
5. **Step 5 — Delete if Repair Fails**: Permanently purges unverified sources from published article datasets. No 404 badges or broken cards exposed in public UI.
6. **Step 6 — Public Access Link**: Emits canonical clean URL (`access_url`), stripped of tracking UTMs.
7. **Step 7 — Article Publication Rule**: Sets `MULTI_SOURCE_VERIFIED` ($\ge 2$), `SINGLE_SOURCE_VERIFIED` ($1$), or `NO_VERIFIED_SOURCE` ($0$). Articles with 0 verified sources are suppressed from public publication unless explicitly approved by an editor.
8. **Step 8 — Confidence Hard Cap**: Hard limits applied: 0 sources $\rightarrow$ max 0, 1 source $\rightarrow$ max 75, 2 sources $\rightarrow$ max 95, 3+ sources $\rightarrow$ max 100.
9. **Step 9 — UI Cleanup Guarantee**: Public UI renders ONLY verified sources: Publisher, Publication date, Article title, and `[Access Source]` button.
10. **Step 10 — Standard Output Endpoint**: `POST /api/admin/clean-story-sources` returning strict JSON schema with `sources` and internal `removed_sources` logs.

---

*Engineered for Sojitz Vietnam Management & Strategy Team.*
