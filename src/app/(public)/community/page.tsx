'use client'

import { useState, useMemo } from 'react'

// ─── Data ───────────────────────────────────────────────────────────────────

const POSTS = [
  {
    id: 1,
    title: "I keep catastrophising at night — anyone else find a way through it?",
    body: "Every night around 10pm my brain just switches into worst-case-scenario mode. I've tried journaling but my thoughts just spiral more when I write them down. Has anyone found something that actually helps break the loop?",
    author: "Priya M.",
    role: "Paid Member",
    tenure: "8 months",
    date: "2 hours ago",
    tags: ["anxiety", "sleep", "cbt"],
    upvotes: 47,
    comments: 18,
  },
  {
    id: 2,
    title: "Nobody told me postpartum could feel like this — sharing my story",
    body: "Six weeks after my daughter was born I couldn't get out of bed some mornings. Not because I was tired — I was, but this was different. I felt completely empty. I want to share what helped me in case anyone else is going through this silently.",
    author: "Dr. Shruti A.",
    role: "Therapist",
    tenure: null,
    date: "Yesterday",
    tags: ["postpartum", "mothers-health", "depression"],
    upvotes: 134,
    comments: 42,
  },
  {
    id: 3,
    title: "My husband finally agreed to therapy after 3 years of me asking",
    body: "I don't know what finally clicked for him. Maybe it was the panic attack at work. I'm posting this because if you're a partner of someone who refuses to go — keep showing up with patience, not pressure. It took 3 years but we're here.",
    author: "Kavitha R.",
    role: "Member",
    tenure: null,
    date: "3 days ago",
    tags: ["relationships", "men-mental-health", "stigma"],
    upvotes: 89,
    comments: 31,
  },
  {
    id: 4,
    title: "CBT homework actually changed my thought patterns — here's what I did",
    body: "I was skeptical when my therapist gave me a thought record form. It felt like homework from school. But three weeks in, I genuinely started catching the cognitive distortions in real time. Happy to share the template if it helps.",
    author: "Arjun K.",
    role: "Paid Member",
    tenure: "14 months",
    date: "4 days ago",
    tags: ["cbt", "anxiety", "self-awareness"],
    upvotes: 212,
    comments: 67,
  },
  {
    id: 5,
    title: "Grief two years on — it doesn't get smaller, you get bigger",
    body: "Someone shared this quote with me and I've been thinking about it ever since. Two years after losing my father I'm not 'over it' and I don't think I ever will be. But I've built more space around the grief. Wanted to share this for anyone in the early days.",
    author: "Farah Z.",
    role: "Member",
    tenure: null,
    date: "1 week ago",
    tags: ["grief", "loss", "self-awareness"],
    upvotes: 178,
    comments: 53,
  },
  {
    id: 6,
    title: "Resources for OCD that aren't just 'think positive'",
    body: "Most of what you find online for OCD is surface-level advice. As someone with OCD and a background in psychology, I want to share what ERP (Exposure and Response Prevention) actually involves and why it's different from generic anxiety advice.",
    author: "Dr. Ramesh P.",
    role: "Psychiatrist",
    tenure: null,
    date: "1 week ago",
    tags: ["ocd", "anxiety", "cbt"],
    upvotes: 156,
    comments: 39,
  },
  {
    id: 7,
    title: "Working from home burnout is real and I don't think I recognised it for months",
    body: "I thought I was just tired. Turns out three months of no commute, no boundaries between work and home, and 14-hour days had completely depleted me. This post is about what I noticed and what's actually helping.",
    author: "Nikhil S.",
    role: "Paid Member",
    tenure: "5 months",
    date: "2 weeks ago",
    tags: ["work-stress", "burnout", "self-care"],
    upvotes: 94,
    comments: 28,
  },
]

// ─── Role badge config ───────────────────────────────────────────────────────

type Role = "Paid Member" | "Member" | "Therapist" | "Psychiatrist" | "Admin"

const ROLE_BADGE: Record<Role, { label: string; bg: string; color: string }> = {
  "Paid Member":  { label: "Paid Member ⭐",    bg: "rgba(200,85,61,.1)",   color: "#C8553D" },
  "Member":       { label: "Member",            bg: "rgba(0,0,0,.05)",     color: "#6B7D8E" },
  "Therapist":    { label: "Therapist 🧑‍⚕️",     bg: "rgba(61,158,114,.1)", color: "#2C7A57" },
  "Psychiatrist": { label: "Psychiatrist 👨‍⚕️",  bg: "rgba(100,80,180,.1)", color: "#5A40B0" },
  "Admin":        { label: "Admin 🛡️",           bg: "rgba(28,43,58,.1)",   color: "#1C2B3A" },
}

// ─── Derived tag list ────────────────────────────────────────────────────────

const ALL_TAGS: string[] = Array.from(
  new Set(POSTS.flatMap((p) => p.tags))
).sort()

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role as Role] ?? {
    label: role,
    bg: "rgba(0,0,0,.05)",
    color: "#6B7D8E",
  }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
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
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: small ? "2px 9px" : "5px 14px",
        borderRadius: 20,
        fontSize: small ? 11 : 13,
        fontWeight: 500,
        background: active ? "#1C2B3A" : "rgba(28,43,58,.07)",
        color: active ? "#fff" : "#1C2B3A",
        border: "none",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.15s, color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {tag}
    </button>
  )
}

interface PostCardProps {
  post: (typeof POSTS)[number]
}

function PostCard({ post }: PostCardProps) {
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "24px 28px",
        boxShadow: "0 1px 4px rgba(28,43,58,.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1C2B3A" }}>
          {post.author}
        </span>
        <RoleBadge role={post.role} />
        {post.role === "Paid Member" && post.tenure && (
          <span style={{ fontSize: 12, color: "#C8553D", fontWeight: 500 }}>
            ⭐ {post.tenure}
          </span>
        )}
        <span
          style={{ fontSize: 12, color: "#9AABB8", marginLeft: "auto" }}
        >
          {post.date}
        </span>
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: "#1C2B3A",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {post.title}
      </h2>

      {/* Body preview */}
      <p
        style={{
          fontSize: 14,
          color: "#4A5F70",
          lineHeight: 1.65,
          margin: 0,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {post.body}
      </p>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {post.tags.map((tag) => (
          <TagChip key={tag} tag={tag} small />
        ))}
      </div>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingTop: 6,
          borderTop: "1px solid rgba(28,43,58,.07)",
          fontSize: 13,
          color: "#6B7D8E",
        }}
      >
        <span>↑ {post.upvotes} upvotes</span>
        <span>💬 {post.comments} comments</span>
        <span
          style={{
            marginLeft: "auto",
            color: "#C8553D",
            fontWeight: 600,
            cursor: "default",
            opacity: 0.7,
          }}
        >
          Read more →
        </span>
      </div>
    </article>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let posts = POSTS
    if (activeTag) {
      posts = posts.filter((p) => p.tags.includes(activeTag))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      )
    }
    return posts
  }, [search, activeTag])

  return (
    <div style={{ background: "#F9F5F2", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#1C2B3A",
          color: "#fff",
          padding: "64px 24px 48px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: 800,
            margin: "0 0 16px",
            letterSpacing: "-0.5px",
          }}
        >
          Community
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,.75)",
            maxWidth: 520,
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          Real conversations, shared experiences. Read freely — join to take part.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "inline-flex",
            gap: 0,
            background: "rgba(255,255,255,.08)",
            borderRadius: 40,
            padding: "10px 28px",
            fontSize: 14,
            color: "rgba(255,255,255,.85)",
          }}
        >
          <span>
            <strong style={{ color: "#fff", fontWeight: 700 }}>2,400+</strong> members
          </span>
          <span
            style={{
              borderLeft: "1px solid rgba(255,255,255,.2)",
              marginLeft: 24,
              paddingLeft: 24,
            }}
          >
            <strong style={{ color: "#3D9E72", fontWeight: 700 }}>●</strong>{" "}
            Active daily
          </span>
        </div>
      </section>

      {/* ── Community guidelines banner ──────────────────────────────────── */}
      <div
        style={{
          background: "rgba(61,158,114,.08)",
          borderBottom: "1px solid rgba(61,158,114,.15)",
          padding: "10px 24px",
          textAlign: "center",
          fontSize: 13,
          color: "#2C7A57",
          fontWeight: 500,
        }}
      >
        Be kind &nbsp;·&nbsp; No medical advice &nbsp;·&nbsp; Your therapist is not
        here &nbsp;·&nbsp; Confidential
      </div>

      {/* ── Controls bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: "1px solid rgba(28,43,58,.09)",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <input
            type="search"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1 1 200px",
              padding: "9px 16px",
              borderRadius: 24,
              border: "1.5px solid rgba(28,43,58,.15)",
              fontSize: 14,
              color: "#1C2B3A",
              outline: "none",
              background: "#F9F5F2",
              minWidth: 160,
            }}
          />

          {/* Tag filter chips */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TagChip
              tag="All"
              active={activeTag === null}
              onClick={() => setActiveTag(null)}
            />
            {ALL_TAGS.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                active={activeTag === tag}
                onClick={() =>
                  setActiveTag(activeTag === tag ? null : tag)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Post list ────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: "#9AABB8",
              fontSize: 15,
            }}
          >
            No posts match your search.
          </div>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}

        {/* ── Locked guest banner ──────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "28px 32px",
            boxShadow: "0 1px 4px rgba(28,43,58,.08)",
            textAlign: "center",
            border: "1.5px dashed rgba(28,43,58,.15)",
          }}
        >
          <p
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#1C2B3A",
              margin: "0 0 16px",
            }}
          >
            🔒 Want to share your story or reply to others?
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <button
              style={{
                padding: "11px 28px",
                borderRadius: 28,
                background: "#C8553D",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
              }}
            >
              Join for free
            </button>
            <button
              style={{
                padding: "11px 28px",
                borderRadius: 28,
                background: "transparent",
                color: "#1C2B3A",
                fontWeight: 700,
                fontSize: 15,
                border: "2px solid rgba(28,43,58,.2)",
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </div>

          <p style={{ fontSize: 13, color: "#9AABB8", margin: 0 }}>
            Posting and commenting are open to all members — it takes 30 seconds
            to join.
          </p>
        </div>
      </main>
    </div>
  )
}
