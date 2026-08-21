'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { MasterPayout, PayoutBreakdownRow } from '@/lib/admin'
import { expertCode } from '@/lib/ids'

const charcoal = '#1C2B3A'
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
type Grain = 'day' | 'month' | 'year'
const GRAINS: { key: Grain; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

/**
 * Master payout: every clinician's earnings at the day / month / year grain,
 * with the pay breakup (base sessions, 2nd-session bonus, 3rd-onwards bonus,
 * night, misc) so it's clear who is owed what and why. Downloads the current
 * grain as CSV.
 */
export function MasterPayoutView({ data }: { data: MasterPayout }) {
  const [grain, setGrain] = useState<Grain>('month')
  const rows: PayoutBreakdownRow[] = grain === 'day' ? data.byDay : grain === 'year' ? data.byYear : data.byMonth

  function downloadCsv() {
    const header = [
      'Period', 'Clinician', 'Expert ID', 'Engagement', 'Sessions',
      'Base ₹', '2nd-session bonus count', '2nd-session bonus ₹',
      '3rd-onwards bonus count', '3rd-onwards bonus ₹',
      'Night count', 'Night bonus ₹', 'Misc ₹', 'Total payout ₹',
    ]
    const esc = (v: string | number) => {
      const s = String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = rows.map((r) => [
      r.periodLabel, r.name, expertCode(r.profileId), r.employmentType === 'PART_TIME' ? 'Part-time' : 'Full-time',
      r.sessions, r.baseTotal, r.secondCount, r.secondTotal, r.thirdPlusCount, r.thirdPlusTotal,
      r.nightCount, r.nightTotal, r.miscTotal, r.total,
    ].map(esc).join(','))
    const csv = [header.map(esc).join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `therapist-payout-by-${grain}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sum = (rs: PayoutBreakdownRow[]) => rs.reduce((a, r) => ({
    sessions: a.sessions + r.sessions,
    baseTotal: a.baseTotal + r.baseTotal,
    secondTotal: a.secondTotal + r.secondTotal,
    thirdPlusTotal: a.thirdPlusTotal + r.thirdPlusTotal,
    nightTotal: a.nightTotal + r.nightTotal,
    miscTotal: a.miscTotal + r.miscTotal,
    total: a.total + r.total,
  }), { sessions: 0, baseTotal: 0, secondTotal: 0, thirdPlusTotal: 0, nightTotal: 0, miscTotal: 0, total: 0 })
  const totals = sum(rows)
  const partTime = sum(rows.filter((r) => r.employmentType === 'PART_TIME'))

  const th: React.CSSProperties = { padding: '8px 8px', fontSize: 11.5, color: 'var(--c-gray-d)', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }
  const thL: React.CSSProperties = { ...th, textAlign: 'left' }
  const td: React.CSSProperties = { padding: '9px 8px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap' }
  const tdL: React.CSSProperties = { ...td, textAlign: 'left' }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Master payout — who gets paid what</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(28,43,58,.05)', padding: 3, borderRadius: 9 }}>
            {GRAINS.map((g) => (
              <button key={g.key} type="button" onClick={() => setGrain(g.key)} style={{
                border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                background: grain === g.key ? '#fff' : 'transparent', color: grain === g.key ? '#6D5BD0' : '#8E9EAE',
                boxShadow: grain === g.key ? '0 1px 4px rgba(28,43,58,.1)' : 'none',
              }}>{g.label}</button>
            ))}
          </div>
          <button type="button" onClick={downloadCsv} disabled={rows.length === 0} className="btn" style={{ border: '1.5px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
        Each row is one clinician in one {grain}. Base counts every session; bonuses count how many sessions earned the 2nd / 3rd-onwards uplift. A session counts once its note is written.
      </p>

      {rows.length === 0 ? (
        <p className="muted">No earnings recorded yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-line)' }}>
                <th style={thL}>{grain === 'day' ? 'Day' : grain === 'year' ? 'Year' : 'Month'}</th>
                <th style={thL}>Clinician</th>
                <th style={th}>Sessions</th>
                <th style={th}>Base</th>
                <th style={th}>2nd bonus</th>
                <th style={th}>3rd+ bonus</th>
                <th style={th}>Night</th>
                <th style={th}>Misc</th>
                <th style={th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.periodKey} style={{ borderBottom: '1px solid var(--c-line)' }}>
                  <td style={tdL}>{r.periodLabel}</td>
                  <td style={tdL}>
                    <span style={{ fontWeight: 600, color: charcoal }}>{r.name}</span>
                    <span style={{ marginLeft: 7, fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#6D5BD0' }}>{expertCode(r.profileId)}</span>
                    <span className="muted" style={{ marginLeft: 7, fontSize: 11 }}>{r.employmentType === 'PART_TIME' ? 'PT' : 'FT'}</span>
                  </td>
                  <td style={td}>{r.sessions}</td>
                  <td style={td}>{inr(r.baseTotal)}</td>
                  <td style={td}>{r.secondCount ? `${r.secondCount} · ${inr(r.secondTotal)}` : '—'}</td>
                  <td style={td}>{r.thirdPlusCount ? `${r.thirdPlusCount} · ${inr(r.thirdPlusTotal)}` : '—'}</td>
                  <td style={td}>{r.nightCount ? `${r.nightCount} · ${inr(r.nightTotal)}` : '—'}</td>
                  <td style={td}>{r.miscTotal ? inr(r.miscTotal) : '—'}</td>
                  <td style={{ ...td, fontWeight: 800, color: charcoal }}>{inr(r.total)}</td>
                </tr>
              ))}
            </tbody>
            {/* Without a total there was no way to check the "Payouts owed this
                month" card against this table: the card sums PART-TIME
                clinicians only (full-timers are salaried), while every row here
                is one clinician, so a card of 2,400 next to a row of 1,250 looks
                like a contradiction when it is two clinicians. Both totals are
                shown so the difference is legible instead of alarming. */}
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--c-line)' }}>
                <td style={{ ...tdL, fontWeight: 800, color: charcoal }} colSpan={2}>
                  All clinicians · {rows.length} row{rows.length === 1 ? '' : 's'}
                </td>
                <td style={{ ...td, fontWeight: 800 }}>{totals.sessions}</td>
                <td style={{ ...td, fontWeight: 800 }}>{inr(totals.baseTotal)}</td>
                <td style={{ ...td, fontWeight: 800 }}>{totals.secondTotal ? inr(totals.secondTotal) : '—'}</td>
                <td style={{ ...td, fontWeight: 800 }}>{totals.thirdPlusTotal ? inr(totals.thirdPlusTotal) : '—'}</td>
                <td style={{ ...td, fontWeight: 800 }}>{totals.nightTotal ? inr(totals.nightTotal) : '—'}</td>
                <td style={{ ...td, fontWeight: 800 }}>{totals.miscTotal ? inr(totals.miscTotal) : '—'}</td>
                <td style={{ ...td, fontWeight: 900, color: charcoal }}>{inr(totals.total)}</td>
              </tr>
              <tr>
                <td style={{ ...tdL, paddingTop: 2 }} colSpan={7} className="muted">
                  Of which part-time — what is actually owed out, and what the
                  &ldquo;Payouts owed&rdquo; cards above count. Full-timers are salaried.
                </td>
                <td style={{ ...td, paddingTop: 2 }} className="muted">{partTime.sessions} sessions</td>
                <td style={{ ...td, paddingTop: 2, fontWeight: 800, color: charcoal }}>{inr(partTime.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
