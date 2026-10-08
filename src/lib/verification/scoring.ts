import { SourceTier, VerificationStatus, StorySourceLink, DetectedConflict } from '@/types/intelligence';

export interface VerificationEvaluationResult {
  status: VerificationStatus;
  confidenceScore: number;
  rationale: string;
  conflicts: DetectedConflict[];
}

export interface FactCheckInput {
  sources: StorySourceLink[];
  extractedFacts: {
    dealValueUsd?: number | null;
    dealValueText?: string | null;
    stakePercentage?: number | null;
    capacityOrSize?: string | null;
    location?: string | null;
    announcedTimeline?: string | null;
    keyPartners?: string[];
  };
  sourceReportedFacts?: Array<{
    sourceName: string;
    sourceTier: SourceTier;
    dealValueText?: string;
    stakePercentage?: number;
    timeline?: string;
    location?: string;
  }>;
}

/**
 * Computes deterministic Verification Status and Confidence Score
 * according to institutional Sogo Shosha intelligence standards.
 */
export function evaluateStoryVerification(input: FactCheckInput): VerificationEvaluationResult {
  const { sources, sourceReportedFacts = [] } = input;
  const conflicts: DetectedConflict[] = [];

  // Check for empty or nonexistent sources
  if (!sources || sources.length === 0) {
    return {
      status: 'UNVERIFIED',
      confidenceScore: 1.0,
      rationale: 'No verifiable external sources were attached to this intelligence record.',
      conflicts: [],
    };
  }

  // Count source tiers
  const tier1Sources = sources.filter(s => s.sourceTier === 'TIER_1');
  const tier2Sources = sources.filter(s => s.sourceTier === 'TIER_2');
  const tier3Sources = sources.filter(s => s.sourceTier === 'TIER_3');
  const totalCredible = tier1Sources.length + tier2Sources.length;

  // 1. Detect conflicts across reported facts (if multiple sources reported differing facts)
  if (sourceReportedFacts.length >= 2) {
    for (let i = 0; i < sourceReportedFacts.length; i++) {
      for (let j = i + 1; j < sourceReportedFacts.length; j++) {
        const a = sourceReportedFacts[i];
        const b = sourceReportedFacts[j];

        // Compare stake percentage discrepancies (e.g. 51% vs 49% or 100%)
        if (
          a.stakePercentage !== undefined &&
          b.stakePercentage !== undefined &&
          Math.abs(a.stakePercentage - b.stakePercentage) > 2.0
        ) {
          conflicts.push({
            field: 'ownership_stake',
            sourceA: { name: a.sourceName, claim: `${a.stakePercentage}% equity stake` },
            sourceB: { name: b.sourceName, claim: `${b.stakePercentage}% equity stake` },
            discrepancyNote: `Discrepancy in reported ownership percentage between ${a.sourceName} and ${b.sourceName}.`,
          });
        }

        // Compare timeline discrepancies
        if (
          a.timeline &&
          b.timeline &&
          a.timeline.toLowerCase().trim() !== b.timeline.toLowerCase().trim()
        ) {
          conflicts.push({
            field: 'announced_timeline',
            sourceA: { name: a.sourceName, claim: a.timeline },
            sourceB: { name: b.sourceName, claim: b.timeline },
            discrepancyNote: `Reported commercial launch or closing timeline differs between ${a.sourceName} and ${b.sourceName}.`,
          });
        }

        // Compare deal value discrepancies
        if (
          a.dealValueText &&
          b.dealValueText &&
          a.dealValueText.toLowerCase().trim() !== b.dealValueText.toLowerCase().trim()
        ) {
          conflicts.push({
            field: 'transaction_value',
            sourceA: { name: a.sourceName, claim: a.dealValueText },
            sourceB: { name: b.sourceName, claim: b.dealValueText },
            discrepancyNote: `Valuation / investment amount reported differently across publications.`,
          });
        }
      }
    }
  }

  // 2. Determine verification status based on hierarchical rules
  const hasMaterialConflict = conflicts.length > 0;

  // RULE A: Material Contradiction detected
  if (hasMaterialConflict) {
    const hasCoreConflict = conflicts.some(c => c.field === 'ownership_stake' || c.field === 'transaction_value');
    if (hasCoreConflict && totalCredible >= 2) {
      return {
        status: 'CONFLICTING',
        confidenceScore: 4.5,
        rationale: `Reliable sources report materially conflicting terms regarding ${conflicts.map(c => c.field).join(', ')}. Requires clarification before strategic commitment.`,
        conflicts,
      };
    } else {
      return {
        status: 'PARTIALLY_VERIFIED',
        confidenceScore: 7.2,
        rationale: `Core development is established across multiple media, but secondary parameters (valuation or timeline) vary between reporting outlets.`,
        conflicts,
      };
    }
  }

  // RULE B: Primary Tier 1 Official Confirmation exists
  if (tier1Sources.length >= 1) {
    const primarySourceNames = tier1Sources.map(s => s.sourceName).join(', ');
    const extraScore = tier1Sources.length > 1 ? 0.5 : 0;
    const additionalCredibleBonus = tier2Sources.length >= 1 ? 0.3 : 0;
    const finalScore = Math.min(10.0, 9.2 + extraScore + additionalCredibleBonus);

    return {
      status: 'VERIFIED',
      confidenceScore: parseFloat(finalScore.toFixed(1)),
      rationale: `Confirmed by Tier 1 official disclosure or regulatory filing (${primarySourceNames}). High institutional confidence.`,
      conflicts: [],
    };
  }

  // RULE C: At least two reliable independent Tier 2 sources agree
  if (tier2Sources.length >= 2) {
    const sourceCount = sources.length;
    const confidenceScore = Math.min(9.0, 8.2 + (sourceCount - 2) * 0.3);

    return {
      status: 'VERIFIED',
      confidenceScore: parseFloat(confidenceScore.toFixed(1)),
      rationale: `Cross-corroborated by ${tier2Sources.length} independent established domestic business publications (${tier2Sources.map(s => s.sourceName).join(', ')}). No conflicting statements found.`,
      conflicts: [],
    };
  }

  // RULE D: Only one credible Tier 1 or Tier 2 source
  if (totalCredible === 1) {
    const soleSource = sources.find(s => s.sourceTier === 'TIER_1' || s.sourceTier === 'TIER_2')!;
    return {
      status: 'SINGLE_SOURCE',
      confidenceScore: 6.0,
      rationale: `Single reporting source available to date (${soleSource.sourceName}). Independent corroboration or official exchange disclosure is pending.`,
      conflicts: [],
    };
  }

  // RULE E: Only Tier 3 sources present
  return {
    status: 'UNVERIFIED',
    confidenceScore: 3.5,
    rationale: `Circulated solely across secondary blogs or trade outlets (${tier3Sources.map(s => s.sourceName).join(', ')}). Information cannot yet be independently confirmed.`,
    conflicts: [],
  };
}
