'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { sendCalmAiMessage } from '@/app/(dashboard)/app/actions'
import type { ChatMessage } from '@/lib/calmAi'

const PROMPTS = [
  'I’ve been feeling anxious lately',
  'Help me prepare for my session',
  'I couldn’t sleep again',
  'Today was actually a good day',
]

/**
 * Calm AI chat thread (#11). Persists via sendCalmAiMessage. Replies are a
 * transparent rule-based stand-in until the model integration lands.
 */
export function CalmAiChat({ initial }: { initial: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial)
  const [input, setInput] = useState('')
  const [pending, startTransition] = useTransition()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  function send(text: string) {
    const content = text.trim()
    if (!content || pending) return
    setInput('')
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content }])
    startTransition(async () => {
      const res = await sendCalmAiMessage(content)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: res.reply ?? res.error ?? 'Sorry, I couldn’t respond just now.',
        },
      ])
    })
  }

  return (
    <div className="chat">
      <div className="chat-thread">
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            {m.role === 'assistant' && (
              <span className="chat-avatar">
                <Sparkles size={15} />
              </span>
            )}
            <div className="chat-bubble">{m.content}</div>
          </div>
        ))}
        {pending && (
          <div className="chat-msg assistant">
            <span className="chat-avatar">
              <Sparkles size={15} />
            </span>
            <div className="chat-bubble typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="chat-prompts">
          {PROMPTS.map((p) => (
            <button key={p} type="button" className="chat-prompt" onClick={() => send(p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what’s on your mind…"
          aria-label="Message Calm AI"
        />
        <button className="btn btn-primary" type="submit" disabled={pending || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
      <p className="chat-disclaimer">
        Calm AI is a supportive companion, not a replacement for your expert or emergency care.
      </p>
    </div>
  )
}
