/**
 * Data mirrored from the main app's real fixtures (lib/demo/sampleReport.ts,
 * lib/demo/sampleJourney.ts, app/architecture/page.tsx) — copied rather than
 * imported because this Remotion project is intentionally an isolated
 * package with its own bundler and React copy (Remotion doesn't run inside
 * Next.js's build). If the source fixtures change, update this file to
 * match — see README.md's "Keeping the demo in sync" section.
 */

export const PRODUCT = {
  name: 'QuickCredit',
  industry: 'FinTech',
  categories: ['Digital Lending'],
  geographies: ['India'],
  targetCustomers: ['Retail Consumers'],
  regulatedEntities: ['Partner NBFC'],
  capabilities: ['Video KYC', 'EMI', 'Loan Disbursement'],
  description:
    "QuickCredit offers instant personal loans up to ₹2L via a mobile app. Customers complete video KYC, receive a loan offer, and repay in EMIs. The app displays the Key Fact Statement, including APR and total cost, before the borrower confirms the loan. Disbursals are routed through a partner NBFC's pooled settlement account before reaching the borrower, and the app requests full contact list and SMS access at signup to help build a credit score.",
}

export const WHAT_YOU_TOLD_US = [
  'Industry: FinTech',
  'Categories: Digital Lending',
  'Geographies: India',
  'Target Customers: Retail Consumers',
  'Regulated Entities: Partner NBFC',
]

export const WHAT_WE_UNDERSTOOD = [
  'Video KYC onboarding',
  'Key Fact Statement shown before loan confirmation',
  "Disbursal via partner NBFC's pooled settlement account",
  'Contact list and SMS access requested at signup',
  'Cooling-off period — not confirmed',
]

export const DISCOVERY_QUESTIONS = [
  {
    prompt: "Does the partner NBFC's pooled settlement account ever hold borrower funds before they reach the borrower's own bank account?",
    answer: "Yes — funds settle into the NBFC's pooled account first, then are disbursed to the borrower.",
  },
  {
    prompt: 'Are borrowers segmented into risk tiers after KYC verification?',
    answer: 'Not currently — all borrowers go through the same underwriting flow regardless of profile.',
  },
  {
    prompt: 'Is the Key Fact Statement shown before or after the borrower confirms the loan?',
    answer: 'Before — the borrower sees the KFS with APR and total cost and must actively confirm.',
  },
]

export const PIPELINE_STAGES = [
  'Structured Inputs',
  'Rule Engine',
  'Assessment Cache',
  'AI Inference Layer',
  'Versioned Regulatory Knowledge Base',
  'Retrieval',
  'Citation Verification',
  'Finding Classification',
  'Executive Report Generator',
]

// Real retrieval scope for a Digital Lending category product (DLG +
// KYC/AML clauses) — matches lib/categoryMapping.ts + lib/corpus.ts in the
// main app (12 DLG + 7 KYC/AML = 19), not a number chosen for the video.
export const CLAUSES_EVALUATED = 19
export const REGULATIONS_CONSIDERED = 2

export const ASSESSMENT_EXAMPLE = {
  title: "Disbursal routed through the partner NBFC's pooled settlement account",
  classification: 'Non-Compliant',
  evidenceFound: "Description explicitly states disbursal is routed through the partner NBFC's pooled settlement account before reaching the borrower.",
  citation: 'DLG Para 5(i) — RBI Digital Lending Guidelines, September 2022',
  confidenceReasoning: 'Direct, unambiguous evidence of the exact structure this clause prohibits — not an inference.',
}

export const FINDING_BREAKDOWN = {
  compliant: 1,
  nonCompliant: 2,
  potentialGap: 1,
  infoRequired: 1,
}

// These are the REAL computed values from lib/report/executiveSummary.ts
// applied to the 5 sample findings (1 compliant, 2 non-compliant, 1
// potential gap, 1 info required) — complianceScore = compliant/total,
// not a number chosen for the video. Recompute if the sample findings
// ever change.
export const EXECUTIVE_SUMMARY = {
  complianceScore: 20,
  riskLevel: 'High',
  launchRecommendation: '❌ Not ready for production',
  blockingIssues: 2,
}

export const TECH_STACK = [
  'Next.js', 'React', 'TypeScript', 'Tailwind CSS',
  'Supabase', 'PostgreSQL',
  'Provider-Agnostic AI Layer', 'Versioned Regulatory Knowledge Base',
  'Rule Engine', 'Assessment Cache', 'Streaming',
  'Vercel', 'GitHub',
]
