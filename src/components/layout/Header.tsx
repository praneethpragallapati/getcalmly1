'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-[#FFF8F5]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size={30} />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-[#C8553D] transition">Home</Link>
            <Link href="/services" className="hover:text-[#C8553D] transition">Services</Link>
            <Link href="/about" className="hover:text-[#C8553D] transition">About Us</Link>
            <Link href="/community" className="hover:text-[#C8553D] transition">Community</Link>
            <Link href="/blog" className="hover:text-[#C8553D] transition">Blog</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/therapists/register" className="text-sm border border-[#C8553D] text-[#C8553D] px-4 py-2 rounded-lg hover:bg-[#FDEAE6] transition">For Therapists</Link>
            <Link href="/login" className="text-sm text-gray-700 hover:text-[#C8553D] transition px-2">Login</Link>
            <Link href="/assess" className="text-sm bg-[#C8553D] text-white px-4 py-2 rounded-lg hover:bg-[#A8432D] transition">Get Started</Link>
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
              <Link href="/login" className="border border-[#C8553D] text-[#C8553D] px-4 py-2 rounded-lg text-center flex-1">Login</Link>
              <Link href="/assess" className="bg-[#C8553D] text-white px-4 py-2 rounded-lg text-center flex-1">Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
