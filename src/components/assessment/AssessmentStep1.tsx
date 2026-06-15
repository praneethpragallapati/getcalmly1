'use client'

import { useRouter } from 'next/navigation'

const options = [
  {
    key: 'therapy',
    icon: '🧠',
    title: 'Therapy',
    desc: 'Talk therapy with a licensed psychologist or counsellor',
  },
  {
    key: 'medication',
    icon: '💊',
    title: 'Medication',
    desc: 'Psychiatric evaluation and medication management',
  },
  {
    key: 'both',
    icon: '🔄',
    title: 'Both',
    desc: 'Combined therapy and psychiatric support',
  },
  {
    key: 'not-sure',
    icon: '🤔',
    title: 'Not Sure',
    desc: 'Let us guide you to the right kind of help',
  },
]

export default function AssessmentStep1() {
  const router = useRouter()

  const select = (key: string) => {
    sessionStorage.setItem('assess_support', key)
    router.push('/assess/step2')
  }

  return (
    <section className="min-h-[80vh] bg-[#FFF8F5] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#C8553D]">
            <span>Step 1 of 3</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-[#C8553D] rounded-full transition-all" />
          </div>
        </div>

        <h1
          style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
          className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-3"
        >
          What kind of support are you looking for?
        </h1>
        <p className="text-gray-600 mb-10">
          This helps us connect you with the right professional. There are no wrong answers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => select(o.key)}
              className="text-left bg-white border-2 border-transparent hover:border-[#C8553D] rounded-2xl p-6 shadow-sm hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-3">{o.icon}</div>
              <h3 className="text-xl font-bold text-[#1C2B3A] mb-1 group-hover:text-[#C8553D]">
                {o.title}
              </h3>
              <p className="text-sm text-gray-500">{o.desc}</p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Your responses are confidential and protected under the DPDP Act 2023.
        </p>
      </div>
    </section>
  )
}
