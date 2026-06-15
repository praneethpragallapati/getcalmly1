'use client'

import { useEffect } from 'react'
import './landing.css'
import { LANDING_MARKUP } from './landingMarkup'
import { LANDING_SCRIPT } from './landingScript'

/**
 * GetCalmly landing page — faithful reproduction of the v2 brand mockup
 * (getcalmly-landing-v2.html). The exact markup is rendered as-is and the
 * original interactions (nav scroll state, reveal-on-scroll, dashboard tabs,
 * and the 12-question assessment modal) run via an injected script so the
 * design matches the mockup pixel-for-pixel.
 */
export default function LandingPage() {
  useEffect(() => {
    const existing = document.getElementById('lp-script')
    if (existing) existing.remove()
    const s = document.createElement('script')
    s.id = 'lp-script'
    s.textContent = LANDING_SCRIPT
    document.body.appendChild(s)
    return () => {
      document.getElementById('lp-script')?.remove()
    }
  }, [])

  return <div className="lp-page" dangerouslySetInnerHTML={{ __html: LANDING_MARKUP }} />
}
