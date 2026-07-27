import { getAdminSession, getRevenueReport } from '@/lib/admin'
import { toCsv, csvResponse } from '@/lib/csv'

export const dynamic = 'force-dynamic'

/**
 * Revenue exports (Excel-compatible CSV). Admin-only.
 *   ?grain=ledger  → full per-payment audit ledger (default)
 *   ?grain=day|week|month|year|package → aggregated totals
 */
export async function GET(req: Request) {
  const admin = await getAdminSession()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const grain = new URL(req.url).searchParams.get('grain') ?? 'ledger'
  const report = await getRevenueReport()
  const stamp = new Date().toISOString().slice(0, 10)

  if (grain === 'ledger') {
    const csv = toCsv(
      ['Payment ID', 'Date/time (ISO)', 'Date', 'Patient', 'Email', 'Type', 'Track', 'Plan', 'Amount (INR)', 'Subscription ID'],
      report.lines.map((l) => [l.id, l.isoDateTime, l.dateIso, l.patientName, l.patientEmail, l.kindLabel, l.trackSlug, l.planName, l.amount, l.subscriptionId]),
    )
    return csvResponse(`getcalmly-revenue-ledger-${stamp}.csv`, csv)
  }

  const buckets =
    grain === 'day' ? report.byDay :
    grain === 'week' ? report.byWeek :
    grain === 'year' ? report.byYear :
    grain === 'package' ? report.byPackage :
    report.byMonth
  const keyHeader = grain === 'package' ? 'Package' : grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1)
  const csv = toCsv(
    [keyHeader, 'Orders', 'Revenue (INR)'],
    buckets.map((b) => [b.label, b.count, b.amount]),
  )
  return csvResponse(`getcalmly-revenue-by-${grain}-${stamp}.csv`, csv)
}
