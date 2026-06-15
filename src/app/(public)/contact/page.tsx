import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | GetCalmly',
  description: 'Get in touch with the GetCalmly team.',
}

export default function ContactPage() {
  return (
    <div className="bg-[#FFF8F5]">
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h1
              style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
              className="text-4xl md:text-5xl font-black text-[#1C2B3A] mb-4"
            >
              Get in Touch
            </h1>
            <p className="text-gray-600 mb-8">
              Questions about our services, partnerships, or joining as a therapist? We’d love to
              hear from you.
            </p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <a href="mailto:getcalmly@gmail.com" className="text-[#C8553D]">
                  getcalmly@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-800">For Therapists</p>
                <p className="text-gray-600">Interested in joining our RCI-verified network? Email us with your credentials.</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="font-semibold text-[#c0392b] mb-1">In crisis?</p>
                <p className="text-gray-600">
                  Call iCall: <a href="tel:+919152987821" className="text-[#C8553D]">9152987821</a> or
                  One Life: <a href="tel:+917893078930" className="text-[#C8553D]">78930-78930</a> (24/7).
                  This form is not monitored for emergencies.
                </p>
              </div>
            </div>
          </div>

          <form className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8553D]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8553D]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8553D]"
                placeholder="+91"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C8553D]"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#C8553D] text-white py-3 rounded-lg font-semibold hover:bg-[#A8432D] transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
