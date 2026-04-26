'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

const blogTags = [
  'Web Dev', 'DSA', 'Interview', 'Career', 'Machine Learning',
  'Open Source', 'Tips', 'Project', 'College Life', 'Internship',
  'App Dev', 'DevOps', 'Mistakes', 'Learning', 'Hackathon'
]

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', coverImage: '', tags: [] })

  useEffect(() => {
    if (params.id) fetchBlog()
  }, [params.id])

  const fetchBlog = async () => {
    try {
      const res = await fetch('/api/blogs/' + params.id)
      const data = await res.json()
      if (data.blog) {
        setForm({
          title: data.blog.title || '',
          content: data.blog.content || '',
          coverImage: data.blog.coverImage || '',
          tags: data.blog.tags || [],
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  const toggleTag = (tag) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag]
    }))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      alert('Title and content are required!')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/blogs/' + params.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) router.push('/blogs/' + params.id)
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

  if (fetching) return (
    <div style={{ minHeight: '100vh', background: '#06080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8896b0' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#06080f', fontFamily: 'var(--font-dm), DM Sans, sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Edit Blog ✏️
        </h1>
        <p style={{ color: '#8896b0', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Update your blog post</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>Content *</label>
              <span style={{ fontSize: '0.75rem', color: '#8896b0' }}>
                {form.content.split(' ').filter(w => w).length} words
              </span>
            </div>
            <textarea rows={16} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', color: '#8896b0', fontWeight: 500 }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {blogTags.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} style={{
                  padding: '0.35rem 0.9rem', borderRadius: 999, fontSize: '0.82rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid ' + (form.tags.includes(tag) ? '#34d399' : '#1f2d45'),
                  background: form.tags.includes(tag) ? 'rgba(52,211,153,0.1)' : 'transparent',
                  color: form.tags.includes(tag) ? '#34d399' : '#8896b0',
                }}>{tag}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => router.push('/blogs/' + params.id)} style={{
              flex: 1, padding: '0.85rem', borderRadius: 10,
              border: '1px solid #1f2d45', background: 'transparent',
              color: '#f0f4ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem'
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 2, padding: '0.85rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg,#4f8ef7,#7c5cfc)',
              color: '#fff', fontSize: '1rem', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'inherit'
            }}>{loading ? 'Saving...' : 'Save Changes ✓'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}