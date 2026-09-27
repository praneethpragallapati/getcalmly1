'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts a number up from 0 to `value` once, when it first scrolls into view.
 * Respects reduced-motion (renders the final value immediately) and falls back
 * to the final value if IntersectionObserver isn't available.
 */
export function CountUp({
  value,
  duration = 900,
  decimals = 0,
}: {
  value: number
  duration?: number
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!el || reduce || typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }

    let raf = 0
    let started = false
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
        setDisplay(value * eased)
        if (t < 1) raf = requestAnimationFrame(tick)
        else setDisplay(value)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true
          setDisplay(0)
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return <span ref={ref}>{display.toFixed(decimals)}</span>
}
