/**
 * Sojitz Vietnam Strategic Knowledge Bank
 * Grounding context for AI Relevance Scoring (1-10) and Suggested BD Action synthesis.
 */

export interface SojitzDivision {
  name: string;
  code: string;
  leadExecutive: string;
  coreFocus: string;
  existingAssetsAndPartnerships: string[];
  strategicPriorities: string[];
  targetPartners: string[];
}

export const SOJITZ_VIETNAM_DIVISIONS: SojitzDivision[] = [
  {
    name: 'Energy Solutions & Renewables',
    code: 'ENERGY',
    leadExecutive: 'General Manager, Energy Division',
    coreFocus: 'Thermal power, LNG receiving terminals, distributed rooftop solar, biomass fuel supply, and DPPA green power purchase agreements.',
    existingAssetsAndPartnerships: [
      'Phu My 3 BOT Gas-fired Power Project (concession transfer)',
      'Rooftop solar distributed generation partnerships for industrial parks',
      'Wood pellet and biomass export supply chain to Japan',
    ],
    strategicPriorities: [
      'Direct Power Purchase Agreement (DPPA) contracts with multinational manufacturers',
      'LNG-to-Power value chain co-investments',
      'Offshore wind concession partnerships and grid connection studies',
      'Biomass fuel sourcing and supply to Japanese coal co-firing plants',
      'Monitoring EVN electricity tariff freezes and utility cost impacts across industrial park tenants',
    ],
    targetPartners: ['EVN', 'PV Gas', 'TTC Green Energy', 'Marubeni', 'JERA', 'Gelex Energy'],
  },
  {
    name: 'Chemicals & Advanced Plastics',
    code: 'CHEMICALS',
    leadExecutive: 'General Manager, Chemicals & Plastics',
    coreFocus: 'Plastics resin trading, polymer masterbatch compounding, technical resins, specialty chemicals, green PET recycling, and industrial fertilizers.',
    existingAssetsAndPartnerships: [
      'Sojitz Plastics Vietnam (sales and logistics network in HCMC and Hanoi)',
      'Japan Vietnam Fertilizer Company (JVF) - NPK chemical fertilizer manufacturing',
      'Polymer resin distribution to Japanese & Korean electronics tier-1 suppliers',
    ],
    strategicPriorities: [
      'Securing PP/PE resin offtake agreements from Long Son Petrochemicals (LSP)',
      'Expansion into circular plastics mechanical recycling for EU/Japan export compliance',
      'High-grade engineering plastics distribution for automotive and semiconductor packaging',
      'Specialty agrochemicals and controlled-release fertilizer distribution',
    ],
    targetPartners: ['Stavian Chemical', 'SCG Chemicals', 'Binh Son Petrochemical (BSR)', 'Nghi Son', 'Dap-Vinachem'],
  },
  {
    name: 'Industrial Infrastructure & Logistics',
    code: 'INFRA_LOGISTICS',
    leadExecutive: 'General Manager, Infrastructure & Urban Development',
    coreFocus: 'Long Duc Industrial Park (Dong Nai) operations, eco-industrial park expansions, cold-chain logistics hubs, bonded warehouses, and port infrastructure.',
    existingAssetsAndPartnerships: [
      'Long Duc Industrial Park (Dong Nai Province) - 282ha Japanese-standard industrial park',
      'Long Duc 2 Industrial Park planning and expansion zone',
      'Cold-chain logistics joint ventures serving modern trade and pharmaceutical imports',
    ],
    strategicPriorities: [
      'Attracting semiconductor, electronics tier-1, and green manufacturing tenants to Long Duc under National Semiconductor Strategy',
      'Co-developing multi-modal logistics centers near Long Thanh International Airport',
      'Deep-water port logistics partnerships in Cai Mep - Thi Vai and Hai Phong',
      'Eco-industrial park accreditation with solar micro-grids and wastewater recycling',
      'Exploring smart distribution, automated delivery, and low-altitude drone logistics models',
      'Aligning industrial park vendor recruitment with Vietnam high-tech FDI and domestic supplier linkage strategy',
    ],
    targetPartners: ['Becamex IDC', 'Viglacera', 'VSIP', 'Saigon Newport (SNP)', 'Gemadept', 'Dong Nai People Committee'],
  },
  {
    name: 'Foods, Agri-Business & Retail Distribution',
    code: 'FOOD_RETAIL',
    leadExecutive: 'General Manager, Consumer & Retail Division',
    coreFocus: 'Huong Thuy wholesale distribution, FMCG supply chain, modern trade retail partnerships, animal feed ingredients, and chilled meat processing.',
    existingAssetsAndPartnerships: [
      'Huong Thuy Manufacture Service Trading Corporation (one of Vietnam largest FMCG distributors)',
      'Ministop Vietnam convenience store chain partnerships',
      'Japan-standard beef fattening and processing joint ventures in Vinh Phuc (Vinabeef with Vilico/Vinamilk)',
    ],
    strategicPriorities: [
      'Scaling nationwide temperature-controlled cold-chain distribution for FMCG',
      'Expanding Vinabeef commercial herd and cold cuts retail distribution into supermarkets',
      'Grain and feed ingredients trading (soybean meal, corn) with leading feed millers',
      'Import and omnichannel distribution of Japanese specialty packaged food brands',
    ],
    targetPartners: ['Masan Consumer', 'WinCommerce', 'Vinamilk / Vilico', 'C.P. Vietnam', 'CJ CheilJedang', 'Aeon Vietnam'],
  },
  {
    name: 'Automotive & Mobility Solutions',
    code: 'AUTOMOTIVE',
    leadExecutive: 'General Manager, Automotive Division',
    coreFocus: 'Commercial vehicle assembly, machinery distribution, electric vehicle fleet solutions, and transport equipment leasing.',
    existingAssetsAndPartnerships: [
      'Commercial truck assembly and distribution partnerships',
      'Automotive component supply chains to Japanese OEMs in Vietnam',
    ],
    strategicPriorities: [
      'Exploring corporate EV commercial fleet charging and logistics conversion',
      'Heavy machinery and industrial forklift leasing for industrial parks and logistics hubs',
    ],
    targetPartners: ['THACO Group', 'Isuzu Vietnam', 'Hino Motors', 'VinFast Commercial'],
  },
  {
    name: 'Healthcare & Life Sciences',
    code: 'HEALTHCARE',
    leadExecutive: 'General Manager, Healthcare & Life Science Division',
    coreFocus: 'Hospital operations, primary care clinics, GMP pharmaceuticals, medical devices, functional foods, and health supply chain distribution.',
    existingAssetsAndPartnerships: [
      'Strategic healthcare and hospital operations partnerships across Asia-Pacific',
      'Medical equipment and pharmaceutical supply chain distribution',
    ],
    strategicPriorities: [
      'Partnership with GMP-certified pharmaceutical and medical manufacturing facilities',
      'Distribution of Japanese medical devices and premium functional foods in Vietnam',
      'Healthcare logistics and temperature-controlled medical storage',
    ],
    targetPartners: ['Hau Giang Pharma', 'Traphaco', 'Vinmec', 'Domesco', 'Pharmacity', 'EMJ Ha Nam'],
  },
];

export const SOJITZ_RELEVANCE_RUBRIC = `
SOJITZ VIETNAM RELEVANCE SCORING CRITERIA (1 to 10 Scale):
- 9 to 10 (CRITICAL / DIRECT IMPACT): Direct impact on Sojitz Vietnam assets (Long Duc IP, Phu My 3, Huong Thuy, Vinabeef, JVF), key partners (Vinamilk, Masan, EVN), or direct competitor moves by Japanese Sogo Shosha (Mitsubishi, Mitsui, Sumitomo, Itochu, Marubeni, Toyota Tsusho) in identical product lines.
- 7 to 8 (HIGH IMPORTANCE): Major market movement, M&A transaction (> $50M), or regulatory decree in Priority 1 sectors (Renewables, Industrial Parks, Logistics, Food, Chemicals, Plastics). Clear actionable commercial opportunity for Sojitz.
- 4 to 6 (MODERATE / MONITOR): Policy shifts or investments in Priority 2 sectors (Real Estate, Data Centers, AI, Automotive, Healthcare) or macroeconomic indicators affecting foreign exchange, interest rates, or FDI flows.
- 1 to 3 (LOW / INFORMATIONAL): General business or regional news with no clear commercial angle or operational implication for Sojitz Vietnam.
`;
