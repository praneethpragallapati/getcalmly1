/**
 * Branded loading state — the getCalmly "C." monogram, breathing, with a trace
 * that draws around the C. Rendered by each dashboard's loading.tsx while the
 * next server component streams in, so a slow load shows motion instead of a
 * blank screen. Pure markup + CSS (see app.css .gc-loader*), no client JS.
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
  // The "C" as a single open stroke (gap on the right), plus a square dot.
  const cPath =
    'M62 36 C62 18 48 10 36 10 C20 10 8 28 8 68 C8 108 20 126 36 126 C48 126 62 118 62 100'
  return (
    <div className="gc-loader" role="status" aria-live="polite">
      <svg className="gc-loader-mark" viewBox="0 0 100 136" fill="none" aria-hidden="true">
        <path className="gc-loader-base" d={cPath} stroke={color} strokeWidth={24} strokeLinecap="round" />
        <path className="gc-loader-trace" d={cPath} stroke={color} strokeWidth={24} strokeLinecap="round" />
        <rect className="gc-loader-dot" x={70} y={104} width={22} height={22} rx={3.5} fill={color} />
      </svg>
      <span className="gc-loader-text">{label}</span>
    </div>
  )
}
