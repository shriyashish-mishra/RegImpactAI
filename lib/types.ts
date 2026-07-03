// =============================================================================
// RegImpact AI — Shared TypeScript Types
// Single source of truth for all data shapes across the skeleton.
// =============================================================================


// =============================================================================
// NAVIGATION
// 'report' is a separate route (/report/[id]), not a Step.
// =============================================================================

export type Step = 'seed' | 'mirror' | 'discovery' | 'generating'


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

export type TriggeredArea = {
  area_code: string
  area_name: string
  status:    TriggerStatus
  reason:    string
}

// What the model returns from synthesis — no DB identity yet.
// narration[] is displayed during streaming, then discarded.
export type DraftModel = {
  product_name:    string
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

// What the client sends to /api/questions and /api/generate.
// narration stripped; assessment_id promoted to top level.
export type ConfirmedModel = {
  assessment_id:   string
  product_name:    string
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
// REGULATORY CORPUS
// =============================================================================

export type CorpusClause = {
  id:           string   // UUID — matches corpus_clauses.id in Postgres
  area_code:    string
  clause_ref:   string   // e.g. 'DLG Para 5 (i)'
  text:         string
  source_title: string
  // true only for clauses transcribed directly from a verified source document.
  // false means the text was reconstructed from general knowledge and has not
  // been checked against the current regulation — must be surfaced in the UI,
  // never presented as an equally-trustworthy citation.
  verified:     boolean
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
export type FindingCitation = {
  corpus_clause_id: string
  clause_ref:       string
  clause_text:      string
  source_title:     string
  verified:         boolean
}

export type FindingSeverity = 'high' | 'medium' | 'low'

export type Finding = {
  id:                   string
  assessment_id:        string
  area_code:            string
  area_name:            string
  title:                string
  what_found:           string
  why_matters:          string
  severity:             FindingSeverity
  confidence:           ConfidenceLevel
  driver_clarity:       ConfidenceLevel
  driver_understanding: ConfidenceLevel
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
  confidence:           ConfidenceLevel
  driver_clarity:       ConfidenceLevel
  driver_understanding: ConfidenceLevel
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

export type FindingCitationRow = {
  id:               string
  finding_id:       string
  corpus_clause_id: string
  clause_ref:       string
  clause_text:      string
  source_title:     string
  verified:         boolean
}
