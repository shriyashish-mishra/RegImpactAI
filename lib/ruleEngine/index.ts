import type { CorpusClause, StructuredProductInfo, ProductElement } from '@/lib/types'

/**
 * Deterministic pre-AI classification — the "Rule Engine" layer.
 *
 * Deliberately narrow in what it's allowed to decide: it can ONLY produce
 * info_required, never compliant or non_compliant. A clause's keywords
 * appearing somewhere in the product's structured capabilities or
 * description proves the topic was *mentioned*, not that the regulation's
 * actual requirement is *met* — "we have a cooling-off period" doesn't
 * confirm it's 3 days with no penalty, the exact terms DLG requires. That
 * judgment call needs real reasoning against the clause text, which only
 * the AI inference layer does responsibly.
 *
 * What IS safe to decide by rule: total absence. If nothing anywhere even
 * touches a clause's topic, "insufficient information to classify" is a
 * mechanical fact, not a judgment call — there's nothing to misjudge. That
 * clause is excluded from what's sent to the AI inference layer entirely,
 * shrinking the prompt (and cost) for products with a small structured
 * footprint, while never risking a false compliant/non-compliant claim.
 *
 * Every clause CorpusClause.keywords covers is a candidate for this; a
 * clause with no keywords defined always goes to full AI review by design.
 */

export type RuleEngineFinding = {
  area_code: string
  area_name: string
  title: string
  classification: 'info_required'
  what_found: string
  why_matters: string
  severity: 'medium'
  confidence: 'low'
  confidence_reasoning: string
  driver_clarity: 'high'
  driver_understanding: 'low'
  evidence_found: string[]
  evidence_missing: string[]
  inference_made: string
  impacts: { lens: 'product'; description: string }[]
  citations: { corpus_clause_id: string; clause_ref: string; clause_text: string; source_title: string }[]
  recommendations: string[]
}

function buildSearchableText(structuredInfo: StructuredProductInfo, elements: ProductElement[], description: string): string {
  return [
    ...structuredInfo.capabilities,
    ...structuredInfo.categories,
    ...elements.map(e => e.label),
    description,
  ].join(' ').toLowerCase()
}

function clauseHasSignal(clause: CorpusClause, searchableText: string): boolean {
  if (clause.keywords.length === 0) return true // no keywords defined — always defer to AI
  return clause.keywords.some(kw => searchableText.includes(kw.toLowerCase()))
}

function areaName(areaCode: string): string {
  return areaCode === 'DLG' ? 'Digital Lending Guidelines' : areaCode === 'KYC_AML' ? 'KYC / AML' : areaCode
}

function buildRuleFinding(clause: CorpusClause): RuleEngineFinding {
  return {
    area_code: clause.area_code,
    area_name: areaName(clause.area_code),
    title: `${clause.clause_ref} — insufficient information to classify`,
    classification: 'info_required',
    what_found: `Nothing in the structured product information or description addresses this obligation — there's no evidence to test it against either way.`,
    why_matters: `${clause.text.slice(0, 140)}${clause.text.length > 140 ? '…' : ''} — this clause still needs to be confirmed before launch, even though nothing today speaks to it.`,
    severity: 'medium',
    confidence: 'low',
    confidence_reasoning: 'Determined by rule, not AI reasoning: no structured capability, category, inferred element, or free-text description mentions this topic at all, so there is genuinely nothing to evaluate.',
    driver_clarity: 'high',
    driver_understanding: 'low',
    evidence_found: [],
    evidence_missing: [`Any mention of ${clause.clause_ref}'s subject matter in the product description or capabilities`],
    inference_made: '',
    impacts: [
      { lens: 'product', description: 'Confirm directly whether this obligation is met before treating it as resolved — nothing currently rules it in or out.' },
    ],
    citations: [{
      corpus_clause_id: clause.id,
      clause_ref: clause.clause_ref,
      clause_text: clause.text,
      source_title: clause.source_title,
    }],
    recommendations: [`Confirm directly whether ${clause.clause_ref.toLowerCase()} is addressed before treating this as resolved.`],
  }
}

export function applyRuleEngine(
  clauses: CorpusClause[],
  structuredInfo: StructuredProductInfo,
  elements: ProductElement[],
  description: string
): { remainingClauses: CorpusClause[]; ruleFindings: RuleEngineFinding[] } {
  const searchableText = buildSearchableText(structuredInfo, elements, description)
  const remainingClauses: CorpusClause[] = []
  const ruleFindings: RuleEngineFinding[] = []

  for (const clause of clauses) {
    if (clauseHasSignal(clause, searchableText)) {
      remainingClauses.push(clause)
    } else {
      ruleFindings.push(buildRuleFinding(clause))
    }
  }

  return { remainingClauses, ruleFindings }
}
