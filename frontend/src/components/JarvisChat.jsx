import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, ChevronDown } from 'lucide-react'

// ─── Starter messages & quick suggestions ────────────────────────────────────

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    content:
      "Hi, I'm JARVIS — your supply chain AI. I monitor global risk signals 24/7 and can answer questions about your suppliers, active disruptions, or cost exposure. What would you like to know?",
  },
]

const SUGGESTIONS = [
  "What's the highest risk event right now?",
  "Summarize TSMC's risk factors",
  "Weather events affecting Asia?",
]

// Pre-canned intelligent responses for demo
const CANNED = {
  "What's the highest risk event right now?":
    "The most critical event right now is the **factory fire at Shenzhen Industrial Zone** (severity 9.2 / 10). It's affecting 3 of your tier-1 suppliers and has halted approximately 40% of regional output. I recommend activating your Shenzhen contingency protocol and contacting backup suppliers in Vietnam immediately.",

  "Summarize TSMC's risk factors":
    "TSMC's current risk score is **78 / 100** — HIGH. Key drivers: (1) Taiwan Strait geopolitical tension has elevated this week. (2) Two typhoons are in the 7-day forecast range. (3) Recent US export-control changes may tighten next quarter. Recommendation: increase safety stock of TSMC-sourced components by 15–20% over the next 30 days.",

  "Weather events affecting Asia?":
    "Two active weather events: **Typhoon Haikui (Cat. 2)** is tracking toward the Philippines with an ETA of ~48 hours — this may disrupt Foxconn's Manila operations. Additionally, **flooding in Malaysia** is causing delays at Port Klang with 2–3 day holds on outbound shipments. Combined estimated financial exposure: **$340K**.",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JarvisChat() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  function sendMessage(text) {
    const msg = (text ?? input).trim()
    if (!msg || typing) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    setTimeout(() => {
      const reply =
        CANNED[msg] ??
        `I've scanned 65,000+ sources for "${msg}". Based on current signals, I'm detecting a moderate risk pattern in related regions. Would you like me to drill into a specific supplier, country, or risk category?`

      setTyping(false)
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: reply },
      ])
    }, 1100)
  }

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-[76px] right-6 w-[380px] h-[520px] flex flex-col rounded-2xl border border-blue-900/40 bg-[#0d1530] shadow-2xl shadow-blue-900/50 z-50 overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 bg-[#080d1a] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#080d1a]" />
              </div>
              <div>
                <div className="text-sm font-bold leading-none">JARVIS</div>
                <div className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  Supply Chain AI · Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>

                {/* Avatar for assistant */}
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-[#111827] border border-white/5 text-slate-300 rounded-bl-sm'
                    }`}
                >
                  {/* Render **bold** markers simply */}
                  {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                      : part
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="bg-[#111827] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 140}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions (shown only at start) */}
          {messages.length <= 1 && !typing && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-blue-800/40 text-blue-400 hover:bg-blue-900/20 hover:border-blue-600/50 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 border-t border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2 bg-[#080d1a] rounded-xl border border-white/8 px-3 py-2 focus-within:border-blue-700/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask JARVIS anything…"
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 z-50
          ${open
            ? 'bg-[#0d1530] border border-blue-900/40 shadow-blue-900/30'
            : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-600/40 hover:shadow-blue-500/50 hover:-translate-y-0.5'
          }`}
        style={{ width: '52px', height: '52px' }}
        title="JARVIS AI"
      >
        {open
          ? <ChevronDown className="w-5 h-5 text-slate-300" />
          : <MessageSquare className="w-5 h-5 text-white" />
        }

        {/* Unread badge */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ width: '18px', height: '18px' }}>
            3
          </span>
        )}
      </button>
    </>
  )
}
