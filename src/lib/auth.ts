import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyOtp } from '@/lib/msg91'
import { verifyEmailOtp } from '@/lib/email'
import { verifyPassword } from '@/lib/password'

// Google is only offered when its OAuth credentials are configured, so we never
// register a broken provider (the sign-in buttons are hidden to match — see
// getProviders() on the login/register pages).
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

/**
 * Short-lived cache of a user's role, so the session callback doesn't hit the DB
 * on every single request. Role changes (admin-side) still apply within
 * ROLE_TTL_MS. This lives on the server instance and is naturally per-instance on
 * serverless — a brief, bounded staleness in exchange for cutting one DB
 * round-trip off the hot path of every authenticated request.
 */
const ROLE_TTL_MS = 30_000
const roleCache = new Map<string, { role: string; exp: number }>()

async function freshRole(userId: string, fallback: string | undefined): Promise<string | undefined> {
  const now = Date.now()
  const hit = roleCache.get(userId)
  if (hit && hit.exp > now) return hit.role
  try {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (u?.role) {
      roleCache.set(userId, { role: u.role, exp: now + ROLE_TTL_MS })
      return u.role
    }
  } catch {
    /* keep fallback on a DB hiccup */
  }
  return fallback
}

export const authOptions: NextAuthOptions = {
  // Credentials providers require JWT sessions (DB sessions are not supported
  // for them), so the whole app uses JWT.
  session: { strategy: 'jwt' },
  providers: [
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        mobile: { label: 'Mobile', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const mobile = credentials?.mobile?.replace(/\D/g, '')
        const otp = credentials?.otp?.trim()
        if (!mobile || !otp) return null

        const result = await verifyOtp(mobile, otp)
        if (!result.ok) return null

        const phone = `+${mobile}`
        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone, role: 'PATIENT' },
          select: { id: true, name: true, email: true },
        })
        return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined }
      },
    }),
    CredentialsProvider({
      id: 'email-otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const otp = credentials?.otp?.trim()
        if (!email || !otp) return null

        const result = await verifyEmailOtp(email, otp)
        if (!result.ok) return null

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, role: 'PATIENT' },
          select: { id: true, name: true, email: true },
        })
        return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined }
      },
    }),
    CredentialsProvider({
      id: 'password',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password
        if (!email || !password) return null

        // Narrow select (never a full-row read): login must not break when the DB
        // is missing a newer column the Prisma schema knows about — a full-row
        // SELECT would throw and read as "invalid email or password" for everyone.
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, passwordHash: true },
        })
        if (!user || !verifyPassword(password, user.passwordHash)) return null

        return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined }
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Always resolve to a REAL DB user id. Credentials providers already
        // return one. OAuth (Google) returns the provider's account id, which is
        // NOT a user row — so we link by email to the existing account (or create
        // one). Without this, anything a Google-signed-in user buys or logs is
        // stored under a phantom id the admin (which lists real users) never sees.
        let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, role: true } })
        if (!dbUser && user.email) {
          const email = user.email.toLowerCase().trim()
          dbUser = await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, name: user.name ?? undefined, role: 'PATIENT' },
            select: { id: true, role: true },
          })
        }
        token.uid = dbUser?.id ?? user.id
        token.role = dbUser?.role ?? 'PATIENT'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        const id = token.uid as string
        ;(session.user as { id?: string; role?: string }).id = id
        // Role resolved fresh from the DB (not the stale JWT) so an admin-side
        // role change applies without a re-login — but cached for ROLE_TTL_MS so
        // we don't pay a DB round-trip on every request. Falls back to the
        // token's role on a DB hiccup so a blip never logs everyone out.
        ;(session.user as { id?: string; role?: string }).role = await freshRole(id, token.role as string | undefined)
      }
      return session
    },
  },
}
