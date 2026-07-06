import type { Metadata } from 'next'
import { LANDING_MARKUP } from '@/components/site/landingMarkup'
import { FAQ_ITEMS } from '@/components/site/faqData'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

export const metadata: Metadata = {
  title: 'getCalmly — Online Therapy & Mental Health Care in India',
  description:
    'Book your first session for ₹999 with licensed therapists and psychiatrists. AI-powered insights, daily mood tracking and a supportive community, matched to the right expert for you.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI',
    description:
      'Book your first session for ₹999 with licensed therapists. AI-powered insights and a community that gets it.',
    url: '/',
    type: 'website',
  },
}

// FAQPage structured data — mirrors the visible FAQ accordion so answer
// engines (Google AI Overviews, ChatGPT, Perplexity) can surface the answers.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((it) => ({
    '@type': 'Question',
    name: it.q,
    acceptedAnswer: { '@type': 'Answer', text: it.a },
  })),
}

// WebSite entity + sitelinks search box for the brand SERP.
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'getCalmly',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: LANDING_MARKUP }} />
    </>
  )
}
