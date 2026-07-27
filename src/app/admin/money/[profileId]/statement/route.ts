import { getAdminSession, getClinicianEarnings } from '@/lib/admin'
import { toCsv, csvResponse } from '@/lib/csv'

export const dynamic = 'force-dynamic'

/**
 * Per-clinician earnings statement (Excel-compatible CSV). Admin-only.
 *   ?grain=lines  → per-session ledger (default; disbursement-ready line items)
 *   ?grain=day|week|month → aggregated totals
 */
export async function GET(req: Request, { params }: { params: Promise<{ profileId: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const { profileId } = await params
  const e = await getClinicianEarnings(profileId)
  if (!e) return new Response('Not found', { status: 404 })

  const grain = new URL(req.url).searchParams.get('grain') ?? 'lines'
  const stamp = new Date().toISOString().slice(0, 10)
  const safeName = e.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()

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
