import { NextResponse, type NextRequest } from 'next/server'
import { getSessionPatientId } from '@/lib/patient'
import { prisma } from '@/lib/prisma'
import { getClinician } from '@/data/clinicians'
import { isBookable, nameKey } from '@/lib/publicClinicians'
import { canChooseFor } from '@/lib/clinicianChoice'
import { assignTherapistForTrack } from '@/lib/matching'
import { getMemberEssentials, missingEssentials } from '@/lib/memberOnboarding'

export const dynamic = 'force-dynamic'

/**
 * Booking straight from a clinician's website profile, once signed in: attach
 * that clinician for their care type (only when none is attached yet), then
 * open the first session, where the member picks a time before paying.
 * Missing personal details are collected first (/welcome comes back here).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const to = (path: string) => {
    const res = NextResponse.redirect(new URL(path, req.url))
    res.cookies.delete('gc_book_clinician')
    return res
  }

  const userId = await getSessionPatientId()
  if (!userId) return to('/app')
  const c = getClinician(slug)
  if (!c || !(await isBookable(slug))) return to(c ? `/clinicians/${slug}` : '/app/billing')

  const essentials = await getMemberEssentials(userId)
  if (essentials && missingEssentials(essentials).length > 0) return NextResponse.redirect(new URL('/welcome', req.url))

  const track = c.type === 'Psychiatrist' ? 'psychiatry' : 'therapy'
  if (await canChooseFor(userId, track)) {
    // The public directory is tied to admin records by name (lib/publicClinicians).
    const rows = await prisma.therapistProfile
      .findMany({ where: { isActive: true }, select: { id: true, user: { select: { name: true } } } })
      .catch(() => [])
    const match = rows.find((r) => nameKey(r.user?.name ?? '') === nameKey(c.name))
    if (match) await assignTherapistForTrack(userId, track, match.id).catch(() => {})
  }
  return to(`/app/billing?track=${track}`)
}
