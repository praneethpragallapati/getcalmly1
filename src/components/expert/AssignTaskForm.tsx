'use client'

import { useActionState, useState } from 'react'
import { assignTask, type AssignTaskState } from '@/app/(dashboard)/expert/actions'
import { TASK_PRESETS, type TaskTypeKey } from '@/data/taskPresets'
import { TASK_FREQUENCIES, FREQUENCY_LABEL, TASK_TIMES_OF_DAY } from '@/lib/taskRecurrence'

const TYPE_LABEL: Record<TaskTypeKey, string> = {
  EXERCISE: 'Exercise',
  VIDEO: 'Video',
  READING: 'Reading',
  REFLECTION: 'Reflection',
  BREATHING: 'Breathing',
}

/**
 * Two-click task assignment: pick a type, pick one of its 10 preset tasks
 * (or "Custom…" for free text), set a frequency and expiry. Recurring tasks
 * re-open every period on the patient's dashboard until expiry.
 */
export function AssignTaskForm({ patientId }: { patientId: string }) {
  const [type, setType] = useState<TaskTypeKey>('REFLECTION')
  const [preset, setPreset] = useState('')
  const [custom, setCustom] = useState('')
  // The action returns a result now, so a refused assignment says why instead of
  // looking like a click that did nothing.
  const [state, formAction, pending] = useActionState<AssignTaskState, FormData>(assignTask, null)

  const isCustom = preset === '__custom__'
  const title = isCustom ? custom : preset

  return (
    <form action={formAction} className="stack" style={{ gap: 10 }}>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="title" value={title} />
      <div className="grid-2" style={{ gap: 10 }}>
        <label className="muted" style={{ fontSize: 12 }}>
          Type
          <select
            className="entry-input"
            name="type"
            value={type}
            onChange={(e) => { setType(e.target.value as TaskTypeKey); setPreset('') }}
            style={{ marginTop: 4 }}
          >
            {(Object.keys(TASK_PRESETS) as TaskTypeKey[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>
        <label className="muted" style={{ fontSize: 12 }}>
          Task
          <select
            className="entry-input"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            required
            style={{ marginTop: 4 }}
          >
            <option value="" disabled>Choose a {TYPE_LABEL[type].toLowerCase()} task…</option>
            {TASK_PRESETS[type].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="__custom__">Custom task…</option>
          </select>
        </label>
      </div>
      {isCustom && (
        <input
          className="entry-input"
          placeholder="Describe the custom task"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          required
        />
      )}
      <input className="entry-input" name="description" placeholder="Details for the patient (optional)" />
      <div className="grid-2" style={{ gap: 10 }}>
        <label className="muted" style={{ fontSize: 12 }}>
          Frequency
          <select className="entry-input" name="frequency" defaultValue="ONE_TIME" style={{ marginTop: 4 }}>
            {TASK_FREQUENCIES.map((f) => (
              <option key={f} value={f}>{FREQUENCY_LABEL[f]}</option>
            ))}
          </select>
        </label>
        <label className="muted" style={{ fontSize: 12 }}>
          Expiry
          <input className="entry-input" type="date" name="dueDate" style={{ marginTop: 4 }} />
        </label>
      </div>
      <div className="muted" style={{ fontSize: 12 }}>
        Time of day
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          {TASK_TIMES_OF_DAY.map((t) => (
            <label key={t} className="chip-check">
              <input type="checkbox" name="timesOfDay" value={t} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim() || pending} style={{ alignSelf: 'flex-start' }}>
          {pending ? 'Assigning…' : 'Assign task'}
        </button>
        {state && (
          <span
            role="status"
            style={{ fontSize: 12.5, fontWeight: 600, color: state.ok ? '#1B7F4D' : '#B3261E', lineHeight: 1.45 }}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  )
}
