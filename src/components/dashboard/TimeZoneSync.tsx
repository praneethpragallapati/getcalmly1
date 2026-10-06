'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveMyTimeZone } from '@/app/(dashboard)/app/actions'

/**
 * Keeps the account's time zone in step with the device: if the browser's zone
 * differs from the one on file (first visit, or travelling), it is saved and
 * the page re-renders on the patient's own clock.
 */
export function TimeZoneSync({ stored }: { stored: string }) {
  const router = useRouter()
  useEffect(() => {
    let tz = ''
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return }
    if (!tz || tz === stored) return
    void saveMyTimeZone(tz).then((r) => { if (r.ok) router.refresh() })
  }, [stored, router])
  return null
}
