'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { updateJournalEntry, deleteJournalEntry } from '@/app/(dashboard)/app/actions'
import { JOURNAL_MAX_CHARS, JOURNAL_TITLE_MAX, JOURNAL_READ_LABEL, type JournalDetail } from '@/lib/journal'

const MOODS = ['Calm', 'Good', 'Okay', 'Low', 'Anxious']

/**
 * The full journal entry, with the patient's own edit and delete controls.
 * Reading is the default; Edit swaps in an inline form, Delete asks once.
 */
export function JournalEntryView({ entry }: { entry: JournalDetail }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [title, setTitle] = useState(entry.title === 'Untitled entry' ? '' : entry.title)
  const [content, setContent] = useState(entry.content)
  const [mood, setMood] = useState(entry.moodTag ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()

  function save() {
    setError(null)
    startSave(async () => {
      const res = await updateJournalEntry({ id: entry.id, title, content, moodTag: mood || null })
      if (res.ok) { setEditing(false); router.refresh() }
      else setError(res.error ?? 'Could not save.')
    })
  }
  function remove() {
    setError(null)
    startDelete(async () => {
      const res = await deleteJournalEntry(entry.id)
      if (res.ok) router.push('/app/journal')
      else { setError(res.error ?? 'Could not delete.'); setConfirmDel(false) }
    })
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          className="entry-input" placeholder="Give it a title (optional)" maxLength={JOURNAL_TITLE_MAX}
          value={title} onChange={(e) => setTitle(e.target.value.slice(0, JOURNAL_TITLE_MAX))}
        />
        {title.length >= JOURNAL_TITLE_MAX - 15 && (
          <div style={{ fontSize: 11.5, color: title.length >= JOURNAL_TITLE_MAX ? 'var(--c-coral-d)' : 'var(--c-gray)', textAlign: 'right' }}>
            {title.length} / {JOURNAL_TITLE_MAX}
          </div>
        )}
        <textarea
          className="entry-input" rows={12} maxLength={JOURNAL_MAX_CHARS}
          value={content} onChange={(e) => setContent(e.target.value.slice(0, JOURNAL_MAX_CHARS))}
        />
        <div style={{ fontSize: 11.5, color: content.length >= JOURNAL_MAX_CHARS ? 'var(--c-coral-d)' : 'var(--c-gray)', textAlign: 'right' }}>
          {content.length.toLocaleString('en-IN')} / {JOURNAL_MAX_CHARS.toLocaleString('en-IN')} · {JOURNAL_READ_LABEL}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MOODS.map((m) => (
            <button key={m} type="button" onClick={() => setMood(mood === m ? '' : m)} className={`tag${mood === m ? ' t-purple' : ''}`}
              style={{ cursor: 'pointer', border: '1px solid var(--c-line)', background: mood === m ? undefined : 'var(--c-white)' }}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <button className="btn btn-primary" type="button" onClick={save} disabled={saving}>
            <Check size={15} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => { setEditing(false); setError(null) }}>Cancel</button>
          {error && <span style={{ fontSize: 12.5, color: 'var(--c-coral-d)', fontWeight: 600 }}>{error}</span>}
        </div>
      </div>
    )
  }

  return (
    <>
      {(entry.moodTag || entry.topicTags.length > 0) && (
        <div className="entry-tags" style={{ marginTop: 0, marginBottom: 16 }}>
          {entry.moodTag && <span className="tag">{entry.moodTag}</span>}
          {entry.topicTags.map((t) => <span className="tag t-purple" key={t}>{t}</span>)}
        </div>
      )}
      <div className="journal-body">{entry.content}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--c-line)', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(true)}>
          <Pencil size={14} /> Edit
        </button>
        {!confirmDel ? (
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setConfirmDel(true)} style={{ color: 'var(--c-coral-d)' }}>
            <Trash2 size={14} /> Delete
          </button>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Delete this entry?</span>
            <button className="btn btn-sm" type="button" onClick={remove} disabled={deleting}
              style={{ background: 'var(--c-coral-d)', color: '#fff' }}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setConfirmDel(false)}><X size={14} /> Keep</button>
          </span>
        )}
        {error && <span style={{ fontSize: 12.5, color: 'var(--c-coral-d)', fontWeight: 600 }}>{error}</span>}
      </div>
    </>
  )
}
