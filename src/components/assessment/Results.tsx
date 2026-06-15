'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { therapists } from '@/data/therapists'

type Result = {
  type: string
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe'
  concerns: string[]
  riskFlag: boolean
  answers: Record<string, string | string[]>
}

const severityStyles: Record<string, { bg: string; text: string; desc: string }> = {
  Minimal: {
    bg: '#e8f5ee',
    text: '#2f7a4f',
    desc: 'Your responses suggest minimal distress. A few sessions or self-help tools may help you stay well.',
  },
  Mild: {
    bg: '#fff7e0',
    text: '#9a7b1f',
    desc: 'Your responses suggest mild difficulties. Talking to a counsellor can help you build coping strategies.',
  },
  Moderate: {
    bg: '#ffeede',
    text: '#b5631f',
    desc: 'Your responses suggest moderate difficulties. We recommend regular sessions with a clinical psychologist.',
  },
  Severe: {
    bg: '#fdecec',
    text: '#c0392b',
    desc: 'Your responses suggest significant distress. We strongly recommend speaking with a professional soon. If you are in crisis, please use the helplines below.',
  },
}

export default function Results() {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('assess_result')
    if (raw) setResult(JSON.parse(raw))
  }, [])

  if (!result) {
    return (
      <section className="min-h-[70vh] bg-[#F9F5F0] py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">We couldn&apos;t find your assessment.</p>
          <Link
            href="/assess"
            className="bg-[#0D5C63] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Start Assessment
          </Link>
        </div>
      </section>
    )
  }

  const style = severityStyles[result.severity]
  const lang =
    typeof result.answers.language === 'string' ? result.answers.language : null

  // Match therapists: psychiatry → psychiatrist; couple → couples therapist; child → child specialist.
  const matched = matchTherapists(result, lang)

  return (
    <section className="min-h-[80vh] bg-[#F9F5F0] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1
          style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
          className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-3"
        >
          Your Assessment Results
        </h1>
        <p className="text-gray-600 mb-8">
          Based on your responses. This is a screening summary, not a clinical diagnosis.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-2">Severity Level</p>
            <span
              className="inline-block px-4 py-2 rounded-full font-bold text-lg"
              style={{ background: style.bg, color: style.text }}
            >
              {result.severity}
            </span>
            <p className="text-sm text-gray-600 mt-4">{style.desc}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-3">Areas of Concern</p>
            {result.concerns.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.concerns.map((c) => (
                  <span
                    key={c}
                    className="bg-[#e0f7fa] text-[#0D5C63] text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specific high-concern areas flagged.</p>
            )}
            {lang && (
              <p className="text-sm text-gray-500 mt-4">
                Preferred language: <span className="font-medium text-gray-700">{lang}</span>
              </p>
            )}
          </div>
        </div>

        {result.riskFlag && (
          <div className="bg-[#fdecec] border border-[#f5c6cb] rounded-2xl p-6 mb-10">
            <h3 className="font-bold text-[#c0392b] mb-2">You don&apos;t have to face this alone</h3>
            <p className="text-sm text-[#7a2820] mb-3">
              If you are in crisis or thinking about harming yourself, please reach out now:
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#c0392b]">
              <a href="tel:+919152987821">iCall: 9152987821</a>
              <a href="tel:+917893078930">One Life: 78930-78930</a>
              <a href="tel:+912227546669">Asra: +91-22-27546669</a>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">
          Recommended therapists for you
        </h2>
        <p className="text-gray-600 mb-6">
          Matched by your concerns{lang ? `, ${lang} language` : ''} and care type.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {matched.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: t.accent }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-[#1a1a2e] leading-tight">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.designation}</p>
                </div>
              </div>
              {t.rciVerified && (
                <span className="inline-block w-fit text-xs font-semibold text-[#0D5C63] bg-[#e0f7fa] px-2 py-0.5 rounded-full mb-3">
                  ✓ RCI Verified
                </span>
              )}
              <div className="flex flex-wrap gap-1 mb-3">
                {t.specializations.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-1">{t.languages.join(', ')}</p>
              <p className="text-xs text-gray-500 mb-4">
                {t.yearsExp} yrs exp • ⭐ {t.rating}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-bold text-[#0D5C63]">₹{t.sessionFee}</span>
                <Link
                  href="/login"
                  className="bg-[#0D5C63] text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-[#0a4a50] transition"
                >
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0D5C63] rounded-2xl p-8 text-center text-white">
          <h3
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-3xl font-black mb-2"
          >
            Ready to begin your journey?
          </h3>
          <p className="opacity-90 mb-6">
            Create your free account to book your first session and access your dashboard.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-[#0D5C63] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Book Your First Session
          </Link>
        </div>
      </div>
    </section>
  )
}

function matchTherapists(result: Result, lang: string | null) {
  let pool = [...therapists]

  if (result.type === 'psychiatry') {
    pool.sort((a, b) => Number(b.designation.includes('Psychiatrist')) - Number(a.designation.includes('Psychiatrist')))
  } else if (result.type === 'couple') {
    pool.sort((a, b) => Number(b.designation.includes('Couples')) - Number(a.designation.includes('Couples')))
  } else if (result.type === 'child') {
    pool.sort((a, b) => Number(b.designation.includes('Child')) - Number(a.designation.includes('Child')))
  }

  if (lang) {
    pool.sort((a, b) => Number(b.languages.includes(lang)) - Number(a.languages.includes(lang)))
  }

  return pool.slice(0, 3)
}
