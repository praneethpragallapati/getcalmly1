/**
 * A lightweight band heading for the home page. Home carries several distinct
 * kinds of content — what's happening now, today's actions, your progress, your
 * space — and without a marker between them it reads as one long stack of cards.
 * This gives each zone a name and a little breathing room above it.
 */
export function ZoneHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <div style={{ marginTop: 10, marginBottom: -4 }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 21,
          fontWeight: 800,
          color: 'var(--c-charcoal, #1C2B3A)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      {meta && (
        <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
          {meta}
        </div>
      )}
    </div>
  )
}
