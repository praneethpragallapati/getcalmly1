// Admin-defined compensation fields shown to full-time (salaried) clinicians on
// their Earnings tab. Each field is either a free-text value or a dropdown the
// admin picks a value from. Client-safe (no server imports) so both the admin
// editor and the earnings view can use these helpers.

export type CompensationFieldType = 'text' | 'select'

export type CompensationField = {
  label: string
  type: CompensationFieldType
  value: string
  options?: string[] // present for `select`
}

/** Normalise arbitrary JSON (DB column, or client input) into safe fields. */
export function parseCompensationFields(raw: unknown): CompensationField[] {
  if (!Array.isArray(raw)) return []
  const out: CompensationField[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const label = String(rec.label ?? '').trim().slice(0, 80)
    if (!label) continue
    const type: CompensationFieldType = rec.type === 'select' ? 'select' : 'text'
    const value = String(rec.value ?? '').trim().slice(0, 300)
    const field: CompensationField = { label, type, value }
    if (type === 'select') {
      const options = Array.isArray(rec.options)
        ? rec.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 30)
        : []
      field.options = options
    }
    out.push(field)
    if (out.length >= 25) break
  }
  return out
}
