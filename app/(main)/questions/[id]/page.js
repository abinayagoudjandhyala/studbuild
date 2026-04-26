'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'

export default function QuestionDetailPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(null)
const [editAnswerText, setEditAnswerText] = useState('')
  useEffect(() => {
    if (params.id) fetchQuestion()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/questions/${params.id}`)
      const data = await res.json()
      setQuestion(data.question)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type, answerId) => {
    try {
      const res = await fetch(`/api/questions/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, answerId }),
      })
      const data = await res.json()
      if (data.success) fetchQuestion()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAnswer = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/questions/${params.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answer }),
      })
      const data = await res.json()
      if (data.success) {
        setAnswer('')
        fetchQuestion()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      Loading question...
    </div>
  )

  if (!question) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      Question not found
    </div>
  )

  const hasAccepted = question.answers?.some(a => a.isAccepted)

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Question Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {question.tags?.map(tag => (
              <span key={tag} style={{
                padding: '0.2rem 0.7rem', borderRadius: 6, fontSize: '0.75rem',
                background: 'rgba(79,142,247,0.1)', color: '#4f8ef7',
                border: '1px solid rgba(79,142,247,0.2)'
              }}>{tag}</span>
            ))}
            {hasAccepted && (
              <span style={{
                padding: '0.2rem 0.7rem', borderRadius: 6, fontSize: '0.75rem',
                background: 'rgba(52,211,153,0.1)', color: '#34d399',
                border: '1px solid rgba(52,211,153,0.3)'
              }}>✓ Solved</span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700,
            marginBottom: '1rem', lineHeight: 1.3
          }}>{question.title}</h1>

          <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#8896b0', marginBottom: '1.5rem' }}>
            <span>Asked {new Date(question.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>{question.views} views</span>
            <span>{question.answers?.length || 0} answers</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '2rem', alignItems: 'start' }}>

          {/* Left — Question + Answers */}
          <div>

            {/* Question Body */}
            <div style={{
              background: '#111827', border: '1px solid #1f2d45',
              borderRadius: 16, padding: '1.5rem', marginBottom: '2rem',
              display: 'flex', gap: '1.2rem'
            }}>
              {/* Vote Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleVote('up')} style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #1f2d45',
                  background: 'transparent', color: '#8896b0', cursor: 'pointer',
                  fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>▲</button>
                <span style={{
                  fontFamily: 'var(--font-syne), Syne, sans-serif',
                  fontSize: '1.1rem', fontWeight: 700,
                  color: question.votes > 0 ? '#f59e0b' : '#8896b0'
                }}>{question.votes}</span>
                <button onClick={() => handleVote('down')} style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid #1f2d45',
                  background: 'transparent', color: '#8896b0', cursor: 'pointer',
                  fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>▼</button>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <p style={{ color: '#c8d4e8', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '1.2rem' }}>
                  {question.body}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {question.author?.avatar ? (
                    <img src={question.author.avatar} alt="av"
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => router.push(`/profile/${question.author.clerkId}`)} />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(79,142,247,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 600, color: '#4f8ef7', cursor: 'pointer'
                    }}
                      onClick={() => router.push(`/profile/${question.author?.clerkId}`)}
                    >{question.author?.firstName?.[0]}</div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      {question.author?.firstName} {question.author?.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8896b0' }}>
                      {question.author?.university}
                    </div>
                  </div>
                </div>
              </div>
              {user?.id === question.author?.clerkId && (
  <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
    <button
      onClick={async () => {
        if (!confirm('Delete this question?')) return
        await fetch('/api/questions/' + params.id, { method: 'DELETE' })
        router.push('/home')
      }}
      style={{
        padding: '0.4rem 1rem', borderRadius: 8,
        border: '1px solid rgba(236,72,153,0.3)',
        background: 'rgba(236,72,153,0.06)',
        color: '#ec4899', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit'
      }}
    >🗑️ Delete Question</button>
  </div>
)}
            </div>

            {/* Answers */}
            <h2 style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.2rem'
            }}>
              {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? 's' : ''}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {question.answers?.sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0))
                .map((ans) => (
                  <div key={ans._id} style={{
                    background: ans.isAccepted ? 'rgba(52,211,153,0.05)' : '#111827',
                    border: `1px solid ${ans.isAccepted ? 'rgba(52,211,153,0.3)' : '#1f2d45'}`,
                    borderRadius: 16, padding: '1.5rem',
                    display: 'flex', gap: '1.2rem'
                  }}>
                    {/* Vote */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => handleVote('up', ans._id)} style={{
                        width: 28, height: 28, borderRadius: '50%', border: '1px solid #1f2d45',
                        background: 'transparent', color: '#8896b0', cursor: 'pointer', fontSize: '0.85rem'
                      }}>▲</button>
                      <span style={{
                        fontSize: '0.95rem', fontWeight: 700,
                        color: ans.votes > 0 ? '#f59e0b' : '#8896b0'
                      }}>{ans.votes}</span>
                      <button onClick={() => handleVote('down', ans._id)} style={{
                        width: 28, height: 28, borderRadius: '50%', border: '1px solid #1f2d45',
                        background: 'transparent', color: '#8896b0', cursor: 'pointer', fontSize: '0.85rem'
                      }}>▼</button>
                      {ans.isAccepted && (
                        <span style={{ color: '#34d399', fontSize: '1.2rem', marginTop: 4 }}>✓</span>
                      )}
                    </div>

                    {/* Content */}
                    {/* Content */}
<div style={{ flex: 1 }}>
  {ans.isAccepted && (
    <div style={{
      background: 'rgba(52,211,153,0.1)', color: '#34d399',
      fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.7rem',
      borderRadius: 6, display: 'inline-block', marginBottom: 8
    }}>✓ Accepted Answer</div>
  )}

  {editingAnswer === ans._id.toString() ? (
    <div>
      <textarea rows={5} value={editAnswerText}
        onChange={e => setEditAnswerText(e.target.value)}
        style={{
          width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
          border: '1px solid #1f2d45', background: '#0d1120',
          color: '#f0f4ff', fontSize: '0.9rem', outline: 'none',
          fontFamily: 'inherit', resize: 'vertical', marginBottom: 8, lineHeight: 1.7
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={async () => {
          await fetch('/api/questions/' + params.id + '/answer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answerId: ans._id, content: editAnswerText }),
          })
          setEditingAnswer(null)
          fetchQuestion()
        }} style={{
          padding: '0.45rem 1.2rem', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
          color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit'
        }}>Save</button>
        <button onClick={() => setEditingAnswer(null)} style={{
          padding: '0.45rem 1.2rem', borderRadius: 8,
          border: '1px solid #1f2d45', background: 'transparent',
          color: '#8896b0', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit'
        }}>Cancel</button>
      </div>
    </div>
  ) : (
    <p style={{ color: '#c8d4e8', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
      {ans.content}
    </p>
  )}

  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {ans.author?.avatar ? (
      <img src={ans.author.avatar} alt="av"
        style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'rgba(79,142,247,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.62rem', fontWeight: 600, color: '#4f8ef7'
      }}>{ans.author?.firstName?.[0]}</div>
    )}
    <span style={{ fontSize: '0.78rem', color: '#8896b0' }}>
      {ans.author?.firstName} {ans.author?.lastName}
    </span>
    <span style={{ fontSize: '0.72rem', color: '#8896b0', marginLeft: 'auto' }}>
      {new Date(ans.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
    </span>

    {/* Edit/Delete for answer author */}
    {user?.id === ans.author?.clerkId && !editingAnswer && (
      <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
        <button onClick={() => { setEditingAnswer(ans._id.toString()); setEditAnswerText(ans.content) }}
          style={{
            padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
            border: '1px solid #1f2d45', background: 'transparent',
            color: '#4f8ef7', cursor: 'pointer', fontFamily: 'inherit'
          }}>Edit</button>
        <button onClick={async () => {
          if (!confirm('Delete this answer?')) return
          await fetch('/api/questions/' + params.id + '/answer', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answerId: ans._id }),
          })
          fetchQuestion()
        }} style={{
          padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem',
          border: '1px solid rgba(236,72,153,0.3)',
          background: 'rgba(236,72,153,0.06)',
          color: '#ec4899', cursor: 'pointer', fontFamily: 'inherit'
        }}>Delete</button>
      </div>
    )}
  </div>
</div>
                  </div>
                ))}
            </div>

            {/* Your Answer */}
            {user && (
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-syne), Syne, sans-serif',
                  fontSize: '1rem', fontWeight: 600, marginBottom: '1rem'
                }}>Your Answer</h3>
                <textarea
                  rows={8}
                  placeholder="Write a detailed answer. Be specific and helpful. You can include code examples."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                    border: '1px solid #1f2d45', background: '#0d1120',
                    color: '#f0f4ff', fontSize: '0.92rem', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.7,
                    marginBottom: 12
                  }}
                />
                <button onClick={handleAnswer} disabled={submitting || !answer.trim()} style={{
                  padding: '0.7rem 2rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
                  color: '#fff', cursor: 'pointer', fontSize: '0.95rem',
                  fontWeight: 500, fontFamily: 'inherit',
                  opacity: submitting || !answer.trim() ? 0.7 : 1
                }}>{submitting ? 'Posting...' : 'Post Answer'}</button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Stats */}
            <div style={{
              background: '#111827', border: '1px solid #1f2d45',
              borderRadius: 14, padding: '1rem'
            }}>
              <h4 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem', color: '#8896b0'
              }}>QUESTION STATS</h4>
              {[
                { label: 'Asked', value: new Date(question.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'Views', value: question.views },
                { label: 'Answers', value: question.answers?.length || 0 },
                { label: 'Votes', value: question.votes },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.4rem 0', borderBottom: '1px solid #1f2d45',
                  fontSize: '0.82rem'
                }}>
                  <span style={{ color: '#8896b0' }}>{label}</span>
                  <span style={{ color: '#f0f4ff', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{
              background: '#111827', border: '1px solid #1f2d45',
              borderRadius: 14, padding: '1rem'
            }}>
              <h4 style={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.8rem', color: '#8896b0'
              }}>TAGS</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {question.tags?.map(tag => (
                  <span key={tag} style={{
                    padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.75rem',
                    background: 'rgba(79,142,247,0.1)', color: '#4f8ef7',
                    border: '1px solid rgba(79,142,247,0.2)'
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Ask Another */}
            <button onClick={() => router.push('/questions/ask')} style={{
              width: '100%', padding: '0.7rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
              fontWeight: 500, fontFamily: 'inherit'
            }}>+ Ask Another Question</button>

          </div>
        </div>
      </div>
    </div>
  )
}