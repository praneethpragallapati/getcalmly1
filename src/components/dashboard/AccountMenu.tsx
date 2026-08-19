'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Settings, LogOut } from 'lucide-react'

/** Topbar avatar with a small account dropdown (Settings + Log out). */
export function AccountMenu({ name, photoUrl = null }: { name: string; photoUrl?: string | null }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="tb-icon avatar"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={photoUrl ? { padding: 0, overflow: 'hidden' } : undefined}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 180,
            background: 'var(--c-white)',
            border: '1px solid var(--c-line)',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(28,43,58,.16)',
            padding: 6,
            zIndex: 40,
          }}
        >
          <div style={{ padding: '8px 10px 6px', fontSize: 12, color: 'var(--c-gray)', fontWeight: 600 }}>
            Signed in as {name}
          </div>
          <Link href="/app/settings" role="menuitem" className="acct-menu-item" onClick={() => setOpen(false)}>
            <Settings size={15} /> Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="acct-menu-item"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
