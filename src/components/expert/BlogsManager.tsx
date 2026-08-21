'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Clock, Pencil, PenLine, Newspaper, FileText, Search } from 'lucide-react'
import { BlogComposer } from './BlogComposer'
import type { ExpertBlogView } from '@/lib/expert'
import type { BlogPostView } from '@/lib/blog'

const charcoal = '#1C2B3A'

/**
 * What the author needs to know at a glance. Editorial state leads: a post can be
 * live and still be back in the queue after an edit, and "Draft" would wrongly
 * suggest the author still has to do something to send it.
 */
function postStatus(p: ExpertBlogView): string {
  if (p.reviewStatus === 'PENDING') return p.published ? 'Live · re-review' : 'In review'
  if (p.reviewStatus === 'REJECTED') return 'Needs changes'
  return p.published ? 'Live' : 'Not live'
}
function postTone(p: ExpertBlogView): React.CSSProperties {
  if (p.reviewStatus === 'PENDING') return { color: '#9A6B1F', background: 'rgba(201,151,58,.14)' }
  if (p.reviewStatus === 'REJECTED') return { color: '#C0504B', background: 'rgba(192,80,75,.1)' }
  if (p.published) return { color: '#3D9E72', background: 'rgba(61,158,114,.1)' }
  return { color: 'var(--c-gray)', background: 'rgba(28,43,58,.06)' }
}
const coral = '#C8553D'

type Tab = 'mine' | 'write' | 'all'
/** Editorial state, as a filter. Mirrors postStatus() so the two never diverge. */
type StatusFilter = 'all' | 'live' | 'review' | 'changes' | 'notlive'

function matchesStatus(p: ExpertBlogView, f: StatusFilter): boolean {
  if (f === 'all') return true
  if (f === 'review') return p.reviewStatus === 'PENDING'
  if (f === 'changes') return p.reviewStatus === 'REJECTED'
  if (f === 'live') return p.published && p.reviewStatus !== 'PENDING' && p.reviewStatus !== 'REJECTED'
  return !p.published && p.reviewStatus !== 'PENDING' && p.reviewStatus !== 'REJECTED'
}

/** Case-insensitive match across the fields someone would actually search. */
function matchesText(hay: (string | null | undefined)[], q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return hay.some((h) => (h ?? '').toLowerCase().includes(needle))
}

/** A row of filter chips. Kept generic so both tabs use the same control. */
function FilterChips<T extends string>({
  value, options, onChange,
}: {
  value: T
  options: { key: T; label: string; count?: number }[]
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((o) => {
        const on = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            style={{
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
              padding: '5px 12px', borderRadius: 20,
              border: `1px solid ${on ? 'transparent' : 'rgba(28,43,58,.14)'}`,
              background: on ? 'var(--c-coral-cta)' : 'transparent',
              color: on ? '#fff' : 'var(--c-gray-d)',
            }}
          >
            {o.label}{o.count === undefined ? '' : ` (${o.count})`}
          </button>
        )
      })}
    </div>
  )
}

/** Search box + chips, shared by both list tabs. */
function FilterBar({
  query, onQuery, children, placeholder,
}: {
  query: string
  onQuery: (v: string) => void
  children?: React.ReactNode
  placeholder: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      <div style={{ position: 'relative', maxWidth: 340 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-gray)' }} />
        <input
          className="field-input"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: 32 }}
        />
      </div>
      {children}
    </div>
  )
}

function Thumb({ src }: { src?: string | null }) {
  if (!src) {
    return <div style={{ width: 84, height: 60, borderRadius: 10, background: 'linear-gradient(135deg,#E8896F,#C8553D)', flexShrink: 0 }} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" style={{ width: 84, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.slice(0, 4).map((t) => (
        <span key={t} style={{ fontWeight: 600, color: 'var(--c-gray-d)', background: 'rgba(28,43,58,.05)', padding: '2px 8px', borderRadius: 20 }}>{t}</span>
      ))}
    </>
  )
}

export function BlogsManager({
  myPosts, allPosts, designation,
}: {
  myPosts: ExpertBlogView[]; allPosts: BlogPostView[]; designation: string
}) {
  const [tab, setTab] = useState<Tab>('mine')
  const [mineQuery, setMineQuery] = useState('')
  const [mineStatus, setMineStatus] = useState<StatusFilter>('all')
  const [mineTag, setMineTag] = useState('all')
  const [allQuery, setAllQuery] = useState('')
  const [allTag, setAllTag] = useState('all')

  const mineTags = useMemo(
    () => [...new Set(myPosts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b)),
    [myPosts],
  )
  const allTags = useMemo(
    () => [...new Set(allPosts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b)),
    [allPosts],
  )

  const shownMine = useMemo(
    () => myPosts.filter((p) =>
      matchesStatus(p, mineStatus) &&
      (mineTag === 'all' || p.tags.includes(mineTag)) &&
      matchesText([p.title, p.excerpt, ...p.tags], mineQuery)),
    [myPosts, mineStatus, mineTag, mineQuery],
  )
  const shownAll = useMemo(
    () => allPosts.filter((p) =>
      (allTag === 'all' || p.tags.includes(allTag)) &&
      matchesText([p.title, p.excerpt, p.author, p.role, ...p.tags], allQuery)),
    [allPosts, allTag, allQuery],
  )

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'mine', label: `My blogs (${myPosts.length})`, icon: <FileText size={15} /> },
    { key: 'write', label: 'Write new', icon: <PenLine size={15} /> },
    { key: 'all', label: 'All blogs', icon: <Newspaper size={15} /> },
  ]

  return (
    <div className="stack">
      <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10, alignSelf: 'flex-start' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? coral : 'var(--c-gray-d)',
              boxShadow: tab === t.key ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'write' && <BlogComposer designation={designation} />}

      {tab === 'mine' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>Your posts</div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
            {myPosts.filter((p) => p.published).length} live · {myPosts.filter((p) => p.reviewStatus === 'PENDING').length} in review · bylined as {designation}
          </p>
          {myPosts.length === 0 ? (
            <p className="muted">You haven&apos;t written anything yet. Use “Write new” to send your first post to the editorial team.</p>
          ) : (
            <FilterBar query={mineQuery} onQuery={setMineQuery} placeholder="Search your posts…">
              <FilterChips
                value={mineStatus}
                onChange={setMineStatus}
                options={[
                  { key: 'all', label: 'All', count: myPosts.length },
                  { key: 'live', label: 'Live', count: myPosts.filter((p) => matchesStatus(p, 'live')).length },
                  { key: 'review', label: 'In review', count: myPosts.filter((p) => matchesStatus(p, 'review')).length },
                  { key: 'changes', label: 'Needs changes', count: myPosts.filter((p) => matchesStatus(p, 'changes')).length },
                  { key: 'notlive', label: 'Not live', count: myPosts.filter((p) => matchesStatus(p, 'notlive')).length },
                ]}
              />
              {mineTags.length > 0 && (
                <FilterChips
                  value={mineTag}
                  onChange={setMineTag}
                  options={[{ key: 'all', label: 'Any tag' }, ...mineTags.map((t) => ({ key: t, label: t }))]}
                />
              )}
            </FilterBar>
          )}
          {myPosts.length > 0 && shownMine.length === 0 && (
            <p className="muted">No posts match those filters.</p>
          )}
          <div>
            {shownMine.map((p) => (
              <div key={p.slug} style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: '1px solid rgba(28,43,58,.06)' }}>
                <Thumb src={p.coverImage} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: charcoal }}>{p.title}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...postTone(p) }}>
                      {postStatus(p)}
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, margin: '5px 0 8px' }}>{p.excerpt}</p>
                  {p.reviewStatus === 'REJECTED' && p.reviewNote && (
                    <p style={{ fontSize: 13, lineHeight: 1.55, margin: '0 0 8px', padding: '8px 11px', borderRadius: 9, background: 'rgba(192,80,75,.07)', border: '1px solid rgba(192,80,75,.18)', color: '#8A3A36' }}>
                      <b>Sent back:</b> {p.reviewNote} — edit the post to resubmit it.
                    </p>
                  )}
                  <div className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>{p.dateLabel}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {p.readTime}</span>
                    <Tags tags={p.tags} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
                  <Link href={`/expert/blogs/${p.slug}/edit`} className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Pencil size={13} /> Edit
                  </Link>
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'all' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>All blogs</div>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
            {shownAll.length === allPosts.length
              ? `${allPosts.length} published across GetCalmly`
              : `${shownAll.length} of ${allPosts.length} published posts`}
          </p>
          <FilterBar query={allQuery} onQuery={setAllQuery} placeholder="Search title, author or tag…">
            {allTags.length > 0 && (
              <FilterChips
                value={allTag}
                onChange={setAllTag}
                options={[{ key: 'all', label: 'Any tag' }, ...allTags.map((t) => ({ key: t, label: t }))]}
              />
            )}
          </FilterBar>
          {shownAll.length === 0 && <p className="muted">No posts match those filters.</p>}
          <div>
            {shownAll.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: '1px solid rgba(28,43,58,.06)', textDecoration: 'none' }}>
                <Thumb src={p.coverImage} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: charcoal }}>{p.title}</div>
                  <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, margin: '5px 0 8px' }}>{p.excerpt}</p>
                  <div className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#6B7D8E' }}>{p.author} · {p.role}</span>
                    <span>{p.date}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {p.readTime}</span>
                    <Tags tags={p.tags} />
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: coral, flexShrink: 0, marginTop: 4 }} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
