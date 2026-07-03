import { createServerClient } from '@/lib/supabase/server'
import type {
  AssessmentRow,
  FindingRow,
  FindingImpactRow,
  FindingCitationRow,
  RecommendationRow,
  QuestionRow,
  Finding,
} from '@/lib/types'

// Discovery Impact — how much the adaptive questioning step actually
// resolved. questionsAsked/Answered come straight from the questions table;
// remainingAssumptions is the count of findings still classified
// info_required even after those answers were factored in, i.e. things
// discovery could not resolve because the product description and
// discovery answers together still don't cover them.
export type DiscoveryImpact = {
  questionsAsked:        number
  questionsAnswered:     number
  remainingAssumptions:  number
}

export type ReportData = {
  assessment:      AssessmentRow
  findings:        Finding[]
  discoveryImpact: DiscoveryImpact
}

export type ReportMapResult =
  | { ok: true;  report: ReportData }
  | { ok: false; reason: 'not_found' }

/**
 * Reads an assessment and its findings (with impacts, citations,
 * recommendations) from Postgres and assembles them into the in-memory
 * Finding[] shape from lib/types.ts.
 *
 * recommendations is reconstructed as plain string[] — this repo's current
 * Finding.recommendations type is string[], not a structured object, and
 * the recommendations table has no `status` column. Sorted by priority so
 * the most important recommendation is always first (GeneratingScreen and
 * the report both rely on recommendations[0] being the lead one).
 */
export async function buildReport(assessmentId: string): Promise<ReportMapResult> {
  const supabase = createServerClient()

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .maybeSingle()

  if (assessmentError || !assessment) {
    return { ok: false, reason: 'not_found' }
  }

  const [findingsRes, questionsRes] = await Promise.all([
    supabase.from('findings').select('*').eq('assessment_id', assessmentId).order('created_at', { ascending: true }),
    supabase.from('questions').select('*').eq('assessment_id', assessmentId),
  ])

  const findingRows = findingsRes.data
  const questionRows = (questionsRes.data ?? []) as QuestionRow[]
  const questionsAsked = questionRows.length
  const questionsAnswered = questionRows.filter(q => q.answer !== null).length

  if (findingsRes.error || !findingRows) {
    return {
      ok: true,
      report: {
        assessment: assessment as AssessmentRow,
        findings: [],
        discoveryImpact: { questionsAsked, questionsAnswered, remainingAssumptions: 0 },
      },
    }
  }

  const findingIds = (findingRows as FindingRow[]).map(f => f.id)

  let impactRows: FindingImpactRow[] = []
  let citationRows: FindingCitationRow[] = []
  let recommendationRows: RecommendationRow[] = []

  if (findingIds.length > 0) {
    const [impactsRes, citationsRes, recommendationsRes] = await Promise.all([
      supabase.from('finding_impacts').select('*').in('finding_id', findingIds),
      supabase.from('finding_citations').select('*').in('finding_id', findingIds),
      supabase.from('recommendations').select('*').in('finding_id', findingIds).order('priority', { ascending: true }),
    ])
    impactRows = (impactsRes.data ?? []) as FindingImpactRow[]
    citationRows = (citationsRes.data ?? []) as FindingCitationRow[]
    recommendationRows = (recommendationsRes.data ?? []) as RecommendationRow[]
  }

  const findings: Finding[] = (findingRows as FindingRow[]).map(row => ({
    id: row.id,
    assessment_id: row.assessment_id,
    area_code: row.area_code,
    area_name: row.area_name,
    title: row.title,
    classification: row.classification,
    what_found: row.what_found,
    why_matters: row.why_matters,
    severity: row.severity,
    confidence: row.confidence,
    confidence_reasoning: row.confidence_reasoning,
    driver_clarity: row.driver_clarity,
    driver_understanding: row.driver_understanding,
    evidence_found: row.evidence_found,
    evidence_missing: row.evidence_missing,
    inference_made: row.inference_made,
    impacts: impactRows
      .filter(i => i.finding_id === row.id)
      .map(i => ({ lens: i.lens, description: i.description })),
    citations: citationRows
      .filter(c => c.finding_id === row.id)
      .map(c => ({
        corpus_clause_id: c.corpus_clause_id,
        clause_ref: c.clause_ref,
        clause_text: c.clause_text,
        source_title: c.source_title,
        verified: c.verified,
      })),
    recommendations: recommendationRows
      .filter(r => r.finding_id === row.id)
      .map(r => r.text),
  }))

  const remainingAssumptions = findings.filter(f => f.classification === 'info_required').length

  return {
    ok: true,
    report: {
      assessment: assessment as AssessmentRow,
      findings,
      discoveryImpact: { questionsAsked, questionsAnswered, remainingAssumptions },
    },
  }
}
