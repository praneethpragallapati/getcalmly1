'use client'

const helplines = [
  { name: 'iCall (TISS)', number: '9152987821', tel: '+919152987821' },
  { name: 'Asra (24/7)', number: '+91-22-27546669', tel: '+912227546669' },
  { name: 'One Life (24/7)', number: '78930-78930', tel: '+917893078930' },
  { name: 'CHILDLINE', number: '1098', tel: '1098' },
  { name: "Women's Helpline", number: '1091', tel: '1091' },
]

export default function EmergencyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-t-8 border-[#d9534f] max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🫂</div>
          <h2
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-3xl font-black text-[#1a1a2e]"
          >
            We&apos;re here for you
          </h2>
          <p className="text-gray-600 mt-2">
            Thank you for sharing. If you are in immediate distress, please reach out to a
            crisis support line right now — help is available 24/7.
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {helplines.map((h) => (
            <a
              key={h.name}
              href={`tel:${h.tel}`}
              className="flex items-center justify-between bg-[#fdf2f2] hover:bg-[#fbe5e5] rounded-xl px-4 py-3 transition"
            >
              <span className="font-semibold text-[#1a1a2e]">{h.name}</span>
              <span className="font-bold text-[#d9534f]">{h.number}</span>
            </a>
          ))}
        </div>

        <div className="bg-[#e0f7fa] rounded-xl p-4 mb-6 text-sm text-[#0D5C63]">
          Our care team will prioritise your case and connect you with a therapist urgently.
          You can also proceed to the nearest emergency centre. This website is not intended
          for emergency intervention.
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`tel:${helplines[0].tel}`}
            className="flex-1 bg-[#d9534f] text-white text-center px-6 py-3 rounded-xl font-semibold hover:bg-[#c9302c] transition"
          >
            Call Now
          </a>
          <button
            onClick={onClose}
            className="flex-1 border-2 border-[#0D5C63] text-[#0D5C63] px-6 py-3 rounded-xl font-semibold hover:bg-[#e0f7fa] transition"
          >
            Continue to Booking
          </button>
        </div>
      </div>
    </div>
  )
}
