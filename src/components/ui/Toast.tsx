'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

/**
 * App-wide toast notifications. Mounted once per dashboard layout via
 * <ToastProvider>; any client component calls `useToast().show('Saved', 'success')`
 * to confirm an action. Toasts auto-dismiss and stack in the corner.
 */

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; kind: ToastKind }

type ToastApi = {
  show: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

let seq = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++seq
    setToasts((list) => [...list, { id, message, kind }])
    // Auto-dismiss; errors linger a little longer so they're not missed.
    window.setTimeout(() => remove(id), kind === 'error' ? 6000 : 3800)
  }, [remove])

  const api: ToastApi = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    // Play the enter transition on next frame.
    const id = requestAnimationFrame(() => setLeaving(false))
    return () => cancelAnimationFrame(id)
  }, [])

  const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? AlertCircle : Info
  return (
    <div className={`toast toast-${toast.kind}${leaving ? ' toast-leaving' : ''}`}>
      <Icon size={17} className="toast-ico" />
      <span className="toast-msg">{toast.message}</span>
      <button type="button" className="toast-x" aria-label="Dismiss" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  )
}

/**
 * Access the toast API. Safe to call outside a provider — it degrades to a
 * no-op so a component never crashes if its tree isn't wrapped.
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  return ctx ?? { show: () => {}, success: () => {}, error: () => {} }
}
