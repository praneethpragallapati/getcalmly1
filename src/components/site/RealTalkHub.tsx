'use client'

import { useState } from 'react'
import BlogList from '@/components/blog/BlogList'
import CommunityFeed from '@/components/community/CommunityFeed'
import type { BlogPostView } from '@/lib/blog'
import type { CommunityPostView } from '@/lib/community'

/**
 * "Real Talk" — getCalmly's content hub. Merges the articles (Read) and the
 * community circles (Circles) into one place with a single tabbed switcher.
 * Each underlying feed brings its own hero, so only one shows at a time.
 */
export default function RealTalkHub({
  blogPosts,
  communityPosts,
  initial = 'read',
}: {
  blogPosts: BlogPostView[]
  communityPosts: CommunityPostView[]
  initial?: 'read' | 'circles'
}) {
  const [tab, setTab] = useState<'read' | 'circles'>(initial)

  return (
    <div style={{ background: '#F9F5F2' }}>
      {/* Sticky tab switcher */}
      <div
        style={{
          position: 'sticky',
          top: 68,
          zIndex: 40,
          background: 'rgba(249,245,242,.9)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(28,43,58,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 16px',
        }}
      >
        <span
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontWeight: 900,
            fontSize: 18,
            color: '#C8553D',
            letterSpacing: '-0.5px',
            marginRight: 10,
          }}
        >
          Real Talk
        </span>
        {(
          [
            ['read', 'Read'],
            ['circles', 'Circles'],
          ] as const
        ).map(([key, label]) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                padding: '8px 18px',
                borderRadius: 30,
                cursor: 'pointer',
                border: '1.5px solid ' + (active ? '#C8553D' : 'rgba(28,43,58,.16)'),
                background: active ? '#C8553D' : 'transparent',
                color: active ? '#fff' : '#5A6A7A',
                transition: 'all .18s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'read' ? (
        <BlogList posts={blogPosts} />
      ) : (
        <CommunityFeed posts={communityPosts} />
      )}
    </div>
  )
}
