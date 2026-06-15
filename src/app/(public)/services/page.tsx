import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services | GetCalmly',
  description:
    'Therapy, psychiatric care, psychological assessments and corporate wellness — delivered by RCI-licensed professionals across India.',
}

const sections = [
  {
    title: 'Comprehensive Psychological Assessments',
    groups: [
      {
        sub: 'Children',
        items: [
          'ADHD',
          'Emotional & Behavioural Difficulties',
          'Academic — Study & Career Maturity',
          'Personality & Emotional Functioning',
        ],
      },
      {
        sub: 'Clinical',
        items: [
          '5-Factor Personality Assessment',
          'Emotional Intelligence',
          'Anxiety, Depression & Stress',
          'Marriage / Couples Assessment',
          'Behavioural & Emotional Conflicts',
          'Procrastination',
          'Psychological Well-Being',
          'Personal Adjustment',
          'Defense Mechanism',
          'Occupational & Job Stress',
        ],
      },
    ],
  },
  {
    title: 'Individual Therapy for Adults',
    items: [
      'Anxiety & Overthinking',
      'Depression',
      'Stress & Burnout',
      'Trauma & Grief',
      'OCD',
      'Behavioural & Emotional Conflicts',
      'Procrastination',
      'Life Transitions & Adjustment',
      'Anger Management',
      'Sleep Issues',
    ],
  },
  {
    title: 'Psychological Support for Medical Conditions',
    items: ['Chronic Illness', 'Terminal Illness', 'Surgical Support', 'Geriatric Mental Health'],
  },
  {
    title: 'LGBTQIA+ & Gender Identity',
    items: ['Identity & Affirmative Support', 'Coming Out', 'Relationship & Family Concerns'],
  },
  {
    title: 'Pregnancy & Postpartum',
    items: ['Prenatal Support', 'Postpartum Care', 'Parenting Stress', 'Pre-adoption (PAPs) Counselling'],
  },
  {
    title: 'Work & Job Stress',
    items: ['Workplace Burnout', 'Performance Pressure', 'Interpersonal Conflict', 'Career Uncertainty'],
  },
  {
    title: 'Couple & Relationship Counselling',
    items: ['Relationship Concerns', 'Conflict & Communication', 'Separation / Divorce', 'Breakup Support', 'Pre-marital Counselling'],
  },
  {
    title: 'Child & Adolescent Therapy',
    items: ['Worry / Anxiety / Depression', 'Exam Stress', 'Major Life Events', 'Behavioural Difficulties'],
  },
  {
    title: 'Psychiatry',
    items: ['Diagnosis & Evaluation', 'Medication Management', 'Second Opinion', 'Follow-up Care'],
  },
  {
    title: 'Clinical Supervision for Mental Health Professionals',
    items: ['Individual Supervision', 'Group Supervision', 'Research Guidance & Supervision'],
  },
]

export default function ServicesPage() {
  return (
    <div className="bg-[#FFF8F5]">
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-4xl md:text-6xl font-black text-[#1C2B3A] mb-4"
          >
            Our Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whatever you’re going through, there’s a qualified professional here for you —
            in your language, within your budget.
          </p>
          <Link
            href="/assess"
            className="inline-block mt-8 bg-[#C8553D] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#A8432D] transition shadow-lg"
          >
            Find My Match →
          </Link>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[#C8553D] mb-4">{s.title}</h2>
              {s.groups ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {s.groups.map((g) => (
                    <div key={g.sub}>
                      <p className="font-semibold text-gray-800 mb-2">{g.sub}</p>
                      <ul className="space-y-1">
                        {g.items.map((it) => (
                          <li key={it} className="text-gray-600 text-sm flex gap-2">
                            <span className="text-[#3D9E72]">•</span> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                  {s.items!.map((it) => (
                    <li key={it} className="text-gray-600 text-sm flex gap-2">
                      <span className="text-[#3D9E72]">•</span> {it}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
