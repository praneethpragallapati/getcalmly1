import Link from 'next/link'
import GoogleButton from '@/components/ui/GoogleButton'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
      <h1
        style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
        className="text-3xl font-black text-[#1a1a2e] mb-1"
      >
        Create your account
      </h1>
      <p className="text-gray-500 text-sm mb-6">Free to start. No payment needed to sign up.</p>

      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            placeholder="+91"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" className="mt-1 accent-[#0D5C63]" />
          <span>
            I agree to the{' '}
            <Link href="/safety" className="text-[#0D5C63] underline">
              Safety & Ethics
            </Link>{' '}
            policy and consent to data processing under the DPDP Act 2023.
          </span>
        </label>
        <button
          type="button"
          className="w-full bg-[#0D5C63] text-white py-3 rounded-lg font-semibold hover:bg-[#0a4a50] transition"
        >
          Create Account
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0D5C63] font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
