import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getClausesByAreaCode } from '@/lib/corpus'
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from '@/lib/prompts/generate'
import { encodeStreamLine } from '@/lib/stream'
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

const FindingsModelSchema = z.object({
  findings: z.array(z.object({
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
  })),
})

function stripCodeFence(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
}

/** Only DLG has clauses in the corpus — the only area worth calling Claude for. */
const ASSESSABLE_AREA_CODE = 'DLG'

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

  const clauses = getClausesByAreaCode(ASSESSABLE_AREA_CODE)
  const supabase = createServerClient()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      const emit = (event: GenerateStreamEvent) => {
        controller.enqueue(encoder.encode(encodeStreamLine(event)))
      }

      try {
        emit({ type: 'step', text: `Testing ${ASSESSABLE_AREA_CODE} clauses against ${confirmedModel.product_name}…` })

        const result = await generateText({
          model: anthropic('claude-sonnet-4-6'),
          system: buildGenerateSystemPrompt(),
          prompt: buildGenerateUserPrompt(confirmedModel, questions, clauses),
          temperature: 0.4,
        })

        let parsed: unknown
        try {
          parsed = JSON.parse(stripCodeFence(result.text))
        } catch {
          console.error('[generate] Failed to parse model JSON:', result.text)
          emit({ type: 'error', message: 'Failed to parse assessment response' })
          controller.close()
          return
        }

        const validated = FindingsModelSchema.safeParse(parsed)
        if (!validated.success) {
          console.error('[generate] Model output failed validation:', validated.error.issues)
          emit({ type: 'error', message: 'Model returned an unexpected shape' })
          controller.close()
          return
        }

        emit({ type: 'step', text: `Found ${validated.data.findings.length} finding(s). Saving assessment…` })

        for (const f of validated.data.findings) {
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

          if (f.impacts.length > 0) {
            await supabase.from('finding_impacts').insert(
              f.impacts.map(imp => ({ finding_id: findingId, lens: imp.lens, description: imp.description }))
            )
          }

          if (f.citations.length > 0) {
            await supabase.from('finding_citations').insert(
              f.citations.map(c => ({
                finding_id: findingId,
                corpus_clause_id: c.corpus_clause_id,
                clause_ref: c.clause_ref,
                clause_text: c.clause_text,
                source_title: c.source_title,
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
            citations: f.citations,
            recommendations: f.recommendations,
          }
          emit({ type: 'finding', finding })
        }

        emit({ type: 'step', text: 'Assessment complete.' })
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
