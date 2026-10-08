import { SourceTier } from '@/types/intelligence';

export interface TierWeights {
  TIER_1: number;
  TIER_2: number;
  TIER_3: number;
  DISCOVERY: number;
}

export const SOURCE_TIER_WEIGHTS: Record<SourceTier, number> = {
  TIER_1: 1.0,
  TIER_2: 0.7,
  TIER_3: 0.4,
  DISCOVERY: 0.1,
};

export interface SourceTierEvaluation {
  tierCounts: Record<SourceTier, number>;
  totalSources: number;
  maxTierWeight: number;
  weightedScoreSum: number;
  hasTier1: boolean;
  tier2Count: number;
  hasOfficialIr: boolean;
  authoritativeSources: string[];
}

export interface EvaluatableSource {
  sourceName: string;
  sourceTier: SourceTier;
  isOfficialIr?: boolean;
}

/**
 * Evaluates the authority and tier composition of a group of sources.
 */
export function evaluateSourceTiers(sources: EvaluatableSource[]): SourceTierEvaluation {
  const tierCounts: Record<SourceTier, number> = {
    TIER_1: 0,
    TIER_2: 0,
    TIER_3: 0,
    DISCOVERY: 0,
  };

  let maxTierWeight = 0;
  let weightedScoreSum = 0;
  let hasOfficialIr = false;
  const authoritativeSources: string[] = [];

  for (const src of sources) {
    const tier = src.sourceTier || 'DISCOVERY';
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;

    const weight = SOURCE_TIER_WEIGHTS[tier] || 0.1;
    weightedScoreSum += weight;

    if (weight > maxTierWeight) {
      maxTierWeight = weight;
    }

    if (src.isOfficialIr) {
      hasOfficialIr = true;
    }

    if (tier === 'TIER_1' || tier === 'TIER_2') {
      if (!authoritativeSources.includes(src.sourceName)) {
        authoritativeSources.push(src.sourceName);
      }
    }
  }

  return {
    tierCounts,
    totalSources: sources.length,
    maxTierWeight,
    weightedScoreSum,
    hasTier1: tierCounts.TIER_1 > 0,
    tier2Count: tierCounts.TIER_2,
    hasOfficialIr,
    authoritativeSources,
  };
}
