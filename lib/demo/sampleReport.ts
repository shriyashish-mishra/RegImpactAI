import { getClauseById } from '@/lib/corpus'
import type { ReportData } from '@/lib/report/mapper'
import type { Finding } from '@/lib/types'

/**
 * Static fixture for the zero-setup /demo/sample page.
 * Citations are pulled from the real corpus (lib/corpus.ts) so the sample
 * output is consistent with what the live pipeline would actually produce —
 * not invented regulatory text. Includes one finding of each classification
 * (compliant / non_compliant / potential_gap / info_required) so the
 * zero-setup demo actually demonstrates the full classification system,
 * not just a list of problems.
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
    classification: 'non_compliant',
    what_found:
      "Loan disbursal is described as passing through the partner NBFC's pooled settlement account before reaching the borrower, rather than moving directly from the RE to the borrower's bank account.",
    why_matters:
      'DLG Para 5(i) requires all disbursals and repayments to be executed directly in the bank account of the borrower, with no pass-through or pool account for the LSP or any third party. A pooled settlement account is exactly the structure this clause was written to prohibit.',
    severity: 'high',
    confidence: 'high',
    confidence_reasoning:
      'The description explicitly states disbursal is routed through a pooled settlement account — direct, unambiguous evidence of the exact structure this clause prohibits, not an inference.',
    driver_clarity: 'high',
    driver_understanding: 'moderate',
    evidence_found: [
      "Description explicitly states disbursal is routed through the partner NBFC's pooled settlement account before reaching the borrower.",
    ],
    evidence_missing: [],
    inference_made: '',
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
    title: 'Cooling-off period availability not confirmed',
    classification: 'info_required',
    what_found:
      'The product description does not state whether a cooling-off / look-up period is offered — this cannot be confirmed as present or absent from the information given.',
    why_matters:
      'DLG Para 6 requires a minimum three-day cooling-off period for loans with tenure of seven days or more, during which the borrower can exit by repaying the principal and proportionate APR with no penalty. If missing, this is a real gap — but silence alone isn\'t evidence either way.',
    severity: 'medium',
    confidence: 'low',
    confidence_reasoning:
      'No discovery answer addresses the cooling-off period and the product description is silent on it — there is no basis to conclude compliance or non-compliance, only that it is unconfirmed.',
    driver_clarity: 'high',
    driver_understanding: 'low',
    evidence_found: [],
    evidence_missing: [
      'Whether a minimum three-day cooling-off period is offered on loans with tenure of seven days or more.',
      'Whether penalty-free early exit is available during any cooling-off window.',
    ],
    inference_made: '',
    impacts: [
      { lens: 'ui', description: 'If confirmed missing: loan offer and confirmation screens would need an explicit cooling-off disclosure and an in-app exit action.' },
      { lens: 'product', description: 'If confirmed missing: EMI repayment logic would need to support penalty-free early full repayment during the cooling-off window.' },
      { lens: 'business', description: 'Cooling-off period presence or absence is one of the first things an RBI supervisory review checks — worth confirming early.' },
    ],
    citations: [clause('a1b2c3d4-0001-0001-0001-000000000004')],
    recommendations: [
      'Confirm directly whether a cooling-off period is implemented before treating this as a gap.',
      'If not implemented, add a three-day minimum cooling-off period with penalty-free early exit.',
    ],
  },
  {
    id: 'demo-finding-3',
    assessment_id: ASSESSMENT_ID,
    area_code: 'DLG',
    area_name: 'Digital Lending Guidelines',
    title: 'Broad contact and SMS access requested at onboarding',
    classification: 'non_compliant',
    what_found:
      'The app requests full contact list and SMS access during signup, ahead of and unrelated to any specific loan-servicing need.',
    why_matters:
      'DLG Para 7 prohibits blanket permission to access phone resources such as contact lists, call logs, and SMS at onboarding — access must be need-based, tied to a specific purpose, and taken with explicit consent at the time of use.',
    severity: 'medium',
    confidence: 'high',
    confidence_reasoning:
      'The description explicitly states the app requests full contact list and SMS access at signup for credit scoring — direct evidence of blanket permission collection at onboarding, exactly what this clause prohibits.',
    driver_clarity: 'high',
    driver_understanding: 'high',
    evidence_found: [
      'Description explicitly states the app requests full contact list and SMS access at signup.',
      'Stated purpose is credit scoring, not a specific, need-based loan-servicing function.',
    ],
    evidence_missing: [],
    inference_made: '',
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
    title: 'Risk categorisation likely missing for onboarded customers',
    classification: 'potential_gap',
    what_found:
      'The product performs video KYC, which typically triggers a risk-categorisation obligation, but the description gives no indication that customers are subsequently tiered by risk — this reads as a likely gap, not a confirmed one.',
    why_matters:
      "Risk-based customer categorisation is a foundational KYC/AML control: it determines how often a customer's KYC is refreshed and whether enhanced due diligence applies. Skipping it flattens every customer to the same due-diligence level regardless of actual risk.",
    severity: 'medium',
    confidence: 'moderate',
    confidence_reasoning:
      'Video KYC confirms a formal identification process exists, which usually implies a risk-categorisation step should follow — but nothing in the description confirms tiers are actually assigned, so this is inferred as likely rather than certain.',
    driver_clarity: 'moderate',
    driver_understanding: 'low',
    evidence_found: [
      'Description confirms the product performs video KYC on customers, indicating a formal onboarding/identification process is in place.',
    ],
    evidence_missing: [
      'Whether customers are categorised into risk tiers (low/medium/high) after KYC.',
      'Whether enhanced due diligence applies to any higher-risk customer segment.',
    ],
    inference_made:
      'Inferred that risk categorisation is a live obligation here because the product performs formal KYC and extends credit — both conditions under which risk-based due diligence is expected.',
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
  {
    id: 'demo-finding-5',
    assessment_id: ASSESSMENT_ID,
    area_code: 'DLG',
    area_name: 'Digital Lending Guidelines',
    title: 'Key Fact Statement disclosure confirmed before loan execution',
    classification: 'compliant',
    what_found:
      'The product description confirms borrowers are shown the Key Fact Statement — including APR and total cost — before confirming the loan, satisfying the core KFS disclosure requirement.',
    why_matters:
      'DLG Para 6 requires REs to provide a Key Fact Statement including APR and all-in cost before the loan contract is executed, so borrowers can evaluate the true cost of credit before committing. Confirming a control is in place is as important to document as identifying gaps — a report that only ever lists problems isn\'t a credible assessment.',
    severity: 'low',
    confidence: 'high',
    confidence_reasoning:
      'The description explicitly states the KFS, including APR and total cost, is shown before the borrower confirms the loan — direct, unambiguous evidence of compliance, not an inference.',
    driver_clarity: 'high',
    driver_understanding: 'high',
    evidence_found: [
      'Description explicitly states the app displays the Key Fact Statement, including APR and total cost, before the borrower confirms the loan.',
    ],
    evidence_missing: [],
    inference_made: '',
    impacts: [
      { lens: 'product', description: 'No change needed — the loan confirmation flow already surfaces the KFS before commitment.' },
      { lens: 'business', description: 'Missing KFS disclosure is one of the most frequently cited DLG gaps in practice, so having it confirmed in place is a genuine differentiator worth preserving.' },
    ],
    citations: [clause('a1b2c3d4-0001-0001-0001-000000000003')],
    recommendations: [
      'Add a regression test asserting the KFS screen (with APR and total cost) always renders before loan confirmation, so this control does not silently regress in a future release.',
    ],
  },
]

export const SAMPLE_REPORT: ReportData = {
  assessment: {
    id: ASSESSMENT_ID,
    product_name: 'QuickCredit',
    description:
      "QuickCredit offers instant personal loans up to ₹2L via a mobile app. Customers complete video KYC, receive a loan offer, and repay in EMIs. The app displays the Key Fact Statement, including APR and total cost, before the borrower confirms the loan. Disbursals are routed through a partner NBFC's pooled settlement account before reaching the borrower, and the app requests full contact list and SMS access at signup to help build a credit score.",
    created_at: '2026-06-18T09:32:00.000Z',
  },
  findings,
}
