import { z } from 'zod'
import { cookies } from 'next/headers'
import { requireEnv } from '@/lib/env'
import { verifyAdminPassword, createAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/adminSession'

const BodySchema = z.object({
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    requireEnv('ADMIN_PASSWORD')
  } catch (err) {
    console.error('[admin/login]', err)
    return Response.json({ error: 'Server misconfigured: missing ADMIN_PASSWORD' }, { status: 500 })
  }

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

  if (!verifyAdminPassword(parsed.data.password)) {
    return Response.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ ok: true })
}
