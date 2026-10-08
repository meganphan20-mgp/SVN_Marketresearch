-- ==============================================================================
-- SOJITZ VIETNAM MARKET INTELLIGENCE
-- Production Seed Dataset: Sectors, Companies, Sources, Knowledge Bank & Stories
-- ==============================================================================

-- 1. Seed Sectors (14 Priority 1 & 12 Priority 2)
INSERT INTO public.sectors (name, slug, priority, description, display_order) VALUES
-- Priority 1: Core Sojitz Trading & Investment Divisions
('Energy', 'energy', 'PRIORITY_1', 'Thermal power, LNG, natural gas, national grid and power transmission infrastructure', 1),
('Renewable Energy', 'renewable-energy', 'PRIORITY_1', 'Solar, onshore & offshore wind, biomass, green hydrogen and energy transition initiatives', 2),
('Infrastructure', 'infrastructure', 'PRIORITY_1', 'Highways, deep-water ports, railways, airports and urban infrastructure developments', 3),
('Industrial Parks', 'industrial-parks', 'PRIORITY_1', 'Industrial land development, eco-industrial parks, factory leasing and tenant FDI attraction', 4),
('Logistics', 'logistics', 'PRIORITY_1', 'Cold chain, bonded warehouses, port logistics, supply chain multimodal freight', 5),
('Chemicals', 'chemicals', 'PRIORITY_1', 'Industrial chemicals, basic chemicals, specialty chemicals, fertilizers and petrochemicals', 6),
('Plastics', 'plastics', 'PRIORITY_1', 'Resins, polymer trading, masterbatch, compounding and technical plastics', 7),
('Materials', 'materials', 'PRIORITY_1', 'Steel, industrial minerals, advanced industrial materials and packaging', 8),
('Food', 'food', 'PRIORITY_1', 'FMCG processed foods, seasoning, seafood processing, meat value-chain and food ingredients', 9),
('Agriculture', 'agriculture', 'PRIORITY_1', 'Animal feed, grain trading, plantation agriculture, agrochemicals and fertilizers', 10),
('Retail', 'retail', 'PRIORITY_1', 'Convenience stores, supermarkets, modern trade distribution and omnichannel retail', 11),
('Consumer', 'consumer', 'PRIORITY_1', 'Personal care, household goods, consumer electronics and apparel distribution', 12),
('Aviation', 'aviation', 'PRIORITY_1', 'Airlines, ground handling, MRO (maintenance), aerospace parts and airport concessions', 13),
('Manufacturing', 'manufacturing', 'PRIORITY_1', 'Precision machinery, electronics manufacturing, automotive components and heavy industry', 14),

-- Priority 2: Strategic Emergence & High Growth Surveillance
('Real Estate', 'real-estate', 'PRIORITY_2', 'Commercial offices, mixed-use developments, residential townships and hospitality', 15),
('Hospitality', 'hospitality', 'PRIORITY_2', 'Hotels, resorts, business travel assets and tourism infrastructure', 16),
('Healthcare', 'healthcare', 'PRIORITY_2', 'Hospitals, pharmaceuticals, medical equipment and healthtech services', 17),
('Digital', 'digital', 'PRIORITY_2', 'Enterprise software, cloud services, fintech and telecommunications', 18),
('AI', 'ai', 'PRIORITY_2', 'Artificial intelligence applications, industrial automation and edge computing', 19),
('Data Centers', 'data-centers', 'PRIORITY_2', 'Hyperscale data facilities, enterprise colocation and connectivity hubs', 20),
('Circular Economy', 'circular-economy', 'PRIORITY_2', 'Waste-to-energy, industrial symbiosis and closed-loop manufacturing', 21),
('Recycling', 'recycling', 'PRIORITY_2', 'Plastic mechanical/chemical recycling, scrap metal processing and e-waste handling', 22),
('Carbon', 'carbon', 'PRIORITY_2', 'Carbon credits, Article 6 mechanisms, ETS voluntary carbon offsets and decarbonization', 23),
('ESG', 'esg', 'PRIORITY_2', 'Green compliance, corporate governance standards, CBAM and sustainability reporting', 24),
('Automotive', 'automotive', 'PRIORITY_2', 'Electric vehicles, charging networks, commercial vehicle assembly and auto parts', 25),
('Financial Services', 'financial-services', 'PRIORITY_2', 'Trade finance, banking, leasing, green bonds and private equity capital', 26)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    priority = EXCLUDED.priority,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- 2. Seed Companies Watchlist
-- Japanese Trading Houses (Sogo Shosha)
INSERT INTO public.companies (name, ticker, slug, origin, description, aliases) VALUES
('Sojitz Corporation', '2768.T', 'sojitz-corporation', 'JAPANESE_TRADING_HOUSE', 'General trading house (Sogo Shosha) active across retail, foods, chemicals, industrial parks (Long Duc), and renewables in Vietnam.', ARRAY['Sojitz', 'Sojitz Vietnam', 'Sojitz Corp']),
('Mitsubishi Corporation', '8058.T', 'mitsubishi-corporation', 'JAPANESE_TRADING_HOUSE', 'Japan largest general trading company with investments in Vietnam power projects, real estate, and automotive.', ARRAY['Mitsubishi', 'Mitsubishi Corp', 'MC']),
('Mitsui & Co.', '8031.T', 'mitsui-and-co', 'JAPANESE_TRADING_HOUSE', 'Leading Sogo Shosha focused on energy, natural gas (Block B O Mon), chemicals, logistics, and healthcare.', ARRAY['Mitsui', 'Mitsui & Co', 'Mitsui Bussan']),
('Itochu Corporation', '8001.T', 'itochu-corporation', 'JAPANESE_TRADING_HOUSE', 'Consumer, textile, food and retail focused trading giant; key shareholder in major textile & consumer groups.', ARRAY['Itochu', 'Itochu Corp']),
('Marubeni Corporation', '8002.T', 'marubeni-corporation', 'JAPANESE_TRADING_HOUSE', 'Major power plant developer, containerboard/packaging manufacturer, and food trading house in Vietnam.', ARRAY['Marubeni', 'Marubeni Corp']),
('Sumitomo Corporation', '8053.T', 'sumitomo-corporation', 'JAPANESE_TRADING_HOUSE', 'Developer of Thang Long Industrial Parks (I, II, III), smart city projects with BRG, and retail supermarkets.', ARRAY['Sumitomo', 'Sumitomo Corp']),
('Toyota Tsusho', '8015.T', 'toyota-tsusho', 'JAPANESE_TRADING_HOUSE', 'Automotive supply chain, metals, circular economy, and mobility infrastructure arm of Toyota Group.', ARRAY['Toyota Tsusho Corp', 'TTC Japan'])
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    ticker = EXCLUDED.ticker,
    description = EXCLUDED.description,
    aliases = EXCLUDED.aliases;

-- Vietnamese Conglomerates & Champions
INSERT INTO public.companies (name, ticker, slug, origin, description, aliases) VALUES
('Vingroup', 'VIC.HM', 'vingroup', 'VIETNAM', 'Largest private conglomerate in Vietnam; key focus on EVs (VinFast), technology, real estate (Vinhomes), and retail.', ARRAY['VinGroup', 'VIC', 'Vinhomes', 'VinFast']),
('Masan Group', 'MSN.HM', 'masan-group', 'VIETNAM', 'Dominant retail and FMCG leader operating WinCommerce, consumer food brands, meat processing, and materials.', ARRAY['Masan', 'MSN', 'WinCommerce', 'The CrownX']),
('Stavian Group', NULL, 'stavian-group', 'VIETNAM', 'Top Vietnamese polymer, petrochemical distributor and industrial park/chemical plant investor.', ARRAY['Stavian', 'Stavian Chemical', 'Stavian Petrochemical']),
('THACO Group', NULL, 'thaco-group', 'VIETNAM', 'Automotive manufacturing, agricultural plantations (HNG), logistics, and Chu Lai industrial complex.', ARRAY['THACO', 'Truong Hai', 'THACO Agri']),
('Hoa Phat Group', 'HPG.HM', 'hoa-phat-group', 'VIETNAM', 'Leading steel producer in Southeast Asia, expanding into container manufacturing, home appliances, and agriculture.', ARRAY['Hoa Phat', 'HPG']),
('FPT Corporation', 'FPT.HM', 'fpt-corporation', 'VIETNAM', 'Top digital transformation, AI semiconductor design, software outsourcing, and telecommunications corporation.', ARRAY['FPT', 'FPT Software']),
('Sovico Group', NULL, 'sovico-group', 'VIETNAM', 'Multi-industry group controlling Vietjet Air, HDBank, Phu Long Real Estate, and energy investments.', ARRAY['Sovico', 'Vietjet', 'HDBank']),
('Gelex Group', 'GEX.HM', 'gelex-group', 'VIETNAM', 'Electrical equipment, utility infrastructure, industrial parks (Viglacera), logistics, and renewable energy.', ARRAY['Gelex', 'GEX', 'Viglacera']),
('TTC Group', NULL, 'ttc-group', 'VIETNAM', 'Major player in sugar, renewable solar/wind energy, real estate, and industrial parks in southern Vietnam.', ARRAY['TTC', 'Thanh Thanh Cong']),
('Becamex IDC', 'BCM.HM', 'becamex-idc', 'VIETNAM', 'State-backed industrial infrastructure champion and co-developer of VSIP (Vietnam-Singapore Industrial Parks).', ARRAY['Becamex', 'BCM', 'VSIP']),
('Vinamilk', 'VNM.HM', 'vinamilk', 'VIETNAM', 'Top dairy producer in Vietnam with integrated dairy farms, processing plants, and international exports.', ARRAY['Vinamilk', 'VNM']),
('Sabeco', 'SAB.HM', 'sabeco', 'VIETNAM', 'Largest beverage and beer brewer in Vietnam; Thai Beverage affiliate with widespread retail distribution.', ARRAY['Sabeco', 'SAB', 'Bia Saigon'])
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    ticker = EXCLUDED.ticker,
    description = EXCLUDED.description,
    aliases = EXCLUDED.aliases;

-- 3. Seed Ingestion Sources (Tier 1, Tier 2, Tier 3, and Discovery)
INSERT INTO public.sources (name, domain, tier, trust_weight, description, rss_url, is_official_ir) VALUES
('Ministry of Planning and Investment (MPI)', 'mpi.gov.vn', 'TIER_1', 1.00, 'Official state portal for foreign direct investment data, industrial zone approvals, and planning decrees.', 'https://www.mpi.gov.vn/en/Pages/rss.aspx', true),
('State Bank of Vietnam (SBV)', 'sbv.gov.vn', 'TIER_1', 1.00, 'Official central bank regulatory circulars, FX rates, and monetary policy announcements.', 'https://www.sbv.gov.vn/webcenter/portal/en/menu/trangchu/rss', true),
('Ho Chi Minh Stock Exchange (HOSE)', 'hsx.vn', 'TIER_1', 1.00, 'Official corporate disclosures, securities filings, ownership updates, and regulatory notices.', 'https://www.hsx.vn/Modules/Cms/Web/RssView', true),
('Nikkei Asia', 'asia.nikkei.com', 'TIER_1', 0.95, 'Authoritative Japanese financial and business wire covering Indo-Pacific markets and trading houses.', 'https://asia.nikkei.com/rss/feed/nar', false),
('Reuters Asia', 'reuters.com', 'TIER_1', 0.95, 'Global institutional news wire reporting on cross-border M&A, macroeconomic indicators, and trade flows.', 'https://www.reutersagency.com/feed/?best-topics=business-finance', false),
('Bloomberg Vietnam', 'bloomberg.com', 'TIER_1', 0.95, 'Global market data, sovereign debt ratings, FX trends, and deal intelligence.', 'https://www.bloomberg.com/feeds/bview.xml', false),
('Vietnam Investment Review (VIR)', 'vir.com.vn', 'TIER_2', 0.75, 'Official English-language business weekly operating under Vietnam MPI.', 'https://vir.com.vn/rss/business.rss', false),
('The Investor', 'theinvestor.vn', 'TIER_2', 0.70, 'Specialized publication under Vietnam Association of Foreign Invested Enterprises (VAFIE).', 'https://theinvestor.vn/rss/economy.rss', false),
('VnEconomy', 'vneconomy.vn', 'TIER_2', 0.70, 'Vietnamese business and macroeconomic news journal published by Vietnam Economic Association.', 'https://vneconomy.vn/rss/tai-chinh.rss', false),
('VnExpress International', 'e.vnexpress.net', 'TIER_2', 0.65, 'Highest-circulation Vietnamese digital news service with verified editorial oversight.', 'https://e.vnexpress.net/rss/business.rss', false),
('Báo Đầu Tư', 'baodautu.vn', 'TIER_2', 0.75, 'Premier Vietnamese financial daily covering corporate investments, concessions, and infrastructure.', 'https://baodautu.vn/rss/thoi-su-kinh-doanh.rss', false),
('CafeF Enterprise Watch', 'cafef.vn', 'TIER_2', 0.60, 'Fast-paced corporate and stock market monitoring portal in Vietnam.', 'https://cafef.vn/doanh-nghiep.rss', false),
('Tuoi Tre News', 'tuoitrenews.vn', 'TIER_3', 0.45, 'National daily newspaper reporting regional events and municipal approvals.', 'https://tuoitrenews.vn/rss/business.rss', false),
('Thanh Nien Business', 'thanhnien.vn', 'TIER_3', 0.40, 'Vietnamese mainstream daily covering consumer trends and local industry announcements.', 'https://thanhnien.vn/rss/kinh-te.rss', false),
('JETRO Hanoi & HCMC', 'jetro.go.jp', 'TIER_1', 0.90, 'Japan External Trade Organization official surveys and bilateral investment statistics.', 'https://www.jetro.go.jp/vietnam/rss.xml', true),
('Industry Trade Feeds & Discovery', 'industry-discovery.internal', 'DISCOVERY', 0.15, 'Algorithmic RSS crawlers, specialized logistics trade forums, and early signal scanning.', NULL, false)
ON CONFLICT (name) DO UPDATE SET 
    domain = EXCLUDED.domain,
    tier = EXCLUDED.tier,
    trust_weight = EXCLUDED.trust_weight,
    description = EXCLUDED.description;

-- 4. Seed Sojitz Internal Knowledge Bank Entities
INSERT INTO public.knowledge_bank_entities (category, name, description, priority_keywords) VALUES
('BUSINESS_UNIT', 'Energy Solutions Division', 'Thermal gas power, LNG receiving terminals, distributed rooftop solar for industrial parks, and biomass fuel supply chains.', ARRAY['LNG', 'power', 'solar', 'wind', 'biomass', 'DPPA', 'EVN']),
('BUSINESS_UNIT', 'Chemicals & Plastics Division', 'Plastics resin trading, polymer masterbatch compounding, specialty chemicals, green PET recycling, and industrial fertilizers.', ARRAY['plastics', 'resin', 'polypropylene', 'polyethylene', 'fertilizer', 'chemicals', 'recycling']),
('BUSINESS_UNIT', 'Industrial Infrastructure & Logistics', 'Long Duc Industrial Park (Dong Nai) development, expansion into eco-industrial parks, bonded warehousing, cold-chain logistics hubs.', ARRAY['industrial park', 'Long Duc', 'warehouse', 'cold chain', 'Dong Nai', 'port', 'logistics']),
('BUSINESS_UNIT', 'Foods, Agri & Retail Division', 'Wholesale food distribution (Huong Thuy), FMCG supply chains, convenience retail joint ventures, animal feed grains, cold logistics.', ARRAY['food', 'retail', 'FMCG', 'supermarket', 'convenience store', 'Huong Thuy', 'feed']),
('BUSINESS_UNIT', 'Automotive & Mobility Division', 'Automotive assembly distribution partnerships, fleet electrification, charging equipment, transport machinery leasing.', ARRAY['automotive', 'EV', 'assembly', 'mobility', 'fleet', 'transport'])
ON CONFLICT DO NOTHING;
