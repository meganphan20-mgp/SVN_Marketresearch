import { getPostgresPool } from '../src/lib/database/postgres';

interface SourceDef {
  name: string;
  domain: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'DISCOVERY';
  weight: number;
  desc: string;
  isIr: boolean;
  rssUrl?: string;
}

const EXACT_SOURCES: SourceDef[] = [
  // Tier 1 (Official & Global Authoritative - Weight 1.0)
  {
    name: 'Official Government Gazettes',
    domain: 'baochinhphu.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Official Government Gazettes and legal decrees of the Government of Vietnam.',
    isIr: true,
    rssUrl: 'https://baochinhphu.vn/rss.htm'
  },
  {
    name: 'Financial Times',
    domain: 'ft.com',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Global strategic investment trends, supply chain realignments, and geopolitical risk.',
    isIr: false,
    rssUrl: 'https://www.ft.com/stream/rss'
  },
  {
    name: 'VnEconomy',
    domain: 'vneconomy.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Vietnam Economic Times portal covering macro indicators, corporate earnings, and real estate.',
    isIr: false,
    rssUrl: 'https://vneconomy.vn/doanh-nghiep.htm'
  },
  {
    name: 'VnExpress',
    domain: 'vnexpress.net',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Leading digital newspaper with dedicated business, macro, and industrial coverage.',
    isIr: false,
    rssUrl: 'https://vnexpress.net/rss/kinh-doanh.rss'
  },
  {
    name: 'VietnamNet',
    domain: 'vietnamnet.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'State-affiliated media focusing on technology policy, enterprise restructuring, and foreign diplomacy.',
    isIr: false,
    rssUrl: 'https://vietnamnet.vn/rss/kinh-doanh.rss'
  },
  {
    name: 'Vietnam News',
    domain: 'vietnamnews.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'English-language national daily covering official state visits, trade agreements, and legal updates.',
    isIr: false,
    rssUrl: 'https://vietnamnews.vn/rss/economy.rss'
  },
  {
    name: 'The Investor',
    domain: 'theinvestor.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Specialized foreign investment portal focusing on manufacturing, logistics, and renewable energy.',
    isIr: false,
    rssUrl: 'https://theinvestor.vn/corporate-c1/'
  },
  {
    name: 'CafeF',
    domain: 'cafef.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'High-frequency financial portal tracking stock movements, corporate leadership, and project rumors.',
    isIr: false,
    rssUrl: 'https://cafef.vn/doanh-nghiep.rss'
  },
  {
    name: 'Tuoi Tre Online',
    domain: 'tuoitre.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'National socio-economic newspaper covering major infrastructure and municipal policies.',
    isIr: false,
    rssUrl: 'https://tuoitre.vn/rss/kinh-doanh.rss'
  },
  {
    name: 'Thanh Nien News',
    domain: 'thanhnien.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'National daily reporting on commerce, consumer markets, and investment projects.',
    isIr: false,
    rssUrl: 'https://thanhnien.vn/rss/kinh-te.rss'
  },
  {
    name: 'Dau tu',
    domain: 'baodautu.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Authoritative investment newspaper covering FDI, industrial parks, M&A, and infrastructure.',
    isIr: false,
    rssUrl: 'https://baodautu.vn/doanh-nghiep-d4/'
  },
  {
    name: 'CafeBiz',
    domain: 'cafebiz.vn',
    tier: 'TIER_1',
    weight: 1.0,
    desc: 'Digital business and startup portal covering corporate strategy, retail, and tech.',
    isIr: false,
    rssUrl: 'https://cafebiz.vn/rss/cau-chuyen-kinh-doanh.rss'
  },

  // Tier 2 (Premier Vietnamese Business & Economic Media - Weight 0.7)
  {
    name: 'Reuters',
    domain: 'reuters.com',
    tier: 'TIER_2',
    weight: 0.7,
    desc: 'Global primary news wire covering Vietnam macroeconomic shifts, cross-border M&A, and policy developments.',
    isIr: false,
    rssUrl: 'https://www.reutersagency.com/feed/'
  },
  {
    name: 'Bloomberg',
    domain: 'bloomberg.com',
    tier: 'TIER_2',
    weight: 0.7,
    desc: 'Financial markets, bond issuances, currency trends, and sovereign debt surveillance.',
    isIr: false
  },
  {
    name: 'Nikkei Asia',
    domain: 'asia.nikkei.com',
    tier: 'TIER_2',
    weight: 0.7,
    desc: 'Authoritative reporting on Japanese corporate investments, trading houses, and Asian economic policy.',
    isIr: false,
    rssUrl: 'https://asia.nikkei.com/rss/feed/nar'
  },
  {
    name: 'Vietnam Investment Review',
    domain: 'vir.com.vn',
    tier: 'TIER_2',
    weight: 0.7,
    desc: 'Premier Vietnamese business publication for FDI, infrastructure projects, and M&A transactions.',
    isIr: false,
    rssUrl: 'https://vir.com.vn/'
  },
  {
    name: 'SSC/HOSE/HNX',
    domain: 'hsx.vn',
    tier: 'TIER_2',
    weight: 0.7,
    desc: 'State Securities Commission and official stock exchange corporate disclosure portals.',
    isIr: true,
    rssUrl: 'https://www.hsx.vn/Modules/Cms/Web/RssView'
  },
  {
    name: 'Corporate Investor Relations',
    domain: 'ir.internal',
    tier: 'TIER_2',
    weight: 0.7,
    desc: 'Official corporate disclosures, financial reports, and investor relations releases.',
    isIr: true
  },

  // Tier 3 (Specialist & Domestic Financial Portals - Weight 0.4)
  {
    name: 'Saigon Times',
    domain: 'thesaigontimes.vn',
    tier: 'TIER_3',
    weight: 0.4,
    desc: 'Southern economic hub business paper analyzing Ho Chi Minh City commerce and supply chain trends.',
    isIr: false,
    rssUrl: 'https://thesaigontimes.vn/kinh-doanh/'
  },
  {
    name: 'Industry Associations',
    domain: 'associations.internal',
    tier: 'TIER_3',
    weight: 0.4,
    desc: 'Industry and trade associations across plastics, logistics, energy, and manufacturing.',
    isIr: false
  },
  {
    name: 'Specialized Trade Journals',
    domain: 'tradejournals.internal',
    tier: 'TIER_3',
    weight: 0.4,
    desc: 'Specialized trade and technical journals covering energy, infrastructure, and commodities.',
    isIr: false
  },

  // Discovery Only (Weight 0.1)
  {
    name: 'LinkedIn',
    domain: 'linkedin.com',
    tier: 'DISCOVERY',
    weight: 0.1,
    desc: 'Executive personnel movements, corporate hiring expansion signals, and preliminary partnerships.',
    isIr: false
  },
  {
    name: 'Corporate Blogs',
    domain: 'blogs.internal',
    tier: 'DISCOVERY',
    weight: 0.1,
    desc: 'Company blogs and technical notes. Cannot verify a story alone; triggers crawler corroboration.',
    isIr: false
  },
  {
    name: 'Aggregators',
    domain: 'aggregators.internal',
    tier: 'DISCOVERY',
    weight: 0.1,
    desc: 'News aggregators and briefing feeds. Cannot verify a story alone; triggers crawler corroboration.',
    isIr: false
  },
];

async function main() {
  const pool = getPostgresPool();

  console.log('--- 1. Handling legacy duplicates & foreign keys ---');
  // Re-link raw_articles from 'VnExpress International' to 'VnExpress'
  const vnExpress = await pool.query("SELECT id FROM public.sources WHERE name = 'VnExpress' LIMIT 1;");
  const vnExpressIntl = await pool.query("SELECT id FROM public.sources WHERE name = 'VnExpress International' LIMIT 1;");
  if (vnExpress.rows.length > 0 && vnExpressIntl.rows.length > 0) {
    await pool.query('UPDATE raw_articles SET source_id = $1 WHERE source_id = $2;', [
      vnExpress.rows[0].id,
      vnExpressIntl.rows[0].id,
    ]);
    await pool.query('DELETE FROM public.sources WHERE id = $1;', [vnExpressIntl.rows[0].id]);
    console.log('Successfully merged VnExpress International into VnExpress');
  }

  // Delete legacy unused sources
  const legacyNames = [
    'JETRO Hanoi & HCMC',
    'Ministry of Planning and Investment (MPI)',
    'State Bank of Vietnam (SBV)',
    'Industry Trade Feeds & Discovery',
  ];
  for (const leg of legacyNames) {
    const legRow = await pool.query('SELECT id FROM public.sources WHERE name = $1;', [leg]);
    if (legRow.rows.length > 0) {
      await pool.query('DELETE FROM raw_articles WHERE source_id = $1;', [legRow.rows[0].id]);
      await pool.query('DELETE FROM public.sources WHERE id = $1;', [legRow.rows[0].id]);
      console.log(`Removed legacy source: ${leg}`);
    }
  }

  console.log('--- 2. Upserting EXACT 24 Sources ---');
  for (const s of EXACT_SOURCES) {
    const match = await pool.query('SELECT id FROM public.sources WHERE name = $1 LIMIT 1;', [s.name]);
    if (match.rows.length > 0) {
      await pool.query(
        `UPDATE public.sources 
         SET domain = $1, tier = $2, trust_weight = $3, description = $4, is_official_ir = $5, rss_url = $6, is_active = true 
         WHERE id = $7;`,
        [s.domain, s.tier, s.weight, s.desc, s.isIr, s.rssUrl || null, match.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO public.sources (id, name, domain, tier, trust_weight, description, is_official_ir, rss_url, is_active, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, now());`,
        [s.name, s.domain, s.tier, s.weight, s.desc, s.isIr, s.rssUrl || null]
      );
    }
  }

  console.log('--- 3. Synchronizing story_sources to match source tiers ---');
  await pool.query(`
    UPDATE story_sources 
    SET source_tier = 'TIER_1' 
    WHERE source_name ILIKE '%Investor%' 
       OR source_name ILIKE '%Thanh Nien%' 
       OR source_name ILIKE '%VnExpress%' 
       OR source_name ILIKE '%Tuoi Tre%' 
       OR source_name ILIKE '%CafeBiz%' 
       OR source_name ILIKE '%CafeF%' 
       OR source_name ILIKE '%VietnamNet%' 
       OR source_name ILIKE '%Vietnam News%' 
       OR source_name ILIKE '%Báo Đầu Tư%' 
       OR source_name ILIKE '%Dau tu%' 
       OR source_name ILIKE '%VnEconomy%';
  `);

  await pool.query(`
    UPDATE story_sources 
    SET source_tier = 'TIER_2' 
    WHERE source_name ILIKE '%Vietnam Investment Review%' 
       OR source_name ILIKE '%VIR%' 
       OR source_name ILIKE '%Nikkei%' 
       OR source_name ILIKE '%Reuters%' 
       OR source_name ILIKE '%Bloomberg%';
  `);

  console.log('--- 4. Final verification in PostgreSQL ---');
  const res = await pool.query(`
    SELECT tier, trust_weight, name, domain, is_active 
    FROM public.sources 
    WHERE is_active = true 
    ORDER BY 
      CASE tier 
        WHEN 'TIER_1' THEN 1 
        WHEN 'TIER_2' THEN 2 
        WHEN 'TIER_3' THEN 3 
        WHEN 'DISCOVERY' THEN 4 
      END ASC, 
      name ASC;
  `);

  console.log(`Active sources count: ${res.rows.length}`);
  for (const r of res.rows) {
    console.log(`  [${r.tier} | Weight: ${r.trust_weight}] ${r.name} (${r.domain})`);
  }

  await pool.end();
}

main().catch(console.error);
