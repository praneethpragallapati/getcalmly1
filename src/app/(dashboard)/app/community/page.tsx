import Link from 'next/link'
import { ArrowBigUp, MessageCircle, ShieldCheck } from 'lucide-react'
import { getCommunityPosts } from '@/lib/community'
import { CommunityComposer } from '@/components/dashboard/CommunityComposer'

const CLINICAL_ROLES = new Set(['Therapist', 'Psychiatrist', 'Admin'])

export default async function CommunityPage() {
  const posts = await getCommunityPosts()

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Community</h1>
        <span className="page-meta">{posts.length} discussions · kind & moderated</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          {posts.map((p) => (
            <Link href={`/community/${p.id}`} key={p.id} className="disc">
              <div className="disc-vote">
                <ArrowBigUp size={18} />
                <span>{p.upvotes}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="disc-title">{p.title}</div>
                <div className="disc-body">{p.body}</div>
                <div className="disc-meta">
                  <span className="comm-avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
                    {p.author.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    {p.author}
                    {CLINICAL_ROLES.has(p.role) && (
                      <ShieldCheck size={12} style={{ color: 'var(--c-green)', marginLeft: 4, verticalAlign: 'middle' }} />
                    )}
                  </span>
                  <span className="disc-dot">·</span>
                  <span>{p.role}{p.tenure ? ` · ${p.tenure}` : ''}</span>
                  <span className="disc-dot">·</span>
                  <span>{p.date}</span>
                  <span className="disc-comments">
                    <MessageCircle size={13} /> {p.comments}
                  </span>
                </div>
                {p.tags.length > 0 && (
                  <div className="tag-row" style={{ marginTop: 8 }}>
                    {p.tags.map((tag) => (
                      <span className="tag t-purple" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <CommunityComposer />
      </div>
    </>
  )
}
