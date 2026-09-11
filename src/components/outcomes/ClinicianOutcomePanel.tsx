import { getOutcomeState } from '@/lib/outcomes/store'
import { INSTRUMENTS, who5Percent } from '@/lib/outcomes/instruments'
import type { BandTone } from '@/lib/outcomes/classify'

/**
 * Clinician-facing outcome review: every measured stream with its response
 * class, change from baseline and provenance — signals with a "why", not an
 * opaque verdict. The therapist stays the decision-maker.
 */

const PRIORITY = ['CSSRS', 'PHQ9', 'GAD7', 'K10', 'WHO5', 'GAS', 'CGI']
const TONE_COLOR: Record<BandTone, string> = {
  good: 'var(--c-green-ink, #276b4b)',
  mild: 'var(--c-gold-ink, #8d6a29)',
  warn: 'var(--c-gold-ink, #8d6a29)',
  bad: 'var(--c-coral-d, #a8432d)',
}
const SOURCE: Record<string, string> = { patient: 'self-report', clinician: 'clinician', derived: 'derived' }

function when(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export async function ClinicianOutcomePanel({ userId }: { userId: string }) {
  const state = await getOutcomeState(userId)
  const withData = state.filter((s) => s.verdict.current != null)
  if (withData.length === 0) return null
  const ordered = [...withData].sort((a, b) => PRIORITY.indexOf(a.instrumentId) - PRIORITY.indexOf(b.instrumentId))

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Outcome measures</h2>
        <span className="muted" style={{ fontSize: 11.5 }}>Signals, not a verdict</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ordered.map((s) => {
          const inst = INSTRUMENTS[s.instrumentId]
          const v = s.verdict
          const value = s.instrumentId === 'WHO5' && v.currentPercent != null
            ? `${v.currentPercent}%`
            : String(v.current)
          const baseline = s.instrumentId === 'WHO5' && v.baseline != null ? `${who5Percent(v.baseline)}%` : String(v.baseline)
          const delta = v.deltaPoints != null && v.deltaPoints !== 0 && s.series.length > 1
            ? ` (from ${baseline})`
            : ''
          return (
            <div key={s.instrumentId} style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--c-line)', paddingTop: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--c-charcoal)', minWidth: 150 }}>{inst.short}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{value}<span className="muted" style={{ fontWeight: 500 }}>{delta}</span></span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: TONE_COLOR[v.tone] }}>{v.label}</span>
              <span className="muted" style={{ fontSize: 11.5, marginLeft: 'auto' }}>
                {SOURCE[s.source] ?? s.source} · {when(s.lastUpdated)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
