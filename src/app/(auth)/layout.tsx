import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9F5F0] flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-block">
          <span
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-3xl font-black text-[#0D5C63]"
          >
            getCalmly<span className="text-[#6BAF92]">.</span>
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">{children}</main>
    </div>
  )
}
