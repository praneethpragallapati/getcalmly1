import Link from 'next/link'

export type SectionTab = { href: string; label: string; badge?: number | string }

/**
 * The header for a section that spans more than one route — an eyebrow, a title
 * and a row of pill tabs that link between the sibling pages. Used to group
 * related destinations (Real Talk, Perspectives, My Care Team) under a single
 * sidebar entry without merging their routes, so existing deep links keep working.
 */
export function SectionTabs({
  eyebrow,
  title,
  meta,
  tabs,
  active,
}: {
  eyebrow?: string
  /** Omit when the page already shows its own hero/heading — only pills render. */
  title?: string
  meta?: React.ReactNode
  tabs: SectionTab[]
  active: string // href of the current tab
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && (
        <p className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--c-coral-d)', margin: '0 0 6px' }}>
          {eyebrow}
        </p>
      )}
      {title && (
        <div className="page-head" style={{ marginBottom: 12 }}>
          <div className="page-title">{title}</div>
          {meta && <div className="page-meta">{meta}</div>}
        </div>
      )}
      {tabs.length > 0 && (
      <div style={{ display: 'inline-flex', background: 'rgba(28,43,58,.05)', borderRadius: 999, padding: 3, gap: 2, flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const on = t.href === active
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{
                textDecoration: 'none',
                borderRadius: 999,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: on ? '#fff' : 'transparent',
                color: on ? 'var(--c-charcoal, #1C2B3A)' : 'var(--c-gray-d, #5A6A7A)',
                boxShadow: on ? '0 1px 4px rgba(28,43,58,.1)' : 'none',
              }}
            >
              {t.label}
              {t.badge !== undefined && t.badge !== 0 && (
                <span style={{ fontSize: 11, fontWeight: 800, background: on ? 'var(--c-coral)' : 'rgba(28,43,58,.12)', color: on ? '#fff' : 'var(--c-gray-d, #5A6A7A)', borderRadius: 999, padding: '1px 7px' }}>
                  {t.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      )}
    </div>
  )
}
