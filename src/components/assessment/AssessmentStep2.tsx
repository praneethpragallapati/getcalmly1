'use client'

import { useRouter } from 'next/navigation'

const options = [
  {
    key: 'adult',
    icon: '👤',
    title: 'Myself',
    desc: 'Adult (18+) seeking support for my own wellbeing',
  },
  {
    key: 'child',
    icon: '🧒',
    title: 'My Child or Adolescent',
    desc: 'Someone under 18 — I am a parent or guardian',
  },
  {
    key: 'couple',
    icon: '💑',
    title: 'My Partner and I',
    desc: 'Couples or relationship therapy for both of us',
  },
]

export default function AssessmentStep2() {
  const router = useRouter()

  const select = (key: string) => {
    sessionStorage.setItem('assess_recipient', key)
    const support =
      typeof window !== 'undefined' ? sessionStorage.getItem('assess_support') : null
    if (support === 'medication') {
      router.push('/assess/form/psychiatry')
      return
    }
    router.push(`/assess/form/${key}`)
  }

  return (
    <div className="assess-shell">
      <div className="assess-inner">
        {/* Progress */}
        <div className="assess-progress">
          <div className="ap-meta">
            <span className="ap-step">Step 2 of 3</span>
            <span className="ap-label">Who is the care for?</span>
          </div>
          <div className="ap-track">
            <div className="ap-fill" style={{ width: '66%' }} />
          </div>
          <div className="ap-dots">
            <span className="ap-dot done" />
            <span className="ap-dot active" />
            <span className="ap-dot" />
          </div>
        </div>

        <div className="assess-card">
          <h1 className="assess-h1">Who will be receiving<br />support today?</h1>
          <p className="assess-sub">We tailor the assessment questions based on who the care is for.</p>

          <div className="ao-grid ao-grid-1">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => select(o.key)}
                className="ao-btn ao-btn-row"
              >
                <span className="ao-icon">{o.icon}</span>
                <span className="ao-body">
                  <span className="ao-title">{o.title}</span>
                  <span className="ao-desc">{o.desc}</span>
                </span>
                <span className="ao-arrow">→</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push('/assess')}
            className="ao-back"
          >
            ← Back
          </button>
        </div>

        <p className="assess-footnote">🔒 Your responses are confidential and protected under the DPDP Act 2023.</p>
      </div>
    </div>
  )
}
