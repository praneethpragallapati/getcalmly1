/**
 * The login page's look for the question flows (pre-assessment, booking from a
 * clinician's profile, the details step): the warm photo with its soft veil,
 * the brand line in white on the left, and the questions on the right, where
 * the wall is light, with every control a solid white chip.
 */
export default function PhotoShell({
  eyebrow,
  accent,
  children,
}: {
  /** Small line above the brand line, e.g. "Pre-assessment · Adult therapy". */
  eyebrow: string
  accent?: string
  children: React.ReactNode
}) {
  return (
    <div className="pa pa-photo" style={accent ? ({ '--pa-accent': accent } as React.CSSProperties) : undefined}>
      <div className="pa-photo-bg" aria-hidden />
      <div className="pa-photo-veil" aria-hidden />
      <div className="pa-photo-wrap">
        <div className="pa-side">
          <p className="pa-side-eyebrow">{eyebrow}</p>
          <p className="pa-side-head">Small steps.<br /><span>Brighter days.</span></p>
        </div>
        <div className="pa-panel">{children}</div>
      </div>
    </div>
  )
}
