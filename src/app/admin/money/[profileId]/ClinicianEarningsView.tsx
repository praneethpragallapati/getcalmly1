'use client'

import { useState } from 'react'
import { Download, Wallet, CalendarDays, TrendingUp, FileText } from 'lucide-react'
import type { ClinicianEarnings, EarningsBucket } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#6D5BD0'
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

type Grain = 'day' | 'week' | 'month'

function BucketTable({ buckets, keyLabel }: { buckets: EarningsBucket[]; keyLabel: string }) {
  if (buckets.length === 0) return <p className="muted" style={{ padding: '8px 0' }}>No paid sessions yet.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
            <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>{keyLabel}</th>
            <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600 }}>Sessions</th>
            <th style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600, textAlign: 'right' }}>Pay</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.key} style={{ borderBottom: '1px solid var(--c-line)' }}>
              <td style={{ padding: '9px 4px', fontWeight: 600, color: charcoal }}>{b.label}</td>
              <td style={{ padding: '9px 4px' }}>{b.sessions}</td>
              <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 700 }}>{inr(b.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ClinicianEarningsView({ e }: { e: ClinicianEarnings }) {
  const [grain, setGrain] = useState<Grain>('month')
  const buckets = grain === 'day' ? e.byDay : grain === 'week' ? e.byWeek : e.byMonth
  const keyLabel = grain === 'week' ? 'ISO week' : grain.charAt(0).toUpperCase() + grain.slice(1)

  const cards = [
    { label: 'Earned this month', value: inr(e.thisMonthTotal), icon: <TrendingUp size={18} /> },
    { label: 'Earned all time', value: inr(e.totalEarned), icon: <Wallet size={18} /> },
    { label: 'Sessions this month', value: String(e.thisMonthSessions), icon: <CalendarDays size={18} /> },
    { label: 'Sessions all time', value: String(e.totalSessions), icon: <CalendarDays size={18} /> },
  ]

  return (
    <>
      <div className="grid-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <span style={{ color: 'var(--c-coral)' }}>{c.icon}</span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 26, marginTop: 8 }}>{c.value}</div>
            <div className="muted">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Aggregates + downloads */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10 }}>
            {(['day', 'week', 'month'] as const).map((g) => (
              <button key={g} onClick={() => setGrain(g)} style={{
                border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', textTransform: 'capitalize',
                background: grain === g ? '#fff' : 'transparent', color: grain === g ? coral : '#8E9EAE', boxShadow: grain === g ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
              }}>{g}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href={`/admin/money/${e.profileId}/statement?grain=${grain}&format=pdf`} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <FileText size={13} /> PDF by {grain}
            </a>
            <a href={`/admin/money/${e.profileId}/statement?grain=${grain}`} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Download size={13} /> CSV by {grain}
            </a>
            <a href={`/admin/money/${e.profileId}/statement?grain=lines&format=pdf`} className="btn btn-primary" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <FileText size={13} /> Full PDF statement
            </a>
          </div>
        </div>
        <BucketTable buckets={buckets} keyLabel={keyLabel} />
      </div>

      {/* Per-session ledger */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Session ledger</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Each paid session, newest first — the disbursement-ready grain.</p>
        {e.lines.length === 0 && <p className="muted">No paid sessions yet. Sessions pay once their clinical note is written.</p>}
        {e.lines.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
                  {['Date', 'Patient', 'Service', 'Session #', 'Night', 'Pay'].map((h, i) => (
                    <th key={h} style={{ padding: '8px 4px', fontSize: 12.5, color: 'var(--c-gray-d)', fontWeight: 600, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {e.lines.slice(0, 80).map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--c-line)' }}>
                    <td style={{ padding: '9px 4px', whiteSpace: 'nowrap' }}>{l.dayLabel} · {l.timeLabel}</td>
                    <td style={{ padding: '9px 4px', fontWeight: 600, color: charcoal }}>{l.patientName}</td>
                    <td style={{ padding: '9px 4px' }}>{l.serviceLabel}</td>
                    <td style={{ padding: '9px 4px' }}>#{l.sessionNumber}</td>
                    <td style={{ padding: '9px 4px' }}>{l.night ? 'Yes' : '—'}</td>
                    <td style={{ padding: '9px 4px', textAlign: 'right', fontWeight: 700 }}>{inr(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
