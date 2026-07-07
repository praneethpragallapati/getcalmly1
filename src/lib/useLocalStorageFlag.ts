'use client'

import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Tracks whether a localStorage key is set (e.g. a dismissed banner).
 * Reports the key as set during SSR/hydration so dismissable UI stays
 * hidden until the client can actually read localStorage.
 */
export function useLocalStorageFlag(key: string): [boolean, (value: string) => void] {
  const isSet = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) !== null,
    () => true,
  )
  const setFlag = (value: string) => {
    localStorage.setItem(key, value)
    listeners.forEach((l) => l())
  }
  return [isSet, setFlag]
}
