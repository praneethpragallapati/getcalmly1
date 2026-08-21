'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

/** Standalone "Log out" button for the Settings account card. */
export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn btn-ghost-d"
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid var(--c-line)',
        color: 'var(--c-coral-d)',
        background: 'var(--c-white)',
        padding: '9px 16px',
        borderRadius: 11,
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
      }}
    >
      <LogOut size={16} /> Log out
    </button>
  )
}
