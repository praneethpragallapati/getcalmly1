import { PrismaClient, type CommunityRole } from '@prisma/client'
import { blogSeed } from '../src/data/blogSeed'
import { communitySeed, ROLE_NAME_TO_ENUM } from '../src/data/communitySeed'

const prisma = new PrismaClient()

// Turn "2 hours ago" / "Yesterday" / "1 week ago" into a real timestamp so the
// relative-time display on the live site stays believable after seeding.
function dateFromDisplay(label: string): Date {
  const now = Date.now()
  const m = label.match(/(\d+)\s+(hour|day|week|minute)/i)
  if (label.toLowerCase() === 'yesterday') return new Date(now - 864e5)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = m[2].toLowerCase()
    const ms = unit === 'minute' ? 6e4 : unit === 'hour' ? 36e5 : unit === 'day' ? 864e5 : 6048e5
    return new Date(now - n * ms)
  }
  return new Date(now)
}

// "12 June 2026" -> Date
function dateFromBlog(label: string): Date {
  const d = new Date(label)
  return isNaN(d.getTime()) ? new Date() : d
}

async function main() {
  console.log('Seeding blog posts…')
  for (const p of blogSeed) {
    const publishedAt = dateFromBlog(p.date)
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        authorName: p.author,
        authorRole: p.role,
        tags: p.tags,
        readTime: p.readTime,
        publishedAt,
      },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        authorName: p.author,
        authorRole: p.role,
        tags: p.tags,
        readTime: p.readTime,
        published: true,
        publishedAt,
      },
    })
  }

  console.log('Seeding community discussions…')
  // Idempotent on (title) so re-running does not duplicate the sample set.
  for (const c of communitySeed) {
    const existing = await prisma.communityPost.findFirst({ where: { title: c.title } })
    const data = {
      title: c.title,
      body: c.body,
      authorName: c.author,
      authorRole: ROLE_NAME_TO_ENUM[c.role] as CommunityRole,
      tenure: c.tenure,
      tags: c.tags,
      upvotes: c.upvotes,
      createdAt: dateFromDisplay(c.date),
    }
    if (existing) {
      await prisma.communityPost.update({ where: { id: existing.id }, data })
    } else {
      await prisma.communityPost.create({ data })
    }
  }

  const blogCount = await prisma.blogPost.count()
  const postCount = await prisma.communityPost.count()
  console.log(`Done. ${blogCount} blog posts, ${postCount} community discussions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
