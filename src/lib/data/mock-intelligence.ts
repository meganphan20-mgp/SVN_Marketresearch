import { IntelligenceStory, DashboardKpis, StorySourceLink } from '@/types/intelligence';
import { Sector, WatchlistCompany, NewsSourceConfig } from '@/types/taxonomy';
import { WeeklyReport } from '@/types/report';

export const INITIAL_SECTORS: Sector[] = [
  // Priority 1
  { id: 'sec-1', name: 'Energy', slug: 'energy', priority: 'PRIORITY_1', description: 'Thermal, LNG, gas value chain, grid transmission', displayOrder: 1, isActive: true, storyCount: 8 },
  { id: 'sec-2', name: 'Renewable Energy', slug: 'renewable-energy', priority: 'PRIORITY_1', description: 'Solar, onshore & offshore wind, biomass, green hydrogen', displayOrder: 2, isActive: true, storyCount: 14 },
  { id: 'sec-3', name: 'Infrastructure', slug: 'infrastructure', priority: 'PRIORITY_1', description: 'Highways, deep-water ports, railways, airports', displayOrder: 3, isActive: true, storyCount: 11 },
  { id: 'sec-4', name: 'Industrial Parks', slug: 'industrial-parks', priority: 'PRIORITY_1', description: 'Industrial land, eco-IPs, factory leasing, tenant FDI', displayOrder: 4, isActive: true, storyCount: 19 },
  { id: 'sec-5', name: 'Logistics', slug: 'logistics', priority: 'PRIORITY_1', description: 'Cold chain, bonded warehouses, port logistics, supply chain', displayOrder: 5, isActive: true, storyCount: 9 },
  { id: 'sec-6', name: 'Chemicals', slug: 'chemicals', priority: 'PRIORITY_1', description: 'Industrial chemicals, specialty chemicals, fertilizers', displayOrder: 6, isActive: true, storyCount: 6 },
  { id: 'sec-7', name: 'Plastics', slug: 'plastics', priority: 'PRIORITY_1', description: 'Polymer resins, masterbatch, technical plastics compounding', displayOrder: 7, isActive: true, storyCount: 5 },
  { id: 'sec-8', name: 'Materials', slug: 'materials', priority: 'PRIORITY_1', description: 'Steel, industrial minerals, advanced packaging', displayOrder: 8, isActive: true, storyCount: 7 },
  { id: 'sec-9', name: 'Food', slug: 'food', priority: 'PRIORITY_1', description: 'FMCG foods, seasoning, seafood processing, meat value-chain', displayOrder: 9, isActive: true, storyCount: 12 },
  { id: 'sec-10', name: 'Agriculture', slug: 'agriculture', priority: 'PRIORITY_1', description: 'Animal feed, grain trading, plantation agriculture', displayOrder: 10, isActive: true, storyCount: 4 },
  { id: 'sec-11', name: 'Retail', slug: 'retail', priority: 'PRIORITY_1', description: 'Supermarkets, convenience stores, modern distribution', displayOrder: 11, isActive: true, storyCount: 10 },
  { id: 'sec-12', name: 'Consumer', slug: 'consumer', priority: 'PRIORITY_1', description: 'Personal care, household products, apparel supply chain', displayOrder: 12, isActive: true, storyCount: 6 },
  { id: 'sec-13', name: 'Automotive', slug: 'automotive', priority: 'PRIORITY_1', description: 'Auto assembly, OEM components, battery pack integration', displayOrder: 13, isActive: true, storyCount: 8 },
  { id: 'sec-14', name: 'Mobility', slug: 'mobility', priority: 'PRIORITY_1', description: 'EV charging infrastructure, urban transit, smart fleet', displayOrder: 14, isActive: true, storyCount: 7 },

  // Priority 2
  { id: 'sec-15', name: 'Real Estate', slug: 'real-estate', priority: 'PRIORITY_2', description: 'Commercial offices, mixed-use developments, townships', displayOrder: 15, isActive: true, storyCount: 8 },
  { id: 'sec-16', name: 'Hospitality', slug: 'hospitality', priority: 'PRIORITY_2', description: 'Hotels, resorts, business travel assets', displayOrder: 16, isActive: true, storyCount: 2 },
  { id: 'sec-17', name: 'Healthcare', slug: 'healthcare', priority: 'PRIORITY_2', description: 'Pharma distribution, medical facilities, diagnostic labs', displayOrder: 17, isActive: true, storyCount: 5 },
  { id: 'sec-18', name: 'Digital', slug: 'digital', priority: 'PRIORITY_2', description: 'Enterprise software, telecom, cloud infrastructure', displayOrder: 18, isActive: true, storyCount: 7 },
  { id: 'sec-19', name: 'AI', slug: 'ai', priority: 'PRIORITY_2', description: 'Industrial automation, AI computing hubs, semiconductors', displayOrder: 19, isActive: true, storyCount: 11 },
  { id: 'sec-20', name: 'Data Centers', slug: 'data-centers', priority: 'PRIORITY_2', description: 'Hyperscale facilities, colocation and green power sourcing', displayOrder: 20, isActive: true, storyCount: 8 },
  { id: 'sec-21', name: 'Aviation', slug: 'aviation', priority: 'PRIORITY_2', description: 'Airlines, ground handling, MRO, aerospace supply chain', displayOrder: 21, isActive: true, storyCount: 3 },
  { id: 'sec-22', name: 'Manufacturing', slug: 'manufacturing', priority: 'PRIORITY_2', description: 'Precision machinery, electronics, export manufacturing', displayOrder: 22, isActive: true, storyCount: 15 },
  { id: 'sec-23', name: 'Circular Economy', slug: 'circular-economy', priority: 'PRIORITY_2', description: 'Waste-to-energy, recycling, industrial symbiosis', displayOrder: 23, isActive: true, storyCount: 6 },
  { id: 'sec-24', name: 'Recycling', slug: 'recycling', priority: 'PRIORITY_2', description: 'Plastic mechanical/chemical recycling, e-waste scrap', displayOrder: 24, isActive: true, storyCount: 4 },
  { id: 'sec-25', name: 'Carbon', slug: 'carbon', priority: 'PRIORITY_2', description: 'Carbon credits, Article 6, decarbonization advisory', displayOrder: 25, isActive: true, storyCount: 5 },
  { id: 'sec-26', name: 'ESG', slug: 'esg', priority: 'PRIORITY_2', description: 'CBAM compliance, green governance, ESG disclosure', displayOrder: 26, isActive: true, storyCount: 4 },
];

export const INITIAL_COMPANIES: WatchlistCompany[] = [
  // Japanese Trading Houses (Sogo Shosha)
  { id: 'comp-sojitz', name: 'Sojitz Corporation', ticker: '2768.T', slug: 'sojitz-corporation', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Sojitz', 'Sojitz Vietnam'], description: 'Focus on retail, foods, chemicals, industrial parks (Long Duc), paper & pulp, and green energy.', isActive: true, storyCount: 12 },
  { id: 'comp-mitsubishi', name: 'Mitsubishi Corporation', ticker: '8058.T', slug: 'mitsubishi-corporation', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Mitsubishi', 'Mitsubishi Corp'], description: 'Investments in Vietnam energy, real estate (Vinhomes projects), and retail automotive distribution.', isActive: true, storyCount: 9 },
  { id: 'comp-mitsui', name: 'Mitsui & Co.', ticker: '8031.T', slug: 'mitsui-and-co', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Mitsui', 'Mitsui & Co'], description: 'Major stakeholder in Block B O Mon gas development, cold chain logistics, and healthcare.', isActive: true, storyCount: 8 },
  { id: 'comp-itochu', name: 'Itochu Corporation', ticker: '8001.T', slug: 'itochu-corporation', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Itochu', 'Itochu Corp'], description: 'Textiles, consumer goods, food distribution, and renewable energy.', isActive: true, storyCount: 5 },
  { id: 'comp-marubeni', name: 'Marubeni Corporation', ticker: '8002.T', slug: 'marubeni-corporation', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Marubeni', 'Marubeni Corp'], description: 'Thermal and renewable power plants, Kraft paper mill in Ba Ria - Vung Tau, and coffee trading.', isActive: true, storyCount: 7 },
  { id: 'comp-sumitomo', name: 'Sumitomo Corporation', ticker: '8053.T', slug: 'sumitomo-corporation', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Sumitomo', 'Sumitomo Corp'], description: 'Operator of Thang Long Industrial Parks (I, II, III), smart city development with BRG, and FujiMart retail.', isActive: true, storyCount: 14 },
  { id: 'comp-toyota-tsusho', name: 'Toyota Tsusho', ticker: '8015.T', slug: 'toyota-tsusho', origin: 'JAPANESE_TRADING_HOUSE', aliases: ['Toyota Tsusho Corp'], description: 'Automotive value chain, battery recycling, metals, and circular supply chains in Vietnam.', isActive: true, storyCount: 4 },

  // Vietnamese Conglomerates (Monitored Watchlist per Sojitz Corporate Framework)
  // Group 1
  { id: 'comp-masan', name: 'Masan Group', ticker: 'MSN.HM', slug: 'masan-group', origin: 'VIETNAM', aliases: ['MASAN', 'Masan', 'WinCommerce', 'The CrownX'], description: 'Consumer and retail champion operating WinCommerce, Masan Consumer, MEATDeli, and Masan High-Tech Materials.', isActive: true, storyCount: 11 },
  { id: 'comp-nova', name: 'Nova Group', ticker: 'NVL.HM', slug: 'nova-group', origin: 'VIETNAM', aliases: ['NOVA', 'Nova', 'Novaland', 'NVL'], description: 'Leading real estate, tourism, and infrastructure developer undergoing debt restructuring and asset optimization.', isActive: true, storyCount: 5 },
  { id: 'comp-tt', name: 'T&T Group', ticker: undefined, slug: 'tt-group', origin: 'VIETNAM', aliases: ['T&T', 'T&T Group', 'TT Group'], description: 'Multi-sector conglomerate active in renewable energy, logistics, seaports, real estate, and financial services.', isActive: true, storyCount: 4 },
  { id: 'comp-ttc', name: 'TTC Group', ticker: undefined, slug: 'ttc-group', origin: 'VIETNAM', aliases: ['TTC', 'TTC Group', 'Thanh Thanh Cong'], description: 'Southern Vietnam conglomerate in sugar, renewable solar/wind power, real estate, and industrial zones.', isActive: true, storyCount: 4 },
  { id: 'comp-taseco', name: 'Taseco Group', ticker: 'TAL.HM', slug: 'taseco-group', origin: 'VIETNAM', aliases: ['TASECO', 'Taseco', 'Taseco Land', 'TAL'], description: 'Airport commercial services (duty free, lounges) and real estate developer of industrial/urban complexes.', isActive: true, storyCount: 3 },
  { id: 'comp-son-kim', name: 'Son Kim Group', ticker: undefined, slug: 'son-kim-group', origin: 'VIETNAM', aliases: ['SON KIM', 'Son Kim', 'SonKim', 'SonKim Land', 'GS25 Vietnam'], description: 'Retail, luxury real estate (SonKim Land), and convenience retail operator of GS25 in Vietnam.', isActive: true, storyCount: 3 },
  { id: 'comp-kn-group', name: 'KN Group', ticker: undefined, slug: 'kn-group', origin: 'VIETNAM', aliases: ['KN GROUP', 'KN Group', 'Golf Long Thanh', 'KN Paradise'], description: 'Golf resort, clean energy, industrial park, and large-scale township developer (KN Paradise Cam Ranh).', isActive: true, storyCount: 2 },
  { id: 'comp-vinamilk', name: 'Vinamilk', ticker: 'VNM.HM', slug: 'vinamilk', origin: 'VIETNAM', aliases: ['VINAMILK', 'Vinamilk', 'VNM'], description: 'Top dairy champion in Southeast Asia with extensive farm operations and consumer retail network.', isActive: true, storyCount: 6 },
  { id: 'comp-stavian', name: 'Stavian Group', ticker: undefined, slug: 'stavian-group', origin: 'VIETNAM', aliases: ['STAVIAN', 'Stavian', 'Stavian Chemical'], description: 'Leading polymer distributor expanding into petrochemical plants, circular economy, and industrial zones.', isActive: true, storyCount: 6 },

  // Group 2
  { id: 'comp-vingroup', name: 'Vingroup', ticker: 'VIC.HM', slug: 'vingroup', origin: 'VIETNAM', aliases: ['VINGROUP', 'Vingroup', 'Vinhomes', 'VinFast', 'VinES'], description: 'Largest Vietnamese private conglomerate with major businesses in electric vehicles (VinFast), real estate (Vinhomes), and AI/tech.', isActive: true, storyCount: 16 },
  { id: 'comp-sun-group', name: 'Sun Group', ticker: undefined, slug: 'sun-group', origin: 'VIETNAM', aliases: ['SUN GROUP', 'Sun Group', 'SunGroup'], description: 'Premier tourism, infrastructure (Van Don airport, expressways), and resort real estate conglomerate.', isActive: true, storyCount: 5 },
  { id: 'comp-hoa-phat', name: 'Hoa Phat Group', ticker: 'HPG.HM', slug: 'hoa-phat-group', origin: 'VIETNAM', aliases: ['HOA PHAT', 'Hoa Phat', 'HPG'], description: 'Largest steelmaker in Vietnam, expanding into industrial shipping containers, heavy manufacturing, and modern agro-industrial.', isActive: true, storyCount: 8 },
  { id: 'comp-brg', name: 'BRG Group', ticker: undefined, slug: 'brg-group', origin: 'VIETNAM', aliases: ['BRG', 'BRG Group', 'SeABank', 'BRG Retail'], description: 'Banking (SeABank), retail (FujiMart joint venture with Sumitomo), golf resorts, and North Hanoi smart city.', isActive: true, storyCount: 5 },
  { id: 'comp-sovico', name: 'Sovico Group', ticker: undefined, slug: 'sovico-group', origin: 'VIETNAM', aliases: ['SOVICO', 'Sovico', 'Vietjet', 'HDBank'], description: 'Conglomerate backing Vietjet Air, HDBank, urban real estate, and green energy infrastructure.', isActive: true, storyCount: 5 },
  { id: 'comp-masterise', name: 'Masterise Group', ticker: undefined, slug: 'masterise-group', origin: 'VIETNAM', aliases: ['MASTERISE', 'Masterise', 'Masterise Homes'], description: 'Branded luxury real estate developer partnering with Marriott and global architecture firms.', isActive: true, storyCount: 4 },
  { id: 'comp-fpt', name: 'FPT Corporation', ticker: 'FPT.HM', slug: 'fpt-corporation', origin: 'VIETNAM', aliases: ['FPT', 'FPT Software', 'FPT Telecom'], description: 'Leading technology and IT services firm building AI data centers, chip design, and automotive software.', isActive: true, storyCount: 9 },
  { id: 'comp-cmc', name: 'CMC Corporation', ticker: 'CMG.HM', slug: 'cmc-corporation', origin: 'VIETNAM', aliases: ['CMC', 'CMC Corp', 'CMG', 'CMC Telecom'], description: 'Top ICT conglomerate developing data centers, cloud platforms, cybersecurity, and telecommunications.', isActive: true, storyCount: 3 },
  { id: 'comp-thaco', name: 'THACO Group', ticker: undefined, slug: 'thaco-group', origin: 'VIETNAM', aliases: ['THACO', 'Truong Hai', 'THACO Auto', 'THACO Agri'], description: 'Automotive manufacturing, agricultural plantations (HNG), logistics, and Chu Lai seaport complex.', isActive: true, storyCount: 7 },
  { id: 'comp-hoa-sen', name: 'Hoa Sen Group', ticker: 'HSG.HM', slug: 'hoa-sen-group', origin: 'VIETNAM', aliases: ['HOA SEN', 'Hoa Sen', 'HSG', 'Hoa Sen Group'], description: 'Leading galvanized steel sheet and plastic pipe manufacturer with extensive nationwide retail distribution.', isActive: true, storyCount: 4 },
];

export const INITIAL_SOURCES: NewsSourceConfig[] = [
  // Tier 1: Official & Global Authoritative (Weight 1.0)
  // Official Government Gazettes, Financial Times, VnEconomy, VnExpress, VietnamNet, Báo Chính Phủ (English), The Investor, CafeF, Tuoi Tre Online, Thanh Nien News, Dau tu, CafeBiz
  { id: 'src-gazette', name: 'Official Government Gazettes', domain: 'baochinhphu.vn', allowedDomains: ['baochinhphu.vn'], tier: 'TIER_1', description: 'Official Government Gazettes and legal decrees of the Government of Vietnam.', trustWeight: 1.0, isOfficialIr: true, isActive: true, articleCount: 140 },
  { id: 'src-ft', name: 'Financial Times', domain: 'ft.com', allowedDomains: ['ft.com'], tier: 'TIER_1', description: 'Global strategic investment trends, supply chain realignments, and geopolitical risk.', trustWeight: 1.0, isOfficialIr: false, isActive: true, articleCount: 84 },
  { id: 'src-vneconomy', name: 'VnEconomy', domain: 'vneconomy.vn', allowedDomains: ['vneconomy.vn', 'en.vneconomy.vn'], tier: 'TIER_1', description: 'Vietnam Economic Times portal covering macro indicators, corporate earnings, and real estate.', trustWeight: 1.0, rssUrl: 'https://vneconomy.vn/doanh-nghiep.htm', isOfficialIr: false, isActive: true, articleCount: 520 },
  { id: 'src-vnexpress', name: 'VnExpress', domain: 'vnexpress.net', allowedDomains: ['vnexpress.net', 'e.vnexpress.net'], tier: 'TIER_1', description: 'Leading mainstream digital newspaper with dedicated business, macro, and market coverage.', trustWeight: 1.0, rssUrl: 'https://vnexpress.net/rss/kinh-doanh.rss', isOfficialIr: false, isActive: true, articleCount: 680 },
  { id: 'src-vietnamnet', name: 'VietnamNet', domain: 'vietnamnet.vn', allowedDomains: ['vietnamnet.vn'], tier: 'TIER_1', description: 'State-affiliated media focusing on technology policy, enterprise restructuring, and foreign diplomacy.', trustWeight: 1.0, rssUrl: 'https://vietnamnet.vn/rss/kinh-doanh.rss', isOfficialIr: false, isActive: true, articleCount: 390 },
  { id: 'src-baochinhphu-en', name: 'Báo Chính Phủ (English)', domain: 'en.baochinhphu.vn', allowedDomains: ['en.baochinhphu.vn', 'baochinhphu.vn'], tier: 'TIER_1', description: 'Official English-language portal of the Government of Vietnam, covering authoritative state directives, decrees, and socioeconomic policy announcements.', trustWeight: 1.0, isOfficialIr: true, isActive: true, articleCount: 340 },
  { id: 'src-theinvestor', name: 'The Investor', domain: 'theinvestor.vn', allowedDomains: ['theinvestor.vn'], tier: 'TIER_1', description: 'Specialized foreign investment portal focusing on manufacturing, logistics, and renewable energy.', trustWeight: 1.0, rssUrl: 'https://theinvestor.vn/corporate-c1/', isOfficialIr: false, isActive: true, articleCount: 295 },
  { id: 'src-cafef', name: 'CafeF', domain: 'cafef.vn', allowedDomains: ['cafef.vn'], tier: 'TIER_1', description: 'High-frequency financial portal tracking stock movements, corporate leadership, and project rumors.', trustWeight: 1.0, rssUrl: 'https://cafef.vn/doanh-nghiep.rss', isOfficialIr: false, isActive: true, articleCount: 820 },
  { id: 'src-tuoitre', name: 'Tuoi Tre Online', domain: 'tuoitre.vn', allowedDomains: ['tuoitre.vn', 'tuoitrenews.vn'], tier: 'TIER_1', description: 'National socio-economic newspaper covering major infrastructure and municipal policies.', trustWeight: 1.0, rssUrl: 'https://tuoitre.vn/rss/kinh-doanh.rss', isOfficialIr: false, isActive: true, articleCount: 420 },
  { id: 'src-thanhnien', name: 'Thanh Nien News', domain: 'thanhnien.vn', allowedDomains: ['thanhnien.vn'], tier: 'TIER_1', description: 'National daily reporting on commerce, consumer markets, and investment projects.', trustWeight: 1.0, rssUrl: 'https://thanhnien.vn/rss/kinh-te.rss', isOfficialIr: false, isActive: true, articleCount: 380 },
  { id: 'src-baodautu', name: 'Dau tu', domain: 'baodautu.vn', allowedDomains: ['baodautu.vn', 'tinnhanhchungkhoan.vn'], tier: 'TIER_1', description: 'Authoritative investment newspaper covering FDI, industrial parks, M&A, and infrastructure.', trustWeight: 1.0, rssUrl: 'https://baodautu.vn/doanh-nghiep-d4/', isOfficialIr: false, isActive: true, articleCount: 460 },
  { id: 'src-cafebiz', name: 'CafeBiz', domain: 'cafebiz.vn', allowedDomains: ['cafebiz.vn'], tier: 'TIER_1', description: 'Digital business and startup portal covering corporate strategy, retail, and tech.', trustWeight: 1.0, rssUrl: 'https://cafebiz.vn/rss/cau-chuyen-kinh-doanh.rss', isOfficialIr: false, isActive: true, articleCount: 310 },

  // Tier 2: Premier Vietnamese Business & Economic Media (Weight 0.7)
  // Reuters, Bloomberg, Nikkei Asia, Vietnam Investment Review, SSC/HOSE/HNX, Corporate Investor Relations
  { id: 'src-reuters', name: 'Reuters', domain: 'reuters.com', allowedDomains: ['reuters.com'], tier: 'TIER_2', description: 'Global primary news wire covering Vietnam macroeconomic shifts, cross-border M&A, and policy developments.', trustWeight: 0.7, isOfficialIr: false, isActive: true, articleCount: 185 },
  { id: 'src-bloomberg', name: 'Bloomberg', domain: 'bloomberg.com', allowedDomains: ['bloomberg.com'], tier: 'TIER_2', description: 'Financial markets, bond issuances, currency trends, and sovereign debt surveillance.', trustWeight: 0.7, isOfficialIr: false, isActive: true, articleCount: 160 },
  { id: 'src-nikkei', name: 'Nikkei Asia', domain: 'asia.nikkei.com', allowedDomains: ['asia.nikkei.com', 'nikkei.com'], tier: 'TIER_2', description: 'Authoritative reporting on Japanese corporate investments, trading houses, and Asian economic policy.', trustWeight: 0.7, rssUrl: 'https://asia.nikkei.com/rss/feed/nar', isOfficialIr: false, isActive: true, articleCount: 220 },
  { id: 'src-vir', name: 'Vietnam Investment Review', domain: 'vir.com.vn', allowedDomains: ['vir.com.vn'], tier: 'TIER_2', description: 'In-depth analysis of FDI, infrastructure projects, M&A transactions, and regulatory decrees.', trustWeight: 0.7, rssUrl: 'https://vir.com.vn/', isOfficialIr: false, isActive: true, articleCount: 412 },
  { id: 'src-ssc-hose-hnx', name: 'SSC/HOSE/HNX', domain: 'hsx.vn', allowedDomains: ['hsx.vn', 'ssc.gov.vn', 'hnx.vn'], tier: 'TIER_2', description: 'State Securities Commission and official stock exchange corporate disclosure portals.', trustWeight: 0.7, rssUrl: 'https://www.hsx.vn/Modules/Cms/Web/RssView', isOfficialIr: true, isActive: true, articleCount: 310 },
  { id: 'src-corp-ir', name: 'Corporate Investor Relations', domain: 'ir.internal', allowedDomains: ['sojitz.com'], tier: 'TIER_2', description: 'Official corporate disclosures, financial reports, and investor relations releases.', trustWeight: 0.7, isOfficialIr: true, isActive: true, articleCount: 45 },

  // Tier 3: Specialist & Domestic Financial Portals (Weight 0.4)
  // Saigon Times, Industry Associations, Specialized Trade Journals
  { id: 'src-saigontimes', name: 'Saigon Times', domain: 'thesaigontimes.vn', allowedDomains: ['thesaigontimes.vn'], tier: 'TIER_3', description: 'Southern economic hub business paper analyzing Ho Chi Minh City commerce and supply chain trends.', trustWeight: 0.4, rssUrl: 'https://thesaigontimes.vn/kinh-doanh/', isOfficialIr: false, isActive: true, articleCount: 260 },
  { id: 'src-associations', name: 'Industry Associations', domain: 'associations.internal', allowedDomains: [], tier: 'TIER_3', description: 'Industry and trade associations across plastics, logistics, energy, and manufacturing.', trustWeight: 0.4, isOfficialIr: false, isActive: true, articleCount: 140 },
  { id: 'src-trade-journals', name: 'Specialized Trade Journals', domain: 'tradejournals.internal', allowedDomains: [], tier: 'TIER_3', description: 'Specialized trade and technical journals covering energy, infrastructure, and commodities.', trustWeight: 0.4, isOfficialIr: false, isActive: true, articleCount: 88 },

  // Discovery Only (Weight 0.1)
  // LinkedIn, Corporate Blogs, Aggregators. Cannot verify a story alone; triggers crawler corroboration.
  { id: 'src-linkedin', name: 'LinkedIn', domain: 'linkedin.com', allowedDomains: ['linkedin.com'], tier: 'DISCOVERY', description: 'Executive personnel movements, corporate hiring expansion signals, and preliminary partnerships.', trustWeight: 0.1, isOfficialIr: false, isActive: true, articleCount: 95 },
  { id: 'src-corp-blogs', name: 'Corporate Blogs', domain: 'blogs.internal', allowedDomains: [], tier: 'DISCOVERY', description: 'Company tech blogs and operational updates. Triggers crawler corroboration.', trustWeight: 0.1, isOfficialIr: false, isActive: true, articleCount: 45 },
  { id: 'src-aggregators', name: 'Aggregators', domain: 'aggregators.internal', allowedDomains: [], tier: 'DISCOVERY', description: 'News aggregators and briefing portals. Cannot verify a story alone; triggers crawler corroboration.', trustWeight: 0.1, isOfficialIr: false, isActive: true, articleCount: 65 },
];

const RAW_SAMPLE_STORIES: IntelligenceStory[] = [
  {
    "id": "11111111-0411-4444-8888-000000000005",
    "title": "Vietnam Shifts FDI Strategy Toward High-Tech Investment and Stronger Domestic Linkages",
    "slug": "vietnam-shifts-fdi-strategy-toward-high-tech-investment-and-stronger-domestic-linkages",
    "publicationDate": "2026-10-09",
    "storyDate": "2026-10-09",
    "country": "Vietnam",
    "category": "Investment",
    "primarySectorId": "00e17d71-ab18-443e-b6e6-6564b0459d24",
    "primarySectorName": "Industrial Parks",
    "primarySectorSlug": "industrial-parks",
    "secondarySectors": [
      "4db7fccb-593e-4f3a-b6d2-5f25c3ad9dbc",
      "eeba2312-4c6a-4201-8d5c-1ffede309135"
    ],
    "companiesMentioned": [
      {
        "id": "comp-sojitz",
        "name": "Sojitz Corporation",
        "slug": "sojitz",
        "origin": "JAPANESE_TRADING_HOUSE",
        "role": "DEVELOPER"
      }
    ],
    "summary": "Deputy Minister of Planning and Investment Tran Quoc Phuong announced Vietnam's strategic shift in FDI attraction from low-cost assembly to selective high-tech manufacturing, green transition, and mandatory linkages with domestic enterprises. Under the updated framework, preferential investment incentives will prioritize projects that actively transfer technology and integrate Vietnamese Tier-1 and Tier-2 suppliers into global value chains.",
    "whyItMattersToSojitz": "Directly bolsters Sojitz Corporation's competitive advantage in Vietnam. As a long-standing Japanese general trading house and developer of Long Duc Industrial Park, Sojitz is uniquely positioned to act as the primary bridge facilitating supply-chain matchmaking and supplier development between Japanese multinational tenants and local Vietnamese manufacturers.",
    "suggestedBdAction": "Establish a dedicated 'Sojitz Supplier Localization Desk' at Long Duc Industrial Park to facilitate technology transfer and supplier matchmaking between Japanese FDI tenants and vetted Vietnamese component manufacturers.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 9.0,
    "verificationStatus": "VERIFIED",
    "confidenceScore": 96,
    "verificationRationale": "Keynote policy address delivered by Deputy Minister of Planning and Investment Tran Quoc Phuong, officially documented on VnEconomy English edition.",
    "extractedFacts": {
      "location": "Hà Nội",
      "announcedTimeline": "October 2026",
      "materialUpdates": [
        {
          "facts": [
            "Vietnam officially pivots FDI policy from quantity to high-tech, eco-friendly, and domestic linkage criteria.",
            "Deputy Minister Tran Quoc Phuong emphasizes mandatory technology transfer and domestic vendor development for top-tier incentives.",
            "Aims to deepen integration of Vietnamese Tier-1 and Tier-2 suppliers into multinational global supply chains."
          ],
          "rationale": "Keynote strategic address.",
          "timestamp": "2026-10-09T08:30:00.000Z",
          "sourceTitle": "Vietnam shifts FDI strategy toward high-tech investment and stronger domestic linkages"
        }
      ]
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "src-w41-vne-05",
        "sourceId": "src-vneconomy-en",
        "sourceName": "VnEconomy (English)",
        "sourceTier": "TIER_1",
        "articleTitle": "Vietnam shifts FDI strategy toward high-tech investment and stronger domestic linkages",
        "articleUrl": "https://en.vneconomy.vn/vietnam-shifts-fdi-strategy-toward-high-tech-investment-and-stronger-domestic-linkages.htm",
        "validatedUrl": "https://en.vneconomy.vn/vietnam-shifts-fdi-strategy-toward-high-tech-investment-and-stronger-domestic-linkages.htm",
        "canonicalUrl": "https://en.vneconomy.vn/vietnam-shifts-fdi-strategy-toward-high-tech-investment-and-stronger-domestic-linkages.htm",
        "publishedAt": "2026-10-09T08:30:00.000Z",
        "sourcePublicationDateLocal": "2026-10-09",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 97,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 97,
        "supportedCoreClaimIds": ["claim-vne-05-1"]
      }
    ],
    "originalUrls": [
      "https://en.vneconomy.vn/vietnam-shifts-fdi-strategy-toward-high-tech-investment-and-stronger-domestic-linkages.htm"
    ],
    "aiModelUsed": "Gemini-1.5-Pro",
    "dateCollected": "2026-10-09",
    "collectionTimestamp": "2026-10-09T09:00:00.000Z",
    "aiAnalysisTimestamp": "2026-10-09T09:00:00.000Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-09",
    "dailyBriefDate": "2026-10-09",
    "eventDate": "2026-10-09",
    "firstSeenAt": "2026-10-09T08:30:00.000Z",
    "lastVerifiedAt": "2026-10-09T09:00:00.000Z",
    "sourceGrounded": true
  },
  {
    "id": "11111111-0411-4444-8888-000000000001",
    "title": "Vietnam Pilots Low-Altitude Economy in Dien Bien Using Drones",
    "slug": "vietnam-pilots-low-altitude-economy-in-dien-bien-using-drones",
    "publicationDate": "2026-10-08",
    "storyDate": "2026-10-08",
    "country": "Vietnam",
    "category": "Logistics",
    "primarySectorId": "86856795-a1b9-4d21-8585-d00e6e53af40",
    "primarySectorName": "Logistics",
    "primarySectorSlug": "logistics",
    "secondarySectors": [
      "c15563f9-025c-40b3-90fe-e8fc26df1d56",
      "eeba2312-4c6a-4201-8d5c-1ffede309135"
    ],
    "companiesMentioned": [],
    "summary": "Vietnam has launched an experimental pilot of the low-altitude economy in the mountainous province of Dien Bien, completing over 6,000 unmanned aerial vehicle (UAV/drone) flights under the guidance of the Ministry of Science and Technology. The pilot tests commercial cargo delivery, medical logistics, and aerial surveillance, paving the way for Vietnam's first national legal framework on commercial low-altitude airspace management.",
    "whyItMattersToSojitz": "Directly impacts Sojitz Vietnam's Infrastructure & Logistics Division and Retail Distribution networks. Low-altitude drone logistics offers breakthrough opportunities for automated feeder transport, rapid medical/perishable delivery, and last-mile connectivity between Sojitz industrial parks and regional hubs.",
    "suggestedBdAction": "Engage Ministry of Science and Technology and drone operators to evaluate low-altitude cargo feeder trials connecting Long Duc Industrial Park with regional distribution centers.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8.5,
    "verificationStatus": "VERIFIED",
    "confidenceScore": 92,
    "verificationRationale": "Confirmed by official publication on VnEconomy English edition with direct statements from Ministry of Science and Technology and local government officials.",
    "extractedFacts": {
      "location": "Điện Biên",
      "announcedTimeline": "October 2026",
      "materialUpdates": [
        {
          "facts": [
            "Dien Bien province completed over 6,000 test flights with drones/UAVs.",
            "Pilot guided by the Ministry of Science and Technology for commercial cargo delivery and surveillance.",
            "Lays groundwork for Vietnam's first national regulatory sandbox on low-altitude airspace."
          ],
          "rationale": "Regulatory sandbox milestone.",
          "timestamp": "2026-10-08T08:00:00.000Z",
          "sourceTitle": "Vietnam pilots low-altitude economy in Dien Bien using drones"
        }
      ]
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "src-w41-vne-01",
        "sourceId": "src-vneconomy-en",
        "sourceName": "VnEconomy (English)",
        "sourceTier": "TIER_1",
        "articleTitle": "Vietnam pilots low-altitude economy in Dien Bien using drones",
        "articleUrl": "https://en.vneconomy.vn/vietnam-pilots-low-altitude-economy-in-dien-bien-using-drones.htm",
        "validatedUrl": "https://en.vneconomy.vn/vietnam-pilots-low-altitude-economy-in-dien-bien-using-drones.htm",
        "canonicalUrl": "https://en.vneconomy.vn/vietnam-pilots-low-altitude-economy-in-dien-bien-using-drones.htm",
        "publishedAt": "2026-10-08T08:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-08",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 95,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 95,
        "supportedCoreClaimIds": ["claim-vne-01-1"]
      }
    ],
    "originalUrls": [
      "https://en.vneconomy.vn/vietnam-pilots-low-altitude-economy-in-dien-bien-using-drones.htm"
    ],
    "aiModelUsed": "Gemini-1.5-Pro",
    "dateCollected": "2026-10-08",
    "collectionTimestamp": "2026-10-08T08:30:00.000Z",
    "aiAnalysisTimestamp": "2026-10-08T08:30:00.000Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-08",
    "dailyBriefDate": "2026-10-08",
    "eventDate": "2026-10-08",
    "firstSeenAt": "2026-10-08T08:00:00.000Z",
    "lastVerifiedAt": "2026-10-08T08:30:00.000Z",
    "sourceGrounded": true
  },
  {
    "id": "11111111-0411-4444-8888-000000000002",
    "title": "Ninh Binh Approves $44.5 Million GMP Medical Manufacturing Plant",
    "slug": "ninh-binh-approves-445-million-gmp-medical-manufacturing-plant",
    "publicationDate": "2026-10-08",
    "storyDate": "2026-10-08",
    "country": "Vietnam",
    "category": "Healthcare",
    "primarySectorId": "6eea2808-35dc-49ed-b900-8f8ea2391b3e",
    "primarySectorName": "Healthcare",
    "primarySectorSlug": "healthcare",
    "secondarySectors": [
      "4db7fccb-593e-4f3a-b6d2-5f25c3ad9dbc",
      "00e17d71-ab18-443e-b6e6-6564b0459d24"
    ],
    "companiesMentioned": [
      {
        "id": "comp-emj",
        "name": "EMJ Ha Nam Co., Ltd.",
        "slug": "emj-ha-nam",
        "origin": "VIETNAM",
        "role": "DEVELOPER"
      }
    ],
    "summary": "The People's Committee of Ninh Binh Province has approved the investment policy for a VND 1.1 trillion ($44.5 million) high-tech medical manufacturing complex by EMJ Ha Nam Co., Ltd. located in Kim Binh Industrial Cluster. The facility will be constructed to WHO-GMP standards to produce medical supplies, pharmaceuticals, and health supplements across a 4.5-hectare site.",
    "whyItMattersToSojitz": "Directly aligns with Sojitz Corporation's Healthcare Division expansion in Southeast Asia. Offers concrete collaboration avenues in pharmaceutical distribution, cold-chain medical logistics, and chemical raw material sourcing (via Sojitz Chemicals).",
    "suggestedBdAction": "Initiate contact with EMJ Ha Nam leadership to explore specialized medical supply chain partnership, cold-chain distribution, and potential tenant requirements for high-spec industrial facilities.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8.5,
    "verificationStatus": "VERIFIED",
    "confidenceScore": 95,
    "verificationRationale": "Confirmed by official investment approval notice reported on VnEconomy English edition, detailing project capex, site boundaries, and licensing timeline.",
    "extractedFacts": {
      "location": "Ninh Bình",
      "dealValueUsd": 44500000,
      "dealValueText": "$44.5 million (VND 1.1 trillion)",
      "capacityOrSize": "4.5 hectares",
      "announcedTimeline": "October 2026",
      "materialUpdates": [
        {
          "facts": [
            "Total investment capital of VND 1.1 trillion ($44.5 million) by EMJ Ha Nam Co., Ltd.",
            "Project situated on 4.5 hectares in Kim Binh Industrial Cluster, Ninh Binh.",
            "Built to WHO-GMP standards to manufacture medical supplies, pharmaceuticals, and functional foods."
          ],
          "rationale": "Approved investment project.",
          "timestamp": "2026-10-08T09:30:00.000Z",
          "sourceTitle": "Ninh Binh approves $44.5 million GMP medical manufacturing plant"
        }
      ]
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "src-w41-vne-02",
        "sourceId": "src-vneconomy-en",
        "sourceName": "VnEconomy (English)",
        "sourceTier": "TIER_1",
        "articleTitle": "Ninh Binh approves $44.5 million GMP medical manufacturing plant",
        "articleUrl": "https://en.vneconomy.vn/ninh-binh-approves-445-million-gmp-medical-manufacturing-plant.htm",
        "validatedUrl": "https://en.vneconomy.vn/ninh-binh-approves-445-million-gmp-medical-manufacturing-plant.htm",
        "canonicalUrl": "https://en.vneconomy.vn/ninh-binh-approves-445-million-gmp-medical-manufacturing-plant.htm",
        "publishedAt": "2026-10-08T09:30:00.000Z",
        "sourcePublicationDateLocal": "2026-10-08",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 96,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 96,
        "supportedCoreClaimIds": ["claim-vne-02-1"]
      }
    ],
    "originalUrls": [
      "https://en.vneconomy.vn/ninh-binh-approves-445-million-gmp-medical-manufacturing-plant.htm"
    ],
    "aiModelUsed": "Gemini-1.5-Pro",
    "dateCollected": "2026-10-08",
    "collectionTimestamp": "2026-10-08T10:00:00.000Z",
    "aiAnalysisTimestamp": "2026-10-08T10:00:00.000Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-08",
    "dailyBriefDate": "2026-10-08",
    "eventDate": "2026-10-08",
    "firstSeenAt": "2026-10-08T09:30:00.000Z",
    "lastVerifiedAt": "2026-10-08T10:00:00.000Z",
    "sourceGrounded": true
  },
  {
    "id": "11111111-0411-4444-8888-000000000003",
    "title": "Power Tariffs to Be Frozen, Service Fee Hikes Capped to Curb Inflation",
    "slug": "power-tariffs-to-be-frozen-service-fee-hikes-capped-to-curb-inflation",
    "publicationDate": "2026-10-08",
    "storyDate": "2026-10-08",
    "country": "Vietnam",
    "category": "Energy",
    "primarySectorId": "9f76fb2a-a1d2-4b17-b668-26808b9fdf7d",
    "primarySectorName": "Energy",
    "primarySectorSlug": "energy",
    "secondarySectors": [
      "eeba2312-4c6a-4201-8d5c-1ffede309135",
      "00e17d71-ab18-443e-b6e6-6564b0459d24"
    ],
    "companiesMentioned": [
      {
        "id": "comp-evn",
        "name": "EVN",
        "slug": "evn",
        "origin": "VIETNAM",
        "role": "GRID_OPERATOR"
      }
    ],
    "summary": "The Ministry of Finance and Steering Committee for Price Management announced that Vietnam will freeze electricity retail tariffs and cap public service price adjustments through the remainder of 2026. With CPI reaching 4.52% in September near the statutory 4.5% ceiling, the price freeze aims to stabilize production input costs for industrial enterprises and control inflation pressures in Q4.",
    "whyItMattersToSojitz": "Crucial cost-certainty signal for Sojitz Energy Division and manufacturing tenants in Long Duc Industrial Park. While freezing short-term utility overhead, it intensifies financial pressure on EVN, strongly accelerating tenant demand for private rooftop solar and DPPA direct off-take.",
    "suggestedBdAction": "Brief Long Duc Industrial Park tenants on 2026 power tariff freeze and leverage price stability window to market Sojitz on-site rooftop solar PPA solutions ahead of anticipated 2027 tariff restructuring.",
    "businessImpact": "MARKET_INTELLIGENCE",
    "relevanceScore": 8.0,
    "verificationStatus": "VERIFIED",
    "confidenceScore": 94,
    "verificationRationale": "Official government price management directive issued by Ministry of Finance and reported on VnEconomy English edition.",
    "extractedFacts": {
      "location": "Nationwide Vietnam",
      "announcedTimeline": "Q4 2026",
      "materialUpdates": [
        {
          "facts": [
            "Ministry of Finance and Steering Committee for Price Management decided to freeze electricity retail tariffs for Q4 2026.",
            "Public service fee adjustments capped to keep CPI below the statutory 4.5% target.",
            "Headline CPI recorded at 4.52% in September, driving stringent price controls on state-managed goods."
          ],
          "rationale": "Price control decision.",
          "timestamp": "2026-10-08T11:00:00.000Z",
          "sourceTitle": "Power tariffs to be frozen, service fee hikes capped to curb inflation"
        }
      ]
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "src-w41-vne-03",
        "sourceId": "src-vneconomy-en",
        "sourceName": "VnEconomy (English)",
        "sourceTier": "TIER_1",
        "articleTitle": "Power tariffs to be frozen, service fee hikes capped to curb inflation",
        "articleUrl": "https://en.vneconomy.vn/power-tariffs-to-be-frozen-service-fee-hikes-capped-to-curb-inflation.htm",
        "validatedUrl": "https://en.vneconomy.vn/power-tariffs-to-be-frozen-service-fee-hikes-capped-to-curb-inflation.htm",
        "canonicalUrl": "https://en.vneconomy.vn/power-tariffs-to-be-frozen-service-fee-hikes-capped-to-curb-inflation.htm",
        "publishedAt": "2026-10-08T11:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-08",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 94,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 94,
        "supportedCoreClaimIds": ["claim-vne-03-1"]
      }
    ],
    "originalUrls": [
      "https://en.vneconomy.vn/power-tariffs-to-be-frozen-service-fee-hikes-capped-to-curb-inflation.htm"
    ],
    "aiModelUsed": "Gemini-1.5-Pro",
    "dateCollected": "2026-10-08",
    "collectionTimestamp": "2026-10-08T11:30:00.000Z",
    "aiAnalysisTimestamp": "2026-10-08T11:30:00.000Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-08",
    "dailyBriefDate": "2026-10-08",
    "eventDate": "2026-10-08",
    "firstSeenAt": "2026-10-08T11:00:00.000Z",
    "lastVerifiedAt": "2026-10-08T11:30:00.000Z",
    "sourceGrounded": true
  },
  {
    "id": "11111111-0411-4444-8888-000000000004",
    "title": "Triple Helix Collaboration Roadmap Established for Semiconductors",
    "slug": "triple-helix-collaboration-roadmap-established-for-semiconductors",
    "publicationDate": "2026-10-08",
    "storyDate": "2026-10-08",
    "country": "Vietnam",
    "category": "Technology",
    "primarySectorId": "4db7fccb-593e-4f3a-b6d2-5f25c3ad9dbc",
    "primarySectorName": "Manufacturing",
    "primarySectorSlug": "manufacturing",
    "secondarySectors": [
      "55135ad2-7bae-43a7-af0f-ccb6cebf1858",
      "00e17d71-ab18-443e-b6e6-6564b0459d24"
    ],
    "companiesMentioned": [],
    "summary": "A national semiconductor symposium in Da Nang established a formal 'Triple Helix' collaboration roadmap linking the State, Academia, and Industry to implement Prime Ministerial Decisions 1018/QD-TTg and 1017/QD-TTg. The initiative outlines specialized IC design training, testing labs, and state incentives to cultivate 50,000 semiconductor engineers by 2030.",
    "whyItMattersToSojitz": "Directly impacts Sojitz's Automotive & Machinery Division and high-tech industrial park positioning. Expanding semiconductor fabrication, testing, and packaging (ATP) clusters in Vietnam drives high demand for Japanese precision manufacturing equipment, electronic chemicals, and reliable cleanroom infrastructure.",
    "suggestedBdAction": "Engage Da Nang Semiconductor and Artificial Intelligence Center (DSAC) and leading technical universities to explore semiconductor ecosystem partnerships and industrial park infrastructure readiness for Japanese chip suppliers.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8.5,
    "verificationStatus": "VERIFIED",
    "confidenceScore": 93,
    "verificationRationale": "Confirmed by official ministerial and municipal proceedings reported on VnEconomy English edition referencing Decisions 1018/QD-TTg and 1017/QD-TTg.",
    "extractedFacts": {
      "location": "Đà Nẵng",
      "announcedTimeline": "2026 - 2030",
      "materialUpdates": [
        {
          "facts": [
            "Triple Helix framework links State, Academia, and Industry to implement Decisions 1018/QD-TTg and 1017/QD-TTg.",
            "Aims to train 50,000 semiconductor engineers and establish advanced testing and packaging labs by 2030.",
            "Symposium organized with participation of Da Nang People's Committee, Ministry of Planning and Investment, and tech leaders."
          ],
          "rationale": "National strategy roadmap.",
          "timestamp": "2026-10-08T14:15:00.000Z",
          "sourceTitle": "Triple Helix collaboration roadmap established for semiconductors"
        }
      ]
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "src-w41-vne-04",
        "sourceId": "src-vneconomy-en",
        "sourceName": "VnEconomy (English)",
        "sourceTier": "TIER_1",
        "articleTitle": "Triple Helix collaboration roadmap established for semiconductors",
        "articleUrl": "https://en.vneconomy.vn/triple-helix-collaboration-roadmap-established-for-semiconductors.htm",
        "validatedUrl": "https://en.vneconomy.vn/triple-helix-collaboration-roadmap-established-for-semiconductors.htm",
        "canonicalUrl": "https://en.vneconomy.vn/triple-helix-collaboration-roadmap-established-for-semiconductors.htm",
        "publishedAt": "2026-10-08T14:15:00.000Z",
        "sourcePublicationDateLocal": "2026-10-08",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 95,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 95,
        "supportedCoreClaimIds": ["claim-vne-04-1"]
      }
    ],
    "originalUrls": [
      "https://en.vneconomy.vn/triple-helix-collaboration-roadmap-established-for-semiconductors.htm"
    ],
    "aiModelUsed": "Gemini-1.5-Pro",
    "dateCollected": "2026-10-08",
    "collectionTimestamp": "2026-10-08T14:45:00.000Z",
    "aiAnalysisTimestamp": "2026-10-08T14:45:00.000Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-08",
    "dailyBriefDate": "2026-10-08",
    "eventDate": "2026-10-08",
    "firstSeenAt": "2026-10-08T14:15:00.000Z",
    "lastVerifiedAt": "2026-10-08T14:45:00.000Z",
    "sourceGrounded": true
  },
  {
    "id": "af381a91-be25-40c7-825c-ffd99eae1934",
    "title": "Accelerating Toward APEC 2027: Gia Binh Airport and High-Tech Aviation Logistics Development",
    "slug": "tang-toc-huong-en-apec-2027-san-bay-gia-binh-va-bai-toan-ha-tang-mang-tam-quoc-g-895cd88a",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "Infrastructure",
    "primarySectorId": "eeba2312-4c6a-4201-8d5c-1ffede309135",
    "primarySectorName": "Infrastructure",
    "primarySectorSlug": "infrastructure",
    "secondarySectors": [
      "86856795-a1b9-4d21-8585-d00e6e53af40"
    ],
    "companiesMentioned": [],
    "summary": "Development of the specialized Gia Binh Airport in Bac Ninh Province is being accelerated ahead of the APEC 2027 summit, laying the foundation for a high-tech aviation, maintenance, and air cargo economic hub in northern Vietnam.",
    "whyItMattersToSojitz": "Aviation and logistics infrastructure expansion in Bac Ninh strengthens the Hanoi - Bac Ninh - Hai Phong industrial corridor, where numerous Japanese electronics suppliers and Sojitz trading counterparties operate.",
    "suggestedBdAction": "Logistics taskforce to study multi-modal air freight and cold-chain forwarding opportunities connecting industrial manufacturing zones around Gia Binh with international cargo hubs.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 61,
    "verificationRationale": "Reported exclusively by single outlet (CafeBiz). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hà Nội",
      "dealValueUsd": null,
      "dealValueText": "khoảng 8.300 tỷ",
      "capacityOrSize": null,
      "materialUpdates": [
        {
          "facts": [
            "Nhà ga VIP, tháp kiểm soát không lưu, đường băng và những hệ thống vận hành ứng dụng AI đang đồng thời được triển khaigấp rút tại Cảng Hàng không Quốc tế Gia Bình, hướng tới mục tiêu sẵn sàng phục vụ APEC 2027.",
            "6 tháng trước APEC 2027: Từ công trường đến năng lực vận hành",
            "Đến cuối tháng 8/2026, tháp kiểm soát không lưu đã hoàn thành phần kết cấu chính ở độ cao thiết kế 127 m.",
            "Nhà ga VIP, đường băng và nhiều hạng mục trọng điểm khác đang được đẩy nhanh tiến độ.",
            "Các công việc xây dựng được triển khai song song với mua sắm, lắp đặt và chuẩn bị vận hành, hướng tới các mốc hoàn thành trước APEC 2027.",
            "Song song với hạ tầng sân bay, tuyến kết nối Gia Bình – Hà Nội cũng đang được hình thành, mở rộng khả năng liên thông giữa sân bay với Hà Nội và khu vực trọng điểm.",
            "Phía sau đó là lớp năng lực về nhân sự, công nghệ và vận hành đang được xây dựng đồng thời.",
            "Sân bay Gia Bình đã hoàn thành gần 90% tuyển dụng các vị trí vận hành cùng các chương trình đào tạo và chứng chỉ cần thiết, và đặt mục tiêu hoàn tất 100% vào cuối năm 2026.",
            "Các hệ thống phần mềm lõi phục vụ Nhà ga VIP đang được đội ngũ công nghệ của sân bay Gia Bình phối hợp cùng One Mount phát triển.",
            "Nhìn ra thế giới, sự thay đổi này đã diễn ra tại nhiều trung tâm hàng không lớn.",
            "Theo IATA, hàng không vận chuyển hơn 62 triệu tấn hàng hóa mỗi năm.",
            "Dù chiếm chưa tới 1% khối lượng thương mại toàn cầu, lượng hàng hóa này đại diện cho hơn 33% giá trị, tương đương khoảng 8.300 tỷ USD.",
            "Sân bay Gia Bình nằm giữa một nền kinh tế đã có sẵn nhu cầu kết nối quốc tế",
            "Bắc Ninh năm 2025 đạt tổng kim ngạch xuất nhập khẩu khoảng 182 tỷ USD, với điện tử, máy tính và sản phẩm quang học tiếp tục là những ngành chủ đạo trong cơ cấu sản xuất của địa phương.",
            "Nói cách khác, trước khi Gia Bình trở thành một sân bay quốc tế hoàn chỉnh, xung quanh nó đã tồn tại một nền kinh tế sản xuất – xuất khẩu có nhu cầu lớn về kết nối."
          ],
          "rationale": "Material milestone detected in new source: contains \"hoàn thành\".",
          "timestamp": "2026-10-07T16:51:13.813Z",
          "sourceTitle": "Tăng tốc hướng đến APEC 2027: Sân bay Gia Bình và bài toán hạ tầng mang tầm quốc gia"
        },
        {
          "facts": [
            "Nhà ga VIP, tháp kiểm soát không lưu, đường băng và những hệ thống vận hành ứng dụng AI đang đồng thời được triển khaigấp rút tại Cảng Hàng không Quốc tế Gia Bình, hướng tới mục tiêu sẵn sàng phục vụ APEC 2027.",
            "6 tháng trước APEC 2027: Từ công trường đến năng lực vận hành",
            "Đến cuối tháng 8/2026, tháp kiểm soát không lưu đã hoàn thành phần kết cấu chính ở độ cao thiết kế 127 m.",
            "Nhà ga VIP, đường băng và nhiều hạng mục trọng điểm khác đang được đẩy nhanh tiến độ.",
            "Các công việc xây dựng được triển khai song song với mua sắm, lắp đặt và chuẩn bị vận hành, hướng tới các mốc hoàn thành trước APEC 2027.",
            "Song song với hạ tầng sân bay, tuyến kết nối Gia Bình – Hà Nội cũng đang được hình thành, mở rộng khả năng liên thông giữa sân bay với Hà Nội và khu vực trọng điểm.",
            "Phía sau đó là lớp năng lực về nhân sự, công nghệ và vận hành đang được xây dựng đồng thời.",
            "Sân bay Gia Bình đã hoàn thành gần 90% tuyển dụng các vị trí vận hành cùng các chương trình đào tạo và chứng chỉ cần thiết, và đặt mục tiêu hoàn tất 100% vào cuối năm 2026.",
            "Các hệ thống phần mềm lõi phục vụ Nhà ga VIP đang được đội ngũ công nghệ của sân bay Gia Bình phối hợp cùng One Mount phát triển.",
            "Nhìn ra thế giới, sự thay đổi này đã diễn ra tại nhiều trung tâm hàng không lớn.",
            "Theo IATA, hàng không vận chuyển hơn 62 triệu tấn hàng hóa mỗi năm.",
            "Dù chiếm chưa tới 1% khối lượng thương mại toàn cầu, lượng hàng hóa này đại diện cho hơn 33% giá trị, tương đương khoảng 8.300 tỷ USD.",
            "Sân bay Gia Bình nằm giữa một nền kinh tế đã có sẵn nhu cầu kết nối quốc tế",
            "Bắc Ninh năm 2025 đạt tổng kim ngạch xuất nhập khẩu khoảng 182 tỷ USD, với điện tử, máy tính và sản phẩm quang học tiếp tục là những ngành chủ đạo trong cơ cấu sản xuất của địa phương.",
            "Nói cách khác, trước khi Gia Bình trở thành một sân bay quốc tế hoàn chỉnh, xung quanh nó đã tồn tại một nền kinh tế sản xuất – xuất khẩu có nhu cầu lớn về kết nối."
          ],
          "rationale": "Material milestone detected in new source: contains \"hoàn thành\".",
          "timestamp": "2026-10-07T16:51:52.030Z",
          "sourceTitle": "Tăng tốc hướng đến APEC 2027: Sân bay Gia Bình và bài toán hạ tầng mang tầm quốc gia"
        }
      ],
      "stakePercentage": 90,
      "announcedTimeline": "Tháng 8/2026"
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "6f40b6ab-e6a9-44f2-bd19-70e1e7c1b4db",
        "sourceId": "895cd88a-9206-48dc-b128-e8fdbced6ba6",
        "sourceName": "CafeBiz",
        "sourceTier": "TIER_1",
        "articleTitle": "Tăng tốc hướng đến APEC 2027: Sân bay Gia Bình và bài toán hạ tầng mang tầm quốc gia",
        "articleUrl": "https://cafebiz.vn/tang-toc-huong-den-apec-2027-san-bay-gia-binh-va-bai-toan-ha-tang-mang-tam-quoc-gia-176261007211337765.chn",
        "validatedUrl": "https://cafebiz.vn/tang-toc-huong-den-apec-2027-san-bay-gia-binh-va-bai-toan-ha-tang-mang-tam-quoc-gia-176261007211337765.chn",
        "canonicalUrl": "https://cafebiz.vn/tang-toc-huong-den-apec-2027-san-bay-gia-binh-va-bai-toan-ha-tang-mang-tam-quoc-gia-176261007211337765.chn",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 95,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 95,
        "supportedCoreClaimIds": [
          "claim-bf948737-1",
          "claim-bf948737-2",
          "claim-bf948737-3",
          "claim-bf948737-4",
          "claim-bf948737-5"
        ]
      }
    ],
    "originalUrls": [
      "https://cafebiz.vn/tang-toc-huong-den-apec-2027-san-bay-gia-binh-va-bai-toan-ha-tang-mang-tam-quoc-gia-176261007211337765.chn"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.238Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.238Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:40.436Z",
    "lastVerifiedAt": "2026-10-07T16:51:52.030Z",
    "eventFingerprint": "LOGISTICS_PROJECT|AN_O_BAC_NINH_BINH_INH|GENERAL_ASSET|HA_NOI|Tháng 8/20|NO_TX",
    "materialUpdate": true,
    "materialUpdateRationale": "Material milestone detected in new source: contains \"hoàn thành\".",
    "clusterId": "bf948737-9c36-49f2-84ff-388eb63eb54f"
  },
  {
    "id": "74e32d9d-d434-4949-a550-f43f0072d79f",
    "title": "Government Directs 9 Key Economic Provinces to Exceed 15% GRDP Growth in Q4",
    "slug": "chinh-phu-yeu-cau-9-ia-phuong-tang-truong-tren-15-trong-quy-iv-7546c729",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "INVESTMENT",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "Under Resolution 312, the Government of Vietnam has mandated that 9 key industrial provinces—including Dong Nai, Hai Phong, and Bac Ninh—achieve double-digit growth exceeding 15% in Q4 to ensure the national annual growth target of 10% is attained.",
    "whyItMattersToSojitz": "High regional growth mandates will accelerate public capex disbursements, infrastructure arterial road construction, and administrative clearances across key economic hubs where Sojitz operates.",
    "suggestedBdAction": "Maintain proactive coordination with the Dong Nai People’s Committee to advance land clearance and administrative approvals for Sojitz industrial and logistics ventures.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 60,
    "verificationRationale": "Reported exclusively by single outlet (VnExpress Kinh Doanh). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hà Nội",
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": 15,
      "announcedTimeline": "Tháng 9"
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "e5ad28fa-ae4e-4cd7-ac6e-d1a289c3de99",
        "sourceId": "7546c729-1ce9-4dce-8c6f-0c4fb4fb1ba4",
        "sourceName": "VnExpress Kinh Doanh",
        "sourceTier": "TIER_1",
        "articleTitle": "Chính phủ yêu cầu 9 địa phương tăng trưởng trên 15% trong quý IV",
        "articleUrl": "https://vnexpress.net/chinh-phu-yeu-cau-9-dia-phuong-tang-truong-tren-15-trong-quy-iv-5129670.html",
        "validatedUrl": "https://vnexpress.net/chinh-phu-yeu-cau-9-dia-phuong-tang-truong-tren-15-trong-quy-iv-5129670.html",
        "canonicalUrl": "https://vnexpress.net/chinh-phu-yeu-cau-9-dia-phuong-tang-truong-tren-15-trong-quy-iv-5129670.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 98,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 98,
        "supportedCoreClaimIds": [
          "claim-d81829c7-1",
          "claim-d81829c7-2",
          "claim-d81829c7-3",
          "claim-d81829c7-4",
          "claim-d81829c7-5"
        ]
      }
    ],
    "originalUrls": [
      "https://vnexpress.net/chinh-phu-yeu-cau-9-dia-phuong-tang-truong-tren-15-trong-quy-iv-5129670.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:51:52.001Z",
    "aiAnalysisTimestamp": "2026-10-07T16:51:52.001Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2001-08-31",
    "firstSeenAt": "2026-10-07T16:51:45.300Z",
    "lastVerifiedAt": "2026-10-07T16:51:52.001Z",
    "eventFingerprint": "INVESTMENT|BAC_NINH_BO_TAI_CHINH_MOF_CA_MAU|GENERAL_ASSET|HA_NOI|Tháng 9|NO_TX",
    "materialUpdate": false,
    "clusterId": "d81829c7-c886-46f1-b322-7eb7e6b93b4e"
  },
  {
    "id": "5bad090d-195a-49e2-9b72-ec952c3be122",
    "title": "Ministry of Industry and Trade: Weighs Establishment of National Strategic Power Generation Corporation",
    "slug": "bo-cong-thuong-xem-xet-lap-tong-cong-ty-phat-ien-chien-luoc-quoc-gia-c798b755",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "POLICY_CHANGE",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "MOIT is evaluating a restructuring proposal to establish a National Strategic Power Generation Corporation to oversee critical base-load power assets and ensure national energy security in alignment with Power Development Plan VIII (PDP8).",
    "whyItMattersToSojitz": "Sojitz Energy Division must monitor structural realignments among state power offtakers to position future LNG-to-power and clean energy joint venture assets effectively within the centralized dispatch hierarchy.",
    "suggestedBdAction": "Incorporate new power market dispatch and state off-take structures into feasibility studies for Sojitz pipeline LNG and hybrid generation projects.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 58,
    "verificationRationale": "Reported exclusively by single outlet (Tuoi Tre Online). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Việt Nam",
      "keyQuotes": [
        "Dẫn kinh nghiệm từ quốc tế, ông Hùng cho hay xu thế tại các quốc gia phát triển thị trường điện cạnh tranh thành công đều dựa trên nguyên tắc cốt lõi: Tách bạch giữa khâu mang tính độc quyền tự nhiên và khâu mang tính cạnh tranh trong chuỗi sản xuất điện năng cung ứng cho khách hàng sử dụng điện."
      ],
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": null,
      "announcedTimeline": "15-9"
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "477a5e50-9d19-473c-bfc4-75c1516c68a7",
        "sourceId": "c798b755-01dd-4931-af36-53edf5f28809",
        "sourceName": "Tuoi Tre Online",
        "sourceTier": "TIER_1",
        "articleTitle": "Bộ Công Thương: Xem xét lập Tổng công ty Phát điện chiến lược quốc gia",
        "articleUrl": "https://tuoitre.vn/bo-cong-thuong-xem-xet-lap-tong-cong-ty-phat-dien-chien-luoc-quoc-gia-100261007175938364.htm",
        "validatedUrl": "https://tuoitre.vn/bo-cong-thuong-xem-xet-lap-tong-cong-ty-phat-dien-chien-luoc-quoc-gia-100261007175938364.htm",
        "canonicalUrl": "https://tuoitre.vn/bo-cong-thuong-xem-xet-lap-tong-cong-ty-phat-dien-chien-luoc-quoc-gia-100261007175938364.htm",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 95,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 95,
        "supportedCoreClaimIds": [
          "claim-8d7e11e7-1",
          "claim-8d7e11e7-2",
          "claim-8d7e11e7-3",
          "claim-8d7e11e7-4",
          "claim-8d7e11e7-5"
        ]
      }
    ],
    "originalUrls": [
      "https://tuoitre.vn/bo-cong-thuong-xem-xet-lap-tong-cong-ty-phat-dien-chien-luoc-quoc-gia-100261007175938364.htm"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.222Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.222Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:43.602Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.222Z",
    "eventFingerprint": "POLICY_CHANGE|BO_CONG_THUONG_MOIT_BO_TAI_CHINH_MOF_CHINH_PHU_VIET_NAM|GENERAL_ASSET|VIET_NAM|15-9|NO_TX",
    "materialUpdate": false,
    "clusterId": "8d7e11e7-eaed-4d4d-83f9-57625ed0bd9f"
  },
  {
    "id": "70877fdd-dc16-4e99-b4aa-c485c1bc73fe",
    "title": "Quang Ngai Sugar Approved to Develop $67M Bioethanol Plant in Central Vietnam",
    "slug": "quang-ngai-sugar-jsc-approved-to-develop-67-mln-ethanol-plant-in-central-vietnam-1d5f5c68",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "Industrial Parks",
    "primarySectorId": "00e17d71-ab18-443e-b6e6-6564b0459d24",
    "primarySectorName": "Industrial Parks",
    "primarySectorSlug": "industrial-parks",
    "secondarySectors": [
      "4db7fccb-593e-4f3a-b6d2-5f25c3ad9dbc",
      "5309a5ff-0059-4724-8b68-331ee687e208",
      "b268d5a2-3860-4b5a-a4ed-47631b1b2927"
    ],
    "companiesMentioned": [],
    "summary": "Quang Ngai Sugar JSC (UPCoM: QNS) has received provincial investment approval to construct the An Khe bioethanol plant in Gia Lai with an aggregate investment of VND 1.74 trillion ( million), processing sugarcane residues into sustainable biofuel.",
    "whyItMattersToSojitz": "Strategic opportunity for Sojitz Chemicals & Bio-Energy Division. Bioethanol represents a key decarbonization feedstock for sustainable aviation fuel (SAF) and green chemicals, aligning with Sojitz global sustainability commitments.",
    "suggestedBdAction": "Chemicals Division to contact QNS commercial leadership to explore bioethanol off-take arrangements and potential technical cooperation in bio-refining.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 61,
    "verificationRationale": "Reported exclusively by single outlet (The Investor). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hanoi",
      "keyPartners": [
        "Vingroup"
      ],
      "dealValueUsd": 67,
      "dealValueText": "$67 million",
      "capacityOrSize": "135 MW",
      "materialUpdates": [
        {
          "facts": [
            "Quang Ngai Sugar JSC (UPCoM: QNS), owner of the popular Vietnamese soy milk brand Vinasoy, will develop its An Khe ethanol plant with total investment of more than VND1.74 trillion ($67 million) in the central province of Gia Lai.",
            "Under the in-principle approval, the project will cover more than 8 hectares in An Khe ward and produce fuel ethanol, food-grade alcohol, electricity, liquid CO2, dry yeast, and fusel oil.",
            "Once completed, the plant will have a designed capacity of 200,000 liters of ethanol a day, 21 million liters of alcohol a year, 90 metric tons of liquid CO2 a day, 11.2 metric tons of dry yeast a day and 0.5 metric tons of fusel oil a day, as well as 7 megawatts of electricity generation capacity.",
            "Under the approved schedule, QNS expects to complete investment procedures in the fourth quarter of 2026, begin construction in the first quarter of 2027 and complete and commission the plant in the third quarter of 2028.",
            "The project will have an operating term of 50 years.",
            "At its 2026 annual general meeting of shareholders, QNS leadership said Vietnam's gasoline consumption is currently about 25 million tons a year.",
            "The market is using E5 gasoline and has a roadmap to shift to E10.",
            "From January 1, 2028, Vietnam will require the use of E10 gasoline and stop the circulation of A95 gasoline, creating significant demand for fuel ethanol.",
            "Under QNS's development strategy, the sugarcane-growing area in Gia Lai is expected to expand to about 40,000 hectares in the coming period to support sugar processing.",
            "At that scale, molasses production from sugar processing is estimated at about 170,000 tons a year, equivalent to the potential production of about 44.85 million liters of ethanol annually.",
            "The Central-Central Highlands region is also home to several sugar mills, including Ayun Pa Gia Lai, KCP Vietnam, Tuy Hoa, Kon Tum, 333 Dak Lak, Dak Nong and Phan Rang.",
            "QNS, based in the central province of Quang Ngai, was equitized from a state-owned enterprise under a 2005 decision by the then Ministry of Agriculture and Rural Development.",
            "The company began trading on the Unlisted Public Company Market (UPCoM) in late 2016 and has charter capital of about VND3.68 trillion ($141.47 million).",
            "QNS's An Khe Sugar Mill currently has a sugarcane processing line with capacity of 18,000 tons a day, which is being expanded to 25,000 tons, along with a refined sugar production line with capacity of 1,000 tons a day.",
            "It is Vietnam's largest sugarcane-processing plant by scale and accounts for more than 20% of the country's processed sugar output."
          ],
          "rationale": "Material milestone detected in new source: contains \"completed\".",
          "timestamp": "2026-10-07T16:51:13.794Z",
          "sourceTitle": "Quang Ngai Sugar JSC approved to develop $67 mln ethanol plant in central Vietnam"
        },
        {
          "facts": [
            "Quang Ngai Sugar JSC (UPCoM: QNS), owner of the popular Vietnamese soy milk brand Vinasoy, will develop its An Khe ethanol plant with total investment of more than VND1.74 trillion ($67 million) in the central province of Gia Lai.",
            "Under the in-principle approval, the project will cover more than 8 hectares in An Khe ward and produce fuel ethanol, food-grade alcohol, electricity, liquid CO2, dry yeast, and fusel oil.",
            "Once completed, the plant will have a designed capacity of 200,000 liters of ethanol a day, 21 million liters of alcohol a year, 90 metric tons of liquid CO2 a day, 11.2 metric tons of dry yeast a day and 0.5 metric tons of fusel oil a day, as well as 7 megawatts of electricity generation capacity.",
            "Under the approved schedule, QNS expects to complete investment procedures in the fourth quarter of 2026, begin construction in the first quarter of 2027 and complete and commission the plant in the third quarter of 2028.",
            "The project will have an operating term of 50 years.",
            "At its 2026 annual general meeting of shareholders, QNS leadership said Vietnam's gasoline consumption is currently about 25 million tons a year.",
            "The market is using E5 gasoline and has a roadmap to shift to E10.",
            "From January 1, 2028, Vietnam will require the use of E10 gasoline and stop the circulation of A95 gasoline, creating significant demand for fuel ethanol.",
            "Under QNS's development strategy, the sugarcane-growing area in Gia Lai is expected to expand to about 40,000 hectares in the coming period to support sugar processing.",
            "At that scale, molasses production from sugar processing is estimated at about 170,000 tons a year, equivalent to the potential production of about 44.85 million liters of ethanol annually.",
            "The Central-Central Highlands region is also home to several sugar mills, including Ayun Pa Gia Lai, KCP Vietnam, Tuy Hoa, Kon Tum, 333 Dak Lak, Dak Nong and Phan Rang.",
            "QNS, based in the central province of Quang Ngai, was equitized from a state-owned enterprise under a 2005 decision by the then Ministry of Agriculture and Rural Development.",
            "The company began trading on the Unlisted Public Company Market (UPCoM) in late 2016 and has charter capital of about VND3.68 trillion ($141.47 million).",
            "QNS's An Khe Sugar Mill currently has a sugarcane processing line with capacity of 18,000 tons a day, which is being expanded to 25,000 tons, along with a refined sugar production line with capacity of 1,000 tons a day.",
            "It is Vietnam's largest sugarcane-processing plant by scale and accounts for more than 20% of the country's processed sugar output."
          ],
          "rationale": "Material milestone detected in new source: contains \"completed\".",
          "timestamp": "2026-10-07T16:51:52.032Z",
          "sourceTitle": "Quang Ngai Sugar JSC approved to develop $67 mln ethanol plant in central Vietnam"
        }
      ],
      "stakePercentage": 20,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "a7e196c1-aebd-4627-8ee3-e4f6e9aa51ff",
        "sourceId": "1d5f5c68-99ea-4851-9c65-b73f013fef9a",
        "sourceName": "The Investor",
        "sourceTier": "TIER_1",
        "articleTitle": "Quang Ngai Sugar JSC approved to develop $67 mln ethanol plant in central Vietnam",
        "articleUrl": "https://theinvestor.vn/quang-ngai-sugar-jsc-approved-to-develop-67-mln-ethanol-plant-in-central-vietnam-d20171.html",
        "validatedUrl": "https://theinvestor.vn/quang-ngai-sugar-jsc-approved-to-develop-67-mln-ethanol-plant-in-central-vietnam-d20171.html",
        "canonicalUrl": "https://theinvestor.vn/quang-ngai-sugar-jsc-approved-to-develop-67-mln-ethanol-plant-in-central-vietnam-d20171.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-e9f3fd3b-1",
          "claim-e9f3fd3b-2",
          "claim-e9f3fd3b-3",
          "claim-e9f3fd3b-4",
          "claim-e9f3fd3b-5"
        ]
      }
    ],
    "originalUrls": [
      "https://theinvestor.vn/quang-ngai-sugar-jsc-approved-to-develop-67-mln-ethanol-plant-in-central-vietnam-d20171.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.246Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.246Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T07:31:01.847Z",
    "lastVerifiedAt": "2026-10-07T16:51:52.032Z",
    "eventFingerprint": "NEW_FACTORY|ALSTOM_HANOI_HCMC|GENERAL_ASSET|HANOI|2026-10-07|NO_TX",
    "materialUpdate": true,
    "materialUpdateRationale": "Material milestone detected in new source: contains \"completed\".",
    "clusterId": "e9f3fd3b-53aa-49a2-8d71-6903acdfac51"
  },
  {
    "id": "9da3f12a-2029-4399-879c-b8da5cd479d2",
    "title": "Ministry of Industry and Trade: Move to Expedite EVNNPT Grid Unbundling from EVN",
    "slug": "bo-cong-thuong-som-tach-tong-cong-ty-truyen-tai-ien-quoc-gia-khoi-evn-f7f373b8",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "POLICY_CHANGE",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "The Ministry of Industry and Trade (MOIT) has announced plans to expedite the legal unbundling of the National Power Transmission Corporation (EVNNPT) from Electricity of Vietnam (EVN). The restructuring establishes an independent transmission system operator to ensure transparent, non-discriminatory grid access under the competitive wholesale power market.",
    "whyItMattersToSojitz": "Critical milestone for Sojitz Energy & Power Projects Division. Independent transmission operation is a vital prerequisite for Direct Power Purchase Agreements (DPPA) and third-party grid interconnection, allowing Sojitz renewable power assets to wheel clean energy transparently to industrial park offtakers.",
    "suggestedBdAction": "Energy Division Taskforce to monitor the issuance of the restructuring decree and assess its positive impact on grid interconnection contracts for planned wind and solar assets.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 56,
    "verificationRationale": "Reported exclusively by single outlet (VietnamNet Global). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Việt Nam",
      "keyQuotes": [
        "Thông tin trên được ông Bùi Quốc Hùng, Phó cục trưởng Cục Điện lực (Bộ Công Thương) chia sẻ tại họp báo thường kỳ của Bộ Công Thương chiều 7/10.",
        "Ông Bùi Quốc Hùng cho biết, mới đây Chính phủ giao Bộ Công Thương xây dựng hai đề án liên quan đến quá trình sắp xếp ngành điện, bao gồm: Đề án tái cơ cấu ngành điện phục vụ phát triển thị trường điện cạnh tranh và Đề án tái cơ cấu Tập đoàn Điện lực Việt Nam (EVN).",
        "Lãnh đạo Cục Điện lực nhấn mạnh truyền tải điện mang tính độc quyền tự nhiên, bởi không thể xây dựng nhiều đường dây song song chỉ để tạo cạnh tranh, trong khi đất đai có hạn và việc đầu tư trùng lặp sẽ làm giảm hiệu quả."
      ],
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": 40,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "26f3f110-dc75-4039-9737-3302949a1923",
        "sourceId": "9947db07-abf6-4a14-8444-ca3aeafa3460",
        "sourceName": "Thanh Nien Business",
        "sourceTier": "TIER_1",
        "articleTitle": "Tách EVNNPT khỏi EVN, xóa độc quyền truyền tải điện",
        "articleUrl": "https://thanhnien.vn/tach-evnnpt-khoi-evn-xoa-doc-quyen-truyen-tai-dien-18526100719591809.htm",
        "validatedUrl": "https://thanhnien.vn/tach-evnnpt-khoi-evn-xoa-doc-quyen-truyen-tai-dien-18526100719591809.htm",
        "canonicalUrl": "https://thanhnien.vn/tach-evnnpt-khoi-evn-xoa-doc-quyen-truyen-tai-dien-18526100719591809.htm",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 90,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 90,
        "supportedCoreClaimIds": [
          "claim-27410002-1",
          "claim-27410002-2",
          "claim-27410002-3",
          "claim-27410002-4",
          "claim-27410002-5"
        ]
      },
      {
        "id": "5da9a94b-d899-42aa-81a2-32e57eed669b",
        "sourceId": "f7f373b8-1204-4a97-8aad-c9a99764d32d",
        "sourceName": "VietnamNet Global",
        "sourceTier": "TIER_1",
        "articleTitle": "Bộ Công Thương: Sớm tách Tổng công ty Truyền tải điện quốc gia khỏi EVN",
        "articleUrl": "https://vietnamnet.vn/tong-cong-ty-truyen-tai-dien-quoc-gia-duoc-dinh-huong-som-tach-khoi-evn-2562641.html",
        "validatedUrl": "https://vietnamnet.vn/tong-cong-ty-truyen-tai-dien-quoc-gia-duoc-dinh-huong-som-tach-khoi-evn-2562641.html",
        "canonicalUrl": "https://vietnamnet.vn/tong-cong-ty-truyen-tai-dien-quoc-gia-duoc-dinh-huong-som-tach-khoi-evn-2562641.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-13718872-1",
          "claim-13718872-2",
          "claim-13718872-3",
          "claim-13718872-4",
          "claim-13718872-5"
        ]
      }
    ],
    "originalUrls": [
      "https://thanhnien.vn/tach-evnnpt-khoi-evn-xoa-doc-quyen-truyen-tai-dien-18526100719591809.htm",
      "https://vietnamnet.vn/tong-cong-ty-truyen-tai-dien-quoc-gia-duoc-dinh-huong-som-tach-khoi-evn-2562641.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.219Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.219Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 2,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:44.827Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.219Z",
    "eventFingerprint": "POLICY_CHANGE|BO_CONG_THUONG_MOIT_BO_TAI_CHINH_MOF_CHINH_PHU_VIET_NAM|GENERAL_ASSET|VIET_NAM|2026-10-07|NO_TX",
    "materialUpdate": false,
    "clusterId": "13718872-07e8-4f02-bbd9-33d181bcc8f7"
  },
  {
    "id": "f820d67b-431b-4a06-9040-92f67bbc15a7",
    "title": "Deputy Prime Minister Directs Sanctions on Underperforming Contractors at Long Thanh Airport Project",
    "slug": "pho-thu-tuong-yeu-cau-xu-ly-nha-thau-cham-tre-thi-cong-san-bay-long-thanh-d20663a8",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "POLICY_CHANGE",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "The Deputy Prime Minister has instructed the Ministry of Transport and Airports Corporation of Vietnam (ACV) to strictly sanction contractors causing delays and accelerate execution timelines to ensure Phase 1 commercial operations of Long Thanh International Airport remain on schedule.",
    "whyItMattersToSojitz": "Long Thanh International Airport is directly adjacent to Sojitz Long Duc Industrial Park in Dong Nai Province. Timely completion of the airport and feeder expressways directly multiplies warehousing demand, logistics connectivity, and tenant attraction at Long Duc IP.",
    "suggestedBdAction": "Long Duc Industrial Park management team to align surrounding logistics park expansion marketing with updated airport arterial road opening schedules.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 59,
    "verificationRationale": "Reported exclusively by single outlet (Thanh Nien Business). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "TP.HCM",
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": null,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "0d884431-ba3d-4a40-952e-d72d4cce8d19",
        "sourceId": "d20663a8-559e-43aa-8776-1802866abb51",
        "sourceName": "Thanh Nien Business",
        "sourceTier": "TIER_1",
        "articleTitle": "Phó Thủ tướng yêu cầu xử lý nhà thầu chậm trễ thi công sân bay Long Thành",
        "articleUrl": "https://thanhnien.vn/pho-thu-tuong-yeu-cau-xu-ly-nha-thau-cham-tre-thi-cong-san-bay-long-thanh-185261007180539932.htm",
        "validatedUrl": "https://thanhnien.vn/pho-thu-tuong-yeu-cau-xu-ly-nha-thau-cham-tre-thi-cong-san-bay-long-thanh-185261007180539932.htm",
        "canonicalUrl": "https://thanhnien.vn/pho-thu-tuong-yeu-cau-xu-ly-nha-thau-cham-tre-thi-cong-san-bay-long-thanh-185261007180539932.htm",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-c0d492eb-1",
          "claim-c0d492eb-2",
          "claim-c0d492eb-3",
          "claim-c0d492eb-4",
          "claim-c0d492eb-5"
        ]
      }
    ],
    "originalUrls": [
      "https://thanhnien.vn/pho-thu-tuong-yeu-cau-xu-ly-nha-thau-cham-tre-thi-cong-san-bay-long-thanh-185261007180539932.htm"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.226Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.226Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:42.001Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.226Z",
    "eventFingerprint": "POLICY_CHANGE|CHINH_PHU_VIET_NAM_DU_AN_CANG_HANG_KHONG_QUOC_TE_LONG_THANH_TP_HCM|GENERAL_ASSET|TP_HCM|2026-10-07|NO_TX",
    "materialUpdate": false,
    "clusterId": "c0d492eb-d44c-4d18-b8d5-ae7673553af3"
  },
  {
    "id": "9557b244-68b0-47d7-a232-9cf223428762",
    "title": "Vietnam Enterprise Outlook 2026: Preparing for Green Transition and Recovery Growth Cycle",
    "slug": "doanh-nghiep-va-ky-vong-2026-san-sang-cho-chu-ky-tang-truong-moi-a7a62283",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "POLICY_CHANGE",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "Ho Chi Minh City green enterprise leaders report growing business optimism for 2026, driven by three structural catalysts: green transition mandates, accelerated public investment disbursements, and rebounding domestic retail consumption.",
    "whyItMattersToSojitz": "Aligns with Sojitz mid-term strategy focusing on green supply chain solutions, consumer retail network expansion, and sustainable logistics in southern Vietnam.",
    "suggestedBdAction": "Consumer & Retail Division to evaluate consumer goods distribution expansion and logistics footprint additions ahead of the anticipated consumption upswing.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 60,
    "verificationRationale": "Reported exclusively by single outlet (Báo Đầu Tư). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hà Nội",
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": 50,
      "announcedTimeline": "Tháng 1"
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "2dfdc6a5-f5f3-43ec-ae4d-1c0f9a67052d",
        "sourceId": "a7a62283-647b-4e8d-b692-cdbb074e26cc",
        "sourceName": "Báo Đầu Tư",
        "sourceTier": "TIER_1",
        "articleTitle": "Doanh nghiệp và kỳ vọng 2026: Sẵn sàng cho chu kỳ tăng trưởng mới",
        "articleUrl": "https://baodautu.vn/doanh-nghiep-va-ky-vong-2026-san-sang-cho-chu-ky-tang-truong-moi-d481381.html",
        "validatedUrl": "https://baodautu.vn/doanh-nghiep-va-ky-vong-2026-san-sang-cho-chu-ky-tang-truong-moi-d481381.html",
        "canonicalUrl": "https://baodautu.vn/doanh-nghiep-va-ky-vong-2026-san-sang-cho-chu-ky-tang-truong-moi-d481381.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 98,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 98,
        "supportedCoreClaimIds": [
          "claim-f4d1c18b-1",
          "claim-f4d1c18b-2",
          "claim-f4d1c18b-3",
          "claim-f4d1c18b-4",
          "claim-f4d1c18b-5"
        ]
      }
    ],
    "originalUrls": [
      "https://baodautu.vn/doanh-nghiep-va-ky-vong-2026-san-sang-cho-chu-ky-tang-truong-moi-d481381.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.242Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.242Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2000-12-31",
    "firstSeenAt": "2026-10-07T16:36:38.983Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.242Z",
    "eventFingerprint": "POLICY_CHANGE|BO_TAI_CHINH_MOF_HA_NOI_NHAT_BAN|GENERAL_ASSET|HA_NOI|Tháng 1|NO_TX",
    "materialUpdate": false,
    "clusterId": "f4d1c18b-3057-4061-8c4a-1dbdb8ede2c1"
  },
  {
    "id": "b55bdc81-1023-4e0c-8a99-6cd4b10676e1",
    "title": "Google Seeks to Expand Artificial Intelligence Partnerships with Vietnam",
    "slug": "google-seeks-to-expand-ai-ties-with-vietnam-f72af570",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "Digital",
    "primarySectorId": "ebb3100e-f317-4c31-81a7-d7e5a4d4384d",
    "primarySectorName": "Digital",
    "primarySectorSlug": "digital",
    "secondarySectors": [
      "0d67a333-7dcf-4f8b-97fa-9bfe5ece1f03"
    ],
    "companiesMentioned": [],
    "summary": "Google is actively exploring pathways to deepen its collaboration with Vietnam in artificial intelligence, following bilateral discussions between global vice president Cris Turner and Deputy Prime Minister Ho Quoc Dung. Google has partnered with Vietnam’s National Innovation Center (NIC) under the \"AI Vietnam Future\" initiative since 2024 to foster local tech talent.",
    "whyItMattersToSojitz": "Sojitz can capitalize on Google’s expanding AI investment footprint in Vietnam to explore joint ventures in Data Center infrastructure, smart logistics hubs, and enterprise digital transformation solutions for Japanese corporate clients.",
    "suggestedBdAction": "SVN Technology Business Development team to proactively engage Vietnam’s National Innovation Center (NIC) and Google Vietnam to explore infrastructure co-investment and digital enterprise enablement programs.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 60,
    "verificationRationale": "Reported exclusively by single outlet (The Investor). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hanoi & Ho Chi Minh City, Vietnam",
      "keyPartners": [
        "National Innovation Center (NIC)"
      ],
      "dealValueUsd": null,
      "dealValueText": null,
      "stakePercentage": null,
      "announcedTimeline": "Since July 2024"
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "030b3976-e0a1-4645-9af4-31f49eefe960",
        "sourceId": "f72af570-eb74-442e-98ea-1356fa55138d",
        "sourceName": "The Investor",
        "sourceTier": "TIER_1",
        "articleTitle": "Google seeks to expand AI ties with Vietnam",
        "articleUrl": "https://theinvestor.vn/google-seeks-to-expand-ai-ties-with-vietnam-d20180.html",
        "validatedUrl": "https://theinvestor.vn/google-seeks-to-expand-ai-ties-with-vietnam-d20180.html",
        "canonicalUrl": "https://theinvestor.vn/google-seeks-to-expand-ai-ties-with-vietnam-d20180.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-5108a011-1",
          "claim-5108a011-2",
          "claim-5108a011-3",
          "claim-5108a011-4",
          "claim-5108a011-5"
        ]
      }
    ],
    "originalUrls": [
      "https://theinvestor.vn/google-seeks-to-expand-ai-ties-with-vietnam-d20180.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.203Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.203Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:42.577Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.203Z",
    "eventFingerprint": "PARTNERSHIP|GOOGLE_NATIONAL_INNOVATION_CENTER_NIC|AI_VIETNAM_FUTURE|VIETNAM|2026-10-06|NO_TX",
    "materialUpdate": false,
    "clusterId": "5108a011-8034-4915-821c-29c93856c64a"
  },
  {
    "id": "38f33f12-388f-4b03-bc4f-4c6889d38279",
    "title": "JICA Pledges to Expand ODA Commitments and Concessional Loans to Vietnam",
    "slug": "jica-se-tang-cac-khoan-cam-ket-va-cho-vay-voi-viet-nam-93cf7294",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "POLICY_CHANGE",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "The Japan International Cooperation Agency (JICA) announced it will step up Official Development Assistance (ODA) commitments and concessional financing for Vietnam, prioritizing regional transport connectivity, energy transition, and climate resilience projects.",
    "whyItMattersToSojitz": "High strategic significance for Japanese general trading houses. JICA’s expanded concessional loan portfolio enhances project bankability and co-financing structures for green logistics, port facilities, and eco-industrial parks co-developed by Sojitz.",
    "suggestedBdAction": "SVN Executive Management to coordinate with Tokyo HQ in engaging JICA Vietnam representatives to register green infrastructure and port logistics projects under JICA Private Sector Investment Finance (PSIF).",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 61,
    "verificationRationale": "Reported exclusively by single outlet (Thanh Nien Business). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Việt Nam",
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": null,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "4d8dea31-7dd4-4631-948c-b44310f16f14",
        "sourceId": "93cf7294-fdcb-47a9-a84f-f7852bc76774",
        "sourceName": "Thanh Nien Business",
        "sourceTier": "TIER_1",
        "articleTitle": "JICA sẽ tăng các khoản cam kết và cho vay với Việt Nam",
        "articleUrl": "https://thanhnien.vn/jica-se-tang-cac-khoan-cam-ket-va-cho-vay-voi-viet-nam-185261007171353966.htm",
        "validatedUrl": "https://thanhnien.vn/jica-se-tang-cac-khoan-cam-ket-va-cho-vay-voi-viet-nam-185261007171353966.htm",
        "canonicalUrl": "https://thanhnien.vn/jica-se-tang-cac-khoan-cam-ket-va-cho-vay-voi-viet-nam-185261007171353966.htm",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-3ef9b8b5-1",
          "claim-3ef9b8b5-2",
          "claim-3ef9b8b5-3",
          "claim-3ef9b8b5-4",
          "claim-3ef9b8b5-5"
        ]
      }
    ],
    "originalUrls": [
      "https://thanhnien.vn/jica-se-tang-cac-khoan-cam-ket-va-cho-vay-voi-viet-nam-185261007171353966.htm"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.207Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.207Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:41.882Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.207Z",
    "eventFingerprint": "POLICY_CHANGE|CHINH_PHU_VIET_NAM_NHAT_BAN_VIET_NAM|GENERAL_ASSET|VIET_NAM|2026-10-07|NO_TX",
    "materialUpdate": false,
    "clusterId": "3ef9b8b5-58cb-41c2-bac7-5bff150a227f"
  },
  {
    "id": "c4a56ebe-78ab-44b1-85b4-80b87ec20b77",
    "title": "Technology and AI Trends Elevate Standards for Vietnam’s Industrial Real Estate Sector",
    "slug": "technology-ai-raise-the-bar-for-vietnam-s-industrial-real-estate-market-7c962d09",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "Manufacturing",
    "primarySectorId": "4db7fccb-593e-4f3a-b6d2-5f25c3ad9dbc",
    "primarySectorName": "Manufacturing",
    "primarySectorSlug": "manufacturing",
    "secondarySectors": [
      "0d67a333-7dcf-4f8b-97fa-9bfe5ece1f03"
    ],
    "companiesMentioned": [
      {
        "id": "b2553d55-c5d2-4485-960f-2b0083cd1787",
        "name": "Gelex Group",
        "slug": "gelex-group",
        "ticker": "GEX.HM",
        "origin": "VIETNAM",
        "role": "SUBJECT"
      },
      {
        "id": "873c1858-a398-4647-82a4-1f4aeb7180d9",
        "name": "Becamex IDC",
        "slug": "becamex-idc",
        "ticker": "BCM.HM",
        "origin": "VIETNAM",
        "role": "SUBJECT"
      }
    ],
    "summary": "Industrial real estate developers in Vietnam face heightened operational demands from multinational technology tenants, who require uninterruptible green power, certified green building standards, ready-built cleanrooms, and automated logistics infrastructure.",
    "whyItMattersToSojitz": "Directly guides the asset development strategy for Sojitz Long Duc Industrial Park and future park expansions. Integrating rooftop solar and high-reliability dual-circuit power is essential to capture high-value Japanese and global semiconductor/electronics tenants.",
    "suggestedBdAction": "Sojitz IP Division to assemble a turnkey high-tech tenant package featuring bundled on-site renewable power and high-speed fiber infrastructure for upcoming warehouse parcels.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 61,
    "verificationRationale": "Reported exclusively by single outlet (The Investor). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hanoi",
      "keyQuotes": [
        "David Jackson, CEO of Avison Young Vietnam and Cambodia, said international and domestic investors are no longer simply looking for land, but for locations where technology projects can operate efficiently at scale."
      ],
      "keyPartners": [
        "Vingroup"
      ],
      "dealValueUsd": 50.36,
      "dealValueText": "$50.36 billion",
      "capacityOrSize": null,
      "stakePercentage": 76.4,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "eb870230-d03d-4933-8d7e-06106345bb4e",
        "sourceId": "7c962d09-5cd0-4291-a048-50d63305aded",
        "sourceName": "The Investor",
        "sourceTier": "TIER_1",
        "articleTitle": "Technology, AI raise the bar for Vietnam’s industrial real estate market",
        "articleUrl": "https://theinvestor.vn/technology-ai-raise-the-bar-for-vietnams-industrial-real-estate-market-d20177.html",
        "validatedUrl": "https://theinvestor.vn/technology-ai-raise-the-bar-for-vietnams-industrial-real-estate-market-d20177.html",
        "canonicalUrl": "https://theinvestor.vn/technology-ai-raise-the-bar-for-vietnams-industrial-real-estate-market-d20177.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-422062e3-1",
          "claim-422062e3-2",
          "claim-422062e3-3",
          "claim-422062e3-4",
          "claim-422062e3-5"
        ]
      }
    ],
    "originalUrls": [
      "https://theinvestor.vn/technology-ai-raise-the-bar-for-vietnams-industrial-real-estate-market-d20177.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.199Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.199Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T16:36:42.895Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.199Z",
    "eventFingerprint": "INVESTMENT|ALSTOM_HANOI_HO_CHI_MINH_CITY|GENERAL_ASSET|HANOI|2026-10-07|NO_TX",
    "materialUpdate": false,
    "clusterId": "422062e3-4233-459d-aeb5-3d4e95456bc9"
  },
  {
    "id": "7b03dbdb-f863-4acf-ab6c-5fa95ce49992",
    "title": "PV Gas Strengthens Upstream Cooperation with PVEP and Vietsovpetro to Secure Domestic Gas Supplies",
    "slug": "pv-gas-steps-up-cooperation-with-pvep-vietsovpetro-to-expand-domestic-gas-supply-8aaf05e5",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "Infrastructure",
    "primarySectorId": "eeba2312-4c6a-4201-8d5c-1ffede309135",
    "primarySectorName": "Infrastructure",
    "primarySectorSlug": "infrastructure",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "PV Gas is expanding collaborative frameworks with upstream operators PVEP and Vietsovpetro to optimize offshore gas gathering systems, enhance pipeline tie-ins, and safeguard fuel supply for thermal power complexes in southern Vietnam.",
    "whyItMattersToSojitz": "Sojitz Energy & LNG Division monitors domestic gas availability to calibrate commercial LNG import terminal schedules and supply models for industrial manufacturing clusters in the Ba Ria - Vung Tau corridor.",
    "suggestedBdAction": "Energy Division to hold technical consultations with PV Gas on integrated LNG-piped gas supply options for industrial clients situated in southern economic zones.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 61,
    "verificationRationale": "Reported exclusively by single outlet (The Investor). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hanoi",
      "keyPartners": [
        "Vingroup"
      ],
      "dealValueUsd": 2.36,
      "dealValueText": "$2.36 million",
      "capacityOrSize": null,
      "stakePercentage": 10,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "368a9375-de81-4b30-a1cf-0e2b0593a5c8",
        "sourceId": "8aaf05e5-17d6-47ab-a1bc-f4d9ba0377c9",
        "sourceName": "The Investor",
        "sourceTier": "TIER_1",
        "articleTitle": "PV Gas steps up cooperation with PVEP, Vietsovpetro to expand domestic gas supply",
        "articleUrl": "https://theinvestor.vn/pv-gas-steps-up-cooperation-with-pvep-vietsovpetro-to-expand-domestic-gas-supply-d20175.html",
        "validatedUrl": "https://theinvestor.vn/pv-gas-steps-up-cooperation-with-pvep-vietsovpetro-to-expand-domestic-gas-supply-d20175.html",
        "canonicalUrl": "https://theinvestor.vn/pv-gas-steps-up-cooperation-with-pvep-vietsovpetro-to-expand-domestic-gas-supply-d20175.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-92aca599-1",
          "claim-92aca599-2",
          "claim-92aca599-3",
          "claim-92aca599-4",
          "claim-92aca599-5"
        ]
      }
    ],
    "originalUrls": [
      "https://theinvestor.vn/pv-gas-steps-up-cooperation-with-pvep-vietsovpetro-to-expand-domestic-gas-supply-d20175.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.194Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.194Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T07:31:01.603Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.194Z",
    "eventFingerprint": "INVESTMENT|ALSTOM_HANOI_HCMC|GENERAL_ASSET|HANOI|2026-10-07|NO_TX",
    "materialUpdate": false,
    "clusterId": "92aca599-d9b3-4a65-b6c9-f6d0c4bc5c41"
  },
  {
    "id": "6a07fcd5-b8a4-456e-bad6-03e6e6df29d5",
    "title": "World Bank Raises Vietnam 2026 GDP Growth Forecast to 7.4% on Resilient Tech Exports",
    "slug": "wb-raises-viet-nam-s-2026-growth-forecast-to-7-4-per-cent-on-strong-ai-related-e-b571af5e",
    "publicationDate": "2026-10-06",
    "storyDate": "2026-10-06",
    "country": "Vietnam",
    "category": "Manufacturing",
    "primarySectorId": "4db7fccb-593e-4f3a-b6d2-5f25c3ad9dbc",
    "primarySectorName": "Manufacturing",
    "primarySectorSlug": "manufacturing",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "The World Bank revised its forecast for Vietnam’s 2026 economic growth upward by 1.1 percentage points to 7.4%, attributing the acceleration to robust electronics manufacturing, strong AI hardware export demand, and sustained foreign direct investment inflows.",
    "whyItMattersToSojitz": "Strong macroeconomic momentum and robust FDI inflows create a favorable operating environment across all Sojitz Vietnam business units, from retail distribution to industrial park leasing and infrastructure logistics.",
    "suggestedBdAction": "Corporate Planning to incorporate upgraded macroeconomic forecasts into the FY2026 capital allocation review with Tokyo Headquarters.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 59,
    "verificationRationale": "Reported exclusively by single outlet (Báo Chính Phủ). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hà Nội",
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": null,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "745b1dd2-ca5d-4a23-8b10-705087674632",
        "sourceId": "b571af5e-b6b0-4640-9c8b-29fb9ede9bfd",
        "sourceName": "Báo Chính Phủ (English)",
        "sourceTier": "TIER_1",
        "articleTitle": "WB raises Việt Nam’s 2026 growth forecast to 7.4 per cent on strong AI-related exports",
        "articleUrl": "https://baochinhphu.vn/world-bank-nang-du-bao-tang-truong-gdp-viet-nam-len-74-102261006171626017.htm",
        "validatedUrl": "https://baochinhphu.vn/world-bank-nang-du-bao-tang-truong-gdp-viet-nam-len-74-102261006171626017.htm",
        "canonicalUrl": "https://baochinhphu.vn/world-bank-nang-du-bao-tang-truong-gdp-viet-nam-len-74-102261006171626017.htm",
        "publishedAt": "2026-10-06T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-06",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-edc161a3-1",
          "claim-edc161a3-2",
          "claim-edc161a3-3",
          "claim-edc161a3-4"
        ]
      }
    ],
    "originalUrls": [
      "https://vietnamnews.vn/economy/1801368/wb-raises-viet-nam-s-2026-growth-forecast-to-7-4-per-cent-on-strong-ai-related-exports.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.262Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.262Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-06",
    "dailyBriefDate": "2026-10-06",
    "eventDate": "2026-10-06",
    "firstSeenAt": "2026-10-07T16:36:44.192Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.262Z",
    "eventFingerprint": "INVESTMENT|BO_GIAO_THONG_VAN_TAI_MOT_HA_NOI_MALAYSIA|GENERAL_ASSET|HA_NOI|2026-10-06|NO_TX",
    "materialUpdate": false,
    "clusterId": "edc161a3-71ab-403f-ae05-c1d7b5893644"
  },
  {
    "id": "adddb9f9-40c4-4130-b174-3159a02321bd",
    "title": "Alstom and Vingroup Sign Strategic Partnership to Supply up to 200 Metro Trains for Hanoi Urban Transit",
    "slug": "alstom-and-vingroup-sign-strategic-partnership-to-supply-up-to-200-metro-trains--741b4227",
    "publicationDate": "2026-10-06",
    "storyDate": "2026-10-06",
    "country": "Vietnam",
    "category": "PARTNERSHIP",
    "primarySectorId": null,
    "primarySectorName": "General",
    "primarySectorSlug": "general",
    "secondarySectors": [],
    "companiesMentioned": [
      {
        "id": "bdd3f1ae-10b2-466b-9472-47e3315c9322",
        "name": "Vingroup",
        "slug": "vingroup",
        "ticker": "VIC.HM",
        "origin": "VIETNAM",
        "role": "PARTNER"
      }
    ],
    "summary": "Alstom and Vietnamese conglomerate Vingroup have executed a strategic agreement to supply up to 200 five-car metro trainsets for urban railway developments in Hanoi, combining French transit engineering with localized assembly capabilities in Vietnam.",
    "whyItMattersToSojitz": "Strategic alignment with Sojitz Automotive & Machinery Division. The capital rail deployment creates supply chain entry points for technical maintenance services, rolling stock sub-components, and auxiliary depot systems.",
    "suggestedBdAction": "Machinery & Infrastructure Division to approach Vingroup procurement and Alstom Vietnam project teams to propose auxiliary electrical systems and depot maintenance supply.",
    "businessImpact": "PARTNERSHIP",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 63,
    "verificationRationale": "Reported exclusively by single outlet (The Investor). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hanoi",
      "keyPartners": [
        "Vingroup"
      ],
      "dealValueUsd": null,
      "dealValueText": null,
      "capacityOrSize": null,
      "stakePercentage": null,
      "announcedTimeline": "2028"
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "2f02f68e-9595-42ba-956d-94503ae46bd2",
        "sourceId": "741b4227-3c50-4aee-a2b6-aea1d8f38775",
        "sourceName": "The Investor",
        "sourceTier": "TIER_1",
        "articleTitle": "Alstom and Vingroup Sign Strategic Partnership to Supply up to 200 Metro Trains for Hanoi Urban Transit",
        "articleUrl": "https://theinvestor.vn/alstom-vingroup-to-supply-up-to-200-metro-trains-for-hanoi-d20168.html",
        "validatedUrl": "https://theinvestor.vn/alstom-vingroup-to-supply-up-to-200-metro-trains-for-hanoi-d20168.html",
        "canonicalUrl": "https://theinvestor.vn/alstom-vingroup-to-supply-up-to-200-metro-trains-for-hanoi-d20168.html",
        "publishedAt": "2026-10-06T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-06",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 98,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 98,
        "supportedCoreClaimIds": [
          "claim-31e1cd3c-1",
          "claim-31e1cd3c-2"
        ]
      }
    ],
    "originalUrls": [
      "https://theinvestor.vn/alstom-vingroup-to-supply-up-to-200-metro-trains-for-hanoi-d20168.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.258Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.258Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-06",
    "dailyBriefDate": "2026-10-06",
    "eventDate": "2028-01-01",
    "firstSeenAt": "2026-10-07T07:31:02.098Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.258Z",
    "eventFingerprint": "PARTNERSHIP|ALSTOM_HAI_PHONG_HANOI|GENERAL_ASSET|HANOI|2028|NO_TX",
    "materialUpdate": false,
    "clusterId": "31e1cd3c-10bc-4097-ad58-27ab9019ab65"
  },
  {
    "id": "ab8e7f10-2d34-46d7-8f0c-8300c2638557",
    "title": "From Coffee Beans to Value: Scaling Sustainable and Low-Carbon Agri-Processing in Vietnam",
    "slug": "from-coffee-beans-to-value-building-a-more-sustainable-coffee-industry-in-vietna-2a50b290",
    "publicationDate": "2026-10-06",
    "storyDate": "2026-10-06",
    "country": "Vietnam",
    "category": "Food & Beverage",
    "primarySectorId": "5309a5ff-0059-4724-8b68-331ee687e208",
    "primarySectorName": "Food",
    "primarySectorSlug": "food",
    "secondarySectors": [
      "b268d5a2-3860-4b5a-a4ed-47631b1b2927",
      "a283710d-9fac-411f-a9de-68e7400f8eb0"
    ],
    "companiesMentioned": [],
    "summary": "Nestlé Vietnam and the Vietnam Business Council for Sustainable Development (VBCSD) emphasized transitioning Vietnam from a raw green coffee bean exporter into a high-value sustainable processing powerhouse, scaling regenerative farming practices and decarbonized supply chains.",
    "whyItMattersToSojitz": "Direct relevance to Sojitz Retail, FMCG & Agriculture Division. Sojitz holds significant agricultural trading and distribution interests in Vietnam. Deepened domestic processing and traceable low-carbon standards create new export supply pipelines to Japan and East Asian markets.",
    "suggestedBdAction": "Agribusiness department to engage Central Highlands coffee cooperatives and processing partners to evaluate traceable low-emission sourcing standards matching Japanese retail off-take requirements.",
    "businessImpact": "OPPORTUNITY",
    "relevanceScore": 8,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 67,
    "verificationRationale": "Reported exclusively by single outlet (Vietnam Investment Review (VIR)). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Hanoi",
      "dealValueUsd": 1,
      "dealValueText": "$1 billion",
      "capacityOrSize": null,
      "stakePercentage": null,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "fb7614a7-b4e4-4ff4-8dcc-e7fdc5cb27b8",
        "sourceId": "2a50b290-75f7-430e-979d-856d12d53755",
        "sourceName": "Vietnam Investment Review (VIR)",
        "sourceTier": "TIER_1",
        "articleTitle": "From coffee beans to value: Building a more sustainable coffee industry in Vietnam",
        "articleUrl": "https://vir.com.vn/from-coffee-beans-to-value-building-a-more-sustainable-coffee-industry-in-vietnam-162204.html",
        "validatedUrl": "https://vir.com.vn/from-coffee-beans-to-value-building-a-more-sustainable-coffee-industry-in-vietnam-162204.html",
        "canonicalUrl": "https://vir.com.vn/from-coffee-beans-to-value-building-a-more-sustainable-coffee-industry-in-vietnam-162204.html",
        "publishedAt": "2026-10-06T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-06",
        "isPrimaryClaimSource": false,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 100,
        "sourceRole": "CORROBORATING",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "claim-8fac09b6-1",
          "claim-8fac09b6-2",
          "claim-8fac09b6-3",
          "claim-8fac09b6-4",
          "claim-8fac09b6-5"
        ]
      }
    ],
    "originalUrls": [
      "https://vir.com.vn/from-coffee-beans-to-value-building-a-more-sustainable-coffee-industry-in-vietnam-162204.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T16:50:14.253Z",
    "aiAnalysisTimestamp": "2026-10-07T16:50:14.253Z",
    "isHighPriority": true,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-06",
    "dailyBriefDate": "2026-10-06",
    "eventDate": "2026-10-06",
    "firstSeenAt": "2026-10-07T16:36:46.511Z",
    "lastVerifiedAt": "2026-10-07T16:50:14.253Z",
    "eventFingerprint": "POLICY_CHANGE|BO_GIAO_THONG_VAN_TAI_MOT_BO_TAI_CHINH_MOF_DONG_NAI|GENERAL_ASSET|HANOI|2026-10-06|NO_TX",
    "materialUpdate": false,
    "clusterId": "8fac09b6-c8d2-4643-b979-d4bc638ffd5e"
  },
  {
    "id": "9234fa5b-3708-4be4-9eee-1ea1b1602846",
    "title": "Novaland Plans Share Issuance to Convert $2.36M in International Bonds into Equity",
    "slug": "novaland-plans-share-issuance-to-convert-2-36m-in-international-bonds-into-equit-f8edb6eb-9234fa",
    "publicationDate": "2026-10-07",
    "storyDate": "2026-10-07",
    "country": "Vietnam",
    "category": "Financial Services",
    "primarySectorId": "58467d0c-1cd6-4a61-ae59-c036fa21318b",
    "primarySectorName": "Financial Services",
    "primarySectorSlug": "financial-services",
    "secondarySectors": [],
    "companiesMentioned": [],
    "summary": "Vietnam real estate developer Novaland plans to issue approximately 1.73 million shares to convert $2.36 million in international convertible bonds into equity, marking another step in its debt restructuring and financial stabilization process.",
    "whyItMattersToSojitz": "Real estate restructuring developments provide intelligence on land bank liquidity and potential distressed industrial real estate or logistics asset acquisitions at attractive valuations.",
    "suggestedBdAction": "M&A and Investment desk to continue tracking capital restructuring moves across domestic developers to identify potential industrial asset acquisition opportunities.",
    "businessImpact": "MA_INVESTMENT",
    "relevanceScore": 5,
    "verificationStatus": "SINGLE_SOURCE",
    "confidenceScore": 61,
    "verificationRationale": "Reported exclusively by single outlet (The Investor). Monitoring for peer corroboration across Vietnamese business media.",
    "extractedFacts": {
      "location": "Singapore",
      "dealValueUsd": 2.36,
      "dealValueText": "$2.36 million",
      "capacityOrSize": null,
      "stakePercentage": 1.5,
      "announcedTimeline": null
    },
    "detectedConflicts": [],
    "sources": [
      {
        "id": "f1e70af0-6240-4ad5-beaf-5fe02f5b0c32",
        "sourceId": "f8edb6eb-178c-459e-9f54-14096eb13789",
        "sourceName": "The Investor",
        "sourceTier": "TIER_2",
        "articleTitle": "Novaland Plans Share Issuance to Convert $2.36M in International Bonds into Equity",
        "articleUrl": "https://theinvestor.vn/novaland-plans-share-issuance-to-convert-236-mln-in-international-bonds-d20176.html",
        "validatedUrl": "https://theinvestor.vn/novaland-plans-share-issuance-to-convert-236-mln-in-international-bonds-d20176.html",
        "canonicalUrl": "https://theinvestor.vn/novaland-plans-share-issuance-to-convert-236-mln-in-international-bonds-d20176.html",
        "publishedAt": "2026-10-07T00:00:00.000Z",
        "sourcePublicationDateLocal": "2026-10-07",
        "isPrimaryClaimSource": true,
        "linkStatus": "VERIFIED",
        "contentMatchScore": 94,
        "sourceRole": "PRIMARY",
        "eventMatchScore": 100,
        "supportedCoreClaimIds": [
          "vf-0",
          "vf-1"
        ]
      }
    ],
    "originalUrls": [
      "https://theinvestor.vn/novaland-plans-share-issuance-to-convert-236-mln-in-international-bonds-d20176.html"
    ],
    "aiModelUsed": "gpt-4o",
    "dateCollected": "2026-10-07",
    "collectionTimestamp": "2026-10-07T09:15:31.011Z",
    "aiAnalysisTimestamp": "2026-10-07T09:15:31.011Z",
    "isHighPriority": false,
    "isEditorApproved": true,
    "isPublished": true,
    "verifiedSourceCount": 1,
    "sourcePublicationDateLocal": "2026-10-07",
    "dailyBriefDate": "2026-10-07",
    "eventDate": "2026-10-07",
    "firstSeenAt": "2026-10-07T07:31:01.729Z",
    "lastVerifiedAt": "2026-10-07T09:15:31.011Z",
    "eventFingerprint": "FINANCIAL_SERVICES|NOVALAND_PLANS_SHARE_ISSUANCE|GENERAL_ASSET|VIETNAM|Wed Oct 07|NO_TX",
    "materialUpdate": false,
    "clusterId": "edd0cd27-eee1-4f8a-b109-f105e68a1eb4"
  }
];

import { HISTORICAL_INTELLIGENCE_STORIES } from './historical-stories-data';

export const SAMPLE_INTELLIGENCE_STORIES: IntelligenceStory[] = [
  ...RAW_SAMPLE_STORIES.map(story => {
    return {
      ...story,
      isLegacy: false,
      sourceGrounded: true,
      ingestionPipelineVersion: 'v1_aligned',
      originalUrls: story.sources.map(s => s.articleUrl || ''),
      verifiedSourceCount: story.sources.length,
      articleStatus: (story.sources.length >= 2 ? 'MULTI_SOURCE_VERIFIED' : 'SINGLE_SOURCE_VERIFIED') as any,
    };
  }),
  ...HISTORICAL_INTELLIGENCE_STORIES,
];

import { INITIAL_WEEKLY_REPORTS } from './weekly-reports-data';
export { INITIAL_WEEKLY_REPORTS };
export const SAMPLE_WEEKLY_REPORT: WeeklyReport = INITIAL_WEEKLY_REPORTS[0];

export const MOCK_KPIS: DashboardKpis = {
  articlesScanned: 1482,
  intelligenceStories: 48,
  highPriorityStories: 18,
  opportunitiesCount: 14,
  risksCount: 6,
  maActivityCount: 12,
  verifiedCount: 38,
};
