import type { StructuredProductInfo, ProductElement, Question } from '@/lib/types'

/**
 * Static fixture for the /demo/sample "Assessment Journey" cards — the
 * onboarding, mirror, and discovery steps that led to SAMPLE_REPORT
 * (lib/demo/sampleReport.ts). Same product (QuickCredit), same narrative:
 * a digital lending app working with a partner NBFC. Illustrative, not a
 * real historical assessment — but every element here is consistent with
 * what the live pipeline actually produces at each stage, not invented
 * for effect.
 */

export const JOURNEY_STRUCTURED_INFO: StructuredProductInfo = {
  product_name: 'QuickCredit',
  industry: 'FinTech',
  categories: ['Digital Lending'],
  geographies: ['India'],
  target_customers: ['Retail Consumers'],
  regulated_entities: ['Partner NBFC'],
  capabilities: ['Video KYC', 'EMI', 'Loan Disbursement'],
}

export const JOURNEY_DESCRIPTION =
  "QuickCredit offers instant personal loans up to ₹2L via a mobile app. Customers complete video KYC, receive a loan offer, and repay in EMIs. The app displays the Key Fact Statement, including APR and total cost, before the borrower confirms the loan. Disbursals are routed through a partner NBFC's pooled settlement account before reaching the borrower, and the app requests full contact list and SMS access at signup to help build a credit score."

// What Mirror Understanding inferred from the description above — mirrors
// the real element_type/status/confidence shape the synthesize stage
// actually produces.
export const JOURNEY_INFERRED_ELEMENTS: ProductElement[] = [
  { element_type: 'feature', label: 'Video KYC onboarding', status: 'inferred', is_negative: false, confidence: 'high' },
  { element_type: 'feature', label: 'Key Fact Statement shown before loan confirmation', status: 'inferred', is_negative: false, confidence: 'high' },
  { element_type: 'system', label: "Disbursal via partner NBFC's pooled settlement account", status: 'inferred', is_negative: false, confidence: 'high' },
  { element_type: 'feature', label: 'Contact list and SMS access requested at signup', status: 'inferred', is_negative: false, confidence: 'high' },
  { element_type: 'feature', label: 'Cooling-off / look-up period', status: 'inferred', is_negative: true, confidence: 'low' },
]

export const JOURNEY_QUESTIONS: Question[] = [
  {
    id: 'demo-q1',
    seq: 1,
    prompt: "Does the partner NBFC's pooled settlement account ever hold borrower funds before they reach the borrower's own bank account?",
    rationale: 'DLG Para 5(i) prohibits any pass-through or pool account between disbursal and the borrower — this directly determines that finding.',
    answer: "Yes — funds settle into the NBFC's pooled account first, then are disbursed to the borrower.",
  },
  {
    id: 'demo-q2',
    seq: 2,
    prompt: 'What is the primary purpose of requesting contact list and SMS access at signup?',
    rationale: 'DLG Para 7 requires device permissions to be need-based and tied to a specific purpose, not requested blanket at onboarding.',
    answer: 'To build an alternate credit score using SMS-based transaction signals and contact network analysis.',
  },
  {
    id: 'demo-q3',
    seq: 3,
    prompt: 'Are borrowers segmented into risk tiers after KYC verification?',
    rationale: 'Risk-based categorisation is a foundational KYC/AML control that determines due-diligence intensity.',
    answer: 'Not currently — all borrowers go through the same underwriting flow regardless of profile.',
  },
  {
    id: 'demo-q4',
    seq: 4,
    prompt: 'Is the Key Fact Statement shown before or after the borrower confirms the loan?',
    rationale: 'DLG Para 6 requires KFS disclosure before loan execution, not after.',
    answer: 'Before — the borrower sees the KFS with APR and total cost and must actively confirm to proceed.',
  },
  {
    id: 'demo-q5',
    seq: 5,
    prompt: 'What loan tenure range does QuickCredit typically offer?',
    rationale: 'Cooling-off period requirements under DLG Para 6 depend on loan tenure.',
    answer: 'Most loans range from 30 to 180 days, with occasional shorter bridge loans under 7 days.',
  },
]
