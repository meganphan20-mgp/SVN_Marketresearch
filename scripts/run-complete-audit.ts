import { getPostgresPool } from '../src/lib/database/postgres';
import { HISTORICAL_INTELLIGENCE_STORIES } from '../src/lib/data/historical-stories-data';

interface CheckItem {
  storyId: string;
  storyTitle: string;
  sourceName: string;
  sourceTitle: string;
  url: string;
  table: string;
}

async function fetchDetails(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    const finalUrl = res.url;
    const status = res.status;
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'NO_TITLE';

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    let h1 = h1Match ? h1Match[1].replace(/\s+/g, ' ').trim() : '';

    return { status, finalUrl, title, h1 };
  } catch (err: any) {
    return { status: 0, finalUrl: url, title: `ERR: ${err.message}`, h1: '' };
  }
}

async function run() {
  const pool = getPostgresPool();
  const dbRows = await pool.query(`
    SELECT s.id, s.title as story_title, src.source_name, src.article_title as source_title, src.article_url as url
    FROM intelligence_stories s
    JOIN story_sources src ON s.id = src.story_id
    ORDER BY s.publication_date DESC
  `);
  await pool.end();

  const allItems: CheckItem[] = [];

  for (const row of dbRows.rows) {
    allItems.push({
      storyId: row.id,
      storyTitle: row.story_title,
      sourceName: row.source_name,
      sourceTitle: row.source_title,
      url: row.url,
      table: 'DB'
    });
  }

  for (const s of HISTORICAL_INTELLIGENCE_STORIES) {
    for (const src of s.sources) {
      if (!allItems.some(x => x.url === src.articleUrl && x.storyTitle === s.title)) {
        allItems.push({
          storyId: s.id,
          storyTitle: s.title,
          sourceName: src.sourceName,
          sourceTitle: src.articleTitle,
          url: src.articleUrl,
          table: 'STATIC'
        });
      }
    }
  }

  console.log(`TOTAL SOURCES TO AUDIT: ${allItems.length}\n`);

  const report: any[] = [];
  for (const item of allItems) {
    const details = await fetchDetails(item.url);
    report.push({ item, details });
  }

  console.log('------------------ AUDIT RESULTS ------------------');
  for (const r of report) {
    const status = r.details.status;
    const is404 = status === 404 || status === 0 || r.details.title.includes('404');
    console.log(JSON.stringify({
      table: r.item.table,
      storyId: r.item.storyId,
      storyTitle: r.item.storyTitle,
      sourceName: r.item.sourceName,
      sourceTitle: r.item.sourceTitle,
      url: r.item.url,
      finalUrl: r.details.finalUrl,
      status: r.details.status,
      pageTitle: r.details.title,
      h1: r.details.h1,
      is404
    }, null, 2));
  }
}

run().catch(console.error);
