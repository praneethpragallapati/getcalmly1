import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import '@/components/assessment/assess.css'
import BookFlow from '@/components/assessment/BookFlow'
import { getClinician } from '@/data/clinicians'
import { isBookable } from '@/lib/publicClinicians'
import { getSessionUser } from '@/lib/session'
import { getMemberEssentials, missingEssentials } from '@/lib/memberOnboarding'

// A personal step in a booking, no standalone search value.
export const metadata: Metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

/**
 * Book directly from a clinician's website profile: the assessment's "about
 * you" step, then sign-in by a code to the phone number just given, then
 * checkout with this clinician.
 */
export default async function BookClinicianPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getClinician(slug)
  if (!c) notFound()
  if (!(await isBookable(slug))) redirect(`/clinicians/${slug}`)
  const care = c.type === 'Psychiatrist' ? 'psychiatry' : 'therapy'

  // Signed in already: only the details still missing are asked; with none
  // missing, straight on to checkout.
  const user = await getSessionUser().catch(() => null)
  const member = user?.id && user.role !== 'THERAPIST' && user.role !== 'ADMIN' ? user : null
  const essentials = member?.id ? await getMemberEssentials(member.id) : null
  if (essentials && missingEssentials(essentials).length === 0) redirect(`/checkout?care=${care}`)

  return (
    <BookFlow
      slug={slug}
      clinicianName={c.name}
      care={care}
      accent={c.accent}
      signedIn={Boolean(member)}
      initial={{
        name: essentials?.name ?? '',
        email: essentials?.email ?? '',
        phone: essentials?.phone ?? '',
        dateOfBirth: essentials?.dateOfBirth ?? '',
        gender: essentials?.gender && essentials.gender !== 'unknown' ? essentials.gender : '',
      }}
    />
  )
}
