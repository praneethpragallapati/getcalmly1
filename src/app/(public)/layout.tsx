import SiteShell from '@/components/site/SiteShell'
import ConsentBanner from '@/components/layout/ConsentBanner'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SiteShell>
      {children}
      <ConsentBanner />
    </SiteShell>
  )
}
