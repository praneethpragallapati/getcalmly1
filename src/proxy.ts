import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

// Central auth + role gate for the three signed-in areas (#4). Runs (nodejs
// runtime in Next 16) before any protected route renders: unauthenticated
// requests go to /login, and each role is pinned to its own dashboard on EVERY
// request (initial load and the RSC fetches behind soft navigation), so one
// account can never straddle two dashboards.
//
// Role is read FRESH FROM THE DB by the stable user id — not from the JWT. JWT
// sessions bake the role in at login, so trusting token.role meant a role change
// only took effect after a manual re-login, and a stale token kept misrouting an
// account to its old dashboard. Keying off the DB makes a role change take effect
// on the very next request and lets stale sessions self-heal. (One indexed
// primary-key lookup per protected request; fine at this scale, and it can be
// given a short in-memory TTL later if it ever shows up in profiling.)
export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  const uid = (token as { uid?: string }).uid
  let role = (token as { role?: string }).role
  if (uid) {
    try {
      const u = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } })
      if (u?.role) role = u.role
    } catch {
      // DB hiccup: fall back to the token's role rather than lock everyone out.
    }
  }

  // A role with no match (or undefined, e.g. a legacy token) is treated as PATIENT.
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
