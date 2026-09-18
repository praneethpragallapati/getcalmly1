import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyOtp } from '@/lib/msg91'
import { verifyEmailOtp } from '@/lib/email'
import { verifyPassword } from '@/lib/password'
import { ensureDemoCaseload } from '@/lib/demoBootstrap'

// Google is only offered when its OAuth credentials are configured, so we never
// register a broken provider (the sign-in buttons are hidden to match — see
// getProviders() on the login/register pages).
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

// TEMPORARY test backdoor: entering this phone number (digits only, +91) signs
// straight into the existing Priya dashboard — which is the email account below
// — with no OTP. Delete this (and the matching shortcut in the login page)
// before real use, or gate it behind an env flag.
export const OTP_BYPASS_MOBILE = '918884518688'
export const OTP_BYPASS_EMAIL = 'praneethpragallapati@gmail.com'
// TEMPORARY: dedicated test accounts allowed to sign in by email with no OTP.
// Each maps to the role it should have; the bypass creates/promotes the account
// (and, for the therapist, a minimal profile) so a fresh deployment works
// without a manual reseed. Delete this whole mechanism before real use.
export const OTP_BYPASS_ROLES: Record<string, 'ADMIN' | 'THERAPIST'> = {
  'hom.pragallapati@gmail.com': 'THERAPIST', // therapist test account
  'praneethadmin@gmail.com': 'ADMIN', // admin test account
}
export const OTP_BYPASS_EMAILS = new Set<string>(Object.keys(OTP_BYPASS_ROLES))

/**
 * Short-lived cache of a user's role, so the session callback doesn't hit the DB
 * on every single request. Role changes (admin-side) still apply within
 * ROLE_TTL_MS. This lives on the server instance and is naturally per-instance on
 * serverless — a brief, bounded staleness in exchange for cutting one DB
 * round-trip off the hot path of every authenticated request.
 */
const ROLE_TTL_MS = 30_000
const roleCache = new Map<string, { role: string; adminType: string | null; exp: number }>()

async function freshRole(
  userId: string,
  fallback: string | undefined,
  fallbackAdminType?: string | null,
): Promise<{ role: string | undefined; adminType: string | null }> {
  const now = Date.now()
  const hit = roleCache.get(userId)
  if (hit && hit.exp > now) return { role: hit.role, adminType: hit.adminType }
  // adminType rides along on the SAME round trip as the role. But it is a newer
  // column, so a database without it must not cost anyone their session: on
  // failure we retry for the role ALONE and treat the sub-role as unset (which
  // means full access — exactly what every admin had before sub-roles existed).
  try {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, adminType: true } })
    if (u?.role) {
      roleCache.set(userId, { role: u.role, adminType: u.adminType ?? null, exp: now + ROLE_TTL_MS })
      return { role: u.role, adminType: u.adminType ?? null }
    }
  } catch {
    try {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
      if (u?.role) {
        roleCache.set(userId, { role: u.role, adminType: null, exp: now + ROLE_TTL_MS })
        return { role: u.role, adminType: null }
      }
    } catch {
      /* keep the fallback on a real DB hiccup */
    }
  }
  return { role: fallback, adminType: fallbackAdminType ?? null }
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
        if (!mobile) return null

        // TEMPORARY test shortcut: this one number signs straight into the
        // Praneeth account (keyed by its email), with no OTP. Creates the account
        // if missing and assigns it to the Riya test therapist. Remove this
        // block — and the matching shortcut in the login page — before real use.
        if (mobile === OTP_BYPASS_MOBILE) {
          const praneeth = await prisma.user.upsert({
            where: { email: OTP_BYPASS_EMAIL },
            update: {},
            create: { email: OTP_BYPASS_EMAIL, role: 'PATIENT', name: 'Praneeth' },
            select: { id: true, name: true, email: true },
          })
          await ensureDemoCaseload().catch(() => {})
          return { id: praneeth.id, name: praneeth.name ?? undefined, email: praneeth.email ?? undefined }
        }

        if (!otp) return null
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
        if (!email) return null

        // TEMPORARY: these dedicated test accounts sign in by email with no OTP.
        // The bypass creates the account (and promotes it to the mapped role) so
        // a fresh deployment works without a manual reseed. Remove this block
        // (and the login-page shortcut) before real use.
        if (OTP_BYPASS_EMAILS.has(email)) {
          const role = OTP_BYPASS_ROLES[email]
          const u = await prisma.user.upsert({
            where: { email },
            update: { role },
            create: {
              email,
              role,
              name: role === 'ADMIN' ? 'Praneeth (Admin)' : 'Dr. Riya Lokesh',
            },
            select: { id: true, name: true, email: true },
          })
          // A therapist needs a profile or the expert dashboard has nothing to
          // read. Create a minimal one once; leave it alone if it already exists.
          if (role === 'THERAPIST') {
            await prisma.therapistProfile
              .upsert({
                where: { userId: u.id },
                update: {},
                create: {
                  userId: u.id,
                  bio: 'RCI-registered clinical psychologist working with anxiety, relationships and life transitions.',
                  qualifications: ['PhD Clinical Psychology', 'M.Phil Clinical Psychology (RCI)'],
                  yearsExp: 10,
                  languages: ['English', 'Hindi'],
                  specializations: ['Anxiety', 'Depression', 'Couples'],
                  rciNumber: 'A100010',
                  sessionFee: 1200,
                  gender: 'Female',
                  clinicianType: 'Therapist',
                  isVerified: true,
                  isActive: true,
                },
              })
              .catch(() => {})
            // Wire the demo patient (Praneeth) onto Riya's caseload now that her
            // profile exists.
            await ensureDemoCaseload().catch(() => {})
          }
          return { id: u.id, name: u.name ?? undefined, email: u.email ?? undefined }
        }

        if (!otp) return null
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
        // Deliberately does NOT select adminType. This query is the critical
        // path for every sign-in, and selecting a column the database might not
        // have yet (an unapplied migration) throws here and locks everyone out.
        // adminType is resolved in the session callback, which fails soft.
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
        const fresh = await freshRole(id, token.role as string | undefined, token.adminType as string | null)
        const su = session.user as { id?: string; role?: string; adminType?: string | null }
        su.role = fresh.role
        su.adminType = fresh.adminType
      }
      return session
    },
  },
}
