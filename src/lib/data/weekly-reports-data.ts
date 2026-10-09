import { WeeklyReport } from '@/types/report';

export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [
  // === WEEK 41 (2026-10-05 to 2026-10-11) ===
  {
    id: 'rep-2026-w41',
    year: 2026,
    weekNumber: 41,
    startDate: '2026-10-05',
    endDate: '2026-10-11',
    title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 41, 2026',
    slug: '2026-w41',
    executiveSummary: 'During Week 41 (2026-10-05 to 2026-10-11), Vietnam\'s market demonstrated decisive policy and industrial shifts across foreign investment strategy, high-tech supply chains, energy cost controls, and medical manufacturing. Sojitz Vietnam monitored 20 verified developments. Key structural highlights include Vietnam\'s official FDI strategic pivot mandating domestic vendor integration, pilot launch of the low-altitude drone economy in Dien Bien, price freezes on retail power tariffs through Q4 to curb inflation, a state-academia-industry Triple Helix roadmap for semiconductors, and licensing of a $44.5M GMP medical plant in Ninh Binh.',
    topDevelopments: [
      {
        title: 'Vietnam Shifts FDI Strategy Toward High-Tech Investment and Stronger Domestic Linkages',
        storyId: '11111111-0411-4444-8888-000000000005',
        summary: 'Deputy Minister Tran Quoc Phuong announced Vietnam\'s strategic shift in FDI attraction from low-cost assembly to selective high-tech manufacturing, mandating technology transfer and binding supply chain linkages with Vietnamese Tier-1 and Tier-2 suppliers.',
        significance: 'Critical strategic opportunity for Sojitz as an industrial park developer (Long Duc IP) and trading house to bridge Japanese multinational tenants with vetted Vietnamese manufacturers.'
      },
      {
        title: 'Vietnam Pilots Low-Altitude Economy in Dien Bien Using Drones',
        storyId: '11111111-0411-4444-8888-000000000001',
        summary: 'Vietnam completed over 6,000 UAV/drone test flights in Dien Bien under Ministry of Science and Technology guidance, establishing the country\'s first experimental regulatory sandbox for commercial drone cargo and remote logistics.',
        significance: 'Opens future feeder logistics and rapid automated inventory transport corridors for Sojitz logistics facilities and regional retail distribution.'
      },
      {
        title: 'Power Tariffs to Be Frozen, Service Fee Hikes Capped to Curb Inflation',
        storyId: '11111111-0411-4444-8888-000000000003',
        summary: 'Ministry of Finance and Steering Committee for Price Management froze electricity retail tariffs and capped public service fees for Q4 2026 to ensure inflation remains below the 4.5% statutory cap.',
        significance: 'Provides utility cost stability for Long Duc IP tenants in Q4, while accelerating tenant appetite for private rooftop solar and DPPA solutions ahead of expected 2027 rate adjustments.'
      },
      {
        title: 'Ninh Binh Approves $44.5 Million GMP Medical Manufacturing Plant',
        storyId: '11111111-0411-4444-8888-000000000002',
        summary: 'Provincial authorities approved a VND 1.1 trillion ($44.5M) WHO-GMP medical supplies, pharma, and health supplement production facility by EMJ Ha Nam in Kim Binh Industrial Cluster.',
        significance: 'High strategic relevance for Sojitz Healthcare Division and specialized cold-chain pharmaceutical distribution.'
      },
      {
        title: 'Triple Helix Collaboration Roadmap Established for Semiconductors',
        storyId: '11111111-0411-4444-8888-000000000004',
        summary: 'Symposium in Da Nang launched a State-Academia-Industry Triple Helix roadmap executing Decisions 1018 and 1017 to train 50,000 engineers and establish semiconductor test facilities by 2030.',
        significance: 'Expands Vietnam\'s semiconductor ecosystem, creating demand for cleanrooms, high-purity chemicals, and Japanese precision machinery.'
      }
    ],
    topBusinessOpportunities: [
      {
        sector: 'Industrial Parks & Supply Chain',
        headline: 'Sojitz Supplier Localization Desk at Long Duc IP',
        actionWindow: 'Immediate (Q4 2026)',
        strategicRationale: 'Leverage the Ministry of Planning and Investment\'s new high-tech FDI mandate by establishing a dedicated localization desk to match Japanese tenants with certified local Tier-1/Tier-2 suppliers.',
        targetCompanyOrProject: 'Long Duc Industrial Park & Domestic Vendor Network',
        storyId: '11111111-0411-4444-8888-000000000005',
      },
      {
        sector: 'Healthcare & Pharma',
        headline: 'Pharma Cold-Chain & Medical Chemical Distribution',
        actionWindow: 'Q4 2026 - Q1 2027',
        strategicRationale: 'Partner with newly approved GMP pharmaceutical facilities in Northern industrial clusters for specialized distribution and raw materials supply.',
        targetCompanyOrProject: 'EMJ Ha Nam & Northern GMP Medical Cluster',
        storyId: '11111111-0411-4444-8888-000000000002',
      },
      {
        sector: 'Renewable Energy',
        headline: 'Direct Power Purchase Agreement (DPPA) Rooftop Expansion',
        actionWindow: 'Q4 2026',
        strategicRationale: 'Industrial park tenants seeking off-site renewable power offtake agreements under Decree 80/2024/ND-CP framework to hedge against future electricity rate hikes.',
        targetCompanyOrProject: 'Long Duc Industrial Park Rooftop Solar',
        storyId: '11111111-0401-4444-8888-000000000001',
      }
    ],
    macroPolicy: 'Macroeconomic indicators reflect steady GDP growth (6.8% YoY) with stable FX reserves. The State Bank of Vietnam maintained policy rates, prioritizing credit flow into green manufacturing and export-oriented processing.',
    maInvestment: 'Cross-border M&A transactions accelerated in logistics and consumer manufacturing, with Japanese, Singaporean, and domestic conglomerates deploying capital into joint ventures.',
    japaneseCompanies: 'Japanese manufacturers continued diversifying production into Northern and Southern industrial corridors, emphasizing carbon-neutral factory operations and automated assembly.',
    japaneseTradingHouses: 'Peer Sogo Shosha (Mitsubishi, Mitsui, Sumitomo, Marubeni, Itochu, Toyota Tsusho) intensified engagement in LNG receiving infrastructure, offshore wind feasibility studies, and retail logistics hubs.',
    vietnamCorporateWatch: 'Domestic conglomerates (Vingroup, Masan, THACO, Hoa Phat, Becamex) expanded manufacturing localization and sought Japanese technology partners for green transition.',
    sectorIntelligence: [
      {
        keyTrend: 'DPPA secondary market guidelines issued; renewable developers accelerating grid-tied capacity.',
        sectorName: 'Energy & Renewables',
        implication: 'Accelerates rooftop solar offtake contracts across tenant industrial facilities.'
      },
      {
        keyTrend: 'Occupancy rates in Tier-1 provinces reached 86%; eco-industrial park certifications driving tenant premiums.',
        sectorName: 'Industrial Parks',
        implication: 'Supports Long Duc Industrial Park positioning and tariff adjustments.'
      },
      {
        keyTrend: 'Polymer demand rebound in packaging and electronics compounding.',
        sectorName: 'Chemicals & Plastics',
        implication: 'Strengthens import distribution volumes for Sojitz Plastics Vietnam.'
      },
      {
        keyTrend: 'Modern trade penetration climbing, driven by convenience store expansion in suburban hubs.',
        sectorName: 'Food & Retail',
        implication: 'Enhances Huong Thuy wholesale distribution volume and retail partnership margins.'
      }
    ],
    risksAnalysis: 'Grid transmission bottlenecks in central provinces, seasonal container freight rate volatility, and regulatory processing timelines for foreign land lease approvals remain key headwinds.',
    whatSojitzShouldWatch: 'Active surveillance maintained on Long Duc Industrial Park Phase 2 land clearance, Phu My 3 BOT handover operational procedures, and Huong Thuy cold-chain fleet upgrades.',
    suggestedBdActions: [
      {
        action: 'Initiate DPPA offtake discussions with top-tier tenant prospects across industrial parks.',
        priority: 'HIGH',
        expectedOutcome: 'Secure 15-20MW rooftop solar PPA pipeline',
        responsibleDivision: 'Energy Solutions Division',
        targetPartnerOrSector: 'EVN / MOIT / Multinational Tenants'
      },
      {
        action: 'Finalize master plan for eco-industrial park upgrades at Long Duc.',
        priority: 'HIGH',
        expectedOutcome: 'Obtain provincial approval for green infrastructure expansion',
        responsibleDivision: 'Industrial Infrastructure & Logistics',
        targetPartnerOrSector: 'Dong Nai People Committee'
      }
    ],
    curatedStories: [],
    curatedStoryCount: 15,
    isPublished: true,
    publishedAt: '2026-10-08T08:00:00Z',
    generatedAt: '2026-10-08T07:30:00Z',
  },

  // === WEEK 40 (2026-09-28 to 2026-10-04) ===
  {
    id: 'rep-2026-w40',
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
        title: 'Sumitomo Corporation & BRG Group Advance Phase 1 Infrastructure Milestones for $4.2B North Hanoi Smart City',
        summary: 'Following its August ground-breaking, the Sumitomo-BRG joint venture finalized Phase 1 infrastructure approvals and arterial site preparation in early October for the 272-hectare smart city.',
        significance: 'Signals Sumitomo rapid progress in establishing master developer dominance in the high-value Nhat Tan - Noi Bai corridor.',
        storyId: '11111111-0402-4444-8888-000000000002',
      },
      {
        title: 'Mitsui & Co. and Petrovietnam Sign $740M Block B Gas Pipeline Package',
        summary: 'Petrovietnam and Mitsui unit MOECO awarded major EPC contracts for the pipeline connecting Block B to Can Tho.',
        significance: 'Accelerates the timeline for southwest gas baseload power, creating industrial spin-offs in Can Tho.',
        storyId: '11111111-0403-4444-8888-000000000003',
      },
    ],
    topBusinessOpportunities: [
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
    japaneseTradingHouses: 'Sogo Shosha peers are accelerating large-scale infrastructure footprint: Sumitomo is scaling northern smart townships; Mitsui is locking in deep-water gas and healthcare assets; Marubeni is expanding paper containerboard recycling in Ba Ria - Vung Tau; and Mitsubishi is deepening partnerships with domestic conglomerates. Sojitz must defend its leadership in retail food distribution and industrial park management.',
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
    whatSojitzShouldWatch: '1. Upcoming MOIT Circular detailing synthetic DPPA wheeling tariff formulas and EVN grid charges. 2. Final investment decision on Long Duc Industrial Park Phase 2 land acquisition approvals. 3. Marubeni and Mitsui next moves in southern LNG import terminal development. 4. Stavian trial run milestones in Quang Ninh.',
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
    curatedStories: [],
    curatedStoryCount: 10,
    isPublished: true,
    publishedAt: '2026-10-05T06:00:00Z',
    generatedAt: '2026-10-05T05:30:00Z',
  },

  // === WEEK 39 (2026-09-21 to 2026-09-27) ===
  {
    id: 'rep-2026-w39',
    year: 2026,
    weekNumber: 39,
    startDate: '2026-09-21',
    endDate: '2026-09-27',
    title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 39, 2026',
    slug: '2026-w39',
    executiveSummary: 'Week 39 spotlighted pivotal advances in northern deep-sea maritime logistics, semiconductor ecosystem expansion, and domestic conglomerate balance sheet restructuring. In Hai Phong, groundbreaking occurred on Berths 7 & 8 at Lach Huyen Deep-Sea Port ($450M), boosting northern Vietnam direct shipping connectivity to the US and Europe without regional transshipment. Vietnam accelerated its foothold across semiconductor packaging and AI design hubs in Da Nang and HCMC. Meanwhile, Novaland finalized credit syndication for Aqua City in Dong Nai, easing regional debt contagion risks surrounding southern industrial corridors. In consumer retail, Masan accelerated nationwide retail and consumer goods scaling ahead of peak year-end shopping.',
    topDevelopments: [
      {
        title: 'Lach Huyen Deep-Sea Port Berths 7 & 8 Groundbreaking: Northern Vietnam Logistics Capacity Surges',
        summary: 'Groundbreaking on $450M berths capable of handling 18,000 TEU container ships directly connecting Northern Vietnam to Western export markets without regional transshipment.',
        significance: 'Critical logistics breakthrough for Sojitz trade routes. Shortens ocean transit times for export manufacturers in northern industrial parks.',
        storyId: '22222222-0391-4444-8888-000000000001',
      },
      {
        title: 'Vietnam Accelerates Foothold in Global Semiconductor & AI Design Ecosystem Across Da Nang and HCMC Hubs',
        summary: 'Vietnam accelerates expansion across packaging, testing, and chip design hubs in Da Nang and Ho Chi Minh City, with major tech leaders scaling specialized engineering capacity.',
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
    topBusinessOpportunities: [
      {
        headline: 'Bonded Warehouse and Port Logistics Joint Venture at Lach Huyen',
        targetCompanyOrProject: 'Hateco Port / Hai Phong Port Authority',
        sector: 'Logistics & Seaports',
        strategicRationale: 'Partner with port operators to establish dedicated temperature-controlled bonded warehouses for Japanese chemical and automotive parts distributors.',
        actionWindow: 'Q4 2026',
        storyId: '22222222-0391-4444-8888-000000000001',
      },
      {
        headline: 'Joint Retail Distribution Partnership with WinCommerce for Japanese FMCG',
        targetCompanyOrProject: 'Masan Group / WinCommerce',
        sector: 'Retail & Consumer Goods',
        strategicRationale: 'Leverage Masan expanding nationwide retail network and consumer goods logistics to market premium Japanese food and packaged goods ahead of peak year-end demand.',
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
    japaneseTradingHouses: 'Marubeni concluded preliminary environmental impact studies for its bio-coal and biomass pellet sourcing network in Central Vietnam. Sumitomo accelerated site clearance for the Vinh Phuc Smart Logistics Center (ICD). Sojitz holds strong positioning in consumer goods and industrial park operations, but needs faster pace in green energy utility services.',
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
    whatSojitzShouldWatch: '1. Official publication of revised land valuation tables by Dong Nai Provincial People Committee. 2. Groundbreaking schedule for Lach Huyen logistics zone Phase 2. 3. FPT and Renesas talent development MoUs with regional engineering universities. 4. WinCommerce supplier contract renewals for 2027.',
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
    curatedStories: [],
    curatedStoryCount: 8,
    isPublished: true,
    publishedAt: '2026-09-28T06:00:00Z',
    generatedAt: '2026-09-28T05:30:00Z',
  },

  // === WEEK 38 (2026-09-14 to 2026-09-20) ===
  {
    id: 'rep-2026-w38',
    year: 2026,
    weekNumber: 38,
    startDate: '2026-09-14',
    endDate: '2026-09-20',
    title: 'SOJITZ VIETNAM WEEKLY INTELLIGENCE BRIEFING | Week 38, 2026',
    slug: '2026-w38',
    executiveSummary: 'Week 38 was characterized by swift government disaster mitigation in the aftermath of Typhoon Yagi, decisive progress in major industrial energy projects, and rapid commercial expansion by domestic conglomerates. The Prime Minister promulgated Directive 35 unleashing a $1.2B relief and infrastructure restoration package, restoring northern industrial corridor logistics within 72 hours. Sumitomo Corporation and BRG Group accelerated expansion of their FujiMart modern supermarket retail chain in Hanoi. Concurrently, Hoa Phat completed initial blast furnace testing at the $3.5B Dung Quat 2 steel complex, and Stavian Chemical climbed into the Top 15 largest chemical distributors globally in the ICIS ranking.',
    topDevelopments: [
      {
        title: 'Typhoon Yagi Aftermath: Government Launches $1.2B Industrial Corridor Restoration & Resilience Package',
        summary: 'Mobilized emergency credit, customs fast-tracking, and power grid rehabilitation across northern industrial corridors, restoring production within 72 hours.',
        significance: 'Demonstrates robust state governance resilience and ensures continuity for critical export supply chains.',
        storyId: '33333333-0381-4444-8888-000000000001',
      },
      {
        title: 'Sumitomo Corporation and BRG Group Expand FujiMart Supermarket Retail Chain Across Northern Vietnam',
        summary: 'Accelerating expansion of Japanese-standard FujiMart supermarkets across Hanoi and northern provinces, blending Japanese service quality with Vietnamese retail demand.',
        significance: 'Key peer intelligence for Sojitz Food & Retail Consumer Division tracking Japanese trading house modern retail footprints in Vietnam.',
        storyId: '33333333-0382-4444-8888-000000000002',
      },
      {
        title: 'Hoa Phat Dung Quat 2 Mega Steel Complex Completes Blast Furnace No. 1 Testing Ahead of Schedule',
        summary: 'Completed hot testing for Blast Furnace No. 1, paving the way for 5.6M tons/year of domestic hot-rolled coil (HRC) production.',
        significance: 'Strengthens domestic steel supply chain security and reduces dependence on imported Chinese steel for manufacturing clients.',
        storyId: '33333333-0383-4444-8888-000000000003',
      },
    ],
    topBusinessOpportunities: [
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
        headline: 'Strategic Trading & Co-Distribution Collaboration with Stavian Chemical',
        targetCompanyOrProject: 'Stavian Chemical',
        sector: 'Plastics & Chemicals',
        strategicRationale: 'Explore regional trading agency collaboration and supply chain synergies with Stavian following its elevation into the Top 15 largest chemical distributors globally.',
        actionWindow: 'Q4 2026',
        storyId: '33333333-0384-4444-8888-000000000004',
      },
    ],
    macroPolicy: 'State Bank of Vietnam kept the benchmark refinancing rate at 4.5% while deploying targeted credit lines to assist storm-affected agricultural and manufacturing exporters. Government tax authorities implemented automatic 6-month deferrals on corporate income tax and land rental fees for manufacturing plants located in disaster-declared northern provinces.',
    maInvestment: 'Cross-border M&A discussions showed strong resilience with multinational manufacturing conglomerates reaffirming long-term capital expenditure commitments. Japanese and Taiwanese electronics firms confirmed zero cancellation of planned factory expansions, citing rapid infrastructure recovery by provincial utilities.',
    japaneseCompanies: 'Over 98% of Japanese factories in Hai Phong, Hai Duong, and Bac Ninh returned to full operational capacity within 4 days following storm passage. JETRO commended Vietnamese provincial authorities for rapid emergency electrical line restoration and prioritized customs processing at Hai Phong seaports.',
    japaneseTradingHouses: 'Mitsui & Co. finalized FEED engineering milestones for its southern offshore gas pipeline network. Itochu expanded apparel sourcing contracts from compliant sustainable textile mills in Central Vietnam. Sojitz demonstrated superior operational resilience at Long Duc IP, maintaining uninterrupted utility services throughout the period.',
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
    whatSojitzShouldWatch: '1. Final government approval of Decree 80 DPPA implementing circulars. 2. Hoa Phat Dung Quat 2 commercial test run dates and pricing policy. 3. Long Son Petrochemicals commercial run rate milestones. 4. Hai Phong port dredging timeline to maintain 14m draft.',
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
    curatedStories: [],
    curatedStoryCount: 8,
    isPublished: true,
    publishedAt: '2026-09-21T06:00:00Z',
    generatedAt: '2026-09-21T05:30:00Z',
  },
];
