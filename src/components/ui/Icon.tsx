import type { CSSProperties } from 'react'

/**
 * getCalmly icon system — minimal, geometric line icons (the "variant 3"
 * language: straight lines, rounded rects, ticks instead of curves).
 * Stroke uses currentColor, so set the color via the parent's `color` or the
 * `color` prop. Self-contained SVG, no dependency.
 *
 * Usage:  <Icon name="ai" size={28} />   // inherits currentColor
 *         <Icon name="mood" color="#C8553D" />
 */
export type IconName =
  | 'ai' | 'mood' | 'journal' | 'shield' | 'medical' | 'community'
  | 'home' | 'calendar' | 'clipboard' | 'brain' | 'pill' | 'couples'
  | 'growth' | 'mother' | 'hands' | 'therapist' | 'chat' | 'share'
  | 'heart' | 'star' | 'streak' | 'phone' | 'mail' | 'lock' | 'warning'
  | 'search' | 'bell' | 'card' | 'sun' | 'check' | 'refresh' | 'target'
  | 'sparkle' | 'user' | 'building' | 'doc' | 'clip' | 'leaf'

const P: Record<IconName, React.ReactNode> = {
  ai: (
    <>
      <line x1="12" y1="5" x2="12" y2="8" />
      <circle cx="12" cy="4.3" r="1.1" fill="currentColor" stroke="none" />
      <rect x="6.5" y="8" width="11" height="9" rx="3" />
      <line x1="9.7" y1="11.8" x2="9.7" y2="13.4" />
      <line x1="14.3" y1="11.8" x2="14.3" y2="13.4" />
      <line x1="4" y1="11.5" x2="4" y2="13.5" opacity=".6" />
      <line x1="20" y1="11.5" x2="20" y2="13.5" opacity=".6" />
    </>
  ),
  mood: (
    <>
      <polyline points="4,16 9,11 13,14 20,6" />
      <circle cx="20" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <line x1="4" y1="20" x2="20" y2="20" opacity=".4" />
    </>
  ),
  journal: (
    <>
      <path d="M6 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <line x1="8" y1="9" x2="14" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.5v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10v-5L12 3Z" />
      <polyline points="9,12 11,14 15,10" />
    </>
  ),
  medical: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <line x1="12" y1="9" x2="12" y2="15" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </>
  ),
  community: (
    <>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.4" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M15 19c0-1.7.8-3.2 2-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <line x1="10.5" y1="19" x2="10.5" y2="14" />
      <line x1="13.5" y1="19" x2="13.5" y2="14" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2.5" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="4" x2="8" y2="7" />
      <line x1="16" y1="4" x2="16" y2="7" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1.2" />
      <line x1="8.5" y1="12" x2="15" y2="12" />
      <line x1="8.5" y1="16" x2="13" y2="16" />
    </>
  ),
  clip: (
    <>
      <rect x="5" y="5" width="14" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1.2" />
      <line x1="8.5" y1="12" x2="15" y2="12" />
      <line x1="8.5" y1="16" x2="13" y2="16" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <polyline points="14,3 14,7 18,7" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="15" x2="14" y2="15" />
    </>
  ),
  brain: (
    <>
      <rect x="7" y="6" width="10" height="11" rx="4" />
      <line x1="12" y1="6" x2="12" y2="17" />
      <path d="M9.5 10.5h1.2M13.3 13h1.2" />
    </>
  ),
  pill: (
    <>
      <rect x="5" y="9" width="14" height="6" rx="3" transform="rotate(45 12 12)" />
      <line x1="9.6" y1="9.6" x2="14.4" y2="14.4" />
    </>
  ),
  couples: (
    <>
      <path d="M8.5 8c-.7-1.3-2.9-1.1-2.9.7 0 1.5 2.9 3.1 2.9 3.1s2.9-1.6 2.9-3.1c0-1.8-2.2-2-2.9-.7Z" />
      <path d="M15.6 11.5c-.6-1-2.3-.9-2.3.5 0 1.2 2.3 2.5 2.3 2.5s2.3-1.3 2.3-2.5c0-1.4-1.7-1.5-2.3-.5Z" />
    </>
  ),
  growth: (
    <>
      <line x1="12" y1="20" x2="12" y2="12" />
      <path d="M12 13c0-3 2-5 6-5 0 3-2 5-6 5Z" />
      <path d="M12 15c0-2.5-1.6-4-5-4 0 2.5 1.6 4 5 4Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
      <line x1="8" y1="16" x2="15" y2="9" />
    </>
  ),
  mother: (
    <>
      <path d="M12 20S5 15.5 5 10.5C5 7.8 7 6.5 9 7.5c1 .5 2.5 2 3 2s2-1.5 3-2c2-1 4 .3 4 3C19 15.5 12 20 12 20Z" />
      <circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  hands: (
    <>
      <path d="M12 9c-.8-1.5-3.3-1.3-3.3.8 0 1.8 3.3 3.6 3.3 3.6s3.3-1.8 3.3-3.6c0-2.1-2.5-2.3-3.3-.8Z" />
      <path d="M5.5 14c-1 1-1 3.2 0 4.2M18.5 14c1 1 1 3.2 0 4.2" />
    </>
  ),
  therapist: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M12 14v3M10.5 15.5h3" />
    </>
  ),
  chat: (
    <>
      <path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
    </>
  ),
  share: (
    <>
      <path d="M7 12v6a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-6" />
      <line x1="12" y1="4" x2="12" y2="14" />
      <polyline points="8.5,7.5 12,4 15.5,7.5" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20S4 15 4 9.5C4 6.5 6.5 5 9 6.2 10.2 6.8 11.6 8 12 8s1.8-1.2 3-1.8C17.5 5 20 6.5 20 9.5 20 15 12 20 12 20Z" />
    </>
  ),
  star: (
    <>
      <path
        d="M12 4l2.3 4.9 5.2.7-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 9.6l5.2-.7Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  streak: (
    <>
      <polygon points="13,3 6,13 11,13 10,21 18,10 13,10" fill="currentColor" stroke="none" />
    </>
  ),
  phone: (
    <>
      <path d="M6 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2Z" />
    </>
  ),
  mail: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <polyline points="5,8 12,13 19,8" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4l8.5 15H3.5L12 4Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <line x1="15.5" y1="15.5" x2="20" y2="20" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16v-4a6 6 0 0 1 12 0v4l1.5 2H4.5L6 16Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  card: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2.5" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="7" y1="14" x2="11" y2="14" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <polyline points="8.5,12.5 11,15 15.5,9.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M19 12a7 7 0 1 1-2-4.9" />
      <polyline points="17,3 17,7.5 12.5,7.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  sparkle: (
    <>
      <path
        d="M12 4c.6 4 3.9 6 8 6-4.1 0-7.4 2-8 6-.6-4-3.9-6-8-6 4.1 0 7.4-2 8-6Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  building: (
    <>
      <rect x="6" y="4" width="12" height="16" rx="1.5" />
      <line x1="9.5" y1="8" x2="9.5" y2="8" />
      <path d="M9 8h.01M14 8h.01M9 12h.01M14 12h.01M9 16h6" />
    </>
  ),
}

export default function Icon({
  name,
  size = 24,
  color,
  strokeWidth = 1.7,
  style,
  className,
  title,
}: {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
  style?: CSSProperties
  className?: string
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ color, display: 'inline-block', flexShrink: 0, ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {P[name]}
    </svg>
  )
}
