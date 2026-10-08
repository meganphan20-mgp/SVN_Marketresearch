import { VerificationStatus } from '@/types/intelligence';
import { evaluateSourceTiers, EvaluatableSource } from './tier-evaluator';
import { ConflictDetectionResult } from './conflict-detector';

export interface ConfidenceCalculationInput {
  sources: EvaluatableSource[];
  conflictResult: ConflictDetectionResult;
}

export interface ConfidenceScoreOutput {
  confidenceScore: number; // 0 to 100
  verificationStatus: VerificationStatus;
  verificationRationale: string;
  sourceWeightSum: number;
  conflictPenalty: number;
  officialIrBonus: number;
}

/**
 * Calculates mathematical confidence score (0-100) and assigns VerificationStatus.
 * 
 * Formula:
 * Score = min(100, max(0, round(
 *    (sum(TierWeight * 35)) - (ConflictPenalty * 30) + (OfficialIRBonus * 15)
 * )))
 */
export function calculateConfidenceScore(input: ConfidenceCalculationInput): ConfidenceScoreOutput {
  const { sources, conflictResult } = input;
  const evaluation = evaluateSourceTiers(sources);

  const sourceWeightSum = evaluation.weightedScoreSum;
  const conflictPenalty = conflictResult.conflictPenalty;
  const officialIrBonus = evaluation.hasOfficialIr ? 1 : 0;

  // Raw score calculation
  const rawScore = (sourceWeightSum * 35) - (conflictPenalty * 30) + (officialIrBonus * 15);
  const confidenceScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // VerificationStatus decision matrix
  let verificationStatus: VerificationStatus = 'UNVERIFIED';
  let rationale = '';

  if (conflictResult.hasConflicts && conflictResult.conflicts.length > 0) {
    verificationStatus = 'CONFLICTING';
    rationale = `Flagged with conflicting claims across ${sources.length} sources: ${conflictResult.conflicts[0].discrepancyNote}`;
  } else if (evaluation.hasTier1 || (evaluation.tier2Count >= 2 && !conflictResult.hasConflicts)) {
    verificationStatus = 'VERIFIED';
    const tier1Names = sources.filter(s => s.sourceTier === 'TIER_1').map(s => s.sourceName);
    if (evaluation.hasTier1) {
      rationale = `Verified by authoritative Tier 1 source (${tier1Names.join(', ') || 'Government / Global Wire'})${evaluation.hasOfficialIr ? ' with official corporate IR filing' : ''}.`;
    } else {
      rationale = `Cross-verified independently across ${evaluation.tier2Count} reputable Tier 2 economic publications with 0 detected discrepancies.`;
    }
  } else if (sources.length >= 2 && evaluation.tier2Count >= 1) {
    verificationStatus = 'PARTIALLY_VERIFIED';
    rationale = `Corroborated across ${sources.length} reporting channels; core event confirmed, awaiting official regulatory filing or secondary Tier 1 wire verification.`;
  } else if (sources.length === 1 && (sources[0].sourceTier === 'TIER_1' || sources[0].sourceTier === 'TIER_2')) {
    verificationStatus = 'SINGLE_SOURCE';
    rationale = `Reported exclusively by single outlet (${sources[0].sourceName}). Monitoring for peer corroboration across Vietnamese business media.`;
  } else {
    verificationStatus = 'UNVERIFIED';
    rationale = `Preliminary intelligence surfaced via domestic portal or trade blogs (${sources.map(s => s.sourceName).join(', ')}). Awaiting corroboration from Tier 1 or Tier 2 economic publications.`;
  }

  return {
    confidenceScore,
    verificationStatus,
    verificationRationale: rationale,
    sourceWeightSum,
    conflictPenalty,
    officialIrBonus,
  };
}
