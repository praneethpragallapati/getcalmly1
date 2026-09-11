import { getSessionUserId } from '@/lib/patient'
import { prisma } from '@/lib/prisma'
import { getOutcomeState } from '@/lib/outcomes/store'
import { getWeeklyProgress } from '@/lib/dashboard'
import { getLifetimeTotals } from '@/lib/progressTotals'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { buildStatementPdf, pdfResponse } from '@/lib/pdf'
import { firstNameFrom } from '@/lib/dashboard'
import { patientCode } from '@/lib/ids'
import { fmtIST } from '@/lib/tz'

export const dynamic = 'force-dynamic'

/** CGI / C-SSRS are clinician-only and never leave the clinician's view. */
const HIDDEN = new Set(['CGI', 'CSSRS'])
const ORDER = ['PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS']

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return new Response('Sign in to download your progress.', { status: 401 })

  const [user, outcomes, weekly, totals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, createdAt: true } }).catch(() => null),
    getOutcomeState(userId),
    getWeeklyProgress(userId),
    getLifetimeTotals(userId),
  ])

  const name = firstNameFrom(user?.name, user?.email)
  const started = user?.createdAt ? fmtIST(user.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) : null

  const visible = outcomes
    .filter((o) => o.verdict.current != null && !HIDDEN.has(o.instrumentId))
    .sort((a, b) => ORDER.indexOf(a.instrumentId) - ORDER.indexOf(b.instrumentId))

  const rows: (string | number)[][] = visible.map((o) => {
    const inst = INSTRUMENTS[o.instrumentId]
    const v = o.verdict
    const value = o.instrumentId === 'WHO5' && v.currentPercent != null ? `${v.currentPercent}%` : String(v.current ?? '-')
    const change = v.deltaPoints == null || v.deltaPoints === 0
      ? 'No change'
      : `${v.deltaPoints > 0 ? '+' : ''}${v.deltaPoints} pts since baseline`
    return [inst.short, value, v.bandLabel ?? v.label ?? '-', change]
  })

  // Behavioural pattern summary (this week) as extra rows so the sheet reads as
  // one story: symptoms first, then how consistently the person is engaging.
  rows.push([
    'Mood (this week)',
    weekly.moodAvg != null ? `${weekly.moodAvg}/10` : '-',
    '-',
    `${weekly.moodCheckins} check-in${weekly.moodCheckins === 1 ? '' : 's'}`,
  ])
  rows.push([
    'Task adherence (this week)',
    `${weekly.completionPct}%`,
    '-',
    `${weekly.tasksCompleted} of ${weekly.tasksAssigned} done`,
  ])

  const bytes = await buildStatementPdf({
    title: 'My Progress',
    subtitle: `${name}  (${patientCode(userId)})`,
    meta: [started ? `On getCalmly since ${started}` : 'Progress summary', `Generated ${fmtIST(new Date(), { day: 'numeric', month: 'short', year: 'numeric' })}`],
    summary: [
      { label: 'Journals', value: String(totals.journals) },
      { label: 'Tasks done', value: String(totals.tasksCompleted) },
      { label: 'Check-ins', value: String(totals.checkins) },
      { label: 'Sessions', value: String(totals.sessions) },
    ],
    table: {
      headers: ['Measure', 'Latest', 'Status', 'Change'],
      rows: rows.length > 0 ? rows : [['No measures recorded yet', '-', '-', '-']],
      align: ['left', 'left', 'left', 'left'],
    },
  })

  return pdfResponse(`getcalmly-progress-${patientCode(userId)}.pdf`, bytes)
}
