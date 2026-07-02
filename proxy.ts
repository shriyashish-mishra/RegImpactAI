import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession'

// Next.js 16 renamed Middleware to Proxy — this file replaces what would
// have been middleware.ts in earlier versions. Defaults to the Node.js
// runtime (as of v16), so node:crypto in lib/adminSession.ts works here.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
