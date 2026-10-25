import type { Metadata } from 'next'
import { LANDING_MARKUP } from '@/components/site/landingMarkup'
import { hiddenSlugs } from '@/lib/publicClinicians'
import { getPricingConfig } from '@/lib/pricingConfig'
import { inr } from '@/data/pricing'

// Refreshed every minute, so a clinician an admin hides from direct booking
// drops off the homepage quickly. A pricing save refreshes it at once.
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

// The therapy first-session price, as set in admin pricing.
async function firstSessionPrice(): Promise<string> {
  return inr((await getPricingConfig()).firstSession.therapy)
}

export async function generateMetadata(): Promise<Metadata> {
  const first = await firstSessionPrice()
  return {
    title: 'getCalmly, Online Therapy & Mental Health Care in India',
    description:
      `Book your first session for ${first} with RCI & NMC licensed therapists and psychiatrists. AI-powered insights, daily mood tracking and a supportive community, matched to the right expert for you.`,
    alternates: { canonical: '/' },
    openGraph: {
      title: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
      description:
        `Book your first session for ${first} with RCI licensed therapists. AI-powered insights and a community that gets it.`,
      url: '/',
      type: 'website',
    },
  }
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
  const [slugs, first] = await Promise.all([hiddenSlugs(), firstSessionPrice()])
  const markup = withoutHidden(LANDING_MARKUP, slugs).replace('{{FIRST_SESSION}}', first)
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
