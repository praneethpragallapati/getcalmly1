import '@/components/site/landing.css'
import SiteHeader from '@/components/site/SiteHeader'
import LandingRuntime from '@/components/site/LandingRuntime'

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
