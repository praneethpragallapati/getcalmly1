import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply to Practice on getCalmly',
  description:
    'Join getCalmly as a clinician. For RCI-registered clinical psychologists and counsellors seeking flexible online caseloads and modern clinical tools.',
  alternates: { canonical: '/for-therapists/apply' },
  openGraph: {
    title: 'Apply to Practice on getCalmly',
    description:
      'For RCI-registered psychologists and counsellors, flexible online caseloads, modern tools.',
    url: '/for-therapists/apply',
    type: 'website',
  },
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children
}
