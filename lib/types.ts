// =============================================================================
// RegImpact AI — Shared TypeScript Types
// Single source of truth for all data shapes across the skeleton.
// =============================================================================


// =============================================================================
// NAVIGATION
// 'report' is a separate route (/report/[id]), not a Step.
// =============================================================================

export type Step = 'product_info' | 'seed' | 'mirror' | 'discovery' | 'generating'


// =============================================================================
// STRUCTURED PRODUCT INFO (onboarding Step 1)
//
// Captured before any AI inference call — the point is to give the model
// ground truth instead of asking it to infer things a form field already
// answers. Every prompt is told to trust these fields over anything it
// would otherwise infer, and only infer what's missing.
//
// Most fields are multi-select: real fintech products span multiple
// categories, geographies, customer segments, and regulated-entity
// relationships at once — forcing a single choice understated what the
// product actually is. Industry stays single-select and fixed to 'FinTech'
// (a plain string, not a union) since no other industry is supported yet;
// the type is deliberately loose so adding a second industry later doesn't
// require a breaking change here.
// =============================================================================

export type ProductCategory =
  | 'Digital Lending'
  | 'Payments'
  | 'BNPL'
  | 'Neobank'
  | 'Invoice Financing'
  | 'Investment Platform'
  | 'Insurance'
  | 'Merchant Financing'
  | 'Lending Marketplace'
  | 'Wealth Management'
  | 'Other'

// Not a strict enum of "supported" geographies — India is only ever a
// default *selection*, never a hardcoded business rule (see
// components/screens/ProductInfoScreen.tsx). Additional geographies are
// free-form business reality (a product can operate anywhere); this union
// is just the starter chip set, extended the same way ProductCategory is.
export type Geography =
  | 'India'
  | 'Singapore'
  | 'UAE'
  | 'UK'
  | 'EU'
  | 'Other'

export type TargetCustomer =
  | 'Retail Consumers'
  | 'SMEs'
  | 'Merchants'
  | 'Enterprises'
  | 'Banks'
  | 'NBFCs'
  | 'Government'

export type RegulatedEntityType =
  | 'Partner NBFC'
  | 'Scheduled Commercial Bank'
  | 'Payment Aggregator'
  | 'PPI Issuer'
  | 'Account Aggregator'
  | 'Insurance Company'
  | 'Partner Bank'
  | 'Other'

export type Capability =
  | 'Aadhaar eKYC'
  | 'PAN Verification'
  | 'Video KYC'
  | 'CKYC'
  | 'Credit Bureau Checks'
  | 'UPI'
  | 'UPI AutoPay'
  | 'eSign'
  | 'Digital Loan Agreement'
  | 'Loan Disbursement'
  | 'EMI'
  | 'Collections'
  | 'Fraud Detection'
  | 'AI Underwriting'
  | 'WhatsApp Notifications'
  | 'SMS'
  | 'Email'
  | 'Credit Reporting'
  | 'Device Fingerprinting'
  | 'Risk Engine'
  | 'OCR'
  | 'Document Upload'

export type StructuredProductInfo = {
  product_name:       string
  industry:           string // fixed to 'FinTech' for now — no other industries supported yet
  categories:         ProductCategory[]
  geographies:        Geography[] // defaults to ['India'], never hardcoded as a business rule
  target_customers:   TargetCustomer[]
  regulated_entities: RegulatedEntityType[]
  capabilities:       Capability[]
}


// =============================================================================
// PRODUCT MODEL
// =============================================================================

export type ElementType =
  | 'activity'
  | 'feature'
  | 'journey'
  | 'screen'
  | 'system'

export type ConfidenceLevel = 'high' | 'moderate' | 'low'

export type ElementStatus = 'inferred' | 'confirmed' | 'rejected'

export type ProductElement = {
  element_type: ElementType
  label:        string
  status:       ElementStatus
  is_negative:  boolean       // true = "UPI — not detected"
  confidence:   ConfidenceLevel
}

export type TriggerStatus = 'triggered' | 'not_triggered' | 'not_applicable'

// signals is client-side only (part of DraftModel/ConfirmedModel), never
// persisted — it exists to make "why does this area apply" transparent on
// the Mirror screen, not just a single reason sentence.
export type TriggeredArea = {
  area_code: string
  area_name: string
  status:    TriggerStatus
  reason:    string
  signals:   string[]
}

// What the model returns from synthesis — no DB identity yet.
// narration[] is displayed during streaming, then discarded.
// structuredInfo is echoed straight back from the request, not regenerated
// by the AI inference engine — the whole point of Step 1 is that these
// fields are ground truth, never re-inferred and potentially altered by
// the model.
export type DraftModel = {
  product_name:    string
  structuredInfo:  StructuredProductInfo
  elements:        ProductElement[]
  triggered_areas: TriggeredArea[]
  narration:       string[]
}

// What /api/synthesize returns to the client.
// assessment_id is the Postgres uuid created server-side.
export type SynthesisResponse = {
  assessment_id: string
  model:         DraftModel
}

// Returned by any AI-inference-calling route (synthesize/questions/generate) with
// HTTP 429 when the daily quota (lib/quota.ts) is exhausted. Client code
// checks `error === 'quota_exceeded'` to show QuotaExceededScreen instead of
// a generic error — see components/primitives/QuotaExceededScreen.tsx.
export type QuotaExceededResponse = {
  error:    'quota_exceeded'
  used:     number
  limit:    number
  resetAt:  string
}

// What the client sends to /api/questions and /api/generate.
// narration stripped; assessment_id promoted to top level.
export type ConfirmedModel = {
  assessment_id:   string
  product_name:    string
  structuredInfo:  StructuredProductInfo
  elements:        ProductElement[]
  triggered_areas: TriggeredArea[]
}


// =============================================================================
// DISCOVERY
// =============================================================================

export type Question = {
  id:        string
  seq:       number
  prompt:    string
  rationale: string
  answer:    string | null
}

export type QuestionsResponse = {
  questions: Question[]
}


// =============================================================================
// REGULATORY KNOWLEDGE BASE
// =============================================================================
// A regulatory area (e.g. Digital Lending) can hold multiple documents (a
// guideline, its circulars, amendments, FAQs); each document can have
// multiple versions over time, only one of which is Active. See
// lib/knowledgeBase/registry.ts. This models real regulatory lifecycles —
// RBI amends and clarifies guidelines constantly — instead of treating a
// regulation as one static PDF.

export type DocumentType =
  | 'master_direction'
  | 'guideline'
  | 'circular'
  | 'notification'
  | 'faq'
  | 'press_release'
  | 'clarification'
  | 'advisory'
  | 'discussion_paper'

// Only 'active' documents participate in assessments (see
// lib/knowledgeBase/registry.ts's getActiveDocuments). The rest exist so a
// document's full lifecycle is representable without deleting history.
export type DocumentStatus =
  | 'draft'
  | 'under_review'
  | 'active'
  | 'deprecated'
  | 'superseded'
  | 'archived'

// A regulatory area under an authority — e.g. RBI's "Digital Lending".
// status: 'coming_soon' areas exist in the registry (so the knowledge base
// page can show them as a real extensibility point) but have zero
// documents and zero corpus clauses — never fabricated content.
export type RegulatoryArea = {
  code:      string   // 'DLG', 'KYC_AML', 'PPI', 'PAYMENT_AGGREGATOR', 'ACCOUNT_AGGREGATOR', 'NBFC', 'UPI'
  name:      string   // 'Digital Lending', 'KYC / AML', ...
  authority: string   // 'Reserve Bank of India'
  status:    'active' | 'coming_soon'
}

// Structured metadata for one regulatory document. Reusable across any
// authority/area — nothing here is RBI-specific. A single area can hold
// several of these (one per document_type, or several versions of the same
// one); corpus clauses reference a document by id, never an area directly.
export type RegulatoryDocument = {
  id:               string
  title:            string
  authority:        string        // e.g. 'Reserve Bank of India'
  area_code:        string        // joins to RegulatoryArea.code
  document_type:    DocumentType
  // Free-text, not a strict ISO date — real regulatory sourcing is often
  // only known to month or year precision, and inventing a specific day
  // would be fabricating precision the source doesn't have.
  publication_date: string | null
  effective_date:   string | null
  version:          number
  status:           DocumentStatus
  jurisdiction:     string
  source:           string         // human-readable citation of where this came from
  last_reviewed:    string | null  // null until an actual review pass has a real date to record
  supersedes:       string | null  // id of the RegulatoryDocument this replaced
  superseded_by:    string | null  // id of the RegulatoryDocument that replaced this
  verified:         boolean        // true only for text transcribed directly from source, never reconstructed
  description:      string
}

export type CorpusClause = {
  id:           string   // UUID — matches corpus_clauses.id in Postgres
  document_id:  string   // joins to RegulatoryDocument.id — see lib/knowledgeBase/registry.ts
  area_code:    string   // denormalized from the document for convenience/backward compat
  clause_ref:   string   // e.g. 'DLG Para 5 (i)'
  text:         string
  source_title: string
  // true only for clauses transcribed directly from a verified source document.
  // false means the text was reconstructed from general knowledge and has not
  // been checked against the current regulation — must be surfaced in the UI,
  // never presented as an equally-trustworthy citation.
  verified:     boolean
  // Lowercase phrases the rule engine (lib/ruleEngine) checks for anywhere in
  // structured capabilities or the free-text description. Used ONLY to detect
  // a total absence of signal — if none match, the clause is safely
  // pre-classified info_required without an AI call. Presence of a match
  // never auto-classifies compliant; it just means the clause still needs
  // full AI reasoning, since mentioning something doesn't confirm it meets
  // the regulation's actual terms.
  keywords:     string[]
}


// =============================================================================
// FINDINGS
// =============================================================================

export type ImpactLens = 'product' | 'ui' | 'engineering' | 'business'

export type FindingImpact = {
  lens:        ImpactLens
  description: string
}

// corpus_clause_id joins to corpus_clauses.id (UUID join, not text match).
// clause_ref and clause_text are denormalised for display.
// verified is resolved server-side from the corpus (lib/corpus.ts), never
// trusted from the model's own output — see app/api/generate/route.ts.
//
// document_version/publication_date/authority are optional and resolved
// server-side from the clause's RegulatoryDocument (lib/knowledgeBase),
// same trust model as verified. Optional, not required, because citations
// persisted before the Knowledge Base model existed have none of these —
// CitationBlock renders them only when present, so old reports keep
// rendering exactly as they always did.
export type FindingCitation = {
  corpus_clause_id:  string
  clause_ref:        string
  clause_text:       string
  source_title:      string
  verified:          boolean
  document_version:  number | null
  publication_date:  string | null
  authority:         string | null
}

export type FindingSeverity = 'high' | 'medium' | 'low'

// classification separates "confirmed non-compliant" from "we don't have
// enough information to say" from "this is fine" — the model is required
// to classify every clause it's given, not just report gaps. Without this,
// a report can only ever show problems, which reads as untrustworthy (an
// assessment that never confirms anything as compliant looks incomplete,
// not thorough) and makes an aggregate compliance score impossible to
// compute (see app/case-study and the executive summary on the report).
export type FindingClassification =
  | 'compliant'
  | 'non_compliant'
  | 'potential_gap'
  | 'info_required'

export type Finding = {
  id:                   string
  assessment_id:        string
  area_code:            string
  area_name:            string
  title:                string
  what_found:           string
  why_matters:          string
  severity:             FindingSeverity
  classification:       FindingClassification
  confidence:           ConfidenceLevel
  confidence_reasoning: string
  driver_clarity:       ConfidenceLevel
  driver_understanding: ConfidenceLevel
  evidence_found:       string[]
  evidence_missing:     string[]
  inference_made:       string
  impacts:              FindingImpact[]
  citations:            FindingCitation[]
  recommendations:      string[]
}


// =============================================================================
// STREAMING — /api/generate
//
// Protocol: NDJSON over HTTP. Each line is one GenerateStreamEvent as JSON.
// Consumer splits on '\n' and JSON.parses each non-empty line.
// Use lib/stream.ts → parseStreamLine() for safe parsing.
// Narrow on event.type — TypeScript resolves each branch automatically.
// =============================================================================

export type StreamStep = {
  type: 'step'
  text: string
}

export type StreamFinding = {
  type:    'finding'
  finding: Finding
}

export type StreamDone = {
  type:          'done'
  assessment_id: string
}

export type StreamError = {
  type:    'error'
  message: string
}

export type GenerateStreamEvent =
  | StreamStep
  | StreamFinding
  | StreamDone
  | StreamError


// =============================================================================
// DATABASE ROW TYPES
// Mirror Postgres table shapes for Supabase query results.
// Used in /api/report/[id] and app/report/[id]/page.tsx.
// =============================================================================

export type AssessmentRow = {
  id:           string
  product_name: string
  description:  string
  created_at:   string
}

export type FindingRow = {
  id:                   string
  assessment_id:        string
  area_code:            string
  area_name:            string
  title:                string
  what_found:           string
  why_matters:          string
  severity:             FindingSeverity
  classification:       FindingClassification
  confidence:           ConfidenceLevel
  confidence_reasoning: string
  driver_clarity:       ConfidenceLevel
  driver_understanding: ConfidenceLevel
  evidence_found:       string[]
  evidence_missing:     string[]
  inference_made:       string
}

export type FindingImpactRow = {
  id:          string
  finding_id:  string
  lens:        ImpactLens
  description: string
}

export type RecommendationRow = {
  id:         string
  finding_id: string
  text:       string
  priority:   number
}

export type QuestionRow = {
  id:            string
  assessment_id: string
  seq:           number
  prompt:        string
  rationale:     string
  answer:        string | null
}

export type FindingCitationRow = {
  id:               string
  finding_id:       string
  corpus_clause_id: string
  clause_ref:       string
  clause_text:      string
  source_title:     string
  verified:         boolean
  // Added by migration 0012 — absent (undefined) on rows written before it,
  // never present as an error. lib/report/mapper.ts defaults each to null.
  document_version?: number | null
  publication_date?: string | null
  authority?:        string | null
}
