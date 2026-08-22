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
import { clinicianMatchesTrack, type CareTrack } from '@/lib/clinicianScope'

export { clinicianMatchesTrack, type CareTrack } from '@/lib/clinicianScope'

const ASSIGN_COLUMN: Record<CareTrack, 'assignedTherapistIndividualId' | 'assignedTherapistCouplesId' | 'assignedTherapistPsychiatryId'> = {
  therapy: 'assignedTherapistIndividualId',
  couples: 'assignedTherapistCouplesId',
  psychiatry: 'assignedTherapistPsychiatryId',
}

// Broaden each concern tag to the words that tend to appear in a clinician's
// specialization list, so "anxiety" matches "Anxiety", "CBT", "panic", etc.
// Keys cover BOTH the register slugs and the detailed /assess tag vocabulary.
const CONCERN_KEYWORDS: Record<string, string[]> = {
  anxiety: ['anxiety', 'anxious', 'cbt', 'panic', 'worry'],
  panic: ['panic', 'anxiety'],
  depression: ['depression', 'depressive', 'low mood', 'mood'],
  'low-mood': ['depression', 'low mood', 'mood'],
  stress: ['stress', 'burnout', 'work'],
  'work-stress': ['stress', 'work', 'burnout', 'career'],
  burnout: ['burnout', 'stress'],
  career: ['career', 'work', 'stress'],
  relationships: ['relationship', 'couple', 'marital', 'communication', 'eft'],
  couples: ['couple', 'marital', 'communication', 'eft'],
  communication: ['communication', 'couple'],
  trust: ['couple', 'relationship'],
  separation: ['couple', 'relationship'],
  'pre-marital': ['couple', 'marital'],
  family: ['family', 'relationship'],
  conflict: ['conflict', 'anger', 'couple'],
  loneliness: ['loneliness', 'depression'],
  'self-worth': ['self-worth', 'self-esteem', 'confidence', 'self worth'],
  'self-esteem': ['self-esteem', 'self-worth', 'confidence'],
  confidence: ['confidence', 'self-esteem'],
  sleep: ['sleep', 'insomnia'],
  grief: ['grief', 'loss', 'bereavement'],
  loss: ['grief', 'loss'],
  trauma: ['trauma', 'grief', 'ptsd', 'loss', 'bereavement'],
  'life-transitions': ['life', 'transition', 'adjustment'],
  anger: ['anger', 'emotion regulation', 'emotion'],
  postpartum: ['postpartum', 'perinatal', 'maternal', 'motherhood'],
  medication: ['medication', 'psychiatr'],
  psychiatry: ['psychiatr', 'medication'],
  ocd: ['ocd', 'anxiety'],
  bipolar: ['bipolar', 'mood', 'psychiatr'],
  adhd: ['adhd', 'attention', 'focus'],
  child: ['child', 'paediatric', 'adolescent'],
  adolescent: ['adolescent', 'teen', 'child'],
  'exam-stress': ['academic', 'exam', 'school', 'stress'],
  academic: ['academic', 'school'],
  school: ['school', 'academic'],
  behaviour: ['behaviour', 'child'],
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

  // CONTINUITY FIRST. Scoring alone has no memory, so a member whose package
  // lapsed and who then bought again could be handed a different clinician than
  // the one they had been telling their story to. In therapy that is not a
  // neutral reshuffle — it is starting over. If they already have someone for
  // this track and that person is still active, verified and eligible, they keep
  // them, whatever the score says.
  const previous = await previousTherapistForTrack(userId, track)
  if (previous && eligible.some((c) => c.id === previous)) return previous

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
  } catch (e) {
    // Don't fail the purchase that called us, but DON'T swallow silently either:
    // a missing 0015 column would otherwise make auto-assignment vanish with no
    // trace. Surface it so a migration-drift deploy is diagnosable from logs.
    console.error(`[matchAndAssignForTrack] could not attach expert to ${track} package (migration 0015 applied?)`, e)
  }

  // Per-care-type assignment only (needs migration 0016). We deliberately do NOT
  // touch the global default `assignedTherapistId` here: a psychiatry match must
  // never leak into the Individual slot via the default fallback. The global
  // default stays an admin-managed field.
  try {
    const col = ASSIGN_COLUMN[track]
    await prisma.patientProfile.update({
      where: { userId },
      data: { [col]: therapistId },
    })
  } catch (e) {
    console.error(`[matchAndAssignForTrack] could not write ${track} assignment column (migration 0016 applied?)`, e)
  }

  return therapistId
}

/**
 * The clinician this member already has for `track`, if any.
 *
 * Two sources, most authoritative first: the per-care-type assignment column,
 * then the most recent appointment for that track. The assignment column is
 * never cleared when a package lapses precisely so this lookup still works —
 * see hasEffectiveCareTeam in lib/crisisReport, which gates on validity instead
 * of erasing the record.
 *
 * Read defensively: no memory is a reason to fall back to scoring, never a
 * reason to fail the purchase that called us.
 */
async function previousTherapistForTrack(userId: string, track: CareTrack): Promise<string | null> {
  try {
    const col = ASSIGN_COLUMN[track]
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { [col]: true } as Record<string, true>,
    })
    const assigned = (profile as Record<string, unknown> | null)?.[col]
    if (typeof assigned === 'string' && assigned) return assigned
  } catch (e) {
    console.error('[previousTherapistForTrack] assignment column unreadable (migration 0016?)', e)
  }
  try {
    const last = await prisma.appointment.findFirst({
      where: { patientId: userId, therapist: { is: {} } },
      orderBy: { scheduledAt: 'desc' },
      select: { therapistId: true },
    })
    return last?.therapistId ?? null
  } catch {
    return null
  }
}
