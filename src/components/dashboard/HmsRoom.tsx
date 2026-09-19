'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCall, useAutoFullscreenPref } from '@/components/dashboard/CallDock'

/**
 * The room page's slot for the call.
 *
 * This component does NOT own the iframe. The 100ms frame is mounted once by
 * <CallProvider> in the dashboard layout, so it survives navigation between
 * pages; all this does is register the call and hand the dock an element to
 * paint itself over. That's why leaving this page minimises the call into a
 * corner tile instead of hanging up.
 *
 * When `meetingUrl` is null, 100ms isn't configured yet.
 */
export function HmsRoom({
  roomId,
  meetingUrl,
  backHref,
  roomHref,
  title,
  hardEndISO,
}: {
  roomId: string
  meetingUrl: string | null
  /** Where the "go back" link points (the sessions list). */
  backHref: string
  /** This room's own URL — where the minimised tile's "Return" goes back to. */
  roomHref: string
  /** Who they're talking to — shown on the minimised tile. */
  title: string
  /** ISO instant at which the call is cut off (2h cap), computed server-side. */
  hardEndISO: string
}) {
  const { start, end, setAnchor, call } = useCall()
  const slotRef = useRef<HTMLDivElement>(null)
  const [autoFull, setAutoFull] = useAutoFullscreenPref()

  useEffect(() => {
    if (!meetingUrl) return
    start({ roomId, meetingUrl, title, href: roomHref, hardEndMs: Date.parse(hardEndISO) })
  }, [roomId, meetingUrl, title, roomHref, hardEndISO, start])

  // Register this page's slot while it's on screen; releasing it on unmount is
  // what tips the dock into its minimised state.
  useEffect(() => {
    if (!meetingUrl) return
    const el = slotRef.current
    setAnchor(el)
    return () => setAnchor(null)
  }, [meetingUrl, setAnchor])

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
      {/* Reserves the space the docked frame is painted over. It stays empty on
          purpose — the frame itself lives in the layout, above this. */}
      <div ref={slotRef} className="call-slot" aria-hidden />

      <div className="call-foot">
        <p className="call-note">
          🔒 This is a private video room for your session. getCalmly never records or stores the call,
          and screen sharing is turned off. Calls end automatically after 2 hours.
        </p>
        <label className="call-auto">
          <input type="checkbox" checked={autoFull} onChange={(e) => setAutoFull(e.target.checked)} />
          Go fullscreen automatically
        </label>
        {call?.roomId === roomId && (
          <button type="button" className="call-leave" onClick={end}>
            Leave call
          </button>
        )}
      </div>
    </div>
  )
}
