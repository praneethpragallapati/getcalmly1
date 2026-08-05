import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { getSessionsView } from '@/lib/sessions'
import { designationOf } from '@/lib/expert'
import { clinicianMatchesTrack, type CareTrack } from '@/lib/matching'
import { isPsychiatrist } from '@/lib/clinicianScope'

/**
 * The patient's assigned expert (#2). Real data comes from the patient's most
 * recent appointment's therapist; otherwise a representative demo profile, in
 * keeping with the dashboard's DB-with-fallback pattern.
 */
export type MyTherapist = {
  name: string
  initials: string
  designation: string
  qualifications: string
  yearsExp: number
  languages: string[]
  specializations: string[]
  rating: number
  reviews: number
  rciVerified: boolean
  nmcVerified: boolean
  bio: string
  nextSessionWhen: string | null
  nextSessionId: string | null
}

const DEMO_THERAPIST: Omit<MyTherapist, 'nextSessionWhen' | 'nextSessionId'> = {
  name: 'Dr. Ananya Sharma',
  initials: 'AS',
  designation: 'Clinical Psychologist',
  qualifications: 'M.Phil Clinical Psychology (RCI)',
  yearsExp: 8,
  languages: ['Hindi', 'English'],
  specializations: ['Anxiety', 'Work stress', 'CBT'],
  rating: 4.9,
  reviews: 214,
  rciVerified: true,
  nmcVerified: false,
  bio: 'I work with adults navigating anxiety, burnout and life transitions. My approach blends CBT with mindfulness, practical tools you can use between our sessions, at a pace that feels right for you.',
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter((w) => !/^(dr\.?|mr\.?|mrs\.?|ms\.?)$/i.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

export async function getMyTherapist(): Promise<MyTherapist> {
  const view = await getSessionsView()
  const next = view.upcoming[0] ?? view.today ?? null
  const base: MyTherapist = {
    ...DEMO_THERAPIST,
    nextSessionWhen: next?.when ?? null,
    nextSessionId: next?.id ?? null,
  }

  const userId = await getSessionUserId()
  if (!userId) return base

  try {
    const appt = await prisma.appointment.findFirst({
      where: { patientId: userId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        therapist: {
          include: { user: { select: { name: true } } },
        },
      },
    })
    if (!appt) return base

    const t = appt.therapist
    const name = t.user.name ?? 'Your expert'
    return {
      name,
      initials: initialsOf(name),
      designation: t.specializations[0] ? 'Clinical Psychologist' : DEMO_THERAPIST.designation,
      qualifications: t.qualifications.join(', ') || DEMO_THERAPIST.qualifications,
      yearsExp: t.yearsExp,
      languages: t.languages.length ? t.languages : DEMO_THERAPIST.languages,
      specializations: t.specializations.length ? t.specializations : DEMO_THERAPIST.specializations,
      rating: t.rating || DEMO_THERAPIST.rating,
      reviews: t.totalReviews,
      rciVerified: Boolean(t.rciNumber),
      nmcVerified: false,
      bio: t.bio || DEMO_THERAPIST.bio,
      nextSessionWhen: next?.when ?? null,
      nextSessionId: next?.id ?? null,
    }
  } catch {
    return base
  }
}

// ── Care team: up to three experts, one per package kind ─────────────────────
// A patient can hold several packages — individual therapy, couples, and
// psychiatry — each with its own attached clinician. This assembles the "My
// care team" view: one slot per kind, showing the attached expert when a pack
// is active, or a nudge to buy when it isn't.

export type CareExpert = {
  profileId: string
  name: string
  initials: string
  designation: string
  qualifications: string
  yearsExp: number
  languages: string[]
  specializations: string[]
  rating: number
  reviews: number
  rciVerified: boolean
  nmcVerified: boolean
  bio: string
}

export type CareSlot = {
  key: 'individual' | 'couples' | 'psychiatry'
  label: string
  blurb: string
  buyHref: string
  hasPack: boolean
  planName: string | null
  sessionsLeft: number | null
  sessionsTotal: number | null
  expert: CareExpert | null // null with hasPack=true → being matched
}

export type CareTeam = {
  slots: CareSlot[]
  nextSessionWhen: string | null
  nextSessionId: string | null
  assessmentDone: boolean // concerns on file → auto-matching can run
}

const CARE_KINDS: { key: CareSlot['key']; label: string; blurb: string; buyHref: string; trackSlugs: string[] }[] = [
  { key: 'individual', label: 'Individual therapy', blurb: 'One-to-one therapy for you.', buyHref: '/app/billing?track=therapy', trackSlugs: ['therapy'] },
  { key: 'couples', label: 'Couples therapy', blurb: 'Work on your relationship, together.', buyHref: '/app/billing?track=couples', trackSlugs: ['couples'] },
  { key: 'psychiatry', label: 'Psychiatry', blurb: 'Diagnosis and medication, when therapy alone isn’t enough.', buyHref: '/app/billing?track=psychiatry', trackSlugs: ['psychiatry'] },
]

type ProfileRow = {
  id: string
  yearsExp: number
  qualifications: string[]
  languages: string[]
  specializations: string[]
  clinicianType: string | null
  rating: number
  totalReviews: number
  rciNumber: string
  bio: string
  user: { name: string | null } | null
}

// Care-team slot key → the package track its clinician must fit.
const SLOT_TRACK: Record<CareSlot['key'], CareTrack> = {
  individual: 'therapy',
  couples: 'couples',
  psychiatry: 'psychiatry',
}

function expertFromProfile(p: ProfileRow): CareExpert {
  const name = p.user?.name ?? 'Your expert'
  // Psychiatrists are registered with the NMC (medical council); psychologists
  // and counsellors with the RCI. Show the badge that matches the clinician.
  const psych = isPsychiatrist(p.clinicianType, p.specializations)
  const hasReg = Boolean(p.rciNumber)
  return {
    profileId: p.id,
    name,
    initials: initialsOf(name),
    designation: designationOf(p.specializations),
    qualifications: p.qualifications.join(', ') || 'Registered clinician',
    yearsExp: p.yearsExp,
    languages: p.languages.length ? p.languages : ['English'],
    specializations: p.specializations,
    rating: p.rating || 0,
    reviews: p.totalReviews,
    rciVerified: hasReg && !psych,
    nmcVerified: hasReg && psych,
    bio: p.bio || '',
  }
}

const emptyTeam = (): CareTeam => ({
  slots: CARE_KINDS.map((k) => ({
    key: k.key, label: k.label, blurb: k.blurb, buyHref: k.buyHref,
    hasPack: false, planName: null, sessionsLeft: null, sessionsTotal: null, expert: null,
  })),
  nextSessionWhen: null,
  nextSessionId: null,
  assessmentDone: false,
})

export async function getMyCareTeam(): Promise<CareTeam> {
  const view = await getSessionsView()
  const next = view.upcoming[0] ?? view.today ?? null
  const nextSessionWhen = next?.when ?? null
  const nextSessionId = next?.id ?? null

  const userId = await getSessionUserId()
  if (!userId) return { ...emptyTeam(), nextSessionWhen, nextSessionId }

  try {
    const [subs, profile, latestAppt] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        select: { trackSlug: true, planName: true, sessionsTotal: true, sessionsUsed: true, therapistId: true },
      }),
      prisma.patientProfile.findUnique({
        where: { userId },
        select: { track: true, assignedTherapistId: true, assignedTherapistIndividualId: true, assignedTherapistCouplesId: true, assignedTherapistPsychiatryId: true },
      }),
      prisma.appointment.findFirst({ where: { patientId: userId }, orderBy: { scheduledAt: 'desc' }, select: { therapistId: true } }),
    ])
    const assessmentDone = (profile?.track?.length ?? 0) > 0

    // The expert explicitly assigned for each care type takes precedence.
    const categoryAssignment: Record<CareSlot['key'], string | null> = {
      individual: profile?.assignedTherapistIndividualId ?? null,
      couples: profile?.assignedTherapistCouplesId ?? null,
      psychiatry: profile?.assignedTherapistPsychiatryId ?? null,
    }

    // Resolve every therapist id we might need in one query.
    const ids = new Set<string>()
    subs.forEach((s) => s.therapistId && ids.add(s.therapistId))
    Object.values(categoryAssignment).forEach((id) => id && ids.add(id))
    if (profile?.assignedTherapistId) ids.add(profile.assignedTherapistId)
    if (latestAppt?.therapistId) ids.add(latestAppt.therapistId)

    const profiles = ids.size
      ? await prisma.therapistProfile.findMany({
          where: { id: { in: [...ids] } },
          select: {
            id: true, yearsExp: true, qualifications: true, languages: true, specializations: true,
            clinicianType: true, rating: true, totalReviews: true, rciNumber: true, bio: true, user: { select: { name: true } },
          },
        })
      : []
    const byId = new Map(profiles.map((p) => [p.id, p]))

    const slots: CareSlot[] = CARE_KINDS.map((k) => {
      const sub = subs.find((s) => k.trackSlugs.includes(s.trackSlug))
      // Resolve the expert independently of any package: the clinician assigned
      // for this care type wins, then the pack's own attached therapist; for the
      // individual slot, fall back to the patient's default assigned / most-recent
      // expert. This way a patient who already has sessions with a therapist sees
      // them here even before (or without) buying a package.
      const slotTrack = SLOT_TRACK[k.key]
      // Only surface a clinician who actually fits this care type — a psychiatrist
      // must never appear under Individual/Couples, even via a fallback.
      const fits = (p: ProfileRow | undefined): ProfileRow | undefined =>
        p && clinicianMatchesTrack(p.clinicianType, p.specializations, slotTrack) ? p : undefined

      const catId = categoryAssignment[k.key]
      let profRow = fits(catId ? byId.get(catId) : undefined)
      if (!profRow && sub?.therapistId) profRow = fits(byId.get(sub.therapistId))
      if (!profRow && k.key === 'individual') {
        const fallbackId = profile?.assignedTherapistId ?? latestAppt?.therapistId ?? null
        if (fallbackId) profRow = fits(byId.get(fallbackId))
      }
      return {
        key: k.key,
        label: k.label,
        blurb: k.blurb,
        buyHref: k.buyHref,
        hasPack: Boolean(sub),
        planName: sub?.planName ?? null,
        sessionsTotal: sub?.sessionsTotal ?? null,
        sessionsLeft: sub ? Math.max(0, sub.sessionsTotal - sub.sessionsUsed) : null,
        expert: profRow ? expertFromProfile(profRow) : null,
      }
    })

    return { slots, nextSessionWhen, nextSessionId, assessmentDone }
  } catch {
    return { ...emptyTeam(), nextSessionWhen, nextSessionId }
  }
}
