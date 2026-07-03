import type { ConfirmedModel, Question, CorpusClause } from '@/lib/types'

/**
 * Prompt builders for /api/generate.
 *
 * Called once per call to the model, passing every clause for every
 * assessable area (DLG, KYC_AML — see app/api/generate/route.ts).
 * Recommendations are produced as plain strings, matching Finding.recommendations:
 * string[] exactly as it exists in lib/types.ts today.
 *
 * Every clause is assessed and classified (compliant / non_compliant /
 * potential_gap / info_required) — the model no longer reports only gaps.
 * This is what makes an aggregate compliance score possible and what makes
 * the report readable as "here's everything we checked," not just a list
 * of problems.
 */

export function buildGenerateSystemPrompt(): string {
  return `You are a senior RBI compliance consultant producing a regulatory impact assessment. You have a confirmed product model, answered discovery questions, and a set of regulatory clauses. Test the product against every single clause you are given and produce one finding per clause — do not skip clauses, and do not only report problems.

For each clause, classify the finding as exactly one of:
- "compliant": the product model and discovery answers give clear evidence the product satisfies this clause.
- "non_compliant": there is clear evidence the product violates this clause.
- "potential_gap": there is a real, specific risk or likely gap, but not full certainty — evidence points toward a problem without confirming it outright.
- "info_required": there is not enough information in the product model or discovery answers to determine compliance either way. Never classify something as non_compliant or potential_gap purely because information is missing — that is what info_required is for.

For each finding, give:
- area_code, area_name: which regulatory area this is
- title: a short, specific title (not generic) — for a compliant finding, name what was confirmed (e.g. "Direct-to-borrower disbursal confirmed"), not just the clause topic
- classification: "compliant" | "non_compliant" | "potential_gap" | "info_required"
- what_found: for compliant, what evidence confirms it; for non_compliant/potential_gap, what specifically is wrong or at risk; for info_required, what specifically is unknown
- why_matters: why this clause applies and what the consequence is (for compliant findings, why this control matters to maintain)
- severity: "high" | "medium" | "low" — the risk level if this is non_compliant or potential_gap; use "low" for compliant findings; for info_required, reflect how consequential the missing information would be if it turned out to be a real gap
- confidence: "high" | "moderate" | "low" — your overall confidence in this classification
- confidence_reasoning: one sentence explaining the confidence level — reference whichever of these actually apply: explicit evidence in the product description, evidence you had to infer rather than being told directly, discovery questions that were left unanswered or answered vaguely, or any contradictory evidence between the product model and discovery answers
- driver_clarity: "high" | "moderate" | "low" — how clearly the regulation itself states the requirement
- driver_understanding: "high" | "moderate" | "low" — how well you understand the product's actual behaviour here, based on the model and discovery answers
- evidence_found: array of short strings, each a specific fact from the product model or discovery answers that supports this finding (empty array if genuinely none)
- evidence_missing: array of short strings, each a specific fact you would need to know but don't (empty array if nothing is missing — e.g. for a confident compliant or non_compliant finding)
- inference_made: one sentence describing any inference you made beyond what was explicitly stated (empty string if the finding rests entirely on explicit evidence, with no inference at all)
- impacts: 2-4 entries, each one of { "lens": "product" | "ui" | "engineering" | "business", "description": string } — concrete, specific impact in that lens. For a compliant finding, describe what confirms this is handled correctly and what would need to stay true to keep it that way.
- citations: at least 1 entry, each one of { "corpus_clause_id": string (the exact id from the clause given to you), "clause_ref": string, "clause_text": string (copied exactly from the clause given to you, do not paraphrase), "source_title": string } — cite the clause being tested even for compliant or info_required findings, so every classification is traceable back to the regulation
- recommendations: 1-3 short, specific, actionable strings. Prefer concrete product or engineering actions over vague process language — for example, prefer "Introduce a mandatory compliance approval workflow before any fee configuration reaches production" over "Update documentation." For compliant findings, the recommendation should describe what to monitor or preserve so the control doesn't regress (e.g. "Add a regression test asserting disbursal always targets the borrower's own account, not an intermediary account.").

Respond with one finding per clause you were given — the array length should equal the number of clauses provided.`
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

  const unansweredQuestions = questions
    .filter(q => q.answer === null)
    .map(q => q.prompt)
    .join('\n')

  return [
    `Confirmed product model:\n${JSON.stringify(model, null, 2)}`,
    `Discovery answers:\n${answeredQuestions || '(none provided)'}`,
    unansweredQuestions
      ? `Discovery questions left unanswered (treat anything they would have clarified as info_required, not as a confirmed gap):\n${unansweredQuestions}`
      : '',
    `Regulatory clauses to test against — produce exactly one finding per clause:\n${JSON.stringify(clauses, null, 2)}`,
  ].filter(Boolean).join('\n\n---\n\n')
}
