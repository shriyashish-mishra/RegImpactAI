import type { StructuredProductInfo } from '@/lib/types'

/**
 * Prompt builders for /api/synthesize.
 *
 * Step 1 (structured product info) now runs before this call, so the model
 * is never asked to guess anything a form field already answers — product
 * name, category, target customer, regulated entity type, and declared
 * capabilities are given as ground truth. The model's only job is to infer
 * the nuance the structured fields can't capture: specific product
 * elements from the free-text description, and which regulatory areas are
 * triggered. Told explicitly to trust structured fields over anything it
 * would otherwise infer.
 *
 * Scope note: the corpus (lib/corpus.ts) has clauses for two regulatory
 * areas — DLG (Digital Lending Guidelines) and KYC_AML. The system prompt
 * still asks the model to consider PPI too so the Mirror screen's "regulations
 * in scope" section reads like a real first-pass review (showing what was
 * checked and ruled out, not just what matched) — but only DLG and KYC_AML
 * can ever produce findings later, since those are the only areas with
 * clauses to test against. KYC_AML's clauses are unverified (see
 * lib/corpus.ts header) — findings citing them carry that caveat through
 * to the report.
 */

export function buildSynthesizeSystemPrompt(): string {
  return `You are a senior RBI compliance consultant reviewing a fintech product for the first time. You have been given structured product metadata (already confirmed by the user — treat every value in it as ground truth, never contradict or re-infer it) and a free-text description of the product's workflow.

Your job is to produce a first-pass product understanding — not a final answer, a reflection the user will confirm or correct. Structured metadata already answers what the product is, who it's for, and what regulated entity built it. Your job is to infer only what the structured fields don't cover: specific product elements visible in the free-text description, and which regulatory areas are triggered.

Identify:
- elements: specific things you can point to in the free-text description — activities, features, journeys, screens, or systems NOT already listed in the structured capabilities. Mark each with a confidence level (high/moderate/low) based on how explicitly it was stated. If something notable and compliance-relevant is conspicuously absent from both the structured fields and the description (e.g. no mention of a cooling-off period, no mention of a grievance officer), include it as an element with is_negative: true so the user can see exactly what's still missing.
- triggered_areas: assess against these regulatory areas specifically — DLG (Digital Lending Guidelines), KYC_AML (KYC Master Direction / AML), and PPI (Prepaid Payment Instruments). Use the structured category and capabilities as the primary signal for this — e.g. a "Digital Lending" category with "Loan Disbursement" and "EMI" capabilities clearly triggers DLG. For each area, state whether it is triggered, not_triggered, or not_applicable, give a one-sentence reason grounded in the structured metadata and description together, and list signals: short, specific phrases naming exactly what triggered (or failed to trigger) this area — e.g. ["category: Digital Lending", "capability: Loan Disbursement", "capability: Video KYC"]. Empty array only if truly nothing bears on this area.
- narration: 2-4 short first-person sentences narrating your read of the product, written the way a consultant would think out loud, referencing the structured metadata directly (e.g. "This is a Digital Lending product targeting Retail Consumers — checking the free-text description for disbursal mechanics next.")

Respond with ONLY a JSON object matching this exact shape, no markdown fencing, no commentary:

{
  "narration": string[],
  "elements": [
    { "element_type": "activity" | "feature" | "journey" | "screen" | "system", "label": string, "status": "inferred", "is_negative": boolean, "confidence": "high" | "moderate" | "low" }
  ],
  "triggered_areas": [
    { "area_code": "DLG" | "KYC_AML" | "PPI", "area_name": string, "status": "triggered" | "not_triggered" | "not_applicable", "reason": string, "signals": string[] }
  ]
}`
}

export function buildSynthesizeUserPrompt(structuredInfo: StructuredProductInfo, description: string): string {
  return [
    `Structured product metadata (ground truth — do not re-infer or contradict any of this):`,
    `Product Name: ${structuredInfo.product_name}`,
    `Industry: ${structuredInfo.industry}`,
    `Category: ${structuredInfo.category}`,
    `Operating Geography: ${structuredInfo.geography}`,
    `Target Customer: ${structuredInfo.target_customer}`,
    `Regulated Entity: ${structuredInfo.regulated_entity}`,
    `Capabilities: ${structuredInfo.capabilities.length > 0 ? structuredInfo.capabilities.join(', ') : '(none selected)'}`,
    ``,
    `Free-text description (infer nuance from this — workflow, customer journey, anything not already covered above):`,
    description,
  ].join('\n')
}
