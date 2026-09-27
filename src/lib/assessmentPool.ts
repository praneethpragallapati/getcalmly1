/**
 * The clinicians a pre-assessment can be matched against: every active,
 * verified clinician on the platform, with the specializations they picked.
 * Falls back to the site's sample profiles when the platform has none yet (a
 * fresh environment), so the results page never comes back empty.
 */
import { prisma } from '@/lib/prisma'
import { isPsychiatrist } from '@/lib/clinicianScope'
import { therapists as sampleTherapists } from '@/data/therapists'
import type { MatchCandidate } from '@/data/assessmentMatch'
import { getTherapistExtras, EXTRAS_DEFAULT } from '@/lib/therapistExtras'

export type PoolClinician = MatchCandidate & {
  initials: string
  sessionFee: number
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

function genderOf(g: string | null | undefined): 'female' | 'male' | null {
  const v = (g ?? '').toLowerCase()
  return v === 'female' ? 'female' : v === 'male' ? 'male' : null
}

export async function getMatchPool(): Promise<PoolClinician[]> {
  try {
    const rows = await prisma.therapistProfile.findMany({
      where: { isActive: true, isVerified: true },
      select: {
        id: true, clinicianType: true, specializations: true, languages: true, gender: true,
        yearsExp: true, rating: true, sessionFee: true, user: { select: { name: true } },
      },
    })
    if (rows.length > 0) {
      // Results offer new relationships, so only matching-eligible clinicians.
      // The sample fallback is for a platform with no clinicians at all, never
      // for one where an admin has switched them all off matching.
      const extras = await getTherapistExtras(rows.map((r) => r.id))
      return rows.filter((r) => (extras.get(r.id) ?? EXTRAS_DEFAULT).matchingEligible).map((r) => {
        const psych = isPsychiatrist(r.clinicianType, r.specializations)
        const name = r.user?.name ?? 'Clinician'
        return {
          id: r.id, name, initials: initialsOf(name),
          designation: psych ? 'Consultant Psychiatrist' : r.clinicianType && r.clinicianType !== 'Therapist' ? r.clinicianType : 'Clinical Psychologist',
          isPsychiatrist: psych,
          specializations: r.specializations, languages: r.languages, gender: genderOf(r.gender),
          yearsExp: r.yearsExp, rating: r.rating, sessionFee: r.sessionFee, licence: psych ? 'NMC' : 'RCI',
        }
      })
    }
  } catch {
    // No database (or a query failure): fall through to the sample profiles.
  }
  return sampleTherapists.map((t) => {
    const psych = t.designation.includes('Psychiatrist')
    return {
      id: t.id, name: t.name, initials: t.initials, designation: t.designation, isPsychiatrist: psych,
      specializations: [...t.specializations, ...t.tags], languages: t.languages, gender: t.gender,
      yearsExp: t.yearsExp, rating: t.rating, sessionFee: t.sessionFee, licence: psych ? 'NMC' : 'RCI',
    }
  })
}
