import { computeSha256 } from './deduplication';
import { validateExternalUrl } from './url-validator';
import { cleanCanonicalUrl } from './source-link-verifier';
import { ValidatedSourceRecord, StorySourceLink } from '@/types/intelligence';

/**
 * Checks if a destination URL is a generic portal, homepage, search, or error landing page.
 * Section 3 Hard Delete Condition:
 * Immediately discard if redirect to homepage, category, search, or login.
 */
export function isInvalidDestinationUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.toLowerCase().replace(/\/$/, '');

    // Root homepage or standard indices
    if (!path || path === '' || path === '/index.html' || path === '/home' || path === '/en' || path === '/vi') {
      return true;
    }

    // Category / Tag / Search / Topic directories
    if (
      path.startsWith('/category') ||
      path.startsWith('/categories') ||
      path.startsWith('/tag') ||
      path.startsWith('/tags') ||
      path.startsWith('/topic') ||
      path.startsWith('/topics') ||
      path.startsWith('/search') ||
      path.startsWith('/tim-kiem') ||
      path.includes('/search/') ||
      path.includes('/category/') ||
      path === '/news' ||
      path === '/news/business' ||
      path === '/news/economy' ||
      path === '/economy' ||
      path === '/business' ||
      path === '/kinh-doanh' ||
      path === '/markets' ||
      path === '/thi-truong'
    ) {
      return true;
    }

    // Auth / Login / Account pages
    if (
      path.includes('/login') ||
      path.includes('/signin') ||
      path.includes('/register') ||
      path.includes('/dang-nhap') ||
      path.includes('/subscription') ||
      path.includes('/paywall')
    ) {
      return true;
    }

    // Error pages
    if (path.includes('/404') || path.includes('/error') || path.includes('/not-found')) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * Extracts publication date and extraction source following strict priority:
 * 1. OpenGraph article:published_time
 * 2. JSON-LD datePublished
 * 3. Visible publisher HTML timestamp
 * 4. null / NONE
 */
/**
 * Decodes numeric and named HTML entities into clean UTF-8 text.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Extracts publication date and extraction source following strict priority:
 * 1. OpenGraph article:published_time
 * 2. JSON-LD datePublished
 * 3. Visible publisher HTML timestamp
 * 4. Vietnamese text pattern in article header/meta
 * 5. null / NONE
 */
export function extractPublicationDateFromHtml(html: string): {
  date: string | null;
  source: 'OPEN_GRAPH' | 'JSON_LD' | 'HTML_TIME' | 'NONE';
} {
  // 1. OpenGraph article:published_time or its_time
  const ogMatch = html.match(/<meta\s+[^>]*(?:property|name)=["'](?:article:published_time|og:published_time|article:published|its_time)["'][^>]*content=["']([^"']+)["']/i) ||
                  html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:article:published_time|og:published_time|article:published|its_time)["']/i);
  if (ogMatch && ogMatch[1]) {
    const raw = decodeHtmlEntities(ogMatch[1].trim());
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return { date: parsed.toISOString().slice(0, 10), source: 'OPEN_GRAPH' };
    }
  }

  // 2. JSON-LD datePublished
  const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch;
  while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(ldMatch[1]);
      const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      for (const item of items) {
        if (item && item.datePublished) {
          const raw = decodeHtmlEntities(String(item.datePublished).trim());
          const parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) {
            return { date: parsed.toISOString().slice(0, 10), source: 'JSON_LD' };
          }
        }
      }
    } catch {
      // Ignore unparseable JSON-LD blocks
    }
  }

  // 3. Visible publisher publication timestamp (<time>, meta pubdate, etc.)
  const metaDateMatch = html.match(/<meta\s+[^>]*(?:property|name)=["'](?:pubdate|publishdate|date|article_date|publish_time)["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:pubdate|publishdate|date|article_date|publish_time)["']/i);
  if (metaDateMatch && metaDateMatch[1]) {
    const raw = decodeHtmlEntities(metaDateMatch[1].trim());
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return { date: parsed.toISOString().slice(0, 10), source: 'HTML_TIME' };
    }
  }

  const timeMatch = html.match(/<time\s+[^>]*datetime=["']([^"']+)["']/i);
  if (timeMatch && timeMatch[1]) {
    const raw = decodeHtmlEntities(timeMatch[1].trim());
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return { date: parsed.toISOString().slice(0, 10), source: 'HTML_TIME' };
    }
  }

  // 4. Vietnamese text pattern in article header/meta: e.g. "10:00, 12/09/2026" or "Thứ Tư, 07/10/2026"
  const vnDateMatch = html.match(/(?:ngày|\b|\s)(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
  if (vnDateMatch) {
    const day = parseInt(vnDateMatch[1], 10);
    const month = parseInt(vnDateMatch[2], 10);
    const year = parseInt(vnDateMatch[3], 10);
    if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { date: formatted, source: 'HTML_TIME' };
    }
  }

  return { date: null, source: 'NONE' };
}

/**
 * Computes semantic keyword overlap between article title and extracted body.
 */
export function computeTitleBodyConsistency(title: string, body: string): {
  score: number;
  isConsistent: boolean;
} {
  if (!title || !body) return { score: 0, isConsistent: false };

  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'more', 'will', 'than',
    'about', 'after', 'into', 'over', 'của', 'và', 'các', 'cho', 'trong', 'với', 'những',
    'được', 'theo', 'này', 'trên', 'khi', 'về', 'to', 'in', 'on', 'at', 'by', 'an', 'is', 'as'
  ]);

  const titleTokens = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !stopWords.has(w));

  if (titleTokens.length === 0) {
    return { score: 100, isConsistent: true };
  }

  const bodyLower = body.toLowerCase();
  let matchedCount = 0;
  for (const token of titleTokens) {
    if (bodyLower.includes(token)) {
      matchedCount++;
    }
  }

  const matchRatio = matchedCount / titleTokens.length;
  const score = Math.round(matchRatio * 100);
  const isConsistent = score >= 15 || (matchedCount >= 2 && titleTokens.length >= 2);

  return { score, isConsistent };
}

/**
 * Extracts exact article title, publication date, canonical URL, and body paragraphs from raw HTML.
 */
export function parseArticleHtml(html: string, fallbackUrl: string): {
  title: string;
  canonicalUrl: string;
  publicationDate: string | null;
  dateExtractionSource: 'OPEN_GRAPH' | 'JSON_LD' | 'HTML_TIME' | 'NONE';
  articleBody: string;
  wordCount: number;
  consistencyScore: number;
  isConsistentWithTitle: boolean;
} {
  let title = '';
  let canonicalUrl = fallbackUrl;

  // Extract Title from standard meta tags and <title>
  const titleIts = html.match(/<meta\s+name=["']its_title["']\s+content=["']([^"']+)["']/i);
  const titleOg = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Tag = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  if (titleIts && titleIts[1]) {
    title = titleIts[1].trim();
  } else if (titleOg && titleOg[1]) {
    title = titleOg[1].trim();
  } else if (titleTag && titleTag[1]) {
    title = titleTag[1].trim();
  } else if (h1Tag && h1Tag[1]) {
    title = h1Tag[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Clean trailing publisher branding from title (e.g., " - VnExpress International", " | Reuters")
  if (title) {
    title = decodeHtmlEntities(
      title
        .replace(/\s*[-–|•]\s*(VnExpress|VnExpress International|VietnamPlus|Reuters|Nikkei Asia|Bloomberg|VIR|VnEconomy|The Investor|CafeF|CafeBiz|Tuoi Tre|Thanh Nien|Báo Đầu Tư|VietnamNet|Báo Chính Phủ|VGP News)[\w\s.]*$/i, '')
    );
  }

  // Canonical URL
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+name=["']its_url["']\s+content=["']([^"']+)["']/i);
  if (canonicalMatch && canonicalMatch[1]) {
    canonicalUrl = cleanCanonicalUrl(decodeHtmlEntities(canonicalMatch[1].trim()));
  }

  // Extract Publication date following strict priority
  const dateResult = extractPublicationDateFromHtml(html);

  // Target main article content container if present to eliminate menu/footer/sidebar noise
  // 1. Clean out scripts, styles, aside, nav, headers, footers, sidebars, and related news widgets from html first
  const cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*(?:sidebar|main-right|related|other-news|most-read|box-related|tin-lien-quan|listing|recommend|detail-icon-share|tags|share-box)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 2. Search for dedicated article body containers and pick the one containing genuine article paragraphs
  const containerRegex = /<(?:div|article|main|section)[^>]*class=["'][^"']*(?:mydetail|fck_detail|detail__cmain|detail-ccontent|contentdetail|detail-content|detail__content|post-content|article-content|the-article-body|cms-body|maincontent)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|main|section)>/gi;
  let bestContainer = '';
  let maxPCount = 0;
  let cMatch;
  while ((cMatch = containerRegex.exec(cleanHtml)) !== null) {
    const pCount = (cMatch[1].match(/<p[^>]*>/gi) || []).length;
    if (pCount > maxPCount) {
      maxPCount = pCount;
      bestContainer = cMatch[1];
    }
  }

  // Check ID-based content wrappers (Tuoi Tre, Bao Dau Tu, etc.)
  if (maxPCount < 2) {
    const idMatch = cleanHtml.match(/<(?:div|section|article)[^>]*id=["'](?:main-detail|content_detail|article-editor|maincontent|mainContent|main-content)["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i);
    if (idMatch && (idMatch[1].match(/<p[^>]*>/gi) || []).length >= 2) {
      bestContainer = idMatch[1];
      maxPCount = (idMatch[1].match(/<p[^>]*>/gi) || []).length;
    }
  }

  // Check semantic <article> or <main>
  if (maxPCount < 2) {
    const articleMatch = cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (articleMatch && (articleMatch[1].match(/<p[^>]*>/gi) || []).length >= 2) {
      bestContainer = articleMatch[1];
      maxPCount = (articleMatch[1].match(/<p[^>]*>/gi) || []).length;
    }
  }

  const targetHtml = maxPCount >= 2 ? bestContainer : cleanHtml;

  // Extract body paragraphs (preserve complete article body)
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(targetHtml)) !== null) {
    let cleanText = match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    cleanText = decodeHtmlEntities(cleanText);

    // Ignore tiny cookie notices or boilerplate author credits
    if (
      cleanText.length > 25 &&
      !cleanText.toLowerCase().includes('all rights reserved') &&
      !cleanText.toLowerCase().includes('cookie policy') &&
      !cleanText.toLowerCase().includes('terms of service') &&
      !cleanText.toLowerCase().includes('chia sẻ bài viết') &&
      !cleanText.toLowerCase().includes('theo dõi chúng tôi')
    ) {
      paragraphs.push(cleanText);
    }
  }

  // Fallback: If container extraction returned too few paragraphs, extract from whole html
  if (paragraphs.length < 2 && targetHtml !== html) {
    const fullPRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let fullMatch;
    while ((fullMatch = fullPRegex.exec(html)) !== null) {
      let cleanText = decodeHtmlEntities(
        fullMatch[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );
      if (
        cleanText.length > 25 &&
        !cleanText.toLowerCase().includes('all rights reserved') &&
        !cleanText.toLowerCase().includes('cookie policy')
      ) {
        paragraphs.push(cleanText);
      }
    }
  }

  const articleBody = paragraphs.join('\n\n').trim();
  const wordCount = articleBody ? articleBody.split(/\s+/).filter(Boolean).length : 0;
  const consistency = computeTitleBodyConsistency(title, articleBody);

  return {
    title,
    canonicalUrl,
    publicationDate: dateResult.date,
    dateExtractionSource: dateResult.source,
    articleBody,
    wordCount,
    consistencyScore: consistency.score,
    isConsistentWithTitle: consistency.isConsistent,
  };
}

/**
 * Extracts publisher name from URL or domain.
 */
export function extractPublisherFromUrl(urlStr: string): string {
  try {
    const hostname = new URL(urlStr).hostname.toLowerCase();
    if (hostname.includes('vnexpress.net')) return 'VnExpress International';
    if (hostname.includes('vietnamplus.vn')) return 'VietnamPlus (VNA)';
    if (hostname.includes('nikkei.com')) return 'Nikkei Asia';
    if (hostname.includes('reuters.com')) return 'Reuters';
    if (hostname.includes('bloomberg.com')) return 'Bloomberg';
    if (hostname.includes('vir.com.vn')) return 'Vietnam Investment Review';
    if (hostname.includes('vneconomy.vn')) return 'VnEconomy';
    if (hostname.includes('theinvestor.vn')) return 'The Investor';
    if (hostname.includes('cafef.vn')) return 'CafeF';
    if (hostname.includes('tuoitrenews.vn')) return 'Tuoi Tre News';
    if (hostname.includes('baochinhphu.vn')) return 'VGP News (Government Portal)';
    if (hostname.includes('moit.gov.vn')) return 'Ministry of Industry and Trade (MOIT)';
    if (hostname.includes('mpi.gov.vn')) return 'Ministry of Planning and Investment (MPI)';
    if (hostname.includes('sbv.gov.vn')) return 'State Bank of Vietnam (SBV)';
    return hostname.replace(/^www\./, '');
  } catch {
    return 'Media Source';
  }
}

/**
 * SECTION 2 — OPEN THE URL BEFORE ANY AI ANALYSIS
 * Performs live HTTP request, follows redirects, inspects status, and validates actual article content.
 * Returns ValidatedSourceRecord if eligible, or null if any Section 3 Hard Delete Condition triggers.
 */
export async function openAndValidateSourceUrl(
  candidateUrl: string,
  preferredPublisher?: string
): Promise<ValidatedSourceRecord | null> {
  const trimmedUrl = candidateUrl ? candidateUrl.trim() : '';
  if (!trimmedUrl) return null;

  // Step 1: URL Syntax check
  const syntax = validateExternalUrl(trimmedUrl);
  if (!syntax.isValid) {
    return null; // Section 3: Hard delete malformed URL
  }

  // Step 2: Live HTTP Request (follow redirects)
  let resStatus = 0;
  let finalUrl = syntax.normalizedUrl;
  let html = '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(syntax.normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    resStatus = res.status;
    if (res.url) {
      finalUrl = res.url;
    }

    // SECTION 2 GATE: HTTP status = 200-299
    if (res.status < 200 || res.status > 299) {
      return null; // Discard 404, 410, 403, 500, etc.
    }

    html = await res.text();
  } catch {
    // Section 3: DNS failure, connection timeout, network failure
    return null; // Delete immediately
  }

  // Section 3 Gate: Redirect to homepage, category, search, or login
  if (isInvalidDestinationUrl(finalUrl)) {
    return null;
  }

  // Section 2 & 5: Parse Article HTML
  const parsed = parseArticleHtml(html, finalUrl);

  // Section 2 & 3 Gate:
  // Final destination contains an actual article AND body can be extracted with meaningful content (>= 40 words or >= 200 characters)
  if (!parsed.title || parsed.wordCount < 40 || parsed.articleBody.length < 200) {
    return null; // Page contains no article or body cannot be extracted
  }

  const cleanFinalUrl = cleanCanonicalUrl(finalUrl);
  const cleanCanonical = cleanCanonicalUrl(parsed.canonicalUrl || cleanFinalUrl);
  const publisher = preferredPublisher || extractPublisherFromUrl(cleanFinalUrl);
  const content_hash = computeSha256(parsed.title + '\n' + parsed.articleBody);
  const validation_timestamp = new Date().toISOString();
  const published_at = parsed.publicationDate || validation_timestamp.slice(0, 10);

  return {
    source_id: `src-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    publisher,
    source_title: parsed.title, // Exact title from page (Section 5)
    published_at,
    validated_url: cleanFinalUrl,
    canonical_url: cleanCanonical,
    validation_timestamp,
    http_status: resStatus,
    content_hash,
    article_body: parsed.articleBody,
    word_count: parsed.wordCount,
  };
}

/**
 * Converts a ValidatedSourceRecord to a StorySourceLink for public UI and database storage.
 */
export function toStorySourceLink(record: ValidatedSourceRecord, isPrimary = false): StorySourceLink {
  return {
    id: record.source_id,
    sourceId: record.source_id,
    sourceName: record.publisher,
    publisher: record.publisher,
    sourceTier: record.source_tier || 'TIER_1',
    articleTitle: record.source_title,
    sourceTitle: record.source_title,
    articleUrl: record.validated_url,
    validatedUrl: record.validated_url,
    canonicalUrl: record.canonical_url,
    publishedAt: record.published_at,
    validationTimestamp: record.validation_timestamp,
    httpStatus: record.http_status,
    contentHash: record.content_hash,
    accessUrl: record.canonical_url || record.validated_url,
    isPrimaryClaimSource: isPrimary,
    linkStatus: 'VERIFIED',
    isContentMatched: true,
    contentMatchScore: 100,
    editorReviewed: true,
    auditedAt: record.validation_timestamp,
    articleBodySnippet: record.article_body.slice(0, 300),
  };
}
