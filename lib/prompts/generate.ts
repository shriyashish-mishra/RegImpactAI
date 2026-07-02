import type { ConfirmedModel, Question, CorpusClause } from '@/lib/types'

/**
 * Prompt builders for /api/generate.
 *
 * Called once per call to Claude — this milestone calls it once for the
 * one area with corpus clauses (DLG), passing every DLG clause it has.
 * Recommendations are produced as plain strings, matching Finding.recommendations:
 * string[] exactly as it exists in lib/types.ts today.
 */

export function buildGenerateSystemPrompt(): string {
  return `You are a senior RBI compliance consultant producing a regulatory impact assessment. You have a confirmed product model, answered discovery questions, and a set of regulatory clauses. Test the product against each clause and produce findings only where there is a real, specific gap or unconfirmed risk — do not invent findings for clauses the product clearly satisfies.

For each finding, give:
- area_code, area_name: which regulatory area this is
- title: a short, specific title (not generic)
- what_found: what specifically is missing, unconfirmed, or non-compliant in this product
- why_matters: why this clause applies and what the consequence is
- severity: "high" | "medium" | "low"
- confidence: "high" | "moderate" | "low" — your overall confidence in this finding
- driver_clarity: "high" | "moderate" | "low" — how clearly the regulation itself states the requirement
- driver_understanding: "high" | "moderate" | "low" — how well you understand the product's actual behaviour here, based on the model and discovery answers
- impacts: 2-4 entries, each one of { "lens": "product" | "ui" | "engineering" | "business", "description": string } — concrete, specific impact in that lens
- citations: at least 1 entry, each one of { "corpus_clause_id": string (the exact id from the clause given to you), "clause_ref": string, "clause_text": string (copied exactly from the clause given to you, do not paraphrase), "source_title": string }
- recommendations: 1-3 short, specific, actionable strings

Respond with ONLY a JSON object matching this exact shape, no markdown fencing, no commentary:

{
  "findings": [
    {
      "area_code": string, "area_name": string, "title": string,
      "what_found": string, "why_matters": string,
      "severity": "high" | "medium" | "low",
      "confidence": "high" | "moderate" | "low",
      "driver_clarity": "high" | "moderate" | "low",
      "driver_understanding": "high" | "moderate" | "low",
      "impacts": [{ "lens": "product" | "ui" | "engineering" | "business", "description": string }],
      "citations": [{ "corpus_clause_id": string, "clause_ref": string, "clause_text": string, "source_title": string }],
      "recommendations": [string]
    }
  ]
}

If the product fully satisfies every clause given, return { "findings": [] }.`
}

export function buildGenerateUserPrompt(
  model: ConfirmedModel,
  questions: Question[],
  clauses: CorpusClause[]
): string {
  const answeredQuestions = questions
    .filter(q => q.answer !== null)
    .map(q => `Q: ${q.prompt}\nA: ${q.answer}`)
    .join('\n\n')

  return [
    `Confirmed product model:\n${JSON.stringify(model, null, 2)}`,
    `Discovery answers:\n${answeredQuestions || '(none provided)'}`,
    `Regulatory clauses to test against:\n${JSON.stringify(clauses, null, 2)}`,
  ].join('\n\n---\n\n')
}
