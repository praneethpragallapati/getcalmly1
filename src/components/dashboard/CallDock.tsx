'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Maximize2, Minimize2, PhoneOff, Video } from 'lucide-react'
import { markSessionJoined } from '@/app/(dashboard)/app/actions'

/**
 * Keeps a live session call alive while the member moves around the dashboard.
 *
 * The call is a 100ms prebuilt iframe. An iframe cannot be moved in the DOM
 * without reloading — reparenting it drops the call — so the frame is mounted
 * ONCE here, in a fixed-position host portalled to <body>, and never re-parented
 * or re-keyed for the life of the call. What changes is only where that host is
 * painted:
 *
 *   docked  the room page registers an anchor element and the host is sized to
 *           that anchor's rect, so it looks like it lives on the page
 *   mini    no anchor on screen (they navigated away), so the host shrinks to a
 *           corner tile they can carry around and click to return
 *
 * Because the provider sits in the dashboard LAYOUT, it survives client-side
 * navigation between /app routes. A full page reload still tears the call down —
 * nothing can preserve an iframe across a document load.
 */

const AUTO_FS_KEY = 'gc-call-autofullscreen'

/* The portal target only exists on the client. useSyncExternalStore gives the
   "are we hydrated yet" answer without a setState-in-effect round trip. */
const noopSubscribe = () => () => {}
const onClient = () => true
const onServer = () => false

/* The auto-fullscreen preference, as a tiny external store. localStorage's own
   `storage` event does not fire in the tab that wrote it, so writers notify
   local subscribers directly. */
const autoFsListeners = new Set<() => void>()
function readAutoFs(): boolean {
  try { return localStorage.getItem(AUTO_FS_KEY) === '1' } catch { return false }
}
function writeAutoFs(on: boolean): void {
  try { localStorage.setItem(AUTO_FS_KEY, on ? '1' : '0') } catch { /* storage blocked */ }
  autoFsListeners.forEach((l) => l())
}
function subscribeAutoFs(cb: () => void): () => void {
  autoFsListeners.add(cb)
  window.addEventListener('storage', cb)
  return () => { autoFsListeners.delete(cb); window.removeEventListener('storage', cb) }
}
/** How often each side re-reports presence while the call is open. */
const HEARTBEAT_MS = 20_000

export type ActiveCall = {
  /** Appointment room key — also the identity of the call. */
  roomId: string
  meetingUrl: string
  /** Shown on the mini tile, e.g. "Dr. Hom Pragallapati". */
  title: string
  /** Route back to the full room page. */
  href: string
}

type CallCtx = {
  call: ActiveCall | null
  /** Start (or adopt) a call. No-ops when the same room is already live. */
  start: (c: ActiveCall) => void
  end: () => void
  /** The room page's placeholder; null means "nothing on screen to dock into". */
  setAnchor: (el: HTMLElement | null) => void
}

const Ctx = createContext<CallCtx | null>(null)

export function useCall(): CallCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCall must be used inside <CallProvider>')
  return c
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [call, setCall] = useState<ActiveCall | null>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  const start = useCallback((c: ActiveCall) => {
    // Adopting rather than replacing matters: the room page re-mints a meeting
    // URL on every visit, and swapping src on an existing call would reload the
    // iframe and drop them out of the room they are already in.
    setCall((prev) => (prev && prev.roomId === c.roomId ? prev : c))
  }, [])

  const end = useCallback(() => {
    setCall(null)
    setAnchor(null)
  }, [])

  const value = useMemo(() => ({ call, start, end, setAnchor }), [call, start, end])

  return (
    <Ctx.Provider value={value}>
      {children}
      <CallHost call={call} anchor={anchor} onEnd={end} />
    </Ctx.Provider>
  )
}

/** Mini-tile size, in px. Kept small enough to not cover the content column. */
const MINI_W = 288
const MINI_H = 186
const MINI_GAP = 20
/* Clears the fixed helpline button in the same corner — that control is crisis
   support and must stay both visible and clickable while a call is minimised. */
const MINI_BOTTOM = 84

function CallHost({
  call,
  anchor,
  onEnd,
}: {
  call: ActiveCall | null
  anchor: HTMLElement | null
  onEnd: () => void
}) {
  const router = useRouter()
  const hostRef = useRef<HTMLDivElement>(null)
  const [isFull, setIsFull] = useState(false)
  const docked = Boolean(anchor)
  const mounted = useSyncExternalStore(noopSubscribe, onClient, onServer)

  // Presence heartbeat lives HERE, not on the room page: "time together" should
  // keep counting while the call is minimised, because the call is still up.
  useEffect(() => {
    if (!call) return
    const ping = () => { void markSessionJoined(call.roomId) }
    ping()
    const iv = setInterval(ping, HEARTBEAT_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') ping() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVisible) }
  }, [call])

  // Paint the host over the anchor (docked) or in the corner (mini). Scroll is
  // listened for in the CAPTURE phase: scroll events do not bubble, but they do
  // capture, so this catches an inner scroll container as well as the window.
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host || !call) return

    const place = () => {
      if (document.fullscreenElement === host) return // fullscreen owns the box
      if (anchor) {
        const r = anchor.getBoundingClientRect()
        host.style.top = `${r.top}px`
        host.style.left = `${r.left}px`
        host.style.width = `${r.width}px`
        host.style.height = `${r.height}px`
      } else {
        host.style.top = `${Math.max(12, window.innerHeight - MINI_H - MINI_BOTTOM)}px`
        host.style.left = `${Math.max(12, window.innerWidth - MINI_W - MINI_GAP)}px`
        host.style.width = `${MINI_W}px`
        host.style.height = `${MINI_H}px`
      }
    }

    place()
    const ro = new ResizeObserver(place)
    if (anchor) ro.observe(anchor)
    ro.observe(document.documentElement)
    window.addEventListener('resize', place)
    document.addEventListener('scroll', place, { capture: true, passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
      document.removeEventListener('scroll', place, { capture: true } as EventListenerOptions)
    }
  }, [call, anchor, isFull])

  useEffect(() => {
    const sync = () => setIsFull(document.fullscreenElement === hostRef.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const enter = useCallback(async () => {
    try { await hostRef.current?.requestFullscreen() } catch { /* denied — button stays */ }
  }, [])

  const toggleFull = useCallback(async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen() } catch { /* ignore */ }
    } else {
      await enter()
    }
  }, [enter])

  // Auto-fullscreen, when asked for. Browsers only grant fullscreen from a user
  // gesture and arriving on a page isn't one, so try immediately and otherwise
  // arm a one-shot retry on their first interaction. Only ever while docked — a
  // corner tile going fullscreen would be startling.
  useEffect(() => {
    if (!call || !docked) return
    if (!readAutoFs()) return

    let armed = true
    const attempt = () => {
      if (!armed || document.fullscreenElement) return
      void hostRef.current?.requestFullscreen().then(
        () => { armed = false },
        () => { /* still needs a gesture; the listeners below retry */ },
      )
    }
    attempt()
    const cleanup = () => {
      document.removeEventListener('pointerdown', onGesture)
      document.removeEventListener('keydown', onGesture)
    }
    function onGesture() { attempt(); if (!armed) cleanup() }
    document.addEventListener('pointerdown', onGesture)
    document.addEventListener('keydown', onGesture)
    return () => { armed = false; cleanup() }
  }, [call, docked])

  if (!mounted || !call) return null

  return createPortal(
    <div
      ref={hostRef}
      className={`call-host${docked ? ' is-docked' : ' is-mini'}${isFull ? ' is-full' : ''}`}
    >
      <iframe
        src={call.meetingUrl}
        title="Session video"
        // No display-capture: screen sharing is blocked at the browser level, so
        // the frame cannot capture a screen even if 100ms offers the control.
        allow="camera; microphone; fullscreen; autoplay"
        className="call-frame"
      />

      {docked ? (
        <button
          type="button"
          onClick={toggleFull}
          className="call-fs-btn"
          aria-label={isFull ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFull ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
        >
          {isFull ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isFull ? 'Exit fullscreen' : 'Fullscreen'}</span>
        </button>
      ) : (
        <div className="call-mini-bar">
          <span className="call-mini-title" title={call.title}>
            <Video size={13} aria-hidden /> {call.title}
          </span>
          <span className="call-mini-acts">
            <button type="button" className="call-mini-btn" onClick={() => router.push(call.href)}>
              Return
            </button>
            <button
              type="button"
              className="call-mini-btn is-end"
              onClick={onEnd}
              aria-label="Leave the call"
              title="Leave the call"
            >
              <PhoneOff size={13} />
            </button>
          </span>
        </div>
      )}
    </div>,
    document.body,
  )
}

/** The auto-fullscreen preference, surfaced next to the docked call. */
export function useAutoFullscreenPref(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(subscribeAutoFs, readAutoFs, onServer)
  return [on, writeAutoFs]
}
