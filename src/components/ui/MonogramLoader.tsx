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
  // The "C": a single open stroke (gap on the right), centred so the 22px stroke
  // stays inside the 122×142 viewBox. Bottom of the stroke lands at y≈138.
  const cPath =
    'M80 34 C80 20 66 13 52 13 C33 13 22 30 22 70 C22 110 33 127 52 127 C66 127 80 120 80 106'
  return (
    <div className="gc-loader" role="status" aria-live="polite">
      <svg className="gc-loader-mark" viewBox="0 0 122 142" fill="none" aria-hidden="true">
        <path d={cPath} stroke={color} strokeWidth={22} strokeLinecap="round" />
        {/* Square dot, bottom-aligned with the C (bottom at y=138), just to its right. */}
        <rect x={96} y={116} width={22} height={22} rx={3.5} fill={color} />
      </svg>
      <span className="gc-loader-text">{label}</span>
    </div>
  )
}
