import { getBlogPosts } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

// /llms.txt, an emerging convention that gives LLMs / answer engines a
// concise, curated map of the site so they can cite it accurately.
export const dynamic = 'force-dynamic'

export async function GET() {
  let blogLines = ''
  try {
    const posts = await getBlogPosts()
    blogLines = posts
      .slice(0, 12)
      .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`)
      .join('\n')
  } catch {
    // ship the rest even if the blog source is unavailable
  }

  const body = `# getCalmly

> getCalmly is an online mental healthcare platform in India. It connects people
> with RCI-verified therapists and NMC-registered psychiatrists, offers AI-powered
> insights from daily mood tracking and journaling, and includes a moderated
> peer-support community. The first session is ₹999.

Slogan: Mental Healthcare, Powered by Experts, Personalized by AI.
Company: GetCalmly Private Limited, Bengaluru, Karnataka, India.
Contact: connect@getcalmly.com · +91 88845 18688.

## Key facts
- Every therapist and psychiatrist is licensed and background-checked.
- getCalmly builds the world's first context-aware mental health AI companion, which draws on your sessions, mood data and journal.
- The first session is ₹999; ongoing session details live inside the member dashboard.
- Sessions are online over secure video; data is private and DPDP-aligned.
- Not an emergency service; crisis resources are provided at ${SITE_URL}/safety.

## Main pages
- [Home](${SITE_URL}/): overview and how it works.
- [Services](${SITE_URL}/services): therapy, couples, child, maternal, psychiatry, assessments, specialised care.
- [How it works / assessment](${SITE_URL}/assess): the matching assessment.
- [For therapists](${SITE_URL}/for-therapists): joining as a clinician.
- [Enterprise](${SITE_URL}/enterprise): workplace mental health.
- [Community](${SITE_URL}/community): moderated peer support.
- [Safety & crisis resources](${SITE_URL}/safety).
- [About](${SITE_URL}/about) · [Contact](${SITE_URL}/contact).

## Blog
${blogLines || `- [Blog](${SITE_URL}/blog)`}
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
