import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'
import { getSessionsView } from '@/lib/sessions'

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
