'use client'

import { useState, useTransition } from 'react'
import { Check, Activity, PlayCircle, BookOpen, PenLine, Wind } from 'lucide-react'
import type { DashTask } from '@/data/dashboardDemo'
import { toggleTask } from '@/app/(dashboard)/app/actions'

const TYPE_ICON = {
  EXERCISE: Activity,
  VIDEO: PlayCircle,
  READING: BookOpen,
  REFLECTION: PenLine,
  BREATHING: Wind,
} as const

/**
 * Expert-assigned daily tasks (#16). Completion is persisted (it feeds the weekly
 * progress summary both the patient and their expert see); the toggle is
 * optimistic and reverts if the server write fails.
 */
export function TaskList({ tasks }: { tasks: DashTask[] }) {
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.done])),
  )
  const [, startTransition] = useTransition()

  const toggle = (id: string) => {
    const next = !done[id]
    setDone((d) => ({ ...d, [id]: next }))
    startTransition(async () => {
      const res = await toggleTask(id, next)
      if (!res.ok) setDone((d) => ({ ...d, [id]: !next })) // revert on failure
    })
  }

  return (
    <div>
      {tasks.map((t) => {
        const Icon = TYPE_ICON[t.type]
        const isDone = done[t.id]
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
              {(t.dueLabel || t.frequencyLabel) && (
                <div className="task-detail" style={{ color: t.expired && !isDone ? 'var(--c-coral)' : undefined }}>
                  {t.frequencyLabel ? `${t.frequencyLabel}${t.dueLabel ? ' · ' : ''}` : ''}
                  {t.dueLabel ? (t.expired && !isDone ? `Expired ${t.dueLabel}` : `Until ${t.dueLabel}`) : ''}
                </div>
              )}
            </div>
            <span className="task-ic">
              <Icon size={16} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
