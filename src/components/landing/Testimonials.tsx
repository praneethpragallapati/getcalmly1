const testimonials = [
  {
    name: 'Priya R.',
    location: 'Mumbai',
    avatar: 'PR',
    color: '#C8553D',
    quote: 'GetCalmly helped me find a Hindi-speaking therapist who truly understood my cultural context. I never had to explain why family pressure affects me, she just got it. My anxiety has reduced significantly in just 2 months.',
  },
  {
    name: 'Arjun K.',
    location: 'Bangalore',
    avatar: 'AK',
    color: '#3D9E72',
    quote: 'The pre-assessment was spot-on. My matched therapist specializes in exactly what I needed, work burnout and imposter syndrome. The video sessions are seamless, and the pricing is very reasonable.',
  },
  {
    name: 'Meera S.',
    location: 'NRI, Toronto',
    avatar: 'MS',
    color: '#C9973A',
    quote: 'As an NRI, finding an Indian therapist who gets my background was priceless. Sessions are so affordable compared to local rates here. My therapist speaks Tamil and understands the cultural nuances perfectly.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-4"
            style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
          >
            What Our Community Says
          </h2>
          <p className="text-gray-600">Real stories from people on their wellness journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[#FFF8F5] rounded-2xl p-6 relative">
              <div className="text-4xl text-[#FDEAE6] font-serif absolute top-4 left-6 leading-none">&quot;</div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6 mt-4 relative z-10">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{backgroundColor: t.color}}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#1C2B3A] text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.location}</div>
                </div>
                <div className="ml-auto text-yellow-500 text-sm">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
