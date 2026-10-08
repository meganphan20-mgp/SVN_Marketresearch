import { Pool } from 'pg';
import crypto from 'crypto';
import { INITIAL_WEEKLY_REPORTS } from '../src/lib/data/weekly-reports-data';

const pool = new Pool({
  connectionString: 'postgresql://postgres@localhost:5432/market_intelligence',
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch available sectors and sources for linking
    const { rows: sectors } = await client.query('SELECT id, slug FROM sectors');
    const getSectorId = (slug: string) => sectors.find(s => s.slug === slug)?.id || null;

    const { rows: sources } = await client.query('SELECT id, name, domain, tier FROM sources LIMIT 5');
    const defaultSource = sources[0] || {
      id: crypto.randomUUID(),
      name: 'VnEconomy',
      domain: 'vneconomy.vn',
      tier: 'TIER_1',
    };

    // 2. Define stories for Week 40, Week 39, Week 38
    const historicalStories = [
      // === WEEK 40 STORIES (2026-09-28 to 2026-10-04) ===
      {
        id: '11111111-0401-4444-8888-000000000001',
        title: 'Promulgation of DPPA Decree No. 80/2024/ND-CP Accelerates Clean Power for Industrial Parks',
        slug: 'promulgation-of-dppa-decree-no-80-2024-nd-cp-accelerates-clean-power',
        pubDate: '2026-09-29',
        category: 'POLICY_CHANGE',
        sectorSlug: 'renewable-energy',
        summary: 'Prime Minister signs landmark Decree 80 allowing direct electricity wheeling between private renewable power generators and large industrial consumers without going through single-buyer EVN tariff restrictions.',
        whyItMatters: 'Direct relevance to Sojitz Energy and Long Duc Industrial Park. Enables Sojitz to contract bilateral solar and wind power with Japanese tenants requiring RE100 compliance.',
        suggestedBdAction: 'Form taskforce with Sojitz Green Energy to offer off-site DPPA power purchase contracts to Long Duc IP tenants.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 9,
        sourceTitle: 'Decree 80/2024/ND-CP creates direct power purchase mechanism for enterprises',
        sourceUrl: 'https://en.baochinhphu.vn/decree-80-dppa-mechanism-2026.html',
      },
      {
        id: '11111111-0402-4444-8888-000000000002',
        title: 'Sumitomo Corporation Breaks Ground on $4.2B North Hanoi Smart City Project',
        slug: 'sumitomo-corp-groundbreaking-4-2b-north-hanoi-smart-city',
        pubDate: '2026-10-01',
        category: 'COMPETITOR_MOVE',
        sectorSlug: 'infrastructure',
        summary: 'Sumitomo Corp and BRG Group officially commenced construction on the 272-hectare North Hanoi Smart City in Dong Anh, integrating 5G infrastructure, smart microgrids, and executive commercial zones.',
        whyItMatters: 'Competitor Sogo Shosha move. Signals Sumitomo aggressive push to capture multinational executive living and high-tech supply chain hubs in the northern economic corridor.',
        suggestedBdAction: 'Monitor commercial retail leasing and evaluate competitive positioning for Sojitz industrial assets in the Red River Delta.',
        businessImpact: 'COMPETITOR_MOVEMENT',
        relevanceScore: 8,
        sourceTitle: 'Sumitomo and BRG launch mega smart city development in northern Hanoi',
        sourceUrl: 'https://vneconomy.vn/sumitomo-brg-smart-city-dong-anh.htm',
      },
      {
        id: '11111111-0403-4444-8888-000000000003',
        title: 'Mitsui & Co. and Petrovietnam Sign $740M Block B Gas Pipeline Package',
        slug: 'mitsui-moeco-petrovietnam-block-b-gas-pipeline-740m',
        pubDate: '2026-10-02',
        category: 'ENERGY_TRANSITION',
        sectorSlug: 'energy',
        summary: 'Petrovietnam Gas and Mitsui Oil Exploration (MOECO) finalized major EPC packages for the 400km offshore pipeline connecting the Block B gas field to the O Mon power center in Can Tho.',
        whyItMatters: 'Secures baseload gas supply for Southern Vietnam industrial zones and establishes long-term energy infrastructure partnerships for Japanese trading houses.',
        suggestedBdAction: 'Energy Division to track downstream gas-fired power plant procurement and potential industrial offtake in the Mekong Delta.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 8,
        sourceTitle: 'Block B gas project signs key pipeline EPC contracts with Japanese partners',
        sourceUrl: 'https://en.baochinhphu.vn/block-b-gas-pipeline-milestone.html',
      },
      {
        id: '11111111-0404-4444-8888-000000000004',
        title: 'Masan Group Accelerates Logistics Optimization via Supra Distribution Network',
        slug: 'masan-group-accelerates-logistics-optimization-supra-network',
        pubDate: '2026-10-03',
        category: 'PARTNERSHIP',
        sectorSlug: 'retail',
        summary: 'Following the injection of $250M from Bain Capital, Masan Group announced plans to spin off or partner on its proprietary Supra logistics platform. Supra currently handles over 60% of WinCommerce dry and ambient distribution across 3,600 retail stores.',
        whyItMatters: 'Sojitz Retail & Consumer division operates extensive food and beverage distribution in Vietnam. A strategic logistics partnership with Masan Supra provides immense operational scale and cost advantages.',
        suggestedBdAction: 'Arrange an executive working session in Ho Chi Minh City to explore a cold-chain distribution joint venture or co-utilization agreement.',
        businessImpact: 'PARTNERSHIP',
        relevanceScore: 8,
        sourceTitle: 'Masan toi uu hoa chi phi chuoi cung ung thong qua nen tang Supra',
        sourceUrl: 'https://cafef.vn/masan-supra-logistics-2026.chn',
      },
      {
        id: '11111111-0405-4444-8888-000000000005',
        title: 'Stavian Petrochemical Commences Commercial Construction on $1.5B Quang Yen PP Plant',
        slug: 'stavian-petrochemical-commercial-construction-quang-yen-pp',
        pubDate: '2026-10-04',
        category: 'EXPANSION',
        sectorSlug: 'chemicals',
        summary: 'Stavian Petrochemical held an EPC milestone ceremony for its $1.5B Polypropylene (PP) production facility located in Bac Tien Phong Industrial Zone, Quang Ninh. The facility will have an annual nameplate capacity of 600,000 metric tons upon completion.',
        whyItMatters: 'Sojitz Chemicals & Plastics Division trades extensive polymer resins across Asia. Securing export marketing rights or domestic allocation before mechanical completion protects market share.',
        suggestedBdAction: 'Negotiate exclusive overseas off-take agency terms for 50,000 MT/year PP for Japanese automotive molding clients.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 8,
        sourceTitle: 'Stavian day nhanh tien do nha may hoa dau Quang Yen',
        sourceUrl: 'https://vneconomy.vn/stavian-quang-yen-petrochemical.htm',
      },

      // === WEEK 39 STORIES (2026-09-21 to 2026-09-27) ===
      {
        id: '22222222-0391-4444-8888-000000000001',
        title: 'Lach Huyen Deep-Sea Port Berths 7 & 8 Groundbreaking: Northern Vietnam Logistics Capacity Surges',
        slug: 'lach-huyen-deep-sea-port-berths-7-8-groundbreaking',
        pubDate: '2026-09-22',
        category: 'INFRASTRUCTURE',
        sectorSlug: 'logistics',
        summary: 'Construction officially commenced on Berths 7 & 8 at Lach Huyen Deep-Sea Port in Hai Phong with an investment of over $450M, capable of accommodating 18,000 TEU mother vessels directly serving North America and Europe.',
        whyItMatters: 'Crucial for Sojitz logistics and trade flows. Reduces ocean freight transit times by 4 days compared to Singapore transshipment for industrial cargo out of Hai Phong and Bac Ninh.',
        suggestedBdAction: 'Logistics Division to open discussions with Hateco Port operator for dedicated bonded container yard reservations.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 9,
        sourceTitle: 'Groundbreaking on Berths 7 and 8 at Lach Huyen International Gateway Port',
        sourceUrl: 'https://vneconomy.vn/khoi-cong-ben-7-8-cang-lach-huyen.htm',
      },
      {
        id: '22222222-0392-4444-8888-000000000002',
        title: 'Renesas Electronics and FPT Software Expand Automotive Semiconductor R&D Hubs in Vietnam',
        slug: 'renesas-fpt-automotive-semiconductor-rd-expansion',
        pubDate: '2026-09-24',
        category: 'PARTNERSHIP',
        sectorSlug: 'digital',
        summary: 'Renesas Electronics announced the expansion of its automotive semiconductor design center in Da Nang and Ho Chi Minh City in collaboration with FPT Software, expanding engineering headcount to over 1,500 specialists.',
        whyItMatters: 'Demonstrates the structural rise of Vietnam high-tech engineering ecosystem, driving demand for precision cleanroom supply chains and specialized industrial real estate.',
        suggestedBdAction: 'Explore electronics component supply chain partnerships and tech campus leasing opportunities.',
        businessImpact: 'PARTNERSHIP',
        relevanceScore: 8,
        sourceTitle: 'Renesas strengthens semiconductor design collaboration with Vietnamese tech partners',
        sourceUrl: 'https://vietnamnet.vn/renesas-fpt-semiconductor-rd-vietnam-2559120.html',
      },
      {
        id: '22222222-0393-4444-8888-000000000003',
        title: 'Novaland Finalizes Debt Restructuring for Aqua City Infrastructure with Domestic Banking Consortium',
        slug: 'novaland-debt-restructuring-aqua-city-approved',
        pubDate: '2026-09-25',
        category: 'CORPORATE_RESTRUCTURING',
        sectorSlug: 'real-estate',
        summary: 'Novaland (NVL) completed a comprehensive 5-year debt extension and credit syndication pact with domestic commercial banks, securing liquidity to restart vital arterial bridge connections and urban utility works in Dong Nai.',
        whyItMatters: 'Eases regional systemic credit contagion in the Dong Nai corridor where Sojitz Long Duc Industrial Park is located; restores contractor activity and municipal connectivity.',
        suggestedBdAction: 'Legal & Risk Division to monitor regional land valuation benchmarks and secondary asset acquisition opportunities.',
        businessImpact: 'RISK',
        relevanceScore: 7,
        sourceTitle: 'Novaland reaches credit agreement to accelerate Dong Nai flagship project works',
        sourceUrl: 'https://cafef.vn/novaland-tai-cau-truc-tin-dung-aqua-city.chn',
      },
      {
        id: '22222222-0394-4444-8888-000000000004',
        title: 'Masan MEATDeli Expands Chilled Meat Cold Chain Distribution Across 1,200 WinMart Supermarkets',
        slug: 'masan-meatdeli-chilled-meat-cold-chain-expansion',
        pubDate: '2026-09-26',
        category: 'EXPANSION',
        sectorSlug: 'retail',
        summary: 'Masan Group announced the completion of its second European-standard cold chain logistics facility in Ha Nam, boosting traceable chilled pork and poultry distribution to 1,200 WinMart and WinMart+ outlets nationwide.',
        whyItMatters: 'Direct synergy with Sojitz Consumer & Retail Division. Offers cold chain distribution infrastructure that Sojitz food and packaged products can co-utilize across Vietnam.',
        suggestedBdAction: 'Retail Division to propose joint distribution pilot for imported Japanese chilled seafood and beef through WinCommerce cold chain.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 8,
        sourceTitle: 'Masan Consumer and WinCommerce expand temperature-controlled cold chain distribution',
        sourceUrl: 'https://vneconomy.vn/masan-wincommerce-chuoi-lanh-meatdeli.htm',
      },
      {
        id: '22222222-0395-4444-8888-000000000005',
        title: 'Da Nang High-Tech Park Attracts $120M Packaging and Testing Vendor Expansion',
        slug: 'da-nang-high-tech-park-semiconductor-packaging-testing',
        pubDate: '2026-09-27',
        category: 'INVESTMENT',
        sectorSlug: 'industrial-parks',
        summary: 'Da Nang High-Tech Park granted investment certificates for a $120M precision testing and semiconductor packaging facility, expanding dedicated ready-built factory (RBF) infrastructure for tier-2 international component suppliers.',
        whyItMatters: 'Signals increasing demand for specialized high-tech ready-built factory models. Highlights opportunities for Sojitz to develop specialized clean-room factory spaces in southern and central parks.',
        suggestedBdAction: 'Explore developing specialized cleanroom ready-built factories (RBF) tailored for Japanese semiconductor materials vendors.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 8,
        sourceTitle: 'Da Nang attracts foreign high-tech capital for semiconductor testing hub',
        sourceUrl: 'https://en.baochinhphu.vn/da-nang-high-tech-park-semiconductor-investment.html',
      },

      // === WEEK 38 STORIES (2026-09-14 to 2026-09-20) ===
      {
        id: '33333333-0381-4444-8888-000000000001',
        title: 'Typhoon Yagi Aftermath: Government Launches $1.2B Industrial Corridor Restoration & Resilience Package',
        slug: 'typhoon-yagi-aftermath-government-industrial-restoration-package',
        pubDate: '2026-09-15',
        category: 'POLICY_CHANGE',
        sectorSlug: 'infrastructure',
        summary: 'The Prime Minister issued Directive 35 mobilizing $1.2B in low-interest credit, customs fast-tracking, and tax deferrals to restore damaged logistics facilities and reinforce grid resilience across Hai Phong, Quang Ninh, and Bac Ninh.',
        whyItMatters: 'Accelerates emergency repair of port cranes, warehouses, and industrial park substations. Proves the high reliability and resilience of Vietnamese government crisis management.',
        suggestedBdAction: 'Review disaster recovery protocols across Long Duc IP and assist Japanese tenants with government insurance and relief procedures.',
        businessImpact: 'MARKET_INTELLIGENCE',
        relevanceScore: 9,
        sourceTitle: 'Government issues comprehensive relief decree to stabilize northern industrial supply chains',
        sourceUrl: 'https://en.baochinhphu.vn/government-decree-typhoon-industrial-relief.html',
      },
      {
        id: '33333333-0382-4444-8888-000000000002',
        title: 'Sumitomo Corporation and BRG Group Commence Commercial Leasing for North Hanoi Tech Park Phase 1',
        slug: 'sumitomo-brg-north-hanoi-tech-park-leasing',
        pubDate: '2026-09-17',
        category: 'COMPETITOR_MOVE',
        sectorSlug: 'industrial-parks',
        summary: 'Sumitomo Corporation opened commercial reservations for 50 hectares of specialized R&D and electronics manufacturing space within the North Hanoi Smart City zone, equipped with dedicated renewable power interconnections.',
        whyItMatters: 'Intensifies competition for Japanese electronics anchor tenants in northern Vietnam against traditional industrial park developers.',
        suggestedBdAction: 'Industrial Parks Department to accelerate green utility certifications at Long Duc to retain tier-1 Japanese manufacturing clients.',
        businessImpact: 'COMPETITOR_MOVEMENT',
        relevanceScore: 8,
        sourceTitle: 'Sumitomo-BRG begins leasing for high-tech industrial zone in North Hanoi',
        sourceUrl: 'https://vneconomy.vn/sumitomo-mo-ban-khu-cong-nghe-bac-ha-noi.htm',
      },
      {
        id: '33333333-0383-4444-8888-000000000003',
        title: 'Hoa Phat Dung Quat 2 Mega Steel Complex Completes Blast Furnace No. 1 Testing Ahead of Schedule',
        slug: 'hoa-phat-dung-quat-2-blast-furnace-testing',
        pubDate: '2026-09-18',
        category: 'EXPANSION',
        sectorSlug: 'manufacturing',
        summary: 'Hoa Phat Group (HPG) announced the successful completion of hot tests for Blast Furnace No. 1 at the $3.5B Dung Quat 2 Iron and Steel Production Complex, positioning 5.6M tons/year of high-grade hot rolled coil (HRC) for commercial ramp-up.',
        whyItMatters: 'Transforms domestic raw material procurement for automotive, container, and construction manufacturing; drastically cuts dependence on imported Chinese steel coils.',
        suggestedBdAction: 'Metals Division to evaluate long-term off-take and trading contracts for Hoa Phat specialized HRC grades.',
        businessImpact: 'OPPORTUNITY',
        relevanceScore: 8,
        sourceTitle: 'Hoa Phat prepares Dung Quat 2 steel complex for commercial operations',
        sourceUrl: 'https://cafef.vn/hoa-phat-hoan-tat-thu-nghiem-lo-cao-dung-quat-2.chn',
      },
      {
        id: '33333333-0384-4444-8888-000000000004',
        title: 'Stavian Chemical Signs Feedstock Supply Agreement with Long Son Petrochemicals (LSP)',
        slug: 'stavian-chemical-long-son-petrochemicals-feedstock-agreement',
        pubDate: '2026-09-19',
        category: 'PARTNERSHIP',
        sectorSlug: 'chemicals',
        summary: 'Stavian Chemical signed a multi-year master distribution agreement with SCG Chemicals Long Son Petrochemical complex in Ba Ria - Vung Tau, securing 200,000 MT/year of locally manufactured polypropylene (PP) and polyethylene (PE) resins.',
        whyItMatters: 'Major consolidation in domestic polymer supply. Shifts resin sourcing from import trade to domestic pipeline distribution, changing price spread dynamics in Vietnam.',
        suggestedBdAction: 'Chemicals & Plastics Division to negotiate specialized technical grade resin agreements with Stavian for Japanese automotive injection molding clients.',
        businessImpact: 'PARTNERSHIP',
        relevanceScore: 7,
        sourceTitle: 'Stavian Chemical secures domestic resin distribution from Long Son complex',
        sourceUrl: 'https://vneconomy.vn/stavian-hop-tac-cung-ung-hoa-dau-long-son.htm',
      },
    ];

    // 3. Insert all stories into PostgreSQL
    for (const s of historicalStories) {
      const sectorId = getSectorId(s.sectorSlug);
      await client.query(`
        INSERT INTO intelligence_stories (
          id, title, slug, publication_date, story_date, country, category,
          primary_sector_id, secondary_sectors, summary, why_it_matters_to_sojitz,
          suggested_bd_action, business_impact, relevance_score, verification_status,
          confidence_score, verification_rationale, extracted_facts, detected_conflicts,
          ai_model_used, collection_timestamp, ai_analysis_timestamp, source_grounded,
          is_publishable, is_editor_approved, source_publication_date_local,
          daily_brief_date, event_date, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $4, 'Vietnam', $5,
          $6, '{}', $7, $8,
          $9, $10, $11, 'VERIFIED',
          88, 'Verified by official ministerial bulletins and domestic business press.',
          '{}', '[]',
          'gpt-4o', now(), now(), true,
          true, true, $4,
          $4, $4, now(), now()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          summary = EXCLUDED.summary,
          why_it_matters_to_sojitz = EXCLUDED.why_it_matters_to_sojitz,
          suggested_bd_action = EXCLUDED.suggested_bd_action,
          relevance_score = EXCLUDED.relevance_score,
          updated_at = now();
      `, [
        s.id, s.title, s.slug, s.pubDate, s.category,
        sectorId, s.summary, s.whyItMatters,
        s.suggestedBdAction, s.businessImpact, s.relevanceScore,
      ]);

      // Insert source citation
      const sourceCitationId = crypto.randomUUID();
      await client.query(`
        INSERT INTO story_sources (
          id, story_id, source_name, source_tier, article_title, article_url,
          final_url, canonical_url, published_at, is_primary_claim_source,
          url_verified, event_verified, claim_verified, content_alignment_score,
          source_publication_date_local, source_role, event_match_score,
          supported_core_claim_ids, created_at
        ) VALUES (
          $1, $2, $3, 'TIER_1', $4, $5,
          $5, $5, $6, true,
          true, true, true, 95,
          $7, 'PRIMARY', 95,
          '{}', now()
        )
        ON CONFLICT (story_id, article_url) DO NOTHING;
      `, [
        sourceCitationId, s.id, defaultSource.name, s.sourceTitle, s.sourceUrl,
        s.pubDate + 'T07:00:00Z', s.pubDate,
      ]);
    }
    console.log(`[Seed] Seeded ${historicalStories.length} historical intelligence stories.`);

    // 4. Define the 4 Weekly Reports (W41, W40, W39, W38)
    const reportsToInsert = [
      // === WEEK 41 (2026-10-05 to 2026-10-11) ===
      {
        id: '3deb34aa-9b94-45a2-a279-e9e2f3d1af6d',
        year: 2026,
        weekNumber: 41,
        startDate: '2026-10-05',
        endDate: '2026-10-11',
        title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 41, 2026',
        slug: '2026-w41',
        executiveSummary: INITIAL_WEEKLY_REPORTS[0].executiveSummary,
        topDevelopments: INITIAL_WEEKLY_REPORTS[0].topDevelopments,
        topOpportunities: INITIAL_WEEKLY_REPORTS[0].topBusinessOpportunities,
        macroPolicy: INITIAL_WEEKLY_REPORTS[0].macroPolicy,
        maInvestment: INITIAL_WEEKLY_REPORTS[0].maInvestment,
        japaneseCompanies: INITIAL_WEEKLY_REPORTS[0].japaneseCompanies,
        tradingHouses: INITIAL_WEEKLY_REPORTS[0].japaneseTradingHouses,
        vietnamCorporateWatch: INITIAL_WEEKLY_REPORTS[0].vietnamCorporateWatch,
        sectorIntelligence: INITIAL_WEEKLY_REPORTS[0].sectorIntelligence,
        risksAnalysis: INITIAL_WEEKLY_REPORTS[0].risksAnalysis,
        sojitzWatchList: INITIAL_WEEKLY_REPORTS[0].whatSojitzShouldWatch,
        suggestedBdActions: INITIAL_WEEKLY_REPORTS[0].suggestedBdActions,
        curatedStoryIds: [
          'af381a91-be25-40c7-825c-ffd99eae1934',
          '74e32d9d-d434-4949-a550-f43f0072d79f',
          '5bad090d-195a-49e2-9b72-ec952c3be122',
        ],
      },

      // === WEEK 40 (2026-09-28 to 2026-10-04) ===
      {
        id: '40404040-4040-4040-4040-404040404040',
        year: 2026,
        weekNumber: 40,
        startDate: '2026-09-28',
        endDate: '2026-10-04',
        title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 40, 2026',
        slug: '2026-w40',
        executiveSummary: 'Week 40 was defined by landmark policy breakthroughs and major Japanese competitor capital deployment in Vietnam. Most notably, the Prime Minister promulgated Decree 80 on Direct Power Purchase Agreements (DPPA), creating an immediate legal gateway for corporate renewable energy off-take. Concurrently, Sumitomo Corporation broke ground on its $4.2B North Hanoi Smart City project, setting a new benchmark for integrated urban-industrial developments. In the private sector, Masan finalized $250M from Bain Capital and indicated appetite for strategic Japanese logistics tie-ups, while FPT activated its $200M Da Nang AI Factory with Nvidia.',
        topDevelopments: [
          {
            title: 'Promulgation of DPPA Decree No. 80/2024/ND-CP Accelerates Clean Power for Industrial Parks',
            summary: 'Opens direct electricity trade between renewable IPPs and industrial consumers, fundamentally transforming corporate sustainability procurement in Vietnam.',
            significance: 'Enables Sojitz to guarantee clean power to Long Duc IP tenants, securing a decisive leasing edge over regional competitors.',
            storyId: '11111111-0401-4444-8888-000000000001',
          },
          {
            title: 'Sumitomo Corporation Breaks Ground on $4.2B North Hanoi Smart City Project',
            summary: 'Commenced 272-hectare mixed-use smart township in Dong Anh with a 100MW microgrid and modern Japanese commercial district.',
            significance: 'Signals Sumitomo aggressive push to dominate the northern FDI industrial and executive living ecosystem.',
            storyId: '11111111-0402-4444-8888-000000000002',
          },
          {
            title: 'Mitsui & Co. and Petrovietnam Sign $740M Block B Gas Pipeline Package',
            summary: 'Petrovietnam and Mitsui unit MOECO awarded major EPC contracts for the pipeline connecting Block B to Can Tho.',
            significance: 'Accelerates the timeline for southwest gas baseload power, creating industrial spin-offs in Can Tho.',
            storyId: '11111111-0403-4444-8888-000000000003',
          },
        ],
        topOpportunities: [
          {
            headline: 'Rooftop Solar & Microgrid DPPA Rollout for Long Duc IP',
            targetCompanyOrProject: 'Long Duc Industrial Park Phase 1 & 2 Tenants',
            sector: 'Renewable Energy & Industrial Parks',
            strategicRationale: 'Take immediate advantage of Decree 80 to establish private-wire and synthetic DPPA contracts with Japanese electronics tenants needing RE100 compliance.',
            actionWindow: 'Q4 2026 - Q1 2027',
            storyId: '11111111-0401-4444-8888-000000000001',
          },
          {
            headline: 'Strategic Partnership with Masan Logistics (Supra)',
            targetCompanyOrProject: 'Masan Group / WinCommerce',
            sector: 'Logistics & Retail FMCG',
            strategicRationale: 'Co-invest in modern cold chain and automated distribution centers to distribute Sojitz food and consumer products across WinMart nationwide network.',
            actionWindow: 'Next 60 Days',
            storyId: '11111111-0404-4444-8888-000000000004',
          },
          {
            headline: 'Polypropylene Off-take Mandate with Stavian Quang Yen',
            targetCompanyOrProject: 'Stavian Group',
            sector: 'Plastics & Chemicals',
            strategicRationale: 'Secure export marketing rights and domestic distribution allocation for 600k MT/year PP plant prior to mechanical completion.',
            actionWindow: 'Q4 2026',
            storyId: '11111111-0405-4444-8888-000000000005',
          },
        ],
        macroPolicy: 'Macroeconomic indicators for Q3 2026 demonstrate Vietnam GDP growth at 7.4% year-on-year, propelled by electronics processing exports and surging FDI disbursements ($17.3B YTD, +8.9%). The State Bank of Vietnam (SBV) has maintained policy rates steady to support credit expansion while stabilizing the VND against the USD. Decree 80 (DPPA) is the chief regulatory breakthrough, with implementing circulars from MOIT expected by late October.',
        maInvestment: 'Total announced M&A and strategic capital deployment reached $1.8B this week. Major transactions were anchored by private equity follow-ons (Bain Capital into Masan) and industrial joint ventures (Becamex-Sembcorp $1.2B pact, Sumitomo-BRG). Japanese investors represent 38% of cross-border equity transactions.',
        japaneseCompanies: 'Japanese corporate presence continues to tilt toward high-value infrastructure, green transition, and precision manufacturing. Over 2,100 Japanese enterprises are currently active in Vietnam. Major manufacturers report increasing pressure from Tokyo headquarters to procure 100% renewable power, elevating the urgency of the DPPA decree.',
        tradingHouses: 'Sogo Shosha peers are accelerating large-scale infrastructure footprint: Sumitomo is scaling northern smart townships; Mitsui is locking in deep-water gas and healthcare assets; Marubeni is expanding paper containerboard recycling in Ba Ria - Vung Tau; and Mitsubishi is deepening partnerships with domestic conglomerates. Sojitz must defend its leadership in retail food distribution and industrial park management.',
        vietnamCorporateWatch: 'Vingroup continues prioritizing VinFast capital re-engineering while localizing battery lines in Hai Phong. Masan has successfully deleveraged with private equity support and is preparing retail spinoffs. Hoa Phat is on track to commission Dung Quat 2 in early 2027, reshaping regional steel dynamics. FPT is emerging as an AI semiconductor and cloud powerhouse with Nvidia backing.',
        sectorIntelligence: [
          {
            sectorName: 'Industrial Parks',
            keyTrend: 'Surge in Eco-Industrial Park (EIP) certification and tenant demand for net-zero manufacturing plots.',
            implication: 'Standard industrial land without green power and water treatment will experience declining pricing power.',
          },
          {
            sectorName: 'Renewable Energy',
            keyTrend: 'Transition from FIT subsidies to market-based direct bilateral contracts (DPPA).',
            implication: 'Requires sophisticated power trading and contract-for-difference (CfD) structuring expertise.',
          },
          {
            sectorName: 'Plastics & Chemicals',
            keyTrend: 'Domestic substitution of imported polyolefins via Stavian and Long Son Petrochemical complexes.',
            implication: 'Trading margins on generic resins will compress; Sojitz must pivot toward specialized technical polymers and recycled resins.',
          },
        ],
        risksAnalysis: '1. Grid Wheeling Bottlenecks: EVN grid transmission fees for synthetic DPPA wheeling could dampen financial returns if MOIT guidance is delayed. 2. Industrial Land Pricing: Southern land rental rates (Dong Nai, Binh Duong) have risen 12% YoY, posing leasing challenges for cost-sensitive Japanese SME tenants. 3. Counterparty Leverage: Selected domestic champions carry significant debt service burdens; supplier trade credit must be strictly monitored.',
        sojitzWatchList: '1. Upcoming MOIT Circular detailing synthetic DPPA wheeling tariff formulas and EVN grid charges. 2. Final investment decision on Long Duc Industrial Park Phase 2 land acquisition approvals. 3. Marubeni and Mitsui next moves in southern LNG import terminal development. 4. Stavian trial run milestones in Quang Ninh.',
        suggestedBdActions: [
          {
            action: 'Form Sojitz Vietnam DPPA Taskforce',
            targetPartnerOrSector: 'Long Duc IP Tenants & Sojitz Green Energy',
            priority: 'HIGH',
            responsibleDivision: 'Energy & Infrastructure Division',
            expectedOutcome: 'Sign initial 30MW DPPA letters of intent with top 5 Japanese tenants by end-November.',
          },
          {
            action: 'Engage Masan Group C-Suite on Supra Logistics Tie-up',
            targetPartnerOrSector: 'Masan Group / WinCommerce',
            priority: 'HIGH',
            responsibleDivision: 'Retail & Consumer Division',
            expectedOutcome: 'Schedule exploratory working session in HCMC to evaluate joint distribution venture.',
          },
          {
            action: 'Pitch Stavian on Overseas Polymer Export Agency',
            targetPartnerOrSector: 'Stavian Petrochemical',
            priority: 'MEDIUM',
            responsibleDivision: 'Chemicals & Plastics Division',
            expectedOutcome: 'Secure off-take agency terms for 50,000 MT/year PP for Japanese automotive molding clients.',
          },
        ],
        curatedStoryIds: [
          '11111111-0401-4444-8888-000000000001',
          '11111111-0402-4444-8888-000000000002',
          '11111111-0403-4444-8888-000000000003',
          '11111111-0404-4444-8888-000000000004',
          '11111111-0405-4444-8888-000000000005',
        ],
      },

      // === WEEK 39 (2026-09-21 to 2026-09-27) ===
      {
        id: '39393939-3939-3939-3939-393939393939',
        year: 2026,
        weekNumber: 39,
        startDate: '2026-09-21',
        endDate: '2026-09-27',
        title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 39, 2026',
        slug: '2026-w39',
        executiveSummary: 'Week 39 spotlighted pivotal advances in northern deep-sea maritime logistics, semiconductor ecosystem expansion, and domestic conglomerate balance sheet restructuring. In Hai Phong, groundbreaking occurred on Berths 7 & 8 at Lach Huyen Deep-Sea Port ($450M), boosting northern Vietnam direct shipping connectivity to the US and Europe. Renesas Electronics expanded automotive chip design operations in Da Nang and HCMC with FPT. Meanwhile, Novaland finalized credit syndication for Aqua City in Dong Nai, easing regional debt contagion risks surrounding southern industrial corridors. In consumer retail, Masan accelerated chilled meat cold chain distribution across 1,200 supermarkets nationwide.',
        topDevelopments: [
          {
            title: 'Lach Huyen Deep-Sea Port Berths 7 & 8 Groundbreaking: Northern Vietnam Logistics Capacity Surges',
            summary: 'Groundbreaking on $450M berths capable of handling 18,000 TEU container ships directly connecting Northern Vietnam to Western export markets without regional transshipment.',
            significance: 'Critical logistics breakthrough for Sojitz trade routes. Shortens ocean transit times for export manufacturers in northern industrial parks.',
            storyId: '22222222-0391-4444-8888-000000000001',
          },
          {
            title: 'Renesas Electronics and FPT Software Expand Automotive Semiconductor R&D Hubs in Vietnam',
            summary: 'Renesas expanded embedded automotive software and MCU design centers across Da Nang and HCMC, growing specialized local engineering headcount to 1,500.',
            significance: 'Signals rapid elevation of Vietnam position in precision global automotive electronics supply chains.',
            storyId: '22222222-0392-4444-8888-000000000002',
          },
          {
            title: 'Novaland Finalizes Debt Restructuring for Aqua City Infrastructure with Domestic Banking Consortium',
            summary: 'Completed 5-year debt extension with domestic commercial lenders, resuming critical arterial bridge and water utility works in Dong Nai.',
            significance: 'Relieves property sector stress and clears municipal infrastructure bottlenecks near Sojitz Long Duc Industrial Park.',
            storyId: '22222222-0393-4444-8888-000000000003',
          },
        ],
        topOpportunities: [
          {
            headline: 'Bonded Warehouse and Port Logistics Joint Venture at Lach Huyen',
            targetCompanyOrProject: 'Hateco Port / Hai Phong Port Authority',
            sector: 'Logistics & Seaports',
            strategicRationale: 'Partner with port operators to establish dedicated temperature-controlled bonded warehouses for Japanese chemical and automotive parts distributors.',
            actionWindow: 'Q4 2026',
            storyId: '22222222-0391-4444-8888-000000000001',
          },
          {
            headline: 'Chilled FMCG Co-Distribution Agreement with Masan MEATDeli',
            targetCompanyOrProject: 'Masan Group / WinCommerce',
            sector: 'Retail & Consumer Goods',
            strategicRationale: 'Leverage Masan newly expanded cold chain distribution network to market premium Japanese food and packaged goods nationwide.',
            actionWindow: 'Next 45 Days',
            storyId: '22222222-0394-4444-8888-000000000004',
          },
          {
            headline: 'Da Nang High-Tech Industrial Zone Expansion for Chip Packaging',
            targetCompanyOrProject: 'Da Nang High-Tech Park Authority',
            sector: 'Industrial Parks & High-Tech',
            strategicRationale: 'Explore ready-built factory (RBF) lease facilities tailored for Japanese semiconductor materials and testing vendors expanding near Renesas and FPT hubs.',
            actionWindow: 'Q1 2027',
            storyId: '22222222-0395-4444-8888-000000000005',
          },
        ],
        macroPolicy: 'The National Assembly economic committee reviewed draft amendments to the Law on Investment and Law on Bidding, aimed at streamlining approvals for strategic mega-infrastructure projects and high-tech parks. Exchange rates stabilized at 24,950 VND/USD following calibrated liquidity management by the SBV. Industrial manufacturing output (IIP) expanded 8.6% year-on-year, led by electronics and chemical processing.',
        maInvestment: 'Domestic corporate bond refinancing registered significant positive developments, with $1.2B in real estate and infrastructure corporate bonds successfully restructured without defaults. Japanese strategic investment focused on semiconductor services and cold chain logistics, accounting for 32% of announced capital inflows during the week.',
        japaneseCompanies: 'Japanese tech and automotive suppliers are reinforcing their presence. In addition to Renesas expansion, automotive component makers are deepening localization of wire harnesses and motor parts to satisfy European and Japanese origin rules. Japanese SME tenant inquiries for ready-built factories in Dong Nai and Hai Phong rose 15% month-on-month.',
        tradingHouses: 'Marubeni concluded preliminary environmental impact studies for its bio-coal and biomass pellet sourcing network in Central Vietnam. Sumitomo accelerated site clearance for the Vinh Phuc Smart Logistics Center (ICD). Sojitz holds strong positioning in consumer goods and industrial park operations, but needs faster pace in green energy utility services.',
        vietnamCorporateWatch: 'Vingroup announced VinFast reached cash flow breakeven in domestic EV deliveries, supporting parent credit ratings. FPT completed AI cloud integration with regional enterprise clients. Hoa Phat maintained 92% capacity utilization across flat steel rolling mills. Stavian prepared international roadshows for its planned IPO.',
        sectorIntelligence: [
          {
            sectorName: 'Logistics & Ports',
            keyTrend: 'Expansion of deep-sea direct shipping berths bypassing regional transshipment hubs in Singapore and Hong Kong.',
            implication: 'Port tariffs for northern gateway shipping will stabilize; container handling speed becomes key competitive differentiator.',
          },
          {
            sectorName: 'Semiconductors',
            keyTrend: 'Rapid shift from basic packaging and assembly to complex IC design and automotive embedded firmware.',
            implication: 'Higher requirement for uninterrupted, high-quality power supply and clean room facilities in industrial parks.',
          },
          {
            sectorName: 'Food & Cold Chain',
            keyTrend: 'Aggressive consolidation of chilled food logistics by domestic leaders like Masan and CP Vietnam.',
            implication: 'Independent cold storage operators face pressure unless integrated with national retail chains.',
          },
        ],
        risksAnalysis: '1. Skilled Labor Shortage: Accelerated semiconductor R&D expansion is creating wage inflation for specialized electrical and software engineers. 2. Regional Traffic Congestion: Heavy truck traffic along National Highway 51 and Hai Phong beltways requires careful logistics routing during peak export weeks. 3. Power Quality: Fluctuations in provincial 110kV feeder lines pose operational risks for precision semiconductor testing.',
        sojitzWatchList: '1. Official publication of revised land valuation tables by Dong Nai Provincial People Committee. 2. Groundbreaking schedule for Lach Huyen logistics zone Phase 2. 3. FPT and Renesas talent development MoUs with regional engineering universities. 4. WinCommerce supplier contract renewals for 2027.',
        suggestedBdActions: [
          {
            action: 'Initiate Discussions with Hateco Port on Container Yard Allocation',
            targetPartnerOrSector: 'Hateco Logistics / Lach Huyen Port',
            priority: 'HIGH',
            responsibleDivision: 'Logistics Division',
            expectedOutcome: 'Secure 5,000 sqm dedicated bonded storage allocation for Japanese industrial clients by year-end.',
          },
          {
            action: 'Present Joint Cold-Chain Retail Proposal to Masan Consumer C-Suite',
            targetPartnerOrSector: 'Masan Group / WinCommerce',
            priority: 'HIGH',
            responsibleDivision: 'Retail & Consumer Division',
            expectedOutcome: 'Finalize terms of reference for collaborative distribution of imported chilled products.',
          },
          {
            action: 'Assess High-Tech RBF Feasibility in Dong Nai',
            targetPartnerOrSector: 'Long Duc Industrial Park Board',
            priority: 'MEDIUM',
            responsibleDivision: 'Industrial Parks Division',
            expectedOutcome: 'Deliver commercial viability study for 30,000 sqm precision electronics ready-built factory cluster.',
          },
        ],
        curatedStoryIds: [
          '22222222-0391-4444-8888-000000000001',
          '22222222-0392-4444-8888-000000000002',
          '22222222-0393-4444-8888-000000000003',
          '22222222-0394-4444-8888-000000000004',
          '22222222-0395-4444-8888-000000000005',
        ],
      },

      // === WEEK 38 (2026-09-14 to 2026-09-20) ===
      {
        id: '38383838-3838-3838-3838-383838383838',
        year: 2026,
        weekNumber: 38,
        startDate: '2026-09-14',
        endDate: '2026-09-20',
        title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 38, 2026',
        slug: '2026-w38',
        executiveSummary: 'Week 38 was characterized by swift government disaster mitigation in the aftermath of Typhoon Yagi, decisive progress in major industrial energy projects, and rapid commercial expansion by domestic conglomerates. The Prime Minister promulgated Directive 35 unleashing a $1.2B relief and infrastructure restoration package, restoring northern industrial corridor logistics within 72 hours. Sumitomo and BRG launched leasing for North Hanoi Tech Park Phase 1. Concurrently, Hoa Phat completed initial blast furnace testing at the $3.5B Dung Quat 2 steel complex, and Stavian Chemical secured a 200,000 MT/year master polymer feedstock distribution agreement with Long Son Petrochemicals.',
        topDevelopments: [
          {
            title: 'Typhoon Yagi Aftermath: Government Launches $1.2B Industrial Corridor Restoration & Resilience Package',
            summary: 'Mobilized emergency credit, customs fast-tracking, and power grid rehabilitation across northern industrial corridors, restoring production within 72 hours.',
            significance: 'Demonstrates robust state governance resilience and ensures continuity for critical export supply chains.',
            storyId: '33333333-0381-4444-8888-000000000001',
          },
          {
            title: 'Sumitomo Corporation and BRG Group Commence Commercial Leasing for North Hanoi Tech Park Phase 1',
            summary: 'Opened reservations for 50 hectares of dedicated high-tech R&D and clean manufacturing plots equipped with 110kV dedicated power connections.',
            significance: 'Elevates regional competition for Japanese electronics and precision automotive clients looking for northern industrial land.',
            storyId: '33333333-0382-4444-8888-000000000002',
          },
          {
            title: 'Hoa Phat Dung Quat 2 Mega Steel Complex Completes Blast Furnace No. 1 Testing Ahead of Schedule',
            summary: 'Completed hot testing for Blast Furnace No. 1, paving the way for 5.6M tons/year of domestic hot-rolled coil (HRC) production.',
            significance: 'Strengthens domestic steel supply chain security and reduces dependence on imported Chinese steel for manufacturing clients.',
            storyId: '33333333-0383-4444-8888-000000000003',
          },
        ],
        topOpportunities: [
          {
            headline: 'Emergency Industrial Park Disaster Resilience Audits & Microgrid Retrofitting',
            targetCompanyOrProject: 'Long Duc Industrial Park & Southern Industrial Tenants',
            sector: 'Industrial Parks & Energy',
            strategicRationale: 'Deploy resilience audits, rooftop storm reinforcement, and auxiliary diesel-solar microgrids for Japanese tenants seeking high-uptime guarantees.',
            actionWindow: 'Immediate (Next 30 Days)',
            storyId: '33333333-0381-4444-8888-000000000001',
          },
          {
            headline: 'Off-take Mandate for Hoa Phat High-Grade HRC Export Distribution',
            targetCompanyOrProject: 'Hoa Phat Group (HPG)',
            sector: 'Metals & Manufacturing',
            strategicRationale: 'Negotiate exclusive regional export agency rights for Dung Quat 2 automotive and container-grade hot-rolled coil to Japan and ASEAN markets.',
            actionWindow: 'Q4 2026',
            storyId: '33333333-0383-4444-8888-000000000003',
          },
          {
            headline: 'Polymer Distribution Agreement with Stavian for Southern Plastic Converters',
            targetCompanyOrProject: 'Stavian Chemical / Long Son Petrochemicals',
            sector: 'Plastics & Chemicals',
            strategicRationale: 'Partner with Stavian to supply locally produced PP/PE resins from Long Son complex to Japanese injection molding clients in Dong Nai and Binh Duong.',
            actionWindow: 'Q4 2026',
            storyId: '33333333-0384-4444-8888-000000000004',
          },
        ],
        macroPolicy: 'State Bank of Vietnam kept the benchmark refinancing rate at 4.5% while deploying targeted credit lines to assist storm-affected agricultural and manufacturing exporters. Government tax authorities implemented automatic 6-month deferrals on corporate income tax and land rental fees for manufacturing plants located in disaster-declared northern provinces.',
        maInvestment: 'Cross-border M&A discussions showed strong resilience with multinational manufacturing conglomerates reaffirming long-term capital expenditure commitments. Japanese and Taiwanese electronics firms confirmed zero cancellation of planned factory expansions, citing rapid infrastructure recovery by provincial utilities.',
        japaneseCompanies: 'Over 98% of Japanese factories in Hai Phong, Hai Duong, and Bac Ninh returned to full operational capacity within 4 days following storm passage. JETRO commended Vietnamese provincial authorities for rapid emergency electrical line restoration and prioritized customs processing at Hai Phong seaports.',
        tradingHouses: 'Mitsui & Co. finalized FEED engineering milestones for its southern offshore gas pipeline network. Itochu expanded apparel sourcing contracts from compliant sustainable textile mills in Central Vietnam. Sojitz demonstrated superior operational resilience at Long Duc IP, maintaining uninterrupted utility services throughout the period.',
        vietnamCorporateWatch: 'Hoa Phat steel operations outperformed market expectations with rising domestic margins. Stavian expanded its downstream plastic distribution partnerships with SCG Long Son. Vinamilk reported 6.8% YoY growth in domestic dairy sales, supported by expanding modern retail channels. THACO Auto prepared launch of new commercial EV transport trucks.',
        sectorIntelligence: [
          {
            sectorName: 'Manufacturing Resilience',
            keyTrend: 'Severe weather events accelerating tenant demand for climate-resilient industrial infrastructure with underground cabling.',
            implication: 'Industrial parks with reinforced drainage, dual-redundant grid feeders, and water retention lakes command premium rental rates.',
          },
          {
            sectorName: 'Metals & Heavy Industry',
            keyTrend: 'Commercial launch of Dung Quat 2 will displace 3M+ tons of imported hot rolled coil annually.',
            implication: 'Domestic steel processing supply chains become faster, cheaper, and less vulnerable to international freight shocks.',
          },
          {
            sectorName: 'Chemicals & Resins',
            keyTrend: 'Domestic commercial production from Long Son Petrochemicals restructuring resin trade flows.',
            implication: 'Trading houses must pivot from simple import arbitrage to value-added local warehousing and technical compounding services.',
          },
        ],
        risksAnalysis: '1. Climate Vulnerability: Increasing frequency of extreme weather events requires increased capital expenditure on seawalls, drainage, and backup power generation. 2. Steel Price Volatility: Commissioning of massive domestic HRC capacity could compress domestic steel margins if regional construction demand softens. 3. Feedstock Fluctuations: Petrochemical margins remain vulnerable to crude oil price swings.',
        sojitzWatchList: '1. Final government approval of Decree 80 DPPA implementing circulars. 2. Hoa Phat Dung Quat 2 commercial test run dates and pricing policy. 3. Long Son Petrochemicals commercial run rate milestones. 4. Hai Phong port dredging timeline to maintain 14m draft.',
        suggestedBdActions: [
          {
            action: 'Execute Long Duc IP Climate Resilience & Drainage Inspection',
            targetPartnerOrSector: 'Long Duc Industrial Park Infrastructure Team',
            priority: 'HIGH',
            responsibleDivision: 'Industrial Parks Division',
            expectedOutcome: 'Complete structural audit and present certified flood-resilience report to all tenant CEOs.',
          },
          {
            action: 'Initiate Strategic Sourcing Dialogue with Hoa Phat HRC Sales Team',
            targetPartnerOrSector: 'Hoa Phat Dung Quat 2',
            priority: 'HIGH',
            responsibleDivision: 'Metals Division',
            expectedOutcome: 'Sign trial order for 10,000 MT specialized HRC for Japanese automotive supplier evaluations.',
          },
          {
            action: 'Explore Resin Warehouse Partnership with Stavian in Ba Ria - Vung Tau',
            targetPartnerOrSector: 'Stavian Chemical',
            priority: 'MEDIUM',
            responsibleDivision: 'Chemicals & Plastics Division',
            expectedOutcome: 'Assess feasibility of 15,000 MT polymer storage hub near Cai Mep port.',
          },
        ],
        curatedStoryIds: [
          '33333333-0381-4444-8888-000000000001',
          '33333333-0382-4444-8888-000000000002',
          '33333333-0383-4444-8888-000000000003',
          '33333333-0384-4444-8888-000000000004',
        ],
      },
    ];

    // 5. Insert or update the reports in PostgreSQL
    for (const r of reportsToInsert) {
      await client.query(`
        INSERT INTO weekly_reports (
          id, year, week_number, start_date, end_date, title, slug,
          executive_summary, top_developments, top_opportunities,
          macro_policy, ma_investment, japanese_companies, trading_houses,
          vietnam_corporate_watch, sector_intelligence, risks_analysis,
          sojitz_watch_list, suggested_bd_actions, curated_story_ids,
          is_published, published_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17,
          $18, $19, $20,
          true, $21, now(), now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          year = EXCLUDED.year,
          week_number = EXCLUDED.week_number,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          title = EXCLUDED.title,
          executive_summary = EXCLUDED.executive_summary,
          top_developments = EXCLUDED.top_developments,
          top_opportunities = EXCLUDED.top_opportunities,
          macro_policy = EXCLUDED.macro_policy,
          ma_investment = EXCLUDED.ma_investment,
          japanese_companies = EXCLUDED.japanese_companies,
          trading_houses = EXCLUDED.trading_houses,
          vietnam_corporate_watch = EXCLUDED.vietnam_corporate_watch,
          sector_intelligence = EXCLUDED.sector_intelligence,
          risks_analysis = EXCLUDED.risks_analysis,
          sojitz_watch_list = EXCLUDED.sojitz_watch_list,
          suggested_bd_actions = EXCLUDED.suggested_bd_actions,
          curated_story_ids = EXCLUDED.curated_story_ids,
          is_published = true,
          published_at = EXCLUDED.published_at,
          updated_at = now();
      `, [
        r.id, r.year, r.weekNumber, r.startDate, r.endDate, r.title, r.slug,
        r.executiveSummary, JSON.stringify(r.topDevelopments), JSON.stringify(r.topOpportunities),
        r.macroPolicy, r.maInvestment, r.japaneseCompanies, r.tradingHouses,
        r.vietnamCorporateWatch, JSON.stringify(r.sectorIntelligence), r.risksAnalysis,
        r.sojitzWatchList, JSON.stringify(r.suggestedBdActions), r.curatedStoryIds,
        r.endDate + 'T18:00:00Z',
      ]);
      console.log(`[Seed] Seeded weekly report: ${r.slug} (${r.title})`);
    }

    await client.query('COMMIT');
    console.log('[Seed] All historical stories and weekly reports committed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed] Error seeding historical reports:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
