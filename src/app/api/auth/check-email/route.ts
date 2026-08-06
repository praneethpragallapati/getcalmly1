import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, clientIp } from '@/lib/rateLimit'

// Lightweight existence check used by the sign-up flow: if an email already has
// an account, the client redirects the person to sign in instead of registering.
// Returns { exists } only — never leaks any account details. Fails open (exists:
// false) so a DB hiccup never blocks sign-up.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: unknown }
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ exists: false })
    }
    // Throttle to blunt account enumeration at scale (fails open, like the rest
    // of this endpoint). 30 checks per IP per 10 min is plenty for real signup UX.
    if (!rateLimit(`checkemail:ip:${clientIp(req)}`, 30, 10 * 60 * 1000).ok) {
      return NextResponse.json({ exists: false })
    }
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    })
    return NextResponse.json({ exists: Boolean(user) })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
