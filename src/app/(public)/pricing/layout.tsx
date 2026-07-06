import type { Metadata } from 'next'

// Session details live inside the member dashboard; this legacy route is
// kept only so existing internal links don't 404, and is hidden from search.
export const metadata: Metadata = {
  title: 'Sessions',
  robots: { index: false, follow: false },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
