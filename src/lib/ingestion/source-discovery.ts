import { NewsSourceConfig } from '@/types/taxonomy';
import { DiscoveredArticleCandidate } from '@/types/intelligence';

/**
 * SOURCE DISCOVERY ENGINE (PHASE 1)
 * 
 * Strict Source-First Principle:
 * 1. Reads approved active sources from the source registry.
 * 2. Fetches real RSS feeds or HTML category sections.
 * 3. Extracts actual published article URLs directly from feed/markup.
 * 4. NEVER uses an LLM to generate or guess URLs.
 */

interface RawRssItem {
  title: string;
  link: string;
  pubDate?: string;
}

import { decodeHtmlEntities } from '../verification/source-first-validator';

/**
 * Robust XML/RSS item parser (environment agnostic, works in Node / Next.js)
 */
function parseRssXml(xmlText: string): RawRssItem[] {
  const items: RawRssItem[] = [];
  
  // Match each <item>...</item> or <entry>...</entry> block
  const itemRegex = /<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemContent = itemMatch[0];

    // Extract Title (handle CDATA or plain text)
    let title = '';
    const titleCdataMatch = itemContent.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i);
    const titlePlainMatch = itemContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleCdataMatch && titleCdataMatch[1]) {
      title = titleCdataMatch[1].trim();
    } else if (titlePlainMatch && titlePlainMatch[1]) {
      title = titlePlainMatch[1].trim();
    }

    // Extract Link (handle plain link, CDATA, or Atom <link href="...">)
    let link = '';
    const linkHrefMatch = itemContent.match(/<link\s+[^>]*href=["']([^"']+)["']/i);
    const linkCdataMatch = itemContent.match(/<link[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i);
    const linkPlainMatch = itemContent.match(/<link[^>]*>([^<]+)<\/link>/i);
    if (linkHrefMatch && linkHrefMatch[1]) {
      link = linkHrefMatch[1].trim();
    } else if (linkCdataMatch && linkCdataMatch[1]) {
      link = linkCdataMatch[1].trim();
    } else if (linkPlainMatch && linkPlainMatch[1]) {
      link = linkPlainMatch[1].trim();
    }

    // Fallback: check guid if it is a permalink URL
    if (!link || !link.startsWith('http')) {
      const guidMatch = itemContent.match(/<guid[^>]*isPermaLink=["']true["'][^>]*>([^<]+)<\/guid>/i) ||
                        itemContent.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i);
      if (guidMatch && guidMatch[1]) {
        link = guidMatch[1].trim();
      }
    }

    // Extract pubDate / dc:date / published / updated
    let pubDate: string | undefined;
    const pubDateMatch = 
      itemContent.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i) ||
      itemContent.match(/<dc:date[^>]*>([^<]+)<\/dc:date>/i) ||
      itemContent.match(/<published[^>]*>([^<]+)<\/published>/i) ||
      itemContent.match(/<updated[^>]*>([^<]+)<\/updated>/i);

    if (pubDateMatch && pubDateMatch[1]) {
      try {
        const rawDate = decodeHtmlEntities(pubDateMatch[1].trim());
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          pubDate = parsed.toISOString();
        }
      } catch {
        // Fallback to raw string
        pubDate = pubDateMatch[1].trim();
      }
    }

    // Clean entities in title
    if (title) {
      title = decodeHtmlEntities(title);
    }

    // Clean tracking query params from link
    if (link && link.startsWith('http')) {
      try {
        const urlObj = new URL(link);
        urlObj.searchParams.delete('utm_source');
        urlObj.searchParams.delete('utm_medium');
        urlObj.searchParams.delete('utm_campaign');
        urlObj.searchParams.delete('utm_term');
        urlObj.searchParams.delete('utm_content');
        urlObj.hash = '';
        link = urlObj.toString();
      } catch {
        // keep as is
      }
      items.push({ title, link, pubDate });
    }
  }

  return items;
}

/**
 * Checks whether an anchor href corresponds to a news article page.
 */
function isArticleHref(href: string, baseUrl: string): boolean {
  try {
    const url = new URL(href, baseUrl);
    const path = url.pathname.toLowerCase();

    // Disqualify homepage, category lists, tags, or static assets
    if (
      path === '/' || 
      path === '' ||
      path.endsWith('/doanh-nghiep.htm') || 
      path.endsWith('/tieu-diem.htm') || 
      path.endsWith('/thi-truong.htm') || 
      path.endsWith('/chung-khoan.htm') || 
      path.endsWith('/dia-oc.htm') ||
      path.includes('/category/') ||
      path.includes('/categories/') ||
      path.includes('/tag/') ||
      path.includes('/tags/') ||
      path.includes('/topic/') ||
      path.includes('/chuyen-muc/') ||
      /\.(jpg|png|webp|gif|css|js|svg)$/i.test(path)
    ) {
      return false;
    }

    // Pattern 1: ID-based article URLs (-d1234.html or -m1234.html, e.g. Báo Đầu Tư, The Investor)
    if (/-[dm]\d+\.html/i.test(path)) return true;

    // Pattern 2: Numeric slug articles (-123456.html, -123456.htm, -123456.chn)
    if (/-\d{5,}\.(?:html|htm|chn)$/i.test(path)) return true;

    // Pattern 3: Nested category articles (/12345/slug.html, e.g. Vietnam News)
    if (/\/\d{4,}\/[a-z0-9-]+\.html/i.test(path)) return true;

    // Pattern 4: Slug with multiple hyphens ending in .htm or .html (e.g. VnEconomy, VIR)
    const slugMatch = path.match(/\/([^\/?#]+)\.html?$/i);
    if (slugMatch) {
      const slug = slugMatch[1];
      const hyphenCount = (slug.match(/-/g) || []).length;
      if (hyphenCount >= 3 && slug.length >= 20) return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Discovers article URLs from HTML section/category pages (e.g. The Investor, VIR, Báo Đầu Tư, VnEconomy)
 */
function parseHtmlSectionArticles(html: string, baseUrl: string): RawRssItem[] {
  const items: RawRssItem[] = [];
  const seenLinks = new Set<string>();

  // Look for article links and headline texts
  // Matches <a href="...">Title</a> or headers wrapping <a>
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1].trim();
    let anchorText = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!href.startsWith('http')) {
      try {
        href = new URL(href, baseUrl).href;
      } catch {
        continue;
      }
    }

    if (isArticleHref(href, baseUrl)) {
      anchorText = decodeHtmlEntities(anchorText);

      if (!seenLinks.has(href) && anchorText.length > 20) {
        seenLinks.add(href);
        items.push({
          title: anchorText,
          link: href,
          pubDate: new Date().toISOString(),
        });
      }
    }
  }

  return items;
}

/**
 * Discovers candidate published articles from an active, approved source.
 */
export async function discoverArticlesFromSource(
  source: NewsSourceConfig,
  maxArticles = 15
): Promise<DiscoveredArticleCandidate[]> {
  if (!source.isActive) {
    return [];
  }

  const endpoint = source.rssUrl || (source.domain ? `https://${source.domain}` : null);
  if (!endpoint) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.8,*/*;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[Source Discovery] ${source.name} returned HTTP ${res.status} at ${endpoint}`);
      return [];
    }

    const buffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    let text = '';

    if (uint8[0] === 0xff && uint8[1] === 0xfe) {
      text = new TextDecoder('utf-16le').decode(buffer);
    } else if (uint8[0] === 0xfe && uint8[1] === 0xff) {
      text = new TextDecoder('utf-16be').decode(buffer);
    } else if (uint8[1] === 0 && uint8[3] === 0) {
      text = new TextDecoder('utf-16le').decode(buffer);
    } else if (uint8[0] === 0 && uint8[2] === 0) {
      text = new TextDecoder('utf-16be').decode(buffer);
    } else {
      text = new TextDecoder('utf-8').decode(buffer);
    }

    const isXml = text.includes('<rss') || text.includes('<feed') || text.includes('<?xml');

    let discoveredItems: RawRssItem[] = [];
    let method: DiscoveredArticleCandidate['discoveryMethod'] = 'RSS';

    if (isXml) {
      discoveredItems = parseRssXml(text);
      method = 'RSS';
    } else {
      discoveredItems = parseHtmlSectionArticles(text, endpoint);
      method = 'SECTION_SCRAPE';
    }

    const domainClean = source.domain.replace(/^www\./, '').toLowerCase();
    const domainSet = new Set<string>([source.domain, domainClean]);
    if (source.allowedDomains) {
      source.allowedDomains.forEach(d => domainSet.add(d.toLowerCase()));
    }
    if (domainClean.includes('vnexpress.net')) {
      domainSet.add('vnexpress.net');
      domainSet.add('e.vnexpress.net');
    }
    if (domainClean.includes('tuoitre.vn') || domainClean.includes('tuoitrenews.vn')) {
      domainSet.add('tuoitre.vn');
      domainSet.add('tuoitrenews.vn');
    }
    if (domainClean.includes('baodautu.vn')) {
      domainSet.add('baodautu.vn');
      domainSet.add('tinnhanhchungkhoan.vn');
    }
    if (domainClean.includes('nikkei.com')) {
      domainSet.add('asia.nikkei.com');
      domainSet.add('nikkei.com');
    }
    const finalAllowedDomains = Array.from(domainSet);

    return discoveredItems.slice(0, maxArticles).map(item => ({
      sourceId: source.id,
      sourceName: source.name,
      sourceTier: source.tier,
      sourceDomain: source.domain,
      allowedDomains: finalAllowedDomains,
      discoveredUrl: item.link,
      discoveredTitle: item.title,
      publishedAt: item.pubDate,
      discoveryMethod: method,
    }));
  } catch (error: any) {
    console.error(`[Source Discovery] Failed to discover from ${source.name} (${endpoint}):`, error.message);
    return [];
  }
}
