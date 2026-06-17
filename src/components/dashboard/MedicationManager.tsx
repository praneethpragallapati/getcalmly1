'use client'

import { useState, useTransition } from 'react'
import { Pill, Plus, X } from 'lucide-react'
import { addMedication, setMedicationActive } from '@/app/(dashboard)/app/actions'
import type { DashMedication } from '@/data/dashboardDemo'

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night']

/**
 * Medications tab (#14) — surfaced as its own tab and glimpsed on Home. Patients
 * can add medications and mark them stopped. Records are patient-owned; the
 * prescribing doctor is captured for context.
 */
export function MedicationManager({ initial }: { initial: DashMedication[] }) {
  const [meds, setMeds] = useState<DashMedication[]>(initial)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [prescribedBy, setPrescribedBy] = useState('')
  const [times, setTimes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const active = meds.filter((m) => m.active)
  const stopped = meds.filter((m) => !m.active)

  function add() {
    setError(null)
    startTransition(async () => {
      const res = await addMedication({ name, dosage, frequency, prescribedBy, times })
      if (res.ok) {
        // Reflect locally so the list updates even in the demo (non-persisted) case.
        setMeds((prev) => [
          {
            id: `local-${Date.now()}`,
            name: name.trim(),
            dosage: dosage.trim() || undefined,
            frequency: frequency.trim() || undefined,
            times,
            prescribedBy: prescribedBy.trim() || undefined,
            active: true,
          },
          ...prev,
        ])
        setName('')
        setDosage('')
        setFrequency('')
        setPrescribedBy('')
        setTimes([])
        setOpen(false)
      } else {
        setError(res.error ?? 'Could not add.')
      }
    })
  }

  function toggle(id: string, makeActive: boolean) {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, active: makeActive } : m)))
    startTransition(async () => {
      await setMedicationActive(id, makeActive)
    })
  }

  function Row({ m }: { m: DashMedication }) {
    return (
      <div className="med-row">
        <span className="task-ic">
          <Pill size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="doc-name" style={{ fontSize: 15 }}>
            {m.name} {m.dosage && <span style={{ color: 'var(--c-gray)', fontWeight: 600 }}>{m.dosage}</span>}
          </div>
          <div className="doc-sub">
            {[m.frequency, m.times.join(', ')].filter(Boolean).join(' · ') || '—'}
            {m.prescribedBy && ` · ${m.prescribedBy}`}
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          type="button"
          onClick={() => toggle(m.id, !m.active)}
          disabled={pending}
        >
          {m.active ? 'Mark stopped' : 'Restart'}
        </button>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div className="section-title">Current medications</div>
          {!open && (
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        {open && (
          <div className="med-form">
            <div className="med-form-grid">
              <input className="note-area" style={{ resize: 'none' }} placeholder="Name (e.g. Sertraline)" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="note-area" style={{ resize: 'none' }} placeholder="Dosage (e.g. 50 mg)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
              <input className="note-area" style={{ resize: 'none' }} placeholder="Frequency (e.g. Once daily)" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
              <input className="note-area" style={{ resize: 'none' }} placeholder="Prescribed by (optional)" value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`slot-chip${times.includes(t) ? ' selected' : ''}`}
                  onClick={() => setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-primary" type="button" onClick={add} disabled={pending || !name.trim()}>
                {pending ? 'Saving…' : 'Save medication'}
              </button>
              <button className="note-link" type="button" onClick={() => setOpen(false)} style={{ color: 'var(--c-gray)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <X size={14} /> Cancel
              </button>
              {error && <span style={{ fontSize: 12, color: 'var(--c-coral)' }}>{error}</span>}
            </div>
          </div>
        )}

        {active.length === 0 ? (
          <p className="muted" style={{ padding: '12px 0' }}>No active medications.</p>
        ) : (
          active.map((m) => <Row key={m.id} m={m} />)
        )}
      </div>

      {stopped.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 6 }}>Stopped</div>
          {stopped.map((m) => <Row key={m.id} m={m} />)}
        </div>
      )}

      <p className="muted" style={{ fontSize: 12 }}>
        💊 Keep this list current so your psychiatrist has the full picture. Always follow your
        prescriber’s guidance — never change a dose based on the app alone.
      </p>
    </div>
  )
}
