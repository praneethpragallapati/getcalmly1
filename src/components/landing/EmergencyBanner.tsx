export default function EmergencyBanner() {
  return (
    <section className="bg-amber-50 border-y-2 border-amber-200 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-3xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-amber-900 mb-4">In Crisis? You Are Not Alone.</h2>
        <p className="text-amber-800 mb-6">
          If you are experiencing a crisis or contemplating suicide, please contact:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="font-bold text-amber-900">Asra</div>
            <a href="tel:+912227546669" className="text-red-600 font-bold text-lg">+91-22-27546669</a>
            <div className="text-xs text-gray-500">24/7 Helpline</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="font-bold text-amber-900">One Life</div>
            <a href="tel:7893078930" className="text-red-600 font-bold text-lg">78930-78930</a>
            <div className="text-xs text-gray-500">24/7 Helpline</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="font-bold text-amber-900">iCall</div>
            <a href="tel:9152987821" className="text-red-600 font-bold text-lg">9152987821</a>
            <div className="text-xs text-gray-500">Mon–Sat, 8am–10pm</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="font-bold text-amber-900">Childline</div>
            <a href="tel:1098" className="text-red-600 font-bold text-lg">1098</a>
            <div className="text-xs text-gray-500">For children in need</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="font-bold text-amber-900">Women&apos;s Helpline</div>
            <a href="tel:1091" className="text-red-600 font-bold text-lg">1091</a>
            <div className="text-xs text-gray-500">For women in crisis</div>
          </div>
        </div>
        <p className="text-amber-700 text-sm">
          Or proceed to the nearest emergency centre. <strong>This website is not intended for emergency intervention.</strong><br />
          If a child requires immediate assistance, contact CHILDLINE at 1098. If a woman needs urgent help, contact Women&apos;s Helpline at 1091.
        </p>
      </div>
    </section>
  )
}
