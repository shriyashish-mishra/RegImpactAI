import type { CorpusClause } from '@/lib/types'

/**
 * The skeleton's regulatory corpus — 12 curated Digital Lending Guidelines clauses.
 * IDs are stable UUIDs used as primary keys when seeding corpus_clauses in Postgres.
 * Replaced by pgvector + full corpus in the real MVP.
 *
 * Source: RBI Digital Lending Guidelines, September 2022.
 * These are verbatim excerpts — accuracy matters because they appear as citations.
 */
export const CORPUS_CLAUSES: CorpusClause[] = [
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000001',
    area_code:    'DLG',
    clause_ref:   'DLG Para 5 (i)',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'All loan disbursals and repayments shall be executed directly in the bank account of the borrower, without any pass-through or pool account of the Lending Service Provider (LSP) or any third party.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000002',
    area_code:    'DLG',
    clause_ref:   'DLG Para 5 (ii)',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'Any fees, charges, etc., payable to LSPs in the credit intermediation process shall be paid directly by RE (Regulated Entity) and shall not be charged to the borrower directly by LSPs.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000003',
    area_code:    'DLG',
    clause_ref:   'DLG Para 6 — Key Fact Statement',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'REs shall provide a Key Fact Statement (KFS) to the borrower before the execution of the loan contract. The KFS shall include the Annual Percentage Rate (APR), all-in cost including fees and charges, and the grievance redressal mechanism.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000004',
    area_code:    'DLG',
    clause_ref:   'DLG Para 6 — Cooling-off Period',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'The borrower shall be given an explicit option to exit the digital loan by paying back the principal and the proportionate APR without any penalty during a cooling-off / look-up period. The minimum cooling-off period shall be three days for loans with tenure of seven days or more.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000005',
    area_code:    'DLG',
    clause_ref:   'DLG Para 7 — Data Collection',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'REs and LSPs shall not store personal information of the borrower except for limited data (name, address, contact details, etc.) that may be required to carry out their operations, subject to need-based access with the explicit consent of the borrower.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000006',
    area_code:    'DLG',
    clause_ref:   'DLG Para 7 — Device Access',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'Blanket permission to access mobile phone resources including files and media, contact lists, call logs, telephony functions, etc., shall not be taken at the time of onboarding / app installation. Such access shall be based on need and purpose for each permission.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000007',
    area_code:    'DLG',
    clause_ref:   'DLG Para 8 — Grievance Redressal',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'Each RE shall designate a nodal grievance redressal officer to deal with FinTech / digital lending related complaints. The contact details of the grievance redressal officer shall be prominently displayed on the website of the RE, LSP apps, and related portals.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000008',
    area_code:    'DLG',
    clause_ref:   'DLG Para 8 — Complaint Escalation',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'If a complaint lodged by a borrower is not resolved by the RE within 30 days, the borrower can escalate the same to the Integrated Ombudsman Scheme of RBI.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000009',
    area_code:    'DLG',
    clause_ref:   'DLG Para 9 — Recovery Guidelines',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'Recovery agents appointed by REs and LSPs shall strictly adhere to the RBI guidelines on recovery. All recovery actions shall be time-bound, and interaction with borrowers shall only be during permissible hours.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000010',
    area_code:    'DLG',
    clause_ref:   'DLG Para 10 — Credit Reporting',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'REs shall report digital lending data to Credit Information Companies (CICs) irrespective of the nature of the product or its tenor. Short-term digital credit products shall also be reported to CICs.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000011',
    area_code:    'DLG',
    clause_ref:   'DLG Para 4 — LSP Obligations',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'The RE shall ensure that the LSP engaged by it shall not use the RE brand in a manner that could mislead the borrowers. All communications to the borrower in relation to digital lending shall clearly identify the RE.',
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000012',
    area_code:    'DLG',
    clause_ref:   'DLG Para 5 (iii) — Automatic Credit Limit Increase',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    text: 'Automatic increase in credit limit without explicit consent of the borrower shall not be permitted. The borrower shall be required to give fresh and explicit consent for every credit limit increase.',
  },
]

/**
 * Returns clauses for a given regulatory area.
 * The skeleton's only "retrieval" — a simple filter.
 * Replaced by pgvector hybrid retrieval in the real MVP.
 */
export function getClausesByAreaCode(areaCode: string): CorpusClause[] {
  return CORPUS_CLAUSES.filter(c => c.area_code === areaCode)
}

/**
 * Returns a single clause by its UUID.
 * Used by the generate route to attach citations.
 */
export function getClauseById(id: string): CorpusClause | undefined {
  return CORPUS_CLAUSES.find(c => c.id === id)
}
