import { google } from '@ai-sdk/google'
import { streamText, Output } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getClausesByAreaCode, getClauseById } from '@/lib/corpus'
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from '@/lib/prompts/generate'
import { encodeStreamLine } from '@/lib/stream'
import { requireEnv } from '@/lib/env'
import type { ConfirmedModel, Question, Finding, GenerateStreamEvent } from '@/lib/types'

export const maxDuration = 60

const RequestSchema = z.object({
  confirmedModel: z.object({
    assessment_id: z.string().min(1),
    product_name: z.string().min(1),
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
  what_found: z.string().min(1),
  why_matters: z.string().min(1),
  severity: z.enum(['high', 'medium', 'low']),
  confidence: z.enum(['high', 'moderate', 'low']),
  driver_clarity: z.enum(['high', 'moderate', 'low']),
  driver_understanding: z.enum(['high', 'moderate', 'low']),
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

/** Only these areas have clauses in the corpus — the only ones worth calling the model for. */
const ASSESSABLE_AREA_CODES = ['DLG', 'KYC_AML']

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

  try {
    requireEnv('GOOGLE_GENERATIVE_AI_API_KEY')
  } catch (err) {
    console.error('[generate]', err)
    return Response.json({ error: 'Server misconfigured: missing GOOGLE_GENERATIVE_AI_API_KEY' }, { status: 500 })
  }

  const clauses = ASSESSABLE_AREA_CODES.flatMap(getClausesByAreaCode)

  let supabase: ReturnType<typeof createServerClient>
  try {
    supabase = createServerClient()
  } catch (err) {
    console.error('[generate]', err)
    return Response.json({ error: 'Server misconfigured: missing Supabase environment variables' }, { status: 500 })
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      const emit = (event: GenerateStreamEvent) => {
        controller.enqueue(encoder.encode(encodeStreamLine(event)))
      }

      try {
        emit({ type: 'step', text: `Testing ${ASSESSABLE_AREA_CODES.join(' + ')} clauses against ${confirmedModel.product_name}…` })

        const result = streamText({
          model: google('gemini-2.5-flash'),
          system: buildGenerateSystemPrompt(),
          prompt: buildGenerateUserPrompt(confirmedModel, questions, clauses),
          temperature: 0.4,
          output: Output.array({ element: FindingSchema }),
        })

        let count = 0
        for await (const f of result.elementStream) {
          count++
          const { data: findingRow, error: findingErr } = await supabase
            .from('findings')
            .insert({
              assessment_id: assessmentId,
              area_code: f.area_code,
              area_name: f.area_name,
              title: f.title,
              what_found: f.what_found,
              why_matters: f.why_matters,
              severity: f.severity,
              confidence: f.confidence,
              driver_clarity: f.driver_clarity,
              driver_understanding: f.driver_understanding,
            })
            .select('id')
            .single()

          if (findingErr || !findingRow) {
            console.error('[generate] Failed to persist finding:', findingErr)
            continue
          }

          const findingId = findingRow.id as string

          // verified is resolved from the trusted corpus, never taken from the
          // model's own output — a hallucinated or paraphrased citation must
          // never inherit a source clause's verified: true.
          const citations = f.citations.map(c => ({
            ...c,
            verified: getClauseById(c.corpus_clause_id)?.verified ?? false,
          }))

          if (f.impacts.length > 0) {
            await supabase.from('finding_impacts').insert(
              f.impacts.map(imp => ({ finding_id: findingId, lens: imp.lens, description: imp.description }))
            )
          }

          if (citations.length > 0) {
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
            what_found: f.what_found,
            why_matters: f.why_matters,
            severity: f.severity,
            confidence: f.confidence,
            driver_clarity: f.driver_clarity,
            driver_understanding: f.driver_understanding,
            impacts: f.impacts,
            citations,
            recommendations: f.recommendations,
          }
          emit({ type: 'finding', finding })
        }

        emit({ type: 'step', text: `Assessment complete — ${count} finding${count === 1 ? '' : 's'}.` })
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
