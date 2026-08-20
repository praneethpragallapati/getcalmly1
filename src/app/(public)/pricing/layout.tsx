import type { Metadata } from 'next'

// /pricing is the live pricing page — linked from the primary nav and the
// footer. It was carrying a stale "legacy route" title and, worse, robots
// noindex/nofollow, so the highest commercial-intent page on the site was
// telling search engines to skip it.
export const metadata: Metadata = {
  title: 'Therapy & Psychiatry Pricing in India',
  description:
    'Transparent pricing for online therapy and psychiatry in India. Your first session is a flat ₹799, session packs bring the per-session price down, and you only pay for the sessions you use.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Therapy & Psychiatry Pricing in India | getCalmly',
    description:
      'First session ₹799. Session packs lower your per-session price, and unused sessions are refunded — no fine print.',
    url: '/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
