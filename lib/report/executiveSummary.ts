import type { Finding } from '@/lib/types'

/**
 * Executive summary + prioritization for the report — pure computation
 * over findings already produced in /api/generate (see the classification
 * work in lib/prompts/generate.ts). No new AI calls: this is aggregation,
 * not generation, so it's as cheap and deterministic as counting.
 */

export type PriorityTier = 'critical' | 'high' | 'medium' | 'low'

export type OverallRisk = 'low' | 'moderate' | 'high'
export type LaunchRecommendation = 'ready' | 'conditional' | 'not_ready'

export type ExecutiveSummary = {
  totalAssessed:      number
  compliantCount:     number
  nonCompliantCount:  number
  potentialGapCount:  number
  infoRequiredCount:  number
  complianceScore:    number // 0-100, see methodology note in the UI copy
  overallRisk:        OverallRisk
  launchRecommendation: LaunchRecommendation
  blockingIssues:     Finding[]
  remediationEffort:  string
}

/**
 * Display-only priority tier — derived from classification + severity, not
 * a stored field. Keeps the underlying severity enum untouched (still just
 * high/medium/low) while giving the report a four-tier Critical/High/
 * Medium/Low sort that a compliance reviewer expects.
 */
export function priorityTier(finding: Finding): PriorityTier {
  const { classification, severity } = finding
  if (classification === 'non_compliant' && severity === 'high') return 'critical'
  if (classification === 'non_compliant') return 'high'
  if (classification === 'potential_gap' && severity === 'high') return 'high'
  if (classification === 'potential_gap') return 'medium'
  if (classification === 'info_required' && severity === 'high') return 'medium'
  return 'low'
}

const PRIORITY_ORDER: Record<PriorityTier, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function sortByPriority(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => PRIORITY_ORDER[priorityTier(a)] - PRIORITY_ORDER[priorityTier(b)])
}

export function buildExecutiveSummary(findings: Finding[]): ExecutiveSummary {
  const compliant     = findings.filter(f => f.classification === 'compliant')
  const nonCompliant  = findings.filter(f => f.classification === 'non_compliant')
  const potentialGap  = findings.filter(f => f.classification === 'potential_gap')
  const infoRequired  = findings.filter(f => f.classification === 'info_required')

  const totalAssessed = findings.length
  const complianceScore = totalAssessed === 0
    ? 0
    : Math.round((compliant.length / totalAssessed) * 100)

  const blockingIssues = findings.filter(f => {
    const tier = priorityTier(f)
    return tier === 'critical' || tier === 'high'
  })

  const hasCritical = nonCompliant.some(f => f.severity === 'high')

  const overallRisk: OverallRisk =
    hasCritical ? 'high' : (blockingIssues.length > 0 || nonCompliant.length > 0) ? 'moderate' : 'low'

  const launchRecommendation: LaunchRecommendation =
    hasCritical ? 'not_ready' : blockingIssues.length > 0 ? 'conditional' : 'ready'

  const remediationEffort =
    blockingIssues.length === 0 ? 'None — no blocking issues identified' :
    blockingIssues.length <= 2  ? '1–2 weeks' :
    blockingIssues.length <= 5  ? '2–4 weeks' :
    '4–8 weeks'

  return {
    totalAssessed,
    compliantCount: compliant.length,
    nonCompliantCount: nonCompliant.length,
    potentialGapCount: potentialGap.length,
    infoRequiredCount: infoRequired.length,
    complianceScore,
    overallRisk,
    launchRecommendation,
    blockingIssues,
    remediationEffort,
  }
}
