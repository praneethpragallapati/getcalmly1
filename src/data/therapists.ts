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
  nmcVerified?: boolean
  accent: string
  tags: string[]
  availableNext: string
  gender: 'female' | 'male'
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
    sessionFee: 999,
    rating: 4.9,
    reviews: 214,
    rciVerified: true,
    accent: '#C8553D',
    availableNext: 'Thu',
    gender: 'female',
    tags: ['anxiety', 'depression', 'burnout', 'sleep', 'low-mood', 'work-stress', 'cbt', 'adults', 'self-esteem'],
  },
  {
    id: 'rahul-menon',
    name: 'Dr. Rahul Menon',
    initials: 'RM',
    designation: 'Counseling Psychologist',
    qualifications: 'M.Sc Counseling Psychology (RCI)',
    yearsExp: 5,
    languages: ['Malayalam', 'English', 'Hindi'],
    specializations: ['Trauma', 'Grief & Loss', 'Relationships'],
    sessionFee: 999,
    rating: 4.8,
    reviews: 156,
    rciVerified: true,
    accent: '#3D9E72',
    availableNext: 'Fri',
    gender: 'male',
    tags: ['trauma', 'grief', 'loss', 'relationships', 'breakup', 'loneliness', 'adults', 'mindfulness'],
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
    sessionFee: 999,
    rating: 4.8,
    reviews: 128,
    rciVerified: true,
    accent: '#2E3E50',
    availableNext: 'Sat',
    gender: 'female',
    tags: ['child', 'adolescent', 'exam-stress', 'adhd', 'school', 'academic', 'behaviour', 'parenting'],
  },
  {
    id: 'vikram-reddy',
    name: 'Dr. Vikram Reddy',
    initials: 'VR',
    designation: 'Couples & Family Therapist',
    qualifications: 'M.Sc Family Therapy (RCI)',
    yearsExp: 10,
    languages: ['Telugu', 'English', 'Hindi'],
    specializations: ['Couples Therapy', 'Conflict Resolution', 'Pre-marital'],
    sessionFee: 999,
    rating: 4.7,
    reviews: 97,
    rciVerified: true,
    accent: '#3D9E72',
    availableNext: 'Thu',
    gender: 'male',
    tags: ['couples', 'relationships', 'conflict', 'pre-marital', 'family', 'communication', 'trust', 'separation'],
  },
  {
    id: 'meera-krishnan',
    name: 'Dr. Meera Krishnan',
    initials: 'MK',
    designation: 'Clinical Psychologist',
    qualifications: 'M.Phil Clinical Psychology (RCI)',
    yearsExp: 9,
    languages: ['Tamil', 'English', 'Hindi'],
    specializations: ['Anxiety Disorders', 'Social Anxiety', 'Self-esteem'],
    sessionFee: 999,
    rating: 4.8,
    reviews: 183,
    rciVerified: true,
    accent: '#6D5BD0',
    availableNext: 'Mon',
    gender: 'female',
    tags: ['anxiety', 'social-anxiety', 'self-esteem', 'panic', 'phobia', 'confidence', 'adults', 'cbt'],
  },
  {
    id: 'arjun-nair',
    name: 'Dr. Arjun Nair',
    initials: 'AN',
    designation: 'Counseling Psychologist',
    qualifications: 'M.Sc Psychology (RCI)',
    yearsExp: 6,
    languages: ['Malayalam', 'English'],
    specializations: ['Work Stress', 'Life Transitions', 'Mindfulness'],
    sessionFee: 999,
    rating: 4.7,
    reviews: 112,
    rciVerified: true,
    accent: '#C8553D',
    availableNext: 'Tue',
    gender: 'male',
    tags: ['work-stress', 'burnout', 'career', 'life-transitions', 'mindfulness', 'adults', 'anger'],
  },
]
