import Link from 'next/link'

/**
 * GetCalmly brand mark — matches the official logo:
 *   "get"      — Big Shoulders Display, charcoal, lower-left, ~40% height
 *   "Calmly."  — Big Shoulders Display 900, large, burnt coral, condensed
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
  const getColor = onDark ? '#FFFFFF' : '#1C2B3A'
  const tagColor = onDark ? 'rgba(255,255,255,.78)' : '#1C2B3A'
  const SCALE = 0.72
  // scaleX leaves dead layout space on the right; pull it back so the
  // logo box hugs the glyphs (≈ naturalWidth × (1 − scale)).
  const pullBack = Math.round(size * 3.0 * (1 - SCALE) * 0.92)

  const wordmark = (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: `${Math.round(size * 0.06)}px`, overflow: 'visible', lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "'Big Shoulders Display',sans-serif",
          fontWeight: 600,
          fontSize: `${Math.round(size * 0.4)}px`,
          color: getColor,
          letterSpacing: '0px',
          paddingBottom: `${Math.round(size * 0.1)}px`,
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
          letterSpacing: '-0.5px',
          lineHeight: 1,
          display: 'inline-block',
          transform: `scaleX(${SCALE})`,
          transformOrigin: 'left bottom',
          marginRight: `${-pullBack}px`,
        }}
      >
        Calmly.
      </span>
    </span>
  )

  const inner = (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${Math.round(size * 0.12)}px` }}>
      {wordmark}
      {tagline && (
        <span
          className="gc-logo-tag"
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700,
            fontSize: `${Math.max(9, Math.round(size * 0.23))}px`,
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
