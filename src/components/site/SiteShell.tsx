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
      {/* No-JS fallback: reveal-on-scroll defaults to opacity:0 and is unhidden
          by JS. Without JS (or before it runs / for crawlers), show everything. */}
      <noscript>
        <style>{`.lp-page .reveal,.lp-page .reveal-l,.lp-page .reveal-r,.lp-page .stagger>*{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <SiteHeader />
      {/* paddingTop clears the fixed nav; the home hero bg blends into it. */}
      <main style={{ paddingTop: 84 }}>{children}</main>
      <SiteFooter />
      <LandingRuntime />
    </div>
  )
}
