import { DetectedConflict, ExtractedFacts } from '@/types/intelligence';

export interface SourceArticleClaim {
  sourceName: string;
  url?: string;
  content: string;
  extractedFacts?: ExtractedFacts;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: DetectedConflict[];
  conflictPenalty: number; // 0 to 3 scale (multiplied by 30 in final formula)
  summaryText: string;
}

/**
 * Extracts numbers associated with currency or percentages from text.
 */
function extractDealValueNumbers(text: string): number[] {
  const matches: number[] = [];
  // Match patterns like $50M, $100 million, 100M USD, 2.5 billion USD
  const usdRegex = /(?:\$|usd\s*)(\d+(?:\.\d+)?)\s*(?:million|m|billion|b)?/gi;
  let match;
  while ((match = usdRegex.exec(text)) !== null) {
    let val = parseFloat(match[1]);
    const full = match[0].toLowerCase();
    if (full.includes('billion') || full.includes('b')) {
      val = val * 1000;
    }
    matches.push(val);
  }
  return matches;
}

function extractPercentages(text: string): number[] {
  const matches: number[] = [];
  const pctRegex = /(\d+(?:\.\d+)?)\s*%/g;
  let match;
  while ((match = pctRegex.exec(text)) !== null) {
    matches.push(parseFloat(match[1]));
  }
  return matches;
}

/**
 * Detects discrepancies between articles covering the same story.
 */
export function detectFactConflicts(articles: SourceArticleClaim[]): ConflictDetectionResult {
  const conflicts: DetectedConflict[] = [];

  if (articles.length < 2) {
    return {
      hasConflicts: false,
      conflicts: [],
      conflictPenalty: 0,
      summaryText: 'Single source; no peer conflicts detected.',
    };
  }

  // 1. Check extracted structured facts if available
  const factsList = articles
    .map(a => ({ sourceName: a.sourceName, url: a.url, facts: a.extractedFacts }))
    .filter(item => item.facts !== undefined);

  if (factsList.length >= 2) {
    for (let i = 0; i < factsList.length; i++) {
      for (let j = i + 1; j < factsList.length; j++) {
        const a = factsList[i];
        const b = factsList[j];

        // Check Deal Value
        if (a.facts?.dealValueUsd && b.facts?.dealValueUsd) {
          const diffPct = Math.abs(a.facts.dealValueUsd - b.facts.dealValueUsd) / Math.max(a.facts.dealValueUsd, b.facts.dealValueUsd);
          if (diffPct > 0.10) { // >10% discrepancy
            conflicts.push({
              field: 'Deal Valuation',
              sourceA: {
                name: a.sourceName,
                claim: `$${(a.facts.dealValueUsd / 1e6).toFixed(1)}M USD`,
                url: a.url,
              },
              sourceB: {
                name: b.sourceName,
                claim: `$${(b.facts.dealValueUsd / 1e6).toFixed(1)}M USD`,
                url: b.url,
              },
              discrepancyNote: `Valuation discrepancy of ${(diffPct * 100).toFixed(0)}% exceeds 10% tolerance threshold.`,
            });
          }
        }

        // Check Stake Percentage
        if (a.facts?.stakePercentage && b.facts?.stakePercentage) {
          if (Math.abs(a.facts.stakePercentage - b.facts.stakePercentage) >= 2) { // >= 2% difference
            conflicts.push({
              field: 'Equity Stake',
              sourceA: {
                name: a.sourceName,
                claim: `${a.facts.stakePercentage}%`,
                url: a.url,
              },
              sourceB: {
                name: b.sourceName,
                claim: `${b.facts.stakePercentage}%`,
                url: b.url,
              },
              discrepancyNote: `Discrepancy in reported equity stake (${a.facts.stakePercentage}% vs ${b.facts.stakePercentage}%).`,
            });
          }
        }
      }
    }
  }

  // 2. Fallback heuristic on raw content if no structured facts generated conflicts
  if (conflicts.length === 0) {
    for (let i = 0; i < articles.length; i++) {
      for (let j = i + 1; j < articles.length; j++) {
        const artA = articles[i];
        const artB = articles[j];

        const pctsA = extractPercentages(artA.content);
        const pctsB = extractPercentages(artB.content);

        // Check if one source claims controlling (e.g. 51%+) and another claims minority (e.g. 49%)
        const hasMajorityA = pctsA.some(p => p >= 50);
        const hasMajorityB = pctsB.some(p => p >= 50);
        const hasMinorityA = pctsA.some(p => p > 40 && p < 50);
        const hasMinorityB = pctsB.some(p => p > 40 && p < 50);

        if ((hasMajorityA && hasMinorityB && !hasMinorityA) || (hasMajorityB && hasMinorityA && !hasMajorityB)) {
          conflicts.push({
            field: 'Controlling Interest Claim',
            sourceA: { name: artA.sourceName, claim: `Reported ~${pctsA.join(', ')}%`, url: artA.url },
            sourceB: { name: artB.sourceName, claim: `Reported ~${pctsB.join(', ')}%`, url: artB.url },
            discrepancyNote: 'Potential majority stake vs minority stake discrepancy reported across publications.',
          });
        }
      }
    }
  }

  // Calculate conflict penalty (capped at 2.0 to avoid wiping score completely if legitimate reports disagree on estimates)
  const conflictPenalty = Math.min(2.0, conflicts.length * 0.8);
  const hasConflicts = conflicts.length > 0;

  return {
    hasConflicts,
    conflicts,
    conflictPenalty,
    summaryText: hasConflicts
      ? `${conflicts.length} cross-source factual conflict(s) detected across reporting.`
      : 'All reporting sources concordant on key numerical claims.',
  };
}
