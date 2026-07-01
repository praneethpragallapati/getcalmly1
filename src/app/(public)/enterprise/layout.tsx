import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enterprise & Workplace Mental Health',
  description:
    'Employee mental wellness for Indian teams — RCI-verified therapists, anonymized workforce insights and measurable outcomes. Bring getCalmly to your workplace.',
  alternates: { canonical: '/enterprise' },
  openGraph: {
    title: 'getCalmly for Enterprise — Workplace Mental Health',
    description:
      'RCI-verified therapists, anonymized workforce insights and measurable outcomes for your team.',
    url: '/enterprise',
    type: 'website',
  },
}

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return children
}
