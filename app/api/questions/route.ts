import { google } from '@ai-sdk/google'
import { generateObject, NoObjectGeneratedError } from 'ai'
import { z } from 'zod'
import { buildQuestionsSystemPrompt, buildQuestionsUserPrompt } from '@/lib/prompts/questions'
import { requireEnv } from '@/lib/env'
import { createServerClient } from '@/lib/supabase/server'
import { checkAndIncrementDailyQuota } from '@/lib/quota'
import type { ConfirmedModel, Question, QuestionsResponse, QuotaExceededResponse } from '@/lib/types'

export const maxDuration = 30

const RequestSchema = z.object({
  confirmedModel: z.object({
    assessment_id: z.string().min(1),
    product_name: z.string().min(1),
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

  try {
    requireEnv('GOOGLE_GENERATIVE_AI_API_KEY')
  } catch (err) {
    console.error('[questions]', err)
    return Response.json({ error: 'Server misconfigured: missing GOOGLE_GENERATIVE_AI_API_KEY' }, { status: 500 })
  }

  let supabase: ReturnType<typeof createServerClient>
  try {
    supabase = createServerClient()
  } catch (err) {
    console.error('[questions]', err)
    return Response.json({ error: 'Server misconfigured: missing Supabase environment variables' }, { status: 500 })
  }

  const quota = await checkAndIncrementDailyQuota(supabase)
  if (!quota.allowed) {
    const response: QuotaExceededResponse = { error: 'quota_exceeded', used: quota.used, limit: quota.limit, resetAt: quota.resetAt }
    return Response.json(response, { status: 429 })
  }

  let questionsModel: z.infer<typeof QuestionsModelSchema>
  try {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: QuestionsModelSchema,
      system: buildQuestionsSystemPrompt(),
      prompt: buildQuestionsUserPrompt(confirmedModel),
      temperature: 0.4,
    })
    questionsModel = result.object
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      console.error('[questions] Model output failed schema validation:', err.cause)
      return Response.json({ error: 'Model returned an unexpected shape' }, { status: 502 })
    }
    console.error('[questions] Gemini call failed:', err)
    return Response.json({ error: 'Failed to generate questions' }, { status: 502 })
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
