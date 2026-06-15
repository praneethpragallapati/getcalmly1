'use client'

import { useEffect } from 'react'
import { LANDING_SCRIPT } from './landingScript'

/**
 * Injects the landing interactions (nav scroll state, reveal-on-scroll,
 * dashboard tab switch). Mounted once per page via SiteShell.
 */
export default function LandingRuntime() {
  useEffect(() => {
    document.getElementById('lp-script')?.remove()
    const s = document.createElement('script')
    s.id = 'lp-script'
    s.textContent = LANDING_SCRIPT
    document.body.appendChild(s)
    return () => {
      document.getElementById('lp-script')?.remove()
    }
  }, [])
  return null
}
