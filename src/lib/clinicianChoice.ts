/**
 * First assignment of a clinician: "Match your clinician" (the assessment picks)
 * or "Browse your clinician" (the patient picks). This module backs the browse
 * side: who can be chosen, and the rules for choosing.
 *
 * Only for the INITIAL assignment of a care type. Once a clinician is attached
 * for that care type, the choice disappears and changes go through the care
 * team (or an admin), never through browsing.
 */
import { prisma } from '@/lib/prisma'
import { clinicianMatchesTrack, isPsychiatrist, type CareTrack } from '@/lib/clinicianScope'
import { getTherapistExtras, EXTRAS_DEFAULT } from '@/lib/therapistExtras'

export type SlotKey = 'individual' | 'couples' | 'psychiatry'

export const SLOT_TRACK: Record<SlotKey, CareTrack> = {
  individual: 'therapy',
  couples: 'couples',
  psychiatry: 'psychiatry',
}

export const SLOT_LABEL: Record<SlotKey, string> = {
  individual: 'Individual therapy',
  couples: 'Couples therapy',
  psychiatry: 'Psychiatry',
}

/** Where "Match your clinician" leads for each care type. `for` tells the
 *  assessment which care type it is matching for, so it can match before the
 *  first purchase and come back to it. */
export const MATCH_HREF: Record<SlotKey, string> = {
  // Individual covers adults and children, so it opens on the path picker.
  individual: '/app/assessment?for=therapy',
  couples: '/app/assessment?type=couple&for=couples',
  psychiatry: '/app/assessment?type=psychiatry&for=psychiatry',
}

export const TRACK_SLOT: Record<CareTrack, SlotKey> = {
  therapy: 'individual',
  couples: 'couples',
  psychiatry: 'psychiatry',
}

export function isSlotKey(v: unknown): v is SlotKey {
  return v === 'individual' || v === 'couples' || v === 'psychiatry'
}

export type BrowseClinician = {
  profileId: string
  name: string
  initials: string
  designation: string
  yearsExp: number
  languages: string[]
  specializations: string[]
  bio: string
  photoUrl: string | null
  licence: 'RCI' | 'NMC'
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter((w) => !/^(dr\.?|mr\.?|mrs\.?|ms\.?)$/i.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

/**
 * Clinicians a patient may pick for a care type: active, verified, open to
 * direct booking (the admin "Direct booking eligible" tick), and the right
 * kind of clinician for that care type.
 */
export async function getBrowsableClinicians(track: CareTrack): Promise<BrowseClinician[]> {
  try {
    const rows = await prisma.therapistProfile.findMany({
      where: { isActive: true, isVerified: true },
      select: {
        id: true, clinicianType: true, specializations: true, languages: true, yearsExp: true,
        bio: true, photoUrl: true, user: { select: { name: true } },
      },
    })
    // Psychiatry lists psychiatrists only; individual (adults and children) and
    // couples list therapists only, never a psychiatrist. Couples specialists
    // lead the couples list.
    const fit = rows.filter((r) => (track === 'psychiatry') === isPsychiatrist(r.clinicianType, r.specializations))
    const specialist = new Set(
      track === 'couples' ? fit.filter((r) => clinicianMatchesTrack(r.clinicianType, r.specializations, 'couples')).map((r) => r.id) : [],
    )
    const extras = await getTherapistExtras(fit.map((r) => r.id))
    return fit
      .filter((r) => (extras.get(r.id) ?? EXTRAS_DEFAULT).directBookingEligible)
      .map((r) => {
        const psych = isPsychiatrist(r.clinicianType, r.specializations)
        const name = r.user?.name ?? 'Clinician'
        return {
          profileId: r.id, name, initials: initialsOf(name),
          designation: psych ? 'Consultant Psychiatrist' : r.clinicianType && r.clinicianType !== 'Therapist' ? r.clinicianType : 'Clinical Psychologist',
          yearsExp: r.yearsExp, languages: r.languages, specializations: r.specializations,
          bio: r.bio ?? '', photoUrl: r.photoUrl ?? null, licence: psych ? 'NMC' : 'RCI',
        } satisfies BrowseClinician
      })
      .sort((a, b) =>
        Number(specialist.has(b.profileId)) - Number(specialist.has(a.profileId)) ||
        b.yearsExp - a.yearsExp || a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

const ASSIGN_COLUMN = {
  therapy: 'assignedTherapistIndividualId',
  couples: 'assignedTherapistCouplesId',
  psychiatry: 'assignedTherapistPsychiatryId',
} as const

/**
 * Whether the patient can still make the initial choice for this care type:
 * no clinician is attached for it yet. It does not need a package: the choice
 * comes first when buying, before the first session is paid for.
 */
export async function canChooseFor(userId: string, track: CareTrack): Promise<boolean> {
  try {
    const attached = await prisma.subscription.findFirst({
      where: { userId, trackSlug: track, status: 'ACTIVE', therapistId: { not: null } },
      select: { id: true },
    })
    if (attached) return false
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { [ASSIGN_COLUMN[track]]: true } as Record<string, true>,
    })
    const assigned = (profile as Record<string, unknown> | null)?.[ASSIGN_COLUMN[track]]
    return !(typeof assigned === 'string' && assigned)
  } catch {
    return false
  }
}
