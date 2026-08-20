'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Maximize2, Minimize2 } from 'lucide-react'
import { markSessionJoined } from '@/app/(dashboard)/app/actions'

const AUTO_FS_KEY = 'gc-call-autofullscreen'

/**
 * 100ms video, embedded via the prebuilt meeting URL (an iframe) so there's no
 * heavy client SDK to bundle. The URL is minted server-side with a role-scoped
 * room code; media + TURN are handled by 100ms. The call stays inside the app
 * chrome. When `meetingUrl` is null, 100ms isn't configured yet.
 *
 * Screen sharing is deliberately not permitted: the iframe's allow-list omits
 * display-capture, so the browser refuses any capture request from inside the
 * frame. This is a therapy room — there's nothing to present, and it removes a
 * way to accidentally expose the rest of someone's screen.
 */
export function HmsRoom({
  roomId,
  meetingUrl,
  backHref,
}: {
  roomId: string
  meetingUrl: string | null
  backHref: string
}) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [isFull, setIsFull] = useState(false)
  const [autoFull, setAutoFull] = useState(false)

  useEffect(() => {
    // Record this side's join, then keep a presence heartbeat while the call is
    // open (every 20s). "Time together" is measured from these pings, so a call
    // that ends early counts only the minutes actually spent — not the whole
    // scheduled slot. Best-effort; a missed ping just shortens the measured time.
    void markSessionJoined(roomId)
    const iv = setInterval(() => { void markSessionJoined(roomId) }, 20_000)
    const onVisible = () => { if (document.visibilityState === 'visible') void markSessionJoined(roomId) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVisible) }
  }, [roomId])

  // Follow the real fullscreen state, so Esc and the browser's own control keep
  // our button honest.
  useEffect(() => {
    const sync = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const enter = useCallback(async () => {
    try { await shellRef.current?.requestFullscreen() } catch { /* denied — button stays */ }
  }, [])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen() } catch { /* ignore */ }
    } else {
      await enter()
    }
  }, [enter])

  // Auto-fullscreen, when the member has asked for it. Browsers only grant
  // fullscreen from a user gesture, and arriving on this page isn't one — so try
  // immediately, and if that's refused, arm a one-shot listener to try again on
  // their first click or key press in the room.
  useEffect(() => {
    let want = false
    try { want = localStorage.getItem(AUTO_FS_KEY) === '1' } catch { /* storage blocked */ }
    setAutoFull(want)
    if (!want || !meetingUrl) return

    let armed = true
    const attempt = () => {
      if (!armed || document.fullscreenElement) return
      void shellRef.current?.requestFullscreen().then(
        () => { armed = false },
        () => { /* still needs a gesture; the listeners below retry */ },
      )
    }
    attempt()
    const onGesture = () => { attempt(); if (!armed) cleanup() }
    const cleanup = () => {
      document.removeEventListener('pointerdown', onGesture)
      document.removeEventListener('keydown', onGesture)
    }
    document.addEventListener('pointerdown', onGesture)
    document.addEventListener('keydown', onGesture)
    return () => { armed = false; cleanup() }
  }, [meetingUrl])

  const setAuto = (on: boolean) => {
    setAutoFull(on)
    try { localStorage.setItem(AUTO_FS_KEY, on ? '1' : '0') } catch { /* ignore */ }
    if (on && !document.fullscreenElement) void enter()
  }

  if (!meetingUrl) {
    return (
      <div className="call-room">
        <div className="call-error" style={{ margin: '16px 0' }}>
          Video isn’t set up yet. Please try again shortly, or{' '}
          <Link href={backHref} className="link-action">go back</Link>.
        </div>
      </div>
    )
  }

  return (
    <div className="call-room">
      <div ref={shellRef} className={`call-shell${isFull ? ' is-full' : ''}`}>
        <iframe
          src={meetingUrl}
          title="Session video"
          // No display-capture: screen sharing is blocked at the browser level.
          allow="camera; microphone; fullscreen; autoplay"
          className="call-frame"
        />
        <button
          type="button"
          onClick={toggle}
          className="call-fs-btn"
          aria-label={isFull ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFull ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
        >
          {isFull ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isFull ? 'Exit fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      <div className="call-foot">
        <p className="call-note">
          🔒 This is a private video room for your session. getCalmly never records or stores the call,
          and screen sharing is turned off.
        </p>
        <label className="call-auto">
          <input type="checkbox" checked={autoFull} onChange={(e) => setAuto(e.target.checked)} />
          Go fullscreen automatically
        </label>
      </div>
    </div>
  )
}
