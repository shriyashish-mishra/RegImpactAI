import type { StructuredProductInfo, ProductElement } from '@/lib/types'

/**
 * Assessment Readiness — a heuristic, not an AI judgment. It measures
 * whether enough information exists for a high-confidence assessment,
 * computed deterministically from what Step 1 captured and what the model
 * flagged as conspicuously absent (ProductElement.is_negative) — never
 * asked of Gemini itself, so it can't be gamed by confident-sounding but
 * unsubstantiated model output.
 *
 * Starts at 100 and subtracts for concrete gaps rather than starting low
 * and adding up — a completed Step 1 form is the expected case, not an
 * achievement to reward.
 */
export function computeReadinessScore(
  structuredInfo: StructuredProductInfo,
  elements: ProductElement[]
): number {
  let score = 100

  // Every inferred-negative element is something the model looked for and
  // couldn't confirm — each one is a real gap in what's known, not a strike
  // against the product itself.
  const missingCount = elements.filter(e => e.is_negative).length
  score -= Math.min(40, missingCount * 8)

  // Fewer than 2 declared capabilities means Discovery and Assess have very
  // little to work with beyond the free-text description.
  if (structuredInfo.capabilities.length === 0) score -= 15
  else if (structuredInfo.capabilities.length < 2) score -= 8

  return Math.max(30, Math.min(100, Math.round(score)))
}
