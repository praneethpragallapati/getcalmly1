'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pill, Activity, FileText, Check, LineChart, Stethoscope } from 'lucide-react'
import type { DashTask } from '@/data/dashboardDemo'
import { TaskList } from './TaskList'

type Tab = 'act' | 'pulse' | 'forms'

type Med = { name: string; dosage?: string; frequency?: string; times: string[] } | null

/**
 * The home tracker that sits where the standalone mood chart used to, one card
 * with Activities / Pulse / Forms tabs, mirroring the mobile app so the two home
 * screens read the same. Activities carries the expert-assigned tasks (and
 * today's medication as a footer strip); Pulse and Forms list what's waiting,
 * each linking through to its full page.
 */
export function HomeTracker({
  tasks,
  med,
  pulseDue,
  forms,
  formsEverAssigned = false,
}: {
  tasks: DashTask[]
  med: Med
  pulseDue: { id: string; short: string }[]
  forms: { id: string; title: string }[]
  formsEverAssigned?: boolean
}) {
  const [tab, setTab] = useState<Tab>('act')

  // The guided tour switches tabs as it walks through Activities / Pulse / Forms.
  useEffect(() => {
    const onTab = (e: Event) => {
      const t = (e as CustomEvent).detail as Tab
      if (t === 'act' || t === 'pulse' || t === 'forms') setTab(t)
    }
    window.addEventListener('gc-tracker-tab', onTab)
    return () => window.removeEventListener('gc-tracker-tab', onTab)
  }, [])

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
          {pulseDue.length === 0 ? (
            <div className="done-card">
              <span className="dc-ic"><Check size={22} strokeWidth={3} /></span>
              <div className="dc-t">Nothing to check in on</div>
              <div className="dc-s">No pulse checks waiting right now. Your scores chart in My Progress.</div>
            </div>
          ) : (
            <>
              <div className="tracker-head">
                <div className="section-title">Pulse</div>
                <span className="link-action">{pulseDue.length} to do</span>
              </div>
              <div className="by-tp">
                <Stethoscope size={16} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="by-tp-b">Requested by your care team</span>{' '}
                  <span className="by-tp-s">· short check-ins your therapist assigned; open each one to fill it in</span>
                </div>
              </div>
              <div className="todo-list">
                {pulseDue.map((p) => (
                  <Link key={p.id} href="/app/pulse" className="todo-row">
                    <span className="todo-ic t-coral"><Activity size={15} /></span>
                    <span className="todo-body">
                      <span className="todo-t">{p.short}</span>
                      <span className="todo-sub">Pulse check · about two minutes</span>
                    </span>
                    <span className="link-action">Fill →</span>
                  </Link>
                ))}
                <Link href="/app/progress" className="todo-row">
                  <span className="todo-ic t-green"><LineChart size={15} /></span>
                  <span className="todo-body">
                    <span className="todo-t">See your Pulse trends</span>
                    <span className="todo-sub">Every score charts in My Progress</span>
                  </span>
                  <span className="link-action">Open →</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'forms' && (
        <div className="tracker-body">
          {forms.length === 0 ? (
            <div className="done-card">
              <span className="dc-ic"><Check size={22} strokeWidth={3} /></span>
              <div className="dc-t">{formsEverAssigned ? 'All forms complete' : 'No forms for now'}</div>
              <div className="dc-s">
                {formsEverAssigned
                  ? 'Nothing waiting from your care team.'
                  : 'Your therapist sends these when they need information from you.'}
              </div>
            </div>
          ) : (
            <>
              <div className="tracker-head">
                <div className="section-title">Forms</div>
                <span className="link-action">{forms.length} to fill</span>
              </div>
              <div className="by-tp">
                <Stethoscope size={16} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="by-tp-b">Requested by your care team</span>{' '}
                  <span className="by-tp-s">· information your therapist asked for; open each one to fill it in</span>
                </div>
              </div>
              <div className="todo-list">
                {forms.map((f) => (
                  <Link key={f.id} href="/app/forms" className="todo-row">
                    <span className="todo-ic t-purple"><FileText size={15} /></span>
                    <span className="todo-body">
                      <span className="todo-t">{f.title}</span>
                      <span className="todo-sub">Form from your care team</span>
                    </span>
                    <span className="link-action">Fill →</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
