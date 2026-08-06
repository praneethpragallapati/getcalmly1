import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Auth gate for the three signed-in areas (#4): unauthenticated requests are
// bounced to /login before any protected route renders. Kept deliberately
// LIGHTWEIGHT — token decode only, no database and no Prisma import. (A previous
// version queried Prisma here for a fresh role; that adds a DB round-trip to
// every request and is fragile in the proxy runtime, so ROLE pinning now lives
// in each area's layout, which reads the role fresh from the DB via the session
// callback. This file only answers "is this request signed in?".)
export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/expert/:path*', '/admin/:path*', '/change-password'],
}
