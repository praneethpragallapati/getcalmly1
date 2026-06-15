import Link from 'next/link'

/**
 * GetCalmly brand mark — matches the official logo:
 *   "get"      — Big Shoulders Display 300, small, charcoal-gray
 *   "Calmly."  — Big Shoulders Display 900, large, burnt coral, compressed ~63%
 *   tagline    — "Mental Healthcare, Powered by Experts, Personalized by AI"
 *                ("Personalized by AI" in coral)
 */
export default function Logo({
  size = 34,
  onDark = false,
  href = '/',
  tagline = true,
}: {
  size?: number
  onDark?: boolean
  href?: string | null
  tagline?: boolean
}) {
  const getColor = onDark ? '#A9B4C0' : '#5A6A7A'
  const tagColor = onDark ? 'rgba(255,255,255,.6)' : '#1C2B3A'

  const wordmark = (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '1px', overflow: 'visible', lineHeight: 1 }}>
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

  const inner = (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${Math.round(size * 0.06)}px` }}>
      {wordmark}
      {tagline && (
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 600,
            fontSize: `${Math.max(8, Math.round(size * 0.205))}px`,
            color: tagColor,
            letterSpacing: '.1px',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}
        >
          Mental Healthcare, Powered by Experts, <span style={{ color: '#C8553D' }}>Personalized by AI</span>
        </span>
      )}
    </span>
  )

  if (href === null) return inner
  return (
    <Link href={href} className="inline-block" aria-label="getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI">
      {inner}
    </Link>
  )
}
