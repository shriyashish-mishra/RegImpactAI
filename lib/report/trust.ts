import type { Finding } from '@/lib/types'

/**
 * Hallucination guard: a finding claiming the product is non-compliant or
 * at risk, at meaningful confidence, but citing zero specific evidence, is
 * a self-contradiction worth surfacing — the model said how sure it was
 * without saying what it's sure based on. This doesn't silently downgrade
 * or hide the finding (the model's classification is not overridden); it
 * just makes the inconsistency visible so a reviewer weighs it accordingly,
 * per the instruction that uncertainty must be shown, not silently handled.
 */
export function hasWeakEvidenceSupport(finding: Finding): boolean {
  const isActionable = finding.classification === 'non_compliant' || finding.classification === 'potential_gap'
  const claimsMeaningfulConfidence = finding.confidence !== 'low'
  const hasNoEvidence = finding.evidence_found.length === 0
  return isActionable && claimsMeaningfulConfidence && hasNoEvidence
}
