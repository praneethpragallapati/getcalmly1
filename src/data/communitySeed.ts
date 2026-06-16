// Single source of truth for community discussions. Used by:
//   • prisma/seed.ts          — to populate the database
//   • src/lib/community.ts    — as a fallback when the DB is unreachable

export type CommunityRoleName =
  | 'Paid Member'
  | 'Member'
  | 'Therapist'
  | 'Psychiatrist'
  | 'Admin'

export type CommunitySeed = {
  title: string
  body: string
  author: string
  role: CommunityRoleName
  tenure: string | null
  date: string // human display, e.g. "2 hours ago"
  tags: string[]
  upvotes: number
  comments: number
}

// Maps the display role name to the Prisma CommunityRole enum value.
export const ROLE_NAME_TO_ENUM: Record<CommunityRoleName, string> = {
  'Paid Member': 'PAID_MEMBER',
  Member: 'MEMBER',
  Therapist: 'THERAPIST',
  Psychiatrist: 'PSYCHIATRIST',
  Admin: 'ADMIN',
}

export const ENUM_TO_ROLE_NAME: Record<string, CommunityRoleName> = {
  PAID_MEMBER: 'Paid Member',
  MEMBER: 'Member',
  THERAPIST: 'Therapist',
  PSYCHIATRIST: 'Psychiatrist',
  ADMIN: 'Admin',
}

export const communitySeed: CommunitySeed[] = [
  {
    title: 'I keep catastrophising at night — anyone else find a way through it?',
    body: "Every night around 10pm my brain just switches into worst-case-scenario mode. I've tried journaling but my thoughts just spiral more when I write them down. Has anyone found something that actually helps break the loop?",
    author: 'Priya M.',
    role: 'Paid Member',
    tenure: '8 months',
    date: '2 hours ago',
    tags: ['anxiety', 'sleep', 'cbt'],
    upvotes: 47,
    comments: 18,
  },
  {
    title: 'Nobody told me postpartum could feel like this — sharing my story',
    body: "Six weeks after my daughter was born I couldn't get out of bed some mornings. Not because I was tired — I was, but this was different. I felt completely empty. I want to share what helped me in case anyone else is going through this silently.",
    author: 'Dr. Shruti A.',
    role: 'Therapist',
    tenure: null,
    date: 'Yesterday',
    tags: ['postpartum', 'mothers-health', 'depression'],
    upvotes: 134,
    comments: 42,
  },
  {
    title: 'My husband finally agreed to therapy after 3 years of me asking',
    body: "I don't know what finally clicked for him. Maybe it was the panic attack at work. I'm posting this because if you're a partner of someone who refuses to go — keep showing up with patience, not pressure. It took 3 years but we're here.",
    author: 'Kavitha R.',
    role: 'Member',
    tenure: null,
    date: '3 days ago',
    tags: ['relationships', 'men-mental-health', 'stigma'],
    upvotes: 89,
    comments: 31,
  },
  {
    title: "CBT homework actually changed my thought patterns — here's what I did",
    body: "I was skeptical when my therapist gave me a thought record form. It felt like homework from school. But three weeks in, I genuinely started catching the cognitive distortions in real time. Happy to share the template if it helps.",
    author: 'Arjun K.',
    role: 'Paid Member',
    tenure: '14 months',
    date: '4 days ago',
    tags: ['cbt', 'anxiety', 'self-awareness'],
    upvotes: 212,
    comments: 67,
  },
  {
    title: "Grief two years on — it doesn't get smaller, you get bigger",
    body: "Someone shared this quote with me and I've been thinking about it ever since. Two years after losing my father I'm not 'over it' and I don't think I ever will be. But I've built more space around the grief. Wanted to share this for anyone in the early days.",
    author: 'Farah Z.',
    role: 'Member',
    tenure: null,
    date: '1 week ago',
    tags: ['grief', 'loss', 'self-awareness'],
    upvotes: 178,
    comments: 53,
  },
  {
    title: "Resources for OCD that aren't just 'think positive'",
    body: "Most of what you find online for OCD is surface-level advice. As someone with OCD and a background in psychology, I want to share what ERP (Exposure and Response Prevention) actually involves and why it's different from generic anxiety advice.",
    author: 'Dr. Ramesh P.',
    role: 'Psychiatrist',
    tenure: null,
    date: '1 week ago',
    tags: ['ocd', 'anxiety', 'cbt'],
    upvotes: 156,
    comments: 39,
  },
  {
    title: "Working from home burnout is real and I don't think I recognised it for months",
    body: "I thought I was just tired. Turns out three months of no commute, no boundaries between work and home, and 14-hour days had completely depleted me. This post is about what I noticed and what's actually helping.",
    author: 'Nikhil S.',
    role: 'Paid Member',
    tenure: '5 months',
    date: '2 weeks ago',
    tags: ['work-stress', 'burnout', 'self-care'],
    upvotes: 94,
    comments: 28,
  },
]
