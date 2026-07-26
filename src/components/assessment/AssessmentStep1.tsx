'use client'

import { useRouter } from 'next/navigation'

const options = [
  {
    key: 'therapy',
    icon: '🧠',
    title: 'Therapy',
    desc: 'Talk therapy with an RCI-verified psychologist or counsellor',
    color: '#C8553D',
    pale: '#FDEAE6',
  },
  {
    key: 'not-sure',
    icon: '🤔',
    title: 'Not Sure',
    desc: "That's okay. We'll guide you to the right kind of help based on your answers",
    color: '#C9973A',
    pale: '#FFF8E7',
  },
]

export default function AssessmentStep1() {
  const router = useRouter()

  const select = (key: string) => {
    sessionStorage.setItem('assess_support', key)
    router.push('/assess/step2')
  }

  return (
    <div className="assess-shell">
      <div className="assess-inner">
        {/* Progress */}
        <div className="assess-progress">
          <div className="ap-meta">
            <span className="ap-step">Step 1 of 3</span>
            <span className="ap-label">Support type</span>
          </div>
          <div className="ap-track">
            <div className="ap-fill" style={{ width: '33%' }} />
          </div>
          <div className="ap-dots">
            <span className="ap-dot active" />
            <span className="ap-dot" />
            <span className="ap-dot" />
          </div>
        </div>

        <div className="assess-card">
          <div className="assess-pill">✦ Free · No card needed · 5 minutes</div>
          <h1 className="assess-h1">What kind of support are<br />you looking for?</h1>
          <p className="assess-sub">This helps us connect you with the right professional. There are no wrong answers.</p>

          <div className="ao-grid ao-grid-2">
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => select(o.key)}
                className="ao-btn"
                style={{ '--ao-color': o.color, '--ao-pale': o.pale } as React.CSSProperties}
              >
                <span className="ao-icon">{o.icon}</span>
                <span className="ao-title">{o.title}</span>
                <span className="ao-desc">{o.desc}</span>
                <span className="ao-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <p className="assess-footnote">🔒 Your responses are confidential and protected under the DPDP Act 2023.</p>
      </div>
    </div>
  )
}
