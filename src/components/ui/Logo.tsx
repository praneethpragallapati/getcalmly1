import Link from 'next/link'

/**
 * GetCalmly brand mark. The "getCalmly." wordmark is the official artwork
 * (public/brand/logo-mark*.png), NOT a font recreation, so the letterforms
 * are always exact. The tagline is set as live text beneath it so it stays
 * crisp and legible at nav scale (the strapline is intrinsically tiny inside
 * the raw logo image).
 *
 *   size    , target height of the "Calmly." wordmark cap, in px
 *   onDark  , light-ink variant for dark backgrounds
 *   tagline , include the "Mental Healthcare…" strapline
 *   href    , wrap in a link (null = just the mark)
 *   matchTaglineWidth , lock the mark and the strapline to one width
 *
 * On matchTaglineWidth: the strapline is far wider than the mark, and scaling
 * `size` cannot close that gap — both are sized from `size`, so the ratio
 * between them never changes. Matching them at the strapline's natural nowrap
 * width would need a ~450px mark, which swamps a footer. So the column is capped
 * (markWidth) and the strapline is allowed to wrap inside it: the mark fills the
 * cap, the text wraps to the same measure, and the two align on both edges.
 */
// Per-dashboard accent tints. The default coral is the brand mark; each
// dashboard re-skins the "Calmly." wordmark to match its theme.
const TINT_ACCENT: Record<Exclude<Tint, 'coral'>, string> = {
  green: '#2f9068',
  purple: '#6d5bd0',
  teal: '#1a7f7a',
}
type Tint = 'coral' | 'green' | 'purple' | 'teal'

export default function Logo({
  size = 34,
  onDark = false,
  href = '/',
  tagline = true,
  matchTaglineWidth = false,
  markWidth: matchedWidth = 300,
  tint = 'coral',
}: {
  size?: number
  onDark?: boolean
  href?: string | null
  tagline?: boolean
  /** Lock the mark and strapline to one width (footer-scale only). */
  matchTaglineWidth?: boolean
  /** The shared width used by matchTaglineWidth, in px. */
  markWidth?: number
  /** Recolours the "Calmly." wordmark to a dashboard accent (default brand coral). */
  tint?: Tint
}) {
  const variant = onDark ? 'dark' : 'light'
  const markSrc =
    tint === 'coral'
      ? onDark
        ? '/brand/logo-mark-dark.png'
        : '/brand/logo-mark.png'
      : `/brand/logo-mark-${variant}-${tint}.png`
  const markRatio = 1292 / 712
  // Slight optical widening: the wordmark's condensed letterforms read
  // cramped at nav scale, so stretch 10% horizontally. Keep this subtle:
  // beyond ~1.15 the distortion of the artwork becomes noticeable.
  const widen = 1.1
  const markHeight = Math.round(size * 1.2)
  const markWidth = Math.round(markHeight * markRatio * widen)
  const tagColor = onDark ? 'rgba(255,255,255,.82)' : '#1C2B3A'
  const tagSize = Math.max(9, Math.round(size * 0.24))
  // Coral on a light background fails AA at strapline size, so the accent takes
  // the darker ink there; on dark the bright coral is already well clear.
  const tagAccent = tint === 'coral' ? (onDark ? '#E8896F' : '#A8432D') : TINT_ACCENT[tint]
  const stretch = matchTaglineWidth && tagline

  const inner = (
    <span style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: stretch ? 'stretch' : 'flex-start',
      gap: Math.round(size * 0.12),
      ...(stretch ? { width: matchedWidth, maxWidth: '100%' } : {}),
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={markSrc}
        alt="getCalmly"
        width={markWidth}
        height={markHeight}
        style={stretch
          // aspect-ratio keeps the deliberate 10% optical widening while the
          // width is driven by the strapline beneath.
          ? { width: '100%', aspectRatio: String(markRatio * widen), height: 'auto', display: 'block' }
          : { height: markHeight, width: markWidth, display: 'block' }}
      />
      {tagline && (
        <span
          className="gc-logo-tag"
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700,
            fontSize: `${tagSize}px`,
            color: tagColor,
            letterSpacing: '.1px',
            lineHeight: 1.35,
            whiteSpace: stretch ? 'normal' : 'nowrap',
          }}
        >
          Mental Healthcare, Powered by Experts, <span style={{ color: tagAccent }}>Personalized by AI</span>
        </span>
      )}
    </span>
  )

  if (href === null) return inner
  return (
    <Link href={href} className="inline-block" aria-label="getCalmly home">
      {inner}
    </Link>
  )
}
