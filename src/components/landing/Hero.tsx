import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-[#F9F5F0] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e0f7fa] text-[#0D5C63] text-xs font-semibold px-3 py-1 rounded-full mb-6">
              ✓ RCI Verified Platform
            </div>
            <h1
              style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1a1a2e] leading-tight mb-6"
            >
              Mental Health<br />
              <span className="text-[#0D5C63]">Support That</span><br />
              Truly Understands You
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Connect with RCI-licensed therapists in your language, at your budget.
              Start your journey to wellbeing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/assess"
                className="bg-[#0D5C63] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#0a4a50] transition text-center shadow-lg"
              >
                Begin Your Assessment →
              </Link>
              <Link
                href="/therapists"
                className="border-2 border-[#0D5C63] text-[#0D5C63] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#e0f7fa] transition text-center"
              >
                Browse Therapists
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><span className="text-[#0D5C63] font-bold">✓</span> RCI Verified Therapists</span>
              <span className="flex items-center gap-1"><span className="text-[#0D5C63] font-bold">✓</span> DPDP Compliant</span>
              <span className="flex items-center gap-1"><span className="text-[#0D5C63] font-bold">✓</span> 10+ Languages</span>
              <span className="flex items-center gap-1"><span className="text-[#0D5C63] font-bold">✓</span> Sessions from ₹1,500</span>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative w-80 h-[500px]">
              {/* Phone frame */}
              <div className="absolute inset-0 bg-[#0D5C63] rounded-[40px] shadow-2xl"></div>
              <div className="absolute inset-2 bg-white rounded-[34px] overflow-hidden">
                {/* App UI mockup */}
                <div className="bg-[#0D5C63] p-4 pt-8">
                  <p className="text-white text-xs font-medium opacity-70">Good morning</p>
                  <p className="text-white font-bold text-lg">How are you feeling?</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-[#e0f7fa] rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Today&apos;s Session</p>
                    <p className="font-semibold text-[#0D5C63] text-sm">Dr. Priya Sharma</p>
                    <p className="text-xs text-gray-500">3:00 PM • 50 mins</p>
                  </div>
                  <div className="bg-[#e8f5ee] rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">Mood Check-in</p>
                    <div className="flex gap-2 text-2xl">
                      <span>😔</span><span>😐</span><span className="scale-125 inline-block">🙂</span><span>😊</span><span>😄</span>
                    </div>
                  </div>
                  <div className="bg-[#F9F5F0] rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Journal Prompt</p>
                    <p className="text-sm text-gray-700">&quot;What made you smile today?&quot;</p>
                  </div>
                  <div className="bg-[#0D5C63] rounded-xl p-3 text-white">
                    <p className="text-xs font-medium opacity-80">Next Steps</p>
                    <p className="text-sm font-bold">Complete your assessment</p>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -right-6 top-24 bg-white rounded-2xl shadow-xl p-3 text-sm font-bold text-[#0D5C63]">
                4.8 ★<br/><span className="text-xs text-gray-500 font-normal">avg rating</span>
              </div>
              <div className="absolute -left-8 bottom-28 bg-white rounded-2xl shadow-xl p-3 text-sm">
                <span className="font-bold text-[#0D5C63]">500+</span><br/>
                <span className="text-xs text-gray-500">therapists</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
