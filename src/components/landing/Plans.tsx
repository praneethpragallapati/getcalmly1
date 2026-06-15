import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: null,
    unit: null,
    badge: null,
    features: [
      'Mood Tracker (14 days)',
      'Journal (basic)',
      'Self-Help Resources',
      'Community Access',
      'Blog Access',
    ],
    cta: 'Get Started Free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Counsellor',
    price: '₹1,500',
    unit: '/session',
    badge: 'Most Popular',
    features: [
      'Everything in Free (unlimited)',
      'Sessions with Counseling Psychologists',
      'Session Notes Access',
      'Email Reminders',
    ],
    cta: 'Book Session',
    href: '/assess',
    highlight: true,
  },
  {
    name: 'Clinical',
    price: 'from ₹2,000',
    unit: '/session',
    badge: null,
    features: [
      'Everything in Counsellor',
      'RCI Clinical Psychologists',
      'Psychiatric Referrals',
      'Detailed Assessment Reports',
      'Priority Matching',
    ],
    cta: 'Book Session',
    href: '/assess',
    highlight: false,
  },
]

export default function Plans() {
  return (
    <section className="py-20 bg-[#FFF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-4"
            style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600">Pay per session. No subscriptions. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col relative ${plan.highlight ? 'bg-[#C8553D] text-white shadow-2xl scale-105' : 'bg-white'}`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3D9E72] text-white text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-[#1C2B3A]'}`} style={{fontFamily:"'Big Shoulders Display',sans-serif"}}>{plan.name}</h3>
              <div className="mb-6">
                {plan.price ? (
                  <span className="text-3xl font-black">{plan.price}<span className="text-base font-normal opacity-70">{plan.unit}</span></span>
                ) : (
                  <span className="text-3xl font-black">Free</span>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-[#FDEAE6]' : 'text-gray-600'}`}>
                    <span className={`mt-0.5 font-bold flex-shrink-0 ${plan.highlight ? 'text-[#3D9E72]' : 'text-[#C8553D]'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`text-center py-3 rounded-xl font-semibold text-sm transition ${plan.highlight ? 'bg-white text-[#C8553D] hover:bg-[#FDEAE6]' : 'bg-[#C8553D] text-white hover:bg-[#A8432D]'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
