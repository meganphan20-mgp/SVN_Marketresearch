import { getPostgresPool } from '../src/lib/database/postgres';

const SECTOR_KEYWORDS: Record<string, string[]> = {
  food: [
    'food', 'f&b', 'beverage', 'thực phẩm', 'đồ uống', 'coffee', 'cà phê', 'nestlé',
    'agri-processing', 'chế biến thực phẩm', 'fmcg', 'nông sản chế biến', 'seasoning',
    'gia vị', 'meat', 'vinabeef', 'masan', 'seafood', 'thủy sản', 'bánh kẹo',
    'thức uống', 'chế biến nông sản', 'giá trị gia tăng'
  ],
  retail: [
    'retail', 'bán lẻ', 'siêu thị', 'supermarket', 'convenience store', 'cửa hàng tiện lợi',
    'ministop', 'huong thuy', 'hương thủy', 'omnichannel', 'tiêu dùng', 'chuỗi bán lẻ',
    'phân phối tiêu dùng', 'modern trade', 'chợ truyền thống', 'bách hóa'
  ],
  agriculture: [
    'agriculture', 'nông nghiệp', 'agrochemicals', 'phân bón', 'coffee beans', 'hạt cà phê',
    'lúa gạo', 'trồng trọt', 'chăn nuôi', 'animal feed', 'thức ăn chăn nuôi', 'nông trường',
    'canh tác', 'cao su', 'hồ tiêu', 'điều'
  ],
  consumer: [
    'consumer', 'hàng tiêu dùng', 'consumer goods', 'fmcg', 'personal care',
    'chăm sóc cá nhân', 'gia dụng', 'hóa mỹ phẩm', 'tiêu dùng nhanh'
  ],
  energy: [
    'energy', 'power', 'điện lực', 'năng lượng', 'evn', 'pv gas', 'lưới điện',
    'truyền tải điện', 'dppa', 'lng', 'khí đốt', 'nhiệt điện', 'phát điện',
    'điện hạt nhân', 'dầu khí', 'pvep', 'vietsovpetro'
  ],
  'renewable-energy': [
    'renewable energy', 'năng lượng tái tạo', 'điện gió', 'điện mặt trời', 'solar',
    'wind', 'sinh khối', 'biomass', 'green hydrogen', 'hydro xanh', 'điện áp mái', 'offshore wind'
  ],
  infrastructure: [
    'infrastructure', 'hạ tầng', 'giao thông', 'sân bay', 'airport', 'đường sắt',
    'metro', 'đoàn tàu', 'cảng biển', 'cao tốc', 'expressway', 'long thành', 'gia bình',
    'cầu đường', 'alstom', 'nhà ga'
  ],
  aviation: [
    'aviation', 'hàng không', 'sân bay', 'airport', 'mro', 'máy bay', 'gia bình',
    'long thành', 'bay', 'vietnam airlines', 'vietjet', 'cảng hàng không'
  ],
  logistics: [
    'logistics', 'kho bãi', 'warehouse', 'cold chain', 'chuỗi cung ứng lạnh',
    'vận tải hàng hóa', 'freight', 'giao nhận', 'forwarding', 'cảng cạn', 'icd', 'logistics park'
  ],
  'industrial-parks': [
    'industrial parks', 'khu công nghiệp', 'kcn', 'industrial zone', 'cụm công nghiệp',
    'long đức', 'nhà xưởng', 'đất công nghiệp', 'khu chế xuất', 'khu kinh tế'
  ],
  manufacturing: [
    'manufacturing', 'sản xuất', 'chế tạo', 'nhà máy', 'factory', 'plant',
    'linh kiện', 'công nghiệp phụ trợ', 'lắp ráp', 'gia công', 'máy móc'
  ],
  digital: [
    'digital', 'công nghệ số', 'chuyển đổi số', 'phần mềm', 'software', 'cloud',
    'viễn thông', 'công nghệ thông tin', 'it', 'nền tảng số'
  ],
  ai: [
    'ai', 'trí tuệ nhân tạo', 'artificial intelligence', 'machine learning',
    'bán dẫn', 'semiconductor', 'data center', 'trung tâm dữ liệu', 'google', 'nvidia'
  ],
  'financial-services': [
    'financial services', 'tài chính', 'ngân hàng', 'banking', 'trái phiếu',
    'cổ phiếu', 'chứng khoán', 'tín dụng', 'm&a', 'hoán đổi nợ', 'oda', 'jica', 'quỹ đầu tư'
  ],
  esg: [
    'esg', 'phát thải', 'chuyển đổi xanh', 'green transition', 'cbam', 'net zero',
    'giảm phát thải', 'bền vững', 'kinh tế tuần hoàn'
  ]
};

async function main() {
  const pool = getPostgresPool();

  console.log('--- 1. Enriching Sector Keywords in PostgreSQL ---');
  for (const [slug, kws] of Object.entries(SECTOR_KEYWORDS)) {
    await pool.query(
      `UPDATE public.sectors 
       SET keywords = $1 
       WHERE slug = $2;`,
      [kws, slug]
    );
    console.log(`Updated keywords for sector: ${slug} (${kws.length} keywords)`);
  }

  console.log('--- 2. Updating Sector & Category for Stories in PostgreSQL ---');

  // Fetch sector IDs
  const secMapRes = await pool.query('SELECT id, slug FROM public.sectors;');
  const secIdBySlug: Record<string, string> = {};
  for (const r of secMapRes.rows) {
    secIdBySlug[r.slug] = r.id;
  }

  // A. Coffee article -> Food (F&B / Retail)
  if (secIdBySlug['food']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Food & Beverage',
           secondary_sectors = ARRAY[$2, $3]::uuid[]
       WHERE title ILIKE '%Coffee Beans%';`,
      [secIdBySlug['food'], secIdBySlug['agriculture'], secIdBySlug['retail']]
    );
    console.log('Updated Coffee Beans story -> Sector: Food, Category: Food & Beverage');
  }

  // B. Alstom & Vingroup Metro -> Infrastructure
  if (secIdBySlug['infrastructure']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Infrastructure' 
       WHERE title ILIKE '%Alstom and Vingroup%';`,
      [secIdBySlug['infrastructure']]
    );
    console.log('Updated Alstom Metro story -> Sector: Infrastructure');
  }

  // C. Deputy Prime Minister Sanctions Long Thanh Airport -> Infrastructure / Aviation
  if (secIdBySlug['infrastructure']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Infrastructure' 
       WHERE title ILIKE '%Long Thanh Airport%';`,
      [secIdBySlug['infrastructure']]
    );
    console.log('Updated Long Thanh Airport story -> Sector: Infrastructure');
  }

  // D. PV Gas Upstream Cooperation -> Energy
  if (secIdBySlug['energy']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Energy' 
       WHERE title ILIKE '%PV Gas%';`,
      [secIdBySlug['energy']]
    );
    console.log('Updated PV Gas story -> Sector: Energy');
  }

  // E. EVNNPT Grid Unbundling -> Energy
  if (secIdBySlug['energy']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Energy' 
       WHERE title ILIKE '%EVNNPT Grid Unbundling%';`,
      [secIdBySlug['energy']]
    );
    console.log('Updated EVNNPT story -> Sector: Energy');
  }

  // F. MOIT Power Gen Corp -> Energy
  if (secIdBySlug['energy']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Energy' 
       WHERE title ILIKE '%National Strategic Power Generation%';`,
      [secIdBySlug['energy']]
    );
    console.log('Updated Strategic Power Gen story -> Sector: Energy');
  }

  // G. Google AI -> AI
  if (secIdBySlug['ai']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Digital & AI' 
       WHERE title ILIKE '%Google Seeks to Expand Artificial Intelligence%';`,
      [secIdBySlug['ai']]
    );
    console.log('Updated Google AI story -> Sector: AI');
  }

  // H. JICA ODA -> Financial Services
  if (secIdBySlug['financial-services']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Financial Services' 
       WHERE title ILIKE '%JICA Pledges%';`,
      [secIdBySlug['financial-services']]
    );
    console.log('Updated JICA ODA story -> Sector: Financial Services');
  }

  // I. Enterprise Outlook Green Transition -> ESG
  if (secIdBySlug['esg']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'ESG' 
       WHERE title ILIKE '%Vietnam Enterprise Outlook%';`,
      [secIdBySlug['esg']]
    );
    console.log('Updated Green Transition story -> Sector: ESG');
  }

  // J. Government Directs 9 Key Economic Provinces -> Industrial Parks
  if (secIdBySlug['industrial-parks']) {
    await pool.query(
      `UPDATE public.intelligence_stories 
       SET primary_sector_id = $1, 
           category = 'Investment' 
       WHERE title ILIKE '%Government Directs 9 Key Economic Provinces%';`,
      [secIdBySlug['industrial-parks']]
    );
    console.log('Updated 9 Key Economic Provinces story -> Sector: Industrial Parks');
  }

  console.log('--- 3. Verifying updated stories in PostgreSQL ---');
  const res = await pool.query(`
    SELECT s.title, s.category, sec.name as sector_name, sec.slug as sector_slug
    FROM public.intelligence_stories s
    LEFT JOIN public.sectors sec ON sec.id = s.primary_sector_id
    ORDER BY s.publication_date DESC;
  `);

  for (const r of res.rows) {
    console.log(`  [Sector: ${r.sector_name} (${r.sector_slug}) | Cat: ${r.category}] -> ${r.title.slice(0, 60)}`);
  }

  await pool.end();
}

main().catch(console.error);
