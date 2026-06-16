import './landing.css'
import '@/components/assessment/assess.css'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import LandingRuntime from './LandingRuntime'

/**
 * Site chrome shared by the landing page and every marketing/public page:
 * the .lp-page styling scope, the fixed brand header, footer, and runtime.
 * `padded` adds top spacing for inner pages whose first section isn't the
 * full-bleed hero (the home hero already clears the fixed nav itself).
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-page">
      <SiteHeader />
      {/* paddingTop clears the fixed nav; the home hero bg blends into it. */}
      <main style={{ paddingTop: 68 }}>{children}</main>
      <SiteFooter />
      <LandingRuntime />
    </div>
  )
}
