import Link from 'next/link'
import { tagLabel } from '@/data/tags'

/**
 * Filter a list by tag.
 *
 * State lives in the URL (`?tag=anxiety`) rather than in component state, which
 * buys three things for free: no client JavaScript, a filtered view you can
 * bookmark or send to someone, and Back doing what people expect. The pages
 * using it already render dynamically, so the filtering happens server-side on
 * data that was loaded anyway.
 *
 * Only tags that actually appear in the content are offered — a filter that
 * returns nothing is worse than no filter — and each carries its count so it's
 * clear what you're about to get.
 */
export type TagCount = { slug: string; count: number }

/** Tally the tags across a list, most-used first, dropping any that appear zero times. */
export function tagCounts(items: readonly { tags: string[] }[]): TagCount[] {
  const n = new Map<string, number>()
  for (const it of items) {
    for (const t of it.tags) {
      const slug = t.toLowerCase()
      n.set(slug, (n.get(slug) ?? 0) + 1)
    }
  }
  return [...n.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count || tagLabel(a.slug).localeCompare(tagLabel(b.slug)))
}

/** Keep only the items carrying `tag`. A null/unknown tag leaves the list alone. */
export function filterByTag<T extends { tags: string[] }>(items: readonly T[], tag: string | null): T[] {
  if (!tag) return [...items]
  const want = tag.toLowerCase()
  return items.filter((i) => i.tags.some((t) => t.toLowerCase() === want))
}

/** Read the `tag` search param, whatever shape Next hands it over in. */
export function tagFromSearchParams(sp: Record<string, string | string[] | undefined> | undefined): string | null {
  const raw = sp?.tag
  const value = Array.isArray(raw) ? raw[0] : raw
  const trimmed = (value ?? '').trim().toLowerCase()
  return trimmed || null
}

export function TagFilterBar({
  tags,
  active,
  basePath,
  total,
  /** How many chips to show before "More"; the rest go in a native <details>. */
  visible = 12,
  emptyHint,
}: {
  tags: TagCount[]
  active: string | null
  /** Route the chips link to, e.g. "/app/blogs". */
  basePath: string
  /** Total items before filtering, for the "All" chip. */
  total: number
  visible?: number
  emptyHint?: string
}) {
  if (tags.length === 0) {
    return emptyHint ? <p className="muted" style={{ fontSize: 13, margin: '0 0 14px' }}>{emptyHint}</p> : null
  }

  const shown = tags.slice(0, visible)
  const rest = tags.slice(visible)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', margin: '0 0 18px' }}>
      <span
        className="muted"
        style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginRight: 2 }}
      >
        Filter
      </span>
      <Chip href={basePath} label="All" count={total} active={active === null} />
      {shown.map((t) => (
        <Chip
          key={t.slug}
          // Clicking the active chip clears the filter, so the row is a toggle
          // rather than a one-way trip that needs "All" to escape.
          href={active === t.slug ? basePath : `${basePath}?tag=${encodeURIComponent(t.slug)}`}
          label={tagLabel(t.slug)}
          count={t.count}
          active={active === t.slug}
        />
      ))}
      {rest.length > 0 && (
        <details style={{ position: 'relative' }}>
          <summary
            style={{
              listStyle: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              color: 'var(--c-coral-d)', padding: '6px 12px', borderRadius: 999,
              border: '1px solid var(--c-line, #efe7e2)', background: 'var(--c-white, #fff)',
            }}
          >
            +{rest.length} more
          </summary>
          <div
            style={{
              position: 'absolute', zIndex: 30, top: 'calc(100% + 6px)', left: 0, width: 300, maxWidth: '80vw',
              display: 'flex', flexWrap: 'wrap', gap: 6, padding: 12, borderRadius: 14,
              background: 'var(--c-white, #fff)', border: '1px solid var(--c-line, #efe7e2)',
              boxShadow: '0 18px 48px rgba(28,43,58,.16)',
            }}
          >
            {rest.map((t) => (
              <Chip
                key={t.slug}
                href={active === t.slug ? basePath : `${basePath}?tag=${encodeURIComponent(t.slug)}`}
                label={tagLabel(t.slug)}
                count={t.count}
                active={active === t.slug}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

function Chip({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
        fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999,
        border: `1px solid ${active ? 'transparent' : 'var(--c-line, #efe7e2)'}`,
        background: active ? 'var(--c-charcoal, #1C2B3A)' : 'var(--c-white, #fff)',
        color: active ? '#fff' : 'var(--c-charcoal, #1C2B3A)',
      }}
    >
      {label}
      <span style={{ fontSize: 11, fontWeight: 700, opacity: active ? 0.65 : 0.45 }}>{count}</span>
    </Link>
  )
}
