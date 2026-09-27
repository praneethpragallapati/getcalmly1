/**
 * Which of the website's listed clinicians (data/clinicians) can be booked
 * directly right now.
 *
 * The public directory is hand-written content, not database rows, so each
 * listed clinician is tied to their admin record by name. An admin unticking
 * "Direct booking eligible" (or deactivating them) hides that clinician from
 * the directory, their profile page, the homepage card and the direct-booking
 * hand-off. Existing patients are unaffected. A listed clinician with no admin
 * record stays visible, and a database hiccup never hides anyone.
 */
import { prisma } from '@/lib/prisma'
import { clinicians, type Clinician } from '@/data/clinicians'

/** "Dr. Riya Lokesh" and "Dr Riya Lokesh" → "riya lokesh". */
export function nameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr|mr|mrs|ms)\.?\s+/, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function hiddenNames(): Promise<Set<string>> {
  try {
    const rows = await prisma.therapistProfile.findMany({
      where: { OR: [{ directBookingEligible: false }, { isActive: false }] },
      select: { user: { select: { name: true } } },
    })
    return new Set(rows.map((r) => nameKey(r.user?.name ?? '')).filter(Boolean))
  } catch {
    return new Set()
  }
}

export async function bookableClinicians(): Promise<Clinician[]> {
  const hidden = await hiddenNames()
  return clinicians.filter((c) => !hidden.has(nameKey(c.name)))
}

export async function isBookable(slug: string): Promise<boolean> {
  return (await bookableClinicians()).some((c) => c.slug === slug)
}

/** Slugs of listed clinicians that are currently hidden. */
export async function hiddenSlugs(): Promise<string[]> {
  const ok = new Set((await bookableClinicians()).map((c) => c.slug))
  return clinicians.filter((c) => !ok.has(c.slug)).map((c) => c.slug)
}
