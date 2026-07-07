import { redirect } from 'next/navigation'
import { IndianRupee, Wallet, Clock3 } from 'lucide-react'
import { getTherapistContext, getTherapistEarnings } from '@/lib/expert'

function inr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

export default async function EarningsPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const e = await getTherapistEarnings(ctx.therapistProfileId)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Earnings</div>
        <div className="page-meta">Razorpay-backed payouts · {e.totalSessions} noted sessions to date · a session counts once its note is written</div>
      </div>

      <div className="grid-4">
        <div className="card">
          <div className="eyebrow">TOTAL EARNED</div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IndianRupee size={16} /> {inr(e.totalEarned)}
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">THIS MONTH</div>
          <div className="section-title">{inr(e.thisMonth)}</div>
          <div className="muted">{e.thisMonthSessions} sessions</div>
        </div>
        <div className="card">
          <div className="eyebrow">PENDING PAYOUT</div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock3 size={16} /> {inr(e.pending)}
          </div>
          <div className="muted">Confirmed, not yet completed</div>
        </div>
        <div className="card">
          <div className="eyebrow">PAYOUT METHOD</div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wallet size={16} /> Razorpay
          </div>
          <div className="muted">Settled after each session is marked complete</div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Pay structure</div>
          <p className="muted" style={{ marginBottom: 12 }}>
            Each completed session = base fee + session-number bonus + night bonus (if applicable) + misc.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Base fee (per session)', e.config.baseFee],
                ['2nd session bonus', e.config.secondSessionBonus],
                ['3rd session onwards bonus', e.config.thirdOnwardsBonus],
                ['Night session bonus', e.config.nightSessionBonus],
                ['Misc bonus', e.config.miscBonus],
              ].map(([label, val]) => (
                <tr key={label as string} style={{ borderBottom: '1px solid var(--c-line)' }}>
                  <td style={{ padding: '8px 4px', color: 'var(--c-gray-d)' }}>{label}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{inr(val as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>How total earned breaks down</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Base fees', e.breakdown.base],
                ['Session-number bonuses', e.breakdown.sessionBonus],
                [`Night bonuses (${e.breakdown.nightSessions} sessions)`, e.breakdown.nightBonus],
                ['Misc bonuses', e.breakdown.miscBonus],
              ].map(([label, val]) => (
                <tr key={label as string} style={{ borderBottom: '1px solid var(--c-line)' }}>
                  <td style={{ padding: '8px 4px', color: 'var(--c-gray-d)' }}>{label}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{inr(val as number)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '10px 4px', fontWeight: 800 }}>Total earned</td>
                <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 800 }}>{inr(e.totalEarned)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>Monthly breakdown</div>
        {e.byMonth.length === 0 && <p className="muted">No noted sessions yet — a session counts toward earnings once you complete it and write its session note.</p>}
        {e.byMonth.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 13, color: 'var(--c-gray-d)' }}>Month</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 13, color: 'var(--c-gray-d)' }}>Sessions</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 13, color: 'var(--c-gray-d)' }}>Earned</th>
              </tr>
            </thead>
            <tbody>
              {e.byMonth.map((m) => (
                <tr key={m.label} style={{ borderBottom: '1px solid var(--c-line)' }}>
                  <td style={{ padding: '8px 4px' }}>{m.label}</td>
                  <td style={{ padding: '8px 4px' }}>{m.sessions}</td>
                  <td style={{ padding: '8px 4px' }}>{inr(m.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
