'use client'

import { useEffect, useState } from 'react'

/**
 * Renders an instant in the viewer's own (system) timezone. The backend works in
 * IST and server-renders an IST label as `fallback`; after hydration this swaps
 * to the browser's local timezone. So a patient travelling or living outside
 * India sees session times in their own zone, while everything server-side
 * (slot generation, settlement) stays pinned to IST.
 */
export function LocalTime({
  iso,
  fallback,
  options,
}: {
  iso: string | null | undefined
  fallback: string
  options?: Intl.DateTimeFormatOptions
}) {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    if (!iso) return
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return
    setText(
      d.toLocaleString(undefined, options ?? {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: 'numeric', minute: '2-digit',
      }),
    )
  }, [iso, options])

  return <span suppressHydrationWarning>{text ?? fallback}</span>
}
