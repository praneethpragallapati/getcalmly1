import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyOtp } from '@/lib/msg91'
import { verifyEmailOtp } from '@/lib/email'
import { verifyPassword } from '@/lib/password'

export const authOptions: NextAuthOptions = {
  // Credentials providers require JWT sessions (DB sessions are not supported
  // for them), so the whole app uses JWT.
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
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

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !verifyPassword(password, user.passwordHash)) return null

        return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined }
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
        token.role = dbUser?.role ?? 'PATIENT'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        ;(session.user as { id?: string; role?: string }).id = token.uid as string
        ;(session.user as { id?: string; role?: string }).role = token.role as string
      }
      return session
    },
  },
}
