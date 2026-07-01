import type { MetadataRoute } from 'next'
import { getBlogSitemap } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

// Static, publicly-indexable routes. Keep in sync with app/(public).
const STATIC_ROUTES = [
  '',
  '/services',
  '/features',
  '/pricing',
  '/blog',
  '/community',
  '/about',
  '/for-therapists',
  '/enterprise',
  '/contact',
  '/safety',
  '/assess',
  '/terms',
  '/privacy',
]

// Service detail pages are a fixed set (see services/[slug]/page.tsx).
const SERVICE_SLUGS = [
  'therapy',
  'couples',
  'child',
  'maternal',
  'psychiatry',
  'assessments',
  'specialised',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: now,
    changeFrequency: r === '' || r === '/blog' || r === '/community' ? 'weekly' : 'monthly',
    priority: r === '' ? 1 : 0.7,
  }))

  const serviceEntries: MetadataRoute.Sitemap = SERVICE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Dynamic blog posts — the site's primary organic-search surface.
  // Uses each post's real last-modified date for accurate freshness signals.
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await getBlogSitemap()
    blogEntries = posts.map(({ slug, lastModified }) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch {
    // If the data source is unavailable at build time, ship the rest of the sitemap.
  }

  return [...staticEntries, ...serviceEntries, ...blogEntries]
}
