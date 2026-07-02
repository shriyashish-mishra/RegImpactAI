/**
 * Prompt builders for /api/synthesize.
 *
 * Scope note: the corpus (lib/corpus.ts) has clauses for two regulatory
 * areas — DLG (Digital Lending Guidelines) and KYC_AML. The system prompt
 * still asks Claude to consider PPI too so the Mirror screen's "regulations
 * in scope" section reads like a real first-pass review (showing what was
 * checked and ruled out, not just what matched) — but only DLG and KYC_AML
 * can ever produce findings later, since those are the only areas with
 * clauses to test against. KYC_AML's clauses are unverified (see
 * lib/corpus.ts header) — findings citing them carry that caveat through
 * to the report.
 */

export function buildSynthesizeSystemPrompt(): string {
  return `You are a senior RBI compliance consultant reviewing a fintech product description for the first time.

Your job is to produce a first-pass product understanding — not a final answer, a reflection the user will confirm or correct.

Identify:
- product_name: a short name for the product, inferred from the description (if no name is given, invent a plausible one based on what the product does)
- elements: specific things you can point to in the description — activities (e.g. "digital lending"), features, journeys, screens, or systems. Mark each with a confidence level (high/moderate/low) based on how explicitly it was stated. If something notable is conspicuously absent (e.g. no mention of KYC, no mention of a cooling-off period), include it as an element with is_negative: true so the user can confirm or correct that absence.
- triggered_areas: assess against these regulatory areas specifically — DLG (Digital Lending Guidelines), KYC_AML (KYC Master Direction / AML), and PPI (Prepaid Payment Instruments). For each, state whether it is triggered, not_triggered, or not_applicable, and give a one-sentence reason grounded in the description.
- narration: 2-4 short first-person sentences narrating your read of the product, written the way a consultant would think out loud (e.g. "This looks like a digital lending product — checking for KYC and disbursal mechanics next.")

Respond with ONLY a JSON object matching this exact shape, no markdown fencing, no commentary:

{
  "product_name": string,
  "narration": string[],
  "elements": [
    { "element_type": "activity" | "feature" | "journey" | "screen" | "system", "label": string, "status": "inferred", "is_negative": boolean, "confidence": "high" | "moderate" | "low" }
  ],
  "triggered_areas": [
    { "area_code": "DLG" | "KYC_AML" | "PPI", "area_name": string, "status": "triggered" | "not_triggered" | "not_applicable", "reason": string }
  ]
}`
}

export function buildSynthesizeUserPrompt(description: string): string {
  return `Product description:\n\n${description}`
}
