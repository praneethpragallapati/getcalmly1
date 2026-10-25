import type { Metadata } from 'next'
import { getPricingConfig } from '@/lib/pricingConfig'
import { inr } from '@/data/pricing'

// /pricing is the live pricing page — linked from the primary nav and the
// footer. It was carrying a stale "legacy route" title and, worse, robots
// noindex/nofollow, so the highest commercial-intent page on the site was
// telling search engines to skip it.
export async function generateMetadata(): Promise<Metadata> {
  const first = inr((await getPricingConfig()).firstSession.therapy)
  return {
    title: 'Therapy & Psychiatry Pricing in India',
    description:
      `Transparent pricing for online therapy and psychiatry in India. Your first session is a flat ${first}, session packs bring the per-session price down, and you only pay for the sessions you use.`,
    alternates: { canonical: '/pricing' },
    openGraph: {
      title: 'Therapy & Psychiatry Pricing in India | getCalmly',
      description:
        `First session ${first}. Session packs lower your per-session price, and unused sessions are refunded — no fine print.`,
      url: '/pricing',
    },
  }
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
