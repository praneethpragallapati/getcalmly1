import type { WeekPoint } from '@/lib/progressPatterns'
import type { BandTone } from '@/lib/outcomes/instruments'

/**
 * A weekly line chart for the behavioural patterns (mood average, check-ins,
 * task adherence). One value per week over time; null weeks are skipped and the
 * line connects the weeks that have data. Optional coloured zone bands shade the
 * background so a glance shows which zone the values sit in, the same way the
 * symptom trackers do.
 */
export type Zone = { min: number; max: number; tone: BandTone }

const W = 300, H = 116, padL = 26, padR = 12, padT = 12, padB = 22

const BAND_FILL: Record<BandTone, string> = {
  good: 'var(--c-green-pale)',
  mild: 'var(--c-gold-pale)',
  warn: 'rgba(201,151,58,.20)',
  bad: 'var(--c-coral-pale)',
}

export function WeeklyChart({
  points, min, max, suffix = '', zones,
}: {
  points: { label: string; value: number | null }[]
  min: number; max: number; suffix?: string; zones?: Zone[]
}) {
  const withVal = points.map((p, i) => ({ ...p, i })).filter((p) => p.value != null) as { label: string; value: number; i: number }[]
  if (withVal.length < 2) return null
  const span = max - min || 1
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const n = points.length
  const x = (i: number) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const y = (v: number) => padT + (1 - (v - min) / span) * plotH

  const line = withVal.map((p) => `${x(p.i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const last = withVal[withVal.length - 1]

  return (
    <div className="oc-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Weekly trend">
        {/* zone bands */}
        {(zones ?? []).map((z, zi) => {
          const yTop = y(Math.min(z.max, max))
          const yBot = y(Math.max(z.min, min))
          return <rect key={zi} x={padL} y={yTop} width={plotW} height={Math.max(0, yBot - yTop)} fill={BAND_FILL[z.tone]} />
        })}
        <line x1={padL} x2={W - padR} y1={y(min)} y2={y(min)} stroke="var(--c-line)" strokeWidth="1" />
        <text x={padL - 4} y={y(max) + 3} textAnchor="end" fontSize="8" fill="var(--c-gray)">{max}{suffix}</text>
        <text x={padL - 4} y={y(min) + 3} textAnchor="end" fontSize="8" fill="var(--c-gray)">{min}{suffix}</text>
        <polyline points={line} fill="none" stroke="var(--c-coral)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {withVal.map((p) => (
          <circle key={p.i} cx={x(p.i)} cy={y(p.value)} r={p.i === last.i ? 4 : 2.4}
                  fill={p.i === last.i ? 'var(--c-coral)' : 'var(--c-white)'} stroke="var(--c-coral)" strokeWidth="1.5" />
        ))}
        <text x={x(last.i)} y={y(last.value) - 7} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-coral-d)">{last.value}{suffix}</text>
        <text x={padL} y={H - 6} textAnchor="start" fontSize="8" fill="var(--c-gray)">{points[0].label}</text>
        <text x={W - padR} y={H - 6} textAnchor="end" fontSize="8" fill="var(--c-gray)">{points[n - 1].label}</text>
      </svg>
    </div>
  )
}

/** Convenience: pull one metric out of the week buckets into chart points. */
export function toPoints(weeks: WeekPoint[], metric: 'calmAvg' | 'checkins' | 'adherence'): { label: string; value: number | null }[] {
  return weeks.map((w) => ({ label: w.label, value: w[metric] }))
}
