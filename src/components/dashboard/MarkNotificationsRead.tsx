'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationsRead } from '@/app/(dashboard)/app/actions'

/**
 * Marks notifications read once when the notifications page is opened. The
 * expert portal passes its own action, since the patient one revalidates
 * patient routes.
 */
export function MarkNotificationsRead({ hasUnread, onMarkRead }: {
  hasUnread: boolean
  onMarkRead?: () => Promise<unknown>
}) {
  const router = useRouter()
  const ran = useRef(false)
  useEffect(() => {
    if (!hasUnread || ran.current) return
    ran.current = true
    const mark = onMarkRead ?? markNotificationsRead
    mark().then(() => router.refresh()).catch(() => {})
  }, [hasUnread, onMarkRead, router])
  return null
}
