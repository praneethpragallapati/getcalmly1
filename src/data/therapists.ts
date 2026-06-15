export type Therapist = {
  id: string
  name: string
  initials: string
  designation: string
  qualifications: string
  yearsExp: number
  languages: string[]
  specializations: string[]
  sessionFee: number
  rating: number
  reviews: number
  rciVerified: boolean
  accent: string
}

export const therapists: Therapist[] = [
  {
    id: 'priya-sharma',
    name: 'Dr. Priya Sharma',
    initials: 'PS',
    designation: 'Clinical Psychologist',
    qualifications: 'M.Phil Clinical Psychology (RCI)',
    yearsExp: 8,
    languages: ['Hindi', 'English'],
    specializations: ['Anxiety', 'Depression', 'Stress & Burnout'],
    sessionFee: 2000,
    rating: 4.9,
    reviews: 214,
    rciVerified: true,
    accent: '#C8553D',
  },
  {
    id: 'rahul-menon',
    name: 'Dr. Rahul Menon',
    initials: 'RM',
    designation: 'Counseling Psychologist',
    qualifications: 'M.Sc Counseling Psychology',
    yearsExp: 5,
    languages: ['Malayalam', 'English', 'Hindi'],
    specializations: ['Stress', 'Trauma & Grief', 'Relationships'],
    sessionFee: 1500,
    rating: 4.8,
    reviews: 156,
    rciVerified: true,
    accent: '#3D9E72',
  },
  {
    id: 'ananya-iyer',
    name: 'Dr. Ananya Iyer',
    initials: 'AI',
    designation: 'Psychiatrist',
    qualifications: 'MBBS, MD Psychiatry (NMC)',
    yearsExp: 12,
    languages: ['Tamil', 'English'],
    specializations: ['Mood Disorders', 'Medication Management', 'OCD'],
    sessionFee: 2500,
    rating: 4.9,
    reviews: 302,
    rciVerified: true,
    accent: '#C9973A',
  },
  {
    id: 'sneha-patil',
    name: 'Dr. Sneha Patil',
    initials: 'SP',
    designation: 'Child & Adolescent Psychologist',
    qualifications: 'M.Phil Clinical Psychology (RCI)',
    yearsExp: 7,
    languages: ['Marathi', 'Hindi', 'English'],
    specializations: ['Child Therapy', 'Exam Stress', 'ADHD'],
    sessionFee: 1800,
    rating: 4.8,
    reviews: 128,
    rciVerified: true,
    accent: '#2E3E50',
  },
  {
    id: 'vikram-reddy',
    name: 'Dr. Vikram Reddy',
    initials: 'VR',
    designation: 'Couples & Family Therapist',
    qualifications: 'M.Sc Family Therapy',
    yearsExp: 10,
    languages: ['Telugu', 'English', 'Hindi'],
    specializations: ['Couples Therapy', 'Conflict Resolution', 'Pre-marital'],
    sessionFee: 2200,
    rating: 4.7,
    reviews: 97,
    rciVerified: true,
    accent: '#3D9E72',
  },
]
