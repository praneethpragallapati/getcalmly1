import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import { authOptions } from '@/lib/auth'
import { mustChangePassword } from '@/lib/accountSecurity'
import { ChangePasswordForm } from '@/components/site/ChangePasswordForm'

export const metadata: Metadata = { title: 'Change password | GetCalmly', robots: { index: false, follow: false } }

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect('/login')
  const forced = await mustChangePassword(userId)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: '#FFFCFA', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 22, padding: '36px 34px', border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 20px 56px rgba(28,43,58,.08)' }}>
        <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 28, color: '#1C2B3A', marginBottom: 8 }}>
          {forced ? 'Set your password' : 'Change your password'}
        </h1>
        <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6, marginBottom: 24 }}>
          {forced
            ? 'Your account was created with a temporary password. Choose a new one to finish setting up and reach your dashboard.'
            : 'Update the password you use to sign in.'}
        </p>
        <ChangePasswordForm forced={forced} />
      </div>
    </div>
  )
}
