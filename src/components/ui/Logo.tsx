import Link from 'next/link'

/**
 * GetCalmly brand mark — renders the official logo artwork (public/brand/*.png),
 * NOT a font recreation, so the letterforms are always exact.
 *
 *   size     — target height of the "Calmly." wordmark, in px (rest scales to it)
 *   onDark   — use the light-ink variant for dark backgrounds
 *   tagline  — include the "Mental Healthcare…" strapline under the wordmark
 *   href     — wrap in a link (null = no link, just the mark)
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
  // Intrinsic art ratios (px): full art 1292×781, wordmark-only 1292×712.
  // Height is derived from `size` (the wordmark cap) so it matches the old
  // text logo's footprint at each call site.
  const src = tagline
    ? onDark
      ? '/brand/logo-dark.png'
      : '/brand/logo.png'
    : onDark
      ? '/brand/logo-mark-dark.png'
      : '/brand/logo-mark.png'

  const ratio = tagline ? 1292 / 781 : 1292 / 712
  const height = Math.round(size * (tagline ? 1.42 : 1.12))
  const width = Math.round(height * ratio)

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI"
      width={width}
      height={height}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )

  if (href === null) return img
  return (
    <Link href={href} className="inline-block" aria-label="getCalmly — home">
      {img}
    </Link>
  )
}
