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
