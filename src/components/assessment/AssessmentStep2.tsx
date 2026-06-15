'use client'

import { useRouter } from 'next/navigation'

const options = [
  {
    key: 'adult',
    icon: '👤',
    title: 'Myself',
    desc: 'Adult (18+) seeking support',
  },
  {
    key: 'child',
    icon: '🧒',
    title: 'My Child or Adolescent',
    desc: 'Someone under 18 years',
  },
  {
    key: 'couple',
    icon: '💑',
    title: 'My Partner and I',
    desc: 'Couples or relationship therapy',
  },
]

export default function AssessmentStep2() {
  const router = useRouter()

  const select = (key: string) => {
    sessionStorage.setItem('assess_recipient', key)
    const support =
      typeof window !== 'undefined' ? sessionStorage.getItem('assess_support') : null

    // If the user only wants medication, always route to the psychiatry pre-assessment.
    if (support === 'medication') {
      router.push('/assess/form/psychiatry')
      return
    }
    router.push(`/assess/form/${key}`)
  }

  return (
    <section className="min-h-[80vh] bg-[#FFF8F5] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#C8553D]">
            <span>Step 2 of 3</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#C8553D] rounded-full transition-all" />
          </div>
        </div>

        <h1
          style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
          className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-3"
        >
          Who will be receiving support today?
        </h1>
        <p className="text-gray-600 mb-10">
          We tailor the assessment based on who the care is for.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => select(o.key)}
              className="flex items-center gap-5 text-left bg-white border-2 border-transparent hover:border-[#C8553D] rounded-2xl p-6 shadow-sm hover:shadow-lg transition group"
            >
              <div className="text-4xl">{o.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-[#1C2B3A] mb-1 group-hover:text-[#C8553D]">
                  {o.title}
                </h3>
                <p className="text-sm text-gray-500">{o.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/assess')}
          className="mt-8 text-sm text-gray-500 hover:text-[#C8553D]"
        >
          ← Back
        </button>
      </div>
    </section>
  )
}
