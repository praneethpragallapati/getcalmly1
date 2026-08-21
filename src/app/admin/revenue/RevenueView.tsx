'use client'

import { useState } from 'react'
import { TrendingUp, IndianRupee, CalendarRange, Download, Package, FileText, ChevronRight } from 'lucide-react'
import type { RevenueReport, RevenuePeriod } from '@/lib/admin'
import { patientCode } from '@/lib/ids'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

type Grain = 'day' | 'week' | 'month' | 'year'

function DownloadLink({ grain }: { grain: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 8 }}>
      <a href={`/admin/revenue/export?grain=${grain}&format=pdf`} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <FileText size={13} /> PDF
      </a>
      <a href={`/admin/revenue/export?grain=${grain}`} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Download size={13} /> CSV
      </a>
    </span>
  )
}

/** One time period: total on the header, its package breakup nested beneath. */
function PeriodRow({ period }: { period: RevenuePeriod }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--c-line)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 4px', fontFamily: 'inherit', textAlign: 'left' }}
      >
        <ChevronRight size={15} style={{ color: '#8E9EAE', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, color: charcoal, flex: 1 }}>{period.label}</span>
        <span className="muted" style={{ fontSize: 12.5 }}>{period.count} order{period.count === 1 ? '' : 's'} · {period.packages.length} package{period.packages.length === 1 ? '' : 's'}</span>
        <span style={{ fontWeight: 800, color: charcoal, minWidth: 90, textAlign: 'right' }}>{inr(period.amount)}</span>
      </button>
      {open && (
        <div style={{ padding: '2px 4px 12px 32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '4px 4px', fontSize: 11, color: 'var(--c-gray-d)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Package</th>
                <th style={{ padding: '4px 4px', fontSize: 11, color: 'var(--c-gray-d)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Orders</th>
                <th style={{ padding: '4px 4px', fontSize: 11, color: 'var(--c-gray-d)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {period.packages.map((p) => (
                <tr key={p.name}>
                  <td style={{ padding: '6px 4px', color: '#3A4A5A' }}>{p.name}</td>
                  <td style={{ padding: '6px 4px', color: '#3A4A5A' }}>{p.count}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, color: charcoal }}>{inr(p.amount)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--c-line)' }}>
                <td style={{ padding: '6px 4px', fontWeight: 700, color: charcoal }}>Total</td>
                <td style={{ padding: '6px 4px', fontWeight: 700, color: charcoal }}>{period.count}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 800, color: charcoal }}>{inr(period.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function PeriodList({ periods }: { periods: RevenuePeriod[] }) {
  if (periods.length === 0) return <p className="muted" style={{ padding: '8px 0' }}>No revenue yet.</p>
  return <div>{periods.map((p) => <PeriodRow key={p.key} period={p} />)}</div>
}

export function RevenueView({ report }: { report: RevenueReport }) {
  const [grain, setGrain] = useState<Grain>('month')

  const cards = [
    { label: 'Revenue this month', value: inr(report.totalThisMonth), icon: <TrendingUp size={18} /> },
    { label: 'Revenue this year', value: inr(report.totalThisYear), icon: <CalendarRange size={18} /> },
    { label: 'Revenue all time', value: inr(report.totalAllTime), icon: <IndianRupee size={18} /> },
    { label: 'Orders', value: String(report.orders), icon: <Package size={18} /> },
  ]

  const periods =
    grain === 'day' ? report.byDay :
    grain === 'week' ? report.byWeek :
    grain === 'year' ? report.byYear :
    report.byMonth

  return (
    <div className="stack">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Revenue</div>
          <div className="page-meta">Package sales — totals by day, week, month and year, each broken down by package. Exports open in Excel and carry full audit detail.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="/admin/revenue/export?grain=ledger&format=pdf" className="btn" style={{ border: '1.5px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText size={15} /> PDF ledger
          </a>
          <a href="/admin/revenue/export?grain=ledger" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> CSV ledger
          </a>
        </div>
      </div>

      {!report.hasData && (
        <div className="card"><p className="muted">No package purchases recorded yet. Once patients buy first sessions, packs or Calm+, every sale appears here as an audit line.</p></div>
      )}

      <div className="grid-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <span style={{ color: 'var(--c-coral-d)' }}>{c.icon}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, marginTop: 8 }}>{c.value}</div>
            <div className="muted">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Totals by period, each expandable to its package breakup */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10 }}>
            {(['day', 'week', 'month', 'year'] as const).map((g) => (
              <button key={g} onClick={() => setGrain(g)} style={{
                border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', textTransform: 'capitalize',
                background: grain === g ? '#fff' : 'transparent', color: grain === g ? coral : '#8E9EAE', boxShadow: grain === g ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
              }}>{g}</button>
            ))}
          </div>
          <DownloadLink grain={grain} />
        </div>
        <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Each row is a {grain} total — click to see which packages made it up.</p>
        <PeriodList periods={periods} />
      </div>

      {/* Recent purchases */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Recent purchases</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Who bought what, newest first. The full history is in the ledger export.</p>
        {report.lines.length === 0 && <p className="muted">No purchases yet.</p>}
        {report.lines.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
                  {['Date', 'Patient', 'Package', 'Type', 'Amount'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.lines.slice(0, 60).map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--c-line)' }}>
                    <td style={{ padding: '9px 4px', whiteSpace: 'nowrap' }}>{l.dayLabel}</td>
                    <td style={{ padding: '9px 4px' }}>
                      <div style={{ fontWeight: 600, color: charcoal, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        {l.patientName}
                        <span style={{ fontSize: 10.5, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0' }}>{patientCode(l.userId)}</span>
                      </div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{l.patientEmail}</div>
                    </td>
                    <td style={{ padding: '9px 4px' }}>{l.planName || '—'}</td>
                    <td style={{ padding: '9px 4px' }}>{l.kindLabel}</td>
                    <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 700 }}>{inr(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
