'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

const qTags = [
  'JavaScript', 'Python', 'React', 'Node.js', 'DSA', 'Arrays',
  'Dynamic Programming', 'Career', 'Internship', 'Placement',
  'Resume', 'System Design', 'Database', 'Git', 'College',
  'Project Help', 'Bug', 'CSS', 'Java', 'C++'
]

export default function AskQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', tags: [] })

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const toggleTag = (tag) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag)
        ? p.tags.filter(t => t !== tag)
        : p.tags.length < 5
          ? [...p.tags, tag]
          : p.tags
    }))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.body) {
      alert('Please add title and description!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) router.push(`/questions/${data.question._id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
    border: '1px solid #1f2d45', background: '#0d1120',
    color: '#f0f4ff', fontSize: '0.92rem', outline: 'none',
    fontFamily: 'inherit', marginTop: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 2rem' }}>

        <h1 style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: '2rem', fontWeight: 700, marginBottom: 6
        }}>Ask a Question ❓</h1>
        <p style={{ color: '#8896b0', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Be specific. The more detail you give, the better answers you'll get.
        </p>

        <div style={{
          background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)',
          borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '2rem',
          fontSize: '0.85rem', color: '#8896b0', lineHeight: 1.7
        }}>
          📌 <strong style={{ color: '#4f8ef7' }}>Tips for a good question:</strong><br />
          Summarize your problem in the title · Explain what you tried · Share relevant code · Add appropriate tags
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#f0f4ff', fontWeight: 500 }}>
              Title *
              <span style={{ color: '#8896b0', fontWeight: 400, marginLeft: 6, fontSize: '0.8rem' }}>
                — Be specific and clear
              </span>
            </label>
            <input
              placeholder="eg. How to reverse a linked list in Python?"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#f0f4ff', fontWeight: 500 }}>
              Description *
              <span style={{ color: '#8896b0', fontWeight: 400, marginLeft: 6, fontSize: '0.8rem' }}>
                — Explain in detail, add code if needed
              </span>
            </label>
            <textarea
              rows={10}
              placeholder={`Describe your problem in detail...\n\nWhat have you tried so far?\nWhat error are you getting?\nPaste your code here if relevant:\n\n\`\`\`python\n# your code here\n\`\`\``}
              value={form.body}
              onChange={e => update('body', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#f0f4ff', fontWeight: 500 }}>
              Tags
              <span style={{ color: '#8896b0', fontWeight: 400, marginLeft: 6, fontSize: '0.8rem' }}>
                — Max 5 tags
              </span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {qTags.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} style={{
                  padding: '0.35rem 0.9rem', borderRadius: 6, fontSize: '0.82rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: `1px solid ${form.tags.includes(tag) ? '#4f8ef7' : '#1f2d45'}`,
                  background: form.tags.includes(tag) ? 'rgba(79,142,247,0.12)' : 'transparent',
                  color: form.tags.includes(tag) ? '#4f8ef7' : '#8896b0',
                }}>{tag}</button>
              ))}
            </div>
            {form.tags.length === 5 && (
              <p style={{ color: '#f59e0b', fontSize: '0.78rem', marginTop: 6 }}>
                Maximum 5 tags reached
              </p>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '0.85rem', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
            color: '#fff', fontSize: '1rem', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, fontFamily: 'inherit'
          }}>{loading ? 'Posting...' : 'Post Question ❓'}</button>

        </div>
      </div>
    </div>
  )
}