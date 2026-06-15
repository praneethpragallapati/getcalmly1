import Link from 'next/link'
import GoogleButton from '@/components/ui/GoogleButton'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
      <h1
        style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
        className="text-3xl font-black text-[#1a1a2e] mb-1"
      >
        Welcome back
      </h1>
      <p className="text-gray-500 text-sm mb-6">Sign in to continue your journey.</p>

      <GoogleButton label="Continue with Google" />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email or phone</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D5C63]"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="button"
          className="w-full bg-[#0D5C63] text-white py-3 rounded-lg font-semibold hover:bg-[#0a4a50] transition"
        >
          Send OTP
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#0D5C63] font-semibold">
          Register
        </Link>
      </p>
    </div>
  )
}
