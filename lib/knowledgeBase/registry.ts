import type { RegulatoryArea, RegulatoryDocument } from '@/lib/types'

/**
 * The Regulatory Knowledge Base — a registry of regulatory areas and the
 * documents within them. Lives in code, not Postgres, same rationale as
 * lib/corpus.ts: at this scale (2 areas, 2 documents), a curated array is
 * simpler and more auditable than a CMS or admin CRUD layer would be. What
 * changed from the old model isn't WHERE this lives, it's its SHAPE — an
 * area can now hold multiple documents (a guideline, its circulars,
 * amendments, FAQs), and each document carries real lifecycle metadata
 * (version, status, supersession) instead of being treated as a single
 * static file.
 *
 * Adding a new document (a circular, an amendment) means adding one entry
 * here and tagging the relevant corpus clauses with its id — nothing about
 * retrieval, the rule engine, or the assessment pipeline needs to change.
 * Adding a whole new authority (SEBI, IRDAI, NPCI, DPDP) means adding a new
 * RegulatoryArea with that authority and, eventually, documents under it —
 * the type is a plain string, not a closed enum, specifically so this
 * never requires a code change to the type system itself.
 */

export const REGULATORY_AREAS: RegulatoryArea[] = [
  { code: 'DLG',                 name: 'Digital Lending',    authority: 'Reserve Bank of India', status: 'active' },
  { code: 'KYC_AML',             name: 'KYC / AML',          authority: 'Reserve Bank of India', status: 'active' },
  { code: 'PPI',                 name: 'PPI',                 authority: 'Reserve Bank of India', status: 'coming_soon' },
  { code: 'PAYMENT_AGGREGATOR',  name: 'Payment Aggregator', authority: 'Reserve Bank of India', status: 'coming_soon' },
  { code: 'ACCOUNT_AGGREGATOR',  name: 'Account Aggregator', authority: 'Reserve Bank of India', status: 'coming_soon' },
  { code: 'NBFC',                name: 'NBFC',                authority: 'Reserve Bank of India', status: 'coming_soon' },
  { code: 'UPI',                 name: 'UPI',                 authority: 'Reserve Bank of India', status: 'coming_soon' },
]

// Only the two real, corpus-backed documents exist here today — no
// placeholder circulars/amendments/FAQs invented for the "coming soon"
// areas or for DLG/KYC_AML themselves. Adding a real one later is additive:
// a new RegulatoryDocument entry, a supersedes/superseded_by link if it
// replaces something, and new corpus clauses tagged with its id.
export const REGULATORY_DOCUMENTS: RegulatoryDocument[] = [
  {
    id:               'doc-dlg-2022',
    title:            'Digital Lending Guidelines',
    authority:        'Reserve Bank of India',
    area_code:        'DLG',
    document_type:    'guideline',
    publication_date: 'September 2022', // month-level precision only — that's what's actually verified, not a specific day
    effective_date:   'September 2022',
    version:           1,
    status:           'active',
    jurisdiction:     'India',
    source:           'RBI Digital Lending Guidelines, September 2022',
    last_reviewed:    null, // no dated re-review pass has happened yet — not fabricating one
    supersedes:       null,
    superseded_by:    null,
    verified:         true,
    description:      'RBI\'s guidelines on digital lending — disbursal, fees, cooling-off periods, grievance redressal, and recovery practices. Verbatim excerpts transcribed from source.',
  },
  {
    id:               'doc-kyc-md-2016',
    title:            'Know Your Customer (KYC) Direction',
    authority:        'Reserve Bank of India',
    area_code:        'KYC_AML',
    document_type:    'master_direction',
    publication_date: '2016 (as amended)',
    effective_date:   '2016 (as amended)',
    version:           1,
    status:           'active',
    jurisdiction:     'India',
    source:           'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended)',
    last_reviewed:    null,
    supersedes:       null,
    superseded_by:    null,
    // Unverified: reconstructed from general knowledge, not transcribed
    // from the current source text — see lib/corpus.ts's file header. This
    // flag is the whole reason the KYC/AML area exists in this registry as
    // "active" (it does have real, usable corpus content) while still
    // carrying an honest caveat all the way through to every citation.
    verified:         false,
    description:      'RBI\'s customer due diligence, risk categorisation, and AML/CFT obligations for regulated entities. Reconstructed from general knowledge — not verified against the current source text.',
  },
]

/** Documents eligible for assessment — only 'active' status participates by default. */
export function getActiveDocuments(areaCode: string): RegulatoryDocument[] {
  return REGULATORY_DOCUMENTS.filter(d => d.area_code === areaCode && d.status === 'active')
}

export function getDocumentById(id: string): RegulatoryDocument | undefined {
  return REGULATORY_DOCUMENTS.find(d => d.id === id)
}

export function getAreaByCode(code: string): RegulatoryArea | undefined {
  return REGULATORY_AREAS.find(a => a.code === code)
}
