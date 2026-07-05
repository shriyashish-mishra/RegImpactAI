import { streamText, Output } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getClausesByAreaCode, getClauseById } from '@/lib/corpus'
import { getDocumentById } from '@/lib/knowledgeBase/registry'
import { getAssessableAreaCodes } from '@/lib/categoryMapping'
import { applyRuleEngine } from '@/lib/ruleEngine'
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from '@/lib/prompts/generate'
import { encodeStreamLine } from '@/lib/stream'
import { getInferenceModel, hasInferenceCredentials } from '@/lib/ai/provider'
import { checkAndIncrementDailyQuota } from '@/lib/quota'
import { hashPayload } from '@/lib/cache/normalize'
import { getCachedResponse, setCachedResponse, recordOptimizationMetric } from '@/lib/cache/aiCache'
import type { ConfirmedModel, Question, Finding, GenerateStreamEvent, QuotaExceededResponse, ProductCategory } from '@/lib/types'

// Phase 1 made every finding much richer (classification, confidence
// reasoning, evidence found/missing, inference) and the model now produces
// one for every clause in scope (19 today), not just gaps — a real live
// run measured just over 60s and got cut off mid-stream. Vercel's Hobby
// plan allows up to 300s (confirmed against current docs, not memory —
// this used to be capped much lower); 180s leaves real margin without
// maxing out the platform ceiling for no reason.
export const maxDuration = 180

const RequestSchema = z.object({
  confirmedModel: z.object({
    assessment_id: z.string().min(1),
    product_name: z.string().min(1),
    structuredInfo: z.object({
      product_name:        z.string().min(1),
      industry:            z.string().min(1),
      categories:          z.array(z.string()),
      geographies:         z.array(z.string()),
      target_customers:    z.array(z.string()),
      regulated_entities:  z.array(z.string()),
      capabilities:        z.array(z.string()),
    }),
    elements: z.array(z.any()),
    triggered_areas: z.array(z.any()),
  }),
  questions: z.array(z.object({
    id: z.string(),
    seq: z.number(),
    prompt: z.string(),
    rationale: z.string(),
    answer: z.string().nullable(),
  })),
})

/** One array element — streamed and persisted as soon as each finding completes. */
const FindingSchema = z.object({
  area_code: z.string().min(1),
  area_name: z.string().min(1),
  title: z.string().min(1),
  classification: z.enum(['compliant', 'non_compliant', 'potential_gap', 'info_required']),
  what_found: z.string().min(1),
  why_matters: z.string().min(1),
  severity: z.enum(['high', 'medium', 'low']),
  confidence: z.enum(['high', 'moderate', 'low']),
  confidence_reasoning: z.string().min(1),
  driver_clarity: z.enum(['high', 'moderate', 'low']),
  driver_understanding: z.enum(['high', 'moderate', 'low']),
  evidence_found: z.array(z.string()),
  evidence_missing: z.array(z.string()),
  inference_made: z.string(),
  impacts: z.array(z.object({
    lens: z.enum(['product', 'ui', 'engineering', 'business']),
    description: z.string().min(1),
  })).min(1),
  citations: z.array(z.object({
    corpus_clause_id: z.string().min(1),
    clause_ref: z.string().min(1),
    clause_text: z.string().min(1),
    source_title: z.string().min(1),
  })).min(1),
  recommendations: z.array(z.string().min(1)).min(1),
})

type FindingShape = z.infer<typeof FindingSchema>

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsedRequest = RequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  const confirmedModel = parsedRequest.data.confirmedModel as ConfirmedModel
  const questions = parsedRequest.data.questions as Question[]
  const assessmentId = confirmedModel.assessment_id

  let supabase: ReturnType<typeof createServerClient>
  try {
    supabase = createServerClient()
  } catch (err) {
    console.error('[generate]', err)
    return Response.json({ error: 'Server misconfigured: missing Supabase environment variables' }, { status: 500 })
  }

  // Re-persist every answer this request actually used, regardless of
  // whether the earlier per-keystroke PATCH (/api/questions/[id]) already
  // succeeded. That PATCH is deliberately best-effort — this call is the
  // backstop, so the report's discovery summary (read from this table)
  // can never contradict the findings below it, which quote these same
  // answers as evidence. Best-effort itself: never blocks generation.
  const answeredQuestions = questions.filter(q => q.answer && q.answer.trim().length > 0)
  if (answeredQuestions.length > 0) {
    await Promise.all(
      answeredQuestions.map(q =>
        supabase.from('questions').update({ answer: q.answer }).eq('id', q.id)
      )
    ).catch(err => console.error('[generate] Failed to re-persist discovery answers:', err))
  }

  // Category-driven retrieval filtering: which areas are even worth testing
  // is decided from the Step 1 categories, not a fixed constant tested
  // against every product regardless of what it actually is. See
  // lib/categoryMapping.ts.
  const categories = confirmedModel.structuredInfo.categories as ProductCategory[]
  const assessableAreaCodes = getAssessableAreaCodes(categories)
  const allClauses = assessableAreaCodes.flatMap(getClausesByAreaCode)

  // Rule engine runs first, always, for free — see lib/ruleEngine. It can
  // only produce info_required (never a false compliant/non_compliant), so
  // running it before deciding anything about AI is risk-free.
  const { remainingClauses, ruleFindings } = applyRuleEngine(
    allClauses,
    confirmedModel.structuredInfo,
    confirmedModel.elements,
    ''
  )
  if (ruleFindings.length > 0) {
    await recordOptimizationMetric(supabase, { ruleEngineDecisions: ruleFindings.length })
  }

  // Everything below this point decides whether AI is needed AT ALL, and if
  // so, checks credentials/quota — all before the stream opens, exactly
  // like the quota check used to work, so a rejected/cache-covered request
  // never reaches the AI inference engine and never touches the daily
  // budget for work that cost nothing.
  let cachedFindings: FindingShape[] | null = null
  const cacheKey = remainingClauses.length > 0
    ? hashPayload({
        productName: confirmedModel.product_name,
        structuredInfo: confirmedModel.structuredInfo,
        elements: confirmedModel.elements,
        questions: questions.map(q => ({ prompt: q.prompt, answer: q.answer })),
        clauseIds: remainingClauses.map(c => c.id).sort(),
      })
    : null

  if (cacheKey) {
    const cacheStart = Date.now()
    cachedFindings = await getCachedResponse<FindingShape[]>(supabase, 'generate', cacheKey)
    if (cachedFindings) {
      await recordOptimizationMetric(supabase, { cacheHits: 1, cachedResponseMs: Date.now() - cacheStart })
    } else if (remainingClauses.length > 0) {
      // Recorded here, not after the AI call succeeds — a cache miss is a
      // cache miss regardless of what happens next.
      await recordOptimizationMetric(supabase, { cacheMisses: 1 })

      if (!hasInferenceCredentials()) {
        console.error('[generate] Missing AI inference credentials')
        return Response.json({ error: 'Server misconfigured: missing AI inference credentials' }, { status: 500 })
      }

      // Checked before the stream opens — this is a plain JSON response, not
      // a stream, so the client's existing `!res.ok` handling picks it up
      // the same way it already handles other pre-stream errors.
      const quota = await checkAndIncrementDailyQuota(supabase)
      if (!quota.allowed) {
        const response: QuotaExceededResponse = { error: 'quota_exceeded', used: quota.used, limit: quota.limit, resetAt: quota.resetAt }
        return Response.json(response, { status: 429 })
      }
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      const emit = (event: GenerateStreamEvent) => {
        controller.enqueue(encoder.encode(encodeStreamLine(event)))
      }

      // Shared by rule-engine findings, cache-replayed findings, and
      // freshly-streamed AI findings — one finding looks identical to the
      // client no matter which of the three produced it, per the "user
      // should never know which engine produced which finding" requirement.
      async function persistAndEmit(f: FindingShape) {
        const { data: findingRow, error: findingErr } = await supabase
          .from('findings')
          .insert({
            assessment_id: assessmentId,
            area_code: f.area_code,
            area_name: f.area_name,
            title: f.title,
            classification: f.classification,
            what_found: f.what_found,
            why_matters: f.why_matters,
            severity: f.severity,
            confidence: f.confidence,
            confidence_reasoning: f.confidence_reasoning,
            driver_clarity: f.driver_clarity,
            driver_understanding: f.driver_understanding,
            evidence_found: f.evidence_found,
            evidence_missing: f.evidence_missing,
            inference_made: f.inference_made,
          })
          .select('id')
          .single()

        if (findingErr || !findingRow) {
          console.error('[generate] Failed to persist finding:', findingErr)
          return
        }

        const findingId = findingRow.id as string

        // verified, document_version, publication_date, and authority are
        // all resolved server-side from the trusted corpus/registry, never
        // taken from the model's own output — a hallucinated or paraphrased
        // citation must never inherit a source document's trust or metadata.
        const citations = f.citations.map(c => {
          const clause = getClauseById(c.corpus_clause_id)
          const document = clause ? getDocumentById(clause.document_id) : undefined
          return {
            ...c,
            verified: clause?.verified ?? false,
            document_version: document?.version ?? null,
            publication_date: document?.publication_date ?? null,
            authority: document?.authority ?? null,
          }
        })
        for (const c of citations) {
          emit({ type: 'step', text: `Verifying citation: ${c.clause_ref}…` })
        }

        if (f.impacts.length > 0) {
          await supabase.from('finding_impacts').insert(
            f.impacts.map(imp => ({ finding_id: findingId, lens: imp.lens, description: imp.description }))
          )
        }

        if (citations.length > 0) {
          const { error: citationErr } = await supabase.from('finding_citations').insert(
            citations.map(c => ({
              finding_id: findingId,
              corpus_clause_id: c.corpus_clause_id,
              clause_ref: c.clause_ref,
              clause_text: c.clause_text,
              source_title: c.source_title,
              verified: c.verified,
              document_version: c.document_version,
              publication_date: c.publication_date,
              authority: c.authority,
            }))
          )
          // Falls back to the pre-Knowledge-Base column set if migration
          // 0012 hasn't been applied yet — citations must keep persisting
          // either way, not silently fail because three new columns don't
          // exist in the DB yet.
          if (citationErr) {
            console.error('[generate] finding_citations insert failed with new columns, retrying without them:', citationErr)
            await supabase.from('finding_citations').insert(
              citations.map(c => ({
                finding_id: findingId,
                corpus_clause_id: c.corpus_clause_id,
                clause_ref: c.clause_ref,
                clause_text: c.clause_text,
                source_title: c.source_title,
                verified: c.verified,
              }))
            )
          }
        }

        if (f.recommendations.length > 0) {
          await supabase.from('recommendations').insert(
            f.recommendations.map((text, i) => ({ finding_id: findingId, text, priority: i + 1 }))
          )
        }

        const finding: Finding = {
          id: findingId,
          assessment_id: assessmentId,
          area_code: f.area_code,
          area_name: f.area_name,
          title: f.title,
          classification: f.classification,
          what_found: f.what_found,
          why_matters: f.why_matters,
          severity: f.severity,
          confidence: f.confidence,
          confidence_reasoning: f.confidence_reasoning,
          driver_clarity: f.driver_clarity,
          driver_understanding: f.driver_understanding,
          evidence_found: f.evidence_found,
          evidence_missing: f.evidence_missing,
          inference_made: f.inference_made,
          impacts: f.impacts,
          citations,
          recommendations: f.recommendations,
        }
        emit({ type: 'finding', finding })
      }

      try {
        emit({ type: 'step', text: `Categories [${categories.join(', ')}] → retrieving ${assessableAreaCodes.join(' + ')} clauses from the regulatory corpus…` })

        if (ruleFindings.length > 0) {
          emit({ type: 'step', text: `Rule engine resolved ${ruleFindings.length} clause${ruleFindings.length === 1 ? '' : 's'} deterministically — no AI call needed.` })
          for (const rf of ruleFindings) {
            await persistAndEmit(rf as FindingShape)
          }
        }

        let count = ruleFindings.length
        let flagged = ruleFindings.length // all rule findings are info_required, i.e. flagged

        if (remainingClauses.length > 0) {
          emit({ type: 'step', text: `Testing ${remainingClauses.length} clause${remainingClauses.length === 1 ? '' : 's'} against ${confirmedModel.product_name}…` })

          if (cachedFindings) {
            for (const f of cachedFindings) {
              count++
              if (f.classification !== 'compliant') flagged++
              await persistAndEmit(f)
            }
          } else {
            const aiCallStart = Date.now()
            const result = streamText({
              model: getInferenceModel(),
              system: buildGenerateSystemPrompt(),
              prompt: buildGenerateUserPrompt(confirmedModel, questions, remainingClauses),
              temperature: 0.4,
              output: Output.array({ element: FindingSchema }),
            })

            const freshFindings: FindingShape[] = []
            for await (const f of result.elementStream) {
              count++
              if (f.classification !== 'compliant') flagged++
              freshFindings.push(f)
              await persistAndEmit(f)
            }

            const usage = await result.usage
            await recordOptimizationMetric(supabase, { aiCallMs: Date.now() - aiCallStart, aiTokens: usage.totalTokens ?? 0 })
            if (cacheKey) await setCachedResponse(supabase, 'generate', cacheKey, freshFindings)
          }
        }

        emit({ type: 'step', text: 'Preparing report…' })
        emit({ type: 'step', text: `Assessment complete — ${count} clause${count === 1 ? '' : 's'} assessed, ${flagged} flagged for review.` })
        emit({ type: 'done', assessment_id: assessmentId })
      } catch (err) {
        console.error('[generate] Unexpected error:', err)
        emit({ type: 'error', message: 'Failed to generate assessment' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    },
  })
}
