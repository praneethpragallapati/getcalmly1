import { getAdminSession, getRevenueReport } from '@/lib/admin'
import { toCsv, csvResponse } from '@/lib/csv'
import { buildStatementPdf, pdfResponse, rs } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

/**
 * Revenue exports. Admin-only.
 *   ?grain=ledger  → full per-payment audit ledger (default)
 *   ?grain=day|week|month|year|package → aggregated totals
 *   ?format=pdf    → branded PDF statement (otherwise Excel-compatible CSV)
 */
export async function GET(req: Request) {
  const admin = await getAdminSession()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const sp = new URL(req.url).searchParams
  const grain = sp.get('grain') ?? 'ledger'
  const format = sp.get('format') ?? 'csv'
  const report = await getRevenueReport()
  const stamp = new Date().toISOString().slice(0, 10)

  const buckets =
    grain === 'day' ? report.byDay :
    grain === 'week' ? report.byWeek :
    grain === 'year' ? report.byYear :
    grain === 'package' ? report.byPackage :
    report.byMonth
  const keyHeader = grain === 'package' ? 'Package' : grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1)

  if (format === 'pdf') {
    const summary = [
      { label: 'This month', value: rs(report.totalThisMonth) },
      { label: 'This year', value: rs(report.totalThisYear) },
      { label: 'All time', value: rs(report.totalAllTime) },
      { label: 'Orders', value: String(report.orders) },
    ]
    const table = grain === 'ledger'
      ? {
          headers: ['Date', 'Patient', 'Package', 'Type', 'Amount'],
          align: ['left', 'left', 'left', 'left', 'right'] as ('left' | 'right')[],
          rows: report.lines.map((l) => [l.dayLabel, l.patientName, l.planName || '-', l.kindLabel, rs(l.amount)]),
        }
      : {
          headers: [keyHeader, 'Orders', 'Revenue'],
          align: ['left', 'left', 'right'] as ('left' | 'right')[],
          rows: buckets.map((b) => [b.label, String(b.count), rs(b.amount)]),
        }
    const bytes = await buildStatementPdf({
      title: 'Revenue statement',
      subtitle: grain === 'ledger' ? 'Package sales ledger' : `Revenue by ${grain}`,
      meta: [`Generated: ${stamp}`, 'All amounts in INR'],
      summary,
      table,
    })
    return pdfResponse(`getcalmly-revenue-${grain}-${stamp}.pdf`, bytes)
  }

  if (grain === 'ledger') {
    const csv = toCsv(
      ['Payment ID', 'Date/time (ISO)', 'Date', 'Patient', 'Email', 'Type', 'Track', 'Plan', 'Amount (INR)', 'Subscription ID'],
      report.lines.map((l) => [l.id, l.isoDateTime, l.dateIso, l.patientName, l.patientEmail, l.kindLabel, l.trackSlug, l.planName, l.amount, l.subscriptionId]),
    )
    return csvResponse(`getcalmly-revenue-ledger-${stamp}.csv`, csv)
  }

  const csv = toCsv(
    [keyHeader, 'Orders', 'Revenue (INR)'],
    buckets.map((b) => [b.label, b.count, b.amount]),
  )
  return csvResponse(`getcalmly-revenue-by-${grain}-${stamp}.csv`, csv)
}
