import type { Metadata } from 'next'
import { LANDING_MARKUP } from '@/components/site/landingMarkup'

export const metadata: Metadata = {
  title: 'getCalmly — Online Therapy & Mental Health Care in India',
  description:
    'Book a free first session with RCI-verified therapists and psychiatrists. AI-powered insights, daily mood tracking, and a supportive community. Start free — we match you with the right expert.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI',
    description:
      'Book a free first session with RCI-verified therapists. AI-powered insights and a community that gets it.',
    url: '/',
    type: 'website',
  },
}

export default function HomePage() {
  return <div dangerouslySetInnerHTML={{ __html: LANDING_MARKUP }} />
}
