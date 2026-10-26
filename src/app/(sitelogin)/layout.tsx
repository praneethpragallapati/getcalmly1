import type { Metadata } from 'next'
import '@/components/site/landing.css'
import './shell.css'
import SiteHeader from '@/components/site/SiteHeader'
import LandingRuntime from '@/components/site/LandingRuntime'

// Sign-in pages stay out of search results (login was showing up in Google
// with the home page's description).
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: true },
}

// Login (and other full-screen entry pages placed here) get the normal site
// top bar, like every other public page, instead of the split auth chrome.
export default function SiteLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-page">
      <SiteHeader />
      {children}
      <LandingRuntime />
    </div>
  )
}
