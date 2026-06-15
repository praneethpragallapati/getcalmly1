import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CrisisBanner from '@/components/layout/CrisisBanner'
import ConsentBanner from '@/components/layout/ConsentBanner'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CrisisBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <ConsentBanner />
    </>
  )
}
