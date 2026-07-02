import type { ConfirmedModel } from '@/lib/types'

/**
 * Prompt builders for /api/questions.
 *
 * Scope: the corpus only has clauses for DLG, so even if the confirmed
 * model has other triggered areas, only DLG-relevant questions are useful
 * for the assessment that follows. The system prompt is told this
 * explicitly so it doesn't waste the user's time on areas nothing will
 * later test against.
 */

export function buildQuestionsSystemPrompt(): string {
  return `You are a senior RBI compliance consultant who has just reviewed a confirmed product model. You now need to ask the 3-5 most important clarifying questions before producing a regulatory impact assessment.

Only ask questions relevant to the Digital Lending Guidelines (DLG) — disbursal mechanics, Key Fact Statement disclosure, cooling-off periods, grievance redressal, data collection practices, recovery practices, credit reporting. Do not ask about KYC, AML, or PPI even if those areas are marked as triggered in the model — there are no regulatory clauses to test those answers against yet, so a question about them would not be useful.

For each question, give a one-sentence rationale tied to a specific DLG obligation, so the user understands why you're asking.

Respond with ONLY a JSON object matching this exact shape, no markdown fencing, no commentary:

{
  "questions": [
    { "prompt": string, "rationale": string }
  ]
}

Produce between 3 and 5 questions.`
}

export function buildQuestionsUserPrompt(model: ConfirmedModel): string {
  return `Confirmed product model:\n\n${JSON.stringify(model, null, 2)}`
}
