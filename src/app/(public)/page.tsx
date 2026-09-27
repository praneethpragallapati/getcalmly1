import type { Metadata } from 'next'
import { LANDING_MARKUP } from '@/components/site/landingMarkup'
import { hiddenSlugs } from '@/lib/publicClinicians'

// Refreshed every minute, so a clinician an admin hides from direct booking
// drops off the homepage quickly.
export const revalidate = 60

/** The landing markup without the cards of clinicians hidden from booking. */
function withoutHidden(markup: string, slugs: string[]): string {
  let out = markup
  for (const slug of slugs) {
    out = out.replace(new RegExp(`\\s*<a class="clin-card" href="/clinicians/${slug}">[\\s\\S]*?</a>`), '')
  }
  // No cards left: drop the whole "Our clinicians" section rather than show it empty.
  if (slugs.length && !out.includes('class="clin-card"')) {
    out = out.replace(/<!-- ── OUR CLINICIANS ── -->[\s\S]*?<\/section>/, '')
  }
  return out
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

export const metadata: Metadata = {
  title: 'getCalmly, Online Therapy & Mental Health Care in India',
  description:
    'Book your first session for ₹799 with RCI & NMC licensed therapists and psychiatrists. AI-powered insights, daily mood tracking and a supportive community, matched to the right expert for you.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
    description:
      'Book your first session for ₹799 with RCI licensed therapists. AI-powered insights and a community that gets it.',
    url: '/',
    type: 'website',
  },
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

export default async function HomePage() {
  const markup = withoutHidden(LANDING_MARKUP, await hiddenSlugs())
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  )
}
