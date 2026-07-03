import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { buildSynthesizeSystemPrompt, buildSynthesizeUserPrompt } from '@/lib/prompts/synthesize'
import { requireEnv } from '@/lib/env'
import type { SynthesisResponse } from '@/lib/types'

export const maxDuration = 60

const RequestSchema = z.object({
  description: z.string().trim().min(30, 'Description must be at least 30 characters'),
})

const DraftModelSchema = z.object({
  product_name: z.string().min(1),
  narration: z.array(z.string()).min(1),
  elements: z.array(z.object({
    element_type: z.enum(['activity', 'feature', 'journey', 'screen', 'system']),
    label: z.string().min(1),
    status: z.literal('inferred'),
    is_negative: z.boolean(),
    confidence: z.enum(['high', 'moderate', 'low']),
  })),
  triggered_areas: z.array(z.object({
    area_code: z.string().min(1),
    area_name: z.string().min(1),
    status: z.enum(['triggered', 'not_triggered', 'not_applicable']),
    reason: z.string().min(1),
    signals: z.array(z.string()),
  })),
})

function stripCodeFence(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsedRequest = RequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return Response.json(
      { error: parsedRequest.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    )
  }
  const { description } = parsedRequest.data

  try {
    requireEnv('GOOGLE_GENERATIVE_AI_API_KEY')
  } catch (err) {
    console.error('[synthesize]', err)
    return Response.json({ error: 'Server misconfigured: missing GOOGLE_GENERATIVE_AI_API_KEY' }, { status: 500 })
  }

  let rawText: string
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      system: buildSynthesizeSystemPrompt(),
      prompt: buildSynthesizeUserPrompt(description),
      temperature: 0.4,
    })
    rawText = result.text
  } catch (err) {
    console.error('[synthesize] Gemini call failed:', err)
    return Response.json({ error: 'Failed to analyse product description' }, { status: 502 })
  }

  let parsedModel: unknown
  try {
    parsedModel = JSON.parse(stripCodeFence(rawText))
  } catch {
    console.error('[synthesize] Failed to parse model JSON:', rawText)
    return Response.json({ error: 'Failed to parse model response' }, { status: 502 })
  }

  const validated = DraftModelSchema.safeParse(parsedModel)
  if (!validated.success) {
    console.error('[synthesize] Model output failed validation:', validated.error.issues)
    return Response.json({ error: 'Model returned an unexpected shape' }, { status: 502 })
  }
  const model = validated.data

  let supabase: ReturnType<typeof createServerClient>
  try {
    supabase = createServerClient()
  } catch (err) {
    console.error('[synthesize]', err)
    return Response.json({ error: 'Server misconfigured: missing Supabase environment variables' }, { status: 500 })
  }

  const { data: inserted, error: dbError } = await supabase
    .from('assessments')
    .insert({ product_name: model.product_name, description })
    .select('id')
    .single()

  if (dbError || !inserted) {
    console.error('[synthesize] Failed to persist assessment:', dbError)
    return Response.json({ error: 'Failed to save assessment' }, { status: 500 })
  }

  const response: SynthesisResponse = {
    assessment_id: inserted.id,
    model,
  }
  return Response.json(response)
}
