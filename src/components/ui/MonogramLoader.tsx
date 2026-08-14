/**
 * Branded loading state — the getCalmly "C." monogram breathing in and out
 * (a slow calm inhale/exhale). Rendered by each dashboard's loading.tsx while
 * the next server component streams in, so a slow load shows motion instead of
 * a blank screen. Pure markup + CSS (see app.css .gc-loader*), no client JS.
 *
 * Geometry note: the C (an open thick stroke) and the square dot share the same
 * baseline (both bottoms sit at y=138) and the dot is offset just to the C's
 * right — so the two read as one aligned "C." mark. The whole SVG scales as a
 * unit, so that alignment never shifts during the animation.
 *
 * `tint` matches the surrounding dashboard theme (coral = patient, green =
 * expert, purple = admin).
 */
const TINT: Record<string, string> = {
  coral: '#C8553D',
  green: '#2f9068',
  purple: '#6d5bd0',
}

export function MonogramLoader({
  tint = 'coral',
  label = 'Loading…',
}: {
  tint?: 'coral' | 'green' | 'purple'
  label?: string
}) {
  const color = TINT[tint] ?? TINT.coral
  // The "C": a tall, bold, condensed C opening on the right (mouth centred),
  // drawn as one thick round-capped stroke — a rounded rectangle outline with a
  // gap in the middle of the right edge. Tuned to the brand monogram's tall,
  // narrow proportions (~2.4:1). The stroke's bottom lands at y≈272.
  const cPath =
    'M120 104 L120 54 Q120 30 96 30 L76 30 Q52 30 52 54 L52 226 Q52 250 76 250 L96 250 Q120 250 120 226 L120 176'
  return (
    <div className="gc-loader" role="status" aria-live="polite">
      <svg className="gc-loader-mark" viewBox="0 0 206 280" fill="none" aria-hidden="true">
        <path d={cPath} stroke={color} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
        {/* Square dot, bottom-aligned with the C (bottom at y=272), to its right. */}
        <rect x={150} y={226} width={46} height={46} rx={7} fill={color} />
      </svg>
      <span className="gc-loader-text">{label}</span>
    </div>
  )
}
