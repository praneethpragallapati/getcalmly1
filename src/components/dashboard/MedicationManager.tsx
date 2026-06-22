'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pill, Plus, X, Truck, Check } from 'lucide-react'
import { addMedication, setMedicationActive, orderMedicationDelivery } from '@/app/(dashboard)/app/actions'
import type { DashMedication } from '@/data/dashboardDemo'
import type { MedicationOrderView } from '@/lib/orders'
import { estimateOrderAmount } from '@/data/delivery'

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night']

/**
 * Medications tab (#14). Patients add medications, mark them stopped, and — for
 * prescribed courses — order a home delivery (mock payment today; pharmacy
 * partner integration later).
 */
export function MedicationManager({
  initial,
  orders = [],
}: {
  initial: DashMedication[]
  orders?: MedicationOrderView[]
}) {
  const [meds, setMeds] = useState<DashMedication[]>(initial)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [prescribedBy, setPrescribedBy] = useState('')
  const [times, setTimes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Latest order per medication, for status display.
  const orderByMed = new Map<string, MedicationOrderView>()
  for (const o of orders) if (o.medicationId && !orderByMed.has(o.medicationId)) orderByMed.set(o.medicationId, o)

  const active = meds.filter((m) => m.active)
  const stopped = meds.filter((m) => !m.active)

  function add() {
    setError(null)
    startTransition(async () => {
      const res = await addMedication({ name, dosage, frequency, prescribedBy, times })
      if (res.ok) {
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
    const order = orderByMed.get(m.id)
    return (
      <div style={{ borderBottom: '1px solid var(--c-line)' }}>
        <div className="med-row" style={{ borderBottom: 'none' }}>
          <span className="task-ic">
            <Pill size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="doc-name" style={{ fontSize: 15 }}>
              {m.name} {m.dosage && <span style={{ color: 'var(--c-gray)', fontWeight: 600 }}>{m.dosage}</span>}
            </div>
            <div className="doc-sub">
              {[m.frequency, m.times.join(', '), m.durationDays ? `${m.durationDays} days` : null]
                .filter(Boolean)
                .join(' · ') || '—'}
              {m.prescribedBy && ` · ${m.prescribedBy}`}
            </div>
          </div>
          <button className="btn btn-outline btn-sm" type="button" onClick={() => toggle(m.id, !m.active)} disabled={pending}>
            {m.active ? 'Mark stopped' : 'Restart'}
          </button>
        </div>
        {m.active && !m.id.startsWith('local-') && (
          order ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                margin: '0 0 12px 40px',
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--c-green-pale, #E9F6F4)',
                border: '1px solid var(--c-green, #1A7F7A)',
                maxWidth: 460,
              }}
            >
              <Check size={16} style={{ color: 'var(--c-green, #1A7F7A)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-charcoal)' }}>
                  {order.statusLabel} · ₹{order.amount} paid
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {order.itemName} — ordered {order.createdLabel}
                </div>
              </div>
            </div>
          ) : (
            <DeliveryPanel medicationId={m.id} durationDays={m.durationDays} />
          )
        )}
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

/** Inline "order a home delivery" flow for one medication. Mock payment. */
function DeliveryPanel({ medicationId, durationDays }: { medicationId: string; durationDays?: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [d, setD] = useState({ contactName: '', phone: '', addressLine: '', city: '', pincode: '' })
  const amount = estimateOrderAmount(durationDays)

  function field(key: keyof typeof d, placeholder: string, full = false) {
    return (
      <input
        key={key}
        className="note-area"
        style={{ resize: 'none', gridColumn: full ? '1 / -1' : undefined }}
        placeholder={placeholder}
        value={d[key]}
        onChange={(e) => setD((p) => ({ ...p, [key]: e.target.value }))}
      />
    )
  }

  function pay() {
    setError(null)
    startTransition(async () => {
      const res = await orderMedicationDelivery(medicationId, d)
      if (res.ok && res.persisted) {
        setDone(true)
        router.refresh()
      } else if (res.ok) setError('Sign in to order a delivery.')
      else setError(res.error ?? 'Could not place order.')
    })
  }

  if (done) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          margin: '0 0 12px 40px',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'var(--c-green-pale, #E9F6F4)',
          border: '1px solid var(--c-green, #1A7F7A)',
          maxWidth: 460,
        }}
      >
        <Check size={16} style={{ color: 'var(--c-green, #1A7F7A)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-charcoal)' }}>
            Paid · awaiting dispatch · ₹{amount} paid
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            Delivery to your saved address — we&apos;ll notify you when it ships.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 0 12px 40px' }}>
      {!open ? (
        <button className="note-link" type="button" onClick={() => setOpen(true)} style={{ color: 'var(--c-coral)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600 }}>
          <Truck size={14} /> Order home delivery (₹{amount})
        </button>
      ) : (
        <div style={{ border: '1px solid var(--c-line)', borderRadius: 10, padding: 12, marginTop: 4, maxWidth: 460 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-charcoal)', marginBottom: 8 }}>
            Delivery details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {field('contactName', 'Full name', true)}
            {field('phone', 'Phone number')}
            {field('pincode', 'Pincode')}
            {field('addressLine', 'Address', true)}
            {field('city', 'City')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" type="button" onClick={pay} disabled={pending}>
              {pending ? 'Processing…' : `Pay ₹${amount} & order`}
            </button>
            <button className="note-link" type="button" onClick={() => setOpen(false)} style={{ color: 'var(--c-gray)', cursor: 'pointer', fontSize: 13 }}>
              Cancel
            </button>
            {error && <span style={{ fontSize: 12, color: 'var(--c-coral)' }}>{error}</span>}
          </div>
          <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            🔒 Mock payment for now. Medicines will be fulfilled by our pharmacy partner (e.g. Tata 1mg) once that
            integration is live.
          </p>
        </div>
      )}
    </div>
  )
}
