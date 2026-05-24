import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const QUICK_PROMPTS = [
  "Summarize my client portfolio performance today",
  "What are the top risks in my book?",
  "Prepare a client 360 summary for Sarah Chen",
  "Which clients need rebalancing?",
  "Run a compliance check on my book",
  "What are my cross-sell opportunities?",
  "Show clients with recent life events",
  "What is the market outlook today?",
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--blue)' : 'var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isUser ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
      </div>
      <div style={{
        maxWidth: '75%', padding: '12px 16px', borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        background: isUser ? 'var(--green2)' : 'var(--bg2)',
        border: isUser ? 'none' : '1px solid var(--border)',
        fontSize: 13, lineHeight: 1.7, color: 'var(--text)'
      }}>
        <ReactMarkdown
          components={{
            p: ({children}) => <p style={{marginBottom: 8, lastChild: {marginBottom: 0}}}>{children}</p>,
            strong: ({children}) => <strong style={{fontWeight: 600, color: 'white'}}>{children}</strong>,
            ul: ({children}) => <ul style={{paddingLeft: 18, marginBottom: 8}}>{children}</ul>,
            li: ({children}) => <li style={{marginBottom: 4}}>{children}</li>,
            code: ({children}) => <code style={{fontFamily: 'var(--mono)', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontSize: 12}}>{children}</code>,
          }}
        >{msg.content}</ReactMarkdown>
        {msg.timestamp && (
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
            {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm your **Advisor AI Concierge**. I have full access to your client book, portfolio data, and compliance alerts.\n\nAsk me anything about your clients, portfolios, risks, or revenue opportunities. Try one of the quick prompts below to get started!",
    timestamp: new Date().toISOString()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await chatAPI.sendMessage(msg, sessionId)
      const { reply, session_id } = res.data
      setSessionId(session_id)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }])
    } catch (e) {
      const errMsg = e.response?.data?.detail || 'Something went wrong. Please check that your ANTHROPIC_API_KEY is set in the backend .env file.'
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${errMsg}`, timestamp: new Date().toISOString() }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={16} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>AI Concierge</div>
          <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
            Connected to your book · Groq AI
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={14} color="white" />
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: 13 }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.slice(0, 4).map(p => (
          <button key={p} onClick={() => send(p)} disabled={loading} style={{
            padding: '6px 12px', background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 20, fontSize: 12, color: 'var(--text2)', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 5
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
            <Sparkles size={11} />
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '8px 8px 8px 16px' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ask about clients, portfolios, compliance, revenue..." rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontSize: 13, color: 'var(--text)', lineHeight: 1.6, maxHeight: 120,
              fontFamily: 'var(--font)'
            }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            width: 34, height: 34, borderRadius: 8, background: input.trim() && !loading ? 'var(--green)' : 'var(--bg4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s'
          }}>
            {loading ? <Loader2 size={15} color="var(--text3)" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} color={input.trim() ? 'white' : 'var(--text3)'} />}
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · Powered by Groq AI
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
