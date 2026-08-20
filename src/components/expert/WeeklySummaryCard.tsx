import { TrendingUp, TrendingDown, Minus, NotebookPen } from 'lucide-react'
import type { PatientWeeklySummary } from '@/lib/patientSummary'

/**
 * The patient's week at a glance, built only from what's on the record: the
 * clinician's own session notes, the patient's mood check-ins, and how the
 * assigned tasks are going. Nothing is model-generated, so every figure here can
 * be checked against the sections below it on the page.
 */
export function WeeklySummaryCard({ summary }: { summary: PatientWeeklySummary }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="section-title">This week</div>
        <span className="muted" style={{ fontSize: 12 }}>{summary.rangeLabel}</span>
      </div>

      {summary.empty ? (
        <p className="muted" style={{ fontSize: 13.5, margin: '8px 0 0' }}>
          Nothing recorded yet this week — no check-ins, no tasks and no session notes.
        </p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 14,
              marginTop: 12,
            }}
          >
            {summary.lines.map((l) => (
              <div key={l.label} style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-gray, #8E9EAE)', marginBottom: 4 }}>
                  {l.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)' }}>{l.value}</span>
                  <Trend trend={l.trend} />
                </div>
                {l.detail && (
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{l.detail}</div>
                )}
              </div>
            ))}
          </div>

          {summary.lastNote && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(28,43,58,.07)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--c-gray, #8E9EAE)', flexShrink: 0, marginTop: 2 }}><NotebookPen size={15} /></span>
              <div style={{ minWidth: 0 }}>
                <div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>
                  Last session note · {summary.lastNote.dateLabel} · {summary.lastNote.author}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#3A4A5A', marginTop: 2 }}>
                  {summary.lastNote.focus}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Movement against the previous week. Mood up is good; counts are neutral. */
function Trend({ trend }: { trend?: 'up' | 'down' | 'flat' }) {
  if (!trend) return null
  if (trend === 'flat') return <Minus size={14} style={{ color: '#8E9EAE' }} aria-label="unchanged" />
  const Icon = trend === 'up' ? TrendingUp : TrendingDown
  return (
    <Icon
      size={14}
      style={{ color: trend === 'up' ? '#3D9E72' : '#C0504B' }}
      aria-label={trend === 'up' ? 'up on last week' : 'down on last week'}
    />
  )
}
