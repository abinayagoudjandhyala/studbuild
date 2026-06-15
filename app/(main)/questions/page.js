'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import useIsMobile from '@/hooks/useIsMobile'

export default function QuestionsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('newest')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
  }, [isLoaded, user])

  useEffect(() => { fetchQuestions() }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = questions
    .filter(q => {
      if (!search.trim()) return true
      const s = search.toLowerCase()
      return q.title?.toLowerCase().includes(s) ||
        q.body?.toLowerCase().includes(s) ||
        q.tags?.some(t => t.toLowerCase().includes(s))
    })
    .sort((a, b) => {
      if (filter === 'votes') return (b.votes || 0) - (a.votes || 0)
      if (filter === 'unanswered') return (a.answers?.length || 0) - (b.answers?.length || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const solved = questions.filter(q => q.answers?.some(a => a.isAccepted)).length
  const unanswered = questions.filter(q => !q.answers?.length).length

  return (
    <div style={{
      minHeight: '100vh', background: '#06080f',
      fontFamily: 'var(--font-dm), DM Sans, sans-serif'
    }}>
      <Navbar />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem' }}>

        {/* Page hero */}
        <div style={{
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #111827'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: isMobile ? '1.4rem' : '1.8rem',
                fontWeight: 800, color: '#f0f4ff',
                letterSpacing: '-0.02em', marginBottom: 6
              }}>
                Questions &amp; Answers
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                  <span style={{ color: '#f0f4ff', fontWeight: 600 }}>{questions.length}</span> questions
                </span>
                <span style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{solved}</span> solved
                </span>
                <span style={{ fontSize: '0.8rem', color: '#4f6070' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{unanswered}</span> unanswered
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/questions/ask')}
              style={{
                padding: '0.6rem 1.3rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
                fontWeight: 600, fontFamily: 'inherit', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(79,142,247,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,142,247,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,142,247,0.3)' }}
            >+ Ask a Question</button>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6070"
              strokeWidth="2.2" strokeLinecap="round"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              style={{
                width: '100%', padding: '0.65rem 1rem 0.65rem 2.3rem',
                background: '#0d1120', border: '1px solid #1a2540',
                borderRadius: 10, color: '#f0f4ff', fontSize: '0.85rem',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                transition: 'border-color 0.2s, background 0.2s'
              }}
              onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.background = '#0f1628' }}
              onBlur={e => { e.target.style.borderColor = '#1a2540'; e.target.style.background = '#0d1120' }}
            />
          </div>

          {/* Filter pill group */}
          <div style={{
            display: 'flex', borderRadius: 10,
            border: '1px solid #1a2540', overflow: 'hidden',
            background: '#0d1120', flexShrink: 0
          }}>
            {[
              { id: 'newest', label: '🕐 Newest' },
              { id: 'votes', label: '🔥 Top' },
              { id: 'unanswered', label: '💬 Open' },
            ].map((f, i) => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '0.6rem 1rem',
                background: filter === f.id ? 'rgba(79,142,247,0.15)' : 'transparent',
                border: 'none',
                borderLeft: i > 0 ? '1px solid #1a2540' : 'none',
                color: filter === f.id ? '#7cb4ff' : '#4f6070',
                cursor: 'pointer', fontSize: '0.8rem',
                fontFamily: 'inherit', fontWeight: filter === f.id ? 600 : 400,
                transition: 'all 0.15s', whiteSpace: 'nowrap'
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 100, borderRadius: 12,
                background: 'linear-gradient(90deg,#0d1120 25%,#0f1628 50%,#0d1120 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#0a0f1a', borderRadius: 16,
            border: '1px dashed #1a2540'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤔</div>
            <p style={{ color: '#8896b0', fontSize: '0.95rem', marginBottom: 4 }}>
              {search ? `No results for "${search}"` : 'No questions yet'}
            </p>
            <p style={{ color: '#4f6070', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
              {search ? 'Try different keywords' : 'Ask anything — code, career, college!'}
            </p>
            {!search && (
              <button onClick={() => router.push('/questions/ask')} style={{
                padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                color: '#fff', fontSize: '0.88rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit'
              }}>Ask the first question</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((q) => {
              const isSolved = q.answers?.some(a => a.isAccepted)
              const answerCount = q.answers?.length || 0
              const votes = q.votes || 0

              return (
                <div
                  key={q._id}
                  onClick={() => router.push('/questions/' + q._id)}
                  style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '1rem 1.1rem',
                    background: '#0a0f1a',
                    border: '1px solid #111827',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.18s, background 0.18s',
                    borderLeft: isSolved ? '3px solid #34d399' : '3px solid transparent'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = isSolved ? '#34d399' : 'rgba(79,142,247,0.35)'
                    e.currentTarget.style.background = '#0d1322'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isSolved ? '#34d399' : '#111827'
                    e.currentTarget.style.background = '#0a0f1a'
                  }}
                >
                  {/* Stats */}
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 8,
                    flexShrink: 0, width: 48, paddingTop: 2
                  }}>
                    {/* Votes */}
                    <div style={{
                      textAlign: 'center',
                      background: votes > 0 ? 'rgba(245,158,11,0.08)' : 'transparent',
                      border: `1px solid ${votes > 0 ? 'rgba(245,158,11,0.2)' : '#1a2540'}`,
                      borderRadius: 8, padding: '4px 6px', width: '100%'
                    }}>
                      <div style={{
                        fontSize: '1rem', fontWeight: 700, lineHeight: 1,
                        color: votes > 0 ? '#f59e0b' : '#2d3a50',
                        fontFamily: 'var(--font-syne), Syne, sans-serif'
                      }}>{votes}</div>
                      <div style={{ fontSize: '0.6rem', color: '#2d3a50', marginTop: 2 }}>votes</div>
                    </div>

                    {/* Answers */}
                    <div style={{
                      textAlign: 'center',
                      background: isSolved
                        ? 'rgba(52,211,153,0.1)'
                        : answerCount > 0 ? 'rgba(79,142,247,0.08)' : 'transparent',
                      border: `1px solid ${isSolved
                        ? 'rgba(52,211,153,0.25)'
                        : answerCount > 0 ? 'rgba(79,142,247,0.2)' : '#1a2540'}`,
                      borderRadius: 8, padding: '4px 6px', width: '100%'
                    }}>
                      <div style={{
                        fontSize: '1rem', fontWeight: 700, lineHeight: 1,
                        color: isSolved ? '#34d399' : answerCount > 0 ? '#4f8ef7' : '#2d3a50',
                        fontFamily: 'var(--font-syne), Syne, sans-serif'
                      }}>{answerCount}</div>
                      <div style={{
                        fontSize: '0.58rem', marginTop: 2,
                        color: isSolved ? '#34d399' : answerCount > 0 ? '#4f8ef7' : '#2d3a50'
                      }}>{isSolved ? '✓ solved' : 'ans'}</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 style={{
                      fontSize: '0.95rem', fontWeight: 600,
                      color: '#c8d8f8', marginBottom: 5, lineHeight: 1.45,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      transition: 'color 0.15s'
                    }}>{q.title}</h3>

                    {/* Snippet */}
                    {q.body && (
                      <p style={{
                        fontSize: '0.78rem', color: '#3d5070',
                        marginBottom: 8, lineHeight: 1.55,
                        display: '-webkit-box', WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>{q.body}</p>
                    )}

                    {/* Tags + meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      {q.tags?.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          padding: '2px 8px', borderRadius: 5,
                          fontSize: '0.68rem',
                          background: 'rgba(79,142,247,0.07)',
                          color: '#5a87cc',
                          border: '1px solid rgba(79,142,247,0.12)',
                          letterSpacing: '0.01em'
                        }}>{tag}</span>
                      ))}

                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {q.author?.avatar
                          ? <img src={q.author.avatar} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              background: 'rgba(79,142,247,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.55rem', color: '#4f8ef7', fontWeight: 700
                            }}>{q.author?.firstName?.[0]}</div>
                        }
                        <span style={{ fontSize: '0.7rem', color: '#2d3a50' }}>
                          {q.author?.firstName}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#1e2a3a' }}>·</span>
                        <span style={{ fontSize: '0.7rem', color: '#2d3a50' }}>
                          {timeAgo(q.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontSize: '0.78rem', color: '#1e2a3a'
          }}>{filtered.length} of {questions.length} questions</p>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}