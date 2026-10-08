import { createHash } from 'crypto';

/**
 * Normalizes text for deduplication and fuzzy comparison:
 * - Lowercases
 * - Strips diacritics / accents
 * - Strips punctuation, numbers, and extra whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s]/g, ' ')         // remove punctuation
    .replace(/\s+/g, ' ')            // collapse whitespace
    .trim();
}

/**
 * Computes SHA-256 hash of normalized text for exact deduplication.
 */
export function computeSha256(text: string): string {
  const normalized = normalizeText(text);
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Tokenizes text into word set (filtering out common Vietnamese/English stopwords).
 */
const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'for', 'to', 'of', 'with', 'by', 'as',
  'va', 'la', 'o', 'tai', 'cho', 'voi', 've', 'cac', 'nhung', 'mot', 'cua', 'trong', 'duoc', 'da',
  'co', 'se', 'nay', 'den', 'tu', 'theo', 'nhu', 'ra', 'vao', 'len', 'xuong'
]);

export function extractTokens(text: string): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

/**
 * Generates character or word n-grams (shingles) for text.
 */
export function generateShingles(text: string, n: number = 3): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 1);
  const shingles = new Set<string>();
  if (words.length < n) {
    shingles.add(words.join(' '));
    return shingles;
  }
  for (let i = 0; i <= words.length - n; i++) {
    shingles.add(words.slice(i, i + n).join(' '));
  }
  return shingles;
}

/**
 * Computes Jaccard similarity between two token sets.
 * Returns value from 0.0 to 1.0.
 */
export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Checks if two articles are duplicates based on title and content similarity.
 * Returns true if Jaccard similarity >= threshold (default 0.65).
 */
export function isNearDuplicate(
  textA: string,
  textB: string,
  threshold: number = 0.65
): { isDuplicate: boolean; similarity: number } {
  const tokensA = extractTokens(textA);
  const tokensB = extractTokens(textB);
  const similarity = calculateJaccardSimilarity(tokensA, tokensB);
  return {
    isDuplicate: similarity >= threshold,
    similarity: Math.round(similarity * 100) / 100,
  };
}
