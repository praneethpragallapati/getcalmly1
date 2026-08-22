'use client'

import { Plus, Trash2 } from 'lucide-react'

const charcoal = '#1C2B3A'

/** One question as it is being edited. `options` is comma-separated while typing. */
export type FieldDraft = {
  label: string
  type: string
  required: boolean
  /** Comma-separated, only read for `select`. */
  options: string
}

export const FIELD_TYPE_LABEL: { value: string; label: string }[] = [
  { value: 'text', label: 'Short answer' },
  { value: 'textarea', label: 'Long answer' },
  { value: 'select', label: 'Choose one (dropdown)' },
  { value: 'checkbox', label: 'Tick box' },
  { value: 'date', label: 'Date' },
  { value: 'tel', label: 'Phone number' },
  { value: 'email', label: 'Email' },
]

export const blankField = (): FieldDraft => ({ label: '', type: 'text', required: false, options: '' })

/** Drafts → the shape the server actions take. Blank rows are dropped. */
export function draftsToInput(drafts: FieldDraft[]) {
  return drafts
    .filter((f) => f.label.trim())
    .map((f) => ({
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.type === 'select' ? f.options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
    }))
}

/** Stored questions → drafts, for opening something existing in the editor. */
export function fieldsToDrafts(
  fields: { label: string; type: string; required?: boolean; options?: string[] }[],
): FieldDraft[] {
  return fields.length
    ? fields.map((f) => ({
        label: f.label,
        type: f.type,
        required: Boolean(f.required),
        options: (f.options ?? []).join(', '),
      }))
    : [blankField()]
}

const input: React.CSSProperties = {
  border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13.5,
  fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%',
}

/**
 * The list of questions, editable.
 *
 * Shared by the form builder and the send preview so that "change a question"
 * is one control with one set of behaviours, wherever you meet it — the two had
 * started to be the same screen written twice.
 */
export function FormFieldsEditor({ value, onChange }: {
  value: FieldDraft[]
  onChange: (next: FieldDraft[]) => void
}) {
  const patch = (i: number, p: Partial<FieldDraft>) =>
    onChange(value.map((row, n) => (n === i ? { ...row, ...p } : row)))

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {value.map((f, i) => (
          <div key={i} style={{ border: '1px solid rgba(28,43,58,.09)', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 12, fontWeight: 700, width: 16 }}>{i + 1}.</span>
              <input
                value={f.label}
                onChange={(e) => patch(i, { label: e.target.value })}
                placeholder="Question"
                style={{ ...input, flex: '2 1 220px', width: 'auto' }}
              />
              <select value={f.type} onChange={(e) => patch(i, { type: e.target.value })} style={{ ...input, flex: '1 1 160px', width: 'auto' }}>
                {FIELD_TYPE_LABEL.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label className="muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={f.required} onChange={(e) => patch(i, { required: e.target.checked })} />
                Required
              </label>
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, n) => n !== i))}
                  aria-label={`Remove question ${i + 1}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', display: 'inline-flex' }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            {f.type === 'select' && (
              <input
                value={f.options}
                onChange={(e) => patch(i, { options: e.target.value })}
                placeholder="Choices, separated by commas — e.g. Never, Sometimes, Often"
                style={{ ...input, fontSize: 12.5 }}
              />
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, blankField()])}
        className="link-action"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <Plus size={13} /> Add question
      </button>
    </div>
  )
}
