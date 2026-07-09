'use client'

import { useState } from 'react'

/**
 * Photo layer for a blog cover. Sits inside a position:relative container that
 * already carries a brand gradient background, if the image fails to load it
 * simply removes itself and the gradient shows through. The scrim keeps any
 * white text/pills on top legible over the photo.
 */
export default function BlogCover({
  src,
  alt = '',
  scrim = 'linear-gradient(160deg, rgba(28,43,58,.40) 0%, rgba(28,43,58,.66) 100%)',
  position = 'center',
}: {
  src: string
  alt?: string
  scrim?: string
  position?: string
}) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setOk(false)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: position }}
      />
      <div style={{ position: 'absolute', inset: 0, background: scrim, pointerEvents: 'none' }} />
    </>
  )
}
