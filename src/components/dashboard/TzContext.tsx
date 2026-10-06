'use client'

import { createContext, useContext } from 'react'
import { IST_TZ } from '@/lib/tz'

/**
 * The patient's own time zone for client components (booking calendar, times
 * on cards), provided by the dashboard layout from the account, so the server
 * render and the browser agree.
 */
const TzContext = createContext<string>(IST_TZ)

export function TzProvider({ value, children }: { value: string; children: React.ReactNode }) {
  return <TzContext.Provider value={value}>{children}</TzContext.Provider>
}

export function useTz(): string {
  return useContext(TzContext)
}
