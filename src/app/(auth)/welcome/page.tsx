import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/session'
import { getMemberEssentials, missingEssentials } from '@/lib/memberOnboarding'
import { getClinician } from '@/data/clinicians'
import { isBookable } from '@/lib/publicClinicians'
import { MemberEssentialsForm } from '@/components/auth/MemberEssentialsForm'
import { safeNext } from '@/lib/safeNext'

export const metadata = {
  title: 'A few details',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/**
 * The one-time form that captures what a care account cannot run without.
 * No longer asked at sign-in: it sits right before assessment results and
 * right after choosing a clinician, and returns to `?next` when done.
 *
 * Accounts are created by the OTP providers with only a phone or an email, so a
 * new member arrives with no name, no date of birth and no emergency contact.
 * This is where those are collected, once, before the dashboard opens.
 *
 * Anyone whose details are already complete is sent straight on, so this can be
 * linked to safely and never becomes a dead end.
 */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  // Asked at two moments only: the last step before assessment results
  // (?next=/assess/results or /app/therapist) and after choosing a clinician
  // (direct booking from a profile, or picking one in the app).
  const next = safeNext((await searchParams).next)
  const user = await getSessionUser()
  if (!user?.id) redirect(`/login?next=${encodeURIComponent(`/welcome${next ? `?next=${encodeURIComponent(next)}` : ''}`)}`)
  if (user.role === 'THERAPIST') redirect('/expert')
  if (user.role === 'ADMIN') redirect('/admin')

  // A direct booking (from a clinician's profile) stashes the chosen clinician
  // in this cookie. When present, we forward to checkout instead of the
  // dashboard once details are complete — that's the assessment/match bypass.
  const bookingSlug = (await cookies()).get('gc_book_clinician')?.value
  // A clinician an admin has since hidden from direct booking is not honoured.
  const booking = bookingSlug && (await isBookable(bookingSlug)) ? getClinician(bookingSlug) : undefined
  const nextUrl = booking ? `/checkout?care=${booking.type === 'Psychiatrist' ? 'psychiatry' : 'therapy'}` : next ?? '/app'
  const forChoice = !booking && Boolean(next && next.startsWith('/app/therapist/browse'))
  const forResults = !booking && !forChoice && Boolean(next && (next.startsWith('/assess/results') || next === '/app/therapist'))

  const essentials = await getMemberEssentials(user.id)
  if (!essentials || missingEssentials(essentials).length === 0) redirect(nextUrl)

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <h1 style={{
        fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 32,
        color: '#1C2B3A', marginBottom: 8, lineHeight: 1.1,
      }}>
        {forResults ? 'One last step before your matches.' : forChoice ? 'Almost there.' : 'A few details before we start.'}
      </h1>
      <p style={{ fontSize: 14.5, color: '#5F6E7D', lineHeight: 1.65, marginBottom: 24 }}>
        {booking
          ? `Just a few details so ${booking.name.split(' ').slice(0, 2).join(' ')} can look after you properly, then you'll pick your package. You won't be asked again.`
          : forResults
            ? 'A few details so your clinician can look after you properly, including someone we can reach if we ever need to. It takes a minute, and you won’t be asked again.'
            : forChoice
              ? 'A few details so your clinician can look after you properly, then you can confirm your choice. It takes a minute, and you won’t be asked again.'
              : 'We need these to look after you properly, including someone we can reach if we ever need to. It takes a minute and you won’t be asked again.'}
      </p>
      <MemberEssentialsForm
        nextUrl={nextUrl}
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
