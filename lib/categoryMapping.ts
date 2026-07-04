import type { ProductCategory } from '@/lib/types'

/**
 * Maps a product's declared category to which regulatory areas are worth
 * testing at all, before any Gemini call happens. Previously every product
 * — a wallet, a neobank, a lending app — was tested against the same fixed
 * ['DLG', 'KYC_AML'] regardless of category, which wastes tokens and risks
 * confusing findings (a pure payments wallet doesn't need to be tested
 * against Digital Lending Guidelines disbursal rules; it never disburses
 * loans). This is retrieval filtering at the category level, upstream of
 * the per-clause filtering already done in lib/corpus.ts.
 *
 * Only DLG and KYC_AML have real corpus clauses today (see lib/corpus.ts) —
 * this mapping only ever selects a subset of those two, never invents a
 * new area code that has no clauses behind it. Adding a new regulatory
 * area later (PPI, UPI-specific rules, etc.) means: add real corpus clauses
 * for it, then add its code to the relevant category rows below — nothing
 * else in the pipeline needs to change.
 */
export const CATEGORY_TO_AREA_CODES: Record<ProductCategory, string[]> = {
  'Digital Lending':     ['DLG', 'KYC_AML'],
  'BNPL':                ['DLG', 'KYC_AML'],
  'Lending Marketplace': ['DLG', 'KYC_AML'],
  'Invoice Financing':   ['DLG', 'KYC_AML'],
  'Payments':            ['KYC_AML'],
  'Wallet':              ['KYC_AML'],
  'Neobank':             ['KYC_AML'],
  'Wealth Management':   ['KYC_AML'],
  'Investment Platform': ['KYC_AML'],
  'Insurance':           ['KYC_AML'],
  // Unknown category — conservative default, test everything rather than
  // silently skip a regulatory area that might actually apply.
  'Other':               ['DLG', 'KYC_AML'],
}

export function getAssessableAreaCodes(category: ProductCategory): string[] {
  return CATEGORY_TO_AREA_CODES[category] ?? ['DLG', 'KYC_AML']
}
