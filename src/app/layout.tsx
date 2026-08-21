import type { Metadata, Viewport } from 'next'
import './globals.css'
import {
  siteUrl as SITE_URL,
  legalName,
  address,
  streetAddress,
  supportPhoneTel,
  contactEmail,
  socialLinks,
} from '@/config/site'

export const viewport: Viewport = {
  themeColor: '#C8553D',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
    template: '%s | getCalmly',
  },
  description:
    'Book your first session for ₹799 with licensed therapists and psychiatrists in India. AI-powered insights, daily mood tracking and a supportive community.',
  applicationName: 'getCalmly',
  keywords: [
    'online therapy India',
    'mental health',
    'licensed therapist',
    'psychiatrist online',
    'counselling',
    'anxiety',
    'depression',
    'affordable therapy',
  ],
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/feed.xml' },
  },
  openGraph: {
    type: 'website',
    siteName: 'getCalmly',
    title: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
    description:
      'Book your first session for ₹799 with licensed therapists. AI-powered insights and a community that gets it.',
    url: SITE_URL,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
    description: 'Book your first session for ₹799 with licensed therapists in India.',
  },
  robots: { index: true, follow: true },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'getCalmly',
  legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  image: `${SITE_URL}/opengraph-image`,
  description:
    'Mental healthcare platform connecting people in India with RCI-verified therapists and psychiatrists, powered by AI insights.',
  slogan: 'Mental Healthcare, Powered by Experts, Personalized by AI',
  medicalSpecialty: ['Psychiatric', 'PsychologicalTreatment'],
  areaServed: { '@type': 'Country', name: 'India' },
  address: {
    '@type': 'PostalAddress',
    streetAddress,
    addressLocality: address.locality,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressCountry: address.countryCode,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    // schema.org wants the dialable form, not the prettified one.
    telephone: supportPhoneTel.replace(/^tel:/, ''),
    email: contactEmail,
    contactType: 'customer support',
    areaServed: address.countryCode,
    availableLanguage: ['en', 'hi'],
  },
  sameAs: socialLinks.map((s) => s.url),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  )
}
