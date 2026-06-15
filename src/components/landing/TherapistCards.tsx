import Link from 'next/link'

const therapists = [
  {
    name: 'Dr. Priya Sharma',
    initials: 'PS',
    title: 'Clinical Psychologist',
    years: 8,
    languages: ['Hindi', 'English'],
    fee: 2000,
    specializations: ['Anxiety', 'Depression', 'OCD'],
    color: '#0D5C63',
  },
  {
    name: 'Dr. Rahul Menon',
    initials: 'RM',
    title: 'Counseling Psychologist',
    years: 5,
    languages: ['Malayalam', 'English', 'Hindi'],
    fee: 1500,
    specializations: ['Stress', 'Trauma', 'Burnout'],
    color: '#6BAF92',
  },
  {
    name: 'Dr. Ananya Iyer',
    initials: 'AI',
    title: 'Psychiatrist',
    years: 12,
    languages: ['Tamil', 'English'],
    fee: 2500,
    specializations: ['Mood Disorders', 'Bipolar', 'Schizophrenia'],
    color: '#8B9DC3',
  },
]

export default function TherapistCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-4"
            style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
          >
            Meet Our Therapists
          </h2>
          <p className="text-gray-600">RCI-licensed professionals dedicated to your wellbeing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {therapists.map((t) => (
            <div key={t.name} className="bg-[#F9F5F0] rounded-2xl p-6 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{backgroundColor: t.color}}
                >
                  {t.initials}
                </div>
                <div>
                  <h3 className="font-bold text-[#1a1a2e]">{t.name}</h3>
                  <p className="text-sm text-gray-500">{t.title}</p>
                  <span className="inline-flex items-center gap-1 text-xs bg-[#e0f7fa] text-[#0D5C63] font-semibold px-2 py-0.5 rounded-full mt-1">
                    ✓ RCI Verified
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {t.specializations.map((s) => (
                  <span key={s} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{t.years} yrs exp</span>
                <span>{t.languages.join(' / ')}</span>
                <span className="font-semibold text-[#0D5C63]">₹{t.fee.toLocaleString()}/session</span>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link href="/therapists" className="flex-1 border border-[#0D5C63] text-[#0D5C63] text-sm text-center py-2 rounded-lg hover:bg-[#e0f7fa] transition">
                  View Profile
                </Link>
                <Link href="/assess" className="flex-1 bg-[#0D5C63] text-white text-sm text-center py-2 rounded-lg hover:bg-[#0a4a50] transition">
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
