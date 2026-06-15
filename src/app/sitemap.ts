import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/services', '/blog', '/community', '/about', '/for-therapists', '/contact', '/safety', '/assess']
  const now = new Date()
  return routes.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: now,
    changeFrequency: r === '' || r === '/blog' ? 'weekly' : 'monthly',
    priority: r === '' ? 1 : 0.7,
  }))
}
