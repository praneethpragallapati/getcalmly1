/**
 * Therapist auto-matching. When a patient buys a package we attach the
 * best-fit clinician of that package's type, scored from the patient's
 * assessment (their concerns + preferred language). Admin can always override.
 *
 * "Assessment" here = the patient has told us their concerns (PatientProfile
 * .track is non-empty). Matching is only meaningful once that's on file, which
 * is why the buy flow requires the assessment first.
 */
import { prisma } from '@/lib/prisma'

export type CareTrack = 'therapy' | 'couples' | 'psychiatry'

const ASSIGN_COLUMN: Record<CareTrack, 'assignedTherapistIndividualId' | 'assignedTherapistCouplesId' | 'assignedTherapistPsychiatryId'> = {
  therapy: 'assignedTherapistIndividualId',
  couples: 'assignedTherapistCouplesId',
  psychiatry: 'assignedTherapistPsychiatryId',
}

// Broaden each concern slug to the words that tend to appear in a clinician's
// specialization list, so "anxiety" matches "Anxiety", "CBT", "panic", etc.
const CONCERN_KEYWORDS: Record<string, string[]> = {
  anxiety: ['anxiety', 'anxious', 'cbt', 'panic', 'worry', 'ocd'],
  depression: ['depression', 'depressive', 'low mood', 'mood'],
  stress: ['stress', 'burnout', 'work'],
  relationships: ['relationship', 'couple', 'marital', 'communication', 'eft'],
  trauma: ['trauma', 'grief', 'ptsd', 'loss', 'bereavement'],
  sleep: ['sleep', 'insomnia'],
  'self-worth': ['self-worth', 'self-esteem', 'confidence', 'self worth'],
  anger: ['anger', 'emotion regulation', 'emotion'],
  postpartum: ['postpartum', 'perinatal', 'maternal', 'motherhood'],
}

/** Whether the patient has completed the assessment (concerns are on file). */
export async function hasAssessment(userId: string): Promise<boolean> {
  try {
    const p = await prisma.patientProfile.findUnique({ where: { userId }, select: { track: true } })
    return Boolean(p && p.track.length > 0)
  } catch {
    return false
  }
}

function isPsychiatrist(clinicianType: string | null, spec: string): boolean {
  const ct = (clinicianType ?? '').toLowerCase()
  return ct.includes('psychiatr') || spec.includes('psychiatr') || spec.includes('medication')
}
function isCouplesClinician(clinicianType: string | null, spec: string): boolean {
  const ct = (clinicianType ?? '').toLowerCase()
  return ct.includes('couple') || spec.includes('couple') || spec.includes('marital') || spec.includes('eft')
}

/** Does this clinician fit the requested care track? */
function clinicianMatchesTrack(clinicianType: string | null, specializations: string[], track: CareTrack): boolean {
  const spec = specializations.join(' ').toLowerCase()
  const psych = isPsychiatrist(clinicianType, spec)
  if (track === 'psychiatry') return psych
  if (track === 'couples') return isCouplesClinician(clinicianType, spec) && !psych
  // therapy: any non-psychiatrist clinician (psychologist / counsellor / therapist).
  return !psych
}

type Candidate = {
  id: string
  clinicianType: string | null
  specializations: string[]
  languages: string[]
  rating: number
  totalReviews: number
}

function scoreCandidate(c: Candidate, concerns: string[], language: string | null): number {
  const spec = c.specializations.join(' ').toLowerCase()
  let score = 0
  for (const concern of concerns) {
    const keys = CONCERN_KEYWORDS[concern] ?? [concern.toLowerCase()]
    if (keys.some((k) => spec.includes(k))) score += 3
  }
  if (language && c.languages.some((l) => l.toLowerCase() === language.toLowerCase())) score += 2
  score += Math.min(2, (c.rating || 0) * 0.4) // gentle quality tiebreaker
  return score
}

/**
 * Pick the best-fit active, verified clinician for a track from the patient's
 * assessment. Returns the TherapistProfile id, or null when none fit (e.g. a
 * psychiatry package but no psychiatrist on the platform yet).
 */
export async function matchTherapistForTrack(userId: string, track: CareTrack): Promise<string | null> {
  const [profile, candidates] = await Promise.all([
    prisma.patientProfile.findUnique({
      where: { userId },
      select: { track: true, subTrack: true, preferredLanguage: true },
    }),
    prisma.therapistProfile.findMany({
      where: { isActive: true, isVerified: true },
      select: { id: true, clinicianType: true, specializations: true, languages: true, rating: true, totalReviews: true },
    }),
  ])
  const concerns = [...(profile?.track ?? []), ...(profile?.subTrack ? [profile.subTrack] : [])].map((s) => s.toLowerCase())
  const language = profile?.preferredLanguage ?? null

  const eligible = candidates.filter((c) => clinicianMatchesTrack(c.clinicianType, c.specializations, track))
  if (eligible.length === 0) return null

  let best: Candidate | null = null
  let bestScore = -Infinity
  for (const c of eligible) {
    const s = scoreCandidate(c, concerns, language)
    if (s > bestScore || (s === bestScore && best && c.totalReviews > best.totalReviews)) {
      best = c
      bestScore = s
    }
  }
  return best?.id ?? null
}

/**
 * Match the best-fit clinician for `track` and persist the assignment: the
 * patient's per-care-type assignment column, the default assignment if unset,
 * and the active package of that type. Best-effort: assignment-column writes
 * are guarded so an un-applied migration can't fail the purchase that called us.
 * Returns the matched TherapistProfile id, or null when no clinician fit.
 */
export async function matchAndAssignForTrack(userId: string, track: CareTrack): Promise<string | null> {
  const therapistId = await matchTherapistForTrack(userId, track)
  if (!therapistId) return null

  // Attach to the active package(s) of this type (needs migration 0015).
  try {
    await prisma.subscription.updateMany({
      where: { userId, trackSlug: track, status: 'ACTIVE' },
      data: { therapistId },
    })
  } catch {
    /* subscription.therapistId not present yet — assignment still lands below */
  }

  // Per-care-type assignment + default fallback (needs migration 0016).
  try {
    const col = ASSIGN_COLUMN[track]
    const existing = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { assignedTherapistId: true },
    })
    await prisma.patientProfile.update({
      where: { userId },
      data: {
        [col]: therapistId,
        ...(existing?.assignedTherapistId ? {} : { assignedTherapistId: therapistId }),
      },
    })
  } catch {
    /* assignment columns not present yet */
  }

  return therapistId
}
