import type { MetadataRoute } from 'next'
import { siteUrl } from '@/config/site'

const SITE_URL = siteUrl

// Private surfaces that should never be crawled by anyone.
const DISALLOW = ['/api/', '/dashboard/', '/admin/', '/assess/results']

// Answer/generative engines we explicitly welcome so getCalmly can be cited
// in AI Overviews, ChatGPT, Perplexity, etc. Same allow/disallow as everyone;
// listing them removes ambiguity (some default to not crawling unless named).
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
