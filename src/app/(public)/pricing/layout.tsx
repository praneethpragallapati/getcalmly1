import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Online Therapy & Psychiatry Session Plans',
  description:
    'Transparent per-session pricing for online therapy and psychiatry in India. Your first session is free, with flexible packs and no forced subscription.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'getCalmly Pricing — Therapy & Psychiatry Plans',
    description:
      'Transparent per-session pricing. First session free, flexible packs, no forced subscription.',
    url: '/pricing',
    type: 'website',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
