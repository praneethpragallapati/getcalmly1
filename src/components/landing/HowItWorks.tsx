const steps = [
  {
    num: '01',
    icon: '📋',
    title: 'Complete Your Assessment',
    desc: 'Tell us about yourself through our confidential pre-assessment. It takes just 5 minutes and helps us understand your unique needs.',
  },
  {
    num: '02',
    icon: '🎯',
    title: 'Get Matched',
    desc: 'Our algorithm matches you with the right therapist by specialty, language & budget. View profiles and choose who feels right for you.',
  },
  {
    num: '03',
    icon: '🌱',
    title: 'Begin Your Journey',
    desc: 'Book your first session via secure Google Meet. Reschedule anytime. Track your progress with mood journals and session notes.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-4"
            style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
          >
            How It Works
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">Getting the right mental health support has never been easier.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(16.6%+32px)] right-[calc(16.6%+32px)] h-0.5 bg-[#e0f7fa] z-0"></div>
          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="w-20 h-20 bg-[#e0f7fa] rounded-full flex items-center justify-center text-3xl mb-4 border-4 border-white shadow">
                {step.icon}
              </div>
              <div className="text-[#0D5C63] font-bold text-xs mb-2 tracking-widest">{step.num}</div>
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
