'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pill, Activity, FileText, Check, LineChart, Stethoscope, X } from 'lucide-react'
import type { DashTask } from '@/data/dashboardDemo'
import type { FormField } from '@/data/forms'
import { PulseRunner, type PulseDef } from '@/components/outcomes/PulseRunner'
import { FormFiller } from './FormFiller'
import { Celebration } from './Celebration'
import { TaskList } from './TaskList'

type Tab = 'act' | 'pulse' | 'forms'

type Med = { name: string; dosage?: string; frequency?: string; times: string[] } | null

export type HomeFormDetail = { id: string; title: string; description: string | null; fields: FormField[] }
type Open = { kind: 'pulse'; id: string } | { kind: 'form'; id: string } | null

/**
 * The home tracker that sits where the standalone mood chart used to, one card
 * with Activities / Pulse / Forms tabs, mirroring the mobile app so the two home
 * screens read the same. Activities carries the expert-assigned tasks (and
 * today's medication as a footer strip); Pulse and Forms list what's waiting
 * and open in a pop-up right here, so all three live only on the home page.
 */
export function HomeTracker({
  tasks,
  med,
  pulseDue,
  forms,
  formsEverAssigned = false,
  pulseDefs = [],
  formDetails = [],
  initialTab = 'act',
  initialForm,
}: {
  tasks: DashTask[]
  med: Med
  pulseDue: { id: string; short: string }[]
  forms: { id: string; title: string }[]
  formsEverAssigned?: boolean
  /** Question sets for the due Pulse checks, so they can be filled in place. */
  pulseDefs?: PulseDef[]
  /** Full questions for each pending form, so they can be filled in place. */
  formDetails?: HomeFormDetail[]
  initialTab?: Tab
  /** Open this form's pop-up on arrival (e.g. from a "new form" notification). */
  initialForm?: string
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialForm ? 'forms' : initialTab)
  const [open, setOpen] = useState<Open>(initialForm ? { kind: 'form', id: initialForm } : null)
  const [cel, setCel] = useState<{ title: string; sub: string } | null>(null)

  const close = useCallback(() => {
    setOpen(null)
    // Drop any ?tab= / ?form= we arrived with, so a reload doesn't reopen it.
    if (window.location.search) router.replace('/app', { scroll: false })
  }, [router])

  const submitted = (title: string, sub: string) => {
    close()
    setCel({ title, sub })
    router.refresh() // the filled item drops off the list (or the tab shows "done")
  }

  // Esc closes the pop-up.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const openPulse = open?.kind === 'pulse' ? pulseDefs.find((d) => d.id === open.id) : undefined
  const openForm = open?.kind === 'form' ? formDetails.find((d) => d.id === open.id) : undefined

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
                  <button key={p.id} type="button" className="todo-row todo-btn" onClick={() => setOpen({ kind: 'pulse', id: p.id })}>
                    <span className="todo-ic t-coral"><Activity size={15} /></span>
                    <span className="todo-body">
                      <span className="todo-t">{p.short}</span>
                      <span className="todo-sub">Pulse check · about two minutes</span>
                    </span>
                    <span className="link-action">Fill →</span>
                  </button>
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
                  <button key={f.id} type="button" className="todo-row todo-btn" onClick={() => setOpen({ kind: 'form', id: f.id })}>
                    <span className="todo-ic t-purple"><FileText size={15} /></span>
                    <span className="todo-body">
                      <span className="todo-t">{f.title}</span>
                      <span className="todo-sub">Form from your care team</span>
                    </span>
                    <span className="link-action">Fill →</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {(openPulse || openForm) && (
        <div className="gc-modal-scrim" onClick={close}>
          <div
            className="gc-modal"
            role="dialog"
            aria-modal="true"
            aria-label={openPulse ? openPulse.short : openForm!.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gc-modal-head">
              <div>
                <div className="gc-modal-eyebrow">{openPulse ? 'Pulse check' : 'Form'} · requested by your care team</div>
                <div className="gc-modal-title">{openPulse ? openPulse.short : openForm!.title}</div>
              </div>
              <button type="button" className="gc-modal-x" aria-label="Close" onClick={close}><X size={18} /></button>
            </div>
            {openPulse && (
              <PulseRunner
                due={[openPulse.id]}
                defs={[openPulse]}
                startId={openPulse.id}
                onClose={close}
                onSubmitted={(short, band) => submitted(`${short} saved`, band ? `Result: ${band}. It charts in My Progress.` : 'Thanks for checking in. It charts in My Progress.')}
              />
            )}
            {openForm && (
              <>
                {openForm.description && <p className="muted" style={{ margin: '0 0 16px' }}>{openForm.description}</p>}
                <FormFiller
                  assignmentId={openForm.id}
                  fields={openForm.fields}
                  readOnly={false}
                  initial={null}
                  onSubmitted={() => submitted('Form submitted', 'Your therapist will see your answers.')}
                />
              </>
            )}
          </div>
        </div>
      )}

      <Celebration show={!!cel} title={cel?.title ?? ''} sub={cel?.sub} onDone={() => setCel(null)} />
    </div>
  )
}
