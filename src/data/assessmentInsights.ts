/**
 * The extra value on the pre-assessment results page, built only from the
 * person's own answers: a plain-words summary, a care plan, small things to
 * try this week, and what a first session looks like.
 *
 * Tone rule for everything here: warm, practical, never alarming. Ranges are
 * typical, not prescriptions; the clinician shapes the real plan together with
 * the person. Nothing here is medical advice (no medication guidance, ever).
 */
import type { AssessmentResult, FlowId, Level } from '@/data/assessments'

// ── "What we heard" ─────────────────────────────────────────────────────────────

function list(items: string[]): string {
  const xs = items.map((s) => s.charAt(0).toLowerCase() + s.slice(1))
  if (xs.length <= 1) return xs[0] ?? ''
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`
}

/** One or two warm sentences reflecting the answers back. */
export function whatWeHeard(r: AssessmentResult): string {
  // Leave out only the "not sure" answers themselves, not concerns that merely
  // contain the word (e.g. "Feeling unsure about life or career decisions").
  const concerns = r.concerns.filter((c) => !/^(i'm (unsure|not sure)|not sure)/i.test(c)).slice(0, 3)
  const areas = (r.areas ?? []).filter((a) => a !== 'A bit of everything').slice(0, 3)
  const hopes = (r.hopes ?? []).slice(0, 2)
  const everywhere = (r.areas ?? []).includes('A bit of everything')

  if (r.flow === 'child') {
    const a = concerns.length ? `You shared what you have been noticing in your child: ${list(concerns)}` : 'You told us something does not feel quite right for your child'
    const b = hopes.length ? `. You are hoping for ${list(hopes)}.` : '.'
    return `${a}${b} That is a caring thing to notice, and there is a lot a child specialist can do with it.`
  }
  if (r.flow === 'couple') {
    const a = concerns.length ? `You told us the two of you are facing ${list(concerns)}` : 'You told us something feels off in your relationship'
    const b = hopes.length ? `, and that you would like ${list(hopes)}.` : '.'
    return `${a}${b} Reaching out together is often the hardest step, and you have taken it.`
  }
  const a = concerns.length ? `You told us you have been dealing with ${list(concerns)}` : 'You told us you are not quite sure what kind of support you need, which is completely fine'
  const b = everywhere
    ? ', and that it is touching most parts of life.'
    : areas.length ? `, and that it is showing up most in ${list(areas)}.` : '.'
  return `${a}${b} None of this is unusual, and all of it is something you can work on with the right person beside you.`
}

// ── Care plan ───────────────────────────────────────────────────────────────────

export type CarePlan = { care: string; careNote: string; rhythm: string; rhythmNote: string; length: string; lengthNote: string }

const RHYTHM: Record<Level, string> = { Mild: 'Every two weeks', Moderate: 'Weekly', High: 'Weekly', Elevated: 'Weekly' }
const LENGTH: Record<Level, string> = { Mild: '4 to 6 sessions', Moderate: '8 to 12 sessions', High: '12 or more sessions', Elevated: '12 or more sessions' }

export function carePlan(flow: FlowId, level: Level): CarePlan {
  if (flow === 'psychiatry') {
    return {
      care: 'Psychiatric consultation',
      careNote: 'With an NMC licensed psychiatrist, alongside therapy where it helps.',
      rhythm: level === 'High' || level === 'Elevated' ? 'Follow-ups every 1 to 2 weeks at first' : 'Follow-ups every 2 to 4 weeks',
      rhythmNote: 'Spaced out further as things settle.',
      length: 'Reviewed at every visit',
      lengthNote: 'Your psychiatrist adjusts the plan with you as you go.',
    }
  }
  const base = {
    rhythm: RHYTHM[level],
    rhythmNote: '45 minute sessions online, at times that suit you.',
    length: LENGTH[level],
    lengthNote: 'Most people notice a real shift within the first few sessions. You review progress together.',
  }
  if (flow === 'child') {
    return { ...base, care: 'Child and teen therapy', careNote: 'With an RCI licensed child specialist, with you kept involved through parent check-ins.' }
  }
  if (flow === 'couple') {
    return { ...base, care: 'Couples therapy', careNote: 'With an RCI licensed couples therapist, for both of you together.' }
  }
  return { ...base, care: 'One-to-one therapy', careNote: 'With an RCI licensed clinical psychologist, in a private and confidential space.' }
}

// ── Small things to try this week ──────────────────────────────────────────────

export type Tip = { title: string; body: string }

const TIPS: Record<string, Tip> = {
  'Anxiety & overthinking': { title: 'Give worry a set time', body: 'Pick a 15 minute "worry window" each evening. When a worry shows up earlier, jot it down and save it for then.' },
  'Stress & burnout': { title: 'Take three real breaks', body: 'Three times a day, step away from screens for five minutes: stretch, drink water, look outside. Small resets add up.' },
  'Depression & low mood': { title: 'Plan one small good thing', body: 'Each day, schedule one small activity you used to enjoy, even for 10 minutes. Doing comes before feeling better, not after.' },
  'Emotional regulation': { title: 'Name it to tame it', body: 'When a strong feeling hits, pause and name it in words ("this is frustration"). Naming a feeling helps it settle.' },
  'Anger management': { title: 'Use a 90 second pause', body: 'When anger rises, step away and breathe slowly for 90 seconds before you reply. The first surge passes in that time.' },
  'Relationship issues': { title: 'Speak from "I"', body: 'Try "I felt hurt when…" rather than "You always…". It keeps conversations about feelings, not blame.' },
  'Family conflict': { title: 'Choose calm moments', body: 'Raise difficult topics when everyone is rested and fed, not in the middle of a disagreement.' },
  'Habits & addiction': { title: 'Notice the trigger', body: 'For a week, note when the urge shows up: the time, the place, the feeling. Patterns are the first thing to work with.' },
  'Trauma & PTSD': { title: 'Ground yourself with 5-4-3-2-1', body: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell and 1 you taste. It brings you back to the present.' },
  'Grief & loss': { title: 'Make room for the memory', body: 'Set aside a quiet moment to write a few lines to or about the person or thing you lost. Grief eases when it is given space.' },
  'Life & career decisions': { title: 'Write down what matters', body: 'List your top five values, then check each option against them. Clarity often comes from values, not pros and cons.' },
  'Personal growth': { title: 'Keep a two-line journal', body: 'Each night, write one thing that went well and one thing you learned about yourself. It builds self-understanding fast.' },
  'Self-esteem & confidence': { title: 'Collect small wins', body: 'Note three things you did well each day, however small. Over a week it quietly changes how you see yourself.' },
  'Sleep difficulties': { title: 'Fix your wake-up time', body: 'Get up at the same time every day, weekends included, and keep screens out of bed for the last 30 minutes.' },
  'Pregnancy & postpartum': { title: 'Ask for one specific help', body: 'Pick one task this week to hand to someone else, asked for clearly. Rest is part of care, not a luxury.' },
  'Parenting support': { title: 'Ten minutes of special time', body: 'Give your child 10 minutes a day of your full attention on something they choose. It reduces friction across the day.' },
  'LGBTQIA+ affirmative': { title: 'Spend time with people who get you', body: 'Make space this week for someone, or a community, where you can be fully yourself. Feeling seen matters.' },
  'Adoption support': { title: 'Write your questions down', body: 'Keep a running list of what is on your mind about the process. It helps you feel less overwhelmed and makes sessions more useful.' },
  'Child anxiety & worry': { title: 'Make worries small and talkable', body: 'Try a daily 10 minute "worry chat" where your child shares worries and you listen without fixing. Then move on to something fun.' },
  'Child low mood & withdrawal': { title: 'Do something side by side', body: 'Kids often open up while doing something together: a walk, cooking, drawing. Less eye contact, more conversation.' },
  'Behavioural challenges': { title: 'Catch them being good', body: 'Notice and name good behaviour out loud several times a day. It works faster than correcting the difficult moments.' },
  'ADHD & attention': { title: 'Break tasks into tiny steps', body: 'Turn one task into small, visible steps on a list your child can tick off. Short bursts with breaks work best.' },
  'Friendships & social skills': { title: 'Practise one small hello', body: 'Role-play a simple greeting or question at home, then cheer any small try with a classmate this week.' },
  'Child trauma': { title: 'Keep the day predictable', body: 'Regular meals, bedtimes and routines help a child feel safe again. Gently tell them what is coming next.' },
  'Screen time & routines': { title: 'Agree screen-free zones', body: 'Pick two screen-free times together, like meals and the hour before bed, and keep them for the whole family.' },
  'School & learning': { title: 'Short, regular study bursts', body: 'Twenty focused minutes, then a short break, works better than long sessions. Praise the effort, not just the marks.' },
  'Conflict & communication': { title: 'Try a 20 minute check-in', body: 'Once this week, sit together for 20 minutes. Each takes 10 to share while the other only listens, then swap.' },
  'Emotional distance': { title: 'Six seconds of connection', body: 'Greet each other with a proper six second hug or kiss each day. Small rituals of connection rebuild closeness.' },
  'Trust & infidelity': { title: 'Agree what you will talk about', body: 'Before hard conversations, agree a time limit and one topic. It keeps things safe enough to keep talking.' },
  'Intimacy concerns': { title: 'Make time without pressure', body: 'Plan relaxed time together with no expectations attached. Closeness grows best when nothing has to happen.' },
  'Separation & breakups': { title: 'Lean on one steady person', body: 'Choose one friend or family member to check in with this week. You do not have to carry this alone.' },
  'Psychiatric evaluation': { title: 'Keep a simple daily log', body: 'For a week, note your mood, sleep and energy each day out of 10. It gives your psychiatrist a clear picture.' },
  'Medication management': { title: 'List what you take', body: 'Write down any medicines and supplements you take, with doses, to bring to your first consultation.' },
}

const FALLBACK: Record<FlowId, Tip[]> = {
  adult: [
    { title: 'Breathe slowly for two minutes', body: 'Breathe in for 4 counts and out for 6. Longer out-breaths calm the body within a couple of minutes.' },
    { title: 'Move a little every day', body: 'A 15 minute walk, ideally outside, lifts mood and clears the head.' },
    { title: 'Write it down', body: 'Spend five minutes a day writing whatever is on your mind. Getting it out of your head makes it lighter.' },
  ],
  psychiatry: [
    { title: 'Keep a simple daily log', body: 'For a week, note your mood, sleep and energy each day out of 10. It gives your psychiatrist a clear picture.' },
    { title: 'List what you take', body: 'Write down any medicines and supplements you take, with doses, to bring to your first consultation.' },
    { title: 'Note your questions', body: 'Keep a list of questions as they come up, so nothing is forgotten when you meet.' },
  ],
  child: [
    { title: 'Ten minutes of special time', body: 'Give your child 10 minutes a day of your full attention on something they choose.' },
    { title: 'Keep the day predictable', body: 'Regular meals, bedtimes and routines help children feel settled.' },
    { title: 'Name feelings together', body: 'Help your child put feelings into words ("you look disappointed"). It builds emotional skills over time.' },
  ],
  couple: [
    { title: 'Try a 20 minute check-in', body: 'Each takes 10 minutes to share while the other only listens, then swap.' },
    { title: 'Notice one good thing', body: 'Tell your partner one thing you appreciated about them each day this week.' },
    { title: 'Pause hard conversations', body: 'If a talk heats up, agree to take 20 minutes apart and come back to it calmly.' },
  ],
}

/** Three ideas tied to their main needs, topped up with gentle general ones. */
export function tipsFor(r: AssessmentResult): Tip[] {
  const out: Tip[] = []
  const seen = new Set<string>()
  for (const n of r.needs) {
    const t = TIPS[n]
    if (t && !seen.has(t.title)) { out.push(t); seen.add(t.title) }
    if (out.length === 3) return out
  }
  for (const t of FALLBACK[r.flow]) {
    if (!seen.has(t.title)) { out.push(t); seen.add(t.title) }
    if (out.length === 3) break
  }
  return out
}

// ── Your first session ──────────────────────────────────────────────────────────

export function firstSessionSteps(flow: FlowId): { title: string; body: string }[] {
  const who = flow === 'couple' ? 'both of you' : flow === 'child' ? 'you (and your child, when ready)' : 'you'
  return [
    { title: 'Pick a time that suits you', body: 'Choose a slot from your clinician’s calendar. Evenings and weekends are often available.' },
    { title: 'Meet online, from anywhere', body: `A private 45 minute video session for ${who}. No preparation needed.` },
    { title: 'Talk about what brings you', body: 'Your clinician listens first, asks gentle questions, and helps you name what you would like to change.' },
    { title: 'Leave with a simple plan', body: 'You agree the next steps together, and your getCalmly app keeps track of check-ins and progress between sessions.' },
  ]
}
