import { computeSha256 } from '../verification/deduplication';
import { validateExternalUrl } from '../verification/url-validator';
import { cleanCanonicalUrl } from '../verification/source-link-verifier';
import { isInvalidDestinationUrl, parseArticleHtml } from '../verification/source-first-validator';
import { classifyArticleFreshness } from '../verification/freshness';
import { getPublicationDateLocal } from '../verification/temporal-gating';
import { DiscoveredArticleCandidate, RawArticle, ArticlePageValidationResult } from '@/types/intelligence';

/**
 * RAW ARTICLE FETCHER & VALIDATOR (PHASE 1.1 HARDENING)
 * 
 * Strict Source-First Principle:
 * 1. Takes an actual discovered URL from an approved source.
 * 2. Follows HTTP redirects and verifies source-domain integrity (allowedDomains).
 * 3. Enforces strict article page detection (HTTP 200-299, >= 150 words, title-body consistency).
 * 4. Extracts publication date following priority:
 *    (1) OpenGraph article:published_time -> (2) JSON-LD datePublished -> (3) RSS pubDate -> (4) HTML timestamp -> (5) null.
 *    NEVER uses fetched_at as published_at.
 * 5. Audits and preserves full raw HTML without arbitrary 50,000-byte truncation.
 * 6. Returns structured ArticlePageValidationResult.
 */

function isDomainAllowed(urlStr: string, allowedDomains: string[]): boolean {
  try {
    const hostname = new URL(urlStr).hostname.toLowerCase();
    return allowedDomains.some(d => {
      const cleanD = d.toLowerCase().replace(/^www\./, '');
      return hostname === cleanD || hostname.endsWith(`.${cleanD}`);
    });
  } catch {
    return false;
  }
}

function calculateDeltaHours(publishedAt: string | null, fetchedAt: string): {
  deltaHours: number | null;
  isSuspicious: boolean;
} {
  if (!publishedAt) {
    return { deltaHours: null, isSuspicious: false };
  }

  const pubTime = new Date(publishedAt).getTime();
  const fetchTime = new Date(fetchedAt).getTime();

  if (isNaN(pubTime) || isNaN(fetchTime)) {
    return { deltaHours: null, isSuspicious: true }; // Unparseable format
  }

  const deltaHours = Math.round(((fetchTime - pubTime) / (1000 * 3600)) * 10) / 10;

  // Flag suspicious:
  // 1. More than 2 hours in future (skew allowance)
  // 2. More than 5 years old (43,800 hours)
  const isSuspicious = deltaHours < -2 || deltaHours > (24 * 365 * 5);

  return { deltaHours, isSuspicious };
}

export async function fetchAndValidateRawArticle(
  candidate: DiscoveredArticleCandidate
): Promise<{
  rawArticle: RawArticle | null;
  validationResult: ArticlePageValidationResult;
}> {
  const failureReasons: string[] = [];
  const fetchedAt = new Date().toISOString();

  // Step 1: URL Syntax check
  const urlCheck = validateExternalUrl(candidate.discoveredUrl);
  if (!urlCheck.isValid) {
    failureReasons.push(`Invalid URL syntax: ${candidate.discoveredUrl}`);
    return {
      rawArticle: null,
      validationResult: {
        isValidArticlePage: false,
        httpStatusOk: false,
        domainMatch: false,
        notSpecialPage: false,
        titleValid: false,
        wordCount: 0,
        wordCountOk: false,
        publicationMetadataFound: false,
        titleBodyConsistencyScore: 0,
        titleBodyConsistent: false,
        failureReasons,
      },
    };
  }

  // Define allowed domains
  const allowed = candidate.allowedDomains && candidate.allowedDomains.length > 0
    ? candidate.allowedDomains
    : [candidate.sourceDomain || new URL(urlCheck.normalizedUrl).hostname];

  // Verify initial discovered domain
  if (!isDomainAllowed(urlCheck.normalizedUrl, allowed)) {
    failureReasons.push(`Discovered URL not in allowed domains: ${urlCheck.normalizedUrl}`);
  }

  let httpStatus = 0;
  let finalUrl = urlCheck.normalizedUrl;
  let rawHtml = '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9500); // 9.5s timeout

    const res = await fetch(urlCheck.normalizedUrl, {
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
    httpStatus = res.status;
    if (res.url) {
      finalUrl = res.url;
    }

    if (res.status < 200 || res.status > 299) {
      failureReasons.push(`HTTP status not in 200-299 range: ${res.status}`);
    } else {
      rawHtml = await res.text();
    }
  } catch (err: any) {
    failureReasons.push(`Network fetch failed: ${err?.message || 'Timeout / Connection abort'}`);
  }

  const httpStatusOk = httpStatus >= 200 && httpStatus <= 299;

  // Step 2: Source-Domain Integrity Verification
  const domainMatch = isDomainAllowed(finalUrl, allowed);
  if (!domainMatch) {
    failureReasons.push(`Cross-domain redirect to non-allowlisted domain: ${finalUrl}`);
  }

  // Step 3: Not Special Page (homepage, category, search, login, error)
  const notSpecialPage = !isInvalidDestinationUrl(finalUrl);
  if (!notSpecialPage) {
    failureReasons.push(`Destination is a special/directory/landing page: ${finalUrl}`);
  }

  // Step 4: Parse HTML
  const parsed = parseArticleHtml(rawHtml, finalUrl);

  const titleValid = Boolean(parsed.title && parsed.title.trim().length >= 10);
  if (!titleValid) {
    failureReasons.push(`Missing or excessively short title: "${parsed.title || ''}"`);
  }

  // Word count threshold: >= 150 meaningful words (Phase 1.1 hardening)
  const wordCount = parsed.wordCount;
  const wordCountOk = wordCount >= 150;
  if (!wordCountOk) {
    failureReasons.push(`Article body too short: ${wordCount} words (minimum required: 150)`);
  }

  // Step 5: Publication Date Validation (Priority: 1. OG -> 2. JSON-LD -> 3. RSS pubDate -> 4. HTML time -> 5. null)
  let publishedAt: string | null = null;
  let dateExtractionSource: RawArticle['dateExtractionSource'] = 'NONE';

  if (parsed.publicationDate && parsed.dateExtractionSource === 'OPEN_GRAPH') {
    publishedAt = parsed.publicationDate;
    dateExtractionSource = 'OPEN_GRAPH';
  } else if (parsed.publicationDate && parsed.dateExtractionSource === 'JSON_LD') {
    publishedAt = parsed.publicationDate;
    dateExtractionSource = 'JSON_LD';
  } else if (candidate.publishedAt) {
    // RSS pubDate
    const parsedRss = new Date(candidate.publishedAt);
    if (!isNaN(parsedRss.getTime())) {
      publishedAt = parsedRss.toISOString().slice(0, 10);
      dateExtractionSource = 'RSS_PUBDATE';
    }
  } else if (parsed.publicationDate && parsed.dateExtractionSource === 'HTML_TIME') {
    publishedAt = parsed.publicationDate;
    dateExtractionSource = 'HTML_TIME';
  } else {
    publishedAt = null;
    dateExtractionSource = 'NONE';
  }

  const publicationMetadataFound = Boolean(publishedAt);

  // Delta calculation and suspicious check
  const { deltaHours, isSuspicious: isTimestampSuspicious } = calculateDeltaHours(publishedAt, fetchedAt);
  if (isTimestampSuspicious) {
    failureReasons.push(`Suspicious publication timestamp: ${publishedAt} (delta: ${deltaHours}h)`);
  }

  // Step 6: Title-Body Consistency
  const titleBodyConsistent = parsed.isConsistentWithTitle;
  if (!titleBodyConsistent) {
    failureReasons.push(`Extracted body is inconsistent with article title (consistency score: ${parsed.consistencyScore}%)`);
  }

  // Overall validity check
  const isValidArticlePage = 
    httpStatusOk &&
    domainMatch &&
    notSpecialPage &&
    titleValid &&
    wordCountOk &&
    titleBodyConsistent;

  const validationResult: ArticlePageValidationResult = {
    isValidArticlePage,
    httpStatusOk,
    domainMatch,
    notSpecialPage,
    titleValid,
    wordCount,
    wordCountOk,
    publicationMetadataFound,
    titleBodyConsistencyScore: parsed.consistencyScore,
    titleBodyConsistent,
    failureReasons,
  };

  if (!isValidArticlePage) {
    return {
      rawArticle: null,
      validationResult,
    };
  }

  // Step 7: Content Truncation Audit & Sizing
  // Safe ceiling: 2.5 MB (2,500,000 characters)
  const MAX_RAW_CONTENT_CHARS = 2500000;
  const rawContentTruncated = rawHtml.length > MAX_RAW_CONTENT_CHARS;
  const rawContent = rawContentTruncated ? rawHtml.slice(0, MAX_RAW_CONTENT_CHARS) : rawHtml;
  const rawContentBytes = new TextEncoder().encode(rawContent).length;

  const cleanFinal = cleanCanonicalUrl(finalUrl);
  const cleanCanonical = parsed.canonicalUrl ? cleanCanonicalUrl(parsed.canonicalUrl) : null;
  const contentHash = computeSha256(parsed.title + '\n' + parsed.articleBody);
  // Step 8: Freshness Classification (Phase 1.2)
  const { articleAgeHours, freshnessBucket } = classifyArticleFreshness(publishedAt, fetchedAt);
  const articleId = `raw-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const rawArticle: RawArticle = {
    id: articleId,
    sourceId: candidate.sourceId,
    source_id: candidate.sourceId,
    sourceCode: candidate.sourceId,
    publisher: candidate.sourceName,
    title: parsed.title,
    originalTitle: candidate.discoveredTitle || parsed.title,
    originalUrl: candidate.discoveredUrl,
    url: cleanFinal,
    canonicalUrl: cleanCanonical,
    finalUrl: cleanFinal,
    httpStatus,
    publishedAt,
    fetchedAt,
    dateExtractionSource,
    publishedAtDeltaHours: deltaHours,
    isTimestampSuspicious,
    articleAgeHours,
    freshnessBucket,
    rawContent,
    rawContentBytes,
    rawContentTruncated,
    cleanedContent: parsed.articleBody,
    contentHash,
    fetchStatus: 'SUCCESS',
    fetchVerified: true,
    isArticlePage: true,
    validationDetails: validationResult,
    validationMetadata: validationResult as unknown as Record<string, any>,
    sourcePublicationDateLocal: publishedAt ? getPublicationDateLocal(publishedAt) : null,
    createdAt: fetchedAt,
  };

  return {
    rawArticle,
    validationResult,
  };
}
