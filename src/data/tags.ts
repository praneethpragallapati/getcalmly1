// The single tag vocabulary shared by everything members read, watch and post:
// community posts (Real Talk feed), blog articles (Perspectives · Read) and
// Perspectives videos (Watch). One list means a tag means the same thing
// everywhere, and a tag page can pull all three content types together.
//
// Order is deliberate and is what every picker renders:
//   1. SERVICE tags — the care we actually sell, most-used first. These map to
//      the /services pages (therapy, couples, child, maternal, psychiatry,
//      addiction, assessments, specialised) and to what people search for most.
//   2. GENERAL tags — everything else people talk about, most-used first.
// Keep new tags in the right group and inserted at the position that matches how
// often they'll be used, so the picker always leads with the likeliest choice.

export type TagGroup = 'service' | 'general'
export type TagDef = { slug: string; label: string; group: TagGroup }

/** Service-aligned tags: what getCalmly treats. Descending by expected usage. */
const SERVICE_TAGS: TagDef[] = [
  { slug: 'anxiety', label: 'Anxiety', group: 'service' },
  { slug: 'depression', label: 'Depression', group: 'service' },
  { slug: 'stress', label: 'Stress', group: 'service' },
  { slug: 'therapy', label: 'Therapy', group: 'service' },
  { slug: 'relationships', label: 'Relationships', group: 'service' },
  { slug: 'work-stress', label: 'Work stress', group: 'service' },
  { slug: 'sleep', label: 'Sleep', group: 'service' },
  { slug: 'couples', label: 'Couples therapy', group: 'service' },
  { slug: 'burnout', label: 'Burnout', group: 'service' },
  { slug: 'trauma', label: 'Trauma', group: 'service' },
  { slug: 'cbt', label: 'CBT', group: 'service' },
  { slug: 'psychiatry', label: 'Psychiatry', group: 'service' },
  { slug: 'medication', label: 'Medication', group: 'service' },
  { slug: 'parenting', label: 'Parenting', group: 'service' },
  { slug: 'teens', label: 'Teens & adolescents', group: 'service' },
  { slug: 'child-therapy', label: 'Child therapy', group: 'service' },
  { slug: 'postpartum', label: 'Postpartum', group: 'service' },
  { slug: 'mothers-health', label: "Mothers' health", group: 'service' },
  { slug: 'ocd', label: 'OCD', group: 'service' },
  { slug: 'adhd', label: 'ADHD', group: 'service' },
  { slug: 'panic', label: 'Panic attacks', group: 'service' },
  { slug: 'grief', label: 'Grief', group: 'service' },
  { slug: 'anger', label: 'Anger', group: 'service' },
  { slug: 'addiction', label: 'Addiction', group: 'service' },
  { slug: 'eating-disorders', label: 'Eating disorders', group: 'service' },
  { slug: 'bipolar', label: 'Bipolar', group: 'service' },
  { slug: 'ptsd', label: 'PTSD', group: 'service' },
  { slug: 'assessments', label: 'Assessments', group: 'service' },
  { slug: 'specialised-care', label: 'Specialised care', group: 'service' },
]

/** Everything else members talk about. Descending by expected usage. */
const GENERAL_TAGS: TagDef[] = [
  { slug: 'self-care', label: 'Self-care', group: 'general' },
  { slug: 'self-awareness', label: 'Self-awareness', group: 'general' },
  { slug: 'overthinking', label: 'Overthinking', group: 'general' },
  { slug: 'mindfulness', label: 'Mindfulness', group: 'general' },
  { slug: 'loneliness', label: 'Loneliness', group: 'general' },
  { slug: 'confidence', label: 'Confidence', group: 'general' },
  { slug: 'boundaries', label: 'Boundaries', group: 'general' },
  { slug: 'family', label: 'Family', group: 'general' },
  { slug: 'motivation', label: 'Motivation', group: 'general' },
  { slug: 'stigma', label: 'Stigma', group: 'general' },
  { slug: 'first-therapy', label: 'Starting therapy', group: 'general' },
  { slug: 'healing', label: 'Healing', group: 'general' },
  { slug: 'wins', label: 'Small wins', group: 'general' },
  { slug: 'habits', label: 'Habits', group: 'general' },
  { slug: 'career', label: 'Career', group: 'general' },
  { slug: 'students', label: 'Student life', group: 'general' },
  { slug: 'men-mental-health', label: "Men's mental health", group: 'general' },
  { slug: 'women-mental-health', label: "Women's mental health", group: 'general' },
  { slug: 'social-anxiety', label: 'Social anxiety', group: 'general' },
  { slug: 'body-image', label: 'Body image', group: 'general' },
  { slug: 'breathwork', label: 'Breathwork', group: 'general' },
  { slug: 'journaling', label: 'Journaling', group: 'general' },
  { slug: 'gratitude', label: 'Gratitude', group: 'general' },
  { slug: 'friendship', label: 'Friendship', group: 'general' },
  { slug: 'loss', label: 'Loss', group: 'general' },
  { slug: 'caregiving', label: 'Caregiving', group: 'general' },
  { slug: 'finances', label: 'Money worries', group: 'general' },
  { slug: 'screen-time', label: 'Screen time', group: 'general' },
  { slug: 'exercise', label: 'Movement & exercise', group: 'general' },
  { slug: 'recovery', label: 'Recovery', group: 'general' },
  { slug: 'lgbtq', label: 'LGBTQ+', group: 'general' },
]

/** Every tag, service-first then general, each descending by expected usage. */
export const TAGS: TagDef[] = [...SERVICE_TAGS, ...GENERAL_TAGS]

export const TAG_SLUGS: string[] = TAGS.map((t) => t.slug)

const BY_SLUG = new Map(TAGS.map((t) => [t.slug, t]))

export const isKnownTag = (slug: string): boolean => BY_SLUG.has(slug)

/** Human label for a tag; falls back to a title-cased slug for legacy values. */
export function tagLabel(slug: string): string {
  const t = BY_SLUG.get(slug)
  if (t) return t.label
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Keep only known tags, de-duplicated, capped, and returned in canonical order
 * so two posts tagged the same way always list them the same way.
 */
export function normalizeTags(input: readonly string[], max = 4): string[] {
  const wanted = new Set(
    input.map((t) => t.trim().toLowerCase()).filter((t) => t && isKnownTag(t)),
  )
  return TAG_SLUGS.filter((s) => wanted.has(s)).slice(0, max)
}

export const MAX_TAGS = 4
