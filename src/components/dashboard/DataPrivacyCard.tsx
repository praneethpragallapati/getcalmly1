'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { Download, Trash2, AlertTriangle } from 'lucide-react'
import { exportMyData, deleteMyAccount } from '@/app/(dashboard)/app/actions'

const coral = '#C8553D'

export function DataPrivacyCard() {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  function download() {
    setMsg(null)
    start(async () => {
      const res = await exportMyData()
      if (res.ok && res.json) {
        const blob = new Blob([res.json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `getcalmly-my-data-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a); a.click(); a.remove()
        URL.revokeObjectURL(url)
        setMsg('Your data has been downloaded.')
      } else {
        setMsg(res.error ?? 'Could not export your data.')
      }
    })
  }

  function remove() {
    if (confirmText !== 'DELETE') return
    start(async () => {
      const res = await deleteMyAccount()
      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      } else {
        setMsg(res.error ?? 'Could not delete your account.')
      }
    })
  }

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 4 }}>Your data</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
        Download everything we hold about you, or permanently delete your account.
      </p>

      <button onClick={download} disabled={pending} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <Download size={15} /> {pending ? 'Preparing…' : 'Download my data'}
      </button>
      <p className="muted" style={{ fontSize: 11.5, margin: '7px 0 0' }}>A JSON file with your profile, check-ins, journals, sessions, payments and more.</p>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--c-line, rgba(28,43,58,.1))' }}>
        {!confirming ? (
          <button onClick={() => { setConfirming(true); setMsg(null) }} disabled={pending}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: `1.5px solid ${coral}`, color: coral, borderRadius: 10, padding: '9px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Trash2 size={15} /> Delete my account
          </button>
        ) : (
          <div style={{ background: 'rgba(200,85,61,.05)', border: '1px solid rgba(200,85,61,.2)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <AlertTriangle size={17} style={{ color: coral, flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: '#3A4A5A', lineHeight: 1.55 }}>
                This permanently deletes your account and all your data — check-ins, journals, sessions, packages and payments. <b>This cannot be undone.</b> Consider downloading your data first.
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 5 }}>Type <b style={{ color: coral }}>DELETE</b> to confirm</label>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE"
                style={{ border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', width: 200, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={remove} disabled={pending || confirmText !== 'DELETE'}
                style={{ background: coral, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13.5, fontWeight: 700, cursor: confirmText === 'DELETE' && !pending ? 'pointer' : 'default', opacity: confirmText === 'DELETE' && !pending ? 1 : 0.5, fontFamily: 'inherit' }}>
                {pending ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button onClick={() => { setConfirming(false); setConfirmText('') }} disabled={pending}
                style={{ background: 'none', border: 'none', color: '#6B7D8E', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {msg && <p style={{ fontSize: 13, color: msg.includes('download') ? '#2C7A57' : coral, marginTop: 12 }}>{msg}</p>}
    </div>
  )
}
