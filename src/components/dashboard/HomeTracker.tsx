'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pill, Activity, FileText, Check, LineChart } from 'lucide-react'
import type { DashTask } from '@/data/dashboardDemo'
import { TaskList } from './TaskList'

type Tab = 'act' | 'pulse' | 'forms'

type Med = { name: string; dosage?: string; frequency?: string; times: string[] } | null

/**
 * The home tracker that sits where the standalone mood chart used to — one card
 * with Activities / Pulse / Forms tabs, mirroring the mobile app so the two home
 * screens read the same. Activities carries the expert-assigned tasks (and
 * today's medication as a footer strip); Pulse and Forms list what's waiting,
 * each linking through to its full page.
 */
export function HomeTracker({
  tasks,
  openTasks,
  med,
  pulseDue,
  forms,
}: {
  tasks: DashTask[]
  openTasks: number
  med: Med
  pulseDue: { id: string; short: string }[]
  forms: { id: string; title: string }[]
}) {
  const [tab, setTab] = useState<Tab>('act')

  return (
    <div className="card tracker-card">
      <div className="seg tracker-seg">
        <button className={`seg-btn${tab === 'act' ? ' on' : ''}`} onClick={() => setTab('act')}>
          Activities
        </button>
        <button className={`seg-btn${tab === 'pulse' ? ' on' : ''}`} onClick={() => setTab('pulse')}>
          Pulse{pulseDue.length > 0 && <span className="seg-count">{pulseDue.length}</span>}
        </button>
        <button className={`seg-btn${tab === 'forms' ? ' on' : ''}`} onClick={() => setTab('forms')}>
          Forms{forms.length > 0 && <span className="seg-count">{forms.length}</span>}
        </button>
      </div>

      {tab === 'act' && (
        <div className="tracker-body">
          <div className="tracker-head">
            <div className="section-title">Today’s activities</div>
            <span className="link-action">{openTasks} left</span>
          </div>
          <TaskList tasks={tasks} />
          {med && (
            <Link href="/app/medications" className="med-strip">
              <span className="task-ic"><Pill size={15} /></span>
              <span className="med-strip-body">
                <span className="med-strip-name">{med.name} {med.dosage}</span>
                <span className="med-strip-sub">{med.frequency} · {med.times.join(', ')}</span>
              </span>
              <span className="link-action">Manage →</span>
            </Link>
          )}
        </div>
      )}

      {tab === 'pulse' && (
        <div className="tracker-body">
          <div className="tracker-head">
            <div className="section-title">Pulse</div>
            <span className="link-action">{pulseDue.length ? `${pulseDue.length} to do` : 'All done'}</span>
          </div>
          <div className="todo-list">
            {pulseDue.length === 0 ? (
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: '8px 0 0' }}>
                No pulse checks waiting. Your care team assigns these between sessions.
              </p>
            ) : (
              pulseDue.map((p) => (
                <Link key={p.id} href="/app/pulse" className="todo-row">
                  <span className="todo-ic t-coral"><Activity size={15} /></span>
                  <span className="todo-body">
                    <span className="todo-t">{p.short}</span>
                    <span className="todo-sub">Pulse check · about two minutes</span>
                  </span>
                  <span className="link-action">Take →</span>
                </Link>
              ))
            )}
            <Link href="/app/progress" className="todo-row">
              <span className="todo-ic t-green"><LineChart size={15} /></span>
              <span className="todo-body">
                <span className="todo-t">See your Pulse trends</span>
                <span className="todo-sub">Every score charts in My Progress</span>
              </span>
              <span className="link-action">Open →</span>
            </Link>
          </div>
        </div>
      )}

      {tab === 'forms' && (
        <div className="tracker-body">
          <div className="tracker-head">
            <div className="section-title">Forms</div>
            <span className="link-action">{forms.length ? `${forms.length} pending` : 'All done'}</span>
          </div>
          <div className="todo-list">
            {forms.length === 0 ? (
              <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: '8px 0 0' }}>
                <Check size={13} strokeWidth={3} style={{ verticalAlign: '-2px' }} /> You’re all caught up — no forms to fill.
              </p>
            ) : (
              forms.map((f) => (
                <Link key={f.id} href="/app/forms" className="todo-row">
                  <span className="todo-ic t-purple"><FileText size={15} /></span>
                  <span className="todo-body">
                    <span className="todo-t">{f.title}</span>
                    <span className="todo-sub">Form from your care team</span>
                  </span>
                  <span className="link-action">Fill →</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
