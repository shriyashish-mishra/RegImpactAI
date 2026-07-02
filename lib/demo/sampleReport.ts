import { getClauseById } from '@/lib/corpus'
import type { ReportData } from '@/lib/report/mapper'
import type { Finding } from '@/lib/types'

/**
 * Static fixture for the zero-setup /demo/sample page.
 * Citations are pulled from the real corpus (lib/corpus.ts) so the sample
 * output is consistent with what the live pipeline would actually produce —
 * not invented regulatory text.
 */

const clause = (id: string) => {
  const c = getClauseById(id)
  if (!c) throw new Error(`Demo fixture references unknown corpus clause: ${id}`)
  return {
    corpus_clause_id: c.id,
    clause_ref: c.clause_ref,
    clause_text: c.text,
    source_title: c.source_title,
    verified: c.verified,
  }
}

const ASSESSMENT_ID = 'demo-sample-assessment'

const findings: Finding[] = [
  {
    id: 'demo-finding-1',
    assessment_id: ASSESSMENT_ID,
    area_code: 'DLG',
    area_name: 'Digital Lending Guidelines',
    title: "Disbursal routed through the partner NBFC's pooled settlement account",
    what_found:
      "Loan disbursal is described as passing through the partner NBFC's pooled settlement account before reaching the borrower, rather than moving directly from the RE to the borrower's bank account.",
    why_matters:
      'DLG Para 5(i) requires all disbursals and repayments to be executed directly in the bank account of the borrower, with no pass-through or pool account for the LSP or any third party. A pooled settlement account is exactly the structure this clause was written to prohibit.',
    severity: 'high',
    confidence: 'high',
    driver_clarity: 'high',
    driver_understanding: 'moderate',
    impacts: [
      { lens: 'product', description: "Disbursal flow needs a redesign so funds move directly from the RE to the borrower's account, removing the pooled intermediary step." },
      { lens: 'engineering', description: "Payment rails need a direct RE-to-borrower disbursal integration instead of routing through the NBFC's pooled settlement account." },
      { lens: 'business', description: 'Continuing pooled disbursal exposes the RE to regulatory action and puts the NBFC partnership at risk.' },
    ],
    citations: [clause('a1b2c3d4-0001-0001-0001-000000000001')],
    recommendations: [
      "Route disbursal directly from the RE's account to the borrower's bank account, eliminating the pooled account step.",
      'Confirm with the partner NBFC whether their settlement architecture can support direct-to-borrower transfers.',
    ],
  },
  {
    id: 'demo-finding-2',
    assessment_id: ASSESSMENT_ID,
    area_code: 'DLG',
    area_name: 'Digital Lending Guidelines',
    title: 'No cooling-off period disclosed for EMI loans',
    what_found:
      'The product description does not mention a cooling-off / look-up period during which a borrower can exit the loan without penalty.',
    why_matters:
      'DLG Para 6 requires a minimum three-day cooling-off period for loans with tenure of seven days or more, during which the borrower can exit by repaying the principal and proportionate APR with no penalty.',
    severity: 'medium',
    confidence: 'moderate',
    driver_clarity: 'high',
    driver_understanding: 'low',
    impacts: [
      { lens: 'ui', description: 'Loan offer and confirmation screens need an explicit cooling-off disclosure and an in-app exit action.' },
      { lens: 'product', description: 'EMI repayment logic must support penalty-free early full repayment during the cooling-off window.' },
      { lens: 'business', description: 'Absence of a cooling-off period is a common first finding in RBI supervisory reviews of digital lenders.' },
    ],
    citations: [clause('a1b2c3d4-0001-0001-0001-000000000004')],
    recommendations: [
      'Add a three-day minimum cooling-off period to the loan contract and confirmation screen.',
      'Build a penalty-free early exit path for loans within the cooling-off window.',
    ],
  },
  {
    id: 'demo-finding-3',
    assessment_id: ASSESSMENT_ID,
    area_code: 'DLG',
    area_name: 'Digital Lending Guidelines',
    title: 'Broad contact and SMS access requested at onboarding',
    what_found:
      'The app requests full contact list and SMS access during signup, ahead of and unrelated to any specific loan-servicing need.',
    why_matters:
      'DLG Para 7 prohibits blanket permission to access phone resources such as contact lists, call logs, and SMS at onboarding — access must be need-based, tied to a specific purpose, and taken with explicit consent at the time of use.',
    severity: 'medium',
    confidence: 'high',
    driver_clarity: 'high',
    driver_understanding: 'high',
    impacts: [
      { lens: 'engineering', description: 'Move contact/SMS permission requests out of the onboarding flow and gate them behind the specific feature that needs them.' },
      { lens: 'ui', description: 'Add a just-in-time consent screen explaining why a specific permission is being requested.' },
      { lens: 'business', description: 'Blanket data collection at onboarding is one of the most cited DLG violations in RBI enforcement actions against digital lenders.' },
    ],
    citations: [clause('a1b2c3d4-0001-0001-0001-000000000006')],
    recommendations: [
      'Request contact/SMS access only at the point of specific need, not at signup.',
      'Add per-permission purpose disclosure and consent capture before each request.',
    ],
  },
  {
    id: 'demo-finding-4',
    assessment_id: ASSESSMENT_ID,
    area_code: 'KYC_AML',
    area_name: 'KYC / AML',
    title: 'No risk categorisation described for onboarded customers',
    what_found:
      'The product description does not mention categorising customers into risk tiers (low/medium/high) as part of onboarding — video KYC is mentioned, but not what happens with the identity data afterward.',
    why_matters:
      "Risk-based customer categorisation is a foundational KYC/AML control: it determines how often a customer's KYC is refreshed and whether enhanced due diligence applies. Skipping it flattens every customer to the same due-diligence level regardless of actual risk.",
    severity: 'medium',
    confidence: 'moderate',
    driver_clarity: 'moderate',
    driver_understanding: 'low',
    impacts: [
      { lens: 'product', description: 'Onboarding needs a risk-scoring step that assigns each customer a tier before the account is activated.' },
      { lens: 'engineering', description: 'Customer records need a risk-tier field driving periodic KYC-refresh scheduling, not a one-time onboarding check.' },
      { lens: 'business', description: 'Regulators expect risk categorisation as a baseline control — its absence is typically flagged early in an AML audit.' },
    ],
    citations: [clause('b2c3d4e5-0002-0002-0002-000000000002')],
    recommendations: [
      'Add a risk-categorisation step to onboarding that scores each customer low/medium/high.',
      'Schedule periodic KYC refresh intervals keyed to the assigned risk tier.',
    ],
  },
]

export const SAMPLE_REPORT: ReportData = {
  assessment: {
    id: ASSESSMENT_ID,
    product_name: 'QuickCredit',
    description:
      "QuickCredit offers instant personal loans up to ₹2L via a mobile app. Customers complete video KYC, receive a loan offer, and repay in EMIs. Disbursals are routed through a partner NBFC's pooled settlement account before reaching the borrower, and the app requests full contact list and SMS access at signup to help build a credit score.",
    created_at: '2026-06-18T09:32:00.000Z',
  },
  findings,
}
