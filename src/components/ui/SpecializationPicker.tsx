'use client'

import { SPECIALIZATION_GROUPS, THERAPY_STYLES, ALL_OFFERINGS } from '@/data/careTaxonomy'

const KNOWN = new Set(ALL_OFFERINGS.map((s) => s.label))

/**
 * Grouped chip picker over the shared specialization list (data/careTaxonomy).
 * The same component is used by the clinician application, the admin
 * new-clinician form and the clinician's own profile editor, so what a
 * clinician can offer is always said in the words the pre-assessment matches on.
 *
 * Anything already on a profile that is not in the list (older free-typed
 * entries) is kept and shown under "Also listed", where it can be removed.
 */
export function SpecializationPicker({
  value,
  onChange,
  accent = '#C8553D',
  showStyles = true,
}: {
  value: string[]
  onChange: (next: string[]) => void
  accent?: string
  showStyles?: boolean
}) {
  const toggle = (label: string) =>
    onChange(value.includes(label) ? value.filter((v) => v !== label) : [...value, label])
  const legacy = value.filter((v) => !KNOWN.has(v))

  const groups = [
    ...SPECIALIZATION_GROUPS.map((g) => ({ group: g.group, items: g.items.map((i) => i.label) })),
    ...(showStyles ? [{ group: 'How you like to work', items: THERAPY_STYLES.map((s) => s.label) }] : []),
    ...(legacy.length ? [{ group: 'Also listed', items: legacy }] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {groups.map((g) => (
        <div key={g.group}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#8E9EAE', marginBottom: 8 }}>
            {g.group}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {g.items.map((label) => {
              const on = value.includes(label)
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(label)}
                  style={{
                    padding: '7px 12px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${on ? accent : 'rgba(28,43,58,.12)'}`,
                    background: on ? `color-mix(in srgb, ${accent} 9%, transparent)` : 'transparent',
                    color: on ? accent : '#5A6A7A', fontFamily: 'inherit', lineHeight: 1.3,
                  }}
                >
                  {on ? '✓ ' : ''}{label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 12, color: '#8E9EAE', margin: 0 }}>
        {value.length} selected. Patients are matched on these, so pick what you genuinely work with.
      </p>
    </div>
  )
}
