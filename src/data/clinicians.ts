import { therapists } from '@/data/therapists'

export type Testimonial = { author: string; role: string; rating: number; text: string }

export type Clinician = {
  slug: string
  name: string
  title: string
  type: 'Psychologist' | 'Psychiatrist'
  photo?: string
  initials: string
  credential: string
  yearsExp: number
  languages: string[]
  specializations: string[]
  tags: string[]
  rating: number
  reviews: number
  accent: string
  /** Warm, informal introduction shown at the top of the profile. */
  intro: string
  /** "Meet Dr X" longer bio paragraphs. */
  bio?: string[]
  education?: string[]
  experience?: string[]
  /** Sample client feedback — placeholder copy, swap for real reviews. */
  testimonials?: Testimonial[]
  featured?: boolean
}

// Flagship profile — full details provided by the team.
const riya: Clinician = {
  slug: 'riya-lokesh',
  name: 'Dr. Riya Lokesh',
  title: 'Chief Clinical Psychologist · Co-founder',
  type: 'Psychologist',
  photo: '/team/riya.jpg',
  initials: 'RL',
  credential: 'RCI-registered Clinical Psychologist · CRR No. A55153',
  yearsExp: 10,
  languages: ['English', 'Hindi'],
  specializations: ['Individual Therapy', 'Couples', 'Children & Teens', 'Depression', 'Anxiety', 'Sleep'],
  tags: ['anxiety', 'depression', 'relationships', 'couples', 'child', 'adolescent', 'sleep', 'life-transitions', 'self-esteem'],
  rating: 4.9,
  reviews: 320,
  accent: '#C8553D',
  intro:
    "Taking the first step can be the hardest part, and you've already done that. Dr. Riya Lokesh is a PhD Clinical Psychologist with over 10 years of experience helping people through anxiety, relationships, life transitions and emotional challenges. She offers a warm, thoughtful space where you can feel heard, understood and supported, one conversation at a time.",
  bio: [
    'Dr. Riya Lokesh is a PhD Clinical Psychologist and RCI-registered Clinical Psychologist (CRR No. A55153) with over a decade of experience helping children, adolescents, adults, couples and older adults navigate life’s challenges. Alongside seeing clients, she is the head of clinical quality at getCalmly. She shapes therapist standards, clinical protocols and the care every member receives.',
    'Her experience spans hospitals, rehabilitation centres, academia and private practice. She believes therapy should feel like a safe conversation, grounded in evidence, honesty and compassion.',
  ],
  education: [
    'PhD, Clinical Psychology – SGT University',
    'MPhil, Clinical Psychology – SRM Institute of Science and Technology (Gold Medalist)',
    'MA & BA, Psychology – Banaras Hindu University',
    'RCI Registered Clinical Psychologist – CRR No. A55153',
  ],
  experience: [
    'Clinical assessment and therapy across hospitals',
    'Addiction and rehabilitation settings',
    'Former Assistant Professor and published researcher',
    'Founder of Words and Smiles',
    'Co-founder and Clinical Lead at getCalmly.',
  ],
  testimonials: [
    { author: 'Ananya R.', role: 'In therapy for 8 months', rating: 5, text: 'Dr. Riya has a way of making you feel completely at ease. I came in barely able to explain what was wrong, and over a few months she helped me understand patterns I had carried for years. I finally feel like myself again — lighter, clearer, and far kinder to myself.' },
    { author: 'Karan & Meera', role: 'Couples therapy', rating: 5, text: 'We were on the edge of giving up on each other. Riya never took sides — she helped us actually hear what the other person was saying for the first time in years. The tools she gave us are things we still use every single week.' },
    { author: 'Sofia D.', role: 'Anxiety & sleep', rating: 5, text: 'Warm, sharp and genuinely present. She remembers the small things, and it makes every session feel like it is building on the last rather than starting over.' },
    { author: 'Rhea M.', role: "Parent of a 14-year-old", rating: 5, text: 'My daughter refused therapy for months. After one session with Dr. Riya she came home and said, "I actually want to go back." That says everything.' },
    { author: 'Vikram S.', role: 'Life transitions', rating: 4, text: 'Practical without ever feeling clinical. She helped me through a hard career change with a calm that was honestly contagious.' },
  ],
  featured: true,
}

// The rest of the directory, adapted from the existing clinician roster.
const adapted: Clinician[] = therapists.map((t) => {
  const type: Clinician['type'] = /psychiatr/i.test(t.designation) ? 'Psychiatrist' : 'Psychologist'
  return {
    slug: t.id,
    name: t.name,
    title: t.designation,
    type,
    initials: t.initials,
    credential: t.nmcVerified ? 'NMC-registered Psychiatrist' : 'RCI-registered Clinical Psychologist',
    yearsExp: t.yearsExp,
    languages: t.languages,
    specializations: t.specializations,
    tags: t.tags,
    rating: t.rating,
    reviews: t.reviews,
    accent: t.accent,
    intro: `${t.name} is a ${t.designation.toLowerCase()} with ${t.yearsExp} years of experience, working with ${t.specializations.slice(0, 3).join(', ').toLowerCase()}. They offer a warm, judgment-free space where you can feel heard and supported, at a pace that works for you.`,
  }
})

export const clinicians: Clinician[] = [riya, ...adapted]

export function getClinician(slug: string): Clinician | undefined {
  return clinicians.find((c) => c.slug === slug)
}
