const stats = [
  { value: '500+', label: 'Verified Therapists' },
  { value: '50,000+', label: 'Sessions Completed' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '15+', label: 'Languages Supported' },
]

export default function Stats() {
  return (
    <section className="bg-[#C8553D] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div
                className="text-4xl md:text-5xl font-black text-white mb-1"
                style={{fontFamily:"'Big Shoulders Display',sans-serif"}}
              >
                {stat.value}
              </div>
              <div className="text-[#FDEAE6] text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
