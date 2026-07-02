import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { z } from 'zod'
import { buildQuestionsSystemPrompt, buildQuestionsUserPrompt } from '@/lib/prompts/questions'
import type { ConfirmedModel, Question, QuestionsResponse } from '@/lib/types'

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
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  const confirmedModel = parsedRequest.data.confirmedModel as ConfirmedModel

  let rawText: string
  try {
    const result = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system: buildQuestionsSystemPrompt(),
      prompt: buildQuestionsUserPrompt(confirmedModel),
      temperature: 0.4,
    })
    rawText = result.text
  } catch (err) {
    console.error('[questions] Claude call failed:', err)
    return Response.json({ error: 'Failed to generate questions' }, { status: 502 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(stripCodeFence(rawText))
  } catch {
    console.error('[questions] Failed to parse model JSON:', rawText)
    return Response.json({ error: 'Failed to parse model response' }, { status: 502 })
  }

  const validated = QuestionsModelSchema.safeParse(parsed)
  if (!validated.success) {
    console.error('[questions] Model output failed validation:', validated.error.issues)
    return Response.json({ error: 'Model returned an unexpected shape' }, { status: 502 })
  }

  const questions: Question[] = validated.data.questions.map((q, i) => ({
    id: crypto.randomUUID(),
    seq: i + 1,
    prompt: q.prompt,
    rationale: q.rationale,
    answer: null,
  }))

  const response: QuestionsResponse = { questions }
  return Response.json(response)
}
