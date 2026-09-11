import Link from 'next/link'
import { Activity, FileText } from 'lucide-react'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'

/**
 * Home-page box for the things waiting on the patient: due Pulse checks and
 * unfilled forms. Deliberately a calm card (like the Calm Club poll box), not a
 * coloured banner — the same items also live in their own Pulse and Forms tabs,
 * so this is a quiet nudge, not an alarm. Renders nothing when there's nothing due.
 */
export function HomeCheckins({
  pulseDue, forms,
}: {
  pulseDue: string[]
  forms: { id: string; title: string }[]
}) {
  const total = pulseDue.length + forms.length
  if (total === 0) return null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div className="section-title">Check-ins &amp; forms</div>
        <span className="link-action">{total} to do</span>
      </div>
      <div className="todo-list">
        {pulseDue.map((id) => (
          <Link key={`pulse-${id}`} href="/app/pulse" className="todo-row">
            <span className="todo-ic t-coral"><Activity size={15} /></span>
            <span className="todo-body">
              <span className="todo-t">{INSTRUMENTS[id]?.short ?? id}</span>
              <span className="todo-sub">Pulse check · about two minutes</span>
            </span>
            <span className="link-action">Take →</span>
          </Link>
        ))}
        {forms.map((f) => (
          <Link key={`form-${f.id}`} href="/app/forms" className="todo-row">
            <span className="todo-ic t-purple"><FileText size={15} /></span>
            <span className="todo-body">
              <span className="todo-t">{f.title}</span>
              <span className="todo-sub">Form from your care team</span>
            </span>
            <span className="link-action">Fill →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
