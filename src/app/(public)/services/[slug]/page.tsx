import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type ServiceSlug = 'therapy' | 'couples' | 'child' | 'maternal' | 'psychiatry' | 'assessments' | 'specialised'

const services: Record<ServiceSlug, {
  icon: string
  accent: string
  pale: string
  title: string
  tagline: string
  question: string
  hero: string
  stat: { big: string; label: string }
  recognise: string[]
  why: string
  items: { name: string; desc: string }[]
  whoFor: string[]
  faq: { q: string; a: string }[]
  cta: string
}> = {
  therapy: {
    icon: '🧠',
    accent: '#C8553D',
    pale: 'rgba(200,85,61,.08)',
    title: 'Individual Therapy',
    tagline: 'For when things feel too heavy to carry alone.',
    question: 'Is it just stress — or something more?',
    hero: 'You\'ve probably been holding it together for a while now. Doing fine on the outside while something heavier is happening underneath. Therapy isn\'t a sign things have gone wrong, it\'s what makes things go right.',
    stat: { big: '1 in 7', label: 'adults in India live with a mental health condition — and most never get the support they deserve.' },
    recognise: [
      '"I\'m fine," I keep saying — even when I\'m not.',
      'I lie awake replaying conversations from years ago.',
      'I get through the day, but I barely feel anything.',
      'Everyone leans on me. I have no one to lean on.',
    ],
    why: 'Our therapists are RCI-licensed clinical psychologists with experience in evidence-based approaches: CBT, DBT, trauma-focused care, and more. Sessions are 50 minutes, online, and completely confidential.',
    items: [
      { name: 'Anxiety & Overthinking', desc: 'Racing thoughts, constant worry, the feeling that something\'s about to go wrong, we help you slow it down.' },
      { name: 'Depression', desc: 'When the flatness won\'t lift. When motivation disappears. When you feel disconnected from your own life.' },
      { name: 'Stress & Burnout', desc: 'Work has taken over. Your body is running on empty. You\'ve forgotten what "okay" feels like.' },
      { name: 'Trauma & Grief', desc: 'Something happened, and it changed you. Or someone is gone, and the world doesn\'t feel right anymore.' },
      { name: 'OCD', desc: 'The loop of thoughts and rituals that steals hours from your day. Structured therapy can break that cycle.' },
      { name: 'Anger', desc: 'Anger that feels out of proportion. Reactions you regret. Therapy helps you understand what\'s underneath.' },
      { name: 'Sleep Issues', desc: 'When sleep becomes a struggle and exhaustion runs everything, CBT-I and other approaches help.' },
      { name: 'Life Transitions', desc: 'A new city, a new role, a relationship that ended. Big changes bring big feelings, therapy helps you move through them.' },
    ],
    whoFor: ['Adults 18+', 'Working professionals', 'Students', 'People navigating major life changes'],
    faq: [
      { q: 'How many sessions will I need?', a: 'Most people start to notice a difference in 4–8 sessions. Longer-term support depends on your goals, your therapist will discuss this with you.' },
      { q: 'What if I don\'t click with my therapist?', a: 'That happens, and that\'s okay. Just let us know and we\'ll re-match you, no awkwardness, no charges.' },
      { q: 'Is this confidential?', a: 'Completely. Nothing you share leaves the session, except in rare cases where there is a serious safety concern, which your therapist will explain at the start.' },
    ],
    cta: 'Book a free first session',
  },
  couples: {
    icon: '💑',
    accent: '#7C5CBF',
    pale: 'rgba(124,92,191,.08)',
    title: 'Couples & Relationship Counselling',
    tagline: 'Because good relationships take work, and that\'s not a failure.',
    question: 'When did talking become so hard?',
    hero: 'Every relationship goes through seasons. Sometimes those seasons are hard, more arguments, more distance, more silence. Couples therapy isn\'t about deciding who\'s right. It\'s about finding a way forward, together or apart, with clarity.',
    stat: { big: '69%', label: 'of relationship conflicts are never fully resolved — the goal was never winning. It\'s understanding.' },
    recognise: [
      'We have the same fight, over and over.',
      'We\'re more like roommates than partners now.',
      'I don\'t feel heard anymore.',
      'I can\'t tell if we\'re growing apart or just tired.',
    ],
    why: 'Our couples therapists use Emotionally Focused Therapy (EFT) and Gottman-informed approaches to help you understand each other at a deeper level, not just fix surface arguments.',
    items: [
      { name: 'Communication & Conflict', desc: 'The same fight on repeat, no matter the topic. Therapy helps you break the cycle and actually hear each other.' },
      { name: 'Rebuilding Trust', desc: 'After a betrayal, trust doesn\'t come back automatically. But with the right support, it can.' },
      { name: 'Separation / Divorce', desc: 'When staying together isn\'t the answer, we help you navigate the process with care and clarity, especially if children are involved.' },
      { name: 'Breakup Support', desc: 'Processing a painful ending. Understanding what happened. Finding your footing again.' },
      { name: 'Pre-marital Counselling', desc: 'Start with intention. Pre-marital sessions help couples understand each other before marriage, not after problems arise.' },
      { name: 'Intimacy Concerns', desc: 'Physical or emotional distance that\'s grown over time, therapy creates space to talk about what\'s hard to say.' },
    ],
    whoFor: ['Couples (married or otherwise)', 'People going through breakups', 'Pre-marital couples'],
    faq: [
      { q: 'Does my partner have to come?', a: 'For couples sessions, yes, but we also offer individual therapy to help you navigate a relationship from your own side.' },
      { q: 'What if one of us is reluctant?', a: 'Very common. Starting with your own individual sessions first is often a good path.' },
      { q: 'Can therapy save our relationship?', a: 'It depends on what you both want. Therapy creates clarity, sometimes that means coming back together, sometimes it means separating with more understanding.' },
    ],
    cta: 'Book a free first session',
  },
  child: {
    icon: '🌱',
    accent: '#3D9E72',
    pale: 'rgba(61,158,114,.08)',
    title: 'Children & Adolescent Therapy',
    tagline: 'They\'re not "just going through a phase."',
    question: 'Is my child okay — or is this more than a phase?',
    hero: 'You know your child. And when something feels off, whether they\'re withdrawn, anxious, acting out, or just not themselves, you\'re usually right to be concerned. Child therapy gives them a safe, judgment-free space to understand what they\'re feeling, in age-appropriate ways.',
    stat: { big: '50%', label: 'of all mental health conditions begin by age 14 — which is exactly why early support changes everything.' },
    recognise: [
      'My child just isn\'t themselves lately.',
      'The meltdowns are getting harder to reach.',
      'They say they\'re fine, but I can tell they\'re not.',
      'School has quietly become a daily battle.',
    ],
    why: 'Our child specialists use play therapy, art therapy, and CBT adapted for younger minds. They work with both the child and, where helpful, the parents, because children heal in the context of their relationships.',
    items: [
      { name: 'Anxiety & Worry', desc: 'School anxiety, separation anxiety, social fears, children experience anxiety differently, and they need a therapist who gets that.' },
      { name: 'Low Mood', desc: 'A child who\'s lost their spark. Who doesn\'t want to play anymore. Who cries without being able to say why.' },
      { name: 'Exam Stress', desc: 'Pressure to perform is real, and it lands hard on students. We help them manage it rather than be crushed by it.' },
      { name: 'ADHD Support', desc: 'Structure, coping strategies, and self-understanding for children with attention difficulties, and support for parents too.' },
      { name: 'Behavioural Challenges', desc: 'Aggression, defiance, emotional outbursts, often these are communication. Therapy helps decode them.' },
      { name: 'Adolescent Identity', desc: 'Teenagers figuring out who they are, identity, sexuality, belonging. A non-judgmental therapist makes that safer.' },
      { name: 'Grief & Loss', desc: 'Children grieve differently. A pet, a grandparent, a divorce, therapy helps them process loss at their own pace.' },
      { name: 'Family Change', desc: 'Divorce, relocation, a new sibling. Children often absorb the stress of family transitions. Therapy helps them find stability.' },
    ],
    whoFor: ['Children ages 4–17', 'Parents who notice a change', 'Teenagers navigating identity and pressure'],
    faq: [
      { q: 'Will my child have to talk about difficult things?', a: 'Not necessarily right away. Child therapists are trained to meet children where they are, through play, drawing, or just talking about day-to-day life.' },
      { q: 'Will I know what happens in sessions?', a: 'Your therapist will keep you informed about themes and progress, while maintaining the child\'s trust. The balance depends on the child\'s age.' },
      { q: 'What if my child doesn\'t want to go?', a: 'That\'s very common. Many children warm up once they\'ve met the therapist. A free intro call can help break the ice.' },
    ],
    cta: 'Book a free intro session',
  },
  maternal: {
    icon: '🤱',
    accent: '#D98C5F',
    pale: 'rgba(217,140,95,.10)',
    title: 'Motherhood & Postpartum Care',
    tagline: 'Everyone asks about the baby. We ask about you.',
    question: 'Why doesn\'t this feel the way it\'s "supposed" to?',
    hero: 'From the outside, you\'re doing everything right. Inside, you might feel anxious, numb, overwhelmed, or like a stranger to yourself. Pregnancy and the months after birth bring some of the biggest emotional shifts a person can go through, and almost nobody talks about how hard they can be. You don\'t have to pretend you\'re fine.',
    stat: { big: '1 in 5', label: 'new mothers experience a perinatal mood or anxiety disorder. If this is you, you are far from alone.' },
    recognise: [
      'I love my baby, but I don\'t feel like myself.',
      'I cry, and I can\'t always explain why.',
      'I feel guilty for not being happier.',
      'Everyone asks about the baby. No one asks about me.',
    ],
    why: 'Our maternal mental health specialists are trained in perinatal care, they understand the hormonal, physical, and identity changes of pregnancy and postpartum. This isn\'t generic therapy with a baby mentioned occasionally. It\'s care built for this exact season of life.',
    items: [
      { name: 'Prenatal Anxiety', desc: 'Worry that goes beyond normal nerves, about the baby, the birth, whether you\'ll be enough. We help you carry it more gently.' },
      { name: 'Postpartum Depression', desc: 'The sadness that doesn\'t lift, the disconnection from your baby or yourself. It\'s common, it\'s real, and it\'s very treatable.' },
      { name: 'Birth Trauma', desc: 'When the birth didn\'t go the way it should have, and it left a mark. Processing it helps you move forward.' },
      { name: 'Identity & Role Shift', desc: 'Grieving the person you were before, while becoming someone new. That tension is real and worth talking about.' },
      { name: 'Parenting Overwhelm', desc: 'The relentlessness of it. The guilt. The touched-out exhaustion. A space to be honest without being judged.' },
      { name: 'Pregnancy Loss & Grief', desc: 'Miscarriage, stillbirth, or loss at any stage, grief that the world too often rushes you past. We sit with it at your pace.' },
      { name: 'Fertility Stress', desc: 'The emotional weight of trying, waiting, and treatment cycles. Support for the toll it takes on you and your relationship.' },
    ],
    whoFor: ['Expectant mothers', 'New mothers (and partners)', 'Anyone navigating pregnancy loss', 'People going through fertility treatment'],
    faq: [
      { q: 'Is it normal to feel this way after having a baby?', a: 'More normal than anyone tells you. Up to 1 in 7 mothers experience postpartum depression, and many more feel anxious or overwhelmed. Feeling this way is not a reflection of your love for your child.' },
      { q: 'Can my partner join sessions?', a: 'Yes. Partners are often deeply affected too, and including them can help. We also offer support specifically for partners.' },
      { q: 'I had a loss a while ago. Is it too late to seek help?', a: 'Never. Grief doesn\'t follow a timeline. Whether it was weeks or years ago, support is available whenever you\'re ready.' },
    ],
    cta: 'Talk to a maternal specialist',
  },
  psychiatry: {
    icon: '💊',
    accent: '#1A7F7A',
    pale: 'rgba(26,127,122,.08)',
    title: 'Psychiatry',
    tagline: 'Sometimes the brain needs medical support too.',
    question: 'Have you done the work, but still feel stuck?',
    hero: 'Therapy is powerful. But for some conditions, persistent depression, OCD, bipolar disorder, or severe anxiety, medication alongside therapy makes a meaningful difference. Our psychiatrists are here to evaluate, diagnose, and support you with the right medical care.',
    stat: { big: '60%', label: 'of people with depression respond significantly better to therapy and medication combined than to either alone.' },
    recognise: [
      'Therapy helps, but something still isn\'t shifting.',
      'I\'m not sure my current medication is right for me.',
      'I want a real diagnosis, not guesswork.',
      'I think I\'ve been managing this undiagnosed for years.',
    ],
    why: 'All our psychiatrists are registered with the National Medical Commission (NMC). They work collaboratively with your therapist to ensure your care is joined-up, not fragmented.',
    items: [
      { name: 'Diagnosis & Evaluation', desc: 'A thorough assessment to understand what you\'re experiencing and whether a diagnosis applies, without rushing to labels.' },
      { name: 'Medication Management', desc: 'If medication is right for you, we manage it carefully: starting low, monitoring closely, and adjusting as needed.' },
      { name: 'Second Opinion', desc: 'Already on medication and not sure it\'s right? Our psychiatrists provide independent evaluations.' },
      { name: 'Follow-up Care', desc: 'Regular check-ins to track your progress and adjust treatment as your life changes.' },
      { name: 'OCD / Bipolar / Schizophrenia', desc: 'Serious mental health conditions need serious, sustained care. We\'re equipped for it.' },
      { name: 'ADHD (Adult)', desc: 'Adult ADHD is frequently undiagnosed. Evaluation and treatment can change your relationship with work, focus, and yourself.' },
    ],
    whoFor: ['People who haven\'t responded to therapy alone', 'Those seeking a diagnosis', 'Anyone wanting a medication review or second opinion'],
    faq: [
      { q: 'Do I need a referral?', a: 'No. You can book a psychiatry session directly through GetCalmly.' },
      { q: 'Will I definitely be put on medication?', a: 'Not at all. Evaluation comes first. Our psychiatrists only recommend medication when they believe the benefits clearly outweigh the risks.' },
      { q: 'Can I see a psychiatrist and a therapist at the same time?', a: 'Yes, and it\'s often the most effective approach. We coordinate between them.' },
    ],
    cta: 'Book a psychiatric evaluation',
  },
  assessments: {
    icon: '📋',
    accent: '#C9973A',
    pale: 'rgba(201,151,58,.08)',
    title: 'Psychological Assessments',
    tagline: 'A clearer picture changes everything.',
    question: 'What if you could finally understand why?',
    hero: 'Sometimes you just need to understand what\'s going on. Not a diagnosis to carry around, a map. A good psychological assessment gives you and your professional a clearer starting point, so care is targeted rather than guesswork.',
    stat: { big: '7+ yrs', label: 'is the average delay before adults receive an accurate ADHD diagnosis. Clarity shouldn\'t take that long.' },
    recognise: [
      'I\'ve always felt different, but never knew why.',
      'I want to understand my child, not label them.',
      'I keep guessing about myself. I want a real answer.',
      'I\'m at a crossroads and need clarity to decide.',
    ],
    why: 'Our assessments are administered by qualified clinical psychologists using validated tools. Reports are detailed, readable, and focused on what to do next, not just what\'s wrong.',
    items: [
      { name: 'ADHD Assessment', desc: 'For children and adults who suspect attention difficulties. Includes standardised tools and a clinical interview.' },
      { name: 'Anxiety & Depression Screening', desc: 'Validated questionnaires with clinical interpretation, not just a number, but what that number means for you.' },
      { name: 'Personality Profile', desc: 'A 5-factor personality assessment that reveals how you naturally operate, useful for self-understanding and relationships.' },
      { name: 'Emotional Intelligence', desc: 'Understand how you read emotions, regulate yourself, and connect with others. Useful for leaders, couples, and individuals alike.' },
      { name: 'Career Maturity (Students)', desc: 'For students at decision points, helps them understand their strengths, interests, and readiness for career choices.' },
      { name: 'Couples Assessment', desc: 'A structured way to understand compatibility, communication styles, and areas that need attention, often done before couples counselling.' },
      { name: 'Occupational Stress', desc: 'Understand the sources and impact of work stress, and what can be done about it.' },
    ],
    whoFor: ['Students at career crossroads', 'Parents seeking clarity about their child', 'Adults wanting a deeper understanding of themselves', 'Couples before counselling'],
    faq: [
      { q: 'How long does an assessment take?', a: 'Depends on the type, anywhere from 45 minutes to 3 hours. Your psychologist will explain before you book.' },
      { q: 'What happens with the report?', a: 'You receive a written report and a session to go through it together. It\'s yours to keep and share with other professionals if you choose.' },
      { q: 'Is this covered by insurance?', a: 'Some policies cover psychological assessments. We can provide the documentation you need to claim.' },
    ],
    cta: 'Book an assessment',
  },
  specialised: {
    icon: '🫶',
    accent: '#C04B8A',
    pale: 'rgba(192,75,138,.08)',
    title: 'Specialised Support',
    tagline: 'Life is not one-size-fits-all. Neither is care.',
    question: 'What if you didn\'t have to explain yourself first?',
    hero: 'Some experiences need a professional who truly understands the context, not a generalist who\'s read a chapter about it. Whether you\'re navigating a chronic illness, pregnancy, gender identity, or loss, we have professionals trained specifically for your situation.',
    stat: { big: 'Zero', label: 'times you should ever have to educate your own therapist on who you are before the real work can begin.' },
    recognise: [
      'I\'m tired of explaining my identity before therapy even starts.',
      'My situation needs someone who actually gets the context.',
      'I need a true specialist, not a generalist.',
      'I want to be understood, not just managed.',
    ],
    why: 'Our specialist roster includes professionals with advanced training in LGBTQIA+ affirmative care, perinatal mental health, palliative support, and clinical supervision. You\'ll never be asked to educate your therapist on who you are.',
    items: [
      { name: 'LGBTQIA+ Affirmative Care', desc: 'A space where you don\'t have to explain your identity before getting to what actually needs talking about. Our therapists are trained in affirmative, non-pathologising care.' },
      { name: 'Chronic & Terminal Illness', desc: 'Living with an ongoing or life-limiting illness changes everything. Psychological support helps you cope, adapt, and find meaning alongside medical care.' },
      { name: 'Grief & Bereavement', desc: 'There\'s no right way to grieve. Our specialists meet you wherever you are in the process, weeks, months, or years after a loss.' },
      { name: 'Geriatric Mental Health', desc: 'Older adults face distinct challenges, isolation, cognitive changes, end-of-life questions. Specialised care makes a real difference.' },
      { name: 'Clinical Supervision for Professionals', desc: 'Mental health professionals need support too. Individual and group supervision with experienced supervisors, including research guidance.' },
    ],
    whoFor: ['LGBTQIA+ individuals', 'People living with chronic illness', 'Older adults & families', 'Mental health professionals seeking supervision'],
    faq: [
      { q: 'What does "affirmative care" mean in practice?', a: 'It means your therapist starts from a position of accepting and affirming your identity, not questioning it, not trying to change it. You come to work on your mental health, not to defend who you are.' },
      { q: 'Can I get support during pregnancy if I\'m already anxious?', a: 'Absolutely. Prenatal anxiety is common and very treatable. Early support often prevents more serious postnatal difficulties.' },
      { q: 'I\'m a therapist, is supervision confidential?', a: 'Yes. Clinical supervision follows the same confidentiality standards as therapy.' },
    ],
    cta: 'Find a specialist',
  },
}

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const s = services[slug as ServiceSlug]
  if (!s) return {}
  return {
    title: `${s.title} | GetCalmly`,
    description: s.hero.slice(0, 155),
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = services[slug as ServiceSlug]
  if (!s) notFound()

  const charcoal = '#1C2B3A'
  const cream = '#F9F5F2'

  const eyebrow: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: 2, color: s.accent, textTransform: 'uppercase' }

  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      {/* ─── HERO: question + normalising stat, side by side ─── */}
      <section style={{ background: charcoal, padding: '64px 48px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -140, right: -120, width: 460, height: 460, borderRadius: '50%', background: `radial-gradient(circle, ${s.pale.replace('.08)', '.16)').replace('.10)', '.16)')} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.45)', fontSize: 13, textDecoration: 'none', marginBottom: 40, fontWeight: 500 }}>
            ← All services
          </Link>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 64, alignItems: 'center' }}>
            <div>
              <p style={{ ...eyebrow, marginBottom: 20 }}>{s.title}</p>
              <h1 style={{
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 900, fontSize: 'clamp(34px, 5.4vw, 56px)',
                color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.04, marginBottom: 26, maxWidth: 620,
              }}>
                {s.question}
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,.72)', lineHeight: 1.78, maxWidth: 580, fontWeight: 300, marginBottom: 32 }}>{s.hero}</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/assess" style={{
                  padding: '14px 28px', borderRadius: 50, background: s.accent, color: '#fff',
                  fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif", boxShadow: `0 8px 24px ${s.accent}55`,
                }}>
                  ✦ Take the free assessment
                </Link>
                <Link href="/pricing" style={{
                  padding: '14px 26px', borderRadius: 50, background: 'transparent',
                  color: 'rgba(255,255,255,.85)', fontSize: 15, fontWeight: 600, textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.22)',
                }}>
                  {s.cta} →
                </Link>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(255,255,255,.10)' }}>
              <p style={{
                fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
                fontSize: 'clamp(48px, 6vw, 64px)', color: s.accent, lineHeight: 1, letterSpacing: '-1.5px', marginBottom: 14,
              }}>
                {s.stat.big}
              </p>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.65)', lineHeight: 1.65, fontWeight: 300 }}>
                {s.stat.label}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── YOU MIGHT RECOGNISE THIS: 2×2 grid, full width ─── */}
      <section style={{ background: '#fff', padding: '76px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 36, textAlign: 'center' }}>You might recognise this</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 56px' }}>
            {s.recognise.map((r, idx) => (
              <p key={r} style={{
                fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700,
                fontSize: 'clamp(20px, 2.6vw, 26px)', color: charcoal, lineHeight: 1.32,
                letterSpacing: '-0.4px', padding: '22px 0',
                borderTop: idx < 2 ? 'none' : '1px solid rgba(0,0,0,.07)',
              }}>
                {r}
              </p>
            ))}
          </div>
          <p style={{ fontSize: 16, color: '#6B7D8E', lineHeight: 1.7, fontWeight: 300, textAlign: 'center', marginTop: 32 }}>
            If any of this sounds familiar, you don&apos;t have to keep carrying it alone.
          </p>
        </div>
      </section>

      {/* ─── WHAT CARE LOOKS LIKE + WHO IT'S FOR: side by side ─── */}
      <section style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 38px)', color: charcoal, letterSpacing: '-0.5px', marginBottom: 22, lineHeight: 1.1 }}>
              What care looks like here.
            </h2>
            <p style={{ fontSize: 17, color: '#3A4A5A', lineHeight: 1.82, fontWeight: 300 }}>{s.why}</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 26px', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: charcoal, marginBottom: 18 }}>Who this is for</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {s.whoFor.map((w) => (
                <span key={w} style={{ padding: '8px 14px', borderRadius: 50, background: s.pale, color: s.accent, fontSize: 13.5, fontWeight: 600 }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE HELP WITH: grid, full width ─── */}
      <section style={{ background: '#fff', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 38px)', color: charcoal, letterSpacing: '-0.5px', marginBottom: 8 }}>
              What we help with
            </h2>
            <p style={{ fontSize: 16, color: '#6B7D8E', lineHeight: 1.7, fontWeight: 300 }}>
              Whatever you&apos;re carrying, there&apos;s a place to start.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 56px' }}>
            {s.items.map((it, idx) => (
              <div key={it.name} style={{
                display: 'grid', gridTemplateColumns: '12px 1fr', gap: 18, alignItems: 'flex-start',
                padding: '24px 0', borderTop: idx < 2 ? 'none' : '1px solid rgba(0,0,0,.07)',
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.accent, marginTop: 9 }} />
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: charcoal, marginBottom: 7, letterSpacing: '-0.2px' }}>{it.name}</p>
                  <p style={{ fontSize: 15, color: '#5A6B7A', lineHeight: 1.68, fontWeight: 300 }}>{it.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW CARE WORKS: 3-column, charcoal band ─── */}
      <section style={{ background: charcoal, padding: '80px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 20 }}>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', color: '#fff', letterSpacing: '-0.8px' }}>
              How it works
            </h2>
            <Link href="/assess" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: s.accent, color: '#fff',
              padding: '14px 26px', borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
            }}>
              ✦ Take the free assessment
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {[
              { n: '01', t: 'Tell us what\'s going on', d: 'A free 5-minute assessment — no login, no judgement. Just an honest starting point.' },
              { n: '02', t: 'Get matched, not assigned', d: 'We pair you with a professional who fits what you\'re going through, your language and your budget.' },
              { n: '03', t: 'Your first session is free', d: 'No card, no commitment. Just one real conversation to see if it feels right.' },
            ].map((step, i) => (
              <div key={step.n} style={{
                padding: '36px 32px',
                background: i % 2 === 0 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
                borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : 0,
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,.08)' : 'none',
              }}>
                <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 40, color: s.accent, opacity: 0.35, lineHeight: 1, marginBottom: 16 }}>{step.n}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.2px' }}>{step.t}</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.72, fontWeight: 300 }}>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ: wide divider list ─── */}
      <section style={{ padding: '80px 48px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 4vw, 34px)', color: charcoal, letterSpacing: '-0.5px', marginBottom: 28, textAlign: 'center' }}>
            Common questions
          </h2>
          <div>
            {s.faq.map((f, idx) => (
              <div key={f.q} style={{ padding: '26px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,.08)' }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: charcoal, marginBottom: 10, letterSpacing: '-0.2px' }}>{f.q}</p>
                <p style={{ fontSize: 15.5, color: '#5A6B7A', lineHeight: 1.75, fontWeight: 300 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ background: charcoal, padding: '80px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 16 }}>Your first session is free</p>
          <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)', color: '#fff', marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.05 }}>
            You don&apos;t have to figure this out alone.
          </h3>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.62)', marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>
            Take the 5-minute assessment and we&apos;ll match you with the right professional, or book directly if you already know what you need.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/assess" style={{
              padding: '15px 30px', borderRadius: 50, background: s.accent, color: '#fff',
              fontSize: 16, fontWeight: 700, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", boxShadow: `0 8px 24px ${s.accent}55`,
            }}>
              ✦ {s.cta}
            </Link>
            <Link href="/services" style={{
              padding: '15px 26px', borderRadius: 50, background: 'rgba(255,255,255,.08)',
              color: 'rgba(255,255,255,.75)', fontSize: 16, fontWeight: 600, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.18)',
            }}>
              View all services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
