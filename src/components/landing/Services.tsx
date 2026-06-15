'use client'
import { useState } from 'react'
import Link from 'next/link'

const services = [
  {
    icon: '🧠',
    title: 'Individual Therapy',
    desc: 'One-on-one sessions with licensed psychologists',
    subs: ['Anxiety & Overthinking', 'Depression', 'Stress & Burnout', 'Trauma & Grief', 'OCD', 'LGBTQIA+ Support', 'Sleep Issues', 'Anger Management'],
  },
  {
    icon: '👧',
    title: 'Child & Adolescent',
    desc: 'Specialized support for young minds',
    subs: ['Exam Stress', 'Anxiety & Depression', 'Major Life Events', 'ADHD Assessment'],
  },
  {
    icon: '💑',
    title: 'Couple & Relationship',
    desc: 'Strengthen bonds and resolve conflicts',
    subs: ['Relationship Concerns', 'Conflict & Communication', 'Pre-marital Counseling', 'Separation Support'],
  },
  {
    icon: '📊',
    title: 'Psychological Assessments',
    desc: 'Comprehensive evaluations and reports',
    subs: ['Personality Assessment', 'ADHD Evaluation', 'Emotional Intelligence', 'Anxiety & Depression Screening'],
  },
  {
    icon: '💊',
    title: 'Psychiatry',
    desc: 'Medication management by qualified psychiatrists',
    subs: ['Medication Management', 'Diagnosis & Evaluation', 'Second Opinion'],
  },
  {
    icon: '🏢',
    title: 'Corporate EAP',
    desc: 'Employee mental wellness programs',
    subs: ['Employee Wellness', 'Burnout Prevention', 'HR Analytics Dashboard'],
  },
]

export default function Services() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section className="py-20 bg-[#FFF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-4"
            style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
          >
            Our Services
          </h2>
          <p className="text-gray-600">Comprehensive mental health care tailored for every need</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 cursor-pointer border-2 border-transparent hover:border-[#C8553D] transition shadow-sm hover:shadow-md"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="text-3xl mb-3">{svc.icon}</div>
              <h3 className="text-xl font-bold text-[#1C2B3A] mb-1">{svc.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{svc.desc}</p>
              {expanded === i && (
                <ul className="mt-3 space-y-1">
                  {svc.subs.map((sub, j) => (
                    <li key={j} className="text-sm text-[#C8553D] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#3D9E72] rounded-full flex-shrink-0"></span>
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
              <button className="mt-3 text-xs text-[#C8553D] font-medium">
                {expanded === i ? '▲ Less' : '▼ View areas'}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/services" className="text-[#C8553D] font-semibold hover:underline">
            View All Services →
          </Link>
        </div>
      </div>
    </section>
  )
}
