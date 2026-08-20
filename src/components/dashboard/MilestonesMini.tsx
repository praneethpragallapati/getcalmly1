import Link from 'next/link'
import { Check } from 'lucide-react'
import type { MilestoneView } from '@/lib/milestones'

/**
 * The concise milestone companion beside the mood chart: how many are unlocked,
 * and the two nearest wins with their progress. The full catalogue lives on
 * My Progress — this is a glance, sized to sit level with the chart.
 */
export function MilestonesMini({ milestones }: { milestones: MilestoneView[] }) {
  const done = milestones.filter((m) => m.done).length
  const next = milestones
    .filter((m) => !m.done)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3)
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0

  return (
    <div className="mini-card tint-gold">
      <div className="eyebrow">MILESTONES</div>

      <div className="mini-score">
        <span className="mini-n">{done}</span>
        <span className="mini-of">of {milestones.length}</span>
      </div>
      <div className="mini-track"><span className="mini-fill" style={{ width: `${pct}%` }} /></div>

      <div className="mini-list">
        {next.length === 0 ? (
          <p className="muted mini-empty">Every milestone unlocked. Remarkable.</p>
        ) : (
          next.map((m) => (
            <div className="mini-item" key={m.key}>
              <span className="mini-ic">{m.icon}</span>
              <div className="mini-item-body">
                <div className="mini-item-label">{m.label}</div>
                <div className="mini-item-sub">{m.sub}</div>
                <div className="mini-item-track">
                  <span style={{ width: `${Math.round(m.progress * 100)}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {done > 0 && (
        <div className="mini-done">
          <Check size={12} strokeWidth={3} /> {done} unlocked so far
        </div>
      )}
      <Link href="/app/progress" className="mini-link">See all →</Link>
    </div>
  )
}
