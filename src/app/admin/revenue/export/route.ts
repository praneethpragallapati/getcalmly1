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

  const periods =
    grain === 'day' ? report.byDay :
    grain === 'week' ? report.byWeek :
    grain === 'year' ? report.byYear :
    report.byMonth
  const keyHeader = grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1)

  // A period export lists every package within each period, then the period
  // total — so day/week/month/year each carry their package breakup + total.
  const periodRows = (asString: boolean): (string | number)[][] => {
    const out: (string | number)[][] = []
    for (const p of periods) {
      for (const pkg of p.packages) out.push([p.label, pkg.name, asString ? String(pkg.count) : pkg.count, asString ? rs(pkg.amount) : pkg.amount])
      out.push([p.label, 'TOTAL', asString ? String(p.count) : p.count, asString ? rs(p.amount) : p.amount])
    }
    return out
  }

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
          headers: [keyHeader, 'Package', 'Orders', 'Revenue'],
          align: ['left', 'left', 'left', 'right'] as ('left' | 'right')[],
          rows: periodRows(true),
        }
    const bytes = await buildStatementPdf({
      title: 'Revenue statement',
      subtitle: grain === 'ledger' ? 'Package sales ledger' : `Revenue by ${grain}, broken down by package`,
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

  const csv = toCsv([keyHeader, 'Package', 'Orders', 'Revenue (INR)'], periodRows(false))
  return csvResponse(`getcalmly-revenue-by-${grain}-${stamp}.csv`, csv)
}
