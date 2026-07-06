import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

export const viewport: Viewport = {
  themeColor: '#C8553D',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI',
    template: '%s | getCalmly',
  },
  description:
    'Book your first session for ₹999 with licensed therapists and psychiatrists in India. AI-powered insights, daily mood tracking and a supportive community.',
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
    title: 'getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI',
    description:
      'Book your first session for ₹999 with licensed therapists. AI-powered insights and a community that gets it.',
    url: SITE_URL,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'getCalmly — Mental Healthcare, Powered by Experts, Personalized by AI',
    description: 'Book your first session for ₹999 with licensed therapists in India.',
  },
  robots: { index: true, follow: true },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'getCalmly',
  legalName: 'GetCalmly Private Limited',
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
    streetAddress: '316, 11th A Cross, Classic Layout, Begur',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560068',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-88845-18688',
    email: 'connect@getcalmly.com',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi'],
  },
  sameAs: [
    'https://instagram.com/getcalmly',
    'https://linkedin.com/company/getcalmly',
    'https://x.com/getcalmly',
    'https://youtube.com/@getcalmly',
  ],
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
