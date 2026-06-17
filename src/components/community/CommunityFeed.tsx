'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { CommunityPostView } from '@/lib/community'

// ─── Role badge config ───────────────────────────────────────────────────────

type Role = 'Paid Member' | 'Member' | 'Therapist' | 'Psychiatrist' | 'Admin'

const ROLE_BADGE: Record<Role, { label: string; bg: string; color: string }> = {
  'Paid Member': { label: 'Paid Member ⭐', bg: 'rgba(200,85,61,.1)', color: '#C8553D' },
  Member: { label: 'Member', bg: 'rgba(0,0,0,.05)', color: '#6B7D8E' },
  Therapist: { label: 'Therapist 🧑‍⚕️', bg: 'rgba(61,158,114,.1)', color: '#2C7A57' },
  Psychiatrist: { label: 'Psychiatrist 👨‍⚕️', bg: 'rgba(100,80,180,.1)', color: '#5A40B0' },
  Admin: { label: 'Admin 🛡️', bg: 'rgba(28,43,58,.1)', color: '#1C2B3A' },
}

const ROLE_DOT: Record<Role, string> = {
  'Paid Member': '#C8553D',
  Member: '#6B7D8E',
  Therapist: '#3D9E72',
  Psychiatrist: '#5A40B0',
  Admin: '#1C2B3A',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HEAD_FONT = "'Big Shoulders Display', sans-serif"
const BODY_FONT = "'DM Sans', sans-serif"

function avatarColor(name: string): string {
  const palette = ['#C8553D', '#3D9E72', '#5A40B0', '#1C2B3A', '#D98C4A', '#2C7A57']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: avatarColor(name),
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 18,
        fontFamily: HEAD_FONT,
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(28,43,58,.18)',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role as Role] ?? {
    label: role,
    bg: 'rgba(0,0,0,.05)',
    color: '#6B7D8E',
  }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

function TagChip({
  tag,
  active,
  onClick,
  small,
}: {
  tag: string
  active?: boolean
  onClick?: () => void
  small?: boolean
}) {
  const [hover, setHover] = useState(false)
  const interactive = !!onClick
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-block',
        padding: small ? '3px 11px' : '6px 15px',
        borderRadius: 20,
        fontSize: small ? 11 : 13,
        fontWeight: 600,
        background: active
          ? '#1C2B3A'
          : interactive && hover
          ? 'rgba(28,43,58,.14)'
          : 'rgba(28,43,58,.06)',
        color: active ? '#fff' : '#1C2B3A',
        border: 'none',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'background 0.18s, color 0.18s, transform 0.18s',
        transform: interactive && hover && !active ? 'translateY(-1px)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {tag}
    </button>
  )
}

function PostCard({ post }: { post: CommunityPostView }) {
  const [hover, setHover] = useState(false)
  return (
    <Link href={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: '22px 24px',
        boxShadow: hover ? '0 18px 48px rgba(28,43,58,.12)' : '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
        border: '1px solid rgba(28,43,58,.07)',
        display: 'flex',
        gap: 18,
        transition: 'box-shadow 0.25s, transform 0.25s',
        transform: hover ? 'translateY(-3px)' : 'none',
        cursor: 'pointer',
      }}
    >
      {/* Upvote pill */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          background: 'rgba(200,85,61,.07)',
          borderRadius: 14,
          padding: '10px 10px',
          height: 'fit-content',
          minWidth: 52,
        }}
      >
        <span style={{ color: '#C8553D', fontSize: 15, lineHeight: 1 }}>▲</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1C2B3A', fontFamily: HEAD_FONT }}>
          {post.upvotes}
        </span>
        <span style={{ fontSize: 10, color: '#9AABB8', fontWeight: 600, letterSpacing: '.5px' }}>
          VOTES
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={post.author} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1C2B3A' }}>{post.author}</span>
              <RoleBadge role={post.role} />
              {post.role === 'Paid Member' && post.tenure && (
                <span style={{ fontSize: 12, color: '#C8553D', fontWeight: 500 }}>
                  ⭐ {post.tenure}
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#9AABB8' }}>{post.date}</span>
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: HEAD_FONT,
            fontSize: 22,
            fontWeight: 700,
            color: '#1C2B3A',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          {post.title}
        </h2>

        {/* Body preview */}
        <p
          style={{
            fontSize: 14.5,
            color: '#4A5F70',
            lineHeight: 1.65,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {post.body}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {post.tags.map((tag) => (
            <TagChip key={tag} tag={`#${tag}`} small />
          ))}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            paddingTop: 12,
            borderTop: '1px solid rgba(28,43,58,.07)',
            fontSize: 13,
            color: '#6B7D8E',
            fontWeight: 600,
          }}
        >
          <span>💬 {post.comments} comments</span>
          <span>↗ Share</span>
          <span
            style={{
              marginLeft: 'auto',
              color: '#C8553D',
              fontWeight: 700,
              transition: 'transform 0.2s',
              transform: hover ? 'translateX(3px)' : 'none',
            }}
          >
            Read more →
          </span>
        </div>
      </div>
    </article>
    </Link>
  )
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 18,
        padding: '20px 22px',
        boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
        border: '1px solid rgba(28,43,58,.07)',
      }}
    >
      <h3
        style={{
          fontFamily: HEAD_FONT,
          fontSize: 17,
          fontWeight: 700,
          color: '#1C2B3A',
          margin: '0 0 14px',
          textTransform: 'uppercase',
          letterSpacing: '.5px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommunityFeed({ posts }: { posts: CommunityPostView[] }) {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts],
  )
  const popularTags = useMemo(
    () =>
      allTags
        .map((tag) => ({ tag, count: posts.filter((p) => p.tags.includes(tag)).length }))
        .sort((a, b) => b.count - a.count),
    [allTags, posts],
  )

  const filtered = useMemo(() => {
    let list = posts
    if (activeTag) {
      list = list.filter((p) => p.tags.includes(activeTag))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      )
    }
    return list
  }, [posts, search, activeTag])

  return (
    <div style={{ background: '#F9F5F2', minHeight: '100vh', fontFamily: BODY_FONT }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          background: '#1C2B3A',
          color: '#fff',
          padding: '72px 24px 64px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '8%',
            width: 420,
            height: 420,
            background: 'radial-gradient(circle, rgba(200,85,61,.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            right: '6%',
            width: 460,
            height: 460,
            background: 'radial-gradient(circle, rgba(61,158,114,.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          {/* Eyebrow */}
          <span
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 30,
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.14)',
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.8)',
              marginBottom: 22,
            }}
          >
            You&apos;re not alone in this
          </span>

          <h1
            style={{
              fontFamily: HEAD_FONT,
              fontSize: 'clamp(52px, 9vw, 92px)',
              fontWeight: 800,
              margin: '0 0 18px',
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            Community
          </h1>

          <p
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,.78)',
              maxWidth: 540,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Real conversations, shared experiences, and the quiet relief of being understood. Read
            freely — join to take part.
          </p>

          {/* Live indicator + avatar stack */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex' }}>
              {['A', 'P', 'K', 'S', 'F'].map((c, i) => (
                <div
                  key={c}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: avatarColor(c + i),
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    fontFamily: HEAD_FONT,
                    border: '2px solid #1C2B3A',
                    marginLeft: i === 0 ? 0 : -12,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>
              <span style={{ color: '#3D9E72', fontWeight: 700 }}>●</span> 23 members online now
            </span>
          </div>

          {/* Stats pill row */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,.07)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 40,
              padding: '12px 30px',
              fontSize: 14,
              color: 'rgba(255,255,255,.85)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 0,
            }}
          >
            <span>
              <strong style={{ color: '#fff', fontWeight: 800, fontFamily: HEAD_FONT, fontSize: 18 }}>
                2,400+
              </strong>{' '}
              members
            </span>
            <span
              style={{
                borderLeft: '1px solid rgba(255,255,255,.2)',
                margin: '0 22px',
                paddingLeft: 22,
              }}
            >
              <strong style={{ color: '#fff', fontWeight: 800, fontFamily: HEAD_FONT, fontSize: 18 }}>
                {posts.length * 60}+
              </strong>{' '}
              discussions
            </span>
            <span
              style={{
                borderLeft: '1px solid rgba(255,255,255,.2)',
                paddingLeft: 22,
              }}
            >
              <strong style={{ color: '#3D9E72', fontWeight: 800, fontFamily: HEAD_FONT, fontSize: 18 }}>
                ●
              </strong>{' '}
              Active daily
            </span>
          </div>
        </div>
      </section>

      {/* ── Community guidelines banner ──────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(61,158,114,.08)',
          borderBottom: '1px solid rgba(61,158,114,.15)',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: 13,
          color: '#2C7A57',
          fontWeight: 600,
        }}
      >
        Be kind &nbsp;·&nbsp; No medical advice &nbsp;·&nbsp; Your therapist is not here &nbsp;·&nbsp;
        Confidential
      </div>

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 68,
          zIndex: 10,
          background: 'rgba(255,255,255,.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(28,43,58,.09)',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <span
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 15,
                pointerEvents: 'none',
                opacity: 0.6,
              }}
            >
              🔍
            </span>
            <input
              type="search"
              placeholder="Search discussions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: 26,
                border: '1.5px solid rgba(28,43,58,.15)',
                fontSize: 14,
                color: '#1C2B3A',
                outline: 'none',
                background: '#F9F5F2',
                fontFamily: BODY_FONT,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Tag filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <TagChip tag="All" active={activeTag === null} onClick={() => setActiveTag(null)} />
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px 64px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* ── Main feed ──────────────────────────────────────────────────── */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          {/* Result count */}
          <div style={{ fontSize: 13, color: '#6B7D8E', fontWeight: 600 }}>
            Showing {filtered.length} discussion{filtered.length === 1 ? '' : 's'}
            {activeTag && (
              <>
                {' '}
                in <span style={{ color: '#C8553D' }}>#{activeTag}</span>
              </>
            )}
          </div>

          {/* Start a discussion prompt (locked for guests) */}
          <Link
            href="/register"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: '#fff',
              borderRadius: 18,
              padding: '16px 20px',
              boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
              border: '1px solid rgba(28,43,58,.07)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(28,43,58,.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              ✍️
            </div>
            <span style={{ flex: 1, fontSize: 14.5, color: '#9AABB8', fontWeight: 500 }}>
              Share what&apos;s on your mind…
            </span>
            <span
              style={{
                padding: '8px 18px',
                borderRadius: 22,
                background: '#C8553D',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13.5,
                whiteSpace: 'nowrap',
              }}
            >
              🔒 Start a discussion
            </span>
          </Link>

          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: '#9AABB8',
                fontSize: 15,
                background: '#fff',
                borderRadius: 18,
                border: '1px solid rgba(28,43,58,.05)',
              }}
            >
              No discussions match your search.
            </div>
          ) : (
            filtered.map((post) => <PostCard key={post.id} post={post} />)
          )}

          {/* ── Locked guest banner ──────────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #1C2B3A 0%, #2A3F54 100%)',
              borderRadius: 22,
              padding: '40px 32px',
              textAlign: 'center',
              overflow: 'hidden',
              color: '#fff',
              boxShadow: '0 14px 36px rgba(28,43,58,.25)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-100px',
                right: '-60px',
                width: 320,
                height: 320,
                background: 'radial-gradient(circle, rgba(200,85,61,.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
              <p
                style={{
                  fontFamily: HEAD_FONT,
                  fontSize: 26,
                  fontWeight: 700,
                  margin: '0 0 10px',
                  lineHeight: 1.2,
                }}
              >
                Want to share your story or reply to others?
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,.75)',
                  margin: '0 auto 22px',
                  maxWidth: 420,
                  lineHeight: 1.6,
                }}
              >
                Posting and commenting are open to all members — it takes 30 seconds to join, and
                it&apos;s free.
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/register"
                  style={{
                    padding: '12px 30px',
                    borderRadius: 28,
                    background: '#C8553D',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    boxShadow: '0 6px 18px rgba(200,85,61,.4)',
                  }}
                >
                  Join for free
                </Link>
                <Link
                  href="/login"
                  style={{
                    padding: '12px 30px',
                    borderRadius: 28,
                    background: 'rgba(255,255,255,.08)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    border: '2px solid rgba(255,255,255,.25)',
                  }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            position: 'sticky',
            top: 150,
          }}
        >
          {/* Popular tags */}
          <SidebarCard title="Popular tags">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {popularTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTag === tag ? '#1C2B3A' : 'rgba(28,43,58,.06)',
                    color: activeTag === tag ? '#fff' : '#1C2B3A',
                    transition: 'background 0.18s, color 0.18s',
                  }}
                >
                  #{tag}
                  <span style={{ fontSize: 10.5, opacity: 0.7, fontWeight: 700 }}>{count}</span>
                </button>
              ))}
            </div>
          </SidebarCard>

          {/* Community guidelines */}
          <SidebarCard title="Community guidelines">
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {[
                ['💚', 'Be kind', 'Lead with empathy, always.'],
                ['⚕️', 'No medical advice', 'Share experiences, not prescriptions.'],
                ['🧑‍⚕️', 'Your therapist is not here', 'This is peer support, not treatment.'],
                ['🔒', 'Confidential', "What's shared here, stays here."],
              ].map(([icon, head, sub]) => (
                <li key={head} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 16, lineHeight: 1.4 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1C2B3A' }}>{head}</div>
                    <div style={{ fontSize: 12.5, color: '#6B7D8E', lineHeight: 1.4 }}>{sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </SidebarCard>

          {/* Role legend */}
          <SidebarCard title="Who's who">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {(Object.keys(ROLE_BADGE) as Role[]).map((role) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: ROLE_DOT[role],
                      flexShrink: 0,
                    }}
                  />
                  <RoleBadge role={role} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#9AABB8', margin: '14px 0 0', lineHeight: 1.5 }}>
              Verified clinicians appear with a coloured badge. They share insight — but never
              replace your own care team.
            </p>
          </SidebarCard>
        </aside>
      </div>

      {/* Collapse to single column on narrow screens */}
      <style>{`
        @media (max-width: 860px) {
          main + aside { position: static !important; }
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
