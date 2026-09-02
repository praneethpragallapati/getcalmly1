import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply to Practice on getCalmly',
  description:
    'Join getCalmly as a clinician. For RCI-verified clinical psychologists and NMC-verified psychiatrists seeking flexible online caseloads and modern clinical tools.',
  alternates: { canonical: '/for-therapists/apply' },
  openGraph: {
    title: 'Apply to Practice on getCalmly',
    description:
      'For RCI-verified clinical psychologists and NMC-verified psychiatrists, flexible online caseloads, modern tools.',
    url: '/for-therapists/apply',
    type: 'website',
  },
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children
}
