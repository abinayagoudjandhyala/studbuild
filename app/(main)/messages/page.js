'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Suspense } from 'react'

// ─── Emoji Picker (lightweight inline) ───────────────────────────────────────
const EMOJI_LIST = ['😊','😂','❤️','👍','🔥','🎉','😍','🙌','💯','😅',
  '🤔','😭','✨','🚀','💡','🎯','👋','😎','🤝','💪',
  '😢','😡','🥳','😴','🤩','🫡','👀','🙏','💬','⚡']

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
      background: '#0d1120', border: '1px solid #1f2d45', borderRadius: 14,
      padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)',
      gap: 4, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {EMOJI_LIST.map(e => (
        <button key={e} onClick={() => { onSelect(e); onClose() }} style={{
          background: 'none', border: 'none', fontSize: '1.3rem',
          cursor: 'pointer', padding: '4px', borderRadius: 8,
          transition: 'background 0.15s', lineHeight: 1
        }}
          onMouseEnter={el => el.target.style.background = 'rgba(79,142,247,0.15)'}
          onMouseLeave={el => el.target.style.background = 'none'}
        >{e}</button>
      ))}
    </div>
  )
}

// ─── Format timestamp ─────────────────────────────────────────────────────────
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function formatLastSeen(date) {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function formatConvTime(date) {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const isToday = now.toDateString() === d.toDateString()
  if (isToday) return formatTime(d)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (yesterday.toDateString() === d.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 42, showOnline = false }) {
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {user?.avatar ? (
        <img src={user.avatar} alt="avatar" style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          display: 'block'
        }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(79,142,247,0.25), rgba(124,92,252,0.25))',
          border: '1.5px solid rgba(79,142,247,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.34, fontWeight: 700, color: '#4f8ef7',
          fontFamily: 'var(--font-syne), Syne, sans-serif'
        }}>{initials || '?'}</div>
      )}
      {showOnline && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.26, height: size * 0.26, borderRadius: '50%',
          background: '#22d3a5', border: `2px solid #0a0f1a`,
          display: 'block'
        }} />
      )}
    </div>
  )
}

// ─── Read receipt icon ────────────────────────────────────────────────────────
function ReadReceipt({ read }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ flexShrink: 0 }}>
      {read ? (
        <>
          <path d="M1 5.5L4.5 9L11 2" stroke="#4f8ef7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5.5L8.5 9L15 2" stroke="#4f8ef7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      ) : (
        <>
          <path d="M1 5.5L4.5 9L11 2" stroke="#8896b0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5.5L8.5 9L15 2" stroke="#8896b0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      )}
    </svg>
  )
}

// ─── Date divider ─────────────────────────────────────────────────────────────
function DateDivider({ date }) {
  const d = new Date(date)
  const now = new Date()
  const isToday = now.toDateString() === d.toDateString()
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = yesterday.toDateString() === d.toDateString()
  const label = isToday ? 'Today' : isYesterday ? 'Yesterday' :
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      margin: '1rem 0', padding: '0 1rem'
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(31,45,69,0.6)' }} />
      <span style={{
        fontSize: '0.72rem', color: '#8896b0', fontWeight: 500,
        background: '#0e1526', padding: '3px 10px', borderRadius: 20,
        border: '1px solid rgba(31,45,69,0.5)', whiteSpace: 'nowrap'
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(31,45,69,0.6)' }} />
    </div>
  )
}

// ─── Search bar ───────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8896b0" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function MessagesContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [filteredConvs, setFilteredConvs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showEmoji, setShowEmoji] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const pollRef = useRef(null)
  const activeConvRef = useRef(null)

  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  useEffect(() => {
    if (isLoaded && user) fetchConversations()
  }, [isLoaded, user])

  useEffect(() => {
    const targetId = searchParams.get('with')
    if (targetId && isLoaded && user) startConversation(targetId)
  }, [searchParams, isLoaded, user])

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id)
      clearInterval(pollRef.current)
      pollRef.current = setInterval(() => {
        fetchMessages(activeConvRef.current?._id)
        fetchConversations()
      }, 2500)
    }
    return () => clearInterval(pollRef.current)
  }, [activeConv?._id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter conversations by search
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredConvs(conversations); return }
    const q = searchQuery.toLowerCase()
    setFilteredConvs(conversations.filter(conv => {
      const other = getOtherParticipant(conv)
      const name = `${other?.firstName} ${other?.lastName}`.toLowerCase()
      const lastMsg = conv.lastMessage?.content?.toLowerCase() || ''
      return name.includes(q) || lastMsg.includes(q)
    }))
  }, [searchQuery, conversations])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      const convs = data.conversations || []
      const withUnread = await Promise.all(convs.map(async (conv) => {
        try {
          const r = await fetch('/api/conversations/' + conv._id + '/unread')
          const d = await r.json().catch(() => ({ count: 0 }))
          return { ...conv, unreadCount: d.count || 0 }
        } catch { return { ...conv, unreadCount: 0 } }
      }))
      setConversations(withUnread)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const startConversation = async (targetClerkId) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetClerkId }),
      })
      const data = await res.json()
      if (data.conversation) { setActiveConv(data.conversation); fetchConversations() }
    } catch (err) { console.error(err) }
  }

  const fetchMessages = async (convId) => {
    if (!convId) return
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) { console.error(err) }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || sending) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')
    try {
      const res = await fetch(`/api/conversations/${activeConv._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.message) { setMessages(prev => [...prev, data.message]); fetchConversations() }
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const getOtherParticipant = (conv) => {
    const other = conv.participants?.find(p => p.clerkId !== user?.id)
    if (!other) return { firstName: 'You', lastName: '', avatar: null, clerkId: user?.id }
    return other
  }

  const getUnreadCount = (conv) =>
    activeConv?._id === conv._id ? 0 : (conv.unreadCount || 0)

  const openConv = (conv) => {
    setActiveConv(conv)
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c))
    // On mobile, close sidebar
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg, i) => {
    const d = new Date(msg.createdAt).toDateString()
    if (i === 0 || new Date(messages[i - 1].createdAt).toDateString() !== d) {
      acc.push({ type: 'date', date: msg.createdAt, key: `date-${i}` })
    }
    acc.push({ type: 'msg', msg, key: msg._id })
    return acc
  }, [])

  if (!isLoaded || loading) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, color: '#8896b0'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #1f2d45', borderTopColor: '#4f8ef7',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize: '0.88rem' }}>Loading messages...</span>
    </div>
  )

  const activeOther = activeConv ? getOtherParticipant(activeConv) : null
  const isSelfConv = activeConv && !activeConv.participants?.find(p => p.clerkId !== user?.id)

  return (
    <div style={{
      height: '100dvh', background: '#06080f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
        .msg-bubble { animation: fadeIn 0.15s ease-out; }
        .conv-item:hover { background: rgba(79,142,247,0.05) !important; }
        .conv-item:active { background: rgba(79,142,247,0.1) !important; }
        textarea::-webkit-scrollbar { width: 4px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: #1f2d45; border-radius: 4px; }
        .msg-area::-webkit-scrollbar { width: 5px; }
        .msg-area::-webkit-scrollbar-track { background: transparent; }
        .msg-area::-webkit-scrollbar-thumb { background: rgba(31,45,69,0.6); border-radius: 4px; }
        .sidebar::-webkit-scrollbar { width: 4px; }
        .sidebar::-webkit-scrollbar-track { background: transparent; }
        .sidebar::-webkit-scrollbar-thumb { background: rgba(31,45,69,0.5); border-radius: 4px; }
        @media (max-width: 768px) {
          .layout { flex-direction: column; }
          .sidebar-panel { width: 100% !important; border-right: none !important; border-bottom: 1px solid #1f2d45; }
        }
      `}</style>

      {/* Top Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.7rem 1.5rem', borderBottom: '1px solid #1a2540',
        background: 'rgba(10,15,26,0.96)', backdropFilter: 'blur(20px)',
        flexShrink: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Back on mobile when chat is open */}
          {activeConv && (
            <button onClick={() => { setSidebarOpen(true); setActiveConv(null) }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#8896b0', padding: 4, display: 'flex', alignItems: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
          <div onClick={() => router.push('/home')} style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: '1.25rem', fontWeight: 800,
            background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            cursor: 'pointer', userSelect: 'none'
          }}>StudBuild</div>
          <span style={{
            fontSize: '0.78rem', color: '#8896b0', paddingLeft: 4,
            borderLeft: '1px solid #1f2d45', marginLeft: 4
          }}>Messages</span>
        </div>
        <button onClick={() => router.push('/home')} style={{
          padding: '0.4rem 1rem', borderRadius: 8,
          border: '1px solid #1f2d45', background: 'transparent',
          color: '#8896b0', cursor: 'pointer', fontSize: '0.82rem',
          fontFamily: 'inherit', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', gap: 6
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f8ef7'; e.currentTarget.style.color = '#f0f4ff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f2d45'; e.currentTarget.style.color = '#8896b0' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>
      </nav>

      {/* Main Layout */}
      <div className="layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <div className="sidebar-panel" style={{
          width: 320, borderRight: '1px solid #1a2540',
          background: '#080d18', display: 'flex',
          flexDirection: 'column', flexShrink: 0, overflow: 'hidden'
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: '1rem 1rem 0.75rem',
            background: '#0a0f1a',
            borderBottom: '1px solid #1a2540',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '0.75rem'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '1rem', fontWeight: 700, color: '#f0f4ff', margin: 0
              }}>Chats</h2>
              <div style={{
                background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)',
                borderRadius: 20, padding: '2px 10px',
                fontSize: '0.7rem', color: '#4f8ef7', fontWeight: 600
              }}>
                {conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) > 0
                  ? `${conversations.reduce((a, c) => a + (c.unreadCount || 0), 0)} new`
                  : `${conversations.length} chats`}
              </div>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <SearchIcon />
              </div>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem',
                  background: '#111827', border: '1px solid #1f2d45',
                  borderRadius: 10, color: '#f0f4ff', fontSize: '0.82rem',
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                onBlur={e => e.target.style.borderColor = '#1f2d45'}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="sidebar" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConvs.length === 0 ? (
              <div style={{
                padding: '3rem 1.5rem', textAlign: 'center',
                color: '#8896b0', fontSize: '0.85rem', lineHeight: 1.7
              }}>
                {searchQuery ? (
                  <>No results for <strong style={{ color: '#f0f4ff' }}>"{searchQuery}"</strong></>
                ) : (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>💬</div>
                    No conversations yet.
                    <br />
                    <span style={{ color: '#4f8ef7' }}>Message someone from their profile!</span>
                  </>
                )}
              </div>
            ) : (
              filteredConvs.map(conv => {
                const other = getOtherParticipant(conv)
                const isActive = activeConv?._id === conv._id
                const unread = getUnreadCount(conv)
                const isSelf = !conv.participants?.find(p => p.clerkId !== user?.id)

                return (
                  <div
                    key={conv._id}
                    className="conv-item"
                    onClick={() => openConv(conv)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: isActive ? 'rgba(79,142,247,0.1)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#4f8ef7' : 'transparent'}`,
                      cursor: 'pointer', transition: 'background 0.15s',
                      borderBottom: '1px solid rgba(31,45,69,0.35)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={other} size={44} showOnline={!isSelf} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 3
                        }}>
                          <span style={{
                            fontSize: '0.88rem', fontWeight: unread > 0 ? 700 : 500,
                            color: '#f0f4ff', letterSpacing: '-0.01em'
                          }}>
                            {isSelf ? 'Saved Messages' : `${other?.firstName || ''} ${other?.lastName || ''}`.trim()}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#4f6070', flexShrink: 0 }}>
                            {formatConvTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '0.78rem',
                            color: unread > 0 ? '#c0ccdf' : '#4f6070',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis', flex: 1, maxWidth: 170,
                            fontWeight: unread > 0 ? 500 : 400
                          }}>
                            {conv.lastMessage?.content || 'Start a conversation'}
                          </span>
                          {unread > 0 && (
                            <span style={{
                              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                              color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                              padding: '2px 7px', borderRadius: 999,
                              minWidth: 20, textAlign: 'center', flexShrink: 0, marginLeft: 6
                            }}>{unread > 99 ? '99+' : unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Chat Panel ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 30% 20%, rgba(79,142,247,0.03) 0%, transparent 60%), #06080f'
        }}>
          {!activeConv ? (
            /* Empty state */
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: '1rem'
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(79,142,247,0.08)', border: '1.5px solid rgba(79,142,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem'
              }}>💬</div>
              <h3 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '1.1rem', color: '#f0f4ff', margin: 0
              }}>Your messages</h3>
              <p style={{ fontSize: '0.85rem', color: '#4f6070', margin: 0, textAlign: 'center' }}>
                Select a conversation or message someone<br />from their profile page
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #1a2540',
                background: 'rgba(10,15,26,0.9)',
                backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', gap: 12,
                flexShrink: 0, zIndex: 5
              }}>
                <Avatar user={activeOther} size={40} showOnline={!isSelfConv} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0f4ff', lineHeight: 1.2 }}>
                    {isSelfConv ? 'Saved Messages' : `${activeOther?.firstName || ''} ${activeOther?.lastName || ''}`.trim()}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#22d3a5', marginTop: 2 }}>
                    {isSelfConv ? 'Your personal space' : '● Online'}
                  </div>
                </div>
                {!isSelfConv && (
                  <button onClick={() => router.push(`/profile/${activeOther?.clerkId}`)} style={{
                    padding: '0.38rem 0.9rem', borderRadius: 8,
                    border: '1px solid #1f2d45', background: 'transparent',
                    color: '#8896b0', cursor: 'pointer', fontSize: '0.78rem',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f8ef7'; e.currentTarget.style.color = '#f0f4ff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f2d45'; e.currentTarget.style.color = '#8896b0' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profile
                  </button>
                )}
              </div>

              {/* Messages area */}
              <div className="msg-area" style={{
                flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem 0.5rem',
                display: 'flex', flexDirection: 'column'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column',
                    gap: 10, color: '#4f6070', textAlign: 'center', padding: '3rem'
                  }}>
                    <Avatar user={activeOther} size={64} />
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: '0.9rem', color: '#8896b0', fontWeight: 500, marginBottom: 4 }}>
                        {isSelfConv ? 'Saved Messages' : `${activeOther?.firstName} ${activeOther?.lastName}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                        {isSelfConv ? 'Save notes, links, ideas here.' : 'Send a message to start the conversation!'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {groupedMessages.map((item) => {
                      if (item.type === 'date') return <DateDivider key={item.key} date={item.date} />

                      const { msg } = item
                      const isMe = msg.sender?.clerkId === user?.id
                      const idx = messages.indexOf(msg)
                      const prevMsg = messages[idx - 1]
                      const nextMsg = messages[idx + 1]
                      const isFirstInGroup = !prevMsg || prevMsg.sender?.clerkId !== msg.sender?.clerkId
                      const isLastInGroup = !nextMsg || nextMsg.sender?.clerkId !== msg.sender?.clerkId

                      return (
                        <div key={item.key} className="msg-bubble" style={{
                          display: 'flex',
                          flexDirection: isMe ? 'row-reverse' : 'row',
                          alignItems: 'flex-end', gap: 6,
                          marginBottom: isLastInGroup ? 8 : 2,
                          paddingLeft: isMe ? '15%' : 0,
                          paddingRight: isMe ? 0 : '15%',
                        }}>
                          {/* Avatar placeholder */}
                          {!isMe && (
                            <div style={{ width: 28, flexShrink: 0 }}>
                              {isLastInGroup ? (
                                <Avatar user={msg.sender} size={28} />
                              ) : null}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            {/* Sender name for group chats (first message in group) */}
                            {!isMe && isFirstInGroup && !isSelfConv && (
                              <span style={{ fontSize: '0.7rem', color: '#4f8ef7', marginBottom: 2, marginLeft: 2, fontWeight: 500 }}>
                                {msg.sender?.firstName}
                              </span>
                            )}

                            {/* Bubble */}
                            <div style={{
                              padding: '0.55rem 0.9rem',
                              borderRadius: isMe
                                ? (isFirstInGroup ? '18px 18px 4px 18px' : '18px 4px 4px 18px')
                                : (isFirstInGroup ? '18px 18px 18px 4px' : '4px 18px 18px 4px'),
                              background: isMe
                                ? 'linear-gradient(135deg, #3b82f6, #7c5cfc)'
                                : '#131d30',
                              color: '#f0f4ff',
                              fontSize: '0.9rem', lineHeight: 1.5,
                              wordBreak: 'break-word',
                              maxWidth: '100%',
                              border: isMe ? 'none' : '1px solid rgba(31,45,69,0.6)',
                              boxShadow: isMe ? '0 2px 12px rgba(79,142,247,0.2)' : 'none'
                            }}>
                              {msg.content}
                            </div>

                            {/* Time + read receipt */}
                            {isLastInGroup && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                marginTop: 3, paddingRight: isMe ? 2 : 0, paddingLeft: isMe ? 0 : 2
                              }}>
                                <span style={{ fontSize: '0.65rem', color: '#4f6070' }}>
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isMe && <ReadReceipt read={msg.read} />}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input area */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid #1a2540',
                background: 'rgba(10,15,26,0.9)',
                backdropFilter: 'blur(12px)',
                display: 'flex', gap: 8, alignItems: 'flex-end',
                flexShrink: 0, position: 'relative'
              }}>
                {/* Emoji picker */}
                {showEmoji && (
                  <EmojiPicker
                    onSelect={e => setNewMessage(prev => prev + e)}
                    onClose={() => setShowEmoji(false)}
                  />
                )}

                {/* Emoji button */}
                <button onClick={() => setShowEmoji(v => !v)} style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: showEmoji ? 'rgba(79,142,247,0.15)' : 'transparent',
                  border: '1px solid #1f2d45', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', transition: 'all 0.2s',
                  color: showEmoji ? '#4f8ef7' : '#8896b0'
                }}>😊</button>

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => {
                    setNewMessage(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                  }}
                  onKeyDown={handleKeyDown}
                  style={{
                    flex: 1, padding: '0.6rem 1rem', borderRadius: 22,
                    border: '1px solid #1f2d45', background: '#111827',
                    color: '#f0f4ff', fontSize: '0.9rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'none', lineHeight: 1.5,
                    maxHeight: 100, overflow: 'auto', transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                  onBlur={e => e.target.style.borderColor = '#1f2d45'}
                />

                {/* Send button */}
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
                    background: newMessage.trim()
                      ? 'linear-gradient(135deg, #4f8ef7, #7c5cfc)'
                      : '#1a2540',
                    color: newMessage.trim() ? '#fff' : '#4f6070',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: sending ? 'scale(0.95)' : 'scale(1)'
                  }}
                >
                  {sending ? (
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', animation: 'spin 0.6s linear infinite'
                    }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#06080f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#8896b0', fontSize: '0.88rem'
      }}>Loading...</div>
    }>
      <MessagesContent />
    </Suspense>
  )
}