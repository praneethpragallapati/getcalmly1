/**
 * The weekly patient summary a clinician sees on a patient's record.
 *
 * Deliberately NOT an AI brief. It is computed from three things the clinician
 * already owns and can verify — the session notes they wrote, the patient's mood
 * check-ins, and how the assigned tasks are going — so every line traces back to
 * a number on the record rather than to a model's paraphrase. Nothing here is
 * generated text, and no LLM is called.
 *
 * It refreshes weekly: the window is the current IST week (Monday 00:00 onward)
 * measured against the full week before it, so each Monday the comparison rolls
 * over on its own. No cron and no stored snapshot — recomputing from source means
 * it can never go stale or disagree with the data below it on the page.
 */
import { prisma } from '@/lib/prisma'
import { istParts, istWallClock, fmtIST } from '@/lib/tz'
import { isDoneForPeriod } from '@/lib/taskRecurrence'

export type SummaryLine = {
  label: string
  value: string
  /** Week-on-week movement, when there's a previous week to compare against. */
  trend?: 'up' | 'down' | 'flat'
  detail?: string
}

export type PatientWeeklySummary = {
  /** e.g. "18–24 Aug 2026" */
  rangeLabel: string
  lines: SummaryLine[]
  /** The most recent clinical note, so the last session is one glance away. */
  lastNote: { dateLabel: string; author: string; focus: string } | null
  /** True when the week has no mood, no tasks and no notes at all. */
  empty: boolean
}

/** Monday 00:00 IST of the week containing `d`. */
function istWeekStart(d: Date): Date {
  const p = istParts(d)
  const daysSinceMonday = (p.dow + 6) % 7 // Sunday(0) → 6, Monday(1) → 0
  const monday = istWallClock(p.year, p.month, p.day, 0, 0)
  return new Date(monday.getTime() - daysSinceMonday * 86_400_000)
}

const avg = (xs: number[]): number | null =>
  xs.length ? xs.reduce((t, n) => t + n, 0) / xs.length : null

function trendOf(now: number | null, prev: number | null, epsilon = 0.05): SummaryLine['trend'] {
  if (now == null || prev == null) return undefined
  if (now - prev > epsilon) return 'up'
  if (prev - now > epsilon) return 'down'
  return 'flat'
}

/**
 * Pull the clinician's own "next focus" line out of a structured note, so the
 * summary shows what the session actually landed on rather than the first words
 * of the subjective section. Falls back to the opening of the note.
 */
function focusFromNote(summary: string): string {
  const next = /NEXT SESSION FOCUS:\s*\n?([^\n]+)/i.exec(summary)
  if (next?.[1]?.trim()) return next[1].trim().slice(0, 220)
  const subjective = /SUBJECTIVE[^\n]*:\s*\n?([^\n]+)/i.exec(summary)
  if (subjective?.[1]?.trim()) return subjective[1].trim().slice(0, 220)
  return summary.trim().split('\n').find((l) => l.trim())?.slice(0, 220) ?? ''
}

export async function getPatientWeeklySummary(patientId: string): Promise<PatientWeeklySummary | null> {
  const now = new Date()
  const weekStart = istWeekStart(now)
  const prevStart = new Date(weekStart.getTime() - 7 * 86_400_000)

  const rangeLabel = `${fmtIST(weekStart, { day: 'numeric', month: 'short' })} – ${fmtIST(now, { day: 'numeric', month: 'short', year: 'numeric' })}`

  try {
    // Each query is narrow and fail-soft: one degraded source should shrink the
    // summary, never take the patient record to the error boundary.
    const [moods, notes, tasks] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId: patientId, createdAt: { gte: prevStart } },
        select: { mood: true, createdAt: true },
      }).catch(() => []),
      prisma.appointment.findMany({
        where: { patientId, summary: { not: null }, scheduledAt: { gte: prevStart } },
        orderBy: { scheduledAt: 'desc' },
        select: {
          scheduledAt: true, summary: true,
          therapist: { select: { user: { select: { name: true } } } },
        },
      }).catch(() => []),
      prisma.task.findMany({
        where: { userId: patientId },
        select: { frequency: true, completedAt: true, dueDate: true, createdAt: true },
      }).catch(() => []),
    ])

    const inThisWeek = <T extends { createdAt?: Date; scheduledAt?: Date }>(r: T, key: 'createdAt' | 'scheduledAt') =>
      (r[key] as Date).getTime() >= weekStart.getTime()

    // ── Mood ──
    const moodNow = moods.filter((m) => inThisWeek(m, 'createdAt'))
    const moodPrev = moods.filter((m) => !inThisWeek(m, 'createdAt'))
    const avgNow = avg(moodNow.map((m) => m.mood))
    const avgPrev = avg(moodPrev.map((m) => m.mood))

    // ── Session notes ──
    const notesNow = notes.filter((n) => inThisWeek(n, 'scheduledAt'))
    const notesPrev = notes.filter((n) => !inThisWeek(n, 'scheduledAt'))

    // ── Task adherence ──
    // "Assigned" means live this week: created on or before the week's end and
    // not expired before it started. Done is evaluated per period, so a daily
    // task counts as done for the current period rather than once forever.
    const live = tasks.filter((t) => {
      if (t.createdAt.getTime() > now.getTime()) return false
      return !t.dueDate || t.dueDate.getTime() >= weekStart.getTime()
    })
    const doneNow = live.filter((t) => isDoneForPeriod(t.completedAt, t.frequency)).length
    const adherenceNow = live.length ? Math.round((doneNow / live.length) * 100) : null

    const lines: SummaryLine[] = []

    lines.push({
      label: 'Mood',
      value: avgNow != null
        ? `${avgNow.toFixed(1)}/10 across ${moodNow.length} check-in${moodNow.length === 1 ? '' : 's'}`
        : 'No check-ins this week',
      trend: trendOf(avgNow, avgPrev, 0.2),
      detail: avgPrev != null ? `Last week ${avgPrev.toFixed(1)}/10 across ${moodPrev.length}` : undefined,
    })

    lines.push({
      label: 'Sessions written up',
      value: notesNow.length === 0
        ? 'None this week'
        : `${notesNow.length} note${notesNow.length === 1 ? '' : 's'}`,
      trend: trendOf(notesNow.length, notesPrev.length, 0),
      detail: notesPrev.length ? `${notesPrev.length} last week` : undefined,
    })

    lines.push({
      label: 'Task adherence',
      value: adherenceNow == null
        ? 'No tasks assigned'
        : `${adherenceNow}% · ${doneNow} of ${live.length} done`,
      detail: live.length === 0 ? undefined : `${live.length - doneNow} still open`,
    })

    const latest = notes[0]
    const lastNote = latest?.summary
      ? {
          dateLabel: fmtIST(latest.scheduledAt, { day: 'numeric', month: 'short', year: 'numeric' }),
          author: latest.therapist?.user?.name ?? 'Clinician',
          focus: focusFromNote(latest.summary),
        }
      : null

    return {
      rangeLabel,
      lines,
      lastNote,
      empty: moodNow.length === 0 && notesNow.length === 0 && live.length === 0 && !lastNote,
    }
  } catch {
    return null
  }
}
