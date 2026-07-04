import type { StructuredProductInfo } from '@/lib/types'

/**
 * Prompt builders for /api/synthesize.
 *
 * Step 1 (structured product info) now runs before this call, so the model
 * is never asked to guess anything a form field already answers — product
 * name, categories, target customers, regulated entities, and declared
 * capabilities are given as ground truth, all multi-select since a real
 * product can span more than one of each. The model's only job is to infer
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

Your job is to produce a first-pass product understanding — not a final answer, a reflection the user will confirm or correct. Structured metadata already answers what the product is, who it's for, and which regulated entities it works with — several of these fields may have multiple values, since a real product can span more than one category, customer segment, geography, or regulated-entity relationship at once. Your job is to infer only what the structured fields don't cover: specific product elements visible in the free-text description, and which regulatory areas are triggered.

Identify:
- elements: specific things you can point to in the free-text description — activities, features, journeys, screens, or systems NOT already listed in the structured capabilities. Mark each with a confidence level (high/moderate/low) based on how explicitly it was stated. If something notable and compliance-relevant is conspicuously absent from both the structured fields and the description (e.g. no mention of a cooling-off period, no mention of a grievance officer), include it as an element with is_negative: true so the user can see exactly what's still missing.
- triggered_areas: assess against these regulatory areas specifically — DLG (Digital Lending Guidelines), KYC_AML (KYC Master Direction / AML), and PPI (Prepaid Payment Instruments). Use the structured product categories and capabilities as the primary signal — e.g. a product with "Digital Lending" among its categories and "Loan Disbursement"/"EMI" among its capabilities clearly triggers DLG, even if it's also categorized as "Payments" for an unrelated reason. For each area, state whether it is triggered, not_triggered, or not_applicable, give a one-sentence reason grounded in the structured metadata and description together, and list signals: short, specific phrases naming exactly what triggered (or failed to trigger) this area — e.g. ["category: Digital Lending", "capability: Loan Disbursement", "capability: Video KYC"]. Empty array only if truly nothing bears on this area.
- narration: 2-4 short first-person sentences narrating your read of the product, written the way a consultant would think out loud, referencing the structured metadata directly (e.g. "This spans Digital Lending and Payments, targeting Retail Consumers and SMEs — checking the free-text description for disbursal mechanics next.")

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

function listOrNone(values: string[]): string {
  return values.length > 0 ? values.map(v => `- ${v}`).join('\n') : '(none selected)'
}

export function buildSynthesizeUserPrompt(structuredInfo: StructuredProductInfo, description: string): string {
  return [
    `Structured product metadata (ground truth — do not re-infer or contradict any of this; fields below with multiple values all apply simultaneously, not exclusively):`,
    ``,
    `Product Name`,
    structuredInfo.product_name,
    ``,
    `Industry`,
    structuredInfo.industry,
    ``,
    `Product Categories`,
    listOrNone(structuredInfo.categories),
    ``,
    `Operating Geographies`,
    listOrNone(structuredInfo.geographies),
    ``,
    `Target Customers`,
    listOrNone(structuredInfo.target_customers),
    ``,
    `Regulated Entities`,
    listOrNone(structuredInfo.regulated_entities),
    ``,
    `Capabilities`,
    listOrNone(structuredInfo.capabilities),
    ``,
    `Description`,
    `(free-text — infer nuance from this: workflow, customer journey, anything not already covered above)`,
    description,
  ].join('\n')
}
