import type { Metadata } from 'next'
import { getPerspectivesPublic } from '@/lib/perspectives'
import { PerspectivesView } from '@/components/media/PerspectivesView'

export const metadata: Metadata = {
  title: 'Perspectives',
  description: 'Short talks from founders, clinicians and members on the things that move mental health forward.',
  alternates: { canonical: '/perspectives' },
}

export const dynamic = 'force-dynamic'

export default async function PublicPerspectivesPage() {
  const sections = await getPerspectivesPublic()
  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px' }}>
      <PerspectivesView sections={sections} onDark={false} />
    </main>
  )
}
