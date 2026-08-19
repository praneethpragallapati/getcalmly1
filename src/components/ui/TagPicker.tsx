'use client'

import { useState } from 'react'
import { TAGS, MAX_TAGS, type TagDef } from '@/data/tags'

/**
 * The shared tag chooser. Every place that tags content — a Real Talk post, a
 * blog article, a Perspectives video — renders this, so the vocabulary stays
 * identical across the app and a tag means the same thing wherever it appears.
 * Members pick from the list; they can't invent new tags.
 */
export function TagPicker({
  value,
  onChange,
  max = MAX_TAGS,
  accent = '#C8553D',
  compact = false,
}: {
  value: string[]
  onChange: (tags: string[]) => void
  max?: number
  accent?: string
  compact?: boolean
}) {
  const [showAll, setShowAll] = useState(false)
  // Lead with the service tags (the ones people pick most), reveal the rest on demand.
  const services = TAGS.filter((t) => t.group === 'service')
  const shown: TagDef[] = showAll ? TAGS : services.slice(0, compact ? 12 : 16)
  const full = value.length >= max

  const toggle = (slug: string) => {
    if (value.includes(slug)) onChange(value.filter((t) => t !== slug))
    else if (!full) onChange([...value, slug])
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {shown.map((t) => {
          const on = value.includes(t.slug)
          const disabled = !on && full
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => toggle(t.slug)}
              disabled={disabled}
              title={disabled ? `Up to ${max} tags` : undefined}
              style={{
                fontSize: compact ? 12 : 12.5,
                fontWeight: 600,
                padding: compact ? '4px 10px' : '5px 12px',
                borderRadius: 999,
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: `1.5px solid ${on ? accent : 'rgba(28,43,58,.14)'}`,
                background: on ? accent : '#fff',
                color: on ? '#fff' : '#1C2B3A',
                opacity: disabled ? 0.4 : 1,
                transition: 'background .15s, border-color .15s, color .15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: accent, fontWeight: 700, fontSize: 12.5 }}
        >
          {showAll ? 'Show fewer tags' : `Show all ${TAGS.length} tags`}
        </button>
        <span style={{ fontSize: 12, color: '#9AABB8' }}>
          {value.length}/{max} selected
        </span>
      </div>
    </div>
  )
}
