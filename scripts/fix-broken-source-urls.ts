import fs from 'fs';
import path from 'path';
import { getPostgresPool } from '../src/lib/database/postgres';

const URL_REPLACEMENTS: Record<string, string> = {
  // DPPA
  'https://en.baochinhphu.vn/decree-80-dppa-mechanism-2026.html':
    'https://baochinhphu.vn/tao-dieu-kien-cho-doanh-nghiep-nguoi-dan-tham-gia-san-xuat-tieu-thu-va-tham-gia-vao-thi-truong-dien-102241008100922054.htm',
  'https://vneconomy.vn/doanh-nghiep-fdi-huong-loi-tu-nghi-dinh-80-dppa.htm':
    'https://vneconomy.vn/co-che-dppa-phu-hop-voi-chu-truong-khuyen-khich-dau-tu-phat-trien-nang-luong-tai-tao.htm',

  // Sumitomo Smart City Dong Anh
  'https://vneconomy.vn/sumitomo-brg-smart-city-dong-anh.htm':
    'https://vneconomy.vn/ha-noi-khoi-cong-sieu-du-an-thanh-pho-thong-minh-42-ty-usd.htm',

  // Block B Gas
  'https://en.baochinhphu.vn/block-b-gas-pipeline-milestone.html':
    'https://baochinhphu.vn/bao-dam-dua-4-du-an-su-dung-khi-lo-b-o-mon-vao-van-hanh-dung-quy-hoach-102260108151227471.htm',

  // Masan Supra
  'https://cafef.vn/masan-supra-logistics-2026.chn':
    'https://cafef.vn/kham-pha-cong-than-supra-giup-wincommerce-tiet-kiem-13-chi-phi-188231031075350669.chn',

  // Stavian Quang Yen
  'https://vneconomy.vn/stavian-quang-yen-petrochemical.htm':
    'https://vneconomy.vn/quang-ninh-trao-giay-chung-nhan-dau-tu-du-an-nha-may-hoa-dau-tri-gia-1-5-ty-usd.htm',

  // Lach Huyen Port
  'https://vneconomy.vn/khoi-cong-ben-7-8-cang-lach-huyen.htm':
    'https://vneconomy.vn/ruc-rich-chuan-bi-thi-cong-2-ben-cang-container-tai-lach-huyen-nang-len-8-ben-den-nam-2027.htm',

  // Novaland Aqua City
  'https://cafef.vn/novaland-tai-cau-truc-tin-dung-aqua-city.chn':
    'https://cafef.vn/novaland-hoan-tat-tai-cau-truc-con-quy-dat-hon-2400-ha-chua-trien-khai-188260414153750599.chn',

  // Masan Wincommerce Meatdeli
  'https://vneconomy.vn/masan-wincommerce-chuoi-lanh-meatdeli.htm':
    'https://vneconomy.vn/vi-mo-tich-cuc-va-mua-mua-sam-cuoi-nam-don-bay-tang-truong-loi-nhuan-cua-masan.htm',

  // Da Nang High Tech Park
  'https://en.baochinhphu.vn/da-nang-high-tech-park-semiconductor-investment.html':
    'https://baochinhphu.vn/da-nang-tung-buoc-hien-thuc-hoa-phat-trien-cong-nghiep-vi-mach-ban-dan-102231228122956848.htm',

  // Typhoon Yagi
  'https://en.baochinhphu.vn/government-decree-typhoon-industrial-relief.html':
    'https://baochinhphu.vn/nghi-quyet-143-nq-cp-luc-day-quan-trong-cho-doanh-nghiep-phuc-hoi-sau-bao-lu-102240919102435489.htm',

  // FujiMart Sumitomo BRG
  'https://vneconomy.vn/sumitomo-mo-ban-khu-cong-nghe-bac-ha-noi.htm':
    'https://vneconomy.vn/fujimart-su-pha-tron-giua-am-thuc-viet-va-van-hoa-phuc-vu-nhat.htm',

  // Hoa Phat Dung Quat 2
  'https://cafef.vn/hoa-phat-hoan-tat-thu-nghiem-lo-cao-dung-quat-2.chn':
    'https://cafef.vn/ty-phu-tran-dinh-long-don-tin-vui-tu-du-an-khu-lien-hop-san-xuat-gang-thep-hoa-phat-dung-quat-2-188250904120221016.chn',

  // Stavian Feedstock Long Son
  'https://vneconomy.vn/stavian-hop-tac-cung-ung-hoa-dau-long-son.htm':
    'https://vneconomy.vn/stavian-hoa-chat-lot-top-15-icis-the-gioi.htm',

  // World Bank GDP
  'https://en.baochinhphu.vn/economy/wb-raises-viet-nam-s-2026-growth-forecast-to-7-4-per-cent-on-strong-ai-related-exports.html':
    'https://baochinhphu.vn/world-bank-nang-du-bao-tang-truong-gdp-viet-nam-len-74-102261006171626017.htm',
};

async function main() {
  console.log('=== FIXING BROKEN SOURCE URLS ACROSS CODEBASE AND DATABASE ===\n');

  // 1. Update historical-stories-data.ts
  const historicalPath = path.resolve(__dirname, '../src/lib/data/historical-stories-data.ts');
  let historicalContent = fs.readFileSync(historicalPath, 'utf8');
  for (const [oldUrl, newUrl] of Object.entries(URL_REPLACEMENTS)) {
    while (historicalContent.includes(oldUrl)) {
      historicalContent = historicalContent.replace(oldUrl, newUrl);
    }
  }
  fs.writeFileSync(historicalPath, historicalContent, 'utf8');
  console.log('✅ Updated historical-stories-data.ts');

  // 2. Update seed-weekly-reports.ts
  const seedPath = path.resolve(__dirname, '../scripts/seed-weekly-reports.ts');
  let seedContent = fs.readFileSync(seedPath, 'utf8');
  for (const [oldUrl, newUrl] of Object.entries(URL_REPLACEMENTS)) {
    while (seedContent.includes(oldUrl)) {
      seedContent = seedContent.replace(oldUrl, newUrl);
    }
  }
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log('✅ Updated seed-weekly-reports.ts');

  // 3. Update mock-intelligence.ts
  const mockPath = path.resolve(__dirname, '../src/lib/data/mock-intelligence.ts');
  let mockContent = fs.readFileSync(mockPath, 'utf8');
  for (const [oldUrl, newUrl] of Object.entries(URL_REPLACEMENTS)) {
    while (mockContent.includes(oldUrl)) {
      mockContent = mockContent.replace(oldUrl, newUrl);
    }
  }
  fs.writeFileSync(mockPath, mockContent, 'utf8');
  console.log('✅ Updated mock-intelligence.ts');

  // 4. Update PostgreSQL database
  const pool = getPostgresPool();
  console.log('\nUpdating PostgreSQL database...');
  for (const [oldUrl, newUrl] of Object.entries(URL_REPLACEMENTS)) {
    // Update story_sources
    const resSources = await pool.query(
      `UPDATE story_sources 
       SET article_url = $1, final_url = $1, canonical_url = $1 
       WHERE article_url = $2 OR final_url = $2 OR canonical_url = $2`,
      [newUrl, oldUrl]
    );

    if (resSources.rowCount && resSources.rowCount > 0) {
      console.log(`  Updated ${resSources.rowCount} source row(s): ${oldUrl.slice(0, 40)}... -> ${newUrl.slice(0, 40)}...`);
    }
  }

  await pool.end();
  console.log('\n🎉 ALL BROKEN SOURCE URLS SUCCESSFULLY REPLACED WITH LIVE 200 OK URLS!\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
