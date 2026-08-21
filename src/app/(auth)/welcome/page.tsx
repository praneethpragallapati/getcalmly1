import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { getMemberEssentials, missingEssentials } from '@/lib/memberOnboarding'
import { MemberEssentialsForm } from '@/components/auth/MemberEssentialsForm'

export const metadata = {
  title: 'A few details',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/**
 * The one-time form that captures what a care account cannot run without.
 *
 * Accounts are created by the OTP providers with only a phone or an email, so a
 * new member arrives with no name, no date of birth and no emergency contact.
 * This is where those are collected, once, before the dashboard opens.
 *
 * Anyone whose details are already complete is sent straight on, so this can be
 * linked to safely and never becomes a dead end.
 */
export default async function WelcomePage() {
  const user = await getSessionUser()
  if (!user?.id) redirect('/login')
  if (user.role === 'THERAPIST') redirect('/expert')
  if (user.role === 'ADMIN') redirect('/admin')

  const essentials = await getMemberEssentials(user.id)
  if (!essentials || missingEssentials(essentials).length === 0) redirect('/app')

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <h1 style={{
        fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32,
        color: '#1C2B3A', marginBottom: 8, lineHeight: 1.1,
      }}>
        A few details before we start.
      </h1>
      <p style={{ fontSize: 14.5, color: '#5F6E7D', lineHeight: 1.65, marginBottom: 24 }}>
        We need these to look after you properly — including someone we can reach if we&apos;re ever
        worried about your safety. It takes a minute and you won&apos;t be asked again.
      </p>
      <MemberEssentialsForm
        initial={{
          name: essentials.name,
          email: essentials.email,
          hasPhone: Boolean(essentials.phone),
          dateOfBirth: essentials.dateOfBirth,
          emergencyName: essentials.emergencyName,
          emergencyPhone: essentials.emergencyPhone,
        }}
      />
    </div>
  )
}
