import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Central auth gate for the three signed-in areas (#4). Previously there was no
// middleware/proxy at all — every layout guarded itself, so a new page could
// ship unguarded and a logged-out visitor could reach /app and see the blank
// preview. This runs (nodejs runtime in Next 16) before any protected route
// renders and bounces unauthenticated requests to /login, carrying the intended
// path as callbackUrl. Role-specific routing (patient vs expert vs admin) still
// lives in each area's own layout — this only enforces "must be signed in".
export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  // One account = one dashboard, enforced on EVERY request (initial load and the
  // RSC fetches behind soft client navigation) — not just on segment entry, which
  // a layout guard misses. Each role is pinned to its own area; a mismatched role
  // is sent home rather than allowed to wander and accumulate the wrong kind of
  // data. Sessions minted before roles were added to the token have no role and
  // are treated as PATIENT for backward compatibility.
  const role = (token as { role?: string }).role
  const home = role === 'ADMIN' ? '/admin' : role === 'THERAPIST' ? '/expert' : '/app'
  const areaOk =
    path.startsWith('/change-password') ||
    (path.startsWith('/app') && role !== 'ADMIN' && role !== 'THERAPIST') ||
    (path.startsWith('/expert') && role === 'THERAPIST') ||
    (path.startsWith('/admin') && role === 'ADMIN')
  if (!areaOk) return NextResponse.redirect(new URL(home, req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/expert/:path*', '/admin/:path*', '/change-password'],
}
