import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/lib/session'
import { getMemberEssentials, missingEssentials } from '@/lib/memberOnboarding'
import { getClinician } from '@/data/clinicians'
import { isBookable } from '@/lib/publicClinicians'
import { MemberEssentialsForm } from '@/components/auth/MemberEssentialsForm'
import { safeNext } from '@/lib/safeNext'
import PhotoShell from '@/components/assessment/PhotoShell'

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
  const forResults = !booking && !forChoice && Boolean(next && (next.startsWith('/assess/results') || next === '/app/therapist' || next.startsWith('/app/billing')))

  const essentials = await getMemberEssentials(user.id)
  if (!essentials || missingEssentials(essentials).length === 0) redirect(nextUrl)

  const firstName = booking ? booking.name.split(' ').slice(0, 2).join(' ') : null
  return (
    <PhotoShell eyebrow={booking ? `Booking with ${firstName}` : 'Almost there'}>
      <div className="pa-inner pa-inner-q">
        <p className="pa-eyebrow">{forResults ? 'Last step' : 'Almost there'}</p>
        <h1 className="pa-q">
          {forResults
            ? <>One last step before <em>your matches.</em></>
            : <>A few details <em>about you.</em></>}
        </h1>
        <p className="pa-hint">
          {booking
            ? `So ${firstName} can look after you properly. Then you will pick your package. You will only be asked once.`
            : forChoice
              ? 'So your clinician can look after you properly. Then you can confirm your choice. You will only be asked once.'
              : 'So your clinician can look after you properly. It takes a few seconds, and you will only be asked once.'}
        </p>
        <MemberEssentialsForm
          nextUrl={nextUrl}
          initial={{
            name: essentials.name,
            email: essentials.email,
            phone: essentials.phone,
            dateOfBirth: essentials.dateOfBirth,
            gender: essentials.gender === 'unknown' ? null : essentials.gender,
          }}
        />
      </div>
    </PhotoShell>
  )
}
