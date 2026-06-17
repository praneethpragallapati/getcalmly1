'use client'

import { useState } from 'react'
import { Check, Activity, PlayCircle, BookOpen, PenLine, Wind } from 'lucide-react'
import type { DashTask } from '@/data/dashboardDemo'

const TYPE_ICON = {
  EXERCISE: Activity,
  VIDEO: PlayCircle,
  READING: BookOpen,
  REFLECTION: PenLine,
  BREATHING: Wind,
} as const

/**
 * Expert-assigned daily tasks (#16). Toggle is local for now; persistence lands
 * with the data layer.
 */
export function TaskList({ tasks }: { tasks: DashTask[] }) {
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(tasks.map((t) => [t.id, t.done])),
  )

  return (
    <div className="app-card task-list">
      {tasks.map((t) => {
        const Icon = TYPE_ICON[t.type]
        const isDone = done[t.id]
        return (
          <div className="task-item" key={t.id}>
            <button
              type="button"
              className={`task-check${isDone ? ' done' : ''}`}
              onClick={() => setDone((d) => ({ ...d, [t.id]: !d[t.id] }))}
              aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
            >
              {isDone && <Check size={14} strokeWidth={3} />}
            </button>
            <div className="task-body">
              <div className={`task-title${isDone ? ' done' : ''}`}>{t.title}</div>
              {t.detail && <div className="task-detail">{t.detail}</div>}
            </div>
            <span className="task-type-icon">
              <Icon size={16} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
