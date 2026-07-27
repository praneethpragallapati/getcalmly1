'use client'

import { useState } from 'react'
import { TrendingUp, IndianRupee, CalendarRange, Download, Package } from 'lucide-react'
import type { RevenueReport, RevenueBucket } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

type Grain = 'day' | 'week' | 'month' | 'year' | 'package'

function DownloadLink({ grain, label }: { grain: string; label: string }) {
  return (
    <a href={`/admin/revenue/export?grain=${grain}`} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <Download size={13} /> {label}
    </a>
  )
}

function BucketTable({ buckets, keyLabel }: { buckets: RevenueBucket[]; keyLabel: string }) {
  if (buckets.length === 0) return <p className="muted" style={{ padding: '8px 0' }}>No revenue yet.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
            <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>{keyLabel}</th>
            <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Orders</th>
            <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600, textAlign: 'right' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.key} style={{ borderBottom: '1px solid var(--c-line)' }}>
              <td style={{ padding: '9px 4px', fontWeight: 600, color: charcoal }}>{b.label}</td>
              <td style={{ padding: '9px 4px' }}>{b.count}</td>
              <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 700 }}>{inr(b.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RevenueView({ report }: { report: RevenueReport }) {
  const [grain, setGrain] = useState<Grain>('month')

  const cards = [
    { label: 'Revenue this month', value: inr(report.totalThisMonth), icon: <TrendingUp size={18} /> },
    { label: 'Revenue this year', value: inr(report.totalThisYear), icon: <CalendarRange size={18} /> },
    { label: 'Revenue all time', value: inr(report.totalAllTime), icon: <IndianRupee size={18} /> },
    { label: 'Orders', value: String(report.orders), icon: <Package size={18} /> },
  ]

  const buckets =
    grain === 'day' ? report.byDay :
    grain === 'week' ? report.byWeek :
    grain === 'year' ? report.byYear :
    grain === 'package' ? report.byPackage :
    report.byMonth
  const keyLabel = grain === 'package' ? 'Package' : grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1)

  return (
    <div className="stack">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Revenue</div>
          <div className="page-meta">Package sales — who bought what, and totals by day, week, month and year. Exports open in Excel and carry full audit detail.</div>
        </div>
        <a href="/admin/revenue/export?grain=ledger" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Download size={15} /> Download full ledger
        </a>
      </div>

      {!report.hasData && (
        <div className="card"><p className="muted">No package purchases recorded yet. Once patients buy first sessions, packs or Calm+, every sale appears here as an audit line.</p></div>
      )}

      <div className="grid-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <span style={{ color: 'var(--c-coral)' }}>{c.icon}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, marginTop: 8 }}>{c.value}</div>
            <div className="muted">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Aggregates by grain */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10 }}>
            {(['day', 'week', 'month', 'year', 'package'] as const).map((g) => (
              <button key={g} onClick={() => setGrain(g)} style={{
                border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', textTransform: 'capitalize',
                background: grain === g ? '#fff' : 'transparent', color: grain === g ? coral : '#8E9EAE', boxShadow: grain === g ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
              }}>{g}</button>
            ))}
          </div>
          <DownloadLink grain={grain} label={`Export by ${grain}`} />
        </div>
        <BucketTable buckets={buckets} keyLabel={keyLabel} />
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
                      <div style={{ fontWeight: 600, color: charcoal }}>{l.patientName}</div>
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
