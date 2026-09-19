import Link from 'next/link'

/**
 * getCalmly wordmark. One coral mark everywhere — no per-dashboard colour tint
 * and no tagline. The artwork is the official "getCalmly" wordmark
 * (public/brand/logo-mark.png, with logo-mark-dark.png for dark backgrounds).
 *
 *   size   , target height of the mark, scaled by ~1.35
 *   onDark , light-ink variant for dark backgrounds
 *   href   , wrap in a link (null = just the mark)
 */
type Tint = 'coral' | 'green' | 'purple' | 'teal'

export default function Logo({
  size = 34,
  onDark = false,
  href = '/',
}: {
  size?: number
  onDark?: boolean
  href?: string | null
  // Accepted for backwards-compatibility with existing call sites; the logo is
  // now always the coral wordmark with no tagline, so these no longer do anything.
  tagline?: boolean
  matchTaglineWidth?: boolean
  markWidth?: number
  tint?: Tint
}) {
  const markSrc = onDark ? '/brand/logo-mark-dark.png' : '/brand/logo-mark.png'
  const markRatio = 1190 / 602
  const markHeight = Math.round(size * 1.35)
  const markWidth = Math.round(markHeight * markRatio)

  const inner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={markSrc}
      alt="getCalmly"
      width={markWidth}
      height={markHeight}
      style={{ height: markHeight, width: markWidth, display: 'block' }}
    />
  )

  if (href === null) return inner
  return (
    <Link href={href} className="inline-block" aria-label="getCalmly home">
      {inner}
    </Link>
  )
}
