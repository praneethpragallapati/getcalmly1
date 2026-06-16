import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyOtp } from '@/lib/msg91'

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

        // The OTP is verified against MSG91 here — only a genuinely verified
        // code lets us mint a session, so this endpoint is the trust boundary.
        const result = await verifyOtp(mobile, otp)
        if (!result.ok) return null

        // Upsert the user by phone. Profile details (patientId, couple id,
        // address, etc.) are filled in by the registration wizard separately.
        const phone = `+${mobile}`
        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone, role: 'PATIENT' },
        })
        return { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined }
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        ;(session.user as { id?: string }).id = token.uid as string
      }
      return session
    },
  },
}
