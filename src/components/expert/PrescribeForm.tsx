'use client'

import { useMemo, useState } from 'react'
import { Pill } from 'lucide-react'
import { MEDICINES, FREQUENCY_OPTIONS } from '@/data/medicines'
import { prescribe } from '@/app/(dashboard)/expert/actions'

/**
 * Prescribe form with a medicine dropdown (grouped by drug class) instead of a
 * free-text name. Selecting a medicine offers its common strengths as dosage
 * suggestions; an "Other…" option keeps free-text entry available for anything
 * off-formulary. The chosen name is mirrored into a hidden input so the existing
 * `prescribe` server action keeps reading `name` unchanged.
 */
export function PrescribeForm({ patientId }: { patientId: string }) {
  const [selected, setSelected] = useState('')
  const [custom, setCustom] = useState('')

  const byClass = useMemo(() => {
    const groups = new Map<string, typeof MEDICINES>()
    for (const m of MEDICINES) {
      const arr = groups.get(m.class) ?? []
      arr.push(m)
      groups.set(m.class, arr)
    }
    return [...groups.entries()]
  }, [])

  const isOther = selected === '__other__'
  const name = isOther ? custom : selected
  const strengths = MEDICINES.find((m) => m.name === selected)?.strengths ?? []

  return (
    <form action={prescribe} className="stack" style={{ gap: 10, marginTop: 14 }}>
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="name" value={name} />

      <div className="grid-2" style={{ gap: 10 }}>
        <select
          className="entry-input"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a medication…
          </option>
          {byClass.map(([cls, meds]) => (
            <optgroup key={cls} label={cls}>
              {meds.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="__other__">Other (type below)…</option>
        </select>

        {isOther ? (
          <input
            className="entry-input"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Medication name"
            required
          />
        ) : (
          <input className="entry-input" name="dosage" placeholder="Dosage (e.g. 50 mg)" list="dosage-suggestions" />
        )}
        {isOther && <input className="entry-input" name="dosage" placeholder="Dosage (e.g. 50 mg)" />}

        <select className="entry-input" name="frequency" defaultValue="">
          <option value="">Frequency…</option>
          {FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input className="entry-input" name="times" placeholder="Times (comma-separated, e.g. Morning, Night)" />
      </div>

      {strengths.length > 0 && (
        <datalist id="dosage-suggestions">
          {strengths.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}

      <input className="entry-input" name="notes" placeholder="Notes (optional)" />
      <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} disabled={!name}>
        <Pill size={14} /> Prescribe medication
      </button>
    </form>
  )
}
