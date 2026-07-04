import { generateObject, NoObjectGeneratedError } from 'ai'
import { z } from 'zod'
import { buildQuestionsSystemPrompt, buildQuestionsUserPrompt } from '@/lib/prompts/questions'
import { getInferenceModel, hasInferenceCredentials } from '@/lib/ai/provider'
import { createServerClient } from '@/lib/supabase/server'
import { checkAndIncrementDailyQuota } from '@/lib/quota'
import { hashPayload } from '@/lib/cache/normalize'
import { getCachedResponse, setCachedResponse, recordOptimizationMetric } from '@/lib/cache/aiCache'
import type { ConfirmedModel, Question, QuestionsResponse, QuotaExceededResponse } from '@/lib/types'

export const maxDuration = 30

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
})

const QuestionsModelSchema = z.object({
  questions: z.array(z.object({
    prompt: z.string().min(1),
    rationale: z.string().min(1),
  })).min(1),
})

type GeneratedShape = z.infer<typeof QuestionsModelSchema>

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

  let supabase: ReturnType<typeof createServerClient>
  try {
    supabase = createServerClient()
  } catch (err) {
    console.error('[questions]', err)
    return Response.json({ error: 'Server misconfigured: missing Supabase environment variables' }, { status: 500 })
  }

  // Hashed on everything except assessment_id — that's a fresh uuid per
  // submission and would defeat matching against an otherwise-identical
  // product model.
  const { assessment_id: _assessmentId, ...cacheableModel } = confirmedModel
  const cacheKey = hashPayload(cacheableModel)
  const cacheStart = Date.now()
  const cached = await getCachedResponse<GeneratedShape>(supabase, 'questions', cacheKey)

  let questionsModel: GeneratedShape
  if (cached) {
    questionsModel = cached
    await recordOptimizationMetric(supabase, { cacheHits: 1, cachedResponseMs: Date.now() - cacheStart })
  } else {
    // Recorded here, not after the AI call succeeds — a cache miss is a
    // cache miss regardless of what happens next.
    await recordOptimizationMetric(supabase, { cacheMisses: 1 })

    if (!hasInferenceCredentials()) {
      console.error('[questions] Missing AI inference credentials')
      return Response.json({ error: 'Server misconfigured: missing AI inference credentials' }, { status: 500 })
    }

    const quota = await checkAndIncrementDailyQuota(supabase)
    if (!quota.allowed) {
      const response: QuotaExceededResponse = { error: 'quota_exceeded', used: quota.used, limit: quota.limit, resetAt: quota.resetAt }
      return Response.json(response, { status: 429 })
    }

    const aiCallStart = Date.now()
    let totalTokens = 0
    try {
      const result = await generateObject({
        model: getInferenceModel(),
        schema: QuestionsModelSchema,
        system: buildQuestionsSystemPrompt(),
        prompt: buildQuestionsUserPrompt(confirmedModel),
        temperature: 0.4,
      })
      questionsModel = result.object
      totalTokens = result.usage.totalTokens ?? 0
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        console.error('[questions] Model output failed schema validation:', err.cause)
        return Response.json({ error: 'Model returned an unexpected shape' }, { status: 502 })
      }
      console.error('[questions] AI inference call failed:', err)
      return Response.json({ error: 'Failed to generate questions' }, { status: 502 })
    }

    await recordOptimizationMetric(supabase, { aiCallMs: Date.now() - aiCallStart, aiTokens: totalTokens })
    await setCachedResponse(supabase, 'questions', cacheKey, questionsModel)
  }

  // Persist so a mid-flow refresh doesn't silently drop an answered question.
  // Falls back to in-memory ids if persistence fails — the wizard still works,
  // it just won't survive a refresh for this assessment.
  let questions: Question[]
  try {
    const { data: rows, error } = await supabase
      .from('questions')
      .insert(
        questionsModel.questions.map((q, i) => ({
          assessment_id: confirmedModel.assessment_id,
          seq: i + 1,
          prompt: q.prompt,
          rationale: q.rationale,
          answer: null,
        }))
      )
      .select('id, seq, prompt, rationale, answer')
      .order('seq', { ascending: true })

    if (error || !rows) throw error ?? new Error('No rows returned from insert')
    questions = rows as Question[]
  } catch (err) {
    console.error('[questions] Failed to persist questions, continuing without persistence:', err)
    questions = questionsModel.questions.map((q, i) => ({
      id: crypto.randomUUID(),
      seq: i + 1,
      prompt: q.prompt,
      rationale: q.rationale,
      answer: null,
    }))
  }

  const response: QuestionsResponse = { questions }
  return Response.json(response)
}
