'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, X } from 'lucide-react'
import { tagLabel } from '@/data/tags'

export type LightboxVideo = {
  id: string
  title: string
  thumb: string
  embed: string
  description?: string | null
  submittedByName?: string | null
  tags?: string[]
}

/**
 * A YouTube thumbnail card that opens the video in an in-app lightbox (privacy-
 * enhanced nocookie embed). Shared by Perspectives and Guided calm.
 */
export function VideoCard({ video, accent = '#C8553D' }: { video: LightboxVideo; accent?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ textAlign: 'left', border: '1px solid rgba(28,43,58,.08)', borderRadius: 16, overflow: 'hidden', background: '#fff', cursor: 'pointer', padding: 0, width: '100%', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 8px 22px rgba(28,43,58,.06)' }}
      >
        <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0d1520' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 48, height: 48, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(0,0,0,.35)' }}>
              <Play size={20} fill="#fff" />
            </span>
          </span>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1C2B3A', lineHeight: 1.3 }}>{video.title}</div>
          {video.submittedByName && <div style={{ fontSize: 12, color: '#8595a4', marginTop: 3 }}>By {video.submittedByName}</div>}
          {video.description && <div style={{ fontSize: 12.5, color: '#6B7D8E', marginTop: 5, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.description}</div>}
        </div>
      </button>
      {video.tags && video.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
          {video.tags.map((t) => (
            <Link key={t} href={`/app/tag/${t}`} style={{ textDecoration: 'none', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: 'rgba(28,43,58,.06)', color: '#1C2B3A' }}>
              #{tagLabel(t)}
            </Link>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,16,24,.82)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(920px, 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{video.title}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 14, overflow: 'hidden', background: '#000' }}>
              <iframe
                src={`${video.embed}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
