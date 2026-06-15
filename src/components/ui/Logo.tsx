import Link from 'next/link'

/**
 * GetCalmly wordmark, matching the v2 brand spec:
 *   "get"      — Big Shoulders Display 300, small, charcoal-gray, baseline-aligned
 *   "Calmly."  — Big Shoulders Display 900, large, burnt coral, compressed to ~63% width
 */
export default function Logo({
  size = 34,
  onDark = false,
  href = '/',
}: {
  size?: number
  onDark?: boolean
  href?: string | null
}) {
  const getColor = onDark ? '#A9B4C0' : '#5A6A7A'
  const inner = (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '1px', overflow: 'visible' }}>
      <span
        style={{
          fontFamily: "'Big Shoulders Display',sans-serif",
          fontWeight: 300,
          fontSize: `${Math.round(size * 0.26)}px`,
          color: getColor,
          letterSpacing: '.5px',
          paddingBottom: `${Math.round(size * 0.17)}px`,
          lineHeight: 1,
        }}
      >
        get
      </span>
      <span
        style={{
          fontFamily: "'Big Shoulders Display',sans-serif",
          fontWeight: 900,
          fontSize: `${size}px`,
          color: '#C8553D',
          letterSpacing: '-2px',
          lineHeight: 1,
          display: 'inline-block',
          transform: 'scaleX(.63)',
          transformOrigin: 'left bottom',
        }}
      >
        Calmly.
      </span>
    </span>
  )

  if (href === null) return inner
  return (
    <Link href={href} className="inline-block" aria-label="GetCalmly home">
      {inner}
    </Link>
  )
}
