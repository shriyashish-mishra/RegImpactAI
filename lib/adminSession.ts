import { createHmac, timingSafeEqual } from 'node:crypto'
import { requireEnv } from '@/lib/env'

/**
 * Lightweight single-owner admin gate for /admin (report history).
 * Not a multi-user auth system — this is a portfolio project with one
 * operator, so a signed, expiring cookie is enough. No new dependency,
 * no user table: the token is `${expiresAt}.${hmac(expiresAt)}`, verified
 * by recomputing the HMAC with a server-only secret.
 */

export const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function sign(payload: string): string {
  return createHmac('sha256', requireEnv('ADMIN_PASSWORD')).update(payload).digest('hex')
}

export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const payload = String(expiresAt)
  return `${payload}.${sign(payload)}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  if (Number(payload) < Date.now()) return false

  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = Buffer.from(requireEnv('ADMIN_PASSWORD'))
  const actual = Buffer.from(candidate)
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}
