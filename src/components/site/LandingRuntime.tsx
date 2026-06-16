'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LANDING_SCRIPT } from './landingScript'

/**
 * Injects the landing interactions (nav scroll state, reveal-on-scroll,
 * dashboard tab switch). Mounted once via SiteShell, but re-runs on every
 * route change so client-side navigation back to a page with `.reveal`
 * elements re-attaches the IntersectionObserver (otherwise the content
 * stays hidden at opacity:0 until a hard refresh).
 */
export default function LandingRuntime() {
  const pathname = usePathname()
  useEffect(() => {
    document.getElementById('lp-script')?.remove()
    const s = document.createElement('script')
    s.id = 'lp-script'
    s.textContent = LANDING_SCRIPT
    document.body.appendChild(s)
    return () => {
      document.getElementById('lp-script')?.remove()
    }
  }, [pathname])
  return null
}
