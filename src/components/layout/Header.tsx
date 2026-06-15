'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-[#F9F5F0]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-[#0D5C63]" style={{fontFamily:"'Big Shoulders Display',sans-serif"}}>getCalmly<span className="text-[#6BAF92]">.</span></Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-[#0D5C63] transition">Home</Link>
            <Link href="/services" className="hover:text-[#0D5C63] transition">Services</Link>
            <Link href="/about" className="hover:text-[#0D5C63] transition">About Us</Link>
            <Link href="/community" className="hover:text-[#0D5C63] transition">Community</Link>
            <Link href="/blog" className="hover:text-[#0D5C63] transition">Blog</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/therapists/register" className="text-sm border border-[#0D5C63] text-[#0D5C63] px-4 py-2 rounded-lg hover:bg-[#e0f7fa] transition">For Therapists</Link>
            <Link href="/login" className="text-sm text-gray-700 hover:text-[#0D5C63] transition px-2">Login</Link>
            <Link href="/assess" className="text-sm bg-[#0D5C63] text-white px-4 py-2 rounded-lg hover:bg-[#0a4a50] transition">Get Started</Link>
          </div>
          <button className="md:hidden p-2 flex flex-col gap-1" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`block w-5 h-0.5 bg-gray-800 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-800 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-800 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-4 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/about">About Us</Link>
            <Link href="/community">Community</Link>
            <Link href="/blog">Blog</Link>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="border border-[#0D5C63] text-[#0D5C63] px-4 py-2 rounded-lg text-center flex-1">Login</Link>
              <Link href="/assess" className="bg-[#0D5C63] text-white px-4 py-2 rounded-lg text-center flex-1">Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
