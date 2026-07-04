import type { CorpusClause } from '@/lib/types'

/**
 * The regulatory corpus this app tests products against — lives in code, not
 * Postgres, by design (see supabase/migrations/README.md: there is no
 * corpus_clauses table). IDs are stable UUIDs so a finding's citation can
 * join back to the exact clause it came from. At 19 clauses total, a flat
 * filter is the retrieval step (see getClausesByAreaCode below) — see
 * /architecture for why that's a deliberate choice at this scale, not a
 * placeholder awaiting a vector database.
 *
 * DLG clauses (verified: true): RBI Digital Lending Guidelines, September 2022.
 * Verbatim excerpts — accuracy matters because they appear as citations.
 *
 * KYC_AML clauses (verified: false): reconstructed from general knowledge of
 * RBI's Master Direction – Know Your Customer (KYC) Direction, 2016 (as
 * amended), NOT transcribed from the current source document. Substance is
 * believed directionally correct, but exact wording and paragraph numbering
 * have not been checked against the current regulation. verified: false
 * propagates through to every finding citation built from these clauses and
 * must render an "unverified" notice wherever it's shown — see
 * components/primitives/CitationBlock.tsx.
 */
export const CORPUS_CLAUSES: CorpusClause[] = [
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000001',
    area_code:    'DLG',
    clause_ref:   'DLG Para 5 (i)',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'All loan disbursals and repayments shall be executed directly in the bank account of the borrower, without any pass-through or pool account of the Lending Service Provider (LSP) or any third party.',
    keywords: ['disburs', 'bank account', 'pool account', 'pass-through', 'nbfc partner'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000002',
    area_code:    'DLG',
    clause_ref:   'DLG Para 5 (ii)',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'Any fees, charges, etc., payable to LSPs in the credit intermediation process shall be paid directly by RE (Regulated Entity) and shall not be charged to the borrower directly by LSPs.',
    keywords: ['fee', 'charge', 'lsp', 'nbfc partner'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000003',
    area_code:    'DLG',
    clause_ref:   'DLG Para 6 — Key Fact Statement',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'REs shall provide a Key Fact Statement (KFS) to the borrower before the execution of the loan contract. The KFS shall include the Annual Percentage Rate (APR), all-in cost including fees and charges, and the grievance redressal mechanism.',
    keywords: ['key fact statement', 'kfs', 'apr', 'annual percentage rate', 'digital loan agreement'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000004',
    area_code:    'DLG',
    clause_ref:   'DLG Para 6 — Cooling-off Period',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'The borrower shall be given an explicit option to exit the digital loan by paying back the principal and the proportionate APR without any penalty during a cooling-off / look-up period. The minimum cooling-off period shall be three days for loans with tenure of seven days or more.',
    keywords: ['cooling-off', 'cooling off', 'look-up period', 'lookup period', 'exit option'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000005',
    area_code:    'DLG',
    clause_ref:   'DLG Para 7 — Data Collection',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'REs and LSPs shall not store personal information of the borrower except for limited data (name, address, contact details, etc.) that may be required to carry out their operations, subject to need-based access with the explicit consent of the borrower.',
    keywords: ['privacy policy', 'personal information', 'data collection', 'consent'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000006',
    area_code:    'DLG',
    clause_ref:   'DLG Para 7 — Device Access',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'Blanket permission to access mobile phone resources including files and media, contact lists, call logs, telephony functions, etc., shall not be taken at the time of onboarding / app installation. Such access shall be based on need and purpose for each permission.',
    keywords: ['device access', 'contact list', 'device permission', 'device fingerprint'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000007',
    area_code:    'DLG',
    clause_ref:   'DLG Para 8 — Grievance Redressal',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'Each RE shall designate a nodal grievance redressal officer to deal with FinTech / digital lending related complaints. The contact details of the grievance redressal officer shall be prominently displayed on the website of the RE, LSP apps, and related portals.',
    keywords: ['grievance', 'nodal officer', 'redressal officer'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000008',
    area_code:    'DLG',
    clause_ref:   'DLG Para 8 — Complaint Escalation',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'If a complaint lodged by a borrower is not resolved by the RE within 30 days, the borrower can escalate the same to the Integrated Ombudsman Scheme of RBI.',
    keywords: ['ombudsman', 'complaint escalation', 'grievance'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000009',
    area_code:    'DLG',
    clause_ref:   'DLG Para 9 — Recovery Guidelines',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'Recovery agents appointed by REs and LSPs shall strictly adhere to the RBI guidelines on recovery. All recovery actions shall be time-bound, and interaction with borrowers shall only be during permissible hours.',
    keywords: ['recovery agent', 'collections', 'recovery'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000010',
    area_code:    'DLG',
    clause_ref:   'DLG Para 10 — Credit Reporting',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'REs shall report digital lending data to Credit Information Companies (CICs) irrespective of the nature of the product or its tenor. Short-term digital credit products shall also be reported to CICs.',
    keywords: ['credit information compan', 'cic', 'credit report', 'credit bureau'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000011',
    area_code:    'DLG',
    clause_ref:   'DLG Para 4 — LSP Obligations',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'The RE shall ensure that the LSP engaged by it shall not use the RE brand in a manner that could mislead the borrowers. All communications to the borrower in relation to digital lending shall clearly identify the RE.',
    keywords: ['lsp', 'brand', 'nbfc partner'],
  },
  {
    id:           'a1b2c3d4-0001-0001-0001-000000000012',
    area_code:    'DLG',
    clause_ref:   'DLG Para 5 (iii) — Automatic Credit Limit Increase',
    source_title: 'RBI Digital Lending Guidelines, September 2022',
    verified:     true,
    text: 'Automatic increase in credit limit without explicit consent of the borrower shall not be permitted. The borrower shall be required to give fresh and explicit consent for every credit limit increase.',
    keywords: ['credit limit', 'consent', 'emi'],
  },

  // ---------------------------------------------------------------------
  // KYC_AML — unverified, see file header.
  // ---------------------------------------------------------------------
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000001',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Customer Due Diligence at Onboarding',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'A regulated entity shall verify the identity and address of a customer using Officially Valid Documents (OVDs) before establishing an account-based relationship, and shall not open or operate an account in anonymous or fictitious form.',
    keywords: ['kyc', 'ekyc', 'aadhaar', 'pan verification', 'officially valid document', 'ovd', 'ckyc'],
  },
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000002',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Risk Categorisation of Customers',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'A regulated entity shall categorise customers into low, medium, and high risk based on factors such as identity, occupation, source of funds, location, and nature of business, and apply due diligence measures proportionate to the assigned risk category.',
    keywords: ['risk categor', 'risk engine', 'risk tier', 'risk assessment'],
  },
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000003',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Enhanced Due Diligence for High-Risk Customers and PEPs',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'A regulated entity shall apply enhanced due diligence, including senior management approval, for customers categorised as high risk and for Politically Exposed Persons (PEPs), with ongoing monitoring of the relationship.',
    keywords: ['enhanced due diligence', 'pep', 'politically exposed', 'risk engine'],
  },
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000004',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Periodic Updation of KYC',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'A regulated entity shall periodically update customer identification data at intervals proportionate to the customer\'s risk category, with more frequent updation required for higher-risk customers.',
    keywords: ['periodic', 'kyc updat', 'refresh', 'kyc'],
  },
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000005',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Video-based Customer Identification Process (V-CIP)',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'Where a regulated entity uses a video-based process to complete customer identification remotely, it shall use a live, consent-based interaction with the customer and apply safeguards such as liveness checks and geo-tagging to prevent impersonation.',
    keywords: ['video kyc', 'video-based', 'v-cip', 'liveness'],
  },
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000006',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Record Maintenance and Suspicious Transaction Reporting',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'A regulated entity shall maintain records of customer identification and transactions for a prescribed retention period following account closure, and shall report suspicious transactions to the Financial Intelligence Unit – India (FIU-IND).',
    keywords: ['record', 'suspicious transaction', 'fiu', 'fraud detection', 'audit trail'],
  },
  {
    id:           'b2c3d4e5-0002-0002-0002-000000000007',
    area_code:    'KYC_AML',
    clause_ref:   'KYC-MD — Principal Officer',
    source_title: 'RBI Master Direction – Know Your Customer (KYC), 2016 (as amended) — reconstructed from general knowledge, NOT verified against current source text',
    verified:     false,
    text: 'A regulated entity shall designate a Principal Officer responsible for AML/CFT compliance, internal reporting of suspicious transactions, and acting as the point of contact for law enforcement and regulatory agencies.',
    keywords: ['principal officer', 'aml officer', 'compliance officer'],
  },
]

/**
 * Returns clauses for a given regulatory area.
 * This app's only "retrieval" step — a direct filter, no ranking or
 * relevance scoring. See the file header above and /architecture for why.
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
