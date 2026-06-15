import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#052e32] text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3" style={{fontFamily:"'Big Shoulders Display',sans-serif"}}>getCalmly<span className="text-[#6BAF92]">.</span></h2>
            <p className="text-sm text-gray-400">Mental health support that understands you.</p>
            <p className="text-sm text-gray-400 mt-2">RCI-verified therapists. Your language. Your budget.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Services</Link></li>
              <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="/community" className="hover:text-white transition">Community</Link></li>
              <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/safety" className="hover:text-white transition">Safety &amp; Ethics</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-red-300">⚠ Crisis Support</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-300 font-medium">iCall:</span> <a href="tel:9152987821" className="text-red-300 font-bold hover:text-red-200">9152987821</a></li>
              <li><span className="text-gray-300 font-medium">Asra:</span> <a href="tel:+912227546669" className="text-red-300 font-bold hover:text-red-200">+91-22-27546669</a></li>
              <li><span className="text-gray-300 font-medium">One Life:</span> <a href="tel:7893078930" className="text-red-300 font-bold hover:text-red-200">78930-78930</a></li>
              <li><span className="text-gray-300 font-medium">Childline:</span> <a href="tel:1098" className="text-red-300 font-bold hover:text-red-200">1098</a></li>
              <li><span className="text-gray-300 font-medium">Women&apos;s Helpline:</span> <a href="tel:1091" className="text-red-300 font-bold hover:text-red-200">1091</a></li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">All helplines available 24/7</p>
          </div>
        </div>
        <div className="border-t border-[#0a4a50] pt-6 text-center text-xs text-gray-500">
          © 2026 GetCalmly. All rights reserved. | RCI Verified Platform | DPDP Compliant
        </div>
      </div>
    </footer>
  )
}
