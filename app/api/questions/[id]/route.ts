import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

const BodySchema = z.object({
  answer: z.string().trim().min(1),
})

/**
 * Persists a single discovery answer as the user types it, so an answered
 * question survives a mid-flow refresh even though the wizard step itself
 * doesn't. Best-effort: the client already holds the answer in local state
 * and will send it to /api/generate regardless of whether this succeeds.
 */
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('questions')
      .update({ answer: parsed.data.answer })
      .eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('[questions/[id]] Failed to persist answer:', err)
    return Response.json({ ok: false }, { status: 200 })
  }

  return Response.json({ ok: true })
}
