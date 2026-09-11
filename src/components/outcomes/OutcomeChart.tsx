import { INSTRUMENTS, type BandTone } from '@/lib/outcomes/instruments'
import type { OutcomePoint } from '@/lib/outcomes/classify'

/**
 * A symptom-trajectory chart: the score line over time, drawn on top of the
 * instrument's severity bands (shaded zones), with the clinical cutoff marked.
 * Pure inline SVG so it needs no library and reads in both themes via tokens.
 */

const BAND_FILL: Record<BandTone, string> = {
  good: 'var(--c-green-pale)',
  mild: 'var(--c-gold-pale)',
  warn: 'rgba(201,151,58,.20)',
  bad: 'var(--c-coral-pale)',
}

const W = 320, H = 150, padL = 26, padR = 10, padT = 10, padB = 22

function short(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function OutcomeChart({ instrumentId, series }: { instrumentId: string; series: OutcomePoint[] }) {
  const inst = INSTRUMENTS[instrumentId]
  if (!inst || series.length < 2) return null
  const { min, max } = inst
  const span = max - min || 1
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const x = (i: number) => padL + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW)
  const y = (v: number) => padT + (1 - (v - min) / span) * plotH

  const pts = series.map((p, i) => ({ cx: x(i), cy: y(p.score), v: p.score }))
  const line = pts.map((p) => `${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <div className="oc-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" role="img"
           aria-label={`${inst.short} trajectory`}>
        {/* severity bands */}
        {inst.bands.map((b) => {
          const yTop = y(Math.min(b.max, max))
          const yBot = y(Math.max(b.min, min))
          return <rect key={b.label} x={padL} y={yTop} width={plotW} height={Math.max(0, yBot - yTop)} fill={BAND_FILL[b.tone]} />
        })}
        {/* clinical cutoff line */}
        {inst.clinicalCutoff != null && (
          <line x1={padL} x2={W - padR} y1={y(inst.clinicalCutoff)} y2={y(inst.clinicalCutoff)}
                stroke="var(--c-charcoal)" strokeDasharray="3 3" strokeWidth="0.7" opacity="0.35" />
        )}
        {/* axis min/max labels */}
        <text x={padL - 4} y={y(max) + 3} textAnchor="end" fontSize="8" fill="var(--c-gray)">{max}</text>
        <text x={padL - 4} y={y(min) + 3} textAnchor="end" fontSize="8" fill="var(--c-gray)">{min}</text>
        {/* line */}
        <polyline points={line} fill="none" stroke="var(--c-coral)" strokeWidth="2"
                  strokeLinejoin="round" strokeLinecap="round" />
        {/* dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={i === pts.length - 1 ? 4 : 2.6}
                  fill={i === pts.length - 1 ? 'var(--c-coral)' : 'var(--c-white)'}
                  stroke="var(--c-coral)" strokeWidth="1.5" />
        ))}
        {/* current value label */}
        <text x={last.cx} y={last.cy - 7} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-coral-d)">{last.v}</text>
        {/* x endpoints */}
        <text x={padL} y={H - 6} textAnchor="start" fontSize="8" fill="var(--c-gray)">{short(series[0].recordedAt)}</text>
        <text x={W - padR} y={H - 6} textAnchor="end" fontSize="8" fill="var(--c-gray)">{short(series[series.length - 1].recordedAt)}</text>
      </svg>
    </div>
  )
}
