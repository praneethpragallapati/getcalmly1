/**
 * Average gap between sessions, in days.
 *
 * For one patient with one clinician: the mean number of days between each
 * completed session and the one before it. For a clinician: the mean of their
 * patients' gaps, so each patient counts once and the figure describes the
 * clinician's typical patient, not whoever books most often. Patients with a
 * single session have no gap yet and are left out of both.
 */
import { prisma } from '@/lib/prisma'

const DAY_MS = 86_400_000

/** Mean gap in days for session start times; null with fewer than two. */
export function avgGapDays(times: number[]): number | null {
  if (times.length < 2) return null
  const t = [...times].sort((a, b) => a - b)
  return (t[t.length - 1] - t[0]) / (t.length - 1) / DAY_MS
}

/** One decimal place, the precision every surface shows. */
export function roundGap(days: number | null): number | null {
  return days === null ? null : Math.round(days * 10) / 10
}

export type ClinicianGap = {
  /** Average across patients with two or more sessions; null if none. */
  avgDays: number | null
  /** How many patients that average is taken over. */
  patientsMeasured: number
  /** Per patient: their own average gap (null with a single session) and session count. */
  byPatient: Map<string, { avgDays: number | null; sessions: number }>
}

const EMPTY: ClinicianGap = { avgDays: null, patientsMeasured: 0, byPatient: new Map() }

/** Gaps for every patient of each clinician, from completed sessions, in one query. */
export async function getSessionGaps(therapistIds: string[]): Promise<Map<string, ClinicianGap>> {
  const out = new Map<string, ClinicianGap>()
  if (therapistIds.length === 0) return out
  try {
    const rows = await prisma.appointment.findMany({
      where: { therapistId: { in: therapistIds }, status: 'COMPLETED' },
      select: { therapistId: true, patientId: true, scheduledAt: true },
    })
    const times = new Map<string, Map<string, number[]>>()
    for (const r of rows) {
      const perT = times.get(r.therapistId) ?? new Map<string, number[]>()
      const list = perT.get(r.patientId) ?? []
      list.push(r.scheduledAt.getTime())
      perT.set(r.patientId, list)
      times.set(r.therapistId, perT)
    }
    for (const id of therapistIds) {
      const byPatient = new Map<string, { avgDays: number | null; sessions: number }>()
      const gaps: number[] = []
      for (const [patientId, ts] of times.get(id) ?? []) {
        const g = avgGapDays(ts)
        byPatient.set(patientId, { avgDays: roundGap(g), sessions: ts.length })
        if (g !== null) gaps.push(g)
      }
      out.set(id, {
        avgDays: gaps.length ? roundGap(gaps.reduce((s, g) => s + g, 0) / gaps.length) : null,
        patientsMeasured: gaps.length,
        byPatient,
      })
    }
  } catch {
    for (const id of therapistIds) out.set(id, EMPTY)
  }
  return out
}

/** Gaps for a single clinician. */
export async function getClinicianSessionGap(therapistId: string): Promise<ClinicianGap> {
  return (await getSessionGaps([therapistId])).get(therapistId) ?? EMPTY
}

/** "6.5 days", "1 day", or the usual "—" placeholder when there is nothing to show. */
export function fmtGap(days: number | null): string {
  if (days === null) return '—'
  return `${days} day${days === 1 ? '' : 's'}`
}

export type PatientRhythmRow = {
  therapistId: string
  clinicianName: string
  sessions: number
  /** This patient's average gap with this clinician. */
  avgDays: number | null
  /** The clinician's average across all their patients, for comparison. */
  clinicianAvgDays: number | null
}

/** One row per clinician this patient has completed sessions with. */
export async function getPatientSessionRhythm(patientId: string): Promise<PatientRhythmRow[]> {
  try {
    const seen = await prisma.appointment.findMany({
      where: { patientId, status: 'COMPLETED' },
      distinct: ['therapistId'],
      select: { therapistId: true, therapist: { select: { user: { select: { name: true } } } } },
    })
    if (seen.length === 0) return []
    const gaps = await getSessionGaps(seen.map((s) => s.therapistId))
    return seen
      .map((s) => {
        const g = gaps.get(s.therapistId) ?? EMPTY
        const mine = g.byPatient.get(patientId)
        return {
          therapistId: s.therapistId,
          clinicianName: s.therapist?.user?.name ?? 'Clinician',
          sessions: mine?.sessions ?? 0,
          avgDays: mine?.avgDays ?? null,
          clinicianAvgDays: g.avgDays,
        }
      })
      .sort((a, b) => b.sessions - a.sessions)
  } catch {
    return []
  }
}
