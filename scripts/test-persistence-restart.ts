import { getPostgresPool, isPostgresConnected } from '../src/lib/database/postgres';

async function verifyPostgresRestart() {
  console.log('[PostgreSQL Process Restart Audit] Starting isolated process check...');
  const pool = getPostgresPool();
  const isConnected = await isPostgresConnected();
  console.log(`Connected to PostgreSQL: ${isConnected}`);

  const res = await pool.query(`
    SELECT id, title, url, freshness_bucket, article_age_hours, content_hash
    FROM public.raw_articles
    WHERE fetch_verified = true AND is_article_page = true
    ORDER BY fetched_at DESC
    LIMIT 10;
  `);

  console.log(`Verified database rows retrieved after process restart: ${res.rows.length}`);
  if (res.rows.length < 10) {
    console.error(`FAIL: Expected at least 10 rows from PostgreSQL, got ${res.rows.length}`);
    process.exit(1);
  }

  res.rows.forEach((r, i) => {
    console.log(`  [${i + 1}] (${r.freshness_bucket}) "${r.title.slice(0, 45)}..." [${r.id}]`);
  });

  console.log('SUCCESS: PostgreSQL persistence confirmed across process restart boundary.');
  await pool.end();
  process.exit(0);
}

verifyPostgresRestart().catch(err => {
  console.error(err);
  process.exit(1);
});
