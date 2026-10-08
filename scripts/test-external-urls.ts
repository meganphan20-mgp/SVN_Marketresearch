import { SAMPLE_INTELLIGENCE_STORIES } from '../src/lib/data/mock-intelligence';

async function main() {
  const urls: { storyId: string; title: string; url: string }[] = [];
  for (const s of SAMPLE_INTELLIGENCE_STORIES) {
    for (const src of s.sources) {
      if (src.articleUrl) {
        urls.push({ storyId: s.id, title: s.title, url: src.articleUrl });
      }
    }
  }

  console.log(`Checking ${urls.length} source URLs...`);
  const failed: { title: string; url: string; status: number | string }[] = [];
  const succeeded: { title: string; url: string; status: number }[] = [];

  for (const item of urls) {
    try {
      const res = await fetch(item.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow',
      });
      // Check real 404 indicator (e.g. title or explicit error text)
      if (res.status === 200) {
        const text = await res.text();
        const isErrorPage = text.includes('Trang không tìm thấy');
        if (isErrorPage) {
          console.log(`❌ [404 Error Page] ${item.url}`);
          failed.push({ ...item, status: '404 In Body' });
          continue;
        }
        console.log(`✅ [200 OK] ${item.url}`);
        succeeded.push({ ...item, status: 200 });
      } else {
        console.log(`❌ [HTTP ${res.status}] ${item.url}`);
        failed.push({ ...item, status: res.status });
      }
    } catch (e: any) {
      console.log(`❌ [ERR: ${e.message}] ${item.url}`);
      failed.push({ ...item, status: e.message });
    }
  }

  console.log('\n--- RESULTS ---');
  console.log(`Success: ${succeeded.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log('\nFailed details:');
  for (const f of failed) {
    console.log(`- [${f.status}] ${f.url} (Story: ${f.title.slice(0, 40)}...)`);
  }
}

main();
