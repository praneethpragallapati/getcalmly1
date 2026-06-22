'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationsRead } from '@/app/(dashboard)/app/actions'

/** Marks notifications read once when the notifications page is opened. */
export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter()
  const ran = useRef(false)
  useEffect(() => {
    if (!hasUnread || ran.current) return
    ran.current = true
    markNotificationsRead().then(() => router.refresh())
  }, [hasUnread, router])
  return null
}
