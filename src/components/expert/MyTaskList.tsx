'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import type { MyTask } from '@/lib/expert'
import { toggleMyAssignedTask } from '@/app/(dashboard)/expert/actions'

/**
 * Admin-assigned tasks on the clinician's own dashboard. Completion persists
 * (optimistic, reverts on failure) so the admin sees the same status back on
 * the clinician's detail page.
 */
export function MyTaskList({ tasks }: { tasks: MyTask[] }) {
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.done])),
  )
  const [, startTransition] = useTransition()

  const toggle = (id: string) => {
    const next = !done[id]
    setDone((d) => ({ ...d, [id]: next }))
    startTransition(async () => {
      const res = await toggleMyAssignedTask(id, next)
      if (!res.ok) setDone((d) => ({ ...d, [id]: !next }))
    })
  }

  if (tasks.length === 0) {
    return <p className="muted" style={{ fontSize: 13.5, margin: '6px 0 0' }}>No tasks from admin right now.</p>
  }

  return (
    <div>
      {tasks.map((t) => {
        const isDone = done[t.id]
        const meta = [
          t.frequencyLabel,
          t.timesLabel,
          isDone ? 'Done' : t.dueLabel ? (t.expired ? `Expired ${t.dueLabel}` : `Until ${t.dueLabel}`) : undefined,
          t.assignedBy ? `by ${t.assignedBy}` : undefined,
        ].filter(Boolean).join(' · ')
        return (
          <div className="task-item" key={t.id}>
            <button
              type="button"
              className={`task-check${isDone ? ' done' : ''}`}
              onClick={() => toggle(t.id)}
              aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
            >
              {isDone && <Check size={14} strokeWidth={3} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={`task-title${isDone ? ' done' : ''}`}>{t.title}</div>
              {t.detail && <div className="task-detail">{t.detail}</div>}
              {meta && (
                <div className="task-detail" style={{ color: t.expired && !isDone ? 'var(--c-coral)' : undefined }}>{meta}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
