import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community — Safe, Moderated Peer Support | getCalmly',
  description:
    'Join a safe, human-moderated community of people who understand. Share, listen and find support across anxiety, work wellness, mindfulness and more.',
  alternates: { canonical: '/community' },
}

const groups = [
  { icon: '😰', bg: 'var(--coral-pale)', t: 'Anxiety Warriors', s: 'Coping strategies & lived experiences', n: '1.2k members' },
  { icon: '💼', bg: '#FFF8E7', t: 'Work Wellness', s: 'Burnout, stress & setting boundaries', n: '876 members' },
  { icon: '🧘', bg: 'var(--green-pale)', t: 'Mindfulness & Meditation', s: 'Daily practices & guided sessions', n: '3.4k members' },
  { icon: '🕊️', bg: '#EEF0FB', t: 'Depression Support Circle', s: 'A gentle space to be heard', n: '2.1k members' },
]

export default function CommunityPage() {
  return (
    <section className="comm-section" id="community">
      <div className="comm-layout">
        <div className="comm-right reveal">
          <div className="sec-label">Community</div>
          <h2 className="sec-h2">You’re not alone<br />in <span>any of this.</span></h2>
          <p className="sec-p">
            A safe, moderated community of people who truly get it. Share, listen, and find support
            that only comes from lived experience. Crisis support is built in — not bolted on.
          </p>
          <div className="comm-groups" style={{ marginTop: 28 }}>
            {groups.map((g) => (
              <div className="cg" key={g.t}>
                <div className="cg-icon" style={{ background: g.bg }}>{g.icon}</div>
                <div>
                  <div className="cg-t">{g.t}</div>
                  <div className="cg-s">{g.s}</div>
                </div>
                <div className="cg-ct">{g.n}</div>
              </div>
            ))}
          </div>
          <Link href="/assess" className="btn-primary">Join the community free →</Link>
        </div>
        <div className="comm-posts reveal d2">
          <div className="comm-post">
            <div className="cp-top"><div className="cp-av">M</div><div><div className="cp-nm">meera_k</div><div className="cp-grp">Anxiety Warriors</div></div></div>
            <div className="cp-text">Has anyone tried the 5-4-3-2-1 grounding technique? It’s been a game-changer for my panic attacks. Happy to share how I use it 🌿</div>
            <div className="cp-acts"><span className="cp-act liked">❤️ 34</span><span className="cp-act">💬 12 replies</span></div>
          </div>
          <div className="comm-post">
            <div className="cp-top"><div className="cp-av" style={{ background: 'var(--green-pale)', color: 'var(--green)' }}>A</div><div><div className="cp-nm">arjun_22</div><div className="cp-grp">Work Wellness</div></div></div>
            <div className="cp-text">Finally set a boundary with my manager about after-hours messages. It felt terrifying but so necessary. Small win for today 🙌</div>
            <div className="cp-acts"><span className="cp-act">❤️ 58</span><span className="cp-act">💬 7 replies</span></div>
          </div>
          <div className="comm-post">
            <div className="cp-top"><div className="cp-av" style={{ background: '#EEF0FB', color: '#7B7FCC' }}>S</div><div><div className="cp-nm">shruti.m</div><div className="cp-grp">Depression Support Circle</div></div></div>
            <div className="cp-text">3 months into therapy and I actually laughed at something today. I forgot what that felt like. Progress isn’t always loud 🕊️</div>
            <div className="cp-acts"><span className="cp-act">❤️ 142</span><span className="cp-act">💬 31 replies</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
