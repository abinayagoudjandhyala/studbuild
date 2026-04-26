'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Suspense } from 'react'

function MessagesContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)
  const activeConvRef = useRef(null)

  useEffect(() => {
    activeConvRef.current = activeConv
  }, [activeConv])

  useEffect(() => {
    if (isLoaded && user) {
      fetchConversations()
    }
  }, [isLoaded, user])

  useEffect(() => {
    const targetId = searchParams.get('with')
    if (targetId && isLoaded && user) {
      startConversation(targetId)
    }
  }, [searchParams, isLoaded, user])

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id)
      pollRef.current = setInterval(() => {
        fetchMessages(activeConvRef.current?._id)
        fetchConversations()
      }, 2000)
    }
    return () => clearInterval(pollRef.current)
  }, [activeConv?._id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

const fetchConversations = async () => {
  try {
    const res = await fetch('/api/conversations')
    const data = await res.json()
    const convs = data.conversations || []

    const withUnread = await Promise.all(
      convs.map(async (conv) => {
        try {
          const r = await fetch('/api/conversations/' + conv._id + '/unread')
          const text = await r.text()
          let d = { count: 0 }
          try { d = JSON.parse(text) } catch {}
          return { ...conv, unreadCount: d.count || 0 }
        } catch {
          return { ...conv, unreadCount: 0 }
        }
      })
    )
    setConversations(withUnread)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  const startConversation = async (targetClerkId) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetClerkId }),
      })
      const data = await res.json()
      if (data.conversation) {
        setActiveConv(data.conversation)
        fetchConversations()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMessages = async (convId) => {
    if (!convId) return
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
    }
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
      if (data.message) {
        setMessages(prev => [...prev, data.message])
        fetchConversations()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getOtherParticipant = (conv) => {
    const other = conv.participants?.find(p => p.clerkId !== user?.id)
    if (!other) {
      return { firstName: 'You', lastName: '', avatar: null, clerkId: user?.id }
    }
    return other
  }

  const getUnreadCount = (conv) => {
  if (activeConv?._id === conv._id) return 0
  return conv.unreadCount || 0
}

  if (!isLoaded || loading) return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#8896b0'
    }}>Loading messages...</div>
  )

  return (
    <div style={{
      height: '100vh', background: '#06080f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2.5rem', borderBottom: '1px solid #1f2d45',
        background: 'rgba(6,8,15,0.9)', backdropFilter: 'blur(18px)',
        flexShrink: 0
      }}>
        <div onClick={() => router.push('/home')} style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '1.3rem', fontWeight: 800,
          background: 'linear-gradient(120deg,#4f8ef7,#a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          cursor: 'pointer'
        }}>StudBuild</div>
        <button onClick={() => router.push('/home')} style={{
          padding: '0.45rem 1.2rem', borderRadius: 8,
          border: '1px solid #1f2d45', background: 'transparent',
          color: '#f0f4ff', cursor: 'pointer', fontSize: '0.88rem'
        }}>← Back</button>
      </nav>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Conversations Sidebar */}
        <div style={{
          width: 300, borderRight: '1px solid #1f2d45',
          background: '#0a0f1a', display: 'flex',
          flexDirection: 'column', flexShrink: 0
        }}>
          <div style={{
            padding: '1rem 1.2rem',
            borderBottom: '1px solid #1f2d45',
            background: '#0d1120'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: '1rem', fontWeight: 600
            }}>Messages 💬</h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{
                padding: '2rem', textAlign: 'center',
                color: '#8896b0', fontSize: '0.88rem'
              }}>
                No conversations yet.
                <br />
                <span style={{ color: '#4f8ef7' }}>
                  Message someone from their profile!
                </span>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOtherParticipant(conv)
                const isActive = activeConv?._id === conv._id
                const unread = getUnreadCount(conv)
                const isSelf = !conv.participants?.find(p => p.clerkId !== user?.id)

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setActiveConv(conv)
                      setConversations(prev =>
                        prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c)
                      )
                    }}
                    style={{
                      padding: '0.9rem 1.2rem',
                      background: isActive ? 'rgba(79,142,247,0.08)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? '#4f8ef7' : 'transparent'}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                      borderBottom: '1px solid rgba(31,45,69,0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Avatar with online dot */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {other?.avatar ? (
                          <img src={other.avatar} alt="avatar"
                            style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{
                            width: 42, height: 42, borderRadius: '50%',
                            background: 'linear-gradient(135deg,rgba(79,142,247,0.3),rgba(167,139,250,0.3))',
                            border: '1px solid rgba(79,142,247,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 600, color: '#4f8ef7'
                          }}>
                            {other?.firstName?.[0]}{other?.lastName?.[0]}
                          </div>
                        )}
                        <div style={{
                          position: 'absolute', bottom: 1, right: 1,
                          width: 10, height: 10, borderRadius: '50%',
                          background: '#34d399', border: '2px solid #0a0f1a'
                        }} />
                      </div>

                      {/* Name + last message */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 2
                        }}>
                          <div style={{
                            fontSize: '0.88rem',
                            fontWeight: unread > 0 ? 600 : 500,
                            color: '#f0f4ff'
                          }}>
                            {isSelf ? 'You (Saved)' : `${other?.firstName} ${other?.lastName}`}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#8896b0', flexShrink: 0 }}>
                            {conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            fontSize: '0.78rem',
                            color: unread > 0 ? '#8896b0' : '#4f6070',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis', flex: 1,
                            fontWeight: unread > 0 ? 500 : 400
                          }}>
                            {conv.lastMessage?.content || 'Start a conversation'}
                          </div>
                          {unread > 0 && (
                            <div style={{
                              background: '#4f8ef7', color: '#fff',
                              fontSize: '0.65rem', fontWeight: 700,
                              padding: '2px 6px', borderRadius: 999,
                              minWidth: 18, textAlign: 'center',
                              flexShrink: 0, marginLeft: 6
                            }}>{unread > 99 ? '99+' : unread}</div>
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

        {/* Chat Area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: '#06080f'
        }}>
          {!activeConv ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column',
              gap: '1rem', color: '#8896b0'
            }}>
              <div style={{ fontSize: '4rem' }}>💬</div>
              <h3 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '1.1rem', color: '#f0f4ff'
              }}>Select a conversation</h3>
              <p style={{ fontSize: '0.88rem' }}>
                Or message someone from their profile
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              {(() => {
                const other = getOtherParticipant(activeConv)
                const isSelf = !activeConv.participants?.find(p => p.clerkId !== user?.id)
                return (
                  <div style={{
                    padding: '0.9rem 1.5rem',
                    borderBottom: '1px solid #1f2d45',
                    background: '#0d1120',
                    display: 'flex', alignItems: 'center', gap: 12
                  }}>
                    <div style={{ position: 'relative' }}>
                      {other?.avatar ? (
                        <img src={other.avatar} alt="avatar"
                          style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'linear-gradient(135deg,rgba(79,142,247,0.3),rgba(167,139,250,0.3))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 600, color: '#4f8ef7'
                        }}>
                          {other?.firstName?.[0]}{other?.lastName?.[0]}
                        </div>
                      )}
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#34d399', border: '2px solid #0d1120'
                      }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                        {isSelf ? 'You (Saved Messages)' : `${other?.firstName} ${other?.lastName}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>● Online</div>
                    </div>
                    {!isSelf && (
                      <button
                        onClick={() => router.push(`/profile/${other?.clerkId}`)}
                        style={{
                          marginLeft: 'auto', padding: '0.4rem 0.9rem',
                          borderRadius: 8, border: '1px solid #1f2d45',
                          background: 'transparent', color: '#8896b0',
                          cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit'
                        }}
                      >View Profile</button>
                    )}
                  </div>
                )
              })()}

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center', color: '#8896b0',
                    fontSize: '0.88rem', marginTop: '2rem'
                  }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender?.clerkId === user?.id
                    const prevMsg = messages[index - 1]
                    const showAvatar = !isMe && (!prevMsg || prevMsg.sender?.clerkId !== msg.sender?.clerkId)
                    const isRead = msg.read

                    return (
                      <div key={msg._id}>
                        <div style={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-end', gap: 8,
                          marginBottom: 2
                        }}>
                          {/* Other person avatar */}
                          {!isMe && (
                            <div style={{ width: 28, flexShrink: 0 }}>
                              {showAvatar && (
                                msg.sender?.avatar ? (
                                  <img src={msg.sender.avatar} alt="avatar"
                                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: 'rgba(79,142,247,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 600, color: '#4f8ef7'
                                  }}>{msg.sender?.firstName?.[0]}</div>
                                )
                              )}
                            </div>
                          )}

                          {/* Message bubble */}
                          <div style={{ maxWidth: '65%' }}>
                            <div style={{
                              padding: '0.55rem 0.95rem',
                              borderRadius: isMe
                                ? '18px 18px 4px 18px'
                                : '18px 18px 18px 4px',
                              background: isMe
                                ? 'linear-gradient(135deg,#4f8ef7,#7c5cfc)'
                                : '#1a2540',
                              color: '#f0f4ff',
                              fontSize: '0.9rem',
                              lineHeight: 1.5,
                              wordBreak: 'break-word'
                            }}>
                              {msg.content}
                            </div>

                            {/* Time + Read receipt */}
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: isMe ? 'flex-end' : 'flex-start',
                              gap: 4, marginTop: 2, paddingRight: 4
                            }}>
                              <span style={{ fontSize: '0.65rem', color: '#8896b0' }}>
                                {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                              {/* WhatsApp style read receipts */}
                              {isMe && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: isRead ? '#4f8ef7' : '#8896b0'
                                }}>
                                  {isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{
                padding: '0.9rem 1.5rem',
                borderTop: '1px solid #1f2d45',
                background: '#0d1120',
                display: 'flex', gap: 10, alignItems: 'flex-end'
              }}>
                <textarea
                  rows={1}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    flex: 1, padding: '0.7rem 1rem', borderRadius: 12,
                    border: '1px solid #1f2d45', background: '#111827',
                    color: '#f0f4ff', fontSize: '0.92rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'none', maxHeight: 120,
                    lineHeight: 1.5, transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                  onBlur={e => e.target.style.borderColor = '#1f2d45'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: 'none',
                    background: newMessage.trim()
                      ? 'linear-gradient(135deg,#4f8ef7,#7c5cfc)'
                      : '#1f2d45',
                    color: '#fff', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '1.1rem', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}
                >→</button>
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
        color: '#8896b0'
      }}>Loading...</div>
    }>
      <MessagesContent />
    </Suspense>
  )
}