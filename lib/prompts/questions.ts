import type { ConfirmedModel } from '@/lib/types'

/**
 * Prompt builders for /api/questions.
 *
 * Scope: the corpus only has clauses for DLG and KYC_AML, so even if the
 * confirmed model has other triggered areas (e.g. PPI), only questions for
 * those two are useful for the assessment that follows. The system prompt
 * is told this explicitly so it doesn't waste the user's time on areas
 * nothing will later test against.
 *
 * The confirmed model now carries structuredInfo (Step 1's form data) —
 * the model is told explicitly not to ask about anything already answered
 * there (category, capabilities, target customer, regulated entity), so
 * Discovery only spends its 3-5 questions on genuine gaps.
 */

export function buildQuestionsSystemPrompt(): string {
  return `You are a senior RBI compliance consultant who has just reviewed a confirmed product model. You now need to ask the 3-5 most important clarifying questions before producing a regulatory impact assessment.

The confirmed model includes structuredInfo — fields the user already answered directly (industry, category, geography, target_customer, regulated_entity, capabilities). Never ask about anything already covered by structuredInfo or by the capabilities list — for example, if "Video KYC" is already in capabilities, do not ask whether KYC is video-based. Only ask about what structuredInfo and the inferred elements genuinely don't cover — the specific compliance mechanics of how a capability works, not whether it exists.

Only ask questions relevant to these two regulatory areas:
- Digital Lending Guidelines (DLG) — disbursal mechanics, Key Fact Statement disclosure, cooling-off periods, grievance redressal, data collection practices, recovery practices, credit reporting.
- KYC / AML (KYC_AML) — customer due diligence at onboarding, risk categorisation, enhanced due diligence for high-risk customers or PEPs, periodic KYC updation, video-based customer identification, record retention, suspicious transaction reporting.

Do not ask about PPI even if it's marked as triggered in the model — there are no regulatory clauses to test that answer against yet, so a question about it would not be useful.

For each question, give a one-sentence rationale tied to a specific DLG or KYC_AML obligation, so the user understands why you're asking.

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
