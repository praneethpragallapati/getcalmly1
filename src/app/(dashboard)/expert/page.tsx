import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { getTherapistContext, getCaseload, type MoodTrend } from '@/lib/expert'

const TREND_ICON: Record<MoodTrend, typeof TrendingUp> = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  insufficient: Minus,
}
const TREND_CLASS: Record<MoodTrend, string> = {
  improving: 't-green',
  declining: 't-coral',
  stable: 't-purple',
  insufficient: 't-gold',
}

export default async function ExpertCaseloadPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const patients = await getCaseload(ctx.therapistProfileId)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Patients</div>
        <div className="page-meta">{patients.length} in your caseload</div>
      </div>

      <div className="card">
        {patients.length === 0 && <p className="muted">No patients with scheduled appointments yet.</p>}
        {patients.map((p) => {
          const Icon = TREND_ICON[p.moodTrend]
          return (
            <Link key={p.patientId} href={`/expert/patients/${p.patientId}`} className="pattern" style={{ textDecoration: 'none' }}>
              <span className={`pattern-ic ${TREND_CLASS[p.moodTrend]}`}>
                <Icon size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="pattern-title">{p.name}</div>
                <div className="pattern-sub">
                  {p.trackLabel} · Mood {p.moodTrend} · Sessions {p.sessionsDone}/{p.sessionsTotal}
                </div>
              </div>
              {p.openCrisisCount > 0 && (
                <span className="pattern-sub" style={{ color: 'var(--c-coral)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={13} /> {p.openCrisisCount} open
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
