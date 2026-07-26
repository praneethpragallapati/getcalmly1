import type { Metadata } from 'next'

// Default metadata for /services (the index). Individual /services/[slug]
// pages override this via their own generateMetadata().
export const metadata: Metadata = {
  title: 'Our Services, Therapy, Psychiatry & Specialised Care',
  description:
    'Explore getCalmly’s mental health services: individual and couples therapy, psychiatry, child and maternal care, assessments and specialised support, with RCI-verified experts.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'getCalmly Services, Therapy, Psychiatry & Specialised Care',
    description:
      'Individual & couples therapy, psychiatry, child, maternal, assessments and specialised care, with RCI-verified experts.',
    url: '/services',
    type: 'website',
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
