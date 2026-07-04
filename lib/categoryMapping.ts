import type { ProductCategory } from '@/lib/types'

/**
 * Maps a product's declared categories to which regulatory areas are worth
 * testing at all, before any AI inference call happens. Previously every
 * product — a payments app, a neobank, a lending app — was tested against
 * the same fixed ['DLG', 'KYC_AML'] regardless of category, which wastes
 * tokens and risks confusing findings (a pure payments product doesn't
 * need to be tested against Digital Lending Guidelines disbursal rules; it
 * never disburses loans). This is retrieval filtering at the category
 * level, upstream of the per-clause filtering already done in lib/corpus.ts.
 *
 * Categories are now multi-select — a product can be both "Digital Lending"
 * and "Payments" at once — so retrieval is the union of every selected
 * category's areas, deduplicated. Selecting more categories can only ever
 * add area codes, never remove one a single category alone would have
 * included.
 *
 * Only DLG and KYC_AML have real corpus clauses today (see lib/corpus.ts) —
 * this mapping only ever selects a subset of those two, never invents a
 * new area code that has no clauses behind it. Adding a new regulatory
 * area later means: add real corpus clauses for it, then add its code to
 * the relevant category rows below — nothing else in the pipeline needs
 * to change. That's the whole point of keeping this as one small,
 * declarative table rather than scattering the logic across routes.
 */
export const CATEGORY_TO_AREA_CODES: Record<ProductCategory, string[]> = {
  'Digital Lending':     ['DLG', 'KYC_AML'],
  'BNPL':                ['DLG', 'KYC_AML'],
  'Lending Marketplace': ['DLG', 'KYC_AML'],
  'Invoice Financing':   ['DLG', 'KYC_AML'],
  'Merchant Financing':  ['DLG', 'KYC_AML'],
  'Payments':            ['KYC_AML'],
  'Neobank':             ['KYC_AML'],
  'Wealth Management':   ['KYC_AML'],
  'Investment Platform': ['KYC_AML'],
  'Insurance':           ['KYC_AML'],
  // Unknown category — conservative default, test everything rather than
  // silently skip a regulatory area that might actually apply.
  'Other':               ['DLG', 'KYC_AML'],
}

/** Union of area codes across every selected category, deduplicated. */
export function getAssessableAreaCodes(categories: ProductCategory[]): string[] {
  const codes = new Set<string>()
  for (const category of categories) {
    const areas = CATEGORY_TO_AREA_CODES[category] ?? ['DLG', 'KYC_AML']
    areas.forEach(code => codes.add(code))
  }
  // No categories selected at all shouldn't mean "test nothing" — fall
  // back to the conservative default, same as an unrecognized category.
  return codes.size > 0 ? Array.from(codes) : ['DLG', 'KYC_AML']
}
