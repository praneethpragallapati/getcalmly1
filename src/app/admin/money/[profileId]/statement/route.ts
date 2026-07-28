import { getAdminSession, getClinicianEarnings } from '@/lib/admin'
import { toCsv, csvResponse } from '@/lib/csv'
import { buildStatementPdf, pdfResponse, rs } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

/**
 * Per-clinician earnings statement. Admin-only.
 *   ?grain=lines  → per-session ledger (default; disbursement-ready line items)
 *   ?grain=day|week|month → aggregated totals
 *   ?format=pdf   → branded PDF statement (otherwise Excel-compatible CSV)
 */
export async function GET(req: Request, { params }: { params: Promise<{ profileId: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const { profileId } = await params
  const e = await getClinicianEarnings(profileId)
  if (!e) return new Response('Not found', { status: 404 })

  const sp = new URL(req.url).searchParams
  const grain = sp.get('grain') ?? 'lines'
  const format = sp.get('format') ?? 'csv'
  const stamp = new Date().toISOString().slice(0, 10)
  const safeName = e.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const engagement = e.employmentType === 'PART_TIME' ? 'Part-time (per session)' : 'Full-time (salaried)'

  if (format === 'pdf') {
    const summary = [
      { label: 'Earned all time', value: rs(e.totalEarned) },
      { label: 'This month', value: rs(e.thisMonthTotal) },
      { label: 'Sessions', value: String(e.totalSessions) },
    ]
    const table = grain === 'lines'
      ? {
          headers: ['Date', 'Patient', 'Service', 'No.', 'Night', 'Pay'],
          align: ['left', 'left', 'left', 'left', 'left', 'right'] as ('left' | 'right')[],
          rows: e.lines.map((l) => [l.dateIso, l.patientName, l.serviceLabel, `#${l.sessionNumber}`, l.night ? 'Yes' : '-', rs(l.amount)]),
        }
      : {
          headers: [grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1), 'Sessions', 'Pay'],
          align: ['left', 'left', 'right'] as ('left' | 'right')[],
          rows: (grain === 'day' ? e.byDay : grain === 'week' ? e.byWeek : e.byMonth).map((b) => [b.label, String(b.sessions), rs(b.amount)]),
        }
    const bytes = await buildStatementPdf({
      title: 'Earnings statement',
      subtitle: e.name,
      meta: [`Engagement: ${engagement}`, `Generated: ${stamp}`, 'All amounts in INR'],
      summary,
      table,
    })
    return pdfResponse(`statement-${safeName}-${grain}-${stamp}.pdf`, bytes)
  }

  if (grain === 'lines') {
    const csv = toCsv(
      ['Session ID', 'Date', 'Time', 'Patient', 'Service', 'Session #', 'Night', 'Base (INR)', 'Number bonus', 'Night bonus', 'Misc', 'Total pay (INR)'],
      e.lines.map((l) => [l.id, l.dateIso, l.timeLabel, l.patientName, l.serviceLabel, l.sessionNumber, l.night ? 'Yes' : 'No', l.base, l.numberBonus, l.nightBonus, l.misc, l.amount]),
    )
    return csvResponse(`statement-${safeName}-sessions-${stamp}.csv`, csv)
  }

  const buckets = grain === 'day' ? e.byDay : grain === 'week' ? e.byWeek : e.byMonth
  const keyHeader = grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1)
  const csv = toCsv(
    [keyHeader, 'Sessions', 'Pay (INR)'],
    buckets.map((b) => [b.label, b.sessions, b.amount]),
  )
  return csvResponse(`statement-${safeName}-by-${grain}-${stamp}.csv`, csv)
}
