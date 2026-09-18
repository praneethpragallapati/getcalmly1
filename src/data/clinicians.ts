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
  accent: string
  /** Warm, informal introduction shown at the top of the profile. */
  intro: string
  /** "Meet Dr X" longer bio paragraphs. */
  bio?: string[]
  education?: string[]
  experience?: string[]
  testimonials?: Testimonial[]
  featured?: boolean
}

// Only real, verified clinicians live here. No placeholder or generated entries.
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
    'Co-founder and Clinical Lead at getCalmly',
  ],
  // Real client reviews, shared with consent. All five stars.
  testimonials: [
    { author: 'Deepa Singh', role: 'Businesswoman, Gurgaon', rating: 5, text: 'One month with Ms. Riya and I can honestly say she has helped me more than years with my previous therapist. She truly listens and understands.' },
    { author: 'Sabina', role: 'Parent, Delhi', rating: 5, text: 'My son had severe exam anxiety. The therapist was incredibly patient, understanding, and effective. He now takes exams without any stress.' },
    { author: 'Ganesh', role: 'Hotel Manager, Pune', rating: 5, text: 'After losing my job, I was in a dark place. The therapy sessions helped me not just cope, but come back stronger. Found a better job within months.' },
    { author: 'Rohan Dev', role: 'Product Manager, Bangalore', rating: 5, text: 'Words and Smiles truly lives up to their name. They helped me recover from severe stress during COVID. I feel like a different person now.' },
  ],
  featured: true,
}

export const clinicians: Clinician[] = [riya]

export function getClinician(slug: string): Clinician | undefined {
  return clinicians.find((c) => c.slug === slug)
}
