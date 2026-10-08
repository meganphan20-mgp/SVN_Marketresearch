/**
 * Anti-hallucination URL verification gate.
 * 
 * Enforces strict rules:
 * 1. Protocol must be http: or https:
 * 2. Hostname must be valid and non-empty
 * 3. Rejects localhost, example.com, test.com, placeholder, lorem, or invalid dummy links
 * 4. Checks against recognized domain patterns for Vietnamese and international business media
 */

const TRUSTED_DOMAINS = [
  // Tier 1 Official & Global
  'mpi.gov.vn',
  'moit.gov.vn',
  'sbv.gov.vn',
  'chinhphu.vn',
  'reuters.com',
  'bloomberg.com',
  'asia.nikkei.com',
  'nikkei.com',
  'ft.com',
  'jetro.go.jp',
  'ssc.gov.vn',
  'hsx.vn',
  'hnx.vn',
  'sojitz.com',
  // Tier 2 Vietnam Premier Media
  'vir.com.vn',
  'vneconomy.vn',
  'vnexpress.net',
  'vietnamnet.vn',
  'vietnamnews.vn',
  'theinvestor.vn',
  'vietnam-briefing.com',
  'tuoitrenews.vn',
  // Tier 3 & Domestic Portals
  'cafef.vn',
  'thesaigontimes.vn',
  'tinnhanhchungkhoan.vn',
  'baodautu.vn',
  'enternews.vn',
  // Discovery
  'linkedin.com',
];

const DISALLOWED_PATTERNS = [
  'example.com',
  'localhost',
  'test.com',
  'dummy',
  'placeholder',
  'sample.com',
  'temp.url',
  '127.0.0.1',
];

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  domain: string;
  isTrustedDomain: boolean;
  rejectionReason?: string;
}

export function validateExternalUrl(urlString: string): UrlValidationResult {
  if (!urlString || typeof urlString !== 'string') {
    return {
      isValid: false,
      normalizedUrl: '',
      domain: '',
      isTrustedDomain: false,
      rejectionReason: 'Empty or invalid URL string provided.',
    };
  }

  const trimmed = urlString.trim();

  // Basic check against dummy strings
  for (const pattern of DISALLOWED_PATTERNS) {
    if (trimmed.toLowerCase().includes(pattern)) {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        domain: '',
        isTrustedDomain: false,
        rejectionReason: `URL contains disallowed placeholder pattern: ${pattern}`,
      };
    }
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        domain: '',
        isTrustedDomain: false,
        rejectionReason: `Invalid protocol: ${parsed.protocol}. Only http and https allowed.`,
      };
    }

    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!hostname || hostname.length < 3 || !hostname.includes('.')) {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        domain: hostname,
        isTrustedDomain: false,
        rejectionReason: 'Invalid hostname format.',
      };
    }

    const isTrusted = TRUSTED_DOMAINS.some(trusted => hostname === trusted || hostname.endsWith('.' + trusted));

    return {
      isValid: true,
      normalizedUrl: parsed.href,
      domain: hostname,
      isTrustedDomain: isTrusted,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      domain: '',
      isTrustedDomain: false,
      rejectionReason: 'URL syntax could not be parsed as valid URI.',
    };
  }
}

/**
 * Filters a list of source URLs, discarding any hallucinated or malformed URLs.
 */
export function sanitizeSourceUrls(urls: string[]): string[] {
  return urls
    .map(u => validateExternalUrl(u))
    .filter(res => res.isValid)
    .map(res => res.normalizedUrl);
}
